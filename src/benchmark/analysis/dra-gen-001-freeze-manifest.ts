/**
 * DRA-GEN-001 Phase 0 — Protocol Freeze Manifest
 *
 * This module is the canonical, machine-verifiable identity record for the
 * FROZEN DRA-GEN-001 blind generalisation protocol. It is DATA ONLY: it
 * does not select, inspect, acquire, or evaluate any document, and it does
 * not alter GC-1 or any evaluator behaviour. Its sole purpose is to let a
 * later reader or automated check answer:
 *
 *     "Does the current DRA-GEN-001 protocol definition still exactly match
 *      the methodology that was frozen for Phase 1 blind sampling?"
 *
 * ---------------------------------------------------------------------------
 * What is frozen, and why
 * ---------------------------------------------------------------------------
 *
 * `FROZEN_PROTOCOL_FILES` — every file whose bytes define a load-bearing
 * methodological commitment: the narrative protocol document, the
 * machine-readable protocol core (population, unit of analysis,
 * eligibility, strata, sample size, endpoints, failure taxonomy,
 * replacement/blindness/oracle/stopping rules), the computed
 * considered-candidate exclusion registry, and the Phase 0 integrity test
 * suite that exercises all of the above. A byte change to any of these
 * after freeze is a substantive protocol change and must be detected, not
 * silently tolerated.
 *
 * This module deliberately reuses the canonicalisation/aggregate-digest
 * pattern established by `dra-gc-1-freeze-manifest.ts` so both frozen
 * artefacts (the candidate and its blind-test protocol) are verified the
 * same way.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
  canonicalizeForDigest,
} from "./dra-gc-1-freeze-manifest";
import {
  CONSIDERED_CANDIDATE_URLS,
  CONSIDERED_CANDIDATE_IDS,
} from "./dra-gen-001-considered-candidate-registry";
import {
  RECOMMENDED_SAMPLE_SIZE,
  HARD_STRATA,
  ENDPOINTS,
  FAILURE_TAXONOMY,
} from "./dra-gen-001-protocol";

// ---------------------------------------------------------------------------
// Frozen protocol identity
// ---------------------------------------------------------------------------

export const GEN001_PROTOCOL_ID = "DRA-GEN-001" as const;

/** Version bumped from the "0.1.0-draft" working version at the moment of freeze. */
export const GEN001_PROTOCOL_VERSION = "1.0.0" as const;

/** Captured exactly as `git rev-parse HEAD` returned at freeze time; not fabricated. */
export const GEN001_REPOSITORY_COMMIT =
  "4310a53d4fbae151f75241ffcfef4e43873dcc9f" as const;

export const GEN001_FREEZE_TIMESTAMP = "2026-08-12T00:00:00.000Z" as const;

/** The GC-1 candidate this protocol is bound to; must equal the live GC-1 identity at every use. */
export const GEN001_BOUND_GC1_CANDIDATE_ID = GC1_CANDIDATE_ID;
export const GEN001_BOUND_GC1_DIGEST = GC1_AGGREGATE_DIGEST;

// ---------------------------------------------------------------------------
// Frozen protocol-defining files (paths relative to the repository root)
// ---------------------------------------------------------------------------

export const FROZEN_PROTOCOL_FILES: readonly string[] = [
  "docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md",
  "lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts",
  "lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts",
  "lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts",
] as const;

/**
 * SHA-256 (raw bytes) of every file in `FROZEN_PROTOCOL_FILES`, captured at
 * freeze time via `sha256sum`. The freeze-integrity test recomputes these
 * live and asserts equality — any post-freeze edit to a protocol-defining
 * file changes this and fails that test.
 */
export const FROZEN_PROTOCOL_FILE_DIGESTS: Readonly<Record<string, string>> = {
  "docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md":
    "5714403755d5e0896ce9a963e911fce74bf39cfe70e4d0c96d50d31d7e774b35",
  "lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts":
    "10d769ee5820663edd4636a3a9be13a7574b7efc583bd67b6a8f49e6bb407dfe",
  "lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts":
    "0c1ea9c6df1f04dd996b5a2a6649b675f72aaf459b27299f30316430bc8f55c0",
  "lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts":
    "b85ce8df305dae2a7c824695e2bb2cba9b25939780c129138b2fc31bf88452c7",
};

// ---------------------------------------------------------------------------
// Considered-candidate registry binding (must be counted, not just referenced)
// ---------------------------------------------------------------------------

export const CONSIDERED_REGISTRY_URL_COUNT = CONSIDERED_CANDIDATE_URLS.length;
export const CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT = CONSIDERED_CANDIDATE_IDS.length;

/** Deterministic digest of the registry's actual content, so the frozen protocol identity binds to the exact exclusion list, not just its count. */
export function computeConsideredRegistryDigest(): string {
  return createHash("sha256")
    .update(
      canonicalizeForDigest({
        urls: [...CONSIDERED_CANDIDATE_URLS].sort(),
        candidateIds: [...CONSIDERED_CANDIDATE_IDS].sort(),
      }),
    )
    .digest("hex");
}

export const CONSIDERED_REGISTRY_DIGEST = computeConsideredRegistryDigest();

// ---------------------------------------------------------------------------
// Preserved methodological parameters (restated as identity inputs so a
// silent change to any of them is detectable via the aggregate digest,
// without duplicating the full rule text — see dra-gen-001-protocol.ts for
// the authoritative rule definitions this manifest binds to)
// ---------------------------------------------------------------------------

