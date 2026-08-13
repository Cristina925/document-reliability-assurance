/**
 * DRA-BMK-023 — Twenty-Three-Document Corpus Checkpoint and Evaluator 0.1.2
 * Reproducibility Run
 *
 * Follows DRA-ACQ-019 Phase 2 (admission of DRA-DOC-0023 — CMA Case 51098
 * decision, freeze DRA-FRZ-000017, acquisition DRA-ACQ-000026).
 *
 * This is a benchmark-only checkpoint. No evaluator or pipeline production
 * code is modified by this file or any of its DRA-BMK-023 support files
 * (dra-bmk-023-doc-builder.ts, dra-bmk-023-shared.ts, dra-bmk-023-run-helpers.ts,
 * dra-bmk-023-prior-entries.ts, and the 8 dra-bmk-023-run-{a,b}-group{1..4}.test.ts
 * group runners).
 *
 * ── How the underlying data was produced ────────────────────────────────
 *
 * Because a single-process 23-document x 2-run evaluation exceeds the
 * sandbox's 300s shell budget, the corpus was split into four CPU-time
 * balanced groups (reusing DRA-BMK-022's Group 1/2/3 for DRA-DOC-0001..0022
 * unchanged, plus a new Group 4 isolating DRA-DOC-0023 alone — see
 * dra-bmk-023-run-helpers.ts for the measured-timing rationale). Each of the
 * 8 group test files (4 groups x 2 independent runs, Run A fixedTimestamp
 * 2026-08-10T20:00:00.000Z / Run B fixedTimestamp 2026-08-10T21:00:00.000Z)
 * was executed once, standalone, and each persisted its SummaryRecord[] (and,
 * for Group 4 only, a full issue+statement detail dump) to
 * dra-bmk-023-run-helpers.ts's BMK023_SCRATCH_DIR (a workspace-local
 * directory, not os.tmpdir(), because /tmp was observed to be cleared by a
 * mid-session sandbox restart during this checkpoint — see
 * dra-bmk-023-shared.ts). This checkpoint test reads those 8 persisted group
 * files plus the 2 detail dumps and verifies the required invariants
 * directly — it does not re-run the (expensive, ~485s combined) evaluations
 * itself.
 *
 * Part 1 additionally reproduces the exact admission-time freeze/manifest
 * digests for DRA-DOC-0023 by re-running the identical governed pipeline
 * call (acquireFreezeAndEvaluate) used by the DRA-ACQ-019 Phase 2 admission
 * test, against the disk-cached CMA PDF bytes (no network re-fetch) and the
 * PRIOR_CORPUS_ENTRIES for DRA-DOC-0007..0022 (byte-for-byte reused from
 * DRA-BMK-022, itself already proven to reproduce the admission-time
 * 22-document manifest digest). Because AcquisitionFreezeRecord's
 * freezeRecordDigest is computed over all fields except frozenAt and itself
 * (see freeze.ts), and the corpus manifest digest is a pure function of the
 * registered documents' content, both are fully deterministic given
 * identical material inputs — this reproduction is not a coincidence but a
 * structural guarantee, independently confirmed twice more by Run A and
 * Run B's own DRA-DOC-0023 group-4 evaluation, which used the same
 * evaluator/document inputs via a different code path (BenchmarkRunner
 * rather than the governed acquisition pipeline) and produced an identical
 * decision, issue count, issue-class breakdown, and statement count.
 */

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../../acquisition/request.js";
import { acquireFreezeAndEvaluate } from "../../acquisition/governed-pipeline.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import {
  PRIOR_CORPUS_ENTRIES,
  CORPUS_VERSION,
  ADMISSION_MANIFEST_DIGEST_22,
} from "./dra-bmk-023-prior-entries.js";
import {
  RUN_A_GROUP_PATHS,
  RUN_B_GROUP_PATHS,
  mergeGroups,
  readJson,
  ALL_GROUPED_IDS,
  type SummaryRecord,
  type DocDetailDump,
} from "./dra-bmk-023-run-helpers.js";
import { DOC23_DETAIL_A_PATH, DOC23_DETAIL_B_PATH } from "./dra-bmk-023-shared.js";

