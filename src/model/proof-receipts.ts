/**
 * DRA-001 — Proof Receipt Representation
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical proof receipt data structure required by DRA-001 §8.
 * A proof receipt is the frozen, immutable record produced by every evaluation.
 *
 * DRA-001 §8 mandatory fields:
 *   1. Document identity
 *   2. Evaluator identity
 *   3. Stage outputs (all seven pipeline stages, in order)
 *   4. Issue register
 *   5. Decision
 *   6. Decision rationale
 *   7. Timestamp (UTC)
 *   8. Receipt identifier (unique)
 *
 * Explicit exclusions:
 *   - No proof-receipt generation logic.
 *   - No cryptographic signing.
 *   - Content hashing field is defined (per §8.1) but the hash function
 *     is not implemented at this milestone.
 */

import { z } from "zod";
import {
  ProofReceiptIdSchema,
  EvaluationIdSchema,
  EvaluationResultIdSchema,
  GeneratedDocumentIdSchema,
} from "./identifiers.js";
import { AssuranceDecisionSchema } from "./decisions.js";
import { DraIssueSchema, IssueSummarySchema } from "./issues.js";
import {
  PIPELINE_STAGE_COUNT,
  PipelineStageNameSchema,
  PipelineStageNumberSchema,
} from "./pipeline-stages.js";
import { SchemaVersionSchema, DRA_PIPELINE_VERSION } from "./versions.js";

// ---------------------------------------------------------------------------
// Document identity (DRA-001 §8.1)
// ---------------------------------------------------------------------------

export const DocumentIdentitySchema = z.object({
  /** Identifier of the generated document that was evaluated. */
  generatedDocumentId: GeneratedDocumentIdSchema,

  /**
   * Title of the generated document at the time of evaluation.
   * Frozen in the receipt; not modified if the document title later changes.
   */
  generatedDocumentTitle: z
    .string()
    .min(1, "Document title must not be empty"),

  /**
   * Cryptographic hash (SHA-256 hex) of the evaluated document content.
   * Field defined per DRA-001 §8.1. Populated by Stage 7 when computed.
   * May be absent in pre-Stage-7 partial receipts or test fixtures.
   */
  contentHash: z.string().optional(),

  /**
   * ISO-8601 UTC timestamp at which the document was submitted for evaluation.
   * Canonical format: "YYYY-MM-DDTHH:mm:ss.sssZ" (UTC, Z suffix required at
   * issuance).  The schema also accepts bare local-time strings for fixtures;
   * production receipts always carry the Z designator.
   */
  evaluatedAt: z.string().datetime({ offset: true }),
});

export type DocumentIdentity = z.infer<typeof DocumentIdentitySchema>;

// ---------------------------------------------------------------------------
// Evaluator identity (DRA-001 §8.2)
// ---------------------------------------------------------------------------

export const EvaluatorIdentitySchema = z.object({
  /**
   * DRA evaluator schema/model version.
   * Must be a recognised version value.
   */
  evaluatorVersion: SchemaVersionSchema,

  /**
   * Git commit identifier of the evaluator at the time of evaluation.
   * Optional for Version 1; populated when available.
   */
  commitIdentifier: z.string().optional(),

  /**
   * DRA pipeline version. Corresponds to DRA_PIPELINE_VERSION.
   * Frozen for Version 1.
   */
  pipelineVersion: z.string().min(1),
});

export type EvaluatorIdentity = z.infer<typeof EvaluatorIdentitySchema>;

/** Canonical evaluator identity for Version 1 (pipeline version pre-filled). */
export const DEFAULT_EVALUATOR_PIPELINE_VERSION = DRA_PIPELINE_VERSION;

// ---------------------------------------------------------------------------
// Stage record (DRA-001 §8.3)
// ---------------------------------------------------------------------------

/**
 * The record of a single pipeline stage's execution within the proof receipt.
 * Exactly seven stage records must appear, in stage-number order (1–7).
 *
 * The `output` field carries the stage-specific structured output.
 * Its exact shape is defined at DRA-ENG-003 through DRA-ENG-009.
 * For Version 1 data-model purposes, it is typed as an opaque record.
 */
