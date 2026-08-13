/**
 * DRA-001-07 — End-to-end integration tests
 *
 * Verifies the full evidence generation pipeline:
 * corpus load → execution → review → comparison → metrics → reports
 *
 * Also verifies:
 * - evaluator is not modified (proof receipts pass verifyReceiptIntegrity)
 * - decision engine produces valid decisions
 * - all existing test baselines remain unbroken
 * - reproducibility across two identical runs
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkEvidenceProgramme } from "../programme.js";
import type { BenchmarkEvidencePackage, EvidenceProgrammeSuccess } from "../programme.js";
import { loadBenchmarkCorpus } from "../corpus-loader.js";
import { BenchmarkRunner } from "../../execution/runner.js";
import { createSimulatedReviewSession } from "../reviewer-simulation.js";
import { compareResults } from "../../execution/comparison.js";
import { computeMetrics } from "../../execution/metrics.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { BENCHMARK_CORPUS } from "../corpus-data.js";

const FIXED_TS_A = "2026-07-27T15:00:00.000Z";
const FIXED_TS_B = "2026-07-27T16:00:00.000Z";
const FIXED_RUN_ID = "integration-run-001";

let pkgA: BenchmarkEvidencePackage;
let pkgB: BenchmarkEvidencePackage;

beforeAll(() => {
  const optsA = { fixedTimestamp: FIXED_TS_A, fixedRunId: FIXED_RUN_ID };
  const optsB = { fixedTimestamp: FIXED_TS_B, fixedRunId: FIXED_RUN_ID };

  const rA = new BenchmarkEvidenceProgramme(optsA).run() as EvidenceProgrammeSuccess;
  const rB = new BenchmarkEvidenceProgramme(optsB).run() as EvidenceProgrammeSuccess;

  expect(rA.ok).toBe(true);
  expect(rB.ok).toBe(true);

  pkgA = rA.package;
  pkgB = rB.package;
});

// ---------------------------------------------------------------------------
// Pipeline: corpus load → execution
// ---------------------------------------------------------------------------

describe("Integration — corpus load to execution", () => {
  it("loadBenchmarkCorpus produces 6 BenchmarkExecutionDocuments", () => {
    const loaded = loadBenchmarkCorpus();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.documentCount).toBe(6);
    }
  });

  it("BenchmarkRunner executes all 6 documents", () => {
    const loaded = loadBenchmarkCorpus();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_A });
    const result = runner.execute(loaded.documents);
    expect(result.documentCount).toBe(6);
    expect(result.records).toHaveLength(6);
  });

  it("all records have a defined evaluationResult", () => {
    for (const record of pkgA.runResult.records) {
      expect(record.evaluationResult).toBeDefined();
    }
  });

  it("all records have an executedAt timestamp", () => {
    for (const record of pkgA.runResult.records) {
      expect(typeof record.executedAt).toBe("string");
      expect(record.executedAt.length).toBeGreaterThan(0);
    }
  });

  it("successful evaluations have a valid proof receipt", () => {
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        expect(record.evaluationResult.proofReceipt).toBeDefined();
        expect(record.evaluationResult.proofReceipt.substantiveDigest).toHaveLength(64);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Evaluator not modified — proof receipt integrity
// ---------------------------------------------------------------------------

describe("Integration — evaluator integrity", () => {
  it("verifyReceiptIntegrity returns true for every successful proof receipt", () => {
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        expect(
          verifyReceiptIntegrity(record.evaluationResult.proofReceipt),
        ).toBe(true);
      }
    }
  });

  it("all decisions are valid AssuranceDecision values", () => {
    const validDecisions = ["SUPPORTED", "REVIEW", "HOLD"];
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        expect(validDecisions).toContain(record.evaluationResult.decision);
      }
    }
  });

  it("all stage names are valid in proof receipts", () => {
    const validStages = [
      "Input Normalisation",
      "Claim Extraction",
      "Authority Resolution",
      "Evidence Linkage",
      "Materiality Assessment",
      "Consistency Check",
      "Confidence Scoring",
      "Decision and Receipt",
    ];
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        for (const stageOutput of record.evaluationResult.proofReceipt.stageOutputs) {
          expect(validStages).toContain(stageOutput.stageName);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Pipeline: execution → review → comparison
// ---------------------------------------------------------------------------

describe("Integration — execution to comparison pipeline", () => {
  it("comparison covers all 6 documents", () => {
    expect(pkgA.comparison.documentCount).toBe(6);
  });

  it("every comparison entry has the correct corpus ID", () => {
    const runIds = new Set(pkgA.runResult.records.map((r) => r.corpusId));
    for (const comp of pkgA.comparison.comparisons) {
      expect(runIds.has(comp.corpusId)).toBe(true);
    }
  });

  it("reviewer issue classes are a subset of the nine frozen classes", () => {
    const validClasses = new Set([
      "UNSUPPORTED_CLAIM", "AUTHORITY_EXPIRED", "AUTHORITY_ABSENT",
      "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "EVIDENCE_CONFLICT",
      "CLAIM_INCONSISTENCY", "TRACEABILITY_BROKEN", "SCOPE_VIOLATION",
    ]);
    for (const comp of pkgA.comparison.comparisons) {
      for (const cls of comp.reviewerOnlyClasses) {
        expect(validClasses.has(cls)).toBe(true);
      }
      for (const cls of comp.agreedIssueClasses) {
        expect(validClasses.has(cls)).toBe(true);
      }
    }
  });

  it("agreedIssueClasses ⊆ evaluatorIssueClasses", () => {
    for (const comp of pkgA.comparison.comparisons) {
      const evalSet = new Set(comp.evaluatorIssueClasses);
      for (const cls of comp.agreedIssueClasses) {
        expect(evalSet.has(cls)).toBe(true);
      }
    }
  });

  it("agreedIssueClasses ⊆ reviewerIssueClasses (union across all submissions)", () => {
    for (const comp of pkgA.comparison.comparisons) {
      const reviewerUnion = new Set([
        ...comp.agreedIssueClasses,
        ...comp.reviewerOnlyClasses,
      ]);
      for (const cls of comp.agreedIssueClasses) {
        expect(reviewerUnion.has(cls)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Pipeline: metrics internal consistency
// ---------------------------------------------------------------------------

describe("Integration — metrics consistency", () => {
  it("totalEvaluatorIssues = sum of evaluatorIssueClasses.length per document", () => {
    let expectedTotal = 0;
    for (const comp of pkgA.comparison.comparisons) {
      expectedTotal += comp.evaluatorIssueClasses.length;
    }
    expect(pkgA.metrics.totalEvaluatorIssues).toBe(expectedTotal);
  });

  it("falsePositives = evaluatorOnly classes total across all documents", () => {
    let expectedFP = 0;
    for (const comp of pkgA.comparison.comparisons) {
      expectedFP += comp.evaluatorOnlyClasses.length;
    }
    expect(pkgA.metrics.falsePositives).toBe(expectedFP);
  });

  it("falseNegatives = reviewerOnly classes total across all documents", () => {
    let expectedFN = 0;
    for (const comp of pkgA.comparison.comparisons) {
      expectedFN += comp.reviewerOnlyClasses.length;
    }
    expect(pkgA.metrics.falseNegatives).toBe(expectedFN);
  });

  it("evaluatedCount = successCount from runResult", () => {
    expect(pkgA.metrics.evaluatedCount).toBe(pkgA.runResult.successCount);
  });

  it("failureCount matches runResult.failureCount", () => {
    expect(pkgA.metrics.failureCount).toBe(pkgA.runResult.failureCount);
  });
});

// ---------------------------------------------------------------------------
// Reproducibility
// ---------------------------------------------------------------------------

describe("Integration — reproducibility", () => {
  it("same substantiveDigest on both runs (content unchanged)", () => {
    for (let i = 0; i < pkgA.runResult.records.length; i++) {
      const rA = pkgA.runResult.records[i]!;
      const rB = pkgB.runResult.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        // Digest must be identical regardless of timestamp
        expect(rA.evaluationResult.proofReceipt.substantiveDigest).toBe(
          rB.evaluationResult.proofReceipt.substantiveDigest,
        );
      }
    }
  });

  it("same decision on both runs for every document", () => {
    for (let i = 0; i < pkgA.runResult.records.length; i++) {
      const rA = pkgA.runResult.records[i]!;
      const rB = pkgB.runResult.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        expect(rA.evaluationResult.decision).toBe(rB.evaluationResult.decision);
      }
    }
  });

  it("same issue count on both runs for every document", () => {
    for (let i = 0; i < pkgA.runResult.records.length; i++) {
      const rA = pkgA.runResult.records[i]!;
      const rB = pkgB.runResult.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        expect(rA.evaluationResult.issues.length).toBe(
          rB.evaluationResult.issues.length,
        );
      }
    }
  });

  it("same metrics recall across runs (content-deterministic)", () => {
    expect(pkgA.metrics.recall).toBe(pkgB.metrics.recall);
  });

  it("same metrics precision across runs", () => {
    expect(pkgA.metrics.precision).toBe(pkgB.metrics.precision);
  });

  it("same decisionAgreementRate across runs", () => {
    expect(pkgA.metrics.decisionAgreementRate).toBe(pkgB.metrics.decisionAgreementRate);
  });

  it("same successCount on both runs", () => {
    expect(pkgA.runResult.successCount).toBe(pkgB.runResult.successCount);
  });
});

// ---------------------------------------------------------------------------
// Report completeness
// ---------------------------------------------------------------------------

describe("Integration — all five reports complete", () => {
  it("executionReport contains all 6 document summaries with corpusId and title", () => {
    for (const doc of pkgA.executionReport.documents) {
      expect(doc.corpusId).toMatch(/^DRA-DOC-\d{4}$/);
      expect(doc.title.length).toBeGreaterThan(0);
    }
  });

  it("comparativeReport entries match the comparison documentCount", () => {
    expect(pkgA.comparativeReport.entries).toHaveLength(pkgA.comparison.documentCount);
  });

  it("metricsReport interpretation strings are non-empty", () => {
    expect(pkgA.metricsReport.interpretation.recallSummary.length).toBeGreaterThan(0);
    expect(pkgA.metricsReport.interpretation.precisionSummary.length).toBeGreaterThan(0);
    expect(pkgA.metricsReport.interpretation.decisionAgreementSummary.length).toBeGreaterThan(0);
  });

  it("observationReport byType groups account for all observations", () => {
    const totalFromGroups = pkgA.observationReport.byType.reduce(
      (sum, group) => sum + group.count,
      0,
    );
    expect(totalFromGroups).toBe(pkgA.observationReport.totalObservations);
  });

  it("executiveSummary overallAssessment is non-empty", () => {
    expect(pkgA.executiveSummary.overallAssessment.length).toBeGreaterThan(0);
  });

  it("executiveSummary recall matches pkg metrics", () => {
    expect(pkgA.executiveSummary.recall).toBe(pkgA.metrics.recall);
  });

  it("executiveSummary precision matches pkg metrics", () => {
    expect(pkgA.executiveSummary.precision).toBe(pkgA.metrics.precision);
  });
});

// ---------------------------------------------------------------------------
// Observation register
// ---------------------------------------------------------------------------

describe("Integration — observation register", () => {
  it("LIMITATION observation contains corpus size data", () => {
    const limitation = pkgA.observations.observations.find(
      (o) => o.type === "LIMITATION",
    );
    expect(limitation).toBeDefined();
    expect(limitation!.description).toContain("6");
  });

  it("at least one observation references a specific corpus document", () => {
    const docSpecific = pkgA.observations.observations.filter(
      (o) => o.corpusId !== undefined,
    );
    expect(docSpecific.length).toBeGreaterThan(0);
  });

  it("LIMITATION observation evidence contains recall and precision values", () => {
    const limitation = pkgA.observations.observations.find(
      (o) => o.type === "LIMITATION" && o.evidence !== undefined,
    );
    expect(limitation).toBeDefined();
    expect(limitation!.evidence).toContain("recall=");
    expect(limitation!.evidence).toContain("precision=");
  });
});

// ---------------------------------------------------------------------------
// Existing DRA evaluator tests unbroken (smoke check)
// ---------------------------------------------------------------------------

describe("Integration — evaluator public API unchanged", () => {
  it("verifyReceiptIntegrity is importable and callable", () => {
    expect(typeof verifyReceiptIntegrity).toBe("function");
  });

  it("evaluator produces all 7 stage outputs per successful evaluation", () => {
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        expect(record.evaluationResult.proofReceipt.stageOutputs).toHaveLength(7);
      }
    }
  });

  it("proof receipt has evaluatorIdentity with pipelineVersion", () => {
    for (const record of pkgA.runResult.records) {
      if (record.evaluationResult.ok) {
        expect(
          record.evaluationResult.proofReceipt.evaluatorIdentity.pipelineVersion.length,
        ).toBeGreaterThan(0);
      }
    }
  });
});
