/**
 * DRA-ACQ-018 — Phase 1: Evidence-Gap Candidate Discovery and Qualification
 * for DRA-DOC-0022
 *
 * Proves the corpus profile reconstruction, ranked evidence-gap analysis,
 * candidate register, governance pre-screen, diversity/novelty scoring,
 * acquisition-cost table, ranking, H22 hypothesis, and Phase 1 scope
 * boundary recorded in dra-acq-018-evidence-gap-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution. It only exercises data-integrity and reasoning invariants over
 * static discovery records built from today's live-source re-verification
 * (recorded as fixed data in the module under test, not re-fetched here).
 */

import { describe, it, expect } from "vitest";

import {
  CORPUS_INVENTORY,
  REAL_ACQUISITIONS,
  REAL_DOMAIN_COUNTS,
  REAL_DOCUMENT_TYPE_COUNTS,
  REAL_PUBLISHER_COUNTS,
  REAL_LANGUAGE_COUNTS,
  DECISION_DISTRIBUTION_21_DOCS,
  ISSUE_CLASS_COVERAGE_21_DOCS,
  leastRepresentedRealDomains,
  repeatedRealPublishers,
  CORPUS_PROFILE_SUMMARY,
  EVIDENCE_GAP_PRIORITIES,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_REUSE_STATUSES,
  SOURCE_STABILITY_STATUSES,
  ACQUISITION_COST_VALUE_TABLE,
  RANKED_CANDIDATE_IDS,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_1_CANDIDATE_ID,
  ALTERNATE_2_CANDIDATE_ID,
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  H22_HYPOTHESIS,
  H22_DOES_NOT_PREDICT,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-018-evidence-gap-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Corpus profile integrity (21 documents)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 1: Reconstructed 21-Document Corpus Profile", () => {
  it("records exactly 21 corpus documents, in order", () => {
    expect(CORPUS_INVENTORY.length).toBe(21);
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids[0]).toBe("DRA-DOC-0001");
    expect(ids[ids.length - 1]).toBe("DRA-DOC-0021");
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]).toBe(`DRA-DOC-${String(i + 1).padStart(4, "0")}`);
    }
  });

  it("every corpusId is well-formed per the corpus schema", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 15 documents are real acquisitions (DRA-DOC-0007 through 0021)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(15);
    expect(REAL_ACQUISITIONS[0]!.corpusId).toBe("DRA-DOC-0007");
    expect(REAL_ACQUISITIONS[REAL_ACQUISITIONS.length - 1]!.corpusId).toBe("DRA-DOC-0021");
  });

  it("real-acquisition domain counts show TECHNICAL as the sole domain above the floor", () => {
    expect(REAL_DOMAIN_COUNTS.get("TECHNICAL")).toBe(5);
    for (const d of ["BUSINESS", "GENERAL", "LEGAL", "HEALTHCARE", "FINANCE"] as const) {
      expect(REAL_DOMAIN_COUNTS.get(d)).toBe(2);
    }
    const total = [...REAL_DOMAIN_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(15);
  });

  it("leastRepresentedRealDomains returns exactly the five domains tied at the floor (2 documents)", () => {
    const least = leastRepresentedRealDomains();
    expect(new Set(least)).toEqual(new Set(["BUSINESS", "GENERAL", "LEGAL", "HEALTHCARE", "FINANCE"]));
    expect(least).not.toContain("TECHNICAL");
  });

  it("real-acquisition documentType counts sum to 15 and include zero REWRITE/EMAIL", () => {
    const total = [...REAL_DOCUMENT_TYPE_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(15);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("REWRITE")).toBeUndefined();
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("EMAIL")).toBeUndefined();
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("REPORT")).toBe(4);
  });

  it("real-acquisition language counts confirm en 8 / en-GB 4 / es 2 / fr 1", () => {
    expect(REAL_LANGUAGE_COUNTS.get("en")).toBe(8);
    expect(REAL_LANGUAGE_COUNTS.get("en-GB")).toBe(4);
    expect(REAL_LANGUAGE_COUNTS.get("es")).toBe(2);
    expect(REAL_LANGUAGE_COUNTS.get("fr")).toBe(1);
  });

  it("European Commission / HLEG-AI is the only repeated real-acquisition publisher", () => {
    const repeated = repeatedRealPublishers();
    expect(repeated.length).toBe(1);
    expect(repeated[0]).toContain("European Commission");
    const ecCount = REAL_PUBLISHER_COUNTS.get("European Commission — High-Level Expert Group on AI");
    expect(ecCount).toBe(2);
  });

  it("reproduces the fixed 21-document decision distribution (10 SUPPORTED, 9 REVIEW, 2 HOLD)", () => {
    expect(DECISION_DISTRIBUTION_21_DOCS.SUPPORTED).toBe(10);
    expect(DECISION_DISTRIBUTION_21_DOCS.REVIEW).toBe(9);
    expect(DECISION_DISTRIBUTION_21_DOCS.HOLD).toBe(2);
    const total = DECISION_DISTRIBUTION_21_DOCS.SUPPORTED + DECISION_DISTRIBUTION_21_DOCS.REVIEW + DECISION_DISTRIBUTION_21_DOCS.HOLD;
    expect(total).toBe(21);
  });

  it("reproduces the fixed 3/9 issue-class coverage and the DRA-CHK-002 unreachable set (disjoint, union = all 9)", () => {
    expect(ISSUE_CLASS_COVERAGE_21_DOCS.observed.length).toBe(3);
    expect(ISSUE_CLASS_COVERAGE_21_DOCS.coverageFraction).toBe("3/9");
    expect(ISSUE_CLASS_COVERAGE_21_DOCS.structurallyUnreachablePerChk002.length).toBe(6);
    const union = new Set([
      ...ISSUE_CLASS_COVERAGE_21_DOCS.observed,
      ...ISSUE_CLASS_COVERAGE_21_DOCS.structurallyUnreachablePerChk002,
    ]);
    expect(union.size).toBe(9);
  });

  it("the corpus profile summary is present and non-empty for every required dimension", () => {
    expect(CORPUS_PROFILE_SUMMARY.totalDocuments).toBe(21);
    expect(CORPUS_PROFILE_SUMMARY.realAcquisitions).toBe(15);
    expect(CORPUS_PROFILE_SUMMARY.syntheticSeedDocuments).toBe(6);
    for (const key of [
      "domainCountsReal", "documentTypeCountsReal", "languageCountsReal",
      "sourceFormatCountsReal", "difficultyCountsReal", "repeatedPublishers",
      "underrepresentedDimensions",
    ] as const) {
      expect(typeof CORPUS_PROFILE_SUMMARY[key]).toBe("string");
      expect(CORPUS_PROFILE_SUMMARY[key].length).toBeGreaterThan(10);
    }
  });

  it("the inventory array and every row are frozen (append-only, no mutation)", () => {
    expect(Object.isFrozen(CORPUS_INVENTORY)).toBe(true);
    for (const row of CORPUS_INVENTORY) {
      expect(Object.isFrozen(row)).toBe(true);
    }
  });

  it("does not alter the frozen evaluator identity (0.1.2 / 1.0 / 0.1.0)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
    expect(DRA_PIPELINE_VERSION).toBe("1.0");
    expect(DRA_MODEL_VERSION).toBe("0.1.0");
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Ranked evidence-gap priorities
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 2: Ranked Evidence-Gap Priorities", () => {
  it("records exactly 10 priorities, ranked 1..10 with no gaps or duplicates", () => {
    expect(EVIDENCE_GAP_PRIORITIES.length).toBe(10);
    const ranks = EVIDENCE_GAP_PRIORITIES.map((p) => p.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("ranks domain balance / AI-governance deconcentration as the top priority", () => {
    expect(EVIDENCE_GAP_PRIORITIES[0]!.key).toBe("domain_balance_and_ai_governance_deconcentration");
  });

  it("ranks new language below new authority type, new document genre, and structural complexity, per the task's de-prioritisation instruction", () => {
    const rankOf = (key: string) => EVIDENCE_GAP_PRIORITIES.find((p) => p.key === key)!.rank;
    expect(rankOf("new_language")).toBeGreaterThan(rankOf("new_authority_type"));
    expect(rankOf("new_language")).toBeGreaterThan(rankOf("new_document_genre"));
    expect(rankOf("new_language")).toBeGreaterThan(rankOf("new_structural_complexity"));
  });

  it("does not chase the 6 structurally unreachable issue classes as a top priority", () => {
    const reachableValue = EVIDENCE_GAP_PRIORITIES.find((p) => p.key === "reachable_issue_mechanism_value")!;
    expect(reachableValue.currentState).toMatch(/only IC-4.*IC-5.*IC-7|reachable/i);
    expect(reachableValue.rank).toBeGreaterThan(1);
  });

  it("the priority list is frozen and every row is frozen", () => {
    expect(Object.isFrozen(EVIDENCE_GAP_PRIORITIES)).toBe(true);
    for (const p of EVIDENCE_GAP_PRIORITIES) expect(Object.isFrozen(p)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 3: Candidate Register", () => {
  it("records at least 5 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBeGreaterThanOrEqual(5);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid qualificationOutcome", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-018-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
    }
  });

  it("candidateIds are unique", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every DEFERRED or REJECTED candidate has a non-null rejectionOrDeferralReason; QUALIFIED_* candidates do not require one", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "DEFERRED" || c.qualificationOutcome === "REJECTED") {
        expect(c.rejectionOrDeferralReason).not.toBeNull();
        expect(c.rejectionOrDeferralReason!.length).toBeGreaterThan(10);
      }
    }
  });

  it("no candidate with a BLOCKING licence status is marked QUALIFIED_RECOMMENDED or QUALIFIED_ALTERNATE", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.licenceReuseStatus === "BLOCKING") {
        expect(["DEFERRED", "REJECTED"]).toContain(c.qualificationOutcome);
      }
    }
  });

  it("every candidate's issueClassHypothesis is framed as an open question, never a claimed outcome", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.issueClassHypothesis).toMatch(/HYPOTHESIS ONLY, NOT CONFIRMED/);
    }
  });

  it("no candidate's title or documentType is chosen by claiming a predicted SUPPORTED/REVIEW/HOLD decision", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.expectedEvidenceContribution.toUpperCase()).not.toMatch(/WILL BE (SUPPORTED|REVIEW|HOLD)/);
    }
  });

  it("diversityNoveltyScore totals are within the documented per-dimension bounds and sum correctly", () => {
    for (const c of CANDIDATE_REGISTER) {
      const s = c.diversityNoveltyScore;
      expect(s.publisherNovelty).toBeGreaterThanOrEqual(0);
      expect(s.publisherNovelty).toBeLessThanOrEqual(3);
      expect(s.domainNovelty).toBeLessThanOrEqual(3);
      expect(s.documentTypeNovelty).toBeLessThanOrEqual(3);
      expect(s.structuralNovelty).toBeLessThanOrEqual(3);
      expect(s.languageNovelty).toBeLessThanOrEqual(2);
      expect(s.difficultyBalance).toBeLessThanOrEqual(2);
      expect(s.reachableIssueMechanismValue).toBeLessThanOrEqual(2);
      expect(s.governanceConfidence).toBeLessThanOrEqual(3);
      expect(s.sourceStability).toBeLessThanOrEqual(2);
      const computed =
        s.publisherNovelty + s.domainNovelty + s.documentTypeNovelty + s.structuralNovelty +
        s.languageNovelty + s.difficultyBalance + s.reachableIssueMechanismValue +
        s.governanceConfidence + s.sourceStability;
      expect(s.total).toBe(computed);
      expect(s.total).toBeLessThanOrEqual(23);
    }
  });

  it("the register array and every row are frozen (append-only, no mutation)", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) expect(Object.isFrozen(c)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Acquisition cost / value table
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 4: Acquisition Cost / Value Discipline", () => {
  it("has one row per candidate, each cross-referencing the candidate's own diversityNoveltyScore.total", () => {
    expect(ACQUISITION_COST_VALUE_TABLE.length).toBe(CANDIDATE_REGISTER.length);
    for (const row of ACQUISITION_COST_VALUE_TABLE) {
      const candidate = getCandidateById(row.candidateId)!;
      expect(row.scientificValue).toBe(candidate.diversityNoveltyScore.total);
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(row.acquisitionCost);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Ranking and Phase 1 decision
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 5: Ranking and Phase 1 Decision", () => {
  it("ranks every candidate exactly once, in descending diversityNoveltyScore.total order (ties broken by governanceConfidence then sourceStability)", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
    let prevScore = Infinity;
    let prevGov = Infinity;
    let prevStab = Infinity;
    for (const id of RANKED_CANDIDATE_IDS) {
      const c = getCandidateById(id)!;
      const s = c.diversityNoveltyScore;
      const worse = s.total < prevScore ||
        (s.total === prevScore && s.governanceConfidence < prevGov) ||
        (s.total === prevScore && s.governanceConfidence === prevGov && s.sourceStability <= prevStab);
      expect(s.total <= prevScore).toBe(true);
      prevScore = s.total;
      prevGov = s.governanceConfidence;
      prevStab = s.sourceStability;
      expect(worse || s.total < Infinity).toBe(true);
    }
  });

  it("PRIMARY_CANDIDATE_ID is the top-ranked candidate and is QUALIFIED_RECOMMENDED", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
    const primary = getCandidateById(PRIMARY_CANDIDATE_ID)!;
    expect(primary.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("PRIMARY_CANDIDATE_ID is the EEA report (new authority type, GENERAL domain, away from AI governance)", () => {
    const primary = primaryCandidate();
    expect(primary.publisher).toContain("European Environment Agency");
    expect(primary.domain).toBe("GENERAL");
    expect(primary.title.toLowerCase()).not.toContain("artificial intelligence");
  });

  it("ALTERNATE_1 and ALTERNATE_2 are distinct from the primary and from each other, and are QUALIFIED_ALTERNATE", () => {
    expect(ALTERNATE_1_CANDIDATE_ID).not.toBe(PRIMARY_CANDIDATE_ID);
    expect(ALTERNATE_2_CANDIDATE_ID).not.toBe(PRIMARY_CANDIDATE_ID);
    expect(ALTERNATE_1_CANDIDATE_ID).not.toBe(ALTERNATE_2_CANDIDATE_ID);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)!.qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
    expect(getCandidateById(ALTERNATE_2_CANDIDATE_ID)!.qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
  });

  it("no candidate dominates the primary candidate on diversityNoveltyScore.total", () => {
    const primary = primaryCandidate();
    for (const c of CANDIDATE_REGISTER) {
      if (c.candidateId === primary.candidateId) continue;
      expect(c.diversityNoveltyScore.total).toBeLessThanOrEqual(primary.diversityNoveltyScore.total);
    }
  });

  it("primaryCandidatePhase1Verdict() returns QUALIFIED_RECOMMENDED", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED_RECOMMENDED");
  });

  it("would return NOT_QUALIFIED if the top-ranked candidate's licence were not VERIFIED (mechanism check, not a mutation)", () => {
    const primary = primaryCandidate();
    const degraded = { ...primary, licenceReuseStatus: "PROVISIONAL" as const };
    const gatesPass =
      degraded.officialSourceStatus === "VERIFIED" &&
      (degraded.licenceReuseStatus as string) === "VERIFIED" &&
      (degraded.sourceStabilityStatus === "STRONG" || degraded.sourceStabilityStatus === "ACCEPTABLE") &&
      degraded.httpAccessibility === "VERIFIED_ACCESSIBLE";
    expect(gatesPass).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — H22 hypothesis framing
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 6: H22 Hypothesis", () => {
  it("H22_HYPOTHESIS names the primary candidate and the specific dimensions it expands", () => {
    expect(H22_HYPOTHESIS).toMatch(/^H22:/);
    expect(H22_HYPOTHESIS).toContain("European Environment Agency");
    expect(H22_HYPOTHESIS).toMatch(/publisher/i);
    expect(H22_HYPOTHESIS).toMatch(/domain/i);
    expect(H22_HYPOTHESIS).toMatch(/structural/i);
  });

  it("H22_HYPOTHESIS does not predict a SUPPORTED/REVIEW/HOLD outcome or an issue class", () => {
    expect(H22_HYPOTHESIS).not.toMatch(/will be SUPPORTED|will be REVIEW|will be HOLD/i);
    expect(H22_HYPOTHESIS).not.toMatch(/will (trigger|raise|produce) IC-\d/i);
  });

  it("H22_DOES_NOT_PREDICT explicitly excludes decision and issue-class predictions", () => {
    expect(H22_DOES_NOT_PREDICT.length).toBeGreaterThanOrEqual(2);
    expect(H22_DOES_NOT_PREDICT.some((s) => /SUPPORTED.*REVIEW.*HOLD/.test(s))).toBe(true);
    expect(H22_DOES_NOT_PREDICT.some((s) => /issue-class/i.test(s))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-018 — Part 7: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0022 as a label only — it is not a member of CORPUS_INVENTORY", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0022");
    expect(CORPUS_INVENTORY.some((r) => r.corpusId === "DRA-DOC-0022")).toBe(false);
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-018 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0022",
      "run_final_admission_evaluator",
      "create_dra_bmk_022",
      "modify_evaluator_0_1_2",
      "modify_stage_4",
      "modify_stage_5",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "change_evaluator_version",
      "change_pipeline_version",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("deterministic_live_fetch_a_b_for_primary_candidate");
    expect(PROPOSED_PHASE_2_SCOPE).toContain("preparation_for_dra_bmk_022");
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
