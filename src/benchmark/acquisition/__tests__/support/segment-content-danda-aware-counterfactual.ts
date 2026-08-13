/**
 * DRA-ACQ-029 Phase 2 test support — ANALYSIS-ONLY danda-aware counterfactual
 * segmenter.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THIS FILE IS NOT PRODUCTION CODE.                                       ║
 * ║  It is not imported by, referenced from, or reachable from any file      ║
 * ║  under src/claim-extraction, src/pipeline, or any other production       ║
 * ║  evaluator module. It exists solely so the DRA-ACQ-029 Phase 2 baseline  ║
 * ║  experiment can measure, by direct comparison, what segmentation would   ║
 * ║  look like IF the production sentence splitter also treated the          ║
 * ║  Devanagari danda (। U+0964) and double danda (॥ U+0965) as sentence     ║
 * ║  terminators — without touching segment-content.ts itself.               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Provenance: this is a verbatim structural fork of
 * ../../../claim-extraction/segment-content.ts as it exists after DRA-ENG-023
 * (Unicode \p{L}/\p{N} classification, ideographic terminators 。！？ already
 * present), with exactly ONE change: the SENTENCE_TERMINATOR_CHARS set gains
 * "।" (U+0964 DEVANAGARI DANDA) and "॥" (U+0965 DEVANAGARI DOUBLE DANDA).
 * Both are always-boundary terminators here (matching how 。！？ are treated
 * in production) — Devanagari does not overload the danda for abbreviations,
 * decimals, or initials the way ASCII "." is overloaded, so no
 * abbreviation/decimal/initial suppression logic is needed for it either,
 * exactly mirroring the DRA-ENG-023 rationale for 。！？.
 *
 * No other behaviour differs from production segmentContent(). This keeps
 * the counterfactual narrowly scoped to the single variable under test
 * (danda-as-terminator), so any measured difference in segment/statement
 * counts is attributable to that one change and nothing else.
 */

// ---------------------------------------------------------------------------
// Segment types (duplicated here, structurally identical to production
// ContentSegment/SegmentType, so this file has zero production imports)
// ---------------------------------------------------------------------------

export type CounterfactualSegmentType =
  | "SENTENCE"
  | "BULLET_ITEM"
  | "NUMBERED_ITEM"
  | "HEADING"
  | "HORIZONTAL_RULE"
  | "EMPTY_LINE";

export interface CounterfactualContentSegment {
  readonly text: string;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly segmentType: CounterfactualSegmentType;
}

// ---------------------------------------------------------------------------
// Abbreviation set — identical to production
// ---------------------------------------------------------------------------

const ABBREVIATION_SET: ReadonlySet<string> = new Set([
  "dr", "mr", "mrs", "ms", "prof", "rev", "sr", "jr", "gen", "col",
  "sgt", "cpl", "pvt", "lt", "capt", "cdr", "adm", "pres", "gov",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
  "no", "fig", "vol", "pp", "etc", "vs", "cf", "ed", "ibid", "al",
  "viz", "approx", "dept", "est", "org", "govt", "corp", "inc", "ltd",
  "assn", "univ", "inst", "tech", "intl", "natl",
  "ie", "eg",
  "ver", "rev", "ref", "sec", "ch", "para", "app", "fig", "tab",
]);

// ---------------------------------------------------------------------------
// Regex patterns — identical to production
// ---------------------------------------------------------------------------

const HEADING_RE = /^#{1,6}\s/;
const BULLET_RE = /^([-*•·])\s+/;
const NUMBERED_RE = /^([ \t]{0,60}\d{1,3}[.)]\s+)/;
const OPEN_CITATION_BRACKET_TAIL_RE =
  /\[\d{1,3}(?:\s*[–—-]\s*\d{1,3})?(?:\s*,\s*\d{1,3})*\s*[,–—-]?\s*$/;
const CLOSING_CITATION_BRACKET_HEAD_RE =
  /^[ \t]*\d{0,3}(?:\s*[,–—-]\s*\d{1,3})*\s*\]/;
