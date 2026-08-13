/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: manifest-integration.ts — Corpus registry and manifest integration
 *
 * Maps an AcquisitionFreezeRecord and ApprovedMetadata to a CorpusDocumentInput
 * and integrates it into the active CorpusRegistry.
 *
 * Reuses:
 *   - CorpusRegistry.add() — append-only registry mutation
 *   - CorpusRegistry.exportManifest() — manifest snapshot
 *   - verifyManifestIntegrity() — post-integration manifest verification
 *   - computeManifestDigest() — for the returned manifest digest
 *
 * Invariants:
 *   - Registry is never mutated on failure; errors are returned, not thrown.
 *   - Duplicate ID and duplicate digest rejections propagate from the registry.
 *   - Manifest integrity is verified after every successful add.
 *   - sourceType is always HUMAN_AUTHORED for public acquired documents.
 *   - benchmarkStatus is always FROZEN (the eligibility gate has already passed).
 */

import { verifyManifestIntegrity } from "../corpus/integrity.js";
import type { CorpusRegistry } from "../corpus/registry.js";
import type { CorpusDocumentInput } from "../corpus/schema.js";
import type { CorpusManifest } from "../corpus/manifest.js";
import type { CorpusId } from "../corpus/schema.js";
import type { AcquisitionFreezeRecord } from "./freeze.js";
import type { ApprovedMetadata } from "./metadata.js";

// ---------------------------------------------------------------------------
// CorpusIntegrationResult
// ---------------------------------------------------------------------------

export type CorpusIntegrationResult =
  | {
      readonly ok: true;
      readonly manifest: CorpusManifest;
      readonly manifestDigest: string;
      readonly corpusDocumentId: string;
    }
  | {
      readonly ok: false;
      readonly code: CorpusIntegrationErrorCode;
      readonly message: string;
    };

export type CorpusIntegrationErrorCode =
  | "DUPLICATE_CORPUS_ID"
  | "DUPLICATE_DIGEST"
  | "MANIFEST_INTEGRITY_FAILED"
  | "REGISTRY_ERROR";

// ---------------------------------------------------------------------------
// buildCorpusDocumentInput
// ---------------------------------------------------------------------------

/**
 * Maps an AcquisitionFreezeRecord and ApprovedMetadata to a CorpusDocumentInput
 * suitable for passing to CorpusRegistry.add().
 *
 * Mapping decisions:
 *   - sourceType: always HUMAN_AUTHORED (public documents are human-authored).
 *   - generator: the publisher name from ApprovedMetadata.
 *   - generatorVersion: the benchmarkVersion from the freeze record.
 *   - creationMethod: records the acquisition pipeline and source URL.
 *   - sourceReference: the canonical source URL of the document.
 *   - benchmarkStatus: always FROZEN (eligibility gate has already passed).
 */
export function buildCorpusDocumentInput(
  freezeRecord: AcquisitionFreezeRecord,
  approvedMetadata: ApprovedMetadata,
): CorpusDocumentInput {
  const notes = [
    `Acquisition ID: ${freezeRecord.acquisitionId}.`,
    `Freeze record: ${freezeRecord.freezeRecordId}.`,
    `Source digest: ${freezeRecord.sourceDigest.slice(0, 16)}…`,
    approvedMetadata.publicationDate
      ? `Publication date: ${approvedMetadata.publicationDate}.`
      : null,
    approvedMetadata.version ? `Version: ${approvedMetadata.version}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    corpusId: freezeRecord.corpusDocumentId as CorpusId,
    title: approvedMetadata.title,
    sourceType: "HUMAN_AUTHORED",
    documentType: approvedMetadata.documentType,
    domain: approvedMetadata.domain,
    language: approvedMetadata.language,
    generator: approvedMetadata.publisher,
    generatorVersion: freezeRecord.benchmarkVersion,
    creationMethod: `Public document acquisition via DRA-ENG-009 from ${freezeRecord.sourceUrl}`,
    sourceReference: freezeRecord.sourceUrl,
    benchmarkStatus: "FROZEN",
    difficulty: approvedMetadata.difficulty,
    notes,
  };
}

// ---------------------------------------------------------------------------
// integrateWithCorpus
// ---------------------------------------------------------------------------

/**
 * Integrates a frozen acquisition document into the active CorpusRegistry.
 *
 * Steps:
 *   1. Build the CorpusDocumentInput from the freeze record and approved metadata.
 *   2. Call registry.add() — this is the sole mutation point.
 *   3. Export the updated manifest and verify its integrity.
 *   4. Return the updated manifest and its digest.
 *
 * On failure at any step, the partial result is not returned. The registry
 * itself is append-only: if add() succeeded but manifest verification failed,
 * the document IS in the registry (append-only cannot be undone), but the
 * error is surfaced so the caller can decide how to proceed.
 *
 * @param freezeRecord     The immutable per-document freeze record.
 * @param approvedMetadata Human-approved metadata.
 * @param registry         The active corpus registry to integrate into.
 * @returns                CorpusIntegrationResult.
 */
export function integrateWithCorpus(
  freezeRecord: AcquisitionFreezeRecord,
  approvedMetadata: ApprovedMetadata,
  registry: CorpusRegistry,
): CorpusIntegrationResult {
  const input = buildCorpusDocumentInput(freezeRecord, approvedMetadata);

  // Registry.add() throws on duplicate ID or duplicate digest.
  try {
    registry.add(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Distinguish duplicate-ID from duplicate-digest from other errors.
    if (
      message.toLowerCase().includes("duplicate") ||
      message.toLowerCase().includes("already")
    ) {
      if (message.toLowerCase().includes("digest")) {
        return {
          ok: false,
          code: "DUPLICATE_DIGEST",
          message: `Registry rejected document due to duplicate digest: ${message}`,
        };
      }
      return {
        ok: false,
        code: "DUPLICATE_CORPUS_ID",
        message: `Registry rejected document due to duplicate corpus ID: ${message}`,
      };
    }
    return {
      ok: false,
      code: "REGISTRY_ERROR",
      message: `Registry add failed: ${message}`,
    };
  }

  // Export the manifest and verify its integrity.
  const manifest = registry.exportManifest();
  const manifestIntegrityOk = verifyManifestIntegrity(manifest);

  if (!manifestIntegrityOk) {
    return {
      ok: false,
      code: "MANIFEST_INTEGRITY_FAILED",
      message: "Manifest integrity verification failed after corpus integration",
    };
  }

  return Object.freeze<CorpusIntegrationResult & { ok: true }>({
    ok: true,
    manifest,
    manifestDigest: manifest.overallDigest,
    corpusDocumentId: freezeRecord.corpusDocumentId,
  });
}
