/**
 * DRA-BMK-023 test support — CPU-time-bounded run splitting.
 *
 * Reuses the DRA-BMK-022 CPU-time-balanced grouping for DRA-DOC-0001..0022
 * (Group 1 ~66s, Group 2 ~52s, Group 3 ~183s — see dra-bmk-022-run-helpers.ts
 * for the full standalone-timing table) and adds a fourth, isolated group for
 * DRA-DOC-0023 alone.
 *
 * Standalone timing measured for DRA-DOC-0023 (639,998 normalised chars,
 * 9,235 extracted statements — larger, by statement count, than any prior
 * corpus document), warm text cache, outside vitest:
 *
 *   DRA-DOC-0023 -> 155.5s CPU, decision=HOLD, issueCount=184
 *
 * This is well above DRA-DOC-0020's 115.0s (437,229 chars) despite the two
 * documents' char-count ratio being only ~1.46x — consistent with the
 * runtime being driven primarily by statement *count* (9,235 vs DRA-DOC-0020's
 * count, not measured here but visibly far higher relative to its char
 * count) rather than raw character count. See the BMK-023 checkpoint test
 * for the scale-causality analysis (spec Part 7).
 *
 * DRA-DOC-0023 is therefore given its own isolated Group 4, exactly as
 * DRA-DOC-0020 was isolated in BMK-022's Group 3.
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkExecutionDocument } from "../runner.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { BMK023_SCRATCH_DIR } from "./dra-bmk-023-shared.js";

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

export const GROUP_4_IDS = ["DRA-DOC-0023"] as const;

export const ALL_GROUPED_IDS = [...GROUP_1_IDS, ...GROUP_2_IDS, ...GROUP_3_IDS, ...GROUP_4_IDS];

export interface SummaryRecord {
  corpusId: string;
  executedAt: string;
  ok: boolean;
  decision: string | null;
  issueClasses: string[];
  /** Count of issues per issueClass (e.g. { EVIDENCE_ABSENT: 100, EVIDENCE_INADEQUATE: 84 }). */
  issueClassCounts: Record<string, number>;
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
 * ExecutionRecord into a plain, JSON-serialisable SummaryRecord. */
export function runGroupAndSummarize(
  docs: readonly BenchmarkExecutionDocument[],
  fixedTimestamp: string,
  fixedRunId: string,
): { successCount: number; failureCount: number; records: SummaryRecord[] } {
  const runner = new BenchmarkRunner({ fixedTimestamp, fixedRunId });
  const result = runner.execute(docs);
  const records: SummaryRecord[] = result.records.map((r) => {
    const issueClasses = r.evaluationResult.ok
      ? r.evaluationResult.issues.map((iss) => (iss as any).issueClass ?? (iss as any).class ?? "UNKNOWN")
      : [];
    const issueClassCounts: Record<string, number> = {};
    for (const c of issueClasses) issueClassCounts[c] = (issueClassCounts[c] ?? 0) + 1;
    return {
      corpusId: r.corpusId,
      executedAt: r.executedAt,
      ok: r.evaluationResult.ok,
      decision: r.evaluationResult.ok ? r.evaluationResult.decision : null,
      issueClasses: [...new Set(issueClasses)],
      issueClassCounts,
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
    };
  });
  return { successCount: result.successCount, failureCount: result.failureCount, records };
}

export interface IssueDetail {
  id: string;
  issueClass: string;
  severity: string;
  affectedStatementIds: string[];
  affectedEvidenceUnitIds: string[];
  explanation: string;
  stageAssociation: string | null;
}

export interface StatementDetail {
  id: string;
  statementIndex: number;
  startOffset: number | null;
  endOffset: number | null;
  pageNumber: number | null;
  locationLabel: string | null;
  materiality: string | null;
  textExcerpt: string;
  linkedEvidenceUnitCount: number;
}

export interface DocDetailDump {
  corpusId: string;
  decision: string;
  issueCount: number;
  statementCount: number;
  substantiveDigest: string;
  issues: IssueDetail[];
  statements: StatementDetail[];
}

