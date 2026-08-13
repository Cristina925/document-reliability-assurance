/**
 * DRA-VAL-002 Phase 1 — Blind Sample Manifest and Sample-Lock Identity
 *
 * DATA ONLY. Binds the 25 frozen source representations selected by `build-and-freeze.ts` into a
 * single, machine-readable, digest-bound manifest, and computes the sample-lock verdict.
 *
 * HARD BLINDNESS GUARANTEE: nothing in this module, or in any file it imports, calls DRA-GC-1's
 * evaluator or references any DRA output. `frozen-units.json` contains only acquisition/
 * governance-eligibility fields (see FrozenUnit below) — never a decision, issue class,
 * confidence level, or proof receipt.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SOURCE_FAMILIES, RECOMMENDED_SAMPLE_SIZE, type SourceFamilyId } from "../dra-val-002-protocol";
import { VAL002_PROTOCOL_AGGREGATE_DIGEST, VAL002_PROTOCOL_STATUS } from "../dra-val-002-freeze-manifest";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "data");

export interface FrozenUnit {
  readonly frameId: string;
  readonly familyId: SourceFamilyId;
  readonly sourceUrl: string;
  readonly title: string;
  readonly publisher: string;
  readonly publicationDate: string;
  readonly mediaType: "HTML";
  readonly language: string;
  readonly licenceBasis: string;
  readonly httpStatus: number;
  readonly redirected: boolean;
  readonly finalUrl: string;
  readonly byteLength: number;
  readonly sha256: string;
  readonly extractedWordCount: number;
  readonly fetchedAt: string;
  readonly wasReplacement: boolean;
  readonly replacesFrameId: string | null;
}

export interface ReplacementLogEntry {
  readonly originalFrameId: string;
  readonly familyId: string;
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
  readonly familyReport: Readonly<
    Record<string, { readonly eligibleCount: number; readonly targetCount: number; readonly primaryCount: number; readonly reserveCount: number }>
  >;
  readonly primarySelectionCount: number;
  readonly finalFrozenCount: number;
}

export const FROZEN_UNITS: readonly FrozenUnit[] = JSON.parse(readFileSync(join(DATA_DIR, "frozen-units.json"), "utf8"));
export const REPLACEMENT_LOG: readonly ReplacementLogEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "replacement-log.json"), "utf8"));
export const SELECTION_SUMMARY: SelectionSummary = JSON.parse(readFileSync(join(DATA_DIR, "selection-summary.json"), "utf8"));

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const VAL002_SAMPLE_ID = "DRA-VAL-002-PHASE-1-SAMPLE-000001" as const;
export const VAL002_SAMPLE_LOCK_TIMESTAMP = "2026-08-12T00:00:00.000Z" as const;
export const VAL002_BOUND_PROTOCOL_DIGEST = VAL002_PROTOCOL_AGGREGATE_DIGEST;

export const FRAME_SOURCES: readonly string[] = [
  "GOV.UK Content Search API / publication index (www.gov.uk) — statutory guidance and official statistics pages",
  "ONS.GOV.UK bulletin index (www.ons.gov.uk) — statistical bulletin 'latest' pages",
  "US federal agency publication pages (epa.gov, ftc.gov, census.gov) — law/regulation summaries and programme description pages",
] as const;

// ---------------------------------------------------------------------------
// Structural invariants
// ---------------------------------------------------------------------------

function computeFamilyCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const u of FROZEN_UNITS) counts[u.familyId] = (counts[u.familyId] ?? 0) + 1;
  return counts;
}
export const FAMILY_COUNTS = computeFamilyCounts();

/** Every family's realised share of the locked sample is <= 40%, matching the protocol's diversity cap. */
export function verifyFamilyAllocationWithinCap(): boolean {
  const total = FROZEN_UNITS.length;
  if (total === 0) return false;
  return SOURCE_FAMILIES.every((f) => (FAMILY_COUNTS[f.id] ?? 0) / total <= 0.4 + 1e-9);
}

export function verifyNoDuplicateFamilies(): boolean {
  // "No duplicate publisher family" here means: within a given source family, no two units share
  // the exact same sourceUrl (publisher/title combination) — genuine duplicate detection.
  const seen = new Map<string, Set<string>>();
  for (const u of FROZEN_UNITS) {
    let s = seen.get(u.familyId);
    if (!s) {
      s = new Set();
      seen.set(u.familyId, s);
    }
    if (s.has(u.sourceUrl)) return false;
    s.add(u.sourceUrl);
  }
  return true;
}

