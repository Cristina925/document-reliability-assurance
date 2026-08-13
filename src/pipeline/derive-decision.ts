/**
 * DRA-001 — Pipeline Integration — Decision Derivation
 *
 * Milestone: DRA-ENG-009 — Decision and Receipt (spec Stage 7)
 * Spec reference: DRA-001 §7 — Decision Semantics
 *
 * deriveDecision() maps a set of detected assurance issues to one of the three
 * frozen assurance decisions (DRA-001 §7):
 *
 *   HOLD      — Any BLOCKING issue is present.
 *   REVIEW    — No BLOCKING issues, but at least one ADVISORY issue is present.
 *   SUPPORTED — No issues of any severity.
 *
 * The function is pure and deterministic.
 */

import type { DraIssue, AssuranceDecision } from "../model/index.js";

// ---------------------------------------------------------------------------
// DecisionResult
// ---------------------------------------------------------------------------

export interface DecisionResult {
  readonly decision: AssuranceDecision;
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// deriveDecision
// ---------------------------------------------------------------------------

/**
 * Derives an assurance decision from a set of detected issues.
 *
 * @param issues All DraIssues detected by Stage 6 (Consistency Check).
 * @returns { decision, rationale } — frozen and deterministic.
 */
export function deriveDecision(
  issues: ReadonlyArray<DraIssue>,
): DecisionResult {
  const blocking = issues.filter((i) => i.severity === "BLOCKING");
  const advisory = issues.filter((i) => i.severity === "ADVISORY");

  if (blocking.length > 0) {
    const classes = [
      ...new Set(blocking.map((i) => i.issueClass)),
    ].join(", ");
    return {
      decision: "HOLD",
      rationale:
        `HOLD — ${blocking.length} blocking issue(s) detected (${classes}). ` +
        `All blocking issues must be resolved and the document re-evaluated ` +
        `before an assurance determination can be issued.`,
    };
  }

  if (advisory.length > 0) {
    const classes = [
      ...new Set(advisory.map((i) => i.issueClass)),
    ].join(", ");
    return {
      decision: "REVIEW",
      rationale:
        `REVIEW — ${advisory.length} advisory issue(s) detected (${classes}). ` +
        `Human review is required before the assurance determination can be confirmed. ` +
        `No blocking issues were identified.`,
    };
  }

  return {
    decision: "SUPPORTED",
    rationale:
      `SUPPORTED — No issues detected across all evaluation stages. ` +
      `All claims were evaluated; no authority, evidence, or consistency ` +
      `issues were found. The document satisfies the Version 1 assurance ` +
      `criteria as evaluated by the DRA reference evaluator.`,
  };
}
