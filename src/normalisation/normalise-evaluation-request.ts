/**
 * DRA-001 — Stage 1: Input Normalisation — Entry Point
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * This module implements the single Stage 1 entry point:
 *
 *   normaliseEvaluationRequest(rawInput: unknown): Stage1Result
 *
 * It accepts unknown/untrusted input, validates it against the canonical
 * runtime model, applies all authorised normalisation transformations, and
 * returns a discriminated result.
 *
 * On success:  returns the canonical normalised request + normalisation record.
 * On failure:  returns deterministic structured errors. Never throws.
 *
 * Stage 1 must not:
 *   - Extract material statements
 *   - Determine what is material
 *   - Retrieve evidence
 *   - Detect any of the nine issue classes
 *   - Calculate severity, confidence, or decisions
 *   - Generate a proof receipt
 *   - Execute later pipeline stages
 */

import { z } from "zod";
import {
  EvaluationRequestSchema,
  DRA_MODEL_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_ERROR_CODES,
} from "../model/index.js";
import type { DraValidationError, EvaluationRequest } from "../model/index.js";
import {
  STAGE_1_ID,
  STAGE_1_VERSION,
} from "./stage1-types.js";
import type {
  Stage1Result,
  Stage1Success,
  Stage1Failure,
  NormalisedEvaluationRequest,
  NormalisationRecord,
  NormalisationEntityCounts,
} from "./stage1-types.js";
import {
  normaliseSourceDocuments,
  normaliseGeneratedDocument,
  checkSourceDocumentRefs,
  checkDocumentIdentitySeparation,
} from "./normalise-documents.js";
import { normaliseMaterialStatements } from "./normalise-statements.js";
import { normaliseEvidenceUnits, normaliseEvidenceRelationships } from "./normalise-evidence.js";

// ---------------------------------------------------------------------------
// Zod-to-DraValidationError conversion
// ---------------------------------------------------------------------------

/**
 * Maps a Zod issue to the closest matching DraValidationError.
 * Provides useful DRA error codes without losing Zod's path and message.
 */
function mapZodIssueToDraError(issue: z.ZodIssue): DraValidationError {
  const path = issue.path.map(String).join(".");

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (
        issue.received === "undefined" ||
        issue.received === "null"
      ) {
        return {
          code: DRA_ERROR_CODES.MISSING_REQUIRED_FIELD,
          path,
          message: issue.message,
          received: issue.received,
        };
      }
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
        received: issue.received,
      };

    case z.ZodIssueCode.too_small:
      if (issue.type === "string" && issue.minimum === 1) {
        return {
          code: DRA_ERROR_CODES.EMPTY_REQUIRED_STRING,
          path,
          message: issue.message,
        };
      }
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
      };

    case z.ZodIssueCode.invalid_string:
      if (
        "validation" in issue &&
        issue.validation === "datetime"
      ) {
        return {
          code: DRA_ERROR_CODES.INVALID_TIMESTAMP,
          path,
          message: issue.message,
        };
      }
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
      };

    case z.ZodIssueCode.invalid_enum_value:
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
        received: issue.received,
      };

    case z.ZodIssueCode.custom:
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
      };

    default:
      return {
        code: DRA_ERROR_CODES.STRUCTURALLY_INCOMPLETE_REQUEST,
        path,
        message: issue.message,
      };
  }
}

// ---------------------------------------------------------------------------
// Result constructors
// ---------------------------------------------------------------------------

function makeStage1Failure(
  errors: ReadonlyArray<DraValidationError>,
): Stage1Failure {
  return Object.freeze({
    ok: false as const,
    stageId: STAGE_1_ID,
    errors: Object.freeze([...errors]),
    errorCount: errors.length,
  });
}

function makeStage1Success(
  normalisedRequest: NormalisedEvaluationRequest,
  normalisationRecord: NormalisationRecord,
  warnings: ReadonlyArray<string>,
): Stage1Success {
  return Object.freeze({
    ok: true as const,
    stageId: STAGE_1_ID,
    pipelineVersion: DRA_PIPELINE_VERSION,
    modelVersion: DRA_MODEL_VERSION,
    normalisedRequest: Object.freeze(normalisedRequest),
    normalisationRecord: Object.freeze(normalisationRecord),
    warnings: Object.freeze([...warnings]),
  });
}

// ---------------------------------------------------------------------------
// normaliseEvaluationRequest — Stage 1 entry point
// ---------------------------------------------------------------------------

/**
 * Stage 1 of the DRA evaluator pipeline: Input Normalisation.
 *
 * Accepts unknown/untrusted input and returns a discriminated result:
 *   - On success: a normalised, canonical EvaluationRequest ready for Stage 2.
 *   - On failure: deterministic structured validation errors.
 *
 * Never throws for ordinary invalid input.
 *
 * Processing steps (in order):
 *   1. Structural validation via Zod (EvaluationRequestSchema).
 *   2. Document-identity separation check (generated ≠ source IDs).
 *   3. Source document duplicate-ID check.
 *   4. Normalise source documents (strings, content).
 *   5. Normalise generated document (strings, content).
 *   6. Source document reference integrity (sourceDocumentIds).
 *   7. Deterministic ordering (source documents sorted by id).
 *   8. Build normalisation record.
 *
 * @param rawInput - Untrusted runtime input. May be any value.
 * @returns Stage1Result — use `result.ok` to discriminate success/failure.
 */
