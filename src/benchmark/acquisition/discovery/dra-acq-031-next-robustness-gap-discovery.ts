/**
 * DRA-ACQ-031 — Phase 1: Next Robustness-Gap Discovery and Candidate
 * Qualification (post-DRA-ENG-024)
 *
 * CONTEXT — DRA-ENG-024 closed (PARTIALLY_CLOSED, per DRA-ROB-001's
 * multi-column row) the multi-column reading-order defect demonstrated by
 * DRA-ACQ-030 Phase 2. This module reconstructs the current robustness
 * evidence map as of that closure, ranks the dimensions that remain
 * unresolved or insufficiently evidenced using the 8 named criteria given
 * for this programme, and investigates candidate documents for the
 * highest-ranked dimension.
 *
 * HARD CONSTRAINTS (identical in spirit to DRA-ACQ-030's) —
 *  - No document is acquired, frozen, or admitted by this module.
 *  - No new DRA-DOC, DRA-FRZ, or DRA-ACQ numeric identifier is claimed.
 *  - DRA-FRZ-000027, DRA-ACQ-000036, and DRA-DOC-0033 remain reserved and
 *    untouched (still DRA-ACQ-029 Phase 2 — BLOCKED_PENDING_LIVE_SOURCE_
 *    REACQUISITION as of this module's live re-check, see
 *    ELEGALIX_RECHECK below).
 *  - No further multi-column engineering is performed here (explicit
 *    instruction for this programme) — DRA-ROB-001's multi-column row is
 *    treated as closed input, not reopened.
 *  - Evaluator 0.1.2 and the production normalisation pipeline are not
 *    modified by this module.
 *
 * LIVE VERIFICATION RECORD — All HTTP status checks, byte-stability
 * re-fetches, and `pdftotext`/`pdfinfo` structural inspection below were
 * performed on 2026-08-11 directly against each candidate's official
 * publisher URL and are recorded here as fixed data. This module does not
 * re-fetch anything at runtime or during test execution, and it does not
 * invoke the DRA evaluator or any pipeline stage on any candidate's bytes.
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at
 * DRA-ACQ-018 through DRA-ACQ-030) — No candidate in CANDIDATE_REGISTER was
 * fetched into, or run through, evaluator 0.1.2, the DRA pipeline, or any
 * of its stages, at any point during this Phase 1 investigation. The
 * pdftotext reconnaissance recorded below exercises Poppler's extraction
 * only, never DRA's own segmentation, evaluation, or decision logic.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context and reconstructed evidence map (post-ENG-024)
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 32,
  doc0033Status:
    "DRA-DOC-0033 remains NOT ADMITTED. DRA-ACQ-029 Phase 2 status is BLOCKED_PENDING_LIVE_SOURCE_" +
    "REACQUISITION. Not counted as admitted evidence anywhere in this module.",
  multiColumnStatus:
    "DRA-ROB-001's multi-column row is PARTIALLY_CLOSED per DRA-ENG-024 (opt-in bbox-based reconstruction, " +
    "measured pair-adjacency improvement ~39%->~56% on the frozen Federal Register granule, CONFIRMED " +
    "out-of-sample generalisation on the Congressional Record, CONFIRMED zero-regression). Per this " +
    "programme's explicit instruction, this row is treated as closed input and is NOT reopened, retuned, or " +
    "re-engineered here.",
  centralQuestion:
    "Given the reconstructed evidence map, which remaining robustness dimension carries the highest expected " +
    "evidentiary value, per the 8 ranking criteria specified for this programme, and what candidate document(s) " +
    "can defensibly test it without conflating multiple uncontrolled variables?",
});

/**
 * Reconstructed robustness evidence map, current as of DRA-ENG-024's closure.
 * This is a Phase-1-scoped reconstruction (not a rebuild) of the map first
 * formalised at DRA-ACQ-028 Phase 1 and last updated by DRA-ROB-001 /
 * DRA-ENG-024; only the two rows affected by intervening work (multi-column,
 * non-Latin scripts) are restated with updated status text, all other rows
 * are carried forward unchanged.
 */
export const EVIDENCE_CLASSES = ["EXPLICITLY_TESTED", "EXPLICITLY_TESTED_NARROW", "INCIDENTALLY_PRESENT", "NOT_TESTED"] as const;
export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

export interface EvidenceMapRow {
  readonly dimension: string;
  readonly status: string;
  readonly evidenceClass: EvidenceClass;
  readonly source: string;
}

