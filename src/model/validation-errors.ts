/**
 * DRA-001 — Structured Validation Error Types
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical, stable representation for DRA validation errors.
 * Errors are structured and deterministic: each carries a code, path,
 * human-readable message, and optionally the received value for diagnostics.
 *
 * Validation errors must never contain secrets, credentials, or PII.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical error code constants
// ---------------------------------------------------------------------------

export const DRA_ERROR_CODES = {
  // Identifier errors
  EMPTY_IDENTIFIER: "DRA_EMPTY_IDENTIFIER",
  DUPLICATE_IDENTIFIER: "DRA_DUPLICATE_IDENTIFIER",
  UNRESOLVED_REFERENCE: "DRA_UNRESOLVED_REFERENCE",

  // Enum / literal errors
  INVALID_DECISION: "DRA_INVALID_DECISION",
  INVALID_ISSUE_CLASS: "DRA_INVALID_ISSUE_CLASS",
  INVALID_STAGE_NAME: "DRA_INVALID_STAGE_NAME",
  INVALID_STAGE_NUMBER: "DRA_INVALID_STAGE_NUMBER",
  INVALID_SCHEMA_VERSION: "DRA_INVALID_SCHEMA_VERSION",
  INVALID_SEVERITY: "DRA_INVALID_SEVERITY",
  INVALID_RELATIONSHIP_TYPE: "DRA_INVALID_RELATIONSHIP_TYPE",
  INVALID_CONFIDENCE_LEVEL: "DRA_INVALID_CONFIDENCE_LEVEL",

  // Timestamp errors
  INVALID_TIMESTAMP: "DRA_INVALID_TIMESTAMP",
  INCOHERENT_TIMESTAMPS: "DRA_INCOHERENT_TIMESTAMPS",

  // Required field errors
  MISSING_REQUIRED_FIELD: "DRA_MISSING_REQUIRED_FIELD",
  EMPTY_REQUIRED_STRING: "DRA_EMPTY_REQUIRED_STRING",

  // Collection errors
  EMPTY_REQUIRED_COLLECTION: "DRA_EMPTY_REQUIRED_COLLECTION",
  INVALID_ARRAY_ITEM: "DRA_INVALID_ARRAY_ITEM",

  // Stage-record errors
  WRONG_STAGE_COUNT: "DRA_WRONG_STAGE_COUNT",
  STAGE_ORDER_VIOLATION: "DRA_STAGE_ORDER_VIOLATION",
  STAGE_NOT_UNIQUE: "DRA_STAGE_NOT_UNIQUE",

  // Structural errors
  STRUCTURALLY_INCOMPLETE_REQUEST: "DRA_STRUCTURALLY_INCOMPLETE_REQUEST",
  STRUCTURALLY_INCOMPLETE_RESULT: "DRA_STRUCTURALLY_INCOMPLETE_RESULT",
  STRUCTURALLY_INCOMPLETE_RECEIPT: "DRA_STRUCTURALLY_INCOMPLETE_RECEIPT",

  // Invariant errors
  INVARIANT_VIOLATION: "DRA_INVARIANT_VIOLATION",

  // Stage 2 — Claim Extraction errors
  /** A span reference is structurally invalid (negative, inverted, out of range). */
  INVALID_SPAN: "DRA_INVALID_SPAN",
  /** The text of a statement does not equal the document slice at its recorded span. */
  SPAN_INTEGRITY_VIOLATION: "DRA_SPAN_INTEGRITY_VIOLATION",
  /** Two statements in the same extraction produced the same identifier. */
  STATEMENT_ID_COLLISION: "DRA_STATEMENT_ID_COLLISION",

  // Stage 3 — Authority Resolution errors
  /** An authority span is structurally invalid (negative, inverted, out of bounds). */
  INVALID_AUTHORITY_SPAN: "DRA_INVALID_AUTHORITY_SPAN",
  /** Authority text does not equal the document slice at the recorded authority span. */
  AUTHORITY_SPAN_INTEGRITY_VIOLATION: "DRA_AUTHORITY_SPAN_INTEGRITY_VIOLATION",
  /** An authority record references a statement that does not exist in the Stage 2 output. */
  MISSING_STATEMENT_REFERENCE: "DRA_MISSING_STATEMENT_REFERENCE",
  /** Two authority records share the same identifier. */
  AUTHORITY_RECORD_ID_COLLISION: "DRA_AUTHORITY_RECORD_ID_COLLISION",
  /** A statement has more than one authority record. */
  DUPLICATE_AUTHORITY_RECORD: "DRA_DUPLICATE_AUTHORITY_RECORD",
  /** Not every statement has a corresponding authority record. */
  INCOMPLETE_AUTHORITY_COVERAGE: "DRA_INCOMPLETE_AUTHORITY_COVERAGE",
  /** The Stage 2 result passed to Stage 3 is malformed or a failure result. */
  MALFORMED_STAGE2_RESULT: "DRA_MALFORMED_STAGE2_RESULT",
  /** An authority classification value is not one of the closed Version 1 set. */
  INVALID_AUTHORITY_CLASSIFICATION: "DRA_INVALID_AUTHORITY_CLASSIFICATION",

  // Stage 5 — Materiality Assessment errors
  /** A materiality classification value is not one of the closed Version 1 set. */
  INVALID_MATERIALITY_CLASSIFICATION: "DRA_INVALID_MATERIALITY_CLASSIFICATION",
  /** A statement has more than one materiality record. */
  DUPLICATE_MATERIALITY_RECORD: "DRA_DUPLICATE_MATERIALITY_RECORD",
  /** A materiality record references a statement that does not exist in the Stage 2 output. */
  UNKNOWN_STATEMENT_REFERENCE: "DRA_UNKNOWN_STATEMENT_REFERENCE",
  /** A structural context value is structurally invalid. */
  INVALID_STRUCTURAL_CONTEXT: "DRA_INVALID_STRUCTURAL_CONTEXT",
  /** A rule identifier does not match any known materiality rule. */
  INVALID_RULE_IDENTIFIER: "DRA_INVALID_RULE_IDENTIFIER",
  /** Two materiality records share the same identifier. */
  MATERIALITY_RECORD_ID_COLLISION: "DRA_MATERIALITY_RECORD_ID_COLLISION",
  /** Not every statement has a corresponding materiality record. */
  INCOMPLETE_MATERIALITY_COVERAGE: "DRA_INCOMPLETE_MATERIALITY_COVERAGE",
  /** The Stage 4 result passed to Stage 5 is malformed or a failure result. */
  MALFORMED_STAGE4_RESULT: "DRA_MALFORMED_STAGE4_RESULT",

  // Stage 4 — Evidence Linkage errors
  /** An evidence span is structurally invalid (negative, inverted, out of bounds). */
  INVALID_EVIDENCE_SPAN: "DRA_INVALID_EVIDENCE_SPAN",
  /** Evidence text does not equal the document slice at the recorded evidence span. */
  EVIDENCE_SPAN_INTEGRITY_VIOLATION: "DRA_EVIDENCE_SPAN_INTEGRITY_VIOLATION",
  /** Two evidence records share the same identifier. */
  EVIDENCE_RECORD_ID_COLLISION: "DRA_EVIDENCE_RECORD_ID_COLLISION",
  /** A statement has more than one evidence record. */
  DUPLICATE_EVIDENCE_RECORD: "DRA_DUPLICATE_EVIDENCE_RECORD",
  /** Not every statement has a corresponding evidence record. */
  INCOMPLETE_EVIDENCE_COVERAGE: "DRA_INCOMPLETE_EVIDENCE_COVERAGE",
  /** The Stage 3 result passed to Stage 4 is malformed or a failure result. */
  MALFORMED_STAGE3_RESULT: "DRA_MALFORMED_STAGE3_RESULT",
  /** An evidence classification value is not one of the closed Version 1 set. */
  INVALID_EVIDENCE_CLASSIFICATION: "DRA_INVALID_EVIDENCE_CLASSIFICATION",
  /** A structural reference (section, appendix, figure) is not resolvable within the document. */
  INVALID_STRUCTURAL_REFERENCE: "DRA_INVALID_STRUCTURAL_REFERENCE",

  // Stage 6 — Consistency Check errors
  /** The Stage 5 (Materiality Assessment) result passed to Stage 6 is malformed or a failure. */
  MALFORMED_STAGE5_RESULT: "DRA_MALFORMED_STAGE5_RESULT",

  // Stage 7 — Confidence Scoring errors
  /** The Stage 6 (Consistency Check) result passed to Stage 7 is malformed or a failure. */
  MALFORMED_STAGE6_RESULT: "DRA_MALFORMED_STAGE6_RESULT",
} as const;

