/**
 * DRA-ACQ-002 — Controlled Corpus Admission for DRA-DOC-0008
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-002                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-002 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions have been received and both assessments      ║
 * ║  upgraded to VERIFIED per the human-review sign-off on 2026-08-04.       ║
 * ║                                                                          ║
 * ║  Document:  Discipline and grievances at work: the Acas guide            ║
 * ║  Corpus ID: DRA-DOC-0008                                                 ║
 * ║  Freeze ID: DRA-FRZ-000002                                               ║
 * ║  Publisher: Advisory, Conciliation and Arbitration Service (Acas)        ║
 * ║  Source:    application/pdf (pdftotext, no new npm packages)             ║
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
 * ║  Digest verification:                                                    ║
 * ║    Reference source digest: a4c10388…ef300 (prep run 2026-08-04)        ║
 * ║    Reference text digest:   3b8f3472…83a0  (prep run 2026-08-04)        ║
 * ║    If reacquisition produces different bytes the test reports the        ║
 * ║    difference, classifies the change type, and stops before admission.   ║
 * ║                                                                          ║
 * ║  Expected eligibility result:                                            ║
 * ║    All 13 of 13 freeze-eligibility checks must pass.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified in the
 * DRA-ACQ-002 human-review sign-off. The software does NOT auto-approve
 * either assessment — the VERIFIED status values below reflect explicit
 * human sign-off on official source provenance and licence suitability.
 *
 * This test makes live HTTPS requests to acas.org.uk. Allow 3 minutes.
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

/** Governance review timestamp (human sign-off received). */
const REVIEW_TIMESTAMP = "2026-08-04T14:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-04T14:30:00.000Z";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-002 preparation run (2026-08-04)
//
// These are the canonical digests recorded during the preparation phase.
// Reacquisition must produce identical values.  If either value differs the
// test reports the difference, classifies the change type, and stops before
// admission.
// ---------------------------------------------------------------------------

const REFERENCE_GUIDE_SOURCE_DIGEST =
  "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300";

const REFERENCE_GUIDE_TEXT_DIGEST =
  "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0";

const REFERENCE_CODE_SOURCE_DIGEST =
  "ac3df85ab5573a41da3de291a07f07e8a02840bc76a63c55c7944f23de0b9143";

const REFERENCE_CODE_TEXT_DIGEST =
  "c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40";

// ---------------------------------------------------------------------------
// pdftotext extractor
//
// Uses pdftotext (Poppler, already installed as a Nix system package).
// Injected via the PdfExtractor hook; no new npm packages required.
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acas-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Human Governance Decision 1 — Official Source Assessment
//
// Status: VERIFIED
//
// Human review basis (DRA-ACQ-002 sign-off, 2026-08-04):
//   • The guide was acquired from the official acas.org.uk domain.
//   • The guide PDF is linked from the official ACAS guide landing page.
//   • The Code was acquired from the official ACAS HTML publication.
//   • Both acquisitions returned successful HTTP responses.
//   • Raw-source and normalised-text digests were recorded.
//   • The publisher is Advisory, Conciliation and Arbitration Service (Acas).
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-002-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Guide PDF URL: https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    "Guide PDF HTTP status: 200 OK; content-type: application/pdf",
    "Guide landing page URL: https://www.acas.org.uk/acas-guide-to-discipline-and-grievances-at-work",
    "Landing page HTTP status: 200 OK; content-type: text/html; content-language: en",
    "Landing page states: \"Published July 2020\" (exact text from <p> element)",
    "Landing page internal document title: \"Discipline and grievances at work: the Acas guide\"",
    "Domain acas.org.uk confirmed as the official domain of the Advisory, Conciliation and Arbitration Service",
    "Code of Practice HTML URL: https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html",
    "Code HTML HTTP status: 200 OK; content-type: text/html",
    "Both documents downloaded directly from acas.org.uk; no evidence of third-party mirroring",
    "PDF file-path date 2024-08 is a file hosting indicator only; publication date is July 2020",
    "Raw-source digest recorded: a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300",
    "Normalised-text digest recorded: 3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0",
  ],
  notes:
    "DRA-ACQ-002 Human Governance Decision 1 — official source VERIFIED. " +
    "Human review sign-off received on 2026-08-04. " +
    "Evidence basis: ACAS guide acquired from official acas.org.uk domain; " +
    "Code of Practice acquired from official ACAS HTML publication. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED WITH RECORDED EXCLUSIONS
