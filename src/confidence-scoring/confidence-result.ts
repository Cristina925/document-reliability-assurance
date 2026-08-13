/**
 * DRA-001 — Stage 7: Confidence Scoring — Result Types
 *
 * Milestone: DRA-ENG-008 (Confidence Scoring, spec Stage 6)
 * Spec reference: DRA-001 §5, Stage 6 "Confidence Scoring"
 *
 * Defines Stage7Result: the discriminated success/failure union produced by
 * scoreConfidence(). On success, carries one ConfidenceRecord per statement
 * and aggregate level counts.
 *
 * Stage 7 does not produce:
 *   - assurance decisions
 *   - proof receipts
 *   - issue instances
 *   - downstream semantic judgements beyond per-claim level assignment
 */

import type { DraValidationError } from "../model/index.js";
import type { ConfidenceLevel } from "./confidence-level.js";

// ---------------------------------------------------------------------------
// Stage 7 identifier
// ---------------------------------------------------------------------------

export const STAGE_7_ID = "STAGE_7_CONFIDENCE_SCORING" as const;
export type Stage7Id = typeof STAGE_7_ID;

export const STAGE_7_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// ConfidenceRecord — one per statement
// ---------------------------------------------------------------------------

/**
 * The confidence scoring record for a single extracted statement.
 * Produced by Stage 7 for every statement from Stage 2.
 */
export interface ConfidenceRecord {
  /** Stage 2 statement identifier (preserved unchanged). */
  readonly statementId: string;
  /** Zero-based index of this statement in the Stage 2 output array. */
  readonly statementIndex: number;
  /** Assigned confidence level. */
  readonly level: ConfidenceLevel;
  /** Human-readable rationale for the assigned level. */
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// Stage7Success
// ---------------------------------------------------------------------------

export interface Stage7Success {
  readonly ok: true;
  readonly stageId: Stage7Id;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /** Number of statements evaluated (equals Stage 2 statement count). */
  readonly statementCount: number;
  /** Confidence records in ascending statementIndex order. */
  readonly confidenceRecords: ReadonlyArray<ConfidenceRecord>;
  /** Count of records per confidence level (all 4 levels always present). */
  readonly levelCounts: Readonly<Record<ConfidenceLevel, number>>;
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage7Failure
// ---------------------------------------------------------------------------

export interface Stage7Failure {
  readonly ok: false;
  readonly stageId: Stage7Id;
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage7Result — discriminated union
// ---------------------------------------------------------------------------

export type Stage7Result = Stage7Success | Stage7Failure;
