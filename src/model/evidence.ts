/**
 * DRA-001 — Evidence Unit and Evidence Relationship Representations
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines:
 *   - EvidenceUnit    — a source passage from a reference document.
 *   - EvidenceRelationship — a typed link between an evidence unit and
 *                            a material statement.
 *
 * Evidence relationships support later representation of:
 *   - Supporting evidence
 *   - Conflicting evidence
 *   - Missing evidence
 *   - Provenance / source location
 *   - Relationship metadata
 *
 * Explicit exclusions:
 *   - No evidence mapping logic.
 *   - No determination of whether evidence supports or conflicts with a claim.
 */

import { z } from "zod";
import {
  EvidenceUnitIdSchema,
  EvidenceRelationshipIdSchema,
  SourceDocumentIdSchema,
  StatementIdSchema,
} from "./identifiers.js";
import { SpanReferenceSchema } from "./statements.js";

// ---------------------------------------------------------------------------
// Evidence unit schema
// ---------------------------------------------------------------------------

/**
 * A unit of evidence: a specific passage or excerpt from a source document.
 * Evidence units are the atomic reference fragments used to assess claims.
 * Populated primarily during Stage 4 (Evidence Linkage).
 */
export const EvidenceUnitSchema = z.object({
  /** Unique identifier for this evidence unit. */
  id: EvidenceUnitIdSchema,

  /**
   * Identifier of the source document this passage is drawn from.
   * Must resolve to a SourceDocument in the evaluation request.
   */
  sourceDocumentId: SourceDocumentIdSchema,

  /**
   * The verbatim text of the evidence passage from the source document.
   * Must not be empty; represents the exact fragment used as evidence.
   */
  passageText: z.string().min(1, "Evidence passage text must not be empty"),

  /**
   * Location of this passage within its source document.
   * Optional for Version 1.
   */
  spanRef: SpanReferenceSchema.optional(),

  /**
   * Free-form location description supplementing spanRef
   * (e.g. "Table 3, row 4" or "Appendix B").
   */
  locationLabel: z.string().optional(),
});

export type EvidenceUnit = z.infer<typeof EvidenceUnitSchema>;

// ---------------------------------------------------------------------------
// Evidence relationship type enum
// ---------------------------------------------------------------------------

/**
 * The directional type of the relationship between an evidence unit
 * and a material statement.
 *
 * SUPPORTING  — The evidence supports or corroborates the statement.
 * CONFLICTING — The evidence contradicts or undermines the statement.
 * MISSING     — The statement requires evidence but none is traceable
 *               (the evidence unit is a placeholder identifying the gap).
 */
export const EVIDENCE_RELATIONSHIP_TYPES = [
  "SUPPORTING",
  "CONFLICTING",
  "MISSING",
] as const;

export type EvidenceRelationshipType =
  (typeof EVIDENCE_RELATIONSHIP_TYPES)[number];

export const EvidenceRelationshipTypeSchema = z.enum(
  EVIDENCE_RELATIONSHIP_TYPES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Evidence relationship type must be one of: ${EVIDENCE_RELATIONSHIP_TYPES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Evidence relationship schema
// ---------------------------------------------------------------------------

/**
 * A typed relationship between a specific evidence unit and a material
 * statement. Evidence relationships are the primary output of Stage 4
 * (Evidence Linkage).
 */
export const EvidenceRelationshipSchema = z.object({
  /** Unique identifier for this relationship record. */
  id: EvidenceRelationshipIdSchema,

  /**
   * The statement to which this relationship attaches.
   * Must resolve to a MaterialStatement in the evaluation result.
   */
  statementId: StatementIdSchema,

  /**
   * The evidence unit participating in this relationship.
   * Must resolve to an EvidenceUnit in the evaluation result.
   *
   * For MISSING relationships, this identifier may reference a sentinel
   * evidence unit documenting what evidence is absent.
   */
  evidenceUnitId: EvidenceUnitIdSchema,

  /** The directional type of this relationship. */
  relationshipType: EvidenceRelationshipTypeSchema,

  /**
   * Free-form explanation of why this relationship holds, or why
   * evidence is absent (for MISSING). Optional for Version 1.
   */
  explanation: z.string().optional(),

  /**
   * Opaque stage-assigned metadata. Free-form record; not validated
   * beyond structure.
   */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type EvidenceRelationship = z.infer<typeof EvidenceRelationshipSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateEvidenceUnit(
  value: unknown,
): z.SafeParseReturnType<unknown, EvidenceUnit> {
  return EvidenceUnitSchema.safeParse(value);
}

export function validateEvidenceRelationship(
  value: unknown,
): z.SafeParseReturnType<unknown, EvidenceRelationship> {
  return EvidenceRelationshipSchema.safeParse(value);
}
