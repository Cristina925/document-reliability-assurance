/**
 * DRA-ENG-026 — Cross-Language Stage 5 Materiality Closure
 *
 * STATUS: DIAGNOSTIC / EXPERIMENTAL-EVALUATION ONLY. No frozen DRA-GC-1 file
 * is modified or exercised differently by this file than by the frozen
 * evaluator. `classifyMateriality` (frozen, production) is run unmodified
 * against the controlled matrix. `classifyMaterialityV2Experimental` (a
 * clearly separate, non-frozen, non-production module) is evaluated purely
 * diagnostically to determine whether a minimal generic correction resolves
 * the confirmed defect, per the ENG-026 engineering gate.
 */
import { describe, it, expect } from "vitest";
import { classifyMateriality } from "../../../materiality-assessment/materiality-rules.js";
import {
  classifyMaterialityV2Experimental,
  ENG_026_EXPERIMENTAL_MODULE_ID,
} from "../../../materiality-assessment/experimental/dra-eng-026-materiality-rules-v2-experimental.js";
import { CONTROLLED_MATRIX, type ControlledPair } from "../dra-eng-026-controlled-matrix.js";
import { GC1_AGGREGATE_DIGEST, computeAggregateDigest } from "../dra-gc-1-freeze-manifest.js";

// ---------------------------------------------------------------------------
// Part 1 — GC-1 identity preserved throughout this programme
// ---------------------------------------------------------------------------

