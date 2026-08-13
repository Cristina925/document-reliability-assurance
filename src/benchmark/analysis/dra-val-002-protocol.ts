/**
 * DRA-VAL-002 — Targeted English-HTML Blind Follow-Up (machine-readable protocol core)
 *
 * ADMINISTRATIVE RENUMBERING NOTICE: this programme was specified under the working name
 * "DRA-VAL-001 — Targeted English-HTML Blind Follow-Up". That identifier collides with the
 * already-entrenched, unrelated DRA-VAL-001A..F "Scientific Validation Charter" programme
 * (external human-reviewer corpus validation, docs/dra/validation/*). The user explicitly
 * approved renumbering this programme to DRA-VAL-002 to resolve the ID collision. This is a
 * PURELY ADMINISTRATIVE renumbering: every methodological requirement, boundary, endpoint,
 * freeze rule, and intended verdict from the original specification is preserved unchanged.
 * Nothing in this module, or in any file it imports, has any relationship whatsoever to the
 * DRA-VAL-001A..F Scientific Validation Charter programme.
 *
 * PURPOSE: obtain prospective blind evidence on frozen DRA-GC-1's behaviour on previously
 * unseen English-language HTML documents, specifically to address the HTML_ENGLISH stratum
 * that DRA-GEN-001 lost (all 25 GOV.UK/HTML-English sampled units drifted post-lock and were
 * excluded from Phase 2 execution, leaving that stratum NOT_TESTED_DUE_TO_STRATUM_LOSS in the
 * Post-Blind Evidence Review).
 *
 * SCOPE DISCIPLINE (must not broaden): this is a targeted, narrow, single-stratum repair
 * study. It does not test multilingual/Spanish/PDF documents, does not expand issue-class
 * coverage, does not test GC-2, and is not a new 100-document benchmark. It does not modify
 * DRA-GC-1, DRA-GEN-001 (frozen protocol, sample, or historical classifications), ENG-026, or
 * GC2-REV-001. It does not repair Stage 5 Spanish materiality semantics or revive the rejected
 * ENG-026 patch.
 *
 * See docs/dra/DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md for the full prose
 * specification this module encodes load-bearing commitments from.
 *
 * STATUS: DRAFT. No sample selection may begin while this module's `VAL002_PROTOCOL_STATUS`
 * is `"DRAFT"` — see dra-val-002-freeze-manifest.ts for the frozen identity and
 * dra-val-002-protocol-freeze-integrity.test.ts for the mechanical check.
 */

import { GC1_AGGREGATE_DIGEST, GC1_CANDIDATE_ID } from "./dra-gc-1-freeze-manifest";

// ---------------------------------------------------------------------------
// Protocol identity and status
// ---------------------------------------------------------------------------

export const PROTOCOL_ID = "DRA-VAL-002" as const;
/** The working-name identifier this programme was originally specified under; renumbered before any freeze. */
export const PROTOCOL_ORIGINAL_WORKING_ID = "DRA-VAL-001" as const;
export const PROTOCOL_RENUMBERING_REASON =
  "ID collision with the pre-existing, unrelated DRA-VAL-001A..F Scientific Validation Charter " +
  "programme (docs/dra/validation/*). Renumbering approved by the user; purely administrative — " +
  "no methodological content changed as a result." as const;
export const PROTOCOL_VERSION = "0.1.0-draft" as const;

export type ProtocolStatus = "DRAFT" | "FROZEN";
export const VAL002_PROTOCOL_STATUS: ProtocolStatus = "FROZEN";

export const BOUND_CANDIDATE_ID = GC1_CANDIDATE_ID;
export const BOUND_CANDIDATE_DIGEST = GC1_AGGREGATE_DIGEST;

// ---------------------------------------------------------------------------
// Section 1 — the frozen validation question (narrow, single-question scope)
// ---------------------------------------------------------------------------

export const VALIDATION_QUESTION =
  "How reliably does frozen DRA-GC-1 execute on previously unseen, eligible English-language " +
  "HTML documents under a prospectively defined source-freezing procedure?" as const;

