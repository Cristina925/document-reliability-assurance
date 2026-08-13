/**
 * DRA-001 — Benchmark Governance Module — Public Surface
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 */

// Version
export {
  CORPUS_VERSION_REGEX,
  INITIAL_CORPUS_VERSION,
  CorpusVersionSchema,
  parseCorpusVersion,
  isValidCorpusVersion,
  incrementMajor,
  incrementMinor,
  incrementPatch,
  compareCorpusVersions,
} from "./version.js";
export type { CorpusVersion, ParsedCorpusVersion } from "./version.js";

// Exclusions
export {
  EXCLUSION_REASONS,
  ExclusionReasonSchema,
  computeExclusionDigest,
  buildExclusionRecord,
} from "./exclusions.js";
export type { ExclusionReason, ExclusionRecord } from "./exclusions.js";

// Near-duplicate governance
export {
  NGRAM_SIZE,
  NEAR_DUPLICATE_JACCARD_THRESHOLD,
  MANUAL_REVIEW_JACCARD_THRESHOLD,
  normaliseText,
  computeNgramSet,
  jaccardSimilarity,
  assessDuplicate,
} from "./near-duplicate.js";
export type {
  DuplicateStatus,
  DuplicateAssessment,
} from "./near-duplicate.js";

// Protocol schema and lifecycle
export {
  PROTOCOL_STATUSES,
  ProtocolStatusSchema,
  VALID_PROTOCOL_TRANSITIONS,
  BenchmarkSelectionProtocolSchema,
  computeProtocolDigest,
  createProtocol,
  transitionProtocol,
  canAdmitDocuments,
  buildMinimalProtocol,
  ProtocolTransitionError,
} from "./schema.js";
export type {
  ProtocolStatus,
  BenchmarkSelectionProtocol,
  ProtocolInput,
  ProtocolTransitionErrorCode,
} from "./schema.js";

// Eligibility and content boundary
export {
  CONTENT_TYPES,
  ContentTypeSchema,
  ContentPayloadSchema,
  CorpusCandidateSchema,
  computeContentDigest,
  buildContentPayload,
  verifyContentIntegrity,
  checkEligibility,
} from "./eligibility.js";
export type {
  ContentType,
  ContentPayload,
  CorpusCandidate,
  EligibilityResult,
} from "./eligibility.js";

// Allocation
export {
  validateAllocationTotals,
  AllocationTracker,
} from "./allocation.js";
export type {
  AllocationCell,
  AllocationSnapshot,
  AllocationValidationResult,
  AllocationValidationErrorCode,
} from "./allocation.js";

// Admissions
export {
  AdmissionRegistry,
  computeAdmissionDigest,
} from "./admissions.js";
export type {
  AdmissionDecision,
  AdmissionRecord,
} from "./admissions.js";

// Freeze
export {
  FrozenCorpus,
  CorpusAlreadyFrozenError,
  computeFreezeDigest,
  freezeCorpus,
  verifyCorpusFreeze,
} from "./freeze.js";
export type { FreezeRecord } from "./freeze.js";

// Amendment
export {
  AmendmentError,
  computeAmendmentDigest,
  createAmendmentRecord,
} from "./amendment.js";
export type {
  CompatibilityClassification,
  EntryChangeType,
  ChangedEntry,
  AmendmentRecord,
  AmendmentErrorCode,
} from "./amendment.js";
