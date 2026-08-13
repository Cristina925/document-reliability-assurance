/**
 * DRA-ACQ-018 — Phase 2: Deterministic Acquisition, Governance, Freeze and
 * Admission of DRA-DOC-0022 (European Environment Agency — "Tracking waste
 * prevention progress", EEA Report 02/2023)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-018 PHASE 2                             ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-018-01, the QUALIFIED_RECOMMENDED primary candidate  ║
 * ║  selected at the close of DRA-ACQ-018 Phase 1 (see                       ║
 * ║  discovery/dra-acq-018-evidence-gap-discovery.ts). Phase 1 was ACCEPTED  ║
 * ║  by the user; this test performs the accepted Phase 2 work only.         ║
 * ║                                                                          ║
 * ║  Document:   "Tracking waste prevention progress — A narrative-based     ║
 * ║              waste prevention monitoring framework at the EU level"      ║
 * ║  Report No.: EEA Report 02/2023 (ISBN 978-92-9480-556-0,                 ║
 * ║              ISSN 1977-8449, doi:10.2800/612143)                         ║
 * ║  Corpus ID:  DRA-DOC-0022                                                ║
 * ║  Freeze ID:  DRA-FRZ-000016                                              ║
 * ║  Acquisition ID: DRA-ACQ-000025 (programme ref: DRA-ACQ-018)             ║
 * ║  Publisher:  European Environment Agency (EEA)                          ║
 * ║  Source:     PDF — single document, 94 pages, A4                        ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.eea.europa.eu/en/analysis/publications/tracking-waste-    ║
 * ║    prevention-progress/tracking-waste-prevention-progress/@@download/file║
 * ║                                                                          ║
 * ║  PURPOSE: formally acquire, govern, freeze, and admit the EEA report as  ║
 * ║  DRA-DOC-0022, growing the corpus 21 → 22, following the accepted        ║
 * ║  DRA-ACQ-018 Phase 1 recommendation. This is NOT a demonstration of any  ║
 * ║  expected decision or issue class — H22 is an open question (see         ║
 * ║  discovery module), and the admission-time evaluator run below is a      ║
 * ║  required side effect of the standard governed pipeline                  ║
 * ║  (acquireFreezeAndEvaluate()), recorded verbatim, without any            ║
 * ║  expectation that it matches any prior document's decision.              ║
 * ║                                                                          ║
 * ║  RE-VERIFICATION (this acquisition, 2026-08-10):                        ║
 * ║  - Availability: the canonical PDF URL was re-fetched live TWICE,        ║
 * ║    independently (both HTTP 200, content-type application/pdf,          ║
 * ║    1,838,985 bytes both times, SHA-256                                   ║
 * ║    238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d both  ║
 * ║    times), matching the digest already recorded during DRA-ACQ-018       ║
 * ║    Phase 1 discovery exactly — BYTE_STABLE.                              ║
 * ║  - pdfinfo confirms: Title "Tracking waste prevention progress", Author  ║
 * ║    "EEA", 94 pages, PDF 1.5, CreationDate 2023-04-28. The PDF's own      ║
 * ║    front matter states "EEA Report 02/2023" and "© European Environment  ║
 * ║    Agency, 2023. Reproduction is authorised provided the source is       ║
 * ║    acknowledged." — no document-specific licence override or            ║
 * ║    third-party exclusion notice was found in the front matter.           ║
 * ║  - Licence: re-fetched the EEA's institution-wide legal notice           ║
 * ║    (eea.europa.eu/en/legal-notice) live today; it states "EEA materials  ║
 * ║    are published under the CC-BY license" (linking to                   ║
 * ║    creativecommons.org/licenses/by/4.0/) and that EEA material "may be   ║
 * ║    re-used without prior permission, free of charge, for commercial or   ║
 * ║    non-commercial purposes, provided that the EEA is always              ║
 * ║    acknowledged" — matching and reconfirming the Phase 1 finding, with   ║
 * ║    no narrower document-specific override found either on the legal-    ║
 * ║    notice page or in the report's own front matter.                      ║
 * ║  - Official source: EEA's own first-party domain (eea.europa.eu),        ║
 * ║    served from the EEA's own Volto/Plone publications CMS, with a        ║
 * ║    canonical content-disposition filename                               ║
 * ║    ("TH-AL-23-002-EN-N Tracking waste prevention FINAL.pdf") matching    ║
 * ║    the exact artefact qualified in Phase 1 — no mirror or third-party    ║
 * ║    republication host was used.                                          ║
 * ║                                                                          ║
 * ║  CLASSIFICATION NOTE: domain classified GENERAL (environmental-policy    ║
 * ║  monitoring does not map more precisely onto BUSINESS/TECHNICAL/LEGAL/   ║
 * ║  HEALTHCARE/FINANCE; matches the precedent already used for CMA/INE      ║
 * ║  GENERAL-domain documents), documentType REPORT (nearest existing        ║
 * ║  taxonomy value; no bespoke "environmental monitoring report" category   ║
 * ║  exists and none is created here), language "en", difficulty HIGH (94    ║
 * ║  pages, formal multi-indicator methodology, technical annex).            ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE (belongs to a future DRA-BMK-022, explicitly NOT run       ║
 * ║  here): any comparison between DRA-DOC-0022's decision/issues and any    ║
 * ║  other corpus document's outcome; any H22 conclusion. This test performs ║
 * ║  acquisition, freeze, and corpus admission ONLY, via the unmodified      ║
 * ║  standard DRA-ENG-009 governed pipeline (acquireFreezeAndEvaluate()),    ║
 * ║  which necessarily runs the frozen evaluator to produce the corpus       ║
 * ║  entry's decision and proof receipt as a required pipeline side effect,  ║
 * ║  not a benchmark-comparison analysis. Whatever decision the evaluator    ║
 * ║  actually returns is recorded verbatim below.                            ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run: the governed   ║
 * ║  pipeline's near-duplicate detector is optional (only engaged when       ║
 * ║  `existingCorpusTexts` is supplied) and is skipped in this test. The 21  ║
 * ║  existing corpus documents' metadata (not their full text) is loaded    ║
 * ║  into the registry below so corpus-ID/digest duplicate checks and the    ║
 * ║  21→22 manifest transition are still fully exercised; only the          ║
 * ║  *content*-similarity near-duplicate check is skipped, which is a        ║
 * ║  reasonable and explicitly documented scope reduction given this         ║
 * ║  document's subject matter (EU circular-economy/waste-policy            ║
 * ║  monitoring) is not substantively similar to any of the 21 existing      ║
 * ║  corpus documents (none of which addresses environmental/waste policy).  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified below. The
 * software does NOT auto-approve any assessment — the VERIFIED status
 * values reflect explicit human sign-off, grounded in concrete evidence
 * gathered by direct inspection (HTTP GET of the canonical PDF URL,
 * performed twice independently today, HTTP GET of the EEA's institution-
 * wide legal-notice page today, and pdfinfo/pdftotext inspection of the
 * PDF's own front matter) performed during this DRA-ACQ-018 Phase 2
 * acquisition.
 *
 * This test makes live HTTPS requests to eea.europa.eu (PDF, twice for
 * determinism, plus the legal-notice page is verified out-of-band and
 * recorded as evidence text below rather than re-fetched inside the test).
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

/** Human governance review timestamp — decisions recorded 2026-08-10. */
const REVIEW_TIMESTAMP = "2026-08-10T12:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-10T12:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0022 candidate
// ---------------------------------------------------------------------------

