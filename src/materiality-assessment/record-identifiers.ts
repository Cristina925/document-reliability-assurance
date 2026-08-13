/**
 * DRA-001 — Stage 5: Materiality Assessment — Record Identifier Strategy
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Defines the deterministic strategy for generating materiality record identifiers.
 *
 * Format:
 *   ar5:{statementId}
 *
 *   Where:
 *     - "ar5" is the Stage 5 prefix (Assessment Record, Stage 5).
 *     - {statementId} is the exact string value of the statement's StatementId
 *       (e.g. "s2:0:47" → materiality record id = "ar5:s2:0:47").
 *
 * Properties:
 *   - DETERMINISTIC: same statementId always produces the same record id.
 *   - UNIQUE WITHIN ONE EVALUATION: because statementIds are unique within
 *     one evaluation, the derived record ids are also unique.
 *   - STABLE: no wall-clock time, no random UUID.
 *   - TRACEABLE: the statementId is embedded, making the source statement
 *     immediately identifiable from the record id.
 *   - DISTINCT: the "ar5" prefix distinguishes Stage 5 records from the
 *     Stage 3 "ar3" and Stage 4 "ar4" prefixes.
 */

/** Prefix for all materiality record identifiers produced by Stage 5. */
export const STAGE_5_RECORD_ID_PREFIX = "ar5" as const;

/**
 * Generates a deterministic materiality record identifier from a statement identifier.
 *
 * Format: `ar5:{statementId}`
 *
 * @param statementId - The string value of the statement's StatementId.
 * @returns Deterministic materiality record identifier string.
 */
export function makeMaterialityRecordId(statementId: string): string {
  return `${STAGE_5_RECORD_ID_PREFIX}:${statementId}`;
}

/**
 * Parses a materiality record ID back to its component statementId.
 * Returns null if the format does not match.
 *
 * For diagnostic and testing use only.
 */
export function parseMaterialityRecordId(recordId: string): { statementId: string } | null {
  if (!recordId.startsWith(`${STAGE_5_RECORD_ID_PREFIX}:`)) return null;
  const statementId = recordId.slice(STAGE_5_RECORD_ID_PREFIX.length + 1);
  if (!statementId) return null;
  return { statementId };
}
