/**
 * DRA-VAL-001A — Scientific Validation Protocol — Corpus Design
 *
 * Defines the machine-readable schema for the benchmark corpus design,
 * including domain quotas, source-type ratios, difficulty strata, and
 * inclusion/exclusion criteria.
 *
 * Invariants enforced at parse time:
 *   - pilotSize < minimumViableSize < targetSize
 *   - domainQuotas must sum to targetSize
 *   - sourceTypeRatios components must sum to 1.0 (±0.01 tolerance)
 *   - difficultyStrata must sum to targetSize
 *   - inclusionCriteria and exclusionCriteria must each be non-empty
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Domain quota
// ---------------------------------------------------------------------------

/**
 * Allocation of documents for a single domain within the corpus.
 * Both targetCount and minimumCount must be positive.
 * minimumCount must be ≤ targetCount.
 */
export const CorpusQuotaSchema = z
  .object({
    /** Human-readable domain label (e.g. "Legal and regulatory"). */
    domain: z.string().min(1, "Domain must not be empty"),

    /**
     * Target number of documents from this domain.
     * Used when the full validation corpus is assembled.
     */
    targetCount: z.number().int().min(1, "targetCount must be at least 1"),

    /**
     * Minimum number of documents required for the minimum scientific corpus.
     * Must be ≤ targetCount.
     */
    minimumCount: z.number().int().min(1, "minimumCount must be at least 1"),
  })
  .refine((q) => q.minimumCount <= q.targetCount, {
    message: "minimumCount must be ≤ targetCount",
    path: ["minimumCount"],
  });

export type CorpusQuota = z.infer<typeof CorpusQuotaSchema>;

// ---------------------------------------------------------------------------
// Source-type ratio target
// ---------------------------------------------------------------------------

/**
 * Approximate proportional allocation across source types.
 * Each value is a fraction in [0, 1]. The three fractions
 * must sum to 1.0 (within ±0.01 floating-point tolerance).
 */
export const SourceTypeRatiosSchema = z
  .object({
    /** Proportion of documents that are entirely AI-generated. */
    aiGenerated: z.number().min(0).max(1),

    /** Proportion of documents that are entirely human-authored. */
    humanAuthored: z.number().min(0).max(1),

    /** Proportion of documents that are hybrid or AI-assisted. */
    hybrid: z.number().min(0).max(1),
  })
  .refine(
    (r) => Math.abs(r.aiGenerated + r.humanAuthored + r.hybrid - 1.0) <= 0.01,
    {
      message:
        "Source-type ratio fractions (aiGenerated + humanAuthored + hybrid) must sum to 1.0 (±0.01)",
    },
  );

export type SourceTypeRatios = z.infer<typeof SourceTypeRatiosSchema>;

// ---------------------------------------------------------------------------
// Difficulty strata
// ---------------------------------------------------------------------------

/**
 * Distribution of documents across difficulty levels.
 * Counts must sum to targetSize of the enclosing CorpusDesign.
 * Validated at the CorpusDesign level.
 */
export const DifficultyStrataSchema = z.object({
  /** Number of LOW-difficulty documents (straightforward, clear traceability). */
  low: z.number().int().min(0),

  /** Number of MEDIUM-difficulty documents (partial or ambiguous traceability). */
  medium: z.number().int().min(0),

  /** Number of HIGH-difficulty documents (contested, missing, or complex traceability). */
  high: z.number().int().min(0),
});

export type DifficultyStrata = z.infer<typeof DifficultyStrataSchema>;

// ---------------------------------------------------------------------------
// Corpus design
// ---------------------------------------------------------------------------

/**
 * Machine-readable specification of the benchmark corpus design.
 *
 * Staged design:
 *   - Pilot validation corpus:     pilotSize documents (20)
 *   - Minimum scientific corpus:   minimumViableSize documents (60)
 *   - Target validation corpus:    targetSize documents (120)
 *
 * Sample-size adequacy depends on observed issue prevalence and confidence
 * intervals, not only the raw document count. The sizes above are targets;
 * statistical power must be assessed after pilot results are available.
 */
export const CorpusDesignSchema = z
  .object({
    /**
     * Full target corpus size (documents).
     * Recommended: 120.
     */
    targetSize: z.number().int().min(30, "targetSize must be at least 30"),

    /**
     * Minimum corpus size required for a scientifically defensible result.
     * Must be < targetSize.
     */
    minimumViableSize: z
      .number()
      .int()
      .min(20, "minimumViableSize must be at least 20"),

    /**
     * Pilot corpus size — used for procedural dry-run before main execution.
     * Must be < minimumViableSize.
     */
    pilotSize: z.number().int().min(5, "pilotSize must be at least 5"),

    /**
     * Per-domain allocation targets. Must not be empty.
     * The sum of targetCounts must equal targetSize.
     */
    domainQuotas: z
      .array(CorpusQuotaSchema)
      .min(1, "At least one domain quota is required"),

    /**
     * Target source-type ratios (approximate fractions).
     * Fractions must sum to 1.0 (±0.01).
     */
    sourceTypeRatios: SourceTypeRatiosSchema,

    /**
     * Distribution across difficulty levels.
     * Counts must sum to targetSize.
     */
    difficultyStrata: DifficultyStrataSchema,

    /**
     * Explicit, testable criteria for document inclusion.
     * Must contain at least one criterion.
     */
    inclusionCriteria: z
      .array(z.string().min(5))
      .min(1, "At least one inclusion criterion is required"),

    /**
     * Explicit, testable criteria for document exclusion.
     * Must contain at least one criterion.
     */
    exclusionCriteria: z
      .array(z.string().min(5))
      .min(1, "At least one exclusion criterion is required"),

    /**
     * Narrative rationale for the corpus design.
     * Provides context for quota and strata decisions.
     */
    designRationale: z.string().min(20).optional(),
  })
  .refine((d) => d.pilotSize < d.minimumViableSize, {
    message: "pilotSize must be less than minimumViableSize",
    path: ["pilotSize"],
  })
  .refine((d) => d.minimumViableSize < d.targetSize, {
    message: "minimumViableSize must be less than targetSize",
    path: ["minimumViableSize"],
  })
  .refine(
    (d) => d.domainQuotas.reduce((sum, q) => sum + q.targetCount, 0) === d.targetSize,
    {
      message:
        "Sum of domain quota targetCounts must equal targetSize",
      path: ["domainQuotas"],
    },
  )
  .refine(
    (d) =>
      d.difficultyStrata.low +
        d.difficultyStrata.medium +
        d.difficultyStrata.high ===
      d.targetSize,
    {
      message:
        "Sum of difficultyStrata counts (low + medium + high) must equal targetSize",
      path: ["difficultyStrata"],
    },
  );

export type CorpusDesign = z.infer<typeof CorpusDesignSchema>;
