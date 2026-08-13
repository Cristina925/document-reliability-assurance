/**
 * DRA-ACQ-013 — Phase 1: Candidate Discovery and Qualification for DRA-DOC-0017
 *
 * Governed, reproducible candidate-discovery and selection evidence package
 * for the seventeenth corpus document, following the pattern established by
 * DRA-ACQ-010 (`dra-acq-010-candidate-discovery.ts`).
 *
 * This module records:
 *
 *   1. A corpus-balance analysis of the current 16-document corpus
 *      (DRA-DOC-0001–0016), computed from the authoritative field values
 *      used in the DRA-BMK-016 sixteen-document checkpoint (see
 *      `execution/__tests__/dra-bmk-016-sixteen-document-checkpoint.test.ts`,
 *      Part 3), not from narrative reports.
 *   2. An evidence-gap analysis, ranked in the exact priority order given
 *      by the DRA-ACQ-013 task specification.
 *   3. A candidate register of genuinely researched, real, official-source
 *      documents assessed against that gap analysis.
 *   4. A deterministic ranking and single recommendation.
 *
 * SCOPE — Phase 1 only. This module does not download, freeze, admit, or
 * evaluate any document. It records discovery-and-selection evidence only.
 * DRA-DOC-0017 does not exist anywhere in the corpus schema or registry as
 * a result of this module — see the accompanying test file for an explicit
 * assertion of that constraint.
 *
 * DRA-CHK-002 has already established that Version 1 issue-class coverage
 * is fixed at 3/9 (3/3 reachable classes observed) as of the 16-document
 * corpus (reconfirmed in DRA-BMK-016). Candidates below are therefore NOT
 * scored on any confirmed claim that they will increase issue-class
 * coverage — any such potential is recorded strictly as an unconfirmed
 * evidence hypothesis, per the task's explicit instruction, until evaluator
 * execution occurs after admission (which is out of scope for this phase).
 */

import type { Domain, DocumentType, SourceType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus-balance analysis of the existing 16-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-016 checkpoint's canonical summary table (Part 3, CORPUS_META).
 */
export interface CorpusInventoryRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly sourceType: SourceType;
  readonly language: string;
  /** Whether this document originated from a real acquisition (DRA-ACQ-NNN) rather than the synthetic seed corpus. */
  readonly isRealAcquisition: boolean;
  /** Acquisition programme reference that produced this document, or null for the synthetic seed corpus. */
  readonly acquisitionId: string | null;
}

