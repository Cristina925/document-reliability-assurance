/**
 * DRA-001 — Stage 4: Evidence Linkage — Record Identifier Strategy
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Defines the deterministic strategy for generating evidence record identifiers.
 *
 * Format:
 *   ar4:{statementId}
 *
 *   Where:
 *     - "ar4" is the Stage 4 prefix (Authority/evidence Record, Stage 4).
 *     - {statementId} is the exact string value of the statement's StatementId
 *       (e.g. "s2:0:47" → evidence record id = "ar4:s2:0:47").
 *
 * Properties:
 *   - DETERMINISTIC: same statementId always produces the same record id.
 *   - UNIQUE WITHIN ONE EVALUATION: because statementIds are unique within
 *     one evaluation, the derived record ids are also unique.
 *   - STABLE: no wall-clock time, no random UUID.
 *   - TRACEABLE: the statementId is embedded, making the source statement
 *     immediately identifiable from the record id.
 */

/** Prefix for all evidence record identifiers produced by Stage 4. */
export const STAGE_4_RECORD_ID_PREFIX = "ar4" as const;

/**
 * Generates a deterministic evidence record identifier from a statement identifier.
 *
 * Format: `ar4:{statementId}`
 *
 * @param statementId - The string value of the statement's StatementId.
 * @returns Deterministic evidence record identifier string.
 */
export function makeEvidenceRecordId(statementId: string): string {
  return `${STAGE_4_RECORD_ID_PREFIX}:${statementId}`;
}

/**
 * Parses an evidence record ID back to its component statementId.
 * Returns null if the format does not match.
 *
 * For diagnostic and testing use only.
 */
export function parseEvidenceRecordId(recordId: string): { statementId: string } | null {
  if (!recordId.startsWith(`${STAGE_4_RECORD_ID_PREFIX}:`)) return null;
  const statementId = recordId.slice(STAGE_4_RECORD_ID_PREFIX.length + 1);
  if (!statementId) return null;
  return { statementId };
}
