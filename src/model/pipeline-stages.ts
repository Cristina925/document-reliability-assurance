/**
 * DRA-001 — Pipeline Stage Representation
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Represents the frozen seven-stage evaluator pipeline defined in DRA-001 §5.
 * No stage may be added, removed, reordered, or redefined during Version 1.
 *
 * This module defines REPRESENTATION ONLY.
 * It does not execute stages, contain stage-processing functions,
 * or implement any evaluator behaviour.
 *
 * Invariants enforced:
 *   - Exactly seven stages.
 *   - Stage names are unique.
 *   - Canonical order is preserved in the authoritative tuple.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Canonical pipeline stage names — exactly seven, frozen for Version 1
// Source: DRA-001 §5 "Frozen Seven-Stage Evaluator Pipeline"
// Stages execute in order 1 → 7; this tuple preserves that order.
// ---------------------------------------------------------------------------

export const PIPELINE_STAGES = [
  "Input Normalisation",
  "Claim Extraction",
  "Authority Resolution",
  "Evidence Linkage",
  "Consistency Check",
  "Confidence Scoring",
  "Decision and Receipt",
] as const;

export type PipelineStageName = (typeof PIPELINE_STAGES)[number];

/** The exact number of pipeline stages frozen in DRA-001 §5. */
export const PIPELINE_STAGE_COUNT = 7 as const;

// ---------------------------------------------------------------------------
// Stage number type: 1–7 (integer, representing stage position)
// ---------------------------------------------------------------------------

export const PipelineStageNumberSchema = z
  .number()
  .int()
  .min(1)
  .max(PIPELINE_STAGE_COUNT);

export type PipelineStageNumber = z.infer<typeof PipelineStageNumberSchema>;

// ---------------------------------------------------------------------------
// Stage name schema (derived from the same authoritative tuple)
// ---------------------------------------------------------------------------

export const PipelineStageNameSchema = z.enum(
  PIPELINE_STAGES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Stage name must be one of the seven frozen DRA-001 pipeline stages`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Stage metadata: associates stage number with stage name (frozen mapping)
// ---------------------------------------------------------------------------

export interface PipelineStageMetadata {
  readonly stageNumber: PipelineStageNumber;
  readonly stageName: PipelineStageName;
  readonly description: string;
}

/** Frozen ordered stage metadata. Source: DRA-001 §5. */
export const PIPELINE_STAGE_METADATA: ReadonlyArray<PipelineStageMetadata> = [
  {
    stageNumber: 1,
    stageName: "Input Normalisation",
    description:
      "Parse and normalise the document into a canonical structured representation suitable for evaluation.",
  },
  {
    stageNumber: 2,
    stageName: "Claim Extraction",
    description:
      "Identify and enumerate all evaluable claims within the document. A claim is any assertion of fact, specification, or requirement.",
  },
  {
    stageNumber: 3,
    stageName: "Authority Resolution",
    description:
      "For each claim, identify the authority or authorities cited. Determine whether each authority is current, applicable, and properly cited.",
  },
  {
    stageNumber: 4,
    stageName: "Evidence Linkage",
    description:
      "For each claim, identify the evidence cited in support. Determine whether evidence is present, traceable, and structurally adequate.",
  },
  {
    stageNumber: 5,
    stageName: "Consistency Check",
    description:
      "Evaluate internal document consistency: identify claims that contradict one another, evidence that conflicts across claims, or authorities that are mutually incompatible.",
  },
  {
    stageNumber: 6,
    stageName: "Confidence Scoring",
    description:
      "Assign a per-claim confidence indicator based on the outputs of stages 3–5. The confidence score is a structured classification, not a numeric probability.",
  },
  {
    stageNumber: 7,
    stageName: "Decision and Receipt",
    description:
      "Produce the assurance decision (SUPPORTED / REVIEW / HOLD) and a proof receipt recording the evaluation inputs, stage outputs, and decision rationale.",
  },
] as const;

// ---------------------------------------------------------------------------
// Runtime helpers
// ---------------------------------------------------------------------------

/** Returns the stage metadata for a given stage number, or undefined. */
export function getStageMetadata(
  stageNumber: number,
): PipelineStageMetadata | undefined {
  return PIPELINE_STAGE_METADATA.find((s) => s.stageNumber === stageNumber);
}

/** Returns the expected stage name for a given stage number (1-indexed). */
export function getExpectedStageName(
  stageNumber: PipelineStageNumber,
): PipelineStageName {
  return PIPELINE_STAGES[stageNumber - 1] as PipelineStageName;
}

/** Returns true if the value is one of the seven canonical stage names. */
export function isPipelineStageName(value: unknown): value is PipelineStageName {
  return PIPELINE_STAGES.includes(value as PipelineStageName);
}
