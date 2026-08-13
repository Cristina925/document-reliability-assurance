/**
 * DRA-ACQ-006 — Controlled Corpus Admission for DRA-DOC-0011
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-006                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-006 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions received 2026-08-06; both governance         ║
 * ║  assessments upgraded to VERIFIED.                                       ║
 * ║                                                                          ║
 * ║  Document:   Guidance on AI and data protection                          ║
 * ║  Corpus ID:  DRA-DOC-0011                                                ║
 * ║  Freeze ID:  DRA-FRZ-000005                                              ║
 * ║  Discovery:  DRA-DIS-000001                                              ║
 * ║  Publisher:  Information Commissioner's Office (ICO)                     ║
 * ║  Source:     Multi-page HTML — 14 in-scope sections                      ║
 * ║  Acquisition ID: DRA-ACQ-000013                                          ║
 * ║                                                                          ║
 * ║  Canonical landing page:                                                 ║
 * ║    https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/  ║
 * ║    artificial-intelligence/guidance-on-ai-and-data-protection/           ║
 * ║                                                                          ║
 * ║  NOTE ON SOURCE FORMAT (multi-page HTML):                                ║
 * ║  No consolidated PDF exists. 14 in-scope sections fetched in canonical   ║
 * ║  nav order. Risk toolkit excluded (interactive tool, not guidance text). ║
 * ║                                                                          ║
 * ║  NOTE ON HEAD REQUESTS:                                                  ║
 * ║  ico.org.uk returns HTTP 405 for HEAD. All sections fetched via GET.     ║
 * ║                                                                          ║
 * ║  NOTE ON DYNAMIC HTML INTEGRITY (human governance record):               ║
 * ║  Raw HTML bytes are non-deterministic (Cloudflare CDN injects dynamic    ║
 * ║  content per request). Normalised text content was identical across two  ║
 * ║  independent acquisitions. Reproducibility: TEXT_STABLE.                 ║
 * ║  Canonical content digest is SHA-256 of normalised text bytes.           ║
 * ║  Raw bytes are NOT claimed to be byte-stable.                            ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch (14 pages) → normalise → combine → verify digest →              ║
 * ║    near-duplicate (DRA-DOC-0001–0010) → freeze eligibility (13/13) →     ║
 * ║    freeze record → corpus integration → consolidated 11-document         ║
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
 * DRA-ACQ-006 human governance sign-off received 2026-08-06.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values below reflect explicit human sign-off on official source provenance,
 * document identity, dynamic HTML integrity treatment, and licence suitability.
 *
 * Canonical section order (14 in-scope sections, from multipage-nav DOM):
 *   01. Landing/index page
 *   02. /whats-new/
 *   03. /about-this-guidance/
 *   04. /what-are-the-accountability-and-governance-implications-of-ai/
 *   05. /how-do-we-ensure-transparency-in-ai/
 *   06. /how-do-we-ensure-lawfulness-in-ai/
 *   07. /what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/
 *   08. /how-do-we-ensure-fairness-in-ai/
 *   09. /how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/
 *   10. /how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22.../
 *   11. /how-should-we-assess-security-and-data-minimisation-in-ai/
 *   12. /how-do-we-ensure-individual-rights-in-our-ai-systems/
 *   13. /annex-a-fairness-in-the-ai-lifecycle/
 *   14. /glossary/
 *   EXCLUDED: /ai-and-data-protection-risk-toolkit/ (interactive tool)
 *
 * Reference digests (from DRA-ACQ-006 preparation run 2026-08-06):
 *   Combined source digest (SHA-256 of normalised text bytes): b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
 *   Combined text digest (SHA-256 of combined normalised text):  b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
 *   Combined text length: 367,376 chars / 57,519 words
 *   Both digests equal because source digest is computed from normalised text bytes
 *   (raw HTML bytes are Cloudflare-dynamic and not used as canonical fingerprint).
 *
 * Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0010 (10 documents)
 *
 * This test makes live HTTPS requests to ico.org.uk, acas.org.uk,
 * assets.publishing.service.gov.uk, and nvlpubs.nist.gov. Allow 10 minutes.
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
import type { AcquiredSource } from "../fetcher.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Human governance review timestamp — decisions received 2026-08-06. */
const REVIEW_TIMESTAMP = "2026-08-06T12:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T12:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical ICO section URLs (navigation DOM order, read 2026-08-06)
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";