//
// Human review basis (DRA-ACQ-002 sign-off, 2026-08-04):
//   • ACAS copyright evidence identifies Crown copyright and OGL v3.0 reuse terms.
//   • Licence record preserves exact evidence URL and attribution requirements.
//   • ACAS logos, trademarks and any identified third-party content are excluded.
//   • Selected textual evaluation boundary confirmed to contain no excluded
//     third-party content.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Open Government Licence v3.0",
  licenceUrl:
    "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-002-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Copyright page: https://www.acas.org.uk/copyright (HTTP 200 OK)",
    "Copyright page states: \"© Crown copyright 2022\"",
    "Copyright page states: \"This website is licensed under the Open Government Licence except where otherwise stated.\"",
    "OGL v3.0 URL: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    "Copyright page last reviewed: 21 September 2022",
    "Copyright page: Crown copyright material may be reproduced for research, private study or internal circulation",
    "OGL confirmed to cover the guide PDF document (not only website HTML pages)",
    "Selected evaluation boundary sections (guide pages 18–25; Code paras 9–17) confirmed to contain no third-party copyright content",
    "No ACAS logos, trademarks or third-party material in selected evaluation boundary",
    "Exclusions recorded: ACAS logos, trademarks, and any third-party copyright material identified on the site are excluded",
    "Attribution requirement: source must be identified and copyright status acknowledged on republication",
  ],
  notes:
    "DRA-ACQ-002 Human Governance Decision 2 — licence VERIFIED WITH RECORDED EXCLUSIONS. " +
    "Human review sign-off received on 2026-08-04. " +
    "OGL v3.0 applies to the guide PDF. " +
    "Exclusions: ACAS logos, trademarks and any identified third-party content. " +
    "Selected evaluation boundary confirmed to contain only Crown-copyright text covered by OGL. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
//
// Title corrected per human sign-off:
//   "Discipline and grievances at work: the Acas guide"
//   (internal document title from the guide PDF and landing page;
//    the landing page HTML <title> "Acas guide to discipline and grievances
//    at work" is a navigation label and was not used as the approved title)
//
// Language: en-GB (BCP-47; the corpus schema accepts this tag)
//
// Authority description per human sign-off:
//   "Acas Code of Practice on disciplinary and grievance procedures
//    — Acas Code of Practice 1."
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Discipline and grievances at work: the Acas guide",
  publisher: "Advisory, Conciliation and Arbitration Service (Acas)",
  publicationDate: "2020-07",
  domain: "BUSINESS" as const,
  documentType: "PROCEDURE" as const,
  difficulty: "LOW" as const,
  language: "en-GB",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First PROCEDURE-type corpus entry: zero PROCEDURE documents currently in " +
  "the corpus. Addresses LOW difficulty underrepresentation: second LOW " +
  "document after DRA-DOC-0006. Introduces ACAS as a new official publisher " +
  "not previously represented in the corpus. Distinct evaluation form: the " +
  "practical guide (generatedText) elaborates on the formal Acas Code of " +
  "Practice 1 on disciplinary and grievance procedures (sourceText); both are " +
  "separately published official documents. BUSINESS domain; HUMAN_AUTHORED " +
  "source type; OPEN_LICENCE basis (OGL v3). Topic (employment discipline and " +
  "grievance procedure) does not overlap with any existing corpus document " +
  "(safety audit, DPIA, vendor risk, clinical validation, financial controls, " +
  "security policy, Apache HTTP authentication).";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001 to 0006: from corpus-data.ts (generatedText)
// DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  for (const entry of BENCHMARK_CORPUS) {
    const bytes = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  const apacheBytes = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Digest change classifier
//
// Classifies the likely cause of a digest mismatch between the preparation
// run and a reacquisition.
// ---------------------------------------------------------------------------

function classifyDigestChange(
  referenceDigest: string,
  currentDigest: string,
  referenceBytes: number,
  currentBytes: number,
  label: string,
): string {
  if (referenceDigest === currentDigest) return "UNCHANGED";
  if (referenceBytes !== currentBytes) {
    return `SOURCE_CHANGE_DETECTED — ${label}: byte count changed from ${referenceBytes} to ${currentBytes}. Possible causes: document revision or server-side transformation. Stop before admission.`;
  }
  return (
    `EXTRACTION_OR_ENCODING_NONDETERMINISM — ${label}: byte counts match (${currentBytes}) ` +
    `but digest differs. Possible causes: extraction nondeterminism or hash encoding difference. Stop before admission.`
  );
}