export const StageRecordSchema = z.object({
  /** Stage position (1–7, frozen order). */
  stageNumber: PipelineStageNumberSchema,

  /** Canonical stage name matching the stageNumber. Source: DRA-001 §5. */
  stageName: PipelineStageNameSchema,

  /**
   * Structured output of this pipeline stage.
   * Shape is stage-specific; typed as opaque record at DRA-ENG-002.
   * Must not be empty object unless the stage has no output at this
   * evaluation (e.g. early termination scenarios — out of Version 1 scope).
   */
  output: z.record(z.string(), z.unknown()),
});

export type StageRecord = z.infer<typeof StageRecordSchema>;

// ---------------------------------------------------------------------------
// Proof receipt schema (DRA-001 §8)
// ---------------------------------------------------------------------------

/**
 * A DRA proof receipt. Produced for every evaluation regardless of outcome.
 * Frozen and immutable after issuance. A new evaluation produces a new receipt;
 * prior receipts are never overwritten or amended.
 */
export const ProofReceiptSchema = z.object({
  /** Unique identifier for this proof receipt. Field: DRA-001 §8.8. */
  id: ProofReceiptIdSchema,

  /** Identifier of the evaluation request this receipt corresponds to. */
  evaluationRequestId: EvaluationIdSchema,

  /** Identifier of the evaluation result record this receipt summarises. */
  evaluationResultId: EvaluationResultIdSchema,

  /** Schema version of this proof receipt. Field: DRA-001 §8.2 (evaluator version). */
  schemaVersion: SchemaVersionSchema,

  /** Identity of the evaluated document. Field: DRA-001 §8.1. */
  documentIdentity: DocumentIdentitySchema,

  /** Identity of the evaluator that produced this receipt. Field: DRA-001 §8.2. */
  evaluatorIdentity: EvaluatorIdentitySchema,

  /**
   * Ordered outputs of all seven pipeline stages. Field: DRA-001 §8.3.
   * Must contain exactly PIPELINE_STAGE_COUNT (7) records, in stage-number order.
   */
  stageOutputs: z
    .array(StageRecordSchema)
    .length(
      PIPELINE_STAGE_COUNT,
      `Proof receipt must contain exactly ${PIPELINE_STAGE_COUNT} stage records`,
    ),

  /**
   * All assurance issues triggered during evaluation. Field: DRA-001 §8.4.
   * Empty array when the decision is SUPPORTED (no issues).
   */
  issueRegister: z.array(DraIssueSchema),

  /** Computed summary counts of issues by severity. */
  issueSummary: IssueSummarySchema,

  /**
   * The assurance decision for this evaluation. Field: DRA-001 §8.5.
   * One of: SUPPORTED, REVIEW, HOLD.
   */
  decision: AssuranceDecisionSchema,

  /**
   * Human-readable rationale for the decision. Field: DRA-001 §8.6.
   * Derived from stage outputs and issue register. Must not be empty.
   */
  decisionRationale: z
    .string()
    .min(1, "Decision rationale must not be empty"),

  /**
   * UTC ISO-8601 timestamp of this evaluation. Field: DRA-001 §8.7.
   * Canonical format: "YYYY-MM-DDTHH:mm:ss.sssZ" (UTC, Z suffix required at
   * issuance).  Operational metadata — excluded from the substantive digest.
   */
  timestamp: z.string().datetime({ offset: true }),

  /**
   * SHA-256 hex digest of the deterministic substantive payload.
   * Computed over all receipt fields except: id, timestamp,
   * documentIdentity.evaluatedAt, and substantiveDigest itself.
   * Verifiable with verifyReceiptIntegrity() from pipeline/canonical-serialise.
   * Field: DRA-001 §8.1 (content integrity).
   */
  substantiveDigest: z
    .string()
    .length(64, "Substantive digest must be a 64-character SHA-256 hex string"),
});

export type ProofReceipt = z.infer<typeof ProofReceiptSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateProofReceipt(
  value: unknown,
): z.SafeParseReturnType<unknown, ProofReceipt> {
  return ProofReceiptSchema.safeParse(value);
}
