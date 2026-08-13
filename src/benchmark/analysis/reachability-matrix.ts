/**
 * DRA-CHK-002 — Version 1 Issue-Class Reachability Matrix
 *
 * Programmatic encoding of the reachability findings established by
 * DRA-CHK-002: Version 1 Issue-Class Reachability and Coverage-Ceiling
 * Determination.
 *
 * This module is the authoritative source of the DRA Version 1 coverage
 * ceiling. It is read-only under the Version 1 freeze. No evaluator
 * semantics may be changed to satisfy these classifications.
 *
 * Reachability statuses:
 *   OBSERVED_REACHABLE      — Produced in at least one valid Version 1 evaluation.
 *   REACHABLE_UNOBSERVED    — Complete path exists; no corpus document has exercised it.
 *   STRUCTURALLY_UNREACHABLE — No valid Version 1 input can cause the emission rule to fire.
 *   INDETERMINATE           — Reachability cannot be conclusively determined.
 *
 * Evidence-strength labels:
 *   CODE_PATH_PROVEN        — Implementation analysis proves the finding.
 *   TARGETED_TEST_PROVEN    — A targeted test confirms the finding.
 *   CORPUS_OBSERVED         — At least one frozen corpus document has produced this class.
 *   EMPIRICALLY_CHALLENGED  — A best-effort adversarial input failed to trigger the class.
 *   MULTIPLE_EVIDENCE_SOURCES — More than one independent evidence type supports the finding.
 *   INSUFFICIENT_EVIDENCE   — Finding cannot be adequately supported.
 */

// ---------------------------------------------------------------------------
// Reachability vocabulary
// ---------------------------------------------------------------------------

export type ReachabilityStatus =
  | "OBSERVED_REACHABLE"
  | "REACHABLE_UNOBSERVED"
  | "STRUCTURALLY_UNREACHABLE"
  | "INDETERMINATE";

export type EvidenceStrength =
  | "CODE_PATH_PROVEN"
  | "TARGETED_TEST_PROVEN"
  | "CORPUS_OBSERVED"
  | "EMPIRICALLY_CHALLENGED"
  | "MULTIPLE_EVIDENCE_SOURCES"
  | "INSUFFICIENT_EVIDENCE";

export type DefectClassification =
  | "INTENTIONAL_BOUNDARY"
  | "IMPLEMENTATION_GAP"
  | "DORMANT_SCHEMA_OR_TAXONOMY"
  | "DOCUMENTATION_MISMATCH"
  | "INDETERMINATE"
  | "NOT_APPLICABLE";

// ---------------------------------------------------------------------------
// ReachabilityEntry
// ---------------------------------------------------------------------------

export interface ReachabilityEntry {
  /** Canonical issue-class code (IC-1 … IC-9). */
  readonly code: string;
  /** Canonical issue-class name. */
  readonly name: string;
  /** Primary reachability status under the frozen Version 1 evaluator. */
  readonly reachability: ReachabilityStatus;
  /** Evidence-strength labels supporting the reachability conclusion. */
  readonly evidence: ReadonlyArray<EvidenceStrength>;
  /** Whether the emission rule exists in the implementation. */
  readonly emissionRuleExists: boolean;
  /** File where the emission rule lives, or null if absent. */
  readonly emissionRuleFile: string | null;
  /**
   * The upstream state required for emission.
   * Describes what upstream stage(s) must produce for this rule to fire.
   */
  readonly requiredUpstreamState: string;
  /**
   * The producing stage that would need to supply the upstream state.
   */
  readonly requiredProducerStage: string;
  /**
   * Whether the required upstream state is ever produced under the frozen implementation.
   */
  readonly upstreamStateReachable: boolean;
  /**
   * Description of the structural barrier preventing emission (if any).
   * Null for OBSERVED_REACHABLE classes.
   */
  readonly structuralBarrier: string | null;
  /**
   * Defect classification for unreachable classes.
   */
  readonly defectClassification: DefectClassification;
  /**
   * Corpus documents that have produced this class in a frozen evaluation.
   * Empty if the class has not been observed.
   */
  readonly observedInDocuments: ReadonlyArray<string>;
  /**
   * Confidence in the reachability conclusion (1=low … 3=high).
   */
  readonly confidence: 1 | 2 | 3;
  /**
   * Any residual uncertainty in the finding.
   */
  readonly residualUncertainty: string | null;
}

// ---------------------------------------------------------------------------
// Version 1 reachability matrix — authoritative findings
// ---------------------------------------------------------------------------

