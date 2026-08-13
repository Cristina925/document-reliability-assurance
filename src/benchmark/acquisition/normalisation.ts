/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: normalisation.ts — Byte-level content normalisation
 *
 * Converts raw source bytes into a canonical normalised text document.
 * Reuses computeContentDigest from governance/eligibility.ts for the text
 * digest — does not reimplement the digest primitive.
 *
 * Supported transformations:
 *   - UTF-8 BOM removal (0xEF 0xBB 0xBF)
 *   - CRLF → LF line-ending normalisation
 *   - HTML: tag stripping, entity decoding, whitespace condensing
 *   - Markdown: passthrough with CRLF normalisation only
 *   - Plain text: passthrough with CRLF normalisation only
 *   - PDF: delegated to injectable PdfExtractor
 *
 * Invariants:
 *   - Empty normalised text is a typed error, not an exception.
 *   - Source bytes are never modified; only the normalised output differs.
 *   - normalisationVersion is recorded in every NormalisedDocument.
 */

import { computeContentDigest } from "../governance/eligibility.js";
import type { SupportedMediaType } from "./schema.js";
import {
  reconstructDocumentReadingOrder,
  type PdfLayoutProber,
  type LayoutReconstructionMethod,
  type LayoutConfidence,
} from "./column-layout-reconstruction.js";

// ---------------------------------------------------------------------------
// Normalisation version
// ---------------------------------------------------------------------------

/** Identifier of the normalisation algorithm version. */
export const NORMALISATION_VERSION = "DRA-NORM-v1" as const;

// ---------------------------------------------------------------------------
// PdfExtractor — injectable for PDF support
// ---------------------------------------------------------------------------

/**
 * An injectable function that extracts plain text from PDF bytes.
 * Must return the extracted text string.
 * Should throw if extraction fails — the normalisation layer will catch it.
 */
export type PdfExtractor = (bytes: Uint8Array) => Promise<string> | string;

// ---------------------------------------------------------------------------
// DRA-ENG-024 — optional layout/reading-order assessment
// ---------------------------------------------------------------------------

/**
 * Optional, opt-in assessment of multi-column reading-order handling for a
 * PDF document. Populated only when a PdfLayoutProber is supplied to
 * normaliseContent; absent (undefined) for every non-PDF media type and for
 * every existing caller that does not pass a prober — this preserves exact
 * backward-compatible behaviour (identical output, identical digests) for
 * every already-admitted corpus document.
 *
 * This is a decoupled, versioned side-channel — the same architectural
 * pattern as DRA-ENG-015/017's representation assessments — never folded
 * into textDigest/normalisationVersion, so it can evolve independently of
 * the frozen normalisation algorithm identity.
 */
export interface LayoutReadingOrderAssessment {
  /** Highest-signal per-page method observed across the document: if any
   * page was reconstructed, "COLUMN_RECONSTRUCTED"; else if any page was
   * left ambiguous/tabular, that method; else "SINGLE_COLUMN_PASSTHROUGH". */
  readonly method: LayoutReconstructionMethod;
  readonly confidence: LayoutConfidence;
  readonly columnsDetected: number;
  readonly anyPageReconstructed: boolean;
  readonly anyPageUncertain: boolean;
  readonly detectorVersion: string;
}

// ---------------------------------------------------------------------------
// NormalisedDocument
// ---------------------------------------------------------------------------

export interface NormalisedDocument {
  /** SHA-256 hex digest of the original raw source bytes. */
  readonly sourceDigest: string;
  /** Normalisation algorithm version. */
  readonly normalisationVersion: typeof NORMALISATION_VERSION;
  /** The normalised, canonical plain-text content. */
  readonly text: string;
  /** SHA-256 hex digest of the normalised text (via computeContentDigest). */
  readonly textDigest: string;
  /** Character encoding of the normalised text output (always "utf-8"). */
  readonly encoding: "utf-8";
  /** Non-fatal warnings produced during normalisation. */
  readonly warnings: readonly string[];
  /** DRA-ENG-024 — present only when a PdfLayoutProber was supplied for a
   * PDF document; undefined otherwise (see LayoutReadingOrderAssessment). */
  readonly layoutReadingOrder?: LayoutReadingOrderAssessment;
}

