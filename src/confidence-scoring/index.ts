/**
 * DRA-001 — Stage 7: Confidence Scoring — Public Surface
 *
 * Milestone: DRA-ENG-008 (Confidence Scoring, spec Stage 6)
 */

// Entry point
export {
  scoreConfidence,
  CONFIDENCE_RULE_VERSION,
  STAGE_7_VERSION,
} from "./score-confidence.js";

// Confidence level
export {
  CONFIDENCE_LEVELS,
  isConfidenceLevel,
  confidencePriority,
  type ConfidenceLevel,
  CONFIDENCE_RULE_VERSION as CONFIDENCE_SCORING_RULE_VERSION,
} from "./confidence-level.js";

// Result types
export {
  STAGE_7_ID,
  STAGE_7_VERSION as STAGE_7_RESULT_VERSION,
  type Stage7Id,
  type Stage7Result,
  type Stage7Success,
  type Stage7Failure,
  type ConfidenceRecord,
} from "./confidence-result.js";
