/**
 * DRA-001 — Stage 2: Claim Extraction — Content Segmentation
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Deterministic rule-based segmentation of normalised generated-document content.
 *
 * Input contract:
 *   - Content must have LF (\n) line endings (guaranteed by Stage 1 normalisation).
 *   - Content must not contain CRLF (\r\n) sequences.
 *   - Character offsets are zero-based UTF-16 code units.
 *
 * Span integrity invariant (enforced by this module):
 *   For every ContentSegment produced:
 *     content.slice(segment.startOffset, segment.endOffset) === segment.text
 *
 * Segmentation rules:
 *   1. Paragraphs are delimited by blank lines (\n\n or multiple consecutive \n).
 *   2. Within paragraphs, lines are classified by their leading pattern.
 *   3. Lines starting with # are HEADING segments.
 *   4. Lines starting with - / * / • / · are BULLET_ITEM segments.
 *   5. Lines starting with a digit and . or ) followed by space are NUMBERED_ITEM segments.
 *   6. Lines consisting only of - = * _ characters (3 or more) are HORIZONTAL_RULE.
 *   7. All other lines are processed by the sentence splitter.
 *
 * Sentence splitting within plain lines:
 *   - Splits at . ! ? followed by whitespace + uppercase OR end-of-string.
 *   - Does NOT split at . if:
 *       a. The next character is a digit (decimal or version number).
 *       b. The next non-whitespace character is lowercase.
 *       c. The word before the dot is a known English abbreviation.
 *       d. The word before the dot is a single character (initial: A. B.).
 *   - ! and ? are always sentence boundaries.
 *   - DRA-ENG-023: 。(U+3002 ideographic full stop), ！(U+FF01 fullwidth
 *     exclamation mark), and ？(U+FF1F fullwidth question mark) are always
 *     sentence boundaries, exactly like their ASCII counterparts ! and ? —
 *     unlike ASCII ".", these ideographic terminators are not used for
 *     abbreviations, decimals, or initials in the languages that use them,
 *     so no abbreviation/decimal/initial suppression logic is needed for
 *     them. 、(U+3001 ideographic comma) is intentionally NOT treated as a
 *     terminator — its grammatical role is a clause-internal pause, the
 *     same role an ASCII comma plays, and it was never treated as a
 *     sentence boundary before this change either.
 *
 * Documented limitations:
 *   - Non-English text is segmented by the same rules; accuracy varies.
 *   - Multi-line soft-wrapped sentences are split at the line boundary.
 *   - Very short fragments (< MIN_CANDIDATE_CHARS non-whitespace chars) are
 *     classified as SHORT_FRAGMENT at the classification stage, not here.
 *   - Table rows are treated as plain text (one segment per line).
 *   - Nested bullet lists produce one BULLET_ITEM per line.
 *   - Continuation lines of a multi-line bullet item are treated as separate segments.
 *
 * DRA-ENG-016 citation-marker line-wrap tolerance:
 *   Some source layouts (notably PDF text extraction) hard-wrap a physical
 *   line in the middle of a bracket-number citation marker, e.g.
 *   "articles [19,\n                    20]. Open..." — the digits after the
 *   comma and the closing bracket land on the next physical line.
 *   Before per-line classification, a narrow pre-pass detects lines that end
 *   in an OPEN, unterminated numeric citation bracket (digits/commas/dashes
 *   only, no closing "]") immediately followed by a next physical line whose
 *   leading (whitespace-stripped) content closes that same bracket
 *   (more digits/commas/dashes then "]"). When both narrow conditions hold,
 *   the two physical lines are treated as a single logical line for
 *   classification/sentence-splitting purposes — the underlying characters
 *   (including the original newline and indentation) are never altered, so
 *   the span integrity invariant (content.slice(start,end) === text) still
 *   holds exactly. This does not join lines across a blank-line (paragraph)
 *   boundary, and it never fires on non-numeric bracket content, so it does
 *   not blindly concatenate arbitrary lines.
 *
 * All operations are O(n) in document length. No recursion is used.
 */

// ---------------------------------------------------------------------------
// Segment types
// ---------------------------------------------------------------------------

/** The structural type of a content segment as produced by the segmenter. */
export type SegmentType =
  | "SENTENCE"        // Plain sentence from a paragraph line
  | "BULLET_ITEM"     // Content of a bullet-list item (marker stripped)
  | "NUMBERED_ITEM"   // Content of a numbered-list item (marker stripped)
  | "HEADING"         // Markdown-style heading line (# ... content)
  | "HORIZONTAL_RULE" // Separator line (--- === ***)
  | "EMPTY_LINE";     // Empty or whitespace-only line

