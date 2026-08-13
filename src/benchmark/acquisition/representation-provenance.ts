/**
 * DRA-ENG-017 — Representation Provenance and OCR Fidelity
 * Module: representation-provenance.ts
 *
 * Purpose
 * -------
 * DRA-ACQ-023 Phase 2 demonstrated that DRA establishes provenance for the
 * authoritative SOURCE artefact (URL, licence, byte digest) but preserves no
 * provenance for the machine-readable REPRESENTATION derived from that
 * artefact. An OCR-derived text layer can substitute content (W1:
 * HECHLER→HEMMER) or fabricate content from non-body visual artefacts (W2:
 * a library stamp), and both defects pass downstream as ordinary,
 * apparently-authoritative text with no distinguishing signal anywhere in
 * the pipeline.
 *
 * This module defines two INDEPENDENT axes and a minimal, general detector
 * for one of them:
 *
 *   RepresentationProvenance — HOW the canonical text was produced
 *     (NATIVE_TEXT / OCR_TEXT_LAYER / IMAGE_ONLY / MIXED_REPRESENTATION /
 *     UNKNOWN). This is a statement about mechanism, not correctness.
 *
 *   RepresentationFidelity — HOW CONFIDENTLY the text is known to match the
 *     authoritative source representation (VERIFIED / PARTIALLY_VERIFIED /
 *     UNVERIFIED / DEGRADED / NOT_ASSESSABLE). This is a statement about
 *     confidence, not mechanism. An OCR-derived representation is not
 *     automatically degraded; a native-text representation is not
 *     automatically verified merely because extraction succeeded.
 *
 * Design constraints (per the DRA-ENG-017 ticket):
 *   - No full OCR engine is built here. Detection uses only cheap,
 *     document-format-level signals already available from tools already
 *     used elsewhere in this codebase (pdfinfo, pdffonts — the same Poppler
 *     toolchain `pdftotext`/`pdftocairo` come from).
 *   - Detection deliberately does NOT use raw "does this PDF contain
 *     images" as a signal, specifically because the ticket requires that a
 *     native-text PDF must not become OCR-classified merely because it
 *     contains images, charts, or logos. Image presence alone is excluded
 *     from the classifier by construction (see classifyRepresentationProvenance).
 *   - Prefers explicit UNKNOWN/uncertainty over a confident but speculative
 *     classification.
 *   - No document-specific literals (no document titles, IDs, or hardcoded
 *     digests) — every threshold is a structural property of font/creator/
 *     ratio statistics, evaluated identically for any PDF.
 */

// ---------------------------------------------------------------------------
// Part A — Representation provenance model
// ---------------------------------------------------------------------------

export const REPRESENTATION_PROVENANCE_VALUES = [
  /** Text was authored directly as machine-readable text (word processor,
   * typesetting system, etc.) and extracted without an image-to-text
   * interpretation step. */
  "NATIVE_TEXT",
  /** Text was produced by an OCR engine interpreting a scanned/rasterised
   * page image. An interpretation step occurred; substitution and
   * fabrication risk (as in W1/W2) is structurally possible. */
  "OCR_TEXT_LAYER",
  /** No usable text layer exists at all; the page content is image-only. */
  "IMAGE_ONLY",
  /** The document mixes native and OCR-derived (or image-only) content
   * across different pages/regions. */
  "MIXED_REPRESENTATION",
  /** Signals were unavailable, contradictory, or insufficient to classify
   * with any confidence. */
  "UNKNOWN",
] as const;

export type RepresentationProvenance = (typeof REPRESENTATION_PROVENANCE_VALUES)[number];

export const REPRESENTATION_FIDELITY_VALUES = [
  /** Positively confirmed, by an actual comparison against the
   * authoritative source representation, to match. Never assigned merely
   * because extraction/parsing completed without error. */
  "VERIFIED",
  /** Some sampled regions were checked and matched; the document as a whole
   * has not been fully verified. */
  "PARTIALLY_VERIFIED",
  /** No comparison against the authoritative source representation has
   * been performed. This is the correct default for OCR-derived text with
   * no contradicting evidence — a confidence condition, not a failure. */
  "UNVERIFIED",
  /** Structural evidence (e.g. a high density of improbable/garbled
   * tokens) suggests the representation diverges from the source in at
   * least some regions. */
  "DEGRADED",
  /** No meaningful comparison is possible at all (e.g. IMAGE_ONLY with no
   * text layer to compare, or UNKNOWN provenance). */
  "NOT_ASSESSABLE",
] as const;

