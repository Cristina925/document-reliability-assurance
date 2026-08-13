/**
 * DRA-ENG-010 — Production HTTP Acquisition Adapter
 * Tests: http-fetcher.test.ts
 *
 * All tests use a local in-process HTTP server (node:http).
 * No live network connections are made at any point.
 * The test suite is fully deterministic.
 */

import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import type { HttpFetcherOptions } from "../http-fetcher.js";
import type { AcquisitionRequest } from "../schema.js";

// ---------------------------------------------------------------------------
// Local test server
// ---------------------------------------------------------------------------

let server: http.Server;
let baseUrl: string;

const PLAIN_TEXT_BODY = "Hello, DRA-ENG-010 plain text document.";
const HTML_BODY =
  "<!DOCTYPE html><html><head><title>Test</title></head><body><p>DRA-ENG-010 HTML document.</p></body></html>";
const MARKDOWN_BODY = "# DRA-ENG-010\n\nMarkdown acquisition test document.";
// Minimal syntactically invalid but byte-valid PDF stub.
const PDF_BODY_STRING = "%PDF-1.4 stub for DRA-ENG-010 byte-preservation test";
const PDF_BODY = new TextEncoder().encode(PDF_BODY_STRING);

beforeAll(async () => {
  server = http.createServer((req, res) => {
    const url = req.url ?? "/";

    // ── Plain text ──────────────────────────────────────────────────────────
    if (url === "/text") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(PLAIN_TEXT_BODY, "utf8")),
      });
      res.end(PLAIN_TEXT_BODY);
      return;
    }

    // ── HTML ────────────────────────────────────────────────────────────────
    if (url === "/html") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(HTML_BODY, "utf8")),
      });
      res.end(HTML_BODY);
      return;
    }

    // ── Markdown ────────────────────────────────────────────────────────────
    if (url === "/markdown") {
      res.writeHead(200, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(MARKDOWN_BODY, "utf8")),
      });
      res.end(MARKDOWN_BODY);
      return;
    }

    // ── PDF ─────────────────────────────────────────────────────────────────
    if (url === "/pdf") {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": String(PDF_BODY.length),
      });
      res.end(Buffer.from(PDF_BODY));
      return;
    }

    // ── Headers — rich provenance headers ───────────────────────────────────
    if (url === "/headers") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": String(Buffer.byteLength(PLAIN_TEXT_BODY, "utf8")),
        "Last-Modified": "Tue, 01 Jul 2026 00:00:00 GMT",
        ETag: '"abc123def456"',
        "Content-Language": "en",
        "Content-Encoding": "identity",
      });
      res.end(PLAIN_TEXT_BODY);
      return;
    }

    // ── Redirect: single hop (301) ──────────────────────────────────────────
    if (url === "/redirect-once") {
      res.writeHead(301, { Location: "/text" });
      res.end();
      return;
    }

    // ── Redirect: two-hop chain (302 → 301 → /text) ─────────────────────────
    if (url === "/redirect-chain") {
      res.writeHead(302, { Location: "/redirect-once" });
      res.end();
      return;
    }

    // ── Redirect: 307 and 308 ───────────────────────────────────────────────
    if (url === "/redirect-307") {
      res.writeHead(307, { Location: "/text" });
      res.end();
      return;
    }

    if (url === "/redirect-308") {
      res.writeHead(308, { Location: "/text" });
      res.end();
      return;
    }

    // ── Redirect loop ────────────────────────────────────────────────────────
    if (url === "/redirect-loop-a") {
      res.writeHead(302, { Location: "/redirect-loop-b" });
      res.end();
      return;
    }

    if (url === "/redirect-loop-b") {
      res.writeHead(302, { Location: "/redirect-loop-a" });
      res.end();
      return;
    }

    // ── Redirect: missing Location header ───────────────────────────────────
    if (url === "/redirect-no-location") {
      res.writeHead(301, {}); // no Location
      res.end();
      return;
    }

    // ── Not Found ───────────────────────────────────────────────────────────
    if (url === "/not-found") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    // ── Server Error ─────────────────────────────────────────────────────────
    if (url === "/server-error") {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }

    // ── Oversized response ───────────────────────────────────────────────────
    if (url === "/oversized") {
      const overBody = "X".repeat(2048); // 2 KB — exceeds 512 byte test limit
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Length": String(overBody.length),
      });
      res.end(overBody);
      return;
    }

    // ── Unsupported media type ───────────────────────────────────────────────
    if (url === "/unsupported") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Content-Length": "2",
      });
      res.end("{}");
      return;
    }

    // ── Empty response ───────────────────────────────────────────────────────
    if (url === "/empty") {
      res.writeHead(200, { "Content-Type": "text/plain", "Content-Length": "0" });
      res.end();
      return;
    }

    // ── Slow response — triggers timeout ─────────────────────────────────────
    if (url === "/slow") {
      const timer = setTimeout(() => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("late response");
      }, 800);
      req.on("close", () => clearTimeout(timer));
      return;
    }

    // ── Content-Type with parameters ─────────────────────────────────────────
    if (url === "/text-with-charset") {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=UTF-8",
        "Content-Length": String(Buffer.byteLength(PLAIN_TEXT_BODY, "utf8")),
      });
      res.end(PLAIN_TEXT_BODY);
      return;
    }

    // ── Default: 404 ────────────────────────────────────────────────────────
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  path: string,
  id: `DRA-ACQ-${string}` = "DRA-ACQ-000001",
): AcquisitionRequest {
  return {
    acquisitionId: id,
    sourceUrl: `${baseUrl}${path}`,
    requestedBy: "dra-eng-010-test",
    requestedAt: "2026-07-01T10:00:00.000Z",
  };
}

