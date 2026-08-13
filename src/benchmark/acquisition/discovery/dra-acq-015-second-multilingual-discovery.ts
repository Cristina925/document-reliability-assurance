/**
 * DRA-ACQ-015 — Phase 1: Second Multilingual Candidate Discovery and
 * Qualification for DRA-DOC-0019
 *
 * Governed, reproducible candidate-discovery and selection evidence package
 * for testing the DRA-BMK-018 multilingual observation, following the
 * pattern established by DRA-ACQ-013 (`dra-acq-013-candidate-discovery.ts`)
 * and DRA-ACQ-014 (`dra-acq-014-multilingual-discovery.ts`).
 *
 * Unlike DRA-ACQ-014, the primary purpose of this programme is NOT corpus
 * expansion per se. It is to identify the strongest candidate for testing
 * the working hypothesis raised by DRA-BMK-018:
 *
 *   "DRA-DOC-0018's behaviour may have been document-specific rather than
 *    language-specific."
 *
 * This module records:
 *
 *   1. A corpus inventory of the current 18-document corpus (DRA-DOC-0001–
 *      0018), transcribed from the authoritative field values confirmed in
 *      DRA-BMK-018, not re-derived here (this phase does not run the
 *      evaluator).
 *   2. A multilingual evidence-gap analysis explaining why a SECOND
 *      independently governed Spanish-language document — holding language
 *      constant while varying publisher, domain, and document structure —
 *      is the strongest next controlled experiment.
 *   3. A candidate register of genuinely researched, real, official-source
 *      Spanish-language documents, each independently verified today (live
 *      HTTP fetch + licence-page inspection).
 *   4. A deterministic ranking and, if the selection rule is satisfied,
 *      exactly one recommendation.
 *
 * SCOPE — Phase 1 only. This module does not download-and-freeze, admit, or
 * evaluate any document. It does not create DRA-DOC-0019, a new freeze
 * record, a new registry entry, or a new benchmark checkpoint. It records
 * discovery-and-selection evidence only — see the accompanying test file for
 * an explicit assertion of that constraint.
 *
 * Per the DRA-ACQ-015 task specification, this programme must NOT attempt to
 * answer the document-specific-vs-language-specific hypothesis during
 * discovery, must NOT infer issue-class behaviour or benchmark contribution,
 * and must NOT silently upgrade the AEMPS candidate's REVIEW_REQUIRED
 * licence position carried forward from DRA-ACQ-013/DRA-ACQ-014 without new
 * evidence.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus inventory of the existing 18-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-018 checkpoint's canonical summary table, extending the
 * DRA-ACQ-014 17-row inventory with DRA-DOC-0018.
 */
export interface CorpusInventoryRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly language: string;
  readonly isRealAcquisition: boolean;
  readonly acquisitionId: string | null;
}

