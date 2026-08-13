/**
 * DRA-001-06 — Reproducibility tests
 *
 * Verifies that repeated executions with identical inputs produce identical
 * substantive outputs. The evaluator is deterministic given the same content;
 * only operational timestamps vary (and those are excluded from substantive digests).
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkRunResult } from "../runner.js";
import { createReviewSession, addSubmission } from "../human-review.js";
import { compareResults } from "../comparison.js";
import { computeMetrics } from "../metrics.js";
import {
  FIXED_TS,
  FIXED_RUN_ID,
  FIXED_SESSION_ID,
  EXEC_DOC_1,
  EXEC_DOC_2,
  EXEC_DOC_3,
  ALL_EXEC_DOCS,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// Two independent runs with same fixed timestamp
// ---------------------------------------------------------------------------

let run1: BenchmarkRunResult;
let run2: BenchmarkRunResult;

beforeAll(() => {
  const opts = { fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID };
  run1 = new BenchmarkRunner(opts).execute(ALL_EXEC_DOCS);
  run2 = new BenchmarkRunner(opts).execute(ALL_EXEC_DOCS);
});

describe("Reproducibility — proof receipt substantive digest", () => {
  it("run1 and run2 have identical substantiveDigest for every document", () => {
    for (let i = 0; i < run1.records.length; i++) {
      const r1 = run1.records[i]!;
      const r2 = run2.records[i]!;
      if (r1.evaluationResult.ok && r2.evaluationResult.ok) {
        expect(r1.evaluationResult.proofReceipt.substantiveDigest).toBe(
          r2.evaluationResult.proofReceipt.substantiveDigest,
        );
      }
    }
  });

  it("decision is identical across runs for every document", () => {
    for (let i = 0; i < run1.records.length; i++) {
      const r1 = run1.records[i]!;
      const r2 = run2.records[i]!;
      if (r1.evaluationResult.ok && r2.evaluationResult.ok) {
        expect(r1.evaluationResult.decision).toBe(r2.evaluationResult.decision);
      }
    }
  });

  it("issue count is identical across runs for every document", () => {
    for (let i = 0; i < run1.records.length; i++) {
      const r1 = run1.records[i]!;
      const r2 = run2.records[i]!;
      if (r1.evaluationResult.ok && r2.evaluationResult.ok) {
        expect(r1.evaluationResult.issues.length).toBe(
          r2.evaluationResult.issues.length,
        );
      }
    }
  });

  it("issue classes are identical across runs for every document", () => {
    for (let i = 0; i < run1.records.length; i++) {
      const r1 = run1.records[i]!;
      const r2 = run2.records[i]!;
      if (r1.evaluationResult.ok && r2.evaluationResult.ok) {
        const classes1 = r1.evaluationResult.issues.map((i) => i.issueClass).sort();
        const classes2 = r2.evaluationResult.issues.map((i) => i.issueClass).sort();
        expect(classes1).toEqual(classes2);
      }
    }
  });
});

describe("Reproducibility — different timestamps, same digest", () => {
  it("substantiveDigest is identical even when fixedTimestamp differs", () => {
    const runA = new BenchmarkRunner({
      fixedTimestamp: "2026-07-27T10:00:00.000Z",
      fixedRunId: "run-A",
    }).execute([EXEC_DOC_1]);

    const runB = new BenchmarkRunner({
      fixedTimestamp: "2026-07-28T09:00:00.000Z",
      fixedRunId: "run-B",
    }).execute([EXEC_DOC_1]);

    const rA = runA.records[0]!;
    const rB = runB.records[0]!;

    if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
      // The timestamps differ (evaluatedAt is different) but the substantive
      // digest must be identical because timestamps are operational metadata.
      expect(rA.evaluationResult.proofReceipt.substantiveDigest).toBe(
        rB.evaluationResult.proofReceipt.substantiveDigest,
      );
    }
  });
});

describe("Reproducibility — benchmark metrics", () => {
  it("metrics are identical across runs with identical reviewer input", () => {
    const opts = { fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID };

    const runA = new BenchmarkRunner(opts).execute(ALL_EXEC_DOCS);
    const runB = new BenchmarkRunner(opts).execute(ALL_EXEC_DOCS);

    let sessionA = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    let sessionB = createReviewSession(FIXED_SESSION_ID, FIXED_TS);

    // Identical submissions in both sessions
    for (const record of runA.records) {
      if (record.evaluationResult.ok) {
        const sub = {
          reviewerId: "reviewer-1",
          corpusId: record.corpusId,
          submittedAt: FIXED_TS,
          issues: [] as never[],
          recommendation: record.evaluationResult.decision as "SUPPORTED" | "REVIEW" | "HOLD",
          confidence: "HIGH" as const,
        };
        sessionA = addSubmission(sessionA, sub);
        sessionB = addSubmission(sessionB, sub);
      }
    }

    const metricsA = computeMetrics(runA, compareResults(runA, sessionA));
    const metricsB = computeMetrics(runB, compareResults(runB, sessionB));

    expect(metricsA.recall).toBe(metricsB.recall);
    expect(metricsA.precision).toBe(metricsB.precision);
    expect(metricsA.decisionAgreementRate).toBe(metricsB.decisionAgreementRate);
    expect(metricsA.totalEvaluatorIssues).toBe(metricsB.totalEvaluatorIssues);
    expect(metricsA.falsePositives).toBe(metricsB.falsePositives);
    expect(metricsA.falseNegatives).toBe(metricsB.falseNegatives);
  });
});

describe("Reproducibility — document order preserved", () => {
  it("records appear in the same order as the input document list", () => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    const result = runner.execute([EXEC_DOC_1, EXEC_DOC_2, EXEC_DOC_3]);
    expect(result.records[0]!.corpusId).toBe(EXEC_DOC_1.corpusDocument.corpusId);
    expect(result.records[1]!.corpusId).toBe(EXEC_DOC_2.corpusDocument.corpusId);
    expect(result.records[2]!.corpusId).toBe(EXEC_DOC_3.corpusDocument.corpusId);
  });

  it("order is stable across multiple executions", () => {
    const runner1 = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    const runner2 = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    const r1 = runner1.execute(ALL_EXEC_DOCS);
    const r2 = runner2.execute(ALL_EXEC_DOCS);
    for (let i = 0; i < r1.records.length; i++) {
      expect(r1.records[i]!.corpusId).toBe(r2.records[i]!.corpusId);
    }
  });
});

describe("Reproducibility — evaluator not modified", () => {
  it("verifyReceiptIntegrity returns true for all proof receipts", async () => {
    const { verifyReceiptIntegrity } = await import("../../../pipeline/index.js");
    for (const record of run1.records) {
      if (record.evaluationResult.ok) {
        expect(verifyReceiptIntegrity(record.evaluationResult.proofReceipt)).toBe(true);
      }
    }
  });
});
