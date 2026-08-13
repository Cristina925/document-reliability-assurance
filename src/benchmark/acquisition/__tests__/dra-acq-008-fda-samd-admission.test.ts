/**
 * DRA-ACQ-008 — Controlled Corpus Admission for DRA-DOC-0013
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-008                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-008 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions received 2026-08-06; both governance         ║
 * ║  assessments upgraded to VERIFIED.                                       ║
 * ║                                                                          ║
 * ║  Document:   AI/ML-Based Software as a Medical Device (SaMD) Action Plan ║
 * ║  Corpus ID:  DRA-DOC-0013                                                ║
 * ║  Freeze ID:  DRA-FRZ-000007                                              ║
 * ║  Discovery:  DRA-DIS-000004                                              ║
 * ║  Acquisition ID: DRA-ACQ-000015                                          ║
 * ║  Publisher:  U.S. Food and Drug Administration (FDA)                     ║
 * ║  Source:     PDF — single document                                       ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.fda.gov/media/145022/download                             ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  U.S. government work in the public domain (17 U.S.C. § 105).           ║
 * ║  FDA AI/ML SaMD Action Plan authored entirely by federal employees       ║
 * ║  as part of official duties. No embedded third-party restrictions        ║
 * ║  identified. Same statutory basis as DRA-DOC-0010 (NIST AI RMF 1.0).   ║
 * ║  Human governance confirms PUBLIC_DOMAIN status.                         ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256.       ║
 * ║  Source is BYTE_STABLE.                                                  ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch → normalise → verify digest → near-duplicate                    ║
 * ║    (DRA-DOC-0001–0012) → freeze eligibility (13/13) →                   ║
 * ║    freeze record (DRA-FRZ-000007) → corpus integration →                 ║
 * ║    consolidated 13-document manifest integrity verification              ║
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
 * DRA-ACQ-008 human governance sign-off received 2026-08-06.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values below reflect explicit human sign-off on source provenance,
 * document identity, stability, and licence suitability.
 *
 * Reference digests (from DRA-ACQ-008 preparation run 2026-08-06):
 *   Source digest: 83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a
 *   Text digest:   f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186
 *   Byte length: 764,505
 *   Text length (chars): 24,390
 *
 * Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0012 (12 documents)
 *
 * This test makes live HTTPS requests to fda.gov, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, ico.org.uk
 * (14 sections), and bankofengland.co.uk. Allow 12 minutes.
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
import type { CorpusDocumentInput } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Human governance review timestamp — decisions received 2026-08-06. */
const REVIEW_TIMESTAMP = "2026-08-06T15:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T15:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const FDA_PDF_URL = "https://www.fda.gov/media/145022/download";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-008 preparation run (2026-08-06)
// ---------------------------------------------------------------------------

const REFERENCE_SOURCE_DIGEST =
  "83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a";
const REFERENCE_TEXT_DIGEST =
  "f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186";
const REFERENCE_TEXT_LENGTH = 24390;

// ---------------------------------------------------------------------------
// ICO section URLs for DRA-DOC-0011 near-duplicate check
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

const ICO_SECTION_URLS = SECTION_SLUGS.map(
  ({ slug }) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext extractor
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-008-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Human Governance Decision 1 — Official Source Verification
//
// Status: VERIFIED
//
// Evidence reviewed 2026-08-06:
//   - Document fetched from fda.gov (official FDA website)
//   - Publisher confirmed as U.S. Food and Drug Administration, a federal
//     regulatory agency of the U.S. Department of Health and Human Services
//   - PDF title page: "Artificial Intelligence/Machine Learning (AI/ML)-Based
//     Software as a Medical Device (SaMD) Action Plan", January 2021
//   - Source BYTE_STABLE: two independent fetches produced identical SHA-256
//   - FDA confirmed as an official regulatory source for DRA corpus
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-008-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.fda.gov/media/145022/download",
    "Publisher: U.S. Food and Drug Administration (FDA), U.S. Department of Health and Human Services",
    "The FDA is a US federal regulatory agency with statutory authority under the Federal Food, Drug, and Cosmetic Act",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    "Source stability: BYTE_STABLE — two independent fetches (2026-08-06) produced identical SHA-256",
    `Source digest confirmed: ${REFERENCE_SOURCE_DIGEST}`,
    "PDF title: 'Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan'",
    "PDF publication: January 2021",
    "Landing page verified: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
    "Publication confirmed as official FDA action plan (not draft or consultation)",
    "HUMAN GOVERNANCE DECISION: FDA confirmed as official regulatory source for DRA corpus — VERIFIED",
  ],
  notes:
    "DRA-ACQ-008 human governance sign-off 2026-08-06. " +
    "FDA AI/ML SaMD Action Plan official source VERIFIED. " +
    "Byte-stable PDF from fda.gov.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Licence basis:
