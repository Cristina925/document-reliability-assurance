/**
 * DRA-ENG-006 — Stage 4 Boundary Tests
 *
 * Proves Stage 4 performs none of the prohibited operations.
 */

import { describe, it, expect } from "vitest";
import { linkEvidence } from "../link-evidence.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { resolveAuthority } from "../../authority-resolution/index.js";
import { STAGE_4_ID } from "../linkage-result.js";
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
      generatedAt: "2026-07-26T12:00:00.000Z",
    },
    sourceDocuments: [],
    requestedAt: "2026-07-26T12:00:00.000Z",
  };
}

function runFull(content: string) {
  const req = makeRequest("eb4", "db4", content);
  const s2 = extractClaims(req);
  const s3 = resolveAuthority(req, s2);
  return linkEvidence(req, s2, s3);
}

describe("DRA-ENG-006 Stage 4 Boundary", () => {
  // -------------------------------------------------------------------------
  // No credibility evaluation
  // -------------------------------------------------------------------------

  describe("no credibility evaluation", () => {
    it("evidence records do not contain credibilityScore", () => {
      const r = runFull("Encryption is mandatory [1].");
      if (r.ok)
        for (const rec of r.evidenceRecords)
          expect((rec as unknown as Record<string, unknown>)["credibilityScore"]).toBeUndefined();
    });

    it("evidence records do not contain sourceQuality", () => {
      const r = runFull("Encryption is mandatory [1].");
      if (r.ok)
        for (const rec of r.evidenceRecords)
          expect((rec as unknown as Record<string, unknown>)["sourceQuality"]).toBeUndefined();
    });

    it("linkage record does not contain credibilityMetrics", () => {
      const r = runFull("The system is compliant.");
      if (r.ok)
        expect((r.linkageRecord as unknown as Record<string, unknown>)["credibilityMetrics"]).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // No factual verification
  // -------------------------------------------------------------------------

  describe("no factual verification", () => {
    it("result does not contain 'factuallyCorrect'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["factuallyCorrect"]).toBeUndefined();
    });

    it("evidence records do not contain 'isVerified'", () => {
      const r = runFull("The system is compliant [1].");
      if (r.ok)
        for (const rec of r.evidenceRecords)
          expect((rec as unknown as Record<string, unknown>)["isVerified"]).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // No materiality assessment
  // -------------------------------------------------------------------------

  describe("no materiality assessment", () => {
    it("result does not contain 'materialityLevel'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["materialityLevel"]).toBeUndefined();
    });

    it("evidence records do not contain materialityLevel", () => {
      const r = runFull("The system is compliant.");
      if (r.ok)
        for (const rec of r.evidenceRecords)
          expect((rec as unknown as Record<string, unknown>)["materialityLevel"]).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // No issue detection
  // -------------------------------------------------------------------------

  describe("no issue detection", () => {
    it("result does not contain 'issues'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["issues"]).toBeUndefined();
    });

    it("evidence records do not reference issue classes", () => {
      const r = runFull("Encryption is mandatory [1].");
      if (r.ok) {
        const json = JSON.stringify(r.evidenceRecords);
        for (const issueClass of ISSUE_CLASSES)
          expect(json).not.toContain(issueClass);
      }
    });

    it("Stage 4 failure errors are DraValidationError (not DraIssue)", () => {
      const r = linkEvidence(null, null, null);
      if (!r.ok)
        for (const err of r.errors) {
          expect(err).toHaveProperty("code");
          expect(err).toHaveProperty("path");
          expect(err).toHaveProperty("message");
          expect(err).not.toHaveProperty("issueClass");
          expect(err).not.toHaveProperty("severity");
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
      for (const decision of ASSURANCE_DECISIONS)
        expect(json).not.toMatch(new RegExp(`"decision"\\s*:\\s*"${decision}"`));
    });

    it("no assurance decision values as top-level keys", () => {
      const r = runFull("The system is compliant.");
      for (const decision of ASSURANCE_DECISIONS)
        expect((r as unknown as Record<string, unknown>)[decision]).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // No confidence scoring
  // -------------------------------------------------------------------------

  describe("no confidence scoring", () => {
    it("result does not contain 'confidenceScore'", () => {
      const r = runFull("The system is compliant.");
      expect((r as unknown as Record<string, unknown>)["confidenceScore"]).toBeUndefined();
    });

    it("evidence records do not contain confidence scores", () => {
      const r = runFull("Encryption is mandatory [1].");
      if (r.ok)
        for (const rec of r.evidenceRecords) {
          expect((rec as unknown as Record<string, unknown>)["confidenceScore"]).toBeUndefined();
          expect((rec as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
        }
    });

    it("linkage record does not contain confidence", () => {
      const r = runFull("The system is compliant.");
      if (r.ok)
        expect((r.linkageRecord as unknown as Record<string, unknown>)["confidence"]).toBeUndefined();
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

    it("linkage record is not a proof receipt", () => {
      const r = runFull("The system is compliant.");
      if (r.ok) {
        const lr = r.linkageRecord as unknown as Record<string, unknown>;
        expect(lr["decision"]).toBeUndefined();
        expect(lr["issueRegister"]).toBeUndefined();
        expect(lr["stageOutputs"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No CTS
  // -------------------------------------------------------------------------

  describe("no CTS imports or references", () => {
    it("result does not contain CTS values", () => {
      const r = runFull("The system is compliant.");
      const json = JSON.stringify(r);
      expect(json).not.toContain("FULLY_COVERED");
      expect(json).not.toContain("PARTIALLY_COVERED");
      expect(json).not.toContain("NOT_COVERED");
    });

    it("STAGE_4_ID does not contain 'CTS'", () => {
      expect(STAGE_4_ID).not.toContain("CTS");
    });
  });

  // -------------------------------------------------------------------------
  // Does not re-segment or modify Stage 2 statements
  // -------------------------------------------------------------------------

  describe("does not re-segment or modify statements", () => {
    it("evidence record statementSpan matches Stage 2 spanRef exactly", () => {
      const content = "Encryption is mandatory [1]. The audit is complete.";
      const req = makeRequest("eb4-2", "db4-2", content);
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

    it("statementId is preserved unchanged", () => {
      const content = "Claim one [1]. Claim two.";
      const req = makeRequest("eb4-3", "db4-3", content);
      const s2 = extractClaims(req);
      const s3 = resolveAuthority(req, s2);
      const s4 = linkEvidence(req, s2, s3);
      if (s2.ok && s4.ok) {
        for (let i = 0; i < s2.statements.length; i++)
          expect(String(s4.evidenceRecords[i]!.statementId)).toBe(String(s2.statements[i]!.id));
      }
    });
  });
});
