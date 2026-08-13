/**
 * DRA-ENG-024 — Multi-Column Reading-Order Preservation
 * Module: column-layout-reconstruction.ts
 *
 * Purpose
 * -------
 * DRA-ACQ-030 Phase 2 demonstrated that `pdftotext -layout` (DRA's production
 * PDF extraction convention) interleaves text across columns on multi-column
 * pages: 55% of true-order paragraph pairs were interleaved and 100% of
 * column-transition pairs were broken on a 3-column Federal Register
 * granule, producing a measured, material downstream divergence (217 vs 328
 * statements) even though the final decision happened to be unaffected.
 *
 * This module is a bounded, document-independent reading-order
 * reconstruction layer that operates on word/line bounding-box positions
 * (the same primitive used in the DRA-ACQ-030 Phase 2 oracle construction).
 * It is deliberately narrow:
 *
 *   - It detects columns from the spatial distribution of text blocks on a
 *     page, using gap-based 1-D clustering — no fixed column count, no
 *     document-specific coordinates.
 *   - It reconstructs reading order only when it can do so with structural
 *     confidence (clear, well-separated column bands with enough evidence
 *     in each). Anything else — single-column pages, ambiguous layouts,
 *     table-like grids — is left as PASSTHROUGH: the original extraction
 *     order is preserved unchanged, and the uncertainty is recorded rather
 *     than silently resolved.
 *   - It never fabricates or drops text: reconstruction is a pure reordering
 *     of the same block set the extractor already produced.
 *
 * This mirrors the architectural pattern already used by DRA-ENG-015
 * (representation-boundary detection) and DRA-ENG-017 (representation
 * provenance/fidelity): a decoupled, versioned assessment module that
 * augments — but does not silently override — the existing pipeline, with
 * explicit fail-safe behaviour when confidence is insufficient.
 */

// ---------------------------------------------------------------------------
// Detector version
// ---------------------------------------------------------------------------

export const COLUMN_LAYOUT_DETECTOR_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Input model — word/line bounding boxes
// ---------------------------------------------------------------------------

/** A single positioned text block on a page (paragraph/line granularity,
 * matching what `pdftotext -bbox-layout` reports as a `<block>`). */
export interface LayoutBlock {
  readonly xMin: number;
  readonly yMin: number;
  readonly xMax: number;
  readonly yMax: number;
  readonly text: string;
}

/** All blocks on one page, in the extractor's original (production) order.
 * `pageWidth`/`pageHeight` are optional; when absent they are estimated from
 * the blocks themselves (max xMax / yMax observed). */
export interface LayoutPage {
  readonly pageNumber: number;
  readonly blocks: readonly LayoutBlock[];
  readonly pageWidth?: number;
  readonly pageHeight?: number;
}

/** An injectable prober that extracts positioned blocks per page from raw
 * PDF bytes. Mirrors the PdfExtractor/PdfRepresentationProber injection
 * pattern elsewhere in this package — production code shells out to
 * `pdftotext -bbox-layout`; tests inject deterministic fixtures. */
export type PdfLayoutProber = (
  bytes: Uint8Array,
) => Promise<readonly LayoutPage[]> | readonly LayoutPage[];

// ---------------------------------------------------------------------------
// Output model
// ---------------------------------------------------------------------------

export const LAYOUT_RECONSTRUCTION_METHOD_VALUES = [
  /** Page has one column (or reconstruction found no evidence of more);
   * original block order is used unchanged. */
  "SINGLE_COLUMN_PASSTHROUGH",
  /** Multiple columns were detected with sufficient structural confidence;
   * text was reordered column-by-column, top-to-bottom, left-to-right. */
  "COLUMN_RECONSTRUCTED",
  /** Multiple candidate column clusters were found, but confidence was
   * insufficient (unbalanced clusters, weak gap separation, too few
   * blocks) — original order is preserved and the ambiguity is disclosed. */
  "AMBIGUOUS_PASSTHROUGH",
  /** The page's block layout looks tabular/grid-like (many short, numeric
   * blocks) rather than column prose; reconstruction is skipped to avoid
   * reordering a table as prose. */
  "TABLE_LIKE_PASSTHROUGH",
] as const;

