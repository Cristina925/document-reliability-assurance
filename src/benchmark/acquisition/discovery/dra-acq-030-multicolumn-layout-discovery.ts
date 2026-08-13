/**
 * DRA-ACQ-030 — Phase 1: Multi-Column Layout Candidate Discovery and
 * Qualification for DRA-DOC-0034 (reserved slot, next-after-0033)
 *
 * CONTEXT — DRA-ROB-001 (the robustness-evidence coverage review conducted
 * against the 32-document corpus, DOC-0001 through DOC-0032, plus
 * DRA-ENG-015/016/017/018/019/020/021/022/023) ranked "multi-column layout"
 * as the #5 highest-value untested robustness dimension in
 * ROBUSTNESS_EVIDENCE_MAP / RANKED_REMAINING_GAPS (see
 * dra-acq-028-non-latin-script-discovery.ts). No admitted document and no
 * engineering probe in this corpus has ever isolated genuine multi-column
 * reading order as its primary variable. DRA-ACQ-021 (tabular structure)
 * and DRA-ACQ-024/025 (figure/graphics semantics) each touched adjacent
 * visual-layout ground but explicitly excluded prose column flow from
 * their target dimension.
 *
 * CENTRAL RESEARCH QUESTION — Does DRA preserve correct semantic reading
 * order through extraction, normalisation, and segmentation for genuinely
 * multi-column source documents, isolated as cleanly as possible from
 * tables, sidebars, figures, and OCR/scan confounds (all already
 * separately characterised by DRA-ACQ-021/023/024/025 and
 * DRA-ENG-015/017/018)?
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This
 * module performs no acquisition, freeze, admission, or evaluator
 * execution. It does not create DRA-DOC-0034, a new freeze record, a new
 * acquisition record, or a DRA-BMK checkpoint, and it does not modify
 * evaluator 0.1.2, any pipeline stage, extraction, normalisation,
 * segmentation, or any existing frozen artefact.
 *
 * HARD CONSTRAINT — This module does not touch, reuse, renumber, or
 * interfere with DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033, all
 * still reserved for the blocked DRA-ACQ-029 (Devanagari) admission. If a
 * candidate qualifies here, it is reserved conceptually as the document
 * *after* DRA-DOC-0033 (i.e. DRA-DOC-0034), not before it.
 *
 * LIVE VERIFICATION RECORD — All HTTP status checks, PDF structural
 * inspection (`pdfinfo`), and extracted-text inspection (`pdftotext`,
 * both with and without `-layout`, matching the two extraction modes
 * observed in this corpus's own admission-test precedent — see
 * dra-acq-023/028 admission tests, which invoke
 * `pdftotext -layout <in> <out>` as DRA's production extraction
 * convention) were performed on 2026-08-11 against each candidate's
 * official publisher URL and are recorded here as fixed data. This module
 * does not re-fetch anything at runtime or during test execution, and it
 * does not invoke the DRA evaluator or any pipeline stage on any
 * candidate's bytes.
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at
 * DRA-ACQ-018 through DRA-ACQ-026) — No candidate in CANDIDATE_REGISTER
 * was fetched into, or run through, evaluator 0.1.2, the DRA pipeline, or
 * any of its stages, at any point during this Phase 1 investigation.
 * The pdftotext reconnaissance recorded in RECONNAISSANCE_FINDINGS
 * exercises Poppler's extraction only — the same tool family DRA's
 * injectable PdfExtractor delegates to in production admission tests —
 * never DRA's own segmentation, evaluation, or decision logic.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 32,
  priorFinding:
    "DRA-ROB-001 ranked multi-column layout as the #5 highest-value untested robustness dimension across the 32-" +
    "document corpus. DRA-ACQ-021 (tabular structure), DRA-ACQ-024/025 (figure/graphics semantics), and DRA-ENG-" +
    "015/017/018 (representation-boundary, provenance/fidelity, and graphical-semantic-completeness detectors) " +
    "each characterised an adjacent visual-layout dimension while explicitly treating genuine multi-column prose " +
    "reading order as out of scope.",
  centralResearchQuestion:
    "Does DRA preserve correct semantic reading order through extraction, normalisation, and segmentation for " +
    "genuinely multi-column source documents? This is isolated as cleanly as possible from tables (DRA-ACQ-021), " +
    "figures/diagrams (DRA-ACQ-024/025), sidebars, and OCR/scan provenance (DRA-ACQ-023, DRA-ENG-017) — all " +
    "already separately characterised dimensions.",
  excludedFraming:
    "Do not select a candidate merely because it has a table-like or figure-like visual layout; that ground is " +
    "already covered by DRA-ACQ-021/024/025. Do not select a scanned/OCR document; that ground is already " +
    "covered by DRA-ACQ-023 and DRA-ENG-017. The qualifying candidate must carry continuous, column-flowing " +
    "prose whose correct reading order genuinely depends on column-aware extraction.",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO CANDIDATE QUALIFIED is an explicitly acceptable Phase 1 outcome per the task specification. This module " +
    "does not force a candidate to qualify merely to reach a 34th corpus document.",
  reservationConstraint:
    "DRA-FRZ-000027, DRA-ACQ-000036, and DRA-DOC-0033 remain reserved for the still-blocked DRA-ACQ-029 " +
    "(Devanagari) admission and are not touched, reused, or renumbered by this programme. A qualifying " +
    "candidate here is reserved conceptually as DRA-DOC-0034 (the document after DOC-0033), not before it.",
});

// ---------------------------------------------------------------------------
// Part 2 — Failure-mode taxonomy and materiality standard
// ---------------------------------------------------------------------------

export const FAILURE_MODES = [
  "COLUMN_INTERLEAVING",
  "COLUMN_ORDER_REVERSAL",
  "CROSS_COLUMN_SENTENCE_CORRUPTION",
  "HEADING_BODY_MISORDER",
  "FOOTNOTE_INTRUSION",
  "COLUMN_TRANSITION_LOSS",
  "PAGE_STREAM_CORRUPTION",
] as const;
export type FailureMode = (typeof FAILURE_MODES)[number];

export const FAILURE_MODE_DESCRIPTIONS: Readonly<Record<FailureMode, string>> = Object.freeze({
  COLUMN_INTERLEAVING:
    "Text from two or more columns is emitted in an interleaved (row-by-row or paragraph-by-paragraph mixed) " +
    "order instead of one full column followed by the next.",
  COLUMN_ORDER_REVERSAL: "Columns are emitted in the wrong left-to-right (or right-to-left) order.",
  CROSS_COLUMN_SENTENCE_CORRUPTION:
    "A single sentence or clause is split across columns and reassembled incorrectly, splicing unrelated " +
    "fragments from adjacent columns into one grammatically broken run.",
  HEADING_BODY_MISORDER: "A heading (or its owning body text) is displaced relative to the text it introduces.",
  FOOTNOTE_INTRUSION: "Footnote or margin text is spliced into the middle of column body text.",
  COLUMN_TRANSITION_LOSS: "Text at a column boundary is dropped or duplicated at the transition point.",
  PAGE_STREAM_CORRUPTION:
    "Page-furniture text (running headers, footers, page numbers, production stamps) is spliced into the " +
    "middle of a sentence rather than appearing at a clean page boundary.",
});

export const MATERIALITY_STANDARD = Object.freeze({
  rule:
    "A demonstrated reading-order defect is MATERIAL only if it measurably changes downstream semantics: " +
    "statement formation, claim boundaries, evidence linkage, authority interpretation, issue generation, or the " +
    "final decision. Textual misordering alone, without a demonstrated evaluation-level impact, is a NONMATERIAL " +
    "representation defect.",
  distinguishesFrom:
    "This standard deliberately separates correctness (did the text come out in the right order?) from " +
    "materiality (did the wrong order change what the evaluator concluded?). Conflating the two would " +
    "overstate or understate defect severity relative to prior conventions (DRA-ACQ-020 footnote-flattening, " +
    "DRA-ACQ-024 flowchart-topology, DRA-ACQ-025 non-redundant-graphics all applied the same separation).",
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register status vocabularies
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["OFFICIAL_PUBLISHER", "INACCESSIBLE", "NOT_OFFICIAL"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_STATUSES = [
  "PUBLIC_DOMAIN",
  "CC_BY",
  "PERMISSION_REQUIRED",
  "UNVERIFIED",
] as const;
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];

export const LAYOUT_VERIFICATION_STATUSES = [
  "GENUINE_MULTI_COLUMN_PROSE",
  "SINGLE_COLUMN_WITH_MARGIN",
  "NOT_MULTI_COLUMN",
  "PARALLEL_BILINGUAL_COLUMNS",
] as const;
export type LayoutVerificationStatus = (typeof LAYOUT_VERIFICATION_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = ["QUALIFIED_PRIMARY", "QUALIFIED_ALTERNATE", "REJECTED"] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

// ---------------------------------------------------------------------------
// Part 4 — Candidate record shape
// ---------------------------------------------------------------------------

export interface MultiColumnCandidateRecord {
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
  readonly layoutVerification: LayoutVerificationStatus;
  readonly layoutEvidence: string;
  readonly readingOrderOracle: string;
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionReason: string | null;
}

// ---------------------------------------------------------------------------
// Part 5 — Candidate register (all investigated candidates, live-verified
// 2026-08-11; qualified, rejected, and inaccessible candidates alike)
// ---------------------------------------------------------------------------

export const CANDIDATE_REGISTER: readonly MultiColumnCandidateRecord[] = Object.freeze([
  Object.freeze({
    candidateId: "FEDERAL_REGISTER_2024_01_05",
    title: "Federal Register, Vol. 89, No. 4, Friday, January 5, 2024 (full daily issue)",
    publisher: "Office of the Federal Register, National Archives and Records Administration / U.S. GPO",
    domain: "LEGAL",
    documentType: "REPORT",
    sourceUrl: "https://www.govinfo.gov/content/pkg/FR-2024-01-05/pdf/FR-2024-01-05.pdf",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "PUBLIC_DOMAIN",
    licenceEvidence:
      "U.S. federal government edicts/publications of this kind are public domain under 17 U.S.C. § 105 " +
      "(no copyright protection for U.S. Government works); the same basis already relied on for DRA-DOC-0024 " +
      "(CRS report) and DRA-DOC-0027 (GovInfo scan).",
    pageCount: 170,
    layoutVerification: "GENUINE_MULTI_COLUMN_PROSE",
    layoutEvidence:
      "pdfinfo confirms 170 letter-size pages. pdftotext (both default and -layout) over the issue's Notices " +
      "section shows genuine 3-column running prose (confirmed independently on the constituent granule " +
      "FR Doc. 2024-00001, pages 824-825): headings, signature blocks, and agency names from column 2 are " +
      "physically interposed between columns 1's sentences in raw reading order. The Rules and Regulations " +
      "section (e.g. FR Doc. 2024-00091, 45 CFR Part 88) is 2-column with numbered CFR sections (§88.1-§88.4).",
    readingOrderOracle:
      "GovInfo publishes an official MODS/XML metadata file per issue " +
      "(https://www.govinfo.gov/metadata/pkg/FR-2024-01-05/mods.xml, verified 200 OK, XML, distinct from any " +
      "DRA extraction output) listing every constituent granule's title, publisher part (e.g. 'Rules and " +
      "Regulations'), page-range extent, unique granuleId/accessId, and a per-granule HTML mirror URL " +
      "(e.g. https://www.govinfo.gov/content/pkg/FR-2024-01-05/html/2024-00028.htm) — an independent, official, " +
      "non-OCR, non-DRA parallel text representation. Each granule additionally self-terminates with a globally " +
      "unique '[FR Doc. YYYY-NNNNN Filed ...]' citation stamp, giving a second, redundant, trivially checkable " +
      "boundary oracle. Rules-and-Regulations text additionally carries strictly sequential numbered sections " +
      "(§88.1 -> §88.2 -> §88.3 -> §88.4) as a third oracle.",
    qualificationOutcome: "QUALIFIED_PRIMARY",
    rejectionReason: null,
  }),
  Object.freeze({
    candidateId: "CONGRESSIONAL_RECORD_2024_01_09",
    title: "Congressional Record, Vol. 170, No. 4, Tuesday, January 9, 2024 (House proceedings, full daily issue)",
    publisher: "U.S. Government Publishing Office / Office of the Clerk, U.S. House of Representatives",
    domain: "LEGAL",
    documentType: "REPORT",
    sourceUrl: "https://www.govinfo.gov/content/pkg/CREC-2024-01-09/pdf/CREC-2024-01-09.pdf",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "PUBLIC_DOMAIN",
    licenceEvidence: "Public domain under 17 U.S.C. § 105, same basis as the Federal Register candidate.",
    pageCount: 51,
    layoutVerification: "GENUINE_MULTI_COLUMN_PROSE",
    layoutEvidence:
      "pdfinfo confirms 51 pages. pdftotext confirms genuine 2-column proceedings-and-debate prose plus " +
      "alphabetised roll-call vote lists (a distinct, non-prose visual pattern deliberately excluded from " +
      "ranking as a reading-order test vector because vote lists have no inherent linear reading-order " +
      "requirement).",
    readingOrderOracle:
      "GovInfo publishes an equivalent per-issue MODS/XML metadata file for the Congressional Record " +
      "(same mechanism as the Federal Register), plus the House Clerk's own independent roll-call vote " +
      "database (clerk.house.gov) as a secondary oracle for the vote-list portions.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionReason: null,
  }),
  Object.freeze({
    candidateId: "CANADA_GAZETTE_2026_07_11",
    title: "Canada Gazette, Part I, Vol. 160, No. 28, July 11, 2026",
    publisher: "Government of Canada / Public Services and Procurement Canada",
    domain: "LEGAL",
    documentType: "REPORT",
    sourceUrl: "https://gazette.gc.ca/rp-pr/p1/2026/2026-07-11/pdf/g1-16028.pdf",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "PERMISSION_REQUIRED",
    licenceEvidence:
      "The document's own text states: 'For information regarding reproduction rights, please contact Services " +
      "publics et Approvisionnement Canada' — an explicit permission-required notice, not an open licence " +
      "statement. No Open Government Licence - Canada grant was located for this specific publication within " +
      "the Phase 1 verification budget. This mirrors the DRA-ACQ-024 Bank-of-England non-OGL rejection pattern: " +
      "an otherwise strong candidate rejected purely on unresolved licence grounds.",
    pageCount: 83,
    layoutVerification: "PARALLEL_BILINGUAL_COLUMNS",
    layoutEvidence:
      "pdfinfo confirms 83 pages. pdftotext (both default and -layout) shows a genuine 2-column parallel " +
      "English/French layout where each paragraph-level block is correctly kept intact and column membership " +
      "is unambiguous by language alone (an unusually strong potential oracle) — but in the sampled notices " +
      "both extraction modes already reproduced correct block-level EN/FR alternation with no observed defect, " +
      "making this a lower-expected-information-gain candidate even before the licence question.",
    readingOrderOracle:
      "Language identity (English vs. French) gives a trivial, unambiguous per-token reading-order oracle — " +
      "noted for the record even though this candidate is rejected on licence grounds.",
    qualificationOutcome: "REJECTED",
    rejectionReason:
      "LICENCE_UNVERIFIED_PERMISSION_REQUIRED: explicit reproduction-rights-on-request notice found in-document; " +
      "no open-licence grant located within the Phase 1 budget.",
  }),
  Object.freeze({
    candidateId: "EU_OJ_AI_ACT_2024_1689",
    title: "Official Journal of the European Union, L series — Regulation (EU) 2024/1689 (Artificial Intelligence Act)",
    publisher: "Publications Office of the European Union",
    domain: "LEGAL",
    documentType: "REPORT",
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "CC_BY",
    licenceEvidence:
      "EU Official Journal content is reusable under the Commission Decision 2011/833/EU reuse policy, " +
      "consistent with the CC BY 4.0 precedent already established for EU documents at DRA-ACQ-014/015.",
    pageCount: 144,
    layoutVerification: "NOT_MULTI_COLUMN",
    layoutEvidence:
      "pdfinfo confirms 144 pages. pdftotext (both modes) shows the recitals and enacting-terms body running " +
      "full-page-width in a single column throughout the sampled pages; no column-boundary artefacts, no " +
      "interleaving, and no reading-order risk were observed. This EU Official Journal act does not carry the " +
      "genuinely multi-column layout the task specification requires (unlike some EU OJ 'C series' notices, " +
      "which were not separately re-verified here).",
    readingOrderOracle: "Not applicable — rejected on layout grounds before an oracle was required.",
    qualificationOutcome: "REJECTED",
    rejectionReason: "NOT_GENUINELY_MULTI_COLUMN: body text is single-column full-page-width throughout.",
  }),
  Object.freeze({
    candidateId: "COPERNICUS_ACP_2023_1227",
    title:
      "Shah et al., 'Nitrogen oxides in the free troposphere: implications for tropospheric oxidants and the " +
      "interpretation of satellite NO2 measurements', Atmospheric Chemistry and Physics 23, 1227-1257 (2023)",
    publisher: "Copernicus Publications (European Geosciences Union)",
    domain: "TECHNICAL",
    documentType: "ARTICLE",
    sourceUrl: "https://acp.copernicus.org/articles/23/1227/2023/acp-23-1227-2023.pdf",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "CC_BY",
    licenceEvidence:
      "In-document notice: 'This work is distributed under the Creative Commons Attribution 4.0 License.'",
    pageCount: 31,
    layoutVerification: "GENUINE_MULTI_COLUMN_PROSE",
    layoutEvidence:
      "pdfinfo confirms 31 pages. pdftotext (default mode) reproduces this article's classic two-column " +
      "academic layout with no interleaving in every sampled body section: column 1 completes in full before " +
      "column 2 begins. This is genuine multi-column prose, but with no defect observed under default " +
      "extraction in the sampled pages, giving lower expected information gain than the Federal Register's " +
      "denser, narrower 3-column notices layout.",
    readingOrderOracle:
      "The article's own numbered section headings ('1 Introduction', '2 ...', etc.) and its DOI-resolvable " +
      "publisher HTML rendition (acp.copernicus.org) serve as an independent parallel oracle.",
    qualificationOutcome: "REJECTED",
    rejectionReason:
      "LOWER_INFORMATION_GAIN: genuine 2-column prose confirmed, but no reading-order defect observed under " +
      "sampled extraction; retained in the register as a valuable correctly-behaving control rather than a " +
      "qualifying candidate, per the cost-discipline / expected-information-gain ranking criterion.",
  }),
  Object.freeze({
    candidateId: "SCIPY_PROCEEDINGS_FRWC3537",
    title: "SciPy Proceedings: An Exemplar for Publishing Computational Open Science (SciPy 2025)",
    publisher: "SciPy Proceedings / Curvenote Inc.",
    domain: "TECHNICAL",
    documentType: "ARTICLE",
    sourceUrl: "https://proceedings.scipy.org/articles/frwc3537.pdf",
    httpStatusObserved: 200,
    officialSourceStatus: "OFFICIAL_PUBLISHER",
    licenceStatus: "CC_BY",
    licenceEvidence:
      "In-document notice: 'This is an open-access article distributed under the terms of the Creative Commons " +
      "Attribution 4.0 International license.'",
    pageCount: 9,
    layoutVerification: "SINGLE_COLUMN_WITH_MARGIN",
    layoutEvidence:
      "pdfinfo confirms 9 pages. pdftotext (-layout) shows a single wide main-body text column with a narrow " +
      "left/right margin sidebar carrying metadata (author, correspondence, publication date, copyright " +
      "notice) — a modern Typst/MyST journal template, not genuinely multi-column continuous prose.",
    readingOrderOracle: "Not applicable — rejected on layout grounds before an oracle was required.",
    qualificationOutcome: "REJECTED",
    rejectionReason: "NOT_GENUINELY_MULTI_COLUMN: single main column plus a narrow non-prose margin sidebar.",
  }),
  Object.freeze({
    candidateId: "IEEE_ACCESS_SAMPLE",
    title: "IEEE Access (open-access, CC BY 4.0, two-column IEEE house style)",
    publisher: "IEEE",
    domain: "TECHNICAL",
    documentType: "ARTICLE",
    sourceUrl: "https://ieeexplore.ieee.org/ (direct PDF stamping endpoint)",
    httpStatusObserved: 418,
    officialSourceStatus: "INACCESSIBLE",
    licenceStatus: "UNVERIFIED",
    licenceEvidence:
      "IEEE Access is known to publish fully open-access CC BY 4.0 articles in classic two-column IEEE style, " +
      "but the direct PDF-stamping endpoint returned HTTP 418 (anti-bot block) during this Phase 1 session; no " +
      "specific article was reachable to verify licence or layout in-document.",
    pageCount: 0,
    layoutVerification: "NOT_MULTI_COLUMN",
    layoutEvidence: "Not verified — source inaccessible during this session.",
    readingOrderOracle: "Not applicable — rejected on accessibility grounds.",
    qualificationOutcome: "REJECTED",
    rejectionReason: "SOURCE_INACCESSIBLE: HTTP 418 anti-bot block on the direct PDF-stamping endpoint.",
  }),
  Object.freeze({
    candidateId: "NATURE_COMMUNICATIONS_SAMPLE",
    title: "Nature Communications (open-access, CC BY 4.0, two-column Springer Nature house style)",
    publisher: "Springer Nature",
    domain: "TECHNICAL",
    documentType: "ARTICLE",
    sourceUrl: "https://www.nature.com/articles/s41467-023-44370-x.pdf",
    httpStatusObserved: 303,
    officialSourceStatus: "INACCESSIBLE",
    licenceStatus: "UNVERIFIED",
    licenceEvidence:
      "Nature Communications articles are commonly CC BY 4.0, but the direct PDF URL redirected (HTTP 303) to " +
      "an authentication gate (idp.nature.com) even for a nominally open-access article; not reachable " +
      "unauthenticated during this Phase 1 session.",
    pageCount: 0,
    layoutVerification: "NOT_MULTI_COLUMN",
    layoutEvidence: "Not verified — source inaccessible during this session.",
    readingOrderOracle: "Not applicable — rejected on accessibility grounds.",
    qualificationOutcome: "REJECTED",
    rejectionReason: "SOURCE_INACCESSIBLE: redirects to an authentication gate even for nominally open content.",
  }),
]);

export const CANDIDATE_IDS: readonly string[] = Object.freeze(CANDIDATE_REGISTER.map((c) => c.candidateId));

export function getCandidateById(candidateId: string): MultiColumnCandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export const PRIMARY_CANDIDATE_ID = "FEDERAL_REGISTER_2024_01_05" as const;
export const ALTERNATE_CANDIDATE_ID = "CONGRESSIONAL_RECORD_2024_01_09" as const;
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(
  CANDIDATE_REGISTER.filter((c) => c.qualificationOutcome === "REJECTED").map((c) => c.candidateId),
);

export function primaryCandidate(): MultiColumnCandidateRecord {
  const record = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!record) {
    throw new Error("Primary candidate record missing from CANDIDATE_REGISTER.");
  }
  return record;
}

export function alternateCandidate(): MultiColumnCandidateRecord {
  const record = getCandidateById(ALTERNATE_CANDIDATE_ID);
  if (!record) {
    throw new Error("Alternate candidate record missing from CANDIDATE_REGISTER.");
  }
  return record;
}

// ---------------------------------------------------------------------------
// Part 6 — Ranking criteria (13 named dimensions)
// ---------------------------------------------------------------------------

export const RANKING_CRITERIA_ORDER = [
  "MULTI_COLUMN_COMPLEXITY",
  "ORACLE_STRENGTH",
  "OFFICIAL_SOURCE_STRENGTH",
  "LICENCE_CERTAINTY",
  "SOURCE_STABILITY",
  "TEXT_LAYER_QUALITY",
  "ISOLATION_FROM_OTHER_DIMENSIONS",
  "SEMANTIC_RISK",
  "MULTI_PAGE_COVERAGE",
  "LOW_OCR_TABLE_CONFOUNDING",
  "REPRODUCIBILITY",
  "EXPECTED_GC1_INFORMATION_GAIN",
] as const;
export type RankingCriterion = (typeof RANKING_CRITERIA_ORDER)[number];

export interface RankedCandidateScore {
  readonly candidateId: string;
  readonly scores: Readonly<Record<RankingCriterion, "HIGH" | "MEDIUM" | "LOW" | "NOT_APPLICABLE">>;
  readonly rationale: string;
}

export const RANKED_CANDIDATE_SCORES: readonly RankedCandidateScore[] = Object.freeze([
  Object.freeze({
    candidateId: "FEDERAL_REGISTER_2024_01_05",
    scores: Object.freeze({
      MULTI_COLUMN_COMPLEXITY: "HIGH",
      ORACLE_STRENGTH: "HIGH",
      OFFICIAL_SOURCE_STRENGTH: "HIGH",
      LICENCE_CERTAINTY: "HIGH",
      SOURCE_STABILITY: "HIGH",
      TEXT_LAYER_QUALITY: "HIGH",
      ISOLATION_FROM_OTHER_DIMENSIONS: "MEDIUM",
      SEMANTIC_RISK: "HIGH",
      MULTI_PAGE_COVERAGE: "HIGH",
      LOW_OCR_TABLE_CONFOUNDING: "MEDIUM",
      REPRODUCIBILITY: "HIGH",
      EXPECTED_GC1_INFORMATION_GAIN: "HIGH",
    }),
    rationale:
      "Confirmed genuine 3-column layout with an empirically observed interleaving symptom, three independent " +
      "reading-order oracles (MODS/XML metadata, per-granule HTML mirror, FR Doc citation stamps / sequential " +
      "CFR section numbers), rock-solid public-domain licence, and a 170-page issue offering ample multi-page " +
      "coverage. Isolation is MEDIUM rather than HIGH because some pages carry small tables/signature blocks " +
      "alongside the target column-flow prose.",
  }),
  Object.freeze({
    candidateId: "CONGRESSIONAL_RECORD_2024_01_09",
    scores: Object.freeze({
      MULTI_COLUMN_COMPLEXITY: "MEDIUM",
      ORACLE_STRENGTH: "MEDIUM",
      OFFICIAL_SOURCE_STRENGTH: "HIGH",
      LICENCE_CERTAINTY: "HIGH",
      SOURCE_STABILITY: "HIGH",
      TEXT_LAYER_QUALITY: "HIGH",
      ISOLATION_FROM_OTHER_DIMENSIONS: "MEDIUM",
      SEMANTIC_RISK: "MEDIUM",
      MULTI_PAGE_COVERAGE: "HIGH",
      LOW_OCR_TABLE_CONFOUNDING: "MEDIUM",
      REPRODUCIBILITY: "HIGH",
      EXPECTED_GC1_INFORMATION_GAIN: "MEDIUM",
    }),
    rationale:
      "Same publisher family and licence strength as the primary candidate, genuine 2-column proceedings prose, " +
      "but a somewhat weaker oracle (no per-granule citation-stamp convention as tight as the Federal Register's) " +
      "and lower observed column complexity (2 columns vs. 3), reducing expected information gain relative to " +
      "the primary. Strong choice as the Phase 2 alternate if the primary proves inconclusive.",
  }),
  Object.freeze({
    candidateId: "COPERNICUS_ACP_2023_1227",
    scores: Object.freeze({
      MULTI_COLUMN_COMPLEXITY: "MEDIUM",
      ORACLE_STRENGTH: "MEDIUM",
      OFFICIAL_SOURCE_STRENGTH: "HIGH",
      LICENCE_CERTAINTY: "HIGH",
      SOURCE_STABILITY: "HIGH",
      TEXT_LAYER_QUALITY: "HIGH",
      ISOLATION_FROM_OTHER_DIMENSIONS: "HIGH",
      SEMANTIC_RISK: "LOW",
      MULTI_PAGE_COVERAGE: "MEDIUM",
      LOW_OCR_TABLE_CONFOUNDING: "HIGH",
      REPRODUCIBILITY: "HIGH",
      EXPECTED_GC1_INFORMATION_GAIN: "LOW",
    }),
    rationale:
      "Cleanest isolation and licence certainty of any candidate, but no reading-order defect was observed in " +
      "sampled default extraction, giving low expected information gain as a primary or alternate. Retained as " +
      "a documented correctly-behaving control for the final report's comparative analysis.",
  }),
  Object.freeze({
    candidateId: "CANADA_GAZETTE_2026_07_11",
    scores: Object.freeze({
      MULTI_COLUMN_COMPLEXITY: "MEDIUM",
      ORACLE_STRENGTH: "HIGH",
      OFFICIAL_SOURCE_STRENGTH: "HIGH",
      LICENCE_CERTAINTY: "LOW",
      SOURCE_STABILITY: "HIGH",
      TEXT_LAYER_QUALITY: "HIGH",
      ISOLATION_FROM_OTHER_DIMENSIONS: "HIGH",
      SEMANTIC_RISK: "MEDIUM",
      MULTI_PAGE_COVERAGE: "HIGH",
      LOW_OCR_TABLE_CONFOUNDING: "HIGH",
      REPRODUCIBILITY: "HIGH",
      EXPECTED_GC1_INFORMATION_GAIN: "LOW",
    }),
    rationale:
      "Would have been a strong second alternate (bilingual columns give an unusually clean oracle) but is " +
      "gated out entirely by LICENCE_CERTAINTY = LOW (explicit permission-required notice), which is a hard " +
      "eligibility gate per DRA governance, not merely a scoring penalty.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 7 — Reconnaissance findings (live Poppler extraction, not the DRA
// pipeline) against the primary candidate's real bytes
// ---------------------------------------------------------------------------

export interface ReconnaissanceFinding {
  readonly candidateId: string;
  readonly extractionMode: "PDFTOTEXT_DEFAULT" | "PDFTOTEXT_LAYOUT";
  readonly failureModesObserved: readonly FailureMode[];
  readonly observation: string;
}

export const RECONNAISSANCE_FINDINGS: readonly ReconnaissanceFinding[] = Object.freeze([
  Object.freeze({
    candidateId: "FEDERAL_REGISTER_2024_01_05",
    extractionMode: "PDFTOTEXT_DEFAULT",
    failureModesObserved: Object.freeze(["COLUMN_INTERLEAVING", "HEADING_BODY_MISORDER"]) as readonly FailureMode[],
    observation:
      "On the 3-column Notices-section granule FR Doc. 2024-00001 (pages 824-825), default pdftotext extraction " +
      "emitted: [end of column-1 article 1 body] -> [column-2 heading 'SOCIAL SECURITY ADMINISTRATION'] -> " +
      "[column-1 article 1 signature block] -> [column-2 article body opening ('AGENCY: Social Security " +
      "Administration...')] -> [column-1 article 1 filing stamp] -> [column-1 article 2 heading]. Column 2's " +
      "heading and part of its body were physically interposed inside column 1's own article, between that " +
      "article's closing sentence and its signature block — a direct, reproducible COLUMN_INTERLEAVING and " +
      "HEADING_BODY_MISORDER instance under this extraction mode.",
  }),
  Object.freeze({
    candidateId: "FEDERAL_REGISTER_2024_01_05",
    extractionMode: "PDFTOTEXT_LAYOUT",
    failureModesObserved: Object.freeze(["COLUMN_INTERLEAVING"]) as readonly FailureMode[],
    observation:
      "On the same granule, `pdftotext -layout` (the extraction convention this corpus's own admission tests " +
      "invoke as DRA's production convention) preserved each column's physical x-position, but this caused a " +
      "different symptom: single output lines interleave short fragments from all three physical columns " +
      "side-by-side (column-1-row-N, column-2-row-N, column-3-row-N on one text line), which, when a downstream " +
      "consumer reads the string linearly top-to-bottom, still produces a column-interleaved reading order — " +
      "the failure mode is present under both extraction modes tested, with a different underlying mechanism.",
  }),
  Object.freeze({
    candidateId: "FEDERAL_REGISTER_2024_01_05",
    extractionMode: "PDFTOTEXT_DEFAULT",
    failureModesObserved: Object.freeze(["PAGE_STREAM_CORRUPTION"]) as readonly FailureMode[],
    observation:
      "On the 2-column Rules-and-Regulations granule FR Doc. 2024-00091 (45 CFR Part 88), default extraction " +
      "correctly preserved strict sequential order across §88.1 -> §88.2 -> §88.3 -> §88.4, but page-boundary " +
      "production furniture (e.g. 'E:\\FR\\FM\\11JAR2.SGM 11JAR2', a print-shop tracking stamp, and a running " +
      "page-number/header line) was spliced directly into the middle of running prose rather than appearing " +
      "only at a clean page boundary — a PAGE_STREAM_CORRUPTION instance distinct from column interleaving, " +
      "and one that did not, in this sampled section, disturb the numbered-section reading order itself.",
  }),
  Object.freeze({
    candidateId: "COPERNICUS_ACP_2023_1227",
    extractionMode: "PDFTOTEXT_DEFAULT",
    failureModesObserved: Object.freeze([]) as readonly FailureMode[],
    observation:
      "Default extraction over this article's genuine 2-column academic layout completed column 1 in full " +
      "before beginning column 2 in every sampled body section, with correct heading placement and no observed " +
      "footnote intrusion or column-transition loss. Recorded as a correctly-behaving control: pdftotext's " +
      "default reading-order heuristic handles clean, evenly-balanced 2-column academic layouts well; the " +
      "Federal Register's narrower, unevenly-sized 3-column legal-notice layout is the harder case that " +
      "actually exercises the failure.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 8 — Phase 1 qualification verdict
// ---------------------------------------------------------------------------

export const PHASE_1_QUALIFICATION_OUTCOME = "QUALIFIED" as const;

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  rationale:
    "The Federal Register full daily issue (Vol. 89, No. 4, January 5, 2024) is QUALIFIED as the Phase 2 " +
    "primary candidate: an official-publisher, public-domain, text-native, genuinely 3-column source with " +
    "three independent reading-order oracles (GovInfo MODS/XML metadata, per-granule HTML mirrors, and " +
    "FR-Doc citation stamps / sequential CFR section numbers), and a reproducible reconnaissance finding of " +
    "COLUMN_INTERLEAVING and HEADING_BODY_MISORDER under real (unmodified) pdftotext extraction, using the same " +
    "extraction family DRA's injectable PdfExtractor is invoked with in this corpus's own admission-test " +
    "precedent. The Congressional Record (Vol. 170, No. 4, January 9, 2024) is QUALIFIED as the alternate: " +
    "same publisher family and licence strength, genuine 2-column layout, usable if the primary proves " +
    "logistically or technically unworkable in Phase 2.",
  candidateAfter: "DRA-DOC-0033 (still reserved and blocked; this candidate is reserved conceptually as the " +
    "document after it, i.e. DRA-DOC-0034, and no DRA-DOC or DRA-FRZ identifier is claimed by this Phase 1 " +
    "module).",
});

export const MULTICOLUMN_ROBUSTNESS_STATUS_AFTER_PHASE_1 = "PARTIALLY_TESTED" as const;

export const PHASE_1_STATUS_RATIONALE = Object.freeze({
  status: MULTICOLUMN_ROBUSTNESS_STATUS_AFTER_PHASE_1,
  reasoning:
    "Phase 1 reconnaissance (Poppler/pdftotext only, never the DRA pipeline) reproducibly demonstrates that " +
    "genuine 3-column source layout produces COLUMN_INTERLEAVING and HEADING_BODY_MISORDER symptoms in the " +
    "extraction family DRA's PdfExtractor delegates to. This is real evidence that the risk exists at the " +
    "extraction layer. It is NOT sufficient to close the dimension, because: (a) it has not been run through " +
    "DRA's actual normalisation/segmentation/evaluation pipeline end-to-end; (b) materiality (does the " +
    "misordering change statement formation, claim boundaries, evidence linkage, or the final decision?) has " +
    "not been assessed at all; (c) no admitted document, freeze record, or evaluation exists yet. Per the task " +
    "specification, Phase 1 reconnaissance alone cannot count as closure regardless of how compelling the " +
    "recon evidence is.",
});

// ---------------------------------------------------------------------------
// Part 9 — Phase 2 experiment design (pre-defined, not executed here)
// ---------------------------------------------------------------------------

export const PHASE_2_CLASSIFICATION_OPTIONS = [
  "MULTICOLUMN_ORDER_PRESERVATION_CONFIRMED",
  "MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL",
  "MULTICOLUMN_ORDER_GAP_DEMONSTRATED_NONMATERIAL",
  "INCONCLUSIVE",
] as const;
export type Phase2ClassificationOption = (typeof PHASE_2_CLASSIFICATION_OPTIONS)[number];

export const PROPOSED_PHASE_2_SCOPE = Object.freeze({
  steps: Object.freeze([
    "Re-verify governance (official-source status, licence, HTTP stability) for the primary candidate " +
      "immediately before acquisition, per standard DRA-ACQ practice for time-sensitive live sources.",
    "Freeze and admit the primary candidate via the existing governed acquisition pipeline " +
      "(acquireFreezeAndEvaluate), producing a real DRA-DOC identifier, freeze record, and evaluation, without " +
      "modifying any pipeline stage.",
    "Evaluate the frozen document twice (via evaluateFrozenBenchmarkDocument) to confirm evaluator determinism " +
      "before drawing any conclusion from a single run, per the established DRA-BMK-023 corpus-lock convention.",
    "Compare DRA's normalised/segmented text against the independent reading-order oracle (GovInfo MODS/XML " +
      "metadata plus per-granule HTML mirrors and FR-Doc citation stamps), quantifying observed instances of " +
      "each of the seven named failure modes with raw counts and percentages — no invented composite score.",
    "If feasible, run an analysis-only corrected-order counterfactual (re-segmenting a corrected-order version " +
      "of the same text offline, without touching production code) and compare evaluation-level outputs " +
      "(statements, claims, evidence links, issues, decision) against the as-extracted run to isolate " +
      "materiality specifically, following the same counterfactual technique used at DRA-ACQ-024/025.",
    "Assess materiality strictly per MATERIALITY_STANDARD: classify any demonstrated defect as MATERIAL only if " +
      "it changes statement formation, claim boundaries, evidence linkage, authority interpretation, issue " +
      "generation, or the final decision.",
    "Classify the dimension using exactly one of PHASE_2_CLASSIFICATION_OPTIONS, without modifying, patching, " +
      "or otherwise fixing any pipeline stage as part of this classification exercise.",
  ]),
  explicitNonGoals: Object.freeze([
    "Do not fix, patch, or otherwise modify extraction/normalisation/segmentation as part of Phase 2 " +
      "classification; any engineering remediation is a separate, later DRA-ENG programme, mirroring the " +
      "DRA-ACQ-023-then-DRA-ENG-017 and DRA-ACQ-024-then- (no fix yet) precedents.",
    "Do not touch, reuse, renumber, or interfere with DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033.",
  ]),
});

export const PHASE_1_PROHIBITED_ACTIONS: readonly string[] = Object.freeze([
  "acquiring, freezing, or admitting any candidate document",
  "creating DRA-DOC-0034 or any new DRA-DOC identifier",
  "creating any new freeze record or acquisition record",
  "creating a DRA-BMK checkpoint",
  "modifying evaluator 0.1.2, any pipeline stage, extraction, normalisation, or segmentation",
  "touching, reusing, or renumbering DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033",
]);
