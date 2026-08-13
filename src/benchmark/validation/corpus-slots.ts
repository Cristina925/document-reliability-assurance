/**
 * DRA-VAL-001B — Scientific Corpus Acquisition
 *
 * Corpus slot identifiers, acquisition lifecycle statuses, and the
 * ScientificCorpusSlot record that tracks every planned document position
 * from initial PLANNED state through to FROZEN.
 *
 * Invariants:
 *   - Document identifiers must match DRA-VAL-DOC-NNNN (0001–0120).
 *   - Forbidden state transitions are enforced at parse time via
 *     validateCorpusStateTransition.
 *   - PLANNED → FROZEN is not a permitted path.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Identifier
// ---------------------------------------------------------------------------

/**
 * Identifier for a scientific corpus document slot.
 * Format: DRA-VAL-DOC-NNNN where NNNN is 0001–0120.
 */
export const ScientificCorpusDocumentIdSchema = z
  .string()
  .regex(
    /^DRA-VAL-DOC-\d{4}$/,
    "ScientificCorpusDocumentId must match DRA-VAL-DOC-NNNN",
  )
  .refine(
    (id) => {
      const n = parseInt(id.slice(-4), 10);
      return n >= 1 && n <= 120;
    },
    { message: "ScientificCorpusDocumentId must be in range 0001–0120" },
  );

export type ScientificCorpusDocumentId = z.infer<
  typeof ScientificCorpusDocumentIdSchema
>;

/** Convenience helper: format a numeric slot index (1–120) as a document ID. */
export function formatDocumentId(n: number): ScientificCorpusDocumentId {
  if (n < 1 || n > 120 || !Number.isInteger(n)) {
    throw new Error(`Slot index out of range: ${n}`);
  }
  return `DRA-VAL-DOC-${String(n).padStart(4, "0")}` as ScientificCorpusDocumentId;
}

// ---------------------------------------------------------------------------
// Acquisition status
// ---------------------------------------------------------------------------

export const CORPUS_ACQUISITION_STATUSES = [
  "PLANNED",
  "IDENTIFIED",
  "ACQUIRED",
  "UNDER_REVIEW",
  "ADMITTED",
  "EXCLUDED",
  "WITHDRAWN",
  "FROZEN",
] as const;

export type CorpusAcquisitionStatus = (typeof CORPUS_ACQUISITION_STATUSES)[number];

