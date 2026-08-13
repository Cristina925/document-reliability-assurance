/**
 * DRA-001 — Pipeline Integration — DocumentAssuranceEvaluation Type
 *
 * Milestone: DRA-ENG-010 — Evaluator Integration
 * Spec reference: DRA-001 §5 (seven-stage pipeline), §7 (decisions), §8 (proof receipt)
 *
 * Defines DocumentAssuranceEvaluation: the top-level result produced by
 * evaluateDocument(). This type is the complete evaluation output — all stage
 * results, the detected issues, the assurance decision, and the proof receipt.
 *
 * Two variants:
 *   DocumentAssuranceSuccess — all stages completed; decision and receipt present.
 *   DocumentAssuranceFailure — a pipeline stage failed; partial output only.
 *
 * The Materiality Assessment stage (our Stage 5, not in the DRA-001 §5 frozen
 * seven-stage list) is included in the pipeline field for full traceability.
 * Its output is embedded in the "Evidence Linkage" stage record within the proof
 * receipt to maintain the frozen seven-record proof-receipt structure.
 */

import type {
  AssuranceDecision,
  DraIssue,
  DraValidationError,
  ProofReceipt,
} from "../model/index.js";
import type { Stage1Success } from "../normalisation/index.js";
import type { Stage2Success } from "../claim-extraction/index.js";
import type { Stage3Success } from "../authority-resolution/index.js";
import type { Stage4Success } from "../evidence-linkage/index.js";
import type { Stage5Success } from "../materiality-assessment/index.js";
import type { Stage6Success } from "../consistency-check/index.js";
import type { Stage7Success } from "../confidence-scoring/index.js";

// ---------------------------------------------------------------------------
// DocumentAssuranceSuccess
// ---------------------------------------------------------------------------

/** All seven pipeline stages completed successfully. */
export interface DocumentAssuranceSuccess {
  readonly ok: true;
  /** EvaluationId from Stage 2 (derived from the request). */
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  /** UTC ISO-8601 timestamp of this evaluation (no offset designator). */
  readonly evaluatedAt: string;
  /** Structured outputs of all pipeline stages. */
  readonly pipeline: {
    readonly stage1: Stage1Success;
    readonly stage2: Stage2Success;
    readonly stage3: Stage3Success;
    readonly stage4: Stage4Success;
    /** Extra stage (not in frozen seven-stage spec) — materiality classification. */
    readonly materialityAssessment: Stage5Success;
    readonly consistencyCheck: Stage6Success;
    readonly confidenceScoring: Stage7Success;
  };
  /** All assurance issues detected by Stage 6 (Consistency Check). */
  readonly issues: ReadonlyArray<DraIssue>;
  /** SUPPORTED | REVIEW | HOLD — derived from issue severities. */
  readonly decision: AssuranceDecision;
  readonly decisionRationale: string;
  /**
   * Frozen proof receipt (DRA-001 §8). Contains exactly seven stage records
   * corresponding to the frozen DRA-001 §5 pipeline stages.
   */
  readonly proofReceipt: ProofReceipt;
  /** Aggregated non-fatal warnings from all pipeline stages. */
  readonly warnings: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// DocumentAssuranceFailure
// ---------------------------------------------------------------------------

/** A pipeline stage failed — the evaluation could not be completed. */
export interface DocumentAssuranceFailure {
  readonly ok: false;
  /** EvaluationId if it was produced before the failure, otherwise null. */
  readonly evaluationId: string | null;
  /** Human-readable name of the stage that failed. */
  readonly failedAtStage: string;
  /** Structured errors from the failing stage. */
  readonly errors: ReadonlyArray<DraValidationError>;
}

// ---------------------------------------------------------------------------
// DocumentAssuranceEvaluation — top-level discriminated union
// ---------------------------------------------------------------------------

/**
 * The top-level result of evaluateDocument().
 *
 * Discriminate on `ok`:
 *   - `ok === true`  → DocumentAssuranceSuccess (access decision, proofReceipt, etc.)
 *   - `ok === false` → DocumentAssuranceFailure (access failedAtStage, errors)
 */
export type DocumentAssuranceEvaluation =
  | DocumentAssuranceSuccess
  | DocumentAssuranceFailure;
