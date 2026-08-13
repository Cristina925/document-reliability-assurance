/**
 * DRA-VAL-001A — Scientific Validation Protocol — Issue Matching and Comparison Rules
 *
 * Defines the pre-registered rules that govern how evaluator findings and
 * reviewer findings are compared during the benchmark analysis.
 *
 * Rules must be frozen before evaluator results are unsealed.
 * Post-result changes to matching criteria are prohibited without a
 * recorded and justified protocol amendment.
 *
 * Two analysis levels are defined:
 *   - INSTANCE: individual issue instances are matched one-to-one
 *   - CLASS: issue classes are compared at the document level
 *
 * Both analyses are required.
 */

import { z } from "zod";
import { MatchingRuleIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Analysis level
// ---------------------------------------------------------------------------

export const ANALYSIS_LEVELS = ["INSTANCE", "CLASS"] as const;
export type AnalysisLevel = (typeof ANALYSIS_LEVELS)[number];

export const AnalysisLevelSchema = z.enum(
  ANALYSIS_LEVELS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Analysis level must be one of: ${ANALYSIS_LEVELS.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Match disposition
// ---------------------------------------------------------------------------

/**
 * How a matched or unmatched finding is classified in the comparison.
 */
export const MATCH_DISPOSITIONS = [
  "AGREED",              // Both evaluator and reviewer identify the same issue
  "EVALUATOR_ONLY",      // Evaluator identifies; no reviewer counterpart — potential false positive
  "REVIEWER_ONLY",       // Reviewer identifies; no evaluator counterpart — potential false negative
  "PARTIAL_MATCH",       // Partially overlapping findings — scored separately from full matches
  "INDETERMINATE",       // Cannot be classified under current rules
  "EXCLUDED",            // Excluded from analysis per exclusion criterion
] as const;

export type MatchDisposition = (typeof MATCH_DISPOSITIONS)[number];

export const MatchDispositionSchema = z.enum(
  MATCH_DISPOSITIONS as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Issue matching rule
// ---------------------------------------------------------------------------

/**
 * A single pre-registered rule governing issue comparison.
 *
 * Matching rules are frozen before results are unsealed.
 * They may not be modified retrospectively unless a protocol amendment
 * is filed — and amendments that change matching rules after result
 * inspection are explicitly prohibited.
 */
export const IssueMatchingRuleSchema = z.object({
  /** Unique identifier. Format: MR-NNN. */
  id: MatchingRuleIdSchema,

  /**
   * Human-readable description of this rule.
   * Must be specific and operationally testable.
   */
  description: z
    .string()
    .min(20, "IssueMatchingRule description must be at least 20 characters"),

  /**
   * Whether this rule applies at issue-instance or issue-class level.
   */
  level: AnalysisLevelSchema,

  /**
   * Which match disposition this rule produces when its conditions are met.
   */
  disposition: MatchDispositionSchema,

  /**
   * Conditions under which this rule applies (free text).
   * Must describe both the matching condition and its boundaries.
   */
  conditions: z
    .string()
    .min(20, "Rule conditions must describe when the rule applies"),

  /**
   * Illustrative example of the rule applied (optional).
   */
  example: z.string().min(5).optional(),
});

export type IssueMatchingRule = z.infer<typeof IssueMatchingRuleSchema>;

// ---------------------------------------------------------------------------
// Comparison protocol
// ---------------------------------------------------------------------------

/**
 * The full collection of pre-registered matching rules.
 *
 * Invariants:
 *   - Must include at least one INSTANCE-level rule
 *   - Must include at least one CLASS-level rule
 *   - Must include rules covering AGREED, EVALUATOR_ONLY, and REVIEWER_ONLY
 *   - Rule IDs must be unique
 */
export const ComparisonProtocolSchema = z
  .object({
    /** Version label for this matching protocol. Free text. */
    version: z.string().min(1, "Comparison protocol version must not be empty"),

    /**
     * Whether the matching rules were frozen before evaluator results were
     * inspected. Must be true at freeze time.
     */
    frozenBeforeResultsInspected: z.boolean(),

    /** All registered matching rules. */
    rules: z
      .array(IssueMatchingRuleSchema)
      .min(2, "At least two matching rules are required"),

    /**
     * The procedure for resolving borderline matches.
     * Applied when no rule produces a definitive classification.
     */
    borderlineMatchProcedure: z
      .string()
      .min(20, "borderlineMatchProcedure must describe how borderline cases are resolved"),

    /**
     * Treatment of multiple issues from one underlying defect.
     * Describes whether they are counted as one issue or several.
     */
    multipleIssueFromOneDefectTreatment: z
      .string()
      .min(20, "multipleIssueFromOneDefectTreatment must be described"),

    /**
     * Treatment when one evaluator finding covers several reviewer findings.
     */
    oneEvaluatorFindingCoversMultipleReviewerFindingsTreatment: z
      .string()
      .min(20, "oneEvaluatorFindingCoversMultipleReviewerFindingsTreatment must be described"),
  })
  .refine(
    (cp) => cp.rules.some((r) => r.level === "INSTANCE"),
    {
      message: "ComparisonProtocol must include at least one INSTANCE-level rule",
      path: ["rules"],
    },
  )
  .refine(
    (cp) => cp.rules.some((r) => r.level === "CLASS"),
    {
      message: "ComparisonProtocol must include at least one CLASS-level rule",
      path: ["rules"],
    },
  )
  .refine(
    (cp) => {
      const ids = cp.rules.map((r) => r.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: "IssueMatchingRule IDs must be unique within the ComparisonProtocol",
      path: ["rules"],
    },
  )
  .refine(
    (cp) => cp.rules.some((r) => r.disposition === "AGREED"),
    {
      message: "ComparisonProtocol must include a rule covering AGREED findings",
      path: ["rules"],
    },
  )
  .refine(
    (cp) => cp.rules.some((r) => r.disposition === "EVALUATOR_ONLY"),
    {
      message: "ComparisonProtocol must include a rule covering EVALUATOR_ONLY findings",
      path: ["rules"],
    },
  )
  .refine(
    (cp) => cp.rules.some((r) => r.disposition === "REVIEWER_ONLY"),
    {
      message: "ComparisonProtocol must include a rule covering REVIEWER_ONLY findings",
      path: ["rules"],
    },
  );

export type ComparisonProtocol = z.infer<typeof ComparisonProtocolSchema>;
