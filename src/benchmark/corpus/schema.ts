/**
 * DRA-001 — Benchmark Corpus Schema
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * Defines the typed schema, enumerations, and corpus identifier contract
 * for the DRA-001 benchmark corpus.
 *
 * Design constraints:
 *   - No evaluator decisions, reviewer scores, or benchmark outcomes.
 *   - All enumerations are exhaustive and strongly typed.
 *   - Corpus identifiers are permanent, unique, and never reused.
 *   - integrityDigest is computed from all substantive fields and excluded
 *     from its own digest computation (anti-circularity).
 */

import { z } from "zod";
import { CorpusVersionSchema } from "../governance/version.js";

// ---------------------------------------------------------------------------
// Corpus schema version
// ---------------------------------------------------------------------------

/**
 * Version of the corpus schema format itself.
 * Frozen for DRA-001-04A. Increment when the schema changes in a way
 * that requires migration of stored documents.
 */
export const CORPUS_SCHEMA_VERSION = "1.0" as const;
export type CorpusSchemaVersion = typeof CORPUS_SCHEMA_VERSION;

export const RECOGNISED_CORPUS_SCHEMA_VERSIONS = [
  CORPUS_SCHEMA_VERSION,
] as const;
export type RecognisedCorpusSchemaVersion =
  (typeof RECOGNISED_CORPUS_SCHEMA_VERSIONS)[number];

export const CorpusSchemaVersionSchema = z.enum(
  RECOGNISED_CORPUS_SCHEMA_VERSIONS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Corpus schema version must be one of: ${RECOGNISED_CORPUS_SCHEMA_VERSIONS.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Corpus identifier
// ---------------------------------------------------------------------------

/**
 * Regex for the permanent corpus document identifier.
 * Format: DRA-DOC-NNNN (exactly four decimal digits).
 * Example: DRA-DOC-0001
 */
export const CORPUS_ID_REGEX = /^DRA-DOC-\d{4}$/;

export const CorpusIdSchema = z
  .string()
  .regex(CORPUS_ID_REGEX, {
    message:
      "Corpus ID must match the format DRA-DOC-NNNN (e.g. DRA-DOC-0001)",
  });

export type CorpusId = z.infer<typeof CorpusIdSchema>;

/** Validates and returns a CorpusId, or null if the value does not match. */
export function tryParseCorpusId(value: unknown): CorpusId | null {
  if (typeof value !== "string") return null;
  const result = CorpusIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Returns the numeric sequence number from a CorpusId (e.g. 1 for DRA-DOC-0001). */
export function corpusIdSequence(id: CorpusId): number {
  return parseInt(id.slice(-4), 10);
}

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const DomainSchema = z.enum([
  "GENERAL",
  "BUSINESS",
  "TECHNICAL",
  "LEGAL",
  "HEALTHCARE",
  "FINANCE",
]);
export type Domain = z.infer<typeof DomainSchema>;
export const DOMAINS = DomainSchema.options;

export const DocumentTypeSchema = z.enum([
  "SUMMARY",
  "REWRITE",
  "REPORT",
  "EMAIL",
  "POLICY",
  "PROCEDURE",
  "ARTICLE",
  "OTHER",
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export const DOCUMENT_TYPES = DocumentTypeSchema.options;

export const DifficultySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type Difficulty = z.infer<typeof DifficultySchema>;
export const DIFFICULTIES = DifficultySchema.options;

export const BenchmarkStatusSchema = z.enum(["DRAFT", "READY", "FROZEN"]);
export type BenchmarkStatus = z.infer<typeof BenchmarkStatusSchema>;
export const BENCHMARK_STATUSES = BenchmarkStatusSchema.options;

export const SourceTypeSchema = z.enum([
  "HUMAN_AUTHORED",
  "AI_GENERATED",
  "HYBRID",
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;
export const SOURCE_TYPES = SourceTypeSchema.options;

export const CreationMethodSchema = z
  .string()
  .min(1, "Creation method must not be empty");
export type CreationMethod = z.infer<typeof CreationMethodSchema>;

// ---------------------------------------------------------------------------
// CorpusDocumentInput — substantive fields (digest is not yet computed)
// ---------------------------------------------------------------------------

/**
 * Input type accepted by the registry when adding a corpus document.
 * Does not include integrityDigest (computed by the registry on add).
 */
export const CorpusDocumentInputSchema = z.object({
  /** Permanent, unique, deterministic, immutable corpus document identifier. */
  corpusId: CorpusIdSchema,

  /** Human-readable document title. */
  title: z.string().min(1, "Title must not be empty"),

  /** How the source content was originated. */
  sourceType: SourceTypeSchema,

  /** Category of the document. */
  documentType: DocumentTypeSchema,

  /** Subject domain of the document. */
  domain: DomainSchema,

  /**
   * Language of the document.
   * Stored as a BCP-47 language tag string (e.g. "en", "en-GB").
   */
  language: z.string().min(1, "Language must not be empty"),

  /** Name of the person, system, or tool that generated the content. */
  generator: z.string().min(1, "Generator must not be empty"),

  /** Version of the generator, if known. */
  generatorVersion: z.string().optional(),

  /** Description of how the document was created. */
  creationMethod: CreationMethodSchema,

  /** Expected difficulty for the evaluator. */
  difficulty: DifficultySchema,

  /**
   * Reference to the source material used to generate the document.
   * May be a URL, citation, or internal reference key.
   */
  sourceReference: z.string().min(1, "Source reference must not be empty"),

  /** Current lifecycle status of this benchmark document. */
  benchmarkStatus: BenchmarkStatusSchema,

  /** Optional free-text notes. */
  notes: z.string().optional(),
});

export type CorpusDocumentInput = z.infer<typeof CorpusDocumentInputSchema>;

// ---------------------------------------------------------------------------
// CorpusDocument — stored document with integrity digest
// ---------------------------------------------------------------------------

/**
 * A fully-registered corpus document, including the integrity digest
 * computed from all substantive fields.
 */
export const CorpusDocumentSchema = CorpusDocumentInputSchema.extend({
  /**
   * SHA-256 (hex) digest of the canonical serialisation of all substantive
   * fields.  The digest itself is excluded from its own computation.
   * A 64-character lowercase hex string.
   */
  integrityDigest: z.string().length(64, {
    message: "Integrity digest must be a 64-character hex string",
  }),
});

export type CorpusDocument = z.infer<typeof CorpusDocumentSchema>;

// ---------------------------------------------------------------------------
// CorpusManifest — registry snapshot
// ---------------------------------------------------------------------------

/**
 * A point-in-time snapshot of the corpus registry state.
 * Used for deterministic verification of corpus completeness and order.
 */
export const CorpusManifestSchema = z.object({
  /** Version of the corpus schema format. */
  schemaVersion: CorpusSchemaVersionSchema,

  /**
   * User-level version of this corpus instance.
   * Must match format DRA-CORPUS-X.Y.Z (e.g. DRA-CORPUS-1.0.0).
   */
  corpusVersion: CorpusVersionSchema,

  /** Number of documents registered at manifest export time. */
  documentCount: z.number().int().nonnegative(),

  /**
   * Ordered list of corpus document identifiers.
   * Canonical order: ascending by numeric sequence number.
   */
  documentIds: z.array(CorpusIdSchema),

  /**
   * SHA-256 (hex) digest of the canonical serialisation of the manifest
   * substantive fields (schemaVersion, corpusVersion, documentCount,
   * documentIds in canonical order).  64-character lowercase hex string.
   */
  overallDigest: z.string().length(64),
});

export type CorpusManifest = z.infer<typeof CorpusManifestSchema>;
