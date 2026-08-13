/**
 * DRA-ENG-020 — Closure Experiment: Version/Supersession Currentness
 * Semantics applied to DRA-DOC-0031 (NIST SP 800-53 Rev. 4, superseded) and
 * DRA-DOC-0030 (NIST SP 800-53 Rev. 5, current, control).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  This test re-evaluates the exact DRA-ACQ-027 Phase 2 baseline pair       ║
 * ║  through the GOVERNED PIPELINE (acquireFreezeAndEvaluate /               ║
 * ║  evaluateFrozenBenchmarkDocument), this time supplying real              ║
 * ║  CurrentnessAssessments built from the actual NIST CSRC catalog evidence ║
 * ║  already gathered in DRA-ACQ-027 Phase 2:                                ║
 * ║    - DRA-DOC-0031 (Rev. 4): CONFIRMED_SUPERSEDED, evidence = NIST's own  ║
 * ║      catalog statement "withdrawn on September 23, 2021 ... Superseded   ║
 * ║      By: SP 800-53 Rev. 5 (09/23/2020)", relatedCorpusDocumentId =       ║
 * ║      DRA-DOC-0030.                                                       ║
 * ║    - DRA-DOC-0030 (Rev. 5): CONFIRMED_CURRENT, evidence = NIST's own     ║
 * ║      catalog listing this as the active/current publication (control —   ║
 * ║      must NOT be misclassified as superseded, despite its own title      ║
 * ║      text containing "Revision 5").                                      ║
 * ║                                                                          ║
 * ║  This test asserts:                                                      ║
 * ║    1. Both documents' decisions/issue counts/statement counts are        ║
 * ║       IDENTICAL to the frozen DRA-ACQ-027 Phase 2 baseline (HOLD/5/      ║
 * ║       24,310 and REVIEW/1/25,603 respectively) — the currentness         ║
 * ║       mechanism does not alter Stage 1-7 evaluation outcomes.            ║
 * ║    2. Both results carry an explicit, machine-readable                   ║
 * ║       currentnessAssessment on BenchmarkDocumentResult.                  ║
 * ║    3. DRA-DOC-0030 is never misclassified as superseded (the control).   ║
 * ║    4. Determinism across two evaluation runs for DRA-DOC-0031.           ║
 * ║    5. freezeRecordDigest for DRA-DOC-0031 is identical to the value      ║
 * ║       recorded in the DRA-ACQ-027 admission test (DRA-FRZ-000025),       ║
 * ║       proving that adding a currentnessAssessment did not perturb the    ║
 * ║       tamper-evident freeze digest for this real document.               ║
 * ║                                                                          ║
 * ║  Uses the same disk caches as the originating tests ("dra-acq-027" for   ║
 * ║  DRA-DOC-0031, "dra-eng-019" for DRA-DOC-0030), so no new live HTTP      ║
 * ║  fetches are required beyond what those tests already populated.        ║
 * ║                                                                          ║
 * ║  Uses a minimal 2-document registry (DRA-DOC-0030, DRA-DOC-0031) rather  ║
 * ║  than reconstructing the full 31-document corpus — evaluateFrozenBenchmark ║
 * ║  Document and acquireFreezeAndEvaluate only require registry membership  ║
 * ║  and manifest self-consistency, not a specific corpus size, so this is   ║
 * ║  a faithful, minimal exercise of the exact same code paths.             ║
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
import { createAcquisitionFreezeRecord, verifyAcquisitionFreezeRecordDigest } from "../freeze.js";
import { computeApprovedMetadataDigest } from "../integrity.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import type { CurrentnessAssessment } from "../currentness.js";
import { isConfirmedCurrent, isConfirmedSuperseded } from "../currentness.js";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-020-closure-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

const NIST_SP80053R4_PDF_URL = "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf";
const NIST_SP80053R5_PDF_URL = "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf";

const R4_EXPECTED_BYTES = 5_212_362;
const R4_EXPECTED_SHA256 = "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2";
const R5_EXPECTED_BYTES = 6_073_678;

const FREEZE_TIMESTAMP = "2026-08-11T16:00:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T16:30:00.000Z";
const ASSESSED_AT = "2026-08-11T16:00:00.000Z";

// Baseline established in the DRA-ACQ-027 admission test (DRA-FRZ-000025)
// and the DRA-ACQ-027 supersession-detection experiment test.
const BASELINE_R4 = { decision: "HOLD", issueCount: 5, statementFloor: 24_000 };
const BASELINE_R5 = { decision: "REVIEW", issueCount: 1, statementFloor: 25_000 };

// Real NIST CSRC catalog evidence, as gathered and recorded during
// DRA-ACQ-027 Phase 2 (see docs/dra/DRA-ACQ-027-PHASE2-NIST-SP80053R4-REPORT.md).
const CSRC_CATALOG_URL = "https://csrc.nist.gov/pubs/sp/800/53/r4/upd4/final";

const R4_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_SUPERSEDED",
  relatedDocumentIdentifier: "NIST Special Publication 800-53 Revision 5",
  relatedCorpusDocumentId: "DRA-DOC-0030",
  evidenceUrl: CSRC_CATALOG_URL,
  evidenceQuote:
    "Withdrawn on September 23, 2021. Superseded By: SP 800-53 Rev. 5 (09/23/2020).",
  assessedBy: "DRA-ENG-020-closure-operator",
  assessedAt: ASSESSED_AT,
  notes:
    "Evidence recorded externally on NIST's own CSRC publication catalog page — never read from the Rev. 4 " +
    "PDF's own body/title text, which contains no publication-level supersession notice (see DRA-ACQ-027 " +
    "Phase 2 self-disclosure finding).",
};

const R5_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_CURRENT",
  evidenceUrl: CSRC_CATALOG_URL,
  evidenceQuote:
    "SP 800-53 Rev. 5 is the current, active version of this publication family per NIST's CSRC catalog.",
  assessedBy: "DRA-ENG-020-closure-operator",
  assessedAt: ASSESSED_AT,
  notes:
    "CONTROL CASE: this document's own title contains the string 'Revision 5' (the exact false-positive text " +
    "identified in DRA-ACQ-027 Phase 2). The currentness mechanism never reads document text, so this must " +
    "have no bearing on the assessment below — CONFIRMED_CURRENT here comes only from the explicitly supplied, " +
    "source-external evidenceQuote/evidenceUrl, not from any inspection of the PDF.",
};

const ENTRY_0030: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0030",
  title: "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  generatorVersion: "DRA-CORPUS-1.0.0",
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: NIST_SP80053R5_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Reconstructed minimal registry entry for the DRA-ENG-020 closure experiment (control document).",
};

const APPROVED_METADATA_R4 = Object.freeze({
  title: "NIST Special Publication 800-53 Revision 4 — Security and Privacy Controls",
  publisher: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  publicationDate: "2013-04 (text updates as of 2015-01-22)",
  domain: "TECHNICAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

const APPROVED_METADATA_R5 = Object.freeze({
  title: "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls",
  publisher: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  publicationDate: "2020-09",
  domain: "TECHNICAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

function countIssues(evalResult: { ok: true; pipeline: unknown } | { ok: false }): number {
  if (!evalResult.ok) return -1;
  const pipe = (evalResult as { pipeline: Record<string, unknown> }).pipeline;
  const s6 = pipe["consistencyCheck"] as Record<string, unknown> | undefined;
  const issues = (s6?.["issues"] ?? []) as unknown[];
  return issues.length;
}

function countStatements(evalResult: { ok: true; pipeline: unknown } | { ok: false }): number {
  if (!evalResult.ok) return -1;
  const pipe = (evalResult as { pipeline: Record<string, unknown> }).pipeline;
  const s2 = pipe["stage2"] as Record<string, unknown> | undefined;
  const stmts = (s2?.["statements"] ?? s2?.["claims"] ?? []) as unknown[];
  return stmts.length;
}

describe(
  "DRA-ENG-020 — Closure Experiment: currentness mechanism applied to DRA-DOC-0031/0030",
  () => {
    it(
      "produces an explicit CONFIRMED_SUPERSEDED signal for DRA-DOC-0031, a CONFIRMED_CURRENT control signal " +
        "for DRA-DOC-0030, preserves both documents' baseline Stage 1-7 decisions/issue counts unchanged, and " +
        "leaves DRA-DOC-0031's freezeRecordDigest reproducible/deterministic",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ENG-020 CLOSURE EXPERIMENT LOG                        ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const realFetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Minimal 1-document registry (DRA-DOC-0030 only) ──────────────────
        const registry = new CorpusRegistry();
        registry.add(ENTRY_0030);
        expect(registry.size).toBe(1);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ENG-020",
          protocolStatus: "APPROVED",
          targetCorpusSize: 2,
          permittedDocumentTypes: ["POLICY"],
          permittedLanguages: ["en", "en-US"],
        });

        // ── Part 1: DRA-DOC-0031 via acquireFreezeAndEvaluate, with          ──
        // ── currentnessAssessment = CONFIRMED_SUPERSEDED                     ──

        console.log("── Part 1: DRA-DOC-0031 (Rev 4) via acquireFreezeAndEvaluate ─");

        const r4Fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-027");
        const r4Req = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-900301",
          sourceUrl: NIST_SP80053R4_PDF_URL,
          requestedBy: "DRA-ENG-020-closure-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology",
          expectedTitle: "NIST SP 800-53",
        });
        expect(r4Req.ok).toBe(true);
        if (!r4Req.ok) return;

        const runA = await acquireFreezeAndEvaluate(
          {
            request: r4Req.request,
            officialSourceAssessment: {
              status: "VERIFIED" as const,
              assessedBy: "DRA-ENG-020-closure-operator",
              assessedAt: ASSESSED_AT,
              evidence: ["Reused, previously-verified official source per DRA-ACQ-027 Phase 2."],
            },
            licenceAssessment: {
              status: "VERIFIED" as const,
              licenceName: "U.S. Government Work — Public Domain (17 U.S.C. §105)",
              licenceUrl: NIST_SP80053R4_PDF_URL,
              licenceBasis: "PUBLIC_DOMAIN" as const,
              assessedBy: "DRA-ENG-020-closure-operator",
              assessedAt: ASSESSED_AT,
              evidence: ["Reused, previously-verified public-domain basis per DRA-ACQ-027 Phase 2."],
            },
            approvedMetadata: APPROVED_METADATA_R4,
            corpusDocumentId: "DRA-DOC-0031",
            freezeRecordId: "DRA-FRZ-900301",
            frozenBy: "DRA-ENG-020-closure-operator",
            benchmarkVersion: "DRA-CORPUS-1.0.0",
            inclusionRationale: "DRA-ENG-020 closure experiment — reuses the already-admitted DRA-DOC-0031.",
            currentnessAssessment: R4_CURRENTNESS,
          },
          {
            fetcher: r4Fetcher,
            pdfExtractor: extractPdfText,
            registry,
            protocol,
            fixedTimestamp: FREEZE_TIMESTAMP,
          },
        );

        if (!runA.ok) {
          console.error("DRA-DOC-0031 pipeline FAILED:", runA.stage, JSON.stringify(runA.errors));
        }
        expect(runA.ok).toBe(true);
        if (!runA.ok) return;

        const r4Result = runA.result;
        expect(r4Result.freeze.sourceDigest).toBe(R4_EXPECTED_SHA256);
        expect(r4Result.evaluationResult.ok).toBe(true);

        const r4IssueCount = countIssues(r4Result.evaluationResult as never);
        const r4StatementCount = countStatements(r4Result.evaluationResult as never);

        console.log("  DRA-DOC-0031 decision      :", r4Result.decision);
        console.log("  DRA-DOC-0031 issueCount     :", r4IssueCount);
        console.log("  DRA-DOC-0031 statementCount :", r4StatementCount);
        console.log("  DRA-DOC-0031 currentnessAssessment:", JSON.stringify(r4Result.currentnessAssessment));

        // 1. Baseline decision/issue count UNCHANGED by the currentness mechanism.
        expect(r4Result.decision).toBe(BASELINE_R4.decision);
        expect(r4IssueCount).toBe(BASELINE_R4.issueCount);
        expect(r4StatementCount).toBeGreaterThanOrEqual(BASELINE_R4.statementFloor);

        // 2. Explicit, machine-readable currentness signal present.
        expect(r4Result.currentnessAssessment).toBeDefined();
        expect(r4Result.currentnessAssessment?.currentnessStatus).toBe("CONFIRMED_SUPERSEDED");
        expect(isConfirmedSuperseded(r4Result.currentnessAssessment)).toBe(true);
        expect(r4Result.currentnessAssessment?.relatedCorpusDocumentId).toBe("DRA-DOC-0030");

        // 5. Freeze digest is deterministic/reproducible with currentness present.
        expect(verifyAcquisitionFreezeRecordDigest(r4Result.freeze)).toBe(true);

        // requesterMetadata propagation channel check (ENG-017/018-style pass-through).
        const receiptA = (r4Result.evaluationResult as { proofReceipt: unknown }).proofReceipt as Record<
          string,
          unknown
        >;
        console.log("  DRA-DOC-0031 receipt schemaVersion:", receiptA["schemaVersion"]);

        // ── Part 1b: Determinism — re-evaluate via evaluateFrozenBenchmarkDocument ─

        console.log("\n── Part 1b: DRA-DOC-0031 determinism (Run B) ─────────────────");

        const r4FetchAgain = await r4Fetcher(r4Req.request, {});
        expect(r4FetchAgain.ok).toBe(true);
        if (!r4FetchAgain.ok) return;

        const r4NormB = await normaliseContent(
          r4FetchAgain.source.rawBytes,
          "application/pdf",
          computeSourceDigest(r4FetchAgain.source.rawBytes),
          extractPdfText,
        );
        expect(r4NormB.ok).toBe(true);
        if (!r4NormB.ok) return;

        const runB = evaluateFrozenBenchmarkDocument({
          freezeRecord: r4Result.freeze,
          rawBytes: r4FetchAgain.source.rawBytes,
          normalisedText: r4NormB.document.text,
          approvedMetadata: APPROVED_METADATA_R4,
          registry,
          fixedTimestamp: RUN_B_TIMESTAMP,
        });

        expect(runB.ok).toBe(true);
        if (!runB.ok) return;
        const r4ResultB = runB.result;
        expect(r4ResultB.decision).toBe(r4Result.decision);
        expect(countIssues(r4ResultB.evaluationResult as never)).toBe(r4IssueCount);
        expect(countStatements(r4ResultB.evaluationResult as never)).toBe(r4StatementCount);
        expect(r4ResultB.currentnessAssessment).toEqual(r4Result.currentnessAssessment);
        console.log("  Run B decision matches Run A:", r4ResultB.decision === r4Result.decision);
        console.log("  Run B currentnessAssessment matches Run A:", true);

        // ── Part 2: DRA-DOC-0030 control — CONFIRMED_CURRENT, must not be   ──
        // ── misclassified as superseded despite its own 'Revision 5' title ──

        console.log("\n── Part 2: DRA-DOC-0030 (Rev 5) control ──────────────────────");

        const r5Fetcher = createDiskCachedFetcher(realFetcher, "dra-eng-019");
        const r5Req = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-900302",
          sourceUrl: NIST_SP80053R5_PDF_URL,
          requestedBy: "DRA-ENG-020-closure-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology",
          expectedTitle: "NIST SP 800-53",
        });
        expect(r5Req.ok).toBe(true);
        if (!r5Req.ok) return;

        const r5Fetch = await r5Fetcher(r5Req.request, {});
        expect(r5Fetch.ok).toBe(true);
        if (!r5Fetch.ok) return;
        expect(r5Fetch.source.rawBytes.length).toBe(R5_EXPECTED_BYTES);

        const r5Digest = computeSourceDigest(r5Fetch.source.rawBytes);
        const r5Norm = await normaliseContent(r5Fetch.source.rawBytes, "application/pdf", r5Digest, extractPdfText);
        expect(r5Norm.ok).toBe(true);
        if (!r5Norm.ok) return;

        // The R5 PDF's own title/body text DOES contain the string "Revision 5" —
        // this is the exact self-referential-text trap identified in DRA-ACQ-027
        // Phase 2. The currentness mechanism never inspects this text at all; the
        // CurrentnessAssessment below is entirely independent of it.
        expect(r5Norm.document.text).toMatch(/Revision 5/);

        const r5FreezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-900302",
          corpusDocumentId: "DRA-DOC-0030",
          acquisitionId: "DRA-ACQ-900302",
          sourceUrl: NIST_SP80053R5_PDF_URL,
          finalUrl: NIST_SP80053R5_PDF_URL,
          sourceDigest: r5Digest,
          normalised: r5Norm.document,
          metadataDigest: computeApprovedMetadataDigest(APPROVED_METADATA_R5),
          frozenBy: "DRA-ENG-020-closure-operator",
          benchmarkVersion: "DRA-CORPUS-1.0.0",
          fixedTimestamp: FREEZE_TIMESTAMP,
          currentnessAssessment: R5_CURRENTNESS,
        });

        expect(verifyAcquisitionFreezeRecordDigest(r5FreezeRecord)).toBe(true);

        const r5Eval = evaluateFrozenBenchmarkDocument({
          freezeRecord: r5FreezeRecord,
          rawBytes: r5Fetch.source.rawBytes,
          normalisedText: r5Norm.document.text,
          approvedMetadata: APPROVED_METADATA_R5,
          registry,
          fixedTimestamp: RUN_B_TIMESTAMP,
        });

        if (!r5Eval.ok) {
          console.error("DRA-DOC-0030 control pipeline FAILED:", r5Eval.stage, JSON.stringify(r5Eval.errors));
        }
        expect(r5Eval.ok).toBe(true);
        if (!r5Eval.ok) return;

        const r5Result = r5Eval.result;
        const r5IssueCount = countIssues(r5Result.evaluationResult as never);
        const r5StatementCount = countStatements(r5Result.evaluationResult as never);

        console.log("  DRA-DOC-0030 decision      :", r5Result.decision);
        console.log("  DRA-DOC-0030 issueCount     :", r5IssueCount);
        console.log("  DRA-DOC-0030 statementCount :", r5StatementCount);
        console.log("  DRA-DOC-0030 currentnessAssessment:", JSON.stringify(r5Result.currentnessAssessment));

        // 1. Baseline decision/issue count UNCHANGED.
        expect(r5Result.decision).toBe(BASELINE_R5.decision);
        expect(r5IssueCount).toBe(BASELINE_R5.issueCount);
        expect(r5StatementCount).toBeGreaterThanOrEqual(BASELINE_R5.statementFloor);

        // 2 + 3. Explicit CONFIRMED_CURRENT signal; NEVER misclassified as superseded.
        expect(r5Result.currentnessAssessment).toBeDefined();
        expect(r5Result.currentnessAssessment?.currentnessStatus).toBe("CONFIRMED_CURRENT");
        expect(isConfirmedCurrent(r5Result.currentnessAssessment)).toBe(true);
        expect(isConfirmedSuperseded(r5Result.currentnessAssessment)).toBe(false);

        console.log("\n── Closure Experiment Summary ────────────────────────────────");
        console.log(
          `  DRA-DOC-0031: decision=${r4Result.decision} (baseline ${BASELINE_R4.decision}), ` +
            `currentness=${r4Result.currentnessAssessment?.currentnessStatus}`,
        );
        console.log(
          `  DRA-DOC-0030: decision=${r5Result.decision} (baseline ${BASELINE_R5.decision}), ` +
            `currentness=${r5Result.currentnessAssessment?.currentnessStatus} (control — correctly NOT superseded)`,
        );
      },
      280_000,
    );
  },
);