export const OUT_OF_SCOPE_EXTENSIONS = [
  "Multilingual or Spanish-language validation",
  "PDF-format validation",
  "Issue-class-architecture expansion or modification",
  "DRA-GC-2 admission testing",
  "A new 100-document (or any full-scale) benchmark",
  "Repair or re-validation of the rejected ENG-026 Spanish Stage-5 correction",
  "Any modification to DRA-GC-1, DRA-GEN-001, ENG-026, or GC2-REV-001",
] as const;

// ---------------------------------------------------------------------------
// Section 2 — target population (prospective, before any candidate is inspected)
// ---------------------------------------------------------------------------

export const TARGET_POPULATION_DESCRIPTION =
  "English-language HTML documents published by an authoritative institutional publisher " +
  "(government body, statutory regulator, national statistics office, or comparable public " +
  "authority), GC-1-scope-compatible (regulatory, policy, legal/administrative, standards/ " +
  "guidance, technical, or public-sector statistical content), legally/governance-eligible " +
  "under an open licence or public-domain/lawful-use basis, substantive document-like HTML " +
  "(not a trivial landing, navigation, or listing page), and never previously inspected by any " +
  "DRA programme." as const;

export const EXCLUDED_POPULATIONS = [
  "All 33 GC-1 development-corpus documents and DRA-DOC-0033",
  "All 100 DRA-GEN-001 Phase-1 sample-frame/selected documents (all four strata, including the drifted HTML_ENGLISH stratum itself)",
  "All candidates in the DRA-GEN-001 considered-candidate registry (considered, discovered, or rejected during any DRA-ACQ/ENG/CHK/ROB/GEN discovery programme)",
  "All ENG-026 / GC2-REV-001 real-source probe examples",
  "Any source manually inspected for DRA suitability prior to this programme's frame construction",
  "Exact or near-duplicate documents of any of the above (same publication family)",
] as const;

// ---------------------------------------------------------------------------
// Section 3 — source-family diversity requirement
// ---------------------------------------------------------------------------

export type SourceFamilyId = "GOV_UK" | "ONS_GOV_UK" | "US_FEDERAL";

export interface SourceFamily {
  readonly id: SourceFamilyId;
  readonly description: string;
  readonly licenceBasis: string;
  readonly targetAllocation: number;
}

/**
 * Three distinct authoritative publisher/source families, none dominating. GOV.UK is included
 * (permitted, non-exclusive) but is explicitly not the sole family — this is exactly the design
 * choice GEN-001 lacked, which is how it lost the HTML_ENGLISH stratum to a single-family
 * (GOV.UK-only) post-lock drift event. US_FEDERAL spans multiple distinct agencies (EPA, FTC,
 * Census Bureau) under one shared licence basis (US federal public-domain work), so a
 * publisher-level drift or block at any single US agency cannot take out the whole family.
 */
export const SOURCE_FAMILIES: readonly SourceFamily[] = [
  {
    id: "GOV_UK",
    description: "UK GOV.UK (www.gov.uk) — statutory guidance, official statistics, and detailed guidance pages across multiple UK government departments.",
    licenceBasis: "Open Government Licence v3.0",
    targetAllocation: 0.34,
  },
  {
    id: "ONS_GOV_UK",
    description: "UK Office for National Statistics (www.ons.gov.uk) — a distinct domain/publisher from GOV.UK, statistical bulletins.",
    licenceBasis: "Open Government Licence v3.0",
    targetAllocation: 0.32,
  },
  {
    id: "US_FEDERAL",
    description: "US federal agencies (epa.gov, ftc.gov, census.gov) — law/regulation summaries and statistical-programme description pages.",
    licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)",
    targetAllocation: 0.34,
  },
] as const;

export const SOURCE_FAMILY_DIVERSITY_RULE =
  "At least 3 distinct authoritative publisher/source families are represented in the final " +
  "locked sample; no single family may account for more than 40% of the locked sample. GOV.UK " +
  "may be included but is capped like every other family — it is never the sole or dominant " +
  "source." as const;

// ---------------------------------------------------------------------------
// Section 4 — source identity model (selection-time identity vs. frozen bytes vs. live drift)
// ---------------------------------------------------------------------------

