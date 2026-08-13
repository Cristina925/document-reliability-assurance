/**
 * DRA-ACQ-019 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0023 (Enforcement / Decision Document Gap)
 *
 * CONTEXT — DRA-BMK-022 (twenty-two-document checkpoint) reconfirmed that
 * the corpus contains no adjudicated regulatory decision, sanction notice,
 * or enforcement action. That is the single most significant remaining
 * evidence-representativeness gap identified across the entire acquisition
 * programme to date (DRA-ACQ-006 through DRA-ACQ-018 added guidance,
 * frameworks, policy papers, procedures, and reports, but never an
 * enforcement/decision document). This programme addresses that gap
 * specifically, in preference to any other candidate-selection criterion.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 *
 * Current admitted corpus: 22 documents (DRA-DOC-0001-0022).
 * Issue-class coverage: 3/9 (IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE,
 * IC-7 CLAIM_INCONSISTENCY). DRA-CHK-002 established the other six classes
 * are STRUCTURALLY_UNREACHABLE under the frozen Version 1 pipeline. This
 * programme does not attempt to force coverage of those six classes and
 * does not select candidates on that basis.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This module
 * does not download-and-freeze, admit, or evaluate any document. It does
 * not create DRA-DOC-0023, DRA-FRZ-000017, a new registry entry, or
 * DRA-BMK-023, and it does not modify evaluator 0.1.2, any pipeline stage,
 * normalisation, or any existing frozen artefact. See
 * PHASE_1_PROHIBITED_ACTIONS below and the accompanying test file for
 * explicit assertions of that boundary.
 *
 * This module records:
 *
 *   1. A reconstructed profile of the current 22-document corpus (extending
 *      the DRA-ACQ-018 Phase 1 21-document inventory with DRA-DOC-0022,
 *      the European Environment Agency report admitted at DRA-ACQ-018
 *      Phase 2 / DRA-ACQ-000025).
 *   2. The task's own fixed target-document-class priority order (an
 *      adjudicated regulatory decision ranks highest; a generic report,
 *      guidance document, framework, or policy paper is explicitly out of
 *      scope for this acquisition even if easier to obtain).
 *   3. The set of desired structural elements a qualifying candidate should
 *      exhibit, used only to record which elements were actually observed
 *      in each candidate — never to manufacture or assume issue-class
 *      coverage from their presence.
 *   4. A candidate register of five genuinely researched, real,
 *      official-source documents. For each: a live HTTP accessibility
 *      check, a licence/copyright determination with supporting textual
 *      evidence, a repeated byte-identical fetch where accessible, and a
 *      structural-element checklist derived from directly reading the
 *      extracted document text (via `pdftotext`) — not inferred or
 *      assumed.
 *   5. A deterministic ranking and Phase 1 qualification verdict for the
 *      primary candidate, explicit alternates, and a Phase 1 qualification
 *      record covering identity, governance, acquisition, evidence
 *      contribution, corpus contribution, and risks.
 *
 * All live verification (HTTP status/headers, SHA-256 digests, licence
 * footer text, structural element checks) was performed on 2026-08-10 via
 * `curl` and `pdftotext` against the documents' official publisher URLs and
 * is recorded here as fixed data. This module does not re-fetch anything at
 * runtime or during test execution.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Reconstructed 22-document corpus profile
// ---------------------------------------------------------------------------

export interface CorpusInventoryRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly language: string;
  readonly sourceFormat: "PDF" | "STATIC_HTML" | "MULTI_PAGE_HTML";
  readonly difficulty: "LOW" | "MEDIUM" | "HIGH";
  readonly isRealAcquisition: boolean;
  readonly acquisitionId: string | null;
}

/**
 * DRA-DOC-0001-0021 transcribed field-for-field from the DRA-ACQ-018 Phase 1
 * inventory (`dra-acq-018-evidence-gap-discovery.ts`, Part 1). DRA-DOC-0022
 * appended from the DRA-ACQ-018 Phase 2 admission record
 * (`dra-acq-018-eea-waste-prevention-admission.test.ts`): publisher
 * "European Environment Agency (EEA)", domain GENERAL, documentType REPORT,
 * language "en", sourceFormat PDF, difficulty HIGH, acquisitionId
 * DRA-ACQ-000025 (programme ref DRA-ACQ-018).
 */
