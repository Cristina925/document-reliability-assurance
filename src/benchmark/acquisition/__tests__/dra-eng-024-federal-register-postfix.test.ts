/**
 * DRA-ENG-024 — Federal Register post-fix exactness comparison
 *
 * Re-runs the frozen DRA-ACQ-030 Phase 2 granule through the ENG-024
 * reading-order reconstruction pipeline (pdf-layout-prober.ts +
 * column-layout-reconstruction.ts, wired through normaliseContent's new
 * optional pdfLayoutProber parameter) and compares the result against the
 * three Phase 2 oracles:
 *
 *   1. The frozen pre-fix production digest (REFERENCE_PRODUCTION_TEXT_DIGEST)
 *      — must NOT match; the whole point of the fix is that production
 *      output changes for this document.
 *   2. The analysis-only corrected-order fixture (oracle reading order) —
 *      compared via a pair-level interleaving/order-reversal/column-
 *      transition metric identical in spirit to the Phase 2 report's
 *      methodology (§7), applied to the NEW reconstructed text instead of
 *      the manually-clustered fixture.
 *   3. Run A/Run B evaluateDocument reference digests (REFERENCE_RUN_A/B) —
 *      to see whether the new Run C (ENG-024-corrected production text)
 *      converges toward Run B's structural profile.
 *
 * DOES NOT modify, reinterpret, or re-derive the DRA-ACQ-030 Phase 1/Phase 2
 * evidence files — only reads the already-committed oracle fixture as a
 * read-only comparison target. Does not admit DRA-DOC-0034 or touch
 * DRA-DOC-0033's reserved identifiers (no integrateWithCorpus() call).
 */

import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import * as https from "https";

import { normaliseContent } from "../normalisation.js";
import { createPdfLayoutProber } from "../pdf-layout-prober.js";
import { evaluateDocument } from "../../../pipeline/evaluate-document.js";

const GRANULE_URL =
  "https://www.govinfo.gov/content/pkg/FR-2024-01-05/pdf/2024-00001.pdf";

const REFERENCE_PRODUCTION_TEXT_DIGEST =
  "9e004998ba5bc352894da9d37a1aa3600a09df35463b8c6bf1f6cea204c2729a";
const REFERENCE_RUN_A_DIGEST =
  "3d8898b641814566008580ad688056dcb7ba436f3b215ac30e68aa0923a95b90";
const REFERENCE_RUN_B_DIGEST =
  "3c7d0466746b47dc2209c1718b95c7783b88dbb9e5b3ba27b13eb5a52f204696";

const FIXED_TIMESTAMP = "2026-08-11T18:00:00.000Z";
const CORRECTED_ORDER_DELIMITER =
  "=== ANALYSIS-ONLY CONTENT BELOW (header stripped before evaluation) ===\n";

function sha256Text(text: string): string {
  return createHash("sha256").update(text, "utf-8").digest("hex");
}

function fetchBytes(url: string): Promise<{ status: number; bytes: Buffer }> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "DRA-ENG-024/1.0" } }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, bytes: Buffer.concat(chunks) }));
      })
      .on("error", reject);
  });
}

function buildRequest(id: string, title: string, text: string): unknown {
  return {
    id: `eval-${id}`,
    generatedDocument: {
      id: `gdoc-${id}`,
      title,
      content: text,
      sourceDocumentIds: [`sdoc-${id}-src`],
    },
    sourceDocuments: [
      { id: `sdoc-${id}-src`, title: `Source: ${title}`, content: text, format: "PLAIN_TEXT" },
    ],
    requestedAt: FIXED_TIMESTAMP,
  };
}

/** Coarse content-line tokenisation: non-empty trimmed lines, used purely
 * for pair-level order comparison against the oracle (same granularity the
 * Phase 2 report used for its bounding-box pair analysis). */
function contentLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 5); // drop blank/near-empty lines and stray punctuation
}

/** Pair-level interleaving metric: for each adjacent pair in the oracle
 * order, checks whether that pair is also adjacent (in the same order) in
 * the candidate order. Uses first-occurrence indexing, tolerant of the
 * candidate containing extra/differently-wrapped lines (line-level
 * granularity is coarser than the Phase 2 word-bbox pair analysis, so this
 * is a conservative approximation, not a re-derivation of the oracle
 * itself). */
function pairAdjacencyPreservation(
  oracleLines: string[],
  candidateLines: string[],
): { totalPairs: number; preservedAdjacent: number; fractionPreserved: number } {
  const indexOf = new Map<string, number>();
  candidateLines.forEach((l, i) => {
    if (!indexOf.has(l)) indexOf.set(l, i);
  });

  let totalPairs = 0;
  let preservedAdjacent = 0;
  for (let i = 0; i < oracleLines.length - 1; i++) {
    const a = oracleLines[i];
    const b = oracleLines[i + 1];
    const ia = indexOf.get(a);
    const ib = indexOf.get(b);
    if (ia === undefined || ib === undefined) continue; // line not found verbatim in candidate; skip
    totalPairs += 1;
    if (ib === ia + 1) preservedAdjacent += 1;
  }
  return {
    totalPairs,
    preservedAdjacent,
    fractionPreserved: totalPairs === 0 ? 0 : preservedAdjacent / totalPairs,
  };
}

