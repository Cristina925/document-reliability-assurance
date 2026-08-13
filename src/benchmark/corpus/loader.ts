/**
 * DRA-001 — Benchmark Corpus Loader
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * Loads a corpus from an array of raw documents.
 *
 * Load contract:
 *   1. Validates every document against CorpusDocumentInputSchema.
 *   2. Adds each document to a new CorpusRegistry (computing digests).
 *   3. Validates registry integrity (all digest round-trips).
 *   4. Optionally validates a provided manifest against the registry.
 *   5. Returns typed CorpusDocument objects on success.
 *   6. Returns an explicit LoadFailure on any validation error.
 *
 * Failures are explicit and typed — the loader never silently coerces
 * invalid data or partial results.
 */

import { CorpusRegistry, CorpusRegistryError } from "./registry.js";
import {
  validateCorpusDocumentInput,
  validateRegistryIntegrity,
  validateManifestAgainstRegistry,
  type ValidationFailure,
} from "./validation.js";
import type { CorpusDocument, CorpusManifest } from "./schema.js";

// ---------------------------------------------------------------------------
// LoadResult
// ---------------------------------------------------------------------------

export type LoadSuccess = {
  readonly ok: true;
  readonly registry: CorpusRegistry;
  readonly documents: readonly CorpusDocument[];
};

export type LoadFailure = {
  readonly ok: false;
  readonly code: LoadErrorCode;
  readonly message: string;
  /** Index of the offending document in the input array, if applicable. */
  readonly documentIndex?: number;
  /** The underlying validation failure, if applicable. */
  readonly validationFailure?: ValidationFailure;
};

export type LoadResult = LoadSuccess | LoadFailure;

export type LoadErrorCode =
  | "DOCUMENT_VALIDATION_FAILED"
  | "DUPLICATE_CORPUS_ID"
  | "DUPLICATE_INTEGRITY_DIGEST"
  | "REGISTRY_INTEGRITY_FAILED"
  | "MANIFEST_VALIDATION_FAILED";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadFail(
  code: LoadErrorCode,
  message: string,
  extras?: Pick<LoadFailure, "documentIndex" | "validationFailure">,
): LoadFailure {
  return { ok: false, code, message, ...extras };
}

// ---------------------------------------------------------------------------
// loadCorpus
// ---------------------------------------------------------------------------

/**
 * Loads a corpus from an array of raw (unknown) document objects.
 *
 * Steps:
 *   1. Parse and validate each element as CorpusDocumentInput.
 *   2. Add to a fresh CorpusRegistry (digest computed per document).
 *   3. Validate all registry digests (tamper detection).
 *   4. Optionally validate a provided manifest against the registry.
 *
 * @param rawDocuments  Array of unknown values to parse as corpus documents.
 * @param manifest      Optional CorpusManifest to validate against the registry.
 * @returns             LoadSuccess with registry and documents, or LoadFailure.
 */
export function loadCorpus(
  rawDocuments: readonly unknown[],
  manifest?: CorpusManifest,
): LoadResult {
  const registry = new CorpusRegistry();

  // Step 1 + 2: validate and register each document.
  for (let i = 0; i < rawDocuments.length; i++) {
    // Validate schema.
    const validationResult = validateCorpusDocumentInput(rawDocuments[i]);
    if (!validationResult.ok) {
      return loadFail(
        "DOCUMENT_VALIDATION_FAILED",
        `Document at index ${i} failed validation: ${validationResult.message}`,
        { documentIndex: i, validationFailure: validationResult },
      );
    }

    // Register (computes digest, checks duplicates).
    try {
      registry.add(validationResult.value);
    } catch (err) {
      if (err instanceof CorpusRegistryError) {
        const code =
          err.code === "DUPLICATE_CORPUS_ID"
            ? "DUPLICATE_CORPUS_ID"
            : "DUPLICATE_INTEGRITY_DIGEST";
        return loadFail(code, err.message, { documentIndex: i });
      }
      throw err; // Re-throw unexpected errors.
    }
  }

  // Step 3: validate registry integrity (all digest round-trips).
  const integrityResult = validateRegistryIntegrity(registry);
  if (!integrityResult.ok) {
    return loadFail("REGISTRY_INTEGRITY_FAILED", integrityResult.message, {
      validationFailure: integrityResult,
    });
  }

  // Step 4: optionally validate the provided manifest.
  if (manifest !== undefined) {
    const manifestResult = validateManifestAgainstRegistry(manifest, registry);
    if (!manifestResult.ok) {
      return loadFail(
        "MANIFEST_VALIDATION_FAILED",
        manifestResult.message,
        { validationFailure: manifestResult },
      );
    }
  }

  return {
    ok: true,
    registry,
    documents: registry.list(),
  };
}
