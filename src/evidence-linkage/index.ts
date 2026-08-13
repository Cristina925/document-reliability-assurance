/**
 * DRA-001 — Stage 4: Evidence Linkage — Public Surface
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * @module dra-reference/evidence-linkage
 */

// Entry point
export { linkEvidence, LINKAGE_RULE_VERSION } from "./link-evidence.js";

// Result types
export { STAGE_4_ID, STAGE_4_VERSION } from "./linkage-result.js";
export type {
  Stage4Result,
  Stage4Success,
  Stage4Failure,
  Stage4Id,
} from "./linkage-result.js";

// Evidence classification
export {
  EVIDENCE_CLASSIFICATIONS,
  EVIDENCE_TYPES,
  isEvidenceClassification,
  isEvidenceType,
} from "./evidence-classification.js";
export type {
  EvidenceClassification,
  EvidenceType,
} from "./evidence-classification.js";

// Record types
export type {
  EvidenceRecord,
  EvidenceSpan,
  StatementSpan,
  Stage4LinkageRecord,
} from "./evidence-record.js";

// Linkage rule detection
export { detectEvidence } from "./linkage-rules.js";
export type {
  EvidenceMatch,
  LinkageDetectionResult,
} from "./linkage-rules.js";

// Semantic paraphrase detection (DRA-FIX-002)
export { detectSemanticParaphrase } from "./semantic-paraphrase.js";
export type { SemanticParaphraseResult } from "./semantic-paraphrase.js";

// Span validation
export { validateEvidenceSpan } from "./evidence-span-validation.js";

// Record identifiers
export {
  makeEvidenceRecordId,
  parseEvidenceRecordId,
  STAGE_4_RECORD_ID_PREFIX,
} from "./record-identifiers.js";
