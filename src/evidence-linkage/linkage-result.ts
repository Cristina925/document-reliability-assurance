/**
 * DRA-001 — Stage 4: Evidence Linkage — Result Types
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Discriminated success/failure union for Stage 4.
 * Stage 4 records evidence relationships only. It must not produce:
 *   - credibility judgements
 *   - materiality assessments
 *   - issue instances
 *   - assurance decisions (SUPPORTED / REVIEW / HOLD)
 *   - confidence scores
 *   - proof receipts
 */

import type { DraValidationError } from "../model/index.js";
import type { EvidenceRecord, Stage4LinkageRecord } from "./evidence-record.js";

// ---------------------------------------------------------------------------
// Stage 4 identifier
// ---------------------------------------------------------------------------

export const STAGE_4_ID = "STAGE_4_EVIDENCE_LINKAGE" as const;
export type Stage4Id = typeof STAGE_4_ID;

export const STAGE_4_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Stage4Success
// ---------------------------------------------------------------------------

/**
 * A successful Stage 4 evidence linkage result.
 *
 * Guarantees:
 *   - Every Stage 2 statement has exactly one evidence record.
 *   - Evidence records are ordered by statementIndex (ascending).
 *   - Evidence spans satisfy: content.slice(start, end) === evidenceText.
 *   - Zero evidence records is valid when Stage 2 produced zero statements.
 *
 * Does NOT confirm:
 *   - factual correctness of statements;
 *   - source credibility or independence;
 *   - evidence sufficiency or quality;
 *   - materiality;
 *   - any issue class;
 *   - any assurance decision.
 */
export interface Stage4Success {
  readonly ok: true;
  readonly stageId: Stage4Id;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /**
   * One evidence record per extracted statement, ordered by statementIndex.
   * May be empty if Stage 2 produced zero statements (valid, not a failure).
   */
  readonly evidenceRecords: ReadonlyArray<EvidenceRecord>;
  /** Structured record of Stage 4 processing. */
  readonly linkageRecord: Stage4LinkageRecord;
  /** Non-fatal warnings generated during evidence linkage. */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage4Failure
// ---------------------------------------------------------------------------

/**
 * A failed Stage 4 evidence linkage result.
 *
 * Produced for invalid input, malformed Stage 2/3 records, span violations,
 * identifier collisions, or broken statement references.
 * No evidence records are produced.
 */
export interface Stage4Failure {
  readonly ok: false;
  readonly stageId: Stage4Id;
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage4Result
// ---------------------------------------------------------------------------

/**
 * The result of Stage 4 evidence linkage.
 *
 * Discriminate on `ok`:
 *   - `ok === true` → Stage4Success (access evidenceRecords)
 *   - `ok === false` → Stage4Failure (access errors)
 */
export type Stage4Result = Stage4Success | Stage4Failure;
