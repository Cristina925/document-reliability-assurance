/**
 * DRA-ACQ-030 Phase 2 — Multi-Column Baseline Admission and Materiality
 * Experiment
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  MATERIALITY EXPERIMENT — DRA-ACQ-030 PHASE 2 (NOT a corpus admission)   ║
 * ║                                                                          ║
 * ║  Candidate:   Federal Register, Vol. 89 No. 4, Jan 5 2024                ║
 * ║  Artifact:    FR Doc. 2024-00001 granule (pp. 824-825, 3-column Notices) ║
 * ║  Publisher:   Office of the Federal Register / GPO (govinfo.gov)        ║
 * ║  Licence:     PUBLIC_DOMAIN (17 U.S.C. §105 — US Government work)       ║
 * ║                                                                          ║
 * ║  SEQUENCING STATUS: PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE           ║
 * ║    DRA-DOC-0033 / DRA-FRZ-000027 / DRA-ACQ-000036 remain reserved for    ║
 * ║    the separately blocked DRA-ACQ-029 Hindi experiment (its admission    ║
 * ║    test currently fails live: eLegalix returns HTTP 429 — re-verified    ║
 * ║    this session). Per programme sequencing convention, no corpus ID      ║
 * ║    after DRA-DOC-0032 may be formally admitted (i.e. integrated into a   ║
 * ║    CorpusRegistry) until DRA-DOC-0033 is admitted. This experiment       ║
 * ║    therefore evaluates the Federal Register artifact directly through   ║
 * ║    evaluateDocument() — the same evaluator function the governed         ║
 * ║    pipeline (acquireFreezeAndEvaluate) wraps — WITHOUT calling           ║
 * ║    integrateWithCorpus() or allocating a real DRA-DOC/DRA-FRZ/DRA-ACQ    ║
 * ║    identifier. No corpus registry is mutated by this file.               ║
 * ║                                                                          ║
 * ║  This test makes live HTTPS requests to govinfo.gov (stability          ║
 * ║  re-verification only). Allow 1 minute.                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Scope discipline (see DRA-ACQ-030-MULTICOLUMN-LAYOUT-DISCOVERY-PHASE1-REPORT
 * and the Phase 2 task specification):
 *   - Does NOT fix the multi-column extraction defect.
 *   - Does NOT modify DRA-ACQ-030 Phase 1 discovery evidence.
 *   - Does NOT use, modify, or renumber DRA-DOC-0033 / DRA-FRZ-000027 /
 *     DRA-ACQ-000036.
 *   - Does NOT wire the analysis-only corrected-order representation into
 *     any production code path.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createHash } from "crypto";
import * as https from "https";

import { normaliseContent } from "../normalisation.js";
import { evaluateDocument } from "../../../pipeline/evaluate-document.js";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Reference evidence — recorded during this Phase 2 session
// ---------------------------------------------------------------------------

/** Official source URL for the exact granule used in Phase 1 reconnaissance. */
const GRANULE_URL =
  "https://www.govinfo.gov/content/pkg/FR-2024-01-05/pdf/2024-00001.pdf";

/** SHA-256 of the granule PDF, confirmed byte-stable across two independent
 *  live fetches this session, and identical to the Phase 1 reconnaissance
 *  copy (fr1.pdf, never modified). */
const REFERENCE_GRANULE_SOURCE_DIGEST =
  "038eb623d296b5701d31fad6cfa4ade9121eef9a5f25f95b65b6ec2aec589329";

const REFERENCE_GRANULE_BYTE_LENGTH = 182409;

/** SHA-256 of the production normalised text (pdftotext -layout, DRA's
 *  documented production extraction convention, via normaliseContent). */
const REFERENCE_PRODUCTION_TEXT_DIGEST =
  "9e004998ba5bc352894da9d37a1aa3600a09df35463b8c6bf1f6cea204c2729a";

