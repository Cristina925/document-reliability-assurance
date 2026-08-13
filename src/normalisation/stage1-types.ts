/**
 * DRA-001 — Stage 1: Input Normalisation — Result Types
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Defines the public result types produced by Stage 1 normalisation:
 *   - Stage1Result       — discriminated success/failure union
 *   - Stage1Success      — successful normalisation with normalised request
 *   - Stage1Failure      — failed normalisation with structured errors
 *   - NormalisationRecord — structured record of Stage 1 processing
 *
 * Stage 1 must not produce decisions, issue instances, or proof receipts.
 */

import type { EvaluationRequest } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";

// ---------------------------------------------------------------------------
// Stage 1 identifier
// ---------------------------------------------------------------------------

/** The canonical identifier for Stage 1 of the DRA pipeline. */
export const STAGE_1_ID = "STAGE_1_INPUT_NORMALISATION" as const;
export type Stage1Id = typeof STAGE_1_ID;

/** Internal version of the Stage 1 implementation. */
export const STAGE_1_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// NormalisedEvaluationRequest
// ---------------------------------------------------------------------------

/**
 * A normalised evaluation request produced by Stage 1.
 *
 * Structurally identical to EvaluationRequest but guaranteed to have been:
 *   - validated against the canonical runtime model;
 *   - string-metadata fields trimmed;
 *   - document content fields line-ending-normalised;
 *   - source documents sorted deterministically by id;
 *   - internal reference integrity checked;
 *   - duplicate identifiers rejected.
 *
 * This type is an alias: the normalised request passes the same Zod schema
 * as EvaluationRequest. The distinction is process-provenance, not structure.
 */
export type NormalisedEvaluationRequest = EvaluationRequest;

// ---------------------------------------------------------------------------
// NormalisationRecord
// ---------------------------------------------------------------------------

/** Entity count snapshot used in the normalisation record. */
export interface NormalisationEntityCounts {
  /** Number of source documents. */
  readonly sourceDocuments: number;
  /**
   * Number of material statements (always 0 at Stage 1 — statements
   * are not present in the EvaluationRequest; they are produced at Stage 2).
   */
  readonly statements: number;
  /**
   * Number of evidence units (always 0 at Stage 1 — evidence units
   * are produced at Stage 4).
   */
  readonly evidenceUnits: number;
  /**
   * Number of evidence relationships (always 0 at Stage 1 — evidence
   * relationships are produced at Stage 4).
   */
  readonly evidenceRelationships: number;
}

/**
 * A structured record of Stage 1 processing.
 *
 * Records which fields were normalised, which collections were reordered,
 * and counts of entities in input and output.
 *
 * This is NOT the proof receipt. It does not contain quality findings or
 * assurance decisions.
 */
export interface NormalisationRecord {
  /** Stage identifier. */
  readonly stageId: Stage1Id;
  /** Stage implementation version. */
  readonly stageVersion: string;
  /**
   * DRA model version of the normalised output.
   * Always equals DRA_MODEL_VERSION for this implementation.
   */
  readonly outputModelVersion: string;
  /**
   * DRA pipeline version of the normalised output.
   * Always equals DRA_PIPELINE_VERSION for this implementation.
   */
  readonly outputPipelineVersion: string;
  /**
   * Dot-separated field paths that were canonicalised during normalisation.
   * Sorted lexicographically for determinism.
   */
  readonly fieldsNormalised: ReadonlyArray<string>;
  /**
   * Names of collections that were reordered for determinism.
   * Sorted lexicographically for determinism.
   */
  readonly collectionsReordered: ReadonlyArray<string>;
  /** Entity counts from the raw (pre-normalisation) input. */
  readonly inputEntityCounts: NormalisationEntityCounts;
  /** Entity counts from the normalised output. Should equal input counts. */
  readonly outputEntityCounts: NormalisationEntityCounts;
  /**
   * Non-fatal warnings produced during normalisation.
   * Warnings do not cause rejection; they record informational observations.
   */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage1Success
// ---------------------------------------------------------------------------

/**
 * A successful Stage 1 normalisation result.
 *
 * Confirms:
 *   - the input was structurally valid;
 *   - the input was successfully normalised to canonical form;
 *   - the normalised request is ready for Stage 2 (Claim Extraction).
 *
 * Does NOT confirm document quality, claim accuracy, or evidence adequacy.
 */
export interface Stage1Success {
  /** Discriminant: this result is a success. */
  readonly ok: true;
  /** Stage 1 identifier. */
  readonly stageId: Stage1Id;
  /** DRA pipeline version used during normalisation. */
  readonly pipelineVersion: string;
  /** DRA model version of the normalised output. */
  readonly modelVersion: string;
  /**
   * The normalised evaluation request.
   * Safe to pass to Stage 2 (Claim Extraction).
   */
  readonly normalisedRequest: NormalisedEvaluationRequest;
  /** Structured record of Stage 1 processing. */
  readonly normalisationRecord: NormalisationRecord;
  /**
   * Non-fatal warnings. Present when normalisation succeeded but
   * informational observations were recorded.
   */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Stage1Failure
// ---------------------------------------------------------------------------

/**
 * A failed Stage 1 normalisation result.
 *
 * The input was invalid or could not be normalised to canonical form.
 * No normalised request is present. No decision is produced.
 *
 * Failures are deterministic: the same invalid input always produces
 * the same set of errors in the same order.
 */
export interface Stage1Failure {
  /** Discriminant: this result is a failure. */
  readonly ok: false;
  /** Stage 1 identifier. */
  readonly stageId: Stage1Id;
  /** Deterministic ordered collection of structured validation errors. */
  readonly errors: ReadonlyArray<DraValidationError>;
  /** Number of errors (convenience field; equals errors.length). */
  readonly errorCount: number;
}

// ---------------------------------------------------------------------------
// Stage1Result
// ---------------------------------------------------------------------------

/**
 * The result type of Stage 1 normalisation.
 *
 * Discriminate on `ok`:
 *   - `ok === true` → Stage1Success (access normalisedRequest)
 *   - `ok === false` → Stage1Failure (access errors)
 *
 * @example
 * ```typescript
 * const result = normaliseEvaluationRequest(rawInput);
 * if (result.ok) {
 *   // result.normalisedRequest is ready for Stage 2
 * } else {
 *   // result.errors contains structured validation errors
 * }
 * ```
 */
export type Stage1Result = Stage1Success | Stage1Failure;
