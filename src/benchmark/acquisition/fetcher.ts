/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: fetcher.ts — Injectable source-fetching abstraction
 *
 * Defines the SourceFetcher interface and AcquiredSource shape.
 * Provides createMockFetcher() for deterministic tests (no live network).
 *
 * Invariants:
 *   - Source bytes are preserved exactly; never silently converted or rewritten.
 *   - Non-success HTTP status codes return typed errors, not exceptions.
 *   - Empty responses return typed errors.
 *   - Responses above the size limit return typed errors.
 *   - Only PDF, HTML, Markdown, and plain text media types are accepted.
 *   - Redirects are recorded in the redirect chain.
 *   - The public API never throws for expected failures.
 */

import {
  type AcquisitionRequest,
  SUPPORTED_MEDIA_TYPES,
} from "./schema.js";
import { classifyMediaType } from "./media-type-detection.js";

// ---------------------------------------------------------------------------
// Default limits
// ---------------------------------------------------------------------------

/** Default maximum source size: 50 MiB. */
export const DEFAULT_MAX_SOURCE_BYTES = 50 * 1024 * 1024;

// ---------------------------------------------------------------------------
// AcquiredSource
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// HttpResponseHeaders — transport-level provenance (not approved metadata)
// ---------------------------------------------------------------------------

/**
 * Raw HTTP response headers recorded as transport-level provenance.
 *
 * These are strictly informational and must never be treated as approved
 * document metadata. Values are recorded exactly as received; missing
 * headers are omitted (not invented or inferred).
 */
export interface HttpResponseHeaders {
  /** Raw Content-Type header as received (includes charset parameters). */
  readonly contentType?: string;
  /** Content-Length header as received, when present. */
  readonly contentLength?: string;
  /** Last-Modified header as received, when present. */
  readonly lastModified?: string;
  /** ETag header as received, when present. */
  readonly etag?: string;
  /** Content-Encoding header as received, when present. */
  readonly contentEncoding?: string;
  /** Content-Language header as received, when present. */
  readonly contentLanguage?: string;
  /** Content-Disposition header as received, when present. */
  readonly contentDisposition?: string;
}

// ---------------------------------------------------------------------------
// AcquiredSource
// ---------------------------------------------------------------------------

/**
 * The raw bytes and HTTP metadata of a successfully fetched source document.
 *
 * rawBytes are the exact bytes received from the source.
 * They must not be modified, normalised, or re-encoded by this module.
 */
export interface AcquiredSource {
  /** Acquisition ID from the originating request. */
  readonly acquisitionId: string;
  /** The URL from the original request. */
  readonly requestedUrl: string;
  /** The final URL after all redirects. */
  readonly finalUrl: string;
  /** MIME media type declared by the server (without parameters). */
  readonly mediaType: string;
  /** Exact bytes received from the source, unmodified. */
  readonly rawBytes: Uint8Array;
  /** UTC ISO-8601 timestamp at which the content was retrieved. */
  readonly retrievedAt: string;
  /** HTTP status code. */
  readonly httpStatus: number;
  /** Chain of redirect URLs encountered in order. Empty if no redirects. */
  readonly redirects: readonly string[];
  /**
   * Raw HTTP response headers captured as transport-level provenance.
   * Present only when produced by createHttpFetcher(); undefined for mock sources.
   */
  readonly httpResponseHeaders?: HttpResponseHeaders;
}

// ---------------------------------------------------------------------------
// SourceFetchResult
// ---------------------------------------------------------------------------

export type SourceFetchErrorCode =
  | "HTTP_ERROR"
  | "EMPTY_RESPONSE"
  | "OVERSIZED_RESPONSE"
  | "SIZE_LIMIT_EXCEEDED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "NOT_FOUND"
  | "INVALID_URL"
  | "INVALID_REDIRECT";

export type SourceFetchResult =
  | { readonly ok: true; readonly source: AcquiredSource }
  | {
      readonly ok: false;
      readonly code: SourceFetchErrorCode;
      readonly message: string;
      readonly detail?: string;
    };

// ---------------------------------------------------------------------------
// SourceFetcher — injectable interface
// ---------------------------------------------------------------------------

export interface SourceFetcherOptions {
  /** Maximum bytes accepted. Defaults to DEFAULT_MAX_SOURCE_BYTES. */
  maxBytes?: number;
  /** Fixed retrieval timestamp for deterministic tests. */
  fixedRetrievedAt?: string;
}

/**
 * An injectable source-fetching function.
 *
 * Implementations must:
 *   - return typed errors instead of throwing for expected failures;
 *   - preserve source bytes exactly;
 *   - record the redirect chain;
 *   - reject non-success HTTP status codes;
 *   - reject empty responses;
 *   - reject responses above the configured size limit;
 *   - reject unsupported media types.
 *
 * Tests must use createMockFetcher; live fetching is not exercised by tests.
 */
export type SourceFetcher = (
  request: AcquisitionRequest,
  options?: SourceFetcherOptions,
) => Promise<SourceFetchResult>;

// ---------------------------------------------------------------------------
// MockFetcherResponse — configures one URL in the mock fetcher
// ---------------------------------------------------------------------------

