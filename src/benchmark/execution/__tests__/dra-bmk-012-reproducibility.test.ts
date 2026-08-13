/**
 * DRA-BMK-012 — Part 6 (Focused): Reproducibility Controls
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  REPRODUCIBILITY TEST — DRA-BMK-012                                      ║
 * ║                                                                          ║
 * ║  Focused verification of reproducibility controls against the initial    ║
 * ║  six-document corpus (synchronous — no live network).                    ║
 * ║                                                                          ║
 * ║  Full twelve-document Run A / Run B comparison is covered in             ║
 * ║  dra-bmk-012-evaluator-run.test.ts (live network, all 12 docs).         ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-06T23:30:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-07T00:00:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed                                              ║
 * ║    • No normalisation of meaningful differences                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";

import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkRunResult } from "../runner.js";
import { loadBenchmarkCorpus } from "../../evidence/corpus-loader.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";

// ---------------------------------------------------------------------------
// Fixed timestamps (distinct from all prior benchmarks to avoid key collision)
// ---------------------------------------------------------------------------

const FIXED_TS_A = "2026-08-06T23:30:00.000Z";
const FIXED_TS_B = "2026-08-07T00:00:00.000Z";
const FIXED_RUN_ID = "bmk-012-repro";

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

describe("DRA-BMK-012 — Reproducibility (6-doc sync): decision stability", () => {
  it("corpus loaded without error", () => {
    if (loadError) console.error("Load error:", loadError);
    expect(loadError).toBeNull();
  });

  it("both runs executed the same number of documents", () => {
    expect(runResultA.documentCount).toBe(runResultB.documentCount);
    expect(runResultA.documentCount).toBe(6);
  });

  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-012) ───────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.corpusId).toBe(rB.corpusId);
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const match = rA.evaluationResult.decision === rB.evaluationResult.decision;
        console.log(`  ${rA.corpusId}: ${rA.evaluationResult.decision} | ${match ? "IDENTICAL ✓" : "DIFFERENT ✗"}`);
        expect(rA.evaluationResult.decision).toBe(rB.evaluationResult.decision);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: proof-receipt digest
// ---------------------------------------------------------------------------

describe("DRA-BMK-012 — Reproducibility (6-doc sync): proof-receipt digest", () => {
  it("same substantiveDigest on both runs (content unchanged — deterministic control works)", () => {
    console.log("\n── Proof-Receipt Digest Reproducibility ─────────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const match =
          rA.evaluationResult.proofReceipt.substantiveDigest ===
          rB.evaluationResult.proofReceipt.substantiveDigest;
        console.log(
          `  ${rA.corpusId}: ${rA.evaluationResult.proofReceipt.substantiveDigest.slice(0, 16)}… | ${match ? "IDENTICAL ✓" : "DIFFERENT ✗"}`,
        );
        expect(rA.evaluationResult.proofReceipt.substantiveDigest).toBe(
          rB.evaluationResult.proofReceipt.substantiveDigest,
        );
      }
    }
  });

  it("operational timestamps differ between runs (fixedTimestamp control is active)", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      expect(rA.executedAt).not.toBe(rB.executedAt);
    }
  });

  it("all proof receipts pass structural integrity check", () => {
    for (const runResult of [runResultA, runResultB]) {
      for (const record of runResult.records) {
        if (record.evaluationResult.ok) {
          const valid = verifyReceiptIntegrity(record.evaluationResult.proofReceipt);
          expect(valid).toBe(true);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Reproducibility: issue counts and classes
// ---------------------------------------------------------------------------

describe("DRA-BMK-012 — Reproducibility (6-doc sync): issue counts and classes", () => {
  it("same issue count on both runs for every document", () => {
    console.log("\n── Issue Count Reproducibility ──────────────────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const cA = rA.evaluationResult.issues.length;
        const cB = rB.evaluationResult.issues.length;
        console.log(`  ${rA.corpusId}: A=${cA} B=${cB} ${cA === cB ? "IDENTICAL ✓" : "DIFFERENT ✗"}`);
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
          issues
            .map((iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN")
            .sort()
            .join(",");
        expect(getClasses(rA.evaluationResult.issues)).toBe(
          getClasses(rB.evaluationResult.issues),
        );
      }
    }
  });
});
