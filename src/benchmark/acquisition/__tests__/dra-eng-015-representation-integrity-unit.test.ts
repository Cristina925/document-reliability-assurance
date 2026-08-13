/**
 * DRA-ENG-015 — Unit tests for the representation-integrity fill-colour
 * classifier, using synthetic SVG fixtures (no PDF rendering, no live I/O).
 *
 * These tests exercise the classification/threshold logic in isolation and
 * deterministically, independent of Poppler's actual rendering output. The
 * corpus-wide regression test (dra-eng-015-corpus-regression.test.ts)
 * exercises the real `pdftocairo` renderer against real cached PDFs.
 */

import { describe, it, expect } from "vitest";
import { assessPdfRepresentationIntegrity } from "../representation-integrity.js";

function svgWithFills(fills: ReadonlyArray<{ color: string; count: number }>): string {
  const parts: string[] = ["<svg>"];
  for (const { color, count } of fills) {
    for (let i = 0; i < count; i++) {
      parts.push(`<path fill="rgb(${color})" d="M0 0"/>`);
    }
  }
  parts.push("</svg>");
  return parts.join("\n");
}

describe("DRA-ENG-015 — assessPdfRepresentationIntegrity: renderer wiring", () => {
  it("returns NO_RENDERER_PROVIDED when no renderer is injected", async () => {
    const result = await assessPdfRepresentationIntegrity(new Uint8Array());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("NO_RENDERER_PROVIDED");
  });

  it("returns SVG_RENDER_FAILED when the renderer throws", async () => {
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => {
      throw new Error("boom");
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("SVG_RENDER_FAILED");
      expect(result.message).toContain("boom");
    }
  });
});

describe("DRA-ENG-015 — TEXT_COMPLETE classification", () => {
  it("classifies a document with only black text and white background as TEXT_COMPLETE", async () => {
    const svg = svgWithFills([
      { color: "0%, 0%, 0%", count: 5000 },
      { color: "100%, 100%, 100%", count: 200 },
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.signal.status).toBe("TEXT_COMPLETE");
      expect(result.signal.achromaticFillOccurrences).toBe(0);
      expect(result.signal.chromaticFillOccurrences).toBe(0);
    }
  });

  it("still classifies TEXT_COMPLETE when body text uses a 'rich black' near-black tone", async () => {
    // A common professional-typesetting convention: body text rendered in
    // e.g. rgb(13%, 12%, 12.5%) rather than pure #000000. Must not be
    // mistaken for a candidate shading fill.
    const svg = svgWithFills([
      { color: "13.7%, 12.1%, 12.5%", count: 6000 },
      { color: "100%, 100%, 100%", count: 100 },
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.signal.status).toBe("TEXT_COMPLETE");
  });
});

describe("DRA-ENG-015 — POTENTIAL_VISUAL_SEMANTICS classification (positive-shape case)", () => {
  it("flags a document using many distinct achromatic tones at real volume", async () => {
    // Synthesises the general SHAPE of the DRA-DOC-0025 finding (many
    // distinct grey tones, each above the significance threshold) without
    // using DRA-DOC-0025's actual colour values — this proves the
    // classifier reacts to the general pattern, not memorised constants.
    const tones = [30, 40, 50, 60, 70, 80, 90];
    const svg = svgWithFills([
      { color: "13%, 12%, 12%", count: 6000 },
      { color: "100%, 100%, 100%", count: 300 },
      ...tones.map((t) => ({ color: `${t}%, ${t}%, ${t}%`, count: 40 })),
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.signal.status).toBe("POTENTIAL_VISUAL_SEMANTICS");
      expect(result.signal.distinctAchromaticTones).toBe(7);
      expect(result.signal.rationale).not.toMatch(/forecast|historical|EIA|STEO/i);
    }
  });

  it("does NOT flag a single repeated achromatic tone at high volume (one boilerplate box design)", async () => {
    const svg = svgWithFills([
      { color: "13%, 12%, 12%", count: 6000 },
      { color: "100%, 100%, 100%", count: 300 },
      { color: "28.6%, 28.6%, 28.6%", count: 800 }, // one tone, reused often
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.signal.status).toBe("UNCERTAIN_VISUAL_CONTENT");
      expect(result.signal.distinctAchromaticTones).toBe(1);
    }
  });

  it("does NOT flag heavy chromatic (coloured) content alone, e.g. charts/logos/branding", async () => {
    const svg = svgWithFills([
      { color: "13%, 12%, 12%", count: 6000 },
      { color: "100%, 100%, 100%", count: 300 },
      { color: "7%, 59%, 85%", count: 500 }, // blue chart line
      { color: "32%, 61%, 20%", count: 300 }, // green chart bar
      { color: "73%, 41%, 12%", count: 200 }, // orange chart bar
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.signal.status).toBe("UNCERTAIN_VISUAL_CONTENT");
      expect(result.signal.chromaticFillOccurrences).toBe(1000);
      expect(result.signal.distinctAchromaticTones).toBe(0);
    }
  });
});

describe("DRA-ENG-015 — bucket noise resistance", () => {
  it("ignores stray anti-aliasing-scale fills below the per-bucket significance threshold", async () => {
    const svg = svgWithFills([
      { color: "13%, 12%, 12%", count: 6000 },
      { color: "100%, 100%, 100%", count: 300 },
      // 8 distinct tones but each below MIN_OCCURRENCES_PER_SIGNIFICANT_BUCKET (15)
      ...[30, 40, 50, 60, 70, 80, 85, 90].map((t) => ({ color: `${t}%, ${t}%, ${t}%`, count: 3 })),
    ]);
    const result = await assessPdfRepresentationIntegrity(new Uint8Array(), () => svg);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.signal.distinctAchromaticTones).toBe(0);
      expect(result.signal.status).not.toBe("POTENTIAL_VISUAL_SEMANTICS");
    }
  });
});