// ---------------------------------------------------------------------------
// Operational admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-002 — Controlled Corpus Admission for DRA-DOC-0008",
  () => {
    it(
      "admits DRA-DOC-0008 through eligibility, freeze, and corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-002 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Setup: registry and APPROVED protocol ──────────────────────────

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-002",
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
          timeoutMs: 90_000,
          maxRedirects: 5,
          maxBytes: 10_000_000,
          userAgent: "DRA-ENG-010/1.0",
        });

        // ── Step 1: Acquisition request ────────────────────────────────────

        const guideUrl =
          "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000002",
          sourceUrl: guideUrl,
          requestedBy: "DRA-ACQ-002-acquisition-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher:
            "Advisory, Conciliation and Arbitration Service (Acas)",
          expectedTitle:
            "Discipline and grievances at work: the Acas guide",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("── Step 1: Acquisition Request ─────────────────────────────");
        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);
        console.log("  requestedBy   :", request.requestedBy);
        console.log("  requestedAt   :", request.requestedAt);

        // ── Step 2: Fetch ACAS guide PDF (live network) ────────────────────

        console.log("\n── Step 2: Fetch ACAS Guide PDF (live network) ─────────────");

        const guideFetchResult = await fetcher(request, {});

        if (!guideFetchResult.ok) {
          console.error(
            "Guide fetch FAILED:",
            guideFetchResult.code,
            guideFetchResult.message,
          );
        }
        expect(guideFetchResult.ok).toBe(true);
        if (!guideFetchResult.ok) return;

        const guideSource = guideFetchResult.source;

        console.log("  finalUrl        :", guideSource.finalUrl);
        console.log("  mediaType       :", guideSource.mediaType);
        console.log("  httpStatus      :", guideSource.httpStatus);
        console.log("  rawByteLength   :", guideSource.rawBytes.length);
        console.log("  retrievedAt     :", guideSource.retrievedAt);
        if (guideSource.httpResponseHeaders) {
          const h = guideSource.httpResponseHeaders;
          if (h.contentType) console.log("  content-type    :", h.contentType);
          if (h.lastModified) console.log("  last-modified   :", h.lastModified);
          if (h.contentLength) console.log("  content-length  :", h.contentLength);
          if (h.etag) console.log("  etag            :", h.etag);
        }

        expect(guideSource.httpStatus).toBe(200);
        expect(guideSource.mediaType).toBe("application/pdf");
        expect(guideSource.rawBytes.length).toBeGreaterThan(100_000);

        // ── Step 3: Source digest — verify against reference ───────────────

        const guideSourceDigest = computeSourceDigest(guideSource.rawBytes);

        console.log("\n── Step 3: Source Digest Verification ──────────────────────");
        console.log("  reference digest :", REFERENCE_GUIDE_SOURCE_DIGEST);
        console.log("  current digest   :", guideSourceDigest);
        console.log("  reference bytes  : 932334");
        console.log("  current bytes    :", guideSource.rawBytes.length);

        if (guideSourceDigest !== REFERENCE_GUIDE_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_GUIDE_SOURCE_DIGEST,
            guideSourceDigest,
            932334,
            guideSource.rawBytes.length,
            "Guide PDF source digest",
          );
          console.error("\n  !! SOURCE DIGEST MISMATCH DETECTED !!");
          console.error("  Classification:", classification);
          console.error(
            "  Action: stop before admission — digest difference must be resolved.",
          );
          expect(guideSourceDigest).toBe(REFERENCE_GUIDE_SOURCE_DIGEST);
          return;
        }

        console.log("  ✓ Source digest MATCHES reference");
        expect(guideSourceDigest).toBe(REFERENCE_GUIDE_SOURCE_DIGEST);

        // ── Step 4: Normalise PDF (pdftotext extractor) ────────────────────

        console.log("\n── Step 4: Normalise PDF (pdftotext extractor) ─────────────");

        const normResult = await normaliseContent(
          guideSource.rawBytes,
          "application/pdf",
          guideSourceDigest,
          extractPdfText,
        );

        if (!normResult.ok) {
          console.error(
            "Normalisation FAILED:",
            normResult.code,
            normResult.message,
          );
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
          normalised.warnings.length === 0
            ? "none"
            : normalised.warnings.join("; "),
        );

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.text.trim().length).toBeGreaterThan(0);

        // ── Step 5: Text digest — verify against reference ─────────────────

        console.log("\n── Step 5: Text Digest Verification ────────────────────────");
        console.log("  reference text digest :", REFERENCE_GUIDE_TEXT_DIGEST);
        console.log("  current text digest   :", normalised.textDigest);

        if (normalised.textDigest !== REFERENCE_GUIDE_TEXT_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_GUIDE_TEXT_DIGEST,
            normalised.textDigest,
            164726,
            normalised.text.length,
            "Guide normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH DETECTED !!");
          console.error("  Classification:", classification);
          console.error(
            "  Action: stop before admission — digest difference must be resolved.",
          );
          expect(normalised.textDigest).toBe(REFERENCE_GUIDE_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REFERENCE_GUIDE_TEXT_DIGEST);

        // ── Step 6: Fetch Code of Practice HTML ────────────────────────────

        console.log(
          "\n── Step 6: Fetch and Verify Code of Practice HTML ──────────",
        );

        const codeUrl =
          "https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html";

        const codeRequestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000003",
          sourceUrl: codeUrl,
          requestedBy: "DRA-ACQ-002-acquisition-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher:
            "Advisory, Conciliation and Arbitration Service (Acas)",
          expectedTitle:
            "Acas Code of Practice on disciplinary and grievance procedures",
        });

        expect(codeRequestResult.ok).toBe(true);
        if (!codeRequestResult.ok) return;

        const codeFetchResult = await fetcher(codeRequestResult.request, {});

        if (!codeFetchResult.ok) {
          console.error(
            "Code fetch FAILED:",
            codeFetchResult.code,
            codeFetchResult.message,
          );
        }
        expect(codeFetchResult.ok).toBe(true);
        if (!codeFetchResult.ok) return;

        const codeSource = codeFetchResult.source;
        const codeSourceDigest = computeSourceDigest(codeSource.rawBytes);

        console.log("  finalUrl         :", codeSource.finalUrl);
        console.log("  mediaType        :", codeSource.mediaType);
        console.log("  httpStatus       :", codeSource.httpStatus);
        console.log("  rawByteLength    :", codeSource.rawBytes.length);
        console.log("  retrievedAt      :", codeSource.retrievedAt);
        console.log("  sourceDigest     :", codeSourceDigest);
        console.log("  reference digest :", REFERENCE_CODE_SOURCE_DIGEST);

        expect(codeSource.httpStatus).toBe(200);
        expect(codeSource.mediaType).toBe("text/html");

        if (codeSourceDigest !== REFERENCE_CODE_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REFERENCE_CODE_SOURCE_DIGEST,
            codeSourceDigest,
            86099,
            codeSource.rawBytes.length,
            "Code HTML source digest",
          );
          console.error("\n  !! CODE SOURCE DIGEST MISMATCH DETECTED !!");
          console.error("  Classification:", classification);
          console.error(
            "  Note: Code is source evidence only (not frozen as DRA-DOC-0008). " +
            "Digest difference recorded. Proceeding with current bytes for evaluation boundary; " +
            "human reviewer should confirm Code text content is unchanged.",
          );
          // Code digest mismatch is a warning not a hard stop (Code is not frozen),
          // but it is recorded and reported for the review record.
          console.warn("  WARNING: Code source digest differs from reference. Recorded for review.");
        } else {
          console.log("  ✓ Code source digest MATCHES reference");
        }

        const codeNormResult = await normaliseContent(
          codeSource.rawBytes,
          "text/html",
          codeSourceDigest,
        );

        expect(codeNormResult.ok).toBe(true);
        if (!codeNormResult.ok) return;

        const codeNormalised = codeNormResult.document;

        console.log("  textDigest       :", codeNormalised.textDigest);
        console.log("  reference text   :", REFERENCE_CODE_TEXT_DIGEST);
        console.log("  textLength       :", codeNormalised.text.length, "chars");

        if (codeNormalised.textDigest !== REFERENCE_CODE_TEXT_DIGEST) {
          console.warn("  WARNING: Code text digest differs from reference. Recorded for review.");
        } else {
          console.log("  ✓ Code text digest MATCHES reference");
        }

        // ── Step 7: Evaluation boundary preservation record ────────────────
        //
        // The normalised Code text is the source document that will be
        // supplied as additionalSourceText at evaluation time.  We verify
        // the text contains the expected boundary content (Code paragraphs
        // 9–17) before admitting the document.
        //
        // No sentences are truncated; no wording is edited; no annotations
        // are added.  The full normalised Code text will be supplied to the
        // evaluator — it includes paragraphs 9–17 in their entirety.
        // ---------------------------------------------------------------------------

        console.log(
          "\n── Step 7: Evaluation Boundary Preservation Record ─────────",
        );

        const codeText = codeNormalised.text;

        // Verify boundary paragraphs are present in the normalised Code text.
        const boundaryParagraphMarkers = [
          "Inform the employee",
          "right to be accompanied",
          "Hold a meeting",
          "companion",
        ];

        const missingMarkers: string[] = [];
        for (const marker of boundaryParagraphMarkers) {
          if (!codeText.toLowerCase().includes(marker.toLowerCase())) {
            missingMarkers.push(marker);
          }
        }

        if (missingMarkers.length > 0) {
          console.error(
            "  BOUNDARY CONTENT MISSING from normalised Code text:",
            missingMarkers.join(", "),
          );
          expect(missingMarkers).toHaveLength(0);
          return;
        }

        console.log("  Subject         : Disciplinary notification and meeting procedure");
        console.log("  Guide boundary  : \"Informing the employee\" through \"Allowing a worker to be");
        console.log("                    accompanied at the disciplinary meeting\" (pages 18–25)");
        console.log("  Source boundary : Code paragraphs 9–17 (notification → meeting → companion)");
        console.log("  Source document : full normalised Code text supplied as additionalSourceText");
        console.log("  Code text length:", codeText.length, "chars");
        console.log("  Code text digest:", codeNormalised.textDigest);
        console.log("  Boundary markers: all present ✓");
        console.log(
          "  NOTE: The guide-versus-Code structure may exercise evidence adequacy,",
        );
        console.log(
          "        traceability, unsupported-claim and scope analysis.",
        );
        console.log("        No issue class or assurance decision is predetermined.");

        // All boundary markers confirmed present.
        for (const marker of boundaryParagraphMarkers) {
          expect(codeText.toLowerCase()).toContain(marker.toLowerCase());
        }

        // ── Step 8: Build existing corpus texts ────────────────────────────

        console.log(
          "\n── Step 8: Build Existing Corpus Texts for Near-Duplicate Check ─",
        );

        const existingCorpusTexts = await buildExistingCorpusTexts();

        console.log(
          "  DRA-DOC-0001 through DRA-DOC-0006: from BENCHMARK_CORPUS",
        );
        console.log(
          "  DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture",
        );
        console.log("  Total existing corpus texts:", existingCorpusTexts.length);

        expect(existingCorpusTexts.length).toBe(7);

        // ── Step 9: Freeze eligibility (13/13 must pass) ───────────────────

        console.log("\n── Step 9: Freeze Eligibility (13 checks) ──────────────────");

        const eligibility = checkFreezeEligibility(
          guideSource,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0008",
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
          if (!eligibility.eligible) {
            for (const reason of eligibility.blockingReasons) {
              console.error("    •", reason);
            }
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
        expect(
          eligibility.checks.filter((c) => c.passed).length,
        ).toBe(13);

        // ── Step 10: Compute metadata digest ──────────────────────────────

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);

        console.log("\n── Step 10: Metadata Digest ────────────────────────────────");
        console.log("  metadataDigest:", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 11: Create freeze record (DRA-FRZ-000002) ─────────────────

        console.log(
          "\n── Step 11: Create Freeze Record (DRA-FRZ-000002) ──────────",
        );

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000002",
          corpusDocumentId: "DRA-DOC-0008",
          acquisitionId: request.acquisitionId,
          sourceUrl: request.sourceUrl,
          finalUrl: guideSource.finalUrl,
          sourceDigest: guideSourceDigest,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-002-freeze-operator",
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

        // ── Step 12: Verify freeze record integrity ─────────────────────────

        console.log("\n── Step 12: Freeze Record Integrity ────────────────────────");

        const freezeRecordValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);

        console.log("  verifyAcquisitionFreezeRecordDigest:", freezeRecordValid ? "PASS ✓" : "FAIL ✗");
        console.log("  sourceDigest matches reference     :", freezeRecord.sourceDigest === REFERENCE_GUIDE_SOURCE_DIGEST ? "PASS ✓" : "FAIL ✗");
        console.log("  textDigest matches reference       :", freezeRecord.normalisedTextDigest === REFERENCE_GUIDE_TEXT_DIGEST ? "PASS ✓" : "FAIL ✗");

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000002");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0008");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-002-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe("DRA-CORPUS-1.0.0");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_GUIDE_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_GUIDE_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 13: Corpus integration — register DRA-DOC-0008 ────────────

        console.log(
          "\n── Step 13: Corpus Integration (register DRA-DOC-0008) ─────",
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

        // ── Step 14: Corpus ID uniqueness and registry verification ─────────

        console.log(
          "\n── Step 14: Registry and Manifest Integrity Verification ───",
        );

        const registryHasDoc = registry.hasId("DRA-DOC-0008");
        const manifestIntact = verifyManifestIntegrity(manifest);
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        console.log(
          "  DRA-DOC-0008 in registry       :",
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

        // ── Step 15: Near-duplicate result ─────────────────────────────────

        console.log("\n── Step 15: Near-Duplicate Result ──────────────────────────");

        const nearDupCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_NEAR_DUPLICATE",
        );
        const dupIdCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_DUPLICATE_CORPUS_ID",
        );

        console.log(
          "  NO_NEAR_DUPLICATE   :",
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

        // ── Step 16: Source and text integrity summary ──────────────────────

        console.log(
          "\n── Step 16: Source and Text Integrity Summary ──────────────",
        );

        console.log(
          "  Guide source digest  :",
          guideSourceDigest,
          "✓ matches reference",
        );
        console.log(
          "  Guide text digest    :",
          normalised.textDigest,
          "✓ matches reference",
        );
        console.log(
          "  Code source digest   :",
          codeSourceDigest,
          codeSourceDigest === REFERENCE_CODE_SOURCE_DIGEST ? "✓ matches reference" : "⚠ differs from reference",
        );
        console.log(
          "  Code text digest     :",
          codeNormalised.textDigest,
          codeNormalised.textDigest === REFERENCE_CODE_TEXT_DIGEST ? "✓ matches reference" : "⚠ differs from reference",
        );

        // ── Step 17: Final admission summary ───────────────────────────────

        console.log(
          "\n── Admission Summary ───────────────────────────────────────",
        );
        console.log("  ─── DRA-DOC-0008 ───");
        console.log(
          "  corpusDocumentId     :",
          freezeRecord.corpusDocumentId,
        );
        console.log(
          "  freezeRecordId       :",
          freezeRecord.freezeRecordId,
        );
        console.log(
          "  title                :",
          APPROVED_METADATA.title,
        );
        console.log(
          "  publisher            :",
          APPROVED_METADATA.publisher,
        );
        console.log(
          "  publicationDate      :",
          APPROVED_METADATA.publicationDate,
        );
        console.log("  domain               :", APPROVED_METADATA.domain);
        console.log("  documentType         :", APPROVED_METADATA.documentType);
        console.log("  difficulty           :", APPROVED_METADATA.difficulty);
        console.log("  language             :", APPROVED_METADATA.language);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log(
          "  normalisedTextDigest :",
          freezeRecord.normalisedTextDigest,
        );
        console.log(
          "  metadataDigest       :",
          freezeRecord.metadataDigest,
        );
        console.log(
          "  freezeRecordDigest   :",
          freezeRecord.freezeRecordDigest,
        );
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
        console.log("  ─── Evaluation Boundary ───");
        console.log(
          "  subject        : Disciplinary notification and meeting procedure",
        );
        console.log(
          "  guide boundary : pages 18–25 (\"Informing the employee\" → \"Allowing a worker to be accompanied\")",
        );
        console.log("  source text    : full normalised Code text (paragraphs 9–17)");
        console.log("  additionalSourceText ready: YES (Code text normalised and verified)");

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0007: NOT MODIFIED");
        console.log("  NO CTS ARTEFACT WAS MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-002 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0008 ADMITTED AND FROZEN — READY FOR BLIND       ║",
        );
        console.log(
          "║  EVALUATION                                               ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      180_000, // 3-minute timeout for live network calls
    );
  },
);
