/**
 * DRA-ENG-005 — Stage 3 Package Export Tests
 */

import { describe, it, expect } from "vitest";
import * as Stage3Module from "../../authority-resolution/index.js";
import * as PackageRoot from "../../index.js";

describe("DRA-ENG-005 Stage 3 Package Exports", () => {
  describe("authority-resolution/index.ts", () => {
    it("exports resolveAuthority as a function", () => {
      expect(typeof Stage3Module.resolveAuthority).toBe("function");
    });

    it("exports STAGE_3_ID", () => {
      expect(Stage3Module.STAGE_3_ID).toBe("STAGE_3_AUTHORITY_RESOLUTION");
    });

    it("exports STAGE_3_VERSION as string", () => {
      expect(typeof Stage3Module.STAGE_3_VERSION).toBe("string");
    });

    it("exports RESOLUTION_RULE_VERSION as string", () => {
      expect(typeof Stage3Module.RESOLUTION_RULE_VERSION).toBe("string");
    });

    it("exports AUTHORITY_CLASSIFICATIONS as an array of 6", () => {
      expect(Stage3Module.AUTHORITY_CLASSIFICATIONS).toHaveLength(6);
    });

    it("exports AUTHORITY_TYPES as an array of 7", () => {
      expect(Stage3Module.AUTHORITY_TYPES).toHaveLength(7);
    });

    it("exports isAuthorityClassification as a function", () => {
      expect(typeof Stage3Module.isAuthorityClassification).toBe("function");
    });

    it("exports isAuthorityType as a function", () => {
      expect(typeof Stage3Module.isAuthorityType).toBe("function");
    });

    it("exports detectAttribution as a function", () => {
      expect(typeof Stage3Module.detectAttribution).toBe("function");
    });

    it("exports detectAuthorityType as a function", () => {
      expect(typeof Stage3Module.detectAuthorityType).toBe("function");
    });

    it("exports validateAuthoritySpan as a function", () => {
      expect(typeof Stage3Module.validateAuthoritySpan).toBe("function");
    });

    it("exports makeAuthorityRecordId as a function", () => {
      expect(typeof Stage3Module.makeAuthorityRecordId).toBe("function");
    });

    it("exports parseAuthorityRecordId as a function", () => {
      expect(typeof Stage3Module.parseAuthorityRecordId).toBe("function");
    });

    it("exports STAGE_3_RECORD_ID_PREFIX as 'ar3'", () => {
      expect(Stage3Module.STAGE_3_RECORD_ID_PREFIX).toBe("ar3");
    });
  });

  describe("prohibited exports", () => {
    const PROHIBITED = [
      "runPipeline", "evaluateDocument", "detectIssues", "calculateDecision",
      "generateProofReceipt", "scoreConfidence", "mapEvidenceToStatement",
      "evaluateCts", "FULLY_COVERED",
    ];
    for (const name of PROHIBITED) {
      it(`does not export '${name}'`, () => {
        expect((Stage3Module as unknown as Record<string, unknown>)[name]).toBeUndefined();
      });
    }
  });

  describe("package root exports Stage 3", () => {
    it("exports resolveAuthority from package root", () => {
      expect(typeof PackageRoot.resolveAuthority).toBe("function");
    });

    it("exports STAGE_3_ID from package root", () => {
      expect(PackageRoot.STAGE_3_ID).toBe("STAGE_3_AUTHORITY_RESOLUTION");
    });

    it("exports AUTHORITY_CLASSIFICATIONS from package root", () => {
      expect(PackageRoot.AUTHORITY_CLASSIFICATIONS).toHaveLength(6);
    });

    it("exports AUTHORITY_TYPES from package root", () => {
      expect(PackageRoot.AUTHORITY_TYPES).toHaveLength(7);
    });

    it("exports validateAuthoritySpan from package root", () => {
      expect(typeof PackageRoot.validateAuthoritySpan).toBe("function");
    });

    it("still exports extractClaims from package root", () => {
      expect(typeof PackageRoot.extractClaims).toBe("function");
    });

    it("still exports normaliseEvaluationRequest from package root", () => {
      expect(typeof PackageRoot.normaliseEvaluationRequest).toBe("function");
    });

    it("still exports STAGE_2_ID from package root", () => {
      expect(PackageRoot.STAGE_2_ID).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("still exports STAGE_1_ID from package root", () => {
      expect(PackageRoot.STAGE_1_ID).toBe("STAGE_1_INPUT_NORMALISATION");
    });
  });

  describe("AUTHORITY_CLASSIFICATIONS values", () => {
    const EXPECTED = [
      "DOCUMENT_AUTHOR",
      "EXPLICIT_NAMED_SOURCE",
      "EXPLICIT_UNNAMED_SOURCE",
      "STRUCTURALLY_INHERITED_SOURCE",
      "AMBIGUOUS_SOURCE",
      "NO_IDENTIFIABLE_SOURCE",
    ];
    for (const c of EXPECTED) {
      it(`includes ${c}`, () => {
        expect(Stage3Module.AUTHORITY_CLASSIFICATIONS).toContain(c);
      });
    }
  });

  describe("isAuthorityClassification guard", () => {
    it("returns true for valid classification", () => {
      expect(Stage3Module.isAuthorityClassification("DOCUMENT_AUTHOR")).toBe(true);
    });

    it("returns false for invalid value", () => {
      expect(Stage3Module.isAuthorityClassification("NOT_A_CLASS")).toBe(false);
    });
  });

  describe("makeAuthorityRecordId / parseAuthorityRecordId", () => {
    it("produces ar3:{stmtId} format", () => {
      expect(Stage3Module.makeAuthorityRecordId("s2:0:47")).toBe("ar3:s2:0:47");
    });

    it("round-trips correctly", () => {
      const parsed = Stage3Module.parseAuthorityRecordId("ar3:s2:10:50");
      expect(parsed).toStrictEqual({ statementId: "s2:10:50" });
    });

    it("returns null for non-ar3 id", () => {
      expect(Stage3Module.parseAuthorityRecordId("s2:0:10")).toBeNull();
    });
  });
});