export const RECONSTRUCTED_EVIDENCE_MAP: readonly EvidenceMapRow[] = Object.freeze([
  Object.freeze({
    dimension: "footnotes/endnotes",
    status: "DEFECT_DEMONSTRATED_AND_CLOSED (accepted limitation, not a fix)",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-020 Phase 2",
  }),
  Object.freeze({
    dimension: "tables/tabular semantics",
    status: "CLOSED_WITH_POSITIVE_EVIDENCE (detection); shading-semantics loss ACCEPTED_LIMITATION",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-021 Phase 2, DRA-ENG-015",
  }),
  Object.freeze({
    dimension: "multi-column layout",
    status:
      "PARTIALLY_CLOSED (unchanged input to this programme — see multiColumnStatus above; not re-engineered here)",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-030 Phase 1/2, DRA-ENG-024",
  }),
  Object.freeze({
    dimension: "very large documents/scalability",
    status: "DEFECT_DEMONSTRATED_AND_CLOSED (O(n^2) -> O(n))",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-026 Phase 2, DRA-ENG-019",
  }),
  Object.freeze({
    dimension: "scientific citations/references",
    status: "DEFECT_DEMONSTRATED_AND_CLOSED",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-022 Phase 2, DRA-ENG-016",
  }),
  Object.freeze({
    dimension: "legal authority/versioning",
    status: "DEFECT_DEMONSTRATED_AND_CLOSED",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-027, DRA-ENG-020/021/022",
  }),
  Object.freeze({
    dimension: "document supersession/currentness",
    status: "DEFECT_DEMONSTRATED_AND_CLOSED",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-027, DRA-ENG-020/021/022",
  }),
  Object.freeze({
    dimension: "scans/OCR/image-only content",
    status: "CLOSED_WITH_POSITIVE_EVIDENCE (provenance/fidelity detection); OCR corruption ACCEPTED_LIMITATION",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-023 Phase 2, DRA-ENG-017",
  }),
  Object.freeze({
    dimension: "graphics/charts/diagrams (non-textual meaning)",
    status: "CLOSED_WITH_POSITIVE_EVIDENCE (detection); graphical-semantics loss ACCEPTED_LIMITATION",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-024/025 Phase 2, DRA-ENG-018",
  }),
  Object.freeze({
    dimension: "non-Latin scripts",
    status:
      "PARTIALLY_TESTED — exactly one script family (CJK ideographic, via DRA-DOC-0032, ENG-023-closed). " +
      "Zero admitted evidence in any other non-Latin family (Cyrillic, Greek, abjad, abugida, etc.). DRA-DOC-" +
      "0033 (Devanagari/abugida attempt) remains blocked at acquisition, not admitted. RANKED #1 by this " +
      "programme's own re-derivation below.",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-028 Phase 1/2, DRA-ENG-023; DRA-ACQ-029 (blocked)",
  }),
  Object.freeze({
    dimension: "mixed-language documents (single doc, code-switched)",
    status: "UNTESTED",
    evidenceClass: "NOT_TESTED",
    source: "none",
  }),
  Object.freeze({
    dimension: "complex HTML",
    status: "CLOSED_WITH_POSITIVE_EVIDENCE",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-ACQ-006, DRA-ACQ-012, DRA-ACQ-016",
  }),
  Object.freeze({
    dimension: "appendices/annexes",
    status: "PARTIALLY_TESTED — one data point, not generalised",
    evidenceClass: "EXPLICITLY_TESTED_NARROW",
    source: "DRA-ACQ-024 Phase 2",
  }),
  Object.freeze({
    dimension: "multiple evidence sources (single evaluation, >1 authoritative source)",
    status: "PARTIALLY_TESTED — real incidental exposure only, no dedicated experiment",
    evidenceClass: "INCIDENTALLY_PRESENT",
    source: "DRA-DOC-0001/0003/0004/0005",
  }),
  Object.freeze({
    dimension: "provenance/source integrity beyond OCR",
    status: "PARTIALLY_TESTED — narrowly engineered for OCR/scan fidelity only",
    evidenceClass: "EXPLICITLY_TESTED_NARROW",
    source: "DRA-ENG-017",
  }),
  Object.freeze({
    dimension: "compound/extreme documents (2+ weaknesses combined)",
    status: "UNTESTED (deliberately deferred by design, per ACQ-013's single-variable discipline)",
    evidenceClass: "NOT_TESTED",
    source: "none",
  }),
  Object.freeze({
    dimension: "cross-language (EN/ES) materiality divergence",
    status: "DEFECT_DEMONSTRATED_OPEN — 1/7 candidate pairs confirmed, root-caused to Stage 5, never engineered",
    evidenceClass: "EXPLICITLY_TESTED",
    source: "DRA-CHK-003, DRA-CHK-005",
  }),
]);

