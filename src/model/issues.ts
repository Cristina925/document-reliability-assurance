/**
 * DRA-001 — Assurance Issue Representation
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical structure for a DRA assurance issue.
 * Issues are triggered during evaluation when one of the nine frozen
 * issue classes is detected (DRA-001 §6).
 *
 * Severity semantics (DRA-001 §7):
 *   BLOCKING  — Triggers a HOLD decision.
 *   ADVISORY  — Triggers a REVIEW decision.
 *
 * Explicit exclusions:
 *   - No issue detection logic.
 *   - No severity calculation.
 *   - No inference of severity unless provided as validated input.
 */

import { z } from "zod";
import {
  IssueIdSchema,
  StatementIdSchema,
  EvidenceUnitIdSchema,
} from "./identifiers.js";
import { DraIssueClassSchema } from "./issue-classes.js";
import { PipelineStageNameSchema } from "./pipeline-stages.js";

// ---------------------------------------------------------------------------
// Issue severity enum
// ---------------------------------------------------------------------------

/**
 * Canonical severity levels for DRA assurance issues (DRA-001 §7).
 * BLOCKING — the issue prevents a SUPPORTED decision; triggers HOLD.
 * ADVISORY — the issue requires human review; triggers REVIEW.
 */
export const ISSUE_SEVERITIES = ["BLOCKING", "ADVISORY"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const IssueSeveritySchema = z.enum(
  ISSUE_SEVERITIES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Issue severity must be one of: ${ISSUE_SEVERITIES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Assurance issue schema
// ---------------------------------------------------------------------------

/**
 * A DRA assurance issue: an instance of one of the nine frozen issue classes
 * (DRA-001 §6) triggered during evaluation of a specific claim or
 * evidence relationship.
 */
export const DraIssueSchema = z.object({
  /** Unique identifier for this issue within the evaluation. */
  id: IssueIdSchema,

  /**
   * Canonical issue class — one of the nine frozen DRA-001 classes.
   * Source: DRA-001 §6.
   */
  issueClass: DraIssueClassSchema,

  /**
   * Severity of this issue (BLOCKING or ADVISORY).
   * Determines whether the issue triggers HOLD or REVIEW.
   * Assigned by the relevant pipeline stage; validated at input.
   */
  severity: IssueSeveritySchema,

  /**
   * Identifiers of the material statements to which this issue attaches.
   * At least one statement must be referenced; may be more for cross-claim
   * issues (e.g. IC-6 EVIDENCE_CONFLICT, IC-7 CLAIM_INCONSISTENCY).
   */
  affectedStatementIds: z
    .array(StatementIdSchema)
    .min(1, "At least one affected statement must be referenced"),

  /**
   * Identifiers of evidence units relevant to this issue.
   * Optional — not all issue classes require evidence references.
   */
  affectedEvidenceUnitIds: z.array(EvidenceUnitIdSchema).default([]),

  /**
   * Human-readable explanation of why this issue was triggered.
   * Should be sufficient for a reviewer to understand the problem.
   */
  explanation: z.string().min(1, "Issue explanation must not be empty"),

  /**
   * The pipeline stage that detected or generated this issue.
   * Optional for Version 1; should be populated where determinable.
   */
  stageAssociation: PipelineStageNameSchema.optional(),

  /**
   * Structured stage-assigned metadata. Free-form record.
   * Must not contain secrets, credentials, or PII.
   */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type DraIssue = z.infer<typeof DraIssueSchema>;

// ---------------------------------------------------------------------------
// Issue summary (used in proof receipts)
// ---------------------------------------------------------------------------

export const IssueSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  blocking: z.number().int().nonnegative(),
  advisory: z.number().int().nonnegative(),
});

export type IssueSummary = z.infer<typeof IssueSummarySchema>;

/** Computes an IssueSummary from a list of DraIssues. */
export function summariseIssues(issues: ReadonlyArray<DraIssue>): IssueSummary {
  let blocking = 0;
  let advisory = 0;
  for (const issue of issues) {
    if (issue.severity === "BLOCKING") blocking++;
    else advisory++;
  }
  return { total: issues.length, blocking, advisory };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateDraIssue(
  value: unknown,
): z.SafeParseReturnType<unknown, DraIssue> {
  return DraIssueSchema.safeParse(value);
}
