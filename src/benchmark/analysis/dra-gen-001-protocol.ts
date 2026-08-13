/**
 * DRA-GEN-001 Phase 0 — Blind Generalisation Protocol (machine-readable core)
 *
 * This is a REVIEW/PROTOCOL-DESIGN artefact. It fixes the methodology for a
 * future blind benchmark; it does not select, inspect, acquire, or evaluate
 * any blind-test document, and it changes no production evaluator behaviour.
 *
 * See `docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md` for the full
 * prose specification this module encodes load-bearing commitments from.
 *
 * STATUS: DRAFT. No benchmark execution may begin while this module's
 * `PROTOCOL_STATUS` is `"DRAFT"` — see `dra-gen-001-freeze-integrity.test.ts`.
 */

import { GC1_AGGREGATE_DIGEST, GC1_CANDIDATE_ID } from "./dra-gc-1-freeze-manifest";

// ---------------------------------------------------------------------------
// Protocol identity and status
// ---------------------------------------------------------------------------

export const PROTOCOL_ID = "DRA-GEN-001" as const;
export const PROTOCOL_VERSION = "0.1.0-draft" as const;

export type ProtocolStatus = "DRAFT" | "FROZEN";
/** Must remain "DRAFT" until an explicit, separate freeze decision is taken (Phase 0 does not self-freeze). */
export const PROTOCOL_STATUS: ProtocolStatus = "DRAFT";

/** The GC-1 candidate this protocol is bound to. Any execution must reverify this against the live GC-1 manifest before every batch. */
export const BOUND_CANDIDATE_ID = GC1_CANDIDATE_ID;
export const BOUND_CANDIDATE_DIGEST = GC1_AGGREGATE_DIGEST;

// ---------------------------------------------------------------------------
// Section 2 — inferential target population
// ---------------------------------------------------------------------------

export const IN_SCOPE_POPULATION_DESCRIPTION =
  "Documents published by an authoritative public-sector or intergovernmental institution " +
  "(government body, statutory regulator, international/intergovernmental organisation, " +
  "national statistics office, or equivalent public authority), in PDF or HTML, in one of " +
  "GC-1's five validated languages (English, Spanish, French, Japanese, Bulgarian) for " +
  "decision-level claims (other Latin- or Cyrillic-script European languages may appear only " +
  "in a secondary/exploratory stratum for non-decision endpoints), published within the last " +
  "15 years, under a licence or lawful-use basis permitting benchmark evaluation, containing " +
  "regulatory, policy, legal/administrative, standards/guidance, technical, or public-sector " +
  "scientific/statistical content.";

export const OUT_OF_SCOPE_POPULATION_DESCRIPTION =
  "All documents on the general internet; personal, commercial, or informal web content; " +
  "social media; paywalled or login-gated sources; non-official mirrors where an official " +
  "source exists; documents in RTL/bidirectional scripts, Devanagari-type complex/conjunct " +
  "scripts, Thai-style scriptio continua, or any other script family with no prior DRA " +
  "segmentation validation; image-only documents with no extractable text layer; and any " +
  "claim about the truth or correctness of a document's underlying subject matter (DRA " +
  "evaluates representation and evidentiary support, not real-world factual correctness).";

export type CarriedForwardLimitationId =
  | "SCRIPT_BOUNDARY_RTL_ABUGIDA_SCRIPTIO_CONTINUA"
  | "NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE"
  | "MULTICOLUMN_BOUNDED_RESIDUAL_RISK"
  | "UNTESTED_MULTI_WEAKNESS_INTERACTION"
  | "SIX_OF_NINE_ISSUE_CLASSES_UNTRIGGERABLE";

export interface CarriedForwardLimitation {
  readonly id: CarriedForwardLimitationId;
  readonly sourceLedgerEntry: string;
  readonly statement: string;
  readonly generalisationConsequence: string;
}

