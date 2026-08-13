/**
 * DRA-BMK-020 — Run B + Cross-Run Assertions (companion to
 * dra-bmk-020-evaluator-run.test.ts, which performs Run A)
 *
 * Engineering note: this file independently live-fetches and normalises all
 * 20 documents, then executes ONLY Run B. It loads the Run A summary that
 * dra-bmk-020-evaluator-run.test.ts persisted to disk to perform every
 * assertion that needs both runs (decision/digest/issue-count identity
 * across runs, the 40-total-receipts cross-check, timestamp-difference
 * check). This two-file split exists purely to fit each half's evaluator
 * cost inside a single tool-invocation time budget — it changes nothing
 * about what is fetched, evaluated, or asserted. Run
 * dra-bmk-020-evaluator-run.test.ts BEFORE this file.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  TWENTY-DOCUMENT EVALUATOR RUN — DRA-BMK-020                             ║
 * ║                                                                          ║
 * ║  Corpus: DRA-DOC-0001 through DRA-DOC-0020                              ║
 * ║  Evaluator: frozen Version 1 (evaluateDocument, BenchmarkRunner)        ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-09T17:00:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-09T17:30:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed or decisions replaced                        ║
 * ║    • No evaluator features added                                         ║
 * ║    • Runner never throws — failures captured as records                 ║
 * ║    • No tuning for DRA-DOC-0020                                          ║
 * ║    • No French-specific rules, translation, or language-detection added ║
 * ║    • No new documents admitted — this is measurement only               ║
 * ║    • The admission-time evaluator observation (SUPPORTED, 0 issues) is   ║
 * ║      NOT assumed here — it is re-derived from this run.                  ║
 * ║                                                                          ║
 * ║  Live network: DRA-DOC-0008, 0009, 0010, 0012, 0013, 0014, 0015, 0017,  ║
 * ║                0018, 0019, 0020 (PDFs via pdftotext)                    ║
 * ║                DRA-DOC-0011 (14 HTML sections, ICO guidance)             ║
 * ║                DRA-DOC-0016 (26 HTML pages, HSE guidance)                ║
 * ║  DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture.          ║
 * ║                                                                          ║
 * ║  DRA-DOC-0020 live-text comparison:                                      ║
 * ║    Live source digest compared against frozen reference (DRA-FRZ-       ║
 * ║    000014). If match → FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE).   ║
 * ║    If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).               ║
 * ║                                                                          ║
 * ║  DRA-DOC-0020 evidence questions:                                        ║
 * ║    1. Does the CNIL AI-Ethics Report (fr) introduce new issue-class      ║
 * ║       coverage beyond the 3/9 (IC-4, IC-5, IC-7) Version 1 coverage      ║
 * ║       ceiling established by DRA-CHK-002? Measured, not assumed.        ║
 * ║    2. As the corpus's THIRD non-English document and FIRST French       ║
 * ║       document, does DRA-DOC-0020 reproduce the DRA-BMK-018/019          ║
 * ║       Spanish-specific NO_DIFFERENCE finding (both Spanish documents     ║
 * ║       produced identical decision/issue outcomes), or does introducing   ║
 * ║       a genuinely new language surface different behaviour? Conclusions  ║
 * ║       remain scoped strictly to three documents across two non-English   ║
 * ║       languages — this is NOT a general multilingual-robustness claim.   ║
 * ║       Reported factually — observed-behaviour vs possible-sensitivity   ║
 * ║       vs confirmed-defect vs no-difference. Never speculative.          ║
 * ║                                                                          ║
 * ║  Allow 20 minutes.                                                       ║
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
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { APACHE_HTTPD_AUTH_HTML } from "../../acquisition/fixtures/apache-httpd-auth-fixture.js";
import {
  REACHABILITY_MATRIX,
  COVERAGE_CEILING,
} from "../../analysis/reachability-matrix.js";
import { RUN_A_SUMMARY_PATH } from "./dra-bmk-020-shared.js";

type RunASummary = {
  fixedTimestamp: string;
  fixedRunId: string;
  documentCount: number;
  successCount: number;
  failureCount: number;
  records: Array<{
    corpusId: string;
    executedAt: string;
    ok: boolean;
    decision: string | null;
    issueClasses: string[];
    issueCount: number | null;
    substantiveDigest: string | null;
    receiptIntegrityValid: boolean | null;
    errorCode: string | null;
  }>;
  matches: {
    ecFreezeRepresentationMatch: boolean;
    ineFreezeRepresentationMatch: boolean;
    cnilFreezeRepresentationMatch: boolean;
    cnilLiveSourceDigest: string;
    cnilLiveTextDigest: string;
  };
};

let runASummary: RunASummary;

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic runs
// ---------------------------------------------------------------------------

const FIXED_TS_A     = "2026-08-09T17:00:00.000Z";
const FIXED_TS_B     = "2026-08-09T17:30:00.000Z";
const FIXED_RUN_ID_A = "bmk-020-run-A";
const FIXED_RUN_ID_B = "bmk-020-run-B";

// ---------------------------------------------------------------------------
// Frozen reference digests (from admitted freeze records)
// ---------------------------------------------------------------------------

const REF_ACAS_SOURCE_DIGEST = "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300";

const REF_CMA_SOURCE_DIGEST  = "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f";

const REF_NIST_SOURCE_DIGEST = "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1";

const REF_ICO_TEXT_DIGEST    = "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";

const REF_PRA_SOURCE_DIGEST  = "6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7";

const REF_FDA_SOURCE_DIGEST  = "83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a";

const REF_BIS_SOURCE_DIGEST  = "5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38";

// DRA-DOC-0015 (NCSC ML Principles, DRA-FRZ-000009) — BYTE_STABLE
const REF_NCSC_SOURCE_DIGEST = "85b9a340508058be3be0b7bc10fc54c5744f23035f570b719d4336eae2fba993";

// DRA-DOC-0016 (HSE Health and Safety Basics, DRA-FRZ-000010) — TEXT_STABLE
const REF_HSE_TEXT_DIGEST    = "fbeb65fd2c5de4860eaa6492b87c75ea92543a8444030ec889a0099b4f00f9c9";

// DRA-DOC-0017 (MHRA Best Practice Guidance on PILs, DRA-FRZ-000011) — BYTE_STABLE
const REF_MHRA_SOURCE_DIGEST = "8593e8dabf6a967449a35155fcb140f4b234c20e3739dcbcbfd933ff2dd46383";

// DRA-DOC-0018 (European Commission — Ethics Guidelines for Trustworthy AI, es,
// DRA-FRZ-000012) — BYTE_STABLE
const REF_EC_SOURCE_DIGEST   = "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2";

// DRA-DOC-0019 (INE Peer Review Report, es, DRA-FRZ-000013) — BYTE_STABLE
const REF_INE_SOURCE_DIGEST  = "9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981";

// DRA-DOC-0020 (CNIL AI-Ethics Report, fr, DRA-FRZ-000014) — BYTE_STABLE
// (verified DRA-ACQ-016 Phase 2, two independent live fetches matching Phase 1
// discovery digest). Source and text digests are the authoritative full
// values recorded at admission.
const REF_CNIL_SOURCE_DIGEST = "0819ead041bbdca3d5dc95c35bef3f01b3a188bc6c99d3c7b370f253aba40170";
const REF_CNIL_TEXT_DIGEST   = "09806b136d3ed816d568d1272459931d01928ffbe533821188c0dd487d0e78a4";

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
const EC_URL    = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";
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

const ICO_SECTION_URLS = ICO_SECTION_SLUGS.map(
  (slug) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

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
  const id = `dra-bmk020-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
let runResultB: BenchmarkRunResult;
let setupError: string | null = null;

let acasText  = "";
let cmaText   = "";
let nistText  = "";
let doc7Text  = "";
let icoText   = "";
let praText   = "";
let fdaText   = "";
let bisText   = "";
let ncscText  = "";
let hseText   = "";
let mhraText  = "";
let ecText    = "";
let ineText   = "";
let cnilText  = "";

let ecFreezeRepresentationMatch = false;
let ineLiveSourceDigest  = "";
let ineFreezeRepresentationMatch = false;
let cnilLiveSourceDigest = "";
let cnilLiveTextDigest   = "";
let cnilFreezeRepresentationMatch = false;

beforeAll(async () => {
  try {
    // ── Initial 6 docs from BENCHMARK_CORPUS ─────────────────────────────

    const loaded = loadBenchmarkCorpus();
    if (!loaded.ok) {
      setupError = `loadBenchmarkCorpus failed: ${loaded.message}`;
      return;
    }
    const initialDocs = [...loaded.documents];

    // ── DRA-DOC-0007: normalise Apache fixture HTML ───────────────────────

    const htmlBytes  = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
    const htmlDigest = computeSourceDigest(htmlBytes);
    const doc7Norm   = await normaliseContent(htmlBytes, "text/html", htmlDigest);
    if (!doc7Norm.ok) {
      setupError = `DRA-DOC-0007 normalisation failed: ${doc7Norm.message}`;
      return;
    }
    doc7Text = doc7Norm.document.text;

    const doc7: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0007" as any,
        title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
        sourceType: "HUMAN_AUTHORED",
        documentType: "ARTICLE",
        domain: "TECHNICAL",
        language: "en",
        generator: "The Apache Software Foundation",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html",
        sourceReference: "https://httpd.apache.org/docs/2.4/howto/auth.html",
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "a".repeat(64),
      },
      generatedText: doc7Text,
      sourceText:    doc7Text,
    };

    const fetcher = createHttpFetcher({
      timeoutMs:    120_000,
      maxRedirects: 5,
      maxBytes:     15_000_000,
      userAgent:    "DRA-BMK-020/1.0",
    });

    // ── Parallel fetch helper ─────────────────────────────────────────────
    //
    // Engineering note (performance, not a rule change): DRA-BMK-019 fetched
    // all documents sequentially. With 20 documents (11 independent PDFs +
    // 14 ICO sections + 26 HSE pages = 51 HTTP requests), sequential fetching
    // exceeds practical tool-execution time budgets. Independent fetches are
    // parallelised here via Promise.all — this changes wall-clock time only;
    // it does not change what is fetched, how each response is normalised,
    // or any evaluator behaviour. Each document's content is still the
    // product of one live HTTP fetch to its own canonical URL.

    type PdfFetchResult =
      | { ok: true; text: string; sourceDigest: string }
      | { ok: false; error: string };

    async function fetchAndExtractPdf(
      acquisitionId: string,
      url: string,
      expectedPublisher: string,
      expectedTitle: string,
      label: string,
    ): Promise<PdfFetchResult> {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-BMK-020-operator", requestedAt: FIXED_TS_A, expectedPublisher, expectedTitle };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) return { ok: false, error: `${label} fetch failed: ${fetchRes.code}` };
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) return { ok: false, error: `${label} normalisation failed: ${norm.message}` };
      return { ok: true, text: norm.document.text, sourceDigest: srcDigest };
    }

    console.log("\n── Fetching 11 independent PDFs in parallel (Acas, CMA, NIST, PRA, FDA, BIS, NCSC, MHRA, EC, INE, CNIL)… ─");

    const pdfFetchPromise = Promise.all([
      fetchAndExtractPdf("DRA-ACQ-000002", ACAS_URL, "Acas", "Acas guide", "Acas"),
      fetchAndExtractPdf("DRA-ACQ-000008", CMA_URL, "CMA", "AI Foundation Models Short Version", "CMA"),
      fetchAndExtractPdf("DRA-ACQ-000012", NIST_URL, "NIST", "AI RMF 1.0", "NIST"),
      fetchAndExtractPdf("DRA-ACQ-000014", PRA_URL, "PRA", "PRA SS1/23", "PRA"),
      fetchAndExtractPdf("DRA-ACQ-000015", FDA_URL, "FDA", "FDA AI/ML SaMD Action Plan", "FDA"),
      fetchAndExtractPdf("DRA-ACQ-000016", BIS_URL, "BCBS", "Principles for Operational Resilience", "BIS"),
      fetchAndExtractPdf("DRA-ACQ-000018", NCSC_URL, "NCSC", "Principles for the security of machine learning", "NCSC"),
      fetchAndExtractPdf("DRA-ACQ-000020", MHRA_URL, "MHRA", "Best practice guidance on patient information leaflets (PILs)", "MHRA"),
      fetchAndExtractPdf("DRA-ACQ-000021", EC_URL, "European Commission", "Ethics Guidelines for Trustworthy AI", "EC"),
      fetchAndExtractPdf("DRA-ACQ-000022", INE_URL, "INE", "Informe de la Revisión por Pares", "INE"),
      fetchAndExtractPdf(
        "DRA-ACQ-000023",
        CNIL_URL,
        "Commission Nationale de l'Informatique et des Libertés (CNIL)",
        "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle",
        "CNIL",
      ),
    ]);

    console.log("── Fetching DRA-DOC-0011 (ICO guidance — 14 HTML sections, parallel)… ─");

    const icoFetchPromise = Promise.all(
      ICO_SECTION_URLS.map(async (url) => {
        const sectionReq = {
          acquisitionId: "DRA-ACQ-000013",
          sourceUrl: url,
          requestedBy: "DRA-BMK-020-operator",
          requestedAt: FIXED_TS_A,
          expectedPublisher: "ICO",
          expectedTitle: "Guidance on AI and data protection",
        };
        const sectionFetch = await fetcher(sectionReq as any, {});
        if (!sectionFetch.ok) return { ok: false as const, error: `ICO section fetch failed: ${sectionFetch.code}` };
        const sectionDigest = computeSourceDigest(sectionFetch.source.rawBytes);
        const sectionNorm   = await normaliseContent(sectionFetch.source.rawBytes, "text/html", sectionDigest);
        if (!sectionNorm.ok) return { ok: false as const, error: `ICO section normalisation failed: ${sectionNorm.message}` };
        return { ok: true as const, text: sectionNorm.document.text };
      }),
    );

    console.log(`── Fetching DRA-DOC-0016 (HSE Health and Safety Basics — ${HSE_PAGE_URLS.length} HTML pages, parallel)… ─`);

    const hseFetchPromise = Promise.all(
      HSE_PAGE_URLS.map(async (url) => {
        const pageReq = {
          acquisitionId: "DRA-ACQ-000019",
          sourceUrl: url,
          requestedBy: "DRA-BMK-020-operator",
          requestedAt: FIXED_TS_A,
          expectedPublisher: "HSE",
          expectedTitle: "Health and safety basics for your business",
        };
        const pageFetch = await fetcher(pageReq as any, {});
        if (!pageFetch.ok) return { ok: false as const, error: `HSE page fetch failed: ${pageFetch.code}` };
        const pageDigest = computeSourceDigest(pageFetch.source.rawBytes);
        const pageNorm    = await normaliseContent(pageFetch.source.rawBytes, "text/html", pageDigest);
        if (!pageNorm.ok) return { ok: false as const, error: `HSE page normalisation failed: ${pageNorm.message}` };
        return { ok: true as const, text: pageNorm.document.text };
      }),
    );

    const [pdfResults, icoResults, hseResults] = await Promise.all([
      pdfFetchPromise,
      icoFetchPromise,
      hseFetchPromise,
    ]);

    const [
      acasResult, cmaResult, nistResult, praResult, fdaResult, bisResult,
      ncscResult, mhraResult, ecResult, ineResult, cnilResult,
    ] = pdfResults;

    for (const r of pdfResults) {
      if (!r.ok) { setupError = r.error; return; }
    }
    acasText = acasResult.ok ? acasResult.text : "";
    cmaText  = cmaResult.ok  ? cmaResult.text  : "";
    nistText = nistResult.ok ? nistResult.text : "";
    praText  = praResult.ok  ? praResult.text  : "";
    fdaText  = fdaResult.ok  ? fdaResult.text  : "";
    bisText  = bisResult.ok  ? bisResult.text  : "";
    ncscText = ncscResult.ok ? ncscResult.text : "";
    mhraText = mhraResult.ok ? mhraResult.text : "";
    ecText   = ecResult.ok   ? ecResult.text   : "";
    ineText  = ineResult.ok  ? ineResult.text  : "";
    cnilText = cnilResult.ok ? cnilResult.text : "";

    const ecLiveSourceDigest  = ecResult.ok  ? ecResult.sourceDigest  : "";
    ineLiveSourceDigest       = ineResult.ok ? ineResult.sourceDigest : "";
    cnilLiveSourceDigest      = cnilResult.ok ? cnilResult.sourceDigest : "";

    ecFreezeRepresentationMatch   = ecLiveSourceDigest === REF_EC_SOURCE_DIGEST;
    ineFreezeRepresentationMatch  = ineLiveSourceDigest === REF_INE_SOURCE_DIGEST;
    cnilFreezeRepresentationMatch = cnilLiveSourceDigest === REF_CNIL_SOURCE_DIGEST;

    console.log(`\n── DRA-DOC-0018 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${ecFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`── DRA-DOC-0019 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${ineFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`── DRA-DOC-0020 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Frozen source digest : ${REF_CNIL_SOURCE_DIGEST}`);
    console.log(`   Live source digest   : ${cnilLiveSourceDigest}`);
    console.log(`   Match : ${cnilFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

    if (cnilResult.ok) {
      const cnilBytesForTextDigest = new TextEncoder().encode(cnilText);
      cnilLiveTextDigest = computeSourceDigest(cnilBytesForTextDigest);
    }

    for (const r of icoResults) {
      if (!r.ok) { setupError = r.error; return; }
    }
    icoText = icoResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);
    const icoBytes  = new TextEncoder().encode(icoText);
    const icoSrcDig = computeSourceDigest(icoBytes);
    const icoNorm   = await normaliseContent(icoBytes, "text/plain", icoSrcDig);
    if (!icoNorm.ok) { setupError = `DRA-DOC-0011 combined normalisation failed: ${icoNorm.message}`; return; }

    const icoLiveTextDigest = icoNorm.document.textDigest;
    console.log(`\n── DRA-DOC-0011 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${icoLiveTextDigest === REF_ICO_TEXT_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

    for (const r of hseResults) {
      if (!r.ok) { setupError = r.error; return; }
    }
    console.time("hse-normalise");
    hseText = hseResults.map((r) => (r.ok ? r.text : "")).join(SECTION_SEPARATOR);
    const hseBytes   = new TextEncoder().encode(hseText);
    const hseSrcDig  = computeSourceDigest(hseBytes);
    const hseNorm    = await normaliseContent(hseBytes, "text/plain", hseSrcDig);
    console.timeEnd("hse-normalise");
    if (!hseNorm.ok) { setupError = `DRA-DOC-0016 combined normalisation failed: ${hseNorm.message}`; return; }

    const hseLiveTextDigest = hseNorm.document.textDigest;
    console.log(`\n── DRA-DOC-0016 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${hseLiveTextDigest === REF_HSE_TEXT_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED (TEXT_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

    const doc8: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0008" as any,
        title: "Discipline and grievances at work: the Acas guide",
        sourceType: "HUMAN_AUTHORED",
        documentType: "PROCEDURE",
        domain: "BUSINESS",
        language: "en-GB",
        generator: "Advisory, Conciliation and Arbitration Service (Acas)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${ACAS_URL}`,
        sourceReference: ACAS_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "LOW",
        integrityDigest: "b".repeat(64),
      },
      generatedText: acasText,
      sourceText:    acasText,
    };

    // ── DRA-DOC-0009: CMA Short Version PDF (live, fetched in parallel above) ─

    const doc9: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0009" as any,
        title: "AI Foundation Models: Short Version",
        sourceType: "HUMAN_AUTHORED",
        documentType: "SUMMARY",
        domain: "GENERAL",
        language: "en-GB",
        generator: "Competition and Markets Authority",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${CMA_URL}`,
        sourceReference: CMA_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "c".repeat(64),
      },
      generatedText: cmaText,
      sourceText:    cmaText,
    };

    // ── DRA-DOC-0010: NIST AI RMF PDF (live, fetched in parallel above) ────

    const doc10: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0010" as any,
        title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
        sourceType: "HUMAN_AUTHORED",
        documentType: "POLICY",
        domain: "TECHNICAL",
        language: "en",
        generator: "National Institute of Standards and Technology (NIST)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${NIST_URL}`,
        sourceReference: NIST_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "d".repeat(64),
      },
      generatedText: nistText,
      sourceText:    nistText,
    };

    // ── DRA-DOC-0011: ICO guidance (14 HTML sections, live, fetched in parallel above) ─

    const doc11: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0011" as any,
        title: "Guidance on AI and data protection",
        sourceType: "HUMAN_AUTHORED",
        documentType: "OTHER",
        domain: "LEGAL",
        language: "en",
        generator: "Information Commissioner's Office (ICO)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${ICO_LANDING_URL} (14 sections, multi-page HTML)`,
        sourceReference: ICO_LANDING_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "e".repeat(64),
      },
      generatedText: icoText,
      sourceText:    icoText,
    };

    // ── DRA-DOC-0012: PRA SS1/23 PDF (live, fetched in parallel above) ─────

    const doc12: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0012" as any,
        title: "Model risk management principles for banks",
        sourceType: "HUMAN_AUTHORED",
        documentType: "OTHER",
        domain: "FINANCE",
        language: "en",
        generator: "Prudential Regulation Authority (PRA), Bank of England",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${PRA_URL}`,
        sourceReference: PRA_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "f".repeat(64),
      },
      generatedText: praText,
      sourceText:    praText,
    };

    // ── DRA-DOC-0013: FDA AI/ML SaMD Action Plan PDF (live, fetched in parallel above) ─

    const doc13: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0013" as any,
        title: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
        sourceType: "HUMAN_AUTHORED",
        documentType: "POLICY",
        domain: "HEALTHCARE",
        language: "en",
        generator: "U.S. Food and Drug Administration (FDA)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${FDA_URL}`,
        sourceReference: FDA_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "0".repeat(64),
      },
      generatedText: fdaText,
      sourceText:    fdaText,
    };

    // ── DRA-DOC-0014: BCBS Principles for Operational Resilience PDF (live, fetched in parallel above) ─

    const doc14: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0014" as any,
        title: "Principles for Operational Resilience",
        sourceType: "HUMAN_AUTHORED",
        documentType: "POLICY",
        domain: "FINANCE",
        language: "en",
        generator: "Basel Committee on Banking Supervision (BCBS)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${BIS_URL}`,
        sourceReference: BIS_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "1".repeat(64),
      },
      generatedText: bisText,
      sourceText:    bisText,
    };

    // ── DRA-DOC-0015: NCSC ML Principles PDF (live, fetched in parallel above) ─

    const doc15: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0015" as any,
        title: "Principles for the security of machine learning",
        sourceType: "HUMAN_AUTHORED",
        documentType: "OTHER",
        domain: "TECHNICAL",
        language: "en",
        generator: "National Cyber Security Centre (NCSC)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${NCSC_URL}`,
        sourceReference: NCSC_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "2".repeat(64),
      },
      generatedText: ncscText,
      sourceText:    ncscText,
    };

    // ── DRA-DOC-0016: HSE Health and Safety Basics (26 HTML pages, live, fetched in parallel above) ─

    const doc16: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0016" as any,
        title: "Health and safety basics for your business",
        sourceType: "HUMAN_AUTHORED",
        documentType: "PROCEDURE",
        domain: "BUSINESS",
        language: "en-GB",
        generator: "Health and Safety Executive (HSE)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${HSE_LANDING_URL} (26 pages, multi-page HTML)`,
        sourceReference: HSE_LANDING_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "LOW",
        integrityDigest: "3".repeat(64),
      },
      generatedText: hseText,
      sourceText:    hseText,
    };

    // ── DRA-DOC-0017: MHRA PIL guidance PDF (live, fetched in parallel above) ─

    const doc17: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0017" as any,
        title: "Best practice guidance on patient information leaflets (PILs)",
        sourceType: "HUMAN_AUTHORED",
        documentType: "PROCEDURE",
        domain: "HEALTHCARE",
        language: "en-GB",
        generator: "Medicines and Healthcare products Regulatory Agency (MHRA)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${MHRA_URL}`,
        sourceReference: MHRA_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "4".repeat(64),
      },
      generatedText: mhraText,
      sourceText:    mhraText,
    };

    // ── DRA-DOC-0018: EC Ethics Guidelines for Trustworthy AI (es) PDF (live, fetched in parallel above) ─

    const doc18: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0018" as any,
        title: "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)",
        sourceType: "HUMAN_AUTHORED",
        documentType: "REPORT",
        domain: "TECHNICAL",
        language: "es",
        generator: "European Commission — High-Level Expert Group on Artificial Intelligence",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from ${EC_URL}`,
        sourceReference: EC_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "5".repeat(64),
      },
      generatedText: ecText,
      sourceText:    ecText,
    };

    // ── DRA-DOC-0019: INE Peer Review Report (es) PDF (live, fetched in parallel above) ─
    //
    // Frozen reference: 9d55917a… (BYTE_STABLE, DRA-FRZ-000013)
    // If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).

    const doc19: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0019" as any,
        title: "Informe de la Revisión por Pares (Peer Review Report — Spain's compliance with the European Statistics Code of Practice)",
        sourceType: "HUMAN_AUTHORED",
        documentType: "REPORT",
        domain: "GENERAL",
        language: "es",
        generator: "Instituto Nacional de Estadística (INE)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${INE_URL}`,
        sourceReference: INE_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "MEDIUM",
        integrityDigest: "6".repeat(64),
      },
      generatedText: ineText,
      sourceText:    ineText,
    };

    // ── DRA-DOC-0020: CNIL AI-Ethics Report (fr) PDF (live, fetched in parallel above) ─
    //
    // Frozen reference: 0819ead0… / 09806b13… (BYTE_STABLE, DRA-FRZ-000014)
    // If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).

    const doc20: BenchmarkExecutionDocument = {
      corpusDocument: {
        corpusId: "DRA-DOC-0020" as any,
        title:
          "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de " +
          "l'intelligence artificielle",
        sourceType: "HUMAN_AUTHORED",
        documentType: "REPORT",
        domain: "LEGAL",
        language: "fr",
        generator: "Commission Nationale de l'Informatique et des Libertés (CNIL)",
        generatorVersion: "DRA-CORPUS-1.0.0",
        creationMethod: `Public document acquisition via DRA-ENG-009 from ${CNIL_URL}`,
        sourceReference: CNIL_URL,
        benchmarkStatus: "FROZEN",
        difficulty: "HIGH",
        integrityDigest: "7".repeat(64),
      },
      generatedText: cnilText,
      sourceText:    cnilText,
    };

    // ── Assemble all 20 BenchmarkExecutionDocuments ───────────────────────

    allDocs = [
      ...initialDocs,
      doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14,
      doc15, doc16, doc17, doc18, doc19, doc20,
    ];

    allDocs.sort((a, b) => {
      const seqA = parseInt(a.corpusDocument.corpusId.slice(-4), 10);
      const seqB = parseInt(b.corpusDocument.corpusId.slice(-4), 10);
      return seqA - seqB;
    });

    // ── Load Run A summary (must have been produced already) ──────────────

    const raw = await readFile(RUN_A_SUMMARY_PATH, "utf-8").catch(() => null);
    if (raw === null) {
      setupError =
        `Run A summary not found at ${RUN_A_SUMMARY_PATH}. ` +
        `Run dra-bmk-020-evaluator-run.test.ts before this file.`;
      return;
    }
    runASummary = JSON.parse(raw) as RunASummary;

    // ── Run B ─────────────────────────────────────────────────────────────

    console.log(`\n── Executing Run B (fixedTimestamp: ${FIXED_TS_B}) ──────`);
    console.time("run-B");
    const runnerB = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_B, fixedRunId: FIXED_RUN_ID_B });
    runResultB    = runnerB.execute(allDocs);
    console.timeEnd("run-B");
    console.log(`   Run B: ${runResultB.successCount} success, ${runResultB.failureCount} failure / ${runResultB.documentCount} docs`);

  } catch (err) {
    setupError = String(err);
  }
}, 1_200_000); // 20 minutes

// ---------------------------------------------------------------------------
// Part 4 — Frozen Evaluator Run
// ---------------------------------------------------------------------------

describe("DRA-BMK-020 — Part 4: Frozen Evaluator Run", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("all 20 BenchmarkExecutionDocuments were assembled", () => {
    expect(allDocs).toHaveLength(20);
    const ids = allDocs.map((d) => d.corpusDocument.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001","DRA-DOC-0002","DRA-DOC-0003","DRA-DOC-0004",
      "DRA-DOC-0005","DRA-DOC-0006","DRA-DOC-0007","DRA-DOC-0008",
      "DRA-DOC-0009","DRA-DOC-0010","DRA-DOC-0011","DRA-DOC-0012",
      "DRA-DOC-0013","DRA-DOC-0014","DRA-DOC-0015","DRA-DOC-0016",
      "DRA-DOC-0017","DRA-DOC-0018","DRA-DOC-0019","DRA-DOC-0020",
    ]);
  });

  it("reports live document integrity status against admitted freeze records", () => {
    expect(REF_ACAS_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_CMA_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_NIST_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_PRA_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_FDA_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_BIS_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_NCSC_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_MHRA_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_EC_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_INE_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_CNIL_SOURCE_DIGEST).toHaveLength(64);
    expect(REF_CNIL_TEXT_DIGEST).toHaveLength(64);

    expect(acasText.length).toBeGreaterThan(0);
    expect(cmaText.length).toBeGreaterThan(0);
    expect(nistText.length).toBeGreaterThan(0);
    expect(icoText.length).toBeGreaterThan(0);
    expect(praText.length).toBeGreaterThan(0);
    expect(fdaText.length).toBeGreaterThan(0);
    expect(bisText.length).toBeGreaterThan(0);
    expect(ncscText.length).toBeGreaterThan(0);
    expect(hseText.length).toBeGreaterThan(0);
    expect(ecText.length).toBeGreaterThan(0);
    expect(mhraText.length).toBeGreaterThan(0);
    expect(ineText.length).toBeGreaterThan(0);
    expect(cnilText.length).toBeGreaterThan(0);

    console.log("\n── Live Document Integrity Report ───────────────────────────");
    console.log(`  DRA-DOC-0018 (EC, es)  : ${ecFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0019 (INE, es) : ${ineFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0020 (CNIL, fr): ${cnilFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`    live source digest: ${cnilLiveSourceDigest}`);
    console.log(`    live text digest  : ${cnilLiveTextDigest}`);
    console.log(`    live text length  : ${cnilText.length} chars`);
  });

});

// ---------------------------------------------------------------------------
// Part 4 (cont.) — Run B results
// ---------------------------------------------------------------------------

describe("DRA-BMK-020 — Part 4 (Run B): Frozen Evaluator Run", () => {
  it("Run B produced 20 results", () => {
    expect(runResultB.documentCount).toBe(20);
    expect(runResultB.records).toHaveLength(20);
  });

  it("no unhandled evaluation failures in Run B", () => {
    console.log("\n── Evaluation Results (Run B) ───────────────────────────────");
    for (const record of runResultB.records) {
      const result = record.evaluationResult;
      const status = result.ok ? `decision=${result.decision}` : `FAILED: ${(result as any).code}`;
      console.log(`  ${record.corpusId}: ${status}`);
    }
    expect(runResultB.documentCount).toBe(20);
  });

  it("40 proof receipts expected (20 documents × 2 runs)", () => {
    const successB = runResultB.records.filter((r) => r.evaluationResult.ok).length;
    console.log(`\n── Proof Receipt Count ───────────────────────────────────────`);
    console.log(`  Run A successful evaluations: ${runASummary.successCount}/20`);
    console.log(`  Run B successful evaluations: ${successB}/20`);
    console.log(`  Total proof receipts expected: 40`);
    console.log(`  Total proof receipts produced: ${runASummary.successCount + successB}`);
    expect(runASummary.successCount + successB).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// Part 5/6 (cross-run) — DRA-DOC-0020 reproducibility and proof-receipt
// integrity across both runs
// ---------------------------------------------------------------------------

describe("DRA-BMK-020 — Part 5/6: Cross-Run Integrity Checks", () => {
  it("DRA-DOC-0020 Run A and Run B decisions are identical — REPRODUCIBILITY: IDENTICAL", () => {
    const sumA = runASummary.records.find((r) => r.corpusId === "DRA-DOC-0020");
    const recB = runResultB.records.find((r) => r.corpusId === "DRA-DOC-0020");
    expect(sumA).toBeDefined();
    expect(recB).toBeDefined();
    if (sumA?.ok && recB?.evaluationResult.ok) {
      console.log(`\n── DRA-DOC-0020 Run A vs Run B ──────────────────────────────`);
      console.log(`  decision A    : ${sumA.decision}`);
      console.log(`  decision B    : ${recB.evaluationResult.decision}`);
      expect(sumA.decision).toBe(recB.evaluationResult.decision);
      expect(sumA.substantiveDigest).toBe(recB.evaluationResult.proofReceipt.substantiveDigest);
    }
  });

  it("all Run B proof receipts pass structural integrity check (Run A's were verified when it ran)", () => {
    let verifiedCount = 0;
    let totalCount    = 0;
    for (const record of runResultB.records) {
      if (record.evaluationResult.ok) {
        totalCount++;
        const valid = verifyReceiptIntegrity(record.evaluationResult.proofReceipt);
        if (valid) verifiedCount++;
      }
    }
    console.log(`  Run B: ${verifiedCount}/${totalCount} proof receipts passed integrity check`);
    expect(verifiedCount).toBe(totalCount);

    const aVerified = runASummary.records.filter((r) => r.receiptIntegrityValid === true).length;
    const aTotal     = runASummary.records.filter((r) => r.ok).length;
    console.log(`  Run A (loaded): ${aVerified}/${aTotal} proof receipts passed integrity check`);
    expect(aVerified).toBe(aTotal);
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Run A vs Run B Reproducibility (full 20-document live corpus)
// ---------------------------------------------------------------------------

describe("DRA-BMK-020 — Part 7: Run A vs Run B Reproducibility", () => {
  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-020) ───────────────────");
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

  it("operational timestamps differ between runs (fixedTimestamp control is active)", () => {
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      expect(sumA?.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      expect(sumA?.executedAt).not.toBe(rB.executedAt);
    }
  });

  it("same issue count on both runs for every document", () => {
    for (const rB of runResultB.records) {
      const sumA = runASummary.records.find((r) => r.corpusId === rB.corpusId);
      if (sumA?.ok && rB.evaluationResult.ok) {
        expect(sumA.issueCount).toBe(rB.evaluationResult.issues.length);
      }
    }
  });
});

// Parts 5 (DRA-DOC-0020 specific, Run-A-only bits), 6 (decision distribution
// and issue-class coverage), 8 (source stability summary), 9 (three-language
// comparison), 10 (admission-time comparison), and 11 (evidence gap) all use
// only Run A data and are asserted in dra-bmk-020-evaluator-run.test.ts —
// not duplicated here.
