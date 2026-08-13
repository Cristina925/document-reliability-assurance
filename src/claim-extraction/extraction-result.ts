/**
 * DRA-001 — Stage 2: Claim Extraction — Result Types
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Defines the public result types produced by Stage 2:
 *   - Stage2Result    — discriminated success/failure union
 *   - Stage2Success   — successful extraction with candidate statements
 *   - Stage2Failure   — failed extraction with structured errors
 *
 * Stage 2 must not produce decisions, issue instances, or proof receipts.
 * Statements are candidate material statements — their materiality is not
 * finalised at Stage 2.
 */

import type { MaterialStatement } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import type { ExtractionRecord } from "./extraction-record.js";

// ---------------------------------------------------------------------------
// Stage 2 identifier
// ---------------------------------------------------------------------------

/** The canonical identifier for Stage 2 of the DRA pipeline. */
export const STAGE_2_ID = "STAGE_2_CLAIM_EXTRACTION" as const;
export type Stage2Id = typeof STAGE_2_ID;

/** Internal version of the Stage 2 implementation. */
export const STAGE_2_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Stage2Success
// ---------------------------------------------------------------------------

/**
 * A successful Stage 2 claim extraction result.
 *
 * Confirms:
 *   - the normalised generated document was successfully segmented;
 *   - candidate material statements were extracted;
 *   - each statement has a deterministic identifier and exact span.
 *
 * Statements are CANDIDATES — their materiality is not assessed at Stage 2.
 * Zero extracted statements is valid (documents may contain no extractable
 * assertions; this is not a failure).
 *
 * Does NOT confirm:
 *   - claim correctness;
 *   - evidence support;
 *   - internal consistency;
 *   - any issue class.
 */
export interface Stage2Success {
  /** Discriminant: this result is a success. */
  readonly ok: true;
  /** Stage 2 identifier. */
  readonly stageId: Stage2Id;
  /** DRA pipeline version used during extraction. */
  readonly pipelineVersion: string;
  /** DRA model version of the extraction output. */
  readonly modelVersion: string;
  /** Identifier of the evaluation request being processed. */
  readonly evaluationId: string;
  /** Identifier of the generated document from which claims were extracted. */
  readonly generatedDocumentId: string;
  /**
   * Candidate material statements extracted from the generated document.
   * Ordered by statementIndex (ascending), which corresponds to document order.
   * May be empty if the document contains no extractable assertions.
   */
  readonly statements: ReadonlyArray<MaterialStatement>;
  /** Structured record of Stage 2 processing. */
  readonly extractionRecord: ExtractionRecord;
  /**
   * Non-fatal warnings produced during extraction.
   * Extraction succeeded despite these observations.
   */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage2Failure
// ---------------------------------------------------------------------------

/**
 * A failed Stage 2 claim extraction result.
 *
 * Extraction could not be completed due to invalid input or an internal error.
 * No candidate statements are produced.
 * No decision, issue, or proof receipt is produced.
 */
export interface Stage2Failure {
  /** Discriminant: this result is a failure. */
  readonly ok: false;
  /** Stage 2 identifier. */
  readonly stageId: Stage2Id;
  /** Deterministic ordered collection of structured errors. */
  readonly errors: ReadonlyArray<DraValidationError>;
  /** Number of errors (equals errors.length). */
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage2Result
// ---------------------------------------------------------------------------

/**
 * The result type of Stage 2 claim extraction.
 *
 * Discriminate on `ok`:
 *   - `ok === true` → Stage2Success (access statements)
 *   - `ok === false` → Stage2Failure (access errors)
 *
 * @example
 * ```typescript
 * const result = extractClaims(normalisedRequest);
 * if (result.ok) {
 *   // result.statements — candidate material statements
 * } else {
 *   // result.errors — structured extraction errors
 * }
 * ```
 */
export type Stage2Result = Stage2Success | Stage2Failure;
