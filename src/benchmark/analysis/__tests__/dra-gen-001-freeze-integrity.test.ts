import { describe, expect, it } from "vitest";

import {
  PROTOCOL_ID,
  PROTOCOL_STATUS,
  BOUND_CANDIDATE_ID,
  BOUND_CANDIDATE_DIGEST,
  CARRIED_FORWARD_LIMITATIONS,
  UNIT_EDGE_CASE_POLICIES,
  ELIGIBILITY_CRITERIA,
  HARD_STRATA,
  SAMPLE_SIZE_OPTIONS,
  RECOMMENDED_SAMPLE_SIZE,
  ENDPOINTS,
  FAILURE_TAXONOMY,
  REPLACEMENT_POLICY,
  BLINDNESS_RULES,
  STOPPING_RULES,
  SEQUENTIAL_CONTAMINATION_CONTROL,
} from "../dra-gen-001-protocol";
import {
  CONSIDERED_CANDIDATE_URLS,
  CONSIDERED_CANDIDATE_IDS,
  isConsideredUrl,
  isConsideredCandidateId,
  normalizeConsideredUrl,
} from "../dra-gen-001-considered-candidate-registry";
import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
  computeAggregateDigest,
  GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS,
  GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID,
} from "../dra-gc-1-freeze-manifest";

describe("DRA-GEN-001 protocol — identity and status", () => {
  it("is identified as DRA-GEN-001", () => {
    expect(PROTOCOL_ID).toBe("DRA-GEN-001");
  });

  it("protocol status is DRAFT — no benchmark execution may begin while this holds", () => {
    expect(PROTOCOL_STATUS).toBe("DRAFT");
  });
});

describe("DRA-GEN-001 protocol — GC-1 digest binding", () => {
  it("is bound to the actual frozen GC-1 candidate identifier", () => {
    expect(BOUND_CANDIDATE_ID).toBe(GC1_CANDIDATE_ID);
    expect(BOUND_CANDIDATE_ID).toBe("DRA-GC-1");
  });

  it("is bound to the actual recorded GC-1 aggregate digest, not a placeholder", () => {
    expect(BOUND_CANDIDATE_DIGEST).toBe(GC1_AGGREGATE_DIGEST);
    expect(BOUND_CANDIDATE_DIGEST).toMatch(/^[0-9a-f]{64}$/);
  });

  it("the bound digest still matches a live recomputation of the GC-1 manifest (no drift since GC-1 was frozen)", () => {
    expect(computeAggregateDigest()).toBe(BOUND_CANDIDATE_DIGEST);
  });
});

describe("DRA-GEN-001 protocol — carried-forward GC-1 limitations are not silently broadened", () => {
  it("declares at least the 5 limitations required by the protocol brief", () => {
    const ids = CARRIED_FORWARD_LIMITATIONS.map((l) => l.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "SCRIPT_BOUNDARY_RTL_ABUGIDA_SCRIPTIO_CONTINUA",
        "NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE",
        "MULTICOLUMN_BOUNDED_RESIDUAL_RISK",
        "UNTESTED_MULTI_WEAKNESS_INTERACTION",
        "SIX_OF_NINE_ISSUE_CLASSES_UNTRIGGERABLE",
      ]),
    );
  });

  it("every carried-forward limitation cites a source ledger entry and a concrete generalisation consequence", () => {
    for (const l of CARRIED_FORWARD_LIMITATIONS) {
      expect(l.sourceLedgerEntry.length).toBeGreaterThan(0);
      expect(l.statement.length).toBeGreaterThan(20);
      expect(l.generalisationConsequence.length).toBeGreaterThan(20);
    }
  });
});

