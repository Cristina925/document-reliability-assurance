/**
 * DRA-001 — Stage 4: Evidence Linkage — Semantic Paraphrase Detection
 *
 * Milestone: DRA-FIX-002 — Deterministic Semantic Evidence Matching
 *
 * Implements a deterministic phrase-canonicalisation + content-term-overlap
 * matcher that recognises evidence relationships where the generated text is
 * a controlled paraphrase or grammatical restatement of source material.
 *
 * Design constraints (DRA-FIX-002):
 *   - No external model calls, embeddings, or nondeterministic inference.
 *   - No network dependencies.
 *   - No general-purpose synonym databases.
 *   - Polarity is preserved: "may answer" ≢ "may not answer".
 *   - Identical inputs produce identical outputs (deterministic).
 *
 * Root cause addressed:
 *   Stage 4 previously matched evidence only by citation/reference patterns
 *   (numbered citations, section references, legislation names, etc.) found
 *   within the statement text.  Plain-English paraphrases of source passages
 *   contain none of these markers and therefore received NO_DOCUMENT_EVIDENCE.
 *   This module provides a deterministic fallback that detects substantive
 *   semantic overlap between a paraphrase and a source passage.
 */

// ---------------------------------------------------------------------------
// Phrase equivalence map
// ---------------------------------------------------------------------------

/**
 * Controlled modal / entitlement / prohibition equivalences.
 *
 * Each entry: [sourcePattern, canonicalForm].
 * Applied in order — more specific (longer) patterns appear first so that
 * "does not have the right to" is substituted before "have the right to".
 *
 * Polarity is preserved: negative entitlement phrases map to "may not";
 * positive entitlement phrases map to "may".  These produce distinct
 * canonical forms so polarity detection remains accurate after substitution.
 */
export const PHRASE_EQUIVALENCE_MAP: ReadonlyArray<readonly [RegExp, string]> =
  Object.freeze([
    // ── Negative entitlement / prohibition (more specific first) ────────────
    [/\bdoes\s+not\s+have\s+the\s+right\s+to\b/gi,  "may not"],
    [/\bdo\s+not\s+have\s+the\s+right\s+to\b/gi,    "may not"],
    [/\bis\s+not\s+entitled\s+to\b/gi,              "may not"],
    [/\bare\s+not\s+entitled\s+to\b/gi,             "may not"],
    [/\bnot\s+legally\s+required\s+to\b/gi,         "not required to"],
    [/\bnot\s+permitted\s+to\b/gi,                  "may not"],
    // ── Positive entitlement ────────────────────────────────────────────────
    [/\bhas\s+the\s+right\s+to\b/gi,                "may"],
    [/\bhave\s+the\s+right\s+to\b/gi,               "may"],
    [/\bis\s+entitled\s+to\b/gi,                    "may"],
    [/\bare\s+entitled\s+to\b/gi,                   "may"],
    [/\bis\s+permitted\s+to\b/gi,                   "may"],
    [/\bare\s+permitted\s+to\b/gi,                  "may"],
  ] as const);

// ---------------------------------------------------------------------------
// Polarity detection
// ---------------------------------------------------------------------------

/**
 * Tokens that mark negative polarity.
 * Checked against individual whitespace-split tokens after lowercasing.
 * "may not" is detected via the individual token "not".
 */
export const NEGATION_TOKENS: ReadonlySet<string> = new Set([
  "not",
  "no",
  "never",
  "without",
  "prohibited",
  "forbidden",
]);

/**
 * Returns the polarity of the text.
 *
 * "negative" if any NEGATION_TOKEN appears as a word; "positive" otherwise.
 * Detection uses the ORIGINAL (pre-canonicalisation) text to avoid polarity
 * loss when phrase substitutions remove the negation word.
 */
export function detectPolarity(text: string): "negative" | "positive" {
  const tokens = text.toLowerCase().split(/\W+/);
  for (const tok of tokens) {
    if (NEGATION_TOKENS.has(tok)) return "negative";
  }
  return "positive";
}

// ---------------------------------------------------------------------------
// Content term extraction
// ---------------------------------------------------------------------------

/**
 * Words that carry little semantic weight and are excluded from term overlap.
 * Intentionally minimal: removes common grammatical words only.
 * Modal verbs ("must", "shall") and content-carrying auxiliaries are retained.
 */
