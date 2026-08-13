/**
 * DRA-VAL-002 Phase 2 — Optional Step 4: post-hoc live-drift observation.
 *
 * Strictly DESCRIPTIVE and NON-GATING (per protocol Section 16 / the "must not" boundary list):
 * this script re-fetches each unit's live sourceUrl now, AFTER Run A/B are already complete and
 * their results already written, and reports byte-for-byte drift counts only. It never feeds
 * back into evaluation, never substitutes into aggregate-statistics.json, and never changes any
 * verdict. Run only after run-execution.ts and analyze-results.ts have both completed.
 *
 * Run: npx tsx src/benchmark/analysis/val-002-phase2/scripts/observe-live-drift.ts
 */
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FROZEN_UNITS } from "../../val-002-phase1/dra-val-002-sample-manifest";

const OUT_DIR = "/tmp/dra-val002-phase2";

interface DriftRecord {
  frameId: string;
  familyId: string;
  frozenSha256: string;
  liveFetchOk: boolean;
  httpStatus: number | null;
  liveSha256: string | null;
  identicalToFrozen: boolean | null;
  error: string | null;
}

async function observeOne(unit: (typeof FROZEN_UNITS)[number]): Promise<DriftRecord> {
  try {
    const res = await fetch(unit.sourceUrl, { headers: { "User-Agent": "Mozilla/5.0 (DRA-VAL-002-live-drift-observation/1.0)" } });
    if (!res.ok) {
      return {
        frameId: unit.frameId,
        familyId: unit.familyId,
        frozenSha256: unit.sha256,
        liveFetchOk: false,
        httpStatus: res.status,
        liveSha256: null,
        identicalToFrozen: null,
        error: `HTTP_${res.status}`,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const liveSha256 = createHash("sha256").update(buf).digest("hex");
    return {
      frameId: unit.frameId,
      familyId: unit.familyId,
      frozenSha256: unit.sha256,
      liveFetchOk: true,
      httpStatus: res.status,
      liveSha256,
      identicalToFrozen: liveSha256 === unit.sha256,
      error: null,
    };
  } catch (e) {
    return {
      frameId: unit.frameId,
      familyId: unit.familyId,
      frozenSha256: unit.sha256,
      liveFetchOk: false,
      httpStatus: null,
      liveSha256: null,
      identicalToFrozen: null,
      error: `FETCH_ERROR:${String(e)}`,
    };
  }
}

async function main() {
  const results: DriftRecord[] = [];
  for (const unit of FROZEN_UNITS) {
    const rec = await observeOne(unit);
    results.push(rec);
    console.log(`${unit.frameId} identicalToFrozen=${rec.identicalToFrozen} status=${rec.httpStatus} err=${rec.error ?? "-"}`);
  }
  await writeFile(join(OUT_DIR, "live-drift-observation.json"), JSON.stringify(results, null, 2));
  const identical = results.filter((r) => r.identicalToFrozen === true).length;
  const drifted = results.filter((r) => r.identicalToFrozen === false).length;
  const unreachable = results.filter((r) => r.identicalToFrozen === null).length;
  console.log(`\nIdentical=${identical} Drifted=${drifted} Unreachable=${unreachable} (of ${results.length})`);
  console.log("This observation is descriptive only and does not alter any Run A/B result or verdict.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