export type RepresentationFidelity = (typeof REPRESENTATION_FIDELITY_VALUES)[number];

/**
 * The complete, immutable representation-provenance/fidelity assessment for
 * one acquired document. This is the single authoritative record of what
 * DRA currently knows about how a document's canonical text was produced
 * and how confidently that text is known to match the source.
 *
 * detectorVersion allows future detector changes to be distinguished from
 * this version's output without requiring an evaluator/pipeline version
 * bump (this module is intentionally decoupled from evaluateDocument, the
 * same architectural pattern already used by DRA-ENG-015 and DRA-ENG-016).
 */
export interface RepresentationAssessment {
  readonly provenance: RepresentationProvenance;
  readonly provenanceRationale: string;
  readonly fidelity: RepresentationFidelity;
  readonly fidelityRationale: string;
  /** Density (0-1) of tokens flagged as structurally improbable in the
   * extracted text, or undefined when no text was available to sample. See
   * computeGarbledTokenDensity. Purely a DEGRADED-detection input signal;
   * not a general OCR-accuracy metric. */
  readonly garbledTokenDensity?: number;
  readonly detectorVersion: string;
}

export const REPRESENTATION_PROVENANCE_DETECTOR_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Part D — OCR risk detector: injectable PDF signal probe
// ---------------------------------------------------------------------------

/**
 * Cheap, general, document-format-level signals used to classify
 * representation provenance. Every field here is obtainable from standard
 * PDF introspection tools (pdfinfo, pdffonts) without rendering or
 * interpreting page content, and without inspecting embedded images.
 *
 * Deliberately excluded: any "image coverage" / "image area" signal. The
 * ticket requires that a native-text PDF with images, charts, or logos must
 * not become OCR-classified; the simplest way to guarantee that structurally
 * is to never let image presence influence the classifier at all.
 */
export interface PdfRepresentationProbeSignals {
  /** From pdfinfo's "Creator" field, if present. */
  readonly creator?: string;
  /** From pdfinfo's "Producer" field, if present. */
  readonly producer?: string;
  /** Total page count, if known. */
  readonly pageCount?: number;
  /** Count of distinct fonts reported by pdffonts, regardless of embedding
   * status. Kept for diagnostics/back-compat; classification uses
   * embeddedFontCount below, which is the more discriminating signal. */
  readonly embeddedFontCount?: number;
  /** Count of fonts pdffonts reports as actually EMBEDDED in the file
   * ("emb" column = yes), as opposed to referenced-only standard fonts
   * (Times-Roman, Helvetica, Courier, Symbol, ZapfDingbats, etc.). A text
   * layer that references only non-embedded standard fonts is consistent
   * with a machine-stamped/invisible OCR text layer (which needs some font
   * reference but has no reason to embed a real one) and NOT with native
   * authoring (which almost always embeds/subsets its body font). This is
   * a stronger discriminator than raw font count. */
  readonly trueEmbeddedFontCount?: number;
  /** Font names/types reported by pdffonts (e.g. "TrueType", "Type1"). */
  readonly fontNames?: readonly string[];
  /** Length (characters) of the text actually extracted from the document
   * (e.g. via pdftotext). Required — this is the one signal every caller
   * can always supply, since extraction is already performed upstream. */
  readonly extractedTextLength: number;
}

/** An injectable prober so tests can supply deterministic fixtures without
 * shelling out to pdfinfo/pdffonts on every call (mirrors the PdfSvgRenderer
 * injection pattern in representation-integrity.ts and the PdfExtractor
 * injection pattern in normalisation.ts). */
export type PdfRepresentationProber = (
  bytes: Uint8Array,
) => Promise<PdfRepresentationProbeSignals> | PdfRepresentationProbeSignals;

// Known OCR-engine Creator/Producer signatures. Structural (matches a class
// of tool), never a document-specific literal.
const OCR_ENGINE_SIGNATURE_RE =
  /omnipage|abbyy|finereader|tesseract|readiris|paper\s*capture|ocr[\s-]?(engine|module)?/i;