/** GC-1's declared boundaries, carried forward verbatim in effect (not softened) into GEN-001's scope definition. */
export const CARRIED_FORWARD_LIMITATIONS: readonly CarriedForwardLimitation[] = [
  {
    id: "SCRIPT_BOUNDARY_RTL_ABUGIDA_SCRIPTIO_CONTINUA",
    sourceLedgerEntry: "D2",
    statement:
      "RTL/bidirectional scripts, Devanagari-type complex/conjunct scripts, and Thai-style " +
      "scriptio continua have zero validated segmentation behaviour (DRA-DOC-0033/Devanagari " +
      "remains acquisition-blocked, not evaluated).",
    generalisationConsequence:
      "These scripts are excluded from the GEN-001 sampling frame entirely (Section 4 " +
      "eligibility), not sampled-and-expected-to-fail. GEN-001 makes no claim, positive or " +
      "negative, about them.",
  },
  {
    id: "NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE",
    sourceLedgerEntry: "D3",
    statement:
      "Stage 5 materiality/obligation detection is confirmed systematically English-lexicon-only " +
      "(12/12 constructed Spanish obligation pairs under-detected); French is untested but " +
      "suspected to share the mechanism.",
    generalisationConsequence:
      "Non-English documents may be included in GEN-001 for acquisition/representation/pipeline " +
      "completion/determinism/proof-integrity endpoints, but decision-correctness and " +
      "materiality-quality claims are scoped to English documents only. Non-English REVIEW/HOLD " +
      "decisions must be reported but not interpreted as evidence of correct materiality " +
      "detection.",
  },
  {
    id: "MULTICOLUMN_BOUNDED_RESIDUAL_RISK",
    sourceLedgerEntry: "D1",
    statement:
      "23/41 (56.1%) pair-adjacency preservation on the frozen multi-column oracle; residual " +
      "failures confined to pages mixing two column-width regimes; fails safe (passthrough, not " +
      "silent corruption).",
    generalisationConsequence:
      "Multi-column PDFs remain eligible for GEN-001 (not excluded), but a reading-order defect " +
      "on such a document is classified as KNOWN_LIMITATION_ENCOUNTERED, not as an unexpected " +
      "SEMANTIC_EVALUATOR_FAILURE, unless it manifests in a way inconsistent with the documented " +
      "failure mode (e.g. silent fabrication rather than passthrough).",
  },
  {
    id: "UNTESTED_MULTI_WEAKNESS_INTERACTION",
    sourceLedgerEntry: "D4",
    statement:
      "No development document has ever combined 2+ already-characterised representation " +
      "weaknesses (e.g. OCR + footnotes, multi-column + tables).",
    generalisationConsequence:
      "GEN-001 may be the first controlled exposure to multi-weakness documents. Any resulting " +
      "failure must be classified on its own merits (Section 10 taxonomy) — it must not be " +
      "waved through as 'expected' when it was, in fact, never tested before.",
  },
  {
    id: "SIX_OF_NINE_ISSUE_CLASSES_UNTRIGGERABLE",
    sourceLedgerEntry: "D6",
    statement:
      "Under the frozen V1 evaluator, 6 of 9 defined issue classes (IC-1, IC-2, IC-3, IC-6, IC-8, " +
      "IC-9) are structurally untriggerable by any document, confirmed across all 34 admitted " +
      "documents.",
    generalisationConsequence:
      "GEN-001's issue-class-distribution endpoint cannot and must not be interpreted as " +
      "evidence about those 6 classes; only EVIDENCE_ABSENT, EVIDENCE_INADEQUATE, and " +
      "CLAIM_INCONSISTENCY are live outcomes.",
  },
] as const;

// ---------------------------------------------------------------------------
// Section 3 — unit of analysis
// ---------------------------------------------------------------------------

export const UNIT_OF_ANALYSIS_DEFINITION =
  "One independently citable publication artefact at a specific edition, identified by a " +
  "single canonical source URL (or canonical ordered URL set, for multi-page HTML " +
  "publications, using DRA's existing multi-page-HTML acquisition precedent). Appendices " +
  "published as physically separate files from a main report are out of scope unless the " +
  "publisher integrates them into one file; only the main/narrative document file is the " +
  "evaluated unit. Only the current/latest identifiable edition at frame-construction time is " +
  "eligible. Each unit is assigned a 'publication family identifier' " +
  "(normalised publisher + title + base edition, ignoring language/translation) so that " +
  "translations, mirrors, and republications of one underlying work cannot both be drawn as " +
  "independent observations.";

