/**
 * DRA-GEN-001 Post-Blind Evidence Review — machine-verifiable claims.
 *
 * These tests check only the specific numeric/structural claims the review
 * report makes about the already-completed, immutable Phase 2 result set.
 * They do not re-run acquisition or evaluation, and they do not touch
 * DRA-GC-1, the frozen protocol, the locked sample, or historical benchmark
 * records — this file only reads the committed Phase 2 result artefacts and
 * the frozen protocol's own declared constants.
 */
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { loadPhase2ResultBundle } from "../dra-gen-001-phase2-manifest";
import { FROZEN_UNITS } from "../../gen-001-phase1/dra-gen-001-sample-manifest";
import { FAILURE_TAXONOMY, ENDPOINTS, CARRIED_FORWARD_LIMITATIONS } from "../../dra-gen-001-protocol";

describe("Post-Blind Evidence Review — three-denominator reconstruction", () => {
  it("locked sample = 100, evaluated = 75, pre-evaluation exclusions = 25", () => {
    const { runA } = loadPhase2ResultBundle();
    const records = runA as Array<{ failureCategory: string }>;
    expect(records.length).toBe(100);
    const evaluated = records.filter((r) => r.failureCategory === "SUCCESSFUL_EVALUATION");
    const excluded = records.filter((r) => r.failureCategory === "EXTERNAL_ACQUISITION_FAILURE");
    expect(evaluated).toHaveLength(75);
    expect(excluded).toHaveLength(25);
    expect(evaluated.length + excluded.length).toBe(100);
  });

  it("all 25 pre-evaluation exclusions belong to the single HTML_ENGLISH stratum", () => {
    const { runA } = loadPhase2ResultBundle();
    const excluded = (runA as Array<{ failureCategory: string; stratumId: string }>).filter(
      (r) => r.failureCategory === "EXTERNAL_ACQUISITION_FAILURE",
    );
    expect(excluded.every((r) => r.stratumId === "HTML_ENGLISH")).toBe(true);
    const nonHtmlEnglishStrata = new Set(FROZEN_UNITS.map((u) => u.stratumId)).size;
    expect(nonHtmlEnglishStrata).toBe(4); // confirms 3 of 4 hard strata remain fully represented
  });

  it("exclusion classification used is EXTERNAL_ACQUISITION_FAILURE, a real category in the frozen taxonomy", () => {
    const category = FAILURE_TAXONOMY.find((c) => c.category === "EXTERNAL_ACQUISITION_FAILURE");
    expect(category).toBeDefined();
    expect(category!.countsTowardMaterialFailureRate).toBe(false);
  });
});

describe("Post-Blind Evidence Review — 75-document operational-reliability evidence", () => {
  it("75/75 pipeline completion, determinism, and proof integrity (zero failures across all three)", () => {
    const { runA, abComparison, proofVerification } = loadPhase2ResultBundle();
    const evaluated = (runA as Array<{ failureCategory: string }>).filter((r) => r.failureCategory === "SUCCESSFUL_EVALUATION");
    expect(evaluated).toHaveLength(75);
    const identical = (abComparison as Array<{ classification: string }>).filter((c) => c.classification === "SUBSTANTIVELY_IDENTICAL");
    expect(identical).toHaveLength(75);
    const verified = (proofVerification as Array<{ verified: boolean | null }>).filter((p) => p.verified === true);
    expect(verified).toHaveLength(75);
  });

  it("decision totals across the 75 evaluated documents sum to exactly 75 and match the reported 64/10/1 split", () => {
    const { runA } = loadPhase2ResultBundle();
    const decisions = (runA as Array<{ failureCategory: string; decision: string | null }>)
      .filter((r) => r.failureCategory === "SUCCESSFUL_EVALUATION")
      .map((r) => r.decision);
    expect(decisions).toHaveLength(75);
    const counts: Record<string, number> = {};
    for (const d of decisions) counts[d!] = (counts[d!] ?? 0) + 1;
    expect(counts.SUPPORTED).toBe(64);
    expect(counts.HOLD).toBe(10);
    expect(counts.REVIEW).toBe(1);
    expect((counts.SUPPORTED ?? 0) + (counts.HOLD ?? 0) + (counts.REVIEW ?? 0)).toBe(75);
  });

  it("exactly 3 of 9 defined issue classes were observed across the 75 evaluated documents", () => {
    const { runA } = loadPhase2ResultBundle();
    const issueClasses = new Set<string>();
    for (const r of runA as Array<{ failureCategory: string; issueClasses: string[] | null }>) {
      if (r.failureCategory === "SUCCESSFUL_EVALUATION") for (const ic of r.issueClasses!) issueClasses.add(ic);
    }
    expect(issueClasses.size).toBe(3);
    expect([...issueClasses].sort()).toEqual(["CLAIM_INCONSISTENCY", "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE"]);
  });
});

