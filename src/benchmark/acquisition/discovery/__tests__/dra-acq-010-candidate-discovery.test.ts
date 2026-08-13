/**
 * DRA-ACQ-010 — Phase 1: Candidate Discovery for DRA-DOC-0015
 *
 * Proves the corpus-balance analysis, candidate register, ranking, and
 * Phase 1 scope boundary recorded in dra-acq-010-candidate-discovery.ts.
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
  UNUSED_REAL_DOCUMENT_TYPES,
  RECENT_THREE_ACQUISITIONS,
  leastRepresentedRealDomains,
  CANDIDATE_REGISTER,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  RANKED_CANDIDATE_IDS,
  RECOMMENDED_CANDIDATE_ID,
  getCandidateById,
  recommendedCandidate,
  RESERVED_NEXT_CORPUS_ID,
  PHASE_1_PROHIBITED_ACTIONS,
  type CandidateRecord,
} from "../dra-acq-010-candidate-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";
import { DRA_EVALUATOR_VERSION } from "../../../../model/versions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Part 1 — Corpus inventory integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 1: Corpus Inventory Integrity", () => {
  it("records exactly 14 corpus documents", () => {
    expect(CORPUS_INVENTORY.length).toBe(14);
  });

  it("every corpusId is well-formed and in DRA-DOC-0001..0014", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(() => CorpusIdSchema.parse(row.corpusId)).not.toThrow();
    }
    const ids = CORPUS_INVENTORY.map((r) => r.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
      "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
      "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
      "DRA-DOC-0013", "DRA-DOC-0014",
    ]);
  });

  it("every domain and documentType value is a valid schema enum member", () => {
    for (const row of CORPUS_INVENTORY) {
      expect(DOMAINS).toContain(row.domain);
      expect(DOCUMENT_TYPES).toContain(row.documentType);
    }
  });

  it("exactly 8 documents are real acquisitions (DRA-DOC-0007 through 0014)", () => {
    expect(REAL_ACQUISITIONS.length).toBe(8);
    expect(REAL_ACQUISITIONS.map((r) => r.corpusId)).toEqual([
      "DRA-DOC-0007", "DRA-DOC-0008", "DRA-DOC-0009", "DRA-DOC-0010",
      "DRA-DOC-0011", "DRA-DOC-0012", "DRA-DOC-0013", "DRA-DOC-0014",
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

describe("DRA-ACQ-010 — Part 2: Corpus-Balance Analysis", () => {
  it("domain distribution across real acquisitions matches the authoritative checkpoint data", () => {
    expect(REAL_DOMAIN_COUNTS.get("TECHNICAL")).toBe(2); // Apache, NIST
    expect(REAL_DOMAIN_COUNTS.get("BUSINESS")).toBe(1); // Acas
    expect(REAL_DOMAIN_COUNTS.get("GENERAL")).toBe(1); // CMA
    expect(REAL_DOMAIN_COUNTS.get("LEGAL")).toBe(1); // ICO
    expect(REAL_DOMAIN_COUNTS.get("HEALTHCARE")).toBe(1); // FDA
    expect(REAL_DOMAIN_COUNTS.get("FINANCE")).toBe(2); // PRA, BCBS
  });

  it("the domain counts sum to the 8 real acquisitions", () => {
    const total = [...REAL_DOMAIN_COUNTS.values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it("four domains (BUSINESS, GENERAL, LEGAL, HEALTHCARE) are jointly least-represented at 1 real document each", () => {
    const least = leastRepresentedRealDomains();
    expect(new Set(least)).toEqual(
      new Set(["BUSINESS", "GENERAL", "LEGAL", "HEALTHCARE"]),
    );
  });

  it("TECHNICAL and FINANCE are the best-represented real domains (2 documents each)", () => {
    const maxCount = Math.max(...[...REAL_DOMAIN_COUNTS.values()]);
    expect(maxCount).toBe(2);
    const best = [...REAL_DOMAIN_COUNTS.entries()].filter(([, c]) => c === maxCount).map(([d]) => d);
    expect(new Set(best)).toEqual(new Set(["TECHNICAL", "FINANCE"]));
  });

  it("document-type distribution across real acquisitions: ARTICLE, PROCEDURE, SUMMARY appear once; POLICY 3x; OTHER 2x", () => {
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("ARTICLE")).toBe(1);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("PROCEDURE")).toBe(1);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("SUMMARY")).toBe(1);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("POLICY")).toBe(3);
    expect(REAL_DOCUMENT_TYPE_COUNTS.get("OTHER")).toBe(2);
  });

  it("REPORT, REWRITE, and EMAIL have zero real-acquisition representation", () => {
    expect(UNUSED_REAL_DOCUMENT_TYPES).toEqual(
      expect.arrayContaining(["REPORT", "REWRITE", "EMAIL"]),
    );
    expect(UNUSED_REAL_DOCUMENT_TYPES.length).toBe(3);
  });

  it("every real acquisition has a distinct publisher (8 distinct publishers for 8 documents)", () => {
    expect(REAL_PUBLISHER_COUNTS.size).toBe(8);
    for (const count of REAL_PUBLISHER_COUNTS.values()) {
      expect(count).toBe(1);
    }
  });

  it("2 of the 3 most recent real acquisitions (DRA-DOC-0013, 0014) are documentType POLICY", () => {
    expect(RECENT_THREE_ACQUISITIONS.map((r) => r.corpusId)).toEqual([
      "DRA-DOC-0012", "DRA-DOC-0013", "DRA-DOC-0014",
    ]);
    const policyCount = RECENT_THREE_ACQUISITIONS.filter((r) => r.documentType === "POLICY").length;
    expect(policyCount).toBe(2);
    expect(RECENT_THREE_ACQUISITIONS[0]!.documentType).toBe("OTHER");
  });

  it("the three most recent real acquisitions concentrate in FINANCE and HEALTHCARE only", () => {
    const domains = new Set(RECENT_THREE_ACQUISITIONS.map((r) => r.domain));
    expect(domains).toEqual(new Set(["FINANCE", "HEALTHCARE"]));
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register completeness
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 3: Candidate Register Completeness", () => {
  it("at least 5 candidates are recorded (task minimum)", () => {
    expect(CANDIDATE_REGISTER.length).toBeGreaterThanOrEqual(5);
  });

  it("records exactly 7 genuinely assessed candidates", () => {
    expect(CANDIDATE_REGISTER.length).toBe(7);
  });

  it("every candidate has a unique, well-formed candidateId", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DRA-CAND-010-\d{2}$/);
    }
  });

  const requiredStringFields: (keyof CandidateRecord)[] = [
    "publisher", "exactTitle", "publicationDateOrVersion", "officialSourceUrl",
    "sourceFormat", "licencePosition", "accessibilityEvidence",
    "duplicateOrNearDuplicateRisk", "likelyCorpusDiversityContribution",
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

  it("the QUALIFIED_RECOMMENDED candidate has a null rejectionOrDeferralReason", () => {
    const recommended = CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "QUALIFIED_RECOMMENDED");
    expect(recommended.length).toBe(1);
    expect(recommended[0]!.rejectionOrDeferralReason).toBeNull();
  });

  it("every candidate carries at least one unresolved risk (Phase 1 never claims a risk-free candidate)", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.unresolvedRisks.length).toBeGreaterThan(0);
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
// Part 4 — HTTP-accessibility gate and outcome consistency
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 4: Accessibility-Outcome Consistency", () => {
  it("QUALIFIED_RECOMMENDED and QUALIFIED_ALTERNATE candidates are all VERIFIED_ACCESSIBLE", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome === "QUALIFIED_RECOMMENDED" || candidate.qualificationOutcome === "QUALIFIED_ALTERNATE") {
        expect(candidate.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
      }
    }
  });

  it("no DEFERRED or REJECTED candidate is VERIFIED_ACCESSIBLE with a fully clean licence position", () => {
    // Every DEFERRED/REJECTED candidate must fail on either accessibility or an explicit blocking risk.
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome === "DEFERRED" || candidate.qualificationOutcome === "REJECTED") {
        const accessibilityBlocked = candidate.httpAccessibility !== "VERIFIED_ACCESSIBLE";
        const hasBlockingRisk = candidate.unresolvedRisks.length > 0;
        expect(accessibilityBlocked || hasBlockingRisk).toBe(true);
      }
    }
  });

  it("exactly 3 candidates are VERIFIED_ACCESSIBLE (OECD, EDPB, NCSC)", () => {
    const accessible = CANDIDATE_REGISTER.filter((c) => c.httpAccessibility === "VERIFIED_ACCESSIBLE");
    expect(accessible.map((c) => c.candidateId).sort()).toEqual([
      "DRA-CAND-010-01", "DRA-CAND-010-02", "DRA-CAND-010-03",
    ]);
  });

  it("GAO is REJECTED specifically for network-level accessibility, not content or licence", () => {
    const gao = getCandidateById("DRA-CAND-010-05");
    expect(gao?.httpAccessibility).toBe("BLOCKED_NETWORK_LEVEL");
    expect(gao?.qualificationOutcome).toBe("REJECTED");
    expect(gao?.licencePosition).toContain("US_GOVERNMENT_WORK");
  });

  it("WHO's landing page is reachable but its document bytes are not (PARTIAL_LANDING_PAGE_ONLY)", () => {
    const who = getCandidateById("DRA-CAND-010-04");
    expect(who?.httpAccessibility).toBe("PARTIAL_LANDING_PAGE_ONLY");
    expect(who?.qualificationOutcome).toBe("DEFERRED");
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Ranking and recommendation
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 5: Ranking and Recommendation", () => {
  it("RANKED_CANDIDATE_IDS contains exactly the 7 candidate IDs, each exactly once", () => {
    const registerIds = new Set(CANDIDATE_REGISTER.map((c) => c.candidateId));
    expect(new Set(RANKED_CANDIDATE_IDS)).toEqual(registerIds);
    expect(RANKED_CANDIDATE_IDS.length).toBe(7);
  });

  it("the top-ranked candidate is the recommended candidate", () => {
    expect(RANKED_CANDIDATE_IDS[0]).toBe(RECOMMENDED_CANDIDATE_ID);
  });

  it("the recommended candidate is QUALIFIED_RECOMMENDED and VERIFIED_ACCESSIBLE", () => {
    const candidate = recommendedCandidate();
    expect(candidate.qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
    expect(candidate.httpAccessibility).toBe("VERIFIED_ACCESSIBLE");
  });

  it("the recommended candidate is the OECD Recommendation on Artificial Intelligence", () => {
    const candidate = recommendedCandidate();
    expect(candidate.publisher).toContain("OECD");
    expect(candidate.exactTitle).toContain("Recommendation of the Council on Artificial Intelligence");
  });

  it("accessibility-blocked candidates (BLOCKED_*, PARTIAL_*) all rank below every VERIFIED_ACCESSIBLE candidate", () => {
    const accessibleRankPositions = RANKED_CANDIDATE_IDS
      .map((id, idx) => ({ idx, candidate: getCandidateById(id)! }))
      .filter((r) => r.candidate.httpAccessibility === "VERIFIED_ACCESSIBLE")
      .map((r) => r.idx);
    const blockedRankPositions = RANKED_CANDIDATE_IDS
      .map((id, idx) => ({ idx, candidate: getCandidateById(id)! }))
      .filter((r) => r.candidate.httpAccessibility !== "VERIFIED_ACCESSIBLE")
      .map((r) => r.idx);
    expect(Math.max(...accessibleRankPositions)).toBeLessThan(Math.min(...blockedRankPositions));
  });

  it("getCandidateById returns undefined for an unknown ID", () => {
    expect(getCandidateById("DRA-CAND-010-99")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Issue-class coverage is NOT used as a selection criterion
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 6: DRA-CHK-002 Boundary Respected", () => {
  it("no candidate's diversity-contribution text claims an issue-class coverage increase", () => {
    const forbiddenPhrases = [/issue.?class coverage/i, /increase coverage/i, /new issue class/i];
    for (const candidate of CANDIDATE_REGISTER) {
      for (const phrase of forbiddenPhrases) {
        expect(candidate.likelyCorpusDiversityContribution).not.toMatch(phrase);
      }
    }
  });

  it("the evaluator version referenced by the programme remains 0.1.1 (frozen, unchanged)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase 1 scope boundary
// ---------------------------------------------------------------------------

describe("DRA-ACQ-010 — Part 7: Phase 1 Scope Boundary", () => {
  it("RESERVED_NEXT_CORPUS_ID is a plain reserved label, not a schema-validated live corpus entry", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0015");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
    // It must NOT appear anywhere in the actual frozen corpus inventory.
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(RESERVED_NEXT_CORPUS_ID);
  });

  it("PHASE_1_PROHIBITED_ACTIONS enumerates all task-specified prohibited actions", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "download_or_permanently_acquire_selected_document",
        "freeze_any_document",
        "create_DRA-DOC-0015",
        "admit_any_document_to_corpus",
        "run_evaluator_on_new_document",
        "generate_proof_receipt",
        "modify_frozen_corpus_record",
        "modify_evaluator_v0.1.1",
        "alter_DRA-CHK-002_findings",
        "proceed_automatically_to_phase_2",
      ]),
    );
  });

  it("no source file under this discovery module imports the freeze, admission, or evaluator-execution modules", () => {
    const modulePath = resolve(__dirname, "../dra-acq-010-candidate-discovery.ts");
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
    // Exclude this literal assertion string itself from the scan.
    const scanned = contents.replace(/expect\(contents\)\.not\.toMatch\([^)]*\)/g, "");
    expect(scanned).not.toMatch(/createAcquisitionFreezeRecord\(/);
    expect(scanned).not.toMatch(/evaluateDocument\(/);
    expect(scanned).not.toMatch(/CorpusRegistry\(\)\.add/);
  });
});
