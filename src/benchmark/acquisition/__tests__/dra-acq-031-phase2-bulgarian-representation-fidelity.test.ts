/**
 * DRA-ACQ-031 — Phase 2: Cyrillic Representation-Fidelity and Robustness
 * Experiment for DRA-DOC-0034 (EC Ethics Guidelines, Bulgarian edition)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  REPRESENTATION-FIDELITY / ROBUSTNESS EXPERIMENT — DRA-ACQ-031 PHASE 2    ║
 * ║                                                                          ║
 * ║  This file performs the analysis work the admission test                 ║
 * ║  (dra-acq-031-phase2-doc0034-bulgarian-admission.test.ts) explicitly     ║
 * ║  defers: establishing Cyrillic representation fidelity, comparing the    ║
 * ║  Bulgarian edition's Stage 2 (segmentation/classification) behaviour     ║
 * ║  directly against its two already-admitted, substantively identical      ║
 * ║  parallel-language siblings — DRA-DOC-0018 (Spanish, doc_id=60423) and   ║
 * ║  DRA-DOC-0021 (English, doc_id=60419) — and performing a production-vs-  ║
 * ║  analysis-only-reference-representation robustness comparison.           ║
 * ║                                                                          ║
 * ║  DOCUMENTATION CORRECTION (see admission test docblock for full detail): ║
 * ║  the correct EN/ES parallel-language oracle pair for this document is    ║
 * ║  DRA-DOC-0018 (ES) and DRA-DOC-0021 (EN), NOT "DRA-DOC-0018/0019" as      ║
 * ║  imprecisely described in the DRA-ACQ-031 Phase 1 candidate register     ║
 * ║  text (DRA-DOC-0019 is an unrelated INE document). This is the identical ║
 * ║  pair already used by DRA-CHK-003/DRA-CHK-005 for the EN/ES materiality- ║
 * ║  divergence investigation.                                              ║
 * ║                                                                          ║
 * ║  Uses the LIVE, current (post-DRA-ENG-023) segmentContent/               ║
 * ║  classifySegments — this is a forward-looking robustness experiment on a ║
 * ║  script the corrected pipeline has never seen, not a historical-defect   ║
 * ║  reproduction, so frozen pre-fix snapshots are deliberately NOT used     ║
 * ║  (contrast with dra-acq-028-doc0032-japanese-baseline-experiment.test.ts,║
 * ║  which characterised the PRE-fix defect and so used frozen code).       ║
 * ║                                                                          ║
 * ║  ENGINEERING BOUNDARY: this file measures and classifies. It does not    ║
 * ║  modify segment-content.ts, classify-segments.ts, or any other           ║
 * ║  production module. Any newly observed defect is documented in the      ║
 * ║  Phase 2 report as a candidate for a future DRA-ENG programme, not       ║
 * ║  fixed here.                                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { computeSourceDigest } from "../integrity.js";

import { segmentContent } from "../../../claim-extraction/segment-content.js";
import { classifySegments } from "../../../claim-extraction/classify-segments.js";

const execFileAsync = promisify(execFile);

const EC_ETHICS_BG_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60442";
const EC_ETHICS_EN_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419";
const EC_ETHICS_ES_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";
const BG_EXPECTED_SHA256 = "bf61352bd6836ca4d29c429ad963b0b2fceb0b7d0874bb77ae10b113dac3d313";
const TIMESTAMP = "2026-08-11T21:30:00.000Z";

async function extractPdfTextLayout(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-031-fidelity-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

// Analysis-only REFERENCE representation: default (non-`-layout`) pdftotext
// extraction. This is never fed to the production pipeline or used to
// replace any admitted data — it exists purely so this test can compare the
// production representation against an independently-derived one and
// classify any differences by materiality, per the Phase 2 task spec.
async function extractPdfTextReference(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-031-fidelity-ref-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", [inputPath, outputPath], { maxBuffer: 1024 * 1024 * 64 });
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

const CYRILLIC_RE = /[\u0400-\u04FF]/;
const cyrillicCharCount = (t: string) => (t.match(new RegExp(CYRILLIC_RE, "g")) ?? []).length;

function classificationBreakdown(text: string) {
  const segs = segmentContent(text);
  const classified = classifySegments(segs);
  const counts: Record<string, number> = {};
  for (const c of classified) {
    const k = c.status === "CANDIDATE" ? "CANDIDATE" : (c.exclusionReason as string);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const punctuationOnly = classified.filter(
    (c) => c.status === "EXCLUDED" && c.exclusionReason === "PUNCTUATION_ONLY",
  );
  return { segs, classified, counts, punctuationOnly };
}

describe("DRA-ACQ-031 Phase 2 — Cyrillic representation-fidelity and robustness experiment (DRA-DOC-0034)", () => {
  it(
    "measures live Stage 2 segmentation/classification on the Bulgarian edition directly against its already-" +
      "admitted English (DRA-DOC-0021) and Spanish (DRA-DOC-0018) parallel-language siblings, checks Unicode/" +
      "boundary/punctuation/heading fidelity, and compares production vs analysis-only reference extraction",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ACQ-031 PHASE 2 — REPRESENTATION-FIDELITY LOG         ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });
      const bgFetcher = createDiskCachedFetcher(realFetcher, "dra-acq-031");
      const enEsFetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-022");

      // ── Fetch all three parallel editions (cache-backed; BG already ────────
      // ── verified BYTE_STABLE and admitted in the companion admission test) ─

      const bgReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000037",
        sourceUrl: EC_ETHICS_BG_PDF_URL,
        requestedBy: "DRA-ACQ-031-fidelity-experiment",
        requestedAt: TIMESTAMP,
        expectedPublisher: "European Commission",
        expectedTitle: "AI",
      });
      expect(bgReq.ok).toBe(true);
      if (!bgReq.ok) return;
      const bgFetch = await bgFetcher(bgReq.request, {});
      expect(bgFetch.ok).toBe(true);
      if (!bgFetch.ok) return;
      expect(computeSourceDigest(bgFetch.source.rawBytes)).toBe(BG_EXPECTED_SHA256);

      const enReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-999997",
        sourceUrl: EC_ETHICS_EN_PDF_URL,
        requestedBy: "DRA-ACQ-031-fidelity-experiment",
        requestedAt: TIMESTAMP,
        expectedPublisher: "European Commission",
        expectedTitle: "AI",
      });
      expect(enReq.ok).toBe(true);
      if (!enReq.ok) return;
      const enFetch = await enEsFetcher(enReq.request, {});
      expect(enFetch.ok).toBe(true);
      if (!enFetch.ok) return;

      const esReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-999996",
        sourceUrl: EC_ETHICS_ES_PDF_URL,
        requestedBy: "DRA-ACQ-031-fidelity-experiment",
        requestedAt: TIMESTAMP,
        expectedPublisher: "European Commission",
        expectedTitle: "AI",
      });
      expect(esReq.ok).toBe(true);
      if (!esReq.ok) return;
      const esFetch = await enEsFetcher(esReq.request, {});
      expect(esFetch.ok).toBe(true);
      if (!esFetch.ok) return;

      const bgText = await extractPdfTextLayout(bgFetch.source.rawBytes);
      const enText = await extractPdfTextLayout(enFetch.source.rawBytes);
      const esText = await extractPdfTextLayout(esFetch.source.rawBytes);

      console.log("── Extracted character counts (-layout, production representation) ──");
      console.log(`  BG: ${bgText.length}  EN: ${enText.length}  ES: ${esText.length}`);

      // ── Part A: Unicode / character-preservation / corruption checks ──────

      console.log("\n── Part A: Cyrillic Unicode Integrity ───────────────────────");

      const bgCyrillicCount = cyrillicCharCount(bgText);
      console.log(`  Cyrillic characters extracted: ${bgCyrillicCount}`);
      expect(bgCyrillicCount).toBeGreaterThan(100_000);

      // No U+FFFD replacement characters (the canonical corruption signature
      // for encoding/decoding failures) anywhere in the extracted text.
      const replacementCharCount = (bgText.match(/\uFFFD/g) ?? []).length;
      console.log(`  U+FFFD replacement characters: ${replacementCharCount}`);
      expect(replacementCharCount).toBe(0);

      // No mid-word Latin/Cyrillic homoglyph substitution artefacts: spot-check
      // that known Bulgarian words appear with fully-Cyrillic spelling (not
      // mixed-script, which would indicate a font-mapping corruption).
      const knownPhrases = [
        "ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ",
        "изкуствен интелект",
        "надежден",
      ];
      for (const phrase of knownPhrases) {
        const found = bgText.includes(phrase) || new RegExp(phrase, "i").test(bgText);
        console.log(`  ${found ? "✓" : "✗"} known phrase present: "${phrase}"`);
      }
      expect(bgText.includes("ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ")).toBe(true);

      // Numerals: Bulgarian uses ordinary Arabic numerals (unlike, e.g.,
      // Japanese kanji numerals) — confirm ordinary digit sequences appear
      // uncorrupted (e.g. the publication year, chapter numbers).
      expect(/\b2019\b/.test(bgText)).toBe(true);
      // Note: \b is an ASCII word-boundary construct in JS regex without the
      // Unicode-aware \p{L} form — Cyrillic letters are not \w characters, so
      // \b fails silently around them (a related pitfall to the accented-
      // vowel \b issue documented for DRA-CHK-005). Cyrillic-safe check below
      // uses no \b anchor.
      expect(/Глава\s+[IVX]|част\s+[IVX]/i.test(bgText)).toBe(true);

      // ── Part B: direct Stage 2 measurement, all three parallel editions ────

      console.log("\n── Part B: Direct Stage 2 Measurement (live, current code) ──");

      const bgResult = classificationBreakdown(bgText);
      const enResult = classificationBreakdown(enText);
      const esResult = classificationBreakdown(esText);

      console.log("  BG breakdown:", JSON.stringify(bgResult.counts));
      console.log("  EN breakdown:", JSON.stringify(enResult.counts));
      console.log("  ES breakdown:", JSON.stringify(esResult.counts));
      console.log(`  BG PUNCTUATION_ONLY segments: ${bgResult.punctuationOnly.length}`);
      console.log(`  EN PUNCTUATION_ONLY segments: ${enResult.punctuationOnly.length}`);
      console.log(`  ES PUNCTUATION_ONLY segments: ${esResult.punctuationOnly.length}`);

      // Cyrillic-script segments misclassified as PUNCTUATION_ONLY would be
      // the direct Bulgarian analogue of the pre-ENG-023 Japanese defect.
      const bgMisclassified = bgResult.punctuationOnly.filter((c) => CYRILLIC_RE.test(c.segment.text));
      console.log(`  BG Cyrillic-script segments misclassified PUNCTUATION_ONLY: ${bgMisclassified.length}`);
      expect(bgMisclassified.length).toBe(0);

      // Structural comparability: same order of magnitude as the EN/ES
      // siblings (same substantive document; page-count and prose-density
      // differences across languages are expected and do not indicate an
      // extraction/segmentation defect).
      console.log(
        `  Segment counts — BG: ${bgResult.segs.length}, EN: ${enResult.segs.length}, ES: ${esResult.segs.length}`,
      );
      console.log(
        `  CANDIDATE counts — BG: ${bgResult.counts["CANDIDATE"]}, EN: ${enResult.counts["CANDIDATE"]}, ` +
          `ES: ${esResult.counts["CANDIDATE"]}`,
      );
      const minCandidates = Math.min(
        enResult.counts["CANDIDATE"] ?? 0,
        esResult.counts["CANDIDATE"] ?? 0,
      );
      const maxCandidates = Math.max(
        enResult.counts["CANDIDATE"] ?? 0,
        esResult.counts["CANDIDATE"] ?? 0,
      );
      // BG candidate count must be within the same order of magnitude as its
      // siblings (not collapsed by a factor of >2x in either direction, which
      // would indicate a segmentation/classification defect rather than
      // ordinary cross-language prose-density variation).
      expect(bgResult.counts["CANDIDATE"] ?? 0).toBeGreaterThan(minCandidates * 0.5);
      expect(bgResult.counts["CANDIDATE"] ?? 0).toBeLessThan(maxCandidates * 2);

      // ── Part C: sentence-boundary / punctuation-specific checks ────────────

      console.log("\n── Part C: Sentence-Boundary and Punctuation Fidelity ────────");

      // Bulgarian uses ordinary ASCII sentence terminators ('.', '!', '?'),
      // unlike CJK ideographic punctuation — direct proof the existing
      // (script-agnostic) Latin sentence-boundary logic applies unmodified.
      const bgSentenceSample =
        "Това е изречение. Това също е изречение! Въпрос ли е това? Това, не е граница.";
      const bgSentences = segmentContent(bgSentenceSample)
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text);
      console.log("  Bulgarian sentence-boundary sample split:", JSON.stringify(bgSentences));
      expect(bgSentences).toEqual([
        "Това е изречение.",
        "Това също е изречение!",
        "Въпрос ли е това?",
        "Това, не е граница.",
      ]);

      // Bulgarian-specific abbreviation pattern ("напр." = "e.g.", "стр." =
      // "page", "т.е." = "i.e.") — a narrow residual-risk class analogous to
      // Latin "Dr."/"Jan." abbreviations already tolerated (or not) by the
      // existing abbreviation-aware boundary logic, which was built for
      // English/Latin abbreviation lists only.
      const bgAbbreviationSample = "Виж напр. глава III. Резултатите са ясни.";
      const bgAbbrevSentences = segmentContent(bgAbbreviationSample)
        .filter((s) => s.segmentType === "SENTENCE")
        .map((s) => s.text);
      console.log("  Bulgarian abbreviation-sample split:", JSON.stringify(bgAbbrevSentences));
      const abbreviationBoundaryCorrect =
        bgAbbrevSentences.length === 1 &&
        bgAbbrevSentences[0] === "Виж напр. глава III. Резултатите са ясни.";
      console.log(
        `  Abbreviation-aware boundary detection for Bulgarian abbreviations: ${
          abbreviationBoundaryCorrect ? "CORRECT (unexpected bonus)" : "NOT RECOGNISED (expected — no Bulgarian abbreviation list exists)"
        }`,
      );
      // This is a KNOWN, DOCUMENTED, pre-existing limitation (the abbreviation
      // list is English/Latin-specific) — not a new Cyrillic-specific defect.
      // No assertion is made on the outcome; it is recorded for the report.

      // ── Part D: heading / ordering / mixed-script checks ───────────────────

      console.log("\n── Part D: Heading, Ordering, Mixed-Script Checks ────────────");

      const bgLines = bgText.split("\n").map((l) => l.trim()).filter(Boolean);
      const firstHeadingIndex = bgLines.findIndex((l) => /Насоки/i.test(l) && /ИИ|интелект/i.test(l));
      console.log(`  Title-heading located at extracted line index: ${firstHeadingIndex}`);
      expect(firstHeadingIndex).toBeGreaterThanOrEqual(0);
      expect(firstHeadingIndex).toBeLessThan(50);

      // Mixed-script robustness: the document mixes Cyrillic prose with Latin
      // acronyms (e.g. "ЕС" is Cyrillic, but "AI"/"EU" appear in Latin script
      // in some contexts) and Arabic numerals throughout — confirm both
      // scripts coexist without one displacing the other.
      const hasLatinInBgText = /[A-Za-z]/.test(bgText);
      console.log(`  Latin-script characters also present (mixed-script document): ${hasLatinInBgText}`);
      expect(hasLatinInBgText).toBe(true);

      // ── Part E: production vs analysis-only reference representation ──────

      console.log("\n── Part E: Production vs Reference Representation Comparison ─");

      const bgReferenceText = await extractPdfTextReference(bgFetch.source.rawBytes);
      const bgReferenceCyrillicCount = cyrillicCharCount(bgReferenceText);

      console.log(`  Production (-layout) Cyrillic char count: ${bgCyrillicCount}`);
      console.log(`  Reference (default)  Cyrillic char count: ${bgReferenceCyrillicCount}`);

      const cyrillicCountDeltaPct =
        (Math.abs(bgCyrillicCount - bgReferenceCyrillicCount) / Math.max(bgCyrillicCount, bgReferenceCyrillicCount)) *
        100;
      console.log(`  Delta: ${cyrillicCountDeltaPct.toFixed(2)}%`);

      const referenceResult = classificationBreakdown(bgReferenceText);
      const referenceMisclassified = referenceResult.punctuationOnly.filter((c) => CYRILLIC_RE.test(c.segment.text));
      console.log(`  Reference-representation CANDIDATE count: ${referenceResult.counts["CANDIDATE"]}`);
      console.log(
        `  Reference-representation Cyrillic PUNCTUATION_ONLY misclassifications: ${referenceMisclassified.length}`,
      );

      // Materiality classification for this comparison:
      //  - character-level Cyrillic content preservation must be near-identical
      //    (small deltas are expected from layout-driven whitespace/line-break
      //    differences between -layout and default pdftotext modes — this is
      //    a REPRESENTATION-BOUNDARY difference, not corruption);
      //  - no NEW Cyrillic misclassification defect may appear under the
      //    reference representation that was absent under production.
      console.log(
        `  Materiality verdict: ${
          cyrillicCountDeltaPct < 5 && referenceMisclassified.length === 0
            ? "NO MATERIAL DIFFERENCE — both representations preserve Cyrillic content and classify it identically"
            : "DIFFERENCE REQUIRES FURTHER REVIEW"
        }`,
      );
      expect(cyrillicCountDeltaPct).toBeLessThan(5);
      expect(referenceMisclassified.length).toBe(0);

      // The reference representation is NEVER used to replace the admitted
      // production freeze record or corpus entry — this comparison is
      // analysis-only, per the Phase 2 task spec.

      console.log("\n── Representation-Fidelity Experiment Complete ──────────────");
      console.log(`  BG candidates: ${bgResult.counts["CANDIDATE"]}, misclassified: ${bgMisclassified.length}`);
      console.log(`  EN candidates: ${enResult.counts["CANDIDATE"]} (DRA-DOC-0021, admitted REVIEW/7 issues)`);
      console.log(`  ES candidates: ${esResult.counts["CANDIDATE"]} (DRA-DOC-0018, admitted SUPPORTED/0 issues)`);
      console.log(
        "  Bulgarian admitted decision (companion admission test): SUPPORTED / 0 issues / 2815 statements " +
          "(Stage 2 statement count, not directly comparable 1:1 to the raw segment/CANDIDATE counts above, " +
          "which measure only the segmentation/classification layer in isolation).",
      );
    },
    280_000,
  );
});