// ---------------------------------------------------------------------------
// Part 2 — Ranking of remaining unresolved/insufficiently-evidenced
// dimensions against the 8 criteria specified for this programme
// ---------------------------------------------------------------------------

export const RANKING_CRITERIA_ORDER = [
  "MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION",
  "NOVELTY_RELATIVE_TO_CORPUS",
  "LIKELIHOOD_OF_DISTINCT_FAILURE",
  "GROUND_TRUTH_AVAILABILITY",
  "OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY",
  "ACQUISITION_STABILITY",
  "SINGLE_VARIABLE_TESTABILITY",
  "EVIDENTIARY_VALUE_PER_COST",
] as const;
export type RankingCriterion = (typeof RANKING_CRITERIA_ORDER)[number];

export interface DimensionRanking {
  readonly dimension: string;
  readonly scores: Readonly<Record<RankingCriterion, "HIGH" | "MEDIUM" | "LOW">>;
  readonly rationale: string;
}

export const RANKED_REMAINING_GAPS: readonly DimensionRanking[] = Object.freeze([
  Object.freeze({
    dimension: "non-Latin scripts (family diversity beyond CJK)",
    scores: Object.freeze({
      MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION: "HIGH",
      NOVELTY_RELATIVE_TO_CORPUS: "MEDIUM",
      LIKELIHOOD_OF_DISTINCT_FAILURE: "MEDIUM",
      GROUND_TRUTH_AVAILABILITY: "HIGH",
      OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY: "HIGH",
      ACQUISITION_STABILITY: "HIGH",
      SINGLE_VARIABLE_TESTABILITY: "HIGH",
      EVIDENTIARY_VALUE_PER_COST: "HIGH",
    }),
    rationale:
      "DRA-DOC-0032 confirmed ENG-023's \\p{L}\\p{N} fix generalises to CJK (ideographic, no whitespace word " +
      "delimiting). The claim 'DRA is script-agnostic' remains a sample of one non-Latin family. A second, " +
      "structurally different family is the only remaining FAIL/CONDITIONAL row in the DRA-ROB-001 freeze " +
      "checklist that a single additional document can resolve. NOVELTY and LIKELIHOOD are scored MEDIUM (not " +
      "HIGH) for the specific candidate identified below because it is an alphabetic, whitespace-delimited " +
      "script (Cyrillic/Greek) rather than a genuinely different composition model (abjad/abugida) — this " +
      "ceiling is disclosed explicitly in Section D of the Phase 1 report, not hidden. GROUND_TRUTH, " +
      "LICENSING, STABILITY, TESTABILITY, and COST are all HIGH because the identified candidate reuses an " +
      "already-admitted document's exact text in a new official language, held constant against publisher, " +
      "genre, and licence.",
  }),
  Object.freeze({
    dimension: "compound/extreme documents (2+ weaknesses combined)",
    scores: Object.freeze({
      MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION: "MEDIUM",
      NOVELTY_RELATIVE_TO_CORPUS: "MEDIUM",
      LIKELIHOOD_OF_DISTINCT_FAILURE: "LOW",
      GROUND_TRUTH_AVAILABILITY: "LOW",
      OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY: "MEDIUM",
      ACQUISITION_STABILITY: "MEDIUM",
      SINGLE_VARIABLE_TESTABILITY: "LOW",
      EVIDENTIARY_VALUE_PER_COST: "LOW",
    }),
    rationale:
      "By definition combines 2+ already-characterised weaknesses (e.g. scanned multi-column table), which " +
      "directly fails criterion 7 (cannot test without conflating uncontrolled variables) unless individual " +
      "dimensions are already well-characterised — true for 8/9 seed dimensions but NOT yet for non-Latin " +
      "scripts, so attempting compound/extreme now would risk an undiagnosable result confounding two " +
      "open questions at once. Deliberately deferred, consistent with ACQ-013's single-variable discipline.",
  }),
  Object.freeze({
    dimension: "mixed-language documents (single doc, code-switched)",
    scores: Object.freeze({
      MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION: "MEDIUM",
      NOVELTY_RELATIVE_TO_CORPUS: "MEDIUM",
      LIKELIHOOD_OF_DISTINCT_FAILURE: "MEDIUM",
      GROUND_TRUTH_AVAILABILITY: "MEDIUM",
      OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY: "MEDIUM",
      ACQUISITION_STABILITY: "MEDIUM",
      SINGLE_VARIABLE_TESTABILITY: "LOW",
      EVIDENTIARY_VALUE_PER_COST: "LOW",
    }),
    rationale:
      "Shares the exact normalisation-stage mechanism as non-Latin scripts (criterion 7 conflict: cannot " +
      "cleanly separate 'does segmentation handle script X' from 'does segmentation handle a boundary between " +
      "script X and script Y' before script X alone has a second data point). Lower priority until a second " +
      "script family exists in isolation.",
  }),
  Object.freeze({
    dimension: "cross-language (EN/ES) materiality divergence closure",
    scores: Object.freeze({
      MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION: "MEDIUM",
      NOVELTY_RELATIVE_TO_CORPUS: "LOW",
      LIKELIHOOD_OF_DISTINCT_FAILURE: "LOW",
      GROUND_TRUTH_AVAILABILITY: "HIGH",
      OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY: "HIGH",
      ACQUISITION_STABILITY: "HIGH",
      SINGLE_VARIABLE_TESTABILITY: "HIGH",
      EVIDENTIARY_VALUE_PER_COST: "MEDIUM",
    }),
    rationale:
      "No acquisition needed (pure direct-pipeline analysis on already-frozen content), so it does not compete " +
      "with document-acquisition candidates for this specific ACQ-031 programme's purpose (investigating " +
      "CANDIDATE DOCUMENTS). Real, valuable, but out of scope for a document-discovery Phase 1 — noted as a " +
      "parallel-track recommendation, not ranked against document-acquisition dimensions on equal terms.",
  }),
  Object.freeze({
    dimension: "multiple evidence sources / conflicting provenance",
    scores: Object.freeze({
      MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION: "LOW",
      NOVELTY_RELATIVE_TO_CORPUS: "LOW",
      LIKELIHOOD_OF_DISTINCT_FAILURE: "LOW",
      GROUND_TRUTH_AVAILABILITY: "MEDIUM",
      OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY: "MEDIUM",
      ACQUISITION_STABILITY: "MEDIUM",
      SINGLE_VARIABLE_TESTABILITY: "LOW",
      EVIDENTIARY_VALUE_PER_COST: "LOW",
    }),
    rationale:
      "Real exposure already exists incidentally in 4 corpus documents; a dedicated experiment would need an " +
      "artificial conflict scenario, weakening ground-truth cleanliness (criterion 4) for modest new evidence.",
  }),
]);

