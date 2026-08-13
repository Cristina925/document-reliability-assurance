/**
 * DRA-ENG-015 — Representation-Boundary Semantic Loss Detection
 * Module: representation-integrity.ts — PDF fill-colour diversity signal
 *
 * Purpose
 * -------
 * DRA-ACQ-021 Phase 2 demonstrated that DRA's canonical text representation
 * can silently discard semantically material information that a source PDF
 * encodes solely through page-graphics constructs (e.g. cell background
 * shading) rather than through text. This module implements the smallest
 * viable GENERAL mechanism to detect — not interpret — the presence of that
 * class of risk, so acquisition/evaluation can disclose an explicit
 * uncertainty instead of silently claiming completeness.
 *
 * What this module does NOT do (by design, per the DRA-ENG-015 engineering
 * constraint):
 *   - It does not parse or understand arbitrary PDF graphics operators.
 *   - It does not attempt to reconstruct what any fill colour MEANS
 *     (e.g. it never infers "grey means forecast").
 *   - It contains no publisher-, document-, or colour-specific literals.
 *     Every threshold is a structural property of fill-colour usage,
 *     evaluated the same way for any PDF.
 *
 * What it DOES do:
 *   - Renders the PDF with `pdftocairo -svg` (already available wherever
 *     `pdftotext` is; both ship in the same Poppler distribution used
 *     elsewhere in this codebase) and inspects the emitted vector fill
 *     colours (`fill="rgb(r%, g%, b%)"` attributes).
 *   - Classifies each fill colour, purely by its own RGB values, into:
 *       - near-black / near-white  -> ordinary body text / page background,
 *         excluded from consideration entirely (this excludes "rich black"
 *         text colours as well as pure #000000, generically, by lightness).
 *       - achromatic, mid-lightness (R≈G≈B, not black/white)  -> a
 *         candidate "shading/highlight" fill — the same category of
 *         construct (grey-scale emphasis with no accompanying hue) that
 *         carried the lost historical/forecast signal in DRA-DOC-0025.
 *       - chromatic (R, G, B meaningfully different)  -> ordinary coloured
 *         graphics (logos, charts, brand colours, headers) — reported for
 *         completeness but NOT used to raise a signal, because (as measured
 *         against the existing corpus, see the DRA-ENG-015 report) nearly
 *         every real-world PDF contains some chromatic graphics, making it
 *         a useless discriminator on its own.
 *   - Buckets achromatic candidate fills into coarse lightness bands. A
 *     document that uses only one or two such bands, in a single
 *     consistent tone, at any volume, is a small, closed design pattern
 *     (a single boilerplate callout box, one repeated sidebar, a page
 *     border) — reused throughout the document but conveying a single
 *     fixed idea, not encoding a per-cell distinction across a range of
 *     categories. A document that uses MANY distinct achromatic lightness
 *     bands is structurally consistent with using shade as an encoding
 *     DIMENSION — i.e. multiple, mutually distinguishable tones standing
 *     in for multiple categories along some axis, which is exactly the
 *     shape of construct that cannot survive linear-text extraction.
 *
 * This is a STATISTICAL, document-format-based heuristic, not a certainty
 * test. See the DRA-ENG-015 report for the corpus-wide false-positive
 * analysis and the honest limits of what it does and does not detect
 * (it is blind to borders, font-weight/colour, icons, indentation,
 * positional/spatial grouping — see report Q2).
 */

// ---------------------------------------------------------------------------
// Injectable SVG renderer (mirrors the PdfExtractor injection pattern used
// by normalisation.ts, so tests can supply either the real `pdftocairo`
// wrapper or a deterministic fixture without this module depending on a
// child-process invocation directly).
// ---------------------------------------------------------------------------

/**
 * An injectable function that renders PDF bytes to Poppler/Cairo SVG markup
 * (the raw text of one or more `pdftocairo -svg` output files, concatenated
 * is also acceptable). Must return the SVG source as a string. Should throw
 * if rendering fails — this module will convert that into a typed error.
 */
export type PdfSvgRenderer = (bytes: Uint8Array) => Promise<string> | string;

// ---------------------------------------------------------------------------
// Structural thresholds
// ---------------------------------------------------------------------------
//
// Every threshold below is a property of fill-colour STATISTICS (lightness,
// achromaticity, distinct-tone count, total volume) — never a colour value,
// coordinate, or text literal tied to any specific document. They were
// calibrated by observing the separation between DRA-DOC-0025 (the one
// document known to carry the representation-boundary risk) and the other
// PDF-sourced documents already present in the corpus (see the DRA-ENG-015
// report for the full table). They are deliberately conservative (biased
// toward NOT flagging) given the small validation sample.

