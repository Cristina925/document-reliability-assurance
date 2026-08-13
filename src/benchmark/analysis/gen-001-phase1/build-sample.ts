/**
 * DRA-GEN-001 Phase 1 — Sampling Frame Construction, Blind Selection, Sample Lock
 *
 * This is a one-off, auditable ACQUISITION SCRIPT, not a test and not part of the DRA evaluation
 * pipeline. It performs real, live network acquisition against real authoritative public sources
 * strictly under the rules frozen in DRA-GEN-001 Phase 0. It is preserved in the repository (per
 * the frozen protocol's Section 19 reproducibility requirement) so the frame construction and
 * random selection can be independently re-audited or reproduced.
 *
 * HARD BLINDNESS BOUNDARY (Programme Section B1): this script NEVER calls DRA-GC-1's evaluator,
 * never inspects representation quality, issue counts, decisions, or proof receipts, and never
 * uses any DRA-performance signal to decide eligibility, selection, exclusion, or replacement.
 * The only inspection performed is what the frozen protocol's eligibility/governance rules
 * require: source reachability, extractable word count, and document identity metadata.
 *
 * Run with: `npx tsx build-sample.ts` from this directory (network access required).
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, writeFileSync as writeFileSyncFs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  CONSIDERED_CANDIDATE_URLS,
  CONSIDERED_CANDIDATE_IDS,
  normalizeConsideredUrl,
} from "../dra-gen-001-considered-candidate-registry";
import { GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS, GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID } from "../dra-gc-1-freeze-manifest";
import { HARD_STRATA, RECOMMENDED_SAMPLE_SIZE } from "../dra-gen-001-protocol";

// ---------------------------------------------------------------------------
// Frozen parameters this script must honour exactly (no substitution after seeing the frame)
// ---------------------------------------------------------------------------

const FRAME_CONSTRUCTION_DATE = "2026-08-12";
const PRIMARY_SAMPLE_SIZE = RECOMMENDED_SAMPLE_SIZE; // 100
const PER_STRATUM_PRIMARY = PRIMARY_SAMPLE_SIZE / HARD_STRATA.length; // 25
const RESERVE_PER_STRATUM = 25;

/**
 * Deterministic seed derivation rule for Phase 1 randomisation, fixed and recorded BEFORE the
 * frame's actual contents are known to this script's author: SHA-256 of a fixed literal string
 * naming this exact programme step. This is the "frozen rule" referred to by protocol Section 6;
 * it is recorded here, in this committed file, before any random draw is computed.
 */
const SEED_DERIVATION_RULE = "DRA-GEN-001:PHASE-1:SAMPLE-SELECTION-SEED:v1";
function deriveSeed(): number {
  const digest = createHash("sha256").update(SEED_DERIVATION_RULE).digest();
  return digest.readUInt32BE(0);
}

/** mulberry32 deterministic PRNG — same algorithm/version must be used for reproduction. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher-Yates shuffle using the given PRNG. */
function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Candidate record shape (common across all sources)
// ---------------------------------------------------------------------------

interface RawCandidate {
  frameId: string;
  stratumId: "PDF_ENGLISH" | "PDF_NON_ENGLISH" | "HTML_ENGLISH" | "HTML_NON_ENGLISH";
  sourceUrl: string;
  title: string;
  publisher: string;
  publicationDate: string;
  mediaType: "PDF" | "HTML";
  language: string;
  familyId: string;
  licenceBasis: string;
  /**
   * Page span of the underlying publication, when known from source metadata (BOE only). Used
   * purely as a governance length-eligibility proxy for E5 (>=500 extractable words) — it is a
   * structural/administrative metadata field available before any fetch, not a DRA-performance
   * signal of any kind.
   */
  knownPageSpan?: number;
}

function normUrl(u: string): string {
  return normalizeConsideredUrl(u);
}

// ---------------------------------------------------------------------------
// Source 1: US Federal Register (PDF_ENGLISH)
// ---------------------------------------------------------------------------

