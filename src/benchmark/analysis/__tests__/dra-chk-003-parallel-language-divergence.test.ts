/**
 * DRA-CHK-003 — Parallel-Language Divergence Localization
 *
 * Checkpoint: DRA-CHK-003
 * Date: 2026-08-09
 *
 * Purpose: Trace DRA-DOC-0021 (EN) and DRA-DOC-0018 (ES) — the same EC/HLEG-AI
 * "Ethics Guidelines for Trustworthy AI" publication in its two officially
 * designated parallel-language editions — through the frozen Version 1
 * pipeline, and identify the earliest observable stage at which their
 * representations materially diverge in a way relevant to the seven English
 * IC-5 (EVIDENCE_INADEQUATE) findings established in DRA-BMK-021.
 *
 * DIAGNOSTIC CHECKPOINT ONLY. This file:
 *   - does NOT modify Evaluator Version 1, normalisation, or acquisition logic;
 *   - does NOT modify any frozen corpus artefact, DRA-DOC-0018/0021, or any
 *     historical benchmark result;
 *   - does NOT introduce a fix, workaround, translation layer, or
 *     language-specific rule;
 *   - does NOT tune the system to make EN and ES agree;
 *   - does NOT acquire a new document or start a new acquisition programme.
 *
 * All pipeline stages are invoked directly (mirroring evaluateDocument's
 * internal call order) purely to READ intermediate stage output that
 * evaluateDocument() does not otherwise expose at this granularity, and to
 * compare it across languages. No stage function signature, behaviour, or
 * input is altered.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { normaliseEvaluationRequest } from "../../../normalisation/index.js";
import { extractClaims } from "../../../claim-extraction/index.js";
import { resolveAuthority } from "../../../authority-resolution/index.js";
import { linkEvidence } from "../../../evidence-linkage/index.js";
import { assessMateriality } from "../../../materiality-assessment/index.js";
import { checkConsistency } from "../../../consistency-check/index.js";
import { deriveDecision } from "../../../pipeline/derive-decision.js";
import type { Stage2Success } from "../../../claim-extraction/index.js";
import type { Stage3Success } from "../../../authority-resolution/index.js";
import type { Stage4Success } from "../../../evidence-linkage/index.js";
import type { Stage5Success } from "../../../materiality-assessment/index.js";
import type { Stage6Success } from "../../../consistency-check/index.js";
import type { NormalisedEvaluationRequest } from "../../../normalisation/index.js";

import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";

// ---------------------------------------------------------------------------
// Constants (facts, not assumptions — reproduced from DRA-BMK-021)
// ---------------------------------------------------------------------------

const FIXED_TS = "2026-08-09T20:00:00.000Z";
const EC_URL_ES = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423"; // DRA-DOC-0018
const EC_URL_EN = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419"; // DRA-DOC-0021

const EN_EXPECTED_DECISION = "REVIEW";
const EN_EXPECTED_ISSUE_COUNT = 7;
const ES_EXPECTED_DECISION = "SUPPORTED";
const ES_EXPECTED_ISSUE_COUNT = 0;

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-chk003-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function buildEvalRequest(id: string, title: string, generatedText: string, sourceText: string): unknown {
  const sourceId = `sdoc-${id}-src`;
  return {
    id: `eval-${id}`,
    requestedAt: FIXED_TS,
    generatedDocument: {
      id: `gdoc-${id}`,
      title,
      content: generatedText,
      sourceDocumentIds: [sourceId],
      generatedAt: FIXED_TS,
    },
    sourceDocuments: [
      { id: sourceId, title: `Source: ${title}`, content: sourceText, format: "PLAIN_TEXT" },
    ],
  };
}

/**
 * Runs Stages 1-6 directly (same call order as evaluateDocument) and returns
 * every intermediate stage result, not just the final decision. Read-only:
 * calls the exact same frozen stage functions evaluateDocument() calls.
 */
