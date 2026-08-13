/**
 * DRA-001 — Stage 6: Consistency Check — Entry Point
 *
 * Milestone: DRA-ENG-008 — Consistency Check
 * Spec reference: DRA-001 §5, Stage 5 "Consistency Check"
 *
 * checkConsistency() is the canonical Stage 6 entry point. It validates all
 * five prior-stage inputs, cross-checks evaluationId coherence, then runs the
 * issue detection engine (detectIssues) to produce a Stage6Result.
 *
 * Invariants:
 *   - Never throws. All errors are returned as Stage6Failure.
 *   - Pure with respect to inputs: same inputs → same outputs.
 *   - Accepts all four result arguments as `unknown` for defensive validation.
 *   - Does not produce decisions, confidence scores, or proof receipts.
 */

import {
  DRA_MODEL_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_ERROR_CODES,
  type DraValidationError,
} from "../model/index.js";
import type { Stage2Result, Stage2Success } from "../claim-extraction/index.js";
import type { Stage3Result, Stage3Success } from "../authority-resolution/index.js";
import type { Stage4Result, Stage4Success } from "../evidence-linkage/index.js";
import type { Stage5Result, Stage5Success } from "../materiality-assessment/index.js";
import type { NormalisedEvaluationRequest } from "../normalisation/index.js";
import {
  STAGE_6_ID,
  STAGE_6_VERSION,
  type Stage6Result,
} from "./consistency-result.js";
import { detectIssues } from "./issue-detection.js";

export { STAGE_6_VERSION };
export const CONSISTENCY_CHECK_VERSION = STAGE_6_VERSION;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeStage6Failure(errors: DraValidationError[]): Stage6Result {
  return {
    ok: false,
    stageId: STAGE_6_ID,
    errors: Object.freeze(errors),
    errorCount: errors.length,
  };
}

// ---------------------------------------------------------------------------
// checkConsistency — main entry point
// ---------------------------------------------------------------------------

/**
 * Runs Stage 6 (Consistency Check) of the DRA evaluator pipeline.
 *
 * @param normalisedRequest       Stage 1 normalised evaluation request.
 * @param claimExtractionResult   Stage 2 success result.
 * @param authorityResolutionResult Stage 3 success result.
 * @param evidenceLinkageResult   Stage 4 success result.
 * @param materialityResult       Stage 5 (Materiality Assessment) success result.
 * @returns Stage6Result — success with issues array, or failure with errors.
 */
export function checkConsistency(
  normalisedRequest: unknown,
  claimExtractionResult: unknown,
  authorityResolutionResult: unknown,
  evidenceLinkageResult: unknown,
  materialityResult: unknown,
): Stage6Result {
  // ── 1. Validate normalisedRequest ─────────────────────────────────────────
  if (!normalisedRequest || typeof normalisedRequest !== "object") {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest",
        message: "normalisedRequest must be a non-null object",
        received: String(normalisedRequest),
      },
    ]);
  }
  const request = normalisedRequest as NormalisedEvaluationRequest;
  if (
    !request.generatedDocument ||
    typeof request.generatedDocument.content !== "string"
  ) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest.generatedDocument.content",
        message:
          "normalisedRequest must have a generatedDocument with a string content field",
        received: undefined,
      },
    ]);
  }

  // ── 2. Validate Stage 2 (Claim Extraction) ────────────────────────────────
  if (
    !claimExtractionResult ||
    typeof claimExtractionResult !== "object" ||
    !(claimExtractionResult as Stage2Result).ok
  ) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "claimExtractionResult",
        message: "Stage 2 claim extraction result must be a success (ok: true)",
        received: undefined,
      },
    ]);
  }
  const stage2 = claimExtractionResult as Stage2Success;

  // ── 3. Validate Stage 3 (Authority Resolution) ────────────────────────────
  if (
    !authorityResolutionResult ||
    typeof authorityResolutionResult !== "object" ||
    !(authorityResolutionResult as Stage3Result).ok
  ) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "authorityResolutionResult",
        message:
          "Stage 3 authority resolution result must be a success (ok: true)",
        received: undefined,
      },
    ]);
  }
  const stage3 = authorityResolutionResult as Stage3Success;
  if (stage3.evaluationId !== stage2.evaluationId) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
        path: "authorityResolutionResult.evaluationId",
        message: `Stage 3 evaluationId (${stage3.evaluationId}) does not match Stage 2 evaluationId (${stage2.evaluationId})`,
        received: stage3.evaluationId,
      },
    ]);
  }

  // ── 4. Validate Stage 4 (Evidence Linkage) ───────────────────────────────
  if (
    !evidenceLinkageResult ||
    typeof evidenceLinkageResult !== "object" ||
    !(evidenceLinkageResult as Stage4Result).ok
  ) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "evidenceLinkageResult",
        message: "Stage 4 evidence linkage result must be a success (ok: true)",
        received: undefined,
      },
    ]);
  }
  const stage4 = evidenceLinkageResult as Stage4Success;
  if (stage4.evaluationId !== stage2.evaluationId) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
        path: "evidenceLinkageResult.evaluationId",
        message: `Stage 4 evaluationId (${stage4.evaluationId}) does not match Stage 2 (${stage2.evaluationId})`,
        received: stage4.evaluationId,
      },
    ]);
  }

  // ── 5. Validate Stage 5 (Materiality Assessment) ─────────────────────────
  if (
    !materialityResult ||
    typeof materialityResult !== "object" ||
    !(materialityResult as Stage5Result).ok
  ) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE5_RESULT,
        path: "materialityResult",
        message:
          "Stage 5 materiality assessment result must be a success (ok: true)",
        received: undefined,
      },
    ]);
  }
  const stage5 = materialityResult as Stage5Success;
  if (stage5.evaluationId !== stage2.evaluationId) {
    return makeStage6Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE5_RESULT,
        path: "materialityResult.evaluationId",
        message: `Stage 5 evaluationId (${stage5.evaluationId}) does not match Stage 2 (${stage2.evaluationId})`,
        received: stage5.evaluationId,
      },
    ]);
  }

  // ── 6. Run issue detection ────────────────────────────────────────────────
  const issues = detectIssues(
    stage2,
    stage3.authorityRecords,
    stage4.evidenceRecords,
    stage5.materialityRecords,
  );

  const blockingCount = issues.filter((i) => i.severity === "BLOCKING").length;
  const advisoryCount = issues.filter((i) => i.severity === "ADVISORY").length;

  return {
    ok: true,
    stageId: STAGE_6_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId: stage2.evaluationId,
    generatedDocumentId: stage2.generatedDocumentId,
    statementCount: stage2.statements.length,
    issueCount: issues.length,
    blockingIssueCount: blockingCount,
    advisoryIssueCount: advisoryCount,
    issues,
    warnings: [],
  };
}
