/**
 * DRA-ENG-011 — Robust Media-Type Detection for Controlled Acquisition
 * Tests: dra-eng-011-media-type-detection.test.ts
 *
 * Unit tests for the narrow, deterministic media-type classifier
 * (media-type-detection.ts). No network activity — pure function tests.
 *
 * Covers:
 *   - Pre-change behavioural baseline (section 2 of the task spec):
 *     valid supported / valid unsupported / malformed / absent / conflicting.
 *   - Positive cases 1-4 (valid PDF, malformed+PDF-evidence, absent+PDF-evidence,
 *     the exact DRA-ACQ-014 byte/header shape).
 *   - Negative cases 1-6 (mismatched evidence must never be silently accepted).
 */

import { describe, it, expect } from "vitest";
import {
  classifyMediaType,
  hasPdfSignatureAtStart,
  isSyntacticallyValidMediaType,
  contentDispositionNamesPdf,
  extractContentDispositionFilename,
  PDF_SIGNATURE_BYTES,
} from "../media-type-detection.js";

const PDF_BYTES = new TextEncoder().encode("%PDF-1.4 minimal stub content for tests");
const HTML_BYTES = new TextEncoder().encode("<html><body>not a pdf</body></html>");
const NON_PDF_BYTES = new TextEncoder().encode("just some plain bytes, not a pdf at all");

const PDF_DISPOSITION = 'attachment; filename="ethics_guidelines-es_60423.pdf"';
const PDF_DISPOSITION_EXTENDED = "attachment; filename*=UTF-8''ethics%20guidelines.pdf";
const HTML_DISPOSITION = 'attachment; filename="report.html"';

describe("DRA-ENG-011 — isSyntacticallyValidMediaType", () => {
  it("accepts a well-formed type/subtype value", () => {
    expect(isSyntacticallyValidMediaType("application/pdf")).toBe(true);
    expect(isSyntacticallyValidMediaType("text/html")).toBe(true);
    expect(isSyntacticallyValidMediaType("image/png")).toBe(true);
  });

  it("rejects the exact malformed DRA-ACQ-014 value (missing subtype)", () => {
    expect(isSyntacticallyValidMediaType("application/")).toBe(false);
  });

  it("rejects an absent/empty header", () => {
    expect(isSyntacticallyValidMediaType("")).toBe(false);
  });

  it("rejects a value with no slash at all", () => {
    expect(isSyntacticallyValidMediaType("application")).toBe(false);
  });

  it("rejects a value with an empty type before the slash", () => {
    expect(isSyntacticallyValidMediaType("/pdf")).toBe(false);
  });
});

describe("DRA-ENG-011 — hasPdfSignatureAtStart", () => {
  it("recognises the standard %PDF- signature at offset 0", () => {
    expect(hasPdfSignatureAtStart(PDF_BYTES)).toBe(true);
    expect(PDF_SIGNATURE_BYTES).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);
  });

  it("rejects bytes that do not start with the PDF signature", () => {
    expect(hasPdfSignatureAtStart(HTML_BYTES)).toBe(false);
    expect(hasPdfSignatureAtStart(NON_PDF_BYTES)).toBe(false);
  });

  it("rejects a signature that appears later in the payload, not at offset 0", () => {
    const delayed = new TextEncoder().encode("   %PDF-1.4 not at the start");
    expect(hasPdfSignatureAtStart(delayed)).toBe(false);
  });

  it("rejects too-short byte arrays", () => {
    expect(hasPdfSignatureAtStart(new Uint8Array([0x25, 0x50]))).toBe(false);
    expect(hasPdfSignatureAtStart(new Uint8Array())).toBe(false);
  });
});

describe("DRA-ENG-011 — Content-Disposition filename extraction", () => {
  it("extracts a standard quoted filename", () => {
    expect(extractContentDispositionFilename(PDF_DISPOSITION)).toBe(
      "ethics_guidelines-es_60423.pdf",
    );
  });

  it("extracts an RFC 5987 extended filename*= form", () => {
    expect(extractContentDispositionFilename(PDF_DISPOSITION_EXTENDED)).toBe(
      "ethics guidelines.pdf",
    );
  });

  it("returns undefined when the header is absent", () => {
    expect(extractContentDispositionFilename(undefined)).toBeUndefined();
  });

  it("returns undefined when there is no filename parameter", () => {
    expect(extractContentDispositionFilename("inline")).toBeUndefined();
  });
});