function runFullPipeline(input: unknown) {
  const s1 = normaliseEvaluationRequest(input);
  if (!s1.ok) throw new Error("Stage 1 failed: " + JSON.stringify(s1.errors));
  const s2 = extractClaims(s1.normalisedRequest);
  if (!s2.ok) throw new Error("Stage 2 failed: " + JSON.stringify(s2.errors));
  const s3 = resolveAuthority(s1.normalisedRequest, s2);
  if (!s3.ok) throw new Error("Stage 3 failed: " + JSON.stringify(s3.errors));
  const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
  if (!s4.ok) throw new Error("Stage 4 failed: " + JSON.stringify(s4.errors));
  const s5 = assessMateriality(s1.normalisedRequest, s2, s3, s4);
  if (!s5.ok) throw new Error("Stage 5 failed: " + JSON.stringify(s5.errors));
  const s6 = checkConsistency(s1.normalisedRequest, s2, s3, s4, s5);
  if (!s6.ok) throw new Error("Stage 6 failed: " + JSON.stringify(s6.errors));
  return {
    normalisedRequest: s1.normalisedRequest as NormalisedEvaluationRequest,
    stage2: s2 as Stage2Success,
    stage3: s3 as Stage3Success,
    stage4: s4 as Stage4Success,
    stage5: s5 as Stage5Success,
    stage6: s6 as Stage6Success,
  };
}

function spanText(content: string, spanRef: { startOffset?: number; endOffset?: number } | undefined): string | null {
  if (!spanRef || spanRef.startOffset === undefined || spanRef.endOffset === undefined) return null;
  return content.slice(spanRef.startOffset, spanRef.endOffset);
}

/** Language-independent anchors: standalone numerals, and Article/Section/Chapter + number. */
function extractAnchors(text: string): string[] {
  const anchors = new Set<string>();
  for (const m of text.matchAll(/\b\d+(?:[.,]\d+)?%?\b/g)) {
    if (m[0].length >= 1) anchors.add(m[0]);
  }
  for (const m of text.matchAll(/\b(?:Article|Artículo|Chapter|Capítulo|Section|Sección)\s+\d+\b/gi)) {
    anchors.add(
      m[0]
        .replace(/^(Article|Artículo)/i, "ART")
        .replace(/^(Chapter|Capítulo)/i, "CH")
        .replace(/^(Section|Sección)/i, "SEC"),
    );
  }
  return [...anchors];
}

/**
 * Body-chapter boundary offsets, found empirically via the language-independent
 * Roman-numeral chapter marker pattern "<roman>. Chapter/Capítulo <roman>:"
 * which appears identically (as a bare Roman numeral) in both editions.
 * Each document has this marker twice: once in the table of contents, once at
 * the actual chapter heading. The larger (second) offset is the body heading.
 */
function findBodyChapterBoundaries(text: string): { chapterI: number; chapterII: number; chapterIII: number } {
  const re = /\n\s*(I{1,3})\.\s*\n?\s*(?:Chapter|Capítulo)\s+(I{1,3})\s*:/gi;
  const byNumeral = new Map<string, number[]>();
  for (const m of text.matchAll(re)) {
    const numeral = m[1].toUpperCase();
    const arr = byNumeral.get(numeral) ?? [];
    arr.push(m.index ?? -1);
    byNumeral.set(numeral, arr);
  }
  const last = (numeral: string): number => {
    const arr = byNumeral.get(numeral);
    if (!arr || arr.length === 0) throw new Error(`No chapter marker found for numeral "${numeral}"`);
    return Math.max(...arr);
  };
  return { chapterI: last("I"), chapterII: last("II"), chapterIII: last("III") };
}

type SectionName = "PREAMBLE_AND_TOC" | "CHAPTER_I" | "CHAPTER_II" | "CHAPTER_III_AND_ANNEXES";

function sectionFor(offset: number, b: { chapterI: number; chapterII: number; chapterIII: number }): SectionName {
  if (offset < b.chapterI) return "PREAMBLE_AND_TOC";
  if (offset < b.chapterII) return "CHAPTER_I";
  if (offset < b.chapterIII) return "CHAPTER_II";
  return "CHAPTER_III_AND_ANNEXES";
}

// ---------------------------------------------------------------------------
// Test fixture state
// ---------------------------------------------------------------------------

