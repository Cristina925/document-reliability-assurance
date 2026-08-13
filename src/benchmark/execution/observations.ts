/**
 * DRA-001-06 — Observation Register
 *
 * Records structured observations about the evaluator's performance during
 * the benchmark execution. Observations capture evaluator strengths,
 * weaknesses, ambiguous cases, reviewer disagreements, and benchmark
 * limitations.
 *
 * Critical constraint: observations MUST NOT alter evaluator behaviour.
 * The ObservationRegister is a read-only record; it is never fed back
 * into the evaluator pipeline.
 *
 * Design: ObservationRegister is an immutable value. Operations return
 * new instances; the original is unchanged.
 */

import type { CorpusId } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// ObservationType
// ---------------------------------------------------------------------------

export const OBSERVATION_TYPES = [
  "STRENGTH",
  "WEAKNESS",
  "AMBIGUOUS_CASE",
  "REVIEWER_DISAGREEMENT",
  "LIMITATION",
] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

/**
 * A single structured observation about the benchmark execution.
 * Observations are never fed back into the evaluator.
 */
export interface Observation {
  /** Unique identifier for this observation within the register. */
  readonly observationId: string;
  /** Category of observation. */
  readonly type: ObservationType;
  /**
   * Corpus document this observation relates to, when document-specific.
   * Absent for corpus-wide or methodology observations.
   */
  readonly corpusId?: CorpusId;
  /** Human-readable description of the observation. */
  readonly description: string;
  /** Specific data point or evidence that supports this observation. */
  readonly evidence?: string;
  /** UTC ISO-8601 datetime at which this observation was recorded. */
  readonly recordedAt: string;
}

// ---------------------------------------------------------------------------
// ObservationRegister
// ---------------------------------------------------------------------------

/** An immutable, append-only register of benchmark observations. */
export interface ObservationRegister {
  readonly registerId: string;
  /** UTC ISO-8601 datetime at which this register was created. */
  readonly createdAt: string;
  /** All observations in the order they were recorded. */
  readonly observations: readonly Observation[];
}

// ---------------------------------------------------------------------------
// Factory and operations
// ---------------------------------------------------------------------------

/** Creates a new empty ObservationRegister. */
export function createObservationRegister(
  registerId: string,
  createdAt: string,
): ObservationRegister {
  return Object.freeze({
    registerId,
    createdAt,
    observations: Object.freeze<Observation[]>([]),
  });
}

/**
 * Returns a new ObservationRegister with the observation appended.
 * The original register is unchanged.
 */
export function addObservation(
  register: ObservationRegister,
  observation: Observation,
): ObservationRegister {
  return Object.freeze({
    ...register,
    observations: Object.freeze([...register.observations, observation]),
  });
}

/** Returns all observations of a given type. */
export function getObservationsByType(
  register: ObservationRegister,
  type: ObservationType,
): readonly Observation[] {
  return register.observations.filter((o) => o.type === type);
}

/** Returns all observations for a specific corpus document. */
export function getObservationsForDocument(
  register: ObservationRegister,
  corpusId: CorpusId,
): readonly Observation[] {
  return register.observations.filter((o) => o.corpusId === corpusId);
}

/** Returns the total number of observations in this register. */
export function observationCount(register: ObservationRegister): number {
  return register.observations.length;
}

/** Returns the number of observations of a given type. */
export function observationCountByType(
  register: ObservationRegister,
  type: ObservationType,
): number {
  return register.observations.filter((o) => o.type === type).length;
}
