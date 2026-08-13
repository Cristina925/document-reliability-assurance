/**
 * DRA-001 — Stage 3: Authority Resolution — Entry Point
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * resolveAuthority(normalisedRequest, claimExtractionResult): Stage3Result
 *
 * Receives the Stage 2 claim extraction success result and assigns one authority
 * record to each extracted material statement.
 *
 * Resolution is deterministic, rule-based, and requires no external services.
 *
 * On success:  returns authority records ordered by statementIndex.
 * On failure:  returns deterministic structured errors. Never throws.
 *
 * Stage 3 must not:
 *   - assess factual correctness
 *   - retrieve or map evidence
 *   - judge source credibility or independence
 *   - determine whether evidence supports a claim
 *   - assign materiality
 *   - calculate confidence
 *   - detect any of the nine DRA issue classes
 *   - produce SUPPORTED, REVIEW, or HOLD
 *   - produce a proof receipt
 *   - invoke or import CTS
 *   - perform network access or LLM calls
 *   - re-segment the document
 *   - rewrite extracted statements
 */

import {
  DRA_MODEL_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_ERROR_CODES,
} from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import type { NormalisedEvaluationRequest } from "../normalisation/stage1-types.js";
import type { Stage2Result, Stage2Success } from "../claim-extraction/index.js";
import {
  STAGE_3_ID,
  STAGE_3_VERSION,
} from "./resolution-result.js";
import type {
  Stage3Result,
  Stage3Success,
  Stage3Failure,
} from "./resolution-result.js";
import type { AuthorityRecord, Stage3ResolutionRecord } from "./authority-record.js";
import type { AuthorityClassification } from "./authority-classification.js";
import { AUTHORITY_CLASSIFICATIONS } from "./authority-classification.js";
import {
  detectAttribution,
  detectAuthorityType,
} from "./attribution-patterns.js";
import { validateAuthoritySpan } from "./authority-span-validation.js";
import { makeAuthorityRecordId } from "./record-identifiers.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const RESOLUTION_RULE_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

/**
 * Extracts the immediately preceding line from the document content, relative
 * to the statement's start offset.
 *
 * Respects structural boundaries:
 *   - If the preceding line is separated by a blank line (paragraph boundary),
 *     returns hasBoundary = true.
 *   - If the statement is at the document start, returns hasBoundary = true.
 *
 * @param content        - Normalised document content (LF endings).
 * @param statementStart - Absolute start offset of the statement.
 * @returns { text, lineStart, hasBoundary }
 */
function getPrecedingLine(
  content: string,
  statementStart: number,
): { text: string; lineStart: number; hasBoundary: boolean } {
  if (statementStart === 0) {
    return { text: "", lineStart: 0, hasBoundary: true };
  }

  // Find the newline that ends the line before the statement.
  // The statement may start mid-line (after a bullet marker).
  // Scan backward to find the last \n before statementStart.
  let prevNl = content.lastIndexOf("\n", statementStart - 1);

  if (prevNl < 0) {
    // No newline before the statement — it's on the first line of the document.
    return { text: "", lineStart: 0, hasBoundary: true };
  }

  // Check for paragraph boundary: if the character before prevNl is also \n.
  if (prevNl > 0 && content[prevNl - 1] === "\n") {
    return { text: "", lineStart: prevNl + 1, hasBoundary: true };
  }

  // Preceding line ends at prevNl (exclusive). Find its start.
  const prevPrevNl = content.lastIndexOf("\n", prevNl - 1);
  const lineStart = prevPrevNl + 1; // 0 if prevPrevNl is -1
  const text = content.slice(lineStart, prevNl);

  return { text, lineStart, hasBoundary: false };
}

function makeStage3Failure(errors: ReadonlyArray<DraValidationError>): Stage3Failure {
  const sorted = [...errors].sort((a, b) => {
    const p = a.path.localeCompare(b.path);
    return p !== 0 ? p : a.code.localeCompare(b.code);
  });
  return Object.freeze({
    ok: false as const,
    stageId: STAGE_3_ID,
    errors: Object.freeze(sorted),
    errorCount: sorted.length,
  });
}