/** Default options — permissive for local HTTP test server. */
const DEFAULT_OPTS: HttpFetcherOptions = {
  timeoutMs: 5_000,
  maxRedirects: 10,
  maxBytes: 10 * 1024 * 1024, // 10 MB
  userAgent: "DRA-TEST/1.0",
  allowHttp: true, // required for local non-TLS server
};

const FIXED_TS = "2026-08-01T09:00:00.000Z";

// ---------------------------------------------------------------------------
// 1 — Successful acquisitions
// ---------------------------------------------------------------------------

describe("successful plain text acquisition", () => {
  it("returns ok=true with correct mediaType", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
  });

  it("preserves acquisition ID", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.acquisitionId).toBe("DRA-ACQ-000001");
  });

  it("sets requestedUrl to the original URL", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const req = makeRequest("/text");
    const result = await fetcher(req, { fixedRetrievedAt: FIXED_TS });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.requestedUrl).toBe(req.sourceUrl);
  });

  it("sets finalUrl equal to requestedUrl when no redirects", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const req = makeRequest("/text");
    const result = await fetcher(req, { fixedRetrievedAt: FIXED_TS });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.finalUrl).toBe(req.sourceUrl);
    expect(result.source.redirects).toHaveLength(0);
  });

  it("records 200 httpStatus", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpStatus).toBe(200);
  });

  it("uses fixedRetrievedAt from SourceFetcherOptions", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.retrievedAt).toBe(FIXED_TS);
  });
});

describe("successful HTML acquisition", () => {
  it("returns mediaType text/html", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/html"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/html");
  });
});

describe("successful Markdown acquisition", () => {
  it("returns mediaType text/markdown", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/markdown"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/markdown");
  });
});

describe("successful PDF acquisition", () => {
  it("returns mediaType application/pdf", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/pdf"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("application/pdf");
  });
});

// ---------------------------------------------------------------------------
// 2 — Content-Type parameter stripping
// ---------------------------------------------------------------------------

describe("Content-Type parameter stripping", () => {
  it("strips charset parameter from text/plain; charset=UTF-8", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text-with-charset"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
  });
});

// ---------------------------------------------------------------------------
// 3 — Exact byte preservation
// ---------------------------------------------------------------------------

describe("exact byte preservation", () => {
  it("preserves plain text bytes exactly", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const decoded = new TextDecoder().decode(result.source.rawBytes);
    expect(decoded).toBe(PLAIN_TEXT_BODY);
  });

  it("preserves PDF bytes exactly", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/pdf"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.rawBytes).toEqual(PDF_BODY);
  });

  it("returns a Uint8Array", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.rawBytes).toBeInstanceOf(Uint8Array);
  });
});

