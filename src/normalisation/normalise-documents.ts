/**
 * DRA-001 — Stage 1: Input Normalisation — Document Normalisation
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Normalises SourceDocument and GeneratedDocument structures
 * already supplied in the EvaluationRequest.
 *
 * Permitted operations:
 *   - Structural validation (via canonical model, applied before calling this module)
 *   - Required-field validation
 *   - Format-value validation (enum formats)
 *   - Line-ending normalisation of content fields
 *   - Trimming of metadata fields
 *   - Source and generated-document identity separation check
 *
 * Prohibited operations:
 *   - Loading files
 *   - Parsing PDFs
 *   - OCR
 *   - Text extraction
 *   - Content segmentation
 *   - Summarisation
 *   - Rewriting generated content
 *   - Comparing source and generated documents
 */

import type { SourceDocument, GeneratedDocument } from "../model/index.js";
import {
  normaliseContentField,
  normaliseMetadataField,
  normaliseOptionalMetadataField,
} from "./normalise-strings.js";
import type { DraValidationError } from "../model/index.js";
import { DRA_ERROR_CODES } from "../model/index.js";

// ---------------------------------------------------------------------------
// Source document normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a single SourceDocument.
 *
 * Fields normalised:
 *   - title          → trimmed (metadata field)
 *   - author         → trimmed (metadata field, optional)
 *   - version        → trimmed (metadata field, optional)
 *   - provenanceNotes → trimmed (metadata field, optional)
 *   - contentRef     → trimmed (metadata field, optional)
 *   - content        → line endings normalised (content field, NOT trimmed)
 *
 * Fields preserved exactly:
 *   - id             → preserved (identifier, must not be altered)
 *   - format         → preserved (enum value)
 *   - publishedAt    → preserved (timestamp, already validated by Zod)
 *   - ingestedAt     → preserved (timestamp, already validated by Zod)
 *
 * Returns a new object; does not mutate the input.
 */
export function normaliseSourceDocument(doc: SourceDocument): {
  document: SourceDocument;
  fieldsNormalised: string[];
} {
  const fieldsNormalised: string[] = [];

  // Title: trim
  const normalisedTitle = normaliseMetadataField(doc.title);
  if (normalisedTitle !== doc.title) {
    fieldsNormalised.push("sourceDocuments[].title");
  }

  // Content: line endings only (not trimmed)
  let normalisedContent = doc.content;
  if (doc.content !== undefined) {
    const nc = normaliseContentField(doc.content);
    if (nc !== doc.content) {
      fieldsNormalised.push("sourceDocuments[].content");
    }
    normalisedContent = nc;
  }

  // Author: trim (optional)
  const normalisedAuthor = normaliseOptionalMetadataField(doc.author);
  if (normalisedAuthor !== doc.author && doc.author !== undefined) {
    fieldsNormalised.push("sourceDocuments[].author");
  }

  // Version: trim (optional)
  const normalisedVersion = normaliseOptionalMetadataField(doc.version);
  if (normalisedVersion !== doc.version && doc.version !== undefined) {
    fieldsNormalised.push("sourceDocuments[].version");
  }

  // ProvenanceNotes: trim (optional)
  const normalisedProvenanceNotes = normaliseOptionalMetadataField(doc.provenanceNotes);
  if (normalisedProvenanceNotes !== doc.provenanceNotes && doc.provenanceNotes !== undefined) {
    fieldsNormalised.push("sourceDocuments[].provenanceNotes");
  }

  // ContentRef: trim (optional)
  const normalisedContentRef = normaliseOptionalMetadataField(doc.contentRef);
  if (normalisedContentRef !== doc.contentRef && doc.contentRef !== undefined) {
    fieldsNormalised.push("sourceDocuments[].contentRef");
  }

  const document: SourceDocument = {
    id: doc.id,
    title: normalisedTitle,
    content: normalisedContent,
    contentRef: normalisedContentRef,
    format: doc.format,
    version: normalisedVersion,
    author: normalisedAuthor,
    publishedAt: doc.publishedAt,
    ingestedAt: doc.ingestedAt,
    provenanceNotes: normalisedProvenanceNotes,
  };

  return { document, fieldsNormalised };
}

/**
 * Normalises a collection of SourceDocuments.
 *
 * Also:
 *   - Checks for duplicate source document IDs (returns errors if found).
 *   - Sorts the collection by id (lexicographic) for deterministic output.
 *
 * Returns:
 *   - normalised and sorted documents
 *   - errors for duplicate IDs
 *   - fields normalised
 *   - whether the collection was reordered
 */
