/**
 * DRA-ENG-002 — Document Tests
 */

import { describe, it, expect } from "vitest";
import {
  SOURCE_DOCUMENT_FORMATS,
  SourceDocumentSchema,
  GeneratedDocumentSchema,
  validateSourceDocument,
  validateGeneratedDocument,
} from "../../model/documents.js";
import {
  VALID_SOURCE_DOCUMENT,
  VALID_GENERATED_DOCUMENT,
} from "../../fixtures/model/valid.js";
import {
  INVALID_SOURCE_DOCUMENT_EMPTY_ID,
  INVALID_SOURCE_DOCUMENT_EMPTY_TITLE,
  INVALID_SOURCE_DOCUMENT_BAD_TIMESTAMP,
  INVALID_SOURCE_DOCUMENT_NO_ID,
  INVALID_GENERATED_DOCUMENT_EMPTY_CONTENT,
  INVALID_GENERATED_DOCUMENT_EMPTY_TITLE,
  INVALID_GENERATED_DOCUMENT_BAD_TIMESTAMP,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Documents", () => {
  describe("SOURCE_DOCUMENT_FORMATS", () => {
    it("includes PLAIN_TEXT", () => {
      expect(SOURCE_DOCUMENT_FORMATS).toContain("PLAIN_TEXT");
    });

    it("includes UNKNOWN", () => {
      expect(SOURCE_DOCUMENT_FORMATS).toContain("UNKNOWN");
    });
  });

  describe("SourceDocument — valid fixture", () => {
    it("validates the valid fixture", () => {
      const result = validateSourceDocument(VALID_SOURCE_DOCUMENT);
      expect(result.success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = SourceDocumentSchema.safeParse(VALID_SOURCE_DOCUMENT);
      expect(result.success && result.data.id).toBe("src-doc-001");
    });

    it("parsed fixture has correct title", () => {
      const result = SourceDocumentSchema.safeParse(VALID_SOURCE_DOCUMENT);
      expect(result.success && result.data.title).toBe("DRA Test Reference Standard v1.0");
    });
  });

  describe("SourceDocument — invalid fixtures", () => {
    it("rejects empty id", () => {
      expect(validateSourceDocument(INVALID_SOURCE_DOCUMENT_EMPTY_ID).success).toBe(false);
    });

    it("rejects empty title", () => {
      expect(validateSourceDocument(INVALID_SOURCE_DOCUMENT_EMPTY_TITLE).success).toBe(false);
    });

    it("rejects bad timestamp", () => {
      expect(validateSourceDocument(INVALID_SOURCE_DOCUMENT_BAD_TIMESTAMP).success).toBe(false);
    });

    it("rejects missing id field", () => {
      expect(validateSourceDocument(INVALID_SOURCE_DOCUMENT_NO_ID).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateSourceDocument(null).success).toBe(false);
    });
  });

  describe("SourceDocument — optional fields", () => {
    it("accepts a minimal source document without optional fields", () => {
      const minimal = { id: "src-001", title: "Minimal Source Doc" };
      expect(validateSourceDocument(minimal).success).toBe(true);
    });

    it("content is optional", () => {
      const doc = { id: "src-001", title: "Test" };
      const result = SourceDocumentSchema.safeParse(doc);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBeUndefined();
      }
    });
  });

  describe("GeneratedDocument — valid fixture", () => {
    it("validates the valid fixture", () => {
      const result = validateGeneratedDocument(VALID_GENERATED_DOCUMENT);
      expect(result.success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = GeneratedDocumentSchema.safeParse(VALID_GENERATED_DOCUMENT);
      expect(result.success && result.data.id).toBe("gen-doc-001");
    });
  });

  describe("GeneratedDocument — invalid fixtures", () => {
    it("rejects empty content", () => {
      expect(validateGeneratedDocument(INVALID_GENERATED_DOCUMENT_EMPTY_CONTENT).success).toBe(false);
    });

    it("rejects empty title", () => {
      expect(validateGeneratedDocument(INVALID_GENERATED_DOCUMENT_EMPTY_TITLE).success).toBe(false);
    });

    it("rejects bad generatedAt timestamp", () => {
      expect(validateGeneratedDocument(INVALID_GENERATED_DOCUMENT_BAD_TIMESTAMP).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateGeneratedDocument(null).success).toBe(false);
    });
  });

  describe("GeneratedDocument — optional fields", () => {
    it("generatedAt is optional", () => {
      const doc = {
        id: "gen-001",
        title: "Test Gen Doc",
        content: "Some content",
        sourceDocumentIds: [],
      };
      expect(validateGeneratedDocument(doc).success).toBe(true);
    });

    it("sourceDocumentIds defaults to empty array", () => {
      const doc = {
        id: "gen-001",
        title: "Test Gen Doc",
        content: "Some content",
      };
      const result = GeneratedDocumentSchema.safeParse(doc);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceDocumentIds).toStrictEqual([]);
      }
    });
  });
});
