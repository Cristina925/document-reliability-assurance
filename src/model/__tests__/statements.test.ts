/**
 * DRA-ENG-002 — Material Statement Tests
 */

import { describe, it, expect } from "vitest";
import {
  MATERIALITY_LEVELS,
  MaterialStatementSchema,
  SpanReferenceSchema,
  validateMaterialStatement,
} from "../../model/statements.js";
import { VALID_MATERIAL_STATEMENT } from "../../fixtures/model/valid.js";
import {
  INVALID_STATEMENT_EMPTY_TEXT,
  INVALID_STATEMENT_NEGATIVE_INDEX,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Material Statements", () => {
  describe("MATERIALITY_LEVELS constant", () => {
    it("contains HIGH, MEDIUM, LOW", () => {
      expect(MATERIALITY_LEVELS).toContain("HIGH");
      expect(MATERIALITY_LEVELS).toContain("MEDIUM");
      expect(MATERIALITY_LEVELS).toContain("LOW");
    });

    it("has exactly 3 levels", () => {
      expect(MATERIALITY_LEVELS).toHaveLength(3);
    });
  });

  describe("SpanReferenceSchema", () => {
    it("accepts an empty object (all fields optional)", () => {
      expect(SpanReferenceSchema.safeParse({}).success).toBe(true);
    });

    it("accepts a full span reference", () => {
      const result = SpanReferenceSchema.safeParse({
        startOffset: 0,
        endOffset: 50,
        pageNumber: 1,
        locationLabel: "Section 3",
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative startOffset", () => {
      expect(SpanReferenceSchema.safeParse({ startOffset: -1 }).success).toBe(false);
    });

    it("rejects non-integer pageNumber", () => {
      expect(SpanReferenceSchema.safeParse({ pageNumber: 1.5 }).success).toBe(false);
    });

    it("rejects zero pageNumber (must be positive)", () => {
      expect(SpanReferenceSchema.safeParse({ pageNumber: 0 }).success).toBe(false);
    });
  });

  describe("MaterialStatement — valid fixture", () => {
    it("validates the valid fixture", () => {
      expect(validateMaterialStatement(VALID_MATERIAL_STATEMENT).success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = MaterialStatementSchema.safeParse(VALID_MATERIAL_STATEMENT);
      expect(result.success && result.data.id).toBe("stmt-001");
    });

    it("parsed fixture has correct text", () => {
      const result = MaterialStatementSchema.safeParse(VALID_MATERIAL_STATEMENT);
      expect(result.success && result.data.text).toBe(
        "All claims must be traceable to an authority.",
      );
    });

    it("linkedEvidenceUnitIds defaults to empty array", () => {
      const stmt = {
        id: "stmt-001",
        text: "A claim.",
        statementIndex: 0,
      };
      const result = MaterialStatementSchema.safeParse(stmt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.linkedEvidenceUnitIds).toStrictEqual([]);
      }
    });
  });

  describe("MaterialStatement — invalid fixtures", () => {
    it("rejects empty text", () => {
      expect(validateMaterialStatement(INVALID_STATEMENT_EMPTY_TEXT).success).toBe(false);
    });

    it("rejects negative statementIndex", () => {
      expect(validateMaterialStatement(INVALID_STATEMENT_NEGATIVE_INDEX).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateMaterialStatement(null).success).toBe(false);
    });

    it("rejects missing text field", () => {
      expect(
        validateMaterialStatement({ id: "stmt-001", statementIndex: 0 }).success,
      ).toBe(false);
    });
  });

  describe("MaterialStatement — optional fields", () => {
    it("accepts a statement without optional fields", () => {
      const minimal = { id: "stmt-001", text: "A claim.", statementIndex: 0 };
      expect(validateMaterialStatement(minimal).success).toBe(true);
    });

    it("spanRef is optional", () => {
      const stmt = { id: "stmt-001", text: "A claim.", statementIndex: 0 };
      const result = MaterialStatementSchema.safeParse(stmt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.spanRef).toBeUndefined();
      }
    });

    it("materiality is optional", () => {
      const stmt = { id: "stmt-001", text: "A claim.", statementIndex: 0 };
      const result = MaterialStatementSchema.safeParse(stmt);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.materiality).toBeUndefined();
      }
    });
  });
});
