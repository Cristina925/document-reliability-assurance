/**
 * DRA-001 — Stage 1: Input Normalisation — String Utilities
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Canonical string normalisation functions for Stage 1.
 *
 * Authorised normalisation transformations:
 *   1. Line-ending normalisation: \r\n and \r → \n
 *   2. Metadata trimming: trim leading/trailing whitespace from metadata fields
 *
 * Prohibited transformations:
 *   - Rewriting prose content
 *   - Correcting spelling
 *   - Altering punctuation
 *   - Translating text
 *   - Inferring missing content
 *   - Summarising content
 *   - Segmenting content
 *
 * Document text fields (content, passageText) have line endings normalised
 * but are NOT trimmed — trimming document content could remove semantically
 * significant leading or trailing text.
 *
 * Metadata fields (title, author, version, locationLabel, explanation)
 * are trimmed and line-ending-normalised.
 */

// ---------------------------------------------------------------------------
// Line-ending normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises line endings to LF (\n).
 *
 * Converts:
 *   - CRLF (\r\n) → LF (\n)
 *   - CR (\r) → LF (\n)
 *
 * Applied to: all string fields that may contain multi-line content.
 * The CRLF → LF conversion occurs before CR → LF to avoid double-processing.
 */
export function normaliseLineEndings(s: string): string {
  // Order matters: replace CRLF first, then any remaining CR
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

// ---------------------------------------------------------------------------
// Metadata trimming
// ---------------------------------------------------------------------------

/**
 * Trims leading and trailing whitespace from a metadata string.
 *
 * Applied to metadata fields only:
 *   - SourceDocument.title
 *   - SourceDocument.author
 *   - SourceDocument.version
 *   - SourceDocument.provenanceNotes
 *   - SourceDocument.contentRef
 *   - GeneratedDocument.title
 *   - SpanReference.locationLabel
 *   - DraIssue.explanation
 *
 * NOT applied to document content or passageText.
 */
export function trimMetadata(s: string): string {
  return s.trim();
}

// ---------------------------------------------------------------------------
// Combined transformations
// ---------------------------------------------------------------------------

/**
 * Normalises a content field: line endings only.
 *
 * Does NOT trim. Applied to:
 *   - SourceDocument.content
 *   - GeneratedDocument.content
 *   - EvidenceUnit.passageText (Stage 4+)
 *   - MaterialStatement.text (Stage 2+)
 *
 * Preserves all content including leading/trailing whitespace, because
 * trimming document content could remove semantically significant text.
 */
export function normaliseContentField(s: string): string {
  return normaliseLineEndings(s);
}

/**
 * Normalises a metadata field: trim AND line endings.
 *
 * Applied to metadata fields listed under trimMetadata above.
 */
export function normaliseMetadataField(s: string): string {
  return trimMetadata(normaliseLineEndings(s));
}

/**
 * Normalises a metadata field and returns undefined if the result is empty.
 *
 * Used for optional metadata fields: if the trimmed value is empty,
 * the field is treated as absent.
 */
export function normaliseOptionalMetadataField(
  s: string | undefined,
): string | undefined {
  if (s === undefined) return undefined;
  const normalised = normaliseMetadataField(s);
  return normalised.length > 0 ? normalised : undefined;
}
