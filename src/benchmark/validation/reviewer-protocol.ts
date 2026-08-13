/**
 * DRA-VAL-001A — Scientific Validation Protocol — Reviewer Independence Protocol
 *
 * Defines schemas for:
 *   - ReviewerEligibility: who may serve as an independent reviewer
 *   - ReviewerAssignmentRule: how reviewers are assigned to documents
 *   - ReviewSubmissionPolicy: what each reviewer must submit
 *   - AdjudicationPolicy: how disagreements are resolved
 *
 * Independence invariants:
 *   - minimumReviewersPerDocument must be ≥ 2
 *   - blindedToEvaluatorOutput must be true
 *   - prohibitCoordinationBeforeSubmission must be true
 *   - adjudicatorMustBeIndependent must be true
 *   - adjudicatorCannotBeOriginalReviewer must be true
 *
 * These invariants are enforced at parse time. A protocol that relaxes any of
 * them will fail schema validation and cannot be frozen.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Reviewer eligibility
// ---------------------------------------------------------------------------

export const ReviewerEligibilitySchema = z
  .object({
    /**
     * Minimum number of independent reviewers per document.
     * Must be ≥ 2. Two independent reviewers is the baseline requirement.
     */
    minimumReviewersPerDocument: z
      .number()
      .int()
      .min(2, "minimumReviewersPerDocument must be at least 2"),

    /**
     * Whether domain expertise is required for reviewer assignment.
     * When true, reviewers must demonstrate relevant domain knowledge
     * and this must be verified before assignment.
     */
    domainExpertiseRequired: z.boolean(),

    /**
     * Whether conflict-of-interest declarations are mandatory.
     * Must be true for scientific independence.
     */
    conflictOfInterestDeclarationRequired: z.literal(true, {
      errorMap: () => ({
        message:
          "conflictOfInterestDeclarationRequired must be true; reviewer independence requires COI declarations",
      }),
    }),

    /**
     * Whether reviewers are blinded to evaluator output throughout review.
     * Must be true. Reviewers must never see evaluator decisions or issue
     * lists before submitting their own independent findings.
     */
    blindedToEvaluatorOutput: z.literal(true, {
      errorMap: () => ({
        message:
          "blindedToEvaluatorOutput must be true; revealing evaluator output before reviewer submission invalidates the comparison",
      }),
    }),

    /**
     * Whether reviewers are prohibited from coordinating before submission.
     * Must be true. Coordination before submission undermines independence.
     */
    prohibitCoordinationBeforeSubmission: z.literal(true, {
      errorMap: () => ({
        message:
          "prohibitCoordinationBeforeSubmission must be true; pre-submission coordination invalidates reviewer independence",
      }),
    }),

    /**
     * Whether confidentiality requirements apply to reviewed documents.
     * When true, reviewers must sign confidentiality agreements before
     * accessing documents.
     */
    confidentialityRequirementApplies: z.boolean(),

    /**
     * Minimum professional experience level required of reviewers.
     * Free text — e.g. "5 years in relevant domain" or "recognised domain practitioner".
     */
    minimumExperienceRequirement: z
      .string()
      .min(5, "minimumExperienceRequirement must not be empty"),
  });

export type ReviewerEligibility = z.infer<typeof ReviewerEligibilitySchema>;

// ---------------------------------------------------------------------------
// Reviewer assignment rule
// ---------------------------------------------------------------------------

export const ASSIGNMENT_METHODS = ["DOMAIN_MATCHED", "RANDOM", "STRATIFIED"] as const;
export type AssignmentMethod = (typeof ASSIGNMENT_METHODS)[number];

export const AssignmentMethodSchema = z.enum(
  ASSIGNMENT_METHODS as unknown as [string, ...string[]],
);

export const ReviewerAssignmentRuleSchema = z
  .object({
    /**
     * Method used to assign reviewers to documents.
     * DOMAIN_MATCHED is preferred for scientific validity.
     */
    assignmentMethod: AssignmentMethodSchema,

    /**
     * Whether a single reviewer is ever permitted.
     * Must be false — at least two independent reviewers are required.
     */
    allowSingleReviewer: z.literal(false, {
      errorMap: () => ({
        message:
          "allowSingleReviewer must be false; at least two independent reviewers are required per document",
      }),
    }),

    /**
     * Whether the same reviewer may cover both primary and adjudicator roles.
     * Must be false — adjudicators must be different from primary reviewers.
     */
    allowReviewerAsAdjudicator: z.literal(false, {
      errorMap: () => ({
        message:
          "allowReviewerAsAdjudicator must be false; adjudicators must be independent of primary reviewers",
      }),
    }),

    /**
     * Maximum number of documents assigned to any single reviewer.
     * Limits saturation effects from a single reviewer's style.
     * Must be ≥ 1.
     */
    maxDocumentsPerReviewer: z.number().int().min(1),
  });

