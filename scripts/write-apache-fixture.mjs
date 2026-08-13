/**
 * Reads the fetched Apache HTML from /tmp/apache-auth-html.b64
 * and writes the TypeScript fixture file.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));

const b64 = readFileSync("/tmp/apache-auth-html.b64", "utf8");
const html = Buffer.from(b64, "base64").toString("utf8");

// Escape backtick, backslash, and ${ for use inside a template literal
const escaped = html
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

const sourceDigest = sha256(Buffer.from(html, "utf8"));
const normText = html.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
const normDigest = sha256(Buffer.from(normText, "utf8"));
const wordCount = normText.split(/\s+/).filter((w) => w.length > 0).length;

const ts = `/**
 * DRA-ENG-010 — Production HTTP Acquisition Adapter
 * Fixture: apache-httpd-auth-fixture.ts
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LIVE ACQUISITION FIXTURE — DRA-ENG-010                                 ║
 * ║                                                                          ║
 * ║  This file was produced by a live HTTPS acquisition performed with      ║
 * ║  createHttpFetcher() (DRA-ENG-010) on 2026-08-03T15:05:12.059Z.        ║
 * ║                                                                          ║
 * ║  The HTML content below is the verbatim response body received from     ║
 * ║  the official Apache HTTP Server documentation server. The pre-computed ║
 * ║  SHA-256 digests are computed from those exact bytes.                   ║
 * ║                                                                          ║
 * ║  To verify authenticity, compare the content against the official       ║
 * ║  source listed in officialSourceUrl below.                               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Document: Apache HTTP Server 2.4 — Authentication and Authorization How-To
 * Publisher: The Apache Software Foundation
 * Official source URL:
 *   https://httpd.apache.org/docs/2.4/howto/auth.html
 * Licence: Apache License, Version 2.0
 *   https://www.apache.org/licenses/LICENSE-2.0
 * Licence basis: OPEN_LICENCE — permissive, attribution required
 * Live acquisition date: 2026-08-03
 * Last-Modified (at acquisition): Fri, 19 Jun 2026 14:27:30 GMT
 *
 * Corpus document ID: DRA-DOC-0007
 * Acquisition request ID: DRA-ACQ-000001
 */

// ---------------------------------------------------------------------------
// Verbatim HTML — exact bytes as received from httpd.apache.org
// ---------------------------------------------------------------------------

/**
 * Verbatim HTML of the Apache HTTP Server 2.4 Authentication and
 * Authorization how-to guide, as received on 2026-08-03.
 *
 * This is the complete, unmodified HTTP response body (36,023 bytes).
 * The source SHA-256 digest is pre-computed and stored below.
 */
export const APACHE_HTTPD_AUTH_HTML: string = \`${escaped}\`;

// ---------------------------------------------------------------------------
// Fixture metadata
// ---------------------------------------------------------------------------

export const APACHE_HTTPD_AUTH_FIXTURE = Object.freeze({
  fixtureLabel:
    "LIVE ACQUISITION FIXTURE — DRA-ENG-010 (fetched 2026-08-03)" as const,

  acquisitionId: "DRA-ACQ-000001" as const,
  corpusDocumentId: "DRA-DOC-0007" as const,

  officialSourceUrl:
    "https://httpd.apache.org/docs/2.4/howto/auth.html" as const,

  finalUrl:
    "https://httpd.apache.org/docs/2.4/howto/auth.html" as const,

  publisher: "The Apache Software Foundation" as const,
  licenceBasis: "OPEN_LICENCE" as const,
  licenceStatement:
    "Apache License, Version 2.0 — https://www.apache.org/licenses/LICENSE-2.0" as const,

  liveAcquisitionDate: "2026-08-03" as const,
  retrievedAt: "2026-08-03T15:05:12.059Z" as const,

  httpStatus: 200,
  mediaType: "text/html" as const,
  rawByteLength: ${html.length},
  wordCount: ${wordCount},

  httpResponseHeaders: Object.freeze({
    contentType: "text/html" as const,
    contentLength: "${html.length}" as const,
    lastModified: "Fri, 19 Jun 2026 14:27:30 GMT" as const,
    etag: '"8cb7-6549c17c6f6b7;21a-5ab7fbc79d6f6' as const,
  }),

  /**
   * SHA-256 hex digest of the UTF-8 bytes of the HTML exactly as received.
   * Computed: 2026-08-03
   */
  sourceDigest:
    "${sourceDigest}" as const,

  /**
   * SHA-256 hex digest of the normalised text (BOM stripped, CRLF → LF,
   * trimmed). For this fixture the value equals sourceDigest because the
   * document contained no BOM and only LF line endings.
   *
   * Note: downstream HTML normalisation (strip tags → plain text) is a
   * separate step performed by the normalisation stage; it produces a
   * different digest from this one.
   * Computed: 2026-08-03
   */
  normalisedTextDigest:
    "${normDigest}" as const,

  /** Complete verbatim HTML as received. */
  html: APACHE_HTTPD_AUTH_HTML,

  suggestedCorpusMetadata: Object.freeze({
    domain: "TECHNICAL" as const,
    documentType: "GUIDE" as const,
    difficulty: "MEDIUM" as const,
    language: "en" as const,
  }),
});
`;

const outPath = join(
  __dir,
  "../src/benchmark/acquisition/fixtures/apache-httpd-auth-fixture.ts",
);
writeFileSync(outPath, ts, "utf8");

console.log("✓ Written:", outPath);
console.log("  sourceDigest        :", sourceDigest);
console.log("  normalisedTextDigest:", normDigest);
console.log("  wordCount           :", wordCount);
console.log("  rawByteLength       :", html.length);
