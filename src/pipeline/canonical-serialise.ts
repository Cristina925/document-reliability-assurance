/**
 * DRA-001 — Pipeline Integration — Canonical Serialisation and Integrity Digest
 *
 * Milestone: DRA-ENG-008B — Deterministic Contract and Boundary Hardening
 *
 * Provides deterministic canonical serialisation for proof-receipt integrity.
 *
 * Substantive payload (deterministic — same input always → same digest):
 *   evaluationRequestId, evaluationResultId, schemaVersion,
 *   documentIdentity.generatedDocumentId, documentIdentity.generatedDocumentTitle,
 *   evaluatorIdentity, stageOutputs (in stage-number order),
 *   issueRegister (sorted by id string), issueSummary, decision, decisionRationale.
 *
 * Operational metadata (excluded from digest):
 *   id (receipt id), timestamp, documentIdentity.evaluatedAt, substantiveDigest.
 *
 * Canonical ordering rules:
 *   - Object keys: sorted lexicographically (ASCII/Unicode) at every nesting level.
 *   - stageOutputs: preserved in stage-number order (semantically ordered).
 *   - issueRegister: sorted by id string before hashing (insertion order is
 *     semantically irrelevant for the decision; sorting prevents accidental
 *     digest divergence when detection order varies across runtimes).
 *   - Arrays: element order preserved (index is semantically relevant except
 *     for issueRegister, which is explicitly sorted).
 *   - Maps and Sets: not present in the substantive payload.
 *   - undefined values: omitted (standard JSON.stringify behaviour).
 *   - null: preserved.
 *   - Dates: not present; all timestamps are ISO-8601 strings.
 */

import { createHash } from "node:crypto";
import type { ProofReceipt } from "../model/index.js";
import type {
  StageRecord,
  EvaluatorIdentity,
  DocumentIdentity,
} from "../model/proof-receipts.js";
import type { DraIssue, IssueSummary } from "../model/issues.js";
import type { AssuranceDecision } from "../model/decisions.js";

// ---------------------------------------------------------------------------
// Canonical JSON serialisation
// ---------------------------------------------------------------------------

/**
 * Produces a deterministic JSON string with object keys sorted at every level.
 *
 * Sorting applies recursively to all nested objects.  Arrays preserve element
 * order.  undefined values are omitted (JSON.stringify standard behaviour).
 *
 * This is the canonical text representation used as input to the SHA-256 digest.
 *
 * @param value  Any JSON-serialisable value.
 * @returns      Compact JSON string with all object keys in ascending order.
 */
export function canonicalJsonStringify(value: unknown): string {
  return JSON.stringify(value, sortedKeysReplacer);
}

function sortedKeysReplacer(_key: string, val: unknown): unknown {
  if (val !== null && typeof val === "object" && !Array.isArray(val)) {
    const record = val as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(record).sort()) {
      sorted[k] = record[k];
    }
    return sorted;
  }
  return val;
}

// ---------------------------------------------------------------------------
// SubstantivePayloadInput
// ---------------------------------------------------------------------------

/**
 * The deterministic fields that contribute to the proof-receipt integrity digest.
 *
 * Operational metadata (timestamps, receipt id, substantiveDigest itself)
 * are excluded.  Passing this structure to computeDigestFromPayload produces
 * a stable, round-trippable hex digest.
 */
export interface SubstantivePayloadInput {
  readonly evaluationRequestId: string;
  readonly evaluationResultId: string;
  readonly schemaVersion: string;
  /** documentIdentity without evaluatedAt (operational field). */
  readonly documentIdentitySubstantive: {
    readonly generatedDocumentId: string;
    readonly generatedDocumentTitle: string;
  };
  readonly evaluatorIdentity: EvaluatorIdentity;
  /** Stage outputs in stage-number order 1–7. */
  readonly stageOutputs: ReadonlyArray<StageRecord>;
  /** Issue register; sorted internally by id before hashing. */
  readonly issueRegister: ReadonlyArray<DraIssue>;
  readonly issueSummary: IssueSummary;
  /** One of "SUPPORTED", "REVIEW", "HOLD" — typed as string for digest-boundary flexibility. */
  readonly decision: string;
  readonly decisionRationale: string;
}

// ---------------------------------------------------------------------------
// computeDigestFromPayload
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 hex digest of the provided substantive payload.
 *
 * The issue register is sorted by id before hashing so that detection order
 * cannot cause digest divergence.  All other arrays (stageOutputs) preserve
 * their canonical order.
 *
 * @returns  64-character lowercase hex string.
 */
export function computeDigestFromPayload(
  payload: SubstantivePayloadInput,
): string {
  const canonical = {
    decision: payload.decision,
    decisionRationale: payload.decisionRationale,
    documentIdentity: {
      generatedDocumentId: payload.documentIdentitySubstantive.generatedDocumentId,
      generatedDocumentTitle:
        payload.documentIdentitySubstantive.generatedDocumentTitle,
    },
    evaluationRequestId: payload.evaluationRequestId,
    evaluationResultId: payload.evaluationResultId,
    evaluatorIdentity: payload.evaluatorIdentity,
    issueRegister: [...payload.issueRegister].sort((a, b) =>
      String(a.id).localeCompare(String(b.id)),
    ),
    issueSummary: payload.issueSummary,
    schemaVersion: payload.schemaVersion,
    stageOutputs: payload.stageOutputs,
  };
  const json = canonicalJsonStringify(canonical);
  return createHash("sha256").update(json, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// verifyReceiptIntegrity
// ---------------------------------------------------------------------------

/**
 * Verifies the integrity of a proof receipt by recomputing the substantive
 * digest and comparing it to the stored `substantiveDigest` field.
 *
 * Returns true when the receipt is unmodified since issuance.
 * Returns false when any substantive field has been mutated.
 *
 * Operational metadata (timestamp, evaluatedAt, id, substantiveDigest itself)
 * does NOT affect the digest; modifying only those fields will NOT cause
 * this function to return false.
 *
 * @param receipt  A proof receipt (typically frozen by buildProofReceipt).
 * @returns        true if integrity is verified; false if digest mismatch.
 */
export function verifyReceiptIntegrity(receipt: ProofReceipt): boolean {
  const recomputed = computeDigestFromPayload({
    evaluationRequestId: String(receipt.evaluationRequestId),
    evaluationResultId: String(receipt.evaluationResultId),
    schemaVersion: receipt.schemaVersion,
    documentIdentitySubstantive: {
      generatedDocumentId: String(receipt.documentIdentity.generatedDocumentId),
      generatedDocumentTitle: receipt.documentIdentity.generatedDocumentTitle,
    },
    evaluatorIdentity: receipt.evaluatorIdentity,
    stageOutputs: receipt.stageOutputs,
    issueRegister: receipt.issueRegister,
    issueSummary: receipt.issueSummary,
    decision: receipt.decision,
    decisionRationale: receipt.decisionRationale,
  });
  return recomputed === receipt.substantiveDigest;
}

// ---------------------------------------------------------------------------
// extractDocumentIdentitySubstantive (helper for consumers)
// ---------------------------------------------------------------------------

/**
 * Extracts the substantive (non-operational) fields from a DocumentIdentity.
 * Used when assembling a SubstantivePayloadInput from a full DocumentIdentity.
 */
export function extractDocumentIdentitySubstantive(
  di: DocumentIdentity,
): SubstantivePayloadInput["documentIdentitySubstantive"] {
  return {
    generatedDocumentId: String(di.generatedDocumentId),
    generatedDocumentTitle: di.generatedDocumentTitle,
  };
}