/** Runs a single document and captures the full issue+statement detail (not
 * just the flattened SummaryRecord) — used for the DRA-DOC-0023 structural
 * analysis (spec Parts 5-7), which needs per-issue affectedStatementIds and
 * per-statement span/offset information, not just aggregate counts. */
export function runSingleDocDetailed(
  doc: BenchmarkExecutionDocument,
  fixedTimestamp: string,
  fixedRunId: string,
): DocDetailDump {
  const runner = new BenchmarkRunner({ fixedTimestamp, fixedRunId });
  const result = runner.execute([doc]);
  const rec = result.records[0]!;
  if (!rec.evaluationResult.ok) {
    throw new Error(`DRA-DOC-0023 evaluation failed: ${JSON.stringify((rec.evaluationResult as any).errors)}`);
  }
  const evalRes = rec.evaluationResult as any;
  const statements = evalRes.pipeline?.stage2?.statements ?? [];
  const issues: IssueDetail[] = evalRes.issues.map((iss: any) => ({
    id: iss.id,
    issueClass: iss.issueClass,
    severity: iss.severity,
    affectedStatementIds: iss.affectedStatementIds ?? [],
    affectedEvidenceUnitIds: iss.affectedEvidenceUnitIds ?? [],
    explanation: iss.explanation,
    stageAssociation: iss.stageAssociation ?? null,
  }));
  const statementDetails: StatementDetail[] = statements.map((s: any) => ({
    id: s.id,
    statementIndex: s.statementIndex,
    startOffset: s.spanRef?.startOffset ?? null,
    endOffset: s.spanRef?.endOffset ?? null,
    pageNumber: s.spanRef?.pageNumber ?? null,
    locationLabel: s.spanRef?.locationLabel ?? null,
    materiality: s.materiality ?? null,
    textExcerpt: String(s.text ?? "").slice(0, 200),
    linkedEvidenceUnitCount: (s.linkedEvidenceUnitIds ?? []).length,
  }));
  return {
    corpusId: rec.corpusId,
    decision: evalRes.decision,
    issueCount: evalRes.issues.length,
    statementCount: statements.length,
    substantiveDigest: evalRes.proofReceipt.substantiveDigest,
    issues,
    statements: statementDetails,
  };
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(BMK023_SCRATCH_DIR, { recursive: true }).catch(() => {});
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf-8")) as T;
}

function groupPaths(run: "a" | "b") {
  return {
    g1: join(BMK023_SCRATCH_DIR, `dra-bmk-023-run-${run}-group1.json`),
    g2: join(BMK023_SCRATCH_DIR, `dra-bmk-023-run-${run}-group2.json`),
    g3: join(BMK023_SCRATCH_DIR, `dra-bmk-023-run-${run}-group3.json`),
    g4: join(BMK023_SCRATCH_DIR, `dra-bmk-023-run-${run}-group4.json`),
  };
}

export const RUN_A_GROUP_PATHS = groupPaths("a");
export const RUN_B_GROUP_PATHS = groupPaths("b");

/** Reads the four group partial files for a run and merges them into a
 * single corpus-ID-ordered array of SummaryRecords. */
export async function mergeGroups(paths: { g1: string; g2: string; g3: string; g4: string }): Promise<SummaryRecord[]> {
  const [g1, g2, g3, g4] = await Promise.all([
    readJson<{ records: SummaryRecord[] }>(paths.g1),
    readJson<{ records: SummaryRecord[] }>(paths.g2),
    readJson<{ records: SummaryRecord[] }>(paths.g3),
    readJson<{ records: SummaryRecord[] }>(paths.g4),
  ]);
  const all = [...g1.records, ...g2.records, ...g3.records, ...g4.records];
  all.sort((a, b) => parseInt(a.corpusId.slice(-4), 10) - parseInt(b.corpusId.slice(-4), 10));
  return all;
}
