/**
 * DRA-001-06 — Benchmark Report Generators
 *
 * Generates five structured report types from benchmark execution data:
 *   1. BenchmarkExecutionReport    — run metadata and per-document outcomes
 *   2. ComparativeEvaluationReport — evaluator vs reviewer comparisons
 *   3. MetricsReport               — precision, recall, agreement statistics
 *   4. ObservationRegisterReport   — observations grouped by type
 *   5. ExecutiveSummary            — top-level programme view
 *
 * All generators accept an optional `timestamp` parameter for deterministic
 * test assertions. All outputs are frozen plain objects.
 */

import type { BenchmarkRunResult } from "./runner.js";
import type { ComparisonResult } from "./comparison.js";
import type { BenchmarkMetrics } from "./metrics.js";
import type {
  ObservationRegister,
  ObservationType,
  Observation,
} from "./observations.js";
import { OBSERVATION_TYPES } from "./observations.js";

// ---------------------------------------------------------------------------
// 1. BenchmarkExecutionReport
// ---------------------------------------------------------------------------

export interface ExecutionDocumentSummary {
  readonly corpusId: string;
  readonly title: string;
  readonly decision: string | null;
  readonly issueCount: number;
  readonly success: boolean;
  readonly failedAtStage?: string;
}

export interface BenchmarkExecutionReport {
  readonly reportType: "BENCHMARK_EXECUTION";
  readonly generatedAt: string;
  readonly runId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly documentCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly documents: readonly ExecutionDocumentSummary[];
}

export function generateBenchmarkExecutionReport(
  runResult: BenchmarkRunResult,
  timestamp?: string,
): BenchmarkExecutionReport {
  const generatedAt = timestamp ?? new Date().toISOString().slice(0, -1);

  const documents: ExecutionDocumentSummary[] = runResult.records.map((r) => {
    const summary: ExecutionDocumentSummary = r.evaluationResult.ok
      ? Object.freeze({
          corpusId: r.corpusId,
          title: r.corpusDocument.title,
          decision: r.evaluationResult.decision,
          issueCount: r.evaluationResult.issues.length,
          success: true,
        })
      : Object.freeze({
          corpusId: r.corpusId,
          title: r.corpusDocument.title,
          decision: null,
          issueCount: 0,
          success: false,
          failedAtStage: r.evaluationResult.failedAtStage,
        });
    return summary;
  });

  return Object.freeze({
    reportType: "BENCHMARK_EXECUTION" as const,
    generatedAt,
    runId: runResult.runId,
    startedAt: runResult.startedAt,
    completedAt: runResult.completedAt,
    documentCount: runResult.documentCount,
    successCount: runResult.successCount,
    failureCount: runResult.failureCount,
    documents: Object.freeze(documents),
  });
}

// ---------------------------------------------------------------------------
// 2. ComparativeEvaluationReport
// ---------------------------------------------------------------------------

export interface ComparativeDocumentEntry {
  readonly corpusId: string;
  readonly evaluatorDecision: string | null;
  readonly evaluatorIssueClasses: readonly string[];
  readonly reviewerCount: number;
  readonly agreedIssueClasses: readonly string[];
  readonly evaluatorOnlyClasses: readonly string[];
  readonly reviewerOnlyClasses: readonly string[];
  readonly decisionAgreementCount: number;
  readonly decisionDisagreementCount: number;
}

export interface ComparativeEvaluationReport {
  readonly reportType: "COMPARATIVE_EVALUATION";
  readonly generatedAt: string;
  readonly documentCount: number;
  readonly entries: readonly ComparativeDocumentEntry[];
}

export function generateComparativeEvaluationReport(
  comparison: ComparisonResult,
  timestamp?: string,
): ComparativeEvaluationReport {
  const generatedAt = timestamp ?? new Date().toISOString().slice(0, -1);

  const entries: ComparativeDocumentEntry[] = comparison.comparisons.map((c) =>
    Object.freeze({
      corpusId: c.corpusId,
      evaluatorDecision: c.evaluatorDecision,
      evaluatorIssueClasses: c.evaluatorIssueClasses,
      reviewerCount: c.reviewerSubmissions.length,
      agreedIssueClasses: c.agreedIssueClasses,
      evaluatorOnlyClasses: c.evaluatorOnlyClasses,
      reviewerOnlyClasses: c.reviewerOnlyClasses,
      decisionAgreementCount: c.decisionComparisons.filter((d) => d.agreed)
        .length,
      decisionDisagreementCount: c.decisionComparisons.filter((d) => !d.agreed)
        .length,
    }),
  );

  return Object.freeze({
    reportType: "COMPARATIVE_EVALUATION" as const,
    generatedAt,
    documentCount: comparison.documentCount,
    entries: Object.freeze(entries),
  });
}

// ---------------------------------------------------------------------------
// 3. MetricsReport
// ---------------------------------------------------------------------------

export interface MetricsInterpretation {
  readonly recallSummary: string;
  readonly precisionSummary: string;
  readonly decisionAgreementSummary: string;
}

export interface MetricsReport {
  readonly reportType: "METRICS";
  readonly generatedAt: string;
  readonly metrics: BenchmarkMetrics;
  readonly interpretation: MetricsInterpretation;
}