export type UnitEdgeCaseRule =
  | "MULTI_FILE_REPORT_MAIN_FILE_ONLY"
  | "MULTI_PAGE_HTML_ONE_UNIT"
  | "TRANSLATION_SEPARATE_UNIT_FAMILY_LIMITED"
  | "REVISED_EDITION_LATEST_ONLY"
  | "PERIODICAL_ISSUE_IS_THE_UNIT"
  | "MIRROR_CANONICAL_SOURCE_ONLY";

export interface UnitEdgeCasePolicy {
  readonly rule: UnitEdgeCaseRule;
  readonly policy: string;
}

export const UNIT_EDGE_CASE_POLICIES: readonly UnitEdgeCasePolicy[] = [
  {
    rule: "MULTI_FILE_REPORT_MAIN_FILE_ONLY",
    policy: "Evaluate only the main/narrative report file; separately-filed appendices are out of scope.",
  },
  {
    rule: "MULTI_PAGE_HTML_ONE_UNIT",
    policy: "Concatenate deterministically ordered HTML pages of one publication into one unit (existing DRA precedent).",
  },
  {
    rule: "TRANSLATION_SEPARATE_UNIT_FAMILY_LIMITED",
    policy: "Each language edition is a separate unit, but at most one edition per publication family may appear in a single sample draw; a second draw from the same family is treated as a duplicate-family hit and replaced.",
  },
  {
    rule: "REVISED_EDITION_LATEST_ONLY",
    policy: "Only the current/latest identifiable edition as of frame-construction date enters the frame; superseded editions are never in the frame.",
  },
  {
    rule: "PERIODICAL_ISSUE_IS_THE_UNIT",
    policy: "A dated/numbered periodical issue (e.g. one gazette issue) is one unit; the periodical series as a whole is never one unit.",
  },
  {
    rule: "MIRROR_CANONICAL_SOURCE_ONLY",
    policy: "Only the canonical/primary source of a document is eligible; known mirrors are excluded at the eligibility stage via source deduplication, not sampled and discarded post hoc.",
  },
] as const;

// ---------------------------------------------------------------------------
// Section 4 — eligibility criteria (deterministic, checked without looking at DRA performance)
// ---------------------------------------------------------------------------

export interface EligibilityCriterion {
  readonly id: string;
  readonly description: string;
}

export const ELIGIBILITY_CRITERIA: readonly EligibilityCriterion[] = [
  { id: "E1_OFFICIAL_SOURCE", description: "Publisher is a government body, statutory regulator, intergovernmental/international body, national statistics office, or comparable public authority." },
  { id: "E2_LICENCE_OR_LAWFUL_USE", description: "Open licence, public-domain status, home-jurisdiction text/data-mining exception, or explicit publisher terms permitting research reproduction/analysis." },
  { id: "E3_MEDIA_TYPE", description: "PDF or HTML only." },
  { id: "E4_ACCESSIBLE_WITHOUT_GATING", description: "Retrievable via direct HTTP(S) GET without login/CAPTCHA/paywall. A bot-blocked source remains in the frame and is handled via the acquisition-failure protocol (Section 11), not silently marked ineligible." },
  { id: "E5_MINIMUM_CONTENT", description: "At least 500 words of extractable normalised text." },
  { id: "E6_DOCUMENT_IDENTITY", description: "Identifiable title, publisher, and a publication date or version/edition label sufficient to build a DocumentIdentity record." },
  { id: "E7_VERSION_IDENTIFIABLE_LATEST", description: "If multiple editions exist, only the current/latest identifiable edition as of frame-construction date is eligible." },
  { id: "E8_PUBLICATION_DATE_WINDOW", description: "Published between 2011-01-01 and the frame-construction date (contemporary institutional publishing practice; adjustable but fixed before sampling)." },
  { id: "E9_LANGUAGE", description: "One of English/Spanish/French/Japanese/Bulgarian for decision-level claims; other Latin/Cyrillic-script European languages permitted only in a secondary exploratory stratum; RTL/Devanagari-type/scriptio-continua excluded entirely." },
  { id: "E10_NO_DUPLICATE_IN_FRAME", description: "Source URL and title+publisher+edition (publication family identifier) must not match any other frame entry." },
  { id: "E11_NOT_DEVELOPMENT_OR_CONSIDERED", description: "Not in the 33-document GC-1 development corpus, not DRA-DOC-0033, and not any candidate ever considered during any DRA-ACQ discovery programme (see CONSIDERED_CANDIDATE_URLS/CONSIDERED_CANDIDATE_IDS)." },
  { id: "E12_NO_PRIOR_HUMAN_INSPECTION", description: "No DRA contributor has inspected this specific document for the purpose of judging DRA suitability prior to frame construction." },
] as const;