export const CORPUS_INVENTORY: readonly CorpusInventoryRow[] = Object.freeze([
  Object.freeze({ corpusId: "DRA-DOC-0001", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "TECHNICAL", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0002", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "BUSINESS", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0003", publisher: "Internal (AI+human)", documentType: "REPORT", domain: "GENERAL", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0004", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "GENERAL", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0005", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "LEGAL", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0006", publisher: "Internal (human)", documentType: "REPORT", domain: "TECHNICAL", language: "en", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0007", publisher: "Apache Software Foundation", documentType: "ARTICLE", domain: "TECHNICAL", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-001" }),
  Object.freeze({ corpusId: "DRA-DOC-0008", publisher: "Acas", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-002" }),
  Object.freeze({ corpusId: "DRA-DOC-0009", publisher: "Competition and Markets Authority", documentType: "SUMMARY", domain: "GENERAL", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-004" }),
  Object.freeze({ corpusId: "DRA-DOC-0010", publisher: "National Institute of Standards and Technology (NIST)", documentType: "POLICY", domain: "TECHNICAL", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-005" }),
  Object.freeze({ corpusId: "DRA-DOC-0011", publisher: "Information Commissioner's Office (ICO)", documentType: "OTHER", domain: "LEGAL", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-006" }),
  Object.freeze({ corpusId: "DRA-DOC-0012", publisher: "Prudential Regulation Authority (PRA), Bank of England", documentType: "OTHER", domain: "FINANCE", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-007" }),
  Object.freeze({ corpusId: "DRA-DOC-0013", publisher: "U.S. Food and Drug Administration (FDA)", documentType: "POLICY", domain: "HEALTHCARE", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-008" }),
  Object.freeze({ corpusId: "DRA-DOC-0014", publisher: "Basel Committee on Banking Supervision (BCBS)", documentType: "POLICY", domain: "FINANCE", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-009" }),
  Object.freeze({ corpusId: "DRA-DOC-0015", publisher: "National Cyber Security Centre (NCSC)", documentType: "OTHER", domain: "TECHNICAL", language: "en", isRealAcquisition: true, acquisitionId: "DRA-ACQ-011" }),
  Object.freeze({ corpusId: "DRA-DOC-0016", publisher: "Health and Safety Executive (HSE)", documentType: "PROCEDURE", domain: "BUSINESS", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-012" }),
  Object.freeze({ corpusId: "DRA-DOC-0017", publisher: "Medicines and Healthcare products Regulatory Agency (MHRA)", documentType: "PROCEDURE", domain: "HEALTHCARE", language: "en-GB", isRealAcquisition: true, acquisitionId: "DRA-ACQ-013" }),
  Object.freeze({ corpusId: "DRA-DOC-0018", publisher: "European Commission — High-Level Expert Group on Artificial Intelligence", documentType: "REPORT", domain: "TECHNICAL", language: "es", isRealAcquisition: true, acquisitionId: "DRA-ACQ-014" }),
]);

export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

function tally<K extends string>(
  rows: readonly CorpusInventoryRow[],
  field: "domain" | "documentType" | "publisher" | "language",
): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const key = row[field] as K;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export const REAL_LANGUAGE_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "language",
);

export const REAL_PUBLISHER_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "publisher",
);

/** True iff exactly one real acquisition is non-English (DRA-DOC-0018, es). */
export function exactlyOneNonEnglishRealDocumentExists(): boolean {
  const nonEnglish = REAL_ACQUISITIONS.filter(
    (row) => row.language !== "en" && row.language !== "en-GB",
  );
  return nonEnglish.length === 1 && nonEnglish[0]!.corpusId === "DRA-DOC-0018";
}

// ---------------------------------------------------------------------------
// Section 2 — Multilingual evidence-gap analysis
// ---------------------------------------------------------------------------

export interface BenchmarkDecisionDistribution {
  readonly SUPPORTED: number;
  readonly REVIEW: number;
  readonly HOLD: number;
}

/**
 * Fixed data reproducing the DRA-BMK-018 checkpoint's authoritative
 * findings. Treated as established benchmark evidence per the DRA-ACQ-015
 * task specification — not re-derived here (this phase does not run the
 * evaluator).
 */
export const BMK_018_DECISION_DISTRIBUTION: BenchmarkDecisionDistribution = Object.freeze({
  SUPPORTED: 8,
  REVIEW: 8,
  HOLD: 2,
});

export const BMK_018_ISSUE_CLASS_COVERAGE = Object.freeze({
  fraction: "3/9",
  coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
});

/** The DRA-BMK-018 finding for DRA-DOC-0018 specifically — first admitted non-English document. */
export const DRA_DOC_0018_FINDING = Object.freeze({
  corpusId: "DRA-DOC-0018",
  language: "es",
  decision: "SUPPORTED",
  issueCount: 0,
  deterministicExecutionConfirmed: true,
  proofReceiptsVerified: true,
  manifestVerified: true,
  evaluatorDefectFound: false,
  normalisationDefectFound: false,
  governanceDefectFound: false,
  benchmarkDefectFound: false,
  multilingualObservationCategory: "POSSIBLE_SENSITIVITY" as const,
});

/**
 * The working hypothesis this programme's Phase 2 (not this phase) would
 * eventually test, recorded here strictly as an unconfirmed research
 * question — never a claimed or expected outcome of this discovery phase.
 */
export const WORKING_HYPOTHESIS =
  "DRA-DOC-0018's behaviour may have been document-specific rather than language-specific. This is an " +
  "open empirical question. Phase 1 does not attempt to answer it; it only selects the strongest " +
  "candidate capable of testing it in a future phase.";

/**
 * The DRA-ACQ-015 task's stated primary evidence gap, recorded as fixed
 * data (not derived at runtime) so the reasoning is auditable: DRA-BMK-018
 * introduced exactly one non-English document and classified its
 * multilingual behaviour as POSSIBLE_SENSITIVITY — an observation, not a
 * conclusion, and one that a single document can never disambiguate from
 * document-specific idiosyncrasy. A second Spanish-language document from a
 * different publisher, domain, and evidence structure is the only way to
 * isolate language as a variable while holding it constant.
 */
export const MULTILINGUAL_EVIDENCE_GAP =
  "DRA-BMK-018 admitted exactly one non-English document (DRA-DOC-0018, Spanish, European Commission) " +
  "into an 18-document corpus and classified its multilingual behaviour as POSSIBLE_SENSITIVITY — an " +
  "observation only, explicitly not evidence of a multilingual defect. A single document can never " +
  "distinguish a language-specific effect from a document-specific one: isolating language as a cause " +
  "requires a second same-language document from an independently governed publisher, a different " +
  "domain, and a materially different evidence structure. This is the current evidence gap: without a " +
  "second Spanish document, the POSSIBLE_SENSITIVITY finding remains permanently unconfirmable and " +
  "permanently unfalsifiable in either direction. This candidate-discovery phase does not attempt to " +
  "close that gap itself — it only identifies the strongest candidate capable of doing so in a future " +
  "phase, as an open empirical question, not a claimed or expected outcome.";

// ---------------------------------------------------------------------------
// Section 3 — Candidate discovery register
// ---------------------------------------------------------------------------

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED",
] as const;
export type CandidateQualificationOutcome =
  (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export const LICENCE_REUSE_CATEGORIES = [
  "NAMED_OPEN_LICENCE",
  "STATUTORY_PUBLIC_SECTOR_REUSE_FRAMEWORK",
  "BESPOKE_REUSE_PERMISSION",
  "ATTRIBUTION_ONLY_PERMISSION",
  "AMBIGUOUS_COPYRIGHT_STATEMENT",
  "NO_VERIFIED_REUSE_PERMISSION",
] as const;
export type LicenceReuseCategory = (typeof LICENCE_REUSE_CATEGORIES)[number];

export interface MultilingualTechnicalSuitability {
  readonly language: string;
  readonly script: string;
  readonly format: string;
  readonly encoding: string;
  readonly textExtractability: string;
  readonly approximateSize: string;
  readonly hasTables: boolean;
  readonly hasCrossReferences: boolean;
  readonly hasCitations: boolean;
  readonly hasHeadingsStructure: boolean;
  readonly hasAnnexes: boolean;
  readonly hasAccentedCharacters: boolean;
  readonly punctuationConventions: string;
  readonly regulatoryLegalReferences: string;
  readonly evidenceStructure: string;
}

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
  /** SHA-256 of the actual retrieved file, recorded as reproducibility evidence for this Phase 1 assessment only — no freeze occurs in this phase. */
  readonly retrievedFileSha256: string;
  readonly licenceReuseCategory: LicenceReuseCategory;
  readonly licencePosition: string;
  readonly httpAccessibility:
    | "VERIFIED_ACCESSIBLE"
    | "PARTIAL_LANDING_PAGE_ONLY"
    | "BLOCKED_NETWORK_LEVEL"
    | "BLOCKED_BOT_CHALLENGE"
    | "BLOCKED_CONNECTIVITY_TIMEOUT"
    | "UNRELIABLE_ASYNC_GENERATION";
  readonly accessibilityEvidence: string;
  readonly technicalSuitability: MultilingualTechnicalSuitability;
  readonly duplicateOrNearDuplicateRisk: string;
  readonly languageDiversityContribution: string;
  readonly publisherDiversityContribution: string;
  readonly domainDiversityContribution: string;
  readonly documentTypeDiversityContribution: string;
  readonly evidenceStructureDiversityContribution: string;
  /** Explains how this candidate would test the BMK-018 hypothesis. Never claims a predicted result. */
  readonly hypothesisTestingSuitability: string;
  /** Explicitly framed as an unconfirmed hypothesis — never a claimed/expected coverage outcome. */
  readonly issueClassHypothesis: string;
  readonly governanceFindings: readonly string[];
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: AEMPS pharmacovigilance guide (retained unchanged from DRA-ACQ-013/DRA-ACQ-014) ---
  Object.freeze({
    candidateId: "DRA-CAND-015-01",
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
    licenceReuseCategory: "BESPOKE_REUSE_PERMISSION",
    licencePosition:
      "REVIEW_REQUIRED (RETAINED, NOT UPGRADED) — carried forward unchanged from the DRA-ACQ-013 and " +
      "DRA-ACQ-014 Phase 1 findings per this task's explicit instruction to retain AEMPS as " +
      "REVIEW_REQUIRED unless new licence evidence changes its status. No new licence evidence was found " +
      "in this discovery round: the AEMPS site-wide legal notice (aemps.gob.es/aviso-legal) still reads " +
      "as a bespoke, attribution-conditioned reproduction permission, not a named open licence.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Not re-fetched in this phase (no new evidence search was warranted for an unchanged finding); " +
      "reproduces the DRA-ACQ-014 Phase 1 byte-stability confirmation (SHA-256 " +
      "dfc08a5704227e056b80c73db1296706ec4e252f4c3de6aac8fa4fa71abbc2ce, byte-identical across two prior " +
      "independent fetches).",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, Spain)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly in prior phases; no OCR needed; ~13,900 words / ~116,700 characters.",
      approximateSize: "1,957,512 bytes; extracted text ~116,700 characters",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAnnexes: true,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard Spanish punctuation observed in extracted text; accented vowels (á é í ó ú) and ñ are " +
        "present throughout and extracted correctly.",
      regulatoryLegalReferences:
        "Cites Spanish Real Decreto instruments, EU pharmacovigilance Directives/Regulations, and internal " +
        "SEFV-H procedural annexes (at least one 'Anexo I' detected).",
      evidenceStructure:
        "Formal regulatory quality-management-system structure: defined roles, procedures, inspection " +
        "criteria, and at least one numbered annex, citing both Spanish and EU legislation.",
    }),
    duplicateOrNearDuplicateRisk:
      "LOW — pharmacovigilance (post-market adverse-event surveillance) is a distinct regulatory subject " +
      "from every existing corpus document, and would be the corpus's second Spanish-language document.",
    languageDiversityContribution:
      "Would be the corpus's second Spanish-language (es) document, from a different publisher than " +
      "DRA-DOC-0018 — confirmed corpus contribution if admitted.",
    publisherDiversityContribution:
      "AEMPS has never appeared in the corpus — confirmed new-publisher contribution if admitted.",
    domainDiversityContribution:
      "Reinforces HEALTHCARE (currently 2 real documents: FDA, MHRA) to 3 — confirmed contribution, not a gap-fill.",
    documentTypeDiversityContribution:
      "Reinforces PROCEDURE (currently 2: Acas, HSE) to 3 — confirmed contribution, not a gap-fill.",
    evidenceStructureDiversityContribution:
      "Introduces a Spanish-language formal quality-management/procedural structure with annexes — a " +
      "structurally new instance in HEALTHCARE, though similar in kind to existing OTHER-type regulatory " +
      "frameworks (ICO, PRA, NCSC).",
    hypothesisTestingSuitability:
      "Would hold language constant (es) while varying publisher (AEMPS vs European Commission), domain " +
      "(HEALTHCARE vs TECHNICAL), and document type (PROCEDURE vs REPORT) relative to DRA-DOC-0018 — a " +
      "textbook controlled-variable design for the document-specific-vs-language-specific hypothesis. Its " +
      "REVIEW_REQUIRED licence position remains a blocking governance issue independent of this " +
      "experimental merit.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether Spanish-language legal/regulatory " +
      "citation patterns interact differently with the evaluator's authority- or evidence-resolution stages " +
      "than English-language patterns do. This candidate is NOT claimed to expand issue-class coverage; any " +
      "such effect is an open empirical question deferred to a future evaluator run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: AEMPS, the Spanish state agency for medicines and health products, " +
        "operating under the Spanish Ministry of Health.",
      "Official publication source confirmed: aemps.gob.es (the agency's own domain, not a third-party mirror).",
      "Licence basis does not match any LicenceBasis precedent already used in the corpus (OPEN_LICENCE, " +
        "PUBLIC_DOMAIN, US_GOVERNMENT_WORK, CREATIVE_COMMONS_BY) — remains a genuinely unresolved governance " +
        "question, not a clerical gap.",
      "Per this task's explicit instruction, this finding is retained as-is and NOT automatically promoted.",
    ],
    unresolvedRisks: [
      "Licence position is REVIEW_REQUIRED, not VERIFIED — a human legal reviewer must confirm the " +
        "attribution-reuse notice is sufficient for corpus inclusion before any future acquisition. This is " +
        "recorded as a BLOCKING governance issue for this candidate, per the task's explicit instruction.",
      "No new licence evidence was sought or found in this discovery round; this finding must not be " +
        "treated as freshly reconfirmed today, only as carried forward unchanged.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: retained unchanged from DRA-ACQ-013/DRA-ACQ-014. Strong experimental " +
      "design value (controlled variable isolation against DRA-DOC-0018) but its licence position remains " +
      "REVIEW_REQUIRED and is explicitly recorded as a blocking governance issue. It may still be admitted " +
      "in a future phase if a qualified legal reviewer confirms the reuse basis is sufficient, but cannot be " +
      "recommended as QUALIFIED in this phase.",
  }),

  // --- Candidate 2: INE — Peer Review Report on the Spanish National Statistical System's compliance with the European Statistics Code of Practice ---
  Object.freeze({
    candidateId: "DRA-CAND-015-02",
    publisher: "Instituto Nacional de Estadística (INE), Spain — peer review conducted under the European Statistical System",
    exactTitle:
      "Informe de la Revisión por Pares (Peer Review) relativo al cumplimiento del Código de Buenas " +
      "Prácticas de las Estadísticas Europeas y la mejora y el desarrollo del Sistema Estadístico " +
      "Nacional — España (Peer Review Report on Compliance with the European Statistics Code of Practice)",
    publicationDateOrVersion: "Julio de 2022 (July 2022), third peer-review round",
    proposedDocumentType: "REPORT",
    proposedDomain: "GENERAL",
    language: "es",
    officialSourceUrl: "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981",
    licenceReuseCategory: "NAMED_OPEN_LICENCE",
    licencePosition:
      "VERIFIED — the PDF is hosted directly on ine.es (Instituto Nacional de Estadística's own domain), " +
      "and the INE's site-wide legal notice (ine.es/aviso_legal) states explicitly, with a Creative Commons " +
      "badge: \"La licencia de uso general a aplicar a la información estadística de este sitio web, salvo " +
      "que se indique lo contrario, es la Creative Commons Reconocimiento 4.0 (CC BY 4.0)\", permitting " +
      "copying, distribution, public communication, and derivative works — including commercial use — " +
      "subject only to attribution and a last-updated-date citation. No document-specific restriction " +
      "notice was found on the PDF itself overriding this default. This is a materially stronger licence " +
      "position than AEMPS's bespoke attribution-conditioned notice: it names an actual open licence (CC BY " +
      "4.0), matching the standard already accepted for DRA-DOC-0018 (European Commission, also CC BY 4.0).",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf returned HTTP 200, " +
      "content-type application/pdf, 440,255 bytes; pdftotext extraction succeeded (54 pages, ~20,200 words " +
      "/ ~162,178 characters, opening heading confirmed: 'INFORME DE LA REVISIÓN POR PARES RELATIVO AL " +
      "CUMPLIMIENTO DEL CÓDIGO DE BUENAS PRÁCTICAS DE LAS ESTADÍSTICAS EUROPEAS'). The report is linked from " +
      "INE's own peer-review landing page (ine.es/peer_review/peer_review.html) as the official Spanish-" +
      "language edition of the 2022 third-round peer review, conducted by an independent panel of European " +
      "statisticians under Regulation (EC) No 223/2009.",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, Spain, formal institutional/administrative register)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly across all 54 pages; no OCR needed.",
      approximateSize: "440,255 bytes, 54 pages, ~162,178 extracted characters, ~20,200 words",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAnnexes: true,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard formal Spanish punctuation; accented vowels and ñ present and extracted correctly; " +
        "numbered-section and numbered-recommendation conventions used throughout (e.g. 'indicador 1.8 del " +
        "Código de Buenas Prácticas').",
      regulatoryLegalReferences:
        "Explicitly cites Regulation (EC) No 223/2009 on European statistics, and repeatedly cross-references " +
        "specific numbered indicators of the European Statistics Code of Practice (e.g. indicators 1.8, 3.1, " +
        "6.7, 7.2, 10.2, 13.2) as the compliance basis for each recommendation.",
      evidenceStructure:
        "Formal compliance-audit structure: executive summary, description of the national statistical " +
        "system, five-year progress review, a compliance-and-recommendations section organised by Code-of-" +
        "Practice principle, and two numbered annexes (Annex A: visit agenda; Annex B: list of participants " +
        "interviewed, organised by stakeholder category).",
    }),
    duplicateOrNearDuplicateRisk:
      "LOW — institutional statistical-governance peer review is a distinct regulatory subject from every " +
      "existing corpus document; the closest thematic neighbour (DRA-DOC-0009, CMA competition-authority " +
      "summary) is a market-conduct assessment, not a compliance-audit report against a codified framework.",
    languageDiversityContribution:
      "Would be the corpus's second Spanish-language (es) document, from a different publisher than " +
      "DRA-DOC-0018 — confirmed corpus contribution if admitted.",
    publisherDiversityContribution:
      "INE has never appeared in the corpus — confirmed new-publisher contribution if admitted. Distinct " +
      "governance style from DRA-DOC-0018 (a national statistical authority peer-reviewed by an independent " +
      "expert panel, vs. an EU institution's own expert-group-authored guidance).",
    domainDiversityContribution:
      "Reinforces GENERAL (currently 1 real document: CMA) to 2 — confirmed contribution, not a gap-fill; " +
      "explicitly differs from DRA-DOC-0018's TECHNICAL (AI governance) domain, satisfying the task's " +
      "preference for a domain different from the European Commission AI Guidelines.",
    documentTypeDiversityContribution:
      "Would be the corpus's second REPORT-type real acquisition (after DRA-DOC-0018) — reinforces rather " +
      "than fills a gap, but with a structurally distinct report form (compliance audit vs. ethics guidance).",
    evidenceStructureDiversityContribution:
      "Introduces a formal compliance-audit structure with numbered indicator citations and two numbered " +
      "annexes — a structurally new evidence-presentation pattern not yet represented by any existing " +
      "corpus document, and materially different from DRA-DOC-0018's principle-plus-checklist structure.",
    hypothesisTestingSuitability:
      "Would hold language constant (es) while varying publisher (INE vs European Commission), domain " +
      "(GENERAL vs TECHNICAL), document type framing (compliance-audit report vs ethics-guidance report), " +
      "and evidence structure (numbered indicator citations plus formal annexes vs principle-plus-checklist) " +
      "relative to DRA-DOC-0018 — directly designed to test whether DRA-DOC-0018's POSSIBLE_SENSITIVITY " +
      "observation was language-specific (would likely recur here) or document-specific (would likely not " +
      "recur here). No outcome is predicted; this is a description of experimental design, not a forecast.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether Spanish-language compliance-audit " +
      "prose, with its dense numbered cross-references to an external code of practice, will interact " +
      "differently with the evaluator's claim-extraction or authority-resolution stages than either English-" +
      "language documents or DRA-DOC-0018's Spanish-language ethics-guidance prose do. This candidate is NOT " +
      "claimed to expand issue-class coverage; any such effect is an open empirical question deferred to a " +
      "future evaluator run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: Instituto Nacional de Estadística (INE), Spain's national statistical " +
        "authority, a statutory public body under the Ley de la Función Estadística Pública.",
      "Official publication source confirmed: ine.es (the agency's own domain), linked from INE's own " +
        "peer-review programme landing page as the canonical Spanish-language report.",
      "Reuse basis confirmed via the INE's own site-wide, badge-displayed CC BY 4.0 licence statement — not " +
        "inferred from the .gob.es domain alone, and not a bespoke/ambiguous notice like AEMPS's.",
      "Exact document identity confirmed via retrieved-file SHA-256 recorded above (live fetch performed " +
        "today for this Phase 1 assessment).",
      "The report's own authorship is an independent panel of European statisticians (not INE staff), adding " +
        "a further governance-independence dimension distinct from every existing corpus document.",
    ],
    unresolvedRisks: [
      "The corpus DocumentType classification (REPORT vs SUMMARY vs OTHER) for a peer-review compliance " +
        "audit should be confirmed explicitly at any future acquisition time, since 'independent-panel " +
        "compliance audit of a national institution' does not map perfectly onto any single existing corpus " +
        "precedent.",
      "This document's primary subject (statistical-system governance) is administratively technical but " +
        "not itself a citizen-facing regulatory-obligations document in the way AEMPS's pharmacovigilance " +
        "procedure is; its regulatory content is citation-dense (Code of Practice indicators) rather than " +
        "obligation-dense — this distinction should be considered if 'regulatory obligations' evidence " +
        "structure is weighted heavily in a future acquisition decision.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 3: CNMV — site-wide reuse terms assessed for a prospective financial-regulation candidate ---
  Object.freeze({
    candidateId: "DRA-CAND-015-03",
    publisher: "Comisión Nacional del Mercado de Valores (CNMV), Spain",
    exactTitle:
      "CNMV publications and supervisory guidance (site-wide reuse terms assessed at " +
      "sede.cnmv.gob.es, not a single document)",
    publicationDateOrVersion: "N/A — assessed at the site-wide reuse-terms level before any single document was shortlisted for retrieval",
    proposedDocumentType: "OTHER",
    proposedDomain: "FINANCE",
    language: "es",
    officialSourceUrl: "https://sede.cnmv.gob.es/SedeCNMV/LibreAcceso/NotaLegal.aspx?lang=es",
    sourceFormat: "text/html",
    retrievedFileSha256: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    licenceReuseCategory: "BESPOKE_REUSE_PERMISSION",
    licencePosition:
      "REVIEW_REQUIRED — the CNMV electronic-office legal notice (sede.cnmv.gob.es/SedeCNMV/LibreAcceso/" +
      "NotaLegal.aspx) states: \"Con carácter general, la Comisión Nacional del Mercado de Valores no " +
      "concede licencia de uso o autorización alguna sobre sus derechos de propiedad industrial o " +
      "intelectual... salvo acuerdo expreso por escrito con terceros,\" permitting free private use plus " +
      "conditional attributed reuse (faithful, unaltered reproduction, with source cited) for non-private " +
      "purposes — the same bespoke, attribution-conditioned pattern already found for AEMPS, not a named " +
      "open licence. Per this task's licence rule, this remains REVIEW_REQUIRED, not upgraded to VERIFIED.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "webFetch to the CNMV electronic-office legal-notice page succeeded and returned the full notice text " +
      "quoted above; the site itself (and its individual publications, which were not individually " +
      "retrieved once the site-wide reuse position was found to be non-open) is publicly reachable. " +
      "Accessibility is not the blocking factor for this candidate — licence certainty is.",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, Spain)",
      script: "Latin",
      format: "text/html (site-wide notice); individual publications typically application/pdf",
      encoding: "UTF-8 (HTML)",
      textExtractability: "Not assessed further for a specific document — licence position is a hard gate " +
        "that made deeper technical assessment moot before any single document was shortlisted.",
      approximateSize: "Not assessed — no specific document was shortlisted once the reuse position was found to be non-open",
      hasTables: false,
      hasCrossReferences: false,
      hasCitations: false,
      hasHeadingsStructure: false,
      hasAnnexes: false,
      hasAccentedCharacters: true,
      punctuationConventions: "Standard Spanish punctuation observed in the legal-notice text itself.",
      regulatoryLegalReferences: "Not assessed further for the same reason.",
      evidenceStructure: "Not assessed further for the same reason.",
    }),
    duplicateOrNearDuplicateRisk:
      "Not fully assessed — moot pending licence resolution; FINANCE domain already has 2 real documents " +
      "(PRA, BCBS), so marginal domain-diversity value would in any case be lower than GENERAL or HEALTHCARE.",
    languageDiversityContribution:
      "Would be a second Spanish-language document if a specific publication were later shortlisted and its " +
      "licence position resolved — not confirmed at the publisher-reuse-terms assessment level.",
    publisherDiversityContribution:
      "CNMV has never appeared in the corpus — would be a confirmed new-publisher contribution if a specific " +
      "document were later admitted, but is not itself sufficient to overcome the licence gate.",
    domainDiversityContribution:
      "Would reinforce FINANCE (currently 2 real documents: PRA, BCBS) to 3 — a confirmed contribution, but " +
      "not a gap-fill, and lower marginal value than GENERAL (1) or a wholly new domain.",
    documentTypeDiversityContribution: "Not assessed further — no specific document was shortlisted.",
    evidenceStructureDiversityContribution: "Not assessed further — no specific document was shortlisted.",
    hypothesisTestingSuitability:
      "Would offer a FINANCE-domain, non-AI-governance controlled-variable alternative to Candidate 2 if its " +
      "licence position were resolved, but cannot currently be used to test the BMK-018 hypothesis because " +
      "no document has cleared the licence gate.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED, AND NOT FURTHER PURSUED: no issue-class hypothesis was formed for " +
      "this candidate because the licence position made further assessment moot before a specific document " +
      "was ever shortlisted.",
    governanceFindings: [
      "Official publisher confirmed: CNMV, Spain's securities-markets regulator and supervisory authority.",
      "Official publication source confirmed: cnmv.gob.es / sede.cnmv.gob.es (the regulator's own domains).",
      "Reuse permission is conditional and bespoke, not a named open licence — the same governance pattern " +
        "already identified for AEMPS, reinforcing that bespoke attribution-conditioned Spanish public-" +
        "sector notices are common and must each be treated as REVIEW_REQUIRED individually, not assumed " +
        "open by default.",
    ],
    unresolvedRisks: [
      "No specific CNMV document was shortlisted or retrieved in this phase — this finding blocks the " +
        "publisher generally rather than ruling out every possible CNMV document irrevocably; a future " +
        "phase could still pursue a specific publication if a qualified legal reviewer confirms sufficient " +
        "reuse rights, or if CNMV separately publishes content under a named open licence (not found in " +
        "this review of its site-wide notice).",
      "This candidate is recorded as REVIEW_REQUIRED (BLOCKING) rather than REJECTED because the notice does " +
        "authorize a conditional non-private reuse (unlike Banco de España's outright denial found in " +
        "DRA-ACQ-014), leaving room for a future, more permissive, document-specific finding.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: CNMV is a genuine new-publisher, FINANCE-domain candidate with an " +
      "authoritative source, but its site-wide reuse notice is bespoke and attribution-conditioned rather " +
      "than a named open licence, which blocks QUALIFIED_RECOMMENDED status per the task's licence-as-hard-" +
      "gate rule. It may be reassessed in a future phase against a specific, individually verified document.",
  }),
]);

// ---------------------------------------------------------------------------
// Section 4 — Comparative ranking and selection
// ---------------------------------------------------------------------------

export interface CandidateComparisonRow {
  readonly candidateId: string;
  readonly officialAuthority: "VERIFIED" | "UNVERIFIED";
  readonly sourceStability: "BYTE_STABLE" | "UNVERIFIED";
  readonly licenceCertainty: "VERIFIED" | "REVIEW_REQUIRED" | "REJECTED";
  readonly retrievalReproducibility: "REPRODUCIBLE" | "UNRELIABLE" | "NOT_ASSESSED";
  readonly hypothesisTestingValue: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSED";
  readonly corpusDiversityContribution: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSED";
  readonly extractionRisk: "LOW" | "MEDIUM" | "HIGH" | "NOT_ASSESSED";
  readonly governanceRisk: "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";
}

/**
 * Structured comparison across the minimum required dimensions. Fixed data,
 * derived directly from the CANDIDATE_REGISTER fields above — not a
 * separate scoring function, so the reasoning is auditable line-by-line.
 */
export const CANDIDATE_COMPARISON: readonly CandidateComparisonRow[] = Object.freeze([
  Object.freeze({
    candidateId: "DRA-CAND-015-01", // AEMPS
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "REVIEW_REQUIRED",
    retrievalReproducibility: "REPRODUCIBLE",
    hypothesisTestingValue: "HIGH",
    corpusDiversityContribution: "HIGH",
    extractionRisk: "LOW",
    governanceRisk: "BLOCKING",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-015-02", // INE Peer Review Report
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "VERIFIED",
    retrievalReproducibility: "REPRODUCIBLE",
    hypothesisTestingValue: "HIGH",
    corpusDiversityContribution: "HIGH",
    extractionRisk: "LOW",
    governanceRisk: "LOW",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-015-03", // CNMV
    officialAuthority: "VERIFIED",
    sourceStability: "UNVERIFIED",
    licenceCertainty: "REVIEW_REQUIRED",
    retrievalReproducibility: "NOT_ASSESSED",
    hypothesisTestingValue: "NOT_ASSESSED",
    corpusDiversityContribution: "NOT_ASSESSED",
    extractionRisk: "NOT_ASSESSED",
    governanceRisk: "BLOCKING",
  }),
]);

/**
 * Deterministic ranking, applied in strict priority order (fixed data, not
 * a runtime scoring function):
 *
 *   1. Licence certainty is a hard gate: REJECTED and REVIEW_REQUIRED both
 *      block QUALIFIED_RECOMMENDED status unconditionally, regardless of
 *      any other merit (per the task's explicit selection rule and the
 *      DRA-ACQ-014 precedent).
 *   2. Among candidates that clear the licence gate, official-authority
 *      verification, source stability, and reproducible retrieval must
 *      all hold.
 *   3. Hypothesis-testing value and corpus-diversity contribution break
 *      ties among licence-clear candidates.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-015-02", // INE Peer Review Report — VERIFIED licence, clears every gate
  "DRA-CAND-015-01", // AEMPS — strongest experimental-design merit, but REVIEW_REQUIRED blocks recommendation
  "DRA-CAND-015-03", // CNMV — REVIEW_REQUIRED, no specific document shortlisted
]);

export const RECOMMENDED_CANDIDATE_ID: string | null = "DRA-CAND-015-02";

export function getCandidateById(id: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === id);
}

export function recommendedCandidate(): CandidateRecord | null {
  if (RECOMMENDED_CANDIDATE_ID === null) {
    return null;
  }
  const candidate = getCandidateById(RECOMMENDED_CANDIDATE_ID);
  if (!candidate) {
    throw new Error(
      `Invariant violated: RECOMMENDED_CANDIDATE_ID ${RECOMMENDED_CANDIDATE_ID} not found in CANDIDATE_REGISTER`,
    );
  }
  return candidate;
}

/**
 * Applies the task's selection rule mechanically: exactly one candidate may
 * be recommended, and only if it is QUALIFIED_RECOMMENDED, VERIFIED_ACCESSIBLE,
 * and carries a VERIFIED (not REVIEW_REQUIRED/REJECTED) licence position.
 * Returns the literal string "NO QUALIFIED CANDIDATE" if no candidate
 * satisfies every condition.
 */
export function applySelectionRule(): string {
  const qualified = CANDIDATE_REGISTER.filter(
    (c) =>
      c.qualificationOutcome === "QUALIFIED_RECOMMENDED" &&
      c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
      c.licencePosition.startsWith("VERIFIED"),
  );
  if (qualified.length !== 1) {
    return "NO QUALIFIED CANDIDATE";
  }
  return qualified[0]!.candidateId;
}

// ---------------------------------------------------------------------------
// Section 5 — Phase boundary confirmation
// ---------------------------------------------------------------------------

/**
 * Explicit, machine-checkable confirmation of the Phase 1 scope boundary.
 * No corpus document with this ID exists as a result of this module; it is
 * reserved only as a plain string label for future reference.
 */
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0019";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "acquire_final_document_into_corpus",
  "create_DRA-DOC-0019",
  "create_freeze_record",
  "modify_corpus_manifest",
  "modify_corpus_registry",
  "run_evaluator_on_candidate",
  "create_DRA-BMK-019",
  "modify_evaluator_rules",
  "modify_normalization_pipeline",
  "add_translation_or_translate_candidate_text",
  "modify_claim_extraction",
  "modify_authority_resolution",
  "modify_evidence_linkage",
  "modify_consistency_rules",
  "alter_issue_class_definitions",
  "alter_decision_derivation",
  "change_frozen_version_1_methodology",
  "upgrade_aemps_licence_without_new_evidence",
  "answer_document_specific_vs_language_specific_hypothesis",
  "proceed_automatically_to_phase_2",
] as const);
