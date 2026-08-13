/**
 * DRA-ENG-006 — Stage 4 Package Export Tests
 */

import { describe, it, expect } from "vitest";
import * as Stage4Module from "../../evidence-linkage/index.js";
import * as PackageRoot from "../../index.js";

describe("DRA-ENG-006 Stage 4 Package Exports", () => {
  describe("evidence-linkage/index.ts", () => {
    it("exports linkEvidence as a function", () => {
      expect(typeof Stage4Module.linkEvidence).toBe("function");
    });

    it("exports STAGE_4_ID", () => {
      expect(Stage4Module.STAGE_4_ID).toBe("STAGE_4_EVIDENCE_LINKAGE");
    });

    it("exports STAGE_4_VERSION as string", () => {
      expect(typeof Stage4Module.STAGE_4_VERSION).toBe("string");
    });

    it("exports LINKAGE_RULE_VERSION as string", () => {
      expect(typeof Stage4Module.LINKAGE_RULE_VERSION).toBe("string");
    });

    it("exports EVIDENCE_CLASSIFICATIONS as array of 12", () => {
      expect(Stage4Module.EVIDENCE_CLASSIFICATIONS).toHaveLength(12);
    });

    it("exports EVIDENCE_TYPES as array of 12", () => {
      expect(Stage4Module.EVIDENCE_TYPES).toHaveLength(12);
    });

    it("exports isEvidenceClassification as function", () => {
      expect(typeof Stage4Module.isEvidenceClassification).toBe("function");
    });

    it("exports isEvidenceType as function", () => {
      expect(typeof Stage4Module.isEvidenceType).toBe("function");
    });

    it("exports detectEvidence as function", () => {
      expect(typeof Stage4Module.detectEvidence).toBe("function");
    });

    it("exports validateEvidenceSpan as function", () => {
      expect(typeof Stage4Module.validateEvidenceSpan).toBe("function");
    });

    it("exports makeEvidenceRecordId as function", () => {
      expect(typeof Stage4Module.makeEvidenceRecordId).toBe("function");
    });

    it("exports parseEvidenceRecordId as function", () => {
      expect(typeof Stage4Module.parseEvidenceRecordId).toBe("function");
    });

    it("exports STAGE_4_RECORD_ID_PREFIX as 'ar4'", () => {
      expect(Stage4Module.STAGE_4_RECORD_ID_PREFIX).toBe("ar4");
    });
  });

  describe("EVIDENCE_CLASSIFICATIONS values", () => {
    const EXPECTED = [
      "CITED_REFERENCE",
      "TABLE_EVIDENCE",
      "FIGURE_EVIDENCE",
      "FOOTNOTE_EVIDENCE",
      "APPENDIX_EVIDENCE",
      "QUOTED_SOURCE",
      "DOCUMENT_CROSS_REFERENCE",
      "EXTERNAL_REFERENCE_PRESENT",
      "DIRECT_DOCUMENT_EVIDENCE",
      "AMBIGUOUS_EVIDENCE_LINK",
      "NO_DOCUMENT_EVIDENCE",
      "SEMANTIC_PARAPHRASE_MATCH",
    ];
    for (const c of EXPECTED) {
      it(`includes ${c}`, () => {
        expect(Stage4Module.EVIDENCE_CLASSIFICATIONS).toContain(c);
      });
    }
  });

  describe("isEvidenceClassification guard", () => {
    it("returns true for valid classification", () => {
      expect(Stage4Module.isEvidenceClassification("CITED_REFERENCE")).toBe(true);
    });

    it("returns false for invalid value", () => {
      expect(Stage4Module.isEvidenceClassification("NOT_A_CLASS")).toBe(false);
    });

    it("returns false for Stage 3 classification", () => {
      expect(Stage4Module.isEvidenceClassification("DOCUMENT_AUTHOR")).toBe(false);
    });
  });

  describe("makeEvidenceRecordId / parseEvidenceRecordId", () => {
    it("produces ar4:{stmtId} format", () => {
      expect(Stage4Module.makeEvidenceRecordId("s2:0:47")).toBe("ar4:s2:0:47");
    });

    it("round-trips correctly", () => {
      const parsed = Stage4Module.parseEvidenceRecordId("ar4:s2:10:50");
      expect(parsed).toStrictEqual({ statementId: "s2:10:50" });
    });

    it("returns null for non-ar4 id", () => {
      expect(Stage4Module.parseEvidenceRecordId("s2:0:10")).toBeNull();
    });

    it("returns null for ar3: id", () => {
      expect(Stage4Module.parseEvidenceRecordId("ar3:s2:0:10")).toBeNull();
    });
  });

  describe("prohibited exports", () => {
    const PROHIBITED = [
      "runPipeline", "evaluateDocument", "detectIssues", "calculateDecision",
      "generateProofReceipt", "scoreConfidence", "evaluateCts", "FULLY_COVERED",
    ];
    for (const name of PROHIBITED) {
      it(`does not export '${name}'`, () => {
        expect((Stage4Module as unknown as Record<string, unknown>)[name]).toBeUndefined();
      });
    }
  });

  describe("package root exports Stage 4", () => {
    it("exports linkEvidence from package root", () => {
      expect(typeof PackageRoot.linkEvidence).toBe("function");
    });

    it("exports STAGE_4_ID from package root", () => {
      expect(PackageRoot.STAGE_4_ID).toBe("STAGE_4_EVIDENCE_LINKAGE");
    });

    it("exports EVIDENCE_CLASSIFICATIONS from package root", () => {
      expect(PackageRoot.EVIDENCE_CLASSIFICATIONS).toHaveLength(12);
    });

    it("exports validateEvidenceSpan from package root", () => {
      expect(typeof PackageRoot.validateEvidenceSpan).toBe("function");
    });

    it("still exports resolveAuthority from package root", () => {
      expect(typeof PackageRoot.resolveAuthority).toBe("function");
    });

    it("still exports extractClaims from package root", () => {
      expect(typeof PackageRoot.extractClaims).toBe("function");
    });

    it("DRA_STATUS is a non-empty string reflecting current milestone", () => {
      expect(typeof PackageRoot.DRA_STATUS).toBe("string");
      expect(PackageRoot.DRA_STATUS.length).toBeGreaterThan(0);
    });
  });
});
