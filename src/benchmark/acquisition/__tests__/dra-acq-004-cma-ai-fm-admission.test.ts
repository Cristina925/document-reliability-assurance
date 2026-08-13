/**
 * DRA-ACQ-004 — Controlled Corpus Admission for DRA-DOC-0009
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-004                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-004 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions have been received and both assessments      ║
 * ║  upgraded to VERIFIED per the batch human-review sign-off on 2026-08-06. ║
 * ║                                                                          ║
 * ║  Document:   AI Foundation Models: Short Version                         ║
 * ║  Corpus ID:  DRA-DOC-0009                                                ║
 * ║  Freeze ID:  DRA-FRZ-000003                                              ║
 * ║  Publisher:  Competition and Markets Authority (CMA)                     ║
 * ║  Source:     application/pdf (pdftotext, no new npm packages)            ║
 * ║  Acquisition ID: DRA-ACQ-000008                                          ║
 * ║                                                                          ║
 * ║  Asset URL:                                                              ║
 * ║    https://assets.publishing.service.gov.uk/media/                       ║
 * ║    65081d2c4cd3c3000d68cb6d/Short_version_.pdf                           ║
 * ║                                                                          ║
 * ║  Evidence source (not frozen):                                           ║
 * ║    AI Foundation Models: Initial Report (DRA-ACQ-000009)                 ║
 * ║    https://assets.publishing.service.gov.uk/media/                       ║
 * ║    65081d3aa41cc300145612c0/Full_report_.pdf                             ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch → verify digests → freeze eligibility → freeze record →         ║
 * ║    corpus integration → manifest integrity verification                  ║
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
 * The software does NOT auto-approve either assessment — the VERIFIED status
 * values below reflect explicit human sign-off on official source provenance
 * and licence suitability.
 *
 * Reference digests (from DRA-ACQ-004 preparation run 2026-08-04):
 *   Short Version source digest: e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f
 *   Short Version text digest:   dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed
 *   Short Version byte length:   999,699
 *   Short Version text chars:    89,713
 *
 * This test makes live HTTPS requests to assets.publishing.service.gov.uk
 * and acas.org.uk. Allow 5 minutes.
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
const REVIEW_TIMESTAMP = "2026-08-06T10:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T10:30:00.000Z";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-004 preparation run (2026-08-04)
//
// A mismatch stops before admission with a change classification.
// ---------------------------------------------------------------------------

const REFERENCE_SHORT_SOURCE_DIGEST =
  "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f";

const REFERENCE_SHORT_TEXT_DIGEST =
  "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed";

const REFERENCE_SHORT_BYTE_LENGTH = 999699;

const REFERENCE_FULL_SOURCE_DIGEST =
  "8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af";

const REFERENCE_FULL_BYTE_LENGTH = 2514017;

// ---------------------------------------------------------------------------
// Asset URLs
// ---------------------------------------------------------------------------

const SHORT_VERSION_URL =
  "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";

const FULL_REPORT_URL =
  "https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf";

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-004-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Human review basis (DRA-ACQ-004 batch sign-off, 2026-08-06):
//   The Short Version and supporting Initial Report are official CMA
//   publications distributed through the official GOV.UK publication record
//   and assets.publishing.service.gov.uk.
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-004-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Canonical landing page: https://www.gov.uk/government/publications/ai-foundation-models-initial-report",
    "Landing page GOV.UK Content API: title 'AI Foundation Models: Initial report', first_published_at: 2023-09-18",
    "Publisher listed on GOV.UK landing page: Competition and Markets Authority",
    `Short Version asset URL resolved from official GOV.UK landing page: ${SHORT_VERSION_URL}`,
    "Short Version HTTP status: 200 OK; content-type: application/pdf",
    "Short Version last-modified: Mon, 18 Sep 2023 09:49:32 GMT",
    `Short Version content-length: ${REFERENCE_SHORT_BYTE_LENGTH} bytes`,
    "Short Version internal heading: 'AI Foundation Models: Short Version', '18 September 2023'",
    `Full Report asset URL resolved from official GOV.UK landing page: ${FULL_REPORT_URL}`,
    "Full Report HTTP status: 200 OK; content-type: application/pdf",
    "Full Report last-modified: Mon, 18 Sep 2023 09:49:46 GMT",
    `Full Report content-length: ${REFERENCE_FULL_BYTE_LENGTH} bytes`,
    "Full Report internal heading: 'AI Foundation Models: Initial Report', '18 September 2023'",
    "Both PDFs served from assets.publishing.service.gov.uk (official GOV.UK CDN)",
    "CMA is a non-ministerial government department of the United Kingdom",
    "Short Version source digest recorded: e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f",
    "Short Version text digest recorded: dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed",
  ],
  notes:
    "DRA-ACQ-004 Human Governance Decision 1 — official source VERIFIED. " +
    "Human review sign-off received on 2026-08-06 (batch review with DRA-ACQ-005). " +
    "Both Short Version and Initial Report are official CMA publications via GOV.UK. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Human review basis (DRA-ACQ-004 batch sign-off, 2026-08-06):
//   The publication is Crown copyright material distributed under the
//   applicable GOV.UK/Open Government Licence terms, subject to any
//   exclusions stated in the publication.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Open Government Licence v3.0",
  licenceUrl:
    "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-004-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Full Report PDF p.2 states: '© Crown copyright 2022'",
    "Full Report PDF p.2 states: 'You may reuse this information (not including logos) free of charge in any format or medium, under the terms of the Open Government Licence.'",
    "Full Report PDF OGL URL: 'www.nationalarchives.gov.uk/doc/open-government-licence/' (resolves to v3)",
    "Short Version published on the same GOV.UK landing page under same publisher",
    "GOV.UK standard terms (www.gov.uk/help/terms-conditions): 'All content is available under the Open Government Licence v3.0, except where otherwise stated'",
    "CMA is a non-ministerial government department; publications default to Crown copyright + OGL v3",
    "OGL v3 permits commercial and non-commercial reuse with attribution; no share-alike requirement",
    "Exclusions recorded: logos and any separately credited third-party material are excluded from reusable scope",
    "Evaluation scope is text only; no logos or third-party material in text extraction",
  ],
  notes:
    "DRA-ACQ-004 Human Governance Decision 2 — licence VERIFIED. " +
    "Human review sign-off received on 2026-08-06 (batch review with DRA-ACQ-005). " +
    "Crown copyright + OGL v3 confirmed for both Short Version and Full Report. " +
    "Exclusions: logos and any third-party copyright material identified in the publication. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "AI Foundation Models: Short Version",
  publisher: "Competition and Markets Authority",
  publicationDate: "2023-09-18",
  domain: "GENERAL" as const,
  documentType: "SUMMARY" as const,
  difficulty: "MEDIUM" as const,
  language: "en-GB",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First SUMMARY-type corpus entry: zero SUMMARY documents in DRA-DOC-0001–0008. " +
  "Adds the Competition and Markets Authority as a new institution not represented in the corpus. " +
  "GENERAL domain: AI and digital markets competition policy; topically distinct from all existing entries. " +
  "MEDIUM difficulty: regulatory/policy analysis language accessible to informed readers " +
  "without specialist AI or legal prerequisites. " +
  "HUMAN_AUTHORED source type: official CMA-authored publication. " +
  "Genuine summary-vs-source relationship: the Short Version (12,628 words, 37 pages) is a substantive " +
  "condensed narrative of the Initial Report (49,446 words); published simultaneously on 18 Sep 2023. " +
  "Naturally exercises claim support, evidence adequacy, and traceability analysis. " +
  "No self-evaluation risk: CMA AI Foundation Models review examined AI market competition. " +
  "No predetermined issue class.";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText fields)
// DRA-DOC-0007:      normalised from APACHE_HTTPD_AUTH_HTML fixture
// DRA-DOC-0008:      re-fetched from acas.org.uk (live network)
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
    requestedBy: "DRA-ACQ-004-admission-corpus-check",
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

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-004 — Controlled Corpus Admission for DRA-DOC-0009",
  () => {
    it(
      "admits DRA-DOC-0009 (CMA AI Foundation Models: Short Version) through eligibility, " +
        "freeze, and corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-004 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Setup ─────────────────────────────────────────────────────────

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-004",
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

        console.log("── Step 1: Acquisition Request (DRA-ACQ-000008) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000008",
          sourceUrl: SHORT_VERSION_URL,
          requestedBy: "DRA-ACQ-004-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Competition and Markets Authority",
          expectedTitle: "AI Foundation Models: Short Version",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);
        console.log("  requestedBy   :", request.requestedBy);

        // ── Step 2: Fetch CMA Short Version PDF ────────────────────────────

        console.log("\n── Step 2: Fetch Short Version PDF (live network) ──────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("Short Version fetch FAILED:", fetchResult.code, fetchResult.message);
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
        console.log("  reference digest :", REFERENCE_SHORT_SOURCE_DIGEST);
        console.log("  current digest   :", sourceDigest);
        console.log("  reference bytes  :", REFERENCE_SHORT_BYTE_LENGTH);
        console.log("  current bytes    :", source.rawBytes.length);

        if (sourceDigest !== REFERENCE_SHORT_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_SHORT_SOURCE_DIGEST,
            sourceDigest,
            REFERENCE_SHORT_BYTE_LENGTH,
            source.rawBytes.length,
            "Short Version PDF source digest",
          );
          console.error("\n  !! SOURCE DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          expect(sourceDigest).toBe(REFERENCE_SHORT_SOURCE_DIGEST);
          return;
        }

        console.log("  ✓ Source digest MATCHES reference");
        expect(sourceDigest).toBe(REFERENCE_SHORT_SOURCE_DIGEST);

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
        console.log("  reference text digest :", REFERENCE_SHORT_TEXT_DIGEST);
        console.log("  current text digest   :", normalised.textDigest);

        if (normalised.textDigest !== REFERENCE_SHORT_TEXT_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_SHORT_TEXT_DIGEST,
            normalised.textDigest,
            89713,
            normalised.text.length,
            "Short Version normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          expect(normalised.textDigest).toBe(REFERENCE_SHORT_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REFERENCE_SHORT_TEXT_DIGEST);

        // ── Step 6: Evidence source verification (not frozen) ──────────────

        console.log(
          "\n── Step 6: Verify Evidence Source — Full Report (not frozen) ─",
        );

        const fullReportReq = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000009",
          sourceUrl: FULL_REPORT_URL,
          requestedBy: "DRA-ACQ-004-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Competition and Markets Authority",
          expectedTitle: "AI Foundation Models: Initial Report",
        });

        if (fullReportReq.ok) {
          const fullFetch = await fetcher(fullReportReq.request, {});
          if (fullFetch.ok) {
            const fullDigest = computeSourceDigest(fullFetch.source.rawBytes);
            console.log("  Full Report finalUrl   :", fullFetch.source.finalUrl);
            console.log("  Full Report httpStatus :", fullFetch.source.httpStatus);
            console.log("  Full Report bytes      :", fullFetch.source.rawBytes.length);
            console.log("  Full Report sourceDigest:", fullDigest);
            console.log(
              "  Full Report digest match:",
              fullDigest === REFERENCE_FULL_SOURCE_DIGEST ? "✓ MATCHES reference" : "⚠ differs from reference",
            );
            if (fullDigest !== REFERENCE_FULL_SOURCE_DIGEST) {
              console.warn(
                "  WARNING: Full Report source digest differs from preparation reference.",
                "\n  Reference:", REFERENCE_FULL_SOURCE_DIGEST,
                "\n  Current  :", fullDigest,
                "\n  Full Report is evidence source only (not frozen); difference recorded for review.",
              );
            }
          } else {
            console.warn(
              "  WARNING: Full Report fetch failed:", fullFetch.code,
              "\n  Full Report is evidence source only — admission continues.",
            );
          }
        }

        // ── Step 7: Build existing corpus texts ────────────────────────────

        console.log("\n── Step 7: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        expect(existingCorpusTexts.length).toBe(8);

        // ── Step 8: Freeze eligibility (13/13 must pass) ───────────────────

        console.log("\n── Step 8: Freeze Eligibility (13 checks) ──────────────────");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0009",
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

        // ── Step 9: Compute metadata digest ───────────────────────────────

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);

        console.log("\n── Step 9: Metadata Digest ─────────────────────────────────");
        console.log("  metadataDigest:", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 10: Create freeze record (DRA-FRZ-000003) ─────────────────

        console.log(
          "\n── Step 10: Create Freeze Record (DRA-FRZ-000003) ─────────",
        );

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000003",
          corpusDocumentId: "DRA-DOC-0009",
          acquisitionId: request.acquisitionId,
          sourceUrl: request.sourceUrl,
          finalUrl: source.finalUrl,
          sourceDigest,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-004-freeze-operator",
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

        // ── Step 11: Verify freeze record integrity ────────────────────────

        console.log("\n── Step 11: Freeze Record Integrity ────────────────────────");

        const freezeRecordValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);

        console.log(
          "  verifyAcquisitionFreezeRecordDigest:",
          freezeRecordValid ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  sourceDigest matches reference     :",
          freezeRecord.sourceDigest === REFERENCE_SHORT_SOURCE_DIGEST ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  textDigest matches reference       :",
          freezeRecord.normalisedTextDigest === REFERENCE_SHORT_TEXT_DIGEST ? "PASS ✓" : "FAIL ✗",
        );

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000003");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0009");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-004-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe("DRA-CORPUS-1.0.0");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_SHORT_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_SHORT_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 12: Corpus integration — register DRA-DOC-0009 ───────────

        console.log(
          "\n── Step 12: Corpus Integration (register DRA-DOC-0009) ────",
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

        // ── Step 13: Registry and manifest integrity verification ──────────

        console.log(
          "\n── Step 13: Registry and Manifest Integrity Verification ───",
        );

        const registryHasDoc = registry.hasId("DRA-DOC-0009");
        const manifestIntact = verifyManifestIntegrity(manifest);
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        console.log(
          "  DRA-DOC-0009 in registry        :",
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

        // ── Step 14: Near-duplicate result ────────────────────────────────

        console.log("\n── Step 14: Near-Duplicate and Corpus-ID Results ───────────");

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

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0008: NOT MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-004 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0009 ADMITTED AND FROZEN (DRA-FRZ-000003)        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      300_000, // 5-minute timeout for live network calls
    );
  },
);
