/**
 * DRA-001 — Stage 5: Materiality Assessment — Result Types
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Discriminated success/failure union for Stage 5.
 * Stage 5 assigns materiality classifications only. It must not produce:
 *   - credibility judgements
 *   - issue instances
 *   - assurance decisions (SUPPORTED / REVIEW / HOLD)
 *   - confidence scores
 *   - proof receipts
 *   - factual correctness assessments
 *   - evidence quality assessments
 */

import type { DraValidationError } from "../model/index.js";
import type { MaterialityRecord, Stage5AssessmentRecord } from "./materiality-record.js";

// ---------------------------------------------------------------------------
// Stage 5 identifier
// ---------------------------------------------------------------------------

export const STAGE_5_ID = "STAGE_5_MATERIALITY_ASSESSMENT" as const;
export type Stage5Id = typeof STAGE_5_ID;

export const STAGE_5_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Stage5Success
// ---------------------------------------------------------------------------

/**
 * A successful Stage 5 materiality assessment result.
 *
 * Guarantees:
 *   - Every Stage 2 statement has exactly one materiality record.
 *   - Materiality records are ordered by statementIndex (ascending).
 *   - Classification is deterministic: identical input always produces identical output.
 *   - Zero materiality records is valid when Stage 2 produced zero statements.
 *
 * Does NOT confirm:
 *   - factual correctness of statements;
 *   - source credibility or independence;
 *   - evidence sufficiency or quality;
 *   - any issue class;
 *   - any assurance decision.
 */
export interface Stage5Success {
  readonly ok: true;
  readonly stageId: Stage5Id;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /**
   * One materiality record per extracted statement, ordered by statementIndex.
   * May be empty if Stage 2 produced zero statements (valid, not a failure).
   */
  readonly materialityRecords: ReadonlyArray<MaterialityRecord>;
  /** Structured summary of Stage 5 processing. */
  readonly assessmentRecord: Stage5AssessmentRecord;
  /** Non-fatal warnings generated during materiality assessment. */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage5Failure
// ---------------------------------------------------------------------------

/**
 * A failed Stage 5 materiality assessment result.
 *
 * Produced for invalid input, malformed Stage 2/3/4 records, identifier
 * collisions, or missing statement references.
 * No materiality records are produced.
 */
export interface Stage5Failure {
  readonly ok: false;
  readonly stageId: Stage5Id;
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage5Result
// ---------------------------------------------------------------------------

/**
 * The result of Stage 5 materiality assessment.
 *
 * Discriminate on `ok`:
 *   - `ok === true` → Stage5Success (access materialityRecords)
 *   - `ok === false` → Stage5Failure (access errors)
 */
export type Stage5Result = Stage5Success | Stage5Failure;