export const CorpusAcquisitionStatusSchema = z.enum(
  CORPUS_ACQUISITION_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Acquisition status must be one of: ${CORPUS_ACQUISITION_STATUSES.join(", ")}`,
    }),
  },
);

/**
 * Permitted state transitions for corpus document slots.
 *
 * Rules enforced:
 *   - PLANNED → FROZEN is prohibited.
 *   - IDENTIFIED → FROZEN is prohibited.
 *   - ACQUIRED → FROZEN is prohibited.
 *   - EXCLUDED → FROZEN is prohibited.
 *   - WITHDRAWN → FROZEN is prohibited.
 *   - FROZEN → WITHDRAWN only (post-freeze withdrawal must use a separate
 *     withdrawal record that preserves the original manifest history; the
 *     slot status can be updated to WITHDRAWN after a withdrawal record is
 *     created, but the frozen content record must not be modified).
 */
export const VALID_CORPUS_TRANSITIONS: Readonly<
  Record<CorpusAcquisitionStatus, readonly CorpusAcquisitionStatus[]>
> = {
  PLANNED: ["IDENTIFIED"],
  IDENTIFIED: ["ACQUIRED", "EXCLUDED"],
  ACQUIRED: ["UNDER_REVIEW", "EXCLUDED"],
  UNDER_REVIEW: ["ADMITTED", "EXCLUDED"],
  ADMITTED: ["FROZEN", "WITHDRAWN"],
  EXCLUDED: [],
  WITHDRAWN: [],
  FROZEN: ["WITHDRAWN"],
} as const;

/**
 * Validate a corpus slot state transition.
 * Returns null if the transition is valid, or an error message if invalid.
 */
export function validateCorpusStateTransition(
  from: CorpusAcquisitionStatus,
  to: CorpusAcquisitionStatus,
): string | null {
  const permitted = VALID_CORPUS_TRANSITIONS[from];
  if (permitted.includes(to)) return null;
  return `Invalid corpus state transition: ${from} → ${to}. Permitted from ${from}: [${permitted.join(", ") || "none"}]`;
}

// ---------------------------------------------------------------------------
// Domain constants
// ---------------------------------------------------------------------------

export const CORPUS_DOMAINS = [
  "LEGAL_AND_REGULATORY",
  "HEALTHCARE_AND_LIFE_SCIENCES",
  "FINANCE_AND_ACCOUNTING",
  "CYBERSECURITY_AND_TECHNICAL_ASSURANCE",
  "BUSINESS_AND_EXECUTIVE_REPORTING",
  "PROCUREMENT_AND_THIRD_PARTY_RISK",
  "HR_AND_WORKPLACE_POLICY",
  "PUBLIC_POLICY_AND_GOVERNANCE",
  "GENERAL_OPERATIONAL",
] as const;

export type CorpusDomain = (typeof CORPUS_DOMAINS)[number];
export const CorpusDomainSchema = z.enum(
  CORPUS_DOMAINS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Source type constants
// ---------------------------------------------------------------------------

export const CORPUS_SOURCE_TYPES = [
  "AI_GENERATED",
  "HUMAN_AUTHORED",
  "HYBRID",
] as const;

export type CorpusSourceType = (typeof CORPUS_SOURCE_TYPES)[number];
export const CorpusSourceTypeSchema = z.enum(
  CORPUS_SOURCE_TYPES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message:
        "Source type must be one of: AI_GENERATED, HUMAN_AUTHORED, HYBRID. " +
        "Source type cannot be inferred from acquisition method — it must be " +
        "based on documented generation evidence.",
    }),
  },
);

// ---------------------------------------------------------------------------
// Difficulty and length strata
// ---------------------------------------------------------------------------

export const DIFFICULTY_STRATA = ["LOW", "MEDIUM", "HIGH"] as const;
export type DifficultyStratum = (typeof DIFFICULTY_STRATA)[number];
export const DifficultyStratumSchema = z.enum(
  DIFFICULTY_STRATA as unknown as [string, ...string[]],
);

export const LENGTH_STRATA = ["SHORT", "MEDIUM", "LONG"] as const;
export type LengthStratum = (typeof LENGTH_STRATA)[number];
export const LengthStratumSchema = z.enum(
  LENGTH_STRATA as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Scientific corpus slot
// ---------------------------------------------------------------------------

/**
 * A single planned position in the 120-document scientific benchmark corpus.
 * Represents a document slot from initial planning through to freeze.
 */
export const ScientificCorpusSlotSchema = z.object({
  /** Unique document identifier — DRA-VAL-DOC-0001 through DRA-VAL-DOC-0120. */
  documentId: ScientificCorpusDocumentIdSchema,

  /** Current acquisition lifecycle status. */
  status: CorpusAcquisitionStatusSchema,

  /** Target domain allocation for this slot. */
  domain: CorpusDomainSchema,

  /**
   * Source type classification.
   * Must be based on documented evidence — cannot be inferred from
   * acquisition method alone.
   */
  sourceType: CorpusSourceTypeSchema,

  /** Difficulty stratum assignment. */
  difficultyStratum: DifficultyStratumSchema,

  /** Document length stratum. */
  lengthStratum: LengthStratumSchema,

  /** Whether this slot is part of the pilot (first 20) or post-pilot corpus. */
  corpusPhase: z.enum(["PILOT", "POST_PILOT"]),

  /**
   * Whether the document has been explicitly marked as synthetic
   * (purpose-generated). Must be true for AI_GENERATED source type.
   * Human-authored classification requires documented evidence.
   */
  syntheticFlag: z.boolean(),

  /**
   * Timestamp of the most recent status update (ISO 8601, no trailing Z).
   * Required once status moves beyond PLANNED.
   */
  lastUpdated: z.string().min(1, "lastUpdated must not be empty"),

  /**
   * Free-text description of acquisition blocker if the slot cannot progress.
   * Required when status is PLANNED or IDENTIFIED for more than 30 days.
   */
  acquisitionBlocker: z.string().optional(),

  /**
   * Free-text description of the document's content type and scope.
   * Optional until UNDER_REVIEW.
   */
  contentDescription: z.string().optional(),
});

export type ScientificCorpusSlot = z.infer<typeof ScientificCorpusSlotSchema>;

/**
 * Validate slot-level invariants that cannot be expressed in Zod alone.
 * Returns an array of violation messages (empty = valid).
 */
export function validateSlotInvariants(slot: ScientificCorpusSlot): string[] {
  const errors: string[] = [];
  const status = slot.status as CorpusAcquisitionStatus;

  // AI_GENERATED must have syntheticFlag = true
  if (slot.sourceType === "AI_GENERATED" && !slot.syntheticFlag) {
    errors.push(
      `${slot.documentId}: AI_GENERATED source type requires syntheticFlag = true`,
    );
  }

  // Frozen slots must have a lastUpdated
  if (status === "FROZEN" && !slot.lastUpdated) {
    errors.push(`${slot.documentId}: FROZEN slot must have lastUpdated set`);
  }

  return errors;
}
