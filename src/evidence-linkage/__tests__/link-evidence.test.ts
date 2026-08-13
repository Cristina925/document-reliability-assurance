/**
 * DRA-ENG-006 — linkEvidence Integration Tests
 */

import { describe, it, expect } from "vitest";
import { linkEvidence, LINKAGE_RULE_VERSION } from "../link-evidence.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { resolveAuthority } from "../../authority-resolution/index.js";
import { STAGE_4_ID, STAGE_4_VERSION } from "../linkage-result.js";
import { DRA_MODEL_VERSION, DRA_PIPELINE_VERSION } from "../../model/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Req = Parameters<typeof extractClaims>[0];

function makeRequest(id: string, docId: string, content: string): Req {
  return {
    id: id as Req["id"],
    generatedDocument: {
      id: docId as Req["generatedDocument"]["id"],
      title: "Test",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-07-26T12:00:00.000Z",
    },
    sourceDocuments: [],
    requestedAt: "2026-07-26T12:00:00.000Z",
  };
}

function run(content: string, evalId = "eval-t", docId = "gen-t") {
  const req = makeRequest(evalId, docId, content);
  const s2 = extractClaims(req);
  const s3 = resolveAuthority(req, s2);
  return { req, s2, s3, s4: linkEvidence(req, s2, s3) };
}

// ---------------------------------------------------------------------------
// Basic success
// ---------------------------------------------------------------------------

describe("DRA-ENG-006 linkEvidence — basic success", () => {
  it("returns ok: true for valid inputs", () => {
    const { s4 } = run("The system is compliant.");
    expect(s4.ok).toBe(true);
  });

  it("carries correct stageId", () => {
    const { s4 } = run("The system is compliant.");
    expect(s4.stageId).toBe(STAGE_4_ID);
    expect(s4.stageId).toBe("STAGE_4_EVIDENCE_LINKAGE");
  });

  it("carries pipelineVersion", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok) expect(s4.pipelineVersion).toBe(DRA_PIPELINE_VERSION);
  });

  it("carries modelVersion", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok) expect(s4.modelVersion).toBe(DRA_MODEL_VERSION);
  });

  it("carries evaluationId", () => {
    const { s4 } = run("The system is compliant.", "eval-001", "gen-001");
    if (s4.ok) expect(s4.evaluationId).toBe("eval-001");
  });

  it("carries generatedDocumentId", () => {
    const { s4 } = run("The system is compliant.", "eval-001", "gen-001");
    if (s4.ok) expect(s4.generatedDocumentId).toBe("gen-001");
  });

  it("linkageRecord carries matching stageId and version", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok) {
      expect(s4.linkageRecord.stageId).toBe(STAGE_4_ID);
      expect(s4.linkageRecord.stageVersion).toBe(STAGE_4_VERSION);
      expect(s4.linkageRecord.linkageRuleVersion).toBe(LINKAGE_RULE_VERSION);
    }
  });
});

// ---------------------------------------------------------------------------
// One record per statement
// ---------------------------------------------------------------------------

describe("one evidence record per statement", () => {
  it("single statement → one record", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok) expect(s4.evidenceRecords).toHaveLength(1);
  });

  it("three statements → three records", () => {
    const { s4 } = run("First claim. Second claim. Third claim.");
    if (s4.ok) expect(s4.evidenceRecords).toHaveLength(3);
  });

  it("zero statements → zero records (valid success)", () => {
    const { s4 } = run("# Heading Only\n\n---");
    expect(s4.ok).toBe(true);
    if (s4.ok) expect(s4.evidenceRecords).toHaveLength(0);
  });

  it("record count equals linkageRecord.evidenceRecordCount", () => {
    const { s4 } = run("First. Second. Third.");
    if (s4.ok)
      expect(s4.evidenceRecords.length).toBe(s4.linkageRecord.evidenceRecordCount);
  });

  it("record count equals linkageRecord.statementCount", () => {
    const { s4 } = run("First. Second. Third.");
    if (s4.ok)
      expect(s4.linkageRecord.statementCount).toBe(s4.evidenceRecords.length);
  });
});

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

describe("records ordered by statementIndex", () => {
  it("recordIndex values are 0-based and strictly ascending", () => {
    const { s4 } = run("First claim. Second claim. Third claim.");
    if (s4.ok) {
      const indices = s4.evidenceRecords.map((r) => r.recordIndex);
      for (let i = 1; i < indices.length; i++)
        expect(indices[i]!).toBeGreaterThan(indices[i - 1]!);
    }
  });

  it("statementSpan startOffsets are in document order", () => {
    const { s4 } = run("First claim. Second claim. Third claim.");
    if (s4.ok) {
      const offsets = s4.evidenceRecords.map((r) => r.statementSpan.startOffset);
      for (let i = 1; i < offsets.length; i++)
        expect(offsets[i]!).toBeGreaterThan(offsets[i - 1]!);
    }
  });
});