const HORIZONTAL_RULE_RE = /^[-=*_]{3,}$/;

/**
 * ONLY CHANGE from production: "।" (U+0964) and "॥" (U+0965) added as
 * always-boundary terminators, on the same footing as 。！？ (DRA-ENG-023).
 */
const SENTENCE_TERMINATOR_CHARS: ReadonlySet<string> = new Set([
  ".", "!", "?", "。", "！", "？", "।", "॥",
]);

// ---------------------------------------------------------------------------
// Internal helpers — identical to production
// ---------------------------------------------------------------------------

function endsWithUnterminatedCitationBracket(line: string): boolean {
  const match = OPEN_CITATION_BRACKET_TAIL_RE.exec(line);
  if (match === null) return false;
  const openBracketPos = line.lastIndexOf("[", match.index + match[0].length);
  if (openBracketPos === -1) return false;
  return !line.slice(openBracketPos).includes("]");
}

function getWordBefore(text: string, dotPos: number): string {
  let end = dotPos;
  while (end > 0 && !/\s/.test(text[end - 1] ?? "")) {
    end--;
  }
  return text.slice(end, dotPos);
}

function isSentenceBoundaryPeriod(text: string, dotPos: number): boolean {
  const afterDot = text.slice(dotPos + 1);
  const afterTrimmed = afterDot.trimStart();

  if (afterTrimmed.length === 0) return true;

  const firstCharAfter = afterTrimmed[0]!;

  if (/\d/.test(firstCharAfter)) return false;
  if (/[a-z]/.test(firstCharAfter)) return false;
  if (firstCharAfter === "," || firstCharAfter === ";") return false;

  const wordBefore = getWordBefore(text, dotPos).toLowerCase();

  if (wordBefore.length === 1) return false;
  if (ABBREVIATION_SET.has(wordBefore)) return false;

  return true;
}

