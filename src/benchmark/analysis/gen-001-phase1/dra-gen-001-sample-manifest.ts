/**
 * DRA-GEN-001 Phase 1 — Blind Sample Manifest and Sample-Lock Identity
 *
 * This module is DATA ONLY. It binds the 100 frozen source representations selected by
 * `build-sample.ts` / `freeze-selection.ts` into a single, machine-readable, digest-bound
 * manifest, and computes the sample-lock verdict.
 *
 * HARD BLINDNESS GUARANTEE: nothing in this module, or in any file it imports, calls DRA-GC-1's
 * evaluator or references any DRA output (decision, issue class, proof receipt, confidence
 * level). `frozen-units.json` contains ONLY: source URL, title, publisher, publication date,
 * media type, language, licence basis, byte length, SHA-256 of the raw fetched bytes, extracted
 * word count (a governance eligibility measurement, not a DRA measurement), fetch timestamp, and
 * replacement provenance. The `assertNoEvaluatorOutputExists` test in the companion integrity
 * test file mechanically re-checks this claim against the live object shape.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { HARD_STRATA, RECOMMENDED_SAMPLE_SIZE } from "../dra-gen-001-protocol";
import { GEN001_PROTOCOL_AGGREGATE_DIGEST, GEN001_PROTOCOL_STATUS } from "../dra-gen-001-freeze-manifest";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "data");

export interface FrozenUnit {
  readonly frameId: string;
  readonly stratumId: "PDF_ENGLISH" | "PDF_NON_ENGLISH" | "HTML_ENGLISH" | "HTML_NON_ENGLISH";
  readonly sourceUrl: string;
  readonly title: string;
  readonly publisher: string;
  readonly publicationDate: string;
  readonly mediaType: "PDF" | "HTML";
  readonly language: string;
  readonly familyId: string;
  readonly licenceBasis: string;
  readonly byteLength: number;
  readonly sha256: string;
  readonly extractedWordCount: number;
  readonly fetchedAt: string;
  readonly wasReplacement: boolean;
  readonly replacesFrameId: string | null;
}

export interface ReplacementLogEntry {
  readonly originalFrameId: string;
  readonly stratumId: string;
  readonly reason: string;
  readonly replacedByFrameId: string | null;
}

export interface SelectionSummary {
  readonly seedDerivationRule: string;
  readonly seed: number;
  readonly frameConstructionDate: string;
  readonly rawFrameSize: number;
  readonly rawFrameDigest: string;
  readonly excludedCount: number;
  readonly ineligibleCount: number;
  readonly eligibleFrameSize: number;
  readonly eligibleFrameDigest: string;
  readonly stratumReport: Readonly<
    Record<string, { readonly eligibleCount: number; readonly primaryCount: number; readonly reserveCount: number }>
  >;
  readonly primarySelectionCount: number;
}

export const FROZEN_UNITS: readonly FrozenUnit[] = JSON.parse(
  readFileSync(join(DATA_DIR, "frozen-units.json"), "utf8"),
);
export const REPLACEMENT_LOG: readonly ReplacementLogEntry[] = JSON.parse(
  readFileSync(join(DATA_DIR, "replacement-log.json"), "utf8"),
);
export const SELECTION_SUMMARY: SelectionSummary = JSON.parse(
  readFileSync(join(DATA_DIR, "selection-summary.json"), "utf8"),
);

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const GEN001_SAMPLE_ID = "DRA-GEN-001-PHASE-1-SAMPLE-000001" as const;
export const GEN001_SAMPLE_LOCK_TIMESTAMP = "2026-08-12T00:00:00.000Z" as const;
export const GEN001_BOUND_PROTOCOL_DIGEST = GEN001_PROTOCOL_AGGREGATE_DIGEST;

/** Sources actually queried to construct the raw frame, recorded for auditability/reproduction. */
export const FRAME_SOURCES: readonly string[] = [
  "US Federal Register API (federalregister.gov/api/v1) — conditions[type][]=RULE, order=newest, 2 pages of 100",
  "GOV.UK Content Search API (www.gov.uk/api/search.json) — filter_format=guidance, order=-public_timestamp, 200 results",
  "Spanish BOE Open Data API (boe.es/datosabiertos/api/boe/sumario) — 8 most recent business days before frame-construction date, deterministic even/odd parity split into PDF vs HTML sub-strata",
] as const;

// ---------------------------------------------------------------------------
// Structural invariants (verified again, at manifest-build time, independent of the freeze script)
// ---------------------------------------------------------------------------

function computeStratumCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const u of FROZEN_UNITS) counts[u.stratumId] = (counts[u.stratumId] ?? 0) + 1;
  return counts;
}
export const STRATUM_COUNTS = computeStratumCounts();

export function verifyStratumAllocation(): boolean {
  return HARD_STRATA.every((s) => STRATUM_COUNTS[s.id] === RECOMMENDED_SAMPLE_SIZE / HARD_STRATA.length);
}

export function verifyNoDuplicateFamilies(): boolean {
  const seen = new Map<string, Set<string>>();
  for (const u of FROZEN_UNITS) {
    let s = seen.get(u.stratumId);
    if (!s) {
      s = new Set();
      seen.set(u.stratumId, s);
    }
    if (s.has(u.familyId)) return false;
    s.add(u.familyId);
  }
  return true;
}

