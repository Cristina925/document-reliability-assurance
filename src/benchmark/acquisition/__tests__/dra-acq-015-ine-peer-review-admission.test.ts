/**
 * DRA-ACQ-015 — Phase 2: Controlled Acquisition and Admission for DRA-DOC-0019
 * (Instituto Nacional de Estadística — "Informe de la Revisión por Pares
 * relativo al cumplimiento del Código de Buenas Prácticas de las
 * Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico
 * Nacional — España")
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-015 PHASE 2                             ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-015-02 (recommended at the close of DRA-ACQ-015     ║
 * ║  Phase 1 — see discovery/dra-acq-015-second-multilingual-discovery.ts)   ║
 * ║                                                                          ║
 * ║  Document:   Informe de la Revisión por Pares (Peer Review) relativo al  ║
 * ║              cumplimiento del Código de Buenas Prácticas de las         ║
 * ║              Estadísticas Europeas — España                             ║
 * ║  Corpus ID:  DRA-DOC-0019                                                ║
 * ║  Freeze ID:  DRA-FRZ-000013                                              ║
 * ║  Acquisition ID: DRA-ACQ-000022 (programme ref: DRA-ACQ-015)             ║
 * ║  Publisher:  Instituto Nacional de Estadística (INE), Spain's national   ║
 * ║              statistics agency                                          ║
 * ║  Source:     PDF — single document                                      ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf             ║
 * ║                                                                          ║
 * ║  PURPOSE (restated per this programme's explicit instruction):           ║
 * ║  This acquisition is NOT intended to demonstrate multilingual            ║
 * ║  robustness. Its purpose is to admit a second, independently governed    ║
 * ║  Spanish-language document — from a different publisher, domain, and     ║
 * ║  document structure than DRA-DOC-0018 (European Commission, TECHNICAL,   ║
 * ║  ethics-guidelines-plus-checklist) — so that a subsequent benchmark can   ║
 * ║  investigate whether the DRA-BMK-018 multilingual observation            ║
 * ║  (POSSIBLE_SENSITIVITY) is document-specific or language-specific. No    ║
 * ║  outcome is assumed here; that question is explicitly deferred to        ║
 * ║  DRA-BMK-019.                                                            ║
 * ║                                                                          ║
 * ║  RE-VERIFICATION (this acquisition, 2026-08-09):                        ║
 * ║  - Availability: the canonical PDF URL was re-fetched live (HTTP 200,    ║
 * ║    Content-Type: application/pdf, 440,255 bytes) — unchanged from the    ║
 * ║    DRA-ACQ-015 Phase 1 discovery measurement.                           ║
 * ║  - Byte stability: two independent live fetches performed in this test   ║
 * ║    produce identical SHA-256 digests, and both match the digest already  ║
 * ║    recorded during Phase 1 discovery                                    ║
 * ║    (9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981).   ║
 * ║  - Licence: re-fetched INE's site-wide legal notice (the "aviso_legal"   ║
 * ║    path 301-redirects to www.ine.es/dyngs/AYU/index.htm?cid=125, which   ║
 * ║    is directly fetched and inspected — the redirect is recorded, not     ║
 * ║    silently followed and forgotten). It still states explicitly, with a  ║
 * ║    named licence: "La licencia de uso general a aplicar a la             ║
 * ║    información estadística de este sitio web, salvo que se indique lo    ║
 * ║    contrario, es la Creative Commons Reconocimiento 4.0 (CC BY 4.0)".    ║
 * ║  - Publisher identity: confirmed as the Instituto Nacional de            ║
 * ║    Estadística (INE), Spain's national statistics agency, hosting the    ║
 * ║    PDF on its own first-party domain (ine.es), and confirmed as the      ║
 * ║    coordinating national authority named throughout the document text    ║
 * ║    itself (the report repeatedly refers to "el INE, como coordinador     ║
 * ║    nacional del Sistema Estadístico Nacional").                          ║
 * ║                                                                          ║
 * ║  DOCUMENT-TYPE NOTE: classified as REPORT — a peer-review assessment     ║
 * ║  report (executive summary, progress review, findings/recommendations   ║
 * ║  by chapter, two numbered annexes: visit agenda and participant list),   ║
 * ║  matching the same documentType already used for DRA-DOC-0018 but with   ║
 * ║  a structurally distinct genre (external compliance audit vs.            ║
 * ║  self-published ethics guidelines).                                     ║
 * ║                                                                          ║
 * ║  DOMAIN NOTE: classified as GENERAL. The corpus schema's Domain enum     ║
 * ║  (GENERAL, BUSINESS, TECHNICAL, LEGAL, HEALTHCARE, FINANCE) has no       ║
 * ║  PUBLIC_ADMINISTRATION or STATISTICS category; a peer-review audit of a  ║
 * ║  national statistical system's institutional compliance with an EU      ║
 * ║  code of practice does not fit BUSINESS, TECHNICAL, LEGAL, HEALTHCARE,   ║
 * ║  or FINANCE, so GENERAL is the correct mapping (joins DRA-DOC-0009, CMA  ║
 * ║  AI Foundation Models, as the second GENERAL-domain document).           ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE (belongs to DRA-BMK-019): issue-class contribution         ║
 * ║  analysis, decision-distribution comparison, and any claim about         ║
 * ║  whether the DRA-BMK-018 multilingual observation is document-specific   ║
 * ║  or language-specific. This test performs acquisition, freeze, and       ║
 * ║  corpus admission ONLY, via the unmodified standard DRA-ENG-009 governed  ║
 * ║  pipeline (acquireFreezeAndEvaluate()), which necessarily runs the       ║
 * ║  frozen evaluator to produce the corpus entry's decision and proof       ║
 * ║  receipt — that single evaluator run is the existing pipeline's          ║
 * ║  required side effect of admission, not a benchmark-contribution         ║
 * ║  analysis.                                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified below. The
 * software does NOT auto-approve any assessment — the VERIFIED status
 * values reflect explicit human sign-off, grounded in concrete evidence
 * gathered by direct inspection (HTTP HEAD/GET of the canonical PDF URL,
 * and HTTP GET of INE's site-wide legal-notice page, including its
 * redirect target) performed during this acquisition programme.
 *
 * This test makes live HTTPS requests to ine.es (PDF, twice for
 * determinism) plus all sources needed to reconstruct the existing
 * 18-document corpus for the near-duplicate check (acas.org.uk,
 * assets.publishing.service.gov.uk [CMA + MHRA], nvlpubs.nist.gov,
 * ico.org.uk [14 sections], bankofengland.co.uk, fda.gov, bis.org,
 * ncsc.gov.uk, hse.gov.uk [26 pages], ec.europa.eu). Allow 25 minutes.
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

/** Human governance review timestamp — decisions recorded 2026-08-09. */
const REVIEW_TIMESTAMP = "2026-08-09T14:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-09T14:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0019 candidate
// ---------------------------------------------------------------------------

