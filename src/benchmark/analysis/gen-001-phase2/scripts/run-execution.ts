/**
 * DRA-GEN-001 Phase 2 — Step 2: Run A + Run B blind execution.
 *
 * For every unit whose live bytes verified against the Phase 1 lock digest
 * (see fetch-and-cache.ts / fetch-verification.json), this script:
 *   1. re-verifies the cached raw bytes' digest one more time (belt-and-braces —
 *      the cache write only happens on match, but this guards against any
 *      tampering/corruption between steps),
 *   2. normalises (PDF -> pdftotext -layout; HTML -> tag-strip/entity-decode),
 *   3. builds the self-referential EvaluationRequest (see evaluate-unit.ts),
 *   4. calls evaluateDocument() TWICE with two different fixedTimestamps
 *      (Run A, Run B) against the SAME normalised text — this isolates
 *      pipeline determinism from source-acquisition variability, since the
 *      raw bytes are fetched only once and reused for both runs.
 *
 * Units whose digest did NOT verify are recorded as EXTERNAL_ACQUISITION_FAILURE
 * in both runs, with no evaluation attempted (locked-bytes-only rule — Phase 2
 * item 3 forbids evaluating unverified/live-drifted content).
 *
 * No mid-run diagnosis, heuristics, or document substitution occurs here —
 * per SEQUENTIAL_CONTAMINATION_CONTROL.noEngineeringBetweenUnits.
 *
 * Run: npx tsx src/benchmark/analysis/gen-001-phase2/scripts/run-execution.ts
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FROZEN_UNITS } from "../../gen-001-phase1/dra-gen-001-sample-manifest";
import { verifyAndNormaliseUnit, buildPhase2EvaluationRequest, safeEvaluateDocument } from "../evaluate-unit";
import { verifyReceiptIntegrity } from "../../../../pipeline/canonical-serialise";
import type { DocumentAssuranceEvaluation } from "../../../../pipeline/evaluation-result";

const OUT_DIR = "/tmp/dra-gen001-phase2";
const RAW_DIR = join(OUT_DIR, "raw");

const RUN_A_TIMESTAMP = "2026-08-12T12:00:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-12T18:00:00.000Z";

export interface PerUnitRunRecord {
  frameId: string;
  stratumId: string;
  runId: "A" | "B";
  sourceVerified: boolean;
  failureCategory:
    | "EXTERNAL_ACQUISITION_FAILURE"
    | "PIPELINE_FAILURE"
    | "SUCCESSFUL_EVALUATION"
    | "RUNNER_EXCEPTION";
  normalisationError: string | null;
  threw: boolean;
  exceptionMessage: string | null;
  ok: boolean | null;
  failedAtStage: string | null;
  decision: string | null;
  issueClasses: string[] | null;
  issueCount: number | null;
  proofReceiptId: string | null;
  proofReceiptSubstantiveDigest: string | null;
  proofReceiptIndependentlyVerified: boolean | null;
  proofReceiptExpected: boolean;
  stageOutputsPresent: string[] | null;
  durationMs: number;
  evaluatedAt: string | null;
}

async function runUnitOnce(
  unit: (typeof FROZEN_UNITS)[number],
  rawBytes: Buffer,
  runId: "A" | "B",
  fixedTimestamp: string,
): Promise<PerUnitRunRecord> {
  const start = Date.now();
  const verification = await verifyAndNormaliseUnit(unit, rawBytes);
  if (!verification.digestMatch) {
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      runId,
      sourceVerified: false,
      failureCategory: "EXTERNAL_ACQUISITION_FAILURE",
      normalisationError: null,
      threw: false,
      exceptionMessage: null,
      ok: null,
      failedAtStage: null,
      decision: null,
      issueClasses: null,
      issueCount: null,
      proofReceiptId: null,
      proofReceiptSubstantiveDigest: null,
      proofReceiptIndependentlyVerified: null,
      proofReceiptExpected: false,
      stageOutputsPresent: null,
      durationMs: Date.now() - start,
      evaluatedAt: null,
    };
  }
  const norm = verification.normalisation!;
  if (!norm.ok) {
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      runId,
      sourceVerified: true,
      failureCategory: "PIPELINE_FAILURE",
      normalisationError: `${norm.code}:${norm.message}`,
      threw: false,
      exceptionMessage: null,
      ok: null,
      failedAtStage: "NORMALISATION",
      decision: null,
      issueClasses: null,
      issueCount: null,
      proofReceiptId: null,
      proofReceiptSubstantiveDigest: null,
      proofReceiptIndependentlyVerified: null,
      proofReceiptExpected: false,
      stageOutputsPresent: null,
      durationMs: Date.now() - start,
      evaluatedAt: null,
    };
  }
  const request = buildPhase2EvaluationRequest(unit, norm.normalisedText, fixedTimestamp);
  const outcome = safeEvaluateDocument(request);
  if (outcome.threw) {
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      runId,
      sourceVerified: true,
      failureCategory: "RUNNER_EXCEPTION",
      normalisationError: null,
      threw: true,
      exceptionMessage: outcome.message,
      ok: null,
      failedAtStage: null,
      decision: null,
      issueClasses: null,
      issueCount: null,
      proofReceiptId: null,
      proofReceiptSubstantiveDigest: null,
      proofReceiptIndependentlyVerified: null,
      proofReceiptExpected: false,
      stageOutputsPresent: null,
      durationMs: Date.now() - start,
      evaluatedAt: null,
    };
  }
  const evaluation: DocumentAssuranceEvaluation = outcome.evaluation;
  if (!evaluation.ok) {
    return {
      frameId: unit.frameId,
      stratumId: unit.stratumId,
      runId,
      sourceVerified: true,
      failureCategory: "PIPELINE_FAILURE",
      normalisationError: null,
      threw: false,
      exceptionMessage: null,
      ok: false,
      failedAtStage: evaluation.failedAtStage,
      decision: null,
      issueClasses: null,
      issueCount: null,
      proofReceiptId: null,
      proofReceiptSubstantiveDigest: null,
      proofReceiptIndependentlyVerified: null,
      proofReceiptExpected: false,
      stageOutputsPresent: null,
      durationMs: Date.now() - start,
      evaluatedAt: null,
    };
  }
  const verified = verifyReceiptIntegrity(evaluation.proofReceipt);
  return {
    frameId: unit.frameId,
    stratumId: unit.stratumId,
    runId,
    sourceVerified: true,
    failureCategory: "SUCCESSFUL_EVALUATION",
    normalisationError: null,
    threw: false,
    exceptionMessage: null,
    ok: true,
    failedAtStage: null,
    decision: evaluation.decision,
    issueClasses: evaluation.issues.map((i) => i.issueClass),
    issueCount: evaluation.issues.length,
    proofReceiptId: evaluation.proofReceipt.id,
    proofReceiptSubstantiveDigest: evaluation.proofReceipt.substantiveDigest,
    proofReceiptIndependentlyVerified: verified,
    proofReceiptExpected: true,
    stageOutputsPresent: evaluation.proofReceipt.stageOutputs.map((s) => s.stageName),
    durationMs: Date.now() - start,
    evaluatedAt: evaluation.evaluatedAt,
  };
}

async function main() {
  const fetchVerification: Array<{ frameId: string; digestMatch: boolean }> = JSON.parse(
    await readFile(join(OUT_DIR, "fetch-verification.json"), "utf8"),
  );
  const verifiedSet = new Set(fetchVerification.filter((r) => r.digestMatch).map((r) => r.frameId));

  const runA: PerUnitRunRecord[] = [];
  const runB: PerUnitRunRecord[] = [];

  let i = 0;
  for (const unit of FROZEN_UNITS) {
    i++;
    const verified = verifiedSet.has(unit.frameId);
    let rawBytes: Buffer | null = null;
    if (verified) {
      rawBytes = await readFile(join(RAW_DIR, `${unit.frameId}.bin`));
    }
    const a = rawBytes
      ? await runUnitOnce(unit, rawBytes, "A", RUN_A_TIMESTAMP)
      : await runUnitOnce(unit, Buffer.alloc(0), "A", RUN_A_TIMESTAMP);
    const b = rawBytes
      ? await runUnitOnce(unit, rawBytes, "B", RUN_B_TIMESTAMP)
      : await runUnitOnce(unit, Buffer.alloc(0), "B", RUN_B_TIMESTAMP);
    runA.push(a);
    runB.push(b);
    console.log(
      `[${i}/${FROZEN_UNITS.length}] ${unit.frameId} verified=${verified} A=${a.failureCategory}/${a.decision ?? "-"} B=${b.failureCategory}/${b.decision ?? "-"}`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, "run-a.json"), JSON.stringify(runA, null, 2));
  await writeFile(join(OUT_DIR, "run-b.json"), JSON.stringify(runB, null, 2));

  console.log("\nRun A summary:", summarize(runA));
  console.log("Run B summary:", summarize(runB));
}

function summarize(run: PerUnitRunRecord[]) {
  const byCategory: Record<string, number> = {};
  for (const r of run) byCategory[r.failureCategory] = (byCategory[r.failureCategory] ?? 0) + 1;
  return byCategory;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
