/**
 * DRA-ENG-019 — Part G: Full, Untruncated DRA-DOC-0030 Evaluation Under the
 * Corrected (Part D) Stage 4 Implementation
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  This test does what DRA-ACQ-026 Phase 2A/2B explicitly could NOT do:     ║
 * ║  run the complete Stages 1-7 evaluator against the full, untruncated      ║
 * ║  492-page / 25,603-statement NIST SP 800-53 Rev 5 document (DRA-DOC-0030) ║
 * ║  and produce a real SUPPORTED/REVIEW/HOLD decision. It is only possible   ║
 * ║  now because DRA-ENG-019 Part D replaced Stage 4's O(n^2) re-derivation   ║
 * ║  of source-chunk analysis with an O(1)-amortised, WeakMap-cached,         ║
 * ║  bigram-indexed lookup (see semantic-paraphrase.ts and the Part A/C/E     ║
 * ║  tests in src/evidence-linkage/__tests__/).                              ║
 * ║                                                                          ║
 * ║  The document is fetched via the SAME disk-cache used throughout         ║
 * ║  DRA-ENG-019 (cache name "dra-eng-019"), so this test does not repeat    ║
 * ║  the live HTTPS fetch already verified byte-stable in DRA-ACQ-026.       ║
 * ║                                                                          ║
 * ║  The evaluator is run TWICE (Run A, Run B) against byte-identical input  ║
 * ║  to verify determinism: decision, issue count/composition, and the       ║
 * ║  substantive digest (which excludes operational timestamps by design —   ║
 * ║  see canonical-serialise.ts) must match exactly between runs.            ║
 * ║                                                                          ║
 * ║  HISTORICAL RECORD PRESERVED: DRA-FRZ-000024 / DRA-ACQ-000033's admission ║
 * ║  facts (frozen 2026-08-11 in FROZEN status with NO decision, because      ║
 * ║  full Stage 4-7 execution was NOT_COMPLETABLE_IN_CURRENT_EXECUTION_       ║
 * ║  ENVIRONMENT at that time) are NOT altered, recomputed, or overwritten    ║
 * ║  by this test. This is reported as "the first completed evaluation of    ║
 * ║  DRA-DOC-0030's full text under the DRA-ENG-019-corrected Stage 4          ║
 * ║  implementation" — a distinct, later fact layered alongside the          ║
 * ║  admission record, not a replacement of it.                              ║
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
import { normaliseContent } from "../normalisation.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";

import { evaluateDocument } from "../../../pipeline/evaluate-document.js";
import { canonicalJsonStringify, verifyReceiptIntegrity } from "../../../pipeline/canonical-serialise.js";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/evaluation-result.js";

const NIST_SP80053_PDF_URL = "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf";
const EXPECTED_BYTE_LENGTH = 6_073_678;
const EXPECTED_SHA256 = "fc63bcd61715d0181dd8e85998b1e6201ae3515fc6626102101cab1841e11ec6";
const FIXED_REQUEST_TIMESTAMP = "2026-08-11T09:00:00.000Z";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-019-doc0030-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function buildEvalRequest(text: string, title: string) {
  return {
    id: "dra-eng-019-doc0030-full-evaluation",
    requestedAt: FIXED_REQUEST_TIMESTAMP,
    generatedDocument: {
      id: "dra-doc-0030-gdoc",
      title,
      content: text,
      sourceDocumentIds: ["dra-doc-0030-sdoc"],
      generatedAt: FIXED_REQUEST_TIMESTAMP,
    },
    sourceDocuments: [
      {
        id: "dra-doc-0030-sdoc",
        title,
        content: text,
        format: "PLAIN_TEXT" as const,
      },
    ],
  };
}

describe("DRA-ENG-019 Part G — DRA-DOC-0030 full untruncated evaluation under corrected Stage 4", () => {
  it(
    "fetches the full 492-page NIST SP 800-53 Rev 5 PDF (via the ENG-019 disk cache), extracts and normalises " +
      "the complete text, and runs the FULL Stages 1-7 evaluator against all 25,603+ real statements TWICE, " +
      "verifying both runs produce byte-identical decisions/issues/substantive digests and valid proof receipts",
    async () => {
      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });
      const fetcher = createDiskCachedFetcher(realFetcher, "dra-eng-019");

      const req = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000033",
        sourceUrl: NIST_SP80053_PDF_URL,
        requestedBy: "DRA-ENG-019-part-g",
        requestedAt: FIXED_REQUEST_TIMESTAMP,
        expectedPublisher: "National Institute of Standards and Technology",
        expectedTitle: "NIST SP 800-53",
      });
      expect(req.ok).toBe(true);
      if (!req.ok) return;

      const fetchResult = await fetcher(req.request, {});
      expect(fetchResult.ok).toBe(true);
      if (!fetchResult.ok) return;

      const digest = computeSourceDigest(fetchResult.source.rawBytes);
      expect(fetchResult.source.rawBytes.length).toBe(EXPECTED_BYTE_LENGTH);
      expect(digest).toBe(EXPECTED_SHA256);

      const normResult = await normaliseContent(
        fetchResult.source.rawBytes,
        "application/pdf",
        digest,
        extractPdfText,
      );
      expect(normResult.ok).toBe(true);
      if (!normResult.ok) return;
      const text = normResult.document.text;
      expect(text.length).toBeGreaterThan(3_000_000);

      const title =
        "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls for Information Systems " +
        "and Organizations";

      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-019 PART G — DRA-DOC-0030 FULL EVALUATION LOG    ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      // ── Run A ────────────────────────────────────────────────────────────
      const t0 = Date.now();
      const runA = evaluateDocument(buildEvalRequest(text, title));
      const runAMs = Date.now() - t0;

      console.log(`RUN A — total time: ${runAMs} ms`);
      expect(runA.ok).toBe(true);
      if (!runA.ok) return;
      logRun("A", runA);

      // ── Run B (fully independent second execution, identical input) ────
      const t1 = Date.now();
      const runB = evaluateDocument(buildEvalRequest(text, title));
      const runBMs = Date.now() - t1;

      console.log(`\nRUN B — total time: ${runBMs} ms`);
      expect(runB.ok).toBe(true);
      if (!runB.ok) return;
      logRun("B", runB);

      // ── Determinism check ────────────────────────────────────────────────
      console.log("\n── Determinism Check (Run A vs Run B) ───────────────────────");

      expect(runA.pipeline.stage2.statements.length).toBeGreaterThan(20_000);
      expect(runB.pipeline.stage2.statements.length).toBe(runA.pipeline.stage2.statements.length);
      expect(runB.decision).toBe(runA.decision);
      expect(runB.decisionRationale).toBe(runA.decisionRationale);
      expect(runB.issues.length).toBe(runA.issues.length);
      expect(canonicalJsonStringify([...runB.issues].sort((a, b) => a.id.localeCompare(b.id)))).toBe(
        canonicalJsonStringify([...runA.issues].sort((a, b) => a.id.localeCompare(b.id))),
      );
      expect(runB.proofReceipt.substantiveDigest).toBe(runA.proofReceipt.substantiveDigest);
      console.log(`  substantiveDigest (A) : ${runA.proofReceipt.substantiveDigest}`);
      console.log(`  substantiveDigest (B) : ${runB.proofReceipt.substantiveDigest}`);
      console.log(`  substantiveDigest MATCH: ${runA.proofReceipt.substantiveDigest === runB.proofReceipt.substantiveDigest}`);

      // Operational fields are expected to legitimately differ (real wall-clock).
      console.log(`  evaluatedAt (A) : ${runA.evaluatedAt}`);
      console.log(`  evaluatedAt (B) : ${runB.evaluatedAt}`);
      console.log(`  proofReceipt.timestamp (A) : ${runA.proofReceipt.timestamp}`);
      console.log(`  proofReceipt.timestamp (B) : ${runB.proofReceipt.timestamp}`);

      // ── Proof receipt integrity ─────────────────────────────────────────
      const receiptAValid = verifyReceiptIntegrity(runA.proofReceipt);
      const receiptBValid = verifyReceiptIntegrity(runB.proofReceipt);
      console.log(`\n  Run A proof receipt integrity: ${receiptAValid ? "✓ VALID" : "✗ INVALID"}`);
      console.log(`  Run B proof receipt integrity: ${receiptBValid ? "✓ VALID" : "✗ INVALID"}`);
      expect(receiptAValid).toBe(true);
      expect(receiptBValid).toBe(true);

      console.log(
        "\nRESULT: DRA-DOC-0030's full 25,603+-statement text evaluates completely and deterministically " +
          "under the DRA-ENG-019-corrected Stage 4 implementation — the first completed evaluation of this " +
          "document (DRA-FRZ-000024's original 2026-08-11 admission remains FROZEN/no-decision, unaltered).",
      );
    },
    280_000,
  );
});

function logRun(label: string, run: Extract<DocumentAssuranceEvaluation, { ok: true }>): void {
  console.log(`  [Run ${label}] Stage 2 statements : ${run.pipeline.stage2.statements.length}`);
  console.log(`  [Run ${label}] Stage 4 evidence records : ${run.pipeline.stage4.evidenceRecords.length}`);
  console.log(`  [Run ${label}] decision          : ${run.decision}`);
  console.log(`  [Run ${label}] decisionRationale : ${run.decisionRationale}`);
  console.log(`  [Run ${label}] issue count       : ${run.issues.length}`);
  const byClass: Record<string, number> = {};
  for (const issue of run.issues) byClass[issue.issueClass] = (byClass[issue.issueClass] ?? 0) + 1;
  console.log(`  [Run ${label}] issues by class   : ${JSON.stringify(byClass)}`);
}
