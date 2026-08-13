/**
 * DRA-001 — Benchmark Selection Protocol Schema
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Defines the BenchmarkSelectionProtocol — the governance document that
 * controls which documents may be admitted to the benchmark corpus, how
 * allocations are enforced, and what transitions are permitted.
 *
 * Protocol lifecycle (forward-only):
 *   DRAFT → APPROVED → FROZEN → SUPERSEDED
 *
 * Rules:
 *   1. A DRAFT protocol may be edited (returns new protocol with updated digest).
 *   2. An APPROVED protocol may admit documents.
 *   3. A FROZEN protocol may not be modified.
 *   4. A SUPERSEDED protocol remains readable but cannot admit new documents.
 *   5. Backward transitions are rejected.
 */

import { z } from "zod";
import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import {
  DomainSchema,
  DocumentTypeSchema,
  SourceTypeSchema,
  DifficultySchema,
  CORPUS_SCHEMA_VERSION,
  CorpusSchemaVersionSchema,
} from "../corpus/schema.js";
import type { Domain, DocumentType, SourceType, Difficulty } from "../corpus/schema.js";
import { CorpusVersionSchema, INITIAL_CORPUS_VERSION } from "./version.js";
import type { CorpusVersion } from "./version.js";
import { ExclusionReasonSchema } from "./exclusions.js";
import type { ExclusionReason } from "./exclusions.js";

// ---------------------------------------------------------------------------
// ProtocolStatus
// ---------------------------------------------------------------------------

export const PROTOCOL_STATUSES = ["DRAFT", "APPROVED", "FROZEN", "SUPERSEDED"] as const;
export type ProtocolStatus = (typeof PROTOCOL_STATUSES)[number];

export const ProtocolStatusSchema = z.enum(
  PROTOCOL_STATUSES as unknown as [string, ...string[]],
);

/**
 * The set of valid forward transitions from each status.
 * Backward transitions are not listed and are therefore rejected.
 */
export const VALID_PROTOCOL_TRANSITIONS: Readonly<
  Record<ProtocolStatus, readonly ProtocolStatus[]>
> = {
  DRAFT: ["APPROVED"],
  APPROVED: ["FROZEN", "SUPERSEDED"],
  FROZEN: ["SUPERSEDED"],
  SUPERSEDED: [],
};

// ---------------------------------------------------------------------------
// BenchmarkSelectionProtocol
// ---------------------------------------------------------------------------

/**
 * The governance document that controls corpus composition.
 *
 * All fields except `protocolDigest` are substantive — changing any of them
 * changes the digest.  `protocolDigest` is excluded from its own computation.
 */
export interface BenchmarkSelectionProtocol {
  /** Unique protocol identifier (human-readable, e.g. "DRA-PROTO-001"). */
  readonly protocolId: string;
  /** Corpus schema version this protocol was written against. */
  readonly schemaVersion: string;
  /** Corpus version this protocol governs. */
  readonly protocolVersion: CorpusVersion;
  /** Current lifecycle status. */
  readonly protocolStatus: ProtocolStatus;
  /** Total number of documents the corpus must contain when complete. */
  readonly targetCorpusSize: number;
  /** Domains that may appear in admitted documents. */
  readonly permittedDomains: readonly Domain[];
  /** Document types that may appear in admitted documents. */
  readonly permittedDocumentTypes: readonly DocumentType[];
  /** Source types that may appear in admitted documents. */
  readonly permittedSourceTypes: readonly SourceType[];
  /** BCP-47 language tags that are permitted. */
  readonly permittedLanguages: readonly string[];
  /** Target number of documents per domain (must sum to targetCorpusSize). */
  readonly domainAllocationTargets: Partial<Record<Domain, number>>;
  /** Target number of documents per document type (must sum to targetCorpusSize). */
  readonly documentTypeAllocationTargets: Partial<Record<DocumentType, number>>;
  /** Target number of documents per difficulty level (must sum to targetCorpusSize). */
  readonly difficultyAllocationTargets: Partial<Record<Difficulty, number>>;
  /** Machine-readable inclusion criteria (description strings). */
  readonly inclusionCriteria: readonly string[];
  /** Exclusion reasons that this protocol enforces. */
  readonly exclusionCriteria: readonly ExclusionReason[];
  /** Rules governing source admissibility. */
  readonly sourceAdmissibilityRules: readonly string[];
  /** Rules for handling exact-duplicate documents. */
  readonly duplicateHandlingRules: readonly string[];
  /** Rules for handling near-duplicate documents. */
  readonly nearDuplicateHandlingRules: readonly string[];
  /** Rules for replacing rejected or withdrawn documents. */
  readonly replacementRules: readonly string[];
  /** Rules that govern the corpus freeze. */
  readonly freezeRules: readonly string[];
  /** Rules that govern post-freeze amendments. */
  readonly amendmentRules: readonly string[];
  /** SHA-256 hex of all substantive fields. Excluded from its own computation. */
  readonly protocolDigest: string;
}

