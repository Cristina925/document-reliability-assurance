/**
 * DRA-ENG-004 — segmentContent Unit Tests
 */

import { describe, it, expect } from "vitest";
import { segmentContent } from "../../claim-extraction/segment-content.js";
import type { ContentSegment } from "../../claim-extraction/segment-content.js";

/** Verify span integrity invariant for a segment against the original content. */
function assertSpanIntegrity(seg: ContentSegment, content: string): void {
  expect(content.slice(seg.startOffset, seg.endOffset)).toBe(seg.text);
}

describe("DRA-ENG-004 segmentContent", () => {
  describe("empty and whitespace content", () => {
    it("returns empty array for empty string", () => {
      expect(segmentContent("")).toStrictEqual([]);
    });

    it("returns empty-line segment for whitespace-only line", () => {
      const segs = segmentContent("   ");
      expect(segs.every((s) => s.segmentType === "EMPTY_LINE")).toBe(true);
    });
  });

  describe("sentence splitting — basic", () => {
    it("single sentence without terminal punctuation", () => {
      const content = "The system is compliant";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
      expect(sentences[0]!.text).toBe("The system is compliant");
    });

    it("single sentence with period", () => {
      const content = "ISO 27001 compliance is mandatory.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
      expect(sentences[0]!.text).toBe("ISO 27001 compliance is mandatory.");
    });

    it("two sentences on one line", () => {
      const content = "First claim. Second claim.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(2);
      expect(sentences[0]!.text).toBe("First claim.");
      expect(sentences[1]!.text).toBe("Second claim.");
    });

    it("three sentences: ABC. DEF. GHI.", () => {
      const content = "ABC. DEF. GHI.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(3);
      expect(sentences[0]!.text).toBe("ABC.");
      expect(sentences[1]!.text).toBe("DEF.");
      expect(sentences[2]!.text).toBe("GHI.");
    });

    it("! is a sentence boundary", () => {
      const content = "This passed! Now we continue.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(2);
      expect(sentences[0]!.text).toBe("This passed!");
    });

    it("? is a sentence boundary", () => {
      const content = "Is it compliant? Yes it is.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(2);
      expect(sentences[0]!.text).toBe("Is it compliant?");
    });
  });

  describe("span integrity invariant — sentences", () => {
    it("content.slice(start, end) === text for each sentence", () => {
      const content = "First claim. Second claim. Third claim.";
      const segs = segmentContent(content);
      for (const seg of segs) {
        assertSpanIntegrity(seg, content);
      }
    });

    it("spans for ABC. DEF. GHI. are exactly correct", () => {
      const content = "ABC. DEF. GHI.";
      const segs = segmentContent(content).filter((s) => s.segmentType === "SENTENCE");
      expect(segs[0]!.startOffset).toBe(0);
      expect(segs[0]!.endOffset).toBe(4);
      expect(segs[1]!.startOffset).toBe(5);
      expect(segs[1]!.endOffset).toBe(9);
      expect(segs[2]!.startOffset).toBe(10);
      expect(segs[2]!.endOffset).toBe(14);
    });

    it("span integrity holds for multi-line content", () => {
      const content = "Line one claim.\nLine two claim.";
      const segs = segmentContent(content);
      for (const seg of segs) {
        assertSpanIntegrity(seg, content);
      }
    });
  });

  describe("decimal numbers — no false splits", () => {
    it("99.9% is not split", () => {
      const content = "The system maintains 99.9% uptime.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
      expect(sentences[0]!.text).toContain("99.9%");
    });

    it("version 3.14 is not split", () => {
      const content = "Version 3.14 of the standard applies.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("section number 1.2 is not split", () => {
      const content = "Section 1.2 covers requirements.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });
  });

  describe("abbreviations — no false splits", () => {
    it("Dr. Smith does not split at the period", () => {
      const content = "Dr. Smith approved the report.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("Prof. Johnson does not split", () => {
      const content = "Prof. Johnson reviewed the document.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("etc. does not split mid-sentence", () => {
      const content = "All controls, etc. must be reviewed.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("Jan. date abbreviation does not split", () => {
      const content = "The audit was completed on 15 Jan. 2024.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("e.g. does not split (next word lowercase)", () => {
      const content = "All modules, e.g. the auth module, must be audited.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });

    it("single-letter initial A. does not split", () => {
      const content = "A. Smith signed the document.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(1);
    });
  });

  describe("bullet items", () => {
    it("extracts bullet item without the marker", () => {
      const content = "- Access controls must be enabled.";
      const segs = segmentContent(content);
      const bullets = segs.filter((s) => s.segmentType === "BULLET_ITEM");
      expect(bullets).toHaveLength(1);
      expect(bullets[0]!.text).toBe("Access controls must be enabled.");
      expect(bullets[0]!.text).not.toMatch(/^-/);
    });

    it("* bullet style is recognised", () => {
      const content = "* Encryption must be enabled.";
      const segs = segmentContent(content);
      const bullets = segs.filter((s) => s.segmentType === "BULLET_ITEM");
      expect(bullets).toHaveLength(1);
      expect(bullets[0]!.text).toBe("Encryption must be enabled.");
    });

    it("span integrity holds for bullet items", () => {
      const content = "- Claim A.\n- Claim B.";
      const segs = segmentContent(content);
      for (const seg of segs) {
        assertSpanIntegrity(seg, content);
      }
    });

    it("multiple bullets produce multiple BULLET_ITEM segments", () => {
      const content = "- First item.\n- Second item.\n- Third item.";
      const segs = segmentContent(content).filter((s) => s.segmentType === "BULLET_ITEM");
      expect(segs).toHaveLength(3);
    });
  });

  describe("numbered list items", () => {
    it("extracts numbered item without the marker", () => {
      const content = "1. Access controls must be enabled.";
      const segs = segmentContent(content);
      const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
      expect(numbered).toHaveLength(1);
      expect(numbered[0]!.text).toBe("Access controls must be enabled.");
    });

    it("parenthesis-style numbering is recognised", () => {
      const content = "1) First requirement applies.";
      const segs = segmentContent(content);
      const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
      expect(numbered).toHaveLength(1);
    });

    it("span integrity holds for numbered items", () => {
      const content = "1. First claim.\n2. Second claim.";
      const segs = segmentContent(content);
      for (const seg of segs) {
        assertSpanIntegrity(seg, content);
      }
    });
  });

  describe("headings", () => {
    it("markdown heading is a HEADING segment", () => {
      const content = "# Section Title";
      const segs = segmentContent(content);
      const headings = segs.filter((s) => s.segmentType === "HEADING");
      expect(headings).toHaveLength(1);
    });

    it("H2 heading is a HEADING segment", () => {
      const content = "## Sub-section";
      const segs = segmentContent(content);
      const headings = segs.filter((s) => s.segmentType === "HEADING");
      expect(headings).toHaveLength(1);
    });

    it("heading followed by claim produces HEADING + SENTENCE", () => {
      const content = "# Title\nThe claim follows.";
      const segs = segmentContent(content);
      const headings = segs.filter((s) => s.segmentType === "HEADING");
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(headings).toHaveLength(1);
      expect(sentences).toHaveLength(1);
      expect(sentences[0]!.text).toBe("The claim follows.");
    });
  });

  describe("horizontal rules", () => {
    it("--- is a HORIZONTAL_RULE segment", () => {
      const content = "---";
      const segs = segmentContent(content);
      expect(segs.some((s) => s.segmentType === "HORIZONTAL_RULE")).toBe(true);
    });

    it("=== is a HORIZONTAL_RULE segment", () => {
      const content = "===";
      const segs = segmentContent(content);
      expect(segs.some((s) => s.segmentType === "HORIZONTAL_RULE")).toBe(true);
    });
  });

  describe("multi-line content", () => {
    it("single newline produces two SENTENCE segments (one per line)", () => {
      const content = "Line one claim.\nLine two claim.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      expect(sentences).toHaveLength(2);
    });

    it("offsets are globally correct across multiple lines", () => {
      const content = "Line one.\nLine two.";
      const segs = segmentContent(content);
      const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
      // Line one: offset 0-9; Line two: offset 10-19
      expect(sentences[0]!.startOffset).toBe(0);
      expect(sentences[0]!.endOffset).toBe(9);
      expect(sentences[1]!.startOffset).toBe(10);
      expect(sentences[1]!.endOffset).toBe(19);
    });
  });
});
