/**
 * DRA-ENG-018 — Graphical-Semantic Risk Detection (Parts B, C, D)
 *
 * Background (DRA-DOC-0029 / DRA-ACQ-025 Phase 2): a document was assessed
 * REPRESENTATION_PROVENANCE=NATIVE_TEXT, LEXICAL_FIDELITY=VERIFIED, and
 * decided HOLD with only 3 unrelated issues — while a 17-node/19-edge causal
 * diagram carrying materially non-redundant meaning was entirely absent from
 * the canonical text, with no existing mechanism flagging that absence.
 * "The extracted words are faithful" and "the document's graphical meaning
 * has been represented" are different claims; this module addresses the
 * second one, at the level DRA can actually support: RISK, not
 * understanding.
 *
 * Concept — graphical-semantic risk (Part B):
 * A PDF page carries graphical-semantic risk when it contains a graphical
 * region (raster image) large enough, relative to the page, to plausibly
 * carry standalone information (a figure, diagram, chart, map, or annotated
 * photograph) AND the page's own extracted text is too sparse to plausibly
 * narrate that region's content. Both conditions are required: a large
 * image on a page dense with prose (the image is one supporting exhibit
 * among much surrounding narration) is a materially different situation
 * from a large image that IS the page's content.
 *
 * This module never tries to read or classify what a graphical region shows.
 * It answers one narrower, general, and empirically checkable question:
 * "does the structural shape of this page look like undocumented graphical
 * content, or does it look like narrated content?" That is deliberately a
 * weaker claim than "the diagram is understood" or even "the diagram is
 * lost" — it is a risk signal, not a verdict.
 *
 * Explicit scope boundary (established empirically against DRA-DOC-0028,
 * see the DRA-ENG-018 test suite): this detector's only graphical-region
 * signal is EMBEDDED RASTER IMAGES (via an injectable image-region probe).
 * DRA-DOC-0028's flowcharts are pure vector line art (diamonds, arrows,
 * text drawn as vector paths, confirmed via DRA-ENG-015's own investigation)
 * and contain no raster images at all on the relevant pages — this detector
 * is therefore structurally blind to them, exactly as DRA-ENG-015 is
 * structurally blind to flowchart topology for a different reason (it
 * targets fill-colour/shading, not line routing). This is a documented,
 * known limitation, not a silent gap: see DRA-ENG-018's report for the
 * closure classification this implies for vector-drawn diagrams.
 *
 * Design constraints (Part C, verified by the "no forbidden vocabulary"
 * test in this module's test suite):
 *   - Every signal is general, format/property-based, and computable from
 *     any PDF: image pixel dimensions + DPI, page dimensions, and generic
 *     caption-marker vocabulary ("figure", "table", "chart", ...).
 *   - No terms specific to any single acquired benchmark document or its
 *     subject matter, and no hardcoded page numbers, appear anywhere in
 *     this file's operative logic, so DRA-DOC-0029 is detected the same
 *     way any other document with the same structural shape would be.
 */

// ---------------------------------------------------------------------------
// Injectable image-region probe
// ---------------------------------------------------------------------------

/** A single embedded raster image region, as reported by e.g. `pdfimages -list`. */
export interface PdfImageRegionSignal {
  /** 1-based PDF page number the image appears on. */
  readonly page: number;
  /** Image width in pixels. */
  readonly widthPx: number;
  /** Image height in pixels. */
  readonly heightPx: number;
  /** Horizontal resolution in pixels per inch. 0/absent is treated as unknown. */
  readonly xPpi: number;
  /** Vertical resolution in pixels per inch. 0/absent is treated as unknown. */
  readonly yPpi: number;
}

/** A single page's physical dimensions, as reported by e.g. `pdfinfo`. */
export interface PdfPageDimensionSignal {
  /** 1-based PDF page number. */
  readonly page: number;
  /** Page width in PDF points (1/72 inch). */
  readonly widthPt: number;
  /** Page height in PDF points (1/72 inch). */
  readonly heightPt: number;
}

