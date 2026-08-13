/**
 * DRA-001 — Stage 4: Evidence Linkage — Evidence Classification Model
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Closed Version 1 classification for evidence found (or not found) in the
 * submitted document.
 *
 * Classifications are mutually exclusive per record. Each statement receives
 * exactly one classification.
 *
 * No classification carries a confidence score or credibility judgement.
 */

// ---------------------------------------------------------------------------
// Evidence classification union
// ---------------------------------------------------------------------------

/**
 * Closed set of evidence classifications for Version 1.
 *
 * Order reflects approximate priority in the linkage rule set.
 */
export const EVIDENCE_CLASSIFICATIONS = [
  /** A named, numbered, or bracketed citation present in the statement. */
  "CITED_REFERENCE",
  /** A table explicitly referenced in the statement. */
  "TABLE_EVIDENCE",
  /** A figure, chart, graph, or diagram explicitly referenced in the statement. */
  "FIGURE_EVIDENCE",
  /** A footnote marker or superscript reference in the statement. */
  "FOOTNOTE_EVIDENCE",
  /** An appendix, annex, or schedule explicitly referenced in the statement. */
  "APPENDIX_EVIDENCE",
  /** A quoted passage embedded in the statement, with or without attribution. */
  "QUOTED_SOURCE",
  /** A cross-reference to another section, chapter, or numbered item in the same document. */
  "DOCUMENT_CROSS_REFERENCE",
  /** A URL or explicit external resource address appearing in the statement. */
  "EXTERNAL_REFERENCE_PRESENT",
  /** A reference to a standard, regulation, legislation, or RFC. */
  "DIRECT_DOCUMENT_EVIDENCE",
  /** Two or more plausible evidence items that cannot be deterministically distinguished. */
  "AMBIGUOUS_EVIDENCE_LINK",
  /** No identifiable documentary evidence found in the statement. */
  "NO_DOCUMENT_EVIDENCE",
  /**
   * Statement is a deterministic semantic paraphrase of a source passage.
   * Detected by DRA-FIX-002 phrase-canonicalisation + content-term-overlap
   * matching when no citation/reference pattern is present in the statement.
   * Evidence resides in the source document; evidenceSpans is empty.
   */
  "SEMANTIC_PARAPHRASE_MATCH",
] as const;

export type EvidenceClassification = (typeof EVIDENCE_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// Evidence type (heuristic descriptor — not a classification)
// ---------------------------------------------------------------------------

/**
 * Heuristic type of the evidence item, derived from the evidence text.
 * Does not affect the classification; used for human readability.
 */
export const EVIDENCE_TYPES = [
  "NUMBERED_CITATION",
  "BRACKETED_CITATION",
  "FIGURE",
  "TABLE",
  "APPENDIX",
  "FOOTNOTE",
  "QUOTED_TEXT",
  "URL",
  "STANDARD",
  "LEGISLATION",
  "SECTION",
  "BIBLIOGRAPHY",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export function isEvidenceClassification(value: unknown): value is EvidenceClassification {
  return EVIDENCE_CLASSIFICATIONS.includes(value as EvidenceClassification);
}

export function isEvidenceType(value: unknown): value is EvidenceType {
  return EVIDENCE_TYPES.includes(value as EvidenceType);
}
