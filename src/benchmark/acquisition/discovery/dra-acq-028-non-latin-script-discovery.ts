/**
 * DRA-ACQ-028 — Phase 1: Post-Currentness Robustness Gap Audit and
 * Candidate Discovery for DRA-DOC-0032
 *
 * CONTEXT — DRA-ACQ-027 and DRA-ENG-020/021/022 are complete and treated as
 * frozen. The corpus holds 31 admitted documents (DRA-DOC-0001-0031). This
 * module performs the required evidence-map reconstruction, gap ranking,
 * and candidate discovery for the 32nd document. It is READ-ONLY DISCOVERY.
 *
 * HARD BOUNDARY (verbatim from the ACQ-028 directive) — This module does
 * not freeze, admit, or evaluate DRA-DOC-0032. It does not modify
 * production/evaluator code. It does not begin remediation for any
 * capability gap it documents. It does not reopen ENG-020/021/022. It does
 * not start signature/key-management engineering. No candidate below was
 * fetched into, or run through, the DRA evaluator or any pipeline stage.
 *
 * CENTRAL FINDING — Every one of the 31 admitted documents is written in a
 * Latin-script language (English, Spanish, or French), and every parsing,
 * tokenisation, and pattern-matching rule anywhere in Stages 1-7
 * (normalisation, claim extraction, authority resolution, evidence linkage,
 * materiality assessment, consistency checking) has only ever been
 * exercised against whitespace-delimited Latin-alphabet text. This module's
 * central research question is whether DRA's regex/token-boundary-based
 * pipeline generalises to a document written in a non-Latin, non-
 * whitespace-delimited script, or whether it silently mis-segments,
 * silently drops, or silently misclassifies such content without raising
 * any error.
 *
 * Verified 2026-08-11 by direct exploration of
 * `lib/dra-reference/src/benchmark/corpus/registry.ts`,
 * `src/benchmark/evidence/corpus-data.ts`, and the acquisition test/report
 * trail for DRA-DOC-0001 through DRA-DOC-0031 (see
 * `docs/dra/DRA-ACQ-027-PHASE2-NIST-SP80053R4-REPORT.md` for the most
 * recent authoritative corpus-count confirmation).
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 31,
  priorClosedProgrammes:
    "DRA-ACQ-027 (version/supersession discovery and admission of DRA-DOC-0031) and DRA-ENG-020/021/022 " +
    "(currentness semantics, currentness evidence integrity, and the freeze-record integrity cutover) are " +
    "complete. Their evidence, artefacts, architectural decisions, and historical digests are treated as frozen " +
    "and are not reopened by this programme.",
  centralResearchQuestion:
    "Can DRA's pipeline generalise beyond whitespace-delimited Latin-script text? Every one of the 31 admitted " +
    "documents (and every regex/word-boundary rule built to parse them across Stages 1-7) has been exercised " +
    "exclusively against English, Spanish, or French — three languages that share a Latin alphabet, whitespace " +
    "word delimiting, and left-to-right directionality. This is a genuinely untested boundary, distinct from " +
    "'multilingual robustness' as previously exercised (DRA-ACQ-014 through DRA-ACQ-017, DRA-CHK-003/005, " +
    "DRA-ENG-012/013/014/014A), which varied vocabulary and grammar but never varied script or tokenisation " +
    "model.",
  distinguishingFromPriorMultilingualWork:
    "DRA-ACQ-014 through DRA-ACQ-017 and their companion checkpoints (DRA-CHK-003, DRA-CHK-005) and engineering " +
    "tickets (DRA-ENG-012, DRA-ENG-013, DRA-ENG-014, DRA-ENG-014A) established that DRA's EL-STANDARD-REF rule " +
    "has a documented English-lexical-coverage bias when the SAME Latin alphabet and whitespace tokenisation " +
    "are reused across languages. That work never asked whether the pipeline's underlying regex/\\b-boundary " +
    "assumptions survive a script with no whitespace between words (e.g. Japanese), a different letter-shape " +
    "model, or right-to-left directionality (e.g. Arabic). This is a new boundary, not another instance of the " +
    "already-demonstrated English-lexical-coverage pattern.",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO_CANDIDATE_MEETS_REQUIREMENTS is an explicitly acceptable Phase 1 outcome. This module does not lower " +
    "the evidentiary bar (unverifiable licence, unstable source, or a script variation that would not actually " +
    "exercise a materially different tokenisation path) merely to reach a 32nd corpus document.",
  engineeringConstraint:
    "Phase 1 is discovery only. This module and its companion test do not freeze, admit, or evaluate any " +
    "document; do not modify normalisation, claim extraction, authority resolution, evidence linkage, " +
    "materiality assessment, or consistency-check logic; do not reopen the ENG-020/021/022 currentness-integrity " +
    "work; and do not begin signature/key-management engineering for the disclosed unkeyed-SHA-256 limitation. " +
    "Any capability gap discovered is documented here for a possible Phase 2 experiment, not acted on now.",
});

// ---------------------------------------------------------------------------
// Part 2 — Robustness evidence map through Document 31
// ---------------------------------------------------------------------------
//
// Classification values, per the ACQ-028 directive:
//   NOT_TESTED | PARTIALLY_TESTED | TESTED_NO_GAP | GAP_DEMONSTRATED |
//   ENGINEERED_AND_CLOSED | KNOWN_LIMITATION_ACCEPTED
//
// "Exposure" (a feature merely appeared in a document) is explicitly
// distinguished from "demonstrated capability" (an experiment specifically
// targeted the dimension and produced an interpretable pass/fail result).

export const EVIDENCE_MAP_CLASSIFICATIONS = [
  "NOT_TESTED",
  "PARTIALLY_TESTED",
  "TESTED_NO_GAP",
  "GAP_DEMONSTRATED",
  "ENGINEERED_AND_CLOSED",
  "KNOWN_LIMITATION_ACCEPTED",
] as const;
export type EvidenceMapClassification = (typeof EVIDENCE_MAP_CLASSIFICATIONS)[number];

export const FAILURE_BOUNDARY_STAGES = [
  "SOURCE_ACQUISITION",
  "REPRESENTATION_EXTRACTION",
  "NORMALISATION",
  "FREEZE_GOVERNANCE",
  "STAGE_1_7_EVALUATION",
  "PROOF_INTEGRITY",
  "NOT_APPLICABLE_NO_GAP",
] as const;
export type FailureBoundaryStage = (typeof FAILURE_BOUNDARY_STAGES)[number];

export interface RobustnessDimensionRecord {
  readonly dimension: string;
  readonly classification: EvidenceMapClassification;
  readonly likelyFailureBoundary: FailureBoundaryStage;
  readonly evidence: string;
  readonly exposureVsDemonstratedNote: string;
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return Object.freeze(value) as T;
  }
  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
    return Object.freeze(value) as T;
  }
  return value;
}

export const ROBUSTNESS_EVIDENCE_MAP: readonly RobustnessDimensionRecord[] = deepFreeze<RobustnessDimensionRecord[]>([
  {
    dimension: "footnotes/endnotes",
    classification: "GAP_DEMONSTRATED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "DRA-ACQ-009 (BCBS d516) and DRA-ACQ-020/DRA-BMK-023 (CRS R48555) both confirmed footnote-flattening at " +
      "extraction — footnote markers/text are absorbed into ordinary body-text flow with no anchor preserved. " +
      "DRA-ACQ-020 Phase 2 additionally showed this extraction defect does NOT reliably cascade into a decision-" +
      "level failure (prose style determines whether the flattened footnote content trips Stage 5 materiality), " +
      "so the gap is demonstrated at extraction but only sometimes at decision level.",
    exposureVsDemonstratedNote:
      "Genuinely demonstrated (not mere exposure): DRA-ACQ-020 Phase 2 ran a direct evaluateDocument() " +
      "structural-analysis experiment specifically isolating footnote handling, not an incidental observation.",
  },
  {
    dimension: "tables and tabular semantics",
    classification: "KNOWN_LIMITATION_ACCEPTED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "DRA-ACQ-021 Phase 2 (EIA STEO) demonstrated that visual-only cell shading (the sole encoding of historical " +
      "vs. forecast status) is silently lost at text extraction. DRA-ENG-015 built a general representation-" +
      "boundary DETECTOR (pdftocairo-SVG fill-colour-diversity signal, 0/15 corpus false-positive rate) that " +
      "flags this class of loss as BOUNDED, but does not and cannot recover the shading semantics themselves.",
    exposureVsDemonstratedNote:
      "Demonstrated via a dedicated robustness experiment (ACQ-021 Phase 2), not incidental exposure. The " +
      "detection capability is engineered and closed (ENG-015); the underlying extraction limitation itself is " +
      "an accepted, disclosed boundary, not a fixed defect.",
  },
  {
    dimension: "multi-column layout",
    classification: "NOT_TESTED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "No acquisition or engineering programme through DRA-DOC-0031 specifically targeted multi-column reading " +
      "order. Several PDFs in the corpus may incidentally contain multi-column regions, but no experiment " +
      "isolated reading-order corruption as the tested variable.",
    exposureVsDemonstratedNote:
      "No demonstrated evidence either way; this is a genuine gap in the evidence base, not merely an " +
      "unresolved finding.",
  },
  {
    dimension: "very large documents / scalability",
    classification: "ENGINEERED_AND_CLOSED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "DRA-ACQ-026 Phase 2 measured O(n^2) Stage 4 (Evidence Linkage) scaling on a ~25,600-statement document " +
      "(35-45 minutes). DRA-ENG-019 traced the root cause to per-call source re-derivation, applied a WeakMap-" +
      "by-reference caching fix with an exactness proof, and reduced the same evaluation to under 5 seconds " +
      "(O(n^2) -> O(n)), with no version bump required.",
    exposureVsDemonstratedNote:
      "Fully demonstrated and closed with a measured before/after and a correctness proof, not exposure.",
  },
  {
    dimension: "scientific citations/references",
    classification: "ENGINEERED_AND_CLOSED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "DRA-ACQ-022 Phase 2 (PLOS ONE) found silent bracket-internal citation line-wrap loss (W1) and indirectly-" +
      "detectable reference-entry statement shredding at Stage 2 (W2). DRA-ENG-016 applied narrow fixes in " +
      "segment-content.ts for both, verified via DRA-DOC-0026 regression (VERIFIED_LINKAGE), and classified both " +
      "residual behaviours as BOUNDED. No generic citation-aware issue class exists; the fix is scoped to the " +
      "two demonstrated failure modes, not citation integrity in general.",
    exposureVsDemonstratedNote:
      "Demonstrated via a dedicated citation-linkage robustness experiment, with an engineered and regression-" +
      "tested fix, not exposure.",
  },
  {
    dimension: "legal authority/versioning",
    classification: "ENGINEERED_AND_CLOSED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "DRA-ACQ-027/DRA-ENG-020/021/022 confirmed a genuine capability gap (an authentic-but-superseded document " +
      "was indistinguishable from a current one), then closed it in three steps: currentness semantics " +
      "(ENG-020), a separate versioned currentnessAssertionDigest for evidence integrity (ENG-021), and a " +
      "versioned freezeRecordDigest V2 regime closing the residual strip-both-fields bypass (ENG-022). Ordinary " +
      "Stage 3 authority resolution (source classification, not currentness) has been exercised since the " +
      "earliest programme stages and shows TESTED_NO_GAP.",
    exposureVsDemonstratedNote:
      "Fully demonstrated and closed across a three-programme chain with a real closure experiment reusing " +
      "DRA-DOC-0030/0031; not exposure.",
  },
  {
    dimension: "document supersession/currentness",
    classification: "ENGINEERED_AND_CLOSED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "See legal authority/versioning above — this is the same closed chain (ACQ-027, ENG-020/021/022). Per the " +
      "ACQ-028 directive, this work is explicitly not reopened here.",
    exposureVsDemonstratedNote: "Fully demonstrated and closed; not exposure.",
  },
  {
    dimension: "scans/OCR/image-only content",
    classification: "KNOWN_LIMITATION_ACCEPTED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "DRA-ACQ-023 Phase 2 (GovInfo CHRG-87hhrg72535) admitted an OCR-scanned document and found two OCR-" +
      "specific defects (stamp-garbling and a second silent-incompleteness pattern) both silently absorbed as " +
      "ordinary content with no distinguishing signal. DRA-ENG-017 built representation-provenance and OCR-" +
      "fidelity as independent digest-excluded axes on the freeze record (font-embedding-status discriminator), " +
      "but explicitly classified OCR corruption DETECTION (not correction) as an ACCEPTED_LIMITATION.",
    exposureVsDemonstratedNote:
      "Demonstrated via a dedicated scan/OCR acquisition and engineering programme, not exposure. The " +
      "provenance/fidelity metadata is engineered; the underlying OCR-corruption problem itself remains an " +
      "accepted limitation by design.",
  },
  {
    dimension: "graphics/charts/diagrams where meaning is not represented textually",
    classification: "KNOWN_LIMITATION_ACCEPTED",
    likelyFailureBoundary: "REPRESENTATION_EXTRACTION",
    evidence:
      "DRA-ACQ-024 Phase 2 (flowchart topology) and DRA-ACQ-025 Phase 2 (non-redundant diagram) both confirmed " +
      "SILENT loss of graphically-encoded meaning (FALSE_TOPOLOGY and total diagram loss respectively). " +
      "DRA-ENG-018 built a 6-property graphical-semantic-completeness DETECTION model (raster-only scope), " +
      "closing three independent classification questions, but recovery of graphical semantics itself remains " +
      "outside DRA's representation model by design.",
    exposureVsDemonstratedNote:
      "Demonstrated via two dedicated acquisition/robustness experiments plus a detection-engineering closure, " +
      "not exposure.",
  },
  {
    dimension: "non-Latin scripts",
    classification: "NOT_TESTED",
    likelyFailureBoundary: "NORMALISATION",
    evidence:
      "All 31 admitted documents are written in English, Spanish, or French (confirmed by direct corpus/test-" +
      "fixture review, 2026-08-11) — three languages sharing a Latin alphabet, whitespace word delimiting, and " +
      "left-to-right directionality. No document in any script family outside Latin (CJK ideographic/kana " +
      "scripts, Arabic/Hebrew abjads, Cyrillic, Devanagari, Hangul, etc.) has ever been acquired, and no " +
      "engineering programme has examined whether Stage 1-7 regex/tokenisation rules (many of which rely on the " +
      "\\b word-boundary metacharacter, itself already shown at DRA-ENG-012/DRA-CHK-005 to have language-specific " +
      "false-positive/false-negative behaviour even WITHIN Latin script) survive a script with no whitespace " +
      "word delimiting or a different directionality model.",
    exposureVsDemonstratedNote:
      "This is a genuine, undemonstrated gap, not merely 'not yet prioritised' — no document has ever exposed " +
      "the pipeline to non-Latin text at any stage.",
  },
  {
    dimension: "mixed-language documents (single document, multiple languages)",
    classification: "NOT_TESTED",
    likelyFailureBoundary: "NORMALISATION",
    evidence:
      "DRA-ACQ-014 through DRA-ACQ-017 and DRA-CHK-003/005 tested cross-DOCUMENT language variation (parallel " +
      "English/Spanish/French document pairs, e.g. DRA-DOC-0017/0018, DRA-DOC-0018/0021), never a single " +
      "document with internally mixed languages or code-switching. This is a distinct condition: a single " +
      "normalisation/tokenisation pass must handle a language boundary mid-document rather than a document-level " +
      "language tag selecting one consistent ruleset.",
    exposureVsDemonstratedNote:
      "The cross-document language-pair work is real demonstrated evidence for a related but different question. " +
      "It does not constitute evidence for the single-document mixed-language condition, which remains untested.",
  },
  {
    dimension: "complex HTML",
    classification: "TESTED_NO_GAP",
    likelyFailureBoundary: "NOT_APPLICABLE_NO_GAP",
    evidence:
      "DRA-ACQ-006 (ICO), DRA-ACQ-012 (HSE), and DRA-ACQ-016 (CNIL) each specifically targeted hidden multi-page " +
      "HTML / Cloudflare-dynamic-HTML reconstruction, each producing a TEXT_STABLE (with a disclosed Cloudflare " +
      "caveat) or successfully-admitted result with no unresolved defect carried forward.",
    exposureVsDemonstratedNote: "Genuinely demonstrated across three separate acquisition experiments, not exposure.",
  },
  {
    dimension: "appendices/annexes",
    classification: "PARTIALLY_TESTED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "DRA-ACQ-024 Phase 2 found that an appendix-checklist's redundant content could recover a flowchart's " +
      "topology, flipping the verdict from MATERIAL_UNRECOVERABLE to MATERIAL_BOUNDED. This is one instance of " +
      "appendix-mediated recoverability, not a general characterisation of how DRA handles appendix/annex " +
      "relationships (e.g. cross-references, appendix-only definitions, or appendix supersession of main-body " +
      "text).",
    exposureVsDemonstratedNote:
      "One targeted, demonstrated data point, explicitly not generalised into a closed finding by the source " +
      "programme itself.",
  },
  {
    dimension: "multiple evidence sources (single evaluation citing >1 independent authoritative source)",
    classification: "PARTIALLY_TESTED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "Several early corpus documents (DRA-DOC-0001, 0003, 0004, 0005) cite more than one external standard " +
      "(e.g. ISO 31000 + ISO 45001) within a single document, and Stage 3/4 correctly links statements to " +
      "distinct sources. However, no experiment specifically stress-tested a document where two AUTHORITATIVE " +
      "documents (as opposed to one document plus its cited standards) must be jointly reconciled, nor a case " +
      "where two evidence sources conflict.",
    exposureVsDemonstratedNote:
      "Real exposure exists (multiple citations are ordinary in the corpus), but no dedicated experiment has " +
      "isolated multi-source evidence reconciliation as the tested variable — this is exposure, not a targeted " +
      "demonstration.",
  },
  {
    dimension: "provenance",
    classification: "PARTIALLY_TESTED",
    likelyFailureBoundary: "FREEZE_GOVERNANCE",
    evidence:
      "DRA-ENG-017 added representation-provenance and OCR-fidelity as independent freeze-record axes " +
      "(requesterMetadata propagation channel). This addresses provenance narrowly in the OCR/scan context. " +
      "Broader provenance questions (e.g. chain of custody through republication, mirrors, or translation) " +
      "remain untested.",
    exposureVsDemonstratedNote:
      "Engineered for one narrow sub-case (OCR/scan fidelity); the wider provenance concept is only partially " +
      "addressed.",
  },
  {
    dimension: "compound/extreme documents combining several weaknesses",
    classification: "NOT_TESTED",
    likelyFailureBoundary: "STAGE_1_7_EVALUATION",
    evidence:
      "DRA-ACQ-013 Phase 1 explicitly established the discipline of not confounding two new variables in one " +
      "acquisition (publisher + language). Every subsequent acquisition through DRA-DOC-0031 deliberately " +
      "isolated a single new variable. No document has combined two or more already-demonstrated weaknesses " +
      "(e.g. OCR scan + footnotes, or multi-column + tables) to test whether they compound or interact.",
    exposureVsDemonstratedNote:
      "This is a genuine, deliberately-deferred gap, not an oversight — the corpus's single-variable discipline " +
      "is itself a documented methodological choice (DRA-ACQ-013), not evidence that compounding is safe.",
  },
]);

// ---------------------------------------------------------------------------
// Part 3 — Ranking methodology and result
// ---------------------------------------------------------------------------

export const RANKING_CRITERIA_ORDER = [
  "POTENTIAL_IMPACT_ON_TRUST_CLAIM",
  "PROBABILITY_IN_REAL_MACHINE_CONSUMED_DOCUMENTS",
  "EXISTING_CORPUS_EVIDENCE_ADEQUACY",
  "ABILITY_TO_CONSTRUCT_CLEAN_FALSIFIABLE_EXPERIMENT",
  "ABILITY_TO_OBTAIN_AUTHORITATIVE_GROUND_TRUTH",
  "GOVERNANCE_LICENSING_FEASIBILITY",
  "ACQUISITION_STABILITY_REPRODUCIBILITY",
  "INCREMENTAL_INFORMATION_PER_EXECUTION_COST",
  "GENUINELY_NEW_BOUNDARY_VS_KNOWN_LIMITATION_INSTANCE",
] as const;

export interface RankedGap {
  readonly dimension: string;
  readonly rank: number;
  readonly rationale: string;
}

export const RANKED_REMAINING_GAPS: readonly RankedGap[] = deepFreeze<RankedGap[]>([
  {
    dimension: "non-Latin scripts",
    rank: 1,
    rationale:
      "Highest-ranked on nearly every criterion: (1) impact is structural, not cosmetic — the majority of real-" +
      "world machine-consumed documents worldwide are not in Latin script (Chinese, Japanese, Korean, Arabic, " +
      "Cyrillic, Devanagari and more collectively vastly outnumber Latin-script documents); (2) probability of " +
      "occurrence in real machine-consumed corpora is very high; (3) existing corpus evidence (three Latin-" +
      "script languages) does not address it at all — this is a true NOT_TESTED gap, not a weak instance of a " +
      "tested one; (4) a clean falsifiable experiment is constructible by pairing a native-script document with " +
      "an official same-publisher translation as independent ground truth (the pattern already validated at " +
      "DRA-ACQ-017/DRA-BMK-021 for Latin-script parallel pairs); (5) authoritative ground truth is obtainable " +
      "where an official translation exists; (6)-(7) governance/stability are assessed per-candidate below; (8) " +
      "information gain is very high relative to cost, since this reuses the already-built parallel-language " +
      "comparison methodology; (9) this is unambiguously a genuinely new boundary — no prior programme has " +
      "touched script or tokenisation model, only vocabulary and grammar within Latin script.",
  },
  {
    dimension: "compound/extreme documents combining several weaknesses",
    rank: 2,
    rationale:
      "High potential impact (real documents often combine weaknesses, e.g. a scanned multi-column table), but " +
      "ranks below non-Latin scripts because DRA-ACQ-013 established that combining new variables in one " +
      "experiment destroys diagnostic clarity — a compound document would not cleanly attribute a failure to " +
      "one cause, weakening falsifiability (criterion 4) relative to the non-Latin-script candidate. Retained as " +
      "the second-highest priority for a FUTURE acquisition once individual dimensions are better characterised.",
  },
  {
    dimension: "mixed-language documents (single document, multiple languages)",
    rank: 3,
    rationale:
      "Genuinely untested and impactful, but narrower in probability of real-world occurrence than non-Latin " +
      "script generally, and partially overlaps in underlying mechanism (normalisation-stage language-boundary " +
      "handling) with the non-Latin-script candidate. Recommended as a natural following experiment once a " +
      "single foreign-script document has established a baseline.",
  },
  {
    dimension: "multiple evidence sources (single evaluation citing >1 independent authoritative source)",
    rank: 4,
    rationale:
      "Real gap with plausible impact on the eventual trust claim (DRA's proof receipts implicitly assume a " +
      "single evaluated document), but harder to construct a clean, falsifiable, authoritative-ground-truth " +
      "experiment for within Phase 1's discovery scope; deferred rather than rejected.",
  },
  {
    dimension: "multi-column layout",
    rank: 5,
    rationale:
      "A real, currently NOT_TESTED gap, but lower expected impact than non-Latin script: a multi-column reading-" +
      "order defect is a representation-extraction concern structurally similar to already-characterised table/" +
      "graphics representation-boundary problems (ENG-015/ENG-018), so the marginal new architectural insight is " +
      "assessed as smaller (criterion 9) even though the concrete instance would be new.",
  },
]);

export const HIGHEST_VALUE_GAP = "non-Latin scripts" as const;

// ---------------------------------------------------------------------------
// Part 4 — Candidate register
// ---------------------------------------------------------------------------

export const LICENCE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];

export const QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "REJECTED_LICENCE_UNCERTAIN",
  "REJECTED_INSTABILITY",
  "REJECTED_INSUFFICIENT_GROUND_TRUTH",
  "REJECTED_INACCESSIBLE",
] as const;
export type QualificationOutcome = (typeof QUALIFICATION_OUTCOMES)[number];

export interface NonLatinScriptCandidateRecord {
  readonly candidateId: string;
  readonly title: string;
  readonly publisher: string;
  readonly sourceUrl: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly languages: readonly string[];
  readonly script: string;
  readonly approxSize: string;
  readonly targetedDimension: string;
  readonly whyDocuments1To31DoNotAnswerThis: string;
  readonly expectedGroundTruth: string;
  readonly officialSourceStatus: string;
  readonly licenceBasis: string;
  readonly licenceStatus: LicenceStatus;
  readonly licenceEvidence: string;
  readonly fetchAccessibility: string;
  readonly preliminaryStability: string;
  readonly likelyAcquisitionCost: string;
  readonly successCriterion: string;
  readonly failureCriterion: string;
  readonly qualificationOutcome: QualificationOutcome;
  readonly rejectionReason: string | null;
  readonly rankingNotes: string;
}

export const CANDIDATE_REGISTER: readonly NonLatinScriptCandidateRecord[] = deepFreeze<NonLatinScriptCandidateRecord[]>([
  // --- Candidate 1: Japan Cabinet Office AI guideline (PRIMARY) ---
  {
    candidateId: "DRA-CAND-028-01",
    title:
      "人工知能関連技術の研究開発及び活用の適正性確保に関する指針 " +
      "(Guideline for Ensuring the Appropriateness of Research & Development and Utilization of " +
      "Artificial Intelligence-Related Technology)",
    publisher: "Cabinet Office, Government of Japan — Council for Science, Technology and Innovation (内閣府)",
    sourceUrl: "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_guideline.html",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["ja", "en (official provisional translation)"],
    script: "Japanese (kanji + hiragana + katakana; no inter-word whitespace; mixed with Arabic numerals)",
    approxSize:
      "Native Japanese PDF ~526 KB; a companion official 'provisional translation' English PDF (~250 KB) is " +
      "published side by side by the same publisher on the same page. Page count not yet measured (Phase 1 does " +
      "not fetch document bytes).",
    targetedDimension: "non-Latin scripts (script family: CJK ideographic/kana, zero inter-word whitespace)",
    whyDocuments1To31DoNotAnswerThis:
      "No document in the 31-document corpus contains any Japanese, or any script without whitespace word " +
      "delimiting. Japanese specifically stresses the sharpest form of the tokenisation question: DRA's \\b-" +
      "regex-based rules (already shown to be sensitive to word-boundary edge cases even within English/Spanish " +
      "at DRA-ENG-012 and DRA-CHK-005) assume whitespace marks token edges. Japanese text has no whitespace " +
      "between words at all, so any rule relying on \\b or naive whitespace splitting would either silently " +
      "produce degenerate (single-blob or single-character) tokens or silently fail to match anything.",
    expectedGroundTruth:
      "The publisher's own official English 'provisional translation', published on the same Cabinet Office page " +
      "as the Japanese original, gives an independent, authoritative, same-publisher statement-count and claim-" +
      "content baseline — the same parallel-document ground-truth method already validated at DRA-ACQ-017/DRA-" +
      "BMK-021 for Spanish/English, extended here to a genuinely non-Latin script pair.",
    officialSourceStatus:
      "Primary publisher domain (cao.go.jp, the Cabinet Office's own site); document is dated as a formal " +
      "'本部決定' (headquarters decision) of 令和7年12月19日 (2025-12-19), i.e. adopted roughly eight months before " +
      "this Phase 1 audit — a genuinely current, not archival, policy instrument.",
    licenceBasis:
      "Government of Japan Standard Terms of Use (Version 2.0) — the cross-government reuse licence applied " +
      "uniformly across Japanese central-government websites including cao.go.jp.",
    licenceStatus: "VERIFIED",
    licenceEvidence:
      "The Standard Terms of Use (Version 2.0) text (retrieved via its official English rendering, cross-" +
      "referenced against cao.go.jp/en/notice-e.html) states content 'may be freely used, copied, publicly " +
      "transmitted, translated or otherwise modified' subject to seven baseline conditions, and explicitly " +
      "states 'commercial use of Content is also permitted' — a reuse posture materially equivalent to CC BY, " +
      "already the accepted licence tier for DRA-DOC-0018/0020 (EU/French precedent). cao.go.jp's own English " +
      "notice page confirms adoption of this cross-government standard.",
    fetchAccessibility:
      "Both the Japanese-original and English-translation PDFs are directly linked from a plain (non-Cloudflare-" +
      "gated) cao.go.jp HTML page and returned content on direct fetch during Phase 1 discovery (2026-08-11); no " +
      "bot-blocking or JavaScript-rendering barrier observed, unlike several prior REJECTED candidates (OBR, " +
      "Ofwat, Ofcom, CDC MMWR).",
    preliminaryStability:
      "Not yet byte-hash-verified across two independent fetches (deferred to Phase 2, matching the established " +
      "Phase 1 convention of not performing acquisition-grade verification during discovery). The guideline is a " +
      "dated, versioned, formally-decided instrument (not a live-updated page), which is the stability profile " +
      "already associated with low volatility in this corpus (e.g. DRA-DOC-0009/0012).",
    likelyAcquisitionCost:
      "Low-to-moderate: two PDF fetches (native + translation) plus one acquisition/freeze/evaluation cycle, " +
      "comparable in scale to DRA-DOC-0017/0018 (English/Spanish parallel-pair admission), not comparable to the " +
      "large-document scale of DRA-DOC-0030/0031.",
    successCriterion:
      "Evidence of a capability gap: the Japanese-script evaluation silently produces materially fewer/more " +
      "extracted statements than the English-translation baseline would predict from the same content, OR any " +
      "Stage 2-6 regex-based rule (issue detection, authority resolution keyword matching, EL-STANDARD-REF-style " +
      "checks) demonstrably fails to fire, fires spuriously, or mis-tokenises Japanese text in a way traceable " +
      "to a specific rule's Latin-script/whitespace assumption.",
    failureCriterion:
      "Evidence the architecture generalises: Stage 1 normalisation and Stage 2 claim extraction produce a " +
      "statement count and structure proportionate to the English-translation baseline, with no rule silently " +
      "mis-firing due to a script- or whitespace-dependent assumption, and the final decision is not degraded " +
      "relative to what a structurally similar Latin-script POLICY document of comparable length would receive.",
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionReason: null,
    rankingNotes:
      "Strongest candidate: verified CC-BY-equivalent licence, direct non-gated fetch access, a formally current " +
      "(not archival) primary-publisher policy instrument, thematic continuity with the corpus's existing AI-" +
      "governance documents (DRA-DOC-0009/0010/0014/0015/0017/0018), and — critically — a built-in official " +
      "same-publisher English translation giving authoritative ground truth without requiring DRA to construct " +
      "its own reference translation.",
  },

  // --- Candidate 2: Korea KISDI AI-policy report (ALTERNATE) ---
  {
    candidateId: "DRA-CAND-028-02",
    title: "한국 AI 정책 현황 및 발전 방안: OECD AI 원칙을 중심으로 (Korea's AI Policy Status and Development Directions: Centred on the OECD AI Principles)",
    publisher: "Korea Information Society Development Institute (KISDI, 정보통신정책연구원) — government-funded research institute",
    sourceUrl: "https://kisdi.re.kr/report/fileView.do?arrMasterId=4334696&id=1875076&key=m2102058837181",
    documentType: "REPORT",
    domain: "GENERAL",
    languages: ["ko"],
    script: "Hangul (Korean alphabet; whitespace-delimited at the word/phrase level, distinct letter-shape model from both Latin and Japanese kanji/kana)",
    approxSize: "Short policy brief ('Perspectives' series, September 2025, No. 2), single-digit page count typical of this KISDI series.",
    targetedDimension: "non-Latin scripts, specifically the 'has whitespace but non-Latin alphabet' sub-case",
    whyDocuments1To31DoNotAnswerThis:
      "No Korean-language document exists in the corpus. Hangul is a useful isolating comparison against the " +
      "PRIMARY (Japanese) candidate: Korean uses whitespace to separate words/phrases (unlike Japanese), so a " +
      "Korean acquisition would isolate whether a demonstrated Japanese-script defect is caused specifically by " +
      "the ABSENCE of whitespace tokenisation, or more generally by non-Latin letterforms regardless of spacing.",
    expectedGroundTruth:
      "No official same-publisher parallel translation was found during Phase 1 search; ground truth would need " +
      "to be established either by commissioning/locating an independent Korean-English reference or by direct " +
      "statement-level manual review, a weaker evidentiary position than the PRIMARY candidate's built-in " +
      "official translation.",
    officialSourceStatus:
      "KISDI is a government-funded (not commercial) research institute under Korea's Ministry of Science and " +
      "ICT ecosystem, a materially similar governance tier to DRA-ACQ-020's Congressional Research Service " +
      "precedent (a government-funded research arm, not itself a legislating/regulating body).",
    licenceBasis: "Korea Open Government License (KOGL) — the standard licence family used across Korean public/" +
      "quasi-public institutional publications (Type 1: attribution required, commercial and derivative use " +
      "permitted), broadly CC-BY-equivalent.",
    licenceStatus: "PROVISIONAL",
    licenceEvidence:
      "KOGL Type 1 terms were confirmed generically (kogl.or.kr/info/licenseType1.do) as a CC-BY-equivalent " +
      "framework used by Korean public institutions, but the specific KOGL type marking on THIS PDF/report page " +
      "was not directly visible in the fetched content during Phase 1 and would need explicit per-document " +
      "confirmation before any Phase 2 acquisition — hence PROVISIONAL rather than VERIFIED.",
    fetchAccessibility:
      "The report page and PDF returned content on direct fetch (2026-08-11); no bot-blocking observed. The " +
      "extracted preview text showed visible OCR/encoding artefacts in numeric figures (garbled percentages and " +
      "digits) even at the search-snippet stage, which is itself a potentially interesting (if noisy) secondary " +
      "signal about Korean-script/number-mixed text extraction — but this needs controlled re-verification, not " +
      "reliance on a single fetch.",
    preliminaryStability: "Not yet byte-hash-verified across two independent fetches (deferred to Phase 2).",
    likelyAcquisitionCost: "Low: short single-digit-page brief, comparable in scale to DRA-DOC-0016/0022 rather " +
      "than a large document.",
    successCriterion:
      "Same structural test as the PRIMARY candidate (silent mis-tokenisation, spurious/missing rule firing), " +
      "evaluated instead against a manually-constructed or independently-sourced Korean-English reference given " +
      "the absence of a built-in official translation.",
    failureCriterion:
      "Same as PRIMARY, mutatis mutandis: proportionate extraction and no script-dependent rule mis-firing.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionReason: null,
    rankingNotes:
      "Independently viable and targets a genuinely informative sub-variant of the same top-ranked gap (non-" +
      "Latin script WITH whitespace tokenisation, as a controlled contrast to the PRIMARY candidate's WITHOUT-" +
      "whitespace case), but ranks behind the PRIMARY candidate because its licence status is only PROVISIONAL " +
      "and it lacks a built-in authoritative parallel translation for ground truth.",
  },
]);

export const REJECTED_CANDIDATES: readonly NonLatinScriptCandidateRecord[] = deepFreeze<NonLatinScriptCandidateRecord[]>([
  {
    candidateId: "DRA-CAND-028-03",
    title: "People's Republic of China central-government AI/technology policy documents (general category, no single title selected)",
    publisher: "Various PRC central-government ministries/agencies",
    sourceUrl: "N/A — rejected before URL-level candidate selection",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["zh (Simplified)"],
    script: "Han characters (Simplified Chinese; no inter-word whitespace, distinct from Japanese kanji usage and orthography)",
    approxSize: "Not assessed",
    targetedDimension: "non-Latin scripts",
    whyDocuments1To31DoNotAnswerThis: "Same as the PRIMARY candidate's rationale — no Chinese-script document exists in the corpus.",
    expectedGroundTruth: "Not assessed in detail; rejected on licence grounds before ground-truth research.",
    officialSourceStatus: "Would be primary-publisher (central-government) if a specific document were selected.",
    licenceBasis: "PRC government publications typically carry a general copyright-reserved notice; no cross-" +
      "government open-reuse licence equivalent to Japan's Standard Terms of Use, Taiwan's Open Government Data " +
      "License, or Korea's KOGL was identified during Phase 1 search.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "No affirmative, general-purpose reuse grant comparable to the OGL/CC-BY-equivalent precedents accepted " +
      "elsewhere in the corpus (DRA-DOC-0009 OGL, DRA-DOC-0018/0020 EU/French CC BY, this programme's Japan " +
      "candidate) was found for PRC central-government web publications during Phase 1 research.",
    fetchAccessibility: "Not assessed in detail given the licence rejection.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "No general-purpose reuse licence comparable to the corpus's existing OGL/CC-BY-equivalent precedents " +
      "could be identified for PRC central-government publications during Phase 1. Per DRA governance " +
      "discipline (do not waive licence requirements for an experimentally attractive candidate), this candidate " +
      "family was not pursued further. This would represent the largest concentration of non-Latin-script " +
      "machine-consumed real-world documents globally, so the negative result is recorded explicitly as useful " +
      "methodological evidence, not silently discarded.",
    rankingNotes: "Rejected on licence grounds before any specific document was selected.",
  },
  {
    candidateId: "DRA-CAND-028-04",
    title: "United Nations Arabic-language official documents (general category, no single title selected)",
    publisher: "United Nations (various organs)",
    sourceUrl: "https://media.un.org/en/copyright_use",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["ar"],
    script: "Arabic abjad (right-to-left directionality, no inter-word whitespace within cursive letter joining, distinct from every other candidate considered)",
    approxSize: "Not assessed",
    targetedDimension: "non-Latin scripts, specifically right-to-left directionality",
    whyDocuments1To31DoNotAnswerThis: "No RTL-script document exists in the corpus; would be the strongest single " +
      "test of directionality-dependent assumptions anywhere in DRA's normalisation/extraction pipeline.",
    expectedGroundTruth: "UN documents are typically published in all six official languages including English, " +
      "which would in principle give a strong parallel-translation ground truth if licensing permitted reuse.",
    officialSourceStatus: "Primary publisher (UN itself).",
    licenceBasis: "General UN copyright notice.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "UN Media's own copyright page states media content is '© United Nations, All rights reserved' for the " +
      "categories checked during Phase 1, and UN Publications' rights-and-permissions process requires an " +
      "affirmative permission request rather than granting a general reuse licence up front. This is a " +
      "materially more restrictive posture than every licence basis accepted so far in this corpus (public " +
      "domain, OGL, or explicit CC-BY-equivalent terms).",
    fetchAccessibility: "Not assessed in detail given the licence rejection.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "The general UN copyright/rights-and-permissions posture found during Phase 1 does not affirmatively grant " +
      "reuse rights comparable to this corpus's accepted precedents, and would require a specific, individually-" +
      "verified permission grant rather than a documented general licence. Recorded explicitly rather than " +
      "silently discarded because Arabic RTL script is the single strongest available test of directionality " +
      "assumptions and should be revisited if a specific UN body, or a national government publishing in " +
      "Arabic under a clearer open licence, is found in a future acquisition.",
    rankingNotes: "Rejected on licence grounds before any specific document was selected; the directionality " +
      "question itself remains unresolved and is not answered by either the PRIMARY or ALTERNATE candidate.",
  },
  {
    candidateId: "DRA-CAND-028-05",
    title: "Taiwan central-government open-data-licensed publications (general category, no single title selected)",
    publisher: "Various Taiwan central/local government agencies, under the Open Government Data License, version 1.0 (OGDL-Taiwan-1.0)",
    sourceUrl: "https://data.gov.tw/en/license",
    documentType: "OTHER",
    domain: "GENERAL",
    languages: ["zh (Traditional)"],
    script: "Han characters (Traditional Chinese; no inter-word whitespace)",
    approxSize: "Not assessed",
    targetedDimension: "non-Latin scripts",
    whyDocuments1To31DoNotAnswerThis: "Same rationale as the PRIMARY candidate — no Chinese-script document of " +
      "any kind exists in the corpus.",
    expectedGroundTruth: "Not established during Phase 1; no built-in official parallel translation identified " +
      "for a specific candidate document.",
    officialSourceStatus: "Would be primary-publisher if a specific document were selected.",
    licenceBasis: "Open Government Data License, version 1.0 (OGDL-Taiwan-1.0) — an affirmatively open, CC-BY-" +
      "compatible reuse licence confirmed at data.gov.tw/en/license.",
    licenceStatus: "VERIFIED",
    licenceEvidence:
      "data.gov.tw's own English licence page describes OGDL-Taiwan-1.0 in terms materially equivalent to CC BY " +
      "(attribution-only, commercial and derivative use permitted) — a genuinely strong licence basis, better " +
      "than the Korean ALTERNATE candidate's provisional status.",
    fetchAccessibility: "Not assessed in detail — see rejection reason.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before a specific document was qualified.",
    failureCriterion: "N/A — rejected before a specific document was qualified.",
    qualificationOutcome: "REJECTED_INSUFFICIENT_GROUND_TRUTH",
    rejectionReason:
      "The licence is genuinely strong (arguably the cleanest of any non-Latin-script candidate found), but " +
      "OGDL-Taiwan-1.0 governs Taiwan's OPEN DATA portal, whose contents (per the licence page's own framing) " +
      "are predominantly structured/tabular datasets rather than substantive prose POLICY/REPORT documents of " +
      "the kind this corpus otherwise contains, and no specific prose document with a built-in official " +
      "translation was identified during Phase 1 search. Recorded as a strong future candidate family — " +
      "specifically for a Traditional-Chinese script variant, contrasting with the PRC-Simplified rejection " +
      "above on licence grounds — should a suitable prose document with adequate ground truth be found in a " +
      "future acquisition.",
    rankingNotes:
      "Not rejected on licence grounds (the licence is VERIFIED-quality) — rejected specifically for lacking an " +
      "identified prose candidate document with adequate ground truth within Phase 1's search effort.",
  },
]);

export const PRIMARY_CANDIDATE_ID = "DRA-CAND-028-01" as const;
export const ALTERNATE_CANDIDATE_ID = "DRA-CAND-028-02" as const;
export const REJECTED_CANDIDATE_IDS = ["DRA-CAND-028-03", "DRA-CAND-028-04", "DRA-CAND-028-05"] as const;

export function getCandidateById(candidateId: string): NonLatinScriptCandidateRecord | undefined {
  return (
    CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId) ??
    REJECTED_CANDIDATES.find((c) => c.candidateId === candidateId)
  );
}

export function primaryCandidate(): NonLatinScriptCandidateRecord {
  const candidate = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!candidate) throw new Error("primary candidate missing from register");
  return candidate;
}

export function alternateCandidate(): NonLatinScriptCandidateRecord {
  const candidate = getCandidateById(ALTERNATE_CANDIDATE_ID);
  if (!candidate) throw new Error("alternate candidate missing from register");
  return candidate;
}

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record and Phase 2 scope proposal
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0032" as const;

export const PHASE_1_QUALIFICATION_OUTCOME = "QUALIFIED_RECOMMENDED" as const;

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  reservedCorpusId: RESERVED_NEXT_CORPUS_ID,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  highestValueGap: HIGHEST_VALUE_GAP,
  centralQuestionAnswered:
    "Whether DRA's Latin-script/whitespace-tokenisation-dependent pipeline generalises to a script with no " +
    "inter-word whitespace (Japanese) is not yet answered — this Phase 1 record only qualifies the candidate " +
    "for a future Phase 2 experiment; it does not run that experiment.",
});

export const PROPOSED_PHASE_2_SCOPE = Object.freeze({
  summary:
    "Acquire, freeze, and evaluate the Japan Cabinet Office AI guideline (DRA-CAND-028-01) as DRA-DOC-0032 " +
    "under the existing, unmodified governed-acquisition pipeline (including the V2 currentness-integrity " +
    "regime from DRA-ENG-022, applied without modification). Separately fetch the publisher's own official " +
    "English translation (not admitted as a corpus document, used only as an out-of-band ground-truth " +
    "reference) and compare its independently-known statement/claim structure against DRA's evaluation output " +
    "for the Japanese-script original.",
  explicitlyOutOfScope:
    "Normalisation, extraction, and every Stage 1-7 rule must not be modified during Phase 2 acquisition/admission " +
    "itself. " +
    "If Phase 2 confirms a capability gap, it should be documented (per the ACQ-027 -> ENG-020/021/022 " +
    "precedent) as a candidate for a SEPARATE, later engineering ticket — not remediated inline.",
  explicitNonGoal:
    "This programme does not reopen DRA-ENG-020/021/022, does not modify the V2 currentness-integrity cutover, " +
    "and does not begin signature/key-management engineering for the already-disclosed unkeyed-SHA-256 " +
    "limitation.",
});

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze({
  documentFrozen: false,
  documentAdmitted: false,
  documentEvaluated: false,
  productionCodeModified: false,
  remediationBegun: false,
  currentnessProgrammesReopened: false,
  signatureEngineeringStarted: false,
});