// ---------------------------------------------------------------------------
// Statement identity preservation
// ---------------------------------------------------------------------------

describe("statement identity preservation", () => {
  it("record.statementId matches Stage 2 statement id", () => {
    const req = makeRequest("ev-si", "doc-si", "The system is compliant.");
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s2.ok && s4.ok)
      expect(String(s4.evidenceRecords[0]!.statementId)).toBe(String(s2.statements[0]!.id));
  });

  it("statementSpan matches Stage 2 spanRef", () => {
    const content = "ABC. DEF. GHI.";
    const req = makeRequest("ev-sp", "doc-sp", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s2.ok && s4.ok) {
      for (let i = 0; i < s2.statements.length; i++) {
        const stmt = s2.statements[i]!;
        const rec = s4.evidenceRecords[i]!;
        expect(rec.statementSpan.startOffset).toBe(stmt.spanRef?.startOffset);
        expect(rec.statementSpan.endOffset).toBe(stmt.spanRef?.endOffset);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("determinism", () => {
  it("identical inputs produce deeply equal Stage 4 results", () => {
    const content = "According to WHO, compliance is required [1]. See Table 1 for details.";
    const req = makeRequest("ev-det", "doc-det", content);
    const s2a = extractClaims(req);
    const s2b = extractClaims(req);
    const s3a = resolveAuthority(req, s2a);
    const s3b = resolveAuthority(req, s2b);
    const s4a = linkEvidence(req, s2a, s3a);
    const s4b = linkEvidence(req, s2b, s3b);
    if (s4a.ok && s4b.ok) {
      expect(s4a.evidenceRecords).toStrictEqual(s4b.evidenceRecords);
      expect(s4a.linkageRecord).toStrictEqual(s4b.linkageRecord);
    }
  });
});

// ---------------------------------------------------------------------------
// Linkage record
// ---------------------------------------------------------------------------

describe("linkage record", () => {
  it("documentLength equals content.length", () => {
    const content = "The system is compliant.";
    const req = makeRequest("ev-rl", "doc-rl", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s4.ok) expect(s4.linkageRecord.documentLength).toBe(content.length);
  });

  it("classificationCounts sums to evidenceRecordCount", () => {
    const { s4 } = run("First. Second [1]. Third, see Figure 1.");
    if (s4.ok) {
      const total = Object.values(s4.linkageRecord.classificationCounts).reduce(
        (a, b) => a + b, 0,
      );
      expect(total).toBe(s4.linkageRecord.evidenceRecordCount);
    }
  });

  it("classificationCounts covers all 12 classifications", () => {
    const { s4 } = run("First. Second.");
    if (s4.ok) {
      const keys = Object.keys(s4.linkageRecord.classificationCounts);
      expect(keys).toContain("CITED_REFERENCE");
      expect(keys).toContain("TABLE_EVIDENCE");
      expect(keys).toContain("FIGURE_EVIDENCE");
      expect(keys).toContain("FOOTNOTE_EVIDENCE");
      expect(keys).toContain("APPENDIX_EVIDENCE");
      expect(keys).toContain("QUOTED_SOURCE");
      expect(keys).toContain("DOCUMENT_CROSS_REFERENCE");
      expect(keys).toContain("EXTERNAL_REFERENCE_PRESENT");
      expect(keys).toContain("DIRECT_DOCUMENT_EVIDENCE");
      expect(keys).toContain("AMBIGUOUS_EVIDENCE_LINK");
      expect(keys).toContain("NO_DOCUMENT_EVIDENCE");
      expect(keys).toContain("SEMANTIC_PARAPHRASE_MATCH");
    }
  });
});

// ---------------------------------------------------------------------------
// NO_DOCUMENT_EVIDENCE (default)
// ---------------------------------------------------------------------------

describe("NO_DOCUMENT_EVIDENCE — default", () => {
  it("plain declarative with no evidence → NO_DOCUMENT_EVIDENCE", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok)
      expect(s4.evidenceRecords[0]!.classification).toBe("NO_DOCUMENT_EVIDENCE");
  });

  it("NO_DOCUMENT_EVIDENCE record has empty evidenceSpans", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok)
      expect(s4.evidenceRecords[0]!.evidenceSpans).toHaveLength(0);
  });

  it("linkageRule is EL-NO-EVIDENCE", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok)
      expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-NO-EVIDENCE");
  });
});