export function normaliseEvaluationRequest(rawInput: unknown): Stage1Result {
  // -------------------------------------------------------------------------
  // Step 1: Structural validation via Zod
  // -------------------------------------------------------------------------
  const parseResult = EvaluationRequestSchema.safeParse(rawInput);

  if (!parseResult.success) {
    const draErrors: DraValidationError[] = parseResult.error.errors.map(
      mapZodIssueToDraError,
    );
    // Sort errors deterministically: by path then by code
    draErrors.sort((a, b) => {
      const pathCmp = a.path.localeCompare(b.path);
      if (pathCmp !== 0) return pathCmp;
      return a.code.localeCompare(b.code);
    });
    return makeStage1Failure(draErrors);
  }

  const parsed: EvaluationRequest = parseResult.data;

  const allErrors: DraValidationError[] = [];
  const allWarnings: string[] = [];
  const allFieldsNormalised: string[] = [];
  const collectionsReordered: string[] = [];

  // -------------------------------------------------------------------------
  // Step 2: Document-identity separation check
  // -------------------------------------------------------------------------
  const sourceDocIdSet = new Set<string>(
    parsed.sourceDocuments.map((d) => d.id),
  );
  const identitySepErrors = checkDocumentIdentitySeparation(
    parsed.generatedDocument.id,
    sourceDocIdSet,
  );
  allErrors.push(...identitySepErrors);

  // -------------------------------------------------------------------------
  // Step 3: Source document duplicate-ID check + normalisation
  // -------------------------------------------------------------------------
  const {
    documents: normalisedSourceDocs,
    errors: sourceDocErrors,
    fieldsNormalised: sourceDocFields,
    reordered: sourceDocsReordered,
  } = normaliseSourceDocuments(parsed.sourceDocuments);

  allErrors.push(...sourceDocErrors);
  allFieldsNormalised.push(...sourceDocFields);
  if (sourceDocsReordered) {
    collectionsReordered.push("sourceDocuments");
  }

  // -------------------------------------------------------------------------
  // Step 4: Normalise generated document
  // -------------------------------------------------------------------------
  const {
    document: normalisedGenDoc,
    fieldsNormalised: genDocFields,
  } = normaliseGeneratedDocument(parsed.generatedDocument);
  allFieldsNormalised.push(...genDocFields);

  // -------------------------------------------------------------------------
  // Step 5: Source document reference integrity check
  //          (sourceDocumentIds in generatedDocument)
  // -------------------------------------------------------------------------
  const normalisedSourceDocIdSet = new Set<string>(
    normalisedSourceDocs.map((d) => d.id),
  );
  const refErrors = checkSourceDocumentRefs(
    parsed.generatedDocument.sourceDocumentIds,
    normalisedSourceDocIdSet,
  );
  allErrors.push(...refErrors);

  // -------------------------------------------------------------------------
  // Note: Statement and evidence normalisation — not applicable at Stage 1
  //
  // The canonical EvaluationRequest does not carry MaterialStatements,
  // EvidenceUnits, or EvidenceRelationships. These are produced by later stages
  // (Stage 2 and Stage 4). The normalisation functions are available in
  // normalise-statements.ts and normalise-evidence.ts for downstream use.
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Step 6: Return failure if any errors were collected
  // -------------------------------------------------------------------------
  if (allErrors.length > 0) {
    // Sort errors deterministically by path then code
    allErrors.sort((a, b) => {
      const pathCmp = a.path.localeCompare(b.path);
      if (pathCmp !== 0) return pathCmp;
      return a.code.localeCompare(b.code);
    });
    return makeStage1Failure(allErrors);
  }

  // -------------------------------------------------------------------------
  // Step 7: Build normalised request
  // -------------------------------------------------------------------------

  // Rebuild the request from normalised components.
  // requesterMetadata is preserved exactly (opaque metadata).
  const normalisedRequest: NormalisedEvaluationRequest = {
    id: parsed.id,
    generatedDocument: normalisedGenDoc,
    sourceDocuments: normalisedSourceDocs,
    requestedAt: parsed.requestedAt,
    requesterMetadata: parsed.requesterMetadata,
    // DRA-FIX-001: preserve optional evaluation boundary so Stage 2 can
    // restrict claim extraction to the approved character range.
    ...(parsed.evaluationBoundary !== undefined
      ? { evaluationBoundary: parsed.evaluationBoundary }
      : {}),
  };

  // -------------------------------------------------------------------------
  // Step 8: Build normalisation record
  // -------------------------------------------------------------------------
  const inputEntityCounts: NormalisationEntityCounts = {
    sourceDocuments: parsed.sourceDocuments.length,
    statements: 0,
    evidenceUnits: 0,
    evidenceRelationships: 0,
  };

  const outputEntityCounts: NormalisationEntityCounts = {
    sourceDocuments: normalisedSourceDocs.length,
    statements: 0,
    evidenceUnits: 0,
    evidenceRelationships: 0,
  };

  const uniqueFieldsNormalised = [...new Set(allFieldsNormalised)].sort();

  const normalisationRecord: NormalisationRecord = {
    stageId: STAGE_1_ID,
    stageVersion: STAGE_1_VERSION,
    outputModelVersion: DRA_MODEL_VERSION,
    outputPipelineVersion: DRA_PIPELINE_VERSION,
    fieldsNormalised: Object.freeze(uniqueFieldsNormalised),
    collectionsReordered: Object.freeze([...collectionsReordered]),
    inputEntityCounts,
    outputEntityCounts,
    warnings: Object.freeze([...allWarnings]),
  };

  return makeStage1Success(normalisedRequest, normalisationRecord, allWarnings);
}
