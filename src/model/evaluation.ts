/**
 * DRA-001 — Evaluation Request and Evaluation Result Representations
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 * Corrected: DRA-ENG-002A — Canonical Model Ambiguity Resolution
 *
 * Defines:
 *   - EvaluationRequest — canonical Version 1 evaluation request.
 *   - EvaluationResult  — canonical Version 1 evaluation result.
 *
 * Explicit exclusions:
 *   - No evaluation request processing.
 *   - No result generation from document content.
 *   - No AI model calls.
 *   - No pipeline execution.
 *
 * DRA-ENG-002A note on ConfidenceIndicator:
 *   DRA-001 §5 Stage 6 states "the confidence score is a structured
 *   classification, not a numeric probability" but does NOT enumerate
 *   specific classification values. HIGH | MEDIUM | LOW are therefore
 *   inferred values with no specification authority.
 *
 *   ConfidenceIndicator is DEFERRED and NON-NORMATIVE. It is not part of
 *   the active canonical Version 1 model. It is not exported from the
 *   canonical model surface and is not used by any canonical entity.
 *   Concrete confidence classification values will be defined at
 *   DRA-ENG-008 (Confidence Scoring stage implementation).
 *
 *   See AMBIGUITY-002 disposition in DRA-ENG-002AR.
 */

import { z } from "zod";
import {
  EvaluationIdSchema,
  EvaluationResultIdSchema,
} from "./identifiers.js";
import { SourceDocumentSchema } from "./documents.js";
import { GeneratedDocumentSchema } from "./documents.js";
import { MaterialStatementSchema } from "./statements.js";
import { EvidenceUnitSchema, EvidenceRelationshipSchema } from "./evidence.js";
import { DraIssueSchema } from "./issues.js";
import { ProofReceiptSchema, StageRecordSchema } from "./proof-receipts.js";
import { AssuranceDecisionSchema } from "./decisions.js";
import { SchemaVersionSchema } from "./versions.js";
import { PIPELINE_STAGE_COUNT } from "./pipeline-stages.js";

// ---------------------------------------------------------------------------
// DEFERRED — ConfidenceIndicator (Stage 6 output per claim)
//
// STATUS: NON-NORMATIVE. Not part of the active canonical Version 1 model.
//         Not exported from model/index.ts.
//         Not used by any canonical Version 1 entity.
//         Will be defined at DRA-ENG-008 when Stage 6 is implemented.
//
// Specification authority: DRA-001 §5 Stage 6 states "a structured
// classification, not a numeric probability." No specific values are
// enumerated. HIGH | MEDIUM | LOW is inferred only.
//
// Do not reference these symbols in canonical Version 1 code.
// Do not import these symbols from model/index.ts (they are not exported).
// ---------------------------------------------------------------------------

/** @deprecated Non-normative. Deferred to DRA-ENG-008. Not exported. */
export const _DEFERRED_CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;
/** @deprecated Non-normative. Deferred to DRA-ENG-008. Not exported. */
export type _DeferredConfidenceLevel =
  (typeof _DEFERRED_CONFIDENCE_LEVELS)[number];

/** @deprecated Non-normative. Deferred to DRA-ENG-008. Not exported. */
export const _DeferredConfidenceLevelSchema = z.enum(
  _DEFERRED_CONFIDENCE_LEVELS as unknown as [string, ...string[]],
);

/** @deprecated Non-normative. Deferred to DRA-ENG-008. Not exported. */
export const _DeferredConfidenceIndicatorSchema = z.object({
  statementId: z.string().min(1),
  level: _DeferredConfidenceLevelSchema,
  note: z.string().optional(),
});

/** @deprecated Non-normative. Deferred to DRA-ENG-008. Not exported. */
export type _DeferredConfidenceIndicator = z.infer<
  typeof _DeferredConfidenceIndicatorSchema
>;

// ---------------------------------------------------------------------------
// Evaluation request schema
// ---------------------------------------------------------------------------

/**
 * A canonical DRA evaluation request.
 * Carries all inputs required by the future evaluator.
 * Must be structurally complete to pass validation.
 *
 * Structural completeness requirements:
 *   - id must be non-empty.
 *   - generatedDocument must be valid.
 *   - sourceDocuments must be a valid array (may be empty at request time,
 *     but the evaluator requires at least one before Stage 4).
 *   - requestedAt must be a valid UTC ISO-8601 timestamp.
 */
