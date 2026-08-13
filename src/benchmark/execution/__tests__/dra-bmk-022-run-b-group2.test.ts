/**
 * DRA-BMK-022 — Run B, Group 2 (DRA-DOC-0012..0019)
 * See dra-bmk-022-run-helpers.ts for why the full 22-document run is split
 * into CPU-time-balanced groups across separate vitest invocations.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { buildAllDocsFromCache } from "./dra-bmk-022-doc-builder.js";
import { runGroupAndSummarize, writeJson, GROUP_2_IDS, RUN_B_GROUP_PATHS } from "./dra-bmk-022-run-helpers.js";

const FIXED_TS_B = "2026-08-10T18:30:00.000Z";
const FIXED_RUN_ID_B = "bmk-022-run-B";

let successCount = 0, failureCount = 0, recordCount = 0;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const built = await buildAllDocsFromCache();
    const subset = built.allDocs.filter((d) => (GROUP_2_IDS as readonly string[]).includes(d.corpusDocument.corpusId));
    const { successCount: sc, failureCount: fc, records } = runGroupAndSummarize(subset, FIXED_TS_B, FIXED_RUN_ID_B);
    successCount = sc; failureCount = fc; recordCount = records.length;
    await writeJson(RUN_B_GROUP_PATHS.g2, { records });
  } catch (err) {
    setupError = String(err);
  }
}, 280_000);

describe("DRA-BMK-022 — Run B, Group 2 (DRA-DOC-0012..0019)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });
  it(`evaluated all ${GROUP_2_IDS.length} documents with no failures`, () => {
    expect(recordCount).toBe(GROUP_2_IDS.length);
    expect(failureCount).toBe(0);
    expect(successCount).toBe(GROUP_2_IDS.length);
  });
});
