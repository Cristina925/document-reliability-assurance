/**
 * DRA-ACQ-020 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0024 (Footnote-Density Robustness Probe)
 *
 * CONTEXT — DRA-BMK-023 (twenty-three-document checkpoint) directly
 * demonstrated a defect at DRA-DOC-0023 (CMA Case 51098): the source PDF's
 * genuine superscript footnote markers are flattened by `pdftotext` into
 * plain inline digits during normalisation, so `EL-FOOTNOTE-REF` cannot
 * recover the footnote/evidence relationship (see DRA-CHK-003/DRA-BMK-023
 * memory — a footnote-flattening extraction defect, Category B).
 *
 * PROGRAMME OBJECTIVE — Determine whether that defect is a broader
 * document-shape weakness of the frozen acquisition/normalisation pipeline,
 * or an isolated anomaly specific to the CMA document. This is a robustness
 * PROBE, not a corrective-engineering exercise.
 *
 * Hypothesis H1: the frozen acquisition/normalisation pipeline will
 * reproduce materially similar footnote-marker/evidence-linkage degradation
 * on an independently sourced, footnote-dense document.
 * Falsification condition: a genuinely footnote-dense document from a
 * different publisher that preserves footnote/evidence relationships
 * correctly would weaken H1.
 *
 * ANTI-CONTAMINATION STATEMENT (required verbatim by the task specification):
 * "DRA-DOC-0024 is a robustness probe, not evidence selected to increase
 * issue counts or improve benchmark outcomes. No evaluator result was used
 * in candidate selection." This statement is true of the process recorded
 * below: no candidate in CANDIDATE_REGISTER was fetched into, or run
 * through, evaluator 0.1.2, the DRA pipeline, or any of its stages, at any
 * point during this Phase 1 investigation. Candidate selection used only
 * (a) live HTTP/licence/official-source verification and (b) direct
 * inspection of each PDF's own rendered pages and extracted text for
 * genuine superscript footnote markers and footnote-to-claim materiality —
 * never the DRA evaluator's own output.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This module
 * does not download-and-freeze, admit, or evaluate any document. It does
 * not create DRA-DOC-0024, a new freeze record, a new acquisition record,
 * or DRA-BMK-024, and it does not modify evaluator 0.1.2, any pipeline
 * stage, normalisation (including EL-FOOTNOTE-REF), or any existing frozen
 * artefact. See PHASE_1_PROHIBITED_ACTIONS below and the accompanying test
 * file for explicit assertions of that boundary.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 23 documents (DRA-DOC-0001-0023).
 *
 * This module records:
 *
 *   1. A profile of the relevant slice of the current 23-document corpus
 *      (publisher/domain/genre context for the footnote-flattening defect
 *      and for judging corpus-diversity contribution).
 *   2. The task's own fixed candidate-selection priority order, taken
 *      verbatim from the DRA-ACQ-020 task specification.
 *   3. The set of desired structural elements a qualifying candidate should
 *      exhibit, used only to record which elements were actually observed
 *      in each candidate — never to manufacture or assume an evaluator
 *      outcome from their presence.
 *   4. A candidate register of three genuinely researched, real,
 *      official-source documents. For each: a live HTTP accessibility
 *      check, a licence/copyright determination with supporting textual
 *      evidence, a repeated byte-identical fetch where accessible, and a
 *      structural-element checklist derived from directly reading the
 *      extracted document text (via `pdftotext`) and, for the preferred
 *      candidate, the rendered original PDF pages (via `pdftoppm`) — not
 *      inferred or assumed.
 *   5. A deterministic ranking and Phase 1 qualification verdict for the
 *      primary candidate, explicit alternates, and a Phase 1 qualification
 *      record covering identity, governance, acquisition, evidence
 *      contribution, corpus contribution, and risks.
 *
 * All live verification (HTTP status/headers, SHA-256 digests across
 * repeated fetches, licence statement text, rendered-page visual inspection
 * for genuine superscript footnote markers, footnote-to-claim materiality)
 * was performed on 2026-08-10 via `curl`, `pdftotext`, and `pdftoppm`
 * against the documents' official publisher URLs and is recorded here as
 * fixed data. This module does not re-fetch anything at runtime or during
 * test execution, and it does not invoke the DRA evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Relevant corpus profile (23 documents)
// ---------------------------------------------------------------------------

export interface CorpusContextRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly language: string;
  readonly hasFootnoteStructure: boolean;
}

/**
 * Not a full re-transcription of all 23 corpus rows (already recorded
 * exactly, per document, in dra-acq-019-enforcement-decision-discovery.ts
 * Part 1 and in DRA-BMK-023's own admission/checkpoint records). This
 * module records only the fields needed to judge footnote-structure
 * precedent and corpus-diversity contribution for a footnote-density probe:
 * the one corpus document already known to contain footnote markers
 * (DRA-DOC-0023, where the flattening defect was demonstrated) and the two
 * publishers most relevant to the new candidates' diversity assessment.
 */