const SECTION_SLUGS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "/",                                                                               label: "01 — Landing/index page" },
  { slug: "/whats-new/",                                                                    label: "02 — What's new" },
  { slug: "/about-this-guidance/",                                                          label: "03 — About this guidance" },
  { slug: "/what-are-the-accountability-and-governance-implications-of-ai/",                label: "04 — Accountability and governance" },
  { slug: "/how-do-we-ensure-transparency-in-ai/",                                         label: "05 — Transparency" },
  { slug: "/how-do-we-ensure-lawfulness-in-ai/",                                           label: "06 — Lawfulness" },
  { slug: "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/",             label: "07 — Accuracy" },
  { slug: "/how-do-we-ensure-fairness-in-ai/",                                             label: "08 — Fairness" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/", label: "09 — Fairness: bias and discrimination" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/", label: "10 — Fairness: Article 22" },
  { slug: "/how-should-we-assess-security-and-data-minimisation-in-ai/",                   label: "11 — Security and data minimisation" },
  { slug: "/how-do-we-ensure-individual-rights-in-our-ai-systems/",                        label: "12 — Individual rights" },
  { slug: "/annex-a-fairness-in-the-ai-lifecycle/",                                        label: "13 — Annex A: Fairness in the AI lifecycle" },
  { slug: "/glossary/",                                                                     label: "14 — Glossary" },
];

const SECTION_URLS: ReadonlyArray<string> = SECTION_SLUGS.map(
  ({ slug }) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

const LANDING_PAGE_URL = SECTION_URLS[0]!;

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-006 preparation run (2026-08-06)
//
// Both digests equal because the canonical source digest is SHA-256 of the
// concatenated normalised text bytes (not raw HTML bytes). Raw HTML bytes
// are non-deterministic due to Cloudflare CDN dynamic injection. This design
// is explicitly recorded in the human governance decision (section 3:
// DYNAMIC HTML INTEGRITY ASSESSMENT — ACCEPTED WITH QUALIFICATION).
// ---------------------------------------------------------------------------

const REFERENCE_COMBINED_TEXT_DIGEST =
  "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";

const REFERENCE_COMBINED_SOURCE_DIGEST =
  "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";

const REFERENCE_TEXT_LENGTH = 367376;

// ---------------------------------------------------------------------------
// pdftotext extractor (for near-duplicate check PDFs)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-006-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath  = join(tmpdir(), `${id}.pdf`);
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
// Human review basis (DRA-ACQ-006 human governance sign-off, 2026-08-06):
//   Decision 1 (Official Source — VERIFIED):
//     The publication consists of 14 in-scope guidance sections retrieved from
//     the official Information Commissioner's Office domain, ico.org.uk.
//     The canonical ICO publication navigation defines the included section
//     boundary and ordering. All internal identity checks passed.
//     The separate interactive AI and data protection risk toolkit was excluded
//     because it is not part of the selected consolidated guidance publication.
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-006-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Publication fetched from https://ico.org.uk — official ICO domain (ico.org.uk)",
    "The ICO (Information Commissioner's Office) is the UK's independent supervisory authority for data protection, established by the Data Protection Act 2018 and exercising powers under the UK GDPR",
    "HTML meta DC.Publisher: 'ICO' — confirmed on all 14 section pages",
    "HTML meta DC.Date: Monday, September 22, 2025 (from about-this-guidance section)",
    "HTML meta DC.Subject: 'Guidance on AI and data protection'",
    "All 14 in-scope sections returned HTTP 200 text/html via GET from ico.org.uk",
    "No cross-domain redirects observed on any section fetch",
    "Canonical section boundary defined by ICO multipage-nav DOM element (DOM position, not CMS data-id)",
    "Internal identity checks: 10/10 PASS (title, publisher, UK GDPR, AI topic, data protection, accountability, transparency, fairness, glossary, no truncation)",
    "Excluded: /ai-and-data-protection-risk-toolkit/ — interactive JavaScript-driven tool, not a chapter of the guidance document",
    "HEAD requests return HTTP 405 (Method Not Allowed) — ICO server configuration; GET succeeds",
    "Human governance decision: OFFICIAL SOURCE — VERIFIED",
  ],
  notes:
    "DRA-ACQ-006 Human Governance Decision 1 — official source VERIFIED. " +
    "ICO is the UK statutory data protection supervisory authority. " +
    "14 in-scope sections from ico.org.uk, canonical nav order. " +
    "Risk toolkit excluded. Human sign-off received 2026-08-06. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Human review basis (DRA-ACQ-006 human governance sign-off, 2026-08-06):
