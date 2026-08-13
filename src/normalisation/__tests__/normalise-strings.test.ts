/**
 * DRA-ENG-003 — String Normalisation Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  normaliseLineEndings,
  trimMetadata,
  normaliseContentField,
  normaliseMetadataField,
  normaliseOptionalMetadataField,
} from "../../normalisation/normalise-strings.js";

describe("DRA-ENG-003 String Normalisation", () => {
  describe("normaliseLineEndings", () => {
    it("converts CRLF to LF", () => {
      expect(normaliseLineEndings("line1\r\nline2")).toBe("line1\nline2");
    });

    it("converts standalone CR to LF", () => {
      expect(normaliseLineEndings("line1\rline2")).toBe("line1\nline2");
    });

    it("leaves LF unchanged", () => {
      expect(normaliseLineEndings("line1\nline2")).toBe("line1\nline2");
    });

    it("handles mixed CRLF and CR", () => {
      expect(normaliseLineEndings("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
    });

    it("handles string with no line endings", () => {
      expect(normaliseLineEndings("no newlines")).toBe("no newlines");
    });

    it("handles empty string", () => {
      expect(normaliseLineEndings("")).toBe("");
    });

    it("processes CRLF before CR to avoid double conversion", () => {
      // \r\n should become \n (not \n\n)
      expect(normaliseLineEndings("a\r\nb")).toBe("a\nb");
      expect(normaliseLineEndings("a\r\nb").split("\n").length).toBe(2);
    });

    it("handles multiple consecutive CRLF sequences", () => {
      expect(normaliseLineEndings("a\r\n\r\nb")).toBe("a\n\nb");
    });

    it("preserves leading and trailing whitespace in the string body", () => {
      expect(normaliseLineEndings("  text  ")).toBe("  text  ");
    });
  });

  describe("trimMetadata", () => {
    it("trims leading whitespace", () => {
      expect(trimMetadata("  value")).toBe("value");
    });

    it("trims trailing whitespace", () => {
      expect(trimMetadata("value  ")).toBe("value");
    });

    it("trims both ends", () => {
      expect(trimMetadata("  value  ")).toBe("value");
    });

    it("does not alter internal whitespace", () => {
      expect(trimMetadata("  a  b  c  ")).toBe("a  b  c");
    });

    it("handles string that is only whitespace", () => {
      expect(trimMetadata("   ")).toBe("");
    });

    it("handles empty string", () => {
      expect(trimMetadata("")).toBe("");
    });

    it("does not modify already-trimmed string", () => {
      expect(trimMetadata("clean value")).toBe("clean value");
    });

    it("preserves tabs within string", () => {
      expect(trimMetadata("a\tb\tc")).toBe("a\tb\tc");
    });

    it("trims tab characters at ends", () => {
      expect(trimMetadata("\tvalue\t")).toBe("value");
    });
  });

  describe("normaliseContentField", () => {
    it("normalises CRLF to LF", () => {
      expect(normaliseContentField("line1\r\nline2")).toBe("line1\nline2");
    });

    it("does NOT trim leading whitespace", () => {
      expect(normaliseContentField("  content")).toBe("  content");
    });

    it("does NOT trim trailing whitespace", () => {
      expect(normaliseContentField("content  ")).toBe("content  ");
    });

    it("preserves meaningful internal whitespace", () => {
      expect(normaliseContentField("  a  b  c  ")).toBe("  a  b  c  ");
    });

    it("preserves punctuation exactly", () => {
      const text = "Hello, world! This is a test: (1) and [2].";
      expect(normaliseContentField(text)).toBe(text);
    });

    it("normalises only line endings, nothing else", () => {
      const input = "  First line.\r\n  Second line.  ";
      const expected = "  First line.\n  Second line.  ";
      expect(normaliseContentField(input)).toBe(expected);
    });
  });

  describe("normaliseMetadataField", () => {
    it("trims AND normalises line endings", () => {
      expect(normaliseMetadataField("  value\r\n  ")).toBe("value");
    });

    it("trims leading/trailing whitespace", () => {
      expect(normaliseMetadataField("  title  ")).toBe("title");
    });

    it("normalises CRLF in middle of metadata", () => {
      expect(normaliseMetadataField("line1\r\nline2")).toBe("line1\nline2");
    });

    it("preserves internal content", () => {
      expect(normaliseMetadataField("  ISO 27001:2022  ")).toBe("ISO 27001:2022");
    });
  });

  describe("normaliseOptionalMetadataField", () => {
    it("returns undefined for undefined input", () => {
      expect(normaliseOptionalMetadataField(undefined)).toBeUndefined();
    });

    it("returns undefined for whitespace-only string", () => {
      expect(normaliseOptionalMetadataField("   ")).toBeUndefined();
    });

    it("returns trimmed string for non-empty input", () => {
      expect(normaliseOptionalMetadataField("  author  ")).toBe("author");
    });

    it("preserves internal whitespace while trimming ends", () => {
      expect(normaliseOptionalMetadataField("  ISO 27001  v2  ")).toBe(
        "ISO 27001  v2",
      );
    });

    it("returns empty string as undefined", () => {
      expect(normaliseOptionalMetadataField("")).toBeUndefined();
    });
  });
});
