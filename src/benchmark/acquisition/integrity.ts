/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: integrity.ts — Per-document byte and record integrity primitives
 *
 * Provides the one genuinely new digest primitive — computeSourceDigest()
 * which hashes raw Uint8Array bytes — plus derived digest helpers for
 * approved metadata and per-document freeze records.
 *
 * Reuses:
 *   - computeContentDigest() from governance/eligibility.ts for text digests.
 *   - canonicalJsonStringify() from pipeline/canonical-serialise.ts for
 *     deterministic JSON serialisation.
 *
 * Invariants:
 *   - All digest outputs are 64-character lowercase hex strings.
 *   - Verification functions return false on mismatch; they do not throw.
 *   - No secret material passes through these functions.
 */

import { createHash } from "node:crypto";
import { computeContentDigest } from "../governance/eligibility.js";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type { ApprovedMetadata } from "./metadata.js";

// ---------------------------------------------------------------------------
// computeSourceDigest
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 hex digest of raw source bytes.
 *
 * This is the foundational byte-level integrity primitive introduced by
 * DRA-ENG-009. It operates on Uint8Array rather than strings to preserve
 * the byte-exact integrity of the acquired source, independent of any
 * character encoding or normalisation applied later.
 *
 * Output: 64-character lowercase hex string.
 */
export function computeSourceDigest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

// ---------------------------------------------------------------------------
// verifySourceDigest
// ---------------------------------------------------------------------------

/**
 * Verifies that the SHA-256 digest of the supplied bytes matches the
 * expected digest. Returns false on mismatch; never throws.
 */
export function verifySourceDigest(
  bytes: Uint8Array,
  expectedDigest: string,
): boolean {
  return computeSourceDigest(bytes) === expectedDigest;
}

// ---------------------------------------------------------------------------
// verifyTextDigest
// ---------------------------------------------------------------------------

/**
 * Verifies that the normalised text matches the recorded text digest.
 * Delegates to computeContentDigest (governance/eligibility.ts) to maintain
 * a single source of truth for text-level digest computation.
 * Returns false on mismatch; never throws.
 */
export function verifyTextDigest(
  normalisedText: string,
  expectedDigest: string,
): boolean {
  return computeContentDigest(normalisedText) === expectedDigest;
}

// ---------------------------------------------------------------------------
// computeApprovedMetadataDigest
// ---------------------------------------------------------------------------

/**
 * Computes a deterministic SHA-256 digest over the approved metadata fields
 * that are material to corpus identity.
 *
 * Uses canonicalJsonStringify to ensure field-order independence.
 * Output: 64-character lowercase hex string.
 */
export function computeApprovedMetadataDigest(
  metadata: ApprovedMetadata,
): string {
  // Include only the corpus-identity-material fields.
  const payload = {
    title: metadata.title,
    publisher: metadata.publisher,
    publicationDate: metadata.publicationDate,
    version: metadata.version ?? null,
    domain: metadata.domain,
    documentType: metadata.documentType,
    difficulty: metadata.difficulty,
    language: metadata.language,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload))
    .digest("hex");
}

// ---------------------------------------------------------------------------
// verifyApprovedMetadataDigest
// ---------------------------------------------------------------------------

/**
 * Verifies that the metadata digest matches the supplied ApprovedMetadata.
 * Returns false on mismatch; never throws.
 */
export function verifyApprovedMetadataDigest(
  metadata: ApprovedMetadata,
  expectedDigest: string,
): boolean {
  return computeApprovedMetadataDigest(metadata) === expectedDigest;
}

// ---------------------------------------------------------------------------
// computeAcquisitionFreezeRecordDigest
// ---------------------------------------------------------------------------

/**
 * Computes the substantive digest of a per-document AcquisitionFreezeRecord.
 *
 * The digest covers all material fields that constitute the frozen document's
 * identity. The freezeRecordDigest field and frozenAt timestamp are excluded
 * from the digest input to allow timestamp variance without invalidating the
 * substantive identity check.
 *
 * @param record  All AcquisitionFreezeRecord fields except freezeRecordDigest.
 * @returns       64-character lowercase hex string.
 */