export type LayoutReconstructionMethod =
  (typeof LAYOUT_RECONSTRUCTION_METHOD_VALUES)[number];

export const LAYOUT_CONFIDENCE_VALUES = ["HIGH", "LOW", "NOT_APPLICABLE"] as const;
export type LayoutConfidence = (typeof LAYOUT_CONFIDENCE_VALUES)[number];

export interface PageReconstructionResult {
  readonly pageNumber: number;
  readonly method: LayoutReconstructionMethod;
  readonly confidence: LayoutConfidence;
  readonly columnsDetected: number;
  readonly text: string;
  readonly rationale: string;
}

export interface DocumentReconstructionResult {
  /** Final text: page texts joined by a blank line, in page order. */
  readonly text: string;
  readonly pages: readonly PageReconstructionResult[];
  /** True only if at least one page used COLUMN_RECONSTRUCTED — i.e. the
   * final text differs in order from a naive block concatenation. */
  readonly anyPageReconstructed: boolean;
  /** True if at least one page was multi-column-like but fell back to
   * passthrough for lack of confidence (AMBIGUOUS_PASSTHROUGH or
   * TABLE_LIKE_PASSTHROUGH). Callers can use this to avoid silently
   * treating the document as reliably ordered. */
  readonly anyPageUncertain: boolean;
  readonly detectorVersion: string;
}

// ---------------------------------------------------------------------------
// Tunable, structural (non-document-specific) thresholds
// ---------------------------------------------------------------------------

/** Minimum number of non-spanning blocks required before attempting column
 * clustering at all; below this there is not enough evidence either way. */
const MIN_BLOCKS_FOR_CLUSTERING = 6;

/** A block whose width exceeds this fraction of the page's overall content
 * width is treated as a column-spanning element (heading, banner, rule)
 * rather than column content. Deliberately high (near-full-width): a
 * genuinely wide-but-partial column (e.g. an asymmetric main-column +
 * sidebar layout) must not be misclassified as a spanning heading merely
 * for being wider than its neighbour. */
const SPANNING_WIDTH_FRACTION = 0.85;

/** Minimum blocks required in every candidate column cluster for the
 * cluster set to be considered well-evidenced. */
const MIN_BLOCKS_PER_COLUMN = 2;

/** A gap between clusters must be at least this many times the larger of
 * the two clusters' internal spread to count as a confident separation. */
const MIN_GAP_TO_SPREAD_RATIO = 1.8;

/** Absolute minimum gap (in the same units as bounding boxes, typically
 * PDF points) below which a gap is never treated as a column boundary,
 * regardless of spread ratio — guards against clustering noise on narrow
 * single-column text with minor jitter. */
const MIN_ABSOLUTE_GAP = 8;

/** Maximum number of columns considered. PDF prose layouts in the observed
 * corpus (and general practice) do not exceed this; capping bounds runtime
 * and avoids over-fitting noise as columns. */
const MAX_COLUMNS = 5;

/** A page is treated as TABLE_LIKE (grid, not column prose) when at least
 * this fraction of its non-spanning blocks are short numeric/symbolic
 * tokens rather than prose fragments. */
const TABLE_LIKE_NUMERIC_FRACTION = 0.4;

const NUMERIC_TOKEN_RE = /^[\s\d.,%$()\u2013\u2014-]+$/;

// ---------------------------------------------------------------------------
// Running-header/footer ("page furniture") row detection
// ---------------------------------------------------------------------------
//
// Real-world multi-column pages (e.g. government gazette layouts) commonly
// carry a running header/footer assembled from several short, separately
// positioned text fragments (page-processing stamps, filenames, docket
// numbers) at a near-identical y-position, spread across most of the page
// width. Left unfiltered, these fragments' xMin values fill in the true
// inter-column gaps and defeat gap-based column detection. This is a
// general layout phenomenon — not specific to any one publisher — so it is
// detected structurally: a row is "furniture" only if it has many members,
// each individually narrow, packed with small internal gaps, and NOT the
// kind of two-or-three-wide-block row a coincidental same-y multi-column
// paragraph start would produce.