function makeStage3Success(
  evaluationId: string,
  generatedDocumentId: string,
  authorityRecords: ReadonlyArray<AuthorityRecord>,
  resolutionRecord: Stage3ResolutionRecord,
  warnings: ReadonlyArray<string>,
): Stage3Success {
  return Object.freeze({
    ok: true as const,
    stageId: STAGE_3_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId,
    generatedDocumentId,
    authorityRecords: Object.freeze([...authorityRecords]),
    resolutionRecord: Object.freeze(resolutionRecord),
    warnings: Object.freeze([...warnings]),
  });
}

function buildClassificationCounts(
  records: ReadonlyArray<AuthorityRecord>,
): Record<AuthorityClassification, number> {
  const counts = Object.fromEntries(
    AUTHORITY_CLASSIFICATIONS.map((c) => [c, 0]),
  ) as Record<AuthorityClassification, number>;
  for (const rec of records) {
    counts[rec.classification]++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// resolveAuthority — Stage 3 entry point
// ---------------------------------------------------------------------------

/**
 * Stage 3 of the DRA evaluator pipeline: Authority Resolution.
 *
 * Accepts the Stage 1 normalised evaluation request and the Stage 2 claim
 * extraction result. Produces one authority record for each extracted statement.
 *
 * Never throws for external invalid input.
 *
 * @param normalisedRequest    - Canonical Stage 1 normalised evaluation request.
 * @param claimExtractionResult - Stage 2 claim extraction result (must be Stage2Success).
 * @returns Stage3Result — use `result.ok` to discriminate.
 */
export function resolveAuthority(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
): Stage3Result {
  // -------------------------------------------------------------------------
  // Step 1: Validate normalisedRequest
  // -------------------------------------------------------------------------

  if (
    normalisedRequest === null ||
    normalisedRequest === undefined ||
    typeof normalisedRequest !== "object"
  ) {
    return makeStage3Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest",
        message:
          "Stage 3 requires a canonical NormalisedEvaluationRequest from Stage 1; received invalid input",
        received: typeof normalisedRequest,
      },
    ]);
  }

  const request = normalisedRequest as NormalisedEvaluationRequest;

  if (!request.generatedDocument || typeof request.generatedDocument.content !== "string") {
    return makeStage3Failure([
      {
        code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
        path: "normalisedRequest.generatedDocument.content",
        message: "Stage 3 requires a string content field in the normalised generated document",
      },
    ]);
  }

  const content = request.generatedDocument.content;

  // -------------------------------------------------------------------------
  // Step 2: Validate claimExtractionResult
  // -------------------------------------------------------------------------

  if (
    claimExtractionResult === null ||
    claimExtractionResult === undefined ||
    typeof claimExtractionResult !== "object"
  ) {
    return makeStage3Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message: "Stage 3 received invalid Stage 2 result; expected Stage2Success",
        received: typeof claimExtractionResult,
      },
    ]);
  }

  const stage2 = claimExtractionResult as Stage2Result;

  if (!stage2.ok) {
    return makeStage3Failure([
      {
        code: DRA_ERROR_CODES.MALFORMED_STAGE2_RESULT,
        path: "claimExtractionResult",
        message:
          "Stage 3 received a Stage 2 failure result; Stage 2 must succeed before Stage 3 can proceed",
      },
    ]);
  }

  const stage2Success = stage2 as Stage2Success;

  // -------------------------------------------------------------------------
  // Step 3: Produce one authority record per statement
  // -------------------------------------------------------------------------

  const records: AuthorityRecord[] = [];
  const seenRecordIds = new Set<string>();
  const warnings: string[] = [];

  for (let i = 0; i < stage2Success.statements.length; i++) {
    const stmt = stage2Success.statements[i]!;

    const statementStart = stmt.spanRef?.startOffset ?? 0;
    const statementEnd = stmt.spanRef?.endOffset ?? stmt.text.length;

    // Get preceding line context
    const { text: precedingLine, lineStart: precedingLineStart, hasBoundary } =
      getPrecedingLine(content, statementStart);

    // Detect attribution
    const detection = detectAttribution(
      stmt.text,
      precedingLine,
      precedingLineStart,
      hasBoundary,
    );

    // Compute authority span (absolute offsets in document)
    let authorityText: string | undefined = undefined;
    let authoritySpan: { startOffset: number; endOffset: number } | undefined = undefined;
    let authorityType = undefined;

    if (detection.authorityText && detection.authorityLocalStart !== undefined && detection.authorityLocalEnd !== undefined) {
      const rawText = detection.authorityText;

      if (detection.isFromPreceding) {
        // Authority text is located in the preceding line
        const absStart = precedingLineStart + detection.authorityLocalStart;
        const absEnd = precedingLineStart + detection.authorityLocalEnd;
        const spanErrors = validateAuthoritySpan(absStart, absEnd, rawText, content, `records[${i}].authoritySpan`);
        if (spanErrors.length === 0) {
          authorityText = rawText;
          authoritySpan = { startOffset: absStart, endOffset: absEnd };
        } else {
          warnings.push(
            `Authority span (preceding line) integrity issue for statement ${String(stmt.id)}: ${spanErrors[0]?.message ?? "unknown"}`,
          );
          authorityText = rawText; // keep text even without validated span
        }
      } else {
        // Authority text is located within the statement
        const absStart = statementStart + detection.authorityLocalStart;
        const absEnd = statementStart + detection.authorityLocalEnd;
        const spanErrors = validateAuthoritySpan(absStart, absEnd, rawText, content, `records[${i}].authoritySpan`);
        if (spanErrors.length === 0) {
          authorityText = rawText;
          authoritySpan = { startOffset: absStart, endOffset: absEnd };
        } else {
          warnings.push(
            `Authority span integrity issue for statement ${String(stmt.id)}: ${spanErrors[0]?.message ?? "unknown"}`,
          );
          authorityText = rawText;
        }
      }

      if (authorityText) {
        authorityType = detectAuthorityType(authorityText);
      }
    }

    // Generate deterministic record ID
    const recordId = makeAuthorityRecordId(String(stmt.id));

    // -----------------------------------------------------------------------
    // Step 4: Collision check
    // -----------------------------------------------------------------------
    if (seenRecordIds.has(recordId)) {
      return makeStage3Failure([
        {
          code: DRA_ERROR_CODES.AUTHORITY_RECORD_ID_COLLISION,
          path: `records[${i}]`,
          message: `Authority record ID collision for statement ${String(stmt.id)} at index ${i}`,
        },
      ]);
    }
    seenRecordIds.add(recordId);

    const record: AuthorityRecord = Object.freeze({
      id: recordId,
      statementId: stmt.id,
      recordIndex: i,
      classification: detection.classification,
      authorityText,
      authorityType: authorityText ? authorityType : undefined,
      authoritySpan,
      statementSpan: {
        startOffset: statementStart,
        endOffset: statementEnd,
      },
      resolutionRule: detection.resolutionRule,
      inheritedContextRef: detection.inheritedContextRef,
      ambiguityDetails: detection.ambiguityDetails,
    });

    records.push(record);
  }

  // -------------------------------------------------------------------------
  // Step 5: Verify one record per statement
  // -------------------------------------------------------------------------
  if (records.length !== stage2Success.statements.length) {
    return makeStage3Failure([
      {
        code: DRA_ERROR_CODES.INCOMPLETE_AUTHORITY_COVERAGE,
        path: "authorityRecords",
        message:
          `Expected ${stage2Success.statements.length} authority records but produced ${records.length}`,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 6: Build resolution record
  // -------------------------------------------------------------------------
  const resolutionRecord: Stage3ResolutionRecord = Object.freeze({
    stageId: STAGE_3_ID,
    stageVersion: STAGE_3_VERSION,
    resolutionRuleVersion: RESOLUTION_RULE_VERSION,
    evaluationId: stage2Success.evaluationId,
    generatedDocumentId: stage2Success.generatedDocumentId,
    documentLength: content.length,
    statementCount: stage2Success.statements.length,
    authorityRecordCount: records.length,
    classificationCounts: Object.freeze(buildClassificationCounts(records)),
    warnings: Object.freeze([...warnings]),
  });

  return makeStage3Success(
    stage2Success.evaluationId,
    stage2Success.generatedDocumentId,
    records,
    resolutionRecord,
    warnings,
  );
}