// ---------------------------------------------------------------------------
// Checkpoint identity
// ---------------------------------------------------------------------------

const CHECKPOINT_ID = "DRA-CHK-000023";
const CHECKPOINT_TIMESTAMP = "2026-08-10T22:00:00.000Z";
const BENCHMARK_MILESTONE = "DRA-BMK-023";

const REVIEW_TIMESTAMP = "2026-08-10T12:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-10T12:30:00.000Z";
const CMA_URL =
  "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf";

/** Reproduced live during this checkpoint (see docblock) — recorded here as
 * the authoritative values for cross-checking, exactly as DRA-BMK-022
 * recorded ADMISSION_MANIFEST_DIGEST from its own live reproduction. */
const EXPECTED_23DOC_MANIFEST_DIGEST =
  "b45463b52699a607af62da8d1e118ad0cb66dd36ef1dc21b97c1dc6645a30884";
const EXPECTED_DOC23_SOURCE_DIGEST =
  "639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725cbccbd115";
const EXPECTED_DOC23_NORMALISED_TEXT_DIGEST =
  "4016a20030f82f4373861d34536223f81ec8f596319f53b70095f4e3adc01331";
const EXPECTED_DOC23_METADATA_DIGEST =
  "e81995324ebf142e91ab88c1a1dfde51c3598ffcb6c67a71873719f664ba0237";
/** NOTE: freezeRecordDigest (unlike sourceDigest/normalisedTextDigest/
 * metadataDigest) is computed over the full freeze record including the
 * human governance assessment text (OFFICIAL_SOURCE_ASSESSMENT /
 * LICENCE_ASSESSMENT / INCLUSION_RATIONALE below) — it is therefore specific
 * to *this* checkpoint's reproduction wording, not a cross-checkable
 * admission-time literal (the real DRA-ACQ-019 Phase 2 admission test does
 * not expose its freezeRecordDigest as a literal — see DRA-BMK-023 memory).
 * This value is deterministic given the fixed assessment text below and is
 * asserted here only to detect drift within this checkpoint file itself. */
