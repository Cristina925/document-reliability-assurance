/**
 * DRA-VAL-001B — Corpus Provenance Records
 *
 * Machine-readable schemas for source provenance, permitted-use basis,
 * confidentiality classification, anonymisation status, and source-evidence
 * availability for every scientific corpus document.
 *
 * These records form the audit trail required by the DRA-VAL-001A protocol.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Source provenance
// ---------------------------------------------------------------------------

export const PROVENANCE_SOURCE_CLASSES = [
  "PUBLIC_REGULATORY",
  "PUBLIC_TECHNICAL_REPORT",
  "PUBLIC_CORPORATE_REPORT",
  "OPEN_LICENSED_TEMPLATE",
  "LICENSED_BENCHMARK_MATERIAL",
  "CONTRIBUTED_WITH_PERMISSION",
  "ANONYMISED_ORGANISATIONAL",
  "PURPOSE_GENERATED",
] as const;

export type ProvenanceSourceClass =
  (typeof PROVENANCE_SOURCE_CLASSES)[number];

export const ProvenanceSourceClassSchema = z.enum(
  PROVENANCE_SOURCE_CLASSES as unknown as [string, ...string[]],
);

/**
 * Source provenance record for a corpus document.
 * Establishes the origin, access path, and traceability of the acquired
 * document content.
 */
export const SourceProvenanceSchema = z.object({
  /** Stable reference URI to the original source, where applicable. */
  sourceUri: z.string().optional(),

  /** Human-readable description of the source (publisher, repository, etc.). */
  sourceDescription: z
    .string()
    .min(10, "sourceDescription must be at least 10 characters"),

  /** Name of the source owner or publisher. */
  sourceOwner: z.string().min(1, "sourceOwner must not be empty"),

  /** Classification of the source type. */
  sourceClass: ProvenanceSourceClassSchema,

  /** Date the document was acquired in YYYY-MM-DD format. */
  acquisitionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "acquisitionDate must be YYYY-MM-DD"),

  /**
   * Whether the source can be independently verified by a third party.
   * Unverifiable sources require a documented justification.
   */
  sourceVerifiable: z.boolean(),

  /**
   * If sourceVerifiable is false, a documented justification for admitting
   * an unverifiable source must be provided.
   */
  unverifiableJustification: z.string().optional(),

  /**
   * Whether the document was obtained independently of any evaluator output.
   * Must be true. Documents selected after viewing evaluator results are
   * prohibited.
   */
  acquiredIndependentlyOfEvaluatorOutput: z.literal(true, {
    errorMap: () => ({
      message:
        "acquiredIndependentlyOfEvaluatorOutput must be true — documents " +
        "selected after viewing evaluator results are prohibited.",
    }),
  }),

  /**
   * Whether the document was obtained independently of the DRA-001-07
   * engineering fixture set.
   * Must be true. Documents from evaluator fixtures must be declared.
   */
  notDerivedFromEngineeringFixtures: z.literal(true, {
    errorMap: () => ({
      message:
        "notDerivedFromEngineeringFixtures must be true — documents " +
        "must not be copied from evaluator fixtures without declaration.",
    }),
  }),

  /** Free-text notes on provenance, access, or traceability. */
  provenanceNotes: z.string().optional(),
});

export type SourceProvenance = z.infer<typeof SourceProvenanceSchema>;

// ---------------------------------------------------------------------------
// Permitted-use record
// ---------------------------------------------------------------------------

export const PERMITTED_USE_BASES = [
  "PUBLIC_DOMAIN",
  "OPEN_LICENCE",
  "FAIR_USE_RESEARCH",
  "EXPLICIT_PERMISSION",
  "CONTRIBUTED_WITH_RELEASE",
  "INSTITUTIONAL_LICENCE",
  "PURPOSE_GENERATED_NO_RESTRICTION",
] as const;

export type PermittedUseBasis = (typeof PERMITTED_USE_BASES)[number];

/**
 * Documents the legal or authorised basis under which the corpus document
 * may be stored, used for evaluation research, and included in the corpus.
 *
 * Prohibited: copyrighted documents used without a valid basis.
 */
export const PermittedUseRecordSchema = z.object({
  /** Basis under which use is permitted. */
  permittedUseBasis: z.enum(
    PERMITTED_USE_BASES as unknown as [string, ...string[]],
  ),

  /**
   * Reference to the specific licence, agreement, or permission.
   * Required for OPEN_LICENCE, INSTITUTIONAL_LICENCE, EXPLICIT_PERMISSION,
   * and CONTRIBUTED_WITH_RELEASE.
   */
  licenceReference: z.string().optional(),

  /**
   * Whether the document may be stored in the repository.
   * If false, only a stable reference and digest must be retained.
   */
  storagePermitted: z.boolean(),

  /**
   * Whether the document may be included in published research results.
   * Does not affect whether it may be used in evaluation.
   */
  publicationPermitted: z.boolean(),

  /** Whether attribution to the original source is required. */
  attributionRequired: z.boolean(),

  /**
   * Attribution text, if required.
   * Must be provided when attributionRequired = true.
   */
  attributionText: z.string().optional(),

  /** Free-text notes on permitted use. */
  permittedUseNotes: z.string().optional(),
});

