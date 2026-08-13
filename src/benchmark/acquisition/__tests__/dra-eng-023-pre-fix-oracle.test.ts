/**
 * DRA-ENG-023 — Step 1: Pre-Fix Oracle
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  FROZEN PRE-FIX ORACLE — DRA-ACQ-028 PHASE 2 BASELINE                     ║
 * ║                                                                          ║
 * ║  This test exists to permanently preserve the DRA-ACQ-028 Phase 2        ║
 * ║  measurements against the exact pre-ENG-023 Stage 2 implementation,      ║
 * ║  using frozen snapshot copies of segment-content.ts and                  ║
 * ║  classify-segments.ts (see src/claim-extraction/__frozen__/pre-eng-023/) ║
 * ║  rather than the live modules. Because it imports the frozen snapshots,  ║
 * ║  this test's assertions remain valid FOREVER, independent of the         ║
 * ║  DRA-ENG-023 fix applied to the live pipeline — it is historical         ║
 * ║  evidence, not a regression guard on live behaviour.                     ║
 * ║                                                                          ║
 * ║  Do NOT update this file's expectations after DRA-ENG-023 lands. If it   ║
 * ║  ever fails, the frozen snapshot files were edited by mistake — restore  ║
 * ║  them from the frozen copies, not this test.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { segmentContentPreEng023 } from "../../../claim-extraction/__frozen__/pre-eng-023/segment-content.pre-eng-023.js";
import { classifySegmentsPreEng023 } from "../../../claim-extraction/__frozen__/pre-eng-023/classify-segments.pre-eng-023.js";
import { createHttpFetcher } from "../http-fetcher.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../request.js";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-023-oracle-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath], {
      maxBuffer: 1024 * 1024 * 64,
    });
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

const JA_PDF_URL = "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf";
const EN_TRANSLATION_PDF_URL =
  "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_eng_20260116.pdf";
const JAPANESE_SCRIPT_RE = /[\u3040-\u30FF\u4E00-\u9FFF]/;
const jaCharCount = (t: string) => (t.match(new RegExp(JAPANESE_SCRIPT_RE, "g")) ?? []).length;

describe("DRA-ENG-023 Step 1 — Frozen pre-fix oracle (DRA-ACQ-028 Phase 2 baseline)", () => {
  it(
    "reproduces the exact DRA-ACQ-028 Phase 2 measurements using frozen pre-ENG-023 Stage 2 snapshots",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-023 STEP 1 — PRE-FIX ORACLE LOG                  ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });
      const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-028");

      const jaReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000035",
        sourceUrl: JA_PDF_URL,
        requestedBy: "DRA-ENG-023-pre-fix-oracle",
        requestedAt: "2026-08-11T15:00:00.000Z",
        expectedPublisher: "Cabinet Office",
        expectedTitle: "AI",
      });
      expect(jaReq.ok).toBe(true);
      if (!jaReq.ok) return;
      const jaFetch = await fetcher(jaReq.request, {});
      expect(jaFetch.ok).toBe(true);
      if (!jaFetch.ok) return;

      const enReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-999998",
        sourceUrl: EN_TRANSLATION_PDF_URL,
        requestedBy: "DRA-ENG-023-pre-fix-oracle",
        requestedAt: "2026-08-11T15:00:00.000Z",
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

      // ── Japanese: frozen pre-ENG-023 behaviour ───────────────────────────
      const jaSegs = segmentContentPreEng023(jaText);
      const jaClassified = classifySegmentsPreEng023(jaSegs);
      const jaCounts: Record<string, number> = {};
      for (const c of jaClassified) {
        const k = c.status === "CANDIDATE" ? "CANDIDATE" : (c.exclusionReason as string);
        jaCounts[k] = (jaCounts[k] ?? 0) + 1;
      }
      console.log("Japanese (frozen pre-ENG-023) breakdown:", JSON.stringify(jaCounts));

      expect(jaSegs.length).toBe(407);
      expect(jaCounts["PUNCTUATION_ONLY"]).toBe(183);
      expect(jaCounts["CANDIDATE"]).toBe(70);
      expect(jaCounts["EMPTY"]).toBe(124);
      expect(jaCounts["SHORT_FRAGMENT"]).toBe(30);

      const jaPunctOnly = jaClassified.filter(
        (c) => c.status === "EXCLUDED" && c.exclusionReason === "PUNCTUATION_ONLY",
      );
      const jaPunctOnlyRealScript = jaPunctOnly.filter((c) => JAPANESE_SCRIPT_RE.test(c.segment.text));
      const jaCandidates = jaClassified.filter((c) => c.status === "CANDIDATE");
      const jaScriptCharsExcluded = jaPunctOnlyRealScript.reduce(
        (a, c) => a + jaCharCount(c.segment.text),
        0,
      );
      const jaScriptCharsRetained = jaCandidates.reduce((a, c) => a + jaCharCount(c.segment.text), 0);
      const jaLossPct = (jaScriptCharsExcluded / (jaScriptCharsExcluded + jaScriptCharsRetained)) * 100;

      console.log(`Misclassified substantive Japanese segments: ${jaPunctOnlyRealScript.length}`);
      console.log(`Japanese-script content loss: ${jaLossPct.toFixed(1)}%`);

      expect(jaPunctOnlyRealScript.length).toBe(182);
      expect(Math.round(jaLossPct * 10) / 10).toBe(75.4);

      // ── Representative pure-Japanese segments wrongly classified as
      //    PUNCTUATION_ONLY under the frozen pre-fix logic (no ASCII
      //    alphanumeric anywhere in the text) — frozen exemplars for the
      //    historical record. ──────────────────────────────────────────────
      const pureJaMisclassifiedExemplars = jaPunctOnlyRealScript
        .filter((c) => !/[a-zA-Z0-9]/.test(c.segment.text))
        .slice(0, 3)
        .map((c) => c.segment.text);
      console.log("Pure-Japanese PUNCTUATION_ONLY exemplars (pre-fix):", pureJaMisclassifiedExemplars);
      expect(pureJaMisclassifiedExemplars.length).toBeGreaterThan(0);
      for (const text of pureJaMisclassifiedExemplars) {
        expect(JAPANESE_SCRIPT_RE.test(text)).toBe(true);
        expect(/[a-zA-Z0-9]/.test(text)).toBe(false);
      }

      // ── Representative genuine punctuation-only segment (correctly
      //    excluded both before and after any fix). ───────────────────────
      const genuinePunctuationExemplar = jaPunctOnly.find(
        (c) => !JAPANESE_SCRIPT_RE.test(c.segment.text),
      );
      expect(genuinePunctuationExemplar).toBeDefined();
      console.log(
        "Genuine punctuation-only exemplar (pre-fix, correctly excluded):",
        JSON.stringify(genuinePunctuationExemplar?.segment.text),
      );
      expect(genuinePunctuationExemplar?.segment.text).toBe("。");

      // ── English (reference/control): frozen pre-ENG-023 behaviour ───────
      const enSegs = segmentContentPreEng023(enText);
      const enClassified = classifySegmentsPreEng023(enSegs);
      const enCounts: Record<string, number> = {};
      for (const c of enClassified) {
        const k = c.status === "CANDIDATE" ? "CANDIDATE" : (c.exclusionReason as string);
        enCounts[k] = (enCounts[k] ?? 0) + 1;
      }
      console.log("English (frozen pre-ENG-023) breakdown:", JSON.stringify(enCounts));
      expect(enSegs.length).toBe(534);
      expect(enCounts["CANDIDATE"]).toBe(316);
      expect(enCounts["PUNCTUATION_ONLY"] ?? 0).toBe(0);
      expect(enCounts["SHORT_FRAGMENT"]).toBe(20);
      expect(enCounts["EMPTY"]).toBe(198);

      // ── Existing Latin-script sentence-boundary behaviour (frozen) ──────
      // A small synthetic sample capturing the documented pre-fix rules —
      // preserved so DRA-ENG-023 can prove it does not change these results.
      const latinSample =
        "The guideline was approved by Dr. Smith on Jan. 5, 2026. It applies broadly. Is this final? Yes!";
      const latinSegs = segmentContentPreEng023(latinSample);
      const latinSentences = latinSegs.filter((s) => s.segmentType === "SENTENCE").map((s) => s.text);
      console.log("Latin sentence-boundary sample (frozen pre-fix):", latinSentences);
      expect(latinSentences).toEqual([
        "The guideline was approved by Dr. Smith on Jan. 5, 2026.",
        "It applies broadly.",
        "Is this final?",
        "Yes!",
      ]);

      // ── Ideographic sentence terminators are NOT recognised pre-fix ─────
      const jaFullStops = (jaText.match(/。/g) ?? []).length;
      const jaAsciiTerminators = (jaText.match(/[.!?]/g) ?? []).length;
      console.log(
        `Ideographic full stops in source: ${jaFullStops}; ASCII terminators recognised: ${jaAsciiTerminators}`,
      );
      expect(jaFullStops).toBe(94);
      expect(jaAsciiTerminators).toBe(0);

      console.log("\n── Pre-Fix Oracle Frozen Successfully ──────────────────────");
    },
    120_000,
  );
});
