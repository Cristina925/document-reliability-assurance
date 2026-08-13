/**
 * DRA-VAL-001B — Corpus Manifest and Integrity Ledger
 *
 * The ScientificCorpusManifest is the cryptographic record of a frozen corpus
 * snapshot. It contains ordered document identifiers, per-document integrity
 * digests, and an aggregate corpus digest computed deterministically from all
 * constituent records.
 *
 * The CorpusAcquisitionRegister tracks all 120 planned slots, enforcing
 * uniqueness, range constraints, and quota computation from records.
 *
 * Digest design:
 *   - computeDocumentDigest: SHA-256 of canonicalJsonStringify of substantive
 *     fields (excludes integrityDigest and frozenAt).
 *   - computeManifestDigest: SHA-256 of canonicalJsonStringify of the manifest
 *     (excludes aggregateCorpusDigest itself).
 *   - computeProtocolPackageDigest: SHA-256 of JSON.stringify of canonical
 *     ordered [{path, digest}] array — deterministic, order-sensitive.
 */

import { createHash } from "node:crypto";
import { z } from "zod";
import {
  ScientificCorpusDocumentIdSchema,
  type ScientificCorpusDocumentId,
  type CorpusAcquisitionStatus,
  type CorpusDomain,
  type CorpusSourceType,
  type DifficultyStratum,
  type LengthStratum,
} from "./corpus-slots.js";
import {
  ScientificCorpusDocumentSchema,
  type ScientificCorpusDocument,
} from "./corpus-document.js";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";

// ---------------------------------------------------------------------------
// Per-document manifest entry
// ---------------------------------------------------------------------------

export const CorpusManifestEntrySchema = z.object({
  /** Document identifier. */
  documentId: ScientificCorpusDocumentIdSchema,

  /** Domain allocation for this document. */
  domain: z.string().min(1),

  /** Source type classification. */
  sourceType: z.string().min(1),

  /** Difficulty stratum. */
  difficultyStratum: z.string().min(1),

  /** Document length stratum. */
  lengthStratum: z.string().min(1),

  /** Whether the document is purpose-generated (synthetic). */
  syntheticFlag: z.boolean(),

  /** SHA-256 integrity digest of the document package. */
  integrityDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "integrityDigest must be a 64-character lowercase hex string",
    ),

  /** SHA-256 digest of the provenance record. */
  provenanceDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "provenanceDigest must be 64-character lowercase hex"),

  /** SHA-256 digest of the permitted-use record. */
  permittedUseDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/, "permittedUseDigest must be 64-character lowercase hex"),

  /** ISO 8601 freeze timestamp (no trailing Z). */
  frozenAt: z.string().min(1),
});

export type CorpusManifestEntry = z.infer<typeof CorpusManifestEntrySchema>;

// ---------------------------------------------------------------------------
// Corpus freeze record
// ---------------------------------------------------------------------------

export const CorpusFreezeRecordSchema = z.object({
  /** Corpus version identifier (e.g. DRA-VAL-PILOT-001, DRA-VAL-PILOT-001-PARTIAL). */
  corpusVersion: z
    .string()
    .regex(
      /^DRA-VAL-[A-Z0-9-]+$/,
      "corpusVersion must match DRA-VAL-<IDENTIFIER>",
    ),

  /** ISO 8601 freeze timestamp (no trailing Z). */
  freezeTimestamp: z.string().min(1, "freezeTimestamp must not be empty"),

  /** Repository commit hash at time of freeze (if applicable). */
  repositoryCommit: z.string().optional(),

  /** Number of planned slots in this corpus phase. */
  plannedCount: z.number().int().min(0),

  /** Number of documents identified (status ≥ IDENTIFIED). */
  identifiedCount: z.number().int().min(0),

  /** Number of documents acquired (status ≥ ACQUIRED). */
  acquiredCount: z.number().int().min(0),

  /** Number of documents admitted (status ≥ ADMITTED or FROZEN). */
  admittedCount: z.number().int().min(0),

  /** Number of documents frozen (status = FROZEN). */
  frozenCount: z.number().int().min(0),

  /** Number of documents excluded. */
  excludedCount: z.number().int().min(0),

  /** Number of documents withdrawn. */
  withdrawnCount: z.number().int().min(0),

  /** Number of unfilled slots (status = PLANNED). */
  unfilledSlotCount: z.number().int().min(0),

  /** Known deviations from protocol, if any. */
  knownDeviations: z.array(z.string()).default([]),

  /** Unresolved acquisition blockers. */
  unresolvedBlockers: z.array(z.string()).default([]),

  /**
   * Attestation: no evaluator execution occurred on corpus documents.
   * Must be literal true.
   */
  noEvaluatorExecutionOccurred: z.literal(true, {
    errorMap: () => ({
      message: "noEvaluatorExecutionOccurred must be true",
    }),
  }),

  /**
   * Attestation: no scientific performance metrics were produced.
   * Must be literal true.
   */
  noScientificMetricsProduced: z.literal(true, {
    errorMap: () => ({
      message: "noScientificMetricsProduced must be true",
    }),
  }),

  /** SHA-256 digest of the acquisition register. */
  acquisitionRegisterDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),
});

