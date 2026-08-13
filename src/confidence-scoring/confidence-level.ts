/**
 * DRA-001 — Stage 7: Confidence Scoring — Confidence Level Classification
 *
 * Milestone: DRA-ENG-008 (Confidence Scoring, spec Stage 6)
 * Spec reference: DRA-001 §5, Stage 6 "Confidence Scoring"
 *
 * Defines the four confidence levels produced by Stage 7.
 * DRA-001 §5 specifies "a structured classification, not a numeric probability".
 *
 * Semantics (per claim):
 *   CONFIRMED  — Named or structural authority PLUS positive documentary evidence.
 *   PARTIAL    — Authority OR evidence present, but not both; or ambiguous evidence.
 *   UNVERIFIED — Neither identifiable authority nor documentary evidence found.
 *   CONTESTED  — The claim is involved in a detected IC-7 CLAIM_INCONSISTENCY.
 *
 * Confidence levels are ordered:
 *   CONFIRMED > PARTIAL > UNVERIFIED > CONTESTED
 *
 * CONTESTED takes precedence over all other levels: a claim involved in a
 * contradiction is CONTESTED regardless of its authority/evidence status.
 */

// ---------------------------------------------------------------------------
// ConfidenceLevel union
// ---------------------------------------------------------------------------

export const CONFIDENCE_LEVELS = [
  "CONFIRMED",
  "PARTIAL",
  "UNVERIFIED",
  "CONTESTED",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

/** Version tag for the confidence-scoring rule set. */
export const CONFIDENCE_RULE_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Guards and helpers
// ---------------------------------------------------------------------------

/** Returns true if the value is a valid ConfidenceLevel. */
export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return CONFIDENCE_LEVELS.includes(value as ConfidenceLevel);
}

/** Returns a numeric priority for a ConfidenceLevel (higher = more confident). */
export function confidencePriority(level: ConfidenceLevel): number {
  switch (level) {
    case "CONFIRMED":  return 3;
    case "PARTIAL":    return 2;
    case "UNVERIFIED": return 1;
    case "CONTESTED":  return 0;
  }
}
