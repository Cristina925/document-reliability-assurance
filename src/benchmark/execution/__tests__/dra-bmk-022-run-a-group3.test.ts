/**
 * DRA-BMK-022 — Run A, Group 3 (DRA-DOC-0020..0022)
 * See dra-bmk-022-run-helpers.ts for why the full 22-document run is split
 * into CPU-time-balanced groups across separate vitest invocations. This
 * group is the largest by CPU time (dominated by DRA-DOC-0020, ~437K chars).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { buildAllDocsFromCache } from "./dra-bmk-022-doc-builder.js";
import { runGroupAndSummarize, writeJson, GROUP_3_IDS, RUN_A_GROUP_PATHS } from "./dra-bmk-022-run-helpers.js";

const FIXED_TS_A = "2026-08-10T18:00:00.000Z";
const FIXED_RUN_ID_A = "bmk-022-run-A";

let successCount = 0, failureCount = 0, recordCount = 0;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const built = await buildAllDocsFromCache();
    const subset = built.allDocs.filter((d) => (GROUP_3_IDS as readonly string[]).includes(d.corpusDocument.corpusId));
    const { successCount: sc, failureCount: fc, records } = runGroupAndSummarize(subset, FIXED_TS_A, FIXED_RUN_ID_A);
    successCount = sc; failureCount = fc; recordCount = records.length;
    await writeJson(RUN_A_GROUP_PATHS.g3, { records });
  } catch (err) {
    setupError = String(err);
  }
}, 280_000);

describe("DRA-BMK-022 — Run A, Group 3 (DRA-DOC-0020..0022)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });
  it(`evaluated all ${GROUP_3_IDS.length} documents with no failures`, () => {
    expect(recordCount).toBe(GROUP_3_IDS.length);
    expect(failureCount).toBe(0);
    expect(successCount).toBe(GROUP_3_IDS.length);
  });
});
