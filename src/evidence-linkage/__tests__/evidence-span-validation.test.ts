/**
 * DRA-ENG-006 — Evidence Span Validation Unit Tests
 */

import { describe, it, expect } from "vitest";
import { validateEvidenceSpan } from "../evidence-span-validation.js";
import { DRA_ERROR_CODES } from "../../model/index.js";

describe("DRA-ENG-006 validateEvidenceSpan", () => {
  const CONTENT = "Encryption is mandatory [1]. See Table 1 for details.";

  describe("valid spans", () => {
    it("returns no errors for '[1]' at correct position", () => {
      const start = CONTENT.indexOf("[1]");
      const errors = validateEvidenceSpan(start, start + 3, "[1]", CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for 'Table 1' at correct position", () => {
      const start = CONTENT.indexOf("Table 1");
      const errors = validateEvidenceSpan(start, start + 7, "Table 1", CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for single-character span", () => {
      const errors = validateEvidenceSpan(0, 1, "E", CONTENT);
      expect(errors).toHaveLength(0);
    });

    it("returns no errors for full-document span", () => {
      const errors = validateEvidenceSpan(0, CONTENT.length, CONTENT, CONTENT);
      expect(errors).toHaveLength(0);
    });
  });

  describe("negative startOffset", () => {
    it("returns INVALID_EVIDENCE_SPAN for startOffset < 0", () => {
      const errors = validateEvidenceSpan(-1, 3, "Enc", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN);
    });
  });

  describe("end <= start", () => {
    it("returns INVALID_EVIDENCE_SPAN for endOffset === startOffset", () => {
      const errors = validateEvidenceSpan(5, 5, "", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN);
    });

    it("returns INVALID_EVIDENCE_SPAN for endOffset < startOffset", () => {
      const errors = validateEvidenceSpan(10, 5, "text", CONTENT);
      expect(errors).toHaveLength(1);
    });
  });

  describe("out of bounds", () => {
    it("returns INVALID_EVIDENCE_SPAN for endOffset > content.length", () => {
      const errors = validateEvidenceSpan(0, CONTENT.length + 1, "text", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN);
    });
  });

  describe("integrity violation", () => {
    it("returns EVIDENCE_SPAN_INTEGRITY_VIOLATION when text does not match slice", () => {
      const start = CONTENT.indexOf("[1]");
      const errors = validateEvidenceSpan(start, start + 3, "WRONG", CONTENT);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.code).toBe(DRA_ERROR_CODES.EVIDENCE_SPAN_INTEGRITY_VIOLATION);
    });

    it("error message contains the offsets", () => {
      const errors = validateEvidenceSpan(0, 3, "WRONG", CONTENT);
      expect(errors[0]!.message).toContain("0");
      expect(errors[0]!.message).toContain("3");
    });
  });

  describe("context parameter", () => {
    it("error path includes context", () => {
      const errors = validateEvidenceSpan(-1, 3, "text", CONTENT, "records[0].evidenceSpans");
      expect(errors[0]!.path).toContain("records[0].evidenceSpans");
    });
  });
});
