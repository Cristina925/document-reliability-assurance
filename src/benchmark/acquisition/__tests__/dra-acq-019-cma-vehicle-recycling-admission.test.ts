/**
 * DRA-ACQ-019 — Phase 2: Freeze and Admission of DRA-DOC-0023
 * (Competition and Markets Authority — Competition Act 1998 decision,
 * "Anti-competitive conduct in relation to vehicle recycling and advertising
 * of recycling-related features", Case 51098, 1 April 2025)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-019 PHASE 2                              ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-019-01, the QUALIFIED_RECOMMENDED primary candidate  ║
 * ║  selected at the close of DRA-ACQ-019 Phase 1 (see                       ║
 * ║  discovery/dra-acq-019-enforcement-decision-discovery.ts). Phase 1 was   ║
 * ║  ACCEPTED by the user; this test performs the accepted Phase 2 work      ║
 * ║  only — governance re-confirmation, admission-time live retrieval,       ║
 * ║  freeze, normalisation, and corpus admission via the standard governed   ║
 * ║  pipeline. It does NOT predict or engineer any particular evaluator      ║
 * ║  decision — that is exclusively DRA-BMK-023's job.                       ║
 * ║                                                                          ║
 * ║  Document:   Decision — Competition Act 1998 — "Anti-competitive         ║
 * ║              conduct in relation to vehicle recycling and advertising    ║
 * ║              of recycling-related features" — Case 51098                ║
 * ║  Corpus ID:  DRA-DOC-0023                                                ║
 * ║  Freeze ID:  DRA-FRZ-000017                                              ║
 * ║  Acquisition ID: DRA-ACQ-000026 (programme ref: DRA-ACQ-019)             ║
 * ║  Publisher:  Competition and Markets Authority (CMA)                     ║
 * ║  Source:     PDF, 4,088,160 bytes, ~226+ pages                          ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://assets.publishing.service.gov.uk/media/                      ║
 * ║    68260527c3d769b1824e642f/Final_decision_.pdf                         ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-10,           ║
 * ║  performed independently of the DRA-ACQ-019 Phase 1 discovery record):  ║
 * ║  - Official source: the exact decision URL above is linked directly     ║
 * ║    from the CMA's own official case page on gov.uk                      ║
 * ║    (gov.uk/cma-cases/suspected-anti-competitive-conduct-in-relation-to-  ║
 * ║    the-recycling-of-end-of-life-vehicles), confirmed live today (HTTP    ║
 * ║    200) and served from assets.publishing.service.gov.uk (the UK        ║
 * ║    Government's official asset-hosting domain).                         ║
 * ║  - Availability: two independent live HTTP GETs of the canonical URL,   ║
 * ║    taken minutes apart, both returned HTTP 200, content-type            ║
 * ║    application/pdf, content-length 4,088,160 bytes, and identical       ║
 * ║    SHA-256 639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725bccbd  ║
 * ║    115 both times — matching the digest already recorded during         ║
 * ║    DRA-ACQ-019 Phase 1 discovery exactly. BYTE_STABLE.                  ║
 * ║  - Licence: pdftotext extraction of the retrieved bytes confirms the    ║
 * ║    PDF's own first content page states, in-document: "© Crown copyright ║
 * ║    2025. You may reuse this information (not including logos) free of   ║
 * ║    charge in any format or medium, under the terms of the Open          ║
 * ║    Government Licence." — a document-level licence statement, not a     ║
 * ║    site-wide inference, re-confirmed live for this acquisition. No       ║
 * ║    contradictory or narrower notice was found elsewhere in the document ║
 * ║    front matter.                                                        ║
 * ║  - Public accessibility: no authentication, paywall, or access          ║
 * ║    circumvention of any kind was required; the URL is a plain public    ║
 * ║    GET on a government CDN.                                             ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain GENERAL (matches Phase 1 and the existing       ║
 * ║  DRA-DOC-0009 CMA precedent; no new domain category is created),        ║
 * ║  documentType OTHER (nearest existing taxonomy value — no bespoke        ║
 * ║  "adjudicated decision" category exists and none is created here),      ║
 * ║  language en-GB, difficulty HIGH (226+ pages, multi-party CA98          ║
 * ║  infringement decision with detailed penalty-calculation annexes).       ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE LIMITATION (explicitly preserved, per DRA-ACQ-019       ║
 * ║  Phase 2 instructions — do NOT describe this document as improving      ║
 * ║  publisher or domain diversity):                                        ║
 * ║  DRA-DOC-0023 reinforces existing CMA/GENERAL representation. It was    ║
 * ║  selected because adjudicated-decision genre coverage, artefact-level   ║
 * ║  licensing evidence, source stability, and structural richness were     ║
 * ║  judged more evidentially valuable at this checkpoint than               ║
 * ║  publisher/domain diversification. Its evidential contribution is       ║
 * ║  primarily genre, authority structure, adjudicative reasoning,          ║
 * ║  enforcement structure, document scale, and internal complexity — not   ║
 * ║  publisher or domain diversity.                                          ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE (belongs to a future DRA-BMK-023, explicitly NOT run       ║
 * ║  here): any comparison between DRA-DOC-0023's decision/issues and any    ║
 * ║  other corpus document's outcome; any expected SUPPORTED / REVIEW /      ║
 * ║  HOLD conclusion. This test performs acquisition, freeze, and corpus     ║
 * ║  admission ONLY, via the unmodified standard DRA-ENG-009 governed        ║
 * ║  pipeline (acquireFreezeAndEvaluate()), which necessarily runs the       ║
 * ║  frozen evaluator to produce the corpus entry's decision and proof       ║
 * ║  receipt as a required pipeline side effect, not a benchmark-comparison  ║
 * ║  analysis. Whatever decision the evaluator actually returns is recorded  ║
 * ║  verbatim below, without prediction or engineering toward any result.    ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run: the governed   ║
 * ║  pipeline's near-duplicate detector is optional (only engaged when       ║
 * ║  `existingCorpusTexts` is supplied) and is skipped in this test, exactly ║
 * ║  as in DRA-ACQ-018 Phase 2. The 22 existing corpus documents' metadata   ║
 * ║  (not their full text) is loaded into the registry below so corpus-ID/  ║
 * ║  digest duplicate checks and the 22→23 manifest transition are still     ║
 * ║  fully exercised; only the content-similarity near-duplicate check is    ║
 * ║  skipped, which is reasonable given this document's subject matter       ║
 * ║  (UK vehicle-recycling competition-law enforcement) is not substantively ║
 * ║  similar to any of the 22 existing corpus documents.                     ║
 * ║                                                                          ║
 * ║  PERFORMANCE NOTE: this document is large (~81,000 words), comparable    ║
 * ║  in order of magnitude to DRA-DOC-0020 (the document responsible for     ║
 * ║  the DRA-BMK-022 non-linear CPU-scaling finding). This test allows a     ║
 * ║  generous timeout to accommodate that known, disclosed characteristic;   ║
 * ║  no evaluator or pipeline change is made to compensate for it.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified below. The
 * software does NOT auto-approve any assessment — the VERIFIED status
 * values reflect explicit human sign-off, grounded in concrete evidence
 * gathered by direct inspection (two independent HTTP GETs of the canonical
 * PDF URL performed today, live verification of the CMA's own gov.uk case
 * page, and pdftotext inspection of the PDF's own front matter) performed
 * during this DRA-ACQ-019 Phase 2 admission, independently of the Phase 1
 * discovery record.
 *
 * This test makes live HTTPS requests to assets.publishing.service.gov.uk.
 * Allow 10 minutes given the document's size.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
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
// Canonical PDF URL — DRA-DOC-0023 candidate
// ---------------------------------------------------------------------------

const CMA_DECISION_PDF_URL =
  "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf";

/** Digest established during DRA-ACQ-019 Phase 1 discovery. */
const EXPECTED_SOURCE_DIGEST =
  "639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725cbccbd115";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-019-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Status: VERIFIED — re-confirmed independently at admission time, not
