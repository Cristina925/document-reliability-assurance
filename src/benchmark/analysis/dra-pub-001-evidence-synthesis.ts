/**
 * DRA-PUB-001 — Final Evidence Synthesis and Publication-Readiness Review
 *
 * This is a REVIEW/SYNTHESIS programme artefact, not an engineering, acquisition, or
 * benchmark-execution artefact. It changes no production evaluator behaviour, no corpus
 * history, no frozen artefact, and no historical benchmark result. It exists solely so
 * the load-bearing numeric, identity, and claim-verdict assertions made in
 * `docs/dra/DRA-PUB-001-FINAL-EVIDENCE-SYNTHESIS.md`,
 * `docs/dra/DRA-PUB-001-CLAIM-EVIDENCE-MATRIX.md`, and
 * `docs/dra/DRA-PUB-001-PUBLICATION-LIMITATIONS.md` are machine-verifiable rather than
 * only asserted in prose.
 *
 * This module deliberately re-imports the authoritative source modules for every
 * cross-referenced fact (GC-1 identity, GEN-001/VAL-002 protocol bindings, the
 * reachability matrix) rather than re-transcribing their values, so a future change to
 * any of those frozen artefacts would break this module's own type-checking or its
 * integrity test, not silently drift out of sync with this synthesis.
 */

import { GC1_AGGREGATE_DIGEST, GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS, GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID } from "./dra-gc-1-freeze-manifest.js";
import { GEN001_BOUND_GC1_DIGEST } from "./dra-gen-001-freeze-manifest.js";
import { VAL002_BOUND_GC1_DIGEST } from "./dra-val-002-freeze-manifest.js";
import { REACHABILITY_MATRIX, type ReachabilityStatus } from "./reachability-matrix.js";

// ---------------------------------------------------------------------------
// Section 1 — identity-integrity gate (re-derived, not hand-copied)
// ---------------------------------------------------------------------------

export const IDENTITY_GATE = {
  gc1AggregateDigest: GC1_AGGREGATE_DIGEST,
  gen001BoundDigestMatchesGC1: GEN001_BOUND_GC1_DIGEST === GC1_AGGREGATE_DIGEST,
  val002BoundDigestMatchesGC1: VAL002_BOUND_GC1_DIGEST === GC1_AGGREGATE_DIGEST,
} as const;

// ---------------------------------------------------------------------------
// Section 5 — development corpus scale (re-derived from the frozen manifest)
// ---------------------------------------------------------------------------

export const DEVELOPMENT_CORPUS_ADMITTED_COUNT = GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS.length;
export const DEVELOPMENT_CORPUS_EXCLUDED_ID = GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID;

// ---------------------------------------------------------------------------
// Section 7 — issue-class reachability (re-derived from reachability-matrix.ts)
// ---------------------------------------------------------------------------

export const TOTAL_ISSUE_CLASSES = REACHABILITY_MATRIX.length;

export const OBSERVED_REACHABLE_CLASSES = REACHABILITY_MATRIX.filter(
  (e) => e.reachability === ("OBSERVED_REACHABLE" as ReachabilityStatus),
).map((e) => e.code);

export const STRUCTURALLY_UNREACHABLE_CLASSES = REACHABILITY_MATRIX.filter(
  (e) => e.reachability === ("STRUCTURALLY_UNREACHABLE" as ReachabilityStatus),
).map((e) => e.code);

// ---------------------------------------------------------------------------
// Section 8 — DRA-GEN-001 restated figures (hand-transcribed from the frozen,
// historical Post-Blind Evidence Review — that report's own artefacts are the
// source of truth; this module only guards against this synthesis silently
// drifting from the numbers already fixed there).
// ---------------------------------------------------------------------------

export const GEN_001_RESTATED = {
  lockedSampleSize: 100,
  evaluatedCount: 75,
  excludedCount: 25,
  excludedStratum: "HTML_ENGLISH",
  decisions: { supported: 64, hold: 10, review: 1 },
  benchmarkEvidenceVerdict: "GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION",
  nextEvidenceVerdict: "TARGETED_FOLLOW_UP_REQUIRED",
} as const;