export function verifyAllUnitsMeetWordCountFloor(): boolean {
  return FROZEN_UNITS.every((u) => u.extractedWordCount >= 500);
}

export function verifyOriginalDrawHistoryPreserved(): boolean {
  // Every replacement entry with reason REPLACED_FROM_RESERVE must still reference its original
  // frameId (not deleted), and the replacement unit must be present in FROZEN_UNITS.
  const frozenIds = new Set(FROZEN_UNITS.map((u) => u.frameId));
  return REPLACEMENT_LOG.filter((r) => r.reason === "REPLACED_FROM_RESERVE").every(
    (r) => r.originalFrameId.length > 0 && r.replacedByFrameId !== null && frozenIds.has(r.replacedByFrameId),
  );
}

/**
 * Guards the blindness boundary at the type/field level: no FrozenUnit field name resembles a
 * DRA evaluator output. This is a structural, not semantic, check — it complements the manual
 * design guarantee described in this file's header comment.
 */
const FORBIDDEN_FIELD_SUBSTRINGS = [
  "decision",
  "issue",
  "confidence",
  "receipt",
  "materiality",
  "claim",
  "evidence",
  "stage",
];
export function verifyNoEvaluatorOutputFieldsPresent(): boolean {
  const sampleUnit = FROZEN_UNITS[0];
  if (!sampleUnit) return false;
  const keys = Object.keys(sampleUnit).map((k) => k.toLowerCase());
  return keys.every((k) => FORBIDDEN_FIELD_SUBSTRINGS.every((f) => !k.includes(f)));
}

// ---------------------------------------------------------------------------
// Canonicalisation and aggregate sample digest
// ---------------------------------------------------------------------------

function canonicalizeForDigest(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeForDigest).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeForDigest(obj[k])}`).join(",")}}`;
}

export function buildSampleManifestCore() {
  return {
    sampleId: GEN001_SAMPLE_ID,
    boundProtocolDigest: GEN001_BOUND_PROTOCOL_DIGEST,
    seedDerivationRule: SELECTION_SUMMARY.seedDerivationRule,
    seed: SELECTION_SUMMARY.seed,
    rawFrameDigest: SELECTION_SUMMARY.rawFrameDigest,
    eligibleFrameDigest: SELECTION_SUMMARY.eligibleFrameDigest,
    units: [...FROZEN_UNITS]
      .map((u) => ({ frameId: u.frameId, stratumId: u.stratumId, sha256: u.sha256, byteLength: u.byteLength }))
      .sort((a, b) => a.frameId.localeCompare(b.frameId)),
    replacementLog: [...REPLACEMENT_LOG].sort((a, b) => a.originalFrameId.localeCompare(b.originalFrameId)),
  };
}

export function computeSampleAggregateDigest(): string {
  return createHash("sha256").update(canonicalizeForDigest(buildSampleManifestCore())).digest("hex");
}

export const GEN001_SAMPLE_AGGREGATE_DIGEST = computeSampleAggregateDigest();

// ---------------------------------------------------------------------------
// Lock verdict
// ---------------------------------------------------------------------------

export type Gen001SampleLockVerdict = "DRA_GEN_001_BLIND_SAMPLE_LOCKED" | "DRA_GEN_001_SAMPLE_LOCK_BLOCKED";

export function computeSampleLockVerdict(): {
  verdict: Gen001SampleLockVerdict;
  failedChecks: string[];
} {
  const checks: Array<[string, boolean]> = [
    ["PROTOCOL_IS_FROZEN", GEN001_PROTOCOL_STATUS === "FROZEN"],
    ["TOTAL_SAMPLE_SIZE_IS_100", FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE],
    ["STRATUM_ALLOCATION_25_EACH", verifyStratumAllocation()],
    ["NO_DUPLICATE_FAMILIES", verifyNoDuplicateFamilies()],
    ["ALL_UNITS_MEET_WORD_COUNT_FLOOR", verifyAllUnitsMeetWordCountFloor()],
    ["ORIGINAL_DRAW_HISTORY_PRESERVED", verifyOriginalDrawHistoryPreserved()],
    ["NO_EVALUATOR_OUTPUT_FIELDS_PRESENT", verifyNoEvaluatorOutputFieldsPresent()],
    ["ALL_UNITS_HAVE_SHA256_AND_BYTE_LENGTH", FROZEN_UNITS.every((u) => /^[0-9a-f]{64}$/.test(u.sha256) && u.byteLength > 0)],
  ];
  const failedChecks = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    verdict: failedChecks.length === 0 ? "DRA_GEN_001_BLIND_SAMPLE_LOCKED" : "DRA_GEN_001_SAMPLE_LOCK_BLOCKED",
    failedChecks,
  };
}

export const GEN001_SAMPLE_LOCK_RESULT = computeSampleLockVerdict();
export const GEN001_SAMPLE_LOCK_VERDICT = GEN001_SAMPLE_LOCK_RESULT.verdict;

export const GEN001_SAMPLE_LOCK_RECEIPT_REFERENCE = "docs/dra/DRA-GEN-001-PHASE-1-SAMPLE-LOCK-RECEIPT.md" as const;
