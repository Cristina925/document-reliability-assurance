/**
 * DRA-001 — Stage 1: Input Normalisation — Statement Normalisation
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Normalises MaterialStatement structures if they are present in the input.
 *
 * At Stage 1, the EvaluationRequest does not carry MaterialStatements —
 * statements are produced by Stage 2 (Claim Extraction). This module is
 * provided to:
 *   - Handle the (future or atypical) case where statements are pre-supplied
 *     in the request
 *   - Define the normalisation contract for downstream stages
 *
 * When called with an empty array, this module is a deterministic no-op.
 *
 * Permitted operations:
 *   - Validating statement identifiers
 *   - Trimming required metadata fields where safe
 *   - Validating text and span-reference structure
 *   - Rejecting duplicate statement identifiers
 *   - Sorting by statementIndex then id (where order is semantically irrelevant)
 *
 * Prohibited operations:
 *   - Discovering statements from document content
 *   - Classifying statements as material
 *   - Inferring missing statement text
 *   - Altering claim meaning
 *   - Assigning assurance status
 */

import type { MaterialStatement, SpanReference } from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import { DRA_ERROR_CODES } from "../model/index.js";
import {
  normaliseContentField,
  normaliseOptionalMetadataField,
} from "./normalise-strings.js";

// ---------------------------------------------------------------------------
// SpanReference normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a SpanReference.
 *
 * Fields normalised:
 *   - locationLabel → trimmed (metadata field, optional)
 *
 * Fields preserved exactly:
 *   - startOffset, endOffset, pageNumber → preserved (numeric, validated by Zod)
 *
 * Returns a new object; does not mutate the input.
 */
export function normaliseSpanReference(
  spanRef: SpanReference,
): { spanRef: SpanReference; fieldsNormalised: string[] } {
  const fieldsNormalised: string[] = [];

  const normalisedLabel = normaliseOptionalMetadataField(spanRef.locationLabel);
  if (normalisedLabel !== spanRef.locationLabel && spanRef.locationLabel !== undefined) {
    fieldsNormalised.push("spanRef.locationLabel");
  }

  return {
    spanRef: {
      startOffset: spanRef.startOffset,
      endOffset: spanRef.endOffset,
      pageNumber: spanRef.pageNumber,
      locationLabel: normalisedLabel,
    },
    fieldsNormalised,
  };
}

// ---------------------------------------------------------------------------
// MaterialStatement normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a single MaterialStatement.
 *
 * Fields normalised:
 *   - text           → line endings normalised (content field, NOT trimmed)
 *   - spanRef        → locationLabel trimmed (if present)
 *
 * Fields preserved exactly:
 *   - id             → preserved (identifier)
 *   - statementIndex → preserved (structural ordering)
 *   - materiality    → preserved (enum value)
 *   - linkedEvidenceUnitIds → preserved (references)
 *   - stageMetadata  → preserved (opaque metadata)
 *
 * Returns a new object; does not mutate the input.
 */
export function normaliseMaterialStatement(stmt: MaterialStatement): {
  statement: MaterialStatement;
  fieldsNormalised: string[];
} {
  const fieldsNormalised: string[] = [];

  // Text: line endings only
  const normalisedText = normaliseContentField(stmt.text);
  if (normalisedText !== stmt.text) {
    fieldsNormalised.push("statements[].text");
  }

  // SpanRef
  let normalisedSpanRef = stmt.spanRef;
  if (stmt.spanRef !== undefined) {
    const { spanRef, fieldsNormalised: spanFields } = normaliseSpanReference(
      stmt.spanRef,
    );
    normalisedSpanRef = spanRef;
    if (spanFields.length > 0) {
      fieldsNormalised.push("statements[].spanRef.locationLabel");
    }
  }

  const statement: MaterialStatement = {
    id: stmt.id,
    text: normalisedText,
    statementIndex: stmt.statementIndex,
    spanRef: normalisedSpanRef,
    materiality: stmt.materiality,
    linkedEvidenceUnitIds: [...stmt.linkedEvidenceUnitIds],
    stageMetadata: stmt.stageMetadata,
  };

  return { statement, fieldsNormalised };
}

/**
 * Normalises a collection of MaterialStatements.
 *
 * Also:
 *   - Checks for duplicate statement IDs (returns errors if found).
 *   - Sorts by statementIndex, then by id (lexicographic) as a tiebreaker,
 *     for deterministic output.
 *
 * Returns:
 *   - normalised and sorted statements
 *   - errors for duplicate IDs
 *   - fields normalised
 *   - whether the collection was reordered
 */
export function normaliseMaterialStatements(
  stmts: ReadonlyArray<MaterialStatement>,
): {
  statements: MaterialStatement[];
  errors: DraValidationError[];
  fieldsNormalised: string[];
  reordered: boolean;
} {
  if (stmts.length === 0) {
    return {
      statements: [],
      errors: [],
      fieldsNormalised: [],
      reordered: false,
    };
  }

  const errors: DraValidationError[] = [];
  const seenIds = new Set<string>();
  const allFieldsNormalised: string[] = [];

  // Check for duplicate IDs
  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i]!;
    if (seenIds.has(stmt.id)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: `statements[${i}].id`,
        message: `Duplicate statement identifier: "${stmt.id}"`,
        received: stmt.id,
      });
    } else {
      seenIds.add(stmt.id);
    }
  }

  if (errors.length > 0) {
    return {
      statements: [],
      errors,
      fieldsNormalised: [],
      reordered: false,
    };
  }

  // Normalise each statement
  const normalisedStmts: MaterialStatement[] = stmts.map((stmt) => {
    const { statement, fieldsNormalised } = normaliseMaterialStatement(stmt);
    allFieldsNormalised.push(...fieldsNormalised);
    return statement;
  });

  // Sort by statementIndex, then by id as tiebreaker
  const sorted = [...normalisedStmts].sort((a, b) => {
    if (a.statementIndex !== b.statementIndex) {
      return a.statementIndex - b.statementIndex;
    }
    return a.id.localeCompare(b.id);
  });

  const reordered = sorted.some(
    (stmt, i) => stmt.id !== normalisedStmts[i]!.id,
  );

  return {
    statements: sorted,
    errors: [],
    fieldsNormalised: [...new Set(allFieldsNormalised)],
    reordered,
  };
}
