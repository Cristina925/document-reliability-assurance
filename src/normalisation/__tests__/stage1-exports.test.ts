/**
 * DRA-ENG-003 — Stage 1 Package Export Tests
 *
 * Verifies the Stage 1 public surface:
 *   - normaliseEvaluationRequest is exported and callable
 *   - Stage 1 types and constants are exported
 *   - No evaluator/later-stage functions are exposed
 *   - No CTS imports (verified at runtime via import check)
 *   - Stage 1 surface is accessible from the package root
 */

import { describe, it, expect } from "vitest";

// Import Stage 1 surface from the normalisation module
import * as Stage1Module from "../../normalisation/index.js";

// Import from the package root index
import * as PackageRoot from "../../index.js";

describe("DRA-ENG-003 Stage 1 Package Exports", () => {
  // -------------------------------------------------------------------------
  // normalisation/index.ts exports
  // -------------------------------------------------------------------------

  describe("normalisation/index.ts — entry point", () => {
    it("exports normaliseEvaluationRequest as a function", () => {
      expect(typeof Stage1Module.normaliseEvaluationRequest).toBe("function");
    });
  });

  describe("normalisation/index.ts — constants", () => {
    it("exports STAGE_1_ID", () => {
      expect(Stage1Module.STAGE_1_ID).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("exports STAGE_1_VERSION", () => {
      expect(Stage1Module.STAGE_1_VERSION).toBeDefined();
      expect(typeof Stage1Module.STAGE_1_VERSION).toBe("string");
    });
  });

  describe("normalisation/index.ts — string utilities", () => {
    it("exports normaliseLineEndings", () => {
      expect(typeof Stage1Module.normaliseLineEndings).toBe("function");
    });

    it("exports trimMetadata", () => {
      expect(typeof Stage1Module.trimMetadata).toBe("function");
    });

    it("exports normaliseContentField", () => {
      expect(typeof Stage1Module.normaliseContentField).toBe("function");
    });

    it("exports normaliseMetadataField", () => {
      expect(typeof Stage1Module.normaliseMetadataField).toBe("function");
    });

    it("exports normaliseOptionalMetadataField", () => {
      expect(typeof Stage1Module.normaliseOptionalMetadataField).toBe("function");
    });
  });

  describe("normalisation/index.ts — document helpers", () => {
    it("exports normaliseSourceDocument", () => {
      expect(typeof Stage1Module.normaliseSourceDocument).toBe("function");
    });

    it("exports normaliseSourceDocuments", () => {
      expect(typeof Stage1Module.normaliseSourceDocuments).toBe("function");
    });

    it("exports normaliseGeneratedDocument", () => {
      expect(typeof Stage1Module.normaliseGeneratedDocument).toBe("function");
    });

    it("exports checkSourceDocumentRefs", () => {
      expect(typeof Stage1Module.checkSourceDocumentRefs).toBe("function");
    });

    it("exports checkDocumentIdentitySeparation", () => {
      expect(typeof Stage1Module.checkDocumentIdentitySeparation).toBe("function");
    });
  });

  describe("normalisation/index.ts — statement helpers", () => {
    it("exports normaliseSpanReference", () => {
      expect(typeof Stage1Module.normaliseSpanReference).toBe("function");
    });

    it("exports normaliseMaterialStatement", () => {
      expect(typeof Stage1Module.normaliseMaterialStatement).toBe("function");
    });

    it("exports normaliseMaterialStatements", () => {
      expect(typeof Stage1Module.normaliseMaterialStatements).toBe("function");
    });
  });

  describe("normalisation/index.ts — evidence helpers", () => {
    it("exports normaliseEvidenceUnit", () => {
      expect(typeof Stage1Module.normaliseEvidenceUnit).toBe("function");
    });

    it("exports normaliseEvidenceUnits", () => {
      expect(typeof Stage1Module.normaliseEvidenceUnits).toBe("function");
    });

    it("exports normaliseEvidenceRelationships", () => {
      expect(typeof Stage1Module.normaliseEvidenceRelationships).toBe("function");
    });
  });

  describe("normalisation/index.ts — does not expose later-stage behaviour", () => {
    const PROHIBITED = [
      "evaluateDocument",
      "evaluate",
      "runPipeline",
      "executeStage2",
      "executeStage3",
      "executeStage4",
      "executeStage5",
      "executeStage6",
      "executeStage7",
      "runClaimExtraction",
      "runAuthorityResolution",
      "runEvidenceLinkage",
      "runConsistencyCheck",
      "runConfidenceScoring",
      "runDecisionAndReceipt",
      "detectIssues",
      "classifyIssue",
      "calculateDecision",
      "generateProofReceipt",
      "scoreConfidence",
    ];

    for (const name of PROHIBITED) {
      it(`does not export '${name}'`, () => {
        expect(
          (Stage1Module as unknown as Record<string, unknown>)[name],
        ).toBeUndefined();
      });
    }
  });

  // -------------------------------------------------------------------------
  // Package root index exports Stage 1 surface
  // -------------------------------------------------------------------------

  describe("package root index exports Stage 1 surface", () => {
    it("exports normaliseEvaluationRequest from package root", () => {
      expect(typeof PackageRoot.normaliseEvaluationRequest).toBe("function");
    });

    it("exports STAGE_1_ID from package root", () => {
      expect(PackageRoot.STAGE_1_ID).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("exports STAGE_1_VERSION from package root", () => {
      expect(typeof PackageRoot.STAGE_1_VERSION).toBe("string");
    });

    it("exports normaliseLineEndings from package root", () => {
      expect(typeof PackageRoot.normaliseLineEndings).toBe("function");
    });

    it("still exports ASSURANCE_DECISIONS from package root", () => {
      expect(PackageRoot.ASSURANCE_DECISIONS).toBeDefined();
      expect(PackageRoot.ASSURANCE_DECISIONS).toHaveLength(3);
    });

    it("still exports ISSUE_CLASSES from package root", () => {
      expect(PackageRoot.ISSUE_CLASSES).toBeDefined();
      expect(PackageRoot.ISSUE_CLASSES).toHaveLength(9);
    });

    it("still exports PIPELINE_STAGES from package root", () => {
      expect(PackageRoot.PIPELINE_STAGES).toBeDefined();
      expect(PackageRoot.PIPELINE_STAGES).toHaveLength(7);
    });
  });

  // -------------------------------------------------------------------------
  // CTS import boundary — no CTS at runtime
  // -------------------------------------------------------------------------

  describe("CTS import boundary", () => {
    it("Stage 1 module does not import cts-reference at runtime", () => {
      // If cts-reference were imported, it would appear in the module's
      // dependency graph. We verify by checking that no CTS-specific
      // exports are present in the Stage 1 module.
      const mod = Stage1Module as unknown as Record<string, unknown>;
      expect(mod["CtsEvaluationResult"]).toBeUndefined();
      expect(mod["CTS_VERSION"]).toBeUndefined();
      expect(mod["evaluateCts"]).toBeUndefined();
      expect(mod["FULLY_COVERED"]).toBeUndefined();
    });

    it("Stage 1 normalised request does not contain CTS decision values", () => {
      const { normaliseEvaluationRequest } = Stage1Module;
      const result = normaliseEvaluationRequest({
        id: "test-001",
        generatedDocument: {
          id: "gen-001",
          title: "Test",
          content: "Content.",
          sourceDocumentIds: [],
        },
        sourceDocuments: [],
        requestedAt: "2026-07-26T10:00:00.000Z",
      });
      expect(result.ok).toBe(true);
      const json = JSON.stringify(result);
      expect(json).not.toContain("FULLY_COVERED");
      expect(json).not.toContain("PARTIALLY_COVERED");
      expect(json).not.toContain("NOT_COVERED");
    });
  });
});
