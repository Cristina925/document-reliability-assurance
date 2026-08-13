/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Conflict of Interest
 *
 * Defines schemas for conflict-of-interest disclosures and assessments.
 *
 * Invariants:
 *   - A reviewer cannot self-assess their own conflict declaration
 *   - DISQUALIFYING conflicts block qualification
 *   - MANAGEABLE conflicts require documented mitigation
 *   - REQUIRES_INDEPENDENT_ASSESSMENT blocks assignment until resolved
 *   - Assignment restrictions must be recorded for MANAGEABLE conflicts
 */

import { z } from "zod";
import { ScientificReviewerIdSchema } from "./reviewer-identity.js";

// ---------------------------------------------------------------------------
// Conflict type
// ---------------------------------------------------------------------------

export const CONFLICT_TYPES = [
  /** Financial interest in Runtime Governance Labs or DRA */
  "FINANCIAL_INTEREST_RGL",
  /** Employment, consulting, advisory, or contractual relationship with the project */
  "EMPLOYMENT_OR_ADVISORY_RELATIONSHIP",
  /** Involvement in CTS, DRA, evaluator design or implementation */
  "EVALUATOR_DEVELOPMENT_INVOLVEMENT",
  /** Involvement in benchmark engineering, corpus construction, or protocol design */
  "BENCHMARK_ENGINEERING_INVOLVEMENT",
  /** Prior access to evaluator outputs or expected document findings */
  "PRIOR_EVALUATOR_OUTPUT_ACCESS",
  /** Authorship of or contribution to a benchmark document */
  "BENCHMARK_DOCUMENT_AUTHORSHIP",
  /** Close personal or family relationship with founder or contributors */
  "CLOSE_PERSONAL_OR_FAMILY_RELATIONSHIP",
  /** Organisational conflict (employer has interest in the outcome) */
  "ORGANISATIONAL_CONFLICT",
  /** Competitive conflict (reviewer or employer competes with RGL) */
  "COMPETITIVE_CONFLICT",
  /** Academic conflict (thesis, publication, or grant tied to outcome) */
  "ACADEMIC_CONFLICT",
  /** Reputational incentive to obtain a particular outcome */
  "REPUTATIONAL_INCENTIVE",
  /** Litigation or regulatory conflict related to the technology domain */
  "LITIGATION_OR_REGULATORY_CONFLICT",
  /** Other disclosed circumstance affecting impartiality */
  "OTHER",
] as const;

export type ConflictType = (typeof CONFLICT_TYPES)[number];

