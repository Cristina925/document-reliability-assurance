/**
 * DRA-001 — Pipeline Integration — Proof Receipt Builder
 *
 * Milestone: DRA-ENG-009 — Decision and Receipt (spec Stage 7)
 * Updated:   DRA-ENG-008B — Deterministic Contract and Boundary Hardening
 * Spec reference: DRA-001 §8 — Proof Receipt Requirements
 *
 * buildProofReceipt() constructs the canonical ProofReceipt required by
 * DRA-001 §8. The receipt carries exactly seven StageRecord entries in the
 * frozen stage-number order, plus a SHA-256 substantive integrity digest.
 *
 * Mapping of implementation stages → proof receipt stage records:
 *   Stage 1 → "Input Normalisation"  (stageNumber 1)
 *   Stage 2 → "Claim Extraction"     (stageNumber 2)
 *   Stage 3 → "Authority Resolution" (stageNumber 3)
 *   Stage 4 → "Evidence Linkage"     (stageNumber 4) — includes Materiality
 *   Stage 6 → "Consistency Check"    (stageNumber 5)
 *   Stage 7 → "Confidence Scoring"   (stageNumber 6)
 *   Decision → "Decision and Receipt" (stageNumber 7)
 *
 * Note: The extra Materiality Assessment stage (our Stage 5, not in the frozen
 * seven-stage spec) is embedded in the "Evidence Linkage" stage record output.
 */

import type {
  ProofReceipt,
  StageRecord,
  DocumentIdentity,
  EvaluatorIdentity,
  ProofReceiptId,
  EvaluationId,
  EvaluationResultId,
  GeneratedDocumentId,
  AssuranceDecision,
} from "../model/index.js";
import {
  DRA_MODEL_VERSION,
  DRA_EVALUATOR_VERSION,
  DRA_PIPELINE_VERSION,
} from "../model/index.js";
import { summariseIssues } from "../model/issues.js";
import type { Stage1Success } from "../normalisation/index.js";
import type { Stage2Success } from "../claim-extraction/index.js";
import type { Stage3Success } from "../authority-resolution/index.js";
import type { Stage4Success } from "../evidence-linkage/index.js";
import type { Stage5Success } from "../materiality-assessment/index.js";
import type { Stage6Success } from "../consistency-check/index.js";
import type { Stage7Success } from "../confidence-scoring/index.js";
import { computeDigestFromPayload } from "./canonical-serialise.js";

// ---------------------------------------------------------------------------
// BuildReceiptParams
// ---------------------------------------------------------------------------

export interface BuildReceiptParams {
  readonly evaluatedAt: string;
  readonly stage1: Stage1Success;
  readonly stage2: Stage2Success;
  readonly stage3: Stage3Success;
  readonly stage4: Stage4Success;
  readonly stage5: Stage5Success;
  readonly stage6: Stage6Success;
  readonly stage7: Stage7Success;
  readonly decision: AssuranceDecision;
  readonly decisionRationale: string;
}

// ---------------------------------------------------------------------------
// buildProofReceipt
// ---------------------------------------------------------------------------

/**
 * Constructs the canonical DRA-001 §8 ProofReceipt from all pipeline stages.
 *
 * The receipt includes a SHA-256 substantive integrity digest computed from
 * all deterministic fields (excluding operational metadata: id, timestamp,
 * documentIdentity.evaluatedAt, substantiveDigest itself).
 *
 * @param params All stage results, the decision, and the evaluation timestamp.
 * @returns A frozen ProofReceipt satisfying all DRA-001 §8 mandatory fields.
 */
