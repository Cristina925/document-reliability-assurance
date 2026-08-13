/**
 * DRA-001 — Corpus Validation
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 *
 * Automated validation of a corpus of AcquiredDocuments against six
 * independent checks, as required by DRA-001-04C §5:
 *
 *   1. Eligibility           — every document satisfies the governance eligibility rules
 *   2. Unique IDs            — all corpus IDs are distinct
 *   3. Unique Digests        — all content digests are distinct
 *   4. Near-Duplicates       — no pair exceeds the NEAR_DUPLICATE_JACCARD_THRESHOLD
 *   5. Provenance            — every document has a complete, non-empty provenance record
 *   6. Allocation            — protocol targets are consistent; actual distribution matches
 *
 * Each check runs independently.  A failure in one check does not prevent
 * the other checks from running.  All failures are collected and reported.
 */

import { checkEligibility } from "../governance/eligibility.js";
import {
  assessDuplicate,
  NEAR_DUPLICATE_JACCARD_THRESHOLD,
} from "../governance/near-duplicate.js";
import { validateAllocationTotals } from "../governance/allocation.js";
import { isProvenanceComplete } from "./provenance.js";
import type { AcquiredDocument } from "./pipeline.js";
import type { BenchmarkSelectionProtocol } from "../governance/schema.js";
import type { Domain, DocumentType, Difficulty } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// ValidationCheck
// ---------------------------------------------------------------------------

export interface ValidationCheck {
  /** Short stable identifier for the check. */
  readonly name: string;
  /** true when the check passed, false when it failed. */
  readonly passed: boolean;
  /** Human-readable one-line summary. */
  readonly details: string;
  /** Per-document or per-pair failure messages (empty when passed). */
  readonly failures: readonly string[];
}

// ---------------------------------------------------------------------------
// CorpusValidationResult
// ---------------------------------------------------------------------------

export interface CorpusValidationResult {
  /** true when all checks pass. */
  readonly ok: boolean;
  /** Individual check results in a fixed order. */
  readonly checks: readonly ValidationCheck[];
  /** Names of failed checks (empty when ok=true). */
  readonly failedCheckNames: readonly string[];
}

// ---------------------------------------------------------------------------
// validateCorpus
// ---------------------------------------------------------------------------

/**
 * Validates a set of acquired documents against the governing selection
 * protocol.  All six checks run regardless of prior failures.
 *
 * @param documents List of admitted AcquiredDocument objects.
 * @param protocol  The selection protocol governing eligibility and allocation.
 */
