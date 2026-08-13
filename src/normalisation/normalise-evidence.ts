/**
 * DRA-001 — Stage 1: Input Normalisation — Evidence Normalisation
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Normalises EvidenceUnit and EvidenceRelationship structures if they are
 * present in the input.
 *
 * At Stage 1, the EvaluationRequest does not carry EvidenceUnits or
 * EvidenceRelationships — these are produced by Stage 4 (Evidence Linkage).
 * This module is provided to:
 *   - Handle the (future or atypical) case where evidence is pre-supplied
 *     in the request
 *   - Define the normalisation contract for downstream stages
 *
 * When called with empty arrays, this module is a deterministic no-op.
 *
 * Permitted operations:
 *   - Validating evidence identifiers
 *   - Validating statement and evidence cross-references
 *   - Rejecting duplicate relationships (same statementId + evidenceUnitId + type)
 *   - Preserving relationship type values exactly
 *   - Producing deterministic ordering by id
 *
 * Prohibited operations:
 *   - Determining whether evidence genuinely supports or conflicts with a claim
 *   - Creating new evidence entries from document content
 *   - Modifying evidence passage text beyond line-ending normalisation
 */

import type {
  EvidenceUnit,
  EvidenceRelationship,
} from "../model/index.js";
import type { DraValidationError } from "../model/index.js";
import { DRA_ERROR_CODES } from "../model/index.js";
import {
  normaliseContentField,
  normaliseOptionalMetadataField,
} from "./normalise-strings.js";
import { normaliseSpanReference } from "./normalise-statements.js";

// ---------------------------------------------------------------------------
// EvidenceUnit normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a single EvidenceUnit.
 *
 * Fields normalised:
 *   - passageText    → line endings normalised (content field, NOT trimmed)
 *   - locationLabel  → trimmed (metadata field, optional)
 *   - spanRef        → locationLabel trimmed (if present)
 *
 * Fields preserved exactly:
 *   - id               → preserved (identifier)
 *   - sourceDocumentId → preserved (reference)
 *
 * Returns a new object; does not mutate the input.
 */
export function normaliseEvidenceUnit(unit: EvidenceUnit): {
  unit: EvidenceUnit;
  fieldsNormalised: string[];
} {
  const fieldsNormalised: string[] = [];

  // Passage text: line endings only
  const normalisedPassageText = normaliseContentField(unit.passageText);
  if (normalisedPassageText !== unit.passageText) {
    fieldsNormalised.push("evidenceUnits[].passageText");
  }

  // LocationLabel: trim
  const normalisedLocationLabel = normaliseOptionalMetadataField(
    unit.locationLabel,
  );
  if (
    normalisedLocationLabel !== unit.locationLabel &&
    unit.locationLabel !== undefined
  ) {
    fieldsNormalised.push("evidenceUnits[].locationLabel");
  }

  // SpanRef
  let normalisedSpanRef = unit.spanRef;
  if (unit.spanRef !== undefined) {
    const { spanRef, fieldsNormalised: spanFields } = normaliseSpanReference(
      unit.spanRef,
    );
    normalisedSpanRef = spanRef;
    if (spanFields.length > 0) {
      fieldsNormalised.push("evidenceUnits[].spanRef.locationLabel");
    }
  }

  return {
    unit: {
      id: unit.id,
      sourceDocumentId: unit.sourceDocumentId,
      passageText: normalisedPassageText,
      spanRef: normalisedSpanRef,
      locationLabel: normalisedLocationLabel,
    },
    fieldsNormalised,
  };
}

/**
 * Normalises a collection of EvidenceUnits.
 *
 * Also:
 *   - Checks for duplicate evidence unit IDs.
 *   - Validates that sourceDocumentId references resolve to available source docs.
 *   - Sorts by id (lexicographic) for deterministic output.
 */
