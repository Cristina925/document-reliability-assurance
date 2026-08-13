/**
 * DRA-001 — Benchmark Corpus Exclusion Criteria
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Defines the exhaustive set of exclusion reasons that may result in a
 * corpus candidate being rejected.  Every rejection must be recorded in
 * an immutable ExclusionRecord; rejections never disappear from the audit log.
 *
 * Exclusion records carry a deterministic digest covering all substantive
 * fields.  The decisionTimestamp is operational metadata and is excluded
 * from the digest so that re-recording the same rejection at different
 * wall-clock times produces the same substantive digest.
 */

import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type { CorpusVersion } from "./version.js";

// ---------------------------------------------------------------------------
// ExclusionReason
// ---------------------------------------------------------------------------

export const EXCLUSION_REASONS = [
  "INVALID_SCHEMA",
  "INCOMPLETE_METADATA",
  "UNVERIFIABLE_SOURCE",
  "DUPLICATE_CONTENT",
  "NEAR_DUPLICATE_CONTENT",
  "OUT_OF_SCOPE_DOMAIN",
  "OUT_OF_SCOPE_DOCUMENT_TYPE",
  "DISALLOWED_LANGUAGE",
  "DISALLOWED_SOURCE_TYPE",
  "CORRUPT_CONTENT",
  "LICENSING_OR_PERMISSION_FAILURE",
  "BENCHMARK_LEAKAGE",
  "EVALUATOR_INFLUENCED_SELECTION",
  "PREANNOTATED_OUTCOME",
  "ALLOCATION_FILLED",
  "OTHER_DOCUMENTED_REASON",
] as const;

export type ExclusionReason = (typeof EXCLUSION_REASONS)[number];

export const ExclusionReasonSchema = z.enum(
  EXCLUSION_REASONS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// ExclusionRecord
// ---------------------------------------------------------------------------

export interface ExclusionRecord {
  /** Reference to the rejected candidate (typically the tentative corpus ID). */
  readonly candidateReference: string;
  /** Reason code for the rejection. */
  readonly exclusionReason: ExclusionReason;
  /** Human-readable rationale for the rejection. */
  readonly rationale: string;
  /** The protocol version in effect at the time of rejection. */
  readonly protocolVersion: CorpusVersion;
  /** Person, system, or process that made the rejection decision. */
  readonly decisionAuthority: string;
  /** Operational metadata — excluded from substantive digest. */
  readonly decisionTimestamp: string;
  /** SHA-256 hex of all substantive fields. */
  readonly exclusionDigest: string;
}

// ---------------------------------------------------------------------------
// computeExclusionDigest
// ---------------------------------------------------------------------------

/**
 * Computes the substantive SHA-256 digest for an exclusion record.
 *
 * Excluded from digest: `decisionTimestamp` (operational) and the digest itself.
 */
export function computeExclusionDigest(
  candidateReference: string,
  exclusionReason: ExclusionReason,
  rationale: string,
  protocolVersion: CorpusVersion,
  decisionAuthority: string,
): string {
  const payload = {
    candidateReference,
    decisionAuthority,
    exclusionReason,
    protocolVersion,
    rationale,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// buildExclusionRecord
// ---------------------------------------------------------------------------

/**
 * Creates a frozen, immutable ExclusionRecord.
 * The substantive digest is computed automatically.
 */
export function buildExclusionRecord(
  candidateReference: string,
  exclusionReason: ExclusionReason,
  rationale: string,
  protocolVersion: CorpusVersion,
  decisionAuthority: string,
  decisionTimestamp: string,
): ExclusionRecord {
  return Object.freeze({
    candidateReference,
    exclusionReason,
    rationale,
    protocolVersion,
    decisionAuthority,
    decisionTimestamp,
    exclusionDigest: computeExclusionDigest(
      candidateReference,
      exclusionReason,
      rationale,
      protocolVersion,
      decisionAuthority,
    ),
  });
}
