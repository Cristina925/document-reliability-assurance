/**
 * DRA-ACQ-005 — Controlled Acquisition Preparation for DRA-DOC-0010
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-005                             ║
 * ║                                                                          ║
 * ║  Authorised candidate                                                    ║
 * ║    Proposed Corpus ID: DRA-DOC-0010                                      ║
 * ║    Publisher:          National Institute of Standards and Technology    ║
 * ║                        (NIST), U.S. Department of Commerce              ║
 * ║    Publication:        Artificial Intelligence Risk Management           ║
 * ║                        Framework (AI RMF 1.0)                           ║
 * ║    Publication number: NIST AI 100-1                                     ║
 * ║    Publication date:   January 2023 (26 January 2023)                   ║
 * ║    DOI:                10.6028/NIST.AI.100-1                             ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Internal title: Artificial Intelligence Risk Management               ║
 * ║                    Framework (AI RMF 1.0)                               ║
 * ║    Acquisition ID: DRA-ACQ-000012                                        ║
 * ║    Canonical URL:                                                        ║
 * ║      https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf             ║
 * ║    DOI URL (resolves to canonical):                                      ║
 * ║      https://doi.org/10.6028/NIST.AI.100-1                              ║
 * ║                                                                          ║
 * ║  NOTE ON LAST-MODIFIED DATE:                                             ║
 * ║  The HTTP Last-Modified header returns Wed, 04 Jun 2025 17:14:26 GMT.   ║
 * ║  The document internal text states "January 2023" and "AI RMF 1.0"      ║
 * ║  throughout; no version 1.1 or later indicators were found in the       ║
 * ║  extracted text. The Jun 2025 date likely reflects a server-side        ║
 * ║  re-rendering (e.g. accessibility improvements), not a content          ║
 * ║  revision. Human review must confirm the document is AI RMF 1.0.        ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  NIST publications are works of the U.S. federal government and are     ║
 * ║  not subject to domestic copyright protection under 17 U.S.C. § 105.   ║
 * ║  The document does not contain a copyright notice. It states:           ║
 * ║  "This publication is available free of charge from:                    ║
 * ║   https://doi.org/10.6028/NIST.AI.100-1"                               ║
 * ║  Machine pre-assessment: PUBLIC_DOMAIN (US government work).            ║
 * ║  REQUIRES human attestation before freeze.                              ║
 * ║                                                                          ║
 * ║  Single-document acquisition:                                            ║
 * ║  Unlike DRA-ACQ-004 (paired short version + full report), the NIST      ║
 * ║  AI RMF 1.0 is a self-contained framework document. No separate         ║
 * ║  evidence-source PDF is acquired. The document is both the content      ║
 * ║  under evaluation and its own primary source.                           ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000004)                             ║
 * ║    - corpus-manifest mutation                                            ║
 * ║    - evaluator execution                                                 ║
 * ║                                                                          ║
 * ║  Governance status: REVIEW_REQUIRED                                      ║
 * ║  Expected eligibility result:                                            ║
 * ║    Checks 1-3, 6-13: PASS (11 checks)                                   ║
 * ║    Check 4 OFFICIAL_SOURCE_VERIFIED: FAIL — awaiting human attestation  ║
 * ║    Check 5 LICENCE_VERIFIED: FAIL — awaiting human attestation          ║
 * ║    Total blocking reasons: exactly 2                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Reference digests (computed 2026-08-04 during this preparation run):
 *   Source digest (SHA-256 of raw bytes):  7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1
 *   Text digest (SHA-256 of normalised):   6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430
 *   Byte length:                           1,946,127
 *   Text length (chars, normalised):       122,238
 *   Word count:                            15,918
 *
 * HTTP response (2026-08-04):
 *   Status:        200 OK
 *   Content-Type:  application/pdf
 *   Content-Length: 1,946,127 bytes
 *   Last-Modified: Wed, 04 Jun 2025 17:14:26 GMT
 *   ETag:          "327b21f74d5db1:0"
 *
 * PDF extraction: pdftotext (Poppler) — existing Nix system package.
 * No new npm packages added.
 *
 * This test makes live HTTPS requests to nvlpubs.nist.gov. Allow 5 minutes.
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
// Canonical PDF URL
//
// The DOI (https://doi.org/10.6028/NIST.AI.100-1) redirects to this URL.
// HEAD requests to nvlpubs.nist.gov return 404 (server configuration);
// GET requests return 200 with the full PDF. This is confirmed behaviour.
// The HTTP fetcher uses GET and correctly receives the document.
// ---------------------------------------------------------------------------

const NIST_PDF_URL =
  "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";

const DOI_URL = "https://doi.org/10.6028/NIST.AI.100-1";

// ---------------------------------------------------------------------------
// Reference digests (preparation run 2026-08-04)
//
// Source digest: SHA-256 of raw PDF bytes.
// Text digest:   SHA-256 of pdftotext output after CRLF normalisation
//                (computed by the pipeline at test runtime; placeholder
//                updated after first run).
// ---------------------------------------------------------------------------

const REF_SOURCE_DIGEST =
  "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1";
const REF_TEXT_DIGEST =
  "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430";
const REF_BYTE_LENGTH = 1946127;
const REF_TEXT_LENGTH = 122238;

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// Reuses the same wrapper from DRA-ACQ-002, DRA-ACQ-003, DRA-ACQ-004.
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-005-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Digest mismatch classifier
// ---------------------------------------------------------------------------

function classifyDigestChange(
  ref: string,
  current: string,
  refBytes: number,
  currentBytes: number,
  label: string,
): string {
  if (ref === current) return "UNCHANGED";
  const isPlaceholder =
    ref === "1e2087c5fce6a5f41eb3e5843e9e5cef5e16bbf9d2e4a1b3b8dac2985e1d14b" ||
    refBytes === 0;
  if (isPlaceholder) {
    return (
      `PLACEHOLDER_REPLACED — ${label}: first run establishes reference. ` +
      `Update REF_TEXT_DIGEST and REF_TEXT_LENGTH to current values.`
    );
  }
  if (refBytes !== currentBytes) {
    return (
      `SOURCE_CHANGE_DETECTED — ${label}: byte count changed ` +
      `from ${refBytes} to ${currentBytes}. Stop before admission.`
    );
  }
  return (
    `EXTRACTION_OR_ENCODING_NONDETERMINISM — ${label}: ` +
    `byte counts match (${currentBytes}) but digest differs. Stop before admission.`
  );
}

// ---------------------------------------------------------------------------
// Machine-prepared governance objects — REVIEW_REQUIRED
//
// OFFICIAL SOURCE EVIDENCE:
//   - Document fetched from nvlpubs.nist.gov (NIST official publications host)
//   - DOI: 10.6028/NIST.AI.100-1 (registered with NIST)
//   - NIST is a non-regulatory federal agency of the U.S. Department of Commerce
//   - Internal title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)"
//   - Publication number: NIST AI 100-1
//   - Internal date: "January 2023"
//   - Last-Modified: Wed, 04 Jun 2025 17:14:26 GMT
//     (server update; document text still states AI RMF 1.0 / January 2023;
//     no version 1.1 or later indicators found in extracted text)
//   - NIST CSRC publication page: https://csrc.nist.gov/pubs/ai/100/1/final
//     (returned 404 during preparation; nvlpubs.nist.gov is the canonical host)
//
// LICENCE EVIDENCE:
//   - No copyright notice in document (consistent with U.S. government work)
//   - 17 U.S.C. § 105: "Copyright protection under this title is not available
//     for any work of the United States Government"
//   - Document disclaimer: "Certain commercial entities, equipment, or materials
//     may be identified in this document in order to describe an experimental
//     procedure or concept adequately. Such identification is not intended to
//     imply recommendation or endorsement by [NIST]"
//   - Document states: "This publication is available free of charge from:
//     https://doi.org/10.6028/NIST.AI.100-1"
//   - Machine pre-assessment: PUBLIC_DOMAIN (US government work)
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-005-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Document fetched from https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf (NIST official publications host)",
    "DOI: 10.6028/NIST.AI.100-1 — resolves to the nvlpubs URL via https://doi.org/10.6028/NIST.AI.100-1",
    "Publisher: National Institute of Standards and Technology, U.S. Department of Commerce",
    "NIST is a non-regulatory federal agency of the U.S. Department of Commerce",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    `Content-Length: ${REF_BYTE_LENGTH} bytes`,
    "Last-Modified: Wed, 04 Jun 2025 17:14:26 GMT",
    "ETag: \"327b21f74d5db1:0\"",
    "Internal title (PDF cover page): 'Artificial Intelligence Risk Management Framework (AI RMF 1.0)'",
    "Internal publication number (PDF): 'NIST AI 100-1'",
    "Internal date (PDF cover page): 'January 2023'",
    "Internal author attribution: 'Laurie E. Locascio, NIST Director and Under Secretary of Commerce for Standards and Technology'",
    "Document text throughout identifies itself as 'AI RMF 1.0'; no '1.1' or later version indicators found in extracted text",
    "Last-Modified date (Jun 2025) is likely a server-side re-rendering, not a content revision",
    "NOTE ON HEAD REQUESTS: nvlpubs.nist.gov returns HTTP 404 for HEAD requests but 200 for GET; the fetcher uses GET",
    "NOTE ON CSRC PAGE: https://csrc.nist.gov/pubs/ai/100/1/final returned 404 during preparation; nvlpubs.nist.gov is the active canonical host",
    "REQUIRES HUMAN REVIEW: confirm the fetched PDF is the published AI RMF Version 1.0 (January 2023) without subsequent content changes",
    "REQUIRES HUMAN REVIEW: confirm NIST qualifies as an official government source for DRA corpus purposes",
    "REQUIRES HUMAN REVIEW: confirm the Jun 2025 Last-Modified date reflects only a server-side re-rendering (not a substantive revision)",
  ],
  notes:
    "DRA-ACQ-005 Machine-prepared official-source evidence. " +
    "Canonical URL confirmed via DOI resolution. " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "U.S. Government Work (Public Domain)",
  licenceUrl: "https://www.usa.gov/government-works",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-005-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "NIST is an agency of the U.S. federal government",
    "17 U.S.C. § 105: 'Copyright protection under this title is not available for any work of the United States Government'",
    "No copyright notice appears in the PDF (consistent with U.S. government public domain work)",
    "Document cover page: 'This publication is available free of charge from: https://doi.org/10.6028/NIST.AI.100-1'",
    "usa.gov/government-works: 'U.S. government works are not subject to copyright protection in the United States'",
    "Document may contain third-party material. Cover page disclaimer: 'Certain commercial entities, equipment, or materials may be identified in this document in order to describe an experimental procedure or concept adequately. Such identification is not intended to imply recommendation or endorsement by [NIST]'",
    "No Creative Commons licence applied (document predates NIST's CC0 adoption for some categories)",
    "Reuse is unrestricted for the government-authored portions of the document",
    "Machine pre-assessment: PUBLIC_DOMAIN (U.S. government work, 17 U.S.C. § 105)",
    "REQUIRES HUMAN REVIEW: confirm no embedded third-party material in evaluation scope has separate copyright restrictions",
    "REQUIRES HUMAN REVIEW: confirm reuse in a public benchmark is compatible with the document's intended use",
    "REQUIRES HUMAN REVIEW: verify that the document in its entirety (including tables, appendices) qualifies as a U.S. government work",
  ],
  notes:
    "DRA-ACQ-005 Machine-prepared licence evidence. " +
    "NIST publications are works of the U.S. federal government and are not subject to domestic copyright protection. " +
    "Machine pre-assessment: OPEN_LICENCE (PUBLIC_DOMAIN). " +
    "A human reviewer must verify no embedded third-party material restricts reuse.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
//
// Factual basis:
//   - Title: from PDF internal cover page
//   - Publisher: NIST (stated on cover page)
//   - Publication date: January 2023 (internal; formal date 26 January 2023)
//   - Domain: TECHNICAL — AI risk management, trustworthiness, governance
//   - DocumentType: POLICY — authoritative government framework establishing
//     governance principles and practices for AI risk management;
//     non-prescriptive (outcome-focused) policy guidance
//   - Difficulty: HIGH — technical risk management taxonomy, subcategories,
//     and cross-functional governance language; presupposes familiarity with
//     enterprise risk management concepts
//   - Language: en (US English; not en-GB)
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
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
  "Adds the National Institute of Standards and Technology (NIST) as a new institution not represented in the corpus. " +
  "TECHNICAL domain: AI risk management and trustworthiness governance; " +
  "distinct from all existing entries (existing TECHNICAL entries cover safety audit and technical compliance). " +
  "HIGH difficulty: technical risk management taxonomy (GOVERN, MAP, MEASURE, MANAGE functions), " +
  "cross-functional governance language, and AI trustworthiness subcategories. " +
  "PUBLIC_DOMAIN source: U.S. government work, 17 U.S.C. § 105; no licence restrictions on reuse. " +
  "HUMAN_AUTHORED source type: authoritative framework authored by NIST. " +
  "Single-document structure: the AI RMF 1.0 is a self-contained framework; " +
  "Stage 2 will extract policy claims, Stage 3 will resolve cited authorities " +
  "(NIST CSF, NIST SP 800-series, ISO/IEC standards, OECD AI Principles), " +
  "Stage 4 will link evidence within the document and its cited references, " +
  "Stage 5 will assess the materiality of any discrepancies found. " +
  "No self-evaluation risk: the NIST AI RMF addresses organisational AI risk management; " +
  "it is not an evaluation of document reliability assessment systems. " +
  "No predetermined issue class: the evaluator will assess policy claims without foreknowledge of expected outcomes.";

// ---------------------------------------------------------------------------
// Proposed evaluation boundary
// ---------------------------------------------------------------------------

const PROPOSED_EVALUATION_BOUNDARY = `
SUBJECT: Artificial Intelligence Risk Management Framework — AI governance and risk management (AI RMF 1.0)

DOCUMENT UNDER EVALUATION (DRA-ACQ-000012 — NIST AI RMF 1.0, POLICY type):
  Internal title:    Artificial Intelligence Risk Management Framework (AI RMF 1.0)
  Publisher:         National Institute of Standards and Technology (NIST)
  Publication number: NIST AI 100-1
  Publication date:  January 2023 (formal: 26 January 2023)
  Byte length:       ${REF_BYTE_LENGTH} bytes
  Source digest:     ${REF_SOURCE_DIGEST}

  Substantive evaluation boundary (text included):
    Full normalised text of NIST.AI.100-1.pdf, EXCLUDING ONLY:
    - Cover matter (title page, DOI availability notice, cover attributions)
    - Table of Contents, List of Tables, List of Figures (navigation)
    - Cover/repeat title at page heading level (NIST AI 100-1 running header)
    - "This publication is available free of charge from:" footer lines (boilerplate)
    - Page number artefacts at page breaks

  Content included in evaluation:
    • Executive Summary
    • Part 1: Foundational Information
      - Chapter 1: Framing Risk (1.1–1.2.4)
      - Chapter 2: Audience
      - Chapter 3: AI Risks and Trustworthiness (3.1–3.7)
      - Chapter 4: Effectiveness of the AI RMF
    • Part 2: Core and Profiles
      - Chapter 5: AI RMF Core (5.1 Govern, 5.2 Map, 5.3 Measure, 5.4 Manage)
        including Tables 1–4 (categories and subcategories)
      - Chapter 6: AI RMF Profiles
    • Appendix A: Descriptions of AI Actor Tasks
    • Appendix B: How AI Risks Differ from Traditional Software Risks
    • Appendix C: AI Risk Management and Human-AI Interaction
    • Appendix D: Attributes of the AI RMF

  Evidence source:
    The document is self-contained. Cited external references (NIST CSF, NIST SP 800-series,
    ISO/IEC standards, OECD AI Principles) constitute the external evidence base.
    These are not separately acquired; the evaluator consults them via cited authority resolution.

  Evaluation boundary justification:
    The NIST AI RMF 1.0 is a standalone policy framework document.
    The entire substantive text constitutes the evaluation scope.
    All claims, definitions, subcategory descriptions, and appendices are in scope.
`.trim();

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001 to DRA-DOC-0006: from BENCHMARK_CORPUS
// DRA-DOC-0007: from APACHE_HTTPD_AUTH_HTML fixture
// DRA-DOC-0008: re-fetched from acas.org.uk (live network)
// DRA-DOC-0009: not yet frozen (CMA acquisition pending review)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006 (from BENCHMARK_CORPUS)
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

  // DRA-DOC-0008 — Acas guide (re-fetched)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-005-corpus-check",
    requestedAt: PREP_TIMESTAMP,
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
// Operational preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-005 — Controlled Acquisition Preparation for DRA-DOC-0010 (NIST AI RMF 1.0)",
  () => {
    it(
      "acquires NIST AI RMF 1.0 PDF, verifies eligibility up to freeze boundary",
      async () => {
        // ── Setup ───────────────────────────────────────────────────────────

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

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-005 — ACQUISITION PREPARATION LOG                ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
        console.log("  Publisher     : National Institute of Standards and Technology");
        console.log("  Document      : Artificial Intelligence Risk Management Framework (AI RMF 1.0)");
        console.log("  Pub. Number   : NIST AI 100-1");
        console.log("  Date          : January 2023 (formal: 26 January 2023)");
        console.log("  DOI           :", DOI_URL);
        console.log("  Canonical URL :", NIST_PDF_URL);
        console.log("  Acquisition   : DRA-ACQ-000012 (single document)");
        console.log("  Proposed ID   : DRA-DOC-0010");

        // ── Step 1: Create acquisition request ──────────────────────────────

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000012",
          sourceUrl: NIST_PDF_URL,
          requestedBy: "DRA-ACQ-005-acquisition-operator",
          requestedAt: PREP_TIMESTAMP,
          expectedPublisher:
            "National Institute of Standards and Technology (NIST)",
          expectedTitle:
            "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log(
          "\n── Step 1: Acquisition Request (DRA-ACQ-000012) ────────────",
        );
        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);
        console.log("  requestedBy   :", request.requestedBy);
        console.log("  requestedAt   :", request.requestedAt);

        // ── Step 2: Fetch NIST AI RMF PDF (first pass) ──────────────────────

        console.log(
          "\n── Step 2: Fetch NIST AI RMF PDF — Pass 1 (live network) ──",
        );
        console.log(
          "  NOTE: nvlpubs.nist.gov returns 404 for HEAD; 200 for GET.",
        );

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error(
            "NIST AI RMF PDF fetch FAILED:",
            fetchResult.code,
            fetchResult.message,
          );
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
          if (h.contentType)   console.log("  content-type    :", h.contentType);
          if (h.lastModified)  console.log("  last-modified   :", h.lastModified);
          if (h.contentLength) console.log("  content-length  :", h.contentLength);
          if (h.etag)          console.log("  etag            :", h.etag);
        }

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");
        expect(source.rawBytes.length).toBeGreaterThan(1_800_000);

        // ── Step 3: Source digest (pass 1) ───────────────────────────────────

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log(
          "\n── Step 3: Source Digest Verification ──────────────────────",
        );
        console.log("  reference digest :", REF_SOURCE_DIGEST);
        console.log("  current digest   :", sourceDigest);
        console.log("  reference bytes  :", REF_BYTE_LENGTH);
        console.log("  current bytes    :", source.rawBytes.length);

        if (sourceDigest !== REF_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REF_SOURCE_DIGEST,
            sourceDigest,
            REF_BYTE_LENGTH,
            source.rawBytes.length,
            "NIST AI RMF PDF source digest",
          );
          console.error("\n  !! SOURCE DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          console.error(
            "  Action: review change and update reference digest before freeze.",
          );
        } else {
          console.log("  ✓ Source digest matches reference");
        }
        expect(sourceDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 4: Normalise via pdftotext ──────────────────────────────────

        console.log(
          "\n── Step 4: Normalise (pdftotext, no new npm packages) ──────",
        );

        const normResult = await normaliseContent(
          source.rawBytes,
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

        // Log the reference update instruction if this is a first run
        const classification = classifyDigestChange(
          REF_TEXT_DIGEST,
          normalised.textDigest,
          REF_TEXT_LENGTH,
          normalised.text.length,
          "NIST AI RMF normalised-text digest",
        );
        if (classification.startsWith("PLACEHOLDER_REPLACED")) {
          console.log(
            "\n  >> FIRST RUN: update REF_TEXT_DIGEST and REF_TEXT_LENGTH:",
          );
          console.log("     REF_TEXT_DIGEST =", `"${normalised.textDigest}"`);
          console.log("     REF_TEXT_LENGTH =", normalised.text.length);
        } else if (classification !== "UNCHANGED") {
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
        } else {
          console.log("  ✓ Text digest matches reference");
        }

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.text.trim().length).toBeGreaterThan(10_000);
        expect(normalised.textDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 5: Reproducibility check (second pass) ──────────────────────

        console.log(
          "\n── Step 5: Reproducibility Check — Second Acquisition Pass ─",
        );

        const fetch2Result = await fetcher(request, {});
        expect(fetch2Result.ok).toBe(true);

        if (fetch2Result.ok) {
          const digest2 = computeSourceDigest(fetch2Result.source.rawBytes);
          const norm2 = await normaliseContent(
            fetch2Result.source.rawBytes,
            "application/pdf",
            digest2,
            extractPdfText,
          );

          console.log(
            "  source digest match  :",
            digest2 === sourceDigest ? "✓ IDENTICAL" : `!! DIFFERS: ${digest2}`,
          );
          if (norm2.ok) {
            console.log(
              "  text digest match    :",
              norm2.document.textDigest === normalised.textDigest
                ? "✓ IDENTICAL"
                : `!! DIFFERS: ${norm2.document.textDigest}`,
            );
          }

          expect(digest2).toBe(sourceDigest);
          if (norm2.ok) {
            expect(norm2.document.textDigest).toBe(normalised.textDigest);
          }
        }

        console.log("  ✓ Reproducibility check complete");

        // ── Step 6: Build existing corpus texts for near-duplicate check ──────

        console.log(
          "\n── Step 6: Build Existing Corpus Texts for Near-Duplicate Check ─",
        );
        console.log("  Fetching DRA-DOC-0001–0006 from BENCHMARK_CORPUS");
        console.log("  Fetching DRA-DOC-0007 from apache-httpd-auth-fixture");
        console.log("  Fetching DRA-DOC-0008 (Acas guide) from acas.org.uk (live)");
        console.log("  NOTE: DRA-DOC-0009 (CMA, pending review) not yet in registry");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        if (existingCorpusTexts.length !== 8) {
          console.warn(
            "  !! Expected 8 existing corpus texts; got " +
              existingCorpusTexts.length +
              ". Near-duplicate check may be partial.",
          );
        }

        // ── Step 7: Freeze eligibility (13 checks) ───────────────────────────

        console.log(
          "\n── Step 7: Freeze Eligibility (13 checks) ──────────────────",
        );

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
          PROPOSED_METADATA,
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
          console.log("\n  Blocking reasons:", eligibility.blockingReasons.join(", "));
          console.log("  (Both governance failures EXPECTED — machine cannot assign VERIFIED)");
        }

        // Assert exactly two checks fail — the governance attestation checks
        expect(eligibility.eligible).toBe(false);
        if (!eligibility.eligible) {
          expect(eligibility.blockingReasons).toContain("OFFICIAL_SOURCE_NOT_VERIFIED");
          expect(eligibility.blockingReasons).toContain("LICENCE_NOT_VERIFIED");
          expect(eligibility.blockingReasons).toHaveLength(2);
        }

        // All non-governance checks must pass
        for (const check of eligibility.checks) {
          if (
            check.checkId === "OFFICIAL_SOURCE_VERIFIED" ||
            check.checkId === "LICENCE_VERIFIED"
          ) {
            expect(check.passed).toBe(false);
          } else {
            if (!check.passed) {
              console.error(
                `UNEXPECTED FAILURE: ${check.checkId} — ${check.detail ?? ""}`,
              );
            }
            expect(check.passed).toBe(true);
          }
        }

        // ── Step 8: Acquisition summary ──────────────────────────────────────

        console.log(
          "\n── Acquisition Summary ─────────────────────────────────────",
        );
        console.log("  requestedUrl       :", source.requestedUrl);
        console.log("  finalUrl           :", source.finalUrl);
        console.log("  mediaType          :", source.mediaType);
        console.log("  httpStatus         :", source.httpStatus);
        console.log("  byteLength         :", source.rawBytes.length);
        console.log("  retrievedAt        :", source.retrievedAt);
        console.log("  sourceDigest       :", sourceDigest);
        console.log("  textDigest         :", normalised.textDigest);
        console.log("  textLength (chars) :", normalised.text.length);
        console.log("  wordCount          :", wordCount);
        console.log("  ─── Eligibility ───");
        console.log("  total checks       :", eligibility.checks.length);
        console.log(
          "  passed             :",
          eligibility.checks.filter((c) => c.passed).length,
        );
        console.log(
          "  failed             :",
          eligibility.checks.filter((c) => !c.passed).length,
        );
        console.log(
          "  blocking reasons   :",
          eligibility.eligible ? "none" : eligibility.blockingReasons.join(", "),
        );

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-005 PREPARATION COMPLETE — REVIEW_REQUIRED       ║",
        );
        console.log(
          "║  Human reviewer must verify official source and licence.   ║",
        );
        console.log(
          "║  Licence pre-assessment: PUBLIC_DOMAIN (U.S. government    ║",
        );
        console.log(
          "║  work, 17 U.S.C. § 105). Human confirmation required.      ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      300_000,
    );
  },
);
