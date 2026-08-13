/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Reviewer Record & Registry
 *
 * Defines the full scientific reviewer record, workload/availability constraints,
 * assignment restrictions, registry, and deterministic digest computation.
 *
 * Invariants:
 *   - Registry is append-only; past records are never silently overwritten
 *   - Registry digest is deterministic and must be computed before freeze
 *   - Placeholder reviewers are rejected
 *   - Withdrawn and suspended reviewers cannot be assigned
 *   - Qualification requires experience evidence, conflict assessment,
 *     consent, confidentiality, and completed exercises
 */

import { createHash } from "node:crypto";
import { z } from "zod";
import {
  ScientificReviewerIdSchema,
  ReviewerRecruitmentStatusSchema,
  ReviewerQualificationStatusSchema,
  ReviewerCategorySchema,
} from "./reviewer-identity.js";
import { ReviewerDomainExpertiseSchema } from "./reviewer-experience.js";

// ---------------------------------------------------------------------------
// Workload limit
// ---------------------------------------------------------------------------

export const ReviewerWorkloadLimitSchema = z.object({
  /**
   * Maximum number of scientific corpus documents this reviewer may be
   * assigned for primary review in the pilot.
   * Must be ≥ 1.
   */
  maxPilotDocuments: z.number().int().min(1),

  /**
   * Maximum number of scientific corpus documents this reviewer may
   * be assigned across the full benchmark.
   * Must be ≥ maxPilotDocuments.
   */
  maxFullBenchmarkDocuments: z.number().int().min(1),

  /**
   * Maximum number of documents for which this reviewer may act as
   * adjudicator (if eligible).
   * Must be ≥ 0.
   */
  maxAdjudicationDocuments: z.number().int().min(0),

  /**
   * Rationale for any limits below the programme default.
   */
  limitRationale: z.string().optional(),
});

export type ReviewerWorkloadLimit = z.infer<typeof ReviewerWorkloadLimitSchema>;

// ---------------------------------------------------------------------------
// Reviewer availability (post-qualification, for scheduling)
// ---------------------------------------------------------------------------

export const ReviewerAvailabilitySchema = z.object({
  /**
   * Whether the reviewer is available for assignment in the current window.
   */
  currentlyAvailable: z.boolean(),

  /**
   * Estimated hours per week available for review work.
   */
  hoursPerWeekAvailable: z.number().int().min(0),

  /**
   * Date from which the reviewer is available. ISO-8601.
   */
  availableFrom: z.string().optional(),

  /**
   * Known unavailability periods.
   */
  unavailabilityPeriods: z.array(z.string()).optional(),

  /**
   * ISO-8601 timestamp when availability was last confirmed.
   */
  availabilityLastConfirmed: z.string().optional(),
});

export type ReviewerAvailability = z.infer<typeof ReviewerAvailabilitySchema>;

// ---------------------------------------------------------------------------
// Assignment restriction
// ---------------------------------------------------------------------------

export const ReviewerAssignmentRestrictionSchema = z.object({
  /**
   * Restriction type.
   * Free text describing the nature of the restriction.
   */
  restrictionType: z.string().min(1, "restrictionType must not be empty"),

  /**
   * Specific restriction: which documents, domains, or roles are blocked.
   */
  restriction: z.string().min(1, "restriction must not be empty"),

  /**
   * Source of the restriction (e.g. conflict assessment, workload limit).
   */
  restrictionSource: z.string().min(1),

  /**
   * Whether the restriction is permanent or temporary.
   */
  permanent: z.boolean(),

  /**
   * Expiry date of a temporary restriction. ISO-8601.
   */
  expiryDate: z.string().optional(),
});

export type ReviewerAssignmentRestriction = z.infer<
  typeof ReviewerAssignmentRestrictionSchema
>;

// ---------------------------------------------------------------------------
// Scientific reviewer record
// ---------------------------------------------------------------------------

