/**
 * DRA-ACQ-021 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0025 (Tabular Semantic Preservation Robustness Probe)
 *
 * Proves the programme context, target failure modes, desired structural
 * elements, candidate register, ranking, Phase 1 qualification verdict,
 * qualification record, and Phase 1 scope boundary recorded in
 * dra-acq-021-tabular-structure-discovery.ts.
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
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  PHASE_1_QUALIFICATION_RECORD,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-021-tabular-structure-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 1: Programme Context", () => {
  it("records the 24-document corpus size and DRA-DOC-0024 as the prior probe", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(24);
    expect(PROGRAMME_CONTEXT.priorRobustnessProbe.corpusId).toBe("DRA-DOC-0024");
    expect(CorpusIdSchema.parse(PROGRAMME_CONTEXT.priorRobustnessProbe.corpusId)).toBe("DRA-DOC-0024");
  });

  it("records the DRA-ACQ-020 findings that retire footnote-density as a further target", () => {
    expect(PROGRAMME_CONTEXT.priorRobustnessProbe.findings.length).toBeGreaterThan(3);
    expect(PROGRAMME_CONTEXT.priorRobustnessProbe.findings.join(" ")).toMatch(/does not predict downstream/i);
  });

  it("sets the new target dimension to complex tables, not footnote density", () => {
    expect(PROGRAMME_CONTEXT.newTargetDimension).toBe("complex_tables_and_tabular_semantic_preservation");
    expect(PROGRAMME_CONTEXT.newTargetRationale).toMatch(/tabular|table/i);
  });

  it("does not alter the frozen evaluator identity (0.1.2 / 1.0 / 0.1.0)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
    expect(DRA_PIPELINE_VERSION).toBe("1.0");
    expect(DRA_MODEL_VERSION).toBe("0.1.0");
  });

  it("PROGRAMME_CONTEXT and nested collections are frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
    expect(Object.isFrozen(PROGRAMME_CONTEXT.priorRobustnessProbe.findings)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Target failure modes and structural elements
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 2: Target Failure Modes and Structural Elements", () => {
  it("records all 11 target failure modes verbatim from the task specification", () => {
    expect(TARGET_FAILURE_MODES.length).toBe(11);
    expect(TARGET_FAILURE_MODES).toContain("table_headers_becoming_detached_from_values");
    expect(TARGET_FAILURE_MODES).toContain("merged_cell_relationships_being_lost");
    expect(TARGET_FAILURE_MODES).toContain("numeric_values_losing_units_or_contextual_labels");
  });

  it("records a non-empty, de-duplicated list of desired structural elements including a visual-only cue", () => {
    expect(DESIRED_STRUCTURAL_ELEMENTS.length).toBeGreaterThan(10);
    expect(new Set(DESIRED_STRUCTURAL_ELEMENTS).size).toBe(DESIRED_STRUCTURAL_ELEMENTS.length);
    expect(DESIRED_STRUCTURAL_ELEMENTS).toContain("visual_only_semantic_cue_not_present_in_extracted_text");
  });

  it("TARGET_FAILURE_MODES and DESIRED_STRUCTURAL_ELEMENTS are frozen", () => {
    expect(Object.isFrozen(TARGET_FAILURE_MODES)).toBe(true);
    expect(Object.isFrozen(DESIRED_STRUCTURAL_ELEMENTS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 3: Candidate Register", () => {
  it("records exactly 3 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(3);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-021-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(HTTP_ACCESSIBILITY_STATUSES).toContain(c.httpAccessibility);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
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

  it("no BLOCKED-accessibility candidate is marked QUALIFIED_RECOMMENDED or QUALIFIED_ALTERNATE", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.qualificationOutcome).toBe("REJECTED_BLOCKED");
      }
    }
  });

  it("every BLOCKED candidate has an empty structuralElementsObserved and visuallyInspectedPages list", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.structuralElementsObserved.length).toBe(0);
        expect(c.visuallyInspectedPages.length).toBe(0);
        expect(c.tableCountObserved).toBeNull();
      }
    }
  });

  it("every non-BLOCKED candidate has at least one visually inspected page (mandatory visual verification)", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility !== "BLOCKED") {
        expect(c.visuallyInspectedPages.length).toBeGreaterThan(0);
      }
    }
  });

  it("the primary candidate is the only candidate with a documented visual-only semantic cue", () => {
    const withVisualCue = CANDIDATE_REGISTER.filter((c) =>
      c.structuralElementsObserved.includes("visual_only_semantic_cue_not_present_in_extracted_text"),
    );
    expect(withVisualCue.length).toBe(1);
    expect(withVisualCue[0]!.candidateId).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("the primary candidate observes at least as many structural elements as the alternate", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const alt1 = getCandidateById(ALTERNATE_1_CANDIDATE_ID)!;
    expect(primary.structuralElementsObserved.length).toBeGreaterThanOrEqual(alt1.structuralElementsObserved.length);
  });

  it("no candidate was selected because it seemed likely to make the evaluator fail (reasoning does not reference predicted evaluator outcomes)", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.structuralEvidenceNote).not.toMatch(/likely to fail|would make DRA fail/i);
    }
  });

  it("the candidate register and every row are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(c)).toBe(true);
      expect(Object.isFrozen(c.structuralElementsObserved)).toBe(true);
      expect(Object.isFrozen(c.knownRisks)).toBe(true);
      expect(Object.isFrozen(c.visuallyInspectedPages)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the EIA STEO candidate (DRA-CAND-021-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-021-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("ranks the BLOCKED candidate (DRA-CAND-021-03) strictly last", () => {
    expect(RANKED_CANDIDATE_IDS[RANKED_CANDIDATE_IDS.length - 1]).toBe(ALTERNATE_2_CANDIDATE_ID);
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves known candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/Short-Term Energy Outlook/i);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)?.title).toMatch(/Survey of Consumer Finances/i);
    expect(getCandidateById(ALTERNATE_2_CANDIDATE_ID)?.title).toMatch(/Budget and Economic Outlook/i);
    expect(getCandidateById("DRA-CAND-021-99")).toBeUndefined();
  });

  it("primaryCandidate returns the EIA STEO report and is QUALIFIED_RECOMMENDED", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED official source, VERIFIED licence, byte-stable accessibility, visual verification, and rich structure", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.proposedCorpusId).toBe("DRA-DOC-0025");
  });

  it("covers every field required by the DRA-ACQ-021 task specification", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.governance).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition).toBeDefined();
    expect(typeof PHASE_1_QUALIFICATION_RECORD.evidenceContribution).toBe("string");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.corpusContribution).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.risks.length).toBeGreaterThan(0);
    expect(typeof PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning.length).toBeGreaterThan(50);
  });

  it("names both alternates as the next-best candidates if rejected", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_1_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_2_CANDIDATE_ID);
  });

  it("discloses the domain/jurisdiction non-diversification limitation rather than omitting it", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.corpusContribution).toMatch(/does not diversify domain/i);
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
// Part 6 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-021 — Part 6: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0025 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0025");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0025");
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-021 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0025",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_025",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "modify_dra_doc_0024",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_any_tabular_extraction_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0025");
    expect(PROPOSED_PHASE_2_SCOPE).toContain(
      "assess_whether_the_historical_vs_forecast_shading_distinction_is_silently_lost_or_correctly_treated_as_unknowable",
    );
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
