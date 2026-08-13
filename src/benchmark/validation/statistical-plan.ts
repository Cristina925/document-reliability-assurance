/**
 * DRA-VAL-001A — Scientific Validation Protocol — Statistical Analysis Plan
 *
 * Defines the pre-registered statistical metrics, analysis strata, and
 * uncertainty-reporting requirements.
 *
 * All metrics, strata, and interpretation rules are frozen before
 * evaluator results are examined. Post-result metric additions are
 * prohibited without a recorded protocol amendment.
 *
 * Invariants:
 *   - Every metric must specify zeroDenominatorPolicy (non-empty)
 *   - Every metric must require confidence intervals
 *   - At least one metric at each of INSTANCE and CLASS granularity
 *   - At least one reviewer reliability metric
 *   - Metric IDs must be unique
 */

import { z } from "zod";
import { MetricIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Metric granularity
// ---------------------------------------------------------------------------

export const METRIC_GRANULARITIES = [
  "INSTANCE",       // Issue-instance level
  "CLASS",          // Issue-class level
  "DOCUMENT",       // Document-level (decisions, recommendations)
  "REVIEWER",       // Reviewer reliability
  "CORPUS",         // Corpus-wide aggregate
] as const;

export type MetricGranularity = (typeof METRIC_GRANULARITIES)[number];

export const MetricGranularitySchema = z.enum(
  METRIC_GRANULARITIES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Statistical metric definition
// ---------------------------------------------------------------------------

/**
 * A single pre-registered statistical metric.
 *
 * Every metric must specify:
 *   - The numerator and denominator
 *   - Zero-denominator handling
 *   - Confidence-interval requirement
 *
 * No metric may prescribe an arbitrary success threshold as evidence of
 * commercial or production readiness.
 */
export const StatisticalMetricDefinitionSchema = z.object({
  /** Unique identifier. Format: MTR-NNN. */
  id: MetricIdSchema,

  /** Human-readable name. */
  name: z.string().min(3, "Metric name must not be empty"),

  /**
   * Operational definition of the metric.
   * Must be precise enough to compute without ambiguity.
   */
  definition: z
    .string()
    .min(20, "Metric definition must be at least 20 characters"),

  /**
   * Description of the numerator.
   * Must be non-empty and unambiguous.
   */
  numerator: z
    .string()
    .min(5, "Metric numerator must be described"),

  /**
   * Description of the denominator.
   * Must be non-empty and unambiguous.
   */
  denominator: z
    .string()
    .min(5, "Metric denominator must be described"),

  /**
   * Policy for handling zero-denominator cases.
   * Must be non-empty. Examples: "report as undefined", "report as N/A with
   * note", "exclude from analysis with justification".
   *
   * A metric without a zero-denominator policy cannot be computed safely.
   */
  zeroDenominatorPolicy: z
    .string()
    .min(10, "zeroDenominatorPolicy must describe how to handle zero denominators"),

  /**
   * Whether 95% confidence intervals are required alongside point estimates.
   * Must be true — no interpretation may be based only on point estimates.
   */
  confidenceIntervalRequired: z.literal(true, {
    errorMap: () => ({
      message:
        "confidenceIntervalRequired must be true; no metric result may be interpreted without a confidence interval",
    }),
  }),

  /**
   * Confidence level for the interval (typically 95.0).
   * Must be in (0, 100).
   */
  confidenceLevel: z
    .number()
    .gt(0)
    .lt(100)
    .default(95.0),

  /**
   * Granularity at which this metric is computed.
   */
  granularity: MetricGranularitySchema,

  /**
   * Analysis strata over which this metric is disaggregated.
   * Must be populated for metrics that support stratified analysis.
   */
  analysisStrata: z
    .array(z.string().min(1))
    .default([]),

  /**
   * Descriptive interpretation bands for this metric.
   * Each band defines a range and a qualitative interpretation.
   * Bands must not equate numerical thresholds with commercial readiness.
   */
  interpretationBands: z
    .array(
      z.object({
        lowerBound: z.number().min(0),
        upperBound: z.number().max(1),
        label: z.string().min(1),
        interpretation: z.string().min(10),
      }),
    )
    .default([]),
});

export type StatisticalMetricDefinition = z.infer<
  typeof StatisticalMetricDefinitionSchema
>;

// ---------------------------------------------------------------------------
// Stratified analysis specification
// ---------------------------------------------------------------------------

export const STANDARD_STRATA = [
  "domain",
  "sourceType",
  "difficulty",
  "documentLength",
  "issueClass",
  "reviewerExpertise",
  "cleanVersusIssueBearing",
] as const;

export type StandardStratum = (typeof STANDARD_STRATA)[number];

// ---------------------------------------------------------------------------
// Statistical analysis plan
// ---------------------------------------------------------------------------

/**
 * The full pre-registered statistical analysis plan.
 *
 * Invariants enforced:
 *   - At least one INSTANCE-granularity primary metric
 *   - At least one CLASS-granularity primary metric
 *   - At least one REVIEWER-granularity reliability metric
 *   - All metric IDs unique
 *   - missingDataPolicy non-empty
 *   - interpretationApproach explicitly prohibits significance claims without adequate N
 */
export const StatisticalAnalysisPlanSchema = z
  .object({
    /** Version label for this plan. */
    version: z.string().min(1),

    /** Primary evaluation metrics (evaluator performance). */
    primaryMetrics: z
      .array(StatisticalMetricDefinitionSchema)
      .min(1, "At least one primary metric is required"),

    /** Reviewer reliability metrics (inter-rater reliability). */
    reviewerReliabilityMetrics: z
      .array(StatisticalMetricDefinitionSchema)
      .min(1, "At least one reviewer reliability metric is required"),

    /** All analysis strata to be reported. */
    reportedStrata: z
      .array(z.string().min(1))
      .min(1, "At least one analysis stratum must be specified"),

    /**
     * Policy for missing reviews, excluded documents, and withdrawn documents.
     * Must be non-empty and describe handling for each scenario.
     */
    missingDataPolicy: z
      .string()
      .min(20, "missingDataPolicy must describe handling for all missing-data scenarios"),

    /**
     * Policy for protocol deviations and their effect on analysis.
     */
    protocolDeviationPolicy: z
      .string()
      .min(20, "protocolDeviationPolicy must be specified"),

    /**
     * Explicit statement of interpretation approach.
     * Must acknowledge that confidence intervals, corpus composition, and
     * reviewer reliability are all required for any conclusion.
     * Must prohibit significance claims based on inadequate sample sizes.
     */
    interpretationApproach: z
      .string()
      .min(30, "interpretationApproach must be explicitly stated"),

    /**
     * Explicit statement that no arbitrary success threshold is used as
     * proof of commercial readiness.
     */
    noArbitrarySuccessThreshold: z.literal(true, {
      errorMap: () => ({
        message:
          "noArbitrarySuccessThreshold must be true; the plan must not prescribe arbitrary thresholds as proof of production readiness",
      }),
    }),
  })
  .refine(
    (plan) =>
      plan.primaryMetrics.some((m) => m.granularity === "INSTANCE"),
    {
      message:
        "StatisticalAnalysisPlan must include at least one INSTANCE-granularity primary metric",
      path: ["primaryMetrics"],
    },
  )
  .refine(
    (plan) =>
      plan.primaryMetrics.some((m) => m.granularity === "CLASS"),
    {
      message:
        "StatisticalAnalysisPlan must include at least one CLASS-granularity primary metric",
      path: ["primaryMetrics"],
    },
  )
  .refine(
    (plan) => {
      const allMetrics = [
        ...plan.primaryMetrics,
        ...plan.reviewerReliabilityMetrics,
      ];
      const ids = allMetrics.map((m) => m.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: "All metric IDs must be unique across primary and reviewer-reliability metrics",
      path: ["primaryMetrics"],
    },
  );

export type StatisticalAnalysisPlan = z.infer<typeof StatisticalAnalysisPlanSchema>;
