/**
 * DRA-VAL-001A — Scientific Validation Protocol — Threats to Validity Register
 *
 * Defines the ThreatToValidity schema and the ThreatsRegister aggregate.
 *
 * Every threat record must contain all required fields — no field may be
 * empty or omitted. Incomplete records are rejected at parse time.
 *
 * Threat identifiers follow the format TVR-NNN.
 */

import { z } from "zod";
import { ThreatIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Likelihood / impact / residual risk levels
// ---------------------------------------------------------------------------

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RiskLevelSchema = z.enum(
  RISK_LEVELS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Risk level must be one of: ${RISK_LEVELS.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Threat status
// ---------------------------------------------------------------------------

export const THREAT_STATUSES = ["OPEN", "MITIGATED", "ACCEPTED"] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export const ThreatStatusSchema = z.enum(
  THREAT_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Threat status must be one of: ${THREAT_STATUSES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Threat to validity
// ---------------------------------------------------------------------------

/**
 * A single registered threat to the scientific validity of the study.
 *
 * All eight fields are mandatory. A record with any empty string in a
 * required text field is rejected.
 */
export const ThreatToValiditySchema = z.object({
  /** Unique identifier. Format: TVR-NNN. */
  id: ThreatIdSchema,

  /**
   * Short title for this threat (e.g. "Founder-designed corpus risk").
   * Must not be empty.
   */
  title: z.string().min(5, "Threat title must not be empty"),

  /**
   * Detailed description of the threat.
   * Must explain what the threat is and why it could compromise validity.
   * Must be at least 30 characters.
   */
  description: z
    .string()
    .min(30, "Threat description must be at least 30 characters"),

  /**
   * The component(s) of the study affected by this threat.
   * Examples: "corpus selection", "reviewer independence", "comparison analysis".
   */
  affectedComponent: z
    .string()
    .min(5, "affectedComponent must identify the affected study component"),

  /**
   * Assessed likelihood of this threat materialising.
   * One of: LOW, MEDIUM, HIGH.
   */
  likelihood: RiskLevelSchema,

  /**
   * Assessed impact on study validity if this threat materialises.
   * One of: LOW, MEDIUM, HIGH.
   */
  impact: RiskLevelSchema,

  /**
   * The mitigation measure(s) in place or planned.
   * Must describe a specific action, not just an aspiration.
   * Must be at least 20 characters.
   */
  mitigation: z
    .string()
    .min(20, "Threat mitigation must describe a specific measure"),

  /**
   * Residual risk level after mitigation is applied.
   * One of: LOW, MEDIUM, HIGH.
   */
  residualRisk: RiskLevelSchema,

  /**
   * Current status of this threat.
   * OPEN: not yet mitigated; MITIGATED: mitigation active; ACCEPTED: residual risk accepted.
   */
  status: ThreatStatusSchema,
});

export type ThreatToValidity = z.infer<typeof ThreatToValiditySchema>;

// ---------------------------------------------------------------------------
// Threats register
// ---------------------------------------------------------------------------

/**
 * The full threats-to-validity register.
 *
 * Must contain at least one threat. Threat IDs must be unique.
 */
export const ThreatsRegisterSchema = z
  .object({
    /** All registered threats. Must not be empty. */
    threats: z
      .array(ThreatToValiditySchema)
      .min(1, "At least one threat to validity must be registered"),
  })
  .refine(
    (reg) => {
      const ids = reg.threats.map((t) => t.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: "Threat IDs must be unique within the register",
      path: ["threats"],
    },
  );

export type ThreatsRegister = z.infer<typeof ThreatsRegisterSchema>;
