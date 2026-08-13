/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: freeze.ts — Per-document immutable freeze record
 *
 * Defines AcquisitionFreezeRecord — a per-document freeze record that tracks
 * the exact bytes, normalisation, and human-reviewed metadata of a single
 * acquired public document.
 *
 * Distinct from governance/freeze.ts FreezeRecord which operates at the
 * corpus-version level (one record per corpus freeze, covering all documents).
 * These are complementary: a corpus-version freeze may reference multiple
 * per-document AcquisitionFreezeRecords.
 *
 * Invariants:
 *   - createAcquisitionFreezeRecord() is only callable after eligibility passes.
 *   - Output is deeply frozen; callers must not mutate it.
 *   - With a fixed timestamp, repeated calls with identical inputs produce
 *     identical freezeRecordDigests.
 *   - A new version of a frozen document requires a new corpusDocumentId.
 *   - No existing freeze record is ever overwritten.
 */

import {
  computeAcquisitionFreezeRecordDigest,
  computeAcquisitionFreezeRecordDigestV2,
} from "./integrity.js";
import type { NormalisedDocument } from "./normalisation.js";
import type { RepresentationAssessment } from "./representation-provenance.js";
import type { GraphicalSemanticRiskAssessment } from "./graphical-semantic-risk.js";
import type { CurrentnessAssessment } from "./currentness.js";
import {
  CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
  computeCurrentnessAssertionDigest,
  verifyCurrentnessAssertionDigest,
} from "./currentness-integrity.js";

// ---------------------------------------------------------------------------
// Freeze record ID format
// ---------------------------------------------------------------------------

/** Format: DRA-FRZ-NNNNNN (six decimal digits). */
export const ACQUISITION_FREEZE_RECORD_ID_REGEX = /^DRA-FRZ-\d{6}$/;

/**
 * Formats a non-negative integer as a DRA-FRZ-NNNNNN identifier.
 *
 * @example formatFreezeRecordId(1) → "DRA-FRZ-000001"
 */
export function formatFreezeRecordId(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new Error(
      `Invalid sequence for freeze record ID: ${sequence}. Must be a non-negative integer.`,
    );
  }
  return `DRA-FRZ-${String(sequence).padStart(6, "0")}`;
}

// ---------------------------------------------------------------------------
// Freeze-record integrity regime (DRA-ENG-022)
// ---------------------------------------------------------------------------

/**
 * DRA-ENG-022 — the explicit, integrity-relevant cutover marker for the
 * post-cutover freeze-record digest regime.
 *
 * LEGACY records (documents 1-31 and any record created before this
 * programme, or any record deliberately created under the legacy formula
 * for regression/reconstruction purposes) carry NO
 * freezeIntegritySchemaVersion field at all — this is not ambiguous with
 * "a post-cutover record that had its marker stripped", because a legacy
 * record's freezeRecordDigest was computed with the legacy formula
 * (computeAcquisitionFreezeRecordDigest), while a stripped V2 record's
 * digest was computed with the V2 formula
 * (computeAcquisitionFreezeRecordDigestV2, which folds in
 * freezeIntegritySchemaVersion and currentnessBinding). The two formulas
 * produce different digests for the same underlying content, so a stripped
 * V2 record's digest will not match on re-verification under the legacy
 * formula. See verifyAcquisitionFreezeRecordDigest().
 */
export const FREEZE_INTEGRITY_SCHEMA_VERSION_V2 = "dra-freeze-integrity-v2" as const;

/** Schema versions verifyAcquisitionFreezeRecordDigest() knows how to verify. */
const RECOGNISED_FREEZE_INTEGRITY_SCHEMA_VERSIONS: readonly string[] = [
  FREEZE_INTEGRITY_SCHEMA_VERSION_V2,
];

// ---------------------------------------------------------------------------
// AcquisitionFreezeRecord
// ---------------------------------------------------------------------------

/**
 * An immutable per-document freeze record.
 *
 * Records the exact acquisition provenance, byte-level source digest,
 * normalised-text digest, metadata digest, and freeze identity of a single
 * public document admitted to the benchmark corpus.
 *
 * freezeRecordDigest is a SHA-256 digest over all material fields excluding
 * frozenAt and itself (so timestamps do not invalidate substantive identity).
 */
