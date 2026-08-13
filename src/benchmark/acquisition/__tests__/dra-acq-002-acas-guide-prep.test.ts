/**
 * DRA-ACQ-002 — Controlled Acquisition Preparation for DRA-DOC-0008
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-002                             ║
 * ║                                                                          ║
 * ║  This test prepares the controlled acquisition of:                       ║
 * ║    Document:  Acas guide to discipline and grievances at work            ║
 * ║    Corpus ID: DRA-DOC-0008 (proposed)                                    ║
 * ║    Publisher: Advisory, Conciliation and Arbitration Service (Acas)      ║
 * ║    URL:       https://www.acas.org.uk/sites/default/files/2024-08/       ║
 * ║               discipline-and-grievances-at-work-the-acas-guide.pdf       ║
 * ║    Stated publication date: July 2020 (from document and landing page)   ║
 * ║    File path date: 2024-08 (file hosting indicator, not publication date) ║
 * ║                                                                          ║
 * ║  Source evidence document (Code of Practice):                           ║
 * ║    Title:     Acas Code of Practice on disciplinary and grievance        ║
 * ║               procedures                                                  ║
 * ║    Publisher: Advisory, Conciliation and Arbitration Service (Acas)      ║
 * ║    URL:       https://www.acas.org.uk/acas-code-of-practice-on-          ║
 * ║               disciplinary-and-grievance-procedures/html                 ║
 * ║    Published: 11 March 2015                                              ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation                                              ║
 * ║    - corpus-manifest mutation                                            ║
 * ║    - evaluator execution                                                 ║
 * ║    - proof-receipt generation                                            ║
 * ║    - persisted decision creation                                         ║
 * ║                                                                          ║
 * ║  Governance decisions below are MACHINE-PREPARED but NOT VERIFIED.       ║
 * ║  Status is REVIEW_REQUIRED. A human reviewer must examine the evidence   ║
 * ║  and upgrade both assessments to VERIFIED before the document may be     ║
 * ║  frozen. The machine must not independently assign VERIFIED.             ║
 * ║                                                                          ║
 * ║  Expected eligibility result:                                            ║
 * ║    Checks 1-3, 6-13: PASS (11 checks)                                   ║
 * ║    Check 4 OFFICIAL_SOURCE_VERIFIED: FAIL — awaiting human attestation   ║
 * ║    Check 5 LICENCE_VERIFIED: FAIL — awaiting human attestation           ║
 * ║    Total blocking reasons: exactly 2                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * PDF extraction: pdftotext (Poppler 25.07.0) — installed as Nix system
 * package. Injected via the existing PdfExtractor hook in AcquisitionDependencies.
 * No new npm packages are added.
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
import { computeSourceDigest } from "../integrity.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionRequest } from "../request.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// Fixed preparation timestamp
// ---------------------------------------------------------------------------

const PREP_TIMESTAMP = "2026-08-04T00:00:00.000Z";

// ---------------------------------------------------------------------------
// pdftotext extractor
//
// Uses the pdftotext system utility (Poppler, already installed in Nix
// environment). No new npm packages required. Implements the PdfExtractor
// injectable hook that AcquisitionDependencies already defines.
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acas-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Machine-prepared governance objects — REVIEW_REQUIRED
//
// Evidence below is prepared by the machine from confirmed live observations.
// A human reviewer must verify both objects and, if satisfied, upgrade each
// to VERIFIED before the document may be frozen.
//
// Factual basis for official source evidence:
//   - URL confirmed live: HTTP 200 OK, content-type: application/pdf
//   - Landing page HTML title: "Acas guide to discipline and grievances at work | Acas"
//   - Landing page states: "Published July 2020"
//   - Landing page domain: acas.org.uk
//
// Factual basis for licence evidence:
//   - Copyright page: https://www.acas.org.uk/copyright (HTTP 200 OK)
//   - Copyright page states: "© Crown copyright 2022"
//   - Copyright page states: "This website is licensed under the Open Government
//     Licence except where otherwise stated."
//   - OGL version 3.0: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
//   - Copyright page last reviewed: 21 September 2022
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-002-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Guide PDF URL: https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    "Landing page URL: https://www.acas.org.uk/acas-guide-to-discipline-and-grievances-at-work",
    "Landing page HTTP status: 200 OK; content-type: text/html; charset=UTF-8; content-language: en",
    "Guide PDF HTTP status: 200 OK; content-type: application/pdf; server: Apache",
    "Landing page <title>: \"Acas guide to discipline and grievances at work | Acas\"",
    "Landing page states: \"Published July 2020\" (exact text from <p> element)",
    "PDF URL file-path date: 2024-08 — file hosting date only; not adequate evidence of publication date",
    "Landing page document title: \"Discipline and grievances at work: the Acas guide\"",
    "Domain acas.org.uk: official domain of ACAS (Advisory, Conciliation and Arbitration Service)",
    "ACAS is a UK statutory body established under the Employment Protection Act 1975",
    "Document downloaded directly from acas.org.uk; no evidence of third-party mirroring",
    "REQUIRES HUMAN REVIEW: confirm acas.org.uk is the authoritative domain for this publication",
    "REQUIRES HUMAN REVIEW: confirm this PDF is the current definitive version of the guide",
  ],
  notes:
    "DRA-ACQ-002 Machine-prepared official-source evidence. " +
    "Evidence was assembled from confirmed live HTTP observations on 2026-08-04. " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED. " +
    "The machine must not independently assign VERIFIED status.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "Open Government Licence v3.0",
  licenceUrl:
    "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-002-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Copyright page: https://www.acas.org.uk/copyright (HTTP 200 OK, last reviewed 21 September 2022)",
    "Copyright page states: \"© Crown copyright 2022\"",
    "Copyright page states: \"This website is licensed under the Open Government Licence except where otherwise stated.\"",
    "OGL v3 URL: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    "Copyright page: Crown copyright material may be reproduced for research, private study or internal circulation",
    "Copyright page: source must be identified and copyright status acknowledged on republication",
    "Copyright page notes: permission does not extend to third-party copyright material on the site",
    "REQUIRES HUMAN REVIEW: confirm OGL applies to the guide PDF document, not only the website HTML",
    "REQUIRES HUMAN REVIEW: confirm no exclusions apply to content within the selected evaluation boundary",
    "REQUIRES HUMAN REVIEW: confirm no logos, trademarks or third-party material appear in selected sections",
    "REQUIRES HUMAN REVIEW: confirm proposed benchmark use is within the scope of the OGL",
  ],
  notes:
    "DRA-ACQ-002 Machine-prepared licence evidence. " +
    "OGL is confirmed as the stated licence for the ACAS website. " +
    "The copyright page notes that permission does not extend to third-party content. " +
    "A human reviewer must confirm the OGL covers the guide PDF and that no third-party " +
    "exclusions apply to the selected evaluation boundary sections. " +
    "The machine must not independently assign VERIFIED status.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
//
// Factual notes:
//   - Title: from landing page HTML <title> (suffix " | Acas" stripped)
//   - Publication date: July 2020 — stated on landing page as "Published July 2020"
//   - PDF file path /2024-08/ records the file hosting date, not the publication date
//   - Publisher: Advisory, Conciliation and Arbitration Service (Acas)
//   - Domain: BUSINESS — employment discipline procedures
//   - DocumentType: PROCEDURE — step-by-step procedural guidance
//   - Difficulty: LOW — plain language employment guidance
//   - Language: en — confirmed from lang="en" attribute on HTML page
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Acas guide to discipline and grievances at work",
  publisher: "Advisory, Conciliation and Arbitration Service (Acas)",
  publicationDate: "2020-07",
  domain: "BUSINESS" as const,
  documentType: "PROCEDURE" as const,
  difficulty: "LOW" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First PROCEDURE-type corpus entry: zero PROCEDURE documents currently in the corpus. " +
  "Addresses LOW difficulty underrepresentation: second LOW document after DRA-DOC-0006. " +
  "Introduces ACAS as a new official publisher not previously represented in the corpus. " +
  "Distinct evaluation form: the practical guide (generatedText) elaborates on the formal " +
  "Code of Practice (sourceText); both are separately published official documents. " +
  "BUSINESS domain; HUMAN_AUTHORED source type; OPEN_LICENCE basis (OGL v3). " +
  "Topic (employment discipline and grievance procedure) does not overlap with any " +
  "existing corpus document (safety audit, DPIA, vendor risk, clinical validation, " +
  "financial controls, security policy, Apache HTTP authentication).";

// ---------------------------------------------------------------------------
// Proposed evaluation boundary
// ---------------------------------------------------------------------------

const PROPOSED_EVALUATION_BOUNDARY = `
SUBJECT: Disciplinary notification and meeting procedure

GUIDE SECTIONS (generatedText):
  "Informing the employee" through "Allowing a worker to be accompanied
  at the disciplinary meeting"
  Approximate extent: guide pages 18–25

CODE PARAGRAPHS (sourceText):
  Paragraphs 9–17 of the Acas Code of Practice 1
  (Inform the employee → Hold a meeting → Allow the employee to be accompanied)

RATIONALE:
  One coherent procedural subject: notification through meeting conduct.
  The Code states the statutory minimum in numbered paragraphs (9–17).
  The guide provides practical elaboration, preparation checklists, companion
  rights guidance, and procedural specifics not stated in the Code text.
  All Code paragraphs relevant to this subject are included (9–17).
  No Code paragraph is omitted to induce TRACEABILITY_BROKEN.
  No guide sections are combined across unrelated topics.
  No sentences are truncated; no wording is edited; no defects are inserted.
  The boundary will not be adjusted after seeing evaluator results.

NOTE:
  The guide-versus-Code structure may exercise evidence adequacy, traceability,
  unsupported-claim and scope analysis. No issue class or assurance decision
  is predetermined.
`.trim();

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001 through DRA-DOC-0006: from corpus-data.ts (generatedText)
// DRA-DOC-0007: from apache-httpd-auth-fixture.ts (HTML, normalised)
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
// Operational preparation test
// ---------------------------------------------------------------------------

describe("DRA-ACQ-002 — Controlled Acquisition Preparation for DRA-DOC-0008", () => {
  it(
    "acquires ACAS guide PDF and Code HTML, verifies eligibility up to freeze boundary",
    async () => {
      // ── Setup ─────────────────────────────────────────────────────────────

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

      console.log(
        "\n╔══════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║  DRA-ACQ-002 — ACQUISITION PREPARATION LOG                ║",
      );
      console.log(
        "╚══════════════════════════════════════════════════════════╝\n",
      );

      // ── Step 1: Create and validate acquisition request ────────────────────

      const guideUrl =
        "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";

      const requestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000002",
        sourceUrl: guideUrl,
        requestedBy: "DRA-ACQ-002-acquisition-operator",
        requestedAt: PREP_TIMESTAMP,
        expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
        expectedTitle: "Acas guide to discipline and grievances at work",
      });

      expect(requestResult.ok).toBe(true);
      if (!requestResult.ok) return;
      const request = requestResult.request;

      console.log("── Step 1: Acquisition Request ─────────────────────────────");
      console.log("  acquisitionId :", request.acquisitionId);
      console.log("  sourceUrl     :", request.sourceUrl);
      console.log("  requestedBy   :", request.requestedBy);
      console.log("  requestedAt   :", request.requestedAt);

      // ── Step 2: Fetch the ACAS guide PDF ──────────────────────────────────

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

      // Verify we got a PDF
      expect(guideSource.httpStatus).toBe(200);
      expect(guideSource.mediaType).toBe("application/pdf");
      expect(guideSource.rawBytes.length).toBeGreaterThan(100_000);

      // ── Step 3: Compute source digest ─────────────────────────────────────

      const sourceDigest = computeSourceDigest(guideSource.rawBytes);

      console.log("\n── Step 3: Source Digest ───────────────────────────────────");
      console.log("  sourceDigest  :", sourceDigest);
      console.log("  byteLength    :", guideSource.rawBytes.length);

      expect(sourceDigest).toMatch(/^[0-9a-f]{64}$/);

      // ── Step 4: Normalise PDF via pdftotext ───────────────────────────────

      console.log(
        "\n── Step 4: Normalise PDF (pdftotext extractor, no new npm packages) ─",
      );

      const normResult = await normaliseContent(
        guideSource.rawBytes,
        "application/pdf",
        sourceDigest,
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
      const wordCount = normalised.text
        .split(/\s+/)
        .filter(Boolean).length;

      console.log("  normalisationVersion :", normalised.normalisationVersion);
      console.log("  encoding             :", normalised.encoding);
      console.log("  textLength (chars)   :", normalised.text.length);
      console.log("  wordCount            :", wordCount);
      console.log("  textDigest           :", normalised.textDigest);
      console.log("  warnings             :", normalised.warnings.length === 0
        ? "none"
        : normalised.warnings.join("; "));

      expect(normalised.text.trim().length).toBeGreaterThan(0);
      expect(normalised.textDigest).toMatch(/^[0-9a-f]{64}$/);
      expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");

      // ── Step 5: Build existing corpus texts ───────────────────────────────

      console.log(
        "\n── Step 5: Build Existing Corpus Texts for Near-Duplicate Check ─",
      );

      const existingCorpusTexts = await buildExistingCorpusTexts();

      console.log("  DRA-DOC-0001 through DRA-DOC-0006: from BENCHMARK_CORPUS");
      console.log("  DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture");
      console.log("  Total existing corpus texts:", existingCorpusTexts.length);

      expect(existingCorpusTexts.length).toBe(7);

      // ── Step 6: Run freeze eligibility ────────────────────────────────────

      console.log(
        "\n── Step 6: Freeze Eligibility (13 checks) ──────────────────",
      );

      const eligibility = checkFreezeEligibility(
        guideSource,
        normalised,
        PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
        PREPARED_LICENCE_ASSESSMENT,
        PROPOSED_METADATA,
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
        console.log("\n  Blocking reasons:", eligibility.blockingReasons.join(", "));
        console.log(
          "  (Both failures are EXPECTED: machine may not assign VERIFIED)",
        );
      }

      // Assert: exactly two checks fail, both governance-attestation checks
      expect(eligibility.eligible).toBe(false);
      if (!eligibility.eligible) {
        expect(eligibility.blockingReasons).toContain(
          "OFFICIAL_SOURCE_NOT_VERIFIED",
        );
        expect(eligibility.blockingReasons).toContain("LICENCE_NOT_VERIFIED");
        expect(eligibility.blockingReasons).toHaveLength(2);
      }

      // Assert: all non-governance checks pass
      for (const check of eligibility.checks) {
        if (
          check.checkId === "OFFICIAL_SOURCE_VERIFIED" ||
          check.checkId === "LICENCE_VERIFIED"
        ) {
          expect(check.passed).toBe(false);
        } else {
          if (!check.passed) {
            console.error(`UNEXPECTED FAILURE: ${check.checkId} — ${check.detail ?? ""}`);
          }
          expect(check.passed).toBe(true);
        }
      }

      // ── Step 7: Acquire Code HTML (source evidence) ───────────────────────

      console.log(
        "\n── Step 7: Acquire Code of Practice HTML (source evidence) ─",
      );

      const codeUrl =
        "https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html";

      const codeRequestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000003",
        sourceUrl: codeUrl,
        requestedBy: "DRA-ACQ-002-acquisition-operator",
        requestedAt: PREP_TIMESTAMP,
        expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
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

      const codeNormResult = await normaliseContent(
        codeSource.rawBytes,
        "text/html",
        codeSourceDigest,
      );

      expect(codeNormResult.ok).toBe(true);
      if (!codeNormResult.ok) return;

      const codeNormalised = codeNormResult.document;

      console.log("  finalUrl       :", codeSource.finalUrl);
      console.log("  mediaType      :", codeSource.mediaType);
      console.log("  httpStatus     :", codeSource.httpStatus);
      console.log("  rawByteLength  :", codeSource.rawBytes.length);
      console.log("  retrievedAt    :", codeSource.retrievedAt);
      console.log("  sourceDigest   :", codeSourceDigest);
      console.log("  textDigest     :", codeNormalised.textDigest);
      console.log("  textLength     :", codeNormalised.text.length, "chars");

      expect(codeSource.httpStatus).toBe(200);
      expect(codeSource.mediaType).toBe("text/html");
      expect(codeNormalised.text.trim().length).toBeGreaterThan(0);

      // ── Step 8: Proposed evaluation boundary ─────────────────────────────

      console.log(
        "\n── Step 8: Proposed Evaluation Boundary ────────────────────",
      );
      for (const line of PROPOSED_EVALUATION_BOUNDARY.split("\n")) {
        console.log("  " + line);
      }

      // ── Step 9: Acquisition summary ───────────────────────────────────────

      console.log(
        "\n── Acquisition Summary ─────────────────────────────────────",
      );
      console.log("  ─── Guide (DRA-ACQ-000002) ───");
      console.log("  requestedUrl   :", guideSource.requestedUrl);
      console.log("  finalUrl       :", guideSource.finalUrl);
      console.log("  mediaType      :", guideSource.mediaType);
      console.log("  httpStatus     :", guideSource.httpStatus);
      console.log("  byteLength     :", guideSource.rawBytes.length);
      console.log("  retrievedAt    :", guideSource.retrievedAt);
      console.log("  sourceDigest   :", sourceDigest);
      console.log("  textDigest     :", normalised.textDigest);
      console.log("  wordCount      :", wordCount);
      console.log("  ─── Code of Practice (DRA-ACQ-000003, source evidence) ───");
      console.log("  requestedUrl   :", codeSource.requestedUrl);
      console.log("  finalUrl       :", codeSource.finalUrl);
      console.log("  mediaType      :", codeSource.mediaType);
      console.log("  httpStatus     :", codeSource.httpStatus);
      console.log("  byteLength     :", codeSource.rawBytes.length);
      console.log("  retrievedAt    :", codeSource.retrievedAt);
      console.log("  sourceDigest   :", codeSourceDigest);
      console.log("  textDigest     :", codeNormalised.textDigest);
      console.log("  ─── Eligibility ───");
      console.log(
        "  total checks   :",
        eligibility.checks.length,
      );
      console.log(
        "  passed         :",
        eligibility.checks.filter((c) => c.passed).length,
      );
      console.log(
        "  failed         :",
        eligibility.checks.filter((c) => !c.passed).length,
      );
      if (!eligibility.eligible) {
        console.log(
          "  blocking       :",
          eligibility.blockingReasons.join(", "),
          "(expected — awaiting human verification)",
        );
      }
      console.log("\n  EVALUATOR WAS NOT EXECUTED");
      console.log("  FREEZE RECORD WAS NOT CREATED");
      console.log("  CORPUS MANIFEST WAS NOT MUTATED");
      console.log("  PROOF RECEIPT WAS NOT GENERATED");
      console.log("  PERSISTED DECISION WAS NOT CREATED");

      console.log(
        "\n╔══════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║  DRA-ACQ-002 — ALL PREPARATION CHECKS PASSED              ║",
      );
      console.log(
        "║  ACQUISITION PREPARED — READY FOR HUMAN VERIFICATION      ║",
      );
      console.log(
        "╚══════════════════════════════════════════════════════════╝\n",
      );
    },
    180_000, // 3-minute timeout for live PDF + HTML network calls
  );
});
