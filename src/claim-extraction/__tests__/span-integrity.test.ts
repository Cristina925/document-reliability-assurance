/**
 * DRA-ENG-004 — Span Integrity Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateSpan,
  validateAllSpans,
} from "../../claim-extraction/span-integrity.js";
import { DRA_ERROR_CODES } from "../../model/index.js";

describe("DRA-ENG-004 Span Integrity", () => {
  const CONTENT = "The system is compliant with ISO 27001.";

  describe("validateSpan — valid spans", () => {
    it("returns no errors for a valid span", () => {
      const errors = validateSpan(0, 39, CONTENT, CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for a mid-document span", () => {
      // "The system" at offset 0-10 in "The system is compliant with ISO 27001."
      // T(0) h(1) e(2) (3) s(4) y(5) s(6) t(7) e(8) m(9) → slice(0, 10)
      const errors = validateSpan(0, 10, "The system", CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for a single-character span", () => {
      const errors = validateSpan(0, 1, "T", CONTENT);
      expect(errors).toHaveLength(0);
    });
  });

  describe("validateSpan — INV-SPAN-001 (non-negative start)", () => {
    it("returns INVALID_SPAN for negative startOffset", () => {
      const errors = validateSpan(-1, 10, "text", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_SPAN);
    });
  });

  describe("validateSpan — INV-SPAN-002 (end > start)", () => {
    it("returns INVALID_SPAN when endOffset === startOffset", () => {
      const errors = validateSpan(5, 5, "", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_SPAN);
    });

    it("returns INVALID_SPAN when endOffset < startOffset", () => {
      const errors = validateSpan(10, 5, "text", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_SPAN);
    });
  });

  describe("validateSpan — INV-SPAN-003 (within bounds)", () => {
    it("returns INVALID_SPAN when endOffset exceeds document length", () => {
      const errors = validateSpan(0, CONTENT.length + 1, "text", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_SPAN);
    });
  });

  describe("validateSpan — INV-SPAN-004 (text matches slice)", () => {
    it("returns SPAN_INTEGRITY_VIOLATION when text does not match slice", () => {
      const errors = validateSpan(0, 3, "WRONG", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.SPAN_INTEGRITY_VIOLATION);
    });

    it("error message contains the span offsets", () => {
      const errors = validateSpan(0, 3, "WRONG", CONTENT);
      expect(errors[0]!.message).toContain("0");
      expect(errors[0]!.message).toContain("3");
    });
  });

  describe("validateAllSpans", () => {
    it("returns no errors for valid statements", () => {
      const content = "ABC. DEF. GHI.";
      const statements = [
        {
          id: "s2:0:4" as never,
          text: "ABC.",
          statementIndex: 0,
          spanRef: { startOffset: 0, endOffset: 4 },
          linkedEvidenceUnitIds: [] as never[],
        },
        {
          id: "s2:5:9" as never,
          text: "DEF.",
          statementIndex: 1,
          spanRef: { startOffset: 5, endOffset: 9 },
          linkedEvidenceUnitIds: [] as never[],
        },
      ];
      const errors = validateAllSpans(statements, content);
      expect(errors).toHaveLength(0);
    });

    it("returns errors for invalid statement spans", () => {
      const content = "ABC.";
      const statements = [
        {
          id: "s2:0:4" as never,
          text: "WRONG",
          statementIndex: 0,
          spanRef: { startOffset: 0, endOffset: 4 },
          linkedEvidenceUnitIds: [] as never[],
        },
      ];
      const errors = validateAllSpans(statements, content);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("skips statements without spanRef", () => {
      const content = "ABC.";
      const statements = [
        {
          id: "s2:0:4" as never,
          text: "ABC.",
          statementIndex: 0,
          // no spanRef
          linkedEvidenceUnitIds: [] as never[],
        },
      ];
      const errors = validateAllSpans(statements, content);
      expect(errors).toHaveLength(0);
    });
  });
});
