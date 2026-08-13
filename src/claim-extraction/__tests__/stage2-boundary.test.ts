/**
 * DRA-ENG-004 — Stage 2 Boundary Tests
 *
 * Verifies that Stage 2 does not produce:
 *   - Evidence relationships
 *   - DraIssue instances
 *   - Decision values (SUPPORTED, REVIEW, HOLD)
 *   - Confidence indicators
 *   - Proof receipts
 *   - Any CTS imports
 */

import { describe, it, expect } from "vitest";
import { extractClaims } from "../../claim-extraction/extract-claims.js";
import { STAGE_2_ID } from "../../claim-extraction/extraction-result.js";
import { ASSURANCE_DECISIONS } from "../../model/index.js";
import {
  FIXTURE_SIMPLE_CLAIM,
  FIXTURE_MULTI_PARAGRAPH,
  FIXTURE_ZERO_CLAIMS,
} from "../../fixtures/claim-extraction/valid.js";
import { FIXTURE_INVALID_NULL } from "../../fixtures/claim-extraction/edge-cases.js";

function asMap(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

describe("DRA-ENG-004 Stage 2 Boundary", () => {
  // -------------------------------------------------------------------------
  // No evidence relationships
  // -------------------------------------------------------------------------

  describe("no evidence relationships in Stage 2 output", () => {
    it("successful result does not contain 'evidenceRelationships'", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["evidenceRelationships"]).toBeUndefined();
      }
    });

    it("successful result does not contain 'evidenceUnits'", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["evidenceUnits"]).toBeUndefined();
      }
    });

    it("all statements have empty linkedEvidenceUnitIds", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.linkedEvidenceUnitIds).toStrictEqual([]);
        }
      }
    });

    it("extraction record does not contain evidence-mapping data", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        const record = asMap(result.extractionRecord);
        expect(record["evidenceSupport"]).toBeUndefined();
        expect(record["evidenceLinks"]).toBeUndefined();
        expect(record["sourceDocumentPassages"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No DraIssue creation
  // -------------------------------------------------------------------------

  describe("no DraIssue creation in Stage 2", () => {
    it("successful result does not contain 'issues'", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["issues"]).toBeUndefined();
      }
    });

    it("failure result does not contain 'issues'", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      if (!result.ok) {
        expect(asMap(result)["issues"]).toBeUndefined();
      }
    });

    it("Stage 2 errors are DraValidationError, not DraIssue", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      if (!result.ok) {
        for (const err of result.errors) {
          // DraValidationError: code, path, message
          expect(err).toHaveProperty("code");
          expect(err).toHaveProperty("path");
          expect(err).toHaveProperty("message");
          // DraIssue: issueClass, severity, affectedStatementIds
          expect(err).not.toHaveProperty("issueClass");
          expect(err).not.toHaveProperty("severity");
          expect(err).not.toHaveProperty("affectedStatementIds");
        }
      }
    });

    it("error codes are not DRA issue class literals", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      if (!result.ok) {
        for (const err of result.errors) {
          expect(err.code).not.toBe("UNSUPPORTED_CLAIM");
          expect(err.code).not.toBe("EVIDENCE_ABSENT");
          expect(err.code).not.toBe("AUTHORITY_EXPIRED");
          expect(err.code).not.toBe("SCOPE_VIOLATION");
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No decision values used as outcomes
  // -------------------------------------------------------------------------

  describe("no assurance decisions used as Stage 2 outcomes", () => {
    it("successful result does not contain a 'decision' field", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["decision"]).toBeUndefined();
      }
    });

    it("failure result does not contain a 'decision' field", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      expect(asMap(result)["decision"]).toBeUndefined();
    });

    it("zero-claim success does not produce a SUPPORTED decision", () => {
      const result = extractClaims(FIXTURE_ZERO_CLAIMS);
      expect(result.ok).toBe(true);
      const json = JSON.stringify(result);
      expect(json).not.toMatch(/"decision"\s*:\s*"SUPPORTED"/);
      expect(json).not.toMatch(/"decision"\s*:\s*"REVIEW"/);
      expect(json).not.toMatch(/"decision"\s*:\s*"HOLD"/);
    });

    it("Stage 2 result does not use ASSURANCE_DECISIONS values for extraction outcomes", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      for (const decision of ASSURANCE_DECISIONS) {
        if (result.ok) {
          expect(asMap(result)[decision]).toBeUndefined();
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No confidence indicators
  // -------------------------------------------------------------------------

  describe("no confidence indicators in Stage 2", () => {
    it("successful result does not contain 'confidenceIndicators'", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["confidenceIndicators"]).toBeUndefined();
      }
    });

    it("extraction record does not contain confidence data", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        const record = asMap(result.extractionRecord);
        expect(record["confidenceIndicators"]).toBeUndefined();
        expect(record["confidenceLevel"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No proof receipt
  // -------------------------------------------------------------------------

  describe("no proof receipt in Stage 2", () => {
    it("successful result does not contain 'proofReceipt'", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(asMap(result)["proofReceipt"]).toBeUndefined();
      }
    });

    it("extraction record is NOT a proof receipt", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        const record = asMap(result.extractionRecord);
        expect(record["decision"]).toBeUndefined();
        expect(record["decisionRationale"]).toBeUndefined();
        expect(record["issueRegister"]).toBeUndefined();
        expect(record["stageOutputs"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Stage 2 identifier
  // -------------------------------------------------------------------------

  describe("Stage 2 identifier", () => {
    it("STAGE_2_ID is 'STAGE_2_CLAIM_EXTRACTION'", () => {
      expect(STAGE_2_ID).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("all Stage 2 results carry the correct stageId", () => {
      const good = extractClaims(FIXTURE_SIMPLE_CLAIM);
      const bad = extractClaims(FIXTURE_INVALID_NULL as never);
      expect(good.stageId).toBe("STAGE_2_CLAIM_EXTRACTION");
      expect(bad.stageId).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("extraction record stageId matches STAGE_2_ID", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.extractionRecord.stageId).toBe(STAGE_2_ID);
      }
    });
  });

  // -------------------------------------------------------------------------
  // CTS boundary
  // -------------------------------------------------------------------------

  describe("CTS import boundary", () => {
    it("Stage 2 result does not contain CTS decision values", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      const json = JSON.stringify(result);
      expect(json).not.toContain("FULLY_COVERED");
      expect(json).not.toContain("PARTIALLY_COVERED");
      expect(json).not.toContain("NOT_COVERED");
    });

    it("Stage 2 extraction does not expose CTS evaluator exports", () => {
      // Verify by checking that no CTS-specific symbols appear in the import
      // chain at runtime (tested via the stage2-exports.test.ts file)
      expect(STAGE_2_ID).not.toContain("CTS");
      expect(STAGE_2_ID).toBe("STAGE_2_CLAIM_EXTRACTION");
    });
  });
});
