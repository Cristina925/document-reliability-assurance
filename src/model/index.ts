/**
 * DRA-001 — Canonical Data Model Public Surface
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Re-exports the complete canonical model from all sub-modules.
 * This is the single entry point for the model layer within @workspace/dra-reference.
 *
 * Exported surface:
 *   - Canonical constants (decisions, issue classes, pipeline stages, versions)
 *   - TypeScript types (inferred from Zod schemas)
 *   - Zod runtime schemas (for external validation)
 *   - Validation-error types and helpers
 *   - Invariant-check functions
 *   - Validation helpers per entity
 *
 * NOT exported from this module:
 *   - Evaluator functions
 *   - Pipeline execution
 *   - Decision calculation
 *   - Content generation
 */

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------
export {
  EvaluationIdSchema,
  SourceDocumentIdSchema,
  GeneratedDocumentIdSchema,
  StatementIdSchema,
  EvidenceUnitIdSchema,
  IssueIdSchema,
  ProofReceiptIdSchema,
  EvaluationResultIdSchema,
  EvidenceRelationshipIdSchema,
  isValidIdentifier,
} from "./identifiers.js";
export type {
  EvaluationId,
  SourceDocumentId,
  GeneratedDocumentId,
  StatementId,
  EvidenceUnitId,
  IssueId,
  ProofReceiptId,
  EvaluationResultId,
  EvidenceRelationshipId,
} from "./identifiers.js";

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------
export {
  DRA_MODEL_VERSION,
  DRA_EVALUATOR_VERSION,
  DRA_EVALUATOR_VERSION_0_1_1,
  DRA_PIPELINE_VERSION,
  RECOGNISED_SCHEMA_VERSIONS,
  SchemaVersionSchema,
  isRecognisedSchemaVersion,
} from "./versions.js";
export type { RecognisedSchemaVersion } from "./versions.js";

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------
export {
  ASSURANCE_DECISIONS,
  AssuranceDecisionSchema,
  isAssuranceDecision,
} from "./decisions.js";
export type { AssuranceDecision } from "./decisions.js";

// ---------------------------------------------------------------------------
// Issue classes
// ---------------------------------------------------------------------------
export {
  ISSUE_CLASSES,
  ISSUE_CLASS_CODES,
  ISSUE_CLASS_TO_CODE,
  DraIssueClassSchema,
  isDraIssueClass,
  getIssueClassCode,
  ISSUE_CLASS_CODE_VALUES,
  IssueClassCodeSchema,
  isIssueClassCode,
  getIssueClassFromCode,
} from "./issue-classes.js";
export type { DraIssueClass, IssueClassCode } from "./issue-classes.js";

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------
export {
  PIPELINE_STAGES,
  PIPELINE_STAGE_COUNT,
  PIPELINE_STAGE_METADATA,
  PipelineStageNameSchema,
  PipelineStageNumberSchema,
  getStageMetadata,
  getExpectedStageName,
  isPipelineStageName,
} from "./pipeline-stages.js";
export type {
  PipelineStageName,
  PipelineStageNumber,
  PipelineStageMetadata,
} from "./pipeline-stages.js";

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------
export {
  DRA_ERROR_CODES,
  DraValidationErrorSchema,
  validationFailure,
  singleError,
  VALIDATION_OK,
  mergeValidationResults,
} from "./validation-errors.js";
export type {
  DraErrorCode,
  DraValidationError,
  DraValidationResult,
} from "./validation-errors.js";

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------
export {
  SOURCE_DOCUMENT_FORMATS,
  SourceDocumentFormatSchema,
  SourceDocumentSchema,
  GeneratedDocumentSchema,
  validateSourceDocument,
  validateGeneratedDocument,
} from "./documents.js";
export type {
  SourceDocumentFormat,
  SourceDocument,
  GeneratedDocument,
} from "./documents.js";

// ---------------------------------------------------------------------------
// Statements
// ---------------------------------------------------------------------------
export {
  MATERIALITY_LEVELS,
  MaterialityLevelSchema,
  SpanReferenceSchema,
  MaterialStatementSchema,
  validateMaterialStatement,
} from "./statements.js";
export type {
  MaterialityLevel,
  SpanReference,
  MaterialStatement,
} from "./statements.js";

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------
export {
  EVIDENCE_RELATIONSHIP_TYPES,
  EvidenceRelationshipTypeSchema,
  EvidenceUnitSchema,
  EvidenceRelationshipSchema,
  validateEvidenceUnit,
  validateEvidenceRelationship,
} from "./evidence.js";
export type {
  EvidenceUnit,
  EvidenceRelationshipType,
  EvidenceRelationship,
} from "./evidence.js";

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------
export {
  ISSUE_SEVERITIES,
  IssueSeveritySchema,
  DraIssueSchema,
  IssueSummarySchema,
  summariseIssues,
  validateDraIssue,
} from "./issues.js";
export type { IssueSeverity, DraIssue, IssueSummary } from "./issues.js";

// ---------------------------------------------------------------------------
// Proof receipts
// ---------------------------------------------------------------------------
export {
  DocumentIdentitySchema,
  EvaluatorIdentitySchema,
  StageRecordSchema,
  ProofReceiptSchema,
  DEFAULT_EVALUATOR_PIPELINE_VERSION,
  validateProofReceipt,
} from "./proof-receipts.js";
export type {
  DocumentIdentity,
  EvaluatorIdentity,
  StageRecord,
  ProofReceipt,
} from "./proof-receipts.js";

// ---------------------------------------------------------------------------
// Evaluation
//
// Note: ConfidenceIndicator is intentionally NOT exported from this surface.
// It is deferred to DRA-ENG-008 (Confidence Scoring).
// See AMBIGUITY-002 disposition in DRA-ENG-002AR.
// ---------------------------------------------------------------------------
export {
  EvaluationRequestSchema,
  EvaluationResultSchema,
  validateEvaluationRequest,
  validateEvaluationResult,
} from "./evaluation.js";
export type {
  EvaluationRequest,
  EvaluationResult,
} from "./evaluation.js";

// ---------------------------------------------------------------------------
// Invariants
// ---------------------------------------------------------------------------
export {
  checkIdentifierUniqueness,
  checkStatementReferences,
  checkEvidenceUnitReferences,
  checkIssueReferences,
  checkStageRecordInvariants,
  checkIssueClassCount,
  checkDecisionCount,
  checkTimestamp,
  checkTimestampOrder,
  checkSchemaVersion,
  checkEvaluationIdentityConsistency,
  checkEvaluationResultInvariants,
} from "./invariants.js";
export type { EvaluationIdentityBundle } from "./invariants.js";
