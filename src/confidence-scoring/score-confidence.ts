/**
 * DRA-001 — Stage 7: Confidence Scoring — Entry Point
 *
 * Milestone: DRA-ENG-008 (Confidence Scoring, spec Stage 6)
 * Spec reference: DRA-001 §5, Stage 6 "Confidence Scoring"
 *
 * scoreConfidence() is the canonical Stage 7 entry point. It validates all
 * six prior-stage inputs, then assigns a ConfidenceLevel to every statement
 * based on cross-stage evidence.
 *
 * Confidence level assignment rules (in evaluation order):
 *   1. CONTESTED  — statement appears in an IC-7 CLAIM_INCONSISTENCY issue.
 *   2. CONFIRMED  — named/structural authority AND positive documentary evidence.
 *   3. UNVERIFIED — no identifiable authority AND no documentary evidence.
 *   4. PARTIAL    — everything else (one of authority/evidence, or ambiguous).
 *
 * Invariants:
 *   - Never throws. All errors returned as Stage7Failure.
 *   - Pure: same inputs → same outputs.
 *   - Does not produce decisions or proof receipts.
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
import type { Stage6Result, Stage6Success } from "../consistency-check/index.js";
import type { NormalisedEvaluationRequest } from "../normalisation/index.js";
import { buildStatementIdMap, tryExtractId } from "../shared/identifier-utils.js";
import type { AuthorityClassification } from "../authority-resolution/index.js";
import type { EvidenceClassification } from "../evidence-linkage/index.js";
import {
  STAGE_7_ID,
  STAGE_7_VERSION,
  type Stage7Result,
  type ConfidenceRecord,
} from "./confidence-result.js";
import {
  CONFIDENCE_LEVELS,
  type ConfidenceLevel,
  CONFIDENCE_RULE_VERSION,
} from "./confidence-level.js";

export { CONFIDENCE_RULE_VERSION, STAGE_7_VERSION };

// ---------------------------------------------------------------------------
// Authority classification sentinels
// ---------------------------------------------------------------------------

/** Authority classifications considered "named/structural" for CONFIRMED. */
const NAMED_AUTHORITY: ReadonlySet<string> = new Set([
  "EXPLICIT_NAMED_SOURCE",
  "EXPLICIT_UNNAMED_SOURCE",
  "STRUCTURALLY_INHERITED_SOURCE",
]);

/** Authority classifications that indicate no identifiable source. */
const NO_AUTHORITY_CLASSIFICATIONS: ReadonlySet<string> = new Set([
  "NO_IDENTIFIABLE_SOURCE",
]);

/** Evidence classifications considered "positive" for CONFIRMED. */
const POSITIVE_EVIDENCE: ReadonlySet<string> = new Set([
  "CITED_REFERENCE",
  "TABLE_EVIDENCE",
  "FIGURE_EVIDENCE",
  "FOOTNOTE_EVIDENCE",
  "APPENDIX_EVIDENCE",
  "QUOTED_SOURCE",
  "DOCUMENT_CROSS_REFERENCE",
  "EXTERNAL_REFERENCE_PRESENT",
  "DIRECT_DOCUMENT_EVIDENCE",
]);