//   U.S. government work in the public domain under 17 U.S.C. § 105.
//   FDA is a federal agency; this document was authored by FDA employees as
//   part of their official duties. No embedded third-party material found.
//   Same statutory basis as DRA-DOC-0010 (NIST AI RMF 1.0), previously
//   admitted. The DRA benchmark corpus is a research programme; public domain
//   works are unconditionally compatible.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "US Government Work — Public Domain (17 U.S.C. § 105)",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-008-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Publisher: U.S. Food and Drug Administration (FDA), a federal agency of the United States",
    "17 U.S.C. § 105: 'Copyright protection under this title is not available for any work of the United States Government'",
    "FDA AI/ML SaMD Action Plan authored by FDA staff as part of official regulatory duties",
    "No embedded third-party material identified that would restrict reuse",
    "Same statutory basis as DRA-DOC-0010 (NIST AI RMF 1.0), previously admitted as PUBLIC_DOMAIN",
    "Public domain works are unconditionally compatible with any research or commercial use",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN status confirmed — VERIFIED",
  ],
  notes:
    "DRA-ACQ-008 human governance sign-off 2026-08-06. " +
    "US Government Work — PUBLIC_DOMAIN (17 U.S.C. § 105) VERIFIED.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
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
// Corpus entries for DRA-DOC-0007–0012 (reconstructed from admitted records)
// Mirrors the ENTRY_* constants in DRA-BMK-012 for consistent 12-doc registry.
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

const ENTRY_0011: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0011",
  title: "Guidance on AI and data protection",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "LEGAL",
  language: "en",
  generator: "Information Commissioner's Office (ICO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (multi-page HTML, 14 sections) from " +
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  sourceReference:
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000013. " +
    "Freeze record: DRA-FRZ-000005. " +
    "Source digest: b3b98f13548c165a… " +
    "Multi-page HTML; 14 sections; TEXT_STABLE. " +
    "Publication date: 2025-09-22.",
};

