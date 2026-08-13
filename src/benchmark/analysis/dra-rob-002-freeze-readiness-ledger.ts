/**
 * DRA-ROB-002 — Generalisation Candidate (DRA-GC-1) Freeze-Readiness Ledger
 *
 * This is a REVIEW/DECISION programme artefact, not an engineering or
 * acquisition artefact. Nothing in this file changes production evaluator
 * behaviour, corpus history, frozen artefacts, or historical benchmark
 * results. It exists solely so that the claims made in
 * `docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md` are
 * machine-verifiable rather than only asserted in prose.
 *
 * Two exports matter for verification:
 *
 *   - `ROBUSTNESS_MATRIX`: the reconstructed DRA-ROB-001 18-dimension
 *     robustness map, reclassified as of DRA-ROB-002 (Phase 1).
 *   - `KNOWN_DEFECT_LEDGER`: the current ledger of every material known or
 *     suspected defect/limitation relevant to DRA-GC-1 (Phase 4).
 *   - `GC1_FREEZE_VERDICT`: the single primary verdict issued by this review.
 *
 * See DRA-ROB-001's own `ROBUSTNESS_EVIDENCE_MAP`
 * (`../acquisition/discovery/dra-acq-028-non-latin-script-discovery.ts`)
 * for the *prior* checkpoint this map updates — that file is intentionally
 * left unmodified (it is itself frozen evidence of the ROB-001 checkpoint
 * state), and this file is additive, new evidence layered on top of it,
 * exactly as ENG-025 was additive on top of ENG-024's implementation.
 */

// ---------------------------------------------------------------------------
// Phase 1 — robustness matrix (reconstructed from DRA-ROB-001 Section B)
// ---------------------------------------------------------------------------

export type RobustnessClassification =
  | "CLOSED_STRONGLY_EVIDENCED"
  | "ADEQUATELY_EVIDENCED_WITH_LIMITATION"
  | "PARTIALLY_EVIDENCED"
  | "UNTESTED"
  | "BLOCKED_EXTERNALLY"
  | "NOT_MATERIAL_TO_GC1";

export interface RobustnessDimensionEntry {
  readonly dimension: string;
  readonly classification: RobustnessClassification;
  readonly sourceProgrammes: readonly string[];
  readonly boundedAndDocumented: boolean;
  readonly canInvalidateGC1Claim: boolean;
  readonly note: string;
}