export const CONTENT_STOPWORDS: ReadonlySet<string> = new Set([
  "a","an","the","in","on","at","to","of","for","and","or","but","is","are",
  "was","were","be","been","being","have","has","had","do","does","did","will",
  "would","shall","should","may","can","could","it","its","that","this","these",
  "those","by","with","as","from","into","about","if","when","where","which",
  "who","whom","whose","he","she","they","we","you","i","me","him","her","us",
  "them","my","your","his","their","our","any","all","each","every","both",
  "more","most","some","such","than","then","there","here","while","after",
  "before","during","since","until","however","therefore","thus","also","only",
  "even","just","upon","within","between","among","against","through","across",
  "without","under","over","above","below","around","along","per","via","like",
  "plus","except","either","neither","whether","though","although","because",
  "so","yet","nor","not","no","very","much","quite","own","need","used",
]);

/** Minimum character length for a token to qualify as a content term. */
const MIN_TERM_LENGTH = 4;

/**
 * Canonicalises text by applying phrase equivalences then lowercasing.
 * No stemming is performed — only controlled phrase substitutions.
 */
export function canonicalise(text: string): string {
  let t = text.toLowerCase();
  for (const [pattern, replacement] of PHRASE_EQUIVALENCE_MAP) {
    (pattern as RegExp).lastIndex = 0;
    t = t.replace(pattern as RegExp, replacement);
  }
  return t;
}

/**
 * Tokenises a canonicalised string into content terms.
 * Strips punctuation, removes short tokens and stopwords.
 * Returns tokens in document order.
 */
