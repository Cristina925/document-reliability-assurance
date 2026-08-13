/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Assignment Preparation
 *
 * Defines schemas for reviewer assignment readiness structures.
 * Assignment preparation is the final pre-execution step; actual assignments
 * are frozen only when genuine qualified reviewers exist and the scientific
 * lead explicitly freezes the plan.
 *
 * Invariants:
 *   - Assignment plans must not reveal co-reviewer identities to reviewers
 *   - Assignments must not proceed until corpus manifest verifies
 *   - Assignments must not be frozen if evaluator outputs have been accessed
 *   - Each document must have ≥ 2 independent reviewers assigned
 *   - Adjudicators must not be assigned to documents they reviewed as primary
 */

import { z } from "zod";
import { ScientificReviewerIdSchema } from "./reviewer-identity.js";
import { ReviewerDomainSchema } from "./reviewer-experience.js";

// ---------------------------------------------------------------------------
// Assignment plan status
// ---------------------------------------------------------------------------

export const ASSIGNMENT_PLAN_STATUSES = [
  /** Draft — being constructed, not validated */
  "DRAFT",
  /** Blocked — one or more mandatory prerequisites not met */
  "BLOCKED",
  /** All prerequisites met; ready for scientific lead approval and freeze */
  "READY_FOR_FREEZE",
  /** Frozen — assignments are locked and may not be changed without amendment */
  "FROZEN",
] as const;

export type AssignmentPlanStatus = (typeof ASSIGNMENT_PLAN_STATUSES)[number];

export const AssignmentPlanStatusSchema = z.enum(
  ASSIGNMENT_PLAN_STATUSES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Eligible reviewer pool
// ---------------------------------------------------------------------------

export const EligibleReviewerPoolSchema = z.object({
  /**
   * ISO-8601 timestamp when this pool snapshot was taken.
   */
  poolGeneratedAt: z.string().min(1),

  /**
   * Reviewer IDs who are currently eligible for assignment.
   * A reviewer is eligible only when:
   *   - recruitmentStatus is QUALIFIED or CONDITIONALLY_QUALIFIED
   *   - conflictDisposition is not DISQUALIFYING
   *   - consentStatus is COMPLETE
   *   - confidentialityStatus is ACCEPTED
   *   - not withdrawn
   *   - not suspended
   */
  eligibleReviewerIds: z.array(ScientificReviewerIdSchema),

  /**
   * Reviewer IDs who are eligible as adjudicators.
   * Must be a subset of eligibleReviewerIds.
   */
  eligibleAdjudicatorIds: z.array(ScientificReviewerIdSchema),

  /**
   * Total eligible reviewer count.
   */
  totalEligibleReviewers: z.number().int().min(0),

  /**
   * Total eligible adjudicators.
   */
  totalEligibleAdjudicators: z.number().int().min(0),
});

export type EligibleReviewerPool = z.infer<typeof EligibleReviewerPoolSchema>;

// ---------------------------------------------------------------------------
// Compatibility assessments (per reviewer-document pairing)
// ---------------------------------------------------------------------------

export const DomainCompatibilitySchema = z.object({
  reviewerId: ScientificReviewerIdSchema,
  /** Corpus document identifier. */
  documentId: z.string().min(1),
  domain: ReviewerDomainSchema,
  /** Whether the reviewer has verified expertise in the document's domain. */
  domainCompatible: z.boolean(),
  /** Whether domain expertise was formally verified. */
  expertiseVerified: z.boolean(),
});

export type DomainCompatibility = z.infer<typeof DomainCompatibilitySchema>;

export const ConflictCompatibilitySchema = z.object({
  reviewerId: ScientificReviewerIdSchema,
  documentId: z.string().min(1),
  /** Whether the reviewer has a conflict that blocks assignment to this document. */
  conflictBlocked: z.boolean(),
  /** Source of the conflict block, if any. */
  conflictBlockReason: z.string().optional(),
});

export type ConflictCompatibility = z.infer<typeof ConflictCompatibilitySchema>;

export const WorkloadCompatibilitySchema = z.object({
  reviewerId: ScientificReviewerIdSchema,
  documentId: z.string().min(1),
  /** Current document assignment count for this reviewer. */
  currentAssignmentCount: z.number().int().min(0),
  /** Reviewer's workload limit. */
  workloadLimit: z.number().int().min(1),
  /** Whether this assignment would exceed the workload limit. */
  workloadExceeded: z.boolean(),
});

export type WorkloadCompatibility = z.infer<typeof WorkloadCompatibilitySchema>;

export const IndependenceCompatibilitySchema = z.object({
  reviewerId: ScientificReviewerIdSchema,
  documentId: z.string().min(1),
  /** Whether the reviewer is independent of other reviewers assigned to this document. */
  independent: z.boolean(),
  /** Reason for independence failure, if any. */
  independenceFailureReason: z.string().optional(),
});

export type IndependenceCompatibility = z.infer<typeof IndependenceCompatibilitySchema>;

export const AdjudicatorCompatibilitySchema = z.object({
  adjudicatorId: ScientificReviewerIdSchema,
  documentId: z.string().min(1),
  /**
   * Whether the adjudicator reviewed this document as a primary reviewer.
   * Must be false — adjudicators cannot adjudicate documents they reviewed.
   */
  isOriginalReviewer: z.boolean(),
  /** Whether this adjudicator-document pairing is compatible. */
  compatible: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.isOriginalReviewer && val.compatible) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "compatible must be false when isOriginalReviewer is true; adjudicators cannot adjudicate documents they initially reviewed",
      path: ["compatible"],
    });
  }
});

