/**
 * DRA-ENG-018 Part C/D/G unit tests — synthetic fixtures.
 *
 * Uses fully synthetic, injected PdfImageRegionSignals (no real PDF bytes,
 * no document-specific vocabulary at all) to exercise every assessment
 * state and threshold boundary in isolation, before the real-PDF regression
 * suite (dra-eng-018-graphical-semantic-completeness.test.ts) runs the same
 * detector against genuine corpus documents.
 */

import { describe, it, expect } from "vitest";
import {
  assessGraphicalSemanticRisk,
  MATERIAL_IMAGE_COVERAGE_THRESHOLD,
  SUBSTANTIAL_LOCAL_TEXT_THRESHOLD,
  type PdfImageRegionProbe,
  type PdfImageRegionSignals,
} from "../graphical-semantic-risk.js";

const PAGE_LETTER = { widthPt: 612, heightPt: 792 }; // 8.5in x 11in = 93.5 in^2

function probeReturning(signals: PdfImageRegionSignals): PdfImageRegionProbe {
  return () => signals;
}

function sparseProseChars(n: number): string {
  return "word ".repeat(Math.ceil(n / 5)).slice(0, n);
}

describe("DRA-ENG-018 assessGraphicalSemanticRisk — unit", () => {
  it("returns GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE for a non-PDF media type", async () => {
    const result = await assessGraphicalSemanticRisk("text/html", new Uint8Array(), "some text");
    expect(result.state).toBe("GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE");
  });

  it("returns GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE when no probe is supplied", async () => {
    const result = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), "some text");
    expect(result.state).toBe("GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE");
  });

  it("returns GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE when the probe throws", async () => {
    const probe: PdfImageRegionProbe = () => {
      throw new Error("boom");
    };
    const result = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), "some text", probe);
    expect(result.state).toBe("GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE");
    expect(result.rationale).toContain("boom");
  });

  it("returns GRAPHICAL_SEMANTICS_NOT_PRESENT when there are no images at all", async () => {
    const probe = probeReturning({ images: [], pageDimensions: [PAGE_LETTER as any], pageCount: 3 });
    const result = await assessGraphicalSemanticRisk(
      "application/pdf",
      new Uint8Array(),
      "page one text\fpage two text\fpage three text",
      probe,
    );
    expect(result.state).toBe("GRAPHICAL_SEMANTICS_NOT_PRESENT");
    expect(result.materialImagePageFindings).toHaveLength(0);
  });

  it("returns GRAPHICAL_SEMANTICS_NOT_PRESENT for a logo-sized image well under the coverage threshold", async () => {
    // A small logo: 1in x 0.5in at 96 DPI => 96x48 px. Coverage vs a letter
    // page (93.5 in^2) is 0.5/93.5 ~= 0.53%, far below the 12% threshold.
    const probe = probeReturning({
      images: [{ page: 1, widthPx: 96, heightPx: 48, xPpi: 96, yPpi: 96 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 1,
    });
    const result = await assessGraphicalSemanticRisk(
      "application/pdf",
      new Uint8Array(),
      sparseProseChars(50),
      probe,
    );
    expect(result.state).toBe("GRAPHICAL_SEMANTICS_NOT_PRESENT");
  });

  it("flags POTENTIAL_GRAPHICAL_SEMANTIC_LOSS for a large image on a text-sparse page", async () => {
    // 5in x 4in at 150 DPI => 750x600 px. Coverage = 20 in^2 / 93.5 in^2 ~= 21%.
    const probe = probeReturning({
      images: [{ page: 2, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 3,
    });
    const sparsePageText = sparseProseChars(SUBSTANTIAL_LOCAL_TEXT_THRESHOLD - 500);
    const denseText = sparseProseChars(6000);
    const extractedText = [denseText, sparsePageText, denseText].join("\f");
    const result = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), extractedText, probe);
    expect(result.state).toBe("POTENTIAL_GRAPHICAL_SEMANTIC_LOSS");
    expect(result.materialImagePageFindings).toHaveLength(1);
    expect(result.materialImagePageFindings[0]?.page).toBe(2);
    expect(result.materialImagePageFindings[0]?.pageCoverageRatio).toBeGreaterThanOrEqual(
      MATERIAL_IMAGE_COVERAGE_THRESHOLD,
    );
  });

  it("does not let a caption marker alone resolve POTENTIAL_GRAPHICAL_SEMANTIC_LOSS", async () => {
    // Same large image + sparse page, but the sparse page DOES contain a
    // generic caption line. Per DRA-DOC-0029's confirmed empirical finding,
    // caption presence must not by itself downgrade the risk state.
    const probe = probeReturning({
      images: [{ page: 1, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 1,
    });
    const captionedSparseText = `Figure 1: a diagram. ${sparseProseChars(200)}`;
    const result = await assessGraphicalSemanticRisk(
      "application/pdf",
      new Uint8Array(),
      captionedSparseText,
      probe,
    );
    expect(result.state).toBe("POTENTIAL_GRAPHICAL_SEMANTIC_LOSS");
    expect(result.materialImagePageFindings[0]?.captionMarkerDetected).toBe(true);
  });

  it("returns GRAPHICAL_SEMANTICS_REPRESENTED for a large image on a text-dense page", async () => {
    const probe = probeReturning({
      images: [{ page: 1, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 1,
    });
    const denseText = `Figure 1 shows the trend. ${sparseProseChars(6000)}`;
    const result = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), denseText, probe);
    expect(result.state).toBe("GRAPHICAL_SEMANTICS_REPRESENTED");
  });

  it("never returns a state literally named VERIFIED (Part I vocabulary separation)", async () => {
    const probe = probeReturning({
      images: [{ page: 1, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 1,
    });
    const denseText = sparseProseChars(6000);
    const result = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), denseText, probe);
    const allStates = [
      "GRAPHICAL_SEMANTICS_NOT_PRESENT",
      "GRAPHICAL_SEMANTICS_REPRESENTED",
      "POTENTIAL_GRAPHICAL_SEMANTIC_LOSS",
      "GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE",
    ];
    expect(allStates).toContain(result.state);
    expect(result.state).not.toContain("VERIFIED");
  });

  it("is deterministic across repeated calls with identical inputs", async () => {
    const probe = probeReturning({
      images: [{ page: 1, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [{ page: 1, ...PAGE_LETTER }],
      pageCount: 1,
    });
    const text = sparseProseChars(1000);
    const r1 = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), text, probe);
    const r2 = await assessGraphicalSemanticRisk("application/pdf", new Uint8Array(), text, probe);
    expect(r1.state).toBe(r2.state);
    expect(r1.materialImagePageFindings).toEqual(r2.materialImagePageFindings);
  });

  it("skips images whose page has no matching page-dimension entry and no uniform fallback", async () => {
    const probe = probeReturning({
      images: [{ page: 5, widthPx: 750, heightPx: 600, xPpi: 150, yPpi: 150 }],
      pageDimensions: [
        { page: 1, ...PAGE_LETTER },
        { page: 2, ...PAGE_LETTER },
      ],
      pageCount: 5,
    });
    const result = await assessGraphicalSemanticRisk(
      "application/pdf",
      new Uint8Array(),
      sparseProseChars(50),
      probe,
    );
    // Page 5 has no matching dimension entry (multiple non-uniform entries
    // present, so no single-entry fallback applies) -> image is un-scorable
    // and safely excluded rather than mis-scored.
    expect(result.state).toBe("GRAPHICAL_SEMANTICS_NOT_PRESENT");
  });
});

describe("DRA-ENG-018 Part C — no forbidden document-specific vocabulary", () => {
  it("contains no CDC/Legionella/causal-diagram-specific literals in the detector module", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");
    const srcPath = path.join(process.cwd(), "src/benchmark/acquisition/graphical-semantic-risk.ts");
    const src = await fs.readFile(srcPath, "utf-8");
    const forbidden = ["legionella", "cdc", "compost", "cooling tower", "fda", "510(k)"];
    const lower = src.toLowerCase();
    for (const term of forbidden) {
      expect(lower).not.toContain(term);
    }
  });
});