export type DraErrorCode = (typeof DRA_ERROR_CODES)[keyof typeof DRA_ERROR_CODES];

// ---------------------------------------------------------------------------
// Validation error structure
// ---------------------------------------------------------------------------

/**
 * A single structured DRA validation error.
 *
 * Fields:
 *   code     — Machine-readable error code (one of DRA_ERROR_CODES).
 *   path     — Dot-separated path to the field that failed (e.g. "issues[0].issueClass").
 *   message  — Human-readable description of the failure.
 *   received — The actual value that caused the failure (omit sensitive data).
 */
export interface DraValidationError {
  readonly code: DraErrorCode;
  readonly path: string;
  readonly message: string;
  readonly received?: unknown;
}

/** The result of a DRA validation operation. */
export type DraValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: ReadonlyArray<DraValidationError> };

// ---------------------------------------------------------------------------
// Schema for DraValidationError (for testing / serialisation)
// ---------------------------------------------------------------------------

export const DraValidationErrorSchema = z.object({
  code: z.string().min(1),
  path: z.string(),
  message: z.string().min(1),
  received: z.unknown().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a single validation-failure result. */
export function validationFailure(
  errors: ReadonlyArray<DraValidationError>,
): DraValidationResult {
  return { ok: false, errors };
}

/** Creates a single-error validation failure. */
export function singleError(
  code: DraErrorCode,
  path: string,
  message: string,
  received?: unknown,
): DraValidationResult {
  return { ok: false, errors: [{ code, path, message, received }] };
}

/** The canonical success result. */
export const VALIDATION_OK: DraValidationResult = { ok: true };

/** Collects errors from multiple validation results into one result. */
export function mergeValidationResults(
  results: ReadonlyArray<DraValidationResult>,
): DraValidationResult {
  const errors: DraValidationError[] = [];
  for (const r of results) {
    if (!r.ok) {
      errors.push(...r.errors);
    }
  }
  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}
