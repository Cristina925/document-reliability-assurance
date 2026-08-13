/**
 * DRA-GEN-001 Phase 2 — Step 1: fetch and verify locked source bytes.
 *
 * For every one of the 100 locked units, fetches the LIVE bytes at the
 * frozen sourceUrl and verifies the SHA-256 against the Phase-1-locked
 * `sha256` field. This is required because Phase 1 (freeze-selection.ts)
 * never persisted raw bytes to disk — only the digest, byte length, and
 * word count were retained. Per the task's own item 3 ("Locked source
 * bytes only"), each source digest must be verified against its Phase 1
 * lock value BEFORE evaluation; a mismatch is an integrity condition to be
 * reported, never silently repaired or replaced (replacement is a Phase 1
 * concept and does not apply here — the sample is locked).
 *
 * Bytes that verify are cached once to /tmp/dra-gen001-phase2/raw/<frameId>.bin
 * and reused for BOTH Run A and Run B, so the determinism check measures
 * pipeline non-determinism, not source drift between two live fetches.
 *
 * Run: npx tsx src/benchmark/analysis/gen-001-phase2/scripts/fetch-and-cache.ts
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runAllPreconditionChecks } from "../preconditions";
import { FROZEN_UNITS } from "../../gen-001-phase1/dra-gen-001-sample-manifest";

const OUT_DIR = "/tmp/dra-gen001-phase2";
const RAW_DIR = join(OUT_DIR, "raw");
const CONCURRENCY = 8;

interface FetchVerificationRecord {
  frameId: string;
  stratumId: string;
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

async function fetchOne(unit: (typeof FROZEN_UNITS)[number]): Promise<FetchVerificationRecord> {
  const start = Date.now();
  try {
    const res = await fetch(unit.sourceUrl, {
      headers: { "User-Agent": "DRA-GEN-001-phase2-blind-execution/1.0" },
    });
    const durationMs = Date.now() - start;
    if (!res.ok) {
      return {
        frameId: unit.frameId,
        stratumId: unit.stratumId,
        sourceUrl: unit.sourceUrl,
        mediaType: unit.mediaType,
        lockedSha256: unit.sha256,
        fetchOk: false,
        httpStatus: res.status,
        liveByteLength: null,
        liveSha256: null,
        digestMatch: false,
        error: `HTTP_${res.status}`,
        fetchDurationMs: durationMs,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const liveSha256 = createHash("sha256").update(buf).digest("hex");
    const digestMatch = liveSha256 === unit.sha256;
    if (digestMatch) {
      await writeFile(join(RAW_DIR, `${unit.frameId}.bin`), buf);
    }
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      sourceUrl: unit.sourceUrl,
      mediaType: unit.mediaType,
      lockedSha256: unit.sha256,
      fetchOk: true,
      httpStatus: res.status,
      liveByteLength: buf.length,
      liveSha256,
      digestMatch,
      error: null,
      fetchDurationMs: durationMs,
    };
  } catch (e) {
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      sourceUrl: unit.sourceUrl,
      mediaType: unit.mediaType,
      lockedSha256: unit.sha256,
      fetchOk: false,
      httpStatus: null,
      liveByteLength: null,
      liveSha256: null,
      digestMatch: false,
      error: `FETCH_ERROR:${String(e)}`,
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

  const units = [...FROZEN_UNITS];
  const results: FetchVerificationRecord[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < units.length) {
      const idx = cursor++;
      const unit = units[idx]!;
      const rec = await fetchOne(unit);
      results.push(rec);
      console.log(
        `[${results.length}/${units.length}] ${unit.frameId} digestMatch=${rec.digestMatch} status=${rec.httpStatus} err=${rec.error ?? "-"}`,
      );
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  results.sort((a, b) => a.frameId.localeCompare(b.frameId));
  await writeFile(join(OUT_DIR, "fetch-verification.json"), JSON.stringify(results, null, 2));

  const matched = results.filter((r) => r.digestMatch).length;
  const mismatched = results.filter((r) => r.fetchOk && !r.digestMatch).length;
  const fetchFailed = results.filter((r) => !r.fetchOk).length;
  console.log(`\nTotal=${results.length} digestMatch=${matched} digestMismatch=${mismatched} fetchFailed=${fetchFailed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