// ---------------------------------------------------------------------------
// CITED_REFERENCE — numbered citations
// ---------------------------------------------------------------------------

describe("CITED_REFERENCE — numbered citations", () => {
  it("[1] → CITED_REFERENCE", () => {
    const { s4 } = run("Encryption is mandatory [1].");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });

  it("linkageRule is EL-NUMBERED-CITE", () => {
    const { s4 } = run("Encryption is mandatory [1].");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-NUMBERED-CITE");
  });

  it("[1,2] → CITED_REFERENCE", () => {
    const { s4 } = run("Compliance is required [1,2].");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });

  it("[1-3] → CITED_REFERENCE", () => {
    const { s4 } = run("See references [1-3] for details.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });

  it("evidence span text is '[1]'", () => {
    const content = "Encryption is mandatory [1].";
    const req = makeRequest("ev-nc", "doc-nc", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s4.ok) {
      const span = s4.evidenceRecords[0]!.evidenceSpans[0];
      expect(span?.evidenceText).toBe("[1]");
    }
  });

  it("evidence span satisfies content.slice(start, end) === evidenceText", () => {
    const content = "Encryption is mandatory [1].";
    const req = makeRequest("ev-nc2", "doc-nc2", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s4.ok) {
      for (const rec of s4.evidenceRecords) {
        for (const span of rec.evidenceSpans) {
          expect(content.slice(span.startOffset, span.endOffset)).toBe(span.evidenceText);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// CITED_REFERENCE — bracketed author-year
// ---------------------------------------------------------------------------

describe("CITED_REFERENCE — bracketed citation", () => {
  it("(Smith 2023) → CITED_REFERENCE", () => {
    const { s4 } = run("The risk level is high (Smith 2023).");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });

  it("linkageRule is EL-BRACKETED-CITE", () => {
    const { s4 } = run("The risk level is high (Smith 2023).");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-BRACKETED-CITE");
  });

  it("(WHO 2021) → CITED_REFERENCE", () => {
    const { s4 } = run("Compliance is required (WHO 2021).");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });

  it("(Smith et al. 2023) → CITED_REFERENCE", () => {
    const { s4 } = run("The vulnerability is critical (Smith et al. 2023).");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
  });
});

// ---------------------------------------------------------------------------
// TABLE_EVIDENCE
// ---------------------------------------------------------------------------

describe("TABLE_EVIDENCE", () => {
  it("'See Table 1' → TABLE_EVIDENCE", () => {
    const { s4 } = run("See Table 1 for the full breakdown.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("TABLE_EVIDENCE");
  });

  it("linkageRule is EL-TABLE-REF", () => {
    const { s4 } = run("See Table 1 for the full breakdown.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-TABLE-REF");
  });

  it("'Table A' → TABLE_EVIDENCE", () => {
    const { s4 } = run("The results are shown in Table A.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("TABLE_EVIDENCE");
  });
});

// ---------------------------------------------------------------------------
// FIGURE_EVIDENCE
// ---------------------------------------------------------------------------

describe("FIGURE_EVIDENCE", () => {
  it("'Figure 1' → FIGURE_EVIDENCE", () => {
    const { s4 } = run("The architecture is shown in Figure 1.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("FIGURE_EVIDENCE");
  });

  it("linkageRule is EL-FIGURE-REF", () => {
    const { s4 } = run("The architecture is shown in Figure 1.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-FIGURE-REF");
  });

  it("'Fig. 3' → FIGURE_EVIDENCE", () => {
    const { s4 } = run("The trend is illustrated in Fig. 3.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("FIGURE_EVIDENCE");
  });
});

// ---------------------------------------------------------------------------
// APPENDIX_EVIDENCE
// ---------------------------------------------------------------------------

describe("APPENDIX_EVIDENCE", () => {
  it("'Appendix A' → APPENDIX_EVIDENCE", () => {
    const { s4 } = run("Full details are provided in Appendix A.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("APPENDIX_EVIDENCE");
  });

  it("linkageRule is EL-APPENDIX-REF", () => {
    const { s4 } = run("Full details are provided in Appendix A.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-APPENDIX-REF");
  });

  it("'Annex B' → APPENDIX_EVIDENCE", () => {
    const { s4 } = run("Supporting data is in Annex B.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("APPENDIX_EVIDENCE");
  });
});

// ---------------------------------------------------------------------------
// FOOTNOTE_EVIDENCE
// ---------------------------------------------------------------------------

describe("FOOTNOTE_EVIDENCE", () => {
  it("[^1] markdown footnote (mid-sentence) → FOOTNOTE_EVIDENCE", () => {
    // Footnote marker must appear before the period so Stage 2 includes it in stmt.text
    const { s4 } = run("Compliance is mandatory[^1] for all systems.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("FOOTNOTE_EVIDENCE");
  });

  it("linkageRule is EL-FOOTNOTE-REF", () => {
    const { s4 } = run("Compliance is mandatory[^1] for all systems.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-FOOTNOTE-REF");
  });
});

// ---------------------------------------------------------------------------
// DIRECT_DOCUMENT_EVIDENCE — standards
// ---------------------------------------------------------------------------

describe("DIRECT_DOCUMENT_EVIDENCE — standards", () => {
  it("ISO 27001 → DIRECT_DOCUMENT_EVIDENCE", () => {
    const { s4 } = run("All access controls must comply with ISO 27001.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
  });

  it("linkageRule is EL-STANDARD-REF", () => {
    const { s4 } = run("All access controls must comply with ISO 27001.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-STANDARD-REF");
  });

  it("NIST → DIRECT_DOCUMENT_EVIDENCE", () => {
    const { s4 } = run("The system follows NIST cybersecurity guidelines.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
  });

  it("RFC → DIRECT_DOCUMENT_EVIDENCE", () => {
    const { s4 } = run("TLS must be implemented as per RFC 8446.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
  });

  it("GDPR → DIRECT_DOCUMENT_EVIDENCE", () => {
    const { s4 } = run("Data processing must comply with GDPR requirements.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
  });
});

// ---------------------------------------------------------------------------
// EXTERNAL_REFERENCE_PRESENT — URLs
// ---------------------------------------------------------------------------

describe("EXTERNAL_REFERENCE_PRESENT — URLs", () => {
  it("https URL → EXTERNAL_REFERENCE_PRESENT", () => {
    const { s4 } = run("More details at https://example.com/compliance.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("EXTERNAL_REFERENCE_PRESENT");
  });

  it("linkageRule is EL-URL", () => {
    const { s4 } = run("More details at https://example.com/compliance.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-URL");
  });

  it("http URL → EXTERNAL_REFERENCE_PRESENT", () => {
    const { s4 } = run("See http://nist.gov/csf for the framework.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("EXTERNAL_REFERENCE_PRESENT");
  });

  it("URL span text matches the actual URL", () => {
    const content = "See https://example.com/report for full details.";
    const req = makeRequest("ev-url", "doc-url", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s4.ok) {
      const span = s4.evidenceRecords[0]!.evidenceSpans[0];
      expect(span?.evidenceText).toContain("https://example.com/report");
    }
  });
});

// ---------------------------------------------------------------------------
// DOCUMENT_CROSS_REFERENCE — sections
// ---------------------------------------------------------------------------

describe("DOCUMENT_CROSS_REFERENCE — section refs", () => {
  it("'Section 3' → DOCUMENT_CROSS_REFERENCE", () => {
    const { s4 } = run("As described in Section 3, all data must be encrypted.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DOCUMENT_CROSS_REFERENCE");
  });

  it("linkageRule is EL-SECTION-REF", () => {
    const { s4 } = run("As described in Section 3, all data must be encrypted.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-SECTION-REF");
  });

  it("'Chapter 2' → DOCUMENT_CROSS_REFERENCE", () => {
    const { s4 } = run("The policy is defined in Chapter 2.");
    if (s4.ok) expect(s4.evidenceRecords[0]!.classification).toBe("DOCUMENT_CROSS_REFERENCE");
  });
});

// ---------------------------------------------------------------------------
// Evidence span integrity
// ---------------------------------------------------------------------------

describe("evidence span integrity — all span types", () => {
  const cases = [
    "Encryption is required [1].",
    "See Table 1 for results.",
    "See Figure 1 for the diagram.",
    "Details in Appendix A.",
    "See Section 3 for the policy.",
    "Refer to https://example.com for more.",
    "Compliance requires ISO 27001 certification.",
  ];

  for (const content of cases) {
    it(`spans correct for: "${content.slice(0, 40)}"`, () => {
      const req = makeRequest("ev-si2", "doc-si2", content);
      const s2 = extractClaims(req);
      const s3 = resolveAuthority(req, s2);
      const s4 = linkEvidence(req, s2, s3);
      if (s4.ok) {
        for (const rec of s4.evidenceRecords) {
          for (const span of rec.evidenceSpans) {
            expect(content.slice(span.startOffset, span.endOffset)).toBe(span.evidenceText);
          }
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Deterministic identifiers
// ---------------------------------------------------------------------------

describe("deterministic identifiers", () => {
  it("all record IDs start with 'ar4:'", () => {
    const { s4 } = run("First. Second. Third.");
    if (s4.ok)
      for (const rec of s4.evidenceRecords)
        expect(rec.id).toMatch(/^ar4:/);
  });

  it("all record IDs are unique within one result", () => {
    const { s4 } = run("First. Second. Third. Fourth.");
    if (s4.ok) {
      const ids = s4.evidenceRecords.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("record ID embeds the statementId", () => {
    const req = makeRequest("ev-id", "doc-id", "The system is compliant.");
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    const s4 = linkEvidence(req, s2, s3);
    if (s2.ok && s4.ok) {
      const stmtId = String(s2.statements[0]!.id);
      expect(s4.evidenceRecords[0]!.id).toBe(`ar4:${stmtId}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Invalid input handling
// ---------------------------------------------------------------------------

describe("invalid input handling — never throws", () => {
  it("returns failure for null normalisedRequest", () => {
    const { s2, s3 } = run("Claim.");
    const result = linkEvidence(null, s2, s3);
    expect(result.ok).toBe(false);
  });

  it("does not throw for null normalisedRequest", () => {
    const { s2, s3 } = run("Claim.");
    expect(() => linkEvidence(null, s2, s3)).not.toThrow();
  });

  it("returns failure for null Stage 2 result", () => {
    const { req, s3 } = run("Claim.");
    const result = linkEvidence(req, null, s3);
    expect(result.ok).toBe(false);
  });

  it("returns failure for null Stage 3 result", () => {
    const { req, s2 } = run("Claim.");
    const result = linkEvidence(req, s2, null);
    expect(result.ok).toBe(false);
  });

  it("returns failure for Stage 2 failure result", () => {
    const { req, s3 } = run("Claim.");
    const fakeFailure = { ok: false, stageId: "STAGE_2_CLAIM_EXTRACTION", errors: [], errorCount: 0 };
    const result = linkEvidence(req, fakeFailure, s3);
    expect(result.ok).toBe(false);
  });

  it("returns failure for Stage 3 failure result", () => {
    const { req, s2 } = run("Claim.");
    const fakeFailure = { ok: false, stageId: "STAGE_3_AUTHORITY_RESOLUTION", errors: [], errorCount: 0 };
    const result = linkEvidence(req, s2, fakeFailure);
    expect(result.ok).toBe(false);
  });

  it("failure carries STAGE_4_ID", () => {
    const result = linkEvidence(null, null, null);
    expect(result.stageId).toBe(STAGE_4_ID);
  });

  it("failure errorCount matches errors.length", () => {
    const result = linkEvidence(null, null, null);
    if (!result.ok) expect(result.errorCount).toBe(result.errors.length);
  });

  it("does not throw for all-null inputs", () => {
    expect(() => linkEvidence(null, null, null)).not.toThrow();
  });

  it("does not throw for string inputs", () => {
    expect(() => linkEvidence("bad", "bad", "bad")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// No downstream semantics
// ---------------------------------------------------------------------------

describe("no downstream semantics", () => {
  it("result has no 'decision' field", () => {
    const { s4 } = run("The system is compliant.");
    expect((s4 as unknown as Record<string, unknown>)["decision"]).toBeUndefined();
  });

  it("result has no 'issues' field", () => {
    const { s4 } = run("The system is compliant.");
    expect((s4 as unknown as Record<string, unknown>)["issues"]).toBeUndefined();
  });

  it("result has no 'confidence' field", () => {
    const { s4 } = run("The system is compliant.");
    expect((s4 as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
  });

  it("result has no 'proofReceipt' field", () => {
    const { s4 } = run("The system is compliant.");
    expect((s4 as unknown as Record<string, unknown>)["proofReceipt"]).toBeUndefined();
  });

  it("evidence records have no credibilityScore", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok)
      for (const rec of s4.evidenceRecords)
        expect((rec as unknown as Record<string, unknown>)["credibilityScore"]).toBeUndefined();
  });

  it("evidence records have no materialityLevel", () => {
    const { s4 } = run("The system is compliant.");
    if (s4.ok)
      for (const rec of s4.evidenceRecords)
        expect((rec as unknown as Record<string, unknown>)["materialityLevel"]).toBeUndefined();
  });
});
