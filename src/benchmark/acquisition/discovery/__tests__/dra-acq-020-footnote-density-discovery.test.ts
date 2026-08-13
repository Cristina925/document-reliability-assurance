/**
 * DRA-ACQ-020 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0024 (Footnote-Density Robustness Probe)
 *
 * Proves the corpus context, candidate-selection priority, desired
 * structural-element list, candidate register, ranking, Phase 1
 * qualification verdict, qualification record, and Phase 1 scope boundary
 * recorded in dra-acq-020-footnote-density-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from today's live-source re-verification (recorded as fixed data
 * in the module under test).
 */

import { describe, it, expect } from "vitest";

import {
  CORPUS_FOOTNOTE_CONTEXT,
  CORPUS_PROFILE_SUMMARY,
  CANDIDATE_SELECTION_PRIORITY,
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
} from "../dra-acq-020-footnote-density-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Corpus context integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-020 — Part 1: Relevant Corpus Context", () => {
  it("records DRA-DOC-0023 as the sole known footnote-bearing document and origin of the flattening defect", () => {
    expect(CORPUS_FOOTNOTE_CONTEXT.length).toBe(1);
    expect(CORPUS_FOOTNOTE_CONTEXT[0]!.corpusId).toBe("DRA-DOC-0023");
    expect(CORPUS_FOOTNOTE_CONTEXT[0]!.hasFootnoteStructure).toBe(true);
    expect(CorpusIdSchema.parse(CORPUS_FOOTNOTE_CONTEXT[0]!.corpusId)).toBe("DRA-DOC-0023");
  });

  it("every corpus-context row uses a valid schema domain and documentType", () => {
    for (const row of CORPUS_FOOTNOTE_CONTEXT) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("records the 23-document corpus totals and the footnote-flattening defect summary", () => {
    expect(CORPUS_PROFILE_SUMMARY.totalDocuments).toBe(23);
    expect(CORPUS_PROFILE_SUMMARY.realAcquisitions).toBe(17);
    expect(CORPUS_PROFILE_SUMMARY.footnoteFlatteningDefectOrigin).toBe("DRA-DOC-0023");
    expect(CORPUS_PROFILE_SUMMARY.footnoteFlatteningDefectSummary).toMatch(/flatten/i);
    expect(CORPUS_PROFILE_SUMMARY.footnoteFlatteningDefectSummary.length).toBeGreaterThan(20);
  });

  it("discloses that TECHNICAL/GENERAL domain balance is not improved by this acquisition", () => {
    expect(CORPUS_PROFILE_SUMMARY.domainNote).toMatch(/not on domain-balance improvement/i);
  });

  it("does not alter the frozen evaluator identity (0.1.2 / 1.0 / 0.1.0)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
    expect(DRA_PIPELINE_VERSION).toBe("1.0");
    expect(DRA_MODEL_VERSION).toBe("0.1.0");
  });

  it("CORPUS_FOOTNOTE_CONTEXT and every row are frozen", () => {
    expect(Object.isFrozen(CORPUS_FOOTNOTE_CONTEXT)).toBe(true);
    for (const row of CORPUS_FOOTNOTE_CONTEXT) expect(Object.isFrozen(row)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Candidate-selection priority and structural elements
// ---------------------------------------------------------------------------

describe("DRA-ACQ-020 — Part 2: Candidate-Selection Priority and Structural Elements", () => {
  it("records exactly 10 selection priorities, ranked 1..10, with 'different publisher from CMA' first", () => {
    expect(CANDIDATE_SELECTION_PRIORITY.length).toBe(10);
    const ranks = CANDIDATE_SELECTION_PRIORITY.map((p) => p.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(CANDIDATE_SELECTION_PRIORITY[0]!.key).toBe("different_publisher_from_cma");
    expect(CANDIDATE_SELECTION_PRIORITY[9]!.key).toBe("no_governance_weakening");
  });

  it("includes the anti-contamination priority items (not selecting for predicted failure, not weakening governance)", () => {
    const keys = CANDIDATE_SELECTION_PRIORITY.map((p) => p.key);
    expect(keys).toContain("not_selected_for_likely_failure");
    expect(keys).toContain("no_governance_weakening");
  });

  it("records a non-empty, de-duplicated list of desired structural elements", () => {
    expect(DESIRED_STRUCTURAL_ELEMENTS.length).toBeGreaterThan(5);
    expect(new Set(DESIRED_STRUCTURAL_ELEMENTS).size).toBe(DESIRED_STRUCTURAL_ELEMENTS.length);
    expect(DESIRED_STRUCTURAL_ELEMENTS).toContain("footnote_markers_confirmed_superscript_in_rendered_pdf");
  });

  it("CANDIDATE_SELECTION_PRIORITY and DESIRED_STRUCTURAL_ELEMENTS are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_SELECTION_PRIORITY)).toBe(true);
    for (const p of CANDIDATE_SELECTION_PRIORITY) expect(Object.isFrozen(p)).toBe(true);
    expect(Object.isFrozen(DESIRED_STRUCTURAL_ELEMENTS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-020 — Part 3: Candidate Register", () => {
  it("records exactly 3 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(3);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-020-\d{2}$/);
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

  it("no candidate is DRA-DOC-0023's own publisher (CMA) — this programme requires a different publisher", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.publisher).not.toMatch(/Competition and Markets Authority/i);
    }
  });

  it("every non-QUALIFIED_RECOMMENDED candidate has a non-null rejectionOrDeferralReason", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome !== "QUALIFIED_RECOMMENDED") {
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

  it("every BLOCKED candidate has an empty structuralElementsObserved list", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.structuralElementsObserved.length).toBe(0);
        expect(c.footnoteCountObserved).toBeNull();
      }
    }
  });

  it("the primary candidate is the only candidate with a VERIFIED licence status and confirmed superscript markers", () => {
    const verifiedLicence = CANDIDATE_REGISTER.filter((c) => c.licenceReuseStatus === "VERIFIED");
    expect(verifiedLicence.length).toBe(1);
    expect(verifiedLicence[0]!.candidateId).toBe(PRIMARY_CANDIDATE_ID);

    const confirmedSuperscript = CANDIDATE_REGISTER.filter((c) => c.footnoteMarkersConfirmedSuperscript === true);
    expect(confirmedSuperscript.length).toBe(1);
    expect(confirmedSuperscript[0]!.candidateId).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("the primary candidate has substantially higher footnote density than either alternate", () => {
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    const alt1 = getCandidateById(ALTERNATE_1_CANDIDATE_ID)!;
    expect(primary.footnoteCountObserved).toBeGreaterThan(100);
    expect(alt1.footnoteCountObserved).not.toBeNull();
    expect(primary.footnoteCountObserved!).toBeGreaterThan(alt1.footnoteCountObserved!);
  });

  it("the candidate register and every row are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(c)).toBe(true);
      expect(Object.isFrozen(c.structuralElementsObserved)).toBe(true);
      expect(Object.isFrozen(c.knownRisks)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-020 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the CRS report (DRA-CAND-020-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-020-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("ranks the BLOCKED candidate (DRA-CAND-020-03) strictly last", () => {
    expect(RANKED_CANDIDATE_IDS[RANKED_CANDIDATE_IDS.length - 1]).toBe(ALTERNATE_2_CANDIDATE_ID);
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves known candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/Regulating Artificial Intelligence/i);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)?.title).toMatch(/Post Office/i);
    expect(getCandidateById(ALTERNATE_2_CANDIDATE_ID)?.title).toMatch(/AI content labelling/i);
    expect(getCandidateById("DRA-CAND-020-99")).toBeUndefined();
  });

  it("primaryCandidate returns the CRS report and is QUALIFIED_RECOMMENDED", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED official source, VERIFIED licence, byte-stable accessibility, and confirmed superscript footnotes", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-020 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.proposedCorpusId).toBe("DRA-DOC-0024");
  });

  it("covers every field required by the DRA-ACQ-020 task specification", () => {
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

  it("discloses the domain non-improvement limitation rather than omitting it", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.corpusContribution).toMatch(/does not improve domain balance/i);
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

describe("DRA-ACQ-020 — Part 6: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0024 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0024");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0024");
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-020 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0024",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_024",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_el_footnote_ref",
      "modify_existing_frozen_artefacts",
      "modify_dra_doc_0023",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_the_footnote_flattening_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0024");
    expect(PROPOSED_PHASE_2_SCOPE).toContain(
      "compare_dra_doc_0024s_footnote_linkage_outcome_against_dra_doc_0023s_category_b_defect",
    );
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