// ---------------------------------------------------------------------------
// NormalisationResult
// ---------------------------------------------------------------------------

export type NormalisationResult =
  | { readonly ok: true; readonly document: NormalisedDocument }
  | {
      readonly ok: false;
      readonly code: NormalisationErrorCode;
      readonly message: string;
    };

export type NormalisationErrorCode =
  | "EMPTY_NORMALISED_TEXT"
  | "PDF_EXTRACTION_FAILED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "DECODE_ERROR";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strips UTF-8 BOM (EF BB BF) and normalises CRLF → LF.
 */
function stripBomAndNormaliseCrlf(text: string): string {
  // Remove UTF-8 BOM if present.
  const withoutBom = text.startsWith("\uFEFF") ? text.slice(1) : text;
  // Normalise CRLF → LF.
  return withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Decodes common HTML entities.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(parseInt(code, 10)),
    );
}

/**
 * Strips HTML tags, preserving readable text content.
 *
 * Algorithm:
 *   1. Remove <script>, <style>, and <noscript> blocks entirely.
 *   2. Replace block-level tags with newlines to preserve paragraph structure.
 *   3. Strip all remaining tags.
 *   4. Decode HTML entities.
 *   5. Condense multiple blank lines to at most two.
 */
function stripHtml(html: string): string {
  let text = html;

  // Remove script, style, noscript blocks.
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Block-level tags → newline.
  text = text.replace(
    /<\/?(p|div|h[1-6]|li|tr|br|hr|blockquote|section|article|header|footer|main|nav|aside)[^>]*>/gi,
    "\n",
  );

  // Strip all remaining tags.
  text = text.replace(/<[^>]+>/g, "");

  // Decode entities.
  text = decodeHtmlEntities(text);

  // Condense whitespace: multiple spaces → single space per line.
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  // Collapse runs of 3+ newlines to 2.
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}

// ---------------------------------------------------------------------------
// normaliseContent
// ---------------------------------------------------------------------------

/**
 * Normalises raw source bytes into a canonical NormalisedDocument.
 *
 * The sourceDigest parameter must be the SHA-256 hex digest of the raw bytes,
 * computed by computeSourceDigest() before this call (so the caller holds
 * the byte-level digest independently of normalisation).
 *
 * @param bytes          Raw source bytes (unmodified).
 * @param mediaType      Supported media type (from fetcher/schema).
 * @param sourceDigest   Pre-computed SHA-256 hex of raw bytes.
 * @param pdfExtractor   Required for "application/pdf"; ignored otherwise.
 * @param pdfLayoutProber DRA-ENG-024, optional. When supplied for a PDF,
 *                        attempts document-independent multi-column
 *                        reading-order reconstruction (see
 *                        column-layout-reconstruction.ts) and records the
 *                        outcome on layoutReadingOrder. Omitting it (the
 *                        default) reproduces prior behaviour exactly.
 * @returns              NormalisationResult — ok:true or typed error.
 */
