/**
 * DRA-001 — Stage 2: Claim Extraction — Entry Point
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * This module implements the single Stage 2 entry point:
 *
 *   extractClaims(normalisedRequest: NormalisedEvaluationRequest): Stage2Result
 *
 * It accepts the canonical Stage 1 normalised evaluation request, segments
 * the generated document content, classifies segments, and returns a
 * discriminated Stage 2 result.
 *
 * On success:  returns candidate material statements with deterministic IDs and spans.
 * On failure:  returns deterministic structured errors. Never throws.
 *
 * Stage 2 must not:
 *   - Inspect source evidence for support
 *   - Map claims to evidence units
 *   - Determine truth or factual correctness
 *   - Detect any of the nine issue classes
 *   - Assign severity, confidence, or decisions
 *   - Generate a proof receipt
 *   - Execute later pipeline stages
 */

import {
  DRA_MODEL_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_ERROR_CODES,
  StatementIdSchema,
} from "../model/index.js";
import type {
  DraValidationError,
  MaterialStatement,
} from "../model/index.js";
import type { NormalisedEvaluationRequest } from "../normalisation/stage1-types.js";
import {
  STAGE_2_ID,
  STAGE_2_VERSION,
} from "./extraction-result.js";
import type {
  Stage2Result,
  Stage2Success,
  Stage2Failure,
} from "./extraction-result.js";
import type { ExtractionRecord, RejectionRecord } from "./extraction-record.js";
import { segmentContent } from "./segment-content.js";
import { classifySegments } from "./classify-segments.js";
import { makeStatementId } from "./statement-identifiers.js";
import { validateAllSpans } from "./span-integrity.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Version of the extraction rules applied at Stage 2.
 * Bumped when logic changes that could alter which segments are included or excluded.
 */
export const EXTRACTION_RULE_VERSION = "1.0.0" as const;

// ---------------------------------------------------------------------------
// Result constructors
// ---------------------------------------------------------------------------

function makeStage2Failure(
  errors: ReadonlyArray<DraValidationError>,
): Stage2Failure {
  // Sort deterministically by path then code
  const sorted = [...errors].sort((a, b) => {
    const pathCmp = a.path.localeCompare(b.path);
    if (pathCmp !== 0) return pathCmp;
    return a.code.localeCompare(b.code);
  });
  return Object.freeze({
    ok: false as const,
    stageId: STAGE_2_ID,
    errors: Object.freeze(sorted),
    errorCount: sorted.length,
  });
}

function makeStage2Success(
  evaluationId: string,
  generatedDocumentId: string,
  statements: ReadonlyArray<MaterialStatement>,
  extractionRecord: ExtractionRecord,
  warnings: ReadonlyArray<string>,
): Stage2Success {
  return Object.freeze({
    ok: true as const,
    stageId: STAGE_2_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    evaluationId,
    generatedDocumentId,
    statements: Object.freeze([...statements]),
    extractionRecord: Object.freeze(extractionRecord),
    warnings: Object.freeze([...warnings]),
  });
}

// ---------------------------------------------------------------------------
// extractClaims — Stage 2 entry point
// ---------------------------------------------------------------------------

/**
 * Stage 2 of the DRA evaluator pipeline: Claim Extraction.
 *
 * Accepts the canonical normalised evaluation request produced by Stage 1
 * and extracts candidate material statements from the generated document.
 *
 * Never throws for ordinary content or validation failures.
 *
 * Processing steps (in order):
 *   1. Input validation (structural check on normalisedRequest).
 *   2. Content segmentation (deterministic rule-based segmenter).
 *   3. Segment classification (candidate vs excluded).
 *   4. Statement construction (deterministic IDs, span references).
 *   5. ID collision check (should not occur with the s2:{start}:{end} scheme).
 *   6. Span integrity validation (verify content.slice(start, end) === text).
 *   7. Build extraction record.
 *
 * Zero extracted statements is valid and returns Stage2Success with an empty
 * statements array. It does not produce SUPPORTED, REVIEW, or HOLD.
 *
 * @param normalisedRequest - The canonical Stage 1 normalised evaluation request.
 * @returns Stage2Result — use `result.ok` to discriminate success/failure.
 */
