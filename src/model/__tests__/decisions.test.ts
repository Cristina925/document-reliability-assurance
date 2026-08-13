/**
 * DRA-ENG-002 — Decision Tests
 */

import { describe, it, expect } from "vitest";
import {
  ASSURANCE_DECISIONS,
  AssuranceDecisionSchema,
  isAssuranceDecision,
} from "../../model/decisions.js";
import { INVALID_DECISIONS } from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Assurance Decisions", () => {
  describe("canonical constant", () => {
    it("contains exactly three decision literals", () => {
      expect(ASSURANCE_DECISIONS).toHaveLength(3);
    });

    it("contains SUPPORTED", () => {
      expect(ASSURANCE_DECISIONS).toContain("SUPPORTED");
    });

    it("contains REVIEW", () => {
      expect(ASSURANCE_DECISIONS).toContain("REVIEW");
    });

    it("contains HOLD", () => {
      expect(ASSURANCE_DECISIONS).toContain("HOLD");
    });

    it("does not contain prohibited values", () => {
      const prohibited = ["PASS", "FAIL", "OK", "REFUSE", "APPROVED", "REJECTED"];
      for (const p of prohibited) {
        expect(ASSURANCE_DECISIONS).not.toContain(p);
      }
    });
  });

  describe("schema: valid values", () => {
    it("accepts SUPPORTED", () => {
      expect(AssuranceDecisionSchema.safeParse("SUPPORTED").success).toBe(true);
    });

    it("accepts REVIEW", () => {
      expect(AssuranceDecisionSchema.safeParse("REVIEW").success).toBe(true);
    });

    it("accepts HOLD", () => {
      expect(AssuranceDecisionSchema.safeParse("HOLD").success).toBe(true);
    });
  });

  describe("schema: rejection of invalid values", () => {
    for (const invalid of INVALID_DECISIONS) {
      it(`rejects ${JSON.stringify(invalid)}`, () => {
        const result = AssuranceDecisionSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    }
  });

  describe("isAssuranceDecision helper", () => {
    it("returns true for SUPPORTED", () => {
      expect(isAssuranceDecision("SUPPORTED")).toBe(true);
    });

    it("returns true for REVIEW", () => {
      expect(isAssuranceDecision("REVIEW")).toBe(true);
    });

    it("returns true for HOLD", () => {
      expect(isAssuranceDecision("HOLD")).toBe(true);
    });

    it("returns false for unknown string", () => {
      expect(isAssuranceDecision("PASS")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isAssuranceDecision(null)).toBe(false);
    });
  });
});
