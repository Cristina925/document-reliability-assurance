/**
 * DRA-001 — Stage 5: Materiality Assessment — Record Types
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Defines the shape of materiality records produced by Stage 5.
 *
 * Each statement produces exactly one MaterialityRecord. Records carry the
 * materiality classification, the rule that produced it, triggering
 * characteristics identified in the statement text, structural context
 * derived from the document, and an explanatory rationale.
 *
 * Records must never modify earlier stage outputs.
 */

import type { MaterialityClassification } from "./materiality-classification.js";
import type { Stage5Id } from "./materiality-result.js";

// ---------------------------------------------------------------------------
// Statement span
// ---------------------------------------------------------------------------

/**
 * Absolute span of the parent statement in the document content.
 * Carried through unchanged from Stage 2 (via Stage 4).
 */
export interface StatementSpan {
  readonly startOffset: number;
  readonly endOffset: number;
}

// ---------------------------------------------------------------------------
// Structural context
// ---------------------------------------------------------------------------

/**
 * Deterministic structural characteristics of the statement.
 * Derived solely from the statement text; carries no credibility or
 * evidence-quality information.
 */
export interface StructuralContext {
  /** Number of characters in the statement text. */
  readonly statementLength: number;
  /** True when the statement contains a quantified limit or threshold. */
  readonly hasQuantifiedLimit: boolean;
  /** True when the statement references a date, deadline, or time period. */
  readonly hasTemporalReference: boolean;
  /** True when the statement contains explicit negation (not, never, must not). */
  readonly hasNegation: boolean;
  /** True when the statement contains a deontic modal (must, shall, should, may). */
  readonly hasDeonticModal: boolean;
}

// ---------------------------------------------------------------------------
// Materiality record
// ---------------------------------------------------------------------------

/**
 * A single materiality record produced by Stage 5 for one extracted statement.
 *
 * Guarantees:
 *   - `id` is deterministic: `ar5:{statementId}`
 *   - `statementId` is the exact value from Stage 2 (unchanged)
 *   - `recordIndex` is the zero-based position in the ordered output array
 *   - No confidence scores, credibility scores, or release decisions
 *   - Classification never guesses; UNDETERMINED is returned when uncertain
 */
export interface MaterialityRecord {
  /** Deterministic record identifier: `ar5:{statementId}` */
  readonly id: string;
  /** Stage 2 statement identifier (preserved unchanged). */
  readonly statementId: unknown;
  /** Zero-based position in the output array (equals Stage 2 statement index). */
  readonly recordIndex: number;
  /** Materiality classification for this statement. */
  readonly classification: MaterialityClassification;
  /** Identifier of the materiality rule that produced this classification. */
  readonly ruleId: string;
  /**
   * Lexical features of the statement text that triggered the rule.
   * Contains the matched text fragments that activated the rule, in order.
   */
  readonly triggeringCharacteristics: ReadonlyArray<string>;
  /** Structural characteristics derived from the statement text. */
  readonly structuralContext: StructuralContext;
  /** Human-readable explanation of why this classification was assigned. */
  readonly rationale: string;
  /** Span of the parent statement in the document content. */
  readonly statementSpan: StatementSpan;
}

// ---------------------------------------------------------------------------
// Stage 5 assessment record (processing summary)
// ---------------------------------------------------------------------------

/**
 * Structured summary of Stage 5 materiality assessment processing.
 * Carries aggregate counts and metadata — not a decision or recommendation.
 */
export interface Stage5AssessmentRecord {
  readonly stageId: Stage5Id;
  readonly stageVersion: string;
  readonly assessmentRuleVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  readonly statementCount: number;
  readonly materialityRecordCount: number;
  /** Per-classification counts (all 6 classifications always present). */
  readonly classificationCounts: Record<MaterialityClassification, number>;
}