// ---------------------------------------------------------------------------
// Zod schema (for runtime validation of unknown data)
// ---------------------------------------------------------------------------

export const BenchmarkSelectionProtocolSchema = z.object({
  protocolId: z.string().min(1),
  schemaVersion: CorpusSchemaVersionSchema,
  protocolVersion: CorpusVersionSchema,
  protocolStatus: ProtocolStatusSchema,
  targetCorpusSize: z.number().int().positive(),
  permittedDomains: z.array(DomainSchema).min(1),
  permittedDocumentTypes: z.array(DocumentTypeSchema).min(1),
  permittedSourceTypes: z.array(SourceTypeSchema).min(1),
  permittedLanguages: z.array(z.string().min(1)).min(1),
  domainAllocationTargets: z.record(z.string(), z.number().int().nonnegative()),
  documentTypeAllocationTargets: z.record(z.string(), z.number().int().nonnegative()),
  difficultyAllocationTargets: z.record(z.string(), z.number().int().nonnegative()),
  inclusionCriteria: z.array(z.string()),
  exclusionCriteria: z.array(ExclusionReasonSchema),
  sourceAdmissibilityRules: z.array(z.string()),
  duplicateHandlingRules: z.array(z.string()),
  nearDuplicateHandlingRules: z.array(z.string()),
  replacementRules: z.array(z.string()),
  freezeRules: z.array(z.string()),
  amendmentRules: z.array(z.string()),
  protocolDigest: z.string().length(64),
});

// ---------------------------------------------------------------------------
// ProtocolInput — used for creation (no digest yet)
// ---------------------------------------------------------------------------

export type ProtocolInput = Omit<BenchmarkSelectionProtocol, "protocolDigest">;

// ---------------------------------------------------------------------------
// computeProtocolDigest
// ---------------------------------------------------------------------------

/**
 * Computes the deterministic SHA-256 digest of the selection protocol's
 * substantive fields.  The `protocolDigest` field itself is excluded.
 */