export function validateCorpus(
  documents: readonly AcquiredDocument[],
  protocol: BenchmarkSelectionProtocol,
): CorpusValidationResult {
  const checks: ValidationCheck[] = [];

  // -------------------------------------------------------------------------
  // Check 1 — Eligibility
  // -------------------------------------------------------------------------
  {
    const failures: string[] = [];
    for (const doc of documents) {
      const result = checkEligibility(doc, protocol);
      if (result.outcome === "INELIGIBLE") {
        failures.push(`${doc.corpusId}: ${result.reason} — ${result.rationale}`);
      }
    }
    checks.push({
      name: "eligibility",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? `All ${documents.length} documents satisfy eligibility requirements`
          : `${failures.length}/${documents.length} documents failed eligibility`,
      failures,
    });
  }

  // -------------------------------------------------------------------------
  // Check 2 — Unique document identifiers
  // -------------------------------------------------------------------------
  {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (const doc of documents) {
      if (seen.has(doc.corpusId)) {
        failures.push(`Duplicate ID: ${doc.corpusId}`);
      }
      seen.add(doc.corpusId);
    }
    checks.push({
      name: "uniqueIds",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? "All document identifiers are unique"
          : `${failures.length} duplicate document identifier(s)`,
      failures,
    });
  }

  // -------------------------------------------------------------------------
  // Check 3 — Unique content digests
  // -------------------------------------------------------------------------
  {
    const seen = new Map<string, string>(); // digest → first corpusId
    const failures: string[] = [];
    for (const doc of documents) {
      const digest = doc.generatedContent.contentDigest;
      const prior = seen.get(digest);
      if (prior !== undefined) {
        failures.push(
          `${doc.corpusId} has the same content digest as ${prior} (${digest.slice(0, 8)}…)`,
        );
      } else {
        seen.set(digest, doc.corpusId);
      }
    }
    checks.push({
      name: "uniqueDigests",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? "All content digests are unique"
          : `${failures.length} duplicate content digest(s) detected`,
      failures,
    });
  }

  // -------------------------------------------------------------------------
  // Check 4 — Near-duplicate screening
  // -------------------------------------------------------------------------
  {
    const failures: string[] = [];
    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const a = documents[i]!;
        const b = documents[j]!;
        const assessment = assessDuplicate(
          a.generatedContent.content,
          b.generatedContent.content,
        );
        if (assessment.similarity >= NEAR_DUPLICATE_JACCARD_THRESHOLD) {
          failures.push(
            `${a.corpusId} ↔ ${b.corpusId}: Jaccard=${assessment.similarity.toFixed(4)} ≥ threshold=${NEAR_DUPLICATE_JACCARD_THRESHOLD}`,
          );
        }
      }
    }
    checks.push({
      name: "nearDuplicates",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? "No near-duplicate pairs detected"
          : `${failures.length} near-duplicate pair(s) exceed the rejection threshold`,
      failures,
    });
  }

  // -------------------------------------------------------------------------
  // Check 5 — Provenance completeness
  // -------------------------------------------------------------------------
  {
    const failures: string[] = [];
    for (const doc of documents) {
      if (!isProvenanceComplete(doc.provenance)) {
        failures.push(`${doc.corpusId}: provenance record is incomplete`);
      }
    }
    checks.push({
      name: "provenance",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? "All provenance records are complete"
          : `${failures.length} document(s) have incomplete provenance`,
      failures,
    });
  }

  // -------------------------------------------------------------------------
  // Check 6 — Allocation: protocol totals + actual distribution
  // -------------------------------------------------------------------------
  {
    const failures: string[] = [];

    // 6a: Protocol internal consistency
    const allocResult = validateAllocationTotals(protocol);
    if (!allocResult.ok) {
      failures.push(`Protocol allocation invalid: ${allocResult.code} — ${allocResult.message}`);
    }

    // 6b: Actual domain distribution
    const domainCounts = new Map<Domain, number>();
    const docTypeCounts = new Map<DocumentType, number>();
    const difficultyCounts = new Map<Difficulty, number>();
    for (const doc of documents) {
      domainCounts.set(doc.domain, (domainCounts.get(doc.domain) ?? 0) + 1);
      docTypeCounts.set(
        doc.documentType,
        (docTypeCounts.get(doc.documentType) ?? 0) + 1,
      );
      difficultyCounts.set(
        doc.difficulty,
        (difficultyCounts.get(doc.difficulty) ?? 0) + 1,
      );
    }

    for (const [domain, target] of Object.entries(
      protocol.domainAllocationTargets,
    )) {
      const actual = domainCounts.get(domain as Domain) ?? 0;
      if (target > 0 && actual !== target) {
        failures.push(
          `Domain ${domain}: expected ${target} document(s), found ${actual}`,
        );
      }
    }

    for (const [docType, target] of Object.entries(
      protocol.documentTypeAllocationTargets,
    )) {
      const actual = docTypeCounts.get(docType as DocumentType) ?? 0;
      if (target > 0 && actual !== target) {
        failures.push(
          `DocumentType ${docType}: expected ${target} document(s), found ${actual}`,
        );
      }
    }

    for (const [difficulty, target] of Object.entries(
      protocol.difficultyAllocationTargets,
    )) {
      const actual = difficultyCounts.get(difficulty as Difficulty) ?? 0;
      if (target > 0 && actual !== target) {
        failures.push(
          `Difficulty ${difficulty}: expected ${target} document(s), found ${actual}`,
        );
      }
    }

    checks.push({
      name: "allocation",
      passed: failures.length === 0,
      details:
        failures.length === 0
          ? `Allocation valid: all distributions match protocol targets (total=${documents.length})`
          : `${failures.length} allocation discrepancy(ies) detected`,
      failures,
    });
  }

  const failedCheckNames = checks
    .filter((c) => !c.passed)
    .map((c) => c.name);

  return Object.freeze({
    ok: failedCheckNames.length === 0,
    checks: Object.freeze(checks),
    failedCheckNames: Object.freeze(failedCheckNames),
  });
}