export const SOURCE_IDENTITY_MODEL = {
  selectionTimeIdentity:
    "The canonical URL, publisher, and title recorded at the moment a candidate is drawn into the frame.",
  evaluationInputIdentity:
    "The exact frozen raw bytes acquired and SHA-256-digested at sample-lock time. GC-1 evaluates " +
    "this locked representation, and only this representation, regardless of what happens to the " +
    "live page afterward.",
  liveSourceDrift:
    "A later observation that the live page's bytes differ from the locked bytes. This is recorded " +
    "as a provenance observation (Section 15) and is NEVER grounds to discard, replace, or " +
    "re-fetch a locked unit, and it is never silently substituted into evaluation. This is the " +
    "precise failure mode that caused DRA-GEN-001 to lose its HTML_ENGLISH stratum (that " +
    "programme's rule required content to still verify against a live re-fetch check, which page " +
    "content drift over time defeated); VAL-002 corrects this by evaluating the frozen bytes " +
    "directly and treating drift as observational only.",
} as const;

// ---------------------------------------------------------------------------
// Section 5 — HTML-freezing integrity fields (minimum, per document; fixed before selection)
// ---------------------------------------------------------------------------

export const HTML_FREEZING_INTEGRITY_FIELDS = [
  "canonicalUrl",
  "publisher",
  "title",
  "publicationOrVersionDate",
  "acquisitionTimestamp",
  "httpStatus",
  "redirectChain",
  "mediaType",
  "rawHtmlDigest",
  "normalisedRepresentationDigest",
  "byteSize",
  "language",
  "governanceEligibilityEvidence",
] as const;

export const EXTERNAL_RESOURCE_TREATMENT =
  "Only the primary HTML document response body is frozen and evaluated. Externally linked " +
  "resources (stylesheets, scripts, images, iframed content) are not fetched, not evaluated, and " +
  "not considered part of the unit of analysis — consistent with DRA's existing HTML-normalisation " +
  "contract (tag-strip/entity-decode of the fetched document body only). This rule is fixed here, " +
  "before any candidate is selected, and is not adjusted per-candidate." as const;

// ---------------------------------------------------------------------------
// Section 6 — eligibility criteria
// ---------------------------------------------------------------------------

export interface EligibilityCriterion {
  readonly id: string;
  readonly description: string;
}

export const ELIGIBILITY_CRITERIA: readonly EligibilityCriterion[] = [
  { id: "V1_OFFICIAL_SOURCE", description: "Publisher is a government body, statutory regulator, or national statistics office." },
  { id: "V2_LICENCE_OR_LAWFUL_USE", description: "Open Government Licence, public-domain status (17 U.S.C. §105), or equivalent lawful-use basis." },
  { id: "V3_MEDIA_TYPE_HTML_ONLY", description: "HTML only (no PDF — out of scope for this targeted repair study)." },
  { id: "V4_LANGUAGE_ENGLISH", description: "English language content only." },
  { id: "V5_ACCESSIBLE_WITHOUT_GATING", description: "Retrievable via direct HTTP(S) GET without login/CAPTCHA/paywall/persistent bot-block." },
  { id: "V6_MINIMUM_CONTENT", description: "At least 500 words of extractable normalised text (same floor as DRA-GEN-001)." },
  { id: "V7_NOT_TRIVIAL_LANDING_PAGE", description: "Substantive document-like content (guidance, statistics, law/regulation summary, bulletin), not a navigation/listing/index page." },
  { id: "V8_DOCUMENT_IDENTITY", description: "Identifiable title, publisher, and a publication or version date." },
  { id: "V9_NOT_CONTAMINATED", description: "Not in the GC-1 development corpus, not in any DRA-GEN-001 frame/sample document, not in the GEN-001 considered-candidate registry, and not an ENG-026/GC2-REV-001 probe example." },
  { id: "V10_NO_DUPLICATE_IN_FRAME", description: "Canonical URL and publication family (publisher+title+edition) must not match any other frame entry." },
  { id: "V11_NO_PRIOR_HUMAN_INSPECTION", description: "No DRA contributor has inspected this specific document for the purpose of judging DRA suitability prior to frame construction." },
] as const;

// ---------------------------------------------------------------------------
// Section 7 — sample size (n=25, justified; not simply reused from GEN-001 without justification)
// ---------------------------------------------------------------------------