// ---------------------------------------------------------------------------
// Section 9 — DRA-VAL-002 restated figures
// ---------------------------------------------------------------------------

export const VAL_002_RESTATED = {
  lockedSampleSize: 25,
  evaluatedCount: 25,
  families: { GOV_UK: 9, ONS_GOV_UK: 8, US_FEDERAL: 8 },
  decisions: { supported: 24, review: 1 },
  postHocDrift: { identical: 15, drifted: 7, unreachable: 3 },
  executionVerdict: "DRA_VAL_002_COMPLETE",
  coverageVerdict: "ENGLISH_HTML_GAP_CLOSED",
  publicationReadinessVerdict: "READY_FOR_FINAL_EVIDENCE_SYNTHESIS",
} as const;

// ---------------------------------------------------------------------------
// Section 17 / claim-evidence matrix — verdict enum and the twelve claims
// ---------------------------------------------------------------------------

export type ClaimVerdict =
  | "SUPPORTED"
  | "SUPPORTED_WITH_LIMITATION"
  | "NOT_SUPPORTED"
  | "OUT_OF_SCOPE";

export interface ClaimRecord {
  readonly id: string;
  readonly verdict: ClaimVerdict;
}

export const CLAIM_EVIDENCE_MATRIX: readonly ClaimRecord[] = [
  { id: "C1", verdict: "SUPPORTED" },
  { id: "C2", verdict: "SUPPORTED" },
  { id: "C3", verdict: "SUPPORTED" },
  { id: "C4", verdict: "SUPPORTED_WITH_LIMITATION" },
  { id: "C5", verdict: "SUPPORTED" },
  { id: "C6", verdict: "NOT_SUPPORTED" },
  { id: "C7", verdict: "SUPPORTED" },
  { id: "C8", verdict: "NOT_SUPPORTED" },
  { id: "C9", verdict: "SUPPORTED_WITH_LIMITATION" },
  { id: "C10", verdict: "SUPPORTED" },
  { id: "C11", verdict: "NOT_SUPPORTED" },
  { id: "C12", verdict: "NOT_SUPPORTED" },
] as const;

// ---------------------------------------------------------------------------
// Section 24 — twelve publication-readiness dimensions
// ---------------------------------------------------------------------------

export type ReadinessRating =
  | "STRONG"
  | "ADEQUATE"
  | "ADEQUATE_WITH_LIMITATION"
  | "WEAK"
  | "MISSING";

export const PUBLICATION_READINESS_DIMENSIONS: ReadonlyArray<{
  readonly dimension: string;
  readonly rating: ReadinessRating;
}> = [
  { dimension: "Candidate identity/freeze integrity", rating: "STRONG" },
  { dimension: "Development-corpus diversity", rating: "ADEQUATE" },
  { dimension: "Robustness/defect-closure discipline", rating: "STRONG" },
  { dimension: "Issue-class coverage breadth", rating: "ADEQUATE_WITH_LIMITATION" },
  { dimension: "Blind generalisation evidence (GEN-001)", rating: "ADEQUATE_WITH_LIMITATION" },
  { dimension: "Targeted follow-up evidence (VAL-002)", rating: "STRONG" },
  { dimension: "Cross-language materiality reliability", rating: "WEAK" },
  { dimension: "Statistical rigor / non-merge discipline", rating: "STRONG" },
  { dimension: "Reproducibility (proof receipts, frozen bytes)", rating: "STRONG" },
  { dimension: "Reproducibility (live re-acquisition)", rating: "ADEQUATE_WITH_LIMITATION" },
  { dimension: "External independent validation", rating: "MISSING" },
  { dimension: "Publication-package completeness", rating: "MISSING" },
] as const;

// ---------------------------------------------------------------------------
// Section 25 — final verdicts
// ---------------------------------------------------------------------------

export type PublicationVerdict =
  | "DRA_READY_FOR_FIRST_PUBLICATION"
  | "DRA_NOT_READY_FOR_FIRST_PUBLICATION";

export const FINAL_PUBLICATION_VERDICT: PublicationVerdict = "DRA_READY_FOR_FIRST_PUBLICATION";

export const ENGINEERING_STATE_VERDICT = "DRA_V1_ENGINEERING_FROZEN_FOR_PUBLICATION" as const;