/** All structural signals a probe extracts from a PDF's raw bytes. */
export interface PdfImageRegionSignals {
  readonly images: readonly PdfImageRegionSignal[];
  /**
   * Page dimensions. Documents with uniform page size may report one entry
   * (applied to every page) or one entry per page; a page with no matching
   * entry is treated as NOT_ASSESSABLE for that page's images.
   */
  readonly pageDimensions: readonly PdfPageDimensionSignal[];
  /** Total page count, for pages that carry no images. */
  readonly pageCount: number;
}

/**
 * Injectable PDF image-region probe. Real implementations shell out to
 * `pdfimages -list` + `pdfinfo` (see the test-support real prober); tests
 * inject deterministic synthetic signals.
 */
export type PdfImageRegionProbe = (
  bytes: Uint8Array,
) => Promise<PdfImageRegionSignals> | PdfImageRegionSignals;

// ---------------------------------------------------------------------------
// Assessment state model (Part D)
// ---------------------------------------------------------------------------

/**
 * Graphical-semantic risk assessment states.
 *
 * Deliberately does NOT reuse RepresentationFidelity's "VERIFIED" vocabulary
 * (DRA-ENG-017, Part I): this mechanism never establishes that graphical
 * semantics ARE complete, only that no structural risk signal fired. A
 * native-text document with an inaccessible raster figure must never read
 * as "verified complete" — see GRAPHICAL_SEMANTICS_REPRESENTED's rationale
 * below for the precise, weaker claim it makes instead.
 */
export type GraphicalSemanticAssessmentState =
  /** No image region met the materiality threshold (or none exist at all). */
  | "GRAPHICAL_SEMANTICS_NOT_PRESENT"
  /**
   * A materially-sized image region exists, but the same page's own text is
   * dense enough that the page structurally resembles narrated content, not
   * a standalone undocumented figure. This is a STRUCTURAL signal that risk
   * is lower, not a determination that the figure's meaning is captured.
   */
  | "GRAPHICAL_SEMANTICS_REPRESENTED"
  /**
   * A materially-sized image region exists on a page whose own text is too
   * sparse to plausibly narrate it. Caption or cross-reference text alone
   * does not clear this state — DRA-DOC-0029's diagram page carries a
   * caption yet was confirmed to lose materially non-redundant meaning, so
   * caption presence is recorded for transparency but never treated as
   * proof of completeness.
   */
  | "POTENTIAL_GRAPHICAL_SEMANTIC_LOSS"
  /** Insufficient signal to assess (non-PDF source, or no probe supplied). */
  | "GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE";

/** Per-page finding for a single page that met the image-materiality threshold. */
export interface MaterialImagePageFinding {
  readonly page: number;
  /** Combined image area / page area, for the largest image on this page. */
  readonly pageCoverageRatio: number;
  /** Character length of this page's own extracted text. */
  readonly localTextLength: number;
  /** Whether a generic figure/table/chart/... caption marker was found on this page. */
  readonly captionMarkerDetected: boolean;
}

export interface GraphicalSemanticRiskAssessment {
  readonly state: GraphicalSemanticAssessmentState;
  readonly rationale: string;
  /** Every page that met the image-materiality threshold, worst-first. */
  readonly materialImagePageFindings: readonly MaterialImagePageFinding[];
  /** Detector algorithm version, independent of evaluatorVersion/pipelineVersion. */
  readonly detectorVersion: string;
}

export const GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

/**
 * Minimum image-area/page-area ratio for an image to be considered
 * "materially sized" (as opposed to a logo, icon, or decorative mark).
 * Calibrated against DRA-DOC-0029's confirmed diagram pages (~18-27%
 * coverage) and DRA-DOC-0028's largest embedded raster elements (icons,
 * <2% coverage even at their most generous size), with wide margin on
 * both sides.
 */
export const MATERIAL_IMAGE_COVERAGE_THRESHOLD = 0.15;

