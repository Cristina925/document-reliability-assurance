/**
 * DRA-001 — Benchmark Corpus Candidate Admission Workflow
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Implements the typed candidate-admission workflow:
 *   1. Validate eligibility (schema, metadata, governance flags).
 *   2. Check exact-duplicate content digest.
 *   3. Check near-duplicate Jaccard similarity.
 *   4. Check remaining allocation capacity.
 *   5. Produce ADMITTED or REJECTED with all reasons recorded.
 *   6. Record an immutable admission audit entry.
 *
 * Admission decisions are reproducible from the same candidate, protocol,
 * and registry state — the same inputs always produce the same decision.
 *
 * The evaluator is never invoked.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import { checkEligibility, type CorpusCandidate } from "./eligibility.js";
import type { BenchmarkSelectionProtocol } from "./schema.js";
import { AllocationTracker, type AllocationSnapshot } from "./allocation.js";
import { assessDuplicate, type DuplicateAssessment } from "./near-duplicate.js";
import type { ExclusionReason } from "./exclusions.js";
import type { CorpusVersion } from "./version.js";

// ---------------------------------------------------------------------------
// AdmissionDecision
// ---------------------------------------------------------------------------

export type AdmissionDecision = "ADMITTED" | "REJECTED";

// ---------------------------------------------------------------------------
// AdmissionRecord — immutable audit entry
// ---------------------------------------------------------------------------

/**
 * An immutable record of a single admission decision.
 *
 * All substantive fields are included in `admissionDigest`.
 * The `admissionTimestamp` is operational metadata and is excluded from the digest
 * so that replaying the same admission at different wall-clock times produces
 * the same substantive digest.
 */
export interface AdmissionRecord {
  /** Unique record identifier (derived from candidate reference and decision). */
  readonly recordId: string;
  /** Corpus ID of the candidate (DRA-DOC-NNNN). */
  readonly candidateReference: string;
  /** ADMITTED or REJECTED. */
  readonly decision: AdmissionDecision;
  /** Typed exclusion reasons (empty when ADMITTED). */
  readonly exclusionReasons: readonly ExclusionReason[];
  /** Human-readable reasons parallel to exclusionReasons. */
  readonly reasons: readonly string[];
  /** Protocol version in effect at the time of this decision. */
  readonly protocolVersion: CorpusVersion;
  /** Canonical allocation snapshot taken after the decision was applied. */
  readonly allocationSnapshot: AllocationSnapshot;
  /**
   * Near-duplicate assessment evidence retained per the governance protocol.
   * Present when a duplicate check was performed; undefined when not reached.
   */
  readonly duplicateAssessment?: DuplicateAssessment;
  /** Operational metadata — excluded from substantive digest. */
  readonly admissionTimestamp: string;
  /** SHA-256 hex of all substantive fields. */
  readonly admissionDigest: string;
}

// ---------------------------------------------------------------------------
// computeAdmissionDigest
// ---------------------------------------------------------------------------

/**
 * Computes the deterministic SHA-256 digest for an admission record.
 * Excludes `admissionTimestamp` and `admissionDigest` itself.
 */
