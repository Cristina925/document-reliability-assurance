/**
 * DRA-001 — Benchmark Corpus Freeze Enforcement
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Implements a real freeze boundary (not metadata-only).
 *
 * Once frozen:
 *   - No documents may be added.
 *   - No documents may be removed.
 *   - No substantive metadata may be modified.
 *   - The corpus version may not change.
 *   - The protocol version may not change.
 *   - The allocation plan may not change.
 *   - The manifest must remain reproducible.
 *   - The freeze record is immutable.
 *
 * FreezeRecord contains:
 *   - corpusVersion, protocolVersion, documentCount, canonicalDocumentIds
 *   - manifestDigest, protocolDigest, allocationSummary
 *   - freezeStatus ("FROZEN")
 *   - freezeTimestamp (operational — excluded from freezeDigest)
 *   - freezeDigest (substantive — excludes freezeTimestamp)
 */

import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import type { CorpusId } from "../corpus/schema.js";
import type { CorpusRegistry } from "../corpus/registry.js";
import type { CorpusDocument } from "../corpus/schema.js";
import type { BenchmarkSelectionProtocol } from "./schema.js";
import type { CorpusVersion } from "./version.js";
import type { AllocationSnapshot } from "./allocation.js";

// ---------------------------------------------------------------------------
// FreezeRecord
// ---------------------------------------------------------------------------

export interface FreezeRecord {
  /** Corpus version at the time of freeze. Immutable after this point. */
  readonly corpusVersion: CorpusVersion;
  /** Protocol version that governed this corpus. */
  readonly protocolVersion: CorpusVersion;
  /** Number of documents in the frozen corpus. */
  readonly documentCount: number;
  /** Canonical (ascending numeric sequence) document IDs. */
  readonly canonicalDocumentIds: readonly CorpusId[];
  /** SHA-256 hex of the corpus manifest at freeze time. */
  readonly manifestDigest: string;
  /** SHA-256 hex of the governing selection protocol. */
  readonly protocolDigest: string;
  /** Canonical allocation snapshot at freeze time. */
  readonly allocationSummary: AllocationSnapshot;
  /** Always "FROZEN" — indicates a completed freeze. */
  readonly freezeStatus: "FROZEN";
  /** Operational metadata — excluded from freezeDigest. */
  readonly freezeTimestamp: string;
  /**
   * SHA-256 hex of all substantive fields.
   * Excludes: freezeTimestamp (operational), freezeDigest itself.
   */
  readonly freezeDigest: string;
}

// ---------------------------------------------------------------------------
// CorpusAlreadyFrozenError
// ---------------------------------------------------------------------------

export class CorpusAlreadyFrozenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CorpusAlreadyFrozenError";
    Object.setPrototypeOf(this, CorpusAlreadyFrozenError.prototype);
  }
}

// ---------------------------------------------------------------------------
// FrozenCorpus — immutable corpus snapshot with mutation enforcement
// ---------------------------------------------------------------------------

/**
 * An immutable snapshot of a frozen corpus.
 *
 * Wraps the document list and freeze record.  Any attempt to add or remove
 * documents throws CorpusAlreadyFrozenError, enforcing the freeze boundary
 * at runtime rather than relying on callers to check metadata.
 */
export class FrozenCorpus {
  private readonly _documents: readonly CorpusDocument[];
  private readonly _freeze: FreezeRecord;

  constructor(documents: readonly CorpusDocument[], freeze: FreezeRecord) {
    this._documents = Object.freeze([...documents]);
    this._freeze = Object.freeze({ ...freeze });
    Object.freeze(this);
  }

  /** Immutable list of documents in canonical order. */
  get documents(): readonly CorpusDocument[] {
    return this._documents;
  }

  /** The freeze record describing the frozen state. */
  get freeze(): FreezeRecord {
    return this._freeze;
  }

  /** Number of documents in the frozen corpus. */
  get documentCount(): number {
    return this._documents.length;
  }

  /** Throws — no documents may be added after freeze. */
  add(): never {
    throw new CorpusAlreadyFrozenError(
      "Cannot add documents to a frozen corpus",
    );
  }

  /** Throws — no documents may be removed after freeze. */
  remove(): never {
    throw new CorpusAlreadyFrozenError(
      "Cannot remove documents from a frozen corpus",
    );
  }