const ENTRY_0012: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0012",
  title: "Model risk management principles for banks",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "FINANCE",
  language: "en",
  generator: "Prudential Regulation Authority (PRA), Bank of England",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
  sourceReference:
    "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000014. " +
    "Freeze record: DRA-FRZ-000006. " +
    "Source digest: 6165a8ba699e9c7f… " +
    "Publication date: 2023-05-17.",
};

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001–0012, all 12 admitted documents)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)
  for (const entry of BENCHMARK_CORPUS) {
    const bytes = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007: Apache HTTP Server guide (fixture, no network)
  const apacheBytes = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008: Acas guide (live fetch)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-008-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
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

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (live fetch)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl:
      "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-008-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
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

  // DRA-DOC-0010: NIST AI RMF 1.0 (live fetch)
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-008-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
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
  for (const url of ICO_SECTION_URLS) {
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: url,
      requestedBy: "DRA-ACQ-008-admission-corpus-check",
      requestedAt: FREEZE_TIMESTAMP,
      expectedPublisher: "Information Commissioner's Office (ICO)",
      expectedTitle: "Guidance on AI and data protection",
    });
    if (icoReq.ok) {
      const icoFetch = await fetcher(icoReq.request, {});
      if (icoFetch.ok) {
        const d = computeSourceDigest(icoFetch.source.rawBytes);
        const n = await normaliseContent(icoFetch.source.rawBytes, "text/html", d);
        if (n.ok) icoPageTexts.push(n.document.text);
      }
    }
  }
  if (icoPageTexts.length > 0) {
    const combined = icoPageTexts.join(SECTION_SEPARATOR);
    const combinedBytes = encoder.encode(combined);
    const combinedDigest = computeSourceDigest(combinedBytes);
    const combinedNorm = await normaliseContent(combinedBytes, "text/plain", combinedDigest);
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  // DRA-DOC-0012: PRA SS1/23 Model Risk Management (live fetch)
  const praReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000014",
    sourceUrl:
      "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    requestedBy: "DRA-ACQ-008-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
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

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-008 — Controlled Corpus Admission for DRA-DOC-0013 (FDA AI/ML SaMD Action Plan)",
  () => {
    it(
      "admits DRA-DOC-0013 (FDA AI/ML SaMD, PDF) through eligibility, " +
        "freeze, and consolidated 13-document corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-008 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Step 1: Setup — build 12-document registry ─────────────────────

        console.log("── Step 1: Setup — Build 12-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        // DRA-DOC-0001–0006: initial-corpus governance
        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        // DRA-DOC-0007–0012: freeze-record governance
        registry.add(ENTRY_0007);
        registry.add(ENTRY_0008);
        registry.add(ENTRY_0009);
        registry.add(ENTRY_0010);
        registry.add(ENTRY_0011);
        registry.add(ENTRY_0012);

        console.log(`  12-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(12);
        expect(registry.hasId("DRA-DOC-0013")).toBe(false);

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

        // ── Step 2: Acquisition request ────────────────────────────────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000015) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000015",
          sourceUrl: FDA_PDF_URL,
          requestedBy: "DRA-ACQ-008-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "U.S. Food and Drug Administration (FDA)",
          expectedTitle: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        // ── Step 3: Fetch FDA AI/ML SaMD PDF ────────────────────────────────

        console.log("\n── Step 3: Fetch FDA AI/ML SaMD PDF (live network) ─────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("FDA fetch FAILED:", fetchResult.code, fetchResult.message);
        }
        expect(fetchResult.ok).toBe(true);
        if (!fetchResult.ok) return;

        const source = fetchResult.source;

        console.log("  httpStatus      :", source.httpStatus);
        console.log("  mediaType       :", source.mediaType);
        console.log("  rawByteLength   :", source.rawBytes.length);
        console.log("  finalUrl        :", source.finalUrl);

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");

        // ── Step 4: Source digest verification ─────────────────────────────

        console.log("\n── Step 4: Source Digest Verification ──────────────────────");

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log("  reference :", REFERENCE_SOURCE_DIGEST);
        console.log("  current   :", sourceDigest);

        if (sourceDigest !== REFERENCE_SOURCE_DIGEST) {
          console.error("SOURCE DIGEST MISMATCH — source has changed since preparation. Stop.");
        }
        expect(sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(source.rawBytes.length).toBe(764505);

        console.log("  ✓ Source digest matches reference — BYTE_STABLE confirmed");

        // ── Step 5: Normalisation ───────────────────────────────────────────

        console.log("\n── Step 5: Normalisation (pdftotext) ───────────────────────");

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

        expect(normalised.text.length).toBe(REFERENCE_TEXT_LENGTH);

        // ── Step 6: Text digest verification ───────────────────────────────

        console.log("\n── Step 6: Text Digest Verification ────────────────────────");
        console.log("  reference :", REFERENCE_TEXT_DIGEST);
        console.log("  current   :", normalised.textDigest);

        if (normalised.textDigest !== REFERENCE_TEXT_DIGEST) {
          console.error("TEXT DIGEST MISMATCH — normalisation differs from preparation. Stop.");
        }
        expect(normalised.textDigest).toBe(REFERENCE_TEXT_DIGEST);

        console.log("  ✓ Text digest matches preparation reference");

        // ── Step 7: Build existing corpus texts (DRA-DOC-0001–0012) ────────

        console.log("\n── Step 7: Build Existing Corpus Texts (DRA-DOC-0001–0012) ─");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Existing corpus texts built:", existingCorpusTexts.length, "of 12");
        expect(existingCorpusTexts.length).toBe(12);

        // ── Step 8: Freeze eligibility check (all 13 must pass) ────────────

        console.log(
          "\n── Step 8: Freeze Eligibility (13 checks — all must PASS) ──",
        );

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
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

        // ── Step 10: Create freeze record (DRA-FRZ-000007) ─────────────────

        console.log(
          "\n── Step 10: Create Freeze Record (DRA-FRZ-000007) ──────────",
        );

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000007",
          corpusDocumentId: "DRA-DOC-0013",
          acquisitionId: request.acquisitionId,
          sourceUrl: request.sourceUrl,
          finalUrl: source.finalUrl,
          sourceDigest,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-008-freeze-operator",
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

        // ── Step 11: Verify freeze record integrity ──────────────────────

        console.log("\n── Step 11: Freeze Record Integrity ────────────────────────");

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

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000007");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0013");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-008-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe("DRA-CORPUS-1.0.0");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 12: Corpus integration — register DRA-DOC-0013 ──────────

        console.log(
          "\n── Step 12: Corpus Integration (register DRA-DOC-0013) ────",
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
        expect(manifest.documentCount).toBe(13);
        expect(manifest.overallDigest).toBeTruthy();
        expect(manifestDigest).toBe(manifest.overallDigest);

        // ── Step 13: Registry and manifest integrity verification ─────────

        console.log(
          "\n── Step 13: Registry and Manifest Integrity Verification ───",
        );

        const registryHasDoc = registry.hasId("DRA-DOC-0013");
        const manifestIntact = verifyManifestIntegrity(manifest);
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        console.log(
          "  DRA-DOC-0013 in registry        :",
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
          "  13-document count (12+1)        :",
          manifest.documentCount === 13 ? "PASS ✓" : "FAIL ✗",
        );

        expect(registryHasDoc).toBe(true);
        expect(manifestIntact).toBe(true);
        expect(manifestRoundTrip).toBe(true);
        expect(manifest.documentCount).toBe(13);

        // ── Step 14: Near-duplicate and corpus-ID results ─────────────────

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
        console.log(
          "  Near-duplicate scope : 12 texts (DRA-DOC-0001 through DRA-DOC-0012)",
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
        console.log("  scope          : DRA-DOC-0001 through DRA-DOC-0012 (12 documents)");
        console.log("  result         : NO_NEAR_DUPLICATE — PASS ✓");
        console.log("  ─── Domain Coverage ───");
        console.log("  domain         : HEALTHCARE (first document in this domain)");
        console.log("  targetIssueClasses : IC-3 AUTHORITY_ABSENT, IC-9 SCOPE_VIOLATION");

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0012: NOT MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-008 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0013 ADMITTED AND FROZEN (DRA-FRZ-000007)        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      720_000, // 12 minutes
    );
  },
);