export function computeAdmissionDigest(
  recordId: string,
  candidateReference: string,
  decision: AdmissionDecision,
  exclusionReasons: readonly ExclusionReason[],
  reasons: readonly string[],
  protocolVersion: CorpusVersion,
  allocationSnapshot: AllocationSnapshot,
  duplicateAssessment?: DuplicateAssessment,
): string {
  const payload: Record<string, unknown> = {
    allocationSnapshot,
    candidateReference,
    decision,
    exclusionReasons: [...exclusionReasons].sort(),
    protocolVersion,
    reasons: [...reasons].sort(),
    recordId,
  };
  if (duplicateAssessment !== undefined) {
    payload["duplicateAssessment"] = duplicateAssessment;
  }
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// AdmissionRegistry
// ---------------------------------------------------------------------------

/**
 * An append-only registry of all admission decisions (ADMITTED and REJECTED).
 *
 * Maintains:
 *   - A sequential list of AdmissionRecord objects (immutable audit log).
 *   - A set of admitted content digests (for exact-duplicate detection).
 *   - A list of admitted content strings (for near-duplicate comparison).
 *
 * The registry never removes or modifies existing records.
 */
export class AdmissionRegistry {
  private readonly _records: AdmissionRecord[] = [];
  private readonly _admittedContentDigests: Set<string> = new Set();
  private readonly _admittedContent: string[] = [];

  // -------------------------------------------------------------------------
  // admit
  // -------------------------------------------------------------------------

  /**
   * Runs the full admission workflow for a candidate and records the result.
   *
   * Steps (in order):
   *   1. Eligibility check (domain, type, language, governance flags).
   *   2. Exact-duplicate check (content digest).
   *   3. Near-duplicate check (Jaccard on normalised text).
   *   4. Allocation capacity check.
   *   5. Apply admission (update tracker and content sets if ADMITTED).
   *   6. Record and return the immutable AdmissionRecord.
   *
   * @param candidate   The proposed corpus document with content payloads.
   * @param protocol    The governing selection protocol (must be APPROVED).
   * @param tracker     The allocation tracker for this corpus session.
   * @param options     Optional timestamp and authority overrides.
   */
  admit(
    candidate: CorpusCandidate,
    protocol: BenchmarkSelectionProtocol,
    tracker: AllocationTracker,
    options?: { timestamp?: string },
  ): AdmissionRecord {
    const timestamp = options?.timestamp ?? new Date().toISOString();
    const candidateRef = candidate.corpusId;
    const exclusionReasons: ExclusionReason[] = [];
    const reasons: string[] = [];
    let duplicateAssessment: DuplicateAssessment | undefined;

    // Step 1: Eligibility.
    const eligibility = checkEligibility(candidate, protocol);
    if (eligibility.outcome === "INELIGIBLE") {
      exclusionReasons.push(eligibility.reason);
      reasons.push(eligibility.rationale);
    }

    // Step 2: Exact-duplicate check (content digest).
    const genDigest = candidate.generatedContent.contentDigest;
    if (this._admittedContentDigests.has(genDigest)) {
      if (!exclusionReasons.includes("DUPLICATE_CONTENT")) {
        exclusionReasons.push("DUPLICATE_CONTENT");
        reasons.push("Exact content digest already present in admitted corpus");
      }
    }

    // Step 3: Near-duplicate check (Jaccard similarity).
    const genContent = candidate.generatedContent.content;
    if (!exclusionReasons.includes("DUPLICATE_CONTENT")) {
      for (const admitted of this._admittedContent) {
        const assessment = assessDuplicate(genContent, admitted);
        if (
          assessment.status === "EXACT_DUPLICATE" ||
          assessment.status === "NEAR_DUPLICATE"
        ) {
          duplicateAssessment = assessment;
          if (!exclusionReasons.includes("NEAR_DUPLICATE_CONTENT")) {
            exclusionReasons.push("NEAR_DUPLICATE_CONTENT");
            reasons.push(
              `Near-duplicate detected (Jaccard=${assessment.similarity.toFixed(4)}, status=${assessment.status})`,
            );
          }
          break;
        }
        // Retain the first borderline assessment as evidence even if not blocking.
        if (assessment.status === "REQUIRES_MANUAL_REVIEW" && duplicateAssessment === undefined) {
          duplicateAssessment = assessment;
        }
      }
    }

    // Step 4: Allocation capacity check (only when otherwise eligible).
    if (exclusionReasons.length === 0 && !tracker.checkCapacity(candidate)) {
      exclusionReasons.push("ALLOCATION_FILLED");
      reasons.push(
        `Allocation at capacity for domain=${candidate.domain}, ` +
          `type=${candidate.documentType}, difficulty=${candidate.difficulty}`,
      );
    }

    // Step 5: Apply admission.
    const decision: AdmissionDecision =
      exclusionReasons.length === 0 ? "ADMITTED" : "REJECTED";

    if (decision === "ADMITTED") {
      tracker.recordAdmission(candidate);
      this._admittedContentDigests.add(genDigest);
      this._admittedContent.push(genContent);
    }

    // Step 6: Record.
    const snapshot = tracker.snapshot();
    const recordId = `admission-${candidateRef}-${decision.toLowerCase()}`;

    const admissionDigest = computeAdmissionDigest(
      recordId,
      candidateRef,
      decision,
      exclusionReasons,
      reasons,
      protocol.protocolVersion,
      snapshot,
      duplicateAssessment,
    );

    const record: AdmissionRecord = Object.freeze({
      recordId,
      candidateReference: candidateRef,
      decision,
      exclusionReasons: Object.freeze([...exclusionReasons]),
      reasons: Object.freeze([...reasons]),
      protocolVersion: protocol.protocolVersion,
      allocationSnapshot: snapshot,
      duplicateAssessment,
      admissionTimestamp: timestamp,
      admissionDigest,
    });

    this._records.push(record);
    return record;
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /** Returns all admission records in insertion order. */
  list(): readonly AdmissionRecord[] {
    return [...this._records];
  }

  /** Returns the most recent record for the given candidate reference, or undefined. */
  findByCandidateRef(ref: string): AdmissionRecord | undefined {
    return [...this._records].reverse().find((r) => r.candidateReference === ref);
  }

  /** Number of ADMITTED candidates. */
  admittedCount(): number {
    return this._records.filter((r) => r.decision === "ADMITTED").length;
  }

  /** Number of REJECTED candidates. */
  rejectedCount(): number {
    return this._records.filter((r) => r.decision === "REJECTED").length;
  }

  /** Total number of decisions recorded (ADMITTED + REJECTED). */
  totalCount(): number {
    return this._records.length;
  }
}
