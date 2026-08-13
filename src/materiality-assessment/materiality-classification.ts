/**
 * DRA-001 — Stage 5: Materiality Assessment — Classification Model
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Closed Version 1 materiality classification set.
 *
 * Classifications are mutually exclusive per record. Each statement receives
 * exactly one classification.
 *
 * No classification carries a confidence score, probability, or numeric value.
 *
 * Materiality expresses potential importance to a reader's understanding or
 * decision-making. It is NOT:
 *   - evidence quality
 *   - factual correctness
 *   - release risk
 */

// ---------------------------------------------------------------------------
// Materiality classification union
// ---------------------------------------------------------------------------

/**
 * Closed set of materiality classifications for Version 1.
 *
 * Order reflects priority (CRITICAL highest, UNDETERMINED lowest).
 */
export const MATERIALITY_CLASSIFICATIONS = [
  /**
   * The statement contains a contractual commitment, regulatory obligation,
   * payment authorisation, security control, safety instruction, or legal
   * obligation. Requires immediate reader attention.
   */
  "CRITICAL",
  /**
   * The statement records an approval, rejection, executive recommendation,
   * operational decision, deployment instruction, or firm deadline.
   */
  "HIGH",
  /**
   * The statement provides implementation guidance, records a design
   * assumption, states a supporting rationale, or contains a quantified
   * threshold or warning.
   */
  "MODERATE",
  /**
   * The statement contains descriptive background, contextual explanation,
   * or an illustrative example.
   */
  "LOW",
  /**
   * The statement is a heading, label, metadata field, or navigation
   * reference. It carries no substantive content.
   */
  "INFORMATIONAL",
  /**
   * The statement cannot be deterministically classified because its
   * materiality depends on context not present in the statement text.
   */
  "UNDETERMINED",
] as const;

export type MaterialityClassification = (typeof MATERIALITY_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export function isMaterialityClassification(
  value: unknown,
): value is MaterialityClassification {
  return MATERIALITY_CLASSIFICATIONS.includes(value as MaterialityClassification);
}

// ---------------------------------------------------------------------------
// Priority ordering (lower index = higher priority)
// ---------------------------------------------------------------------------

/**
 * Returns the priority rank of a materiality classification.
 * Lower rank = higher priority.
 */
export function materialityPriority(c: MaterialityClassification): number {
  return MATERIALITY_CLASSIFICATIONS.indexOf(c);
}
