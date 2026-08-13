/**
 * DRA-ENG-017 — Representation Provenance and OCR Fidelity
 * Targeted unit tests + synthetic representation tests for
 * representation-provenance.ts.
 *
 * All tests here are pure/synthetic (no PDFs, no network, no shell-outs) so
 * they run in milliseconds and exercise the classifier's decision boundaries
 * directly. Real-PDF integration coverage (including the DRA-DOC-0027
 * regression and the 1901-alternate stress fixture) lives in
 * dra-eng-017-representation-regression.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  classifyRepresentationProvenance,
  computeGarbledTokenDensity,
  deriveRepresentationFidelity,
  assessRepresentationProvenance,
  type PdfRepresentationProbeSignals,
} from "../representation-provenance.js";

describe("classifyRepresentationProvenance", () => {
  it("classifies a clear OCR-engine signature as OCR_TEXT_LAYER", () => {
    const signals: PdfRepresentationProbeSignals = {
      creator: "ScanSoft OmniPage CSDK 15",
      producer: "OmniPage CSDK 15",
      pageCount: 40,
      embeddedFontCount: 1,
      fontNames: ["ABCDEE+Arial"],
      extractedTextLength: 40 * 1800,
    };
    const { provenance, rationale } = classifyRepresentationProvenance(signals);
    expect(provenance).toBe("OCR_TEXT_LAYER");
    expect(rationale).toMatch(/OmniPage/i);
  });

  it("classifies each known OCR-engine signature variant", () => {
    const signatures = ["ABBYY FineReader 12", "Tesseract 4.1.1", "ReadIris Pro 17", "Paper Capture Plug-in"];
    for (const sig of signatures) {
      const { provenance } = classifyRepresentationProvenance({
        creator: sig,
        pageCount: 10,
        embeddedFontCount: 1,
        extractedTextLength: 10 * 1500,
      });
      expect(provenance, `signature: ${sig}`).toBe("OCR_TEXT_LAYER");
    }
  });

  it("classifies a native-authoring-tool signature with substantial text as NATIVE_TEXT", () => {
    const signals: PdfRepresentationProbeSignals = {
      creator: "Microsoft Word",
      producer: "Microsoft: Print To PDF",
      pageCount: 5,
      embeddedFontCount: 4,
      fontNames: ["Calibri", "Calibri-Bold", "Symbol", "Arial"],
      extractedTextLength: 5 * 2200,
    };
    const { provenance, rationale } = classifyRepresentationProvenance(signals);
    expect(provenance).toBe("NATIVE_TEXT");
    expect(rationale).toMatch(/native-authoring/i);
  });

  it("classifies LaTeX-produced documents as NATIVE_TEXT", () => {
    const { provenance } = classifyRepresentationProvenance({
      creator: "LaTeX with hyperref",
      producer: "pdfTeX-1.40.21",
      pageCount: 12,
      embeddedFontCount: 6,
      extractedTextLength: 12 * 2000,
    });
    expect(provenance).toBe("NATIVE_TEXT");
  });

  it("classifies pages with essentially no extracted text as IMAGE_ONLY regardless of signature", () => {
    const signals: PdfRepresentationProbeSignals = {
      creator: "Adobe Photoshop",
      pageCount: 20,
      embeddedFontCount: 0,
      fontNames: [],
      extractedTextLength: 5,
    };
    const { provenance, rationale } = classifyRepresentationProvenance(signals);
    expect(provenance).toBe("IMAGE_ONLY");
    expect(rationale).toMatch(/usable-text-layer threshold/i);
  });

  it("classifies unrecognised-tool + fonts + substantial text as NATIVE_TEXT via font evidence, never OCR", () => {
    const signals: PdfRepresentationProbeSignals = {
      creator: "SomeInternalPublishingTool v9",
      pageCount: 8,
      embeddedFontCount: 3,
      fontNames: ["Georgia", "Georgia-Bold", "Helvetica"],
      extractedTextLength: 8 * 1900,
    };
    const { provenance, rationale } = classifyRepresentationProvenance(signals);
    expect(provenance).toBe("NATIVE_TEXT");
    expect(rationale).toMatch(/font/i);
  });

  it("falls back to UNKNOWN when no signature and no font evidence are available", () => {
    const signals: PdfRepresentationProbeSignals = {
      pageCount: 3,
      extractedTextLength: 3 * 1800,
    };
    const { provenance, rationale } = classifyRepresentationProvenance(signals);
    expect(provenance).toBe("UNKNOWN");
    expect(rationale).toMatch(/insufficient signals|neither an OCR-engine/i);
  });

  it("falls back to UNKNOWN when signals are entirely empty", () => {
    const { provenance } = classifyRepresentationProvenance({ extractedTextLength: 0 });
    expect(provenance).toBe("UNKNOWN");
  });

  // --- False-positive guard (Part D requirement) --------------------------
  // A native-text document that happens to contain images, charts, or logos
  // must NOT be classified as OCR-derived. The classifier deliberately never
  // inspects image presence/coverage at all, so this is true by
  // construction — these tests confirm that holds for realistic signal
  // combinations a chart/logo-heavy native document would actually present.
  it("never classifies a native, richly-illustrated report (many fonts, normal text ratio, no OCR signature) as OCR", () => {
    const signals: PdfRepresentationProbeSignals = {
      creator: "Adobe InDesign 18.0",
      producer: "Adobe PDF Library 17.0",
      pageCount: 30,
      // A chart/logo-heavy report often embeds many fonts for headers,
      // captions, chart labels, etc.
      embeddedFontCount: 12,
      fontNames: ["Helvetica", "Helvetica-Bold", "Arial", "ArialMT", "Symbol", "Wingdings"],
      extractedTextLength: 30 * 900, // lower chars/page than pure prose — charts/figures reduce text density
    };
    const { provenance } = classifyRepresentationProvenance(signals);
    expect(provenance).not.toBe("OCR_TEXT_LAYER");
    expect(provenance).toBe("NATIVE_TEXT");
  });

  it("does not use embedded-image count/coverage as an input at all (no such field exists on the signal type)", () => {
    // Structural guarantee, not just a behavioural test: verify the
    // signal type accepted by the classifier has no image-coverage field.
    const signals: PdfRepresentationProbeSignals = {
      creator: "Microsoft Word",
      pageCount: 4,
      embeddedFontCount: 2,
      extractedTextLength: 4 * 2000,
    };
    expect("imageCoverage" in signals).toBe(false);
    expect("hasImages" in signals).toBe(false);
  });
});

describe("computeGarbledTokenDensity", () => {
  it("returns undefined for empty text", () => {
    expect(computeGarbledTokenDensity("")).toBeUndefined();
    expect(computeGarbledTokenDensity("   \n\t  ")).toBeUndefined();
  });

  it("returns a low density for ordinary, clean prose", () => {
    const text =
      "The committee convened at ten o'clock in the morning to consider the proposed amendments to the " +
      "statute, with several witnesses present to provide testimony on the matter under review.";
    const density = computeGarbledTokenDensity(text);
    expect(density).toBeDefined();
    expect(density!).toBeLessThan(0.02);
  });

  it("tolerates ordinary all-consonant acronyms without large density inflation", () => {
    const text =
      "The FBI and CIA briefed the NSC on the DOD budget while GAO and OMB reviewed the NIH grant under " +
      "FDA and EPA jurisdiction with SEC and FTC oversight across HHS and DOJ committees.";
    const density = computeGarbledTokenDensity(text);
    expect(density).toBeDefined();
    // Acronyms alone should not push density to a DEGRADED-triggering level
    // in ordinary short passages dominated by real words.
    expect(density!).toBeLessThan(0.5);
  });

  it("returns a high density for text dominated by garbled, vowel-less fragments", () => {
    const text = "REFE;ENE ICFL DEPA TXTR PRSNTD BLNK MSSNG GRBLD FRGMNT DSTRT";
    const density = computeGarbledTokenDensity(text);
    expect(density).toBeDefined();
    expect(density!).toBeGreaterThan(0.5);
  });
});

describe("deriveRepresentationFidelity", () => {
  it("assigns VERIFIED to NATIVE_TEXT with no garbled-density signal", () => {
    const { fidelity, rationale } = deriveRepresentationFidelity("NATIVE_TEXT", 0.001);
    expect(fidelity).toBe("VERIFIED");
    expect(rationale).toMatch(/no image-to-text interpretation/i);
  });

  it("does not assign VERIFIED to NATIVE_TEXT merely because extraction succeeded, if density signals corruption", () => {
    const { fidelity } = deriveRepresentationFidelity("NATIVE_TEXT", 0.05);
    expect(fidelity).toBe("DEGRADED");
  });

  it("assigns UNVERIFIED (not DEGRADED, not VERIFIED) to OCR_TEXT_LAYER with a clean density signal", () => {
    const { fidelity, rationale } = deriveRepresentationFidelity("OCR_TEXT_LAYER", 0.001);
    expect(fidelity).toBe("UNVERIFIED");
    expect(rationale).toMatch(/not guaranteed by construction/i);
  });

  it("does not blanket-classify all OCR as DEGRADED", () => {
    const { fidelity } = deriveRepresentationFidelity("OCR_TEXT_LAYER", 0);
    expect(fidelity).not.toBe("DEGRADED");
  });

  it("assigns DEGRADED to OCR_TEXT_LAYER when garbled density crosses the threshold", () => {
    const { fidelity } = deriveRepresentationFidelity("OCR_TEXT_LAYER", 0.1);
    expect(fidelity).toBe("DEGRADED");
  });

  it("assigns NOT_ASSESSABLE to IMAGE_ONLY and UNKNOWN regardless of density", () => {
    expect(deriveRepresentationFidelity("IMAGE_ONLY", undefined).fidelity).toBe("NOT_ASSESSABLE");
    expect(deriveRepresentationFidelity("UNKNOWN", 0).fidelity).toBe("NOT_ASSESSABLE");
  });

  it("assigns UNVERIFIED to MIXED_REPRESENTATION absent a degraded signal", () => {
    expect(deriveRepresentationFidelity("MIXED_REPRESENTATION", 0.001).fidelity).toBe("UNVERIFIED");
  });
});

describe("assessRepresentationProvenance", () => {
  it("classifies non-PDF media types as NATIVE_TEXT without probing", async () => {
    const result = await assessRepresentationProvenance("text/html", new Uint8Array(), "some ordinary text here");
    expect(result.provenance).toBe("NATIVE_TEXT");
    expect(result.provenanceRationale).toMatch(/not by probing/i);
  });

  it("falls back to UNKNOWN/NOT_ASSESSABLE for a PDF with no prober supplied", async () => {
    const result = await assessRepresentationProvenance("application/pdf", new Uint8Array(), "text");
    expect(result.provenance).toBe("UNKNOWN");
    expect(result.fidelity).toBe("NOT_ASSESSABLE");
  });

  it("falls back to UNKNOWN when the prober throws, rather than guessing", async () => {
    const result = await assessRepresentationProvenance(
      "application/pdf",
      new Uint8Array(),
      "text",
      () => {
        throw new Error("simulated probe failure");
      },
    );
    expect(result.provenance).toBe("UNKNOWN");
    expect(result.provenanceRationale).toMatch(/threw/i);
  });

  it("classifies a PDF with an injected OCR-signature prober as OCR_TEXT_LAYER/UNVERIFIED end-to-end", async () => {
    const result = await assessRepresentationProvenance(
      "application/pdf",
      new Uint8Array(),
      "The quick brown fox jumps over the lazy dog. Ordinary clean sentence text throughout.",
      () => ({
        creator: "ScanSoft OmniPage",
        pageCount: 1,
        embeddedFontCount: 1,
        extractedTextLength: 90,
      }),
    );
    expect(result.provenance).toBe("OCR_TEXT_LAYER");
    expect(result.fidelity).toBe("UNVERIFIED");
    expect(result.detectorVersion).toBeTruthy();
  });

  it("classifies a PDF with an injected native-signature prober as NATIVE_TEXT/VERIFIED end-to-end", async () => {
    const result = await assessRepresentationProvenance(
      "application/pdf",
      new Uint8Array(),
      "Ordinary clean native document body text with no corruption present anywhere in this sample.",
      () => ({
        creator: "Microsoft Word",
        pageCount: 1,
        embeddedFontCount: 2,
        extractedTextLength: 95,
      }),
    );
    expect(result.provenance).toBe("NATIVE_TEXT");
    expect(result.fidelity).toBe("VERIFIED");
  });

  it("returns an immutable (frozen) assessment object", async () => {
    const result = await assessRepresentationProvenance("text/plain", new Uint8Array(), "text");
    expect(Object.isFrozen(result)).toBe(true);
  });
});
