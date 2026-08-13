/**
 * DRA-001 — Pipeline Integration — evaluateDocument()
 *
 * Milestone: DRA-ENG-010 — Evaluator Integration
 * Spec reference: DRA-001 §5 (pipeline), §7 (decisions), §8 (proof receipt)
 *
 * evaluateDocument() is the canonical top-level DRA evaluator entry point.
 * It orchestrates all pipeline stages in order and returns a
 * DocumentAssuranceEvaluation carrying the decision and proof receipt.
 *
 * Pipeline order:
 *   1  Input Normalisation    (normaliseEvaluationRequest)
 *   2  Claim Extraction       (extractClaims)
 *   3  Authority Resolution   (resolveAuthority)
 *   4  Evidence Linkage       (linkEvidence)
 *   5* Materiality Assessment (assessMateriality) — extra stage, not in spec §5
 *   5  Consistency Check      (checkConsistency)
 *   6  Confidence Scoring     (scoreConfidence)
 *   7  Decision + Receipt     (deriveDecision + buildProofReceipt)
 *
 * Invariants:
 *   - Never throws. Stage failures are returned as DocumentAssuranceFailure.
 *   - All stages executed in order; a stage failure stops the pipeline.
 *   - The proof receipt contains exactly 7 StageRecord entries (frozen spec §5).
 *   - Pure with respect to the document content; the only impure aspect is the
 *     evaluated-at timestamp (derived from Date.now() at call time).
 */

import { normaliseEvaluationRequest } from "../normalisation/index.js";
import { extractClaims } from "../claim-extraction/index.js";
import { resolveAuthority } from "../authority-resolution/index.js";
import { linkEvidence } from "../evidence-linkage/index.js";
import { assessMateriality } from "../materiality-assessment/index.js";
import { checkConsistency } from "../consistency-check/index.js";
import { scoreConfidence } from "../confidence-scoring/index.js";
import {
  DRA_EVALUATOR_VERSION,
  DRA_PIPELINE_VERSION,
} from "../model/index.js";
import { deriveDecision } from "./derive-decision.js";
import { buildProofReceipt } from "./build-proof-receipt.js";
import type { DocumentAssuranceEvaluation } from "./evaluation-result.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a UTC ISO-8601 datetime string with Z suffix (e.g. "2026-07-27T12:00:00.000Z"). */
function utcTimestamp(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// evaluateDocument — main entry point
// ---------------------------------------------------------------------------

/**
 * Runs the complete DRA evaluator pipeline against a raw evaluation request.
 *
 * @param input Raw (unknown-typed) evaluation request input. Stage 1 validates
 *              and normalises it; invalid inputs return DocumentAssuranceFailure.
 * @returns DocumentAssuranceEvaluation — success with decision + proof receipt,
 *          or failure with the stage that failed and its errors.
 */
export function evaluateDocument(input: unknown): DocumentAssuranceEvaluation {
  const evaluatedAt = utcTimestamp();

  // ── Stage 1: Input Normalisation ───────────────────────────────────────────
  const s1 = normaliseEvaluationRequest(input);
  if (!s1.ok) {
    return {
      ok: false,
      evaluationId: null,
      failedAtStage: "Input Normalisation",
      errors: s1.errors,
    };
  }

  // ── Stage 2: Claim Extraction ─────────────────────────────────────────────
  const s2 = extractClaims(s1.normalisedRequest);
  if (!s2.ok) {
    return {
      ok: false,
      evaluationId: null,
      failedAtStage: "Claim Extraction",
      errors: s2.errors,
    };
  }

  // ── Stage 3: Authority Resolution ─────────────────────────────────────────
  const s3 = resolveAuthority(s1.normalisedRequest, s2);
  if (!s3.ok) {
    return {
      ok: false,
      evaluationId: s2.evaluationId,
      failedAtStage: "Authority Resolution",
      errors: s3.errors,
    };
  }

  // ── Stage 4: Evidence Linkage ─────────────────────────────────────────────
  const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
  if (!s4.ok) {
    return {
      ok: false,
      evaluationId: s2.evaluationId,
      failedAtStage: "Evidence Linkage",
      errors: s4.errors,
    };
  }

  // ── Stage 5*: Materiality Assessment (extra stage) ────────────────────────
  const s5 = assessMateriality(s1.normalisedRequest, s2, s3, s4);
  if (!s5.ok) {
    return {
      ok: false,
      evaluationId: s2.evaluationId,
      failedAtStage: "Materiality Assessment",
      errors: s5.errors,
    };
  }

  // ── Stage 6 (spec Stage 5): Consistency Check ─────────────────────────────
  const s6 = checkConsistency(s1.normalisedRequest, s2, s3, s4, s5);
  if (!s6.ok) {
    return {
      ok: false,
      evaluationId: s2.evaluationId,
      failedAtStage: "Consistency Check",
      errors: s6.errors,
    };
  }

  // ── Stage 7 (spec Stage 6): Confidence Scoring ───────────────────────────
  const s7 = scoreConfidence(s1.normalisedRequest, s2, s3, s4, s5, s6);
  if (!s7.ok) {
    return {
      ok: false,
      evaluationId: s2.evaluationId,
      failedAtStage: "Confidence Scoring",
      errors: s7.errors,
    };
  }

  // ── Stage 8 (spec Stage 7): Decision + Proof Receipt ─────────────────────
  const { decision, rationale } = deriveDecision(s6.issues);

  const proofReceipt = buildProofReceipt({
    evaluatedAt,
    stage1: s1,
    stage2: s2,
    stage3: s3,
    stage4: s4,
    stage5: s5,
    stage6: s6,
    stage7: s7,
    decision,
    decisionRationale: rationale,
  });

  // ── Aggregate warnings ────────────────────────────────────────────────────
  const warnings: string[] = [
    ...s1.warnings,
    ...s2.warnings,
    ...s3.warnings,
    ...s4.warnings,
    ...s5.warnings,
    ...s6.warnings,
    ...s7.warnings,
  ];

  return {
    ok: true,
    evaluationId: s2.evaluationId,
    generatedDocumentId: s2.generatedDocumentId,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_EVALUATOR_VERSION,
    evaluatedAt,
    pipeline: {
      stage1: s1,
      stage2: s2,
      stage3: s3,
      stage4: s4,
      materialityAssessment: s5,
      consistencyCheck: s6,
      confidenceScoring: s7,
    },
    issues: s6.issues,
    decision,
    decisionRationale: rationale,
    proofReceipt,
    warnings: Object.freeze(warnings),
  };
}
