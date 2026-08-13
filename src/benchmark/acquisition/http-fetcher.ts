/**
 * DRA-ENG-010 — Production HTTP Acquisition Adapter
 * Module: http-fetcher.ts — Real HTTPS (and optional HTTP) SourceFetcher
 *
 * Implements the SourceFetcher interface using Node.js built-in http/https
 * modules. No external network libraries are introduced.
 *
 * Security invariants:
 *   - HTTPS is the default; HTTP requires explicit opt-in via allowHttp.
 *   - TLS certificate validation is always enforced; never bypassed.
 *   - ftp:, file:, data:, javascript:, blob:, mailto: and all other
 *     non-HTTP(S) schemes are rejected unconditionally.
 *   - HTTPS → HTTP downgrade redirects are rejected unless allowHttp is set.
 *   - Redirect loops are detected via a per-request visited-URL set.
 *
 * Provenance invariants:
 *   - Source bytes are preserved exactly as received; never modified.
 *   - HTTP response headers are recorded as transport-level provenance.
 *   - Provenance headers are stored separately from approved document metadata.
 *   - No header values are invented or inferred when absent.
 *
 * Error invariants:
 *   - The public API never throws for expected acquisition failures.
 *   - All failures are returned as typed SourceFetchResult errors.
 *   - Unexpected internal errors propagate as NETWORK_ERROR, never throw.
 */

import * as https from "node:https";
import * as http from "node:http";
import type { IncomingMessage } from "node:http";

import {
  type AcquisitionRequest,
  SUPPORTED_MEDIA_TYPES,
} from "./schema.js";
import {
  type SourceFetcher,
  type SourceFetchResult,
  type SourceFetcherOptions,
  type HttpResponseHeaders,
  DEFAULT_MAX_SOURCE_BYTES,
} from "./fetcher.js";
import { classifyMediaType } from "./media-type-detection.js";

// ---------------------------------------------------------------------------
// HttpFetcherOptions — public configuration contract
// ---------------------------------------------------------------------------

/**
 * Configuration for the production HTTP acquisition adapter.
 *
 * All limits are applied per-acquisition (not globally).
 */
export interface HttpFetcherOptions {
  /**
   * Maximum time to wait for the complete response in milliseconds.
   * Covers the full lifecycle: connection + headers + body.
   */
  timeoutMs: number;
  /**
   * Maximum number of redirects to follow.
   * A value of 0 means no redirects are followed.
   */
  maxRedirects: number;
  /**
   * Maximum response body size in bytes.
   * Responses that exceed this limit return SIZE_LIMIT_EXCEEDED.
   */
  maxBytes: number;
  /**
   * User-Agent header sent with every request.
   * Defaults to "DRA-ENG-010/1.0".
   */
  userAgent?: string;
  /**
   * When true, plain HTTP URLs and HTTP redirect targets are accepted.
   * Default: false (HTTPS only).
   *
   * Should be used only in controlled environments (e.g. internal test servers).
   * Never set this in production acquisitions of public documents.
   */
  allowHttp?: boolean;
}

// ---------------------------------------------------------------------------
// createHttpFetcher — public factory
// ---------------------------------------------------------------------------

/**
 * Creates a production SourceFetcher that performs real HTTP/HTTPS requests.
 *
 * The returned fetcher satisfies the SourceFetcher interface exactly and
 * enforces the same validation rules as createMockFetcher (status codes,
 * size limits, media types, empty responses) plus additional HTTP-specific
 * controls (redirect following, TLS, provenance header capture).
 *
 * @param options  Configuration for timeouts, redirect limits, and security.
 * @returns        A SourceFetcher suitable for production acquisitions.
 */
