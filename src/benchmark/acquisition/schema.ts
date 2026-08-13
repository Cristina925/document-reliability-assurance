/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: schema.ts — Acquisition request and source-assessment schemas
 *
 * Defines typed contracts for acquisition requests, official-source assessments,
 * and pipeline error classification. Does not duplicate existing corpus, provenance,
 * or governance schemas.
 *
 * Boundary invariants:
 *   - acquisitionId must follow DRA-ACQ-NNNNNN format.
 *   - sourceUrl must use HTTP or HTTPS only.
 *   - requestedAt must be a parseable ISO-8601 datetime.
 *   - Official-source status must never be auto-set to VERIFIED by the machine.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Supported media types (used by fetcher and normalisation)
// ---------------------------------------------------------------------------

export const SUPPORTED_MEDIA_TYPES = [
  "text/html",
  "text/markdown",
  "text/plain",
  "application/pdf",
] as const;

export type SupportedMediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

export function isSupportedMediaType(value: string): value is SupportedMediaType {
  return (SUPPORTED_MEDIA_TYPES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Acquisition ID format — DRA-ACQ-NNNNNN
// ---------------------------------------------------------------------------

export const ACQUISITION_ID_REGEX = /^DRA-ACQ-\d{6}$/;

export const AcquisitionIdSchema = z
  .string()
  .regex(ACQUISITION_ID_REGEX, {
    message: "acquisitionId must match format DRA-ACQ-NNNNNN (e.g. DRA-ACQ-000001)",
  });

export type AcquisitionId = z.infer<typeof AcquisitionIdSchema>;

// ---------------------------------------------------------------------------
// ISO timestamp validator (shared)
// ---------------------------------------------------------------------------

function isIsoDatetime(s: string): boolean {
  return s.includes("T") && !isNaN(Date.parse(s));
}

// ---------------------------------------------------------------------------
// AcquisitionRequest
// ---------------------------------------------------------------------------

/**
 * A governed request to acquire and freeze a public document from a URL.
 *
 * Input objects must not be mutated after construction; output is always frozen.
 */
export const AcquisitionRequestSchema = z.object({
  /** Unique identifier for this acquisition request. Format: DRA-ACQ-NNNNNN. */
  acquisitionId: AcquisitionIdSchema,

  /**
   * URL of the source document to acquire.
   * Must use HTTP or HTTPS; other schemes (ftp, file, data) are rejected.
   */
  sourceUrl: z
    .string()
    .url({ message: "sourceUrl must be a valid URL" })
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      { message: "sourceUrl must use HTTP or HTTPS scheme" },
    ),

  /** Expected publisher name, used for provenance verification. */
  expectedPublisher: z.string().min(1).optional(),

  /** Expected document title, used for provenance verification. */
  expectedTitle: z.string().min(1).optional(),

  /** Expected version or revision identifier. */
  requestedVersion: z.string().min(1).optional(),

  /** Identity of the person or system originating this request. */
  requestedBy: z.string().min(1, { message: "requestedBy must not be empty" }),

  /** Timestamp of the request. Must be a parseable ISO-8601 datetime. */
  requestedAt: z
    .string()
    .refine(isIsoDatetime, {
      message: "requestedAt must be a valid ISO-8601 datetime string",
    }),
});

export type AcquisitionRequest = z.infer<typeof AcquisitionRequestSchema>;

// ---------------------------------------------------------------------------
// OfficialSourceAssessment
// ---------------------------------------------------------------------------

/**
 * The statuses a governed official-source assessment may carry.
 * Freeze eligibility requires VERIFIED.
 * The machine may collect evidence, but must not independently set VERIFIED.
 */
export const OFFICIAL_SOURCE_ASSESSMENT_STATUSES = [
  "VERIFIED",
  "REVIEW_REQUIRED",
  "REJECTED",
] as const;

export type OfficialSourceAssessmentStatus =
  (typeof OFFICIAL_SOURCE_ASSESSMENT_STATUSES)[number];

/**
 * A governed assessment of whether the document originates from an
 * authoritative official source. Must be performed by a human reviewer.
 *
 * Machine collection of evidence is permitted, but the machine may not
 * independently assign status VERIFIED.
 */
export const OfficialSourceAssessmentSchema = z
  .object({
    status: z.enum(
      OFFICIAL_SOURCE_ASSESSMENT_STATUSES as unknown as [string, ...string[]],
    ),
    /** Identity of the human reviewer who performed this assessment. */
    assessedBy: z.string().min(1, { message: "assessedBy must not be empty" }),
    /** ISO-8601 timestamp of the assessment. */
    assessedAt: z.string().refine(isIsoDatetime, {
      message: "assessedAt must be a valid ISO-8601 datetime string",
    }),
    /** Evidence items supporting the assessment. At least one required for VERIFIED. */
    evidence: z.array(z.string().min(1)),
    /** Optional assessor notes. */
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === "VERIFIED" && val.evidence.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        type: "array",
        inclusive: true,
        path: ["evidence"],
        message: "VERIFIED official-source assessment requires at least one evidence item",
      });
    }
  });

export type OfficialSourceAssessment = z.infer<typeof OfficialSourceAssessmentSchema>;

// ---------------------------------------------------------------------------
// Pipeline stage identifiers and error type
// ---------------------------------------------------------------------------

export const ACQUISITION_PIPELINE_STAGES = [
  "REQUEST",
  "ACQUISITION",
  "OFFICIAL_SOURCE",
  "LICENCE",
  "METADATA",
  "NORMALISATION",
  "INTEGRITY",
  "ELIGIBILITY",
  "FREEZE",
  "CORPUS_INTEGRATION",
  "EVALUATION",
  "RECEIPT",
] as const;

export type AcquisitionPipelineStage =
  (typeof ACQUISITION_PIPELINE_STAGES)[number];

export interface AcquisitionPipelineError {
  readonly code: string;
  readonly message: string;
  readonly stage: AcquisitionPipelineStage;
  readonly detail?: string;
}