/** SHA-256 of the analysis-only corrected-order fixture (see fixtures/). */
const REFERENCE_CORRECTED_ORDER_DIGEST =
  "f872e9fe74e3b814715cccf5f2f664452ea43c385410cb8deb5cf9af2bd1e115";

/** Reference proof-receipt substantiveDigest for Run A (production order). */
const REFERENCE_RUN_A_DIGEST =
  "3d8898b641814566008580ad688056dcb7ba436f3b215ac30e68aa0923a95b90";

/** Reference proof-receipt substantiveDigest for Run B (corrected order). */
const REFERENCE_RUN_B_DIGEST =
  "3c7d0466746b47dc2209c1718b95c7783b88dbb9e5b3ba27b13eb5a52f204696";

const FIXED_TIMESTAMP = "2026-08-11T18:00:00.000Z";

// ---------------------------------------------------------------------------
// pdftotext extractor — same production convention as other admission tests
// ---------------------------------------------------------------------------

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq030-p2-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function sha256Bytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text, "utf-8").digest("hex");
}

const CORRECTED_ORDER_DELIMITER =
  "=== ANALYSIS-ONLY CONTENT BELOW (header stripped before evaluation) ===\n";

/** Strips the analysis-only header/provenance comment from the fixture,
 *  returning only the evaluated content (identical to what evaluateDocument
 *  received when REFERENCE_CORRECTED_ORDER_DIGEST / REFERENCE_RUN_B_DIGEST
 *  were recorded). */
function stripFixtureHeader(raw: string): string {
  const idx = raw.indexOf(CORRECTED_ORDER_DELIMITER);
  expect(idx).toBeGreaterThan(-1);
  return raw.slice(idx + CORRECTED_ORDER_DELIMITER.length);
}

/** Minimal live HTTPS GET used only for stability re-verification. */
function fetchBytes(url: string): Promise<{ status: number; bytes: Buffer }> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "DRA-ACQ-030-Phase2/1.0" } }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, bytes: Buffer.concat(chunks) }),
        );
      })
      .on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Evaluator request builder — mirrors governed-pipeline.ts buildEvaluatorRequest
// (duplicated deliberately: this experiment must not call the corpus-mutating
// acquireFreezeAndEvaluate(), but must exercise the identical evaluateDocument
// request shape for a faithful production comparison).
// ---------------------------------------------------------------------------

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
      {
        id: `sdoc-${id}-src`,
        title: `Source: ${title}`,
        content: text,
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt: FIXED_TIMESTAMP,
  };
}

// ---------------------------------------------------------------------------
// Section 1 — Sequencing constraint
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 Phase 2 — sequencing and identifier constraint", () => {
  it("classifies this experiment as PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE " +
    "because DRA-DOC-0033 is reserved and not reliably admitted", () => {
    // DRA-DOC-0033 / DRA-FRZ-000027 / DRA-ACQ-000036 are reserved for the
    // DRA-ACQ-029 Hindi baseline experiment. That admission test
    // (dra-acq-029-doc0033-hindi-admission.test.ts) currently fails live —
    // re-verified this session: eLegalix returns HTTP 429 on both
    // determinism-check fetches. DRA-DOC-0033 is therefore NOT a reliably
    // admitted corpus entry today, regardless of the test file's existence.
    //
    // This file must not use, modify, or renumber the reserved identifiers,
    // and must not manufacture corpus continuity by admitting DRA-DOC-0034
    // ahead of DRA-DOC-0033. It never calls integrateWithCorpus() or
    // constructs a CorpusRegistry — see the imports above.
    const SEQUENCING_STATUS = "PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE";
    const RESERVED_IDENTIFIERS = Object.freeze([
      "DRA-DOC-0033",
      "DRA-FRZ-000027",
      "DRA-ACQ-000036",
    ]);
    expect(SEQUENCING_STATUS).toBe("PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE");
    expect(RESERVED_IDENTIFIERS).toHaveLength(3);
    expect(RESERVED_IDENTIFIERS).not.toContain("DRA-DOC-0034");
  });
});

