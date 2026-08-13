/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: request.ts — Acquisition request validation and helpers
 *
 * Validates and freezes AcquisitionRequest objects.
 * Input objects are never mutated; output is always deeply frozen.
 */

import {
  AcquisitionRequestSchema,
  type AcquisitionRequest,
  type AcquisitionPipelineError,
} from "./schema.js";

// ---------------------------------------------------------------------------
// RequestValidationResult
// ---------------------------------------------------------------------------

export type RequestValidationResult =
  | { readonly ok: true; readonly request: AcquisitionRequest }
  | { readonly ok: false; readonly errors: readonly AcquisitionPipelineError[] };

// ---------------------------------------------------------------------------
// createAcquisitionRequest
// ---------------------------------------------------------------------------

/**
 * Validates and freezes an acquisition request.
 *
 * The input object is never mutated. On success the returned request is
 * deeply frozen. On failure a structured list of typed errors is returned;
 * no exception is thrown for expected validation failures.
 *
 * @param raw  Raw input — may be any value; Zod validates the structure.
 * @returns    RequestValidationResult.
 */
export function createAcquisitionRequest(
  raw: unknown,
): RequestValidationResult {
  const parsed = AcquisitionRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: AcquisitionPipelineError[] = parsed.error.issues.map(
      (issue) => ({
        code: "INVALID_REQUEST",
        message: issue.message,
        stage: "REQUEST" as const,
        detail: issue.path.length > 0 ? issue.path.join(".") : undefined,
      }),
    );
    return { ok: false, errors };
  }

  return {
    ok: true,
    request: Object.freeze({ ...parsed.data }) as AcquisitionRequest,
  };
}

// ---------------------------------------------------------------------------
// validateSourceUrl
// ---------------------------------------------------------------------------

/**
 * Validates that a URL string uses an HTTP or HTTPS scheme.
 * Returns ok:true on success, or ok:false with a reason string on failure.
 * Never throws.
 */
export function validateSourceUrl(
  url: string,
): { ok: true } | { ok: false; reason: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        ok: false,
        reason: `Unsupported URL scheme "${parsed.protocol}". Only http: and https: are accepted.`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: `Invalid URL: ${url}` };
  }
}

// ---------------------------------------------------------------------------
// formatAcquisitionId
// ---------------------------------------------------------------------------

/**
 * Formats a non-negative integer as a DRA-ACQ-NNNNNN identifier.
 *
 * @example formatAcquisitionId(1) → "DRA-ACQ-000001"
 */
export function formatAcquisitionId(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new Error(
      `Invalid sequence number for acquisition ID: ${sequence}. Must be a non-negative integer.`,
    );
  }
  return `DRA-ACQ-${String(sequence).padStart(6, "0")}`;
}
