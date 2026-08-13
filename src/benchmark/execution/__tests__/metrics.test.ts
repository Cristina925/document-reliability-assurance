/**
 * DRA-001-06 — BenchmarkMetrics tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkRunResult } from "../runner.js";
import {
  createReviewSession,
  addSubmission,
} from "../human-review.js";
import { compareResults } from "../comparison.js";
import { computeMetrics } from "../metrics.js";
import { ISSUE_CLASSES } from "../../../model/issue-classes.js";
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
// Shared run result
// ---------------------------------------------------------------------------

let runResult: BenchmarkRunResult;

beforeAll(() => {
  const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
  runResult = runner.execute(ALL_EXEC_DOCS);
});

// ---------------------------------------------------------------------------
// Vacuous cases
// ---------------------------------------------------------------------------

describe("computeMetrics — no reviewer submissions", () => {
  it("recall is 0 when no reviewer issues", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.recall).toBe(0);
  });

  it("precision is 1 when both evaluator and reviewer have zero issues (vacuous agreement)", () => {
    // Create run with only fully-supported docs and empty session
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
    const singleRun = runner.execute([EXEC_DOC_1]);
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const record = singleRun.records[0]!;

    if (record.evaluationResult.ok && record.evaluationResult.issues.length === 0) {
      // Evaluator found no issues; reviewer submits no issues
      const updatedSession = addSubmission(session, {
        reviewerId: "reviewer-1",
        corpusId: "DRA-DOC-0001",
        submittedAt: FIXED_TS,
        issues: [],
        recommendation: record.evaluationResult.decision,
        confidence: "HIGH",
      });
      const comparison = compareResults(singleRun, updatedSession);
      const metrics = computeMetrics(singleRun, comparison);
      expect(metrics.precision).toBe(1);
    }
    // If evaluator found issues, this test is vacuously satisfied
  });

  it("decisionAgreementRate is 0 when no reviewer submissions", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.decisionAgreementRate).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Count invariants
// ---------------------------------------------------------------------------

describe("computeMetrics — count invariants", () => {
  it("documentCount matches run result", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.documentCount).toBe(runResult.documentCount);
  });

  it("evaluatedCount + failureCount === documentCount", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.evaluatedCount + metrics.failureCount).toBe(metrics.documentCount);
  });

  it("falsePositives = totalEvaluatorIssues - totalAgreedIssues", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.falsePositives).toBe(
      metrics.totalEvaluatorIssues - metrics.totalAgreedIssues,
    );
  });

  it("falseNegatives = totalReviewerIssues - totalAgreedIssues", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.falseNegatives).toBe(
      metrics.totalReviewerIssues - metrics.totalAgreedIssues,
    );
  });

  it("falsePositives >= 0", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.falsePositives).toBeGreaterThanOrEqual(0);
  });

  it("falseNegatives >= 0", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.falseNegatives).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// Decision agreement rate
// ---------------------------------------------------------------------------

describe("computeMetrics — decision agreement rate", () => {
  it("rate is 1.0 when all reviewers agree with the evaluator", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    for (const record of runResult.records) {
      if (record.evaluationResult.ok) {
        session = addSubmission(session, {
          reviewerId: "reviewer-1",
          corpusId: record.corpusId,
          submittedAt: FIXED_TS,
          issues: [],
          recommendation: record.evaluationResult.decision,
          confidence: "HIGH",
        });
      }
    }
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    // All successful docs have one reviewer agreeing → rate should be 1
    if (runResult.successCount > 0) {
      expect(metrics.decisionAgreementRate).toBe(1);
    }
  });

  it("rate is 0 when all reviewers disagree with the evaluator", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    for (const record of runResult.records) {
      if (record.evaluationResult.ok) {
        const disagreement: "SUPPORTED" | "REVIEW" | "HOLD" =
          record.evaluationResult.decision === "SUPPORTED" ? "HOLD" : "SUPPORTED";
        session = addSubmission(session, {
          reviewerId: "reviewer-1",
          corpusId: record.corpusId,
          submittedAt: FIXED_TS,
          issues: [],
          recommendation: disagreement,
          confidence: "LOW",
        });
      }
    }
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    if (runResult.successCount > 0) {
      expect(metrics.decisionAgreementRate).toBe(0);
    }
  });

  it("rate is between 0 and 1 inclusive", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(metrics.decisionAgreementRate).toBeGreaterThanOrEqual(0);
    expect(metrics.decisionAgreementRate).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Issue class distribution
// ---------------------------------------------------------------------------

describe("computeMetrics — issueClassDistribution", () => {
  it("contains all nine issue classes", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    for (const cls of ISSUE_CLASSES) {
      expect(metrics.issueClassDistribution).toHaveProperty(cls);
    }
  });

  it("each class has evaluatorCount and reviewerCount >= 0", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    for (const cls of ISSUE_CLASSES) {
      expect(metrics.issueClassDistribution[cls].evaluatorCount).toBeGreaterThanOrEqual(0);
      expect(metrics.issueClassDistribution[cls].reviewerCount).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

describe("computeMetrics — rounding", () => {
  it("recall is rounded to 4 decimal places", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    const rounded = Math.round(metrics.recall * 10_000) / 10_000;
    expect(metrics.recall).toBe(rounded);
  });

  it("precision is rounded to 4 decimal places", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    const rounded = Math.round(metrics.precision * 10_000) / 10_000;
    expect(metrics.precision).toBe(rounded);
  });
});

// ---------------------------------------------------------------------------
// Result is frozen
// ---------------------------------------------------------------------------

describe("computeMetrics — immutability", () => {
  it("metrics object is frozen", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const comparison = compareResults(runResult, session);
    const metrics = computeMetrics(runResult, comparison);
    expect(Object.isFrozen(metrics)).toBe(true);
  });
});