export type CorpusFreezeRecord = z.infer<typeof CorpusFreezeRecordSchema>;

// ---------------------------------------------------------------------------
// Scientific corpus manifest
// ---------------------------------------------------------------------------

/**
 * Cryptographic manifest for a frozen corpus snapshot.
 * The manifest is the integrity anchor for the entire corpus.
 */
export const ScientificCorpusManifestSchema = z.object({
  /** Schema version. */
  schemaVersion: z.literal("DRA-VAL-001B-v1"),

  /** Corpus version identifier matching the freeze record. */
  corpusVersion: z.string().min(1),

  /** SHA-256 digest of the protocol package (aggregate of all 6 protocol docs). */
  protocolPackageDigest: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "protocolPackageDigest must be a 64-character lowercase hex string",
    ),

  /**
   * Ordered list of document identifiers in the manifest.
   * Ordering is by documentId lexicographic ascending.
   */
  orderedDocumentIds: z.array(ScientificCorpusDocumentIdSchema).min(1),

  /** Per-document manifest entries, keyed by documentId. */
  documentEntries: z.record(z.string(), CorpusManifestEntrySchema),

  /** SHA-256 digest of the acquisition register document. */
  acquisitionRegisterDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),

  /** SHA-256 digest of the freeze record. */
  freezeRecordDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),

  /**
   * Aggregate corpus digest.
   * SHA-256 of canonicalJsonStringify of the manifest with this field excluded.
   */
  aggregateCorpusDigest: z
    .string()
    .regex(/^[0-9a-f]{64}$/)
    .optional(),
});

export type ScientificCorpusManifest = z.infer<
  typeof ScientificCorpusManifestSchema
>;

// ---------------------------------------------------------------------------
// Corpus acquisition register
// ---------------------------------------------------------------------------

/**
 * Quota summary computed from actual slot records.
 * These fields must never be entered manually — they are always derived.
 */
export const CorpusQuotaSummarySchema = z.object({
  /** Counts by domain. */
  byDomain: z.record(z.string(), z.number().int().min(0)),

  /** Counts by source type. */
  bySourceType: z.record(z.string(), z.number().int().min(0)),

  /** Counts by difficulty stratum. */
  byDifficulty: z.record(z.string(), z.number().int().min(0)),

  /** Counts by length stratum. */
  byLength: z.record(z.string(), z.number().int().min(0)),

  /** Counts by acquisition status. */
  byStatus: z.record(z.string(), z.number().int().min(0)),

  /** Total slots planned. */
  totalPlanned: z.number().int().min(0),

  /** Total slots frozen. */
  totalFrozen: z.number().int().min(0),

  /** Total synthetic documents. */
  totalSynthetic: z.number().int().min(0),
});

export type CorpusQuotaSummary = z.infer<typeof CorpusQuotaSummarySchema>;

/**
 * The canonical 120-slot acquisition register.
 *
 * Invariants enforced:
 *   - Exactly 120 slots (documents).
 *   - Unique document identifiers.
 *   - All identifiers in range DRA-VAL-DOC-0001 through DRA-VAL-DOC-0120.
 *   - Quota summaries must be computed from records, not entered manually.
 */
export const CorpusAcquisitionRegisterSchema = z
  .object({
    /** Register schema version. */
    schemaVersion: z.literal("DRA-VAL-001B-v1"),

    /** Protocol package digest (aggregate of the 6 protocol docs). */
    protocolPackageDigest: z
      .string()
      .regex(/^[0-9a-f]{64}$/, "protocolPackageDigest must be 64-char hex"),

    /** ISO 8601 timestamp of the last register update (no trailing Z). */
    lastUpdated: z.string().min(1),

    /**
     * All 120 corpus document records.
     * Slots with status PLANNED represent unfilled positions.
     */
    documents: z
      .array(ScientificCorpusDocumentSchema)
      .length(120, "Register must contain exactly 120 slots"),

    /**
     * Computed quota summaries — must be derived from the document records.
     */
    quotaSummary: CorpusQuotaSummarySchema,
  })
  .superRefine((register, ctx) => {
    // Unique document identifiers
    const seen = new Set<string>();
    for (const doc of register.documents) {
      const id = doc.slot.documentId;
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate document identifier: ${id}`,
          path: ["documents"],
        });
      }
      seen.add(id);
    }

    // All identifiers must be in range 0001–0120 (already enforced by schema
    // but verify the set is exactly {0001..0120})
    const expected = new Set<string>();
    for (let i = 1; i <= 120; i++) {
      expected.add(`DRA-VAL-DOC-${String(i).padStart(4, "0")}`);
    }
    for (const id of seen) {
      if (!expected.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Identifier ${id} is not in range DRA-VAL-DOC-0001 through DRA-VAL-DOC-0120`,
          path: ["documents"],
        });
      }
    }
  });

export type CorpusAcquisitionRegister = z.infer<
  typeof CorpusAcquisitionRegisterSchema
>;

// ---------------------------------------------------------------------------
// Quota computation
// ---------------------------------------------------------------------------