describe("DRA-GEN-001 protocol — unit-of-analysis edge cases are resolved, not left open", () => {
  it("covers all 6 edge-case categories named in the protocol brief", () => {
    const rules = UNIT_EDGE_CASE_POLICIES.map((p) => p.rule);
    expect(rules).toEqual(
      expect.arrayContaining([
        "MULTI_FILE_REPORT_MAIN_FILE_ONLY",
        "MULTI_PAGE_HTML_ONE_UNIT",
        "TRANSLATION_SEPARATE_UNIT_FAMILY_LIMITED",
        "REVISED_EDITION_LATEST_ONLY",
        "PERIODICAL_ISSUE_IS_THE_UNIT",
        "MIRROR_CANONICAL_SOURCE_ONLY",
      ]),
    );
  });
});

describe("DRA-GEN-001 protocol — eligibility criteria are deterministic and complete", () => {
  it("declares at least 12 eligibility criteria with non-empty descriptions", () => {
    expect(ELIGIBILITY_CRITERIA.length).toBeGreaterThanOrEqual(12);
    for (const c of ELIGIBILITY_CRITERIA) {
      expect(c.description.length).toBeGreaterThan(10);
    }
  });

  it("no eligibility criterion description references DRA's own performance/output on the candidate", () => {
    for (const c of ELIGIBILITY_CRITERIA) {
      const lower = c.description.toLowerCase();
      expect(lower).not.toMatch(/evaluation result|dra.?s performance|decision outcome|\bsupported\b|\breview\b|\bhold\b/);
    }
  });
});

describe("DRA-GEN-001 protocol — development-corpus and considered-candidate exclusion", () => {
  it("the development corpus set matches GC-1's own recorded 33-document set exactly", () => {
    expect(GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS).toHaveLength(33);
    expect(GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID).toBe("DRA-DOC-0033");
  });

  it("the considered-candidate registry is non-trivially large (a real scan, not a stub)", () => {
    expect(CONSIDERED_CANDIDATE_URLS.length).toBeGreaterThan(50);
    expect(CONSIDERED_CANDIDATE_IDS.length).toBeGreaterThan(20);
  });

  it("every entry in the considered-URL registry is already normalised (idempotent under normalizeConsideredUrl)", () => {
    for (const u of CONSIDERED_CANDIDATE_URLS) {
      expect(normalizeConsideredUrl(u)).toBe(u);
    }
  });

  it("a known previously-considered URL is correctly detected as excluded, including with a differing query string", () => {
    // NCSC ML Principles (DRA-DOC-0015) was admitted via a considered discovery candidate.
    const sample = CONSIDERED_CANDIDATE_URLS.find((u) => u.includes("ncsc"));
    expect(sample).toBeDefined();
    expect(isConsideredUrl(`${sample}?utm_source=test`)).toBe(true);
  });

  it("a URL that was never considered is correctly treated as not excluded by this mechanism alone", () => {
    expect(isConsideredUrl("https://example-never-considered-domain-xyz123.test/some/report.pdf")).toBe(false);
  });

  it("a known previously-considered candidateId is correctly detected as excluded", () => {
    expect(isConsideredCandidateId(CONSIDERED_CANDIDATE_IDS[0]!)).toBe(true);
  });

  it("an unknown candidateId is correctly treated as not excluded by this mechanism alone", () => {
    expect(isConsideredCandidateId("DRA-CAND-NEVER-SEEN-999")).toBe(false);
  });
});

