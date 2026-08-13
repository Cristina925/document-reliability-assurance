/**
 * DRA-001 — Stage 5: Materiality Assessment — Public Surface
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Re-exports the full public API for Stage 5 materiality assessment.
 */

// Entry point
export { assessMateriality, ASSESSMENT_RULE_VERSION } from "./assess-materiality.js";

// Result types
export {
  STAGE_5_ID,
  STAGE_5_VERSION,
  type Stage5Id,
  type Stage5Result,
  type Stage5Success,
  type Stage5Failure,
} from "./materiality-result.js";

// Classification model
export {
  MATERIALITY_CLASSIFICATIONS,
  isMaterialityClassification,
  materialityPriority,
  type MaterialityClassification,
} from "./materiality-classification.js";

// Record types
export type {
  MaterialityRecord,
  Stage5AssessmentRecord,
  StatementSpan,
  StructuralContext,
} from "./materiality-record.js";

// Materiality rule engine
export { classifyMateriality, type MaterialityDetectionResult } from "./materiality-rules.js";

// Structural analysis
export { analyseStructure } from "./structural-analysis.js";

// Record identifiers
export {
  makeMaterialityRecordId,
  parseMaterialityRecordId,
  STAGE_5_RECORD_ID_PREFIX,
} from "./record-identifiers.js";