export const ScientificReviewerRecordSchema = z
  .object({
    /**
     * Unique reviewer identifier. DRA-REV-NNNN format.
     */
    reviewerId: ScientificReviewerIdSchema,

    /**
     * Reviewer display name for attribution purposes.
     * May be "Anonymous" per reviewer preference.
     * Must not be a generic placeholder like "Reviewer 1".
     */
    displayName: z
      .string()
      .min(1, "displayName must not be empty")
      .refine(
        (n) => !/^(reviewer\s*\d+|placeholder|tbd|tbc|unknown)$/i.test(n.trim()),
        {
          message:
            "displayName must not be a placeholder; use a real name or 'Anonymous' per reviewer preference",
        },
      ),

    /**
     * Whether the reviewer has requested anonymity.
     */
    anonymous: z.boolean(),

    /** Recruitment status. */
    recruitmentStatus: ReviewerRecruitmentStatusSchema,

    /** Qualification status. */
    qualificationStatus: ReviewerQualificationStatusSchema,

    /** Reviewer category / categories. */
    reviewerCategories: z
      .array(ReviewerCategorySchema)
      .min(1, "At least one reviewer category is required"),

    /**
     * Domains for which this reviewer has verified expertise.
     */
    domainExpertise: z
      .array(ReviewerDomainExpertiseSchema)
      .min(1, "At least one domain expertise record is required"),

    /**
     * Summary of verified experience. Free text.
     */
    verifiedExperienceSummary: z
      .string()
      .min(10, "verifiedExperienceSummary must not be empty"),

    /**
     * References to supporting evidence.
     */
    evidenceReferences: z
      .array(z.string().min(1))
      .min(1, "At least one evidence reference is required"),

    /** Whether conflict declaration has been submitted. */
    conflictDeclarationStatus: z.enum([
      "NOT_SUBMITTED",
      "SUBMITTED",
      "ASSESSED",
      "CLEARED",
      "DISQUALIFYING",
    ]),

    /** Overall conflict disposition from the independent assessment. */
    conflictDisposition: z
      .enum([
        "NOT_ASSESSED",
        "NONE",
        "DISCLOSED_NON_MATERIAL",
        "MANAGEABLE",
        "DISQUALIFYING",
        "REQUIRES_INDEPENDENT_ASSESSMENT",
      ])
      .optional(),

    /** Whether consent is complete. */
    consentStatus: z.enum([
      "NOT_SUBMITTED",
      "COMPLETE",
      "REVOKED",
    ]),

    /** Whether confidentiality agreement is complete. */
    confidentialityStatus: z.enum([
      "NOT_ACCEPTED",
      "ACCEPTED",
      "EXPIRED",
    ]),

    /** Qualification exercise status. */
    qualificationExerciseStatus: z.enum([
      "NOT_STARTED",
      "IN_PROGRESS",
      "COMPLETE",
      "FAILED",
    ]),

    /** Qualification score summary (brief free text). */
    qualificationScoreSummary: z.string().optional(),

    /** Qualification decision. */
    qualificationDecision: z
      .enum([
        "PENDING",
        "QUALIFIED_GENERAL",
        "QUALIFIED_DOMAIN_SPECIALIST",
        "QUALIFIED_ADJUDICATOR",
        "CONDITIONALLY_QUALIFIED",
        "REQUIRES_MORE_EVIDENCE",
        "NOT_QUALIFIED",
        "DISQUALIFIED_CONFLICT",
        "WITHDRAWN",
      ])
      .optional(),

    /**
     * Identifier of the person who made the qualification decision.
     * Must differ from the reviewer.
     */
    qualificationDecisionMakerId: z.string().optional(),

    /** Workload limit for this reviewer. */
    workloadLimit: ReviewerWorkloadLimitSchema.optional(),

    /** Availability record. */
    availability: ReviewerAvailabilitySchema.optional(),

    /**
     * Assignment restrictions arising from conflicts, workload, or other factors.
     */
    assignmentRestrictions: z.array(ReviewerAssignmentRestrictionSchema).optional(),

    /** Whether this reviewer is currently withdrawn. */
    withdrawn: z.boolean(),

    /** Whether this reviewer is currently suspended. */
    suspended: z.boolean(),

    /** ISO-8601 timestamp of record creation. */
    createdAt: z.string().min(1),

    /** ISO-8601 timestamp of last status update. */
    lastUpdatedAt: z.string().min(1),

    /**
     * Deterministic integrity digest of the substantive fields.
     * Computed by computeReviewerRecordDigest.
     */
    integrityDigest: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    // Self-approval check
    if (
      val.qualificationDecisionMakerId &&
      val.qualificationDecisionMakerId === val.reviewerId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "qualificationDecisionMakerId must differ from reviewerId; reviewers cannot approve their own qualification",
        path: ["qualificationDecisionMakerId"],
      });
    }
  });

