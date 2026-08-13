/**
 * DRA-001 — Assurance Decision Type
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines exactly the three assurance decisions frozen in DRA-001 §7.
 * No other decision values are permitted.
 *
 * Frozen decision semantics (DRA-001 §7):
 *   SUPPORTED — All claims substantiated; no blocking issues.
 *   REVIEW    — Advisory issues present; human review required.
 *   HOLD      — Blocking issues present; re-evaluation required after resolution.
 *
 * Prohibited additions: PASS, FAIL, OK, REFUSE, APPROVED, REJECTED,
 * confidence-derived decisions, undocumented intermediate values.
 *
 * This module defines the decision TYPE only.
 * It does not calculate or assign a decision from document content.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical decision literals — exactly three, frozen for Version 1
// ---------------------------------------------------------------------------

export const ASSURANCE_DECISIONS = ["SUPPORTED", "REVIEW", "HOLD"] as const;

export type AssuranceDecision = (typeof ASSURANCE_DECISIONS)[number];

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

export const AssuranceDecisionSchema = z.enum(
  ASSURANCE_DECISIONS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Assurance decision must be one of: ${ASSURANCE_DECISIONS.join(", ")}`,
    }),
  },
);

/** Returns true if the value is a canonical DRA assurance decision. */
export function isAssuranceDecision(value: unknown): value is AssuranceDecision {
  return ASSURANCE_DECISIONS.includes(value as AssuranceDecision);
}
