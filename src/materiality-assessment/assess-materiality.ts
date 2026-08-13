/**
 * DRA-001 — Stage 5: Materiality Assessment — Entry Point
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * assessMateriality(
 *   normalisedRequest,
 *   claimExtractionResult,
 *   authorityResolutionResult,
 *   evidenceLinkageResult
 * ): Stage5Result
 *
 * Receives Stage 1–4 outputs and assigns exactly one materiality classification
 * to every extracted statement. Classification is deterministic: identical input
 * always produces identical output.
 *
 * On success:  returns materiality records ordered by statementIndex.
 * On failure:  returns deterministic structured errors. Never throws.
 *
 * Stage 5 must not:
 *   - determine factual correctness
 *   - judge source credibility or evidence quality
 *   - detect any of the nine DRA issue classes
 *   - produce SUPPORTED, REVIEW, or HOLD
 *   - produce a proof receipt
 *   - calculate a confidence score
 *   - invoke or import CTS
 *   - perform network access or LLM calls
 *   - re-segment the document
 *   - rewrite extracted statements
 *   - modify Stage 2, 3, or 4 outputs
 */

import {
  DRA_MODEL_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_ERROR_CODES,
} from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import type { NormalisedEvaluationRequest } from "../normalisation/stage1-types.js";
import type { Stage2Result, Stage2Success } from "../claim-extraction/index.js";
import type { Stage3Result, Stage3Success } from "../authority-resolution/index.js";
import type { Stage4Result, Stage4Success } from "../evidence-linkage/index.js";
import { STAGE_5_ID, STAGE_5_VERSION } from "./materiality-result.js";
import type { Stage5Result, Stage5Success, Stage5Failure } from "./materiality-result.js";
import type { MaterialityRecord, Stage5AssessmentRecord } from "./materiality-record.js";
import type { MaterialityClassification } from "./materiality-classification.js";
import { MATERIALITY_CLASSIFICATIONS } from "./materiality-classification.js";
import { classifyMateriality } from "./materiality-rules.js";
import { analyseStructure } from "./structural-analysis.js";
import { makeMaterialityRecordId } from "./record-identifiers.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ASSESSMENT_RULE_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function makeStage5Failure(errors: ReadonlyArray<DraValidationError>): Stage5Failure {
  const sorted = [...errors].sort((a, b) => {
    const p = a.path.localeCompare(b.path);
    return p !== 0 ? p : a.code.localeCompare(b.code);
  });
  return Object.freeze({
    ok: false as const,
    stageId: STAGE_5_ID,
    errors: Object.freeze(sorted),
    errorCount: sorted.length,
  });
}

function makeStage5Success(
  evaluationId: string,
  generatedDocumentId: string,
  materialityRecords: ReadonlyArray<MaterialityRecord>,
  assessmentRecord: Stage5AssessmentRecord,
  warnings: ReadonlyArray<string>,
): Stage5Success {
  return Object.freeze({
    ok: true as const,
    stageId: STAGE_5_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId,
    generatedDocumentId,
    materialityRecords: Object.freeze([...materialityRecords]),
    assessmentRecord: Object.freeze(assessmentRecord),
    warnings: Object.freeze([...warnings]),
  });
}

