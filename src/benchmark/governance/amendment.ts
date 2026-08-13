/**
 * DRA-001 — Benchmark Corpus Amendment Rules
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * After a corpus is frozen, direct mutation is prohibited.
 * Corrections require:
 *   1. Creation of a new corpus version.
 *   2. An explicit amendment record.
 *   3. Identification of changed entries (with before/after digests).
 *   4. A reason for the change.
 *   5. Compatibility classification (PATCH | MINOR | MAJOR).
 *   6. Preservation of the prior frozen corpus.
 *
 * Destructive overwrite is rejected.
 * Downgraded or unchanged corpus versions are rejected.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import {
  compareCorpusVersions,
  type CorpusVersion,
} from "./version.js";
import type { FreezeRecord } from "./freeze.js";

// ---------------------------------------------------------------------------
// CompatibilityClassification
// ---------------------------------------------------------------------------

/**
 * Classification of the corpus change for downstream consumers.
 *   PATCH  — metadata-only corrections; no substantive document changes.
 *   MINOR  — additions or replacements; content changes do not break evaluation.
 *   MAJOR  — materially different corpus design or selection protocol.
 */
export type CompatibilityClassification = "PATCH" | "MINOR" | "MAJOR";

// ---------------------------------------------------------------------------
// ChangedEntry
// ---------------------------------------------------------------------------

export type EntryChangeType = "MODIFIED_METADATA" | "REPLACED" | "ADDED" | "REMOVED";

/**
 * Records a single document-level change within an amendment.
 * priorDigest is null for ADDED entries; newDigest is null for REMOVED entries.
 */
export interface ChangedEntry {
  /** Corpus document ID affected by this change. */
  readonly corpusId: string;
  /** Type of change applied to this document. */
  readonly changeType: EntryChangeType;
  /** Integrity digest before the change (null for new additions). */
  readonly priorDigest: string | null;
  /** Integrity digest after the change (null for removals). */
  readonly newDigest: string | null;
  /** Human-readable description of the specific change. */
  readonly description: string;
}

// ---------------------------------------------------------------------------
// AmendmentRecord
// ---------------------------------------------------------------------------

/**
 * An immutable record of a corpus amendment.
 *
 * The `amendmentTimestamp` is operational metadata and is excluded from the
 * substantive digest.  Re-recording the same amendment at different wall-clock
 * times produces the same `amendmentDigest`.
 */
export interface AmendmentRecord {
  /** Unique identifier for this amendment. */
  readonly amendmentId: string;
  /** The corpus version being superseded. */
  readonly priorCorpusVersion: CorpusVersion;
  /** The new corpus version introduced by this amendment (must be > prior). */
  readonly newCorpusVersion: CorpusVersion;
  /** List of specific document-level changes (must be non-empty). */
  readonly changedEntries: readonly ChangedEntry[];
  /** Human-readable reason for the amendment. */
  readonly reason: string;
  /** Classification of impact for downstream consumers. */
  readonly compatibilityClassification: CompatibilityClassification;
  /** Manifest digest of the prior frozen corpus (preserved reference). */
  readonly priorManifestDigest: string;
  /** Manifest digest of the new corpus after amendment. */
  readonly newManifestDigest: string;
  /** Freeze digest of the prior frozen corpus (tamper evidence). */
  readonly priorFreezeDigest: string;
  /** Operational metadata — excluded from substantive digest. */
  readonly amendmentTimestamp: string;
  /** SHA-256 hex of all substantive fields. */
  readonly amendmentDigest: string;
}

// ---------------------------------------------------------------------------
// AmendmentError
// ---------------------------------------------------------------------------

export class AmendmentError extends Error {
  public readonly code: AmendmentErrorCode;
  constructor(message: string, code: AmendmentErrorCode) {
    super(message);
    this.name = "AmendmentError";
    this.code = code;
    Object.setPrototypeOf(this, AmendmentError.prototype);
  }
}

export type AmendmentErrorCode =
  | "DOWNGRADE_REJECTED"
  | "SAME_VERSION_REJECTED"
  | "MISSING_CHANGED_ENTRIES"
  | "DESTRUCTIVE_OVERWRITE";

// ---------------------------------------------------------------------------
// computeAmendmentDigest
// ---------------------------------------------------------------------------

/**
 * Computes the deterministic SHA-256 digest for an amendment record's
 * substantive fields.  Excludes `amendmentTimestamp` and `amendmentDigest`.
 */
