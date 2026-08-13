/**
 * DRA-001 — Stage 2: Claim Extraction — Public Surface
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Exports the Stage 2 public interface:
 *   - extractClaims — Stage 2 entry point
 *   - Stage2Result, Stage2Success, Stage2Failure — result types
 *   - ExtractionRecord, RejectionRecord — extraction record types
 *   - STAGE_2_ID, STAGE_2_VERSION, EXTRACTION_RULE_VERSION — constants
 *   - makeStatementId, parseStatementId — deterministic ID helpers
 *   - segmentContent, ContentSegment, SegmentType — segmentation utilities
 *   - classifySegments, ClassifiedSegment — classification utilities
 *   - validateSpan, validateAllSpans — span integrity validation
 *   - MIN_CANDIDATE_CHARS — classification threshold constant
 *   - ExclusionReason, CandidateStatus — classification types
 *
 * Not exported (excluded from public surface):
 *   - Internal helpers (getWordBefore, isSentenceBoundaryPeriod, etc.)
 *   - Issue detection
 *   - Evidence mapping
 *   - Decision calculation
 *   - Confidence scoring
 *   - Proof receipt generation
 *   - Full evaluator entry point
 *
 * @module dra-reference/claim-extraction
 */

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export { extractClaims, EXTRACTION_RULE_VERSION } from "./extract-claims.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export {
  STAGE_2_ID,
  STAGE_2_VERSION,
} from "./extraction-result.js";

export type {
  Stage2Result,
  Stage2Success,
  Stage2Failure,
  Stage2Id,
} from "./extraction-result.js";

// ---------------------------------------------------------------------------
// Extraction record types
// ---------------------------------------------------------------------------

export type {
  ExtractionRecord,
  RejectionRecord,
  ExclusionReason,
} from "./extraction-record.js";

// ---------------------------------------------------------------------------
// Segmentation utilities
// ---------------------------------------------------------------------------

export { segmentContent } from "./segment-content.js";
export type { ContentSegment, SegmentType } from "./segment-content.js";

// ---------------------------------------------------------------------------
// Classification utilities
// ---------------------------------------------------------------------------

export { classifySegments, MIN_CANDIDATE_CHARS } from "./classify-segments.js";
export type {
  ClassifiedSegment,
  CandidateStatus,
} from "./classify-segments.js";

// ---------------------------------------------------------------------------
// Statement identifier utilities
// ---------------------------------------------------------------------------

export {
  makeStatementId,
  parseStatementId,
  STAGE_2_STATEMENT_ID_PREFIX,
} from "./statement-identifiers.js";

// ---------------------------------------------------------------------------
// Span integrity
// ---------------------------------------------------------------------------

export { validateSpan, validateAllSpans } from "./span-integrity.js";
