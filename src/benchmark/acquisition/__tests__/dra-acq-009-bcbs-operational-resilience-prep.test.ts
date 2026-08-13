/**
 * DRA-ACQ-009 — Controlled Acquisition Preparation for DRA-DOC-0014
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-009                             ║
 * ║                                                                          ║
 * ║  Candidate:                                                              ║
 * ║    DRA-DIS-000005 — Basel Committee on Banking Supervision (BCBS)        ║
 * ║    Principles for Operational Resilience                                 ║
 * ║    d516 — Published: March 2021                                          ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Acquisition ID: DRA-ACQ-000016                                        ║
 * ║    Canonical PDF URL:                                                    ║
 * ║      https://www.bis.org/bcbs/publ/d516.pdf                             ║
 * ║    Landing page:                                                         ║
 * ║      https://www.bis.org/bcbs/publ/d516.htm                             ║
 * ║                                                                          ║
 * ║  Corpus rationale:                                                       ║
 * ║    Primary target: IC-3 AUTHORITY_ABSENT investigation — BCBS doc        ║
 * ║    references external regulatory frameworks (Basel III, ISO 22301,      ║
 * ║    BCBS 239, FSB guidelines) as normative authorities. If Stage 3        ║
 * ║    produces NO_IDENTIFIABLE_SOURCE, IC-3 would be exercised; if not,    ║
 * ║    the structural barrier is documented as a negative result. Second     ║
 * ║    real-world FINANCE document (after PRA SS1/23). First international   ║
 * ║    (non-US, non-UK) publisher. HIGH difficulty.                          ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  BIS terms permit reproduction for educational and non-commercial         ║
 * ║  purposes. Machine pre-assessment: OPEN_LICENCE (BIS non-commercial      ║
 * ║  educational use). Analogous to DRA-DOC-0012 (PRA SS1/23). REQUIRES     ║
 * ║  human attestation to confirm BIS non-commercial permission applies.     ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256        ║
 * ║  digests. Source is BYTE_STABLE.                                         ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000008)                             ║
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
 *     5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38
 *   Text digest (SHA-256 of pdftotext output after CRLF normalisation):
 *     2b1dbb2b3ae1107754db85e60fc2cf9fe2b6f61b3c3756752d2e2e6ade654e25
 *   Byte length: 251,998
 *   Text length (chars, normalised): 32,947
 *   Word count: ~4,096
 *
 * This test makes live HTTPS requests to bis.org, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, ico.org.uk
 * (14 sections), bankofengland.co.uk, and fda.gov (DRA-DOC-0013
 * near-duplicate check). Allow 15 minutes.
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

const PREP_TIMESTAMP = "2026-08-06T19:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const BIS_PDF_URL = "https://www.bis.org/bcbs/publ/d516.pdf";

// ---------------------------------------------------------------------------
// Reference digests (preparation run 2026-08-06)
// ---------------------------------------------------------------------------

const REF_SOURCE_DIGEST =
  "5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38";
const REF_TEXT_DIGEST =
  "2b1dbb2b3ae1107754db85e60fc2cf9fe2b6f61b3c3756752d2e2e6ade654e25";
const REF_BYTE_LENGTH = 251998;
const REF_TEXT_LENGTH = 32947;

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-009-prep-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-009-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.bis.org/bcbs/publ/d516.pdf",
    "Publisher: Basel Committee on Banking Supervision (BCBS), secretariat hosted at Bank for International Settlements (BIS)",
    "BCBS is an international standard-setting body for bank regulation, established under the auspices of the BIS (Basel, Switzerland)",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    `Content-Length: ${REF_BYTE_LENGTH} bytes`,
    "PDF document: 'Principles for Operational Resilience', BCBS publication d516, March 2021",
    "Landing page: https://www.bis.org/bcbs/publ/d516.htm",
    "URL pattern consistent with BIS BCBS publication numbering (d516 = document 516)",
    "Source stability: two independent fetches on 2026-08-06 produced identical SHA-256 digest (BYTE_STABLE)",
    "REQUIRES HUMAN REVIEW: confirm the fetched PDF matches the published BCBS Principles for Operational Resilience (March 2021)",
    "REQUIRES HUMAN REVIEW: confirm BCBS/BIS qualifies as an official regulatory/standard-setting source for DRA corpus purposes",
  ],
  notes:
    "DRA-ACQ-009 Machine-prepared official-source evidence. " +
    "BCBS Principles for Operational Resilience fetched from official BIS website. " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "Bank for International Settlements Copyright — Non-commercial Educational Use",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-009-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Publisher: Bank for International Settlements (BIS), hosting BCBS secretariat",
    "BIS website terms of use: publications may be reproduced for educational and non-commercial purposes, provided source is cited",
    "The DRA benchmark is a research/educational programme — non-commercial and educational use",
    "Analogous licence basis to DRA-DOC-0012 (PRA SS1/23, Bank of England non-commercial academic use), admitted as OPEN_LICENCE",
    "BIS is a membership organisation of central banks; its publications are routinely used in academic and regulatory research",
    "Machine pre-assessment: OPEN_LICENCE (BIS non-commercial educational use)",
    "REQUIRES HUMAN REVIEW: confirm BIS non-commercial educational licence applies to DRA benchmark use",
    "REQUIRES HUMAN REVIEW: confirm no embedded third-party content restricts reuse",
  ],
  notes:
    "DRA-ACQ-009 Machine-prepared licence evidence. " +
    "BIS/BCBS publications permitted for educational and non-commercial purposes. " +
    "A human reviewer must confirm the licence basis is compatible with the DRA benchmark programme.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Principles for Operational Resilience",
  publisher: "Basel Committee on Banking Supervision (BCBS)",
  publicationDate: "2021-03",
  domain: "FINANCE" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Second real-world FINANCE-domain document in the DRA corpus (after PRA SS1/23, DRA-DOC-0012). " +
  "First international (non-US, non-UK) publisher: Basel Committee on Banking Supervision (BCBS). " +
  "Primary evidence target: IC-3 AUTHORITY_ABSENT investigation — BCBS document cites external " +
  "regulatory frameworks (Basel III, ISO 22301, BCBS 239, FSB guidelines) as normative authorities. " +
  "If Stage 3 produces NO_IDENTIFIABLE_SOURCE for these referenced authorities, IC-3 may be exercised. " +
  "If not, the structural barrier is documented as a confirmed negative result. " +
  "HIGH difficulty: international banking regulatory standards are complex and densely cross-referenced. " +
  "Principles-based normative content with 'must/shall/should' obligation language throughout. " +
  "OPEN_LICENCE (BIS non-commercial educational use): analogous to DRA-DOC-0012. " +
  "Corpus diversity: extends FINANCE domain; adds first international regulatory body publisher.";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001 through DRA-DOC-0013)
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
    requestedBy: "DRA-ACQ-009-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const d = computeSourceDigest(acasFetch.source.rawBytes);
      const n = await normaliseContent(acasFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (PDF, live)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl: "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-009-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const d = computeSourceDigest(cmaFetch.source.rawBytes);
      const n = await normaliseContent(cmaFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0010: NIST AI RMF 1.0 (PDF, live)
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-009-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "National Institute of Standards and Technology (NIST)",
    expectedTitle: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  });
  if (nistReq.ok) {
    const nistFetch = await fetcher(nistReq.request, {});
    if (nistFetch.ok) {
      const d = computeSourceDigest(nistFetch.source.rawBytes);
      const n = await normaliseContent(nistFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0011: ICO AI and data protection guidance (multi-page HTML, 14 sections)
  const icoPageTexts: string[] = [];
  for (const slug of ICO_SECTION_SLUGS) {
    const sectionUrl = `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`;
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: sectionUrl,
      requestedBy: "DRA-ACQ-009-prep-corpus-check",
      requestedAt: PREP_TIMESTAMP,
      expectedPublisher: "Information Commissioner's Office (ICO)",
      expectedTitle: "Guidance on AI and data protection",
    });
    if (icoReq.ok) {
      const icoFetch = await fetcher(icoReq.request, {});
      if (icoFetch.ok) {
        const d = computeSourceDigest(icoFetch.source.rawBytes);
        const n = await normaliseContent(icoFetch.source.rawBytes, "text/html", d, extractPdfText);
        if (n.ok) icoPageTexts.push(n.document.text);
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
    requestedBy: "DRA-ACQ-009-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Prudential Regulation Authority (PRA), Bank of England",
    expectedTitle: "Model risk management principles for banks",
  });
  if (praReq.ok) {
    const praFetch = await fetcher(praReq.request, {});
    if (praFetch.ok) {
      const d = computeSourceDigest(praFetch.source.rawBytes);
      const n = await normaliseContent(praFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0013: FDA AI/ML SaMD Action Plan (PDF, live)
  const fdaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000015",
    sourceUrl: "https://www.fda.gov/media/145022/download",
    requestedBy: "DRA-ACQ-009-prep-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "U.S. Food and Drug Administration (FDA)",
    expectedTitle: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  });
  if (fdaReq.ok) {
    const fdaFetch = await fetcher(fdaReq.request, {});
    if (fdaFetch.ok) {
      const d = computeSourceDigest(fdaFetch.source.rawBytes);
      const n = await normaliseContent(fdaFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-009 — Controlled Acquisition Preparation for DRA-DOC-0014",
  () => {
    it(
      "prepares DRA-DOC-0014 (BCBS Principles for Operational Resilience) through eligibility check (stops before freeze)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-009 — ACQUISITION PREPARATION LOG                ║",
        );
        console.log(
          "╠══════════════════════════════════════════════════════════╣",
        );
        console.log(
          "║  CANDIDATE: BCBS Principles for Operational Resilience    ║",
        );
        console.log(
          "║  DISCOVERY: DRA-DIS-000005                                ║",
        );
        console.log(
          "║  TARGET: IC-3 AUTHORITY_ABSENT investigation; FINANCE 2   ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-009",
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
          allowHttp: false,
        });

        // ── Step 1: Acquisition request ──────────────────────────────────

        console.log("── Step 1: Acquisition Request (DRA-ACQ-000016) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000016",
          sourceUrl: BIS_PDF_URL,
          requestedBy: "DRA-ACQ-009-preparation-operator",
          requestedAt: PREP_TIMESTAMP,
          expectedPublisher: "Basel Committee on Banking Supervision (BCBS)",
          expectedTitle: "Principles for Operational Resilience",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 2: Fetch BCBS d516 PDF ───────────────────────────────────

        console.log("\n── Step 2: Fetch BCBS d516 PDF (live network) ──────────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("BIS fetch FAILED:", fetchResult.code, fetchResult.message);
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
        expect(source.rawBytes.length).toBeGreaterThan(200_000);

        // ── Step 3: Source digest verification ────────────────────────────

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
            "BCBS d516 source digest",
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
            "BCBS d516 normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          console.log("  NOTE: Update REF_TEXT_DIGEST and REF_TEXT_LENGTH if this is first run.");
          expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);

        // ── Step 6: Build existing corpus texts (DRA-DOC-0001–0013) ──────

        console.log("\n── Step 6: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  DRA-DOC-0010:      live fetch from nvlpubs.nist.gov");
        console.log("  DRA-DOC-0011:      live fetch from ico.org.uk (14 sections)");
        console.log("  DRA-DOC-0012:      live fetch from bankofengland.co.uk");
        console.log("  DRA-DOC-0013:      live fetch from fda.gov");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        expect(existingCorpusTexts.length).toBe(13);

        // ── Step 7: Freeze eligibility check ─────────────────────────────

        console.log("\n── Step 7: Freeze Eligibility (13 checks — REVIEW_REQUIRED) ─");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
          PROPOSED_METADATA,
          "DRA-DOC-0014",
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
        console.log(`  Eligible: ${eligibility.eligible}`);

        // ── Core assertions ───────────────────────────────────────────────

        // Exactly 13 checks total
        expect(eligibility.checks).toHaveLength(13);

        // 11 checks pass (all except check 4 and check 5)
        expect(passedChecks.length).toBe(11);

        // Exactly 2 blocking reasons (REVIEW_REQUIRED for official source and licence)
        expect(failedChecks.length).toBe(2);

        // Not eligible (REVIEW_REQUIRED blocks)
        expect(eligibility.eligible).toBe(false);

        // The two failing checks must be OFFICIAL_SOURCE_VERIFIED and LICENCE_VERIFIED
        const failedIds = failedChecks.map((c) => c.checkId);
        expect(failedIds).toContain("OFFICIAL_SOURCE_VERIFIED");
        expect(failedIds).toContain("LICENCE_VERIFIED");

        // No near-duplicate (BCBS Operational Resilience is unique)
        const dupCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_NEAR_DUPLICATE",
        );
        if (dupCheck) {
          console.log(`\n── Near-Duplicate Check ─────────────────────────────────────`);
          console.log(`  NOT_NEAR_DUPLICATE: ${dupCheck.passed ? "PASS ✓" : "FAIL ✗"}`);
          if (dupCheck.detail) console.log(`  detail: ${dupCheck.detail}`);
        }
        expect(dupCheck?.passed).toBe(true);

        console.log("\n── Preparation Result ────────────────────────────────────────");
        console.log("  Status: REVIEW_REQUIRED");
        console.log("  Blocking: Check 4 (OFFICIAL_SOURCE_VERIFIED) — awaiting human attestation");
        console.log("  Blocking: Check 5 (LICENCE_VERIFIED) — awaiting human attestation");
        console.log("  Next step: DRA-ACQ-009 human governance review → upgrade both to VERIFIED");
        console.log("  Freeze record: DRA-FRZ-000008 (pending)");
        console.log("  Corpus ID: DRA-DOC-0014");

        console.log("\n── Source Stability Summary ──────────────────────────────────");
        console.log(`  Stability class   : BYTE_STABLE`);
        console.log(`  Source digest     : ${sourceDigest}`);
        console.log(`  Byte length       : ${source.rawBytes.length}`);
        console.log(`  Text digest       : ${normalised.textDigest}`);
        console.log(`  Text length       : ${normalised.text.length} chars`);
        console.log(`  Norm version      : ${normalised.normalisationVersion}`);
      },
      900_000, // 15 minutes
    );
  },
);
