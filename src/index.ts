/**
 * @workspace/dra-reference
 *
 * DRA-001 — Document Release Assurance, Version 1
 * Reference evaluator package. Canonical data model established at DRA-ENG-002.
 *
 * Scientific foundation: CTS v0.1 Executive Technical Overview
 * (source commit 17cb968, publication commit 7af039c).
 *
 * STATUS: Version 1 canonical data model implemented.
 * Evaluator pipeline implementation begins at DRA-ENG-003 (Input Normalisation).
 *
 * This package is separate from cts-reference. DRA must not import, extend,
 * or reuse CTS evaluator source code as implementation logic.
 *
 * Public surface:
 *   - Canonical constants (decisions, issue classes, pipeline stages, versions)
 *   - TypeScript types
 *   - Zod runtime schemas
 *   - Validation-error types and helpers
 *   - Invariant-check functions
 *   - Validation helpers per entity
 *
 * Not exported:
 *   - Evaluator functions (exposed via evaluateDocument below)
 *   - Internal pipeline stage state
 */

// ---------------------------------------------------------------------------
// Scaffold version constants (DRA-ENG-001)
// ---------------------------------------------------------------------------

export const DRA_VERSION = "0.1.0";
export const DRA_PROGRAMME = "DRA-001";
// Benchmark corpus infrastructure
export * from "./benchmark/index.js";

export const DRA_STATUS =
  "Deterministic contract hardened (identifier validation, digest, datetime semantics) at DRA-ENG-008B";

// ---------------------------------------------------------------------------
// Canonical data model (DRA-ENG-002)
// ---------------------------------------------------------------------------

export * from "./model/index.js";

// ---------------------------------------------------------------------------
// Stage 1: Input Normalisation (DRA-ENG-003)
// ---------------------------------------------------------------------------

export {
  // Entry point
  normaliseEvaluationRequest,
  // Result types
  type Stage1Result,
  type Stage1Success,
  type Stage1Failure,
  type NormalisedEvaluationRequest,
  type NormalisationRecord,
  type NormalisationEntityCounts,
  // Constants
  STAGE_1_ID,
  STAGE_1_VERSION,
  // String utilities
  normaliseLineEndings,
  trimMetadata,
  normaliseContentField,
  normaliseMetadataField,
  normaliseOptionalMetadataField,
  // Document normalisation helpers
  normaliseSourceDocument,
  normaliseSourceDocuments,
  normaliseGeneratedDocument,
  checkSourceDocumentRefs,
  checkDocumentIdentitySeparation,
  // Statement normalisation helpers
  normaliseSpanReference,
  normaliseMaterialStatement,
  normaliseMaterialStatements,
  // Evidence normalisation helpers
  normaliseEvidenceUnit,
  normaliseEvidenceUnits,
  normaliseEvidenceRelationships,
} from "./normalisation/index.js";

// ---------------------------------------------------------------------------
// Stage 2: Claim Extraction (DRA-ENG-004)
// ---------------------------------------------------------------------------

export {
  // Entry point
  extractClaims,
  // Result types
  type Stage2Result,
  type Stage2Success,
  type Stage2Failure,
  type Stage2Id,
  // Extraction record types
  type ExtractionRecord,
  type RejectionRecord,
  type ExclusionReason,
  // Constants
  STAGE_2_ID,
  STAGE_2_VERSION,
  EXTRACTION_RULE_VERSION,
  // Segmentation utilities
  segmentContent,
  type ContentSegment,
  type SegmentType,
  // Classification utilities
  classifySegments,
  MIN_CANDIDATE_CHARS,
  type ClassifiedSegment,
  type CandidateStatus,
  // Statement identifier utilities
  makeStatementId,
  parseStatementId,
  STAGE_2_STATEMENT_ID_PREFIX,
  // Span integrity
  validateSpan,
  validateAllSpans,
} from "./claim-extraction/index.js";

// ---------------------------------------------------------------------------
// Stage 3: Authority Resolution (DRA-ENG-005)
// ---------------------------------------------------------------------------

export {
  // Entry point
  resolveAuthority,
  // Result types
  type Stage3Result,
  type Stage3Success,
  type Stage3Failure,
  type Stage3Id,
  // Classification model
  AUTHORITY_CLASSIFICATIONS,
  AUTHORITY_TYPES,
  isAuthorityClassification,
  isAuthorityType,
  type AuthorityClassification,
  type AuthorityType,
  // Record types
  type AuthorityRecord,
  type AuthoritySpan,
  type StatementSpan,
  type Stage3ResolutionRecord,
  // Constants
  STAGE_3_ID,
  STAGE_3_VERSION,
  RESOLUTION_RULE_VERSION,
  // Attribution detection
  detectAttribution,
  detectAuthorityType,
  // Span validation
  validateAuthoritySpan,
  // Record identifiers
  makeAuthorityRecordId,
  parseAuthorityRecordId,
  STAGE_3_RECORD_ID_PREFIX,
} from "./authority-resolution/index.js";

