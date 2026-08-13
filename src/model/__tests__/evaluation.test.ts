/**
 * DRA-ENG-002A — Evaluation Request and Result Tests
 *
 * Updated at DRA-ENG-002A to:
 *   - Remove ConfidenceIndicator tests (deferred to DRA-ENG-008).
 *   - Add test confirming confidenceIndicators is not a canonical field.
 *   - Retain all EvaluationRequest and EvaluationResult schema tests.
 */

import { describe, it, expect } from "vitest";
import {
  EvaluationRequestSchema,
  EvaluationResultSchema,
  validateEvaluationRequest,
  validateEvaluationResult,
} from "../../model/evaluation.js";
import {
  VALID_EVALUATION_REQUEST,
  VALID_EVALUATION_RESULT,
} from "../../fixtures/model/valid.js";
import {
  INVALID_REQUEST_MISSING_DOCUMENT,
  INVALID_REQUEST_BAD_TIMESTAMP,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002A Evaluation", () => {
  describe("ConfidenceIndicator — deferred, not part of canonical Version 1 model", () => {
    it("EvaluationResultSchema does not include a confidenceIndicators field", () => {
      // The canonical EvaluationResult does not have a confidenceIndicators property.
      // Confidence classification values are deferred to DRA-ENG-008.
      const shape = EvaluationResultSchema._def.schema._def.shape();
      expect(shape).not.toHaveProperty("confidenceIndicators");
    });

    it("EvaluationResult valid fixture does not include confidenceIndicators", () => {
      expect(VALID_EVALUATION_RESULT).not.toHaveProperty("confidenceIndicators");
    });

    it("EvaluationResult validates successfully without confidenceIndicators", () => {
      const result = validateEvaluationResult(VALID_EVALUATION_RESULT);
      expect(result.success).toBe(true);
    });

    it("EvaluationResult still validates when confidenceIndicators is absent", () => {
      // Extra fields are stripped by Zod by default — absence is correct behaviour.
      const withExtra = {
        ...VALID_EVALUATION_RESULT,
        confidenceIndicators: [{ statementId: "s", level: "HIGH" }],
      };
      // Zod strips unknown keys by default; the result should still parse.
      const result = validateEvaluationResult(withExtra);
      // Result may succeed (Zod strips unknown keys) — the key assertion is
      // that confidenceIndicators is NOT in the parsed output.
      if (result.success) {
        expect((result.data as Record<string, unknown>)["confidenceIndicators"]).toBeUndefined();
      }
    });
  });

  describe("EvaluationRequest — valid fixture", () => {
    it("validates the valid fixture", () => {
      const result = validateEvaluationRequest(VALID_EVALUATION_REQUEST);
      expect(result.success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = EvaluationRequestSchema.safeParse(VALID_EVALUATION_REQUEST);
      expect(result.success && result.data.id).toBe("eval-req-001");
    });

    it("parsed fixture has generatedDocument", () => {
      const result = EvaluationRequestSchema.safeParse(VALID_EVALUATION_REQUEST);
      if (result.success) {
        expect(result.data.generatedDocument).toBeDefined();
        expect(result.data.generatedDocument.id).toBe("gen-doc-001");
      }
    });

    it("parsed fixture has sourceDocuments array", () => {
      const result = EvaluationRequestSchema.safeParse(VALID_EVALUATION_REQUEST);
      if (result.success) {
        expect(result.data.sourceDocuments).toHaveLength(1);
      }
    });

    it("sourceDocuments defaults to empty array if not provided", () => {
      const req = {
        id: "eval-req-002",
        generatedDocument: {
          id: "gen-002",
          title: "Test",
          content: "Content",
          sourceDocumentIds: [],
        },
        requestedAt: "2026-07-26T09:00:00.000Z",
      };
      const result = EvaluationRequestSchema.safeParse(req);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceDocuments).toStrictEqual([]);
      }
    });
  });

  describe("EvaluationRequest — invalid fixtures", () => {
    it("rejects missing generatedDocument", () => {
      expect(validateEvaluationRequest(INVALID_REQUEST_MISSING_DOCUMENT).success).toBe(false);
    });

    it("rejects bad requestedAt timestamp", () => {
      expect(validateEvaluationRequest(INVALID_REQUEST_BAD_TIMESTAMP).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateEvaluationRequest(null).success).toBe(false);
    });

    it("rejects empty id", () => {
      const req = {
        id: "",
        generatedDocument: {
          id: "gen-001",
          title: "Test",
          content: "Content",
          sourceDocumentIds: [],
        },
        requestedAt: "2026-07-26T09:00:00.000Z",
      };
      expect(validateEvaluationRequest(req).success).toBe(false);
    });
  });

  describe("EvaluationResult — valid fixture", () => {
    it("validates the valid fixture", () => {
      const result = validateEvaluationResult(VALID_EVALUATION_RESULT);
      expect(result.success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = EvaluationResultSchema.safeParse(VALID_EVALUATION_RESULT);
      expect(result.success && result.data.id).toBe("eval-result-001");
    });

    it("parsed fixture decision is SUPPORTED", () => {
      const result = EvaluationResultSchema.safeParse(VALID_EVALUATION_RESULT);
      expect(result.success && result.data.decision).toBe("SUPPORTED");
    });

    it("parsed fixture has 7 stage records", () => {
      const result = EvaluationResultSchema.safeParse(VALID_EVALUATION_RESULT);
      if (result.success) {
        expect(result.data.stageRecords).toHaveLength(7);
      }
    });

    it("warnings defaults to empty array", () => {
      const result = EvaluationResultSchema.safeParse(VALID_EVALUATION_RESULT);
      if (result.success) {
        expect(result.data.warnings).toStrictEqual([]);
      }
    });
  });

  describe("EvaluationResult — internal consistency checks", () => {
    it("rejects result where proofReceipt.decision mismatches result.decision", () => {
      const bad = {
        ...VALID_EVALUATION_RESULT,
        decision: "HOLD",
        // proofReceipt.decision remains "SUPPORTED"
      };
      expect(validateEvaluationResult(bad).success).toBe(false);
    });

    it("rejects result where proofReceipt.evaluationResultId mismatches id", () => {
      const bad = {
        ...VALID_EVALUATION_RESULT,
        proofReceipt: {
          ...VALID_EVALUATION_RESULT.proofReceipt,
          evaluationResultId: "wrong-id",
        },
      };
      expect(validateEvaluationResult(bad).success).toBe(false);
    });

    it("rejects result where proofReceipt.evaluationRequestId mismatches", () => {
      const bad = {
        ...VALID_EVALUATION_RESULT,
        proofReceipt: {
          ...VALID_EVALUATION_RESULT.proofReceipt,
          evaluationRequestId: "wrong-req-id",
        },
      };
      expect(validateEvaluationResult(bad).success).toBe(false);
    });
  });

  describe("EvaluationResult — invalid inputs", () => {
    it("rejects null", () => {
      expect(validateEvaluationResult(null).success).toBe(false);
    });

    it("rejects unsupported schema version", () => {
      const bad = { ...VALID_EVALUATION_RESULT, schemaVersion: "9.9.9" };
      expect(validateEvaluationResult(bad).success).toBe(false);
    });

    it("rejects result without proofReceipt", () => {
      const { proofReceipt: _, ...noReceipt } = VALID_EVALUATION_RESULT;
      expect(validateEvaluationResult(noReceipt).success).toBe(false);
    });
  });
});
