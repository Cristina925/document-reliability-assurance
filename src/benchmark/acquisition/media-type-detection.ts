/**
 * DRA-ENG-011 — Robust Media-Type Detection for Controlled Acquisition
 * Module: media-type-detection.ts — narrow, deterministic fallback classifier
 *
 * Resolves the reproducible DRA-ACQ-014 Phase 2 acquisition blocker: a source
 * server (ec.europa.eu newsroom) serves genuine PDF bytes with a malformed
 * `Content-Type: application/` header (missing subtype). The DRA-ENG-010
 * fetcher's existing media-type allowlist (SUPPORTED_MEDIA_TYPES) is correct
 * to reject anything it cannot positively identify — this module adds ONLY a
 * narrow, deterministic fallback for the case where the Content-Type header
 * itself is malformed or absent, never for a syntactically valid header.
 *
 * Decision order (see classifyMediaType):
 *   A. Syntactically valid + supported Content-Type   → accept (unchanged).
 *   B. Syntactically valid + unsupported Content-Type → reject (unchanged).
 *   C. Malformed or absent Content-Type               → PDF-only fallback:
 *        classify as application/pdf ONLY if BOTH agree:
 *          1. Content-Disposition names a file ending in ".pdf", AND
 *          2. the response bytes begin with the standard PDF signature
 *             ("%PDF-", 0x25 0x50 0x44 0x46 0x2D) at byte offset 0.
 *        If either signal is missing or they disagree, reject.
 *
 * This module never widens SUPPORTED_MEDIA_TYPES, never overrides a
 * syntactically valid (even if unsupported) Content-Type, never sniffs
 * arbitrary formats, and never infers from the URL or filename alone.
 */

import { isSupportedMediaType, type SupportedMediaType } from "./schema.js";

// ---------------------------------------------------------------------------
// PDF signature ("%PDF-") — the standard PDF file-header magic bytes.
// ---------------------------------------------------------------------------

export const PDF_SIGNATURE_BYTES: readonly number[] = [0x25, 0x50, 0x44, 0x46, 0x2d];

/**
 * True only if `bytes` begins with the standard PDF signature ("%PDF-") at
 * offset 0. Deliberately strict — no scanning ahead into the payload, no
 * tolerance for leading bytes, to keep the fallback deterministic and narrow.
 */
