/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: licence.ts — Licence assessment schema and helpers
 *
 * Implements the governed licence assessment record. Distinct from the
 * existing acquisition/provenance.ts LicenceStatus enum, which classifies
 * the licence type (CC0/CC_BY/etc.). LicenceAssessment here records the
 * human-review outcome (VERIFIED/REVIEW_REQUIRED/REJECTED) and the evidence
 * supporting that outcome.
 *
 * Boundary invariants:
 *   - VERIFIED requires at least one evidence item.
 *   - No automated legal-certainty claims are ever made.
 *   - REJECTED and REVIEW_REQUIRED both block freeze eligibility unconditionally.
 *   - Missing licence information must not default to VERIFIED.
 *   - Public-domain and government-work bases are explicitly supported.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Licence assessment status
// ---------------------------------------------------------------------------

export const LICENCE_ASSESSMENT_STATUSES = [
  "VERIFIED",
  "REVIEW_REQUIRED",
  "REJECTED",
] as const;

export type LicenceAssessmentStatus =
  (typeof LICENCE_ASSESSMENT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Licence basis values — informational labels, not legal advice
// ---------------------------------------------------------------------------

export const LICENCE_BASIS_VALUES = [
  "OPEN_LICENCE",
  "CREATIVE_COMMONS_BY",
  "CREATIVE_COMMONS_BY_SA",
  "CREATIVE_COMMONS_BY_ND",
  "CREATIVE_COMMONS_ZERO",
  "PUBLIC_DOMAIN",
  "US_GOVERNMENT_WORK",
  "OTHER_PERMISSIVE",
  "UNKNOWN",
] as const;

export type LicenceBasis = (typeof LICENCE_BASIS_VALUES)[number];

// ---------------------------------------------------------------------------
// LicenceAssessment
// ---------------------------------------------------------------------------

/**
 * A governed assessment of the licence under which a document may be used.
 *
 * This assessment must be reviewed by a qualified person before a document
 * may be frozen. The pipeline does not make automated legal-certainty claims.
 *
 * Freeze eligibility requires status VERIFIED.
 * Status REJECTED or REVIEW_REQUIRED blocks freeze unconditionally.
 */
export const LicenceAssessmentSchema = z
  .object({
    /**
     * Assessment outcome.
     *  VERIFIED — a human has confirmed the licence permits benchmark use.
     *  REVIEW_REQUIRED — licence information requires expert review before use.
     *  REJECTED — licence does not permit use or is too unclear to proceed.
     */
    status: z.enum(
      LICENCE_ASSESSMENT_STATUSES as unknown as [string, ...string[]],
    ),

    /** Human-readable name of the licence, if known (e.g. "CC BY 4.0"). */
    licenceName: z.string().min(1).optional(),

    /** URL pointing to the licence text or licence record. */
    licenceUrl: z.string().url().optional(),

    /**
     * Recognised licence basis category.
     * US_GOVERNMENT_WORK and PUBLIC_DOMAIN are the expected bases for public
     * documents produced by government agencies.
     */
    licenceBasis: z
      .enum(LICENCE_BASIS_VALUES as unknown as [string, ...string[]])
      .optional(),

    /**
     * Evidence items supporting the licence assessment.
     * VERIFIED status requires at least one evidence item.
     */
    evidence: z.array(z.string().min(1)),

    /** Identity of the person who performed this assessment. */
    assessedBy: z.string().min(1, { message: "assessedBy must not be empty" }),

    /** ISO-8601 timestamp of the assessment. */
    assessedAt: z
      .string()
      .refine(
        (s) => s.includes("T") && !isNaN(Date.parse(s)),
        { message: "assessedAt must be a valid ISO-8601 datetime string" },
      ),

    /** Optional assessor notes. */
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === "VERIFIED" && val.evidence.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        type: "array",
        inclusive: true,
        path: ["evidence"],
        message:
          "VERIFIED licence assessment requires at least one evidence item",
      });
    }
  });

export type LicenceAssessment = z.infer<typeof LicenceAssessmentSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the licence assessment permits freeze eligibility.
 * Only VERIFIED is accepted; REVIEW_REQUIRED and REJECTED both block.
 */
export function isLicenceApproved(assessment: LicenceAssessment): boolean {
  return assessment.status === "VERIFIED";
}

/**
 * Returns true if the licence basis is an explicit public-domain or
 * government-work classification (US_GOVERNMENT_WORK, PUBLIC_DOMAIN,
 * or CREATIVE_COMMONS_ZERO).
 *
 * This is informational and does not constitute legal advice.
 */
export function isPublicDomainBasis(assessment: LicenceAssessment): boolean {
  return (
    assessment.licenceBasis === "PUBLIC_DOMAIN" ||
    assessment.licenceBasis === "US_GOVERNMENT_WORK" ||
    assessment.licenceBasis === "CREATIVE_COMMONS_ZERO"
  );
}
