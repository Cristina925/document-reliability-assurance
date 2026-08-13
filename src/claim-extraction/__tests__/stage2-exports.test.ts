/**
 * DRA-ENG-004 — Stage 2 Package Export Tests
 */

import { describe, it, expect } from "vitest";
import * as Stage2Module from "../../claim-extraction/index.js";
import * as PackageRoot from "../../index.js";

describe("DRA-ENG-004 Stage 2 Package Exports", () => {
  describe("claim-extraction/index.ts — entry point", () => {
    it("exports extractClaims as a function", () => {
      expect(typeof Stage2Module.extractClaims).toBe("function");
    });

    it("exports STAGE_2_ID", () => {
      expect(Stage2Module.STAGE_2_ID).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("exports STAGE_2_VERSION as string", () => {
      expect(typeof Stage2Module.STAGE_2_VERSION).toBe("string");
    });

    it("exports EXTRACTION_RULE_VERSION as string", () => {
      expect(typeof Stage2Module.EXTRACTION_RULE_VERSION).toBe("string");
    });

    it("exports segmentContent as a function", () => {
      expect(typeof Stage2Module.segmentContent).toBe("function");
    });

    it("exports classifySegments as a function", () => {
      expect(typeof Stage2Module.classifySegments).toBe("function");
    });

    it("exports makeStatementId as a function", () => {
      expect(typeof Stage2Module.makeStatementId).toBe("function");
    });

    it("exports parseStatementId as a function", () => {
      expect(typeof Stage2Module.parseStatementId).toBe("function");
    });

    it("exports validateSpan as a function", () => {
      expect(typeof Stage2Module.validateSpan).toBe("function");
    });

    it("exports validateAllSpans as a function", () => {
      expect(typeof Stage2Module.validateAllSpans).toBe("function");
    });

    it("exports MIN_CANDIDATE_CHARS as a number", () => {
      expect(typeof Stage2Module.MIN_CANDIDATE_CHARS).toBe("number");
    });

    it("exports STAGE_2_STATEMENT_ID_PREFIX", () => {
      expect(Stage2Module.STAGE_2_STATEMENT_ID_PREFIX).toBe("s2");
    });
  });

  describe("claim-extraction/index.ts — prohibited exports", () => {
    const PROHIBITED = [
      "evaluateDocument",
      "detectIssues",
      "calculateDecision",
      "generateProofReceipt",
      "scoreConfidence",
      "mapEvidenceToStatement",
      "checkAuthority",
      "runPipeline",
      "evaluateCts",
      "FULLY_COVERED",
    ];

    for (const name of PROHIBITED) {
      it(`does not export '${name}'`, () => {
        expect(
          (Stage2Module as unknown as Record<string, unknown>)[name],
        ).toBeUndefined();
      });
    }
  });

  describe("package root exports Stage 2 surface", () => {
    it("exports extractClaims from package root", () => {
      expect(typeof PackageRoot.extractClaims).toBe("function");
    });

    it("exports STAGE_2_ID from package root", () => {
      expect(PackageRoot.STAGE_2_ID).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("exports STAGE_2_VERSION from package root", () => {
      expect(typeof PackageRoot.STAGE_2_VERSION).toBe("string");
    });

    it("exports EXTRACTION_RULE_VERSION from package root", () => {
      expect(typeof PackageRoot.EXTRACTION_RULE_VERSION).toBe("string");
    });

    it("exports makeStatementId from package root", () => {
      expect(typeof PackageRoot.makeStatementId).toBe("function");
    });

    it("exports segmentContent from package root", () => {
      expect(typeof PackageRoot.segmentContent).toBe("function");
    });

    it("still exports normaliseEvaluationRequest from package root", () => {
      expect(typeof PackageRoot.normaliseEvaluationRequest).toBe("function");
    });

    it("still exports STAGE_1_ID from package root", () => {
      expect(PackageRoot.STAGE_1_ID).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("still exports ASSURANCE_DECISIONS from package root", () => {
      expect(PackageRoot.ASSURANCE_DECISIONS).toHaveLength(3);
    });

    it("still exports ISSUE_CLASSES from package root", () => {
      expect(PackageRoot.ISSUE_CLASSES).toHaveLength(9);
    });
  });

  describe("statement identifier correctness", () => {
    it("makeStatementId produces s2:{start}:{end} format", () => {
      const id = Stage2Module.makeStatementId(0, 47);
      expect(String(id)).toBe("s2:0:47");
    });

    it("parseStatementId round-trips correctly", () => {
      const parsed = Stage2Module.parseStatementId("s2:10:50");
      expect(parsed).toStrictEqual({ startOffset: 10, endOffset: 50 });
    });

    it("parseStatementId returns null for non-s2 id", () => {
      expect(Stage2Module.parseStatementId("stmt-100")).toBeNull();
      expect(Stage2Module.parseStatementId("s1:0:10")).toBeNull();
    });

    it("different offsets produce different IDs", () => {
      const id1 = String(Stage2Module.makeStatementId(0, 10));
      const id2 = String(Stage2Module.makeStatementId(0, 11));
      const id3 = String(Stage2Module.makeStatementId(1, 10));
      expect(id1).not.toBe(id2);
      expect(id1).not.toBe(id3);
      expect(id2).not.toBe(id3);
    });
  });

  describe("CTS boundary verification", () => {
    it("Stage 2 module does not export CTS-specific symbols", () => {
      const mod = Stage2Module as unknown as Record<string, unknown>;
      expect(mod["CtsEvaluationResult"]).toBeUndefined();
      expect(mod["CTS_VERSION"]).toBeUndefined();
      expect(mod["evaluateCts"]).toBeUndefined();
      expect(mod["FULLY_COVERED"]).toBeUndefined();
      expect(mod["PARTIALLY_COVERED"]).toBeUndefined();
    });
  });
});