let esText = "";
let enText = "";
let esPipeline: ReturnType<typeof runFullPipeline>;
let enPipeline: ReturnType<typeof runFullPipeline>;
let esBoundaries: { chapterI: number; chapterII: number; chapterIII: number };
let enBoundaries: { chapterI: number; chapterII: number; chapterIII: number };
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const realFetcher = createHttpFetcher({
      timeoutMs: 120_000,
      maxRedirects: 5,
      maxBytes: 15_000_000,
      userAgent: "DRA-CHK-003/1.0",
    });
    // Reuses the DRA-BMK-021 disk cache — no new live fetch is required if it
    // is warm; if cold, this performs the identical fetch DRA-BMK-021 already
    // performed and verified (same URLs, same acquisition IDs).
    const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-021");

    async function fetchAndExtract(acquisitionId: string, url: string, label: string) {
      const req = {
        acquisitionId,
        sourceUrl: url,
        requestedBy: "DRA-CHK-003-operator",
        requestedAt: FIXED_TS,
        expectedPublisher: "European Commission",
        expectedTitle: "Ethics Guidelines for Trustworthy AI",
      };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) throw new Error(`${label} fetch failed: ${fetchRes.code}`);
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) throw new Error(`${label} normalisation failed: ${norm.message}`);
      return norm.document.text;
    }

    [esText, enText] = await Promise.all([
      fetchAndExtract("DRA-ACQ-000021", EC_URL_ES, "ES"),
      fetchAndExtract("DRA-ACQ-000024", EC_URL_EN, "EN"),
    ]);

    esPipeline = runFullPipeline(
      buildEvalRequest("DRA-DOC-0018", "Directrices éticas para una IA fiable", esText, esText),
    );
    enPipeline = runFullPipeline(
      buildEvalRequest("DRA-DOC-0021", "Ethics Guidelines for Trustworthy AI", enText, enText),
    );

    esBoundaries = findBodyChapterBoundaries(esText);
    enBoundaries = findBodyChapterBoundaries(enText);
  } catch (err) {
    setupError = String(err);
  }
}, 300_000);

// ---------------------------------------------------------------------------
// Part 0: Setup and outcome-reproduction sanity check
// ---------------------------------------------------------------------------

describe("DRA-CHK-003 — Part 0: Setup", () => {
  it("completes without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("stage 6 (consistency check) succeeded for both editions", () => {
    expect(enPipeline.stage6.issues).toBeDefined();
    expect(esPipeline.stage6.issues).toBeDefined();
  });
});

describe("DRA-CHK-003 — Part 0b: Decision reproduction", () => {
  it("EN reproduces REVIEW / 7 EVIDENCE_INADEQUATE issues", () => {
    const decision = deriveDecision(enPipeline.stage6.issues);
    expect(decision.decision).toBe(EN_EXPECTED_DECISION);
    expect(enPipeline.stage6.issues.length).toBe(EN_EXPECTED_ISSUE_COUNT);
    for (const iss of enPipeline.stage6.issues) expect((iss as any).issueClass).toBe("EVIDENCE_INADEQUATE");
  });

  it("ES reproduces SUPPORTED / 0 issues", () => {
    const decision = deriveDecision(esPipeline.stage6.issues);
    expect(decision.decision).toBe(ES_EXPECTED_DECISION);
    expect(esPipeline.stage6.issues.length).toBe(ES_EXPECTED_ISSUE_COUNT);
  });
});

// ---------------------------------------------------------------------------
// Part 1: Normalised-document structure comparison
// ---------------------------------------------------------------------------

