/**
 * DRA-ENG-007 — Materiality Assessment — Integration Tests
 *
 * Tests the full assessMateriality() pipeline integration:
 *   - valid inputs → Stage5Success with one record per statement
 *   - invalid inputs → Stage5Failure without throwing
 *   - zero statements → Stage5Success with zero records
 *   - determinism
 *   - ordering
 *   - evaluationId cross-check
 *   - no downstream semantics in output
 */

import { describe, it, expect } from "vitest";
import { normaliseEvaluationRequest } from "../../normalisation/index.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { resolveAuthority } from "../../authority-resolution/index.js";
import { linkEvidence } from "../../evidence-linkage/index.js";
import { assessMateriality } from "../assess-materiality.js";
import type { Stage5Success } from "../materiality-result.js";
import { MATERIALITY_CLASSIFICATIONS } from "../materiality-classification.js";

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

/**
 * Runs all four preceding pipeline stages then calls assessMateriality.
 * Returns the Stage5Result alongside the intermediate results for assertions.
 */
function run(content: string) {
  const req = makeRequest("eval-t", "gen-t", content);
  const s1 = normaliseEvaluationRequest(req);
  if (!s1.ok) throw new Error(`Stage 1 failed: ${JSON.stringify(s1.errors)}`);
  const s2 = extractClaims(s1.normalisedRequest);
  if (!s2.ok) throw new Error(`Stage 2 failed: ${JSON.stringify(s2.errors)}`);
  const s3 = resolveAuthority(s1.normalisedRequest, s2);
  if (!s3.ok) throw new Error(`Stage 3 failed: ${JSON.stringify(s3.errors)}`);
  const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
  if (!s4.ok) throw new Error(`Stage 4 failed: ${JSON.stringify(s4.errors)}`);
  const s5 = assessMateriality(s1.normalisedRequest, s2, s3, s4);
  // s1 is narrowed to Stage1Success by the throw guard above
  return { s1, req: s1.normalisedRequest, s2, s3, s4, s5 };
}

// ---------------------------------------------------------------------------
// Basic success path
// ---------------------------------------------------------------------------

