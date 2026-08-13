/**
 * DRA-ENG-002 — Proof Receipt Tests
 */

import { describe, it, expect } from "vitest";
import {
  DocumentIdentitySchema,
  EvaluatorIdentitySchema,
  StageRecordSchema,
  ProofReceiptSchema,
  validateProofReceipt,
} from "../../model/proof-receipts.js";
import { PIPELINE_STAGE_COUNT } from "../../model/pipeline-stages.js";
import {
  VALID_PROOF_RECEIPT,
  buildValidStageRecords,
  T_COMPLETED,
} from "../../fixtures/model/valid.js";
import {
  INVALID_PROOF_RECEIPT_WRONG_STAGE_COUNT,
  INVALID_PROOF_RECEIPT_BAD_DECISION,
  INVALID_PROOF_RECEIPT_EMPTY_RATIONALE,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Proof Receipts", () => {
  describe("DocumentIdentitySchema", () => {
    it("accepts a valid document identity", () => {
      const result = DocumentIdentitySchema.safeParse({
        generatedDocumentId: "gen-001",
        generatedDocumentTitle: "Test Document",
        evaluatedAt: T_COMPLETED,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = DocumentIdentitySchema.safeParse({
        generatedDocumentId: "gen-001",
        generatedDocumentTitle: "",
        evaluatedAt: T_COMPLETED,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid timestamp", () => {
      const result = DocumentIdentitySchema.safeParse({
        generatedDocumentId: "gen-001",
        generatedDocumentTitle: "Test",
        evaluatedAt: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("contentHash is optional", () => {
      const result = DocumentIdentitySchema.safeParse({
        generatedDocumentId: "gen-001",
        generatedDocumentTitle: "Test",
        evaluatedAt: T_COMPLETED,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentHash).toBeUndefined();
      }
    });
  });

  describe("EvaluatorIdentitySchema", () => {
    it("accepts valid evaluator identity", () => {
      const result = EvaluatorIdentitySchema.safeParse({
        evaluatorVersion: "0.1.0",
        pipelineVersion: "1.0",
      });
      expect(result.success).toBe(true);
    });

    it("rejects unsupported evaluator version", () => {
      const result = EvaluatorIdentitySchema.safeParse({
        evaluatorVersion: "9.9.9",
        pipelineVersion: "1.0",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty pipelineVersion", () => {
      const result = EvaluatorIdentitySchema.safeParse({
        evaluatorVersion: "0.1.0",
        pipelineVersion: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StageRecordSchema", () => {
    it("accepts a valid stage record", () => {
      const result = StageRecordSchema.safeParse({
        stageNumber: 1,
        stageName: "Input Normalisation",
        output: { status: "OK" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects stage number 0", () => {
      const result = StageRecordSchema.safeParse({
        stageNumber: 0,
        stageName: "Input Normalisation",
        output: {},
      });
      expect(result.success).toBe(false);
    });

    it("rejects stage number 8", () => {
      const result = StageRecordSchema.safeParse({
        stageNumber: 8,
        stageName: "Input Normalisation",
        output: {},
      });
      expect(result.success).toBe(false);
    });

    it("rejects unknown stage name", () => {
      const result = StageRecordSchema.safeParse({
        stageNumber: 1,
        stageName: "Unknown Stage",
        output: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe("buildValidStageRecords", () => {
    it("returns exactly 7 records", () => {
      const records = buildValidStageRecords();
      expect(records).toHaveLength(PIPELINE_STAGE_COUNT);
    });

    it("stage numbers are 1–7 in order", () => {
      const records = buildValidStageRecords();
      for (let i = 0; i < records.length; i++) {
        expect(records[i]!.stageNumber).toBe(i + 1);
      }
    });

    it("each stage record validates against StageRecordSchema", () => {
      for (const record of buildValidStageRecords()) {
        expect(StageRecordSchema.safeParse(record).success).toBe(true);
      }
    });
  });

  describe("ProofReceipt — valid fixture", () => {
    it("validates the valid fixture", () => {
      const result = validateProofReceipt(VALID_PROOF_RECEIPT);
      expect(result.success).toBe(true);
    });

    it("parsed receipt has correct id", () => {
      const result = ProofReceiptSchema.safeParse(VALID_PROOF_RECEIPT);
      expect(result.success && result.data.id).toBe("receipt-001");
    });

    it("parsed receipt decision is SUPPORTED", () => {
      const result = ProofReceiptSchema.safeParse(VALID_PROOF_RECEIPT);
      expect(result.success && result.data.decision).toBe("SUPPORTED");
    });

    it("parsed receipt has 7 stage outputs", () => {
      const result = ProofReceiptSchema.safeParse(VALID_PROOF_RECEIPT);
      if (result.success) {
        expect(result.data.stageOutputs).toHaveLength(PIPELINE_STAGE_COUNT);
      }
    });
  });

  describe("ProofReceipt — invalid fixtures", () => {
    it("rejects wrong stage count", () => {
      expect(validateProofReceipt(INVALID_PROOF_RECEIPT_WRONG_STAGE_COUNT).success).toBe(false);
    });

    it("rejects invalid decision", () => {
      expect(validateProofReceipt(INVALID_PROOF_RECEIPT_BAD_DECISION).success).toBe(false);
    });

    it("rejects empty decision rationale", () => {
      expect(validateProofReceipt(INVALID_PROOF_RECEIPT_EMPTY_RATIONALE).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateProofReceipt(null).success).toBe(false);
    });
  });
});