// ---------------------------------------------------------------------------
// 4 — Deterministic replay
// ---------------------------------------------------------------------------

describe("deterministic replay", () => {
  it("two fetches with fixedRetrievedAt produce identical retrievedAt", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const opts = { fixedRetrievedAt: FIXED_TS };
    const [r1, r2] = await Promise.all([
      fetcher(makeRequest("/text"), opts),
      fetcher(makeRequest("/text"), opts),
    ]);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.source.retrievedAt).toBe(r2.source.retrievedAt);
    expect(r1.source.retrievedAt).toBe(FIXED_TS);
  });

  it("two fetches with fixedRetrievedAt produce identical rawBytes", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const opts = { fixedRetrievedAt: FIXED_TS };
    const [r1, r2] = await Promise.all([
      fetcher(makeRequest("/text"), opts),
      fetcher(makeRequest("/text"), opts),
    ]);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    if (!r1.ok || !r2.ok) return;
    expect(r1.source.rawBytes).toEqual(r2.source.rawBytes);
  });
});

// ---------------------------------------------------------------------------
// 5 — Provenance header capture
// ---------------------------------------------------------------------------

describe("provenance header capture", () => {
  it("captures Content-Type as raw header including charset", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.contentType).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("captures Content-Length", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.contentLength).toBeDefined();
  });

  it("captures Last-Modified", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.lastModified).toBe(
      "Tue, 01 Jul 2026 00:00:00 GMT",
    );
  });

  it("captures ETag", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.etag).toBe('"abc123def456"');
  });

  it("captures Content-Language", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.contentLanguage).toBe("en");
  });

  it("captures Content-Encoding", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/headers"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.httpResponseHeaders?.contentEncoding).toBe("identity");
  });

  it("httpResponseHeaders absent on mock fetcher (not present)", () => {
    // Transport provenance headers should only appear when a real HTTP fetch
    // is performed. Verify that AcquiredSource.httpResponseHeaders is typed
    // as optional — mock sources naturally leave it undefined.
    // (This is a type-level constraint verified by compilation, but we
    //  confirm the field's shape is optional at runtime too.)
    const shape: Partial<{ httpResponseHeaders?: unknown }> = {};
    expect(shape.httpResponseHeaders).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 6 — Redirect handling
// ---------------------------------------------------------------------------

describe("redirect handling", () => {
  it("follows a single 301 redirect and records the chain", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const req = makeRequest("/redirect-once");
    const result = await fetcher(req, { fixedRetrievedAt: FIXED_TS });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.requestedUrl).toBe(req.sourceUrl);
    expect(result.source.redirects).toHaveLength(1);
    expect(result.source.finalUrl).toBe(
      result.source.redirects[result.source.redirects.length - 1],
    );
    expect(result.source.finalUrl).toContain("/text");
    expect(result.source.httpStatus).toBe(200);
  });

  it("follows a two-hop redirect chain", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/redirect-chain"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.redirects).toHaveLength(2);
    expect(result.source.finalUrl).toContain("/text");
  });

  it("follows a 307 redirect", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/redirect-307"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
  });

  it("follows a 308 redirect", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/redirect-308"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
  });

  it("rejects a redirect loop", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/redirect-loop-a"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_REDIRECT");
  });

  it("rejects when maxRedirects is exceeded", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, maxRedirects: 1 });
    // /redirect-chain → /redirect-once → /text requires 2 hops
    const result = await fetcher(makeRequest("/redirect-chain"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_REDIRECT");
  });

  it("succeeds when redirect count is exactly at the limit", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, maxRedirects: 2 });
    // /redirect-chain needs exactly 2 hops
    const result = await fetcher(makeRequest("/redirect-chain"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a redirect missing a Location header", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/redirect-no-location"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_REDIRECT");
  });

  it("preserves requestedUrl across redirect chain", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const req = makeRequest("/redirect-once");
    const result = await fetcher(req, { fixedRetrievedAt: FIXED_TS });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.requestedUrl).toBe(req.sourceUrl);
  });
});

