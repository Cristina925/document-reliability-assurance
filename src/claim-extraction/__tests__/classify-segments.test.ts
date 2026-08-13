/**
 * DRA-ENG-004 — classifySegments Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  classifySegments,
  MIN_CANDIDATE_CHARS,
} from "../../claim-extraction/classify-segments.js";
import type { ContentSegment } from "../../claim-extraction/segment-content.js";

function makeSegment(
  text: string,
  startOffset: number,
  segmentType: ContentSegment["segmentType"] = "SENTENCE",
): ContentSegment {
  return {
    text,
    startOffset,
    endOffset: startOffset + text.length,
    segmentType,
  };
}

describe("DRA-ENG-004 classifySegments", () => {
  describe("candidate classification", () => {
    it("declarative sentence is a CANDIDATE", () => {
      const segs = [makeSegment("ISO 27001 compliance is mandatory.", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });

    it("question is a CANDIDATE (conservative implementation choice)", () => {
      const segs = [makeSegment("Is the system compliant?", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });

    it("command is a CANDIDATE", () => {
      const segs = [makeSegment("Implement access controls immediately.", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });

    it("bullet item is a CANDIDATE", () => {
      const segs = [makeSegment("Access controls must be enabled.", 0, "BULLET_ITEM")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });

    it("numbered item is a CANDIDATE", () => {
      const segs = [makeSegment("All data must be encrypted.", 0, "NUMBERED_ITEM")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });

    it("returns no exclusionReason for candidates", () => {
      const segs = [makeSegment("The system is compliant.", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.exclusionReason).toBeUndefined();
    });
  });

  describe("exclusion — EMPTY", () => {
    it("empty string segment is EXCLUDED with reason EMPTY", () => {
      const segs = [makeSegment("", 0, "EMPTY_LINE")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("EMPTY");
    });

    it("EMPTY_LINE type segment is EXCLUDED", () => {
      const segs = [{ text: "", startOffset: 0, endOffset: 0, segmentType: "EMPTY_LINE" as const }];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
    });
  });

  describe("exclusion — WHITESPACE_ONLY", () => {
    it("whitespace-only segment is EXCLUDED", () => {
      const segs = [makeSegment("   ", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("WHITESPACE_ONLY");
    });

    it("tab-only segment is EXCLUDED", () => {
      const segs = [makeSegment("\t\t", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("WHITESPACE_ONLY");
    });
  });

  describe("exclusion — PUNCTUATION_ONLY", () => {
    it("punctuation-only segment is EXCLUDED", () => {
      const segs = [makeSegment("...", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("PUNCTUATION_ONLY");
    });

    it("dashes only is EXCLUDED as punctuation", () => {
      const segs = [makeSegment("---", 0, "HORIZONTAL_RULE")];
      const classified = classifySegments(segs);
      // HORIZONTAL_RULE is excluded by type first
      expect(classified[0]!.status).toBe("EXCLUDED");
    });
  });

  describe("exclusion — HEADING", () => {
    it("HEADING segment is EXCLUDED", () => {
      const segs = [makeSegment("# Security Requirements", 0, "HEADING")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("HEADING");
    });

    it("H2 heading is EXCLUDED", () => {
      const segs = [makeSegment("## Access Control", 0, "HEADING")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
    });
  });

  describe("exclusion — HORIZONTAL_RULE", () => {
    it("HORIZONTAL_RULE segment is EXCLUDED", () => {
      const segs = [makeSegment("---", 0, "HORIZONTAL_RULE")];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("HORIZONTAL_RULE");
    });
  });

  describe("exclusion — PAGE_NUMBER", () => {
    it("'Page 1 of 10' is EXCLUDED", () => {
      const segs = [makeSegment("Page 1 of 10", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("PAGE_NUMBER");
    });

    it("'page 3' is EXCLUDED", () => {
      const segs = [makeSegment("page 3", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("PAGE_NUMBER");
    });

    it("'2 of 5 pages' is EXCLUDED", () => {
      const segs = [makeSegment("2 of 5 pages", 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
    });
  });

  describe("exclusion — SHORT_FRAGMENT", () => {
    it(`segment with < ${MIN_CANDIDATE_CHARS} non-whitespace chars is EXCLUDED`, () => {
      const segs = [makeSegment("ab", 0)]; // 2 non-whitespace chars
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[0]!.exclusionReason).toBe("SHORT_FRAGMENT");
    });

    it(`segment with exactly ${MIN_CANDIDATE_CHARS} non-whitespace chars is CANDIDATE`, () => {
      const text = "abc"; // exactly 3 non-whitespace chars
      const segs = [makeSegment(text, 0)];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("CANDIDATE");
    });
  });

  describe("exclusion — DUPLICATE_SPAN", () => {
    it("second occurrence of identical span is EXCLUDED", () => {
      const seg1 = makeSegment("Claim text.", 0);
      const seg2 = makeSegment("Claim text.", 0); // same start and end
      const classified = classifySegments([seg1, seg2]);
      expect(classified[0]!.status).toBe("CANDIDATE");
      expect(classified[1]!.status).toBe("EXCLUDED");
      expect(classified[1]!.exclusionReason).toBe("DUPLICATE_SPAN");
    });

    it("same text at different positions is not a duplicate", () => {
      const seg1 = makeSegment("Claim text.", 0);
      const seg2 = makeSegment("Claim text.", 20);
      const classified = classifySegments([seg1, seg2]);
      expect(classified[0]!.status).toBe("CANDIDATE");
      expect(classified[1]!.status).toBe("CANDIDATE");
    });
  });

  describe("ordering — classification preserves order", () => {
    it("classifies segments in the same order they were provided", () => {
      const segs = [
        makeSegment("First claim.", 0),
        makeSegment("Second claim.", 15),
        makeSegment("Third claim.", 30),
      ];
      const classified = classifySegments(segs);
      expect(classified[0]!.segment.text).toBe("First claim.");
      expect(classified[1]!.segment.text).toBe("Second claim.");
      expect(classified[2]!.segment.text).toBe("Third claim.");
    });
  });

  describe("mixed segments", () => {
    it("correctly classifies a mixed sequence", () => {
      const segs = [
        makeSegment("", 0, "EMPTY_LINE"),                      // EMPTY
        makeSegment("# Heading", 1, "HEADING"),                 // HEADING
        makeSegment("Real claim here.", 15),                    // CANDIDATE
        makeSegment("...", 35),                                  // PUNCTUATION_ONLY
        makeSegment("Another real claim.", 40),                  // CANDIDATE
      ];
      const classified = classifySegments(segs);
      expect(classified[0]!.status).toBe("EXCLUDED");
      expect(classified[1]!.status).toBe("EXCLUDED");
      expect(classified[2]!.status).toBe("CANDIDATE");
      expect(classified[3]!.status).toBe("EXCLUDED");
      expect(classified[4]!.status).toBe("CANDIDATE");
    });
  });
});