const INE_PDF_URL = "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf";

/** Digest established during DRA-ACQ-015 Phase 1 discovery. */
const EXPECTED_SOURCE_DIGEST =
  "9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981";

// ---------------------------------------------------------------------------
// ICO section URLs (for existing 18-document corpus near-duplicate scope)
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";

const ICO_SECTION_SLUGS: readonly string[] = [
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

const ICO_SECTION_URLS = ICO_SECTION_SLUGS.map(
  (slug) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

// ---------------------------------------------------------------------------
// HSE 26-page URLs (for existing 18-document corpus near-duplicate scope)
// ---------------------------------------------------------------------------

const HSE_BASE = "https://www.hse.gov.uk/simple-health-safety";

const HSE_PAGE_URLS: readonly string[] = [
  `${HSE_BASE}/`,
  `${HSE_BASE}/policy/index.htm`,
  `${HSE_BASE}/policy/how-to-write-your-policy.htm`,
  `${HSE_BASE}/policy/the-law.htm`,
  `${HSE_BASE}/risk/index.htm`,
  `${HSE_BASE}/risk/steps-needed-to-manage-risk.htm`,
  `${HSE_BASE}/risk/risk-assessment-template-and-examples.htm`,
  `${HSE_BASE}/risk/common-workplace-risks.htm`,
  `${HSE_BASE}/risk/more-detail-on-managing-risk.htm`,
  `${HSE_BASE}/reporting-accidents-ill-health.htm`,
  `${HSE_BASE}/training/index.htm`,
  `${HSE_BASE}/training/decide.htm`,
  `${HSE_BASE}/training/needs.htm`,
  `${HSE_BASE}/training/supervision.htm`,
  `${HSE_BASE}/consult.htm`,
  `${HSE_BASE}/workplace-facilities/index.htm`,
  `${HSE_BASE}/workplace-facilities/health-safety.htm`,
  `${HSE_BASE}/workplace-facilities/welfare.htm`,
  `${HSE_BASE}/firstaid/index.htm`,
  `${HSE_BASE}/firstaid/assess-business-need.htm`,
  `${HSE_BASE}/firstaid/first-aid-appoint-someone.htm`,
  `${HSE_BASE}/firstaid/first-aid-home-workers.htm`,
  `${HSE_BASE}/firstaid/first-aid-training.htm`,
  `${HSE_BASE}/firstaid/what-to-put-in-your-first-aid-kit.htm`,
  `${HSE_BASE}/display.htm`,
  `${HSE_BASE}/gettinghelp/index.htm`,
];

const MHRA_PDF_URL =
  "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";

const EC_ETHICS_ES_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext extractor
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-015-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-015-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${INE_PDF_URL}`,
    "Publisher: Instituto Nacional de Estadística (INE) — Spain's national statistics agency, hosted on its own first-party domain (ine.es), not a third-party mirror",
    "The document text itself repeatedly names INE as the coordinating national authority ('el INE, como coordinador nacional del Sistema Estadístico Nacional y de la revisión por pares')",
    "PDF internal metadata (pdfinfo) confirms a 54-page A4 document; title page states 'Julio de 2022' and names four named peer-review experts (Jonas Markelevičius, Thomas Burg, Jukka Jalava, Richard Laux)",
    "RE-VERIFIED LIVE 2026-08-09: HEAD and GET requests to the canonical PDF URL both return HTTP 200, Content-Type application/pdf, Content-Length 440255 bytes — unchanged from the DRA-ACQ-015 Phase 1 discovery measurement",
    "HUMAN GOVERNANCE DECISION: Instituto Nacional de Estadística (INE) confirmed as the official Spanish national statistics agency and canonical publisher of this peer-review report — VERIFIED",
  ],
  notes:
    "DRA-ACQ-015 Phase 2 human governance sign-off 2026-08-09. " +
    "INE 'Informe de la Revisión por Pares ... España' official source VERIFIED.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Creative Commons Reconocimiento 4.0 (CC BY 4.0)",
  licenceUrl: "https://www.ine.es/dyngs/AYU/index.htm?cid=125",
  licenceBasis: "CREATIVE_COMMONS_BY" as const,
  assessedBy: "DRA-ACQ-015-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "SITE-WIDE evidence: INE's legal-notice path (ine.es/aviso_legal) 301-redirects to " +
      "www.ine.es/dyngs/AYU/index.htm?cid=125 — this redirect target was fetched directly and inspected, " +
      "not silently followed and forgotten",
    "The fetched legal-notice page states explicitly: 'La licencia de uso general a aplicar a la " +
      "información estadística de este sitio web, salvo que se indique lo contrario, es la Creative " +
      "Commons Reconocimiento 4.0 (CC BY 4.0) que implica la autorización para la reutilización de la " +
      "información en condiciones no restrictivas, siendo posible la copia, distribución y comunicación " +
      "pública, así como la producción de obras derivadas, incluso con finalidad comercial citando la " +
      "autoría'",
    "RE-VERIFIED LIVE 2026-08-09 (this acquisition): re-fetched the legal-notice redirect target; the " +
      "CC BY 4.0 statement is still present and unchanged from DRA-ACQ-015 Phase 1 discovery",
    "This licence determination was NOT inferred solely from the .ine.es domain — the explicit, " +
      "named-licence statement (matching the same tier of evidence already accepted for DRA-DOC-0018's " +
      "CC BY 4.0 basis) was located and cited",
    "No document-specific exception to this site-wide policy was found on the PDF itself or its hosting page",
    "HUMAN GOVERNANCE DECISION: CREATIVE_COMMONS_BY (CC BY 4.0) confirmed via explicit site-wide legal " +
      "notice — VERIFIED",
  ],
  notes:
    "DRA-ACQ-015 Phase 2 human governance sign-off 2026-08-09. " +
    "CC BY 4.0 — VERIFIED via INE's site-wide legal-notice page (redirect target directly fetched " +
    "and inspected).",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
    "Prácticas de las Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico " +
    "Nacional — España",
  publisher: "Instituto Nacional de Estadística (INE)",
  publicationDate: "2022-07",
  domain: "GENERAL" as const,
  documentType: "REPORT" as const,
  difficulty: "MEDIUM" as const,
  language: "es",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Second Spanish-language (es) document in the DRA corpus, admitted to isolate language as a " +
  "controlled variable against DRA-DOC-0018 (European Commission, Spanish edition of the Ethics " +
  "Guidelines for Trustworthy AI). Recommended candidate at the close of DRA-ACQ-015 Phase 1 (see " +
  "discovery/dra-acq-015-second-multilingual-discovery.ts, DRA-CAND-015-02): the only VERIFIED-licence, " +
  "QUALIFIED_RECOMMENDED candidate among AEMPS, INE, and CNMV. " +
  "New publisher: Instituto Nacional de Estadística (INE), Spain's national statistics agency — not " +
  "previously represented in the corpus. " +
  "GENERAL domain: joins DRA-DOC-0009 (CMA AI Foundation Models) as the second GENERAL-domain document, " +
  "but on an entirely distinct subject (national statistical-system governance vs. AI foundation " +
  "models policy) — the corpus schema's Domain enum has no dedicated public-administration/statistics " +
  "category, so GENERAL is the correct mapping. " +
  "REPORT document type: an externally-authored peer-review compliance audit (executive summary, " +
  "progress review, findings/recommendations by chapter, two numbered annexes), structurally distinct " +
  "from DRA-DOC-0018's self-published ethics-guidelines-plus-checklist REPORT, exercising the same " +
  "documentType classification against a genuinely different evidentiary structure (dense citations to " +
  "Regulation (EC) No 223/2009 and numbered Code-of-Practice indicators, named individual authors and " +
  "reviewers, rather than institutional guidance prose). " +
  "MEDIUM difficulty: dense but narratively structured audit prose, less densely cross-referenced than " +
  "DRA-DOC-0010 (NIST AI RMF) or DRA-DOC-0015 (NCSC), but denser than DRA-DOC-0008 (Acas). " +
  "CC BY 4.0, VERIFIED via INE's explicit site-wide legal notice — the same tier of evidence already " +
  "accepted for DRA-DOC-0018. " +
  "Duplicate/near-duplicate risk: LOW — no other corpus document addresses national statistical-system " +
  "governance or EU Code-of-Practice compliance auditing. " +
  "Experimental design: this document is the second same-language (Spanish) admission, deliberately " +
  "varying publisher, domain, and document structure relative to DRA-DOC-0018, so that DRA-BMK-019 can " +
  "test whether the DRA-BMK-018 multilingual observation (POSSIBLE_SENSITIVITY) reproduces under a " +
  "different publisher/domain/structure while holding language constant. No outcome is assumed or " +
  "claimed here; that analysis is explicitly deferred to DRA-BMK-019.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0018 (reconstructed from admitted records,
// extending the DRA-ACQ-014 Phase 2 retry 17→18-document registry with
// DRA-DOC-0018 for a consistent 18-document registry ahead of DRA-DOC-0019
// admission)
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

// ---------------------------------------------------------------------------
// Build existing 18-document corpus texts for near-duplicate check
// (DRA-DOC-0001–0018), extending DRA-ACQ-014 Phase 2 retry's 17-document
// construction with the EC Ethics Guidelines document
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
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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
  for (const sectionUrl of ICO_SECTION_URLS) {
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: sectionUrl,
      requestedBy: "DRA-ACQ-015-admission-corpus-check",
      requestedAt: FREEZE_TIMESTAMP,
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
    const combined = icoPageTexts.join(SECTION_SEPARATOR);
    const combinedNorm = await normaliseContent(
      encoder.encode(combined),
      "text/plain",
      "ico-combined",
      extractPdfText,
    );
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  // DRA-DOC-0012: PRA SS1/23 Model Risk Management (live fetch)
  const praReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000014",
    sourceUrl:
      "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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

  // DRA-DOC-0015: NCSC Machine Learning Principles (live fetch)
  const ncscReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000018",
    sourceUrl: DRA_DOC_0015_PDF_URL,
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
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

  // DRA-DOC-0016: HSE Health and safety basics (multi-page HTML, 26 pages)
  const hsePageTexts: string[] = [];
  for (const pageUrl of HSE_PAGE_URLS) {
    const hseReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000019",
      sourceUrl: pageUrl,
      requestedBy: "DRA-ACQ-015-admission-corpus-check",
      requestedAt: FREEZE_TIMESTAMP,
      expectedPublisher: "Health and Safety Executive (HSE)",
      expectedTitle: "Health and safety basics for your business",
    });
    if (hseReq.ok) {
      const hseFetch = await fetcher(hseReq.request, {});
      if (hseFetch.ok) {
        const d = computeSourceDigest(hseFetch.source.rawBytes);
        const n = await normaliseContent(hseFetch.source.rawBytes, "text/html", d, extractPdfText);
        if (n.ok) hsePageTexts.push(n.document.text);
      }
    }
  }
  if (hsePageTexts.length > 0) {
    const combined = hsePageTexts.join(SECTION_SEPARATOR);
    const combinedNorm = await normaliseContent(
      encoder.encode(combined),
      "text/plain",
      "hse-combined",
      extractPdfText,
    );
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  // DRA-DOC-0017: MHRA Best Practice Guidance on PILs (live fetch)
  const mhraReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000020",
    sourceUrl: MHRA_PDF_URL,
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Medicines and Healthcare products Regulatory Agency (MHRA)",
    expectedTitle: "Best practice guidance on patient information leaflets (PILs)",
  });
  if (mhraReq.ok) {
    const mhraFetch = await fetcher(mhraReq.request, {});
    if (mhraFetch.ok) {
      const d = computeSourceDigest(mhraFetch.source.rawBytes);
      const n = await normaliseContent(mhraFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0018: EC Ethics Guidelines, Spanish edition (live fetch, DRA-ENG-011 fallback)
  const ecReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000021",
    sourceUrl: EC_ETHICS_ES_PDF_URL,
    requestedBy: "DRA-ACQ-015-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    expectedTitle:
      "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)",
  });
  if (ecReq.ok) {
    const ecFetch = await fetcher(ecReq.request, {});
    if (ecFetch.ok) {
      const d = computeSourceDigest(ecFetch.source.rawBytes);
      const n = await normaliseContent(ecFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-015 Phase 2 — Controlled Corpus Admission for DRA-DOC-0019 (INE Peer Review Report)",
  () => {
    it(
      "verifies determinism, admits DRA-DOC-0019 (INE PDF) through eligibility, " +
        "freeze, 19-document corpus integration, and DRA evaluator execution",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-015 PHASE 2 — CORPUS ADMISSION LOG               ║");
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
          acquisitionId: "DRA-ACQ-000022",
          sourceUrl: INE_PDF_URL,
          requestedBy: "DRA-ACQ-015-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Instituto Nacional de Estadística (INE)",
          expectedTitle:
            "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
            "Prácticas de las Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico " +
            "Nacional — España",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First INE fetch FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000022",
          sourceUrl: INE_PDF_URL,
          requestedBy: "DRA-ACQ-015-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Instituto Nacional de Estadística (INE)",
          expectedTitle:
            "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
            "Prácticas de las Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico " +
            "Nacional — España",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second INE fetch FAILED:", fetchB.code, fetchB.message);
        }
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  fetch A HTTP status :", fetchA.source.httpStatus);
        console.log("  fetch A mediaType   :", fetchA.source.mediaType);
        console.log("  fetch A byte length :", fetchA.source.rawBytes.length);
        console.log("  fetch A sourceDigest:", digestA);
        console.log("  fetch B byte length :", fetchB.source.rawBytes.length);
        console.log("  fetch B sourceDigest:", digestB);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(digestA).toBe(digestB);
        // Cross-check against the digest recorded during Phase 1 discovery.
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent fetches produced identical SHA-256 ✓");
        console.log("  Matches Phase 1 discovery digest ✓");

        // ── Step 1: Setup — build 18-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 18-Document Registry ──────────────");

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

        console.log(`  18-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(18);
        expect(registry.hasId("DRA-DOC-0019")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-015",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          // Extends the default with every language code already present in the
          // 18-document registry, including "es" (DRA-DOC-0018). A
          // test-configuration fix reflecting the corpus actually being
          // admitted into, not a governance-rule relaxation.
          permittedLanguages: ["en", "en-GB", "es"],
        });

        // ── Step 2: Build existing corpus texts (near-duplicate scope) ──────

        console.log("\n── Step 2: Build 18-Document Existing Corpus Texts ─────────");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008–0015: live fetch (8 single sources + ICO 14 pages)");
        console.log("  DRA-DOC-0016:      live fetch (HSE 26 pages)");
        console.log("  DRA-DOC-0017:      live fetch (MHRA PDF)");
        console.log("  DRA-DOC-0018:      live fetch (EC Ethics Guidelines, Spanish edition)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);
        console.log(`  Total texts built: ${existingCorpusTexts.length}`);
        expect(existingCorpusTexts.length).toBe(18);

        // ── Step 3: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 3: Acquisition Request (DRA-ACQ-000022) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000022",
          sourceUrl: INE_PDF_URL,
          requestedBy: "DRA-ACQ-015-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Instituto Nacional de Estadística (INE)",
          expectedTitle:
            "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
            "Prácticas de las Estadísticas Europeas y la Mejora y el Desarrollo del Sistema Estadístico " +
            "Nacional — España",
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
            corpusDocumentId: "DRA-DOC-0019",
            freezeRecordId: "DRA-FRZ-000013",
            frozenBy: "DRA-ACQ-015-human-governance-operator",
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

        expect(result.freeze.freezeRecordId).toBe("DRA-FRZ-000013");
        expect(result.freeze.corpusDocumentId).toBe("DRA-DOC-0019");
        expect(result.freeze.acquisitionId).toBe("DRA-ACQ-000022");
        expect(result.freeze.sourceDigest).toBe(digestA);
        expect(result.freeze.normalisedTextDigest).toBeTruthy();
        expect(result.freeze.metadataDigest).toBeTruthy();
        expect(result.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (19 documents) ───────────────────────────");
        console.log("  schemaVersion  :", result.manifest.schemaVersion);
        console.log("  corpusVersion  :", result.manifest.corpusVersion);
        console.log("  documentCount  :", result.manifest.documentCount);
        console.log("  overallDigest  :", result.manifest.overallDigest);
        console.log("  documentIds    :");
        for (const id of result.manifest.documentIds) {
          console.log(`    ${id}`);
        }

        expect(result.manifest.documentCount).toBe(19);
        expect(result.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(result.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(result.manifest.documentIds).toHaveLength(19);
        expect(result.manifest.documentIds).toContain("DRA-DOC-0019");
        expect(result.manifest.documentIds[18]).toBe("DRA-DOC-0019");
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

        expect(result.proofReference.freezeRecordId).toBe("DRA-FRZ-000013");
        expect(result.proofReference.corpusDocumentId).toBe("DRA-DOC-0019");
        expect(result.proofReference.proofReceiptSubstantiveDigest).toBeTruthy();

        console.log("\n── Benchmark Result Summary (19-Document Checkpoint Input) ──");
        console.log("  Benchmark Document ID :", result.proofReference.corpusDocumentId);
        console.log("  Freeze Record ID      :", result.freeze.freezeRecordId);
        console.log("  Corpus Manifest Digest:", result.manifestDigest);
        console.log("  Corpus Size           :", result.manifest.documentCount);
        console.log("  Decision              :", result.decision);
        console.log("  Evaluation Timestamp  :", result.proofReference.evaluationTimestamp);

        console.log("\n── Admission Complete ────────────────────────────────────────");
        console.log("  Document:        DRA-DOC-0019 — Informe de la Revisión por Pares (INE, España)");
        console.log("  Publisher:       Instituto Nacional de Estadística (INE)");
        console.log("  Freeze record:   DRA-FRZ-000013");
        console.log("  Source digest:  ", result.freeze.sourceDigest);
        console.log("  Text digest:    ", result.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", result.freeze.metadataDigest);
        console.log("  Freeze digest:  ", result.freeze.freezeRecordDigest);
        console.log("  Manifest digest:", result.manifestDigest);
        console.log("  Corpus size:     19 documents");
        console.log("  Status:          FROZEN");
        console.log("  Decision:       ", result.decision);
        console.log("  Licence:         CREATIVE_COMMONS_BY (CC BY 4.0)");
        console.log("  Next step:       DRA-BMK-019 — Nineteen-Document Corpus Checkpoint and Evaluator Run (if requested)");
      },
      1_500_000, // 25 minutes
    );
  },
);