export const ConflictTypeSchema = z.enum(
  CONFLICT_TYPES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Conflict severity / classification
// ---------------------------------------------------------------------------

export const CONFLICT_SEVERITIES = [
  /** No conflict exists in this category */
  "NONE",
  /** Potential conflict disclosed but assessed as non-material */
  "DISCLOSED_NON_MATERIAL",
  /** Material conflict that can be managed with documented restrictions */
  "MANAGEABLE",
  /** Disqualifying — reviewer cannot participate as scientific reviewer */
  "DISQUALIFYING",
  /** Assessment cannot be made by the programme; requires independent assessment */
  "REQUIRES_INDEPENDENT_ASSESSMENT",
] as const;

export type ConflictSeverity = (typeof CONFLICT_SEVERITIES)[number];

export const ConflictSeveritySchema = z.enum(
  CONFLICT_SEVERITIES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Individual conflict disclosure item
// ---------------------------------------------------------------------------

export const ConflictDisclosureItemSchema = z.object({
  /** Which conflict category this item addresses */
  conflictType: ConflictTypeSchema,

  /**
   * Whether a conflict in this category exists.
   * Must be filled for every conflict type.
   */
  conflictExists: z.boolean(),

  /**
   * Severity classification as declared by the reviewer.
   * Assessors may override this.
   */
  declaredSeverity: ConflictSeveritySchema,

  /**
   * Detailed description of the conflict, if any.
   * Required when conflictExists is true.
   */
  disclosureDetails: z.string().optional(),
});

export type ConflictDisclosureItem = z.infer<typeof ConflictDisclosureItemSchema>;

// ---------------------------------------------------------------------------
// Conflict-of-interest declaration
// ---------------------------------------------------------------------------

export const ConflictDisclosureSchema = z.object({
  /**
   * Identifier of the reviewer making the declaration.
   */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * Version of the COI declaration form used.
   * Must correspond to a registered declaration version.
   */
  declarationVersion: z
    .string()
    .min(1, "declarationVersion must not be empty"),

  /**
   * ISO-8601 timestamp of when the declaration was made.
   */
  declarationTimestamp: z.string().min(1, "declarationTimestamp must not be empty"),

  /**
   * Disclosure items — one per conflict type.
   * Must cover all recognised conflict types.
   */
  disclosureItems: z
    .array(ConflictDisclosureItemSchema)
    .min(1, "At least one disclosure item is required"),

  /**
   * Whether the reviewer has explicitly attested that the declaration is
   * complete and accurate to the best of their knowledge.
   * Must be true for the declaration to be valid.
   */
  declarantAttestation: z.literal(true, {
    errorMap: () => ({
      message:
        "declarantAttestation must be true; the reviewer must explicitly attest that the declaration is complete",
    }),
  }),

  /**
   * Whether the reviewer has any additional potential conflicts not
   * captured by the structured items above.
   */
  additionalConflictDetails: z.string().optional(),
});

export type ConflictDisclosure = z.infer<typeof ConflictDisclosureSchema>;

// ---------------------------------------------------------------------------
// Conflict assessment (performed by an independent assessor)
// ---------------------------------------------------------------------------

export const ConflictAssessmentSchema = z.object({
  /**
   * The conflict disclosure being assessed.
   */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * Identifier of the person performing the assessment.
   * Must differ from reviewerId — a reviewer cannot self-assess.
   */
  assessorId: z
    .string()
    .min(1, "assessorId must identify the independent assessor"),

  /** ISO-8601 timestamp of the assessment. */
  assessmentTimestamp: z.string().min(1),

  /**
   * Per-conflict-type assessed severities.
   * Assessors may revise the reviewer's declared severities.
   */
  assessedItems: z
    .array(
      z.object({
        conflictType: ConflictTypeSchema,
        assessedSeverity: ConflictSeveritySchema,
        assessorRationale: z.string().min(1, "assessorRationale must not be empty"),
        mitigationRequired: z.boolean(),
        mitigationDescription: z.string().optional(),
        assignmentRestriction: z.string().optional(),
      }),
    )
    .min(1, "At least one assessed item is required"),

  /**
   * Overall conflict disposition — the most severe assessed level.
   * Computed from assessedItems but must be explicitly stated.
   */
  overallDisposition: ConflictSeveritySchema,

  /**
   * Whether the reviewer is cleared for assignment.
   * Must be false if overallDisposition is DISQUALIFYING or
   * REQUIRES_INDEPENDENT_ASSESSMENT.
   */
  clearedForAssignment: z.boolean(),

  /**
   * Summary of any assignment restrictions arising from managed conflicts.
   */
  assignmentRestrictions: z.array(z.string()).optional(),

  /**
   * Whether independent external assessment is required before proceeding.
   */
  independentAssessmentRequired: z.boolean(),
}).superRefine((val, ctx) => {
  if (val.reviewerId === val.assessorId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "assessorId must differ from reviewerId; a reviewer cannot self-assess their own conflict declaration",
      path: ["assessorId"],
    });
  }

  const disqualifying =
    val.overallDisposition === "DISQUALIFYING" ||
    val.overallDisposition === "REQUIRES_INDEPENDENT_ASSESSMENT";

  if (disqualifying && val.clearedForAssignment) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "clearedForAssignment must be false when overallDisposition is DISQUALIFYING or REQUIRES_INDEPENDENT_ASSESSMENT",
      path: ["clearedForAssignment"],
    });
  }

  const manageableItems = val.assessedItems.filter(
    (i) => i.assessedSeverity === "MANAGEABLE",
  );
  for (const item of manageableItems) {
    if (!item.mitigationDescription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `MANAGEABLE conflict of type ${item.conflictType} requires a mitigationDescription`,
        path: ["assessedItems"],
      });
    }
  }
});

export type ConflictAssessment = z.infer<typeof ConflictAssessmentSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the assessment blocks qualification. */
export function isConflictDisqualifying(
  assessment: ConflictAssessment,
): boolean {
  return (
    assessment.overallDisposition === "DISQUALIFYING" ||
    assessment.overallDisposition === "REQUIRES_INDEPENDENT_ASSESSMENT"
  );
}

/** Returns true when the assessment has unresolved managed conflicts. */
export function hasUnresolvedConflicts(
  assessment: ConflictAssessment,
): boolean {
  return assessment.assessedItems.some(
    (i) =>
      i.assessedSeverity === "MANAGEABLE" && !i.mitigationDescription,
  );
}