export const CORPUS_INVENTORY: readonly CorpusInventoryRow[] = Object.freeze([
  Object.freeze({ corpusId: "DRA-DOC-0001", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "TECHNICAL", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0002", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "BUSINESS", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0003", publisher: "Internal (AI+human)", documentType: "REPORT", domain: "GENERAL", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0004", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "GENERAL", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0005", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "LEGAL", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0006", publisher: "Internal (human)", documentType: "REPORT", domain: "TECHNICAL", sourceType: "AI_GENERATED", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0007", publisher: "Apache Software Foundation", documentType: "ARTICLE", domain: "TECHNICAL", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-001" }),
  Object.freeze({ corpusId: "DRA-DOC-0008", publisher: "Acas", documentType: "PROCEDURE", domain: "BUSINESS", sourceType: "HUMAN_AUTHORED", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-002" }),
  Object.freeze({ corpusId: "DRA-DOC-0009", publisher: "Competition and Markets Authority", documentType: "SUMMARY", domain: "GENERAL", sourceType: "HUMAN_AUTHORED", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-004" }),
  Object.freeze({ corpusId: "DRA-DOC-0010", publisher: "National Institute of Standards and Technology (NIST)", documentType: "POLICY", domain: "TECHNICAL", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-005" }),
  Object.freeze({ corpusId: "DRA-DOC-0011", publisher: "Information Commissioner's Office (ICO)", documentType: "OTHER", domain: "LEGAL", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-006" }),
  Object.freeze({ corpusId: "DRA-DOC-0012", publisher: "Prudential Regulation Authority (PRA), Bank of England", documentType: "OTHER", domain: "FINANCE", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-007" }),
  Object.freeze({ corpusId: "DRA-DOC-0013", publisher: "U.S. Food and Drug Administration (FDA)", documentType: "POLICY", domain: "HEALTHCARE", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-008" }),
  Object.freeze({ corpusId: "DRA-DOC-0014", publisher: "Basel Committee on Banking Supervision (BCBS)", documentType: "POLICY", domain: "FINANCE", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-009" }),
  Object.freeze({ corpusId: "DRA-DOC-0015", publisher: "National Cyber Security Centre (NCSC)", documentType: "OTHER", domain: "TECHNICAL", sourceType: "HUMAN_AUTHORED", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-011" }),
  Object.freeze({ corpusId: "DRA-DOC-0016", publisher: "Health and Safety Executive (HSE)", documentType: "PROCEDURE", domain: "BUSINESS", sourceType: "HUMAN_AUTHORED", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-012" }),
]);

/** Only the real (non-synthetic) acquisitions — DRA-DOC-0007 through DRA-DOC-0016. */
export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

/** Tallies a field across a set of inventory rows into a sorted count map. */
function tally<K extends string>(
  rows: readonly CorpusInventoryRow[],
  field: "domain" | "documentType" | "publisher" | "sourceType" | "language",
): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const key = row[field] as K;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Domain distribution across the real (non-synthetic) acquisitions only. */
export const REAL_DOMAIN_COUNTS: ReadonlyMap<Domain, number> = tally<Domain>(
  REAL_ACQUISITIONS,
  "domain",
);

/** Document-type distribution across the real (non-synthetic) acquisitions only. */
export const REAL_DOCUMENT_TYPE_COUNTS: ReadonlyMap<DocumentType, number> =
  tally<DocumentType>(REAL_ACQUISITIONS, "documentType");

/** Publisher distribution across the real (non-synthetic) acquisitions only. */
export const REAL_PUBLISHER_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "publisher",
);

/** Language distribution across the real (non-synthetic) acquisitions only. */
export const REAL_LANGUAGE_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "language",
);

/** DocumentType values with zero occurrences among real acquisitions. */
export const UNUSED_REAL_DOCUMENT_TYPES: readonly DocumentType[] = Object.freeze(
  (["SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY", "PROCEDURE", "ARTICLE", "OTHER"] as const)
    .filter((dt) => !REAL_DOCUMENT_TYPE_COUNTS.has(dt)),
);

/**
 * Domains with the fewest real-acquisition documents (the under-represented
 * set). Computed, not asserted, so it stays correct if the corpus changes.
 */
export function leastRepresentedRealDomains(): readonly Domain[] {
  const allDomains: readonly Domain[] = ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"];
  const min = Math.min(...allDomains.map((d) => REAL_DOMAIN_COUNTS.get(d) ?? 0));
  return Object.freeze(allDomains.filter((d) => (REAL_DOMAIN_COUNTS.get(d) ?? 0) === min));
}

/** True only if every real acquisition's language is English (en or en-GB). */
export function noNonEnglishRealDocumentExists(): boolean {
  return REAL_ACQUISITIONS.every((row) => row.language === "en" || row.language === "en-GB");
}

// ---------------------------------------------------------------------------
// Section 2 — Evidence-gap analysis (ranked per DRA-ACQ-013 task priority order)
// ---------------------------------------------------------------------------

export interface EvidenceGapPriority {
  readonly rank: number;
  readonly key: string;
  readonly description: string;
  readonly currentState: string;
}

/**
 * Fixed data, not a runtime scoring function — reproduces the exact
 * candidate-contribution priority order given by the DRA-ACQ-013 task
 * specification, verbatim in ranking order 1 (highest) through 8 (lowest).
 */
export const EVIDENCE_GAP_PRIORITIES: readonly EvidenceGapPriority[] = Object.freeze([
  Object.freeze({
    rank: 1,
    key: "unobserved_issue_class_potential",
    description: "Potential to exercise currently unobserved issue classes.",
    currentState:
      "6 of 9 issue classes remain unobserved as of DRA-BMK-016 (3/9 observed: EVIDENCE_ABSENT, " +
      "EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY). Per DRA-CHK-002, most of the unobserved 6 are " +
      "STRUCTURALLY_UNREACHABLE under the frozen Version 1 evaluator; any candidate's contribution " +
      "here is recorded only as an unconfirmed hypothesis, never as a scored/expected outcome.",
  }),
  Object.freeze({
    rank: 2,
    key: "corpus_diversity_improvement",
    description: "Improvement to corpus diversity.",
    currentState:
      "Real-acquisition domain counts: TECHNICAL 3, BUSINESS 2, FINANCE 2, GENERAL 1, LEGAL 1, HEALTHCARE 1. " +
      "GENERAL, LEGAL, and HEALTHCARE are jointly least-represented at 1 document each.",
  }),
  Object.freeze({
    rank: 3,
    key: "new_authoritative_publisher",
    description: "New authoritative publisher.",
    currentState:
      "10 real acquisitions currently span 10 distinct publishers (1 document each) — the corpus has " +
      "never repeated a publisher. Any new candidate should ideally preserve this 1:1 publisher diversity.",
  }),
  Object.freeze({
    rank: 4,
    key: "new_evidence_or_governance_structure",
    description: "New evidence or governance structure.",
    currentState:
      "Existing structures observed: single-PDF regulatory guidance (NIST, FDA, BCBS, PRA), multi-page " +
      "HTML collections (ICO 14 sections, HSE 26 pages), a static HTML how-to article (Apache). A " +
      "leaflet/labelling-compliance structure (patient-facing regulated text under statutory legal citation) " +
      "has not yet been represented.",
  }),
  Object.freeze({
    rank: 5,
    key: "healthcare_domain_expansion",
    description: "Healthcare-domain expansion.",
    currentState:
      "HEALTHCARE has exactly 1 real document (DRA-DOC-0013, FDA — US medical-device software policy). " +
      "No UK or EU healthcare regulator is represented, and no patient-facing (as opposed to " +
      "manufacturer-facing) healthcare document exists.",
  }),
  Object.freeze({
    rank: 6,
    key: "multilingual_non_english_coverage",
    description: "Multilingual/non-English coverage.",
    currentState:
      "All 10 real acquisitions are English (en or en-GB). Zero non-English documents exist anywhere in " +
      "the 16-document corpus. This is a completely untested dimension of the normalisation/evaluator " +
      "pipeline.",
  }),
  Object.freeze({
    rank: 7,
    key: "underrepresented_document_type",
    description: "Underrepresented document type.",
    currentState:
      "REPORT, REWRITE, and EMAIL have zero real-acquisition representation. PROCEDURE (2), ARTICLE (1), " +
      "and SUMMARY (1) are also comparatively thin against POLICY (3) and OTHER (3).",
  }),
  Object.freeze({
    rank: 8,
    key: "retrieval_normalization_challenge",
    description: "Retrieval and normalization challenge.",
    currentState:
      "The pipeline has demonstrated single-PDF, multi-page-HTML (14 and 26 pages), and static-HTML " +
      "acquisition. Non-English text normalisation (character sets, non-ASCII diacritics, no established " +
      "en-only assumption) has never been exercised.",
  }),
]);

/**
 * Current discovery hypothesis stated by the DRA-ACQ-013 task: prioritise a
 * second HEALTHCARE-domain source from a new official publisher (ranks 3 + 5)
 * BEFORE introducing multilingual processing (rank 6), on the stated
 * rationale that this controls variables more cleanly — i.e. one new
 * variable (publisher) rather than two (publisher AND language)
 * simultaneously. This module treats it as a hypothesis to be tested against
 * evidence, not a pre-approved conclusion.
 */
export const DISCOVERY_HYPOTHESIS =
  "Prioritise a second HEALTHCARE-domain source from a new official publisher " +
  "before introducing multilingual processing, to avoid confounding two new " +
  "variables (publisher + language) in a single acquisition.";

// ---------------------------------------------------------------------------
// Section 3 — Candidate register
// ---------------------------------------------------------------------------

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED",
] as const;
export type CandidateQualificationOutcome =
  (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface CandidateRecord {
  readonly candidateId: string;
  readonly publisher: string;
  readonly exactTitle: string;
  readonly publicationDateOrVersion: string;
  readonly proposedDocumentType: DocumentType;
  readonly proposedDomain: Domain;
  readonly language: string;
  readonly officialSourceUrl: string;
  readonly sourceFormat: string;
  /** SHA-256 of the actual retrieved file, recorded as reproducibility evidence for this Phase 1 assessment (not a freeze digest — no freeze occurs in this phase). */
  readonly retrievedFileSha256: string;
  readonly licencePosition: string;
  readonly httpAccessibility:
    | "VERIFIED_ACCESSIBLE"
    | "PARTIAL_LANDING_PAGE_ONLY"
    | "BLOCKED_NETWORK_LEVEL"
    | "BLOCKED_BOT_CHALLENGE"
    | "BLOCKED_CONNECTIVITY_TIMEOUT";
  readonly accessibilityEvidence: string;
  readonly duplicateOrNearDuplicateRisk: string;
  readonly corpusBalanceContribution: string;
  readonly evidenceStructureContribution: string;
  /** Explicitly framed as an unconfirmed hypothesis — never a claimed/expected coverage outcome. */
  readonly issueClassHypothesis: string;
  readonly governanceFindings: readonly string[];
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: MHRA — Best practice guidance on patient information leaflets ---
  Object.freeze({
    candidateId: "DRA-CAND-013-01",
    publisher: "Medicines and Healthcare products Regulatory Agency (MHRA)",
    exactTitle: "Best practice guidance on patient information leaflets (PILs)",
    publicationDateOrVersion: "First published 29 December 2014; last updated 1 July 2026 (current version confirmed live)",
    proposedDocumentType: "PROCEDURE",
    proposedDomain: "HEALTHCARE",
    language: "en-GB",
    officialSourceUrl: "https://www.gov.uk/government/publications/best-practice-guidance-on-patient-information-leaflets",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "8593e8dabf6a967449a35155fcb140f4b234c20e3739dcbcbfd933ff2dd46383",
    licencePosition:
      "VERIFIED — gov.uk publication page footer explicitly states \"All content is available under the " +
      "Open Government Licence v3.0\" and \"© Crown copyright\", matching the precedent already accepted " +
      "for Acas (DRA-DOC-0008) and HSE (DRA-DOC-0016), both also UK Crown-copyright/OGL v3.0 sources.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to the gov.uk publication page returned HTTP 200. The page currently links a " +
      "single canonical PDF attachment (assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/...), " +
      "which returned HTTP 200, content-type application/pdf, 722,494 bytes, 30 pages, pdftotext extraction " +
      "succeeded (72,170 characters). A second, older asset-service URL " +
      "(5fe086c18fa8f5149718d66a/...) found via web search returned byte-identical content " +
      "(same SHA-256), confirming it is a stale mirror of the same PDF rather than a conflicting version; " +
      "the currently-linked gov.uk URL is the canonical reference for acquisition purposes.",
    duplicateOrNearDuplicateRisk:
      "LOW — no existing corpus document addresses patient-facing medicine labelling/leaflet content. " +
      "Distinct from DRA-DOC-0013 (FDA, software-as-medical-device policy) and DRA-DOC-0016 " +
      "(HSE, workplace health and safety) in both subject and audience (patients, not manufacturers or employers).",
    corpusBalanceContribution:
      "Reinforces HEALTHCARE domain (least-represented at 1 real document, tied with GENERAL/LEGAL) to 2. " +
      "Introduces a new, distinct publisher (MHRA has never appeared in the corpus), preserving the " +
      "corpus's 1-document-per-publisher pattern. Reinforces PROCEDURE documentType (2 → 3); does not touch " +
      "the REPORT/REWRITE/EMAIL gap.",
    evidenceStructureContribution:
      "Explicitly cites the statutory legal framework for PILs (EU/UK medicines legislation), references " +
      "related MHRA/EMA guidance documents, and gives detailed compliance procedures — a legally-anchored " +
      "citation structure not yet represented by any HEALTHCARE-domain document in the corpus (FDA's SaMD " +
      "action plan is a strategic roadmap, not a citation-dense compliance procedure).",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: the dense cross-referencing to external legislation and related " +
      "guidance documents could plausibly exercise AUTHORITY_* or TRACEABILITY_BROKEN issue classes if any " +
      "claim in the text cites a since-superseded rule; this cannot be verified without running the frozen " +
      "evaluator post-admission, which is out of scope for Phase 1.",
    governanceFindings: [
      "Official publisher confirmed: MHRA, an executive agency of the UK Department of Health and Social Care.",
      "Official publication source confirmed: gov.uk (government publications registry), not a third-party mirror.",
      "Exact document identity confirmed via retrieved-file SHA-256 recorded above; version currently live as of 1 July 2026.",
      "No prior corpus document from this publisher exists, so no publisher-reuse conflict is possible.",
    ],
    unresolvedRisks: [
      "Two known asset-service mirror URLs exist for this PDF; only the one currently linked from the live " +
        "gov.uk page should be treated as canonical at acquisition time — this should be re-verified " +
        "immediately before any Phase 2 freeze, not assumed from this Phase 1 snapshot.",
      "The corpus DocumentType schema has no dedicated GUIDANCE category (the same structural gap already " +
        "logged for DRA-DOC-0011/ICO); PROCEDURE vs OTHER classification is a judgement call to confirm " +
        "explicitly during acquisition.",
      "The document was updated as recently as 1 July 2026 (5 weeks before this assessment); its longer-term " +
        "reproducibility/stability profile is unconfirmed pending a second independent fetch at a later date.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 2: MHRA — Blue Guide: advertising and promotion of medicines in the UK ---
  Object.freeze({
    candidateId: "DRA-CAND-013-02",
    publisher: "Medicines and Healthcare products Regulatory Agency (MHRA)",
    exactTitle: "The Blue Guide: Advertising and Promotion of Medicines in the UK (Third Edition, Third revision)",
    publicationDateOrVersion: "Third edition, third revision — November 2020 (Brexit final version)",
    proposedDocumentType: "OTHER",
    proposedDomain: "HEALTHCARE",
    language: "en-GB",
    officialSourceUrl: "https://www.gov.uk/government/publications/blue-guide-advertising-and-promoting-medicines",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "6db9aaaf6314cc0919e27b72ec49beeaaa7d147b405f4001b557c95af35c9986",
    licencePosition:
      "VERIFIED — gov.uk sub-page explicitly states \"This publication is licensed under the terms of the " +
      "Open Government Licence v3.0 except where otherwise stated\", with \"© Crown copyright 2025\".",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to the assets.publishing.service.gov.uk PDF URL returned HTTP 200, content-type " +
      "application/pdf, 635,557 bytes; pdftotext extraction succeeded (247,170 characters, the largest of " +
      "the three candidates assessed).",
    duplicateOrNearDuplicateRisk:
      "LOW-MEDIUM — same publisher and domain as Candidate 1 (MHRA/HEALTHCARE); subject (advertising " +
      "compliance rules) is procedurally similar in register to existing corpus PROCEDURE/OTHER documents " +
      "(Acas, HSE) rather than introducing a clearly new evidence structure.",
    corpusBalanceContribution:
      "Would reinforce HEALTHCARE (1 → 2) exactly as Candidate 1 does, but does NOT add a new publisher if " +
      "Candidate 1 is admitted first (both are MHRA), and does not fill any currently-empty documentType slot.",
    evidenceStructureContribution:
      "Extensive citation of UK medicines advertising law and examples/case studies; large document " +
      "(247k characters extracted) that could stress-test evidence-linkage at greater length than any " +
      "current corpus document, but this is a volume difference, not a structurally new evidence type.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no stronger or weaker basis for issue-class exercise than Candidate 1; " +
      "not independently assessed further given the qualification outcome below.",
    governanceFindings: [
      "Official publisher confirmed: MHRA (same as Candidate 1).",
      "Official publication source confirmed: gov.uk.",
      "Exact document identity confirmed via retrieved-file SHA-256 recorded above; edition/revision explicit in the PDF's own title page (Third Edition, Third revision, November 2020).",
    ],
    unresolvedRisks: [
      "If admitted after Candidate 1, this would be the corpus's second document from the same publisher " +
        "(MHRA), breaking the corpus's current 1-document-per-publisher pattern for the first time.",
      "Document is dated November 2020 (pre-dates the page's own 2025 copyright footer) — worth confirming " +
        "at acquisition time whether a newer edition has since been published.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended over Candidate 1: identical publisher and domain contribution, so admitting it " +
      "instead of (or in addition to) Candidate 1 would not add publisher diversity, and its subject matter " +
      "(advertising compliance) overlaps procedurally with existing corpus content more than Candidate 1's " +
      "patient-facing labelling subject does. Retained only as a same-publisher fallback if Candidate 1 is " +
      "later found unsuitable at Phase 2.",
  }),

  // --- Candidate 3: AEMPS — Buenas Prácticas del Sistema Español de Farmacovigilancia ---
  Object.freeze({
    candidateId: "DRA-CAND-013-03",
    publisher: "Agencia Española de Medicamentos y Productos Sanitarios (AEMPS), Spain",
    exactTitle:
      "Buenas Prácticas del Sistema Español de Farmacovigilancia de Medicamentos de Uso Humano " +
      "(Good Pharmacovigilance Practices of the Spanish Pharmacovigilance System for Human-Use Medicines)",
    publicationDateOrVersion: "December 2016 edition (approved by the SEFV-H Technical Committee, 15 December 2016)",
    proposedDocumentType: "PROCEDURE",
    proposedDomain: "HEALTHCARE",
    language: "es",
    officialSourceUrl: "https://www.aemps.gob.es/vigilancia/medicamentosUsoHumano/SEFV-H/docs/Buenas-practicas-farmacovigilancia-SEFV-H.pdf",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "dfc08a5704227e056b80c73db1296706ec4e252f4c3de6aac8fa4fa71abbc2ce",
    licencePosition:
      "REVIEW_REQUIRED — AEMPS's site-wide legal notice (aemps.gob.es/aviso-legal) permits \"total or " +
      "partial reproduction of website content, provided the source is explicitly cited\" and requires " +
      "citing the last-update date of any reused document, but this is a bespoke attribution-reuse notice, " +
      "not a named open licence (no OGL/CC-equivalent badge found on the document or the publishing site). " +
      "This is a weaker/less-precedented licence position than the OGL v3.0 basis already VERIFIED for " +
      "Candidates 1 and 2.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to the AEMPS PDF URL returned HTTP 200, content-type application/pdf, " +
      "1,957,512 bytes; pdftotext extraction succeeded (116,735 characters of Spanish-language text, " +
      "confirmed via visual inspection of the extracted heading \"Buenas Prácticas del Sistema Español de " +
      "Farmacovigilancia de Medicamentos de Uso Humano\").",
    duplicateOrNearDuplicateRisk:
      "LOW — pharmacovigilance (post-market adverse-event surveillance) is a distinct regulatory subject " +
      "from every existing corpus document, and this would be the corpus's first non-English document.",
    corpusBalanceContribution:
      "Would simultaneously touch THREE ranked priorities: introduces a new publisher (AEMPS, priority 3), " +
      "reinforces HEALTHCARE (1 → 2, priority 5), and would be the corpus's first non-English document " +
      "(priority 6). However, per the DISCOVERY_HYPOTHESIS recorded above, combining a new publisher and a " +
      "new language in a single acquisition confounds attribution of any observed evaluator-behaviour " +
      "difference to either variable individually.",
    evidenceStructureContribution:
      "Describes a formal regulatory quality-management system (defined roles, procedures, inspection " +
      "criteria) with citations to Spanish and EU pharmacovigilance legislation — a governance-structure " +
      "type not yet represented in HEALTHCARE domain, but structurally similar in kind to existing " +
      "OTHER-type regulatory-framework documents (ICO, PRA, NCSC).",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists yet to predict whether Spanish-language legal/" +
      "regulatory citation patterns interact differently with the evaluator's authority- and evidence-" +
      "resolution stages than English-language patterns do; this is an open empirical question, not a " +
      "claimed finding.",
    governanceFindings: [
      "Official publisher confirmed: AEMPS, the Spanish state agency for medicines and health products, " +
        "operating under the Spanish Ministry of Health.",
      "Official publication source confirmed: aemps.gob.es, the agency's own domain (not a third-party mirror).",
      "Exact document identity confirmed via retrieved-file SHA-256 recorded above; version/approval date " +
        "explicit in the document's own front matter (15 December 2016 SEFV-H Committee approval).",
      "Licence basis does not match any LicenceBasis precedent already accepted in the corpus (OGL, " +
        "US_GOVERNMENT_WORK, PUBLIC_DOMAIN, BOE_NON_COMMERCIAL_ACADEMIC, BIS_NON_COMMERCIAL_EDUCATIONAL) — " +
        "a new category or an explicit governance decision would be needed before VERIFIED status is possible.",
    ],
    unresolvedRisks: [
      "Licence position is REVIEW_REQUIRED, not VERIFIED — a human legal reviewer should confirm the " +
        "attribution-reuse notice is sufficient for corpus inclusion before any Phase 2 acquisition.",
      "This would be the first non-English document ever processed by the DRA-ENG-009 acquisition/" +
        "normalisation pipeline and the frozen evaluator; no non-English compatibility issue is known, but " +
        "none has ever been demonstrated either. This should be treated as an open technical question, not " +
        "an assumed-safe operation.",
      "Combining a new publisher and a new language in one acquisition confounds variable isolation, " +
        "contrary to the DISCOVERY_HYPOTHESIS's stated rationale for sequencing.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended ahead of Candidate 1 under the stated discovery hypothesis: introduces two new " +
      "variables simultaneously (new publisher AND non-English text) rather than one, confounding " +
      "interpretation of any future evaluator-behaviour difference, and its licence position is " +
      "REVIEW_REQUIRED rather than a precedented open licence. Retained as the strongest identified " +
      "candidate for a deliberate, dedicated multilingual-coverage acquisition once a second-publisher " +
      "HEALTHCARE baseline (e.g. Candidate 1) is already in place.",
  }),
]);

// ---------------------------------------------------------------------------
// Section 4 — Ranking and recommendation
// ---------------------------------------------------------------------------

/**
 * Deterministic ranking, applied in strict priority order (fixed data, not a
 * runtime scoring function, so the reasoning is auditable line-by-line):
 *
 *   1. HTTP accessibility must be VERIFIED_ACCESSIBLE (hard gate).
 *   2. Licence tractability: a VERIFIED open licence outranks REVIEW_REQUIRED.
 *   3. Corpus-diversity contribution weighed against the DISCOVERY_HYPOTHESIS:
 *      a candidate that cleanly advances exactly one under-tested variable
 *      (new publisher) outranks one that advances several simultaneously
 *      (new publisher AND new language) because the latter confounds
 *      attribution of any future evaluator-behaviour difference.
 *   4. Marginal contribution over the top-ranked candidate: a same-publisher,
 *      same-domain alternate ranks below a candidate that adds new
 *      independent diversity value.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-013-01", // MHRA PIL guidance — accessible, VERIFIED OGL v3.0 licence, new publisher, cleanly isolates one variable
  "DRA-CAND-013-03", // AEMPS pharmacovigilance — accessible, but REVIEW_REQUIRED licence and confounds 2 variables at once
  "DRA-CAND-013-02", // MHRA Blue Guide — accessible, VERIFIED licence, but same publisher/domain as #1, no added diversity
]);

export const RECOMMENDED_CANDIDATE_ID = "DRA-CAND-013-01";

export function getCandidateById(id: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === id);
}

export function recommendedCandidate(): CandidateRecord {
  const candidate = getCandidateById(RECOMMENDED_CANDIDATE_ID);
  if (!candidate) {
    throw new Error(
      `Invariant violated: RECOMMENDED_CANDIDATE_ID ${RECOMMENDED_CANDIDATE_ID} not found in CANDIDATE_REGISTER`,
    );
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Section 5 — Phase boundary confirmation
// ---------------------------------------------------------------------------

/**
 * Explicit, machine-checkable confirmation of the Phase 1 scope boundary.
 * No corpus document with this ID exists as a result of this module; it is
 * reserved only as a plain string label for future reference.
 */
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0017";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "acquire_final_document_into_corpus",
  "create_DRA-DOC-0017",
  "create_freeze_record",
  "modify_corpus_manifest",
  "run_evaluator_on_newly_admitted_document",
  "create_DRA-BMK-017",
  "modify_evaluator_rules",
  "alter_issue_class_definitions",
  "alter_decision_derivation",
  "change_frozen_version_1_methodology",
  "modify_previous_acquisition_or_benchmark_evidence_except_append_only_reference",
  "proceed_automatically_to_phase_2",
] as const);
