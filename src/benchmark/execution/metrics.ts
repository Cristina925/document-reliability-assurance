/**
 * DRA-001-06 — Benchmark Metrics
 *
 * Computes aggregate benchmark statistics from a ComparisonResult and
 * BenchmarkRunResult. All metrics are deterministic given identical inputs.
 *
 * Metric definitions:
 *   recall    = agreedIssues / totalReviewerIssues
 *               (0 when no reviewer issues — vacuous case)
 *   precision = agreedIssues / totalEvaluatorIssues
 *               (1 when both sides have zero issues — perfect vacuous agreement)
 *               (0 when evaluator has zero issues but reviewers have some)
 *   FP (false positives)  = evaluator-only issue classes
 *   FN (false negatives)  = reviewer-only issue classes
 *   decisionAgreementRate = agreed-reviewer-pairs / total-reviewer-pairs
 *                           (0 when no reviewer submissions)
 *
 * Issue counts are at the issue-CLASS level per document, matching the
 * comparison engine's per-document deduplication.
 */

import type { DraIssueClass } from "../../model/issue-classes.js";
import { ISSUE_CLASSES } from "../../model/issue-classes.js";
import type { BenchmarkRunResult } from "./runner.js";
import type { ComparisonResult } from "./comparison.js";

// ---------------------------------------------------------------------------
// IssueClassCount
// ---------------------------------------------------------------------------

/** Evaluator and reviewer counts for a single issue class across all documents. */
export interface IssueClassCount {
  readonly evaluatorCount: number;
  readonly reviewerCount: number;
}

// ---------------------------------------------------------------------------
// BenchmarkMetrics
// ---------------------------------------------------------------------------

export interface BenchmarkMetrics {
  /** Total documents submitted to the runner. */
  readonly documentCount: number;
  /** Documents that evaluated successfully (ok:true). */
  readonly evaluatedCount: number;
  /** Documents that failed evaluation (ok:false). */
  readonly failureCount: number;

  /** Unique issue classes detected by the evaluator (summed across all documents). */
  readonly totalEvaluatorIssues: number;
  /** Unique issue classes raised by reviewers (summed across all documents). */
  readonly totalReviewerIssues: number;
  /** Issue classes agreed by both evaluator and reviewers (summed across all documents). */
  readonly totalAgreedIssues: number;

  /**
   * Issue recall — fraction of reviewer-identified issue classes caught by
   * the evaluator. 0 when totalReviewerIssues === 0.
   * Rounded to 4 decimal places.
   */
  readonly recall: number;

  /**
   * Issue precision — fraction of evaluator-detected issue classes confirmed
   * by reviewers.
   * Special cases: 1 when both sides have zero issues; 0 when evaluator
   * detects nothing but reviewers do.
   * Rounded to 4 decimal places.
   */
  readonly precision: number;

  /** Evaluator-only issue classes — potential false positives. */
  readonly falsePositives: number;

  /** Reviewer-only issue classes — potential false negatives. */
  readonly falseNegatives: number;

  /**
   * Fraction of (evaluator, reviewer) pairs where the decision agreed.
   * 0 when no reviewer submissions exist.
   * Rounded to 4 decimal places.
   */
  readonly decisionAgreementRate: number;

  /** Per-class counts from evaluator and reviewers across all documents. */
  readonly issueClassDistribution: Readonly<Record<DraIssueClass, IssueClassCount>>;
}

// ---------------------------------------------------------------------------
// computeMetrics
// ---------------------------------------------------------------------------

/**
 * Computes aggregate BenchmarkMetrics from a run result and comparison.
 *
 * @param runResult   The complete benchmark execution result.
 * @param comparison  The comparison result produced by compareResults().
 * @returns           Frozen BenchmarkMetrics.
 */
export function computeMetrics(
  runResult: BenchmarkRunResult,
  comparison: ComparisonResult,
): BenchmarkMetrics {
  let totalEvaluatorIssues = 0;
  let totalReviewerIssues = 0;
  let totalAgreedIssues = 0;
  let totalDecisionPairs = 0;
  let totalDecisionAgreements = 0;

  const evalClassCounts: Partial<Record<DraIssueClass, number>> = {};
  const reviewerClassCounts: Partial<Record<DraIssueClass, number>> = {};

  for (const comp of comparison.comparisons) {
    // Evaluator issue classes (deduplicated per document)
    totalEvaluatorIssues += comp.evaluatorIssueClasses.length;
    // Reviewer issue classes = agreed + reviewer-only
    const reviewerTotal =
      comp.agreedIssueClasses.length + comp.reviewerOnlyClasses.length;
    totalReviewerIssues += reviewerTotal;
    totalAgreedIssues += comp.agreedIssueClasses.length;

    // Per-class accumulators
    for (const cls of comp.evaluatorIssueClasses) {
      evalClassCounts[cls] = (evalClassCounts[cls] ?? 0) + 1;
    }
    // Reviewer classes = agreed + reviewer-only
    for (const cls of [
      ...comp.agreedIssueClasses,
      ...comp.reviewerOnlyClasses,
    ]) {
      reviewerClassCounts[cls] = (reviewerClassCounts[cls] ?? 0) + 1;
    }

    totalDecisionPairs += comp.decisionComparisons.length;
    totalDecisionAgreements += comp.decisionComparisons.filter(
      (d) => d.agreed,
    ).length;
  }

  // Derived metrics
  const recall =
    totalReviewerIssues === 0
      ? 0
      : totalAgreedIssues / totalReviewerIssues;

  const precision =
    totalEvaluatorIssues === 0
      ? totalReviewerIssues === 0
        ? 1 // perfect vacuous agreement
        : 0 // evaluator missed everything
      : totalAgreedIssues / totalEvaluatorIssues;

  const falsePositives = totalEvaluatorIssues - totalAgreedIssues;
  const falseNegatives = totalReviewerIssues - totalAgreedIssues;

  const decisionAgreementRate =
    totalDecisionPairs === 0
      ? 0
      : totalDecisionAgreements / totalDecisionPairs;

  // Build per-class distribution
  const distribution = {} as Record<DraIssueClass, IssueClassCount>;
  for (const cls of ISSUE_CLASSES) {
    distribution[cls] = Object.freeze({
      evaluatorCount: evalClassCounts[cls] ?? 0,
      reviewerCount: reviewerClassCounts[cls] ?? 0,
    });
  }

  return Object.freeze<BenchmarkMetrics>({
    documentCount: runResult.documentCount,
    evaluatedCount: runResult.successCount,
    failureCount: runResult.failureCount,
    totalEvaluatorIssues,
    totalReviewerIssues,
    totalAgreedIssues,
    recall: round4(recall),
    precision: round4(precision),
    falsePositives,
    falseNegatives,
    decisionAgreementRate: round4(decisionAgreementRate),
    issueClassDistribution: Object.freeze(distribution),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
