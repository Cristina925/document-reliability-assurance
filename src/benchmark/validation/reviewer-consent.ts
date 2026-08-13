/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Consent and Confidentiality
 *
 * Defines schemas for reviewer consent records and confidentiality agreements.
 *
 * Invariants:
 *   - Consent must be explicitly given (consentGiven must be literally true)
 *   - A reviewer cannot be represented as having consented unless a genuine
 *     consent record with a timestamped attestation exists
 *   - Confidentiality agreement must be explicitly accepted
 *   - Revoked consent blocks further assignment
 *   - Consent withdrawal after anonymised aggregate analysis is partial only
 */

import { z } from "zod";
import { ScientificReviewerIdSchema } from "./reviewer-identity.js";

// ---------------------------------------------------------------------------
// Attribution preferences
// ---------------------------------------------------------------------------

export const ATTRIBUTION_PREFERENCES = [
  /** Reviewer wishes to be named in publications */
  "NAMED",
  /** Reviewer wishes to appear as an anonymous contributor */
  "ANONYMOUS",
  /** Reviewer defers to programme default */
  "PROGRAMME_DEFAULT",
] as const;

export type AttributionPreference = (typeof ATTRIBUTION_PREFERENCES)[number];

export const AttributionPreferenceSchema = z.enum(
  ATTRIBUTION_PREFERENCES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Reviewer consent record
// ---------------------------------------------------------------------------

export const ReviewerConsentRecordSchema = z.object({
  /** Reviewer identifier. */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * Version of the consent agreement signed.
   * Must correspond to a registered consent document version.
   */
  consentDocumentVersion: z
    .string()
    .min(1, "consentDocumentVersion must not be empty"),

  /**
   * ISO-8601 timestamp when consent was given.
   */
  consentTimestamp: z.string().min(1, "consentTimestamp must not be empty"),

  /**
   * Whether the reviewer has explicitly given consent.
   * Must be literally true — a reviewer is never represented as having
   * consented without explicit positive consent.
   */
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message:
        "consentGiven must be true; a reviewer is never represented as having consented unless explicit consent is recorded",
    }),
  }),

  /**
   * Fields to which the reviewer has specifically consented.
   * All listed permitted uses must be explicitly acknowledged.
   */
  consentedUses: z.object({
    /** Consent to use review contributions in the scientific study */
    useInScientificStudy: z.literal(true, {
      errorMap: () => ({
        message: "useInScientificStudy must be true; core consent is required",
      }),
    }),
    /** Consent to include anonymised aggregate data in publications */
    anonymisedAggregatePublication: z.boolean(),
    /** Consent to attribution in the published report */
    namedAttribution: z.boolean(),
    /** Consent to data retention for the period specified in the agreement */
    dataRetentionConsent: z.literal(true, {
      errorMap: () => ({
        message: "dataRetentionConsent must be true; data retention consent is required",
      }),
    }),
  }),

  /**
   * Attribution preference.
   */
  attributionPreference: AttributionPreferenceSchema,

  /**
   * Whether the reviewer has acknowledged all programme obligations.
   * Covers: blinding, non-coordination, confidentiality, no AI upload,
   * no evaluator output access.
   */
  obligationsAcknowledged: z.literal(true, {
    errorMap: () => ({
      message:
        "obligationsAcknowledged must be true; reviewers must acknowledge all programme obligations before assignment",
    }),
  }),

  /**
   * Whether consent has been revoked.
   * Revoked consent blocks further assignment.
   */
  consentRevoked: z.boolean(),

  /**
   * ISO-8601 timestamp of consent revocation, if any.
   */
  revocationTimestamp: z.string().optional(),

  /**
   * Whether data must be deleted following revocation.
   * True if revocation was exercised before anonymised aggregate analysis.
   */
  deletionRequired: z.boolean(),
});

export type ReviewerConsentRecord = z.infer<typeof ReviewerConsentRecordSchema>;

// ---------------------------------------------------------------------------
// Confidentiality agreement record
// ---------------------------------------------------------------------------

export const ConfidentialityAgreementRecordSchema = z.object({
  /** Reviewer identifier. */
  reviewerId: ScientificReviewerIdSchema,

  /**
   * Version of the confidentiality agreement accepted.
   */
  agreementVersion: z.string().min(1, "agreementVersion must not be empty"),

  /**
   * ISO-8601 timestamp when the agreement was accepted.
   */
  acceptanceTimestamp: z.string().min(1, "acceptanceTimestamp must not be empty"),

  /**
   * Whether the reviewer has explicitly accepted the confidentiality agreement.
   * Must be literally true.
   */
  agreementAccepted: z.literal(true, {
    errorMap: () => ({
      message:
        "agreementAccepted must be true; the reviewer must explicitly accept the confidentiality agreement",
    }),
  }),

  /**
   * Specific obligations explicitly acknowledged by the reviewer.
   */
  obligationsAcknowledged: z.object({
    /** Reviewer will not share benchmark documents */
    noDocumentSharing: z.literal(true, {
      errorMap: () => ({
        message: "noDocumentSharing must be true",
      }),
    }),
    /** Reviewer will not upload benchmark materials into unauthorised AI systems */
    noUnauthorisedAiUpload: z.literal(true, {
      errorMap: () => ({
        message: "noUnauthorisedAiUpload must be true",
      }),
    }),
    /** Reviewer will not seek evaluator output */
    noEvaluatorOutputAccess: z.literal(true, {
      errorMap: () => ({
        message: "noEvaluatorOutputAccess must be true",
      }),
    }),
    /** Reviewer will not coordinate with other reviewers before submission */
    noPreSubmissionCoordination: z.literal(true, {
      errorMap: () => ({
        message: "noPreSubmissionCoordination must be true",
      }),
    }),
    /** Reviewer will not disclose individual document findings to third parties */
    noThirdPartyDisclosure: z.literal(true, {
      errorMap: () => ({
        message: "noThirdPartyDisclosure must be true",
      }),
    }),
  }),

  /**
   * Whether the agreement has expired or been superseded by a newer version.
   * Expired agreements block further assignment until renewed.
   */
  agreementExpiredOrSuperseded: z.boolean(),

  /**
   * ISO-8601 date of expiry if the agreement has a fixed term.
   */
  expiryDate: z.string().optional(),
});

export type ConfidentialityAgreementRecord = z.infer<
  typeof ConfidentialityAgreementRecordSchema
>;