export function normaliseEvidenceUnits(
  units: ReadonlyArray<EvidenceUnit>,
  availableSourceDocIds: ReadonlySet<string>,
): {
  units: EvidenceUnit[];
  errors: DraValidationError[];
  fieldsNormalised: string[];
  reordered: boolean;
} {
  if (units.length === 0) {
    return { units: [], errors: [], fieldsNormalised: [], reordered: false };
  }

  const errors: DraValidationError[] = [];
  const seenIds = new Set<string>();
  const allFieldsNormalised: string[] = [];

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]!;

    // Duplicate ID check
    if (seenIds.has(unit.id)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: `evidenceUnits[${i}].id`,
        message: `Duplicate evidence unit identifier: "${unit.id}"`,
        received: unit.id,
      });
    } else {
      seenIds.add(unit.id);
    }

    // Reference check: sourceDocumentId must resolve
    if (!availableSourceDocIds.has(unit.sourceDocumentId)) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: `evidenceUnits[${i}].sourceDocumentId`,
        message: `Evidence unit "${unit.id}" references source document "${unit.sourceDocumentId}" which is not present in sourceDocuments`,
        received: unit.sourceDocumentId,
      });
    }
  }

  if (errors.length > 0) {
    return { units: [], errors, fieldsNormalised: [], reordered: false };
  }

  const normalisedUnits: EvidenceUnit[] = units.map((unit) => {
    const { unit: u, fieldsNormalised } = normaliseEvidenceUnit(unit);
    allFieldsNormalised.push(...fieldsNormalised);
    return u;
  });

  const sorted = [...normalisedUnits].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const reordered = sorted.some((u, i) => u.id !== normalisedUnits[i]!.id);

  return {
    units: sorted,
    errors: [],
    fieldsNormalised: [...new Set(allFieldsNormalised)],
    reordered,
  };
}

// ---------------------------------------------------------------------------
// EvidenceRelationship normalisation
// ---------------------------------------------------------------------------

/**
 * Normalises a collection of EvidenceRelationships.
 *
 * Checks:
 *   - Duplicate relationship IDs.
 *   - Duplicate (statementId, evidenceUnitId, relationshipType) tuples —
 *     these are structurally self-contradictory.
 *   - Statement references resolve to known statements.
 *   - Evidence unit references resolve to known evidence units.
 *
 * Sorts by id (lexicographic) for deterministic output.
 *
 * Does not determine whether evidence is semantically correct.
 */
export function normaliseEvidenceRelationships(
  relationships: ReadonlyArray<EvidenceRelationship>,
  knownStatementIds: ReadonlySet<string>,
  knownEvidenceUnitIds: ReadonlySet<string>,
): {
  relationships: EvidenceRelationship[];
  errors: DraValidationError[];
  reordered: boolean;
} {
  if (relationships.length === 0) {
    return { relationships: [], errors: [], reordered: false };
  }

  const errors: DraValidationError[] = [];
  const seenIds = new Set<string>();
  const seenTuples = new Set<string>();

  for (let i = 0; i < relationships.length; i++) {
    const rel = relationships[i]!;

    // Duplicate ID check
    if (seenIds.has(rel.id)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: `evidenceRelationships[${i}].id`,
        message: `Duplicate evidence relationship identifier: "${rel.id}"`,
        received: rel.id,
      });
    } else {
      seenIds.add(rel.id);
    }

    // Duplicate tuple check (same statementId + evidenceUnitId + type)
    const tuple = `${rel.statementId}|${rel.evidenceUnitId}|${rel.relationshipType}`;
    if (seenTuples.has(tuple)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path: `evidenceRelationships[${i}]`,
        message:
          `Duplicate evidence relationship: statementId="${rel.statementId}", ` +
          `evidenceUnitId="${rel.evidenceUnitId}", relationshipType="${rel.relationshipType}"`,
      });
    } else {
      seenTuples.add(tuple);
    }

    // Statement reference check (if statements are present)
    if (
      knownStatementIds.size > 0 &&
      !knownStatementIds.has(rel.statementId)
    ) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: `evidenceRelationships[${i}].statementId`,
        message: `Evidence relationship "${rel.id}" references statement "${rel.statementId}" which is not present`,
        received: rel.statementId,
      });
    }

    // Evidence unit reference check (if units are present)
    if (
      knownEvidenceUnitIds.size > 0 &&
      !knownEvidenceUnitIds.has(rel.evidenceUnitId)
    ) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: `evidenceRelationships[${i}].evidenceUnitId`,
        message: `Evidence relationship "${rel.id}" references evidence unit "${rel.evidenceUnitId}" which is not present`,
        received: rel.evidenceUnitId,
      });
    }
  }

  if (errors.length > 0) {
    return { relationships: [], errors, reordered: false };
  }

  // Create fresh relationship objects (no field normalisation needed — all
  // relationship fields are either identifiers, enum values, or optional metadata)
  const normalisedRels: EvidenceRelationship[] = relationships.map(
    (rel) => ({
      id: rel.id,
      statementId: rel.statementId,
      evidenceUnitId: rel.evidenceUnitId,
      relationshipType: rel.relationshipType,
      explanation: rel.explanation,
      metadata: rel.metadata,
    }),
  );

  const sorted = [...normalisedRels].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const reordered = sorted.some(
    (r, i) => r.id !== normalisedRels[i]!.id,
  );

  return { relationships: sorted, errors: [], reordered };
}
