/**
 * DRA-ENG-001 — Scaffold Integration Test
 *
 * Milestone: DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline
 *
 * Verifies that the package scaffolding constants are present and reflect
 * the current implementation milestone. Updated cumulatively as each
 * engineering milestone (DRA-ENG-NNN) is completed.
 *
 * Latest update: DRA-ENG-010 (Evaluator Integration — evaluateDocument pipeline).
 * Expected to be extended through DRA-ENG-012 (Component Verification).
 */

import { describe, it, expect } from "vitest";
import { DRA_VERSION, DRA_PROGRAMME, DRA_STATUS } from "../index.js";

describe("DRA-ENG-001 scaffold integration", () => {
  it("DRA_VERSION is a semver string", () => {
    expect(typeof DRA_VERSION).toBe("string");
    expect(DRA_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("DRA_PROGRAMME is the canonical programme identifier", () => {
    expect(DRA_PROGRAMME).toBe("DRA-001");
  });

  it("DRA_STATUS reflects the current implementation milestone", () => {
    // Updated at DRA-ENG-010: full evaluateDocument pipeline is implemented.
    expect(typeof DRA_STATUS).toBe("string");
    expect(DRA_STATUS.length).toBeGreaterThan(0);
    expect(DRA_STATUS).toContain("DRA-ENG-008B");
  });
});
