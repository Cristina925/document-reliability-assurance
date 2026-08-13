/**
 * DRA-ACQ-005 — Controlled Corpus Admission for DRA-DOC-0010
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-005                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-005 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions have been received and assessments           ║
 * ║  upgraded to VERIFIED per the batch human-review sign-off on 2026-08-06. ║
 * ║                                                                          ║
 * ║  Document:   Artificial Intelligence Risk Management Framework           ║
 * ║              (AI RMF 1.0)                                                ║
 * ║  Corpus ID:  DRA-DOC-0010                                                ║
 * ║  Freeze ID:  DRA-FRZ-000004                                              ║
 * ║  Publisher:  National Institute of Standards and Technology (NIST)       ║
 * ║  Publication: NIST AI 100-1                                              ║
 * ║  DOI:        10.6028/NIST.AI.100-1                                       ║
 * ║  Acquisition ID: DRA-ACQ-000012                                          ║
 * ║                                                                          ║
 * ║  Canonical URL:                                                          ║
 * ║    https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf               ║
 * ║                                                                          ║
 * ║  NOTE ON HEAD REQUEST BEHAVIOUR:                                         ║
 * ║  nvlpubs.nist.gov returns HTTP 404 for HEAD requests (server             ║
 * ║  configuration). GET requests return HTTP 200 with the full PDF.         ║
 * ║  The DRA HTTP fetcher uses GET; this behaviour is expected.              ║
 * ║                                                                          ║
 * ║  NOTE ON LAST-MODIFIED DATE (per human governance decision):             ║
 * ║  HTTP Last-Modified is Wed, 04 Jun 2025 17:14:26 GMT. The acquired       ║
 * ║  document's internal title, publication number, DOI and version          ║
 * ║  references match AI RMF 1.0. No v1.1 or later indicators detected.     ║
 * ║  This date does not prove whether the file was re-rendered or            ║
 * ║  substantively changed; it is recorded but not overclaimed.              ║
 * ║                                                                          ║
 * ║  Single-document acquisition (no paired evidence source).                ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch → verify digests → near-duplicate (incl. DRA-DOC-0009) →       ║
 * ║    freeze eligibility → freeze record → corpus integration →             ║
 * ║    manifest integrity verification                                       ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - evaluator execution (evaluateDocument not called)                   ║
 * ║    - proof-receipt generation                                            ║
 * ║    - assurance decision                                                  ║
 * ║    - DRA-CASE infrastructure creation                                    ║
 * ║                                                                          ║
 * ║  Expected eligibility result:                                            ║
 * ║    All 13 of 13 freeze-eligibility checks must pass.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified in the
 * DRA-ACQ-004 / DRA-ACQ-005 batch human-review sign-off on 2026-08-06.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values below reflect explicit human sign-off on official source provenance,
 * document identity, and licence suitability.
 *
 * Reference digests (from DRA-ACQ-005 preparation run 2026-08-04):
 *   Source digest (SHA-256 of raw bytes):  7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1
 *   Text digest (SHA-256 of normalised):   6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430
 *   Byte length:                           1,946,127
 *   Text length (chars, normalised):       122,238
 *
 * Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0009
 * (DRA-DOC-0009 = CMA AI Foundation Models: Short Version, admitted immediately
 * prior in this batch governance session; re-fetched here for comparison.)
 *
 * This test makes live HTTPS requests to nvlpubs.nist.gov,
 * assets.publishing.service.gov.uk, and acas.org.uk. Allow 8 minutes.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import {
  computeSourceDigest,
  computeApprovedMetadataDigest,
} from "../integrity.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionRequest } from "../request.js";
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
} from "../freeze.js";
import { integrateWithCorpus } from "../manifest-integration.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Governance review timestamp — batch human sign-off received 2026-08-06. */
const REVIEW_TIMESTAMP = "2026-08-06T11:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T11:30:00.000Z";

// ---------------------------------------------------------------------------
// Canonical URL
// ---------------------------------------------------------------------------

const NIST_PDF_URL =
  "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-005 preparation run (2026-08-04)
// ---------------------------------------------------------------------------

const REFERENCE_SOURCE_DIGEST =
  "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1";

const REFERENCE_TEXT_DIGEST =
  "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430";

const REFERENCE_BYTE_LENGTH = 1946127;