export type AdjudicatorCompatibility = z.infer<typeof AdjudicatorCompatibilitySchema>;

// ---------------------------------------------------------------------------
// Assignment seed (for reproducible randomisation)
// ---------------------------------------------------------------------------

export const AssignmentSeedSchema = z.object({
  /**
   * Hex-encoded 32-byte random seed for reproducible assignment randomisation.
   * Must be generated by a cryptographically secure source.
   */
  seedHex: z.string().regex(/^[0-9a-f]{64}$/, "seedHex must be a 64-character hex string"),

  /**
   * ISO-8601 timestamp when the seed was generated.
   */
  generatedAt: z.string().min(1),

  /**
   * Method used to generate the seed.
   */
  generationMethod: z.string().min(1),
});

export type AssignmentSeed = z.infer<typeof AssignmentSeedSchema>;

// ---------------------------------------------------------------------------
// Assignment plan
// ---------------------------------------------------------------------------

export const ReviewerAssignmentPlanSchema = z
  .object({
    /**
     * Assignment plan identifier. Format: AP-NNNN.
     */
    planId: z
      .string()
      .regex(/^AP-\d{4}$/, "planId must match AP-NNNN"),

    /**
     * Corpus version for which this plan is constructed.
     */
    corpusVersion: z.string().min(1),

    /**
     * ISO-8601 timestamp when the plan was created.
     */
    createdAt: z.string().min(1),

    /**
     * Assignment plan status.
     */
    planStatus: AssignmentPlanStatusSchema,

    /**
     * Reasons this plan is blocked, if status is BLOCKED.
     */
    blockers: z.array(z.string()).optional(),

    /**
     * Eligible reviewer pool snapshot used for this plan.
     */
    eligiblePool: EligibleReviewerPoolSchema,

    /**
     * Randomisation seed for assignment.
     * Required before plan can be frozen.
     */
    assignmentSeed: AssignmentSeedSchema.optional(),

    /**
     * Whether the corpus manifest integrity has been verified.
     * Must be true before freezing.
     */
    corpusManifestVerified: z.boolean(),

    /**
     * Whether evaluator outputs remain sealed.
     * Must be true — plans must not be frozen after evaluator outputs are unsealed.
     */
    evaluatorOutputsSealed: z.literal(true, {
      errorMap: () => ({
        message:
          "evaluatorOutputsSealed must be true; assignment plans must not be frozen after evaluator outputs are unsealed",
      }),
    }),

    /**
     * Document identifiers included in this assignment plan.
     */
    documentIds: z.array(z.string().min(1)).min(1),

    /**
     * Proposed per-document reviewer assignments.
     * Not populated until plan is READY_FOR_FREEZE.
     * Each document must have exactly 2 primary reviewers.
     */
    documentAssignments: z
      .array(
        z.object({
          documentId: z.string().min(1),
          primaryReviewerIds: z
            .array(ScientificReviewerIdSchema)
            .min(2, "Each document must have at least 2 primary reviewers"),
          adjudicatorId: ScientificReviewerIdSchema.optional(),
        }),
      )
      .optional(),

    /**
     * ISO-8601 timestamp of plan freeze, if frozen.
     */
    frozenAt: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.planStatus === "FROZEN" && !val.frozenAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "frozenAt must be set when planStatus is FROZEN",
        path: ["frozenAt"],
      });
    }
    if (val.planStatus === "FROZEN" && !val.assignmentSeed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "assignmentSeed must be set before plan can be FROZEN",
        path: ["assignmentSeed"],
      });
    }
    if (val.planStatus === "FROZEN" && !val.corpusManifestVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "corpusManifestVerified must be true before plan can be FROZEN",
        path: ["corpusManifestVerified"],
      });
    }
  });

export type ReviewerAssignmentPlan = z.infer<typeof ReviewerAssignmentPlanSchema>;
