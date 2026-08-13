/**
 * DRA-001-06 — Report generator tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkRunResult } from "../runner.js";
import { createReviewSession, addSubmission } from "../human-review.js";
import type { HumanReviewSession } from "../human-review.js";
import { compareResults } from "../comparison.js";
import type { ComparisonResult } from "../comparison.js";
import { computeMetrics } from "../metrics.js";
import type { BenchmarkMetrics } from "../metrics.js";
import {
  createObservationRegister,
  addObservation,
} from "../observations.js";
import type { ObservationRegister } from "../observations.js";
import {
  generateBenchmarkExecutionReport,
  generateComparativeEvaluationReport,
  generateMetricsReport,
  generateObservationRegisterReport,
  generateExecutiveSummary,
} from "../reports.js";
import {
  FIXED_TS,
  FIXED_RUN_ID,
  FIXED_SESSION_ID,
  FIXED_REGISTER_ID,
  ALL_EXEC_DOCS,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

const REPORT_TS = "2026-07-27T13:00:00.000";
let runResult: BenchmarkRunResult;
let session: HumanReviewSession;
let comparison: ComparisonResult;
let metrics: BenchmarkMetrics;
let register: ObservationRegister;

beforeAll(() => {
  const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
  runResult = runner.execute(ALL_EXEC_DOCS);

  session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
  // Add a submission for the first document
  const firstRecord = runResult.records[0]!;
  if (firstRecord.evaluationResult.ok) {
    session = addSubmission(session, {
      reviewerId: "reviewer-1",
      corpusId: firstRecord.corpusId,
      submittedAt: FIXED_TS,
      issues: [],
      recommendation: firstRecord.evaluationResult.decision,
      confidence: "HIGH",
      notes: "Clear document.",
    });
  }

  comparison = compareResults(runResult, session);
  metrics = computeMetrics(runResult, comparison);

  register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
  register = addObservation(register, {
    observationId: "obs-1",
    type: "STRENGTH",
    description: "Evaluator correctly identified ISO standard references.",
    recordedAt: FIXED_TS,
  });
  register = addObservation(register, {
    observationId: "obs-2",
    type: "WEAKNESS",
    description: "Evaluator struggled with implicit authority references.",
    recordedAt: FIXED_TS,
  });
  register = addObservation(register, {
    observationId: "obs-3",
    type: "LIMITATION",
    description: "Benchmark corpus is limited to three documents.",
    recordedAt: FIXED_TS,
  });
});

// ---------------------------------------------------------------------------
// 1. BenchmarkExecutionReport
// ---------------------------------------------------------------------------

describe("generateBenchmarkExecutionReport", () => {
  it("has reportType BENCHMARK_EXECUTION", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(report.reportType).toBe("BENCHMARK_EXECUTION");
  });

  it("uses provided timestamp", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(report.generatedAt).toBe(REPORT_TS);
  });

  it("runId matches run result", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(report.runId).toBe(FIXED_RUN_ID);
  });

  it("document count matches run", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(report.documentCount).toBe(3);
  });

  it("documents array has one entry per record", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(report.documents).toHaveLength(3);
  });

  it("each document entry has corpusId and title", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    for (const doc of report.documents) {
      expect(typeof doc.corpusId).toBe("string");
      expect(doc.corpusId.length).toBeGreaterThan(0);
      expect(typeof doc.title).toBe("string");
    }
  });

  it("successful documents have a non-null decision", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    for (const doc of report.documents) {
      if (doc.success) {
        expect(doc.decision).not.toBeNull();
        expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(doc.decision);
      }
    }
  });

  it("is frozen", () => {
    const report = generateBenchmarkExecutionReport(runResult, REPORT_TS);
    expect(Object.isFrozen(report)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. ComparativeEvaluationReport
// ---------------------------------------------------------------------------

describe("generateComparativeEvaluationReport", () => {
  it("has reportType COMPARATIVE_EVALUATION", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    expect(report.reportType).toBe("COMPARATIVE_EVALUATION");
  });

  it("uses provided timestamp", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    expect(report.generatedAt).toBe(REPORT_TS);
  });

  it("entries count matches comparison documentCount", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    expect(report.entries).toHaveLength(comparison.documentCount);
  });

  it("each entry has corpusId and reviewerCount", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    for (const entry of report.entries) {
      expect(typeof entry.corpusId).toBe("string");
      expect(typeof entry.reviewerCount).toBe("number");
    }
  });

  it("decisionAgreementCount + decisionDisagreementCount = reviewerCount (for successful docs)", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    for (const entry of report.entries) {
      if (entry.evaluatorDecision !== null) {
        expect(entry.decisionAgreementCount + entry.decisionDisagreementCount).toBe(
          entry.reviewerCount,
        );
      }
    }
  });

  it("is frozen", () => {
    const report = generateComparativeEvaluationReport(comparison, REPORT_TS);
    expect(Object.isFrozen(report)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. MetricsReport
// ---------------------------------------------------------------------------

describe("generateMetricsReport", () => {
  it("has reportType METRICS", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(report.reportType).toBe("METRICS");
  });

  it("uses provided timestamp", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(report.generatedAt).toBe(REPORT_TS);
  });

  it("metrics matches the provided BenchmarkMetrics", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(report.metrics).toBe(metrics);
  });

  it("interpretation includes recall, precision, and decision agreement summaries", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(report.interpretation.recallSummary).toContain("recall");
    expect(report.interpretation.precisionSummary).toContain("precision");
    expect(report.interpretation.decisionAgreementSummary).toContain("agreement");
  });

  it("interpretation strings include percentage values", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(report.interpretation.recallSummary).toMatch(/\d+\.\d+%/);
    expect(report.interpretation.precisionSummary).toMatch(/\d+\.\d+%/);
  });

  it("is frozen", () => {
    const report = generateMetricsReport(metrics, REPORT_TS);
    expect(Object.isFrozen(report)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. ObservationRegisterReport
// ---------------------------------------------------------------------------

describe("generateObservationRegisterReport", () => {
  it("has reportType OBSERVATION_REGISTER", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(report.reportType).toBe("OBSERVATION_REGISTER");
  });

  it("uses provided timestamp", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(report.generatedAt).toBe(REPORT_TS);
  });

  it("registerId matches the register", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(report.registerId).toBe(FIXED_REGISTER_ID);
  });

  it("totalObservations is 3", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(report.totalObservations).toBe(3);
  });

  it("byType contains all five types", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(report.byType).toHaveLength(5);
    const types = report.byType.map((b) => b.type);
    expect(types).toContain("STRENGTH");
    expect(types).toContain("WEAKNESS");
    expect(types).toContain("LIMITATION");
  });

  it("STRENGTH group has count 1", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    const strengths = report.byType.find((b) => b.type === "STRENGTH")!;
    expect(strengths.count).toBe(1);
    expect(strengths.observations).toHaveLength(1);
  });

  it("is frozen", () => {
    const report = generateObservationRegisterReport(register, REPORT_TS);
    expect(Object.isFrozen(report)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. ExecutiveSummary
// ---------------------------------------------------------------------------

describe("generateExecutiveSummary", () => {
  it("has reportType EXECUTIVE_SUMMARY", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.reportType).toBe("EXECUTIVE_SUMMARY");
  });

  it("uses provided timestamp", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.generatedAt).toBe(REPORT_TS);
  });

  it("runId matches run result", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.runId).toBe(FIXED_RUN_ID);
  });

  it("documentCount is 3", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.documentCount).toBe(3);
  });

  it("decisionDistribution sums to documentCount", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    const total = Object.values(report.decisionDistribution).reduce((a, b) => a + b, 0);
    expect(total).toBe(report.documentCount);
  });

  it("topStrengths comes from the observation register", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.topStrengths.length).toBeGreaterThanOrEqual(1);
    expect(report.topStrengths[0]).toContain("ISO standard");
  });

  it("overallAssessment mentions document count and rates", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.overallAssessment).toContain("3");
    expect(report.overallAssessment).toContain("%");
  });

  it("recall and precision match metrics", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(report.recall).toBe(metrics.recall);
    expect(report.precision).toBe(metrics.precision);
  });

  it("is frozen", () => {
    const report = generateExecutiveSummary(runResult, metrics, register, REPORT_TS);
    expect(Object.isFrozen(report)).toBe(true);
  });
});
