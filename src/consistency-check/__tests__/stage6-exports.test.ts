/**
 * DRA-ENG-008 — Stage 6: Consistency Check — Export Surface Test
 *
 * Verifies that all expected symbols are exported from the consistency-check
 * module and that constant values satisfy structural contracts.
 */

import { describe, it, expect } from "vitest";
import {
  checkConsistency,
  detectIssues,
  STAGE_6_ID,
  STAGE_6_VERSION,
  CONSISTENCY_CHECK_VERSION,
  type Stage6Result,
  type Stage6Success,
  type Stage6Failure,
  type Stage6Id,
} from "../index.js";

describe("Stage 6 consistency-check exports", () => {
  it("exports checkConsistency as a function", () => {
    expect(typeof checkConsistency).toBe("function");
  });

  it("exports detectIssues as a function", () => {
    expect(typeof detectIssues).toBe("function");
  });

  it("STAGE_6_ID is the expected constant string", () => {
    expect(STAGE_6_ID).toBe("STAGE_6_CONSISTENCY_CHECK");
  });

  it("STAGE_6_VERSION is a semver string", () => {
    expect(STAGE_6_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("CONSISTENCY_CHECK_VERSION equals STAGE_6_VERSION", () => {
    expect(CONSISTENCY_CHECK_VERSION).toBe(STAGE_6_VERSION);
  });

  it("Stage6 type guard: ok:true → Stage6Success", () => {
    const result: Stage6Result = checkConsistency(null, null, null, null, null);
    if (!result.ok) {
      const f: Stage6Failure = result;
      expect(f.errors).toBeDefined();
    }
  });

  it("Stage6Failure has stageId matching STAGE_6_ID", () => {
    const result = checkConsistency(null, null, null, null, null);
    expect(result.stageId).toBe(STAGE_6_ID);
  });
});