// inherited from the Phase 1 discovery record.
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-019-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${CMA_DECISION_PDF_URL}`,
    "Publisher: Competition and Markets Authority (CMA), a non-ministerial UK government department. " +
      "Document served from assets.publishing.service.gov.uk, the UK Government's official asset-hosting domain.",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): the CMA's own official " +
      "case page on gov.uk " +
      "(https://www.gov.uk/cma-cases/suspected-anti-competitive-conduct-in-relation-to-the-recycling-of-end-of-life-vehicles) " +
      "returns HTTP 200 and links directly to this exact canonical decision URL " +
      "(https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf) as the " +
      "'Final decision' document for the case, confirming this is the correct, official, canonical artefact — " +
      "not a mirror, cache, or third-party republication.",
    "RE-VERIFIED LIVE 2026-08-10: two independent GET requests to the canonical PDF URL both return HTTP 200, " +
      "content-type application/pdf, content-disposition 'inline; filename=\"Final_decision_.pdf\"', " +
      "content-length 4,088,160 bytes both times, identical SHA-256 " +
      "639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725cbccbd115 both times.",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-019 Phase 1 (DRA-CAND-019-01) — " +
      "same URL, same byte length (4,088,160), same SHA-256 digest, cross-checked independently rather than " +
      "relying solely on the Phase 1 assertion.",
    "pdftotext extraction confirms the document's own title page: 'Decision', 'Competition Act 1998', " +
      "'Anti-competitive conduct in relation to vehicle recycling and advertising of recycling-related " +
      "features', 'Case 51098', '01 April 2025'.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on a government CDN.",
    "HUMAN GOVERNANCE DECISION: Competition and Markets Authority confirmed as the official publisher and " +
      "canonical source of this document — VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-019 Phase 2 human governance sign-off 2026-08-10. " +
    "CMA Case 51098 decision ('Anti-competitive conduct in relation to vehicle recycling and advertising of " +
    "recycling-related features') official source VERIFIED, re-confirmed independently of Phase 1.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED — Crown copyright + Open Government Licence v3.0,
// confirmed via an in-document statement, re-verified live for this
// acquisition independently of Phase 1.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Open Government Licence v3.0",
  licenceUrl:
    "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-019-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): pdftotext extraction of " +
      "the freshly retrieved PDF bytes confirms the document's own front matter (page 2) states verbatim: " +
      "'© Crown copyright 2025. You may reuse this information (not including logos) free of charge in any " +
      "format or medium, under the terms of the Open Government Licence. To view this licence, visit " +
      "www.nationalarchives.gov.uk/doc/open-government-licence/ or write to the Information Policy Team, The " +
      "National Archives, Kew, London TW9 4DU, or email: psi@nationalarchives.gsi.gov.uk.'",
    "This is a document-level licence statement embedded in the artefact itself, not merely a site-wide policy " +
      "inference — the strongest form of licence evidence used in this corpus, matching the precedent already " +
      "accepted for Acas (DRA-DOC-0008), HSE (DRA-DOC-0016), MHRA (DRA-DOC-0017), and the CMA's own prior " +
      "corpus entry (DRA-DOC-0009).",
    "NO CONTRADICTORY NOTICE FOUND: the document also states that confidential information and the names of " +
      "individuals have been redacted from the published version — this is a standard CMA publication practice " +
      "for protecting third-party confidential/personal information ahead of publication, not a licensing " +
      "restriction on the published text itself, and does not narrow or override the OGL grant over the " +
      "published document.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this licence: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation — all consistent " +
      "with an OGL v3.0 grant that permits reuse, copying, and adaptation with attribution; this acquisition " +
      "does not republish the full text externally and does not reuse any CMA logo.",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE (Crown copyright + Open Government Licence v3.0) confirmed via an " +
      "explicit in-document statement, with no contradictory or narrower override found — VERIFIED, " +
      "independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-019 Phase 2 human governance sign-off 2026-08-10. " +
    "Crown copyright + OGL v3.0 — VERIFIED via an explicit in-document licence statement, matching and " +
    "re-confirming the DRA-ACQ-019 Phase 1 finding independently.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling and " +
    "advertising of recycling-related features (Case 51098)",
  publisher: "Competition and Markets Authority (CMA)",
  publicationDate: "2025-04-01",
  domain: "GENERAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "en-GB",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------
//
// Per DRA-ACQ-019 Phase 2 instructions, this rationale explicitly preserves
// the corpus-balance limitation and does NOT describe DRA-DOC-0023 as
// improving publisher or domain diversity.

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-019 Phase 1 (see " +
  "discovery/dra-acq-019-enforcement-decision-discovery.ts, DRA-CAND-019-01): targets the highest-priority " +
  "target-document-class (rank 1, an actual adjudicated regulatory decision) identified as the single most " +
  "significant document-genre gap in the corpus by DRA-BMK-022 — no prior corpus document (across ICO, CMA, " +
  "PRA, HSE, MHRA, NCSC, FDA, BCBS, NIST, CNIL) is an individual adjudicated case outcome; all are guidance, " +
  "procedure, policy, framework, summary, or report documents. " +
  "This document is a full Competition Act 1998 infringement decision (Case 51098) with named regulated " +
  "parties, statutory basis, factual findings, evidence, breach determinations, legal reasoning, an explicit " +
  "determination, enforcement powers, individually calculated penalties (Annexes 3-5), relevant dates, and an " +
  "explicit outcome including the stated right of appeal to the Competition Appeal Tribunal — all 11 " +
  "structural elements sought by the Phase 1 discovery were directly confirmed in the extracted text, not " +
  "assumed. " +
  "Licence evidence is the strongest available: an explicit in-document Crown-copyright/Open Government " +
  "Licence statement, re-confirmed independently at this Phase 2 admission, rather than a site-wide policy " +
  "inference. " +
  "CORPUS-BALANCE LIMITATION (explicitly preserved, not concealed): DRA-DOC-0023 reinforces existing CMA/" +
  "GENERAL representation (CMA already appears as DRA-DOC-0009; GENERAL is already the second-most-represented " +
  "domain in the 22-document corpus). It does NOT improve publisher or domain diversity. It was selected " +
  "because adjudicated-decision genre coverage, artefact-level licensing evidence, source stability, and " +
  "structural richness were judged more evidentially valuable at this checkpoint than publisher/domain " +
  "diversification. Its evidential contribution is genre, authority structure, adjudicative reasoning, " +
  "enforcement structure, document scale, and internal complexity — not diversity. " +
  "No H23 conclusion, expected decision, or expected issue-class outcome is assumed by this inclusion " +
  "rationale; whatever the frozen evaluator (version 0.1.2) actually returns for this document is recorded " +
  "verbatim in the admission test below, and its actual decision/issue-class behaviour is left entirely to " +
  "the future DRA-BMK-023 checkpoint.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0022 (reconstructed from admitted records,
// extending the DRA-ACQ-018 Phase 2 22-document construction with
// DRA-DOC-0022 already included, for a consistent 22-document registry ahead
// of DRA-DOC-0023 admission). Metadata only — no text content is required by
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

const EEA_WASTE_PDF_URL =
  "https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file";

const ENTRY_0022: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0022",
  title:
    "Tracking waste prevention progress — A narrative-based waste prevention monitoring framework at the EU level",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "en",
  generator: "European Environment Agency (EEA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009 from " + EEA_WASTE_PDF_URL,
  sourceReference: EEA_WASTE_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000025 (programme ref: DRA-ACQ-018). " +
    "Freeze record: DRA-FRZ-000016. " +
    "Publication date: 2023 (EEA Report 02/2023). " +
    "Licence: CREATIVE_COMMONS_BY (CC BY 4.0), EEA institution-wide legal notice.",
};

const PRIOR_CORPUS_ENTRIES: readonly CorpusDocumentInput[] = [
  ENTRY_0007, ENTRY_0008, ENTRY_0009, ENTRY_0010, ENTRY_0011, ENTRY_0012,
  ENTRY_0013, ENTRY_0014, ENTRY_0015, ENTRY_0016, ENTRY_0017, ENTRY_0018,
  ENTRY_0019, ENTRY_0020, ENTRY_0021, ENTRY_0022,
];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-019 Phase 2 — Controlled Corpus Admission for DRA-DOC-0023 (CMA, Case 51098 vehicle-recycling decision)",
  () => {
    it(
      "reconfirms governance independently, verifies determinism via two independent live acquisitions, " +
        "and admits DRA-DOC-0023 (CMA PDF) through eligibility, freeze, 23-document corpus integration, and " +
        "DRA evaluator execution — recording whatever decision the frozen evaluator actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-019 PHASE 2 — CORPUS ADMISSION LOG               ║");
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
          acquisitionId: "DRA-ACQ-000026",
          sourceUrl: CMA_DECISION_PDF_URL,
          requestedBy: "DRA-ACQ-019-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Competition and Markets Authority (CMA)",
          expectedTitle: "Anti-competitive conduct in relation to vehicle recycling",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First CMA fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000026",
          sourceUrl: CMA_DECISION_PDF_URL,
          requestedBy: "DRA-ACQ-019-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Competition and Markets Authority (CMA)",
          expectedTitle: "Anti-competitive conduct in relation to vehicle recycling",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second CMA fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
        }
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  Acquisition A HTTP status :", fetchA.source.httpStatus);
        console.log("  Acquisition A finalUrl    :", fetchA.source.finalUrl);
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
        expect(fetchA.source.rawBytes.length).toBe(4_088_160);
        expect(digestA).toBe(digestB);
        // Cross-check against the digest recorded during Phase 1 discovery —
        // per Phase 2 instructions, compare admission-time digest with the
        // digest observed during Phase 1 qualification.
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-019 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity check on the admission-time bytes ─
        //
        // Per Phase 2 instructions §6: confirm, without predicting any
        // evaluator result, that the frozen/normalised representation still
        // exposes the substantive material identified during Phase 1. This
        // is an acquisition-integrity check only — it is deliberately run
        // directly on the extracted text of the admission-time bytes
        // (fetchA), not turned into any expected evaluator issue class or
        // decision.

        console.log("\n── Step 0b: Structural Integrity Spot-Check (acquisition-integrity only) ─");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          regulated_parties: /VM Parties|Trade Association Parties/,
          statutory_basis: /Chapter I Prohibition|Competition Act 1998/,
          findings: /CMA’s findings|CMA's findings/,
          evidence: /INDUSTRY BACKGROUND/i,
          breaches: /Infringement/,
          reasoning: /Legal assessment/i,
          determination: /DETERMINATION/i,
          enforcement_powers: /section 36|Competition Act/,
          penalties: /PENALTY CALCULATIONS/i,
          dates: /01 April 2025/,
          outcome_and_appeal: /Competition Appeal Tribunal/,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }
        console.log(
          "  All 11 structural elements identified in DRA-ACQ-019 Phase 1 remain present in the " +
            "admission-time extracted text ✓ (acquisition-integrity check only — no evaluator issue class " +
            "or decision is inferred from this).",
        );

        // ── Step 1: Setup — build 22-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 22-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        for (const entry of PRIOR_CORPUS_ENTRIES) {
          registry.add(entry);
        }

        console.log(`  22-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(22);
        expect(registry.hasId("DRA-DOC-0023")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-019",
          protocolStatus: "APPROVED",
          targetCorpusSize: 23,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          // Extends the default with every language code already present in
          // the 22-document registry: "es" (DRA-DOC-0018, DRA-DOC-0019) and
          // "fr" (DRA-DOC-0020). "en" and "en-GB" (this candidate) are
          // already covered by the default.
          permittedLanguages: ["en", "en-GB", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000026) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000026",
          sourceUrl: CMA_DECISION_PDF_URL,
          requestedBy: "DRA-ACQ-019-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Competition and Markets Authority (CMA)",
          expectedTitle: "Anti-competitive conduct in relation to vehicle recycling",
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
            corpusDocumentId: "DRA-DOC-0023",
            freezeRecordId: "DRA-FRZ-000017",
            frozenBy: "DRA-ACQ-019-human-governance-operator",
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

        expect(result.freeze.freezeRecordId).toBe("DRA-FRZ-000017");
        expect(result.freeze.corpusDocumentId).toBe("DRA-DOC-0023");
        expect(result.freeze.acquisitionId).toBe("DRA-ACQ-000026");
        expect(result.freeze.sourceDigest).toBe(digestA);
        expect(result.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(result.freeze.normalisedTextDigest).toBeTruthy();
        expect(result.freeze.metadataDigest).toBeTruthy();
        expect(result.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (23 documents) ───────────────────────────");
        console.log("  schemaVersion  :", result.manifest.schemaVersion);
        console.log("  corpusVersion  :", result.manifest.corpusVersion);
        console.log("  documentCount  :", result.manifest.documentCount);
        console.log("  overallDigest  :", result.manifest.overallDigest);
        console.log("  documentIds    :");
        for (const id of result.manifest.documentIds) {
          console.log(`    ${id}`);
        }

        expect(result.manifest.documentCount).toBe(23);
        expect(result.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(result.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.manifest.documentIds).toHaveLength(23);
        expect(result.manifest.documentIds).toContain("DRA-DOC-0023");
        expect(result.manifest.documentIds[22]).toBe("DRA-DOC-0023");
        expect(result.manifestDigest).toBe(result.manifest.overallDigest);

        // Confirm no existing document entry changed: every one of the 22
        // prior IDs is still present, unmodified, ahead of the new entry.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...PRIOR_CORPUS_ENTRIES.map((e) => e.corpusId),
        ];
        for (const id of priorIds) {
          expect(result.manifest.documentIds).toContain(id);
        }
        expect(result.manifest.documentIds.slice(0, 22)).toEqual(priorIds);
        expect(priorIds).toHaveLength(22);

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
        // receipt schema 0.1.0 must remain unchanged by this acquisition.
        // These assertions confirm evaluator identity was NOT modified —
        // they do NOT assert or assume any particular decision outcome.
        expect(identity?.["evaluatorVersion"]).toBe("0.1.2");
        expect(identity?.["pipelineVersion"]).toBe("1.0");
        expect(receipt["schemaVersion"]).toBe("0.1.0");

        // No assumption about which decision the evaluator returns — only
        // that it is one of the evaluator's defined decision values. Per
        // the Phase 2 boundary instruction, this test does not predict or
        // engineer any particular decision for DRA-BMK-023 to confirm.
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

        expect(result.proofReference.freezeRecordId).toBe("DRA-FRZ-000017");
        expect(result.proofReference.corpusDocumentId).toBe("DRA-DOC-0023");
        expect(result.proofReference.proofReceiptSubstantiveDigest).toBeTruthy();
        expect(result.proofReference.proofReceiptSubstantiveDigest).toMatch(/^[0-9a-f]{64}$/);

        console.log("\n── Benchmark Result Summary (23-Document Corpus Input) ──────");
        console.log("  Benchmark Document ID :", result.proofReference.corpusDocumentId);
        console.log("  Freeze Record ID      :", result.freeze.freezeRecordId);
        console.log("  Corpus Manifest Digest:", result.manifestDigest);
        console.log("  Corpus Size           :", result.manifest.documentCount);
        console.log("  Decision              :", result.decision);
        console.log("  Issue Count           :", issuesArrLog.length);
        console.log("  Issue Classes         :", JSON.stringify(issueClassesLog));
        console.log("  Evaluation Timestamp  :", result.proofReference.evaluationTimestamp);

        console.log("\n── Admission Complete ────────────────────────────────────────");
        console.log(
          "  Document:        DRA-DOC-0023 — Anti-competitive conduct in relation to vehicle recycling and " +
            "advertising of recycling-related features (CMA Case 51098)",
        );
        console.log("  Publisher:       Competition and Markets Authority (CMA)");
        console.log("  Freeze record:   DRA-FRZ-000017");
        console.log("  Source digest:  ", result.freeze.sourceDigest);
        console.log("  Text digest:    ", result.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", result.freeze.metadataDigest);
        console.log("  Freeze digest:  ", result.freeze.freezeRecordDigest);
        console.log("  Manifest digest:", result.manifestDigest);
        console.log("  Corpus size:     23 documents");
        console.log("  Status:          FROZEN");
        console.log("  Decision:       ", result.decision);
        console.log("  Licence:         Crown copyright — Open Government Licence v3.0 (in-document statement)");
        console.log(
          "  Corpus-balance limitation: DRA-DOC-0023 reinforces existing CMA/GENERAL representation; " +
            "does NOT improve publisher or domain diversity (see docblock).",
        );
        console.log("  Next step:       DRA-BMK-023 (NOT run in this phase) — pending user review");
      },
      600_000, // 10 minutes
    );
  },
);
