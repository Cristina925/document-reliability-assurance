/**
 * DRA-ACQ-007 — Controlled Acquisition Preparation for DRA-DOC-0012
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-007                             ║
 * ║                                                                          ║
 * ║  Primary candidate (REJECTED):                                           ║
 * ║    DRA-DIS-000002 — European Commission Guidelines on transparency       ║
 * ║    obligations for providers and deployers of AI systems under           ║
 * ║    Article 50 of the EU AI Act (C(2026) 5054 final, 20 July 2026)       ║
 * ║    REJECTION REASON: EC newsroom infrastructure returns                  ║
 * ║    Content-Type: "/" for document download URL. The frozen DRA           ║
 * ║    http-fetcher requires a supported media type (text/html, text/plain,  ║
 * ║    text/markdown, application/pdf) and rejects "/" at media type         ║
 * ║    validation. EUR-Lex URL patterns all return HTTP 202 (async           ║
 * ║    processing) — document indexed but format not yet served              ║
 * ║    synchronously; likely due to recency (published 2026-07-20, only      ║
 * ║    17 days before this acquisition attempt). No alternative URL with     ║
 * ║    correct Content-Type found. Stop condition: source not reproducibly   ║
 * ║    retrievable via established DRA acquisition infrastructure.           ║
 * ║                                                                          ║
 * ║  Replacement candidate:                                                  ║
 * ║    DRA-DIS-000003 — Prudential Regulation Authority (PRA), Bank of       ║
 * ║    England, Supervisory Statement SS1/23: Model risk management          ║
 * ║    principles for banks                                                  ║
 * ║                                                                          ║
 * ║  Authorised candidate                                                    ║
 * ║    Discovery ID:       DRA-DIS-000003                                    ║
 * ║    Proposed Corpus ID: DRA-DOC-0012                                      ║
 * ║    Publisher:          Prudential Regulation Authority (PRA),            ║
 * ║                        Bank of England                                   ║
 * ║    Publication:        Model risk management principles for banks        ║
 * ║    Reference:          Supervisory Statement SS1/23 (PS6/23)             ║
 * ║    Publication date:   May 2023 (effective 17 May 2024)                  ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Acquisition ID: DRA-ACQ-000014                                        ║
 * ║    Canonical PDF URL:                                                    ║
 * ║      https://www.bankofengland.co.uk/-/media/boe/files/prudential-       ║
 * ║      regulation/supervisory-statement/2023/ss123.pdf                     ║
 * ║    Landing page:                                                         ║
 * ║      https://www.bankofengland.co.uk/prudential-regulation/              ║
 * ║      publication/2023/may/model-risk-management-principles-for-banks     ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  © Bank of England 2023. BoE legal notice states: "You may download,    ║
 * ║  display or print the Resources for personal use or internal use         ║
 * ║  within an individual organisation for non-commercial purposes."         ║
 * ║  "The Bank typically grants permission for non-commercial re-use,        ║
 * ║  particularly in an academic or education context."                      ║
 * ║  The DRA benchmark corpus is academic/research use — eligible.           ║
 * ║  Machine pre-assessment: OPEN_LICENCE (non-commercial academic).         ║
 * ║  REQUIRES human attestation before freeze.                               ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256         ║
 * ║  digests. Source is BYTE_STABLE.                                         ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000006)                             ║
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
 *     6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7
 *   Text digest (SHA-256 of pdftotext output after CRLF normalisation):
 *     6e31fcdea5070cec8a57991cdcb8d116e027c701e6a7e104ac623b1ebb82f8ec
 *   Byte length: 1,096,596
 *   Text length (chars, normalised): 75,228
 *
 * This test makes live HTTPS requests to bankofengland.co.uk (PRA PDF),
 * acas.org.uk, assets.publishing.service.gov.uk, nvlpubs.nist.gov, and
 * ico.org.uk (14 sections for DRA-DOC-0011 near-duplicate check).
 * Allow 10 minutes.
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

const PREP_TIMESTAMP = "2026-08-06T12:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const PRA_PDF_URL =
  "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";

// ---------------------------------------------------------------------------
// Reference digests (preparation run 2026-08-06)
// ---------------------------------------------------------------------------

const REF_SOURCE_DIGEST =
  "6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7";
const REF_TEXT_DIGEST =
  "bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c";
const REF_BYTE_LENGTH = 1096596;
const REF_TEXT_LENGTH = 75182;

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-007-prep-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-007-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    "Publisher: Prudential Regulation Authority (PRA), Bank of England",
    "The PRA is a UK statutory regulator established by the Financial Services Act 2012; part of the Bank of England",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    `Content-Length: ${REF_BYTE_LENGTH} bytes`,
    "PDF cover page title: 'Model risk management principles for banks'",
    "PDF cover page reference: 'Supervisory statement | SS1/23'",
    "PDF cover page date: 'May 2023'",
    "PDF cover page: '© Bank of England 2023'",
    "PDF body (§1.5): 'The policy comes into effect on Friday 17 May 2024'",
    "Publication page: https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks",
    "Source stability: two independent fetches on 2026-08-06 produced identical SHA-256 digest (BYTE_STABLE)",
    "REQUIRES HUMAN REVIEW: confirm the fetched PDF is the published SS1/23 (May 2023)",
    "REQUIRES HUMAN REVIEW: confirm PRA qualifies as an official regulatory source for DRA corpus purposes",
  ],
  notes:
    "DRA-ACQ-007 Machine-prepared official-source evidence. " +
    "PRA SS1/23 fetched from official BoE website. " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "Bank of England Copyright — Non-commercial Academic Use",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-007-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "PDF copyright notice: '© Bank of England 2023'",
    "BoE legal notice (https://www.bankofengland.co.uk/legal): 'Copyright and any other rights in the contents of the Resources are owned by the Governor and Company of the Bank of England'",
    "BoE legal notice: 'You may download, display or print the Resources for personal use or internal use within an individual organisation for non-commercial purposes'",
    "BoE legal notice: 'The Bank typically grants permission for non-commercial re-use of the Resources, particularly in an academic or education context'",
    "The DRA benchmark corpus is an academic/research programme — non-commercial use",
    "Machine pre-assessment: OPEN_LICENCE (non-commercial academic use typically permitted)",
    "REQUIRES HUMAN REVIEW: confirm BoE non-commercial academic reuse permission applies to this corpus programme",
    "REQUIRES HUMAN REVIEW: confirm no embedded third-party content restricts reuse",
  ],
  notes:
    "DRA-ACQ-007 Machine-prepared licence evidence. " +
    "BoE copyright with non-commercial academic use permission. " +
    "A human reviewer must verify permission applies to the DRA corpus programme.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Model risk management principles for banks",
  publisher: "Prudential Regulation Authority (PRA), Bank of England",
  publicationDate: "2023-05-17",
  domain: "FINANCE" as const,
  documentType: "OTHER" as const,
  difficulty: "MEDIUM" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First FINANCE-domain document from a real-world regulatory publisher. " +
  "Adds the Prudential Regulation Authority (PRA) as a new institution not in corpus. " +
  "FINANCE domain: banking supervisory statement on model risk management; " +
  "distinct from all existing entries (DRA-DOC-0005 is AI_GENERATED FINANCE). " +
  "HUMAN_AUTHORED regulatory guidance with numbered principles and specific requirements. " +
  "References regulatory standards (Basel framework, CRR) that the evaluator will attempt " +
  "to trace — potential for evidence linkage patterns not yet seen in corpus. " +
  "Single-document acquisition; SS1/23 is a standalone supervisory statement.";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001 through DRA-DOC-0011)
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
    requestedBy: "DRA-ACQ-007-prep-corpus-check",
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
    requestedBy: "DRA-ACQ-007-prep-corpus-check",
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
    requestedBy: "DRA-ACQ-007-prep-corpus-check",
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
      requestedBy: "DRA-ACQ-007-prep-corpus-check",
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

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-007 — Controlled Acquisition Preparation for DRA-DOC-0012",
  () => {
    it(
      "prepares DRA-DOC-0012 (PRA SS1/23) through eligibility check (stops before freeze)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-007 — ACQUISITION PREPARATION LOG                ║",
        );
        console.log(
          "╠══════════════════════════════════════════════════════════╣",
        );
        console.log(
          "║  PRIMARY CANDIDATE (REJECTED):                            ║",
        );
        console.log(
          "║  EC Guidelines Article 50 EU AI Act — C(2026) 5054 final ║",
        );
        console.log(
          "║  REASON: Content-Type: / from newsroom URL; EUR-Lex 202   ║",
        );
        console.log(
          "║  REPLACEMENT: PRA SS1/23 — Model Risk Management         ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-007",
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

        console.log("── Step 1: Acquisition Request (DRA-ACQ-000014) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000014",
          sourceUrl: PRA_PDF_URL,
          requestedBy: "DRA-ACQ-007-preparation-operator",
          requestedAt: PREP_TIMESTAMP,
          expectedPublisher: "Prudential Regulation Authority (PRA), Bank of England",
          expectedTitle: "Model risk management principles for banks",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 2: Fetch PRA SS1/23 PDF ─────────────────────────────────

        console.log("\n── Step 2: Fetch PRA SS1/23 PDF (live network) ─────────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("PRA fetch FAILED:", fetchResult.code, fetchResult.message);
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
        expect(source.rawBytes.length).toBeGreaterThan(500_000);

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
            "PRA SS1/23 source digest",
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
            "PRA SS1/23 normalised-text digest",
          );
          console.error("\n  !! TEXT DIGEST MISMATCH !!");
          console.error("  Classification:", classification);
          console.log("  NOTE: Update REF_TEXT_DIGEST and REF_TEXT_LENGTH if this is first run.");
          expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Text digest MATCHES reference");
        expect(normalised.textDigest).toBe(REF_TEXT_DIGEST);

        // ── Step 6: Build existing corpus texts (DRA-DOC-0001–0011) ──────

        console.log("\n── Step 6: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  DRA-DOC-0010:      live fetch from nvlpubs.nist.gov");
        console.log("  DRA-DOC-0011:      live fetch from ico.org.uk (14 sections)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Total existing corpus texts:", existingCorpusTexts.length);
        expect(existingCorpusTexts.length).toBe(11);

        // ── Step 7: Freeze eligibility check ─────────────────────────────

        console.log("\n── Step 7: Freeze Eligibility (13 checks — REVIEW_REQUIRED) ─");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
          PROPOSED_METADATA,
          "DRA-DOC-0012",
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
        console.log("  proposedCorpusId    :", "DRA-DOC-0012");
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

        console.log("\n  ── Primary Candidate Rejection Record ──");
        console.log("  candidateId         : DRA-DIS-000002");
        console.log("  candidateTitle      : EC Guidelines on transparency obligations (Article 50 EU AI Act)");
        console.log("  referenceNumber     : C(2026) 5054 final, 20 July 2026");
        console.log("  rejectionReason     : TECHNICAL_RETRIEVAL_BARRIER");
        console.log("  rejectionDetail     : EC newsroom URL returns Content-Type: / (invalid); DRA http-fetcher");
        console.log("                        requires supported media type; EUR-Lex returns HTTP 202 (async");
        console.log("                        processing) for all CELEX patterns tried — document published");
        console.log("                        2026-07-20 (17 days before this attempt), not yet fully indexed.");

        console.log("\n  FREEZE RECORD WAS NOT CREATED");
        console.log("  CORPUS MANIFEST WAS NOT MUTATED");
        console.log("  EVALUATOR WAS NOT EXECUTED");
        console.log("  AWAITING HUMAN GOVERNANCE DECISIONS FOR ADMISSION");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-007 — PREPARATION COMPLETE (REVIEW_REQUIRED)     ║",
        );
        console.log(
          "║  Replacement: PRA SS1/23 ready for human governance       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      600_000, // 10 minutes
    );
  },
);