describe("DRA-CHK-003 — Part 1: Normalised-document structure", () => {
  it("reports normalised text lengths and confirms Stage 1 preserves content length (no truncation)", () => {
    const enContent = enPipeline.normalisedRequest.generatedDocument.content;
    const esContent = esPipeline.normalisedRequest.generatedDocument.content;
    console.log("\n── Part 1: Normalised document structure ──────────────────────");
    console.log(`  EN normalised length: ${enContent.length} (raw extracted: ${enText.length})`);
    console.log(`  ES normalised length: ${esContent.length} (raw extracted: ${esText.length})`);
    console.log(`  length delta: ES is ${(((esContent.length - enContent.length) / enContent.length) * 100).toFixed(1)}% longer than EN`);
    // Stage 1 only trims/line-ending-normalises; it must not materially change length.
    expect(Math.abs(enContent.length - enText.length)).toBeLessThan(enText.length * 0.02);
    expect(Math.abs(esContent.length - esText.length)).toBeLessThan(esText.length * 0.02);
  });

  it("confirms the published ES 'X de abril de 2019' placeholder anomaly is present and untouched", () => {
    expect(esText).toContain("Documento publicado el X de abril de 2019");
    console.log("  ES placeholder anomaly 'X de abril de 2019' confirmed present verbatim (not corrected by this checkpoint).");
  });

  it("compares paragraph/block counts (blank-line-delimited blocks)", () => {
    const enBlocks = enText.split(/\n\s*\n+/).filter((b) => b.trim().length > 0);
    const esBlocks = esText.split(/\n\s*\n+/).filter((b) => b.trim().length > 0);
    console.log(`  EN blank-line-delimited blocks: ${enBlocks.length}`);
    console.log(`  ES blank-line-delimited blocks: ${esBlocks.length}`);
    console.log(`  block-count delta: ${esBlocks.length - enBlocks.length} (${(((esBlocks.length - enBlocks.length) / enBlocks.length) * 100).toFixed(1)}%)`);
    expect(enBlocks.length).toBeGreaterThan(0);
    expect(esBlocks.length).toBeGreaterThan(0);
  });

  it("locates language-independent Roman-numeral chapter boundaries in both editions at proportionally similar depth", () => {
    console.log("\n── Chapter boundaries (body heading, 2nd occurrence of each Roman numeral) ──");
    console.log(`  EN: Chapter I @ ${enBoundaries.chapterI} (${((enBoundaries.chapterI / enText.length) * 100).toFixed(1)}%), ` +
      `Chapter II @ ${enBoundaries.chapterII} (${((enBoundaries.chapterII / enText.length) * 100).toFixed(1)}%), ` +
      `Chapter III @ ${enBoundaries.chapterIII} (${((enBoundaries.chapterIII / enText.length) * 100).toFixed(1)}%), doc length ${enText.length}`);
    console.log(`  ES: Chapter I @ ${esBoundaries.chapterI} (${((esBoundaries.chapterI / esText.length) * 100).toFixed(1)}%), ` +
      `Chapter II @ ${esBoundaries.chapterII} (${((esBoundaries.chapterII / esText.length) * 100).toFixed(1)}%), ` +
      `Chapter III @ ${esBoundaries.chapterIII} (${((esBoundaries.chapterIII / esText.length) * 100).toFixed(1)}%), doc length ${esText.length}`);
    // Sanity: boundaries strictly increasing and within document bounds.
    expect(enBoundaries.chapterI).toBeLessThan(enBoundaries.chapterII);
    expect(enBoundaries.chapterII).toBeLessThan(enBoundaries.chapterIII);
    expect(enBoundaries.chapterIII).toBeLessThan(enText.length);
    expect(esBoundaries.chapterI).toBeLessThan(esBoundaries.chapterII);
    expect(esBoundaries.chapterII).toBeLessThan(esBoundaries.chapterIII);
    expect(esBoundaries.chapterIII).toBeLessThan(esText.length);
  });
});

// ---------------------------------------------------------------------------
// Part 2: Statement extraction / segmentation
// ---------------------------------------------------------------------------

const SECTIONS: SectionName[] = ["PREAMBLE_AND_TOC", "CHAPTER_I", "CHAPTER_II", "CHAPTER_III_AND_ANNEXES"];