export interface AcquisitionFreezeRecord {
  /** Format: DRA-FRZ-NNNNNN. */
  readonly freezeRecordId: string;
  /** The target corpus document ID. Format: DRA-DOC-NNNN. */
  readonly corpusDocumentId: string;
  /** The acquisition request ID. Format: DRA-ACQ-NNNNNN. */
  readonly acquisitionId: string;
  /** The original requested URL. */
  readonly sourceUrl: string;
  /** The final URL after all redirects. */
  readonly finalUrl: string;
  /** SHA-256 hex digest of the raw source bytes. */
  readonly sourceDigest: string;
  /** SHA-256 hex digest of the normalised text (via computeContentDigest). */
  readonly normalisedTextDigest: string;
  /** SHA-256 hex digest of the approved metadata payload. */
  readonly metadataDigest: string;
  /** Normalisation algorithm version used to produce the text. */
  readonly normalisationVersion: string;
  /** ISO-8601 timestamp at which the freeze was created. */
  readonly frozenAt: string;
  /** Identity of the person authorising the freeze. */
  readonly frozenBy: string;
  /** Benchmark protocol version at the time of freeze. */
  readonly benchmarkVersion: string;
  /** Always "FROZEN". */
  readonly status: "FROZEN";
  /**
   * SHA-256 digest over all material fields except frozenAt and itself.
   * Computed by computeAcquisitionFreezeRecordDigest().
   */
  readonly freezeRecordDigest: string;
  /**
   * DRA-ENG-017 — representation provenance/fidelity assessment for this
   * document's canonical text, computed at freeze time. Optional and
   * EXCLUDED from freezeRecordDigest (like frozenAt), so:
   *   - historical freeze records created before DRA-ENG-017 existed
   *     (this field absent) keep their original, already-verified digest;
   *   - re-deriving a historical record's digest for regression purposes
   *     is unaffected by whether this field is supplied.
   * This is the authoritative, single stored location for representation
   * provenance/fidelity (see representation-provenance.ts); it is not
   * duplicated onto BenchmarkDocumentResult or ProofReceipt.
   */
  readonly representationAssessment?: RepresentationAssessment;
  /**
   * DRA-ENG-018 — graphical-semantic risk assessment for this document,
   * computed at freeze time. Optional and EXCLUDED from freezeRecordDigest
   * (same rationale as representationAssessment): historical freeze records
   * created before DRA-ENG-018 existed (this field absent) keep their
   * original, already-verified digest. This is the authoritative, single
   * stored location for graphical-semantic risk (see
   * graphical-semantic-risk.ts); it is a distinct property from
   * representationAssessment (DRA-ENG-017's lexical fidelity) and is never
   * merged into it — a document can simultaneously be
   * LEXICAL_FIDELITY=VERIFIED and carry POTENTIAL_GRAPHICAL_SEMANTIC_LOSS.
   */
  readonly graphicalSemanticAssessment?: GraphicalSemanticRiskAssessment;
  /**
   * DRA-ENG-020 — currentness/supersession assessment for this document,
   * supplied at freeze time. Optional and EXCLUDED from freezeRecordDigest
   * (same rationale as representationAssessment/graphicalSemanticAssessment):
   * historical freeze records created before DRA-ENG-020 existed (this field
   * absent) keep their original, already-verified digest, and adding this
   * field to a new freeze is never a breaking change. See currentness.ts for
   * the full design rationale (why this is a document-level property
   * distinct from authority/authenticity, and why it is never derived from
   * the document's own text). This is the authoritative, single stored
   * location for currentness; it is not duplicated onto ProofReceipt.
   */
  readonly currentnessAssessment?: CurrentnessAssessment;
  /**
   * DRA-ENG-021 — SHA-256 digest cryptographically binding
   * currentnessAssessment to this specific freeze record. Present
   * if-and-only-if currentnessAssessment is present. EXCLUDED from
   * freezeRecordDigest (same historical-preservation rationale as
   * currentnessAssessment itself) — this is a SEPARATE, additional
   * integrity artefact, not a replacement for or extension of
   * freezeRecordDigest. See currentness-integrity.ts for the full
   * architecture rationale and exactly which fields are bound.
   */
  readonly currentnessAssertionDigest?: string;
  /**
   * DRA-ENG-021 — schema version of the canonicalisation rules used to
   * compute currentnessAssertionDigest. Present iff currentnessAssertionDigest
   * is present. Recorded explicitly so a future, differently-canonicalised
   * version can be introduced without breaking verification of records
   * issued under this version (see currentness-integrity.ts).
   */
  readonly currentnessIntegritySchemaVersion?: string;
  /**
   * DRA-ENG-022 — explicit cutover marker. Present (equal to
   * FREEZE_INTEGRITY_SCHEMA_VERSION_V2) if-and-only-if this record was
   * created under the post-cutover digest regime, in which case
   * freezeRecordDigest was computed by computeAcquisitionFreezeRecordDigestV2
   * (folding this marker and a currentness-presence binding into the
   * digest itself). ABSENT for every record created under the legacy
   * regime — including documents 1-31, which predate this concept and are
   * never retroactively assigned it. See the module-level doc comment for
   * FREEZE_INTEGRITY_SCHEMA_VERSION_V2 for why absence is not ambiguous
   * with a stripped marker.
   */
  readonly freezeIntegritySchemaVersion?: string;
}

