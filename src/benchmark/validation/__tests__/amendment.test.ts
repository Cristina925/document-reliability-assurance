/**
 * DRA-VAL-001A — Tests: Protocol Amendments
 */

import { describe, it, expect } from "vitest";
import { ProtocolAmendmentSchema, AmendmentLogSchema } from "../amendment.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validAmendment(overrides: Record<string, unknown> = {}) {
  return {
    id: "AMD-001",
    description: "Clarification of document length strata definitions.",
    rationale:
      "The original description was ambiguous about whether length is measured in words or tokens. This amendment clarifies that length is measured in word count.",
    timestamp: "2026-07-27T10:00:00.000Z",
    amendedBy: "Protocol Custodian",
    affectedSections: ["DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL §4.3"],
    reason: "SCOPE_CLARIFICATION",
    isProhibitedRetrospective: false as const,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// ProtocolAmendmentSchema
// ---------------------------------------------------------------------------

describe("ProtocolAmendmentSchema", () => {
  it("accepts a valid amendment", () => {
    expect(ProtocolAmendmentSchema.safeParse(validAmendment()).success).toBe(true);
  });

  it("rejects invalid amendment ID", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ id: "AMD-01" })).success,
    ).toBe(false);
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ id: "amd-001" })).success,
    ).toBe(false);
  });

  it("rejects short description", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ description: "Fix" })).success,
    ).toBe(false);
  });

  it("rejects short rationale", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ rationale: "Needed." })).success,
    ).toBe(false);
  });

  it("rejects empty amendedBy", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ amendedBy: "" })).success,
    ).toBe(false);
  });

  it("rejects empty affectedSections", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ affectedSections: [] })).success,
    ).toBe(false);
  });

  it("rejects unknown reason", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(validAmendment({ reason: "RESULT_IMPROVEMENT" })).success,
    ).toBe(false);
  });

  it("rejects isProhibitedRetrospective: true", () => {
    expect(
      ProtocolAmendmentSchema.safeParse(
        validAmendment({ isProhibitedRetrospective: true }),
      ).success,
    ).toBe(false);
  });

  it("accepts all authorised amendment reasons", () => {
    const reasons = [
      "PROCEDURAL_CORRECTION",
      "SCOPE_CLARIFICATION",
      "REVIEWER_REPLACEMENT",
      "DOCUMENT_WITHDRAWAL",
      "PROTOCOL_DEVIATION",
    ];
    for (const reason of reasons) {
      expect(
        ProtocolAmendmentSchema.safeParse(validAmendment({ reason })).success,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// AmendmentLogSchema
// ---------------------------------------------------------------------------

describe("AmendmentLogSchema", () => {
  it("accepts an empty amendment log", () => {
    expect(AmendmentLogSchema.safeParse({ amendments: [] }).success).toBe(true);
  });

  it("accepts a log with multiple amendments", () => {
    expect(
      AmendmentLogSchema.safeParse({
        amendments: [
          validAmendment({ id: "AMD-001" }),
          validAmendment({ id: "AMD-002", reason: "DOCUMENT_WITHDRAWAL" }),
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects duplicate amendment IDs", () => {
    expect(
      AmendmentLogSchema.safeParse({
        amendments: [
          validAmendment({ id: "AMD-001" }),
          validAmendment({ id: "AMD-001" }),
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects a log containing an invalid amendment", () => {
    expect(
      AmendmentLogSchema.safeParse({
        amendments: [validAmendment(), validAmendment({ isProhibitedRetrospective: true })],
      }).success,
    ).toBe(false);
  });
});
