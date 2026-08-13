/**
 * DRA-001 — Corpus Acquisition Reporting
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 *
 * Five typed reports generated from acquisition and governance data:
 *
 *   1. InitialCorpusReport     — high-level summary (admitted, rejected, protocol)
 *   2. CorpusStatisticsReport  — dimensional breakdown (domain, docType, difficulty, source)
 *   3. ProvenanceReport        — per-document provenance data
 *   4. ValidationReport        — results of all automated validation checks
 *   5. FreezeReport            — freeze record summary and verification status
 *
 * Reports are plain-object snapshots — they do not update when underlying
 * data changes after generation.  All timestamps are ISO 8601.
 */

import type { AcquiredDocument } from "./pipeline.js";
import type { CandidateRegistry } from "./candidate-registry.js";
import type { CorpusValidationResult } from "./corpus-validator.js";
import type { FreezeRecord } from "../governance/freeze.js";
import type { BenchmarkSelectionProtocol } from "../governance/schema.js";
import type { CorpusVersion } from "../governance/version.js";

// ---------------------------------------------------------------------------
// DimensionStatistic — shared shape for distribution breakdowns
// ---------------------------------------------------------------------------

export interface DimensionStatistic {
  /** Dimension value (domain name, document type, difficulty level, etc.). */
  readonly dimension: string;
  /** Number of documents in this cell. */
  readonly count: number;
  /** Percentage of total, rounded to two decimal places. */
  readonly percentage: number;
  /** Protocol target for this cell (undefined when not specified by protocol). */
  readonly target?: number;
}

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

export interface InitialCorpusReport {
  readonly title: "DRA-001 Initial Corpus Report";
  readonly corpusVersion: CorpusVersion;
  /** Number of documents admitted to the corpus. */
  readonly admittedCount: number;
  /** Number of candidate documents rejected. */
  readonly rejectedCount: number;
  /** Total candidates processed (admitted + rejected). */
  readonly totalProcessed: number;
  readonly protocolId: string;
  readonly protocolVersion: CorpusVersion;
  readonly generatedAt: string;
}

export interface CorpusStatisticsReport {
  readonly corpusVersion: CorpusVersion;
  readonly totalDocuments: number;
  readonly byDomain: readonly DimensionStatistic[];
  readonly byDocumentType: readonly DimensionStatistic[];
  readonly byDifficulty: readonly DimensionStatistic[];
  readonly bySourceType: readonly DimensionStatistic[];
  readonly generatedAt: string;
}

export interface ProvenanceReportEntry {
  readonly corpusId: string;
  readonly originalFilename: string;
  readonly acquisitionSource: string;
  readonly acquisitionDate: string;
  readonly licenceStatus: string;
  readonly documentOrigin: string;
  readonly provenanceDigest: string;
  readonly integrityVerified: boolean;
}

export interface ProvenanceReport {
  readonly corpusVersion: CorpusVersion;
  readonly totalEntries: number;
  readonly allComplete: boolean;
  readonly entries: readonly ProvenanceReportEntry[];
  readonly generatedAt: string;
}

export interface ValidationCheckSummary {
  readonly name: string;
  readonly passed: boolean;
  readonly details: string;
  readonly failureCount: number;
}

export interface ValidationReport {
  readonly corpusVersion: CorpusVersion;
  readonly overallResult: "PASS" | "FAIL";
  readonly passedChecks: number;
  readonly failedChecks: number;
  readonly checks: readonly ValidationCheckSummary[];
  readonly generatedAt: string;
}

export interface FreezeReport {
  readonly corpusVersion: CorpusVersion;
  readonly documentCount: number;
  readonly manifestDigest: string;
  readonly freezeDigest: string;
  readonly protocolDigest: string;
  readonly freezeVerified: boolean;
  readonly canonicalDocumentIds: readonly string[];
  readonly generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function percentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 10000) / 100;
}

function countBy<K extends string>(
  documents: readonly AcquiredDocument[],
  key: (d: AcquiredDocument) => K,
  targets?: Partial<Record<K, number>>,
): DimensionStatistic[] {
  const counts = new Map<K, number>();
  for (const doc of documents) {
    const k = key(doc);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  // Include any target dimensions with zero actual count
  if (targets) {
    for (const k of Object.keys(targets) as K[]) {
      if (!counts.has(k)) counts.set(k, 0);
    }
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dimension, count]) => ({
      dimension,
      count,
      percentage: percentage(count, documents.length),
      ...(targets && targets[dimension as K] !== undefined
        ? { target: targets[dimension as K]! }
        : {}),
    }));
}

