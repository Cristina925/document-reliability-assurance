/**
 * DRA-ACQ-011 — Controlled Corpus Admission for DRA-DOC-0015
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-011                                     ║
 * ║                                                                          ║
 * ║  Candidate: NCSC — "Principles for the Security of Machine Learning"    ║
 * ║  (recommended replacement candidate at the close of DRA-ACQ-010,        ║
 * ║  after the OECD-LEGAL-0449 candidate was blocked pending human review). ║
 * ║                                                                          ║
 * ║  Document:   Principles for the security of machine learning            ║
 * ║  Corpus ID:  DRA-DOC-0015                                                ║
 * ║  Freeze ID:  DRA-FRZ-000009                                              ║
 * ║  Acquisition ID: DRA-ACQ-000018 (programme ref: DRA-ACQ-011)             ║
 * ║  Publisher:  National Cyber Security Centre (NCSC), part of GCHQ (UK)   ║
 * ║  Source:     PDF — single consolidated document (Version 2.0, May 2024) ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.ncsc.gov.uk/sites/default/files/documents/               ║
 * ║    NCSC-Machine-learning-principles.pdf                                 ║
 * ║                                                                          ║
 * ║  CANONICAL-REPRESENTATION DECISION (both HTML and PDF inspected):       ║
 * ║  The publication exists both as a multi-page HTML collection            ║
 * ║  (ncsc.gov.uk/collection/machine-learning-principles, ~21 sub-pages)    ║
 * ║  and as a single consolidated PDF (46 pages). Both were fetched and     ║
 * ║  compared:                                                               ║
 * ║    - Identity: both show "Version 2.0", Publish date 22 May 2024,       ║
 * ║      Reviewed 22 May 2024. A spot-check of HTML section "1.1 Raise      ║
 * ║      awareness of ML threats and risks" against the PDF's corresponding ║
 * ║      section shows byte-for-byte identical prose (only PDF page-layout  ║
 * ║      artefacts — headers/footers/page numbers — differ).                ║
 * ║    - Freshness: the HTML page's HTTP Last-Modified header is a          ║
 * ║      dynamically-regenerated CMS artefact (shows the date of the        ║
 * ║      request, not true content currency) and is NOT used as a          ║
 * ║      freshness signal. The PDF's true internal metadata (pdfinfo)       ║
 * ║      shows CreationDate 2024-05-21 and ModDate 2024-05-30, consistent   ║
 * ║      with the page's stated 22 May 2024 publish/review date.            ║
 * ║    - Amendment status: no separate "Version 1.0" artefact or changelog  ║
 * ║      was found; both representations report Version 2.0 uniformly.     ║
 * ║      No unresolved amendment discrepancy exists.                        ║
 * ║    - Licence evidence asymmetry: the PDF carries an explicit,           ║
 * ║      document-embedded licence statement on its final page ("©️ Crown   ║
 * ║      copyright 2024 ... Text content is licenced for re-use under the  ║
 * ║      Open Government Licence v3.0"). The directly-fetched HTML page     ║
 * ║      body carries NO such explicit per-page statement; its licence     ║
 * ║      basis must be inferred from the sitewide Terms & Conditions page.  ║
 * ║  DECISION: The PDF is selected as the canonical representation. It is  ║
 * ║  a single fixed-byte artefact (simpler deterministic re-fetch/digest   ║
 * ║  verification than reconstructing ~21 dynamically-rendered HTML pages, ║
 * ║  cf. the DRA-DOC-0011 ICO precedent) AND it carries a stronger,         ║
 * ║  document-specific licence statement. This is an explicit, documented  ║
 * ║  justification, not a silent default.                                  ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  Verified via TWO independent, mutually-corroborating sources (per the  ║
 * ║  explicit instruction not to assume OGL merely because it is an NCSC    ║
 * ║  page):                                                                  ║
 * ║    1. Document-specific: the PDF's own final content page states        ║
 * ║       "© Crown copyright 2024 ... Text content is licenced for re-use   ║
 * ║       under the Open Government Licence v3.0" with a link to the OGL    ║
 * ║       v3 canonical text at nationalarchives.gov.uk.                     ║
 * ║    2. Sitewide corroboration: ncsc.gov.uk/section/about-this-website/   ║
 * ║       terms-and-conditions states "Content on the Websites is, unless   ║
 * ║       stated otherwise, subject to Crown copyright ... you may use or   ║
 * ║       reuse the content published on the Websites without prior        ║
 * ║       permission but must adhere to and accept the terms of the Open    ║
 * ║       Government Licence (OGL) v3.0."                                   ║
 * ║  Both sources agree; licence basis: OPEN_LICENCE (Crown copyright, OGL  ║
 * ║  v3.0). Human governance confirms VERIFIED status below.                ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent live fetches of the canonical PDF (performed within    ║
 * ║  this test) are compared directly against each other for byte-for-byte  ║
 * ║  and SHA-256 equality. Source is BYTE_STABLE if they match.             ║
 * ║                                                                          ║
 * ║  Pipeline scope (via acquireFreezeAndEvaluate — DRA-ENG-009):            ║
 * ║    fetch (x2, determinism check) → normalise → freeze eligibility        ║
 * ║    (checked against DRA-DOC-0001–0014, 14 documents) → freeze record     ║
 * ║    (DRA-FRZ-000009) → corpus integration (15-document manifest) →        ║
 * ║    DRA evaluator execution → proof receipt generation                    ║
 * ║                                                                          ║
 * ║  This test does NOT stop before evaluation: every mandatory governance   ║
 * ║  requirement (official source, licence, freeze eligibility) is          ║
 * ║  satisfied with concrete, cross-corroborated evidence gathered by live   ║
 * ║  inspection in this session, so the full pipeline proceeds through to    ║
 * ║  evaluator execution and proof-receipt generation per the explicit       ║
 * ║  branching instruction for this programme.                               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified below.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values reflect explicit human sign-off on source provenance, document
 * identity, licence, and canonical-representation choice, all grounded in
 * concrete evidence gathered by direct inspection (HTTP fetch of the HTML
 * collection page, HTTP fetch + pdfinfo/pdftotext inspection of the PDF,
 * and HTTP fetch of the NCSC terms-and-conditions page) performed during
 * this acquisition programme.
 *
 * This test makes live HTTPS requests to ncsc.gov.uk, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, ico.org.uk
 * (14 sections), bankofengland.co.uk, fda.gov, and bis.org. Allow 20 minutes.
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
import { createAcquisitionRequest } from "../request.js";
import { acquireFreezeAndEvaluate } from "../governed-pipeline.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Human governance review timestamp — decisions recorded 2026-08-06. */
const REVIEW_TIMESTAMP = "2026-08-06T21:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T21:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const NCSC_PDF_URL =
  "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";

