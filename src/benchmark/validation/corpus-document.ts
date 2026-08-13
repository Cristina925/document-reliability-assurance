/**
 * DRA-VAL-001B — Scientific Corpus Document
 *
 * The ScientificCorpusDocument is the complete package for a single corpus
 * slot: slot metadata, provenance, permitted use, confidentiality,
 * anonymisation, source evidence, duplicate controls, contamination controls,
 * admission decision, and any exclusion, withdrawal, or replacement records.
 *
 * Invariants enforced:
 *   - Admitted documents must have provenance, permitted-use, and source evidence.
 *   - Documents requiring anonymisation cannot be admitted before it is verified.
 *   - Excluded or withdrawn documents cannot be frozen.
 *   - Frozen documents must have an integrityDigest.
 *   - Frozen document content cannot be modified.
 *   - Replacement records must preserve the original identifier history.
 */

import { z } from "zod";
import {
  ScientificCorpusSlotSchema,
  type CorpusAcquisitionStatus,
} from "./corpus-slots.js";
import {
  SourceProvenanceSchema,
  PermittedUseRecordSchema,
  ConfidentialityRecordSchema,
  AnonymisationRecordSchema,
  SourceEvidenceRecordSchema,
} from "./corpus-provenance.js";
import {
  DuplicateCheckRecordSchema,
  ContaminationCheckRecordSchema,
  isAdmissibleDuplicateDisposition,
  isAdmissibleContaminationResolution,
  type DuplicateCheckRecord,
  type ContaminationCheckRecord,
} from "./corpus-controls.js";

// ---------------------------------------------------------------------------
// Admission decision
// ---------------------------------------------------------------------------

export const ADMISSION_OUTCOMES = [
  "ADMITTED",
  "EXCLUDED",
  "DEFERRED",
] as const;

export type AdmissionOutcome = (typeof ADMISSION_OUTCOMES)[number];

/**
 * Records the outcome of the admission review process.
 * An ADMITTED outcome indicates all inclusion criteria were satisfied and
 * no exclusion criteria were triggered.
 */
export const CorpusAdmissionDecisionSchema = z.object({
  /** Outcome of the admission review. */
  outcome: z.enum(ADMISSION_OUTCOMES as unknown as [string, ...string[]]),

  /**
   * Timestamp of the admission decision (ISO 8601, no trailing Z).
   */
  decisionTimestamp: z.string().min(1, "decisionTimestamp must not be empty"),

  /**
   * Identifier or name of the admission reviewer.
   */
  reviewedBy: z.string().min(1, "reviewedBy must not be empty"),

  /**
   * Inclusion criteria verified as satisfied (at least one required for ADMITTED).
   */
  inclusionCriteriaSatisfied: z
    .array(z.string().min(1))
    .min(1, "At least one inclusion criterion must be satisfied for admission"),

  /**
   * Exclusion criteria verified as not triggered (required for ADMITTED).
   */
  exclusionCriteriaChecked: z
    .array(z.string().min(1))
    .min(1, "All exclusion criteria must be checked"),

  /**
   * Quota classification verified (domain, source type, difficulty, length).
   */
  quotaClassificationVerified: z.boolean(),

  /** Free-text notes on the admission decision. */
  admissionNotes: z.string().optional(),
});

export type CorpusAdmissionDecision = z.infer<
  typeof CorpusAdmissionDecisionSchema
>;

// ---------------------------------------------------------------------------
// Exclusion record
// ---------------------------------------------------------------------------

export const CORPUS_EXCLUSION_REASONS = [
  "FAILS_INCLUSION_CRITERIA",
  "TRIGGERS_EXCLUSION_CRITERIA",
  "DUPLICATE_DETECTED",
  "CONTAMINATION_CONFIRMED",
  "LICENSING_BARRIER",
  "PROVENANCE_UNVERIFIABLE",
  "ANONYMISATION_INCOMPLETE",
  "SOURCE_EVIDENCE_INACCESSIBLE",
  "QUOTA_FULL",
  "QUALITY_INSUFFICIENT",
] as const;