export const FROZEN_SAMPLE_SIZE = RECOMMENDED_SAMPLE_SIZE;
export const FROZEN_STRATUM_IDS: readonly string[] = HARD_STRATA.map((s) => s.id);
export const FROZEN_STRATUM_ALLOCATION: Readonly<Record<string, number>> = Object.fromEntries(
  HARD_STRATA.map((s) => [s.id, s.allocationFraction]),
);
export const FROZEN_ENDPOINT_IDS: readonly string[] = ENDPOINTS.map((e) => e.id);
export const FROZEN_FAILURE_TAXONOMY_IDS: readonly string[] = FAILURE_TAXONOMY.map(
  (f) => f.category,
);

// ---------------------------------------------------------------------------
// Explicit scope-interpretation statement (Programme Section A2)
// ---------------------------------------------------------------------------

/**
 * The English/non-English hard stratification (Section 7 of the protocol)
 * is a SAMPLING convenience for maximising statistical power on GC-1's
 * known D3 materiality limitation. It is NOT a claim that the non-English
 * stratum's validated languages (Spanish, French, Japanese, Bulgarian)
 * exhaust GC-1's language/script coverage, and it does NOT extend
 * generalisation claims to any script family GC-1 has never been validated
 * against. Successful observations within the non-English stratum bind
 * only to the five validated languages already carried forward from GC-1
 * (see `CARRIED_FORWARD_LIMITATIONS` in `dra-gen-001-protocol.ts`) and say
 * nothing about:
 *
 *   - RTL/bidirectional scripts;
 *   - Devanagari-type complex/conjunct scripts;
 *   - Thai-style scriptio-continua scripts;
 *   - any other script family with no prior DRA segmentation validation.
 *
 * The frozen GC-1 limitation ledger (DRA-ROB-002 `KNOWN_DEFECT_LEDGER`)
 * continues to govern the outer bound of any claim GEN-001 can support,
 * regardless of how well the non-English stratum performs.
 */
export const SCOPE_INTERPRETATION_STATEMENT =
  "The GEN-001 English/non-English hard stratum is a sampling-power choice bound to GC-1's five " +
  "already-validated languages; it does not broaden GC-1's declared script/language boundary, " +
  "and non-English stratum results carry no inference to RTL, Devanagari-type, scriptio-continua, " +
  "or any other unvalidated script family.";

// ---------------------------------------------------------------------------
// Canonical protocol manifest core and aggregate digest
// ---------------------------------------------------------------------------

/** Builds the canonical manifest-core object whose digest is `GEN001_PROTOCOL_AGGREGATE_DIGEST`. */
export function buildProtocolManifestCore(): {
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly boundGc1CandidateId: string;
  readonly boundGc1Digest: string;
  readonly frozenSampleSize: number;
  readonly frozenStratumAllocation: Readonly<Record<string, number>>;
  readonly frozenEndpointIds: readonly string[];
  readonly frozenFailureTaxonomyIds: readonly string[];
  readonly consideredRegistryDigest: string;
  readonly consideredRegistryUrlCount: number;
  readonly consideredRegistryCandidateIdCount: number;
  readonly protocolFileDigests: Readonly<Record<string, string>>;
} {
  return {
    protocolId: GEN001_PROTOCOL_ID,
    protocolVersion: GEN001_PROTOCOL_VERSION,
    boundGc1CandidateId: GEN001_BOUND_GC1_CANDIDATE_ID,
    boundGc1Digest: GEN001_BOUND_GC1_DIGEST,
    frozenSampleSize: FROZEN_SAMPLE_SIZE,
    frozenStratumAllocation: FROZEN_STRATUM_ALLOCATION,
    frozenEndpointIds: FROZEN_ENDPOINT_IDS,
    frozenFailureTaxonomyIds: FROZEN_FAILURE_TAXONOMY_IDS,
    consideredRegistryDigest: CONSIDERED_REGISTRY_DIGEST,
    consideredRegistryUrlCount: CONSIDERED_REGISTRY_URL_COUNT,
    consideredRegistryCandidateIdCount: CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT,
    protocolFileDigests: FROZEN_PROTOCOL_FILE_DIGESTS,
  };
}

/** Computes SHA-256(canonicalizeForDigest(buildProtocolManifestCore())), hex-encoded. */
export function computeProtocolAggregateDigest(): string {
  return createHash("sha256")
    .update(canonicalizeForDigest(buildProtocolManifestCore()))
    .digest("hex");
}

/**
 * The aggregate protocol digest recorded at freeze time. Any change to a
 * frozen protocol file's bytes, the GC-1 binding, the sample size, strata,
 * endpoints, failure taxonomy, or the considered-candidate registry's
 * content changes this value when recomputed by
 * `computeProtocolAggregateDigest()`.
 */
export const GEN001_PROTOCOL_AGGREGATE_DIGEST = computeProtocolAggregateDigest();

// ---------------------------------------------------------------------------
// Live re-hash utility (used by the freeze-integrity test; not used by any
// production/sampling code path)
// ---------------------------------------------------------------------------

const REPO_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "..",
);

/** Reads and re-hashes every frozen protocol file from the live repository (SHA-256 of raw bytes). */
export function computeLiveProtocolFileDigests(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const relativePath of FROZEN_PROTOCOL_FILES) {
    const bytes = readFileSync(join(REPO_ROOT, relativePath));
    result[relativePath] = createHash("sha256").update(bytes).digest("hex");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Freeze verdict and receipt reference
// ---------------------------------------------------------------------------

export type Gen001ProtocolStatus = "FROZEN";
export const GEN001_PROTOCOL_STATUS: Gen001ProtocolStatus = "FROZEN";

export const GEN001_FREEZE_RECEIPT_REFERENCE =
  "docs/dra/DRA-GEN-001-PROTOCOL-FREEZE-RECEIPT.md" as const;

/** No blind sample manifest is referenced here: none exists at protocol-freeze time (Phase 1 has not started). */
export const GEN001_BLIND_SAMPLE_MANIFEST_REFERENCE_AT_FREEZE_TIME = null;
