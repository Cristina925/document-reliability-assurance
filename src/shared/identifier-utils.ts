/**
 * DRA-001 — Shared Identifier Utilities
 *
 * Milestone: DRA-ENG-008B — Deterministic Contract and Boundary Hardening
 *
 * Provides a single canonical boundary for validating and extracting
 * identifier strings from unknown-typed values.  This prevents unsafe
 * coercions such as String(null) → "null" or String(undefined) → "undefined"
 * from polluting cross-stage lookup Maps.
 *
 * Design contract:
 *   - Accept only non-empty strings.
 *   - Reject null, undefined, numbers, booleans, objects, arrays, and the
 *     empty string.
 *   - Do NOT trim.  Canonical identifiers in this repository are produced
 *     by deterministic factories and must not be whitespace-normalised.
 *   - Never silently convert non-string values into strings.
 */

// ---------------------------------------------------------------------------
// IdentifierValidationError
// ---------------------------------------------------------------------------

/**
 * Thrown by requireId() when an identifier value fails validation.
 * Carries the invalid value for diagnostic use; never exposed in API responses.
 */
export class IdentifierValidationError extends Error {
  public readonly received: unknown;

  constructor(message: string, received: unknown) {
    super(message);
    this.name = "IdentifierValidationError";
    this.received = received;
    // Restore prototype chain for instanceof checks across transpilation targets.
    Object.setPrototypeOf(this, IdentifierValidationError.prototype);
  }
}

// ---------------------------------------------------------------------------
// tryExtractId
// ---------------------------------------------------------------------------

/**
 * Safely extracts an identifier string from an unknown value.
 *
 * Returns the string value if `value` is a non-empty string; null otherwise.
 * Does NOT trim — identifier semantics require exact match.
 *
 * Use this for defensive Map-keying loops where an invalid record should be
 * skipped rather than aborting the pipeline.
 *
 * @param value  The value to validate and extract.
 * @returns      The string if valid, null if invalid.
 */
export function tryExtractId(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  return value;
}

// ---------------------------------------------------------------------------
// requireId
// ---------------------------------------------------------------------------

/**
 * Validates and extracts an identifier string.
 *
 * Throws {@link IdentifierValidationError} if `value` is not a non-empty string.
 *
 * Use this at enforcement boundaries (e.g. public API entry points) where
 * an invalid identifier is a programming error that should be surfaced
 * immediately rather than silently skipped.
 *
 * @param value      The value to validate and extract.
 * @param fieldPath  Label included in the error message, e.g. "statementId".
 * @returns          The validated string.
 * @throws           {@link IdentifierValidationError} if `value` is invalid.
 */
export function requireId(value: unknown, fieldPath = "id"): string {
  if (typeof value !== "string") {
    const type =
      value === null ? "null"
      : Array.isArray(value) ? "array"
      : typeof value;
    throw new IdentifierValidationError(
      `${fieldPath}: expected non-empty string, received ${type}`,
      value,
    );
  }
  if (value.length === 0) {
    throw new IdentifierValidationError(
      `${fieldPath}: identifier must not be empty`,
      value,
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// buildStatementIdMap
// ---------------------------------------------------------------------------

/**
 * Builds a cross-reference Map keyed by statementId from an array of records.
 *
 * Records whose `statementId` is not a non-empty string (including null,
 * undefined, objects, empty string) are silently omitted from the Map.
 * This is the safe replacement for `String(record.statementId as string)`.
 *
 * Typical use:
 * ```
 * const erByStmt = buildStatementIdMap(evidenceRecords);
 * const er = erByStmt.get(sid); // sid is already a validated string
 * ```
 *
 * @param records  Any array of objects that carry a `statementId` field.
 * @returns        A Map from validated statementId strings to records.
 *                 At most one entry per statementId (last write wins on
 *                 duplicate keys, which should not occur in a valid pipeline).
 */
export function buildStatementIdMap<T extends { statementId: unknown }>(
  records: ReadonlyArray<T>,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const rec of records) {
    const key = tryExtractId(rec.statementId);
    if (key !== null) {
      map.set(key, rec);
    }
  }
  return map;
}