export const HIGHEST_VALUE_GAP: string = RANKED_REMAINING_GAPS[0].dimension;

// ---------------------------------------------------------------------------
// Part 3 — Live re-check of the still-blocked DRA-ACQ-029 (eLegalix) thread
// (read-only diagnostic, not a Phase 2 admission attempt; recorded so the
// ranking decision below is not made blind to whether the block cleared)
// ---------------------------------------------------------------------------

export const ELEGALIX_RECHECK = Object.freeze({
  performedAt: "2026-08-11T19:27:57Z",
  method: "Single controlled GET (no retries/probing) to the same judgment-download endpoint used by the " +
    "blocked DRA-ACQ-029 Phase 2 admission test.",
  result: "HTTP 429 (unchanged)",
  priorDataPoints: "First block: 2026-08-11 ~16:25 UTC. Second confirmed block: 2026-08-11 16:58:09 UTC " +
    "(~42 min later). This recheck: 2026-08-11 19:27:57 UTC (~2h30m after the second data point).",
  interpretation:
    "Third confirmed data point of a sustained, domain-wide, IP-level or mod_qos-class block that has not " +
    "cleared across a growing cooldown window (12s/60s/180s/280s intra-session, ~42min inter-session, now " +
    "~2h30m). This does not prove the block will never clear, but it is strong evidence against retrying " +
    "DRA-ACQ-029 again within this programme; per DRA-ROB-001 Section L's own explicit contingency, the " +
    "correct next step when the block persists is a fresh, eLegalix-independent candidate search for the " +
    "same dimension (non-Latin scripts), which is exactly what this module performs below. DRA-ACQ-029 " +
    "itself is left untouched — no retry, no modification — and remains a separate, still-open thread.",
});

// ---------------------------------------------------------------------------
// Part 4 — Candidate register status vocabularies
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["OFFICIAL_PUBLISHER", "INACCESSIBLE", "NOT_OFFICIAL"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_STATUSES = ["PUBLIC_DOMAIN", "CC_BY", "PERMISSION_REQUIRED", "UNVERIFIED"] as const;
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];

