/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Readiness Assessment
 *
 * Defines the schema for the pilot reviewer-readiness assessment and the
 * validation function that must be satisfied before DRA-VAL-001D may begin.
 *
 * Invariants:
 *   - READY cannot be reported with zero genuine qualified reviewers
 *   - READY cannot be reported without adjudication coverage
 *   - READY cannot be reported with incomplete consent or confidentiality records
 *   - READY cannot be reported with unresolved conflicts
 *   - READY cannot be reported with insufficient two-reviewer coverage
 *   - READY cannot be reported while evaluator outputs are unsealed
 *   - READY cannot be reported if corpus manifest integrity fails
 *   - CONDITIONALLY_READY requires an independently approved exception record
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Readiness outcome
// ---------------------------------------------------------------------------

export const READINESS_OUTCOMES = [
  /** All safeguards satisfied; DRA-VAL-001D may proceed. */
  "READY",
  /**
   * Core safeguards satisfied but one or more non-critical gaps exist.
   * Requires independently approved exception record before proceeding.
   */
  "CONDITIONALLY_READY",
  /** One or more critical safeguards not satisfied; DRA-VAL-001D is blocked. */
  "NOT_READY",
] as const;

export type ReadinessOutcome = (typeof READINESS_OUTCOMES)[number];

export const ReadinessOutcomeSchema = z.enum(
  READINESS_OUTCOMES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Readiness criterion
// ---------------------------------------------------------------------------

export const ReadinessCriterionSchema = z.object({
  /**
   * Criterion identifier. Format: RC-NN.
   */
  criterionId: z
    .string()
    .regex(/^RC-\d{2}$/, "criterionId must match RC-NN"),

  /** Human-readable description of the criterion. */
  description: z.string().min(10),

  /** Whether this criterion has been satisfied. */
  satisfied: z.boolean(),

  /** Whether failure of this criterion is critical (blocks READY and CONDITIONALLY_READY). */
  critical: z.boolean(),

  /**
   * Observed value for measurable criteria.
   */
  observedValue: z.string().optional(),

  /**
   * Required value for measurable criteria.
   */
  requiredValue: z.string().optional(),

  /**
   * Notes on why the criterion is or is not satisfied.
   */
  notes: z.string().optional(),
});

export type ReadinessCriterion = z.infer<typeof ReadinessCriterionSchema>;

// ---------------------------------------------------------------------------
// Reviewer readiness assessment
// ---------------------------------------------------------------------------

export const ReviewerReadinessAssessmentSchema = z
  .object({
    /**
     * Corpus version being assessed for readiness.
     */
    corpusVersion: z.string().min(1),

    /**
     * ISO-8601 timestamp of this assessment.
     */
    assessmentTimestamp: z.string().min(1),

    /**
     * Identifier of the person performing the assessment.
     */
    assessorId: z.string().min(1),

    // ----- Safeguard checks -----

    /**
     * Number of genuine qualified reviewers (QUALIFIED_GENERAL or
     * QUALIFIED_DOMAIN_SPECIALIST, not counting placeholder, simulated,
     * or conditionally qualified reviewers).
     */
    genuineQualifiedReviewerCount: z.number().int().min(0),

    /**
     * Whether at least 2 independent eligible reviewers can be assigned
     * to every pilot document.
     */
    twoReviewerCoverageAchieved: z.boolean(),

    /**
     * Whether domain expertise is adequate for all domains with pilot documents.
     */
    domainExpertiseAdequate: z.boolean(),

    /**
     * Whether all reviewer conflicts have been independently assessed.
     */
    conflictsIndependentlyAssessed: z.boolean(),

    /**
     * Whether consent records are complete for all assigned reviewers.
     */
    consentComplete: z.boolean(),

    /**
     * Whether confidentiality agreements are complete for all assigned reviewers.
     */
    confidentialityComplete: z.boolean(),

    /**
     * Whether qualification exercises are passed for all assigned reviewers.
     */
    qualificationExercisesPassed: z.boolean(),

    /**
     * Whether adjudication coverage exists for all domains with pilot documents.
     */
    adjudicationCoverageExists: z.boolean(),

    /**
     * Whether workload limits are respected for all planned assignments.
     */
    workloadLimitsRespected: z.boolean(),

    /**
     * Whether evaluator outputs remain sealed.
     * Must be true — review must not begin after unsealing.
     */
    evaluatorOutputsSealed: z.boolean(),

    /**
     * Whether the pilot corpus manifest integrity has been verified.
     */
    corpusManifestVerified: z.boolean(),

    /**
     * Whether reviewer assignment can be randomised or independently controlled.
     */
    assignmentRandomisable: z.boolean(),

    /**
     * Whether any reviewer has accessed expected document findings.
     * Must be false.
     */
    reviewerAccessedExpectedFindings: z.boolean(),

    // ----- Criterion detail -----

    /**
     * Per-criterion assessment records.
     */
    criteria: z
      .array(ReadinessCriterionSchema)
      .min(1, "At least one readiness criterion must be assessed"),

    // ----- Readiness outcome -----

    /**
     * Computed readiness outcome.
     */
    readinessOutcome: ReadinessOutcomeSchema,

    /**
     * Summary of blocking gaps, if any.
     */
    blockingGaps: z.array(z.string()).optional(),

    /**
     * Summary of non-critical gaps, if any (relevant for CONDITIONALLY_READY).
     */
    nonCriticalGaps: z.array(z.string()).optional(),

    /**
     * Exception record identifier if CONDITIONALLY_READY.
     * Required when readinessOutcome is CONDITIONALLY_READY.
     */
    conditionalExceptionRecordId: z.string().optional(),

    /**
     * Whether the exception was independently approved.
     * Required when readinessOutcome is CONDITIONALLY_READY.
     */
    conditionalExceptionApproved: z.boolean().optional(),

    /**
     * Narrative assessment of readiness.
     */
    assessmentNarrative: z
      .string()
      .min(20, "assessmentNarrative must contain substantive commentary"),
  })
  .superRefine((val, ctx) => {
    const isReady = val.readinessOutcome === "READY";
    const isConditional = val.readinessOutcome === "CONDITIONALLY_READY";

    // Critical: READY requires genuine qualified reviewers
    if (isReady && val.genuineQualifiedReviewerCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when genuineQualifiedReviewerCount is 0",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires two-reviewer coverage
    if (isReady && !val.twoReviewerCoverageAchieved) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY without twoReviewerCoverageAchieved",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires adjudication coverage
    if (isReady && !val.adjudicationCoverageExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY without adjudicationCoverageExists",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires consent complete
    if (isReady && !val.consentComplete) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when consentComplete is false",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires confidentiality complete
    if (isReady && !val.confidentialityComplete) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when confidentialityComplete is false",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires conflicts assessed
    if (isReady && !val.conflictsIndependentlyAssessed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when conflictsIndependentlyAssessed is false",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires evaluator outputs sealed
    if (isReady && !val.evaluatorOutputsSealed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when evaluatorOutputsSealed is false",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY requires corpus manifest verified
    if (isReady && !val.corpusManifestVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when corpusManifestVerified is false",
        path: ["readinessOutcome"],
      });
    }

    // Critical: READY forbidden if any reviewer accessed expected findings
    if (isReady && val.reviewerAccessedExpectedFindings) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be READY when reviewerAccessedExpectedFindings is true",
        path: ["readinessOutcome"],
      });
    }

    // CONDITIONALLY_READY requires exception record
    if (isConditional && !val.conditionalExceptionRecordId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "conditionalExceptionRecordId must be specified when readinessOutcome is CONDITIONALLY_READY",
        path: ["conditionalExceptionRecordId"],
      });
    }

    // CONDITIONALLY_READY also requires zero genuine qualified reviewers check
    if (isConditional && val.genuineQualifiedReviewerCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "readinessOutcome cannot be CONDITIONALLY_READY when genuineQualifiedReviewerCount is 0; NOT_READY is required",
        path: ["readinessOutcome"],
      });
    }
  });

