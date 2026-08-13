/**
 * DRA-ENG-021 — Currentness Evidence Integrity and Digest-Binding
 * Module: currentness-integrity.ts — Tamper-evident binding for
 * CurrentnessAssessment (DRA-ENG-020).
 *
 * ---------------------------------------------------------------------------
 * Root cause (see docs/dra/DRA-ENG-021-CURRENTNESS-EVIDENCE-INTEGRITY-CLOSURE-REPORT.md
 * for the full audit)
 * ---------------------------------------------------------------------------
 *
 * CurrentnessAssessment (currentness.ts) is a semantically material,
 * human-reviewed governance assertion, but as of DRA-ENG-020 it was doubly
 * outside DRA's integrity boundary:
 *
 *   1. AcquisitionFreezeRecord.freezeRecordDigest (integrity.ts /
 *      computeAcquisitionFreezeRecordDigest) hashes a fixed allowlist of
 *      fields that explicitly excludes currentnessAssessment.
 *   2. ProofReceipt.substantiveDigest (canonical-serialise.ts /
 *      build-proof-receipt.ts) hashes a hand-built stageOutputs array; Stage
 *      1's stage record never includes requesterMetadata (the channel
 *      currentnessAssessment is propagated through into the evaluator), so
 *      the assessment never reaches the receipt digest even indirectly.
 *
 * Net effect: a bound currentness assertion could be silently altered on a
 * freeze record (e.g. CONFIRMED_SUPERSEDED → CONFIRMED_CURRENT) without
 * invalidating any existing digest.
 *
 * ---------------------------------------------------------------------------
 * Architecture decision
 * ---------------------------------------------------------------------------
 *
 * A NEW, separately versioned digest — currentnessAssertionDigest — rather
 * than extending freezeRecordDigest or ProofReceipt.substantiveDigest.
 * Alternatives considered and rejected:
 *
 *   - Extend freezeRecordDigest's material-fields allowlist to include
 *     currentnessAssessment: REJECTED. This would change the computed digest
 *     for every future freeze record that carries a currentnessAssessment,
 *     including a re-derivation of DRA-DOC-0030/0031's original freeze
 *     digests if their creation code path were ever re-run — violating the
 *     explicit "do not recompute historical digests" constraint. It would
 *     also silently conflate two different evidence objects: the frozen
 *     source artefact's identity (immutable, established once) and an
 *     externally-established governance assertion about that artefact's
 *     lineage (which may legitimately be re-asserted or corrected over time
 *     by a later, explicitly superseding assessment — see "Compatibility"
 *     below). Keeping them as separate digests preserves that distinction.
 *   - Extend ProofReceipt.substantiveDigest / stageOutputs: REJECTED. The
 *     seven-stage, DRA-001 §8 proof receipt shape is frozen production
 *     format; folding an acquisition-layer governance concern into it
 *     conflates the evaluator's pipeline-integrity boundary (evaluator
 *     input/output fidelity) with the acquisition layer's governance
 *     boundary (human-reviewed provenance). It would also require a
 *     receipt schema/version bump for a concern that has nothing to do with
 *     Stage 1-7 evaluation semantics.
 *   - Composite/Merkle structure spanning freeze + receipt + currentness:
 *     REJECTED as unnecessary complexity. There are exactly two evidence
 *     objects in play (the frozen artefact, and the currentness assertion
 *     about it); a single additional digest that binds the assertion to the
 *     specific frozen artefact it was made about is sufficient and simpler
 *     to verify than a Merkle tree.
 *   - A separate, explicitly versioned digest (CHOSEN): computed by this
 *     module, stored as two new OPTIONAL fields on AcquisitionFreezeRecord
 *     (currentnessAssertionDigest, currentnessIntegritySchemaVersion) and
 *     surfaced read-only on BenchmarkProofReference
 *     (governed-pipeline.ts). Never included in freezeRecordDigest's
 *     material-fields allowlist or in the proof receipt's substantive
 *     digest payload — so introducing it changes zero historical digests.
 *
 * ---------------------------------------------------------------------------
 * Canonicalisation / binding rules (what is bound, and why)
 * ---------------------------------------------------------------------------
 *
 * Bound (semantically material — alteration must invalidate the digest):
 *   - schemaVersion            (this binding mechanism's own version)
 *   - freezeRecordId           (binds the assertion to ONE specific frozen
 *                                artefact; a currentness assertion about a
 *                                document is meaningless detached from which
 *                                frozen instance of that document it was made
 *                                about)
 *   - corpusDocumentId         (assessed-document identity)
 *   - currentnessStatus
 *   - relatedDocumentIdentifier (superseding/current document identity)
 *   - relatedCorpusDocumentId
 *   - evidenceUrl              (authoritative evidence locator)
 *   - evidenceQuote            (authoritative evidence content)
 *   - assessedBy               (authority identity of the assessor)
 *   - assessedAt               (assessment timestamp — meaningful: WHEN the
 *                                authoritative evidence was reviewed is part
 *                                of the assertion's substance, unlike a
 *                                receipt's operational issuance timestamp)
 *
 * Deliberately NOT bound (incidental / non-semantic — matches the existing
 * frozenAt exclusion precedent in freeze.ts):
 *   - notes (assessor free-text commentary; explicitly documented in
 *     currentness.ts as "Optional assessor notes" with no evidentiary role)
 *
 * ---------------------------------------------------------------------------
 * Compatibility / versioning strategy
 * ---------------------------------------------------------------------------
 *
 * CURRENTNESS_INTEGRITY_SCHEMA_VERSION identifies the exact canonicalisation
 * rule set used to produce a given digest. verifyCurrentnessAssertionDigest()
 * only recognises the schema version(s) it implements; a record whose stored
 * currentnessIntegritySchemaVersion does not match a version this function
 * knows how to verify fails closed (returns false), rather than silently
 * verifying against the wrong rule set. Introducing a v2 canonicalisation in
 * a future programme means adding a new case to verify — never mutating the
 * v1 payload shape in place, so v1-issued digests keep verifying under v1
 * rules forever.
 *
 * This module is purely additive: it does not modify currentness.ts's
 * semantics (evidence-gating, tri-state status, never-inferred design) at
 * all. No document text is read here; only the already-governed
 * CurrentnessAssessment fields are canonicalised and hashed.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type { CurrentnessAssessment } from "./currentness.js";

// ---------------------------------------------------------------------------
// Schema version
// ---------------------------------------------------------------------------

/**
 * Identifies the canonicalisation rule set implemented by
 * computeCurrentnessAssertionDigest(). Stored alongside the digest so a
 * future, differently-canonicalised version can be introduced without
 * breaking verification of records issued under this version.
 */