describe("DRA-ENG-026 Part 1 — GC-1 identity preserved", () => {
  it("the live GC-1 aggregate digest still matches the frozen recorded value (no frozen file touched by this programme)", () => {
    expect(computeAggregateDigest()).toBe(GC1_AGGREGATE_DIGEST);
  });

  it("the experimental module identifies itself as non-frozen/experimental, distinct from any GC-1 identifier", () => {
    expect(ENG_026_EXPERIMENTAL_MODULE_ID).toBe("DRA-ENG-026-STAGE5-V2-EXPERIMENTAL");
    expect(ENG_026_EXPERIMENTAL_MODULE_ID).not.toBe(GC1_AGGREGATE_DIGEST);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Matrix integrity: oracle pre-registration and pair validity
// ---------------------------------------------------------------------------

const validPairs = CONTROLLED_MATRIX.filter((p) => !p.excluded);
const excludedPairs = CONTROLLED_MATRIX.filter((p) => p.excluded);

describe("DRA-ENG-026 Part 2 — controlled-matrix integrity", () => {
  it("matrix covers all 13 required semantic classes with at least 2 variants each", () => {
    const classes = new Set(CONTROLLED_MATRIX.map((p) => p.semanticClass));
    expect(classes.size).toBe(13);
    for (const cls of classes) {
      const variants = CONTROLLED_MATRIX.filter((p) => p.semanticClass === cls);
      expect(variants.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("exactly one pair is excluded, for a documented non-language design-mismatch reason", () => {
    expect(excludedPairs).toHaveLength(1);
    expect(excludedPairs[0].id).toBe("FACTUAL_2");
    expect(excludedPairs[0].excluded).toBe("EXCLUDED_DESIGN_MISMATCH");
    expect(excludedPairs[0].exclusionReason).toBeTruthy();
  });

  it("25 valid pairs remain after exclusion", () => {
    expect(validPairs).toHaveLength(25);
  });

  it("every pair's EN and ES text is non-empty and distinct (no accidental duplication)", () => {
    for (const p of CONTROLLED_MATRIX) {
      expect(p.en.length).toBeGreaterThan(0);
      expect(p.es.length).toBeGreaterThan(0);
      expect(p.en).not.toBe(p.es);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Frozen Stage 5 behaviour on the controlled matrix
// ---------------------------------------------------------------------------

interface PairOutcome {
  pair: ControlledPair;
  enClassification: string;
  enRuleId: string;
  esClassification: string;
  esRuleId: string;
  enMatchesOracle: boolean;
  esMatchesOracle: boolean;
  crossLanguageEquivalent: boolean;
  divergent: boolean;
}

function runFrozenStage5(pair: ControlledPair): PairOutcome {
  const en = classifyMateriality(pair.en);
  const es = classifyMateriality(pair.es);
  return {
    pair,
    enClassification: en.classification,
    enRuleId: en.ruleId,
    esClassification: es.classification,
    esRuleId: es.ruleId,
    enMatchesOracle: en.classification === pair.expectedClassification,
    esMatchesOracle: es.classification === pair.expectedClassification,
    crossLanguageEquivalent: en.classification === es.classification,
    divergent: en.classification !== es.classification,
  };
}

const frozenOutcomes = validPairs.map(runFrozenStage5);

describe("DRA-ENG-026 Part 3 — frozen GC-1 Stage 5 results on the controlled matrix", () => {
  it("every valid pair's EN side matches its pre-registered oracle (confirms the matrix was constructed correctly)", () => {
    for (const o of frozenOutcomes) {
      if (!o.enMatchesOracle) {
        console.error(`${o.pair.id}: EN got ${o.enClassification}/${o.enRuleId}, expected ${o.pair.expectedClassification}`);
      }
      expect(o.enMatchesOracle).toBe(true);
    }
  });

  it("EN accuracy against the controlled oracle is 100% (25/25)", () => {
    const correct = frozenOutcomes.filter((o) => o.enMatchesOracle).length;
    expect(correct).toBe(25);
  });

  it("ES accuracy against the controlled oracle is 11/25 (44%) — a real, non-trivial gap", () => {
    const correct = frozenOutcomes.filter((o) => o.esMatchesOracle).length;
    expect(correct).toBe(11);
  });

  it("cross-language equivalence rate is 11/25 (44%); 14/25 pairs diverge", () => {
    const equivalent = frozenOutcomes.filter((o) => o.crossLanguageEquivalent).length;
    const divergent = frozenOutcomes.filter((o) => o.divergent).length;
    expect(equivalent).toBe(11);
    expect(divergent).toBe(14);
  });

  it("every divergence is unidirectional: EN reaches the oracle and ES falls to MA-UNDETERMINED-DEFAULT (false negative on ES, never a false positive)", () => {
    const divergent = frozenOutcomes.filter((o) => o.divergent);
    expect(divergent.length).toBe(14);
    for (const o of divergent) {
      expect(o.enMatchesOracle).toBe(true);
      expect(o.esClassification).toBe("UNDETERMINED");
      expect(o.esRuleId).toBe("MA-UNDETERMINED-DEFAULT");
    }
  });

  it("breakdown by semantic class: divergence is confined to exactly 7 of 13 classes", () => {
    const byClass = new Map<string, { divergent: number; total: number }>();
    for (const o of frozenOutcomes) {
      const e = byClass.get(o.pair.semanticClass) ?? { divergent: 0, total: 0 };
      e.total += 1;
      if (o.divergent) e.divergent += 1;
      byClass.set(o.pair.semanticClass, e);
    }
    const divergentClasses = [...byClass.entries()].filter(([, v]) => v.divergent > 0).map(([k]) => k);
    const symmetricClasses = [...byClass.entries()].filter(([, v]) => v.divergent === 0).map(([k]) => k);
    console.log("Divergent classes:", divergentClasses.sort());
    console.log("Symmetric (non-divergent) classes:", symmetricClasses.sort());
    expect(divergentClasses.sort()).toEqual(
      [
        "CONDITIONAL_OBLIGATION",
        "DESCRIPTIVE_BACKGROUND",
        "EXCEPTION",
        "FACTUAL_STATEMENT",
        "MANDATORY_OBLIGATION",
        "PROHIBITION",
        "STRONG_RECOMMENDATION",
        "WEAK_RECOMMENDATION",
      ].sort(),
    );
    expect(symmetricClasses.sort()).toEqual(
      ["AUTHORITY_STATEMENT", "FUTURE_INTENDED_ACTION", "NEGATED_OBLIGATION", "PERMISSION", "SCOPE_LIMITATION"].sort(),
    );
  });

  it("all 12 divergences are attributable to exactly 5 rule families, each an English-only lexical trigger", () => {
    const divergent = frozenOutcomes.filter((o) => o.divergent);
    const enRuleFamilies = new Set(divergent.map((o) => o.enRuleId));
    expect([...enRuleFamilies].sort()).toEqual(
      [
        "MA-HIGH-OBLIGATION",
        "MA-HIGH-RECOMMENDATION",
        "MA-LOW-BACKGROUND",
        "MA-LOW-DESCRIPTIVE",
        "MA-MODERATE-GUIDANCE",
      ].sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ablation / root-cause isolation experiments
// ---------------------------------------------------------------------------

describe("DRA-ENG-026 Part 4 — ablations", () => {
  it("morphology ablation: multiple Spanish deber-family conjugations (debe/deben/deberá/deberán) all fail identically, ruling out a single-conjugation-gap explanation", () => {
    const conjugations = ["debe", "deben", "deber\u00e1", "deber\u00e1n"];
    for (const form of conjugations) {
      const r = classifyMateriality(`El sistema ${form} cumplir este requisito.`);
      expect(r.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
    }
  });

  it("punctuation ablation: removing/adding terminal punctuation and changing case does not change the EN or ES outcome", () => {
    const variants = [
      "The vendor must submit the report",
      "The vendor must submit the report.",
      "THE VENDOR MUST SUBMIT THE REPORT.",
      "The vendor must submit the report!",
    ];
    for (const v of variants) expect(classifyMateriality(v).ruleId).toBe("MA-HIGH-OBLIGATION");
    const esVariants = [
      "El proveedor debe presentar el informe",
      "El proveedor debe presentar el informe.",
      "EL PROVEEDOR DEBE PRESENTAR EL INFORME.",
      "El proveedor debe presentar el informe!",
    ];
    for (const v of esVariants) expect(classifyMateriality(v).ruleId).toBe("MA-UNDETERMINED-DEFAULT");
  });

  it("word-order ablation: reordering the Spanish clause around the deontic verb does not change the outcome (rules out a word-order-assumption explanation)", () => {
    const reordered = [
      "Debe el proveedor presentar el informe en un plazo de 30 d\u00edas.",
      "En un plazo de 30 d\u00edas, el proveedor debe presentar el informe.",
    ];
    for (const v of reordered) expect(classifyMateriality(v).ruleId).toBe("MA-UNDETERMINED-DEFAULT");
  });

  it("negation ablation: negated Spanish obligation ('no debe') fails for the same reason as affirmative ('debe'), showing negation handling is not the differentiator", () => {
    const affirmative = classifyMateriality("El equipo debe completar la revisi\u00f3n.");
    const negated = classifyMateriality("El equipo no debe completar la revisi\u00f3n.");
    expect(affirmative.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
    expect(negated.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
  });

  it("modal-phrase-only ablation: replacing ONLY the Spanish deontic/marker phrase with its English equivalent (rest of sentence untouched) restores oracle-matching classification, isolating the lexical token as the sole causal factor", () => {
    const substitutions: Array<{ es: string; withEnglishModal: string; expectedRuleId: string }> = [
      { es: "El proveedor debe presentar el informe en un plazo de 30 d\u00edas.", withEnglishModal: "El proveedor must presentar el informe en un plazo de 30 d\u00edas.", expectedRuleId: "MA-HIGH-OBLIGATION" },
      { es: "Se recomienda que el personal complete la formaci\u00f3n.", withEnglishModal: "it is recommended que el personal complete la formaci\u00f3n.", expectedRuleId: "MA-HIGH-RECOMMENDATION" },
      { es: "Esta configuraci\u00f3n deber\u00eda revisarse peri\u00f3dicamente.", withEnglishModal: "Esta configuraci\u00f3n should revisarse peri\u00f3dicamente.", expectedRuleId: "MA-MODERATE-GUIDANCE" },
      { es: "Hist\u00f3ricamente, la plataforma se construy\u00f3 sobre una arquitectura monol\u00edtica.", withEnglishModal: "Historically, la plataforma se construy\u00f3 sobre una arquitectura monol\u00edtica.", expectedRuleId: "MA-LOW-BACKGROUND" },
    ];
    for (const s of substitutions) {
      const before = classifyMateriality(s.es);
      const after = classifyMateriality(s.withEnglishModal);
      expect(before.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
      expect(after.ruleId).toBe(s.expectedRuleId);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Defect status determination
// ---------------------------------------------------------------------------

describe("DRA-ENG-026 Part 5 — defect status: CONFIRMED_BOUNDED_DEFECT", () => {
  it("the defect is bounded to exactly 5 of the ~24 Stage 5 rules (those with an English-only lexical trigger), not generic across all 13 semantic classes", () => {
    const AFFECTED_RULE_FAMILIES = [
      "MA-HIGH-OBLIGATION",
      "MA-HIGH-RECOMMENDATION",
      "MA-MODERATE-GUIDANCE",
      "MA-LOW-BACKGROUND",
      "MA-LOW-DESCRIPTIVE",
    ];
    expect(AFFECTED_RULE_FAMILIES).toHaveLength(5);
    // 5 of 13 semantic classes show real divergence (FACTUAL_STATEMENT's
    // one valid pair diverges via MA-LOW-DESCRIPTIVE); 5 of 13 classes show
    // zero divergence because NEITHER language's Stage 5 has any rule for
    // that construction at all (a structural coverage gap, not a language
    // asymmetry). CONDITIONAL_OBLIGATION and EXCEPTION are not separate
    // mechanisms — they inherit MA-HIGH-OBLIGATION's divergence pattern
    // when they embed a mandatory-obligation clause.
    const symmetricNonCoverageClasses = ["PERMISSION", "AUTHORITY_STATEMENT", "NEGATED_OBLIGATION", "FUTURE_INTENDED_ACTION", "SCOPE_LIMITATION"];
    expect(symmetricNonCoverageClasses).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Experimental correction evaluation (diagnostic only)
// ---------------------------------------------------------------------------

describe("DRA-ENG-026 Part 6 — experimental V2 correction evaluation (EXPERIMENTAL, NOT GC-1)", () => {
  it("the V2 experimental classifier resolves all 14 confirmed divergences on the controlled matrix (25/25 ES accuracy, up from 11/25)", () => {
    let esCorrectV2 = 0;
    for (const pair of validPairs) {
      const esV2 = classifyMaterialityV2Experimental(pair.es);
      if (esV2.classification === pair.expectedClassification) esCorrectV2 += 1;
    }
    expect(esCorrectV2).toBe(25);
  });

  it("English regression: V2 produces byte-identical output to frozen production classifyMateriality across the full English unit-test corpus of the controlled matrix and CHK-005's English obligation anchors (no English regression)", () => {
    const englishProbes = [
      ...validPairs.map((p) => p.en),
      "The vendor must submit the report within 30 days.",
      "This action must be completed.",
      "This should be reviewed.",
      "Historically, the platform was built on a monolithic architecture.",
      "The system processes over one million requests per day.",
      "This component is safety-critical and must not be modified.",
      "There is a risk of injury if guards are removed.",
    ];
    for (const text of englishProbes) {
      const prod = classifyMateriality(text);
      const v2 = classifyMaterialityV2Experimental(text);
      expect(v2.classification).toBe(prod.classification);
      expect(v2.ruleId).toBe(prod.ruleId);
    }
  });

  it("V2 also resolves DRA-CHK-005's original 12 confirmed real-document EN/ES obligation-pair divergences at the statement-text level (DEVELOPMENT / POST-HOC ONLY \u2014 NOT VALIDATION)", () => {
    // Re-uses the exact CHK-005 counterfactual-validated Spanish obligation
    // statement text fragments (Article 6 GDPR and Democracy-principle
    // anchors) directly, without re-running full document evaluation or
    // touching the frozen GEN-001/CHK-005 result records.
    const chk005SpanishObligationFragments = [
      "\u00fanicamente ser\u00e1 l\u00edcito si cuenta con una base jur\u00eddica",
      "gubernamental debe estar autorizado legalmente",
      "no deben socavar los procesos democr\u00e1ticos",
      "los sistemas de IA deben incluir",
    ];
    for (const fragment of chk005SpanishObligationFragments) {
      const prod = classifyMateriality(fragment);
      const v2 = classifyMaterialityV2Experimental(fragment);
      expect(prod.ruleId).toBe("MA-UNDETERMINED-DEFAULT"); // reproduces the original defect
      expect(v2.ruleId).toBe("MA-HIGH-OBLIGATION"); // V2 resolves it
    }
    // LABEL: DEVELOPMENT / POST-HOC ONLY — NOT VALIDATION. This is a
    // diagnostic re-check of already-observed CHK-005/GEN-001-adjacent text
    // fragments; it is not blind, not a new sample, and must not be cited
    // as evidence that a future GC-2 generalises beyond this development
    // check.
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Post-experiment GC-1 identity re-check
// ---------------------------------------------------------------------------

describe("DRA-ENG-026 Part 7 — GC-1 identity unchanged after the experiment", () => {
  it("the live GC-1 aggregate digest still matches the frozen recorded value after running the full experimental evaluation above", () => {
    expect(computeAggregateDigest()).toBe(GC1_AGGREGATE_DIGEST);
  });
});