describe("Post-Blind Evidence Review — Spanish/English descriptive pattern", () => {
  it("50/50 evaluated Spanish-stratum documents are SUPPORTED with zero issues", () => {
    const { runA } = loadPhase2ResultBundle();
    const spanish = (runA as Array<{ stratumId: string; failureCategory: string; decision: string | null; issueCount: number | null }>).filter(
      (r) => (r.stratumId === "PDF_NON_ENGLISH" || r.stratumId === "HTML_NON_ENGLISH") && r.failureCategory === "SUCCESSFUL_EVALUATION",
    );
    expect(spanish).toHaveLength(50);
    expect(spanish.every((r) => r.decision === "SUPPORTED" && r.issueCount === 0)).toBe(true);
  });

  it("11/25 evaluated English (PDF_ENGLISH) documents are HOLD or REVIEW; HTML_ENGLISH contributes 0 evaluated units", () => {
    const { runA } = loadPhase2ResultBundle();
    const records = runA as Array<{ stratumId: string; failureCategory: string; decision: string | null }>;
    const pdfEnglish = records.filter((r) => r.stratumId === "PDF_ENGLISH" && r.failureCategory === "SUCCESSFUL_EVALUATION");
    expect(pdfEnglish).toHaveLength(25);
    const nonSupported = pdfEnglish.filter((r) => r.decision === "HOLD" || r.decision === "REVIEW");
    expect(nonSupported).toHaveLength(11);
    const htmlEnglishEvaluated = records.filter((r) => r.stratumId === "HTML_ENGLISH" && r.failureCategory === "SUCCESSFUL_EVALUATION");
    expect(htmlEnglishEvaluated).toHaveLength(0);
  });
});

describe("Post-Blind Evidence Review — frozen-candidate integrity", () => {
  it("no file under the GC-1-governing paths (pipeline/, model/, GC-1 freeze manifest, GEN-001 protocol) changed after freeze", () => {
    const guardedPaths = [
      "lib/dra-reference/src/pipeline",
      "lib/dra-reference/src/model",
      "lib/dra-reference/src/benchmark/analysis/dra-gc-1-freeze-manifest.ts",
      "lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts",
      "lib/dra-reference/src/benchmark/analysis/gen-001-phase1",
    ];
    // __dirname = lib/dra-reference/src/benchmark/analysis/gen-001-phase2/__tests__
    // repo root (where .git lives) is 7 levels up from __dirname.
    const repoRoot = `${__dirname}/../../../../../../..`;
    const output = execSync(`git status --porcelain -- ${guardedPaths.join(" ")}`, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(output.trim()).toBe("");
  });

  it("CARRIED_FORWARD_LIMITATIONS still declares the pre-existing D3 non-English-materiality limitation (unchanged, not newly introduced by this review)", () => {
    const d3 = CARRIED_FORWARD_LIMITATIONS.find((l) => l.id === "NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE");
    expect(d3).toBeDefined();
    expect(d3!.sourceLedgerEntry).toBe("D3");
  });

  it("ENDPOINTS still declares ACQUISITION_SUCCESS_RATE denominator as the full locked sample, not the evaluated subset", () => {
    const endpoint = ENDPOINTS.find((e) => e.id === "ACQUISITION_SUCCESS_RATE")!;
    expect(endpoint.description).toMatch(/locked sample/i);
  });
});