/**
 * Upper coverage bound: an image covering more than this fraction of a page
 * is treated as a full-bleed background/cover element (a common PDF
 * authoring convention — title pages, section dividers, watermarks) rather
 * than a discrete content figure. Content figures observed across the
 * corpus (data charts, diagrams) sit well under this even at their largest;
 * near-100% coverage recurring across many otherwise-unrelated pages is a
 * template/background signal, not a content signal.
 */
export const FULL_BLEED_COVERAGE_CEILING = 0.85;

/**
 * First and last pages are excluded from consideration on documents long
 * enough to have a meaningful "interior" (more than 3 pages). Cover pages
 * and back covers/back matter conventionally carry publisher branding,
 * title art, or back-cover design rather than document-specific graphical
 * content, and are a leading source of coverage false positives (title-page
 * background art, back-cover logos). This is a structural PDF-authoring
 * convention, not a document-specific rule.
 */
const COVER_PAGE_EXCLUSION_MIN_PAGE_COUNT = 3;

/**
 * Minimum same-page extracted-text length, in characters, for a page to be
 * treated as "narrated" rather than "sparse." Calibrated against
 * DRA-DOC-0029's confirmed diagram page (1,104 characters, an outlier low
 * page) vs. its own ordinary prose pages (4,900-9,000 characters).
 */
export const SUBSTANTIAL_LOCAL_TEXT_THRESHOLD = 2500;

/** Generic caption/cross-reference vocabulary. No document-specific terms. */
const CAPTION_MARKER_RE = /\b(figure|fig\.?|table|chart|diagram|graph|map|exhibit|appendix)\s*\d*[:.\-]?/i;

// ---------------------------------------------------------------------------
// assessGraphicalSemanticRisk
// ---------------------------------------------------------------------------

/**
 * Assesses graphical-semantic risk for a single document.
 *
 * @param mediaType      Source media type (e.g. "application/pdf"). Only PDF
 *                        is currently assessable; all other types return
 *                        GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE.
 * @param bytes           Raw source bytes.
 * @param extractedText   The document's canonical extracted text, produced
 *                         with page breaks preserved as form-feed (\f)
 *                         characters (pdftotext's default page separator).
 *                         Text without page breaks is still accepted but
 *                         degrades per-page localisation to whole-document
 *                         granularity.
 * @param probe            Injectable image-region probe. Absent -> NOT_ASSESSABLE.
 */
