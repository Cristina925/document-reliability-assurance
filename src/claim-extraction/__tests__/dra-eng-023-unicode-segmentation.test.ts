/**
 * DRA-ENG-023 — Unicode-Aware Segmentation and Tokenisation: engineering
 * test coverage.
 *
 * These are synthetic engineering tests for the two DRA-ENG-023 fixes:
 *   1. classify-segments.ts: PUNCTUATION_ONLY substantive-content test is
 *      now Unicode-property-based (/[\p{L}\p{N}]/u), not ASCII-only.
 *   2. segment-content.ts: 。！？ are recognised as always-boundary sentence
 *      terminators, alongside ASCII . ! ?; 、 remains untouched (not a
 *      terminator).
 *
 * This file makes NO empirical/corpus claims — it is not a document
 * acquisition or benchmark measurement. See dra-eng-023-post-fix-
 * measurement.test.ts for the real-document (DRA-DOC-0032) measurement.
 */

import { describe, it, expect } from "vitest";
import { segmentContent } from "../segment-content.js";
import { classifySegments } from "../classify-segments.js";

function candidateTexts(text: string): string[] {
  return classifySegments(segmentContent(text))
    .filter((c) => c.status === "CANDIDATE")
    .map((c) => c.segment.text);
}

function exclusionReasonOf(text: string, needle: string): string | undefined {
  const c = classifySegments(segmentContent(text)).find((s) => s.segment.text === needle);
  return c && c.status === "EXCLUDED" ? c.exclusionReason : c?.status;
}

describe("DRA-ENG-023 — Unicode-aware PUNCTUATION_ONLY classification", () => {
  it("pure Japanese prose (kanji/hiragana/katakana, no ASCII alphanumeric) is NOT classified PUNCTUATION_ONLY", () => {
    const text = "これは人工知能に関する重要な指針です。カタカナとひらがなと漢字を含みます。";
    const reason = exclusionReasonOf(text, text);
    expect(reason).not.toBe("PUNCTUATION_ONLY");
  });

  it("Japanese text mixed with Latin letters is classified as a CANDIDATE", () => {
    const text = "AI技術の開発において重要な指針をここに示します。";
    expect(candidateTexts(text)).toContain(text);
  });

  it("Japanese text mixed with digits is classified as a CANDIDATE", () => {
    const text = "第13条に基づく指針は2025年12月19日に改定されました。";
    expect(candidateTexts(text)).toContain(text);
  });

  it("a genuinely punctuation-only segment (no letters or numbers of any script) is still PUNCTUATION_ONLY", () => {
    // "。" is now an always-boundary sentence terminator, so "。。。" splits
    // into three separate one-character sentences — each is individually
    // punctuation-only and still correctly excluded.
    const results = classifySegments(segmentContent("。。。"));
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.status === "EXCLUDED" ? r.exclusionReason : r.status).toBe("PUNCTUATION_ONLY");
    }
    expect(exclusionReasonOf("---", "---")).not.toBe("PUNCTUATION_ONLY"); // caught by HORIZONTAL_RULE first
    expect(exclusionReasonOf("・・・", "・・・")).toBe("PUNCTUATION_ONLY");
  });

  it("English text (ASCII letters) is unaffected — still classified as a CANDIDATE, never PUNCTUATION_ONLY", () => {
    const text = "This guideline applies to research and development activities.";
    expect(candidateTexts(text)).toContain(text);
  });

  it("Spanish text (Latin letters with diacritics) is unaffected", () => {
    const text = "Esta directriz se aplica a las actividades de investigación y desarrollo.";
    expect(candidateTexts(text)).toContain(text);
  });

  it("French text (Latin letters with diacritics and ligatures) is unaffected", () => {
    const text = "Cette directive s'applique aux activités de recherche et de développement.";
    expect(candidateTexts(text)).toContain(text);
  });

  it("mixed-script text (Japanese + English + Spanish fragments) is classified as a CANDIDATE", () => {
    const text = "AIガイドライン applies to investigación y desarrollo activities in 日本.";
    expect(candidateTexts(text)).toContain(text);
  });

  it("full-width Arabic-numeral digits alone count as substantive (Unicode \\p{N})", () => {
    const text = "１２３４５６７８９０";
    expect(exclusionReasonOf(text, text)).not.toBe("PUNCTUATION_ONLY");
  });

  it("other non-Latin scripts (Cyrillic, Arabic) are also recognised as substantive — proves the fix is script-agnostic, not Japanese-specific", () => {
    const cyrillic = "Это руководство применяется к научно-исследовательской деятельности.";
    const arabic = "ينطبق هذا التوجيه على أنشطة البحث والتطوير في مجال الذكاء الاصطناعي.";
    expect(exclusionReasonOf(cyrillic, cyrillic)).not.toBe("PUNCTUATION_ONLY");
    expect(exclusionReasonOf(arabic, arabic)).not.toBe("PUNCTUATION_ONLY");
  });
});

