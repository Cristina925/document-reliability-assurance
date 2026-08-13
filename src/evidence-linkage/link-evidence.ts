/**
 * DRA-001 — Stage 4: Evidence Linkage — Entry Point
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * linkEvidence(normalisedRequest, claimExtractionResult, authorityResolutionResult): Stage4Result
 *
 * Receives Stage 2 (claim extraction) and Stage 3 (authority resolution) success
 * results and establishes deterministic evidence links for every extracted statement.
 *
 * Evidence is identified only within the submitted document. No external retrieval.
 *
 * On success:  returns evidence records ordered by statementIndex.
 * On failure:  returns deterministic structured errors. Never throws.
 *
 * Stage 4 must not:
 *   - judge factual correctness
 *   - judge source credibility or authority quality
 *   - assess materiality
 *   - detect any of the nine DRA issue classes
 *   - produce SUPPORTED, REVIEW, or HOLD
 *   - produce a proof receipt
 *   - invoke or import CTS
 *   - perform network access or LLM calls
 *   - re-segment the document
 *   - rewrite extracted statements
 *   - modify Stage 2 or Stage 3 outputs
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
import {
  STAGE_4_ID,
  STAGE_4_VERSION,
} from "./linkage-result.js";
import type {
  Stage4Result,
  Stage4Success,
  Stage4Failure,
} from "./linkage-result.js";
import type { EvidenceRecord, Stage4LinkageRecord, EvidenceSpan } from "./evidence-record.js";
import type { EvidenceClassification } from "./evidence-classification.js";
import { EVIDENCE_CLASSIFICATIONS } from "./evidence-classification.js";
import { detectEvidence } from "./linkage-rules.js";
import { detectSemanticParaphrase } from "./semantic-paraphrase.js";
import { validateEvidenceSpan } from "./evidence-span-validation.js";
import { makeEvidenceRecordId } from "./record-identifiers.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const LINKAGE_RULE_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function makeStage4Failure(errors: ReadonlyArray<DraValidationError>): Stage4Failure {
  const sorted = [...errors].sort((a, b) => {
    const p = a.path.localeCompare(b.path);
    return p !== 0 ? p : a.code.localeCompare(b.code);
  });
  return Object.freeze({
    ok: false as const,
    stageId: STAGE_4_ID,
    errors: Object.freeze(sorted),
    errorCount: sorted.length,
  });
}

function makeStage4Success(
  evaluationId: string,
  generatedDocumentId: string,
  evidenceRecords: ReadonlyArray<EvidenceRecord>,
  linkageRecord: Stage4LinkageRecord,
  warnings: ReadonlyArray<string>,
): Stage4Success {
  return Object.freeze({
    ok: true as const,
    stageId: STAGE_4_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId,
    generatedDocumentId,
    evidenceRecords: Object.freeze([...evidenceRecords]),
    linkageRecord: Object.freeze(linkageRecord),
    warnings: Object.freeze([...warnings]),
  });
}

function buildClassificationCounts(
  records: ReadonlyArray<EvidenceRecord>,
): Record<EvidenceClassification, number> {
  const counts = Object.fromEntries(
    EVIDENCE_CLASSIFICATIONS.map((c) => [c, 0]),
  ) as Record<EvidenceClassification, number>;
  for (const rec of records) {
    counts[rec.classification]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// linkEvidence — Stage 4 entry point
// ---------------------------------------------------------------------------

/**
 * Stage 4 of the DRA evaluator pipeline: Evidence Linkage.
 *
 * Accepts the Stage 1 normalised evaluation request, the Stage 2 claim
 * extraction result, and the Stage 3 authority resolution result.
 * Produces one evidence record for each extracted statement.
 *
 * Never throws for external invalid input.
 *
 * @param normalisedRequest       - Canonical Stage 1 normalised evaluation request.
 * @param claimExtractionResult   - Stage 2 claim extraction result (must be Stage2Success).
 * @param authorityResolutionResult - Stage 3 authority resolution result (must be Stage3Success).
 * @returns Stage4Result — use `result.ok` to discriminate.
 */