const EEA_WASTE_PDF_URL =
  "https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file";

/** Digest established during DRA-ACQ-018 Phase 1 discovery. */
const EXPECTED_SOURCE_DIGEST =
  "238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-018-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-018-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${EEA_WASTE_PDF_URL}`,
    "Publisher: European Environment Agency (EEA), hosted on its own first-party domain (eea.europa.eu), " +
      "served from the EEA's own Volto/Plone publications CMS — no mirror or third-party republication host.",
    "pdfinfo confirms Title 'Tracking waste prevention progress', Author 'EEA', 94 pages, CreationDate " +
      "2023-04-28. The PDF's own front matter states 'EEA Report 02/2023', 'European Environment Agency, " +
      "Kongens Nytorv 6, 1050 Copenhagen K, Denmark', ISBN 978-92-9480-556-0, ISSN 1977-8449, " +
      "doi:10.2800/612143, and 'Luxembourg: Publications Office of the European Union, 2023'.",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition): two independent GET requests to the canonical URL both " +
      "return HTTP 200, content-type application/pdf, content-disposition confirming the canonical filename " +
      "'TH-AL-23-002-EN-N Tracking waste prevention FINAL.pdf', 1,838,985 bytes both times, identical to the " +
      "DRA-ACQ-018 Phase 1 discovery measurement.",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-018 Phase 1 (DRA-CAND-018-01) — " +
      "same URL, same byte length (1,838,985), same SHA-256 digest " +
      "(238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d).",
    "HUMAN GOVERNANCE DECISION: European Environment Agency confirmed as the official publisher and canonical " +
      "source of this document — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-018 Phase 2 human governance sign-off 2026-08-10. " +
    "EEA 'Tracking waste prevention progress' (EEA Report 02/2023) official source VERIFIED.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED — CC BY 4.0, re-verified live for this acquisition.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
  licenceUrl: "https://www.eea.europa.eu/en/legal-notice",
  licenceBasis: "CREATIVE_COMMONS_BY" as const,
  assessedBy: "DRA-ACQ-018-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition): the EEA's institution-wide legal notice " +
      "(eea.europa.eu/en/legal-notice) states 'EEA materials are published under the CC-BY license' " +
      "(linking to creativecommons.org/licenses/by/4.0/), and that material 'may be re-used without prior " +
      "permission, free of charge, for commercial or non-commercial purposes, provided that the EEA is always " +
      "acknowledged as the original source of the material and that the original meaning or message of the " +
      "content is not distorted.'",
    "DOCUMENT-SPECIFIC NOTICE CHECKED: the PDF's own front-matter copyright notice reads '© European " +
      "Environment Agency, 2023. Reproduction is authorised provided the source is acknowledged.' — this does " +
      "NOT narrow or override the site-wide CC BY 4.0 grant; it is consistent attribution-only language.",
    "THIRD-PARTY MATERIAL CHECKED: the report's cover credits a third-party photographer ('Cover photo: (c) " +
      "Stanislav Shmelev, NATURE@work/EEA') and lists research-partner co-authorship (IVL Swedish " +
      "Environmental Research Institute, VTT Technical Research Centre of Finland, VITO) in its acknowledgements. " +
      "These are attribution notices for contributors to an EEA-owned publication, not separate third-party " +
      "copyright holders asserting independent rights over the report text — the EEA's site-wide licence " +
      "governs the publication as a whole, consistent with the precedent already accepted for other " +
      "EU-institution documents in this corpus (DRA-DOC-0018/0020/0021). No third-party notice was found that " +
      "excludes any part of the report from the CC BY 4.0 grant.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this licence: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation — all consistent " +
      "with a CC BY 4.0 grant that permits reproduction, adaptation, and distribution provided attribution is " +
      "given; this acquisition does not republish the full text externally.",
    "HUMAN GOVERNANCE DECISION: CREATIVE_COMMONS_BY (CC BY 4.0) confirmed via the EEA's institution-wide legal " +
      "notice, with no document-specific or third-party override found — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-018 Phase 2 human governance sign-off 2026-08-10. " +
    "CC BY 4.0 — VERIFIED via the EEA's institution-wide legal notice, matching the DRA-ACQ-018 Phase 1 finding.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Tracking waste prevention progress — A narrative-based waste prevention monitoring framework at the EU level",
  publisher: "European Environment Agency (EEA)",
  publicationDate: "2023",
  domain: "GENERAL" as const,
  documentType: "REPORT" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-018 Phase 1 (see " +
  "discovery/dra-acq-018-evidence-gap-discovery.ts, DRA-CAND-018-01): the highest-scoring candidate (17/23) " +
  "among five genuinely researched, live-verified candidates, ranked by a pre-declared 9-dimension diversity/" +
  "novelty scoring rubric fixed before any candidate was scored. " +
  "Addresses the top-ranked evidence gap identified in Phase 1: domain-balance and AI-governance " +
  "deconcentration (TECHNICAL held 5 of 15 real acquisitions, 3 of which were AI-governance material " +
  "specifically). This document is deliberately outside TECHNICAL and outside AI governance entirely — " +
  "European Environment Agency is a new authority type, and environmental/circular-economy waste-policy " +
  "monitoring is a new subject-matter context. " +
  "Also addresses new-structural-complexity (rank 4): a formal three-step methodology, quantitative indicator " +
  "tables organised by cluster, and a numbered technical annex ('Annex 1 — All indicators and RACER " +
  "evaluation results') scoring each indicator against Relevance/Acceptance/Credibility/Ease/Robustness " +
  "criteria — a multi-indicator monitoring-framework structure not previously represented in the corpus. " +
  "No H22 conclusion, expected decision, or expected issue-class outcome is assumed by this inclusion " +
  "rationale; whatever the frozen evaluator (version 0.1.2) actually returns for this document is recorded " +
  "verbatim in the admission test below.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0021 (reconstructed from admitted records,
// extending the DRA-ACQ-017 Phase 2 21-document construction with
// DRA-DOC-0021 for a consistent 21-document registry ahead of DRA-DOC-0022
// admission). Metadata only — no text content is required by
// CorpusDocumentInput, and the (optional) near-duplicate check is
// intentionally not exercised in this test (see docblock SCOPE NOTE above).
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

const HSE_BASE = "https://www.hse.gov.uk/simple-health-safety";
const DRA_DOC_0016_LANDING_URL = `${HSE_BASE}/`;

const ENTRY_0016: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0016",
  title: "Health and safety basics for your business",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "BUSINESS",
  language: "en-GB",
  generator: "Health and Safety Executive (HSE)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (multi-page HTML, 26 pages) from " +
    DRA_DOC_0016_LANDING_URL,
  sourceReference: DRA_DOC_0016_LANDING_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "LOW",
  notes:
    "Acquisition ID: DRA-ACQ-000019 (programme ref: DRA-ACQ-012). " +
    "Freeze record: DRA-FRZ-000010. " +
    "Publication date: 2025-10-14. Multi-page HTML: 26 pages. " +
    "Second BUSINESS-domain document (joins DRA-DOC-0008, Acas).",
};