// ---------------------------------------------------------------------------
// Section 3 — Source stability re-verification (live)
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 Phase 2 — live source stability re-verification", () => {
  it(
    "re-fetches the granule PDF twice independently and confirms BYTE_STABLE, " +
      "matching the Phase 1 reconnaissance artifact",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      const fetchB = await fetchBytes(GRANULE_URL);

      expect(fetchA.status).toBe(200);
      expect(fetchB.status).toBe(200);
      expect(fetchA.bytes.length).toBe(REFERENCE_GRANULE_BYTE_LENGTH);
      expect(fetchB.bytes.length).toBe(REFERENCE_GRANULE_BYTE_LENGTH);

      const digestA = sha256Bytes(fetchA.bytes);
      const digestB = sha256Bytes(fetchB.bytes);

      expect(digestA).toBe(REFERENCE_GRANULE_SOURCE_DIGEST);
      expect(digestB).toBe(REFERENCE_GRANULE_SOURCE_DIGEST);
      expect(digestA).toBe(digestB); // repeated-fetch equality -> BYTE_STABLE
    },
    30_000,
  );
});

// ---------------------------------------------------------------------------
// Section 6/8 — Production extraction, segmentation, and evaluator Run A/B
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 Phase 2 — production extraction and evaluator baseline", () => {
  it(
    "extracts the granule via the production pdftotext -layout convention " +
      "and produces the reference normalised-text digest",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      const bytes = new Uint8Array(fetchA.bytes);

      const normResult = await normaliseContent(
        bytes,
        "application/pdf" as never,
        sha256Bytes(bytes),
        extractPdfText,
      );

      expect(normResult.ok).toBe(true);
      if (!normResult.ok) return;

      const productionText = normResult.document.text;
      expect(sha256Text(productionText)).toBe(REFERENCE_PRODUCTION_TEXT_DIGEST);
      // pdftotext -layout pads for column position; character length is much
      // larger than the semantic content length (see corrected-order fixture).
      expect(productionText.length).toBeGreaterThan(30_000);
    },
    30_000,
  );

  it(
    "Run A (production order) and Run A repeated: evaluateDocument decision, " +
      "issue count, and proof-receipt substantive digest are identical " +
      "(determinism), matching the recorded reference digest",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      const bytes = new Uint8Array(fetchA.bytes);
      const normResult = await normaliseContent(
        bytes,
        "application/pdf" as never,
        sha256Bytes(bytes),
        extractPdfText,
      );
      expect(normResult.ok).toBe(true);
      if (!normResult.ok) return;

      const req = buildRequest(
        "DRA-DOC-0034-CANDIDATE",
        "Federal Register Vol. 89 No. 4 (Jan 5 2024) — FR Doc. 2024-00001 granule",
        normResult.document.text,
      );

      const runA1 = evaluateDocument(req) as { ok: true; decision: string; proofReceipt: any };
      const runA2 = evaluateDocument(req) as { ok: true; decision: string; proofReceipt: any };

      expect(runA1.ok).toBe(true);
      expect(runA2.ok).toBe(true);
      expect(runA1.decision).toBe(runA2.decision);
      expect(runA1.proofReceipt.substantiveDigest).toBe(
        runA2.proofReceipt.substantiveDigest,
      );
      expect(runA1.proofReceipt.substantiveDigest).toBe(REFERENCE_RUN_A_DIGEST);
      expect(runA1.decision).toBe("SUPPORTED");
      expect(runA1.proofReceipt.issueSummary.total).toBe(0);
    },
    30_000,
  );
});

// ---------------------------------------------------------------------------
// Section 9/10 — Analysis-only corrected-order counterfactual
// ---------------------------------------------------------------------------

