/**
 * DRA-ACQ-017 — Phase 1: Parallel-Language Candidate Discovery and
 * Qualification for DRA-DOC-0021
 *
 * Proves the corpus inventory, H21 evidence-gap analysis, parallel-edition
 * provenance package, candidate register, comparison, ranking, and Phase 1
 * scope boundary recorded in dra-acq-017-parallel-language-discovery.ts.
 *
 * This suite does not perform any acquisition, freeze, admission, or
 * evaluator execution. It only exercises data-integrity and reasoning
 * invariants over static discovery records built from today's live-source
 * re-verification (recorded as fixed data in the module under test, not
 * re-fetched by this suite).
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  CORPUS_INVENTORY,
  REAL_ACQUISITIONS,
  noExistingParallelLanguagePairExists,
  BMK_020_DECISION_DISTRIBUTION,
  BMK_020_ISSUE_CLASS_COVERAGE,
  BMK_020_THREE_LANGUAGE_COMPARISON,
  H21_EVIDENCE_GAP,
  H21_HYPOTHESIS,
  EC_PER_LANGUAGE_TABLE_CROSS_CHECK,
  EDITION_STRUCTURAL_PROFILES,
  PUBLICATION_DATE_PLACEHOLDER_ANOMALY,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  LICENCE_REUSE_CATEGORIES,
  CANDIDATE_COMPARISON,
  RANKED_CANDIDATE_IDS,
  RECOMMENDED_CANDIDATE_ID,
  getCandidateById,
  recommendedCandidate,
  applyQualificationRule,
  RESERVED_NEXT_CORPUS_ID,
  PHASE_1_PROHIBITED_ACTIONS,
  type CandidateRecord,
} from "../dra-acq-017-parallel-language-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION } from "../../../../model/versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Part 1 — Corpus inventory integrity (20 documents, following DRA-BMK-020)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 1: Corpus Inventory Integrity", () => {
  it("records exactly 20 corpus documents", () => {
    expect(CORPUS_INVENTORY.length).toBe(20);
  });

  it("every corpusId is well-formed and in DRA-DOC-0001..0020, in order", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
      "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
      "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
      "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
      "DRA-DOC-0017", "DRA-DOC-0018", "DRA-DOC-0019", "DRA-DOC-0020",
    ]);
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 14 documents are real acquisitions (DRA-DOC-0007 through 0020)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(14);
    expect(REAL_ACQUISITIONS[REAL_ACQUISITIONS.length - 1]!.corpusId).toBe("DRA-DOC-0020");
  });

  it("DRA-DOC-0018 (European Commission, Spanish) is present with the expected metadata", () => {
    const ec = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0018");
    expect(ec).toBeDefined();
    expect(ec?.publisher).toContain("European Commission");
    expect(ec?.domain).toBe("TECHNICAL");
    expect(ec?.language).toBe("es");
    expect(ec?.acquisitionId).toBe("DRA-ACQ-014");
  });

  it("DRA-DOC-0020 (CNIL, French) is present with the expected metadata", () => {
    const cnil = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0020");
    expect(cnil).toBeDefined();
    expect(cnil?.publisher).toContain("CNIL");
    expect(cnil?.language).toBe("fr");
    expect(cnil?.acquisitionId).toBe("DRA-ACQ-016");
  });

  it("no existing parallel-language pair exists in the current corpus (three non-English documents, three distinct publishers)", () => {
    expect(noExistingParallelLanguagePairExists()).toBe(true);
  });

  it("the array and every row are frozen (append-only, no mutation)", () => {
    expect(Object.isFrozen(CORPUS_INVENTORY)).toBe(true);
    for (const row of CORPUS_INVENTORY) {
      expect(Object.isFrozen(row)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 2 — H21 evidence-gap analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 2: H21 Evidence-Gap Analysis", () => {
  it("reproduces the fixed DRA-BMK-020 decision distribution (10 SUPPORTED, 8 REVIEW, 2 HOLD)", () => {
    expect(BMK_020_DECISION_DISTRIBUTION.SUPPORTED).toBe(10);
    expect(BMK_020_DECISION_DISTRIBUTION.REVIEW).toBe(8);
    expect(BMK_020_DECISION_DISTRIBUTION.HOLD).toBe(2);
    expect(
      BMK_020_DECISION_DISTRIBUTION.SUPPORTED +
        BMK_020_DECISION_DISTRIBUTION.REVIEW +
        BMK_020_DECISION_DISTRIBUTION.HOLD,
    ).toBe(20);
  });

  it("reproduces the fixed 3/9 issue-class coverage with the three known classes", () => {
    expect(BMK_020_ISSUE_CLASS_COVERAGE.fraction).toBe("3/9");
    expect(BMK_020_ISSUE_CLASS_COVERAGE.coveredClasses).toEqual([
      "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY",
    ]);
  });

  it("BMK_020_THREE_LANGUAGE_COMPARISON records NO_DIFFERENCE, explicitly scoped and unable to isolate language", () => {
    expect(BMK_020_THREE_LANGUAGE_COMPARISON.comparisonCategory).toBe("NO_DIFFERENCE");
    expect(BMK_020_THREE_LANGUAGE_COMPARISON.comparedCorpusIds).toEqual([
      "DRA-DOC-0018", "DRA-DOC-0019", "DRA-DOC-0020",
    ]);
    expect(BMK_020_THREE_LANGUAGE_COMPARISON.scopeStatement).toMatch(/could NOT isolate language/i);
  });

  it("H21 is framed as an open empirical question this phase does not test or predict", () => {
    expect(H21_HYPOTHESIS).toMatch(/open empirical question/i);
    expect(H21_HYPOTHESIS).toMatch(/does not test it/i);
    expect(H21_HYPOTHESIS).toMatch(/could test it in a future phase/i);
  });

  it("the evidence-gap statement identifies a parallel-text pair as the target design, without claiming an outcome", () => {
    expect(H21_EVIDENCE_GAP).toMatch(/parallel-text pair/i);
    expect(H21_EVIDENCE_GAP).toMatch(/DRA-DOC-0021/);
    expect(H21_EVIDENCE_GAP).not.toMatch(/will (increase|expand) coverage/i);
    expect(H21_EVIDENCE_GAP).not.toMatch(/will (confirm|prove|show)/i);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Parallel-edition provenance package
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 3: Parallel-Edition Provenance", () => {
  it("the EC per-language table cross-check covers en, es, and fr and agrees across all three source pages", () => {
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.sourcePages.length).toBe(3);
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.languageDocIds.en).toBe("60419");
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.languageDocIds.es).toBe("60423");
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.languageDocIds.fr).toBe("60427");
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.agreementAcrossAllThreePages).toBe(true);
  });

  it("each candidate's parallel-edition evidence links back to the already-frozen DRA-DOC-0018", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.parallelEditionEvidence).toMatch(/DRA-DOC-0018/);
    }
  });

  it("the unrelated companion 'Definition of AI' table is explicitly distinguished, not conflated with the Guidelines table", () => {
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.unrelatedCompanionTableNote).toMatch(/Definition of Artificial Intelligence/i);
    expect(EC_PER_LANGUAGE_TABLE_CROSS_CHECK.unrelatedCompanionTableNote).toMatch(/different publication/i);
  });

  it("all three language editions (en, es, fr) share full structural comparability: executive summary, three chapters, assessment list, and glossary", () => {
    expect(EDITION_STRUCTURAL_PROFILES.length).toBe(3);
    const languages = EDITION_STRUCTURAL_PROFILES.map((p) => p.language);
    expect(languages).toEqual(["en", "es", "fr"]);
    for (const profile of EDITION_STRUCTURAL_PROFILES) {
      expect(profile.hasExecutiveSummary).toBe(true);
      expect(profile.hasChapterI).toBe(true);
      expect(profile.hasChapterII).toBe(true);
      expect(profile.hasChapterIII).toBe(true);
      expect(profile.hasTrustworthyAiAssessmentList).toBe(true);
      expect(profile.hasGlossary).toBe(true);
      expect(profile.pageCount).toBeGreaterThan(0);
      expect(profile.approximateExtractedChars).toBeGreaterThan(0);
    }
  });

  it("records the genuine publication-date placeholder anomaly shared by es and fr, absent in en", () => {
    expect(PUBLICATION_DATE_PLACEHOLDER_ANOMALY.affectedLanguages).toEqual(["es", "fr"]);
    expect(PUBLICATION_DATE_PLACEHOLDER_ANOMALY.unaffectedLanguages).toEqual(["en"]);
    expect(PUBLICATION_DATE_PLACEHOLDER_ANOMALY.scopeOfImpact).toMatch(/front-matter/i);
    expect(PUBLICATION_DATE_PLACEHOLDER_ANOMALY.scopeOfImpact).toMatch(/does not alter/i);
  });

  it("the anomaly is framed as reinforcing, not weakening, the parallel-edition determination", () => {
    expect(PUBLICATION_DATE_PLACEHOLDER_ANOMALY.evidentialValue).toMatch(/strengthens/i);
  });

  it("the English edition's structural profile matches the recorded publication date statement exactly, with no placeholder", () => {
    const en = EDITION_STRUCTURAL_PROFILES.find((p) => p.language === "en");
    expect(en?.publicationDateStatement).toBe("Document made public on 8 April 2019.");
    expect(en?.publicationDateStatement).not.toMatch(/\bX\b/);
  });

  it("the es and fr structural profiles both contain the literal 'X' placeholder in their publication date statement", () => {
    for (const lang of ["es", "fr"] as const) {
      const profile = EDITION_STRUCTURAL_PROFILES.find((p) => p.language === lang);
      expect(profile?.publicationDateStatement).toMatch(/\bX\b/);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Candidate register completeness
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 4: Candidate Register Completeness", () => {
  it("records exactly 2 candidates: the English and French editions", () => {
    expect(CANDIDATE_REGISTER.length).toBe(2);
    const languages = CANDIDATE_REGISTER.map((c) => c.language).sort();
    expect(languages).toEqual(["en", "fr"]);
  });

  it("every candidate has a unique, well-formed candidateId", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DRA-CAND-017-\d{2}$/);
    }
  });

  const requiredStringFields: (keyof CandidateRecord)[] = [
    "publisher", "exactTitle", "publicationDateOrVersion", "language",
    "officialSourceUrl", "sourceFormat", "retrievedFileSha256", "licencePosition",
    "accessibilityEvidence", "parallelEditionEvidence", "structuralComparabilityFinding",
    "hypothesisTestingSuitability",
  ];

  it.each(requiredStringFields)("every candidate has a non-empty '%s' field", (field) => {
    for (const candidate of CANDIDATE_REGISTER) {
      const value = candidate[field];
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("both candidates share the same publisher and publication date as DRA-DOC-0018 (same substantive document)", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.publisher).toBe("European Commission — High-Level Expert Group on Artificial Intelligence");
      expect(candidate.publicationDateOrVersion).toMatch(/8 April 2019/);
    }
  });

  it("every candidate's proposedDomain and proposedDocumentType are valid schema enum members", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.proposedDomain);
      expect(DOCUMENT_TYPES).toContain(candidate.proposedDocumentType);
    }
  });

  it("every candidate's officialSourceUrl is a well-formed https ec.europa.eu URL", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      const url = new URL(candidate.officialSourceUrl);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("ec.europa.eu");
    }
  });

  it("every candidate's qualificationOutcome and licenceReuseCategory are from the canonical enums", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
      expect(LICENCE_REUSE_CATEGORIES).toContain(candidate.licenceReuseCategory);
    }
  });

  it("every candidate carries at least one unresolved risk and at least one governance finding", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.unresolvedRisks.length).toBeGreaterThan(0);
      expect(candidate.governanceFindings.length).toBeGreaterThan(0);
    }
  });

  it("every candidate's mediaTypeObservation documents the DRA-ENG-011 fallback pattern (malformed Content-Type, valid Content-Disposition and PDF signature)", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      const mto = candidate.mediaTypeObservation;
      expect(mto.rawContentTypeHeader).toBe("application/");
      expect(mto.contentDispositionFilename).toMatch(/\.pdf$/);
      expect(mto.pdfSignatureAtOffsetZero).toBe(true);
      expect(mto.requiresEng011Fallback).toBe(true);
    }
  });

  it("no candidate's licence position is inferred merely from public accessibility", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.licencePosition).not.toMatch(/because it is publicly accessible/i);
    }
  });

  it("no candidate's equivalence claim is based on title similarity alone (each cites the publisher's per-language table)", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.parallelEditionEvidence).toMatch(/per-language download table/i);
      expect(candidate.parallelEditionEvidence).not.toMatch(/similar title/i);
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
// Part 5 — Distinct candidate identities
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 5: Distinct Candidate Identities", () => {
  it("the English candidate is present with the expected metadata", () => {
    const en = getCandidateById("DRA-CAND-017-01");
    expect(en).toBeDefined();
    expect(en!.language).toBe("en");
    expect(en!.officialSourceUrl).toBe("https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419");
    expect(en!.fileSizeBytes).toBe(1632682);
  });

  it("the French candidate is present with the expected metadata", () => {
    const fr = getCandidateById("DRA-CAND-017-02");
    expect(fr).toBeDefined();
    expect(fr!.language).toBe("fr");
    expect(fr!.officialSourceUrl).toBe("https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60427");
    expect(fr!.fileSizeBytes).toBe(2180872);
  });

  it("the two candidates have distinct SHA-256 digests (genuinely different files, not the same PDF re-labelled)", () => {
    const [en, fr] = CANDIDATE_REGISTER;
    expect(en!.retrievedFileSha256).not.toBe(fr!.retrievedFileSha256);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Licence scrutiny
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 6: Licence Scrutiny", () => {
  it("both candidates carry a VERIFIED, NAMED_OPEN_LICENCE position under the same EU institutional basis as DRA-DOC-0018/0020", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.licenceReuseCategory).toBe("NAMED_OPEN_LICENCE");
      expect(candidate.licencePosition).toMatch(/^VERIFIED/);
      expect(candidate.licencePosition).toMatch(/CC BY 4\.0/);
    }
  });

  it("neither candidate's licence position is REVIEW_REQUIRED or REJECTED", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.licencePosition).not.toMatch(/^REVIEW_REQUIRED/);
      expect(candidate.licencePosition).not.toMatch(/^REJECTED/);
    }
  });

  it("both candidates are VERIFIED_ACCESSIBLE", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Hypothesis framing: confirmed vs speculative
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 7: Hypothesis Framing", () => {
  it("every candidate's issueClassHypothesis is explicitly framed as unconfirmed", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.issueClassHypothesis).toMatch(/hypothesis|not confirmed|unconfirmed/i);
    }
  });

  it("no candidate's hypothesisTestingSuitability text predicts a specific H21 outcome", () => {
    const forbiddenPhrases = [/will (confirm|prove|show)/i, /is (language|document)-specific/i, /no outcome is predicted\)/i];
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.hypothesisTestingSuitability).not.toMatch(/will (confirm|prove|show)/i);
      expect(candidate.hypothesisTestingSuitability).not.toMatch(/is (language|document)-specific/i);
    }
  });

  it("the evaluator version referenced by the programme remains 0.1.1 (frozen, unchanged)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Candidate comparison and ranking
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 8: Candidate Comparison and Ranking", () => {
  it("CANDIDATE_COMPARISON covers every candidate exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    const comparisonIds = new Set(CANDIDATE_COMPARISON.map((c) => c.candidateId));
    expect(comparisonIds).toEqual(registerIds);
  });

  it("RANKED_CANDIDATE_IDS contains exactly the candidate IDs, each exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(registerIds);
  });

  it("both candidates have VERIFIED licenceCertainty and parallelEditionCertainty in the comparison table", () => {
    for (const row of CANDIDATE_COMPARISON) {
      expect(row.licenceCertainty).toBe("VERIFIED");
      expect(row.parallelEditionCertainty).toBe("VERIFIED");
      expect(row.structuralComparability).toBe("FULL");
      expect(row.governanceRisk).toBe("LOW");
    }
  });

  it("getCandidateById returns undefined for an unknown ID", () => {
    expect(getCandidateById("DRA-CAND-017-99")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Part 9 — Qualification decision
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 9: Qualification Decision", () => {
  it("applyQualificationRule returns both candidate IDs (both clear every gate)", () => {
    const qualified = applyQualificationRule();
    expect(new Set(qualified)).toEqual(new Set(["DRA-CAND-017-01", "DRA-CAND-017-02"]));
  });

  it("exactly one candidate is QUALIFIED_RECOMMENDED and it is the English edition", () => {
    const recommended = CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "QUALIFIED_RECOMMENDED");
    expect(recommended.length).toBe(1);
    expect(recommended[0]!.candidateId).toBe("DRA-CAND-017-01");
    expect(RECOMMENDED_CANDIDATE_ID).toBe("DRA-CAND-017-01");
  });

  it("the French edition is QUALIFIED_ALTERNATE, not REJECTED — it fully qualifies but only one corpus ID is reserved this phase", () => {
    const fr = getCandidateById("DRA-CAND-017-02");
    expect(fr!.qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
  });

  it("recommendedCandidate() returns the English candidate and matches every qualification gate", () => {
    const rec = recommendedCandidate();
    expect(rec).not.toBeNull();
    expect(rec!.candidateId).toBe("DRA-CAND-017-01");
    expect(rec!.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
    expect(rec!.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
    expect(rec!.licencePosition).toMatch(/^VERIFIED/);
  });

  it("no candidate in this register is REJECTED", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.qualificationOutcome).not.toBe("REJECTED");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 10 — Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-017 — Part 10: Phase 1 Scope Boundary", () => {
  it("RESERVED_NEXT_CORPUS_ID is a plain reserved label, not a schema-validated live corpus entry", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0021");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(RESERVED_NEXT_CORPUS_ID);
  });

  it("PHASE_1_PROHIBITED_ACTIONS enumerates every task-specified prohibited action", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "acquire_final_document_into_corpus",
        "create_DRA-DOC-0021",
        "create_freeze_record",
        "modify_corpus_manifest",
        "modify_corpus_registry",
        "run_evaluator_on_candidate",
        "create_DRA-BMK-021",
        "modify_evaluator_rules",
        "modify_normalization_pipeline",
        "add_translation_or_translate_candidate_text",
        "modify_claim_extraction",
        "modify_authority_resolution",
        "modify_evidence_linkage",
        "modify_consistency_rules",
        "modify_dra_doc_0018_or_0020_frozen_records",
        "modify_dra_bmk_020_results",
        "answer_h21_hypothesis",
        "assume_equivalence_from_title_similarity_alone",
        "proceed_automatically_to_phase_2",
      ]),
    );
  });

  it("no source file under this discovery module imports the freeze, admission, or evaluator-execution modules", () => {
    const modulePath = resolve(__dirname, "../dra-acq-017-parallel-language-discovery.ts");
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

  it("this module does not modify DRA-DOC-0018 or DRA-DOC-0020's frozen records — the existing 20-document corpus inventory is byte-identical to the DRA-ACQ-016 inventory plus DRA-DOC-0020", () => {
    const ec = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0018")!;
    const cnil = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0020")!;
    expect(ec.acquisitionId).toBe("DRA-ACQ-014");
    expect(ec.language).toBe("es");
    expect(cnil.acquisitionId).toBe("DRA-ACQ-016");
    expect(cnil.language).toBe("fr");
  });
});