export function createHttpFetcher(options: HttpFetcherOptions): SourceFetcher {
  return async (
    request: AcquisitionRequest,
    fetcherOptions: SourceFetcherOptions = {},
  ): Promise<SourceFetchResult> => {
    const maxBytes =
      fetcherOptions.maxBytes ?? options.maxBytes ?? DEFAULT_MAX_SOURCE_BYTES;
    const retrievedAt =
      fetcherOptions.fixedRetrievedAt ?? new Date().toISOString();

    // --- URL validation (before any network activity) ---
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(request.sourceUrl);
    } catch {
      return {
        ok: false,
        code: "INVALID_URL",
        message: `Malformed URL: ${request.sourceUrl}`,
        detail: request.sourceUrl,
      };
    }

    const scheme = parsedUrl.protocol;
    if (scheme !== "https:" && scheme !== "http:") {
      return {
        ok: false,
        code: "INVALID_URL",
        message:
          `Unsupported URL scheme "${scheme}". ` +
          `Accepted: https${options.allowHttp ? ", http" : ""}.`,
        detail: scheme,
      };
    }

    if (scheme === "http:" && !options.allowHttp) {
      return {
        ok: false,
        code: "INVALID_URL",
        message:
          `Plain HTTP rejected for URL: ${request.sourceUrl}. ` +
          `Set allowHttp: true to permit non-TLS connections.`,
        detail: "http:",
      };
    }

    return performFetch(
      request.sourceUrl, // currentUrl — changes on each redirect hop
      request.sourceUrl, // requestedUrl — constant throughout
      request.acquisitionId,
      options,
      maxBytes,
      retrievedAt,
      [], // redirectChain — grows on each hop; recorded in AcquiredSource.redirects
      new Set([request.sourceUrl]), // visitedUrls — for loop detection
    );
  };
}

// ---------------------------------------------------------------------------
// performFetch — internal recursive implementation
// ---------------------------------------------------------------------------

/**
 * Performs one HTTP request, following redirects recursively.
 *
 * redirectChain semantics (mirrors createMockFetcher convention):
 *   - Each hop adds the redirect TARGET to the chain.
 *   - On success, AcquiredSource.redirects = redirectChain.
 *   - AcquiredSource.finalUrl = redirectChain.last ?? requestedUrl.
 *
 * visitedUrls semantics:
 *   - Includes requestedUrl and all redirect targets visited so far.
 *   - Shared (mutated) across recursive calls so loops are always caught.
 */
