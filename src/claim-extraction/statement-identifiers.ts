/**
 * DRA-001 — Stage 2: Claim Extraction — Statement Identifier Strategy
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Defines the deterministic strategy for generating StatementId values
 * for candidate material statements extracted at Stage 2.
 *
 * Identifier format:
 *   s2:{startOffset}:{endOffset}
 *
 *   Where:
 *     - "s2" is the Stage 2 prefix (distinguishes Stage 2 identifiers from
 *       identifiers that may be produced by other pipeline stages).
 *     - startOffset is the zero-based inclusive start character offset of the
 *       statement text in the normalised generated-document content.
 *     - endOffset is the zero-based exclusive end character offset.
 *
 *   Example: s2:0:47
 *
 * Properties:
 *   - DETERMINISTIC: same content position always produces the same ID.
 *   - UNIQUE WITHIN ONE EVALUATION: no two candidate statements from a single
 *     generated document share the same (startOffset, endOffset) pair, because
 *     the segmenter produces non-overlapping segments and duplicate spans are
 *     excluded at classification.
 *   - STABLE: IDs do not depend on wall-clock time or random number generation.
 *   - HUMAN-READABLE: the format encodes the document location, aiding debugging.
 *
 * Limitations:
 *   - IDs are NOT globally unique across evaluations. If the same content
 *     appears in multiple evaluations, the same IDs will be produced for the
 *     same positions. StatementId values must be interpreted in the context
 *     of their evaluation request.
 *   - If extraction rules change (e.g. MIN_CANDIDATE_CHARS), the set of
 *     extracted statements may change, but IDs for retained statements remain
 *     stable because they encode content positions not extraction indices.
 *   - Unicode: offsets are UTF-16 code unit positions (JavaScript string
 *     semantics). Multibyte characters (emoji, CJK) are counted as per
 *     JavaScript string.length.
 */

import { StatementIdSchema } from "../model/index.js";
import type { StatementId } from "../model/index.js";

// ---------------------------------------------------------------------------
// Stage 2 statement ID prefix
// ---------------------------------------------------------------------------

/** Prefix for all statement identifiers produced by Stage 2. */
export const STAGE_2_STATEMENT_ID_PREFIX = "s2" as const;

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic StatementId from character span offsets.
 *
 * Format: `s2:{startOffset}:{endOffset}`
 *
 * @param startOffset - Zero-based inclusive start character offset.
 * @param endOffset   - Zero-based exclusive end character offset.
 * @returns           - A branded StatementId.
 */
export function makeStatementId(
  startOffset: number,
  endOffset: number,
): StatementId {
  const raw = `${STAGE_2_STATEMENT_ID_PREFIX}:${startOffset}:${endOffset}`;
  return StatementIdSchema.parse(raw);
}

// ---------------------------------------------------------------------------
// ID parsing
// ---------------------------------------------------------------------------

/**
 * Attempts to parse a Stage 2 statement ID back into its component offsets.
 * Returns null if the ID does not match the Stage 2 format.
 *
 * For diagnostic and testing use only. Not part of the evaluation pipeline.
 */
export function parseStatementId(
  id: string,
): { startOffset: number; endOffset: number } | null {
  const match = /^s2:(\d+):(\d+)$/.exec(id);
  if (match === null) return null;
  return {
    startOffset: parseInt(match[1]!, 10),
    endOffset: parseInt(match[2]!, 10),
  };
}

// ---------------------------------------------------------------------------
// Collision check
// ---------------------------------------------------------------------------

/**
 * Returns true if two statement IDs are identical.
 * Used to detect collisions in the extraction output.
 */
export function statementsCollide(idA: string, idB: string): boolean {
  return idA === idB;
}
