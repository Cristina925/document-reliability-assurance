/**
 * DRA-001 — Stage 4: Evidence Linkage — Evidence Span Validation
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Validates evidence span references against the normalised document content.
 *
 * Evidence span invariant:
 *   content.slice(startOffset, endOffset) === evidenceText
 *
 * Offsets are zero-based UTF-16 code unit positions.
 */

import { DRA_ERROR_CODES } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";

// ---------------------------------------------------------------------------
// Evidence span validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evidence (startOffset, endOffset, text) triple
 * against the normalised document content.
 *
 * Checks:
 *   1. startOffset >= 0
 *   2. endOffset > startOffset
 *   3. endOffset <= content.length
 *   4. content.slice(startOffset, endOffset) === evidenceText
 *
 * @param startOffset  - Zero-based inclusive start.
 * @param endOffset    - Zero-based exclusive end.
 * @param evidenceText - Expected text at the span.
 * @param content      - Normalised generated-document content.
 * @param context      - Path prefix for error messages.
 * @returns Array of validation errors (empty if valid).
 */
export function validateEvidenceSpan(
  startOffset: number,
  endOffset: number,
  evidenceText: string,
  content: string,
  context = "evidenceSpan",
): DraValidationError[] {
  const errors: DraValidationError[] = [];

  if (startOffset < 0) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN,
      path: `${context}.startOffset`,
      message: `Evidence span startOffset must be non-negative (received ${startOffset})`,
      received: startOffset,
    });
    return errors;
  }

  if (endOffset <= startOffset) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN,
      path: `${context}.endOffset`,
      message: `Evidence span endOffset (${endOffset}) must be greater than startOffset (${startOffset})`,
      received: endOffset,
    });
    return errors;
  }

  if (endOffset > content.length) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_EVIDENCE_SPAN,
      path: `${context}.endOffset`,
      message: `Evidence span endOffset (${endOffset}) exceeds document length (${content.length})`,
      received: endOffset,
    });
    return errors;
  }

  const slice = content.slice(startOffset, endOffset);
  if (slice !== evidenceText) {
    errors.push({
      code: DRA_ERROR_CODES.EVIDENCE_SPAN_INTEGRITY_VIOLATION,
      path: context,
      message:
        `Evidence text does not match document slice at [${startOffset}, ${endOffset}). ` +
        `Expected: ${JSON.stringify(evidenceText.slice(0, 60))}${evidenceText.length > 60 ? "\u2026" : ""}, ` +
        `got: ${JSON.stringify(slice.slice(0, 60))}${slice.length > 60 ? "\u2026" : ""}`,
    });
  }

  return errors;
}