describe("DRA-CHK-003 — Part 2: Statement extraction / segmentation", () => {
  it("reproduces the exact DRA-BMK-021 statement counts (2176 EN / 2546 ES)", () => {
    expect(enPipeline.stage2.statements.length).toBe(2176);
    expect(esPipeline.stage2.statements.length).toBe(2546);
  });

  it("reports statement-count and density distribution by major (Roman-numeral) section for both languages", () => {
    function sectionLengths(b: { chapterI: number; chapterII: number; chapterIII: number }, docLen: number) {
      return {
        PREAMBLE_AND_TOC: b.chapterI,
        CHAPTER_I: b.chapterII - b.chapterI,
        CHAPTER_II: b.chapterIII - b.chapterII,
        CHAPTER_III_AND_ANNEXES: docLen - b.chapterIII,
      };
    }
    const enLens = sectionLengths(enBoundaries, enText.length);
    const esLens = sectionLengths(esBoundaries, esText.length);

    const enCounts: Record<SectionName, number> = { PREAMBLE_AND_TOC: 0, CHAPTER_I: 0, CHAPTER_II: 0, CHAPTER_III_AND_ANNEXES: 0 };
    const esCounts: Record<SectionName, number> = { PREAMBLE_AND_TOC: 0, CHAPTER_I: 0, CHAPTER_II: 0, CHAPTER_III_AND_ANNEXES: 0 };

    for (const st of enPipeline.stage2.statements) {
      const off = st.spanRef?.startOffset ?? -1;
      if (off < 0) continue;
      enCounts[sectionFor(off, enBoundaries)]++;
    }
    for (const st of esPipeline.stage2.statements) {
      const off = st.spanRef?.startOffset ?? -1;
      if (off < 0) continue;
      esCounts[sectionFor(off, esBoundaries)]++;
    }

    console.log("\n── Part 2: Statement count / density by major section ─────────");
    console.log("  Section                    EN count  EN density/1k   ES count  ES density/1k   Δcount");
    let totalDelta = 0;
    for (const s of SECTIONS) {
      const enDensity = (enCounts[s] / enLens[s as keyof typeof enLens]) * 1000;
      const esDensity = (esCounts[s] / esLens[s as keyof typeof esLens]) * 1000;
      const delta = esCounts[s] - enCounts[s];
      totalDelta += delta;
      console.log(
        `  ${s.padEnd(26)} ${String(enCounts[s]).padStart(8)}  ${enDensity.toFixed(2).padStart(13)}   ` +
        `${String(esCounts[s]).padStart(8)}  ${esDensity.toFixed(2).padStart(13)}   ${String(delta).padStart(6)}`,
      );
    }
    console.log(`  TOTAL statement delta (ES-EN) across sections: ${totalDelta} (full-corpus delta: ${esPipeline.stage2.statements.length - enPipeline.stage2.statements.length})`);

    // The per-section deltas must sum to the whole-document delta (sanity check
    // on the section-bucketing method, not a behavioural assertion).
    expect(totalDelta).toBe(esPipeline.stage2.statements.length - enPipeline.stage2.statements.length);
  });

  it("inspects sentence/statement boundary behaviour: does ES tend to segment shorter statements than EN (average length comparison)?", () => {
    const enAvgLen = enPipeline.stage2.statements.reduce((sum, s) => sum + s.text.length, 0) / enPipeline.stage2.statements.length;
    const esAvgLen = esPipeline.stage2.statements.reduce((sum, s) => sum + s.text.length, 0) / esPipeline.stage2.statements.length;
    console.log(`\n  EN average statement length: ${enAvgLen.toFixed(1)} chars`);
    console.log(`  ES average statement length: ${esAvgLen.toFixed(1)} chars`);
    console.log(`  EN total statement-text chars: ${enPipeline.stage2.statements.reduce((s, st) => s + st.text.length, 0)}`);
    console.log(`  ES total statement-text chars: ${esPipeline.stage2.statements.reduce((s, st) => s + st.text.length, 0)}`);
    expect(enAvgLen).toBeGreaterThan(0);
    expect(esAvgLen).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Part 3-6: Structured diagnostic record for each of the 7 EN IC-5 findings
// ---------------------------------------------------------------------------

interface DiagnosticRecord {
  issueId: string;
  enStatementId: string;
  enStatementIndex: number;
  enSection: SectionName;
  enText: string | null;
  enEvidenceClassification: string;
  enEvidenceSpanCount: number;
  enLinkageRule: string;
  enAuthorityClassification: string;
  enMaterialityClassification: string;
  ic5TriggerCondition: string;
  esCounterpartStatus: "CONFIRMED" | "PROBABLE" | "NOT_FOUND" | "UNRESOLVED";
  esSection: SectionName | null;
  esStatementId: string | null;
  esText: string | null;
  esEvidenceClassification: string | null;
  esAuthorityClassification: string | null;
  esMaterialityClassification: string | null;
  observedDifference: string;
  earliestDivergence:
    | "SOURCE_CONTENT_DIFFERENCE"
    | "NORMALISATION_DIFFERENCE"
    | "SEGMENTATION_DIFFERENCE"
    | "EVIDENCE_LINKAGE_DIFFERENCE"
    | "STAGE5_BEHAVIOUR_DIFFERENCE"
    | "UNRESOLVED";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sensitivitySignal:
    | "CONTENT_DIFFERENCE"
    | "SEGMENTATION_SENSITIVITY"
    | "EVIDENCE_LINKAGE_SENSITIVITY"
    | "LANGUAGE_SENSITIVITY"
    | "UNRESOLVED";
}

let diagnosticRecords: DiagnosticRecord[] = [];

describe("DRA-CHK-003 — Part 3-6: Structured diagnostic record for the 7 EN IC-5 findings", () => {
  it("builds one structured diagnostic record per finding", () => {
    const enEvidenceById = new Map(enPipeline.stage4.evidenceRecords.map((r) => [String(r.statementId), r]));
    const enAuthorityById = new Map(enPipeline.stage3.authorityRecords.map((r) => [String(r.statementId), r]));
    const enMaterialityById = new Map(enPipeline.stage5.materialityRecords.map((r) => [String(r.statementId), r]));
    const enStatementById = new Map(enPipeline.stage2.statements.map((s) => [String(s.id), s]));

    const esStatements = esPipeline.stage2.statements;
    const esEvidenceById = new Map(esPipeline.stage4.evidenceRecords.map((r) => [String(r.statementId), r]));
    const esAuthorityById = new Map(esPipeline.stage3.authorityRecords.map((r) => [String(r.statementId), r]));
    const esMaterialityById = new Map(esPipeline.stage5.materialityRecords.map((r) => [String(r.statementId), r]));

    diagnosticRecords = enPipeline.stage6.issues.map((issue: any) => {
      const stId = issue.affectedStatementIds[0] as string;
      const statement = enStatementById.get(stId)!;
      const text = spanText(enPipeline.normalisedRequest.generatedDocument.content, statement.spanRef) ?? statement.text;
      const enEv = enEvidenceById.get(stId)!;
      const enAr = enAuthorityById.get(stId)!;
      const enMr = enMaterialityById.get(stId)!;
      const enSection = sectionFor(statement.spanRef?.startOffset ?? -1, enBoundaries);

      const anchors = extractAnchors(text);

      // Search ES for a structurally corresponding statement using
      // language-independent anchors within a proportional-position window.
      let esStatus: DiagnosticRecord["esCounterpartStatus"] = "NOT_FOUND";
      let esText2: string | null = null;
      let esStId: string | null = null;
      let esSectionResult: SectionName | null = null;

      if (anchors.length > 0) {
        const frac = statement.statementIndex / Math.max(1, enPipeline.stage2.statements.length - 1);
        const centerIdx = Math.round(frac * Math.max(0, esStatements.length - 1));
        const windowRadius = Math.max(8, Math.round(esStatements.length * 0.1));
        const lo = Math.max(0, centerIdx - windowRadius);
        const hi = Math.min(esStatements.length - 1, centerIdx + windowRadius);
        let bestMatch: { idx: number; shared: number } | null = null;
        for (let i = lo; i <= hi; i++) {
          const esSt = esStatements[i];
          const candidateText = spanText(esPipeline.normalisedRequest.generatedDocument.content, esSt.spanRef) ?? esSt.text;
          const esAnchors = extractAnchors(candidateText);
          const shared = anchors.filter((a) => esAnchors.includes(a) && a.length >= 2).length; // require >=2-char anchors to avoid single-digit noise
          if (shared > 0 && (!bestMatch || shared > bestMatch.shared)) bestMatch = { idx: i, shared };
        }
        if (bestMatch && bestMatch.shared >= 2) {
          esStatus = "CONFIRMED";
          esStId = String(esStatements[bestMatch.idx].id);
          esText2 = spanText(esPipeline.normalisedRequest.generatedDocument.content, esStatements[bestMatch.idx].spanRef) ?? esStatements[bestMatch.idx].text;
          esSectionResult = sectionFor(esStatements[bestMatch.idx].spanRef?.startOffset ?? -1, esBoundaries);
        } else if (bestMatch && bestMatch.shared === 1) {
          esStatus = "PROBABLE";
          esStId = String(esStatements[bestMatch.idx].id);
          esText2 = spanText(esPipeline.normalisedRequest.generatedDocument.content, esStatements[bestMatch.idx].spanRef) ?? esStatements[bestMatch.idx].text;
          esSectionResult = sectionFor(esStatements[bestMatch.idx].spanRef?.startOffset ?? -1, esBoundaries);
        } else {
          esStatus = "NOT_FOUND"; // no shared anchor within the window — cannot be confirmed without guessing
        }
      } else {
        esStatus = "UNRESOLVED"; // no extractable language-independent anchor at all — no defensible search is possible
      }

      const esEv = esStId ? esEvidenceById.get(esStId) : undefined;
      const esAr = esStId ? esAuthorityById.get(esStId) : undefined;
      const esMr = esStId ? esMaterialityById.get(esStId) : undefined;

      let earliestDivergence: DiagnosticRecord["earliestDivergence"] = "UNRESOLVED";
      let observedDifference = "";
      let confidence: DiagnosticRecord["confidence"] = "LOW";
      let sensitivitySignal: DiagnosticRecord["sensitivitySignal"] = "UNRESOLVED";

      if (esStatus === "CONFIRMED" && esEv && esMr) {
        if (esMr.classification !== "HIGH" && esMr.classification !== "CRITICAL") {
          earliestDivergence = "STAGE5_BEHAVIOUR_DIFFERENCE";
          observedDifference = `EN materiality=${enMr.classification} vs ES materiality=${esMr.classification} for corresponding statements — Stage 5 classified the two language variants of the same underlying claim differently, which alone changes whether IC-5 can fire.`;
          confidence = "MEDIUM";
          sensitivitySignal = "SEGMENTATION_SENSITIVITY";
        } else if (esEv.classification !== enEv.classification) {
          earliestDivergence = "EVIDENCE_LINKAGE_DIFFERENCE";
          observedDifference = `EN evidence=${enEv.classification} vs ES evidence=${esEv.classification} for corresponding HIGH-materiality statements — Stage 4 linked evidence differently despite matching materiality, which is the direct precondition for the EN-only IC-5 firing.`;
          confidence = "MEDIUM";
          sensitivitySignal = "EVIDENCE_LINKAGE_SENSITIVITY";
        } else {
          earliestDivergence = "UNRESOLVED";
          observedDifference = "ES corresponding statement carries the same materiality and evidence classification as EN, yet ES produced no issue for it — the residual difference is not explained by any single-stage classification captured here.";
          confidence = "LOW";
          sensitivitySignal = "UNRESOLVED";
        }
      } else if (esStatus === "PROBABLE" && esEv && esMr) {
        earliestDivergence = "UNRESOLVED";
        observedDifference = `A probable (single-anchor, not confirmed) ES counterpart was found: materiality=${esMr.classification}, evidence=${esEv.classification}. Confidence is insufficient to assert a stage-level cause.`;
        confidence = "LOW";
        sensitivitySignal = "UNRESOLVED";
      } else if (esStatus === "NOT_FOUND") {
        earliestDivergence = "SEGMENTATION_DIFFERENCE";
        observedDifference = "No ES statement sharing a language-independent anchor was found within the proportional-position search window — consistent with (but not proof of) the EN and ES editions splitting/merging this passage into differently-bounded statements, or the passage occupying a structurally different position across editions.";
        confidence = "LOW";
        sensitivitySignal = "SEGMENTATION_SENSITIVITY";
      } else {
        earliestDivergence = "UNRESOLVED";
        observedDifference = "EN statement text contains no language-independent anchor (no numeral, date, or Article/Section reference) — no defensible ES search is possible without translation, which this checkpoint must not perform.";
        confidence = "LOW";
        sensitivitySignal = "UNRESOLVED";
      }

      return {
        issueId: issue.id,
        enStatementId: stId,
        enStatementIndex: statement.statementIndex,
        enSection,
        enText: text,
        enEvidenceClassification: enEv.classification,
        enEvidenceSpanCount: enEv.evidenceSpans.length,
        enLinkageRule: enEv.linkageRule,
        enAuthorityClassification: enAr.classification,
        enMaterialityClassification: enMr.classification,
        ic5TriggerCondition: `materiality=${enMr.classification} (HIGH required) AND evidence=${enEv.classification} (NO_DOCUMENT_EVIDENCE or AMBIGUOUS_EVIDENCE_LINK required) AND authority=${enAr.classification} (must NOT be NO_IDENTIFIABLE_SOURCE)`,
        esCounterpartStatus: esStatus,
        esSection: esSectionResult,
        esStatementId: esStId,
        esText: esText2,
        esEvidenceClassification: esEv?.classification ?? null,
        esAuthorityClassification: esAr?.classification ?? null,
        esMaterialityClassification: esMr?.classification ?? null,
        observedDifference,
        earliestDivergence,
        confidence,
        sensitivitySignal,
      } satisfies DiagnosticRecord;
    });

    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("  Structured diagnostic records — 7 EN IC-5 findings");
    console.log("══════════════════════════════════════════════════════════════");
    for (const r of diagnosticRecords) {
      console.log(`\n  ── ${r.issueId} (EN statement ${r.enStatementId}, index ${r.enStatementIndex}, section ${r.enSection}) ──`);
      console.log(`     EN text: ${JSON.stringify(r.enText?.slice(0, 140))}`);
      console.log(`     EN Stage 4: classification=${r.enEvidenceClassification}, spans=${r.enEvidenceSpanCount}, rule=${r.enLinkageRule}`);
      console.log(`     EN Stage 3: authority=${r.enAuthorityClassification}`);
      console.log(`     EN Stage 5: materiality=${r.enMaterialityClassification}`);
      console.log(`     IC-5 trigger: ${r.ic5TriggerCondition}`);
      console.log(`     ES counterpart: ${r.esCounterpartStatus}${r.esStatementId ? ` (statement ${r.esStatementId}, section ${r.esSection})` : ""}`);
      if (r.esText) console.log(`     ES candidate text: ${JSON.stringify(r.esText.slice(0, 140))}`);
      if (r.esEvidenceClassification) console.log(`     ES Stage 4: classification=${r.esEvidenceClassification}, ES Stage 3: authority=${r.esAuthorityClassification}, ES Stage 5: materiality=${r.esMaterialityClassification}`);
      console.log(`     Observed difference: ${r.observedDifference}`);
      console.log(`     Earliest divergence: ${r.earliestDivergence} (confidence: ${r.confidence})`);
      console.log(`     Sensitivity signal: ${r.sensitivitySignal}`);
    }

    expect(diagnosticRecords.length).toBe(7);
  });

  it("every finding's ic5TriggerCondition metadata is internally consistent with the issue's own metadata (no fabrication)", () => {
    for (let i = 0; i < diagnosticRecords.length; i++) {
      const r = diagnosticRecords[i];
      const issue = enPipeline.stage6.issues[i] as any;
      expect(issue.metadata.materialityClassification).toBe(r.enMaterialityClassification);
      expect(issue.metadata.evidenceClassification).toBe(r.enEvidenceClassification);
      expect(issue.metadata.authorityClassification).toBe(r.enAuthorityClassification);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 7: Corpus-level aggregate findings
// ---------------------------------------------------------------------------

describe("DRA-CHK-003 — Part 7: Aggregate findings and classification tally", () => {
  it("tallies earliest-divergence classifications across all 7 findings", () => {
    const tally: Record<string, number> = {};
    for (const r of diagnosticRecords) tally[r.earliestDivergence] = (tally[r.earliestDivergence] ?? 0) + 1;
    console.log("\n── Earliest-divergence classification tally (7 findings) ──────");
    for (const [k, v] of Object.entries(tally)) console.log(`  ${k}: ${v}`);
    expect(Object.values(tally).reduce((a, b) => a + b, 0)).toBe(7);
  });

  it("checks whether the 7 EN findings concentrate in sections with unusually different EN/ES segmentation density", () => {
    const enSectionCounts: Record<SectionName, number> = { PREAMBLE_AND_TOC: 0, CHAPTER_I: 0, CHAPTER_II: 0, CHAPTER_III_AND_ANNEXES: 0 };
    for (const r of diagnosticRecords) enSectionCounts[r.enSection]++;
    console.log("\n── Section distribution of the 7 EN IC-5 findings ─────────────");
    for (const s of SECTIONS) console.log(`  ${s}: ${enSectionCounts[s]}`);
    // Report only — do not assert a specific distribution shape (data-dependent).
    expect(Object.values(enSectionCounts).reduce((a, b) => a + b, 0)).toBe(7);
  });

  it("reports whether any Stage 4 evidence-linkage classification difference was observed for a confirmed EN/ES pair (language-sensitivity signal)", () => {
    const confirmedWithEvidenceDiff = diagnosticRecords.filter(
      (r) => (r.esCounterpartStatus === "CONFIRMED" || r.esCounterpartStatus === "PROBABLE") &&
        r.esEvidenceClassification !== null && r.esEvidenceClassification !== r.enEvidenceClassification,
    );
    console.log(`\n  Confirmed/probable EN/ES pairs with differing Stage 4 evidence classification: ${confirmedWithEvidenceDiff.length}`);
    for (const r of confirmedWithEvidenceDiff) {
      console.log(`    ${r.issueId}: EN=${r.enEvidenceClassification} vs ES=${r.esEvidenceClassification}`);
    }
    // Report-only assertion: array is well-formed, not a claim about count.
    expect(Array.isArray(confirmedWithEvidenceDiff)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 8: Frozen-methodology and no-regression guarantees
// ---------------------------------------------------------------------------

describe("DRA-CHK-003 — Part 8: Frozen-methodology guarantees", () => {
  it("confirms this checkpoint used only unmodified, existing exported pipeline stage functions", () => {
    // Structural guarantee, not a runtime check: this file imports stage
    // functions from their existing frozen module paths and does not
    // reassign, monkey-patch, or wrap them.
    expect(typeof normaliseEvaluationRequest).toBe("function");
    expect(typeof extractClaims).toBe("function");
    expect(typeof resolveAuthority).toBe("function");
    expect(typeof linkEvidence).toBe("function");
    expect(typeof assessMateriality).toBe("function");
    expect(typeof checkConsistency).toBe("function");
    expect(typeof deriveDecision).toBe("function");
  });

  it("confirms DRA-DOC-0018/0021 source text used here is byte-identical in length to DRA-BMK-021's fetch (no re-acquisition, no edit)", () => {
    // These exact lengths were independently observed in DRA-BMK-021's
    // comparative-analysis run; reproducing them here (via the same cache)
    // confirms no drift and no edit to either source.
    expect(enText.length).toBe(162051);
    expect(esText.length).toBe(204861);
  });
});
