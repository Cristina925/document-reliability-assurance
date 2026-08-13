/**
 * DRA-001 — Benchmark Corpus — Public Surface
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 */

// Schema, enumerations, types
export {
  CORPUS_SCHEMA_VERSION,
  CORPUS_ID_REGEX,
  RECOGNISED_CORPUS_SCHEMA_VERSIONS,
  DOMAINS,
  DOCUMENT_TYPES,
  DIFFICULTIES,
  BENCHMARK_STATUSES,
  SOURCE_TYPES,
  CorpusIdSchema,
  CorpusDocumentInputSchema,
  CorpusDocumentSchema,
  CorpusManifestSchema,
  CorpusSchemaVersionSchema,
  DomainSchema,
  DocumentTypeSchema,
  DifficultySchema,
  BenchmarkStatusSchema,
  SourceTypeSchema,
  corpusIdSequence,
  tryParseCorpusId,
} from "./schema.js";

export type {
  CorpusSchemaVersion,
  RecognisedCorpusSchemaVersion,
  CorpusId,
  Domain,
  DocumentType,
  Difficulty,
  BenchmarkStatus,
  SourceType,
  CreationMethod,
  CorpusDocumentInput,
  CorpusDocument,
  CorpusManifest,
} from "./schema.js";

// Integrity
export {
  computeCorpusDocumentDigest,
  verifyCorpusDocumentIntegrity,
  computeManifestDigest,
  verifyManifestIntegrity,
} from "./integrity.js";

// Registry
export { CorpusRegistry, CorpusRegistryError } from "./registry.js";
export type { CorpusRegistryErrorCode } from "./registry.js";

// Manifest helpers
export { CORPUS_SCHEMA_VERSION as MANIFEST_SCHEMA_VERSION } from "./manifest.js";

// Validation
export {
  validateCorpusId,
  validateCorpusDocumentInput,
  validateCorpusDocument,
  validateRegistryIntegrity,
  validateManifest,
  validateManifestAgainstRegistry,
} from "./validation.js";

export type {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  ValidationErrorCode,
} from "./validation.js";

// Loader
export { loadCorpus } from "./loader.js";
export type {
  LoadResult,
  LoadSuccess,
  LoadFailure,
  LoadErrorCode,
} from "./loader.js";