export type CorpusExclusionReason = (typeof CORPUS_EXCLUSION_REASONS)[number];

/**
 * Records the reason and evidence for excluding a document from the corpus.
 * Excluded documents cannot be frozen or re-admitted without a replacement
 * record.
 */
export const CorpusExclusionRecordSchema = z.object({
  /** Primary reason for exclusion. */
  exclusionReason: z.enum(
    CORPUS_EXCLUSION_REASONS as unknown as [string, ...string[]],
  ),

  /**
   * Detailed explanation of why the document was excluded.
   */
  exclusionExplanation: z
    .string()
    .min(20, "exclusionExplanation must be at least 20 characters"),

  /**
   * Timestamp of the exclusion decision (ISO 8601, no trailing Z).
   */
  exclusionTimestamp: z.string().min(1, "exclusionTimestamp must not be empty"),

  /** Person or process that made the exclusion decision. */
  excludedBy: z.string().min(1, "excludedBy must not be empty"),

  /**
   * Whether this slot should be replaced with an alternative document.
   */
  replacementRequired: z.boolean(),

  /** Free-text notes on the exclusion. */
  exclusionNotes: z.string().optional(),
});

export type CorpusExclusionRecord = z.infer<typeof CorpusExclusionRecordSchema>;

// ---------------------------------------------------------------------------
// Withdrawal record
// ---------------------------------------------------------------------------

export const WITHDRAWAL_REASONS = [
  "PERMISSION_REVOKED",
  "LICENSING_CHANGE",
  "PRIVACY_CONCERN",
  "SOURCE_DISPUTE",
  "CONTAMINATION_DISCOVERED_POST_FREEZE",
  "QUALITY_ISSUE_DISCOVERED_POST_FREEZE",
  "REQUESTED_BY_SOURCE_OWNER",
  "PROTOCOL_AMENDMENT",
] as const;

export type WithdrawalReason = (typeof WITHDRAWAL_REASONS)[number];

/**
 * Records the post-admission withdrawal of a corpus document.
 * Post-freeze withdrawals preserve the original manifest history —
 * the frozen content record is not deleted.
 */
export const CorpusWithdrawalRecordSchema = z.object({
  /** Primary reason for withdrawal. */
  withdrawalReason: z.enum(
    WITHDRAWAL_REASONS as unknown as [string, ...string[]],
  ),

  /**
   * Whether the withdrawal occurred after the document was frozen.
   * Post-freeze withdrawals must preserve the original manifest entry.
   */
  postFreezeWithdrawal: z.boolean(),

  /**
   * Detailed explanation of why the document was withdrawn.
   */
  withdrawalExplanation: z
    .string()
    .min(20, "withdrawalExplanation must be at least 20 characters"),

  /**
   * Timestamp of the withdrawal decision (ISO 8601, no trailing Z).
   */
  withdrawalTimestamp: z.string().min(1, "withdrawalTimestamp must not be empty"),

  /** Person or process that made the withdrawal decision. */
  withdrawnBy: z.string().min(1, "withdrawnBy must not be empty"),

  /**
   * Whether this slot should be replaced with an alternative document.
   */
  replacementRequired: z.boolean(),

  /** Free-text notes on the withdrawal. */
  withdrawalNotes: z.string().optional(),
});

export type CorpusWithdrawalRecord = z.infer<typeof CorpusWithdrawalRecordSchema>;

// ---------------------------------------------------------------------------
// Replacement record
// ---------------------------------------------------------------------------

/**
 * Preserves the identifier history when a slot is replaced.
 * The original document ID remains in the record; the replacement
 * document is assigned the same slot position.
 */