export const EvaluationRequestSchema = z
  .object({
    /** Unique identifier for this evaluation request. */
    id: EvaluationIdSchema,

    /** The generated document to be evaluated. */
    generatedDocument: GeneratedDocumentSchema,

    /**
     * Source (reference) documents available to the evaluator.
     * Used by Stages 3 (Authority Resolution) and 4 (Evidence Linkage).
     * Version 1: at least one source document is expected for a complete
     * evaluation; the request accepts zero to permit staged ingestion.
     */
    sourceDocuments: z.array(SourceDocumentSchema).default([]),

    /**
     * ISO-8601 UTC timestamp at which the evaluation was requested.
     */
    requestedAt: z.string().datetime({ offset: false }),

    /**
     * Opaque metadata about the requester or request context.
     * Must not contain secrets, credentials, or PII.
     */
    requesterMetadata: z.record(z.string(), z.unknown()).optional(),

    /**
     * Optional character-range boundary restricting Stage 2 claim extraction
     * to a declared sub-section of the generated document.
     *
     * When present, Stage 2 retains only segments whose spans are entirely
     * within [startOffset, endOffset).  Segments outside the boundary are
     * not classified and do not enter the downstream pipeline.
     *
     * When absent, extraction covers the full normalised document content
     * (existing behaviour, fully backwards-compatible).
     *
     * Offsets are zero-based UTF-16 code-unit positions into the normalised
     * generated-document content string (same coordinate system used by
     * ContentSegment.startOffset / endOffset and MaterialStatement.spanRef).
     *
     * Validation:
     *   - startOffset must be ≥ 0.
     *   - endOffset must be > 0.
     *   - startOffset must be strictly less than endOffset.
     *   - endOffset ≤ content.length is enforced by Stage 2 at runtime
     *     (document length is not known at schema-parse time).
     */
    evaluationBoundary: z
      .object({
        /** First character to include (inclusive, zero-based). */
        startOffset: z.number().int().nonnegative(),
        /** First character to exclude (exclusive, zero-based). */
        endOffset: z.number().int().positive(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Structural completeness: id must match a non-empty string (already enforced by schema).
    // Additional structural checks:
    if (!data.generatedDocument) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "EvaluationRequest: generatedDocument is required",
        path: ["generatedDocument"],
      });
    }

    // Boundary cross-field: startOffset must be strictly less than endOffset.
    if (
      data.evaluationBoundary !== undefined &&
      data.evaluationBoundary.startOffset >= data.evaluationBoundary.endOffset
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          `EvaluationRequest: evaluationBoundary.startOffset (${data.evaluationBoundary.startOffset}) ` +
          `must be strictly less than endOffset (${data.evaluationBoundary.endOffset})`,
        path: ["evaluationBoundary", "startOffset"],
      });
    }
  });

export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;

// ---------------------------------------------------------------------------
// Evaluation result schema
// ---------------------------------------------------------------------------

/**
 * A canonical DRA evaluation result.
 * Produced by a completed evaluation run. Contains all structured outputs
 * from the seven-stage pipeline.
 *
 * The evaluation result is the comprehensive intermediate record.
 * The proof receipt is the frozen, externally-shared summary derived from it.
 *
 * Note: confidenceIndicators is not present in the Version 1 canonical result.
 * Confidence classification values are deferred to DRA-ENG-008. The concept
 * is defined in Stage 6 of the pipeline but the classification type is not
 * yet specified by DRA-001.
 */
export const EvaluationResultSchema = z
  .object({
    /** Unique identifier for this evaluation result record. */
    id: EvaluationResultIdSchema,

    /** Identifier of the evaluation request that produced this result. */
    evaluationRequestId: EvaluationIdSchema,

    /**
     * Schema version of this result record.
     * Must be a recognised DRA schema version.
     */
    schemaVersion: SchemaVersionSchema,

    /**
     * The assurance decision for the evaluated document.
     * One of: SUPPORTED, REVIEW, HOLD.
     */
    decision: AssuranceDecisionSchema,

    /**
     * All assurance issues triggered during evaluation.
     * Empty when the decision is SUPPORTED.
     */
    issues: z.array(DraIssueSchema),

    /**
     * All material statements (claims) identified during Stage 2
     * and carried through the pipeline.
     */
    statements: z.array(MaterialStatementSchema),

    /**
     * All evidence units resolved during Stage 4.
     */
    evidenceUnits: z.array(EvidenceUnitSchema),

    /**
     * All evidence relationships established during Stage 4.
     */
    evidenceRelationships: z.array(EvidenceRelationshipSchema),

    /**
     * Ordered stage records from all seven pipeline stages.
     * Must contain exactly PIPELINE_STAGE_COUNT (7) records.
     */
    stageRecords: z
      .array(StageRecordSchema)
      .length(
        PIPELINE_STAGE_COUNT,
        `EvaluationResult must contain exactly ${PIPELINE_STAGE_COUNT} stage records`,
      ),

    /**
     * The proof receipt generated by Stage 7.
     * Required for a complete evaluation result.
     */
    proofReceipt: ProofReceiptSchema,

    /**
     * ISO-8601 UTC timestamp at which the evaluation completed.
     */
    completedAt: z.string().datetime({ offset: false }),

    /**
     * Non-blocking warnings or validation notes produced during evaluation.
     * Does not affect the decision. Optional.
     */
    warnings: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    // Internal consistency: proof receipt decision must match the result decision.
    if (data.proofReceipt.decision !== data.decision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `EvaluationResult: proofReceipt.decision (${data.proofReceipt.decision}) must match result decision (${data.decision})`,
        path: ["proofReceipt", "decision"],
      });
    }

    // Internal consistency: proof receipt evaluationResultId must match this result's id.
    if (data.proofReceipt.evaluationResultId !== data.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `EvaluationResult: proofReceipt.evaluationResultId must match result id`,
        path: ["proofReceipt", "evaluationResultId"],
      });
    }

    // Internal consistency: proof receipt evaluationRequestId must match this result's evaluationRequestId.
    if (data.proofReceipt.evaluationRequestId !== data.evaluationRequestId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `EvaluationResult: proofReceipt.evaluationRequestId must match result evaluationRequestId`,
        path: ["proofReceipt", "evaluationRequestId"],
      });
    }
  });

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateEvaluationRequest(
  value: unknown,
): z.SafeParseReturnType<unknown, EvaluationRequest> {
  return EvaluationRequestSchema.safeParse(value);
}

export function validateEvaluationResult(
  value: unknown,
): z.SafeParseReturnType<unknown, EvaluationResult> {
  return EvaluationResultSchema.safeParse(value);
}