export type ReviewerReadinessAssessment = z.infer<
  typeof ReviewerReadinessAssessmentSchema
>;

// ---------------------------------------------------------------------------
// Standard readiness criteria definitions
// ---------------------------------------------------------------------------

/** Standard readiness criterion IDs used in the DRA-VAL-001C assessment. */
export const STANDARD_READINESS_CRITERIA = [
  { id: "RC-01", description: "Genuine qualified reviewers exist (count > 0)", critical: true },
  { id: "RC-02", description: "At least two independent eligible reviewers per pilot document", critical: true },
  { id: "RC-03", description: "Domain expertise is adequate for all domains with pilot documents", critical: true },
  { id: "RC-04", description: "All reviewer conflicts have been independently assessed", critical: true },
  { id: "RC-05", description: "Consent records are complete for all assigned reviewers", critical: true },
  { id: "RC-06", description: "Confidentiality agreements are complete for all assigned reviewers", critical: true },
  { id: "RC-07", description: "Qualification exercises passed for all assigned reviewers", critical: true },
  { id: "RC-08", description: "Adjudication coverage exists for all domains with pilot documents", critical: true },
  { id: "RC-09", description: "Workload limits are respected for all planned assignments", critical: false },
  { id: "RC-10", description: "Evaluator outputs remain sealed", critical: true },
  { id: "RC-11", description: "Pilot corpus manifest integrity verified", critical: true },
  { id: "RC-12", description: "Reviewer assignment can be randomised or independently controlled", critical: false },
  { id: "RC-13", description: "No reviewer has accessed expected document findings", critical: true },
] as const;
