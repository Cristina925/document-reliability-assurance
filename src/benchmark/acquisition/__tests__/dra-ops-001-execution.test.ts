/**
 * DRA-OPS-001 — First Live Benchmark Admission, Freeze and Evaluation
 *
 * Operational execution of the complete governed acquisition pipeline
 * using the Apache HTTP Server Authentication and Authorization Guide
 * acquired during DRA-ENG-010.
 *
 * This file is NOT a conventional unit test. It is an operational
 * execution record: it runs the full pipeline end-to-end with real
 * governance inputs, asserts every quality gate passes, and emits a
 * structured execution log that feeds the completion report.
 *
 * Human governance decisions are recorded exactly as specified in
 * DRA-OPS-001. The software does NOT auto-approve either decision —
 * the VERIFIED status values below reflect explicit human sign-off on
 * official source provenance and licence suitability.
 */

import { describe, it, expect } from "vitest";

import {
  acquireFreezeAndEvaluate,
  evaluateFrozenBenchmarkDocument,
} from "../governed-pipeline.js";
import { createMockFetcher } from "../fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { normaliseContent } from "../normalisation.js";
import { computeSourceDigest } from "../integrity.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import {
  APACHE_HTTPD_AUTH_HTML,
  APACHE_HTTPD_AUTH_FIXTURE,
} from "../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// Fixed timestamp — deterministic execution record
// ---------------------------------------------------------------------------

const OPS_TIMESTAMP = "2026-08-03T15:00:00.000Z";

// ---------------------------------------------------------------------------
// Human Governance Decision 1 — Official Source Assessment
//
// Status: VERIFIED
// Rationale: httpd.apache.org is the canonical domain of the Apache HTTP
// Server project under the Apache Software Foundation. The URL
// https://httpd.apache.org/docs/2.4/howto/auth.html was retrieved directly
// from the official publisher without evidence of third-party mirroring.
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-OPS-001-governance-reviewer",
  assessedAt: "2026-08-03T14:00:00.000Z",
  evidence: [
    "Official Apache Software Foundation documentation",
    "Domain: https://httpd.apache.org — authoritative ASF project domain",
    "Retrieved directly from official publisher via createHttpFetcher()",
    "No evidence of third-party mirroring detected",
    "Content-Type: text/html; HTTP 200 OK",
    "Last-Modified: Fri, 19 Jun 2026 14:27:30 GMT",
  ],
  notes:
    "DRA-OPS-001 Human Governance Decision 1 — official source VERIFIED. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
// Rationale: The Apache HTTP Server documentation is published under the
// Apache License, Version 2.0. This licence permits redistribution with
// attribution for benchmark and research purposes. The licence is linked
// directly from the ASF project site.
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Apache License, Version 2.0",
  licenceUrl: "https://www.apache.org/licenses/LICENSE-2.0",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-OPS-001-governance-reviewer",
  assessedAt: "2026-08-03T14:05:00.000Z",
  evidence: [
    "Apache License, Version 2.0 — https://www.apache.org/licenses/LICENSE-2.0",
    "Licence source recorded from official ASF licence page",
    "Benchmark use permitted under Apache License 2.0 with attribution",
  ],
  notes:
    "DRA-OPS-001 Human Governance Decision 2 — licence VERIFIED. " +
    "This assessment was performed by a human reviewer and is not auto-approved.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
//
// Title confirmed from <title> tag: "Authentication and Authorization -
// Apache HTTP Server Version 2.4"
// Publication date from Last-Modified response header: 2026-06-19
// Version confirmed from URL path: 2.4
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
  publisher: "The Apache Software Foundation",
  publicationDate: "2026-06-19",
  version: "2.4",
  domain: "TECHNICAL" as const,
  documentType: "ARTICLE" as const,
  difficulty: "MEDIUM" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Operational execution
// ---------------------------------------------------------------------------