export const CORPUS_INVENTORY: readonly CorpusInventoryRow[] = Object.freeze([
  Object.freeze({ corpusId: "DRA-DOC-0001", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "TECHNICAL", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0002", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "BUSINESS", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0003", publisher: "Internal (AI+human)", documentType: "REPORT", domain: "GENERAL", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0004", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "GENERAL", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0005", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "LEGAL", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0006", publisher: "Internal (human)", documentType: "REPORT", domain: "TECHNICAL", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0007", publisher: "Apache Software Foundation", documentType: "ARTICLE", domain: "TECHNICAL", language: "en", sourceFormat: "STATIC_HTML", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-001" }),
  Object.freeze({ corpusId: "DRA-DOC-0008", publisher: "Acas", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", sourceFormat: "PDF", difficulty: "LOW", isRealAcquisition: true, acquisitionId: "DRA-ACQ-002" }),
  Object.freeze({ corpusId: "DRA-DOC-0009", publisher: "Competition and Markets Authority", documentType: "SUMMARY", domain: "GENERAL", language: "en-GB", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-004" }),
  Object.freeze({ corpusId: "DRA-DOC-0010", publisher: "National Institute of Standards and Technology (NIST)", documentType: "POLICY", domain: "TECHNICAL", language: "en", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-005" }),
  Object.freeze({ corpusId: "DRA-DOC-0011", publisher: "Information Commissioner's Office (ICO)", documentType: "OTHER", domain: "LEGAL", language: "en", sourceFormat: "MULTI_PAGE_HTML", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-006" }),
  Object.freeze({ corpusId: "DRA-DOC-0012", publisher: "Prudential Regulation Authority (PRA), Bank of England", documentType: "OTHER", domain: "FINANCE", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-007" }),
  Object.freeze({ corpusId: "DRA-DOC-0013", publisher: "U.S. Food and Drug Administration (FDA)", documentType: "POLICY", domain: "HEALTHCARE", language: "en", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-008" }),
  Object.freeze({ corpusId: "DRA-DOC-0014", publisher: "Basel Committee on Banking Supervision (BCBS)", documentType: "POLICY", domain: "FINANCE", language: "en", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-009" }),
  Object.freeze({ corpusId: "DRA-DOC-0015", publisher: "National Cyber Security Centre (NCSC)", documentType: "OTHER", domain: "TECHNICAL", language: "en", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-011" }),
  Object.freeze({ corpusId: "DRA-DOC-0016", publisher: "Health and Safety Executive (HSE)", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", sourceFormat: "MULTI_PAGE_HTML", difficulty: "LOW", isRealAcquisition: true, acquisitionId: "DRA-ACQ-012" }),
  Object.freeze({ corpusId: "DRA-DOC-0017", publisher: "Medicines and Healthcare products Regulatory Agency (MHRA)", documentType: "PROCEDURE", domain: "HEALTHCARE", language: "en-GB", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-013" }),
  Object.freeze({ corpusId: "DRA-DOC-0018", publisher: "European Commission — High-Level Expert Group on AI", documentType: "REPORT", domain: "TECHNICAL", language: "es", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-014" }),
  Object.freeze({ corpusId: "DRA-DOC-0019", publisher: "Instituto Nacional de Estadística (INE)", documentType: "REPORT", domain: "GENERAL", language: "es", sourceFormat: "PDF", difficulty: "MEDIUM", isRealAcquisition: true, acquisitionId: "DRA-ACQ-015" }),
  Object.freeze({ corpusId: "DRA-DOC-0020", publisher: "Commission Nationale de l'Informatique et des Libertés (CNIL)", documentType: "REPORT", domain: "LEGAL", language: "fr", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-016" }),
  Object.freeze({ corpusId: "DRA-DOC-0021", publisher: "European Commission — High-Level Expert Group on AI", documentType: "REPORT", domain: "TECHNICAL", language: "en", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-017" }),
  Object.freeze({ corpusId: "DRA-DOC-0022", publisher: "European Environment Agency (EEA)", documentType: "REPORT", domain: "GENERAL", language: "en", sourceFormat: "PDF", difficulty: "HIGH", isRealAcquisition: true, acquisitionId: "DRA-ACQ-000025" }),
]);

export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

function tally<K extends string>(rows: readonly CorpusInventoryRow[], field: "domain" | "documentType"): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const key = row[field] as K;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export const REAL_DOMAIN_COUNTS: ReadonlyMap<Domain, number> = tally<Domain>(REAL_ACQUISITIONS, "domain");
export const REAL_DOCUMENT_TYPE_COUNTS: ReadonlyMap<DocumentType, number> = tally<DocumentType>(REAL_ACQUISITIONS, "documentType");

/** Domains at the current minimum real-acquisition count (the under-represented tier). */
export function leastRepresentedRealDomains(): readonly Domain[] {
  const allDomains: readonly Domain[] = ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"];
  const min = Math.min(...allDomains.map((d) => REAL_DOMAIN_COUNTS.get(d) ?? 0));
  return Object.freeze(allDomains.filter((d) => (REAL_DOMAIN_COUNTS.get(d) ?? 0) === min));
}

export const CORPUS_PROFILE_SUMMARY = Object.freeze({
  totalDocuments: 22,
  realAcquisitions: 16,
  syntheticSeedDocuments: 6,
  domainCountsReal: "TECHNICAL 5, GENERAL 3, BUSINESS 2, LEGAL 2, HEALTHCARE 2, FINANCE 2 (BUSINESS/LEGAL/HEALTHCARE/FINANCE are jointly least-represented at the 2-document floor since DRA-DOC-0022 raised GENERAL to 3)",
  enforcementDecisionGap:
    "Zero of the 22 admitted documents (real or synthetic) is an adjudicated regulatory decision, formal enforcement action, sanction/penalty decision, or enforcement notice. Every real-acquisition regulator relationship already present in the corpus " +
    "(ICO, CMA, PRA, HSE, MHRA, NCSC, FDA, BCBS, NIST, CNIL) has produced only guidance, procedure, policy, framework, summary, or report documents — never an individual adjudicated case outcome. This is the single most significant document-genre gap in the corpus.",
});

// ---------------------------------------------------------------------------
// Part 2 — Target document class priority (fixed, from the DRA-ACQ-019 task)
// ---------------------------------------------------------------------------

export interface TargetClassPriority {
  readonly rank: number;
  readonly key: string;
  readonly description: string;
}

/**
 * Fixed priority order given directly by the DRA-ACQ-019 task specification.
 * A candidate's targetClassRank below records which of these five classes
 * it most precisely matches; candidates are NOT permitted to be selected
 * merely because they are an easier-to-obtain report, guidance document,
 * framework, or policy paper.
 */
export const TARGET_CLASS_PRIORITY: readonly TargetClassPriority[] = Object.freeze([
  Object.freeze({ rank: 1, key: "adjudicated_regulatory_decision", description: "An adjudicated regulatory decision (a formal finding of infringement/breach with a determination)." }),
  Object.freeze({ rank: 2, key: "formal_enforcement_decision_or_action", description: "A formal enforcement decision or enforcement action by a regulator/supervisory authority." }),
  Object.freeze({ rank: 3, key: "sanction_or_penalty_decision", description: "A sanction or penalty decision (e.g. a monetary penalty notice)." }),
  Object.freeze({ rank: 4, key: "enforcement_notice", description: "A formal enforcement notice." }),
  Object.freeze({ rank: 5, key: "equivalent_authoritative_determination", description: "An equivalent authoritative determination containing findings and a resulting regulatory action." }),
]);

/**
 * Structural elements the task asks Phase 1 to look for and record as
 * OBSERVED or NOT_OBSERVED per candidate — never to be manufactured, assumed,
 * or treated as predicting issue-class coverage.
 */
export const DESIRED_STRUCTURAL_ELEMENTS: readonly string[] = Object.freeze([
  "identified_regulated_party",
  "statutory_or_regulatory_authority_basis",
  "factual_findings",
  "evidence_references",
  "allegations_or_breaches",
  "reasoning",
  "determination",
  "enforcement_powers_invoked",
  "sanctions_penalties_or_corrective_measures",
  "dates",
  "explicit_outcome",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register (five real, independently live-verified documents)
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = ["VERIFIED_ACCESSIBLE", "BLOCKED", "NOT_VERIFIED"] as const;
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["BYTE_STABLE", "UNKNOWN", "BLOCKED"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED_BLOCKED",
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
  readonly targetClassRank: number;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceReuseBasis: string;
  readonly licenceReuseStatus: LicenceReuseStatus;
  readonly httpAccessibility: HttpAccessibilityStatus;
  readonly accessibilityEvidence: string;
  readonly sourceStabilityStatus: SourceStabilityStatus;
  readonly stabilityObservations: string;
  readonly structuralElementsObserved: readonly string[];
  readonly structuralEvidenceNote: string;
  readonly isRepeatPublisher: boolean;
  readonly repeatPublisherNote: string | null;
  readonly corpusDiversityContribution: string;
  readonly corpusDiversityLimitation: string;
  readonly sizePerformanceAssessment: string;
  readonly knownRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: Competition and Markets Authority — CA98 infringement decision ---
  Object.freeze({
    candidateId: "DRA-CAND-019-01",
    title: "Anti-competitive conduct in relation to vehicle recycling and advertising of recycling-related features (Case 51098)",
    publisher: "Competition and Markets Authority (CMA)",
    jurisdiction: "United Kingdom",
    domain: "GENERAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
    publicationDate: "1 April 2025",
    approximateSize: "4,088,160 bytes; 80,933 words extracted; 226+ pages",
    targetClassRank: 1,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "VERIFIED — the decision PDF's own first page states explicitly, in-document: \"© Crown copyright 2025. You may reuse this " +
      "information (not including logos) free of charge in any format or medium, under the terms of the Open Government Licence. " +
      "To view this licence, visit www.nationalarchives.gov.uk/doc/open-government-licence/...\" — a document-level licence " +
      "statement, not merely a site-wide inference, and consistent with the Crown-copyright/OGL v3.0 precedent already accepted " +
      "for Acas (DRA-DOC-0008), HSE (DRA-DOC-0016), and MHRA (DRA-DOC-0017).",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) HTTP/2 200, content-type application/pdf, content-disposition inline, content-length 4,088,160, etag present.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent fetches taken minutes apart today produced byte-identical files: SHA-256 " +
      "639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725cbccbd115 in both cases.",
    structuralElementsObserved: [
      "identified_regulated_party", "statutory_or_regulatory_authority_basis", "factual_findings",
      "evidence_references", "allegations_or_breaches", "reasoning", "determination",
      "enforcement_powers_invoked", "sanctions_penalties_or_corrective_measures", "dates", "explicit_outcome",
    ],
    structuralEvidenceNote:
      "Confirmed directly from extracted text: named regulated parties (VM Parties, Trade Association Parties, e.g. Peugeot " +
      "Citroen, Stellantis, Toyota, JLR, VW group entities); statutory basis (Competition Act 1998, Chapter I prohibition, " +
      "legal-principles sections on establishing an infringement); factual findings and evidence sections (industry background, " +
      "investigation chapters); an infringement determination with individual penalty calculations set out in Annex 3 and Annex " +
      "4 (\"PENALTY CALCULATIONS BY PARTY FOR NCI INFRINGEMENT\" / \"...FOR ZTC INFRINGEMENT\"); dates (01 April 2025, plus a " +
      "chronological investigation timeline); and an explicit outcome with a stated right of appeal to the Competition Appeal " +
      "Tribunal (\"CAT\"). All 11 desired structural elements were directly observed, not assumed.",
    isRepeatPublisher: true,
    repeatPublisherNote:
      "CMA already appears once in the corpus (DRA-DOC-0009, a market-study summary on AI foundation models, GENERAL domain, " +
      "documentType SUMMARY). This candidate would be a second CMA document, but of a categorically different document type " +
      "(a full adjudicated infringement decision vs. a market-study summary) and a completely different subject matter " +
      "(vehicle-recycling anti-competitive conduct vs. AI foundation models).",
    corpusDiversityContribution:
      "Fills the enforcement/decision-document genre gap outright — the corpus's first document that is a formal adjudicated " +
      "regulatory decision with statutory findings, evidence, and an imposed sanction. Structurally unlike anything else in the " +
      "corpus (existing OTHER-type documents at ICO/PRA/NCSC are guidance or supervisory-framework documents, not individual " +
      "case adjudications).",
    corpusDiversityLimitation:
      "Does not improve publisher diversity (CMA already present) or domain balance (GENERAL is already the second-most " +
      "represented domain at 3, not one of the four domains at the 2-document floor). This is a genuine, disclosed limitation, " +
      "not a reason to disqualify the candidate given the overriding priority of the enforcement/decision-genre gap.",
    sizePerformanceAssessment:
      "Large (4.09 MB, ~81,000 words, 226+ pages) — comparable in order of magnitude to DRA-DOC-0020 (the document responsible " +
      "for the non-linear CPU-scaling finding in DRA-BMK-022). This is a real, disclosed performance risk, not a reason to seek " +
      "an artificially smaller document at the cost of evidence quality: the size is intrinsic to a genuine multi-party CA98 " +
      "infringement decision with detailed penalty-calculation annexes, not a deliberate scale-testing choice. No evaluator or " +
      "production change is proposed to accommodate it; if adopted, the size/performance implication should be reassessed at " +
      "Phase 2 before any freeze decision.",
    knownRisks: [
      "Large document size carries a known CPU-scaling performance risk under evaluator 0.1.2, per the DRA-BMK-022 finding; " +
        "this should be re-examined explicitly at Phase 2, not silently absorbed.",
      "Repeat publisher and non-floor domain, as disclosed above — the diversity contribution is genre/structural, not " +
        "publisher/domain.",
      "Confidential information and named individuals have been redacted from the published version (denoted by '[]' in the " +
        "text); this is a normal feature of published CMA decisions but should be noted for evidence-linkage/traceability " +
        "checks at evaluation time.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 2: ICO — Monetary Penalty Notice (Capita) ---
  Object.freeze({
    candidateId: "DRA-CAND-019-02",
    title: "Penalty Notice: Capita plc and Capita Pension Solutions Limited",
    publisher: "Information Commissioner's Office (ICO)",
    jurisdiction: "United Kingdom",
    domain: "LEGAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://ico.org.uk/media2/pv5nhks4/capita-plc-and-cpsl-monetary-penalty-notice.pdf",
    publicationDate: "15 October 2025",
    approximateSize: "1,268,409 bytes; 39,745 words extracted",
    targetClassRank: 3,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PROVISIONAL — no in-document licence footer or copyright statement was found in the extracted text of this specific " +
      "Penalty Notice. Reuse basis instead relies on ICO's general site-wide notice already relied upon for DRA-DOC-0011 " +
      "(DRA-ACQ-006): \"All text content is available under the Open Government Licence v3.0, except where otherwise stated.\" " +
      "This is the same PROVISIONAL/REVIEW_REQUIRED pattern already accepted once for this publisher, but it is a weaker, " +
      "document-independent inference compared with Candidate 1's explicit in-document Crown-copyright/OGL statement.",
    licenceReuseStatus: "PROVISIONAL",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) HTTP/2 200, content-type application/pdf, content-length 1,268,409, etag present.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent fetches taken minutes apart today produced byte-identical files: SHA-256 " +
      "6bf1bde8615d7163edbe6fe0bda95c9a6d6aa924e4d0337b5338c4800e036f9f in both cases.",
    structuralElementsObserved: [
      "identified_regulated_party", "statutory_or_regulatory_authority_basis", "factual_findings",
      "evidence_references", "allegations_or_breaches", "reasoning", "determination",
      "enforcement_powers_invoked", "sanctions_penalties_or_corrective_measures", "dates", "explicit_outcome",
    ],
    structuralEvidenceNote:
      "Confirmed directly from extracted text: named regulated parties (Capita plc, Capita Pension Solutions Limited); " +
      "statutory basis (UK GDPR, Data Protection Act 2018); factual findings on a 2023 cyber attack; specific penalty amounts " +
      "(\"requires Capita plc to pay a penalty of £8,000,000, and Capita Pension Solutions Limited...a penalty of £6,000,000\", " +
      "reduced from an originally proposed £25,000,000); and an explicit stated right of appeal to the First-tier Tribunal " +
      "(Information Rights) within 28 days. All 11 desired structural elements were directly observed, headed " +
      "\"NON-CONFIDENTIAL FOR PUBLICATION\".",
    isRepeatPublisher: true,
    repeatPublisherNote:
      "ICO already appears once in the corpus (DRA-DOC-0011, LEGAL domain, documentType OTHER — the AI-and-data-protection " +
      "guidance hub, a multi-page HTML publication). This would be a second ICO document, of a completely different genre " +
      "(an individual adjudicated monetary penalty vs. general guidance) and source format (single PDF vs. 14-section HTML).",
    corpusDiversityContribution:
      "Also fills the enforcement/decision-document genre gap, and reinforces LEGAL — one of the four domains currently at the " +
      "2-document floor — bringing it to 3, unlike Candidate 1 which reinforces the already-larger GENERAL domain.",
    corpusDiversityLimitation:
      "Repeat publisher (as disclosed above). Weaker document-level licence evidence than Candidate 1 (site-wide inference " +
      "only, no in-document footer on this specific Penalty Notice).",
    sizePerformanceAssessment: "Moderate (1.27 MB, ~40,000 words) — well below the DRA-BMK-022 scale-risk threshold observed for DRA-DOC-0020.",
    knownRisks: [
      "Licence position is weaker than Candidate 1's (PROVISIONAL/site-wide inference vs. VERIFIED/document-level statement).",
      "As an individual enforcement action naming a specific firm, this carries different reputational/sensitivity " +
        "considerations than the corpus's existing institutional-guidance documents, worth an explicit governance sign-off " +
        "independent of the licence question, consistent with the precedent recorded for a comparable FCA candidate at " +
        "DRA-ACQ-018 (DRA-CAND-018-03).",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended ahead of Candidate 1: matches a lower target-class rank (3, sanction/penalty decision, vs. Candidate " +
      "1's rank 1, adjudicated regulatory decision) and has a materially weaker document-level licence position (PROVISIONAL " +
      "site-wide inference vs. Candidate 1's VERIFIED in-document Crown-copyright/OGL statement). Its LEGAL-domain-balancing " +
      "contribution is real but does not outweigh Candidate 1's stronger governance and target-class fit. Retained as a fully " +
      "qualified alternate.",
  }),

  // --- Candidate 3: ICO — Monetary Penalty Notice (23andMe) ---
  Object.freeze({
    candidateId: "DRA-CAND-019-03",
    title: "Penalty Notice: 23andMe, Inc.",
    publisher: "Information Commissioner's Office (ICO)",
    jurisdiction: "United Kingdom",
    domain: "LEGAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://ico.org.uk/media2/kclbljpo/23andme-penalty-notice.pdf",
    publicationDate: "5 June 2025",
    approximateSize: "2,433,151 bytes; 45,589 words extracted",
    targetClassRank: 3,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PROVISIONAL — same ICO site-wide OGL v3.0 basis as Candidate 2; no in-document licence footer found. Additionally, this " +
      "specific document's own header text reads \"CONFIDENTIAL / OFFICIAL - Sensitive\" on every extracted page (rather than " +
      "Candidate 2's \"NON-CONFIDENTIAL FOR PUBLICATION\" marking) despite being served from ICO's public enforcement-action " +
      "listing. This is an unresolved governance question, not merely a licence question: whether the marking is a leftover " +
      "internal-template artefact on an intentionally public release, or signals content that should not be treated as freely " +
      "reusable without further clarification, was NOT determined in this phase.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) HTTP/2 200, content-type application/pdf, content-length 2,433,151, etag present.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent fetches taken minutes apart today produced byte-identical files: SHA-256 " +
      "d8509fdf38ddd2c29587d7cb73fdd505e072fbee5d2bec184eaf97e789b6d593 in both cases.",
    structuralElementsObserved: [
      "identified_regulated_party", "statutory_or_regulatory_authority_basis", "factual_findings",
      "evidence_references", "allegations_or_breaches", "reasoning", "determination",
      "enforcement_powers_invoked", "sanctions_penalties_or_corrective_measures", "dates", "explicit_outcome",
    ],
    structuralEvidenceNote:
      "Confirmed directly from extracted text: named regulated party (23andMe, Inc.); statutory basis (UK GDPR Articles " +
      "5(1)(f) and 32(1)); detailed factual findings on 2019-2023 credential-stuffing and cyber-attack events; a stated " +
      "penalty of £2,310,000; and an explicit outcome. Structurally as rich as Candidate 2.",
    isRepeatPublisher: true,
    repeatPublisherNote: "Same repeat-publisher note as Candidate 2 (ICO already present via DRA-DOC-0011).",
    corpusDiversityContribution: "Same LEGAL-domain-balancing and enforcement-genre contribution as Candidate 2, if the confidentiality-marking question were resolved.",
    corpusDiversityLimitation: "Same repeat-publisher limitation as Candidate 2, plus the unresolved confidentiality-marking anomaly noted above.",
    sizePerformanceAssessment: "Moderate (2.43 MB, ~45,600 words) — below the DRA-BMK-022 scale-risk threshold.",
    knownRisks: [
      "Unresolved \"CONFIDENTIAL / OFFICIAL - Sensitive\" internal marking on every page of an otherwise publicly listed " +
        "enforcement document — a governance anomaly not present on Candidate 2's cleaner \"NON-CONFIDENTIAL FOR PUBLICATION\" " +
        "marking, and not investigated further in this phase.",
      "Same weaker licence position and reputational-sensitivity considerations as Candidate 2.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: strong structural and genre fit, but the unresolved internal confidentiality marking " +
      "found on every page is a governance anomaly that should be clarified by a human reviewer before this specific document " +
      "is treated as equivalent to Candidate 2. Candidate 2 (Capita) is preferred within the ICO track because its own " +
      "\"NON-CONFIDENTIAL FOR PUBLICATION\" marking presents no such open question.",
  }),

  // --- Candidate 4: Ofwat — enforcement order and financial penalty decision (Thames Water) ---
  Object.freeze({
    candidateId: "DRA-CAND-019-04",
    title: "Notice of Ofwat's decision to issue an enforcement order and impose a financial penalty on Thames Water",
    publisher: "Water Services Regulation Authority (Ofwat)",
    jurisdiction: "United Kingdom",
    domain: "GENERAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.ofwat.gov.uk/wp-content/uploads/2024/08/2025-05-28-Thames-Water-Final-Decision-Document-REDACTED.pdf",
    publicationDate: "28 May 2025",
    approximateSize: "Not obtainable in this phase (request blocked before the PDF was served)",
    targetClassRank: 2,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis: "NOT_VERIFIED — not reached; the request was blocked before any document content (including a licence footer) could be retrieved.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "BLOCKED",
    accessibilityEvidence:
      "curl -L (Chrome UA, with and without a Referer header) returned HTTP/2 403 from Cloudflare with header " +
      "\"cf-mitigated: challenge\" — an automated-request challenge page (HTML, not the PDF) was served instead of the " +
      "document, both with and without a browser-like user agent. The same Cloudflare-challenge behaviour occurred on a " +
      "second Ofwat enforcement decision URL (the equivalent Dŵr Cymru penalty decision), indicating a site-wide bot-mitigation " +
      "policy rather than a one-off fluke. This mirrors the OBR Cloudflare-blocking finding already recorded at DRA-ACQ-003.",
    sourceStabilityStatus: "BLOCKED",
    stabilityObservations: "Not obtainable; both fetch attempts returned the Cloudflare challenge page, not the source document.",
    structuralElementsObserved: [],
    structuralEvidenceNote:
      "Not directly verifiable in this phase. The publicly visible search-result excerpt alone (\"1. Introduction...2. " +
      "Relevant background...3. Our investigation...4. Our assessment and findings...5. Our decision to issue an enforcement " +
      "order...6. Our...\") strongly suggests this would be an exceptionally strong structural match for target-class rank 2 " +
      "(formal enforcement decision/action) if it were retrievable, but this is not itself evidence of the document's content " +
      "and is not counted toward qualification.",
    isRepeatPublisher: false,
    repeatPublisherNote: null,
    corpusDiversityContribution:
      "Would have been the strongest available new-publisher and new-authority-type contribution among all five candidates " +
      "(Ofwat, a water/utilities economic regulator, has never appeared in the corpus) had it been accessible.",
    corpusDiversityLimitation: "None beyond the accessibility blocker below; the limitation here is entirely acquisition-side, not evidentiary.",
    sizePerformanceAssessment: "Not obtainable in this phase.",
    knownRisks: [
      "The document is not retrievable through a direct, first-party HTTP request under the acquisition methods already " +
        "established by this programme (no new fetching technique, header spoofing, or CAPTCHA-solving was attempted, " +
        "consistent with the instruction not to make evaluator/engineering changes to accommodate a candidate).",
      "No alternate first-party mirror of this specific decision was located in this phase; sourcing it via any third-party " +
        "mirror would violate the official-source requirement.",
    ],
    qualificationOutcome: "REJECTED_BLOCKED",
    rejectionOrDeferralReason:
      "REJECTED for this phase strictly on acquisition-accessibility grounds, not on governance or evidence-quality grounds: " +
      "the official source is protected by a Cloudflare bot-mitigation challenge that blocked every direct-fetch attempt made " +
      "in this phase, and no accessible first-party alternative was found. If Ofwat enforcement decisions become directly " +
      "fetchable in a future phase (e.g. via a different, still first-party access path), this document should be " +
      "re-considered — it is not disqualified on the merits.",
  }),

  // --- Candidate 5: Ofcom — enforcement/confirmation decisions ---
  Object.freeze({
    candidateId: "DRA-CAND-019-05",
    title: "Confirmation Decision / Final Decision (Ofcom enforcement bulletin cases, e.g. Gigaclear Limited; MintStars Ltd)",
    publisher: "Office of Communications (Ofcom)",
    jurisdiction: "United Kingdom",
    domain: "GENERAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.ofcom.org.uk/siteassets/resources/documents/about-ofcom/bulletins/enforcement-bulletin/all-cases/gigaclear/confirmation-decision---gigaclear-limited.pdf",
    publicationDate: "30 July 2025 (Gigaclear); 23 January 2025 (MintStars)",
    approximateSize: "Not obtainable in this phase (request blocked before either PDF was served)",
    targetClassRank: 2,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis: "NOT_VERIFIED — not reached; the request was blocked before any document content could be retrieved.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "BLOCKED",
    accessibilityEvidence:
      "curl -L (Chrome UA) returned HTTP/2 403 from Cloudflare for both the Gigaclear confirmation decision and the MintStars " +
      "final decision URLs, with a short HTML error body rather than the PDF.",
    sourceStabilityStatus: "BLOCKED",
    stabilityObservations: "Not obtainable; both fetch attempts returned a Cloudflare error page, not the source document.",
    structuralElementsObserved: [],
    structuralEvidenceNote:
      "Not directly verifiable in this phase. Ofcom enforcement bulletin cases are, by publicly known convention, formal " +
      "regulatory confirmation/final decisions under the Communications Act 2003 or Online Safety Act 2023 naming a regulated " +
      "party, findings, and (where applicable) a penalty, but this was not confirmed against the actual document text here.",
    isRepeatPublisher: false,
    repeatPublisherNote: null,
    corpusDiversityContribution: "Would have been a new-publisher, new-authority-type (communications regulator) contribution had either document been accessible.",
    corpusDiversityLimitation: "None beyond the accessibility blocker; entirely acquisition-side.",
    sizePerformanceAssessment: "Not obtainable in this phase.",
    knownRisks: [
      "Same Cloudflare-blocking pattern as Candidate 4, observed independently on two different Ofcom document URLs, again " +
        "suggesting a site-wide bot-mitigation policy rather than a one-off fluke.",
      "No alternate first-party mirror was located in this phase.",
    ],
    qualificationOutcome: "REJECTED_BLOCKED",
    rejectionOrDeferralReason:
      "REJECTED for this phase on the same acquisition-accessibility grounds as Candidate 4 — not disqualified on the merits, " +
      "but not retrievable through any first-party method attempted in this phase.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Deterministic ranking and Phase 1 decision
// ---------------------------------------------------------------------------

/**
 * Ranked by a fixed, pre-declared rule applied mechanically: accessible
 * candidates are ranked first (ascending targetClassRank, i.e. the
 * strongest genre match wins), then by licenceReuseStatus (VERIFIED before
 * PROVISIONAL before NOT_VERIFIED), then blocked candidates are appended in
 * registration order. This rule was fixed before scoring, not re-ordered
 * after seeing which candidate wins.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze(
  [...CANDIDATE_REGISTER]
    .sort((a, b) => {
      const aBlocked = a.httpAccessibility === "BLOCKED" ? 1 : 0;
      const bBlocked = b.httpAccessibility === "BLOCKED" ? 1 : 0;
      if (aBlocked !== bBlocked) return aBlocked - bBlocked;
      if (aBlocked === 1) return 0; // preserve registration order among blocked candidates
      if (a.targetClassRank !== b.targetClassRank) return a.targetClassRank - b.targetClassRank;
      const licenceOrder: Record<LicenceReuseStatus, number> = { VERIFIED: 0, PROVISIONAL: 1, NOT_VERIFIED: 2 };
      return licenceOrder[a.licenceReuseStatus] - licenceOrder[b.licenceReuseStatus];
    })
    .map((c) => c.candidateId),
);

export const PRIMARY_CANDIDATE_ID: string = "DRA-CAND-019-01";
export const ALTERNATE_1_CANDIDATE_ID: string = "DRA-CAND-019-02";

export function getCandidateById(id: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === id);
}

export function primaryCandidate(): CandidateRecord {
  const c = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!c) throw new Error(`Invariant violated: PRIMARY_CANDIDATE_ID ${PRIMARY_CANDIDATE_ID} not found`);
  return c;
}

export const PHASE_1_VERDICTS = ["QUALIFIED", "CONDITIONALLY_QUALIFIED", "NOT_QUALIFIED"] as const;
export type Phase1Verdict = (typeof PHASE_1_VERDICTS)[number];

/**
 * Applies the task's own qualification gate mechanically to the primary
 * candidate: official source verified, licensing verified (not merely
 * provisional), source byte-stable and directly accessible, no stronger
 * candidate dominates it (it ranks first), and every desired structural
 * element was directly observed (not assumed).
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const gatesPass =
    c.officialSourceStatus === "VERIFIED" &&
    c.licenceReuseStatus === "VERIFIED" &&
    c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
    c.sourceStabilityStatus === "BYTE_STABLE" &&
    c.structuralElementsObserved.length === DESIRED_STRUCTURAL_ELEMENTS.length &&
    c.qualificationOutcome === "QUALIFIED_RECOMMENDED" &&
    RANKED_CANDIDATE_IDS[0] === c.candidateId;
  return gatesPass ? "QUALIFIED" : "NOT_QUALIFIED";
}

// ---------------------------------------------------------------------------
// Part 5 — Phase 1 qualification record (required output, primary candidate)
// ---------------------------------------------------------------------------

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  candidateIdentity: Object.freeze({
    title: "Anti-competitive conduct in relation to vehicle recycling and advertising of recycling-related features (Case 51098)",
    issuingAuthority: "Competition and Markets Authority (CMA)",
    date: "1 April 2025",
    jurisdiction: "United Kingdom",
    domain: "GENERAL",
    language: "en-GB",
    documentType: "Decision under the Competition Act 1998 (schema value: OTHER)",
    format: "PDF",
    approximateSize: "4,088,160 bytes; ~80,933 words; 226+ pages",
    officialUrl: "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
  }),
  governance: Object.freeze({
    officialSourceDetermination: "VERIFIED — served directly from assets.publishing.service.gov.uk (UK Government's official asset-hosting domain) and cross-linked from the CMA's own gov.uk case page.",
    licenceDetermination: "VERIFIED — explicit in-document Crown copyright + Open Government Licence statement on the decision's own first page (quoted in full in the candidate register above).",
    unresolvedQuestions: Object.freeze([
      "Human attestation of the licence determination is still required before any freeze, per this programme's standing " +
        "governance convention (every prior OGL-based admission in this corpus records a PROVISIONAL/REVIEW_REQUIRED human " +
        "sign-off step even where the pre-assessment itself is VERIFIED-strength).",
      "The performance implication of this document's size under evaluator 0.1.2 (see DRA-BMK-022's non-linear CPU-scaling " +
        "finding) has not been measured for this specific document and should be assessed before a freeze commitment.",
    ]),
  }),
  acquisition: Object.freeze({
    accessibility: "VERIFIED_ACCESSIBLE — HTTP 200 on two independent fetches today.",
    mediaType: "application/pdf",
    expectedReproducibilityClassification: "BYTE_STABLE — confirmed via identical SHA-256 across two independent fetches taken minutes apart.",
    risks: Object.freeze([
      "Document size (~4.1 MB / ~81,000 words) is large relative to most of the existing corpus and carries a disclosed, " +
        "unquantified CPU-scaling risk under evaluator 0.1.2, per the DRA-BMK-022 finding.",
      "The document contains redacted confidential passages and anonymised individual names, a normal feature of published " +
        "CMA decisions, which should be considered when assessing evidence-linkage and traceability behaviour at evaluation time.",
    ]),
  }),
  evidenceContribution:
    "Fills the single highest-priority evidence gap identified by DRA-BMK-022: the corpus's first adjudicated regulatory " +
    "decision, with a statutory infringement finding, referenced evidence, reasoning, and an imposed financial sanction " +
    "against multiple named parties. This is a genuinely new document genre and structural pattern, not merely a new subject " +
    "matter within an existing genre.",
  corpusContribution:
    "New document type/genre (adjudicated CA98 infringement decision, distinct from every existing OTHER-type document in " +
    "the corpus, which are guidance or supervisory-framework texts). Does NOT contribute new publisher diversity (CMA already " +
    "present via DRA-DOC-0009) or domain-balance improvement (GENERAL is already the second-most represented domain at 3, " +
    "not one of the four domains at the 2-document floor) — this is a disclosed, deliberate trade-off in favour of the " +
    "higher-priority genre gap.",
  risks: Object.freeze([
    "Governance: none identified beyond the standing human-attestation step common to every OGL-based admission in this corpus.",
    "Acquisition: large file size; CPU-scaling performance risk under evaluator 0.1.2 not yet measured for this specific document.",
    "Structural: none identified — all 11 desired structural elements were directly observed in the extracted text.",
    "Scale: size is intrinsic to the genuine multi-party decision and its penalty-calculation annexes, not a deliberate " +
      "scale-testing choice; still flagged per the task's scale-constraint instruction.",
    "Methodological: reinforces GENERAL/CMA rather than improving domain or publisher balance; if domain balance is judged " +
      "more urgent than the enforcement/decision-genre gap in a future phase, Candidate 2 (ICO Capita, LEGAL domain) is the " +
      "next-best alternative.",
  ]),
  recommendation: "QUALIFIED",
  recommendationReasoning:
    "This candidate is the strongest available match against the task's own target-class priority (rank 1 of 5: an " +
    "adjudicated regulatory decision, not merely an enforcement notice or penalty decision), has the strongest governance " +
    "evidence of any candidate examined (an explicit, document-level Crown-copyright/OGL statement, not a site-wide " +
    "inference), is confirmed byte-stable and directly accessible, and exhibits every one of the eleven desired structural " +
    "elements as directly observed fact rather than assumption. Two genuinely comparable alternatives were investigated " +
    "(ICO Capita and 23andMe penalty notices) and are retained as qualified/deferred alternates; two additional strong " +
    "candidates (Ofwat, Ofcom) were investigated and found to have equally strong apparent genre fit but were blocked by " +
    "Cloudflare bot-mitigation at the acquisition layer and could not be verified in this phase.",
  nextBestCandidateIfRejected: "DRA-CAND-019-02 (ICO Capita Penalty Notice) — QUALIFIED_ALTERNATE.",
});

// ---------------------------------------------------------------------------
// Part 6 — Phase 2 plan (defined, NOT executed) and Phase 1 boundary
// ---------------------------------------------------------------------------

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "deterministic_live_fetch_a_b_for_primary_candidate",
  "digest_comparison_across_the_two_fetches",
  "official_source_final_determination",
  "licence_final_determination_and_human_attestation",
  "domain_and_document_type_classification_sign_off",
  "performance_measurement_before_freeze_commitment",
  "normalisation_and_text_extraction",
  "freeze_record_creation",
  "corpus_admission_as_dra_doc_0023",
  "evaluator_0_1_2_run_unmodified",
  "proof_receipt_generation",
  "manifest_verification",
  "preparation_for_dra_bmk_023",
]);

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0023",
  "run_final_admission_evaluator",
  "create_dra_bmk_023",
  "create_dra_frz_000017",
  "modify_evaluator_0_1_2",
  "modify_stage_1",
  "modify_stage_2",
  "modify_stage_3",
  "modify_stage_4",
  "modify_stage_5",
  "modify_stage_6",
  "modify_stage_7",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "change_evaluator_version",
  "change_pipeline_version",
  "modify_dra_doc_0001_through_0022_or_their_freeze_records",
  "weaken_acquisition_or_governance_requirements",
  "repair_stale_0_1_1_assertion_debt",
  "address_dra_bmk_022_performance_defect",
] as const);

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0023";