const NO_EVIDENCE_CLASSIFICATIONS: ReadonlySet<string> = new Set([
  "NO_DOCUMENT_EVIDENCE",
]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeStage7Failure(errors: DraValidationError[]): Stage7Result {
  return {
    ok: false,
    stageId: STAGE_7_ID,
    errors: Object.freeze(errors),
    errorCount: errors.length,
  };
}

/**
 * Assigns a ConfidenceLevel based on authority, evidence, and contestation.
 */
function assignConfidenceLevel(
  authorityClassification: AuthorityClassification,
  evidenceClassification: EvidenceClassification,
  isContested: boolean,
): ConfidenceLevel {
  if (isContested) return "CONTESTED";

  const hasNamedAuthority = NAMED_AUTHORITY.has(authorityClassification);
  const hasPositiveEvidence = POSITIVE_EVIDENCE.has(evidenceClassification);
  const noAuthority = NO_AUTHORITY_CLASSIFICATIONS.has(authorityClassification);
  const noEvidence = NO_EVIDENCE_CLASSIFICATIONS.has(evidenceClassification);

  if (hasNamedAuthority && hasPositiveEvidence) return "CONFIRMED";
  if (noAuthority && noEvidence) return "UNVERIFIED";
  return "PARTIAL";
}

/**
 * Builds a human-readable rationale for the assigned level.
 */
function buildRationale(
  level: ConfidenceLevel,
  authorityClassification: AuthorityClassification,
  evidenceClassification: EvidenceClassification,
  isContested: boolean,
): string {
  if (isContested) {
    return `CONTESTED: statement is involved in a detected IC-7 CLAIM_INCONSISTENCY.`;
  }
  switch (level) {
    case "CONFIRMED":
      return (
        `CONFIRMED: named/structural authority (${authorityClassification}) ` +
        `and positive documentary evidence (${evidenceClassification}) present.`
      );
    case "UNVERIFIED":
      return (
        `UNVERIFIED: no identifiable authority (${authorityClassification}) ` +
        `and no documentary evidence (${evidenceClassification}).`
      );
    case "PARTIAL":
      return (
        `PARTIAL: partial evidence — authority=${authorityClassification}, ` +
        `evidence=${evidenceClassification}. ` +
        `Authority or evidence present but not both, or evidence is ambiguous.`
      );
    case "CONTESTED":
      return `CONTESTED: statement is involved in a detected IC-7 CLAIM_INCONSISTENCY.`;
  }
}

/** Initialises a level-counts record with all four levels set to 0. */
function zeroLevelCounts(): Record<ConfidenceLevel, number> {
  return Object.fromEntries(
    CONFIDENCE_LEVELS.map((l) => [l, 0]),
  ) as Record<ConfidenceLevel, number>;
}

// ---------------------------------------------------------------------------
// scoreConfidence — main entry point
// ---------------------------------------------------------------------------

/**
 * Runs Stage 7 (Confidence Scoring) of the DRA evaluator pipeline.
 *
 * @param normalisedRequest         Stage 1 normalised evaluation request.
 * @param claimExtractionResult     Stage 2 success result.
 * @param authorityResolutionResult Stage 3 success result.
 * @param evidenceLinkageResult     Stage 4 success result.
 * @param materialityResult         Stage 5 materiality success result.
 * @param consistencyResult         Stage 6 consistency check success result.
 * @returns Stage7Result — success with confidence records, or failure with errors.
 */
export function scoreConfidence(
  normalisedRequest: unknown,
  claimExtractionResult: unknown,
  authorityResolutionResult: unknown,
  evidenceLinkageResult: unknown,
  materialityResult: unknown,
  consistencyResult: unknown,
): Stage7Result {
  // ── 1. Validate normalisedRequest ─────────────────────────────────────────
  if (!normalisedRequest || typeof normalisedRequest !== "object") {
    return makeStage7Failure([
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
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest.generatedDocument.content",
        message:
          "normalisedRequest must have a generatedDocument with a string content field",
        received: undefined,
      },
    ]);
  }

  // ── 2–5. Validate Stages 2–5 ──────────────────────────────────────────────
  if (
    !claimExtractionResult ||
    typeof claimExtractionResult !== "object" ||
    !(claimExtractionResult as Stage2Result).ok
  ) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "claimExtractionResult",
        message: "Stage 2 claim extraction result must be a success",
        received: undefined,
      },
    ]);
  }
  const stage2 = claimExtractionResult as Stage2Success;

  if (
    !authorityResolutionResult ||
    typeof authorityResolutionResult !== "object" ||
    !(authorityResolutionResult as Stage3Result).ok
  ) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "authorityResolutionResult",
        message: "Stage 3 authority resolution result must be a success",
        received: undefined,
      },
    ]);
  }
  const stage3 = authorityResolutionResult as Stage3Success;

  if (
    !evidenceLinkageResult ||
    typeof evidenceLinkageResult !== "object" ||
    !(evidenceLinkageResult as Stage4Result).ok
  ) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "evidenceLinkageResult",
        message: "Stage 4 evidence linkage result must be a success",
        received: undefined,
      },
    ]);
  }
  const stage4 = evidenceLinkageResult as Stage4Success;

  if (
    !materialityResult ||
    typeof materialityResult !== "object" ||
    !(materialityResult as Stage5Result).ok
  ) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE5_RESULT,
        path: "materialityResult",
        message: "Stage 5 materiality assessment result must be a success",
        received: undefined,
      },
    ]);
  }
  // stage5 is available but we don't use it directly here (materiality drives issue detection)
  void (materialityResult as Stage5Success);

  // ── 6. Validate Stage 6 (Consistency Check) ───────────────────────────────
  if (
    !consistencyResult ||
    typeof consistencyResult !== "object" ||
    !(consistencyResult as Stage6Result).ok
  ) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE6_RESULT,
        path: "consistencyResult",
        message: "Stage 6 consistency check result must be a success",
        received: undefined,
      },
    ]);
  }
  const stage6 = consistencyResult as Stage6Success;
  if (stage6.evaluationId !== stage2.evaluationId) {
    return makeStage7Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE6_RESULT,
        path: "consistencyResult.evaluationId",
        message: `Stage 6 evaluationId (${stage6.evaluationId}) does not match Stage 2 (${stage2.evaluationId})`,
        received: stage6.evaluationId,
      },
    ]);
  }

  // ── 7. Build cross-reference maps ─────────────────────────────────────────
  // buildStatementIdMap validates each statementId (rejects null/undefined/
  // non-string/empty) instead of silently coercing with String().
  const arByStmt = buildStatementIdMap(stage3.authorityRecords);
  const erByStmt = buildStatementIdMap(stage4.evidenceRecords);

  // Build set of contested statement IDs (from IC-7 issues).
  // affectedStatementIds are StatementId (branded string); tryExtractId
  // guards against any future unknown-typed values in the same way.
  const contestedSids = new Set<string>();
  for (const issue of stage6.issues) {
    if (issue.issueClass === "CLAIM_INCONSISTENCY") {
      for (const sid of issue.affectedStatementIds) {
        const validated = tryExtractId(sid);
        if (validated !== null) {
          contestedSids.add(validated);
        }
      }
    }
  }

  // ── 8. Score each statement ───────────────────────────────────────────────
  const confidenceRecords: ConfidenceRecord[] = [];
  const levelCounts = zeroLevelCounts();

  for (const statement of stage2.statements) {
    const sid = String(statement.id);
    const ar = arByStmt.get(sid);
    const er = erByStmt.get(sid);

    // Fallback when records are missing (defensive — should not occur)
    const authClass =
      (ar?.classification as AuthorityClassification | undefined) ??
      "NO_IDENTIFIABLE_SOURCE";
    const evidClass =
      (er?.classification as EvidenceClassification | undefined) ??
      "NO_DOCUMENT_EVIDENCE";
    const isContested = contestedSids.has(sid);

    const level = assignConfidenceLevel(authClass, evidClass, isContested);
    const rationale = buildRationale(level, authClass, evidClass, isContested);

    confidenceRecords.push({
      statementId: sid,
      statementIndex: statement.statementIndex,
      level,
      rationale,
    });

    levelCounts[level]++;
  }

  // Sort by statementIndex ascending (determinism)
  confidenceRecords.sort((a, b) => a.statementIndex - b.statementIndex);

  return {
    ok: true,
    stageId: STAGE_7_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId: stage2.evaluationId,
    generatedDocumentId: stage2.generatedDocumentId,
    statementCount: stage2.statements.length,
    confidenceRecords: Object.freeze(confidenceRecords),
    levelCounts: Object.freeze(levelCounts),
    warnings: [],
  };
}
