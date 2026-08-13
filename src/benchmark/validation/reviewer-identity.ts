/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Identity Schemas
 *
 * Canonical identifier format, recruitment status, qualification status, and
 * reviewer-category enumerations for scientific reviewer records.
 *
 * Invariants:
 *   - Reviewer identifiers must match DRA-REV-NNNN (exactly 4 digits)
 *   - No status transition skips an intermediate state
 *   - Adjudicator qualification requires prior reviewer qualification
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Reviewer identifier
// ---------------------------------------------------------------------------

/**
 * Regex for scientific reviewer identifiers.
 * Format: DRA-REV-NNNN. Examples: DRA-REV-0001, DRA-REV-0012.
 */
export const REVIEWER_ID_REGEX = /^DRA-REV-\d{4}$/;

export const ScientificReviewerIdSchema = z
  .string()
  .regex(REVIEWER_ID_REGEX, {
    message:
      "Scientific reviewer ID must match DRA-REV-NNNN (e.g. DRA-REV-0001)",
  });

export type ScientificReviewerId = z.infer<typeof ScientificReviewerIdSchema>;

// ---------------------------------------------------------------------------
// Recruitment status
// ---------------------------------------------------------------------------

export const REVIEWER_RECRUITMENT_STATUSES = [
  /** Slot planned in the recruitment target; no individual identified */
  "PLANNED",
  /** Individual identified as a candidate */
  "PROSPECT",
  /** Initial contact made */
  "CONTACTED",
  /** Application submitted */
  "APPLIED",
  /** Application reviewed; conflicts and experience assessed */
  "SCREENED",
  /** Qualification exercises completed and assessed; eligible */
  "QUALIFIED",
  /** Qualification exercises completed; conditional eligibility only */
  "CONDITIONALLY_QUALIFIED",
  /** Application or qualification rejected */
  "REJECTED",
  /** Reviewer voluntarily withdrew from the programme */
  "WITHDRAWN",
  /** Reviewer suspended pending investigation or resolution */
  "SUSPENDED",
] as const;

export type ReviewerRecruitmentStatus =
  (typeof REVIEWER_RECRUITMENT_STATUSES)[number];

export const ReviewerRecruitmentStatusSchema = z.enum(
  REVIEWER_RECRUITMENT_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Reviewer recruitment status must be one of: ${REVIEWER_RECRUITMENT_STATUSES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Qualification status
// ---------------------------------------------------------------------------

export const REVIEWER_QUALIFICATION_STATUSES = [
  /** Qualification process not yet started */
  "NOT_STARTED",
  /** Qualification process in progress */
  "IN_PROGRESS",
  /** Qualified for general assurance review */
  "QUALIFIED_GENERAL",
  /** Qualified as a domain specialist in at least one corpus domain */
  "QUALIFIED_DOMAIN_SPECIALIST",
  /** Qualified as an adjudicator (requires prior general qualification) */
  "QUALIFIED_ADJUDICATOR",
  /** Conditionally qualified — restrictions apply */
  "CONDITIONALLY_QUALIFIED",
  /** More evidence required before qualification can be assessed */
  "REQUIRES_MORE_EVIDENCE",
  /** Qualification assessment concluded: not qualified */
  "NOT_QUALIFIED",
  /** Disqualified due to a disqualifying conflict of interest */
  "DISQUALIFIED_CONFLICT",
  /** Reviewer withdrew before or during qualification */
  "WITHDRAWN",
] as const;

export type ReviewerQualificationStatus =
  (typeof REVIEWER_QUALIFICATION_STATUSES)[number];

export const ReviewerQualificationStatusSchema = z.enum(
  REVIEWER_QUALIFICATION_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Reviewer qualification status must be one of: ${REVIEWER_QUALIFICATION_STATUSES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Reviewer category
// ---------------------------------------------------------------------------

export const REVIEWER_CATEGORIES = [
  /** General professional assurance reviewer */
  "GENERAL_ASSURANCE_REVIEWER",
  /** Domain specialist with expertise in one or more corpus domains */
  "DOMAIN_SPECIALIST",
  /** Adjudicator for material disagreements; must first be reviewer-qualified */
  "ADJUDICATOR",
] as const;

export type ReviewerCategory = (typeof REVIEWER_CATEGORIES)[number];

export const ReviewerCategorySchema = z.enum(
  REVIEWER_CATEGORIES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Reviewer category must be one of: ${REVIEWER_CATEGORIES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Adjudicator status validation
// ---------------------------------------------------------------------------

/**
 * Returns true when the qualification status is consistent with acting as
 * an adjudicator. Adjudicators must first be qualified as general reviewers
 * or domain specialists.
 */
export function isAdjudicatorEligible(
  qualificationStatus: ReviewerQualificationStatus,
): boolean {
  return (
    qualificationStatus === "QUALIFIED_ADJUDICATOR" ||
    qualificationStatus === "QUALIFIED_GENERAL" ||
    qualificationStatus === "QUALIFIED_DOMAIN_SPECIALIST"
  );
}

/**
 * Returns true when the recruitment status permits assignment to scientific
 * review work. Withdrawn, suspended, rejected, and unqualified reviewers
 * must not be assigned.
 */
export function isAssignmentEligibleStatus(
  recruitmentStatus: ReviewerRecruitmentStatus,
): boolean {
  return (
    recruitmentStatus === "QUALIFIED" ||
    recruitmentStatus === "CONDITIONALLY_QUALIFIED"
  );
}