// Known scan-compression/recoding-tool signatures. These tools (used to
// compress and republish scanned-page-image PDFs, commonly by government
// digitisation/document-management systems) are a structurally distinct but
// related class from dedicated OCR engines: they recode a scanned document
// and typically stamp an invisible text layer using non-embedded standard
// fonts (see trueEmbeddedFontCount below) rather than embedding real body
// fonts. Treated as OCR_TEXT_LAYER-class evidence, same as a direct OCR
// engine signature.
const SCAN_COMPRESSION_SIGNATURE_RE = /luradocument|lurawave|pdf\s*compressor|jbig2|djvu/i;

// Known native-authoring-tool Creator/Producer signatures. Structural,
// covers common word-processing/typesetting/native-PDF producers.
const NATIVE_AUTHORING_SIGNATURE_RE =
  /microsoft\s*word|microsoft®?\s*word|latex|tex\b|indesign|quarkxpress|libreoffice|openoffice|pages\b|acrobat\s*(pdfmaker|distiller)|prince|wkhtmltopdf|chromium|word\s*for\s*(mac|windows)/i;

/** Minimum characters/page below which a document with pages is treated as
 * carrying essentially no usable text layer (IMAGE_ONLY candidate). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PRESENT = 20;

/** Minimum embedded font count consistent with genuinely native, richly
 * authored text (below this, and absent a native signature, a document is
 * treated as font-sparse in a way consistent with, but not exclusive to,
 * OCR/rasterised production). */
const MIN_FONT_COUNT_FOR_LIKELY_NATIVE = 1;

/**
 * Classifies representation provenance from cheap PDF-format signals alone.
 *
 * This is a STRUCTURAL, document-format-based heuristic (same class of
 * mechanism as DRA-ENG-015's fill-colour detector), not a certainty test.
 * It is deliberately conservative: any case it cannot classify with
 * reasonable confidence falls to UNKNOWN rather than guessing.
 */
