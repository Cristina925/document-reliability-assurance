/**
 * DRA-ENG-024 — Multi-Column Reading-Order Preservation Closure
 * Synthetic layout test matrix (Section 9 of the ENG-024 task specification)
 *
 * 16 named structural cases, each built from explicit LayoutBlock
 * coordinates (no PDF/pdftotext dependency — deterministic, document-
 * independent unit fixtures). Each case asserts BOTH:
 *   - detection: was the page correctly classified as single/multi-column,
 *     and with the expected confidence;
 *   - correction (where applicable): is the reconstructed reading order
 *     actually correct — pair order, column-transition, heading placement,
 *     no missing/duplicated text.
 */

import { describe, it, expect } from "vitest";
import {
  reconstructDocumentReadingOrder,
  type LayoutBlock,
  type LayoutPage,
} from "../column-layout-reconstruction.js";

// ---------------------------------------------------------------------------
// Fixture builders
// ---------------------------------------------------------------------------

/** Builds a two-column page: leftTexts fill column A (x: 50-250), rightTexts
 * fill column B (x: 320-520), each stacked top-to-bottom with 20pt line
 * height starting at yStart. */
function twoColumnPage(
  leftTexts: string[],
  rightTexts: string[],
  opts: { yStart?: number; heading?: string } = {},
): LayoutPage {
  const yStart = opts.yStart ?? 60;
  const blocks: LayoutBlock[] = [];
  if (opts.heading) {
    blocks.push({ xMin: 50, yMin: 20, xMax: 520, yMax: 40, text: opts.heading });
  }
  leftTexts.forEach((t, i) => {
    blocks.push({ xMin: 50, yMin: yStart + i * 20, xMax: 250, yMax: yStart + i * 20 + 15, text: t });
  });
  rightTexts.forEach((t, i) => {
    blocks.push({ xMin: 320, yMin: yStart + i * 20, xMax: 520, yMax: yStart + i * 20 + 15, text: t });
  });
  return { pageNumber: 1, blocks };
}

function threeColumnPage(cols: string[][], opts: { heading?: string } = {}): LayoutPage {
  const colX = [
    [40, 200],
    [220, 380],
    [400, 560],
  ];
  const blocks: LayoutBlock[] = [];
  if (opts.heading) {
    blocks.push({ xMin: 40, yMin: 20, xMax: 560, yMax: 40, text: opts.heading });
  }
  cols.forEach((texts, colIdx) => {
    const [xMin, xMax] = colX[colIdx];
    texts.forEach((t, i) => {
      blocks.push({ xMin, yMin: 60 + i * 20, xMax, yMax: 75 + i * 20, text: t });
    });
  });
  // fix xMax typo above (xMax used as xMin's column max edge for width calc)
  return {
    pageNumber: 1,
    blocks: blocks.map((b) => (b.xMax === b.xMin ? { ...b, xMax: b.xMin + 150 } : b)),
  };
}

function singleColumnPage(lines: string[]): LayoutPage {
  return {
    pageNumber: 1,
    blocks: lines.map((t, i) => ({
      xMin: 50,
      yMin: 40 + i * 20,
      xMax: 500,
      yMax: 55 + i * 20,
      text: t,
    })),
  };
}

function orderedText(result: { pages: readonly { text: string }[] }): string[] {
  return result.pages.flatMap((p) => p.text.split("\n").filter((l) => l.length > 0));
}

// ---------------------------------------------------------------------------
// 1. Single column
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 1 — plain single column", () => {
  it("is classified SINGLE_COLUMN_PASSTHROUGH and text is unchanged", () => {
    const lines = Array.from({ length: 10 }, (_, i) => `Line ${i + 1} of single-column prose.`);
    const page = singleColumnPage(lines);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("SINGLE_COLUMN_PASSTHROUGH");
    expect(result.anyPageReconstructed).toBe(false);
    expect(orderedText(result)).toEqual(lines);
  });
});

// ---------------------------------------------------------------------------
// 2. Simple two-column
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 2 — simple two-column layout", () => {
  it("reconstructs left-column-then-right-column reading order", () => {
    const left = ["L1", "L2", "L3", "L4"];
    const right = ["R1", "R2", "R3", "R4"];
    const page = twoColumnPage(left, right);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(result.pages[0].columnsDetected).toBe(2);
    expect(orderedText(result)).toEqual([...left, ...right]);
  });
});

