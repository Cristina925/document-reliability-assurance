/**
 * DRA-ACQ-016 — Phase 1: Third-Language Candidate Discovery for
 * DRA-DOC-0020
 *
 * Proves the corpus inventory, third-language evidence-gap analysis,
 * candidate register, comparison, ranking, selection rule, and Phase 1
 * scope boundary recorded in dra-acq-016-third-multilingual-discovery.ts.
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
  REAL_LANGUAGE_COUNTS,
  REAL_PUBLISHER_COUNTS,
  REAL_DOMAIN_COUNTS,
  exactlyTwoNonEnglishRealDocumentsExistBothSpanish,
  BMK_019_DECISION_DISTRIBUTION,
  BMK_019_ISSUE_CLASS_COVERAGE,
  DRA_DOC_0018_0019_COMPARISON,
  WORKING_HYPOTHESIS,
  THIRD_LANGUAGE_EVIDENCE_GAP,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  LICENCE_REUSE_CATEGORIES,
  CANDIDATE_COMPARISON,
  RANKED_CANDIDATE_IDS,
  RECOMMENDED_CANDIDATE_ID,
  getCandidateById,
  recommendedCandidate,
  applySelectionRule,
  RESERVED_NEXT_CORPUS_ID,
  PHASE_1_PROHIBITED_ACTIONS,
  type CandidateRecord,
} from "../dra-acq-016-third-multilingual-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION } from "../../../../model/versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Part 1 — Corpus inventory integrity (19 documents, following DRA-BMK-019)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 1: Corpus Inventory Integrity", () => {
  it("records exactly 19 corpus documents", () => {
    expect(CORPUS_INVENTORY.length).toBe(19);
  });

  it("every corpusId is well-formed and in DRA-DOC-0001..0019, in order", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
      "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
      "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
      "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
      "DRA-DOC-0017", "DRA-DOC-0018", "DRA-DOC-0019",
    ]);
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 13 documents are real acquisitions (DRA-DOC-0007 through 0019)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(13);
    expect(REAL_ACQUISITIONS[REAL_ACQUISITIONS.length - 1]!.corpusId).toBe("DRA-DOC-0019");
  });

  it("DRA-DOC-0019 (INE, Spanish) is present with the expected metadata", () => {
    const ine = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0019");
    expect(ine).toBeDefined();
    expect(ine?.publisher).toContain("Instituto Nacional de Estadística");
    expect(ine?.domain).toBe("GENERAL");
    expect(ine?.language).toBe("es");
    expect(ine?.acquisitionId).toBe("DRA-ACQ-015");
  });

  it("exactly two real acquisitions are non-English, and both are Spanish", () => {
    expect(exactlyTwoNonEnglishRealDocumentsExistBothSpanish()).toBe(true);
    const nonEnglishLangs = [...REAL_LANGUAGE_COUNTS.keys()].filter(
      (lang) => lang !== "en" && lang !== "en-GB",
    );
    expect(nonEnglishLangs).toEqual(["es"]);
    expect(REAL_LANGUAGE_COUNTS.get("es")).toBe(2);
  });

  it("every real acquisition still has a distinct publisher (13 distinct publishers for 13 documents)", () => {
    expect(REAL_PUBLISHER_COUNTS.size).toBe(13);
    for (const count of REAL_PUBLISHER_COUNTS.values()) {
      expect(count).toBe(1);
    }
  });

  it("LEGAL is the most underrepresented real domain (exactly 1 real document)", () => {
    expect(REAL_DOMAIN_COUNTS.get("LEGAL")).toBe(1);
    for (const [domain, count] of REAL_DOMAIN_COUNTS.entries()) {
      if (domain === "LEGAL") continue;
      expect(count).toBeGreaterThanOrEqual(1);
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
// Part 2 — Third-language evidence-gap analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 2: Third-Language Evidence-Gap Analysis", () => {
  it("reproduces the fixed DRA-BMK-019 decision distribution (9 SUPPORTED, 8 REVIEW, 2 HOLD)", () => {
    expect(BMK_019_DECISION_DISTRIBUTION.SUPPORTED).toBe(9);
    expect(BMK_019_DECISION_DISTRIBUTION.REVIEW).toBe(8);
    expect(BMK_019_DECISION_DISTRIBUTION.HOLD).toBe(2);
    expect(
      BMK_019_DECISION_DISTRIBUTION.SUPPORTED +
        BMK_019_DECISION_DISTRIBUTION.REVIEW +
        BMK_019_DECISION_DISTRIBUTION.HOLD,
    ).toBe(19);
  });

  it("reproduces the fixed 3/9 issue-class coverage with the three known classes", () => {
    expect(BMK_019_ISSUE_CLASS_COVERAGE.fraction).toBe("3/9");
    expect(BMK_019_ISSUE_CLASS_COVERAGE.coveredClasses).toEqual([
      "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY",
    ]);
  });

  it("DRA_DOC_0018_0019_COMPARISON records NO_DIFFERENCE, explicitly scoped to the two Spanish documents", () => {
    expect(DRA_DOC_0018_0019_COMPARISON.comparisonCategory).toBe("NO_DIFFERENCE");
    expect(DRA_DOC_0018_0019_COMPARISON.comparedCorpusIds).toEqual(["DRA-DOC-0018", "DRA-DOC-0019"]);
    expect(DRA_DOC_0018_0019_COMPARISON.scopeStatement).toMatch(/explicitly scoped/i);
    expect(DRA_DOC_0018_0019_COMPARISON.scopeStatement).toMatch(/NOT a general claim/i);
  });

  it("the working hypothesis is framed as an open empirical question, not a conclusion or a task for this phase", () => {
    expect(WORKING_HYPOTHESIS).toMatch(/open empirical question/i);
    expect(WORKING_HYPOTHESIS).toMatch(/does not attempt to answer/i);
    expect(WORKING_HYPOTHESIS).toMatch(/third language/i);
  });

  it("the evidence-gap statement identifies a third language as the way to widen the inference, without claiming an outcome", () => {
    expect(THIRD_LANGUAGE_EVIDENCE_GAP).toMatch(/NO_DIFFERENCE/);
    expect(THIRD_LANGUAGE_EVIDENCE_GAP).toMatch(/third/i);
    expect(THIRD_LANGUAGE_EVIDENCE_GAP).not.toMatch(/will (increase|expand) coverage/i);
    expect(THIRD_LANGUAGE_EVIDENCE_GAP).toMatch(/not to be maximised for its own sake|not merely add/i);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register completeness
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 3: Candidate Register Completeness", () => {
  it("records exactly 3 genuinely assessed candidates, none Spanish or English", () => {
    expect(CANDIDATE_REGISTER.length).toBeGreaterThanOrEqual(3);
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.language).not.toBe("es");
      expect(candidate.language).not.toBe("en");
      expect(candidate.language).not.toBe("en-GB");
    }
  });

  it("every candidate has a unique, well-formed candidateId", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DRA-CAND-016-\d{2}$/);
    }
  });

  const requiredStringFields: (keyof CandidateRecord)[] = [
    "publisher", "exactTitle", "publicationDateOrVersion", "language",
    "officialSourceUrl", "sourceFormat", "retrievedFileSha256", "licencePosition",
    "accessibilityEvidence", "hypothesisTestingSuitability",
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

  it("every candidate's qualificationOutcome and licenceReuseCategory are from the canonical enums", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
      expect(LICENCE_REUSE_CATEGORIES).toContain(candidate.licenceReuseCategory);
    }
  });

  it("every non-QUALIFIED_RECOMMENDED candidate carries a non-empty rejectionOrDeferralReason", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome === "QUALIFIED_RECOMMENDED") continue;
      expect(candidate.rejectionOrDeferralReason).not.toBeNull();
      expect((candidate.rejectionOrDeferralReason ?? "").length).toBeGreaterThan(0);
    }
  });

  it("at most one candidate is QUALIFIED_RECOMMENDED", () => {
    const recommended = CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "QUALIFIED_RECOMMENDED");
    expect(recommended.length).toBeLessThanOrEqual(1);
  });

  it("every candidate carries at least one unresolved risk and at least one governance finding", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.unresolvedRisks.length).toBeGreaterThan(0);
      expect(candidate.governanceFindings.length).toBeGreaterThan(0);
    }
  });

  it("every candidate's technicalSuitability record is populated", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      const ts = candidate.technicalSuitability;
      expect(ts.language.length).toBeGreaterThan(0);
      expect(ts.script.length).toBeGreaterThan(0);
      expect(ts.format.length).toBeGreaterThan(0);
      expect(typeof ts.hasAccentedCharacters).toBe("boolean");
      expect(typeof ts.hasAnnexes).toBe("boolean");
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
// Part 4 — Two genuinely distinct candidate third languages were assessed
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 4: Distinct Candidate Languages", () => {
  it("at least two distinct non-Spanish, non-English languages appear across the register (fr and de)", () => {
    const languages = new Set(CANDIDATE_REGISTER.map((c) => c.language));
    expect(languages.has("fr")).toBe(true);
    expect(languages.has("de")).toBe(true);
  });

  it("the CNIL candidate (fr) is present with the expected metadata", () => {
    const cnil = getCandidateById("DRA-CAND-016-01");
    expect(cnil).toBeDefined();
    expect(cnil!.publisher).toContain("CNIL");
    expect(cnil!.language).toBe("fr");
    expect(cnil!.proposedDomain).toBe("LEGAL");
  });

  it("the BSI candidate (de) is present with the expected metadata", () => {
    const bsi = getCandidateById("DRA-CAND-016-02");
    expect(bsi).toBeDefined();
    expect(bsi!.publisher).toContain("BSI");
    expect(bsi!.language).toBe("de");
    expect(bsi!.proposedDomain).toBe("TECHNICAL");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Licence scrutiny
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 5: Licence Scrutiny", () => {
  it("no candidate's licence position is inferred merely from public accessibility", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.licencePosition).not.toMatch(/because it is publicly accessible/i);
    }
  });

  it("a candidate with a REJECTED, BESPOKE_REUSE_PERMISSION, or NO_VERIFIED_REUSE_PERMISSION licence is never QUALIFIED_RECOMMENDED", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (
        candidate.licenceReuseCategory === "NO_VERIFIED_REUSE_PERMISSION" ||
        candidate.licenceReuseCategory === "BESPOKE_REUSE_PERMISSION" ||
        candidate.licenceReuseCategory === "AMBIGUOUS_COPYRIGHT_STATEMENT"
      ) {
        expect(candidate.qualificationOutcome).not.toBe("QUALIFIED_RECOMMENDED");
      }
    }
  });

  it("the BSI candidate is DEFERRED with BESPOKE_REUSE_PERMISSION, not REJECTED and not upgraded", () => {
    const bsi = getCandidateById("DRA-CAND-016-02");
    expect(bsi).toBeDefined();
    expect(bsi!.licenceReuseCategory).toBe("BESPOKE_REUSE_PERMISSION");
    expect(bsi!.licencePosition).toMatch(/^REVIEW_REQUIRED/);
    expect(bsi!.qualificationOutcome).toBe("DEFERRED");
  });

  it("the Banque de France / ACPR candidate is REJECTED for this phase due to a blocked access path, not a read licence", () => {
    const bdf = getCandidateById("DRA-CAND-016-03");
    expect(bdf).toBeDefined();
    expect(bdf!.httpAccessibility).toBe("BLOCKED_BOT_CHALLENGE");
    expect(bdf!.qualificationOutcome).toBe("REJECTED");
  });

  it("the recommended candidate (if any) has a NAMED_OPEN_LICENCE reuse category", () => {
    const rec = recommendedCandidate();
    if (rec) {
      expect(rec.licenceReuseCategory).toBe("NAMED_OPEN_LICENCE");
    }
  });

  it("the recommended candidate's licence is a named Creative Commons licence, explicitly flagged as a different tier (ND) from the CC BY 4.0 precedent", () => {
    const rec = recommendedCandidate();
    if (rec) {
      expect(rec.licencePosition).toMatch(/CC BY-ND 4\.0/);
      expect(rec.licencePosition).toMatch(/materially different licence TIER/i);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Corpus contribution and hypothesis-testing framing: confirmed vs speculative
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 6: Corpus Contribution and Hypothesis Framing", () => {
  it("every candidate's issueClassHypothesis is explicitly framed as unconfirmed", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.issueClassHypothesis).toMatch(/hypothesis|not confirmed|unconfirmed/i);
    }
  });

  it("no candidate's diversity-contribution text claims a confirmed issue-class coverage increase", () => {
    const forbiddenPhrases = [/will (increase|add|expand) coverage/i, /confirmed new issue class/i, /guarantees? coverage/i];
    for (const candidate of CANDIDATE_REGISTER) {
      for (const phrase of forbiddenPhrases) {
        expect(candidate.languageDiversityContribution).not.toMatch(phrase);
        expect(candidate.evidenceStructureDiversityContribution).not.toMatch(phrase);
      }
    }
  });

  it("no candidate's hypothesisTestingSuitability text predicts a specific outcome of the multilingual-generalisation question", () => {
    const forbiddenPhrases = [/will (confirm|prove|show)/i, /is (language|document)-specific/i];
    for (const candidate of CANDIDATE_REGISTER) {
      for (const phrase of forbiddenPhrases) {
        expect(candidate.hypothesisTestingSuitability).not.toMatch(phrase);
      }
    }
  });

  it("the recommended candidate's domain contribution explicitly narrows the LEGAL-domain gap rather than merely adding a language", () => {
    const rec = recommendedCandidate();
    if (rec) {
      expect(rec.domainDiversityContribution).toMatch(/LEGAL/);
      expect(rec.domainDiversityContribution).toMatch(/underrepresented/i);
    }
  });

  it("the evaluator version referenced by the programme remains 0.1.1 (frozen, unchanged)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Candidate comparison and ranking
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 7: Candidate Comparison and Ranking", () => {
  it("CANDIDATE_COMPARISON covers every candidate exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    const comparisonIds = new Set(CANDIDATE_COMPARISON.map((c) => c.candidateId));
    expect(comparisonIds).toEqual(registerIds);
  });

  it("RANKED_CANDIDATE_IDS contains exactly the candidate IDs, each exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(registerIds);
  });

  it("the top-ranked candidate has VERIFIED licenceCertainty in the comparison table", () => {
    const topId = RANKED_CANDIDATE_IDS[0]!;
    const topComparison = CANDIDATE_COMPARISON.find((c) => c.candidateId === topId);
    expect(topComparison?.licenceCertainty).toBe("VERIFIED");
  });

  it("every non-top-ranked candidate has non-VERIFIED licenceCertainty in the comparison table", () => {
    for (const id of RANKED_CANDIDATE_IDS.slice(1)) {
      const comparison = CANDIDATE_COMPARISON.find((c) => c.candidateId === id);
      expect(comparison?.licenceCertainty).not.toBe("VERIFIED");
    }
  });

  it("getCandidateById returns undefined for an unknown ID", () => {
    expect(getCandidateById("DRA-CAND-016-99")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Selection rule
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 8: Selection Rule", () => {
  it("applySelectionRule returns exactly one candidateId or the literal NO QUALIFIED string", () => {
    const result = applySelectionRule();
    const isKnownCandidateId = CANDIDATE_REGISTER.some((c) => c.candidateId === result);
    expect(isKnownCandidateId || result === "NO QUALIFIED CANDIDATE").toBe(true);
  });

  it("applySelectionRule's result matches RECOMMENDED_CANDIDATE_ID when a candidate is recommended", () => {
    const result = applySelectionRule();
    if (RECOMMENDED_CANDIDATE_ID !== null) {
      expect(result).toBe(RECOMMENDED_CANDIDATE_ID);
    } else {
      expect(result).toBe("NO QUALIFIED CANDIDATE");
    }
  });

  it("if a candidate is recommended, it is QUALIFIED_RECOMMENDED, VERIFIED_ACCESSIBLE, and VERIFIED licence", () => {
    const rec = recommendedCandidate();
    if (rec) {
      expect(rec.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
      expect(rec.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
      expect(rec.licencePosition).toMatch(/^VERIFIED/);
    }
  });

  it("the BSI candidate is never the recommended candidate given its current REVIEW_REQUIRED licence", () => {
    expect(RECOMMENDED_CANDIDATE_ID).not.toBe("DRA-CAND-016-02");
  });

  it("the Banque de France / ACPR candidate is never the recommended candidate given its blocked access", () => {
    expect(RECOMMENDED_CANDIDATE_ID).not.toBe("DRA-CAND-016-03");
  });
});

// ---------------------------------------------------------------------------
// Part 9 — Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-016 — Part 9: Phase 1 Scope Boundary", () => {
  it("RESERVED_NEXT_CORPUS_ID is a plain reserved label, not a schema-validated live corpus entry", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0020");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(RESERVED_NEXT_CORPUS_ID);
  });

  it("PHASE_1_PROHIBITED_ACTIONS enumerates all task-specified prohibited actions", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "acquire_final_document_into_corpus",
        "create_DRA-DOC-0020",
        "create_freeze_record",
        "modify_corpus_manifest",
        "modify_corpus_registry",
        "run_evaluator_on_candidate",
        "create_DRA-BMK-020",
        "modify_evaluator_rules",
        "modify_normalization_pipeline",
        "add_translation_or_translate_candidate_text",
        "modify_claim_extraction",
        "modify_authority_resolution",
        "modify_evidence_linkage",
        "modify_consistency_rules",
        "upgrade_aemps_or_cnmv_licence_without_new_evidence",
        "answer_multilingual_generalisation_hypothesis",
        "proceed_automatically_to_phase_2",
      ]),
    );
  });

  it("no source file under this discovery module imports the freeze, admission, or evaluator-execution modules", () => {
    const modulePath = resolve(__dirname, "../dra-acq-016-third-multilingual-discovery.ts");
    expect(existsSync(modulePath)).toBe(true);
    const contents = readFileSync(modulePath, "utf8");
    expect(contents).not.toMatch(/from ["'].*\/freeze\.js["']/);
    expect(contents).not.toMatch(/from ["'].*governed-pipeline\.js["']/);
    expect(contents).not.toMatch(/createAcquisitionFreezeRecord/);
    expect(contents).not.toMatch(/evaluateDocument/);
    expect(contents).not.toMatch(/CorpusRegistry/);
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
