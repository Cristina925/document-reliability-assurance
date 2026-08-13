/**
 * DRA-ACQ-017 Phase 2 test support — disk-cached SourceFetcher wrapper.
 *
 * Purpose: the DRA-DOC-0021 admission test must reconstruct the existing
 * 20-document corpus (DRA-DOC-0001–0020) for the near-duplicate check, which
 * requires re-fetching ~14 previously-frozen sources (some multi-page,
 * totalling 40+ HTTP requests). These are NOT new acquisitions — the
 * documents were already genuinely acquired, governed, and frozen in prior
 * acquisitions (DRA-ACQ-000002 through DRA-ACQ-000023); re-fetching them here
 * is purely to reconstruct normalised text for the pipeline's built-in
 * near-duplicate detector.
 *
 * This wrapper caches successful fetch results to disk (keyed by URL) so
 * that repeated local test runs do not re-issue dozens of redundant live
 * requests against third-party servers within a single CI-style shell
 * session budget. It does NOT weaken the acquisition governance for
 * DRA-DOC-0021 itself: the new document's own two-independent-fetch
 * determinism check (see the admission test's "Step 0") always bypasses
 * this cache and performs genuine live HTTP requests.
 *
 * Cache location: <workspace>/.cache/<cacheName>/<sha256(url)>.json
 * (raw bytes stored as base64 alongside transport metadata). Defaults to
 * "dra-acq-017-phase2" for backward compatibility with the original caller;
 * pass an explicit cacheName to give a different test suite its own
 * isolated cache directory (e.g. "dra-bmk-021").
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

import type { AcquisitionRequest } from "../../schema.js";
import type { SourceFetcher, SourceFetchResult, SourceFetcherOptions } from "../../fetcher.js";

function cacheDirFor(cacheName: string): string {
  return join(process.cwd(), ".cache", cacheName);
}

interface CachedEntry {
  readonly ok: true;
  readonly acquisitionId: string;
  readonly requestedUrl: string;
  readonly finalUrl: string;
  readonly mediaType: string;
  readonly rawBytesBase64: string;
  readonly retrievedAt: string;
  readonly httpStatus: number;
  readonly redirects: readonly string[];
  readonly httpResponseHeaders: Record<string, string | undefined>;
}

function cacheKey(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function readCache(cacheDir: string, url: string): Promise<CachedEntry | null> {
  const path = join(cacheDir, `${cacheKey(url)}.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as CachedEntry;
  } catch {
    return null;
  }
}

async function writeCache(cacheDir: string, url: string, entry: CachedEntry): Promise<void> {
  await mkdir(cacheDir, { recursive: true });
  const path = join(cacheDir, `${cacheKey(url)}.json`);
  await writeFile(path, JSON.stringify(entry), "utf-8");
}

/**
 * Wraps a real SourceFetcher with a disk cache. Cache hits skip the network
 * entirely; cache misses fall through to the real fetcher and persist the
 * result (only on success) for subsequent runs.
 */
export function createDiskCachedFetcher(
  realFetcher: SourceFetcher,
  cacheName: string = "dra-acq-017-phase2",
): SourceFetcher {
  const cacheDir = cacheDirFor(cacheName);
  return async (
    request: AcquisitionRequest,
    fetcherOptions: SourceFetcherOptions = {},
  ): Promise<SourceFetchResult> => {
    const cached = await readCache(cacheDir, request.sourceUrl);
    if (cached) {
      const bytes = Uint8Array.from(Buffer.from(cached.rawBytesBase64, "base64"));
      return {
        ok: true,
        source: Object.freeze({
          acquisitionId: request.acquisitionId,
          requestedUrl: cached.requestedUrl,
          finalUrl: cached.finalUrl,
          mediaType: cached.mediaType,
          rawBytes: bytes,
          retrievedAt: cached.retrievedAt,
          httpStatus: cached.httpStatus,
          redirects: Object.freeze([...cached.redirects]),
          httpResponseHeaders: Object.freeze({ ...cached.httpResponseHeaders }),
        }) as SourceFetchResult extends { ok: true; source: infer S } ? S : never,
      } as SourceFetchResult;
    }

    const result = await realFetcher(request, fetcherOptions);
    if (result.ok) {
      const src = result.source as unknown as {
        acquisitionId: string;
        requestedUrl: string;
        finalUrl: string;
        mediaType: string;
        rawBytes: Uint8Array;
        retrievedAt: string;
        httpStatus: number;
        redirects: readonly string[];
        httpResponseHeaders: Record<string, string | undefined>;
      };
      await writeCache(cacheDir, request.sourceUrl, {
        ok: true,
        acquisitionId: src.acquisitionId,
        requestedUrl: src.requestedUrl,
        finalUrl: src.finalUrl,
        mediaType: src.mediaType,
        rawBytesBase64: Buffer.from(src.rawBytes).toString("base64"),
        retrievedAt: src.retrievedAt,
        httpStatus: src.httpStatus,
        redirects: src.redirects,
        httpResponseHeaders: src.httpResponseHeaders,
      });
    }
    return result;
  };
}