/** A raw content segment produced by the segmenter before classification. */
export interface ContentSegment {
  /**
   * Exact text of this segment.
   * Invariant: content.slice(startOffset, endOffset) === text
   * where content is the normalised generated-document content.
   */
  readonly text: string;
  /** Zero-based character offset of the first character (inclusive). */
  readonly startOffset: number;
  /** Zero-based character offset after the last character (exclusive). */
  readonly endOffset: number;
  /** Structural classification of this segment. */
  readonly segmentType: SegmentType;
}

// ---------------------------------------------------------------------------
// Abbreviation set
// ---------------------------------------------------------------------------

/**
 * Words that, when immediately preceding a period, do NOT indicate a sentence
 * boundary. All entries are lowercase.
 *
 * Conservative list: false negatives (failing to split at a real boundary)
 * are preferred over false positives (splitting in the middle of a sentence).
 */
const ABBREVIATION_SET: ReadonlySet<string> = new Set([
  // Titles
  "dr", "mr", "mrs", "ms", "prof", "rev", "sr", "jr", "gen", "col",
  "sgt", "cpl", "pvt", "lt", "capt", "cdr", "adm", "pres", "gov",
  // Months
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  // Days
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
  // Common English abbreviations
  "no", "fig", "vol", "pp", "etc", "vs", "cf", "ed", "ibid", "al",
  "viz", "approx", "dept", "est", "org", "govt", "corp", "inc", "ltd",
  "assn", "univ", "inst", "tech", "intl", "natl",
  // Latin
  "ie", "eg",
  // Ordinals (handled by single-char rule: a. b. c.)
  // Technical
  "ver", "rev", "ref", "sec", "ch", "para", "app", "fig", "tab",
]);

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

/** Markdown heading: one or more # at the start of a line. */
const HEADING_RE = /^#{1,6}\s/;

/** Bullet list marker: - * • · followed by whitespace. */
const BULLET_RE = /^([-*•·])\s+/;

/**
 * Numbered list marker: digit(s) followed by . or ) and whitespace.
 *
 * DRA-ENG-016 (W2): tolerates up to 60 leading spaces/tabs before the digit
 * marker. PDF text extraction frequently renders a numbered bibliography's
 * hanging indent as literal leading whitespace (observed up to ~45 chars on
 * DRA-DOC-0026); without this tolerance such lines fell through to the
 * generic sentence splitter, which then treats "15." as ending a sentence
 * (digit-run word-before-dot is not a recognised abbreviation), severing the
 * reference number from its own first content word. The bound of 60 avoids
 * matching arbitrarily indented unrelated content (e.g. deeply nested code).
 */
const NUMBERED_RE = /^([ \t]{0,60}\d{1,3}[.)]\s+)/;

/**
 * DRA-ENG-016 (W1): matches a line ending in an OPEN, unterminated numeric
 * citation bracket — "[" followed only by digits/commas/dashes/spaces, with
 * no closing "]" anywhere after that "[". Anchored at end-of-line.
 */
const OPEN_CITATION_BRACKET_TAIL_RE =
  /\[\d{1,3}(?:\s*[–—-]\s*\d{1,3})?(?:\s*,\s*\d{1,3})*\s*[,–—-]?\s*$/;

/**
 * DRA-ENG-016 (W1): matches the leading (post-whitespace) content of a
 * continuation line that CLOSES a citation bracket opened on the prior line —
 * optional digits/separators then "]". Anchored at start-of-line (after
 * arbitrary leading whitespace only); cannot match deep into unrelated
 * content because every character between the whitespace and "]" must be a
 * digit or separator.
 */
const CLOSING_CITATION_BRACKET_HEAD_RE =
  /^[ \t]*\d{0,3}(?:\s*[,–—-]\s*\d{1,3})*\s*\]/;

/**
 * Returns true if `line` ends in an open numeric citation bracket (per
 * OPEN_CITATION_BRACKET_TAIL_RE) that is genuinely unterminated on this line
 * — i.e. there is no "]" anywhere after the "[" that starts the tail match.
 */
