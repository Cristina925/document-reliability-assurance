/**
 * DRA-BMK-010 — Part 4 (Focused): Reproducibility Controls
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  REPRODUCIBILITY TEST — DRA-BMK-010                                      ║
 * ║                                                                          ║
 * ║  Focused verification of the existing reproducibility controls against   ║
 * ║  the initial six-document corpus (synchronous — no live network).        ║
 * ║                                                                          ║
 * ║  Full ten-document Run A / Run B comparison is covered in               ║
 * ║  dra-bmk-010-evaluator-run.test.ts (live network, all 10 docs).         ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-06T15:00:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-06T16:00:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed                                              ║
 * ║    • No normalization of meaningful differences                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";

import { BenchmarkRunner } from "../../execution/runner.js";
import type { BenchmarkRunResult } from "../../execution/runner.js";
import { loadBenchmarkCorpus } from "../../evidence/corpus-loader.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

const FIXED_TS_A = "2026-08-06T15:00:00.000Z";
const FIXED_TS_B = "2026-08-06T16:00:00.000Z";
const FIXED_RUN_ID = "bmk-010-repro";

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

let runResultA: BenchmarkRunResult;
let runResultB: BenchmarkRunResult;
let loadError: string | null = null;

beforeAll(() => {
  const loaded = loadBenchmarkCorpus();
  if (!loaded.ok) {
    loadError = `loadBenchmarkCorpus failed: ${loaded.message}`;
    return;
  }

  const runnerA = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_A, fixedRunId: FIXED_RUN_ID });
  const runnerB = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_B, fixedRunId: FIXED_RUN_ID });

  runResultA = runnerA.execute(loaded.documents);
  runResultB = runnerB.execute(loaded.documents);
});

// ---------------------------------------------------------------------------
// Reproducibility: decision
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: decision stability", () => {
  it("corpus loaded without error", () => {
    if (loadError) console.error("Load error:", loadError);
    expect(loadError).toBeNull();
  });

  it("both runs executed the same number of documents", () => {
    expect(runResultA.documentCount).toBe(runResultB.documentCount);
    expect(runResultA.documentCount).toBe(6);
  });

  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility ─────────────────────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.corpusId).toBe(rB.corpusId);
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const match = rA.evaluationResult.decision === rB.evaluationResult.decision;
        console.log(`  ${rA.corpusId}: ${rA.evaluationResult.decision} | ${match ? "IDENTICAL" : "DIFFERENT"}`);
        expect(rA.evaluationResult.decision).toBe(rB.evaluationResult.decision);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: substantive digest
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: proof-receipt digest", () => {
  it("same substantiveDigest on both runs (content unchanged — deterministic control works)", () => {
    console.log("\n── Proof-Receipt Digest Reproducibility ─────────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const match = rA.evaluationResult.proofReceipt.substantiveDigest === rB.evaluationResult.proofReceipt.substantiveDigest;
        console.log(
          `  ${rA.corpusId}: ${rA.evaluationResult.proofReceipt.substantiveDigest.slice(0, 16)}… | ${match ? "IDENTICAL" : "DIFFERENT"}`,
        );
        expect(rA.evaluationResult.proofReceipt.substantiveDigest).toBe(
          rB.evaluationResult.proofReceipt.substantiveDigest,
        );
      }
    }
  });

  it("operational timestamps differ between runs (fixedTimestamp is applied)", () => {
    // Verify that timestamps ARE different between runs — confirming the
    // fixedTimestamp control is active and behaves as documented.
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      // executedAt should equal fixedTimestamp in each run
      expect(rA.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      // The two runs use different timestamps
      expect(rA.executedAt).not.toBe(rB.executedAt);
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: issue counts and classes
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: issue counts and classes", () => {
  it("same issue count on both runs for every document", () => {
    console.log("\n── Issue Count Reproducibility ──────────────────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const cA = rA.evaluationResult.issues.length;
        const cB = rB.evaluationResult.issues.length;
        console.log(`  ${rA.corpusId}: A=${cA} B=${cB} ${cA === cB ? "IDENTICAL" : "DIFFERENT"}`);
        expect(cA).toBe(cB);
      }
    }
  });

  it("same issue classes on both runs for every document", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const getClasses = (issues: readonly unknown[]) =>
          [...new Set(
            (issues as Array<Record<string, unknown>>).map(
              (iss) => String(iss["issueClass"] ?? iss["class"] ?? ""),
            ),
          )].sort();
        expect(getClasses(rA.evaluationResult.issues)).toEqual(
          getClasses(rB.evaluationResult.issues),
        );
      }
    }
  });

  it("no unexpected ordering changes between runs", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      // Documents appear in the same position in both runs
      expect(rA.corpusId).toBe(rB.corpusId);
    }
  });

  it("no execution drift — same ok status per document on both runs", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.evaluationResult.ok).toBe(rB.evaluationResult.ok);
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: material statement spans
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: material statement spans", () => {
  it("same material statement count on both runs for every document", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (!rA.evaluationResult.ok || !rB.evaluationResult.ok) continue;

      const getStmtCount = (result: typeof rA.evaluationResult) => {
        if (!result.ok) return 0;
        const s2 = (result.pipeline as Record<string, unknown>)["stage2"] as Record<string, unknown> | undefined;
        return ((s2?.["statements"] ?? s2?.["claims"] ?? []) as unknown[]).length;
      };

      const countA = getStmtCount(rA.evaluationResult);
      const countB = getStmtCount(rB.evaluationResult);
      expect(countA).toBe(countB);
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: evidence relationships
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: evidence relationships", () => {
  it("same number of evidence records on both runs for every document", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (!rA.evaluationResult.ok || !rB.evaluationResult.ok) continue;

      const getEvidenceCount = (result: typeof rA.evaluationResult) => {
        if (!result.ok) return 0;
        const s4 = (result.pipeline as Record<string, unknown>)["stage4"] as Record<string, unknown> | undefined;
        return ((s4?.["evidenceRecords"] ?? []) as unknown[]).length;
      };

      const countA = getEvidenceCount(rA.evaluationResult);
      const countB = getEvidenceCount(rB.evaluationResult);
      expect(countA).toBe(countB);
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: proof-receipt integrity
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: proof-receipt integrity on both runs", () => {
  it("verifyReceiptIntegrity returns true for every successful receipt in Run A", () => {
    for (const record of runResultA.records) {
      if (record.evaluationResult.ok) {
        expect(verifyReceiptIntegrity(record.evaluationResult.proofReceipt)).toBe(true);
      }
    }
  });

  it("verifyReceiptIntegrity returns true for every successful receipt in Run B", () => {
    for (const record of runResultB.records) {
      if (record.evaluationResult.ok) {
        expect(verifyReceiptIntegrity(record.evaluationResult.proofReceipt)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: success/failure counts
// ---------------------------------------------------------------------------

describe("DRA-BMK-010 — Reproducibility: run-level counts", () => {
  it("same successCount on both runs", () => {
    expect(runResultA.successCount).toBe(runResultB.successCount);
  });

  it("same failureCount on both runs", () => {
    expect(runResultA.failureCount).toBe(runResultB.failureCount);
  });

  it("emits final reproducibility summary", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-BMK-010 — REPRODUCIBILITY SUMMARY (6-doc sync)       ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
    console.log(`  Run A: ${runResultA.successCount} success / ${runResultA.failureCount} failure / ${runResultA.documentCount} total`);
    console.log(`  Run B: ${runResultB.successCount} success / ${runResultB.failureCount} failure / ${runResultB.documentCount} total`);

    let identicalCount = 0;
    let differentCount = 0;
    let notComparableCount = 0;

    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (!rA.evaluationResult.ok || !rB.evaluationResult.ok) {
        notComparableCount++;
        continue;
      }
      const same =
        rA.evaluationResult.decision === rB.evaluationResult.decision &&
        rA.evaluationResult.proofReceipt.substantiveDigest === rB.evaluationResult.proofReceipt.substantiveDigest &&
        rA.evaluationResult.issues.length === rB.evaluationResult.issues.length;
      if (same) identicalCount++; else differentCount++;
    }

    console.log(`\n  Per-document verdict:`);
    console.log(`    IDENTICAL      : ${identicalCount}`);
    console.log(`    DIFFERENT      : ${differentCount}`);
    console.log(`    NOT_COMPARABLE : ${notComparableCount}`);
    console.log(`\n  Overall: ${differentCount === 0 && notComparableCount === 0 ? "IDENTICAL" : differentCount > 0 ? "DIFFERENCES DETECTED" : "FUNCTIONALLY_EQUIVALENT"}`);
    console.log(`\n  NOTE: Full 10-document reproducibility (including live PDFs) is verified`);
    console.log(`  in dra-bmk-010-evaluator-run.test.ts (Run A vs Run B, async with network).`);

    expect(differentCount).toBe(0);
  });
});
