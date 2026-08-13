/**
 * DRA-BMK-022 — Parts 4-8: Twenty-Two-Document Evaluator Run (Run A, final
 * assembly)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  TWENTY-TWO-DOCUMENT EVALUATOR RUN — DRA-BMK-022 (RUN A)                 ║
 * ║                                                                          ║
 * ║  Corpus: DRA-DOC-0001 through DRA-DOC-0022                              ║
 * ║  Evaluator: frozen 0.1.2 (evaluateDocument, BenchmarkRunner)             ║
 * ║                                                                          ║
 * ║  Run A fixed timestamp: 2026-08-10T18:00:00.000Z                        ║
 * ║  Run B fixed timestamp: 2026-08-10T18:30:00.000Z                        ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No failures suppressed or decisions replaced                        ║
 * ║    • No evaluator features added                                         ║
 * ║    • Runner never throws — failures captured as records                 ║
 * ║    • No forced agreement between DRA-DOC-0022 and any other document     ║
 * ║    • No new documents admitted — this is measurement only               ║
 * ║                                                                          ║
 * ║  Engineering notes (both documented fully in                            ║
 * ║  dra-bmk-022-doc-builder.ts and dra-bmk-022-run-helpers.ts):             ║
 * ║   1. Fetches for all 22 sources go through a byte-level disk-cached     ║
 * ║      fetcher, then an extra text-level JSON handoff cache, built        ║
 * ║      out-of-band via `npx tsx dra-bmk-022-doc-builder.ts` — running     ║
 * ║      that fetch+pdftotext dance *inside* a vitest worker hung           ║
 * ║      indefinitely in this sandbox even against a warm cache.            ║
 * ║   2. The frozen evaluator's own CPU time scales poorly with document    ║
 * ║      length (~300s of pure synchronous work across all 22 documents,    ║
 * ║      dominated by the largest documents). This exceeds a single         ║
 * ║      shell/vitest invocation's practical time budget, so the actual     ║
 * ║      22-document evaluation for Run A is performed by three separate    ║
 * ║      CPU-time-balanced group files (dra-bmk-022-run-a-group{1,2,3}      ║
 * ║      .test.ts), each writing its slice of results to a JSON handoff     ║
 * ║      file. THIS file performs no evaluation itself — it only reads      ║
 * ║      those three partial files (must be run first), merges them in     ║
 * ║      corpus-ID order, and runs every correctness assertion against the  ║
 * ║      complete, merged 22-document result. This changes only which OS   ║
 * ║      process executes which subset and when results are assembled —    ║
 * ║      every document is still evaluated exactly once by the unmodified   ║
 * ║      frozen evaluator with the same fixedTimestamp/fixedRunId.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";
import { writeFile } from "fs/promises";

import { verifyReceiptIntegrity } from "../../../pipeline/index.js";

import { RUN_A_SUMMARY_PATH } from "./dra-bmk-022-shared.js";
import { buildAllDocsFromCache, REF_EEA_SOURCE_DIGEST } from "./dra-bmk-022-doc-builder.js";
import { mergeGroups, RUN_A_GROUP_PATHS, type SummaryRecord } from "./dra-bmk-022-run-helpers.js";

const FIXED_TS_A     = "2026-08-10T18:00:00.000Z";
const FIXED_RUN_ID_A = "bmk-022-run-A";

let allDocIds: string[] = [];
let records: SummaryRecord[] = [];
let successCount = 0;
let failureCount = 0;
let setupError: string | null = null;

let eeaSourceDigestLive = "";
let eeaTextLength = 0;
let eeaText = "";

beforeAll(async () => {
  try {
    // Fast (no network/CPU-heavy evaluation) — just re-assembles document
    // metadata/text from the already-built cache for the digest checks below.
    const built = await buildAllDocsFromCache();
    allDocIds = built.allDocs.map((d) => d.corpusDocument.corpusId);
    eeaSourceDigestLive = built.eeaSourceDigestLive;
    eeaTextLength = built.eeaTextLength;
    eeaText = built.allDocs.find((d) => d.corpusDocument.corpusId === "DRA-DOC-0022")?.generatedText ?? "";

    console.log(`\n── DRA-DOC-0022 Frozen vs Live: ${eeaSourceDigestLive === REF_EEA_SOURCE_DIGEST ? "✓ FROZEN_REPRESENTATION_CONFIRMED" : "⚠ LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`── DRA-DOC-0022 normalised text length (live): ${eeaTextLength}`);

    records = await mergeGroups(RUN_A_GROUP_PATHS);
    successCount = records.filter((r) => r.ok).length;
    failureCount = records.filter((r) => !r.ok).length;
    console.log(`   Run A (merged from 3 groups): ${successCount} success, ${failureCount} failure / ${records.length} docs`);

    const summary = {
      fixedTimestamp: FIXED_TS_A,
      fixedRunId: FIXED_RUN_ID_A,
      documentCount: records.length,
      successCount,
      failureCount,
      records,
      matches: { eeaFreezeRepresentationMatch: eeaSourceDigestLive === REF_EEA_SOURCE_DIGEST },
      eeaTextLength,
    };
    await writeFile(RUN_A_SUMMARY_PATH, JSON.stringify(summary, null, 2), "utf-8");
    console.log(`   Run A summary persisted to ${RUN_A_SUMMARY_PATH}`);
  } catch (err) {
    setupError = String(err);
  }
}, 60_000);

// ---------------------------------------------------------------------------
// Part 4 — Frozen Evaluator Run (Run A)
// ---------------------------------------------------------------------------

describe("DRA-BMK-022 — Part 4: Frozen Evaluator Run (Run A)", () => {
  it("setup completed without error (run the three dra-bmk-022-run-a-group*.test.ts files first)", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("all 22 BenchmarkExecutionDocuments were assembled in order", () => {
    expect(allDocIds).toHaveLength(22);
    expect(allDocIds).toEqual([
      "DRA-DOC-0001","DRA-DOC-0002","DRA-DOC-0003","DRA-DOC-0004","DRA-DOC-0005","DRA-DOC-0006",
      "DRA-DOC-0007","DRA-DOC-0008","DRA-DOC-0009","DRA-DOC-0010","DRA-DOC-0011","DRA-DOC-0012",
      "DRA-DOC-0013","DRA-DOC-0014","DRA-DOC-0015","DRA-DOC-0016","DRA-DOC-0017","DRA-DOC-0018",
      "DRA-DOC-0019","DRA-DOC-0020","DRA-DOC-0021","DRA-DOC-0022",
    ]);
  });

  it("reports live document integrity status for DRA-DOC-0022 against the admitted freeze record", () => {
    expect(REF_EEA_SOURCE_DIGEST).toHaveLength(64);
    expect(eeaText.length).toBeGreaterThan(0);
    console.log(`  DRA-DOC-0022 (en): ${eeaSourceDigestLive === REF_EEA_SOURCE_DIGEST ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
    console.log(`  DRA-DOC-0022 normalised text length: ${eeaTextLength}`);
  });

  it("Run A produced 22 results", () => {
    expect(records).toHaveLength(22);
  });

  it("Run A: every document evaluated successfully (runner never throws, no failures)", () => {
    for (const r of records) {
      if (!r.ok) console.error(`${r.corpusId} failed:`, r.errorCode);
      expect(r.ok).toBe(true);
    }
    expect(failureCount).toBe(0);
    expect(successCount).toBe(22);
  });

  it("Run A: every proof receipt carries the unmodified evaluator/pipeline/schema version stamps", () => {
    for (const r of records) {
      if (r.ok) {
        expect(r.evaluatorVersion).toBe("0.1.2");
        expect(r.pipelineVersion).toBe("1.0");
        expect(r.schemaVersion).toBe("0.1.0");
      }
    }
  });

  it("Run A: DRA-DOC-0022 reproduces the admission-time REVIEW / 3-issue / EVIDENCE_INADEQUATE observation", () => {
    const r22 = records.find((r) => r.corpusId === "DRA-DOC-0022");
    expect(r22).toBeDefined();
    if (r22 && r22.ok) {
      console.log(`\n── DRA-DOC-0022 Run A result: decision=${r22.decision}, issues=${r22.issueCount}`);
      expect(r22.decision).toBe("REVIEW");
      expect(r22.issueCount).toBe(3);
      for (const cls of r22.issueClasses) {
        expect(cls).toBe("EVIDENCE_INADEQUATE");
      }
      console.log(`── DRA-DOC-0022 Run A statement count: ${r22.statementCount}`);
      expect(r22.statementCount).toBe(4839);
    }
  });

  it("Run A: every proof receipt passes integrity verification (22/22)", () => {
    let verified = 0;
    for (const r of records) {
      if (r.ok) {
        expect(r.receiptIntegrityValid).toBe(true);
        verified++;
      }
    }
    expect(verified).toBe(22);
  });

  it("reports the corpus-wide decision distribution for the 22-document corpus", () => {
    const dist: Record<string, number> = {};
    for (const r of records) {
      if (r.ok && r.decision) dist[r.decision] = (dist[r.decision] ?? 0) + 1;
    }
    console.log("\n── Corpus-wide decision distribution (22 docs, Run A) ───────");
    for (const [k, v] of Object.entries(dist)) console.log(`  ${k}: ${v}`);
    expect(Object.values(dist).reduce((a, b) => a + b, 0)).toBe(22);
  });

  it("reports issue-class coverage against the 3/9 ceiling established by DRA-CHK-002", () => {
    const classes = new Set<string>();
    for (const r of records) {
      if (r.ok) for (const cls of r.issueClasses) classes.add(cls);
    }
    console.log("\n── Issue-class coverage (Run A) ─────────────────────────────");
    console.log(`  classes observed: ${[...classes].sort().join(", ")}`);
    console.log(`  coverage: ${classes.size} / 9`);
  });
});
