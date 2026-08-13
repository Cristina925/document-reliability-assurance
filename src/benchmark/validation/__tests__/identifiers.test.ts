/**
 * DRA-VAL-001A — Tests: Identifier Schemas
 */

import { describe, it, expect } from "vitest";
import {
  ValidationProtocolIdSchema,
  ResearchQuestionIdSchema,
  HypothesisIdSchema,
  NullHypothesisIdSchema,
  MetricIdSchema,
  MatchingRuleIdSchema,
  ThreatIdSchema,
  AmendmentIdSchema,
  RegistrationIdSchema,
} from "../identifiers.js";

describe("ValidationProtocolIdSchema", () => {
  it("accepts DRA-VAL-NNN format", () => {
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001").success).toBe(true);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-999").success).toBe(true);
  });

  it("accepts DRA-VAL-NNNA format (with trailing letter)", () => {
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001A").success).toBe(true);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001B").success).toBe(true);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001Z").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(ValidationProtocolIdSchema.safeParse("").success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-01").success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse("VAL-001").success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001a").success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-0001").success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse("DRA-VAL-001-A").success).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(ValidationProtocolIdSchema.safeParse(null).success).toBe(false);
    expect(ValidationProtocolIdSchema.safeParse(123).success).toBe(false);
  });
});

describe("ResearchQuestionIdSchema", () => {
  it("accepts RQ-NNN format", () => {
    expect(ResearchQuestionIdSchema.safeParse("RQ-001").success).toBe(true);
    expect(ResearchQuestionIdSchema.safeParse("RQ-999").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(ResearchQuestionIdSchema.safeParse("RQ-01").success).toBe(false);
    expect(ResearchQuestionIdSchema.safeParse("rq-001").success).toBe(false);
    expect(ResearchQuestionIdSchema.safeParse("RQ001").success).toBe(false);
    expect(ResearchQuestionIdSchema.safeParse("").success).toBe(false);
  });
});

describe("HypothesisIdSchema", () => {
  it("accepts H-NNN format", () => {
    expect(HypothesisIdSchema.safeParse("H-001").success).toBe(true);
    expect(HypothesisIdSchema.safeParse("H-099").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(HypothesisIdSchema.safeParse("H-01").success).toBe(false);
    expect(HypothesisIdSchema.safeParse("H001").success).toBe(false);
    expect(HypothesisIdSchema.safeParse("NH-001").success).toBe(false);
  });
});

describe("NullHypothesisIdSchema", () => {
  it("accepts NH-NNN format", () => {
    expect(NullHypothesisIdSchema.safeParse("NH-001").success).toBe(true);
    expect(NullHypothesisIdSchema.safeParse("NH-099").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(NullHypothesisIdSchema.safeParse("H-001").success).toBe(false);
    expect(NullHypothesisIdSchema.safeParse("NH-01").success).toBe(false);
    expect(NullHypothesisIdSchema.safeParse("").success).toBe(false);
  });
});

describe("MetricIdSchema", () => {
  it("accepts MTR-NNN format", () => {
    expect(MetricIdSchema.safeParse("MTR-001").success).toBe(true);
    expect(MetricIdSchema.safeParse("MTR-042").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(MetricIdSchema.safeParse("MTR-01").success).toBe(false);
    expect(MetricIdSchema.safeParse("MR-001").success).toBe(false);
    expect(MetricIdSchema.safeParse("mtr-001").success).toBe(false);
  });
});

describe("MatchingRuleIdSchema", () => {
  it("accepts MR-NNN format", () => {
    expect(MatchingRuleIdSchema.safeParse("MR-001").success).toBe(true);
    expect(MatchingRuleIdSchema.safeParse("MR-099").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(MatchingRuleIdSchema.safeParse("MR-01").success).toBe(false);
    expect(MatchingRuleIdSchema.safeParse("MTR-001").success).toBe(false);
    expect(MatchingRuleIdSchema.safeParse("mr-001").success).toBe(false);
  });
});

describe("ThreatIdSchema", () => {
  it("accepts TVR-NNN format", () => {
    expect(ThreatIdSchema.safeParse("TVR-001").success).toBe(true);
    expect(ThreatIdSchema.safeParse("TVR-017").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(ThreatIdSchema.safeParse("TVR-01").success).toBe(false);
    expect(ThreatIdSchema.safeParse("TV-001").success).toBe(false);
    expect(ThreatIdSchema.safeParse("tvr-001").success).toBe(false);
    expect(ThreatIdSchema.safeParse("").success).toBe(false);
  });
});

describe("AmendmentIdSchema", () => {
  it("accepts AMD-NNN format", () => {
    expect(AmendmentIdSchema.safeParse("AMD-001").success).toBe(true);
    expect(AmendmentIdSchema.safeParse("AMD-099").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(AmendmentIdSchema.safeParse("AMD-01").success).toBe(false);
    expect(AmendmentIdSchema.safeParse("AM-001").success).toBe(false);
    expect(AmendmentIdSchema.safeParse("amd-001").success).toBe(false);
  });
});

describe("RegistrationIdSchema", () => {
  it("accepts REG-NNN format", () => {
    expect(RegistrationIdSchema.safeParse("REG-001").success).toBe(true);
    expect(RegistrationIdSchema.safeParse("REG-099").success).toBe(true);
  });

  it("rejects malformed identifiers", () => {
    expect(RegistrationIdSchema.safeParse("REG-01").success).toBe(false);
    expect(RegistrationIdSchema.safeParse("RG-001").success).toBe(false);
    expect(RegistrationIdSchema.safeParse("reg-001").success).toBe(false);
  });
});
