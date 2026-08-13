/**
 * DRA-001 — Stage 3: Authority Resolution — Authority Span Validation
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Validates authority span references against the normalised document content.
 *
 * Authority span invariant:
 *   content.slice(authoritySpan.startOffset, authoritySpan.endOffset) === authorityText
 *
 * Offsets are zero-based UTF-16 code unit positions.
 */

import { DRA_ERROR_CODES } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";

// ---------------------------------------------------------------------------
// Authority span validation
// ---------------------------------------------------------------------------

/**
 * Validates a single authority (startOffset, endOffset, text) triple
 * against the normalised document content.
 *
 * Checks:
 *   1. startOffset >= 0
 *   2. endOffset > startOffset
 *   3. endOffset <= content.length
 *   4. content.slice(startOffset, endOffset) === authorityText
 *
 * @param startOffset  - Zero-based inclusive start.
 * @param endOffset    - Zero-based exclusive end.
 * @param authorityText - Expected text at the span.
 * @param content      - Normalised generated-document content.
 * @param context      - Path prefix for error messages.
 * @returns Array of validation errors (empty if valid).
 */
export function validateAuthoritySpan(
  startOffset: number,
  endOffset: number,
  authorityText: string,
  content: string,
  context = "authoritySpan",
): DraValidationError[] {
  const errors: DraValidationError[] = [];

  if (startOffset < 0) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN,
      path: `${context}.startOffset`,
      message: `Authority span startOffset must be non-negative (received ${startOffset})`,
      received: startOffset,
    });
    return errors;
  }

  if (endOffset <= startOffset) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN,
      path: `${context}.endOffset`,
      message: `Authority span endOffset (${endOffset}) must be greater than startOffset (${startOffset})`,
      received: endOffset,
    });
    return errors;
  }

  if (endOffset > content.length) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_AUTHORITY_SPAN,
      path: `${context}.endOffset`,
      message: `Authority span endOffset (${endOffset}) exceeds document length (${content.length})`,
      received: endOffset,
    });
    return errors;
  }

  const slice = content.slice(startOffset, endOffset);
  if (slice !== authorityText) {
    errors.push({
      code: DRA_ERROR_CODES.AUTHORITY_SPAN_INTEGRITY_VIOLATION,
      path: context,
      message:
        `Authority text does not match document slice at [${startOffset}, ${endOffset}). ` +
        `Expected: ${JSON.stringify(authorityText.slice(0, 60))}${authorityText.length > 60 ? "…" : ""}, ` +
        `got: ${JSON.stringify(slice.slice(0, 60))}${slice.length > 60 ? "…" : ""}`,
    });
  }

  return errors;
}
