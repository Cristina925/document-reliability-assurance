/**
 * DRA-001 — Stage 3: Authority Resolution — Record Types
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Defines:
 *   - AuthorityRecord     — the structured authority resolution for one statement
 *   - Stage3ResolutionRecord — processing metadata for the Stage 3 run
 *
 * Authority records are pipeline evidence only. They describe attribution
 * relationships. They do not contain:
 *   - credibility assessments
 *   - independence judgements
 *   - evidence-support findings
 *   - issue classifications
 *   - confidence scores
 *   - assurance decisions
 *   - proof receipts
 */

import type { StatementId } from "../model/index.js";
import type { AuthorityClassification, AuthorityType } from "./authority-classification.js";
import type { Stage3Id } from "./resolution-result.js";

// ---------------------------------------------------------------------------
// Authority span
// ---------------------------------------------------------------------------

/**
 * A character span within the normalised generated-document content that
 * locates the authority text.
 *
 * Invariant: content.slice(startOffset, endOffset) === authorityText
 * (where authorityText is the parent AuthorityRecord.authorityText).
 *
 * Offsets are zero-based UTF-16 code unit positions.
 */
export interface AuthoritySpan {
  /** Zero-based inclusive start of the authority text in the document. */
  readonly startOffset: number;
  /** Zero-based exclusive end of the authority text in the document. */
  readonly endOffset: number;
}

// ---------------------------------------------------------------------------
// Statement span (mirrored from Stage 2 for traceability)
// ---------------------------------------------------------------------------

/**
 * The character span of the statement in the normalised document.
 * Copied from the Stage 2 result for traceability. Must not be modified.
 */
export interface StatementSpan {
  readonly startOffset: number;
  readonly endOffset: number;
}

// ---------------------------------------------------------------------------
// Authority record
// ---------------------------------------------------------------------------

/**
 * A single authority resolution record for one extracted material statement.
 *
 * Every Stage 2 statement produces exactly one authority record.
 * Records are ordered by the statement's statementIndex (ascending).
 *
 * The record describes:
 *   - what or who is presented as the source of the statement;
 *   - where in the document the authority text appears;
 *   - which resolution rule produced the classification;
 *   - structural inheritance context, when applicable;
 *   - ambiguity details, when resolution was ambiguous.
 *
 * It does NOT describe:
 *   - whether the source is credible;
 *   - whether the source is independent;
 *   - whether the claim is adequately evidenced;
 *   - whether the statement is true.
 */
export interface AuthorityRecord {
  /**
   * Deterministic record identifier.
   * Format: ar3:{statementId}
   * Unique within one evaluation. Reproducible for identical inputs.
   */
  readonly id: string;

  /** The identifier of the statement this record corresponds to (from Stage 2). */
  readonly statementId: StatementId;

  /**
   * The zero-based index of this record in the authorityRecords array.
   * Equals the statementIndex of the associated statement.
   */
  readonly recordIndex: number;

  /** Authority classification (closed Version 1 set). */
  readonly classification: AuthorityClassification;

  /**
   * The authority text, copied verbatim from the normalised document content.
   * Undefined for DOCUMENT_AUTHOR and NO_IDENTIFIABLE_SOURCE (no authority text present).
   * Satisfies: content.slice(authoritySpan.start, authoritySpan.end) === authorityText.
   */
  readonly authorityText?: string;

  /**
   * The type of the authority entity, when deterministically identifiable.
   * Undefined for DOCUMENT_AUTHOR, NO_IDENTIFIABLE_SOURCE, and AMBIGUOUS_SOURCE.
   */
  readonly authorityType?: AuthorityType;

  /**
   * The span of the authority text in the normalised document.
   * Undefined when no authority text was extracted (DOCUMENT_AUTHOR, NO_IDENTIFIABLE_SOURCE).
   */
  readonly authoritySpan?: AuthoritySpan;

  /**
   * The span of the statement in the normalised document.
   * Copied from Stage 2 for downstream traceability.
   * Must equal stmt.spanRef.startOffset / endOffset from Stage 2.
   */
  readonly statementSpan: StatementSpan;

  /**
   * Identifier of the deterministic resolution rule that produced the classification.
   * Examples: "AR-ACCORDING-TO-NAMED", "AR-SUBJECT-ATTRIBUTION", "AR-DOCUMENT-AUTHOR".
   */
  readonly resolutionRule: string;

  /**
   * Reference to the structural element from which attribution was inherited.
   * Only present when classification is STRUCTURALLY_INHERITED_SOURCE.
   * Format: "preceding-line:{offset}" indicating the boundary of the attribution.
   */
  readonly inheritedContextRef?: string;

  /**
   * Details about the ambiguity preventing deterministic resolution.
   * Only present when classification is AMBIGUOUS_SOURCE.
   */
  readonly ambiguityDetails?: string;
}

// ---------------------------------------------------------------------------
// Stage 3 resolution record
// ---------------------------------------------------------------------------

/**
 * Processing metadata for a Stage 3 authority resolution run.
 * Pipeline evidence only — not a proof receipt.
 */
export interface Stage3ResolutionRecord {
  readonly stageId: Stage3Id;
  readonly stageVersion: string;
  readonly resolutionRuleVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  /** Total character length of the normalised document (UTF-16 code units). */
  readonly documentLength: number;
  /** Number of statements received from Stage 2. */
  readonly statementCount: number;
  /** Number of authority records produced (must equal statementCount). */
  readonly authorityRecordCount: number;
  /** Count of records per classification, for transparency. */
  readonly classificationCounts: Readonly<Record<AuthorityClassification, number>>;
  /** Non-fatal warnings, mirrored in Stage3Success.warnings. */
  readonly warnings: ReadonlyArray<string>;
}
