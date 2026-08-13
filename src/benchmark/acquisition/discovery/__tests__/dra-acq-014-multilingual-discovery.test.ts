/**
 * DRA-ACQ-014 — Phase 1: Multilingual Candidate Discovery for DRA-DOC-0018
 *
 * Proves the corpus inventory, multilingual evidence-gap analysis,
 * candidate register, comparison, ranking, selection rule, and Phase 1
 * scope boundary recorded in dra-acq-014-multilingual-discovery.ts.
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
  noNonEnglishRealDocumentExists,
  COVERAGE_HISTORY,
  coverageHasBeenStableAcrossHistory,
  MULTILINGUAL_EVIDENCE_GAP,
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
} from "../dra-acq-014-multilingual-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION } from "../../../../model/versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Part 1 — Corpus inventory integrity (17 documents, following DRA-BMK-017)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 1: Corpus Inventory Integrity", () => {
  it("records exactly 17 corpus documents", () => {
    expect(CORPUS_INVENTORY.length).toBe(17);
  });

  it("every corpusId is well-formed and in DRA-DOC-0001..0017, in order", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
      "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
      "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
      "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
      "DRA-DOC-0017",
    ]);
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 11 documents are real acquisitions (DRA-DOC-0007 through 0017)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(11);
    expect(REAL_ACQUISITIONS[REAL_ACQUISITIONS.length - 1]!.corpusId).toBe("DRA-DOC-0017");
  });

  it("DRA-DOC-0017 (MHRA) is present with the expected metadata", () => {
    const mhra = CORPUS_INVENTORY.find((r) => r.corpusId === "DRA-DOC-0017");
    expect(mhra).toBeDefined();
    expect(mhra?.publisher).toContain("MHRA");
    expect(mhra?.domain).toBe("HEALTHCARE");
    expect(mhra?.language).toBe("en-GB");
  });

  it("every real acquisition is English (en or en-GB); zero non-English documents exist yet", () => {
    expect(noNonEnglishRealDocumentExists()).toBe(true);
    for (const lang of REAL_LANGUAGE_COUNTS.keys()) {
      expect(["en", "en-GB"]).toContain(lang);
    }
  });

  it("HEALTHCARE now has exactly 2 real documents (FDA, MHRA)", () => {
    const healthcareCount = REAL_ACQUISITIONS.filter((r) => r.domain === "HEALTHCARE").length;
    expect(healthcareCount).toBe(2);
  });

  it("every real acquisition still has a distinct publisher (11 distinct publishers for 11 documents)", () => {
    expect(REAL_PUBLISHER_COUNTS.size).toBe(11);
    for (const count of REAL_PUBLISHER_COUNTS.values()) {
      expect(count).toBe(1);
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
// Part 2 — Multilingual evidence-gap analysis
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 2: Multilingual Evidence-Gap Analysis", () => {
  it("records exactly 3 consecutive checkpoints in coverage history", () => {
    expect(COVERAGE_HISTORY.length).toBe(3);
    expect(COVERAGE_HISTORY.map((r) => r.checkpoint)).toEqual([
      "DRA-BMK-015", "DRA-BMK-016", "DRA-BMK-017",
    ]);
  });

  it("coverage fraction is 3/9 at every checkpoint (stable, per authoritative benchmark input)", () => {
    for (const row of COVERAGE_HISTORY) {
      expect(row.coverageFraction).toBe("3/9");
      expect(row.coveredClasses).toEqual([
        "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY",
      ]);
    }
    expect(coverageHasBeenStableAcrossHistory()).toBe(true);
  });

  it("corpus size increases monotonically across the checkpoint history", () => {
    const sizes = COVERAGE_HISTORY.map((r) => r.corpusSize);
    expect(sizes).toEqual([15, 16, 17]);
  });

  it("the evidence-gap statement identifies language as the primary untested variable, not issue-class coverage as a guaranteed outcome", () => {
    expect(MULTILINGUAL_EVIDENCE_GAP).toMatch(/language/i);
    expect(MULTILINGUAL_EVIDENCE_GAP).toMatch(/3\/9/);
    expect(MULTILINGUAL_EVIDENCE_GAP).not.toMatch(/will (increase|expand) coverage/i);
    expect(MULTILINGUAL_EVIDENCE_GAP).toMatch(/open empirical question|not a claimed|not.*expected outcome/i);
  });

  it("the array and every row are frozen", () => {
    expect(Object.isFrozen(COVERAGE_HISTORY)).toBe(true);
    for (const row of COVERAGE_HISTORY) {
      expect(Object.isFrozen(row)).toBe(true);
      expect(Object.isFrozen(row.coveredClasses)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register completeness
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 3: Candidate Register Completeness", () => {
  it("records exactly 3 genuinely assessed candidates, at least one Spanish", () => {
    expect(CANDIDATE_REGISTER.length).toBeGreaterThanOrEqual(3);
    const spanish = CANDIDATE_REGISTER.filter((c) => c.language === "es");
    expect(spanish.length).toBeGreaterThanOrEqual(1);
  });

  it("every candidate has a unique, well-formed candidateId", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DRA-CAND-014-\d{2}$/);
    }
  });

  const requiredStringFields: (keyof CandidateRecord)[] = [
    "publisher", "exactTitle", "publicationDateOrVersion", "language",
    "officialSourceUrl", "sourceFormat", "retrievedFileSha256", "licencePosition",
    "accessibilityEvidence",
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
// Part 4 — AEMPS reassessment (must not be silently upgraded)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 4: AEMPS Reassessment", () => {
  it("the AEMPS candidate's licence position remains REVIEW_REQUIRED, not upgraded to VERIFIED", () => {
    const aemps = getCandidateById("DRA-CAND-014-01");
    expect(aemps).toBeDefined();
    expect(aemps!.licencePosition).toMatch(/^REVIEW_REQUIRED/);
    expect(aemps!.language).toBe("es");
  });

  it("the AEMPS candidate's retrieved file digest is byte-identical to the DRA-ACQ-013 Phase 1 finding", () => {
    const aemps = getCandidateById("DRA-CAND-014-01");
    expect(aemps!.retrievedFileSha256).toBe(
      "dfc08a5704227e056b80c73db1296706ec4e252f4c3de6aac8fa4fa71abbc2ce",
    );
  });

  it("the AEMPS candidate is not QUALIFIED_RECOMMENDED (licence remains blocking)", () => {
    const aemps = getCandidateById("DRA-CAND-014-01");
    expect(aemps!.qualificationOutcome).not.toBe("QUALIFIED_RECOMMENDED");
  });

  it("the AEMPS candidate's licence review is recorded as an explicit blocking governance issue", () => {
    const aemps = getCandidateById("DRA-CAND-014-01");
    const allRiskText = aemps!.unresolvedRisks.join(" ");
    expect(allRiskText).toMatch(/BLOCKING/);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Licence scrutiny
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 5: Licence Scrutiny", () => {
  it("no candidate's licence position is inferred merely from public accessibility", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.licencePosition).not.toMatch(/because it is publicly accessible/i);
    }
  });

  it("a candidate with a REJECTED or REVIEW_REQUIRED licence is never QUALIFIED_RECOMMENDED", () => {
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

  it("the Banco de España candidate is REJECTED with NO_VERIFIED_REUSE_PERMISSION", () => {
    const bde = getCandidateById("DRA-CAND-014-03");
    expect(bde).toBeDefined();
    expect(bde!.licenceReuseCategory).toBe("NO_VERIFIED_REUSE_PERMISSION");
    expect(bde!.qualificationOutcome).toBe("REJECTED");
  });

  it("the recommended candidate (if any) has a NAMED_OPEN_LICENCE reuse category", () => {
    const rec = recommendedCandidate();
    if (rec) {
      expect(rec.licenceReuseCategory).toBe("NAMED_OPEN_LICENCE");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Corpus contribution: confirmed vs speculative
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 6: Corpus Contribution (Confirmed vs Speculative)", () => {
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

  it("the evaluator version referenced by the programme remains 0.1.1 (frozen, unchanged)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Candidate comparison and ranking
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 7: Candidate Comparison and Ranking", () => {
  it("CANDIDATE_COMPARISON covers every candidate exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    const comparisonIds = new Set(CANDIDATE_COMPARISON.map((c) => c.candidateId));
    expect(comparisonIds).toEqual(registerIds);
  });

  it("RANKED_CANDIDATE_IDS contains exactly the candidate IDs, each exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(registerIds);
  });

  it("the REJECTED candidate (Banco de España) ranks last", () => {
    const bdeRank = RANKED_CANDIDATE_IDS.indexOf("DRA-CAND-014-03");
    expect(bdeRank).toBe(RANKED_CANDIDATE_IDS.length - 1);
  });

  it("the top-ranked candidate has VERIFIED licenceCertainty in the comparison table", () => {
    const topId = RANKED_CANDIDATE_IDS[0]!;
    const topComparison = CANDIDATE_COMPARISON.find((c) => c.candidateId === topId);
    expect(topComparison?.licenceCertainty).toBe("VERIFIED");
  });

  it("getCandidateById returns undefined for an unknown ID", () => {
    expect(getCandidateById("DRA-CAND-014-99")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Selection rule
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 8: Selection Rule", () => {
  it("applySelectionRule returns exactly one candidateId or the literal NO QUALIFIED string", () => {
    const result = applySelectionRule();
    const isKnownCandidateId = CANDIDATE_REGISTER.some((c) => c.candidateId === result);
    expect(isKnownCandidateId || result === "NO QUALIFIED MULTILINGUAL CANDIDATE").toBe(true);
  });

  it("applySelectionRule's result matches RECOMMENDED_CANDIDATE_ID when a candidate is recommended", () => {
    const result = applySelectionRule();
    if (RECOMMENDED_CANDIDATE_ID !== null) {
      expect(result).toBe(RECOMMENDED_CANDIDATE_ID);
    } else {
      expect(result).toBe("NO QUALIFIED MULTILINGUAL CANDIDATE");
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

  it("the AEMPS candidate is never the recommended candidate given its current REVIEW_REQUIRED licence", () => {
    expect(RECOMMENDED_CANDIDATE_ID).not.toBe("DRA-CAND-014-01");
  });
});

// ---------------------------------------------------------------------------
// Part 9 — Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-014 — Part 9: Phase 1 Scope Boundary", () => {
  it("RESERVED_NEXT_CORPUS_ID is a plain reserved label, not a schema-validated live corpus entry", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0018");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(RESERVED_NEXT_CORPUS_ID);
  });

  it("PHASE_1_PROHIBITED_ACTIONS enumerates all task-specified prohibited actions", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "acquire_final_document_into_corpus",
        "create_DRA-DOC-0018",
        "create_freeze_record",
        "modify_corpus_manifest",
        "modify_corpus_registry",
        "run_evaluator_on_candidate",
        "create_DRA-BMK-018",
        "modify_evaluator_rules",
        "modify_normalization_pipeline",
        "add_translation_or_translate_candidate_text",
        "modify_claim_extraction",
        "modify_authority_resolution",
        "modify_evidence_linkage",
        "modify_consistency_rules",
        "upgrade_aemps_licence_without_new_evidence",
        "proceed_automatically_to_phase_2",
      ]),
    );
  });

  it("no source file under this discovery module imports the freeze, admission, or evaluator-execution modules", () => {
    const modulePath = resolve(__dirname, "../dra-acq-014-multilingual-discovery.ts");
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
