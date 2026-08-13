/**
 * DRA-ENG-019 Part A — Root-Cause Profiling for Stage 4 O(n^2) Scaling
 *
 * Instruments the REAL implementation (not a synthetic model) to determine
 * exactly which operation dominates Stage 4 (Evidence Linkage) cost on large
 * documents, using genuine NIST SP 800-53 Rev 5 text prefixes (the same
 * document and prefix ladder used in DRA-ACQ-026 Phase 2 / DRA-ENG-019
 * Part B).
 *
 * Hypothesis under test: `detectSemanticParaphrase` (the DRA-FIX-002 fallback
 * matcher) re-derives its ENTIRE source-text chunk analysis (paragraph/window
 * splitting, phrase canonicalisation, content-term extraction, bigram
 * extraction) from scratch on every call — once per statement that reaches
 * the fallback — even though the source text (and therefore its chunk
 * analysis) is IDENTICAL across every call within a single `linkEvidence`
 * invocation. If source-text length scales with statement count (true for
 * this corpus, where each statement is a roughly fixed-size slice of the
 * document), the resulting cost is O(statements x sourceLength) =
 * O(n x n) = O(n^2).
 *
 * This test measures, directly and separately:
 *   1. Cumulative time spent in `detectEvidence` (citation/reference rules;
 *      operates only on the short statement text, not the source document).
 *   2. Cumulative time spent in `detectSemanticParaphrase` (the suspected
 *      hotspot; operates on the full source document text on every call).
 *   3. The number of statements that actually invoke the semantic-paraphrase
 *      fallback (i.e. found no citation/reference evidence).
 *   4. Per-call cost of `detectSemanticParaphrase` in isolation, confirming
 *      it scales with source-text length rather than being O(1) per call.
 *
 * No source code under src/evidence-linkage is modified by this file.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../../benchmark/acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../benchmark/acquisition/__tests__/support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../../benchmark/acquisition/request.js";
import { normaliseEvaluationRequest } from "../../normalisation/index.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { detectEvidence } from "../linkage-rules.js";
import { detectSemanticParaphrase } from "../semantic-paraphrase.js";

const NIST_SP80053_PDF_URL =
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf";
const REVIEW_TIMESTAMP = "2026-08-11T08:00:00.000Z";
const CACHE_NAME = "dra-eng-019";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-019-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

async function fetchNistBytes(): Promise<Uint8Array> {
  const realFetcher = createHttpFetcher({
    timeoutMs: 120_000,
    maxRedirects: 5,
    maxBytes: 20_000_000,
    userAgent: "DRA-ENG-019-root-cause-profiling/1.0",
  });
  const fetcher = createDiskCachedFetcher(realFetcher, CACHE_NAME);
  const req = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000033",
    sourceUrl: NIST_SP80053_PDF_URL,
    requestedBy: "DRA-ENG-019-root-cause-profiling",
    requestedAt: REVIEW_TIMESTAMP,
  });
  if (!req.ok) throw new Error("request build failed");
  const fetchResult = await fetcher(req.request, {});
  if (!fetchResult.ok) throw new Error(`fetch failed: ${fetchResult.code}`);
  return fetchResult.source.rawBytes;
}

function buildEvalRequest(id: string, content: string) {
  return {
    id,
    requestedAt: REVIEW_TIMESTAMP,
    generatedDocument: {
      id: `${id}-gdoc`,
      title: "NIST SP 800-53 Rev 5 (prefix)",
      content,
      sourceDocumentIds: [`${id}-sdoc`],
      generatedAt: REVIEW_TIMESTAMP,
    },
    sourceDocuments: [{ id: `${id}-sdoc`, title: "Source", content, format: "PLAIN_TEXT" as const }],
  };
}

describe("DRA-ENG-019 Part A — Root-Cause Profiling", () => {
  it(
    "attributes Stage 4 cost to detectEvidence vs detectSemanticParaphrase across the 20/40/60/80/100-page prefix ladder, " +
      "and confirms per-call semantic-paraphrase cost scales with source-text length (the O(n^2) mechanism), not call count",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-019 PART A — ROOT-CAUSE PROFILING LOG             ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const bytes = await fetchNistBytes();
      const fullText = await extractPdfText(bytes);
      const pages = fullText.split("\f");
      console.log(`  Full document: ${pages.length} physical pages, ${fullText.length} chars`);

      const PAGE_COUNTS = [20, 40, 60, 80, 100];
      const rows: Array<{
        pages: number;
        statements: number;
        sourceLength: number;
        detectEvidenceMs: number;
        semanticParaphraseMs: number;
        paraphraseCallCount: number;
        avgParaphraseCallMs: number;
      }> = [];

      for (const pageCount of PAGE_COUNTS) {
        const prefixText = pages.slice(0, pageCount).join("\f");
        const evalReq = buildEvalRequest(`dra-eng-019-profile-${pageCount}p`, prefixText);
        const s1 = normaliseEvaluationRequest(evalReq);
        expect(s1.ok).toBe(true);
        if (!s1.ok) continue;
        const s2 = extractClaims(s1.normalisedRequest);
        expect(s2.ok).toBe(true);
        if (!s2.ok) continue;

        const sourceTexts = [prefixText];

        let detectEvidenceMs = 0;
        let semanticParaphraseMs = 0;
        let paraphraseCallCount = 0;

        for (const stmt of s2.statements) {
          const t0 = performance.now();
          const detection = detectEvidence(stmt.text);
          detectEvidenceMs += performance.now() - t0;

          if (detection.classification === "NO_DOCUMENT_EVIDENCE") {
            const t1 = performance.now();
            detectSemanticParaphrase(stmt.text, sourceTexts);
            semanticParaphraseMs += performance.now() - t1;
            paraphraseCallCount++;
          }
        }

        const row = {
          pages: pageCount,
          statements: s2.statements.length,
          sourceLength: prefixText.length,
          detectEvidenceMs,
          semanticParaphraseMs,
          paraphraseCallCount,
          avgParaphraseCallMs: paraphraseCallCount > 0 ? semanticParaphraseMs / paraphraseCallCount : 0,
        };
        rows.push(row);

        console.log(
          `  ${pageCount}p: statements=${row.statements}, sourceLength=${row.sourceLength}, ` +
            `detectEvidence total=${row.detectEvidenceMs.toFixed(1)}ms, ` +
            `semanticParaphrase total=${row.semanticParaphraseMs.toFixed(1)}ms ` +
            `(${row.paraphraseCallCount} calls, avg ${row.avgParaphraseCallMs.toFixed(3)}ms/call)`,
        );
      }

      // ── Attribution check: semantic-paraphrase must dominate total cost ──
      const last = rows[rows.length - 1]!;
      const totalCost = last.detectEvidenceMs + last.semanticParaphraseMs;
      const paraphraseShare = last.semanticParaphraseMs / totalCost;
      console.log(`\n  At ${last.pages} pages: semantic-paraphrase share of total Stage-4-rule cost = ${(paraphraseShare * 100).toFixed(1)}%`);
      expect(paraphraseShare).toBeGreaterThan(0.9);

      // ── Per-call cost scaling: confirm avg per-call cost grows with source
      //    length (proving re-derivation from scratch, not O(1) amortised
      //    cost from any caching) ─────────────────────────────────────────
      const first = rows[0]!;
      console.log(
        `\n  Per-call cost at ${first.pages}p (sourceLength=${first.sourceLength}): ${first.avgParaphraseCallMs.toFixed(3)}ms/call`,
      );
      console.log(
        `  Per-call cost at ${last.pages}p (sourceLength=${last.sourceLength}): ${last.avgParaphraseCallMs.toFixed(3)}ms/call`,
      );
      const sourceLengthRatio = last.sourceLength / first.sourceLength;
      const perCallCostRatio = last.avgParaphraseCallMs / first.avgParaphraseCallMs;
      console.log(
        `  sourceLength ratio=${sourceLengthRatio.toFixed(2)}x, per-call cost ratio=${perCallCostRatio.toFixed(2)}x ` +
          `(confirms per-call cost scales with source length, not constant)`,
      );
      // Per-call cost should grow at least roughly proportionally with
      // source length (allow generous slack for measurement noise / GC).
      expect(perCallCostRatio).toBeGreaterThan(sourceLengthRatio * 0.3);

      console.log(
        "\n  ROOT CAUSE CONFIRMED: detectSemanticParaphrase re-derives the FULL source-document chunk analysis " +
          "(paragraph/window splitting, phrase canonicalisation, content-term extraction, bigram extraction) " +
          "from scratch on EVERY call, even though the source text is identical across all calls within one " +
          "linkEvidence invocation. Per-call cost scales with source-text length (confirmed above), and the " +
          "number of calls scales with statement count (one call per NO_DOCUMENT_EVIDENCE statement). Because " +
          "source-text length is proportional to statement count in this corpus, total cost is " +
          "O(statements) x O(sourceLength) ~= O(n^2). detectEvidence (the citation/reference rule engine) " +
          "operates only on the short per-statement text and contributes a negligible, non-scaling share of " +
          "total Stage-4-rule cost by comparison.",
      );
    },
    280_000,
  );
});
