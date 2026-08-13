/**
 * DRA-GEN-001 Phase 2 — Immutable result-artefact manifest
 *
 * Binds the four result artefacts produced by the Phase 2 scripts
 * (run A, run B, A/B comparison, proof verification, failure classification,
 * aggregate statistics — persisted under /tmp/dra-gen001-phase2/ at
 * execution time and copied into this module's `data/` directory for
 * durable, version-controlled storage) to the three canonical identities
 * (GC-1, protocol, sample) verified in preconditions.ts, using the same
 * canonicalise-then-SHA-256 pattern as every other DRA freeze/manifest
 * module in this codebase (dra-gc-1-freeze-manifest.ts,
 * dra-gen-001-freeze-manifest.ts, gen-001-phase1/dra-gen-001-sample-manifest.ts).
 *
 * This module is a DATA module: it reads static JSON committed under
 * ./data/ (never re-fetches, never re-evaluates) and computes a single
 * deterministic aggregate digest over the whole Phase 2 result set, plus a
 * verdict function checking that the read data is bound to the exact three
 * identities recorded at execution time.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
} from "../dra-gc-1-freeze-manifest";
import { GEN001_PROTOCOL_AGGREGATE_DIGEST } from "../dra-gen-001-freeze-manifest";
import { GEN001_SAMPLE_AGGREGATE_DIGEST } from "../gen-001-phase1/dra-gen-001-sample-manifest";

const DATA_DIR = join(__dirname, "data");

function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digestOf(value: unknown): string {
  return createHash("sha256").update(canonicalStringify(value)).digest("hex");
}

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), "utf8")) as T;
}

// ---------------------------------------------------------------------------
// Execution environment record (Section 2 of the task)
// ---------------------------------------------------------------------------

export interface ExecutionEnvironmentRecord {
  readonly repoCommit: string;
  readonly nodeVersion: string;
  readonly typescriptToolchain: string;
  readonly evaluatorVersion: string;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly executionTimestamp: string;
  readonly boundGc1Digest: string;
  readonly boundProtocolDigest: string;
  readonly boundSampleDigest: string;
}

export function loadExecutionEnvironment(): ExecutionEnvironmentRecord {
  return readJson<ExecutionEnvironmentRecord>("execution-environment.json");
}

// ---------------------------------------------------------------------------
// Result artefacts (lazy-loaded; each is the literal script output)
// ---------------------------------------------------------------------------

export function loadRunA(): readonly unknown[] {
  return readJson<unknown[]>("run-a.json");
}
export function loadRunB(): readonly unknown[] {
  return readJson<unknown[]>("run-b.json");
}
export function loadFetchVerification(): readonly unknown[] {
  return readJson<unknown[]>("fetch-verification.json");
}
export function loadAbComparison(): readonly unknown[] {
  return readJson<unknown[]>("ab-comparison.json");
}
export function loadProofVerification(): readonly unknown[] {
  return readJson<unknown[]>("proof-verification.json");
}
export function loadFailureClassification(): readonly unknown[] {
  return readJson<unknown[]>("failure-classification.json");
}
export function loadAggregateStatistics(): Record<string, unknown> {
  return readJson<Record<string, unknown>>("aggregate-statistics.json");
}

// ---------------------------------------------------------------------------
// Aggregate result digest
// ---------------------------------------------------------------------------

export interface Phase2ResultBundle {
  readonly executionEnvironment: ExecutionEnvironmentRecord;
  readonly fetchVerification: readonly unknown[];
  readonly runA: readonly unknown[];
  readonly runB: readonly unknown[];
  readonly abComparison: readonly unknown[];
  readonly proofVerification: readonly unknown[];
  readonly failureClassification: readonly unknown[];
  readonly aggregateStatistics: Record<string, unknown>;
}

export function loadPhase2ResultBundle(): Phase2ResultBundle {
  return {
    executionEnvironment: loadExecutionEnvironment(),
    fetchVerification: loadFetchVerification(),
    runA: loadRunA(),
    runB: loadRunB(),
    abComparison: loadAbComparison(),
    proofVerification: loadProofVerification(),
    failureClassification: loadFailureClassification(),
    aggregateStatistics: loadAggregateStatistics(),
  };
}

/**
 * Deterministic digest over the entire Phase 2 result bundle. Two independent
 * runs of the analysis scripts against byte-identical inputs will reproduce
 * this digest exactly (canonicalStringify sorts all object keys).
 */
export function computePhase2ResultDigest(bundle: Phase2ResultBundle = loadPhase2ResultBundle()): string {
  return digestOf(bundle);
}

// ---------------------------------------------------------------------------
// Integrity verdict — checks the loaded bundle is bound to the three
// canonical identities and internally consistent (100 units represented,
// Run A/B same frame IDs, etc.)
// ---------------------------------------------------------------------------

export interface Phase2IntegrityVerdict {
  readonly verdict: "DRA_GEN_001_PHASE2_ARTEFACTS_BOUND" | "DRA_GEN_001_PHASE2_ARTEFACTS_UNBOUND";
  readonly checks: ReadonlyArray<{ readonly id: string; readonly passed: boolean; readonly detail?: string }>;
}

export function verifyPhase2ArtefactBinding(): Phase2IntegrityVerdict {
  const bundle = loadPhase2ResultBundle();
  const env = bundle.executionEnvironment;
  const runAFrameIds = new Set((bundle.runA as Array<{ frameId: string }>).map((r) => r.frameId));
  const runBFrameIds = new Set((bundle.runB as Array<{ frameId: string }>).map((r) => r.frameId));
  const checks = [
    { id: "ENV_BOUND_GC1_DIGEST_MATCHES_LIVE", passed: env.boundGc1Digest === GC1_AGGREGATE_DIGEST },
    { id: "ENV_BOUND_PROTOCOL_DIGEST_MATCHES_LIVE", passed: env.boundProtocolDigest === GEN001_PROTOCOL_AGGREGATE_DIGEST },
    { id: "ENV_BOUND_SAMPLE_DIGEST_MATCHES_LIVE", passed: env.boundSampleDigest === GEN001_SAMPLE_AGGREGATE_DIGEST },
    { id: "CANDIDATE_ID_IS_DRA_GC_1", passed: GC1_CANDIDATE_ID === "DRA-GC-1" },
    { id: "RUN_A_HAS_100_UNITS", passed: bundle.runA.length === 100, detail: `actual=${bundle.runA.length}` },
    { id: "RUN_B_HAS_100_UNITS", passed: bundle.runB.length === 100, detail: `actual=${bundle.runB.length}` },
    { id: "RUN_A_AND_RUN_B_SAME_FRAME_IDS", passed: runAFrameIds.size === 100 && [...runAFrameIds].every((id) => runBFrameIds.has(id)) },
    { id: "AB_COMPARISON_HAS_100_RECORDS", passed: bundle.abComparison.length === 100, detail: `actual=${bundle.abComparison.length}` },
    { id: "FAILURE_CLASSIFICATION_HAS_100_RECORDS", passed: bundle.failureClassification.length === 100, detail: `actual=${bundle.failureClassification.length}` },
  ];
  const allPassed = checks.every((c) => c.passed);
  return { verdict: allPassed ? "DRA_GEN_001_PHASE2_ARTEFACTS_BOUND" : "DRA_GEN_001_PHASE2_ARTEFACTS_UNBOUND", checks };
}
