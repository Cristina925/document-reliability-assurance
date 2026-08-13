/**
 * DRA-BMK-023 — Run A, Group 1 (DRA-DOC-0001..0011)
 * See dra-bmk-023-run-helpers.ts for the CPU-time-balanced grouping rationale.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { buildAllDocsFromCache } from "./dra-bmk-023-doc-builder.js";
import { runGroupAndSummarize, writeJson, GROUP_1_IDS, RUN_A_GROUP_PATHS } from "./dra-bmk-023-run-helpers.js";

const FIXED_TS_A = "2026-08-10T20:00:00.000Z";
const FIXED_RUN_ID_A = "bmk-023-run-A";

let successCount = 0, failureCount = 0, recordCount = 0;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const built = await buildAllDocsFromCache();
    const subset = built.allDocs.filter((d) => (GROUP_1_IDS as readonly string[]).includes(d.corpusDocument.corpusId));
    const { successCount: sc, failureCount: fc, records } = runGroupAndSummarize(subset, FIXED_TS_A, FIXED_RUN_ID_A);
    successCount = sc; failureCount = fc; recordCount = records.length;
    await writeJson(RUN_A_GROUP_PATHS.g1, { records });
  } catch (err) {
    setupError = String(err);
  }
}, 280_000);

describe("DRA-BMK-023 — Run A, Group 1 (DRA-DOC-0001..0011)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });
  it(`evaluated all ${GROUP_1_IDS.length} documents with no failures`, () => {
    expect(recordCount).toBe(GROUP_1_IDS.length);
    expect(failureCount).toBe(0);
    expect(successCount).toBe(GROUP_1_IDS.length);
  });
});