// ---------------------------------------------------------------------------
// 3. Simple three-column
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 3 — simple three-column layout", () => {
  it("reconstructs column-1 then column-2 then column-3 order", () => {
    const cols = [
      ["A1", "A2", "A3"],
      ["B1", "B2", "B3"],
      ["C1", "C2", "C3"],
    ];
    const page = threeColumnPage(cols);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(result.pages[0].columnsDetected).toBe(3);
    expect(orderedText(result)).toEqual(cols.flat());
  });
});

// ---------------------------------------------------------------------------
// 4. Uneven column lengths
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 4 — uneven column lengths", () => {
  it("handles a short right column and a long left column without loss", () => {
    const left = Array.from({ length: 8 }, (_, i) => `Left-${i + 1}`);
    const right = ["Right-1", "Right-2"];
    const page = twoColumnPage(left, right);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual([...left, ...right]);
  });
});

// ---------------------------------------------------------------------------
// 5. Mid-section column break (heading partway down splits into a new band)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 5 — mid-page column-spanning break", () => {
  it("treats a full-width mid-page heading as a band boundary, preserving before/after column order", () => {
    const blocks: LayoutBlock[] = [
      { xMin: 50, yMin: 60, xMax: 250, yMax: 75, text: "L1" },
      { xMin: 320, yMin: 60, xMax: 520, yMax: 75, text: "R1" },
      { xMin: 50, yMin: 80, xMax: 250, yMax: 95, text: "L2" },
      { xMin: 320, yMin: 80, xMax: 520, yMax: 95, text: "R2" },
      // full-width mid-section break
      { xMin: 50, yMin: 110, xMax: 520, yMax: 125, text: "MID-HEADING" },
      { xMin: 50, yMin: 140, xMax: 250, yMax: 155, text: "L3" },
      { xMin: 320, yMin: 140, xMax: 520, yMax: 155, text: "R3" },
      { xMin: 50, yMin: 160, xMax: 250, yMax: 175, text: "L4" },
      { xMin: 320, yMin: 160, xMax: 520, yMax: 175, text: "R4" },
    ];
    const page: LayoutPage = { pageNumber: 1, blocks };
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual(["L1", "L2", "R1", "R2", "MID-HEADING", "L3", "L4", "R3", "R4"]);
  });
});

// ---------------------------------------------------------------------------
// 6. Cross-column heading vs column-local heading
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 6 — page-top cross-column heading", () => {
  it("places a full-width top heading before both columns, then reconstructs column order", () => {
    const left = ["L1", "L2", "L3"];
    const right = ["R1", "R2", "R3"];
    const page = twoColumnPage(left, right, { heading: "SECTION TITLE" });
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual(["SECTION TITLE", ...left, ...right]);
  });

  it("does not treat a narrow column-local heading (fits within one column) as a band boundary", () => {
    // A "heading" block confined to the left column's width is column
    // content, not a spanning element; it must stay column-local.
    const blocks: LayoutBlock[] = [
      { xMin: 50, yMin: 60, xMax: 250, yMax: 75, text: "Left Sub-heading" },
      { xMin: 50, yMin: 80, xMax: 250, yMax: 95, text: "L-body-1" },
      { xMin: 50, yMin: 100, xMax: 250, yMax: 115, text: "L-body-2" },
      { xMin: 320, yMin: 60, xMax: 520, yMax: 75, text: "R1" },
      { xMin: 320, yMin: 80, xMax: 520, yMax: 95, text: "R2" },
      { xMin: 320, yMin: 100, xMax: 520, yMax: 115, text: "R3" },
    ];
    const page: LayoutPage = { pageNumber: 1, blocks };
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual(["Left Sub-heading", "L-body-1", "L-body-2", "R1", "R2", "R3"]);
  });
});

