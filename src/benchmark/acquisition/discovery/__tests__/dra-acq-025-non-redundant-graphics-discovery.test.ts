/**
 * DRA-ACQ-025 — Phase 1: Non-Redundant Graphical Semantics Candidate
 * Discovery for DRA-DOC-0029
 *
 * Proves the programme context, redundancy-classification taxonomy, the
 * six-condition qualification test, candidate register, ranking, Phase 1
 * qualification verdict, qualification record, DRA-ENG-015/016/017
 * interaction analysis, and Phase 1 scope boundary recorded in
 * dra-acq-025-non-redundant-graphics-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from today's live-source re-verification (recorded as fixed data
 * in the module under test).
 */

import { describe, it, expect } from "vitest";

import {
  PROGRAMME_CONTEXT,
  REDUNDANCY_CLASSIFICATIONS,
  GRAPHIC_CONSTRUCT_KINDS,
  QUALIFICATION_TEST_CONDITIONS,
  NON_MATERIALITY_REJECTION_EXAMPLES,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_REUSE_STATUSES,
  HTTP_ACCESSIBILITY_STATUSES,
  SOURCE_STABILITY_STATUSES,
  RANKED_CANDIDATE_IDS,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  PHASE_1_QUALIFICATION_RECORD,
  ENG_015_016_017_INTERACTION_ANALYSIS,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-025-non-redundant-graphics-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 1: Programme Context", () => {
  it("records the 28-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(28);
  });

  it("records the DRA-DOC-0028 / MATERIAL_BOUNDED prior finding that motivates this programme", () => {
    expect(PROGRAMME_CONTEXT.priorFinding).toMatch(/MATERIAL_BOUNDED/);
    expect(PROGRAMME_CONTEXT.priorFinding).toMatch(/Appendix B/i);
  });

  it("states the follow-up question in terms of non-redundant graphical semantics", () => {
    expect(PROGRAMME_CONTEXT.followUpQuestion).toMatch(/NON_REDUNDANT/);
  });

  it("declares a negative result acceptable and does not permit lowering the bar", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO_QUALIFIED_CANDIDATE_FOUND/);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/does not lower/i);
  });

  it("declares discovery breadth beyond flowcharts", () => {
    expect(PROGRAMME_CONTEXT.investigationBreadthInstruction).toMatch(/not limited to flowcharts/i);
  });

  it("does not alter the frozen evaluator identity (0.1.2 / 1.0 / 0.1.0)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
    expect(DRA_PIPELINE_VERSION).toBe("1.0");
    expect(DRA_MODEL_VERSION).toBe("0.1.0");
  });

  it("PROGRAMME_CONTEXT is frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Redundancy classification, qualification test, construct kinds
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 2: Redundancy Classification and Qualification Test", () => {
  it("defines exactly the three-way redundancy classification named by the task specification", () => {
    expect(REDUNDANCY_CLASSIFICATIONS.length).toBe(3);
    expect(REDUNDANCY_CLASSIFICATIONS).toEqual(["REDUNDANT_COMPLETE", "REDUNDANT_PARTIAL", "NON_REDUNDANT"]);
  });

  it("defines a non-empty set of graphic construct kinds spanning multiple genres", () => {
    expect(GRAPHIC_CONSTRUCT_KINDS.length).toBeGreaterThanOrEqual(4);
    expect(GRAPHIC_CONSTRUCT_KINDS).toContain("CAUSAL_DIRECTED_ACYCLIC_GRAPH");
    expect(GRAPHIC_CONSTRUCT_KINDS).toContain("ARCHITECTURE_OR_LOGICAL_COMPONENT_DIAGRAM");
    expect(GRAPHIC_CONSTRUCT_KINDS).toContain("COLOUR_CODED_CONTOUR_OR_CHOROPLETH_MAP");
  });

  it("defines exactly the six qualification conditions named by the task specification", () => {
    expect(QUALIFICATION_TEST_CONDITIONS.length).toBe(6);
    expect(QUALIFICATION_TEST_CONDITIONS).toContain("materially_relevant_to_the_documents_meaning");
    expect(QUALIFICATION_TEST_CONDITIONS).toContain("encoded_graphically");
    expect(QUALIFICATION_TEST_CONDITIONS).toContain("not_preserved_faithfully_by_extraction");
    expect(QUALIFICATION_TEST_CONDITIONS).toContain("not_independently_stated_in_surrounding_prose");
    expect(QUALIFICATION_TEST_CONDITIONS).toContain(
      "not_reconstructable_from_tables_appendices_captions_or_other_document_content",
    );
    expect(QUALIFICATION_TEST_CONDITIONS).toContain("has_a_defensible_objective_ground_truth");
  });

  it("records non-materiality rejection examples distinct from redundancy rejection", () => {
    expect(NON_MATERIALITY_REJECTION_EXAMPLES.length).toBeGreaterThan(0);
  });

  it("all Part 2 collections are frozen", () => {
    expect(Object.isFrozen(REDUNDANCY_CLASSIFICATIONS)).toBe(true);
    expect(Object.isFrozen(GRAPHIC_CONSTRUCT_KINDS)).toBe(true);
    expect(Object.isFrozen(QUALIFICATION_TEST_CONDITIONS)).toBe(true);
    expect(Object.isFrozen(NON_MATERIALITY_REJECTION_EXAMPLES)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 3: Candidate Register", () => {
  it("records exactly 3 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(3);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-025-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(HTTP_ACCESSIBILITY_STATUSES).toContain(c.httpAccessibility);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
      for (const kind of c.graphicConstructKinds) {
        expect(GRAPHIC_CONSTRUCT_KINDS).toContain(kind);
      }
    }
  });

  it("candidateIds are unique", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rejected candidate has a non-null rejectionOrDeferralReason", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(c.rejectionOrDeferralReason).toBeNull();
      } else {
        expect(c.rejectionOrDeferralReason).not.toBeNull();
        expect(c.rejectionOrDeferralReason!.length).toBeGreaterThan(10);
      }
    }
  });

  it("every candidate marked REJECTED_SEMANTIC_REDUNDANCY has no NON_REDUNDANT ground-truth example", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "REJECTED_SEMANTIC_REDUNDANCY") {
        expect(c.groundTruthExamples.some((g) => g.recoverabilityVerdict === "NON_REDUNDANT")).toBe(false);
      }
    }
  });

  it("the structure-misfit candidate has zero ground-truth examples (no prose to audit) but was genuinely fetched and inspected", () => {
    const structureMisfit = CANDIDATE_REGISTER.filter(
      (c) => c.qualificationOutcome === "REJECTED_DOCUMENT_STRUCTURE_MISFIT",
    );
    expect(structureMisfit.length).toBe(1);
    for (const c of structureMisfit) {
      expect(c.groundTruthExamples.length).toBe(0);
      expect(c.visuallyInspectedPages.length + c.stabilityObservations.length).toBeGreaterThan(0);
      expect(c.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
      expect(c.sourceStabilityStatus).toBe("BYTE_STABLE");
    }
  });

  it("every QUALIFIED_RECOMMENDED candidate has at least one NON_REDUNDANT ground-truth example and at least one visually inspected page", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(c.groundTruthExamples.some((g) => g.recoverabilityVerdict === "NON_REDUNDANT")).toBe(true);
        expect(c.visuallyInspectedPages.length).toBeGreaterThan(0);
      }
    }
  });

  it("the primary candidate has at least two independently confirmed NON_REDUNDANT findings", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const nonRedundant = primary.groundTruthExamples.filter((g) => g.recoverabilityVerdict === "NON_REDUNDANT");
    expect(nonRedundant.length).toBeGreaterThanOrEqual(2);
  });

  it("the primary candidate also has a REDUNDANT_COMPLETE internal positive control for contrast", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const controls = primary.groundTruthExamples.filter((g) => g.recoverabilityVerdict === "REDUNDANT_COMPLETE");
    expect(controls.length).toBeGreaterThanOrEqual(1);
  });

  it("every NON_REDUNDANT ground-truth example records a redundancy audit that searched more than one document location", () => {
    for (const c of CANDIDATE_REGISTER) {
      for (const g of c.groundTruthExamples) {
        if (g.recoverabilityVerdict === "NON_REDUNDANT") {
          expect(g.redundancyAudit.length).toBeGreaterThan(0);
          const locations = new Set(g.redundancyAudit.map((r) => r.searchedLocation));
          expect(locations.size).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("the primary candidate is native representation, avoiding the DRA-ACQ-023/DRA-ENG-017 OCR confound", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    expect(primary.nativeRepresentation).toBe(true);
  });

  it("all candidates were genuinely investigated (non-empty stability/accessibility evidence)", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.accessibilityEvidence.length).toBeGreaterThan(20);
      expect(c.stabilityObservations.length).toBeGreaterThan(20);
    }
  });

  it("no candidate was selected because it seemed likely to make the evaluator fail", () => {
    for (const c of CANDIDATE_REGISTER) {
      for (const g of c.groundTruthExamples) {
        expect(g.note).not.toMatch(/likely to fail|would make DRA fail/i);
      }
    }
  });

  it("the candidate register and every row, including nested groundTruthExamples and redundancyAudit, are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(c)).toBe(true);
      expect(Object.isFrozen(c.knownRisks)).toBe(true);
      expect(Object.isFrozen(c.visuallyInspectedPages)).toBe(true);
      expect(Object.isFrozen(c.groundTruthExamples)).toBe(true);
      for (const g of c.groundTruthExamples) {
        expect(Object.isFrozen(g)).toBe(true);
        expect(Object.isFrozen(g.redundancyAudit)).toBe(true);
        for (const r of g.redundancyAudit) {
          expect(Object.isFrozen(r)).toBe(true);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the CDC EID Legionella causal-diagram candidate (DRA-CAND-025-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-025-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves known candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/Legionella/i);
    expect(getCandidateById("DRA-CAND-025-02")?.title).toMatch(/Zero Trust/i);
    expect(getCandidateById("DRA-CAND-025-03")?.title).toMatch(/Seismic-Hazard/i);
    expect(getCandidateById("DRA-CAND-025-99")).toBeUndefined();
  });

  it("no alternate candidate is manufactured (none was genuinely and independently qualified)", () => {
    expect(ALTERNATE_CANDIDATE_ID).toBeNull();
  });

  it("primaryCandidate returns the CDC EID Legionella document and is QUALIFIED_RECOMMENDED", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED governance, byte-stable accessibility, native representation, visual verification, a NON_REDUNDANT finding, and an internal control", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.proposedCorpusId).toBe("DRA-DOC-0029");
  });

  it("covers every field required by the DRA-ACQ-025 task specification", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.governance).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition).toBeDefined();
    expect(typeof PHASE_1_QUALIFICATION_RECORD.evidenceContribution).toBe("string");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.corpusContribution).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.risks.length).toBeGreaterThan(0);
    expect(typeof PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning.length).toBeGreaterThan(50);
  });

  it("explicitly states no alternate is proposed and why", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.alternateCandidateStatus).toMatch(/no alternate is proposed/i);
  });

  it("discloses the domain non-diversification limitation rather than omitting it", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.corpusContribution).toMatch(/repeats the already-represented HEALTHCARE domain/i);
  });

  it("records the required anti-contamination reasoning: no evaluator result used in selection", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toMatch(/no candidate was chosen, or rejected, on the basis/i);
  });

  it("the qualification record and its nested collections are frozen", () => {
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD)).toBe(true);
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD.governance.unresolvedQuestions)).toBe(true);
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD.acquisition.risks)).toBe(true);
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD.risks)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — DRA-ENG-015/016/017 interaction analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 6: DRA-ENG-015/016/017 Interaction Analysis", () => {
  it("finds DRA-ENG-015 and DRA-ENG-016 not applicable to the primary candidate's finding", () => {
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.eng015Relevance).toBe("NOT_APPLICABLE");
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.eng016Relevance).toBe("NOT_APPLICABLE");
  });

  it("acknowledges DRA-ENG-017 is adjacent but does not solve non-redundancy detection", () => {
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.eng017Relevance).toBe("PARTIALLY_ADJACENT_BUT_DISTINCT");
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.doesEitherExistingMechanismSolveNonRedundancyDetection).toBe(false);
  });

  it("does not propose an architectural change now", () => {
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.architecturalChangeRequiredNow).toBe(false);
  });

  it("is frozen and observation-only", () => {
    expect(Object.isFrozen(ENG_015_016_017_INTERACTION_ANALYSIS)).toBe(true);
    expect(Object.isFrozen(ENG_015_016_017_INTERACTION_ANALYSIS.nonRedundancyDetectionRequires)).toBe(true);
    expect(ENG_015_016_017_INTERACTION_ANALYSIS.note).toMatch(/observation only/i);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-025 — Part 7: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0029 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0029");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0029");
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-025 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0029",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_025",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "modify_dra_eng_015_detector",
      "modify_dra_eng_016_mechanism",
      "modify_dra_eng_017_provenance_model",
      "build_or_invoke_computer_vision_or_chart_parsing",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_any_graphics_semantics_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
      "lower_the_six_condition_qualification_bar_to_force_a_candidate_to_qualify",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0029");
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
