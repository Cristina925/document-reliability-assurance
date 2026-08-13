# DRA-ENG-010 — Production HTTP Acquisition Adapter

## Overview

DRA-ENG-010 extends the DRA-ENG-009 Governed Benchmark Acquisition and Freeze Pipeline with a production-grade HTTP/HTTPS fetcher that can retrieve real documents from official publishers. It implements the existing `SourceFetcher` interface without modifying any pipeline, evaluator, or governance logic.

---

## Architecture

```
Official Publisher (HTTPS)
        ↓
createHttpFetcher()          ← NEW (DRA-ENG-010)
        ↓
SourceFetcher interface      ← unchanged (DRA-ENG-009)
        ↓
acquireFreezeAndEvaluate()   ← unchanged (DRA-ENG-009)
        ↓
Official Source Review (human gate)
        ↓
Licence Review (human gate)
        ↓
Metadata Approval
        ↓
Freeze
        ↓
Corpus + Manifest
        ↓
DRA Evaluation
        ↓
Proof Receipt + Benchmark Result
```

`createHttpFetcher()` is a drop-in replacement for `createMockFetcher()`. Both return a `SourceFetcher`; the pipeline is unaware of which is in use.

---

## Module

**File:** `src/benchmark/acquisition/http-fetcher.ts`

**Public API:**

```typescript
export interface HttpFetcherOptions {
  timeoutMs: number;      // maximum wait per request (ms)
  maxRedirects: number;   // maximum redirects to follow
  maxBytes: number;       // maximum response body size
  userAgent?: string;     // User-Agent header (default: "DRA-ENG-010/1.0")
  allowHttp?: boolean;    // permit plain HTTP (default: false)
}

export function createHttpFetcher(options: HttpFetcherOptions): SourceFetcher;
```

---

## Supported Protocols

| Scheme     | Supported                          |
|------------|------------------------------------|
| `https:`   | Always accepted                    |
| `http:`    | Accepted only when `allowHttp: true` |
| `ftp:`     | Rejected — `INVALID_URL`           |
| `file:`    | Rejected — `INVALID_URL`           |
| `data:`    | Rejected — `INVALID_URL`           |
| `javascript:` | Rejected — `INVALID_URL`        |
| `blob:`    | Rejected — `INVALID_URL`           |
| `mailto:`  | Rejected — `INVALID_URL`           |
| any other  | Rejected — `INVALID_URL`           |

---

## Security Controls

1. **TLS enforcement** — HTTPS is the default. Plain HTTP requires explicit `allowHttp: true`. Never set this in production acquisitions of public documents.
2. **No certificate bypass** — TLS certificate validation uses Node.js defaults. No `rejectUnauthorized: false` or equivalent is introduced.
3. **No HTTPS→HTTP downgrade** — Redirects from HTTPS to HTTP are rejected with `INVALID_REDIRECT` unless `allowHttp` is set.
4. **Scheme whitelist** — All non-HTTP(S) schemes are rejected before any network activity.
5. **URL validation** — Malformed URLs are rejected immediately with `INVALID_URL`.
6. **Redirect loop detection** — A per-request `Set<string>` of visited URLs detects cycles in O(1) per hop.
7. **Redirect count limit** — Configurable `maxRedirects`; exceeded chains return `INVALID_REDIRECT`.
8. **Size limit** — Streaming byte count enforcement; aborts and returns `SIZE_LIMIT_EXCEEDED` without buffering the full oversized body.
9. **Timeout** — Socket-level timeout via `req.setTimeout`; fires `TIMEOUT` on expiry regardless of whether headers or body have started.

---

## Redirect Policy

Supported redirect status codes: **301, 302, 307, 308**.

| Condition                          | Result                  |
|------------------------------------|-------------------------|
| Redirect to supported scheme       | Followed                |
| Redirect chain within limit        | Followed                |
| Redirect loop detected             | `INVALID_REDIRECT`      |
| Chain exceeds `maxRedirects`       | `INVALID_REDIRECT`      |
| Missing `Location` header          | `INVALID_REDIRECT`      |
| Redirect to unsupported scheme     | `INVALID_REDIRECT`      |
| HTTPS → HTTP without `allowHttp`   | `INVALID_REDIRECT`      |

