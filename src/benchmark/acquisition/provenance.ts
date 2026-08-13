/**
 * DRA-001 — Corpus Acquisition Provenance Model
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 *
 * Every benchmark document must carry immutable provenance that records:
 *   - where it came from;
 *   - when it was acquired;
 *   - its original filename;
 *   - its licence or usage status;
 *   - a tamper-evident digest of all substantive provenance fields.
 *
 * The provenance digest excludes `acquisitionDate` only when that field is
 * classified as operational metadata.  Here acquisitionDate IS substantive
 * (it is part of the identity of the provenance claim), so it is included.
 * The `provenanceDigest` field itself is excluded from the hash payload to
 * avoid circularity.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const LICENCE_STATUSES = [
  "CC0",
  "CC_BY",
  "CC_BY_SA",
  "PROPRIETARY",
  "INTERNAL",
  "UNKNOWN",
] as const;
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];

export const ACQUISITION_SOURCES = [
  "SYNTHETIC",        // programmatically generated (tests, fixtures, synthetic benchmarks)
  "CURATED",          // manually selected from a known source
  "WEB_SCRAPE",       // harvested from a public web page
  "INTERNAL_DATASET", // drawn from an internal data collection
  "PROVIDED",         // submitted by an external contributor
] as const;
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

// ---------------------------------------------------------------------------
// ProvenanceRecord
// ---------------------------------------------------------------------------

export interface ProvenanceRecord {
  /** Where the document was sourced from. */
  readonly acquisitionSource: AcquisitionSource;
  /** ISO 8601 datetime when the document was acquired. */
  readonly acquisitionDate: string;
  /** URL, file path, or human-readable description of the document origin. */
  readonly documentOrigin: string;
  /** Original filename as it was stored at the acquisition source. */
  readonly originalFilename: string;
  /** Licence or usage rights status. */
  readonly licenceStatus: LicenceStatus;
  /** Optional free-text licence clarification (SPDX expression, URL, or note). */
  readonly licenceDetails?: string;
  /**
   * SHA-256 hex digest of the primary document content (generated text).
   * Ties the provenance record to the specific document byte sequence.
   */
  readonly contentDigest: string;
  /**
   * SHA-256 hex digest of all substantive provenance fields.
   * Excludes `provenanceDigest` itself (circularity prevention).
   */
  readonly provenanceDigest: string;
}

// ---------------------------------------------------------------------------
// computeProvenanceDigest
// ---------------------------------------------------------------------------

/**
 * Computes the deterministic SHA-256 digest of the substantive provenance fields.
 * Excludes `provenanceDigest` itself.
 */
export function computeProvenanceDigest(
  acquisitionSource: AcquisitionSource,
  acquisitionDate: string,
  documentOrigin: string,
  originalFilename: string,
  licenceStatus: LicenceStatus,
  contentDigest: string,
  licenceDetails?: string,
): string {
  const payload: Record<string, unknown> = {
    acquisitionDate,
    acquisitionSource,
    contentDigest,
    documentOrigin,
    licenceStatus,
    originalFilename,
  };
  if (licenceDetails !== undefined) {
    payload["licenceDetails"] = licenceDetails;
  }
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// buildProvenance
// ---------------------------------------------------------------------------

/**
 * Creates an immutable ProvenanceRecord.
 *
 * @param input.contentDigest SHA-256 hex of the primary (generated) document content.
 */
export function buildProvenance(input: {
  acquisitionSource: AcquisitionSource;
  acquisitionDate: string;
  documentOrigin: string;
  originalFilename: string;
  licenceStatus: LicenceStatus;
  licenceDetails?: string;
  contentDigest: string;
}): ProvenanceRecord {
  const {
    acquisitionSource,
    acquisitionDate,
    documentOrigin,
    originalFilename,
    licenceStatus,
    licenceDetails,
    contentDigest,
  } = input;

  const provenanceDigest = computeProvenanceDigest(
    acquisitionSource,
    acquisitionDate,
    documentOrigin,
    originalFilename,
    licenceStatus,
    contentDigest,
    licenceDetails,
  );

  const record: ProvenanceRecord = {
    acquisitionSource,
    acquisitionDate,
    documentOrigin,
    originalFilename,
    licenceStatus,
    ...(licenceDetails !== undefined ? { licenceDetails } : {}),
    contentDigest,
    provenanceDigest,
  };

  return Object.freeze(record);
}

// ---------------------------------------------------------------------------
// verifyProvenanceIntegrity
// ---------------------------------------------------------------------------

/**
 * Verifies a ProvenanceRecord has not been tampered with by recomputing and
 * comparing the stored `provenanceDigest`.
 */
export function verifyProvenanceIntegrity(record: ProvenanceRecord): boolean {
  const recomputed = computeProvenanceDigest(
    record.acquisitionSource,
    record.acquisitionDate,
    record.documentOrigin,
    record.originalFilename,
    record.licenceStatus,
    record.contentDigest,
    record.licenceDetails,
  );
  return recomputed === record.provenanceDigest;
}

// ---------------------------------------------------------------------------
// isProvenanceComplete
// ---------------------------------------------------------------------------

/**
 * Returns true when all required provenance fields are non-empty and the
 * digests are the correct length.  Does NOT re-derive the digest —
 * use `verifyProvenanceIntegrity` for tamper detection.
 */
export function isProvenanceComplete(record: ProvenanceRecord): boolean {
  return (
    record.acquisitionSource.length > 0 &&
    record.acquisitionDate.length > 0 &&
    record.documentOrigin.length > 0 &&
    record.originalFilename.length > 0 &&
    record.contentDigest.length === 64 &&
    record.provenanceDigest.length === 64
  );
}
