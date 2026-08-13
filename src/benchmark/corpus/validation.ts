/**
 * DRA-001 — Benchmark Corpus Validation
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * Provides explicit, typed validation for all corpus entities.
 * All validators return a discriminated-union result — they never throw
 * and never silently accept invalid input.
 *
 * Validation rules enforced:
 *   - Duplicate IDs
 *   - Duplicate digests
 *   - Invalid enum values (Domain, DocumentType, Difficulty, BenchmarkStatus, SourceType)
 *   - Missing required fields
 *   - Malformed corpus identifiers
 *   - Invalid manifest
 *   - Invalid integrity digest
 *   - Invalid schema version
 */

import { z, type ZodError } from "zod";
import {
  CorpusDocumentInputSchema,
  CorpusDocumentSchema,
  CorpusManifestSchema,
  CORPUS_ID_REGEX,
  type CorpusDocumentInput,
  type CorpusDocument,
  type CorpusManifest,
} from "./schema.js";
import {
  verifyCorpusDocumentIntegrity,
  verifyManifestIntegrity,
} from "./integrity.js";
import type { CorpusRegistry } from "./registry.js";

// ---------------------------------------------------------------------------
// ValidationResult
// ---------------------------------------------------------------------------

export type ValidationSuccess<T> = {
  readonly ok: true;
  readonly value: T;
};

export type ValidationFailure = {
  readonly ok: false;
  readonly code: ValidationErrorCode;
  readonly message: string;
  /** Structured Zod issues when schema parsing failed; undefined otherwise. */
  readonly zodIssues?: z.ZodIssue[];
};

export type ValidationResult<T = void> = ValidationSuccess<T> | ValidationFailure;

export type ValidationErrorCode =
  | "INVALID_CORPUS_ID"
  | "INVALID_SCHEMA"
  | "INVALID_ENUM"
  | "MISSING_REQUIRED_FIELD"
  | "DUPLICATE_ID"
  | "DUPLICATE_DIGEST"
  | "INTEGRITY_DIGEST_MISMATCH"
  | "INVALID_MANIFEST"
  | "MANIFEST_DIGEST_MISMATCH"
  | "INVALID_SCHEMA_VERSION";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ok<T>(value: T): ValidationSuccess<T> {
  return { ok: true, value };
}

function fail(
  code: ValidationErrorCode,
  message: string,
  zodIssues?: z.ZodIssue[],
): ValidationFailure {
  return { ok: false, code, message, zodIssues };
}

function classifyZodError(
  error: ZodError,
  entityLabel: string,
): ValidationFailure {
  // Check for enum issues first.
  const enumIssue = error.issues.find((i) => i.code === "invalid_enum_value");
  if (enumIssue) {
    return fail(
      "INVALID_ENUM",
      `${entityLabel}: invalid enum value at ${enumIssue.path.join(".")}: ${enumIssue.message}`,
      error.issues,
    );
  }

  // Check for invalid_literal / schema version mismatch.
  const literalIssue = error.issues.find(
    (i) =>
      i.code === "invalid_literal" ||
      (i.code === "invalid_union_discriminator" &&
        i.path.includes("schemaVersion")),
  );
  if (literalIssue) {
    return fail(
      "INVALID_SCHEMA_VERSION",
      `${entityLabel}: invalid schema version at ${literalIssue.path.join(".")}: ${literalIssue.message}`,
      error.issues,
    );
  }

  // Check for any field with a path that implies a required field is missing.
  const missingIssue = error.issues.find((i) => i.code === "invalid_type" && i.received === "undefined");
  if (missingIssue) {
    return fail(
      "MISSING_REQUIRED_FIELD",
      `${entityLabel}: missing required field at ${missingIssue.path.join(".")}: ${missingIssue.message}`,
      error.issues,
    );
  }

  return fail(
    "INVALID_SCHEMA",
    `${entityLabel}: schema validation failed — ${error.issues[0]?.message ?? "unknown error"}`,
    error.issues,
  );
}

// ---------------------------------------------------------------------------
// validateCorpusId
// ---------------------------------------------------------------------------

/**
 * Validates a corpus document identifier.
 *
 * @returns ok({ value: id }) if valid; fail with INVALID_CORPUS_ID otherwise.
 */
