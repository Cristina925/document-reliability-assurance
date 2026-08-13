/**
 * DRA-001-06 — Human Review Model
 *
 * Models independent human reviewer submissions for benchmark documents.
 * Reviewer data is kept entirely separate from evaluator outputs.
 *
 * Design:
 *   - HumanReviewSession is an immutable value — operations return new sessions.
 *   - Multiple reviewers may submit for the same document.
 *   - Reviewer identifiers are opaque strings; no reviewer identity is validated.
 */

import type { CorpusId } from "../corpus/schema.js";
import type { DraIssueClass } from "../../model/issue-classes.js";
import type { IssueSeverity } from "../../model/issues.js";
import type { AssuranceDecision } from "../../model/decisions.js";

// ---------------------------------------------------------------------------
// ReviewerConfidence
// ---------------------------------------------------------------------------

/** A reviewer's self-reported confidence in their submission. */
export const REVIEWER_CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;
export type ReviewerConfidence = (typeof REVIEWER_CONFIDENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// ReviewIssueSubmission
// ---------------------------------------------------------------------------

/**
 * A single issue submitted by a human reviewer.
 * Uses the same frozen nine issue classes as the evaluator (DRA-001 §6).
 */
export interface ReviewIssueSubmission {
  /** Issue class — one of the nine canonical DRA-001 classes. */
  readonly issueClass: DraIssueClass;
  /** Reviewer-assigned severity for this issue. */
  readonly severity: IssueSeverity;
  /** Reviewer's explanation of why they identified this issue. */
  readonly explanation: string;
}

// ---------------------------------------------------------------------------
// ReviewerSubmission
// ---------------------------------------------------------------------------

/**
 * All findings from one reviewer for one corpus document.
 * Submitted independently of any evaluator output.
 */
export interface ReviewerSubmission {
  /** Opaque reviewer identifier (e.g. "reviewer-1", "analyst-A"). */
  readonly reviewerId: string;
  /** The corpus document this submission relates to. */
  readonly corpusId: CorpusId;
  /** UTC ISO-8601 timestamp at which this submission was recorded. */
  readonly submittedAt: string;
  /** All issues this reviewer identified. May be empty. */
  readonly issues: readonly ReviewIssueSubmission[];
  /** The reviewer's overall assurance recommendation. */
  readonly recommendation: AssuranceDecision;
  /** The reviewer's confidence in their recommendation. */
  readonly confidence: ReviewerConfidence;
  /** Optional free-text notes from the reviewer. */
  readonly notes?: string;
}

// ---------------------------------------------------------------------------
// HumanReviewSession
// ---------------------------------------------------------------------------

/**
 * An immutable collection of reviewer submissions for a benchmark run.
 * Multiple reviewers may submit for the same document.
 * Reviewer data must remain separate from evaluator outputs.
 */
export interface HumanReviewSession {
  readonly sessionId: string;
  /** UTC ISO-8601 datetime at which this session was created. */
  readonly createdAt: string;
  /** All reviewer submissions across all documents. */
  readonly submissions: readonly ReviewerSubmission[];
}

// ---------------------------------------------------------------------------
// Factory and operations (all return new immutable sessions)
// ---------------------------------------------------------------------------

/** Creates a new empty HumanReviewSession. */
export function createReviewSession(
  sessionId: string,
  createdAt: string,
): HumanReviewSession {
  return Object.freeze({
    sessionId,
    createdAt,
    submissions: Object.freeze<ReviewerSubmission[]>([]),
  });
}

/**
 * Returns a new HumanReviewSession with the submission appended.
 * The original session is unchanged.
 */
export function addSubmission(
  session: HumanReviewSession,
  submission: ReviewerSubmission,
): HumanReviewSession {
  return Object.freeze({
    ...session,
    submissions: Object.freeze([...session.submissions, submission]),
  });
}

/** Returns all submissions for a given corpus document. */
export function getSubmissionsForDocument(
  session: HumanReviewSession,
  corpusId: CorpusId,
): readonly ReviewerSubmission[] {
  return session.submissions.filter((s) => s.corpusId === corpusId);
}

/** Returns the deduplicated set of reviewer IDs in this session. */
export function getReviewerIds(session: HumanReviewSession): readonly string[] {
  return [...new Set(session.submissions.map((s) => s.reviewerId))];
}

/** Returns all submissions from a specific reviewer. */
export function getSubmissionsByReviewer(
  session: HumanReviewSession,
  reviewerId: string,
): readonly ReviewerSubmission[] {
  return session.submissions.filter((s) => s.reviewerId === reviewerId);
}

/** Returns the total number of submissions in this session. */
export function submissionCount(session: HumanReviewSession): number {
  return session.submissions.length;
}
