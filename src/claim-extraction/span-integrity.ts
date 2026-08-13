/**
 * DRA-001 — Stage 2: Claim Extraction — Span Integrity Invariants
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Validates span references to ensure they correctly locate statement text
 * within the normalised generated-document content.
 *
 * Span convention (authoritative for Version 1):
 *   - startOffset: zero-based inclusive index into the document content string.
 *   - endOffset: zero-based exclusive index (Python-slice convention).
 *   - The span text equals: content.slice(startOffset, endOffset)
 *   - Offsets are UTF-16 code unit positions (JavaScript string semantics).
 *
 * Invariants:
 *   INV-SPAN-001: startOffset must be >= 0.
 *   INV-SPAN-002: endOffset must be > startOffset.
 *   INV-SPAN-003: endOffset must be <= content.length.
 *   INV-SPAN-004: content.slice(startOffset, endOffset) must equal statement.text.
 */

import { DRA_ERROR_CODES } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import type { MaterialStatement } from "../model/index.js";

// ---------------------------------------------------------------------------
// Single span validation
// ---------------------------------------------------------------------------

/**
 * Validates a single (startOffset, endOffset) pair against the document content.
 *
 * Checks INV-SPAN-001, INV-SPAN-002, INV-SPAN-003, and INV-SPAN-004.
 *
 * @param startOffset - The claimed start offset.
 * @param endOffset   - The claimed end offset.
 * @param text        - The statement text that should appear at this span.
 * @param content     - The normalised generated-document content.
 * @param context     - Optional context string for error paths (e.g. "statements[0]").
 * @returns           - Array of validation errors (empty if valid).
 */
export function validateSpan(
  startOffset: number,
  endOffset: number,
  text: string,
  content: string,
  context = "span",
): DraValidationError[] {
  const errors: DraValidationError[] = [];

  // INV-SPAN-001: non-negative start
  if (startOffset < 0) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_SPAN,
      path: `${context}.startOffset`,
      message: `startOffset must be non-negative (received ${startOffset})`,
      received: startOffset,
    });
    return errors; // Cannot check further without valid startOffset
  }

  // INV-SPAN-002: end > start
  if (endOffset <= startOffset) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_SPAN,
      path: `${context}.endOffset`,
      message: `endOffset (${endOffset}) must be greater than startOffset (${startOffset})`,
      received: endOffset,
    });
    return errors;
  }

  // INV-SPAN-003: end within document bounds
  if (endOffset > content.length) {
    errors.push({
      code: DRA_ERROR_CODES.INVALID_SPAN,
      path: `${context}.endOffset`,
      message: `endOffset (${endOffset}) exceeds document length (${content.length})`,
      received: endOffset,
    });
    return errors;
  }

  // INV-SPAN-004: span text matches document slice
  const slice = content.slice(startOffset, endOffset);
  if (slice !== text) {
    errors.push({
      code: DRA_ERROR_CODES.SPAN_INTEGRITY_VIOLATION,
      path: `${context}`,
      message: `Statement text does not match document slice at [${startOffset}, ${endOffset}). ` +
        `Expected: ${JSON.stringify(text.slice(0, 60))}${text.length > 60 ? "…" : ""}, ` +
        `got: ${JSON.stringify(slice.slice(0, 60))}${slice.length > 60 ? "…" : ""}`,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Batch span validation
// ---------------------------------------------------------------------------

/**
 * Validates all span references across a collection of MaterialStatements.
 *
 * Statements without a spanRef are skipped (spanRef is optional in the
 * canonical model). This function validates only the statements that have
 * explicit span references.
 *
 * @param statements - Array of material statements to validate.
 * @param content    - Normalised generated-document content.
 * @returns          - All validation errors found, sorted by path.
 */
export function validateAllSpans(
  statements: ReadonlyArray<MaterialStatement>,
  content: string,
): DraValidationError[] {
  const errors: DraValidationError[] = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]!;
    const spanRef = stmt.spanRef;

    if (spanRef === undefined) continue;
    if (spanRef.startOffset === undefined || spanRef.endOffset === undefined) continue;

    const spanErrors = validateSpan(
      spanRef.startOffset,
      spanRef.endOffset,
      stmt.text,
      content,
      `statements[${i}].spanRef`,
    );
    errors.push(...spanErrors);
  }

  return errors;
}