export type ReviewerAssignmentRule = z.infer<typeof ReviewerAssignmentRuleSchema>;

// ---------------------------------------------------------------------------
// Review submission policy
// ---------------------------------------------------------------------------

export const ReviewSubmissionPolicySchema = z.object({
  /**
   * Whether reviewers must record each identified issue independently.
   * Issues must not be aggregated or condensed before submission.
   */
  requireIndependentIssueRecording: z.literal(true, {
    errorMap: () => ({
      message:
        "requireIndependentIssueRecording must be true; independent issue recording is mandatory for comparison validity",
    }),
  }),

  /**
   * Whether reviewers must record a severity level for each issue.
   * Maps to the DRA issue-severity taxonomy (CRITICAL / SIGNIFICANT / ADVISORY).
   */
  requireSeverityRecording: z.boolean(),

  /**
   * Whether reviewers must map each issue to an issue class.
   * Issue classes correspond to the DRA evaluator's IC-N taxonomy.
   * Required for class-level comparison analysis.
   */
  requireIssueClassMapping: z.boolean(),

  /**
   * Whether reviewers must record a document-level release recommendation.
   * Maps to: SUPPORTED, REVIEW, or HOLD.
   */
  requireReleaseRecommendation: z.literal(true, {
    errorMap: () => ({
      message:
        "requireReleaseRecommendation must be true; document-level decisions are required for decision-agreement metrics",
    }),
  }),

  /**
   * Whether reviewers must record their confidence / uncertainty level.
   * Enables detection of low-confidence findings for sensitivity analysis.
   */
  requireUncertaintyRecording: z.boolean(),

  /**
   * Maximum time (in calendar days) permitted between document receipt
   * and review submission. Limits drift in reviewer familiarity.
   * Must be ≥ 1.
   */
  submissionDeadlineDays: z.number().int().min(1),
});

export type ReviewSubmissionPolicy = z.infer<typeof ReviewSubmissionPolicySchema>;

// ---------------------------------------------------------------------------
// Adjudication policy
// ---------------------------------------------------------------------------

export const AdjudicationPolicySchema = z
  .object({
    /**
     * Whether a third adjudicator is convened for material disagreements.
     * Must be true — material disagreements require adjudication.
     */
    triggerOnMaterialDisagreement: z.literal(true, {
      errorMap: () => ({
        message:
          "triggerOnMaterialDisagreement must be true; material reviewer disagreements must be adjudicated",
      }),
    }),

    /**
     * Definition of what constitutes a "material" disagreement.
     * Free text — must be specific and testable.
     */
    materialDisagreementDefinition: z
      .string()
      .min(20, "materialDisagreementDefinition must describe what constitutes material disagreement"),

    /**
     * Whether the adjudicator must be independent of the original reviewers
     * and the evaluator development team.
     * Must be true.
     */
    adjudicatorMustBeIndependent: z.literal(true, {
      errorMap: () => ({
        message:
          "adjudicatorMustBeIndependent must be true; adjudicator independence is required",
      }),
    }),

    /**
     * Whether an original reviewer may serve as adjudicator on the same document.
     * Must be false.
     */
    adjudicatorCannotBeOriginalReviewer: z.literal(true, {
      errorMap: () => ({
        message:
          "adjudicatorCannotBeOriginalReviewer must be true; original reviewers may not adjudicate their own documents",
      }),
    }),

    /**
     * Minimum number of adjudicators per adjudicated document.
     * Must be ≥ 1.
     */
    minimumAdjudicatorCount: z
      .number()
      .int()
      .min(1, "minimumAdjudicatorCount must be at least 1"),

    /**
     * The term used for the output of the adjudication process.
     * Required to be "adjudicated human reference standard" — the protocol
     * must not use "ground truth" without explicit qualification.
     */
    referenceStandardTerm: z.literal(
      "adjudicated human reference standard",
      {
        errorMap: () => ({
          message:
            'referenceStandardTerm must be "adjudicated human reference standard"; do not use unqualified "ground truth"',
        }),
      },
    ),
  });

export type AdjudicationPolicy = z.infer<typeof AdjudicationPolicySchema>;