export function extractClaims(
  normalisedRequest: NormalisedEvaluationRequest,
): Stage2Result {
  // -------------------------------------------------------------------------
  // Step 1: Input validation
  // -------------------------------------------------------------------------

  if (
    normalisedRequest === null ||
    normalisedRequest === undefined ||
    typeof normalisedRequest !== "object"
  ) {
    return makeStage2Failure([
      {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path: "normalisedRequest",
        message:
          "Stage 2 requires a canonical NormalisedEvaluationRequest from Stage 1; received invalid input",
        received: typeof normalisedRequest,
      },
    ]);
  }

  const request = normalisedRequest as NormalisedEvaluationRequest;

  // Validate generatedDocument presence and content
  if (
    !request.generatedDocument ||
    typeof request.generatedDocument !== "object"
  ) {
    return makeStage2Failure([
      {
        code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
        path: "normalisedRequest.generatedDocument",
        message: "Stage 2 requires a generatedDocument in the normalised request",
      },
    ]);
  }

  const content = request.generatedDocument.content;
  const evaluationId = String(request.id);
  const generatedDocumentId = String(request.generatedDocument.id);

  if (typeof content !== "string") {
    return makeStage2Failure([
      {
        code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
        path: "normalisedRequest.generatedDocument.content",
        message:
          "Stage 2 requires a string content field in the normalised generated document",
        received: typeof content,
      },
    ]);
  }

  // -------------------------------------------------------------------------
  // Step 2: Content segmentation
  // -------------------------------------------------------------------------
  const allSegments = segmentContent(content);

  // -------------------------------------------------------------------------
  // Step 2b: Evaluation boundary filtering (optional)
  //
  // When the caller provides an evaluationBoundary, retain only segments
  // whose spans lie entirely within [startOffset, endOffset).  Segments
  // outside the boundary are silently discarded — they never reach the
  // classifier or downstream pipeline stages.
  //
  // When no boundary is present the full segment array is used unchanged,
  // preserving existing behaviour exactly (backwards-compatible).
  //
  // Absolute character offsets in retained segments remain valid: the span
  // integrity check at Step 6 uses the full content string, so
  // content.slice(seg.startOffset, seg.endOffset) === seg.text still holds.
  // -------------------------------------------------------------------------
  const boundary = request.evaluationBoundary;
  let workingSegments = allSegments;
  let boundaryApplied = false;

  if (boundary !== undefined) {
    const { startOffset: bStart, endOffset: bEnd } = boundary;

    // Runtime check: boundary must fit within the actual document length.
    // The schema ensures startOffset < endOffset; here we also verify that
    // endOffset does not exceed the content length (unknown at parse time).
    if (bStart < 0 || bEnd > content.length || bStart >= bEnd) {
      return makeStage2Failure([
        {
          code: DRA_ERROR_CODES.INVALID_SPAN,
          path: "normalisedRequest.evaluationBoundary",
          message:
            `Evaluation boundary [${bStart}, ${bEnd}) is invalid for document ` +
            `length ${content.length}: startOffset must be ≥ 0, endOffset must ` +
            `be ≤ ${content.length}, and startOffset must be < endOffset`,
          received: `[${bStart}, ${bEnd})`,
        },
      ]);
    }

    // Keep only segments entirely within the boundary.
    workingSegments = allSegments.filter(
      (seg) => seg.startOffset >= bStart && seg.endOffset <= bEnd,
    );
    boundaryApplied = true;
  }

  // -------------------------------------------------------------------------
  // Step 3: Segment classification
  // -------------------------------------------------------------------------
  const classified = classifySegments(workingSegments);
  const candidates = classified.filter((c) => c.status === "CANDIDATE");
  const excluded = classified.filter((c) => c.status === "EXCLUDED");

  // -------------------------------------------------------------------------
  // Step 4: Statement construction
  // -------------------------------------------------------------------------
  const statements: MaterialStatement[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]!;
    const seg = candidate.segment;

    // Generate deterministic statement ID
    const rawId = `s2:${seg.startOffset}:${seg.endOffset}`;
    const statementId = StatementIdSchema.parse(rawId);

    // -------------------------------------------------------------------------
    // Step 5: ID collision check
    // -------------------------------------------------------------------------
    if (seenIds.has(rawId)) {
      // This should not occur with the s2:{start}:{end} scheme since
      // the classifier excludes duplicate spans before this point.
      // Guard included as a defensive invariant check.
      warnings.push(
        `Statement ID collision at span [${seg.startOffset}, ${seg.endOffset}); ` +
          `statement skipped. This indicates a segmenter defect.`,
      );
      continue;
    }
    seenIds.add(rawId);

    const statement: MaterialStatement = {
      id: statementId,
      text: seg.text,
      statementIndex: i,
      spanRef: {
        startOffset: seg.startOffset,
        endOffset: seg.endOffset,
      },
      // linkedEvidenceUnitIds: populated at Stage 4. Empty at Stage 2.
      linkedEvidenceUnitIds: [],
      // materiality: not assessed at Stage 2. Deferred to later stages.
      // stageMetadata: not required at Stage 2.
    };

    statements.push(statement);
  }

  // -------------------------------------------------------------------------
  // Step 6: Span integrity validation
  //
  // Uses the full content string (not the boundary-sliced view) so that
  // content.slice(seg.startOffset, seg.endOffset) resolves correctly for
  // segments whose absolute offsets were preserved from the full segmenter.
  // -------------------------------------------------------------------------
  const spanErrors = validateAllSpans(statements, content);
  if (spanErrors.length > 0) {
    // Span integrity failure is a Stage 2 internal error, not a user error.
    // Return failure to prevent downstream stages from using corrupt data.
    return makeStage2Failure(spanErrors);
  }

  // -------------------------------------------------------------------------
  // Step 7: Build rejection records and extraction record
  // -------------------------------------------------------------------------
  const rejectionRecords: RejectionRecord[] = excluded
    .filter((c) => c.exclusionReason !== undefined && c.segment.text.length > 0)
    .sort((a, b) => a.segment.startOffset - b.segment.startOffset)
    .map((c) => ({
      reason: c.exclusionReason!,
      segmentSnippet:
        c.segment.text.length > 120
          ? c.segment.text.slice(0, 120) + "…"
          : c.segment.text,
      startOffset: c.segment.startOffset,
      endOffset: c.segment.endOffset,
    }));

  const extractionRecord: ExtractionRecord = Object.freeze({
    stageId: STAGE_2_ID,
    stageVersion: STAGE_2_VERSION,
    extractionRuleVersion: EXTRACTION_RULE_VERSION,
    evaluationId,
    generatedDocumentId,
    documentLength: content.length,
    // segmentCount reflects ALL segments produced by the segmenter from the
    // full document.  When a boundary is applied, boundaryFilteredSegmentCount
    // records how many were discarded before classification.
    segmentCount: allSegments.length,
    candidateStatementCount: statements.length,
    ignoredSegmentCount: excluded.length,
    rejectionRecords: Object.freeze(rejectionRecords),
    warnings: Object.freeze([...warnings]),
    // Boundary fields — always present; optional detail only when applied.
    boundaryApplied,
    ...(boundaryApplied && boundary !== undefined
      ? {
          boundaryStartOffset: boundary.startOffset,
          boundaryEndOffset: boundary.endOffset,
          boundaryFilteredSegmentCount:
            allSegments.length - workingSegments.length,
        }
      : {}),
  });

  return makeStage2Success(
    evaluationId,
    generatedDocumentId,
    statements,
    extractionRecord,
    warnings,
  );
}