export function computeAmendmentDigest(
  amendmentId: string,
  priorCorpusVersion: CorpusVersion,
  newCorpusVersion: CorpusVersion,
  changedEntries: readonly ChangedEntry[],
  reason: string,
  compatibilityClassification: CompatibilityClassification,
  priorManifestDigest: string,
  newManifestDigest: string,
  priorFreezeDigest: string,
): string {
  const payload = {
    amendmentId,
    changedEntries: [...changedEntries].sort((a, b) =>
      a.corpusId.localeCompare(b.corpusId),
    ),
    compatibilityClassification,
    newCorpusVersion,
    newManifestDigest,
    priorCorpusVersion,
    priorFreezeDigest,
    priorManifestDigest,
    reason,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// createAmendmentRecord
// ---------------------------------------------------------------------------

/**
 * Creates an immutable AmendmentRecord.
 *
 * Validates:
 *   - newCorpusVersion > priorCorpusVersion (downgrade rejected).
 *   - newCorpusVersion !== priorCorpusVersion (same version rejected).
 *   - changedEntries is non-empty (amendment must specify changes).
 *   - Not all entries are removals from a full corpus (destructive overwrite).
 *
 * @param input.amendmentId              Unique identifier for this amendment.
 * @param input.priorFreezeRecord        The freeze record of the corpus being amended.
 * @param input.newCorpusVersion         The replacement corpus version.
 * @param input.newManifestDigest        Manifest digest of the amended corpus.
 * @param input.changedEntries           List of specific document changes.
 * @param input.reason                   Human-readable rationale.
 * @param input.compatibilityClassification  PATCH | MINOR | MAJOR.
 * @param input.timestamp                Optional wall-clock timestamp override.
 */
export function createAmendmentRecord(input: {
  amendmentId: string;
  priorFreezeRecord: FreezeRecord;
  newCorpusVersion: CorpusVersion;
  newManifestDigest: string;
  changedEntries: readonly ChangedEntry[];
  reason: string;
  compatibilityClassification: CompatibilityClassification;
  timestamp?: string;
}): AmendmentRecord {
  const {
    amendmentId,
    priorFreezeRecord,
    newCorpusVersion,
    newManifestDigest,
    changedEntries,
    reason,
    compatibilityClassification,
    timestamp = new Date().toISOString(),
  } = input;

  // Validate version direction.
  const cmp = compareCorpusVersions(newCorpusVersion, priorFreezeRecord.corpusVersion);
  if (cmp === 0) {
    throw new AmendmentError(
      `New corpus version (${newCorpusVersion}) must differ from prior version (${priorFreezeRecord.corpusVersion})`,
      "SAME_VERSION_REJECTED",
    );
  }
  if (cmp < 0) {
    throw new AmendmentError(
      `New corpus version (${newCorpusVersion}) must be greater than prior version (${priorFreezeRecord.corpusVersion}) — downgrade prohibited`,
      "DOWNGRADE_REJECTED",
    );
  }

  // Validate changed entries.
  if (changedEntries.length === 0) {
    throw new AmendmentError(
      "Amendment must specify at least one changed entry",
      "MISSING_CHANGED_ENTRIES",
    );
  }

  // Reject destructive total removal.
  const allRemoved = changedEntries.every((e) => e.changeType === "REMOVED");
  if (
    allRemoved &&
    priorFreezeRecord.documentCount > 0 &&
    changedEntries.length >= priorFreezeRecord.documentCount
  ) {
    throw new AmendmentError(
      "Amendment cannot remove all documents — destructive overwrite is prohibited",
      "DESTRUCTIVE_OVERWRITE",
    );
  }

  const amendmentDigest = computeAmendmentDigest(
    amendmentId,
    priorFreezeRecord.corpusVersion,
    newCorpusVersion,
    changedEntries,
    reason,
    compatibilityClassification,
    priorFreezeRecord.manifestDigest,
    newManifestDigest,
    priorFreezeRecord.freezeDigest,
  );

  return Object.freeze({
    amendmentId,
    priorCorpusVersion: priorFreezeRecord.corpusVersion,
    newCorpusVersion,
    changedEntries: Object.freeze([...changedEntries]),
    reason,
    compatibilityClassification,
    priorManifestDigest: priorFreezeRecord.manifestDigest,
    newManifestDigest,
    priorFreezeDigest: priorFreezeRecord.freezeDigest,
    amendmentTimestamp: timestamp,
    amendmentDigest,
  });
}