describe("DRA-OPS-001 — First Live Benchmark Admission, Freeze and Evaluation", () => {
  it("completes the full governed pipeline for DRA-DOC-0007", async () => {
    // ── Setup: fresh registry and APPROVED protocol ──────────────────────────

    const registry = new CorpusRegistry();
    const protocol = buildMinimalProtocol({
      protocolId: "DRA-PROTO-OPS-001",
      protocolStatus: "APPROVED",
      targetCorpusSize: 20,
      permittedDocumentTypes: [
        "SUMMARY", "REWRITE", "REPORT", "EMAIL",
        "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
      ],
    });

    // ── Setup: mock fetcher with pre-fetched Apache fixture bytes ─────────────

    const rawBytes = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
    const fetcher = createMockFetcher(
      new Map([
        [
          "https://httpd.apache.org/docs/2.4/howto/auth.html",
          {
            mediaType: "text/html",
            body: rawBytes,
            httpStatus: 200,
            redirects: [],
          },
        ],
      ]),
      OPS_TIMESTAMP,
    );

    // ── Acquisition request ───────────────────────────────────────────────────

    const requestResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: "https://httpd.apache.org/docs/2.4/howto/auth.html",
      requestedBy: "DRA-OPS-001-acquisition-operator",
      requestedAt: OPS_TIMESTAMP,
      expectedPublisher: "The Apache Software Foundation",
      expectedTitle:
        "Authentication and Authorization - Apache HTTP Server Version 2.4",
    });

    expect(requestResult.ok).toBe(true);
    if (!requestResult.ok) return;
    const request = requestResult.request;

    // ── Run the full governed pipeline ────────────────────────────────────────

    const pipelineResult = await acquireFreezeAndEvaluate(
      {
        request,
        officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
        licenceAssessment: LICENCE_ASSESSMENT,
        approvedMetadata: APPROVED_METADATA,
        corpusDocumentId: "DRA-DOC-0007",
        freezeRecordId: "DRA-FRZ-000001",
        frozenBy: "DRA-OPS-001-freeze-operator",
        benchmarkVersion: "DRA-CORPUS-1.0.0",
        inclusionRationale:
          "First official human-authored benchmark document. " +
          "Apache HTTP Server documentation is a canonical technical reference " +
          "produced by the Apache Software Foundation under an open licence. " +
          "Selected as a representative TECHNICAL/ARTICLE document for the " +
          "DRA benchmark corpus.",
        existingCorpusTexts: [],
      },
      {
        fetcher,
        registry,
        protocol,
        fixedTimestamp: OPS_TIMESTAMP,
      },
    );

    // ── Assert pipeline succeeded ─────────────────────────────────────────────

    if (!pipelineResult.ok) {
      console.error("Pipeline FAILED at stage:", pipelineResult.stage);
      console.error("Errors:", JSON.stringify(pipelineResult.errors, null, 2));
    }
    expect(pipelineResult.ok).toBe(true);
    if (!pipelineResult.ok) return;

    const { result } = pipelineResult;

    // ── Emit structured execution log ─────────────────────────────────────────

    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-OPS-001 — EXECUTION LOG                              ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    console.log("── Acquisition ─────────────────────────────────────────────");
    console.log("  acquisitionId      :", request.acquisitionId);
    console.log("  sourceUrl          :", request.sourceUrl);
    console.log("  requestedBy        :", request.requestedBy);
    console.log("  requestedAt        :", request.requestedAt);
    console.log("  rawByteLength      :", rawBytes.length);
    console.log("  fixture sourceDigest:", APACHE_HTTPD_AUTH_FIXTURE.sourceDigest);

    console.log("\n── Governance Decision 1 — Official Source ─────────────────");
    console.log("  status    :", OFFICIAL_SOURCE_ASSESSMENT.status);
    console.log("  assessedBy:", OFFICIAL_SOURCE_ASSESSMENT.assessedBy);
    console.log("  assessedAt:", OFFICIAL_SOURCE_ASSESSMENT.assessedAt);
    console.log("  evidence  :");
    OFFICIAL_SOURCE_ASSESSMENT.evidence.forEach((e) => console.log("    •", e));

    console.log("\n── Governance Decision 2 — Licence ─────────────────────────");
    console.log("  status      :", LICENCE_ASSESSMENT.status);
    console.log("  licenceName :", LICENCE_ASSESSMENT.licenceName);
    console.log("  licenceUrl  :", LICENCE_ASSESSMENT.licenceUrl);
    console.log("  licenceBasis:", LICENCE_ASSESSMENT.licenceBasis);
    console.log("  assessedBy  :", LICENCE_ASSESSMENT.assessedBy);
    console.log("  assessedAt  :", LICENCE_ASSESSMENT.assessedAt);

    console.log("\n── Freeze Record ────────────────────────────────────────────");
    console.log("  freezeRecordId       :", result.freeze.freezeRecordId);
    console.log("  corpusDocumentId     :", result.freeze.corpusDocumentId);
    console.log("  acquisitionId        :", result.freeze.acquisitionId);
    console.log("  sourceDigest         :", result.freeze.sourceDigest);
    console.log("  normalisedTextDigest :", result.freeze.normalisedTextDigest);
    console.log("  metadataDigest       :", result.freeze.metadataDigest);
    console.log("  freezeRecordDigest   :", result.freeze.freezeRecordDigest);
    console.log("  frozenAt             :", result.freeze.frozenAt);
    console.log("  frozenBy             :", result.freeze.frozenBy);
    console.log("  benchmarkVersion     :", result.freeze.benchmarkVersion);
    console.log("  normalisationVersion :", result.freeze.normalisationVersion);

    console.log("\n── Corpus Manifest ─────────────────────────────────────────");
    console.log("  schemaVersion   :", result.manifest.schemaVersion);
    console.log("  corpusVersion   :", result.manifest.corpusVersion);
    console.log("  documentCount   :", result.manifest.documentCount);
    console.log("  overallDigest   :", result.manifest.overallDigest);
    console.log("  manifestDigest  :", result.manifestDigest);

    console.log("\n── DRA Evaluation ───────────────────────────────────────────");
    console.log("  decision                 :", result.decision);
    console.log("  evaluationTimestamp      :", result.proofReference.evaluationTimestamp);
    // evaluationResult is DocumentAssuranceEvaluation (success | failure union).
    // The pipeline already asserted ok, so narrow to access proofReceipt.
    const evalSuccess = result.evaluationResult.ok ? result.evaluationResult : null;
    const receipt = (evalSuccess?.proofReceipt ?? {}) as Record<string, unknown>;
    console.log("  proofReceiptId           :", receipt["id"] ?? "(see receipt)");
    console.log("  substantiveDigest        :", result.proofReference.proofReceiptSubstantiveDigest);

    console.log("\n── Proof Reference ─────────────────────────────────────────");
    console.log("  freezeRecordId               :", result.proofReference.freezeRecordId);
    console.log("  corpusDocumentId             :", result.proofReference.corpusDocumentId);
    console.log("  sourceDigest                 :", result.proofReference.sourceDigest);
    console.log("  normalisedTextDigest         :", result.proofReference.normalisedTextDigest);
    console.log("  metadataDigest               :", result.proofReference.metadataDigest);
    console.log("  freezeRecordDigest           :", result.proofReference.freezeRecordDigest);
    console.log("  proofReceiptSubstantiveDigest:", result.proofReference.proofReceiptSubstantiveDigest);
    console.log("  evaluationTimestamp          :", result.proofReference.evaluationTimestamp);

    console.log("\n── Benchmark Result Summary ────────────────────────────────");
    console.log("  Benchmark Document ID :", result.proofReference.corpusDocumentId);
    console.log("  Freeze Record ID      :", result.freeze.freezeRecordId);
    console.log("  Corpus Manifest Digest:", result.manifestDigest);
    console.log("  Decision              :", result.decision);
    console.log("  Evaluation Timestamp  :", result.proofReference.evaluationTimestamp);

    // ── Evaluator version and evaluation metrics log ──────────────────────────

    const evalSuccessForLog = result.evaluationResult.ok ? result.evaluationResult : null;
    if (evalSuccessForLog) {
      const pipeLog = evalSuccessForLog.pipeline as Record<string, unknown>;
      const s2Log = pipeLog["stage2"] as unknown as Record<string, unknown> | undefined;
      const stmtsLog = ((s2Log?.["statements"] ?? s2Log?.["claims"] ?? []) as unknown[]).length;
      const s6Log = pipeLog["consistencyCheck"] as unknown as Record<string, unknown> | undefined;
      const issuesLog = ((s6Log?.["issues"] ?? (evalSuccessForLog as unknown as Record<string, unknown>)["issues"] ?? []) as unknown[]).length;
      const s4Log = pipeLog["stage4"] as unknown as Record<string, unknown> | undefined;
      const semLog = ((s4Log?.["evidenceRecords"] ?? []) as Array<Record<string, unknown>>)
        .filter((r) => r["classification"] === "SEMANTIC_PARAPHRASE_MATCH").length;
      const receiptLog = evalSuccessForLog.proofReceipt as Record<string, unknown>;
      const identLog = receiptLog["evaluatorIdentity"] as Record<string, unknown> | undefined;
      console.log("\n── DRA-DOC-0007 Evaluation Metrics (v0.1.1) ────────────────");
      console.log("  statementCount   :", stmtsLog);
      console.log("  issueCount       :", issuesLog);
      console.log("  semanticMatches  :", semLog);
      console.log("  evaluatorVersion :", identLog?.["evaluatorVersion"]);
      console.log("  schemaVersion    :", receiptLog["schemaVersion"]);
      console.log("  substantiveDigest:", receiptLog["substantiveDigest"] ?? result.proofReference.proofReceiptSubstantiveDigest);
    }

    // ── Integrity assertions ──────────────────────────────────────────────────

    expect(result.freeze.freezeRecordId).toBe("DRA-FRZ-000001");
    expect(result.freeze.corpusDocumentId).toBe("DRA-DOC-0007");
    expect(result.freeze.frozenBy).toBe("DRA-OPS-001-freeze-operator");
    expect(result.freeze.sourceDigest).toBe(
      APACHE_HTTPD_AUTH_FIXTURE.sourceDigest,
    );
    expect(result.freeze.normalisedTextDigest).toBeTruthy();
    expect(result.freeze.freezeRecordDigest).toBeTruthy();
    expect(result.freeze.metadataDigest).toBeTruthy();

    expect(result.manifest.documentCount).toBe(1);
    expect(result.manifest.overallDigest).toBeTruthy();
    expect(result.manifestDigest).toBe(result.manifest.overallDigest);

    expect(result.decision).toBeTruthy();
    expect(result.proofReference.freezeRecordId).toBe("DRA-FRZ-000001");
    expect(result.proofReference.corpusDocumentId).toBe("DRA-DOC-0007");
    expect(result.proofReference.proofReceiptSubstantiveDigest).toBeTruthy();

    // ── Evaluator version assertions (DRA-EVAL-002 / DRA-EVAL-002A) ───────────
    // Verify that the improved evaluator v0.1.1 is used; the data-model schema
    // version (schemaVersion) must remain "0.1.0" (unchanged since DRA-ENG-002).
    const evalSuccessAssertion = result.evaluationResult.ok ? result.evaluationResult : null;
    if (evalSuccessAssertion) {
      const receiptAssertion = evalSuccessAssertion.proofReceipt as Record<string, unknown>;
      const identAssertion = receiptAssertion["evaluatorIdentity"] as Record<string, unknown> | undefined;
      expect(identAssertion?.["evaluatorVersion"]).toBe("0.1.1");
      expect(identAssertion?.["pipelineVersion"]).toBe("1.0");
      expect(receiptAssertion["schemaVersion"]).toBe("0.1.0");
    }

    // ── Verify the manifest integrity is verifiable ───────────────────────────
    // (manifest is produced by integrateWithCorpus, which already verified it
    //  internally; we confirm the digest round-trips)
    expect(result.manifest.overallDigest).toBe(result.manifestDigest);

    // ── Re-evaluation via evaluateFrozenBenchmarkDocument ─────────────────────
    // The freeze record stores the normalised-text digest, not the full text.
    // Re-normalise the raw bytes to recover the text for the re-evaluation path.
    const srcDigest = computeSourceDigest(rawBytes);
    const reNormResult = await normaliseContent(rawBytes, "text/html", srcDigest);
    expect(reNormResult.ok).toBe(true);
    if (!reNormResult.ok) return;

    const reEvalResult = evaluateFrozenBenchmarkDocument({
      freezeRecord: result.freeze,
      rawBytes,
      normalisedText: reNormResult.document.text,
      approvedMetadata: APPROVED_METADATA,
      registry,
      fixedTimestamp: OPS_TIMESTAMP,
    });

    if (!reEvalResult.ok) {
      console.error("Re-evaluation FAILED:", JSON.stringify(reEvalResult.errors, null, 2));
    }
    expect(reEvalResult.ok).toBe(true);
    if (!reEvalResult.ok) return;

    expect(reEvalResult.result.decision).toBe(result.decision);
    console.log("\n── Re-evaluation via evaluateFrozenBenchmarkDocument ───────");
    console.log("  decision (re-eval):", reEvalResult.result.decision);
    console.log("  Matches original  :", reEvalResult.result.decision === result.decision);

    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-OPS-001 — ALL QUALITY GATES PASSED                   ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");
  });
});
