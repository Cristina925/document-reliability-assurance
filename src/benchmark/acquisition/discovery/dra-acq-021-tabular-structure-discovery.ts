/**
 * DRA-ACQ-021 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0025 (Tabular Semantic Preservation Robustness Probe)
 *
 * CONTEXT — DRA-ACQ-020 Phase 2 (DRA-DOC-0024, CRS R48555) established that
 * the footnote-marker-flattening extraction defect first found on
 * DRA-DOC-0023 reproduces on a second, independent, different-publisher
 * document, but that its downstream evaluator impact does NOT generalise
 * the same way (it depends on document/claim structure, not footnote
 * density alone). The footnote-density robustness dimension is therefore
 * considered adequately explored with two data points. This programme
 * (DRA-ACQ-021) explicitly does NOT continue that line — see the task's own
 * instruction: "do not select another candidate primarily because it is
 * footnote-dense. Document 25 must attack a different material
 * uncertainty."
 *
 * PROGRAMME OBJECTIVE — Test a different structural dimension entirely:
 * COMPLEX TABLES / TABULAR SEMANTIC PRESERVATION. The DRA acquisition and
 * normalisation pipeline (`pdftotext -layout` plus `normaliseContent`)
 * converts two-dimensional table structure into a linear text stream. This
 * probe asks whether meaning encoded through row/column relationships
 * survives that flattening well enough that downstream statement
 * extraction, evidence linkage, and materiality assessment do not silently
 * change what the source document says — e.g. by detaching a header from
 * its value, mis-associating a row label with the wrong cell, corrupting
 * column order, losing a unit, or dropping a table-note/qualifier.
 *
 * ANTI-CONTAMINATION STATEMENT (required verbatim by the task specification
 * pattern established at DRA-ACQ-018/019/020): No candidate in
 * CANDIDATE_REGISTER was fetched into, or run through, evaluator 0.1.2, the
 * DRA pipeline, or any of its stages, at any point during this Phase 1
 * investigation. Candidate selection used only (a) live HTTP/licence/
 * official-source verification and (b) direct visual inspection of each
 * PDF's own rendered pages (via `pdftoppm`) and extracted text (via
 * `pdftotext -layout`) for genuine table complexity — never the DRA
 * evaluator's own output, and never a prediction of whether a candidate
 * would make the evaluator fail. Rejections below are based on observed
 * governance/accessibility/structural evidence, not predicted outcome.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This module
 * does not download-and-freeze, admit, or evaluate any document. It does
 * not create DRA-DOC-0025, a new freeze record, a new acquisition record,
 * or a DRA-BMK-025 checkpoint, and it does not modify evaluator 0.1.2, any
 * pipeline stage, normalisation, or any existing frozen artefact. See
 * PHASE_1_PROHIBITED_ACTIONS below and the accompanying test file for
 * explicit assertions of that boundary.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 24 documents (DRA-DOC-0001-0024).
 *
 * All live verification (HTTP status, repeated-fetch SHA-256 digests,
 * licence statement text, rendered-page visual inspection for genuine
 * table complexity) was performed on 2026-08-10 via `curl`, `pdftotext`,
 * and `pdftoppm` against the documents' official publisher URLs and is
 * recorded here as fixed data. This module does not re-fetch anything at
 * runtime or during test execution, and it does not invoke the DRA
 * evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context (why footnote-density is retired as a target)
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 24,
  priorRobustnessProbe: Object.freeze({
    corpusId: "DRA-DOC-0024",
    dimension: "footnote_and_citation_density",
    findings: Object.freeze([
      "the previously observed footnote-marker-flattening extraction defect reproduced across a second, " +
        "independent publisher (CRS, distinct from DRA-DOC-0023's CMA)",
      "footnote density alone does not predict downstream evaluator degradation",
      "downstream severity depends materially on document/claim structure (self-contained discursive prose " +
        "absorbs marker loss; short evidence-dependent factual sentences do not)",
      "Stage 2 can mis-extract footnote-list lines as standalone statements",
      "Stage 5 currently filters those artefacts as non-material, so the mis-extraction does not propagate " +
        "into a visible defect",
      "no general-purpose engineering change was justified",
    ]),
  }),
  newTargetDimension: "complex_tables_and_tabular_semantic_preservation",
  newTargetRationale:
    "The footnote/citation dimension is now considered adequately explored with two data points reaching a " +
    "non-generalising conclusion. Tables present an entirely different structural risk: meaning encoded " +
    "spatially (row/column position, header hierarchy, merged cells) rather than sequentially in prose, which " +
    "the pipeline's linear-text extraction approach has never been specifically tested against.",
  candidateFocusInstruction:
    "Do not select a candidate merely because it comes from a new institution, and do not search for a " +
    "document expected to make DRA fail — search for a document that provides a strong test of tabular " +
    "semantic preservation, evaluated on observed structural evidence.",
});

// ---------------------------------------------------------------------------
// Part 2 — Target failure modes and desired structural elements
// ---------------------------------------------------------------------------

/** Verbatim (paraphrase-preserving) list of failure modes this probe is designed to expose, taken from the
 * DRA-ACQ-021 task specification's "Primary experimental target" section. Recorded, not assumed to occur. */