// Reference digests for DRA-DOC-0009 (CMA Short Version) — used in corpus-text rebuild
const REFERENCE_CMA_SOURCE_DIGEST =
  "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f";

const CMA_SHORT_VERSION_URL =
  "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-005-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Digest change classifier
// ---------------------------------------------------------------------------

function classifyDigestChange(
  ref: string,
  current: string,
  refBytes: number,
  currentBytes: number,
  label: string,
): string {
  if (ref === current) return "UNCHANGED";
  if (refBytes !== currentBytes) {
    return (
      `SOURCE_CHANGE_DETECTED — ${label}: byte count changed ` +
      `from ${refBytes} to ${currentBytes}. Stop before admission.`
    );
  }
  return (
    `EXTRACTION_OR_ENCODING_NONDETERMINISM — ${label}: ` +
    `byte counts match (${currentBytes}) but digest differs. ` +
    `Stop before admission.`
  );
}

// ---------------------------------------------------------------------------
// Human Governance Decision 1 — Official Source Assessment
//
// Status: VERIFIED
//
// Human review basis (DRA-ACQ-005 batch sign-off, 2026-08-06):
//   Decision 1 (Document Identity — VERIFIED):
//     The fetched PDF's title, publication number, DOI and internal version
//     markers identify it as AI RMF 1.0, released January 2023.
//
//   Decision 2 (Last-Modified — RECORDED, NOT OVERCLAIMED):
//     HTTP Last-Modified is 4 June 2025. This date alone does not prove
//     whether the file was re-rendered or substantively changed. No v1.1
//     indicators detected. Recorded without overclaiming.
//
//   Decision 3 (Official Source — VERIFIED):
//     The PDF was retrieved from official NIST publication infrastructure
//     and corresponds to the official NIST catalogue record for NIST AI 100-1.
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-005-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Canonical PDF URL: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    "DOI: https://doi.org/10.6028/NIST.AI.100-1 — resolves to canonical nvlpubs URL",
    "PDF retrieved from official NIST publication infrastructure (nvlpubs.nist.gov)",
    "NIST catalogue record for NIST AI 100-1: January 2023 publication",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    "HTTP Content-Length: 1946127 bytes",
    "HTTP Last-Modified: Wed, 04 Jun 2025 17:14:26 GMT (recorded, not overclaimed: does not prove re-render vs. content change)",
    "HTTP ETag: \"327b21f74d5db1:0\"",
    "PDF internal title: 'Artificial Intelligence Risk Management Framework (AI RMF 1.0)'",
    "PDF internal publication number: 'NIST AI 100-1'",
    "PDF internal date: 'January 2023'",
    "PDF internal DOI reference: 'https://doi.org/10.6028/NIST.AI.100-1'",
    "PDF internal version markers: 'AI RMF 1.0' throughout; no v1.1 or later indicators detected",
    "PDF attributes U.S. Department of Commerce / National Institute of Standards and Technology",
    "PDF signed by: Laurie E. Locascio, NIST Director and Under Secretary of Commerce for Standards and Technology",
    "Source digest recorded: 7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1",
    "Text digest recorded: 6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430",
    "Two independent fetches produced identical source and text digests (reproducibility confirmed)",
  ],
  notes:
    "DRA-ACQ-005 Human Governance Decisions 1–3 — document identity VERIFIED; " +
    "official source VERIFIED; Last-Modified June 2025 recorded without overclaiming. " +
    "Human review sign-off received on 2026-08-06 (batch review with DRA-ACQ-004). " +
    "PDF retrieved from official NIST publication infrastructure. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 4 — Licence Assessment