// ---------------------------------------------------------------------------
// Stage 5: Materiality Assessment (DRA-ENG-007)
// ---------------------------------------------------------------------------

export {
  // Entry point
  assessMateriality,
  // Result types
  type Stage5Result,
  type Stage5Success,
  type Stage5Failure,
  type Stage5Id,
  // Classification model
  MATERIALITY_CLASSIFICATIONS,
  isMaterialityClassification,
  materialityPriority,
  type MaterialityClassification,
  // Record types
  type MaterialityRecord,
  type Stage5AssessmentRecord,
  type StructuralContext,
  // Constants
  STAGE_5_ID,
  STAGE_5_VERSION,
  ASSESSMENT_RULE_VERSION,
  // Materiality rule engine
  classifyMateriality,
  type MaterialityDetectionResult,
  // Structural analysis
  analyseStructure,
  // Record identifiers
  makeMaterialityRecordId,
  parseMaterialityRecordId,
  STAGE_5_RECORD_ID_PREFIX,
} from "./materiality-assessment/index.js";

// ---------------------------------------------------------------------------
// Stage 4: Evidence Linkage (DRA-ENG-006)
// ---------------------------------------------------------------------------

export {
  // Entry point
  linkEvidence,
  // Result types
  type Stage4Result,
  type Stage4Success,
  type Stage4Failure,
  type Stage4Id,
  // Classification model
  EVIDENCE_CLASSIFICATIONS,
  EVIDENCE_TYPES,
  isEvidenceClassification,
  isEvidenceType,
  type EvidenceClassification,
  type EvidenceType,
  // Record types
  type EvidenceRecord,
  type EvidenceSpan,
  type Stage4LinkageRecord,
  // Constants
  STAGE_4_ID,
  STAGE_4_VERSION,
  LINKAGE_RULE_VERSION,
  // Linkage rule detection
  detectEvidence,
  type EvidenceMatch,
  type LinkageDetectionResult,
  // Span validation
  validateEvidenceSpan,
  // Record identifiers
  makeEvidenceRecordId,
  parseEvidenceRecordId,
  STAGE_4_RECORD_ID_PREFIX,
} from "./evidence-linkage/index.js";

// ---------------------------------------------------------------------------
// Stage 6: Consistency Check (DRA-ENG-008)
// ---------------------------------------------------------------------------

export {
  // Entry point
  checkConsistency,
  CONSISTENCY_CHECK_VERSION,
  // Issue detection
  detectIssues,
  // Result types
  type Stage6Result,
  type Stage6Success,
  type Stage6Failure,
  type Stage6Id,
  // Constants
  STAGE_6_ID,
  STAGE_6_VERSION,
} from "./consistency-check/index.js";

// ---------------------------------------------------------------------------
// Stage 7: Confidence Scoring (DRA-ENG-008)
// ---------------------------------------------------------------------------

export {
  // Entry point
  scoreConfidence,
  CONFIDENCE_RULE_VERSION,
  STAGE_7_VERSION,
  // Confidence level
  CONFIDENCE_LEVELS,
  isConfidenceLevel,
  confidencePriority,
  type ConfidenceLevel,
  CONFIDENCE_SCORING_RULE_VERSION,
  // Result types
  type Stage7Result,
  type Stage7Success,
  type Stage7Failure,
  type Stage7Id,
  type ConfidenceRecord,
  // Constants
  STAGE_7_ID,
  STAGE_7_RESULT_VERSION,
} from "./confidence-scoring/index.js";

// ---------------------------------------------------------------------------
// Pipeline Integration — evaluateDocument (DRA-ENG-009, DRA-ENG-010)
// ---------------------------------------------------------------------------

export {
  // Top-level evaluator entry point
  evaluateDocument,
  // Result types
  type DocumentAssuranceEvaluation,
  type DocumentAssuranceSuccess,
  type DocumentAssuranceFailure,
  // Decision derivation
  deriveDecision,
  type DecisionResult,
  // Proof receipt builder
  buildProofReceipt,
  type BuildReceiptParams,
  // Canonical serialisation and integrity verification
  canonicalJsonStringify,
  computeDigestFromPayload,
  verifyReceiptIntegrity,
  extractDocumentIdentitySubstantive,
  type SubstantivePayloadInput,
} from "./pipeline/index.js";

// ---------------------------------------------------------------------------
// Shared Utilities (DRA-ENG-008B)
// ---------------------------------------------------------------------------

export {
  IdentifierValidationError,
  tryExtractId,
  requireId,
  buildStatementIdMap,
} from "./shared/index.js";
