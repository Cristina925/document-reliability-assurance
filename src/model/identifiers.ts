/**
 * DRA-001 — Canonical Identifier Types
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Defines strongly-typed, branded identifier types for all major DRA
 * entities. Identifiers are non-empty strings at runtime; branding
 * prevents accidental cross-entity substitution at compile time.
 *
 * Runtime validation rejects empty identifiers.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Branded identifier schemas
// ---------------------------------------------------------------------------

/** Unique identifier for a DRA evaluation run. */
export const EvaluationIdSchema = z
  .string()
  .min(1, "EvaluationId must not be empty")
  .brand<"EvaluationId">();

/** Unique identifier for a source (reference) document. */
export const SourceDocumentIdSchema = z
  .string()
  .min(1, "SourceDocumentId must not be empty")
  .brand<"SourceDocumentId">();

/** Unique identifier for a generated (AI-produced) document. */
export const GeneratedDocumentIdSchema = z
  .string()
  .min(1, "GeneratedDocumentId must not be empty")
  .brand<"GeneratedDocumentId">();

/** Unique identifier for a material statement (claim). */
export const StatementIdSchema = z
  .string()
  .min(1, "StatementId must not be empty")
  .brand<"StatementId">();

/** Unique identifier for an evidence unit (source passage). */
export const EvidenceUnitIdSchema = z
  .string()
  .min(1, "EvidenceUnitId must not be empty")
  .brand<"EvidenceUnitId">();

/** Unique identifier for a DRA assurance issue. */
export const IssueIdSchema = z
  .string()
  .min(1, "IssueId must not be empty")
  .brand<"IssueId">();

/** Unique identifier for a DRA proof receipt. */
export const ProofReceiptIdSchema = z
  .string()
  .min(1, "ProofReceiptId must not be empty")
  .brand<"ProofReceiptId">();

/** Unique identifier for a DRA evaluation result record. */
export const EvaluationResultIdSchema = z
  .string()
  .min(1, "EvaluationResultId must not be empty")
  .brand<"EvaluationResultId">();

/** Unique identifier for an evidence relationship. */
export const EvidenceRelationshipIdSchema = z
  .string()
  .min(1, "EvidenceRelationshipId must not be empty")
  .brand<"EvidenceRelationshipId">();

// ---------------------------------------------------------------------------
// TypeScript types (inferred from schemas)
// ---------------------------------------------------------------------------

export type EvaluationId = z.infer<typeof EvaluationIdSchema>;
export type SourceDocumentId = z.infer<typeof SourceDocumentIdSchema>;
export type GeneratedDocumentId = z.infer<typeof GeneratedDocumentIdSchema>;
export type StatementId = z.infer<typeof StatementIdSchema>;
export type EvidenceUnitId = z.infer<typeof EvidenceUnitIdSchema>;
export type IssueId = z.infer<typeof IssueIdSchema>;
export type ProofReceiptId = z.infer<typeof ProofReceiptIdSchema>;
export type EvaluationResultId = z.infer<typeof EvaluationResultIdSchema>;
export type EvidenceRelationshipId = z.infer<
  typeof EvidenceRelationshipIdSchema
>;

// ---------------------------------------------------------------------------
// Helper: validate an arbitrary identifier value
// ---------------------------------------------------------------------------

/** Returns true if the value is a non-empty string. */
export function isValidIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
