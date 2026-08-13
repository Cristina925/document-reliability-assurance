/**
 * DRA-VAL-002 Phase 2 — Step 1: verify and stage the locked source bytes for evaluation.
 *
 * UNLIKE DRA-GEN-001's Phase 2 (which discarded raw bytes at freeze time and required a LIVE
 * re-fetch to match the Phase-1 digest before evaluation — the exact mechanism that silently
 * destroyed GEN-001's HTML_ENGLISH stratum when live pages changed between freeze and execution),
 * DRA-VAL-002 persisted the actual frozen bytes to disk at acquisition time
 * (val-002-phase1/data/raw/<frameId>.bin — see build-and-freeze.ts). Per protocol Section 4
 * (frozen bytes are the evaluation input; live drift is observational only, never a gate), this
 * script verifies each persisted file's digest against the Phase-1-locked `sha256` and stages it
 * for Run A/B. It performs NO network access — that would reintroduce the GEN-001 failure mode.
 *
 * Live-drift comparison (original vs. currently-live bytes) is a SEPARATE, strictly post-hoc,
 * non-gating step — see `observe-live-drift.ts`, run only after Run A/B complete.
 *
 * Run: npx tsx src/benchmark/analysis/val-002-phase2/scripts/fetch-and-cache.ts
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runAllPreconditionChecks } from "../preconditions";
import { FROZEN_UNITS } from "../../val-002-phase1/dra-val-002-sample-manifest";

const OUT_DIR = "/tmp/dra-val002-phase2";
const RAW_DIR = join(OUT_DIR, "raw");
const FROZEN_RAW_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "val-002-phase1", "data", "raw");

interface FetchVerificationRecord {
  frameId: string;
  familyId: string;
  sourceUrl: string;
  mediaType: string;
  lockedSha256: string;
  fetchOk: boolean;
  httpStatus: number | null;
  liveByteLength: number | null;
  liveSha256: string | null;
  digestMatch: boolean;
  error: string | null;
  fetchDurationMs: number;
}

async function stageOne(unit: (typeof FROZEN_UNITS)[number]): Promise<FetchVerificationRecord> {
  const start = Date.now();
  try {
    const buf = await readFile(join(FROZEN_RAW_DIR, `${unit.frameId}.bin`));
    const liveSha256 = createHash("sha256").update(buf).digest("hex");
    const digestMatch = liveSha256 === unit.sha256;
    if (digestMatch) {
      await writeFile(join(RAW_DIR, `${unit.frameId}.bin`), buf);
    }
    return {
      frameId: unit.frameId,
      familyId: unit.familyId,
      sourceUrl: unit.sourceUrl,
      mediaType: unit.mediaType,
      lockedSha256: unit.sha256,
      fetchOk: true,
      httpStatus: null,
      liveByteLength: buf.length,
      liveSha256,
      digestMatch,
      error: digestMatch ? null : "FROZEN_FILE_DIGEST_MISMATCH",
      fetchDurationMs: Date.now() - start,
    };
  } catch (e) {
    return {
      frameId: unit.frameId,
      familyId: unit.familyId,
      sourceUrl: unit.sourceUrl,
      mediaType: unit.mediaType,
      lockedSha256: unit.sha256,
      fetchOk: false,
      httpStatus: null,
      liveByteLength: null,
      liveSha256: null,
      digestMatch: false,
      error: `MISSING_FROZEN_FILE:${String(e)}`,
      fetchDurationMs: Date.now() - start,
    };
  }
}

async function main() {
  const preconditions = runAllPreconditionChecks();
  if (!preconditions.allPassed) {
    console.error("PRECONDITION FAILURE — STOPPING. Failed checks:", preconditions.failedChecks);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(join(OUT_DIR, "preconditions-STOP.json"), JSON.stringify(preconditions, null, 2));
    process.exit(1);
  }

  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, "preconditions-PASS.json"), JSON.stringify(preconditions, null, 2));

  const results: FetchVerificationRecord[] = [];
  for (const unit of FROZEN_UNITS) {
    const rec = await stageOne(unit);
    results.push(rec);
    console.log(`[${results.length}/${FROZEN_UNITS.length}] ${unit.frameId} digestMatch=${rec.digestMatch} err=${rec.error ?? "-"}`);
  }

  results.sort((a, b) => a.frameId.localeCompare(b.frameId));
  await writeFile(join(OUT_DIR, "fetch-verification.json"), JSON.stringify(results, null, 2));

  const matched = results.filter((r) => r.digestMatch).length;
  const mismatched = results.filter((r) => r.fetchOk && !r.digestMatch).length;
  const fetchFailed = results.filter((r) => !r.fetchOk).length;
  console.log(`\nTotal=${results.length} digestMatch=${matched} digestMismatch=${mismatched} missingFile=${fetchFailed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