export interface SampleSizeOption {
  readonly n: number;
  readonly ciWidthAt90PctApprox: number;
  readonly ruleOfThreeUpperBoundIfZeroFailures: number;
  readonly recommendation: "MINIMUM_VIABLE" | "RECOMMENDED_PRIMARY" | "REJECTED_UNJUSTIFIED_COST";
  readonly note: string;
}

/**
 * Values computed directly from the same Wilson-score/rule-of-three formulas used by
 * gen-001-phase2/statistics.ts (wilsonInterval, ruleOfThreeUpperBound), evaluated at p=0.90
 * (matching GEN-001's own reference point) for the CI-width column, and at x=0 for the
 * rule-of-three column (representative of the target "clean pass" outcome this study is
 * powered to distinguish from a material failure rate).
 */
export const SAMPLE_SIZE_OPTIONS: readonly SampleSizeOption[] = [
  { n: 20, ciWidthAt90PctApprox: 24.6, ruleOfThreeUpperBoundIfZeroFailures: 0.15, recommendation: "MINIMUM_VIABLE", note: "If zero failures are observed, the true failure rate could still plausibly be as high as ~15% — too wide to credibly call the stratum gap closed on its own, but usable as a floor if acquisition proves difficult." },
  { n: 25, ciWidthAt90PctApprox: 22.4, ruleOfThreeUpperBoundIfZeroFailures: 0.12, recommendation: "RECOMMENDED_PRIMARY", note: "Matches DRA-GEN-001's original (lost) HTML_ENGLISH stratum allocation, which is independently justifiable here: it is the smallest size giving a rule-of-three upper bound (12%) tight enough to be a meaningful zero-failure result, while remaining acquirable across 3 source families without straining any single publisher (per V9/V10 no-duplicate-family constraints)." },
  { n: 30, ciWidthAt90PctApprox: 20.7, ruleOfThreeUpperBoundIfZeroFailures: 0.10, recommendation: "REJECTED_UNJUSTIFIED_COST", note: "Modestly tighter (10% vs 12% zero-failure bound) for 5 additional documents; the marginal acquisition cost across only 3 clean, non-dominating families is not justified without evidence n=25 is inconclusive." },
  { n: 40, ciWidthAt90PctApprox: 17.9, ruleOfThreeUpperBoundIfZeroFailures: 0.075, recommendation: "REJECTED_UNJUSTIFIED_COST", note: "Meaningfully tighter, but this is a targeted single-stratum repair study, not a new full benchmark; reserved as a future option if n=25 surfaces an inconclusive or borderline result." },
] as const;

export const RECOMMENDED_SAMPLE_SIZE = 25 as const;
export const SAMPLE_SIZE_JUSTIFICATION =
  "n=25 is selected because it is the smallest size that (a) gives a rule-of-three zero-failure " +
  "upper bound tight enough (12%) to be a credible 'no material failure observed' result, (b) can " +
  "be filled across 3 non-dominating source families without violating the no-duplicate-family " +
  "eligibility rule, and (c) happens to numerically match GEN-001's original HTML_ENGLISH stratum " +
  "allocation — a coincidence of the underlying Wilson-interval mathematics at this precision " +
  "target, not a decision to simply reuse 25 uncritically. See SAMPLE_SIZE_OPTIONS above for the " +
  "full comparison against n=20/30/40." as const;

// ---------------------------------------------------------------------------
// Section 8 — primary and secondary endpoints
// ---------------------------------------------------------------------------

export type EndpointTier = "PRIMARY" | "SECONDARY";

export interface Endpoint {
  readonly id: string;
  readonly tier: EndpointTier;
  readonly description: string;
}

