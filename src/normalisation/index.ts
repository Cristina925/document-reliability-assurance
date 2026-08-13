/**
 * DRA-001 — Stage 1: Input Normalisation — Public Surface
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Exports the Stage 1 public interface:
 *   - normaliseEvaluationRequest — Stage 1 entry point
 *   - Stage1Result, Stage1Success, Stage1Failure — result types
 *   - NormalisedEvaluationRequest — type alias for normalised output
 *   - NormalisationRecord — Stage 1 processing record
 *   - NormalisationEntityCounts — entity count snapshot type
 *   - STAGE_1_ID, STAGE_1_VERSION — Stage 1 canonical constants
 *
 * Not exported:
 *   - Internal normalisation helper functions
 *   - Later-stage pipeline functions
 *   - Evaluator entry point
 *   - Issue detection or decision calculation
 *   - Proof receipt generation
 *
 * @module dra-reference/normalisation
 */

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export { normaliseEvaluationRequest } from "./normalise-evaluation-request.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  Stage1Result,
  Stage1Success,
  Stage1Failure,
  NormalisedEvaluationRequest,
  NormalisationRecord,
  NormalisationEntityCounts,
} from "./stage1-types.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export { STAGE_1_ID, STAGE_1_VERSION } from "./stage1-types.js";

// ---------------------------------------------------------------------------
// String utilities (exported for downstream stage use)
// ---------------------------------------------------------------------------

export {
  normaliseLineEndings,
  trimMetadata,
  normaliseContentField,
  normaliseMetadataField,
  normaliseOptionalMetadataField,
} from "./normalise-strings.js";

// ---------------------------------------------------------------------------
// Entity normalisation helpers (exported for downstream stage use)
// ---------------------------------------------------------------------------

export {
  normaliseSourceDocument,
  normaliseSourceDocuments,
  normaliseGeneratedDocument,
  checkSourceDocumentRefs,
  checkDocumentIdentitySeparation,
} from "./normalise-documents.js";

export {
  normaliseSpanReference,
  normaliseMaterialStatement,
  normaliseMaterialStatements,
} from "./normalise-statements.js";

export {
  normaliseEvidenceUnit,
  normaliseEvidenceUnits,
  normaliseEvidenceRelationships,
} from "./normalise-evidence.js";
