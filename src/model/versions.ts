/**
 * DRA-001 — Schema and Pipeline Version Metadata
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical schema version for the DRA-001 Version 1 data model
 * and the pipeline version. These values are frozen for Version 1.
 *
 * Schema version 0.1.0 reflects a pre-production reference implementation
 * as required by DRA-001 §9 ("Reference implementation only").
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical version constants
// ---------------------------------------------------------------------------

/**
 * Canonical schema/model version for DRA-001 Version 1.
 * Frozen at DRA-ENG-002. Do not change without a specification update.
 * This is the DATA MODEL schema version; it remains frozen even when the
 * evaluator version increments.
 */
export const DRA_MODEL_VERSION = "0.1.0" as const;

/**
 * Prior evaluator version (DRA-EVAL-002), incorporating DRA-FIX-001
 * (Boundary-Constrained Claim Extraction) and DRA-FIX-002 (Deterministic
 * Semantic Evidence Matching). Superseded by DRA_EVALUATOR_VERSION at
 * DRA-ENG-014, but RETAINED (not removed) as a recognised schema version so
 * that historical proof receipts stamped "0.1.1" remain a recognised,
 * interpretable evaluatorVersion value. Frozen historical benchmark data
 * (e.g. DRA-BMK-021) that carries this version is never regenerated or
 * rewritten — it remains valid, immutable evidence of prior evaluator
 * behaviour, per the same append-only versioning precedent DRA-EVAL-002
 * itself established over DRA_MODEL_VERSION.
 */
export const DRA_EVALUATOR_VERSION_0_1_1 = "0.1.1" as const;

/**
 * Evaluator version for the corrected evaluator incorporating DRA-ENG-014
 * (Versioned EL-STANDARD-REF Defect Correction — the EN-family branch of
 * EL-STANDARD-REF now requires an exact-case uppercase "EN" token rather
 * than matching case-insensitively, eliminating the demonstrated collision
 * with ordinary Spanish/French "en"/"En"; see DRA-CHK-004, DRA-ENG-012,
 * DRA-ENG-013). Introduced at DRA-ENG-014.
 *
 * This version is stamped on proof receipts in EvaluatorIdentity.evaluatorVersion.
 * The data model schema version (DRA_MODEL_VERSION) is unchanged at 0.1.0.
 * The pipeline version (DRA_PIPELINE_VERSION) is unchanged at 1.0 — this
 * correction does not alter pipeline stage composition or invocation
 * contract, only Stage 4's EL-STANDARD-REF rule content.
 */
export const DRA_EVALUATOR_VERSION = "0.1.2" as const;

/**
 * Canonical pipeline version corresponding to the frozen 7-stage pipeline
 * defined in DRA-001 §5.  Unchanged by DRA-FIX-001/DRA-FIX-002 (no contract
 * change to the pipeline stages).
 */
export const DRA_PIPELINE_VERSION = "1.0" as const;

/**
 * Set of recognised schema versions. Runtime validation rejects any value
 * not in this set.
 *
 * Append-only: DRA_EVALUATOR_VERSION_0_1_1 remains listed after the
 * DRA-ENG-014 correction so that historical proof receipts/benchmark
 * records stamped with the prior evaluator version continue to validate
 * against this schema. This mirrors the precedent DRA-EVAL-002 established
 * when it added DRA_EVALUATOR_VERSION alongside (not instead of)
 * DRA_MODEL_VERSION.
 */
export const RECOGNISED_SCHEMA_VERSIONS = [
  DRA_MODEL_VERSION,
  DRA_EVALUATOR_VERSION_0_1_1,
  DRA_EVALUATOR_VERSION,
] as const;

export type RecognisedSchemaVersion =
  (typeof RECOGNISED_SCHEMA_VERSIONS)[number];

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

export const SchemaVersionSchema = z.enum(
  RECOGNISED_SCHEMA_VERSIONS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Schema version must be one of: ${RECOGNISED_SCHEMA_VERSIONS.join(", ")}`,
    }),
  },
);

/** Returns true if the version string is a recognised DRA schema version. */
export function isRecognisedSchemaVersion(
  value: unknown,
): value is RecognisedSchemaVersion {
  return RECOGNISED_SCHEMA_VERSIONS.includes(
    value as RecognisedSchemaVersion,
  );
}