// ---------------------------------------------------------------------------
// Section 6/7 — sampling frame and stratification
// ---------------------------------------------------------------------------

export const SAMPLING_FRAME_METHOD_DESCRIPTION =
  "Frame construction (deterministic, no randomness): enumerate a fixed, versioned list of " +
  "authoritative publisher sources not exhausted by the development programme; for each " +
  "publisher, apply a predeclared deterministic query rule against their public document " +
  "index (e.g. 'N most recent publications in category X as of frame-construction date') to " +
  "enumerate a candidate pool; concatenate per-publisher pools in a fixed publisher order into " +
  "one master eligible-candidate list with sequential frame-position numbers; hash and record " +
  "this full frame before any random draw. Selection (separate step): seeded, without-" +
  "replacement pseudo-random draw from the recorded frame, stratified per the cells below. " +
  "Frame construction and selection are each independently recorded and hashed.";

export type StratumId = "PDF_ENGLISH" | "PDF_NON_ENGLISH" | "HTML_ENGLISH" | "HTML_NON_ENGLISH";

export interface Stratum {
  readonly id: StratumId;
  readonly mediaType: "PDF" | "HTML";
  readonly languageGroup: "ENGLISH" | "NON_ENGLISH_VALIDATED";
  readonly allocationFraction: number;
}

/**
 * Hard, pre-allocated strata: media type x language group. Chosen because these two dimensions
 * map directly onto the two strongest, most decision-relevant declared GC-1 limitations
 * (D1 multi-column/PDF layout, D3 English/non-English materiality) — equal allocation gives the
 * benchmark maximum power on the comparison most likely to be informative, without expanding
 * strata count into statistical noise. Domain/publisher-class (Section 7 "soft" dimension) is
 * sampled proportionally to its natural frequency in the frame and reported descriptively, not
 * force-balanced, to avoid over-stratification (2x2x4 = 16 cells would leave ~5-6 units per cell
 * at n=90-100, too thin to interpret).
 */
export const HARD_STRATA: readonly Stratum[] = [
  { id: "PDF_ENGLISH", mediaType: "PDF", languageGroup: "ENGLISH", allocationFraction: 0.25 },
  { id: "PDF_NON_ENGLISH", mediaType: "PDF", languageGroup: "NON_ENGLISH_VALIDATED", allocationFraction: 0.25 },
  { id: "HTML_ENGLISH", mediaType: "HTML", languageGroup: "ENGLISH", allocationFraction: 0.25 },
  { id: "HTML_NON_ENGLISH", mediaType: "HTML", languageGroup: "NON_ENGLISH_VALIDATED", allocationFraction: 0.25 },
] as const;

export const SOFT_STRATUM_DIMENSIONS = [
  "domain/publisher class (Legal/Regulatory, Government/Policy, Standards/Technical-Guidance, Statistical/Scientific-report) — monitored and reported, not force-balanced",
] as const;

// ---------------------------------------------------------------------------
// Section 8 — sample size
// ---------------------------------------------------------------------------

export interface SampleSizeOption {
  readonly n: number;
  readonly ciWidthAt90PctApprox: number;
  readonly minDetectableFailureRateAt95PctConfidence: number;
  readonly recommendation: "REJECTED_UNDERPOWERED" | "MINIMUM_VIABLE" | "RECOMMENDED_PRIMARY" | "REJECTED_UNJUSTIFIED_COST";
  readonly note: string;
}

