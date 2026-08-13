/**
 * DRA-VAL-001A — Tests: Protocol Registration
 */

import { describe, it, expect } from "vitest";
import { ProtocolRegistrationSchema } from "../registration.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validRegistration(overrides: Record<string, unknown> = {}) {
  const digest = "a".repeat(64);
  return {
    id: "REG-001",
    protocolId: "DRA-VAL-001A",
    protocolVersion: "1.0.0",
    freezeTimestamp: "2026-07-27T12:00:00.000Z",
    filesIncluded: [
      "DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md",
      "DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md",
    ],
    integrityDigests: {
      "DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md": digest,
      "DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md": digest,
    },
    studyStatus: "PROTOCOL_DEVELOPMENT",
    benchmarkAcquisitionStatus: "NOT_STARTED",
    reviewerRecruitmentStatus: "NOT_STARTED",
    evaluatorFreezeIdentifier: "DRA-EVALUATOR-V1-FROZEN",
    noResultsInspected: true as const,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ProtocolRegistrationSchema", () => {
  it("accepts a valid registration", () => {
    expect(ProtocolRegistrationSchema.safeParse(validRegistration()).success).toBe(true);
  });

  it("rejects invalid registration ID", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(validRegistration({ id: "REG-01" })).success,
    ).toBe(false);
  });

  it("rejects invalid protocol ID", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ protocolId: "VAL-001A" }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty protocolVersion", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ protocolVersion: "" }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty filesIncluded", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ filesIncluded: [], integrityDigests: {} }),
      ).success,
    ).toBe(false);
  });

  it("rejects integrityDigest shorter than 64 characters", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({
          integrityDigests: {
            "DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md": "abc123",
            "DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md": "a".repeat(64),
          },
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects filesIncluded entry missing from integrityDigests", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({
          filesIncluded: [
            "DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md",
            "DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md",
            "DRA-VAL-001B-REVIEWER-PROTOCOL.md", // not in digests
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects noResultsInspected: false", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ noResultsInspected: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty evaluatorFreezeIdentifier", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ evaluatorFreezeIdentifier: "" }),
      ).success,
    ).toBe(false);
  });

  it("rejects unknown studyStatus", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ studyStatus: "ABANDONED" }),
      ).success,
    ).toBe(false);
  });

  it("rejects unknown benchmarkAcquisitionStatus", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({ benchmarkAcquisitionStatus: "PENDING" }),
      ).success,
    ).toBe(false);
  });

  it("accepts all valid study statuses", () => {
    const statuses = [
      "PROTOCOL_DEVELOPMENT",
      "CORPUS_ACQUISITION",
      "REVIEWER_RECRUITMENT",
      "PILOT_EXECUTION",
      "MAIN_EXECUTION",
      "ANALYSIS",
      "REPORTING",
      "COMPLETE",
      "SUSPENDED",
    ];
    for (const studyStatus of statuses) {
      expect(
        ProtocolRegistrationSchema.safeParse(validRegistration({ studyStatus })).success,
      ).toBe(true);
    }
  });

  it("accepts an optional repositoryCommit", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({
          repositoryCommit: "abc1234567890abcdef1234567890abcdef123456",
        }),
      ).success,
    ).toBe(true);
  });

  it("accepts an optional notes field", () => {
    expect(
      ProtocolRegistrationSchema.safeParse(
        validRegistration({
          notes: "Protocol frozen at DRA-001-07 milestone checkpoint.",
        }),
      ).success,
    ).toBe(true);
  });
});