export const SCRIPT_FAMILIES = [
  "LATIN_ALPHABETIC",
  "CYRILLIC_ALPHABETIC",
  "GREEK_ALPHABETIC",
  "CJK_IDEOGRAPHIC",
  "DEVANAGARI_ABUGIDA",
  "ARABIC_ABJAD",
] as const;
export type ScriptFamily = (typeof SCRIPT_FAMILIES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = ["QUALIFIED_PRIMARY", "QUALIFIED_ALTERNATE", "REJECTED"] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

// ---------------------------------------------------------------------------
// Part 5 — Candidate record shape
// ---------------------------------------------------------------------------

export interface ScriptCandidateRecord {
  readonly candidateId: string;
  readonly title: string;
  readonly publisher: string;
  readonly domain: Domain;
  readonly documentType: DocumentType;
  readonly sourceUrl: string;
  readonly httpStatusObserved: number;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceStatus: LicenceStatus;
  readonly licenceEvidence: string;
  readonly pageCount: number;
  readonly scriptFamily: ScriptFamily;
  readonly repeatFetchStability: string;
  readonly structuralCharacteristics: string;
  readonly groundTruthOracle: string;
  readonly robustnessHypothesis: string;
  readonly passCriterion: string;
  readonly partialCriterion: string;
  readonly materialDefectCriterion: string;
  readonly addsGenuinelyNewEvidence: string;
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionReason: string | null;
}

// ---------------------------------------------------------------------------
// Part 6 — Candidate register (all investigated candidates, live-verified
// 2026-08-11; qualified and rejected alike)
// ---------------------------------------------------------------------------

export const CANDIDATE_REGISTER: readonly ScriptCandidateRecord[] = Object.freeze([
  Object.freeze({
    candidateId: "EC_ETHICS_GUIDELINES_BG",
    title: "Насоки относно етичните аспекти за надежден ИИ (Ethics Guidelines for Trustworthy AI — Bulgarian edition)",
    publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    domain: "TECHNICAL",
    documentType: "REPORT",
    sourceUrl: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60442",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "CC_BY",
    licenceEvidence:
      "Identical publisher, site family, and institution-wide 'the reuse of the editorial content on this " +
      "website owned by the EU is authorized under the Creative Commons Attribution 4.0 International (CC BY " +
      "4.0) licence' basis already VERIFIED for the English edition (DRA-DOC-0018, DRA-ACQ-014) and the " +
      "Spanish edition (DRA-DOC-0019, DRA-ACQ-016/017) of this exact document. No document-specific licence " +
      "override was located on the Bulgarian landing page, mirroring the precedent already accepted twice.",
    pageCount: 58,
    scriptFamily: "CYRILLIC_ALPHABETIC",
    repeatFetchStability:
      "Two independent live fetches on 2026-08-11 returned byte-identical content: SHA-256 " +
      "bf61352bd6836ca4d29c429ad963b0b2fceb0b7d0874bb77ae10b113dac3d313, 2,332,675 bytes, both HTTP 200.",
    structuralCharacteristics:
      "58-page native-text PDF (vs. 41 pages for the English edition and a comparable page count for the " +
      "Spanish edition — expansion consistent with Cyrillic Bulgarian prose density, not a structural anomaly). " +
      "pdftotext confirms a clean, non-corrupted Cyrillic text layer (verified directly: 'НЕЗАВИСИМА " +
      "ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ...'), single-column body layout (no multi-column confound), no " +
      "tables, no embedded graphics requiring interpretation, no OCR/scan artefacts — deliberately excludes " +
      "every other already-characterised representation dimension (multi-column, tables, OCR, graphics) so " +
      "the experiment isolates script family as its only new variable.",
    groundTruthOracle:
      "The document's English (DRA-DOC-0018) and Spanish (DRA-DOC-0019) editions are ALREADY admitted, frozen, " +
      "and evaluated in the corpus, and are substantively the same text (same chapters, same assessment-list " +
      "structure in Chapter III, same author group and publication history). This gives an unusually strong, " +
      "already-frozen, three-way parallel-translation oracle for direct statement-count and structural " +
      "comparison, extending the ACQ-017/CHK-003/CHK-005 parallel-language methodology to a third script.",
    robustnessHypothesis:
      "ENG-023's \\p{L}\\p{N} Unicode-property-class fix, which closed the ASCII-only segmentation defect for " +
      "CJK ideographic script, generalises correctly to the Cyrillic alphabet (a script using its own Unicode " +
      "block but ordinary ASCII sentence-terminator punctuation ('.', '!', '?') and ordinary whitespace word " +
      "delimiting, unlike CJK).",
    passCriterion:
      "PASS: statement count and segmentation quality on the Bulgarian text are structurally comparable " +
      "(same order of magnitude, no PUNCTUATION_ONLY misclassification of substantive Cyrillic prose) to the " +
      "already-frozen English/Spanish editions of the identical document, decision outcome not degraded by an " +
      "extraction/segmentation artefact.",
    partialCriterion:
      "PARTIAL: segmentation succeeds structurally, but a narrow, non-decision-changing discrepancy is found " +
      "(e.g. a small number of Cyrillic-specific punctuation or abbreviation patterns misparsed), analogous to " +
      "the disclosed-but-nonmaterial residuals already accepted elsewhere in the corpus (e.g. ENG-014A's " +
      "ALL-CAPS bare-EN edge case).",
    materialDefectCriterion:
      "MATERIAL DEFECT: a Cyrillic-specific segmentation or classification failure analogous to the pre-" +
      "ENG-023 Japanese defect (e.g. PUNCTUATION_ONLY misclassification of substantive Bulgarian prose, or a " +
      "systematic statement-count collapse relative to the parallel English/Spanish editions) that changes " +
      "claim formation, evidence linkage, or the final decision.",
    addsGenuinelyNewEvidence:
      "Yes — the corpus has zero Cyrillic-script documents today. This is a distinct Unicode block from every " +
      "script currently admitted (Latin: en/es/fr; CJK: ja).",
    qualificationOutcome: "QUALIFIED_PRIMARY",
    rejectionReason: null,
  }),
  Object.freeze({
    candidateId: "EC_ETHICS_GUIDELINES_EL",
    title: "Κατευθυντήριες γραμμές δεοντολογίας για αξιόπιστη τεχνητή νοημοσύνη (Ethics Guidelines for Trustworthy AI — Greek edition)",
    publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    domain: "TECHNICAL",
    documentType: "REPORT",
    sourceUrl: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60424",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "CC_BY",
    licenceEvidence:
      "Same institution-wide CC BY 4.0 basis as the Bulgarian, English, and Spanish editions of this exact " +
      "document — see EC_ETHICS_GUIDELINES_BG's licenceEvidence.",
    pageCount: 58,
    scriptFamily: "GREEK_ALPHABETIC",
    repeatFetchStability:
      "Two independent live fetches on 2026-08-11 returned byte-identical content: SHA-256 " +
      "d65e515fd8f4954278d8908cbd43b86c7bb604073882e201259de4ed6f03b08d, 2,322,130 bytes, both HTTP 200.",
    structuralCharacteristics:
      "58-page native-text PDF, single-column, no tables/graphics/OCR confound, structurally identical " +
      "template to the Bulgarian edition (same publisher pipeline generates all 24 language editions from " +
      "one InDesign/PDF template family). pdftotext confirms a clean Greek text layer ('ΑΝΕΞΑΡΤΗΤΗ ΟΜΑΔΑ " +
      "ΕΜΠΕΙΡΟΓΝΩΜΟΝΩΝ ΥΨΗΛΟΥ ΕΠΙΠΕΔΟΥ...').",
    groundTruthOracle: "Same three-way (EN/ES/target) parallel-translation oracle as the Bulgarian candidate.",
    robustnessHypothesis:
      "Same as the Bulgarian candidate, applied to the Greek alphabet (a second, independent non-Latin, non-" +
      "Cyrillic, non-CJK Unicode block) instead of Cyrillic.",
    passCriterion: "Same structure as the Bulgarian candidate's PASS criterion, applied to Greek.",
    partialCriterion: "Same structure as the Bulgarian candidate's PARTIAL criterion, applied to Greek.",
    materialDefectCriterion: "Same structure as the Bulgarian candidate's MATERIAL DEFECT criterion, applied to Greek.",
    addsGenuinelyNewEvidence:
      "Yes in isolation, but LOWER marginal value than the Bulgarian candidate if selected as a second " +
      "document in the same programme: both Cyrillic and Greek are alphabetic, whitespace-delimited scripts " +
      "using ordinary ASCII-range punctuation for sentence boundaries, so admitting both would mostly confirm " +
      "the same underlying \\p{L}\\p{N} mechanism twice rather than reveal a second distinct mechanism. Retained " +
      "as the qualified alternate specifically because it is genuinely different from Bulgarian (a different " +
      "Unicode block, different alphabet), not because it would be a poor choice on its own.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionReason: null,
  }),
  Object.freeze({
    candidateId: "ELEGALIX_DOC0033_RETRY",
    title: "(DRA-ACQ-029 continuation) Asma Lateef and others v. Shabbir Ahmed and others — official Hindi translation",
    publisher: "Supreme Court of India (via Allahabad High Court eLegalix e-SCR portal)",
    domain: "LEGAL",
    documentType: "OTHER",
    sourceUrl: "https://elegalix.allahabadhighcourt.in/elegalix/WebShowJudgmentDocument.do?judgmentID=306",
    httpStatusObserved: 429,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "PUBLIC_DOMAIN",
    licenceEvidence: "Indian Copyright Act 1957 s.52(1)(q)(iv) — already verified at DRA-ACQ-029 Phase 1/2.",
    pageCount: 0,
    scriptFamily: "DEVANAGARI_ABUGIDA",
    repeatFetchStability:
      "NOT STABLE for acquisition purposes: third confirmed HTTP 429 (see ELEGALIX_RECHECK), ~2h30m after the " +
      "second confirmed block and unresolved since the block began (~16:25 UTC same day). Fails criterion 6 " +
      "(acquisition stability) decisively for this programme, independent of its otherwise-highest structural " +
      "novelty (abugida, conjunct consonants, danda punctuation).",
    structuralCharacteristics: "Not re-verified this session — unchanged from DRA-ACQ-029 Phase 1/2 findings.",
    groundTruthOracle: "Not applicable to this programme — this candidate is not selected.",
    robustnessHypothesis: "Unchanged from DRA-ACQ-029 (danda/double-danda sentence-boundary gap).",
    passCriterion: "N/A — not selected.",
    partialCriterion: "N/A — not selected.",
    materialDefectCriterion: "N/A — not selected.",
    addsGenuinelyNewEvidence:
      "Would add the HIGHEST novelty of any script candidate considered (a genuinely different composition " +
      "model: abugida with conjunct consonants and matra vowel signs, unlike any script currently in the " +
      "corpus) — this is explicitly acknowledged so the Bulgarian/Greek selection is not misread as a claim " +
      "that Cyrillic/Greek closes the non-Latin-script gap as thoroughly as Devanagari would. The gap remains " +
      "genuinely open for abugida/abjad/RTL scripts after this programme.",
    qualificationOutcome: "REJECTED",
    rejectionReason:
      "ACQUISITION_UNSTABLE: sustained, domain-wide HTTP 429 block, now confirmed a third time across a " +
      "~2h30m-and-growing cooldown window. Not retried further by this programme (retrying a mod_qos-class " +
      "block tends to worsen or extend it); left as a separate, still-open DRA-ACQ-029 thread, not folded " +
      "into or closed by DRA-ACQ-031.",
  }),
]);

export const CANDIDATE_IDS: readonly string[] = Object.freeze(CANDIDATE_REGISTER.map((c) => c.candidateId));

export function getCandidateById(candidateId: string): ScriptCandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export const PRIMARY_CANDIDATE_ID = "EC_ETHICS_GUIDELINES_BG" as const;
export const ALTERNATE_CANDIDATE_ID = "EC_ETHICS_GUIDELINES_EL" as const;
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(
  CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "REJECTED").map((c) => c.candidateId),
);

