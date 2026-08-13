/**
 * DRA-BMK-022 — Run B + Cross-Run Assertions (companion to
 * dra-bmk-022-evaluator-run.test.ts, which performs Run A)
 *
 * Engineering note: this file reconstructs all 22 documents from the shared
 * dra-bmk-022-doc-builder.ts text cache (see that file's header comment for
 * why the fetch/pdftotext dance is not performed inline inside vitest) and
 * executes ONLY Run B. It loads the Run A summary persisted by
 * dra-bmk-022-evaluator-run.test.ts to perform every cross-run assertion
 * (decision/digest/issue-count identity, the 44-total-receipts cross-check,
 * timestamp-difference check). Run dra-bmk-022-evaluator-run.test.ts BEFORE
 * this file.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "fs/promises";

import { RUN_A_SUMMARY_PATH } from "./dra-bmk-022-shared.js";
import { mergeGroups, RUN_B_GROUP_PATHS, type SummaryRecord } from "./dra-bmk-022-run-helpers.js";

const FIXED_TS_A     = "2026-08-10T18:00:00.000Z";
const FIXED_TS_B     = "2026-08-10T18:30:00.000Z";

interface RunASummary {
  fixedTimestamp: string;
  fixedRunId: string;
  documentCount: number;
  successCount: number;
  failureCount: number;
  records: SummaryRecord[];
  matches: { eeaFreezeRepresentationMatch: boolean };
  eeaTextLength: number;
}

let recordsB: SummaryRecord[] = [];
let successCountB = 0;
let failureCountB = 0;
let runASummary: RunASummary;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    // Fast — the actual 22-document evaluation for Run B was performed by
    // the three dra-bmk-022-run-b-group{1,2,3}.test.ts files (see
    // dra-bmk-022-run-helpers.ts for why). This only merges their output.
    recordsB = await mergeGroups(RUN_B_GROUP_PATHS);
    successCountB = recordsB.filter((r) => r.ok).length;
    failureCountB = recordsB.filter((r) => !r.ok).length;
    console.log(`   Run B (merged from 3 groups): ${successCountB} success, ${failureCountB} failure / ${recordsB.length} docs`);

    const raw = await readFile(RUN_A_SUMMARY_PATH, "utf-8").catch(() => null);
    if (raw === null) {
      setupError = `Run A summary not found at ${RUN_A_SUMMARY_PATH}. Run dra-bmk-022-evaluator-run.test.ts before this file.`;
      return;
    }
    runASummary = JSON.parse(raw) as RunASummary;
  } catch (err) {
    setupError = String(err);
  }
}, 60_000);

describe("DRA-BMK-022 — Part 5: Frozen Evaluator Run (Run B)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("Run B produced 22 results", () => {
    expect(recordsB).toHaveLength(22);
  });

  it("no unhandled evaluation failures in Run B", () => {
    for (const record of recordsB) {
      const status = record.ok ? `decision=${record.decision}` : `FAILED: ${record.errorCode}`;
      console.log(`  ${record.corpusId}: ${status}`);
    }
    expect(failureCountB).toBe(0);
    expect(successCountB).toBe(22);
  });

  it("44 proof receipts expected (22 documents × 2 runs)", () => {
    console.log(`\n── Proof Receipt Count ───────────────────────────────────────`);
    console.log(`  Run A successful evaluations: ${runASummary.successCount}/22`);
    console.log(`  Run B successful evaluations: ${successCountB}/22`);
    console.log(`  Total proof receipts produced: ${runASummary.successCount + successCountB}`);
    expect(runASummary.successCount + successCountB).toBe(44);
  });
});

describe("DRA-BMK-022 — Part 6: Cross-Run Integrity Checks (44/44 receipts)", () => {
  it("all Run B proof receipts pass structural integrity check", () => {
    const bVerified = recordsB.filter((r) => r.receiptIntegrityValid === true).length;
    const bTotal    = recordsB.filter((r) => r.ok).length;
    console.log(`  Run B: ${bVerified}/${bTotal} proof receipts passed integrity check`);
    expect(bVerified).toBe(bTotal);
    expect(bTotal).toBe(22);

    const aVerified = runASummary.records.filter((r) => r.receiptIntegrityValid === true).length;
    const aTotal    = runASummary.records.filter((r) => r.ok).length;
    console.log(`  Run A (loaded): ${aVerified}/${aTotal} proof receipts passed integrity check`);
    expect(aVerified).toBe(aTotal);
    expect(aTotal).toBe(22);
    expect(aVerified + bVerified).toBe(44);
  });
});

describe("DRA-BMK-022 — Part 7: Run A vs Run B Reproducibility (all 22 documents)", () => {
  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-022) ───────────────────");
    for (const rB of recordsB) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      expect(sumA).toBeDefined();
      if (sumA?.ok && rB.ok) {
        const match = sumA.decision === rB.decision;
        console.log(`  ${rB.corpusId}: ${rB.decision} | ${match ? "IDENTICAL ✓" : "DIFFERENT ✗"}`);
        expect(sumA.decision).toBe(rB.decision);
      }
    }
  });

  it("same substantiveDigest on both runs for every document", () => {
    for (const rB of recordsB) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.ok) {
        expect(sumA.substantiveDigest).toBe(rB.substantiveDigest);
      }
    }
  });

  it("same issue count and issue classes on both runs for every document", () => {
    for (const rB of recordsB) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.ok) {
        expect(sumA.issueCount).toBe(rB.issueCount);
        expect([...sumA.issueClasses].sort()).toEqual([...rB.issueClasses].sort());
      }
    }
  });

  it("same evaluatorVersion / pipelineVersion / schemaVersion stamps on both runs", () => {
    for (const rB of recordsB) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.ok) {
        expect(sumA.evaluatorVersion).toBe(rB.evaluatorVersion);
        expect(sumA.pipelineVersion).toBe(rB.pipelineVersion);
        expect(sumA.schemaVersion).toBe(rB.schemaVersion);
        expect(rB.evaluatorVersion).toBe("0.1.2");
      }
    }
  });

  it("operational timestamps differ between runs (fixedTimestamp control is active)", () => {
    for (const rB of recordsB) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      expect(sumA?.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      expect(sumA?.executedAt).not.toBe(rB.executedAt);
    }
  });

  it("DRA-DOC-0022 reproduces REVIEW / 3 × EVIDENCE_INADEQUATE identically across both runs, matching admission time", () => {
    const sumA22 = runASummary.records.find((r) => r.corpusId === "DRA-DOC-0022");
    const rB22   = recordsB.find((r) => r.corpusId === "DRA-DOC-0022");
    expect(sumA22).toBeDefined();
    expect(rB22).toBeDefined();
    if (sumA22 && rB22?.ok) {
      console.log(`\n── DRA-DOC-0022 — Run A: ${sumA22.decision}/${sumA22.issueCount}  Run B: ${rB22.decision}/${rB22.issueCount}  Admission: REVIEW/3`);
      expect(sumA22.decision).toBe("REVIEW");
      expect(rB22.decision).toBe("REVIEW");
      expect(sumA22.issueCount).toBe(3);
      expect(rB22.issueCount).toBe(3);
      expect(sumA22.substantiveDigest).toBe(rB22.substantiveDigest);
    }
  });

  it("adding DRA-DOC-0022 did not change the prior 21-document decision distribution", () => {
    const distPrior21: Record<string, number> = {};
    for (const rB of recordsB) {
      if (rB.corpusId === "DRA-DOC-0022") continue;
      if (rB.ok && rB.decision) distPrior21[rB.decision] = (distPrior21[rB.decision] ?? 0) + 1;
    }
    console.log("\n── Prior-21 decision distribution (Run B, excluding DRA-DOC-0022) ──");
    for (const [k, v] of Object.entries(distPrior21)) console.log(`  ${k}: ${v}`);
    // DRA-BMK-021 21-document baseline (DRA-DOC-0021 already included): SUPPORTED 10 / REVIEW 9 / HOLD 2
    expect(distPrior21["SUPPORTED"]).toBe(10);
    expect(distPrior21["REVIEW"]).toBe(9);
    expect(distPrior21["HOLD"]).toBe(2);
  });

  it("reports the full 22-document decision distribution (Run B)", () => {
    const dist: Record<string, number> = {};
    for (const rB of recordsB) {
      if (rB.ok && rB.decision) dist[rB.decision] = (dist[rB.decision] ?? 0) + 1;
    }
    console.log("\n── Full 22-document decision distribution (Run B) ──────────");
    for (const [k, v] of Object.entries(dist)) console.log(`  ${k}: ${v}`);
    expect(Object.values(dist).reduce((a, b) => a + b, 0)).toBe(22);
  });

  it("reports final issue-class coverage against the DRA-CHK-002 3/9 ceiling", () => {
    const classes = new Set<string>();
    for (const rB of recordsB) {
      if (rB.ok) for (const cls of rB.issueClasses) classes.add(cls);
    }
    console.log("\n── Issue-class coverage (Run B, 22 docs) ────────────────────");
    console.log(`  classes observed: ${[...classes].sort().join(", ")}`);
    console.log(`  coverage: ${classes.size} / 9`);
    // DRA-CHK-002 established ceiling: IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, IC-7 CLAIM_INCONSISTENCY
    expect(classes.size).toBe(3);
    expect(classes.has("EVIDENCE_ABSENT")).toBe(true);
    expect(classes.has("EVIDENCE_INADEQUATE")).toBe(true);
    expect(classes.has("CLAIM_INCONSISTENCY")).toBe(true);
  });
});
