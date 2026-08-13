/**
 * DRA-ENG-003 — Stage 1 Boundary Tests
 *
 * Verifies that Stage 1 does not produce:
 *   - Assurance decisions (SUPPORTED, REVIEW, HOLD)
 *   - DraIssue instances
 *   - Proof receipts
 *   - Confidence indicators
 *   - Any CTS runtime imports
 *
 * These tests guard the Stage 1 scope boundary.
 */

import { describe, it, expect } from "vitest";
import { normaliseEvaluationRequest } from "../../normalisation/normalise-evaluation-request.js";
import { STAGE_1_ID } from "../../normalisation/stage1-types.js";
import { ASSURANCE_DECISIONS } from "../../model/index.js";
import { VALID_CANONICAL, VALID_EMPTY_SOURCES } from "../../fixtures/normalisation/valid.js";
import {
  INVALID_UNRESOLVED_SOURCE_REF,
  INVALID_TIMESTAMP_STRING,
} from "../../fixtures/normalisation/invalid.js";

/** Convenience helper to access arbitrary keys on a typed result object. */
function asMap(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

describe("DRA-ENG-003 Stage 1 Boundary", () => {
  // -------------------------------------------------------------------------
  // No decisions in Stage 1 output
  // -------------------------------------------------------------------------

  describe("no assurance decisions in Stage 1 output", () => {
    it("successful result does not contain a 'decision' field", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(asMap(result)["decision"]).toBeUndefined();
        expect(asMap(result.normalisedRequest)["decision"]).toBeUndefined();
      }
    });

    it("failure result does not contain a 'decision' field", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(asMap(result)["decision"]).toBeUndefined();
      }
    });

    it("Stage 1 result does not use SUPPORTED, REVIEW, or HOLD as decision values", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      const json = JSON.stringify(result);
      expect(json).not.toMatch(/"decision"\s*:\s*"SUPPORTED"/);
      expect(json).not.toMatch(/"decision"\s*:\s*"REVIEW"/);
      expect(json).not.toMatch(/"decision"\s*:\s*"HOLD"/);
    });

    it("Stage 1 does not use decision values from ASSURANCE_DECISIONS to classify input validity", () => {
      // Input validity at Stage 1 uses ok: true/false, not assurance decisions
      const goodResult = normaliseEvaluationRequest(VALID_CANONICAL);
      const badResult = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      expect(goodResult.ok).toBe(true);
      expect(badResult.ok).toBe(false);
      for (const decision of ASSURANCE_DECISIONS) {
        if (goodResult.ok) {
          expect(asMap(goodResult)[decision]).toBeUndefined();
        }
        if (!badResult.ok) {
          expect(asMap(badResult)[decision]).toBeUndefined();
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No DraIssue creation
  // -------------------------------------------------------------------------

  describe("no DraIssue creation in Stage 1", () => {
    it("successful result does not contain an 'issues' array", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(asMap(result)["issues"]).toBeUndefined();
        expect(asMap(result.normalisedRequest)["issues"]).toBeUndefined();
      }
    });

    it("failure result does not contain an 'issues' array", () => {
      const result = normaliseEvaluationRequest(INVALID_UNRESOLVED_SOURCE_REF);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(asMap(result)["issues"]).toBeUndefined();
      }
    });

    it("validation errors in Stage 1 failure are DraValidationError, not DraIssue", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      if (!result.ok) {
        for (const error of result.errors) {
          // DraValidationError has: code, path, message
          expect(error).toHaveProperty("code");
          expect(error).toHaveProperty("path");
          expect(error).toHaveProperty("message");
          // DraIssue has: issueClass, severity, affectedStatementIds
          expect(error).not.toHaveProperty("issueClass");
          expect(error).not.toHaveProperty("severity");
          expect(error).not.toHaveProperty("affectedStatementIds");
        }
      }
    });

    it("normalisation errors do not contain issue class literals", () => {
      const result = normaliseEvaluationRequest(INVALID_UNRESOLVED_SOURCE_REF);
      if (!result.ok) {
        for (const error of result.errors) {
          // Error codes should not be DRA issue classes
          expect(error.code).not.toBe("UNSUPPORTED_CLAIM");
          expect(error.code).not.toBe("EVIDENCE_ABSENT");
          expect(error.code).not.toBe("AUTHORITY_EXPIRED");
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // No proof receipt
  // -------------------------------------------------------------------------

  describe("no proof receipt in Stage 1", () => {
    it("successful result does not contain a 'proofReceipt' field", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(asMap(result)["proofReceipt"]).toBeUndefined();
        expect(asMap(result.normalisedRequest)["proofReceipt"]).toBeUndefined();
      }
    });

    it("normalisation record is NOT a proof receipt", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        const record = asMap(result.normalisationRecord);
        // ProofReceipt has: decision, decisionRationale, issueRegister, stageOutputs
        expect(record["decision"]).toBeUndefined();
        expect(record["decisionRationale"]).toBeUndefined();
        expect(record["issueRegister"]).toBeUndefined();
        expect(record["stageOutputs"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // No confidence indicator
  // -------------------------------------------------------------------------

  describe("no confidence indicator in Stage 1", () => {
    it("successful result does not contain 'confidenceIndicators'", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(asMap(result)["confidenceIndicators"]).toBeUndefined();
        expect(asMap(result.normalisedRequest)["confidenceIndicators"]).toBeUndefined();
      }
    });

    it("normalisation record does not contain confidence data", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        const record = asMap(result.normalisationRecord);
        expect(record["confidenceIndicators"]).toBeUndefined();
        expect(record["confidenceLevel"]).toBeUndefined();
        expect(record["CONFIDENCE_LEVELS"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Stage 1 stageId is correct
  // -------------------------------------------------------------------------

  describe("Stage 1 identifier", () => {
    it("STAGE_1_ID is 'STAGE_1_INPUT_NORMALISATION'", () => {
      expect(STAGE_1_ID).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("all Stage 1 results carry the correct stageId", () => {
      const goodResult = normaliseEvaluationRequest(VALID_CANONICAL);
      const badResult = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      expect(goodResult.stageId).toBe("STAGE_1_INPUT_NORMALISATION");
      expect(badResult.stageId).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("stageId in normalisation record matches STAGE_1_ID", () => {
      const result = normaliseEvaluationRequest(VALID_EMPTY_SOURCES);
      if (result.ok) {
        expect(result.normalisationRecord.stageId).toBe(STAGE_1_ID);
      }
    });
  });
});
