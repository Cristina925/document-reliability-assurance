/**
 * DRA-ENG-005 — Authority Span Validation Unit Tests
 */

import { describe, it, expect } from "vitest";
import { validateAuthoritySpan } from "../authority-span-validation.js";
import { DRA_ERROR_CODES } from "../../model/index.js";

describe("DRA-ENG-005 validateAuthoritySpan", () => {
  const CONTENT = "According to WHO, the system must comply with ISO 27001.";

  describe("valid spans", () => {
    it("returns no errors for full-document span", () => {
      const errors = validateAuthoritySpan(0, CONTENT.length, CONTENT, CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for 'WHO' at correct position", () => {
      // "According to WHO, ..."
      // A(0)c(1)c(2)o(3)r(4)d(5)i(6)n(7)g(8) (9)t(10)o(11) (12)W(13)H(14)O(15)
      const errors = validateAuthoritySpan(13, 16, "WHO", CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for single character span", () => {
      const errors = validateAuthoritySpan(0, 1, "A", CONTENT);
      expect(errors).toHaveLength(0);
    });
  });

  describe("negative startOffset", () => {
    it("returns INVALID_AUTHORITY_SPAN for startOffset < 0", () => {
      const errors = validateAuthoritySpan(-1, 3, "Acc", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN);
    });
  });

  describe("end <= start", () => {
    it("returns INVALID_AUTHORITY_SPAN for endOffset === startOffset", () => {
      const errors = validateAuthoritySpan(5, 5, "", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN);
    });

    it("returns INVALID_AUTHORITY_SPAN for endOffset < startOffset", () => {
      const errors = validateAuthoritySpan(10, 5, "text", CONTENT);
      expect(errors).toHaveLength(1);
    });
  });

  describe("out of bounds", () => {
    it("returns INVALID_AUTHORITY_SPAN for endOffset > content.length", () => {
      const errors = validateAuthoritySpan(0, CONTENT.length + 1, "text", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN);
    });
  });

  describe("integrity violation", () => {
    it("returns AUTHORITY_SPAN_INTEGRITY_VIOLATION when text does not match slice", () => {
      const errors = validateAuthoritySpan(13, 16, "XYZ", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.AUTHORITY_SPAN_INTEGRITY_VIOLATION);
    });

    it("error message contains the offsets", () => {
      const errors = validateAuthoritySpan(0, 3, "WRONG", CONTENT);
      expect(errors[0]!.message).toContain("0");
      expect(errors[0]!.message).toContain("3");
    });
  });
});
