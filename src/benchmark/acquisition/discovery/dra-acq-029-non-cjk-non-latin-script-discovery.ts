/**
 * DRA-ACQ-029 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0033 (non-Latin, non-CJK script robustness)
 *
 * CONTEXT — DRA-ACQ-028 (discovery), DRA-DOC-0032 admission, and DRA-ENG-023
 * (Unicode-aware segmentation/tokenisation closure) are complete and treated
 * as frozen. The corpus holds 32 admitted documents (DRA-DOC-0001-0032).
 * DRA-ENG-023 closed a script-blind ASCII-only PUNCTUATION_ONLY regex and a
 * Latin-only sentence-terminator set, verified against Japanese (DRA-DOC-0032,
 * CJK ideographic/kana, no inter-word whitespace). This module performs the
 * required out-of-family robustness audit: does the ENG-023 fix generalise
 * to script families ENG-023 never exercised — right-to-left abjads (Arabic,
 * Hebrew), Brahmic abugidas (Devanagari/Indic), or Cyrillic — or was it
 * narrowly tuned to CJK's specific properties (LTR, no letter-joining, ASCII-
 * shaped ideographic punctuation)?
 *
 * HARD BOUNDARY (verbatim from the ACQ-029 directive) — This module is
 * READ-ONLY DISCOVERY. It does not modify production code (segmentation,
 * classification, normalisation, or any other Stage 1-7 logic) even where it
 * identifies a concrete, well-understood defect (see the Devanagari danda
 * finding below). It does not fix any discovered defect. It does not create,
 * freeze, admit, or evaluate DRA-DOC-0033. Any capability gap found is
 * documented for a possible Phase 2 experiment, not acted on now.
 *
 * Verified 2026-08-11 by direct reading of `segment-content.ts` and
 * `classify-segments.ts`, and by running the real `segmentContent`/
 * `classifySegments` functions (via a disposable vitest scratch test,
 * removed after use) against real fetched Hindi (Devanagari) prose — see the
 * HYPOTHESIS_FINDINGS section below for the empirical results.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 32,
  priorClosedProgrammes:
    "DRA-ACQ-028 (discovery), the DRA-DOC-0032 admission (Japan Cabinet Office AI guideline), and DRA-ENG-023 " +
    "(Unicode segmentation closure: script-agnostic \\p{L}/\\p{N} substantive-content regex, 。！？ always-" +
    "boundary sentence terminators) are complete. Their evidence, artefacts, and the 32-document corpus are " +
    "treated as frozen and are not reopened by this programme.",
  centralResearchQuestion:
    "DRA-ENG-023's fix was designed and verified against a single non-Latin script family: Japanese CJK " +
    "(ideographic/kana, no inter-word whitespace, left-to-right, ASCII-shaped fullwidth punctuation). Does the " +
    "same fix generalise to script families with materially different properties that CJK does not exercise — " +
    "right-to-left directionality and cursive letter-joining (Arabic, Hebrew abjads), or a non-ASCII-shaped " +
    "sentence-terminator glyph combined with left-to-right joining but no case distinction and abugida " +
    "conjunct/matra composition (Devanagari and other Brahmic Indic scripts) — or was the fix narrowly tuned to " +
    "CJK's specific properties without being re-examined against a genuinely different script model?",
  distinguishingFromPriorWork:
    "DRA-ACQ-028/DRA-DOC-0032/DRA-ENG-023 answered the coarse question 'does DRA's pipeline survive ANY non-" +
    "Latin script' with one script family (CJK). This programme deliberately targets a script that is neither " +
    "Latin NOR CJK, so that a second, independent data point can distinguish 'the ENG-023 fix generalises to " +
    "non-Latin scripts broadly' from 'the ENG-023 fix happened to work for CJK's specific properties'. This is " +
    "the same out-of-family verification discipline already used at DRA-ACQ-012/DRA-BMK-016 (second multi-page-" +
    "HTML document) and DRA-ACQ-015 (second multilingual document): one instance never proves a pattern.",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO_CANDIDATE_MEETS_REQUIREMENTS is an explicitly acceptable Phase 1 outcome. This module does not lower " +
    "the evidentiary bar (unverifiable licence, unstable source, or a script variation that would not actually " +
    "exercise a materially different property from CJK) merely to reach a 33rd corpus document.",
  engineeringConstraint:
    "Phase 1 is discovery only. This module and its companion test do not freeze, admit, or evaluate any " +
    "document; do not modify segmentation, classification, normalisation, or any other Stage 1-7 logic even " +
    "where a concrete gap (the Devanagari danda finding, below) is identified; and do not reopen DRA-ENG-023. " +
    "Any capability gap discovered is documented here for a possible Phase 2 experiment, not fixed now.",
});

// ---------------------------------------------------------------------------
// Part 2 — Robustness evidence map (delta since DRA-ACQ-028)
// ---------------------------------------------------------------------------

export const EVIDENCE_MAP_CLASSIFICATIONS = [
  "NOT_TESTED",
  "PARTIALLY_TESTED",
  "TESTED_NO_GAP",
  "GAP_DEMONSTRATED",
  "ENGINEERED_AND_CLOSED",
  "KNOWN_LIMITATION_ACCEPTED",
] as const;
export type EvidenceMapClassification = (typeof EVIDENCE_MAP_CLASSIFICATIONS)[number];

export interface RobustnessDimensionRecord {
  readonly dimension: string;
  readonly classification: EvidenceMapClassification;
  readonly evidence: string;
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
    dimension: "non-Latin scripts — CJK ideographic/kana (no inter-word whitespace, LTR)",
    classification: "ENGINEERED_AND_CLOSED",
    evidence:
      "DRA-ACQ-028/DRA-DOC-0032 demonstrated a genuine gap (script-blind PUNCTUATION_ONLY regex, Latin-only " +
      "sentence terminators) and DRA-ENG-023 closed it (\\p{L}/\\p{N} script-agnostic content check, 。！？ " +
      "always-boundary terminators), verified by a full corpus regression (75.4%->0% Japanese content loss, " +
      "decision unchanged).",
  },
  {
    dimension: "non-Latin, non-CJK scripts — right-to-left abjads (Arabic, Hebrew)",
    classification: "NOT_TESTED",
    evidence:
      "No document in any RTL script has ever been acquired. DRA-ENG-023's fix was neither designed against nor " +
      "verified against RTL directionality or Arabic/Hebrew cursive letter-joining; the fix's script-agnosticism " +
      "is a property of the regex character classes used (\\p{L}/\\p{N}, which are directionality-blind by " +
      "construction) but this has not been empirically exercised end-to-end for an RTL document.",
  },
  {
    dimension: "non-Latin, non-CJK scripts — Brahmic abugidas (Devanagari and related Indic scripts)",
    classification: "PARTIALLY_TESTED",
    evidence:
      "This programme's Phase 1 reconnaissance (see HYPOTHESIS_FINDINGS below) ran the real segmentContent/" +
      "classifySegments functions against genuine fetched Devanagari (Hindi) prose from an official Supreme " +
      "Court of India translated judgment. H1 (substantive-content recognition) is TESTED_NO_GAP: 0 of 15 real " +
      "segments were excluded, and the \\p{L}/\\p{N} regex correctly matches Devanagari letters and digits " +
      "(१२३). H2 (sentence-boundary recognition) is GAP_DEMONSTRATED: the Devanagari danda (।, U+0964) and " +
      "double danda (॥, U+0965) — the abugida's own native sentence-terminator glyphs — are absent from " +
      "SENTENCE_TERMINATOR_CHARS, so a five-sentence Devanagari paragraph containing five dandas was returned " +
      "as a single unsplit segment. A second, previously undocumented artefact was also observed: an ASCII " +
      "period embedded in a Devanagari citation abbreviation (\"एस.सी.आर.\", the Hindi rendering of \"S.C.R.\") " +
      "was OVER-split into three fragments, because isSentenceBoundaryPeriod()'s abbreviation-suppression logic " +
      "(ABBREVIATION_SET, lowercase-Latin check) has no Devanagari-specific entries and Devanagari has no case " +
      "distinction to trigger the lowercase-follows suppression rule. This is marked PARTIALLY_TESTED rather " +
      "than fully closed because only sentence segmentation and content classification were exercised — Stage " +
      "3-7 rule behaviour (authority resolution, EL-STANDARD-REF-style keyword matching, issue detection) " +
      "against real Devanagari statements was not run in Phase 1 (that is explicitly a Phase 2 experiment).",
  },
  {
    dimension: "non-Latin, non-CJK scripts — Cyrillic",
    classification: "NOT_TESTED",
    evidence:
      "No document in Cyrillic script has ever been acquired. Cyrillic shares CJK's LTR directionality and has " +
      "a case distinction (unlike Devanagari), so it is expected to be the least differentiating of the three " +
      "candidate families relative to the already-closed Latin/CJK evidence, but remains formally untested.",
  },
  {
    dimension: "non-Latin scripts, generally (superseded framing)",
    classification: "PARTIALLY_TESTED",
    evidence:
      "DRA-ACQ-028's original 'non-Latin scripts' dimension is superseded by the four more granular rows above. " +
      "It is retained here only to record that the coarse-grained framing is no longer an accurate single " +
      "classification: CJK is closed, Devanagari is partially tested with one demonstrated gap, and RTL/" +
      "Cyrillic remain fully untested.",
  },
]);

// ---------------------------------------------------------------------------
// Part 3 — Hypotheses and Phase 1 empirical findings
// ---------------------------------------------------------------------------
//
// H1-H4 are the four hypotheses specified by the ACQ-029 directive. Per the
// Phase 1 hard boundary, H1/H2 below were tested by running the REAL
// segmentContent/classifySegments functions (via a disposable, since-removed
// vitest scratch test) against genuine fetched Devanagari prose — not
// against the eventual candidate document itself (no candidate document is
// fetched, frozen, or evaluated in Phase 1). H3/H4 are recorded as
// reconnaissance-informed expectations for the Phase 2 experiment design,
// not yet empirically settled.

export const HYPOTHESIS_STATUSES = [
  "CONFIRMED_NO_GAP",
  "GAP_CONFIRMED",
  "NOT_YET_TESTED",
  "NOT_APPLICABLE_TO_SELECTED_SCRIPT",
] as const;
export type HypothesisStatus = (typeof HYPOTHESIS_STATUSES)[number];

export interface HypothesisRecord {
  readonly id: string;
  readonly statement: string;
  readonly status: HypothesisStatus;
  readonly evidence: string;
}

export const HYPOTHESIS_FINDINGS: readonly HypothesisRecord[] = deepFreeze<HypothesisRecord[]>([
  {
    id: "H1",
    statement:
      "The ENG-023 script-agnostic substantive-content check (\\p{L}/\\p{N}) does not silently discard " +
      "legitimate content in the candidate script as PUNCTUATION_ONLY.",
    status: "CONFIRMED_NO_GAP",
    evidence:
      "Empirically confirmed against real fetched Devanagari (Hindi) prose: segmentContent() produced 15 " +
      "segments from a genuine Supreme Court of India translated-judgment excerpt, classifySegments() excluded " +
      "0 of them, and a direct regex probe confirmed /[\\p{L}\\p{N}]/u.test(\"१२३\") (Devanagari digits) is " +
      "true. This is the same property DRA-ENG-023 fixed for Japanese, now independently confirmed for a " +
      "structurally unrelated script family (abugida vs. ideographic/kana).",
  },
  {
    id: "H2",
    statement:
      "The ENG-023 sentence-terminator set (currently . ! ? 。！？) correctly recognises the candidate script's " +
      "own native sentence-boundary punctuation.",
    status: "GAP_CONFIRMED",
    evidence:
      "Empirically confirmed as a gap: SENTENCE_TERMINATOR_CHARS in segment-content.ts does not include the " +
      "Devanagari danda (।, U+0964) or double danda (॥, U+0965) — the actual native sentence-terminator glyphs " +
      "used throughout classical and modern Hindi prose (including the fetched real judgment text, which uses " +
      "। at the end of nearly every sentence). A real reconnaissance run showed a five-sentence Devanagari " +
      "paragraph (five internal dandas) returned as a single unsplit segment. A second, related artefact was " +
      "also observed: an ASCII period inside a Devanagari citation abbreviation was over-split, because the " +
      "abbreviation-suppression heuristic (ABBREVIATION_SET, lowercase-Latin-follows check) has no coverage for " +
      "Devanagari and Devanagari has no case distinction. This mirrors the already-documented \\b-word-boundary " +
      "English-lexical-coverage bias found at DRA-ENG-012/DRA-CHK-005, but for sentence-level rather than word-" +
      "level punctuation, and is not fixed here per the Phase 1 hard boundary.",
  },
  {
    id: "H3",
    statement:
      "Directionality (RTL vs. LTR) and cursive letter-joining (as in Arabic/Hebrew) introduce failure modes " +
      "distinct from CJK's no-whitespace, LTR, non-joining model.",
    status: "NOT_APPLICABLE_TO_SELECTED_SCRIPT",
    evidence:
      "Devanagari is left-to-right and whitespace-delimited at the word level (unlike CJK), so H3 is not " +
      "exercised by the Indic candidate. This confirms the ranking judgement (Part 4) that an Arabic/Hebrew " +
      "candidate would test a genuinely different property than the one qualified here — H3 remains an entirely " +
      "open question, not answered by this programme, and is recorded as the natural next-priority experiment " +
      "once a licence-qualified RTL candidate is found (none was, in this programme; see REJECTED_CANDIDATES).",
  },
  {
    id: "H4",
    statement:
      "Abugida-specific composition (conjunct consonant clusters, dependent vowel signs/matras, virama) does not " +
      "corrupt or get silently dropped during normalisation, unlike a simple alphabetic script.",
    status: "NOT_YET_TESTED",
    evidence:
      "Phase 1 reconnaissance confirmed segmentContent/classifySegments preserve conjunct/matra sequences intact " +
      "in the fetched sample (visual inspection of the returned segment text showed no replacement characters, " +
      "mojibake, or character-count mismatches against the source), but no dedicated normalisation-level " +
      "experiment (the kind DRA-CHK-005 ran for footnote-anchor pairing) has isolated matra/conjunct handling as " +
      "the tested variable. This is deferred to Phase 2, which will run the full acquireFreezeAndEvaluate " +
      "pipeline (not just segmentContent/classifySegments) against the qualified candidate.",
  },
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking methodology and result
// ---------------------------------------------------------------------------
//
// Extends DRA-ACQ-028's 9-criterion ranking with three criteria specific to
// the non-CJK, non-Latin discovery question (directionality/joining
// diversity, source structural suitability, and licence-basis strength
// independent of publisher government status — the last motivated directly
// by this programme's own finding that RBI and PIB, both Indian government
// publishers, carry materially different reuse postures).

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
  "DIRECTIONALITY_AND_JOINING_MODEL_DIVERSITY",
  "STRUCTURAL_SUITABILITY_OF_SOURCE_REPRESENTATION",
  "LICENCE_BASIS_STRENGTH_INDEPENDENT_OF_PUBLISHER_GOVERNMENT_STATUS",
] as const;
export type RankingCriterion = (typeof RANKING_CRITERIA_ORDER)[number];

export interface RankedScriptFamily {
  readonly scriptFamily: string;
  readonly rank: number;
  readonly rationale: string;
}

export const RANKED_SCRIPT_FAMILIES: readonly RankedScriptFamily[] = deepFreeze<RankedScriptFamily[]>([
  {
    scriptFamily: "Devanagari / Indic (Brahmic abugida)",
    rank: 1,
    rationale:
      "Ranks first not because it is the theoretically most differentiating script family (Arabic/Hebrew's " +
      "directionality reversal is arguably a sharper test), but because it is the only family for which this " +
      "programme could construct a candidate meeting every other criterion: (5) authoritative ground truth via " +
      "an official same-judicial-system English original with an explicit 'English is authoritative, regional-" +
      "language translation is for convenience only' disclaimer (a stronger, statutorily-grounded version of the " +
      "already-accepted pattern from Bank of Israel/Jordan CBJ, both of which were rejected here on licence " +
      "grounds); (6) a genuinely strong licence basis independent of ordinary government copyright policy " +
      "(Indian Copyright Act 1957 s.52(1)(q)(iv), a statutory exemption for judicial orders/judgments, verified " +
      "independently of any single ministry's discretionary reuse policy); (4) a clean, falsifiable experiment " +
      "(H1/H2 reconnaissance already run for real, producing an interpretable, reproducible result); (9) " +
      "genuinely new relative to CJK (abugida conjunct/matra composition, native danda punctuation, whitespace-" +
      "delimited-but-non-Latin letterforms — none of which CJK exercises). Criterion (11), structural " +
      "suitability, carries an explicit caveat (see candidate record) rather than being cleanly satisfied.",
  },
  {
    scriptFamily: "Arabic / Hebrew (right-to-left abjads)",
    rank: 2,
    rationale:
      "Highest theoretical value on criterion (10) (directionality/joining-model diversity) — an RTL, cursively-" +
      "joined script is the single sharpest test of whether any Stage 1-7 rule silently assumes LTR reading " +
      "order or non-joining letterforms. Ranked below Devanagari only because every candidate investigated " +
      "(SDAIA, UAE National AI Strategy, Central Bank of Jordan, Qatar IMO for Arabic; Bank of Israel for " +
      "Hebrew) failed on criterion (6)/(12) — no affirmative, verifiable general-purpose reuse licence could be " +
      "confirmed for any of them, several with an explicit restrictive notice found on inspection. This mirrors " +
      "and extends DRA-ACQ-028's own UN-Arabic rejection: the negative result is recorded explicitly (not " +
      "silently discarded) because RTL directionality remains the single most valuable untested dimension in " +
      "the entire evidence map and should be revisited if a licence-qualified RTL source is found.",
  },
  {
    scriptFamily: "Cyrillic",
    rank: 3,
    rationale:
      "Lowest priority of the three families actively investigated: Cyrillic shares CJK's LTR directionality and " +
      "(unlike Devanagari) has a case distinction and non-conjunct letterforms, so it is expected to exercise " +
      "the smallest incremental set of untested properties (criterion 9) relative to the already-closed Latin/" +
      "CJK evidence. Retained only as a low-risk fallback candidate (a Bulgarian-language EU document reusing " +
      "the already-verified EU CC BY 4.0 licence precedent from DRA-ACQ-014/015/016) given its comparatively " +
      "high licensing feasibility (criterion 6) and acquisition stability (criterion 7).",
  },
]);

export const HIGHEST_VALUE_SCRIPT_FAMILY = "Devanagari / Indic (Brahmic abugida)" as const;

// ---------------------------------------------------------------------------
// Part 5 — Candidate register
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

export interface NonCjkNonLatinCandidateRecord {
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
  readonly whyDocuments1To32DoNotAnswerThis: string;
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

export const CANDIDATE_REGISTER: readonly NonCjkNonLatinCandidateRecord[] = deepFreeze<NonCjkNonLatinCandidateRecord[]>([
  // --- Candidate 1: Supreme Court of India Hindi-translated judgment (PRIMARY) ---
  {
    candidateId: "DRA-CAND-029-01",
    title:
      "Supreme Court of India civil-appeal judgment, official Hindi translation (Model Translation Programme), " +
      "published via the Allahabad High Court eLegalix translated-judgment portal",
    publisher:
      "Supreme Court of India (judgment); official Hindi translation published under the Supreme Court's Model " +
      "Translation Programme and distributed via the Allahabad High Court's eLegalix e-SCR portal",
    sourceUrl: "https://elegalix.allahabadhighcourt.in/elegalix/WebDownloadTranslatedSCJudgmentDocument.do",
    documentType: "OTHER",
    domain: "LEGAL",
    languages: ["hi", "en (official original — see disclaimer note)"],
    script:
      "Devanagari (Brahmic abugida: conjunct consonant clusters, dependent vowel signs/matras, virama, native " +
      "danda ।/॥ sentence punctuation, no case distinction, left-to-right and whitespace-delimited at word level)",
    approxSize: "Single judgment, ~10-15 KB of extracted Hindi prose per document (varies by case); short enough " +
      "for a clean, cheap Phase 2 experiment relative to the corpus's larger documents (DRA-DOC-0026/0030).",
    targetedDimension:
      "non-Latin, non-CJK scripts — Brahmic abugida (Devanagari): conjunct/matra composition and native ।/॥ " +
      "sentence-terminator punctuation, neither of which the already-closed CJK evidence (DRA-DOC-0032) " +
      "exercises.",
    whyDocuments1To32DoNotAnswerThis:
      "No document in the 32-document corpus contains any Devanagari or other Brahmic-script text. DRA-ENG-023 " +
      "closed the CJK-specific instance of the script-blindness gap (ideographic punctuation, no inter-word " +
      "whitespace); it was neither designed against nor tested against an abugida's conjunct/matra model or its " +
      "own native sentence-terminator glyphs. Phase 1 reconnaissance (HYPOTHESIS_FINDINGS, H2) already confirmed " +
      "a real, previously undocumented gap specific to this script that no CJK evidence could have revealed.",
    expectedGroundTruth:
      "The English-language judgment is the single authoritative, legally-controlling text; the Hindi rendering " +
      "carries an explicit official disclaimer (present in the source PDFs) stating the regional-language " +
      "translation is provided solely for the litigant's understanding and that the English text governs for " +
      "all practical, official, and enforcement purposes. This is the same 'authoritative original + convenience " +
      "translation' evidentiary pattern already relied on for the Bank of Israel and Central Bank of Jordan " +
      "candidates (both rejected here on licence grounds, not ground-truth grounds), now instantiated with a " +
      "same-judicial-system, statutorily-grounded pair rather than a central-bank disclaimer.",
    officialSourceStatus:
      "eLegalix is the Allahabad High Court's own e-Committee-affiliated portal distributing Supreme Court " +
      "judgments and their official Hindi translations under India's judiciary-wide Model Translation Programme " +
      "(an official government/judicial initiative, not a third-party mirror or commercial reproduction).",
    licenceBasis:
      "Indian Copyright Act, 1957, section 52(1)(q)(iv) — a statutory exception excluding 'any judgment or " +
      "order of a court, tribunal or other judicial authority' from copyright protection, applying equally to " +
      "the judgment and to the judiciary's own official translation of it (the translation is itself an act of " +
      "the same judicial authority, not a separate third-party derivative work).",
    licenceStatus: "VERIFIED",
    licenceEvidence:
      "Section 52(1)(q)(iv)'s text and its application to court judgments (including translated renderings " +
      "published by the court system itself) was independently confirmed via multiple sources during Phase 1 " +
      "research (SpicyIP commentary, Indian Kanoon's own public-domain judgment-reproduction practice, and " +
      "AdvocateKhoj's summary of the exception) — a statutory public-domain-equivalent basis structurally " +
      "analogous to the already-accepted 17 U.S.C. §105 precedent used for DRA-DOC-0013 (FDA) and DRA-DOC-0024 " +
      "(CRS report), not a discretionary agency reuse policy of the kind found to be inconsistent even within a " +
      "single government (see REJECTED_CANDIDATES: Reserve Bank of India, below).",
    fetchAccessibility:
      "The eLegalix per-judgment download endpoint " +
      "(WebDownloadTranslatedSCJudgmentDocument.do?SCJudgmentID=<n>) returned real Hindi judgment text on direct " +
      "fetch during Phase 1 reconnaissance (2026-08-11, two separate SCJudgmentIDs sampled); no bot-blocking " +
      "observed. English originals of the same judgments were not yet located/fetched in Phase 1 (deferred to " +
      "Phase 2 acquisition).",
    preliminaryStability:
      "Not yet byte-hash-verified across two independent fetches (deferred to Phase 2, per established Phase 1 " +
      "convention). Individual judgments are immutable once decided and published, which is a materially more " +
      "stable profile than a live-updated regulatory page.",
    likelyAcquisitionCost:
      "Low: one short judgment (~10-15 KB), comparable in scale to DRA-DOC-0016/0022, plus locating and pairing " +
      "the English original for out-of-band ground truth. A specific, pre-verified-clean judgment must be " +
      "selected at Phase 2 acquisition time — see the structural-suitability caveat below.",
    successCriterion:
      "Evidence of a capability gap: real Devanagari statements are silently mis-segmented (danda-insensitive " +
      "over-merging, already demonstrated at the segmentContent level, see H2), silently dropped, or a Stage 3-7 " +
      "rule (authority resolution, EL-STANDARD-REF-style matching, issue detection) demonstrably fails to fire " +
      "or mis-fires on Devanagari text in a way traceable to a Latin/CJK-specific assumption not covered by " +
      "ENG-023.",
    failureCriterion:
      "Evidence the ENG-023 fix generalises beyond CJK: Stage 1-2 output is proportionate to the English-" +
      "original baseline (adjusted for the already-known danda-merging effect, which affects segment " +
      "granularity but not content retention per H1), and no additional script-dependent rule failure is found " +
      "at Stage 3-7.",
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionReason: null,
    rankingNotes:
      "Strongest available candidate on licence basis (a statutory exemption verified independently of " +
      "discretionary government policy — see the RBI/PIB heterogeneity finding among rejected candidates), " +
      "ground truth (built-in authoritative-original relationship), and demonstrated experimental value (H1/H2 " +
      "already produced real, interpretable, reproducible reconnaissance results). Carries one explicit caveat: " +
      "Phase 1 reconnaissance observed partial PDF text-layer corruption (mismapped conjunct/ligature sequences) " +
      "in some sampled eLegalix judgments and in an unrelated Gazette-of-India bilingual PDF, consistent with " +
      "known legacy non-Unicode-font-mapping issues common in older Indian government PDF production. This is a " +
      "STRUCTURAL_SUITABILITY risk distinct from segmentation/tokenisation logic and could confound a Phase 2 " +
      "experiment if not controlled for. Recommendation: Phase 2 acquisition must first verify (via direct text " +
      "extraction, not just a rendered-page visual check) that the specific selected judgment's PDF has a clean " +
      "Unicode text layer before freezing it — analogous to DRA-ACQ-025's pinned-fetcher caveat for source " +
      "byte-instability.",
  },

  // --- Candidate 2: Bulgarian-language EU document (ALTERNATE, Cyrillic fallback) ---
  {
    candidateId: "DRA-CAND-029-02",
    title: "A Bulgarian-language EU institutional document (specific instrument not yet selected)",
    publisher: "European Union institution (e.g. European Commission), Bulgarian-language edition",
    sourceUrl: "N/A — specific instrument not yet selected; EU multilingual publication pattern only assessed",
    documentType: "OTHER",
    domain: "GENERAL",
    languages: ["bg"],
    script: "Cyrillic (case-distinguishing alphabet, left-to-right, whitespace-delimited, non-conjunct letterforms)",
    approxSize: "Not assessed — specific instrument not yet selected.",
    targetedDimension: "non-Latin, non-CJK scripts — Cyrillic (fallback family per the ACQ-029 script-preference " +
      "order; lowest expected incremental information value of the three families considered, see " +
      "RANKED_SCRIPT_FAMILIES)",
    whyDocuments1To32DoNotAnswerThis: "No Cyrillic-script document exists in the corpus.",
    expectedGroundTruth:
      "EU institutional documents are routinely published in all official EU languages including English from " +
      "the same publisher, following the same parallel-translation ground-truth method already used at DRA-ACQ-" +
      "014/015/016/017 (English/Spanish/French pairs) and now at DRA-DOC-0032 (Japanese/English).",
    officialSourceStatus: "Primary EU-institution publisher, consistent with the already-accepted DRA-DOC-0018/" +
      "0020/0021 EU-document precedents.",
    licenceBasis: "EU institutional CC BY 4.0 reuse policy, the same licence basis already verified and accepted " +
      "for DRA-DOC-0018 (EEA) and DRA-DOC-0020 (CNIL, via GOV.UK/EU cross-reference) in prior programmes.",
    licenceStatus: "PROVISIONAL",
    licenceEvidence:
      "The general EU CC BY 4.0 institutional reuse policy is already VERIFIED at the publisher-family level " +
      "from prior programmes; this candidate is PROVISIONAL rather than VERIFIED only because no single specific " +
      "Bulgarian-language instrument has yet been selected and individually confirmed to carry the same notice.",
    fetchAccessibility: "Not assessed in detail — no specific document selected; the EU multilingual-publication " +
      "pattern itself is well-established and low-risk based on prior programmes.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Low, by analogy with the already-completed EU-document acquisitions.",
    successCriterion: "Same structural test as the PRIMARY candidate, evaluated against a same-publisher English " +
      "parallel edition.",
    failureCriterion: "Same as PRIMARY, mutatis mutandis.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionReason: null,
    rankingNotes:
      "Retained only as a low-risk fallback: ranks below the Devanagari PRIMARY candidate on genuinely-new-" +
      "boundary value (Cyrillic's case distinction and non-conjunct letterforms make it structurally closer to " +
      "the already-tested Latin/CJK evidence than Devanagari's abugida composition), but offers the highest " +
      "licensing/stability feasibility of any candidate considered in this programme, consistent with the " +
      "mandatory-fallback role assigned to Cyrillic in the ACQ-029 script-preference order.",
  },
]);

export const REJECTED_CANDIDATES: readonly NonCjkNonLatinCandidateRecord[] = deepFreeze<NonCjkNonLatinCandidateRecord[]>([
  {
    candidateId: "DRA-CAND-029-03",
    title: "SDAIA AI Ethics Principles (Saudi Data and Artificial Intelligence Authority)",
    publisher: "Saudi Data and Artificial Intelligence Authority (SDAIA)",
    sourceUrl: "https://sdaia.gov.sa/",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["ar", "en"],
    script: "Arabic abjad (right-to-left, cursive letter-joining)",
    approxSize: "Not assessed in detail given the licence rejection.",
    targetedDimension: "non-Latin, non-CJK scripts — right-to-left abjad",
    whyDocuments1To32DoNotAnswerThis: "No Arabic-script document exists in the corpus; would test directionality " +
      "and cursive joining, neither exercised by the already-closed CJK evidence.",
    expectedGroundTruth: "An official bilingual Arabic/English edition exists, which would in principle give " +
      "strong same-publisher ground truth if licensing permitted reuse.",
    officialSourceStatus: "Primary publisher (a Saudi government authority).",
    licenceBasis: "SDAIA's own terms found during Phase 1 research.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "The SDAIA AI Ethics Principles document's own terms were found to include explicit restrictive language " +
      "('may not reproduce without prior permission'), a materially more restrictive posture than every licence " +
      "basis previously accepted in this corpus.",
    fetchAccessibility: "Not assessed in detail given the licence rejection.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "Explicit restrictive reuse language found directly in the source document ('may not reproduce without " +
      "prior permission'), a clear disqualifier rather than a mere absence of an affirmative grant.",
    rankingNotes: "Rejected on licence grounds before ground-truth/stability research.",
  },
  {
    candidateId: "DRA-CAND-029-04",
    title: "UAE National AI Strategy 2031",
    publisher: "UAE Government (u.ae) / AI Office (ai.gov.ae)",
    sourceUrl: "https://u.ae/",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["ar", "en"],
    script: "Arabic abjad (right-to-left, cursive letter-joining)",
    approxSize: "Not assessed in detail given the licence/accessibility rejection.",
    targetedDimension: "non-Latin, non-CJK scripts — right-to-left abjad",
    whyDocuments1To32DoNotAnswerThis: "Same rationale as DRA-CAND-029-03.",
    expectedGroundTruth: "An official bilingual edition likely exists on ai.gov.ae, not directly verified.",
    officialSourceStatus: "Primary publisher (UAE federal government portal).",
    licenceBasis: "u.ae terms of use.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "u.ae's terms of use were found to be usage-restriction notices (acceptable-use conditions for visitors) " +
      "with no affirmative content-reuse grant comparable to Japan's Standard Terms of Use or the EU's CC BY 4.0 " +
      "precedent. The candidate document's own dedicated host (ai.gov.ae) was Cloudflare-blocked during Phase 1 " +
      "fetch attempts, preventing direct inspection of any document-level licence notice.",
    fetchAccessibility: "ai.gov.ae Cloudflare-blocked during Phase 1 (joining the OBR/Ofwat/Ofcom/CDC MMWR " +
      "pattern of bot-blocked government sources documented in prior programmes).",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_INACCESSIBLE",
    rejectionReason:
      "Combined licence uncertainty (u.ae terms are restriction-only, not an affirmative grant) and direct " +
      "inaccessibility of the specific document host (ai.gov.ae, Cloudflare-blocked).",
    rankingNotes: "Rejected on combined licence-uncertainty and accessibility grounds.",
  },
  {
    candidateId: "DRA-CAND-029-05",
    title: "Central Bank of Jordan bilingual corporate-governance banking regulation",
    publisher: "Central Bank of Jordan (CBJ)",
    sourceUrl: "https://www.cbj.gov.jo/",
    documentType: "POLICY",
    domain: "FINANCE",
    languages: ["ar", "en"],
    script: "Arabic abjad (right-to-left, cursive letter-joining)",
    approxSize: "Not assessed in detail given the licence rejection.",
    targetedDimension: "non-Latin, non-CJK scripts — right-to-left abjad",
    whyDocuments1To32DoNotAnswerThis: "Same rationale as DRA-CAND-029-03; additionally a genuine bilingual " +
      "Arabic/English parallel-text regulation with an explicit 'Arabic version shall prevail' precedence " +
      "clause, structurally the closest RTL analogue to this programme's ultimately-selected Devanagari pattern.",
    expectedGroundTruth:
      "The regulation is genuinely published as a parallel Arabic/English text with an explicit precedence " +
      "clause, which would give strong ground truth if licensing permitted reuse — the same structural pattern " +
      "later used successfully for the Devanagari PRIMARY candidate, but with the authoritative/convenience " +
      "relationship reversed (Arabic authoritative, English convenience, rather than English authoritative, " +
      "Hindi convenience).",
    officialSourceStatus: "Primary publisher (Jordan's central bank).",
    licenceBasis: "No explicit licence notice located.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "No locatable explicit copyright or reuse-licence notice was found on the CBJ regulation itself or on the " +
      "cbj.gov.jo site during Phase 1 research, unlike the Devanagari candidate's clear statutory basis. Absence " +
      "of a restrictive notice is not treated as equivalent to an affirmative grant, per established DRA " +
      "governance discipline.",
    fetchAccessibility: "Regulation PDF fetched successfully during Phase 1; no bot-blocking observed.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed given the licence rejection.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "No affirmative reuse licence or statutory public-domain basis could be located for this specific " +
      "document, despite otherwise strong structural (bilingual, parallel-text) suitability.",
    rankingNotes:
      "The strongest RTL candidate found on ground-truth structure; rejected purely on licence grounds, not " +
      "accessibility or stability. Worth revisiting if a specific, explicit CBJ reuse notice is later located.",
  },
  {
    candidateId: "DRA-CAND-029-06",
    title: "Qatar IMO / government copyright policy documents",
    publisher: "Qatar government bodies (e.g. Ministry of Communications and Information Technology)",
    sourceUrl: "N/A — general category, no single title selected",
    documentType: "POLICY",
    domain: "GENERAL",
    languages: ["ar"],
    script: "Arabic abjad (right-to-left, cursive letter-joining)",
    approxSize: "Not assessed.",
    targetedDimension: "non-Latin, non-CJK scripts — right-to-left abjad",
    whyDocuments1To32DoNotAnswerThis: "Same rationale as DRA-CAND-029-03.",
    expectedGroundTruth: "Not established during Phase 1 given the early licence rejection.",
    officialSourceStatus: "Primary publisher (Qatar government).",
    licenceBasis: "Qatar government copyright policy found during Phase 1 research.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "The Qatar government copyright policy checked during Phase 1 was explicitly restrictive (rights reserved, " +
      "no general reuse grant), reinforcing rather than contradicting the pattern already found across the other " +
      "Arabic candidates in this programme. Qatar's separate Open Data License (CC BY 4.0-equivalent, via " +
      "data.gov.qa) governs structured/tabular datasets, not prose policy documents, and does not extend to " +
      "this candidate family.",
    fetchAccessibility: "Not assessed in detail given the licence rejection.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "Explicitly restrictive government copyright policy found on inspection; the separate open-data licence " +
      "does not cover prose documents.",
    rankingNotes: "Rejected on licence grounds; recorded as reinforcing evidence for the Arabic-family pattern, " +
      "not an independent new finding.",
  },
  {
    candidateId: "DRA-CAND-029-07",
    title: "Bank of Israel Banking Supervision circulars",
    publisher: "Bank of Israel, Banking Supervision Department",
    sourceUrl: "https://www.boi.org.il/",
    documentType: "POLICY",
    domain: "FINANCE",
    languages: ["he", "en (official convenience translation)"],
    script: "Hebrew abjad (right-to-left, non-cursive-joining, distinct from Arabic's cursive-joining model)",
    approxSize: "Not assessed in detail given the licence rejection.",
    targetedDimension: "non-Latin, non-CJK scripts — right-to-left abjad (Hebrew, contrasted with Arabic's " +
      "cursive joining)",
    whyDocuments1To32DoNotAnswerThis: "No Hebrew-script document exists in the corpus; Hebrew is a structurally " +
      "distinct RTL test from Arabic (non-cursive letterforms), so it would isolate directionality from cursive " +
      "joining as separate variables if both were eventually pursued.",
    expectedGroundTruth:
      "Genuinely strong structural candidate: circulars carry an explicit 'only the Hebrew text is binding' " +
      "disclaimer with an official same-publisher English 'convenience translation', the same authoritative/" +
      "convenience pattern ultimately used for the Devanagari PRIMARY candidate.",
    officialSourceStatus: "Primary publisher (Israel's central bank).",
    licenceBasis: "No explicit licence notice located.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "The boi.org.il terms-of-use page was unreachable/garbled during Phase 1 fetch attempts, and no explicit " +
      "reuse licence was found within the circular text itself. As with the Jordan candidate, absence of a " +
      "restrictive notice is not treated as equivalent to an affirmative grant.",
    fetchAccessibility: "Circular PDFs fetched successfully; the separate terms-of-use page was not reliably " +
      "fetchable during Phase 1.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed given the licence rejection.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "No affirmative reuse licence could be confirmed despite otherwise strong ground-truth structure. Worth " +
      "revisiting if the boi.org.il terms-of-use page becomes reliably fetchable and states an affirmative " +
      "reuse grant.",
    rankingNotes:
      "The strongest Hebrew candidate found on ground-truth structure; rejected purely on licence-verification " +
      "grounds, distinguishing it from the Arabic candidates (several of which were explicitly restrictive on " +
      "inspection rather than merely unverified).",
  },
  {
    candidateId: "DRA-CAND-029-08",
    title: "Reserve Bank of India (RBI) Master Directions, Hindi/English bilingual editions",
    publisher: "Reserve Bank of India",
    sourceUrl: "https://www.rbi.org.in/",
    documentType: "POLICY",
    domain: "FINANCE",
    languages: ["hi", "en"],
    script: "Devanagari (same script family as the PRIMARY candidate)",
    approxSize: "Not assessed in detail given the licence rejection.",
    targetedDimension: "non-Latin, non-CJK scripts — Brahmic abugida (Devanagari)",
    whyDocuments1To32DoNotAnswerThis: "Same rationale as the PRIMARY candidate — investigated as an alternative " +
      "Devanagari source before the Supreme Court judgment candidate was selected.",
    expectedGroundTruth: "A genuine same-publisher bilingual Hindi/English pair, structurally comparable to the " +
      "PRIMARY candidate.",
    officialSourceStatus: "Primary publisher (India's central bank).",
    licenceBasis: "RBI's own disclaimer/copyright page.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "RBI's own disclaimer page was found during Phase 1 to contain only liability disclaimers, not an " +
      "affirmative reproduction licence — in explicit contrast to several other Indian government publishers " +
      "(PIB, BIS, Income Tax India, Publications Division), each of which was found during the same research " +
      "pass to carry an explicit 'may be reproduced free of charge... source acknowledged' copyright policy. " +
      "This heterogeneity within a single country's central government is itself recorded as a useful " +
      "methodological finding: publisher government status alone does not establish an affirmative reuse " +
      "licence (the same discipline already applied when the FCA's OGL carve-out was found scoped narrower than " +
      "expected at DRA-ACQ-018 Phase 1), and is the direct motivation for adding " +
      "LICENCE_BASIS_STRENGTH_INDEPENDENT_OF_PUBLISHER_GOVERNMENT_STATUS as a new ranking criterion in this " +
      "programme.",
    fetchAccessibility: "Master Directions PDFs fetched successfully; no bot-blocking observed.",
    preliminaryStability: "Not assessed.",
    likelyAcquisitionCost: "Not assessed given the licence rejection.",
    successCriterion: "N/A — rejected before qualification.",
    failureCriterion: "N/A — rejected before qualification.",
    qualificationOutcome: "REJECTED_LICENCE_UNCERTAIN",
    rejectionReason:
      "No affirmative reuse licence located on RBI's own disclaimer page, in contrast to the statutory public-" +
      "domain-equivalent basis independently verified for the PRIMARY candidate (court judgments, s.52(1)(q)(iv)) " +
      "and in contrast to several other Indian government publishers' explicit copyright policies.",
    rankingNotes:
      "Rejected in favour of the Supreme Court judgment candidate specifically because the judgment's licence " +
      "basis (a statutory exemption) does not depend on any single agency's discretionary policy, whereas RBI's " +
      "reuse posture proved to be an outlier even among Indian government publishers.",
  },
]);

export const PRIMARY_CANDIDATE_ID = "DRA-CAND-029-01" as const;
export const ALTERNATE_CANDIDATE_ID = "DRA-CAND-029-02" as const;
export const REJECTED_CANDIDATE_IDS = [
  "DRA-CAND-029-03",
  "DRA-CAND-029-04",
  "DRA-CAND-029-05",
  "DRA-CAND-029-06",
  "DRA-CAND-029-07",
  "DRA-CAND-029-08",
] as const;

export function getCandidateById(candidateId: string): NonCjkNonLatinCandidateRecord | undefined {
  return (
    CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId) ??
    REJECTED_CANDIDATES.find((c) => c.candidateId === candidateId)
  );
}

export function primaryCandidate(): NonCjkNonLatinCandidateRecord {
  const candidate = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!candidate) throw new Error("primary candidate missing from register");
  return candidate;
}

export function alternateCandidate(): NonCjkNonLatinCandidateRecord {
  const candidate = getCandidateById(ALTERNATE_CANDIDATE_ID);
  if (!candidate) throw new Error("alternate candidate missing from register");
  return candidate;
}

// ---------------------------------------------------------------------------
// Part 6 — Phase 1 qualification record and Phase 2 scope proposal
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0033" as const;

export const PHASE_1_QUALIFICATION_OUTCOME = "QUALIFIED_RECOMMENDED" as const;

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  reservedCorpusId: RESERVED_NEXT_CORPUS_ID,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  highestValueScriptFamily: HIGHEST_VALUE_SCRIPT_FAMILY,
  centralQuestionAnswered:
    "Not yet fully answered. This Phase 1 record qualifies the Devanagari candidate and reports two real " +
    "reconnaissance findings (H1 confirmed no-gap, H2 confirmed gap: the danda ।/॥ is not a recognised sentence " +
    "terminator) obtained by running the real segmentContent/classifySegments functions against genuine fetched " +
    "Devanagari prose. It does not run the full acquireFreezeAndEvaluate pipeline, admit DRA-DOC-0033, or settle " +
    "H3 (not applicable to this script choice) or H4 (deferred to Phase 2).",
});

export const PROPOSED_PHASE_2_SCOPE = Object.freeze({
  summary:
    "Select a specific Supreme Court of India judgment with a verified-clean Devanagari PDF text layer (per the " +
    "structural-suitability caveat on DRA-CAND-029-01), locate and fetch its official English original as an " +
    "out-of-band ground-truth reference, then acquire, freeze, and evaluate the Hindi translation as DRA-DOC-" +
    "0033 under the existing, unmodified governed-acquisition pipeline. Compare the evaluation output against " +
    "the English original's independently-known statement/claim structure, and explicitly measure the practical " +
    "decision-level impact of the already-confirmed danda sentence-boundary gap (does danda-insensitive over-" +
    "merging of sentences into oversized segments degrade Stage 5 materiality assessment or Stage 6/7 issue " +
    "detection, as the footnote-flattening precedent at DRA-ACQ-020 showed can happen for a different extraction " +
    "defect, or does it turn out to be BOUNDED, as the shading/citation precedents at DRA-ENG-015/016 showed for " +
    "others).",
  explicitlyOutOfScope:
    "Segmentation, classification, normalisation, and every Stage 1-7 rule must not be modified during Phase 2 " +
    "acquisition/admission itself, even to fix the already-confirmed danda gap. If Phase 2 confirms a decision-" +
    "level capability gap, it should be documented (per the ACQ-020 -> prose-style-dependent-impact precedent, " +
    "or the ENG-023 precedent if the impact proves structural) as a candidate for a SEPARATE, later engineering " +
    "ticket — not remediated inline.",
  explicitNonGoal:
    "This programme does not reopen DRA-ENG-023, does not pursue an Arabic/Hebrew (H3) experiment (no licence-" +
    "qualified RTL candidate was found), and does not begin any remediation of the danda sentence-terminator gap.",
});

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze({
  documentFrozen: false,
  documentAdmitted: false,
  documentEvaluated: false,
  productionCodeModified: false,
  remediationBegun: false,
  eng023Reopened: false,
});
