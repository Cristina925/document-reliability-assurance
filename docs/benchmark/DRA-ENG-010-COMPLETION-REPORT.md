# DRA-ENG-010 Completion Report — Production HTTP Acquisition Adapter

## Milestone Status

**COMPLETE**

All quality gates passed. The production HTTP fetcher is implemented, tested, and integrated. No CTS changes. No DRA evaluator semantic changes. `createMockFetcher()` unchanged.

---

## Files Created

| File | Description |
|------|-------------|
| `lib/dra-reference/src/benchmark/acquisition/http-fetcher.ts` | Production HTTP/HTTPS SourceFetcher implementation |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/http-fetcher.test.ts` | 43 deterministic tests using a local in-process HTTP server |
| `docs/benchmark/DRA-ENG-010-PRODUCTION-HTTP-FETCHER.md` | Architecture reference document |
| `docs/benchmark/DRA-ENG-010-COMPLETION-REPORT.md` | This file |

---

## Files Modified

| File | Change |
|------|--------|
| `lib/dra-reference/src/benchmark/acquisition/fetcher.ts` | Added `HttpResponseHeaders` interface; added optional `httpResponseHeaders` field to `AcquiredSource`; extended `SourceFetchErrorCode` with `NOT_FOUND`, `INVALID_URL`, `INVALID_REDIRECT`, `SIZE_LIMIT_EXCEEDED` |
| `lib/dra-reference/src/benchmark/acquisition/index.ts` | Exported `createHttpFetcher`, `HttpFetcherOptions`, `HttpResponseHeaders` |

`createMockFetcher()` and its behaviour are completely unchanged.

---

## Public APIs

### `createHttpFetcher(options: HttpFetcherOptions): SourceFetcher`

Factory that returns a production `SourceFetcher` using Node.js built-in `http`/`https` modules. Satisfies the `SourceFetcher` interface exactly. Drop-in replacement for `createMockFetcher()` in the governed pipeline.

### `HttpFetcherOptions`

```typescript
interface HttpFetcherOptions {
  timeoutMs: number;      // max request duration (ms)
  maxRedirects: number;   // max redirects to follow
  maxBytes: number;       // max response body size (bytes)
  userAgent?: string;     // User-Agent header
  allowHttp?: boolean;    // permit plain HTTP (default: false)
}
```

### `HttpResponseHeaders` (extended `AcquiredSource`)

```typescript
interface HttpResponseHeaders {
  contentType?: string;
  contentLength?: string;
  lastModified?: string;
  etag?: string;
  contentEncoding?: string;
  contentLanguage?: string;
}
```

Available on `AcquiredSource.httpResponseHeaders`. Undefined for mock-sourced objects.

### Extended `SourceFetchErrorCode`

Four new codes added to the shared union (backwards-compatible addition):

- `NOT_FOUND` — HTTP 404
- `INVALID_URL` — malformed URL or unsupported scheme
- `INVALID_REDIRECT` — loop, limit exceeded, bad Location, bad scheme
- `SIZE_LIMIT_EXCEEDED` — response body exceeded `maxBytes`

---

## Existing Modules Reused

| Module | Usage |
|--------|-------|
| `SourceFetcher` interface (`fetcher.ts`) | Implemented directly; no re-implementation |
| `AcquiredSource` type (`fetcher.ts`) | Returned from successful fetches |
| `SourceFetcherOptions` (`fetcher.ts`) | `maxBytes` and `fixedRetrievedAt` overrides honoured |
| `DEFAULT_MAX_SOURCE_BYTES` (`fetcher.ts`) | Used as fallback when `maxBytes` not configured |
| `isSupportedMediaType` (`schema.ts`) | Media type validation after header stripping |
| `SUPPORTED_MEDIA_TYPES` (`schema.ts`) | Error message construction |
| `acquireFreezeAndEvaluate` (`governed-pipeline.ts`) | Integration point (inject fetcher as `deps.fetcher`) |

---

## Integration Points

```typescript
import { createHttpFetcher, acquireFreezeAndEvaluate } from
  "@workspace/dra-reference/src/benchmark/acquisition/index.js";

const fetcher = createHttpFetcher({
  timeoutMs: 30_000,
  maxRedirects: 10,
  maxBytes: 50 * 1024 * 1024,
  userAgent: "DRA-Benchmark/1.0",
});

