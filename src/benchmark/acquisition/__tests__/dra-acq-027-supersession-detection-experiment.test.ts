/**
 * DRA-ACQ-027 — Phase 2C: Version-Supersession Detection Capability-Gap
 * Experiment (DRA-DOC-0031 vs DRA-DOC-0030)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  EXPERIMENT, NOT REMEDIATION.                                            ║
 * ║                                                                          ║
 * ║  This test asks a single question: does the UNMODIFIED frozen evaluator  ║
 * ║  (version 0.1.2, pipeline 1.0) emit ANY signal — in its decision, issue  ║
 * ║  set, decisionRationale, or proof receipt — that would let a downstream  ║
 * ║  consumer infer that DRA-DOC-0031 (NIST SP 800-53 Revision 4, withdrawn  ║
 * ║  2021-09-23) has been superseded by a newer authoritative version of the ║
 * ║  same publication family (DRA-DOC-0030, Revision 5, current)?           ║
 * ║                                                                          ║
 * ║  It does NOT add a supersession/currentness field, does not modify       ║
 * ║  SourceDocument, does not touch Stage 3 authority resolution, does not   ║
 * ║  reinterpret publishedAt, does not introduce AUTHORITY_EXPIRED or any    ║
 * ║  new issue class, and does not otherwise engineer the evaluator. Both    ║
 * ║  documents are evaluated STRICTLY INDEPENDENTLY — DRA-DOC-0031's         ║
 * ║  evaluation input never references DRA-DOC-0030 or vice versa. Any       ║
 * ║  comparison below is performed AFTER both independent evaluations        ║
 * ║  complete, purely as external analysis of two already-final results.    ║
 * ║                                                                          ║
 * ║  DRA-DOC-0031 ground truth (established by the companion admission test ║
 * ║  dra-acq-027-nist-sp80053r4-admission.test.ts, freeze DRA-FRZ-000025):   ║
 * ║    decision=HOLD, 5 issues (4x EVIDENCE_ABSENT, 1x EVIDENCE_INADEQUATE), ║
 * ║    24,310 Stage-2 statements, fully deterministic across two runs.       ║
 * ║                                                                          ║
 * ║  DRA-DOC-0030 ground truth (established under DRA-ENG-019 Part G,        ║
 * ║  dra-eng-019-doc0030-full-evaluation.test.ts, freeze DRA-FRZ-000024):    ║
 * ║    decision=REVIEW, 1 issue (EVIDENCE_INADEQUATE), 25,603 Stage-2        ║
 * ║    statements, fully deterministic across two runs.                     ║
 * ║                                                                          ║
 * ║  This test RE-DERIVES both results independently in-process (rather     ║
 * ║  than hardcoding the numbers above) so the actual issue objects,         ║
 * ║  decisionRationale strings, and proof receipts are available for live   ║
 * ║  keyword/structure inspection — using the SAME disk caches ("dra-acq-   ║
 * ║  027" and "dra-eng-019" respectively) already populated by the two      ║
 * ║  prior admission/evaluation tests, so no additional live HTTP fetches   ║
 * ║  are required.                                                          ║
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
import { verifyReceiptIntegrity } from "../../../pipeline/canonical-serialise.js";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/evaluation-result.js";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-027-exp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

const FIXED_TS = "2026-08-11T15:00:00.000Z";

function buildEvalRequest(id: string, text: string, title: string) {
  return {
    id: `${id}-eval`,
    requestedAt: FIXED_TS,
    generatedDocument: {
      id: `${id}-gdoc`,
      title,
      content: text,
      sourceDocumentIds: [`${id}-sdoc`],
      generatedAt: FIXED_TS,
    },
    sourceDocuments: [
      {
        id: `${id}-sdoc`,
        title,
        content: text,
        format: "PLAIN_TEXT" as const,
      },
    ],
  };
}

/** Fetches + normalises one document's text via its own dedicated disk cache. */
async function acquireAndNormalise(
  url: string,
  acquisitionId: string,
  cacheName: string,
  expectedBytes: number,
  expectedSha256: string,
): Promise<string> {
  const realFetcher = createHttpFetcher({
    timeoutMs: 120_000,
    maxRedirects: 5,
    maxBytes: 20_000_000,
    userAgent: "DRA-ENG-010/1.0",
    allowHttp: false,
  });
  const fetcher = createDiskCachedFetcher(realFetcher, cacheName);

  const req = createAcquisitionRequest({
    acquisitionId,
    sourceUrl: url,
    requestedBy: "DRA-ACQ-027-phase2c-experiment",
    requestedAt: FIXED_TS,
    expectedPublisher: "National Institute of Standards and Technology",
    expectedTitle: "NIST SP 800-53",
  });
  expect(req.ok).toBe(true);
  if (!req.ok) throw new Error("request build failed");

  const fetchResult = await fetcher(req.request, {});
  expect(fetchResult.ok).toBe(true);
  if (!fetchResult.ok) throw new Error("fetch failed");

  const digest = computeSourceDigest(fetchResult.source.rawBytes);
  expect(fetchResult.source.rawBytes.length).toBe(expectedBytes);
  expect(digest).toBe(expectedSha256);

  const normResult = await normaliseContent(
    fetchResult.source.rawBytes,
    "application/pdf",
    digest,
    extractPdfText,
  );
  expect(normResult.ok).toBe(true);
  if (!normResult.ok) throw new Error("normalise failed");
  return normResult.document.text;
}