// ---------------------------------------------------------------------------
// CreateAcquisitionFreezeRecordInput
// ---------------------------------------------------------------------------

export interface CreateAcquisitionFreezeRecordInput {
  /** Unique freeze record identifier. Format: DRA-FRZ-NNNNNN. */
  readonly freezeRecordId: string;
  /** Target corpus document ID. Format: DRA-DOC-NNNN. */
  readonly corpusDocumentId: string;
  /** Originating acquisition request ID. Format: DRA-ACQ-NNNNNN. */
  readonly acquisitionId: string;
  /** Original requested source URL. */
  readonly sourceUrl: string;
  /** Final URL after redirects. */
  readonly finalUrl: string;
  /** SHA-256 hex digest of the raw source bytes. */
  readonly sourceDigest: string;
  /** The normalised document (carries textDigest and normalisationVersion). */
  readonly normalised: NormalisedDocument;
  /** SHA-256 hex digest of the approved metadata payload. */
  readonly metadataDigest: string;
  /** Identity of the freeze authoriser. */
  readonly frozenBy: string;
  /** Benchmark protocol version. */
  readonly benchmarkVersion: string;
  /**
   * Fixed timestamp for deterministic tests. When absent the current UTC
   * ISO-8601 time is used.
   */
  readonly fixedTimestamp?: string;
  /**
   * DRA-ENG-017 — optional representation provenance/fidelity assessment.
   * Excluded from freezeRecordDigest; see AcquisitionFreezeRecord docs.
   */
  readonly representationAssessment?: RepresentationAssessment;
  /**
   * DRA-ENG-018 — optional graphical-semantic risk assessment. Excluded
   * from freezeRecordDigest; see AcquisitionFreezeRecord docs.
   */
  readonly graphicalSemanticAssessment?: GraphicalSemanticRiskAssessment;
  /**
   * DRA-ENG-020 — optional currentness/supersession assessment. Excluded
   * from freezeRecordDigest; see AcquisitionFreezeRecord docs.
   */
  readonly currentnessAssessment?: CurrentnessAssessment;
  /**
   * DRA-ENG-022 — opt-in selector for the post-cutover digest regime. When
   * set to "V2", freezeRecordDigest is computed via
   * computeAcquisitionFreezeRecordDigestV2 and the record carries an
   * explicit freezeIntegritySchemaVersion marker. When absent (the
   * default), behaviour is byte-for-byte identical to pre-ENG-022 code —
   * every existing call site (including all DRA-ENG-020/021 tests and the
   * historical DOC-0001-0031 reconstructions) is completely unaffected.
   * The real production cutover is enacted at the call site in
   * governed-pipeline.ts's acquireFreezeAndEvaluate(), which passes "V2"
   * for every newly acquired document from this programme forward.
   */
  readonly freezeIntegrityRegime?: "V2";
}

// ---------------------------------------------------------------------------
// createAcquisitionFreezeRecord
// ---------------------------------------------------------------------------

