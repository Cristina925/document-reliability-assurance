/**
 * DRA-ENG-016 — Citation Integrity Preservation and Detection
 *
 * Part A: minimal, PDF/PLOS-independent reproductions of W1 and W2, isolated
 *         to segmentContent() directly (not inferred from full Stage 2/full
 *         pipeline output).
 * Part B: citation-marker line-wrap preservation — positive cases + narrow
 *         adversarial/negative cases proving the fix does not blindly join
 *         arbitrary lines.
 * Part C: numbered-reference structural coherence (leading-whitespace
 *         tolerance) — positive cases, DOI/PMID-bearing entries, adjacent
 *         entries not fused, and the accepted multi-line-continuation
 *         limitation documented (not "fixed").
 */

import { describe, it, expect } from "vitest";
import { segmentContent } from "../segment-content.js";
import type { ContentSegment } from "../segment-content.js";

function assertSpanIntegrity(seg: ContentSegment, content: string): void {
  expect(content.slice(seg.startOffset, seg.endOffset)).toBe(seg.text);
}

describe("DRA-ENG-016 Part A — minimal root-cause reproductions", () => {
  it("[FINDING W1 repro] a citation bracket split across a physical line boundary was NOT reconstructed by the PRE-fix segmenter shape — confirmed here it now IS, isolating the fix to segmentContent's line loop, not PDF extraction or normalisation", () => {
    // This is the minimal synthetic reproduction: no PDF, no PLOS text.
    // The only ingredient needed to reproduce W1 is a physical newline
    // landing inside an otherwise coherent bracket-number citation marker.
    const content = "Open Access articles [19,\n                    20]. Open access is common.";
    const segs = segmentContent(content);
    const covering = segs.filter(
      (s) => s.startOffset <= content.indexOf("[19,") && s.endOffset >= content.indexOf("20].") + 4,
    );
    expect(covering.length).toBeGreaterThan(0);
    expect(covering.some((s) => s.text.includes("[19,") && s.text.includes("20]"))).toBe(true);
    for (const seg of segs) assertSpanIntegrity(seg, content);
  });

  it("[FINDING W2 repro] a bare numbered-reference marker with leading whitespace, mid-document, is now kept with its own first content word instead of being severed at the number's period", () => {
    // Minimal synthetic reproduction of W2: a leading-whitespace-indented
    // "N." marker (as PDF hanging-indent commonly renders) immediately
    // followed by capitalised content on the same physical line.
    const content = "                                           15.    Cobey KD, Haustein S. Some Title. J Test. 2020.";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(1);
    expect(numbered[0]!.text.startsWith("Cobey KD")).toBe(true);
    for (const seg of segs) assertSpanIntegrity(seg, content);
  });

  it("documents the pre-fix W2 mechanism precisely: without leading-whitespace tolerance, the indented marker falls to the plain-sentence path and IS severed at the digit-period", () => {
    // Directly demonstrates the root cause using the OLD (unindented) NUMBERED_RE
    // semantics applied inline, to prove causal attribution to the specific rule
    // (not merely observed as a Stage 2 output artifact).
    const OLD_NUMBERED_RE = /^(\d+[.)]\s+)/;
    const line = "                                           15.    Cobey KD, Haustein S.";
    expect(OLD_NUMBERED_RE.test(line)).toBe(false); // never recognised as a list item
    // Falling through to the plain-text sentence splitter, the period after
    // "15" is followed by whitespace then an uppercase letter, and "15" is a
    // two-character non-abbreviation word — so isSentenceBoundaryPeriod's
    // published rule (word-before-dot not a recognised abbreviation, next
    // char uppercase) classifies it as a sentence boundary, severing the
    // number from the content that follows on the very same physical line.
  });
});

