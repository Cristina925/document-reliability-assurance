/**
 * DRA-ACQ-030 — Phase 1: Multi-Column Layout Candidate Discovery
 * for DRA-DOC-0034 (reserved slot, next-after-0033)
 *
 * Proves the programme context, failure-mode taxonomy, materiality
 * standard, candidate register (qualified, rejected, and inaccessible
 * candidates alike), ranking criteria/scores, reconnaissance findings,
 * Phase 1 qualification verdict, status classification, Phase 2 proposal,
 * and the hard DRA-DOC-0033 non-interference constraint recorded in
 * dra-acq-030-multicolumn-layout-discovery.ts.
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
  FAILURE_MODES,
  FAILURE_MODE_DESCRIPTIONS,
  MATERIALITY_STANDARD,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_STATUSES,
  LAYOUT_VERIFICATION_STATUSES,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  CANDIDATE_REGISTER,
  CANDIDATE_IDS,
  getCandidateById,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  primaryCandidate,
  alternateCandidate,
  RANKING_CRITERIA_ORDER,
  RANKED_CANDIDATE_SCORES,
  RECONNAISSANCE_FINDINGS,
  PHASE_1_QUALIFICATION_OUTCOME,
  PHASE_1_QUALIFICATION_RECORD,
  MULTICOLUMN_ROBUSTNESS_STATUS_AFTER_PHASE_1,
  PHASE_1_STATUS_RATIONALE,
  PHASE_2_CLASSIFICATION_OPTIONS,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
} from "../dra-acq-030-multicolumn-layout-discovery.js";
import { DOMAINS, DOCUMENT_TYPES } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 1: Programme Context", () => {
  it("records the 32-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(32);
  });

  it("frames the central research question around reading order, not throughput or OCR/table/figure ground", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/reading order/i);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/multi-column/i);
  });

  it("explicitly excludes table/figure/OCR ground already covered by prior acquisitions", () => {
    expect(PROGRAMME_CONTEXT.excludedFraming).toMatch(/DRA-ACQ-021/);
    expect(PROGRAMME_CONTEXT.excludedFraming).toMatch(/DRA-ACQ-023/);
    expect(PROGRAMME_CONTEXT.excludedFraming).toMatch(/DRA-ACQ-021\/024\/025/);
  });

  it("treats a negative result as acceptable", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO CANDIDATE QUALIFIED/);
  });

  it("states the DRA-DOC-0033 / DRA-FRZ-000027 / DRA-ACQ-000036 non-interference constraint", () => {
    expect(PROGRAMME_CONTEXT.reservationConstraint).toMatch(/DRA-FRZ-000027/);
    expect(PROGRAMME_CONTEXT.reservationConstraint).toMatch(/DRA-ACQ-000036/);
    expect(PROGRAMME_CONTEXT.reservationConstraint).toMatch(/DRA-DOC-0033/);
    expect(PROGRAMME_CONTEXT.reservationConstraint).toMatch(/DRA-DOC-0034/);
  });

  it("PROGRAMME_CONTEXT is frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Failure-mode taxonomy and materiality standard
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 2: Failure Modes and Materiality", () => {
  it("defines exactly the seven failure modes required by the task specification", () => {
    expect(FAILURE_MODES).toEqual([
      "COLUMN_INTERLEAVING",
      "COLUMN_ORDER_REVERSAL",
      "CROSS_COLUMN_SENTENCE_CORRUPTION",
      "HEADING_BODY_MISORDER",
      "FOOTNOTE_INTRUSION",
      "COLUMN_TRANSITION_LOSS",
      "PAGE_STREAM_CORRUPTION",
    ]);
  });

  it("provides a description for every failure mode", () => {
    for (const mode of FAILURE_MODES) {
      expect(FAILURE_MODE_DESCRIPTIONS[mode]).toBeTruthy();
      expect(typeof FAILURE_MODE_DESCRIPTIONS[mode]).toBe("string");
    }
  });

  it("states the materiality rule and explicitly separates correctness from materiality", () => {
    expect(MATERIALITY_STANDARD.rule).toMatch(/MATERIAL only if/);
    expect(MATERIALITY_STANDARD.rule).toMatch(/NONMATERIAL/);
    expect(MATERIALITY_STANDARD.distinguishesFrom).toMatch(/correctness/i);
    expect(MATERIALITY_STANDARD.distinguishesFrom).toMatch(/materiality/i);
  });

  it("Part 2 exports are frozen", () => {
    expect(Object.isFrozen(FAILURE_MODE_DESCRIPTIONS)).toBe(true);
    expect(Object.isFrozen(MATERIALITY_STANDARD)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 3: Candidate Register", () => {
  it("declares the expected status enums", () => {
    expect(OFFICIAL_SOURCE_STATUSES).toContain("OFFICIAL_PUBLISHER");
    expect(OFFICIAL_SOURCE_STATUSES).toContain("INACCESSIBLE");
    expect(LICENCE_STATUSES).toContain("PUBLIC_DOMAIN");
    expect(LICENCE_STATUSES).toContain("CC_BY");
    expect(LICENCE_STATUSES).toContain("PERMISSION_REQUIRED");
    expect(LAYOUT_VERIFICATION_STATUSES).toContain("GENUINE_MULTI_COLUMN_PROSE");
    expect(LAYOUT_VERIFICATION_STATUSES).toContain("NOT_MULTI_COLUMN");
    expect(CANDIDATE_QUALIFICATION_OUTCOMES).toEqual(["QUALIFIED_PRIMARY", "QUALIFIED_ALTERNATE", "REJECTED"]);
  });

  it("investigates at least five candidates spanning at least three publishers and two domains", () => {
    expect(CANDIDATE_REGISTER.length).toBeGreaterThanOrEqual(5);
    const publishers = new Set(CANDIDATE_REGISTER.map((c) => c.publisher));
    expect(publishers.size).toBeGreaterThanOrEqual(3);
    const domains = new Set(CANDIDATE_REGISTER.map((c) => c.domain));
    expect(domains.size).toBeGreaterThanOrEqual(2);
  });

  it("every candidate has a valid domain and document type from the corpus schema", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.domain);
      expect(DOCUMENT_TYPES).toContain(candidate.documentType);
    }
  });

  it("every candidate record is frozen", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(candidate)).toBe(true);
    }
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    expect(Object.isFrozen(CANDIDATE_IDS)).toBe(true);
  });

  it("getCandidateById resolves each registered candidate and returns undefined for an unknown id", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(getCandidateById(candidate.candidateId)).toBe(candidate);
    }
    expect(getCandidateById("NOT_A_REAL_CANDIDATE")).toBeUndefined();
  });

  it("primaryCandidate() resolves to the Federal Register candidate and is QUALIFIED_PRIMARY", () => {
    const candidate = primaryCandidate();
    expect(candidate.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(candidate.qualificationOutcome).toBe("QUALIFIED_PRIMARY");
    expect(candidate.rejectionReason).toBeNull();
    expect(candidate.licenceStatus).toBe("PUBLIC_DOMAIN");
    expect(candidate.layoutVerification).toBe("GENUINE_MULTI_COLUMN_PROSE");
  });

  it("alternateCandidate() resolves to the Congressional Record candidate and is QUALIFIED_ALTERNATE", () => {
    const candidate = alternateCandidate();
    expect(candidate.candidateId).toBe(ALTERNATE_CANDIDATE_ID);
    expect(candidate.qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
    expect(candidate.rejectionReason).toBeNull();
  });

  it("every rejected candidate carries a documented, non-empty rejection reason", () => {
    expect(REJECTED_CANDIDATE_IDS.length).toBeGreaterThan(0);
    for (const id of REJECTED_CANDIDATE_IDS) {
      const candidate = getCandidateById(id);
      expect(candidate).toBeDefined();
      expect(candidate!.qualificationOutcome).toBe("REJECTED");
      expect(candidate!.rejectionReason).toBeTruthy();
    }
  });

  it("the Canada Gazette candidate is rejected specifically on licence grounds, not layout grounds", () => {
    const candidate = getCandidateById("CANADA_GAZETTE_2026_07_11");
    expect(candidate).toBeDefined();
    expect(candidate!.licenceStatus).toBe("PERMISSION_REQUIRED");
    expect(candidate!.qualificationOutcome).toBe("REJECTED");
    expect(candidate!.rejectionReason).toMatch(/LICENCE/);
    expect(candidate!.layoutVerification).toBe("PARALLEL_BILINGUAL_COLUMNS");
  });

  it("the EU OJ and SciPy candidates are rejected specifically on layout grounds, not licence grounds", () => {
    for (const id of ["EU_OJ_AI_ACT_2024_1689", "SCIPY_PROCEEDINGS_FRWC3537"]) {
      const candidate = getCandidateById(id);
      expect(candidate).toBeDefined();
      expect(candidate!.rejectionReason).toMatch(/NOT_GENUINELY_MULTI_COLUMN/);
      expect(candidate!.layoutVerification).not.toBe("GENUINE_MULTI_COLUMN_PROSE");
    }
  });

  it("the IEEE Access and Nature Communications candidates are rejected specifically on accessibility grounds", () => {
    for (const id of ["IEEE_ACCESS_SAMPLE", "NATURE_COMMUNICATIONS_SAMPLE"]) {
      const candidate = getCandidateById(id);
      expect(candidate).toBeDefined();
      expect(candidate!.officialSourceStatus).toBe("INACCESSIBLE");
      expect(candidate!.rejectionReason).toMatch(/SOURCE_INACCESSIBLE/);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking criteria and scores
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 4: Ranking Criteria and Scores", () => {
  it("defines exactly the 12 named ranking criteria", () => {
    expect(RANKING_CRITERIA_ORDER).toEqual([
      "MULTI_COLUMN_COMPLEXITY",
      "ORACLE_STRENGTH",
      "OFFICIAL_SOURCE_STRENGTH",
      "LICENCE_CERTAINTY",
      "SOURCE_STABILITY",
      "TEXT_LAYER_QUALITY",
      "ISOLATION_FROM_OTHER_DIMENSIONS",
      "SEMANTIC_RISK",
      "MULTI_PAGE_COVERAGE",
      "LOW_OCR_TABLE_CONFOUNDING",
      "REPRODUCIBILITY",
      "EXPECTED_GC1_INFORMATION_GAIN",
    ]);
  });

  it("scores every criterion for every ranked candidate with a valid level", () => {
    const validLevels = new Set(["HIGH", "MEDIUM", "LOW", "NOT_APPLICABLE"]);
    for (const scored of RANKED_CANDIDATE_SCORES) {
      for (const criterion of RANKING_CRITERIA_ORDER) {
        expect(validLevels.has(scored.scores[criterion])).toBe(true);
      }
      expect(getCandidateById(scored.candidateId)).toBeDefined();
    }
  });

  it("ranks the primary candidate HIGH on expected GC-1 information gain and the rejected licence-gated candidate lower", () => {
    const primaryScore = RANKED_CANDIDATE_SCORES.find((s) => s.candidateId === PRIMARY_CANDIDATE_ID);
    const canadaScore = RANKED_CANDIDATE_SCORES.find((s) => s.candidateId === "CANADA_GAZETTE_2026_07_11");
    expect(primaryScore?.scores.EXPECTED_GC1_INFORMATION_GAIN).toBe("HIGH");
    expect(canadaScore?.scores.LICENCE_CERTAINTY).toBe("LOW");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Reconnaissance findings
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 5: Reconnaissance Findings", () => {
  it("records at least one reconnaissance finding against the primary candidate's real bytes", () => {
    const primaryFindings = RECONNAISSANCE_FINDINGS.filter((f) => f.candidateId === PRIMARY_CANDIDATE_ID);
    expect(primaryFindings.length).toBeGreaterThan(0);
  });

  it("demonstrates COLUMN_INTERLEAVING under both default and -layout pdftotext extraction modes for the primary candidate", () => {
    const modes = RECONNAISSANCE_FINDINGS.filter(
      (f) => f.candidateId === PRIMARY_CANDIDATE_ID && f.failureModesObserved.includes("COLUMN_INTERLEAVING"),
    ).map((f) => f.extractionMode);
    expect(modes).toContain("PDFTOTEXT_DEFAULT");
    expect(modes).toContain("PDFTOTEXT_LAYOUT");
  });

  it("records a correctly-behaving control finding (no failure modes observed) for the deprioritised Copernicus candidate", () => {
    const control = RECONNAISSANCE_FINDINGS.find((f) => f.candidateId === "COPERNICUS_ACP_2023_1227");
    expect(control).toBeDefined();
    expect(control!.failureModesObserved.length).toBe(0);
  });

  it("every observed failure mode is drawn from the FAILURE_MODES taxonomy", () => {
    for (const finding of RECONNAISSANCE_FINDINGS) {
      for (const mode of finding.failureModesObserved) {
        expect(FAILURE_MODES).toContain(mode);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Phase 1 verdict and status classification
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 6: Phase 1 Verdict and Status", () => {
  it("concludes exactly one QUALIFIED verdict naming a primary and an alternate", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.alternateCandidateId).toBe(ALTERNATE_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.rationale.length).toBeGreaterThan(0);
  });

  it("does not claim any DRA-DOC or DRA-FRZ identifier, and names DRA-DOC-0034 only conceptually", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateAfter).toMatch(/DRA-DOC-0033/);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateAfter).toMatch(/DRA-DOC-0034/);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateAfter).toMatch(/no DRA-DOC or DRA-FRZ identifier is claimed/);
  });

  it("classifies multi-column robustness as PARTIALLY_TESTED, not closed, after Phase 1 alone", () => {
    expect(MULTICOLUMN_ROBUSTNESS_STATUS_AFTER_PHASE_1).toBe("PARTIALLY_TESTED");
    expect(PHASE_1_STATUS_RATIONALE.reasoning).toMatch(/not sufficient to close/i);
    expect(PHASE_1_STATUS_RATIONALE.reasoning).toMatch(/materiality/i);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase 2 proposal and Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 — Part 7: Phase 2 Proposal and Scope Boundary", () => {
  it("defines exactly the four Phase 2 classification options", () => {
    expect(PHASE_2_CLASSIFICATION_OPTIONS).toEqual([
      "MULTICOLUMN_ORDER_PRESERVATION_CONFIRMED",
      "MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL",
      "MULTICOLUMN_ORDER_GAP_DEMONSTRATED_NONMATERIAL",
      "INCONCLUSIVE",
    ]);
  });

  it("proposes a Phase 2 scope that freezes, admits, double-evaluates, and assesses materiality without fixing anything", () => {
    const joined = PROPOSED_PHASE_2_SCOPE.steps.join(" ");
    expect(joined).toMatch(/acquireFreezeAndEvaluate/);
    expect(joined).toMatch(/evaluate.*twice|Evaluate the frozen document twice/i);
    expect(joined).toMatch(/materiality/i);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/Do not fix, patch, or otherwise modify/);
  });

  it("Phase 2 scope explicitly protects the reserved DRA-DOC-0033 identifiers", () => {
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/DRA-FRZ-000027/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/DRA-ACQ-000036/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/DRA-DOC-0033/);
  });

  it("lists the prohibited Phase 1 actions, including touching the reserved DOC-0033 identifiers", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS.some((a) => a.includes("DRA-DOC-0034"))).toBe(true);
    expect(PHASE_1_PROHIBITED_ACTIONS.some((a) => a.includes("DRA-DOC-0033"))).toBe(true);
    expect(PHASE_1_PROHIBITED_ACTIONS.some((a) => a.toLowerCase().includes("freeze"))).toBe(true);
    expect(PHASE_1_PROHIBITED_ACTIONS.some((a) => a.toLowerCase().includes("evaluator"))).toBe(true);
  });

  it("Part 6/7 exports are frozen", () => {
    expect(Object.isFrozen(PHASE_1_QUALIFICATION_RECORD)).toBe(true);
    expect(Object.isFrozen(PHASE_1_STATUS_RATIONALE)).toBe(true);
    expect(Object.isFrozen(PROPOSED_PHASE_2_SCOPE)).toBe(true);
    expect(Object.isFrozen(PROPOSED_PHASE_2_SCOPE.steps)).toBe(true);
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
  });
});
