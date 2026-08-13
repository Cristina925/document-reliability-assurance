/**
 * DRA-VAL-002 — Protocol Freeze Manifest
 *
 * Canonical, machine-verifiable identity record for the FROZEN DRA-VAL-002 protocol. DATA ONLY —
 * selects/acquires/evaluates nothing, and does not alter GC-1 or any evaluator behaviour. Mirrors
 * the `dra-gen-001-freeze-manifest.ts` pattern exactly.
 *
 * ADMINISTRATIVE RENUMBERING: this programme's working name was "DRA-VAL-001"; it was renumbered
 * to "DRA-VAL-002" solely to avoid colliding with the pre-existing, unrelated DRA-VAL-001A..F
 * Scientific Validation Charter programme. No methodological content changed.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { GC1_CANDIDATE_ID, GC1_AGGREGATE_DIGEST, canonicalizeForDigest } from "./dra-gc-1-freeze-manifest";
import { VAL002_CONSIDERED_CANDIDATE_URLS, VAL002_CONSIDERED_CANDIDATE_IDS } from "./dra-val-002-considered-registry";
import { RECOMMENDED_SAMPLE_SIZE, SOURCE_FAMILIES, ENDPOINTS, FAILURE_TAXONOMY } from "./dra-val-002-protocol";

// ---------------------------------------------------------------------------
// Frozen protocol identity
// ---------------------------------------------------------------------------

export const VAL002_PROTOCOL_ID = "DRA-VAL-002" as const;
export const VAL002_PROTOCOL_VERSION = "1.0.0" as const;
export const VAL002_FREEZE_TIMESTAMP = "2026-08-12T00:00:00.000Z" as const;

export const VAL002_BOUND_GC1_CANDIDATE_ID = GC1_CANDIDATE_ID;
export const VAL002_BOUND_GC1_DIGEST = GC1_AGGREGATE_DIGEST;

// ---------------------------------------------------------------------------
// Frozen protocol-defining files
// ---------------------------------------------------------------------------

export const FROZEN_PROTOCOL_FILES: readonly string[] = [
  "docs/dra/DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md",
  "lib/dra-reference/src/benchmark/analysis/dra-val-002-protocol.ts",
  "lib/dra-reference/src/benchmark/analysis/dra-val-002-considered-registry.ts",
  "lib/dra-reference/src/benchmark/analysis/__tests__/dra-val-002-freeze-integrity.test.ts",
] as const;

/** SHA-256 (raw bytes) of every file in FROZEN_PROTOCOL_FILES, captured at freeze time via sha256sum. */
export const FROZEN_PROTOCOL_FILE_DIGESTS: Readonly<Record<string, string>> = {
  "docs/dra/DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md":
    "0f863decbc13c01246a0bfef620431e3c11ca664f2212e3d011800a1d7762ac7",
  "lib/dra-reference/src/benchmark/analysis/dra-val-002-protocol.ts":
    "46e4146e388a1e2aae44a681497e24919cd0951f59cec3a6586b7eeb7b484003",
  "lib/dra-reference/src/benchmark/analysis/dra-val-002-considered-registry.ts":
    "b659e774a5f83035d153fa7a102aa044298c4abb24e1c4b47041b989dc02dc63",
  "lib/dra-reference/src/benchmark/analysis/__tests__/dra-val-002-freeze-integrity.test.ts":
    "e43ae44f33e0be82138ef3f480231307124232088d478c88cdb017da88f06e15",
};

// ---------------------------------------------------------------------------
// Considered-candidate registry binding
// ---------------------------------------------------------------------------

export const CONSIDERED_REGISTRY_URL_COUNT = VAL002_CONSIDERED_CANDIDATE_URLS.length;
export const CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT = VAL002_CONSIDERED_CANDIDATE_IDS.length;

export function computeConsideredRegistryDigest(): string {
  return createHash("sha256")
    .update(
      canonicalizeForDigest({
        urls: [...VAL002_CONSIDERED_CANDIDATE_URLS].sort(),
        candidateIds: [...VAL002_CONSIDERED_CANDIDATE_IDS].sort(),
      }),
    )
    .digest("hex");
}

export const CONSIDERED_REGISTRY_DIGEST = computeConsideredRegistryDigest();

// ---------------------------------------------------------------------------
// Preserved methodological parameters (restated as identity inputs)
// ---------------------------------------------------------------------------

export const FROZEN_SAMPLE_SIZE = RECOMMENDED_SAMPLE_SIZE;
export const FROZEN_SOURCE_FAMILY_IDS: readonly string[] = SOURCE_FAMILIES.map((f) => f.id);
export const FROZEN_SOURCE_FAMILY_ALLOCATION: Readonly<Record<string, number>> = Object.fromEntries(
  SOURCE_FAMILIES.map((f) => [f.id, f.targetAllocation]),
);
export const FROZEN_ENDPOINT_IDS: readonly string[] = ENDPOINTS.map((e) => e.id);
export const FROZEN_FAILURE_TAXONOMY_IDS: readonly string[] = FAILURE_TAXONOMY.map((f) => f.category);

// ---------------------------------------------------------------------------
// Canonical protocol manifest core and aggregate digest
// ---------------------------------------------------------------------------

export function buildProtocolManifestCore() {
  return {
    protocolId: VAL002_PROTOCOL_ID,
    protocolVersion: VAL002_PROTOCOL_VERSION,
    boundGc1CandidateId: VAL002_BOUND_GC1_CANDIDATE_ID,
    boundGc1Digest: VAL002_BOUND_GC1_DIGEST,
    frozenSampleSize: FROZEN_SAMPLE_SIZE,
    frozenSourceFamilyAllocation: FROZEN_SOURCE_FAMILY_ALLOCATION,
    frozenEndpointIds: FROZEN_ENDPOINT_IDS,
    frozenFailureTaxonomyIds: FROZEN_FAILURE_TAXONOMY_IDS,
    consideredRegistryDigest: CONSIDERED_REGISTRY_DIGEST,
    consideredRegistryUrlCount: CONSIDERED_REGISTRY_URL_COUNT,
    consideredRegistryCandidateIdCount: CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT,
    protocolFileDigests: FROZEN_PROTOCOL_FILE_DIGESTS,
  };
}

export function computeProtocolAggregateDigest(): string {
  return createHash("sha256").update(canonicalizeForDigest(buildProtocolManifestCore())).digest("hex");
}

export const VAL002_PROTOCOL_AGGREGATE_DIGEST = computeProtocolAggregateDigest();

// ---------------------------------------------------------------------------
// Live re-hash utility (used by the freeze-integrity test only)
// ---------------------------------------------------------------------------

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..");

export function computeLiveProtocolFileDigests(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const relativePath of FROZEN_PROTOCOL_FILES) {
    const bytes = readFileSync(join(REPO_ROOT, relativePath));
    result[relativePath] = createHash("sha256").update(bytes).digest("hex");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Freeze verdict
// ---------------------------------------------------------------------------

export type Val002ProtocolStatus = "FROZEN";
export const VAL002_PROTOCOL_STATUS: Val002ProtocolStatus = "FROZEN";
export const VAL002_PROTOCOL_FROZEN_VERDICT = "DRA_VAL_002_PROTOCOL_FROZEN" as const;

export const VAL002_FREEZE_RECEIPT_REFERENCE = "docs/dra/DRA-VAL-002-PROTOCOL-FREEZE-RECEIPT.md" as const;

/** No sample manifest is referenced here: this module concerns protocol freeze only, not sample lock. */
export const VAL002_SAMPLE_MANIFEST_REFERENCE_AT_FREEZE_TIME = null;