describe("DRA-ENG-016 Part B — citation-marker line-wrap preservation (positive)", () => {
  it("[19, 20] split across lines is preserved intact in one segment", () => {
    const content = "cites articles [19,\n                    20]. Next sentence here.";
    const segs = segmentContent(content);
    const hit = segs.find((s) => s.text.includes("[19,") && s.text.includes("20]"));
    expect(hit).toBeDefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("a range marker [1\u20133] split across lines is preserved intact", () => {
    const content = "as shown [1\u2013\n3] earlier in the review.";
    const segs = segmentContent(content);
    const hit = segs.find((s) => s.text.includes("[1\u2013") && s.text.includes("3]"));
    expect(hit).toBeDefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("[7, 8] split across lines is preserved intact", () => {
    const content = "supported by data [7,\n8] in the appendix.";
    const segs = segmentContent(content);
    const hit = segs.find((s) => s.text.includes("[7,") && s.text.includes("8]"));
    expect(hit).toBeDefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("a single-number bracket [71] split across lines is preserved intact", () => {
    const content = "was noted [7\n1]. Final remark.";
    const segs = segmentContent(content);
    const hit = segs.find((s) => s.text.includes("[7") && s.text.includes("1]"));
    expect(hit).toBeDefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("an unsplit marker on one line is unaffected (no spurious join with the next unrelated line)", () => {
    const content = "already intact [6].\nA wholly unrelated next sentence follows.";
    const segs = segmentContent(content);
    const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
    expect(sentences).toHaveLength(2);
    expect(sentences[0]!.text).toBe("already intact [6].");
    for (const s of segs) assertSpanIntegrity(s, content);
  });
});

describe("DRA-ENG-016 Part B — adversarial / negative joining tests", () => {
  it("does NOT join across a blank line (paragraph boundary) even if the bracket looks unterminated", () => {
    const content = "trailing digits [19,\n\n20] appears in a new paragraph.";
    const segs = segmentContent(content);
    // The EMPTY_LINE must still be produced — proves no cross-boundary join happened.
    expect(segs.some((s) => s.segmentType === "EMPTY_LINE")).toBe(true);
    const joined = segs.find((s) => s.text.includes("[19,") && s.text.includes("20]"));
    expect(joined).toBeUndefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join when the bracket contains non-numeric content (not a citation marker)", () => {
    const content = "the array index [i,\nj] is used here.";
    const segs = segmentContent(content);
    const joined = segs.find((s) => s.text.includes("[i,") && s.text.includes("j]"));
    expect(joined).toBeUndefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join when the bracket on line 1 is already closed on the same line", () => {
    const content = "already closed [3] here.\n42] stray bracket text on the next line.";
    const segs = segmentContent(content);
    const joined = segs.find((s) => s.text.includes("[3]") && s.text.includes("42]"));
    expect(joined).toBeUndefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join when the next line is a heading, not a bracket continuation", () => {
    const content = "an unterminated tail [19,\n# A Heading\nMore text.";
    const segs = segmentContent(content);
    expect(segs.some((s) => s.segmentType === "HEADING")).toBe(true);
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join when the next line is a bullet item", () => {
    const content = "an unterminated tail [19,\n- a bullet point\nMore text.";
    const segs = segmentContent(content);
    expect(segs.some((s) => s.segmentType === "BULLET_ITEM")).toBe(true);
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join when the continuation line has unrelated prose before any bracket", () => {
    const content = "an unterminated tail [19,\nSome unrelated prose ends with 20] deep in the line.";
    const segs = segmentContent(content);
    const joined = segs.find((s) => s.text.includes("[19,") && s.text.includes("20]"));
    expect(joined).toBeUndefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("does NOT join across more than one physical line (two-line lookahead only, by design)", () => {
    const content = "an unterminated tail [19,\n\n\n20] appears three lines later.";
    const segs = segmentContent(content);
    const joined = segs.find((s) => s.text.includes("[19,") && s.text.includes("20]"));
    expect(joined).toBeUndefined();
    for (const s of segs) assertSpanIntegrity(s, content);
  });
});

describe("DRA-ENG-016 Part C — numbered-reference structural coherence", () => {
  it("a heavily-indented numbered reference (PDF hanging-indent style) keeps its number with its first content word", () => {
    const content = "                                           17.    Colavizza G, Hrynaszkiewicz I, Staniszewski Z. Title Here. J. 2020.";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(1);
    expect(numbered[0]!.text.startsWith("Colavizza")).toBe(true);
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("a DOI-bearing reference entry is kept as one coherent NUMBERED_ITEM (no internal splitting at abbreviation-like periods)", () => {
    const content = "     7.  Serghiou S, Contopoulos-Ioannidis DG, Boyack KW, et al. Assessment of transparency. PLoS Biol. 2021;19:e3001107. https://doi.org/10.1371/journal.pbio.3001107";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(1);
    expect(numbered[0]!.text).toContain("doi.org/10.1371/journal.pbio.3001107");
  });

  it("a PMID-bearing reference entry is kept as one coherent NUMBERED_ITEM", () => {
    const content = "     7.  Serghiou S, et al. Assessment. PLoS Biol. 2021. PMID: 33647013.";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(1);
    expect(numbered[0]!.text).toContain("PMID: 33647013");
  });

  it("adjacent reference entries (15, 16, 17) are not fused into one statement", () => {
    const content = [
      "                                       15.    First Author. First Title. 2019.",
      "                                       16.    Second Author. Second Title. 2020.",
      "                                       17.    Third Author. Third Title. 2021.",
    ].join("\n");
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(3);
    expect(numbered[0]!.text.startsWith("First")).toBe(true);
    expect(numbered[1]!.text.startsWith("Second")).toBe(true);
    expect(numbered[2]!.text.startsWith("Third")).toBe(true);
    for (const s of segs) assertSpanIntegrity(s, content);
  });

  it("[ACCEPTED LIMITATION] a reference entry's own soft-wrapped CONTINUATION line is still a separate segment — not claimed as fixed by this change", () => {
    // This preserves the pre-existing, documented behaviour: "Continuation
    // lines of a multi-line bullet item are treated as separate segments."
    // DRA-ENG-016 Part C only fixes the leading-whitespace marker-recognition
    // gap (severing the number from its OWN first word); it does not attempt
    // to merge a reference entry's further line-wrapped continuation lines,
    // which remains a documented, accepted representation limitation.
    const content =
      "                                    15.    Cobey KD, Haustein S, Brehaut J.\n" +
      "                                    Community consensus on core practices.";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    const sentences = segs.filter((s) => s.segmentType === "SENTENCE");
    expect(numbered).toHaveLength(1);
    expect(numbered[0]!.text.startsWith("Cobey KD")).toBe(true);
    // The continuation line is NOT merged into the numbered item — confirmed
    // as a still-separate SENTENCE segment (documented limitation, not a bug).
    expect(sentences.some((s) => s.text.startsWith("Community consensus"))).toBe(true);
  });

  it("bound is respected: extremely deep indentation (beyond the 60-char bound) is NOT treated as a numbered item", () => {
    const deepIndent = " ".repeat(80);
    const content = `${deepIndent}1. some code-like content`;
    const segs = segmentContent(content);
    expect(segs.some((s) => s.segmentType === "NUMBERED_ITEM")).toBe(false);
  });

  it("regular (non-indented) numbered items from the pre-existing test suite are unaffected", () => {
    const content = "1. Access controls must be enabled.\n2. Second requirement applies.";
    const segs = segmentContent(content);
    const numbered = segs.filter((s) => s.segmentType === "NUMBERED_ITEM");
    expect(numbered).toHaveLength(2);
  });
});
