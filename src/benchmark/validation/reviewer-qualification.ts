/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Qualification Schemas
 *
 * Defines schemas for qualification exercises, submissions, scoring, and
 * eligibility decisions.
 *
 * Invariants:
 *   - Reviewers cannot approve their own qualification
 *   - Qualification requires completed conflict assessment (assessed, not just declared)
 *   - Qualification requires consent and confidentiality acceptance
 *   - Qualification requires completed exercises
 *   - Adjudicator qualification requires prior reviewer qualification
 *   - Reviewers must not be qualified based solely on agreement with expected answers
 *   - Scoring dimensions include protocol compliance and written rationale quality
 */

import { z } from "zod";
import { ScientificReviewerIdSchema } from "./reviewer-identity.js";

// ---------------------------------------------------------------------------
// Qualification exercise type
// ---------------------------------------------------------------------------

export const QUALIFICATION_EXERCISE_TYPES = [
  "GENERAL_ASSURANCE",
  "DOMAIN_SPECIALIST",
  "ADJUDICATOR",
] as const;

export type QualificationExerciseType =
  (typeof QUALIFICATION_EXERCISE_TYPES)[number];

export const QualificationExerciseTypeSchema = z.enum(
  QUALIFICATION_EXERCISE_TYPES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Qualification dimensions
// ---------------------------------------------------------------------------

export const QUALIFICATION_DIMENSIONS = [
  /** Ability to identify issues in documents */
  "ISSUE_IDENTIFICATION",
  /** Ability to assess materiality of identified issues */
  "MATERIALITY_ASSESSMENT",
  /** Ability to compare document claims against source evidence */
  "EVIDENCE_SOURCE_COMPARISON",
  /** Ability to assess authority and scope of claims */
  "AUTHORITY_AND_SCOPE_ASSESSMENT",
  /** Ability to separate distinct issues correctly */
  "ISSUE_SEPARATION",
  /** Ability to assign severity levels consistently */
  "SEVERITY_ASSESSMENT",
  /** Ability to form a release recommendation */
  "RELEASE_RECOMMENDATION",
  /** Ability to record uncertainty appropriately */
  "UNCERTAINTY_RECORDING",
  /** Adherence to the frozen review protocol */
  "PROTOCOL_COMPLIANCE",
  /** Quality of written rationale for each finding */
  "WRITTEN_RATIONALE_QUALITY",
] as const;

export type QualificationDimension =
  (typeof QUALIFICATION_DIMENSIONS)[number];

export const QualificationDimensionSchema = z.enum(
  QUALIFICATION_DIMENSIONS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Qualification exercise (the exercise definition, not the submission)
// ---------------------------------------------------------------------------

export const QualificationExerciseSchema = z.object({
  /**
   * Unique identifier for this exercise. Format: QEX-NNNN.
   * Must not use frozen scientific corpus documents.
   */
  exerciseId: z
    .string()
    .regex(/^QEX-\d{4}$/, "exerciseId must match QEX-NNNN"),

  /** Type of qualification exercise */
  exerciseType: QualificationExerciseTypeSchema,

  /**
   * Title of the exercise.
   */
  exerciseTitle: z.string().min(1),

  /**
   * Whether this exercise uses a purpose-built training document (not a frozen corpus document).
   * Must be true — exercises must not use scientific corpus documents.
   */
  usesTrainingDocument: z.literal(true, {
    errorMap: () => ({
      message:
        "usesTrainingDocument must be true; qualification exercises must not use frozen scientific corpus documents",
    }),
  }),

  /**
   * Explicit label indicating this is training and qualification material.
   * Required by protocol — must not be confused with scientific evidence.
   */
  trainingMaterialLabel: z
    .string()
    .min(10, "trainingMaterialLabel must clearly identify this as training/qualification material"),

  /**
   * Reference scoring dimensions assessed in this exercise.
   */
  dimensionsAssessed: z
    .array(QualificationDimensionSchema)
    .min(1, "At least one dimension must be assessed"),

  /**
   * Minimum passing score per dimension (0–100).
   * A reviewer who scores below this on any dimension fails.
   */
  minimumScorePerDimension: z.number().int().min(0).max(100),

  /**
   * Whether scoring allows credit for defensible alternative findings.
   * Must be true — reviewers must not be penalised for identifying valid
   * issues not anticipated in the reference answers.
   */
  allowsCreditForDefensibleAlternatives: z.literal(true, {
    errorMap: () => ({
      message:
        "allowsCreditForDefensibleAlternatives must be true; reviewers who identify defensible alternative findings must not be penalised",
    }),
  }),

  /**
   * Whether a qualitative assessor review is required alongside scoring.
   * Must be true — structured scoring alone is insufficient.
   */
  requiresQualitativeAssessment: z.literal(true, {
    errorMap: () => ({
      message:
        "requiresQualitativeAssessment must be true; qualification requires qualitative assessment, not only structured scoring",
    }),
  }),

  /** Version of this exercise. */
  exerciseVersion: z.string().min(1),
});

export type QualificationExercise = z.infer<typeof QualificationExerciseSchema>;

// ---------------------------------------------------------------------------
// Qualification submission (reviewer's response to an exercise)
// ---------------------------------------------------------------------------

export const QualificationSubmissionSchema = z.object({
  /** Reviewer who submitted this response. */
  reviewerId: ScientificReviewerIdSchema,

  /** Exercise being responded to. */
  exerciseId: z
    .string()
    .regex(/^QEX-\d{4}$/, "exerciseId must match QEX-NNNN"),

  /** ISO-8601 timestamp of submission. */
  submissionTimestamp: z.string().min(1),

  /**
   * The reviewer's written findings for the exercise document.
   * Must be non-empty — submissions with no findings cannot be assessed.
   */
  submittedFindings: z
    .string()
    .min(10, "submittedFindings must contain the reviewer's written findings"),

  /**
   * The reviewer's release recommendation for the exercise document.
   */
  releaseRecommendation: z.enum(["SUPPORTED", "REVIEW", "HOLD"]),

  /**
   * The reviewer's stated confidence level in their submission.
   */
  confidenceLevel: z.enum(["HIGH", "MEDIUM", "LOW", "UNCERTAIN"]),

  /** Total time spent on the exercise in minutes. */
  timeTakenMinutes: z.number().int().min(1).optional(),

  /**
   * Whether the reviewer completed the exercise without consulting
   * evaluator outputs or other reviewers.
   */
  independenceAttestation: z.literal(true, {
    errorMap: () => ({
      message:
        "independenceAttestation must be true; the reviewer must attest that the exercise was completed independently",
    }),
  }),
});

export type QualificationSubmission = z.infer<
  typeof QualificationSubmissionSchema
>;

// ---------------------------------------------------------------------------
// Qualification score (per-dimension scores assigned by an assessor)
// ---------------------------------------------------------------------------

export const QualificationScoreSchema = z.object({
  /** Reviewer being scored. */
  reviewerId: ScientificReviewerIdSchema,

  /** Exercise being scored. */
  exerciseId: z.string().regex(/^QEX-\d{4}$/),

  /**
   * Identifier of the person performing the scoring.
   * Must differ from the reviewer being scored.
   */
  scorerId: z.string().min(1, "scorerId must identify the assessor"),

  /**
   * ISO-8601 timestamp of scoring.
   */
  scoringTimestamp: z.string().min(1),

  /**
   * Per-dimension scores. Each score is 0–100.
   */
  dimensionScores: z
    .array(
      z.object({
        dimension: QualificationDimensionSchema,
        /** Score 0–100 */
        score: z.number().int().min(0).max(100),
        /** Assessor notes on this dimension */
        assessorNotes: z.string().min(1, "assessorNotes must not be empty"),
      }),
    )
    .min(1, "At least one dimension score is required"),

  /**
   * Credit awarded for defensible alternative findings.
   * A non-empty list here means the reviewer identified valid issues
   * beyond the reference answers.
   */
  defensibleAlternativeCredit: z
    .array(
      z.object({
        findingDescription: z.string().min(1),
        creditNotes: z.string().min(1),
      }),
    )
    .optional(),

  /** Overall pass/fail determination. */
  passFail: z.enum(["PASS", "FAIL", "CONDITIONAL_PASS"]),

  /** Qualitative assessment narrative (required alongside scoring). */
  qualitativeAssessment: z
    .string()
    .min(20, "qualitativeAssessment must contain substantive assessor commentary"),
}).superRefine((val, ctx) => {
  if (val.reviewerId === val.scorerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "scorerId must differ from reviewerId; a reviewer cannot score their own qualification exercise",
      path: ["scorerId"],
    });
  }
});