//
// Status: VERIFIED WITH SCOPE QUALIFICATION
//
// Human review basis (DRA-ACQ-005 batch sign-off, 2026-08-06):
//   Classification: PUBLIC_DOMAIN_US_GOVERNMENT_WORK
//   Basis: NIST-authored U.S. Government work not protected by copyright
//          under 17 U.S.C. § 105.
//   Scope qualification:
//     - Include NIST-authored textual content in the evaluation scope.
//     - Exclude or separately record any third-party copyrighted material.
//     - Do not treat NIST names, seals, logos or marks as freely reusable.
//     - Preserve all attribution and provenance records.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work (public domain, 17 U.S.C. § 105)",
  licenceBasis: "US_GOVERNMENT_WORK" as const,
  assessedBy: "DRA-ACQ-005-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "NIST is an agency of the U.S. Department of Commerce — a federal government agency",
    "17 U.S.C. § 105: copyright protection not available for works of the United States Government",
    "No copyright notice found in PDF text extraction",
    "PDF cover page states: 'This publication is available free of charge from: https://doi.org/10.6028/NIST.AI.100-1'",
    "USA.gov policy: U.S. government works are in the public domain in the United States",
    "Evaluation scope is NIST-authored textual content only",
    "Exclusions: NIST names, seals, logos and marks are not treated as freely reusable",
    "Exclusions: any third-party copyrighted material incorporated in the document (separately recorded if identified)",
    "Scope qualification applied: attribution and provenance records preserved throughout",
    "Third-party content disclaimer on cover page pertains only to identification of commercial entities, not to copyright in referenced materials",
    "Document contains figures (Figs. 1–3) and tables (Tables 1–4); evaluation scope is text only",
  ],
  notes:
    "DRA-ACQ-005 Human Governance Decision 4 — licence VERIFIED WITH SCOPE QUALIFICATION. " +
    "Classification: PUBLIC_DOMAIN_US_GOVERNMENT_WORK (17 U.S.C. § 105). " +
    "Human review sign-off received on 2026-08-06 (batch review with DRA-ACQ-004). " +
    "Scope qualification: include NIST-authored text; exclude logos, marks, and third-party material. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  publisher: "National Institute of Standards and Technology (NIST)",
  publicationDate: "2023-01-26",
  domain: "TECHNICAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First POLICY-type corpus entry: zero POLICY documents in DRA-DOC-0001–0009. " +
  "Adds NIST as a new institution not represented in the corpus. " +
  "TECHNICAL domain: AI risk management and trustworthiness governance; " +
  "distinct from existing TECHNICAL entries (safety audit, DPIA, vendor risk, clinical validation, " +
  "financial controls, security policy, Apache HTTP authentication). " +
  "HIGH difficulty: technical risk management taxonomy; cross-functional governance language. " +
  "PUBLIC_DOMAIN source type: first U.S. government public domain document in the corpus. " +
  "Self-contained framework document (no separate short version); exercises evaluator on " +
  "governance claims (GOVERN/MAP/MEASURE/MANAGE functions with structured categories/subcategories). " +
  "No self-evaluation risk: NIST AI RMF addresses organisational AI risk management; " +
  "does not reference document reliability assessment systems. " +
  "No predetermined issue class.";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText fields)