const EXPECTED_DOC23_FREEZE_RECORD_DIGEST =
  "facd08b5819342fbfb847128f8751125c594fad85b465ca98c9cd6c7e4b7d28c";

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-BMK-023-lock-inputs",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Reproduction of the DRA-ACQ-019 Phase 2 admission for DRA-BMK-023 Part 1 digest verification.",
  ],
  notes: "DRA-BMK-023 Part 1 lock-inputs reproduction — see DRA-ACQ-019 Phase 2 for the governing record.",
});
const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Open Government Licence v3.0",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-BMK-023-lock-inputs",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: ["Reproduction only — see the DRA-ACQ-019 Phase 2 admission test for the governed licence record."],
  notes: "DRA-BMK-023 Part 1 lock-inputs reproduction.",
});
const APPROVED_METADATA = Object.freeze({
  title:
    "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling and " +
    "advertising of recycling-related features (Case 51098)",
  publisher: "Competition and Markets Authority (CMA)",
  publicationDate: "2025-04-01",
  domain: "GENERAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "en-GB",
});
const INCLUSION_RATIONALE =
  "See DRA-ACQ-019 Phase 2 admission test for the full governed inclusion rationale — this is a " +
  "DRA-BMK-023 Part 1 digest-reproduction run only, not a re-litigation of the admission decision.";

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const { writeFile, readFile, unlink } = await import("fs/promises");
  const { tmpdir } = await import("os");
  const { join } = await import("path");
  const execFileAsync = promisify(execFile);
  const id = `dra-bmk023-chk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

// ---------------------------------------------------------------------------
// Part 1 — Lock and Verify the 23-Document Corpus
// ---------------------------------------------------------------------------

describe("DRA-BMK-023 — Part 1: Lock and Verify the 23-Document Corpus", () => {
  it(
    "reproduces the exact DRA-DOC-0023 freeze digests and 23-document manifest digest via the " +
      "unmodified governed pipeline, against disk-cached source bytes (no network re-fetch)",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-BMK-023 — PART 1: LOCK-INPUTS CHECKPOINT LOG          ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const registry = new CorpusRegistry();
      for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
      for (const entry of PRIOR_CORPUS_ENTRIES) registry.add(entry);

      console.log(`  22-document registry built: ${registry.size} documents`);
      expect(registry.size).toBe(22);

      const manifest22 = registry.exportManifest(CORPUS_VERSION);
      console.log(`  22-doc manifest digest (recomputed) : ${manifest22.overallDigest}`);
      console.log(`  22-doc manifest digest (BMK-022)     : ${ADMISSION_MANIFEST_DIGEST_22}`);
      expect(manifest22.overallDigest).toBe(ADMISSION_MANIFEST_DIGEST_22);
      console.log("  ✓ Prior 22 entries unchanged since DRA-BMK-022 (no drift).");

      const protocol = buildMinimalProtocol({
        protocolId: "DRA-PROTO-ACQ-019",
        protocolStatus: "APPROVED",
        targetCorpusSize: 23,
        permittedDocumentTypes: ["SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY", "PROCEDURE", "ARTICLE", "OTHER"],
        permittedLanguages: ["en", "en-GB", "es", "fr"],
      });

      const requestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000026",
        sourceUrl: CMA_URL,
        requestedBy: "DRA-BMK-023-lock-inputs",
        requestedAt: FREEZE_TIMESTAMP,
        expectedPublisher: "Competition and Markets Authority (CMA)",
        expectedTitle: "Anti-competitive conduct in relation to vehicle recycling",
      });
      expect(requestResult.ok).toBe(true);
      if (!requestResult.ok) return;

      const realFetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 15_000_000,
        userAgent: "DRA-BMK-023-lock-inputs/1.0",
      });
      const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-023");

      const pipelineResult = await acquireFreezeAndEvaluate(
        {
          request: requestResult.request,
          officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
          licenceAssessment: LICENCE_ASSESSMENT,
          approvedMetadata: APPROVED_METADATA,
          corpusDocumentId: "DRA-DOC-0023",
          freezeRecordId: "DRA-FRZ-000017",
          frozenBy: "DRA-BMK-023-lock-inputs",
          benchmarkVersion: CORPUS_VERSION,
          inclusionRationale: INCLUSION_RATIONALE,
        },
        { fetcher, pdfExtractor: extractPdfText, registry, protocol, fixedTimestamp: FREEZE_TIMESTAMP },
      );

      expect(pipelineResult.ok).toBe(true);
      if (!pipelineResult.ok) {
        console.error("Pipeline FAILED:", (pipelineResult as any).stage, JSON.stringify((pipelineResult as any).errors));
        return;
      }

      const { result } = pipelineResult;

      console.log("\n── Reproduced Freeze Record (DRA-FRZ-000017) ───────────────");
      console.log(`  sourceDigest         : ${result.freeze.sourceDigest}`);
      console.log(`  normalisedTextDigest : ${result.freeze.normalisedTextDigest}`);
      console.log(`  metadataDigest       : ${result.freeze.metadataDigest}`);
      console.log(`  freezeRecordDigest   : ${result.freeze.freezeRecordDigest}`);

      expect(result.freeze.sourceDigest).toBe(EXPECTED_DOC23_SOURCE_DIGEST);
      expect(result.freeze.normalisedTextDigest).toBe(EXPECTED_DOC23_NORMALISED_TEXT_DIGEST);
      expect(result.freeze.metadataDigest).toBe(EXPECTED_DOC23_METADATA_DIGEST);
      expect(result.freeze.freezeRecordDigest).toBe(EXPECTED_DOC23_FREEZE_RECORD_DIGEST);

      console.log("\n── Reproduced 23-Document Manifest ──────────────────────────");
      console.log(`  documentCount : ${result.manifest.documentCount}`);
      console.log(`  overallDigest : ${result.manifest.overallDigest}`);
      console.log(`  documentIds   : ${result.manifest.documentIds.join(", ")}`);

      expect(result.manifest.documentCount).toBe(23);
      expect(result.manifest.overallDigest).toBe(EXPECTED_23DOC_MANIFEST_DIGEST);
      expect(verifyManifestIntegrity(result.manifest)).toBe(true);

      // Canonical ordering (DRA-DOC-0001..0023, ascending) and uniqueness.
      const expectedOrder = Array.from({ length: 23 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
      expect(result.manifest.documentIds).toEqual(expectedOrder);
      expect(new Set(result.manifest.documentIds).size).toBe(23);

      // No production code changes: this checkpoint reproduces the frozen
      // evaluator version exactly, as evidence of an unmodified evaluator.
      const evalOk = result.evaluationResult.ok ? result.evaluationResult : null;
      expect(evalOk).not.toBeNull();
      if (evalOk) {
        expect((evalOk.proofReceipt as any).evaluatorIdentity?.evaluatorVersion).toBe("0.1.2");
        console.log("\n── Reproduced DRA-DOC-0023 Evaluation (via governed pipeline) ─");
        console.log(`  decision      : ${result.decision}`);
        console.log(`  issueCount    : ${evalOk.issues.length}`);
      }
    },
    280_000,
  );
});

// ---------------------------------------------------------------------------
// Part 2/3 — Full-Corpus Reproducibility (Run A vs Run B, 23/23)
// ---------------------------------------------------------------------------

describe("DRA-BMK-023 — Parts 2-3: Two Independent Full-Corpus Evaluations and Reproducibility", () => {
  it("Run A and Run B group files exist for all 4 groups", () => {
    for (const paths of [RUN_A_GROUP_PATHS, RUN_B_GROUP_PATHS]) {
      for (const p of Object.values(paths)) {
        expect(existsSync(p)).toBe(true);
      }
    }
  });

  it("Run A: evaluates all 23 documents with 23/23 success", async () => {
    const records = await mergeGroups(RUN_A_GROUP_PATHS);
    expect(records).toHaveLength(23);
    expect(records.every((r) => r.ok)).toBe(true);
    expect(records.map((r) => r.corpusId)).toEqual(ALL_GROUPED_IDS);
  });

  it("Run B: evaluates all 23 documents with 23/23 success", async () => {
    const records = await mergeGroups(RUN_B_GROUP_PATHS);
    expect(records).toHaveLength(23);
    expect(records.every((r) => r.ok)).toBe(true);
    expect(records.map((r) => r.corpusId)).toEqual(ALL_GROUPED_IDS);
  });

  it("Run A and Run B are substantively identical for all 23 documents (no silent normalisation)", async () => {
    const a = await mergeGroups(RUN_A_GROUP_PATHS);
    const b = await mergeGroups(RUN_B_GROUP_PATHS);
    expect(a).toHaveLength(23);
    expect(b).toHaveLength(23);

    const substantiveFields: (keyof SummaryRecord)[] = [
      "corpusId", "ok", "decision", "issueCount", "statementCount",
      "substantiveDigest", "receiptIntegrityValid", "evaluatorVersion",
      "pipelineVersion", "schemaVersion",
    ];

    let identicalCount = 0;
    for (let i = 0; i < 23; i++) {
      const ra = a[i]!;
      const rb = b[i]!;
      for (const field of substantiveFields) {
        expect(ra[field]).toEqual(rb[field]);
      }
      expect([...ra.issueClasses].sort()).toEqual([...rb.issueClasses].sort());
      expect(ra.issueClassCounts).toEqual(rb.issueClassCounts);
      identicalCount++;
    }
    console.log(`\n  23/23 documents substantively identical across Run A and Run B: ${identicalCount === 23 ? "✓" : "✗"}`);
    expect(identicalCount).toBe(23);
  });

  it("Run A: all 23 proof receipts pass integrity verification", async () => {
    const records = await mergeGroups(RUN_A_GROUP_PATHS);
    expect(records.every((r) => r.receiptIntegrityValid === true)).toBe(true);
  });

  it("Run B: all 23 proof receipts pass integrity verification (46/46 total, both runs)", async () => {
    const records = await mergeGroups(RUN_B_GROUP_PATHS);
    expect(records.every((r) => r.receiptIntegrityValid === true)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 4 — DRA-DOC-0023 Exact Reproduction and IC-4/IC-5 Decomposition
// ---------------------------------------------------------------------------

describe("DRA-BMK-023 — Part 4: DRA-DOC-0023 Exact Result Reproduction", () => {
  it("independently reproduces the admission-time HOLD/184 result from both Run A and Run B, " +
    "with an exact IC-4 (EVIDENCE_INADEQUATE) / IC-5 (EVIDENCE_ABSENT) decomposition", async () => {
    const a = await mergeGroups(RUN_A_GROUP_PATHS);
    const b = await mergeGroups(RUN_B_GROUP_PATHS);
    const doc23a = a.find((r) => r.corpusId === "DRA-DOC-0023")!;
    const doc23b = b.find((r) => r.corpusId === "DRA-DOC-0023")!;

    console.log("\n── DRA-DOC-0023 Reproduction (Run A / Run B) ────────────────");
    console.log(`  decision            : ${doc23a.decision} / ${doc23b.decision}`);
    console.log(`  issueCount          : ${doc23a.issueCount} / ${doc23b.issueCount}`);
    console.log(`  issueClassCounts A  : ${JSON.stringify(doc23a.issueClassCounts)}`);
    console.log(`  issueClassCounts B  : ${JSON.stringify(doc23b.issueClassCounts)}`);
    console.log(`  statementCount      : ${doc23a.statementCount} / ${doc23b.statementCount}`);

    // Admission-time observation (DRA-ACQ-019 Phase 2): HOLD, 184 issues.
    for (const rec of [doc23a, doc23b]) {
      expect(rec.decision).toBe("HOLD");
      expect(rec.issueCount).toBe(184);
      expect(rec.statementCount).toBe(9235);
      expect(rec.issueClassCounts).toEqual({ EVIDENCE_INADEQUATE: 11, EVIDENCE_ABSENT: 173 });
      expect(11 + 173).toBe(184);
    }
    expect(doc23a.substantiveDigest).toBe(doc23b.substantiveDigest);

    console.log("  ✓ HOLD/184 (11 EVIDENCE_INADEQUATE + 173 EVIDENCE_ABSENT) reproduced identically in both runs,");
    console.log("    matching the DRA-ACQ-019 Phase 2 admission-time observation exactly.");
  });
});

// ---------------------------------------------------------------------------
// Part 5/6/7 — Structural Analysis, Loss Sampling, and Scale-Causality
// (assertions on the persisted full-detail dumps; narrative findings are in
// the DRA-BMK-023 final report)
// ---------------------------------------------------------------------------

describe("DRA-BMK-023 — Parts 5-7: DRA-DOC-0023 Structural Analysis (detail-dump invariants)", () => {
  it("Run A and Run B full-detail dumps exist and are internally consistent", async () => {
    expect(existsSync(DOC23_DETAIL_A_PATH)).toBe(true);
    expect(existsSync(DOC23_DETAIL_B_PATH)).toBe(true);
    const detailA = await readJson<DocDetailDump>(DOC23_DETAIL_A_PATH);
    const detailB = await readJson<DocDetailDump>(DOC23_DETAIL_B_PATH);
    expect(detailA.issueCount).toBe(184);
    expect(detailB.issueCount).toBe(184);
    expect(detailA.statementCount).toBe(9235);
    expect(detailB.statementCount).toBe(9235);
  });

  it("all 184 issues are single-statement, uniquely-targeted, and Consistency-Check-associated " +
    "(no duplicate targeting, no cross-issue statement sharing)", async () => {
    const detail = await readJson<DocDetailDump>(DOC23_DETAIL_A_PATH);
    expect(detail.issues.every((i) => i.affectedStatementIds.length === 1)).toBe(true);
    expect(detail.issues.every((i) => i.stageAssociation === "Consistency Check")).toBe(true);
    const targeted = detail.issues.map((i) => i.affectedStatementIds[0]);
    expect(new Set(targeted).size).toBe(targeted.length); // no duplication
  });

  it("severity partitions exactly along issue class (BLOCKING <-> EVIDENCE_ABSENT, ADVISORY <-> EVIDENCE_INADEQUATE)", async () => {
    const detail = await readJson<DocDetailDump>(DOC23_DETAIL_A_PATH);
    for (const issue of detail.issues) {
      if (issue.issueClass === "EVIDENCE_ABSENT") expect(issue.severity).toBe("BLOCKING");
      if (issue.issueClass === "EVIDENCE_INADEQUATE") expect(issue.severity).toBe("ADVISORY");
    }
  });

  it("flagged statements are heavily concentrated in the final third of the document " +
    "(the penalty-calculation Annexes 3-5 described in the DRA-ACQ-019 admission rationale), " +
    "not spread uniformly across the whole text — a structural, not scale-uniform, pattern", async () => {
    const detail = await readJson<DocDetailDump>(DOC23_DETAIL_A_PATH);
    const stmtsById = new Map(detail.statements.map((s) => [s.id, s]));
    const docLen = 639_998; // DRA-DOC-0023 normalised text length, confirmed at doc-builder time
    let lastThird = 0;
    let withOffset = 0;
    for (const issue of detail.issues) {
      const stmt = stmtsById.get(issue.affectedStatementIds[0]!);
      if (!stmt || stmt.startOffset === null) continue;
      withOffset++;
      if (stmt.startOffset / docLen >= 0.7) lastThird++;
    }
    expect(withOffset).toBe(184);
    // Observed: 174/184 (~95%) fall at or beyond the 70% mark of the document.
    expect(lastThird).toBeGreaterThanOrEqual(170);
  });

  it("a sampled EVIDENCE_ABSENT statement's own text contains a mashed-in footnote-style numeral " +
    "immediately after a closing parenthesis and period — direct evidence that the source PDF's " +
    "superscript footnote markers are flattened into plain inline digits by pdftotext extraction, " +
    "which EL-FOOTNOTE-REF (unicode-superscript / markdown-only) cannot recognise " +
    "(ACQUISITION_OR_NORMALISATION_DEFECT category B: evidence lost in extraction, sampled not exhaustive)", async () => {
    const detail = await readJson<DocDetailDump>(DOC23_DETAIL_A_PATH);
    const sample = detail.statements.find((s) => s.startOffset === 377620);
    expect(sample).toBeDefined();
    expect(sample!.textExcerpt).toContain(").602 In the");
    const matchingIssue = detail.issues.find((i) => i.affectedStatementIds[0] === sample!.id);
    expect(matchingIssue).toBeDefined();
    expect(matchingIssue!.issueClass).toBe("EVIDENCE_ABSENT");
  });
});

// ---------------------------------------------------------------------------
// Part 8/9 — Corpus-Wide Context and Reachability Preservation
// ---------------------------------------------------------------------------

describe("DRA-BMK-023 — Parts 8-9: Corpus-Wide Context and Reachability Preservation", () => {
  it("corpus-wide issue-class coverage remains 3/9 with DRA-DOC-0023 included " +
    "(EVIDENCE_ABSENT, EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY only — no new class exercised)", async () => {
    const records = await mergeGroups(RUN_A_GROUP_PATHS);
    const allClasses = new Set<string>();
    for (const r of records) for (const c of r.issueClasses) allClasses.add(c);
    expect([...allClasses].sort()).toEqual(["CLAIM_INCONSISTENCY", "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE"]);
    expect(allClasses.size).toBe(3);
  });

  it("decision distribution across the 23-document corpus is SUPPORTED 10 / REVIEW 10 / HOLD 3 " +
    "(DRA-DOC-0023 is the third HOLD document, joining DRA-DOC-0008 and DRA-DOC-0009)", async () => {
    const records = await mergeGroups(RUN_A_GROUP_PATHS);
    const counts: Record<string, number> = {};
    for (const r of records) counts[r.decision ?? "null"] = (counts[r.decision ?? "null"] ?? 0) + 1;
    expect(counts).toEqual({ SUPPORTED: 10, REVIEW: 10, HOLD: 3 });
    const holdIds = records.filter((r) => r.decision === "HOLD").map((r) => r.corpusId).sort();
    expect(holdIds).toEqual(["DRA-DOC-0008", "DRA-DOC-0009", "DRA-DOC-0023"]);
  });
});