function splitLineIntoSentences(
  line: string,
  lineBase: number,
): CounterfactualContentSegment[] {
  const results: CounterfactualContentSegment[] = [];
  let segStart = 0;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;

    if (!SENTENCE_TERMINATOR_CHARS.has(ch)) continue;

    // Danda/double-danda are always boundaries, exactly like ।/॥'s
    // ideographic siblings 。！？ — only ASCII "." needs suppression logic.
    const isBoundary = ch === "." ? isSentenceBoundaryPeriod(line, i) : true;

    if (!isBoundary) continue;

    const rawSeg = line.slice(segStart, i + 1);
    const trimmedSeg = rawSeg.trim();

    if (trimmedSeg.length > 0) {
      const leadingSpaces = rawSeg.length - rawSeg.trimStart().length;
      const actualLocalStart = segStart + leadingSpaces;
      const actualLocalEnd = i + 1;
      results.push({
        text: trimmedSeg,
        startOffset: lineBase + actualLocalStart,
        endOffset: lineBase + actualLocalEnd,
        segmentType: "SENTENCE",
      });
    }

    let nextPos = i + 1;
    while (nextPos < line.length && line[nextPos] === " ") nextPos++;
    segStart = nextPos;
    i = nextPos - 1;
  }

  if (segStart < line.length) {
    const rawSeg = line.slice(segStart);
    const trimmedSeg = rawSeg.trim();
    if (trimmedSeg.length > 0) {
      const leadingSpaces = rawSeg.length - rawSeg.trimStart().length;
      const trailingSpaces = rawSeg.length - rawSeg.trimEnd().length;
      const actualLocalStart = segStart + leadingSpaces;
      const actualLocalEnd = segStart + rawSeg.length - trailingSpaces;
      results.push({
        text: trimmedSeg,
        startOffset: lineBase + actualLocalStart,
        endOffset: lineBase + actualLocalEnd,
        segmentType: "SENTENCE",
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main entry point — identical control flow to production segmentContent()
// ---------------------------------------------------------------------------

/**
 * ANALYSIS-ONLY. Structurally identical to production segmentContent(),
 * except danda (।) and double danda (॥) are treated as always-boundary
 * sentence terminators. Never call this from, or import this into, any
 * production evaluator path.
 */
export function segmentContentDandaAwareCounterfactual(
  content: string,
): CounterfactualContentSegment[] {
  if (content.length === 0) return [];

  const segments: CounterfactualContentSegment[] = [];
  let pos = 0;

  while (pos <= content.length) {
    const nlPos = content.indexOf("\n", pos);
    const lineEnd = nlPos === -1 ? content.length : nlPos;
    let line = content.slice(pos, lineEnd);
    const lineBase = pos;
    let consumedEnd = lineEnd;

    if (nlPos !== -1 && endsWithUnterminatedCitationBracket(line)) {
      const nextLineStart = lineEnd + 1;
      const nextNlPos = content.indexOf("\n", nextLineStart);
      const nextLineEnd = nextNlPos === -1 ? content.length : nextNlPos;
      const nextLine = content.slice(nextLineStart, nextLineEnd);
      if (
        nextLine.trim().length > 0 &&
        CLOSING_CITATION_BRACKET_HEAD_RE.test(nextLine)
      ) {
        line = content.slice(lineBase, nextLineEnd);
        consumedEnd = nextLineEnd;
      }
    }

    pos = consumedEnd + 1;

    if (line.length === 0) {
      segments.push({ text: "", startOffset: lineBase, endOffset: lineBase, segmentType: "EMPTY_LINE" });
      continue;
    }

    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      segments.push({ text: "", startOffset: lineBase, endOffset: lineBase + line.length, segmentType: "EMPTY_LINE" });
      continue;
    }

    if (HORIZONTAL_RULE_RE.test(trimmedLine)) {
      segments.push({
        text: trimmedLine,
        startOffset: lineBase + (line.length - line.trimStart().length),
        endOffset: lineBase + line.trimEnd().length,
        segmentType: "HORIZONTAL_RULE",
      });
      continue;
    }

    if (HEADING_RE.test(line)) {
      segments.push({
        text: trimmedLine,
        startOffset: lineBase + (line.length - line.trimStart().length),
        endOffset: lineBase + line.trimEnd().length,
        segmentType: "HEADING",
      });
      continue;
    }

    const bulletMatch = BULLET_RE.exec(line);
    if (bulletMatch !== null) {
      const markerLen = bulletMatch[0].length;
      const itemText = line.slice(markerLen).trim();
      if (itemText.length > 0) {
        const contentPart = line.slice(markerLen);
        const leadingInContent = contentPart.length - contentPart.trimStart().length;
        const itemLocalStart = markerLen + leadingInContent;
        const itemLocalEnd = markerLen + contentPart.trimEnd().length;
        segments.push({
          text: itemText,
          startOffset: lineBase + itemLocalStart,
          endOffset: lineBase + itemLocalEnd,
          segmentType: "BULLET_ITEM",
        });
      } else {
        segments.push({ text: "", startOffset: lineBase, endOffset: lineBase + line.length, segmentType: "EMPTY_LINE" });
      }
      continue;
    }

    const numberedMatch = NUMBERED_RE.exec(line);
    if (numberedMatch !== null) {
      const markerLen = numberedMatch[0].length;
      const itemText = line.slice(markerLen).trim();
      if (itemText.length > 0) {
        const contentPart = line.slice(markerLen);
        const leadingInContent = contentPart.length - contentPart.trimStart().length;
        const itemLocalStart = markerLen + leadingInContent;
        const itemLocalEnd = markerLen + contentPart.trimEnd().length;
        segments.push({
          text: itemText,
          startOffset: lineBase + itemLocalStart,
          endOffset: lineBase + itemLocalEnd,
          segmentType: "NUMBERED_ITEM",
        });
      } else {
        segments.push({ text: "", startOffset: lineBase, endOffset: lineBase + line.length, segmentType: "EMPTY_LINE" });
      }
      continue;
    }

    const sentences = splitLineIntoSentences(line, lineBase);
    segments.push(...sentences);
  }

  return segments;
}