export function normaliseSourceDocuments(docs: ReadonlyArray<SourceDocument>): {
  documents: SourceDocument[];
  errors: DraValidationError[];
  fieldsNormalised: string[];
  reordered: boolean;
} {
  const errors: DraValidationError[] = [];
  const seenIds = new Set<string>();
  const allFieldsNormalised: string[] = [];

  // Check for duplicate IDs
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]!;
    if (seenIds.has(doc.id)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: `sourceDocuments[${i}].id`,
        message: `Duplicate source document identifier: "${doc.id}"`,
        received: doc.id,
      });
    } else {
      seenIds.add(doc.id);
    }
  }

  if (errors.length > 0) {
    return { documents: [], errors, fieldsNormalised: [], reordered: false };
  }

  // Normalise each document
  const normalisedDocs: SourceDocument[] = docs.map((doc) => {
    const { document, fieldsNormalised } = normaliseSourceDocument(doc);
    allFieldsNormalised.push(...fieldsNormalised);
    return document;
  });

  // Sort by id for deterministic output
  const sorted = [...normalisedDocs].sort((a, b) => a.id.localeCompare(b.id));
  const reordered = sorted.some((doc, i) => doc.id !== normalisedDocs[i]!.id);

  return {
    documents: sorted,
    errors: [],
    fieldsNormalised: [...new Set(allFieldsNormalised)],
    reordered,
  };
}

// ---------------------------------------------------------------------------
// Generated document normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a GeneratedDocument.
 *
 * Fields normalised:
 *   - title          → trimmed (metadata field)
 *   - content        → line endings normalised (content field, NOT trimmed)
 *
 * Fields preserved exactly:
 *   - id                → preserved (identifier)
 *   - sourceDocumentIds → preserved (references, validated separately)
 *   - generatedAt       → preserved (timestamp)
 *   - generatorMetadata → preserved (opaque metadata)
 *
 * Returns a new object; does not mutate the input.
 */
export function normaliseGeneratedDocument(doc: GeneratedDocument): {
  document: GeneratedDocument;
  fieldsNormalised: string[];
} {
  const fieldsNormalised: string[] = [];

  // Title: trim
  const normalisedTitle = normaliseMetadataField(doc.title);
  if (normalisedTitle !== doc.title) {
    fieldsNormalised.push("generatedDocument.title");
  }

  // Content: line endings only
  const normalisedContent = normaliseContentField(doc.content);
  if (normalisedContent !== doc.content) {
    fieldsNormalised.push("generatedDocument.content");
  }

  const document: GeneratedDocument = {
    id: doc.id,
    title: normalisedTitle,
    content: normalisedContent,
    sourceDocumentIds: [...doc.sourceDocumentIds],
    generatedAt: doc.generatedAt,
    generatorMetadata: doc.generatorMetadata,
  };

  return { document, fieldsNormalised };
}

// ---------------------------------------------------------------------------
// Reference integrity: sourceDocumentIds
// ---------------------------------------------------------------------------

/**
 * Validates that every ID in generatedDocument.sourceDocumentIds resolves
 * to a source document in the provided collection.
 *
 * Note: An empty sourceDocumentIds array is valid at Stage 1 — source documents
 * may be associated at request time or later. Stage 4 (Evidence Linkage)
 * requires at least one resolved source document; Stage 1 only validates
 * structural integrity.
 *
 * Returns errors for any unresolved references.
 */
export function checkSourceDocumentRefs(
  sourceDocumentIds: ReadonlyArray<string>,
  availableSourceDocIds: ReadonlySet<string>,
): DraValidationError[] {
  const errors: DraValidationError[] = [];
  for (let i = 0; i < sourceDocumentIds.length; i++) {
    const refId = sourceDocumentIds[i]!;
    if (!availableSourceDocIds.has(refId)) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: `generatedDocument.sourceDocumentIds[${i}]`,
        message: `generatedDocument.sourceDocumentIds[${i}] references source document "${refId}" which is not present in sourceDocuments`,
        received: refId,
      });
    }
  }
  return errors;
}

/**
 * Validates that the generated document and source documents have distinct IDs.
 * A generated document must not have the same ID as any source document.
 */
export function checkDocumentIdentitySeparation(
  generatedDocId: string,
  sourceDocIds: ReadonlySet<string>,
): DraValidationError[] {
  if (sourceDocIds.has(generatedDocId)) {
    return [
      {
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: "generatedDocument.id",
        message: `Generated document id "${generatedDocId}" conflicts with a source document id`,
        received: generatedDocId,
      },
    ];
  }
  return [];
}