export function primaryCandidate(): ScriptCandidateRecord {
  const record = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!record) {
    throw new Error("Primary candidate record missing from CANDIDATE_REGISTER.");
  }
  return record;
}

export function alternateCandidate(): ScriptCandidateRecord {
  const record = getCandidateById(ALTERNATE_CANDIDATE_ID);
  if (!record) {
    throw new Error("Alternate candidate record missing from CANDIDATE_REGISTER.");
  }
  return record;
}

// ---------------------------------------------------------------------------
// Part 7 — Phase 1 qualification verdict
// ---------------------------------------------------------------------------

export const PHASE_1_QUALIFICATION_OUTCOME = "QUALIFIED" as const;

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  rationale:
    "The Bulgarian edition of the EC's 'Ethics Guidelines for Trustworthy AI' is QUALIFIED as the Phase 2 " +
    "primary candidate: official publisher, CC BY 4.0 (identical basis already verified twice for the same " +
    "document family), byte-stable across two independent live fetches, a clean native Cyrillic text layer, " +
    "single-column with no table/graphics/OCR confound, and an unusually strong ground-truth oracle (the " +
    "identical document is already admitted and evaluated in English (DRA-DOC-0018) and Spanish (DRA-DOC-" +
    "0019)). The Greek edition is QUALIFIED as the alternate for the same reasons, differing only in script.",
  candidateAfter:
    "Reserved conceptually as the document after DRA-DOC-0033 (still blocked), i.e. DRA-DOC-0034; no DRA-DOC " +
    "or DRA-FRZ identifier is claimed by this Phase 1 module.",
  disclosedLimitation:
    "Neither candidate tests a non-alphabetic or non-whitespace-delimited composition model (abugida, abjad, " +
    "RTL). The highest-novelty script candidate identified (Devanagari, via the existing DRA-ACQ-029 thread) " +
    "remains blocked on acquisition stability, not rejected on merit. This Phase 1 report explicitly does not " +
    "claim the non-Latin-script dimension will be fully closed by the Bulgarian/Greek experiment alone.",
});

