/**
 * DRA-ENG-010 — Pipeline Integration — Export Surface Test
 *
 * Verifies that all expected symbols are exported from the pipeline module
 * and from the top-level package index.
 */

import { describe, it, expect } from "vitest";

// Pipeline module exports
import {
  evaluateDocument,
  deriveDecision,
  buildProofReceipt,
  type DocumentAssuranceEvaluation,
  type DocumentAssuranceSuccess,
  type DocumentAssuranceFailure,
  type DecisionResult,
  type BuildReceiptParams,
} from "../index.js";

// Top-level index exports (Stage 6 + Stage 7 + pipeline)
import {
  // Stage 6
  checkConsistency,
  STAGE_6_ID,
  STAGE_6_VERSION,
  CONSISTENCY_CHECK_VERSION,
  detectIssues,
  // Stage 7
  scoreConfidence,
  CONFIDENCE_LEVELS,
  isConfidenceLevel,
  confidencePriority,
  STAGE_7_ID,
  STAGE_7_VERSION,
  // Pipeline
} from "../../index.js";

// Also re-check DRA_STATUS has been updated
import { DRA_STATUS } from "../../index.js";

describe("pipeline/index exports", () => {
  it("exports evaluateDocument as a function", () => {
    expect(typeof evaluateDocument).toBe("function");
  });

  it("exports deriveDecision as a function", () => {
    expect(typeof deriveDecision).toBe("function");
  });

  it("exports buildProofReceipt as a function", () => {
    expect(typeof buildProofReceipt).toBe("function");
  });

  it("deriveDecision returns SUPPORTED for empty issues", () => {
    const result = deriveDecision([]);
    expect(result.decision).toBe("SUPPORTED");
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it("deriveDecision returns HOLD for any BLOCKING issue", () => {
    const fakeIssue = {
      id: "issue-0001" as any,
      issueClass: "UNSUPPORTED_CLAIM" as any,
      severity: "BLOCKING" as const,
      affectedStatementIds: ["s-001" as any],
      affectedEvidenceUnitIds: [],
      explanation: "Test blocking issue",
      stageAssociation: "Consistency Check" as any,
      metadata: {},
    };
    const result = deriveDecision([fakeIssue]);
    expect(result.decision).toBe("HOLD");
    expect(result.rationale).toContain("HOLD");
    expect(result.rationale).toContain("UNSUPPORTED_CLAIM");
  });

  it("deriveDecision returns REVIEW when only ADVISORY issues", () => {
    const fakeIssue = {
      id: "issue-0001" as any,
      issueClass: "AUTHORITY_ABSENT" as any,
      severity: "ADVISORY" as const,
      affectedStatementIds: ["s-001" as any],
      affectedEvidenceUnitIds: [],
      explanation: "Test advisory issue",
      stageAssociation: "Consistency Check" as any,
      metadata: {},
    };
    const result = deriveDecision([fakeIssue]);
    expect(result.decision).toBe("REVIEW");
    expect(result.rationale).toContain("REVIEW");
  });
});

describe("top-level index — Stage 6 exports", () => {
  it("exports checkConsistency, STAGE_6_ID, STAGE_6_VERSION", () => {
    expect(typeof checkConsistency).toBe("function");
    expect(STAGE_6_ID).toBe("STAGE_6_CONSISTENCY_CHECK");
    expect(STAGE_6_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("exports CONSISTENCY_CHECK_VERSION and detectIssues", () => {
    expect(CONSISTENCY_CHECK_VERSION).toBe(STAGE_6_VERSION);
    expect(typeof detectIssues).toBe("function");
  });
});

describe("top-level index — Stage 7 exports", () => {
  it("exports scoreConfidence, STAGE_7_ID, STAGE_7_VERSION", () => {
    expect(typeof scoreConfidence).toBe("function");
    expect(STAGE_7_ID).toBe("STAGE_7_CONFIDENCE_SCORING");
    expect(STAGE_7_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("exports CONFIDENCE_LEVELS, isConfidenceLevel, confidencePriority", () => {
    expect(CONFIDENCE_LEVELS.length).toBe(4);
    expect(typeof isConfidenceLevel).toBe("function");
    expect(typeof confidencePriority).toBe("function");
  });
});

describe("top-level index — DRA_STATUS", () => {
  it("DRA_STATUS reflects DRA-ENG-008B", () => {
    expect(DRA_STATUS).toContain("DRA-ENG-008B");
  });
});