export async function assessGraphicalSemanticRisk(
  mediaType: string,
  bytes: Uint8Array,
  extractedText: string,
  probe?: PdfImageRegionProbe,
): Promise<GraphicalSemanticRiskAssessment> {
  if (mediaType !== "application/pdf") {
    return Object.freeze({
      state: "GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE",
      rationale: `Media type ${mediaType} is not a supported graphical-region signal source.`,
      materialImagePageFindings: [],
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  if (probe === undefined) {
    return Object.freeze({
      state: "GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE",
      rationale: "No image-region probe supplied; graphical-semantic risk cannot be assessed without it.",
      materialImagePageFindings: [],
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  let signals: PdfImageRegionSignals;
  try {
    signals = await probe(bytes);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Object.freeze({
      state: "GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE",
      rationale: `Image-region probe threw unexpectedly: ${msg}`,
      materialImagePageFindings: [],
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  if (signals.images.length === 0) {
    return Object.freeze({
      state: "GRAPHICAL_SEMANTICS_NOT_PRESENT",
      rationale: "No embedded raster image regions detected.",
      materialImagePageFindings: [],
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  const pageDimByNumber = new Map<number, PdfPageDimensionSignal>();
  for (const dim of signals.pageDimensions) {
    pageDimByNumber.set(dim.page, dim);
  }
  // Fallback: a single uniform page size (common case) applies to every page.
  const uniformDim = signals.pageDimensions.length === 1 ? signals.pageDimensions[0] : undefined;

  // Compute coverage ratio per image, keep the largest per page.
  const bestCoverageByPage = new Map<number, number>();
  for (const img of signals.images) {
    const dim = pageDimByNumber.get(img.page) ?? uniformDim;
    if (dim === undefined || dim.widthPt <= 0 || dim.heightPt <= 0) continue;
    if (img.xPpi <= 0 || img.yPpi <= 0) continue;
    const imageWidthIn = img.widthPx / img.xPpi;
    const imageHeightIn = img.heightPx / img.yPpi;
    const pageWidthIn = dim.widthPt / 72;
    const pageHeightIn = dim.heightPt / 72;
    const pageAreaIn2 = pageWidthIn * pageHeightIn;
    if (pageAreaIn2 <= 0) continue;
    const coverage = (imageWidthIn * imageHeightIn) / pageAreaIn2;
    const prior = bestCoverageByPage.get(img.page) ?? 0;
    if (coverage > prior) bestCoverageByPage.set(img.page, coverage);
  }

  const excludeCoverPages = signals.pageCount > COVER_PAGE_EXCLUSION_MIN_PAGE_COUNT;
  const materialPages = [...bestCoverageByPage.entries()]
    .filter(([page, coverage]) => {
      if (coverage < MATERIAL_IMAGE_COVERAGE_THRESHOLD) return false;
      if (coverage > FULL_BLEED_COVERAGE_CEILING) return false;
      if (excludeCoverPages && (page === 1 || page === signals.pageCount)) return false;
      return true;
    })
    .sort((a, b) => b[1] - a[1]);

  if (materialPages.length === 0) {
    return Object.freeze({
      state: "GRAPHICAL_SEMANTICS_NOT_PRESENT",
      rationale:
        `${signals.images.length} embedded image region(s) found, none reached the ` +
        `${(MATERIAL_IMAGE_COVERAGE_THRESHOLD * 100).toFixed(0)}% page-coverage materiality threshold ` +
        `(consistent with logos, icons, or decorative marks).`,
      materialImagePageFindings: [],
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  const textPages = extractedText.split("\f");
  const findings: MaterialImagePageFinding[] = materialPages.map(([page, coverage]) => {
    // Prefer page-indexed lookup when the text has enough form-feed-delimited
    // pages to correspond 1:1 with PDF pages; otherwise fall back to the
    // whole document (degrades localisation, never crashes).
    const localText =
      textPages.length >= page ? (textPages[page - 1] ?? "") : extractedText;
    return Object.freeze({
      page,
      pageCoverageRatio: coverage,
      localTextLength: localText.length,
      captionMarkerDetected: CAPTION_MARKER_RE.test(localText),
    });
  });

  const sparseFindings = findings.filter((f) => f.localTextLength < SUBSTANTIAL_LOCAL_TEXT_THRESHOLD);

  if (sparseFindings.length > 0) {
    return Object.freeze({
      state: "POTENTIAL_GRAPHICAL_SEMANTIC_LOSS",
      rationale:
        `${sparseFindings.length} page(s) carry a materially-sized image region ` +
        `(>=${(MATERIAL_IMAGE_COVERAGE_THRESHOLD * 100).toFixed(0)}% page coverage) with fewer than ` +
        `${SUBSTANTIAL_LOCAL_TEXT_THRESHOLD} characters of same-page extracted text ` +
        `(e.g. page ${sparseFindings[0]?.page}: ${sparseFindings[0]?.localTextLength} chars). ` +
        "Caption/cross-reference markers, where present, are recorded but do not resolve this risk " +
        "(see DRA-DOC-0029: a caption existed yet materially non-redundant meaning was still lost).",
      materialImagePageFindings: findings,
      detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
    });
  }

  return Object.freeze({
    state: "GRAPHICAL_SEMANTICS_REPRESENTED",
    rationale:
      `${findings.length} materially-sized image region(s) found, all on pages with ` +
      `>=${SUBSTANTIAL_LOCAL_TEXT_THRESHOLD} characters of same-page extracted text — structurally ` +
      "consistent with narrated content. This is a lowered-risk signal, not a proof that the " +
      "image's specific meaning is captured.",
    materialImagePageFindings: findings,
    detectorVersion: GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION,
  });
}