const MHRA_PDF_URL =
  "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";

const ENTRY_0017: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0017",
  title: "Best practice guidance on patient information leaflets (PILs)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "HEALTHCARE",
  language: "en-GB",
  generator: "Medicines and Healthcare products Regulatory Agency (MHRA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009 from " + MHRA_PDF_URL,
  sourceReference: MHRA_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000020 (programme ref: DRA-ACQ-013). " +
    "Freeze record: DRA-FRZ-000011. " +
    "Publication date: 2014-12-29. Reproducibility: BYTE_STABLE. " +
    "Licence: Crown Copyright — Open Government Licence v3.0. " +
    "Second HEALTHCARE-domain document (joins DRA-DOC-0013, FDA). New publisher: MHRA.",
};

const EC_ETHICS_ES_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";

const ENTRY_0018: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0018",
  title: "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "es",
  generator: "European Commission — High-Level Expert Group on Artificial Intelligence",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from " +
    EC_ETHICS_ES_PDF_URL,
  sourceReference: EC_ETHICS_ES_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000021 (programme ref: DRA-ACQ-014 Phase 2 retry). " +
    "Freeze record: DRA-FRZ-000012. " +
    "Publication date: 2019-04-08. " +
    "First Spanish-language (es) document in the corpus. First European Commission publisher.",
};