// ---------------------------------------------------------------------------
// generateInitialCorpusReport
// ---------------------------------------------------------------------------

export function generateInitialCorpusReport(
  candidateRegistry: CandidateRegistry,
  protocol: BenchmarkSelectionProtocol,
  corpusVersion: CorpusVersion,
  options?: { timestamp?: string },
): InitialCorpusReport {
  return Object.freeze({
    title: "DRA-001 Initial Corpus Report" as const,
    corpusVersion,
    admittedCount: candidateRegistry.admittedCount(),
    rejectedCount: candidateRegistry.rejectedCount(),
    totalProcessed: candidateRegistry.totalCount(),
    protocolId: protocol.protocolId,
    protocolVersion: protocol.protocolVersion,
    generatedAt: options?.timestamp ?? new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// generateStatisticsReport
// ---------------------------------------------------------------------------

export function generateStatisticsReport(
  documents: readonly AcquiredDocument[],
  protocol: BenchmarkSelectionProtocol,
  corpusVersion: CorpusVersion,
  options?: { timestamp?: string },
): CorpusStatisticsReport {
  return Object.freeze({
    corpusVersion,
    totalDocuments: documents.length,
    byDomain: countBy(documents, (d) => d.domain, protocol.domainAllocationTargets as never),
    byDocumentType: countBy(documents, (d) => d.documentType, protocol.documentTypeAllocationTargets as never),
    byDifficulty: countBy(documents, (d) => d.difficulty, protocol.difficultyAllocationTargets as never),
    bySourceType: countBy(documents, (d) => d.sourceType),
    generatedAt: options?.timestamp ?? new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// generateProvenanceReport
// ---------------------------------------------------------------------------

import { verifyProvenanceIntegrity } from "./provenance.js";

export function generateProvenanceReport(
  documents: readonly AcquiredDocument[],
  corpusVersion: CorpusVersion,
  options?: { timestamp?: string },
): ProvenanceReport {
  const entries: ProvenanceReportEntry[] = documents.map((doc) => ({
    corpusId: doc.corpusId,
    originalFilename: doc.provenance.originalFilename,
    acquisitionSource: doc.provenance.acquisitionSource,
    acquisitionDate: doc.provenance.acquisitionDate,
    licenceStatus: doc.provenance.licenceStatus,
    documentOrigin: doc.provenance.documentOrigin,
    provenanceDigest: doc.provenance.provenanceDigest,
    integrityVerified: verifyProvenanceIntegrity(doc.provenance),
  }));

  return Object.freeze({
    corpusVersion,
    totalEntries: entries.length,
    allComplete: entries.every((e) => e.provenanceDigest.length === 64 && e.integrityVerified),
    entries: Object.freeze(entries),
    generatedAt: options?.timestamp ?? new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// generateValidationReport
// ---------------------------------------------------------------------------

export function generateValidationReport(
  validationResult: CorpusValidationResult,
  corpusVersion: CorpusVersion,
  options?: { timestamp?: string },
): ValidationReport {
  const checks: ValidationCheckSummary[] = validationResult.checks.map((c) => ({
    name: c.name,
    passed: c.passed,
    details: c.details,
    failureCount: c.failures.length,
  }));
  const passed = checks.filter((c) => c.passed).length;
  return Object.freeze({
    corpusVersion,
    overallResult: validationResult.ok ? "PASS" : "FAIL",
    passedChecks: passed,
    failedChecks: checks.length - passed,
    checks: Object.freeze(checks),
    generatedAt: options?.timestamp ?? new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// generateFreezeReport
// ---------------------------------------------------------------------------

export function generateFreezeReport(
  freezeRecord: FreezeRecord,
  freezeVerified: boolean,
  options?: { timestamp?: string },
): FreezeReport {
  return Object.freeze({
    corpusVersion: freezeRecord.corpusVersion,
    documentCount: freezeRecord.documentCount,
    manifestDigest: freezeRecord.manifestDigest,
    freezeDigest: freezeRecord.freezeDigest,
    protocolDigest: freezeRecord.protocolDigest,
    freezeVerified,
    canonicalDocumentIds: Object.freeze([...freezeRecord.canonicalDocumentIds]),
    generatedAt: options?.timestamp ?? new Date().toISOString(),
  });
}
