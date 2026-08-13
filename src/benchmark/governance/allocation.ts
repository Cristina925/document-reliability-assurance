/**
 * DRA-001 — Benchmark Corpus Allocation Plan
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Implements deterministic target allocations by Domain, DocumentType, and
 * Difficulty.  The allocation plan is embedded in the selection protocol.
 *
 * Rules enforced:
 *   1. Domain allocation totals must equal targetCorpusSize.
 *   2. DocumentType allocation totals must equal targetCorpusSize.
 *   3. Difficulty allocation totals must equal targetCorpusSize.
 *   4. Over-allocation is rejected (admission refused when any cell is full).
 *   5. Under-allocation is visible (remaining counts surfaced in snapshot).
 *   6. Allocation rules do not depend on evaluator results.
 *   7. Canonical allocation order is deterministic (sorted keys).
 */

import type { Domain, DocumentType, Difficulty } from "../corpus/schema.js";
import type { BenchmarkSelectionProtocol } from "./schema.js";
import type { CorpusCandidate } from "./eligibility.js";

// ---------------------------------------------------------------------------
// AllocationCell
// ---------------------------------------------------------------------------

export interface AllocationCell {
  /** Target number of documents for this allocation slot. */
  readonly target: number;
  /** Number of documents admitted so far. */
  readonly admitted: number;
  /** target − admitted. May be negative if over-admitted (should not occur). */
  readonly remaining: number;
}

// ---------------------------------------------------------------------------
// AllocationSnapshot — canonical point-in-time state
// ---------------------------------------------------------------------------

export interface AllocationSnapshot {
  readonly domain: Readonly<Record<string, AllocationCell>>;
  readonly documentType: Readonly<Record<string, AllocationCell>>;
  readonly difficulty: Readonly<Record<string, AllocationCell>>;
}

// ---------------------------------------------------------------------------
// AllocationValidationResult
// ---------------------------------------------------------------------------

export type AllocationValidationResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: AllocationValidationErrorCode;
      readonly message: string;
    };

export type AllocationValidationErrorCode =
  | "DOMAIN_TOTAL_MISMATCH"
  | "DOCTYPE_TOTAL_MISMATCH"
  | "DIFFICULTY_TOTAL_MISMATCH";

// ---------------------------------------------------------------------------
// validateAllocationTotals
// ---------------------------------------------------------------------------

/**
 * Validates that each allocation dimension's total equals `targetCorpusSize`.
 *
 * All three dimensions (domain, documentType, difficulty) are checked
 * independently.  The first mismatch is returned; all three are not checked
 * simultaneously.
 */
