/**
 * DRA-001 — Stage 3: Authority Resolution — Record Identifier Strategy
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Defines the deterministic strategy for generating authority record identifiers.
 *
 * Format:
 *   ar3:{statementId}
 *
 *   Where:
 *     - "ar3" is the Stage 3 prefix (Authority Resolution, Stage 3).
 *     - {statementId} is the exact string value of the statement's StatementId
 *       (e.g. "s2:0:47" → authority record id = "ar3:s2:0:47").
 *
 * Properties:
 *   - DETERMINISTIC: same statementId always produces the same record id.
 *   - UNIQUE WITHIN ONE EVALUATION: because statementIds are unique within
 *     one evaluation, the derived record ids are also unique.
 *   - STABLE: no wall-clock time, no random UUID.
 *   - TRACEABLE: the statementId is embedded, making the source statement
 *     immediately identifiable from the record id.
 */

/** Prefix for all authority record identifiers produced by Stage 3. */
export const STAGE_3_RECORD_ID_PREFIX = "ar3" as const;

/**
 * Generates a deterministic authority record identifier from a statement identifier.
 *
 * Format: `ar3:{statementId}`
 *
 * @param statementId - The string value of the statement's StatementId.
 * @returns Deterministic authority record identifier string.
 */
export function makeAuthorityRecordId(statementId: string): string {
  return `${STAGE_3_RECORD_ID_PREFIX}:${statementId}`;
}

/**
 * Parses an authority record ID back to its component statementId.
 * Returns null if the format does not match.
 *
 * For diagnostic and testing use only.
 */
export function parseAuthorityRecordId(recordId: string): { statementId: string } | null {
  if (!recordId.startsWith(`${STAGE_3_RECORD_ID_PREFIX}:`)) return null;
  const statementId = recordId.slice(STAGE_3_RECORD_ID_PREFIX.length + 1);
  if (!statementId) return null;
  return { statementId };
}
