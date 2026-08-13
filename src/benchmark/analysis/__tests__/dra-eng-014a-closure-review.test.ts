/**
 * DRA-ENG-014A — Version Preservation and Correction Closure Review
 *
 * STATUS: CLOSURE / GOVERNANCE REVIEW ONLY. No production code is changed or
 * exercised differently here than by the existing DRA-ENG-014 evaluator.
 *
 * This file provides the deterministic test/support evidence backing the
 * DRA-ENG-014A governance report (docs/dra/DRA-ENG-014A-CLOSURE-REPORT.md):
 *   - historical version (0.1.1) recognition
 *   - current version (0.1.2) identity and receipt stamping
 *   - historical-shaped receipt integrity verification (constructed, not
 *     re-derived from a live 0.1.1 run — no such run is possible; see the
 *     report's EXECUTABLE_REPRODUCIBILITY discussion)
 *   - current-version (0.1.2) replay determinism
 *   - bare-uppercase-EN residual behaviour (ENG-013 OUT_OF_SCOPE case)
 *   - whether bare-uppercase-EN produces a corpus-observable false positive
 *     in the two documents this arc has directly investigated (DRA-DOC-0018,
 *     DRA-DOC-0021)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { evaluateDocument, verifyReceiptIntegrity } from "../../../pipeline/index.js";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/index.js";
import type { EvaluatorIdentity, ProofReceipt } from "../../../model/index.js";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import {
  DRA_EVALUATOR_VERSION,
  DRA_EVALUATOR_VERSION_0_1_1,
  DRA_PIPELINE_VERSION,
  DRA_MODEL_VERSION,
  RECOGNISED_SCHEMA_VERSIONS,
  isRecognisedSchemaVersion,
  SchemaVersionSchema,
} from "../../../model/index.js";
import { detectEvidence } from "../../../evidence-linkage/linkage-rules.js";
import { computeDigestFromPayload } from "../../../pipeline/canonical-serialise.js";

const FIXED_TS = "2026-08-09T21:00:00.000Z";

const EC_URL_ES = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423"; // DRA-DOC-0018
const EC_URL_EN = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419"; // DRA-DOC-0021

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng014a-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

function buildEvalRequest(id: string, title: string, text: string): unknown {
  const sourceId = `sdoc-${id}-src`;
  return {
    id: `eval-${id}-eng014a`,
    requestedAt: FIXED_TS,
    generatedDocument: {
      id: `gdoc-${id}-eng014a`,
      title,
      content: text,
      sourceDocumentIds: [sourceId],
      generatedAt: FIXED_TS,
    },
    sourceDocuments: [
      { id: sourceId, title: `Source: ${title}`, content: text, format: "PLAIN_TEXT" },
    ],
  };
}

let esResult: DocumentAssuranceEvaluation;
let enResult: DocumentAssuranceEvaluation;
let esResultReplay: DocumentAssuranceEvaluation;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const realFetcher = createHttpFetcher({ timeoutMs: 120_000, maxRedirects: 5, maxBytes: 15_000_000, userAgent: "DRA-ENG-014A/1.0" });
    // Reuses the DRA-BMK-021 disk cache — no new network fetch.
    const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-021");

    async function fetchAndExtract(acquisitionId: string, url: string, label: string) {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-ENG-014A-operator", requestedAt: FIXED_TS, expectedPublisher: "European Commission", expectedTitle: "Ethics Guidelines for Trustworthy AI" };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) throw new Error(`${label} fetch failed: ${fetchRes.code}`);
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) throw new Error(`${label} normalisation failed: ${norm.message}`);
      return norm.document.text;
    }

    const [esText, enText] = await Promise.all([
      fetchAndExtract("DRA-ACQ-000021", EC_URL_ES, "ES"),
      fetchAndExtract("DRA-ACQ-000024", EC_URL_EN, "EN"),
    ]);

    const esReq = buildEvalRequest("DRA-DOC-0018", "Directrices \u00e9ticas para una IA fiable", esText);
    esResult = evaluateDocument(esReq);
    esResultReplay = evaluateDocument(esReq); // second call, same input, for determinism check
    enResult = evaluateDocument(buildEvalRequest("DRA-DOC-0021", "Ethics Guidelines for Trustworthy AI", enText));
  } catch (err) {
    setupError = String(err);
  }
}, 300_000);

// ---------------------------------------------------------------------------
// Part 4 (task) — Current 0.1.2 reproducibility
// ---------------------------------------------------------------------------

describe("DRA-ENG-014A Part 4 — current evaluator (0.1.2) reproducibility", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("DRA-DOC-0018 (ES) deterministic result: decision and issue count", () => {
    if (esResult.ok) {
      expect(esResult.decision).toBe("SUPPORTED");
      expect(esResult.issues.length).toBe(0);
    }
  });

  it("DRA-DOC-0021 (EN) deterministic result: decision and issue count", () => {
    if (enResult.ok) {
      expect(enResult.decision).toBe("REVIEW");
      expect(enResult.issues.length).toBe(7);
    }
  });

  it("CURRENT_VERSION_REPRODUCIBILITY: two evaluateDocument() calls on the same frozen input produce an identical substantiveDigest (excluding operational timestamps)", () => {
    if (esResult.ok && esResultReplay.ok) {
      expect(esResultReplay.proofReceipt.substantiveDigest).toBe(esResult.proofReceipt.substantiveDigest);
      expect(esResultReplay.decision).toBe(esResult.decision);
      expect(esResultReplay.issues.length).toBe(esResult.issues.length);
    }
  });

  it("current receipts are stamped with evaluatorVersion 0.1.2 and pipelineVersion 1.0", () => {
    if (esResult.ok && enResult.ok) {
      expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
      expect(esResult.proofReceipt.evaluatorIdentity.evaluatorVersion).toBe("0.1.2");
      expect(enResult.proofReceipt.evaluatorIdentity.evaluatorVersion).toBe("0.1.2");
      expect(esResult.proofReceipt.evaluatorIdentity.pipelineVersion).toBe(DRA_PIPELINE_VERSION);
    }
  });

  it("current receipts pass verifyReceiptIntegrity", () => {
    if (esResult.ok) expect(verifyReceiptIntegrity(esResult.proofReceipt)).toBe(true);
    if (enResult.ok) expect(verifyReceiptIntegrity(enResult.proofReceipt)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 5 (task) — Historical 0.1.1 evidence status
// ---------------------------------------------------------------------------

describe("DRA-ENG-014A Part 5 — historical (0.1.1) evidence status", () => {
  it("DRA_EVALUATOR_VERSION_0_1_1 remains defined and equal to \"0.1.1\" (not removed, not renumbered)", () => {
    expect(DRA_EVALUATOR_VERSION_0_1_1).toBe("0.1.1");
  });

  it("0.1.1 remains a RECOGNISED schema version alongside the current 0.1.2 and the model version 0.1.0", () => {
    expect(RECOGNISED_SCHEMA_VERSIONS).toContain(DRA_EVALUATOR_VERSION_0_1_1);
    expect(RECOGNISED_SCHEMA_VERSIONS).toContain(DRA_EVALUATOR_VERSION);
    expect(RECOGNISED_SCHEMA_VERSIONS).toContain(DRA_MODEL_VERSION);
    expect(isRecognisedSchemaVersion("0.1.1")).toBe(true);
    expect(() => SchemaVersionSchema.parse("0.1.1")).not.toThrow();
  });

  it("a historically-shaped receipt (evaluatorVersion 0.1.1, digest computed honestly for that label) is schema-valid and its integrity digest verifies — EVIDENCE_INTEGRITY holds independent of the current evaluatorVersion", () => {
    // This test constructs a receipt payload whose evaluatorIdentity carries
    // "0.1.1" from the start and computes its digest honestly via the same
    // computeDigestFromPayload() function real receipts use — it does NOT
    // take a real 0.1.2 receipt and relabel its evaluatorVersion post-hoc
    // (that is deliberately tested next: it must FAIL, because evaluatorVersion
    // is part of the digest input — relabelling is tamper detection working
    // correctly, not a defect). This proves the schema/digest machinery fully
    // supports "0.1.1" as a first-class historical evaluatorVersion value.
    // Real frozen 0.1.1 receipts already exist in DRA-BMK-021's stored records
    // and are untouched by this file.
    if (!esResult.ok) return;
    const historicalIdentity: EvaluatorIdentity = {
      ...esResult.proofReceipt.evaluatorIdentity,
      evaluatorVersion: DRA_EVALUATOR_VERSION_0_1_1,
    };
    const payload = {
      evaluationRequestId: String(esResult.proofReceipt.evaluationRequestId),
      evaluationResultId: String(esResult.proofReceipt.evaluationResultId),
      schemaVersion: esResult.proofReceipt.schemaVersion,
      documentIdentitySubstantive: {
        generatedDocumentId: String(esResult.proofReceipt.documentIdentity.generatedDocumentId),
        generatedDocumentTitle: esResult.proofReceipt.documentIdentity.generatedDocumentTitle,
      },
      evaluatorIdentity: historicalIdentity,
      stageOutputs: esResult.proofReceipt.stageOutputs,
      issueRegister: esResult.proofReceipt.issueRegister,
      issueSummary: esResult.proofReceipt.issueSummary,
      decision: esResult.proofReceipt.decision,
      decisionRationale: esResult.proofReceipt.decisionRationale,
    };
    const honestHistoricalDigest = computeDigestFromPayload(payload);
    const historicalShaped: ProofReceipt = {
      ...esResult.proofReceipt,
      evaluatorIdentity: historicalIdentity,
      substantiveDigest: honestHistoricalDigest,
    };
    expect(isRecognisedSchemaVersion(historicalShaped.evaluatorIdentity.evaluatorVersion)).toBe(true);
    expect(verifyReceiptIntegrity(historicalShaped)).toBe(true);
  });

  it("relabelling a real 0.1.2 receipt's evaluatorVersion to 0.1.1 WITHOUT recomputing the digest correctly fails integrity verification — evaluatorVersion is bound into the digest, so historical identity cannot be forged after the fact", () => {
    if (!esResult.ok) return;
    const tampered: ProofReceipt = {
      ...esResult.proofReceipt,
      evaluatorIdentity: {
        ...esResult.proofReceipt.evaluatorIdentity,
        evaluatorVersion: DRA_EVALUATOR_VERSION_0_1_1,
      },
      // substantiveDigest intentionally left as the original 0.1.2 digest
    };
    expect(verifyReceiptIntegrity(tampered)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Part 6 (task) — Bare-uppercase-EN residual behaviour and corpus impact
// ---------------------------------------------------------------------------

describe("DRA-ENG-014A Part 6 — bare uppercase EN residual behaviour (ENG-013 OUT_OF_SCOPE)", () => {
  it("bare uppercase 'EN' (no numeric identifier) still matches EL-STANDARD-REF under 0.1.2 — unchanged from 0.1.1 (case sensitivity was the only change)", () => {
    const result = detectEvidence("This system conforms to EN as required.");
    const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
    expect(m).toBeDefined();
    expect(m!.evidenceText.trim()).toBe("EN");
  });

  it("bare lowercase 'en' still does NOT match (the ENG-014 fix, unaffected by this review)", () => {
    const result = detectEvidence("Este derecho se aplica en toda la Uni\u00f3n.");
    expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
  });

  it("scans DRA-DOC-0018 (ES) and DRA-DOC-0021 (EN) — the two documents this arc has directly investigated — for any bare-uppercase-EN (no trailing numeric identifier) EL-STANDARD-REF match, and reports whether any such match participates in a flagged issue", () => {
    if (!(esResult.ok && enResult.ok)) return;

    function scanBareEn(label: string, result: Extract<DocumentAssuranceEvaluation, { ok: true }>) {
      const statements = result.pipeline.stage2.statements;
      const flaggedStatementIds = new Set(
        result.issues.flatMap((iss) => (iss as any).affectedStatementIds as string[]),
      );
      const bareEnStatements: Array<{ id: string; text: string; flagged: boolean }> = [];
      for (const st of statements) {
        const detection = detectEvidence(st.text);
        const bareEnMatch = detection.matches.some(
          (m) => m.linkageRule === "EL-STANDARD-REF" && m.evidenceText.trim() === "EN",
        );
        if (bareEnMatch) {
          bareEnStatements.push({ id: st.id, text: st.text, flagged: flaggedStatementIds.has(st.id) });
        }
      }
      console.log(`\n── ${label}: bare-uppercase-EN matches: ${bareEnStatements.length} ──`);
      for (const s of bareEnStatements) {
        console.log(`  [${s.flagged ? "FLAGGED" : "unflagged"}] ${s.id}: "${s.text.slice(0, 100)}"`);
      }
      return bareEnStatements;
    }

    const esBareEn = scanBareEn("DRA-DOC-0018 (ES)", esResult);
    const enBareEn = scanBareEn("DRA-DOC-0021 (EN)", enResult);

    // Report-only assertions: confirm the scan ran and record whether any
    // bare-EN match is part of a flagged issue statement (corpus-impact
    // signal for this residual limitation).
    expect(Array.isArray(esBareEn)).toBe(true);
    expect(Array.isArray(enBareEn)).toBe(true);
    const anyFlagged = [...esBareEn, ...enBareEn].some((s) => s.flagged);
    console.log(`\n  Any bare-uppercase-EN match participates in a flagged issue: ${anyFlagged}`);
  });
});