// ---------------------------------------------------------------------------
// 7. Column-order transition across a page boundary
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 7 — column transition across pages", () => {
  it("finishes page 1's columns fully before starting page 2, preserving page order", () => {
    const page1 = twoColumnPage(["P1-L1", "P1-L2"], ["P1-R1", "P1-R2"]);
    const page2: LayoutPage = { ...twoColumnPage(["P2-L1", "P2-L2"], ["P2-R1", "P2-R2"]), pageNumber: 2 };
    const result = reconstructDocumentReadingOrder([page2, page1]); // deliberately out of order input
    expect(result.pages.map((p) => p.pageNumber)).toEqual([1, 2]);
    expect(orderedText(result)).toEqual(["P1-L1", "P1-L2", "P1-R1", "P1-R2", "P2-L1", "P2-L2", "P2-R1", "P2-R2"]);
  });
});

// ---------------------------------------------------------------------------
// 8. Footnotes at column bottom
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 8 — column-bottom footnotes", () => {
  it("keeps footnote blocks within their own column's vertical order (not hoisted or reordered)", () => {
    const left = ["L-body-1", "L-body-2", "L-footnote-1"];
    const right = ["R-body-1", "R-body-2", "R-footnote-1"];
    const page = twoColumnPage(left, right);
    const result = reconstructDocumentReadingOrder([page]);
    expect(orderedText(result)).toEqual([...left, ...right]);
  });
});

// ---------------------------------------------------------------------------
// 9. Numbered paragraphs spanning columns
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 9 — numbered paragraphs across two columns", () => {
  it("preserves numbered-item order within each column without interleaving across columns", () => {
    const left = ["(1) First item.", "(2) Second item.", "(3) Third item."];
    const right = ["(4) Fourth item.", "(5) Fifth item.", "(6) Sixth item."];
    const page = twoColumnPage(left, right);
    const result = reconstructDocumentReadingOrder([page]);
    expect(orderedText(result)).toEqual([...left, ...right]);
  });
});

// ---------------------------------------------------------------------------
// 10. Mixed column widths (asymmetric two-column)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 10 — mixed/asymmetric column widths", () => {
  it("detects a narrow sidebar column and a wide main column as two distinct columns", () => {
    const blocks: LayoutBlock[] = [];
    // wide main column: x 50-380
    ["Main-1", "Main-2", "Main-3", "Main-4"].forEach((t, i) =>
      blocks.push({ xMin: 50, yMin: 60 + i * 20, xMax: 380, yMax: 75 + i * 20, text: t }),
    );
    // narrow sidebar column: x 420-520
    ["Side-1", "Side-2", "Side-3", "Side-4"].forEach((t, i) =>
      blocks.push({ xMin: 420, yMin: 60 + i * 20, xMax: 520, yMax: 75 + i * 20, text: t }),
    );
    const page: LayoutPage = { pageNumber: 1, blocks };
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual([
      "Main-1",
      "Main-2",
      "Main-3",
      "Main-4",
      "Side-1",
      "Side-2",
      "Side-3",
      "Side-4",
    ]);
  });
});

// ---------------------------------------------------------------------------
// 11. Empty column region (a "column" with no content on this page)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 11 — empty column region", () => {
  it("falls back to single-column-equivalent treatment when only one column has content", () => {
    // Only left-column blocks exist; nothing on the right at all. There is
    // no second cluster to detect, so this must not be misclassified as
    // multi-column.
    const left = Array.from({ length: 8 }, (_, i) => `Only-${i + 1}`);
    const page = twoColumnPage(left, []);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("SINGLE_COLUMN_PASSTHROUGH");
    expect(orderedText(result)).toEqual(left);
  });
});

// ---------------------------------------------------------------------------
// 12. Short final column (last page of a multi-column article)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 12 — short final column on closing page", () => {
  it("reconstructs correctly even when the second column has just above the minimum evidence", () => {
    const left = Array.from({ length: 6 }, (_, i) => `L${i + 1}`);
    const right = ["R1", "R2"]; // exactly MIN_BLOCKS_PER_COLUMN
    const page = twoColumnPage(left, right);
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual([...left, ...right]);
  });
});

