/**
 * DRA-001 — Benchmark Corpus Integrity
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * SHA-256 integrity digest computation for corpus documents.
 *
 * Substantive fields (included in digest):
 *   All CorpusDocumentInput fields — corpusId, title, sourceType, documentType,
 *   domain, language, generator, generatorVersion, creationMethod, difficulty,
 *   sourceReference, benchmarkStatus, notes.
 *
 * Operational metadata (excluded from digest):
 *   integrityDigest — excluded to prevent self-referential circularity.
 *
 * Canonical serialisation rules (matching evaluator conventions):
 *   - Object keys sorted lexicographically at every depth.
 *   - Arrays preserve element order.
 *   - undefined values omitted.
 *   - null preserved.
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type {
  CorpusDocumentInput,
  CorpusDocument,
  CorpusManifest,
} from "./schema.js";

// ---------------------------------------------------------------------------
// Document digest
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 integrity digest for a corpus document input.
 *
 * The digest is deterministic: identical substantive fields → identical digest.
 * Only operational metadata (i.e. integrityDigest itself) is excluded.
 *
 * @param input  The substantive corpus document fields (without integrityDigest).
 * @returns      64-character lowercase hex string.
 */
export function computeCorpusDocumentDigest(
  input: CorpusDocumentInput,
): string {
  // Build the canonical payload.
  //
  // corpusId is intentionally EXCLUDED from the digest.  The corpus identifier
  // is the document's permanent identity key, not its content.  Excluding it
  // allows the duplicate-digest check to catch content-identical documents
  // that were accidentally registered under different IDs — a corpus management
  // error that would be invisible if the ID were folded into the digest.
  //
  // All other substantive fields are included.  generatorVersion and notes are
  // optional; if absent they are undefined and JSON.stringify omits them,
  // consistent with the evaluator's canonical-serialise conventions.
  const payload: Record<string, unknown> = {
    benchmarkStatus: input.benchmarkStatus,
    creationMethod: input.creationMethod,
    difficulty: input.difficulty,
    documentType: input.documentType,
    domain: input.domain,
    generator: input.generator,
    language: input.language,
    sourceReference: input.sourceReference,
    sourceType: input.sourceType,
    title: input.title,
  };

  // Include optional fields only when defined, so the digest is stable
  // regardless of whether the key is absent or set to undefined.
  if (input.generatorVersion !== undefined) {
    payload["generatorVersion"] = input.generatorVersion;
  }
  if (input.notes !== undefined) {
    payload["notes"] = input.notes;
  }

  const json = canonicalJsonStringify(payload);
  return createHash("sha256").update(json, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// Document integrity verification
// ---------------------------------------------------------------------------

/**
 * Verifies the integrity of a fully-registered corpus document by recomputing
 * the digest from substantive fields and comparing to the stored value.
 *
 * Returns true when the document is unmodified since registration.
 * Returns false when any substantive field has changed.
 *
 * Modifying only integrityDigest will not alter the recomputed value, but
 * the comparison will still fail because the stored value will not match.
 *
 * @param doc  A CorpusDocument with a stored integrityDigest.
 * @returns    true if integrity is verified; false on digest mismatch.
 */
export function verifyCorpusDocumentIntegrity(doc: CorpusDocument): boolean {
  const { integrityDigest: stored, ...input } = doc;
  const recomputed = computeCorpusDocumentDigest(input as CorpusDocumentInput);
  return recomputed === stored;
}

// ---------------------------------------------------------------------------
// Manifest digest
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 overall digest for a corpus manifest.
 *
 * The digest is computed from the substantive manifest fields:
 *   schemaVersion, corpusVersion, documentCount, documentIds.
 *
 * The overallDigest field itself is excluded (anti-circularity).
 *
 * @returns  64-character lowercase hex string.
 */
export function computeManifestDigest(
  schemaVersion: string,
  corpusVersion: string,
  documentCount: number,
  documentIds: readonly string[],
): string {
  const payload = {
    documentCount,
    documentIds: [...documentIds],
    corpusVersion,
    schemaVersion,
  };
  const json = canonicalJsonStringify(payload);
  return createHash("sha256").update(json, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// Manifest integrity verification
// ---------------------------------------------------------------------------

/**
 * Verifies the overall digest of a corpus manifest by recomputing it
 * from the substantive manifest fields.
 *
 * @param manifest  A CorpusManifest with a stored overallDigest.
 * @returns         true if integrity is verified; false on digest mismatch.
 */
export function verifyManifestIntegrity(manifest: CorpusManifest): boolean {
  const recomputed = computeManifestDigest(
    manifest.schemaVersion,
    manifest.corpusVersion,
    manifest.documentCount,
    manifest.documentIds,
  );
  return recomputed === manifest.overallDigest;
}