export const ROBUSTNESS_MATRIX: readonly RobustnessDimensionEntry[] = [
  {
    dimension: "Footnotes/endnotes",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-020 Phase 2"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Extraction-level flattening confirmed (DOC-0009, DOC-0024); does not reliably cascade to decision level. Accepted representation boundary, unchanged since ROB-001.",
  },
  {
    dimension: "Tables/tabular semantics",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-021 Phase 2", "DRA-ENG-015"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Shading-semantics loss is a disclosed representation boundary; detection (fill-colour diversity) closed with 0/15 false-positive rate. Unchanged since ROB-001.",
  },
  {
    dimension: "Multi-column layout",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-030", "DRA-ENG-024", "DRA-ENG-025"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Updated since ROB-001 (was PARTIALLY_CLOSED / open defect). ENG-025 exhaustively classified all 18 residual failures on the frozen FR oracle (23/41 = 56.1% pair-adjacency), ablation-tested 3 correction candidates and safely rejected all 3. Behaviour is unchanged from the ENG-024 baseline; the residual gap is a mixed prose/reference-table column-width regime confined to one page of one document, with fail-safe (not silently corrupting) passthrough behaviour.",
  },
  {
    dimension: "Very large documents / scalability",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-026 Phase 2", "DRA-ENG-019"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "O(n^2) -> O(n) Stage 4 fix, exactness proof, 35-45 min -> <5s on a 25,603-statement document. Unchanged since ROB-001.",
  },
  {
    dimension: "Scientific citations/references",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-022 Phase 2", "DRA-ENG-016"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Two narrow, regression-verified segment-content.ts fixes (bracket line-wrap, reference-entry shredding). Unchanged since ROB-001.",
  },
  {
    dimension: "Legal authority/versioning",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-027", "DRA-ENG-020", "DRA-ENG-021", "DRA-ENG-022"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Three-programme chain, versioned digest/freeze-integrity cutover closed the strip-both-fields bypass. Unchanged since ROB-001.",
  },
  {
    dimension: "Document supersession/currentness",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-027", "DRA-ENG-020", "DRA-ENG-021", "DRA-ENG-022"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Same chain as legal authority/versioning. DOC-0031 (HOLD/5) vs DOC-0030 (REVIEW/1), both correct and unchanged. Unchanged since ROB-001.",
  },
  {
    dimension: "Scans/OCR/image-only content",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-023 Phase 2", "DRA-ENG-017"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Provenance/fidelity detection closed; underlying OCR-corruption problem is an accepted limitation by design. Unchanged since ROB-001.",
  },
  {
    dimension: "Graphics/charts/diagrams (non-textual meaning)",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-024/025 Phase 2", "DRA-ENG-018"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Six-property graphical-semantic-completeness detector closed; underlying graphical-semantics loss is an accepted limitation by design. Unchanged since ROB-001.",
  },
  {
    dimension: "Non-Latin scripts",
    classification: "ADEQUATELY_EVIDENCED_WITH_LIMITATION",
    sourceProgrammes: ["DRA-ACQ-028", "DRA-ENG-023", "DRA-ACQ-031"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Updated since ROB-001 (was PARTIALLY_TESTED, CJK-only). DRA-DOC-0034 (Cyrillic, alphabetic/whitespace-delimited/LTR) now confirms the ENG-023 fix generalises PASS on first contact. Two distinct non-Latin mechanisms are now closed: no-whitespace ideographic segmentation (CJK) and non-Latin-alphabet character classification (Cyrillic). RTL scripts, abugida/conjunct-consonant composition (e.g. Devanagari), and scriptio-continua-without-enumerated-terminators remain a DECLARED_GENERALISATION_BOUNDARY (see KNOWN_DEFECT_LEDGER entry D2), not evidenced as safe and explicitly excluded from GC-1 claim scope.",
  },
  {
    dimension: "Mixed-language documents (single document, code-switched)",
    classification: "UNTESTED",
    sourceProgrammes: [],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Still zero evidence, unchanged since ROB-001. Declared out of GC-1 claim scope (see KNOWN_DEFECT_LEDGER entry D5) rather than treated as evidenced.",
  },
  {
    dimension: "Complex HTML",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-006", "DRA-ACQ-012", "DRA-ACQ-016"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Unchanged since ROB-001.",
  },
  {
    dimension: "Appendices/annexes",
    classification: "PARTIALLY_EVIDENCED",
    sourceProgrammes: ["DRA-ACQ-024 Phase 2"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "One data point (appendix-mediated recoverability), not generalised. Unchanged since ROB-001; not material enough to block GC-1 (narrows claim only).",
  },
  {
    dimension: "Multiple evidence sources (single evaluation, >1 authoritative source)",
    classification: "PARTIALLY_EVIDENCED",
    sourceProgrammes: [],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Incidental exposure only (DOC-0001/0003/0004/0005). Unchanged since ROB-001.",
  },
  {
    dimension: "Provenance/source integrity",
    classification: "PARTIALLY_EVIDENCED",
    sourceProgrammes: ["DRA-ENG-017"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Narrowly engineered for OCR/scan fidelity only; broader chain-of-custody/mirror/translation provenance untested. Unchanged since ROB-001.",
  },
  {
    dimension: "Compound/extreme documents",
    classification: "UNTESTED",
    sourceProgrammes: [],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Deliberately deferred by ACQ-013's single-variable discipline. Unchanged since ROB-001. Declared out of GC-1 claim scope (see KNOWN_DEFECT_LEDGER entry D4).",
  },
  {
    dimension: "Cross-language materiality divergence (EN vs ES)",
    classification: "PARTIALLY_EVIDENCED",
    sourceProgrammes: ["DRA-CHK-003", "DRA-CHK-005"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Updated since ROB-001. CHK-005 generalised the CHK-003 single confirmed pair to 12/12 obligation pairs, root-caused to Stage 5 English-only deontic lexicon coverage (ENGLISH_ONLY_LEXICAL_COVERAGE). Root cause confirmed and bounded; not fixed (requires a versioned non-English lexicon and a new evaluator version). See KNOWN_DEFECT_LEDGER entry D3.",
  },
  {
    dimension: "Lowercase-follows-period (\"bare EN\"/EL-STANDARD-REF) false positive",
    classification: "CLOSED_STRONGLY_EVIDENCED",
    sourceProgrammes: ["DRA-ENG-012", "DRA-ENG-013", "DRA-ENG-014", "DRA-ENG-014A"],
    boundedAndDocumented: true,
    canInvalidateGC1Claim: false,
    note: "Closed pre-ROB-001, with a disclosed residual (ALL-CAPS bare-EN edge case). Unchanged since ROB-001.",
  },
] as const;

/** The 18-dimension seed list this matrix must exactly reconstruct, for integrity testing. */
export const ROBUSTNESS_MATRIX_DIMENSION_COUNT = 18;

// ---------------------------------------------------------------------------
// Phase 4 — known-defect / limitation ledger
// ---------------------------------------------------------------------------

export type FreezeConsequence =
  | "FREEZE_BLOCKER"
  | "ACCEPTED_GC-1_LIMITATION"
  | "DEFERRED_NON-BLOCKING"
  | "EXTERNAL_DEPENDENCY"
  | "CLOSED";

export interface KnownDefectLedgerEntry {
  readonly id: string;
  readonly subsystem: string;
  readonly evidence: string;
  readonly severity: "NONE" | "LOW" | "MEDIUM" | "MEDIUM_HIGH" | "HIGH";
  readonly reproducibility: "FULLY_REPRODUCIBLE" | "DETERMINISTIC_STRUCTURAL" | "NOT_APPLICABLE";
  readonly safelyFixable: "YES_NOT_YET_DONE" | "ATTEMPTED_NO_SAFE_FIX_FOUND" | "NOT_ATTEMPTED" | "NOT_APPLICABLE";
  readonly remediationStatus: string;
  readonly residualRisk: string;
  readonly freezeConsequence: FreezeConsequence;
}

export const KNOWN_DEFECT_LEDGER: readonly KnownDefectLedgerEntry[] = [
  {
    id: "D1",
    subsystem: "Layout reconstruction (column-layout-reconstruction.ts)",
    evidence:
      "DRA-ENG-024/DRA-ENG-025: frozen Federal Register granule, 23/41 (56.1%) pair-adjacency preservation; 18 residual failures fully classified into 3 sub-classes (PROSE_COLUMN_BOUNDARY_UNDETECTED 8, TABLE_SUBCOLUMN_INTERLEAVING 5, MARGINAL_FURNITURE_MISPLACEMENT 5), all confined to one page mixing two column-width regimes.",
    severity: "MEDIUM",
    reproducibility: "FULLY_REPRODUCIBLE",
    safelyFixable: "ATTEMPTED_NO_SAFE_FIX_FOUND",
    remediationStatus:
      "Three correction candidates implemented and ablation-tested (dot-leader exclusion, geometric sort fallback, furniture-only relocation); all three reverted (one regressed page 2, one broke existing test contracts for a marginal gain, one was safe but zero-benefit). No unsafe or document-specific heuristic shipped.",
    residualRisk:
      "On pages mixing prose columns with a differently-dimensioned reference table, some statement pairs are not reordered correctly. Behaviour fails safe to a passthrough (content is not lost or fabricated) rather than silently reordering with false confidence.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D2",
    subsystem: "Normalisation/segmentation (Stage 1-2), non-Latin scripts beyond CJK and Cyrillic",
    evidence:
      "DOC-0032 (Japanese/CJK, closed) and DOC-0034 (Bulgarian/Cyrillic, PASS) close two distinct mechanisms (no-whitespace ideographic segmentation; non-Latin-alphabet character classification). DRA-DOC-0033 (Devanagari) remains blocked at acquisition (eLegalix HTTP 429, confirmed independently at 3 time points across ~13-14 hours, unresolved after waits up to 280s). ACQ-029 Phase 1 reconnaissance identified a specific, structurally-understood danda-terminator gap (SENTENCE_TERMINATOR_CHARS has no Devanagari entries) with a ready, unshipped counterfactual segmenter. RTL/bidi text and abugida conjunct-consonant composition have zero reconnaissance or test exposure of any kind.",
    severity: "MEDIUM_HIGH",
    reproducibility: "NOT_APPLICABLE",
    safelyFixable: "NOT_ATTEMPTED",
    remediationStatus:
      "Not attempted; acquisition blocked externally. Devanagari sentence-terminator gap is same-shape as two prior demonstrated-and-closed terminator-set gaps (bare-EN, CJK ideographic) and is therefore mechanistically bounded even though not yet fixed. RTL/abjad/abugida composition-model risk (distinct from the terminator-set class; potentially touches left-to-right span/offset assumptions used throughout Stages 1-2) has no characterisation at all.",
    residualRisk:
      "For the terminator-set class (Devanagari danda and similar): bounded, understood, same failure shape as prior closed defects (segmentation granularity, not content loss). For RTL/abjad/complex-shaping scripts: genuinely unknown magnitude, since no test or reconnaissance exists.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D3",
    subsystem: "Evaluator Stage 5 (classifyMateriality)",
    evidence:
      "DRA-CHK-003 confirmed one EN/ES statement pair diverges at Stage 5 (EN=HIGH obligation, ES=UNDETERMINED); 6/7 additional candidate pairs could not be defensibly paired (no shared anchor), not proven non-divergent. DRA-CHK-005 generalised this to 12/12 constructed obligation pairs (plus 5 clean controls), root-caused to English-only deontic lexicon coverage (must/shall/should) with no Spanish equivalents (deben/debera/deberia/es preciso/sera licito), all failing to ENGLISH_ONLY_LEXICAL_COVERAGE.",
    severity: "MEDIUM_HIGH",
    reproducibility: "FULLY_REPRODUCIBLE",
    safelyFixable: "YES_NOT_YET_DONE",
    remediationStatus:
      "Root cause confirmed and generalised diagnostically (CHK-005); no production fix implemented. CHK-005's own decision gate is STAGE5_ENGINEERING_INVESTIGATION, requiring a versioned non-English deontic lexicon, native-speaker review, and a new evaluator version — explicitly out of ROB-002's scope (no evaluator changes permitted).",
    residualRisk:
      "Systematic under-detection (false negatives only, no evidence of false positives) of obligation-level materiality in Spanish-language obligation-bearing text, and plausibly French by the same mechanism (untested). English-language materiality/obligation detection is unaffected.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D4",
    subsystem: "Whole-pipeline interaction effects",
    evidence:
      "No document has ever combined 2+ already-characterised representation weaknesses (e.g. OCR + footnotes, multi-column + tables). Deliberately deferred since DRA-ACQ-013's single-variable acquisition discipline.",
    severity: "LOW",
    reproducibility: "NOT_APPLICABLE",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Not attempted; deliberately deferred by design, not an oversight.",
    residualRisk: "Unknown interaction effects when 2+ characterised weaknesses co-occur in one document.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D5",
    subsystem: "Normalisation (single-pass, intra-document language boundary)",
    evidence: "No document has ever contained internally mixed languages/code-switching; only cross-document language variation has been tested (DOC-0017/0018/0021/0034 etc.).",
    severity: "LOW",
    reproducibility: "NOT_APPLICABLE",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Not attempted.",
    residualRisk: "Unknown behaviour where a single normalisation/tokenisation pass must handle a language boundary mid-document.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D6",
    subsystem: "Evaluator Stage 6/7 (issue detection), frozen V1 evaluator",
    evidence:
      "DRA-CHK-002 confirmed 3/9 issue classes (IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, IC-7 CLAIM_INCONSISTENCY) are triggerable and the remaining 6 (IC-1, IC-2, IC-3, IC-6, IC-8, IC-9) are structurally untriggerable by any document under the frozen V1 evaluator, confirmed across all 34 admitted documents.",
    severity: "MEDIUM",
    reproducibility: "DETERMINISTIC_STRUCTURAL",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Characterised and disclosed; requires a V2+ evaluator, explicitly out of scope for GC-1 (a V1 candidate, by definition).",
    residualRisk: "GC-1's blind test cannot exercise or claim detection capability for the 6 untriggerable issue classes.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D7",
    subsystem: "Representation/extraction (footnotes, table shading, OCR, graphics)",
    evidence:
      "DRA-ACQ-020/021/023/024/025 Phase 2 plus DRA-ENG-015/017/018: four representation-boundary limitations, each with a dedicated experiment and, where feasible, an engineered detection capability (fill-colour diversity, provenance/fidelity metadata, six-property graphical-semantic-completeness model).",
    severity: "LOW",
    reproducibility: "FULLY_REPRODUCIBLE",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Detection closed where feasible; underlying representation loss accepted by design (extraction-layer limitation, not an evaluator defect). Unchanged since ROB-001.",
    residualRisk: "Silent loss of footnote anchors, table shading semantics, OCR-corrupted text, and non-redundant graphical/diagram meaning, in each case previously demonstrated and now disclosed.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D8",
    subsystem: "Corpus governance/registry",
    evidence:
      "DRA-DOC-0033/DRA-FRZ-000027/DRA-ACQ-000036 remain reserved-but-unused. DRA-ACQ-031 Phase 2 confirmed the registry requires only DRA-DOC-NNNN format and uniqueness, not contiguity; the numbering gap at 0033 is a verified valid state, not an integrity error.",
    severity: "NONE",
    reproducibility: "DETERMINISTIC_STRUCTURAL",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Verified non-issue.",
    residualRisk: "None identified.",
    freezeConsequence: "CLOSED",
  },
  {
    id: "D9",
    subsystem: "Evaluator Stage 4 (EL-STANDARD-REF)",
    evidence: "DRA-ENG-012/013/014/014A: case-sensitivity fix eliminated the EN/Spanish-\"en\" collision; one disclosed residual (ALL-CAPS bare-EN edge case) remains.",
    severity: "LOW",
    reproducibility: "FULLY_REPRODUCIBLE",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus: "Closed with disclosed residual (READY_WITH_KNOWN_LIMITATIONS at ENG-013/014).",
    residualRisk: "Narrow ALL-CAPS bare-EN edge case, previously characterised, not observed to affect any admitted document's decision.",
    freezeConsequence: "ACCEPTED_GC-1_LIMITATION",
  },
  {
    id: "D10",
    subsystem: "Acquisition (external source availability)",
    evidence:
      "DRA-ACQ-029: eLegalix (Allahabad High Court e-SCR portal) domain-wide HTTP 429 block, confirmed independently at 2026-08-11 ~16:25 UTC, ~16:58 UTC, and 2026-08-12 ~05:42 UTC (~13-14 hours span); retries at 12s/60s/180s/280s did not clear it.",
    severity: "NONE",
    reproducibility: "NOT_APPLICABLE",
    safelyFixable: "NOT_APPLICABLE",
    remediationStatus:
      "Correctly failed closed (no evasion/hammering). This is an external acquisition-infrastructure fact about one server, not a DRA robustness failure, and per ROB-002's own instructions must not itself be used as robustness evidence in either direction.",
    residualRisk: "None to DRA itself; the residual risk this creates (untested Devanagari/abugida script family) is captured separately at D2.",
    freezeConsequence: "EXTERNAL_DEPENDENCY",
  },
] as const;

// ---------------------------------------------------------------------------
// Phase 7 — verdict
// ---------------------------------------------------------------------------

export type GC1FreezeVerdict = "READY_FOR_DRA_GC_1_FREEZE" | "NOT_READY_FOR_DRA_GC_1_FREEZE";

export const GC1_FREEZE_VERDICT: GC1FreezeVerdict = "READY_FOR_DRA_GC_1_FREEZE";

/** Frozen identifiers this review's claims are pinned to, for drift detection. */
export const GC1_FROZEN_IDENTIFIERS = {
  evaluatorVersion: "0.1.2",
  corpusVersion: "DRA-CORPUS-1.0.0",
  admittedDocumentCount: 33,
  highestAdmittedDocId: "DRA-DOC-0034",
  pendingDocId: "DRA-DOC-0033",
} as const;

/** Multi-column baseline this review cites, pinned to the ENG-025 evidence fixture. */
export const GC1_MULTICOLUMN_BASELINE = {
  totalPairs: 41,
  preservedAdjacent: 23,
  fractionPreserved: 23 / 41,
  residualFailureCount: 18,
  residualCategoryCounts: {
    PROSE_COLUMN_BOUNDARY_UNDETECTED: 8,
    TABLE_SUBCOLUMN_INTERLEAVING: 5,
    MARGINAL_FURNITURE_MISPLACEMENT: 5,
  },
} as const;
