/**
 * DRA-ENG-023 — Steps 5 & 6: Post-Fix Measurement
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  POST-FIX MEASUREMENT — DRA-DOC-0032 RE-EVALUATION + ENGLISH CONTROL      ║
 * ║                                                                          ║
 * ║  Measures the effect of the DRA-ENG-023 Unicode-aware segmentation fix   ║
 * ║  (classify-segments.ts PUNCTUATION_ONLY test; segment-content.ts         ║
 * ║  ideographic sentence-terminator recognition) against:                  ║
 * ║    (a) the LIVE, corrected Stage 2 pipeline applied directly to the      ║
 * ║        same DRA-DOC-0032 Japanese text and its English reference         ║
 * ║        translation (segmentation/classification counts only), and       ║
 * ║    (b) a full Stages 1-7 re-evaluation of DRA-DOC-0032 through the same  ║
 * ║        governed pipeline used at admission (acquireFreezeAndEvaluate /   ║
 * ║        evaluateFrozenBenchmarkDocument, Run A / Run B determinism),      ║
 * ║        reusing the exact freeze/acquisition/corpus identifiers and       ║
 * ║        governance decisions from the original DRA-ACQ-028 Phase 2        ║
 * ║        admission test, so the ONLY variable that differs from that       ║
 * ║        admission is the corrected Stage 2 code.                         ║
 * ║                                                                          ║
 * ║  This is a RE-EVALUATION exercise, not a new acquisition: it reuses the  ║
 * ║  already-admitted DRA-DOC-0032 identity in an isolated in-memory         ║
 * ║  registry, mirroring house convention for post-engineering-fix           ║
 * ║  re-measurement (e.g. DRA-ENG-019's Stage 4 scalability closure). It     ║
 * ║  does NOT modify the real corpus registry, does NOT re-admit the         ║
 * ║  document under a new ID, and does NOT touch DRA-DOC-0033.              ║
 * ║                                                                          ║
 * ║  Per DRA-ENG-023 spec: the decision is allowed to change from the        ║
 * ║  original admission's outcome. No particular decision is assumed in     ║
 * ║  advance — whatever the corrected evaluator actually returns is         ║
 * ║  recorded verbatim below.                                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
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
import { acquireFreezeAndEvaluate, evaluateFrozenBenchmarkDocument } from "../governed-pipeline.js";
import { normaliseContent } from "../normalisation.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import {
  PRIOR_CORPUS_ENTRIES,
  CORPUS_VERSION as SHARED_CORPUS_VERSION,
} from "../../execution/__tests__/dra-bmk-023-prior-entries.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";

import { segmentContent } from "../../../claim-extraction/segment-content.js";
import { classifySegments } from "../../../claim-extraction/classify-segments.js";

const execFileAsync = promisify(execFile);

const REVIEW_TIMESTAMP = "2026-08-11T13:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T16:00:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T16:30:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION;

const AI_GUIDELINE_JA_PDF_URL = "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf";
const AI_GUIDELINE_EN_PDF_URL = "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_eng_20260116.pdf";
const EXPECTED_SHA256 = "29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0";

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-023-postfix-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath], { maxBuffer: 1024 * 1024 * 64 });
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

// Governance decisions and metadata reused verbatim from the original
// DRA-ACQ-028 Phase 2 admission (dra-acq-028-doc0032-japanese-admission.test.ts)
// — this is a re-evaluation, not a new governance review.

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-028-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [`Document fetched from ${AI_GUIDELINE_JA_PDF_URL}`, "Reused verbatim from DRA-ACQ-028 Phase 2 admission."],
  notes: "DRA-ENG-023 re-evaluation reuses the original DRA-ACQ-028 Phase 2 governance sign-off unchanged.",
});

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Public Data License (PDL) Version 1.0 (Digital Agency, Government of Japan)",
  licenceUrl: "https://www.digital.go.jp/en/resources/open_data/public_data_license_v1.0",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-028-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: ["Reused verbatim from DRA-ACQ-028 Phase 2 admission."],
  notes: "DRA-ENG-023 re-evaluation reuses the original DRA-ACQ-028 Phase 2 governance sign-off unchanged.",
});

const APPROVED_METADATA = Object.freeze({
  title:
    "AI Guidelines for the Proper Implementation of Research, Development, and Utilisation of AI, under " +
    "Article 13 of the Act on the Promotion of Research, Development, and Utilisation of AI-Related " +
    "Technologies (Japanese original; 令和7年12月19日改定)",
  publisher: "Cabinet Office, Government of Japan (内閣府)",
  publicationDate: "2025-12-19",
  domain: "GENERAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "ja",
});

const INCLUSION_RATIONALE =
  "DRA-ENG-023 post-fix re-evaluation of the already-admitted DRA-DOC-0032 (DRA-ACQ-028 Phase 2), using the " +
  "identical freeze/acquisition/corpus identifiers and governance decisions, to measure the effect of the " +
  "Unicode-aware Stage 2 segmentation fix in isolation. No new document is being admitted.";

// Prior 31-document registry, identical to the DRA-ACQ-028 Phase 2 admission
// test — reconstructed from admitted records (metadata only).

const ENTRY_0023: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0023",
  title: "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority (CMA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000026. Freeze record: DRA-FRZ-000017.",
};
const ENTRY_0024: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0024",
  title: "Regulating Artificial Intelligence: U.S. and International Approaches and Considerations for Congress",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "Congressional Research Service (CRS), Library of Congress",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000027. Freeze record: DRA-FRZ-000018.",
};
const ENTRY_0025: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0025",
  title: "Short-Term Energy Outlook (STEO) — July 2026",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "FINANCE",
  language: "en-US",
  generator: "U.S. Energy Information Administration (EIA), U.S. Department of Energy",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000028. Freeze record: DRA-FRZ-000019.",
};
const ENTRY_0026: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0026",
  title: "An analysis of the effects of sharing research data, code, and preprints on citations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "PLOS (Public Library of Science)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal.pone.0311493&type=printable",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000029. Freeze record: DRA-FRZ-000020.",
};
const ENTRY_0027: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0027",
  title: "The Metric System: Hearings Before Subcommittee No. 1 and the Committee on Science and Astronautics",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "en-US",
  generator: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo, GPO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000030. Freeze record: DRA-FRZ-000021.",
};
const ENTRY_0028: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0028",
  title: "Deciding When to Submit a 510(k) for a Change to an Existing Device",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "U.S. Food and Drug Administration (FDA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.fda.gov/media/99812/download",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000031. Freeze record: DRA-FRZ-000022.",
};
const ENTRY_0029: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0029",
  title: "Risk Factors for Legionella longbeachae Legionnaires' Disease, New Zealand",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "Centers for Disease Control and Prevention (CDC), Emerging Infectious Diseases journal",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000032. Freeze record: DRA-FRZ-000023.",
};
const ENTRY_0030: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0030",
  title: "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls for Information Systems and Organizations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000033. Freeze record: DRA-FRZ-000024.",
};
const ENTRY_0031: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0031",
  title: "NIST Special Publication 800-53 Revision 4 — Security and Privacy Controls for Federal Information Systems and Organizations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000034. Freeze record: DRA-FRZ-000025.",
};

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [
  ...PRIOR_CORPUS_ENTRIES,
  ENTRY_0023, ENTRY_0024, ENTRY_0025, ENTRY_0026, ENTRY_0027, ENTRY_0028, ENTRY_0029, ENTRY_0030, ENTRY_0031,
];

describe("DRA-ENG-023 Steps 5-6 — Post-fix measurement (DRA-DOC-0032 re-evaluation + English control)", () => {
  it(
    "measures the live corrected Stage-2 pipeline against DRA-DOC-0032's Japanese text and its English translation, and re-runs the full governed pipeline for DRA-DOC-0032",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-023 STEPS 5-6 — POST-FIX MEASUREMENT LOG         ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });
      const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-028");

      // ── Part A: direct Stage 2 measurement, live (corrected) code ─────────

      const jaReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000035",
        sourceUrl: AI_GUIDELINE_JA_PDF_URL,
        requestedBy: "DRA-ENG-023-post-fix-measurement",
        requestedAt: FREEZE_TIMESTAMP,
        expectedPublisher: "Cabinet Office",
        expectedTitle: "AI",
      });
      expect(jaReq.ok).toBe(true);
      if (!jaReq.ok) return;
      const jaFetch = await fetcher(jaReq.request, {});
      expect(jaFetch.ok).toBe(true);
      if (!jaFetch.ok) return;
      const jaDigest = computeSourceDigest(jaFetch.source.rawBytes);
      expect(jaDigest).toBe(EXPECTED_SHA256);

      const enReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-999998",
        sourceUrl: AI_GUIDELINE_EN_PDF_URL,
        requestedBy: "DRA-ENG-023-post-fix-measurement",
        requestedAt: FREEZE_TIMESTAMP,
        expectedPublisher: "Cabinet Office",
        expectedTitle: "AI",
      });
      expect(enReq.ok).toBe(true);
      if (!enReq.ok) return;
      const enFetch = await fetcher(enReq.request, {});
      expect(enFetch.ok).toBe(true);
      if (!enFetch.ok) return;

      const jaText = await extractPdfText(jaFetch.source.rawBytes);
      const enText = await extractPdfText(enFetch.source.rawBytes);

      const JAPANESE_SCRIPT_RE = /[\u3040-\u30FF\u4E00-\u9FFF]/;
      const jaCharCount = (t: string) => (t.match(new RegExp(JAPANESE_SCRIPT_RE, "g")) ?? []).length;

      const jaSegs = segmentContent(jaText);
      const jaClassified = classifySegments(jaSegs);
      const jaCounts: Record<string, number> = {};
      for (const c of jaClassified) {
        const k = c.status === "CANDIDATE" ? "CANDIDATE" : (c.exclusionReason as string);
        jaCounts[k] = (jaCounts[k] ?? 0) + 1;
      }
      const jaPunctOnly = jaClassified.filter(
        (c) => c.status === "EXCLUDED" && c.exclusionReason === "PUNCTUATION_ONLY",
      );
      const jaMisclassified = jaPunctOnly.filter((c) => JAPANESE_SCRIPT_RE.test(c.segment.text));
      const jaCandidates = jaClassified.filter((c) => c.status === "CANDIDATE");
      const jaScriptCharsExcluded = jaMisclassified.reduce((a, c) => a + jaCharCount(c.segment.text), 0);
      const jaScriptCharsRetained = jaCandidates.reduce((a, c) => a + jaCharCount(c.segment.text), 0);
      const jaLossPct =
        (jaScriptCharsExcluded / Math.max(1, jaScriptCharsExcluded + jaScriptCharsRetained)) * 100;

      console.log("── Part A: Direct Stage 2 measurement (live, corrected code) ──");
      console.log("Japanese (post-fix) breakdown:", JSON.stringify(jaCounts));
      console.log(`Japanese-script misclassified PUNCTUATION_ONLY segments: ${jaMisclassified.length}`);
      console.log(`Japanese-script residual content loss: ${jaLossPct.toFixed(1)}%`);
      console.log(`Content recovered vs pre-fix oracle: ${(75.4 - jaLossPct).toFixed(1)} percentage points`);

      // Pre-fix oracle (frozen, historical): 407 segs / 183 PUNCTUATION_ONLY /
      // 182 misclassified / 70 candidates / 75.4% loss.
      //
      // Post-fix, TOTAL segment count also increases beyond 407 (not just
      // classification changes within the same 407): the ideographic
      // sentence-terminator fix means multi-sentence Japanese lines that were
      // previously emitted as ONE combined SENTENCE segment (because the
      // pre-fix splitter recognised no boundary inside them) are now split
      // into their true multiple sentences, each becoming its own segment.
      // This is a genuine, intended, semantics-improving side effect of
      // closing the sentence-boundary defect (finer-grained, more accurate
      // statement units) — not a regression or double-count.
      console.log(`Total segment count: pre-fix=407, post-fix=${jaSegs.length} (ideographic sentence-boundary splitting)`);
      expect(jaSegs.length).toBeGreaterThan(407);
      expect(jaMisclassified.length).toBe(0); // full recovery of the demonstrated PUNCTUATION_ONLY defect
      expect(Math.round(jaLossPct * 10) / 10).toBe(0);
      expect(jaCounts["CANDIDATE"]).toBeGreaterThan(70); // recovered content now becomes candidates

      const enSegs = segmentContent(enText);
      const enClassified = classifySegments(enSegs);
      const enCounts: Record<string, number> = {};
      for (const c of enClassified) {
        const k = c.status === "CANDIDATE" ? "CANDIDATE" : (c.exclusionReason as string);
        enCounts[k] = (enCounts[k] ?? 0) + 1;
      }
      console.log("English control (post-fix) breakdown:", JSON.stringify(enCounts));
      console.log("English control (pre-fix, unchanged) breakdown was: {\"CANDIDATE\":316,\"EMPTY\":198,\"SHORT_FRAGMENT\":20}");

      // No Latin-script regression: identical to the frozen pre-fix oracle.
      expect(enSegs.length).toBe(534);
      expect(enCounts["CANDIDATE"]).toBe(316);
      expect(enCounts["SHORT_FRAGMENT"]).toBe(20);
      expect(enCounts["EMPTY"]).toBe(198);
      expect(enCounts["PUNCTUATION_ONLY"] ?? 0).toBe(0);

      // Latin sentence-boundary behaviour is unchanged (fix is additive).
      const latinSample =
        "The guideline was approved by Dr. Smith on Jan. 5, 2026. It applies broadly. Is this final? Yes!";
      const latinSentences = segmentContent(latinSample)
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text);
      expect(latinSentences).toEqual([
        "The guideline was approved by Dr. Smith on Jan. 5, 2026.",
        "It applies broadly.",
        "Is this final?",
        "Yes!",
      ]);

      // Ideographic sentence-boundary recognition, direct proof.
      const jaSentenceSample = "これは文です。これも文です！質問ですか？これは、区切りではありません。";
      const jaSentences = segmentContent(jaSentenceSample)
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text);
      console.log("Ideographic sentence-boundary sample (post-fix):", jaSentences);
      expect(jaSentences).toEqual([
        "これは文です。",
        "これも文です！",
        "質問ですか？",
        "これは、区切りではありません。",
      ]);

      // ── Part B: full Stages 1-7 re-evaluation (Run A / Run B) ─────────────

      console.log("\n── Part B: Full governed-pipeline re-evaluation (DRA-DOC-0032) ──");

      const registry = new CorpusRegistry();
      for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
      for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);
      expect(registry.size).toBe(31);

      const protocol = buildMinimalProtocol({
        protocolId: "DRA-PROTO-ENG-023",
        protocolStatus: "APPROVED",
        targetCorpusSize: 32,
        permittedDocumentTypes: [
          "SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
        ],
        permittedLanguages: ["en", "en-GB", "en-US", "es", "fr", "ja"],
      });

      const pipelineResult = await acquireFreezeAndEvaluate(
        {
          request: jaReq.request,
          officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
          licenceAssessment: LICENCE_ASSESSMENT,
          approvedMetadata: APPROVED_METADATA,
          corpusDocumentId: "DRA-DOC-0032",
          freezeRecordId: "DRA-FRZ-000026",
          frozenBy: "DRA-ENG-023-post-fix-operator",
          benchmarkVersion: CORPUS_VERSION,
          inclusionRationale: INCLUSION_RATIONALE,
        },
        { fetcher, pdfExtractor: extractPdfText, registry, protocol, fixedTimestamp: FREEZE_TIMESTAMP },
      );

      if (!pipelineResult.ok) {
        console.error("Pipeline FAILED at stage:", pipelineResult.stage, JSON.stringify(pipelineResult.errors));
      }
      expect(pipelineResult.ok).toBe(true);
      if (!pipelineResult.ok) return;
      const { result: runA } = pipelineResult;

      expect(runA.evaluationResult.ok).toBe(true);
      const evalA = runA.evaluationResult.ok ? runA.evaluationResult : null;
      if (!evalA) return;

      const pipeLogA = evalA.pipeline as Record<string, unknown>;
      const s2LogA = pipeLogA["stage2"] as Record<string, unknown> | undefined;
      const stmtsLogA = (s2LogA?.["statements"] ?? s2LogA?.["claims"] ?? []) as unknown[];
      const s6LogA = pipeLogA["consistencyCheck"] as Record<string, unknown> | undefined;
      const issuesArrLogA = (s6LogA?.["issues"] ?? (evalA as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
        Record<string, unknown>
      >;
      const issueClassesLogA = Array.from(
        new Set(issuesArrLogA.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
      );

      console.log("  Post-fix decision       :", runA.decision);
      console.log("  Post-fix statementCount :", stmtsLogA.length, "(pre-fix admission was 70 — see DRA-ACQ-028 Phase 2 report)");
      console.log("  Post-fix issueCount     :", issuesArrLogA.length);
      console.log("  Post-fix issueClasses   :", JSON.stringify(issueClassesLogA));

      expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(runA.decision);
      // No expected decision is assumed in advance — see docblock.

      const receiptIntegrityA = verifyReceiptIntegrity(evalA.proofReceipt as never);
      expect(receiptIntegrityA).toBe(true);

      // ── Run B: determinism re-evaluation via the frozen record ───────────

      const normResultB = await normaliseContent(
        jaFetch.source.rawBytes,
        "application/pdf",
        jaDigest,
        extractPdfText,
      );
      expect(normResultB.ok).toBe(true);
      if (!normResultB.ok) return;

      const runBFinal = evaluateFrozenBenchmarkDocument({
        freezeRecord: runA.freeze,
        rawBytes: jaFetch.source.rawBytes,
        normalisedText: normResultB.document.text,
        approvedMetadata: APPROVED_METADATA,
        registry,
        fixedTimestamp: RUN_B_TIMESTAMP,
      });

      if (!runBFinal.ok) {
        console.error("Run B FAILED at stage:", runBFinal.stage, JSON.stringify(runBFinal.errors));
      }
      expect(runBFinal.ok).toBe(true);
      if (!runBFinal.ok) return;
      const runB = runBFinal.result;
      expect(runB.evaluationResult.ok).toBe(true);
      const evalB = runB.evaluationResult.ok ? runB.evaluationResult : null;
      if (!evalB) return;

      const pipeLogB = evalB.pipeline as Record<string, unknown>;
      const s2LogB = pipeLogB["stage2"] as Record<string, unknown> | undefined;
      const stmtsLogB = (s2LogB?.["statements"] ?? s2LogB?.["claims"] ?? []) as unknown[];
      const s6LogB = pipeLogB["consistencyCheck"] as Record<string, unknown> | undefined;
      const issuesArrLogB = (s6LogB?.["issues"] ?? (evalB as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
        Record<string, unknown>
      >;

      const receiptIntegrityB = verifyReceiptIntegrity(evalB.proofReceipt as never);
      expect(receiptIntegrityB).toBe(true);

      console.log("\n── Determinism Comparison (Run A vs Run B) ──────────────────");
      console.log(`  decision match: ${runA.decision === runB.decision}`);
      expect(runB.decision).toBe(runA.decision);
      expect(stmtsLogB.length).toBe(stmtsLogA.length);
      expect(issuesArrLogB.length).toBe(issuesArrLogA.length);
      expect(runB.proofReference.proofReceiptSubstantiveDigest).toBe(
        runA.proofReference.proofReceiptSubstantiveDigest,
      );

      console.log("\n── DRA-ENG-023 Post-Fix Measurement Complete ────────────────");
      console.log("  Decision (Run A = Run B):", runA.decision);
      console.log("  Statement count:", stmtsLogA.length);
      console.log("  Issue count:", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
    },
    280_000,
  );
});
