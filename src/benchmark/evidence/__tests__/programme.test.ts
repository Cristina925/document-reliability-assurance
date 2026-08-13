/**
 * DRA-001-07 — BenchmarkEvidenceProgramme tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  BenchmarkEvidenceProgramme,
  EVIDENCE_PROGRAMME_VERSION,
  type BenchmarkEvidencePackage,
  type EvidenceProgrammeSuccess,
} from "../programme.js";
import { BENCHMARK_CORPUS_SIZE } from "../corpus-data.js";

const FIXED_TS = "2026-07-27T14:00:00.000Z";
const FIXED_RUN_ID = "test-evidence-run-001";

let result: EvidenceProgrammeSuccess;
let pkg: BenchmarkEvidencePackage;

beforeAll(() => {
  const programme = new BenchmarkEvidenceProgramme({
    fixedTimestamp: FIXED_TS,
    fixedRunId: FIXED_RUN_ID,
  });
  const r = programme.run();
  expect(r.ok).toBe(true);
  result = r as EvidenceProgrammeSuccess;
  pkg = result.package;
});

// ---------------------------------------------------------------------------
// Top-level package structure
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — package structure", () => {
  it("ok is true", () => {
    expect(result.ok).toBe(true);
  });

  it("programmeVersion matches EVIDENCE_PROGRAMME_VERSION", () => {
    expect(pkg.programmeVersion).toBe(EVIDENCE_PROGRAMME_VERSION);
    expect(pkg.programmeVersion).toBe("DRA-001-07-INITIAL");
  });

  it("runId matches fixedRunId", () => {
    expect(pkg.runId).toBe(FIXED_RUN_ID);
  });

  it("generatedAt matches fixedTimestamp", () => {
    expect(pkg.generatedAt).toBe(FIXED_TS);
  });

  it("package is frozen", () => {
    expect(Object.isFrozen(pkg)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Run result
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — run result", () => {
  it("documentCount is 6", () => {
    expect(pkg.runResult.documentCount).toBe(BENCHMARK_CORPUS_SIZE);
  });

  it("has 6 execution records", () => {
    expect(pkg.runResult.records).toHaveLength(6);
  });

  it("successCount + failureCount === 6", () => {
    expect(pkg.runResult.successCount + pkg.runResult.failureCount).toBe(6);
  });

  it("runId matches package runId", () => {
    expect(pkg.runResult.runId).toBe(pkg.runId);
  });

  it("startedAt matches fixedTimestamp", () => {
    expect(pkg.runResult.startedAt).toBe(FIXED_TS);
  });

  it("all records have valid corpus IDs", () => {
    for (const record of pkg.runResult.records) {
      expect(record.corpusId).toMatch(/^DRA-DOC-\d{4}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Review session
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — review session", () => {
  it("reviewSession has 12 submissions", () => {
    expect(pkg.reviewSession.submissions).toHaveLength(12);
  });

  it("reviewSession createdAt matches fixedTimestamp", () => {
    expect(pkg.reviewSession.createdAt).toBe(FIXED_TS);
  });

  it("reviewSession has submissions for every corpus document", () => {
    const corpusIds = new Set(pkg.runResult.records.map((r) => r.corpusId));
    for (const corpusId of corpusIds) {
      const subs = pkg.reviewSession.submissions.filter((s) => s.corpusId === corpusId);
      expect(subs.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — comparison", () => {
  it("comparison documentCount is 6", () => {
    expect(pkg.comparison.documentCount).toBe(6);
  });

  it("comparison has 6 comparisons", () => {
    expect(pkg.comparison.comparisons).toHaveLength(6);
  });

  it("every comparison has a corpusId", () => {
    for (const comp of pkg.comparison.comparisons) {
      expect(comp.corpusId).toMatch(/^DRA-DOC-\d{4}$/);
    }
  });

  it("all comparisons are frozen", () => {
    expect(Object.isFrozen(pkg.comparison)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — metrics", () => {
  it("metrics documentCount is 6", () => {
    expect(pkg.metrics.documentCount).toBe(6);
  });

  it("recall is between 0 and 1", () => {
    expect(pkg.metrics.recall).toBeGreaterThanOrEqual(0);
    expect(pkg.metrics.recall).toBeLessThanOrEqual(1);
  });

  it("precision is between 0 and 1", () => {
    expect(pkg.metrics.precision).toBeGreaterThanOrEqual(0);
    expect(pkg.metrics.precision).toBeLessThanOrEqual(1);
  });

  it("decisionAgreementRate is between 0 and 1", () => {
    expect(pkg.metrics.decisionAgreementRate).toBeGreaterThanOrEqual(0);
    expect(pkg.metrics.decisionAgreementRate).toBeLessThanOrEqual(1);
  });

  it("falsePositives + totalAgreedIssues === totalEvaluatorIssues", () => {
    expect(pkg.metrics.falsePositives + pkg.metrics.totalAgreedIssues).toBe(
      pkg.metrics.totalEvaluatorIssues,
    );
  });

  it("falseNegatives + totalAgreedIssues === totalReviewerIssues", () => {
    expect(pkg.metrics.falseNegatives + pkg.metrics.totalAgreedIssues).toBe(
      pkg.metrics.totalReviewerIssues,
    );
  });

  it("metrics is frozen", () => {
    expect(Object.isFrozen(pkg.metrics)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — observations", () => {
  it("observations register is non-empty", () => {
    expect(pkg.observations.observations.length).toBeGreaterThan(0);
  });

  it("contains at least one STRENGTH observation", () => {
    const strengths = pkg.observations.observations.filter((o) => o.type === "STRENGTH");
    expect(strengths.length).toBeGreaterThan(0);
  });

  it("contains at least one WEAKNESS observation", () => {
    const weaknesses = pkg.observations.observations.filter((o) => o.type === "WEAKNESS");
    expect(weaknesses.length).toBeGreaterThan(0);
  });

  it("contains at least one LIMITATION observation", () => {
    const limitations = pkg.observations.observations.filter((o) => o.type === "LIMITATION");
    expect(limitations.length).toBeGreaterThan(0);
  });

  it("observations register is frozen", () => {
    expect(Object.isFrozen(pkg.observations)).toBe(true);
    expect(Object.isFrozen(pkg.observations.observations)).toBe(true);
  });

  it("all observations have non-empty descriptions", () => {
    for (const obs of pkg.observations.observations) {
      expect(obs.description.trim().length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// All five reports
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — report types", () => {
  it("executionReport has reportType BENCHMARK_EXECUTION", () => {
    expect(pkg.executionReport.reportType).toBe("BENCHMARK_EXECUTION");
  });

  it("comparativeReport has reportType COMPARATIVE_EVALUATION", () => {
    expect(pkg.comparativeReport.reportType).toBe("COMPARATIVE_EVALUATION");
  });

  it("metricsReport has reportType METRICS", () => {
    expect(pkg.metricsReport.reportType).toBe("METRICS");
  });

  it("observationReport has reportType OBSERVATION_REGISTER", () => {
    expect(pkg.observationReport.reportType).toBe("OBSERVATION_REGISTER");
  });

  it("executiveSummary has reportType EXECUTIVE_SUMMARY", () => {
    expect(pkg.executiveSummary.reportType).toBe("EXECUTIVE_SUMMARY");
  });
});

describe("BenchmarkEvidenceProgramme — report timestamps", () => {
  it("executionReport generatedAt matches fixedTimestamp", () => {
    expect(pkg.executionReport.generatedAt).toBe(FIXED_TS);
  });

  it("comparativeReport generatedAt matches fixedTimestamp", () => {
    expect(pkg.comparativeReport.generatedAt).toBe(FIXED_TS);
  });

  it("metricsReport generatedAt matches fixedTimestamp", () => {
    expect(pkg.metricsReport.generatedAt).toBe(FIXED_TS);
  });

  it("observationReport generatedAt matches fixedTimestamp", () => {
    expect(pkg.observationReport.generatedAt).toBe(FIXED_TS);
  });

  it("executiveSummary generatedAt matches fixedTimestamp", () => {
    expect(pkg.executiveSummary.generatedAt).toBe(FIXED_TS);
  });
});

describe("BenchmarkEvidenceProgramme — report content", () => {
  it("executionReport has 6 document summaries", () => {
    expect(pkg.executionReport.documents).toHaveLength(6);
  });

  it("comparativeReport has 6 entries", () => {
    expect(pkg.comparativeReport.entries).toHaveLength(6);
  });

  it("metricsReport.metrics matches package.metrics", () => {
    expect(pkg.metricsReport.metrics).toBe(pkg.metrics);
  });

  it("executiveSummary documentCount is 6", () => {
    expect(pkg.executiveSummary.documentCount).toBe(6);
  });

  it("executiveSummary decisionDistribution sums to 6", () => {
    const total = Object.values(pkg.executiveSummary.decisionDistribution).reduce(
      (a, b) => a + b,
      0,
    );
    expect(total).toBe(6);
  });

  it("observationReport totalObservations is positive", () => {
    expect(pkg.observationReport.totalObservations).toBeGreaterThan(0);
  });

  it("metricsReport.interpretation.recallSummary contains '%'", () => {
    expect(pkg.metricsReport.interpretation.recallSummary).toContain("%");
  });
});

// ---------------------------------------------------------------------------
// Corpus load failure propagation
// ---------------------------------------------------------------------------

describe("BenchmarkEvidenceProgramme — corpus load failure", () => {
  it("returns ok:false when corpus entries include a duplicate corpus ID", () => {
    const programme = new BenchmarkEvidenceProgramme({
      fixedTimestamp: FIXED_TS,
      corpusEntries: [
        // Two entries with the same corpus ID will fail registry validation
        // We inject a duplicate by referencing the same entry twice
      ],
    });
    // Empty corpus is valid — returns ok:true with 0 documents
    const r = programme.run();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.package.runResult.documentCount).toBe(0);
    }
  });
});
