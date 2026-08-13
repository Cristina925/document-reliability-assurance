/**
 * DRA-001 — Source Document and Generated Document Representations
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical data structures for:
 *   - SourceDocument  — an original/reference document used as evidence.
 *   - GeneratedDocument — the AI-generated document being evaluated.
 *
 * Explicit exclusions:
 *   - No file loading, PDF parsing, OCR, or content extraction.
 *   - No AI model calls.
 *   - No content generation.
 *
 * Version 1 fields only. Do not add Version 2 fields.
 */

import { z } from "zod";
import { SourceDocumentIdSchema, GeneratedDocumentIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Source document format enum
// ---------------------------------------------------------------------------

/**
 * Recognised source-document formats for Version 1.
 * Represents the structural format of the source document, not its content.
 */
export const SOURCE_DOCUMENT_FORMATS = [
  "PLAIN_TEXT",
  "MARKDOWN",
  "PDF",
  "HTML",
  "DOCX",
  "UNKNOWN",
] as const;

export type SourceDocumentFormat = (typeof SOURCE_DOCUMENT_FORMATS)[number];

export const SourceDocumentFormatSchema = z.enum(
  SOURCE_DOCUMENT_FORMATS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Source document schema
// ---------------------------------------------------------------------------

/**
 * A source (reference) document. Source documents are the original materials
 * used as evidence against which the generated document is evaluated.
 * They are inputs to Stage 3 (Authority Resolution) and Stage 4 (Evidence Linkage).
 */
export const SourceDocumentSchema = z.object({
  /** Unique identifier for this source document. */
  id: SourceDocumentIdSchema,

  /** Human-readable title or filename for the document. */
  title: z.string().min(1, "Source document title must not be empty"),

  /**
   * Document content as a plain-text string, or a reference key if content
   * is stored externally. For Version 1, inline content is preferred for
   * reference evaluator use. May be omitted for metadata-only records.
   */
  content: z.string().optional(),

  /**
   * An opaque reference string pointing to the content if not inlined.
   * Only one of content or contentRef should be set; if both are absent,
   * the document is metadata-only.
   */
  contentRef: z.string().optional(),

  /** Structural format of the document. Defaults to UNKNOWN if not specified. */
  format: SourceDocumentFormatSchema.optional(),

  /**
   * Version string for this source document (e.g. "v2.1", "2024-01-15").
   * Free-form string; not validated beyond being non-empty if present.
   */
  version: z.string().optional(),

  /**
   * Author or authoring body of the document.
   * Free-form string for Version 1.
   */
  author: z.string().optional(),

  /**
   * ISO-8601 UTC timestamp at which this document was created or published.
   * Used for authority currency checks in Stage 3.
   */
  publishedAt: z.string().datetime({ offset: false }).optional(),

  /**
   * ISO-8601 UTC timestamp at which this document was ingested into the
   * evaluation system.
   */
  ingestedAt: z.string().datetime({ offset: false }).optional(),

  /**
   * Free-form provenance notes describing the document's origin,
   * chain of custody, or retrieval context.
   */
  provenanceNotes: z.string().optional(),
});

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

// ---------------------------------------------------------------------------
// Generated document schema
// ---------------------------------------------------------------------------

/**
 * A generated (AI-produced, summarised, rewritten, or transformed) document.
 * This is the document being assessed by the DRA evaluator.
 *
 * The generated document is the primary input to Stage 1 (Input Normalisation).
 */
export const GeneratedDocumentSchema = z.object({
  /** Unique identifier for this generated document. */
  id: GeneratedDocumentIdSchema,

  /** Human-readable title of the generated document. */
  title: z.string().min(1, "Generated document title must not be empty"),

  /**
   * The text content of the generated document, as it will be evaluated.
   * Required for Version 1 evaluation.
   */
  content: z.string().min(1, "Generated document content must not be empty"),

  /**
   * Identifiers of the source documents that were used as inputs when
   * generating this document. Used by Stage 4 (Evidence Linkage) to
   * resolve evidence references.
   *
   * May be empty if source documents are not yet associated at request time,
   * but the evaluator expects this to be populated before Stage 4 executes.
   */
  sourceDocumentIds: z.array(z.string().min(1)).default([]),

  /**
   * ISO-8601 UTC timestamp at which the document was generated or produced.
   */
  generatedAt: z.string().datetime({ offset: false }).optional(),

  /**
   * Opaque metadata about the generator (e.g. model name, prompt version).
   * For Version 1: stored as a free-form record; not validated beyond structure.
   * Must not contain secrets or credentials.
   */
  generatorMetadata: z.record(z.string(), z.unknown()).optional(),
});

export type GeneratedDocument = z.infer<typeof GeneratedDocumentSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Validates a source document; returns a Zod SafeParseReturnType. */
export function validateSourceDocument(
  value: unknown,
): z.SafeParseReturnType<unknown, SourceDocument> {
  return SourceDocumentSchema.safeParse(value);
}

/** Validates a generated document; returns a Zod SafeParseReturnType. */
export function validateGeneratedDocument(
  value: unknown,
): z.SafeParseReturnType<unknown, GeneratedDocument> {
  return GeneratedDocumentSchema.safeParse(value);
}