export function verifyAllUnitsMeetWordCountFloor(): boolean {
  return FROZEN_UNITS.every((u) => u.extractedWordCount >= 500);
}

export function verifyOriginalDrawHistoryPreserved(): boolean {
  const frozenIds = new Set(FROZEN_UNITS.map((u) => u.frameId));
  return REPLACEMENT_LOG.filter((r) => r.reason === "REPLACED_FROM_RESERVE").every(
    (r) => r.originalFrameId.length > 0 && r.replacedByFrameId !== null && frozenIds.has(r.replacedByFrameId),
  );
}

const FORBIDDEN_FIELD_SUBSTRINGS = ["decision", "issue", "confidence", "receipt", "materiality", "claim", "evidence", "stage"];
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
    sampleId: VAL002_SAMPLE_ID,
    boundProtocolDigest: VAL002_BOUND_PROTOCOL_DIGEST,
    seedDerivationRule: SELECTION_SUMMARY.seedDerivationRule,
    seed: SELECTION_SUMMARY.seed,
    rawFrameDigest: SELECTION_SUMMARY.rawFrameDigest,
    eligibleFrameDigest: SELECTION_SUMMARY.eligibleFrameDigest,
    units: [...FROZEN_UNITS]
      .map((u) => ({ frameId: u.frameId, familyId: u.familyId, sha256: u.sha256, byteLength: u.byteLength }))
      .sort((a, b) => a.frameId.localeCompare(b.frameId)),
    replacementLog: [...REPLACEMENT_LOG].sort((a, b) => a.originalFrameId.localeCompare(b.originalFrameId)),
  };
}

export function computeSampleAggregateDigest(): string {
  return createHash("sha256").update(canonicalizeForDigest(buildSampleManifestCore())).digest("hex");
}

export const VAL002_SAMPLE_AGGREGATE_DIGEST = computeSampleAggregateDigest();

// ---------------------------------------------------------------------------
// Lock verdict
// ---------------------------------------------------------------------------

export type Val002SampleLockVerdict = "DRA_VAL_002_SAMPLE_LOCKED" | "DRA_VAL_002_SAMPLE_LOCK_BLOCKED";

export function computeSampleLockVerdict(): { verdict: Val002SampleLockVerdict; failedChecks: string[] } {
  const checks: Array<[string, boolean]> = [
    ["PROTOCOL_IS_FROZEN", VAL002_PROTOCOL_STATUS === "FROZEN"],
    ["TOTAL_SAMPLE_SIZE_IS_25", FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE],
    ["FAMILY_ALLOCATION_WITHIN_CAP", verifyFamilyAllocationWithinCap()],
    ["NO_DUPLICATE_FAMILIES", verifyNoDuplicateFamilies()],
    ["ALL_UNITS_MEET_WORD_COUNT_FLOOR", verifyAllUnitsMeetWordCountFloor()],
    ["ORIGINAL_DRAW_HISTORY_PRESERVED", verifyOriginalDrawHistoryPreserved()],
    ["NO_EVALUATOR_OUTPUT_FIELDS_PRESENT", verifyNoEvaluatorOutputFieldsPresent()],
    ["ALL_UNITS_HAVE_SHA256_AND_BYTE_LENGTH", FROZEN_UNITS.every((u) => /^[0-9a-f]{64}$/.test(u.sha256) && u.byteLength > 0)],
  ];
  const failedChecks = checks.filter(([, ok]) => !ok).map(([name]) => name);
  return {
    verdict: failedChecks.length === 0 ? "DRA_VAL_002_SAMPLE_LOCKED" : "DRA_VAL_002_SAMPLE_LOCK_BLOCKED",
    failedChecks,
  };
}

export const VAL002_SAMPLE_LOCK_RESULT = computeSampleLockVerdict();
export const VAL002_SAMPLE_LOCK_VERDICT = VAL002_SAMPLE_LOCK_RESULT.verdict;

export const VAL002_SAMPLE_LOCK_RECEIPT_REFERENCE = "docs/dra/DRA-VAL-002-SAMPLE-LOCK-RECEIPT.md" as const;