/** Blocks whose yMin values fall within this tolerance are treated as
 * belonging to the same horizontal row. */
const ROW_Y_TOLERANCE = 2.5;

/** Minimum member count for a row to be considered as a furniture-row
 * candidate (a genuine multi-column coincidental same-y row rarely exceeds
 * the actual column count, typically 2-4; furniture rows assembled from
 * many short stamps/labels routinely exceed this). */
const FURNITURE_ROW_MIN_MEMBERS = 5;

/** Minimum fraction of content width the row's members must collectively
 * span for it to be considered a running header/footer rather than a
 * localised cluster of short labels. */
const FURNITURE_ROW_MIN_WIDTH_FRACTION = 0.4;

/** Maximum internal gap between consecutive (x-sorted) members for the row
 * to be treated as one continuous running line, rather than several
 * unrelated blocks that merely happen to share a y-position. */
const FURNITURE_ROW_MAX_INTERNAL_GAP = 20;

export interface Row {
  readonly yMin: number;
  readonly members: number[];
}

export function groupIntoRows(blocks: readonly LayoutBlock[], indices: readonly number[]): Row[] {
  const sorted = [...indices].sort((a, b) => blocks[a].yMin - blocks[b].yMin);
  const rows: Row[] = [];
  for (const idx of sorted) {
    const y = blocks[idx].yMin;
    const last = rows[rows.length - 1];
    if (last !== undefined && Math.abs(last.yMin - y) <= ROW_Y_TOLERANCE) {
      last.members.push(idx);
    } else {
      rows.push({ yMin: y, members: [idx] });
    }
  }
  return rows;
}

