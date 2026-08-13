/**
 * DRA-ACQ-012 — Controlled Corpus Admission for DRA-DOC-0016
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-012 (Phase 2)                           ║
 * ║                                                                          ║
 * ║  Candidate: HSE — "Health and safety basics for your business"          ║
 * ║  (recommended in DRA-ACQ-012 Phase 1 candidate-discovery report).        ║
 * ║                                                                          ║
 * ║  Document:   Health and safety basics for your business                 ║
 * ║  Corpus ID:  DRA-DOC-0016                                                ║
 * ║  Freeze ID:  DRA-FRZ-000010                                              ║
 * ║  Acquisition ID: DRA-ACQ-000019 (programme ref: DRA-ACQ-012)             ║
 * ║  Publisher:  Health and Safety Executive (HSE), UK statutory regulator   ║
 * ║  Source:     Multi-page HTML collection                                 ║
 * ║                                                                          ║
 * ║  Landing page URL:                                                       ║
 * ║    https://www.hse.gov.uk/simple-health-safety/                         ║
 * ║                                                                          ║
 * ║  CANONICAL-REPRESENTATION FINDING (discovered during Phase 2 review):   ║
 * ║  The landing page itself carries only ~211 words of body content; it is ║
 * ║  an index page linking to 9 topic guides (policy, risk, reporting,      ║
 * ║  training, consult, workplace facilities, first aid, display-the-law,   ║
 * ║  getting help). Each topic guide is itself paginated (1–6 pages per     ║
 * ║  topic). This was independently verified by fetching every linked page  ║
 * ║  and inspecting its own internal navigation; the walk was bounded to    ║
 * ║  same-directory pagination links only (no descent into "Related        ║
 * ║  content" cross-links to other HSE guides, which would be unbounded).   ║
 * ║  This yields a fixed, enumerable, finite set of 26 pages (1 landing +   ║
 * ║  25 sub-pages) — larger than the DRA-DOC-0011 ICO precedent (14         ║
 * ║  sections) but the same kind of bounded multi-page HTML collection.     ║
 * ║  DECISION: treat the full 26-page set as the document, concatenated in  ║
 * ║  a fixed order (landing page first, then each topic's pages in the      ║
 * ║  order linked from the landing page, each topic's own pages in their    ║
 * ║  own internal "next page" order). This is an explicit, documented       ║
 * ║  scope decision, not a silent partial acquisition.                      ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  No individual HSE guide page carries a per-page copyright statement.   ║
 * ║  Verified via the sitewide copyright page (linked from every page's     ║
 * ║  footer): hse.gov.uk/help/copyright.htm states "The information on      ║
 * ║  this website is owned by the Crown and subject to Crown copyright      ║
 * ║  protection unless otherwise indicated. You may re-use the Crown        ║
 * ║  material featured on this website free of charge in any format or      ║
 * ║  medium, under the terms of the Open Government Licence." This is the   ║
 * ║  same licence family already relied upon for DRA-DOC-0008 (Acas),       ║
 * ║  DRA-DOC-0009 (CMA), DRA-DOC-0011 (ICO), DRA-DOC-0012 (PRA/BoE),         ║
 * ║  DRA-DOC-0015 (NCSC).                                                    ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  hse.gov.uk is Cloudflare-fronted (cf-cache-status observed as DYNAMIC   ║
 * ║  on the landing page). Following the DRA-DOC-0011 (ICO) precedent, raw   ║
 * ║  HTML bytes across independent fetches are not asserted byte-stable;    ║
 * ║  the canonical fingerprint is the SHA-256 of the deterministically      ║
 * ║  normalised, concatenated text across all 26 pages (TEXT_STABLE),       ║
 * ║  verified here via two independent full 26-page fetch passes.           ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch (x2 full walks, determinism check) → normalise   ║
 * ║  each page → concatenate → freeze eligibility (checked against          ║
 * ║  DRA-DOC-0001–0015, 15 documents) → freeze record (DRA-FRZ-000010) →    ║
 * ║  corpus integration (16-document manifest) → DRA evaluator execution    ║
 * ║  via evaluateFrozenBenchmarkDocument (multi-page synthetic source, so   ║
 * ║  the single-shot acquireFreezeAndEvaluate entry point — which performs  ║
 * ║  its own single-URL fetch — is not usable here; this mirrors the        ║
 * ║  DRA-DOC-0011 precedent of building the freeze record from a manually  ║
 * ║  assembled multi-page AcquiredSource before invoking the evaluator).    ║
 * ║                                                                          ║
 * ║  This test does NOT stop before evaluation: every mandatory governance  ║
 * ║  requirement (official source, licence, freeze eligibility) is          ║
 * ║  satisfied with concrete evidence gathered by live inspection during    ║
 * ║  this session, so the full pipeline proceeds through to evaluator       ║
 * ║  execution and proof-receipt generation.                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified below.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values reflect explicit human sign-off, grounded in concrete evidence
 * gathered by direct inspection (HTTP HEAD/GET of the landing page and all
 * 25 linked sub-pages, and HTTP GET of hse.gov.uk/help/copyright.htm)
 * performed during this acquisition programme.
 *
 * This test makes live HTTPS requests to hse.gov.uk (26 pages) plus the
 * existing-corpus near-duplicate scope (acas.org.uk, assets.publishing.
 * service.gov.uk, nvlpubs.nist.gov, ico.org.uk (14 sections),
 * bankofengland.co.uk, fda.gov, bis.org, ncsc.gov.uk). Allow 20 minutes.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import { computeSourceDigest, computeApprovedMetadataDigest } from "../integrity.js";
import { createAcquisitionRequest } from "../request.js";
import { checkFreezeEligibility } from "../eligibility.js";
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
} from "../freeze.js";
import { integrateWithCorpus } from "../manifest-integration.js";
import { evaluateFrozenBenchmarkDocument } from "../governed-pipeline.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import type { AcquiredSource } from "../fetcher.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Human governance review timestamp — decisions recorded 2026-08-07. */
const REVIEW_TIMESTAMP = "2026-08-07T15:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-07T15:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical HSE page set — landing page + 25 sub-pages, fixed order.
// Discovered by direct inspection: each topic's own directory pagination
// links only (no cross-guide "Related content" descent).
// ---------------------------------------------------------------------------

