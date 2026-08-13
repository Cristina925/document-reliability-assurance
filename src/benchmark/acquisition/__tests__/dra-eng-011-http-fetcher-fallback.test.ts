/**
 * DRA-ENG-011 — Robust Media-Type Detection for Controlled Acquisition
 * Tests: dra-eng-011-http-fetcher-fallback.test.ts
 *
 * Exercises the narrow malformed/absent-Content-Type fallback through the
 * REAL createHttpFetcher() HTTP stack (redirects, size limits, provenance
 * headers included), against a local in-process HTTP server. No live
 * network connections are made — this is the "deterministic local fixture"
 * required by the task spec (section 5), preserving the exact DRA-ACQ-014
 * shape (malformed Content-Type: application/, PDF Content-Disposition,
 * valid %PDF- bytes) as a permanent regression case that does not depend on
 * ec.europa.eu being reachable or stable.
 */

import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { computeSourceDigest } from "../integrity.js";

let server: http.Server;
let baseUrl: string;

// Exact byte-for-byte reproduction of the DRA-ACQ-014 Phase 2 finding shape:
// a real PDF payload, served with a malformed Content-Type and a
// Content-Disposition naming a .pdf file — but with deterministic local
// content (not the live EC document) so the test never depends on the
// network. Prefixed with the standard "%PDF-" signature.
const REGRESSION_PDF_BODY = Buffer.from(
  "%PDF-1.4\n% DRA-ENG-011 regression fixture reproducing the exact DRA-ACQ-014\n" +
    "% Phase 2 acquisition-blocker shape (malformed Content-Type: application/).\n",
  "utf8",
);

const VALID_PDF_BODY = Buffer.from("%PDF-1.4 valid content-type PDF stub", "utf8");
const NON_PDF_BODY = Buffer.from("this is not a pdf at all, just plain bytes", "utf8");

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const url = req.url ?? "/";

    // ── Case A baseline: valid application/pdf Content-Type (unchanged path) ──
    if (url === "/valid-pdf") {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": String(VALID_PDF_BODY.length),
      });
      res.end(VALID_PDF_BODY);
      return;
    }

    // ── Case B baseline: valid but unsupported Content-Type (unchanged path) ──
    if (url === "/valid-unsupported") {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": String(VALID_PDF_BODY.length),
      });
      res.end(VALID_PDF_BODY); // bytes are irrelevant; header alone must reject
      return;
    }

    // ── DRA-ACQ-014 regression shape: malformed Content-Type, PDF disposition, PDF bytes ──
    if (url === "/eu-style-malformed-pdf") {
      res.writeHead(200, {
        "Content-Type": "application/", // malformed — missing subtype, exactly as observed live
        "Content-Disposition":
          "attachment; filename=ethics_guidelines_for_trustworthy_ai-es_87FCE0E1-BB31-C0EB-A9F549AE2D3AC1F9_60423.pdf",
        "Content-Length": String(REGRESSION_PDF_BODY.length),
      });
      res.end(REGRESSION_PDF_BODY);
      return;
    }

    // ── Malformed Content-Type + PDF disposition but NON-PDF bytes → must reject ──
    if (url === "/malformed-pdf-disposition-wrong-bytes") {
      res.writeHead(200, {
        "Content-Type": "application/",
        "Content-Disposition": "attachment; filename=report.pdf",
        "Content-Length": String(NON_PDF_BODY.length),
      });
      res.end(NON_PDF_BODY);
      return;
    }

    // ── Malformed Content-Type + PDF bytes but NO Content-Disposition → must reject ──
    if (url === "/malformed-pdf-bytes-no-disposition") {
      res.writeHead(200, {
        "Content-Type": "application/",
        "Content-Length": String(REGRESSION_PDF_BODY.length),
      });
      res.end(REGRESSION_PDF_BODY);
      return;
    }

    // ── Malformed Content-Type + conflicting .html disposition + PDF bytes → must reject ──
    if (url === "/malformed-conflicting-disposition") {
      res.writeHead(200, {
        "Content-Type": "application/",
        "Content-Disposition": "attachment; filename=report.html",
        "Content-Length": String(REGRESSION_PDF_BODY.length),
      });
      res.end(REGRESSION_PDF_BODY);
      return;
    }

    // ── Absent Content-Type + PDF disposition + PDF bytes → accepted ──
    if (url === "/absent-content-type-pdf") {
      res.writeHead(200, {
        "Content-Disposition": "attachment; filename=absent-type.pdf",
        "Content-Length": String(REGRESSION_PDF_BODY.length),
      });
      res.end(REGRESSION_PDF_BODY);
      return;
    }

    res.writeHead(404);
    res.end("not found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function fetcher() {
  return createHttpFetcher({
    timeoutMs: 10_000,
    maxRedirects: 3,
    maxBytes: 10_000_000,
    allowHttp: true, // local test server only
  });
}

describe("DRA-ENG-011 — http-fetcher malformed/absent Content-Type fallback (local fixture)", () => {
  it("baseline case A: valid application/pdf Content-Type is unchanged", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/valid-pdf`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("application/pdf");
  });

  it("baseline case B: valid but unsupported Content-Type is still rejected", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/valid-unsupported`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(result.detail).toBe("image/png");
  });

  it("DRA-ACQ-014 REGRESSION: EC-style malformed Content-Type + PDF disposition + PDF bytes now succeeds", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/eu-style-malformed-pdf`,
      requestedBy: "dra-eng-011-regression-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("application/pdf");
    expect(result.source.httpResponseHeaders?.contentType).toBe("application/");
    expect(
      new TextDecoder().decode(result.source.rawBytes).startsWith("%PDF-"),
    ).toBe(true);
    expect(computeSourceDigest(result.source.rawBytes)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("determinism: repeated fetches of the regression fixture classify identically and byte-match", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/eu-style-malformed-pdf`,
      requestedBy: "dra-eng-011-determinism-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const f = fetcher();
    const first = await f(reqResult.request, {});
    const second = await f(reqResult.request, {});
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.source.mediaType).toBe(second.source.mediaType);
    expect(computeSourceDigest(first.source.rawBytes)).toBe(
      computeSourceDigest(second.source.rawBytes),
    );
  });

  it("negative: malformed Content-Type + PDF disposition + non-PDF bytes is rejected", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/malformed-pdf-disposition-wrong-bytes`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("negative: malformed Content-Type + PDF bytes but no Content-Disposition is rejected", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/malformed-pdf-bytes-no-disposition`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("negative: malformed Content-Type + conflicting .html Content-Disposition + PDF bytes is rejected", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/malformed-conflicting-disposition`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("positive: absent Content-Type + PDF disposition + PDF bytes is accepted", async () => {
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000021",
      sourceUrl: `${baseUrl}/absent-content-type-pdf`,
      requestedBy: "dra-eng-011-test",
      requestedAt: "2026-08-07T10:00:00.000Z",
    });
    expect(reqResult.ok).toBe(true);
    if (!reqResult.ok) return;

    const result = await fetcher()(reqResult.request, {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("application/pdf");
  });
});
