/**
 * DRA-VAL-001A — Tests: Threats to Validity Register
 */

import { describe, it, expect } from "vitest";
import { ThreatToValiditySchema, ThreatsRegisterSchema } from "../threats.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validThreat(overrides: Record<string, unknown> = {}) {
  return {
    id: "TVR-001",
    title: "Founder-designed evaluator bias",
    description:
      "The evaluator was designed and implemented by the same team conducting the validation. This introduces potential confirmation bias in both design and interpretation.",
    affectedComponent: "corpus selection, comparison analysis, interpretation",
    likelihood: "HIGH",
    impact: "HIGH",
    mitigation:
      "Evaluation protocol is pre-registered and frozen before results are inspected. Reviewers are independent of the development team.",
    residualRisk: "MEDIUM",
    status: "OPEN",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// ThreatToValiditySchema
// ---------------------------------------------------------------------------

describe("ThreatToValiditySchema", () => {
  it("accepts a valid threat", () => {
    expect(ThreatToValiditySchema.safeParse(validThreat()).success).toBe(true);
  });

  it("rejects invalid threat ID", () => {
    expect(ThreatToValiditySchema.safeParse(validThreat({ id: "TVR-01" })).success).toBe(false);
    expect(ThreatToValiditySchema.safeParse(validThreat({ id: "tv-001" })).success).toBe(false);
    expect(ThreatToValiditySchema.safeParse(validThreat({ id: "" })).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(ThreatToValiditySchema.safeParse(validThreat({ title: "" })).success).toBe(false);
  });

  it("rejects description shorter than 30 characters", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ description: "Too short." })).success,
    ).toBe(false);
  });

  it("rejects empty affectedComponent", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ affectedComponent: "" })).success,
    ).toBe(false);
  });

  it("rejects invalid likelihood", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ likelihood: "CRITICAL" })).success,
    ).toBe(false);
  });

  it("rejects invalid impact", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ impact: "NEGLIGIBLE" })).success,
    ).toBe(false);
  });

  it("rejects mitigation shorter than 20 characters", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ mitigation: "Pre-register." })).success,
    ).toBe(false);
  });

  it("rejects invalid residualRisk", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ residualRisk: "NONE" })).success,
    ).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(
      ThreatToValiditySchema.safeParse(validThreat({ status: "CLOSED" })).success,
    ).toBe(false);
  });

  it("accepts all valid risk levels", () => {
    for (const level of ["LOW", "MEDIUM", "HIGH"]) {
      expect(
        ThreatToValiditySchema.safeParse(
          validThreat({ likelihood: level, impact: level, residualRisk: level }),
        ).success,
      ).toBe(true);
    }
  });

  it("accepts all valid statuses", () => {
    for (const status of ["OPEN", "MITIGATED", "ACCEPTED"]) {
      expect(
        ThreatToValiditySchema.safeParse(validThreat({ status })).success,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// ThreatsRegisterSchema
// ---------------------------------------------------------------------------

describe("ThreatsRegisterSchema", () => {
  it("accepts a register with one threat", () => {
    expect(
      ThreatsRegisterSchema.safeParse({ threats: [validThreat()] }).success,
    ).toBe(true);
  });

  it("accepts a register with multiple threats", () => {
    expect(
      ThreatsRegisterSchema.safeParse({
        threats: [
          validThreat({ id: "TVR-001" }),
          validThreat({ id: "TVR-002", title: "Synthetic-document bias" }),
          validThreat({ id: "TVR-003", title: "Small-sample uncertainty" }),
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty threats array", () => {
    expect(ThreatsRegisterSchema.safeParse({ threats: [] }).success).toBe(false);
  });

  it("rejects duplicate threat IDs", () => {
    expect(
      ThreatsRegisterSchema.safeParse({
        threats: [
          validThreat({ id: "TVR-001" }),
          validThreat({ id: "TVR-001" }), // duplicate
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a register containing an invalid threat", () => {
    expect(
      ThreatsRegisterSchema.safeParse({
        threats: [validThreat(), validThreat({ id: "INVALID" })],
      }).success,
    ).toBe(false);
  });
});