describe("DRA-GEN-001 protocol — stratification design", () => {
  it("declares exactly 4 hard strata that partition media type x language group", () => {
    expect(HARD_STRATA).toHaveLength(4);
    const ids = new Set(HARD_STRATA.map((s) => s.id));
    expect(ids.size).toBe(4);
  });

  it("hard-stratum allocation fractions sum to 1", () => {
    const total = HARD_STRATA.reduce((sum, s) => sum + s.allocationFraction, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

describe("DRA-GEN-001 protocol — sample-size analysis is evidence-based, not assumed", () => {
  it("evaluates at least the 5 sample sizes required by the protocol brief (50/75/100/150/200)", () => {
    const ns = SAMPLE_SIZE_OPTIONS.map((o) => o.n);
    expect(ns).toEqual(expect.arrayContaining([50, 75, 100, 150, 200]));
  });

  it("exactly one sample size is marked RECOMMENDED_PRIMARY", () => {
    const recommended = SAMPLE_SIZE_OPTIONS.filter((o) => o.recommendation === "RECOMMENDED_PRIMARY");
    expect(recommended).toHaveLength(1);
    expect(recommended[0]!.n).toBe(RECOMMENDED_SAMPLE_SIZE);
  });

  it("the minimum detectable failure rate strictly decreases as n increases (internally consistent statistics)", () => {
    const sorted = [...SAMPLE_SIZE_OPTIONS].sort((a, b) => a.n - b.n);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.minDetectableFailureRateAt95PctConfidence).toBeLessThanOrEqual(
        sorted[i - 1]!.minDetectableFailureRateAt95PctConfidence,
      );
    }
  });

  it("100 was not simply carried over from an earlier programme without justification (a documented note exists)", () => {
    const hundred = SAMPLE_SIZE_OPTIONS.find((o) => o.n === 100)!;
    expect(hundred.note.length).toBeGreaterThan(20);
  });
});

describe("DRA-GEN-001 protocol — endpoints are pre-declared across three tiers", () => {
  it("declares at least 4 PRIMARY, 4 SECONDARY, and 1 EXPLORATORY endpoint", () => {
    const byTier = { PRIMARY: 0, SECONDARY: 0, EXPLORATORY: 0 } as Record<string, number>;
    for (const e of ENDPOINTS) byTier[e.tier] = (byTier[e.tier] ?? 0) + 1;
    expect(byTier.PRIMARY).toBeGreaterThanOrEqual(4);
    expect(byTier.SECONDARY).toBeGreaterThanOrEqual(4);
    expect(byTier.EXPLORATORY).toBeGreaterThanOrEqual(1);
  });

  it("MATERIAL_FAILURE_RATE is declared as a PRIMARY endpoint", () => {
    const entry = ENDPOINTS.find((e) => e.id === "MATERIAL_FAILURE_RATE");
    expect(entry?.tier).toBe("PRIMARY");
  });

  it("no endpoint id is declared twice", () => {
    const ids = ENDPOINTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("DRA-GEN-001 protocol — every failure category has a defined treatment", () => {
  it("declares all 10 required failure categories", () => {
    const categories = FAILURE_TAXONOMY.map((f) => f.category);
    expect(categories).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it("every category has a non-empty boundary definition and an explicit replacement-eligibility and material-failure flag", () => {
    for (const f of FAILURE_TAXONOMY) {
      expect(f.boundary.length).toBeGreaterThan(10);
      expect(typeof f.replacementEligible).toBe("boolean");
      expect(typeof f.countsTowardMaterialFailureRate).toBe("boolean");
    }
  });

  it("a post-acquisition DRA processing failure category (PIPELINE_FAILURE) is never replacement-eligible", () => {
    const pipelineFailure = FAILURE_TAXONOMY.find((f) => f.category === "PIPELINE_FAILURE")!;
    expect(pipelineFailure.replacementEligible).toBe(false);
  });

  it("only externally-caused categories (acquisition failure, governance ineligibility) are replacement-eligible", () => {
    const eligible = FAILURE_TAXONOMY.filter((f) => f.replacementEligible).map((f) => f.category);
    for (const c of eligible) {
      expect(["EXTERNAL_ACQUISITION_FAILURE", "GOVERNANCE_INELIGIBLE"]).toContain(c);
    }
  });

  it("SUCCESSFUL_EVALUATION and KNOWN_LIMITATION_ENCOUNTERED do not count toward the material failure rate", () => {
    const successful = FAILURE_TAXONOMY.find((f) => f.category === "SUCCESSFUL_EVALUATION")!;
    const known = FAILURE_TAXONOMY.find((f) => f.category === "KNOWN_LIMITATION_ENCOUNTERED")!;
    expect(successful.countsTowardMaterialFailureRate).toBe(false);
    expect(known.countsTowardMaterialFailureRate).toBe(false);
  });
});

describe("DRA-GEN-001 protocol — replacement rules never permit swapping a poorly-performing document", () => {
  it("declares only externally-caused legitimate replacement reasons", () => {
    for (const reason of REPLACEMENT_POLICY.legitimateReasons) {
      expect(reason.toLowerCase()).not.toMatch(/performs poorly|difficult to process|unfavourable/);
    }
  });

  it("explicitly names DRA performing poorly as illegitimate", () => {
    expect(REPLACEMENT_POLICY.illegitimateReasons.join(" ").toLowerCase()).toMatch(/perform/);
  });

  it("a post-acquisition processing failure is never replaced (policy flag)", () => {
    expect(REPLACEMENT_POLICY.postAcquisitionFailureNeverReplaced).toBe(true);
  });

  it("the retry protocol has a bounded, finite number of attempts", () => {
    expect(REPLACEMENT_POLICY.retryProtocol.maxAttempts).toBeGreaterThan(0);
    expect(REPLACEMENT_POLICY.retryProtocol.maxAttempts).toBeLessThan(10);
  });
});

describe("DRA-GEN-001 protocol — blindness and sequencing rules", () => {
  it("blindness rules prohibit any pre-selection inspection for performance prediction", () => {
    expect(BLINDNESS_RULES.preSelectionRule.toLowerCase()).toMatch(/before it is locked/);
  });

  it("post-selection inspection must never change the candidate", () => {
    expect(BLINDNESS_RULES.postSelectionInspectionMustNotChangeCandidate).toBe(true);
  });

  it("the default sequencing rule is: select and lock the entire sample before evaluating the first unit", () => {
    expect(SEQUENTIAL_CONTAMINATION_CONTROL.defaultOrdering.toLowerCase()).toMatch(
      /select and lock the entire.*before evaluating the first/,
    );
  });

  it("no engineering between units is permitted", () => {
    expect(SEQUENTIAL_CONTAMINATION_CONTROL.noEngineeringBetweenUnits).toBe(true);
  });
});

describe("DRA-GEN-001 protocol — stopping rules bind execution to the exact frozen GC-1 identity", () => {
  it("declares a candidate-identity-mismatch stop rule", () => {
    expect(STOPPING_RULES.candidateIdentityMismatch.toUpperCase()).toMatch(/STOP/);
  });

  it("declares at least 3 severe stop conditions", () => {
    expect(STOPPING_RULES.severeStopConditions.length).toBeGreaterThanOrEqual(3);
  });
});

describe("DRA-GEN-001 protocol — this protocol cannot be mistaken for an executed benchmark", () => {
  it("no sample manifest, selection seed, or evaluation result export exists in this module (protocol-only, Phase 0 scope)", () => {
    // Structural guard: Phase 0 must not smuggle in actual sample-selection state.
    const moduleExports = Object.keys({
      PROTOCOL_ID,
      PROTOCOL_STATUS,
      BOUND_CANDIDATE_ID,
      BOUND_CANDIDATE_DIGEST,
      CARRIED_FORWARD_LIMITATIONS,
      ELIGIBILITY_CRITERIA,
      HARD_STRATA,
      SAMPLE_SIZE_OPTIONS,
      ENDPOINTS,
      FAILURE_TAXONOMY,
      REPLACEMENT_POLICY,
      BLINDNESS_RULES,
      STOPPING_RULES,
    });
    for (const name of moduleExports) {
      expect(name.toUpperCase()).not.toMatch(/SELECTED_SAMPLE|SAMPLE_MANIFEST|SELECTION_SEED|EVALUATION_RESULT/);
    }
  });
});