export function isFurnitureRow(blocks: readonly LayoutBlock[], row: Row, contentWidth: number): boolean {
  if (row.members.length < FURNITURE_ROW_MIN_MEMBERS) return false;
  const sorted = [...row.members].sort((a, b) => blocks[a].xMin - blocks[b].xMin);
  const unionMin = Math.min(...sorted.map((i) => blocks[i].xMin));
  const unionMax = Math.max(...sorted.map((i) => blocks[i].xMax));
  const widthFraction = (unionMax - unionMin) / contentWidth;
  if (widthFraction < FURNITURE_ROW_MIN_WIDTH_FRACTION) return false;
  for (let i = 1; i < sorted.length; i++) {
    const gap = blocks[sorted[i]].xMin - blocks[sorted[i - 1]].xMax;
    if (gap > FURNITURE_ROW_MAX_INTERNAL_GAP) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Column detection — 1-D gap-based clustering on xMin
// ---------------------------------------------------------------------------

export interface ClusterCandidate {
  readonly xMin: number;
  readonly xMax: number;
  readonly members: number[]; // indices into the block array
}

/** Splits `values` (paired with block indices) into clusters by repeatedly
 * cutting at the largest remaining gap, up to maxClusters, then evaluates
 * whether the resulting partition is a confident column split. Returns the
 * partition with the highest column count that still passes the confidence
 * test, or a single cluster (no confident split) otherwise. */
export function clusterByXMin(
  blocks: readonly LayoutBlock[],
  indices: readonly number[],
): { clusters: ClusterCandidate[]; confident: boolean } {
  const sorted = [...indices].sort((a, b) => blocks[a].xMin - blocks[b].xMin);

  // Build the sorted gap list between consecutive xMins.
  const gaps: { at: number; size: number }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const size = blocks[sorted[i]].xMin - blocks[sorted[i - 1]].xMin;
    gaps.push({ at: i, size });
  }
  gaps.sort((a, b) => b.size - a.size);

  // Try splitting at the top (maxColumns - 1) largest gaps, from most
  // splits down to none, and accept the first (highest column count)
  // partition that passes the confidence test.
  for (let k = Math.min(MAX_COLUMNS - 1, gaps.length); k >= 1; k--) {
    const cutPoints = gaps
      .slice(0, k)
      .map((g) => g.at)
      .sort((a, b) => a - b);

    const clusters: ClusterCandidate[] = [];
    let start = 0;
    for (const cut of cutPoints) {
      const members = sorted.slice(start, cut);
      if (members.length > 0) {
        const xs = members.map((i) => blocks[i].xMin);
        clusters.push({ xMin: Math.min(...xs), xMax: Math.max(...xs), members });
      }
      start = cut;
    }
    const lastMembers = sorted.slice(start);
    if (lastMembers.length > 0) {
      const xs = lastMembers.map((i) => blocks[i].xMin);
      clusters.push({ xMin: Math.min(...xs), xMax: Math.max(...xs), members: lastMembers });
    }

    if (clusters.length < 2) continue;
    if (clusters.some((c) => c.members.length < MIN_BLOCKS_PER_COLUMN)) continue;

    // Verify every boundary gap is confidently larger than the adjoining
    // clusters' internal spread.
    let allBoundariesConfident = true;
    for (let i = 1; i < clusters.length; i++) {
      const prev = clusters[i - 1];
      const cur = clusters[i];
      const gapSize = cur.xMin - prev.xMax;
      const spreadPrev = prev.xMax - prev.xMin;
      const spreadCur = cur.xMax - cur.xMin;
      const spread = Math.max(spreadPrev, spreadCur, 1);
      if (gapSize < MIN_ABSOLUTE_GAP || gapSize < spread * MIN_GAP_TO_SPREAD_RATIO) {
        allBoundariesConfident = false;
        break;
      }
    }

    if (allBoundariesConfident) {
      return { clusters, confident: true };
    }
  }

  // No confident multi-cluster split found; treat as a single cluster.
  const xs = sorted.map((i) => blocks[i].xMin);
  return {
    clusters: [{ xMin: Math.min(...xs), xMax: Math.max(...xs), members: sorted }],
    confident: false,
  };
}

// ---------------------------------------------------------------------------
// Per-page reconstruction
// ---------------------------------------------------------------------------

export function isNumericLikeToken(text: string): boolean {
  return NUMERIC_TOKEN_RE.test(text.trim()) && text.trim().length > 0;
}

/** Diagnostic snapshot of a page's intermediate reconstruction state — row
 * grouping, spanning/content split, and column clustering — exposed
 * read-only for evidence-gathering/analysis tooling (e.g. DRA-ENG-025's
 * residual-failure corpus). Purely additive: does not change
 * `reconstructPage`'s behaviour or output, only exposes the same
 * intermediate values it already computes internally. */
export interface PageReconstructionDiagnostics {
  readonly pageNumber: number;
  readonly contentWidth: number;
  readonly rows: readonly Row[];
  readonly spanningIndices: readonly number[];
  readonly contentIndices: readonly number[];
  readonly numericFraction: number;
  readonly clusters: readonly ClusterCandidate[];
  readonly clusteringConfident: boolean;
}

export function diagnosePage(page: LayoutPage): PageReconstructionDiagnostics {
  const { blocks } = page;
  const pageMinX = blocks.length ? Math.min(...blocks.map((b) => b.xMin)) : 0;
  const pageMaxX = blocks.length ? Math.max(...blocks.map((b) => b.xMax)) : 0;
  const contentWidth = Math.max(pageMaxX - pageMinX, 1);

  const allIndices = blocks.map((_, i) => i);
  const rows = groupIntoRows(blocks, allIndices);

  const spanningIndices: number[] = [];
  const contentIndices: number[] = [];
  for (const row of rows) {
    if (row.members.length === 1) {
      const b = blocks[row.members[0]];
      const width = b.xMax - b.xMin;
      if (width >= contentWidth * SPANNING_WIDTH_FRACTION) {
        spanningIndices.push(row.members[0]);
      } else {
        contentIndices.push(row.members[0]);
      }
      continue;
    }
    if (isFurnitureRow(blocks, row, contentWidth)) {
      spanningIndices.push(...row.members);
    } else {
      contentIndices.push(...row.members);
    }
  }

  const numericCount = contentIndices.filter((i) => isNumericLikeToken(blocks[i].text)).length;
  const numericFraction = contentIndices.length === 0 ? 0 : numericCount / contentIndices.length;

  const { clusters, confident } =
    contentIndices.length >= MIN_BLOCKS_FOR_CLUSTERING
      ? clusterByXMin(blocks, contentIndices)
      : { clusters: [], confident: false };

  return {
    pageNumber: page.pageNumber,
    contentWidth,
    rows,
    spanningIndices,
    contentIndices,
    numericFraction,
    clusters,
    clusteringConfident: confident,
  };
}

function reconstructPage(page: LayoutPage): PageReconstructionResult {
  const { blocks } = page;

  if (blocks.length === 0) {
    return {
      pageNumber: page.pageNumber,
      method: "SINGLE_COLUMN_PASSTHROUGH",
      confidence: "NOT_APPLICABLE",
      columnsDetected: 0,
      text: "",
      rationale: "Page has no blocks.",
    };
  }

  const originalText = blocks.map((b) => b.text).join("\n");

  const pageMinX = Math.min(...blocks.map((b) => b.xMin));
  const pageMaxX = Math.max(...blocks.map((b) => b.xMax));
  const contentWidth = Math.max(pageMaxX - pageMinX, 1);

  // Separate column-spanning material (single wide heading/banner blocks,
  // and multi-fragment running header/footer rows — see isFurnitureRow)
  // from column-content blocks, using row grouping so that a footer/header
  // assembled from several short fragments at one y-position is recognised
  // collectively, not just single very-wide blocks.
  const allIndices = blocks.map((_, i) => i);
  const rows = groupIntoRows(blocks, allIndices);

  const spanningIndices: number[] = [];
  const contentIndices: number[] = [];
  for (const row of rows) {
    if (row.members.length === 1) {
      const b = blocks[row.members[0]];
      const width = b.xMax - b.xMin;
      if (width >= contentWidth * SPANNING_WIDTH_FRACTION) {
        spanningIndices.push(row.members[0]);
      } else {
        contentIndices.push(row.members[0]);
      }
      continue;
    }
    if (isFurnitureRow(blocks, row, contentWidth)) {
      spanningIndices.push(...row.members);
    } else {
      contentIndices.push(...row.members);
    }
  }

  if (contentIndices.length < MIN_BLOCKS_FOR_CLUSTERING) {
    return {
      pageNumber: page.pageNumber,
      method: "SINGLE_COLUMN_PASSTHROUGH",
      confidence: "HIGH",
      columnsDetected: 1,
      text: originalText,
      rationale:
        `Only ${contentIndices.length} non-spanning block(s) — below the ` +
        `${MIN_BLOCKS_FOR_CLUSTERING}-block evidence threshold for column clustering; ` +
        "treated as single-column and left unchanged.",
    };
  }

  // Table-like guard: skip reconstruction if the page looks like a numeric
  // grid rather than column prose.
  const numericCount = contentIndices.filter((i) => isNumericLikeToken(blocks[i].text)).length;
  if (numericCount / contentIndices.length >= TABLE_LIKE_NUMERIC_FRACTION) {
    return {
      pageNumber: page.pageNumber,
      method: "TABLE_LIKE_PASSTHROUGH",
      confidence: "LOW",
      columnsDetected: 0,
      text: originalText,
      rationale:
        `${numericCount}/${contentIndices.length} blocks are short numeric/symbolic tokens ` +
        `(>= ${(TABLE_LIKE_NUMERIC_FRACTION * 100).toFixed(0)}% threshold) — page looks tabular; ` +
        "reconstruction skipped to avoid reordering a table as prose.",
    };
  }

  const { clusters, confident } = clusterByXMin(blocks, contentIndices);

  if (!confident || clusters.length < 2) {
    return {
      pageNumber: page.pageNumber,
      method: clusters.length < 2 ? "SINGLE_COLUMN_PASSTHROUGH" : "AMBIGUOUS_PASSTHROUGH",
      confidence: clusters.length < 2 ? "HIGH" : "LOW",
      columnsDetected: clusters.length,
      text: originalText,
      rationale:
        clusters.length < 2
          ? "No structurally confident multi-column split found; treated as single-column."
          : `${clusters.length} candidate column cluster(s) found but boundary gaps were not ` +
            "confidently larger than within-cluster spread; original order preserved rather than " +
            "guessing at column boundaries.",
    };
  }

  // Confident multi-column split. Sort clusters left-to-right by xMin.
  const orderedClusters = [...clusters].sort((a, b) => a.xMin - b.xMin);

  // Build vertical "bands" using spanning material as band boundaries: every
  // spanning row (a single wide heading block, or a grouped multi-fragment
  // furniture row) starts a new band; content blocks are assigned to the
  // band whose y-range they fall into (the band beginning at or before
  // their yMin, and before the next spanning row's yMin). Spanning rows are
  // grouped (not treated per-block) so a multi-fragment header/footer row
  // renders as one reconstructed line, left-to-right, not several.
  const spanningRows = groupIntoRows(blocks, spanningIndices);

  type Band = { readonly startY: number; readonly headingText: string | null };
  const bands: Band[] = [{ startY: -Infinity, headingText: null }];
  for (const row of spanningRows) {
    const text = [...row.members]
      .sort((a, b) => blocks[a].xMin - blocks[b].xMin)
      .map((i) => blocks[i].text)
      .join(" ");
    bands.push({ startY: row.yMin, headingText: text });
  }

  const bandFor = (y: number): number => {
    let band = 0;
    for (let i = 0; i < bands.length; i++) {
      if (bands[i].startY <= y) band = i;
    }
    return band;
  };

  const contentByBand = new Map<number, number[]>();
  for (const cluster of orderedClusters) {
    for (const idx of cluster.members) {
      const b = bandFor(blocks[idx].yMin);
      if (!contentByBand.has(b)) contentByBand.set(b, []);
      contentByBand.get(b)!.push(idx);
    }
  }

  const outputLines: string[] = [];
  for (let bandIdx = 0; bandIdx < bands.length; bandIdx++) {
    const band = bands[bandIdx];
    if (band.headingText !== null) {
      outputLines.push(band.headingText);
    }
    const memberIdxs = contentByBand.get(bandIdx) ?? [];
    // Group this band's members by which cluster they belong to, preserving
    // cluster left-to-right order, then sort within each cluster by yMin.
    for (const cluster of orderedClusters) {
      const clusterMembersInBand = memberIdxs
        .filter((i) => cluster.members.includes(i))
        .sort((a, b) => blocks[a].yMin - blocks[b].yMin);
      for (const i of clusterMembersInBand) {
        outputLines.push(blocks[i].text);
      }
    }
  }

  return {
    pageNumber: page.pageNumber,
    method: "COLUMN_RECONSTRUCTED",
    confidence: "HIGH",
    columnsDetected: orderedClusters.length,
    text: outputLines.join("\n"),
    rationale:
      `${orderedClusters.length} columns detected with confidently separated boundaries ` +
      `(gap >= ${MIN_GAP_TO_SPREAD_RATIO}x within-cluster spread, >= ${MIN_ABSOLUTE_GAP}pt absolute); ` +
      `${spanningIndices.length} column-spanning block(s) treated as band boundaries.`,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Reconstructs reading order for a document's positioned pages.
 *
 * Every page is assessed independently: single-column pages, tabular pages,
 * and structurally ambiguous multi-column candidates all fall back to their
 * original block order (PASSTHROUGH); only pages with a confidently
 * separated column structure are reordered.
 */
export function reconstructDocumentReadingOrder(
  pages: readonly LayoutPage[],
): DocumentReconstructionResult {
  const pageResults = pages
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map(reconstructPage);

  return {
    text: pageResults.map((p) => p.text).join("\n\n"),
    pages: pageResults,
    anyPageReconstructed: pageResults.some((p) => p.method === "COLUMN_RECONSTRUCTED"),
    anyPageUncertain: pageResults.some(
      (p) => p.method === "AMBIGUOUS_PASSTHROUGH" || p.method === "TABLE_LIKE_PASSTHROUGH",
    ),
    detectorVersion: COLUMN_LAYOUT_DETECTOR_VERSION,
  };
}
