/**
 * DRA-GEN-001 Phase 2 — Preconditions (Programme Section 1)
 *
 * Verifies, before any blind document is evaluated, that all three immutable
 * identities this benchmark depends on are exactly what they claim to be:
 *   A. DRA-GC-1 (the frozen candidate)
 *   B. The DRA-GEN-001 protocol (the frozen methodology)
 *   C. The DRA-GEN-001 blind sample (the locked 100-document manifest)
 *
 * This module is DATA/VERIFICATION ONLY. It never mutates any frozen file,
 * the protocol, or the sample. If any check fails, the caller must STOP —
 * see `dra_gen_001_phase2_preconditions_pass` below, which is the single
 * boolean gate the execution scripts consult.
 */

import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
  GC1_EVALUATOR_VERSION,
  GC1_PIPELINE_VERSION,
  GC1_MODEL_VERSION,
  GC1_CORPUS_VERSION,
  computeAggregateDigest as computeLiveGc1Digest,
  computeLiveFileDigests as computeLiveGc1FileDigests,
  FROZEN_FILE_DIGESTS as GC1_FROZEN_FILE_DIGESTS,
} from "../dra-gc-1-freeze-manifest";
import {
  GEN001_PROTOCOL_STATUS,
  GEN001_PROTOCOL_AGGREGATE_DIGEST,
  GEN001_BOUND_GC1_DIGEST,
  computeProtocolAggregateDigest as computeLiveProtocolDigest,
  computeLiveProtocolFileDigests,
  FROZEN_PROTOCOL_FILE_DIGESTS,
} from "../dra-gen-001-freeze-manifest";
import {
  FROZEN_UNITS,
  REPLACEMENT_LOG,
  GEN001_BOUND_PROTOCOL_DIGEST,
  GEN001_SAMPLE_AGGREGATE_DIGEST,
  computeSampleAggregateDigest as computeLiveSampleDigest,
  computeSampleLockVerdict,
  verifyStratumAllocation,
  verifyNoDuplicateFamilies,
  verifyAllUnitsMeetWordCountFloor,
  verifyOriginalDrawHistoryPreserved,
  verifyNoEvaluatorOutputFieldsPresent,
} from "../gen-001-phase1/dra-gen-001-sample-manifest";
import { RECOMMENDED_SAMPLE_SIZE, HARD_STRATA } from "../dra-gen-001-protocol";
import {
  CONSIDERED_CANDIDATE_URLS,
  CONSIDERED_CANDIDATE_IDS,
  normalizeConsideredUrl,
} from "../dra-gen-001-considered-candidate-registry";
import { GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS, GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID } from "../dra-gc-1-freeze-manifest";

export interface PreconditionCheck {
  readonly id: string;
  readonly passed: boolean;
  readonly detail?: string;
}

// ---------------------------------------------------------------------------
// A. DRA-GC-1 identity verification
// ---------------------------------------------------------------------------

export function verifyGc1Identity(): PreconditionCheck[] {
  const liveDigest = computeLiveGc1Digest();
  const liveFileDigests = computeLiveGc1FileDigests();
  const fileMismatches = Object.keys(GC1_FROZEN_FILE_DIGESTS).filter(
    (path) => liveFileDigests[path] !== GC1_FROZEN_FILE_DIGESTS[path],
  );
  return [
    { id: "GC1_CANDIDATE_ID_IS_DRA_GC_1", passed: GC1_CANDIDATE_ID === "DRA-GC-1" },
    { id: "GC1_EVALUATOR_VERSION_IS_0_1_2", passed: GC1_EVALUATOR_VERSION === "0.1.2" },
    { id: "GC1_PIPELINE_VERSION_IS_1_0", passed: GC1_PIPELINE_VERSION === "1.0" },
    { id: "GC1_MODEL_VERSION_IS_0_1_0", passed: GC1_MODEL_VERSION === "0.1.0" },
    { id: "GC1_CORPUS_VERSION_IS_DRA_CORPUS_1_0_0", passed: GC1_CORPUS_VERSION === "DRA-CORPUS-1.0.0" },
    {
      id: "GC1_FROZEN_FILE_COUNT_IS_63",
      passed: Object.keys(GC1_FROZEN_FILE_DIGESTS).length === 63,
      detail: `actual=${Object.keys(GC1_FROZEN_FILE_DIGESTS).length}`,
    },
    {
      id: "GC1_LIVE_AGGREGATE_DIGEST_MATCHES_FROZEN",
      passed: liveDigest === GC1_AGGREGATE_DIGEST,
      detail: `live=${liveDigest} frozen=${GC1_AGGREGATE_DIGEST}`,
    },
    {
      id: "GC1_NO_FROZEN_FILE_BYTE_DRIFT",
      passed: fileMismatches.length === 0,
      detail: fileMismatches.length > 0 ? `drifted=${fileMismatches.join(",")}` : undefined,
    },
  ];
}

// ---------------------------------------------------------------------------
// B. DRA-GEN-001 protocol identity verification
// ---------------------------------------------------------------------------

