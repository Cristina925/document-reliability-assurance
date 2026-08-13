/**
 * DRA-ENG-002 — Assurance Issue Tests
 */

import { describe, it, expect } from "vitest";
import {
  ISSUE_SEVERITIES,
  IssueSeveritySchema,
  DraIssueSchema,
  IssueSummarySchema,
  summariseIssues,
  validateDraIssue,
} from "../../model/issues.js";
import { ISSUE_CLASSES } from "../../model/issue-classes.js";
import {
  ALL_VALID_ISSUES,
  VALID_ISSUE_UNSUPPORTED_CLAIM,
  VALID_ISSUE_AUTHORITY_EXPIRED,
  VALID_ISSUE_AUTHORITY_ABSENT,
  VALID_ISSUE_EVIDENCE_ABSENT,
  VALID_ISSUE_EVIDENCE_INADEQUATE,
  VALID_ISSUE_EVIDENCE_CONFLICT,
  VALID_ISSUE_CLAIM_INCONSISTENCY,
  VALID_ISSUE_TRACEABILITY_BROKEN,
  VALID_ISSUE_SCOPE_VIOLATION,
} from "../../fixtures/model/valid.js";
import {
  INVALID_ISSUE_UNKNOWN_CLASS,
  INVALID_ISSUE_EMPTY_STATEMENTS,
  INVALID_ISSUE_EMPTY_EXPLANATION,
  INVALID_ISSUE_UNKNOWN_SEVERITY,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Assurance Issues", () => {
  describe("ISSUE_SEVERITIES constant", () => {
    it("contains exactly 2 severities", () => {
      expect(ISSUE_SEVERITIES).toHaveLength(2);
    });

    it("contains BLOCKING", () => {
      expect(ISSUE_SEVERITIES).toContain("BLOCKING");
    });

    it("contains ADVISORY", () => {
      expect(ISSUE_SEVERITIES).toContain("ADVISORY");
    });
  });

  describe("IssueSeveritySchema", () => {
    it("accepts BLOCKING", () => {
      expect(IssueSeveritySchema.safeParse("BLOCKING").success).toBe(true);
    });

    it("accepts ADVISORY", () => {
      expect(IssueSeveritySchema.safeParse("ADVISORY").success).toBe(true);
    });

    it("rejects CRITICAL", () => {
      expect(IssueSeveritySchema.safeParse("CRITICAL").success).toBe(false);
    });

    it("rejects empty string", () => {
      expect(IssueSeveritySchema.safeParse("").success).toBe(false);
    });
  });

  describe("valid issue fixtures — all nine issue classes", () => {
    const ALL_NINE = [
      { fixture: VALID_ISSUE_UNSUPPORTED_CLAIM, cls: "UNSUPPORTED_CLAIM" },
      { fixture: VALID_ISSUE_AUTHORITY_EXPIRED, cls: "AUTHORITY_EXPIRED" },
      { fixture: VALID_ISSUE_AUTHORITY_ABSENT, cls: "AUTHORITY_ABSENT" },
      { fixture: VALID_ISSUE_EVIDENCE_ABSENT, cls: "EVIDENCE_ABSENT" },
      { fixture: VALID_ISSUE_EVIDENCE_INADEQUATE, cls: "EVIDENCE_INADEQUATE" },
      { fixture: VALID_ISSUE_EVIDENCE_CONFLICT, cls: "EVIDENCE_CONFLICT" },
      { fixture: VALID_ISSUE_CLAIM_INCONSISTENCY, cls: "CLAIM_INCONSISTENCY" },
      { fixture: VALID_ISSUE_TRACEABILITY_BROKEN, cls: "TRACEABILITY_BROKEN" },
      { fixture: VALID_ISSUE_SCOPE_VIOLATION, cls: "SCOPE_VIOLATION" },
    ];

    for (const { fixture, cls } of ALL_NINE) {
      it(`validates issue with class ${cls}`, () => {
        const result = validateDraIssue(fixture);
        expect(result.success).toBe(true);
      });

      it(`${cls} issue has correct issueClass field`, () => {
        const result = DraIssueSchema.safeParse(fixture);
        expect(result.success && result.data.issueClass).toBe(cls);
      });
    }

    it("ALL_VALID_ISSUES covers all nine issue classes", () => {
      const classes = ALL_VALID_ISSUES.map((i) => i.issueClass);
      for (const cls of ISSUE_CLASSES) {
        expect(classes).toContain(cls);
      }
    });

    it("ALL_VALID_ISSUES has exactly 9 entries", () => {
      expect(ALL_VALID_ISSUES).toHaveLength(9);
    });
  });

  describe("DraIssue — invalid fixtures", () => {
    it("rejects unknown issue class", () => {
      expect(validateDraIssue(INVALID_ISSUE_UNKNOWN_CLASS).success).toBe(false);
    });

    it("rejects empty affectedStatementIds array", () => {
      expect(validateDraIssue(INVALID_ISSUE_EMPTY_STATEMENTS).success).toBe(false);
    });

    it("rejects empty explanation", () => {
      expect(validateDraIssue(INVALID_ISSUE_EMPTY_EXPLANATION).success).toBe(false);
    });

    it("rejects unknown severity", () => {
      expect(validateDraIssue(INVALID_ISSUE_UNKNOWN_SEVERITY).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateDraIssue(null).success).toBe(false);
    });

    it("rejects missing id", () => {
      expect(
        validateDraIssue({
          issueClass: "UNSUPPORTED_CLAIM",
          severity: "BLOCKING",
          affectedStatementIds: ["stmt-001"],
          affectedEvidenceUnitIds: [],
          explanation: "Test",
        }).success,
      ).toBe(false);
    });
  });

  describe("DraIssue — optional fields", () => {
    it("stageAssociation is optional", () => {
      const issue = {
        id: "issue-001",
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        affectedStatementIds: ["stmt-001"],
        affectedEvidenceUnitIds: [],
        explanation: "Some explanation",
      };
      const result = DraIssueSchema.safeParse(issue);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stageAssociation).toBeUndefined();
      }
    });

    it("affectedEvidenceUnitIds defaults to empty array", () => {
      const issue = {
        id: "issue-001",
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        affectedStatementIds: ["stmt-001"],
        explanation: "Some explanation",
      };
      const result = DraIssueSchema.safeParse(issue);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.affectedEvidenceUnitIds).toStrictEqual([]);
      }
    });
  });

  describe("summariseIssues helper", () => {
    it("returns zero counts for empty array", () => {
      const summary = summariseIssues([]);
      expect(summary).toStrictEqual({ total: 0, blocking: 0, advisory: 0 });
    });

    it("counts blocking issues correctly", () => {
      const issues = [
        VALID_ISSUE_UNSUPPORTED_CLAIM, // BLOCKING
        VALID_ISSUE_AUTHORITY_EXPIRED, // BLOCKING
        VALID_ISSUE_EVIDENCE_INADEQUATE, // ADVISORY
      ];
      const summary = summariseIssues(issues);
      expect(summary.total).toBe(3);
      expect(summary.blocking).toBe(2);
      expect(summary.advisory).toBe(1);
    });

    it("IssueSummarySchema validates a correct summary", () => {
      const result = IssueSummarySchema.safeParse({ total: 2, blocking: 1, advisory: 1 });
      expect(result.success).toBe(true);
    });
  });
});
