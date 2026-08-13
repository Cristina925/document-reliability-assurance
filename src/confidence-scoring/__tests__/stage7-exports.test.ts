/**
 * DRA-ENG-008 — Stage 7: Confidence Scoring — Export Surface Test
 *
 * Verifies that all expected symbols are exported from the confidence-scoring
 * module and that constant values satisfy structural contracts.
 */

import { describe, it, expect } from "vitest";
import {
  scoreConfidence,
  CONFIDENCE_LEVELS,
  isConfidenceLevel,
  confidencePriority,
  STAGE_7_ID,
  STAGE_7_VERSION,
  STAGE_7_RESULT_VERSION,
  CONFIDENCE_SCORING_RULE_VERSION,
  type ConfidenceLevel,
  type Stage7Result,
  type Stage7Success,
  type Stage7Failure,
} from "../index.js";

describe("Stage 7 confidence-scoring exports", () => {
  it("exports scoreConfidence as a function", () => {
    expect(typeof scoreConfidence).toBe("function");
  });

  it("CONFIDENCE_LEVELS contains exactly the four expected levels", () => {
    expect(CONFIDENCE_LEVELS).toContain("CONFIRMED");
    expect(CONFIDENCE_LEVELS).toContain("PARTIAL");
    expect(CONFIDENCE_LEVELS).toContain("UNVERIFIED");
    expect(CONFIDENCE_LEVELS).toContain("CONTESTED");
    expect(CONFIDENCE_LEVELS.length).toBe(4);
  });

  it("isConfidenceLevel correctly identifies valid and invalid values", () => {
    expect(isConfidenceLevel("CONFIRMED")).toBe(true);
    expect(isConfidenceLevel("PARTIAL")).toBe(true);
    expect(isConfidenceLevel("UNVERIFIED")).toBe(true);
    expect(isConfidenceLevel("CONTESTED")).toBe(true);
    expect(isConfidenceLevel("UNKNOWN")).toBe(false);
    expect(isConfidenceLevel(null)).toBe(false);
  });

  it("confidencePriority orders CONFIRMED > PARTIAL > UNVERIFIED > CONTESTED", () => {
    expect(confidencePriority("CONFIRMED")).toBeGreaterThan(
      confidencePriority("PARTIAL"),
    );
    expect(confidencePriority("PARTIAL")).toBeGreaterThan(
      confidencePriority("UNVERIFIED"),
    );
    expect(confidencePriority("UNVERIFIED")).toBeGreaterThan(
      confidencePriority("CONTESTED"),
    );
  });

  it("STAGE_7_ID is the expected constant string", () => {
    expect(STAGE_7_ID).toBe("STAGE_7_CONFIDENCE_SCORING");
  });

  it("STAGE_7_VERSION / STAGE_7_RESULT_VERSION are semver strings", () => {
    expect(STAGE_7_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(STAGE_7_RESULT_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("CONFIDENCE_SCORING_RULE_VERSION is a semver string", () => {
    expect(CONFIDENCE_SCORING_RULE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("Stage7Failure has stageId matching STAGE_7_ID", () => {
    const result = scoreConfidence(null, null, null, null, null, null);
    expect(result.stageId).toBe(STAGE_7_ID);
    expect(result.ok).toBe(false);
  });
});
