/**
 * DRA-VAL-001B — Corpus Quality Controls
 *
 * Machine-readable schemas for duplicate detection and contamination
 * screening — mandatory for every document before corpus admission.
 *
 * Duplicate controls cover both exact and near-duplicate detection.
 * Contamination controls screen for any connection to the DRA evaluator
 * development cycle.
 *
 * Invariants:
 *   - Both checks are mandatory before admission.
 *   - Near-duplicate disposition requires explicit human or rule-based record.
 *   - Any positive contamination signal blocks admission until resolved.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

export const DUPLICATE_DISPOSITIONS = [
  "DISTINCT",
  "RELATED_BUT_ADMISSIBLE",
  "NEAR_DUPLICATE_EXCLUDED",
  "EXACT_DUPLICATE_EXCLUDED",
  "INDETERMINATE",
] as const;

export type DuplicateDisposition = (typeof DUPLICATE_DISPOSITIONS)[number];

export const DuplicateDispositionSchema = z.enum(
  DUPLICATE_DISPOSITIONS as unknown as [string, ...string[]],
);

/**
 * Exact and near-duplicate check record for a corpus document.
 *
 * Three exact-duplicate digests are required:
 *   1. canonicalContentDigest — SHA-256 of the normalised document content.
 *   2. sourceEvidenceDigest   — SHA-256 of the associated source evidence.
 *   3. normalisedTextDigest   — SHA-256 of the whitespace-normalised plain text.
 *
 * Near-duplicate check must record the similarity method and threshold,
 * and must be accompanied by an explicit human or rule-based disposition
 * (automatic exclusion from a similarity score alone is not permitted).
 */
export const DuplicateCheckRecordSchema = z.object({
  /**
   * SHA-256 digest of the canonical document content.
   * Used for exact-duplicate detection against other corpus entries.
   */
  canonicalContentDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "canonicalContentDigest must be 64-character lowercase hex",
    ),

  /**
   * SHA-256 digest of the normalised plain-text representation.
   * Used for content-based deduplication independent of formatting.
   */
  normalisedTextDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "normalisedTextDigest must be 64-character lowercase hex",
    ),

  /**
   * Whether an exact duplicate of this document (by canonicalContentDigest
   * or normalisedTextDigest) was found in the corpus.
   */
  exactDuplicateFound: z.boolean(),

  /**
   * Document ID of the exact duplicate, if found.
   * Required when exactDuplicateFound = true.
   */
  exactDuplicateOf: z.string().optional(),

  /**
   * Similarity method used for near-duplicate detection.
   * Must be documented and deterministic (e.g. MinHash Jaccard similarity
   * on 3-gram tokens).
   */
  nearDuplicateSimilarityMethod: z
    .string()
    .min(10, "nearDuplicateSimilarityMethod must be documented"),

  /**
   * Similarity score produced by the near-duplicate check method.
   * Range [0.0, 1.0].
   */
  nearDuplicateSimilarityScore: z.number().min(0).max(1),

  /**
   * Threshold at which a document is flagged for near-duplicate review.
   */
  nearDuplicateSimilarityThreshold: z.number().min(0).max(1),

  /**
   * Whether this document was flagged as a near-duplicate candidate.
   * (score ≥ threshold, but requires human review before exclusion)
   */
  flaggedAsNearDuplicate: z.boolean(),

  /**
   * Human or rule-based disposition for the duplicate check.
   * Required for all documents — cannot be skipped.
   * Near-duplicate exclusion requires a recorded disposition; exclusion
   * based solely on similarity score is not permitted.
   */
  duplicateDisposition: DuplicateDispositionSchema,

  /**
   * Justification for the duplicate disposition.
   * Required when duplicateDisposition is not DISTINCT.
   */
  dispositionJustification: z.string().optional(),

  /** Date the duplicate check was performed, in YYYY-MM-DD format. */
  checkDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "checkDate must be YYYY-MM-DD"),

  /** Free-text notes on the duplicate check. */
  duplicateCheckNotes: z.string().optional(),
});

export type DuplicateCheckRecord = z.infer<typeof DuplicateCheckRecordSchema>;

/**
 * Returns true if the duplicate check disposition permits admission.
 * NEAR_DUPLICATE_EXCLUDED, EXACT_DUPLICATE_EXCLUDED, and INDETERMINATE
 * block admission.
 */
export function isAdmissibleDuplicateDisposition(
  disposition: DuplicateDisposition,
): boolean {
  return disposition === "DISTINCT" || disposition === "RELATED_BUT_ADMISSIBLE";
}

// ---------------------------------------------------------------------------
// Contamination screening
// ---------------------------------------------------------------------------

