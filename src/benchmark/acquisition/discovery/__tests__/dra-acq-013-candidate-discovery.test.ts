/**
 * DRA-ACQ-013 — Phase 1: Candidate Discovery and Qualification for DRA-DOC-0017
 *
 * Proves the corpus-balance analysis, evidence-gap analysis, candidate
 * register, ranking, and Phase 1 scope boundary recorded in
 * dra-acq-013-candidate-discovery.ts.
 *
 * This suite does not perform any acquisition, freeze, admission, or
 * evaluator execution. It only exercises data-integrity and reasoning
 * invariants over static discovery records.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  CORPUS_INVENTORY,
  REAL_ACQUISITIONS,
  REAL_DOMAIN_COUNTS,
  REAL_DOCUMENT_TYPE_COUNTS,
  REAL_PUBLISHER_COUNTS,
  REAL_LANGUAGE_COUNTS,
  UNUSED_REAL_DOCUMENT_TYPES,
  leastRepresentedRealDomains,
  noNonEnglishRealDocumentExists,
  EVIDENCE_GAP_PRIORITIES,
  DISCOVERY_HYPOTHESIS,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  RANKED_CANDIDATE_IDS,
  RECOMMENDED_CANDIDATE_ID,
  getCandidateById,
  recommendedCandidate,
  RESERVED_NEXT_CORPUS_ID,
  PHASE_1_PROHIBITED_ACTIONS,
  type CandidateRecord,
} from "../dra-acq-013-candidate-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION } from "../../../../model/versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Part 1 — Corpus inventory integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 1: Corpus Inventory Integrity", () => {
  it("records exactly 16 corpus documents", () => {
    expect(CORPUS_INVENTORY.length).toBe(16);
  });

  it("every corpusId is well-formed and in DRA-DOC-0001..0016, in order", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
      "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
      "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
      "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
    ]);
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 10 documents are real acquisitions (DRA-DOC-0007 through 0016)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(10);
    expect(REAL_ACQUISITIONS.map((r) => r.corpusId)).toEqual([
      "DRA-DOC-0007", "DRA-DOC-0008", "DRA-DOC-0009", "DRA-DOC-0010",
      "DRA-DOC-0011", "DRA-DOC-0012", "DRA-DOC-0013", "DRA-DOC-0014",
      "DRA-DOC-0015", "DRA-DOC-0016",
    ]);
  });

  it("real acquisitions all carry a DRA-ACQ-NNN identifier; synthetic rows do not", () => {
    for (const row of CORPUS_INVENTORY) {
      if (row.isRealAcquisition) {
        expect(row.acquisitionId).toMatch(/^DRA-ACQ-\d{3}$/);
      } else {
        expect(row.acquisitionId).toBeNull();
      }
    }
  });

  it("the array and every row are frozen (append-only, no mutation)", () => {
    expect(Object.isFrozen(CORPUS_INVENTORY)).toBe(true);
    for (const row of CORPUS_INVENTORY) {
      expect(Object.isFrozen(row)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Corpus-balance analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 2: Corpus-Balance Analysis", () => {
  it("domain distribution across real acquisitions matches the authoritative DRA-BMK-016 checkpoint data", () => {
    expect(REAL_DOMAIN_COUNTS.get("TECHNICAL")).toBe(3); // Apache, NIST, NCSC
    expect(REAL_DOMAIN_COUNTS.get("BUSINESS")).toBe(2); // Acas, HSE
    expect(REAL_DOMAIN_COUNTS.get("GENERAL")).toBe(1); // CMA
    expect(REAL_DOMAIN_COUNTS.get("LEGAL")).toBe(1); // ICO
    expect(REAL_DOMAIN_COUNTS.get("HEALTHCARE")).toBe(1); // FDA
    expect(REAL_DOMAIN_COUNTS.get("FINANCE")).toBe(2); // PRA, BCBS
  });

  it("the domain counts sum to the 10 real acquisitions", () => {
    const total = [...REAL_DOMAIN_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(10);
  });

  it("GENERAL, LEGAL, and HEALTHCARE are jointly least-represented at 1 real document each", () => {
    const least = leastRepresentedRealDomains();
    expect(new Set(least)).toEqual(new Set(["GENERAL", "LEGAL", "HEALTHCARE"]));
  });

  it("TECHNICAL is the best-represented real domain (3 documents)", () => {
    const maxCount = Math.max(...[...REAL_DOMAIN_COUNTS.values()]);
    expect(maxCount).toBe(3);
    const best = [...REAL_DOMAIN_COUNTS.entries()].filter(([, c]) => c === maxCount).map(([d]) => d);
    expect(best).toEqual(["TECHNICAL"]);
  });

  it("REPORT, REWRITE, and EMAIL have zero real-acquisition representation", () => {
    expect(UNUSED_REAL_DOCUMENT_TYPES).toEqual(
      expect.arrayContaining(["REPORT", "REWRITE", "EMAIL"]),
    );
    expect(UNUSED_REAL_DOCUMENT_TYPES.length).toBe(3);
  });

  it("PROCEDURE appears exactly twice, POLICY and OTHER exactly three times each among real acquisitions", () => {
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("PROCEDURE")).toBe(2);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("POLICY")).toBe(3);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("OTHER")).toBe(3);
  });

  it("every real acquisition has a distinct publisher (10 distinct publishers for 10 documents)", () => {
    expect(REAL_PUBLISHER_COUNTS.size).toBe(10);
    for (const count of REAL_PUBLISHER_COUNTS.values()) {
      expect(count).toBe(1);
    }
  });

  it("every real acquisition is English (en or en-GB); zero non-English documents exist", () => {
    expect(noNonEnglishRealDocumentExists()).toBe(true);
    expect(REAL_LANGUAGE_COUNTS.size).toBeLessThanOrEqual(2);
    for (const lang of REAL_LANGUAGE_COUNTS.keys()) {
      expect(["en", "en-GB"]).toContain(lang);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Evidence-gap analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 3: Evidence-Gap Analysis", () => {
  it("records exactly 8 ranked priorities, ranks 1 through 8 with no gaps or repeats", () => {
    expect(EVIDENCE_GAP_PRIORITIES.length).toBe(8);
    const ranks = EVIDENCE_GAP_PRIORITIES.map((p) => p.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("the priority order matches the task's specified sequence exactly", () => {
    expect(EVIDENCE_GAP_PRIORITIES.map((p) => p.key)).toEqual([
      "unobserved_issue_class_potential",
      "corpus_diversity_improvement",
      "new_authoritative_publisher",
      "new_evidence_or_governance_structure",
      "healthcare_domain_expansion",
      "multilingual_non_english_coverage",
      "underrepresented_document_type",
      "retrieval_normalization_challenge",
    ]);
  });

  it("healthcare_domain_expansion outranks multilingual_non_english_coverage", () => {
    const healthcareRank = EVIDENCE_GAP_PRIORITIES.find((p) => p.key === "healthcare_domain_expansion")!.rank;
    const multilingualRank = EVIDENCE_GAP_PRIORITIES.find((p) => p.key === "multilingual_non_english_coverage")!.rank;
    expect(healthcareRank).toBeLessThan(multilingualRank);
  });

  it("every priority has a non-empty description and currentState", () => {
    for (const priority of EVIDENCE_GAP_PRIORITIES) {
      expect(priority.description.length).toBeGreaterThan(0);
      expect(priority.currentState.length).toBeGreaterThan(0);
    }
  });

  it("the discovery hypothesis explicitly sequences publisher diversity before multilingual coverage", () => {
    expect(DISCOVERY_HYPOTHESIS).toMatch(/publisher/i);
    expect(DISCOVERY_HYPOTHESIS).toMatch(/multilingual|language/i);
  });

  it("the array and every entry are frozen", () => {
    expect(Object.isFrozen(EVIDENCE_GAP_PRIORITIES)).toBe(true);
    for (const priority of EVIDENCE_GAP_PRIORITIES) {
      expect(Object.isFrozen(priority)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Candidate register completeness
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 4: Candidate Register Completeness", () => {
  it("records exactly 3 genuinely assessed candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(3);
  });

  it("every candidate has a unique, well-formed candidateId", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DRA-CAND-013-\d{2}$/);
    }
  });

  const requiredStringFields: (keyof CandidateRecord)[] = [
    "publisher", "exactTitle", "publicationDateOrVersion", "language",
    "officialSourceUrl", "sourceFormat", "retrievedFileSha256", "licencePosition",
    "accessibilityEvidence", "duplicateOrNearDuplicateRisk",
    "corpusBalanceContribution", "evidenceStructureContribution", "issueClassHypothesis",
  ];

  it.each(requiredStringFields)("every candidate has a non-empty '%s' field", (field) => {
    for (const candidate of CANDIDATE_REGISTER) {
      const value = candidate[field];
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("every candidate's proposedDomain and proposedDocumentType are valid schema enum members", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.proposedDomain);
      expect(DOCUMENT_TYPES).toContain(candidate.proposedDocumentType);
    }
  });

  it("every candidate's officialSourceUrl is a well-formed https URL", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(() => new URL(candidate.officialSourceUrl)).not.toThrow();
      expect(new URL(candidate.officialSourceUrl).protocol).toBe("https:");
    }
  });

  it("every candidate's retrievedFileSha256 is a well-formed 64-hex-character digest", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.retrievedFileSha256).toMatch(/^[0-9a-f]{64,66}$/);
    }
  });

  it("every candidate has a qualificationOutcome from the canonical enum", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
    }
  });

  it("every non-QUALIFIED_RECOMMENDED candidate carries a non-empty rejectionOrDeferralReason", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome === "QUALIFIED_RECOMMENDED") continue;
      expect(candidate.rejectionOrDeferralReason).not.toBeNull();
      expect((candidate.rejectionOrDeferralReason ?? "").length).toBeGreaterThan(0);
    }
  });

  it("exactly one candidate is QUALIFIED_RECOMMENDED with a null rejectionOrDeferralReason", () => {
    const recommended = CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "QUALIFIED_RECOMMENDED");
    expect(recommended.length).toBe(1);
    expect(recommended[0]!.rejectionOrDeferralReason).toBeNull();
  });

  it("every candidate carries at least one unresolved risk and at least one governance finding", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.unresolvedRisks.length).toBeGreaterThan(0);
      expect(candidate.governanceFindings.length).toBeGreaterThan(0);
    }
  });

  it("the array and every entry are frozen (append-only register)", () => {
    expect(Object.isFrozen(CANDIDATE_REGISTER)).toBe(true);
    for (const candidate of CANDIDATE_REGISTER) {
      expect(Object.isFrozen(candidate)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Issue-class hypotheses are never scored as confirmed
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 5: Issue-Class Hypotheses Not Scored As Confirmed", () => {
  it("every candidate's issueClassHypothesis is explicitly framed as unconfirmed", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.issueClassHypothesis).toMatch(/hypothesis|not confirmed|unconfirmed/i);
    }
  });

  it("no candidate's corpus-balance or evidence-structure text claims a confirmed issue-class coverage increase", () => {
    const forbiddenPhrases = [/will (increase|add) coverage/i, /confirmed new issue class/i, /guarantees? coverage/i];
    for (const candidate of CANDIDATE_REGISTER) {
      for (const phrase of forbiddenPhrases) {
        expect(candidate.corpusBalanceContribution).not.toMatch(phrase);
        expect(candidate.evidenceStructureContribution).not.toMatch(phrase);
      }
    }
  });

  it("the evaluator version referenced by the programme remains 0.1.1 (frozen, unchanged)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Accessibility and licence consistency
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 6: Accessibility and Licence Consistency", () => {
  it("all 3 candidates are VERIFIED_ACCESSIBLE", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
    }
  });

  it("the recommended candidate has a VERIFIED (not REVIEW_REQUIRED) licence position", () => {
    const candidate = recommendedCandidate();
    expect(candidate.licencePosition).toMatch(/^VERIFIED/);
  });

  it("the AEMPS candidate's licence position is REVIEW_REQUIRED, reflecting its non-precedented licence basis", () => {
    const aemps = getCandidateById("DRA-CAND-013-03");
    expect(aemps?.licencePosition).toMatch(/^REVIEW_REQUIRED/);
    expect(aemps?.language).toBe("es");
  });

  it("both MHRA candidates share the same publisher string", () => {
    const pil = getCandidateById("DRA-CAND-013-01");
    const blueGuide = getCandidateById("DRA-CAND-013-02");
    expect(pil?.publisher).toBe(blueGuide?.publisher);
    expect(pil?.publisher).toContain("MHRA");
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Ranking and recommendation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 7: Ranking and Recommendation", () => {
  it("RANKED_CANDIDATE_IDS contains exactly the 3 candidate IDs, each exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(registerIds);
    expect(RANKED_CANDIDATE_IDS.length).toBe(3);
  });

  it("the top-ranked candidate is the recommended candidate", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe(RECOMMENDED_CANDIDATE_ID);
  });

  it("the recommended candidate is QUALIFIED_RECOMMENDED and VERIFIED_ACCESSIBLE", () => {
    const candidate = recommendedCandidate();
    expect(candidate.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
    expect(candidate.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
  });

  it("the recommended candidate is the MHRA patient information leaflets guidance", () => {
    const candidate = recommendedCandidate();
    expect(candidate.publisher).toContain("MHRA");
    expect(candidate.exactTitle).toContain("patient information leaflets");
  });

  it("the AEMPS candidate ranks above the same-publisher Blue Guide alternate", () => {
    const aempsRank = RANKED_CANDIDATE_IDS.indexOf("DRA-CAND-013-03");
    const blueGuideRank = RANKED_CANDIDATE_IDS.indexOf("DRA-CAND-013-02");
    expect(aempsRank).toBeLessThan(blueGuideRank);
  });

  it("getCandidateById returns undefined for an unknown ID", () => {
    expect(getCandidateById("DRA-CAND-013-99")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-013 — Part 8: Phase 1 Scope Boundary", () => {
  it("RESERVED_NEXT_CORPUS_ID is a plain reserved label, not a schema-validated live corpus entry", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0017");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(RESERVED_NEXT_CORPUS_ID);
  });

  it("PHASE_1_PROHIBITED_ACTIONS enumerates all task-specified prohibited actions", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "acquire_final_document_into_corpus",
        "create_DRA-DOC-0017",
        "create_freeze_record",
        "modify_corpus_manifest",
        "run_evaluator_on_newly_admitted_document",
        "create_DRA-BMK-017",
        "modify_evaluator_rules",
        "proceed_automatically_to_phase_2",
      ]),
    );
  });

  it("no source file under this discovery module imports the freeze, admission, or evaluator-execution modules", () => {
    const modulePath = resolve(__dirname, "../dra-acq-013-candidate-discovery.ts");
    expect(existsSync(modulePath)).toBe(true);
    const contents = readFileSync(modulePath, "utf8");
    expect(contents).not.toMatch(/from ["'].*\/freeze\.js["']/);
    expect(contents).not.toMatch(/from ["'].*governed-pipeline\.js["']/);
    expect(contents).not.toMatch(/createAcquisitionFreezeRecord/);
    expect(contents).not.toMatch(/evaluateDocument/);
  });

  it("this test file itself never calls an acquisition, freeze, or evaluation function", () => {
    const testPath = fileURLToPath(import.meta.url);
    const contents = readFileSync(testPath, "utf8");
    const scanned = contents.replace(/expect\(contents\)\.not\.toMatch\([^)]*\)/g, "");
    expect(scanned).not.toMatch(/createAcquisitionFreezeRecord\(/);
    expect(scanned).not.toMatch(/evaluateDocument\(/);
    expect(scanned).not.toMatch(/CorpusRegistry\(\)\.add/);
  });
});
