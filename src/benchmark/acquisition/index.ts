/**
 * DRA-001 — Corpus Acquisition Module — Public Surface
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 */

// Provenance
export {
  LICENCE_STATUSES,
  ACQUISITION_SOURCES,
  buildProvenance,
  computeProvenanceDigest,
  verifyProvenanceIntegrity,
  isProvenanceComplete,
} from "./provenance.js";
export type {
  LicenceStatus,
  AcquisitionSource,
  ProvenanceRecord,
} from "./provenance.js";

// Acquisition pipeline
export {
  AcquisitionPipeline,
  AcquisitionError,
} from "./pipeline.js";
export type {
  AcquisitionInput,
  AcquiredDocument,
  AcquisitionErrorCode,
} from "./pipeline.js";

// Candidate registry
export {
  CandidateRegistry,
  computeEntryDigest,
} from "./candidate-registry.js";
export type { CandidateRegistryEntry } from "./candidate-registry.js";

// Corpus validator
export { validateCorpus } from "./corpus-validator.js";
export type {
  ValidationCheck,
  CorpusValidationResult,
} from "./corpus-validator.js";

// Reports
export {
  generateInitialCorpusReport,
  generateStatisticsReport,
  generateProvenanceReport,
  generateValidationReport,
  generateFreezeReport,
} from "./reports.js";
export type {
  DimensionStatistic,
  InitialCorpusReport,
  CorpusStatisticsReport,
  ProvenanceReportEntry,
  ProvenanceReport,
  ValidationCheckSummary,
  ValidationReport,
  FreezeReport,
} from "./reports.js";

// ── DRA-ENG-009: Governed Acquisition and Freeze Pipeline ──────────────────

// Schema — acquisition request and source-assessment contracts
export {
  SUPPORTED_MEDIA_TYPES,
  isSupportedMediaType,
  ACQUISITION_ID_REGEX,
  AcquisitionIdSchema,
  AcquisitionRequestSchema,
  OFFICIAL_SOURCE_ASSESSMENT_STATUSES,
  OfficialSourceAssessmentSchema,
  ACQUISITION_PIPELINE_STAGES,
} from "./schema.js";
export type {
  SupportedMediaType,
  AcquisitionId,
  AcquisitionRequest,
  OfficialSourceAssessmentStatus,
  OfficialSourceAssessment,
  AcquisitionPipelineStage,
  AcquisitionPipelineError,
} from "./schema.js";

// Request — validation and ID helpers
export {
  createAcquisitionRequest,
  validateSourceUrl,
  formatAcquisitionId,
} from "./request.js";
export type { RequestValidationResult } from "./request.js";

// Fetcher — injectable source-fetching abstraction
export {
  DEFAULT_MAX_SOURCE_BYTES,
  createMockFetcher,
} from "./fetcher.js";
export type {
  AcquiredSource,
  HttpResponseHeaders,
  SourceFetchErrorCode,
  SourceFetchResult,
  SourceFetcherOptions,
  SourceFetcher,
  MockFetcherResponse,
} from "./fetcher.js";

// HTTP Fetcher — production HTTPS/HTTP acquisition adapter (DRA-ENG-010)
export { createHttpFetcher } from "./http-fetcher.js";
export type { HttpFetcherOptions } from "./http-fetcher.js";

// Licence — governed licence assessment
export {
  LICENCE_ASSESSMENT_STATUSES,
  LICENCE_BASIS_VALUES,
  LicenceAssessmentSchema,
  isLicenceApproved,
  isPublicDomainBasis,
} from "./licence.js";
export type {
  LicenceAssessmentStatus,
  LicenceBasis,
  LicenceAssessment,
} from "./licence.js";

// Metadata — extraction and approval
export {
  METADATA_SOURCES,
  METADATA_CONFIDENCE_LEVELS,
  computeWordCount,
  extractMetadataFromHtml,
  extractMetadataFromMarkdown,
  extractMetadataFromPlainText,
} from "./metadata.js";
export type {
  MetadataSource,
  MetadataConfidence,
  ExtractedMetadataField,
  DocumentMetadata,
  ApprovedMetadata,
} from "./metadata.js";

// Normalisation — byte-level content normalisation
export {
  NORMALISATION_VERSION,
  normaliseContent,
} from "./normalisation.js";
export type {
  PdfExtractor,
  NormalisedDocument,
  NormalisationResult,
  NormalisationErrorCode,
} from "./normalisation.js";

// Integrity — per-document digest primitives
export {
  computeSourceDigest,
  verifySourceDigest,
  verifyTextDigest,
  computeApprovedMetadataDigest,
  verifyApprovedMetadataDigest,
  computeAcquisitionFreezeRecordDigest,
} from "./integrity.js";

// Eligibility — per-document freeze eligibility assessment
export {
  checkFreezeEligibility,
} from "./eligibility.js";
export type {
  FreezeEligibilityCheck,
  FreezeBlockingReason,
  FreezeEligibilityResult,
} from "./eligibility.js";

// Freeze — per-document immutable freeze record
export {
  ACQUISITION_FREEZE_RECORD_ID_REGEX,
  formatFreezeRecordId,
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
} from "./freeze.js";
export type {
  AcquisitionFreezeRecord,
  CreateAcquisitionFreezeRecordInput,
} from "./freeze.js";

// Manifest integration — corpus registry and manifest integration
export {
  buildCorpusDocumentInput,
  integrateWithCorpus,
} from "./manifest-integration.js";
export type {
  CorpusIntegrationResult,
  CorpusIntegrationErrorCode,
} from "./manifest-integration.js";

// Governed pipeline — main orchestration
export {
  acquireFreezeAndEvaluate,
  evaluateFrozenBenchmarkDocument,
} from "./governed-pipeline.js";
export type {
  BenchmarkProofReference,
  BenchmarkDocumentResult,
  AcquisitionDependencies,
  AcquireFreezeAndEvaluateInput,
  AcquireFreezeAndEvaluateResult,
  FrozenBenchmarkEvaluationInput,
  FrozenBenchmarkEvaluationResult,
} from "./governed-pipeline.js";
