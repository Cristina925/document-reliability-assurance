/**
 * DRA-VAL-001A — Tests: Reviewer Protocol Schemas
 */

import { describe, it, expect } from "vitest";
import {
  ReviewerEligibilitySchema,
  ReviewerAssignmentRuleSchema,
  ReviewSubmissionPolicySchema,
  AdjudicationPolicySchema,
} from "../reviewer-protocol.js";

// ---------------------------------------------------------------------------
// ReviewerEligibilitySchema
// ---------------------------------------------------------------------------

function validEligibility(overrides: Record<string, unknown> = {}) {
  return {
    minimumReviewersPerDocument: 2,
    domainExpertiseRequired: true,
    conflictOfInterestDeclarationRequired: true,
    blindedToEvaluatorOutput: true,
    prohibitCoordinationBeforeSubmission: true,
    confidentialityRequirementApplies: true,
    minimumExperienceRequirement: "5 years in a relevant regulated domain",
    ...overrides,
  };
}

describe("ReviewerEligibilitySchema", () => {
  it("accepts valid eligibility", () => {
    expect(ReviewerEligibilitySchema.safeParse(validEligibility()).success).toBe(true);
  });

  it("rejects minimumReviewersPerDocument < 2", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ minimumReviewersPerDocument: 1 }),
      ).success,
    ).toBe(false);
  });

  it("rejects blindedToEvaluatorOutput: false", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ blindedToEvaluatorOutput: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects prohibitCoordinationBeforeSubmission: false", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ prohibitCoordinationBeforeSubmission: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects conflictOfInterestDeclarationRequired: false", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ conflictOfInterestDeclarationRequired: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty minimumExperienceRequirement", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ minimumExperienceRequirement: "" }),
      ).success,
    ).toBe(false);
  });

  it("accepts minimumReviewersPerDocument of 3 or more", () => {
    expect(
      ReviewerEligibilitySchema.safeParse(
        validEligibility({ minimumReviewersPerDocument: 3 }),
      ).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ReviewerAssignmentRuleSchema
// ---------------------------------------------------------------------------

function validAssignmentRule(overrides: Record<string, unknown> = {}) {
  return {
    assignmentMethod: "DOMAIN_MATCHED",
    allowSingleReviewer: false,
    allowReviewerAsAdjudicator: false,
    maxDocumentsPerReviewer: 10,
    ...overrides,
  };
}

describe("ReviewerAssignmentRuleSchema", () => {
  it("accepts a valid assignment rule", () => {
    expect(ReviewerAssignmentRuleSchema.safeParse(validAssignmentRule()).success).toBe(true);
  });

  it("accepts RANDOM and STRATIFIED assignment methods", () => {
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ assignmentMethod: "RANDOM" }),
      ).success,
    ).toBe(true);
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ assignmentMethod: "STRATIFIED" }),
      ).success,
    ).toBe(true);
  });

  it("rejects allowSingleReviewer: true", () => {
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ allowSingleReviewer: true }),
      ).success,
    ).toBe(false);
  });

  it("rejects allowReviewerAsAdjudicator: true", () => {
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ allowReviewerAsAdjudicator: true }),
      ).success,
    ).toBe(false);
  });

  it("rejects unknown assignment method", () => {
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ assignmentMethod: "ALPHABETICAL" }),
      ).success,
    ).toBe(false);
  });

  it("rejects maxDocumentsPerReviewer < 1", () => {
    expect(
      ReviewerAssignmentRuleSchema.safeParse(
        validAssignmentRule({ maxDocumentsPerReviewer: 0 }),
      ).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ReviewSubmissionPolicySchema
// ---------------------------------------------------------------------------

function validSubmissionPolicy(overrides: Record<string, unknown> = {}) {
  return {
    requireIndependentIssueRecording: true,
    requireSeverityRecording: true,
    requireIssueClassMapping: true,
    requireReleaseRecommendation: true,
    requireUncertaintyRecording: true,
    submissionDeadlineDays: 14,
    ...overrides,
  };
}

describe("ReviewSubmissionPolicySchema", () => {
  it("accepts a valid submission policy", () => {
    expect(ReviewSubmissionPolicySchema.safeParse(validSubmissionPolicy()).success).toBe(true);
  });

  it("rejects requireIndependentIssueRecording: false", () => {
    expect(
      ReviewSubmissionPolicySchema.safeParse(
        validSubmissionPolicy({ requireIndependentIssueRecording: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects requireReleaseRecommendation: false", () => {
    expect(
      ReviewSubmissionPolicySchema.safeParse(
        validSubmissionPolicy({ requireReleaseRecommendation: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects submissionDeadlineDays < 1", () => {
    expect(
      ReviewSubmissionPolicySchema.safeParse(
        validSubmissionPolicy({ submissionDeadlineDays: 0 }),
      ).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AdjudicationPolicySchema
// ---------------------------------------------------------------------------

function validAdjudicationPolicy(overrides: Record<string, unknown> = {}) {
  return {
    triggerOnMaterialDisagreement: true,
    materialDisagreementDefinition:
      "Reviewers differ on the release recommendation (SUPPORTED vs HOLD, or SUPPORTED vs REVIEW) or identify non-overlapping issue classes.",
    adjudicatorMustBeIndependent: true,
    adjudicatorCannotBeOriginalReviewer: true,
    minimumAdjudicatorCount: 1,
    referenceStandardTerm: "adjudicated human reference standard",
    ...overrides,
  };
}

describe("AdjudicationPolicySchema", () => {
  it("accepts a valid adjudication policy", () => {
    expect(AdjudicationPolicySchema.safeParse(validAdjudicationPolicy()).success).toBe(true);
  });

  it("rejects triggerOnMaterialDisagreement: false", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ triggerOnMaterialDisagreement: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects adjudicatorMustBeIndependent: false", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ adjudicatorMustBeIndependent: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects adjudicatorCannotBeOriginalReviewer: false", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ adjudicatorCannotBeOriginalReviewer: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects referenceStandardTerm other than the required value", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ referenceStandardTerm: "ground truth" }),
      ).success,
    ).toBe(false);
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ referenceStandardTerm: "reviewer consensus" }),
      ).success,
    ).toBe(false);
  });

  it("rejects minimumAdjudicatorCount < 1", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ minimumAdjudicatorCount: 0 }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty materialDisagreementDefinition", () => {
    expect(
      AdjudicationPolicySchema.safeParse(
        validAdjudicationPolicy({ materialDisagreementDefinition: "short" }),
      ).success,
    ).toBe(false);
  });
});