export async function normaliseContent(
  bytes: Uint8Array,
  mediaType: SupportedMediaType,
  sourceDigest: string,
  pdfExtractor?: PdfExtractor,
  pdfLayoutProber?: PdfLayoutProber,
): Promise<NormalisationResult> {
  const warnings: string[] = [];
  let rawText: string;
  let layoutReadingOrder: LayoutReadingOrderAssessment | undefined;

  try {
    switch (mediaType) {
      case "text/html": {
        const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        const withoutBomCrlf = stripBomAndNormaliseCrlf(decoded);
        rawText = stripHtml(withoutBomCrlf);
        break;
      }

      case "text/markdown":
      case "text/plain": {
        const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
        rawText = stripBomAndNormaliseCrlf(decoded);
        break;
      }

      case "application/pdf": {
        if (pdfExtractor === undefined) {
          warnings.push(
            "No PdfExtractor provided; falling back to raw UTF-8 decode of PDF bytes (result may be garbled)",
          );
          const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
          rawText = stripBomAndNormaliseCrlf(decoded);
        } else {
          try {
            const extracted = await pdfExtractor(bytes);
            rawText = stripBomAndNormaliseCrlf(extracted);
          } catch (err) {
            const message =
              err instanceof Error ? err.message : String(err);
            return {
              ok: false,
              code: "PDF_EXTRACTION_FAILED",
              message: `PDF text extraction failed: ${message}`,
            };
          }

          // DRA-ENG-024: optional, opt-in multi-column reading-order
          // reconstruction. Only engaged when a prober is supplied; failure
          // to probe or reconstruct falls back to the plain-text extraction
          // above (rawText already set), with the uncertainty disclosed via
          // a warning rather than silently trusted or silently discarded.
          if (pdfLayoutProber !== undefined) {
            try {
              const pages = await pdfLayoutProber(bytes);
              const result = reconstructDocumentReadingOrder(pages);
              if (result.anyPageReconstructed) {
                rawText = stripBomAndNormaliseCrlf(result.text);
                warnings.push(
                  "DRA-ENG-024: multi-column reading order reconstructed for one or more pages " +
                    `(columns detected: ${Math.max(...result.pages.map((p) => p.columnsDetected), 0)}).`,
                );
              }
              if (result.anyPageUncertain) {
                warnings.push(
                  "DRA-ENG-024: one or more pages had an ambiguous or table-like layout; original " +
                    "extraction order was preserved for those pages rather than guessing at column order.",
                );
              }
              const methodPriority: LayoutReconstructionMethod[] = [
                "COLUMN_RECONSTRUCTED",
                "AMBIGUOUS_PASSTHROUGH",
                "TABLE_LIKE_PASSTHROUGH",
                "SINGLE_COLUMN_PASSTHROUGH",
              ];
              const dominant = result.pages.reduce<(typeof result.pages)[number] | undefined>((best, p) => {
                if (best === undefined) return p;
                return methodPriority.indexOf(p.method) < methodPriority.indexOf(best.method) ? p : best;
              }, undefined);
              layoutReadingOrder = {
                method: dominant?.method ?? "SINGLE_COLUMN_PASSTHROUGH",
                confidence: dominant?.confidence ?? "NOT_APPLICABLE",
                columnsDetected: Math.max(...result.pages.map((p) => p.columnsDetected), 0),
                anyPageReconstructed: result.anyPageReconstructed,
                anyPageUncertain: result.anyPageUncertain,
                detectorVersion: result.detectorVersion,
              };
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              warnings.push(
                `DRA-ENG-024: PdfLayoutProber failed (${message}); reading order left as originally ` +
                  "extracted rather than attempting reconstruction without layout evidence.",
              );
            }
          }
        }
        break;
      }

      default: {
        // TypeScript exhaustiveness — mediaType is SupportedMediaType
        return {
          ok: false,
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: `Unsupported media type for normalisation: ${mediaType as string}`,
        };
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      code: "DECODE_ERROR",
      message: `Content decode error: ${message}`,
    };
  }

  const text = rawText.trim();

  if (text.length === 0) {
    return {
      ok: false,
      code: "EMPTY_NORMALISED_TEXT",
      message: "Normalised text is empty after stripping markup and whitespace",
    };
  }

  // Use the existing computeContentDigest from governance/eligibility.ts.
  const textDigest = computeContentDigest(text);

  return {
    ok: true,
    document: Object.freeze<NormalisedDocument>({
      sourceDigest,
      normalisationVersion: NORMALISATION_VERSION,
      text,
      textDigest,
      encoding: "utf-8",
      warnings: Object.freeze(warnings),
      ...(layoutReadingOrder !== undefined ? { layoutReadingOrder } : {}),
    }),
  };
}
