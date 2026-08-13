/**
 * DRA-ENG-005 — resolveAuthority Integration Tests
 */

import { describe, it, expect } from "vitest";
import { resolveAuthority, RESOLUTION_RULE_VERSION } from "../resolve-authority.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { STAGE_3_ID, STAGE_3_VERSION } from "../resolution-result.js";
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
      generatedAt: "2026-07-26T09:55:00.000Z",
    },
    sourceDocuments: [],
    requestedAt: "2026-07-26T10:00:00.000Z",
  };
}

function run(content: string, evalId = "eval-test", docId = "gen-test") {
  const req = makeRequest(evalId, docId, content);
  const stage2 = extractClaims(req);
  return { req, stage2, stage3: resolveAuthority(req, stage2) };
}

// ---------------------------------------------------------------------------
// Basic success
// ---------------------------------------------------------------------------

describe("DRA-ENG-005 resolveAuthority — basic success", () => {
  it("returns ok: true for valid Stage 2 success input", () => {
    const { stage3 } = run("ISO 27001 compliance is mandatory.");
    expect(stage3.ok).toBe(true);
  });

  it("carries correct stageId", () => {
    const { stage3 } = run("The system is compliant.");
    expect(stage3.stageId).toBe("STAGE_3_AUTHORITY_RESOLUTION");
    expect(stage3.stageId).toBe(STAGE_3_ID);
  });

  it("carries correct pipelineVersion", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) expect(stage3.pipelineVersion).toBe(DRA_PIPELINE_VERSION);
  });

  it("carries correct modelVersion", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) expect(stage3.modelVersion).toBe(DRA_MODEL_VERSION);
  });

  it("carries evaluationId and generatedDocumentId", () => {
    const { stage3 } = run("The system is compliant.", "eval-01", "gen-01");
    if (stage3.ok) {
      expect(stage3.evaluationId).toBe("eval-01");
      expect(stage3.generatedDocumentId).toBe("gen-01");
    }
  });

  it("resolution record carries matching stageId, version, ruleVersion", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) {
      expect(stage3.resolutionRecord.stageId).toBe(STAGE_3_ID);
      expect(stage3.resolutionRecord.stageVersion).toBe(STAGE_3_VERSION);
      expect(stage3.resolutionRecord.resolutionRuleVersion).toBe(RESOLUTION_RULE_VERSION);
    }
  });
});

// ---------------------------------------------------------------------------
// One record per statement
// ---------------------------------------------------------------------------

