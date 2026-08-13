/**
 * DRA-001-06 — Benchmark Execution Module Public Surface
 *
 * Exports:
 *   runner        — BenchmarkRunner, BenchmarkExecutionDocument, BenchmarkRunResult
 *   human-review  — HumanReviewSession, ReviewerSubmission, ReviewIssueSubmission
 *   comparison    — compareResults, ComparisonResult, DocumentComparison
 *   metrics       — computeMetrics, BenchmarkMetrics
 *   observations  — ObservationRegister, addObservation, Observation
 *   reports       — five report generators and their types
 */

export * from "./runner.js";
export * from "./human-review.js";
export * from "./comparison.js";
export * from "./metrics.js";
export * from "./observations.js";
export * from "./reports.js";
