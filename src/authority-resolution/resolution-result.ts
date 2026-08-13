/**
 * DRA-001 — Stage 3: Authority Resolution — Result Types
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Discriminated success/failure union for Stage 3.
 * Stage 3 identifies attribution only. It must not produce:
 *   - evidence relationships
 *   - issue instances
 *   - assurance decisions (SUPPORTED / REVIEW / HOLD)
 *   - confidence scores
 *   - proof receipts
 */

import type { DraValidationError } from "../model/index.js";
import type { AuthorityRecord, Stage3ResolutionRecord } from "./authority-record.js";

// ---------------------------------------------------------------------------
// Stage 3 identifier
// ---------------------------------------------------------------------------

export const STAGE_3_ID = "STAGE_3_AUTHORITY_RESOLUTION" as const;
export type Stage3Id = typeof STAGE_3_ID;

export const STAGE_3_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Stage3Success
// ---------------------------------------------------------------------------

/**
 * A successful Stage 3 authority resolution result.
 *
 * Guarantees:
 *   - Every Stage 2 statement has exactly one authority record.
 *   - Authority records are ordered by statementIndex (ascending).
 *   - Authority spans satisfy: content.slice(start, end) === authorityText.
 *   - Zero authority records is valid when Stage 2 produced zero statements.
 *
 * Does NOT confirm:
 *   - factual correctness of statements;
 *   - evidence support;
 *   - source credibility or independence;
 *   - materiality;
 *   - any issue class;
 *   - any assurance decision.
 */
export interface Stage3Success {
  readonly ok: true;
  readonly stageId: Stage3Id;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /**
   * One authority record per extracted statement, ordered by statementIndex.
   * May be empty if Stage 2 produced zero statements (this is valid, not a failure).
   */
  readonly authorityRecords: ReadonlyArray<AuthorityRecord>;
  /** Structured record of Stage 3 processing. */
  readonly resolutionRecord: Stage3ResolutionRecord;
  /** Non-fatal warnings generated during authority resolution. */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage3Failure
// ---------------------------------------------------------------------------

/**
 * A failed Stage 3 authority resolution result.
 *
 * Produced for invalid input, malformed Stage 2 records, span violations,
 * identifier collisions, or broken statement references.
 * No authority records are produced.
 */
export interface Stage3Failure {
  readonly ok: false;
  readonly stageId: Stage3Id;
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage3Result
// ---------------------------------------------------------------------------

/**
 * The result of Stage 3 authority resolution.
 *
 * Discriminate on `ok`:
 *   - `ok === true` → Stage3Success (access authorityRecords)
 *   - `ok === false` → Stage3Failure (access errors)
 */
export type Stage3Result = Stage3Success | Stage3Failure;