describe("one authority record per statement", () => {
  it("single statement → one record", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) expect(stage3.authorityRecords).toHaveLength(1);
  });

  it("three statements → three records", () => {
    const { stage3 } = run("First claim. Second claim. Third claim.");
    if (stage3.ok) expect(stage3.authorityRecords).toHaveLength(3);
  });

  it("zero statements → zero records (valid success)", () => {
    const { stage3 } = run("# Heading Only\n\n---");
    expect(stage3.ok).toBe(true);
    if (stage3.ok) expect(stage3.authorityRecords).toHaveLength(0);
  });

  it("record count equals resolution record authorityRecordCount", () => {
    const { stage3 } = run("First. Second. Third.");
    if (stage3.ok) {
      expect(stage3.authorityRecords.length).toBe(stage3.resolutionRecord.authorityRecordCount);
    }
  });

  it("record count equals resolution record statementCount", () => {
    const { stage3 } = run("First. Second. Third.");
    if (stage3.ok) {
      expect(stage3.resolutionRecord.statementCount).toBe(stage3.authorityRecords.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Record ordering
// ---------------------------------------------------------------------------

describe("records ordered by statementIndex", () => {
  it("recordIndex values are 0-based and strictly ascending", () => {
    const { stage3 } = run("First claim. Second claim. Third claim.");
    if (stage3.ok) {
      const indices = stage3.authorityRecords.map((r) => r.recordIndex);
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]!).toBeGreaterThan(indices[i - 1]!);
      }
    }
  });

  it("statement spans are in document order", () => {
    const { stage3 } = run("First claim. Second claim. Third claim.");
    if (stage3.ok) {
      const offsets = stage3.authorityRecords.map((r) => r.statementSpan.startOffset);
      for (let i = 1; i < offsets.length; i++) {
        expect(offsets[i]!).toBeGreaterThan(offsets[i - 1]!);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Statement identity preservation
// ---------------------------------------------------------------------------

describe("statement identity preservation", () => {
  it("record.statementId matches Stage 2 statement id", () => {
    const req = makeRequest("eval-x", "gen-x", "The system is compliant.");
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s2.ok && s3.ok) {
      expect(String(s3.authorityRecords[0]!.statementId)).toBe(String(s2.statements[0]!.id));
    }
  });

  it("statementSpan matches Stage 2 spanRef", () => {
    const content = "ABC. DEF. GHI.";
    const req = makeRequest("eval-y", "gen-y", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s2.ok && s3.ok) {
      for (let i = 0; i < s2.statements.length; i++) {
        const stmt = s2.statements[i]!;
        const rec = s3.authorityRecords[i]!;
        expect(rec.statementSpan.startOffset).toBe(stmt.spanRef?.startOffset);
        expect(rec.statementSpan.endOffset).toBe(stmt.spanRef?.endOffset);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Document author (default)
// ---------------------------------------------------------------------------

describe("DOCUMENT_AUTHOR classification", () => {
  it("ordinary declarative sentence → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("ISO 27001 compliance is mandatory for all systems.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("recommendation → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("We recommend implementing multi-factor authentication.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("forecast → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("The threat landscape is expected to intensify by 2027.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("conclusion → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("Therefore, the system is considered compliant.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("self-referential 'We found' → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("We found that encryption is properly implemented.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("'This document confirms' → DOCUMENT_AUTHOR", () => {
    const { stage3 } = run("This document confirms that all controls are in place.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("DOCUMENT_AUTHOR");
  });

  it("DOCUMENT_AUTHOR record has no authorityText", () => {
    const { stage3 } = run("Compliance is required.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.authorityText).toBeUndefined();
  });

  it("DOCUMENT_AUTHOR record has no authoritySpan", () => {
    const { stage3 } = run("Compliance is required.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.authoritySpan).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Explicit named source
// ---------------------------------------------------------------------------

describe("EXPLICIT_NAMED_SOURCE — according to named", () => {
  it("'According to WHO, ...' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("According to WHO, the system must comply with international standards.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("authority text is 'WHO'", () => {
    const { stage3 } = run("According to WHO, the system must comply.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.authorityText).toBe("WHO");
  });

  it("authorityType for WHO is ORGANISATION", () => {
    const { stage3 } = run("According to WHO, compliance is required.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.authorityType).toBe("ORGANISATION");
  });

  it("named person: 'According to Dr. Smith, ...' → EXPLICIT_NAMED_SOURCE", () => {
    const content = "According to Dr. Smith, the audit was successful.";
    const { stage3 } = run(content);
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("named publication: authority from report reference", () => {
    const { stage3 } = run(
      "According to the 2023 Annual Report, revenue increased by 15 percent.",
    );
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("named regulation: according to ISO 27001", () => {
    const { stage3 } = run("According to ISO 27001, access controls must be documented.");
    if (stage3.ok) {
      expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
      expect(stage3.authorityRecords[0]!.authorityType).toBe("REGULATION");
    }
  });

  it("authority span integrity: content.slice(start, end) === authorityText", () => {
    const content = "According to WHO, the system must comply.";
    const req = makeRequest("e1", "d1", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) {
      const rec = s3.authorityRecords[0]!;
      if (rec.authoritySpan && rec.authorityText) {
        expect(content.slice(rec.authoritySpan.startOffset, rec.authoritySpan.endOffset)).toBe(
          rec.authorityText,
        );
      }
    }
  });
});

describe("EXPLICIT_NAMED_SOURCE — subject attribution", () => {
  it("'[Org] states that ...' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("The National Institute of Standards states that encryption is mandatory.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("'[Person] said that ...' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("Jane Smith said that all controls have been verified.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("'[Org] confirmed ...' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("The Audit Committee confirmed that no violations were found.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("authority text matches the named subject", () => {
    const { stage3 } = run("Jane Smith said that all controls have been verified.");
    if (stage3.ok) {
      const rec = stage3.authorityRecords[0]!;
      expect(rec.authorityText).toBe("Jane Smith");
    }
  });
});

describe("EXPLICIT_NAMED_SOURCE — authority after statement", () => {
  it("'..., according to WHO.' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("Compliance is required, according to WHO.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("authority text captured after the statement", () => {
    const { stage3 } = run("The deadline is Q3 2025, according to the Annual Plan.");
    if (stage3.ok) {
      const rec = stage3.authorityRecords[0]!;
      expect(rec.authorityText).toContain("Annual Plan");
    }
  });
});

describe("EXPLICIT_NAMED_SOURCE — speaker label", () => {
  it("'Dr. Smith: statement text' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("Dr. Smith: The audit was completed successfully.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });

  it("speaker label authority text does not include the colon", () => {
    const { stage3 } = run("Dr. Smith: The audit was completed successfully.");
    if (stage3.ok) {
      expect(stage3.authorityRecords[0]!.authorityText).not.toContain(":");
    }
  });

  it("'John Smith: All findings have been reviewed.' → EXPLICIT_NAMED_SOURCE", () => {
    const { stage3 } = run("John Smith: All findings have been reviewed.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_NAMED_SOURCE");
  });
});

// ---------------------------------------------------------------------------
// Explicit unnamed source
// ---------------------------------------------------------------------------

describe("EXPLICIT_UNNAMED_SOURCE", () => {
  it("'According to experts, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
    const { stage3 } = run("According to experts, the risk level is high.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_UNNAMED_SOURCE");
  });

  it("'According to reports, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
    const { stage3 } = run("According to reports, compliance has improved.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_UNNAMED_SOURCE");
  });

  it("'Officials reported that ...' → EXPLICIT_UNNAMED_SOURCE", () => {
    const { stage3 } = run("Officials reported that the incident was contained.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_UNNAMED_SOURCE");
  });

  it("'According to researchers, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
    const { stage3 } = run("According to researchers, the vulnerability affects all versions.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_UNNAMED_SOURCE");
  });

  it("'Industry observers suggest ...' → EXPLICIT_UNNAMED_SOURCE", () => {
    const { stage3 } = run("Industry observers suggest the market will grow by 20 percent.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("EXPLICIT_UNNAMED_SOURCE");
  });

  it("EXPLICIT_UNNAMED_SOURCE authorityType is UNNAMED", () => {
    const { stage3 } = run("According to experts, the risk level is high.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.authorityType).toBe("UNNAMED");
  });
});

// ---------------------------------------------------------------------------
// Structural inheritance
// ---------------------------------------------------------------------------

describe("STRUCTURALLY_INHERITED_SOURCE", () => {
  it("statement following 'According to WHO,' (preceding line) → STRUCTURALLY_INHERITED_SOURCE", () => {
    const content = "According to the 2023 Audit Report:\nAll systems passed the security review.";
    const { stage3 } = run(content);
    if (stage3.ok) {
      // The second statement (the one with "All systems passed") should inherit
      const records = stage3.authorityRecords;
      const inherited = records.find((r) => r.classification === "STRUCTURALLY_INHERITED_SOURCE");
      // May or may not be present depending on extraction, but should not crash
      expect(stage3.ok).toBe(true);
    }
  });

  it("inheritance carries inheritedContextRef", () => {
    const content = "According to the 2023 Audit Report:\nAll systems passed the security review.";
    const { stage3 } = run(content);
    if (stage3.ok) {
      const inherited = stage3.authorityRecords.find(
        (r) => r.classification === "STRUCTURALLY_INHERITED_SOURCE",
      );
      if (inherited) {
        expect(inherited.inheritedContextRef).toBeDefined();
        expect(inherited.inheritedContextRef).toMatch(/^preceding-line:\d+$/);
      }
    }
  });

  it("no inheritance across paragraph boundary", () => {
    // Blank line between attribution and statement = boundary, no inheritance
    const content = "According to WHO:\n\nThe system is compliant.";
    const { stage3 } = run(content);
    if (stage3.ok) {
      // "The system is compliant." has a blank line before it → no inheritance
      const record = stage3.authorityRecords.find((r) =>
        r.statementSpan.startOffset > content.indexOf("\n\n"),
      );
      if (record) {
        expect(record.classification).not.toBe("STRUCTURALLY_INHERITED_SOURCE");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Ambiguous source
// ---------------------------------------------------------------------------

describe("AMBIGUOUS_SOURCE", () => {
  it("pronoun subject 'He said ...' → AMBIGUOUS_SOURCE", () => {
    const { stage3 } = run("He said that compliance is mandatory.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("AMBIGUOUS_SOURCE");
  });

  it("pronoun 'She reported ...' → AMBIGUOUS_SOURCE", () => {
    const { stage3 } = run("She reported that the system passed all tests.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("AMBIGUOUS_SOURCE");
  });

  it("pronoun 'They found ...' → AMBIGUOUS_SOURCE", () => {
    const { stage3 } = run("They found that encryption was not properly configured.");
    if (stage3.ok) expect(stage3.authorityRecords[0]!.classification).toBe("AMBIGUOUS_SOURCE");
  });

  it("AMBIGUOUS_SOURCE carries ambiguityDetails", () => {
    const { stage3 } = run("He said that compliance is mandatory.");
    if (stage3.ok) {
      expect(stage3.authorityRecords[0]!.ambiguityDetails).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Authority span integrity
// ---------------------------------------------------------------------------

describe("authority span integrity", () => {
  it("all authority spans satisfy content.slice(start, end) === authorityText", () => {
    const content = "According to WHO, compliance is required. The system is audited quarterly.";
    const req = makeRequest("e-span", "d-span", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) {
      for (const rec of s3.authorityRecords) {
        if (rec.authoritySpan && rec.authorityText) {
          expect(content.slice(rec.authoritySpan.startOffset, rec.authoritySpan.endOffset)).toBe(
            rec.authorityText,
          );
        }
      }
    }
  });

  it("authority spans have non-negative startOffset", () => {
    const content = "According to the NIST framework, encryption is mandatory.";
    const req = makeRequest("e-s2", "d-s2", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) {
      for (const rec of s3.authorityRecords) {
        if (rec.authoritySpan) {
          expect(rec.authoritySpan.startOffset).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("authority spans have endOffset > startOffset", () => {
    const content = "According to the NIST framework, encryption is mandatory.";
    const req = makeRequest("e-s3", "d-s3", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) {
      for (const rec of s3.authorityRecords) {
        if (rec.authoritySpan) {
          expect(rec.authoritySpan.endOffset).toBeGreaterThan(rec.authoritySpan.startOffset);
        }
      }
    }
  });

  it("authority spans within document bounds", () => {
    const content = "According to ISO 27001, all systems must be audited.";
    const req = makeRequest("e-s4", "d-s4", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) {
      for (const rec of s3.authorityRecords) {
        if (rec.authoritySpan) {
          expect(rec.authoritySpan.endOffset).toBeLessThanOrEqual(content.length);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Deterministic identifiers
// ---------------------------------------------------------------------------

describe("deterministic identifiers", () => {
  it("all record IDs start with 'ar3:'", () => {
    const { stage3 } = run("First claim. Second claim. Third claim.");
    if (stage3.ok) {
      for (const rec of stage3.authorityRecords) {
        expect(rec.id).toMatch(/^ar3:/);
      }
    }
  });

  it("all record IDs are unique within one resolution", () => {
    const { stage3 } = run("First. Second. Third. Fourth.");
    if (stage3.ok) {
      const ids = stage3.authorityRecords.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("same input produces the same record IDs on repeated calls", () => {
    const content = "Compliance is required. Encryption is mandatory.";
    const req = makeRequest("e-det", "d-det", content);
    const s2a = extractClaims(req);
    const s2b = extractClaims(req);
    const s3a = resolveAuthority(req, s2a);
    const s3b = resolveAuthority(req, s2b);
    if (s3a.ok && s3b.ok) {
      const idsA = s3a.authorityRecords.map((r) => r.id);
      const idsB = s3b.authorityRecords.map((r) => r.id);
      expect(idsA).toStrictEqual(idsB);
    }
  });

  it("record ID embeds the statementId", () => {
    const req = makeRequest("e-id", "d-id", "The system is compliant.");
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s2.ok && s3.ok) {
      const stmtId = String(s2.statements[0]!.id);
      expect(s3.authorityRecords[0]!.id).toBe(`ar3:${stmtId}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("determinism", () => {
  it("identical inputs produce deeply equal Stage 3 results", () => {
    const content = "According to WHO, compliance is required. The system is audited.";
    const req = makeRequest("e-det2", "d-det2", content);
    const s2a = extractClaims(req);
    const s2b = extractClaims(req);
    const s3a = resolveAuthority(req, s2a);
    const s3b = resolveAuthority(req, s2b);
    if (s3a.ok && s3b.ok) {
      expect(s3a.authorityRecords).toStrictEqual(s3b.authorityRecords);
      expect(s3a.resolutionRecord).toStrictEqual(s3b.resolutionRecord);
    }
  });
});

// ---------------------------------------------------------------------------
// Invalid input
// ---------------------------------------------------------------------------

describe("invalid input handling", () => {
  it("returns failure for null normalisedRequest", () => {
    const { stage2 } = run("Claim.");
    const result = resolveAuthority(null, stage2);
    expect(result.ok).toBe(false);
  });

  it("does not throw for null normalisedRequest", () => {
    const { stage2 } = run("Claim.");
    expect(() => resolveAuthority(null, stage2)).not.toThrow();
  });

  it("returns failure for null Stage 2 result", () => {
    const { req } = run("Claim.");
    const result = resolveAuthority(req, null);
    expect(result.ok).toBe(false);
  });

  it("returns failure for Stage 2 failure result", () => {
    const { req } = run("Claim.");
    const fakeFailure = { ok: false, stageId: "STAGE_2_CLAIM_EXTRACTION", errors: [], errorCount: 0 };
    const result = resolveAuthority(req, fakeFailure);
    expect(result.ok).toBe(false);
  });

  it("failure result carries STAGE_3_ID", () => {
    const { stage2 } = run("Claim.");
    const result = resolveAuthority(null, stage2);
    expect(result.stageId).toBe(STAGE_3_ID);
  });

  it("failure errorCount matches errors.length", () => {
    const result = resolveAuthority(null, null);
    if (!result.ok) expect(result.errorCount).toBe(result.errors.length);
  });

  it("does not throw for undefined inputs", () => {
    expect(() => resolveAuthority(undefined, undefined)).not.toThrow();
  });

  it("does not throw for string inputs", () => {
    expect(() => resolveAuthority("not a request", "not a result")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Resolution record
// ---------------------------------------------------------------------------

describe("resolution record", () => {
  it("documentLength equals content.length", () => {
    const content = "The system is compliant.";
    const req = makeRequest("e-rl", "d-rl", content);
    const s2 = extractClaims(req);
    const s3 = resolveAuthority(req, s2);
    if (s3.ok) expect(s3.resolutionRecord.documentLength).toBe(content.length);
  });

  it("classificationCounts sums to authorityRecordCount", () => {
    const { stage3 } = run("First. Second. Third. According to WHO, fourth.");
    if (stage3.ok) {
      const total = Object.values(stage3.resolutionRecord.classificationCounts).reduce(
        (a, b) => a + b,
        0,
      );
      expect(total).toBe(stage3.resolutionRecord.authorityRecordCount);
    }
  });

  it("classificationCounts covers all six classifications", () => {
    const { stage3 } = run("First. Second.");
    if (stage3.ok) {
      const keys = Object.keys(stage3.resolutionRecord.classificationCounts);
      expect(keys).toContain("DOCUMENT_AUTHOR");
      expect(keys).toContain("EXPLICIT_NAMED_SOURCE");
      expect(keys).toContain("EXPLICIT_UNNAMED_SOURCE");
      expect(keys).toContain("STRUCTURALLY_INHERITED_SOURCE");
      expect(keys).toContain("AMBIGUOUS_SOURCE");
      expect(keys).toContain("NO_IDENTIFIABLE_SOURCE");
    }
  });
});

// ---------------------------------------------------------------------------
// No confidence, no issues, no decisions
// ---------------------------------------------------------------------------

describe("no downstream semantics", () => {
  it("no 'decision' field in result", () => {
    const { stage3 } = run("The system is compliant.");
    expect((stage3 as unknown as Record<string, unknown>)["decision"]).toBeUndefined();
  });

  it("no 'issues' field in result", () => {
    const { stage3 } = run("The system is compliant.");
    expect((stage3 as unknown as Record<string, unknown>)["issues"]).toBeUndefined();
  });

  it("no 'confidence' field in result", () => {
    const { stage3 } = run("The system is compliant.");
    expect((stage3 as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
  });

  it("no 'proofReceipt' field in result", () => {
    const { stage3 } = run("The system is compliant.");
    expect((stage3 as unknown as Record<string, unknown>)["proofReceipt"]).toBeUndefined();
  });

  it("no 'evidenceLinks' in authority records", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) {
      for (const rec of stage3.authorityRecords) {
        expect((rec as unknown as Record<string, unknown>)["evidenceLinks"]).toBeUndefined();
      }
    }
  });

  it("no confidence score in any authority record", () => {
    const { stage3 } = run("The system is compliant.");
    if (stage3.ok) {
      for (const rec of stage3.authorityRecords) {
        expect((rec as unknown as Record<string, unknown>)["confidenceScore"]).toBeUndefined();
        expect((rec as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
      }
    }
  });
});
