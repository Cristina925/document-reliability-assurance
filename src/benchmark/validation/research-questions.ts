/**
 * DRA-VAL-001A — Scientific Validation Protocol — Research Questions and Hypotheses
 *
 * Defines the validated schemas for:
 *   - ResearchQuestion (primary and secondary)
 *   - Hypothesis
 *   - NullHypothesis
 *
 * Constraints:
 *   - A protocol must have exactly one primary research question.
 *   - Every hypothesis must link to a research question ID.
 *   - Every null hypothesis must link to a hypothesis ID.
 *   - Permitted study outcomes are enumerated and fixed.
 *   - Text fields must not be empty.
 */

import { z } from "zod";
import {
  ResearchQuestionIdSchema,
  HypothesisIdSchema,
  NullHypothesisIdSchema,
} from "./identifiers.js";

// ---------------------------------------------------------------------------
// Permitted study outcomes
// ---------------------------------------------------------------------------

/**
 * Every permitted outcome of the scientific validation.
 * The study design must not structurally exclude any of these.
 */
export const PERMITTED_STUDY_OUTCOMES = [
  "SUPPORTED",
  "PARTIALLY_SUPPORTED",
  "INCONCLUSIVE",
  "NOT_SUPPORTED",
] as const;

export type PermittedStudyOutcome = (typeof PERMITTED_STUDY_OUTCOMES)[number];

export const PermittedStudyOutcomeSchema = z.enum(
  PERMITTED_STUDY_OUTCOMES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Study outcome must be one of: ${PERMITTED_STUDY_OUTCOMES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Research question
// ---------------------------------------------------------------------------

export const ResearchQuestionSchema = z.object({
  /** Unique identifier for this research question. Format: RQ-NNN. */
  id: ResearchQuestionIdSchema,

  /**
   * The full text of the research question.
   * Must be a neutral empirical question — not a hypothesis or claim.
   */
  text: z.string().min(20, "Research question text must be at least 20 characters"),

  /**
   * Whether this is the primary research question.
   * Exactly one research question in a protocol must be primary.
   */
  isPrimary: z.boolean(),

  /**
   * Domain or scope of this question (optional free text).
   * Helps locate the question within the study design.
   */
  scope: z.string().min(1).optional(),
});

export type ResearchQuestion = z.infer<typeof ResearchQuestionSchema>;

// ---------------------------------------------------------------------------
// Hypothesis
// ---------------------------------------------------------------------------

export const HypothesisSchema = z.object({
  /** Unique identifier. Format: H-NNN. */
  id: HypothesisIdSchema,

  /**
   * The full text of the hypothesis.
   * Must be a falsifiable, directional claim.
   */
  text: z.string().min(20, "Hypothesis text must be at least 20 characters"),

  /**
   * ID of the research question this hypothesis addresses.
   * Must match a ResearchQuestion.id in the enclosing protocol.
   */
  linkedQuestionId: ResearchQuestionIdSchema,

  /**
   * Permitted outcomes for which this hypothesis is considered supported.
   * Must be a subset of PERMITTED_STUDY_OUTCOMES and non-empty.
   */
  supportedOutcomes: z
    .array(PermittedStudyOutcomeSchema)
    .min(1, "Hypothesis must specify at least one supported outcome"),
});

export type Hypothesis = z.infer<typeof HypothesisSchema>;

// ---------------------------------------------------------------------------
// Null hypothesis
// ---------------------------------------------------------------------------

export const NullHypothesisSchema = z.object({
  /** Unique identifier. Format: NH-NNN. */
  id: NullHypothesisIdSchema,

  /**
   * The full text of the null hypothesis.
   * Must be the logical complement of the linked hypothesis.
   */
  text: z.string().min(20, "Null hypothesis text must be at least 20 characters"),

  /**
   * ID of the hypothesis this null hypothesis negates.
   * Must match a Hypothesis.id in the enclosing protocol.
   */
  linkedHypothesisId: HypothesisIdSchema,
});

export type NullHypothesis = z.infer<typeof NullHypothesisSchema>;

// ---------------------------------------------------------------------------
// Study objectives (free-text; structural only)
// ---------------------------------------------------------------------------

export const StudyObjectiveSchema = z.object({
  /** Sequential number for this objective (1-based). */
  ordinal: z.number().int().min(1),

  /** Full text of the study objective. */
  text: z.string().min(10, "Study objective text must be at least 10 characters"),
});

export type StudyObjective = z.infer<typeof StudyObjectiveSchema>;
