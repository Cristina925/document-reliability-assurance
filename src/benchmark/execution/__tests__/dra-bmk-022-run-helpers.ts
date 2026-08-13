/**
 * DRA-BMK-022 test support — CPU-time-bounded run splitting.
 *
 * Engineering note (Part 13 — 300-second environment handling, continued):
 * once the network/pdftotext fetch step was moved out-of-band (see
 * dra-bmk-022-doc-builder.ts), a *second*, distinct bottleneck was found:
 * the frozen evaluator's own per-document CPU time scales poorly with
 * document length. Measured standalone (outside vitest, via
 * `npx tsx`, warm text cache, single-document runner.execute() calls):
 *
 *   DRA-DOC-0008 (164,726 chars) ->  17.4s   DRA-DOC-0018 (204,861 chars) -> 25.0s
 *   DRA-DOC-0009 ( 89,713 chars) ->   5.3s   DRA-DOC-0019 (159,047 chars) -> 10.4s
 *   DRA-DOC-0010 (122,238 chars) ->   9.7s   DRA-DOC-0020 (437,229 chars) -> 115.0s
 *   DRA-DOC-0011 (367,376 chars) ->  33.4s   DRA-DOC-0021 (162,051 chars) -> 16.2s
 *                                            DRA-DOC-0022 (393,924 chars) ->  51.4s
 *
 * Summed across all 22 documents this is ~300s of pure synchronous CPU work
 * per full run — right at (and unreliably over) both vitest's default
 * per-file budget and this environment's single-shell-command time cap.
 * This is not a vitest-specific hang: the identical non-linear scaling was
 * reproduced outside vitest with the exact same per-document timings. It is
 * a genuine (if surprising) characteristic of evaluator 0.1.2, which this
 * benchmark is explicitly forbidden from modifying (spec Part 14/16 hard
 * constraints) — so the workaround splits *test-runner invocations*, never
 * evaluator behaviour.
 *
 * Each full run (A or B) is therefore split into three CPU-time-balanced
 * document groups, each executed as its own vitest file (its own shell
 * command / time budget):
 *   Group 1: DRA-DOC-0001..0011  (~66s measured)
 *   Group 2: DRA-DOC-0012..0019  (~52s measured)
 *   Group 3: DRA-DOC-0020..0022  (~183s measured — dominated by DRA-DOC-0020)
 * A fourth, fast "final" file per run reads the three partial JSON files
 * (no evaluation performed there), merges them in corpus-ID order, runs the
 * full set of correctness assertions against the complete 22-document
 * result, and persists the merged summary for cross-run use. This performs
 * exactly the same 22 evaluator invocations, on exactly the same texts, as
 * a single unsplit run would — it only changes which OS process executes
 * which subset and when the results are assembled.
 */

import { writeFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkExecutionDocument } from "../runner.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";

export const GROUP_1_IDS = [
  "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004", "DRA-DOC-0005",
  "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008", "DRA-DOC-0009", "DRA-DOC-0010",
  "DRA-DOC-0011",
] as const;

export const GROUP_2_IDS = [
  "DRA-DOC-0012", "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
  "DRA-DOC-0017", "DRA-DOC-0018", "DRA-DOC-0019",
] as const;

export const GROUP_3_IDS = ["DRA-DOC-0020", "DRA-DOC-0021", "DRA-DOC-0022"] as const;

export const ALL_GROUPED_IDS = [...GROUP_1_IDS, ...GROUP_2_IDS, ...GROUP_3_IDS];

export interface SummaryRecord {
  corpusId: string;
  executedAt: string;
  ok: boolean;
  decision: string | null;
  issueClasses: string[];
  issueCount: number | null;
  statementCount: number | null;
  substantiveDigest: string | null;
  receiptIntegrityValid: boolean | null;
  errorCode: string | null;
  evaluatorVersion: string | null;
  pipelineVersion: string | null;
  schemaVersion: string | null;
}

/** Runs the given documents through a BenchmarkRunner and flattens each
 * ExecutionRecord into a plain, JSON-serialisable SummaryRecord (this is
 * exactly the mapping the original unsplit dra-bmk-022-evaluator-run.test.ts
 * used to build its persisted summary). */
export function runGroupAndSummarize(
  docs: readonly BenchmarkExecutionDocument[],
  fixedTimestamp: string,
  fixedRunId: string,
): { successCount: number; failureCount: number; records: SummaryRecord[] } {
  const runner = new BenchmarkRunner({ fixedTimestamp, fixedRunId });
  const result = runner.execute(docs);
  const records: SummaryRecord[] = result.records.map((r) => ({
    corpusId: r.corpusId,
    executedAt: r.executedAt,
    ok: r.evaluationResult.ok,
    decision: r.evaluationResult.ok ? r.evaluationResult.decision : null,
    issueClasses: r.evaluationResult.ok
      ? r.evaluationResult.issues.map((iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN")
      : [],
    issueCount: r.evaluationResult.ok ? r.evaluationResult.issues.length : null,
    statementCount: r.evaluationResult.ok
      ? ((r.evaluationResult as any).pipeline?.stage2?.statements?.length ?? null)
      : null,
    substantiveDigest: r.evaluationResult.ok ? r.evaluationResult.proofReceipt.substantiveDigest : null,
    receiptIntegrityValid: r.evaluationResult.ok ? verifyReceiptIntegrity(r.evaluationResult.proofReceipt) : null,
    errorCode: r.evaluationResult.ok ? null : (r.evaluationResult as any).code,
    evaluatorVersion: r.evaluationResult.ok
      ? ((r.evaluationResult.proofReceipt as any).evaluatorIdentity?.evaluatorVersion ?? null)
      : null,
    pipelineVersion: r.evaluationResult.ok
      ? ((r.evaluationResult.proofReceipt as any).evaluatorIdentity?.pipelineVersion ?? null)
      : null,
    schemaVersion: r.evaluationResult.ok ? ((r.evaluationResult.proofReceipt as any).schemaVersion ?? null) : null,
  }));
  return { successCount: result.successCount, failureCount: result.failureCount, records };
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf-8")) as T;
}

function groupPaths(run: "a" | "b") {
  return {
    g1: join(tmpdir(), `dra-bmk-022-run-${run}-group1.json`),
    g2: join(tmpdir(), `dra-bmk-022-run-${run}-group2.json`),
    g3: join(tmpdir(), `dra-bmk-022-run-${run}-group3.json`),
  };
}

export const RUN_A_GROUP_PATHS = groupPaths("a");
export const RUN_B_GROUP_PATHS = groupPaths("b");

/** Reads the three group partial files for a run and merges them into a
 * single corpus-ID-ordered array of SummaryRecords. */
export async function mergeGroups(paths: { g1: string; g2: string; g3: string }): Promise<SummaryRecord[]> {
  const [g1, g2, g3] = await Promise.all([
    readJson<{ records: SummaryRecord[] }>(paths.g1),
    readJson<{ records: SummaryRecord[] }>(paths.g2),
    readJson<{ records: SummaryRecord[] }>(paths.g3),
  ]);
  const all = [...g1.records, ...g2.records, ...g3.records];
  all.sort((a, b) => parseInt(a.corpusId.slice(-4), 10) - parseInt(b.corpusId.slice(-4), 10));
  return all;
}
