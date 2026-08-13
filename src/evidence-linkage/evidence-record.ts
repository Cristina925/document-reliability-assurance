/**
 * DRA-001 — Stage 4: Evidence Linkage — Evidence Record Types
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Defines the shape of evidence records produced by Stage 4.
 *
 * Each statement produces exactly one EvidenceRecord. An EvidenceRecord
 * may carry zero or more EvidenceSpan items (one per distinct evidence item
 * identified in the statement or the surrounding document content).
 */

import type { EvidenceClassification, EvidenceType } from "./evidence-classification.js";
import type { Stage4Id } from "./linkage-result.js";

// ---------------------------------------------------------------------------
// Evidence span
// ---------------------------------------------------------------------------

/**
 * A span referencing a slice of the generated document content.
 *
 * Invariant:
 *   content.slice(startOffset, endOffset) === evidenceText
 *
 * Offsets are zero-based UTF-16 code unit positions.
 */
export interface EvidenceSpan {
  /** Zero-based inclusive start offset in the document content. */
  readonly startOffset: number;
  /** Zero-based exclusive end offset in the document content. */
  readonly endOffset: number;
  /** Text extracted from the span. Satisfies the slice invariant. */
  readonly evidenceText: string;
  /** Heuristic type descriptor for the evidence item. */
  readonly evidenceType: EvidenceType;
}

// ---------------------------------------------------------------------------
// Statement span (re-anchored from Stage 2)
// ---------------------------------------------------------------------------

/**
 * Absolute span of the parent statement in the document content.
 * Carried through unchanged from Stage 2.
 */
export interface StatementSpan {
  readonly startOffset: number;
  readonly endOffset: number;
}

// ---------------------------------------------------------------------------
// Evidence record
// ---------------------------------------------------------------------------

/**
 * A single evidence record produced by Stage 4 for one extracted statement.
 *
 * Guarantees:
 *   - `id` is deterministic: `ar4:{statementId}`
 *   - `statementId` is the exact value from Stage 2 (unchanged)
 *   - `recordIndex` is the zero-based position in the ordered output array
 *   - All evidence spans satisfy: content.slice(start, end) === evidenceText
 *   - No confidence scores, credibility scores, or materiality values
 */
export interface EvidenceRecord {
  /** Deterministic record identifier: `ar4:{statementId}` */
  readonly id: string;
  /** Stage 2 statement identifier (preserved unchanged). */
  readonly statementId: unknown;
  /** Zero-based position in the output array (equals Stage 2 statement index). */
  readonly recordIndex: number;
  /** Evidence classification for this statement. */
  readonly classification: EvidenceClassification;
  /**
   * Evidence spans found in the generated document for this statement.
   * Empty when classification is NO_DOCUMENT_EVIDENCE or
   * SEMANTIC_PARAPHRASE_MATCH (evidence resides in source documents and
   * has no offset into the generated document content).
   * May contain multiple items when AMBIGUOUS_EVIDENCE_LINK.
   */
  readonly evidenceSpans: ReadonlyArray<EvidenceSpan>;
  /** Span of the parent statement in the document content. */
  readonly statementSpan: StatementSpan;
  /** Identifier of the linkage rule that produced this record. */
  readonly linkageRule: string;
  /**
   * Description of why linkage is ambiguous.
   * Present only when classification is AMBIGUOUS_EVIDENCE_LINK.
   */
  readonly ambiguityDetails?: string;
}

// ---------------------------------------------------------------------------
// Stage 4 linkage record (processing summary)
// ---------------------------------------------------------------------------

/**
 * Structured summary of Stage 4 evidence linkage processing.
 * Carries aggregate counts and metadata — not a decision.
 */
export interface Stage4LinkageRecord {
  readonly stageId: Stage4Id;
  readonly stageVersion: string;
  readonly linkageRuleVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  readonly documentLength: number;
  readonly statementCount: number;
  readonly evidenceRecordCount: number;
  /** Count of evidence spans across all records. */
  readonly totalEvidenceSpans: number;
  /** Per-classification counts (all 11 classifications always present). */
  readonly classificationCounts: Record<EvidenceClassification, number>;
  readonly warnings: ReadonlyArray<string>;
}