// DRA-DOC-0007:      normalised from APACHE_HTTPD_AUTH_HTML fixture
// DRA-DOC-0008:      re-fetched from acas.org.uk (live network)
// DRA-DOC-0009:      re-fetched from GOV.UK assets (live network)
//                    (newly admitted in this batch session; must be included)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006
  for (const entry of BENCHMARK_CORPUS) {
    const bytes = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007 — Apache HTTP Server guide
  const apacheBytes = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008 — Acas guide (live fetch)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-005-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const acasDigest = computeSourceDigest(acasFetch.source.rawBytes);
      const acasNorm = await normaliseContent(
        acasFetch.source.rawBytes,
        "application/pdf",
        acasDigest,
        extractPdfText,
      );
      if (acasNorm.ok) texts.push(acasNorm.document.text);
    }
  }

  // DRA-DOC-0009 — CMA AI Foundation Models: Short Version (live fetch)
  // Newly admitted in this batch session. Must be included in near-duplicate check.
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl: CMA_SHORT_VERSION_URL,
    requestedBy: "DRA-ACQ-005-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const cmaDigest = computeSourceDigest(cmaFetch.source.rawBytes);
      if (cmaDigest !== REFERENCE_CMA_SOURCE_DIGEST) {
        console.warn(
          "  WARNING: CMA Short Version source digest differs from DRA-FRZ-000003 reference.",
          "\n  Reference:", REFERENCE_CMA_SOURCE_DIGEST,
          "\n  Current  :", cmaDigest,
          "\n  Near-duplicate check will proceed with current bytes.",
        );
      }
      const cmaNorm = await normaliseContent(
        cmaFetch.source.rawBytes,
        "application/pdf",
        cmaDigest,
        extractPdfText,
      );
      if (cmaNorm.ok) texts.push(cmaNorm.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-005 — Controlled Corpus Admission for DRA-DOC-0010",
  () => {
    it(
      "admits DRA-DOC-0010 (NIST AI RMF 1.0) through eligibility, " +
        "freeze, and corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-005 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Setup ─────────────────────────────────────────────────────────

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-005",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY",
            "REWRITE",
            "REPORT",
            "EMAIL",
            "POLICY",
            "PROCEDURE",
            "ARTICLE",
            "OTHER",
          ],
        });

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
        });

        // ── Step 1: Acquisition request ────────────────────────────────────

        console.log("── Step 1: Acquisition Request (DRA-ACQ-000012) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000012",
          sourceUrl: NIST_PDF_URL,
          requestedBy: "DRA-ACQ-005-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology (NIST)",
          expectedTitle:
            "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);
        console.log("  requestedBy   :", request.requestedBy);
        console.log("  NOTE: nvlpubs.nist.gov returns 404 for HEAD; 200 for GET.");

        // ── Step 2: Fetch NIST AI RMF PDF ─────────────────────────────────

        console.log("\n── Step 2: Fetch NIST AI RMF PDF (live network) ────────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("NIST fetch FAILED:", fetchResult.code, fetchResult.message);
        }
        expect(fetchResult.ok).toBe(true);
        if (!fetchResult.ok) return;

        const source = fetchResult.source;

        console.log("  finalUrl        :", source.finalUrl);
        console.log("  mediaType       :", source.mediaType);
        console.log("  httpStatus      :", source.httpStatus);
        console.log("  rawByteLength   :", source.rawBytes.length);
        console.log("  retrievedAt     :", source.retrievedAt);
        if (source.httpResponseHeaders) {
          const h = source.httpResponseHeaders;
          if (h.contentType) console.log("  content-type    :", h.contentType);
          if (h.lastModified) console.log("  last-modified   :", h.lastModified);
          if (h.contentLength) console.log("  content-length  :", h.contentLength);
          if (h.etag) console.log("  etag            :", h.etag);
        }

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");
        expect(source.rawBytes.length).toBeGreaterThan(100_000);

        // ── Step 3: Source digest verification ─────────────────────────────

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log("\n── Step 3: Source Digest Verification ──────────────────────");
        console.log("  reference digest :", REFERENCE_SOURCE_DIGEST);
        console.log("  current digest   :", sourceDigest);
        console.log("  reference bytes  :", REFERENCE_BYTE_LENGTH);
        console.log("  current bytes    :", source.rawBytes.length);

        if (sourceDigest !== REFERENCE_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_SOURCE_DIGEST,
            sourceDigest,
            REFERENCE_BYTE_LENGTH,
            source.rawBytes.length,
            "NIST AI RMF PDF source digest",
          );
          console.error("\n  !! SOURCE DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          expect(sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
          return;
        }

        console.log("  ✓ Source digest MATCHES reference");
        expect(sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);

        // ── Step 4: Normalise PDF ──────────────────────────────────────────

        console.log("\n── Step 4: Normalise PDF (pdftotext extractor) ─────────────");

        const normResult = await normaliseContent(
          source.rawBytes,
          "application/pdf",
          sourceDigest,
          extractPdfText,
        );

        if (!normResult.ok) {
          console.error("Normalisation FAILED:", normResult.code, normResult.message);
        }
        expect(normResult.ok).toBe(true);
        if (!normResult.ok) return;

        const normalised = normResult.document;
        const wordCount = normalised.text.split(/\s+/).filter(Boolean).length;

        console.log("  normalisationVersion :", normalised.normalisationVersion);
        console.log("  encoding             :", normalised.encoding);
        console.log("  textLength (chars)   :", normalised.text.length);
        console.log("  wordCount            :", wordCount);
        console.log("  textDigest           :", normalised.textDigest);
        console.log(
          "  warnings             :",
          normalised.warnings.length === 0 ? "none" : normalised.warnings.join("; "),
        );

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.text.trim().length).toBeGreaterThan(0);

        // ── Step 5: Text digest verification ──────────────────────────────

        console.log("\n── Step 5: Text Digest Verification ────────────────────────");
        console.log("  reference text digest :", REFERENCE_TEXT_DIGEST);
        console.log("  current text digest   :", normalised.textDigest);

        if (normalised.textDigest !== REFERENCE_TEXT_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_TEXT_DIGEST,
            normalised.textDigest,
            122238,
            normalised.text.length,
            "NIST AI RMF normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          expect(normalised.textDigest).toBe(REFERENCE_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REFERENCE_TEXT_DIGEST);

        // ── Step 6: Build existing corpus texts (incl. DRA-DOC-0009) ────

        console.log("\n── Step 6: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  NOTE: DRA-DOC-0009 admitted immediately prior in this batch session.");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        expect(existingCorpusTexts.length).toBe(9);

        // ── Step 7: Freeze eligibility (13/13 must pass) ──────────────────

        console.log("\n── Step 7: Freeze Eligibility (13 checks) ──────────────────");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0010",
          INCLUSION_RATIONALE,
          registry,
          protocol,
          existingCorpusTexts,
        );

        console.log("");
        for (const check of eligibility.checks) {
          const icon = check.passed ? "✓" : "✗";
          const status = check.passed ? "PASS" : "FAIL";
          console.log(`  ${icon} [${status}] ${check.checkId}`);
          if (check.detail) console.log(`        detail: ${check.detail}`);
        }

        if (!eligibility.eligible) {
          console.error("\n  ELIGIBILITY FAILED — blocking reasons:");
          for (const reason of (eligibility as { blockingReasons: readonly string[] }).blockingReasons) {
            console.error("    •", reason);
          }
          expect(eligibility.eligible).toBe(true);
          return;
        }

        console.log("\n  All 13 checks PASSED ✓");
        console.log(
          "  passed:",
          eligibility.checks.filter((c) => c.passed).length,
          "/ 13",
        );

        expect(eligibility.eligible).toBe(true);
        expect(eligibility.checks.filter((c) => c.passed).length).toBe(13);

        // ── Step 8: Compute metadata digest ───────────────────────────────

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);

        console.log("\n── Step 8: Metadata Digest ─────────────────────────────────");
        console.log("  metadataDigest:", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 9: Create freeze record (DRA-FRZ-000004) ──────────────────

        console.log(
          "\n── Step 9: Create Freeze Record (DRA-FRZ-000004) ──────────",
        );

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000004",
          corpusDocumentId: "DRA-DOC-0010",
          acquisitionId: request.acquisitionId,
          sourceUrl: request.sourceUrl,
          finalUrl: source.finalUrl,
          sourceDigest,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-005-freeze-operator",
          benchmarkVersion: "DRA-CORPUS-1.0.0",
          fixedTimestamp: FREEZE_TIMESTAMP,
        });

        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  frozenAt             :", freezeRecord.frozenAt);
        console.log("  frozenBy             :", freezeRecord.frozenBy);
        console.log("  benchmarkVersion     :", freezeRecord.benchmarkVersion);
        console.log("  normalisationVersion :", freezeRecord.normalisationVersion);

        // ── Step 10: Verify freeze record integrity ─────────────────────────

        console.log("\n── Step 10: Freeze Record Integrity ────────────────────────");

        const freezeRecordValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);

        console.log(
          "  verifyAcquisitionFreezeRecordDigest:",
          freezeRecordValid ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  sourceDigest matches reference     :",
          freezeRecord.sourceDigest === REFERENCE_SOURCE_DIGEST ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  textDigest matches reference       :",
          freezeRecord.normalisedTextDigest === REFERENCE_TEXT_DIGEST ? "PASS ✓" : "FAIL ✗",
        );

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000004");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0010");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-005-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe("DRA-CORPUS-1.0.0");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 11: Corpus integration — register DRA-DOC-0010 ───────────

        console.log(
          "\n── Step 11: Corpus Integration (register DRA-DOC-0010) ────",
        );

        const integrationResult = integrateWithCorpus(
          freezeRecord,
          APPROVED_METADATA,
          registry,
        );

        if (!integrationResult.ok) {
          console.error(
            "Corpus integration FAILED:",
            integrationResult.code,
            integrationResult.message,
          );
          expect(integrationResult.ok).toBe(true);
          return;
        }

        const { manifest, manifestDigest } = integrationResult;

        console.log("  schemaVersion  :", manifest.schemaVersion);
        console.log("  corpusVersion  :", manifest.corpusVersion);
        console.log("  documentCount  :", manifest.documentCount);
        console.log("  overallDigest  :", manifest.overallDigest);
        console.log("  manifestDigest :", manifestDigest);

        expect(integrationResult.ok).toBe(true);
        expect(manifest.documentCount).toBe(1);
        expect(manifest.overallDigest).toBeTruthy();
        expect(manifestDigest).toBe(manifest.overallDigest);

        // ── Step 12: Registry and manifest integrity verification ──────────

        console.log(
          "\n── Step 12: Registry and Manifest Integrity Verification ───",
        );

        const registryHasDoc = registry.hasId("DRA-DOC-0010");
        const manifestIntact = verifyManifestIntegrity(manifest);
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        console.log(
          "  DRA-DOC-0010 in registry        :",
          registryHasDoc ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest integrity (hash check) :",
          manifestIntact ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest digest round-trips     :",
          manifestRoundTrip ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  append-only (count = 1)         :",
          manifest.documentCount === 1 ? "PASS ✓" : "FAIL ✗",
        );

        expect(registryHasDoc).toBe(true);
        expect(manifestIntact).toBe(true);
        expect(manifestRoundTrip).toBe(true);
        expect(manifest.documentCount).toBe(1);

        // ── Step 13: Near-duplicate result (incl. DRA-DOC-0009) ───────────

        console.log("\n── Step 13: Near-Duplicate and Corpus-ID Results ───────────");

        const nearDupCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_NEAR_DUPLICATE",
        );
        const dupIdCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_DUPLICATE_CORPUS_ID",
        );

        console.log(
          "  NO_NEAR_DUPLICATE    :",
          nearDupCheck?.passed ? "PASS ✓" : "FAIL ✗",
          nearDupCheck?.detail ?? "",
        );
        console.log(
          "  NO_DUPLICATE_CORPUS_ID:",
          dupIdCheck?.passed ? "PASS ✓" : "FAIL ✗",
          dupIdCheck?.detail ?? "",
        );
        console.log(
          "  Near-duplicate scope : 9 texts (DRA-DOC-0001 through DRA-DOC-0009)",
        );

        expect(nearDupCheck?.passed).toBe(true);
        expect(dupIdCheck?.passed).toBe(true);

        // ── Admission summary ──────────────────────────────────────────────

        console.log("\n── Admission Summary ───────────────────────────────────────");
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  title                :", APPROVED_METADATA.title);
        console.log("  publisher            :", APPROVED_METADATA.publisher);
        console.log("  publicationDate      :", APPROVED_METADATA.publicationDate);
        console.log("  domain               :", APPROVED_METADATA.domain);
        console.log("  documentType         :", APPROVED_METADATA.documentType);
        console.log("  difficulty           :", APPROVED_METADATA.difficulty);
        console.log("  language             :", APPROVED_METADATA.language);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  frozenAt             :", freezeRecord.frozenAt);
        console.log("  benchmarkVersion     :", freezeRecord.benchmarkVersion);
        console.log("  manifestDigest       :", manifestDigest);
        console.log("  ─── Eligibility ───");
        console.log("  total checks   : 13");
        console.log(
          "  passed         :",
          eligibility.checks.filter((c) => c.passed).length,
        );
        console.log(
          "  failed         :",
          eligibility.checks.filter((c) => !c.passed).length,
        );
        console.log("  ─── Governance ───");
        console.log("  officialSourceStatus :", OFFICIAL_SOURCE_ASSESSMENT.status);
        console.log("  licenceStatus        :", LICENCE_ASSESSMENT.status);
        console.log("  licenceBasis         :", LICENCE_ASSESSMENT.licenceBasis);
        console.log("  licenceName          :", LICENCE_ASSESSMENT.licenceName);
        console.log("  ─── Near-Duplicate ───");
        console.log("  scope          : DRA-DOC-0001 through DRA-DOC-0009 (9 documents)");
        console.log("  result         : NO_NEAR_DUPLICATE — PASS ✓");

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0009: NOT MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-005 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0010 ADMITTED AND FROZEN (DRA-FRZ-000004)        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      480_000, // 8-minute timeout (NIST + CMA + Acas live fetches + pdftotext)
    );
  },
);
