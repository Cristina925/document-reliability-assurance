/**
 * DRA-ENG-010 — Live Acquisition Script
 *
 * Fetches the Apache HTTP Server Authentication and Authorization Guide
 * from the official Apache Software Foundation documentation server,
 * computes integrity digests, and prints all fixture data needed to
 * create the repository fixture file.
 *
 * Usage: node lib/dra-reference/scripts/live-acquisition.mjs
 *
 * This script is NOT a test. It performs a real HTTPS fetch and should
 * only be run deliberately to record a new corpus document acquisition.
 */

import { createHash } from "node:crypto";
import * as https from "node:https";

// ---------------------------------------------------------------------------
// Target document
// ---------------------------------------------------------------------------

const TARGET_URL = "https://httpd.apache.org/docs/2.4/howto/auth.html";
const ACQUISITION_ID = "DRA-ACQ-000001";
const CORPUS_DOC_ID = "DRA-DOC-0007";
const TIMEOUT_MS = 30_000;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// Minimal fetch implementation (mirrors http-fetcher.ts)
// ---------------------------------------------------------------------------

function fetchUrl(url, redirectChain = [], visited = new Set()) {
  return new Promise((resolve, reject) => {
    if (visited.has(url)) {
      return reject(new Error(`Redirect loop: ${url}`));
    }
    visited.add(url);
    if (redirectChain.length > 10) {
      return reject(new Error("Too many redirects"));
    }

    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "DRA-ENG-010-LiveAcquisition/1.0",
          Accept: "text/html, text/plain, */*;q=0.1",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;

        if ([301, 302, 307, 308].includes(status)) {
          const location = Array.isArray(res.headers.location)
            ? res.headers.location[0]
            : res.headers.location;
          res.resume();
          if (!location) return reject(new Error("Redirect with no Location"));
          const nextUrl = new URL(location, url).toString();
          const newChain = [...redirectChain, nextUrl];
          fetchUrl(nextUrl, newChain, visited).then(resolve).catch(reject);
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${status} from ${url}`));
        }

        const contentType = Array.isArray(res.headers["content-type"])
          ? res.headers["content-type"][0]
          : (res.headers["content-type"] ?? "");
        const mediaType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";

        const chunks = [];
        let total = 0;

        res.on("data", (chunk) => {
          total += chunk.length;
          if (total > MAX_BYTES) {
            req.destroy();
            reject(new Error(`Response too large: > ${MAX_BYTES} bytes`));
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          const raw = Buffer.concat(chunks);
          const retrievedAt = new Date().toISOString();
          const finalUrl =
            redirectChain.length > 0
              ? redirectChain[redirectChain.length - 1]
              : url;
          resolve({
            requestedUrl: TARGET_URL,
            finalUrl,
            redirects: redirectChain,
            httpStatus: status,
            mediaType,
            rawBytes: raw,
            contentType,
            contentLength: res.headers["content-length"],
            lastModified: res.headers["last-modified"],
            etag: res.headers["etag"],
            retrievedAt,
          });
        });

        res.on("error", reject);
      },
    );

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });

    req.on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// SHA-256 digest
// ---------------------------------------------------------------------------

function sha256hex(data) {
  return createHash("sha256").update(data).digest("hex");
}

// Normalise HTML: very minimal — just ensure UTF-8 decode is clean
function normaliseHtmlText(raw) {
  const text = raw.toString("utf8");
  // Strip BOM, normalise CRLF → LF, trim
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("DRA-ENG-010 — Live Benchmark Acquisition");
  console.log("==========================================");
  console.log(`Acquisition ID : ${ACQUISITION_ID}`);
  console.log(`Corpus Doc ID  : ${CORPUS_DOC_ID}`);
  console.log(`Target URL     : ${TARGET_URL}`);
  console.log(`Timestamp      : ${new Date().toISOString()}`);
  console.log("");

  let result;
  try {
    console.log("Fetching...");
    result = await fetchUrl(TARGET_URL);
    console.log(`✓ Retrieved ${result.rawBytes.length} bytes`);
  } catch (err) {
    console.error(`✗ Fetch failed: ${err.message}`);
    process.exit(1);
  }

  const sourceDigest = sha256hex(result.rawBytes);
  const normalisedText = normaliseHtmlText(result.rawBytes);
  const normalisedTextDigest = sha256hex(
    Buffer.from(normalisedText, "utf8"),
  );

  console.log("");
  console.log("── Provenance ─────────────────────────────────────────────");
  console.log(`  requestedUrl   : ${result.requestedUrl}`);
  console.log(`  finalUrl       : ${result.finalUrl}`);
  console.log(`  httpStatus     : ${result.httpStatus}`);
  console.log(`  mediaType      : ${result.mediaType}`);
  console.log(`  rawByteLength  : ${result.rawBytes.length}`);
  console.log(`  retrievedAt    : ${result.retrievedAt}`);
  console.log(`  redirects      : [${result.redirects.join(", ")}]`);
  console.log("");
  console.log("── HTTP Response Headers ───────────────────────────────────");
  console.log(`  content-type   : ${result.contentType}`);
  console.log(`  content-length : ${result.contentLength ?? "(not sent)"}`);
  console.log(`  last-modified  : ${result.lastModified ?? "(not sent)"}`);
  console.log(`  etag           : ${result.etag ?? "(not sent)"}`);
  console.log("");
  console.log("── Integrity Digests ───────────────────────────────────────");
  console.log(`  sourceDigest         : ${sourceDigest}`);
  console.log(`  normalisedTextDigest : ${normalisedTextDigest}`);
  console.log("");
  console.log("── Text Statistics ─────────────────────────────────────────");
  const wordCount = normalisedText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  console.log(`  normalisedTextLength : ${normalisedText.length} chars`);
  console.log(`  estimatedWordCount   : ${wordCount}`);
  console.log("");
  console.log("── First 1200 chars of normalised text ─────────────────────");
  console.log(normalisedText.slice(0, 1200));
  console.log("...");
  console.log("");
  console.log("── Fixture JSON ────────────────────────────────────────────");
  const fixture = {
    acquisitionId: ACQUISITION_ID,
    corpusDocumentId: CORPUS_DOC_ID,
    officialSourceUrl: TARGET_URL,
    finalUrl: result.finalUrl,
    httpStatus: result.httpStatus,
    mediaType: result.mediaType,
    rawByteLength: result.rawBytes.length,
    retrievedAt: result.retrievedAt,
    redirects: result.redirects,
    httpResponseHeaders: {
      contentType: result.contentType,
      contentLength: result.contentLength,
      lastModified: result.lastModified,
      etag: result.etag,
    },
    sourceDigest,
    normalisedTextDigest,
    wordCount,
  };
  console.log(JSON.stringify(fixture, null, 2));
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
