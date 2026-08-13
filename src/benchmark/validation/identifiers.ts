/**
 * DRA-VAL-001A — Scientific Validation Protocol — Identifier Schemas
 *
 * Canonical identifier formats for the validation protocol module.
 * All identifiers are validated at parse-time; malformed identifiers
 * are rejected with descriptive error messages.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Protocol identifier
// ---------------------------------------------------------------------------

/**
 * Regex for validation protocol identifiers.
 * Format: DRA-VAL-NNN or DRA-VAL-NNNA (with optional trailing letter).
 * Examples: DRA-VAL-001, DRA-VAL-001A
 */
export const PROTOCOL_ID_REGEX = /^DRA-VAL-\d{3}[A-Z]?$/;

export const ValidationProtocolIdSchema = z
  .string()
  .regex(PROTOCOL_ID_REGEX, {
    message:
      "Validation protocol ID must match DRA-VAL-NNN or DRA-VAL-NNNA (e.g. DRA-VAL-001A)",
  });

export type ValidationProtocolId = z.infer<typeof ValidationProtocolIdSchema>;

// ---------------------------------------------------------------------------
// Research question identifier
// ---------------------------------------------------------------------------

/** Format: RQ-NNN. Examples: RQ-001, RQ-002. */
export const RESEARCH_QUESTION_ID_REGEX = /^RQ-\d{3}$/;

export const ResearchQuestionIdSchema = z
  .string()
  .regex(RESEARCH_QUESTION_ID_REGEX, {
    message: "Research question ID must match RQ-NNN (e.g. RQ-001)",
  });

export type ResearchQuestionId = z.infer<typeof ResearchQuestionIdSchema>;

// ---------------------------------------------------------------------------
// Hypothesis identifier
// ---------------------------------------------------------------------------

/** Format: H-NNN. Examples: H-001, H-002. */
export const HYPOTHESIS_ID_REGEX = /^H-\d{3}$/;

export const HypothesisIdSchema = z
  .string()
  .regex(HYPOTHESIS_ID_REGEX, {
    message: "Hypothesis ID must match H-NNN (e.g. H-001)",
  });

export type HypothesisId = z.infer<typeof HypothesisIdSchema>;

// ---------------------------------------------------------------------------
// Null hypothesis identifier
// ---------------------------------------------------------------------------

/** Format: NH-NNN. Examples: NH-001, NH-002. */
export const NULL_HYPOTHESIS_ID_REGEX = /^NH-\d{3}$/;

export const NullHypothesisIdSchema = z
  .string()
  .regex(NULL_HYPOTHESIS_ID_REGEX, {
    message: "Null hypothesis ID must match NH-NNN (e.g. NH-001)",
  });

export type NullHypothesisId = z.infer<typeof NullHypothesisIdSchema>;

// ---------------------------------------------------------------------------
// Metric identifier
// ---------------------------------------------------------------------------

/** Format: MTR-NNN. Examples: MTR-001, MTR-002. */
export const METRIC_ID_REGEX = /^MTR-\d{3}$/;

export const MetricIdSchema = z
  .string()
  .regex(METRIC_ID_REGEX, {
    message: "Metric ID must match MTR-NNN (e.g. MTR-001)",
  });

export type MetricId = z.infer<typeof MetricIdSchema>;

// ---------------------------------------------------------------------------
// Issue matching rule identifier
// ---------------------------------------------------------------------------

/** Format: MR-NNN. Examples: MR-001, MR-002. */
export const MATCHING_RULE_ID_REGEX = /^MR-\d{3}$/;

export const MatchingRuleIdSchema = z
  .string()
  .regex(MATCHING_RULE_ID_REGEX, {
    message: "Matching rule ID must match MR-NNN (e.g. MR-001)",
  });

export type MatchingRuleId = z.infer<typeof MatchingRuleIdSchema>;

// ---------------------------------------------------------------------------
// Threat-to-validity identifier
// ---------------------------------------------------------------------------

/** Format: TVR-NNN. Examples: TVR-001, TVR-002. */
export const THREAT_ID_REGEX = /^TVR-\d{3}$/;

export const ThreatIdSchema = z
  .string()
  .regex(THREAT_ID_REGEX, {
    message: "Threat ID must match TVR-NNN (e.g. TVR-001)",
  });

export type ThreatId = z.infer<typeof ThreatIdSchema>;

// ---------------------------------------------------------------------------
// Amendment identifier
// ---------------------------------------------------------------------------

/** Format: AMD-NNN. Examples: AMD-001, AMD-002. */
export const AMENDMENT_ID_REGEX = /^AMD-\d{3}$/;

export const AmendmentIdSchema = z
  .string()
  .regex(AMENDMENT_ID_REGEX, {
    message: "Amendment ID must match AMD-NNN (e.g. AMD-001)",
  });

export type AmendmentId = z.infer<typeof AmendmentIdSchema>;

// ---------------------------------------------------------------------------
// Registration identifier
// ---------------------------------------------------------------------------

/** Format: REG-NNN. Examples: REG-001, REG-002. */
export const REGISTRATION_ID_REGEX = /^REG-\d{3}$/;

export const RegistrationIdSchema = z
  .string()
  .regex(REGISTRATION_ID_REGEX, {
    message: "Registration ID must match REG-NNN (e.g. REG-001)",
  });

export type RegistrationId = z.infer<typeof RegistrationIdSchema>;