Redirect targets with relative `Location` values are resolved against the current URL via `new URL(location, currentUrl)`.

---

## Provenance Capture

HTTP response headers are captured as **transport-level provenance** in `AcquiredSource.httpResponseHeaders` (type: `HttpResponseHeaders`).

| Field              | HTTP Header         | Required |
|--------------------|---------------------|----------|
| `contentType`      | `Content-Type`      | Required |
| `contentLength`    | `Content-Length`    | When present |
| `lastModified`     | `Last-Modified`     | When present |
| `etag`             | `ETag`              | When present |
| `contentEncoding`  | `Content-Encoding`  | When present |
| `contentLanguage`  | `Content-Language`  | When present |

**These headers are transport provenance only.** They must not be used as or treated as approved document metadata. Downstream metadata approval (DRA-ENG-009 Metadata stage) is performed separately by a human reviewer.

Values are recorded exactly as received. Missing headers are `undefined`; no values are invented or inferred.

`httpResponseHeaders` is an optional field on `AcquiredSource`. Sources produced by `createMockFetcher()` leave it `undefined`.

---

## Interaction with DRA-ENG-009

`createHttpFetcher()` satisfies `SourceFetcher` exactly. Usage is identical to the mock:

```typescript
// Mock (deterministic tests):
const fetcher = createMockFetcher(responses);

// Production (live acquisition):
const fetcher = createHttpFetcher({
  timeoutMs: 30_000,
  maxRedirects: 10,
  maxBytes: 50 * 1024 * 1024,
  userAgent: "DRA-Benchmark/1.0",
});

// Both are injected the same way:
const result = await acquireFreezeAndEvaluate(input, {
  fetcher,
  registry,
  protocol,
  ...
});
```

No pipeline code changes are required to switch from mock to production.

---

## Error Model

All errors are returned as typed `SourceFetchResult` failures; the fetcher never throws for expected conditions.

| Code                   | Meaning                                              |
|------------------------|------------------------------------------------------|
| `INVALID_URL`          | Malformed URL or unsupported scheme                  |
| `NETWORK_ERROR`        | TCP-level connection failure                         |
| `TIMEOUT`              | Request exceeded `timeoutMs`                         |
| `NOT_FOUND`            | HTTP 404 response                                    |
| `HTTP_ERROR`           | Non-404 non-2xx HTTP response                        |
| `INVALID_REDIRECT`     | Loop, limit exceeded, bad Location, bad scheme       |
| `EMPTY_RESPONSE`       | 2xx response with zero-byte body                     |
| `SIZE_LIMIT_EXCEEDED`  | Response body exceeded `maxBytes`                    |
| `UNSUPPORTED_MEDIA_TYPE` | Content-Type not in supported set               |

New codes (`INVALID_URL`, `INVALID_REDIRECT`, `NOT_FOUND`, `SIZE_LIMIT_EXCEEDED`) were added to the shared `SourceFetchErrorCode` union in `fetcher.ts` alongside the pre-existing codes. `createMockFetcher()` is unaffected.

---

## Limitations

1. **No decompression** — `Content-Encoding: gzip/br/deflate` bodies are recorded as raw compressed bytes. The normalisation stage downstream is responsible for any decoding.
2. **No authentication** — HTTP Basic/Bearer/cookie auth is not supported. All acquired documents must be publicly accessible.
3. **No proxy support** — Explicit proxy configuration is not provided. Ambient `HTTP_PROXY`/`HTTPS_PROXY` environment variables may work via Node.js defaults but are not officially supported.
4. **No streaming to disk** — Response bytes are buffered in memory up to `maxBytes`. Large documents (>50 MiB) are not supported.
5. **No HTTP/2 or HTTP/3** — Uses Node.js built-in `http`/`https` modules which speak HTTP/1.1.
6. **No content negotiation** — The `Accept` header hints at preferred types but the server may respond with any media type; the fetcher validates and rejects unsupported types after the fact.

---

## Unsupported Media Types

Any `Content-Type` not in the following list returns `UNSUPPORTED_MEDIA_TYPE`:

- `text/html`
- `text/markdown`
- `text/plain`
- `application/pdf`

`Content-Type` parameters (e.g. `; charset=utf-8`) are stripped before comparison. The comparison is case-insensitive.