describe("DRA-ENG-011 — contentDispositionNamesPdf", () => {
  it("recognises a .pdf filename (case-insensitive)", () => {
    expect(contentDispositionNamesPdf(PDF_DISPOSITION)).toBe(true);
    expect(contentDispositionNamesPdf('attachment; filename="REPORT.PDF"')).toBe(true);
  });

  it("rejects a non-.pdf filename", () => {
    expect(contentDispositionNamesPdf(HTML_DISPOSITION)).toBe(false);
  });

  it("rejects an absent header", () => {
    expect(contentDispositionNamesPdf(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// classifyMediaType — pre-change behavioural baseline (task spec section 2)
// ---------------------------------------------------------------------------

describe("DRA-ENG-011 — classifyMediaType: behavioural baseline", () => {
  it("BASELINE: valid supported Content-Type (application/pdf) → accepted, via 'header'", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/pdf",
      contentDisposition: undefined,
      bytes: undefined,
    });
    expect(result).toEqual({ ok: true, mediaType: "application/pdf", classifiedVia: "header" });
  });

  it("BASELINE: valid supported Content-Type (text/html) → accepted, via 'header'", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "text/html",
      contentDisposition: undefined,
      bytes: undefined,
    });
    expect(result).toEqual({ ok: true, mediaType: "text/html", classifiedVia: "header" });
  });

  it("BASELINE: valid but unsupported Content-Type (image/png) → rejected as 'unsupported'", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "image/png",
      contentDisposition: undefined,
      bytes: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "unsupported", rawValue: "image/png" });
  });

  it("BASELINE: malformed Content-Type (application/) with no corroborating evidence → rejected as 'fallback-failed'", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: undefined,
      bytes: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "application/" });
  });

  it("BASELINE: absent Content-Type with no corroborating evidence → rejected as 'fallback-failed'", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "",
      contentDisposition: undefined,
      bytes: undefined,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "" });
  });

  it("BASELINE: conflicting metadata (malformed type + .html filename + PDF bytes) → rejected", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: HTML_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// classifyMediaType — positive cases (task spec section 6)
// ---------------------------------------------------------------------------

describe("DRA-ENG-011 — classifyMediaType: positive cases", () => {
  it("Case 1: valid application/pdf Content-Type → existing acceptance path unchanged", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/pdf",
      contentDisposition: undefined,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({ ok: true, mediaType: "application/pdf", classifiedVia: "header" });
  });

  it("Case 2: malformed Content-Type + PDF disposition + PDF signature → classified as PDF, accepted", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: PDF_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({
      ok: true,
      mediaType: "application/pdf",
      classifiedVia: "fallback-pdf",
    });
  });

  it("Case 3: absent Content-Type + PDF disposition + PDF signature → classified as PDF", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "",
      contentDisposition: PDF_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({
      ok: true,
      mediaType: "application/pdf",
      classifiedVia: "fallback-pdf",
    });
  });

  it("Case 4: exact DRA-ACQ-014 regression shape (Content-Type: application/, EC filename, PDF bytes) → succeeds", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition:
        "attachment; filename=ethics_guidelines_for_trustworthy_ai-es_87FCE0E1-BB31-C0EB-A9F549AE2D3AC1F9_60423.pdf",
      bytes: PDF_BYTES,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mediaType).toBe("application/pdf");
      expect(result.classifiedVia).toBe("fallback-pdf");
    }
  });
});

// ---------------------------------------------------------------------------
// classifyMediaType — negative cases (task spec section 7)
// ---------------------------------------------------------------------------

describe("DRA-ENG-011 — classifyMediaType: negative cases (fallback must not weaken validation)", () => {
  it("Case 1: malformed Content-Type + .pdf filename + non-PDF bytes → reject", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: PDF_DISPOSITION,
      bytes: NON_PDF_BYTES,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "application/" });
  });

  it("Case 2: malformed Content-Type + PDF bytes + no Content-Disposition at all → reject", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: undefined,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "application/" });
  });

  it("Case 3: malformed Content-Type + .html filename + PDF bytes → reject conflicting metadata", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: HTML_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "application/" });
  });

  it("Case 4: valid application/octet-stream + .pdf filename + PDF bytes → preserve valid-unsupported-type policy (reject, no override)", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/octet-stream",
      contentDisposition: PDF_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({
      ok: false,
      reason: "unsupported",
      rawValue: "application/octet-stream",
    });
  });

  it("Case 5: valid unsupported media type + PDF signature → reject (fallback never runs for a valid header)", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "image/png",
      contentDisposition: PDF_DISPOSITION,
      bytes: PDF_BYTES,
    });
    expect(result).toEqual({ ok: false, reason: "unsupported", rawValue: "image/png" });
  });

  it("Case 6: malformed media type + unsupported file extension + unsupported bytes → reject", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "application/",
      contentDisposition: 'attachment; filename="data.bin"',
      bytes: NON_PDF_BYTES,
    });
    expect(result).toEqual({ ok: false, reason: "fallback-failed", rawValue: "application/" });
  });

  it("never widens supported types: a malformed HTML-flavoured header with html bytes is still rejected (PDF-only fallback)", () => {
    const result = classifyMediaType({
      mediaTypeHeader: "text/",
      contentDisposition: 'attachment; filename="page.html"',
      bytes: HTML_BYTES,
    });
    expect(result.ok).toBe(false);
  });
});