export function extractContentTerms(canonicalisedText: string): string[] {
  return canonicalisedText
    .split(/[\s.,;:!?()[\]{}"'""''\-—–/\\|@#$%^&*+=<>~`]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= MIN_TERM_LENGTH && !CONTENT_STOPWORDS.has(w));
}

/**
 * Produces ordered consecutive bigrams from a content-term array.
 * Format: "term1 term2" (single space separator).
 */
export function extractContentBigrams(terms: string[]): string[] {
  if (terms.length < 2) return [];
  const bigrams: string[] = [];
  for (let i = 0; i < terms.length - 1; i++) {
    bigrams.push(`${terms[i]!} ${terms[i + 1]!}`);
  }
  return bigrams;
}

// ---------------------------------------------------------------------------
// Source text chunking
// ---------------------------------------------------------------------------

interface TextChunk {
  readonly text: string;
  /** Approximate character offset in the original source text. */
  readonly startIndex: number;
}

/**
 * Splits source text into analysable chunks.
 *
 * Primary: double-newline paragraph boundaries.
 * Fallback: 400-character sliding window (step 100) for paragraphs > 800 chars.
 * Single-newline breaks are included in the current paragraph.
 */
function splitSourceIntoChunks(sourceText: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  const paragraphs = sourceText.split(/\n\n+/);
  let cursor = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed.length > 0) {
      if (trimmed.length <= 800) {
        chunks.push({ text: trimmed, startIndex: cursor });
      } else {
        const WINDOW = 400;
        const STEP = 100;
        for (let s = 0; s < trimmed.length; s += STEP) {
          chunks.push({
            text: trimmed.slice(s, s + WINDOW),
            startIndex: cursor + s,
          });
          if (s + WINDOW >= trimmed.length) break;
        }
      }
    }
    cursor += para.length + 2; // +2 for the \n\n separator
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Matching thresholds
// ---------------------------------------------------------------------------

/** Minimum shared content TERMS required for a semantic match. */
export const MIN_SHARED_TERMS = 3;

/** Minimum shared content BIGRAMS required for a semantic match. */
export const MIN_SHARED_BIGRAMS = 1;

/** Minimum content terms in the statement for matching to be attempted. */
export const MIN_STATEMENT_TERMS = 2;

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

/**
 * Describes a semantic paraphrase match found in a source document.
 * Returned by detectSemanticParaphrase when a match is found.
 */
export interface SemanticParaphraseResult {
  /** Zero-based index into the sourceTexts array of the matching source. */
  readonly sourceIndex: number;
  /** Approximate character offset of the matched chunk in the source text. */
  readonly sourceChunkStart: number;
  /** Truncated matched text from the source (≤200 chars, for traceability). */
  readonly matchedText: string;
  /** Content bigrams shared between the statement and the source chunk. */
  readonly sharedBigrams: ReadonlyArray<string>;
  /** Content terms shared between the statement and the source chunk. */
  readonly sharedTerms: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// DRA-ENG-019 — Per-source-array chunk index cache
// ---------------------------------------------------------------------------
//
// `linkEvidence` (link-evidence.ts) builds a single `sourceTexts` array once
// per evaluation and passes THE SAME array reference into every one of its
// per-statement `detectSemanticParaphrase` calls. Before DRA-ENG-019, this
// function re-derived the full chunk analysis (splitting, canonicalisation,
// term/bigram extraction) of every source text on every call, even though
// the source content is identical across all calls in that loop — this was
// the confirmed root cause of Stage 4's O(n^2) scaling on large documents
// (see docs/dra/DRA-ENG-019-STAGE4-SCALABILITY-REPORT.md, Part A).
//
// This cache keys on the array's OBJECT IDENTITY (a WeakMap), not its
// content, so it requires no change to the function's signature or return
// semantics: distinct calls with distinct `sourceTexts` arrays (as used by
// every test in this codebase, and by every independent evaluation run)
// remain fully independent and unaffected by any other call's cache state.
// Determinism and purity are preserved because the cached index is a pure,
// order-preserving function of the source content — building it once or a
// thousand times for the same array produces byte-identical results.
//
// Chunks are additionally indexed by content bigram so that, for a given
// statement, only chunks sharing at least one bigram with it are examined.
// Because MIN_SHARED_BIGRAMS = 1 is a hard requirement for ANY match, this
// is an EXACT filter (every chunk that could possibly qualify is still
// examined) — not an approximation, heuristic, or probabilistic shortcut.
// Candidates are visited in ascending global chunk order (source order,
// then in-source chunk order), so the original "first qualifying chunk in
// left-to-right order" determinism guarantee is preserved exactly.
// ---------------------------------------------------------------------------

interface AnalysedChunk {
  readonly srcIdx: number;
  readonly chunk: TextChunk;
  readonly termSet: ReadonlySet<string>;
  readonly bigramSet: ReadonlySet<string>;
  readonly polarity: "positive" | "negative";
}

interface SourceChunkIndex {
  /** All chunks across all source texts, in global (source, chunk) order. */
  readonly chunks: ReadonlyArray<AnalysedChunk>;
  /** bigram -> ascending list of indices into `chunks` containing it. */
  readonly bigramIndex: ReadonlyMap<string, ReadonlyArray<number>>;
}

function buildSourceChunkIndex(sourceTexts: ReadonlyArray<string>): SourceChunkIndex {
  const chunks: AnalysedChunk[] = [];
  const bigramIndex = new Map<string, number[]>();

  for (let srcIdx = 0; srcIdx < sourceTexts.length; srcIdx++) {
    const srcText = sourceTexts[srcIdx]!;
    const rawChunks = splitSourceIntoChunks(srcText);

    for (const chunk of rawChunks) {
      const canonChunk = canonicalise(chunk.text);
      const chunkTerms = extractContentTerms(canonChunk);
      const chunkBigramSet = new Set(extractContentBigrams(chunkTerms));
      const chunkTermSet = new Set(chunkTerms);
      const chunkPolarity = detectPolarity(chunk.text);

      const globalIndex = chunks.length;
      chunks.push({
        srcIdx,
        chunk,
        termSet: chunkTermSet,
        bigramSet: chunkBigramSet,
        polarity: chunkPolarity,
      });

      for (const bigram of chunkBigramSet) {
        let list = bigramIndex.get(bigram);
        if (!list) {
          list = [];
          bigramIndex.set(bigram, list);
        }
        list.push(globalIndex);
      }
    }
  }

  return { chunks, bigramIndex };
}

/**
 * WeakMap cache keyed by the `sourceTexts` array's object identity.
 * Not exported; internal performance optimisation only.
 */
const sourceChunkIndexCache = new WeakMap<ReadonlyArray<string>, SourceChunkIndex>();

function getSourceChunkIndex(sourceTexts: ReadonlyArray<string>): SourceChunkIndex {
  let index = sourceChunkIndexCache.get(sourceTexts);
  if (!index) {
    index = buildSourceChunkIndex(sourceTexts);
    sourceChunkIndexCache.set(sourceTexts, index);
  }
  return index;
}

// ---------------------------------------------------------------------------
// Main detector
// ---------------------------------------------------------------------------

/**
 * Attempts to find a semantic paraphrase match for a statement in source docs.
 *
 * Returns the FIRST match found (left-to-right source order, left-to-right
 * chunk order) for deterministic output on identical inputs.
 *
 * Returns null when:
 *   - No source texts are provided.
 *   - The statement has fewer than MIN_STATEMENT_TERMS content terms.
 *   - No source chunk meets both the shared-term and shared-bigram thresholds
 *     AND the polarity requirement.
 *
 * Polarity guarantee: a positive-polarity statement will never match a
 * negative-polarity source chunk, and vice versa.
 * Prevents: "may answer questions" from matching "may not answer questions".
 *
 * Overmatching prevention: shared terms must include at least MIN_SHARED_TERMS
 * non-trivial content words AND at least MIN_SHARED_BIGRAMS consecutive
 * content-word pairs, ensuring topic-only overlap (e.g. "companion, meeting,
 * questions") without a shared proposition does not qualify.
 *
 * Performance (DRA-ENG-019): the per-source chunk analysis (splitting,
 * canonicalisation, term/bigram extraction) is cached per `sourceTexts`
 * array reference and reused across calls, and a bigram inverted index
 * narrows candidate chunks to only those that could possibly qualify
 * (MIN_SHARED_BIGRAMS = 1 makes this an exact, lossless filter). This
 * changes only the internal traversal strategy, not the matching semantics,
 * thresholds, or the left-to-right determinism guarantee.
 *
 * @param statementText - Exact statement text from Stage 2.
 * @param sourceTexts   - Normalised source document content strings.
 */
export function detectSemanticParaphrase(
  statementText: string,
  sourceTexts: ReadonlyArray<string>,
): SemanticParaphraseResult | null {
  if (sourceTexts.length === 0) return null;

  const canonStmt = canonicalise(statementText);
  const stmtTerms = extractContentTerms(canonStmt);
  if (stmtTerms.length < MIN_STATEMENT_TERMS) return null;

  const stmtBigramSet = new Set(extractContentBigrams(stmtTerms));
  const stmtPolarity = detectPolarity(statementText);

  const { chunks, bigramIndex } = getSourceChunkIndex(sourceTexts);

  // ── Candidate narrowing: union of chunks sharing >=1 bigram with the ──────
  // statement. Exact filter — no chunk outside this set could ever satisfy
  // MIN_SHARED_BIGRAMS >= 1, so nothing that could match is excluded.
  const candidateIndices = new Set<number>();
  for (const bigram of stmtBigramSet) {
    const list = bigramIndex.get(bigram);
    if (list) {
      for (const idx of list) candidateIndices.add(idx);
    }
  }
  if (candidateIndices.size === 0) return null;

  // Visit in ascending global order == original left-to-right
  // (source order, then in-source chunk order) traversal order.
  const orderedCandidates = Array.from(candidateIndices).sort((a, b) => a - b);

  for (const idx of orderedCandidates) {
    const candidate = chunks[idx]!;

    // ── Shared content bigrams ──────────────────────────────────────────────
    const sharedBigrams = [...stmtBigramSet].filter((b) => candidate.bigramSet.has(b));
    if (sharedBigrams.length < MIN_SHARED_BIGRAMS) continue;

    // ── Shared content terms ────────────────────────────────────────────────
    const sharedTerms = stmtTerms.filter((t) => candidate.termSet.has(t));
    if (sharedTerms.length < MIN_SHARED_TERMS) continue;

    // ── Polarity (checked against original, non-canonicalised text) ────────
    if (stmtPolarity !== candidate.polarity) continue;

    // ── Match found — return deterministically (first qualifying chunk) ────
    const matchedText =
      candidate.chunk.text.length > 200 ? `${candidate.chunk.text.slice(0, 200)}…` : candidate.chunk.text;

    return Object.freeze({
      sourceIndex: candidate.srcIdx,
      sourceChunkStart: candidate.chunk.startIndex,
      matchedText,
      sharedBigrams: Object.freeze(sharedBigrams),
      sharedTerms: Object.freeze(sharedTerms),
    });
  }

  return null;
}
