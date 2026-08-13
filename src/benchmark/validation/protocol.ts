/**
 * DRA-VAL-001A — Scientific Validation Protocol — Top-Level Protocol Schema
 *
 * Defines the ValidationProtocol — the root document that aggregates
 * all sections of the scientific validation design.
 *
 * Protocol lifecycle (forward-only):
 *   DRAFT → SUBMITTED → FROZEN
 *
 * Freeze invariants:
 *   - All required sections must be present and non-empty
 *   - At least one primary research question must exist
 *   - At least one null hypothesis must exist
 *   - frozenAt must be set
 *   - integrityDigest must be set and 64 characters
 *
 * Digest computation:
 *   The substantive digest covers all sections except:
 *     - status, frozenAt, integrityDigest, amendments
 *   This matches the DRA-001 evaluator convention (operational metadata excluded).
 *
 * No evaluator internals are imported. This module is fully independent
 * of the evaluator implementation.
 */

import { z } from "zod";
import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../../pipeline/canonical-serialise.js";
import {
  ValidationProtocolIdSchema,
  type ValidationProtocolId,
} from "./identifiers.js";
import {
  ResearchQuestionSchema,
  HypothesisSchema,
  NullHypothesisSchema,
  StudyObjectiveSchema,
  type ResearchQuestion,
  type Hypothesis,
  type NullHypothesis,
  type StudyObjective,
} from "./research-questions.js";
import {
  CorpusDesignSchema,
  type CorpusDesign,
} from "./corpus-design.js";
import {
  ReviewerEligibilitySchema,
  ReviewerAssignmentRuleSchema,
  ReviewSubmissionPolicySchema,
  AdjudicationPolicySchema,
  type ReviewerEligibility,
  type ReviewerAssignmentRule,
  type ReviewSubmissionPolicy,
  type AdjudicationPolicy,
} from "./reviewer-protocol.js";
import {
  ComparisonProtocolSchema,
  type ComparisonProtocol,
} from "./comparison-rules.js";
import {
  StatisticalAnalysisPlanSchema,
  type StatisticalAnalysisPlan,
} from "./statistical-plan.js";
import {
  ThreatsRegisterSchema,
  type ThreatsRegister,
} from "./threats.js";
import {
  AmendmentLogSchema,
  type AmendmentLog,
} from "./amendment.js";

// ---------------------------------------------------------------------------
// Protocol status
// ---------------------------------------------------------------------------

export const VALIDATION_PROTOCOL_STATUSES = ["DRAFT", "SUBMITTED", "FROZEN"] as const;
export type ValidationProtocolStatus = (typeof VALIDATION_PROTOCOL_STATUSES)[number];