export function generateMetricsReport(
  metrics: BenchmarkMetrics,
  timestamp?: string,
): MetricsReport {
  const generatedAt = timestamp ?? new Date().toISOString().slice(0, -1);
  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

  const interpretation = Object.freeze<MetricsInterpretation>({
    recallSummary:
      `Issue recall: ${pct(metrics.recall)}. ` +
      `The evaluator detected ${metrics.totalAgreedIssues} of ` +
      `${metrics.totalReviewerIssues} reviewer-identified issue class(es).`,
    precisionSummary:
      `Issue precision: ${pct(metrics.precision)}. ` +
      `${metrics.totalAgreedIssues} of ${metrics.totalEvaluatorIssues} ` +
      `evaluator-detected issue class(es) were confirmed by reviewers. ` +
      `False positives: ${metrics.falsePositives}.`,
    decisionAgreementSummary:
      `Decision agreement rate: ${pct(metrics.decisionAgreementRate)}. ` +
      `False negatives: ${metrics.falseNegatives} reviewer-only issue class(es).`,
  });

  return Object.freeze({
    reportType: "METRICS" as const,
    generatedAt,
    metrics,
    interpretation,
  });
}

// ---------------------------------------------------------------------------
// 4. ObservationRegisterReport
// ---------------------------------------------------------------------------

export interface ObservationsByType {
  readonly type: ObservationType;
  readonly count: number;
  readonly observations: readonly Observation[];
}

export interface ObservationRegisterReport {
  readonly reportType: "OBSERVATION_REGISTER";
  readonly generatedAt: string;
  readonly registerId: string;
  readonly totalObservations: number;
  readonly byType: readonly ObservationsByType[];
}

export function generateObservationRegisterReport(
  register: ObservationRegister,
  timestamp?: string,
): ObservationRegisterReport {
  const generatedAt = timestamp ?? new Date().toISOString().slice(0, -1);

  const byType: ObservationsByType[] = OBSERVATION_TYPES.map((type) => {
    const obs = register.observations.filter((o) => o.type === type);
    return Object.freeze({ type, count: obs.length, observations: Object.freeze(obs) });
  });

  return Object.freeze({
    reportType: "OBSERVATION_REGISTER" as const,
    generatedAt,
    registerId: register.registerId,
    totalObservations: register.observations.length,
    byType: Object.freeze(byType),
  });
}

// ---------------------------------------------------------------------------
// 5. ExecutiveSummary
// ---------------------------------------------------------------------------

export interface ExecutiveSummary {
  readonly reportType: "EXECUTIVE_SUMMARY";
  readonly generatedAt: string;
  readonly runId: string;
  readonly documentCount: number;
  readonly evaluatedCount: number;
  readonly decisionDistribution: Readonly<Record<string, number>>;
  readonly recall: number;
  readonly precision: number;
  readonly decisionAgreementRate: number;
  readonly topStrengths: readonly string[];
  readonly topWeaknesses: readonly string[];
  readonly topLimitations: readonly string[];
  readonly overallAssessment: string;
}

export function generateExecutiveSummary(
  runResult: BenchmarkRunResult,
  metrics: BenchmarkMetrics,
  register: ObservationRegister,
  timestamp?: string,
): ExecutiveSummary {
  const generatedAt = timestamp ?? new Date().toISOString().slice(0, -1);

  // Decision distribution across all documents
  const decisionDistribution: Record<string, number> = {
    SUPPORTED: 0,
    REVIEW: 0,
    HOLD: 0,
    FAILURE: 0,
  };
  for (const record of runResult.records) {
    if (record.evaluationResult.ok) {
      const d = record.evaluationResult.decision;
      decisionDistribution[d] = (decisionDistribution[d] ?? 0) + 1;
    } else {
      decisionDistribution["FAILURE"]++;
    }
  }

  const topStrengths = register.observations
    .filter((o) => o.type === "STRENGTH")
    .slice(0, 3)
    .map((o) => o.description);

  const topWeaknesses = register.observations
    .filter((o) => o.type === "WEAKNESS")
    .slice(0, 3)
    .map((o) => o.description);

  const topLimitations = register.observations
    .filter((o) => o.type === "LIMITATION")
    .slice(0, 3)
    .map((o) => o.description);

  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
  const overallAssessment =
    `Benchmark executed ${metrics.documentCount} document(s); ` +
    `${metrics.evaluatedCount} evaluated successfully, ` +
    `${metrics.failureCount} failed. ` +
    `Issue recall: ${pct(metrics.recall)}. ` +
    `Issue precision: ${pct(metrics.precision)}. ` +
    `Evaluator-reviewer decision agreement: ${pct(metrics.decisionAgreementRate)}.`;

  return Object.freeze({
    reportType: "EXECUTIVE_SUMMARY" as const,
    generatedAt,
    runId: runResult.runId,
    documentCount: metrics.documentCount,
    evaluatedCount: metrics.evaluatedCount,
    decisionDistribution: Object.freeze(decisionDistribution),
    recall: metrics.recall,
    precision: metrics.precision,
    decisionAgreementRate: metrics.decisionAgreementRate,
    topStrengths: Object.freeze(topStrengths),
    topWeaknesses: Object.freeze(topWeaknesses),
    topLimitations: Object.freeze(topLimitations),
    overallAssessment,
  });
}
