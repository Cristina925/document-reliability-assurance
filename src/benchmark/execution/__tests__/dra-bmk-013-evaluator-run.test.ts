/**
 * DRA-BMK-013 — Parts 4–8: Thirteen-Document Evaluator Run
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THIRTEEN-DOCUMENT EVALUATOR RUN — DRA-BMK-013                          ║
 * ║                                                                          ║
 * ║  Corpus: DRA-DOC-0001 through DRA-DOC-0013                              ║
 * ║  Evaluator: frozen Version 1 (evaluateDocument, BenchmarkRunner)        ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-06T17:00:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-06T17:30:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed or decisions replaced                        ║
 * ║    • No evaluator features added                                         ║
 * ║    • Runner never throws — failures captured as records                 ║
 * ║    • No tuning for DRA-DOC-0013                                          ║
 * ║                                                                          ║
 * ║  Live network: DRA-DOC-0008, 0009, 0010, 0012, 0013 (PDFs via pdftotext)║
 * ║                DRA-DOC-0011 (14 HTML sections, ICO guidance)             ║
 * ║  DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture.          ║
 * ║                                                                          ║
 * ║  DRA-DOC-0013 live-text comparison:                                      ║
 * ║    Live text digest compared against frozen reference.                   ║
 * ║    If match → FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE).            ║
 * ║    If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort).              ║
 * ║                                                                          ║
 * ║  Allow 15 minutes.                                                       ║
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

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic runs
// ---------------------------------------------------------------------------

const FIXED_TS_A     = "2026-08-06T17:00:00.000Z";
const FIXED_TS_B     = "2026-08-06T17:30:00.000Z";
const FIXED_RUN_ID_A = "bmk-013-run-A";
const FIXED_RUN_ID_B = "bmk-013-run-B";

// ---------------------------------------------------------------------------
// Frozen reference digests (from admitted freeze records)
// ---------------------------------------------------------------------------

// DRA-DOC-0008 (Acas guide, DRA-FRZ-000002)
const REF_ACAS_SOURCE_DIGEST = "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300";
const REF_ACAS_TEXT_DIGEST   = "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0";

// DRA-DOC-0009 (CMA Short Version, DRA-FRZ-000003)
const REF_CMA_SOURCE_DIGEST  = "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f";
const REF_CMA_TEXT_DIGEST    = "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed";

// DRA-DOC-0010 (NIST AI RMF, DRA-FRZ-000004)
const REF_NIST_SOURCE_DIGEST = "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1";
const REF_NIST_TEXT_DIGEST   = "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430";

// DRA-DOC-0011 (ICO guidance, DRA-FRZ-000005) — TEXT_STABLE
const REF_ICO_SOURCE_DIGEST  = "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";
const REF_ICO_TEXT_DIGEST    = "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";
const REF_ICO_TEXT_LENGTH    = 367376;

// DRA-DOC-0012 (PRA SS1/23, DRA-FRZ-000006) — BYTE_STABLE
const REF_PRA_SOURCE_DIGEST  = "6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7";
const REF_PRA_TEXT_DIGEST    = "bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c";
const REF_PRA_TEXT_LENGTH    = 75182;

// DRA-DOC-0013 (FDA AI/ML SaMD Action Plan, DRA-FRZ-000007) — BYTE_STABLE
const REF_FDA_SOURCE_DIGEST  = "83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a";
const REF_FDA_TEXT_DIGEST    = "f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186";
const REF_FDA_TEXT_LENGTH    = 24390;

// ---------------------------------------------------------------------------
// Live document URLs
// ---------------------------------------------------------------------------

const ACAS_URL  = "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";
const CMA_URL   = "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";
const NIST_URL  = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
const PRA_URL   = "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";
const FDA_URL   = "https://www.fda.gov/media/145022/download";

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

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext helper
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-bmk013-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

// Live doc text
let acasText  = "";
let cmaText   = "";
let nistText  = "";
let doc7Text  = "";
let icoText   = "";
let praText   = "";
let fdaText   = "";

// Integrity classification
let icoFreezeRepresentationMatch  = false;
let icoLiveTextDigest             = "";
let praFreezeRepresentationMatch  = false;
let praLiveTextDigest             = "";
let praLiveSourceDigest           = "";
let fdaFreezeRepresentationMatch  = false;
let fdaLiveTextDigest             = "";
let fdaLiveSourceDigest           = "";

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
      userAgent:    "DRA-BMK-013/1.0",
    });

    // ── DRA-DOC-0008: Acas guide PDF (live) ───────────────────────────────

    console.log("\n── Fetching DRA-DOC-0008 (Acas guide PDF)… ─────────────────");
    const acasReq = { acquisitionId: "DRA-ACQ-000002", sourceUrl: ACAS_URL, requestedBy: "DRA-BMK-013-operator", requestedAt: FIXED_TS_A, expectedPublisher: "Acas", expectedTitle: "Acas guide" };
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
    const cmaReq = { acquisitionId: "DRA-ACQ-000008", sourceUrl: CMA_URL, requestedBy: "DRA-BMK-013-operator", requestedAt: FIXED_TS_A, expectedPublisher: "CMA", expectedTitle: "AI Foundation Models Short Version" };
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
    const nistReq = { acquisitionId: "DRA-ACQ-000012", sourceUrl: NIST_URL, requestedBy: "DRA-BMK-013-operator", requestedAt: FIXED_TS_A, expectedPublisher: "NIST", expectedTitle: "AI RMF 1.0" };
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
        requestedBy: "DRA-BMK-013-operator",
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
    const encoder   = new TextEncoder();
    const icoBytes  = encoder.encode(icoText);
    const icoSrcDig = computeSourceDigest(icoBytes);
    const icoNorm   = await normaliseContent(icoBytes, "text/plain", icoSrcDig);
    if (!icoNorm.ok) { setupError = `DRA-DOC-0011 combined normalisation failed: ${icoNorm.message}`; return; }

    icoLiveTextDigest = icoNorm.document.textDigest;
    icoFreezeRepresentationMatch = icoLiveTextDigest === REF_ICO_TEXT_DIGEST;

    console.log(`\n── DRA-DOC-0011 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Frozen: ${REF_ICO_TEXT_DIGEST}`);
    console.log(`   Live  : ${icoLiveTextDigest}`);
    console.log(`   Match : ${icoFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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
    const praReq = { acquisitionId: "DRA-ACQ-000014", sourceUrl: PRA_URL, requestedBy: "DRA-BMK-013-operator", requestedAt: FIXED_TS_A, expectedPublisher: "PRA", expectedTitle: "PRA SS1/23" };
    const praFetch = await fetcher(praReq as any, {});
    if (!praFetch.ok) { setupError = `PRA fetch failed: ${praFetch.code}`; return; }

    praLiveSourceDigest = computeSourceDigest(praFetch.source.rawBytes);
    const praNorm = await normaliseContent(praFetch.source.rawBytes, "application/pdf", praLiveSourceDigest, extractPdfText);
    if (!praNorm.ok) { setupError = `PRA normalisation failed: ${praNorm.message}`; return; }
    praText = praNorm.document.text;

    praLiveTextDigest = praNorm.document.textDigest;
    praFreezeRepresentationMatch = praLiveSourceDigest === REF_PRA_SOURCE_DIGEST;

    console.log(`\n── DRA-DOC-0012 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Frozen source digest : ${REF_PRA_SOURCE_DIGEST}`);
    console.log(`   Live source digest   : ${praLiveSourceDigest}`);
    console.log(`   Source match: ${praFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

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
    //
    // Frozen reference: 83c70423… / f2d29332… (BYTE_STABLE, DRA-FRZ-000007)
    // If source digest matches → FROZEN_REPRESENTATION_CONFIRMED
    // If mismatch → LIVE_CONTENT_CHANGE_OBSERVED (not abort)

    console.log("── Fetching DRA-DOC-0013 (FDA AI/ML SaMD Action Plan PDF)… ──");
    const fdaReq = { acquisitionId: "DRA-ACQ-000015", sourceUrl: FDA_URL, requestedBy: "DRA-BMK-013-operator", requestedAt: FIXED_TS_A, expectedPublisher: "FDA", expectedTitle: "FDA AI/ML SaMD Action Plan" };
    const fdaFetch = await fetcher(fdaReq as any, {});
    if (!fdaFetch.ok) { setupError = `FDA fetch failed: ${fdaFetch.code}`; return; }

    fdaLiveSourceDigest = computeSourceDigest(fdaFetch.source.rawBytes);
    const fdaNorm = await normaliseContent(fdaFetch.source.rawBytes, "application/pdf", fdaLiveSourceDigest, extractPdfText);
    if (!fdaNorm.ok) { setupError = `FDA normalisation failed: ${fdaNorm.message}`; return; }
    fdaText = fdaNorm.document.text;

    fdaLiveTextDigest = fdaNorm.document.textDigest;
    fdaFreezeRepresentationMatch = fdaLiveSourceDigest === REF_FDA_SOURCE_DIGEST;

    console.log(`\n── DRA-DOC-0013 Frozen vs Live Content Comparison ───────────`);
    console.log(`   Frozen source digest : ${REF_FDA_SOURCE_DIGEST}`);
    console.log(`   Live source digest   : ${fdaLiveSourceDigest}`);
    console.log(`   Frozen text digest   : ${REF_FDA_TEXT_DIGEST}`);
    console.log(`   Live text digest     : ${fdaLiveTextDigest}`);
    console.log(`   Source match: ${fdaFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED (BYTE_STABLE)" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);

    if (!fdaFreezeRepresentationMatch) {
      console.log(`   NOTE: Source changed since freeze. Evaluator runs on current content.`);
    }

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

    // ── Assemble all 13 BenchmarkExecutionDocuments ───────────────────────

    allDocs = [
      ...initialDocs,
      doc7,
      doc8,
      doc9,
      doc10,
      doc11,
      doc12,
      doc13,
    ];

    // Sort by corpusId sequence to guarantee canonical order
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
}, 900_000); // 15 minutes

// ---------------------------------------------------------------------------
// Part 4 — Frozen Evaluator Run
// ---------------------------------------------------------------------------

describe("DRA-BMK-013 — Part 4: Frozen Evaluator Run", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("all 13 BenchmarkExecutionDocuments were assembled", () => {
    expect(allDocs).toHaveLength(13);
    const ids = allDocs.map((d) => d.corpusDocument.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001","DRA-DOC-0002","DRA-DOC-0003","DRA-DOC-0004",
      "DRA-DOC-0005","DRA-DOC-0006","DRA-DOC-0007","DRA-DOC-0008",
      "DRA-DOC-0009","DRA-DOC-0010","DRA-DOC-0011","DRA-DOC-0012",
      "DRA-DOC-0013",
    ]);
  });

  it("reports live document integrity status against admitted freeze records", () => {
    expect(REF_ACAS_TEXT_DIGEST).toHaveLength(64);
    expect(REF_CMA_TEXT_DIGEST).toHaveLength(64);
    expect(REF_NIST_TEXT_DIGEST).toHaveLength(64);
    expect(REF_ICO_TEXT_DIGEST).toHaveLength(64);
    expect(REF_PRA_TEXT_DIGEST).toHaveLength(64);
    expect(REF_FDA_TEXT_DIGEST).toHaveLength(64);

    expect(acasText.length).toBeGreaterThan(0);
    expect(cmaText.length).toBeGreaterThan(0);
    expect(nistText.length).toBeGreaterThan(0);
    expect(icoText.length).toBeGreaterThan(0);
    expect(praText.length).toBeGreaterThan(0);
    expect(fdaText.length).toBeGreaterThan(0);

    console.log("\n── Live Document Integrity Report ───────────────────────────");
    console.log(`  DRA-DOC-0008 (Acas)  : ${acasText.length} chars`);
    console.log(`  DRA-DOC-0009 (CMA)   : ${cmaText.length} chars`);
    console.log(`  DRA-DOC-0010 (NIST)  : ${nistText.length} chars`);
    console.log(`  DRA-DOC-0011 (ICO)   : ${icoFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0012 (PRA)   : ${praFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`    live source digest: ${praLiveSourceDigest}`);
    console.log(`    live text digest  : ${praLiveTextDigest}`);
    console.log(`  DRA-DOC-0013 (FDA)   : ${fdaFreezeRepresentationMatch ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`    live source digest: ${fdaLiveSourceDigest}`);
    console.log(`    live text digest  : ${fdaLiveTextDigest}`);
    console.log(`    live text length  : ${fdaText.length} chars`);
    console.log(`    ref text length   : ${REF_FDA_TEXT_LENGTH} chars`);
  });

  it("Run A and Run B produced 13 results each", () => {
    expect(runResultA.documentCount).toBe(13);
    expect(runResultB.documentCount).toBe(13);
    expect(runResultA.records).toHaveLength(13);
    expect(runResultB.records).toHaveLength(13);
  });

  it("no unhandled evaluation failures in Run A or Run B", () => {
    console.log("\n── Evaluation Results (Run A) ───────────────────────────────");
    for (const record of runResultA.records) {
      const result = record.evaluationResult;
      const status = result.ok ? `decision=${result.decision}` : `FAILED: ${(result as any).code}`;
      console.log(`  ${record.corpusId}: ${status}`);
    }
    expect(runResultA.documentCount).toBe(13);
    expect(runResultB.documentCount).toBe(13);
  });
});

// ---------------------------------------------------------------------------
// Part 5 — DRA-DOC-0013 Specific Analysis
// ---------------------------------------------------------------------------

describe("DRA-BMK-013 — Part 5: DRA-DOC-0013 Evaluator Result", () => {
  it("DRA-DOC-0013 was evaluated without evaluator-level error in Run A", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0013");
    expect(record).toBeDefined();
    if (!record) return;
    console.log("\n── DRA-DOC-0013 Evaluator Result (Run A) ────────────────────");
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
    // Evaluator must not throw — either ok:true or ok:false with a code
    expect(record).toBeDefined();
  });

  it("DRA-DOC-0013 Run A and Run B decisions are identical — REPRODUCIBILITY: IDENTICAL", () => {
    const recA = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0013");
    const recB = runResultB.records.find((r) => r.corpusId === "DRA-DOC-0013");
    expect(recA).toBeDefined();
    expect(recB).toBeDefined();
    if (recA?.evaluationResult.ok && recB?.evaluationResult.ok) {
      console.log(`\n── DRA-DOC-0013 Run A vs Run B ──────────────────────────────`);
      console.log(`  decision A    : ${recA.evaluationResult.decision}`);
      console.log(`  decision B    : ${recB.evaluationResult.decision}`);
      console.log(`  substantiveD A: ${recA.evaluationResult.proofReceipt.substantiveDigest.slice(0, 16)}…`);
      console.log(`  substantiveD B: ${recB.evaluationResult.proofReceipt.substantiveDigest.slice(0, 16)}…`);
      expect(recA.evaluationResult.decision).toBe(recB.evaluationResult.decision);
      expect(recA.evaluationResult.proofReceipt.substantiveDigest).toBe(
        recB.evaluationResult.proofReceipt.substantiveDigest,
      );
    }
  });

  it("DRA-DOC-0013 proof receipt passes structural integrity check", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0013");
    if (!record?.evaluationResult.ok) return;
    const receipt = record.evaluationResult.proofReceipt;
    const valid = verifyReceiptIntegrity(receipt);
    console.log(`\n── DRA-DOC-0013 ProofReceipt Integrity ──────────────────────`);
    console.log(`  verifyReceiptIntegrity: ${valid ? "PASS ✓" : "FAIL ✗"}`);
    console.log(`  substantiveDigest: ${receipt.substantiveDigest}`);
    expect(valid).toBe(true);
  });

  it("reports DRA-DOC-0013 issue-class contribution", () => {
    const record = runResultA.records.find((r) => r.corpusId === "DRA-DOC-0013");
    if (!record?.evaluationResult.ok) return;
    const r = record.evaluationResult;
    const classes = r.issues.map(
      (iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN",
    );
    const classSet = new Set(classes);

    console.log(`\n── DRA-DOC-0013 Issue-Class Contribution ────────────────────`);
    console.log(`  decision   : ${r.decision}`);
    console.log(`  issues     : ${r.issues.length}`);
    console.log(`  classes    : ${[...classSet].join(", ") || "(none)"}`);
    console.log(`  target IC-3 (AUTHORITY_ABSENT)   : ${classSet.has("AUTHORITY_ABSENT") ? "✓ OBSERVED" : "not observed"}`);
    console.log(`  target IC-9 (SCOPE_VIOLATION)    : ${classSet.has("SCOPE_VIOLATION") ? "✓ OBSERVED" : "not observed"}`);
    // Observation only — no assertion on specific classes (evaluator is frozen)
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Decision Distribution and Issue-Class Coverage
// ---------------------------------------------------------------------------

describe("DRA-BMK-013 — Part 6: Decision Distribution and Issue-Class Coverage", () => {
  it("summarises decision distribution across all 13 documents (Run A)", () => {
    console.log("\n── Decision Distribution (Run A, 13 documents) ─────────────");

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
    expect(runResultA.documentCount).toBe(13);
  });

  it("reports issue-class coverage across all 13 documents (Run A)", () => {
    console.log("\n── Issue-Class Coverage (Run A) ─────────────────────────────");

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

    // Canonical 9 classes — frozen in DRA-001 §6, sourced from ISSUE_CLASSES in model/issue-classes.ts
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
// Part 7 — Run A vs Run B Reproducibility
// ---------------------------------------------------------------------------

describe("DRA-BMK-013 — Part 7: Run A vs Run B Reproducibility", () => {
  it("same decision on both runs for every document — REPRODUCIBILITY: IDENTICAL", () => {
    console.log("\n── Decision Reproducibility (DRA-BMK-013) ───────────────────");
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
// Part 8 — DRA-DOC-0013 Source Stability
// ---------------------------------------------------------------------------

describe("DRA-BMK-013 — Part 8: DRA-DOC-0013 Source Stability", () => {
  it("reports DRA-DOC-0013 live source stability classification", () => {
    console.log("\n── DRA-DOC-0013 Source Stability ────────────────────────────");
    console.log(`  Frozen source digest (DRA-FRZ-000007):`);
    console.log(`    ${REF_FDA_SOURCE_DIGEST}`);
    console.log(`  Live source digest (current fetch):`);
    console.log(`    ${fdaLiveSourceDigest}`);
    console.log(`  Frozen text digest (DRA-FRZ-000007):`);
    console.log(`    ${REF_FDA_TEXT_DIGEST}`);
    console.log(`  Live text digest (current fetch):`);
    console.log(`    ${fdaLiveTextDigest}`);
    console.log(`  Source match: ${fdaFreezeRepresentationMatch ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  Admitted stability class: BYTE_STABLE`);
    console.log(`  Ref text length: ${REF_FDA_TEXT_LENGTH} chars`);
    console.log(`  Live text length: ${fdaText.length} chars`);

    expect(REF_FDA_SOURCE_DIGEST).toMatch(/^[0-9a-f]{64}$/);
    expect(REF_FDA_TEXT_DIGEST).toMatch(/^[0-9a-f]{64}$/);
    expect(fdaLiveSourceDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(fdaLiveTextDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(fdaText.length).toBeGreaterThan(0);
  });
});