export const TARGET_FAILURE_MODES: readonly string[] = Object.freeze([
  "table_headers_becoming_detached_from_values",
  "row_labels_becoming_detached_from_corresponding_cells",
  "incorrect_reading_order",
  "column_order_corruption",
  "merged_cell_relationships_being_lost",
  "values_associated_with_wrong_category",
  "footnotes_or_qualifiers_attached_to_tables_becoming_detached",
  "tables_flattened_into_linguistically_plausible_but_semantically_incorrect_text",
  "numeric_values_losing_units_or_contextual_labels",
  "statement_extraction_generating_claims_never_asserted_by_source",
  "evidence_association_operating_on_corrupted_tabular_representations",
]);

export const DESIRED_STRUCTURAL_ELEMENTS: readonly string[] = Object.freeze([
  "multiple_complex_tables",
  "multi_column_tables",
  "hierarchical_headers",
  "merged_cells",
  "numeric_and_textual_cells",
  "units",
  "percentages",
  "dates",
  "categorical_comparisons",
  "row_column_cross_references",
  "table_notes",
  "table_specific_citations",
  "repeated_tables_across_multiple_pages",
  "tables_spanning_pages",
  "visual_only_semantic_cue_not_present_in_extracted_text",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register (three real, independently live-verified
// documents)
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = ["VERIFIED_ACCESSIBLE", "BLOCKED", "NOT_VERIFIED"] as const;
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["BYTE_STABLE", "TEXT_STABLE", "UNKNOWN", "BLOCKED"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED_BLOCKED",
  "REJECTED_INSUFFICIENT_TABLE_COMPLEXITY",
] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface CandidateRecord {
  readonly candidateId: string;
  readonly title: string;
  readonly publisher: string;
  readonly jurisdiction: string;
  readonly domain: Domain;
  readonly documentType: DocumentType;
  readonly language: string;
  readonly sourceFormat: "PDF";
  readonly officialSourceUrl: string;
  readonly publicationDate: string;
  readonly approximateSize: string;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceReuseBasis: string;
  readonly licenceReuseStatus: LicenceReuseStatus;
  readonly httpAccessibility: HttpAccessibilityStatus;
  readonly accessibilityEvidence: string;
  readonly sourceStabilityStatus: SourceStabilityStatus;
  readonly stabilityObservations: string;
  readonly tableCountObserved: number | null;
  readonly structuralElementsObserved: readonly string[];
  readonly structuralEvidenceNote: string;
  readonly visuallyInspectedPages: readonly string[];
  readonly isRepeatPublisher: boolean;
  readonly corpusDiversityContribution: string;
  readonly corpusDiversityLimitation: string;
  readonly knownRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

/** Recursively freezes an object graph of plain objects/arrays. */
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

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = deepFreeze([
  // --- Candidate 1: EIA Short-Term Energy Outlook (primary) ---
  Object.freeze({
    candidateId: "DRA-CAND-021-01",
    title: "Short-Term Energy Outlook (STEO) — July 2026",
    publisher: "U.S. Energy Information Administration (EIA), U.S. Department of Energy",
    jurisdiction: "United States",
    domain: "FINANCE",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf",
    publicationDate: "2026-07 (July 2026 edition)",
    approximateSize: "5,346,044 bytes, 56 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — EIA's own copyrights-and-reuse page (eia.gov/about/copyrights_reuse.php) states " +
      "verbatim: \"U.S. government publications are in the public domain and are not subject to copyright " +
      "protection. You may use and/or distribute any of our data, files, databases, reports, graphs, charts, " +
      "and other information products...\" EIA is a statistical agency within the U.S. Department of Energy, " +
      "consistent with the PUBLIC_DOMAIN basis already used for DRA-DOC-0010 (NIST), DRA-DOC-0013 (FDA), and " +
      "DRA-DOC-0024 (CRS) elsewhere in this corpus.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on eia.gov (the official EIA domain; canonical URL also confirmed by direct link from the " +
      "STEO landing page eia.gov/outlooks/steo/) returned HTTP 200, content-type application/pdf, " +
      "content-length 5,346,044 bytes, no authentication or paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "c1a0d6814be9ee54241b7eb650b26d3c1b1d1483f70f9b5021fd975b05f7d251 and identical byte length 5,346,044.",
    tableCountObserved: 9,
    structuralElementsObserved: [
      "multiple_complex_tables",
      "multi_column_tables",
      "hierarchical_headers",
      "merged_cells",
      "numeric_and_textual_cells",
      "units",
      "percentages",
      "dates",
      "categorical_comparisons",
      "row_column_cross_references",
      "table_notes",
      "table_specific_citations",
      "repeated_tables_across_multiple_pages",
      "visual_only_semantic_cue_not_present_in_extracted_text",
    ],
    structuralEvidenceNote:
      "A dedicated 9-table numeric appendix (Tables 1, 2, 6, 8, and others; renders inspected directly at " +
      "150/100 DPI via pdftoppm on the PDF pages containing Table 6 'U.S. Coal Supply, Consumption, and " +
      "Inventories' and Table 8 'U.S. Renewable Energy Consumption') confirms: (1) a three-level hierarchical " +
      "column header — year (2025/2026/2027) merged across 4 quarter sub-columns each, plus a separate " +
      "merged 'Year' group with 3 annual-total sub-columns, 15 data columns total per table; (2) row-label " +
      "hierarchy expressed purely through indentation with no repeated section name per row (e.g. 'Supply' > " +
      "'Total supply' > 'Secondary inventory withdrawals', 'Waste coal (a)'); (3) lettered footnote markers " +
      "(a)-(g) attached directly to row labels (not body prose) and resolved in a table note block " +
      "immediately below the table, structurally distinct from DRA-DOC-0024's in-prose numeric footnotes; " +
      "(4) negative values (e.g. '-23.8', '-89.7') and a literal '-' placeholder meaning 'no data available' " +
      "(explicitly defined in the table notes), both of which a naive text-flattening pass could misparse as " +
      "hyphenation or an em-dash; (5) a title-level unit ('million short tons', 'quadrillion Btu') that " +
      "applies to every cell in the table but appears nowhere in the row or column labels themselves — a " +
      "direct test of the 'numeric values losing units' failure mode; and (6) critically, a VISUAL-ONLY " +
      "semantic cue: per the tables' own notes, 'The approximate break between historical and forecast " +
      "values is shown with historical data with no shading; estimates and forecasts are shaded gray' — this " +
      "historical-vs-forecast distinction is encoded purely in cell background colour and is not present in " +
      "the extracted text at all, so it cannot survive `pdftotext` regardless of layout fidelity. This is " +
      "the strongest concrete instance found of 'values being associated with the wrong category' as a " +
      "structural (not extraction-bug) risk, distinct from anything tested in DRA-DOC-0023 or DRA-DOC-0024.",
    visuallyInspectedPages: [
      "Table 6 'U.S. Coal Supply, Consumption, and Inventories' (rendered at 100 DPI, single page)",
      "Table 8 'U.S. Renewable Energy Consumption' (rendered at 100 DPI, single page)",
    ],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "New publisher (U.S. Energy Information Administration) and a new document genre (recurring monthly " +
      "statistical/economic outlook with a fixed numeric-appendix format) not previously represented; the " +
      "corpus has no prior document whose primary content is dense multi-column statistical tables rather " +
      "than prose with occasional figures.",
    corpusDiversityLimitation:
      "Adds a fourth U.S.-jurisdiction PUBLIC_DOMAIN document (after DRA-DOC-0010 NIST, DRA-DOC-0013 FDA, " +
      "DRA-DOC-0024 CRS); selected for table-structure merit, not jurisdiction-balance improvement.",
    knownRisks: [
      "STEO is a monthly recurring publication; the exact edition (July 2026) must be pinned by URL and " +
        "digest at admission time, since eia.gov/outlooks/steo/pdf/steo_full.pdf will be overwritten with a " +
        "new edition at the next monthly release.",
      "Body-page 'Table 1' (Strait of Hormuz disruption estimate) is a simpler two-column table and should " +
        "not be confused with the far more complex numbered appendix tables (also titled 'Table 1', 'Table " +
        "2', etc.) — Phase 2 evaluation and analysis must target the appendix tables specifically.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 2: Federal Reserve Board — Survey of Consumer Finances (alternate) ---
  Object.freeze({
    candidateId: "DRA-CAND-021-02",
    title: "Changes in U.S. Family Finances from 2019 to 2022: Evidence from the Survey of Consumer Finances",
    publisher: "Board of Governors of the Federal Reserve System",
    jurisdiction: "United States",
    domain: "FINANCE",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.federalreserve.gov/publications/files/scf23.pdf",
    publicationDate: "2023-10",
    approximateSize: "10,136,125 bytes, 58 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — the Federal Reserve Board's own disclaimer page (federalreserve.gov/disclaimer.htm) " +
      "states verbatim: \"Unless otherwise indicated, information on Board's website is in the public domain " +
      "and may be copied and distributed without permission. Please cite to the Board as the source of the " +
      "information.\" This is a Board of Governors publication (not a Reserve Bank publication, which can " +
      "carry different status), consistent with the report's own authorship line.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on federalreserve.gov (canonical URL confirmed by direct link from the SCF landing page " +
      "federalreserve.gov/econres/scfindex.htm) returned HTTP 200, content-type application/pdf, " +
      "content-length 10,136,125 bytes, no authentication or paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "2666446e9c0cc100b9816d8b7c6569722d9d96af5359ce8f2de51aedf97b8276 and identical byte length 10,136,125.",
    tableCountObserved: 5,
    structuralElementsObserved: [
      "multiple_complex_tables",
      "multi_column_tables",
      "hierarchical_headers",
      "numeric_and_textual_cells",
      "units",
      "percentages",
      "dates",
      "categorical_comparisons",
      "table_notes",
    ],
    structuralEvidenceNote:
      "Rendered pages for Table 1 ('Before-tax median and mean family income') and Table 3 ('Holding and " +
      "values of assets') were inspected directly at 150 DPI. Table 1 has a two-level column header (Median " +
      "income / Mean income, each split into 2019, 2022, Percent change) and a parenthetical standard-error " +
      "row nested immediately under the 'All families' data row with no label of its own — a direct test of " +
      "row-to-row association surviving flattening. Table 3 is more complex still: three top-level merged " +
      "column groups (Percent holding / Conditional median value / Conditional mean value), each with three " +
      "sub-columns, over bold subtotal rows ('Any financial asset') and indented item rows, including one " +
      "decimal-only cell value ('.9') without a leading zero. No visual-only (colour-only) semantic cue was " +
      "found comparable to DRA-CAND-021-01's historical/forecast shading.",
    visuallyInspectedPages: [
      "Table 1 'Before-tax median and mean family income' (rendered at 150 DPI, single page)",
      "Table 3 'Holding and values of assets' (rendered at 150 DPI, single page)",
    ],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "New publisher (Federal Reserve Board) with a triennial household-finance survey genre not previously " +
      "represented.",
    corpusDiversityLimitation:
      "Same FINANCE domain and U.S. jurisdiction as the recommended candidate; would not add jurisdiction or " +
      "domain diversity beyond what DRA-CAND-021-01 already contributes.",
    knownRisks: [
      "Genuinely complex and well-governed, but its strongest structural risks (hierarchical headers, " +
        "subtotal rows, standard-error sub-rows) are a subset of what DRA-CAND-021-01 already exhibits, and " +
        "it lacks the visual-only historical/forecast shading cue that gives DRA-CAND-021-01 its strongest " +
        "single experimental angle.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 3: Congressional Budget Office — Budget and Economic Outlook (rejected, blocked) ---
  Object.freeze({
    candidateId: "DRA-CAND-021-03",
    title: "The Budget and Economic Outlook: 2025 to 2035",
    publisher: "Congressional Budget Office (CBO)",
    jurisdiction: "United States",
    domain: "FINANCE",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.cbo.gov/system/files/2025-01/60870-Outlook-2025.pdf",
    publicationDate: "2025-01",
    approximateSize: "unknown — blocked before headers could be read past the challenge response",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "Not verified — the licence position could not be read from document content because every fetch " +
      "attempt was blocked before any PDF bytes were returned. CBO reports are conventionally U.S. " +
      "government public-domain works, but that is a genre inference here, not a confirmed document-level " +
      "statement.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "BLOCKED",
    accessibilityEvidence:
      "Two independent live GET attempts on cbo.gov (one plain, one with a standard desktop-browser " +
      "User-Agent header) both returned HTTP 403 with a short (767-byte) HTML challenge/block response " +
      "rather than the PDF, and a direct fetch of the cbo.gov/topics/budget landing page also returned HTTP " +
      "403 — consistent with the Cloudflare/bot-mitigation blocking pattern already recorded for the OBR, " +
      "Ofwat, and Ofcom in prior acquisitions.",
    sourceStabilityStatus: "BLOCKED",
    stabilityObservations: "Not applicable — no document bytes were ever retrieved.",
    tableCountObserved: null,
    structuralElementsObserved: [],
    structuralEvidenceNote:
      "No structural elements are recorded as observed, per the established rule that a BLOCKED candidate's " +
      "structuralElementsObserved list must remain empty. CBO's Budget and Economic Outlook is known by " +
      "reputation to contain exactly the kind of multi-year hierarchical budget-category tables this probe " +
      "targets, but that reputation was not used as a substitute for direct inspection.",
    visuallyInspectedPages: [],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would have added a new publisher (Congressional Budget Office) had it been accessible.",
    corpusDiversityLimitation: "Rejected on accessibility grounds before diversity could be realised.",
    knownRisks: [
      "cbo.gov bot mitigation blocked every attempted access method used; a materially different access " +
        "path (e.g. a different network egress or an authenticated browser session) would be required before " +
        "reconsidering this candidate, which is out of scope for this discovery-only phase.",
    ],
    qualificationOutcome: "REJECTED_BLOCKED",
    rejectionOrDeferralReason:
      "HTTP accessibility is BLOCKED on all attempted requests; per the established rule (DRA-ACQ-019/020), " +
      "no BLOCKED candidate may be marked QUALIFIED_RECOMMENDED or QUALIFIED_ALTERNATE regardless of how " +
      "promising its reputation or genre.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

/**
 * Deterministic, pre-declared ranking rule: VERIFIED_ACCESSIBLE + BYTE_STABLE candidates rank above BLOCKED
 * candidates; among accessible candidates, the count of desired structural elements actually observed
 * (descending) breaks ties, since structural richness — not table count alone — is this probe's defining
 * selection axis.
 */
function rankCandidates(candidates: readonly CandidateRecord[]): readonly string[] {
  const accessible = candidates
    .filter((c) => c.httpAccessibility === "VERIFIED_ACCESSIBLE")
    .slice()
    .sort((a, b) => b.structuralElementsObserved.length - a.structuralElementsObserved.length);
  const blocked = candidates.filter((c) => c.httpAccessibility === "BLOCKED");
  return Object.freeze([...accessible, ...blocked].map((c) => c.candidateId));
}

export const RANKED_CANDIDATE_IDS: readonly string[] = rankCandidates(CANDIDATE_REGISTER);
export const PRIMARY_CANDIDATE_ID = "DRA-CAND-021-01";
export const ALTERNATE_1_CANDIDATE_ID = "DRA-CAND-021-02";
export const ALTERNATE_2_CANDIDATE_ID = "DRA-CAND-021-03";

export function getCandidateById(candidateId: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export function primaryCandidate(): CandidateRecord {
  const candidate = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!candidate) throw new Error(`Primary candidate ${PRIMARY_CANDIDATE_ID} not found in CANDIDATE_REGISTER`);
  return candidate;
}

export type Phase1Verdict = "QUALIFIED" | "NO_QUALIFIED_CANDIDATE" | "BLOCKED";

/**
 * QUALIFIED requires: VERIFIED official source, VERIFIED licence, VERIFIED_ACCESSIBLE + BYTE_STABLE or
 * TEXT_STABLE, at least one page directly visually inspected, and a non-trivial count of observed desired
 * structural elements (>= 8, i.e. most of DESIRED_STRUCTURAL_ELEMENTS). All hold for the primary candidate.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const accessible = c.httpAccessibility === "VERIFIED_ACCESSIBLE";
  const stable = c.sourceStabilityStatus === "BYTE_STABLE" || c.sourceStabilityStatus === "TEXT_STABLE";
  const officialAndLicensed = c.officialSourceStatus === "VERIFIED" && c.licenceReuseStatus === "VERIFIED";
  const visuallyVerified = c.visuallyInspectedPages.length > 0;
  const richStructure = c.structuralElementsObserved.length >= 8;
  if (c.httpAccessibility === "BLOCKED") return "BLOCKED";
  if (accessible && stable && officialAndLicensed && visuallyVerified && richStructure) return "QUALIFIED";
  return "NO_QUALIFIED_CANDIDATE";
}

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record
// ---------------------------------------------------------------------------

export const PHASE_1_QUALIFICATION_RECORD = deepFreeze({
  recommendation: primaryCandidatePhase1Verdict(),
  candidateIdentity: Object.freeze({
    title: primaryCandidate().title,
    issuingAuthority: primaryCandidate().publisher,
    officialSourceUrl: primaryCandidate().officialSourceUrl,
    proposedCorpusId: "DRA-DOC-0025",
  }),
  governance: Object.freeze({
    officialSourceStatus: primaryCandidate().officialSourceStatus,
    licenceReuseStatus: primaryCandidate().licenceReuseStatus,
    licenceReuseBasis: primaryCandidate().licenceReuseBasis,
    unresolvedQuestions: Object.freeze([
      "STEO is a monthly recurring publication; the July 2026 edition fetched during this Phase 1 " +
        "investigation must be re-verified as still the current live edition (or the new current edition " +
        "re-pinned) at Phase 2 admission time, since the canonical URL is overwritten monthly.",
    ]),
  }),
  acquisition: Object.freeze({
    sourceFormat: primaryCandidate().sourceFormat,
    sourceStabilityStatus: primaryCandidate().sourceStabilityStatus,
    stabilityObservations: primaryCandidate().stabilityObservations,
    risks: primaryCandidate().knownRisks,
  }),
  evidenceContribution:
    "DRA-DOC-0025 would provide the corpus's first document whose primary evidentiary content is dense, " +
    "hierarchical, multi-column numeric tables rather than prose. It directly targets the tabular semantic " +
    "preservation question the DRA-ACQ-021 task exists to answer, including a concrete visual-only " +
    "(colour-shading) historical/forecast distinction not present in extracted text at all — a structural " +
    "risk category not previously tested anywhere in this corpus.",
  corpusContribution:
    "Adds a new publisher (EIA) and a new recurring-statistical-outlook genre. Does not diversify domain " +
    "(FINANCE) or jurisdiction (United States) beyond what is already well represented; selected purely for " +
    "table-structure experimental merit, consistent with the task's explicit instruction not to select for " +
    "publisher novelty over structural value.",
  risks: primaryCandidate().knownRisks,
  recommendationReasoning:
    "DRA-CAND-021-01 is the only candidate that is simultaneously VERIFIED official-source, VERIFIED licence " +
    "(explicit public-domain statement from EIA's own copyrights-and-reuse page), VERIFIED_ACCESSIBLE, " +
    "BYTE_STABLE across two independent live fetches, and confirmed by direct visual inspection of two " +
    "rendered PDF pages to contain hierarchical multi-level column headers, lettered table-note footnotes, " +
    "title-level units, negative-value and 'no data' notation, and — uniquely among all three candidates — a " +
    "genuine visual-only (colour-shading) semantic distinction absent from the extracted text altogether. " +
    "DRA-CAND-021-02 (Federal Reserve SCF) is a strong, fully qualified alternate with genuinely complex " +
    "tables but does not exceed DRA-CAND-021-01's structural richness and shares its FINANCE/United-States " +
    "profile, so it adds no distinct diversification if chosen instead. DRA-CAND-021-03 (CBO) was researched " +
    "in good faith and would likely have been at least as strong a candidate by reputation, but is blocked " +
    "by Cloudflare/bot mitigation on every attempted access method, the same class of blocker already " +
    "documented for the OBR, Ofwat, and Ofcom. No candidate was chosen, or rejected, on the basis of whether " +
    "it seemed likely to make the evaluator fail; that determination is explicitly reserved for a future " +
    "Phase 2 evaluation and is out of scope for this Phase 1 discovery module.",
  nextBestCandidateIfRejected: `${ALTERNATE_1_CANDIDATE_ID} is fully qualified and ready to substitute immediately if DRA-CAND-021-01's monthly-edition instability becomes a blocker at Phase 2 admission time; ${ALTERNATE_2_CANDIDATE_ID} would need its Cloudflare block resolved before it could be reconsidered.`,
});

// ---------------------------------------------------------------------------
// Part 6 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0025";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "reconfirm_steo_july_2026_edition_is_still_current_or_repin_to_new_edition",
  "deterministic_live_fetch_a_b_for_primary_candidate",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0025",
  "run_evaluator_0_1_2_against_dra_doc_0025_in_a_dedicated_benchmark",
  "compare_rendered_source_vs_extracted_vs_normalised_vs_statements_vs_evaluation_for_the_visually_baselined_tables",
  "assess_whether_the_historical_vs_forecast_shading_distinction_is_silently_lost_or_correctly_treated_as_unknowable",
  "record_confirmed_generalisable_weakness_or_isolated_anomaly_verdict_for_the_tabular_semantic_preservation_hypothesis",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0025",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_025",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "modify_dra_doc_0024",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_any_tabular_extraction_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
] as const);
