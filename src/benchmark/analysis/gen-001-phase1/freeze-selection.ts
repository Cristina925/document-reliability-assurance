/**
 * DRA-GEN-001 Phase 1 — Source Freezing and Replacement Resolution
 *
 * Second stage of the Phase 1 acquisition script. Reads /tmp/gen001/primary-selection.json and
 * /tmp/gen001/reserve-selection.json (produced by build-sample.ts) and, for every primary unit:
 *   1. fetches the actual bytes (no evaluator call — this is acquisition, not evaluation);
 *   2. computes SHA-256 of the raw bytes and byte length;
 *   3. extracts plain text (pdftotext for PDF, tag-strip for HTML) and counts words;
 *   4. applies the E5 (>=500 extractable words) and E4 (fetched successfully) governance checks.
 *
 * If a primary unit fails a governance check, it is REPLACED by the next unused reserve in that
 * stratum's frozen reserve order (protocol Section 11) — the original draw record is preserved,
 * never deleted, and the replacement reason is logged. Reserves are never substituted for any
 * DRA-performance reason because no DRA-performance signal exists yet: no evaluator call is made
 * anywhere in this script.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface RawCandidate {
  frameId: string;
  stratumId: string;
  sourceUrl: string;
  title: string;
  publisher: string;
  publicationDate: string;
  mediaType: "PDF" | "HTML";
  language: string;
  familyId: string;
  licenceBasis: string;
}

interface FrozenUnit {
  frameId: string;
  stratumId: string;
  sourceUrl: string;
  title: string;
  publisher: string;
  publicationDate: string;
  mediaType: "PDF" | "HTML";
  language: string;
  familyId: string;
  licenceBasis: string;
  byteLength: number;
  sha256: string;
  extractedWordCount: number;
  fetchedAt: string;
  wasReplacement: boolean;
  replacesFrameId: string | null;
}

interface ReplacementLogEntry {
  originalFrameId: string;
  stratumId: string;
  reason: string;
  replacedByFrameId: string | null;
}

const OUT_DIR = "/tmp/gen001";
const FIXED_ACQUISITION_TIME = "2026-08-12T00:00:00.000Z";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&aacute;|&eacute;|&iacute;|&oacute;|&uacute;|&ntilde;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

async function fetchAndExtract(
  c: RawCandidate,
  scratchDir: string,
): Promise<{ bytes: Buffer; wordCount: number } | { error: string }> {
  let res: Response;
  try {
    res = await fetch(c.sourceUrl, { headers: { "User-Agent": "DRA-GEN-001-acquisition/1.0" } });
  } catch (e) {
    return { error: `FETCH_ERROR:${String(e)}` };
  }
  if (!res.ok) return { error: `HTTP_${res.status}` };
  const arrayBuf = await res.arrayBuffer();
  const bytes = Buffer.from(arrayBuf);
  if (bytes.length === 0) return { error: "EMPTY_BODY" };

  if (c.mediaType === "PDF") {
    const pdfPath = join(scratchDir, `${c.frameId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`);
    writeFileSync(pdfPath, bytes);
    let text = "";
    try {
      text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
        maxBuffer: 50 * 1024 * 1024,
        timeout: 30000,
      }).toString("utf8");
    } catch (e) {
      return { error: `PDFTOTEXT_ERROR:${String(e)}` };
    }
    return { bytes, wordCount: countWords(text) };
  } else {
    const text = stripHtml(bytes.toString("utf8"));
    return { bytes, wordCount: countWords(text) };
  }
}

async function main() {
  const primary: RawCandidate[] = JSON.parse(readFileSync(join(OUT_DIR, "primary-selection.json"), "utf8"));
  const reserves: Record<string, RawCandidate[]> = JSON.parse(
    readFileSync(join(OUT_DIR, "reserve-selection.json"), "utf8"),
  );
  const reserveCursors: Record<string, number> = {};
  for (const k of Object.keys(reserves)) reserveCursors[k] = 0;

  const scratchDir = mkdtempSync(join(tmpdir(), "gen001-freeze-"));
  const frozen: FrozenUnit[] = [];
  const replacementLog: ReplacementLogEntry[] = [];
  const usedFamilyIds = new Set<string>(); // guards against a reserve reintroducing a duplicate family

  async function tryFreeze(c: RawCandidate, wasReplacement: boolean, replacesFrameId: string | null): Promise<boolean> {
    if (usedFamilyIds.has(c.familyId)) {
      replacementLog.push({
        originalFrameId: c.frameId,
        stratumId: c.stratumId,
        reason: "RESERVE_DUPLICATE_FAMILY_SKIPPED",
        replacedByFrameId: null,
      });
      return false;
    }
    const result = await fetchAndExtract(c, scratchDir);
    if ("error" in result) {
      replacementLog.push({
        originalFrameId: c.frameId,
        stratumId: c.stratumId,
        reason: `GOVERNANCE_INELIGIBLE:${result.error}`,
        replacedByFrameId: null,
      });
      return false;
    }
    if (result.wordCount < 500) {
      replacementLog.push({
        originalFrameId: c.frameId,
        stratumId: c.stratumId,
        reason: `GOVERNANCE_INELIGIBLE:E5_WORD_COUNT_${result.wordCount}`,
        replacedByFrameId: null,
      });
      return false;
    }
    frozen.push({
      frameId: c.frameId,
      stratumId: c.stratumId,
      sourceUrl: c.sourceUrl,
      title: c.title,
      publisher: c.publisher,
      publicationDate: c.publicationDate,
      mediaType: c.mediaType,
      language: c.language,
      familyId: c.familyId,
      licenceBasis: c.licenceBasis,
      byteLength: result.bytes.length,
      sha256: createHash("sha256").update(result.bytes).digest("hex"),
      extractedWordCount: result.wordCount,
      fetchedAt: FIXED_ACQUISITION_TIME,
      wasReplacement,
      replacesFrameId,
    });
    usedFamilyIds.add(c.familyId);
    return true;
  }

  for (const c of primary) {
    console.log(`Freezing ${c.frameId} ...`);
    const ok = await tryFreeze(c, false, null);
    if (!ok) {
      // Walk the reserve list for this stratum, in frozen order, until one succeeds.
      let replaced = false;
      const stratumReserves = reserves[c.stratumId] ?? [];
      while (reserveCursors[c.stratumId]! < stratumReserves.length) {
        const candidate = stratumReserves[reserveCursors[c.stratumId]!]!;
        reserveCursors[c.stratumId]!++;
        console.log(`  -> replacement attempt: ${candidate.frameId}`);
        const replacedOk = await tryFreeze(candidate, true, c.frameId);
        if (replacedOk) {
          replacementLog.push({
            originalFrameId: c.frameId,
            stratumId: c.stratumId,
            reason: "REPLACED_FROM_RESERVE",
            replacedByFrameId: candidate.frameId,
          });
          replaced = true;
          break;
        }
      }
      if (!replaced) {
        console.error(`UNRESOLVED: ${c.frameId} could not be replaced — reserve exhausted in ${c.stratumId}`);
      }
    }
  }

  writeFileSync(join(OUT_DIR, "frozen-units.json"), JSON.stringify(frozen, null, 2));
  writeFileSync(join(OUT_DIR, "replacement-log.json"), JSON.stringify(replacementLog, null, 2));

  const stratumCounts: Record<string, number> = {};
  for (const u of frozen) stratumCounts[u.stratumId] = (stratumCounts[u.stratumId] ?? 0) + 1;
  console.log("Frozen unit counts by stratum:", stratumCounts);
  console.log(`Total frozen: ${frozen.length}`);
  console.log(`Replacements used: ${replacementLog.filter((r) => r.reason === "REPLACED_FROM_RESERVE").length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