// ---------------------------------------------------------------------------
// 13. Mixed prose + table page (fail-safe: do not reorder a table as prose)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 13 — table-like numeric grid", () => {
  it("classifies a numeric grid as TABLE_LIKE_PASSTHROUGH and leaves order unchanged", () => {
    const blocks: LayoutBlock[] = [];
    // A 4-column x 6-row numeric grid — short numeric tokens at regular
    // x-positions, which a naive column clusterer could easily misread as
    // prose columns.
    const colXs = [50, 150, 250, 350];
    for (let row = 0; row < 6; row++) {
      colXs.forEach((x, col) => {
        blocks.push({
          xMin: x,
          yMin: 60 + row * 18,
          xMax: x + 60,
          yMax: 73 + row * 18,
          text: `${row}.${col}`,
        });
      });
    }
    const page: LayoutPage = { pageNumber: 1, blocks };
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("TABLE_LIKE_PASSTHROUGH");
    expect(result.anyPageUncertain).toBe(true);
    expect(result.anyPageReconstructed).toBe(false);
    // Original block order (row-major) must be preserved exactly.
    expect(orderedText(result)).toEqual(blocks.map((b) => b.text));
  });
});

// ---------------------------------------------------------------------------
// 14. Ambiguous / overlapping column boundaries (fail-safe)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 14 — ambiguous overlapping columns", () => {
  it("falls back to AMBIGUOUS_PASSTHROUGH when candidate column x-ranges overlap heavily", () => {
    const blocks: LayoutBlock[] = [];
    // Two loosely-scattered clusters with no clean gap: xMin values jitter
    // across the full width with no clear separating gap.
    const xs = [50, 90, 140, 180, 230, 260, 300, 340, 380, 410];
    xs.forEach((x, i) => {
      blocks.push({ xMin: x, yMin: 60 + i * 15, xMax: x + 120, yMax: 73 + i * 15, text: `Block-${i}` });
    });
    const page: LayoutPage = { pageNumber: 1, blocks };
    const result = reconstructDocumentReadingOrder([page]);
    expect(["AMBIGUOUS_PASSTHROUGH", "SINGLE_COLUMN_PASSTHROUGH"]).toContain(result.pages[0].method);
    // Original order preserved regardless of which safe fallback applied.
    expect(orderedText(result)).toEqual(blocks.map((b) => b.text));
  });
});

// ---------------------------------------------------------------------------
// 15. Insufficient evidence (very few blocks on an otherwise two-column page)
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 15 — insufficient block evidence", () => {
  it("does not attempt reconstruction below the minimum block-count threshold", () => {
    const page = twoColumnPage(["L1", "L2"], ["R1"]); // 3 blocks total, below threshold
    const result = reconstructDocumentReadingOrder([page]);
    expect(result.pages[0].method).toBe("SINGLE_COLUMN_PASSTHROUGH");
    expect(orderedText(result)).toEqual(["L1", "L2", "R1"]);
  });
});

// ---------------------------------------------------------------------------
// 16. Multi-page document mixing single- and multi-column pages
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 synthetic case 16 — mixed single- and multi-column document", () => {
  it("reconstructs only the multi-column pages, leaving single-column pages untouched, in page order", () => {
    const singlePage = singleColumnPage(["S1", "S2", "S3"]);
    const multiPage: LayoutPage = {
      ...twoColumnPage(["M-L1", "M-L2", "M-L3"], ["M-R1", "M-R2", "M-R3"]),
      pageNumber: 2,
    };
    const result = reconstructDocumentReadingOrder([singlePage, multiPage]);
    expect(result.pages[0].method).toBe("SINGLE_COLUMN_PASSTHROUGH");
    expect(result.pages[1].method).toBe("COLUMN_RECONSTRUCTED");
    expect(orderedText(result)).toEqual(["S1", "S2", "S3", "M-L1", "M-L2", "M-L3", "M-R1", "M-R2", "M-R3"]);
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting invariant: no text is ever dropped or duplicated
// ---------------------------------------------------------------------------

describe("DRA-ENG-024 — no-loss / no-duplication invariant across all cases", () => {
  const cases: LayoutPage[] = [
    singleColumnPage(["A", "B", "C"]),
    twoColumnPage(["L1", "L2", "L3"], ["R1", "R2", "R3"]),
    threeColumnPage([
      ["A1", "A2"],
      ["B1", "B2"],
      ["C1", "C2"],
    ]),
  ];

  it("preserves the exact multiset of input block texts for every case", () => {
    for (const page of cases) {
      const result = reconstructDocumentReadingOrder([page]);
      const inputTexts = [...page.blocks.map((b) => b.text)].sort();
      const outputTexts = [...orderedText(result)].sort();
      expect(outputTexts).toEqual(inputTexts);
    }
  });
});
