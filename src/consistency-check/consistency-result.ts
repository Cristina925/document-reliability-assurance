/**
 * DRA-001 — Stage 6: Consistency Check — Result Types
 *
 * Milestone: DRA-ENG-008 — Consistency Check
 * Spec reference: DRA-001 §5, Stage 5 "Consistency Check"
 *
 * Defines Stage6Result: the discriminated success/failure union produced by
 * checkConsistency(). On success, carries all detected assurance issues
 * (DRA-001 §6 IC-1 through IC-9, those applicable to cross-stage consistency).
 *
 * Stage 6 does not produce:
 *   - confidence scores
 *   - assurance decisions
 *   - proof receipts
 *   - downstream semantic judgements
 */

import type { DraIssue, DraValidationError } from "../model/index.js";

// ---------------------------------------------------------------------------
// Stage 6 identifier
// ---------------------------------------------------------------------------

export const STAGE_6_ID = "STAGE_6_CONSISTENCY_CHECK" as const;
export type Stage6Id = typeof STAGE_6_ID;

export const STAGE_6_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Stage6Success
// ---------------------------------------------------------------------------

export interface Stage6Success {
  readonly ok: true;
  readonly stageId: Stage6Id;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /** Number of Stage 2 statements evaluated. */
  readonly statementCount: number;
  /** Total issues detected across all applicable issue classes. */
  readonly issueCount: number;
  /** Number of BLOCKING issues (triggers HOLD in Stage 7). */
  readonly blockingIssueCount: number;
  /** Number of ADVISORY issues (triggers REVIEW in Stage 7 if no BLOCKING). */
  readonly advisoryIssueCount: number;
  /** All detected assurance issues, in detection order. */
  readonly issues: ReadonlyArray<DraIssue>;
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage6Failure
// ---------------------------------------------------------------------------

export interface Stage6Failure {
  readonly ok: false;
  readonly stageId: Stage6Id;
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage6Result — discriminated union
// ---------------------------------------------------------------------------

export type Stage6Result = Stage6Success | Stage6Failure;