export interface MockFetcherResponse {
  /** HTTP status code; defaults to 200. */
  httpStatus?: number;
  /** MIME type; defaults to "text/plain". */
  mediaType?: string;
  /** Response body. Empty string or undefined triggers EMPTY_RESPONSE error. */
  body?: string | Uint8Array;
  /** Redirect URLs encountered before the final response. */
  redirects?: string[];
  /**
   * Content-Disposition header value, if the scenario needs one (used by the
   * DRA-ENG-011 malformed/absent Content-Type fallback classifier).
   */
  contentDisposition?: string;
  /** If set, the fetcher returns this error instead of processing the body. */
  error?: { code: SourceFetchErrorCode; message: string };
}

// ---------------------------------------------------------------------------
// createMockFetcher
// ---------------------------------------------------------------------------

/**
 * Creates a deterministic mock SourceFetcher for use in tests.
 *
 * Never makes network requests. Resolves each URL against the provided
 * response map and applies the same validation logic as a live fetcher
 * (status, size, media type, empty body).
 *
 * @param responses            Map of URL string → MockFetcherResponse.
 * @param defaultRetrievedAt   Fixed retrieval timestamp for all responses.
 */
export function createMockFetcher(
  responses: Map<string, MockFetcherResponse>,
  defaultRetrievedAt = "2026-07-01T10:00:00",
): SourceFetcher {
  return async (
    request: AcquisitionRequest,
    options: SourceFetcherOptions = {},
  ): Promise<SourceFetchResult> => {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
    const retrievedAt = options.fixedRetrievedAt ?? defaultRetrievedAt;
    const mock = responses.get(request.sourceUrl);

    if (mock === undefined) {
      return {
        ok: false,
        code: "NETWORK_ERROR",
        message: `No mock response registered for URL: ${request.sourceUrl}`,
      };
    }

    // Return pre-programmed typed error.
    if (mock.error !== undefined) {
      return { ok: false, ...mock.error };
    }

    const httpStatus = mock.httpStatus ?? 200;

    // Non-success HTTP status.
    if (httpStatus < 200 || httpStatus >= 300) {
      return {
        ok: false,
        code: "HTTP_ERROR",
        message: `HTTP ${httpStatus} response from ${request.sourceUrl}`,
        detail: String(httpStatus),
      };
    }

    // Encode body to bytes.
    let rawBytes: Uint8Array;
    if (
      mock.body === undefined ||
      (typeof mock.body === "string" && mock.body.length === 0)
    ) {
      return {
        ok: false,
        code: "EMPTY_RESPONSE",
        message: `Empty response body from ${request.sourceUrl}`,
      };
    }
    if (mock.body instanceof Uint8Array) {
      rawBytes = mock.body;
      if (rawBytes.length === 0) {
        return {
          ok: false,
          code: "EMPTY_RESPONSE",
          message: `Empty response body from ${request.sourceUrl}`,
        };
      }
    } else {
      const encoded = new TextEncoder().encode(mock.body);
      if (encoded.length === 0) {
        return {
          ok: false,
          code: "EMPTY_RESPONSE",
          message: `Empty response body from ${request.sourceUrl}`,
        };
      }
      rawBytes = encoded;
    }

    // Size limit.
    if (rawBytes.length > maxBytes) {
      return {
        ok: false,
        code: "OVERSIZED_RESPONSE",
        message: `Response size ${rawBytes.length} bytes exceeds limit of ${maxBytes} bytes`,
        detail: String(rawBytes.length),
      };
    }

    // Media type validation — strip parameters (e.g. "; charset=utf-8").
    // DRA-ENG-011: classifyMediaType() applies the narrow, deterministic
    // malformed/absent-Content-Type PDF fallback; a syntactically valid
    // Content-Type (supported or not) is handled exactly as before.
    const rawMediaType = mock.mediaType ?? "text/plain";
    const mediaTypeHeader = rawMediaType.split(";")[0]?.trim().toLowerCase() ?? "";
    const classification = classifyMediaType({
      mediaTypeHeader,
      contentDisposition: mock.contentDisposition,
      bytes: rawBytes,
    });
    if (!classification.ok) {
      return {
        ok: false,
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: `Unsupported media type "${classification.rawValue}". Supported: ${SUPPORTED_MEDIA_TYPES.join(", ")}`,
        detail: classification.rawValue,
      };
    }
    const mediaType = classification.mediaType;

    const redirects = Object.freeze([...(mock.redirects ?? [])]);
    const finalUrl =
      redirects.length > 0
        ? (redirects[redirects.length - 1] ?? request.sourceUrl)
        : request.sourceUrl;

    return {
      ok: true,
      source: Object.freeze<AcquiredSource>({
        acquisitionId: request.acquisitionId,
        requestedUrl: request.sourceUrl,
        finalUrl,
        mediaType,
        rawBytes: new Uint8Array(rawBytes),
        retrievedAt,
        httpStatus,
        redirects,
        httpResponseHeaders: mock.contentDisposition
          ? Object.freeze({ contentDisposition: mock.contentDisposition })
          : undefined,
      }),
    };
  };
}