export const CONTAMINATION_SIGNALS = [
  "EVALUATOR_FIXTURE_MATCH",
  "EVALUATOR_DEVELOPMENT_EXPOSURE",
  "ENGINEERING_FIXTURE_OVERLAP",
  "EVALUATOR_OUTPUT_EXPOSURE",
  "SELECTION_BIAS_SIGNAL",
  "RULE_TARGETING_SIGNAL",
  "CLEAR",
] as const;

export type ContaminationSignal = (typeof CONTAMINATION_SIGNALS)[number];

export const CONTAMINATION_RESOLUTIONS = [
  "ADMITTED_NO_SIGNAL",
  "ADMITTED_SIGNAL_MITIGATED",
  "EXCLUDED_CONTAMINATION_CONFIRMED",
  "PENDING_REVIEW",
] as const;

export type ContaminationResolution =
  (typeof CONTAMINATION_RESOLUTIONS)[number];

/**
 * Contamination screening record for a corpus document.
 *
 * Screens for seven categories of contamination:
 *   1. Document originated from DRA evaluator fixtures.
 *   2. Document appeared in evaluator development tests.
 *   3. Document was used to design evaluator rules.
 *   4. Document was used in DRA-001-07 engineering validation.
 *   5. Document was reviewed with evaluator output visible.
 *   6. Document was generated using evaluator findings.
 *   7. Document was selected because of an expected evaluator result.
 *
 * Any positive signal blocks admission until a resolution is recorded.
 */
export const ContaminationCheckRecordSchema = z.object({
  /**
   * Whether this document was found to match any DRA evaluator fixture.
   */
  matchesEvaluatorFixture: z.boolean(),

  /**
   * Whether this document appeared in evaluator development or test runs.
   */
  appearedInEvaluatorDevelopment: z.boolean(),

  /**
   * Whether this document was used in the DRA-001-07 engineering
   * validation benchmark (the 6-document engineering fixture set).
   */
  usedInEngineeringValidation: z.boolean(),

  /**
   * Whether this document was reviewed or evaluated with evaluator
   * output visible to the reviewer.
   */
  reviewedWithEvaluatorOutputVisible: z.boolean(),

  /**
   * Whether there is any evidence that this document was selected
   * or generated in a way intended to produce a specific evaluator result.
   */
  selectionBiasEvidencePresent: z.boolean(),

  /**
   * Whether this document was constructed specifically to target or trigger
   * a known evaluator rule.
   */
  constructedToTargetEvaluatorRules: z.boolean(),

  /**
   * Whether this document was generated using evaluator findings as input.
   */
  generatedUsingEvaluatorFindings: z.boolean(),

  /**
   * Summary of contamination signals detected. CLEAR means all checks passed.
   */
  contaminationSignals: z.array(
    z.enum(CONTAMINATION_SIGNALS as unknown as [string, ...string[]]),
  ),

  /**
   * Resolution of the contamination assessment.
   * Any positive signal must be assessed before admission is permitted.
   */
  contaminationResolution: z.enum(
    CONTAMINATION_RESOLUTIONS as unknown as [string, ...string[]],
  ),

  /**
   * Explanation of how any contamination signal was assessed or mitigated.
   * Required when contaminationResolution = ADMITTED_SIGNAL_MITIGATED.
   */
  mitigationExplanation: z.string().optional(),

  /** Date the contamination check was performed, in YYYY-MM-DD format. */
  checkDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "checkDate must be YYYY-MM-DD"),

  /** Free-text notes on the contamination check. */
  contaminationNotes: z.string().optional(),
});

export type ContaminationCheckRecord = z.infer<
  typeof ContaminationCheckRecordSchema
>;

/**
 * Returns true if the contamination check result permits admission.
 * PENDING_REVIEW and EXCLUDED_CONTAMINATION_CONFIRMED block admission.
 */
export function isAdmissibleContaminationResolution(
  resolution: ContaminationResolution,
): boolean {
  return (
    resolution === "ADMITTED_NO_SIGNAL" ||
    resolution === "ADMITTED_SIGNAL_MITIGATED"
  );
}

/**
 * Check whether a document has any positive contamination signals.
 */
export function hasContaminationSignal(
  record: ContaminationCheckRecord,
): boolean {
  return (
    record.matchesEvaluatorFixture ||
    record.appearedInEvaluatorDevelopment ||
    record.usedInEngineeringValidation ||
    record.reviewedWithEvaluatorOutputVisible ||
    record.selectionBiasEvidencePresent ||
    record.constructedToTargetEvaluatorRules ||
    record.generatedUsingEvaluatorFindings
  );
}