export type QualificationScore = z.infer<typeof QualificationScoreSchema>;

// ---------------------------------------------------------------------------
// Qualification assessment (overall eligibility decision)
// ---------------------------------------------------------------------------

export const QualificationAssessmentSchema = z.object({
  /** Reviewer being assessed. */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * Identifier of the person making the eligibility decision.
   * Must differ from the reviewer.
   */
  assessorId: z.string().min(1, "assessorId must identify the decision-maker"),

  /** ISO-8601 timestamp of this assessment. */
  assessmentTimestamp: z.string().min(1),

  /** Exercise IDs included in this assessment. */
  exercisesAssessed: z
    .array(z.string().regex(/^QEX-\d{4}$/))
    .min(1, "At least one exercise must be included in the assessment"),

  /**
   * Whether the conflict assessment was completed and cleared before
   * this qualification assessment. Must be true.
   */
  conflictAssessmentCleared: z.literal(true, {
    errorMap: () => ({
      message:
        "conflictAssessmentCleared must be true; qualification cannot proceed without a completed and cleared conflict assessment",
    }),
  }),

  /**
   * Whether the consent record is complete. Must be true.
   */
  consentComplete: z.literal(true, {
    errorMap: () => ({
      message:
        "consentComplete must be true; qualification cannot proceed without completed consent",
    }),
  }),

  /**
   * Whether the confidentiality agreement is accepted. Must be true.
   */
  confidentialityAccepted: z.literal(true, {
    errorMap: () => ({
      message:
        "confidentialityAccepted must be true; qualification cannot proceed without accepted confidentiality agreement",
    }),
  }),

  /**
   * Qualification outcome.
   */
  qualificationOutcome: z.enum([
    "QUALIFIED_GENERAL",
    "QUALIFIED_DOMAIN_SPECIALIST",
    "QUALIFIED_ADJUDICATOR",
    "CONDITIONALLY_QUALIFIED",
    "REQUIRES_MORE_EVIDENCE",
    "NOT_QUALIFIED",
    "DISQUALIFIED_CONFLICT",
    "WITHDRAWN",
  ]),

  /**
   * Domains for which domain specialist qualification is granted.
   * Only relevant when outcome includes QUALIFIED_DOMAIN_SPECIALIST.
   */
  qualifiedDomains: z.array(z.string()).optional(),

  /**
   * Whether the reviewer is qualified as an adjudicator.
   * Adjudicator qualification requires prior reviewer qualification.
   */
  adjudicatorQualified: z.boolean(),

  /**
   * If adjudicatorQualified, the prior reviewer qualification status
   * must be QUALIFIED_GENERAL or QUALIFIED_DOMAIN_SPECIALIST.
   */
  priorReviewerQualificationConfirmed: z.boolean(),

  /**
   * Any conditions or restrictions applied to a CONDITIONALLY_QUALIFIED outcome.
   * Required when qualificationOutcome is CONDITIONALLY_QUALIFIED.
   */
  conditionalRestrictions: z.array(z.string()).optional(),

  /**
   * Overall qualitative assessment narrative.
   */
  assessmentNarrative: z
    .string()
    .min(20, "assessmentNarrative must contain substantive assessment commentary"),
}).superRefine((val, ctx) => {
  if (val.reviewerId === val.assessorId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "assessorId must differ from reviewerId; a reviewer cannot approve their own qualification",
      path: ["assessorId"],
    });
  }

  if (val.adjudicatorQualified && !val.priorReviewerQualificationConfirmed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "adjudicatorQualified cannot be true without priorReviewerQualificationConfirmed; adjudicators must first be reviewer-qualified",
      path: ["adjudicatorQualified"],
    });
  }

  if (
    val.qualificationOutcome === "CONDITIONALLY_QUALIFIED" &&
    (!val.conditionalRestrictions || val.conditionalRestrictions.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "conditionalRestrictions must be specified when qualificationOutcome is CONDITIONALLY_QUALIFIED",
      path: ["conditionalRestrictions"],
    });
  }
});