export function validateAllocationTotals(
  protocol: BenchmarkSelectionProtocol,
): AllocationValidationResult {
  const sum = (obj: Partial<Record<string, number>>): number =>
    Object.values(obj).reduce<number>((s, v) => s + (v ?? 0), 0);

  const domainTotal = sum(protocol.domainAllocationTargets);
  if (domainTotal !== protocol.targetCorpusSize) {
    return {
      ok: false,
      code: "DOMAIN_TOTAL_MISMATCH",
      message: `Domain allocation total (${domainTotal}) does not equal targetCorpusSize (${protocol.targetCorpusSize})`,
    };
  }

  const docTypeTotal = sum(protocol.documentTypeAllocationTargets);
  if (docTypeTotal !== protocol.targetCorpusSize) {
    return {
      ok: false,
      code: "DOCTYPE_TOTAL_MISMATCH",
      message: `Document type allocation total (${docTypeTotal}) does not equal targetCorpusSize (${protocol.targetCorpusSize})`,
    };
  }

  const difficultyTotal = sum(protocol.difficultyAllocationTargets);
  if (difficultyTotal !== protocol.targetCorpusSize) {
    return {
      ok: false,
      code: "DIFFICULTY_TOTAL_MISMATCH",
      message: `Difficulty allocation total (${difficultyTotal}) does not equal targetCorpusSize (${protocol.targetCorpusSize})`,
    };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// AllocationTracker
// ---------------------------------------------------------------------------

/**
 * Tracks admitted counts against the allocation targets from a protocol.
 *
 * Checks capacity across all three allocation dimensions (domain, documentType,
 * difficulty) before admitting a candidate.  If any dimension is full, the
 * candidate is refused.
 *
 * The tracker is stateful; mutations occur through `recordAdmission()`.
 * The `snapshot()` method produces a deterministic, canonical view.
 */
export class AllocationTracker {
  private readonly domainCounts: Map<string, number> = new Map();
  private readonly docTypeCounts: Map<string, number> = new Map();
  private readonly difficultyCounts: Map<string, number> = new Map();

  constructor(private readonly protocol: BenchmarkSelectionProtocol) {}

  // -------------------------------------------------------------------------
  // checkCapacity
  // -------------------------------------------------------------------------

  /**
   * Returns true when the candidate can be admitted without exceeding any
   * allocation target.  Returns false if any of its three allocation cells
   * (domain, documentType, difficulty) is already at or beyond its target.
   */
  checkCapacity(candidate: CorpusCandidate): boolean {
    if (!this.hasDomainCapacity(candidate.domain)) return false;
    if (!this.hasDocTypeCapacity(candidate.documentType)) return false;
    if (!this.hasDifficultyCapacity(candidate.difficulty)) return false;
    return true;
  }

  private hasDomainCapacity(domain: Domain): boolean {
    const target = this.protocol.domainAllocationTargets[domain] ?? 0;
    const admitted = this.domainCounts.get(domain) ?? 0;
    return admitted < target;
  }

  private hasDocTypeCapacity(docType: DocumentType): boolean {
    const target = this.protocol.documentTypeAllocationTargets[docType] ?? 0;
    const admitted = this.docTypeCounts.get(docType) ?? 0;
    return admitted < target;
  }

  private hasDifficultyCapacity(difficulty: Difficulty): boolean {
    const target = this.protocol.difficultyAllocationTargets[difficulty] ?? 0;
    const admitted = this.difficultyCounts.get(difficulty) ?? 0;
    return admitted < target;
  }

  // -------------------------------------------------------------------------
  // recordAdmission
  // -------------------------------------------------------------------------

  /**
   * Increments the admitted counts for the candidate's domain, document type,
   * and difficulty.  Must only be called after `checkCapacity` returns true.
   */
  recordAdmission(candidate: CorpusCandidate): void {
    this.domainCounts.set(
      candidate.domain,
      (this.domainCounts.get(candidate.domain) ?? 0) + 1,
    );
    this.docTypeCounts.set(
      candidate.documentType,
      (this.docTypeCounts.get(candidate.documentType) ?? 0) + 1,
    );
    this.difficultyCounts.set(
      candidate.difficulty,
      (this.difficultyCounts.get(candidate.difficulty) ?? 0) + 1,
    );
  }

  // -------------------------------------------------------------------------
  // Cell accessors
  // -------------------------------------------------------------------------

  getCellForDomain(domain: string): AllocationCell {
    const target = this.protocol.domainAllocationTargets[domain as Domain] ?? 0;
    const admitted = this.domainCounts.get(domain) ?? 0;
    return { target, admitted, remaining: target - admitted };
  }

  getCellForDocumentType(docType: string): AllocationCell {
    const target =
      this.protocol.documentTypeAllocationTargets[docType as DocumentType] ?? 0;
    const admitted = this.docTypeCounts.get(docType) ?? 0;
    return { target, admitted, remaining: target - admitted };
  }

  getCellForDifficulty(difficulty: string): AllocationCell {
    const target =
      this.protocol.difficultyAllocationTargets[difficulty as Difficulty] ?? 0;
    const admitted = this.difficultyCounts.get(difficulty) ?? 0;
    return { target, admitted, remaining: target - admitted };
  }

  // -------------------------------------------------------------------------
  // snapshot — deterministic canonical view
  // -------------------------------------------------------------------------

  /**
   * Returns a sorted, canonical snapshot of all allocation cells.
   * Keys are sorted lexicographically within each dimension.
   */
  snapshot(): AllocationSnapshot {
    const buildDim = (
      targets: Partial<Record<string, number>>,
      counts: Map<string, number>,
    ): Record<string, AllocationCell> => {
      const result: Record<string, AllocationCell> = {};
      for (const key of Object.keys(targets).sort()) {
        const target = targets[key] ?? 0;
        const admitted = counts.get(key) ?? 0;
        result[key] = { target, admitted, remaining: target - admitted };
      }
      return result;
    };

    return {
      domain: buildDim(
        this.protocol.domainAllocationTargets,
        this.domainCounts,
      ),
      documentType: buildDim(
        this.protocol.documentTypeAllocationTargets,
        this.docTypeCounts,
      ),
      difficulty: buildDim(
        this.protocol.difficultyAllocationTargets,
        this.difficultyCounts,
      ),
    };
  }

  // -------------------------------------------------------------------------
  // totalAdmitted
  // -------------------------------------------------------------------------

  /** Total number of documents admitted across all domains. */
  totalAdmitted(): number {
    let total = 0;
    for (const v of this.domainCounts.values()) total += v;
    return total;
  }
}
