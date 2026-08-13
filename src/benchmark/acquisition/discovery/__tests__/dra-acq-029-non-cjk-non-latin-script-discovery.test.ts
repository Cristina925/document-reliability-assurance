/**
 * DRA-ACQ-029 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0033 (non-Latin, non-CJK script robustness)
 *
 * Proves the programme context, the robustness evidence map delta since
 * DRA-ACQ-028, the H1-H4 hypothesis findings, the ranking methodology and
 * result, the candidate register (primary, alternate, and rejected
 * candidates), and the Phase 1 scope boundary recorded in
 * dra-acq-029-non-cjk-non-latin-script-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records.
 * The H1/H2 hypothesis findings themselves were obtained by actually running
 * the real segmentContent/classifySegments functions against genuine fetched
 * Devanagari prose (a disposable, since-removed vitest scratch test,
 * 2026-08-11) — this suite proves the resulting records are internally
 * consistent, not that the underlying live fetch/recon can be repeated here.
 */

import { describe, it, expect } from "vitest";

import {
  PROGRAMME_CONTEXT,
  EVIDENCE_MAP_CLASSIFICATIONS,
  ROBUSTNESS_EVIDENCE_MAP,
  HYPOTHESIS_STATUSES,
  HYPOTHESIS_FINDINGS,
  RANKING_CRITERIA_ORDER,
  RANKED_SCRIPT_FAMILIES,
  HIGHEST_VALUE_SCRIPT_FAMILY,
  LICENCE_STATUSES,
  QUALIFICATION_OUTCOMES,
  CANDIDATE_REGISTER,
  REJECTED_CANDIDATES,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  getCandidateById,
  primaryCandidate,
  alternateCandidate,
  RESERVED_NEXT_CORPUS_ID,
  PHASE_1_QUALIFICATION_OUTCOME,
  PHASE_1_QUALIFICATION_RECORD,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
} from "../dra-acq-029-non-cjk-non-latin-script-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 1: Programme Context", () => {
  it("records the 32-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(32);
  });

  it("treats ACQ-028/DOC-0032/ENG-023 as frozen prior programmes", () => {
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/DRA-ACQ-028/);
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/DRA-ENG-023/);
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/frozen/i);
  });

  it("frames the central research question around generalisation beyond CJK, not another Latin-script instance", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/CJK/);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/right-to-left|Devanagari|Cyrillic/);
  });

  it("distinguishes this programme from ACQ-028/DOC-0032 by name", () => {
    expect(PROGRAMME_CONTEXT.distinguishingFromPriorWork).toMatch(/DRA-ACQ-028/);
    expect(PROGRAMME_CONTEXT.distinguishingFromPriorWork).toMatch(/one instance never proves a pattern/i);
  });

  it("declares a negative result acceptable", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO_CANDIDATE_MEETS_REQUIREMENTS/);
  });

  it("states the Phase 1 engineering constraint explicitly, including the no-fix and no-reopen-ENG-023 rules", () => {
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/discovery only/i);
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/danda/i);
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/DRA-ENG-023/);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Robustness evidence map
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 2: Robustness Evidence Map", () => {
  it("uses only valid classification values for every dimension", () => {
    for (const record of ROBUSTNESS_EVIDENCE_MAP) {
      expect(EVIDENCE_MAP_CLASSIFICATIONS).toContain(record.classification);
    }
  });

  it("gives every dimension a unique name", () => {
    const names = ROBUSTNESS_EVIDENCE_MAP.map((r) => r.dimension);
    expect(new Set(names).size).toBe(names.length);
  });

  it("classifies CJK as ENGINEERED_AND_CLOSED, consistent with ACQ-028/ENG-023", () => {
    const cjk = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension.includes("CJK ideographic"));
    expect(cjk?.classification).toBe("ENGINEERED_AND_CLOSED");
  });

  it("classifies RTL abjads and Cyrillic as NOT_TESTED", () => {
    const rtl = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension.includes("right-to-left abjads"));
    const cyrillic = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension.includes("Cyrillic"));
    expect(rtl?.classification).toBe("NOT_TESTED");
    expect(cyrillic?.classification).toBe("NOT_TESTED");
  });

  it("classifies the Brahmic/Devanagari dimension as PARTIALLY_TESTED and references the danda finding", () => {
    const devanagari = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension.includes("Brahmic abugidas"));
    expect(devanagari?.classification).toBe("PARTIALLY_TESTED");
    expect(devanagari?.evidence).toMatch(/danda/);
    expect(devanagari?.evidence).toMatch(/GAP_DEMONSTRATED/);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Hypothesis findings (H1-H4)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 3: Hypothesis Findings (H1-H4)", () => {
  it("declares exactly four hypotheses, H1 through H4, in order", () => {
    expect(HYPOTHESIS_FINDINGS).toHaveLength(4);
    expect(HYPOTHESIS_FINDINGS.map((h) => h.id)).toEqual(["H1", "H2", "H3", "H4"]);
  });

  it("uses only valid hypothesis-status enum values", () => {
    for (const h of HYPOTHESIS_FINDINGS) {
      expect(HYPOTHESIS_STATUSES).toContain(h.status);
    }
  });

  it("confirms H1 (substantive-content recognition) with no gap, backed by real reconnaissance", () => {
    const h1 = HYPOTHESIS_FINDINGS.find((h) => h.id === "H1")!;
    expect(h1.status).toBe("CONFIRMED_NO_GAP");
    expect(h1.evidence).toMatch(/excluded 0 of them/);
    expect(h1.evidence).toMatch(/Devanagari digits/);
  });

  it("confirms H2 (sentence-boundary recognition) as a demonstrated gap referencing the danda", () => {
    const h2 = HYPOTHESIS_FINDINGS.find((h) => h.id === "H2")!;
    expect(h2.status).toBe("GAP_CONFIRMED");
    expect(h2.evidence).toMatch(/U\+0964/);
    expect(h2.evidence).toMatch(/single unsplit segment/);
  });

  it("marks H3 (directionality/joining) as not applicable to the selected Devanagari script", () => {
    const h3 = HYPOTHESIS_FINDINGS.find((h) => h.id === "H3")!;
    expect(h3.status).toBe("NOT_APPLICABLE_TO_SELECTED_SCRIPT");
  });

  it("marks H4 (conjunct/matra normalisation) as not yet tested, deferred to Phase 2", () => {
    const h4 = HYPOTHESIS_FINDINGS.find((h) => h.id === "H4")!;
    expect(h4.status).toBe("NOT_YET_TESTED");
    expect(h4.evidence).toMatch(/Phase 2/);
  });

  it("gives every hypothesis record non-empty statement and evidence text", () => {
    for (const h of HYPOTHESIS_FINDINGS) {
      expect(h.statement.length).toBeGreaterThan(0);
      expect(h.evidence.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 4: Ranking Methodology and Result", () => {
  it("declares all 12 ranking criteria from the directive, in order, extending ACQ-028's 9", () => {
    expect(RANKING_CRITERIA_ORDER).toHaveLength(12);
    expect(RANKING_CRITERIA_ORDER[0]).toBe("POTENTIAL_IMPACT_ON_TRUST_CLAIM");
    expect(RANKING_CRITERIA_ORDER).toContain("DIRECTIONALITY_AND_JOINING_MODEL_DIVERSITY");
    expect(RANKING_CRITERIA_ORDER).toContain("STRUCTURAL_SUITABILITY_OF_SOURCE_REPRESENTATION");
    expect(RANKING_CRITERIA_ORDER).toContain(
      "LICENCE_BASIS_STRENGTH_INDEPENDENT_OF_PUBLISHER_GOVERNMENT_STATUS",
    );
  });

  it("ranks script families with unique, contiguous ranks starting at 1", () => {
    const ranks = RANKED_SCRIPT_FAMILIES.map((g) => g.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(RANKED_SCRIPT_FAMILIES.map((_, i) => i + 1));
  });

  it("ranks Devanagari/Indic as the single highest-value script family, ahead of Arabic/Hebrew on feasibility grounds", () => {
    expect(RANKED_SCRIPT_FAMILIES[0].scriptFamily).toMatch(/Devanagari/);
    expect(RANKED_SCRIPT_FAMILIES[0].rank).toBe(1);
    expect(HIGHEST_VALUE_SCRIPT_FAMILY).toMatch(/Devanagari/);
  });

  it("ranks Cyrillic last among the three actively investigated families", () => {
    const cyrillic = RANKED_SCRIPT_FAMILIES.find((r) => r.scriptFamily === "Cyrillic")!;
    expect(cyrillic.rank).toBe(RANKED_SCRIPT_FAMILIES.length);
  });

  it("gives the Arabic/Hebrew ranking rationale an explicit acknowledgement of its theoretical directionality value", () => {
    const rtl = RANKED_SCRIPT_FAMILIES.find((r) => r.scriptFamily.includes("Arabic"))!;
    expect(rtl.rationale).toMatch(/directionality/i);
    expect(rtl.rationale).toMatch(/licen/i);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 5: Candidate Register Integrity", () => {
  it("registers exactly two qualified candidates (primary + alternate)", () => {
    expect(CANDIDATE_REGISTER).toHaveLength(2);
  });

  it("registers exactly six rejected candidates", () => {
    expect(REJECTED_CANDIDATES).toHaveLength(6);
    expect(REJECTED_CANDIDATE_IDS).toHaveLength(6);
  });

  it("gives every candidate (qualified and rejected) a unique candidateId matching DRA-CAND-029-NN", () => {
    const ids = [...CANDIDATE_REGISTER, ...REJECTED_CANDIDATES].map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^DRA-CAND-029-\d{2}$/);
  });

  it("uses only valid Domain and DocumentType enum values for every candidate", () => {
    for (const candidate of [...CANDIDATE_REGISTER, ...REJECTED_CANDIDATES]) {
      expect(DOMAINS).toContain(candidate.domain);
      expect(DOCUMENT_TYPES).toContain(candidate.documentType);
    }
  });

  it("uses only valid licence-status and qualification-outcome enum values", () => {
    for (const candidate of [...CANDIDATE_REGISTER, ...REJECTED_CANDIDATES]) {
      expect(LICENCE_STATUSES).toContain(candidate.licenceStatus);
      expect(QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
    }
  });

  it("requires every rejected candidate to carry a non-null rejectionReason, and every qualified candidate to carry null", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.rejectionReason).toBeNull();
    }
    for (const candidate of REJECTED_CANDIDATES) {
      expect(candidate.rejectionReason).not.toBeNull();
      expect(candidate.qualificationOutcome.startsWith("REJECTED")).toBe(true);
    }
  });

  it("requires every candidate to declare explicit pre-admission success and failure criteria", () => {
    for (const candidate of [...CANDIDATE_REGISTER, ...REJECTED_CANDIDATES]) {
      expect(candidate.successCriterion.length).toBeGreaterThan(0);
      expect(candidate.failureCriterion.length).toBeGreaterThan(0);
    }
  });

  it("marks the primary candidate's licence VERIFIED via a statutory basis, targeting the Devanagari dimension", () => {
    const primary = primaryCandidate();
    expect(primary.licenceStatus).toBe("VERIFIED");
    expect(primary.licenceBasis).toMatch(/52\(1\)\(q\)/);
    expect(primary.targetedDimension).toMatch(/Devanagari/);
  });

  it("marks the alternate candidate's licence as PROVISIONAL, distinguishing it from the primary", () => {
    expect(alternateCandidate().licenceStatus).toBe("PROVISIONAL");
  });

  it("records multiple rejected Arabic/Hebrew candidates, each with a licence-driven rejection", () => {
    const rtlRejected = REJECTED_CANDIDATES.filter(
      (c) => c.script.includes("Arabic") || c.script.includes("Hebrew"),
    );
    expect(rtlRejected.length).toBeGreaterThanOrEqual(4);
    for (const c of rtlRejected) {
      expect(c.qualificationOutcome === "REJECTED_LICENCE_UNCERTAIN" || c.qualificationOutcome === "REJECTED_INACCESSIBLE").toBe(true);
    }
  });

  it("records a rejected Devanagari candidate (RBI) whose rejection reason documents licence heterogeneity within a single government", () => {
    const rbi = getCandidateById("DRA-CAND-029-08")!;
    expect(rbi.script).toMatch(/Devanagari/);
    expect(rbi.licenceEvidence).toMatch(/PIB/);
    expect(rbi.licenceEvidence).toMatch(/heterogeneity/i);
  });

  it("gives every rejected candidate a distinct rejection reason, avoiding uniform boilerplate", () => {
    const reasons = REJECTED_CANDIDATES.map((c) => c.rejectionReason);
    expect(new Set(reasons).size).toBe(reasons.length);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Phase 1 outcome and hard boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-029 — Part 6: Phase 1 Qualification Outcome and Hard Boundary", () => {
  it("selects the Supreme Court of India judgment as primary and the Bulgarian EU document as alternate", () => {
    expect(PRIMARY_CANDIDATE_ID).toBe("DRA-CAND-029-01");
    expect(ALTERNATE_CANDIDATE_ID).toBe("DRA-CAND-029-02");
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.publisher).toMatch(/Supreme Court of India/);
    expect(getCandidateById(ALTERNATE_CANDIDATE_ID)?.languages).toContain("bg");
  });

  it("records a QUALIFIED_RECOMMENDED Phase 1 outcome referencing DRA-DOC-0033", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED_RECOMMENDED");
    expect(PHASE_1_QUALIFICATION_RECORD.reservedCorpusId).toBe("DRA-DOC-0033");
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.highestValueScriptFamily).toMatch(/Devanagari/);
  });

  it("reserves DRA-DOC-0033 as a syntactically valid, never-yet-used corpus ID", () => {
    expect(CorpusIdSchema.safeParse(RESERVED_NEXT_CORPUS_ID).success).toBe(true);
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0033");
  });

  it("scopes the proposed Phase 2 experiment to acquisition/evaluation/comparison, explicitly deferring danda remediation", () => {
    expect(PROPOSED_PHASE_2_SCOPE.summary).toMatch(/DRA-DOC-0033/);
    expect(PROPOSED_PHASE_2_SCOPE.summary).toMatch(/unmodified/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitlyOutOfScope).toMatch(/not be modified/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitlyOutOfScope).toMatch(/danda/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoal).toMatch(/DRA-ENG-023/);
  });

  it("explicitly records every Phase 1 hard-boundary action as not performed", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual({
      documentFrozen: false,
      documentAdmitted: false,
      documentEvaluated: false,
      productionCodeModified: false,
      remediationBegun: false,
      eng023Reopened: false,
    });
  });
});