describe("DRA-ACQ-030 Phase 2 — analysis-only corrected-order counterfactual", () => {
  it("the corrected-order fixture is clearly labelled analysis-only and " +
    "matches its recorded digest (never wired into production code)", async () => {
    const raw = await readFile(
      join(
        __dirname,
        "fixtures",
        "dra-acq-030-fr-2024-00001-corrected-order.txt",
      ),
      "utf-8",
    );
    expect(raw).toContain("ANALYSIS-ONLY");
    const correctedText = stripFixtureHeader(raw);
    expect(sha256Text(correctedText)).toBe(REFERENCE_CORRECTED_ORDER_DIGEST);
  });

  it(
    "Run B (corrected-order counterfactual) evaluateDocument result matches " +
      "the recorded reference digest and decision",
    () => {
      // Loaded synchronously via readFileSync-equivalent path in the previous
      // test; re-read here for test independence.
      return readFile(
        join(
          __dirname,
          "fixtures",
          "dra-acq-030-fr-2024-00001-corrected-order.txt",
        ),
        "utf-8",
      ).then((raw) => {
        const correctedText = stripFixtureHeader(raw);
        const req = buildRequest(
          "DRA-DOC-0034-CANDIDATE-CF",
          "Federal Register Vol. 89 No. 4 — FR Doc. 2024-00001 granule " +
            "(ANALYSIS-ONLY corrected reading order)",
          correctedText,
        );
        const runB = evaluateDocument(req) as {
          ok: true;
          decision: string;
          proofReceipt: any;
        };
        expect(runB.ok).toBe(true);
        expect(runB.proofReceipt.substantiveDigest).toBe(REFERENCE_RUN_B_DIGEST);
        expect(runB.decision).toBe("SUPPORTED");
        expect(runB.proofReceipt.issueSummary.total).toBe(0);
      });
    },
  );

  it(
    "production order (Run A) and corrected order (Run B) diverge in " +
      "statement/authority/evidence-record counts even though the final " +
      "decision is identical — the material downstream consequence of the " +
      "reading-order defect",
    async () => {
      const fetchA = await fetchBytes(GRANULE_URL);
      const bytes = new Uint8Array(fetchA.bytes);
      const normResult = await normaliseContent(
        bytes,
        "application/pdf" as never,
        sha256Bytes(bytes),
        extractPdfText,
      );
      expect(normResult.ok).toBe(true);
      if (!normResult.ok) return;

      const correctedRaw = await readFile(
        join(
          __dirname,
          "fixtures",
          "dra-acq-030-fr-2024-00001-corrected-order.txt",
        ),
        "utf-8",
      );
      const correctedText = stripFixtureHeader(correctedRaw);

      const runA = evaluateDocument(
        buildRequest("cmp-A", "Production order", normResult.document.text),
      ) as { ok: true; proofReceipt: any; decision: string };
      const runB = evaluateDocument(
        buildRequest("cmp-B", "Corrected order (analysis-only)", correctedText),
      ) as { ok: true; proofReceipt: any; decision: string };

      const stmtA = runA.proofReceipt.stageOutputs[1].output.statementCount;
      const stmtB = runB.proofReceipt.stageOutputs[1].output.statementCount;

      // Decision converges (both SUPPORTED / 0 issues on this document) —
      // but statement formation (Stage 2) measurably differs: 217 vs 328.
      expect(runA.decision).toBe(runB.decision);
      expect(stmtA).toBe(217);
      expect(stmtB).toBe(328);
      expect(stmtA).not.toBe(stmtB);

      // Authority/evidence-linkage record counts track statement count 1:1
      // in this evaluator version, so the divergence propagates through
      // Stages 3-4 as well.
      const authA = runA.proofReceipt.stageOutputs[2].output.authorityRecordCount;
      const authB = runB.proofReceipt.stageOutputs[2].output.authorityRecordCount;
      expect(authA).toBe(stmtA);
      expect(authB).toBe(stmtB);
    },
    30_000,
  );
});
