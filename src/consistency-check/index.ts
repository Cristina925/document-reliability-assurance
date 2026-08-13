/**
 * DRA-001 — Stage 6: Consistency Check — Public Surface
 *
 * Milestone: DRA-ENG-008 — Consistency Check
 */

// Entry point
export { checkConsistency, CONSISTENCY_CHECK_VERSION } from "./check-consistency.js";

// Result types
export {
  STAGE_6_ID,
  STAGE_6_VERSION,
  type Stage6Id,
  type Stage6Result,
  type Stage6Success,
  type Stage6Failure,
} from "./consistency-result.js";

// Issue detection
export { detectIssues } from "./issue-detection.js";