/**
 * Wilson-interval half-widths (95% CI) at p=0.90 and rule-of-three minimum-detectable failure
 * rates (95% probability of >=1 occurrence), computed directly (see protocol doc Section 8 for
 * the full table across p in {0.5, 0.8, 0.9, 0.95}). n=100 is recommended not because it matches
 * an earlier programme's informal target, but because it is the smallest evaluated size that (a)
 * reliably detects a >=3% material failure rate, and (b) keeps the overall 95% CI at p=0.90 under
 * +/-12 points, while (c) still leaving n=25 per hard stratum (Section 7) — workable for
 * descriptive stratum comparison at the acquisition-cost profile this project has historically
 * shown (31 acquisition programmes to admit 33 development documents).
 */
export const SAMPLE_SIZE_OPTIONS: readonly SampleSizeOption[] = [
  { n: 50, ciWidthAt90PctApprox: 17.0, minDetectableFailureRateAt95PctConfidence: 0.06, recommendation: "REJECTED_UNDERPOWERED", note: "Per-stratum n=12-13 is too thin even for descriptive comparison; cannot reliably detect failure rates below ~6%." },
  { n: 75, ciWidthAt90PctApprox: 13.8, minDetectableFailureRateAt95PctConfidence: 0.04, recommendation: "MINIMUM_VIABLE", note: "Documented fallback if acquisition cost/time forces a smaller programme; per-stratum n~19." },
  { n: 100, ciWidthAt90PctApprox: 11.9, minDetectableFailureRateAt95PctConfidence: 0.03, recommendation: "RECOMMENDED_PRIMARY", note: "Smallest size detecting a >=3% material failure rate with 95% confidence of >=1 observation; per-stratum n=25." },
  { n: 150, ciWidthAt90PctApprox: 9.7, minDetectableFailureRateAt95PctConfidence: 0.02, recommendation: "REJECTED_UNJUSTIFIED_COST", note: "Meaningful precision gain, but the marginal 50 units cost roughly 50% more acquisition effort for a ~2pp CI tightening; not justified unless a prior GEN-001 result is inconclusive." },
  { n: 200, ciWidthAt90PctApprox: 8.4, minDetectableFailureRateAt95PctConfidence: 0.01, recommendation: "REJECTED_UNJUSTIFIED_COST", note: "Diminishing returns; reserved for a possible future GEN-002 if GEN-001 motivates finer precision." },
] as const;

export const RECOMMENDED_SAMPLE_SIZE = 100 as const;

// ---------------------------------------------------------------------------
// Section 9/14 — endpoints (primary / secondary / exploratory), predeclared
// ---------------------------------------------------------------------------

export type EndpointTier = "PRIMARY" | "SECONDARY" | "EXPLORATORY";

export interface Endpoint {
  readonly id: string;
  readonly tier: EndpointTier;
  readonly description: string;
}

export const ENDPOINTS: readonly Endpoint[] = [
  { id: "ACQUISITION_SUCCESS_RATE", tier: "PRIMARY", description: "Proportion of the locked sample whose eligible authoritative source was successfully acquired under the predefined rules (denominator = locked sample size, including replacements per Section 11)." },
  { id: "PIPELINE_COMPLETION_RATE", tier: "PRIMARY", description: "Proportion of successfully acquired documents for which GC-1 completed its full evaluation deterministically without a PIPELINE_FAILURE." },
  { id: "PROOF_INTEGRITY_RATE", tier: "PRIMARY", description: "Proportion of completed evaluations whose proof receipt is valid and reproducible (re-verified independently, not merely emitted)." },
  { id: "MATERIAL_FAILURE_RATE", tier: "PRIMARY", description: "Proportion of the locked sample classified under any of PIPELINE_FAILURE, DETERMINISM_FAILURE, PROOF_INTEGRITY_FAILURE, or SEMANTIC_EVALUATOR_FAILURE (Section 10) — the headline system-failure rate, explicitly excluding correct REVIEW/HOLD decisions and KNOWN_LIMITATION_ENCOUNTERED." },
  { id: "REPRESENTATION_SUCCESS_RATE", tier: "SECONDARY", description: "Proportion of acquired documents represented without a demonstrated REPRESENTATION_FAILURE." },
  { id: "DECISION_DISTRIBUTION", tier: "SECONDARY", description: "Frequency of SUPPORTED/REVIEW/HOLD outcomes, reported without treating any one class as inherently 'correct'." },
  { id: "ISSUE_CLASS_DISTRIBUTION", tier: "SECONDARY", description: "Frequency of each observed issue class, scoped to the 3 classes known triggerable under the frozen V1 evaluator (Section 2 limitation)." },
  { id: "DETERMINISM_REPEATABILITY_RATE", tier: "SECONDARY", description: "Proportion of documents for which repeated execution (per the repeat-execution sub-protocol) produced an identical substantive result." },
  { id: "KNOWN_LIMITATION_ENCOUNTER_RATE", tier: "SECONDARY", description: "Proportion of the sample where a previously declared GC-1 limitation (Section 2 CARRIED_FORWARD_LIMITATIONS) manifested, reported separately from MATERIAL_FAILURE_RATE." },
  { id: "STRATUM_LEVEL_BREAKDOWNS", tier: "EXPLORATORY", description: "Any of the above endpoints broken down by hard stratum or by the soft domain/publisher-class dimension; hypothesis-generating only, not confirmatory given per-stratum n." },
  { id: "PUBLISHER_OR_FORMAT_CORRELATES_OF_FAILURE", tier: "EXPLORATORY", description: "Post hoc inspection of whether failures cluster by publisher, format, or length; may motivate a future engineering programme but is not part of the confirmatory GEN-001 result." },
] as const;