  /** Throws — no metadata may be modified after freeze. */
  modify(): never {
    throw new CorpusAlreadyFrozenError(
      "Cannot modify documents in a frozen corpus",
    );
  }
}

// ---------------------------------------------------------------------------
// computeFreezeDigest
// ---------------------------------------------------------------------------

/**
 * Computes the deterministic SHA-256 digest of a freeze record's substantive
 * fields.  Excludes `freezeTimestamp` (operational) and `freezeDigest` itself.
 */
export function computeFreezeDigest(
  corpusVersion: CorpusVersion,
  protocolVersion: CorpusVersion,
  documentCount: number,
  canonicalDocumentIds: readonly string[],
  manifestDigest: string,
  protocolDigest: string,
  allocationSummary: AllocationSnapshot,
): string {
  const payload = {
    allocationSummary,
    canonicalDocumentIds: [...canonicalDocumentIds],
    corpusVersion,
    documentCount,
    freezeStatus: "FROZEN",
    manifestDigest,
    protocolDigest,
    protocolVersion,
  };
  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// freezeCorpus
// ---------------------------------------------------------------------------

/**
 * Freezes a corpus registry under a given selection protocol and corpus version.
 *
 * Produces:
 *   - A FreezeRecord capturing the substantive state.
 *   - A FrozenCorpus wrapping the documents and enforcing the mutation boundary.
 *
 * The caller is responsible for ensuring the protocol status is APPROVED or
 * FROZEN before calling this function.
 *
 * @param registry        The corpus registry containing admitted documents.
 * @param protocol        The selection protocol governing the corpus.
 * @param allocationSummary  Final allocation snapshot.
 * @param corpusVersion   The corpus version to stamp into the freeze record.
 * @param options         Optional override for freeze timestamp.
 */
export function freezeCorpus(
  registry: CorpusRegistry,
  protocol: BenchmarkSelectionProtocol,
  allocationSummary: AllocationSnapshot,
  corpusVersion: CorpusVersion,
  options?: { timestamp?: string },
): { frozenCorpus: FrozenCorpus; freezeRecord: FreezeRecord } {
  const manifest = registry.exportManifest(corpusVersion);
  const ordered = registry.list();
  const canonicalDocumentIds = ordered.map((d) => d.corpusId);

  const freezeDigest = computeFreezeDigest(
    corpusVersion,
    protocol.protocolVersion,
    ordered.length,
    canonicalDocumentIds,
    manifest.overallDigest,
    protocol.protocolDigest,
    allocationSummary,
  );

  const freezeRecord: FreezeRecord = Object.freeze({
    corpusVersion,
    protocolVersion: protocol.protocolVersion,
    documentCount: ordered.length,
    canonicalDocumentIds: Object.freeze([...canonicalDocumentIds]) as readonly CorpusId[],
    manifestDigest: manifest.overallDigest,
    protocolDigest: protocol.protocolDigest,
    allocationSummary,
    freezeStatus: "FROZEN" as const,
    freezeTimestamp: options?.timestamp ?? new Date().toISOString(),
    freezeDigest,
  });

  const frozenCorpus = new FrozenCorpus(ordered, freezeRecord);
  return { frozenCorpus, freezeRecord };
}

// ---------------------------------------------------------------------------
// verifyCorpusFreeze
// ---------------------------------------------------------------------------

/**
 * Verifies that a freeze record has not been tampered with by recomputing
 * the substantive digest and comparing it to the stored `freezeDigest`.
 *
 * Returns true when the freeze record is authentic.
 * Returns false when any substantive field has been modified.
 *
 * Modifying only `freezeTimestamp` will NOT cause this to return false —
 * operational metadata is excluded by design.
 */
export function verifyCorpusFreeze(freezeRecord: FreezeRecord): boolean {
  const recomputed = computeFreezeDigest(
    freezeRecord.corpusVersion,
    freezeRecord.protocolVersion,
    freezeRecord.documentCount,
    freezeRecord.canonicalDocumentIds,
    freezeRecord.manifestDigest,
    freezeRecord.protocolDigest,
    freezeRecord.allocationSummary,
  );
  return recomputed === freezeRecord.freezeDigest;
}
