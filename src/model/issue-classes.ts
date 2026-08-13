/**
 * DRA-001 — Canonical Issue Classes
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines exactly the nine issue classes frozen in DRA-001 §6.
 * No issue class may be added, removed, renamed, or redefined during
 * Version 1 engineering.
 *
 * Canonical literal strings are derived from the DRA-001 §6 issue class
 * names (the "Issue class" column of the frozen table). Each class is also
 * associated with its IC-N numeric code via ISSUE_CLASS_CODES.
 *
 * This module provides:
 *   - One authoritative ordered tuple of all nine literals.
 *   - Runtime Zod enum schema derived from the same tuple.
 *   - TypeScript union type derived from the same tuple.
 *   - IC-N code map (frozen association of code to class name).
 *   - IC-N reverse map (class name to code).
 *
 * Do not add aliases. Do not create undocumented issue class values.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical issue class literals — exactly nine, frozen for Version 1
// Source: DRA-001 §6 "Frozen Nine Issue Classes"
// ---------------------------------------------------------------------------

export const ISSUE_CLASSES = [
  "UNSUPPORTED_CLAIM",
  "AUTHORITY_EXPIRED",
  "AUTHORITY_ABSENT",
  "EVIDENCE_ABSENT",
  "EVIDENCE_INADEQUATE",
  "EVIDENCE_CONFLICT",
  "CLAIM_INCONSISTENCY",
  "TRACEABILITY_BROKEN",
  "SCOPE_VIOLATION",
] as const;

export type DraIssueClass = (typeof ISSUE_CLASSES)[number];

// ---------------------------------------------------------------------------
// IC-N numeric code associations (frozen — DRA-001 §6)
// ---------------------------------------------------------------------------

/** Maps IC-N code to canonical issue class literal. */
export const ISSUE_CLASS_CODES: Readonly<Record<string, DraIssueClass>> = {
  "IC-1": "UNSUPPORTED_CLAIM",
  "IC-2": "AUTHORITY_EXPIRED",
  "IC-3": "AUTHORITY_ABSENT",
  "IC-4": "EVIDENCE_ABSENT",
  "IC-5": "EVIDENCE_INADEQUATE",
  "IC-6": "EVIDENCE_CONFLICT",
  "IC-7": "CLAIM_INCONSISTENCY",
  "IC-8": "TRACEABILITY_BROKEN",
  "IC-9": "SCOPE_VIOLATION",
} as const;

/** Maps canonical issue class literal to IC-N code. */
export const ISSUE_CLASS_TO_CODE: Readonly<Record<DraIssueClass, string>> = {
  UNSUPPORTED_CLAIM: "IC-1",
  AUTHORITY_EXPIRED: "IC-2",
  AUTHORITY_ABSENT: "IC-3",
  EVIDENCE_ABSENT: "IC-4",
  EVIDENCE_INADEQUATE: "IC-5",
  EVIDENCE_CONFLICT: "IC-6",
  CLAIM_INCONSISTENCY: "IC-7",
  TRACEABILITY_BROKEN: "IC-8",
  SCOPE_VIOLATION: "IC-9",
} as const;

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

export const DraIssueClassSchema = z.enum(
  ISSUE_CLASSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Issue class must be one of the nine canonical DRA-001 classes: ${ISSUE_CLASSES.join(", ")}`,
    }),
  },
);

/** Returns true if the value is one of the nine canonical issue class literals. */
export function isDraIssueClass(value: unknown): value is DraIssueClass {
  return ISSUE_CLASSES.includes(value as DraIssueClass);
}

/** Returns the IC-N code for a canonical issue class, or undefined if unknown. */
export function getIssueClassCode(
  issueClass: DraIssueClass,
): string | undefined {
  return ISSUE_CLASS_TO_CODE[issueClass];
}

/** Returns the canonical issue class for an IC-N code, or undefined if unknown. */
export function getIssueClassFromCode(
  code: string,
): DraIssueClass | undefined {
  return ISSUE_CLASS_CODES[code];
}

// ---------------------------------------------------------------------------
// Issue class reference codes — IC-N format
//
// IC-N codes are stable reference identifiers for documentation, audit
// trails, and human-facing output only. They are NOT canonical runtime
// issue-class values. Runtime evaluation fields (DraIssue.issueClass,
// evaluation requests, results) must use the descriptive DraIssueClass
// literals above.
//
// A field typed as IssueClassCode accepts IC-1 through IC-9.
// A field typed as DraIssueClass accepts UNSUPPORTED_CLAIM through
// SCOPE_VIOLATION. These two types are mutually exclusive.
// ---------------------------------------------------------------------------

/** The nine IC-N reference codes in canonical order (IC-1 … IC-9). */
export const ISSUE_CLASS_CODE_VALUES = [
  "IC-1",
  "IC-2",
  "IC-3",
  "IC-4",
  "IC-5",
  "IC-6",
  "IC-7",
  "IC-8",
  "IC-9",
] as const;

export type IssueClassCode = (typeof ISSUE_CLASS_CODE_VALUES)[number];

/**
 * Runtime schema for IC-N reference codes only.
 *
 * Accepts: "IC-1" … "IC-9"
 * Rejects: descriptive names such as "UNSUPPORTED_CLAIM"
 * Rejects: any other string
 *
 * Do not use this schema to validate DraIssue.issueClass or any other
 * canonical runtime issue-class field. Use DraIssueClassSchema for those.
 */
export const IssueClassCodeSchema = z.enum(
  ISSUE_CLASS_CODE_VALUES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Issue class code must be one of the nine IC-N reference codes: ${ISSUE_CLASS_CODE_VALUES.join(", ")}`,
    }),
  },
);

/** Returns true if the value is one of the nine IC-N reference codes. */
export function isIssueClassCode(value: unknown): value is IssueClassCode {
  return ISSUE_CLASS_CODE_VALUES.includes(value as IssueClassCode);
}