export const ENDPOINTS: readonly Endpoint[] = [
  { id: "EVALUATION_COMPLETION_RATE", tier: "PRIMARY", description: "Proportion of the locked sample for which GC-1 completed evaluation without a PIPELINE_FAILURE or RUNNER_EXCEPTION." },
  { id: "DETERMINISM_RATE", tier: "PRIMARY", description: "Proportion of completed evaluations where Run A and Run B produced a substantively identical result (decision, issue classes, issue count)." },
  { id: "PROOF_INTEGRITY_RATE", tier: "PRIMARY", description: "Proportion of completed evaluations whose proof receipt independently re-verifies." },
  { id: "REPRESENTATION_MATERIALITY_FAILURE_RATE", tier: "PRIMARY", description: "Proportion of the locked sample where HTML acquisition/representation lost or distorted material information (a REPRESENTATION_FAILURE per Section 10)." },
  { id: "DECISION_DISTRIBUTION", tier: "SECONDARY", description: "Frequency of SUPPORTED/REVIEW/HOLD outcomes." },
  { id: "ISSUE_CLASS_DISTRIBUTION", tier: "SECONDARY", description: "Frequency of each observed issue class." },
  { id: "DOCUMENT_LENGTH_COMPLEXITY", tier: "SECONDARY", description: "Word count and structural complexity of each locked unit, descriptive only." },
  { id: "PUBLISHER_FAMILY_DISTRIBUTION", tier: "SECONDARY", description: "Count of locked units per source family (Section 3), confirming the diversity requirement was met in the realised sample, not just the target frame." },
  { id: "OBSERVED_POST_LOCK_SOURCE_DRIFT", tier: "SECONDARY", description: "Count of locked units whose live bytes, checked after evaluation, differ from the locked bytes (Section 4/15); descriptive provenance only, never grounds for re-evaluation." },
] as const;

export const ENDPOINT_SCOPE_NOTE =
  "None of the primary endpoints is 'SUPPORTED rate' — DECISION_DISTRIBUTION is deliberately " +
  "secondary/descriptive, since a REVIEW or HOLD decision on a genuinely ambiguous document is a " +
  "correct DRA outcome, not a system failure." as const;

// ---------------------------------------------------------------------------
// Section 9 — failure taxonomy (prospective, minimum set)
// ---------------------------------------------------------------------------

export type FailureCategory =
  | "ELIGIBILITY_FAILURE"
  | "SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK"
  | "REPRESENTATION_FAILURE"
  | "PIPELINE_FAILURE"
  | "DETERMINISM_FAILURE"
  | "PROOF_INTEGRITY_FAILURE"
  | "KNOWN_LIMITATION_ENCOUNTERED"
  | "SUCCESSFUL_EVALUATION"
  | "UNCLASSIFIED";

export interface FailureCategoryDefinition {
  readonly category: FailureCategory;
  readonly boundary: string;
  readonly appliesBeforeOrAfterLock: "BEFORE_LOCK_ONLY" | "AFTER_LOCK_ONLY" | "EITHER";
}

