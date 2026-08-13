/**
 * DRA-ACQ-008 — Controlled Acquisition Preparation for DRA-DOC-0013
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-008                             ║
 * ║                                                                          ║
 * ║  Candidate:                                                              ║
 * ║    DRA-DIS-000004 — U.S. Food and Drug Administration (FDA)              ║
 * ║    Artificial Intelligence/Machine Learning (AI/ML)-Based Software as   ║
 * ║    a Medical Device (SaMD) Action Plan                                   ║
 * ║    Published: January 2021                                               ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Acquisition ID: DRA-ACQ-000015                                        ║
 * ║    Canonical PDF URL:                                                    ║
 * ║      https://www.fda.gov/media/145022/download                           ║
 * ║    Landing page:                                                         ║
 * ║      https://www.fda.gov/medical-devices/software-medical-device-samd/   ║
 * ║      artificial-intelligence-and-machine-learning-software-medical-device ║
 * ║                                                                          ║
 * ║  Corpus rationale:                                                       ║
 * ║    First HEALTHCARE-domain document. New publisher (FDA). References     ║
 * ║    21 CFR, ISO 13485, ISO 14971, IEC 62304, HL7 FHIR — high probability ║
 * ║    of AUTHORITY_ABSENT (IC-3) and SCOPE_VIOLATION (IC-9), both           ║
 * ║    unexercised after BMK-012 (canonical coverage: 3/9 per DRA-CHK-001). ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  U.S. government works are not protected by copyright under              ║
 * ║  17 U.S.C. § 105. FDA publications authored entirely by federal          ║
 * ║  employees are in the public domain. Machine pre-assessment:             ║
 * ║  PUBLIC_DOMAIN (US_GOVERNMENT_WORK). REQUIRES human attestation         ║
 * ║  to confirm no embedded third-party content.                             ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256         ║
 * ║  digests. Source is BYTE_STABLE.                                         ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000007)                             ║
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
 * Reference digests (computed from preparation run 2026-08-06):
 *   Source digest (SHA-256 of raw bytes):
 *     83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a
 *   Text digest (SHA-256 of pdftotext output after CRLF normalisation):
 *     f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186
 *   Byte length: 764,505
 *   Text length (chars, normalised): 24,390
 *   Word count: 3,306
 *
 * This test makes live HTTPS requests to fda.gov, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, ico.org.uk
 * (14 sections), and bankofengland.co.uk (DRA-DOC-0012 near-duplicate check).
 * Allow 12 minutes.
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
import { buildMinimalProtocol } from "../../governance/schema.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// Fixed preparation timestamp
// ---------------------------------------------------------------------------

const PREP_TIMESTAMP = "2026-08-06T14:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const FDA_PDF_URL = "https://www.fda.gov/media/145022/download";

// ---------------------------------------------------------------------------
// Reference digests (preparation run 2026-08-06)
// ---------------------------------------------------------------------------

const REF_SOURCE_DIGEST =
  "83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a";
const REF_TEXT_DIGEST =
  "f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186";
const REF_BYTE_LENGTH = 764505;
const REF_TEXT_LENGTH = 24390;

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-008-prep-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    `byte counts match (${currentBytes}) but digest differs. Stop before admission.`
  );
}

// ---------------------------------------------------------------------------
// Machine-prepared governance objects — REVIEW_REQUIRED
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-008-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.fda.gov/media/145022/download",
    "Publisher: U.S. Food and Drug Administration (FDA), U.S. Department of Health and Human Services",
    "The FDA is a US federal regulatory agency responsible for protecting public health",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    `Content-Length: ${REF_BYTE_LENGTH} bytes`,
    "PDF title: 'Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan'",
    "PDF publication date: January 2021",
    "URL pattern consistent with FDA media asset delivery (fda.gov/media/{id}/download)",
    "FDA landing page: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
    "Source stability: two independent fetches on 2026-08-06 produced identical SHA-256 digest (BYTE_STABLE)",
    "REQUIRES HUMAN REVIEW: confirm the fetched PDF matches the published FDA AI/ML SaMD Action Plan (January 2021)",
    "REQUIRES HUMAN REVIEW: confirm FDA qualifies as an official regulatory source for DRA corpus purposes",
  ],
  notes:
    "DRA-ACQ-008 Machine-prepared official-source evidence. " +
    "FDA AI/ML SaMD Action Plan fetched from official FDA website. " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "US Government Work — Public Domain (17 U.S.C. § 105)",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-008-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Publisher: U.S. Food and Drug Administration (FDA), a federal agency of the United States",
    "17 U.S.C. § 105: 'Copyright protection under this title is not available for any work of the United States Government'",
    "A 'work of the United States Government' is a work prepared by an officer or employee of the US Government as part of that person's official duties",
    "FDA publications are authored by federal employees as part of official duties — fall within 17 U.S.C. § 105",
    "This is the same statutory basis as DRA-DOC-0010 (NIST AI RMF 1.0), previously admitted as PUBLIC_DOMAIN",
    "Machine pre-assessment: PUBLIC_DOMAIN (US_GOVERNMENT_WORK)",
    "REQUIRES HUMAN REVIEW: confirm document was authored entirely by FDA federal employees (not contracted third parties)",
    "REQUIRES HUMAN REVIEW: confirm no embedded third-party content restricts reuse",
  ],
  notes:
    "DRA-ACQ-008 Machine-prepared licence evidence. " +
    "FDA AI/ML SaMD Action Plan is a US government work in the public domain under 17 U.S.C. § 105. " +
    "A human reviewer must confirm no embedded third-party restrictions apply.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  publisher: "U.S. Food and Drug Administration (FDA)",
  publicationDate: "2021-01-12",
  domain: "HEALTHCARE" as const,
  documentType: "POLICY" as const,
  difficulty: "MEDIUM" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First HEALTHCARE-domain document in the DRA corpus. " +
  "Adds the U.S. Food and Drug Administration (FDA) as a new publisher not previously represented. " +
  "FDA AI/ML SaMD Action Plan: normative policy document on regulatory requirements for AI-based medical devices. " +
  "References 21 CFR Part 820 (Quality System Regulation), ISO 13485, ISO 14971, IEC 62304, and HL7 FHIR — " +
  "regulatory and standards authorities with high probability of triggering AUTHORITY_ABSENT (IC-3), " +
  "an issue class unexercised across the 12-document corpus per DRA-CHK-001. " +
  "HUMAN_AUTHORED regulatory guidance with prescriptive action items. " +
  "Short document (~3,306 words) with broad scope claims — potential for SCOPE_VIOLATION (IC-9). " +
  "PUBLIC_DOMAIN (US_GOVERNMENT_WORK): same licence basis as DRA-DOC-0010 (NIST AI RMF 1.0). " +
  "Corpus diversity: HEALTHCARE adds a new domain; FDA adds a new regulatory jurisdiction (US federal health).";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001 through DRA-DOC-0012)
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";
const ICO_SECTION_SLUGS = [
  "/",
  "/whats-new/",
  "/about-this-guidance/",
  "/what-are-the-accountability-and-governance-implications-of-ai/",
  "/how-do-we-ensure-transparency-in-ai/",
  "/how-do-we-ensure-lawfulness-in-ai/",
  "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/",
  "/how-do-we-ensure-fairness-in-ai/",
  "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/",
  "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/",
  "/how-should-we-assess-security-and-data-minimisation-in-ai/",
  "/how-do-we-ensure-individual-rights-in-our-ai-systems/",
  "/annex-a-fairness-in-the-ai-lifecycle/",
  "/glossary/",
];
const ICO_SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006: initial corpus generatedText
  for (const entry of BENCHMARK_CORPUS) {
    texts.push(entry.generatedText);
  }

  // DRA-DOC-0007: Apache HTTP Server auth documentation (HTML fixture)
  const apache = await normaliseContent(
    new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML),
    "text/html",
    "fixture",
    extractPdfText,
  );
  if (apache.ok) texts.push(apache.document.text);

  // DRA-DOC-0008: Acas Discipline and Grievances guide (PDF, live)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl: "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-008-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const acasDigest = computeSourceDigest(acasFetch.source.rawBytes);
      const acasNorm = await normaliseContent(acasFetch.source.rawBytes, "application/pdf", acasDigest, extractPdfText);
      if (acasNorm.ok) texts.push(acasNorm.document.text);
    }
  }

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (PDF, live)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl: "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-008-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const cmaDigest = computeSourceDigest(cmaFetch.source.rawBytes);
      const cmaNorm = await normaliseContent(cmaFetch.source.rawBytes, "application/pdf", cmaDigest, extractPdfText);
      if (cmaNorm.ok) texts.push(cmaNorm.document.text);
    }
  }

  // DRA-DOC-0010: NIST AI RMF 1.0 (PDF, live)
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-008-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "National Institute of Standards and Technology (NIST)",
    expectedTitle: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  });
  if (nistReq.ok) {
    const nistFetch = await fetcher(nistReq.request, {});
    if (nistFetch.ok) {
      const nistDigest = computeSourceDigest(nistFetch.source.rawBytes);
      const nistNorm = await normaliseContent(nistFetch.source.rawBytes, "application/pdf", nistDigest, extractPdfText);
      if (nistNorm.ok) texts.push(nistNorm.document.text);
    }
  }

  // DRA-DOC-0011: ICO AI and data protection guidance (multi-page HTML, live)
  // 14 sections fetched in canonical nav order; joined with section separator
  const icoPageTexts: string[] = [];
  for (const slug of ICO_SECTION_SLUGS) {
    const sectionUrl = `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`;
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: sectionUrl,
      requestedBy: "DRA-ACQ-008-prep-corpus-check",
      requestedAt: PREP_TIMESTAMP,
      expectedPublisher: "Information Commissioner's Office (ICO)",
      expectedTitle: "Guidance on AI and data protection",
    });
    if (icoReq.ok) {
      const icoFetch = await fetcher(icoReq.request, {});
      if (icoFetch.ok) {
        const icoDigest = computeSourceDigest(icoFetch.source.rawBytes);
        const icoNorm = await normaliseContent(icoFetch.source.rawBytes, "text/html", icoDigest, extractPdfText);
        if (icoNorm.ok) icoPageTexts.push(icoNorm.document.text);
      }
    }
  }
  if (icoPageTexts.length > 0) {
    const combined = icoPageTexts.join(ICO_SECTION_SEPARATOR);
    const combinedNorm = await normaliseContent(
      new TextEncoder().encode(combined),
      "text/plain",
      "ico-combined",
      extractPdfText,
    );
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  // DRA-DOC-0012: PRA SS1/23 Model Risk Management (PDF, live)
  const praReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000014",
    sourceUrl: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    requestedBy: "DRA-ACQ-008-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Prudential Regulation Authority (PRA), Bank of England",
    expectedTitle: "Model risk management principles for banks",
  });
  if (praReq.ok) {
    const praFetch = await fetcher(praReq.request, {});
    if (praFetch.ok) {
      const praDigest = computeSourceDigest(praFetch.source.rawBytes);
      const praNorm = await normaliseContent(praFetch.source.rawBytes, "application/pdf", praDigest, extractPdfText);
      if (praNorm.ok) texts.push(praNorm.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-008 — Controlled Acquisition Preparation for DRA-DOC-0013",
  () => {
    it(
      "prepares DRA-DOC-0013 (FDA AI/ML SaMD Action Plan) through eligibility check (stops before freeze)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-008 — ACQUISITION PREPARATION LOG                ║",
        );
        console.log(
          "╠══════════════════════════════════════════════════════════╣",
        );
        console.log(
          "║  CANDIDATE: FDA AI/ML SaMD Action Plan (January 2021)     ║",
        );
        console.log(
          "║  DISCOVERY: DRA-DIS-000004                                ║",
        );
        console.log(
          "║  TARGET: First HEALTHCARE document; IC-3/IC-9 coverage    ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-008",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
        });

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
        });

        // ── Step 1: Acquisition request ──────────────────────────────────

        console.log("── Step 1: Acquisition Request (DRA-ACQ-000015) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000015",
          sourceUrl: FDA_PDF_URL,
          requestedBy: "DRA-ACQ-008-preparation-operator",
          requestedAt: PREP_TIMESTAMP,
          expectedPublisher: "U.S. Food and Drug Administration (FDA)",
          expectedTitle: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 2: Fetch FDA AI/ML SaMD PDF ─────────────────────────────

        console.log("\n── Step 2: Fetch FDA AI/ML SaMD PDF (live network) ─────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("FDA fetch FAILED:", fetchResult.code, fetchResult.message);
        }
        expect(fetchResult.ok).toBe(true);
        if (!fetchResult.ok) return;

        const source = fetchResult.source;

        console.log("  finalUrl        :", source.finalUrl);
        console.log("  mediaType       :", source.mediaType);
        console.log("  httpStatus      :", source.httpStatus);
        console.log("  rawByteLength   :", source.rawBytes.length);
        console.log("  retrievedAt     :", source.retrievedAt);

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");
        expect(source.rawBytes.length).toBeGreaterThan(700_000);

        // ── Step 3: Source digest verification ───────────────────────────

        console.log("\n── Step 3: Source Digest Verification ──────────────────────");

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log("  reference source digest :", REF_SOURCE_DIGEST);
        console.log("  current source digest   :", sourceDigest);
        console.log("  reference byte length   :", REF_BYTE_LENGTH);
        console.log("  current byte length     :", source.rawBytes.length);

        if (sourceDigest !== REF_SOURCE_DIGEST) {
          const classification = classifyDigestChange(
            REF_SOURCE_DIGEST,
            sourceDigest,
            REF_BYTE_LENGTH,
            source.rawBytes.length,
            "FDA AI/ML SaMD source digest",
          );
          console.error("\n  !! SOURCE DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          expect(sourceDigest).toBe(REF_SOURCE_DIGEST);
          return;
        }

        console.log("  ✓ Source digest MATCHES reference");
        expect(sourceDigest).toBe(REF_SOURCE_DIGEST);
        expect(source.rawBytes.length).toBe(REF_BYTE_LENGTH);

        // ── Step 4: Normalisation ─────────────────────────────────────────

        console.log("\n── Step 4: Normalisation (pdftotext) ───────────────────────");

        const normaliseResult = await normaliseContent(
          source.rawBytes,
          "application/pdf",
          sourceDigest,
          extractPdfText,
        );

        if (!normaliseResult.ok) {
          console.error("Normalisation FAILED:", normaliseResult.code, normaliseResult.message);
        }
        expect(normaliseResult.ok).toBe(true);
        if (!normaliseResult.ok) return;

        const normalised = normaliseResult.document;

        console.log("  normalisationVersion :", normalised.normalisationVersion);
        console.log("  textDigest           :", normalised.textDigest);
        console.log("  textLength (chars)   :", normalised.text.length);

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.text.trim().length).toBeGreaterThan(0);

        // ── Step 5: Text digest verification ─────────────────────────────

        console.log("\n── Step 5: Text Digest Verification ────────────────────────");
        console.log("  reference text digest :", REF_TEXT_DIGEST);
        console.log("  current text digest   :", normalised.textDigest);

        if (normalised.textDigest !== REF_TEXT_DIGEST) {
          const classification = classifyDigestChange(
            REF_TEXT_DIGEST,
            normalised.textDigest,
            REF_TEXT_LENGTH,
            normalised.text.length,
            "FDA AI/ML SaMD normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          console.log("  NOTE: Update REF_TEXT_DIGEST and REF_TEXT_LENGTH if this is first run.");
          expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);

        // ── Step 6: Build existing corpus texts (DRA-DOC-0001–0012) ──────

        console.log("\n── Step 6: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  DRA-DOC-0010:      live fetch from nvlpubs.nist.gov");
        console.log("  DRA-DOC-0011:      live fetch from ico.org.uk (14 sections)");
        console.log("  DRA-DOC-0012:      live fetch from bankofengland.co.uk");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        expect(existingCorpusTexts.length).toBe(12);

        // ── Step 7: Freeze eligibility check ─────────────────────────────

        console.log("\n── Step 7: Freeze Eligibility (13 checks — REVIEW_REQUIRED) ─");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
          PROPOSED_METADATA,
          "DRA-DOC-0013",
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

        const failedChecks = eligibility.checks.filter((c) => !c.passed);
        const passedChecks = eligibility.checks.filter((c) => c.passed);

        console.log(`\n  Passed: ${passedChecks.length}/13`);
        console.log(`  Failed: ${failedChecks.length}/13`);
        console.log("  Expected failures: OFFICIAL_SOURCE_VERIFIED, LICENCE_VERIFIED");
        console.log("  (REVIEW_REQUIRED — awaiting human governance attestation)");

        expect(passedChecks.length).toBe(11);
        expect(failedChecks.length).toBe(2);
        expect(failedChecks.map((c) => c.checkId).sort()).toEqual(
          ["LICENCE_VERIFIED", "OFFICIAL_SOURCE_VERIFIED"].sort(),
        );

        // ── Step 8: Preparation summary ───────────────────────────────────

        console.log("\n── Preparation Summary ─────────────────────────────────────");
        console.log("  proposedCorpusId    :", "DRA-DOC-0013");
        console.log("  discoveryId         :", "DRA-DIS-000004");
        console.log("  acquisitionId       :", request.acquisitionId);
        console.log("  title               :", PROPOSED_METADATA.title);
        console.log("  publisher           :", PROPOSED_METADATA.publisher);
        console.log("  publicationDate     :", PROPOSED_METADATA.publicationDate);
        console.log("  domain              :", PROPOSED_METADATA.domain);
        console.log("  documentType        :", PROPOSED_METADATA.documentType);
        console.log("  difficulty          :", PROPOSED_METADATA.difficulty);
        console.log("  sourceDigest        :", sourceDigest);
        console.log("  textDigest          :", normalised.textDigest);
        console.log("  byteLength          :", source.rawBytes.length);
        console.log("  textLength (chars)  :", normalised.text.length);
        console.log("  eligibilityStatus   : REVIEW_REQUIRED (2/13 checks need human attestation)");
        console.log("  licenceBasis        :", PREPARED_LICENCE_ASSESSMENT.licenceBasis);
        console.log("  targetIssueClasses  : IC-3 (AUTHORITY_ABSENT), IC-9 (SCOPE_VIOLATION)");

        console.log("\n  FREEZE RECORD WAS NOT CREATED");
        console.log("  CORPUS MANIFEST WAS NOT MUTATED");
        console.log("  EVALUATOR WAS NOT EXECUTED");
        console.log("  AWAITING HUMAN GOVERNANCE DECISIONS FOR ADMISSION");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-008 — PREPARATION COMPLETE (REVIEW_REQUIRED)     ║",
        );
        console.log(
          "║  FDA AI/ML SaMD Action Plan ready for human governance    ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      720_000, // 12 minutes
    );
  },
);
