/**
 * DRA-ENG-002A — Issue Class Tests
 *
 * Updated at DRA-ENG-002A to add:
 *   - Tests proving DraIssueClassSchema rejects IC-N codes.
 *   - Tests proving IssueClassCodeSchema rejects descriptive names.
 *   - Tests proving the two sets are distinct.
 *   - Tests proving mappings are one-to-one.
 *   - Tests proving DraIssue.issueClass uses the descriptive canonical type.
 */

import { describe, it, expect } from "vitest";
import {
  ISSUE_CLASSES,
  ISSUE_CLASS_CODES,
  ISSUE_CLASS_TO_CODE,
  DraIssueClassSchema,
  isDraIssueClass,
  getIssueClassCode,
  getIssueClassFromCode,
  ISSUE_CLASS_CODE_VALUES,
  IssueClassCodeSchema,
  isIssueClassCode,
} from "../../model/issue-classes.js";
import { DraIssueSchema } from "../../model/issues.js";
import {
  INVALID_ISSUE_CLASSES,
  INVALID_ISSUE_CLASS_CODES,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002A Issue Classes", () => {
  // ---------------------------------------------------------------------------
  // Canonical descriptive literals (DraIssueClass)
  // ---------------------------------------------------------------------------

  describe("canonical constant — exactly nine descriptive literals", () => {
    it("ISSUE_CLASSES has exactly 9 entries", () => {
      expect(ISSUE_CLASSES).toHaveLength(9);
    });

    const EXPECTED_LITERALS = [
      "UNSUPPORTED_CLAIM",
      "AUTHORITY_EXPIRED",
      "AUTHORITY_ABSENT",
      "EVIDENCE_ABSENT",
      "EVIDENCE_INADEQUATE",
      "EVIDENCE_CONFLICT",
      "CLAIM_INCONSISTENCY",
      "TRACEABILITY_BROKEN",
      "SCOPE_VIOLATION",
    ] as const;

    for (const literal of EXPECTED_LITERALS) {
      it(`contains ${literal}`, () => {
        expect(ISSUE_CLASSES).toContain(literal);
      });
    }

    it("UNSUPPORTED_CLAIM is first (IC-1 position)", () => {
      expect(ISSUE_CLASSES[0]).toBe("UNSUPPORTED_CLAIM");
    });

    it("SCOPE_VIOLATION is last (IC-9 position)", () => {
      expect(ISSUE_CLASSES[8]).toBe("SCOPE_VIOLATION");
    });
  });

  // ---------------------------------------------------------------------------
  // IC-N reference codes (IssueClassCode)
  // ---------------------------------------------------------------------------

  describe("IC-N reference codes — exactly nine codes", () => {
    it("ISSUE_CLASS_CODE_VALUES has exactly 9 entries", () => {
      expect(ISSUE_CLASS_CODE_VALUES).toHaveLength(9);
    });

    const EXPECTED_CODES = [
      "IC-1", "IC-2", "IC-3", "IC-4", "IC-5",
      "IC-6", "IC-7", "IC-8", "IC-9",
    ] as const;

    for (const code of EXPECTED_CODES) {
      it(`contains ${code}`, () => {
        expect(ISSUE_CLASS_CODE_VALUES).toContain(code);
      });
    }

    it("IC-1 is first", () => {
      expect(ISSUE_CLASS_CODE_VALUES[0]).toBe("IC-1");
    });

    it("IC-9 is last", () => {
      expect(ISSUE_CLASS_CODE_VALUES[8]).toBe("IC-9");
    });
  });

  // ---------------------------------------------------------------------------
  // Distinctness of the two sets
  // ---------------------------------------------------------------------------

  describe("distinctness — descriptive literals and IC-N codes are mutually exclusive", () => {
    it("no descriptive literal appears in ISSUE_CLASS_CODE_VALUES", () => {
      for (const cls of ISSUE_CLASSES) {
        expect(ISSUE_CLASS_CODE_VALUES).not.toContain(cls);
      }
    });

    it("no IC-N code appears in ISSUE_CLASSES", () => {
      for (const code of ISSUE_CLASS_CODE_VALUES) {
        expect(ISSUE_CLASSES).not.toContain(code);
      }
    });

    it("the two sets have no overlap", () => {
      const descriptiveSet = new Set<string>(ISSUE_CLASSES);
      const codeSet = new Set<string>(ISSUE_CLASS_CODE_VALUES);
      const intersection = [...descriptiveSet].filter((v) => codeSet.has(v));
      expect(intersection).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Code maps and one-to-one mapping
  // ---------------------------------------------------------------------------

  describe("IC-N code maps", () => {
    it("ISSUE_CLASS_CODES maps IC-1 to UNSUPPORTED_CLAIM", () => {
      expect(ISSUE_CLASS_CODES["IC-1"]).toBe("UNSUPPORTED_CLAIM");
    });

    it("ISSUE_CLASS_CODES maps IC-9 to SCOPE_VIOLATION", () => {
      expect(ISSUE_CLASS_CODES["IC-9"]).toBe("SCOPE_VIOLATION");
    });

    it("ISSUE_CLASS_CODES has exactly 9 entries", () => {
      expect(Object.keys(ISSUE_CLASS_CODES)).toHaveLength(9);
    });

    it("ISSUE_CLASS_TO_CODE maps UNSUPPORTED_CLAIM to IC-1", () => {
      expect(ISSUE_CLASS_TO_CODE["UNSUPPORTED_CLAIM"]).toBe("IC-1");
    });

    it("ISSUE_CLASS_TO_CODE maps SCOPE_VIOLATION to IC-9", () => {
      expect(ISSUE_CLASS_TO_CODE["SCOPE_VIOLATION"]).toBe("IC-9");
    });

    it("ISSUE_CLASS_TO_CODE has exactly 9 entries", () => {
      expect(Object.keys(ISSUE_CLASS_TO_CODE)).toHaveLength(9);
    });

    it("mapping is one-to-one: ISSUE_CLASS_CODES round-trips via ISSUE_CLASS_TO_CODE", () => {
      for (const [code, cls] of Object.entries(ISSUE_CLASS_CODES)) {
        expect(ISSUE_CLASS_TO_CODE[cls as keyof typeof ISSUE_CLASS_TO_CODE]).toBe(code);
      }
    });

    it("mapping is one-to-one: ISSUE_CLASS_TO_CODE round-trips via ISSUE_CLASS_CODES", () => {
      for (const [cls, code] of Object.entries(ISSUE_CLASS_TO_CODE)) {
        expect(ISSUE_CLASS_CODES[code]).toBe(cls);
      }
    });

    it("all nine codes map to distinct descriptive literals (injective)", () => {
      const mapped = Object.values(ISSUE_CLASS_CODES);
      expect(new Set(mapped).size).toBe(9);
    });

    it("all nine descriptive literals map to distinct codes (injective)", () => {
      const mapped = Object.values(ISSUE_CLASS_TO_CODE);
      expect(new Set(mapped).size).toBe(9);
    });
  });

  // ---------------------------------------------------------------------------
  // DraIssueClassSchema — accepts descriptive literals, rejects IC-N codes
  // ---------------------------------------------------------------------------

  describe("DraIssueClassSchema: accepts all nine canonical descriptive literals", () => {
    for (const cls of ISSUE_CLASSES) {
      it(`accepts ${cls}`, () => {
        expect(DraIssueClassSchema.safeParse(cls).success).toBe(true);
      });
    }
  });

  describe("DraIssueClassSchema: rejects IC-N codes (they are reference codes, not canonical values)", () => {
    for (const code of ISSUE_CLASS_CODE_VALUES) {
      it(`rejects IC-N code ${code}`, () => {
        const result = DraIssueClassSchema.safeParse(code);
        expect(result.success).toBe(false);
      });
    }
  });

  describe("DraIssueClassSchema: rejects all other invalid values", () => {
    for (const invalid of INVALID_ISSUE_CLASSES) {
      it(`rejects ${JSON.stringify(invalid)}`, () => {
        const result = DraIssueClassSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // IssueClassCodeSchema — accepts IC-N codes, rejects descriptive literals
  // ---------------------------------------------------------------------------

  describe("IssueClassCodeSchema: accepts all nine IC-N reference codes", () => {
    for (const code of ISSUE_CLASS_CODE_VALUES) {
      it(`accepts ${code}`, () => {
        expect(IssueClassCodeSchema.safeParse(code).success).toBe(true);
      });
    }
  });

  describe("IssueClassCodeSchema: rejects descriptive issue-class names (they are canonical runtime values, not codes)", () => {
    for (const cls of ISSUE_CLASSES) {
      it(`rejects descriptive literal ${cls}`, () => {
        const result = IssueClassCodeSchema.safeParse(cls);
        expect(result.success).toBe(false);
      });
    }
  });

  describe("IssueClassCodeSchema: rejects all other invalid values", () => {
    for (const invalid of INVALID_ISSUE_CLASS_CODES) {
      it(`rejects ${JSON.stringify(invalid)}`, () => {
        const result = IssueClassCodeSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // DraIssue.issueClass uses the descriptive canonical type
  // ---------------------------------------------------------------------------

  describe("DraIssue.issueClass uses DraIssueClass (descriptive type)", () => {
    it("DraIssueSchema accepts a descriptive issue class", () => {
      const result = DraIssueSchema.safeParse({
        id: "issue-001",
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        affectedStatementIds: ["stmt-001"],
        affectedEvidenceUnitIds: [],
        explanation: "Test explanation.",
      });
      expect(result.success).toBe(true);
    });

    it("DraIssueSchema rejects an IC-N code in the issueClass field", () => {
      const result = DraIssueSchema.safeParse({
        id: "issue-001",
        issueClass: "IC-1",
        severity: "BLOCKING",
        affectedStatementIds: ["stmt-001"],
        affectedEvidenceUnitIds: [],
        explanation: "Test explanation.",
      });
      expect(result.success).toBe(false);
    });

    it("DraIssueSchema rejects all IC-N codes in the issueClass field", () => {
      for (const code of ISSUE_CLASS_CODE_VALUES) {
        const result = DraIssueSchema.safeParse({
          id: "issue-001",
          issueClass: code,
          severity: "BLOCKING",
          affectedStatementIds: ["stmt-001"],
          affectedEvidenceUnitIds: [],
          explanation: "Test explanation.",
        });
        expect(result.success, `DraIssueSchema should reject IC-N code ${code} in issueClass field`).toBe(false);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  describe("isDraIssueClass helper", () => {
    it("returns true for all nine valid descriptive literals", () => {
      for (const cls of ISSUE_CLASSES) {
        expect(isDraIssueClass(cls)).toBe(true);
      }
    });

    it("returns false for IC-N codes", () => {
      for (const code of ISSUE_CLASS_CODE_VALUES) {
        expect(isDraIssueClass(code)).toBe(false);
      }
    });

    it("returns false for an unknown string", () => {
      expect(isDraIssueClass("FAKE_CLASS")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isDraIssueClass(null)).toBe(false);
    });
  });

  describe("isIssueClassCode helper", () => {
    it("returns true for all nine IC-N codes", () => {
      for (const code of ISSUE_CLASS_CODE_VALUES) {
        expect(isIssueClassCode(code)).toBe(true);
      }
    });

    it("returns false for descriptive literals", () => {
      for (const cls of ISSUE_CLASSES) {
        expect(isIssueClassCode(cls)).toBe(false);
      }
    });

    it("returns false for unknown string", () => {
      expect(isIssueClassCode("IC-10")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isIssueClassCode(null)).toBe(false);
    });
  });

  describe("getIssueClassCode helper", () => {
    it("returns IC-1 for UNSUPPORTED_CLAIM", () => {
      expect(getIssueClassCode("UNSUPPORTED_CLAIM")).toBe("IC-1");
    });

    it("returns IC-9 for SCOPE_VIOLATION", () => {
      expect(getIssueClassCode("SCOPE_VIOLATION")).toBe("IC-9");
    });
  });

  describe("getIssueClassFromCode helper", () => {
    it("returns UNSUPPORTED_CLAIM for IC-1", () => {
      expect(getIssueClassFromCode("IC-1")).toBe("UNSUPPORTED_CLAIM");
    });

    it("returns SCOPE_VIOLATION for IC-9", () => {
      expect(getIssueClassFromCode("IC-9")).toBe("SCOPE_VIOLATION");
    });

    it("returns undefined for an unknown code", () => {
      expect(getIssueClassFromCode("IC-99")).toBeUndefined();
    });

    it("returns undefined for a descriptive literal (not a code)", () => {
      expect(getIssueClassFromCode("UNSUPPORTED_CLAIM")).toBeUndefined();
    });
  });
});
