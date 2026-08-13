/**
 * DRA-001 — Benchmark Corpus Near-Duplicate Governance
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Implements deterministic near-duplicate detection using character-level
 * 3-gram Jaccard similarity on normalised text.  No external APIs, embeddings,
 * or AI calls are used.
 *
 * Algorithm:
 *   1. Normalise text: lowercase, strip non-word/non-space characters, collapse
 *      whitespace.
 *   2. Compute the set of overlapping character n-grams (default n=3).
 *   3. Compute Jaccard similarity: |A ∩ B| / |A ∪ B|.
 *   4. Classify against fixed thresholds.
 *
 * Thresholds (inclusive lower bound):
 *   Exact content match (string equality)   → EXACT_DUPLICATE  (similarity 1.0)
 *   Jaccard ≥ NEAR_DUPLICATE_JACCARD_THRESHOLD (0.80)  → NEAR_DUPLICATE
 *   Jaccard ≥ MANUAL_REVIEW_JACCARD_THRESHOLD  (0.60)  → REQUIRES_MANUAL_REVIEW
 *   Jaccard <  MANUAL_REVIEW_JACCARD_THRESHOLD          → NOT_DUPLICATE
 *
 * Limitations (explicitly documented):
 *   - n-gram similarity does not imply semantic equivalence.
 *   - Short documents may produce spuriously high similarities.
 *   - Very long documents with minor edits may fall below thresholds.
 *   - The algorithm does not detect document-level paraphrase.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Size of character n-grams used for fingerprinting. */
export const NGRAM_SIZE = 3;

/**
 * Jaccard threshold above which a candidate is classified NEAR_DUPLICATE.
 * Candidates at or above this threshold are automatically rejected.
 */
export const NEAR_DUPLICATE_JACCARD_THRESHOLD = 0.8;

/**
 * Jaccard threshold above which a candidate requires manual review.
 * Candidates between this value and NEAR_DUPLICATE_JACCARD_THRESHOLD
 * are not automatically rejected but are flagged for human review.
 */
export const MANUAL_REVIEW_JACCARD_THRESHOLD = 0.6;

// ---------------------------------------------------------------------------
// DuplicateStatus
// ---------------------------------------------------------------------------

export type DuplicateStatus =
  | "NOT_DUPLICATE"
  | "EXACT_DUPLICATE"
  | "NEAR_DUPLICATE"
  | "REQUIRES_MANUAL_REVIEW";

// ---------------------------------------------------------------------------
// DuplicateAssessment
// ---------------------------------------------------------------------------

/**
 * The result of a near-duplicate comparison between two documents.
 * All fields are retained as comparison evidence per the governance protocol.
 */
export interface DuplicateAssessment {
  /** The duplicate classification outcome. */
  readonly status: DuplicateStatus;
  /** Jaccard coefficient in the range [0, 1]. */
  readonly similarity: number;
  /** Number of distinct n-grams in the candidate document. */
  readonly candidateNgramCount: number;
  /** Number of distinct n-grams in the reference document. */
  readonly referenceNgramCount: number;
  /** Size of the n-gram intersection |A ∩ B|. */
  readonly intersectionCount: number;
  /** Size of the n-gram union |A ∪ B|. */
  readonly unionCount: number;
}

// ---------------------------------------------------------------------------
// normaliseText
// ---------------------------------------------------------------------------

/**
 * Normalises text for duplicate fingerprinting.
 *
 * Steps:
 *   1. Lowercase the entire string.
 *   2. Replace any character that is not a word character (\w) or space with a
 *      single space.
 *   3. Collapse consecutive whitespace to a single space.
 *   4. Trim leading and trailing whitespace.
 *
 * This is deterministic and produces the same output for the same input on
 * every platform.
 */
export function normaliseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// computeNgramSet
// ---------------------------------------------------------------------------

/**
 * Produces the set of all overlapping n-grams (substrings of length `n`)
 * present in the given text.
 *
 * Arrays produce a Set, so duplicate n-grams are counted once.
 * If the text is shorter than n, the result is an empty set.
 *
 * @param text  Pre-normalised text.
 * @param n     N-gram size (default: NGRAM_SIZE).
 */
export function computeNgramSet(text: string, n: number = NGRAM_SIZE): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i <= text.length - n; i++) {
    set.add(text.slice(i, i + n));
  }
  return set;
}

// ---------------------------------------------------------------------------
// jaccardSimilarity
// ---------------------------------------------------------------------------

/**
 * Computes the Jaccard similarity coefficient between two n-gram sets.
 *
 * J(A, B) = |A ∩ B| / |A ∪ B|
 *
 * Special cases:
 *   - Both sets empty → 1.0 (identical empty documents).
 *   - One set empty, one non-empty → 0.0.
 *
 * @returns  A float in [0, 1].
 */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  if (union === 0) return 1;
  return intersection / union;
}

// ---------------------------------------------------------------------------
// assessDuplicate
// ---------------------------------------------------------------------------

/**
 * Assesses whether two documents are duplicates or near-duplicates.
 *
 * String equality triggers EXACT_DUPLICATE immediately (no normalisation step
 * needed — the raw strings are byte-for-byte identical).
 *
 * For all other pairs the algorithm normalises, computes n-gram sets, and
 * applies Jaccard classification.
 *
 * @param candidateContent  Raw content of the candidate document.
 * @param referenceContent  Raw content of the reference document.
 * @returns                 A DuplicateAssessment with retained comparison evidence.
 */
export function assessDuplicate(
  candidateContent: string,
  referenceContent: string,
): DuplicateAssessment {
  // Exact string match → EXACT_DUPLICATE.
  if (candidateContent === referenceContent) {
    const ngrams = computeNgramSet(normaliseText(candidateContent));
    return {
      status: "EXACT_DUPLICATE",
      similarity: 1,
      candidateNgramCount: ngrams.size,
      referenceNgramCount: ngrams.size,
      intersectionCount: ngrams.size,
      unionCount: ngrams.size,
    };
  }

  const normA = normaliseText(candidateContent);
  const normB = normaliseText(referenceContent);
  const setA = computeNgramSet(normA);
  const setB = computeNgramSet(normB);

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  const similarity = jaccardSimilarity(setA, setB);

  let status: DuplicateStatus;
  if (similarity >= NEAR_DUPLICATE_JACCARD_THRESHOLD) {
    status = "NEAR_DUPLICATE";
  } else if (similarity >= MANUAL_REVIEW_JACCARD_THRESHOLD) {
    status = "REQUIRES_MANUAL_REVIEW";
  } else {
    status = "NOT_DUPLICATE";
  }

  return {
    status,
    similarity,
    candidateNgramCount: setA.size,
    referenceNgramCount: setB.size,
    intersectionCount,
    unionCount,
  };
}