export function validateCorpusId(
  value: unknown,
): ValidationResult<string> {
  if (typeof value !== "string") {
    return fail(
      "INVALID_CORPUS_ID",
      `Corpus ID must be a string, received ${value === null ? "null" : typeof value}`,
    );
  }
  if (!CORPUS_ID_REGEX.test(value)) {
    return fail(
      "INVALID_CORPUS_ID",
      `Corpus ID must match DRA-DOC-NNNN format, received "${value}"`,
    );
  }
  return ok(value);
}

// ---------------------------------------------------------------------------
// validateCorpusDocumentInput
// ---------------------------------------------------------------------------

/**
 * Validates a raw unknown value as a CorpusDocumentInput.
 * Does not check for duplicate IDs or digests (that is registry responsibility).
 */
export function validateCorpusDocumentInput(
  value: unknown,
): ValidationResult<CorpusDocumentInput> {
  const result = CorpusDocumentInputSchema.safeParse(value);
  if (!result.success) {
    return classifyZodError(result.error, "CorpusDocumentInput");
  }
  return ok(result.data);
}

// ---------------------------------------------------------------------------
// validateCorpusDocument
// ---------------------------------------------------------------------------

/**
 * Validates a raw unknown value as a CorpusDocument (with integrityDigest).
 * Also verifies the stored integrityDigest against recomputed value.
 */
export function validateCorpusDocument(
  value: unknown,
): ValidationResult<CorpusDocument> {
  const result = CorpusDocumentSchema.safeParse(value);
  if (!result.success) {
    return classifyZodError(result.error, "CorpusDocument");
  }
  const doc = result.data;

  // Verify the stored integrity digest.
  if (!verifyCorpusDocumentIntegrity(doc)) {
    return fail(
      "INTEGRITY_DIGEST_MISMATCH",
      `Integrity digest mismatch for corpus document ${doc.corpusId}`,
    );
  }

  return ok(doc);
}

// ---------------------------------------------------------------------------
// validateRegistryIntegrity
// ---------------------------------------------------------------------------

/**
 * Validates that every document in the registry has a correct integrity digest.
 * Used by the loader to detect post-registration tampering.
 */
export function validateRegistryIntegrity(
  registry: CorpusRegistry,
): ValidationResult {
  for (const doc of registry.list()) {
    if (!verifyCorpusDocumentIntegrity(doc)) {
      return fail(
        "INTEGRITY_DIGEST_MISMATCH",
        `Integrity digest mismatch for corpus document ${doc.corpusId}`,
      );
    }
  }
  return ok(undefined);
}

// ---------------------------------------------------------------------------
// validateManifest
// ---------------------------------------------------------------------------

/**
 * Validates a raw unknown value as a CorpusManifest and verifies its
 * overall digest.
 */
export function validateManifest(
  value: unknown,
): ValidationResult<CorpusManifest> {
  const result = CorpusManifestSchema.safeParse(value);
  if (!result.success) {
    return classifyZodError(result.error, "CorpusManifest");
  }
  const manifest = result.data;

  if (!verifyManifestIntegrity(manifest)) {
    return fail(
      "MANIFEST_DIGEST_MISMATCH",
      "Overall digest mismatch in corpus manifest — manifest may have been modified",
    );
  }

  return ok(manifest);
}

// ---------------------------------------------------------------------------
// validateManifestAgainstRegistry
// ---------------------------------------------------------------------------

/**
 * Validates that a manifest is consistent with the current registry state.
 * Checks document count, ordered IDs, and overall digest.
 */
export function validateManifestAgainstRegistry(
  manifest: CorpusManifest,
  registry: CorpusRegistry,
): ValidationResult {
  const ordered = registry.list();

  if (manifest.documentCount !== ordered.length) {
    return fail(
      "INVALID_MANIFEST",
      `Manifest document count (${manifest.documentCount}) does not match registry size (${ordered.length})`,
    );
  }

  const registryIds = ordered.map((d) => d.corpusId);
  for (let i = 0; i < registryIds.length; i++) {
    if (manifest.documentIds[i] !== registryIds[i]) {
      return fail(
        "INVALID_MANIFEST",
        `Manifest document ID at index ${i} is "${manifest.documentIds[i]}" but registry has "${registryIds[i]}"`,
      );
    }
  }

  if (!verifyManifestIntegrity(manifest)) {
    return fail(
      "MANIFEST_DIGEST_MISMATCH",
      "Overall digest mismatch in corpus manifest",
    );
  }

  return ok(undefined);
}
