/**
 * DRA-001-06 — Comparative Analysis Engine
 *
 * Compares evaluator findings against human reviewer submissions at the
 * issue-class level. Comparison is per document, per reviewer.
 *
 * Issue-class-level comparison (not instance-level):
 *   - Multiple evaluator issues of the same class on the same document
 *     count as ONE class for comparison purposes.
 *   - A reviewer issue class "agrees" with an evaluator issue class when
 *     both appear for the same document, regardless of instance count.
 *
 * Design: all outputs are frozen plain objects.
 */

import type { CorpusId } from "../corpus/schema.js";
import type { DraIssueClass } from "../../model/issue-classes.js";
import type { AssuranceDecision } from "../../model/decisions.js";
import type { BenchmarkRunResult, ExecutionRecord } from "./runner.js";
import type { HumanReviewSession, ReviewerSubmission } from "./human-review.js";
import { getSubmissionsForDocument } from "./human-review.js";

// ---------------------------------------------------------------------------
// DecisionComparison
// ---------------------------------------------------------------------------

/** Agreement between the evaluator decision and one reviewer's recommendation. */
export interface DecisionComparison {
  readonly reviewerId: string;
  readonly evaluatorDecision: AssuranceDecision;
  readonly reviewerRecommendation: AssuranceDecision;
  readonly agreed: boolean;
}

// ---------------------------------------------------------------------------
// DocumentComparison
// ---------------------------------------------------------------------------

/** Full comparison result for one corpus document. */
export interface DocumentComparison {
  /** Permanent corpus identifier. */
  readonly corpusId: CorpusId;
  /** null when the evaluator pipeline failed for this document. */
  readonly evaluatorDecision: AssuranceDecision | null;
  /** Deduplicated issue classes detected by the evaluator. */
  readonly evaluatorIssueClasses: readonly DraIssueClass[];
  /** All reviewer submissions for this document. */
  readonly reviewerSubmissions: readonly ReviewerSubmission[];
  /**
   * Issue classes found by BOTH the evaluator and at least one reviewer.
   * These are the agreements.
   */
  readonly agreedIssueClasses: readonly DraIssueClass[];
  /**
   * Issue classes detected by the evaluator but not mentioned by any reviewer.
   * Evaluator-only findings — potential false positives relative to reviewers.
   */
  readonly evaluatorOnlyClasses: readonly DraIssueClass[];
  /**
   * Issue classes raised by at least one reviewer but not detected by the evaluator.
   * Reviewer-only findings — potential false negatives relative to reviewers.
   */
  readonly reviewerOnlyClasses: readonly DraIssueClass[];
  /** Per-reviewer decision comparison. Empty when evaluator pipeline failed. */
  readonly decisionComparisons: readonly DecisionComparison[];
}

// ---------------------------------------------------------------------------
// ComparisonResult
// ---------------------------------------------------------------------------

/** Comparison results for all documents in a benchmark run. */
export interface ComparisonResult {
  readonly documentCount: number;
  readonly comparisons: readonly DocumentComparison[];
}

// ---------------------------------------------------------------------------
// compareResults
// ---------------------------------------------------------------------------

/**
 * Compares evaluator findings against human reviewer submissions for all
 * documents in the run. Documents with no reviewer submissions produce
 * comparisons with empty reviewer fields.
 *
 * @param runResult  The complete benchmark execution result.
 * @param session    The human review session containing all submissions.
 * @returns          An immutable ComparisonResult.
 */
export function compareResults(
  runResult: BenchmarkRunResult,
  session: HumanReviewSession,
): ComparisonResult {
  const comparisons: DocumentComparison[] = [];

  for (const record of runResult.records) {
    const submissions = getSubmissionsForDocument(session, record.corpusId);
    comparisons.push(compareDocument(record, submissions));
  }

  return Object.freeze({
    documentCount: runResult.records.length,
    comparisons: Object.freeze(comparisons),
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function compareDocument(
  record: ExecutionRecord,
  submissions: readonly ReviewerSubmission[],
): DocumentComparison {
  const { corpusId } = record;
  const reviewerClasses = collectReviewerClasses(submissions);

  if (!record.evaluationResult.ok) {
    return Object.freeze({
      corpusId,
      evaluatorDecision: null,
      evaluatorIssueClasses: Object.freeze<DraIssueClass[]>([]),
      reviewerSubmissions: Object.freeze([...submissions]),
      agreedIssueClasses: Object.freeze<DraIssueClass[]>([]),
      evaluatorOnlyClasses: Object.freeze<DraIssueClass[]>([]),
      reviewerOnlyClasses: Object.freeze([...reviewerClasses]),
      decisionComparisons: Object.freeze<DecisionComparison[]>([]),
    });
  }

  const evaluatorDecision = record.evaluationResult.decision;
  const evaluatorClasses = collectEvaluatorClasses(record);
  const evalSet = new Set(evaluatorClasses);
  const reviewerSet = new Set(reviewerClasses);

  const agreed = ([...evalSet] as DraIssueClass[]).filter((c) => reviewerSet.has(c));
  const evaluatorOnly = ([...evalSet] as DraIssueClass[]).filter((c) => !reviewerSet.has(c));
  const reviewerOnly = ([...reviewerSet] as DraIssueClass[]).filter((c) => !evalSet.has(c));

  const decisionComparisons: DecisionComparison[] = submissions.map((s) =>
    Object.freeze({
      reviewerId: s.reviewerId,
      evaluatorDecision,
      reviewerRecommendation: s.recommendation,
      agreed: s.recommendation === evaluatorDecision,
    }),
  );

  return Object.freeze({
    corpusId,
    evaluatorDecision,
    evaluatorIssueClasses: Object.freeze(evaluatorClasses),
    reviewerSubmissions: Object.freeze([...submissions]),
    agreedIssueClasses: Object.freeze(agreed),
    evaluatorOnlyClasses: Object.freeze(evaluatorOnly),
    reviewerOnlyClasses: Object.freeze(reviewerOnly),
    decisionComparisons: Object.freeze(decisionComparisons),
  });
}

/** Extracts deduplicated issue classes from a successful evaluation record. */
function collectEvaluatorClasses(record: ExecutionRecord): DraIssueClass[] {
  if (!record.evaluationResult.ok) return [];
  const classes = record.evaluationResult.issues.map((i) => i.issueClass);
  return [...new Set(classes)] as DraIssueClass[];
}

/** Extracts deduplicated issue classes from all reviewer submissions. */
function collectReviewerClasses(
  submissions: readonly ReviewerSubmission[],
): DraIssueClass[] {
  const allClasses = submissions.flatMap((s) => s.issues.map((i) => i.issueClass));
  return [...new Set(allClasses)] as DraIssueClass[];
}
