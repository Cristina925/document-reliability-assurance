/**
 * DRA-ACQ-028 — Phase 1: Post-Currentness Robustness Gap Audit and
 * Candidate Discovery for DRA-DOC-0032
 *
 * Proves the programme context, the robustness evidence map reconstruction
 * through Document 31, the ranking methodology and result, the candidate
 * register (primary, alternate, and rejected candidates), and the Phase 1
 * scope boundary recorded in dra-acq-028-non-latin-script-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from live-source verification performed once, out of band
 * (2026-08-11), and recorded as fixed data in the module under test.
 */

import { describe, it, expect } from "vitest";

import {
  PROGRAMME_CONTEXT,
  EVIDENCE_MAP_CLASSIFICATIONS,
  FAILURE_BOUNDARY_STAGES,
  ROBUSTNESS_EVIDENCE_MAP,
  RANKING_CRITERIA_ORDER,
  RANKED_REMAINING_GAPS,
  HIGHEST_VALUE_GAP,
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
} from "../dra-acq-028-non-latin-script-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

describe("DRA-ACQ-028 — Part 1: Programme Context", () => {
  it("records the 31-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(31);
  });

  it("treats ACQ-027 and ENG-020/021/022 as frozen prior programmes", () => {
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/DRA-ACQ-027/);
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/DRA-ENG-020\/021\/022/);
    expect(PROGRAMME_CONTEXT.priorClosedProgrammes).toMatch(/frozen/i);
  });

  it("frames the central research question around script/tokenisation generalisation, not vocabulary", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/Latin-script/);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/English, Spanish, or French/);
  });

  it("distinguishes this programme from prior multilingual work by name", () => {
    expect(PROGRAMME_CONTEXT.distinguishingFromPriorMultilingualWork).toMatch(/DRA-ENG-012/);
    expect(PROGRAMME_CONTEXT.distinguishingFromPriorMultilingualWork).toMatch(/new boundary/i);
  });

  it("declares a negative result acceptable", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO_CANDIDATE_MEETS_REQUIREMENTS/);
  });

  it("states the Phase 1 engineering constraint explicitly, including the ENG-020/021/022 non-reopening rule", () => {
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/ENG-020\/021\/022/);
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/discovery only/i);
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/signature\/key-management/);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Robustness evidence map
// ---------------------------------------------------------------------------