const result = await acquireFreezeAndEvaluate(input, {
  fetcher,       // ← production fetcher injected here
  registry,
  protocol,
  fixedTimestamp: "2026-08-01T10:00:00.000Z",
  pdfExtractor: (bytes) => { /* ... */ },
  existingCorpusTexts: [],
});
```

No other pipeline code changes are required.

---

## Security Controls

| Control | Implementation |
|---------|----------------|
| HTTPS-only default | `allowHttp: false` unless explicitly set |
| No TLS bypass | Node.js default TLS validation; no `rejectUnauthorized: false` |
| No HTTPS→HTTP downgrade | `INVALID_REDIRECT` on scheme downgrade |
| Scheme whitelist | All non-HTTP(S) schemes rejected at URL validation |
| Redirect loop detection | Per-request `Set<string>` visited URLs |
| Redirect count limit | Configurable `maxRedirects`; checked before each hop |
| Size limit enforcement | Streaming counter; aborts before buffering full body |
| Timeout | Socket-level `req.setTimeout`; fires regardless of phase |

---

## Provenance Metadata Captured

| Field | HTTP Header | Notes |
|-------|-------------|-------|
| `contentType` | `Content-Type` | Raw value including parameters |
| `contentLength` | `Content-Length` | When present |
| `lastModified` | `Last-Modified` | When present |
| `etag` | `ETag` | When present |
| `contentEncoding` | `Content-Encoding` | When present |
| `contentLanguage` | `Content-Language` | When present |

Stored in `AcquiredSource.httpResponseHeaders` as transport provenance only. Separate from approved document metadata.

---

## Tests Added

**File:** `src/benchmark/acquisition/__tests__/http-fetcher.test.ts`

**Server:** Local in-process `node:http` server on a random port. No live network. Fully deterministic.

| Category | Tests | Coverage |
|----------|-------|----------|
| Successful plain text | 6 | acquisitionId, requestedUrl, finalUrl, redirects, httpStatus, retrievedAt |
| Successful HTML | 1 | mediaType |
| Successful Markdown | 1 | mediaType |
| Successful PDF | 1 | mediaType |
| Content-Type parameter stripping | 1 | `text/plain; charset=UTF-8` → `text/plain` |
| Exact byte preservation | 3 | text, PDF, Uint8Array type |
| Deterministic replay | 2 | identical retrievedAt and rawBytes with fixedRetrievedAt |
| Provenance header capture | 7 | contentType, contentLength, lastModified, etag, contentLanguage, contentEncoding, mock undefined |
| Redirect handling | 9 | 301, 307, 308, 2-hop chain, loop, limit exceeded, limit exact, missing Location, requestedUrl preserved |
| Timeout | 1 | TIMEOUT code |
| HTTP error codes | 2 | NOT_FOUND (404), HTTP_ERROR (500) |
| Size limit | 2 | SIZE_LIMIT_EXCEEDED, within-limit success |
| Unsupported media type | 1 | UNSUPPORTED_MEDIA_TYPE |
| Empty response | 1 | EMPTY_RESPONSE |
| URL validation | 4 | malformed URL, ftp: scheme, http: without allowHttp, http: with allowHttp |
| Network error | 1 | NETWORK_ERROR / TIMEOUT on refused connection |

**Total new tests: 43**

---

## Final Test Totals

| Scope | Count |
|-------|-------|
| Pre-DRA-ENG-010 tests | 2902 |
| New DRA-ENG-010 tests | 43 |
| **Total** | **2945** |
| Regressions | 0 |

---

## TypeScript Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` (lib/dra-reference) | 0 errors |
| `pnpm -w run typecheck:libs` | 0 errors |

---

## CTS Not Modified

No CTS files were modified. No CTS semantics were changed.

---

## DRA Evaluator Semantics Not Modified

No evaluator files were modified. No decision logic, issue classes, or confidence levels were changed.

---

## Known Limitations

1. No decompression — `Content-Encoding: gzip/br/deflate` bodies are stored as raw compressed bytes.
2. No authentication — all acquired documents must be publicly accessible.
3. No proxy configuration — `HTTP_PROXY`/`HTTPS_PROXY` environment variables are not explicitly supported.
4. In-memory buffering only — documents larger than `maxBytes` (typically 50 MiB) are not supported.
5. HTTP/1.1 only — no HTTP/2 or HTTP/3.

---

## Unsupported Media Types

Any `Content-Type` not in the following list returns `UNSUPPORTED_MEDIA_TYPE`:

- `text/html`
- `text/markdown`
- `text/plain`
- `application/pdf`

---

## Live Benchmark Acquisition — DRA-DOC-0007

### Apache HTTP Server Authentication and Authorization Guide

The first live benchmark acquisition was executed immediately following successful completion of all quality gates.

**Acquisition details:**

| Field | Value |
|-------|-------|
| Corpus document ID | `DRA-DOC-0007` |
| Acquisition request ID | `DRA-ACQ-000001` |
| Fetcher | `createHttpFetcher()` (DRA-ENG-010) |
| Official source URL | `https://httpd.apache.org/docs/2.4/howto/auth.html` |
| Publisher | The Apache Software Foundation |
| Licence basis | `OPEN_LICENCE` — Apache License 2.0 |
| Live acquisition date | 2026-08-03 |
| Retrieved at | `2026-08-03T15:05:12.059Z` |
| HTTP status | 200 |
| Media type | `text/html` |
| Raw byte length | 36,023 bytes |
| Redirects | None (direct 200) |
| Last-Modified | Fri, 19 Jun 2026 14:27:30 GMT |
| Source SHA-256 | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Normalised text digest | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Estimated word count | 3,429 |

**Fixture file:**
`lib/dra-reference/src/benchmark/acquisition/fixtures/apache-httpd-auth-fixture.ts`

The fixture stores the verbatim HTML response body as a TypeScript string constant alongside all provenance metadata and pre-computed digests. The file is labelled `LIVE ACQUISITION FIXTURE — DRA-ENG-010` to clearly distinguish it from repository fixtures (which are manually transcribed without a live fetch).

Note: The `normalisedTextDigest` above reflects BOM/CRLF normalisation of the raw HTML only. Downstream HTML → plain text normalisation (performed by the normalisation stage) produces a different digest and is not pre-computed here.

**Human review gates (to be completed before corpus freeze):**
- `OfficialSourceAssessment` — reviewer must confirm `httpd.apache.org` as the authoritative official source
- `LicenceAssessment` — reviewer must confirm `OPEN_LICENCE` (Apache License 2.0) is acceptable for benchmark use
- `ApprovedMetadata` — reviewer must approve title, publisher, version, and domain classification

These gates require human sign-off before `acquireFreezeAndEvaluate()` may proceed to the FREEZE and CORPUS_INTEGRATION stages.

---

## Generation Scripts

| Script | Purpose |
|--------|---------|
| `lib/dra-reference/scripts/live-acquisition.mjs` | Performs live HTTPS fetch and prints acquisition diagnostics |
| `lib/dra-reference/scripts/write-apache-fixture.mjs` | Reads fetched bytes from `/tmp` and writes the TypeScript fixture file |