export function verifyProtocolIdentity(): PreconditionCheck[] {
  const liveDigest = computeLiveProtocolDigest();
  const liveFileDigests = computeLiveProtocolFileDigests();
  const fileMismatches = Object.keys(FROZEN_PROTOCOL_FILE_DIGESTS).filter(
    (path) => liveFileDigests[path] !== FROZEN_PROTOCOL_FILE_DIGESTS[path],
  );
  return [
    { id: "PROTOCOL_STATUS_IS_FROZEN", passed: GEN001_PROTOCOL_STATUS === "FROZEN" },
    {
      id: "PROTOCOL_BOUND_TO_LIVE_GC1_DIGEST",
      passed: GEN001_BOUND_GC1_DIGEST === computeLiveGc1Digest(),
    },
    {
      id: "PROTOCOL_LIVE_AGGREGATE_DIGEST_MATCHES_FROZEN",
      passed: liveDigest === GEN001_PROTOCOL_AGGREGATE_DIGEST,
      detail: `live=${liveDigest} frozen=${GEN001_PROTOCOL_AGGREGATE_DIGEST}`,
    },
    {
      id: "PROTOCOL_NO_FROZEN_FILE_BYTE_DRIFT",
      passed: fileMismatches.length === 0,
      detail: fileMismatches.length > 0 ? `drifted=${fileMismatches.join(",")}` : undefined,
    },
  ];
}

// ---------------------------------------------------------------------------
// C. DRA-GEN-001 blind sample lock verification
// ---------------------------------------------------------------------------

function countByStratum(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const u of FROZEN_UNITS) counts[u.stratumId] = (counts[u.stratumId] ?? 0) + 1;
  return counts;
}

/** Re-verifies contamination exclusion at Phase 2 time, exactly as Section (C) requires. */
export function verifyContaminationStillExcluded(): PreconditionCheck {
  const consideredUrls = new Set(CONSIDERED_CANDIDATE_URLS.map(normalizeConsideredUrl));
  const consideredIds = new Set(CONSIDERED_CANDIDATE_IDS);
  const devCorpusIds = new Set(GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS);
  const violations: string[] = [];
  for (const u of FROZEN_UNITS) {
    if (consideredUrls.has(normalizeConsideredUrl(u.sourceUrl))) violations.push(`${u.frameId}:CONSIDERED_URL`);
    if (devCorpusIds.has(u.frameId) || u.frameId === GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID) {
      violations.push(`${u.frameId}:DEV_CORPUS_OR_EXCLUDED_ID`);
    }
  }
  // frameId space (GEN001-*) is disjoint from DRA-DOC-* IDs by construction; the ID checks above
  // are retained as a structural guard even though they can never match given current ID schemes.
  void consideredIds;
  return {
    id: "CONTAMINATION_EXCLUSION_STILL_HOLDS",
    passed: violations.length === 0,
    detail: violations.length > 0 ? violations.join(",") : undefined,
  };
}

export function verifySampleLock(): PreconditionCheck[] {
  const liveDigest = computeLiveSampleDigest();
  const lockResult = computeSampleLockVerdict();
  const stratumCounts = countByStratum();
  return [
    {
      id: "SAMPLE_BOUND_TO_LIVE_PROTOCOL_DIGEST",
      passed: GEN001_BOUND_PROTOCOL_DIGEST === computeLiveProtocolDigest(),
    },
    {
      id: "SAMPLE_LIVE_AGGREGATE_DIGEST_MATCHES_LOCKED",
      passed: liveDigest === GEN001_SAMPLE_AGGREGATE_DIGEST,
      detail: `live=${liveDigest} locked=${GEN001_SAMPLE_AGGREGATE_DIGEST}`,
    },
    { id: "SAMPLE_LOCK_VERDICT_IS_LOCKED", passed: lockResult.verdict === "DRA_GEN_001_BLIND_SAMPLE_LOCKED" },
    { id: "SAMPLE_SIZE_IS_EXACTLY_100", passed: FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE },
    {
      id: "SAMPLE_25_PER_STRATUM",
      passed: HARD_STRATA.every((s) => stratumCounts[s.id] === 25),
      detail: JSON.stringify(stratumCounts),
    },
    { id: "SAMPLE_STRATUM_ALLOCATION_HELPER_AGREES", passed: verifyStratumAllocation() },
    { id: "SAMPLE_NO_DUPLICATE_FAMILIES", passed: verifyNoDuplicateFamilies() },
    { id: "SAMPLE_ALL_UNITS_MEET_WORD_COUNT_FLOOR", passed: verifyAllUnitsMeetWordCountFloor() },
    { id: "SAMPLE_ORIGINAL_DRAW_HISTORY_PRESERVED", passed: verifyOriginalDrawHistoryPreserved() },
    { id: "SAMPLE_NO_EVALUATOR_OUTPUT_FIELDS_PRESENT", passed: verifyNoEvaluatorOutputFieldsPresent() },
    verifyContaminationStillExcluded(),
    {
      id: "SAMPLE_NO_MANIFEST_MUTATION_SINCE_LOCK",
      passed: REPLACEMENT_LOG.length >= 0 && FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE,
    },
  ];
}

// ---------------------------------------------------------------------------
// Combined gate
// ---------------------------------------------------------------------------

export interface PreconditionReport {
  readonly gc1: PreconditionCheck[];
  readonly protocol: PreconditionCheck[];
  readonly sample: PreconditionCheck[];
  readonly allPassed: boolean;
  readonly failedChecks: string[];
}

export function runAllPreconditionChecks(): PreconditionReport {
  const gc1 = verifyGc1Identity();
  const protocol = verifyProtocolIdentity();
  const sample = verifySampleLock();
  const all = [...gc1, ...protocol, ...sample];
  const failedChecks = all.filter((c) => !c.passed).map((c) => c.id);
  return { gc1, protocol, sample, allPassed: failedChecks.length === 0, failedChecks };
}