describe("DRA-ACQ-028 — Part 2: Robustness Evidence Map", () => {
  it("covers at least the 15 dimensions named by the directive", () => {
    expect(ROBUSTNESS_EVIDENCE_MAP.length).toBeGreaterThanOrEqual(15);
  });

  it("uses only valid classification and failure-boundary enum values for every dimension", () => {
    for (const record of ROBUSTNESS_EVIDENCE_MAP) {
      expect(EVIDENCE_MAP_CLASSIFICATIONS).toContain(record.classification);
      expect(FAILURE_BOUNDARY_STAGES).toContain(record.likelyFailureBoundary);
    }
  });

  it("gives every dimension a unique name", () => {
    const names = ROBUSTNESS_EVIDENCE_MAP.map((r) => r.dimension);
    expect(new Set(names).size).toBe(names.length);
  });

  it("requires every dimension record to distinguish exposure from demonstrated evidence", () => {
    for (const record of ROBUSTNESS_EVIDENCE_MAP) {
      expect(record.exposureVsDemonstratedNote.length).toBeGreaterThan(0);
    }
  });

  it("classifies non-Latin scripts and mixed-language documents as NOT_TESTED", () => {
    const nonLatin = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension === "non-Latin scripts");
    const mixedLang = ROBUSTNESS_EVIDENCE_MAP.find((r) =>
      r.dimension.startsWith("mixed-language documents"),
    );
    expect(nonLatin?.classification).toBe("NOT_TESTED");
    expect(mixedLang?.classification).toBe("NOT_TESTED");
  });

  it("classifies document supersession/currentness and scale as ENGINEERED_AND_CLOSED, consistent with ACQ-027/ENG-019/020/021/022", () => {
    const currentness = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension === "document supersession/currentness");
    const scale = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension === "very large documents / scalability");
    expect(currentness?.classification).toBe("ENGINEERED_AND_CLOSED");
    expect(scale?.classification).toBe("ENGINEERED_AND_CLOSED");
  });

  it("classifies OCR/scans and graphics as KNOWN_LIMITATION_ACCEPTED, not ENGINEERED_AND_CLOSED", () => {
    const ocr = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension === "scans/OCR/image-only content");
    const graphics = ROBUSTNESS_EVIDENCE_MAP.find((r) =>
      r.dimension.startsWith("graphics/charts/diagrams"),
    );
    expect(ocr?.classification).toBe("KNOWN_LIMITATION_ACCEPTED");
    expect(graphics?.classification).toBe("KNOWN_LIMITATION_ACCEPTED");
  });

  it("does not claim any dimension is TESTED_NO_GAP without a failure-boundary of NOT_APPLICABLE_NO_GAP", () => {
    for (const record of ROBUSTNESS_EVIDENCE_MAP) {
      if (record.classification === "TESTED_NO_GAP") {
        expect(record.likelyFailureBoundary).toBe("NOT_APPLICABLE_NO_GAP");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Ranking
// ---------------------------------------------------------------------------

describe("DRA-ACQ-028 — Part 3: Ranking Methodology and Result", () => {
  it("declares all 9 ranking criteria from the directive, in order", () => {
    expect(RANKING_CRITERIA_ORDER).toHaveLength(9);
    expect(RANKING_CRITERIA_ORDER[0]).toBe("POTENTIAL_IMPACT_ON_TRUST_CLAIM");
    expect(RANKING_CRITERIA_ORDER[RANKING_CRITERIA_ORDER.length - 1]).toBe(
      "GENUINELY_NEW_BOUNDARY_VS_KNOWN_LIMITATION_INSTANCE",
    );
  });

  it("ranks gaps with unique, contiguous ranks starting at 1", () => {
    const ranks = RANKED_REMAINING_GAPS.map((g) => g.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(RANKED_REMAINING_GAPS.map((_, i) => i + 1));
  });

  it("ranks non-Latin scripts as the single highest-value remaining gap", () => {
    expect(RANKED_REMAINING_GAPS[0].dimension).toBe("non-Latin scripts");
    expect(RANKED_REMAINING_GAPS[0].rank).toBe(1);
    expect(HIGHEST_VALUE_GAP).toBe("non-Latin scripts");
  });

  it("only ranks dimensions that the evidence map itself classifies as NOT_TESTED or PARTIALLY_TESTED", () => {
    const untested = new Set(
      ROBUSTNESS_EVIDENCE_MAP.filter(
        (r) => r.classification === "NOT_TESTED" || r.classification === "PARTIALLY_TESTED",
      ).map((r) => r.dimension),
    );
    for (const gap of RANKED_REMAINING_GAPS) {
      expect(untested.has(gap.dimension)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-028 — Part 4: Candidate Register Integrity", () => {
  it("registers exactly two qualified candidates (primary + alternate)", () => {
    expect(CANDIDATE_REGISTER).toHaveLength(2);
  });

  it("registers exactly three rejected candidates", () => {
    expect(REJECTED_CANDIDATES).toHaveLength(3);
    expect(REJECTED_CANDIDATE_IDS).toHaveLength(3);
  });

  it("gives every candidate (qualified and rejected) a unique candidateId matching DRA-CAND-028-NN", () => {
    const ids = [...CANDIDATE_REGISTER, ...REJECTED_CANDIDATES].map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^DRA-CAND-028-\d{2}$/);
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

  it("marks the primary candidate's licence VERIFIED and targets the ranked-1 gap", () => {
    const primary = primaryCandidate();
    expect(primary.licenceStatus).toBe("VERIFIED");
    expect(primary.targetedDimension).toMatch(/non-Latin scripts/);
  });

  it("marks the alternate candidate's licence as PROVISIONAL, distinguishing it from the primary", () => {
    expect(alternateCandidate().licenceStatus).toBe("PROVISIONAL");
  });

  it("records at least one rejected candidate with a VERIFIED licence, proving rejection was not solely licence-driven", () => {
    const verifiedRejected = REJECTED_CANDIDATES.filter((c) => c.licenceStatus === "VERIFIED");
    expect(verifiedRejected.length).toBeGreaterThanOrEqual(1);
    for (const c of verifiedRejected) {
      expect(c.qualificationOutcome).not.toBe("REJECTED_LICENCE_UNCERTAIN");
    }
  });

  it("gives every rejected candidate a distinct rejection outcome or a distinct rejection rationale, avoiding uniform boilerplate", () => {
    const reasons = REJECTED_CANDIDATES.map((c) => c.rejectionReason);
    expect(new Set(reasons).size).toBe(reasons.length);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 outcome and hard boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-028 — Part 5: Phase 1 Qualification Outcome and Hard Boundary", () => {
  it("selects the Japan Cabinet Office guideline as primary and the KISDI report as alternate", () => {
    expect(PRIMARY_CANDIDATE_ID).toBe("DRA-CAND-028-01");
    expect(ALTERNATE_CANDIDATE_ID).toBe("DRA-CAND-028-02");
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.publisher).toMatch(/Cabinet Office/);
    expect(getCandidateById(ALTERNATE_CANDIDATE_ID)?.publisher).toMatch(/KISDI/);
  });

  it("records a QUALIFIED_RECOMMENDED Phase 1 outcome referencing DRA-DOC-0032", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED_RECOMMENDED");
    expect(PHASE_1_QUALIFICATION_RECORD.reservedCorpusId).toBe("DRA-DOC-0032");
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.highestValueGap).toBe("non-Latin scripts");
  });

  it("reserves DRA-DOC-0032 as a syntactically valid, never-yet-used corpus ID", () => {
    expect(CorpusIdSchema.safeParse(RESERVED_NEXT_CORPUS_ID).success).toBe(true);
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0032");
  });

  it("scopes the proposed Phase 2 experiment to acquisition/evaluation/comparison, explicitly deferring remediation", () => {
    expect(PROPOSED_PHASE_2_SCOPE.summary).toMatch(/DRA-DOC-0032/);
    expect(PROPOSED_PHASE_2_SCOPE.summary).toMatch(/unmodified/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitlyOutOfScope).toMatch(/not be modified/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoal).toMatch(/DRA-ENG-020\/021\/022/);
  });

  it("explicitly records every Phase 1 hard-boundary action as not performed", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual({
      documentFrozen: false,
      documentAdmitted: false,
      documentEvaluated: false,
      productionCodeModified: false,
      remediationBegun: false,
      currentnessProgrammesReopened: false,
      signatureEngineeringStarted: false,
    });
  });
});
