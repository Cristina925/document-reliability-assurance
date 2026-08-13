/**
 * DRA-001 — Acquisition-Layer Candidate Registry
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 *
 * An append-only ledger that records all admission decisions at the acquisition layer.
 * Distinct from the governance `AdmissionRegistry` (which captures the detailed
 * governance workflow), this registry provides the high-level acquisition audit
 * trail: who was admitted, who was rejected, why, at what time, and under which
 * corpus version.
 *
 * Invariants:
 *   - Records are never modified or deleted after insertion.
 *   - Each record carries a substantive digest (excludes `admissionTimestamp`).
 *   - The same document + decision + version always produces the same `entryDigest`.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type { AcquiredDocument } from "./pipeline.js";
import type { AdmissionDecision } from "../governance/admissions.js";
import type { ExclusionReason } from "../governance/exclusions.js";
import type { CorpusVersion } from "../governance/version.js";

// ---------------------------------------------------------------------------
// CandidateRegistryEntry
// ---------------------------------------------------------------------------

export interface CandidateRegistryEntry {
  /** Unique entry identifier (derived from document ID and decision). */
  readonly entryId: string;
  /** The acquired document for this candidate. */
  readonly document: AcquiredDocument;
  /** ADMITTED or REJECTED. */
  readonly decision: AdmissionDecision;
  /** Typed exclusion reasons (empty when ADMITTED). */
  readonly exclusionReasons: readonly ExclusionReason[];
  /** Human-readable reasons (parallel to exclusionReasons). */
  readonly reasons: readonly string[];
  /** Operational metadata — excluded from entryDigest. */
  readonly admissionTimestamp: string;
  /** Corpus version in effect at the time of this decision. */
  readonly corpusVersion: CorpusVersion;
  /** SHA-256 hex of all substantive fields. */
  readonly entryDigest: string;
}

// ---------------------------------------------------------------------------
// computeEntryDigest
// ---------------------------------------------------------------------------

/**
 * Deterministic SHA-256 digest of an entry's substantive fields.
 * Excludes `admissionTimestamp` (operational) and `entryDigest` itself.
 */
export function computeEntryDigest(
  entryId: string,
  corpusId: string,
  decision: AdmissionDecision,
  exclusionReasons: readonly ExclusionReason[],
  reasons: readonly string[],
  corpusVersion: CorpusVersion,
  contentDigest: string,
): string {
  const payload = {
    contentDigest,
    corpusId,
    corpusVersion,
    decision,
    entryId,
    exclusionReasons: [...exclusionReasons].sort(),
    reasons: [...reasons].sort(),
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// CandidateRegistry
// ---------------------------------------------------------------------------

/**
 * Append-only candidate registry.  Every admission decision — whether ADMITTED
 * or REJECTED — is recorded here, creating a permanent acquisition audit trail.
 *
 * The registry never removes, overwrites, or silently coalesces entries.
 * If the same document is submitted multiple times (e.g. after a correction
 * and re-acquisition), multiple entries will appear in the log.
 */
export class CandidateRegistry {
  private readonly _entries: CandidateRegistryEntry[] = [];

  // -------------------------------------------------------------------------
  // record
  // -------------------------------------------------------------------------

  /**
   * Appends an admission decision to the registry and returns the new entry.
   *
   * @param input.document         The acquired document.
   * @param input.decision         ADMITTED or REJECTED.
   * @param input.exclusionReasons Typed exclusion reasons (empty if ADMITTED).
   * @param input.reasons          Human-readable reasons (parallel to exclusionReasons).
   * @param input.corpusVersion    The corpus version string in effect.
   * @param input.timestamp        Optional wall-clock override for `admissionTimestamp`.
   */
  record(input: {
    document: AcquiredDocument;
    decision: AdmissionDecision;
    exclusionReasons: readonly ExclusionReason[];
    reasons: readonly string[];
    corpusVersion: CorpusVersion;
    timestamp?: string;
  }): CandidateRegistryEntry {
    const timestamp = input.timestamp ?? new Date().toISOString();
    const entryId = `cr-${input.document.corpusId}-${input.decision.toLowerCase()}`;

    const entryDigest = computeEntryDigest(
      entryId,
      input.document.corpusId,
      input.decision,
      input.exclusionReasons,
      input.reasons,
      input.corpusVersion,
      input.document.generatedContent.contentDigest,
    );

    const entry: CandidateRegistryEntry = Object.freeze({
      entryId,
      document: input.document,
      decision: input.decision,
      exclusionReasons: Object.freeze([...input.exclusionReasons]),
      reasons: Object.freeze([...input.reasons]),
      admissionTimestamp: timestamp,
      corpusVersion: input.corpusVersion,
      entryDigest,
    });

    this._entries.push(entry);
    return entry;
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /** All entries in insertion order. */
  list(): readonly CandidateRegistryEntry[] {
    return [...this._entries];
  }

  /** Only ADMITTED entries. */
  admitted(): readonly CandidateRegistryEntry[] {
    return this._entries.filter((e) => e.decision === "ADMITTED");
  }

  /** Only REJECTED entries. */
  rejected(): readonly CandidateRegistryEntry[] {
    return this._entries.filter((e) => e.decision === "REJECTED");
  }

  /** Returns the first matching entry for a given corpus document ID, or undefined. */
  findById(corpusId: string): CandidateRegistryEntry | undefined {
    return this._entries.find((e) => e.document.corpusId === corpusId);
  }

  /** Number of ADMITTED entries. */
  admittedCount(): number {
    return this._entries.filter((e) => e.decision === "ADMITTED").length;
  }

  /** Number of REJECTED entries. */
  rejectedCount(): number {
    return this._entries.filter((e) => e.decision === "REJECTED").length;
  }

  /** Total number of entries (ADMITTED + REJECTED). */
  totalCount(): number {
    return this._entries.length;
  }
}