const INE_PDF_URL = "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf";

const ENTRY_0019: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0019",
  title:
    "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
    "Prácticas de las Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico " +
    "Nacional — España",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "es",
  generator: "Instituto Nacional de Estadística (INE)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009 from " + INE_PDF_URL,
  sourceReference: INE_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000022 (programme ref: DRA-ACQ-015). " +
    "Freeze record: DRA-FRZ-000013. " +
    "Publication date: 2022-07. " +
    "Second Spanish-language (es) document in the corpus. New publisher: INE.",
};

const CNIL_PDF_URL =
  "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf";

const ENTRY_0020: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0020",
  title:
    "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de " +
    "l'intelligence artificielle",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "LEGAL",
  language: "fr",
  generator: "Commission Nationale de l'Informatique et des Libertés (CNIL)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from " +
    CNIL_PDF_URL,
  sourceReference: CNIL_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000023 (programme ref: DRA-ACQ-016). " +
    "Freeze record: DRA-FRZ-000014. " +
    "Publication date: 2017-12. " +
    "First French-language (fr) document in the corpus. New publisher: CNIL. " +
    "Licence: CREATIVE_COMMONS_BY_ND (CC-BY-ND 4.0 FR).",
};

const EC_ETHICS_EN_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419";

const ENTRY_0021: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0021",
  title: "Ethics Guidelines for Trustworthy AI",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "en",
  generator: "European Commission — High-Level Expert Group on Artificial Intelligence",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from " +
    EC_ETHICS_EN_PDF_URL,
  sourceReference: EC_ETHICS_EN_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000024 (programme ref: DRA-ACQ-017). " +
    "Freeze record: DRA-FRZ-000015. " +
    "Publication date: 2019-04-08. " +
    "Official English edition; parallel-language pair with DRA-DOC-0018 (Spanish, doc_id=60423). " +
    "Actual evaluator result: REVIEW, 7 issues, EVIDENCE_INADEQUATE (see DRA-BMK-021/DRA-CHK-003/005).",
};

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-018 Phase 2 — Controlled Corpus Admission for DRA-DOC-0022 (EEA, Tracking waste prevention progress)",
  () => {
    it(
      "verifies determinism via two independent live acquisitions, confirms official-source and licence " +
        "governance, and admits DRA-DOC-0022 (EEA PDF) through eligibility, freeze, 22-document corpus " +
        "integration, and DRA evaluator execution — recording whatever decision the frozen evaluator " +
        "actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-018 PHASE 2 — CORPUS ADMISSION LOG               ║");
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
          acquisitionId: "DRA-ACQ-000025",
          sourceUrl: EEA_WASTE_PDF_URL,
          requestedBy: "DRA-ACQ-018-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "European Environment Agency (EEA)",
          expectedTitle: "Tracking waste prevention progress",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First EEA fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000025",
          sourceUrl: EEA_WASTE_PDF_URL,
          requestedBy: "DRA-ACQ-018-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "European Environment Agency (EEA)",
          expectedTitle: "Tracking waste prevention progress",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second EEA fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
        }
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  Acquisition A HTTP status :", fetchA.source.httpStatus);
        console.log("  Acquisition A mediaType   :", fetchA.source.mediaType);
        console.log("  Acquisition A byte length :", fetchA.source.rawBytes.length);
        console.log("  Acquisition A sourceDigest:", digestA);
        console.log("  Acquisition B HTTP status :", fetchB.source.httpStatus);
        console.log("  Acquisition B byte length :", fetchB.source.rawBytes.length);
        console.log("  Acquisition B sourceDigest:", digestB);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchB.source.httpStatus).toBe(200);
        expect(fetchB.source.mediaType).toBe("application/pdf");
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(fetchA.source.rawBytes.length).toBe(1_838_985);
        expect(digestA).toBe(digestB);
        // Cross-check against the digest recorded during Phase 1 discovery.
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-018 Phase 1 discovery digest ✓");

        // ── Step 1: Setup — build 21-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 21-Document Registry ──────────────");

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
        registry.add(ENTRY_0016);
        registry.add(ENTRY_0017);
        registry.add(ENTRY_0018);
        registry.add(ENTRY_0019);
        registry.add(ENTRY_0020);
        registry.add(ENTRY_0021);

        console.log(`  21-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(21);
        expect(registry.hasId("DRA-DOC-0022")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-018",
          protocolStatus: "APPROVED",
          targetCorpusSize: 22,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          // Extends the default with every language code already present in
          // the 21-document registry: "es" (DRA-DOC-0018, DRA-DOC-0019) and
          // "fr" (DRA-DOC-0020). "en" (this candidate) and "en-GB" are
          // already covered by the default.
          permittedLanguages: ["en", "en-GB", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000025) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000025",
          sourceUrl: EEA_WASTE_PDF_URL,
          requestedBy: "DRA-ACQ-018-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "European Environment Agency (EEA)",
          expectedTitle: "Tracking waste prevention progress",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 3: Run full governed pipeline (fetch → freeze → integrate → evaluate) ─
        //
        // NOTE: `existingCorpusTexts` is intentionally omitted — the
        // (optional) near-duplicate content check is not exercised in this
        // test (see docblock SCOPE NOTE). The corpus-ID/digest duplicate
        // checks above and the CorpusRegistry integration below are fully
        // exercised.

        console.log("\n── Step 3: Governed Pipeline — acquireFreezeAndEvaluate ─────");

        const pipelineResult = await acquireFreezeAndEvaluate(
          {
            request,
            officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
            licenceAssessment: LICENCE_ASSESSMENT,
            approvedMetadata: APPROVED_METADATA,
            corpusDocumentId: "DRA-DOC-0022",
            freezeRecordId: "DRA-FRZ-000016",
            frozenBy: "DRA-ACQ-018-human-governance-operator",
            benchmarkVersion: CORPUS_VERSION,
            inclusionRationale: INCLUSION_RATIONALE,
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

        expect(result.freeze.freezeRecordId).toBe("DRA-FRZ-000016");
        expect(result.freeze.corpusDocumentId).toBe("DRA-DOC-0022");
        expect(result.freeze.acquisitionId).toBe("DRA-ACQ-000025");
        expect(result.freeze.sourceDigest).toBe(digestA);
        expect(result.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(result.freeze.normalisedTextDigest).toBeTruthy();
        expect(result.freeze.metadataDigest).toBeTruthy();
        expect(result.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (22 documents) ───────────────────────────");
        console.log("  schemaVersion  :", result.manifest.schemaVersion);
        console.log("  corpusVersion  :", result.manifest.corpusVersion);
        console.log("  documentCount  :", result.manifest.documentCount);
        console.log("  overallDigest  :", result.manifest.overallDigest);
        console.log("  documentIds    :");
        for (const id of result.manifest.documentIds) {
          console.log(`    ${id}`);
        }

        expect(result.manifest.documentCount).toBe(22);
        expect(result.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(result.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.manifest.documentIds).toHaveLength(22);
        expect(result.manifest.documentIds).toContain("DRA-DOC-0022");
        expect(result.manifest.documentIds[21]).toBe("DRA-DOC-0022");
        expect(result.manifestDigest).toBe(result.manifest.overallDigest);

        // Confirm no existing document entry changed: every one of the 21
        // prior IDs is still present, unmodified, ahead of the new entry.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          "DRA-DOC-0007", "DRA-DOC-0008", "DRA-DOC-0009", "DRA-DOC-0010",
          "DRA-DOC-0011", "DRA-DOC-0012", "DRA-DOC-0013", "DRA-DOC-0014",
          "DRA-DOC-0015", "DRA-DOC-0016", "DRA-DOC-0017", "DRA-DOC-0018",
          "DRA-DOC-0019", "DRA-DOC-0020", "DRA-DOC-0021",
        ];
        for (const id of priorIds) {
          expect(result.manifest.documentIds).toContain(id);
        }
        expect(result.manifest.documentIds.slice(0, 21)).toEqual(priorIds);

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
        const issuesArrLog = (s6Log?.["issues"] ?? (evalSuccess as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
          Record<string, unknown>
        >;
        const issueClassesLog = Array.from(
          new Set(issuesArrLog.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
        );

        console.log("  statementCount           :", stmtsLog);
        console.log("  issueCount               :", issuesArrLog.length);
        console.log("  issueClasses             :", JSON.stringify(issueClassesLog));

        // Evaluator version invariants — evaluator 0.1.2, pipeline 1.0,
        // receipt schema 0.1.0 (must remain unchanged by this acquisition —
        // DRA-DOC-0022 is the first new acquisition after the 0.1.2
        // evaluator correction sequence, per this programme's explicit
        // requirement). These assertions confirm evaluator identity was NOT
        // modified — they do NOT assert or assume any particular decision
        // outcome.
        expect(identity?.["evaluatorVersion"]).toBe("0.1.2");
        expect(identity?.["pipelineVersion"]).toBe("1.0");
        expect(receipt["schemaVersion"]).toBe("0.1.0");

        // No assumption about which decision the evaluator returns — only
        // that it is one of the evaluator's defined decision values.
        expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(result.decision);

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

        expect(result.proofReference.freezeRecordId).toBe("DRA-FRZ-000016");
        expect(result.proofReference.corpusDocumentId).toBe("DRA-DOC-0022");
        expect(result.proofReference.proofReceiptSubstantiveDigest).toBeTruthy();
        expect(result.proofReference.proofReceiptSubstantiveDigest).toMatch(/^[0-9a-f]{64}$/);

        console.log("\n── Benchmark Result Summary (22-Document Corpus Input) ──────");
        console.log("  Benchmark Document ID :", result.proofReference.corpusDocumentId);
        console.log("  Freeze Record ID      :", result.freeze.freezeRecordId);
        console.log("  Corpus Manifest Digest:", result.manifestDigest);
        console.log("  Corpus Size           :", result.manifest.documentCount);
        console.log("  Decision              :", result.decision);
        console.log("  Issue Count           :", issuesArrLog.length);
        console.log("  Issue Classes         :", JSON.stringify(issueClassesLog));
        console.log("  Evaluation Timestamp  :", result.proofReference.evaluationTimestamp);

        console.log("\n── Admission Complete ────────────────────────────────────────");
        console.log("  Document:        DRA-DOC-0022 — Tracking waste prevention progress (EEA Report 02/2023)");
        console.log("  Publisher:       European Environment Agency (EEA)");
        console.log("  Freeze record:   DRA-FRZ-000016");
        console.log("  Source digest:  ", result.freeze.sourceDigest);
        console.log("  Text digest:    ", result.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", result.freeze.metadataDigest);
        console.log("  Freeze digest:  ", result.freeze.freezeRecordDigest);
        console.log("  Manifest digest:", result.manifestDigest);
        console.log("  Corpus size:     22 documents");
        console.log("  Status:          FROZEN");
        console.log("  Decision:       ", result.decision);
        console.log("  Licence:         CREATIVE_COMMONS_BY (CC BY 4.0) — EEA institution-wide legal notice");
        console.log("  Next step:       DRA-BMK-022 (NOT run in this phase) — pending user review");
      },
      600_000, // 10 minutes
    );
  },
);
