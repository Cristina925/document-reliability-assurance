/**
 * DRA-ENG-002 — Identifier Tests
 */

import { describe, it, expect } from "vitest";
import {
  EvaluationIdSchema,
  SourceDocumentIdSchema,
  GeneratedDocumentIdSchema,
  StatementIdSchema,
  EvidenceUnitIdSchema,
  IssueIdSchema,
  ProofReceiptIdSchema,
  EvaluationResultIdSchema,
  EvidenceRelationshipIdSchema,
  isValidIdentifier,
} from "../../model/identifiers.js";

describe("DRA-ENG-002 Identifiers", () => {
  const ALL_SCHEMAS = [
    { name: "EvaluationIdSchema", schema: EvaluationIdSchema },
    { name: "SourceDocumentIdSchema", schema: SourceDocumentIdSchema },
    { name: "GeneratedDocumentIdSchema", schema: GeneratedDocumentIdSchema },
    { name: "StatementIdSchema", schema: StatementIdSchema },
    { name: "EvidenceUnitIdSchema", schema: EvidenceUnitIdSchema },
    { name: "IssueIdSchema", schema: IssueIdSchema },
    { name: "ProofReceiptIdSchema", schema: ProofReceiptIdSchema },
    { name: "EvaluationResultIdSchema", schema: EvaluationResultIdSchema },
    { name: "EvidenceRelationshipIdSchema", schema: EvidenceRelationshipIdSchema },
  ];

  describe("valid identifiers", () => {
    for (const { name, schema } of ALL_SCHEMAS) {
      it(`${name} accepts a non-empty string`, () => {
        const result = schema.safeParse("valid-id-001");
        expect(result.success).toBe(true);
      });
    }
  });

  describe("rejection of empty identifiers", () => {
    for (const { name, schema } of ALL_SCHEMAS) {
      it(`${name} rejects an empty string`, () => {
        const result = schema.safeParse("");
        expect(result.success).toBe(false);
      });
    }
  });

  describe("rejection of non-string values", () => {
    for (const { name, schema } of ALL_SCHEMAS) {
      it(`${name} rejects null`, () => {
        const result = schema.safeParse(null);
        expect(result.success).toBe(false);
      });

      it(`${name} rejects a number`, () => {
        const result = schema.safeParse(123);
        expect(result.success).toBe(false);
      });
    }
  });

  describe("isValidIdentifier helper", () => {
    it("returns true for a non-empty string", () => {
      expect(isValidIdentifier("hello")).toBe(true);
    });

    it("returns false for an empty string", () => {
      expect(isValidIdentifier("")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isValidIdentifier(null)).toBe(false);
    });

    it("returns false for a number", () => {
      expect(isValidIdentifier(42)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isValidIdentifier(undefined)).toBe(false);
    });
  });

  describe("branded types do not cross-assign (compile-time — documented)", () => {
    it("each schema produces a distinct brand at compile time (runtime: all are strings)", () => {
      // Runtime check: branded types are strings at runtime
      const evId = EvaluationIdSchema.parse("eval-001");
      expect(typeof evId).toBe("string");
      const srcId = SourceDocumentIdSchema.parse("src-001");
      expect(typeof srcId).toBe("string");
    });
  });
});