describe("DRA-ENG-023 — Ideographic sentence-boundary recognition", () => {
  it("splits pure Japanese text at 。 (ideographic full stop) into separate sentences", () => {
    const sentences = segmentContent("これは最初の文です。これは二番目の文です。")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual(["これは最初の文です。", "これは二番目の文です。"]);
  });

  it("splits at ！ (fullwidth exclamation mark) as an always-boundary, like ASCII !", () => {
    const sentences = segmentContent("危険です！すぐに確認してください。")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual(["危険です！", "すぐに確認してください。"]);
  });

  it("splits at ？ (fullwidth question mark) as an always-boundary, like ASCII ?", () => {
    const sentences = segmentContent("これは正しいですか？はい、正しいです。")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual(["これは正しいですか？", "はい、正しいです。"]);
  });

  it("does NOT split at 、 (ideographic comma) — it is a clause-internal pause, not a sentence terminator", () => {
    const sentences = segmentContent("これは、重要な、指針です。")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual(["これは、重要な、指針です。"]);
  });

  it("handles a mix of 。！？、 in one line, splitting only at the three terminators", () => {
    const sentences = segmentContent("最初の文です。次は、質問ですか？はい、そうです！最後です。")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual([
      "最初の文です。",
      "次は、質問ですか？",
      "はい、そうです！",
      "最後です。",
    ]);
  });

  it("handles genuine punctuation-only strings made of ideographic terminators without throwing or misclassifying", () => {
    expect(() => segmentContent("。！？")).not.toThrow();
    const result = classifySegments(segmentContent("。！？"));
    const seg = result.find((c) => c.segment.text.includes("。"));
    expect(seg && seg.status === "EXCLUDED" ? seg.exclusionReason : undefined).toBe("PUNCTUATION_ONLY");
  });

  it("does not affect ASCII sentence-boundary behaviour (abbreviations, decimals, initials, ! and ?)", () => {
    const sample =
      "Dr. Smith approved v2.5 of the guideline on Jan. 5, 2026. It applies broadly. Is this final? Yes! " +
      "A. B. Jones co-signed it.";
    const sentences = segmentContent(sample)
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual([
      "Dr. Smith approved v2.5 of the guideline on Jan. 5, 2026.",
      "It applies broadly.",
      "Is this final?",
      "Yes!",
      "A. B. Jones co-signed it.",
    ]);
  });

  it("English, Spanish, and French sentence splitting is unaffected by the ideographic terminator addition", () => {
    expect(
      segmentContent("This is one sentence. This is another.")
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text),
    ).toEqual(["This is one sentence.", "This is another."]);
    expect(
      segmentContent("Esta es una oración. Esta es otra.")
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text),
    ).toEqual(["Esta es una oración.", "Esta es otra."]);
    expect(
      segmentContent("Ceci est une phrase. En voici une autre.")
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text),
    ).toEqual(["Ceci est une phrase.", "En voici une autre."]);
  });

  it("mixed Japanese+Latin text splits correctly at whichever terminator (ASCII or ideographic) is present", () => {
    const sentences = segmentContent("This guideline covers AI技術です。It also covers robotics.")
      .filter((s) => s.segmentType === "SENTENCE")
      .map((s) => s.text);
    expect(sentences).toEqual(["This guideline covers AI技術です。", "It also covers robotics."]);
  });
});
