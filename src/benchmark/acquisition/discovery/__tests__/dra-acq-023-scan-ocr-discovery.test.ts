/**
 * DRA-ACQ-023 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0027 (Scan/OCR Representation Robustness Probe)
 *
 * Proves the programme context, representation classification taxonomy,
 * target failure modes, candidate register, ranking, Phase 1
 * qualification verdict, qualification record, DRA-ENG-015 interaction
 * analysis, and Phase 1 scope boundary recorded in
 * dra-acq-023-scan-ocr-discovery.ts.
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
  REPRESENTATION_CLASSIFICATIONS,
  EVIDENTIARY_OBJECT_KINDS,
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
  ALTERNATE_2_CANDIDATE_ID,
  ALTERNATE_3_CANDIDATE_ID,
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  PHASE_1_QUALIFICATION_RECORD,
  ENG_015_INTERACTION_ANALYSIS,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-023-scan-ocr-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-023 — Part 1: Programme Context", () => {
  it("records the 26-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(26);
  });

  it("excludes footnote, table-shading, and citation dimensions per the task specification", () => {
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("footnote_or_citation_marker_flattening");
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("table_or_cell_shading_structural_loss");
    expect(PROGRAMME_CONTEXT.excludedDimensions).toContain("ordinary_scientific_citation_linkage");
  });

  it("sets the new target dimension to scan/OCR representation fidelity", () => {
    expect(PROGRAMME_CONTEXT.newTargetDimension).toBe("scan_and_ocr_representation_fidelity");
    expect(PROGRAMME_CONTEXT.newTargetRationale).toMatch(/ocr|scan/i);
  });

  it("records the central research question verbatim in substance", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/faithfully represented/i);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/page imagery/i);
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
// Part 2 — Representation classification taxonomy and failure modes
// ---------------------------------------------------------------------------

describe("DRA-ACQ-023 — Part 2: Representation Classification and Failure Modes", () => {
  it("defines exactly the four representation classifications named by the task specification", () => {
    expect(REPRESENTATION_CLASSIFICATIONS.length).toBe(4);
    expect(REPRESENTATION_CLASSIFICATIONS).toEqual([
      "NATIVE_TEXT",
      "OCR_TEXT_LAYER",
      "IMAGE_ONLY",
      "MIXED_REPRESENTATION",
    ]);
  });

  it("defines the four distinct evidentiary object kinds", () => {
    expect(EVIDENTIARY_OBJECT_KINDS).toEqual([
      "SOURCE_IMAGE",
      "NATIVE_TEXT_LAYER",
      "OCR_OUTPUT",
      "DRA_CANONICAL_REPRESENTATION",
    ]);
  });

  it("records all 6 target failure modes from the task specification", () => {
    expect(TARGET_FAILURE_MODES.length).toBe(6);
    expect(TARGET_FAILURE_MODES).toContain("complete_representation_failure_no_usable_text");
    expect(TARGET_FAILURE_MODES).toContain("silent_incompleteness_plausible_text_but_unknowable_image_only_loss");
  });

  it("records a non-empty, de-duplicated list of desired structural elements", () => {
    expect(DESIRED_STRUCTURAL_ELEMENTS.length).toBeGreaterThan(10);
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

describe("DRA-ACQ-023 — Part 3: Candidate Register", () => {
  it("records exactly 4 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(4);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-023-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(HTTP_ACCESSIBILITY_STATUSES).toContain(c.httpAccessibility);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
      if (c.representationClassification !== null) {
        expect(REPRESENTATION_CLASSIFICATIONS).toContain(c.representationClassification);
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

  it("no BLOCKED-accessibility candidate is marked QUALIFIED_RECOMMENDED, QUALIFIED_ALTERNATE, or DEFERRED", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.qualificationOutcome).toBe("REJECTED_BLOCKED");
      }
    }
  });

  it("every BLOCKED candidate has an empty structuralElementsObserved, visuallyInspectedPages, and groundTruthExamples list, and a null representationClassification", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.structuralElementsObserved.length).toBe(0);
        expect(c.visuallyInspectedPages.length).toBe(0);
        expect(c.groundTruthExamples.length).toBe(0);
        expect(c.representationClassification).toBeNull();
      }
    }
  });

  it("every QUALIFIED_RECOMMENDED or QUALIFIED_ALTERNATE candidate has a confirmed representation classification and at least one visually inspected page", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(c.representationClassification).not.toBeNull();
        expect(c.visuallyInspectedPages.length).toBeGreaterThan(0);
      }
    }
  });

  it("the primary candidate has at least two observed ground-truth mismatches (real, not hypothetical, defects)", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const mismatches = primary.groundTruthExamples.filter((g) => !g.matchesVisualGroundTruth);
    expect(mismatches.length).toBeGreaterThanOrEqual(2);
  });

  it("the primary candidate also has at least one confirmed-clean (matching) ground-truth example for contrast", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const clean = primary.groundTruthExamples.filter((g) => g.matchesVisualGroundTruth);
    expect(clean.length).toBeGreaterThanOrEqual(1);
  });

  it("the primary candidate observes at least as many structural elements as the first alternate", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const alt1 = getCandidateById(ALTERNATE_1_CANDIDATE_ID)!;
    expect(primary.structuralElementsObserved.length).toBeGreaterThanOrEqual(alt1.structuralElementsObserved.length);
  });

  it("the deferred candidate is the only one classified MIXED_REPRESENTATION", () => {
    const mixed = CANDIDATE_REGISTER.filter((c) => c.representationClassification === "MIXED_REPRESENTATION");
    expect(mixed.length).toBe(1);
    expect(mixed[0]!.candidateId).toBe(ALTERNATE_2_CANDIDATE_ID);
    expect(mixed[0]!.qualificationOutcome).toBe("DEFERRED");
  });

  it("no candidate was selected because it seemed likely to make the evaluator fail (reasoning does not reference predicted evaluator outcomes)", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.structuralEvidenceNote).not.toMatch(/likely to fail|would make DRA fail/i);
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

describe("DRA-ACQ-023 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the GovInfo CHRG candidate (DRA-CAND-023-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-023-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("ranks the BLOCKED candidate (DRA-CAND-023-04) strictly last", () => {
    expect(RANKED_CANDIDATE_IDS[RANKED_CANDIDATE_IDS.length - 1]).toBe(ALTERNATE_3_CANDIDATE_ID);
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves known candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/Metric System/i);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)?.title).toMatch(/Useless Papers/i);
    expect(getCandidateById(ALTERNATE_2_CANDIDATE_ID)?.title).toMatch(/IG Farben/i);
    expect(getCandidateById(ALTERNATE_3_CANDIDATE_ID)?.title).toMatch(/FAMILY JEWELS/i);
    expect(getCandidateById("DRA-CAND-023-99")).toBeUndefined();
  });

  it("primaryCandidate returns the CHRG metric-system hearing and is QUALIFIED_RECOMMENDED", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED governance, byte-stable accessibility, a confirmed classification, visual verification, and an observed mismatch", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-023 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.proposedCorpusId).toBe("DRA-DOC-0027");
  });

  it("covers every field required by the DRA-ACQ-023 task specification", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.governance).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition.representationClassification).toBe("OCR_TEXT_LAYER");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.evidenceContribution).toBe("string");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.corpusContribution).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.risks.length).toBeGreaterThan(0);
    expect(typeof PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning.length).toBeGreaterThan(50);
  });

  it("names all three non-primary candidates as the next-best options if rejected", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_1_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_2_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_3_CANDIDATE_ID);
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
// Part 6 — DRA-ENG-015 interaction analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-023 — Part 6: DRA-ENG-015 Interaction Analysis", () => {
  it("concludes the fill-colour detector does not solve scan/OCR integrity", () => {
    expect(ENG_015_INTERACTION_ANALYSIS.doesFillColourDetectorSolveScanOcr).toBe(false);
    expect(ENG_015_INTERACTION_ANALYSIS.reasoning).toMatch(/fill-colour/i);
  });

  it("does not propose an architectural change now", () => {
    expect(ENG_015_INTERACTION_ANALYSIS.architecturalChangeRequiredNow).toBe(false);
  });

  it("lists at least the three requirement categories named by the task specification", () => {
    expect(ENG_015_INTERACTION_ANALYSIS.scanOcrRequires).toContain("another_decoupled_representation_integrity_signal_distinct_from_dra_eng_015");
    expect(ENG_015_INTERACTION_ANALYSIS.scanOcrRequires).toContain("explicit_uncertainty_surfaced_to_downstream_consumers_rather_than_silently_trusted_ocr_text");
  });

  it("is frozen and observation-only", () => {
    expect(Object.isFrozen(ENG_015_INTERACTION_ANALYSIS)).toBe(true);
    expect(Object.isFrozen(ENG_015_INTERACTION_ANALYSIS.scanOcrRequires)).toBe(true);
    expect(ENG_015_INTERACTION_ANALYSIS.note).toMatch(/observation only/i);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-023 — Part 7: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0027 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0027");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0027");
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-023 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0027",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_027",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "modify_dra_eng_015_detector",
      "modify_dra_eng_016_detector",
      "add_ocr_to_the_production_pipeline",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_any_scan_or_ocr_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0027");
    expect(PROPOSED_PHASE_2_SCOPE).toContain(
      "assess_whether_the_hechler_hemmer_name_substitution_and_stamp_interference_propagate_into_statement_extraction_evidence_linkage_or_materiality",
    );
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