// ---------------------------------------------------------------------------
// Section 10 — failure taxonomy
// ---------------------------------------------------------------------------

export type FailureCategory =
  | "EXTERNAL_ACQUISITION_FAILURE"
  | "GOVERNANCE_INELIGIBLE"
  | "REPRESENTATION_FAILURE"
  | "PIPELINE_FAILURE"
  | "DETERMINISM_FAILURE"
  | "PROOF_INTEGRITY_FAILURE"
  | "SEMANTIC_EVALUATOR_FAILURE"
  | "KNOWN_LIMITATION_ENCOUNTERED"
  | "SUCCESSFUL_EVALUATION"
  | "UNCLASSIFIED";

export interface FailureCategoryDefinition {
  readonly category: FailureCategory;
  readonly boundary: string;
  readonly replacementEligible: boolean;
  readonly countsTowardMaterialFailureRate: boolean;
}

export const FAILURE_TAXONOMY: readonly FailureCategoryDefinition[] = [
  { category: "EXTERNAL_ACQUISITION_FAILURE", boundary: "Official source cannot be obtained after the full predefined retry protocol (Section 11) due to external availability/rate-limiting/access restriction, with no DRA-caused defect involved.", replacementEligible: true, countsTowardMaterialFailureRate: false },
  { category: "GOVERNANCE_INELIGIBLE", boundary: "The sampled candidate, on inspection required for governance verification, fails a predeclared eligibility criterion (Section 4) that could not be verified before selection (e.g. licence turns out unverifiable after acquisition).", replacementEligible: true, countsTowardMaterialFailureRate: false },
  { category: "REPRESENTATION_FAILURE", boundary: "The source is acquired but DRA materially fails to preserve or reconstruct information required for evaluation, beyond the disclosed representation-boundary limitations (Section 2), i.e. a previously-undocumented or more-severe-than-documented representation defect.", replacementEligible: false, countsTowardMaterialFailureRate: false },
  { category: "PIPELINE_FAILURE", boundary: "The frozen pipeline crashes, hangs, or otherwise fails to complete evaluation on a document that was successfully acquired and represented.", replacementEligible: false, countsTowardMaterialFailureRate: true },
  { category: "DETERMINISM_FAILURE", boundary: "Repeated execution of GC-1 on the identical frozen input produces a substantively different decision, issue set, or materiality classification.", replacementEligible: false, countsTowardMaterialFailureRate: true },
  { category: "PROOF_INTEGRITY_FAILURE", boundary: "The proof receipt cannot be independently re-verified against the evaluation it claims to describe.", replacementEligible: false, countsTowardMaterialFailureRate: true },
  { category: "SEMANTIC_EVALUATOR_FAILURE", boundary: "Evidence demonstrates the frozen evaluator behaves incorrectly relative to its own specified semantics (not merely 'issued a REVIEW/HOLD we didn't expect') — e.g. a defined issue class fails to fire on a document that unambiguously satisfies its trigger condition.", replacementEligible: false, countsTowardMaterialFailureRate: true },
  { category: "KNOWN_LIMITATION_ENCOUNTERED", boundary: "A previously declared GC-1 limitation (Section 2 CARRIED_FORWARD_LIMITATIONS, i.e. ledger D1-D6) manifests in a way consistent with its documented failure mode.", replacementEligible: false, countsTowardMaterialFailureRate: false },
  { category: "SUCCESSFUL_EVALUATION", boundary: "The unit completes acquisition, representation, evaluation, and proof verification without any benchmark-defined system failure, regardless of whether the decision is SUPPORTED, REVIEW, or HOLD.", replacementEligible: false, countsTowardMaterialFailureRate: false },
  { category: "UNCLASSIFIED", boundary: "Exceptional category for an outcome that does not fit any category above. Use requires mandatory review and full disclosure in the final report; must not be used to quietly drop an inconvenient result, and its rate is reported explicitly rather than folded into SUCCESSFUL_EVALUATION.", replacementEligible: false, countsTowardMaterialFailureRate: false },
] as const;

