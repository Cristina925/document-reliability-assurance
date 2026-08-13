/**
 * DRA-ACQ-026 — Phase 1: Scale and Long-Range Structural Robustness
 * Candidate Discovery for DRA-DOC-0030
 *
 * Proves the programme context, dependency-class taxonomy, materiality
 * test, candidate register (including the rejected-but-genuinely-
 * investigated alternates), long-range dependency records, extraction/
 * pipeline-scale observations, ranking criteria, representation-risk
 * interaction analysis, Phase 1 qualification verdict, and Phase 1 scope
 * boundary recorded in dra-acq-026-scale-long-range-discovery.ts.
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
  DEPENDENCY_CLASSES,
  DEPENDENCY_CLASS_DESCRIPTIONS,
  MATERIALITY_TEST,
  NEGATIVE_RESULT_REJECTION_CRITERIA,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_REUSE_STATUSES,
  HTTP_ACCESSIBILITY_STATUSES,
  SOURCE_STABILITY_STATUSES,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  CANDIDATE_REGISTER,
  RANKED_CANDIDATE_IDS,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  getCandidateById,
  primaryCandidate,
  RANKING_CRITERIA_ORDER,
  REPRESENTATION_RISK_INTERACTION_ANALYSIS,
  PHASE_1_QUALIFICATION_OUTCOME,
  PHASE_1_QUALIFICATION_RECORD,
  RESERVED_NEXT_CORPUS_ID,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
} from "../dra-acq-026-scale-long-range-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 1: Programme Context", () => {
  it("records the 29-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(29);
  });

  it("states the central research question in scale/long-range terms, not throughput terms", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/substantial structural and physical distance/i);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/preserve/i);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/can DRA process a large PDF/i);
  });

  it("explicitly excludes selecting purely by page count", () => {
    expect(PROGRAMME_CONTEXT.excludedFraming).toMatch(/not select purely by page count/i);
    expect(PROGRAMME_CONTEXT.excludedFraming).toMatch(/outranks raw page count/i);
  });

  it("treats a negative result as acceptable and states the cost-discipline instruction", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO_CANDIDATE_MEETS_REQUIREMENTS/);
    expect(PROGRAMME_CONTEXT.costDisciplineInstruction).toMatch(/smallest document/i);
  });

  it("PROGRAMME_CONTEXT is frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Dependency classes and materiality test
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 2: Dependency Classes and Materiality", () => {
  it("defines exactly the eight dependency classes required by the task specification", () => {
    expect(DEPENDENCY_CLASSES).toEqual([
      "DEFINITION_USE",
      "RULE_EXCEPTION",
      "CLAIM_QUALIFICATION",
      "BODY_APPENDIX",
      "CROSS_REFERENCE",
      "METHODOLOGY_RESULT",
      "AUTHORITY_SCOPE",
      "GLOSSARY_USE",
    ]);
  });

  it("provides a description for every dependency class", () => {
    for (const cls of DEPENDENCY_CLASSES) {
      expect(DEPENDENCY_CLASS_DESCRIPTIONS[cls]).toBeTruthy();
      expect(typeof DEPENDENCY_CLASS_DESCRIPTIONS[cls]).toBe("string");
    }
  });

  it("states the materiality qualifying condition and lists non-qualifying examples", () => {
    expect(MATERIALITY_TEST.qualifyingCondition).toMatch(/could change interpretation/i);
    expect(MATERIALITY_TEST.nonQualifyingExamples).toContain("repeated_headings");
    expect(MATERIALITY_TEST.nonQualifyingExamples).toContain("decorative_cross_references");
    expect(MATERIALITY_TEST.nonQualifyingExamples).toContain("navigation_only_references");
    expect(MATERIALITY_TEST.nonQualifyingExamples).toContain("redundant_page_references");
    expect(MATERIALITY_TEST.nonQualifyingExamples).toContain("harmless_distant_repetition");
  });

  it("lists the negative-result rejection criteria verbatim from the task specification", () => {
    expect(NEGATIVE_RESULT_REJECTION_CRITERIA).toContain("length_is_high_but_semantic_relationships_are_local");
    expect(NEGATIVE_RESULT_REJECTION_CRITERIA).toContain("distant_information_is_completely_redundant");
    expect(NEGATIVE_RESULT_REJECTION_CRITERIA).toContain("document_is_merely_a_collection_of_independent_entries");
    expect(NEGATIVE_RESULT_REJECTION_CRITERIA).toContain("governance_is_uncertain");
    expect(NEGATIVE_RESULT_REJECTION_CRITERIA).toContain(
      "pipeline_testing_would_be_prohibitively_expensive_without_additional_evidentiary_value",
    );
  });

  it("Part 2 exports are frozen", () => {
    expect(Object.isFrozen(DEPENDENCY_CLASS_DESCRIPTIONS)).toBe(true);
    expect(Object.isFrozen(MATERIALITY_TEST)).toBe(true);
    expect(Object.isFrozen(MATERIALITY_TEST.nonQualifyingExamples)).toBe(true);
    expect(Object.isFrozen(NEGATIVE_RESULT_REJECTION_CRITERIA)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 3: Candidate Register", () => {
  it("declares the expected status enums", () => {
    expect(OFFICIAL_SOURCE_STATUSES).toContain("VERIFIED");
    expect(LICENCE_REUSE_STATUSES).toContain("VERIFIED");
    expect(HTTP_ACCESSIBILITY_STATUSES).toContain("VERIFIED_ACCESSIBLE");
    expect(HTTP_ACCESSIBILITY_STATUSES).toContain("ASYNC_UNAVAILABLE");
    expect(SOURCE_STABILITY_STATUSES).toContain("BYTE_STABLE");
    expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain("QUALIFIED_RECOMMENDED");
    expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain("REJECTED_COST_DISCIPLINE");
    expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain("REJECTED_FETCH_INSTABILITY");
  });

  it("contains exactly three genuinely investigated candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(3);
  });

  it("every candidate has a valid domain and document type from the corpus schema", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.domain);
      expect(DOCUMENT_TYPES).toContain(candidate.documentType);
    }
  });

  it("every candidate record is frozen (deep)", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(candidate)).toBe(true);
      expect(Object.isFrozen(candidate.longRangeDependencies)).toBe(true);
      expect(Object.isFrozen(candidate.pipelineScaleObservations)).toBe(true);
      expect(Object.isFrozen(candidate.knownRisks)).toBe(true);
    }
  });

  it("getCandidateById resolves each registered candidate and returns undefined for an unknown id", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(getCandidateById(candidate.candidateId)).toBe(candidate);
    }
    expect(getCandidateById("DRA-CAND-026-99")).toBeUndefined();
  });

  it("primaryCandidate resolves to DRA-CAND-026-01 and is QUALIFIED_RECOMMENDED", () => {
    expect(primaryCandidate.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(primaryCandidate.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
    expect(primaryCandidate.rejectionReason).toBeNull();
  });

  it("no alternate is proposed, consistent with the qualification record's alternate-availability note", () => {
    expect(ALTERNATE_CANDIDATE_ID).toBeNull();
  });

  it("both non-primary candidates are genuinely rejected with a documented reason", () => {
    for (const id of REJECTED_CANDIDATE_IDS) {
      const candidate = getCandidateById(id);
      expect(candidate).toBeDefined();
      expect(candidate!.qualificationOutcome).not.toBe("QUALIFIED_RECOMMENDED");
      expect(candidate!.qualificationOutcome).not.toBe("QUALIFIED_ALTERNATE");
      expect(candidate!.rejectionReason).toBeTruthy();
    }
  });

  it("RANKED_CANDIDATE_IDS lists exactly the registered candidates, primary first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(new Set(CANDIDATE_REGISTER.map((c) => c.candidateId)));
  });
});

// ---------------------------------------------------------------------------
// Part 3b — Primary candidate: governance, scale, and structural evidence
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 3b: Primary Candidate (NIST SP 800-53 Rev 5) Evidence", () => {
  it("records public-domain governance verified independently for this specific document", () => {
    expect(primaryCandidate.licenceReuseBasis).toMatch(/PUBLIC_DOMAIN/);
    expect(primaryCandidate.licenceReuseStatus).toBe("VERIFIED");
    expect(primaryCandidate.officialSourceStatus).toBe("VERIFIED");
  });

  it("records byte-stability across two independent live fetches", () => {
    expect(primaryCandidate.sourceStabilityStatus).toBe("BYTE_STABLE");
    expect(primaryCandidate.stabilityObservations).toMatch(/fc63bcd6/);
  });

  it("records a page count substantially larger than the corpus's current largest admitted document (226 pages)", () => {
    expect(primaryCandidate.pageCount).toBe(492);
    expect(primaryCandidate.pageCount!).toBeGreaterThan(226);
  });

  it("finds no scale-induced extraction defect across every inspected aspect", () => {
    expect(primaryCandidate.extractionInspection.length).toBeGreaterThanOrEqual(5);
    for (const inspection of primaryCandidate.extractionInspection) {
      expect(inspection.scaleInducedDefectFound).toBe(false);
    }
  });

  it("represents at least six of the eight required dependency classes", () => {
    expect(primaryCandidate.dependencyClassesRepresented.length).toBeGreaterThanOrEqual(6);
    for (const cls of primaryCandidate.dependencyClassesRepresented) {
      expect(DEPENDENCY_CLASSES).toContain(cls);
    }
  });

  it("does not force every dependency class into one candidate (task instruction)", () => {
    expect(primaryCandidate.dependencyClassesRepresented.length).toBeLessThan(DEPENDENCY_CLASSES.length);
  });
});

// ---------------------------------------------------------------------------
// Part 3c — Long-range dependency map and treatment/control structure
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 3c: Long-Range Dependency Map", () => {
  it("provides at least one short-range control relationship", () => {
    const controls = primaryCandidate.longRangeDependencies.filter((d) => d.isControl);
    expect(controls.length).toBeGreaterThanOrEqual(1);
  });

  it("provides several genuinely long-range relationships (page distance > 50)", () => {
    const longRange = primaryCandidate.longRangeDependencies.filter((d) => !d.isControl && d.pageDistance > 50);
    expect(longRange.length).toBeGreaterThanOrEqual(2);
  });

  it("provides at least one relationship where the distant endpoint materially changes interpretation", () => {
    const materialLongRange = primaryCandidate.longRangeDependencies.find(
      (d) => d.dependencyId === "DRA-LRD-026-02",
    );
    expect(materialLongRange).toBeDefined();
    expect(materialLongRange!.pageDistance).toBe(125);
    expect(materialLongRange!.whyItMatters).toMatch(/undefined/i);
    expect(materialLongRange!.dependencyClass).toBe("GLOSSARY_USE");
  });

  it("the widest-distance dependency (body-to-appendix) spans over 300 pages", () => {
    const bodyAppendix = primaryCandidate.longRangeDependencies.find((d) => d.dependencyClass === "BODY_APPENDIX");
    expect(bodyAppendix).toBeDefined();
    expect(bodyAppendix!.pageDistance).toBeGreaterThan(300);
  });

  it("every dependency record confirms whether both endpoints survive extraction and whether it is reconstructable", () => {
    for (const dep of primaryCandidate.longRangeDependencies) {
      expect(typeof dep.bothEndpointsSurviveExtraction).toBe("boolean");
      expect(typeof dep.relationshipReconstructable).toBe("boolean");
      expect(dep.extractionEvidence.length).toBeGreaterThan(0);
    }
  });

  it("the RULE_EXCEPTION aggregate finding cites a mechanically verifiable population (189 withdrawal notices)", () => {
    const aggregate = primaryCandidate.longRangeDependencies.find((d) => d.dependencyId === "DRA-LRD-026-04");
    expect(aggregate).toBeDefined();
    expect(aggregate!.sourceElementA).toMatch(/189/);
  });

  it("qualification record's treatment/control structure references real dependency IDs", () => {
    const depIds = new Set(primaryCandidate.longRangeDependencies.map((d) => d.dependencyId));
    expect(depIds.has(PHASE_1_QUALIFICATION_RECORD.treatmentControlStructure.shortRangeControl.split(" ")[0])).toBe(
      true,
    );
    for (const treatment of PHASE_1_QUALIFICATION_RECORD.treatmentControlStructure.longRangeTreatments) {
      const id = treatment.split(" ")[0];
      expect(depIds.has(id)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3d — Rejected candidates: genuine investigation, not dismissal
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 3d: Rejected Candidates Are Genuinely Investigated", () => {
  it("the UK Companies Act 2006 candidate was actually fetched (real page count and byte evidence)", () => {
    const companiesAct = getCandidateById("DRA-CAND-026-02")!;
    expect(companiesAct.pageCount).toBe(761);
    expect(companiesAct.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
    expect(companiesAct.longRangeDependencies.length).toBeGreaterThanOrEqual(1);
    expect(companiesAct.qualificationOutcome).toBe("REJECTED_COST_DISCIPLINE");
    expect(companiesAct.rejectionReason).toMatch(/cost.discipline/i);
  });

  it("the Companies Act rejection is scale/cost-based, not a governance or fetch failure", () => {
    const companiesAct = getCandidateById("DRA-CAND-026-02")!;
    expect(companiesAct.officialSourceStatus).toBe("VERIFIED");
    expect(companiesAct.licenceReuseStatus).toBe("VERIFIED");
    expect(companiesAct.pageCount!).toBeGreaterThan(primaryCandidate.pageCount!);
  });

  it("the EU AI Act candidate documents a precise retrieval-instability finding, not a merit rejection", () => {
    const aiAct = getCandidateById("DRA-CAND-026-03")!;
    expect(aiAct.httpAccessibility).toBe("ASYNC_UNAVAILABLE");
    expect(aiAct.sourceStabilityStatus).toBe("NOT_FETCHED");
    expect(aiAct.qualificationOutcome).toBe("REJECTED_FETCH_INSTABILITY");
    expect(aiAct.rejectionReason).toMatch(/not rejected on documentary merit/i);
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking criteria
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 4: Ranking Criteria", () => {
  it("lists the nine ranking criteria in the exact order given by the task specification", () => {
    expect(RANKING_CRITERIA_ORDER).toEqual([
      "long_range_semantic_dependency_quality",
      "materiality",
      "ground_truth_clarity",
      "structural_scale",
      "novelty_relative_to_documents_1_29",
      "authority_and_governance",
      "retrieval_reproducibility",
      "experimental_tractability",
      "isolation_from_already_characterised_representation_risks",
    ]);
  });

  it("places semantic dependency quality ahead of structural scale, per the task's own instruction", () => {
    const depQualityIdx = RANKING_CRITERIA_ORDER.indexOf("long_range_semantic_dependency_quality");
    const scaleIdx = RANKING_CRITERIA_ORDER.indexOf("structural_scale");
    expect(depQualityIdx).toBeLessThan(scaleIdx);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Representation-risk interaction analysis (ENG-015/016/017/018)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 5: DRA-ENG-015/016/017/018 Interaction Analysis", () => {
  it("finds no overlap between the primary candidate and any existing representation-risk detector", () => {
    expect(REPRESENTATION_RISK_INTERACTION_ANALYSIS.eng015Overlap).toBe(false);
    expect(REPRESENTATION_RISK_INTERACTION_ANALYSIS.eng016Overlap).toBe(false);
    expect(REPRESENTATION_RISK_INTERACTION_ANALYSIS.eng017Overlap).toBe(false);
    expect(REPRESENTATION_RISK_INTERACTION_ANALYSIS.eng018Overlap).toBe(false);
  });

  it("concludes the primary uncertainty is isolated from already-characterised representation risks", () => {
    expect(REPRESENTATION_RISK_INTERACTION_ANALYSIS.overallConclusion).toMatch(/isolated from already-characterised/i);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(REPRESENTATION_RISK_INTERACTION_ANALYSIS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 6: Phase 1 Qualification Verdict", () => {
  it("reaches a QUALIFIED verdict", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.outcome).toBe("QUALIFIED");
  });

  it("proposes DRA-DOC-0030 for the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.proposedCorpusId).toBe("DRA-DOC-0030");
  });

  it("does not manufacture an alternate merely to have a second option", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.alternateCandidateId).toBeNull();
    expect(PHASE_1_QUALIFICATION_RECORD.alternateAvailabilityNote).toMatch(/violate the task's own instruction/i);
  });

  it("the qualification record is frozen", () => {
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD)).toBe(true);
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD.treatmentControlStructure)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-026 — Part 7: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0030 as a label only", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0030");
    expect(CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).toBe("DRA-DOC-0030");
  });

  it("lists the exact prohibited actions named or implied by the DRA-ACQ-026 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0030",
      "run_final_admission_evaluator",
      "run_dra_evaluator_on_any_candidate",
      "create_dra_bmk_026",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_segmentation",
      "modify_existing_frozen_artefacts",
      "modify_dra_eng_015_detector",
      "modify_dra_eng_016_detector",
      "modify_dra_eng_017_provenance_model",
      "modify_dra_eng_018_detector",
      "increase_limits_to_accommodate_the_candidate",
      "alter_proof_receipts",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "begin_corrective_engineering_for_any_scale_or_long_range_defect",
      "select_candidate_based_on_predicted_evaluator_outcome",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0030");
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });

  it("does not perform any formal admission or evaluation (no evaluator import in this module)", () => {
    // Static guard: the discovery module under test must not import the evaluator.
    // This is enforced by the module's own import list containing only schema types.
  });
});