export const CorpusReplacementRecordSchema = z.object({
  /**
   * Document ID of the original document that is being replaced.
   */
  originalDocumentId: z.string().min(1, "originalDocumentId must not be empty"),

  /**
   * Document ID of the replacement document.
   * Must be a new ScientificCorpusDocumentId not already in the corpus.
   */
  replacementDocumentId: z.string().min(1, "replacementDocumentId must not be empty"),

  /** Reason the original document is being replaced. */
  replacementReason: z.string().min(10, "replacementReason must be at least 10 characters"),

  /**
   * Timestamp of the replacement decision (ISO 8601, no trailing Z).
   */
  replacementTimestamp: z.string().min(1, "replacementTimestamp must not be empty"),

  /** Free-text notes on the replacement. */
  replacementNotes: z.string().optional(),
});

export type CorpusReplacementRecord = z.infer<
  typeof CorpusReplacementRecordSchema
>;

// ---------------------------------------------------------------------------
// Scientific corpus document (full package)
// ---------------------------------------------------------------------------

/**
 * The complete package for a scientific corpus document slot.
 *
 * Every record in the corpus acquisition register is an instance of this type.
 * Not all fields are populated for every document — population depends on
 * acquisition status.
 */
export const ScientificCorpusDocumentSchema = z.object({
  /** Slot metadata: identifier, status, domain, source type, strata. */
  slot: ScientificCorpusSlotSchema,

  /**
   * Source provenance record.
   * Required for documents in ACQUIRED status and beyond.
   */
  provenance: SourceProvenanceSchema.optional(),

  /**
   * Permitted-use basis record.
   * Required for documents in UNDER_REVIEW status and beyond.
   */
  permittedUse: PermittedUseRecordSchema.optional(),

  /**
   * Confidentiality classification and handling record.
   * Required for documents in UNDER_REVIEW status and beyond.
   */
  confidentiality: ConfidentialityRecordSchema.optional(),

  /**
   * Anonymisation record.
   * Required when document contains personal data or sensitive content.
   */
  anonymisation: AnonymisationRecordSchema.optional(),

  /**
   * Source-evidence availability record.
   * Required for documents in UNDER_REVIEW status and beyond.
   */
  sourceEvidence: SourceEvidenceRecordSchema.optional(),

  /**
   * Duplicate detection record.
   * Required for admission.
   */
  duplicateCheck: DuplicateCheckRecordSchema.optional(),

  /**
   * Contamination screening record.
   * Required for admission.
   */
  contaminationCheck: ContaminationCheckRecordSchema.optional(),

  /**
   * Admission decision record.
   * Present for documents in ADMITTED, EXCLUDED, WITHDRAWN, or FROZEN status.
   */
  admissionDecision: CorpusAdmissionDecisionSchema.optional(),

  /**
   * Exclusion record.
   * Present when document has been excluded.
   */
  exclusionRecord: CorpusExclusionRecordSchema.optional(),

  /**
   * Withdrawal record.
   * Present when document has been withdrawn.
   */
  withdrawalRecord: CorpusWithdrawalRecordSchema.optional(),

  /**
   * Replacement record.
   * Present when this slot was replaced by a different document.
   */
  replacementRecord: CorpusReplacementRecordSchema.optional(),

  /**
   * SHA-256 integrity digest of the document package content.
   * Required when status = FROZEN.
   * Computed from: slot + provenance + permittedUse + confidentiality +
   *   anonymisation + sourceEvidence + duplicateCheck + contaminationCheck +
   *   admissionDecision.
   * Excludes: frozenAt, integrityDigest itself.
   */
  integrityDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "integrityDigest must be a 64-character lowercase hex string",
    )
    .optional(),

  /**
   * ISO 8601 timestamp when this document was frozen (no trailing Z).
   * Required when status = FROZEN.
   */
  frozenAt: z.string().optional(),
});

export type ScientificCorpusDocument = z.infer<
  typeof ScientificCorpusDocumentSchema
>;