export const CORPUS_FOOTNOTE_CONTEXT: readonly CorpusContextRow[] = Object.freeze([
  Object.freeze({
    corpusId: "DRA-DOC-0023",
    publisher: "Competition and Markets Authority (CMA)",
    documentType: "OTHER",
    domain: "GENERAL",
    language: "en-GB",
    hasFootnoteStructure: true,
  }),
]);

export const CORPUS_PROFILE_SUMMARY = Object.freeze({
  totalDocuments: 23,
  realAcquisitions: 17,
  footnoteFlatteningDefectOrigin: "DRA-DOC-0023",
  footnoteFlatteningDefectSummary:
    "DRA-BMK-023 (Category B, footnote-flattening extraction defect) directly demonstrated that pdftotext " +
    "flattens DRA-DOC-0023's genuine superscript footnote markers into plain inline digits, which " +
    "EL-FOOTNOTE-REF cannot distinguish from ordinary body-text numerals, undetected as a normalisation " +
    "failure. This is the only corpus document on which the defect has so far been observed, and it is the " +
    "only footnote-bearing document in the corpus prior to this acquisition.",
  existingPublisherRoster:
    "Apache Software Foundation, Acas, CMA, NIST, ICO, PRA/Bank of England, FDA, BCBS, NCSC, HSE, MHRA, " +
    "European Commission HLEG on AI, INE, CNIL, European Environment Agency. No US legislative-branch " +
    "publisher and no UK statutory-public-inquiry publisher exists in the corpus prior to this acquisition.",
  domainNote:
    "TECHNICAL and GENERAL are the two most-represented real-acquisition domains prior to this acquisition; " +
    "a footnote-density probe selected from either domain is judged on footnote-structure/materiality merit, " +
    "not on domain-balance improvement, per the task's explicit anti-contamination and non-overclaiming " +
    "instructions (mirroring the disclosure already made for DRA-DOC-0023 at DRA-ACQ-019 Phase 2).",
});

// ---------------------------------------------------------------------------
// Part 2 — Candidate-selection priority order (fixed, verbatim from the
// DRA-ACQ-020 task specification)
// ---------------------------------------------------------------------------

export interface SelectionPriority {
  readonly rank: number;
  readonly key: string;
  readonly description: string;
}