// ---------------------------------------------------------------------------
// ICO section URLs for DRA-DOC-0011 near-duplicate check (reused verbatim
// from DRA-ACQ-009's existing-corpus-texts construction)
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";

const SECTION_SLUGS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "/", label: "01 — Landing/index page" },
  { slug: "/whats-new/", label: "02 — What's new" },
  { slug: "/about-this-guidance/", label: "03 — About this guidance" },
  { slug: "/what-are-the-accountability-and-governance-implications-of-ai/", label: "04 — Accountability and governance" },
  { slug: "/how-do-we-ensure-transparency-in-ai/", label: "05 — Transparency" },
  { slug: "/how-do-we-ensure-lawfulness-in-ai/", label: "06 — Lawfulness" },
  { slug: "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/", label: "07 — Accuracy" },
  { slug: "/how-do-we-ensure-fairness-in-ai/", label: "08 — Fairness" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/", label: "09 — Fairness: bias and discrimination" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/", label: "10 — Fairness: Article 22" },
  { slug: "/how-should-we-assess-security-and-data-minimisation-in-ai/", label: "11 — Security and data minimisation" },
  { slug: "/how-do-we-ensure-individual-rights-in-our-ai-systems/", label: "12 — Individual rights" },
  { slug: "/annex-a-fairness-in-the-ai-lifecycle/", label: "13 — Annex A: Fairness in the AI lifecycle" },
  { slug: "/glossary/", label: "14 — Glossary" },
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
  const id = `dra-acq-011-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
//   - Document fetched from ncsc.gov.uk (official NCSC website)
//   - Publisher confirmed as the National Cyber Security Centre (NCSC),
//     part of GCHQ — the UK's national technical authority for cyber security
//   - The candidate-register HTML URL (ncsc.gov.uk/collection/machine-learning)
//     301-redirects to ncsc.gov.uk/collection/machine-learning-principles;
//     this redirect was directly observed and is recorded, not silently
//     assumed away
//   - PDF hosted at ncsc.gov.uk/sites/default/files/documents/ (first-party
//     asset path, not a third-party mirror)
//   - Page metadata confirms Version 2.0, Publish date 22 May 2024,
//     Reviewed 22 May 2024
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-011-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${NCSC_PDF_URL}`,
    "Publisher: National Cyber Security Centre (NCSC), part of GCHQ (UK national technical authority for cyber security)",
    "Candidate-register URL https://www.ncsc.gov.uk/collection/machine-learning observed to 301-redirect to https://www.ncsc.gov.uk/collection/machine-learning-principles — redirect explicitly recorded, not silently treated as still-canonical",
    "PDF hosted at first-party ncsc.gov.uk asset path (sites/default/files/documents/), not a third-party mirror",
    "HTML collection page metadata confirms: Publish date 22 May 2024, Reviewed 22 May 2024, Version 2.0",
    "PDF internal metadata (pdfinfo) confirms CreationDate 2024-05-21, ModDate 2024-05-30 — consistent with the stated publish/review date",
    "Spot-check comparison of HTML section '1.1 Raise awareness of ML threats and risks' against the corresponding PDF section shows identical prose content",
    "HUMAN GOVERNANCE DECISION: NCSC (GCHQ) confirmed as official UK national cyber security authority and canonical publisher of this document — VERIFIED",
  ],
  notes:
    "DRA-ACQ-011 human governance sign-off 2026-08-06. " +
    "NCSC 'Principles for the security of machine learning' official source VERIFIED. " +
    "PDF selected as canonical representation (see docblock for full HTML-vs-PDF comparison).",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Licence basis:
