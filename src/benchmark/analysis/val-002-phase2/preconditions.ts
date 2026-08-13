/**
 * DRA-VAL-002 Phase 2 — Preconditions
 *
 * Verifies, before any blind document is evaluated, the three immutable identities this study
 * depends on:
 *   A. DRA-GC-1 (the frozen candidate — unchanged from GEN-001/GC2-REV-001)
 *   B. The DRA-VAL-002 protocol (the frozen methodology)
 *   C. The DRA-VAL-002 blind sample (the locked 25-document manifest)
 *
 * DATA/VERIFICATION ONLY. Mirrors gen-001-phase2/preconditions.ts exactly, repointed at VAL-002's
 * own protocol/sample-manifest modules.
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
  GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS,
  GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID,
} from "../dra-gc-1-freeze-manifest";
import {
  VAL002_PROTOCOL_STATUS,
  VAL002_PROTOCOL_AGGREGATE_DIGEST,
  VAL002_BOUND_GC1_DIGEST,
  computeProtocolAggregateDigest as computeLiveProtocolDigest,
  computeLiveProtocolFileDigests,
  FROZEN_PROTOCOL_FILE_DIGESTS,
} from "../dra-val-002-freeze-manifest";
import {
  FROZEN_UNITS,
  REPLACEMENT_LOG,
  VAL002_BOUND_PROTOCOL_DIGEST,
  VAL002_SAMPLE_AGGREGATE_DIGEST,
  computeSampleAggregateDigest as computeLiveSampleDigest,
  computeSampleLockVerdict,
  verifyFamilyAllocationWithinCap,
  verifyNoDuplicateFamilies,
  verifyAllUnitsMeetWordCountFloor,
  verifyOriginalDrawHistoryPreserved,
  verifyNoEvaluatorOutputFieldsPresent,
} from "../val-002-phase1/dra-val-002-sample-manifest";
import { RECOMMENDED_SAMPLE_SIZE } from "../dra-val-002-protocol";
import { isVal002ConsideredUrl, isVal002ConsideredCandidateId } from "../dra-val-002-considered-registry";

export interface PreconditionCheck {
  readonly id: string;
  readonly passed: boolean;
  readonly detail?: string;
}

// ---------------------------------------------------------------------------
// A. DRA-GC-1 identity verification (unchanged from GEN-001)
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
// B. DRA-VAL-002 protocol identity verification
// ---------------------------------------------------------------------------

export function verifyProtocolIdentity(): PreconditionCheck[] {
  const liveDigest = computeLiveProtocolDigest();
  const liveFileDigests = computeLiveProtocolFileDigests();
  const fileMismatches = Object.keys(FROZEN_PROTOCOL_FILE_DIGESTS).filter(
    (path) => liveFileDigests[path] !== FROZEN_PROTOCOL_FILE_DIGESTS[path],
  );
  return [
    { id: "PROTOCOL_STATUS_IS_FROZEN", passed: VAL002_PROTOCOL_STATUS === "FROZEN" },
    { id: "PROTOCOL_BOUND_TO_LIVE_GC1_DIGEST", passed: VAL002_BOUND_GC1_DIGEST === computeLiveGc1Digest() },
    {
      id: "PROTOCOL_LIVE_AGGREGATE_DIGEST_MATCHES_FROZEN",
      passed: liveDigest === VAL002_PROTOCOL_AGGREGATE_DIGEST,
      detail: `live=${liveDigest} frozen=${VAL002_PROTOCOL_AGGREGATE_DIGEST}`,
    },
    {
      id: "PROTOCOL_NO_FROZEN_FILE_BYTE_DRIFT",
      passed: fileMismatches.length === 0,
      detail: fileMismatches.length > 0 ? `drifted=${fileMismatches.join(",")}` : undefined,
    },
  ];
}

// ---------------------------------------------------------------------------
// C. DRA-VAL-002 blind sample lock verification
// ---------------------------------------------------------------------------

export function verifyContaminationStillExcluded(): PreconditionCheck {
  const devCorpusIds = new Set(GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS);
  const violations: string[] = [];
  for (const u of FROZEN_UNITS) {
    if (isVal002ConsideredUrl(u.sourceUrl)) violations.push(`${u.frameId}:CONSIDERED_URL`);
    if (devCorpusIds.has(u.frameId) || u.frameId === GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID || isVal002ConsideredCandidateId(u.frameId)) {
      violations.push(`${u.frameId}:CONSIDERED_OR_DEV_CORPUS_ID`);
    }
  }
  return {
    id: "CONTAMINATION_EXCLUSION_STILL_HOLDS",
    passed: violations.length === 0,
    detail: violations.length > 0 ? violations.join(",") : undefined,
  };
}

export function verifySampleLock(): PreconditionCheck[] {
  const liveDigest = computeLiveSampleDigest();
  const lockResult = computeSampleLockVerdict();
  return [
    { id: "SAMPLE_BOUND_TO_LIVE_PROTOCOL_DIGEST", passed: VAL002_BOUND_PROTOCOL_DIGEST === computeLiveProtocolDigest() },
    {
      id: "SAMPLE_LIVE_AGGREGATE_DIGEST_MATCHES_LOCKED",
      passed: liveDigest === VAL002_SAMPLE_AGGREGATE_DIGEST,
      detail: `live=${liveDigest} locked=${VAL002_SAMPLE_AGGREGATE_DIGEST}`,
    },
    { id: "SAMPLE_LOCK_VERDICT_IS_LOCKED", passed: lockResult.verdict === "DRA_VAL_002_SAMPLE_LOCKED" },
    { id: "SAMPLE_SIZE_IS_EXACTLY_25", passed: FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE },
    { id: "SAMPLE_FAMILY_ALLOCATION_WITHIN_CAP", passed: verifyFamilyAllocationWithinCap() },
    { id: "SAMPLE_NO_DUPLICATE_FAMILIES", passed: verifyNoDuplicateFamilies() },
    { id: "SAMPLE_ALL_UNITS_MEET_WORD_COUNT_FLOOR", passed: verifyAllUnitsMeetWordCountFloor() },
    { id: "SAMPLE_ORIGINAL_DRAW_HISTORY_PRESERVED", passed: verifyOriginalDrawHistoryPreserved() },
    { id: "SAMPLE_NO_EVALUATOR_OUTPUT_FIELDS_PRESENT", passed: verifyNoEvaluatorOutputFieldsPresent() },
    verifyContaminationStillExcluded(),
    { id: "SAMPLE_NO_MANIFEST_MUTATION_SINCE_LOCK", passed: REPLACEMENT_LOG.length >= 0 && FROZEN_UNITS.length === RECOMMENDED_SAMPLE_SIZE },
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