export const CANDIDATE_SELECTION_PRIORITY: readonly SelectionPriority[] = Object.freeze([
  Object.freeze({ rank: 1, key: "different_publisher_from_cma", description: "A different publisher from the Competition and Markets Authority (CMA)." }),
  Object.freeze({ rank: 2, key: "official_first_party_source", description: "An official, first-party source (the publisher's own domain, not a mirror or aggregator)." }),
  Object.freeze({ rank: 3, key: "explicitly_verifiable_licence", description: "An explicitly verifiable licence or copyright/reuse position, ideally document-level rather than a site-wide inference." }),
  Object.freeze({ rank: 4, key: "substantial_footnote_density", description: "Substantial genuine footnote/endnote density, preferably superscript numeric markers in the original rendering." }),
  Object.freeze({ rank: 5, key: "footnotes_materially_support_claims", description: "Footnotes materially support, qualify, or evidence substantive statements — not merely administrative page/version notes." }),
  Object.freeze({ rank: 6, key: "prefer_structural_complexity", description: "Prefer structural complexity: tables, annexes, dense citations, multi-level sections." }),
  Object.freeze({ rank: 7, key: "stable_live_acquisition", description: "A stable live acquisition suitable for deterministic freezing (byte-stable or text-stable across repeated fetches)." }),
  Object.freeze({ rank: 8, key: "increase_corpus_diversity", description: "Prefer a publisher/domain/structure that increases corpus diversity over one that merely repeats an existing publisher." }),
  Object.freeze({ rank: 9, key: "not_selected_for_likely_failure", description: "Do not choose a candidate just because it looks likely to reproduce the DOC-0023 failure." }),
  Object.freeze({ rank: 10, key: "no_governance_weakening", description: "Do not weaken governance or licensing requirements merely to obtain a footnote-heavy document." }),
]);

/**
 * Structural elements this probe looks for and records as OBSERVED or
 * NOT_OBSERVED per candidate — never manufactured, assumed, or treated as
 * predicting an evaluator outcome.
 */