export const CURRENTNESS_INTEGRITY_SCHEMA_VERSION = "dra-currentness-integrity-v1" as const;

/** Schema versions this module's verify function knows how to check. */
const RECOGNISED_SCHEMA_VERSIONS: readonly string[] = [
  CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
];

// ---------------------------------------------------------------------------
// computeCurrentnessAssertionDigest
// ---------------------------------------------------------------------------

export interface CurrentnessAssertionDigestInput {
  /** The specific frozen artefact this assertion is about. Format: DRA-FRZ-NNNNNN. */
  readonly freezeRecordId: string;
  /** The assessed document's corpus identity. Format: DRA-DOC-NNNN. */
  readonly corpusDocumentId: string;
  /** The governed currentness assessment being bound. */
  readonly currentnessAssessment: CurrentnessAssessment;
}

/**
 * Computes a SHA-256 hex digest that cryptographically binds a
 * CurrentnessAssessment to the specific frozen document it was made about.
 *
 * Pure function: identical inputs always produce an identical digest
 * (deterministic; no clock, randomness, or I/O). See module docs for exactly
 * which fields are bound and why.
 *
 * @returns 64-character lowercase hex string.
 */
export function computeCurrentnessAssertionDigest(
  input: CurrentnessAssertionDigestInput,
): string {
  const a = input.currentnessAssessment;
  const payload = {
    schemaVersion: CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
    freezeRecordId: input.freezeRecordId,
    corpusDocumentId: input.corpusDocumentId,
    currentnessStatus: a.currentnessStatus,
    relatedDocumentIdentifier: a.relatedDocumentIdentifier ?? null,
    relatedCorpusDocumentId: a.relatedCorpusDocumentId ?? null,
    evidenceUrl: a.evidenceUrl ?? null,
    evidenceQuote: a.evidenceQuote ?? null,
    assessedBy: a.assessedBy,
    assessedAt: a.assessedAt,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload))
    .digest("hex");
}

// ---------------------------------------------------------------------------
// verifyCurrentnessAssertionDigest
// ---------------------------------------------------------------------------

export interface VerifyCurrentnessAssertionDigestInput
  extends CurrentnessAssertionDigestInput {
  /** The schema version recorded alongside the digest being verified. */
  readonly schemaVersion: string;
  /** The digest to verify. */
  readonly expectedDigest: string;
}

/**
 * Verifies that a stored currentnessAssertionDigest matches a freshly
 * recomputed digest of the supplied (freezeRecordId, corpusDocumentId,
 * currentnessAssessment) tuple, under the recorded schema version.
 *
 * Fails closed: returns false (never throws) for:
 *   - a digest mismatch (the assessment, its binding identity, or any bound
 *     field was altered after the digest was computed);
 *   - an unrecognised schemaVersion (a malformed or version-incompatible
 *     integrity structure — this module only knows how to verify the
 *     schema versions listed in RECOGNISED_SCHEMA_VERSIONS).
 */
export function verifyCurrentnessAssertionDigest(
  input: VerifyCurrentnessAssertionDigestInput,
): boolean {
  if (!RECOGNISED_SCHEMA_VERSIONS.includes(input.schemaVersion)) {
    return false;
  }
  const recomputed = computeCurrentnessAssertionDigest({
    freezeRecordId: input.freezeRecordId,
    corpusDocumentId: input.corpusDocumentId,
    currentnessAssessment: input.currentnessAssessment,
  });
  return recomputed === input.expectedDigest;
}