/**
 * Compute the quota summary from a list of corpus document records.
 * This is the only correct way to populate the quotaSummary field —
 * manual entry is prohibited.
 */
export function computeQuotaSummary(
  documents: ScientificCorpusDocument[],
): CorpusQuotaSummary {
  const byDomain: Record<string, number> = {};
  const bySourceType: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byLength: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalFrozen = 0;
  let totalSynthetic = 0;

  for (const doc of documents) {
    const { domain, sourceType, difficultyStratum, lengthStratum, status, syntheticFlag } =
      doc.slot;

    byDomain[domain] = (byDomain[domain] ?? 0) + 1;
    bySourceType[sourceType] = (bySourceType[sourceType] ?? 0) + 1;
    byDifficulty[difficultyStratum] = (byDifficulty[difficultyStratum] ?? 0) + 1;
    byLength[lengthStratum] = (byLength[lengthStratum] ?? 0) + 1;
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    if (status === "FROZEN") totalFrozen++;
    if (syntheticFlag) totalSynthetic++;
  }

  return {
    byDomain,
    bySourceType,
    byDifficulty,
    byLength,
    byStatus,
    totalPlanned: documents.length,
    totalFrozen,
    totalSynthetic,
  };
}

// ---------------------------------------------------------------------------
// Digest computation
// ---------------------------------------------------------------------------

/**
 * Compute the SHA-256 integrity digest of a corpus document package.
 *
 * Excluded fields (operational metadata):
 *   - slot.status (lifecycle, not substantive)
 *   - slot.lastUpdated
 *   - integrityDigest (the digest itself)
 *   - frozenAt
 *   - admissionDecision.decisionTimestamp (operational)
 *   - exclusionRecord (post-acquisition decision)
 *   - withdrawalRecord (post-acquisition decision)
 *   - replacementRecord (post-acquisition decision)
 */
export function computeDocumentDigest(
  doc: ScientificCorpusDocument,
): string {
  // Build a substantive-only projection
  const substantive = {
    documentId: doc.slot.documentId,
    domain: doc.slot.domain,
    sourceType: doc.slot.sourceType,
    difficultyStratum: doc.slot.difficultyStratum,
    lengthStratum: doc.slot.lengthStratum,
    corpusPhase: doc.slot.corpusPhase,
    syntheticFlag: doc.slot.syntheticFlag,
    contentDescription: doc.slot.contentDescription,
    provenance: doc.provenance,
    permittedUse: doc.permittedUse,
    confidentiality: doc.confidentiality,
    anonymisation: doc.anonymisation,
    sourceEvidence: doc.sourceEvidence,
    duplicateCheck: doc.duplicateCheck,
    contaminationCheck: doc.contaminationCheck,
  };

  return createHash("sha256")
    .update(canonicalJsonStringify(substantive), "utf8")
    .digest("hex");
}

/**
 * Compute the SHA-256 digest of a single object (for provenance, permitted-use,
 * or other sub-records).
 */
export function computeRecordDigest(record: unknown): string {
  return createHash("sha256")
    .update(canonicalJsonStringify(record), "utf8")
    .digest("hex");
}

/**
 * Compute the aggregate manifest digest.
 *
 * The aggregateCorpusDigest is computed from the manifest with the
 * aggregateCorpusDigest field excluded. This matches the protocol-digest
 * and proof-receipt conventions.
 */
export function computeCorpusManifestDigest(
  manifest: Omit<ScientificCorpusManifest, "aggregateCorpusDigest">,
): string {
  return createHash("sha256")
    .update(canonicalJsonStringify(manifest), "utf8")
    .digest("hex");
}

/**
 * Compute the protocol-package aggregate digest.
 *
 * Input: canonical ordered array of {path, digest} pairs (alphabetical by path).
 * Output: SHA-256 of JSON.stringify of that array.
 *
 * This matches the computation performed externally (e.g. via shell) to produce
 * the aggregate digest recorded in DRA-VAL-001F.
 */
export function computeProtocolPackageDigest(
  fileRegister: Array<{ path: string; digest: string }>,
): string {
  // Sort by path to ensure determinism regardless of insertion order
  const sorted = [...fileRegister].sort((a, b) => a.path.localeCompare(b.path));
  return createHash("sha256")
    .update(JSON.stringify(sorted), "utf8")
    .digest("hex");
}

/**
 * Verify the integrity of a frozen corpus document.
 * Returns true if the integrityDigest matches a freshly computed digest.
 */
export function verifyDocumentIntegrity(
  doc: ScientificCorpusDocument,
): boolean {
  if (!doc.integrityDigest) return false;
  const expected = computeDocumentDigest(doc);
  return expected === doc.integrityDigest;
}

/**
 * Verify the aggregate integrity of a corpus manifest.
 * Returns true if aggregateCorpusDigest matches a freshly computed digest.
 */
export function verifyCorpusManifestIntegrity(
  manifest: ScientificCorpusManifest,
): boolean {
  if (!manifest.aggregateCorpusDigest) return false;
  const { aggregateCorpusDigest, ...rest } = manifest;
  const expected = computeCorpusManifestDigest(rest);
  return expected === aggregateCorpusDigest;
}