export type QualificationAssessment = z.infer<
  typeof QualificationAssessmentSchema
>;

// ---------------------------------------------------------------------------
// Reviewer eligibility decision (final summary record)
// ---------------------------------------------------------------------------

export const ReviewerEligibilityDecisionSchema = z.object({
  /** Reviewer identifier. */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * ISO-8601 timestamp of the eligibility decision.
   */
  decisionTimestamp: z.string().min(1),

  /**
   * Identifier of the decision-maker. Must differ from the reviewer.
   */
  decisionMakerId: z.string().min(1),

  /** Final eligibility status. */
  eligibilityStatus: z.enum([
    "QUALIFIED_GENERAL",
    "QUALIFIED_DOMAIN_SPECIALIST",
    "QUALIFIED_ADJUDICATOR",
    "CONDITIONALLY_QUALIFIED",
    "NOT_QUALIFIED",
    "DISQUALIFIED_CONFLICT",
    "WITHDRAWN",
  ]),

  /**
   * Whether the reviewer is cleared to be counted in reviewer coverage metrics.
   * False for NOT_QUALIFIED, DISQUALIFIED_CONFLICT, WITHDRAWN, SUSPENDED.
   */
  countsTowardCoverage: z.boolean(),

  /**
   * Domains for which the reviewer is qualified.
   */
  qualifiedDomains: z.array(z.string()).optional(),

  /** Whether the reviewer may act as an adjudicator. */
  mayActAsAdjudicator: z.boolean(),

  /** Summary of assignment restrictions. */
  assignmentRestrictions: z.array(z.string()).optional(),
}).superRefine((val, ctx) => {
  if (val.reviewerId === val.decisionMakerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "decisionMakerId must differ from reviewerId; the reviewer may not approve their own eligibility",
      path: ["decisionMakerId"],
    });
  }
});

export type ReviewerEligibilityDecision = z.infer<
  typeof ReviewerEligibilityDecisionSchema
>;