export const NON_LATIN_SCRIPT_STATUS_AFTER_PHASE_1 = "CANDIDATE_QUALIFIED_NOT_YET_ADMITTED" as const;

// ---------------------------------------------------------------------------
// Part 8 — Phase 2 experiment design (pre-defined, not executed here)
// ---------------------------------------------------------------------------

export const PHASE_2_CLASSIFICATION_OPTIONS = [
  "SCRIPT_GENERALISATION_CONFIRMED",
  "SCRIPT_GENERALISATION_GAP_DEMONSTRATED_MATERIAL",
  "SCRIPT_GENERALISATION_GAP_DEMONSTRATED_NONMATERIAL",
  "INCONCLUSIVE",
] as const;
export type Phase2ClassificationOption = (typeof PHASE_2_CLASSIFICATION_OPTIONS)[number];

export const PROPOSED_PHASE_2_SCOPE = Object.freeze({
  steps: Object.freeze([
    "Re-verify governance (official-source status, CC BY 4.0 licence, HTTP stability, byte-stability) for the " +
      "Bulgarian primary candidate immediately before acquisition, per standard DRA-ACQ practice for " +
      "time-sensitive live sources.",
    "Freeze and admit the primary candidate via the existing governed acquisition pipeline " +
      "(acquireFreezeAndEvaluate), producing a real DRA-DOC identifier, freeze record, and evaluation, without " +
      "modifying any pipeline stage.",
    "Evaluate the frozen document twice (via evaluateFrozenBenchmarkDocument) to confirm Run A/Run B " +
      "substantive-digest equality before drawing any conclusion, per the DRA-BMK-023 corpus-lock convention.",
    "Directly compare the Bulgarian evaluation's segmentation output (segment count, PUNCTUATION_ONLY " +
      "misclassification rate, statement count) against the already-frozen English (DRA-DOC-0018) and Spanish " +
      "(DRA-DOC-0019) evaluations of the identical underlying document, using the CHK-003/CHK-005 direct-" +
      "pipeline-comparison technique.",
    "If the primary reveals a candidate defect signal, run the Greek alternate as a second, independent data " +
      "point to test whether the finding is script-specific or a shared alphabetic-script mechanism.",
    "Assess materiality strictly: classify any demonstrated defect as MATERIAL only if it changes statement " +
      "formation, claim boundaries, evidence linkage, authority interpretation, issue generation, or the final " +
      "decision, mirroring ENG-023's own materiality standard.",
    "Classify the dimension using exactly one of PHASE_2_CLASSIFICATION_OPTIONS, without modifying, patching, " +
      "or otherwise fixing any pipeline stage as part of this classification exercise.",
    "Explicitly record that a genuinely different composition model (abugida/abjad/RTL) remains untested after " +
      "this Phase 2 experiment, and that DRA-ACQ-029 (Devanagari) remains the recommended path to close that " +
      "narrower residual gap once/if the eLegalix block clears.",
  ]),
  acceptanceCriteria: Object.freeze({
    pass:
      "Bulgarian (and, if run, Greek) segmentation/statement counts are structurally comparable to the " +
      "English/Spanish editions of the identical document; no PUNCTUATION_ONLY misclassification of " +
      "substantive Cyrillic/Greek prose; decision outcome not degraded by an extraction or segmentation " +
      "artefact traceable to script.",
    partial:
      "A narrow, non-decision-changing discrepancy is found and disclosed (analogous to ENG-014A's accepted " +
      "residual), without a corpus-wide or decision-level impact.",
    materialDefect:
      "A Cyrillic- or Greek-specific segmentation or classification failure analogous to the pre-ENG-023 " +
      "Japanese defect is demonstrated (e.g. systematic PUNCTUATION_ONLY misclassification or statement-count " +
      "collapse relative to the parallel English/Spanish editions) that changes claim formation, evidence " +
      "linkage, or the final decision.",
  }),
  explicitNonGoals: Object.freeze([
    "Do not fix, patch, or otherwise modify extraction/normalisation/segmentation as part of Phase 2 " +
      "classification; any engineering remediation is a separate, later DRA-ENG programme.",
    "Do not touch, reuse, renumber, or interfere with DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033.",
    "Do not retry the DRA-ACQ-029 eLegalix fetch as part of this programme.",
  ]),
});

export const PHASE_1_PROHIBITED_ACTIONS: readonly string[] = Object.freeze([
  "acquiring, freezing, or admitting any candidate document",
  "creating DRA-DOC-0034 or any new DRA-DOC identifier",
  "creating any new freeze record or acquisition record",
  "modifying evaluator 0.1.2, any pipeline stage, extraction, normalisation, or segmentation",
  "touching, reusing, or renumbering DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033",
  "performing further multi-column engineering (explicit instruction for this programme)",
]);