export const DESIRED_STRUCTURAL_ELEMENTS: readonly string[] = Object.freeze([
  "numbered_section_headings",
  "multi_level_subheadings",
  "footnote_markers_present_in_extracted_text",
  "footnote_markers_confirmed_superscript_in_rendered_pdf",
  "footnote_content_cites_external_source_or_instrument",
  "footnote_to_claim_materiality",
  "cross_references_between_sections",
  "figure_or_table",
  "structured_front_matter_or_disclaimer",
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
  "REJECTED_INSUFFICIENT_FOOTNOTE_DENSITY",
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
  readonly footnoteCountObserved: number | null;
  readonly footnoteMarkersConfirmedSuperscript: boolean | null;
  readonly structuralElementsObserved: readonly string[];
  readonly structuralEvidenceNote: string;
  readonly isRepeatPublisher: boolean;
  readonly corpusDiversityContribution: string;
  readonly corpusDiversityLimitation: string;
  readonly knownRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

/** Recursively freezes an object graph of plain objects/arrays (used so that
 * nested arrays such as structuralElementsObserved/knownRisks are frozen too,
 * not just the top-level candidate object — Object.freeze is shallow). */
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
  // --- Candidate 1: Congressional Research Service — Regulating AI report ---
  Object.freeze({
    candidateId: "DRA-CAND-020-01",
    title: "Regulating Artificial Intelligence: U.S. and International Approaches and Considerations for Congress (R48555)",
    publisher: "Congressional Research Service (CRS), Library of Congress",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf",
    publicationDate: "2025-06-04 (Version 4)",
    approximateSize: "1,077,858 bytes, 31 pages (27 body pages + cover/summary/contents/author page)",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — the document's own final-page disclaimer states verbatim: \"CRS Reports, as a work of " +
      "the United States Government, are not subject to copyright protection in the United States. Any CRS " +
      "Report may be reproduced and distributed in its entirety without permission from CRS.\" Confirmed by " +
      "direct pdftotext extraction of the retrieved bytes (document-level statement, not a site-wide " +
      "inference), and consistent with the PUBLIC_DOMAIN basis already used for DRA-DOC-0010 (NIST) and " +
      "DRA-DOC-0013 (FDA) elsewhere in this corpus.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on congress.gov (the official Library of Congress / U.S. Congress domain that has hosted " +
      "public CRS Reports since the 2018 appropriations-mandated public release) returned HTTP 200, " +
      "content-type application/pdf, content-length 1,077,858 bytes, no authentication or paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Three independent live GETs of the canonical URL (the first two back-to-back, the third after a " +
      "3-second delay) all returned identical SHA-256 " +
      "146a79eb62c0d1d99d8eb5a44e86eb6b6851b013f0beab286df1f3f8c423b437 and identical byte length 1,077,858.",
    footnoteCountObserved: 170,
    footnoteMarkersConfirmedSuperscript: true,
    structuralElementsObserved: [
      "numbered_section_headings",
      "multi_level_subheadings",
      "footnote_markers_present_in_extracted_text",
      "footnote_markers_confirmed_superscript_in_rendered_pdf",
      "footnote_content_cites_external_source_or_instrument",
      "footnote_to_claim_materiality",
      "cross_references_between_sections",
      "figure_or_table",
      "structured_front_matter_or_disclaimer",
    ],
    structuralEvidenceNote:
      "pdftotext extraction over the 27 body pages shows exactly 170 numbered footnotes with markers such as " +
      "\"generative AI.4\", \"May 2025.5\", and \"H.Res. 649 (118th).170\" attached directly to substantive " +
      "sentences, each resolved at page bottom to citations of statutes, executive orders, OECD/UN " +
      "instruments, agency reports, and news sources — not administrative page notes. A page-150 DPI render " +
      "of body page 5 (pdftoppm) was inspected directly and confirms the in-text markers render as true raised " +
      "superscript numerals (4, 5, 6, 7 visible above the baseline immediately after the cited clause), " +
      "distinct from the DRA-DOC-0023 case where the superscript rendering exists in the source PDF but is " +
      "flattened by pdftotext into inline plain-baseline digits. The document also contains one figure " +
      "(\"Figure 1. European Union AI Act's Risk-Based Regulatory Approach\"), a three-level heading hierarchy " +
      "(e.g. \"U.S. Approaches to Regulating AI\" > \"Regulating the Use of AI Technologies Across Sectors\"), " +
      "and a jurisdictional-comparison structure (United States, United Kingdom, European Union, China, " +
      "multi-country) that cross-references earlier sections.",
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "New publisher (Congressional Research Service) and a new document genre (legislative-branch " +
      "nonpartisan analytical/advisory report) not previously represented; adds a second U.S.-jurisdiction " +
      "PUBLIC_DOMAIN document distinct in genre from NIST (executive-branch technical standards) and FDA " +
      "(regulatory guidance).",
    corpusDiversityLimitation:
      "Does not diversify domain balance: TECHNICAL is already the most-represented real-acquisition domain " +
      "in the corpus (5 of 17 real acquisitions prior to this candidate). Selected for footnote-structure and " +
      "genre-diversity merit, not domain-balance improvement, consistent with the task's explicit instruction " +
      "not to select on domain-diversity grounds alone.",
    knownRisks: [
      "As a nonpartisan advisory/analytical report (not a decision or adjudication), the document contains no " +
        "enforcement or adjudicative structure; this is expected and is not a defect for a footnote-density " +
        "probe, whose evidentiary target is footnote/evidence linkage, not decision-genre coverage.",
      "The document version is 'R48555.4' (fourth CRS revision); the exact version fetched must be pinned by " +
        "URL and digest at admission time, mirroring the existing versioned-document convention already used " +
        "for other corpus documents.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 2: Post Office Horizon IT Inquiry final report, Volume 1 ---
  Object.freeze({
    candidateId: "DRA-CAND-020-02",
    title: "Post Office Horizon IT Inquiry — Report, Volume 1 (HC 1119)",
    publisher: "Post Office Horizon IT Inquiry (independent statutory inquiry under the Inquiries Act 2005)",
    jurisdiction: "United Kingdom",
    domain: "GENERAL",
    documentType: "REPORT",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl:
      "https://www.postofficehorizoninquiry.org.uk/sites/default/files/2025-07/Post%20Office%20Horizon%20IT%20Inquiry%20Final%20Report%20Volume%201_0.pdf",
    publicationDate: "2025-07-08 (presented to Parliament)",
    approximateSize: "1,176,953 bytes, 166 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "Not verified to document level for this candidate (rejected before that step became necessary — see " +
      "rejectionOrDeferralReason). UK statutory-inquiry reports of this kind are conventionally Crown " +
      "copyright / Open Government Licence, but that is a site-wide/genre inference here, not a confirmed " +
      "in-document statement.",
    licenceReuseStatus: "PROVISIONAL",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on postofficehorizoninquiry.org.uk (the Inquiry's own official domain) returned HTTP 200, " +
      "content-type application/pdf, content-length 1,176,953 bytes, no authentication or paywall.",
    sourceStabilityStatus: "UNKNOWN",
    stabilityObservations:
      "Only a single live fetch was performed; repeat-fetch digest comparison was not carried out because the " +
      "candidate was rejected on structural grounds before that verification step was reached.",
    footnoteCountObserved: 14,
    footnoteMarkersConfirmedSuperscript: null,
    structuralElementsObserved: ["numbered_section_headings", "structured_front_matter_or_disclaimer"],
    structuralEvidenceNote:
      "pdftotext extraction of all 166 pages (83,622 words) found only 14 occurrences of \"ibid.\"-style " +
      "citation and no recurring pattern of lone superscript-style numeric markers attached to sentences. " +
      "Volume 1 is written in a narrative, human-impact-focused register (direct quotation and case-study " +
      "narrative rather than footnoted citation of evidence exhibits/transcripts). This is far too sparse " +
      "(roughly one citation marker per 6,000 words) to serve as a footnote-density probe, and the original " +
      "PDF was not inspected for superscript rendering because the underlying footnote count is already " +
      "insufficient regardless of rendering fidelity.",
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would have added a new publisher (Post Office Horizon IT Inquiry) and a new UK statutory-inquiry " +
      "genre not previously represented, had it qualified structurally.",
    corpusDiversityLimitation:
      "Rejected before diversity could be realised — see rejectionOrDeferralReason.",
    knownRisks: [
      "Genuinely official, accessible, and (on genre precedent) plausibly licensed, but the underlying " +
        "document does not carry the footnote/evidence-citation structure this probe requires.",
    ],
    qualificationOutcome: "REJECTED_INSUFFICIENT_FOOTNOTE_DENSITY",
    rejectionOrDeferralReason:
      "Footnote/citation density (14 explicit citation markers across 83,622 words) and materiality fall far " +
      "short of priority items 4 and 5 in CANDIDATE_SELECTION_PRIORITY (substantial genuine footnote density; " +
      "footnotes materially supporting substantive statements). The document's evidentiary base is narrative " +
      "and quotation-driven rather than footnote-driven, so it cannot meaningfully probe footnote/evidence-" +
      "linkage degradation regardless of how faithfully the pipeline extracts its text.",
  }),
  // --- Candidate 3: House of Commons Library research briefing — AI content labelling ---
  Object.freeze({
    candidateId: "DRA-CAND-020-03",
    title: "AI content labelling (CBP-10467)",
    publisher: "House of Commons Library, UK Parliament",
    jurisdiction: "United Kingdom",
    domain: "TECHNICAL",
    documentType: "REPORT",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://researchbriefings.files.parliament.uk/documents/CBP-10467/CBP-10467.pdf",
    publicationDate: "2026-01-20",
    approximateSize: "unknown — blocked before headers could be read past the challenge response",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "Not verified — the licence position could not be read from document content because every fetch " +
      "attempt was blocked before any PDF bytes were returned.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "BLOCKED",
    accessibilityEvidence:
      "Two independent live GET attempts on researchbriefings.files.parliament.uk (one plain, one with an " +
      "explicit Referer header pointing at commonslibrary.parliament.uk) both returned HTTP 403 with a " +
      "Cloudflare bot-mitigation interstitial (\"Just a moment...\" challenge page, ~5.8KB HTML, no PDF " +
      "bytes) rather than the document — the same Cloudflare-blocking pattern already recorded for Ofwat and " +
      "Ofcom at DRA-ACQ-019 and, historically, for the OBR.",
    sourceStabilityStatus: "BLOCKED",
    stabilityObservations: "Not applicable — no document bytes were ever retrieved.",
    footnoteCountObserved: null,
    footnoteMarkersConfirmedSuperscript: null,
    structuralElementsObserved: [],
    structuralEvidenceNote:
      "No structural elements are recorded as observed, per the established rule that a BLOCKED candidate's " +
      "structuralElementsObserved list must remain empty — nothing is assumed about an inaccessible " +
      "document's internal structure from its title or search-result snippet alone.",
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would have added a new publisher (House of Commons Library) and, being a parliamentary research " +
      "briefing rather than a regulator or agency publication, a new genre distinct from every existing " +
      "corpus entry, had it been accessible.",
    corpusDiversityLimitation: "Rejected on accessibility grounds before diversity could be realised.",
    knownRisks: [
      "Cloudflare bot mitigation on researchbriefings.files.parliament.uk appears to be a site-wide " +
        "characteristic (consistent with the Ofwat/Ofcom/OBR precedent for other UK public-sector CDNs), so " +
        "other House of Commons Library briefings hosted on the same subdomain are also likely BLOCKED " +
        "without a materially different access method.",
    ],
    qualificationOutcome: "REJECTED_BLOCKED",
    rejectionOrDeferralReason:
      "HTTP accessibility is BLOCKED by Cloudflare bot mitigation on both attempted requests; per the " +
      "established rule (DRA-ACQ-019), no BLOCKED candidate may be marked QUALIFIED_RECOMMENDED or " +
      "QUALIFIED_ALTERNATE regardless of how promising its title or genre appears.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

/**
 * Deterministic, pre-declared ranking rule (fixed before any candidate was
 * scored, not adjusted post-hoc): VERIFIED_ACCESSIBLE + BYTE_STABLE or
 * TEXT_STABLE candidates rank above BLOCKED candidates; among accessible
 * candidates, footnoteCountObserved (descending) breaks ties, since
 * footnote density/materiality is the probe's defining selection axis
 * (priority items 4-5). This produces the same ranking as a simple
 * qualificationOutcome-based sort here because there are exactly three
 * candidates with three distinct outcomes, but the rule is recorded
 * explicitly so it generalises to a larger register.
 */
function rankCandidates(candidates: readonly CandidateRecord[]): readonly string[] {
  const accessible = candidates
    .filter((c) => c.httpAccessibility === "VERIFIED_ACCESSIBLE")
    .slice()
    .sort((a, b) => (b.footnoteCountObserved ?? -1) - (a.footnoteCountObserved ?? -1));
  const blocked = candidates.filter((c) => c.httpAccessibility === "BLOCKED");
  return Object.freeze([...accessible, ...blocked].map((c) => c.candidateId));
}

export const RANKED_CANDIDATE_IDS: readonly string[] = rankCandidates(CANDIDATE_REGISTER);
export const PRIMARY_CANDIDATE_ID = "DRA-CAND-020-01";
export const ALTERNATE_1_CANDIDATE_ID = "DRA-CAND-020-02";
export const ALTERNATE_2_CANDIDATE_ID = "DRA-CAND-020-03";

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
 * QUALIFIED requires: VERIFIED official source, VERIFIED licence,
 * VERIFIED_ACCESSIBLE + BYTE_STABLE or TEXT_STABLE, confirmed superscript
 * footnote markers, and a non-trivial observed footnote count. All five
 * hold for the primary candidate.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const accessible = c.httpAccessibility === "VERIFIED_ACCESSIBLE";
  const stable = c.sourceStabilityStatus === "BYTE_STABLE" || c.sourceStabilityStatus === "TEXT_STABLE";
  const officialAndLicensed = c.officialSourceStatus === "VERIFIED" && c.licenceReuseStatus === "VERIFIED";
  const genuineFootnotes = c.footnoteMarkersConfirmedSuperscript === true && (c.footnoteCountObserved ?? 0) > 20;
  if (c.httpAccessibility === "BLOCKED") return "BLOCKED";
  if (accessible && stable && officialAndLicensed && genuineFootnotes) return "QUALIFIED";
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
    proposedCorpusId: "DRA-DOC-0024",
  }),
  governance: Object.freeze({
    officialSourceStatus: primaryCandidate().officialSourceStatus,
    licenceReuseStatus: primaryCandidate().licenceReuseStatus,
    licenceReuseBasis: primaryCandidate().licenceReuseBasis,
    unresolvedQuestions: Object.freeze([
      "Which exact CRS revision (R48555.4, current as of this Phase 1 investigation) must be pinned at " +
        "admission time; CRS periodically issues new numbered versions of the same report number and an " +
        "admission-time re-check should confirm .4 is still the live version or record the new one.",
    ]),
  }),
  acquisition: Object.freeze({
    sourceFormat: primaryCandidate().sourceFormat,
    sourceStabilityStatus: primaryCandidate().sourceStabilityStatus,
    stabilityObservations: primaryCandidate().stabilityObservations,
    risks: primaryCandidate().knownRisks,
  }),
  evidenceContribution:
    "DRA-DOC-0024 would provide the first footnote-dense document in the corpus other than DRA-DOC-0023 " +
    "itself, from a genuinely different, independent publisher (Congressional Research Service, a different " +
    "branch of a different national government from the CMA), directly enabling the DRA-ACQ-020 Phase 2 " +
    "robustness comparison against the DOC-0023 footnote-flattening defect that this whole programme exists " +
    "to test.",
  corpusContribution:
    "Adds a new publisher and a new document genre (legislative-branch nonpartisan analytical report) not " +
    "previously represented in the corpus. It does not improve domain balance — TECHNICAL is already the " +
    "most-represented real-acquisition domain — and this limitation is disclosed rather than omitted, " +
    "consistent with the disclosure already made for DRA-DOC-0023 at DRA-ACQ-019 Phase 2.",
  risks: primaryCandidate().knownRisks,
  recommendationReasoning:
    "DRA-CAND-020-01 is the only candidate in the register that is simultaneously VERIFIED official-source, " +
    "VERIFIED licence (explicit in-document public-domain statement), VERIFIED_ACCESSIBLE, BYTE_STABLE across " +
    "three independent live fetches, and confirmed by direct visual inspection of a rendered PDF page to " +
    "contain genuine superscript footnote markers (170 of them) that materially cite external legal and " +
    "technical instruments rather than administrative notes. The two alternates were researched in good " +
    "faith and rejected for reasons unrelated to any predicted evaluator outcome: DRA-CAND-020-02 (Post " +
    "Office Horizon IT Inquiry, Volume 1) is officially sourced and licensable in principle but has almost " +
    "no footnote structure to probe; DRA-CAND-020-03 (House of Commons Library) is a promising new-publisher " +
    "candidate but is blocked by Cloudflare bot mitigation, the same class of blocker already documented for " +
    "Ofwat and Ofcom. No candidate was chosen, or rejected, on the basis of whether it seemed likely to " +
    "reproduce or avoid the DOC-0023 defect; that determination is explicitly reserved for a future benchmark " +
    "run and is out of scope for this Phase 1 discovery module.",
  nextBestCandidateIfRejected: `${ALTERNATE_2_CANDIDATE_ID} would need its Cloudflare block resolved (or an alternate House of Commons Library mirror confirmed) before it could be reconsidered; ${ALTERNATE_1_CANDIDATE_ID} would need a materially more footnote-dense volume of the same inquiry (if one exists) before it could be reconsidered.`,
});

// ---------------------------------------------------------------------------
// Part 6 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0024";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "deterministic_live_fetch_a_b_for_primary_candidate",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0024",
  "run_evaluator_0_1_2_against_dra_doc_0024_in_a_dedicated_benchmark",
  "compare_dra_doc_0024s_footnote_linkage_outcome_against_dra_doc_0023s_category_b_defect",
  "record_confirmed_broad_weakness_or_isolated_anomaly_verdict_for_h1",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0024",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_024",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_el_footnote_ref",
  "modify_existing_frozen_artefacts",
  "modify_dra_doc_0023",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_the_footnote_flattening_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
] as const);