//   Crown copyright, Open Government Licence v3.0 — verified via TWO
//   independent, mutually-corroborating sources (document-specific PDF
//   statement AND sitewide Terms & Conditions), per the explicit instruction
//   not to assume OGL merely because the source is an NCSC/government page.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Crown Copyright — Open Government Licence v3.0",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-011-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "DOCUMENT-SPECIFIC evidence: the PDF's own final content page states " +
      "'\u00A9 Crown copyright 2024. Photographs and infographics may include material " +
      "under licence from third parties and are not available for re-use. Text content " +
      "is licenced for re-use under the Open Government Licence v3.0', with a direct link " +
      "to the OGL v3 text at nationalarchives.gov.uk",
    "SITEWIDE CORROBORATING evidence: https://www.ncsc.gov.uk/section/about-this-website/terms-and-conditions " +
      "states 'Content on the Websites is, unless stated otherwise, subject to Crown copyright ... you may " +
      "use or reuse the content published on the Websites without prior permission but must adhere to and " +
      "accept the terms of the Open Government Licence (OGL) v3.0'",
    "Both the document-specific statement and the sitewide terms independently agree on Crown copyright + OGL v3.0",
    "Third-party material caveat noted and respected: photographs/infographics under third-party licence are excluded from reuse; only text content is relied upon for this benchmark corpus",
    "This licence determination was NOT inferred solely from the source being an NCSC/government domain — explicit document-level and sitewide statements were both located and cited",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE (Crown copyright, OGL v3.0) confirmed with dual corroborating evidence — VERIFIED",
  ],
  notes:
    "DRA-ACQ-011 human governance sign-off 2026-08-06. " +
    "Crown Copyright / OGL v3.0 — VERIFIED via document-specific statement plus sitewide Terms & Conditions corroboration.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Principles for the security of machine learning",
  publisher: "National Cyber Security Centre (NCSC)",
  publicationDate: "2024-05-22",
  version: "2.0",
  domain: "TECHNICAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First UK national cyber security authority (NCSC/GCHQ) publisher in the DRA corpus. " +
  "Extends the TECHNICAL domain with AI/ML-security-specific principles-based guidance, " +
  "structured as five parts (secure design, secure development, secure deployment, secure " +
  "operation, end of life) each with numbered principles, goals, and implementation guidance. " +
  "HIGH difficulty: dense, cross-referenced security guidance covering adversarial ML threats " +
  "(evasion, poisoning, model extraction) with extensive external citations (academic papers, " +
  "standards bodies, other NCSC guidance) — a strong candidate for exercising authority-resolution " +
  "and evidence-linkage issue classes (IC-3 AUTHORITY_ABSENT, IC-4/IC-9 evidence-linkage checks) " +
  "against a genuinely different citation style than prior corpus documents. " +
  "OPEN_LICENCE (Crown copyright, OGL v3.0), verified via dual corroborating evidence. " +
  "Corpus diversity: first NCSC/GCHQ publisher; first UK national-security-domain document.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0014 (reconstructed from admitted records,
