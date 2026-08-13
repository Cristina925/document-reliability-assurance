/**
 * DRA-ENG-005 — Stage 3 Boundary Tests
 *
 * Proves Stage 3 performs none of the prohibited operations.
 */

import { describe, it, expect } from "vitest";
import { resolveAuthority } from "../resolve-authority.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { STAGE_3_ID } from "../resolution-result.js";
import { ASSURANCE_DECISIONS, ISSUE_CLASSES } from "../../model/index.js";

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

function runFull(content: string) {
  const req = makeRequest("eb", "db", content);
  const s2 = extractClaims(req);
  return resolveAuthority(req, s2);
}

describe("DRA-ENG-005 Stage 3 Boundary", () => {
  // -------------------------------------------------------------------------
  // No evidence retrieval or mapping
  // -------------------------------------------------------------------------

  describe("no evidence retrieval or mapping", () => {
    it("result does not contain 'evidenceLinks'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["evidenceLinks"]).toBeUndefined();
    });

    it("result does not contain 'evidenceUnits'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["evidenceUnits"]).toBeUndefined();
    });

    it("authority records do not contain 'evidenceMappings'", () => {
      const r = runFull("According to WHO, compliance is required.");
      if (r.ok) {
        for (const rec of r.authorityRecords) {
          expect((rec as unknown as Record<string, unknown>)["evidenceMappings"]).toBeUndefined();
        }
      }
    });

    it("resolution record does not contain evidence support data", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        const rr = r.resolutionRecord as unknown as Record<string, unknown>;
        expect(rr["evidenceSupport"]).toBeUndefined();
        expect(rr["evidenceLinks"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No credibility scoring
  // -------------------------------------------------------------------------

  describe("no credibility scoring", () => {
    it("authority records do not contain credibilityScore", () => {
      const r = runFull("According to WHO, compliance is required.");
      if (r.ok) {
        for (const rec of r.authorityRecords) {
          expect((rec as unknown as Record<string, unknown>)["credibilityScore"]).toBeUndefined();
          expect((rec as unknown as Record<string, unknown>)["credibilityLevel"]).toBeUndefined();
          expect((rec as unknown as Record<string, unknown>)["sourceQuality"]).toBeUndefined();
        }
      }
    });

    it("resolution record does not contain credibility metrics", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        const rr = r.resolutionRecord as unknown as Record<string, unknown>;
        expect(rr["credibilityMetrics"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No materiality assignment
  // -------------------------------------------------------------------------

  describe("no materiality assignment", () => {
    it("authority records do not contain materialityLevel", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        for (const rec of r.authorityRecords) {
          expect((rec as unknown as Record<string, unknown>)["materialityLevel"]).toBeUndefined();
          expect((rec as unknown as Record<string, unknown>)["materiality"]).toBeUndefined();
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No issue creation
  // -------------------------------------------------------------------------

  describe("no issue creation", () => {
    it("result does not contain 'issues'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["issues"]).toBeUndefined();
    });

    it("authority records do not reference issue classes", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        const json = JSON.stringify(r.authorityRecords);
        for (const issueClass of ISSUE_CLASSES) {
          expect(json).not.toContain(issueClass);
        }
      }
    });

    it("Stage 3 failure errors are DraValidationError (not DraIssue)", () => {
      const r = resolveAuthority(null, null);
      if (!r.ok) {
        for (const err of r.errors) {
          expect(err).toHaveProperty("code");
          expect(err).toHaveProperty("path");
          expect(err).toHaveProperty("message");
          expect(err).not.toHaveProperty("issueClass");
          expect(err).not.toHaveProperty("severity");
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No assurance decisions
  // -------------------------------------------------------------------------

  describe("no assurance decisions", () => {
    it("result does not contain 'decision' field", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["decision"]).toBeUndefined();
    });

    it("zero-statement success does not produce SUPPORTED/REVIEW/HOLD", () => {
      const r = runFull("# Heading\n\n---");
      const json = JSON.stringify(r);
      for (const decision of ASSURANCE_DECISIONS) {
        expect(json).not.toMatch(new RegExp(`"decision"\\s*:\\s*"${decision}"`));
      }
    });

    it("Stage 3 result never uses assurance decision values as keys", () => {
      const r = runFull("The system is compliant.");
      for (const decision of ASSURANCE_DECISIONS) {
        expect((r as unknown as Record<string, unknown>)[decision]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No confidence scores
  // -------------------------------------------------------------------------

  describe("no confidence scores", () => {
    it("result does not contain 'confidenceScore'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["confidenceScore"]).toBeUndefined();
    });

    it("authority records do not contain confidence scores", () => {
      const r = runFull("According to WHO, compliance is required.");
      if (r.ok) {
        for (const rec of r.authorityRecords) {
          expect((rec as unknown as Record<string, unknown>)["confidenceScore"]).toBeUndefined();
          expect((rec as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No proof receipt
  // -------------------------------------------------------------------------

  describe("no proof receipt", () => {
    it("result does not contain 'proofReceipt'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["proofReceipt"]).toBeUndefined();
    });

    it("resolution record is not a proof receipt", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        const rr = r.resolutionRecord as unknown as Record<string, unknown>;
        expect(rr["decision"]).toBeUndefined();
        expect(rr["decisionRationale"]).toBeUndefined();
        expect(rr["issueRegister"]).toBeUndefined();
        expect(rr["stageOutputs"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No CTS imports
  // -------------------------------------------------------------------------

  describe("no CTS imports or references", () => {
    it("Stage 3 result does not expose CTS values", () => {
      const r = runFull("The system is compliant.");
      const json = JSON.stringify(r);
      expect(json).not.toContain("FULLY_COVERED");
      expect(json).not.toContain("PARTIALLY_COVERED");
      expect(json).not.toContain("NOT_COVERED");
    });

    it("STAGE_3_ID does not contain 'CTS'", () => {
      expect(STAGE_3_ID).not.toContain("CTS");
    });
  });

  // -------------------------------------------------------------------------
  // Does not re-segment
  // -------------------------------------------------------------------------

  describe("does not re-segment or modify Stage 2 statements", () => {
    it("authority record statementSpan matches Stage 2 spanRef exactly", () => {
      const content = "According to WHO, the system must comply. The audit is complete.";
      const req = makeRequest("eb2", "db2", content);
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

    it("Stage 3 records preserve Stage 2 statementId without modification", () => {
      const content = "Claim one. Claim two.";
      const req = makeRequest("eb3", "db3", content);
      const s2 = extractClaims(req);
      const s3 = resolveAuthority(req, s2);
      if (s2.ok && s3.ok) {
        for (let i = 0; i < s2.statements.length; i++) {
          expect(String(s3.authorityRecords[i]!.statementId)).toBe(
            String(s2.statements[i]!.id),
          );
        }
      }
    });
  });
});
