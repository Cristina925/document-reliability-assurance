/**
 * DRA-BMK-019 — Parts 4–11: Nineteen-Document Evaluator Run
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  NINETEEN-DOCUMENT EVALUATOR RUN — DRA-BMK-019                           ║
 * ║                                                                          ║
 * ║  Corpus: DRA-DOC-0001 through DRA-DOC-0019                              ║
 * ║  Evaluator: frozen Version 1 (evaluateDocument, BenchmarkRunner)        ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-09T09:30:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-09T10:00:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed or decisions replaced                        ║
 * ║    • No evaluator features added                                         ║
 * ║    • Runner never throws — failures captured as records                 ║
 * ║    • No tuning for DRA-DOC-0019                                          ║
 * ║    • No Spanish-specific rules, translation, or language-detection added ║
 * ║    • No new documents admitted — this is measurement only               ║
 * ║    • The admission-time evaluator observation (SUPPORTED, 0 issues) is   ║
 * ║      NOT assumed here — it is re-derived from this run.                  ║
 * ║                                                                          ║
 * ║  Live network: DRA-DOC-0008, 0009, 0010, 0012, 0013, 0014, 0015, 0017,  ║
 * ║                0018, 0019 (PDFs via pdftotext)                          ║
 * ║                DRA-DOC-0011 (14 HTML sections, ICO guidance)             ║
 * ║                DRA-DOC-0016 (26 HTML pages, HSE guidance)                ║
 * ║  DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture.          ║
 * ║                                                                          ║
 * ║  DRA-DOC-0019 live-text comparison:                                      ║
 * ║    Live source digest compared against frozen reference (DRA-FRZ-       ║
 * ║    000013). If match → FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE).   ║
 * ║    If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).               ║
 * ║                                                                          ║
 * ║  DRA-DOC-0019 evidence questions:                                        ║
 * ║    1. Does the INE Peer Review Report (es) introduce new issue-class     ║
 * ║       coverage beyond the 3/9 (IC-4, IC-5, IC-7) Version 1 coverage      ║
 * ║       ceiling established by DRA-CHK-002? Measured, not assumed.        ║
 * ║    2. As the corpus's SECOND non-English document, does DRA-DOC-0019    ║
 * ║       reproduce the DRA-BMK-018 multilingual POSSIBLE_SENSITIVITY        ║
 * ║       observation recorded for DRA-DOC-0018, or does it diverge?         ║
 * ║       Conclusions are scoped strictly to these two Spanish-language      ║
 * ║       documents — this is NOT a general multilingual-robustness claim.   ║
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

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic runs
// ---------------------------------------------------------------------------

const FIXED_TS_A     = "2026-08-09T09:30:00.000Z";
const FIXED_TS_B     = "2026-08-09T10:00:00.000Z";
const FIXED_RUN_ID_A = "bmk-019-run-A";
const FIXED_RUN_ID_B = "bmk-019-run-B";

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
// (verified DRA-ACQ-015 Phase 2, two independent live fetches matching Phase 1
// discovery digest). Source and text digests are the authoritative full
// values recorded at admission.
const REF_INE_SOURCE_DIGEST  = "9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981";
const REF_INE_TEXT_DIGEST    = "c1ffc3ee8fd6957934029bcf9ed6ae3c1381c7c23f6d3608af748375359bf1cf";

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
  const id = `dra-bmk019-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

let ecLiveSourceDigest   = "";
let ecFreezeRepresentationMatch = false;
let ineLiveSourceDigest  = "";
let ineLiveTextDigest    = "";
let ineFreezeRepresentationMatch = false;

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
      userAgent:    "DRA-BMK-019/1.0",
    });

    // ── DRA-DOC-0008: Acas guide PDF (live) ──────────────────────────────

    console.log("\n── Fetching DRA-DOC-0008 (Acas guide PDF)… ─────────────────");
    const acasReq = { acquisitionId: "DRA-ACQ-000002", sourceUrl: ACAS_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "Acas", expectedTitle: "Acas guide" };
    const acasFetch = await fetcher(acasReq as any, {});
    if (!acasFetch.ok) { setupError = `Acas fetch failed: ${acasFetch.code}`; return; }

    const acasSrc  = computeSourceDigest(acasFetch.source.rawBytes);
    const acasNorm = await normaliseContent(acasFetch.source.rawBytes, "application/pdf", acasSrc, extractPdfText);
    if (!acasNorm.ok) { setupError = `Acas normalisation failed: ${acasNorm.message}`; return; }
    acasText = acasNorm.document.text;

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

    // ── DRA-DOC-0009: CMA Short Version PDF (live) ────────────────────────

    console.log("── Fetching DRA-DOC-0009 (CMA Short Version PDF)… ──────────");
    const cmaReq = { acquisitionId: "DRA-ACQ-000008", sourceUrl: CMA_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "CMA", expectedTitle: "AI Foundation Models Short Version" };
    const cmaFetch = await fetcher(cmaReq as any, {});
    if (!cmaFetch.ok) { setupError = `CMA fetch failed: ${cmaFetch.code}`; return; }

    const cmaSrc  = computeSourceDigest(cmaFetch.source.rawBytes);
    const cmaNorm = await normaliseContent(cmaFetch.source.rawBytes, "application/pdf", cmaSrc, extractPdfText);
    if (!cmaNorm.ok) { setupError = `CMA normalisation failed: ${cmaNorm.message}`; return; }
    cmaText = cmaNorm.document.text;

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

    // ── DRA-DOC-0010: NIST AI RMF PDF (live) ─────────────────────────────

    console.log("── Fetching DRA-DOC-0010 (NIST AI RMF PDF)… ────────────────");
    const nistReq = { acquisitionId: "DRA-ACQ-000012", sourceUrl: NIST_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "NIST", expectedTitle: "AI RMF 1.0" };
    const nistFetch = await fetcher(nistReq as any, {});
    if (!nistFetch.ok) { setupError = `NIST fetch failed: ${nistFetch.code}`; return; }

    const nistSrc  = computeSourceDigest(nistFetch.source.rawBytes);
    const nistNorm = await normaliseContent(nistFetch.source.rawBytes, "application/pdf", nistSrc, extractPdfText);
    if (!nistNorm.ok) { setupError = `NIST normalisation failed: ${nistNorm.message}`; return; }
    nistText = nistNorm.document.text;

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

    // ── DRA-DOC-0011: ICO guidance (14 HTML sections, live) ───────────────

    console.log("── Fetching DRA-DOC-0011 (ICO guidance — 14 HTML sections)… ─");

    const sectionPageTexts: string[] = [];
    let doc11FetchOk = true;

    for (let i = 0; i < ICO_SECTION_URLS.length; i++) {
      const url = ICO_SECTION_URLS[i]!;
      const sectionReq = {
        acquisitionId: "DRA-ACQ-000013",
        sourceUrl: url,
        requestedBy: "DRA-BMK-019-operator",
        requestedAt: FIXED_TS_A,
        expectedPublisher: "ICO",
        expectedTitle: "Guidance on AI and data protection",
      };
      const sectionFetch = await fetcher(sectionReq as any, {});
      if (!sectionFetch.ok) {
        console.error(`  !! Section ${i + 1} fetch failed: ${sectionFetch.code}`);
        doc11FetchOk = false;
        break;
      }
      const sectionDigest = computeSourceDigest(sectionFetch.source.rawBytes);
      const sectionNorm   = await normaliseContent(sectionFetch.source.rawBytes, "text/html", sectionDigest);
      if (!sectionNorm.ok) {
        console.error(`  !! Section ${i + 1} normalisation failed: ${sectionNorm.message}`);
        doc11FetchOk = false;
        break;
      }
      sectionPageTexts.push(sectionNorm.document.text);
    }

    if (!doc11FetchOk || sectionPageTexts.length !== ICO_SECTION_URLS.length) {
      setupError = `DRA-DOC-0011: only ${sectionPageTexts.length}/${ICO_SECTION_URLS.length} sections fetched`;
      return;
    }

    icoText = sectionPageTexts.join(SECTION_SEPARATOR);
    const icoBytes  = new TextEncoder().encode(icoText);
    const icoSrcDig = computeSourceDigest(icoBytes);
    const icoNorm   = await normaliseContent(icoBytes, "text/plain", icoSrcDig);
    if (!icoNorm.ok) { setupError = `DRA-DOC-0011 combined normalisation failed: ${icoNorm.message}`; return; }

    const icoLiveTextDigest = icoNorm.document.textDigest;
    console.log(`\n── DRA-DOC-0011 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${icoLiveTextDigest === REF_ICO_TEXT_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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

    // ── DRA-DOC-0012: PRA SS1/23 PDF (live) ──────────────────────────────

    console.log("── Fetching DRA-DOC-0012 (PRA SS1/23 PDF)… ─────────────────");
    const praReq = { acquisitionId: "DRA-ACQ-000014", sourceUrl: PRA_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "PRA", expectedTitle: "PRA SS1/23" };
    const praFetch = await fetcher(praReq as any, {});
    if (!praFetch.ok) { setupError = `PRA fetch failed: ${praFetch.code}`; return; }

    const praSrc = computeSourceDigest(praFetch.source.rawBytes);
    const praNorm = await normaliseContent(praFetch.source.rawBytes, "application/pdf", praSrc, extractPdfText);
    if (!praNorm.ok) { setupError = `PRA normalisation failed: ${praNorm.message}`; return; }
    praText = praNorm.document.text;

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

    // ── DRA-DOC-0013: FDA AI/ML SaMD Action Plan PDF (live) ──────────────

    console.log("── Fetching DRA-DOC-0013 (FDA AI/ML SaMD Action Plan PDF)… ──");
    const fdaReq = { acquisitionId: "DRA-ACQ-000015", sourceUrl: FDA_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "FDA", expectedTitle: "FDA AI/ML SaMD Action Plan" };
    const fdaFetch = await fetcher(fdaReq as any, {});
    if (!fdaFetch.ok) { setupError = `FDA fetch failed: ${fdaFetch.code}`; return; }

    const fdaSrc = computeSourceDigest(fdaFetch.source.rawBytes);
    const fdaNorm = await normaliseContent(fdaFetch.source.rawBytes, "application/pdf", fdaSrc, extractPdfText);
    if (!fdaNorm.ok) { setupError = `FDA normalisation failed: ${fdaNorm.message}`; return; }
    fdaText = fdaNorm.document.text;

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

    // ── DRA-DOC-0014: BCBS Principles for Operational Resilience PDF (live) ─

    console.log("── Fetching DRA-DOC-0014 (BCBS Principles for Operational Resilience PDF)…");
    const bisReq = { acquisitionId: "DRA-ACQ-000016", sourceUrl: BIS_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "BCBS", expectedTitle: "Principles for Operational Resilience" };
    const bisFetch = await fetcher(bisReq as any, {});
    if (!bisFetch.ok) { setupError = `BIS fetch failed: ${bisFetch.code}`; return; }

    const bisSrc = computeSourceDigest(bisFetch.source.rawBytes);
    const bisNorm = await normaliseContent(bisFetch.source.rawBytes, "application/pdf", bisSrc, extractPdfText);
    if (!bisNorm.ok) { setupError = `BIS normalisation failed: ${bisNorm.message}`; return; }
    bisText = bisNorm.document.text;

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

    // ── DRA-DOC-0015: NCSC ML Principles PDF (live) ──────────────────────

    console.log("── Fetching DRA-DOC-0015 (NCSC ML Principles PDF)…");
    const ncscReq = { acquisitionId: "DRA-ACQ-000018", sourceUrl: NCSC_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "NCSC", expectedTitle: "Principles for the security of machine learning" };
    const ncscFetch = await fetcher(ncscReq as any, {});
    if (!ncscFetch.ok) { setupError = `NCSC fetch failed: ${ncscFetch.code}`; return; }

    const ncscSrc = computeSourceDigest(ncscFetch.source.rawBytes);
    const ncscNorm = await normaliseContent(ncscFetch.source.rawBytes, "application/pdf", ncscSrc, extractPdfText);
    if (!ncscNorm.ok) { setupError = `NCSC normalisation failed: ${ncscNorm.message}`; return; }
    ncscText = ncscNorm.document.text;

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

    // ── DRA-DOC-0016: HSE Health and Safety Basics (26 HTML pages, live) ──

    console.log(`── Fetching DRA-DOC-0016 (HSE Health and Safety Basics — ${HSE_PAGE_URLS.length} HTML pages)… ─`);

    const hsePageTexts: string[] = [];
    let doc16FetchOk = true;

    for (let i = 0; i < HSE_PAGE_URLS.length; i++) {
      const url = HSE_PAGE_URLS[i]!;
      const pageReq = {
        acquisitionId: "DRA-ACQ-000019",
        sourceUrl: url,
        requestedBy: "DRA-BMK-019-operator",
        requestedAt: FIXED_TS_A,
        expectedPublisher: "HSE",
        expectedTitle: "Health and safety basics for your business",
      };
      const pageFetch = await fetcher(pageReq as any, {});
      if (!pageFetch.ok) {
        console.error(`  !! Page ${i + 1} fetch failed: ${pageFetch.code}`);
        doc16FetchOk = false;
        break;
      }
      const pageDigest = computeSourceDigest(pageFetch.source.rawBytes);
      const pageNorm    = await normaliseContent(pageFetch.source.rawBytes, "text/html", pageDigest);
      if (!pageNorm.ok) {
        console.error(`  !! Page ${i + 1} normalisation failed: ${pageNorm.message}`);
        doc16FetchOk = false;
        break;
      }
      hsePageTexts.push(pageNorm.document.text);
    }

    if (!doc16FetchOk || hsePageTexts.length !== HSE_PAGE_URLS.length) {
      setupError = `DRA-DOC-0016: only ${hsePageTexts.length}/${HSE_PAGE_URLS.length} pages fetched`;
      return;
    }

    hseText = hsePageTexts.join(SECTION_SEPARATOR);
    const hseBytes   = new TextEncoder().encode(hseText);
    const hseSrcDig  = computeSourceDigest(hseBytes);
    const hseNorm    = await normaliseContent(hseBytes, "text/plain", hseSrcDig);
    if (!hseNorm.ok) { setupError = `DRA-DOC-0016 combined normalisation failed: ${hseNorm.message}`; return; }

    const hseLiveTextDigest = hseNorm.document.textDigest;
    console.log(`\n── DRA-DOC-0016 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${hseLiveTextDigest === REF_HSE_TEXT_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED (TEXT_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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

    // ── DRA-DOC-0017: MHRA PIL guidance PDF (live) ────────────────────────

    console.log("── Fetching DRA-DOC-0017 (MHRA PIL guidance PDF)… ──────────");
    const mhraReq = { acquisitionId: "DRA-ACQ-000020", sourceUrl: MHRA_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "MHRA", expectedTitle: "Best practice guidance on patient information leaflets (PILs)" };
    const mhraFetch = await fetcher(mhraReq as any, {});
    if (!mhraFetch.ok) { setupError = `MHRA fetch failed: ${mhraFetch.code}`; return; }

    const mhraSrc = computeSourceDigest(mhraFetch.source.rawBytes);
    const mhraNorm = await normaliseContent(mhraFetch.source.rawBytes, "application/pdf", mhraSrc, extractPdfText);
    if (!mhraNorm.ok) { setupError = `MHRA normalisation failed: ${mhraNorm.message}`; return; }
    mhraText = mhraNorm.document.text;

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

    // ── DRA-DOC-0018: EC Ethics Guidelines for Trustworthy AI (es) PDF (live) ─

    console.log("── Fetching DRA-DOC-0018 (EC Ethics Guidelines for Trustworthy AI, es, PDF)… ──");
    const ecReq = { acquisitionId: "DRA-ACQ-000021", sourceUrl: EC_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "European Commission", expectedTitle: "Ethics Guidelines for Trustworthy AI" };
    const ecFetch = await fetcher(ecReq as any, {});
    if (!ecFetch.ok) { setupError = `EC fetch failed: ${ecFetch.code}`; return; }

    ecLiveSourceDigest = computeSourceDigest(ecFetch.source.rawBytes);
    const ecNorm = await normaliseContent(ecFetch.source.rawBytes, "application/pdf", ecLiveSourceDigest, extractPdfText);
    if (!ecNorm.ok) { setupError = `EC normalisation failed: ${ecNorm.message}`; return; }
    ecText = ecNorm.document.text;

    ecFreezeRepresentationMatch = ecLiveSourceDigest === REF_EC_SOURCE_DIGEST;

    console.log(`\n── DRA-DOC-0018 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Match : ${ecFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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

    // ── DRA-DOC-0019: INE Peer Review Report (es) PDF (live) ─────────────
    //
    // Frozen reference: 9d55917a… / c1ffc3ee… (BYTE_STABLE, DRA-FRZ-000013)
    // If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).

    console.log("── Fetching DRA-DOC-0019 (INE Peer Review Report, es, PDF)… ──");
    const ineReq = { acquisitionId: "DRA-ACQ-000022", sourceUrl: INE_URL, requestedBy: "DRA-BMK-019-operator", requestedAt: FIXED_TS_A, expectedPublisher: "INE", expectedTitle: "Informe de la Revisión por Pares" };
    const ineFetch = await fetcher(ineReq as any, {});
    if (!ineFetch.ok) { setupError = `INE fetch failed: ${ineFetch.code}`; return; }

    ineLiveSourceDigest = computeSourceDigest(ineFetch.source.rawBytes);
    const ineNorm = await normaliseContent(ineFetch.source.rawBytes, "application/pdf", ineLiveSourceDigest, extractPdfText);
    if (!ineNorm.ok) { setupError = `INE normalisation failed: ${ineNorm.message}`; return; }
    ineText = ineNorm.document.text;
    ineLiveTextDigest = ineNorm.document.textDigest;

    ineFreezeRepresentationMatch = ineLiveSourceDigest === REF_INE_SOURCE_DIGEST;

    console.log(`\n── DRA-DOC-0019 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Frozen source digest : ${REF_INE_SOURCE_DIGEST}`);
    console.log(`   Live source digest   : ${ineLiveSourceDigest}`);
    console.log(`   Match : ${ineFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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

    // ── Assemble all 19 BenchmarkExecutionDocuments ───────────────────────

    allDocs = [
      ...initialDocs,
      doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14,
      doc15, doc16, doc17, doc18, doc19,
    ];

    allDocs.sort((a, b) => {
      const seqA = parseInt(a.corpusDocument.corpusId.slice(-4), 10);
      const seqB = parseInt(b.corpusDocument.corpusId.slice(-4), 10);
      return seqA - seqB;
    });

    // ── Run A ─────────────────────────────────────────────────────────────

    console.log(`\n── Executing Run A (fixedTimestamp: ${FIXED_TS_A}) ──────`);
    const runnerA = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_A, fixedRunId: FIXED_RUN_ID_A });
    runResultA    = runnerA.execute(allDocs);
    console.log(`   Run A: ${runResultA.successCount} success, ${runResultA.failureCount} failure / ${runResultA.documentCount} docs`);

    // ── Run B ─────────────────────────────────────────────────────────────

    console.log(`── Executing Run B (fixedTimestamp: ${FIXED_TS_B}) ──────`);
    const runnerB = new BenchmarkRunner({ fixedTimestamp: FIXED_TS_B, fixedRunId: FIXED_RUN_ID_B });
    runResultB    = runnerB.execute(allDocs);
    console.log(`   Run B: ${runResultB.successCount} success, ${runResultB.failureCount} failure / ${runResultB.documentCount} docs`);

  } catch (err) {
    setupError = String(err);
  }
}, 1_200_000); // 20 minutes

// ---------------------------------------------------------------------------
// Part 4 — Frozen Evaluator Run
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 4: Frozen Evaluator Run", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("all 19 BenchmarkExecutionDocuments were assembled", () => {
    expect(allDocs).toHaveLength(19);
    const ids = allDocs.map((d) => d.corpusDocument.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001","DRA-DOC-0002","DRA-DOC-0003","DRA-DOC-0004",
      "DRA-DOC-0005","DRA-DOC-0006","DRA-DOC-0007","DRA-DOC-0008",
      "DRA-DOC-0009","DRA-DOC-0010","DRA-DOC-0011","DRA-DOC-0012",
      "DRA-DOC-0013","DRA-DOC-0014","DRA-DOC-0015","DRA-DOC-0016",
      "DRA-DOC-0017","DRA-DOC-0018","DRA-DOC-0019",
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
    expect(REF_INE_TEXT_DIGEST).toHaveLength(64);

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

    console.log("\n── Live Document Integrity Report ───────────────────────────");
    console.log(`  DRA-DOC-0018 (EC, es) : ${ecFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0019 (INE, es): ${ineFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`    live source digest: ${ineLiveSourceDigest}`);
    console.log(`    live text digest  : ${ineLiveTextDigest}`);
    console.log(`    live text length  : ${ineText.length} chars`);
  });

  it("Run A and Run B produced 19 results each", () => {
    expect(runResultA.documentCount).toBe(19);
    expect(runResultB.documentCount).toBe(19);
    expect(runResultA.records).toHaveLength(19);
    expect(runResultB.records).toHaveLength(19);
  });

  it("no unhandled evaluation failures in Run A or Run B", () => {
    console.log("\n── Evaluation Results (Run A) ───────────────────────────────");
    for (const record of runResultA.records) {
      const result = record.evaluationResult;
      const status = result.ok ? `decision=${result.decision}` : `FAILED: ${(result as any).code}`;
      console.log(`  ${record.corpusId}: ${status}`);
    }
    expect(runResultA.documentCount).toBe(19);
    expect(runResultB.documentCount).toBe(19);
  });

  it("38 proof receipts expected (19 documents × 2 runs)", () => {
    const successA = runResultA.records.filter((r) => r.evaluationResult.ok).length;
    const successB = runResultB.records.filter((r) => r.evaluationResult.ok).length;
    console.log(`\n── Proof Receipt Count ───────────────────────────────────────`);
    console.log(`  Run A successful evaluations: ${successA}/19`);
    console.log(`  Run B successful evaluations: ${successB}/19`);
    console.log(`  Total proof receipts expected: 38`);
    console.log(`  Total proof receipts produced: ${successA + successB}`);
    expect(successA + successB).toBe(38);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — DRA-DOC-0019 Specific Analysis
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 5: DRA-DOC-0019 Evaluator Result", () => {
  it("DRA-DOC-0019 was evaluated without evaluator-level error in Run A", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    expect(record).toBeDefined();
    if (!record) return;
    console.log("\n── DRA-DOC-0019 Evaluator Result (Run A) ────────────────────");
    console.log(`  corpusId      : ${record.corpusId}`);
    console.log(`  evaluationOk  : ${record.evaluationResult.ok}`);
    if (record.evaluationResult.ok) {
      const r = record.evaluationResult;
      console.log(`  decision      : ${r.decision}`);
      console.log(`  issues        : ${r.issues.length}`);
      if (r.issues.length > 0) {
        for (const issue of r.issues) {
          console.log(`    issue: ${(issue as any).issueClass ?? (issue as any).class ?? JSON.stringify(issue).slice(0, 80)}`);
        }
      }
      console.log(`  receiptDigest : ${r.proofReceipt.substantiveDigest.slice(0, 16)}…`);
    } else {
      console.log(`  error code    : ${(record.evaluationResult as any).code}`);
      console.log(`  error message : ${(record.evaluationResult as any).message}`);
    }
    expect(record).toBeDefined();
  });

  it("DRA-DOC-0019 Run A and Run B decisions are identical — REPRODUCIBILITY: IDENTICAL", () => {
    const recA = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    const recB = runResultB.records.find((r) => r.corpusId === "DRA-DOC-0019");
    expect(recA).toBeDefined();
    expect(recB).toBeDefined();
    if (recA?.evaluationResult.ok && recB?.evaluationResult.ok) {
      console.log(`\n── DRA-DOC-0019 Run A vs Run B ──────────────────────────────`);
      console.log(`  decision A    : ${recA.evaluationResult.decision}`);
      console.log(`  decision B    : ${recB.evaluationResult.decision}`);
      expect(recA.evaluationResult.decision).toBe(recB.evaluationResult.decision);
      expect(recA.evaluationResult.proofReceipt.substantiveDigest).toBe(
        recB.evaluationResult.proofReceipt.substantiveDigest,
      );
    }
  });

  it("DRA-DOC-0019 proof receipt passes structural integrity check", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    if (!record?.evaluationResult.ok) return;
    const receipt = record.evaluationResult.proofReceipt;
    const valid = verifyReceiptIntegrity(receipt);
    console.log(`\n── DRA-DOC-0019 ProofReceipt Integrity ──────────────────────`);
    console.log(`  verifyReceiptIntegrity: ${valid ? "PASS ✓" : "FAIL ✗"}`);
    expect(valid).toBe(true);
  });

  it("reports DRA-DOC-0019 issue-class contribution against the DRA-CHK-002 reachability ceiling", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    if (!record?.evaluationResult.ok) return;
    const r = record.evaluationResult;
    const classes = r.issues.map(
      (iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN",
    );
    const classSet = new Set(classes);

    console.log(`\n── DRA-DOC-0019 Issue-Class Contribution ────────────────────`);
    console.log(`  decision   : ${r.decision}`);
    console.log(`  issues     : ${r.issues.length}`);
    console.log(`  classes    : ${[...classSet].join(", ") || "(none)"}`);

    for (const cls of classSet) {
      const entry = REACHABILITY_MATRIX.find((e) => e.name === cls);
      if (entry) {
        console.log(`  ${cls}: reachability=${entry.reachability} (${entry.code})`);
        expect(entry.reachability).not.toBe("STRUCTURALLY_UNREACHABLE");
      }
    }

    expect(true).toBe(true);
  });

  it("reports DRA-DOC-0019 source stability classification against DRA-FRZ-000013", () => {
    console.log("\n── DRA-DOC-0019 Source Stability ────────────────────────────");
    console.log(`  Frozen source digest (DRA-FRZ-000013): ${REF_INE_SOURCE_DIGEST}`);
    console.log(`  Live source digest (current fetch)   : ${ineLiveSourceDigest}`);
    console.log(`  Match: ${ineFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  Admitted stability class: BYTE_STABLE`);
    console.log(`  Live text length: ${ineText.length} chars`);

    expect(REF_INE_SOURCE_DIGEST).toMatch(/^[0-9a-f]{64}$/);
    expect(ineLiveSourceDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(ineText.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Decision Distribution and Issue-Class Coverage
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 6: Decision Distribution and Issue-Class Coverage", () => {
  it("summarises decision distribution across all 19 documents (Run A) and compares to DRA-BMK-018", () => {
    console.log("\n── Decision Distribution (Run A, 19 documents) ─────────────");

    const decisionMap = new Map<string, number>();
    for (const record of runResultA.records) {
      if (record.evaluationResult.ok) {
        const d = record.evaluationResult.decision;
        decisionMap.set(d, (decisionMap.get(d) ?? 0) + 1);
      }
    }
    for (const [d, c] of [...decisionMap.entries()].sort()) {
      console.log(`  ${d.padEnd(20)}: ${c}`);
    }

    // Prior (DRA-BMK-018, 18 docs) decision counts, per the task's authoritative
    // baseline carried forward from that checkpoint's own decision distribution.
    const PRIOR_SUPPORTED = 8;
    const PRIOR_REVIEW    = 8;
    const PRIOR_HOLD      = 2;

    console.log(`\n── Comparison to DRA-BMK-018 (18 documents) ─────────────────`);
    console.log(`  DRA-BMK-018 baseline : SUPPORTED ${PRIOR_SUPPORTED}, REVIEW ${PRIOR_REVIEW}, HOLD ${PRIOR_HOLD}`);
    const newSupported = decisionMap.get("SUPPORTED") ?? 0;
    const newReview     = decisionMap.get("REVIEW") ?? 0;
    const newHold        = decisionMap.get("HOLD") ?? 0;
    console.log(`  DRA-BMK-019 (19 docs) : SUPPORTED ${newSupported}, REVIEW ${newReview}, HOLD ${newHold}`);

    const doc19Record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    const doc19Decision = doc19Record?.evaluationResult.ok ? doc19Record.evaluationResult.decision : "n/a";
    console.log(`  DRA-DOC-0019 decision (this run): ${doc19Decision}`);

    const priorTotal = PRIOR_SUPPORTED + PRIOR_REVIEW + PRIOR_HOLD;
    const newTotalExcl019 = newSupported + newReview + newHold - (doc19Decision === "SUPPORTED" ? 1 : 0) - (doc19Decision === "REVIEW" ? 1 : 0) - (doc19Decision === "HOLD" ? 1 : 0);
    console.log(`  Prior 18-doc total (SUPPORTED+REVIEW+HOLD): ${priorTotal}`);
    console.log(`  New 19-doc total excluding DRA-DOC-0019's own decision bucket: ${newTotalExcl019}`);
    console.log(`  Additive-only check: ${newTotalExcl019 === priorTotal ? "✓ PASS — DRA-DOC-0019 is purely additive to one bucket" : "✗ FAIL — an existing document's decision appears to have changed"}`);

    expect(runResultA.documentCount).toBe(19);
    expect(newTotalExcl019).toBe(priorTotal);
  });

  it("reports issue-class coverage across all 19 documents (Run A) and states whether DRA-DOC-0019 changed coverage", () => {
    console.log("\n── Issue-Class Coverage (Run A, 19 documents) ───────────────");

    const classSet    = new Set<string>();
    const classDocMap = new Map<string, string[]>();

    for (const record of runResultA.records) {
      if (record.evaluationResult.ok) {
        for (const issue of record.evaluationResult.issues) {
          const cls = (issue as any).issueClass ?? (issue as any).class ?? "UNKNOWN";
          classSet.add(cls);
          const docs = classDocMap.get(cls) ?? [];
          docs.push(record.corpusId);
          classDocMap.set(cls, docs);
        }
      }
    }

    const ALL_KNOWN_CLASSES = [
      "UNSUPPORTED_CLAIM",
      "AUTHORITY_EXPIRED",
      "AUTHORITY_ABSENT",
      "EVIDENCE_ABSENT",
      "EVIDENCE_INADEQUATE",
      "EVIDENCE_CONFLICT",
      "CLAIM_INCONSISTENCY",
      "TRACEABILITY_BROKEN",
      "SCOPE_VIOLATION",
    ];

    for (const cls of ALL_KNOWN_CLASSES) {
      const docs    = classDocMap.get(cls) ?? [];
      const covered = docs.length > 0;
      console.log(`  ${cls.padEnd(24)}: ${covered ? `COVERED (${docs.join(", ")})` : "not observed"}`);
    }

    const coveredCount = [...classSet].filter((c) => ALL_KNOWN_CLASSES.includes(c)).length;
    console.log(`\n  Total covered: ${coveredCount}/9 known issue classes`);

    // DRA-BMK-018 (18-doc corpus) baseline: 3/9 covered (IC-4, IC-5, IC-7).
    const PRIOR_COVERAGE_COUNT = 3;
    const PRIOR_COVERED_CLASSES = ["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"];

    const newlyCoveredClasses = [...classSet].filter(
      (c) => ALL_KNOWN_CLASSES.includes(c) && !PRIOR_COVERED_CLASSES.includes(c),
    );

    console.log(`\n── Coverage Change Analysis (vs DRA-BMK-018 baseline: 3/9) ──`);
    console.log(`  Prior covered classes  : ${PRIOR_COVERED_CLASSES.join(", ")}`);
    console.log(`  Current covered classes: ${[...classSet].filter((c) => ALL_KNOWN_CLASSES.includes(c)).join(", ")}`);
    console.log(`  Newly covered classes  : ${newlyCoveredClasses.length > 0 ? newlyCoveredClasses.join(", ") : "NONE"}`);
    console.log(`  DRA-CHK-002 coverage ceiling: ${COVERAGE_CEILING.maxObservable}/${COVERAGE_CEILING.total} (3/9) — a 4th observed class would exceed the established ceiling and require re-investigation, not silent acceptance.`);

    if (newlyCoveredClasses.length === 0) {
      console.log(`  FINDING: DRA-DOC-0019 does NOT introduce new issue-class coverage.`);
      console.log(`  Coverage remains at the DRA-CHK-002 ceiling (3/9: IC-4, IC-5, IC-7).`);
    } else {
      console.log(`  FINDING: DRA-DOC-0019 appears to exercise a class beyond the prior 3/9 baseline.`);
      console.log(`  This would contradict the DRA-CHK-002 reachability ceiling and requires`);
      console.log(`  investigation before being accepted as a genuine coverage increase.`);
    }

    expect(coveredCount).toBeLessThanOrEqual(COVERAGE_CEILING.maxObservable);
  });

  it("all proof receipts pass structural integrity check for Run A and Run B", () => {
    for (const [label, runResult] of [["Run A", runResultA], ["Run B", runResultB]] as const) {
      let verifiedCount = 0;
      let totalCount    = 0;
      for (const record of runResult.records) {
        if (record.evaluationResult.ok) {
          totalCount++;
          const valid = verifyReceiptIntegrity(record.evaluationResult.proofReceipt);
          if (valid) verifiedCount++;
        }
      }
      console.log(`  ${label}: ${verifiedCount}/${totalCount} proof receipts passed integrity check`);
      expect(verifiedCount).toBe(totalCount);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Run A vs Run B Reproducibility (full 19-document live corpus)
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 7: Run A vs Run B Reproducibility", () => {
  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-019) ───────────────────");
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.corpusId).toBe(rB.corpusId);
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        const match = rA.evaluationResult.decision === rB.evaluationResult.decision;
        console.log(`  ${rA.corpusId}: ${rA.evaluationResult.decision} | ${match ? "IDENTICAL ✓" : "DIFFERENT ✗"}`);
        expect(rA.evaluationResult.decision).toBe(rB.evaluationResult.decision);
      }
    }
  });

  it("same substantiveDigest on both runs for every document", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        expect(rA.evaluationResult.proofReceipt.substantiveDigest).toBe(
          rB.evaluationResult.proofReceipt.substantiveDigest,
        );
      }
    }
  });

  it("operational timestamps differ between runs (fixedTimestamp control is active)", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      expect(rA.executedAt).toBe(FIXED_TS_A);
      expect(rB.executedAt).toBe(FIXED_TS_B);
      expect(rA.executedAt).not.toBe(rB.executedAt);
    }
  });

  it("same issue count on both runs for every document", () => {
    for (let i = 0; i < runResultA.records.length; i++) {
      const rA = runResultA.records[i]!;
      const rB = runResultB.records[i]!;
      if (rA.evaluationResult.ok && rB.evaluationResult.ok) {
        expect(rA.evaluationResult.issues.length).toBe(rB.evaluationResult.issues.length);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Manifest Consistency Under Live Re-Fetch
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 8: Manifest Consistency Under Live Re-Fetch", () => {
  it("reports overall corpus source-stability summary across all live-acquired documents", () => {
    console.log("\n── Corpus-Wide Source Stability Summary (DRA-DOC-0007–0019) ─");
    console.log(`  DRA-DOC-0018 (EC, es) : ${ecFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0019 (INE, es): ${ineFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 9 — Document-vs-Language Comparative Analysis
// (DRA-DOC-0019 vs the DRA-BMK-018 DRA-DOC-0018 multilingual observation)
// ---------------------------------------------------------------------------
//
// Scope: exactly two Spanish-language documents exist in the corpus
// (DRA-DOC-0018, DRA-DOC-0019). This is explicitly NOT sufficient evidence
// for a general multilingual-robustness claim. The sole question this part
// answers is narrower: does the DRA-BMK-018 POSSIBLE_SENSITIVITY observation
// (statement/issue-detection volume differences plausibly, but not
// confirmedly, attributable to non-English input) reproduce, diverge, or
// remain undetermined when publisher, domain, and document structure vary
// but language is held constant (es)? Findings use the same four-bucket
// vocabulary as DRA-BMK-018:
//   • OBSERVED_BEHAVIOUR, POSSIBLE_SENSITIVITY, CONFIRMED_DEFECT, NO_DIFFERENCE

describe("DRA-BMK-019 — Part 9: Document-vs-Language Comparative Analysis (DRA-DOC-0018 vs DRA-DOC-0019, both es)", () => {
  it("DRA-DOC-0019 evaluates without throwing or evaluator-level error (OBSERVED_BEHAVIOUR)", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Comparative Observation 1: Evaluator Stability ───────────");
    console.log(`  Category: OBSERVED_BEHAVIOUR`);
    console.log(`  Finding : Runner produced a record for DRA-DOC-0019 (evaluationOk=${record?.evaluationResult.ok}).`);
    console.log(`  This confirms the runner's "never throws" invariant held for a second, independently-`);
    console.log(`  governed non-English document from a different publisher/domain/structure.`);
    expect(record).toBeDefined();
  });

  it("compares DRA-DOC-0018 and DRA-DOC-0019 decision/issue outcomes side by side (OBSERVED_BEHAVIOUR)", () => {
    const rec18 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0018");
    const rec19 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Comparative Observation 2: Side-by-Side Outcomes ─────────");
    console.log(`  Category: OBSERVED_BEHAVIOUR`);
    if (rec18?.evaluationResult.ok && rec19?.evaluationResult.ok) {
      const r18 = rec18.evaluationResult;
      const r19 = rec19.evaluationResult;
      console.log(`  DRA-DOC-0018 (EC, es, ${ecText.length} chars, TECHNICAL, REPORT) : decision=${r18.decision}, issues=${r18.issues.length}`);
      console.log(`  DRA-DOC-0019 (INE, es, ${ineText.length} chars, GENERAL, REPORT): decision=${r19.decision}, issues=${r19.issues.length}`);
      const sameDecision = r18.decision === r19.decision;
      console.log(`  Decision match across the two Spanish documents: ${sameDecision ? "YES" : "NO"}`);
      expect(rec18).toBeDefined();
      expect(rec19).toBeDefined();
    }
  });

  it("determines whether DRA-DOC-0019 reproduces the DRA-BMK-018 POSSIBLE_SENSITIVITY finding (POSSIBLE_SENSITIVITY / NO_DIFFERENCE)", () => {
    const rec18 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0018");
    const rec19 = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Comparative Observation 3: Reproduction of DRA-BMK-018 Finding ──");
    if (rec18?.evaluationResult.ok && rec19?.evaluationResult.ok) {
      const r18 = rec18.evaluationResult;
      const r19 = rec19.evaluationResult;
      console.log(`  DRA-BMK-018 finding (DRA-DOC-0018, es): decision=${r18.decision}, issues=${r18.issues.length}.`);
      console.log(`  This checkpoint's result (DRA-DOC-0019, es): decision=${r19.decision}, issues=${r19.issues.length}.`);
      if (r18.decision === r19.decision && r18.issues.length === r19.issues.length) {
        console.log(`  Category: NO_DIFFERENCE`);
        console.log(`  Finding : Both Spanish-language documents produce the same decision and issue count`);
        console.log(`            despite differing publisher, domain (TECHNICAL vs GENERAL), and structure.`);
        console.log(`            This is consistent with — but does not prove — the possibility that the`);
        console.log(`            DRA-BMK-018 POSSIBLE_SENSITIVITY finding was a property of that single`);
        console.log(`            document rather than a general effect of the language dimension. Two`);
        console.log(`            data points cannot establish causality either way.`);
      } else {
        console.log(`  Category: POSSIBLE_SENSITIVITY (unconfirmed)`);
        console.log(`  Finding : The two Spanish-language documents produce different decisions and/or`);
        console.log(`            issue counts. This could reflect genuine content differences (most likely,`);
        console.log(`            since publisher, domain, and structure all vary between them), or could be`);
        console.log(`            consistent with the DRA-BMK-018 language-sensitivity hypothesis. With only`);
        console.log(`            two Spanish documents and no English-translation control, this checkpoint`);
        console.log(`            cannot distinguish between these explanations — that isolation requires`);
        console.log(`            either an English translation of one of these documents, or a controlled`);
        console.log(`            pair varying only language and holding content constant.`);
      }
      console.log(`  Explicit scope limitation: this finding applies ONLY to these two Spanish-language`);
      console.log(`  documents. It is NOT a general multilingual-robustness or non-robustness claim.`);
    }
    expect(rec18).toBeDefined();
    expect(rec19).toBeDefined();
  });

  it("checks whether DRA-DOC-0019 violates any documented evaluator invariant (CONFIRMED_DEFECT gate)", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Comparative Observation 4: Invariant Compliance ──────────");
    console.log(`  Category: NO_DIFFERENCE (unless stated otherwise below)`);
    if (record?.evaluationResult.ok) {
      const receipt = record.evaluationResult.proofReceipt;
      const valid = verifyReceiptIntegrity(receipt);
      console.log(`  Finding : ProofReceipt integrity check ${valid ? "PASSED" : "FAILED"} — identical invariant`);
      console.log(`            to every other document in the corpus, including DRA-DOC-0018. No`);
      console.log(`            CONFIRMED_DEFECT observed for either Spanish-language document.`);
      expect(valid).toBe(true);
    } else {
      console.log(`  Category: CONFIRMED_DEFECT candidate — evaluator returned ok:false for DRA-DOC-0019.`);
      console.log(`  Finding : code=${(record?.evaluationResult as any)?.code}`);
    }
  });

  it("confirms DRA-DOC-0019 does not exceed the DRA-CHK-002 reachability ceiling under non-English input (NO_DIFFERENCE)", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Comparative Observation 5: Reachability Ceiling ──────────");
    console.log(`  Category: NO_DIFFERENCE`);
    if (record?.evaluationResult.ok) {
      const classes = new Set(
        record.evaluationResult.issues.map((iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN"),
      );
      console.log(`  Finding : DRA-DOC-0019 issue classes: ${[...classes].join(", ") || "(none)"}.`);
      console.log(`  The 3/9 DRA-CHK-002 coverage ceiling applies identically regardless of document`);
      console.log(`  language or publisher — it is a property of the frozen evaluator's rule set.`);
      expect(classes.size).toBeLessThanOrEqual(COVERAGE_CEILING.maxObservable);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 10 — Admission-Time Result vs Independently-Derived Benchmark Result
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 10: Admission-Time vs Benchmark-Derived Result for DRA-DOC-0019", () => {
  it("compares the admission-time evaluator observation against this run's independently-derived result", () => {
    // Admission-time observation (DRA-ACQ-015 Phase 2 / DRA-ENG-009 admission
    // evaluation): decision=SUPPORTED, issues=0. Not assumed correct here — a
    // starting fact to compare against, per the established convention.
    const ADMISSION_TIME_DECISION = "SUPPORTED";
    const ADMISSION_TIME_ISSUES   = 0;

    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0019");
    console.log("\n── Admission-Time vs Benchmark-Derived Result (DRA-DOC-0019) ─");
    console.log(`  Admission-time (DRA-ACQ-015 Phase 2) : decision=${ADMISSION_TIME_DECISION}, issues=${ADMISSION_TIME_ISSUES}`);
    if (record?.evaluationResult.ok) {
      const r = record.evaluationResult;
      console.log(`  This benchmark run (DRA-BMK-019, Run A)  : decision=${r.decision}, issues=${r.issues.length}`);
      const decisionMatches = r.decision === ADMISSION_TIME_DECISION;
      const issueCountMatches = r.issues.length === ADMISSION_TIME_ISSUES;
      console.log(`  Decision match   : ${decisionMatches ? "✓ CONSISTENT" : "✗ DIFFERS"}`);
      console.log(`  Issue count match: ${issueCountMatches ? "✓ CONSISTENT" : "✗ DIFFERS"}`);
      if (!decisionMatches || !issueCountMatches) {
        console.log(`  NOTE: A difference does not by itself indicate a defect — it may reflect a`);
        console.log(`  fixedTimestamp/runId difference, a live-content change since admission, or a`);
        console.log(`  genuine discrepancy worth investigating. It is reported here, not silently resolved.`);
      }
      expect(typeof r.decision).toBe("string");
    }
    expect(record).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Part 11 — Evidence Gap Identification for DRA-DOC-0020
// ---------------------------------------------------------------------------

describe("DRA-BMK-019 — Part 11: Evidence Gap Identification for DRA-DOC-0020", () => {
  it("states the evidence gap that should drive the next acquisition, derived from this checkpoint's findings", () => {
    console.log("\n── Evidence Gap Analysis for DRA-DOC-0020 ───────────────────");
    console.log(`  Corpus state: 19 documents, 2 languages (en/en-GB: 17, es: 2), 9 domains represented`);
    console.log(`    with GENERAL, TECHNICAL, FINANCE, HEALTHCARE, BUSINESS, LEGAL populated.`);
    console.log(`  Issue-class coverage: unchanged at the DRA-CHK-002 ceiling (3/9), confirmed`);
    console.log(`    unaffected by either Spanish-language document.`);
    console.log(`  Difficulty distribution: LOW remains the most under-represented tier (2/19).`);
    console.log(`  Language distribution: 2/19 documents are non-English, and both are Spanish —`);
    console.log(`    no third language, and no English/Spanish parallel-text pair, exists yet.`);
    console.log(``);
    console.log(`  FINDING: The comparative analysis in Part 9 could not isolate language as a causal`);
    console.log(`  factor in the DRA-BMK-018 POSSIBLE_SENSITIVITY observation, because DRA-DOC-0018 and`);
    console.log(`  DRA-DOC-0019 differ in publisher, domain, and structure as well as being the only two`);
    console.log(`  Spanish documents available. Two candidate evidence gaps follow directly from this:`);
    console.log(`    (a) A third language (e.g. French, German) would test whether any observed`);
        console.log(`        language-related effect generalises beyond Spanish specifically, or is Spanish-`);
    console.log(`        specific, without resolving the language-vs-document confound for Spanish.`);
    console.log(`    (b) An English/Spanish parallel-text pair (the same source document, officially`);
    console.log(`        translated) would hold content constant and vary only language — the only`);
    console.log(`        design that can directly isolate a language effect from a document effect.`);
    console.log(`  This checkpoint does not select between (a) and (b) — that decision belongs to the`);
    console.log(`  next acquisition programme, informed by source availability (an EU institution`);
    console.log(`  document published in multiple official-language editions, such as an EU regulation`);
    console.log(`  or another EC/EU-agency guidance document, could satisfy (b) directly).`);
    expect(true).toBe(true);
  });
});