/**
 * Creates an immutable per-document AcquisitionFreezeRecord.
 *
 * Must only be called after all eligibility checks have passed.
 * The returned record is deeply frozen and must not be mutated.
 *
 * Reproducibility: when fixedTimestamp is provided, repeated calls with
 * identical inputs produce records with identical freezeRecordDigests.
 * The frozenAt timestamp does not affect the freezeRecordDigest.
 *
 * @param input  Validated inputs; caller must ensure eligibility is satisfied.
 * @returns      A deeply frozen AcquisitionFreezeRecord.
 */
export function createAcquisitionFreezeRecord(
  input: CreateAcquisitionFreezeRecordInput,
): AcquisitionFreezeRecord {
  const frozenAt = input.fixedTimestamp ?? new Date().toISOString();

  const materialFields = {
    freezeRecordId: input.freezeRecordId,
    corpusDocumentId: input.corpusDocumentId,
    acquisitionId: input.acquisitionId,
    sourceUrl: input.sourceUrl,
    finalUrl: input.finalUrl,
    sourceDigest: input.sourceDigest,
    normalisedTextDigest: input.normalised.textDigest,
    metadataDigest: input.metadataDigest,
    normalisationVersion: input.normalised.normalisationVersion,
    frozenBy: input.frozenBy,
    benchmarkVersion: input.benchmarkVersion,
    status: "FROZEN" as const,
  };

  // DRA-ENG-021 — bind currentnessAssessment (if supplied) to this specific
  // freeze record via a separate, explicitly versioned digest. Computed
  // here (not lazily) so the digest is present from the moment the freeze
  // record is created, mirroring freezeRecordDigest's own construction.
  const currentnessIntegrity =
    input.currentnessAssessment !== undefined
      ? {
          currentnessAssertionDigest: computeCurrentnessAssertionDigest({
            freezeRecordId: input.freezeRecordId,
            corpusDocumentId: input.corpusDocumentId,
            currentnessAssessment: input.currentnessAssessment,
          }),
          currentnessIntegritySchemaVersion: CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
        }
      : undefined;

  // DRA-ENG-022 — post-cutover ("V2") regime: fold the cutover marker and a
  // currentness-presence binding into freezeRecordDigest itself, via the
  // dedicated V2 formula. Legacy regime (the default, and the ONLY
  // behaviour that existed pre-ENG-022): freezeRecordDigest is computed
  // exactly as before, and no freezeIntegritySchemaVersion field is
  // attached, so historical digests and every pre-existing call site are
  // byte-for-byte unaffected.
  const isV2 = input.freezeIntegrityRegime === "V2";
  const freezeRecordDigest = isV2
    ? computeAcquisitionFreezeRecordDigestV2({
        ...materialFields,
        freezeIntegritySchemaVersion: FREEZE_INTEGRITY_SCHEMA_VERSION_V2,
        currentnessBinding: currentnessIntegrity?.currentnessAssertionDigest ?? null,
      })
    : computeAcquisitionFreezeRecordDigest(materialFields);

  return Object.freeze<AcquisitionFreezeRecord>({
    ...materialFields,
    frozenAt,
    freezeRecordDigest,
    ...(input.representationAssessment !== undefined
      ? { representationAssessment: input.representationAssessment }
      : {}),
    ...(input.graphicalSemanticAssessment !== undefined
      ? { graphicalSemanticAssessment: input.graphicalSemanticAssessment }
      : {}),
    ...(input.currentnessAssessment !== undefined
      ? { currentnessAssessment: input.currentnessAssessment }
      : {}),
    ...(currentnessIntegrity !== undefined ? currentnessIntegrity : {}),
    ...(isV2 ? { freezeIntegritySchemaVersion: FREEZE_INTEGRITY_SCHEMA_VERSION_V2 } : {}),
  });
}

// ---------------------------------------------------------------------------
// verifyAcquisitionCurrentnessIntegrity
// ---------------------------------------------------------------------------

/**
 * DRA-ENG-021 — verifies that a freeze record's currentnessAssertionDigest
 * (if present) matches a freshly recomputed digest of its own
 * currentnessAssessment.
 *
 * Returns true when there is nothing to verify (no currentnessAssessment
 * was ever supplied for this record — the common case for documents 1-31,
 * frozen before DRA-ENG-020/021 existed, and for any document with no
 * currentness assessment at all). Returns false on any of:
 *   - currentnessAssessment present but currentnessAssertionDigest absent
 *     (or vice versa) — a structurally inconsistent record;
 *   - digest mismatch (tampering, or a hand-edited assessment); or
 *   - an unrecognised currentnessIntegritySchemaVersion.
 * Never throws.
 */