function performFetch(
  currentUrl: string,
  requestedUrl: string,
  acquisitionId: string,
  options: HttpFetcherOptions,
  maxBytes: number,
  retrievedAt: string,
  redirectChain: string[],
  visitedUrls: Set<string>,
): Promise<SourceFetchResult> {
  return new Promise<SourceFetchResult>((resolve) => {
    // Single-resolution guard — prevents double-settlement in edge cases.
    let settled = false;
    function settle(result: SourceFetchResult): void {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    }

    let timedOut = false;
    let sizeLimitExceeded = false;

    const scheme = new URL(currentUrl).protocol; // pre-validated by caller
    const requester = scheme === "https:" ? https : http;

    const req = requester.get(
      currentUrl,
      {
        headers: {
          "User-Agent": options.userAgent ?? "DRA-ENG-010/1.0",
          Accept:
            "text/html, text/markdown, text/plain, application/pdf, */*;q=0.1",
        },
      },
      (res: IncomingMessage) => {
        const statusCode = res.statusCode ?? 0;

        // ── Redirect handling ───────────────────────────────────────────────
        if ([301, 302, 307, 308].includes(statusCode)) {
          const rawLocation = res.headers["location"];
          const location = Array.isArray(rawLocation)
            ? rawLocation[0]
            : rawLocation;
          // Drain and discard the redirect response body.
          res.resume();

          if (!location) {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Redirect ${statusCode} missing Location header at: ${currentUrl}`,
              detail: String(statusCode),
            });
            return;
          }

          // Resolve relative Location values against the current URL.
          let redirectUrl: string;
          try {
            redirectUrl = new URL(location, currentUrl).toString();
          } catch {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Invalid Location header value: "${location}"`,
              detail: location,
            });
            return;
          }

          // Reject redirects to unsupported schemes.
          let redirectScheme: string;
          try {
            redirectScheme = new URL(redirectUrl).protocol;
          } catch {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Redirect target is malformed: ${redirectUrl}`,
              detail: redirectUrl,
            });
            return;
          }

          if (redirectScheme !== "https:" && redirectScheme !== "http:") {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Redirect to unsupported scheme "${redirectScheme}": ${redirectUrl}`,
              detail: redirectScheme,
            });
            return;
          }

          // Reject HTTPS → HTTP downgrade unless allowHttp is set.
          if (redirectScheme === "http:" && !options.allowHttp) {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `HTTPS-to-HTTP downgrade redirect rejected: ${redirectUrl}`,
              detail: redirectUrl,
            });
            return;
          }

          // Redirect loop detection.
          if (visitedUrls.has(redirectUrl)) {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Redirect loop detected: "${redirectUrl}" was already visited`,
              detail: redirectUrl,
            });
            return;
          }

          // Redirect count limit — checked against the chain AFTER adding this hop.
          const newChain = [...redirectChain, redirectUrl];
          if (newChain.length > options.maxRedirects) {
            settle({
              ok: false,
              code: "INVALID_REDIRECT",
              message: `Too many redirects: limit is ${options.maxRedirects}, attempted ${newChain.length}`,
              detail: String(newChain.length),
            });
            return;
          }

          visitedUrls.add(redirectUrl);
          performFetch(
            redirectUrl,
            requestedUrl,
            acquisitionId,
            options,
            maxBytes,
            retrievedAt,
            newChain,
            visitedUrls,
          )
            .then(settle)
            .catch((err: unknown) => {
              settle({
                ok: false,
                code: "NETWORK_ERROR",
                message:
                  err instanceof Error ? err.message : String(err),
              });
            });
          return;
        }

        // ── 404 Not Found ───────────────────────────────────────────────────
        if (statusCode === 404) {
          res.resume();
          settle({
            ok: false,
            code: "NOT_FOUND",
            message: `404 Not Found: ${currentUrl}`,
            detail: currentUrl,
          });
          return;
        }

        // ── Other non-success HTTP status ───────────────────────────────────
        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          settle({
            ok: false,
            code: "HTTP_ERROR",
            message: `HTTP ${statusCode} error from: ${currentUrl}`,
            detail: String(statusCode),
          });
          return;
        }

        // ── Capture transport-level provenance headers ──────────────────────
        const rawContentType = res.headers["content-type"];
        const rawContentDisposition = res.headers["content-disposition"];
        const httpResponseHeaders: HttpResponseHeaders = Object.freeze({
          contentType: Array.isArray(rawContentType)
            ? rawContentType[0]
            : rawContentType,
          contentLength: res.headers["content-length"] as string | undefined,
          lastModified: res.headers["last-modified"] as string | undefined,
          etag: res.headers["etag"] as string | undefined,
          contentEncoding: res.headers[
            "content-encoding"
          ] as string | undefined,
          contentLanguage: res.headers[
            "content-language"
          ] as string | undefined,
          contentDisposition: Array.isArray(rawContentDisposition)
            ? rawContentDisposition[0]
            : rawContentDisposition,
        });

        // ── Media type validation ───────────────────────────────────────────
        // Strip parameters (e.g. "; charset=utf-8") before checking.
        // DRA-ENG-011: a syntactically valid Content-Type (case A/B) is
        // decided immediately, exactly as before — no bytes are downloaded
        // for an immediately-rejected unsupported type. A malformed or
        // absent Content-Type (case C) defers the decision until the body
        // is collected, so the narrow PDF fallback (Content-Disposition +
        // "%PDF-" signature) can be evaluated; see media-type-detection.ts.
        const rawMediaTypeHeader = httpResponseHeaders.contentType ?? "";
        const mediaTypeHeader =
          rawMediaTypeHeader.split(";")[0]?.trim().toLowerCase() ?? "";

        const preliminaryClassification = classifyMediaType({
          mediaTypeHeader,
          contentDisposition: httpResponseHeaders.contentDisposition,
          bytes: undefined, // bytes not yet available; only case A/B can resolve here
        });

        if (
          !preliminaryClassification.ok &&
          preliminaryClassification.reason === "unsupported"
        ) {
          // Case B: syntactically valid but unsupported — reject immediately,
          // exactly as before. No need to download the body.
          res.resume();
          settle({
            ok: false,
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `Unsupported media type "${preliminaryClassification.rawValue}". Supported: ${SUPPORTED_MEDIA_TYPES.join(", ")}`,
            detail: preliminaryClassification.rawValue,
          });
          return;
        }

        // Case A (already ok) falls through with a known mediaType. Case C
        // (malformed/absent) also falls through — its classification is
        // deferred until bytes are available below.
        const finalMediaType: string | undefined = preliminaryClassification.ok
          ? preliminaryClassification.mediaType
          : undefined;

        // ── Collect response bytes (exact preservation) ─────────────────────
        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on("data", (chunk: Buffer) => {
          if (sizeLimitExceeded || settled) return;
          totalBytes += chunk.length;
          if (totalBytes > maxBytes) {
            sizeLimitExceeded = true;
            req.destroy();
            settle({
              ok: false,
              code: "SIZE_LIMIT_EXCEEDED",
              message: `Response size exceeds limit of ${maxBytes} bytes`,
              detail: String(totalBytes),
            });
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          if (sizeLimitExceeded || settled) return;

          const rawBuffer = Buffer.concat(chunks);

          // Empty response check.
          if (rawBuffer.length === 0) {
            settle({
              ok: false,
              code: "EMPTY_RESPONSE",
              message: `Empty response body from: ${currentUrl}`,
              detail: currentUrl,
            });
            return;
          }

          // DRA-ENG-011 case C resolution: the Content-Type header was
          // malformed/absent, so classification was deferred until bytes
          // were available. Re-run classifyMediaType now, with bytes, to
          // evaluate the narrow PDF fallback (Content-Disposition + "%PDF-"
          // signature must BOTH agree). This never runs when the header was
          // already syntactically valid (finalMediaType would be defined).
          let mediaType: string;
          if (finalMediaType !== undefined) {
            mediaType = finalMediaType;
          } else {
            const bytes = new Uint8Array(rawBuffer);
            const fallbackClassification = classifyMediaType({
              mediaTypeHeader,
              contentDisposition: httpResponseHeaders.contentDisposition,
              bytes,
            });
            if (!fallbackClassification.ok) {
              settle({
                ok: false,
                code: "UNSUPPORTED_MEDIA_TYPE",
                message: `Unsupported media type "${fallbackClassification.rawValue || "(absent)"}". Supported: ${SUPPORTED_MEDIA_TYPES.join(", ")}`,
                detail: fallbackClassification.rawValue,
              });
              return;
            }
            mediaType = fallbackClassification.mediaType;
          }

          const finalUrl =
            redirectChain.length > 0
              ? (redirectChain[redirectChain.length - 1] ?? currentUrl)
              : currentUrl;

          settle({
            ok: true,
            source: Object.freeze({
              acquisitionId,
              requestedUrl,
              finalUrl,
              mediaType,
              rawBytes: new Uint8Array(rawBuffer),
              retrievedAt,
              httpStatus: statusCode,
              redirects: Object.freeze([...redirectChain]),
              httpResponseHeaders,
            }),
          });
        });

        res.on("error", (err: Error) => {
          if (!timedOut && !settled) {
            settle({
              ok: false,
              code: "NETWORK_ERROR",
              message: `Response stream error: ${err.message}`,
              detail: err.message,
            });
          }
        });
      },
    );

    // ── Timeout handling ────────────────────────────────────────────────────
    // req.setTimeout fires once the socket is idle for timeoutMs ms.
    // We set timedOut=true before destroying so the error handler can
    // distinguish a timeout from other ECONNRESET/socket-hang-up errors.
    req.setTimeout(options.timeoutMs, () => {
      timedOut = true;
      req.destroy();
    });

    req.on("error", (err: Error) => {
      if (timedOut) {
        settle({
          ok: false,
          code: "TIMEOUT",
          message: `Request timed out after ${options.timeoutMs}ms: ${currentUrl}`,
          detail: String(options.timeoutMs),
        });
      } else if (!sizeLimitExceeded) {
        settle({
          ok: false,
          code: "NETWORK_ERROR",
          message: err.message,
          detail: err.message,
        });
      }
    });
  });
}