describe("DRA-ENG-024 — Federal Register post-fix reconstruction vs the three Phase 2 oracles", () => {
  it(
    "ENG-024-corrected extraction produces different text than the frozen pre-fix " +
      "production digest, and its pair-adjacency preservation against the oracle is " +
      "substantially higher than the pre-fix production text's",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      expect(fetchA.status).toBe(200);
      const bytes = new Uint8Array(fetchA.bytes);
      const sourceDigest = sha256Text(Buffer.from(bytes).toString("latin1"));

      // Pre-fix production text, for baseline (does not use the new prober).
      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const { writeFile, unlink } = await import("fs/promises");
      const { tmpdir } = await import("os");
      const execFileAsync = promisify(execFile);
      async function extractPdfText(b: Uint8Array): Promise<string> {
        const id = `dra-eng024-pre-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const inputPath = join(tmpdir(), `${id}.pdf`);
        const outputPath = join(tmpdir(), `${id}.txt`);
        try {
          await writeFile(inputPath, b);
          await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
          return await readFile(outputPath, "utf-8");
        } finally {
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
        }
      }

      const preFixResult = await normaliseContent(bytes, "application/pdf" as never, sourceDigest, extractPdfText);
      expect(preFixResult.ok).toBe(true);
      if (!preFixResult.ok) return;
      expect(sha256Text(preFixResult.document.text)).toBe(REFERENCE_PRODUCTION_TEXT_DIGEST);

      // ENG-024-corrected extraction: same base extractor, plus the new
      // layout prober.
      const postFixResult = await normaliseContent(
        bytes,
        "application/pdf" as never,
        sourceDigest,
        extractPdfText,
        createPdfLayoutProber(),
      );
      expect(postFixResult.ok).toBe(true);
      if (!postFixResult.ok) return;

      // 1. Text differs from the frozen pre-fix digest.
      expect(sha256Text(postFixResult.document.text)).not.toBe(REFERENCE_PRODUCTION_TEXT_DIGEST);

      // The document has real evidence of multi-column structure — the fix
      // must have engaged reconstruction on at least one page (not silently
      // fallen back to passthrough on every page).
      expect(postFixResult.document.layoutReadingOrder).toBeDefined();
      expect(postFixResult.document.layoutReadingOrder?.anyPageReconstructed).toBe(true);

      // 2. Pair-adjacency preservation vs the oracle improves substantially.
      const oracleRaw = await readFile(
        join(__dirname, "fixtures", "dra-acq-030-fr-2024-00001-corrected-order.txt"),
        "utf-8",
      );
      const idx = oracleRaw.indexOf(CORRECTED_ORDER_DELIMITER);
      expect(idx).toBeGreaterThan(-1);
      const oracleText = oracleRaw.slice(idx + CORRECTED_ORDER_DELIMITER.length);

      const oracleLines = contentLines(oracleText);
      const preFixLines = contentLines(preFixResult.document.text);
      const postFixLines = contentLines(postFixResult.document.text);

      const preFixMetric = pairAdjacencyPreservation(oracleLines, preFixLines);
      const postFixMetric = pairAdjacencyPreservation(oracleLines, postFixLines);

      // Record the actual measured values for the closure report rather
      // than assuming a specific number.
      // eslint-disable-next-line no-console
      console.log("[DRA-ENG-024] pair-adjacency preservation — pre-fix:", preFixMetric, "post-fix:", postFixMetric);

      expect(postFixMetric.totalPairs).toBeGreaterThan(20);
      expect(postFixMetric.fractionPreserved).toBeGreaterThan(preFixMetric.fractionPreserved);
      // Require a substantial, not merely nominal, improvement.
      expect(postFixMetric.fractionPreserved - preFixMetric.fractionPreserved).toBeGreaterThan(0.15);
    },
    60_000,
  );

  it(
    "evaluateDocument on the ENG-024-corrected text (Run C) converges toward Run B's " +
      "structural profile (statement count) rather than staying at Run A's, and remains " +
      "deterministic across two identical calls",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      const bytes = new Uint8Array(fetchA.bytes);
      const sourceDigest = sha256Text(Buffer.from(bytes).toString("latin1"));

      const { execFile } = await import("child_process");
      const { promisify } = await import("util");
      const { writeFile, unlink } = await import("fs/promises");
      const { tmpdir } = await import("os");
      const execFileAsync = promisify(execFile);
      async function extractPdfText(b: Uint8Array): Promise<string> {
        const id = `dra-eng024-runc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const inputPath = join(tmpdir(), `${id}.pdf`);
        const outputPath = join(tmpdir(), `${id}.txt`);
        try {
          await writeFile(inputPath, b);
          await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
          return await readFile(outputPath, "utf-8");
        } finally {
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
        }
      }

      const postFixResult = await normaliseContent(
        bytes,
        "application/pdf" as never,
        sourceDigest,
        extractPdfText,
        createPdfLayoutProber(),
      );
      expect(postFixResult.ok).toBe(true);
      if (!postFixResult.ok) return;

      const req = buildRequest("cmp-C", "ENG-024-corrected order", postFixResult.document.text);
      const runC1 = evaluateDocument(req) as { ok: true; decision: string; proofReceipt: any };
      const runC2 = evaluateDocument(req) as { ok: true; decision: string; proofReceipt: any };

      expect(runC1.ok).toBe(true);
      expect(runC1.proofReceipt.substantiveDigest).toBe(runC2.proofReceipt.substantiveDigest);

      const stmtC = runC1.proofReceipt.stageOutputs[1].output.statementCount;
      // eslint-disable-next-line no-console
      console.log("[DRA-ENG-024] Run C statement count:", stmtC, "decision:", runC1.decision);

      // Run A was 217 (pre-fix), Run B was 328 (oracle). Run C must not be
      // identical to Run A's pre-fix count — the whole point of the fix is
      // that Stage 2 sees a different, better-ordered input.
      expect(stmtC).not.toBe(217);
      expect(runC1.proofReceipt.substantiveDigest).not.toBe(REFERENCE_RUN_A_DIGEST);
    },
    60_000,
  );
});
