/**
 * DRA-ENG-019 Part C — Frozen Reference Oracle
 *
 * This is a byte-for-byte copy of `detectSemanticParaphrase` and its
 * dependencies EXACTLY as they existed in
 * `src/evidence-linkage/semantic-paraphrase.ts` immediately before the
 * DRA-ENG-019 performance optimisation (the O(n) per-call, brute-force
 * nested-loop implementation with no caching or indexing).
 *
 * Purpose: an independent, deliberately UNoptimised oracle to prove the
 * optimised implementation produces byte-identical output for every input,
 * across both real corpus data and synthetic edge cases. This file must
 * NEVER be updated to match the optimised implementation — it is the fixed
 * point of comparison.
 *
 * DO NOT import this file from production code. Test-support only.
 */

// ---------------------------------------------------------------------------
// Phrase equivalence map (verbatim copy)
// ---------------------------------------------------------------------------

const PHRASE_EQUIVALENCE_MAP: ReadonlyArray<readonly [RegExp, string]> = Object.freeze([
  [/\bdoes\s+not\s+have\s+the\s+right\s+to\b/gi, "may not"],
  [/\bdo\s+not\s+have\s+the\s+right\s+to\b/gi, "may not"],
  [/\bis\s+not\s+entitled\s+to\b/gi, "may not"],
  [/\bare\s+not\s+entitled\s+to\b/gi, "may not"],
  [/\bnot\s+legally\s+required\s+to\b/gi, "not required to"],
  [/\bnot\s+permitted\s+to\b/gi, "may not"],
  [/\bhas\s+the\s+right\s+to\b/gi, "may"],
  [/\bhave\s+the\s+right\s+to\b/gi, "may"],
  [/\bis\s+entitled\s+to\b/gi, "may"],
  [/\bare\s+entitled\s+to\b/gi, "may"],
  [/\bis\s+permitted\s+to\b/gi, "may"],
  [/\bare\s+permitted\s+to\b/gi, "may"],
] as const);

const NEGATION_TOKENS: ReadonlySet<string> = new Set([
  "not",
  "no",
  "never",
  "without",
  "prohibited",
  "forbidden",
]);

function detectPolarity(text: string): "negative" | "positive" {
  const tokens = text.toLowerCase().split(/\W+/);
  for (const tok of tokens) {
    if (NEGATION_TOKENS.has(tok)) return "negative";
  }
  return "positive";
}

const CONTENT_STOPWORDS: ReadonlySet<string> = new Set([
  "a", "an", "the", "in", "on", "at", "to", "of", "for", "and", "or", "but", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "shall", "should", "may", "can", "could", "it", "its", "that", "this", "these",
  "those", "by", "with", "as", "from", "into", "about", "if", "when", "where", "which",
  "who", "whom", "whose", "he", "she", "they", "we", "you", "i", "me", "him", "her", "us",
  "them", "my", "your", "his", "their", "our", "any", "all", "each", "every", "both",
  "more", "most", "some", "such", "than", "then", "there", "here", "while", "after",
  "before", "during", "since", "until", "however", "therefore", "thus", "also", "only",
  "even", "just", "upon", "within", "between", "among", "against", "through", "across",
  "without", "under", "over", "above", "below", "around", "along", "per", "via", "like",
  "plus", "except", "either", "neither", "whether", "though", "although", "because",
  "so", "yet", "nor", "not", "no", "very", "much", "quite", "own", "need", "used",
]);

const MIN_TERM_LENGTH = 4;

function canonicalise(text: string): string {
  let t = text.toLowerCase();
  for (const [pattern, replacement] of PHRASE_EQUIVALENCE_MAP) {
    (pattern as RegExp).lastIndex = 0;
    t = t.replace(pattern as RegExp, replacement);
  }
  return t;
}

function extractContentTerms(canonicalisedText: string): string[] {
  return canonicalisedText
    .split(/[\s.,;:!?()[\]{}"'""''\-—–/\\|@#$%^&*+=<>~`]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= MIN_TERM_LENGTH && !CONTENT_STOPWORDS.has(w));
}

function extractContentBigrams(terms: string[]): string[] {
  if (terms.length < 2) return [];
  const bigrams: string[] = [];
  for (let i = 0; i < terms.length - 1; i++) {
    bigrams.push(`${terms[i]!} ${terms[i + 1]!}`);
  }
  return bigrams;
}

interface TextChunk {
  readonly text: string;
  readonly startIndex: number;
}

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
    cursor += para.length + 2;
  }

  return chunks;
}

const MIN_SHARED_TERMS = 3;
const MIN_SHARED_BIGRAMS = 1;
const MIN_STATEMENT_TERMS = 2;

export interface ReferenceSemanticParaphraseResult {
  readonly sourceIndex: number;
  readonly sourceChunkStart: number;
  readonly matchedText: string;
  readonly sharedBigrams: ReadonlyArray<string>;
  readonly sharedTerms: ReadonlyArray<string>;
}

/**
 * Frozen reference oracle — verbatim pre-DRA-ENG-019 brute-force algorithm.
 */
export function referenceDetectSemanticParaphrase(
  statementText: string,
  sourceTexts: ReadonlyArray<string>,
): ReferenceSemanticParaphraseResult | null {
  if (sourceTexts.length === 0) return null;

  const canonStmt = canonicalise(statementText);
  const stmtTerms = extractContentTerms(canonStmt);
  if (stmtTerms.length < MIN_STATEMENT_TERMS) return null;

  const stmtBigramSet = new Set(extractContentBigrams(stmtTerms));
  const stmtTermSet = new Set(stmtTerms);
  const stmtPolarity = detectPolarity(statementText);

  for (let srcIdx = 0; srcIdx < sourceTexts.length; srcIdx++) {
    const srcText = sourceTexts[srcIdx]!;
    const chunks = splitSourceIntoChunks(srcText);

    for (const chunk of chunks) {
      const canonChunk = canonicalise(chunk.text);
      const chunkTerms = extractContentTerms(canonChunk);
      const chunkBigramSet = new Set(extractContentBigrams(chunkTerms));
      const chunkTermSet = new Set(chunkTerms);

      const sharedBigrams = [...stmtBigramSet].filter((b) => chunkBigramSet.has(b));
      if (sharedBigrams.length < MIN_SHARED_BIGRAMS) continue;

      const sharedTerms = stmtTerms.filter((t) => chunkTermSet.has(t));
      if (sharedTerms.length < MIN_SHARED_TERMS) continue;

      const chunkPolarity = detectPolarity(chunk.text);
      if (stmtPolarity !== chunkPolarity) continue;

      const matchedText = chunk.text.length > 200 ? `${chunk.text.slice(0, 200)}…` : chunk.text;

      return Object.freeze({
        sourceIndex: srcIdx,
        sourceChunkStart: chunk.startIndex,
        matchedText,
        sharedBigrams: Object.freeze(sharedBigrams),
        sharedTerms: Object.freeze(sharedTerms),
      });
    }
  }

  return null;
}
