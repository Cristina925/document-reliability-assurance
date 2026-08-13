/**
 * DRA-VAL-001A — Tests: Comparison Rules
 */

import { describe, it, expect } from "vitest";
import { IssueMatchingRuleSchema, ComparisonProtocolSchema } from "../comparison-rules.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validRule(overrides: Record<string, unknown> = {}) {
  return {
    id: "MR-001",
    description:
      "Two findings are AGREED when the evaluator and at least one reviewer identify the same IC-N class at the same document.",
    level: "CLASS",
    disposition: "AGREED",
    conditions:
      "The evaluator issue class matches a reviewer issue class at the document level.",
    ...overrides,
  };
}

const INSTANCE_RULE = {
  id: "MR-002",
  description:
    "At the instance level, two findings match when they reference the same document section and the same issue type.",
  level: "INSTANCE",
  disposition: "AGREED",
  conditions:
    "Evaluator finding and reviewer finding cite the same clause or section with the same IC-N class within the same document.",
};

const EVALUATOR_ONLY_RULE = {
  id: "MR-003",
  description:
    "An EVALUATOR_ONLY finding is recorded when the evaluator identifies an issue class not present in any reviewer submission for that document.",
  level: "CLASS",
  disposition: "EVALUATOR_ONLY",
  conditions:
    "The evaluator issue class is absent from all reviewer submissions for the document under review.",
};

const REVIEWER_ONLY_RULE = {
  id: "MR-004",
  description:
    "A REVIEWER_ONLY finding is recorded when at least one reviewer identifies an issue class not flagged by the evaluator for that document.",
  level: "CLASS",
  disposition: "REVIEWER_ONLY",
  conditions:
    "The reviewer issue class is absent from the evaluator output for the document under review.",
};

function validProtocol(overrides: Record<string, unknown> = {}) {
  return {
    version: "1.0",
    frozenBeforeResultsInspected: true,
    rules: [validRule(), INSTANCE_RULE, EVALUATOR_ONLY_RULE, REVIEWER_ONLY_RULE],
    borderlineMatchProcedure:
      "Borderline cases are referred to the adjudicator for classification using the adjudicated human reference standard.",
    multipleIssueFromOneDefectTreatment:
      "Multiple issues arising from one underlying defect are counted separately at the instance level and as one class at the class level.",
    oneEvaluatorFindingCoversMultipleReviewerFindingsTreatment:
      "One evaluator finding that covers multiple reviewer findings is counted as one agreed finding at the class level.",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// IssueMatchingRuleSchema
// ---------------------------------------------------------------------------

describe("IssueMatchingRuleSchema", () => {
  it("accepts a valid CLASS-level rule", () => {
    expect(IssueMatchingRuleSchema.safeParse(validRule()).success).toBe(true);
  });

  it("accepts a valid INSTANCE-level rule", () => {
    expect(IssueMatchingRuleSchema.safeParse(INSTANCE_RULE).success).toBe(true);
  });

  it("rejects invalid identifier", () => {
    expect(IssueMatchingRuleSchema.safeParse(validRule({ id: "MR-01" })).success).toBe(false);
    expect(IssueMatchingRuleSchema.safeParse(validRule({ id: "mr-001" })).success).toBe(false);
  });

  it("rejects empty description", () => {
    expect(IssueMatchingRuleSchema.safeParse(validRule({ description: "" })).success).toBe(false);
  });

  it("rejects unknown level", () => {
    expect(IssueMatchingRuleSchema.safeParse(validRule({ level: "SENTENCE" })).success).toBe(false);
  });

  it("rejects unknown disposition", () => {
    expect(
      IssueMatchingRuleSchema.safeParse(validRule({ disposition: "UNKNOWN" })).success,
    ).toBe(false);
  });

  it("rejects empty conditions", () => {
    expect(IssueMatchingRuleSchema.safeParse(validRule({ conditions: "" })).success).toBe(false);
  });

  it("accepts optional example", () => {
    expect(
      IssueMatchingRuleSchema.safeParse(validRule({ example: "Evaluator flags IC-1; reviewer also flags IC-1." }))
        .success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ComparisonProtocolSchema
// ---------------------------------------------------------------------------

describe("ComparisonProtocolSchema", () => {
  it("accepts a valid comparison protocol", () => {
    expect(ComparisonProtocolSchema.safeParse(validProtocol()).success).toBe(true);
  });

  it("rejects protocol with no INSTANCE-level rule", () => {
    const rules = [validRule(), EVALUATOR_ONLY_RULE, REVIEWER_ONLY_RULE]; // all CLASS
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects protocol with no CLASS-level rule", () => {
    const rules = [{ ...INSTANCE_RULE, id: "MR-001" }, { ...INSTANCE_RULE, disposition: "EVALUATOR_ONLY", id: "MR-002" }, { ...INSTANCE_RULE, disposition: "REVIEWER_ONLY", id: "MR-003" }];
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects protocol missing AGREED rule", () => {
    const rules = [INSTANCE_RULE, EVALUATOR_ONLY_RULE, REVIEWER_ONLY_RULE].map((r, i) => ({
      ...r,
      id: `MR-00${i + 1}`,
      disposition: i === 0 ? "PARTIAL_MATCH" : r.disposition,
    }));
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects protocol missing EVALUATOR_ONLY rule", () => {
    const rules = [validRule(), INSTANCE_RULE, REVIEWER_ONLY_RULE];
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects protocol missing REVIEWER_ONLY rule", () => {
    const rules = [validRule(), INSTANCE_RULE, EVALUATOR_ONLY_RULE];
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects duplicate rule IDs", () => {
    const rules = [
      validRule({ id: "MR-001" }),
      validRule({ id: "MR-001" }), // duplicate
      INSTANCE_RULE,
      EVALUATOR_ONLY_RULE,
      REVIEWER_ONLY_RULE,
    ];
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules })).success,
    ).toBe(false);
  });

  it("rejects fewer than two rules", () => {
    expect(
      ComparisonProtocolSchema.safeParse(validProtocol({ rules: [validRule()] })).success,
    ).toBe(false);
  });

  it("rejects empty borderlineMatchProcedure", () => {
    expect(
      ComparisonProtocolSchema.safeParse(
        validProtocol({ borderlineMatchProcedure: "short" }),
      ).success,
    ).toBe(false);
  });
});