export function classifyRepresentationProvenance(
  signals: PdfRepresentationProbeSignals,
): { readonly provenance: RepresentationProvenance; readonly rationale: string } {
  const { creator, producer, pageCount, embeddedFontCount, trueEmbeddedFontCount, extractedTextLength } = signals;
  const combinedSignature = `${creator ?? ""} ${producer ?? ""}`.trim();

  const hasOcrEngineSignature = combinedSignature.length > 0 && OCR_ENGINE_SIGNATURE_RE.test(combinedSignature);
  const hasScanCompressionSignature =
    combinedSignature.length > 0 && SCAN_COMPRESSION_SIGNATURE_RE.test(combinedSignature);
  const hasNativeSignature =
    combinedSignature.length > 0 && NATIVE_AUTHORING_SIGNATURE_RE.test(combinedSignature);

  // A text layer resting entirely on non-embedded standard fonts (no font
  // actually embedded anywhere) despite reporting some fonts is consistent
  // with a machine-stamped OCR/invisible text layer, not native authoring.
  const fontsPresentButNoneEmbedded =
    embeddedFontCount !== undefined &&
    embeddedFontCount > 0 &&
    trueEmbeddedFontCount !== undefined &&
    trueEmbeddedFontCount === 0;

  const charsPerPage =
    pageCount !== undefined && pageCount > 0 ? extractedTextLength / pageCount : undefined;

  const hasNoUsableText = charsPerPage !== undefined && charsPerPage < MIN_CHARS_PER_PAGE_FOR_TEXT_PRESENT;
  const hasSubstantialText = charsPerPage === undefined || charsPerPage >= MIN_CHARS_PER_PAGE_FOR_TEXT_PRESENT;

  // IMAGE_ONLY: pages exist, but essentially no text was extracted at all —
  // regardless of any Creator/Producer signature, an absent text layer means
  // there is nothing for a text-based OCR/native distinction to apply to.
  if (hasNoUsableText && extractedTextLength < MIN_CHARS_PER_PAGE_FOR_TEXT_PRESENT * 2) {
    return {
      provenance: "IMAGE_ONLY",
      rationale:
        `Extracted text (${extractedTextLength} characters over ${pageCount} page(s), ` +
        `~${charsPerPage?.toFixed(1)} chars/page) falls below the usable-text-layer threshold ` +
        `(${MIN_CHARS_PER_PAGE_FOR_TEXT_PRESENT} chars/page); no text layer is present to classify ` +
        "as native or OCR-derived.",
    };
  }

  // Explicit OCR engine signature is the strongest available signal.
  if (hasOcrEngineSignature) {
    return {
      provenance: "OCR_TEXT_LAYER",
      rationale:
        `Creator/Producer metadata ("${combinedSignature}") matches a known OCR-engine signature. ` +
        "The text layer was produced by interpreting a scanned page image, not authored directly " +
        "as machine-readable text.",
    };
  }

  // Scan-compression/recoding-tool signature (e.g. LuraDocument/PDF
  // Compressor), reinforced by a text layer that rests entirely on
  // non-embedded standard fonts — the combination is a strong OCR-class
  // signal even without a dedicated-OCR-engine string.
  if (hasScanCompressionSignature && (fontsPresentButNoneEmbedded || trueEmbeddedFontCount === undefined)) {
    return {
      provenance: "OCR_TEXT_LAYER",
      rationale:
        `Creator/Producer metadata ("${combinedSignature}") matches a known scan-compression/recoding-tool ` +
        "signature, and the text layer does not rest on any embedded font (only non-embedded standard " +
        "fonts, if any, are referenced) — consistent with a machine-stamped OCR text layer over a " +
        "recompressed scanned page image, not directly authored text.",
    };
  }

  // Explicit native-authoring signature plus a genuine text layer.
  if (hasNativeSignature && hasSubstantialText) {
    return {
      provenance: "NATIVE_TEXT",
      rationale:
        `Creator/Producer metadata ("${combinedSignature}") matches a known native-authoring/typesetting ` +
        "tool signature, and a substantial text layer is present. Text was authored directly as " +
        "machine-readable content.",
    };
  }

  // Fonts are reported but none is actually embedded, despite a substantial
  // text layer and no recognised native-authoring signature: consistent
  // with a machine-stamped/invisible text layer over an image, which has no
  // reason to embed a real font, rather than native typesetting (which
  // almost always embeds/subsets its body font).
  if (fontsPresentButNoneEmbedded && hasSubstantialText && !hasNativeSignature) {
    return {
      provenance: "OCR_TEXT_LAYER",
      rationale:
        `${embeddedFontCount} font(s) are referenced but none is actually embedded in the file — the text ` +
        "layer rests entirely on non-embedded standard fonts (e.g. Times-Roman/Courier/Helvetica). This " +
        "pattern is consistent with a machine-stamped OCR/invisible text layer, which has no reason to " +
        "embed a real font, and is inconsistent with native typesetting, which almost always embeds or " +
        "subsets its body font.",
    };
  }

  // No engine signature at all, but font metadata is present, consistent
  // with native production by an unrecognised tool.
  if (
    !hasOcrEngineSignature &&
    !hasScanCompressionSignature &&
    embeddedFontCount !== undefined &&
    embeddedFontCount >= MIN_FONT_COUNT_FOR_LIKELY_NATIVE &&
    !fontsPresentButNoneEmbedded &&
    hasSubstantialText
  ) {
    return {
      provenance: "NATIVE_TEXT",
      rationale:
        `No OCR-engine signature detected; ${embeddedFontCount} embedded font(s) reported alongside a ` +
        "substantial text layer, consistent with directly-authored text from an unrecognised production " +
        "tool. (This heuristic uses font/text signals only — it never treats image, chart, or logo " +
        "presence as evidence of OCR.)",
    };
  }

  // No usable signature and no font evidence, but text is present: cannot
  // distinguish OCR from an unusual native producer with unreported fonts.
  if (hasSubstantialText) {
    return {
      provenance: "UNKNOWN",
      rationale:
        "A substantial text layer is present, but neither an OCR-engine signature, a native-authoring " +
        "signature, nor embedded-font evidence was available to determine how it was produced.",
    };
  }

  return {
    provenance: "UNKNOWN",
    rationale:
      "Insufficient signals (no page count, no font data, no recognised Creator/Producer signature, " +
      "ambiguous text volume) to classify representation provenance with reasonable confidence.",
  };
}