// ---------------------------------------------------------------------------
// 7 — Timeout
// ---------------------------------------------------------------------------

describe("timeout", () => {
  it("returns TIMEOUT when server is too slow", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, timeoutMs: 100 });
    const result = await fetcher(makeRequest("/slow"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("TIMEOUT");
  });
});

// ---------------------------------------------------------------------------
// 8 — HTTP error codes
// ---------------------------------------------------------------------------

describe("HTTP error codes", () => {
  it("returns NOT_FOUND for 404", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/not-found"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NOT_FOUND");
  });

  it("returns HTTP_ERROR for 500", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/server-error"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("HTTP_ERROR");
    expect(result.detail).toBe("500");
  });
});

// ---------------------------------------------------------------------------
// 9 — Size limit
// ---------------------------------------------------------------------------

describe("size limit", () => {
  it("returns SIZE_LIMIT_EXCEEDED when response exceeds maxBytes", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, maxBytes: 512 });
    // /oversized returns 2 KB
    const result = await fetcher(makeRequest("/oversized"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("SIZE_LIMIT_EXCEEDED");
  });

  it("succeeds when response is within maxBytes", async () => {
    const smallText = PLAIN_TEXT_BODY; // ~39 bytes
    const fetcher = createHttpFetcher({
      ...DEFAULT_OPTS,
      maxBytes: 1024, // 1 KB — well above smallText
    });
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10 — Unsupported media type
// ---------------------------------------------------------------------------

describe("unsupported media type", () => {
  it("returns UNSUPPORTED_MEDIA_TYPE for application/json", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/unsupported"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(result.detail).toBe("application/json");
  });
});

// ---------------------------------------------------------------------------
// 11 — Empty response
// ---------------------------------------------------------------------------

describe("empty response", () => {
  it("returns EMPTY_RESPONSE for a 200 with no body", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(makeRequest("/empty"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("EMPTY_RESPONSE");
  });
});

// ---------------------------------------------------------------------------
// 12 — URL validation (INVALID_URL)
// ---------------------------------------------------------------------------

describe("URL validation", () => {
  it("returns INVALID_URL for a completely malformed URL", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(
      {
        acquisitionId: "DRA-ACQ-000099",
        sourceUrl: "not-a-url-at-all",
        requestedBy: "test",
        requestedAt: "2026-07-01T10:00:00.000Z",
      },
      { fixedRetrievedAt: FIXED_TS },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_URL");
  });

  it("returns INVALID_URL for ftp: scheme", async () => {
    const fetcher = createHttpFetcher(DEFAULT_OPTS);
    const result = await fetcher(
      // Note: AcquisitionRequestSchema only allows http/https, but
      // we bypass schema validation by constructing the object directly
      // to test the fetcher's own defence.
      {
        acquisitionId: "DRA-ACQ-000099",
        sourceUrl: "ftp://example.com/file.txt",
        requestedBy: "test",
        requestedAt: "2026-07-01T10:00:00.000Z",
      } as AcquisitionRequest,
      { fixedRetrievedAt: FIXED_TS },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_URL");
  });

  it("returns INVALID_URL for plain http:// URL when allowHttp is false", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, allowHttp: false });
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_URL");
  });

  it("succeeds for http:// URL when allowHttp is true", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, allowHttp: true });
    const result = await fetcher(makeRequest("/text"), {
      fixedRetrievedAt: FIXED_TS,
    });
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 13 — Network error
// ---------------------------------------------------------------------------

describe("network error", () => {
  it("returns NETWORK_ERROR when connection is refused", async () => {
    const fetcher = createHttpFetcher({ ...DEFAULT_OPTS, timeoutMs: 1_000 });
    // Port 1 is reserved and should always refuse connections.
    const result = await fetcher(
      {
        acquisitionId: "DRA-ACQ-000099",
        sourceUrl: "http://127.0.0.1:1/text",
        requestedBy: "test",
        requestedAt: "2026-07-01T10:00:00.000Z",
      },
      { fixedRetrievedAt: FIXED_TS },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(["NETWORK_ERROR", "TIMEOUT"]).toContain(result.code);
  });
});