export function linkEvidence(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
  authorityResolutionResult: Stage3Result | unknown,
): Stage4Result {
  // -------------------------------------------------------------------------
  // Step 1: Validate normalisedRequest
  // -------------------------------------------------------------------------

  if (
    normalisedRequest === null ||
    normalisedRequest === undefined ||
    typeof normalisedRequest !== "object"
  ) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest",
        message:
          "Stage 4 requires a canonical NormalisedEvaluationRequest from Stage 1; received invalid input",
        received: typeof normalisedRequest,
      },
    ]);
  }

  const request = normalisedRequest as NormalisedEvaluationRequest;

  if (!request.generatedDocument || typeof request.generatedDocument.content !== "string") {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
        path: "normalisedRequest.generatedDocument.content",
        message: "Stage 4 requires a string content field in the normalised generated document",
      },
    ]);
  }

  const content = request.generatedDocument.content;

  // Extract source document content strings for semantic paraphrase fallback.
  const sourceTexts: ReadonlyArray<string> = Array.isArray(request.sourceDocuments)
    ? (request.sourceDocuments as Array<{ content?: unknown }>)
        .map((sd) => sd?.content)
        .filter((c): c is string => typeof c === "string")
    : [];

  // -------------------------------------------------------------------------
  // Step 2: Validate claimExtractionResult
  // -------------------------------------------------------------------------

  if (
    claimExtractionResult === null ||
    claimExtractionResult === undefined ||
    typeof claimExtractionResult !== "object"
  ) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message: "Stage 4 received invalid Stage 2 result; expected Stage2Success",
        received: typeof claimExtractionResult,
      },
    ]);
  }

  const stage2 = claimExtractionResult as Stage2Result;
  if (!stage2.ok) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message:
          "Stage 4 received a Stage 2 failure result; Stage 2 must succeed before Stage 4 can proceed",
      },
    ]);
  }

  const stage2Success = stage2 as Stage2Success;

  // -------------------------------------------------------------------------
  // Step 3: Validate authorityResolutionResult
  // -------------------------------------------------------------------------

  if (
    authorityResolutionResult === null ||
    authorityResolutionResult === undefined ||
    typeof authorityResolutionResult !== "object"
  ) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult",
        message: "Stage 4 received invalid Stage 3 result; expected Stage3Success",
        received: typeof authorityResolutionResult,
      },
    ]);
  }

  const stage3 = authorityResolutionResult as Stage3Result;
  if (!stage3.ok) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult",
        message:
          "Stage 4 received a Stage 3 failure result; Stage 3 must succeed before Stage 4 can proceed",
      },
    ]);
  }

  const stage3Success = stage3 as Stage3Success;

  // Sanity-check that Stage 2 and Stage 3 refer to the same evaluation
  if (stage2Success.evaluationId !== stage3Success.evaluationId) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE3_RESULT,
        path: "authorityResolutionResult.evaluationId",
        message: `Stage 3 evaluationId (${stage3Success.evaluationId}) does not match Stage 2 evaluationId (${stage2Success.evaluationId})`,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 4: Produce one evidence record per statement
  // -------------------------------------------------------------------------

  const records: EvidenceRecord[] = [];
  const seenRecordIds = new Set<string>();
  const warnings: string[] = [];
  let totalEvidenceSpans = 0;

  for (let i = 0; i < stage2Success.statements.length; i++) {
    const stmt = stage2Success.statements[i]!;

    const statementStart = stmt.spanRef?.startOffset ?? 0;
    const statementEnd = stmt.spanRef?.endOffset ?? stmt.text.length;

    // Detect evidence in the statement text
    let detection = detectEvidence(stmt.text);

    // ── DRA-FIX-002: Semantic paraphrase fallback ─────────────────────────
    // When no citation/reference evidence is found, attempt to match the
    // statement against source document passages via deterministic phrase-
    // canonicalisation and content-term-overlap analysis.  This resolves
    // EVIDENCE_ABSENT for statements that are controlled paraphrases of
    // source authority material (e.g. guide restating an ACAS Code paragraph).
    if (detection.classification === "NO_DOCUMENT_EVIDENCE" && sourceTexts.length > 0) {
      const paraMatch = detectSemanticParaphrase(stmt.text, sourceTexts);
      if (paraMatch !== null) {
        detection = Object.freeze({
          classification: "SEMANTIC_PARAPHRASE_MATCH" as const,
          linkageRule: "EL-SEMANTIC-PARAPHRASE",
          matches: Object.freeze([]),
        });
      }
    }

    // Resolve evidence spans to absolute document offsets
    const evidenceSpans: EvidenceSpan[] = [];

    for (const match of detection.matches) {
      const absStart = statementStart + match.localStart;
      const absEnd = statementStart + match.localEnd;

      const spanErrors = validateEvidenceSpan(
        absStart,
        absEnd,
        match.evidenceText,
        content,
        `records[${i}].evidenceSpans`,
      );

      if (spanErrors.length === 0) {
        evidenceSpans.push({
          startOffset: absStart,
          endOffset: absEnd,
          evidenceText: match.evidenceText,
          evidenceType: match.evidenceType,
        });
      } else {
        warnings.push(
          `Evidence span integrity issue for statement ${String(stmt.id)}: ${spanErrors[0]?.message ?? "unknown"}`,
        );
        // Still emit the evidence text without a validated span by using a text-only span
        // We fall through to the record below with reduced spans
      }
    }

    totalEvidenceSpans += evidenceSpans.length;

    // Generate deterministic record ID
    const recordId = makeEvidenceRecordId(String(stmt.id));

    // Collision check
    if (seenRecordIds.has(recordId)) {
      return makeStage4Failure([
        {
          code: DRA_ERROR_CODES.EVIDENCE_RECORD_ID_COLLISION,
          path: `records[${i}]`,
          message: `Evidence record ID collision for statement ${String(stmt.id)} at index ${i}`,
        },
      ]);
    }
    seenRecordIds.add(recordId);

    const record: EvidenceRecord = Object.freeze({
      id: recordId,
      statementId: stmt.id,
      recordIndex: i,
      classification: detection.classification,
      evidenceSpans: Object.freeze(evidenceSpans),
      statementSpan: {
        startOffset: statementStart,
        endOffset: statementEnd,
      },
      linkageRule: detection.linkageRule,
      ambiguityDetails: detection.ambiguityDetails,
    });

    records.push(record);
  }

  // -------------------------------------------------------------------------
  // Step 5: Verify one record per statement
  // -------------------------------------------------------------------------
  if (records.length !== stage2Success.statements.length) {
    return makeStage4Failure([
      {
        code: DRA_ERROR_CODES.INCOMPLETE_EVIDENCE_COVERAGE,
        path: "evidenceRecords",
        message:
          `Expected ${stage2Success.statements.length} evidence records but produced ${records.length}`,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 6: Build linkage record
  // -------------------------------------------------------------------------
  const linkageRecord: Stage4LinkageRecord = Object.freeze({
    stageId: STAGE_4_ID,
    stageVersion: STAGE_4_VERSION,
    linkageRuleVersion: LINKAGE_RULE_VERSION,
    evaluationId: stage2Success.evaluationId,
    generatedDocumentId: stage2Success.generatedDocumentId,
    documentLength: content.length,
    statementCount: stage2Success.statements.length,
    evidenceRecordCount: records.length,
    totalEvidenceSpans,
    classificationCounts: Object.freeze(buildClassificationCounts(records)),
    warnings: Object.freeze([...warnings]),
  });

  return makeStage4Success(
    stage2Success.evaluationId,
    stage2Success.generatedDocumentId,
    records,
    linkageRecord,
    warnings,
  );
}