export const REACHABILITY_MATRIX: ReadonlyArray<ReachabilityEntry> = Object.freeze([
  // ── IC-1 UNSUPPORTED_CLAIM ───────────────────────────────────────────────
  {
    code: "IC-1",
    name: "UNSUPPORTED_CLAIM",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: true,
    emissionRuleFile:
      "lib/dra-reference/src/consistency-check/issue-detection.ts",
    requiredUpstreamState:
      "AuthorityRecord.classification === 'NO_IDENTIFIABLE_SOURCE' " +
      "AND EvidenceRecord.classification === 'NO_DOCUMENT_EVIDENCE' " +
      "AND MaterialityRecord.classification IN ('CRITICAL', 'HIGH')",
    requiredProducerStage: "Stage 3 (Authority Resolution)",
    upstreamStateReachable: false,
    structuralBarrier:
      "Stage 3 (detectAttribution in attribution-patterns.ts) never produces " +
      "NO_IDENTIFIABLE_SOURCE. Its final fallback (priority 10) unconditionally " +
      "returns DOCUMENT_AUTHOR via rule AR-DOCUMENT-AUTHOR. The AuthorityClassification " +
      "enum includes NO_IDENTIFIABLE_SOURCE but no matcher in detectAttribution returns it. " +
      "The five classifications actually produced are: DOCUMENT_AUTHOR, " +
      "EXPLICIT_NAMED_SOURCE, EXPLICIT_UNNAMED_SOURCE, STRUCTURALLY_INHERITED_SOURCE, " +
      "and AMBIGUOUS_SOURCE. Since NO_AUTHORITY = {'NO_IDENTIFIABLE_SOURCE'}, the " +
      "'noAuth' sentinel is always false in a valid pipeline execution, preventing IC-1 emission.",
    defectClassification: "DORMANT_SCHEMA_OR_TAXONOMY",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-2 AUTHORITY_EXPIRED ───────────────────────────────────────────────
  {
    code: "IC-2",
    name: "AUTHORITY_EXPIRED",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: false,
    emissionRuleFile: null,
    requiredUpstreamState:
      "Authority record with expiry or validity-period information that Stage 3 " +
      "or another stage has determined to be expired",
    requiredProducerStage: "None — no stage implements temporal authority checks",
    upstreamStateReachable: false,
    structuralBarrier:
      "No emission rule for IC-2 exists anywhere in the Version 1 evaluator pipeline. " +
      "The AuthorityRecord schema (authority-record.ts) contains no expiry, validity-period, " +
      "effective-date, or temporal fields. The Stage3ResolutionRecord carries no temporal " +
      "metadata. No stage performs any temporal check on authority records. Even if a " +
      "document references an expired standard by date, the evaluator cannot produce the " +
      "required state because the data structure to hold it was never defined.",
    defectClassification: "IMPLEMENTATION_GAP",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-3 AUTHORITY_ABSENT ────────────────────────────────────────────────
  {
    code: "IC-3",
    name: "AUTHORITY_ABSENT",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "CORPUS_OBSERVED",   // observed as a negative: DRA-DOC-0014 was optimal test, class absent
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: true,
    emissionRuleFile:
      "lib/dra-reference/src/consistency-check/issue-detection.ts",
    requiredUpstreamState:
      "AuthorityRecord.classification === 'NO_IDENTIFIABLE_SOURCE' " +
      "AND EvidenceRecord.classification NOT IN ('NO_DOCUMENT_EVIDENCE') " +
      "AND MaterialityRecord.classification IN ('CRITICAL', 'HIGH')",
    requiredProducerStage: "Stage 3 (Authority Resolution)",
    upstreamStateReachable: false,
    structuralBarrier:
      "Same Stage 3 barrier as IC-1: detectAttribution never produces " +
      "NO_IDENTIFIABLE_SOURCE; its final fallback is always DOCUMENT_AUTHOR. " +
      "Additionally, IC-3 is subsumed by IC-1 when both noAuth and noEvid are true, " +
      "making IC-3 only reachable when authority is absent but evidence is present — " +
      "a condition that also cannot be created from Stage 3 output. " +
      "DRA-DOC-0014 (BCBS Principles for Operational Resilience) was selected as the " +
      "optimal IC-3 evidence target: international standards body, ambiguous authority " +
      "chain, normative cross-framework claims. IC-3 was not observed (DRA-BMK-014). " +
      "Stage 3 resolved to DOCUMENT_AUTHOR (BCBS) as the fallback.",
    defectClassification: "DORMANT_SCHEMA_OR_TAXONOMY",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-4 EVIDENCE_ABSENT ─────────────────────────────────────────────────
  {
    code: "IC-4",
    name: "EVIDENCE_ABSENT",
    reachability: "OBSERVED_REACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "CORPUS_OBSERVED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: true,
    emissionRuleFile:
      "lib/dra-reference/src/consistency-check/issue-detection.ts",
    requiredUpstreamState:
      "MaterialityRecord.classification === 'CRITICAL' " +
      "AND EvidenceRecord.classification === 'NO_DOCUMENT_EVIDENCE' " +
      "AND AuthorityRecord.classification NOT IN ('NO_IDENTIFIABLE_SOURCE')",
    requiredProducerStage: "Stage 5 (Materiality) + Stage 4 (Evidence Linkage)",
    upstreamStateReachable: true,
    structuralBarrier: null,
    defectClassification: "NOT_APPLICABLE",
    observedInDocuments: ["DRA-DOC-0008", "DRA-DOC-0009"],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-5 EVIDENCE_INADEQUATE ─────────────────────────────────────────────
  {
    code: "IC-5",
    name: "EVIDENCE_INADEQUATE",
    reachability: "OBSERVED_REACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "CORPUS_OBSERVED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: true,
    emissionRuleFile:
      "lib/dra-reference/src/consistency-check/issue-detection.ts",
    requiredUpstreamState:
      "MaterialityRecord.classification === 'HIGH' " +
      "AND EvidenceRecord.classification IN ('NO_DOCUMENT_EVIDENCE', 'AMBIGUOUS_EVIDENCE_LINK') " +
      "AND AuthorityRecord.classification NOT IN ('NO_IDENTIFIABLE_SOURCE')",
    requiredProducerStage: "Stage 5 (Materiality) + Stage 4 (Evidence Linkage)",
    upstreamStateReachable: true,
    structuralBarrier: null,
    defectClassification: "NOT_APPLICABLE",
    observedInDocuments: [
      "DRA-DOC-0004",
      "DRA-DOC-0006",
      "DRA-DOC-0008",
      "DRA-DOC-0009",
      "DRA-DOC-0010",
      "DRA-DOC-0011",
      "DRA-DOC-0012",
    ],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-6 EVIDENCE_CONFLICT ───────────────────────────────────────────────
  {
    code: "IC-6",
    name: "EVIDENCE_CONFLICT",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: false,
    emissionRuleFile: null,
    requiredUpstreamState:
      "Two or more EvidenceRecords for the same claim with contradictory " +
      "evidence classifications or conflicting evidence values",
    requiredProducerStage: "Stage 4 (Evidence Linkage) — not implemented",
    upstreamStateReachable: false,
    structuralBarrier:
      "No emission rule for IC-6 exists anywhere in the Version 1 evaluator pipeline. " +
      "Stage 4 (link-evidence.ts) produces exactly one EvidenceRecord per statement — " +
      "the record shape holds a single EvidenceClassification and an array of " +
      "EvidenceSpans, but there is no conflict-state field and no conflict-detection " +
      "logic. The detectIssues function in issue-detection.ts does not contain any " +
      "predicate checking for conflicting evidence across records. The class exists " +
      "in the canonical DraIssueClass enum and in model/issues.ts comments " +
      "(alongside IC-7) but has no executable end-to-end path.",
    defectClassification: "IMPLEMENTATION_GAP",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-7 CLAIM_INCONSISTENCY ─────────────────────────────────────────────
  {
    code: "IC-7",
    name: "CLAIM_INCONSISTENCY",
    reachability: "OBSERVED_REACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "CORPUS_OBSERVED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: true,
    emissionRuleFile:
      "lib/dra-reference/src/consistency-check/issue-detection.ts",
    requiredUpstreamState:
      "Two or more statements with MaterialityRecord.classification IN ('CRITICAL', 'HIGH') " +
      "AND contradictory deontic modals (must/shall vs must not/shall not/cannot) " +
      "on the same verb (≥4 chars, case-insensitive)",
    requiredProducerStage:
      "Stage 2 (Claim Extraction) produces statements; " +
      "Stage 5 (Materiality) produces HIGH/CRITICAL classifications; " +
      "Stage 6 (Consistency Check) detects the contradiction",
    upstreamStateReachable: true,
    structuralBarrier: null,
    defectClassification: "NOT_APPLICABLE",
    observedInDocuments: ["DRA-DOC-0011"],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-8 TRACEABILITY_BROKEN ─────────────────────────────────────────────
  {
    code: "IC-8",
    name: "TRACEABILITY_BROKEN",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: false,
    emissionRuleFile: null,
    requiredUpstreamState:
      "A claim that exits Stage 4 without a traceable source or " +
      "a broken evidence chain that cannot be resolved",
    requiredProducerStage: "Stage 4 (Evidence Linkage) — not implemented",
    upstreamStateReachable: false,
    structuralBarrier:
      "No emission rule for IC-8 exists anywhere in the Version 1 evaluator pipeline. " +
      "Stage 4 always produces exactly one EvidenceRecord per statement; the minimum " +
      "possible classification is NO_DOCUMENT_EVIDENCE (which triggers IC-4 or IC-5, " +
      "not IC-8). A 'traceability-broken' state — where a reference exists but the chain " +
      "is broken — has no corresponding EvidenceClassification value and no detection logic. " +
      "IC-8 appears in reviewer-simulation.ts (benchmark evidence fixture, not the evaluator), " +
      "creating an apparent but non-functional reference to the class.",
    defectClassification: "IMPLEMENTATION_GAP",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },

  // ── IC-9 SCOPE_VIOLATION ─────────────────────────────────────────────────
  {
    code: "IC-9",
    name: "SCOPE_VIOLATION",
    reachability: "STRUCTURALLY_UNREACHABLE",
    evidence: [
      "CODE_PATH_PROVEN",
      "TARGETED_TEST_PROVEN",
      "EMPIRICALLY_CHALLENGED",
      "MULTIPLE_EVIDENCE_SOURCES",
    ],
    emissionRuleExists: false,
    emissionRuleFile: null,
    requiredUpstreamState:
      "A claim that exceeds or violates the stated scope of the document " +
      "or evaluation context",
    requiredProducerStage:
      "Stage 5 (Materiality) or Stage 6 (Consistency Check) — not implemented",
    upstreamStateReachable: false,
    structuralBarrier:
      "No emission rule for IC-9 exists anywhere in the Version 1 evaluator pipeline. " +
      "Stage 5 (materiality-rules.ts) operates on statement text only with no scope-awareness " +
      "metadata. The detectIssues function has no scope-violation predicate. The NormalisedEvaluationRequest " +
      "carries no scope declaration field that downstream stages could compare claims against. " +
      "IC-9 appears in reviewer-simulation.ts (benchmark evidence fixture, not the evaluator), " +
      "but has no executable path through the canonical pipeline. Even a document containing " +
      "statements that appear to violate its stated scope cannot trigger IC-9 because no " +
      "stage captures or compares scope boundaries.",
    defectClassification: "IMPLEMENTATION_GAP",
    observedInDocuments: [],
    confidence: 3,
    residualUncertainty: null,
  },
]);

// ---------------------------------------------------------------------------
// Derived statistics
// ---------------------------------------------------------------------------

/** Total canonical issue classes in the DRA Version 1 taxonomy. */
export const CANONICAL_CLASS_COUNT = 9 as const;

/** Classes that are observable through the pipeline (reachable). */
export const REACHABLE_CLASSES = REACHABILITY_MATRIX.filter(
  (e) =>
    e.reachability === "OBSERVED_REACHABLE" ||
    e.reachability === "REACHABLE_UNOBSERVED",
);

/** Classes that have been directly observed in frozen corpus evaluations. */
export const OBSERVED_CLASSES = REACHABILITY_MATRIX.filter(
  (e) => e.observedInDocuments.length > 0,
);

/** Classes that are structurally unreachable through the Version 1 pipeline. */
export const UNREACHABLE_CLASSES = REACHABILITY_MATRIX.filter(
  (e) => e.reachability === "STRUCTURALLY_UNREACHABLE",
);

/** Classes reachable but not yet observed in frozen corpus evaluations. */
export const REACHABLE_UNOBSERVED_CLASSES = REACHABILITY_MATRIX.filter(
  (e) => e.reachability === "REACHABLE_UNOBSERVED",
);

/**
 * Raw canonical coverage: observed classes / total canonical classes.
 * This is the metric appropriate for reporting "how many of the nine classes
 * have been seen in the benchmark corpus."
 */
export const RAW_CANONICAL_COVERAGE = {
  observed: OBSERVED_CLASSES.length,
  total: CANONICAL_CLASS_COUNT,
  percentage: (OBSERVED_CLASSES.length / CANONICAL_CLASS_COUNT) * 100,
} as const;

/**
 * Reachable-class coverage: observed reachable classes / total reachable classes.
 * This is the metric appropriate for reporting "how much of what the evaluator
 * can actually produce has been exercised."
 */
export const REACHABLE_CLASS_COVERAGE = {
  observedReachable: REACHABLE_CLASSES.filter(
    (e) => e.observedInDocuments.length > 0,
  ).length,
  totalReachable: REACHABLE_CLASSES.length,
  get percentage() {
    return this.totalReachable === 0
      ? 0
      : (this.observedReachable / this.totalReachable) * 100;
  },
};

/**
 * Maximum attainable coverage ceiling under the frozen Version 1 evaluator.
 * Cannot exceed REACHABLE_CLASSES.length / CANONICAL_CLASS_COUNT regardless
 * of corpus size.
 */
export const COVERAGE_CEILING = {
  maxObservable: REACHABLE_CLASSES.length,
  total: CANONICAL_CLASS_COUNT,
  ceilingPercentage: (REACHABLE_CLASSES.length / CANONICAL_CLASS_COUNT) * 100,
} as const;