function buildClassificationCounts(
  records: ReadonlyArray<MaterialityRecord>,
): Record<MaterialityClassification, number> {
  const counts = Object.fromEntries(
    MATERIALITY_CLASSIFICATIONS.map((c) => [c, 0]),
  ) as Record<MaterialityClassification, number>;
  for (const rec of records) {
    counts[rec.classification]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// assessMateriality — Stage 5 entry point
// ---------------------------------------------------------------------------

/**
 * Stage 5 of the DRA evaluator pipeline: Materiality Assessment.
 *
 * Accepts the Stage 1 normalised evaluation request, the Stage 2 claim
 * extraction result, the Stage 3 authority resolution result, and the Stage 4
 * evidence linkage result. Produces one materiality record per extracted
 * statement, ordered by statementIndex.
 *
 * Never throws for external invalid input.
 *
 * @param normalisedRequest         - Canonical Stage 1 normalised evaluation request.
 * @param claimExtractionResult     - Stage 2 claim extraction result (must be Stage2Success).
 * @param authorityResolutionResult - Stage 3 authority resolution result (must be Stage3Success).
 * @param evidenceLinkageResult     - Stage 4 evidence linkage result (must be Stage4Success).
 * @returns Stage5Result — use `result.ok` to discriminate.
 */
export function assessMateriality(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
  authorityResolutionResult: Stage3Result | unknown,
  evidenceLinkageResult: Stage4Result | unknown,
): Stage5Result {
  // -------------------------------------------------------------------------
  // Step 1: Validate normalisedRequest
  // -------------------------------------------------------------------------

  if (
    normalisedRequest === null ||
    normalisedRequest === undefined ||
    typeof normalisedRequest !== "object"
  ) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest",
        message:
          "Stage 5 requires a canonical NormalisedEvaluationRequest from Stage 1; received invalid input",
        received: typeof normalisedRequest,
      },
    ]);
  }

  const request = normalisedRequest as NormalisedEvaluationRequest;

  if (!request.generatedDocument || typeof request.generatedDocument.content !== "string") {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
        path: "normalisedRequest.generatedDocument.content",
        message:
          "Stage 5 requires a string content field in the normalised generated document",
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 2: Validate claimExtractionResult (Stage 2)
  // -------------------------------------------------------------------------

  if (
    claimExtractionResult === null ||
    claimExtractionResult === undefined ||
    typeof claimExtractionResult !== "object"
  ) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message: "Stage 5 received invalid Stage 2 result; expected Stage2Success",
        received: typeof claimExtractionResult,
      },
    ]);
  }

  const stage2 = claimExtractionResult as Stage2Result;
  if (!stage2.ok) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message:
          "Stage 5 received a Stage 2 failure result; Stage 2 must succeed before Stage 5 can proceed",
      },
    ]);
  }

  const stage2Success = stage2 as Stage2Success;

  // -------------------------------------------------------------------------
  // Step 3: Validate authorityResolutionResult (Stage 3)
  // -------------------------------------------------------------------------

  if (
    authorityResolutionResult === null ||
    authorityResolutionResult === undefined ||
    typeof authorityResolutionResult !== "object"
  ) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult",
        message: "Stage 5 received invalid Stage 3 result; expected Stage3Success",
        received: typeof authorityResolutionResult,
      },
    ]);
  }

  const stage3 = authorityResolutionResult as Stage3Result;
  if (!stage3.ok) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult",
        message:
          "Stage 5 received a Stage 3 failure result; Stage 3 must succeed before Stage 5 can proceed",
      },
    ]);
  }

  const stage3Success = stage3 as Stage3Success;

  // -------------------------------------------------------------------------
  // Step 4: Validate evidenceLinkageResult (Stage 4)
  // -------------------------------------------------------------------------

  if (
    evidenceLinkageResult === null ||
    evidenceLinkageResult === undefined ||
    typeof evidenceLinkageResult !== "object"
  ) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE4_RESULT,
        path: "evidenceLinkageResult",
        message: "Stage 5 received invalid Stage 4 result; expected Stage4Success",
        received: typeof evidenceLinkageResult,
      },
    ]);
  }

  const stage4 = evidenceLinkageResult as Stage4Result;
  if (!stage4.ok) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE4_RESULT,
        path: "evidenceLinkageResult",
        message:
          "Stage 5 received a Stage 4 failure result; Stage 4 must succeed before Stage 5 can proceed",
      },
    ]);
  }

  const stage4Success = stage4 as Stage4Success;

  // -------------------------------------------------------------------------
  // Step 5: Cross-check evaluationIds
  // -------------------------------------------------------------------------

  if (stage2Success.evaluationId !== stage3Success.evaluationId) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult.evaluationId",
        message: `Stage 3 evaluationId (${stage3Success.evaluationId}) does not match Stage 2 evaluationId (${stage2Success.evaluationId})`,
      },
    ]);
  }

  if (stage2Success.evaluationId !== stage4Success.evaluationId) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE4_RESULT,
        path: "evidenceLinkageResult.evaluationId",
        message: `Stage 4 evaluationId (${stage4Success.evaluationId}) does not match Stage 2 evaluationId (${stage2Success.evaluationId})`,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 6: Produce one materiality record per statement
  // -------------------------------------------------------------------------

  const records: MaterialityRecord[] = [];
  const seenRecordIds = new Set<string>();
  const warnings: string[] = [];

  for (let i = 0; i < stage2Success.statements.length; i++) {
    const stmt = stage2Success.statements[i]!;

    const statementStart = stmt.spanRef?.startOffset ?? 0;
    const statementEnd = stmt.spanRef?.endOffset ?? stmt.text.length;

    // Classify materiality using the rule engine
    const detection = classifyMateriality(stmt.text);

    // Derive structural context
    const structuralContext = analyseStructure(stmt.text);

    // Generate deterministic record ID
    const recordId = makeMaterialityRecordId(String(stmt.id));

    // Collision check
    if (seenRecordIds.has(recordId)) {
      return makeStage5Failure([
        {
          code: DRA_ERROR_CODES.MATERIALITY_RECORD_ID_COLLISION,
          path: `materialityRecords[${i}]`,
          message: `Materiality record ID collision for statement ${String(stmt.id)} at index ${i}`,
        },
      ]);
    }
    seenRecordIds.add(recordId);

    const record: MaterialityRecord = Object.freeze({
      id: recordId,
      statementId: stmt.id,
      recordIndex: i,
      classification: detection.classification,
      ruleId: detection.ruleId,
      triggeringCharacteristics: Object.freeze([...detection.triggeringCharacteristics]),
      structuralContext: Object.freeze(structuralContext),
      rationale: detection.rationale,
      statementSpan: Object.freeze({
        startOffset: statementStart,
        endOffset: statementEnd,
      }),
    });

    records.push(record);
  }

  // -------------------------------------------------------------------------
  // Step 7: Verify one record per statement
  // -------------------------------------------------------------------------

  if (records.length !== stage2Success.statements.length) {
    return makeStage5Failure([
      {
        code: DRA_ERROR_CODES.INCOMPLETE_MATERIALITY_COVERAGE,
        path: "materialityRecords",
        message: `Expected ${stage2Success.statements.length} materiality records but produced ${records.length}`,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 8: Build assessment record
  // -------------------------------------------------------------------------

  const assessmentRecord: Stage5AssessmentRecord = Object.freeze({
    stageId: STAGE_5_ID,
    stageVersion: STAGE_5_VERSION,
    assessmentRuleVersion: ASSESSMENT_RULE_VERSION,
    evaluationId: stage2Success.evaluationId,
    generatedDocumentId: stage2Success.generatedDocumentId,
    statementCount: stage2Success.statements.length,
    materialityRecordCount: records.length,
    classificationCounts: Object.freeze(buildClassificationCounts(records)),
  });

  return makeStage5Success(
    stage2Success.evaluationId,
    stage2Success.generatedDocumentId,
    records,
    assessmentRecord,
    warnings,
  );
}
