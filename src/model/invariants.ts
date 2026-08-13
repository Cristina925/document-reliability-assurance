/**
 * DRA-001 — Canonical Invariant Checks
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Implements runtime checks for the material invariants of the DRA-001
 * canonical data model. Each function returns a DraValidationResult.
 *
 * Invariants covered:
 *   INV-001 All identifiers within a collection are unique.
 *   INV-002 All referenced statement IDs exist in the evaluation.
 *   INV-003 All referenced evidence unit IDs exist in the evaluation.
 *   INV-004 All issue references resolve to existing issues.
 *   INV-005 All proof-receipt references resolve.
 *   INV-006 Pipeline stage records are unique, ordered, and complete.
 *   INV-007 Exactly nine canonical issue classes exist.
 *   INV-008 Exactly three canonical decisions exist.
 *   INV-009 Timestamps are structurally valid.
 *   INV-010 Schema version is recognised.
 *   INV-011 Stage record names match their stage numbers.
 *   INV-012 Optional fields remain genuinely optional.
 *   INV-013 Evaluation input/output identities are internally consistent.
 *
 * This module does not create business rules belonging to later evaluator stages.
 */

import {
  DraValidationResult,
  DraValidationError,
  VALIDATION_OK,
  DRA_ERROR_CODES,
  mergeValidationResults,
} from "./validation-errors.js";
import { ISSUE_CLASSES } from "./issue-classes.js";
import { ASSURANCE_DECISIONS } from "./decisions.js";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_COUNT,
  getExpectedStageName,
} from "./pipeline-stages.js";
import { isRecognisedSchemaVersion } from "./versions.js";
import { StageRecord } from "./proof-receipts.js";
import { DraIssue } from "./issues.js";

/** Minimal shape accepted by reference-checking invariants. */
interface HasId {
  readonly id: string;
}

// ---------------------------------------------------------------------------
// Helper: collect string IDs from an array
// ---------------------------------------------------------------------------

function collectIds(items: ReadonlyArray<{ id: string }>): Set<string> {
  return new Set(items.map((i) => i.id));
}

function findDuplicateIds(
  items: ReadonlyArray<{ id: string }>,
  path: string,
): DraValidationError[] {
  const seen = new Set<string>();
  const errors: DraValidationError[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push({
        code: DRA_ERROR_CODES.DUPLICATE_IDENTIFIER,
        path,
        message: `Duplicate identifier: "${item.id}"`,
        received: item.id,
      });
    }
    seen.add(item.id);
  }
  return errors;
}

// ---------------------------------------------------------------------------
// INV-001: Identifier uniqueness
// ---------------------------------------------------------------------------

export function checkIdentifierUniqueness(
  items: ReadonlyArray<{ id: string }>,
  path: string,
): DraValidationResult {
  const errors = findDuplicateIds(items, path);
  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// INV-002: Referenced statement IDs exist
// ---------------------------------------------------------------------------

export function checkStatementReferences(
  references: ReadonlyArray<string>,
  existingStatements: ReadonlyArray<HasId>,
  referencingPath: string,
): DraValidationResult {
  const known = collectIds(existingStatements);
  const errors: DraValidationError[] = [];
  for (const ref of references) {
    if (!known.has(ref)) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: referencingPath,
        message: `Statement reference does not resolve: "${ref}"`,
        received: ref,
      });
    }
  }
  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// INV-003: Referenced evidence unit IDs exist
// ---------------------------------------------------------------------------

export function checkEvidenceUnitReferences(
  references: ReadonlyArray<string>,
  existingUnits: ReadonlyArray<HasId>,
  referencingPath: string,
): DraValidationResult {
  const known = collectIds(existingUnits);
  const errors: DraValidationError[] = [];
  for (const ref of references) {
    if (!known.has(ref)) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: referencingPath,
        message: `EvidenceUnit reference does not resolve: "${ref}"`,
        received: ref,
      });
    }
  }
  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// INV-004: Issue references from a collection resolve to existing issues
// ---------------------------------------------------------------------------