/** Average lightness (0-100) at or below which a fill is ordinary body text. */
const NEAR_BLACK_MAX_AVG_LIGHTNESS = 25;

/** Average lightness (0-100) at or above which a fill is the page background. */
const NEAR_WHITE_MIN_AVG_LIGHTNESS = 97;

/** Max (max-channel - min-channel) percentage points for a fill to count as achromatic. */
const ACHROMATIC_MAX_CHANNEL_SPREAD = 3.0;

/** Width, in lightness percentage points, of each bucket used to de-duplicate
 * anti-aliasing noise around a single nominal tone into one logical tone. */
const LIGHTNESS_BUCKET_WIDTH = 5;

/** A bucket must accumulate at least this many fill occurrences to be treated
 * as a real, repeated tone rather than incidental edge anti-aliasing. */
const MIN_OCCURRENCES_PER_SIGNIFICANT_BUCKET = 15;

/** Minimum number of distinct significant achromatic tones for a document to
 * be classified as using shade as a multi-category encoding dimension. */
const MIN_DISTINCT_TONES_FOR_POTENTIAL_SEMANTICS = 5;

/** Below this total non-default (chromatic + achromatic) fill volume, a
 * document is treated as carrying no meaningful non-text graphics at all. */
const MAX_TOTAL_NON_DEFAULT_FILLS_FOR_TEXT_COMPLETE = 50;

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

export type RepresentationIntegrityStatus =
  /** No meaningful non-text fill graphics detected; canonical text is
   * unlikely to be missing colour/shading-encoded semantics. */
  | "TEXT_COMPLETE"
  /** Fill-colour usage is structurally consistent with shade being used as
   * a multi-category encoding dimension that linear text cannot preserve. */
  | "POTENTIAL_VISUAL_SEMANTICS"
  /** Non-text graphics are present, but their pattern does not meet the
   * multi-tone-encoding shape; semantic completeness cannot be certified
   * either way. */
  | "UNCERTAIN_VISUAL_CONTENT";

export interface RepresentationIntegritySignal {
  readonly status: RepresentationIntegrityStatus;
  /** Total occurrences of achromatic, non-black/white candidate fills. */
  readonly achromaticFillOccurrences: number;
  /** Number of distinct, significant achromatic lightness tones observed. */
  readonly distinctAchromaticTones: number;
  /** Total occurrences of chromatic (coloured) fills — reported, not scored. */
  readonly chromaticFillOccurrences: number;
  /** Human-readable, fully generic rationale (never names a document, a
   * specific colour, or a specific semantic interpretation). */
  readonly rationale: string;
}

export type RepresentationIntegrityResult =
  | { readonly ok: true; readonly signal: RepresentationIntegritySignal }
  | {
      readonly ok: false;
      readonly code: "SVG_RENDER_FAILED" | "NO_RENDERER_PROVIDED";
      readonly message: string;
    };

// ---------------------------------------------------------------------------
// Fill-colour parsing
// ---------------------------------------------------------------------------

const FILL_RGB_RE = /fill="rgb\(([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)%\)"/g;

interface ParsedFill {
  readonly avgLightness: number;
  readonly channelSpread: number;
}

function parseFills(svg: string): ParsedFill[] {
  const fills: ParsedFill[] = [];
  for (const match of svg.matchAll(FILL_RGB_RE)) {
    const r = Number.parseFloat(match[1]);
    const g = Number.parseFloat(match[2]);
    const b = Number.parseFloat(match[3]);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) continue;
    const avgLightness = (r + g + b) / 3;
    const channelSpread = Math.max(r, g, b) - Math.min(r, g, b);
    fills.push({ avgLightness, channelSpread });
  }
  return fills;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