//   Decision 2 (Licence — VERIFIED):
//     Licence: Open Government Licence v3.0
//     ICO website footer states: "All text content is available under the
//     Open Government Licence v3.0." Scope qualifications applied.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Open Government Licence version 3.0 (OGL v3.0)",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-006-governance-reviewer",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "ICO website footer (all 14 guidance pages): 'All text content is available under the Open Government Licence v3.0, except where otherwise stated.'",
    "OGL v3.0 URL: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    "ICO is a UK public body; OGL v3.0 is the standard licence for UK public sector information",
    "OGL v3.0 permits: copying, publishing, distributing, transmitting, adapting and exploiting the information commercially and non-commercially",
    "OGL v3.0 requires attribution: must acknowledge ICO as source and include licence URL",
    "Scope qualification: include the textual guidance content",
    "Scope qualification: retain publisher and source attribution",
    "Scope qualification: exclude ICO logos, seals, marks and branding",
    "Scope qualification: exclude images or separately credited third-party material unless independently licensed",
    "Scope qualification: preserve the official publication URLs and acquisition provenance",
    "Evaluation scope is normalised plain text; no logos, images, or separately credited third-party content included",
    "Human governance decision: LICENCE — VERIFIED",
  ],
  notes:
    "DRA-ACQ-006 Human Governance Decision 2 — licence VERIFIED. " +
    "OGL v3.0 confirmed from ICO footer on all 14 section pages. " +
    "Scope qualifications applied per human governance record. " +
    "Human sign-off received 2026-08-06. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 3 — Dynamic HTML Integrity Treatment
//
// Status: ACCEPTED WITH QUALIFICATION
//
// The raw HTML responses are not byte-identical because ico.org.uk is
// Cloudflare-fronted and injects dynamic transport-level content.
// The publication's deterministically normalised textual content was
// identical across two independent acquisitions (TEXT_STABLE).
//
// Canonical content digest:
//   b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
// Canonical text size: 367,376 characters / 57,519 words / 14 sections
//
// Do not call the raw HTTP responses byte-stable.
// Do not claim the canonical content digest represents unchanged raw HTML bytes.
// Preserve available transport metadata separately from canonical content fingerprint.
// ---------------------------------------------------------------------------

// (Recorded inline in notes fields of source assessment and licence assessment)

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Guidance on AI and data protection",
  publisher: "Information Commissioner's Office (ICO)",
  publicationDate: "2025-09-22",
  domain: "LEGAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First regulatory guidance from a UK data protection supervisory authority in the corpus. " +
  "The ICO is the statutory authority for data protection in the UK (Data Protection Act 2018); " +
  "its guidance carries regulatory weight distinguishing it from non-binding frameworks. " +
  "New publisher: ICO not previously represented in DRA-DOC-0001–0010. " +
  "LEGAL domain: adds a second LEGAL publisher (DRA-DOC-0008 is Acas employment law guidance); " +
  "ICO guidance covers AI and data protection law (UK GDPR), providing a distinct legal subdomain. " +
  "HIGH difficulty: complex cross-references to UK GDPR articles (5, 6, 9, 13, 14, 22, 25, 35), " +
  "regulatory case examples, and technical AI risk concepts interleaved with legal analysis. " +
  "HUMAN_AUTHORED source type: ICO regulatory staff; not AI-generated. " +
  "Multi-page HTML publication with 14 in-scope sections: first multi-page HTML document in corpus; " +
  "exercises normalisation of web-native regulatory content (not PDF). " +
  "OGL v3.0 licence: same licence family as existing DRA-DOC-0007 and DRA-DOC-0008.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0010 (reconstructed from admitted records)
// Mirrors the ENTRY_* constants in DRA-BMK-010 for consistent 10-doc registry.
// ---------------------------------------------------------------------------