export const FAILURE_TAXONOMY: readonly FailureCategoryDefinition[] = [
  { category: "ELIGIBILITY_FAILURE", boundary: "A frame candidate fails a Section 6 eligibility criterion, discovered before or during acquisition, before sample lock.", appliesBeforeOrAfterLock: "BEFORE_LOCK_ONLY" },
  { category: "SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK", boundary: "A candidate cannot be fetched (network error, non-2xx status, bot-block) before sample lock.", appliesBeforeOrAfterLock: "BEFORE_LOCK_ONLY" },
  { category: "REPRESENTATION_FAILURE", boundary: "HTML acquisition/normalisation loses or distorts material information relative to the source (e.g. a materially different normalised-text meaning than the rendered page), discovered at or after lock.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "PIPELINE_FAILURE", boundary: "The frozen pipeline fails to complete evaluation on a locked, correctly-represented unit.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "DETERMINISM_FAILURE", boundary: "Run A and Run B on the identical frozen input produce a substantively different decision or issue set.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "PROOF_INTEGRITY_FAILURE", boundary: "The proof receipt cannot be independently re-verified.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "KNOWN_LIMITATION_ENCOUNTERED", boundary: "A previously declared GC-1 limitation (carried forward from GEN-001/ROB-002's known-defect ledger) manifests consistent with its documented failure mode.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "SUCCESSFUL_EVALUATION", boundary: "The unit completes acquisition, representation, evaluation, determinism check, and proof verification without any of the above.", appliesBeforeOrAfterLock: "AFTER_LOCK_ONLY" },
  { category: "UNCLASSIFIED", boundary: "Exceptional category for an outcome fitting no category above; requires mandatory disclosure, never used to quietly drop a result.", appliesBeforeOrAfterLock: "EITHER" },
] as const;

export const POST_LOCK_DRIFT_INVALIDATION_RULE =
  "Live source drift observed after lock (Section 15) NEVER, by itself, causes reclassification " +
  "of a unit into any failure category. Drift is reported purely under " +
  "OBSERVED_POST_LOCK_SOURCE_DRIFT." as const;

// ---------------------------------------------------------------------------
// Section 10 — replacement rules
// ---------------------------------------------------------------------------

export const REPLACEMENT_POLICY = {
  allowedBeforeLock: [
    "ELIGIBILITY_FAILURE",
    "SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK",
    "duplicate/contamination discovered after initial frame construction",
    "ungovernable licence/eligibility basis discovered on inspection",
  ] as const,
  forbiddenAfterLock: [
    "crash",
    "poor representation",
    "REVIEW/HOLD decision",
    "known limitation encountered",
    "an issue class appearing",
  ] as const,
  forbiddenAfterLockRationale:
    "These are DRA-performance RESULTS, not defects in sampling; replacing a validly-frozen unit " +
    "for any of them would be exactly the kind of after-the-fact cherry-picking this protocol " +
    "exists to prevent.",
  replacementSourceRule:
    "Drawn from the same source family using the same predetermined seeded selection procedure " +
    "(next un-drawn frame position in that family's shuffled order), never a fresh manual pick.",
} as const;

// ---------------------------------------------------------------------------
// Section 11 — blindness / contamination
// ---------------------------------------------------------------------------

export const CONTAMINATION_EXCLUSION_SOURCES = [
  "All 33 GC-1 development-corpus document IDs and DRA-DOC-0033 (GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS / GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID)",
  "The full DRA-GEN-001 considered-candidate registry (CONSIDERED_CANDIDATE_URLS / CONSIDERED_CANDIDATE_IDS), reused programmatically, not re-transcribed by hand",
  "All 100 DRA-GEN-001 Phase-1 frozen-sample source URLs (including the drifted HTML_ENGLISH stratum)",
  "Any URL manually inspected during this VAL-002 discovery process for reachability/eligibility screening (recorded in the VAL-002-specific exclusion additions, since screening for HTTP-reachability/word-count is a permitted pre-selection check, not a DRA-performance inspection, but every URL touched is still tracked for full auditability)",
] as const;

export const CONTAMINATION_POLICY =
  "Zero overlap is required between the final locked VAL-002 sample and any of the " +
  "CONTAMINATION_EXCLUSION_SOURCES. Exclusion is applied programmatically (URL/ID set " +
  "membership checks), not by hand-curated ad hoc lists." as const;

// ---------------------------------------------------------------------------
// Section 12 — sampling frame / selection procedure (strict order)
// ---------------------------------------------------------------------------

export const SAMPLING_FRAME_SELECTION_PROCEDURE = [
  "1. Construct the eligible frame: enumerate candidate URLs from the 3 source families (Section 3) via each publisher's public search/content interface or documented publication index.",
  "2. Apply contamination exclusions (Section 11) programmatically.",
  "3. Apply metadata-level eligibility (Section 6 criteria not requiring a fetch: title, date, language, media type).",
  "4. Assign stable frame IDs (VAL002-<FAMILY>-<slug>).",
  "5. Stratify by source family (Section 3 allocations).",
  "6. Apply seeded, deterministic random selection within each family (mulberry32 PRNG, same algorithm as DRA-GEN-001, seeded from a fixed literal string recorded before the frame's contents are known).",
  "7. Freeze all selected inputs (live fetch, SHA-256 of raw bytes, word-count/content eligibility check).",
  "8. Lock the final sample manifest and compute its canonical digest.",
] as const;

export const NO_PERFORMANCE_INSPECTION_DURING_FRAME_CONSTRUCTION =
  "GC-1 is never invoked, and no DRA-performance signal of any kind is consulted, during frame " +
  "construction or selection. The only inspections performed are HTTP reachability, word count, " +
  "and licence/eligibility verification — the same class of check DRA-GEN-001's own Phase 1 " +
  "permitted." as const;

// ---------------------------------------------------------------------------
// Section 13 — protocol freeze / sample lock verdict identifiers
// ---------------------------------------------------------------------------

export const PROTOCOL_FROZEN_VERDICT = "DRA_VAL_002_PROTOCOL_FROZEN" as const;
export const SAMPLE_LOCKED_VERDICT = "DRA_VAL_002_SAMPLE_LOCKED" as const;

// ---------------------------------------------------------------------------
// Section 14 — statistical analysis plan
// ---------------------------------------------------------------------------

export const STATISTICAL_ANALYSIS_PLAN =
  "For each PRIMARY endpoint: report numerator/denominator, point estimate, 95% Wilson score " +
  "interval (reusing gen-001-phase2/statistics.ts's wilsonInterval/computeRateEndpoint " +
  "unchanged), and — when the observed numerator is 0 — the rule-of-three 95%-confidence upper " +
  "bound (ruleOfThreeUpperBound). Break out every endpoint by source family. VAL-002's " +
  "denominators are never pooled with DRA-GEN-001's; the two are reported as separate " +
  "experiments (narrative/meta-analytic synthesis, if any, is a distinct later step, not part of " +
  "this programme's statistical reporting)." as const;

// ---------------------------------------------------------------------------
// Section 15 — live-drift observation (optional, secondary, post-evaluation only)
// ---------------------------------------------------------------------------

export const LIVE_DRIFT_OBSERVATION_POLICY =
  "After Run A/Run B results are safely written to disk, optionally re-fetch each locked unit's " +
  "live URL and compare live bytes to the locked SHA-256. Report counts unchanged/drifted and " +
  "whether GEN-001's old reacquisition-verification rule (which required a live-fetch digest " +
  "match at Phase 2 execution time) would have broken on any of these units. Never substitute " +
  "drifted bytes into any evaluation result already produced." as const;

// ---------------------------------------------------------------------------
// Section 16 — integrity tests (minimum, machine-verifiable)
// ---------------------------------------------------------------------------

export const INTEGRITY_TEST_IDS = [
  "GC1_DIGEST_UNCHANGED",
  "PROTOCOL_FROZEN_BEFORE_SAMPLE_SELECTION",
  "SAMPLE_LOCKED_BEFORE_EVALUATION",
  "CONTAMINATION_OVERLAP_IS_ZERO",
  "FINAL_SAMPLE_SIZE_MATCHES_PROTOCOL",
  "SOURCE_FAMILY_ALLOCATION_MATCHES_PROTOCOL",
  "EVERY_UNIT_HAS_VALID_FROZEN_SOURCE_DIGEST",
  "EVALUATOR_CONSUMES_FROZEN_INPUT_NOT_LIVE_BYTES",
  "NO_POST_LOCK_REPLACEMENT_FOR_DRA_PERFORMANCE",
  "RUN_A_RUN_B_COMPARISON_COMPLETE",
  "PROOF_RECEIPTS_VERIFIED_AS_REQUIRED",
  "AGGREGATE_STATISTICS_MATCH_CANONICAL_RESULT_DATA",
] as const;

// ---------------------------------------------------------------------------
// Section 17 — coverage / execution / readiness verdict vocabularies
// ---------------------------------------------------------------------------

export type CoverageVerdict =
  | "ENGLISH_HTML_GAP_CLOSED"
  | "ENGLISH_HTML_GAP_PARTIALLY_CLOSED"
  | "ENGLISH_HTML_GAP_NOT_CLOSED";

export type ExecutionVerdict = "DRA_VAL_002_COMPLETE" | "DRA_VAL_002_STOPPED";

export type ReadinessVerdict = "READY_FOR_FINAL_EVIDENCE_SYNTHESIS" | "ADDITIONAL_TARGETED_EVIDENCE_REQUIRED";

export const RELATIONSHIP_TO_GEN_001_NOTE =
  "This programme repairs GEN-001's HTML_ENGLISH stratum-loss gap only. It does not modify " +
  "GEN-001's frozen protocol, sample, or historical NOT_TESTED_DUE_TO_STRATUM_LOSS " +
  "classification; it supplies new, separate, prospective evidence addressing the same " +
  "population question that stratum was designed to answer." as const;

export const RELATIONSHIP_TO_SPANISH_STAGE_5_NOTE =
  "This programme has no bearing on ENG-026 or GC2-REV-001. If English HTML documents surface " +
  "any language/materiality issue, it is recorded against GC-1 normally (Section 9 taxonomy); " +
  "the accepted Spanish Stage-5 limitation and GC2-REV-001's DRA_GC_2_ADMISSION_REJECTED verdict " +
  "remain unchanged and are not reopened by this work." as const;
