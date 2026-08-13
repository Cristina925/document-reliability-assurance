/**
 * DRA-001 — Benchmark Corpus Registry
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * In-memory registry for corpus documents.  Provides:
 *   - Duplicate corpus ID rejection.
 *   - Duplicate integrity digest rejection.
 *   - Canonical list ordering (ascending by numeric sequence number).
 *   - Manifest export.
 *   - Deterministic integrity digest computation on add.
 *
 * The registry is append-only; removal is not supported.
 * This preserves the append-only guarantee described in DRA-001-04A.
 */

import {
  CORPUS_SCHEMA_VERSION,
  corpusIdSequence,
  type CorpusDocument,
  type CorpusDocumentInput,
  type CorpusManifest,
} from "./schema.js";
import { INITIAL_CORPUS_VERSION } from "../governance/version.js";
import {
  computeCorpusDocumentDigest,
  computeManifestDigest,
} from "./integrity.js";

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Thrown when a corpus document is rejected by the registry. */
export class CorpusRegistryError extends Error {
  public readonly code: CorpusRegistryErrorCode;

  constructor(message: string, code: CorpusRegistryErrorCode) {
    super(message);
    this.name = "CorpusRegistryError";
    this.code = code;
    Object.setPrototypeOf(this, CorpusRegistryError.prototype);
  }
}

export type CorpusRegistryErrorCode =
  | "DUPLICATE_CORPUS_ID"
  | "DUPLICATE_INTEGRITY_DIGEST"
  | "NOT_FOUND";

// ---------------------------------------------------------------------------
// CorpusRegistry
// ---------------------------------------------------------------------------

/**
 * Registry of benchmark corpus documents.
 *
 * Documents are stored in insertion order internally; all list() operations
 * return documents sorted by numeric corpusId sequence number (canonical order).
 *
 * The registry does not persist to disk; persistence is the caller's concern.
 */
export class CorpusRegistry {
  /** Primary index: corpusId → CorpusDocument. */
  private readonly _byId: Map<string, CorpusDocument> = new Map();

  /** Deduplication index: integrityDigest → corpusId. */
  private readonly _byDigest: Map<string, string> = new Map();

  // -------------------------------------------------------------------------
  // add
  // -------------------------------------------------------------------------

  /**
   * Adds a corpus document to the registry.
   *
   * The integrity digest is computed from the substantive fields of the input.
   * The caller must NOT pre-compute the digest; the registry is the single
   * authority for digest computation to prevent inconsistency.
   *
   * @param input  Substantive corpus document fields (without integrityDigest).
   * @returns      The fully-registered CorpusDocument including integrityDigest.
   * @throws       CorpusRegistryError if the corpusId or digest already exists.
   */
  add(input: CorpusDocumentInput): CorpusDocument {
    // Check for duplicate corpus ID.
    if (this._byId.has(input.corpusId)) {
      throw new CorpusRegistryError(
        `Corpus ID already registered: ${input.corpusId}`,
        "DUPLICATE_CORPUS_ID",
      );
    }

    // Compute integrity digest.
    const integrityDigest = computeCorpusDocumentDigest(input);

    // Check for duplicate digest (catches content-identical documents with
    // different IDs — which would indicate a corpus management error).
    const existingId = this._byDigest.get(integrityDigest);
    if (existingId !== undefined) {
      throw new CorpusRegistryError(
        `Integrity digest already registered (existing: ${existingId}, incoming: ${input.corpusId})`,
        "DUPLICATE_INTEGRITY_DIGEST",
      );
    }

    const doc: CorpusDocument = Object.freeze({ ...input, integrityDigest });

    this._byId.set(input.corpusId, doc);
    this._byDigest.set(integrityDigest, input.corpusId);

    return doc;
  }

  // -------------------------------------------------------------------------
  // get
  // -------------------------------------------------------------------------

  /**
   * Retrieves a corpus document by its corpus ID.
   *
   * @param id  A corpus ID string (e.g. "DRA-DOC-0001").
   * @returns   The CorpusDocument, or undefined if not found.
   */
  get(id: string): CorpusDocument | undefined {
    return this._byId.get(id);
  }

  /**
   * Retrieves a corpus document by its corpus ID, throwing if not found.
   *
   * @throws CorpusRegistryError with code NOT_FOUND.
   */
  require(id: string): CorpusDocument {
    const doc = this._byId.get(id);
    if (doc === undefined) {
      throw new CorpusRegistryError(
        `Corpus document not found: ${id}`,
        "NOT_FOUND",
      );
    }
    return doc;
  }

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------

  /**
   * Returns all registered corpus documents in canonical order.
   *
   * Canonical order: ascending by numeric sequence number
   * (DRA-DOC-0001 < DRA-DOC-0002 < ...).
   *
   * @returns  An immutable array of CorpusDocument objects.
   */
  list(): readonly CorpusDocument[] {
    return [...this._byId.values()].sort(
      (a, b) => corpusIdSequence(a.corpusId) - corpusIdSequence(b.corpusId),
    );
  }

  // -------------------------------------------------------------------------
  // size
  // -------------------------------------------------------------------------

  /** Number of documents currently registered. */
  get size(): number {
    return this._byId.size;
  }

  // -------------------------------------------------------------------------
  // has
  // -------------------------------------------------------------------------

  /** Returns true if the given corpus ID is already registered. */
  hasId(id: string): boolean {
    return this._byId.has(id);
  }

  /** Returns true if the given integrity digest is already registered. */
  hasDigest(digest: string): boolean {
    return this._byDigest.has(digest);
  }

  // -------------------------------------------------------------------------
  // exportManifest
  // -------------------------------------------------------------------------

  /**
   * Exports a CorpusManifest that describes the current registry state.
   *
   * The manifest is deterministic: the same registry state always produces
   * the same manifest and the same overallDigest.
   *
   * @param corpusVersion  Caller-supplied version string for this corpus instance.
   * @returns              A frozen CorpusManifest.
   */
  exportManifest(corpusVersion: string = INITIAL_CORPUS_VERSION): CorpusManifest {
    const ordered = this.list();
    const documentIds = ordered.map((d) => d.corpusId);
    const documentCount = ordered.length;

    const overallDigest = computeManifestDigest(
      CORPUS_SCHEMA_VERSION,
      corpusVersion,
      documentCount,
      documentIds,
    );

    return Object.freeze({
      schemaVersion: CORPUS_SCHEMA_VERSION,
      corpusVersion,
      documentCount,
      documentIds,
      overallDigest,
    });
  }
}