const ENTRY_0007: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0007",
  title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en",
  generator: "The Apache Software Foundation",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html",
  sourceReference: "https://httpd.apache.org/docs/2.4/howto/auth.html",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000001. " +
    "Freeze record: DRA-FRZ-000001. " +
    "Publication date: 2026-06-19. " +
    "Version: 2.4.",
};

const ENTRY_0008: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0008",
  title: "Discipline and grievances at work: the Acas guide",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "BUSINESS",
  language: "en-GB",
  generator: "Advisory, Conciliation and Arbitration Service (Acas)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  sourceReference:
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "LOW",
  notes:
    "Acquisition ID: DRA-ACQ-000002. " +
    "Freeze record: DRA-FRZ-000002. " +
    "Source digest: a4c10388a0dcfd54… " +
    "Publication date: 2020-07.",
};

const ENTRY_0009: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0009",
  title: "AI Foundation Models: Short Version",
  sourceType: "HUMAN_AUTHORED",
  documentType: "SUMMARY",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  sourceReference:
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000008. " +
    "Freeze record: DRA-FRZ-000003. " +
    "Source digest: e7fb5008e9b407bc… " +
    "Publication date: 2023-09-18.",
};

const ENTRY_0010: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0010",
  title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en",
  generator: "National Institute of Standards and Technology (NIST)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000012. " +
    "Freeze record: DRA-FRZ-000004. " +
    "Source digest: 7576edb531d98488… " +
    "Publication date: 2023-01-26.",
};

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001–0010, all 10 admitted documents)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)
  for (const entry of BENCHMARK_CORPUS) {
    const bytes  = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007: Apache HTTP Server guide (fixture, no network)
  const apacheBytes  = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008: Acas guide (live fetch)
  // NOTE: content changed since admission (DRA-BMK-010 §19.1: 89,713→164,726 chars).
  // Current live content used for near-duplicate similarity assessment.
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-006-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const acasDigest = computeSourceDigest(acasFetch.source.rawBytes);
      const acasNorm   = await normaliseContent(
        acasFetch.source.rawBytes, "application/pdf", acasDigest, extractPdfText,
      );
      if (acasNorm.ok) texts.push(acasNorm.document.text);
    }
  }

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (live fetch)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl:
      "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-006-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const cmaDigest = computeSourceDigest(cmaFetch.source.rawBytes);
      const cmaNorm   = await normaliseContent(
        cmaFetch.source.rawBytes, "application/pdf", cmaDigest, extractPdfText,
      );
      if (cmaNorm.ok) texts.push(cmaNorm.document.text);
    }
  }

  // DRA-DOC-0010: NIST AI RMF 1.0 (live fetch)
  // NOTE: nvlpubs.nist.gov returns 404 for HEAD; GET returns 200 (known behaviour).
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-006-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "National Institute of Standards and Technology (NIST)",
    expectedTitle: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  });
  if (nistReq.ok) {
    const nistFetch = await fetcher(nistReq.request, {});
    if (nistFetch.ok) {
      const nistDigest = computeSourceDigest(nistFetch.source.rawBytes);
      const nistNorm   = await normaliseContent(
        nistFetch.source.rawBytes, "application/pdf", nistDigest, extractPdfText,
      );
      if (nistNorm.ok) texts.push(nistNorm.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-006 — Controlled Corpus Admission for DRA-DOC-0011 (ICO AI and Data Protection Guidance)",
  () => {
    it(
      "admits DRA-DOC-0011 (ICO AI and data protection guidance, 14-page HTML) through eligibility, " +
        "freeze, and consolidated 11-document corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-006 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Step 1: Setup — build 10-document registry ─────────────────────

        console.log("── Step 1: Setup — Build 10-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        // DRA-DOC-0001–0006: initial-corpus governance
        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        // DRA-DOC-0007–0010: freeze-record governance
        registry.add(ENTRY_0007);
        registry.add(ENTRY_0008);
        registry.add(ENTRY_0009);
        registry.add(ENTRY_0010);

        console.log(`  10-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(10);
        expect(registry.hasId("DRA-DOC-0011")).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-006",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY",
            "PROCEDURE", "ARTICLE", "OTHER",
          ],
        });

        const fetcher = createHttpFetcher({
          timeoutMs:    60_000,
          maxRedirects: 5,
          maxBytes:     15_000_000,
          userAgent:    "DRA-ENG-010/1.0",
        });

        // ── Step 2: Fetch all 14 ICO section pages ────────────────────────

        console.log("\n── Step 2: Fetch All 14 In-Scope Section Pages ─────────────");
        console.log(`  NOTE: ico.org.uk returns HTTP 405 for HEAD; using GET`);
        console.log(`  NOTE: Cloudflare CDN injects dynamic content into raw HTML`);
        console.log(`        Text digest is canonical; raw bytes are not byte-stable.`);

        const sectionBytes: Uint8Array[] = [];
        const sectionFinalUrls: string[] = [];
        let firstRetrievedAt = "";

        for (let i = 0; i < SECTION_URLS.length; i++) {
          const url   = SECTION_URLS[i]!;
          const label = SECTION_SLUGS[i]!.label;

          const reqResult = createAcquisitionRequest({
            acquisitionId: "DRA-ACQ-000013",
            sourceUrl:     url,
            requestedBy:   "DRA-ACQ-006-admission-operator",
            requestedAt:   FREEZE_TIMESTAMP,
            expectedPublisher: "Information Commissioner's Office (ICO)",
            expectedTitle:     "Guidance on AI and data protection",
          });

          expect(reqResult.ok).toBe(true);
          if (!reqResult.ok) return;

          const fetchResult = await fetcher(reqResult.request, {});

          if (!fetchResult.ok) {
            console.error(`  !! Fetch FAILED for ${label}: ${fetchResult.code} — ${fetchResult.message}`);
            expect(fetchResult.ok).toBe(true);
            return;
          }

          const src = fetchResult.source;
          if (i === 0) firstRetrievedAt = src.retrievedAt;

          console.log(`  ${label}: ${src.httpStatus} ${src.mediaType} — ${src.rawBytes.length} bytes`);

          expect(src.httpStatus).toBe(200);
          expect(src.mediaType).toBe("text/html");
          expect(src.rawBytes.length).toBeGreaterThan(0);

          sectionBytes.push(src.rawBytes);
          sectionFinalUrls.push(src.finalUrl);
        }

        expect(sectionBytes).toHaveLength(SECTION_URLS.length);
        console.log(`\n  ✓ All ${sectionBytes.length} sections fetched successfully`);

        // ── Step 3: Normalise each section (HTML → text) ──────────────────

        console.log("\n── Step 3: Normalise Each Section (HTML → plain text) ──────");

        const pageTexts: string[] = [];

        for (let i = 0; i < sectionBytes.length; i++) {
          const bytes  = sectionBytes[i]!;
          const digest = computeSourceDigest(bytes);
          const normResult = await normaliseContent(bytes, "text/html", digest);

          if (!normResult.ok) {
            console.error(`  !! Normalisation FAILED for section ${i + 1}: ${normResult.code}`);
            expect(normResult.ok).toBe(true);
            return;
          }

          expect(normResult.document.text.trim().length).toBeGreaterThan(100);
          pageTexts.push(normResult.document.text);
        }

        expect(pageTexts).toHaveLength(SECTION_URLS.length);
        console.log(`  ✓ All ${pageTexts.length} sections normalised`);

        // ── Step 4: Build combined text and compute canonical digests ──────

        console.log(
          "\n── Step 4: Combined Text and Canonical Digest ───────────────",
        );

        const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";
        const combinedText = pageTexts.join(SECTION_SEPARATOR);
        const encoder      = new TextEncoder();
        const textBytes    = encoder.encode(combinedText);

        // Canonical source digest: SHA-256 of normalised text bytes.
        // Per human governance decision 3: raw HTML bytes are not byte-stable;
        // the canonical content fingerprint is derived from normalised text bytes.
        const combinedSourceDigest = computeSourceDigest(textBytes);

        // Combined NormalisedDocument via text/plain path.
        const combinedNormResult = await normaliseContent(
          textBytes, "text/plain", combinedSourceDigest,
        );

        expect(combinedNormResult.ok).toBe(true);
        if (!combinedNormResult.ok) return;

        const combinedNormalised = combinedNormResult.document;
        const wordCount = combinedNormalised.text.split(/\s+/).filter(Boolean).length;

        const totalRawBytes = sectionBytes.reduce((sum, b) => sum + b.length, 0);

        console.log("  combinedSourceDigest:", combinedSourceDigest);
        console.log("  combinedTextDigest  :", combinedNormalised.textDigest);
        console.log("  combinedTextLength  :", combinedNormalised.text.length, "chars");
        console.log("  combinedWordCount   :", wordCount);
        console.log("  totalRawBytes       :", totalRawBytes, "(non-deterministic; informational only)");

        expect(combinedNormalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(combinedNormalised.text.trim().length).toBeGreaterThan(10_000);
        expect(combinedSourceDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(combinedNormalised.textDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 5: Canonical text digest verification ────────────────────

        console.log(
          "\n── Step 5: Canonical Text Digest Verification ───────────────",
        );

        console.log("  reference text digest:", REFERENCE_COMBINED_TEXT_DIGEST);
        console.log("  current text digest  :", combinedNormalised.textDigest);
        console.log("  reference text length:", REFERENCE_TEXT_LENGTH, "chars");
        console.log("  current text length  :", combinedNormalised.text.length, "chars");

        if (combinedNormalised.textDigest !== REFERENCE_COMBINED_TEXT_DIGEST) {
          console.error("\n  !! TEXT DIGEST MISMATCH — STOP BEFORE FREEZE !!");
          console.error("  Possible causes:");
          console.error("    - ICO publication updated since preparation run (2026-08-06)");
          console.error("    - Section boundary changed");
          console.error("    - Normalisation pipeline changed");
          console.error("  Do not proceed with admission without governance assessment.");
          expect(combinedNormalised.textDigest).toBe(REFERENCE_COMBINED_TEXT_DIGEST);
          return;
        }

        console.log("  ✓ Canonical text digest MATCHES reference");
        expect(combinedNormalised.textDigest).toBe(REFERENCE_COMBINED_TEXT_DIGEST);
        expect(combinedSourceDigest).toBe(REFERENCE_COMBINED_SOURCE_DIGEST);

        // ── Step 6: Create synthetic AcquiredSource ───────────────────────

        console.log(
          "\n── Step 6: Synthetic AcquiredSource (multi-page combined) ──",
        );

        const syntheticSource: AcquiredSource = Object.freeze({
          acquisitionId: "DRA-ACQ-000013",
          requestedUrl:  LANDING_PAGE_URL,
          finalUrl:      sectionFinalUrls[0] ?? LANDING_PAGE_URL,
          mediaType:     "text/html",
          rawBytes:      textBytes,       // normalised text bytes — deterministic
          retrievedAt:   firstRetrievedAt,
          httpStatus:    200,
          redirects:     [] as readonly string[],
          httpResponseHeaders: undefined, // per-page headers not applicable to synthetic combined source
        });

        console.log("  acquisitionId:", syntheticSource.acquisitionId);
        console.log("  finalUrl     :", syntheticSource.finalUrl);
        console.log("  httpStatus   :", syntheticSource.httpStatus);
        console.log("  mediaType    :", syntheticSource.mediaType);

        expect(syntheticSource.httpStatus).toBe(200);

        // ── Step 7: Build existing corpus texts (DRA-DOC-0001–0010) ──────

        console.log(
          "\n── Step 7: Build Existing Corpus Texts for Near-Duplicate Check ─",
        );
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture (no network)");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  DRA-DOC-0010:      live fetch from nvlpubs.nist.gov");
        console.log("  NOTE: DRA-DOC-0008 content changed since admission (DRA-BMK-010); current content used.");
        console.log("  NOTE: nvlpubs.nist.gov returns 404 for HEAD; GET returns 200 (known behaviour).");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log(`  Total existing corpus texts built: ${existingCorpusTexts.length} / 10`);
        if (existingCorpusTexts.length !== 10) {
          console.warn(
            `  WARNING: Expected 10 existing corpus texts; got ${existingCorpusTexts.length}. ` +
            "Near-duplicate check may be partial.",
          );
        }
        expect(existingCorpusTexts.length).toBe(10);

        // ── Step 8: Freeze eligibility (13/13 must pass) ──────────────────

        console.log(
          "\n── Step 8: Freeze Eligibility (13 checks — all must pass) ──",
        );

        const eligibility = checkFreezeEligibility(
          syntheticSource,
          combinedNormalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0011",
          INCLUSION_RATIONALE,
          registry,         // 10-document registry — DRA-DOC-0011 not present
          protocol,
          existingCorpusTexts,
        );

        console.log("");
        for (const check of eligibility.checks) {
          const icon   = check.passed ? "✓" : "✗";
          const status = check.passed ? "PASS" : "FAIL";
          console.log(`  ${icon} [${status}] ${check.checkId}`);
          if (check.detail) console.log(`        detail: ${check.detail}`);
        }

        if (!eligibility.eligible) {
          const result = eligibility as { blockingReasons: readonly string[] };
          console.error("\n  ELIGIBILITY FAILED — blocking reasons:");
          for (const reason of result.blockingReasons) {
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

        // ── Step 10: Create freeze record (DRA-FRZ-000005) ────────────────

        console.log(
          "\n── Step 10: Create Freeze Record (DRA-FRZ-000005) ─────────",
        );

        // sourceUrl = landing page URL (canonical primary URL for this multi-page acquisition).
        // The 14 section URLs are recorded in the acquisition evidence and governance records.
        // freezeRecord.sourceUrl represents the entry-point URL of the publication.
        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId:   "DRA-FRZ-000005",
          corpusDocumentId: "DRA-DOC-0011",
          acquisitionId:    "DRA-ACQ-000013",
          sourceUrl:        LANDING_PAGE_URL,
          finalUrl:         sectionFinalUrls[0] ?? LANDING_PAGE_URL,
          sourceDigest:     combinedSourceDigest,
          normalised:       combinedNormalised,
          metadataDigest,
          frozenBy:         "DRA-ACQ-006-freeze-operator",
          benchmarkVersion: CORPUS_VERSION,
          fixedTimestamp:   FREEZE_TIMESTAMP,
        });

        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  sourceUrl            :", freezeRecord.sourceUrl);
        console.log("  finalUrl             :", freezeRecord.finalUrl);
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
          freezeRecord.sourceDigest === REFERENCE_COMBINED_SOURCE_DIGEST ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  textDigest matches reference       :",
          freezeRecord.normalisedTextDigest === REFERENCE_COMBINED_TEXT_DIGEST ? "PASS ✓" : "FAIL ✗",
        );

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000005");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0011");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-006-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe(CORPUS_VERSION);
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_COMBINED_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_COMBINED_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 12: Corpus integration — register DRA-DOC-0011 ──────────

        console.log(
          "\n── Step 12: Corpus Integration (DRA-DOC-0011 → 11-document corpus) ─",
        );

        const integrationResult = integrateWithCorpus(
          freezeRecord,
          APPROVED_METADATA,
          registry, // now contains all 10 existing docs → becomes 11
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
        console.log("  documentIds    :", manifest.documentIds.join(", "));

        expect(integrationResult.ok).toBe(true);
        expect(manifest.documentCount).toBe(11);
        expect(manifest.overallDigest).toBeTruthy();
        expect(manifestDigest).toBe(manifest.overallDigest);

        // ── Step 13: Consolidated manifest integrity verification ──────────

        console.log(
          "\n── Step 13: Consolidated 11-Document Manifest Integrity ────",
        );

        const manifestIntact    = verifyManifestIntegrity(manifest);
        const registryHasDoc    = registry.hasId("DRA-DOC-0011");
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        const listedDocs    = registry.list();
        const idSet         = new Set(listedDocs.map((d) => d.corpusId));
        const allUnique     = idSet.size === 11;
        const expectedIds   = [
          "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
          "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
          "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011",
        ];
        const idsMatchOrder = manifest.documentIds.every(
          (id, i) => id === expectedIds[i],
        );

        console.log(
          "  DRA-DOC-0011 in registry       :",
          registryHasDoc ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest integrity (hash check):",
          manifestIntact ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest digest round-trips    :",
          manifestRoundTrip ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  document count = 11            :",
          manifest.documentCount === 11 ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  all 11 IDs unique              :",
          allUnique ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  ID order correct               :",
          idsMatchOrder ? "PASS ✓" : "FAIL ✗",
        );

        console.log("\n  Ordered corpus IDs:");
        for (let i = 0; i < listedDocs.length; i++) {
          const doc = listedDocs[i]!;
          const ok  = doc.corpusId === expectedIds[i];
          console.log(`    [${i + 1}] ${ok ? "✓" : "✗"} ${doc.corpusId}`);
          expect(doc.corpusId).toBe(expectedIds[i]);
        }

        expect(registryHasDoc).toBe(true);
        expect(manifestIntact).toBe(true);
        expect(manifestRoundTrip).toBe(true);
        expect(manifest.documentCount).toBe(11);
        expect(allUnique).toBe(true);
        expect(idsMatchOrder).toBe(true);

        // ── Step 14: Near-duplicate and corpus-ID results ─────────────────

        console.log("\n── Step 14: Near-Duplicate and Corpus-ID Check Results ─────");

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
          "  Near-duplicate scope : 10 texts (DRA-DOC-0001 through DRA-DOC-0010)",
        );

        expect(nearDupCheck?.passed).toBe(true);
        expect(dupIdCheck?.passed).toBe(true);

        // ── Admission summary ──────────────────────────────────────────────

        console.log("\n── Admission Summary ───────────────────────────────────────");
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  discoveryId          : DRA-DIS-000001");
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  title                :", APPROVED_METADATA.title);
        console.log("  publisher            :", APPROVED_METADATA.publisher);
        console.log("  publicationDate      :", APPROVED_METADATA.publicationDate);
        console.log("  domain               :", APPROVED_METADATA.domain);
        console.log("  documentType         :", APPROVED_METADATA.documentType);
        console.log("  difficulty           :", APPROVED_METADATA.difficulty);
        console.log("  language             :", APPROVED_METADATA.language);
        console.log("  sourceFormat         : Multi-page HTML (14 sections, 1 excluded)");
        console.log("  canonicalSourceUrl   :", LANDING_PAGE_URL);
        console.log("  sectionsAcquired     : 14");
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  combinedTextLength   :", combinedNormalised.text.length, "chars");
        console.log("  combinedWordCount    :", wordCount);
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
        console.log("  dynamicHtmlIntegrity : ACCEPTED WITH QUALIFICATION (TEXT_STABLE)");
        console.log("  reproducibility      : TEXT_STABLE");
        console.log("  ─── Near-Duplicate ───");
        console.log("  scope  : DRA-DOC-0001 through DRA-DOC-0010 (10 documents)");
        console.log("  result : NO_NEAR_DUPLICATE — PASS ✓");
        console.log("  ─── Corpus ───");
        console.log("  priorCorpusSize  : 10");
        console.log("  admittedDocCount : 11");
        console.log("  corpusVersion    :", CORPUS_VERSION);

        console.log("\n  ─── Evidence Contribution ───");
        console.log("  newPublisher               : YES — ICO (not previously represented)");
        console.log("  regulatoryGuidance         : YES — UK statutory supervisory authority guidance");
        console.log("  documentTypeContribution   : OTHER (regulatory guidance; schema has no GUIDANCE type)");
        console.log("  domainContribution         : LEGAL (second LEGAL publisher after Acas)");
        console.log("  multiPageHtmlContribution  : YES — first multi-page HTML document in corpus");
        console.log("  authorityComplexity        : HIGH — cross-refs to UK GDPR arts. 5,6,9,13,14,22,25,35; DPA 2018; ICO decisions");
        console.log("  documentSizeContribution   : 367,376 chars / 57,519 words — mid-range for corpus");
        console.log("  licenceContribution        : OGL v3.0 — same family as DRA-DOC-0007/0008; no new licence type");
        console.log("  corpusDiversityContribution: new publisher, new format, new regulatory domain");
        console.log("  issueClassCoverage         : NOT CLAIMED — evaluator not run");
        console.log("  decisionCoverage           : NOT CLAIMED — evaluator not run");

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0010: NOT MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-006 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0011 ADMITTED AND FROZEN (DRA-FRZ-000005)        ║",
        );
        console.log(
          "║  CONSOLIDATED CORPUS: 11 DOCUMENTS                        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      600_000, // 10-minute timeout (14 ICO pages + 3 live PDFs + normalisation)
    );
  },
);