function classifyFills(fills: readonly ParsedFill[]): {
  achromaticFillOccurrences: number;
  distinctAchromaticTones: number;
  chromaticFillOccurrences: number;
} {
  const bucketCounts = new Map<number, number>();
  let achromaticFillOccurrences = 0;
  let chromaticFillOccurrences = 0;

  for (const fill of fills) {
    if (
      fill.avgLightness <= NEAR_BLACK_MAX_AVG_LIGHTNESS ||
      fill.avgLightness >= NEAR_WHITE_MIN_AVG_LIGHTNESS
    ) {
      continue; // ordinary text / ordinary page background
    }
    if (fill.channelSpread <= ACHROMATIC_MAX_CHANNEL_SPREAD) {
      achromaticFillOccurrences += 1;
      const bucket =
        Math.round(fill.avgLightness / LIGHTNESS_BUCKET_WIDTH) *
        LIGHTNESS_BUCKET_WIDTH;
      bucketCounts.set(bucket, (bucketCounts.get(bucket) ?? 0) + 1);
    } else {
      chromaticFillOccurrences += 1;
    }
  }

  let distinctAchromaticTones = 0;
  for (const count of bucketCounts.values()) {
    if (count >= MIN_OCCURRENCES_PER_SIGNIFICANT_BUCKET) {
      distinctAchromaticTones += 1;
    }
  }

  return {
    achromaticFillOccurrences,
    distinctAchromaticTones,
    chromaticFillOccurrences,
  };
}

function deriveStatus(
  achromaticFillOccurrences: number,
  distinctAchromaticTones: number,
  chromaticFillOccurrences: number,
): { status: RepresentationIntegrityStatus; rationale: string } {
  const totalNonDefault = achromaticFillOccurrences + chromaticFillOccurrences;

  if (totalNonDefault < MAX_TOTAL_NON_DEFAULT_FILLS_FOR_TEXT_COMPLETE) {
    return {
      status: "TEXT_COMPLETE",
      rationale:
        "No meaningful volume of non-text fill graphics was found; the " +
        "canonical text representation is unlikely to be missing " +
        "colour/shading-encoded information.",
    };
  }

  if (distinctAchromaticTones >= MIN_DISTINCT_TONES_FOR_POTENTIAL_SEMANTICS) {
    return {
      status: "POTENTIAL_VISUAL_SEMANTICS",
      rationale:
        `The document uses ${distinctAchromaticTones} distinct, ` +
        "significant achromatic (grey-scale) fill tones, a pattern " +
        "structurally consistent with shade being used as a multi-category " +
        "encoding dimension. This canonical text representation cannot " +
        "preserve fill-colour information, so any such encoding — whatever " +
        "it means — is not represented downstream. This is a detection " +
        "signal only; it does not identify what the shading encodes.",
    };
  }

  return {
    status: "UNCERTAIN_VISUAL_CONTENT",
    rationale:
      "Non-text fill graphics are present, but their pattern (few distinct " +
      "achromatic tones, and/or predominantly chromatic content such as " +
      "logos, charts, or brand colours) does not match the shape of a " +
      "multi-category shading encoding. Semantic completeness of the " +
      "canonical text relative to this document's visual content cannot be " +
      "certified either way from this signal alone.",
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Assesses a PDF's raw bytes for the presence of fill-colour patterns that
 * are structurally consistent with visual-only semantic encoding (the class
 * of representation-boundary risk demonstrated by DRA-DOC-0025).
 *
 * This is a disclosure/detection signal, not a pass/fail gate: callers
 * decide what to do with a POTENTIAL_VISUAL_SEMANTICS or
 * UNCERTAIN_VISUAL_CONTENT result (e.g. surface it in acquisition
 * provenance notes, a coverage declaration, or a reviewer prompt). This
 * function does not modify, gate, or participate in NormalisedDocument,
 * evaluateDocument, or proof-receipt computation — it is intentionally
 * decoupled so introducing it does not require any evaluatorVersion or
 * pipelineVersion change, and existing frozen receipts remain untouched.
 */
export async function assessPdfRepresentationIntegrity(
  bytes: Uint8Array,
  svgRenderer?: PdfSvgRenderer,
): Promise<RepresentationIntegrityResult> {
  if (svgRenderer === undefined) {
    return {
      ok: false,
      code: "NO_RENDERER_PROVIDED",
      message: "No PdfSvgRenderer provided; cannot assess representation integrity.",
    };
  }

  let svg: string;
  try {
    svg = await svgRenderer(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      code: "SVG_RENDER_FAILED",
      message: `PDF SVG rendering failed: ${message}`,
    };
  }

  const fills = parseFills(svg);
  const {
    achromaticFillOccurrences,
    distinctAchromaticTones,
    chromaticFillOccurrences,
  } = classifyFills(fills);
  const { status, rationale } = deriveStatus(
    achromaticFillOccurrences,
    distinctAchromaticTones,
    chromaticFillOccurrences,
  );

  return {
    ok: true,
    signal: Object.freeze<RepresentationIntegritySignal>({
      status,
      achromaticFillOccurrences,
      distinctAchromaticTones,
      chromaticFillOccurrences,
      rationale,
    }),
  };
}