export function verifyAcquisitionCurrentnessIntegrity(
  record: AcquisitionFreezeRecord,
): boolean {
  const hasAssessment = record.currentnessAssessment !== undefined;
  const hasDigest =
    record.currentnessAssertionDigest !== undefined &&
    record.currentnessIntegritySchemaVersion !== undefined;

  if (!hasAssessment && !hasDigest) {
    return true;
  }
  if (hasAssessment !== hasDigest) {
    return false;
  }

  return verifyCurrentnessAssertionDigest({
    freezeRecordId: record.freezeRecordId,
    corpusDocumentId: record.corpusDocumentId,
    currentnessAssessment: record.currentnessAssessment as CurrentnessAssessment,
    schemaVersion: record.currentnessIntegritySchemaVersion as string,
    expectedDigest: record.currentnessAssertionDigest as string,
  });
}

// ---------------------------------------------------------------------------
// verifyAcquisitionFreezeRecordDigest
// ---------------------------------------------------------------------------

/**
 * Verifies that an AcquisitionFreezeRecord's freezeRecordDigest matches
 * a freshly computed digest of its substantive material fields.
 *
 * frozenAt is excluded from the digest to allow timestamp variance.
 * Returns false on mismatch; never throws.
 *
 * DRA-ENG-022 — dispatches on record.freezeIntegritySchemaVersion:
 *   - absent            → legacy formula (computeAcquisitionFreezeRecordDigest),
 *                         BYTE-IDENTICAL to the pre-ENG-022 implementation.
 *                         This is the only path documents 1-31 (and any
 *                         record created without opting into "V2") are ever
 *                         verified against.
 *   - FREEZE_INTEGRITY_SCHEMA_VERSION_V2 → V2 formula
 *                         (computeAcquisitionFreezeRecordDigestV2), which
 *                         additionally folds in the marker itself and a
 *                         currentnessBinding derived from the record's OWN
 *                         currently-stored currentnessAssertionDigest (or
 *                         null if absent). Because this binding is read
 *                         from current record state, deleting
 *                         currentnessAssessment/currentnessAssertionDigest/
 *                         currentnessIntegritySchemaVersion after the fact
 *                         changes the recomputed currentnessBinding from the
 *                         real digest string to null, which will not match
 *                         a digest that was originally computed with the
 *                         real value — this is what makes stripping
 *                         detectable rather than silently accepted as
 *                         "never assessed".
 *   - anything else     → fails closed (unrecognised/malformed schema
 *                         version is never treated as either legacy or V2).
 */
export function verifyAcquisitionFreezeRecordDigest(
  record: AcquisitionFreezeRecord,
): boolean {
  const materialFields = {
    freezeRecordId: record.freezeRecordId,
    corpusDocumentId: record.corpusDocumentId,
    acquisitionId: record.acquisitionId,
    sourceUrl: record.sourceUrl,
    finalUrl: record.finalUrl,
    sourceDigest: record.sourceDigest,
    normalisedTextDigest: record.normalisedTextDigest,
    metadataDigest: record.metadataDigest,
    normalisationVersion: record.normalisationVersion,
    frozenBy: record.frozenBy,
    benchmarkVersion: record.benchmarkVersion,
    status: record.status,
  };

  if (record.freezeIntegritySchemaVersion === undefined) {
    return computeAcquisitionFreezeRecordDigest(materialFields) === record.freezeRecordDigest;
  }

  if (!RECOGNISED_FREEZE_INTEGRITY_SCHEMA_VERSIONS.includes(record.freezeIntegritySchemaVersion)) {
    return false;
  }

  // Only FREEZE_INTEGRITY_SCHEMA_VERSION_V2 is currently recognised, so
  // reaching here means record.freezeIntegritySchemaVersion === "dra-freeze-integrity-v2".
  const currentnessBinding = record.currentnessAssertionDigest ?? null;
  return (
    computeAcquisitionFreezeRecordDigestV2({
      ...materialFields,
      freezeIntegritySchemaVersion: record.freezeIntegritySchemaVersion,
      currentnessBinding,
    }) === record.freezeRecordDigest
  );
}