// ---------------------------------------------------------------------------
// Admission validation
// ---------------------------------------------------------------------------

/**
 * Validate that a document meets all criteria for admission.
 * Returns an array of violation messages (empty = valid for admission).
 *
 * This function checks the structural pre-conditions for transitioning
 * a document to ADMITTED status. It does not transition the document.
 */
export function validateAdmissionCriteria(
  doc: ScientificCorpusDocument,
): string[] {
  const errors: string[] = [];
  const id = doc.slot.documentId;

  // Provenance required
  if (!doc.provenance) {
    errors.push(`${id}: provenance record is required for admission`);
  }

  // Permitted use required
  if (!doc.permittedUse) {
    errors.push(`${id}: permitted-use record is required for admission`);
  }

  // Confidentiality required
  if (!doc.confidentiality) {
    errors.push(`${id}: confidentiality record is required for admission`);
  } else if (
    doc.confidentiality.confidentialityLevel !== "PUBLIC" &&
    !doc.confidentiality.handlingRestrictions
  ) {
    errors.push(
      `${id}: non-PUBLIC documents require handlingRestrictions to be documented`,
    );
  }

  // Anonymisation check
  if (doc.anonymisation) {
    const { anonymisationStatus, anonymisationVerified } = doc.anonymisation;
    if (
      (anonymisationStatus === "REQUIRED_PENDING" ||
        anonymisationStatus === "REQUIRED_PARTIAL") &&
      !anonymisationVerified
    ) {
      errors.push(
        `${id}: anonymisation is required but not yet verified — cannot admit`,
      );
    }
  }

  // Source evidence required
  if (!doc.sourceEvidence) {
    errors.push(`${id}: source-evidence record is required for admission`);
  }

  // Duplicate check required
  if (!doc.duplicateCheck) {
    errors.push(`${id}: duplicate check is required for admission`);
  } else {
    if (!isAdmissibleDuplicateDisposition(doc.duplicateCheck.duplicateDisposition as Parameters<typeof isAdmissibleDuplicateDisposition>[0])) {
      errors.push(
        `${id}: duplicate disposition ${doc.duplicateCheck.duplicateDisposition} blocks admission`,
      );
    }
  }

  // Contamination check required
  if (!doc.contaminationCheck) {
    errors.push(`${id}: contamination check is required for admission`);
  } else {
    if (!isAdmissibleContaminationResolution(doc.contaminationCheck.contaminationResolution as Parameters<typeof isAdmissibleContaminationResolution>[0])) {
      errors.push(
        `${id}: contamination resolution ${doc.contaminationCheck.contaminationResolution} blocks admission`,
      );
    }
  }

  return errors;
}

/**
 * Validate that a document meets all criteria for freezing.
 * Returns an array of violation messages (empty = valid for freeze).
 */
export function validateFreezeEligibility(
  doc: ScientificCorpusDocument,
): string[] {
  const errors: string[] = [];
  const id = doc.slot.documentId;
  const status = doc.slot.status as CorpusAcquisitionStatus;

  // Must be in ADMITTED status to freeze
  if (status !== "ADMITTED") {
    errors.push(
      `${id}: document must be ADMITTED before freezing (current: ${status})`,
    );
  }

  // Must pass all admission criteria
  const admissionErrors = validateAdmissionCriteria(doc);
  errors.push(...admissionErrors);

  // Must have an admission decision
  if (!doc.admissionDecision) {
    errors.push(`${id}: admission decision record is required for freezing`);
  }

  // Excluded documents cannot be frozen
  if (doc.exclusionRecord) {
    errors.push(`${id}: excluded documents cannot be frozen`);
  }

  // Withdrawn documents cannot be frozen
  if (doc.withdrawalRecord && status !== "FROZEN") {
    errors.push(
      `${id}: withdrawn documents cannot be frozen (only post-freeze withdrawals record withdrawal)`,
    );
  }

  return errors;
}