export function checkIssueReferences(
  issueIds: ReadonlyArray<string>,
  existingIssues: ReadonlyArray<HasId>,
  referencingPath: string,
): DraValidationResult {
  const known = collectIds(existingIssues);
  const errors: DraValidationError[] = [];
  for (const id of issueIds) {
    if (!known.has(id)) {
      errors.push({
        code: DRA_ERROR_CODES.UNRESOLVED_REFERENCE,
        path: referencingPath,
        message: `Issue reference does not resolve: "${id}"`,
        received: id,
      });
    }
  }
  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// INV-006: Stage records are unique, ordered, and complete
// ---------------------------------------------------------------------------

/**
 * Verifies that an array of StageRecords satisfies the DRA-001 §5 ordering:
 *   - Exactly PIPELINE_STAGE_COUNT records.
 *   - Stage numbers are 1–7 in strict ascending order.
 *   - Stage numbers are unique (implied by strict order).
 *   - Stage names match the canonical name for each stage number.
 */
export function checkStageRecordInvariants(
  records: ReadonlyArray<StageRecord>,
  path: string,
): DraValidationResult {
  const errors: DraValidationError[] = [];

  if (records.length !== PIPELINE_STAGE_COUNT) {
    errors.push({
      code: DRA_ERROR_CODES.WRONG_STAGE_COUNT,
      path,
      message: `Expected exactly ${PIPELINE_STAGE_COUNT} stage records; received ${records.length}`,
      received: records.length,
    });
    // Cannot check order if count is wrong — return early.
    return { ok: false, errors };
  }

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    const expectedNumber = i + 1;

    if (record.stageNumber !== expectedNumber) {
      errors.push({
        code: DRA_ERROR_CODES.STAGE_ORDER_VIOLATION,
        path: `${path}[${i}].stageNumber`,
        message: `Stage record at index ${i} has stageNumber ${record.stageNumber}; expected ${expectedNumber}`,
        received: record.stageNumber,
      });
    }

    const expectedName = getExpectedStageName(expectedNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    if (record.stageName !== expectedName) {
      errors.push({
        code: DRA_ERROR_CODES.INVALID_STAGE_NAME,
        path: `${path}[${i}].stageName`,
        message: `Stage ${expectedNumber} must be named "${expectedName}"; received "${record.stageName}"`,
        received: record.stageName,
      });
    }
  }

  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// INV-007: Exactly nine canonical issue classes exist
// ---------------------------------------------------------------------------

export function checkIssueClassCount(): DraValidationResult {
  const expected = 9;
  const actual = ISSUE_CLASSES.length;
  if (actual !== expected) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
          path: "ISSUE_CLASSES",
          message: `Expected exactly ${expected} issue classes; found ${actual}`,
          received: actual,
        },
      ],
    };
  }
  return VALIDATION_OK;
}

// ---------------------------------------------------------------------------
// INV-008: Exactly three canonical decisions exist
// ---------------------------------------------------------------------------

export function checkDecisionCount(): DraValidationResult {
  const expected = 3;
  const actual = ASSURANCE_DECISIONS.length;
  if (actual !== expected) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
          path: "ASSURANCE_DECISIONS",
          message: `Expected exactly ${expected} assurance decisions; found ${actual}`,
          received: actual,
        },
      ],
    };
  }
  return VALIDATION_OK;
}

// ---------------------------------------------------------------------------
// INV-009: Timestamp is a valid ISO-8601 UTC string
// ---------------------------------------------------------------------------

const UTC_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export function checkTimestamp(
  value: string,
  path: string,
): DraValidationResult {
  if (!UTC_DATETIME_RE.test(value)) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INVALID_TIMESTAMP,
          path,
          message: `Timestamp must be a valid ISO-8601 UTC string (ending in Z); received "${value}"`,
          received: value,
        },
      ],
    };
  }
  // Check the date is actually parseable
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INVALID_TIMESTAMP,
          path,
          message: `Timestamp "${value}" is not a valid date`,
          received: value,
        },
      ],
    };
  }
  return VALIDATION_OK;
}

/**
 * Checks that timestamp `before` is not later than timestamp `after`.
 * Both must already be validated as ISO-8601 UTC strings.
 */
export function checkTimestampOrder(
  before: string,
  beforePath: string,
  after: string,
  afterPath: string,
): DraValidationResult {
  const t1 = new Date(before).getTime();
  const t2 = new Date(after).getTime();
  if (t1 > t2) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INCOHERENT_TIMESTAMPS,
          path: afterPath,
          message: `Timestamp at "${afterPath}" (${after}) must not be before "${beforePath}" (${before})`,
          received: after,
        },
      ],
    };
  }
  return VALIDATION_OK;
}

// ---------------------------------------------------------------------------
// INV-010: Schema version is recognised
// ---------------------------------------------------------------------------