// ---------------------------------------------------------------------------
// Section 11 — replacement rules
// ---------------------------------------------------------------------------

export const REPLACEMENT_POLICY = {
  legitimateReasons: [
    "EXTERNAL_ACQUISITION_FAILURE after exhausting the retry protocol",
    "GOVERNANCE_INELIGIBLE discovered only after selection",
    "duplicate discovered after selection (same publication family as an already-selected or already-frozen-corpus unit)",
  ] as const,
  illegitimateReasons: [
    "DRA performs poorly, produces an unfavourable decision, or is difficult to process after successful acquisition and representation",
  ] as const,
  retryProtocol: {
    maxAttempts: 3,
    schedule: "Attempts at t=0, t=+60s, t=+300s from first failure; a persistent failure across all 3 attempts, or an explicit permanent-failure signal (e.g. HTTP 404/410), qualifies as EXTERNAL_ACQUISITION_FAILURE without further attempts.",
    evidenceRetained: "Every attempt's timestamp, HTTP status/error, and request identity are logged and retained, exactly as for a legitimate DRA-ACQ acquisition attempt.",
  },
  originalDrawReported: true,
  replacementSourceRule: "Drawn from the same stratum using the same predetermined seeded selection procedure (next un-drawn frame position in that stratum's shuffled order), never a fresh manual pick.",
  postAcquisitionFailureNeverReplaced: true as const,
} as const;

// ---------------------------------------------------------------------------
// Section 12/13 — blindness and oracle strategy
// ---------------------------------------------------------------------------

export const BLINDNESS_RULES = {
  preSelectionRule:
    "No document may be inspected, by a human or by any DRA tooling, for the purpose of predicting or assessing likely DRA performance before it is locked into the selected sample manifest (Section 18).",
  permittedPostSelectionInspection: [
    "GOVERNANCE_INELIGIBLE verification (licence/official-source confirmation)",
    "oracle/ground-truth assessment for adjudicated endpoints",
    "failure classification under the fixed taxonomy (Section 10)",
  ] as const,
  postSelectionInspectionMustNotChangeCandidate: true as const,
  humanJudgementMustBeRecorded: true as const,
} as const;

export const ORACLE_STRATEGY = {
  automaticEndpoints: [
    "ACQUISITION_SUCCESS_RATE",
    "PIPELINE_COMPLETION_RATE",
    "PROOF_INTEGRITY_RATE",
    "DETERMINISM_REPEATABILITY_RATE",
    "DECISION_DISTRIBUTION",
    "ISSUE_CLASS_DISTRIBUTION",
  ] as const,
  requiresIndependentReference: [
    "REPRESENTATION_SUCCESS_RATE (spot-checked against publisher-provided structured HTML/table-of-contents/visual layout where available, not exhaustively re-keyed by hand)",
    "SEMANTIC_EVALUATOR_FAILURE classification (requires blinded adjudication against a predefined rubric derived from the issue-class specification)",
  ] as const,
  adjudicationRules: {
    blinded: true,
    predefinedRubric: true,
    dualReviewForHighImpactFailures: true,
    disagreementHandling: "A single adjudicator disagreement on a PRIMARY-endpoint-relevant classification triggers mandatory second review; unresolved disagreement is recorded as UNCLASSIFIED with both readings disclosed, never silently resolved in DRA's favour.",
  },
} as const;