export function computeProtocolDigest(input: ProtocolInput): string {
  const payload = {
    amendmentRules: [...input.amendmentRules].sort(),
    difficultyAllocationTargets: input.difficultyAllocationTargets,
    documentTypeAllocationTargets: input.documentTypeAllocationTargets,
    domainAllocationTargets: input.domainAllocationTargets,
    duplicateHandlingRules: [...input.duplicateHandlingRules].sort(),
    exclusionCriteria: [...input.exclusionCriteria].sort(),
    freezeRules: [...input.freezeRules].sort(),
    inclusionCriteria: [...input.inclusionCriteria].sort(),
    nearDuplicateHandlingRules: [...input.nearDuplicateHandlingRules].sort(),
    permittedDocumentTypes: [...input.permittedDocumentTypes].sort(),
    permittedDomains: [...input.permittedDomains].sort(),
    permittedLanguages: [...input.permittedLanguages].sort(),
    permittedSourceTypes: [...input.permittedSourceTypes].sort(),
    protocolId: input.protocolId,
    protocolStatus: input.protocolStatus,
    protocolVersion: input.protocolVersion,
    replacementRules: [...input.replacementRules].sort(),
    schemaVersion: input.schemaVersion,
    sourceAdmissibilityRules: [...input.sourceAdmissibilityRules].sort(),
    targetCorpusSize: input.targetCorpusSize,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// createProtocol
// ---------------------------------------------------------------------------

/**
 * Creates a new BenchmarkSelectionProtocol in DRAFT status.
 * Computes and embeds the `protocolDigest` automatically.
 * The returned object is frozen.
 */
export function createProtocol(input: ProtocolInput): BenchmarkSelectionProtocol {
  return Object.freeze({
    ...input,
    protocolDigest: computeProtocolDigest(input),
  });
}

// ---------------------------------------------------------------------------
// transitionProtocol
// ---------------------------------------------------------------------------

export class ProtocolTransitionError extends Error {
  public readonly code: ProtocolTransitionErrorCode;
  constructor(message: string, code: ProtocolTransitionErrorCode) {
    super(message);
    this.name = "ProtocolTransitionError";
    this.code = code;
    Object.setPrototypeOf(this, ProtocolTransitionError.prototype);
  }
}

export type ProtocolTransitionErrorCode =
  | "BACKWARD_TRANSITION"
  | "INVALID_TRANSITION"
  | "FROZEN_MODIFICATION";

/**
 * Transitions a protocol to a new status.
 * Returns a new frozen protocol with the updated status and recomputed digest.
 *
 * @throws ProtocolTransitionError on backward or invalid transitions.
 */
export function transitionProtocol(
  protocol: BenchmarkSelectionProtocol,
  to: ProtocolStatus,
): BenchmarkSelectionProtocol {
  const allowed = VALID_PROTOCOL_TRANSITIONS[protocol.protocolStatus];
  if (!allowed.includes(to)) {
    const isBackward =
      PROTOCOL_STATUSES.indexOf(to) < PROTOCOL_STATUSES.indexOf(protocol.protocolStatus);
    throw new ProtocolTransitionError(
      `Cannot transition from ${protocol.protocolStatus} to ${to}`,
      isBackward ? "BACKWARD_TRANSITION" : "INVALID_TRANSITION",
    );
  }
  const updated: ProtocolInput = { ...protocol, protocolStatus: to };
  return createProtocol(updated);
}

/**
 * Returns true when a protocol is in a state that permits document admission.
 * Only APPROVED protocols may admit documents.
 */
export function canAdmitDocuments(protocol: BenchmarkSelectionProtocol): boolean {
  return protocol.protocolStatus === "APPROVED";
}

// ---------------------------------------------------------------------------
// Convenience factory for tests and fixtures
// ---------------------------------------------------------------------------

/**
 * Builds a minimal DRAFT protocol with a single domain/type/difficulty target.
 * Not for production use — for tests only.
 */
export function buildMinimalProtocol(
  overrides: Partial<ProtocolInput> = {},
): BenchmarkSelectionProtocol {
  const base: ProtocolInput = {
    protocolId: "DRA-PROTO-TEST-001",
    schemaVersion: CORPUS_SCHEMA_VERSION,
    protocolVersion: INITIAL_CORPUS_VERSION as CorpusVersion,
    protocolStatus: "DRAFT",
    targetCorpusSize: 6,
    permittedDomains: ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"],
    permittedDocumentTypes: ["SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY", "PROCEDURE", "ARTICLE", "OTHER"],
    permittedSourceTypes: ["HUMAN_AUTHORED", "AI_GENERATED", "HYBRID"],
    permittedLanguages: ["en", "en-GB"],
    domainAllocationTargets: { GENERAL: 1, BUSINESS: 1, TECHNICAL: 1, LEGAL: 1, HEALTHCARE: 1, FINANCE: 1 },
    documentTypeAllocationTargets: { SUMMARY: 2, REPORT: 2, POLICY: 2 },
    difficultyAllocationTargets: { LOW: 2, MEDIUM: 2, HIGH: 2 },
    inclusionCriteria: ["Must have valid corpus ID", "Must have complete metadata"],
    exclusionCriteria: [
      "INVALID_SCHEMA",
      "DUPLICATE_CONTENT",
      "EVALUATOR_INFLUENCED_SELECTION",
      "PREANNOTATED_OUTCOME",
    ],
    sourceAdmissibilityRules: ["Source must be verifiable"],
    duplicateHandlingRules: ["Exact SHA-256 duplicates are rejected"],
    nearDuplicateHandlingRules: ["Jaccard >= 0.80 are rejected"],
    replacementRules: ["Replacement requires new corpus version"],
    freezeRules: ["Freeze requires APPROVED protocol"],
    amendmentRules: ["Amendments must increment the corpus version"],
    ...overrides,
  };
  return createProtocol(base);
}
