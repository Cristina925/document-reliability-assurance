/**
 * DRA-ACQ-024 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0028 (Graphics/Figure-Dependent Semantics Probe)
 *
 * Proves the programme context, graphic-semantic classification taxonomy,
 * target failure modes, candidate register, ranking, Phase 1
 * qualification verdict, qualification record, DRA-ENG-015/DRA-ENG-017
 * interaction analysis, and Phase 1 scope boundary recorded in
 * dra-acq-024-graphics-figure-discovery.ts.
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
  GRAPHIC_SEMANTIC_CLASSIFICATIONS,
  GRAPHIC_CONSTRUCT_KINDS,
  TARGET_FAILURE_MODES,
  DESIRED_STRUCTURAL_ELEMENTS,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_REUSE_STATUSES,
  HTTP_ACCESSIBILITY_STATUSES,
  SOURCE_STABILITY_STATUSES,
  RANKED_CANDIDATE_IDS,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_1_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  PHASE_1_QUALIFICATION_RECORD,
  ENG_015_ENG_017_INTERACTION_ANALYSIS,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-024-graphics-figure-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 1: Programme Context", () => {
  it("records the 27-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(27);
  });

  it("excludes footnote, table-shading, citation, and scan/OCR dimensions per the task specification", () => {
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("footnote_or_reading_order_degradation");
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("table_or_cell_shading_structural_loss");
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("scientific_citation_linkage");
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("scan_or_ocr_representation_provenance");
  });

  it("sets the new target dimension to graphics/figure-dependent semantics", () => {
    expect(PROGRAMME_CONTEXT.newTargetDimension).toBe("graphics_and_figure_dependent_semantics");
    expect(PROGRAMME_CONTEXT.newTargetRationale).toMatch(/figure|diagram|chart|map/i);
  });

  it("records the central research question verbatim in substance", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/graphical information/i);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/canonical machine-readable/i);
  });

  it("does not alter the frozen evaluator identity (0.1.2 / 1.0 / 0.1.0)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
    expect(DRA_PIPELINE_VERSION).toBe("1.0");
    expect(DRA_MODEL_VERSION).toBe("0.1.0");
  });

  it("PROGRAMME_CONTEXT and nested collections are frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
    expect(Object.isFrozen(PROGRAMME_CONTEXT.excludedDimensions)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Graphic-semantic classification taxonomy and failure modes
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 2: Graphic-Semantic Classification and Failure Modes", () => {
  it("defines exactly the three-way classification named by the task specification", () => {
    expect(GRAPHIC_SEMANTIC_CLASSIFICATIONS.length).toBe(3);
    expect(GRAPHIC_SEMANTIC_CLASSIFICATIONS).toEqual([
      "INDEPENDENTLY_COMPLETE_PROSE",
      "ILLUSTRATIVE_OF_COMPLETE_PROSE",
      "MATERIAL_GRAPHIC_SEMANTICS",
    ]);
  });

  it("defines a non-empty set of graphic construct kinds", () => {
    expect(GRAPHIC_CONSTRUCT_KINDS.length).toBeGreaterThan(3);
    expect(GRAPHIC_CONSTRUCT_KINDS).toContain("BRANCHING_TOPOLOGY_FLOWCHART");
  });

  it("records target failure modes covering topology loss and silent plausibility", () => {
    expect(TARGET_FAILURE_MODES.length).toBeGreaterThanOrEqual(5);
    expect(TARGET_FAILURE_MODES).toContain(
      "branch_topology_lost_arrows_and_routing_not_present_in_extracted_text",
    );
    expect(TARGET_FAILURE_MODES).toContain(
      "silent_plausibility_the_flattened_text_still_reads_as_coherent_prose_giving_no_signal_that_meaning_was_lost",
    );
  });

  it("records a non-empty, de-duplicated list of desired structural elements", () => {
    expect(DESIRED_STRUCTURAL_ELEMENTS.length).toBeGreaterThan(5);
    expect(new Set(DESIRED_STRUCTURAL_ELEMENTS).size).toBe(DESIRED_STRUCTURAL_ELEMENTS.length);
  });

  it("TARGET_FAILURE_MODES and DESIRED_STRUCTURAL_ELEMENTS are frozen", () => {
    expect(Object.isFrozen(TARGET_FAILURE_MODES)).toBe(true);
    expect(Object.isFrozen(DESIRED_STRUCTURAL_ELEMENTS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 3: Candidate Register", () => {
  it("records exactly 4 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(4);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-024-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(HTTP_ACCESSIBILITY_STATUSES).toContain(c.httpAccessibility);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
      if (c.graphicSemanticClassification !== null) {
        expect(GRAPHIC_SEMANTIC_CLASSIFICATIONS).toContain(c.graphicSemanticClassification);
      }
    }
  });

  it("candidateIds are unique", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rejected or deferred candidate has a non-null rejectionOrDeferralReason", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(c.rejectionOrDeferralReason).toBeNull();
      } else {
        expect(c.rejectionOrDeferralReason).not.toBeNull();
        expect(c.rejectionOrDeferralReason!.length).toBeGreaterThan(10);
      }
    }
  });

  it("every candidate marked REJECTED_SEMANTIC_REDUNDANCY has a classification other than MATERIAL_GRAPHIC_SEMANTICS", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "REJECTED_SEMANTIC_REDUNDANCY") {
        expect(c.graphicSemanticClassification).not.toBe("MATERIAL_GRAPHIC_SEMANTICS");
      }
    }
  });

  it("the deferred candidate has an unresolved licence status, not VERIFIED", () => {
    const deferred = CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "DEFERRED");
    expect(deferred.length).toBeGreaterThan(0);
    for (const c of deferred) {
      expect(c.licenceReuseStatus).not.toBe("VERIFIED");
    }
  });

  it("no candidate infers licence reuse from mere accessibility (deferred candidate is VERIFIED_ACCESSIBLE but not licence-VERIFIED)", () => {
    const deferred = getCandidateById(ALTERNATE_1_CANDIDATE_ID)!;
    expect(deferred.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
    expect(deferred.licenceReuseStatus).toBe("RESTRICTIVE_UNCONFIRMED");
  });

  it("every QUALIFIED_RECOMMENDED or QUALIFIED_ALTERNATE candidate has a confirmed MATERIAL_GRAPHIC_SEMANTICS classification and at least one visually inspected page", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(c.graphicSemanticClassification).toBe("MATERIAL_GRAPHIC_SEMANTICS");
        expect(c.visuallyInspectedPages.length).toBeGreaterThan(0);
      }
    }
  });

  it("the primary candidate has at least two observed graphic-semantics losses (real, not hypothetical, defects)", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const losses = primary.groundTruthExamples.filter((g) => !g.materialSemanticsSurvive);
    expect(losses.length).toBeGreaterThanOrEqual(2);
  });

  it("the primary candidate also has at least one confirmed-surviving (internal control) ground-truth example for contrast", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const surviving = primary.groundTruthExamples.filter((g) => g.materialSemanticsSurvive);
    expect(surviving.length).toBeGreaterThanOrEqual(1);
  });

  it("the primary candidate is native representation, avoiding the DRA-ACQ-023/DRA-ENG-017 OCR confound", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    expect(primary.nativeRepresentation).toBe(true);
  });

  it("both rejected candidates were genuinely investigated (non-empty classification evidence and at least one ground-truth example or visually inspected page)", () => {
    for (const id of REJECTED_CANDIDATE_IDS) {
      const c = getCandidateById(id)!;
      expect(c.classificationEvidence.length).toBeGreaterThan(20);
      expect(c.groundTruthExamples.length + c.visuallyInspectedPages.length).toBeGreaterThan(0);
    }
  });

  it("no candidate was selected because it seemed likely to make the evaluator fail (reasoning does not reference predicted evaluator outcomes)", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.classificationEvidence).not.toMatch(/likely to fail|would make DRA fail/i);
    }
  });

  it("the candidate register and every row, including nested groundTruthExamples, are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(c)).toBe(true);
      expect(Object.isFrozen(c.structuralElementsObserved)).toBe(true);
      expect(Object.isFrozen(c.knownRisks)).toBe(true);
      expect(Object.isFrozen(c.visuallyInspectedPages)).toBe(true);
      expect(Object.isFrozen(c.groundTruthExamples)).toBe(true);
      for (const g of c.groundTruthExamples) {
        expect(Object.isFrozen(g)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the FDA 510(k) change candidate (DRA-CAND-024-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-024-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves known candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/510\(k\)/i);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)?.title).toMatch(/Monetary Policy Report/i);
    expect(getCandidateById("DRA-CAND-024-02")?.title).toMatch(/Cybersecurity Framework/i);
    expect(getCandidateById("DRA-CAND-024-03")?.title).toMatch(/Epidemic Threshold/i);
    expect(getCandidateById("DRA-CAND-024-99")).toBeUndefined();
  });

  it("primaryCandidate returns the FDA 510(k) change guidance and is QUALIFIED_RECOMMENDED", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED governance, byte-stable accessibility, a confirmed classification, native representation, visual verification, and an internal control pair", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.proposedCorpusId).toBe("DRA-DOC-0028");
  });

  it("covers every field required by the DRA-ACQ-024 task specification", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.governance).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition.graphicSemanticClassification).toBe("MATERIAL_GRAPHIC_SEMANTICS");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.evidenceContribution).toBe("string");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.corpusContribution).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.risks.length).toBeGreaterThan(0);
    expect(typeof PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning.length).toBeGreaterThan(50);
  });

  it("names the deferred candidate as the next-best option if the primary is rejected", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_1_CANDIDATE_ID);
  });

  it("discloses the domain/jurisdiction non-diversification limitation rather than omitting it", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.corpusContribution).toMatch(/adds no new domain/i);
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
// Part 6 — DRA-ENG-015 / DRA-ENG-017 interaction analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 6: DRA-ENG-015 / DRA-ENG-017 Interaction Analysis", () => {
  it("concludes the primary candidate has no overlap with the fill-colour or OCR-provenance dimensions", () => {
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.eng015OverlapWithPrimaryCandidate).toBe(false);
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.eng017OverlapWithPrimaryCandidate).toBe(false);
  });

  it("acknowledges a genuine partial overlap on the deferred alternate rather than glossing over it", () => {
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.eng015OverlapWithDeferredAlternate).toBe(true);
  });

  it("concludes neither existing detector solves graphics-semantics on its own", () => {
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.doesEitherExistingDetectorSolveGraphicsSemantics).toBe(false);
  });

  it("does not propose an architectural change now", () => {
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.architecturalChangeRequiredNow).toBe(false);
  });

  it("is frozen and observation-only", () => {
    expect(Object.isFrozen(ENG_015_ENG_017_INTERACTION_ANALYSIS)).toBe(true);
    expect(Object.isFrozen(ENG_015_ENG_017_INTERACTION_ANALYSIS.graphicsSemanticsRequires)).toBe(true);
    expect(ENG_015_ENG_017_INTERACTION_ANALYSIS.note).toMatch(/observation only/i);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-024 — Part 7: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0028 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0028");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0028");
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-024 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0028",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_024",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "modify_dra_eng_015_detector",
      "modify_dra_eng_017_provenance_model",
      "build_or_invoke_computer_vision_or_chart_parsing",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_any_graphics_semantics_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0028");
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