export type ScientificReviewerRecord = z.infer<
  typeof ScientificReviewerRecordSchema
>;

// ---------------------------------------------------------------------------
// Reviewer registry
// ---------------------------------------------------------------------------

export const ReviewerRegistrySchema = z.object({
  /**
   * Schema / registry version identifier.
   */
  schemaVersion: z.string().min(1),

  /**
   * ISO-8601 timestamp when this registry snapshot was generated.
   */
  generatedAt: z.string().min(1),

  /**
   * All reviewer records in the registry.
   * Append-only — records are added, not removed or overwritten.
   */
  reviewers: z.array(ScientificReviewerRecordSchema),

  /**
   * Total planned recruitment target (headcount).
   */
  plannedRecruitmentTarget: z.number().int().min(0),

  /**
   * Current counts by status.
   * These are computed from `reviewers` and must not be entered manually.
   */
  statusCounts: z.object({
    planned: z.number().int().min(0),
    prospect: z.number().int().min(0),
    contacted: z.number().int().min(0),
    applied: z.number().int().min(0),
    screened: z.number().int().min(0),
    qualified: z.number().int().min(0),
    conditionallyQualified: z.number().int().min(0),
    rejected: z.number().int().min(0),
    withdrawn: z.number().int().min(0),
    suspended: z.number().int().min(0),
  }),

  /**
   * Open recruitment requirement description.
   * Populated when the minimum reviewer pool has not been met.
   */
  openRecruitmentRequirement: z.string().optional(),

  /**
   * Deterministic registry digest.
   * Computed by computeReviewerRegistryDigest.
   */
  registryDigest: z.string().optional(),
});

export type ReviewerRegistry = z.infer<typeof ReviewerRegistrySchema>;

// ---------------------------------------------------------------------------
// Digest computation (deterministic, follows corpus-manifest pattern)
// ---------------------------------------------------------------------------

/** Canonical JSON stringify — keys sorted recursively. */
function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalJson).join(",") + "]";
  const rec = obj as Record<string, unknown>;
  const sorted = Object.keys(rec)
    .sort()
    .map((k) => JSON.stringify(k) + ":" + canonicalJson(rec[k]));
  return "{" + sorted.join(",") + "}";
}

/**
 * Computes a deterministic SHA-256 digest of the substantive fields of a
 * reviewer record, excluding operational metadata
 * (integrityDigest, createdAt, lastUpdatedAt).
 */
export function computeReviewerRecordDigest(
  record: Omit<ScientificReviewerRecord, "integrityDigest" | "createdAt" | "lastUpdatedAt">,
): string {
  const { ...rest } = record as Record<string, unknown>;
  return createHash("sha256")
    .update(canonicalJson(rest), "utf8")
    .digest("hex");
}

/**
 * Computes a deterministic SHA-256 digest of the registry, excluding the
 * `registryDigest` field itself and the `generatedAt` timestamp.
 */
export function computeReviewerRegistryDigest(
  registry: Omit<ReviewerRegistry, "registryDigest" | "generatedAt">,
): string {
  return createHash("sha256")
    .update(canonicalJson(registry), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Registry helpers
// ---------------------------------------------------------------------------

/**
 * Computes status counts from a list of reviewer records.
 * Always use this function — manual entry is prohibited.
 */
export function computeRegistryStatusCounts(
  reviewers: ScientificReviewerRecord[],
): ReviewerRegistry["statusCounts"] {
  const counts = {
    planned: 0,
    prospect: 0,
    contacted: 0,
    applied: 0,
    screened: 0,
    qualified: 0,
    conditionallyQualified: 0,
    rejected: 0,
    withdrawn: 0,
    suspended: 0,
  };
  for (const r of reviewers) {
    switch (r.recruitmentStatus) {
      case "PLANNED": counts.planned++; break;
      case "PROSPECT": counts.prospect++; break;
      case "CONTACTED": counts.contacted++; break;
      case "APPLIED": counts.applied++; break;
      case "SCREENED": counts.screened++; break;
      case "QUALIFIED": counts.qualified++; break;
      case "CONDITIONALLY_QUALIFIED": counts.conditionallyQualified++; break;
      case "REJECTED": counts.rejected++; break;
      case "WITHDRAWN": counts.withdrawn++; break;
      case "SUSPENDED": counts.suspended++; break;
    }
  }
  return counts;
}