export function hasPdfSignatureAtStart(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_SIGNATURE_BYTES.length) return false;
  for (let i = 0; i < PDF_SIGNATURE_BYTES.length; i++) {
    if (bytes[i] !== PDF_SIGNATURE_BYTES[i]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Content-Type syntax validation
// ---------------------------------------------------------------------------

/**
 * A syntactically valid MIME media type has the form `type/subtype`, where
 * both `type` and `subtype` are non-empty RFC 2045 token characters.
 * Parameters (e.g. "; charset=utf-8") must already be stripped by the caller.
 *
 * "application/" is NOT syntactically valid (empty subtype) — this is
 * exactly the malformed value observed from the DRA-ACQ-014 source server.
 * An absent/empty header is also NOT syntactically valid.
 */
const MEDIA_TYPE_SYNTAX_RE = /^[a-zA-Z0-9!#$&\-^_.+]+\/[a-zA-Z0-9!#$&\-^_.+]+$/;

export function isSyntacticallyValidMediaType(value: string): boolean {
  if (!value) return false;
  return MEDIA_TYPE_SYNTAX_RE.test(value);
}

// ---------------------------------------------------------------------------
// Content-Disposition filename extraction
// ---------------------------------------------------------------------------

/**
 * Extracts a filename from a Content-Disposition header value, if present.
 * Handles both `filename="..."` and the extended `filename*=UTF-8''...` form.
 * Returns undefined if no filename parameter is present or the header itself
 * is absent.
 */
export function extractContentDispositionFilename(
  contentDisposition: string | undefined,
): string | undefined {
  if (!contentDisposition) return undefined;

  // Extended form: filename*=UTF-8''encoded-name (RFC 5987/6266).
  const extendedMatch = contentDisposition.match(/filename\*\s*=\s*[^']*''([^;]+)/i);
  if (extendedMatch?.[1]) {
    try {
      return decodeURIComponent(extendedMatch[1].trim());
    } catch {
      return extendedMatch[1].trim();
    }
  }

  // Standard form: filename="name" or filename=name (quotes optional).
  const standardMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  if (standardMatch?.[1]) {
    return standardMatch[1].trim();
  }

  return undefined;
}

/**
 * True only if the Content-Disposition header names a file whose extension
 * is exactly ".pdf" (case-insensitive). Does not consult the URL or any
 * other signal — Content-Disposition only.
 */
export function contentDispositionNamesPdf(
  contentDisposition: string | undefined,
): boolean {
  const filename = extractContentDispositionFilename(contentDisposition);
  if (!filename) return false;
  return filename.toLowerCase().endsWith(".pdf");
}

// ---------------------------------------------------------------------------
// classifyMediaType — the single decision point used by both the mock and
// production fetchers
// ---------------------------------------------------------------------------

export interface MediaTypeClassificationInput {
  /** Raw Content-Type header value, with parameters already stripped and lowercased. Empty string if absent. */
  readonly mediaTypeHeader: string;
  /** Raw Content-Disposition header value, if present. */
  readonly contentDisposition: string | undefined;
  /**
   * Response bytes. Required only to evaluate the malformed/absent fallback
   * path (case C); ignored when the header is syntactically valid (cases A/B).
   * May be omitted (undefined) when bytes are not yet available — in that
   * case, fallback classification simply cannot succeed and case C rejects.
   */
  readonly bytes: Uint8Array | undefined;
}

export type MediaTypeClassificationResult =
  | {
      readonly ok: true;
      readonly mediaType: SupportedMediaType;
      /** "header" = accepted directly from a valid, supported Content-Type. "fallback-pdf" = classified via the narrow PDF fallback. */
      readonly classifiedVia: "header" | "fallback-pdf";
    }
  | {
      readonly ok: false;
      /**
       * "unsupported"      = Content-Type was syntactically valid but not in the allowlist (case B, unchanged behaviour).
       * "fallback-failed"  = Content-Type was malformed/absent and the narrow PDF fallback evidence did not both agree (case C).
       */
      readonly reason: "unsupported" | "fallback-failed";
      /** The raw (post-normalisation) media type header value that was rejected. Empty string if the header was absent. */
      readonly rawValue: string;
    };

/**
 * Applies the DRA-ENG-011 decision order to classify a response's media type.
 *
 * Never widens SUPPORTED_MEDIA_TYPES. Never overrides a syntactically valid
 * Content-Type — even an unsupported one — using the PDF fallback. Only
 * consults bytes/Content-Disposition when the Content-Type header itself is
 * malformed or absent.
 */
export function classifyMediaType(
  input: MediaTypeClassificationInput,
): MediaTypeClassificationResult {
  const { mediaTypeHeader, contentDisposition, bytes } = input;

  // ── Case A / B: syntactically valid Content-Type — unchanged behaviour ──
  if (isSyntacticallyValidMediaType(mediaTypeHeader)) {
    if (isSupportedMediaType(mediaTypeHeader)) {
      return { ok: true, mediaType: mediaTypeHeader, classifiedVia: "header" };
    }
    return { ok: false, reason: "unsupported", rawValue: mediaTypeHeader };
  }

  // ── Case C: malformed or absent Content-Type — narrow PDF fallback only ──
  const dispositionNamesPdf = contentDispositionNamesPdf(contentDisposition);
  const bytesLookLikePdf = bytes !== undefined && hasPdfSignatureAtStart(bytes);

  if (dispositionNamesPdf && bytesLookLikePdf) {
    return { ok: true, mediaType: "application/pdf", classifiedVia: "fallback-pdf" };
  }

  return { ok: false, reason: "fallback-failed", rawValue: mediaTypeHeader };
}