// ---------------------------------------------------------------------------
// Section 15 — success criteria (interpretation bands, not a single pass/fail score)
// ---------------------------------------------------------------------------

export const SUCCESS_CRITERIA_BANDS = [
  { endpoint: "PIPELINE_COMPLETION_RATE", band: "No single aggregate threshold; report the observed rate with its 95% CI. A rate below the CI lower bound of the frozen development-corpus completion rate (34/34 = 100%) is reported as a finding requiring investigation, not an automatic FAIL." },
  { endpoint: "PROOF_INTEGRITY_RATE", band: "Any PROOF_INTEGRITY_FAILURE is reported individually regardless of overall rate — proof integrity is treated as effectively a hard requirement, not a graded score, since it underlies every other claim's auditability." },
  { endpoint: "MATERIAL_FAILURE_RATE", band: "Reported with its 95% CI; no predeclared numeric pass/fail line, because the consequence of a PIPELINE_FAILURE differs materially from a DETERMINISM_FAILURE or a SEMANTIC_EVALUATOR_FAILURE — each is reported and discussed on its own terms." },
  { endpoint: "KNOWN_LIMITATION_ENCOUNTER_RATE", band: "Purely descriptive; a high rate here is expected and does not indicate GC-1 failure, but must not be silently merged into the material-failure denominator." },
] as const;

// ---------------------------------------------------------------------------
// Section 16 — GC-1 immutability binding and stopping rule
// ---------------------------------------------------------------------------

export const STOPPING_RULES = {
  candidateIdentityMismatch:
    "Before every execution batch, recompute the live GC-1 aggregate digest (dra-gc-1-freeze-manifest.ts computeAggregateDigest()) and compare to BOUND_CANDIDATE_DIGEST. On any mismatch: STOP immediately, do not continue under the DRA-GC-1 label, and do not proceed with GEN-001 until the discrepancy is resolved (either the digest mismatch is a manifest bug fixed without touching frozen files, or GC-1 itself changed, which invalidates this protocol's binding entirely).",
  observationalToolingConstraint:
    "Any tooling added during GEN-001 execution must be demonstrably non-decision-affecting (does not alter evaluated representations, evaluator inputs, or outputs) before it may be used; if in doubt, treat it as decision-affecting and do not add it during execution.",
  severeStopConditions: [
    "A digest mismatch per above.",
    "Discovery that the sampling frame or selected sample was constructed with knowledge of DRA's likely performance on specific candidates.",
    "Discovery that a 'blind' document was, in fact, previously inspected by a DRA contributor (Section 12 breach).",
    "A SEMANTIC_EVALUATOR_FAILURE so severe that continuing to run the frozen evaluator on further documents would produce results known in advance to be invalid (e.g. a crash-inducing defect that would recur on every remaining document of a detectable type) — in this case, complete classification of already-run documents, halt further execution, and report DRA_GEN_001_PROTOCOL_NOT_READY-equivalent status for the run.",
  ] as const,
} as const;

// ---------------------------------------------------------------------------
// Section 18 — sequential contamination control
// ---------------------------------------------------------------------------

export const SEQUENTIAL_CONTAMINATION_CONTROL = {
  defaultOrdering:
    "Select and lock the entire blind sample (all n units, including a pre-reserved pool of replacement candidates per stratum) before evaluating the first selected document.",
  acquisitionSeparateFromEvaluation:
    "Acquisition/eligibility-reverification for the full locked sample is completed before any unit proceeds to GC-1 evaluation, so acquisition-stage learning cannot influence later evaluation-stage choices.",
  noEngineeringBetweenUnits: true as const,
  deferDetailedRootCauseEngineering:
    "Any root-cause engineering investigation into an observed failure is postponed until the full benchmark run is complete and reported; mid-benchmark investigation is limited to the classification required by Section 10.",
} as const;