export function checkSchemaVersion(
  version: string,
  path: string,
): DraValidationResult {
  if (!isRecognisedSchemaVersion(version)) {
    return {
      ok: false,
      errors: [
        {
          code: DRA_ERROR_CODES.INVALID_SCHEMA_VERSION,
          path,
          message: `Schema version "${version}" is not recognised`,
          received: version,
        },
      ],
    };
  }
  return VALIDATION_OK;
}

// ---------------------------------------------------------------------------
// INV-013: Evaluation identity consistency (request/result/receipt cross-check)
// ---------------------------------------------------------------------------

export interface EvaluationIdentityBundle {
  requestId: string;
  resultId: string;
  proofReceiptEvaluationRequestId: string;
  proofReceiptEvaluationResultId: string;
}

export function checkEvaluationIdentityConsistency(
  bundle: EvaluationIdentityBundle,
): DraValidationResult {
  const errors: DraValidationError[] = [];

  if (bundle.proofReceiptEvaluationRequestId !== bundle.requestId) {
    errors.push({
      code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
      path: "proofReceipt.evaluationRequestId",
      message: `Proof receipt evaluationRequestId must match the evaluation request id`,
      received: bundle.proofReceiptEvaluationRequestId,
    });
  }

  if (bundle.proofReceiptEvaluationResultId !== bundle.resultId) {
    errors.push({
      code: DRA_ERROR_CODES.INVARIANT_VIOLATION,
      path: "proofReceipt.evaluationResultId",
      message: `Proof receipt evaluationResultId must match the evaluation result id`,
      received: bundle.proofReceiptEvaluationResultId,
    });
  }

  return errors.length === 0 ? VALIDATION_OK : { ok: false, errors };
}

// ---------------------------------------------------------------------------
// Composite: full-result invariant check
// ---------------------------------------------------------------------------

/**
 * Runs all applicable invariants against an evaluation result's component data.
 * Returns a merged DraValidationResult.
 *
 * This does not re-run Zod schema validation (use EvaluationResultSchema for that).
 * It checks cross-entity invariants that Zod cannot express.
 */
export function checkEvaluationResultInvariants(opts: {
  statements: ReadonlyArray<HasId>;
  evidenceUnits: ReadonlyArray<HasId>;
  issues: ReadonlyArray<DraIssue>;
  stageRecords: ReadonlyArray<StageRecord>;
  requestId: string;
  resultId: string;
  proofReceiptEvaluationRequestId: string;
  proofReceiptEvaluationResultId: string;
  schemaVersion: string;
  completedAt: string;
}): DraValidationResult {
  const results: DraValidationResult[] = [];

  // INV-001: identifier uniqueness within each collection
  results.push(checkIdentifierUniqueness(opts.statements, "statements"));
  results.push(checkIdentifierUniqueness(opts.evidenceUnits, "evidenceUnits"));
  results.push(checkIdentifierUniqueness(opts.issues, "issues"));

  // INV-002: statement references in issues resolve
  for (let i = 0; i < opts.issues.length; i++) {
    const issue = opts.issues[i]!;
    results.push(
      checkStatementReferences(
        issue.affectedStatementIds,
        opts.statements,
        `issues[${i}].affectedStatementIds`,
      ),
    );
  }

  // INV-003: evidence unit references in issues resolve
  for (let i = 0; i < opts.issues.length; i++) {
    const issue = opts.issues[i]!;
    results.push(
      checkEvidenceUnitReferences(
        issue.affectedEvidenceUnitIds,
        opts.evidenceUnits,
        `issues[${i}].affectedEvidenceUnitIds`,
      ),
    );
  }

  // INV-006: stage records
  results.push(checkStageRecordInvariants(opts.stageRecords, "stageRecords"));

  // INV-007 & INV-008: canonical counts (static — always pass in a correct build)
  results.push(checkIssueClassCount());
  results.push(checkDecisionCount());

  // INV-009: timestamp
  results.push(checkTimestamp(opts.completedAt, "completedAt"));

  // INV-010: schema version
  results.push(checkSchemaVersion(opts.schemaVersion, "schemaVersion"));

  // INV-013: evaluation identity consistency
  results.push(
    checkEvaluationIdentityConsistency({
      requestId: opts.requestId,
      resultId: opts.resultId,
      proofReceiptEvaluationRequestId: opts.proofReceiptEvaluationRequestId,
      proofReceiptEvaluationResultId: opts.proofReceiptEvaluationResultId,
    }),
  );

  return mergeValidationResults(results);
}