export type PermittedUseRecord = z.infer<typeof PermittedUseRecordSchema>;

// ---------------------------------------------------------------------------
// Confidentiality record
// ---------------------------------------------------------------------------

export const CONFIDENTIALITY_LEVELS = [
  "PUBLIC",
  "INTERNAL_RESTRICTED",
  "CONFIDENTIAL",
  "STRICTLY_CONFIDENTIAL",
] as const;

export type ConfidentialityLevel = (typeof CONFIDENTIALITY_LEVELS)[number];

/**
 * Classification and handling requirements for a corpus document.
 * Confidential documents require an explicit handling record.
 */
export const ConfidentialityRecordSchema = z.object({
  /** Confidentiality classification. */
  confidentialityLevel: z.enum(
    CONFIDENTIALITY_LEVELS as unknown as [string, ...string[]],
  ),

  /**
   * Whether the document contains personal data subject to privacy law.
   * Documents with personal data require documented lawful handling basis.
   */
  containsPersonalData: z.boolean(),

  /**
   * Lawful handling basis for personal data, if present.
   * Required when containsPersonalData = true.
   */
  personalDataHandlingBasis: z.string().optional(),

  /**
   * Handling restrictions imposed by the source owner or applicable law.
   * Required for confidentiality levels above PUBLIC.
   */
  handlingRestrictions: z.string().optional(),

  /**
   * Whether access to the document should be restricted within the corpus.
   * Documents with access restrictions require documented access controls.
   */
  accessRestricted: z.boolean(),

  /** Free-text notes on confidentiality and handling. */
  confidentialityNotes: z.string().optional(),
});

export type ConfidentialityRecord = z.infer<typeof ConfidentialityRecordSchema>;

// ---------------------------------------------------------------------------
// Anonymisation record
// ---------------------------------------------------------------------------

export const ANONYMISATION_STATUSES = [
  "NOT_REQUIRED",
  "REQUIRED_PENDING",
  "REQUIRED_COMPLETE",
  "REQUIRED_PARTIAL",
] as const;

export type AnonymisationStatus = (typeof ANONYMISATION_STATUSES)[number];

/**
 * Documents whether anonymisation was required, what was removed,
 * and the verification outcome.
 *
 * Invariant: documents requiring anonymisation cannot be admitted until
 * anonymisation is verified complete.
 */
export const AnonymisationRecordSchema = z.object({
  /** Anonymisation requirement status. */
  anonymisationStatus: z.enum(
    ANONYMISATION_STATUSES as unknown as [string, ...string[]],
  ),

  /**
   * Description of what personal or identifying information was removed.
   * Required when anonymisationStatus is REQUIRED_COMPLETE or REQUIRED_PARTIAL.
   */
  anonymisationDescription: z.string().optional(),

  /**
   * Whether the anonymised version has been verified to remove all
   * required personal or identifying information.
   * Must be true before a document requiring anonymisation can be admitted.
   */
  anonymisationVerified: z.boolean(),

  /**
   * Identifier or name of the person or process that verified anonymisation.
   * Required when anonymisationVerified = true.
   */
  verifiedBy: z.string().optional(),

  /** Free-text notes on anonymisation. */
  anonymisationNotes: z.string().optional(),
});

export type AnonymisationRecord = z.infer<typeof AnonymisationRecordSchema>;

// ---------------------------------------------------------------------------
// Source-evidence record
// ---------------------------------------------------------------------------

export const SOURCE_EVIDENCE_AVAILABILITIES = [
  "AVAILABLE",
  "PARTIALLY_AVAILABLE",
  "INACCESSIBLE",
  "NOT_APPLICABLE",
] as const;

export type SourceEvidenceAvailability =
  (typeof SOURCE_EVIDENCE_AVAILABILITIES)[number];

/**
 * Records whether source material for reviewer comparison is available.
 *
 * Where the source cannot legally be stored, a stable reference and access
 * requirements must be retained in lieu of embedded content.
 */
export const SourceEvidenceRecordSchema = z.object({
  /** Whether the source evidence is available for reviewer use. */
  sourceEvidenceAvailability: z.enum(
    SOURCE_EVIDENCE_AVAILABILITIES as unknown as [string, ...string[]],
  ),

  /**
   * Whether the source evidence is embedded in the corpus package.
   * If false, a stable reference must be provided.
   */
  sourceEvidenceEmbedded: z.boolean(),

  /**
   * Stable reference to the source evidence, if not embedded.
   * Required when sourceEvidenceEmbedded = false and availability ≠ NOT_APPLICABLE.
   */
  sourceEvidenceReference: z.string().optional(),

  /**
   * SHA-256 digest of the source evidence content, where available.
   * Allows integrity verification of the source against what reviewers compared.
   */
  sourceEvidenceDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "sourceEvidenceDigest must be a 64-character lowercase hex string",
    )
    .optional(),

  /**
   * Reason the source evidence is inaccessible, if applicable.
   * Required when sourceEvidenceAvailability = INACCESSIBLE.
   */
  inaccessibilityReason: z.string().optional(),

  /** Free-text notes on source evidence. */
  sourceEvidenceNotes: z.string().optional(),
});

export type SourceEvidenceRecord = z.infer<typeof SourceEvidenceRecordSchema>;