const HSE_BASE = "https://www.hse.gov.uk/simple-health-safety";
const LANDING_PAGE_URL = `${HSE_BASE}/`;

const HSE_PAGE_SLUGS: ReadonlyArray<{ url: string; label: string }> = [
  { url: `${HSE_BASE}/`, label: "00 — Landing page" },

  { url: `${HSE_BASE}/policy/index.htm`, label: "01 — Policy: overview" },
  { url: `${HSE_BASE}/policy/how-to-write-your-policy.htm`, label: "02 — Policy: how to write your policy" },
  { url: `${HSE_BASE}/policy/the-law.htm`, label: "03 — Policy: the law" },

  { url: `${HSE_BASE}/risk/index.htm`, label: "04 — Risk: overview" },
  { url: `${HSE_BASE}/risk/steps-needed-to-manage-risk.htm`, label: "05 — Risk: steps needed to manage risk" },
  { url: `${HSE_BASE}/risk/risk-assessment-template-and-examples.htm`, label: "06 — Risk: risk assessment template and examples" },
  { url: `${HSE_BASE}/risk/common-workplace-risks.htm`, label: "07 — Risk: common workplace risks" },
  { url: `${HSE_BASE}/risk/more-detail-on-managing-risk.htm`, label: "08 — Risk: more detail on managing risk" },

  { url: `${HSE_BASE}/reporting-accidents-ill-health.htm`, label: "09 — Report accidents and illness" },

  { url: `${HSE_BASE}/training/index.htm`, label: "10 — Training: overview" },
  { url: `${HSE_BASE}/training/decide.htm`, label: "11 — Training: decide" },
  { url: `${HSE_BASE}/training/needs.htm`, label: "12 — Training: needs" },
  { url: `${HSE_BASE}/training/supervision.htm`, label: "13 — Training: supervision" },

  { url: `${HSE_BASE}/consult.htm`, label: "14 — Consult your workers" },

  { url: `${HSE_BASE}/workplace-facilities/index.htm`, label: "15 — Workplace facilities: overview" },
  { url: `${HSE_BASE}/workplace-facilities/health-safety.htm`, label: "16 — Workplace facilities: health and safety" },
  { url: `${HSE_BASE}/workplace-facilities/welfare.htm`, label: "17 — Workplace facilities: welfare" },

  { url: `${HSE_BASE}/firstaid/index.htm`, label: "18 — First aid: overview" },
  { url: `${HSE_BASE}/firstaid/assess-business-need.htm`, label: "19 — First aid: assess business need" },
  { url: `${HSE_BASE}/firstaid/first-aid-appoint-someone.htm`, label: "20 — First aid: appoint someone" },
  { url: `${HSE_BASE}/firstaid/first-aid-home-workers.htm`, label: "21 — First aid: home workers" },
  { url: `${HSE_BASE}/firstaid/first-aid-training.htm`, label: "22 — First aid: training" },
  { url: `${HSE_BASE}/firstaid/what-to-put-in-your-first-aid-kit.htm`, label: "23 — First aid: what to put in your kit" },

  { url: `${HSE_BASE}/display.htm`, label: "24 — Display the law poster" },

  { url: `${HSE_BASE}/gettinghelp/index.htm`, label: "25 — Appoint a competent person / getting help" },
];

