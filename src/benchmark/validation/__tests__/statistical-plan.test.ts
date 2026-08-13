/**
 * DRA-VAL-001A — Tests: Statistical Analysis Plan
 */

import { describe, it, expect } from "vitest";
import {
  StatisticalMetricDefinitionSchema,
  StatisticalAnalysisPlanSchema,
} from "../statistical-plan.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validMetric(overrides: Record<string, unknown> = {}) {
  return {
    id: "MTR-001",
    name: "Issue-instance recall",
    definition:
      "The proportion of issue instances identified by the adjudicated human reference standard that are also identified by the evaluator.",
    numerator: "Number of agreed issue instances (evaluator ∩ reference standard)",
    denominator: "Total issue instances in the adjudicated human reference standard",
    zeroDenominatorPolicy:
      "Report as undefined (N/A) with a note that no reference issues were identified for this document.",
    confidenceIntervalRequired: true as const,
    granularity: "INSTANCE",
    ...overrides,
  };
}

function validClassMetric(overrides: Record<string, unknown> = {}) {
  return {
    id: "MTR-002",
    name: "Issue-class precision",
    definition:
      "The proportion of issue classes flagged by the evaluator that are also present in the adjudicated human reference standard at the document level.",
    numerator: "Number of agreed issue classes (evaluator ∩ reference standard) at document level",
    denominator: "Total issue classes flagged by the evaluator",
    zeroDenominatorPolicy:
      "Report as undefined (N/A) with a note that the evaluator identified no issues.",
    confidenceIntervalRequired: true as const,
    granularity: "CLASS",
    ...overrides,
  };
}

function validReviewerMetric(overrides: Record<string, unknown> = {}) {
  return {
    id: "MTR-003",
    name: "Reviewer decision agreement rate",
    definition:
      "The proportion of document pairs where both reviewers reach the same release recommendation.",
    numerator: "Document pairs where both reviewers agree on release recommendation",
    denominator: "Total document pairs with complete reviewer submissions",
    zeroDenominatorPolicy:
      "Report as undefined if no complete reviewer pairs exist.",
    confidenceIntervalRequired: true as const,
    granularity: "REVIEWER",
    ...overrides,
  };
}

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    version: "1.0",
    primaryMetrics: [validMetric(), validClassMetric()],
    reviewerReliabilityMetrics: [validReviewerMetric()],
    reportedStrata: ["domain", "sourceType", "difficulty"],
    missingDataPolicy:
      "Documents with fewer than two reviewer submissions are excluded from the primary analysis with justification. Withdrawn documents are noted and their exclusion is recorded.",
    protocolDeviationPolicy:
      "Protocol deviations are documented as they occur. Deviations affecting comparability are classified as major and reported in the analysis.",
    interpretationApproach:
      "All metric results are reported with 95% confidence intervals. Point estimates are not interpreted without reference to interval width and sample composition. No significance claims are made where sample sizes are inadequate.",
    noArbitrarySuccessThreshold: true as const,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// StatisticalMetricDefinitionSchema
// ---------------------------------------------------------------------------

describe("StatisticalMetricDefinitionSchema", () => {
  it("accepts a valid metric", () => {
    expect(StatisticalMetricDefinitionSchema.safeParse(validMetric()).success).toBe(true);
  });

  it("rejects invalid metric ID", () => {
    expect(
      StatisticalMetricDefinitionSchema.safeParse(validMetric({ id: "MTR-01" })).success,
    ).toBe(false);
    expect(
      StatisticalMetricDefinitionSchema.safeParse(validMetric({ id: "mtr-001" })).success,
    ).toBe(false);
  });

  it("rejects empty zeroDenominatorPolicy", () => {
    expect(
      StatisticalMetricDefinitionSchema.safeParse(
        validMetric({ zeroDenominatorPolicy: "" }),
      ).success,
    ).toBe(false);
  });

  it("rejects zeroDenominatorPolicy that is too short", () => {
    expect(
      StatisticalMetricDefinitionSchema.safeParse(
        validMetric({ zeroDenominatorPolicy: "N/A" }),
      ).success,
    ).toBe(false);
  });

  it("rejects confidenceIntervalRequired: false", () => {
    expect(
      StatisticalMetricDefinitionSchema.safeParse(
        validMetric({ confidenceIntervalRequired: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects unknown granularity", () => {
    expect(
      StatisticalMetricDefinitionSchema.safeParse(
        validMetric({ granularity: "SENTENCE" }),
      ).success,
    ).toBe(false);
  });

  it("accepts all valid granularities", () => {
    for (const granularity of ["INSTANCE", "CLASS", "DOCUMENT", "REVIEWER", "CORPUS"]) {
      expect(
        StatisticalMetricDefinitionSchema.safeParse(
          validMetric({ granularity }),
        ).success,
      ).toBe(true);
    }
  });

  it("accepts optional interpretation bands", () => {
    const result = StatisticalMetricDefinitionSchema.safeParse(
      validMetric({
        interpretationBands: [
          { lowerBound: 0, upperBound: 0.5, label: "Low", interpretation: "Evaluator detects fewer than half the reference issues." },
          { lowerBound: 0.5, upperBound: 1.0, label: "High", interpretation: "Evaluator detects more than half the reference issues." },
        ],
      }),
    );
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// StatisticalAnalysisPlanSchema
// ---------------------------------------------------------------------------

describe("StatisticalAnalysisPlanSchema", () => {
  it("accepts a valid plan", () => {
    expect(StatisticalAnalysisPlanSchema.safeParse(validPlan()).success).toBe(true);
  });

  it("rejects plan with no INSTANCE-granularity primary metric", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({ primaryMetrics: [validClassMetric()] }),
      ).success,
    ).toBe(false);
  });

  it("rejects plan with no CLASS-granularity primary metric", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({ primaryMetrics: [validMetric()] }),
      ).success,
    ).toBe(false);
  });

  it("rejects plan with no reviewer reliability metrics", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({ reviewerReliabilityMetrics: [] }),
      ).success,
    ).toBe(false);
  });

  it("rejects duplicate metric IDs across primary and reviewer metrics", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({
          primaryMetrics: [validMetric({ id: "MTR-001" }), validClassMetric({ id: "MTR-002" })],
          reviewerReliabilityMetrics: [validReviewerMetric({ id: "MTR-001" })], // duplicate
        }),
      ).success,
    ).toBe(false);
  });

  it("rejects noArbitrarySuccessThreshold: false", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({ noArbitrarySuccessThreshold: false }),
      ).success,
    ).toBe(false);
  });

  it("rejects empty reportedStrata", () => {
    expect(
      StatisticalAnalysisPlanSchema.safeParse(
        validPlan({ reportedStrata: [] }),
      ).success,
    ).toBe(false);
  });

  it("rejects missing confidence-interval requirement on any metric", () => {
    const metricWithoutCI = { ...validMetric({ id: "MTR-099" }), confidenceIntervalRequired: false };
    // This is caught at the metric level
    expect(
      StatisticalMetricDefinitionSchema.safeParse(metricWithoutCI).success,
    ).toBe(false);
  });
});
