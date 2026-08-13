/**
 * DRA-ENG-021 — Closure Experiment: Currentness Evidence Integrity applied
 * to the real DRA-DOC-0031 (NIST SP 800-53 Rev. 4, superseded) / DRA-DOC-0030
 * (Rev. 5, current, control) pair used to close DRA-ENG-020.
 *
 * This is NOT a re-acquisition. It reuses the exact real specimens and disk
 * caches from DRA-ACQ-027 / DRA-ENG-019 / the ENG-020 closure experiment, and
 * demonstrates the ENG-021 integrity layer on top of them:
 *
 *   1. Forward currentness-aware binding: both documents' freeze records gain
 *      a currentnessAssertionDigest, distinct from freezeRecordDigest.
 *   2. Tampering with either document's governed currentness assertion after
 *      the digest was issued is detected by evaluateFrozenBenchmarkDocument
 *      (INTEGRITY / CURRENTNESS_ASSERTION_DIGEST_MISMATCH), without altering
 *      or invalidating freezeRecordDigest.
 *   3. Both documents' pre-existing historical evidence — freezeRecordDigest,
 *      Stage 1-7 decision, issue count, statement count — is UNCHANGED from
 *      the ENG-020 baseline; introducing the integrity layer regresses
 *      nothing.
 *
 * Uses the same disk caches as the originating tests ("dra-acq-027" for
 * DRA-DOC-0031, "dra-eng-019" for DRA-DOC-0030) — no new live HTTP fetches
 * required beyond what those tests already populated.
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
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
  verifyAcquisitionCurrentnessIntegrity,
} from "../freeze.js";
import { computeApprovedMetadataDigest } from "../integrity.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import type { CurrentnessAssessment } from "../currentness.js";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-021-closure-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

const R4_EXPECTED_SHA256 = "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2";
const R5_EXPECTED_BYTES = 6_073_678;

const FREEZE_TIMESTAMP = "2026-08-11T18:00:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T18:30:00.000Z";
const ASSESSED_AT = "2026-08-11T18:00:00.000Z";

// Same ENG-020 baseline (DRA-ACQ-027 Phase 2 / DRA-ENG-019).
const BASELINE_R4 = { decision: "HOLD", issueCount: 5, statementFloor: 24_000 };
const BASELINE_R5 = { decision: "REVIEW", issueCount: 1, statementFloor: 25_000 };

const CSRC_CATALOG_URL = "https://csrc.nist.gov/pubs/sp/800/53/r4/upd4/final";

const R4_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_SUPERSEDED",
  relatedDocumentIdentifier: "NIST Special Publication 800-53 Revision 5",
  relatedCorpusDocumentId: "DRA-DOC-0030",
  evidenceUrl: CSRC_CATALOG_URL,
  evidenceQuote: "Withdrawn on September 23, 2021. Superseded By: SP 800-53 Rev. 5 (09/23/2020).",
  assessedBy: "DRA-ENG-021-closure-operator",
  assessedAt: ASSESSED_AT,
};

const R5_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_CURRENT",
  evidenceUrl: CSRC_CATALOG_URL,
  evidenceQuote: "SP 800-53 Rev. 5 is the current, active version of this publication family per NIST's CSRC catalog.",
  assessedBy: "DRA-ENG-021-closure-operator",
  assessedAt: ASSESSED_AT,
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
  notes: "Reconstructed minimal registry entry for the DRA-ENG-021 closure experiment (control document).",
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

describe("DRA-ENG-021 — Closure Experiment: currentness assertion integrity applied to DRA-DOC-0031/0030", () => {
  it(
    "binds currentnessAssertionDigest for both real documents, detects tampering of either governed " +
      "assertion via evaluateFrozenBenchmarkDocument, and leaves both documents' Stage 1-7 baseline and " +
      "freezeRecordDigest unchanged from the DRA-ENG-020 closure",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ENG-021 CLOSURE EXPERIMENT LOG                        ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });

      const registry = new CorpusRegistry();
      registry.add(ENTRY_0030);
      expect(registry.size).toBe(1);

      const protocol = buildMinimalProtocol({
        protocolId: "DRA-PROTO-ENG-021",
        protocolStatus: "APPROVED",
        targetCorpusSize: 2,
        permittedDocumentTypes: ["POLICY"],
        permittedLanguages: ["en", "en-US"],
      });

      // ── Part 1: DRA-DOC-0031 (Rev 4), CONFIRMED_SUPERSEDED ─────────────────

      console.log("── Part 1: DRA-DOC-0031 (Rev 4) via acquireFreezeAndEvaluate ─");

      const r4Fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-027");
      const r4Req = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-900311",
        sourceUrl: NIST_SP80053R4_PDF_URL,
        requestedBy: "DRA-ENG-021-closure-operator",
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
            assessedBy: "DRA-ENG-021-closure-operator",
            assessedAt: ASSESSED_AT,
            evidence: ["Reused, previously-verified official source per DRA-ACQ-027 Phase 2."],
          },
          licenceAssessment: {
            status: "VERIFIED" as const,
            licenceName: "U.S. Government Work — Public Domain (17 U.S.C. §105)",
            licenceUrl: NIST_SP80053R4_PDF_URL,
            licenceBasis: "PUBLIC_DOMAIN" as const,
            assessedBy: "DRA-ENG-021-closure-operator",
            assessedAt: ASSESSED_AT,
            evidence: ["Reused, previously-verified public-domain basis per DRA-ACQ-027 Phase 2."],
          },
          approvedMetadata: APPROVED_METADATA_R4,
          corpusDocumentId: "DRA-DOC-0031",
          freezeRecordId: "DRA-FRZ-900311",
          frozenBy: "DRA-ENG-021-closure-operator",
          benchmarkVersion: "DRA-CORPUS-1.0.0",
          inclusionRationale: "DRA-ENG-021 closure experiment — reuses the already-admitted DRA-DOC-0031.",
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

      console.log("  DRA-DOC-0031 decision                :", r4Result.decision);
      console.log("  DRA-DOC-0031 issueCount               :", r4IssueCount);
      console.log("  DRA-DOC-0031 freezeRecordDigest        :", r4Result.freeze.freezeRecordDigest);
      console.log("  DRA-DOC-0031 currentnessAssertionDigest:", r4Result.freeze.currentnessAssertionDigest);

      // Baseline unchanged (no Stage 1-7 regression from the integrity layer).
      expect(r4Result.decision).toBe(BASELINE_R4.decision);
      expect(r4IssueCount).toBe(BASELINE_R4.issueCount);
      expect(r4StatementCount).toBeGreaterThanOrEqual(BASELINE_R4.statementFloor);

      // Closure criterion (A): currentness assertion is integrity-bound.
      expect(r4Result.freeze.currentnessAssertionDigest).toMatch(/^[0-9a-f]{64}$/);
      expect(r4Result.freeze.currentnessIntegritySchemaVersion).toBe("dra-currentness-integrity-v1");
      expect(r4Result.proofReference.currentnessAssertionDigest).toBe(
        r4Result.freeze.currentnessAssertionDigest,
      );

      // Closure criterion (D)/(E): freezeRecordDigest untouched; still valid.
      expect(verifyAcquisitionFreezeRecordDigest(r4Result.freeze)).toBe(true);
      expect(verifyAcquisitionCurrentnessIntegrity(r4Result.freeze)).toBe(true);

      // ── Part 1b: TAMPER — alter the governed currentness assertion in place,
      // without recomputing currentnessAssertionDigest, and prove detection. ──

      console.log("\n── Part 1b: DRA-DOC-0031 tamper-detection demonstration ──────");

      const tamperedR4Freeze = {
        ...r4Result.freeze,
        currentnessAssessment: {
          ...r4Result.freeze.currentnessAssessment,
          currentnessStatus: "CONFIRMED_CURRENT",
          relatedDocumentIdentifier: undefined,
          relatedCorpusDocumentId: undefined,
        },
      };

      // freezeRecordDigest is unaffected by this tamper (proves the two digests
      // are genuinely independent evidence objects, not aliases of each other).
      expect(verifyAcquisitionFreezeRecordDigest(tamperedR4Freeze as never)).toBe(true);
      expect(verifyAcquisitionCurrentnessIntegrity(tamperedR4Freeze as never)).toBe(false);

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

      const tamperedRun = evaluateFrozenBenchmarkDocument({
        freezeRecord: tamperedR4Freeze as never,
        rawBytes: r4FetchAgain.source.rawBytes,
        normalisedText: r4NormB.document.text,
        approvedMetadata: APPROVED_METADATA_R4,
        registry,
        fixedTimestamp: RUN_B_TIMESTAMP,
      });

      expect(tamperedRun.ok).toBe(false);
      if (!tamperedRun.ok) {
        console.log("  Tampered re-evaluation correctly REJECTED:", tamperedRun.stage, tamperedRun.errors[0]?.code);
        expect(tamperedRun.stage).toBe("INTEGRITY");
        expect(tamperedRun.errors[0]?.code).toBe("CURRENTNESS_ASSERTION_DIGEST_MISMATCH");
      }

      // ── Part 1c: Determinism — untampered re-evaluation still succeeds ────

      console.log("\n── Part 1c: DRA-DOC-0031 determinism (untampered Run B) ──────");

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
      expect(runB.result.decision).toBe(r4Result.decision);
      expect(countIssues(runB.result.evaluationResult as never)).toBe(r4IssueCount);
      expect(countStatements(runB.result.evaluationResult as never)).toBe(r4StatementCount);
      expect(runB.result.currentnessAssessment).toEqual(r4Result.currentnessAssessment);
      expect(runB.result.proofReference.currentnessAssertionDigest).toBe(
        r4Result.freeze.currentnessAssertionDigest,
      );
      console.log("  Run B (untampered) decision matches Run A:", runB.result.decision === r4Result.decision);

      // ── Part 2: DRA-DOC-0030 control — CONFIRMED_CURRENT ──────────────────

      console.log("\n── Part 2: DRA-DOC-0030 (Rev 5) control ──────────────────────");

      const r5Fetcher = createDiskCachedFetcher(realFetcher, "dra-eng-019");
      const r5Req = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-900312",
        sourceUrl: NIST_SP80053R5_PDF_URL,
        requestedBy: "DRA-ENG-021-closure-operator",
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

      const r5FreezeRecord = createAcquisitionFreezeRecord({
        freezeRecordId: "DRA-FRZ-900312",
        corpusDocumentId: "DRA-DOC-0030",
        acquisitionId: "DRA-ACQ-900312",
        sourceUrl: NIST_SP80053R5_PDF_URL,
        finalUrl: NIST_SP80053R5_PDF_URL,
        sourceDigest: r5Digest,
        normalised: r5Norm.document,
        metadataDigest: computeApprovedMetadataDigest(APPROVED_METADATA_R5),
        frozenBy: "DRA-ENG-021-closure-operator",
        benchmarkVersion: "DRA-CORPUS-1.0.0",
        fixedTimestamp: FREEZE_TIMESTAMP,
        currentnessAssessment: R5_CURRENTNESS,
      });

      expect(verifyAcquisitionFreezeRecordDigest(r5FreezeRecord)).toBe(true);
      expect(verifyAcquisitionCurrentnessIntegrity(r5FreezeRecord)).toBe(true);
      expect(r5FreezeRecord.currentnessAssertionDigest).toMatch(/^[0-9a-f]{64}$/);

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

      console.log("  DRA-DOC-0030 decision                :", r5Result.decision);
      console.log("  DRA-DOC-0030 issueCount               :", r5IssueCount);
      console.log("  DRA-DOC-0030 currentnessAssertionDigest:", r5Result.proofReference.currentnessAssertionDigest);

      expect(r5Result.decision).toBe(BASELINE_R5.decision);
      expect(r5IssueCount).toBe(BASELINE_R5.issueCount);
      expect(r5StatementCount).toBeGreaterThanOrEqual(BASELINE_R5.statementFloor);
      expect(r5Result.proofReference.currentnessAssertionDigest).toBe(r5FreezeRecord.currentnessAssertionDigest);

      // ── Part 2b: TAMPER on the control document too ───────────────────────
      const tamperedR5Freeze = {
        ...r5FreezeRecord,
        currentnessAssessment: { ...r5FreezeRecord.currentnessAssessment, evidenceUrl: "https://attacker.example/fake" },
      };
      expect(verifyAcquisitionCurrentnessIntegrity(tamperedR5Freeze as never)).toBe(false);
      const tamperedR5Eval = evaluateFrozenBenchmarkDocument({
        freezeRecord: tamperedR5Freeze as never,
        rawBytes: r5Fetch.source.rawBytes,
        normalisedText: r5Norm.document.text,
        approvedMetadata: APPROVED_METADATA_R5,
        registry,
        fixedTimestamp: RUN_B_TIMESTAMP,
      });
      expect(tamperedR5Eval.ok).toBe(false);
      if (!tamperedR5Eval.ok) {
        expect(tamperedR5Eval.errors[0]?.code).toBe("CURRENTNESS_ASSERTION_DIGEST_MISMATCH");
      }

      console.log("\n── Closure Experiment Summary ────────────────────────────────");
      console.log(
        `  DRA-DOC-0031: decision=${r4Result.decision} (baseline ${BASELINE_R4.decision}), ` +
          `currentness bound + tamper-detected: true`,
      );
      console.log(
        `  DRA-DOC-0030: decision=${r5Result.decision} (baseline ${BASELINE_R5.decision}), ` +
          `currentness bound + tamper-detected: true`,
      );
    },
    280_000,
  );
});