function endsWithUnterminatedCitationBracket(line: string): boolean {
  const match = OPEN_CITATION_BRACKET_TAIL_RE.exec(line);
  if (match === null) return false;
  const openBracketPos = line.lastIndexOf("[", match.index + match[0].length);
  if (openBracketPos === -1) return false;
  return !line.slice(openBracketPos).includes("]");
}

/** Horizontal rule: 3 or more identical separator characters (alone on line). */
const HORIZONTAL_RULE_RE = /^[-=*_]{3,}$/;

/**
 * DRA-ENG-023: Sentence-terminating punctuation characters recognised by the
 * sentence splitter. Includes ASCII "." "!" "?" plus their ideographic
 * counterparts 。(U+3002) ！(U+FF01) ？(U+FF1F). Deliberately excludes 、
 * (U+3001, ideographic comma) — its grammatical role is a clause-internal
 * pause, not a sentence boundary (see module docblock).
 *
 * Only "." requires the abbreviation/decimal/initial suppression logic in
 * isSentenceBoundaryPeriod(); every other character in this set is always a
 * boundary.
 */
const SENTENCE_TERMINATOR_CHARS: ReadonlySet<string> = new Set([
  ".", "!", "?", "。", "！", "？",
]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the word immediately before position `dotPos` in `text`.
 * Scans backwards over non-whitespace characters.
 */
function getWordBefore(text: string, dotPos: number): string {
  let end = dotPos;
  while (end > 0 && !/\s/.test(text[end - 1] ?? "")) {
    end--;
  }
  return text.slice(end, dotPos);
}

/**
 * Determines whether the period at `dotPos` in `text` marks a sentence end.
 *
 * Returns false (NOT a boundary) when:
 *   - The next non-whitespace character is a digit (decimal/version).
 *   - The next non-whitespace character is lowercase (mid-sentence).
 *   - The word before the dot is a known abbreviation.
 *   - The word before the dot is a single character (initial).
 *
 * Returns true (IS a boundary) when:
 *   - The period is the last character in the string.
 *   - The next non-whitespace character is uppercase.
 *   - The next non-whitespace character is a quote character.
 */
function isSentenceBoundaryPeriod(text: string, dotPos: number): boolean {
  const afterDot = text.slice(dotPos + 1);
  const whitespaceLen = afterDot.length - afterDot.trimStart().length;
  const afterTrimmed = afterDot.trimStart();

  // End of text
  if (afterTrimmed.length === 0) return true;

  const firstCharAfter = afterTrimmed[0]!;

  // Decimal or version number: digit follows
  if (/\d/.test(firstCharAfter)) return false;

  // Lowercase follows: likely abbreviation or mid-sentence
  if (/[a-z]/.test(firstCharAfter)) return false;

  // Comma or semicolon follows: definitely not a sentence end
  if (firstCharAfter === "," || firstCharAfter === ";") return false;

  // Check word before dot
  const wordBefore = getWordBefore(text, dotPos).toLowerCase();

  // Single character: initial (A. B. etc.)
  if (wordBefore.length === 1) return false;

  // Known abbreviation
  if (ABBREVIATION_SET.has(wordBefore)) return false;

  // Uppercase, quote, or other punctuation after whitespace: sentence boundary
  return true;

  // (whitespaceLen is declared but used implicitly via afterDot/afterTrimmed)
  void whitespaceLen;
}

/**
 * Splits a single line of text into sentence segments.
 * Returns segments with text and local (within-line) character positions.
 *
 * @param line     - The line text (no leading \n, no trailing \n).
 * @param lineBase - The absolute offset of `line[0]` in the full document content.
 */
function splitLineIntoSentences(
  line: string,
  lineBase: number,
): ContentSegment[] {
  const results: ContentSegment[] = [];
  let segStart = 0; // local position within `line` where current sentence starts

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;

    if (!SENTENCE_TERMINATOR_CHARS.has(ch)) continue;

    // Determine whether this is a sentence boundary.
    // DRA-ENG-023: "!", "?", and the ideographic terminators 。！？ are
    // always boundaries — only ASCII "." needs the abbreviation/decimal/
    // initial suppression logic in isSentenceBoundaryPeriod, because it is
    // the only terminator among these that is also overloaded for other
    // uses (abbreviations, decimals, initials) in the scripts that use it.
    const isBoundary = ch === "." ? isSentenceBoundaryPeriod(line, i) : true;

    if (!isBoundary) continue;

    // The sentence spans from segStart to i+1 (inclusive of terminal punctuation)
    const rawSeg = line.slice(segStart, i + 1);
    const trimmedSeg = rawSeg.trim();

    if (trimmedSeg.length > 0) {
      const leadingSpaces = rawSeg.length - rawSeg.trimStart().length;
      const actualLocalStart = segStart + leadingSpaces;
      const actualLocalEnd = i + 1; // position after terminal punctuation
      results.push({
        text: trimmedSeg,
        startOffset: lineBase + actualLocalStart,
        endOffset: lineBase + actualLocalEnd,
        segmentType: "SENTENCE",
      });
    }

    // Advance past the terminal punctuation and any trailing spaces
    let nextPos = i + 1;
    while (nextPos < line.length && line[nextPos] === " ") nextPos++;
    segStart = nextPos;
    // Set i to nextPos - 1 so the outer loop's i++ brings us to nextPos
    i = nextPos - 1;
  }

  // Remaining text after the last sentence boundary (no terminal punctuation)
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
// Main segmentation entry point
// ---------------------------------------------------------------------------

/**
 * Segments normalised generated-document content into ContentSegment instances.
 *
 * Deterministic: same content always produces the same segments in the same order.
 * All segments satisfy: content.slice(seg.startOffset, seg.endOffset) === seg.text
 *
 * @param content - Normalised document content (LF line endings, not CRLF).
 * @returns       - Ordered array of ContentSegment instances.
 */
export function segmentContent(content: string): ContentSegment[] {
  if (content.length === 0) return [];

  const segments: ContentSegment[] = [];
  let pos = 0;

  // Process line by line (content has LF endings from Stage 1 normalisation)
  while (pos <= content.length) {
    // Find end of current line
    const nlPos = content.indexOf("\n", pos);
    const lineEnd = nlPos === -1 ? content.length : nlPos;
    let line = content.slice(pos, lineEnd);
    const lineBase = pos; // absolute offset of line[0] in content
    let consumedEnd = lineEnd;

    // DRA-ENG-016 (W1): citation-marker line-wrap tolerance. If this line
    // ends in an open, unterminated numeric citation bracket, and the very
    // next physical line (no intervening blank line) closes that bracket in
    // its leading content, treat both physical lines as one logical line.
    // No characters are altered — `line` simply extends across the original
    // "\n" — so the span integrity invariant is preserved automatically.
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

    // Advance position past the newline
    pos = consumedEnd + 1;

    // Classify and process the line
    if (line.length === 0) {
      // Empty line (paragraph boundary)
      segments.push({
        text: "",
        startOffset: lineBase,
        endOffset: lineBase,
        segmentType: "EMPTY_LINE",
      });
      continue;
    }

    // Whitespace-only line
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      segments.push({
        text: "",
        startOffset: lineBase,
        endOffset: lineBase + line.length,
        segmentType: "EMPTY_LINE",
      });
      continue;
    }

    // Horizontal rule
    if (HORIZONTAL_RULE_RE.test(trimmedLine)) {
      segments.push({
        text: trimmedLine,
        startOffset: lineBase + (line.length - line.trimStart().length),
        endOffset: lineBase + line.trimEnd().length,
        segmentType: "HORIZONTAL_RULE",
      });
      continue;
    }

    // Heading (markdown)
    if (HEADING_RE.test(line)) {
      segments.push({
        text: trimmedLine,
        startOffset: lineBase + (line.length - line.trimStart().length),
        endOffset: lineBase + line.trimEnd().length,
        segmentType: "HEADING",
      });
      continue;
    }

    // Bullet item
    const bulletMatch = BULLET_RE.exec(line);
    if (bulletMatch !== null) {
      const markerLen = bulletMatch[0].length;
      const itemText = line.slice(markerLen).trim();
      if (itemText.length > 0) {
        // startOffset is after the marker (pointing to first non-whitespace of content)
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
        // Empty bullet (just the marker)
        segments.push({
          text: "",
          startOffset: lineBase,
          endOffset: lineBase + line.length,
          segmentType: "EMPTY_LINE",
        });
      }
      continue;
    }

    // Numbered list item
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
        segments.push({
          text: "",
          startOffset: lineBase,
          endOffset: lineBase + line.length,
          segmentType: "EMPTY_LINE",
        });
      }
      continue;
    }

    // Plain text: sentence-split the line
    const sentences = splitLineIntoSentences(line, lineBase);
    segments.push(...sentences);
  }

  return segments;
}
