/**
 * DRA-ACQ-019 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0023 (Enforcement / Decision Document Gap)
 *
 * Proves the corpus profile reconstruction, target-class priority, desired
 * structural-element list, candidate register, ranking, Phase 1
 * qualification verdict, qualification record, and Phase 1 scope boundary
 * recorded in dra-acq-019-enforcement-decision-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from today's live-source re-verification (recorded as fixed data
 * in the module under test).
 */

import { describe, it, expect } from "vitest";

import {
  CORPUS_INVENTORY,
  REAL_ACQUISITIONS,
  REAL_DOMAIN_COUNTS,
  REAL_DOCUMENT_TYPE_COUNTS,
  leastRepresentedRealDomains,
  CORPUS_PROFILE_SUMMARY,
  TARGET_CLASS_PRIORITY,
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
  getCandidateById,
  primaryCandidate,
  primaryCandidatePhase1Verdict,
  PHASE_1_QUALIFICATION_RECORD,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
  RESERVED_NEXT_CORPUS_ID,
} from "../dra-acq-019-enforcement-decision-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION, DRA_PIPELINE_VERSION, DRA_MODEL_VERSION } from "../../../../model/versions.js";

// ---------------------------------------------------------------------------
// Part 1 — Corpus profile integrity (22 documents)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-019 — Part 1: Reconstructed 22-Document Corpus Profile", () => {
  it("records exactly 22 corpus documents, in order", () => {
    expect(CORPUS_INVENTORY.length).toBe(22);
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids[0]).toBe("DRA-DOC-0001");
    expect(ids[ids.length - 1]).toBe("DRA-DOC-0022");
    for (let i = 0; i < ids.length; i++) {
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

  it("exactly 16 documents are real acquisitions (DRA-DOC-0007 through 0022)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(16);
    expect(REAL_ACQUISITIONS[0]!.corpusId).toBe("DRA-DOC-0007");
    expect(REAL_ACQUISITIONS[REAL_ACQUISITIONS.length - 1]!.corpusId).toBe("DRA-DOC-0022");
  });

  it("DRA-DOC-0022 is the European Environment Agency report added at DRA-ACQ-018 Phase 2", () => {
    const row = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0022");
    expect(row?.publisher).toBe("European Environment Agency (EEA)");
    expect(row?.domain).toBe("GENERAL");
    expect(row?.documentType).toBe("REPORT");
    expect(row?.acquisitionId).toBe("DRA-ACQ-000025");
  });

  it("real-acquisition domain counts show BUSINESS/LEGAL/HEALTHCARE/FINANCE tied at the 2-document floor, GENERAL at 3, TECHNICAL at 5", () => {
    expect(REAL_DOMAIN_COUNTS.get("TECHNICAL")).toBe(5);
    expect(REAL_DOMAIN_COUNTS.get("GENERAL")).toBe(3);
    for (const d of ["BUSINESS", "LEGAL", "HEALTHCARE", "FINANCE"] as const) {
      expect(REAL_DOMAIN_COUNTS.get(d)).toBe(2);
    }
    const total = [...REAL_DOMAIN_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(16);
  });

  it("leastRepresentedRealDomains returns exactly the four domains tied at the floor, excluding GENERAL and TECHNICAL", () => {
    const least = leastRepresentedRealDomains();
    expect(new Set(least)).toEqual(new Set(["BUSINESS", "LEGAL", "HEALTHCARE", "FINANCE"]));
    expect(least).not.toContain("GENERAL");
    expect(least).not.toContain("TECHNICAL");
  });

  it("real-acquisition documentType counts sum to 16", () => {
    const total = [...REAL_DOCUMENT_TYPE_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(16);
  });

  it("records the enforcement/decision gap and total-document counts in the profile summary", () => {
    expect(CORPUS_PROFILE_SUMMARY.totalDocuments).toBe(22);
    expect(CORPUS_PROFILE_SUMMARY.realAcquisitions).toBe(16);
    expect(CORPUS_PROFILE_SUMMARY.enforcementDecisionGap).toMatch(/zero of the 22/i);
    expect(CORPUS_PROFILE_SUMMARY.enforcementDecisionGap.length).toBeGreaterThan(20);
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
// Part 2 — Target document class priority and structural elements
// ---------------------------------------------------------------------------

describe("DRA-ACQ-019 — Part 2: Target Class Priority and Structural Elements", () => {
  it("records exactly 5 target-class priorities, ranked 1..5 with adjudicated regulatory decision first", () => {
    expect(TARGET_CLASS_PRIORITY.length).toBe(5);
    const ranks = TARGET_CLASS_PRIORITY.map((p) => p.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
    expect(TARGET_CLASS_PRIORITY[0]!.key).toBe("adjudicated_regulatory_decision");
    expect(TARGET_CLASS_PRIORITY[4]!.key).toBe("equivalent_authoritative_determination");
  });

  it("records exactly 11 desired structural elements", () => {
    expect(DESIRED_STRUCTURAL_ELEMENTS.length).toBe(11);
    expect(new Set(DESIRED_STRUCTURAL_ELEMENTS).size).toBe(11);
  });

  it("TARGET_CLASS_PRIORITY and DESIRED_STRUCTURAL_ELEMENTS are frozen", () => {
    expect(Object.isFrozen(TARGET_CLASS_PRIORITY)).toBe(true);
    for (const p of TARGET_CLASS_PRIORITY) expect(Object.isFrozen(p)).toBe(true);
    expect(Object.isFrozen(DESIRED_STRUCTURAL_ELEMENTS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-019 — Part 3: Candidate Register", () => {
  it("records exactly 5 candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(5);
  });

  it("every candidate has a well-formed candidateId, valid domain/documentType, and a valid status set", () => {
    for (const c of CANDIDATE_REGISTER) {
      expect(c.candidateId).toMatch(/^DRA-CAND-019-\d{2}$/);
      expect(DOMAINS).toContain(c.domain);
      expect(DOCUMENT_TYPES).toContain(c.documentType);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(c.qualificationOutcome);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(c.officialSourceStatus);
      expect(LICENCE_REUSE_STATUSES).toContain(c.licenceReuseStatus);
      expect(HTTP_ACCESSIBILITY_STATUSES).toContain(c.httpAccessibility);
      expect(SOURCE_STABILITY_STATUSES).toContain(c.sourceStabilityStatus);
      expect(c.targetClassRank).toBeGreaterThanOrEqual(1);
      expect(c.targetClassRank).toBeLessThanOrEqual(5);
    }
  });

  it("candidateIds are unique", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every DEFERRED or REJECTED_BLOCKED candidate has a non-null rejectionOrDeferralReason", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.qualificationOutcome === "DEFERRED" || c.qualificationOutcome === "REJECTED_BLOCKED") {
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

  it("every BLOCKED candidate has an empty structuralElementsObserved list (nothing assumed from an inaccessible document)", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "BLOCKED") {
        expect(c.structuralElementsObserved.length).toBe(0);
      }
    }
  });

  it("every VERIFIED_ACCESSIBLE + BYTE_STABLE candidate observed all 11 desired structural elements from directly extracted text", () => {
    for (const c of CANDIDATE_REGISTER) {
      if (c.httpAccessibility === "VERIFIED_ACCESSIBLE" && c.sourceStabilityStatus === "BYTE_STABLE") {
        expect(c.structuralElementsObserved.length).toBe(DESIRED_STRUCTURAL_ELEMENTS.length);
        for (const el of c.structuralElementsObserved) {
          expect(DESIRED_STRUCTURAL_ELEMENTS).toContain(el);
        }
      }
    }
  });

  it("the two Cloudflare-blocked candidates (Ofwat, Ofcom) are both new (non-repeat) publishers", () => {
    const blocked = CANDIDATE_REGISTER.filter((c) => c.httpAccessibility === "BLOCKED");
    expect(blocked.length).toBe(2);
    for (const c of blocked) {
      expect(c.isRepeatPublisher).toBe(false);
    }
  });

  it("the primary candidate is the only candidate with a VERIFIED licence status", () => {
    const verifiedLicence = CANDIDATE_REGISTER.filter((c) => c.licenceReuseStatus === "VERIFIED");
    expect(verifiedLicence.length).toBe(1);
    expect(verifiedLicence[0]!.candidateId).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("the candidate register and every row are frozen", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const c of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(c)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-019 — Part 4: Ranking and Phase 1 Verdict", () => {
  it("ranks the CMA infringement decision (DRA-CAND-019-01) first", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe("DRA-CAND-019-01");
    expect(RANKED_CANDIDATE_IDS[0]).toBe(PRIMARY_CANDIDATE_ID);
  });

  it("ranks the ICO Capita penalty notice (DRA-CAND-019-02) second", () => {
    expect(RANKED_CANDIDATE_IDS[1]).toBe("DRA-CAND-019-02");
    expect(RANKED_CANDIDATE_IDS[1]).toBe(ALTERNATE_1_CANDIDATE_ID);
  });

  it("ranks both BLOCKED candidates (Ofwat, Ofcom) strictly last", () => {
    const last2 = RANKED_CANDIDATE_IDS.slice(-2);
    expect(new Set(last2)).toEqual(new Set(["DRA-CAND-019-04", "DRA-CAND-019-05"]));
  });

  it("RANKED_CANDIDATE_IDS contains every candidate exactly once", () => {
    expect(RANKED_CANDIDATE_IDS.length).toBe(CANDIDATE_REGISTER.length);
    expect(new Set(RANKED_CANDIDATE_IDS).size).toBe(CANDIDATE_REGISTER.length);
  });

  it("getCandidateById resolves the primary and alternate candidates and returns undefined for an unknown id", () => {
    expect(getCandidateById(PRIMARY_CANDIDATE_ID)?.title).toMatch(/vehicle recycling/i);
    expect(getCandidateById(ALTERNATE_1_CANDIDATE_ID)?.title).toMatch(/Capita/i);
    expect(getCandidateById("DRA-CAND-019-99")).toBeUndefined();
  });

  it("primaryCandidate returns the CMA decision and throws only if PRIMARY_CANDIDATE_ID were ever invalid", () => {
    const c = primaryCandidate();
    expect(c.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(c.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
  });

  it("primaryCandidatePhase1Verdict returns QUALIFIED given VERIFIED official source, VERIFIED licence, byte-stable accessibility, and full structural-element coverage", () => {
    expect(primaryCandidatePhase1Verdict()).toBe("QUALIFIED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

describe("DRA-ACQ-019 — Part 5: Phase 1 Qualification Record", () => {
  it("records a QUALIFIED recommendation matching the primary candidate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.recommendation).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.title).toBe(primaryCandidate().title);
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity.issuingAuthority).toBe(primaryCandidate().publisher);
  });

  it("covers every field required by the DRA-ACQ-019 task specification", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateIdentity).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.governance).toBeDefined();
    expect(PHASE_1_QUALIFICATION_RECORD.acquisition).toBeDefined();
    expect(typeof PHASE_1_QUALIFICATION_RECORD.evidenceContribution).toBe("string");
    expect(typeof PHASE_1_QUALIFICATION_RECORD.corpusContribution).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.risks.length).toBeGreaterThan(0);
    expect(typeof PHASE_1_QUALIFICATION_RECORD.recommendationReasoning).toBe("string");
    expect(PHASE_1_QUALIFICATION_RECORD.recommendationReasoning.length).toBeGreaterThan(50);
  });

  it("names the next-best candidate as the ICO Capita alternate", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.nextBestCandidateIfRejected).toContain(ALTERNATE_1_CANDIDATE_ID);
  });

  it("discloses the domain/publisher non-improvement limitation rather than omitting it", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.corpusContribution).toMatch(/does not/i);
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

describe("DRA-ACQ-019 — Part 6: Phase 1 Scope Boundary", () => {
  it("reserves DRA-DOC-0023 as a label only — it is not a member of CORPUS_INVENTORY", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0023");
    expect(CORPUS_INVENTORY.some((r) => r.corpusId === "DRA-DOC-0023")).toBe(false);
  });

  it("lists the exact prohibited actions named by the DRA-ACQ-019 task specification", () => {
    for (const action of [
      "freeze_selected_document",
      "admit_dra_doc_0023",
      "run_final_admission_evaluator",
      "create_dra_bmk_023",
      "create_dra_frz_000017",
      "modify_evaluator_0_1_2",
      "modify_normalisation",
      "modify_existing_frozen_artefacts",
      "change_evaluator_version",
      "change_pipeline_version",
      "weaken_acquisition_or_governance_requirements",
      "repair_stale_0_1_1_assertion_debt",
      "address_dra_bmk_022_performance_defect",
    ] as const) {
      expect(PHASE_1_PROHIBITED_ACTIONS).toContain(action);
    }
  });

  it("PROPOSED_PHASE_2_SCOPE is defined but this module performs none of it", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(5);
    expect(PROPOSED_PHASE_2_SCOPE).toContain("deterministic_live_fetch_a_b_for_primary_candidate");
    expect(PROPOSED_PHASE_2_SCOPE).toContain("corpus_admission_as_dra_doc_0023");
  });

  it("PHASE_1_PROHIBITED_ACTIONS and RESERVED_NEXT_CORPUS_ID are frozen", () => {
    expect(Object.isFrozen(PHASE_1_PROHIBITED_ACTIONS)).toBe(true);
    expect(typeof RESERVED_NEXT_CORPUS_ID).toBe("string");
  });
});
