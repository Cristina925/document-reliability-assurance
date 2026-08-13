/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Coverage Matrix
 *
 * Defines schemas for reviewer domain coverage requirements and coverage matrix.
 *
 * Invariants:
 *   - Unqualified reviewers do not count toward coverage
 *   - A domain is PILOT_READY only when ≥ 2 independent eligible reviewers
 *     can be assigned to every relevant pilot document AND an adjudication
 *     path exists
 *   - FULL_BENCHMARK_READY requires sufficient reviewers for all 120 documents
 *   - Conflicts reducing effective coverage must be applied before reporting
 */

import { z } from "zod";
import { ReviewerDomainSchema } from "./reviewer-experience.js";

// ---------------------------------------------------------------------------
// Coverage status
// ---------------------------------------------------------------------------

export const COVERAGE_STATUSES = [
  /** No qualified reviewers for this domain */
  "NO_COVERAGE",
  /** Some qualified reviewers, but fewer than required for pilot execution */
  "INSUFFICIENT",
  /** Sufficient qualified reviewers for pilot execution (≥ 2 per doc, adjudicator available) */
  "PILOT_READY",
  /** Sufficient qualified reviewers for the full 120-document benchmark */
  "FULL_BENCHMARK_READY",
] as const;

export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export const CoverageStatusSchema = z.enum(
  COVERAGE_STATUSES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Reviewer coverage requirement (per domain)
// ---------------------------------------------------------------------------

export const ReviewerCoverageRequirementSchema = z.object({
  /** Domain this requirement applies to. */
  domain: ReviewerDomainSchema,

  /**
   * Number of corpus documents in this domain in the pilot.
   */
  pilotDocumentCount: z.number().int().min(0),

  /**
   * Number of corpus documents in this domain in the full benchmark.
   */
  fullBenchmarkDocumentCount: z.number().int().min(0),

  /**
   * Minimum number of independent reviewers required per document.
   * Must be ≥ 2 (protocol invariant).
   */
  minimumReviewersPerDocument: z
    .number()
    .int()
    .min(2, "minimumReviewersPerDocument must be at least 2"),

  /**
   * Minimum number of adjudicators required for this domain.
   * Must be ≥ 1 when pilot documents exist.
   */
  minimumAdjudicators: z.number().int().min(0),

  /**
   * Minimum number of qualified reviewers needed for pilot coverage.
   * Derived as pilotDocumentCount × minimumReviewersPerDocument, adjusted
   * for workload limits.
   */
  pilotMinimumReviewerCount: z.number().int().min(0),

  /**
   * Minimum number of qualified reviewers needed for full benchmark coverage.
   */
  fullBenchmarkMinimumReviewerCount: z.number().int().min(0),
});

export type ReviewerCoverageRequirement = z.infer<
  typeof ReviewerCoverageRequirementSchema
>;

// ---------------------------------------------------------------------------
// Domain coverage record (actual state)
// ---------------------------------------------------------------------------

export const DomainCoverageRecordSchema = z.object({
  /** Domain being reported. */
  domain: ReviewerDomainSchema,

  /**
   * Number of qualified general reviewers who can cover this domain.
   * Only counts reviewers with QUALIFIED_GENERAL or QUALIFIED_DOMAIN_SPECIALIST
   * status, not CONDITIONALLY_QUALIFIED, WITHDRAWN, or SUSPENDED.
   */
  qualifiedGeneralReviewers: z.number().int().min(0),

  /**
   * Number of qualified domain specialists for this domain.
   */
  qualifiedDomainSpecialists: z.number().int().min(0),

  /**
   * Number of qualified adjudicators available for this domain.
   */
  qualifiedAdjudicators: z.number().int().min(0),

  /**
   * Number of reviewers with a manageable (but not disqualifying) conflict
   * in this domain.
   */
  reviewersWithManageableConflict: z.number().int().min(0),

  /**
   * Number of reviewers available (not suspended, not withdrawn) for
   * assignment in this domain.
   */
  reviewersAvailable: z.number().int().min(0),

  /**
   * Number of reviewers needed for the pilot (pilot document count × 2).
   */
  reviewersNeededForPilot: z.number().int().min(0),

  /**
   * Number of reviewers needed for the full benchmark.
   */
  reviewersNeededForFullBenchmark: z.number().int().min(0),

  /**
   * Domain coverage status.
   *
   * PILOT_READY requires ALL of:
   *   1. qualifiedGeneralReviewers + qualifiedDomainSpecialists ≥ reviewersNeededForPilot
   *   2. qualifiedAdjudicators ≥ 1
   *   3. No unresolved conflicts blocking required assignments
   */
  coverageStatus: CoverageStatusSchema,
});

export type DomainCoverageRecord = z.infer<typeof DomainCoverageRecordSchema>;

// ---------------------------------------------------------------------------
// Reviewer coverage matrix
// ---------------------------------------------------------------------------

export const ReviewerCoverageMatrixSchema = z.object({
  /**
   * ISO-8601 timestamp of this matrix snapshot.
   */
  generatedAt: z.string().min(1),

  /**
   * Per-domain coverage records.
   */
  domainCoverage: z
    .array(DomainCoverageRecordSchema)
    .min(1, "Coverage matrix must include at least one domain"),

  /**
   * Total qualified reviewers across all domains (may count a reviewer
   * multiple times if they cover multiple domains).
   */
  totalQualifiedReviewerSlots: z.number().int().min(0),

  /**
   * Number of distinct qualified reviewer identities.
   */
  distinctQualifiedReviewers: z.number().int().min(0),

  /**
   * Number of distinct qualified adjudicator identities.
   */
  distinctQualifiedAdjudicators: z.number().int().min(0),

  /**
   * Whether the minimum pilot reviewer pool is met across all domains
   * that have pilot documents.
   */
  pilotMinimumMet: z.boolean(),

  /**
   * Whether the preferred pilot reviewer pool is met.
   */
  pilotPreferredMet: z.boolean(),

  /**
   * Whether the full benchmark reviewer target is met.
   */
  fullBenchmarkTargetMet: z.boolean(),

  /**
   * Domains with coverage gaps (any status other than PILOT_READY or
   * FULL_BENCHMARK_READY).
   */
  domainsWithCoverageGaps: z.array(ReviewerDomainSchema),
});

export type ReviewerCoverageMatrix = z.infer<typeof ReviewerCoverageMatrixSchema>;

// ---------------------------------------------------------------------------
// Coverage computation helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when a domain has PILOT_READY coverage.
 * Requires:
 *   - qualifiedGeneralReviewers + qualifiedDomainSpecialists ≥ reviewersNeededForPilot
 *   - qualifiedAdjudicators ≥ 1
 *   - reviewersNeededForPilot > 0 (domain has pilot documents)
 */
export function isDomainPilotReady(record: DomainCoverageRecord): boolean {
  if (record.reviewersNeededForPilot === 0) return false;
  const eligible =
    record.qualifiedGeneralReviewers + record.qualifiedDomainSpecialists;
  return eligible >= record.reviewersNeededForPilot && record.qualifiedAdjudicators >= 1;
}