export function buildProofReceipt(params: BuildReceiptParams): ProofReceipt {
  const {
    evaluatedAt,
    stage1,
    stage2,
    stage3,
    stage4,
    stage5,
    stage6,
    stage7,
    decision,
    decisionRationale,
  } = params;

  const evaluationId = stage2.evaluationId;

  // ── Document identity (§8.1) ──────────────────────────────────────────────
  const documentIdentity: DocumentIdentity = {
    generatedDocumentId:
      stage2.generatedDocumentId as unknown as GeneratedDocumentId,
    generatedDocumentTitle:
      stage1.normalisedRequest.generatedDocument.title,
    evaluatedAt,
  };

  // ── Evaluator identity (§8.2) ─────────────────────────────────────────────
  // evaluatorVersion is the EVALUATOR version (DRA_EVALUATOR_VERSION = 0.1.1),
  // not the data-model schema version (DRA_MODEL_VERSION = 0.1.0).  These were
  // the same before DRA-EVAL-002; they now differ because the improved evaluator
  // incorporates DRA-FIX-001 and DRA-FIX-002 without changing the data model.
  const evaluatorIdentity: EvaluatorIdentity = {
    evaluatorVersion: DRA_EVALUATOR_VERSION,
    pipelineVersion: DRA_PIPELINE_VERSION,
  };

  // ── Stage records (§8.3) — exactly 7, in stage-number order ──────────────
  const stageOutputs: StageRecord[] = [
    {
      stageNumber: 1,
      stageName: "Input Normalisation",
      output: {
        stageId: stage1.stageId,
        pipelineVersion: stage1.pipelineVersion,
        modelVersion: stage1.modelVersion,
        documentTitle: stage1.normalisedRequest.generatedDocument.title,
        warningCount: stage1.warnings.length,
      },
    },
    {
      stageNumber: 2,
      stageName: "Claim Extraction",
      output: {
        stageId: stage2.stageId,
        statementCount: stage2.statements.length,
        warningCount: stage2.warnings.length,
      },
    },
    {
      stageNumber: 3,
      stageName: "Authority Resolution",
      output: {
        stageId: stage3.stageId,
        authorityRecordCount: stage3.authorityRecords.length,
        warningCount: stage3.warnings.length,
      },
    },
    {
      stageNumber: 4,
      stageName: "Evidence Linkage",
      output: {
        stageId: stage4.stageId,
        evidenceRecordCount: stage4.evidenceRecords.length,
        warningCount: stage4.warnings.length,
        // Materiality Assessment (extra stage) is embedded here
        materialityAssessment: {
          stageId: stage5.stageId,
          statementCount: stage5.assessmentRecord.statementCount,
          classificationCounts: stage5.assessmentRecord.classificationCounts,
          warningCount: stage5.warnings.length,
        },
      },
    },
    {
      stageNumber: 5,
      stageName: "Consistency Check",
      output: {
        stageId: stage6.stageId,
        statementCount: stage6.statementCount,
        issueCount: stage6.issueCount,
        blockingIssueCount: stage6.blockingIssueCount,
        advisoryIssueCount: stage6.advisoryIssueCount,
        warningCount: stage6.warnings.length,
      },
    },
    {
      stageNumber: 6,
      stageName: "Confidence Scoring",
      output: {
        stageId: stage7.stageId,
        statementCount: stage7.statementCount,
        levelCounts: stage7.levelCounts,
        warningCount: stage7.warnings.length,
      },
    },
    {
      stageNumber: 7,
      stageName: "Decision and Receipt",
      output: {
        decision,
        decisionRationale,
        issueCount: stage6.issueCount,
        blockingIssueCount: stage6.blockingIssueCount,
        advisoryIssueCount: stage6.advisoryIssueCount,
      },
    },
  ];

  // ── Issue register (§8.4) ─────────────────────────────────────────────────
  const issueRegister = [...stage6.issues];
  const issueSummary = summariseIssues(issueRegister);

  // ── Substantive integrity digest ─────────────────────────────────────────
  // Computed from all deterministic fields, excluding operational metadata.
  // Verifiable with verifyReceiptIntegrity() from canonical-serialise.
  const substantiveDigest = computeDigestFromPayload({
    evaluationRequestId: String(evaluationId),
    evaluationResultId: `result-${String(evaluationId)}`,
    schemaVersion: DRA_MODEL_VERSION,
    documentIdentitySubstantive: {
      generatedDocumentId: String(stage2.generatedDocumentId),
      generatedDocumentTitle: stage1.normalisedRequest.generatedDocument.title,
    },
    evaluatorIdentity,
    stageOutputs,
    issueRegister,
    issueSummary,
    decision,
    decisionRationale,
  });

  // ── Construct the receipt ─────────────────────────────────────────────────
  const receipt: ProofReceipt = {
    // Branded-type casts below are intentional brand assertions, not runtime
    // coercions — these string values satisfy the branded schema constraints.
    id: `receipt-${evaluationId}` as unknown as ProofReceiptId,
    evaluationRequestId: evaluationId as unknown as EvaluationId,
    evaluationResultId:
      `result-${evaluationId}` as unknown as EvaluationResultId,
    schemaVersion: DRA_MODEL_VERSION,
    documentIdentity,
    evaluatorIdentity,
    stageOutputs,
    issueRegister,
    issueSummary,
    decision,
    decisionRationale,
    timestamp: evaluatedAt,
    substantiveDigest,
  };

  return Object.freeze(receipt);
}
