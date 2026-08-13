/**
 * DRA-ACQ-009 — Controlled Corpus Admission for DRA-DOC-0014
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-009                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-009 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions received 2026-08-06; both governance         ║
 * ║  assessments upgraded to VERIFIED.                                       ║
 * ║                                                                          ║
 * ║  Document:   Principles for Operational Resilience                       ║
 * ║  Corpus ID:  DRA-DOC-0014                                                ║
 * ║  Freeze ID:  DRA-FRZ-000008                                              ║
 * ║  Discovery:  DRA-DIS-000005                                              ║
 * ║  Acquisition ID: DRA-ACQ-000016                                          ║
 * ║  Publisher:  Basel Committee on Banking Supervision (BCBS)               ║
 * ║  Source:     PDF — single document (d516, March 2021)                    ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.bis.org/bcbs/publ/d516.pdf                               ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  BIS publications may be reproduced for educational and non-commercial   ║
 * ║  purposes with source citation. The DRA benchmark is an educational and  ║
 * ║  research programme — non-commercial. Licence basis: OPEN_LICENCE.      ║
 * ║  Analogous to DRA-DOC-0012 (PRA SS1/23, Bank of England non-commercial  ║
 * ║  academic use). Human governance confirms OPEN_LICENCE status.           ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256.       ║
 * ║  Source is BYTE_STABLE.                                                  ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch → normalise → verify digest → near-duplicate                    ║
 * ║    (DRA-DOC-0001–0013) → freeze eligibility (13/13) →                   ║
 * ║    freeze record (DRA-FRZ-000008) → corpus integration →                 ║
 * ║    consolidated 14-document manifest integrity verification              ║
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
 * DRA-ACQ-009 human governance sign-off received 2026-08-06.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values below reflect explicit human sign-off on source provenance,
 * document identity, stability, and licence suitability.
 *
 * Reference digests (from DRA-ACQ-009 preparation run 2026-08-06):
 *   Source digest: 5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38
 *   Text digest:   2b1dbb2b3ae1107754db85e60fc2cf9fe2b6f61b3c3756752d2e2e6ade654e25
 *   Byte length: 251,998
 *   Text length (chars): 32,947
 *
 * Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0013 (13 documents)
 *
 * This test makes live HTTPS requests to bis.org, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, ico.org.uk
 * (14 sections), bankofengland.co.uk, and fda.gov. Allow 15 minutes.
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
const REVIEW_TIMESTAMP = "2026-08-06T19:30:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T20:00:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const BIS_PDF_URL = "https://www.bis.org/bcbs/publ/d516.pdf";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-009 preparation run (2026-08-06)
// ---------------------------------------------------------------------------

const REFERENCE_SOURCE_DIGEST =
  "5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38";
const REFERENCE_TEXT_DIGEST =
  "2b1dbb2b3ae1107754db85e60fc2cf9fe2b6f61b3c3756752d2e2e6ade654e25";
const REFERENCE_TEXT_LENGTH = 32947;

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
  const id = `dra-acq-009-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
//   - Document fetched from bis.org (official BIS website, host of BCBS secretariat)
//   - Publisher confirmed as Basel Committee on Banking Supervision (BCBS),
//     established by the G10 central bank governors in 1974; secretariat at BIS
//   - PDF title: "Principles for Operational Resilience", BCBS d516, March 2021
//   - Source BYTE_STABLE: two independent fetches produced identical SHA-256
//   - BCBS confirmed as official international standard-setting body for banking
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-009-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.bis.org/bcbs/publ/d516.pdf",
    "Publisher: Basel Committee on Banking Supervision (BCBS), secretariat at Bank for International Settlements (BIS), Basel, Switzerland",
    "BCBS established 1974 by G10 central bank governors; primary global standard-setter for bank regulation",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    "Source stability: BYTE_STABLE — two independent fetches (2026-08-06) produced identical SHA-256",
    `Source digest confirmed: ${REFERENCE_SOURCE_DIGEST}`,
    "PDF title: 'Principles for Operational Resilience', BCBS publication d516, March 2021",
    "Landing page verified: https://www.bis.org/bcbs/publ/d516.htm",
    "Publication confirmed as official BCBS finalised standard (not consultation or draft)",
    "Jurisdiction: International (BIS, Basel, Switzerland) — first non-US, non-UK publisher in corpus",
    "HUMAN GOVERNANCE DECISION: BCBS/BIS confirmed as official international regulatory standard-setting source — VERIFIED",
  ],
  notes:
    "DRA-ACQ-009 human governance sign-off 2026-08-06. " +
    "BCBS Principles for Operational Resilience official source VERIFIED. " +
    "Byte-stable PDF from bis.org (BCBS secretariat).",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Licence basis:
//   BIS/BCBS publications may be reproduced for educational and non-commercial
//   purposes provided the source is cited. The DRA benchmark programme is an
//   educational and research initiative — non-commercial. Licence basis:
//   OPEN_LICENCE (BIS non-commercial educational use). Analogous to DRA-DOC-0012
//   (PRA SS1/23, Bank of England non-commercial academic use), previously admitted.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Bank for International Settlements Copyright — Non-commercial Educational Use",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-009-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Publisher: Bank for International Settlements (BIS) hosting BCBS secretariat",
    "BIS website terms of use: reproductions permitted for educational and non-commercial purposes, source must be cited",
    "DRA benchmark programme: educational and research initiative — non-commercial use",
    "Analogous licence basis to DRA-DOC-0012 (PRA SS1/23, Bank of England non-commercial academic use), admitted as OPEN_LICENCE",
    "No embedded third-party content identified that would restrict reuse",
    "BCBS publications are routinely cited and reproduced in academic research and regulatory analysis",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE status confirmed for DRA benchmark non-commercial educational use — VERIFIED",
  ],
  notes:
    "DRA-ACQ-009 human governance sign-off 2026-08-06. " +
    "BIS Copyright — Non-commercial Educational Use — OPEN_LICENCE VERIFIED. " +
    "Non-commercial educational reuse permitted with source citation.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
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
// Corpus entries for DRA-DOC-0007–0013 (reconstructed from admitted records)
// Mirrors the ENTRY_* constants in DRA-BMK-013 for consistent 13-doc registry.
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

const ENTRY_0013: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0013",
  title: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "HEALTHCARE",
  language: "en",
  generator: "U.S. Food and Drug Administration (FDA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.fda.gov/media/145022/download",
  sourceReference: "https://www.fda.gov/media/145022/download",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000015. " +
    "Freeze record: DRA-FRZ-000007. " +
    "Source digest: 83c70423dd57b35b… " +
    "Publication date: 2021-01-12. " +
    "First HEALTHCARE-domain document. New publisher: FDA.",
};

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001–0013, all 13 admitted documents)
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
    requestedBy: "DRA-ACQ-009-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-009-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-009-admission-corpus-check",
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
      requestedBy: "DRA-ACQ-009-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-009-admission-corpus-check",
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

  // DRA-DOC-0013: FDA AI/ML SaMD Action Plan (live fetch)
  const fdaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000015",
    sourceUrl: "https://www.fda.gov/media/145022/download",
    requestedBy: "DRA-ACQ-009-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
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
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-009 — Controlled Corpus Admission for DRA-DOC-0014 (BCBS Principles for Operational Resilience)",
  () => {
    it(
      "admits DRA-DOC-0014 (BCBS d516 PDF) through eligibility, " +
        "freeze, and consolidated 14-document corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-009 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Step 1: Setup — build 13-document registry ──────────────────────

        console.log("── Step 1: Setup — Build 13-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        // DRA-DOC-0001–0006: initial-corpus governance
        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        // DRA-DOC-0007–0013: freeze-record governance
        registry.add(ENTRY_0007);
        registry.add(ENTRY_0008);
        registry.add(ENTRY_0009);
        registry.add(ENTRY_0010);
        registry.add(ENTRY_0011);
        registry.add(ENTRY_0012);
        registry.add(ENTRY_0013);

        console.log(`  13-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(13);
        expect(registry.hasId("DRA-DOC-0014")).toBe(false);

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

        // ── Step 2: Build existing corpus texts (near-duplicate scope) ──────

        console.log("\n── Step 2: Build 13-Document Existing Corpus Texts ─────────");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008–0013: live fetch (7 sources)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);
        console.log(`  Total texts built: ${existingCorpusTexts.length}`);
        expect(existingCorpusTexts.length).toBe(13);

        // ── Step 3: Acquisition request ──────────────────────────────────────

        console.log("\n── Step 3: Acquisition Request (DRA-ACQ-000016) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000016",
          sourceUrl: BIS_PDF_URL,
          requestedBy: "DRA-ACQ-009-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Basel Committee on Banking Supervision (BCBS)",
          expectedTitle: "Principles for Operational Resilience",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 4: Fetch BIS d516 PDF ────────────────────────────────────────

        console.log("\n── Step 4: Fetch BIS d516 PDF (live network) ────────────────");

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

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");
        expect(source.rawBytes.length).toBe(251998);

        // ── Step 5: Source digest verification ────────────────────────────────

        console.log("\n── Step 5: Source Digest Verification ──────────────────────");

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log("  reference :", REFERENCE_SOURCE_DIGEST);
        console.log("  current   :", sourceDigest);

        expect(sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);

        // ── Step 6: Normalisation ─────────────────────────────────────────────

        console.log("\n── Step 6: Normalisation (pdftotext) ───────────────────────");

        const normaliseResult = await normaliseContent(
          source.rawBytes,
          "application/pdf",
          sourceDigest,
          extractPdfText,
        );

        expect(normaliseResult.ok).toBe(true);
        if (!normaliseResult.ok) return;

        const normalised = normaliseResult.document;

        console.log("  normalisationVersion :", normalised.normalisationVersion);
        console.log("  textDigest           :", normalised.textDigest);
        console.log("  textLength (chars)   :", normalised.text.length);

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.textDigest).toBe(REFERENCE_TEXT_DIGEST);
        expect(normalised.text.length).toBe(REFERENCE_TEXT_LENGTH);

        // ── Step 7: Compute metadata digest ──────────────────────────────────

        console.log("\n── Step 7: Approved Metadata Digest ────────────────────────");

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);
        console.log("  metadataDigest :", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        // Verify against pre-computed reference
        expect(metadataDigest).toBe(
          "d7e6b229165d2f115127445ee144808dbd413e048c24a0f9c9fdc577745d8cb8",
        );

        // ── Step 8: Freeze eligibility check (all 13 must pass) ─────────────

        console.log("\n── Step 8: Freeze Eligibility (13 checks — expect 13/13 PASS) ─");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
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

        expect(eligibility.checks).toHaveLength(13);
        expect(passedChecks.length).toBe(13);
        expect(failedChecks.length).toBe(0);
        expect(eligibility.eligible).toBe(true);

        // ── Step 9: Create freeze record (DRA-FRZ-000008) ────────────────────

        console.log("\n── Step 9: Create Freeze Record (DRA-FRZ-000008) ───────────");

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000008",
          corpusDocumentId: "DRA-DOC-0014",
          acquisitionId: "DRA-ACQ-000016",
          sourceUrl: BIS_PDF_URL,
          finalUrl: source.finalUrl,
          sourceDigest,
          normalised,
          metadataDigest,
          fixedTimestamp: FREEZE_TIMESTAMP,
          frozenBy: "DRA-ACQ-009-human-governance-operator",
          benchmarkVersion: CORPUS_VERSION,
        });

        console.log("  freezeRecordId     :", freezeRecord.freezeRecordId);
        console.log("  corpusDocumentId   :", freezeRecord.corpusDocumentId);
        console.log("  acquisitionId      :", freezeRecord.acquisitionId);
        console.log("  sourceDigest       :", freezeRecord.sourceDigest.slice(0, 16) + "…");
        console.log("  normalisedTextDig  :", freezeRecord.normalisedTextDigest.slice(0, 16) + "…");
        console.log("  metadataDigest     :", freezeRecord.metadataDigest.slice(0, 16) + "…");
        console.log("  freezeRecordDigest :", freezeRecord.freezeRecordDigest.slice(0, 16) + "…");
        console.log("  frozenAt           :", freezeRecord.frozenAt);
        console.log("  frozenBy           :", freezeRecord.frozenBy);
        console.log("  status             :", freezeRecord.status);

        // Structural invariants
        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000008");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0014");
        expect(freezeRecord.acquisitionId).toBe("DRA-ACQ-000016");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_TEXT_DIGEST);
        expect(freezeRecord.metadataDigest).toBe(metadataDigest);
        expect(freezeRecord.normalisationVersion).toBe("DRA-NORM-v1");
        // frozenAt uses live system time (excluded from freezeRecordDigest — does not affect integrity)
        expect(freezeRecord.frozenAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-009-human-governance-operator");
        expect(freezeRecord.benchmarkVersion).toBe(CORPUS_VERSION);
        expect(freezeRecord.status).toBe("FROZEN");
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);

        // Verify pre-computed freeze record digest
        expect(freezeRecord.freezeRecordDigest).toBe(
          "16017630c82863d98301d0a43e3572bc26b2576ffd3e7fce513f7820d46f91bf",
        );

        // Verify digest integrity
        const digestValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);
        console.log(`  digest integrity check : ${digestValid ? "✓ PASS" : "✗ FAIL"}`);
        expect(digestValid).toBe(true);

        // ── Step 10/11: integrateWithCorpus — adds DRA-DOC-0014 and exports manifest ─

        console.log("\n── Step 10/11: integrateWithCorpus — 14-document manifest ──────");

        const integrationResult = integrateWithCorpus(freezeRecord, APPROVED_METADATA, registry);

        if (!integrationResult.ok) {
          console.error("  Integration FAILED:", integrationResult.message);
        }
        expect(integrationResult.ok).toBe(true);
        if (!integrationResult.ok) return;

        const manifest = integrationResult.manifest;

        console.log(`  schemaVersion  : ${manifest.schemaVersion}`);
        console.log(`  corpusVersion  : ${manifest.corpusVersion}`);
        console.log(`  documentCount  : ${manifest.documentCount}`);
        console.log(`  overallDigest  : ${manifest.overallDigest}`);
        console.log(`  documentIds    :`);
        for (const id of manifest.documentIds) {
          console.log(`    ${id}`);
        }

        // ── Step 12: Manifest integrity verification ─────────────────────────

        console.log("\n── Step 12: Manifest Integrity Verification ─────────────────");

        const manifestIntact = verifyManifestIntegrity(manifest);
        console.log(`  integrity check : ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);

        expect(manifestIntact).toBe(true);
        expect(manifest.documentCount).toBe(14);
        expect(manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(manifest.overallDigest).toHaveLength(64);
        expect(manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(manifest.documentIds).toHaveLength(14);
        expect(manifest.documentIds).toContain("DRA-DOC-0014");
        expect(manifest.documentIds[13]).toBe("DRA-DOC-0014");

        console.log("\n── Admission Complete ────────────────────────────────────────");
        console.log("  Document:        DRA-DOC-0014 — Principles for Operational Resilience");
        console.log("  Publisher:       Basel Committee on Banking Supervision (BCBS)");
        console.log("  Freeze record:   DRA-FRZ-000008");
        console.log("  Source digest:   5c51372c…");
        console.log("  Text digest:     2b1dbb2b…");
        console.log("  Metadata digest: d7e6b229…");
        console.log("  Freeze digest:   16017630…");
        console.log("  Corpus size:     14 documents");
        console.log("  Status:          FROZEN");
        console.log("  Licence:         OPEN_LICENCE (BIS Non-commercial Educational Use)");
        console.log("  Next step:       DRA-BMK-014 — Fourteen-Document Corpus Checkpoint");
      },
      900_000, // 15 minutes
    );
  },
);
