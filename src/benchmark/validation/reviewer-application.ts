/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Application Schema
 *
 * Defines the reviewer application record — the first formal step in the
 * qualification pipeline.
 *
 * Invariants:
 *   - An application must declare at least one domain
 *   - At least one experience evidence item must be provided
 *   - Applications cannot be marked COMPLETE without all mandatory fields
 *   - Private contact details must not appear in public artefacts
 */

import { z } from "zod";
import {
  ReviewerDomainExpertiseSchema,
  ReviewerExperienceEvidenceSchema,
} from "./reviewer-experience.js";

// ---------------------------------------------------------------------------
// Application status
// ---------------------------------------------------------------------------

export const REVIEWER_APPLICATION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "INFORMATION_REQUESTED",
  "COMPLETE",
  "WITHDRAWN",
  "REJECTED",
] as const;

export type ReviewerApplicationStatus =
  (typeof REVIEWER_APPLICATION_STATUSES)[number];

export const ReviewerApplicationStatusSchema = z.enum(
  REVIEWER_APPLICATION_STATUSES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Availability record
// ---------------------------------------------------------------------------

export const AVAILABILITY_LEVELS = [
  "FULL_AVAILABILITY",
  "PARTIAL_AVAILABILITY",
  "LIMITED_AVAILABILITY",
  "UNAVAILABLE",
] as const;

export type AvailabilityLevel = (typeof AVAILABILITY_LEVELS)[number];

export const AvailabilityLevelSchema = z.enum(
  AVAILABILITY_LEVELS as unknown as [string, ...string[]],
);

export const ReviewerAvailabilityDeclarationSchema = z.object({
  /** Availability level during the expected pilot review window. */
  pilotWindowAvailability: AvailabilityLevelSchema,

  /**
   * Estimated hours per week available for review work.
   * Must be ≥ 1 to be considered for assignment.
   */
  hoursPerWeekAvailable: z.number().int().min(1),

  /**
   * Earliest date from which the reviewer is available.
   * ISO-8601 date string.
   */
  availableFrom: z.string().optional(),

  /**
   * Any known unavailability periods (e.g. holiday, conference travel).
   */
  unavailabilityPeriods: z.array(z.string()).optional(),

  /** Maximum number of documents the reviewer is willing to review. */
  maximumDocumentsWilling: z.number().int().min(1),
});

export type ReviewerAvailabilityDeclaration = z.infer<
  typeof ReviewerAvailabilityDeclarationSchema
>;

// ---------------------------------------------------------------------------
// Prior contact / knowledge declaration
// ---------------------------------------------------------------------------

export const PriorKnowledgeDeclarationSchema = z.object({
  /** Whether the applicant has prior knowledge of CTS. */
  priorKnowledgeOfCts: z.boolean(),
  /** Whether the applicant has prior knowledge of DRA. */
  priorKnowledgeOfDra: z.boolean(),
  /** Whether the applicant has prior knowledge of Runtime Governance Labs. */
  priorKnowledgeOfRgl: z.boolean(),
  /** Whether the applicant has prior contact with the founder or contributors. */
  priorContactWithFounderOrContributors: z.boolean(),
  /** Free-text explanation of any prior knowledge declared above. */
  priorKnowledgeDetails: z.string().optional(),
});

export type PriorKnowledgeDeclaration = z.infer<
  typeof PriorKnowledgeDeclarationSchema
>;

// ---------------------------------------------------------------------------
// Reviewer application
// ---------------------------------------------------------------------------

export const ReviewerApplicationSchema = z.object({
  /**
   * Application reference. Format: APP-NNNN.
   * Assigned by the programme on submission.
   */
  applicationReference: z
    .string()
    .regex(/^APP-\d{4}$/, "applicationReference must match APP-NNNN"),

  /**
   * Applicant's name. Must not be empty.
   * Not included in public-facing scientific artefacts.
   */
  applicantName: z.string().min(1, "applicantName must not be empty"),

  /**
   * Applicant's professional role and organisation.
   * Not included in public-facing scientific artefacts.
   */
  applicantRole: z.string().optional(),
  applicantOrganisation: z.string().optional(),

  /**
   * Applicant's primary location and timezone.
   * Used for scheduling, not for public artefacts.
   */
  location: z.string().optional(),
  timezone: z.string().optional(),

  /**
   * Reviewer category the applicant is applying for.
   * Must be GENERAL_ASSURANCE_REVIEWER, DOMAIN_SPECIALIST, or ADJUDICATOR.
   */
  appliedCategory: z.enum([
    "GENERAL_ASSURANCE_REVIEWER",
    "DOMAIN_SPECIALIST",
    "ADJUDICATOR",
  ]),

  /**
   * Domain expertise claims. Minimum 1 required.
   * Must be evidence-backed.
   */
  domainExpertise: z
    .array(ReviewerDomainExpertiseSchema)
    .min(1, "At least one domain expertise claim is required"),

  /**
   * Experience evidence items supporting the domain expertise claims.
   * Minimum 1 required.
   */
  experienceEvidence: z
    .array(ReviewerExperienceEvidenceSchema)
    .min(1, "At least one experience evidence item is required"),

  /**
   * Years of total relevant professional experience.
   * Must be ≥ 0.
   */
  totalYearsRelevantExperience: z.number().int().min(0),

  /**
   * Languages in which the applicant can conduct review work.
   * Minimum 1.
   */
  reviewLanguages: z
    .array(z.string().min(1))
    .min(1, "At least one review language is required"),

  /** Availability declaration for the review window. */
  availability: ReviewerAvailabilityDeclarationSchema,

  /** Prior knowledge/contact declarations. */
  priorKnowledge: PriorKnowledgeDeclarationSchema,

  /**
   * Whether the applicant is willing to complete qualification exercises.
   * Must be true to proceed to qualification.
   */
  willingToCompleteQualification: z.boolean(),

  /**
   * Compensation expectations, if any. Optional free text.
   * Compensation terms are governed by the programme agreement.
   */
  compensationExpectations: z.string().optional(),

  /**
   * Status of this application record.
   */
  applicationStatus: ReviewerApplicationStatusSchema,

  /** Date the application was submitted. ISO-8601. */
  submissionDate: z.string().optional(),

  /**
   * Whether the applicant has accepted the confidentiality obligation
   * in principle at application stage. Full agreement follows at onboarding.
   */
  confidentialityAcceptedInPrinciple: z.boolean(),

  /**
   * Supporting evidence references (URIs, document titles, etc.).
   * Additional free-form evidence list beyond structured evidence items.
   */
  additionalEvidenceReferences: z.array(z.string()).optional(),
});

export type ReviewerApplication = z.infer<typeof ReviewerApplicationSchema>;