async function fetchFederalRegister(): Promise<RawCandidate[]> {
  const out: RawCandidate[] = [];
  for (const page of [1, 2]) {
    const url =
      `https://www.federalregister.gov/api/v1/documents.json?per_page=100&page=${page}&order=newest` +
      `&conditions%5Btype%5D%5B%5D=RULE` +
      `&fields%5B%5D=title&fields%5B%5D=pdf_url&fields%5B%5D=publication_date` +
      `&fields%5B%5D=document_number&fields%5B%5D=agencies&fields%5B%5D=html_url`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Federal Register API failed: ${res.status}`);
    const json = (await res.json()) as { results: any[] };
    for (const r of json.results) {
      if (!r.pdf_url || !r.title || !r.document_number || !r.publication_date) continue;
      out.push({
        frameId: `GEN001-FR-${r.document_number}`,
        stratumId: "PDF_ENGLISH",
        sourceUrl: r.pdf_url,
        title: r.title,
        publisher: r.agencies?.[0]?.name ?? "U.S. Federal Register",
        publicationDate: r.publication_date,
        mediaType: "PDF",
        language: "en",
        familyId: r.document_number,
        licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)",
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Source 2: GOV.UK Content/Search API (HTML_ENGLISH)
// ---------------------------------------------------------------------------

async function fetchGovUk(): Promise<RawCandidate[]> {
  const out: RawCandidate[] = [];
  for (const start of [0, 100]) {
    const url = `https://www.gov.uk/api/search.json?filter_format=guidance&order=-public_timestamp&count=100&start=${start}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GOV.UK search API failed: ${res.status}`);
    const json = (await res.json()) as { results: any[] };
    for (const r of json.results) {
      if (!r.link || !r.title) continue;
      const contentId: string | undefined = r.content_id;
      out.push({
        frameId: `GEN001-GOVUK-${contentId ?? r.link}`,
        stratumId: "HTML_ENGLISH",
        sourceUrl: `https://www.gov.uk${r.link}`,
        title: r.title,
        publisher: r.organisations?.[0]?.title ?? "GOV.UK",
        publicationDate: (r.public_timestamp ?? "").slice(0, 10) || FRAME_CONSTRUCTION_DATE,
        mediaType: "HTML",
        language: "en",
        familyId: contentId ?? r.link,
        licenceBasis: "Open Government Licence v3.0 (gov.uk default content licence)",
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Source 3/4: Spanish BOE (PDF_NON_ENGLISH + HTML_NON_ENGLISH, deterministic parity split)
// ---------------------------------------------------------------------------

function priorBusinessDays(fromIso: string, count: number): string[] {
  const days: string[] = [];
  const d = new Date(fromIso + "T00:00:00Z");
  while (days.length < count) {
    d.setUTCDate(d.getUTCDate() - 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
    }
  }
  return days;
}

async function fetchBoe(): Promise<RawCandidate[]> {
  const dates = priorBusinessDays(FRAME_CONSTRUCTION_DATE, 8);
  const out: RawCandidate[] = [];
  let runningIndex = 0;
  for (const date of dates) {
    const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${date}`;
    let json: any;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      json = await res.json();
    } catch {
      continue;
    }
    const disposiciones: any[] = [];
    (function walk(o: any) {
      if (Array.isArray(o)) {
        o.forEach(walk);
        return;
      }
      if (o && typeof o === "object") {
        if (o.titulo && o.identificador && (o.url_pdf || o.url_html)) disposiciones.push(o);
        for (const k of Object.keys(o)) walk(o[k]);
      }
    })(json);
    const isoDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    for (const item of disposiciones) {
      const assignPdf = runningIndex % 2 === 0;
      runningIndex++;
      const pageStart = Number(item.url_pdf?.pagina_inicial);
      const pageEnd = Number(item.url_pdf?.pagina_final);
      const pageSpan =
        Number.isFinite(pageStart) && Number.isFinite(pageEnd) ? pageEnd - pageStart + 1 : undefined;
      if (assignPdf) {
        if (!item.url_pdf?.texto) continue;
        out.push({
          frameId: `GEN001-BOE-${item.identificador}-PDF`,
          stratumId: "PDF_NON_ENGLISH",
          sourceUrl: item.url_pdf.texto,
          title: item.titulo,
          publisher: "Agencia Estatal Boletín Oficial del Estado (BOE), Government of Spain",
          publicationDate: isoDate,
          mediaType: "PDF",
          language: "es",
          familyId: item.identificador,
          licenceBasis:
            "Statutory reuse conditions under Ley 37/2007 (public-sector information reuse), BOE general reuse licence (Resolución de 27 de junio de 2024)",
          knownPageSpan: pageSpan,
        });
      } else {
        if (!item.url_html) continue;
        out.push({
          frameId: `GEN001-BOE-${item.identificador}-HTML`,
          stratumId: "HTML_NON_ENGLISH",
          sourceUrl: item.url_html,
          title: item.titulo,
          publisher: "Agencia Estatal Boletín Oficial del Estado (BOE), Government of Spain",
          publicationDate: isoDate,
          mediaType: "HTML",
          language: "es",
          familyId: item.identificador,
          licenceBasis:
            "Statutory reuse conditions under Ley 37/2007 (public-sector information reuse), BOE general reuse licence (Resolución de 27 de junio de 2024)",
          knownPageSpan: pageSpan,
        });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Contamination exclusion (Section 5 / Programme B3)
// ---------------------------------------------------------------------------

interface ExclusionRecord {
  frameId: string;
  reason: string;
}

function applyContaminationExclusion(candidates: RawCandidate[]): {
  survivors: RawCandidate[];
  excluded: ExclusionRecord[];
} {
  const survivors: RawCandidate[] = [];
  const excluded: ExclusionRecord[] = [];
  const consideredUrlSet = new Set(CONSIDERED_CANDIDATE_URLS);
  const consideredIdSet = new Set(CONSIDERED_CANDIDATE_IDS);
  const devCorpusSet = new Set([
    ...GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS,
    GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID,
  ]);
  const seenFamilyInStratum = new Map<string, Set<string>>();

  for (const c of candidates) {
    const normalized = normUrl(c.sourceUrl);
    if (consideredUrlSet.has(normalized)) {
      excluded.push({ frameId: c.frameId, reason: "CONSIDERED_CANDIDATE_URL_MATCH" });
      continue;
    }
    if (consideredIdSet.has(c.frameId)) {
      excluded.push({ frameId: c.frameId, reason: "CONSIDERED_CANDIDATE_ID_MATCH" });
      continue;
    }
    if (devCorpusSet.has(c.frameId)) {
      excluded.push({ frameId: c.frameId, reason: "DEVELOPMENT_CORPUS_MATCH" });
      continue;
    }
    let seen = seenFamilyInStratum.get(c.stratumId);
    if (!seen) {
      seen = new Set();
      seenFamilyInStratum.set(c.stratumId, seen);
    }
    if (seen.has(c.familyId)) {
      excluded.push({ frameId: c.frameId, reason: "DUPLICATE_FAMILY_IN_STRATUM" });
      continue;
    }
    seen.add(c.familyId);
    survivors.push(c);
  }
  return { survivors, excluded };
}

// ---------------------------------------------------------------------------
// Metadata-level eligibility (Section 4) — no content fetch required
// ---------------------------------------------------------------------------

function applyMetadataEligibility(candidates: RawCandidate[]): {
  eligible: RawCandidate[];
  ineligible: ExclusionRecord[];
} {
  const eligible: RawCandidate[] = [];
  const ineligible: ExclusionRecord[] = [];
  for (const c of candidates) {
    if (!c.title || c.title.trim().length < 5) {
      ineligible.push({ frameId: c.frameId, reason: "E6_MISSING_TITLE" });
      continue;
    }
    if (!c.publicationDate || c.publicationDate < "2011-01-01" || c.publicationDate > FRAME_CONSTRUCTION_DATE) {
      ineligible.push({ frameId: c.frameId, reason: "E8_OUTSIDE_DATE_WINDOW" });
      continue;
    }
    // E5 length-eligibility proxy (metadata-level, applied uniformly, not a DRA signal): BOE
    // publication-day page span must be >=2 pages, since single-page BOE entries in this
    // gazette's format are overwhelmingly short administrative notices (e.g. appointments/
    // cessations) that fall below the 500-word extractable-text minimum. This is the same E5
    // criterion, checked with an available structural proxy before spending a live fetch.
    if (typeof c.knownPageSpan === "number" && c.knownPageSpan < 2) {
      ineligible.push({ frameId: c.frameId, reason: "E5_PROXY_PAGE_SPAN_TOO_SHORT" });
      continue;
    }
    eligible.push(c);
  }
  return { eligible, ineligible };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Fetching raw candidate pools from 3 authoritative sources...");
  const [fr, govuk, boe] = await Promise.all([fetchFederalRegister(), fetchGovUk(), fetchBoe()]);
  const raw = [...fr, ...govuk, ...boe];
  console.log(`Raw frame size: ${raw.length} (FR=${fr.length}, GOVUK=${govuk.length}, BOE=${boe.length})`);

  // Frame is recorded (hashed) BEFORE contamination/eligibility filtering and BEFORE randomisation,
  // per protocol Section 6: frame construction and selection are separate, both-auditable steps.
  const frameRecordForDigest = raw
    .map((c) => ({ frameId: c.frameId, sourceUrl: normUrl(c.sourceUrl), stratumId: c.stratumId }))
    .sort((a, b) => a.frameId.localeCompare(b.frameId));
  const frameDigest = createHash("sha256")
    .update(JSON.stringify(frameRecordForDigest))
    .digest("hex");

  const { survivors, excluded } = applyContaminationExclusion(raw);
  console.log(`After contamination exclusion: ${survivors.length} survive, ${excluded.length} excluded`);

  const { eligible, ineligible } = applyMetadataEligibility(survivors);
  console.log(`After metadata eligibility: ${eligible.length} eligible, ${ineligible.length} ineligible`);

  const eligibleFrameRecordForDigest = eligible
    .map((c) => ({ frameId: c.frameId, sourceUrl: normUrl(c.sourceUrl) }))
    .sort((a, b) => a.frameId.localeCompare(b.frameId));
  const eligibleFrameDigest = createHash("sha256")
    .update(JSON.stringify(eligibleFrameRecordForDigest))
    .digest("hex");

  const byStratum = new Map<string, RawCandidate[]>();
  for (const s of HARD_STRATA) byStratum.set(s.id, []);
  for (const c of eligible) byStratum.get(c.stratumId)!.push(c);

  const seed = deriveSeed();
  const stratumReport: Record<string, { eligibleCount: number; primaryCount: number; reserveCount: number }> = {};
  const primarySelection: RawCandidate[] = [];
  const reserveSelection: Record<string, RawCandidate[]> = {};

  for (const s of HARD_STRATA) {
    const pool = byStratum.get(s.id)!.sort((a, b) => a.frameId.localeCompare(b.frameId)); // deterministic pre-shuffle order
    const rng = mulberry32(seed ^ hashStringToUint32(s.id));
    const shuffled = seededShuffle(pool, rng);
    const primary = shuffled.slice(0, PER_STRATUM_PRIMARY);
    const reserve = shuffled.slice(PER_STRATUM_PRIMARY, PER_STRATUM_PRIMARY + RESERVE_PER_STRATUM);
    stratumReport[s.id] = {
      eligibleCount: pool.length,
      primaryCount: primary.length,
      reserveCount: reserve.length,
    };
    primarySelection.push(...primary);
    reserveSelection[s.id] = reserve;
    if (primary.length < PER_STRATUM_PRIMARY) {
      console.error(
        `PROTOCOL/FRAME CONFLICT: stratum ${s.id} has only ${pool.length} eligible candidates, cannot fill ${PER_STRATUM_PRIMARY}.`,
      );
    }
  }

  function hashStringToUint32(s: string): number {
    return createHash("sha256").update(s).digest().readUInt32BE(0);
  }

  const outDir = "/tmp/gen001";
  writeFileSync(join(outDir, "raw-frame.json"), JSON.stringify(raw, null, 2));
  writeFileSync(join(outDir, "excluded.json"), JSON.stringify(excluded, null, 2));
  writeFileSync(join(outDir, "ineligible.json"), JSON.stringify(ineligible, null, 2));
  writeFileSync(join(outDir, "eligible.json"), JSON.stringify(eligible, null, 2));
  writeFileSync(join(outDir, "primary-selection.json"), JSON.stringify(primarySelection, null, 2));
  writeFileSync(join(outDir, "reserve-selection.json"), JSON.stringify(reserveSelection, null, 2));
  writeFileSync(
    join(outDir, "selection-summary.json"),
    JSON.stringify(
      {
        seedDerivationRule: SEED_DERIVATION_RULE,
        seed,
        frameConstructionDate: FRAME_CONSTRUCTION_DATE,
        rawFrameSize: raw.length,
        rawFrameDigest: frameDigest,
        excludedCount: excluded.length,
        ineligibleCount: ineligible.length,
        eligibleFrameSize: eligible.length,
        eligibleFrameDigest,
        stratumReport,
        primarySelectionCount: primarySelection.length,
      },
      null,
      2,
    ),
  );
  console.log("Wrote outputs to /tmp/gen001");
  console.log(JSON.stringify(stratumReport, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