export function computeAcquisitionFreezeRecordDigest(record: {
  readonly freezeRecordId: string;
  readonly corpusDocumentId: string;
  readonly acquisitionId: string;
  readonly sourceUrl: string;
  readonly finalUrl: string;
  readonly sourceDigest: string;
  readonly normalisedTextDigest: string;
  readonly metadataDigest: string;
  readonly normalisationVersion: string;
  readonly frozenBy: string;
  readonly benchmarkVersion: string;
  readonly status: "FROZEN";
}): string {
  const payload = {
    acquisitionId: record.acquisitionId,
    benchmarkVersion: record.benchmarkVersion,
    corpusDocumentId: record.corpusDocumentId,
    finalUrl: record.finalUrl,
    freezeRecordId: record.freezeRecordId,
    frozenBy: record.frozenBy,
    metadataDigest: record.metadataDigest,
    normalisationVersion: record.normalisationVersion,
    normalisedTextDigest: record.normalisedTextDigest,
    sourceDigest: record.sourceDigest,
    sourceUrl: record.sourceUrl,
    status: record.status,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload))
    .digest("hex");
}

// ---------------------------------------------------------------------------
// computeAcquisitionFreezeRecordDigestV2 (DRA-ENG-022)
// ---------------------------------------------------------------------------

/**
 * DRA-ENG-022 — Computes the substantive digest of a per-document
 * AcquisitionFreezeRecord issued under the POST-CUTOVER ("V2") integrity
 * regime.
 *
 * This is a DISTINCT formula from computeAcquisitionFreezeRecordDigest
 * (the pre-ENG-022 "legacy" formula), not a replacement for it. The legacy
 * function is never modified and remains the only formula ever applied to
 * records 1-31 and any other record created before this programme, so their
 * digests are byte-for-byte unaffected by this addition.
 *
 * The V2 formula extends the legacy payload with exactly two additional
 * fields:
 *   - freezeIntegritySchemaVersion: the explicit cutover/regime marker
 *     itself. Folding the marker INTO the digest (rather than leaving it as
 *     a free-standing, uncovered field) is what makes the cutover
 *     mechanical rather than advisory: a record cannot have this marker
 *     stripped, changed, or forged-absent without invalidating
 *     freezeRecordDigest, which is unconditionally verified by
 *     verifyAcquisitionFreezeRecordDigest() for every record regardless of
 *     regime.
 *   - currentnessBinding: the record's currentnessAssertionDigest value if
 *     a currentnessAssessment was supplied, or the literal value `null`
 *     otherwise. Binding an explicit `null` sentinel (not merely omitting
 *     the key) means "no currentness assessment" is itself part of what
 *     freezeRecordDigest attests to for V2 records — so deleting
 *     currentnessAssessment/currentnessAssertionDigest/
 *     currentnessIntegritySchemaVersion together (the exact ENG-021
 *     residual bypass) changes currentnessBinding from a real digest string
 *     to `null`, which no longer matches the digest computed at freeze
 *     time. This is the mechanism that closes the residual gap: it is not
 *     a new, independently strippable sidecar field — it is folded into
 *     the one digest every record of any regime already has verified
 *     unconditionally.
 *
 * @param record  Legacy material fields plus the two V2-only fields.
 * @returns       64-character lowercase hex string.
 */
export function computeAcquisitionFreezeRecordDigestV2(record: {
  readonly freezeRecordId: string;
  readonly corpusDocumentId: string;
  readonly acquisitionId: string;
  readonly sourceUrl: string;
  readonly finalUrl: string;
  readonly sourceDigest: string;
  readonly normalisedTextDigest: string;
  readonly metadataDigest: string;
  readonly normalisationVersion: string;
  readonly frozenBy: string;
  readonly benchmarkVersion: string;
  readonly status: "FROZEN";
  readonly freezeIntegritySchemaVersion: string;
  readonly currentnessBinding: string | null;
}): string {
  const payload = {
    acquisitionId: record.acquisitionId,
    benchmarkVersion: record.benchmarkVersion,
    corpusDocumentId: record.corpusDocumentId,
    currentnessBinding: record.currentnessBinding,
    finalUrl: record.finalUrl,
    freezeIntegritySchemaVersion: record.freezeIntegritySchemaVersion,
    freezeRecordId: record.freezeRecordId,
    frozenBy: record.frozenBy,
    metadataDigest: record.metadataDigest,
    normalisationVersion: record.normalisationVersion,
    normalisedTextDigest: record.normalisedTextDigest,
    sourceDigest: record.sourceDigest,
    sourceUrl: record.sourceUrl,
    status: record.status,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload))
    .digest("hex");
}

// Note: verifyAcquisitionFreezeRecordDigest is defined in freeze.ts where
// the full AcquisitionFreezeRecord type (including frozenAt) is available.