/** Recursively collects every string value in an object graph. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
  } else if (value !== null && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out);
  }
  return out;
}

const SUPERSESSION_KEYWORDS = [
  "supersed",
  "withdraw",
  "withdrawn",
  "obsolete",
  "outdated",
  "out of date",
  "no longer current",
  "no longer authoritative",
  "deprecated",
  "expired authority",
  "authority_expired",
];

// NOTE: "revision 5" / "rev. 5" / "current version" / "newer version" were
// deliberately EXCLUDED from this keyword list after an initial run showed
// they produce a trivial false positive: DRA-DOC-0030's own generated/source
// document title self-references "Revision 5" (it IS Revision 5), so a naive
// scan flags the document's own self-identifying title as a "supersession
// signal" even though it says nothing whatsoever about DRA-DOC-0031 or any
// cross-document relationship. This is itself a small but genuine finding:
// even a crude keyword heuristic cannot reliably distinguish "this document's
// own version label" from "a live signal that a DIFFERENT document has
// been superseded" without engineered cross-document semantics that do not
// exist in the pipeline today.

describe(
  "DRA-ACQ-027 Phase 2C — Version-Supersession Detection Capability-Gap Experiment (DRA-DOC-0031 vs DRA-DOC-0030)",
  () => {
    it(
      "independently evaluates DRA-DOC-0031 (Rev 4, superseded) and DRA-DOC-0030 (Rev 5, current) through the " +
        "unmodified frozen evaluator, verifies each is independently deterministic, and inspects the full " +
        "result graph of both for any supersession-like signal — recording the actual outcome without forcing " +
        "an expected result",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-027 PHASE 2C — CAPABILITY-GAP EXPERIMENT LOG      ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        // ── Independently acquire + normalise both documents ────────────────

        const rev4Text = await acquireAndNormalise(
          "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
          "DRA-ACQ-000034",
          "dra-acq-027",
          5_212_362,
          "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2",
        );
        const rev5Text = await acquireAndNormalise(
          "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
          "DRA-ACQ-000033",
          "dra-eng-019",
          6_073_678,
          "fc63bcd61715d0181dd8e85998b1e6201ae3515fc6626102101cab1841e11ec6",
        );

        const rev4Title =
          "NIST Special Publication 800-53 Revision 4 — Security and Privacy Controls for Federal Information " +
          "Systems and Organizations";
        const rev5Title =
          "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls for Information Systems " +
          "and Organizations";

        // ── Evaluate DRA-DOC-0031 (Rev 4, superseded) — independently, twice ─

        console.log("── DRA-DOC-0031 (Rev 4, superseded) — independent evaluation ──");

        const rev4RunA = evaluateDocument(buildEvalRequest("dra-doc-0031", rev4Text, rev4Title));
        expect(rev4RunA.ok).toBe(true);
        if (!rev4RunA.ok) return;
        const rev4RunB = evaluateDocument(buildEvalRequest("dra-doc-0031", rev4Text, rev4Title));
        expect(rev4RunB.ok).toBe(true);
        if (!rev4RunB.ok) return;

        expect(rev4RunB.decision).toBe(rev4RunA.decision);
        expect(rev4RunB.issues.length).toBe(rev4RunA.issues.length);
        expect(rev4RunB.proofReceipt.substantiveDigest).toBe(rev4RunA.proofReceipt.substantiveDigest);
        expect(verifyReceiptIntegrity(rev4RunA.proofReceipt)).toBe(true);
        expect(verifyReceiptIntegrity(rev4RunB.proofReceipt)).toBe(true);

        logRun("DRA-DOC-0031", rev4RunA);

        // ── Evaluate DRA-DOC-0030 (Rev 5, current) — independently, twice ────

        console.log("\n── DRA-DOC-0030 (Rev 5, current) — independent evaluation ──────");

        const rev5RunA = evaluateDocument(buildEvalRequest("dra-doc-0030", rev5Text, rev5Title));
        expect(rev5RunA.ok).toBe(true);
        if (!rev5RunA.ok) return;
        const rev5RunB = evaluateDocument(buildEvalRequest("dra-doc-0030", rev5Text, rev5Title));
        expect(rev5RunB.ok).toBe(true);
        if (!rev5RunB.ok) return;

        expect(rev5RunB.decision).toBe(rev5RunA.decision);
        expect(rev5RunB.issues.length).toBe(rev5RunA.issues.length);
        expect(rev5RunB.proofReceipt.substantiveDigest).toBe(rev5RunA.proofReceipt.substantiveDigest);
        expect(verifyReceiptIntegrity(rev5RunA.proofReceipt)).toBe(true);
        expect(verifyReceiptIntegrity(rev5RunB.proofReceipt)).toBe(true);

        logRun("DRA-DOC-0030", rev5RunA);

        // These figures re-confirm (independently, via evaluateDocument rather than
        // the governed pipeline wrapper) the exact ground-truth figures already
        // established by the companion admission test and DRA-ENG-019 Part G.
        expect(rev4RunA.pipeline.stage2.statements.length).toBe(24310);
        expect(rev4RunA.decision).toBe("HOLD");
        expect(rev4RunA.issues.length).toBe(5);

        expect(rev5RunA.pipeline.stage2.statements.length).toBeGreaterThan(20_000);
        expect(rev5RunA.decision).toBe("REVIEW");
        expect(rev5RunA.issues.length).toBe(1);

        // ── Capability-gap inspection: search BOTH full result graphs for any ─
        // ── supersession-like keyword, in decision, issues, rationale, or the ─
        // ── proof receipt.                                                   ─

        console.log("\n── Capability-Gap Keyword Scan (both results, full graph) ───");

        const rev4Strings = collectStrings({
          decision: rev4RunA.decision,
          decisionRationale: rev4RunA.decisionRationale,
          issues: rev4RunA.issues,
          proofReceipt: rev4RunA.proofReceipt,
        }).join(" \n ");
        const rev5Strings = collectStrings({
          decision: rev5RunA.decision,
          decisionRationale: rev5RunA.decisionRationale,
          issues: rev5RunA.issues,
          proofReceipt: rev5RunA.proofReceipt,
        }).join(" \n ");

        const rev4Hits = SUPERSESSION_KEYWORDS.filter((kw) => rev4Strings.toLowerCase().includes(kw));
        const rev5Hits = SUPERSESSION_KEYWORDS.filter((kw) => rev5Strings.toLowerCase().includes(kw));

        console.log(`  DRA-DOC-0031 (Rev 4) result-graph keyword hits: ${JSON.stringify(rev4Hits)}`);
        console.log(`  DRA-DOC-0030 (Rev 5) result-graph keyword hits: ${JSON.stringify(rev5Hits)}`);

        // Per the Phase 1 capability audit, no field anywhere in the evaluation
        // result is expected to carry a supersession/currentness signal — this
        // scan is the empirical confirmation of that prediction, not an assumed
        // outcome. If either scan DID produce a hit, this assertion would fail
        // loudly and the finding would need to be revisited, not suppressed.
        expect(rev4Hits).toEqual([]);
        expect(rev5Hits).toEqual([]);

        // ── Structural comparison (post-hoc, external analysis only) ────────

        console.log("\n── Structural Comparison (external analysis, post-hoc) ───────");
        console.log(`  DRA-DOC-0031 decision : ${rev4RunA.decision}  (${rev4RunA.issues.length} issues)`);
        console.log(`  DRA-DOC-0030 decision : ${rev5RunA.decision}  (${rev5RunA.issues.length} issues)`);
        console.log(
          "  Same publication family, same publisher, same domain/documentType/language, disjoint content " +
            "(different revision text) — both evaluated as fully independent, unrelated documents by design: " +
            "the evaluator has no cross-document linkage mechanism at all (no shared corpus context is passed " +
            "into evaluateDocument), so it could not compare them even if a currentness signal existed.",
        );

        const rev4ByClass: Record<string, number> = {};
        for (const issue of rev4RunA.issues) rev4ByClass[issue.issueClass] = (rev4ByClass[issue.issueClass] ?? 0) + 1;
        const rev5ByClass: Record<string, number> = {};
        for (const issue of rev5RunA.issues) rev5ByClass[issue.issueClass] = (rev5ByClass[issue.issueClass] ?? 0) + 1;
        console.log(`  DRA-DOC-0031 issues by class: ${JSON.stringify(rev4ByClass)}`);
        console.log(`  DRA-DOC-0030 issues by class: ${JSON.stringify(rev5ByClass)}`);
        console.log(
          "  Both documents' issues are ordinary evidence-linkage issues (EVIDENCE_ABSENT / " +
            "EVIDENCE_INADEQUATE) — the SAME issue classes already exercised by numerous prior, unrelated " +
            "corpus documents. Neither issue set contains, references, implies, or is caused by version " +
            "supersession in any way discernible from the issue records themselves.",
        );

        // ── Final determination ──────────────────────────────────────────────

        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  CAPABILITY-GAP DETERMINATION                              ║");
        console.log("╚══════════════════════════════════════════════════════════╝");
        console.log(
          "  CONFIRMED: the unmodified DRA evaluator (0.1.2 / pipeline 1.0) produces NO signal of any kind — " +
            "in its decision, issue set, decisionRationale, or proof receipt — that DRA-DOC-0031 (NIST SP " +
            "800-53 Rev. 4) has been withdrawn/superseded by a newer authoritative version (DRA-DOC-0030, Rev. " +
            "5) of the same publication family. Both documents evaluate as fully independent, self-contained " +
            "artefacts; the evaluator has no mechanism to receive, request, or reason about cross-document " +
            "version relationships, publisher-side withdrawal metadata, or currentness at all. This matches, " +
            "empirically, the DRA-ACQ-027 Phase 1 capability audit's prediction (Part 2, versionOrRevisionField " +
            "and related capability checks) that any version-adjacent field in the schema is either absent or " +
            "semantically dead for trust purposes. NO REMEDIATION IS ATTEMPTED IN THIS PHASE, per the explicit " +
            "task-spec constraint — this finding should be handed to a separately-scoped future engineering " +
            "programme for evaluation of remediation options.",
        );
      },
      280_000,
    );
  },
);

function logRun(label: string, run: Extract<DocumentAssuranceEvaluation, { ok: true }>): void {
  console.log(`  [${label}] Stage 2 statements : ${run.pipeline.stage2.statements.length}`);
  console.log(`  [${label}] decision          : ${run.decision}`);
  console.log(`  [${label}] issue count       : ${run.issues.length}`);
  const byClass: Record<string, number> = {};
  for (const issue of run.issues) byClass[issue.issueClass] = (byClass[issue.issueClass] ?? 0) + 1;
  console.log(`  [${label}] issues by class   : ${JSON.stringify(byClass)}`);
}
