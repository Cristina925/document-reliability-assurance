/**
 * DRA-BMK-021 — Parts 4-8: Twenty-One-Document Evaluator Run (Run A)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  TWENTY-ONE-DOCUMENT EVALUATOR RUN — DRA-BMK-021 (RUN A)                 ║
 * ║                                                                          ║
 * ║  Corpus: DRA-DOC-0001 through DRA-DOC-0021                              ║
 * ║  Evaluator: frozen Version 1 (evaluateDocument, BenchmarkRunner)        ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-09T18:00:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-09T18:30:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed or decisions replaced                        ║
 * ║    • No evaluator features added                                         ║
 * ║    • Runner never throws — failures captured as records                 ║
 * ║    • No tuning to make DRA-DOC-0021 agree with DRA-DOC-0018              ║
 * ║    • No new documents admitted — this is measurement only               ║
 * ║                                                                          ║
 * ║  Engineering note: fetches for all 21 sources go through the disk-      ║
 * ║  cached fetcher (isolated "dra-bmk-021" cache directory — see the       ║
 * ║  generalised createDiskCachedFetcher, originally built for DRA-ACQ-017  ║
 * ║  Phase 2). This reuses the established split-run/disk-handoff pattern  ║
 * ║  from DRA-BMK-020 to fit both runs within practical tool-execution      ║
 * ║  time budgets. It changes only where bytes are read from on repeat      ║
 * ║  invocations — every source is still the product of a genuine live     ║
 * ║  HTTP fetch to its own canonical URL the first time it is requested,    ║
 * ║  and the cache stores the exact bytes returned by that fetch.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { BenchmarkRunner } from "../runner.js";
import type {
  BenchmarkExecutionDocument,
  BenchmarkRunResult,
} from "../runner.js";
import { loadBenchmarkCorpus } from "../../evidence/corpus-loader.js";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { APACHE_HTTPD_AUTH_HTML } from "../../acquisition/fixtures/apache-httpd-auth-fixture.js";

import { RUN_A_SUMMARY_PATH } from "./dra-bmk-021-shared.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic runs
// ---------------------------------------------------------------------------

const FIXED_TS_A     = "2026-08-09T18:00:00.000Z";
const FIXED_RUN_ID_A = "bmk-021-run-A";

// ---------------------------------------------------------------------------
// Frozen reference digests (from admitted freeze records) — DRA-DOC-0018 and
// DRA-DOC-0021 only; the remaining DRA-DOC-0007..0020 digests are already
// re-verified in DRA-BMK-020 and are not re-asserted here (this checkpoint
// measures the evaluator run, not re-litigating prior freeze integrity).
// ---------------------------------------------------------------------------

const REF_EC_SOURCE_DIGEST      = "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2";
const REF_HLEG_EN_SOURCE_DIGEST = "4a89863a96551bb3b9ce786afb1b1d58e8062f5a7fa3ed6748922550dde35e25";

// ---------------------------------------------------------------------------
// Live document URLs
// ---------------------------------------------------------------------------

const ACAS_URL  = "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";
const CMA_URL   = "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";
const NIST_URL  = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
const PRA_URL   = "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";
const FDA_URL   = "https://www.fda.gov/media/145022/download";
const BIS_URL   = "https://www.bis.org/bcbs/publ/d516.pdf";
const NCSC_URL  = "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";
const MHRA_URL  = "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";
const EC_URL    = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423"; // DRA-DOC-0018 (es)
const HLEG_EN_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419"; // DRA-DOC-0021 (en)
const INE_URL   = "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf";
const CNIL_URL  = "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf";

const ICO_BASE          = "https://ico.org.uk";
const ICO_GUIDANCE_BASE = "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";
const ICO_LANDING_URL   = `${ICO_BASE}${ICO_GUIDANCE_BASE}/`;

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
] as const;

const ICO_SECTION_URLS = ICO_SECTION_SLUGS.map((slug) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`);

const HSE_BASE = "https://www.hse.gov.uk/simple-health-safety";
const HSE_LANDING_URL = `${HSE_BASE}/`;

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

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext helper
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-bmk021-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Shared state populated in beforeAll
// ---------------------------------------------------------------------------

let allDocs: BenchmarkExecutionDocument[] = [];
let runResultA: BenchmarkRunResult;
let setupError: string | null = null;

let acasText = "", cmaText = "", nistText = "", doc7Text = "", icoText = "";
let praText = "", fdaText = "", bisText = "", ncscText = "", hseText = "";
let mhraText = "", ecText = "", ineText = "", cnilText = "", hlegEnText = "";

let ecSourceDigestLive = "";
let hlegEnSourceDigestLive = "";

beforeAll(async () => {
  try {
    const loaded = loadBenchmarkCorpus();
    if (!loaded.ok) { setupError = `loadBenchmarkCorpus failed: ${loaded.message}`; return; }
    const initialDocs = [...loaded.documents];

    // DRA-DOC-0007: normalise Apache fixture HTML (no network)
    const htmlBytes  = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
    const htmlDigest = computeSourceDigest(htmlBytes);
    const doc7Norm   = await normaliseContent(htmlBytes, "text/html", htmlDigest);
    if (!doc7Norm.ok) { setupError = `DRA-DOC-0007 normalisation failed: ${doc7Norm.message}`; return; }
    doc7Text = doc7Norm.document.text;

    const doc7: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0007" as any,
        title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
        sourceType: "HUMAN_AUTHORED", documentType: "ARTICLE", domain: "TECHNICAL", language: "en",
        generator: "The Apache Software Foundation", generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html",
        sourceReference: "https://httpd.apache.org/docs/2.4/howto/auth.html",
        benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "a".repeat(64),
      },
      generatedText: doc7Text, sourceText: doc7Text,
    };

    const realFetcher = createHttpFetcher({ timeoutMs: 120_000, maxRedirects: 5, maxBytes: 15_000_000, userAgent: "DRA-BMK-021/1.0" });
    const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-021");

    type PdfFetchResult = { ok: true; text: string; sourceDigest: string } | { ok: false; error: string };

    async function fetchAndExtractPdf(acquisitionId: string, url: string, expectedPublisher: string, expectedTitle: string, label: string): Promise<PdfFetchResult> {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_A, expectedPublisher, expectedTitle };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) return { ok: false, error: `${label} fetch failed: ${fetchRes.code}` };
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) return { ok: false, error: `${label} normalisation failed: ${norm.message}` };
      return { ok: true, text: norm.document.text, sourceDigest: srcDigest };
    }

    console.log("\n── Fetching 12 independent PDFs (disk-cached) in parallel… ─");
    const pdfFetchPromise = Promise.all([
      fetchAndExtractPdf("DRA-ACQ-000002", ACAS_URL, "Acas", "Acas guide", "Acas"),
      fetchAndExtractPdf("DRA-ACQ-000008", CMA_URL, "CMA", "AI Foundation Models Short Version", "CMA"),
      fetchAndExtractPdf("DRA-ACQ-000012", NIST_URL, "NIST", "AI RMF 1.0", "NIST"),
      fetchAndExtractPdf("DRA-ACQ-000014", PRA_URL, "PRA", "PRA SS1/23", "PRA"),
      fetchAndExtractPdf("DRA-ACQ-000015", FDA_URL, "FDA", "FDA AI/ML SaMD Action Plan", "FDA"),
      fetchAndExtractPdf("DRA-ACQ-000016", BIS_URL, "BCBS", "Principles for Operational Resilience", "BIS"),
      fetchAndExtractPdf("DRA-ACQ-000018", NCSC_URL, "NCSC", "Principles for the security of machine learning", "NCSC"),
      fetchAndExtractPdf("DRA-ACQ-000020", MHRA_URL, "MHRA", "Best practice guidance on patient information leaflets (PILs)", "MHRA"),
      fetchAndExtractPdf("DRA-ACQ-000021", EC_URL, "European Commission", "Ethics Guidelines for Trustworthy AI", "EC-es"),
      fetchAndExtractPdf("DRA-ACQ-000024", HLEG_EN_URL, "European Commission", "Ethics Guidelines for Trustworthy AI", "HLEG-en"),
      fetchAndExtractPdf("DRA-ACQ-000022", INE_URL, "INE", "Informe de la Revisión por Pares", "INE"),
      fetchAndExtractPdf("DRA-ACQ-000023", CNIL_URL, "Commission Nationale de l'Informatique et des Libertés (CNIL)", "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle", "CNIL"),
    ]);

    console.log("── Fetching DRA-DOC-0011 (ICO guidance — 14 HTML sections, disk-cached, parallel)… ─");
    const icoFetchPromise = Promise.all(
      ICO_SECTION_URLS.map(async (url) => {
        const sectionReq = { acquisitionId: "DRA-ACQ-000013", sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_A, expectedPublisher: "ICO", expectedTitle: "Guidance on AI and data protection" };
        const sectionFetch = await fetcher(sectionReq as any, {});
        if (!sectionFetch.ok) return { ok: false as const, error: `ICO section fetch failed: ${sectionFetch.code}` };
        const sectionDigest = computeSourceDigest(sectionFetch.source.rawBytes);
        const sectionNorm   = await normaliseContent(sectionFetch.source.rawBytes, "text/html", sectionDigest);
        if (!sectionNorm.ok) return { ok: false as const, error: `ICO section normalisation failed: ${sectionNorm.message}` };
        return { ok: true as const, text: sectionNorm.document.text };
      }),
    );

    console.log(`── Fetching DRA-DOC-0016 (HSE — ${HSE_PAGE_URLS.length} HTML pages, disk-cached, parallel)… ─`);
    const hseFetchPromise = Promise.all(
      HSE_PAGE_URLS.map(async (url) => {
        const pageReq = { acquisitionId: "DRA-ACQ-000019", sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_A, expectedPublisher: "HSE", expectedTitle: "Health and safety basics for your business" };
        const pageFetch = await fetcher(pageReq as any, {});
        if (!pageFetch.ok) return { ok: false as const, error: `HSE page fetch failed: ${pageFetch.code}` };
        const pageDigest = computeSourceDigest(pageFetch.source.rawBytes);
        const pageNorm    = await normaliseContent(pageFetch.source.rawBytes, "text/html", pageDigest);
        if (!pageNorm.ok) return { ok: false as const, error: `HSE page normalisation failed: ${pageNorm.message}` };
        return { ok: true as const, text: pageNorm.document.text };
      }),
    );

    const [pdfResults, icoResults, hseResults] = await Promise.all([pdfFetchPromise, icoFetchPromise, hseFetchPromise]);

    const [acasR, cmaR, nistR, praR, fdaR, bisR, ncscR, mhraR, ecR, hlegEnR, ineR, cnilR] = pdfResults;
    for (const r of pdfResults) { if (!r.ok) { setupError = r.error; return; } }

    acasText = acasR.ok ? acasR.text : "";
    cmaText  = cmaR.ok ? cmaR.text : "";
    nistText = nistR.ok ? nistR.text : "";
    praText  = praR.ok ? praR.text : "";
    fdaText  = fdaR.ok ? fdaR.text : "";
    bisText  = bisR.ok ? bisR.text : "";
    ncscText = ncscR.ok ? ncscR.text : "";
    mhraText = mhraR.ok ? mhraR.text : "";
    ecText   = ecR.ok ? ecR.text : "";
    hlegEnText = hlegEnR.ok ? hlegEnR.text : "";
    ineText  = ineR.ok ? ineR.text : "";
    cnilText = cnilR.ok ? cnilR.text : "";

    ecSourceDigestLive     = ecR.ok ? ecR.sourceDigest : "";
    hlegEnSourceDigestLive = hlegEnR.ok ? hlegEnR.sourceDigest : "";

    console.log(`\n── DRA-DOC-0018 Frozen vs Live: ${ecSourceDigestLive === REF_EC_SOURCE_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`── DRA-DOC-0021 Frozen vs Live: ${hlegEnSourceDigestLive === REF_HLEG_EN_SOURCE_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

    for (const r of icoResults) { if (!r.ok) { setupError = r.error; return; } }
    icoText = icoResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);

    for (const r of hseResults) { if (!r.ok) { setupError = r.error; return; } }
    hseText = hseResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);

    const doc8: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0008" as any, title: "Discipline and grievances at work: the Acas guide", sourceType: "HUMAN_AUTHORED", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", generator: "Advisory, Conciliation and Arbitration Service (Acas)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${ACAS_URL}`, sourceReference: ACAS_URL, benchmarkStatus: "FROZEN", difficulty: "LOW", integrityDigest: "b".repeat(64) }, generatedText: acasText, sourceText: acasText };
    const doc9: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0009" as any, title: "AI Foundation Models: Short Version", sourceType: "HUMAN_AUTHORED", documentType: "SUMMARY", domain: "GENERAL", language: "en-GB", generator: "Competition and Markets Authority", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${CMA_URL}`, sourceReference: CMA_URL, benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "c".repeat(64) }, generatedText: cmaText, sourceText: cmaText };
    const doc10: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0010" as any, title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", sourceType: "HUMAN_AUTHORED", documentType: "POLICY", domain: "TECHNICAL", language: "en", generator: "National Institute of Standards and Technology (NIST)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${NIST_URL}`, sourceReference: NIST_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "d".repeat(64) }, generatedText: nistText, sourceText: nistText };
    const doc11: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0011" as any, title: "Guidance on AI and data protection", sourceType: "HUMAN_AUTHORED", documentType: "OTHER", domain: "LEGAL", language: "en", generator: "Information Commissioner's Office (ICO)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${ICO_LANDING_URL} (14 sections, multi-page HTML)`, sourceReference: ICO_LANDING_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "e".repeat(64) }, generatedText: icoText, sourceText: icoText };
    const doc12: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0012" as any, title: "Model risk management principles for banks", sourceType: "HUMAN_AUTHORED", documentType: "OTHER", domain: "FINANCE", language: "en", generator: "Prudential Regulation Authority (PRA), Bank of England", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${PRA_URL}`, sourceReference: PRA_URL, benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "f".repeat(64) }, generatedText: praText, sourceText: praText };
    const doc13: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0013" as any, title: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan", sourceType: "HUMAN_AUTHORED", documentType: "POLICY", domain: "HEALTHCARE", language: "en", generator: "U.S. Food and Drug Administration (FDA)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${FDA_URL}`, sourceReference: FDA_URL, benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "0".repeat(64) }, generatedText: fdaText, sourceText: fdaText };
    const doc14: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0014" as any, title: "Principles for Operational Resilience", sourceType: "HUMAN_AUTHORED", documentType: "POLICY", domain: "FINANCE", language: "en", generator: "Basel Committee on Banking Supervision (BCBS)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${BIS_URL}`, sourceReference: BIS_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "1".repeat(64) }, generatedText: bisText, sourceText: bisText };
    const doc15: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0015" as any, title: "Principles for the security of machine learning", sourceType: "HUMAN_AUTHORED", documentType: "OTHER", domain: "TECHNICAL", language: "en", generator: "National Cyber Security Centre (NCSC)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${NCSC_URL}`, sourceReference: NCSC_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "2".repeat(64) }, generatedText: ncscText, sourceText: ncscText };
    const doc16: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0016" as any, title: "Health and safety basics for your business", sourceType: "HUMAN_AUTHORED", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", generator: "Health and Safety Executive (HSE)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${HSE_LANDING_URL} (26 pages, multi-page HTML)`, sourceReference: HSE_LANDING_URL, benchmarkStatus: "FROZEN", difficulty: "LOW", integrityDigest: "3".repeat(64) }, generatedText: hseText, sourceText: hseText };
    const doc17: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0017" as any, title: "Best practice guidance on patient information leaflets (PILs)", sourceType: "HUMAN_AUTHORED", documentType: "PROCEDURE", domain: "HEALTHCARE", language: "en-GB", generator: "Medicines and Healthcare products Regulatory Agency (MHRA)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${MHRA_URL}`, sourceReference: MHRA_URL, benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "4".repeat(64) }, generatedText: mhraText, sourceText: mhraText };
    const doc18: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0018" as any, title: "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)", sourceType: "HUMAN_AUTHORED", documentType: "REPORT", domain: "TECHNICAL", language: "es", generator: "European Commission — High-Level Expert Group on Artificial Intelligence", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from ${EC_URL}`, sourceReference: EC_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "5".repeat(64) }, generatedText: ecText, sourceText: ecText };
    const doc19: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0019" as any, title: "Informe de la Revisión por Pares (Peer Review Report — Spain's compliance with the European Statistics Code of Practice)", sourceType: "HUMAN_AUTHORED", documentType: "REPORT", domain: "GENERAL", language: "es", generator: "Instituto Nacional de Estadística (INE)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${INE_URL}`, sourceReference: INE_URL, benchmarkStatus: "FROZEN", difficulty: "MEDIUM", integrityDigest: "6".repeat(64) }, generatedText: ineText, sourceText: ineText };
    const doc20: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0020" as any, title: "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle", sourceType: "HUMAN_AUTHORED", documentType: "REPORT", domain: "LEGAL", language: "fr", generator: "Commission Nationale de l'Informatique et des Libertés (CNIL)", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${CNIL_URL}`, sourceReference: CNIL_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "7".repeat(64) }, generatedText: cnilText, sourceText: cnilText };
    const doc21: BenchmarkExecutionDocument = { corpusDocument: { corpusId: "DRA-DOC-0021" as any, title: "Ethics Guidelines for Trustworthy AI", sourceType: "HUMAN_AUTHORED", documentType: "REPORT", domain: "TECHNICAL", language: "en", generator: "European Commission — High-Level Expert Group on Artificial Intelligence", generatorVersion: "DRA-CORPUS-1.0.0", creationMethod: `Public document acquisition via DRA-ENG-009 from ${HLEG_EN_URL}`, sourceReference: HLEG_EN_URL, benchmarkStatus: "FROZEN", difficulty: "HIGH", integrityDigest: "8".repeat(64) }, generatedText: hlegEnText, sourceText: hlegEnText };

    allDocs = [...initialDocs, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15, doc16, doc17, doc18, doc19, doc20, doc21];
    allDocs.sort((a, b) => parseInt(a.corpusDocument.corpusId.slice(-4), 10) - parseInt(b.corpusDocument.corpusId.slice(-4), 10));

    console.log(`\n── Executing Run A (fixedTimestamp: ${FIXED_TS_A}) ──────`);
    console.time("run-A");
    const runnerA = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_A, fixedRunId: FIXED_RUN_ID_A });
    runResultA    = runnerA.execute(allDocs);
    console.timeEnd("run-A");
    console.log(`   Run A: ${runResultA.successCount} success, ${runResultA.failureCount} failure / ${runResultA.documentCount} docs`);

    const summary = {
      fixedTimestamp: FIXED_TS_A,
      fixedRunId: FIXED_RUN_ID_A,
      documentCount: runResultA.documentCount,
      successCount: runResultA.successCount,
      failureCount: runResultA.failureCount,
      records: runResultA.records.map((r) => ({
        corpusId: r.corpusId,
        executedAt: r.executedAt,
        ok: r.evaluationResult.ok,
        decision: r.evaluationResult.ok ? r.evaluationResult.decision : null,
        issueClasses: r.evaluationResult.ok ? r.evaluationResult.issues.map((iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN") : [],
        issueCount: r.evaluationResult.ok ? r.evaluationResult.issues.length : null,
        statementCount: r.evaluationResult.ok ? (r.evaluationResult as any).pipeline?.stage2?.statements?.length ?? null : null,
        substantiveDigest: r.evaluationResult.ok ? r.evaluationResult.proofReceipt.substantiveDigest : null,
        receiptIntegrityValid: r.evaluationResult.ok ? verifyReceiptIntegrity(r.evaluationResult.proofReceipt) : null,
        errorCode: r.evaluationResult.ok ? null : (r.evaluationResult as any).code,
      })),
      matches: { ecFreezeRepresentationMatch: ecSourceDigestLive === REF_EC_SOURCE_DIGEST, hlegEnFreezeRepresentationMatch: hlegEnSourceDigestLive === REF_HLEG_EN_SOURCE_DIGEST },
    };
    await writeFile(RUN_A_SUMMARY_PATH, JSON.stringify(summary, null, 2), "utf-8");
    console.log(`   Run A summary persisted to ${RUN_A_SUMMARY_PATH}`);
  } catch (err) {
    setupError = String(err);
  }
}, 1_200_000);

// ---------------------------------------------------------------------------
// Part 4 — Frozen Evaluator Run (Run A)
// ---------------------------------------------------------------------------

describe("DRA-BMK-021 — Part 4: Frozen Evaluator Run (Run A)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("all 21 BenchmarkExecutionDocuments were assembled in order", () => {
    expect(allDocs).toHaveLength(21);
    expect(allDocs.map((d) => d.corpusDocument.corpusId)).toEqual([
      "DRA-DOC-0001","DRA-DOC-0002","DRA-DOC-0003","DRA-DOC-0004","DRA-DOC-0005","DRA-DOC-0006",
      "DRA-DOC-0007","DRA-DOC-0008","DRA-DOC-0009","DRA-DOC-0010","DRA-DOC-0011","DRA-DOC-0012",
      "DRA-DOC-0013","DRA-DOC-0014","DRA-DOC-0015","DRA-DOC-0016","DRA-DOC-0017","DRA-DOC-0018",
      "DRA-DOC-0019","DRA-DOC-0020","DRA-DOC-0021",
    ]);
  });

  it("reports live document integrity status for DRA-DOC-0018 and DRA-DOC-0021 against admitted freeze records", () => {
    expect(REF_EC_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_HLEG_EN_SOURCE_DIGEST).toHaveLength(64);
    expect(ecText.length).toBeGreaterThan(0);
    expect(hlegEnText.length).toBeGreaterThan(0);
    console.log(`  DRA-DOC-0018 (es): ${ecSourceDigestLive === REF_EC_SOURCE_DIGEST ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0021 (en): ${hlegEnSourceDigestLive === REF_HLEG_EN_SOURCE_DIGEST ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
  });

  it("Run A produced 21 results", () => {
    expect(runResultA.documentCount).toBe(21);
    expect(runResultA.records).toHaveLength(21);
  });

  it("Run A: every document evaluated successfully (runner never throws, no failures)", () => {
    for (const r of runResultA.records) {
      if (!r.evaluationResult.ok) console.error(`${r.corpusId} failed:`, (r.evaluationResult as any).code, (r.evaluationResult as any).message);
      expect(r.evaluationResult.ok).toBe(true);
    }
    expect(runResultA.failureCount).toBe(0);
    expect(runResultA.successCount).toBe(21);
  });

  it("Run A: DRA-DOC-0021 reproduces the REVIEW / 7-issue admission-time observation", () => {
    const r21 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0021");
    expect(r21).toBeDefined();
    if (r21 && r21.evaluationResult.ok) {
      console.log(`\n── DRA-DOC-0021 Run A result: decision=${r21.evaluationResult.decision}, issues=${r21.evaluationResult.issues.length}`);
      expect(r21.evaluationResult.decision).toBe("REVIEW");
      expect(r21.evaluationResult.issues.length).toBe(7);
      for (const iss of r21.evaluationResult.issues) {
        expect((iss as any).issueClass ?? (iss as any).class).toBe("EVIDENCE_INADEQUATE");
      }
    }
  });

  it("Run A: DRA-DOC-0018 (Spanish parallel edition) result is recorded for comparison", () => {
    const r18 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0018");
    expect(r18).toBeDefined();
    if (r18 && r18.evaluationResult.ok) {
      console.log(`── DRA-DOC-0018 Run A result: decision=${r18.evaluationResult.decision}, issues=${r18.evaluationResult.issues.length}`);
    }
  });

  it("Run A: every proof receipt passes integrity verification (21/21)", () => {
    let verified = 0;
    for (const r of runResultA.records) {
      if (r.evaluationResult.ok) {
        expect(verifyReceiptIntegrity(r.evaluationResult.proofReceipt)).toBe(true);
        verified++;
      }
    }
    expect(verified).toBe(21);
  });

  it("reports the corpus-wide decision distribution for the 21-document corpus", () => {
    const dist: Record<string, number> = {};
    for (const r of runResultA.records) {
      if (r.evaluationResult.ok) {
        const d = r.evaluationResult.decision;
        dist[d] = (dist[d] ?? 0) + 1;
      }
    }
    console.log("\n── Corpus-wide decision distribution (21 docs, Run A) ───────");
    for (const [k, v] of Object.entries(dist)) console.log(`  ${k}: ${v}`);
    expect(Object.values(dist).reduce((a, b) => a + b, 0)).toBe(21);
  });

  it("reports issue-class coverage against the 3/9 ceiling established by DRA-CHK-002", () => {
    const classes = new Set<string>();
    for (const r of runResultA.records) {
      if (r.evaluationResult.ok) {
        for (const iss of r.evaluationResult.issues) classes.add((iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN");
      }
    }
    console.log("\n── Issue-class coverage (Run A) ─────────────────────────────");
    console.log(`  classes observed: ${[...classes].sort().join(", ")}`);
    console.log(`  coverage: ${classes.size} / 9`);
  });
});
