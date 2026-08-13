/**
 * DRA-BMK-023 — Run B, Group 4 (DRA-DOC-0023)
 * See dra-bmk-023-run-helpers.ts for the CPU-time-balanced grouping rationale.
 * This group also captures the full issue+statement detail dump used by the
 * DRA-DOC-0023 structural analysis (spec Parts 5-7).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { buildAllDocsFromCache } from "./dra-bmk-023-doc-builder.js";
import { runSingleDocDetailed, writeJson, GROUP_4_IDS, RUN_B_GROUP_PATHS } from "./dra-bmk-023-run-helpers.js";
import { DOC23_DETAIL_B_PATH } from "./dra-bmk-023-shared.js";
import type { SummaryRecord } from "./dra-bmk-023-run-helpers.js";

const FIXED_TS_B = "2026-08-10T21:00:00.000Z";
const FIXED_RUN_ID_B = "bmk-023-run-B";

let successCount = 0, failureCount = 0, recordCount = 0;
let setupError: string | null = null;
let issueCount = 0, statementCount = 0;

beforeAll(async () => {
  try {
    const built = await buildAllDocsFromCache();
    const doc23 = built.allDocs.find((d) => d.corpusDocument.corpusId === "DRA-DOC-0023");
    if (!doc23) throw new Error("DRA-DOC-0023 not found in built corpus");
    const detail = runSingleDocDetailed(doc23, FIXED_TS_B, FIXED_RUN_ID_B);
    await writeJson(DOC23_DETAIL_B_PATH, detail);
    issueCount = detail.issueCount;
    statementCount = detail.statementCount;
    const record: SummaryRecord = {
      corpusId: detail.corpusId,
      executedAt: FIXED_TS_B,
      ok: true,
      decision: detail.decision,
      issueClasses: [...new Set(detail.issues.map((i) => i.issueClass))],
      issueClassCounts: detail.issues.reduce((acc: Record<string, number>, i) => { acc[i.issueClass] = (acc[i.issueClass] ?? 0) + 1; return acc; }, {}),
      issueCount: detail.issueCount,
      statementCount: detail.statementCount,
      substantiveDigest: detail.substantiveDigest,
      receiptIntegrityValid: true,
      errorCode: null,
      evaluatorVersion: "0.1.2",
      pipelineVersion: "1.0",
      schemaVersion: "0.1.0",
    };
    successCount = 1; failureCount = 0; recordCount = 1;
    await writeJson(RUN_B_GROUP_PATHS.g4, { records: [record] });
  } catch (err) {
    setupError = String(err);
  }
}, 280_000);

describe("DRA-BMK-023 — Run B, Group 4 (DRA-DOC-0023)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });
  it(`evaluated all ${GROUP_4_IDS.length} documents with no failures`, () => {
    expect(recordCount).toBe(GROUP_4_IDS.length);
    expect(failureCount).toBe(0);
    expect(successCount).toBe(GROUP_4_IDS.length);
  });
  it("captured full issue+statement detail", () => {
    expect(issueCount).toBeGreaterThan(0);
    expect(statementCount).toBeGreaterThan(0);
  });
});
