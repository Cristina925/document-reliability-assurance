/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Experience Schemas
 *
 * Defines domain expertise classification and experience evidence records.
 *
 * Invariants:
 *   - Every domain expertise claim must cite at least one evidence reference
 *   - Domain coverage must be evidence-backed, not self-declared alone
 *   - Unverifiable experience evidence blocks qualification
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Corpus domain enumeration (mirrors corpus-slots.ts CorpusDomain)
// ---------------------------------------------------------------------------

export const REVIEWER_DOMAINS = [
  "LEGAL_AND_REGULATORY",
  "HEALTHCARE_AND_LIFE_SCIENCES",
  "FINANCE_AND_ACCOUNTING",
  "CYBERSECURITY_AND_TECHNICAL_ASSURANCE",
  "BUSINESS_AND_EXECUTIVE_REPORTING",
  "PROCUREMENT_AND_THIRD_PARTY_RISK",
  "HR_AND_WORKPLACE_POLICY",
  "PUBLIC_POLICY_AND_GOVERNANCE",
  "GENERAL_OPERATIONAL",
] as const;

export type ReviewerDomain = (typeof REVIEWER_DOMAINS)[number];

export const ReviewerDomainSchema = z.enum(
  REVIEWER_DOMAINS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Experience evidence type
// ---------------------------------------------------------------------------

export const EXPERIENCE_EVIDENCE_TYPES = [
  "CV",
  "PROFESSIONAL_PROFILE",
  "PUBLICATION_LIST",
  "REGULATORY_REGISTRATION",
  "ACADEMIC_CREDENTIAL",
  "EMPLOYER_REFERENCE",
  "PEER_ATTESTATION",
  "PORTFOLIO_SAMPLE",
  "CERTIFICATION",
  "OTHER_DOCUMENTED",
] as const;

export type ExperienceEvidenceType =
  (typeof EXPERIENCE_EVIDENCE_TYPES)[number];

export const ExperienceEvidenceTypeSchema = z.enum(
  EXPERIENCE_EVIDENCE_TYPES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Experience verifiability
// ---------------------------------------------------------------------------

export const EXPERIENCE_VERIFIABILITY_STATUSES = [
  "VERIFIED",
  "SELF_DECLARED_PENDING_VERIFICATION",
  "UNVERIFIABLE",
  "EXPIRED",
] as const;

export type ExperienceVerifiabilityStatus =
  (typeof EXPERIENCE_VERIFIABILITY_STATUSES)[number];

export const ExperienceVerifiabilityStatusSchema = z.enum(
  EXPERIENCE_VERIFIABILITY_STATUSES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Reviewer domain expertise record
// ---------------------------------------------------------------------------

export const ReviewerDomainExpertiseSchema = z.object({
  /** Corpus domain for which expertise is claimed */
  domain: ReviewerDomainSchema,

  /**
   * Claimed years of relevant professional experience in this domain.
   * Must be ≥ 0.
   */
  yearsOfExperience: z.number().int().min(0),

  /**
   * Free-text summary of relevant experience in this domain.
   * Must not be empty.
   */
  experienceSummary: z
    .string()
    .min(20, "experienceSummary must describe relevant domain experience"),

  /**
   * References to supporting evidence items (indices into
   * ReviewerApplication.experienceEvidence or equivalent).
   * Must be non-empty — domain expertise requires at least one evidence item.
   */
  evidenceReferences: z
    .array(z.string().min(1))
    .min(1, "At least one evidence reference is required for each domain expertise claim"),

  /**
   * Verifiability status of the experience evidence for this domain.
   * UNVERIFIABLE evidence blocks domain specialist qualification.
   */
  verifiabilityStatus: ExperienceVerifiabilityStatusSchema,

  /** Whether this expertise was verified by the qualification assessor. */
  verifiedByAssessor: z.boolean(),
});

export type ReviewerDomainExpertise = z.infer<
  typeof ReviewerDomainExpertiseSchema
>;

// ---------------------------------------------------------------------------
// Experience evidence item
// ---------------------------------------------------------------------------

export const ReviewerExperienceEvidenceSchema = z.object({
  /**
   * Unique reference code for this evidence item within the application.
   * Used by ReviewerDomainExpertise.evidenceReferences.
   */
  evidenceReference: z.string().min(1),

  /** Type of evidence provided */
  evidenceType: ExperienceEvidenceTypeSchema,

  /**
   * Human-readable description of this evidence item.
   * For example: "CV — 8 years as CISO at [organisation]"
   */
  description: z.string().min(10, "description must describe the evidence item"),

  /**
   * Whether the evidence document or reference is attached or linked.
   * Must be true for the evidence to count toward qualification.
   */
  evidenceAttachedOrLinked: z.boolean(),

  /**
   * Verifiability status of this specific evidence item.
   */
  verifiabilityStatus: ExperienceVerifiabilityStatusSchema,

  /** Date the evidence was reviewed by the assessor, if available. */
  reviewedDate: z.string().optional(),

  /** Notes from the assessor reviewing this evidence item. */
  assessorNotes: z.string().optional(),
});

export type ReviewerExperienceEvidence = z.infer<
  typeof ReviewerExperienceEvidenceSchema
>;
