/**
 * DRA-001 — Material Statement (Claim) Representation
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines the canonical data structure for a material statement (claim).
 * A claim is any assertion of fact, specification, or requirement within
 * the generated document (DRA-001 §5, Stage 2).
 *
 * Explicit exclusions:
 *   - No statement extraction from documents.
 *   - No classification of statement quality or truth.
 *   - No materiality scoring logic.
 */

import { z } from "zod";
import { StatementIdSchema, EvidenceUnitIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Span reference — location within a document
// ---------------------------------------------------------------------------

/**
 * A reference to a specific span (passage) within a document.
 * Represents the location where a statement or evidence unit appears.
 * All fields are optional for Version 1; future stages will refine this.
 */
export const SpanReferenceSchema = z.object({
  /**
   * Character offset from the start of the document content (inclusive).
   */
  startOffset: z.number().int().nonnegative().optional(),

  /**
   * Character offset from the start of the document content (exclusive).
   */
  endOffset: z.number().int().nonnegative().optional(),

  /**
   * Page number (1-indexed) where applicable (e.g. PDF documents).
   */
  pageNumber: z.number().int().positive().optional(),

  /**
   * Free-form human-readable location description
   * (e.g. "Section 3.2, paragraph 4").
   */
  locationLabel: z.string().optional(),
});

export type SpanReference = z.infer<typeof SpanReferenceSchema>;

// ---------------------------------------------------------------------------
// Materiality level (advisory classification — not a decision)
// ---------------------------------------------------------------------------

/**
 * Classification of a statement's materiality to the document's purpose.
 * AMBIGUITY-001: DRA-001 does not enumerate specific materiality levels.
 * HIGH/MEDIUM/LOW are defined here as a reasonable minimum set.
 * This will be reviewed at DRA-ENG-004 (Claim Extraction) when the
 * full claim structure is implemented.
 */
export const MATERIALITY_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;
export type MaterialityLevel = (typeof MATERIALITY_LEVELS)[number];
export const MaterialityLevelSchema = z.enum(
  MATERIALITY_LEVELS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Material statement schema
// ---------------------------------------------------------------------------

/**
 * A material statement (claim) extracted from the generated document.
 * Claims are the primary unit of evaluation in the DRA pipeline.
 * They are produced by Stage 2 (Claim Extraction) and evaluated through
 * Stages 3–6.
 */
export const MaterialStatementSchema = z.object({
  /** Unique identifier for this statement within the evaluation. */
  id: StatementIdSchema,

  /** The verbatim or normalised text of the claim. */
  text: z.string().min(1, "Statement text must not be empty"),

  /**
   * Sequential index of this statement within the generated document.
   * 0-indexed. Used to preserve statement ordering.
   */
  statementIndex: z.number().int().nonnegative(),

  /**
   * Location span reference within the generated document.
   * Optional for Version 1; populated by Stage 2 when available.
   */
  spanRef: SpanReferenceSchema.optional(),

  /**
   * Materiality classification for this statement.
   * Optional; assigned during Stage 2 when determinable.
   * See AMBIGUITY-001 in DRA-ENG-002R for the rationale for these values.
   */
  materiality: MaterialityLevelSchema.optional(),

  /**
   * Identifiers of evidence units linked to this statement.
   * Populated by Stage 4 (Evidence Linkage). Empty at Stage 2 output.
   */
  linkedEvidenceUnitIds: z.array(EvidenceUnitIdSchema).default([]),

  /**
   * Opaque status metadata for use by pipeline stages.
   * Free-form record; not validated beyond structure.
   */
  stageMetadata: z.record(z.string(), z.unknown()).optional(),
});

export type MaterialStatement = z.infer<typeof MaterialStatementSchema>;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function validateMaterialStatement(
  value: unknown,
): z.SafeParseReturnType<unknown, MaterialStatement> {
  return MaterialStatementSchema.safeParse(value);
}