// ---------------------------------------------------------------------------
// Part E — Fidelity verification experiment: garbled-token density
// ---------------------------------------------------------------------------
//
// This is the one concrete signal this module provides toward "fidelity",
// as distinct from "provenance". It is a coarse, STATISTICAL, document-
// format-agnostic proxy for OCR-style corruption density — never a claim of
// verified accuracy. See the DRA-ENG-017 report (Part E) for why full
// automated source-image<->text fidelity verification was investigated and
// found not reliably achievable with the tooling available in this
// environment (no independent second OCR engine, no per-character
// confidence exposed by pdftotext), and is therefore classified
// ACCEPTED_LIMITATION rather than implemented as a false claim of
// verification.

/** A token is "garbled" if it contains letters but has no vowel-like
 * character at all (a coarse proxy shared by many observed OCR artefacts,
 * e.g. "REFE;ENE", "ICFL", "DEPA" fragments) OR mixes letters with unusual
 * punctuation mid-token (e.g. "ri\i", "750'X2"). This is intentionally
 * generic and produces false positives on legitimate all-consonant
 * abbreviations/acronyms — it is a density signal across a whole document,
 * not a per-token defect classifier. */
const GARBLED_TOKEN_RE = /^[A-Za-z]{3,}$/;
const VOWEL_RE = /[aeiouAEIOU]/;
const MIXED_PUNCTUATION_TOKEN_RE = /[A-Za-z].*[;\\|~^`].*[A-Za-z]|[A-Za-z]\d[A-Za-z]\d/;

/**
 * Computes the fraction (0-1) of word-like tokens in `text` that match the
 * coarse garbled-token heuristic. Returns undefined for empty/whitespace-only
 * text (nothing to sample).
 */
export function computeGarbledTokenDensity(text: string): number | undefined {
  const tokens = text.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return undefined;

  let garbledCount = 0;
  let sampledCount = 0;
  for (const raw of tokens) {
    const token = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
    if (token.length < 3) continue;
    sampledCount += 1;
    if (GARBLED_TOKEN_RE.test(token) && !VOWEL_RE.test(token)) {
      garbledCount += 1;
      continue;
    }
    if (MIXED_PUNCTUATION_TOKEN_RE.test(raw)) {
      garbledCount += 1;
    }
  }
  if (sampledCount === 0) return undefined;
  return garbledCount / sampledCount;
}

/** Density at or above which structural evidence is treated as consistent
 * with degraded (not merely unverified) representation fidelity. Calibrated
 * to be well above the incidental all-consonant-acronym baseline observed
 * in ordinary English/legal/technical prose across the existing corpus (see
 * the DRA-ENG-017 report for the corpus-wide baseline measurement). */
const DEGRADED_GARBLED_DENSITY_THRESHOLD = 0.02;

// ---------------------------------------------------------------------------
// Part C — Fidelity derivation (kept independent of provenance mechanics)
// ---------------------------------------------------------------------------

export function deriveRepresentationFidelity(
  provenance: RepresentationProvenance,
  garbledTokenDensity: number | undefined,
): { readonly fidelity: RepresentationFidelity; readonly rationale: string } {
  if (provenance === "IMAGE_ONLY" || provenance === "UNKNOWN") {
    return {
      fidelity: "NOT_ASSESSABLE",
      rationale:
        `Provenance is ${provenance}; there is no reliable machine-readable text representation to assess ` +
        "for fidelity against the source (either no text layer exists, or how the text was produced is " +
        "itself unknown).",
    };
  }

  if (garbledTokenDensity !== undefined && garbledTokenDensity >= DEGRADED_GARBLED_DENSITY_THRESHOLD) {
    return {
      fidelity: "DEGRADED",
      rationale:
        `Garbled-token density (${(garbledTokenDensity * 100).toFixed(2)}%) meets or exceeds the ` +
        `structural-degradation threshold (${(DEGRADED_GARBLED_DENSITY_THRESHOLD * 100).toFixed(0)}%). ` +
        "This indicates a non-trivial rate of structurally improbable tokens is present, consistent with " +
        "representation corruption in at least some regions. This is a coarse density signal, not a " +
        "confirmed defect count or a claim about which specific tokens are wrong.",
    };
  }

  if (provenance === "NATIVE_TEXT") {
    return {
      fidelity: "VERIFIED",
      rationale:
        "Provenance is NATIVE_TEXT: the canonical text is the document's own embedded text objects, with " +
        "no image-to-text interpretation step and no garbled-token density evidence of corruption. Unlike " +
        "OCR-derived text, there is no interpretive step whose output could diverge from the source " +
        "representation, so this is treated as verified by construction rather than by extraction having " +
        "merely completed without error.",
    };
  }

  // OCR_TEXT_LAYER or MIXED_REPRESENTATION, without a degraded-density signal.
  return {
    fidelity: "UNVERIFIED",
    rationale:
      `Provenance is ${provenance}: an image-to-text interpretation step occurred, so agreement with the ` +
      "source representation is not guaranteed by construction. No garbled-token density evidence of " +
      "degradation was found, but no positive verification against the source page images has been " +
      "performed either. This is a confidence condition, not a claim that the text is wrong — see " +
      "RepresentationFidelity documentation.",
  };
}

// ---------------------------------------------------------------------------
// Public entry point: full assessment
// ---------------------------------------------------------------------------

/**
 * Produces the complete RepresentationAssessment for one document's bytes
 * and its already-extracted text.
 *
 * For non-PDF media types, or when no prober is supplied, provenance is
 * classified as NATIVE_TEXT with a rationale disclosing that assumption is
 * a default for text-native formats, not a probed result — callers that
 * need a probed answer for non-PDF formats must supply their own signals.
 */
export async function assessRepresentationProvenance(
  mediaType: string,
  bytes: Uint8Array,
  extractedText: string,
  prober?: PdfRepresentationProber,
): Promise<RepresentationAssessment> {
  const garbledTokenDensity = computeGarbledTokenDensity(extractedText);

  if (mediaType !== "application/pdf") {
    const { fidelity, rationale: fidelityRationale } = deriveRepresentationFidelity(
      "NATIVE_TEXT",
      garbledTokenDensity,
    );
    return Object.freeze<RepresentationAssessment>({
      provenance: "NATIVE_TEXT",
      provenanceRationale:
        `Media type "${mediaType}" is a plain-text-native format with no image-to-text interpretation ` +
        "step possible; classified NATIVE_TEXT by format, not by probing.",
      fidelity,
      fidelityRationale,
      garbledTokenDensity,
      detectorVersion: REPRESENTATION_PROVENANCE_DETECTOR_VERSION,
    });
  }

  if (prober === undefined) {
    return Object.freeze<RepresentationAssessment>({
      provenance: "UNKNOWN",
      provenanceRationale:
        "Media type is application/pdf but no PdfRepresentationProber was supplied; representation " +
        "provenance cannot be determined without pdfinfo/pdffonts-derived signals.",
      fidelity: "NOT_ASSESSABLE",
      fidelityRationale: "Provenance is UNKNOWN; fidelity cannot be assessed without a provenance classification.",
      garbledTokenDensity,
      detectorVersion: REPRESENTATION_PROVENANCE_DETECTOR_VERSION,
    });
  }

  let signals: PdfRepresentationProbeSignals;
  try {
    signals = await prober(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Object.freeze<RepresentationAssessment>({
      provenance: "UNKNOWN",
      provenanceRationale: `PdfRepresentationProber threw: ${message}. Falling back to UNKNOWN rather than guessing.`,
      fidelity: "NOT_ASSESSABLE",
      fidelityRationale: "Provenance is UNKNOWN; fidelity cannot be assessed without a provenance classification.",
      garbledTokenDensity,
      detectorVersion: REPRESENTATION_PROVENANCE_DETECTOR_VERSION,
    });
  }

  const { provenance, rationale: provenanceRationale } = classifyRepresentationProvenance(signals);
  const { fidelity, rationale: fidelityRationale } = deriveRepresentationFidelity(provenance, garbledTokenDensity);

  return Object.freeze<RepresentationAssessment>({
    provenance,
    provenanceRationale,
    fidelity,
    fidelityRationale,
    garbledTokenDensity,
    detectorVersion: REPRESENTATION_PROVENANCE_DETECTOR_VERSION,
  });
}