const HSE_PAGE_URLS = HSE_PAGE_SLUGS.map(({ url }) => url);

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext extractor (for near-duplicate scope PDFs)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-012-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Evidence gathered by direct inspection during this acquisition programme:
//   - Document fetched from hse.gov.uk (official HSE website)
//   - Publisher confirmed as the Health and Safety Executive (HSE), the UK's
//     national statutory regulator for workplace health and safety, with
//     powers under the Health and Safety at Work etc. Act 1974
//   - All 26 pages (landing + 25 sub-pages) return HTTP 200 from the
//     first-party hse.gov.uk domain (no third-party mirrors, no redirects
//     to external domains)
//   - Landing page carries an explicit "Updated 2025-10-14" CMS date stamp
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-012-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Landing page fetched from ${LANDING_PAGE_URL}`,
    "Publisher: Health and Safety Executive (HSE) — UK statutory regulator for workplace health and safety under the Health and Safety at Work etc. Act 1974",
    "All 26 pages (1 landing + 25 sub-pages) confirmed HTTP 200 from first-party hse.gov.uk paths under /simple-health-safety/ — no third-party mirrors, no external redirects",
    "Landing page carries explicit CMS 'Updated 2025-10-14' date stamp",
    "Page structure independently verified by inspecting each page's own internal navigation links (same-directory pagination only, bounded walk, no unbounded cross-guide descent)",
    "HUMAN GOVERNANCE DECISION: HSE confirmed as the UK's official statutory workplace health and safety regulator and canonical publisher of this guide — VERIFIED",
  ],
  notes:
    "DRA-ACQ-012 human governance sign-off 2026-08-07. " +
    "HSE 'Health and safety basics for your business' official source VERIFIED. " +
    "26-page multi-page HTML collection selected as canonical representation (see docblock).",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Licence basis: Crown copyright, Open Government Licence (OGL) — verified
// via the sitewide copyright page linked from every page's footer. No
// individual page carries a distinct per-page statement, so a single
// authoritative sitewide source is relied upon (as previously accepted for
// several other HSE-adjacent OGL-licensed corpus documents).
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Crown Copyright — Open Government Licence",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-012-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "SITEWIDE evidence: https://www.hse.gov.uk/help/copyright.htm (linked from the footer of every page in this acquisition) states: " +
      "'The information on this website is owned by the Crown and subject to Crown copyright protection unless otherwise indicated. " +
      "You may re-use the Crown material featured on this website free of charge in any format or medium, under the terms of the " +
      "Open Government Licence. The preferred acknowledgement is \u2018Contains public sector information published by the Health and " +
      "Safety Executive and licensed under the Open Government Licence\u2019.'",
    "The copyright page notes some images/illustrations/multimedia may not be Crown-owned and cannot be reused without separate permission; " +
      "this benchmark corpus relies only on textual guidance content, consistent with the licence's scope",
    "No individual guide page carries a distinct per-page copyright statement; the sitewide copyright page is the authoritative, " +
      "directly-linked source for all 26 pages in this acquisition",
    "Same OGL licence family already relied upon for DRA-DOC-0008 (Acas), DRA-DOC-0009 (CMA), DRA-DOC-0011 (ICO), " +
      "DRA-DOC-0012 (PRA/BoE), and DRA-DOC-0015 (NCSC) — well-precedented basis for UK public-sector guidance",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE (Crown copyright, OGL) confirmed via sitewide copyright statement — VERIFIED",
  ],
  notes:
    "DRA-ACQ-012 human governance sign-off 2026-08-07. " +
    "Crown Copyright / OGL — VERIFIED via sitewide hse.gov.uk/help/copyright.htm statement.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Health and safety basics for your business",
  publisher: "Health and Safety Executive (HSE)",
  publicationDate: "2025-10-14",
  domain: "BUSINESS" as const,
  documentType: "PROCEDURE" as const,
  difficulty: "LOW" as const,
  language: "en-GB",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "New publisher: HSE (Health and Safety Executive) not previously represented in DRA-DOC-0001-0015. " +
  "BUSINESS domain: joins DRA-DOC-0008 (Acas) as the second BUSINESS-domain document, but covers a " +
  "distinct compliance subject (workplace health and safety obligations vs. employment discipline " +
  "and grievance procedure). " +
  "LOW difficulty: plain-language, step-by-step guidance written for small and low-risk businesses; " +
  "relieves the corpus's sharpest diversity gap (only 2 of 15 prior documents are LOW difficulty). " +
  "PROCEDURE document type: structured as a sequence of concrete compliance steps (write a policy, " +
  "assess risk, report incidents, train workers, consult workers, provide facilities, arrange first " +
  "aid, display the poster, appoint a competent person), consistent with the PROCEDURE classification " +
  "already used for DRA-DOC-0008. " +
  "Multi-page HTML publication (26 pages): second multi-page HTML document in the corpus after " +
  "DRA-DOC-0011 (ICO, 14 sections), exercising normalisation and near-duplicate checking at a larger " +
  "page count. " +
  "OGL licence: same well-precedented licence family as DRA-DOC-0008/0009/0011/0012/0015.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007-0015 (reconstructed from admitted records,
// mirrors the ENTRY_* constants in DRA-BMK-015 for a consistent 15-doc
// registry ahead of DRA-DOC-0016 admission)
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
    "Acquisition ID: DRA-ACQ-000001. Freeze record: DRA-FRZ-000001. Publication date: 2026-06-19. Version: 2.4.",
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
    "Acquisition ID: DRA-ACQ-000002. Freeze record: DRA-FRZ-000002. Publication date: 2020-07.",
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
    "Acquisition ID: DRA-ACQ-000008. Freeze record: DRA-FRZ-000003. Publication date: 2023-09-18.",
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
    "Acquisition ID: DRA-ACQ-000012. Freeze record: DRA-FRZ-000004. Publication date: 2023-01-26.",
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
    "Acquisition ID: DRA-ACQ-000013. Freeze record: DRA-FRZ-000005. Multi-page HTML; 14 sections; TEXT_STABLE. Publication date: 2025-09-22.",
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
    "Acquisition ID: DRA-ACQ-000014. Freeze record: DRA-FRZ-000006. Publication date: 2023-05-17.",
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
    "Public document acquisition via DRA-ENG-009 from https://www.fda.gov/media/145022/download",
  sourceReference: "https://www.fda.gov/media/145022/download",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000015. Freeze record: DRA-FRZ-000007. Publication date: 2021-01-12. " +
    "First HEALTHCARE-domain document. New publisher: FDA.",
};

const ENTRY_0014: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0014",
  title: "Principles for Operational Resilience",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "FINANCE",
  language: "en",
  generator: "Basel Committee on Banking Supervision (BCBS)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from https://www.bis.org/bcbs/publ/d516.pdf",
  sourceReference: "https://www.bis.org/bcbs/publ/d516.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000016. Freeze record: DRA-FRZ-000008. Publication date: 2021-03. " +
    "Second FINANCE-domain document. First international (BCBS/BIS) publisher.",
};

const DRA_DOC_0015_PDF_URL =
  "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";

const ENTRY_0015: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0015",
  title: "Principles for the security of machine learning",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "TECHNICAL",
  language: "en",
  generator: "National Cyber Security Centre (NCSC)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " + DRA_DOC_0015_PDF_URL,
  sourceReference: DRA_DOC_0015_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000018 (programme ref: DRA-ACQ-011). " +
    "Freeze record: DRA-FRZ-000009. " +
    "Publication date: 2024-05-22 (Version 2.0). " +
    "Reproducibility: BYTE_STABLE.",
};

// ---------------------------------------------------------------------------
// Build existing 15-document corpus texts for near-duplicate check
// (DRA-DOC-0001-0015), extending DRA-ACQ-011's construction with DRA-DOC-0015
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001-0006: from BENCHMARK_CORPUS (no network)
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
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
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
  const icoBase = "https://ico.org.uk";
  const icoGuidanceBase =
    "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";
  const icoSlugs = [
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
  const icoPageTexts: string[] = [];
  for (const slug of icoSlugs) {
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: `${icoBase}${icoGuidanceBase}${slug}`,
      requestedBy: "DRA-ACQ-012-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "U.S. Food and Drug Administration (FDA)",
    expectedTitle:
      "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  });
  if (fdaReq.ok) {
    const fdaFetch = await fetcher(fdaReq.request, {});
    if (fdaFetch.ok) {
      const d = computeSourceDigest(fdaFetch.source.rawBytes);
      const n = await normaliseContent(fdaFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0014: BCBS d516 Principles for Operational Resilience (live fetch)
  const bisReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000016",
    sourceUrl: "https://www.bis.org/bcbs/publ/d516.pdf",
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Basel Committee on Banking Supervision (BCBS)",
    expectedTitle: "Principles for Operational Resilience",
  });
  if (bisReq.ok) {
    const bisFetch = await fetcher(bisReq.request, {});
    if (bisFetch.ok) {
      const d = computeSourceDigest(bisFetch.source.rawBytes);
      const n = await normaliseContent(bisFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0015: NCSC Principles for the security of machine learning (live fetch)
  const ncscReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000018",
    sourceUrl: DRA_DOC_0015_PDF_URL,
    requestedBy: "DRA-ACQ-012-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "National Cyber Security Centre (NCSC)",
    expectedTitle: "Principles for the security of machine learning",
  });
  if (ncscReq.ok) {
    const ncscFetch = await fetcher(ncscReq.request, {});
    if (ncscFetch.ok) {
      const d = computeSourceDigest(ncscFetch.source.rawBytes);
      const n = await normaliseContent(ncscFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Fetch and normalise all 26 HSE pages, returning the combined text + digest
// ---------------------------------------------------------------------------

async function fetchAndCombineHsePages(
  fetcher: ReturnType<typeof createHttpFetcher>,
  requestedBy: string,
): Promise<{
  pageTexts: string[];
  finalUrls: string[];
  firstRetrievedAt: string;
  combinedText: string;
  combinedTextBytes: Uint8Array;
  combinedSourceDigest: string;
}> {
  const encoder = new TextEncoder();
  const pageTexts: string[] = [];
  const finalUrls: string[] = [];
  let firstRetrievedAt = "";

  for (let i = 0; i < HSE_PAGE_SLUGS.length; i++) {
    const { url, label } = HSE_PAGE_SLUGS[i]!;

    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000019",
      sourceUrl: url,
      requestedBy,
      requestedAt: FREEZE_TIMESTAMP,
      expectedPublisher: "Health and Safety Executive (HSE)",
      expectedTitle: "Health and safety basics for your business",
    });

    if (!reqResult.ok) {
      throw new Error(`createAcquisitionRequest failed for ${label}: ${JSON.stringify(reqResult)}`);
    }

    const fetchResult = await fetcher(reqResult.request, {});
    if (!fetchResult.ok) {
      throw new Error(`Fetch failed for ${label} (${url}): ${fetchResult.code} - ${fetchResult.message}`);
    }

    const src = fetchResult.source;
    if (i === 0) firstRetrievedAt = src.retrievedAt;

    if (src.httpStatus !== 200) {
      throw new Error(`Unexpected HTTP status ${src.httpStatus} for ${label}`);
    }

    const digest = computeSourceDigest(src.rawBytes);
    const normResult = await normaliseContent(src.rawBytes, "text/html", digest);
    if (!normResult.ok) {
      throw new Error(`Normalisation failed for ${label}: ${normResult.code}`);
    }

    pageTexts.push(normResult.document.text);
    finalUrls.push(src.finalUrl);
  }

  const combinedText = pageTexts.join(SECTION_SEPARATOR);
  const combinedTextBytes = encoder.encode(combinedText);
  const combinedSourceDigest = computeSourceDigest(combinedTextBytes);

  return {
    pageTexts,
    finalUrls,
    firstRetrievedAt,
    combinedText,
    combinedTextBytes,
    combinedSourceDigest,
  };
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-012 — Controlled Corpus Admission for DRA-DOC-0016 (HSE Health and Safety Basics)",
  () => {
    it(
      "verifies determinism, admits DRA-DOC-0016 (HSE 26-page multi-page HTML guide) through " +
        "eligibility, freeze, 16-document corpus integration, and DRA evaluator execution",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-012 — CORPUS ADMISSION LOG (Phase 2)             ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const fetcher = createHttpFetcher({
          timeoutMs: 60_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Step 0: Determinism check — two independent full 26-page walks ──

        console.log("── Step 0: Determinism Check — Two Independent 26-Page Walks ─");

        const passA = await fetchAndCombineHsePages(fetcher, "DRA-ACQ-012-determinism-check-a");
        console.log(`  Pass A: ${passA.pageTexts.length} pages fetched`);
        console.log("  Pass A combinedSourceDigest:", passA.combinedSourceDigest);

        const passB = await fetchAndCombineHsePages(fetcher, "DRA-ACQ-012-determinism-check-b");
        console.log(`  Pass B: ${passB.pageTexts.length} pages fetched`);
        console.log("  Pass B combinedSourceDigest:", passB.combinedSourceDigest);

        expect(passA.pageTexts.length).toBe(26);
        expect(passB.pageTexts.length).toBe(26);

        // Combined normalised text digest is the canonical fingerprint (TEXT_STABLE),
        // per the DRA-DOC-0011 precedent for Cloudflare-fronted dynamic HTML.
        const combinedNormA = await normaliseContent(
          passA.combinedTextBytes, "text/plain", passA.combinedSourceDigest,
        );
        const combinedNormB = await normaliseContent(
          passB.combinedTextBytes, "text/plain", passB.combinedSourceDigest,
        );
        expect(combinedNormA.ok).toBe(true);
        expect(combinedNormB.ok).toBe(true);
        if (!combinedNormA.ok || !combinedNormB.ok) return;

        console.log("  Pass A combinedTextDigest:", combinedNormA.document.textDigest);
        console.log("  Pass B combinedTextDigest:", combinedNormB.document.textDigest);

        const textStable = combinedNormA.document.textDigest === combinedNormB.document.textDigest;
        console.log(
          textStable
            ? "  TEXT_STABLE: two independent 26-page fetch passes produced identical combined text SHA-256 ✓"
            : "  !! TEXT DIGEST MISMATCH between independent passes — site content changed mid-acquisition !!",
        );
        expect(textStable).toBe(true);
        if (!textStable) return;

        // Use Pass A as the canonical acquisition data going forward.
        const {
          pageTexts, finalUrls, firstRetrievedAt, combinedText,
          combinedTextBytes, combinedSourceDigest,
        } = passA;
        const combinedNormalised = combinedNormA.document;
        const wordCount = combinedNormalised.text.split(/\s+/).filter(Boolean).length;

        console.log("\n  combinedTextLength :", combinedNormalised.text.length, "chars");
        console.log("  combinedWordCount  :", wordCount);
        expect(combinedNormalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(combinedNormalised.text.trim().length).toBeGreaterThan(2_000);

        // ── Step 1: Setup — build 15-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 15-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        registry.add(ENTRY_0007);
        registry.add(ENTRY_0008);
        registry.add(ENTRY_0009);
        registry.add(ENTRY_0010);
        registry.add(ENTRY_0011);
        registry.add(ENTRY_0012);
        registry.add(ENTRY_0013);
        registry.add(ENTRY_0014);
        registry.add(ENTRY_0015);

        console.log(`  15-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(15);
        expect(registry.hasId("DRA-DOC-0016")).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-012",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
        });

        // ── Step 2: Build existing corpus texts (near-duplicate scope) ──────

        console.log("\n── Step 2: Build 15-Document Existing Corpus Texts ─────────");
        console.log("  DRA-DOC-0001-0006: from BENCHMARK_CORPUS (no network)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008-0010, 0012-0015: live PDF fetch (7 sources)");
        console.log("  DRA-DOC-0011:      live fetch (14 ICO section pages)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);
        console.log(`  Total texts built: ${existingCorpusTexts.length}`);
        expect(existingCorpusTexts.length).toBe(15);

        // ── Step 3: Synthetic AcquiredSource (multi-page combined) ──────────

        console.log("\n── Step 3: Synthetic AcquiredSource (26-page combined) ──────");

        const syntheticSource: AcquiredSource = Object.freeze({
          acquisitionId: "DRA-ACQ-000019",
          requestedUrl: LANDING_PAGE_URL,
          finalUrl: finalUrls[0] ?? LANDING_PAGE_URL,
          mediaType: "text/html",
          rawBytes: combinedTextBytes, // normalised text bytes — deterministic
          retrievedAt: firstRetrievedAt,
          httpStatus: 200,
          redirects: [] as readonly string[],
          httpResponseHeaders: undefined,
        });

        console.log("  acquisitionId:", syntheticSource.acquisitionId);
        console.log("  finalUrl     :", syntheticSource.finalUrl);
        console.log("  httpStatus   :", syntheticSource.httpStatus);
        console.log("  pagesCombined:", pageTexts.length);
        expect(syntheticSource.httpStatus).toBe(200);

        // ── Step 4: Metadata digest ──────────────────────────────────────────

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);
        console.log("\n── Step 4: Metadata Digest ─────────────────────────────────");
        console.log("  metadataDigest:", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 5: Freeze eligibility (mandatory governance checks) ────────

        console.log("\n── Step 5: Freeze Eligibility Checks ───────────────────────");

        const eligibility = checkFreezeEligibility(
          syntheticSource,
          combinedNormalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0016",
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
          const result = eligibility as { blockingReasons: readonly string[] };
          console.error("\n  ELIGIBILITY FAILED — blocking reasons:");
          for (const reason of result.blockingReasons) {
            console.error("    •", reason);
          }
          expect(eligibility.eligible).toBe(true);
          return;
        }

        console.log("\n  All checks PASSED ✓");
        console.log(
          "  passed:",
          eligibility.checks.filter((c) => c.passed).length,
          "/",
          eligibility.checks.length,
        );
        expect(eligibility.eligible).toBe(true);

        // ── Step 6: Create freeze record (DRA-FRZ-000010) ───────────────────

        console.log("\n── Step 6: Create Freeze Record (DRA-FRZ-000010) ───────────");

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000010",
          corpusDocumentId: "DRA-DOC-0016",
          acquisitionId: "DRA-ACQ-000019",
          sourceUrl: LANDING_PAGE_URL,
          finalUrl: finalUrls[0] ?? LANDING_PAGE_URL,
          sourceDigest: combinedSourceDigest,
          normalised: combinedNormalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-012-freeze-operator",
          benchmarkVersion: CORPUS_VERSION,
          fixedTimestamp: FREEZE_TIMESTAMP,
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
        console.log("  benchmarkVersion     :", freezeRecord.benchmarkVersion);

        // ── Step 7: Verify freeze record integrity ──────────────────────────

        console.log("\n── Step 7: Freeze Record Integrity ─────────────────────────");

        const freezeRecordValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);
        console.log("  verifyAcquisitionFreezeRecordDigest:", freezeRecordValid ? "PASS ✓" : "FAIL ✗");

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000010");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0016");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-012-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe(CORPUS_VERSION);
        expect(freezeRecord.sourceDigest).toBe(combinedSourceDigest);
        expect(freezeRecord.normalisedTextDigest).toBe(combinedNormalised.textDigest);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 8: Corpus integration — register DRA-DOC-0016 ──────────────

        console.log("\n── Step 8: Corpus Integration (DRA-DOC-0016 → 16-document corpus) ─");

        const integrationResult = integrateWithCorpus(
          freezeRecord,
          APPROVED_METADATA,
          registry,
        );

        if (!integrationResult.ok) {
          console.error("Corpus integration FAILED:", integrationResult.code, integrationResult.message);
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

        expect(manifest.documentCount).toBe(16);
        expect(manifest.overallDigest).toBeTruthy();
        expect(manifestDigest).toBe(manifest.overallDigest);

        // ── Step 9: Consolidated manifest integrity verification ────────────

        console.log("\n── Step 9: Consolidated 16-Document Manifest Integrity ──────");

        const manifestIntact = verifyManifestIntegrity(manifest);
        const registryHasDoc = registry.hasId("DRA-DOC-0016");
        const manifestRoundTrip = registry.exportManifest().overallDigest === manifestDigest;

        const listedDocs = registry.list();
        const idSet = new Set(listedDocs.map((d) => d.corpusId));
        const allUnique = idSet.size === 16;
        const expectedIds = [
          "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
          "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
          "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
          "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
        ];
        const idsMatchOrder = manifest.documentIds.every((id, i) => id === expectedIds[i]);

        console.log("  DRA-DOC-0016 in registry       :", registryHasDoc ? "PASS ✓" : "FAIL ✗");
        console.log("  manifest integrity (hash check):", manifestIntact ? "PASS ✓" : "FAIL ✗");
        console.log("  manifest digest round-trips    :", manifestRoundTrip ? "PASS ✓" : "FAIL ✗");
        console.log("  document count = 16            :", manifest.documentCount === 16 ? "PASS ✓" : "FAIL ✗");
        console.log("  all 16 IDs unique              :", allUnique ? "PASS ✓" : "FAIL ✗");
        console.log("  ID order correct               :", idsMatchOrder ? "PASS ✓" : "FAIL ✗");

        for (let i = 0; i < listedDocs.length; i++) {
          const doc = listedDocs[i]!;
          expect(doc.corpusId).toBe(expectedIds[i]);
        }

        expect(registryHasDoc).toBe(true);
        expect(manifestIntact).toBe(true);
        expect(manifestRoundTrip).toBe(true);
        expect(manifest.documentCount).toBe(16);
        expect(allUnique).toBe(true);
        expect(idsMatchOrder).toBe(true);

        // ── Step 10: Near-duplicate and corpus-ID results ────────────────────

        console.log("\n── Step 10: Near-Duplicate and Corpus-ID Check Results ─────");

        const nearDupCheck = eligibility.checks.find((c) => c.checkId === "NO_NEAR_DUPLICATE");
        const dupIdCheck = eligibility.checks.find((c) => c.checkId === "NO_DUPLICATE_CORPUS_ID");

        console.log("  NO_NEAR_DUPLICATE     :", nearDupCheck?.passed ? "PASS ✓" : "FAIL ✗", nearDupCheck?.detail ?? "");
        console.log("  NO_DUPLICATE_CORPUS_ID:", dupIdCheck?.passed ? "PASS ✓" : "FAIL ✗", dupIdCheck?.detail ?? "");

        expect(nearDupCheck?.passed).toBe(true);
        expect(dupIdCheck?.passed).toBe(true);

        // ── Step 11: DRA evaluator execution (evaluateFrozenBenchmarkDocument) ─

        console.log("\n── Step 11: DRA Evaluator Execution ────────────────────────");

        const evalResult = evaluateFrozenBenchmarkDocument({
          freezeRecord,
          rawBytes: combinedTextBytes,
          normalisedText: combinedNormalised.text,
          approvedMetadata: APPROVED_METADATA,
          registry,
          fixedTimestamp: FREEZE_TIMESTAMP,
        });

        if (!evalResult.ok) {
          console.error("Evaluator execution FAILED:", evalResult.stage, JSON.stringify(evalResult.errors));
          expect(evalResult.ok).toBe(true);
          return;
        }

        const { decision, evaluationResult, proofReference } = evalResult.result;

        console.log("  decision             :", decision);
        console.log("  proofReceiptDigest   :", proofReference.proofReceiptSubstantiveDigest);
        console.log("  evaluationTimestamp  :", proofReference.evaluationTimestamp);
        expect(evalResult.ok).toBe(true);
        expect(proofReference.freezeRecordId).toBe("DRA-FRZ-000010");
        expect(proofReference.corpusDocumentId).toBe("DRA-DOC-0016");
        expect(proofReference.sourceDigest).toBe(combinedSourceDigest);
        expect(proofReference.normalisedTextDigest).toBe(combinedNormalised.textDigest);
        expect(proofReference.metadataDigest).toBe(metadataDigest);
        expect(proofReference.freezeRecordDigest).toBe(freezeRecord.freezeRecordDigest);
        expect(proofReference.proofReceiptSubstantiveDigest).toMatch(/^[0-9a-f]{64}$/);

        expect(evaluationResult.ok).toBe(true);
        if (evaluationResult.ok) {
          const receipt = evaluationResult.proofReceipt as {
            schemaVersion?: string;
            evaluatorVersion?: string;
            pipelineVersion?: string;
            decision?: string;
            records?: readonly unknown[];
          };
          console.log("  receipt.schemaVersion   :", receipt.schemaVersion);
          console.log("  receipt.evaluatorVersion:", receipt.evaluatorVersion);
          console.log("  receipt.pipelineVersion :", receipt.pipelineVersion);
          console.log("  receipt.records.length  :", receipt.records?.length);

          const issues = (evaluationResult as {
            issues?: readonly { readonly issueClass?: string }[];
          }).issues;
          if (issues) {
            console.log("  issue classes raised    :", issues.map((i) => i.issueClass).join(", ") || "(none)");
          }
        }

        // ── Admission summary ────────────────────────────────────────────────

        console.log("\n── Admission Summary ────────────────────────────────────────");
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  title                :", APPROVED_METADATA.title);
        console.log("  publisher            :", APPROVED_METADATA.publisher);
        console.log("  publicationDate      :", APPROVED_METADATA.publicationDate);
        console.log("  domain               :", APPROVED_METADATA.domain);
        console.log("  documentType         :", APPROVED_METADATA.documentType);
        console.log("  difficulty           :", APPROVED_METADATA.difficulty);
        console.log("  language             :", APPROVED_METADATA.language);
        console.log("  sourceFormat         : Multi-page HTML (26 pages)");
        console.log("  canonicalSourceUrl   :", LANDING_PAGE_URL);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  combinedWordCount    :", wordCount);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  manifestDigest       :", manifestDigest);
        console.log("  decision             :", decision);
        console.log("  reproducibility      : TEXT_STABLE (26-page combined text digest matched across 2 fetch passes)");
        console.log("  priorCorpusSize      : 15");
        console.log("  admittedDocCount     : 16");

        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-012 — ALL ADMISSION CHECKS PASSED                ║");
        console.log("║  DRA-DOC-0016 ADMITTED AND FROZEN (DRA-FRZ-000010)        ║");
        console.log("║  CONSOLIDATED CORPUS: 16 DOCUMENTS                        ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");
      },
      600_000, // 10-minute timeout (26 HSE pages x2 determinism + 15-doc corpus check)
    );
  },
);
