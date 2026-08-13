/**
 * DRA-ENG-002 — Invariant Tests
 */

import { describe, it, expect } from "vitest";
import {
  checkIdentifierUniqueness,
  checkStatementReferences,
  checkEvidenceUnitReferences,
  checkStageRecordInvariants,
  checkIssueClassCount,
  checkDecisionCount,
  checkTimestamp,
  checkTimestampOrder,
  checkSchemaVersion,
  checkEvaluationIdentityConsistency,
  checkEvaluationResultInvariants,
} from "../../model/invariants.js";
import { PIPELINE_STAGES } from "../../model/pipeline-stages.js";
import {
  VALID_EVALUATION_RESULT,
  buildValidStageRecords,
} from "../../fixtures/model/valid.js";

describe("DRA-ENG-002 Invariants", () => {
  // ---------------------------------------------------------------------------
  // INV-001: Identifier uniqueness
  // ---------------------------------------------------------------------------
  describe("INV-001 checkIdentifierUniqueness", () => {
    it("passes for unique ids", () => {
      const result = checkIdentifierUniqueness(
        [{ id: "a" }, { id: "b" }, { id: "c" }],
        "items",
      );
      expect(result.ok).toBe(true);
    });

    it("fails for duplicate ids", () => {
      const result = checkIdentifierUniqueness(
        [{ id: "a" }, { id: "b" }, { id: "a" }],
        "items",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_DUPLICATE_IDENTIFIER");
      }
    });

    it("passes for empty array", () => {
      expect(checkIdentifierUniqueness([], "items").ok).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-002: Statement references
  // ---------------------------------------------------------------------------
  describe("INV-002 checkStatementReferences", () => {
    const statements = [
      { id: "stmt-001" },
    ];

    it("passes when all references exist", () => {
      expect(
        checkStatementReferences(["stmt-001"], statements, "issues[0]").ok,
      ).toBe(true);
    });

    it("fails when a reference does not exist", () => {
      const result = checkStatementReferences(
        ["stmt-999"],
        statements,
        "issues[0]",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_UNRESOLVED_REFERENCE");
      }
    });

    it("passes for empty reference array", () => {
      expect(checkStatementReferences([], statements, "path").ok).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-003: Evidence unit references
  // ---------------------------------------------------------------------------
  describe("INV-003 checkEvidenceUnitReferences", () => {
    const units = [
      { id: "ev-001" },
    ];

    it("passes when all references exist", () => {
      expect(
        checkEvidenceUnitReferences(["ev-001"], units, "path").ok,
      ).toBe(true);
    });

    it("fails when reference does not exist", () => {
      const result = checkEvidenceUnitReferences(["ev-999"], units, "path");
      expect(result.ok).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-006: Stage record invariants
  // ---------------------------------------------------------------------------
  describe("INV-006 checkStageRecordInvariants", () => {
    it("passes for valid 7-record array", () => {
      expect(checkStageRecordInvariants(buildValidStageRecords(), "stageRecords").ok).toBe(true);
    });

    it("fails for wrong count (6 records)", () => {
      const sixRecords = buildValidStageRecords().slice(0, 6);
      const result = checkStageRecordInvariants(sixRecords, "stageRecords");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_WRONG_STAGE_COUNT");
      }
    });

    it("fails for wrong count (8 records)", () => {
      const valid = buildValidStageRecords();
      const extra = [...valid, { stageNumber: 8 as never, stageName: "Input Normalisation" as never, output: {} }];
      expect(checkStageRecordInvariants(extra, "stageRecords").ok).toBe(false);
    });

    it("fails when stage number order is violated", () => {
      const records = buildValidStageRecords();
      const swapped = [...records];
      // Swap stage 1 and stage 2
      const tmp = { ...swapped[0]! };
      swapped[0] = { ...swapped[1]!, stageNumber: 1 };
      swapped[1] = { ...tmp, stageNumber: 2 };
      const result = checkStageRecordInvariants(swapped, "stageRecords");
      expect(result.ok).toBe(false);
    });

    it("fails when stage name does not match stage number", () => {
      const records = buildValidStageRecords();
      records[0] = { ...records[0]!, stageName: "Claim Extraction" };
      const result = checkStageRecordInvariants(records, "stageRecords");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.code === "DRA_INVALID_STAGE_NAME")).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // INV-007: Issue class count
  // ---------------------------------------------------------------------------
  describe("INV-007 checkIssueClassCount", () => {
    it("returns ok (exactly 9 issue classes frozen in build)", () => {
      expect(checkIssueClassCount().ok).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-008: Decision count
  // ---------------------------------------------------------------------------
  describe("INV-008 checkDecisionCount", () => {
    it("returns ok (exactly 3 decisions frozen in build)", () => {
      expect(checkDecisionCount().ok).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-009: Timestamp validation
  // ---------------------------------------------------------------------------
  describe("INV-009 checkTimestamp", () => {
    it("passes for valid UTC timestamp", () => {
      expect(checkTimestamp("2026-07-26T09:05:00.000Z", "ts").ok).toBe(true);
    });

    it("fails for timestamp without Z", () => {
      const result = checkTimestamp("2026-07-26T09:05:00", "ts");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_INVALID_TIMESTAMP");
      }
    });

    it("fails for non-date string", () => {
      expect(checkTimestamp("not-a-date", "ts").ok).toBe(false);
    });

    it("fails for offset timestamp (non-UTC)", () => {
      expect(checkTimestamp("2026-07-26T09:05:00+01:00", "ts").ok).toBe(false);
    });
  });

  describe("INV-009 checkTimestampOrder", () => {
    it("passes when before is before after", () => {
      const result = checkTimestampOrder(
        "2026-07-26T09:00:00.000Z",
        "requestedAt",
        "2026-07-26T09:05:00.000Z",
        "completedAt",
      );
      expect(result.ok).toBe(true);
    });

    it("passes when timestamps are equal", () => {
      const result = checkTimestampOrder(
        "2026-07-26T09:00:00.000Z",
        "a",
        "2026-07-26T09:00:00.000Z",
        "b",
      );
      expect(result.ok).toBe(true);
    });

    it("fails when after is before before", () => {
      const result = checkTimestampOrder(
        "2026-07-26T09:05:00.000Z",
        "completedAt",
        "2026-07-26T09:00:00.000Z",
        "requestedAt",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_INCOHERENT_TIMESTAMPS");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // INV-010: Schema version
  // ---------------------------------------------------------------------------
  describe("INV-010 checkSchemaVersion", () => {
    it("passes for recognised version 0.1.0", () => {
      expect(checkSchemaVersion("0.1.0", "schemaVersion").ok).toBe(true);
    });

    it("fails for unrecognised version", () => {
      const result = checkSchemaVersion("9.9.9", "schemaVersion");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_INVALID_SCHEMA_VERSION");
      }
    });

    it("fails for empty string", () => {
      expect(checkSchemaVersion("", "schemaVersion").ok).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-013: Evaluation identity consistency
  // ---------------------------------------------------------------------------
  describe("INV-013 checkEvaluationIdentityConsistency", () => {
    it("passes when all ids match", () => {
      const result = checkEvaluationIdentityConsistency({
        requestId: "req-001",
        resultId: "res-001",
        proofReceiptEvaluationRequestId: "req-001",
        proofReceiptEvaluationResultId: "res-001",
      });
      expect(result.ok).toBe(true);
    });

    it("fails when requestId mismatches", () => {
      const result = checkEvaluationIdentityConsistency({
        requestId: "req-001",
        resultId: "res-001",
        proofReceiptEvaluationRequestId: "req-WRONG",
        proofReceiptEvaluationResultId: "res-001",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors[0]!.code).toBe("DRA_INVARIANT_VIOLATION");
      }
    });

    it("fails when resultId mismatches", () => {
      const result = checkEvaluationIdentityConsistency({
        requestId: "req-001",
        resultId: "res-001",
        proofReceiptEvaluationRequestId: "req-001",
        proofReceiptEvaluationResultId: "res-WRONG",
      });
      expect(result.ok).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Composite: checkEvaluationResultInvariants
  // ---------------------------------------------------------------------------
  describe("checkEvaluationResultInvariants — composite", () => {
    const result = VALID_EVALUATION_RESULT;

    it("passes for the valid evaluation result fixture", () => {
      const check = checkEvaluationResultInvariants({
        statements: result.statements,
        evidenceUnits: result.evidenceUnits,
        issues: result.issues,
        stageRecords: result.stageRecords,
        requestId: result.evaluationRequestId,
        resultId: result.id,
        proofReceiptEvaluationRequestId: result.proofReceipt.evaluationRequestId,
        proofReceiptEvaluationResultId: result.proofReceipt.evaluationResultId,
        schemaVersion: result.schemaVersion,
        completedAt: result.completedAt,
      });
      expect(check.ok).toBe(true);
    });

    it("catches duplicate statement ids", () => {
      const dupStatements = [
        ...result.statements,
        { ...result.statements[0]! },  // duplicate id
      ];
      const check = checkEvaluationResultInvariants({
        statements: dupStatements,
        evidenceUnits: result.evidenceUnits,
        issues: result.issues,
        stageRecords: result.stageRecords,
        requestId: result.evaluationRequestId,
        resultId: result.id,
        proofReceiptEvaluationRequestId: result.proofReceipt.evaluationRequestId,
        proofReceiptEvaluationResultId: result.proofReceipt.evaluationResultId,
        schemaVersion: result.schemaVersion,
        completedAt: result.completedAt,
      });
      expect(check.ok).toBe(false);
    });

    it("catches unrecognised schema version", () => {
      const check = checkEvaluationResultInvariants({
        statements: result.statements,
        evidenceUnits: result.evidenceUnits,
        issues: result.issues,
        stageRecords: result.stageRecords,
        requestId: result.evaluationRequestId,
        resultId: result.id,
        proofReceiptEvaluationRequestId: result.proofReceipt.evaluationRequestId,
        proofReceiptEvaluationResultId: result.proofReceipt.evaluationResultId,
        schemaVersion: "9.9.9",
        completedAt: result.completedAt,
      });
      expect(check.ok).toBe(false);
    });
  });
});