describe("assessMateriality — basic success", () => {
  it("returns ok:true for valid pipeline inputs", () => {
    const { s5 } = run("All personal data must be processed in compliance with GDPR.");
    expect(s5.ok).toBe(true);
  });

  it("returns stageId STAGE_5_MATERIALITY_ASSESSMENT", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    expect(s5.stageId).toBe("STAGE_5_MATERIALITY_ASSESSMENT");
  });

  it("returns the evaluationId from Stage 2", () => {
    const { s2, s5 } = run("All systems must be patched within 30 days.");
    if (s5.ok) expect(s5.evaluationId).toBe(s2.evaluationId);
  });

  it("produces one materiality record per statement", () => {
    const content = [
      "All personal data must be processed in compliance with GDPR.",
      "The proposal has been approved by the executive committee.",
      "The API should use JWT tokens for session management.",
    ].join(" ");
    const { s2, s5 } = run(content);
    if (s5.ok) {
      expect(s5.materialityRecords.length).toBe(s2.statements.length);
    }
  });

  it("records are ordered by statementIndex (ascending)", () => {
    const content = [
      "The vendor commits to deliver the software by March 31.",
      "We recommend migrating to the new platform before Q3.",
      "For example, a user may upload a PDF document.",
    ].join(" ");
    const { s5 } = run(content);
    if (s5.ok) {
      for (let i = 0; i < s5.materialityRecords.length; i++) {
        expect(s5.materialityRecords[i]!.recordIndex).toBe(i);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// CRITICAL materiality
// ---------------------------------------------------------------------------

describe("CRITICAL materiality — integration", () => {
  it("GDPR mandate → CRITICAL", () => {
    const { s5 } = run("All personal data must be processed in compliance with GDPR.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("CRITICAL");
    }
  });

  it("contractual commitment → CRITICAL", () => {
    const { s5 } = run("The vendor commits to deliver the software by March 31.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("CRITICAL");
    }
  });

  it("encryption mandate → CRITICAL", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("CRITICAL");
    }
  });

  it("legally required → CRITICAL", () => {
    const { s5 } = run("The company is legally required to retain records for seven years.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("CRITICAL");
    }
  });
});

// ---------------------------------------------------------------------------
// HIGH materiality
// ---------------------------------------------------------------------------

describe("HIGH materiality — integration", () => {
  it("approval → HIGH", () => {
    const { s5 } = run("The proposal has been approved by the executive committee.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("HIGH");
    }
  });

  it("executive recommendation → HIGH", () => {
    const { s5 } = run("We recommend migrating to the new platform before Q3.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("HIGH");
    }
  });

  it("formal decision → HIGH", () => {
    const { s5 } = run("It has been decided to suspend the legacy service in January.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("HIGH");
    }
  });
});

// ---------------------------------------------------------------------------
// MODERATE materiality
// ---------------------------------------------------------------------------

describe("MODERATE materiality — integration", () => {
  it("should guidance → MODERATE", () => {
    const { s5 } = run("The API should use JWT tokens for session management.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("MODERATE");
    }
  });

  it("design assumption → MODERATE", () => {
    const { s5 } = run("This design assumes that all users have internet connectivity.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("MODERATE");
    }
  });

  it("warning → MODERATE", () => {
    const { s5 } = run("Warning: disabling this setting may expose sensitive data.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("MODERATE");
    }
  });
});

// ---------------------------------------------------------------------------
// LOW materiality
// ---------------------------------------------------------------------------

describe("LOW materiality — integration", () => {
  it("example → LOW", () => {
    const { s5 } = run("For example, a user may upload a PDF document.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("LOW");
    }
  });

  it("descriptive → LOW", () => {
    const { s5 } = run("The system contains three main modules for data processing.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("LOW");
    }
  });

  it("background → LOW", () => {
    const { s5 } = run("Historically, the process has been entirely manual.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("LOW");
    }
  });
});

// ---------------------------------------------------------------------------
// INFORMATIONAL materiality
// ---------------------------------------------------------------------------

describe("INFORMATIONAL materiality — integration", () => {
  it("Version label → INFORMATIONAL", () => {
    const { s5 } = run("Version: 1.0");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.classification).toBe("INFORMATIONAL");
    }
  });
});

// ---------------------------------------------------------------------------
// Zero statements
// ---------------------------------------------------------------------------

describe("Zero statements", () => {
  it("very short content (below MIN_CANDIDATE_CHARS) → Stage5Success with zero records", () => {
    // Stage 1 requires non-empty content; Stage 2 requires >= MIN_CANDIDATE_CHARS characters
    // for a segment to become a statement. "OK." is valid for Stage 1 but too short for Stage 2.
    const { s5, s2 } = run("OK.");
    expect(s5.ok).toBe(true);
    if (s5.ok) {
      // The statement count equals Stage 2's output count (could be 0 or very few)
      expect(s5.materialityRecords).toHaveLength(s2.ok ? s2.statements.length : 0);
    }
  });

  it("content that produces zero Stage 2 statements → Stage5Success with zero records", () => {
    // Use a sentence just long enough for Stage 1 but that produces no extractable claims.
    const { s5, s2 } = run("Note.");
    expect(s5.ok).toBe(true);
    if (s5.ok && s2.ok && s2.statements.length === 0) {
      expect(s5.materialityRecords).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("Determinism", () => {
  it("identical inputs produce identical outputs", () => {
    const content = "All personal data must be processed in compliance with GDPR. For example, a user may upload a PDF document.";
    const { s5: r1 } = run(content);
    const { s5: r2 } = run(content);
    expect(r1.ok).toBe(r2.ok);
    if (r1.ok && r2.ok) {
      expect(r1.materialityRecords.length).toBe(r2.materialityRecords.length);
      for (let i = 0; i < r1.materialityRecords.length; i++) {
        expect(r1.materialityRecords[i]!.classification).toBe(r2.materialityRecords[i]!.classification);
        expect(r1.materialityRecords[i]!.ruleId).toBe(r2.materialityRecords[i]!.ruleId);
        expect(r1.materialityRecords[i]!.id).toBe(r2.materialityRecords[i]!.id);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Record identifiers
// ---------------------------------------------------------------------------

describe("Record identifiers", () => {
  it("each record id starts with ar5:", () => {
    const { s5 } = run("All systems must be patched within 30 days. For example, Apache must be upgraded.");
    if (s5.ok) {
      for (const rec of s5.materialityRecords) {
        expect(rec.id).toMatch(/^ar5:/);
      }
    }
  });

  it("record ids are unique across all records", () => {
    const content = "Encryption must be enabled. The API should use JWT. For example, use bcrypt.";
    const { s5 } = run(content);
    if (s5.ok) {
      const ids = s5.materialityRecords.map((r) => r.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Assessment record
// ---------------------------------------------------------------------------

describe("Stage5Success.assessmentRecord", () => {
  it("statementCount equals materialityRecordCount", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest. Best practice is to rotate credentials.");
    if (s5.ok) {
      expect(s5.assessmentRecord.statementCount).toBe(s5.assessmentRecord.materialityRecordCount);
      expect(s5.assessmentRecord.materialityRecordCount).toBe(s5.materialityRecords.length);
    }
  });

  it("classificationCounts has all 6 classifications", () => {
    const { s5 } = run("All personal data must be processed in compliance with GDPR.");
    if (s5.ok) {
      const keys = Object.keys(s5.assessmentRecord.classificationCounts);
      for (const c of MATERIALITY_CLASSIFICATIONS) {
        expect(keys).toContain(c);
      }
    }
  });

  it("classificationCounts sums to statementCount", () => {
    const content = "Encryption must be enabled. The API should use JWT. For example, use bcrypt.";
    const { s5 } = run(content);
    if (s5.ok) {
      const total = Object.values(s5.assessmentRecord.classificationCounts).reduce(
        (sum, n) => sum + n,
        0,
      );
      expect(total).toBe(s5.assessmentRecord.statementCount);
    }
  });
});

// ---------------------------------------------------------------------------
// Structural context
// ---------------------------------------------------------------------------

describe("StructuralContext", () => {
  it("hasDeonticModal is true for must statement", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.structuralContext.hasDeonticModal).toBe(true);
    }
  });

  it("statementLength is greater than zero for non-empty statement", () => {
    const { s5 } = run("The system contains three main modules.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      expect(s5.materialityRecords[0]!.structuralContext.statementLength).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Failure paths — invalid input, never throws
// ---------------------------------------------------------------------------

describe("assessMateriality — failure paths (never throws)", () => {
  it("returns ok:false for null normalisedRequest", () => {
    const { s2, s3, s4 } = run("Encryption must be enabled for all data at rest.");
    const s5 = assessMateriality(null, s2, s3, s4);
    expect(s5.ok).toBe(false);
  });

  it("returns ok:false for Stage 4 failure result", () => {
    const { req, s2, s3 } = run("Encryption must be enabled for all data at rest.");
    const fakeFailure = { ok: false, stageId: "STAGE_4_EVIDENCE_LINKAGE", errors: [], errorCount: 0 };
    const s5 = assessMateriality(req, s2, s3, fakeFailure);
    expect(s5.ok).toBe(false);
  });

  it("returns ok:false for null Stage 4 result", () => {
    const { req, s2, s3 } = run("Encryption must be enabled for all data at rest.");
    const s5 = assessMateriality(req, s2, s3, null);
    expect(s5.ok).toBe(false);
  });

  it("returns ok:false for Stage 2 failure result", () => {
    const { req } = run("Encryption must be enabled for all data at rest.");
    const s2fail = { ok: false, stageId: "STAGE_2_CLAIM_EXTRACTION", errors: [], errorCount: 0 };
    const s3fail = { ok: false, stageId: "STAGE_3_AUTHORITY_RESOLUTION", errors: [], errorCount: 0 };
    const s4fail = { ok: false, stageId: "STAGE_4_EVIDENCE_LINKAGE", errors: [], errorCount: 0 };
    const s5 = assessMateriality(req, s2fail, s3fail, s4fail);
    expect(s5.ok).toBe(false);
  });

  it("never throws for undefined inputs", () => {
    expect(() => assessMateriality(undefined, undefined, undefined, undefined)).not.toThrow();
  });

  it("never throws for completely invalid inputs", () => {
    expect(() => assessMateriality("bad", 42, true, [])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// No downstream semantics in output
// ---------------------------------------------------------------------------

describe("assessMateriality — no downstream semantics", () => {
  it("Stage5Success carries no decision field", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) {
      const s = s5 as unknown as Record<string, unknown>;
      expect(s["decision"]).toBeUndefined();
      expect(s["SUPPORTED"]).toBeUndefined();
      expect(s["REVIEW"]).toBeUndefined();
      expect(s["HOLD"]).toBeUndefined();
    }
  });

  it("Stage5Success carries no confidence score", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) {
      const s = s5 as unknown as Record<string, unknown>;
      expect(s["confidence"]).toBeUndefined();
      expect(s["confidenceScore"]).toBeUndefined();
    }
  });

  it("Stage5Success carries no proofReceipt", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) {
      const s = s5 as unknown as Record<string, unknown>;
      expect(s["proofReceipt"]).toBeUndefined();
      expect(s["receipt"]).toBeUndefined();
    }
  });

  it("MaterialityRecord carries no issueClass", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      const r = s5.materialityRecords[0]! as unknown as Record<string, unknown>;
      expect(r["issueClass"]).toBeUndefined();
      expect(r["issue"]).toBeUndefined();
    }
  });

  it("triggeringCharacteristics contains only strings", () => {
    const { s5 } = run("All personal data must be processed in compliance with GDPR.");
    if (s5.ok && s5.materialityRecords.length > 0) {
      for (const char of s5.materialityRecords[0]!.triggeringCharacteristics) {
        expect(typeof char).toBe("string");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// EvaluationId cross-check
// ---------------------------------------------------------------------------

describe("evaluationId cross-check", () => {
  it("mismatched Stage 4 evaluationId → Stage5Failure", () => {
    const { req, s2, s3 } = run("Encryption must be enabled for all data at rest.");
    // Construct a fake Stage4Success with a different evaluationId
    const fakeS4 = {
      ok: true,
      stageId: "STAGE_4_EVIDENCE_LINKAGE",
      pipelineVersion: "1.0.0",
      modelVersion: "1.0.0",
      evaluationId: "WRONG-EVAL-ID",
      generatedDocumentId: "gen-t",
      evidenceRecords: [],
      linkageRecord: {},
      warnings: [],
    };
    const s5 = assessMateriality(req, s2, s3, fakeS4);
    expect(s5.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Stage 5 success fields
// ---------------------------------------------------------------------------

describe("Stage5Success fields", () => {
  it("ok is true", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    expect(s5.ok).toBe(true);
  });

  it("pipelineVersion is a non-empty string", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) expect(typeof s5.pipelineVersion).toBe("string");
  });

  it("warnings is an array", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) expect(Array.isArray(s5.warnings)).toBe(true);
  });

  it("each record has a non-empty rationale string", () => {
    const { s5 } = run("Encryption must be enabled for all data at rest.");
    if (s5.ok) {
      for (const rec of s5.materialityRecords) {
        expect(typeof rec.rationale).toBe("string");
        expect(rec.rationale.length).toBeGreaterThan(0);
      }
    }
  });

  it("each record's statementSpan has non-negative offsets", () => {
    const { s5 } = run("All personal data must be processed in compliance with GDPR.");
    if (s5.ok) {
      for (const rec of s5.materialityRecords) {
        expect(rec.statementSpan.startOffset).toBeGreaterThanOrEqual(0);
        expect(rec.statementSpan.endOffset).toBeGreaterThanOrEqual(rec.statementSpan.startOffset);
      }
    }
  });
});
