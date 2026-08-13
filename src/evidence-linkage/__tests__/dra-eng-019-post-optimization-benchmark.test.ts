/**
 * DRA-ENG-019 Part E — Post-Optimisation Complexity Measurement
 *
 * Re-runs the IDENTICAL 20/40/60/80/100-page prefix ladder used in
 * DRA-ENG-019 Part A (root-cause profiling, pre-optimisation) and in the
 * original DRA-ACQ-026 Phase 2 report, now against the DRA-ENG-019-optimised
 * `detectSemanticParaphrase` (WeakMap-cached per-source chunk index +
 * bigram-indexed candidate narrowing).
 *
 * This is a REAL, empirical measurement — not a theoretical complexity
 * claim. It reports the same rows as Part A's profiling test so the
 * before/after comparison is direct and honest.
 *
 * Historical numbers preserved for comparison (NOT re-measured here — see
 * docs/dra/DRA-ACQ-026-PHASE2-NIST-SP80053-REPORT.md and DRA-ENG-019 Part A):
 *   20p:  684 statements,   ~1.3s   Stage-4-rule cost (pre-optimisation)
 *   40p: 1873 statements,  ~10.9s   (measured directly in Part A: 10883.8ms)
 *   60p: 2955 statements,  ~31.8s   (measured directly in Part A: 31817.3ms)
 *   80p: 4079 statements,  ~65.4s   (measured directly in Part A: 65364.1ms)
 *  100p: 5176 statements, ~102.9s   (measured directly in Part A: 102875.5ms)
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
  const id = `dra-eng-019-post-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    userAgent: "DRA-ENG-019-post-optimization-benchmark/1.0",
  });
  const fetcher = createDiskCachedFetcher(realFetcher, CACHE_NAME);
  const req = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000033",
    sourceUrl: NIST_SP80053_PDF_URL,
    requestedBy: "DRA-ENG-019-post-optimization-benchmark",
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

// Historical PRE-optimisation Stage-4-rule cost, measured directly in
// DRA-ENG-019 Part A against the unmodified brute-force implementation.
// Preserved verbatim for the speedup comparison below — never overwritten.
const PRE_OPTIMISATION_MS: Record<number, number> = {
  20: 1377.5 + 12.4,
  40: 10883.8 + 17.5,
  60: 31817.3 + 24.6,
  80: 65364.1 + 41.7,
  100: 102875.5 + 63.4,
};

describe("DRA-ENG-019 Part E — post-optimisation scaling measurement", () => {
  it(
    "measures real post-optimisation Stage-4-rule cost across the same 20/40/60/80/100-page ladder and reports speedup + fitted complexity",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-019 PART E — POST-OPTIMISATION BENCHMARK LOG       ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const bytes = await fetchNistBytes();
      const fullText = await extractPdfText(bytes);
      const pages = fullText.split("\f");

      const PAGE_COUNTS = [20, 40, 60, 80, 100];
      const rows: Array<{ pages: number; statements: number; totalMs: number }> = [];

      for (const pageCount of PAGE_COUNTS) {
        const prefixText = pages.slice(0, pageCount).join("\f");
        const evalReq = buildEvalRequest(`dra-eng-019-post-${pageCount}p`, prefixText);
        const s1 = normaliseEvaluationRequest(evalReq);
        expect(s1.ok).toBe(true);
        if (!s1.ok) continue;
        const s2 = extractClaims(s1.normalisedRequest);
        expect(s2.ok).toBe(true);
        if (!s2.ok) continue;

        const sourceTexts = [prefixText];
        const t0 = performance.now();
        for (const stmt of s2.statements) {
          const detection = detectEvidence(stmt.text);
          if (detection.classification === "NO_DOCUMENT_EVIDENCE") {
            detectSemanticParaphrase(stmt.text, sourceTexts);
          }
        }
        const totalMs = performance.now() - t0;

        rows.push({ pages: pageCount, statements: s2.statements.length, totalMs });

        const preMs = PRE_OPTIMISATION_MS[pageCount]!;
        const speedup = preMs / totalMs;
        console.log(
          `  ${pageCount}p: statements=${s2.statements.length}, ` +
            `post-optimisation=${totalMs.toFixed(1)}ms, pre-optimisation=${preMs.toFixed(1)}ms, ` +
            `speedup=${speedup.toFixed(1)}x`,
        );
      }

      // ── Fitted complexity: compare growth ratio of time vs statements ────
      const first = rows[0]!;
      const last = rows[rows.length - 1]!;
      const statementRatio = last.statements / first.statements;
      const timeRatio = last.totalMs / first.totalMs;
      console.log(
        `\n  20p->100p: statement count ratio=${statementRatio.toFixed(2)}x, ` +
          `post-optimisation time ratio=${timeRatio.toFixed(2)}x ` +
          `(pre-optimisation time ratio was ~${(PRE_OPTIMISATION_MS[100]! / PRE_OPTIMISATION_MS[20]!).toFixed(1)}x, ` +
          `i.e. quadratic; a ratio near ${statementRatio.toFixed(1)}x here indicates linear-or-better scaling)`,
      );

      // Must be a dramatic, real, measured improvement — not just "faster".
      const overallSpeedupAt100p = PRE_OPTIMISATION_MS[100]! / last.totalMs;
      console.log(`\n  Overall speedup at 100 pages: ${overallSpeedupAt100p.toFixed(1)}x`);
      expect(overallSpeedupAt100p).toBeGreaterThan(5);

      // Time growth must be sub-quadratic: far below statementRatio^2.
      expect(timeRatio).toBeLessThan(statementRatio * statementRatio * 0.5);
    },
    280_000,
  );
});
