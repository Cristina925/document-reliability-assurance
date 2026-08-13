/**
 * DRA-001 — Stage 2: Claim Extraction — Segment Classification
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Classifies ContentSegments as candidate material statements or excluded segments.
 *
 * Candidate status: A segment is a CANDIDATE if it may assert a proposition
 * of fact, specification, or requirement. Stage 2 does not determine whether
 * an assertion is correct, supported, or material — that is for Stages 3–7.
 *
 * Exclusion criteria (deterministic, documented):
 *   1. EMPTY — zero-length text.
 *   2. WHITESPACE_ONLY — text contains only whitespace characters.
 *   3. PUNCTUATION_ONLY — text contains no Unicode letters or numbers
 *      (DRA-ENG-023: Unicode-aware, not ASCII-only — see note below).
 *   4. HEADING — segment type is HEADING.
 *   5. HORIZONTAL_RULE — segment type is HORIZONTAL_RULE.
 *   6. PAGE_NUMBER — text matches a page-number pattern.
 *   7. SHORT_FRAGMENT — text has fewer than MIN_CANDIDATE_CHARS non-whitespace characters.
 *   8. DUPLICATE_SPAN — same (startOffset, endOffset) pair already seen.
 *
 * Inclusion decisions (conservative, documented as limitations):
 *   - Questions (ending in ?) are included — rhetorical questions embed assertions.
 *   - Commands/imperatives are included — requirements often use imperative mood.
 *   - Quotations (text in quotes) are included — the quoted assertion is the claim.
 *   - Disclaimers are included — disclaimers assert limitations.
 *   - Captions are included — captions assert document structure.
 *   - Parenthetical statements are captured as part of their containing sentence.
 *
 * Version 1 limitation: linguistic taxonomy detection is not implemented.
 * Classification is structural only. A future milestone may implement
 * syntactic classification using a controlled vocabulary.
 */

import type { ContentSegment } from "./segment-content.js";
import type { ExclusionReason } from "./extraction-record.js";

// ---------------------------------------------------------------------------
// Classification constants
// ---------------------------------------------------------------------------

/**
 * Minimum number of non-whitespace characters for a segment to be considered
 * a candidate material statement.
 *
 * Segments with fewer than this many characters are excluded as SHORT_FRAGMENT
 * because they are unlikely to express a complete, evaluable proposition.
 *
 * Version 1 value: 3. Conservative — keeps short but non-trivial fragments
 * (e.g. "OK." "Yes." "No.") as candidates.
 *
 * Implementation limitation: This threshold may include some non-propositional
 * fragments and may exclude some very short valid assertions. Documented as
 * an implementation choice, not a scientific conclusion.
 */
export const MIN_CANDIDATE_CHARS = 3;

/** Regex that matches common page-number patterns. */
const PAGE_NUMBER_RE =
  /^[Pp]age\s+\d+(\s+(of|\/)\s+\d+)?\.?$|^\d+\s*(of|\/)\s*\d+\s*(pages?)?$/;

/**
 * DRA-ENG-023: Unicode-aware substantive-content test.
 *
 * Matches any Unicode letter (\p{L}, all scripts — Latin, kanji, hiragana,
 * katakana, Cyrillic, Arabic, etc.) or Unicode number (\p{N}, including
 * full-width and non-ASCII decimal digits).
 *
 * Root cause this replaces (DRA-ACQ-028 Phase 2 on DRA-DOC-0032): the
 * previous test, /[a-zA-Z0-9]/, recognised only ASCII letters and digits as
 * "substantive content". A segment consisting entirely of kanji/hiragana/
 * katakana — with no incidental ASCII letter or digit — matched nothing and
 * was excluded as PUNCTUATION_ONLY even though it was ordinary prose. This
 * caused 75.4% of DRA-DOC-0032's Japanese-script content (by character
 * count) to be silently discarded before Stage 2 statement construction,
 * while the same check produced 0% loss on the same document's English
 * translation. See docs/dra/DRA-ENG-023-UNICODE-AWARE-SEGMENTATION-CLOSURE-REPORT.md.
 *
 * Standards-based (Unicode General Category via the `u` regex flag), not an
 * enumeration of Japanese-specific character ranges — this generalises to
 * any script with letters/numbers recognised by the Unicode Character
 * Database, not just Japanese.
 */
const SUBSTANTIVE_CONTENT_RE = /[\p{L}\p{N}]/u;

// ---------------------------------------------------------------------------
// Classification result
// ---------------------------------------------------------------------------

/** Whether a segment is a candidate material statement or excluded. */
export type CandidateStatus = "CANDIDATE" | "EXCLUDED";

/** A segment with its classification result. */
export interface ClassifiedSegment {
  /** The original content segment. */
  readonly segment: ContentSegment;
  /** Whether the segment is a candidate material statement. */
  readonly status: CandidateStatus;
  /** Reason for exclusion (only present when status is "EXCLUDED"). */
  readonly exclusionReason?: ExclusionReason;
}

// ---------------------------------------------------------------------------
// Segment classification
// ---------------------------------------------------------------------------

/**
 * Classifies a collection of ContentSegments.
 *
 * Processes segments in order. Duplicate (startOffset, endOffset) pairs
 * are detected and the second occurrence is excluded with reason DUPLICATE_SPAN.
 *
 * @param segments - Ordered segments from segmentContent().
 * @returns        - Classified segments in the same order.
 */
export function classifySegments(
  segments: ReadonlyArray<ContentSegment>,
): ClassifiedSegment[] {
  const seenSpans = new Set<string>();

  return segments.map((seg): ClassifiedSegment => {
    const exclusionReason = getExclusionReason(seg, seenSpans);

    if (exclusionReason !== undefined) {
      return { segment: seg, status: "EXCLUDED", exclusionReason };
    }

    // Mark span as seen (only for candidates; excluded segments don't consume a span slot)
    const spanKey = `${seg.startOffset}:${seg.endOffset}`;
    seenSpans.add(spanKey);
    return { segment: seg, status: "CANDIDATE" };
  });
}

/**
 * Returns the exclusion reason for a segment, or undefined if it is a candidate.
 *
 * Pure function — does not modify any state beyond the seenSpans set.
 */
function getExclusionReason(
  seg: ContentSegment,
  seenSpans: Set<string>,
): ExclusionReason | undefined {
  // 1. HEADING segments
  if (seg.segmentType === "HEADING") return "HEADING";

  // 2. HORIZONTAL_RULE segments
  if (seg.segmentType === "HORIZONTAL_RULE") return "HORIZONTAL_RULE";

  // 3. EMPTY segments
  if (seg.text.length === 0 || seg.segmentType === "EMPTY_LINE") return "EMPTY";

  // 4. WHITESPACE_ONLY
  if (seg.text.trim().length === 0) return "WHITESPACE_ONLY";

  // 5. PUNCTUATION_ONLY (no Unicode letters or numbers — DRA-ENG-023)
  if (!SUBSTANTIVE_CONTENT_RE.test(seg.text)) return "PUNCTUATION_ONLY";

  // 6. PAGE_NUMBER
  if (PAGE_NUMBER_RE.test(seg.text.trim())) return "PAGE_NUMBER";

  // 7. SHORT_FRAGMENT
  const nonWhitespaceCount = seg.text.replace(/\s/g, "").length;
  if (nonWhitespaceCount < MIN_CANDIDATE_CHARS) return "SHORT_FRAGMENT";

  // 8. DUPLICATE_SPAN
  const spanKey = `${seg.startOffset}:${seg.endOffset}`;
  if (seenSpans.has(spanKey)) return "DUPLICATE_SPAN";

  return undefined;
}
