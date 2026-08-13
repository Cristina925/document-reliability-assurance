/**
 * DRA-BMK-021 — Run B + Cross-Run Assertions (companion to
 * dra-bmk-021-evaluator-run.test.ts, which performs Run A)
 *
 * Engineering note: this file independently reconstructs all 21 documents
 * (via the same disk-cached fetcher, cache warm from Run A) and executes
 * ONLY Run B. It loads the Run A summary persisted by
 * dra-bmk-021-evaluator-run.test.ts to perform every cross-run assertion
 * (decision/digest/issue-count identity, the 42-total-receipts cross-check,
 * timestamp-difference check). Run dra-bmk-021-evaluator-run.test.ts BEFORE
 * this file.
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

const FIXED_TS_A     = "2026-08-09T18:00:00.000Z";
const FIXED_TS_B     = "2026-08-09T18:30:00.000Z";
const FIXED_RUN_ID_B = "bmk-021-run-B";

const ACAS_URL  = "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";
const CMA_URL   = "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";
const NIST_URL  = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
const PRA_URL   = "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";
const FDA_URL   = "https://www.fda.gov/media/145022/download";
const BIS_URL   = "https://www.bis.org/bcbs/publ/d516.pdf";
const NCSC_URL  = "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";
const MHRA_URL  = "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";
const EC_URL    = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";
const HLEG_EN_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419";
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

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-bmk021b-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

interface RunASummaryRecord {
  corpusId: string;
  executedAt: string;
  ok: boolean;
  decision: string | null;
  issueClasses: string[];
  issueCount: number | null;
  statementCount: number | null;
  substantiveDigest: string | null;
  receiptIntegrityValid: boolean | null;
  errorCode: string | null;
}
interface RunASummary {
  fixedTimestamp: string;
  fixedRunId: string;
  documentCount: number;
  successCount: number;
  failureCount: number;
  records: RunASummaryRecord[];
  matches: { ecFreezeRepresentationMatch: boolean; hlegEnFreezeRepresentationMatch: boolean };
}

let allDocs: BenchmarkExecutionDocument[] = [];
let runResultB: BenchmarkRunResult;
let runASummary: RunASummary;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const loaded = loadBenchmarkCorpus();
    if (!loaded.ok) { setupError = `loadBenchmarkCorpus failed: ${loaded.message}`; return; }
    const initialDocs = [...loaded.documents];

    const htmlBytes  = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
    const htmlDigest = computeSourceDigest(htmlBytes);
    const doc7Norm   = await normaliseContent(htmlBytes, "text/html", htmlDigest);
    if (!doc7Norm.ok) { setupError = `DRA-DOC-0007 normalisation failed: ${doc7Norm.message}`; return; }
    const doc7Text = doc7Norm.document.text;

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

    type PdfFetchResult = { ok: true; text: string } | { ok: false; error: string };

    async function fetchAndExtractPdf(acquisitionId: string, url: string, expectedPublisher: string, expectedTitle: string, label: string): Promise<PdfFetchResult> {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_B, expectedPublisher, expectedTitle };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) return { ok: false, error: `${label} fetch failed: ${fetchRes.code}` };
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) return { ok: false, error: `${label} normalisation failed: ${norm.message}` };
      return { ok: true, text: norm.document.text };
    }

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

    const icoFetchPromise = Promise.all(
      ICO_SECTION_URLS.map(async (url) => {
        const sectionReq = { acquisitionId: "DRA-ACQ-000013", sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_B, expectedPublisher: "ICO", expectedTitle: "Guidance on AI and data protection" };
        const sectionFetch = await fetcher(sectionReq as any, {});
        if (!sectionFetch.ok) return { ok: false as const, error: `ICO section fetch failed: ${sectionFetch.code}` };
        const sectionDigest = computeSourceDigest(sectionFetch.source.rawBytes);
        const sectionNorm   = await normaliseContent(sectionFetch.source.rawBytes, "text/html", sectionDigest);
        if (!sectionNorm.ok) return { ok: false as const, error: `ICO section normalisation failed: ${sectionNorm.message}` };
        return { ok: true as const, text: sectionNorm.document.text };
      }),
    );

    const hseFetchPromise = Promise.all(
      HSE_PAGE_URLS.map(async (url) => {
        const pageReq = { acquisitionId: "DRA-ACQ-000019", sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS_B, expectedPublisher: "HSE", expectedTitle: "Health and safety basics for your business" };
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
    for (const r of icoResults) { if (!r.ok) { setupError = r.error; return; } }
    for (const r of hseResults) { if (!r.ok) { setupError = r.error; return; } }

    const acasText = acasR.ok ? acasR.text : "";
    const cmaText  = cmaR.ok ? cmaR.text : "";
    const nistText = nistR.ok ? nistR.text : "";
    const praText  = praR.ok ? praR.text : "";
    const fdaText  = fdaR.ok ? fdaR.text : "";
    const bisText  = bisR.ok ? bisR.text : "";
    const ncscText = ncscR.ok ? ncscR.text : "";
    const mhraText = mhraR.ok ? mhraR.text : "";
    const ecText   = ecR.ok ? ecR.text : "";
    const hlegEnText = hlegEnR.ok ? hlegEnR.text : "";
    const ineText  = ineR.ok ? ineR.text : "";
    const cnilText = cnilR.ok ? cnilR.text : "";
    const icoText  = icoResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);
    const hseText  = hseResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);

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

    const raw = await readFile(RUN_A_SUMMARY_PATH, "utf-8").catch(() => null);
    if (raw === null) {
      setupError = `Run A summary not found at ${RUN_A_SUMMARY_PATH}. Run dra-bmk-021-evaluator-run.test.ts before this file.`;
      return;
    }
    runASummary = JSON.parse(raw) as RunASummary;

    console.log(`\n── Executing Run B (fixedTimestamp: ${FIXED_TS_B}) ──────`);
    console.time("run-B");
    const runnerB = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_B, fixedRunId: FIXED_RUN_ID_B });
    runResultB    = runnerB.execute(allDocs);
    console.timeEnd("run-B");
    console.log(`   Run B: ${runResultB.successCount} success, ${runResultB.failureCount} failure / ${runResultB.documentCount} docs`);
  } catch (err) {
    setupError = String(err);
  }
}, 1_200_000);

describe("DRA-BMK-021 — Part 5: Frozen Evaluator Run (Run B)", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("Run B produced 21 results", () => {
    expect(runResultB.documentCount).toBe(21);
    expect(runResultB.records).toHaveLength(21);
  });

  it("no unhandled evaluation failures in Run B", () => {
    for (const record of runResultB.records) {
      const result = record.evaluationResult;
      const status = result.ok ? `decision=${result.decision}` : `FAILED: ${(result as any).code}`;
      console.log(`  ${record.corpusId}: ${status}`);
    }
    expect(runResultB.failureCount).toBe(0);
    expect(runResultB.successCount).toBe(21);
  });

  it("42 proof receipts expected (21 documents × 2 runs)", () => {
    const successB = runResultB.records.filter((r) => r.evaluationResult.ok).length;
    console.log(`\n── Proof Receipt Count ───────────────────────────────────────`);
    console.log(`  Run A successful evaluations: ${runASummary.successCount}/21`);
    console.log(`  Run B successful evaluations: ${successB}/21`);
    console.log(`  Total proof receipts produced: ${runASummary.successCount + successB}`);
    expect(runASummary.successCount + successB).toBe(42);
  });
});

describe("DRA-BMK-021 — Part 6: Cross-Run Integrity Checks (42/42 receipts)", () => {
  it("all Run B proof receipts pass structural integrity check", () => {
    let verifiedCount = 0, totalCount = 0;
    for (const record of runResultB.records) {
      if (record.evaluationResult.ok) {
        totalCount++;
        if (verifyReceiptIntegrity(record.evaluationResult.proofReceipt)) verifiedCount++;
      }
    }
    console.log(`  Run B: ${verifiedCount}/${totalCount} proof receipts passed integrity check`);
    expect(verifiedCount).toBe(totalCount);
    expect(totalCount).toBe(21);

    const aVerified = runASummary.records.filter((r) => r.receiptIntegrityValid === true).length;
    const aTotal    = runASummary.records.filter((r) => r.ok).length;
    console.log(`  Run A (loaded): ${aVerified}/${aTotal} proof receipts passed integrity check`);
    expect(aVerified).toBe(aTotal);
    expect(aTotal).toBe(21);
    expect(aVerified + verifiedCount).toBe(42);
  });
});

describe("DRA-BMK-021 — Part 7: Run A vs Run B Reproducibility (all 21 documents)", () => {
  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-021) ───────────────────");
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      expect(sumA).toBeDefined();
      if (sumA?.ok && rB.evaluationResult.ok) {
        const match = sumA.decision === rB.evaluationResult.decision;
        console.log(`  ${rB.corpusId}: ${rB.evaluationResult.decision} | ${match ? "IDENTICAL ✓" : "DIFFERENT ✗"}`);
        expect(sumA.decision).toBe(rB.evaluationResult.decision);
      }
    }
  });

  it("same substantiveDigest on both runs for every document", () => {
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.evaluationResult.ok) {
        expect(sumA.substantiveDigest).toBe(rB.evaluationResult.proofReceipt.substantiveDigest);
      }
    }
  });

  it("same issue count and issue classes on both runs for every document", () => {
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.evaluationResult.ok) {
        expect(sumA.issueCount).toBe(rB.evaluationResult.issues.length);
        const classesB = rB.evaluationResult.issues.map((iss: any) => iss.issueClass ?? iss.class ?? "UNKNOWN").sort();
        expect([...sumA.issueClasses].sort()).toEqual(classesB);
      }
    }
  });

  it("operational timestamps differ between runs (fixedTimestamp control is active)", () => {
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      expect(sumA?.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      expect(sumA?.executedAt).not.toBe(rB.executedAt);
    }
  });

  it("adding DRA-DOC-0021 did not change any frozen first-20 result: corpus-wide decision distribution matches the known BMK-020 baseline for those 20 documents", () => {
    const distFirst20: Record<string, number> = {};
    for (const rB of runResultB.records) {
      if (rB.corpusId === "DRA-DOC-0021") continue;
      if (rB.evaluationResult.ok) {
        const d = rB.evaluationResult.decision;
        distFirst20[d] = (distFirst20[d] ?? 0) + 1;
      }
    }
    console.log("\n── First-20 decision distribution (Run B, excluding DRA-DOC-0021) ──");
    for (const [k, v] of Object.entries(distFirst20)) console.log(`  ${k}: ${v}`);
    // DRA-BMK-020 baseline: SUPPORTED 10 / REVIEW 8 / HOLD 2 (20 docs total)
    expect(distFirst20["SUPPORTED"]).toBe(10);
    expect(distFirst20["REVIEW"]).toBe(8);
    expect(distFirst20["HOLD"]).toBe(2);
  });
});
