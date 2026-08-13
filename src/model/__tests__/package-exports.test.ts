/**
 * DRA-ENG-002A — Package Exports Tests
 *
 * Updated at DRA-ENG-002A to:
 *   - Add tests verifying IssueClassCodeSchema and related exports are present.
 *   - Add tests verifying ConfidenceIndicator, ConfidenceLevelSchema, and
 *     CONFIDENCE_LEVELS are NOT exported from the canonical surface.
 *   - Remove ConfidenceIndicatorSchema and ConfidenceLevelSchema from
 *     the expected-schemas list.
 */

import { describe, it, expect } from "vitest";

// Import from the model index (canonical surface)
import * as ModelIndex from "../../model/index.js";

// Import from the package root (top-level index)
import * as PackageRoot from "../../index.js";

describe("DRA-ENG-002A Package Exports", () => {
  describe("model/index.ts exports — canonical constants", () => {
    it("exports ASSURANCE_DECISIONS", () => {
      expect(ModelIndex.ASSURANCE_DECISIONS).toBeDefined();
      expect(Array.isArray(ModelIndex.ASSURANCE_DECISIONS)).toBe(true);
    });

    it("exports ISSUE_CLASSES", () => {
      expect(ModelIndex.ISSUE_CLASSES).toBeDefined();
      expect(Array.isArray(ModelIndex.ISSUE_CLASSES)).toBe(true);
    });

    it("exports ISSUE_CLASS_CODE_VALUES", () => {
      expect(ModelIndex.ISSUE_CLASS_CODE_VALUES).toBeDefined();
      expect(Array.isArray(ModelIndex.ISSUE_CLASS_CODE_VALUES)).toBe(true);
    });

    it("exports PIPELINE_STAGES", () => {
      expect(ModelIndex.PIPELINE_STAGES).toBeDefined();
      expect(Array.isArray(ModelIndex.PIPELINE_STAGES)).toBe(true);
    });

    it("exports PIPELINE_STAGE_COUNT", () => {
      expect(ModelIndex.PIPELINE_STAGE_COUNT).toBe(7);
    });

    it("exports DRA_MODEL_VERSION", () => {
      expect(ModelIndex.DRA_MODEL_VERSION).toBe("0.1.0");
    });

    it("exports DRA_PIPELINE_VERSION", () => {
      expect(ModelIndex.DRA_PIPELINE_VERSION).toBe("1.0");
    });

    it("exports ISSUE_CLASS_CODES", () => {
      expect(ModelIndex.ISSUE_CLASS_CODES).toBeDefined();
    });

    it("exports ISSUE_CLASS_TO_CODE", () => {
      expect(ModelIndex.ISSUE_CLASS_TO_CODE).toBeDefined();
    });

    it("exports DRA_ERROR_CODES", () => {
      expect(ModelIndex.DRA_ERROR_CODES).toBeDefined();
    });

    it("exports VALIDATION_OK", () => {
      expect(ModelIndex.VALIDATION_OK).toStrictEqual({ ok: true });
    });

    it("exports ISSUE_SEVERITIES", () => {
      expect(ModelIndex.ISSUE_SEVERITIES).toBeDefined();
    });

    it("exports EVIDENCE_RELATIONSHIP_TYPES", () => {
      expect(ModelIndex.EVIDENCE_RELATIONSHIP_TYPES).toBeDefined();
    });

    it("exports SOURCE_DOCUMENT_FORMATS", () => {
      expect(ModelIndex.SOURCE_DOCUMENT_FORMATS).toBeDefined();
    });

    it("exports MATERIALITY_LEVELS", () => {
      expect(ModelIndex.MATERIALITY_LEVELS).toBeDefined();
    });

    it("exports RECOGNISED_SCHEMA_VERSIONS", () => {
      expect(ModelIndex.RECOGNISED_SCHEMA_VERSIONS).toBeDefined();
    });

    it("exports PIPELINE_STAGE_METADATA", () => {
      expect(ModelIndex.PIPELINE_STAGE_METADATA).toBeDefined();
    });

    it("exports DEFAULT_EVALUATOR_PIPELINE_VERSION", () => {
      expect(ModelIndex.DEFAULT_EVALUATOR_PIPELINE_VERSION).toBeDefined();
    });
  });

  describe("model/index.ts exports — Zod schemas", () => {
    const EXPECTED_SCHEMAS = [
      "AssuranceDecisionSchema",
      "DraIssueClassSchema",
      "IssueClassCodeSchema",           // added at DRA-ENG-002A
      "PipelineStageNameSchema",
      "PipelineStageNumberSchema",
      "SchemaVersionSchema",
      "SourceDocumentSchema",
      "GeneratedDocumentSchema",
      "MaterialStatementSchema",
      "SpanReferenceSchema",
      "EvidenceUnitSchema",
      "EvidenceRelationshipSchema",
      "EvidenceRelationshipTypeSchema",
      "DraIssueSchema",
      "IssueSeveritySchema",
      "IssueSummarySchema",
      "StageRecordSchema",
      "ProofReceiptSchema",
      "DocumentIdentitySchema",
      "EvaluatorIdentitySchema",
      "EvaluationRequestSchema",
      "EvaluationResultSchema",
      "DraValidationErrorSchema",
    ] as const;

    for (const schemaName of EXPECTED_SCHEMAS) {
      it(`exports ${schemaName}`, () => {
        expect(
          (ModelIndex as Record<string, unknown>)[schemaName],
        ).toBeDefined();
      });
    }
  });

  describe("model/index.ts does NOT export deferred confidence types", () => {
    it("does not export CONFIDENCE_LEVELS (deferred to DRA-ENG-008)", () => {
      expect((ModelIndex as Record<string, unknown>)["CONFIDENCE_LEVELS"]).toBeUndefined();
    });

    it("does not export ConfidenceLevelSchema (deferred to DRA-ENG-008)", () => {
      expect((ModelIndex as Record<string, unknown>)["ConfidenceLevelSchema"]).toBeUndefined();
    });

    it("does not export ConfidenceIndicatorSchema (deferred to DRA-ENG-008)", () => {
      expect((ModelIndex as Record<string, unknown>)["ConfidenceIndicatorSchema"]).toBeUndefined();
    });

    it("does not export ConfidenceLevel type sentinel", () => {
      // Types are compile-time only; this verifies no runtime value is leaked.
      expect((ModelIndex as Record<string, unknown>)["ConfidenceLevel"]).toBeUndefined();
    });

    it("does not export ConfidenceIndicator type sentinel", () => {
      expect((ModelIndex as Record<string, unknown>)["ConfidenceIndicator"]).toBeUndefined();
    });
  });

  describe("model/index.ts exports — issue class distinction helpers", () => {
    it("exports isDraIssueClass", () => {
      expect(typeof ModelIndex.isDraIssueClass).toBe("function");
    });

    it("exports isIssueClassCode", () => {
      expect(typeof ModelIndex.isIssueClassCode).toBe("function");
    });

    it("exports getIssueClassCode", () => {
      expect(typeof ModelIndex.getIssueClassCode).toBe("function");
    });

    it("exports getIssueClassFromCode", () => {
      expect(typeof ModelIndex.getIssueClassFromCode).toBe("function");
    });
  });

  describe("model/index.ts exports — identifier schemas", () => {
    const EXPECTED_ID_SCHEMAS = [
      "EvaluationIdSchema",
      "SourceDocumentIdSchema",
      "GeneratedDocumentIdSchema",
      "StatementIdSchema",
      "EvidenceUnitIdSchema",
      "IssueIdSchema",
      "ProofReceiptIdSchema",
      "EvaluationResultIdSchema",
      "EvidenceRelationshipIdSchema",
    ] as const;

    for (const schemaName of EXPECTED_ID_SCHEMAS) {
      it(`exports ${schemaName}`, () => {
        expect(
          (ModelIndex as Record<string, unknown>)[schemaName],
        ).toBeDefined();
      });
    }
  });

  describe("model/index.ts exports — invariant functions", () => {
    const INVARIANT_FUNCTIONS = [
      "checkIdentifierUniqueness",
      "checkStatementReferences",
      "checkEvidenceUnitReferences",
      "checkIssueReferences",
      "checkStageRecordInvariants",
      "checkIssueClassCount",
      "checkDecisionCount",
      "checkTimestamp",
      "checkTimestampOrder",
      "checkSchemaVersion",
      "checkEvaluationIdentityConsistency",
      "checkEvaluationResultInvariants",
    ] as const;

    for (const fn of INVARIANT_FUNCTIONS) {
      it(`exports invariant function ${fn}`, () => {
        expect(typeof (ModelIndex as Record<string, unknown>)[fn]).toBe("function");
      });
    }
  });

  describe("model/index.ts exports — validation helpers", () => {
    it("exports validateSourceDocument", () => {
      expect(typeof ModelIndex.validateSourceDocument).toBe("function");
    });

    it("exports validateGeneratedDocument", () => {
      expect(typeof ModelIndex.validateGeneratedDocument).toBe("function");
    });

    it("exports validateEvaluationRequest", () => {
      expect(typeof ModelIndex.validateEvaluationRequest).toBe("function");
    });

    it("exports validateEvaluationResult", () => {
      expect(typeof ModelIndex.validateEvaluationResult).toBe("function");
    });

    it("exports validateProofReceipt", () => {
      expect(typeof ModelIndex.validateProofReceipt).toBe("function");
    });
  });

  describe("no evaluator behaviour exposed", () => {
    it("does not export a function that returns an assurance decision from content", () => {
      expect((ModelIndex as Record<string, unknown>)["evaluateDocument"]).toBeUndefined();
    });

    it("does not export a function named 'evaluate'", () => {
      expect((ModelIndex as Record<string, unknown>)["evaluate"]).toBeUndefined();
    });

    it("does not export pipeline stage execution functions", () => {
      const pipelineFunctions = [
        "executeStage1",
        "executeStage2",
        "runNormalisation",
        "runClaimExtraction",
        "runPipeline",
      ];
      for (const fn of pipelineFunctions) {
        expect((ModelIndex as Record<string, unknown>)[fn]).toBeUndefined();
      }
    });
  });

  describe("canonical decisions — exactly three", () => {
    it("ASSURANCE_DECISIONS has exactly 3 values", () => {
      expect(ModelIndex.ASSURANCE_DECISIONS).toHaveLength(3);
    });

    it("contains SUPPORTED", () => {
      expect(ModelIndex.ASSURANCE_DECISIONS).toContain("SUPPORTED");
    });

    it("contains REVIEW", () => {
      expect(ModelIndex.ASSURANCE_DECISIONS).toContain("REVIEW");
    });

    it("contains HOLD", () => {
      expect(ModelIndex.ASSURANCE_DECISIONS).toContain("HOLD");
    });
  });

  describe("package root index still exports scaffold constants", () => {
    it("exports DRA_VERSION", () => {
      expect(PackageRoot.DRA_VERSION).toBe("0.1.0");
    });

    it("exports DRA_PROGRAMME", () => {
      expect(PackageRoot.DRA_PROGRAMME).toBe("DRA-001");
    });

    it("exports model surface via re-export", () => {
      expect(PackageRoot.ASSURANCE_DECISIONS).toBeDefined();
      expect(PackageRoot.ISSUE_CLASSES).toBeDefined();
      expect(PackageRoot.PIPELINE_STAGES).toBeDefined();
    });

    it("exports confidence scoring surface via package root (DRA-ENG-010)", () => {
      // CONFIDENCE_LEVELS is now exported since DRA-ENG-010 implemented the full pipeline.
      expect((PackageRoot as Record<string, unknown>)["CONFIDENCE_LEVELS"]).toBeDefined();
      // ConfidenceIndicatorSchema is not part of DRA; the canonical type is ConfidenceLevel.
      expect((PackageRoot as Record<string, unknown>)["ConfidenceIndicatorSchema"]).toBeUndefined();
    });
  });
});
