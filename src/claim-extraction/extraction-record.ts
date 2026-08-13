/**
 * DRA-001 — Stage 2: Claim Extraction — Extraction Record
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Defines the structured record of Stage 2 processing.
 *
 * The extraction record is pipeline evidence — it records what was done, not
 * what the document means. It is NOT the proof receipt and does NOT contain:
 *   - evidence-support findings;
 *   - contradiction findings;
 *   - issue classes;
 *   - issue severity;
 *   - confidence;
 *   - decisions;
 *   - proof-receipt claims.
 */

import type { Stage2Id } from "./extraction-result.js";

// ---------------------------------------------------------------------------
// Rejection record
// ---------------------------------------------------------------------------

/**
 * A record of a segment that was excluded from the candidate statement set.
 * Included in the ExtractionRecord for transparency.
 */
export interface RejectionRecord {
  /** The exclusion reason code (e.g. "HEADING", "WHITESPACE_ONLY"). */
  readonly reason: ExclusionReason;
  /**
   * First 120 characters of the segment text, for diagnostics.
   * Truncated with "…" if longer.
   */
  readonly segmentSnippet: string;
  /** Start character offset in the normalised generated document. */
  readonly startOffset: number;
  /** End character offset in the normalised generated document (exclusive). */
  readonly endOffset: number;
}

/**
 * Documented exclusion reasons for Stage 2 segments.
 * These are internal pipeline codes — not DRA issue classes.
 */
export type ExclusionReason =
  | "WHITESPACE_ONLY"        // Segment contains only whitespace
  | "EMPTY"                  // Segment has zero length
  | "PUNCTUATION_ONLY"       // Segment has no alphabetic characters
  | "HEADING"                // Markdown-style heading (starts with #)
  | "HORIZONTAL_RULE"        // Separator line (---, ===, ***)
  | "PAGE_NUMBER"            // Matches page-number pattern
  | "SHORT_FRAGMENT"         // Too short to constitute a proposition (< MIN_CHARS)
  | "DUPLICATE_SPAN";        // Identical span to an already-extracted statement

// ---------------------------------------------------------------------------
// Extraction record
// ---------------------------------------------------------------------------

/**
 * A structured record of all Stage 2 extraction processing.
 *
 * Intended for pipeline transparency, reproducibility audits, and debugging.
 * Does not contain quality assessments or assurance findings.
 */
export interface ExtractionRecord {
  /** Stage 2 identifier. */
  readonly stageId: Stage2Id;
  /** Stage 2 implementation version. */
  readonly stageVersion: string;
  /**
   * Version of the extraction rules applied.
   * Bumped when extraction rule logic changes in a way that could alter
   * which segments are included or excluded.
   */
  readonly extractionRuleVersion: string;
  /** Identifier of the evaluation request. */
  readonly evaluationId: string;
  /** Identifier of the generated document that was processed. */
  readonly generatedDocumentId: string;
  /**
   * Total character length of the normalised generated-document content.
   * Measured in UTF-16 code units (JavaScript string length semantics).
   */
  readonly documentLength: number;
  /** Total number of segments produced by the segmenter before classification. */
  readonly segmentCount: number;
  /**
   * Number of candidate material statements in the output.
   * Equals Stage2Success.statements.length.
   * Zero is valid.
   */
  readonly candidateStatementCount: number;
  /**
   * Number of segments that were classified as excluded (not candidate claims).
   * equals segmentCount - candidateStatementCount (approximately; duplicates
   * are also counted separately).
   */
  readonly ignoredSegmentCount: number;
  /**
   * Records of excluded segments and their reasons.
   * Ordered by startOffset ascending.
   * May be empty if all segments were accepted as candidates.
   */
  readonly rejectionRecords: ReadonlyArray<RejectionRecord>;
  /**
   * Non-fatal warnings generated during extraction.
   * Mirrored in Stage2Success.warnings.
   */
  readonly warnings: ReadonlyArray<string>;

  // ── Boundary fields (populated when evaluationBoundary is present) ──────

  /**
   * Whether an evaluationBoundary was applied during this extraction run.
   * Always present. False when no boundary was specified (full-document
   * extraction, backwards-compatible behaviour).
   */
  readonly boundaryApplied: boolean;

  /**
   * Start character offset of the applied boundary (inclusive, zero-based).
   * Present only when boundaryApplied is true.
   */
  readonly boundaryStartOffset?: number;

  /**
   * End character offset of the applied boundary (exclusive, zero-based).
   * Present only when boundaryApplied is true.
   */
  readonly boundaryEndOffset?: number;

  /**
   * Number of segments produced by the segmenter that were discarded because
   * they fell outside the declared boundary.
   * Present only when boundaryApplied is true.
   * Equals allSegments.length − boundaryFilteredSegments.length.
   */
  readonly boundaryFilteredSegmentCount?: number;
}