// mirrors the ENTRY_* constants in DRA-BMK-014 for a consistent 14-doc
// registry ahead of DRA-DOC-0015 admission)
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

// ---------------------------------------------------------------------------
// Build existing 14-document corpus texts for near-duplicate check
// (DRA-DOC-0001–0014), extending DRA-ACQ-009's construction with DRA-DOC-0014
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
      requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-011-admission-corpus-check",
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

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-011 — Controlled Corpus Admission for DRA-DOC-0015 (NCSC Machine Learning Principles)",
  () => {
    it(
      "verifies determinism, admits DRA-DOC-0015 (NCSC PDF) through eligibility, " +
        "freeze, 15-document corpus integration, and DRA evaluator execution",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-011 — CORPUS ADMISSION LOG                       ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Step 0: Determinism check — two independent live fetches ────────

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000018",
          sourceUrl: NCSC_PDF_URL,
          requestedBy: "DRA-ACQ-011-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "National Cyber Security Centre (NCSC)",
          expectedTitle: "Principles for the security of machine learning",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First NCSC fetch FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000018",
          sourceUrl: NCSC_PDF_URL,
          requestedBy: "DRA-ACQ-011-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "National Cyber Security Centre (NCSC)",
          expectedTitle: "Principles for the security of machine learning",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second NCSC fetch FAILED:", fetchB.code, fetchB.message);
        }
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  fetch A byte length :", fetchA.source.rawBytes.length);
        console.log("  fetch B byte length :", fetchB.source.rawBytes.length);
        console.log("  fetch A sourceDigest:", digestA);
        console.log("  fetch B sourceDigest:", digestB);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(digestA).toBe(digestB);

        console.log("  BYTE_STABLE: two independent fetches produced identical SHA-256 ✓");

        // ── Step 1: Setup — build 14-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 14-Document Registry ──────────────");

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

        console.log(`  14-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(14);
        expect(registry.hasId("DRA-DOC-0015")).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-011",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
        });

        // ── Step 2: Build existing corpus texts (near-duplicate scope) ──────

        console.log("\n── Step 2: Build 14-Document Existing Corpus Texts ─────────");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008–0014: live fetch (8 sources)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);
        console.log(`  Total texts built: ${existingCorpusTexts.length}`);
        expect(existingCorpusTexts.length).toBe(14);

        // ── Step 3: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 3: Acquisition Request (DRA-ACQ-000018) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000018",
          sourceUrl: NCSC_PDF_URL,
          requestedBy: "DRA-ACQ-011-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "National Cyber Security Centre (NCSC)",
          expectedTitle: "Principles for the security of machine learning",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 4: Run full governed pipeline (fetch → freeze → integrate → evaluate) ─

        console.log("\n── Step 4: Governed Pipeline — acquireFreezeAndEvaluate ─────");

        const pipelineResult = await acquireFreezeAndEvaluate(
          {
            request,
            officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
            licenceAssessment: LICENCE_ASSESSMENT,
            approvedMetadata: APPROVED_METADATA,
            corpusDocumentId: "DRA-DOC-0015",
            freezeRecordId: "DRA-FRZ-000009",
            frozenBy: "DRA-ACQ-011-human-governance-operator",
            benchmarkVersion: CORPUS_VERSION,
            inclusionRationale: INCLUSION_RATIONALE,
            existingCorpusTexts,
          },
          {
            fetcher,
            pdfExtractor: extractPdfText,
            registry,
            protocol,
            fixedTimestamp: FREEZE_TIMESTAMP,
          },
        );

        if (!pipelineResult.ok) {
          console.error("Pipeline FAILED at stage:", pipelineResult.stage);
          console.error("Errors:", JSON.stringify(pipelineResult.errors, null, 2));
        }
        expect(pipelineResult.ok).toBe(true);
        if (!pipelineResult.ok) return;

        const { result } = pipelineResult;

        // ── Freeze record log ────────────────────────────────────────────────

        console.log("\n── Freeze Record ────────────────────────────────────────────");
        console.log("  freezeRecordId       :", result.freeze.freezeRecordId);
        console.log("  corpusDocumentId     :", result.freeze.corpusDocumentId);
        console.log("  acquisitionId        :", result.freeze.acquisitionId);
        console.log("  sourceUrl            :", result.freeze.sourceUrl);
        console.log("  finalUrl             :", result.freeze.finalUrl);
        console.log("  sourceDigest         :", result.freeze.sourceDigest);
        console.log("  normalisedTextDigest :", result.freeze.normalisedTextDigest);
        console.log("  metadataDigest       :", result.freeze.metadataDigest);
        console.log("  freezeRecordDigest   :", result.freeze.freezeRecordDigest);
        console.log("  frozenAt             :", result.freeze.frozenAt);
        console.log("  frozenBy             :", result.freeze.frozenBy);
        console.log("  benchmarkVersion     :", result.freeze.benchmarkVersion);
        console.log("  normalisationVersion :", result.freeze.normalisationVersion);
        console.log("  status               :", result.freeze.status);

        expect(result.freeze.freezeRecordId).toBe("DRA-FRZ-000009");
        expect(result.freeze.corpusDocumentId).toBe("DRA-DOC-0015");
        expect(result.freeze.acquisitionId).toBe("DRA-ACQ-000018");
        expect(result.freeze.sourceDigest).toBe(digestA);
        expect(result.freeze.normalisedTextDigest).toBeTruthy();
        expect(result.freeze.metadataDigest).toBeTruthy();
        expect(result.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (15 documents) ───────────────────────────");
        console.log("  schemaVersion  :", result.manifest.schemaVersion);
        console.log("  corpusVersion  :", result.manifest.corpusVersion);
        console.log("  documentCount  :", result.manifest.documentCount);
        console.log("  overallDigest  :", result.manifest.overallDigest);
        console.log("  documentIds    :");
        for (const id of result.manifest.documentIds) {
          console.log(`    ${id}`);
        }

        expect(result.manifest.documentCount).toBe(15);
        expect(result.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(result.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.manifest.documentIds).toHaveLength(15);
        expect(result.manifest.documentIds).toContain("DRA-DOC-0015");
        expect(result.manifest.documentIds[14]).toBe("DRA-DOC-0015");
        expect(result.manifestDigest).toBe(result.manifest.overallDigest);

        const manifestIntact = verifyManifestIntegrity(result.manifest);
        console.log(`  manifest integrity check : ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
        expect(manifestIntact).toBe(true);

        // ── DRA Evaluator execution log ──────────────────────────────────────

        console.log("\n── DRA Evaluator Execution ──────────────────────────────────");
        console.log("  decision                 :", result.decision);
        console.log("  evaluationTimestamp      :", result.proofReference.evaluationTimestamp);

        expect(result.evaluationResult.ok).toBe(true);
        const evalSuccess = result.evaluationResult.ok ? result.evaluationResult : null;
        expect(evalSuccess).not.toBeNull();
        if (!evalSuccess) return;

        const receipt = evalSuccess.proofReceipt as Record<string, unknown>;
        const identity = receipt["evaluatorIdentity"] as Record<string, unknown> | undefined;

        console.log("  evaluatorVersion         :", identity?.["evaluatorVersion"]);
        console.log("  pipelineVersion          :", identity?.["pipelineVersion"]);
        console.log("  receipt schemaVersion    :", receipt["schemaVersion"]);
        console.log("  substantiveDigest        :", result.proofReference.proofReceiptSubstantiveDigest);

        const pipeLog = evalSuccess.pipeline as Record<string, unknown>;
        const s2Log = pipeLog["stage2"] as Record<string, unknown> | undefined;
        const stmtsLog = ((s2Log?.["statements"] ?? s2Log?.["claims"] ?? []) as unknown[]).length;
        const s6Log = pipeLog["consistencyCheck"] as Record<string, unknown> | undefined;
        const issuesLog = ((s6Log?.["issues"] ?? (evalSuccess as unknown as Record<string, unknown>)["issues"] ?? []) as unknown[]).length;

        console.log("  statementCount           :", stmtsLog);
        console.log("  issueCount               :", issuesLog);

        // Evaluator version invariants — evaluator v0.1.1, pipeline 1.0, receipt schema 0.1.0
        // (must remain unchanged by this acquisition; see DRA-EVAL-002/002A).
        expect(identity?.["evaluatorVersion"]).toBe("0.1.1");
        expect(identity?.["pipelineVersion"]).toBe("1.0");
        expect(receipt["schemaVersion"]).toBe("0.1.0");

        // ── Proof reference log ──────────────────────────────────────────────

        console.log("\n── Proof Reference ─────────────────────────────────────────");
        console.log("  freezeRecordId               :", result.proofReference.freezeRecordId);
        console.log("  corpusDocumentId             :", result.proofReference.corpusDocumentId);
        console.log("  sourceDigest                 :", result.proofReference.sourceDigest);
        console.log("  normalisedTextDigest         :", result.proofReference.normalisedTextDigest);
        console.log("  metadataDigest               :", result.proofReference.metadataDigest);
        console.log("  freezeRecordDigest           :", result.proofReference.freezeRecordDigest);
        console.log("  proofReceiptSubstantiveDigest:", result.proofReference.proofReceiptSubstantiveDigest);
        console.log("  evaluationTimestamp          :", result.proofReference.evaluationTimestamp);

        expect(result.proofReference.freezeRecordId).toBe("DRA-FRZ-000009");
        expect(result.proofReference.corpusDocumentId).toBe("DRA-DOC-0015");
        expect(result.proofReference.proofReceiptSubstantiveDigest).toBeTruthy();

        console.log("\n── Benchmark Result Summary (15-Document Checkpoint Input) ──");
        console.log("  Benchmark Document ID :", result.proofReference.corpusDocumentId);
        console.log("  Freeze Record ID      :", result.freeze.freezeRecordId);
        console.log("  Corpus Manifest Digest:", result.manifestDigest);
        console.log("  Corpus Size           :", result.manifest.documentCount);
        console.log("  Decision              :", result.decision);
        console.log("  Evaluation Timestamp  :", result.proofReference.evaluationTimestamp);

        console.log("\n── Admission Complete ────────────────────────────────────────");
        console.log("  Document:        DRA-DOC-0015 — Principles for the security of machine learning");
        console.log("  Publisher:       National Cyber Security Centre (NCSC)");
        console.log("  Freeze record:   DRA-FRZ-000009");
        console.log("  Source digest:  ", result.freeze.sourceDigest);
        console.log("  Text digest:    ", result.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", result.freeze.metadataDigest);
        console.log("  Freeze digest:  ", result.freeze.freezeRecordDigest);
        console.log("  Manifest digest:", result.manifestDigest);
        console.log("  Corpus size:     15 documents");
        console.log("  Status:          FROZEN");
        console.log("  Decision:       ", result.decision);
        console.log("  Licence:         OPEN_LICENCE (Crown Copyright, OGL v3.0)");
        console.log("  Next step:       DRA-BMK-015 — Fifteen-Document Corpus Checkpoint (if requested)");
      },
      1_200_000, // 20 minutes
    );
  },
);