export const ValidationProtocolStatusSchema = z.enum(
  VALIDATION_PROTOCOL_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Protocol status must be one of: ${VALIDATION_PROTOCOL_STATUSES.join(", ")}`,
    }),
  },
);

export const VALID_VALIDATION_PROTOCOL_TRANSITIONS: Readonly<
  Record<ValidationProtocolStatus, readonly ValidationProtocolStatus[]>
> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["FROZEN"],
  FROZEN: [],
} as const;

// ---------------------------------------------------------------------------
// Intended claims and prohibited claims
// ---------------------------------------------------------------------------

export const ClaimSchema = z.object({
  /** Sequential label (e.g. "IC-1", "PC-1"). */
  label: z.string().min(1),
  /** Full text of the claim. */
  text: z.string().min(20),
});

export type Claim = z.infer<typeof ClaimSchema>;

// ---------------------------------------------------------------------------
// Evaluation boundaries
// ---------------------------------------------------------------------------

export const EvaluationBoundarySchema = z.object({
  /** Sequential label. */
  label: z.string().min(1),
  /** Boundary description — what is explicitly out of scope. */
  text: z.string().min(20),
});

export type EvaluationBoundary = z.infer<typeof EvaluationBoundarySchema>;

// ---------------------------------------------------------------------------
// Success, failure, and inconclusive criteria
// ---------------------------------------------------------------------------

export const OutcomeCriteriaSchema = z.object({
  successCriteria: z
    .array(z.string().min(10))
    .min(1, "At least one success criterion is required"),
  failureCriteria: z
    .array(z.string().min(10))
    .min(1, "At least one failure criterion is required"),
  inconclusiveCriteria: z
    .array(z.string().min(10))
    .min(1, "At least one inconclusive criterion is required"),
});

export type OutcomeCriteria = z.infer<typeof OutcomeCriteriaSchema>;

// ---------------------------------------------------------------------------
// ValidationProtocol — base (no computed fields)
// ---------------------------------------------------------------------------

/**
 * The core validation protocol fields, used for digest computation.
 * Does not include status, frozenAt, integrityDigest, or amendments
 * (all excluded from the substantive digest).
 */
export const ValidationProtocolSubstantiveSchema = z.object({
  /** Protocol identifier. Format: DRA-VAL-NNNA. */
  id: ValidationProtocolIdSchema,

  /** Human-readable title. */
  title: z.string().min(10, "Protocol title must not be empty"),

  /** Version string (e.g. "1.0.0"). */
  version: z.string().min(1),

  /** The single primary research question and any secondary questions. */
  researchQuestions: z
    .array(ResearchQuestionSchema)
    .min(1, "At least one research question is required"),

  /** Ordered study objectives. */
  studyObjectives: z
    .array(StudyObjectiveSchema)
    .min(1, "At least one study objective is required"),

  /** Hypotheses. Each must reference a research question. */
  hypotheses: z
    .array(HypothesisSchema)
    .min(1, "At least one hypothesis is required"),

  /** Null hypotheses. Each must reference a hypothesis. */
  nullHypotheses: z
    .array(NullHypothesisSchema)
    .min(1, "At least one null hypothesis is required"),

  /** Unit of analysis (e.g. "document"). */
  unitOfAnalysis: z.string().min(5),

  /** Claims the study is intended to support, given the evidence. */
  intendedClaims: z
    .array(ClaimSchema)
    .min(1, "At least one intended claim is required"),

  /** Claims explicitly prohibited — the study must not be used to assert these. */
  prohibitedClaims: z
    .array(ClaimSchema)
    .min(1, "At least one prohibited claim is required"),

  /** Explicit boundaries of the evaluation. */
  evaluationBoundaries: z
    .array(EvaluationBoundarySchema)
    .min(1, "At least one evaluation boundary is required"),

  /** Outcome criteria defining success, failure, and inconclusive results. */
  outcomeCriteria: OutcomeCriteriaSchema,

  /** Benchmark corpus design specification. */
  corpusDesign: CorpusDesignSchema,

  /** Reviewer eligibility rules. */
  reviewerEligibility: ReviewerEligibilitySchema,

  /** Reviewer assignment rules. */
  reviewerAssignmentRule: ReviewerAssignmentRuleSchema,

  /** Review submission policy. */
  reviewSubmissionPolicy: ReviewSubmissionPolicySchema,

  /** Adjudication policy for disagreements. */
  adjudicationPolicy: AdjudicationPolicySchema,

  /** Pre-registered comparison protocol. */
  comparisonProtocol: ComparisonProtocolSchema,

  /** Pre-registered statistical analysis plan. */
  statisticalAnalysisPlan: StatisticalAnalysisPlanSchema,

  /** Registered threats to validity. */
  threatsToValidity: ThreatsRegisterSchema,
});

export type ValidationProtocolSubstantive = z.infer<
  typeof ValidationProtocolSubstantiveSchema
>;

// ---------------------------------------------------------------------------
// Full ValidationProtocol (substantive + operational)
// ---------------------------------------------------------------------------

export const ValidationProtocolSchema = ValidationProtocolSubstantiveSchema.extend({
  /** Current lifecycle status. */
  status: ValidationProtocolStatusSchema,

  /**
   * UTC ISO-8601 timestamp when the protocol was frozen.
   * Required when status is FROZEN; absent otherwise.
   */
  frozenAt: z.string().datetime({ offset: true }).optional(),

  /**
   * SHA-256 hex digest of the substantive payload.
   * Computed over all fields except: status, frozenAt, integrityDigest, and amendments.
   * Must be 64 characters when present.
   */
  integrityDigest: z
    .string()
    .length(64, "integrityDigest must be a 64-character SHA-256 hex string")
    .optional(),

  /** Filed amendments. Empty array when none have been filed. */
  amendments: AmendmentLogSchema,
})
  .refine(
    (p) =>
      p.researchQuestions.filter((q) => q.isPrimary).length === 1,
    {
      message: "Exactly one research question must be marked isPrimary",
      path: ["researchQuestions"],
    },
  )
  .refine(
    (p) => {
      if (p.status !== "FROZEN") return true;
      return typeof p.frozenAt === "string" && p.frozenAt.length > 0;
    },
    {
      message: "frozenAt must be set when status is FROZEN",
      path: ["frozenAt"],
    },
  )
  .refine(
    (p) => {
      if (p.status !== "FROZEN") return true;
      return (
        typeof p.integrityDigest === "string" && p.integrityDigest.length === 64
      );
    },
    {
      message: "integrityDigest must be a 64-character SHA-256 hex string when status is FROZEN",
      path: ["integrityDigest"],
    },
  );

export type ValidationProtocol = z.infer<typeof ValidationProtocolSchema>;

// ---------------------------------------------------------------------------
// Digest computation
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 substantive digest of a validation protocol.
 *
 * Excluded fields (operational metadata):
 *   - status
 *   - frozenAt
 *   - integrityDigest
 *   - amendments
 *
 * This mirrors the DRA evaluator's proof-receipt digest convention.
 */
export function computeValidationProtocolDigest(
  protocol: Omit<ValidationProtocol, "status" | "frozenAt" | "integrityDigest" | "amendments">,
): string {
  const payload: ValidationProtocolSubstantive = {
    id: protocol.id,
    title: protocol.title,
    version: protocol.version,
    researchQuestions: protocol.researchQuestions,
    studyObjectives: protocol.studyObjectives,
    hypotheses: protocol.hypotheses,
    nullHypotheses: protocol.nullHypotheses,
    unitOfAnalysis: protocol.unitOfAnalysis,
    intendedClaims: protocol.intendedClaims,
    prohibitedClaims: protocol.prohibitedClaims,
    evaluationBoundaries: protocol.evaluationBoundaries,
    outcomeCriteria: protocol.outcomeCriteria,
    corpusDesign: protocol.corpusDesign,
    reviewerEligibility: protocol.reviewerEligibility,
    reviewerAssignmentRule: protocol.reviewerAssignmentRule,
    reviewSubmissionPolicy: protocol.reviewSubmissionPolicy,
    adjudicationPolicy: protocol.adjudicationPolicy,
    comparisonProtocol: protocol.comparisonProtocol,
    statisticalAnalysisPlan: protocol.statisticalAnalysisPlan,
    threatsToValidity: protocol.threatsToValidity,
  };

  return createHash("sha256")
    .update(canonicalJsonStringify(payload), "utf8")
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Freeze validation
// ---------------------------------------------------------------------------

export type FreezeFailureReason =
  | "MISSING_PRIMARY_RESEARCH_QUESTION"
  | "MISSING_NULL_HYPOTHESIS"
  | "MISSING_HYPOTHESES"
  | "MISSING_CORPUS_DESIGN"
  | "MISSING_REVIEWER_PROTOCOL"
  | "MISSING_COMPARISON_PROTOCOL"
  | "MISSING_STATISTICAL_PLAN"
  | "MISSING_THREATS"
  | "ALREADY_FROZEN"
  | "INVALID_STATUS_TRANSITION";

export type FreezeValidationResult =
  | { ok: true }
  | { ok: false; reason: FreezeFailureReason; message: string };

/**
 * Validates that a protocol is complete and eligible to be frozen.
 * Returns ok:true when the protocol may be frozen, or a structured failure.
 */
export function validateProtocolForFreeze(
  protocol: ValidationProtocol,
): FreezeValidationResult {
  if (protocol.status === "FROZEN") {
    return {
      ok: false,
      reason: "ALREADY_FROZEN",
      message: "Protocol is already frozen",
    };
  }

  if (!VALID_VALIDATION_PROTOCOL_TRANSITIONS[protocol.status as ValidationProtocolStatus].includes("FROZEN")) {
    return {
      ok: false,
      reason: "INVALID_STATUS_TRANSITION",
      message: `Cannot freeze a protocol with status ${protocol.status}; must be SUBMITTED first`,
    };
  }

  if (!protocol.researchQuestions.some((q) => q.isPrimary)) {
    return {
      ok: false,
      reason: "MISSING_PRIMARY_RESEARCH_QUESTION",
      message: "Protocol must have exactly one primary research question",
    };
  }

  if (protocol.hypotheses.length === 0) {
    return {
      ok: false,
      reason: "MISSING_HYPOTHESES",
      message: "Protocol must have at least one hypothesis",
    };
  }

  if (protocol.nullHypotheses.length === 0) {
    return {
      ok: false,
      reason: "MISSING_NULL_HYPOTHESIS",
      message: "Protocol must have at least one null hypothesis",
    };
  }

  if (protocol.threatsToValidity.threats.length === 0) {
    return {
      ok: false,
      reason: "MISSING_THREATS",
      message: "Protocol must register at least one threat to validity",
    };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Freeze operation
// ---------------------------------------------------------------------------

export type FreezeResult =
  | { ok: true; protocol: ValidationProtocol }
  | { ok: false; reason: FreezeFailureReason; message: string };

/**
 * Freezes a validation protocol.
 *
 * 1. Validates completeness via validateProtocolForFreeze()
 * 2. Computes the substantive digest
 * 3. Returns a new frozen protocol with status FROZEN, frozenAt, and integrityDigest set
 *
 * The input protocol is not mutated.
 */
export function freezeProtocol(
  protocol: ValidationProtocol,
  frozenAt: string,
): FreezeResult {
  const validation = validateProtocolForFreeze(protocol);
  if (!validation.ok) return validation;

  const digest = computeValidationProtocolDigest(protocol);

  const frozen: ValidationProtocol = {
    ...protocol,
    status: "FROZEN",
    frozenAt,
    integrityDigest: digest,
  };

  return { ok: true, protocol: frozen };
}

/**
 * Verifies the substantive digest of a frozen protocol.
 * Returns true when the digest matches the computed value.
 */
export function verifyProtocolIntegrity(protocol: ValidationProtocol): boolean {
  if (!protocol.integrityDigest) return false;
  const expected = computeValidationProtocolDigest(protocol);
  return protocol.integrityDigest === expected;
}
