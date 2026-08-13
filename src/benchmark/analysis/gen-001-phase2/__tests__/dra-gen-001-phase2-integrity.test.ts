import { describe, it, expect } from "vitest";
import { runAllPreconditionChecks } from "../preconditions";
import {
  loadPhase2ResultBundle,
  verifyPhase2ArtefactBinding,
  computePhase2ResultDigest,
} from "../dra-gen-001-phase2-manifest";
import { wilsonInterval, ruleOfThreeUpperBound, computeRateEndpoint } from "../statistics";

describe("DRA-GEN-001 Phase 2 — preconditions", () => {
  it("GC-1, protocol, and sample identities all verify live (STOP would otherwise apply)", () => {
    const report = runAllPreconditionChecks();
    if (!report.allPassed) {
      throw new Error(`Precondition failure: ${report.failedChecks.join(", ")}`);
    }
    expect(report.allPassed).toBe(true);
  });
});

describe("DRA-GEN-001 Phase 2 — result artefact binding", () => {
  it("artefacts are bound to the exact three canonical digests recorded at execution time", () => {
    const verdict = verifyPhase2ArtefactBinding();
    expect(verdict.verdict).toBe("DRA_GEN_001_PHASE2_ARTEFACTS_BOUND");
    for (const c of verdict.checks) expect(c.passed, `${c.id}: ${c.detail ?? ""}`).toBe(true);
  });

  it("the aggregate result digest is deterministic across repeated computation", () => {
    const bundle = loadPhase2ResultBundle();
    const d1 = computePhase2ResultDigest(bundle);
    const d2 = computePhase2ResultDigest(bundle);
    expect(d1).toBe(d2);
    expect(d1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("all 100 locked units are represented in every per-unit artefact (no silent drops)", () => {
    const bundle = loadPhase2ResultBundle();
    expect(bundle.runA).toHaveLength(100);
    expect(bundle.runB).toHaveLength(100);
    expect(bundle.abComparison).toHaveLength(100);
    expect(bundle.proofVerification).toHaveLength(100);
    expect(bundle.failureClassification).toHaveLength(100);
    expect(bundle.fetchVerification).toHaveLength(100);
  });

  it("Run A and Run B were executed against the identical frozen candidate/protocol/sample identity", () => {
    const env = loadPhase2ResultBundle().executionEnvironment;
    expect(env.evaluatorVersion).toBe("0.1.2");
    expect(env.pipelineVersion).toBe("1.0");
    expect(env.modelVersion).toBe("0.1.0");
  });
});

describe("DRA-GEN-001 Phase 2 — proof integrity", () => {
  it("every SUCCESSFUL_EVALUATION unit has an independently re-verified proof receipt", () => {
    const { runA } = loadPhase2ResultBundle();
    const successes = (runA as Array<{ failureCategory: string; proofReceiptIndependentlyVerified: boolean | null }>).filter(
      (r) => r.failureCategory === "SUCCESSFUL_EVALUATION",
    );
    expect(successes.length).toBeGreaterThan(0);
    for (const s of successes) expect(s.proofReceiptIndependentlyVerified).toBe(true);
  });

  it("no PROOF_INTEGRITY_FAILURE or DETERMINISM_FAILURE was classified in this run (measured, not assumed)", () => {
    const { failureClassification } = loadPhase2ResultBundle();
    const categories = new Set(
      (failureClassification as Array<{ taxonomyCategory: string }>).map((c) => c.taxonomyCategory),
    );
    expect(categories.has("PROOF_INTEGRITY_FAILURE")).toBe(false);
    expect(categories.has("DETERMINISM_FAILURE")).toBe(false);
  });
});

describe("DRA-GEN-001 Phase 2 — failure taxonomy application", () => {
  it("every unit is classified under one of the 10 frozen taxonomy categories", () => {
    const validCategories = new Set([
      "EXTERNAL_ACQUISITION_FAILURE",
      "GOVERNANCE_INELIGIBLE",
      "REPRESENTATION_FAILURE",
      "PIPELINE_FAILURE",
      "DETERMINISM_FAILURE",
      "PROOF_INTEGRITY_FAILURE",
      "SEMANTIC_EVALUATOR_FAILURE",
      "KNOWN_LIMITATION_ENCOUNTERED",
      "SUCCESSFUL_EVALUATION",
      "UNCLASSIFIED",
    ]);
    const { failureClassification } = loadPhase2ResultBundle();
    for (const c of failureClassification as Array<{ taxonomyCategory: string }>) {
      expect(validCategories.has(c.taxonomyCategory), c.taxonomyCategory).toBe(true);
    }
  });

  it("exactly the HTML_ENGLISH-stratum source-drift units are EXTERNAL_ACQUISITION_FAILURE, none elsewhere", () => {
    const { failureClassification } = loadPhase2ResultBundle();
    const records = failureClassification as Array<{ stratumId: string; taxonomyCategory: string }>;
    const eaf = records.filter((r) => r.taxonomyCategory === "EXTERNAL_ACQUISITION_FAILURE");
    expect(eaf.every((r) => r.stratumId === "HTML_ENGLISH")).toBe(true);
    expect(eaf).toHaveLength(25);
  });

  it("no UNCLASSIFIED category was used (a documented, deliberate taxonomy mapping was applied instead)", () => {
    const { failureClassification } = loadPhase2ResultBundle();
    const unclassified = (failureClassification as Array<{ taxonomyCategory: string }>).filter(
      (r) => r.taxonomyCategory === "UNCLASSIFIED",
    );
    expect(unclassified).toHaveLength(0);
  });
});

describe("DRA-GEN-001 Phase 2 — statistics module", () => {
  it("wilsonInterval matches a hand-derived reference value (p=0.5, n=100, z=1.959964)", () => {
    // Hand computation: center=(0.5+z^2/200)/(1+z^2/100)=0.5 exactly (symmetric at p=0.5);
    // margin=z*sqrt(0.0025+z^2/40000)/(1+z^2/100)=0.0961869 => bounds 0.5 +/- 0.0961869.
    const w = wilsonInterval(50, 100);
    expect(w.pointEstimate).toBeCloseTo(0.5, 6);
    expect(w.lowerBound).toBeCloseTo(0.40383, 4);
    expect(w.upperBound).toBeCloseTo(0.59617, 4);
    // Symmetry check at p=0.5 is exact regardless of rounding in the reference above.
    expect(w.pointEstimate - w.lowerBound).toBeCloseTo(w.upperBound - w.pointEstimate, 9);
  });

  it("ruleOfThreeUpperBound(100) is 0.03", () => {
    expect(ruleOfThreeUpperBound(100).upperBoundOnTrueRate).toBeCloseTo(0.03, 9);
  });

  it("computeRateEndpoint(0,100) surfaces both the Wilson upper bound and the rule-of-three bound", () => {
    const r = computeRateEndpoint("TEST", 0, 100);
    expect(r.pointEstimate).toBe(0);
    expect(r.ruleOfThreeUpperBoundIfZero).toBeCloseTo(0.03, 9);
    expect(r.wilson.upperBound).toBeGreaterThan(0);
  });
});

describe("DRA-GEN-001 Phase 2 — primary endpoint reproduction", () => {
  it("ACQUISITION_SUCCESS_RATE = 75/100 exactly matches the recorded aggregate statistic", () => {
    const stats = loadPhase2ResultBundle().aggregateStatistics as {
      primaryEndpoints: { ACQUISITION_SUCCESS_RATE: { numerator: number; denominator: number } };
    };
    expect(stats.primaryEndpoints.ACQUISITION_SUCCESS_RATE.numerator).toBe(75);
    expect(stats.primaryEndpoints.ACQUISITION_SUCCESS_RATE.denominator).toBe(100);
  });

  it("MATERIAL_FAILURE_RATE numerator is 0 out of the full locked denominator of 100", () => {
    const stats = loadPhase2ResultBundle().aggregateStatistics as {
      primaryEndpoints: { MATERIAL_FAILURE_RATE: { numerator: number; denominator: number } };
    };
    expect(stats.primaryEndpoints.MATERIAL_FAILURE_RATE.numerator).toBe(0);
    expect(stats.primaryEndpoints.MATERIAL_FAILURE_RATE.denominator).toBe(100);
  });
});
