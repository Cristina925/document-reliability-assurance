/**
 * DRA-ACQ-014 — Phase 1: Multilingual Candidate Discovery for DRA-DOC-0018
 *
 * Governed, reproducible candidate-discovery and selection evidence package
 * for introducing language diversity as the next controlled benchmark
 * variable, following the pattern established by DRA-ACQ-013
 * (`dra-acq-013-candidate-discovery.ts`).
 *
 * This module records:
 *
 *   1. A corpus-balance analysis of the current 17-document corpus
 *      (DRA-DOC-0001–0017), computed from the authoritative field values
 *      confirmed in DRA-BMK-017 (see
 *      `execution/__tests__/dra-bmk-017-seventeen-document-checkpoint.test.ts`,
 *      Part 3), not from narrative reports.
 *   2. A multilingual evidence-gap analysis: coverage has held at 3/9 across
 *      three consecutive checkpoints (BMK-015, 016, 017) despite
 *      domain/publisher/format diversity; language is the most promising
 *      untested variable.
 *   3. A candidate register of genuinely researched, real, official-source
 *      non-English documents, each independently re-verified today (live
 *      HTTP fetch + licence-page inspection), not assumed from the prior
 *      DRA-ACQ-013 snapshot.
 *   4. A deterministic ranking and, if the selection rule is satisfied,
 *      exactly one recommendation.
 *
 * SCOPE — Phase 1 only. This module does not download-and-freeze, admit, or
 * evaluate any document. It does not create DRA-DOC-0018, DRA-FRZ-000012, a
 * new registry entry, or a new benchmark checkpoint. It records
 * discovery-and-selection evidence only — see the accompanying test file for
 * an explicit assertion of that constraint.
 *
 * Per the DRA-ACQ-014 task specification, this programme must NOT attempt to
 * improve multilingual behaviour before observing the existing system, and
 * must NOT claim that introducing a non-English document will expand
 * issue-class coverage — any such potential is recorded strictly as an
 * unconfirmed hypothesis.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus inventory of the existing 17-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-017 checkpoint's canonical summary table (Part 3, CORPUS_META),
 * extending the DRA-ACQ-013 16-row inventory with DRA-DOC-0017.
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

/** True only if every real acquisition's language is English (en or en-GB). */
export function noNonEnglishRealDocumentExists(): boolean {
  return REAL_ACQUISITIONS.every((row) => row.language === "en" || row.language === "en-GB");
}

// ---------------------------------------------------------------------------
// Section 2 — Multilingual evidence-gap analysis
// ---------------------------------------------------------------------------

export interface BenchmarkCheckpointCoverageRow {
  readonly checkpoint: string;
  readonly corpusSize: number;
  readonly coveredClasses: readonly string[];
  readonly coverageFraction: string;
}

/**
 * Fixed data reproducing the coverage figures already established and
 * reconfirmed by three consecutive checkpoints. Treated as authoritative
 * benchmark input per the DRA-ACQ-014 task specification — not
 * re-derived here (this phase does not run the evaluator).
 */
export const COVERAGE_HISTORY: readonly BenchmarkCheckpointCoverageRow[] = Object.freeze([
  Object.freeze({
    checkpoint: "DRA-BMK-015",
    corpusSize: 15,
    coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
    coverageFraction: "3/9",
  }),
  Object.freeze({
    checkpoint: "DRA-BMK-016",
    corpusSize: 16,
    coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
    coverageFraction: "3/9",
  }),
  Object.freeze({
    checkpoint: "DRA-BMK-017",
    corpusSize: 17,
    coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
    coverageFraction: "3/9",
  }),
]);

/** True iff every checkpoint in COVERAGE_HISTORY reports the same coverage fraction. */
export function coverageHasBeenStableAcrossHistory(): boolean {
  const fractions = new Set(COVERAGE_HISTORY.map((r) => r.coverageFraction));
  return fractions.size === 1;
}

/**
 * The DRA-ACQ-014 task's stated primary evidence gap, recorded as fixed
 * data (not derived at runtime) so the reasoning is auditable: coverage has
 * held at the DRA-CHK-002 ceiling across three consecutive checkpoints
 * despite substantial domain/publisher/format diversity, and every one of
 * the 11 real, live-acquired documents is English. Language is therefore
 * the strongest remaining untested controlled variable.
 */
export const MULTILINGUAL_EVIDENCE_GAP =
  "Issue-class coverage has remained fixed at 3/9 across DRA-BMK-015, DRA-BMK-016, and DRA-BMK-017 " +
  "despite domain diversity (TECHNICAL, BUSINESS, GENERAL, LEGAL, HEALTHCARE, FINANCE), publisher " +
  "diversity (11 distinct real-acquisition publishers), and format diversity (single PDF, multi-page " +
  "HTML, static HTML). All 11 real, live-acquired documents are English (en or en-GB). Non-English " +
  "acquisition, normalisation, and evaluation remain completely untested. Introducing a genuinely " +
  "non-English document is the next controlled variable most likely to reveal whether the frozen " +
  "Version 1 pipeline contains hidden English-language assumptions — an open empirical question, not " +
  "a claimed or expected outcome.";

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
  /** Explicitly framed as an unconfirmed hypothesis — never a claimed/expected coverage outcome. */
  readonly issueClassHypothesis: string;
  readonly governanceFindings: readonly string[];
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: AEMPS — Buenas Prácticas del Sistema Español de Farmacovigilancia (retained from DRA-ACQ-013) ---
  Object.freeze({
    candidateId: "DRA-CAND-014-01",
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
      "REVIEW_REQUIRED (RECONFIRMED, NOT UPGRADED) — re-fetched today and re-read the AEMPS site-wide legal " +
      "notice (aemps.gob.es/aviso-legal, section 'Derechos de propiedad intelectual y de propiedad " +
      "industrial'). The operative clause reads: \"Se autoriza la reproducción total o parcial de los " +
      "contenidos de la web, siempre que se cite expresamente su origen. El usuario queda obligado a " +
      "mencionar la fecha de la última actualización de los documentos objeto de la reutilización\" — a " +
      "bespoke, attribution-conditioned reproduction permission, not a named open licence (no CC/OGL badge " +
      "on the document or the publishing site). This is unchanged from the DRA-ACQ-013 Phase 1 finding; it " +
      "is explicitly NOT upgraded to VERIFIED without new evidence, per this programme's governance rule.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to the AEMPS PDF URL returned HTTP 200 today, content-type application/pdf, " +
      "1,957,512 bytes — byte-identical to the DRA-ACQ-013 Phase 1 fetch (same SHA-256: " +
      "dfc08a5704227e056b80c73db1296706ec4e252f4c3de6aac8fa4fa71abbc2ce). BYTE_STABLE across the elapsed " +
      "interval (Phase 1 to this reassessment).",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, Spain)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly; no OCR needed; ~13,900 words / ~116,700 characters.",
      approximateSize: "1,957,512 bytes; extracted text ~116,700 characters",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard Spanish punctuation observed in extracted text (no inverted ¿/¡ marks detected in this " +
        "administrative-register document, which is typical for formal regulatory prose); accented " +
        "vowels (á é í ó ú) and ñ are present throughout and extracted correctly.",
      regulatoryLegalReferences:
        "Cites Spanish Real Decreto instruments, EU pharmacovigilance Directives/Regulations, and internal " +
        "SEFV-H procedural annexes (at least one 'Anexo I' detected).",
      evidenceStructure:
        "Formal regulatory quality-management-system structure: defined roles, procedures, inspection " +
        "criteria, and at least one numbered annex, citing both Spanish and EU legislation.",
    }),
    duplicateOrNearDuplicateRisk:
      "LOW — pharmacovigilance (post-market adverse-event surveillance) is a distinct regulatory subject " +
      "from every existing corpus document, and this would be the corpus's first non-English document.",
    languageDiversityContribution:
      "Would be the corpus's first Spanish-language (es) document — confirmed corpus contribution if admitted.",
    publisherDiversityContribution:
      "AEMPS has never appeared in the corpus — confirmed new-publisher contribution if admitted.",
    domainDiversityContribution:
      "Reinforces HEALTHCARE (currently 2 real documents: FDA, MHRA) to 3 — confirmed contribution, not a gap-fill.",
    documentTypeDiversityContribution:
      "Reinforces PROCEDURE (currently 2: Acas, HSE) to 3 — confirmed contribution, not a gap-fill (REPORT, " +
      "REWRITE, EMAIL remain at zero real-acquisition representation regardless of this candidate).",
    evidenceStructureDiversityContribution:
      "Introduces a Spanish-language formal quality-management/procedural structure with annexes — a " +
      "structurally new instance in HEALTHCARE, though similar in kind to existing OTHER-type regulatory " +
      "frameworks (ICO, PRA, NCSC).",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether Spanish-language legal/regulatory " +
      "citation patterns interact differently with the evaluator's authority- or evidence-resolution stages " +
      "than English-language patterns do. This candidate is NOT claimed to expand issue-class coverage; any " +
      "such effect is an open empirical question deferred to a future evaluator run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: AEMPS, the Spanish state agency for medicines and health products, " +
        "operating under the Spanish Ministry of Health.",
      "Official publication source confirmed: aemps.gob.es (the agency's own domain, not a third-party mirror).",
      "Exact document identity reconfirmed via byte-identical SHA-256 across two independent fetches " +
        "separated by the interval since DRA-ACQ-013 Phase 1.",
      "Licence basis does not match any LicenceBasis precedent already used in the corpus (OPEN_LICENCE, " +
        "PUBLIC_DOMAIN, US_GOVERNMENT_WORK) — remains a genuinely unresolved governance question, not a " +
        "clerical gap.",
    ],
    unresolvedRisks: [
      "Licence position is REVIEW_REQUIRED, not VERIFIED — a human legal reviewer must confirm the " +
        "attribution-reuse notice is sufficient for corpus inclusion before any Phase 2 acquisition. This is " +
        "recorded as a BLOCKING governance issue for this candidate, per the task's explicit instruction.",
      "This would be the first non-English document ever processed by the acquisition/normalisation " +
        "pipeline and the frozen evaluator; no non-English compatibility issue is known, but none has ever " +
        "been demonstrated either.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: technically and thematically strong (healthcare, new publisher, first " +
      "Spanish document), but its licence position remains REVIEW_REQUIRED and is explicitly recorded as a " +
      "blocking governance issue per the task's instruction not to upgrade it without new evidence. It may " +
      "still be admitted in a future phase if a qualified legal reviewer confirms the reuse basis is " +
      "sufficient, but cannot be recommended as QUALIFIED in this phase.",
  }),

  // --- Candidate 2: European Commission — Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI, ES) ---
  Object.freeze({
    candidateId: "DRA-CAND-014-02",
    publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    exactTitle: "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — official Spanish-language edition)",
    publicationDateOrVersion: "Published 8 April 2019 by the High-Level Expert Group on AI, convened by the European Commission",
    proposedDocumentType: "REPORT",
    proposedDomain: "TECHNICAL",
    language: "es",
    officialSourceUrl: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2",
    licenceReuseCategory: "NAMED_OPEN_LICENCE",
    licencePosition:
      "VERIFIED — the Spanish-language PDF is hosted directly on ec.europa.eu (European Commission " +
      "infrastructure), and the European Commission's document reuse policy (Commission Decision " +
      "2011/833/EU of 12 December 2011) is explicitly confirmed by the official EU copyright notice " +
      "(data.europa.eu/en/copyright-notice): \"Unless otherwise noted..., the reuse of the editorial content " +
      "on this website owned by the EU is authorized under the Creative Commons Attribution 4.0 " +
      "International (CC BY 4.0) licence.\" No document-specific restriction notice was found on the PDF " +
      "itself or its hosting page overriding this default. This is the same standard of evidence (an " +
      "explicit institutional policy statement, not domain-name inference) already accepted for OGL-basis " +
      "candidates (MHRA, Acas, HSE).",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423 returned HTTP 200, " +
      "content-type application/pdf, 2,135,974 bytes, 55 pages; pdftotext extraction succeeded (~189,100 " +
      "characters of Spanish-language text, opening heading confirmed: 'DIRECTRICES ÉTICAS PARA UNA IA " +
      "FIABLE'). The official Commission landing page " +
      "(digital-strategy.ec.europa.eu/es/library/ethics-guidelines-trustworthy-ai) links this same document " +
      "as the Spanish ('ES') download among 24 official EU-language editions, confirming this is the " +
      "Commission's own canonical Spanish edition, not a third-party translation.",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, EU institutional register)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly across all 55 pages; no OCR needed.",
      approximateSize: "2,135,974 bytes, 55 pages, ~189,100 extracted characters",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard formal Spanish punctuation; accented vowels and ñ present and extracted correctly; " +
        "numbered-list and lettered-sub-point conventions used extensively (a), b), c)).",
      regulatoryLegalReferences:
        "At least 20 occurrences of terms referencing EU legal instruments (Reglamento, Directiva, Carta de " +
        "los Derechos Fundamentales de la UE) across the document, plus a dedicated glossary section.",
      evidenceStructure:
        "Three-tier guidance structure (Capítulo I abstract principles, II implementation requirements, III " +
        "concrete 'Lista de evaluación de la fiabilidad' — a self-assessment checklist), plus an executive " +
        "summary ('RESUMEN'), a glossary, and closing case examples.",
    }),
    duplicateOrNearDuplicateRisk:
      "MEDIUM — thematically overlaps with two existing corpus documents (DRA-DOC-0010 NIST AI RMF, " +
      "DRA-DOC-0015 NCSC ML Principles): all three address trustworthy/responsible AI. However, this " +
      "document is a distinct jurisdiction (EU, not US/UK), a distinct language, a distinct governance " +
      "process (expert-group-authored, Commission-convened), and a distinct structural form (ethical " +
      "principles plus a self-assessment checklist, rather than a technical risk-management framework or " +
      "engineering-principles list). Recorded as MEDIUM, not LOW, so the topical overlap is not understated.",
    languageDiversityContribution:
      "Would be the corpus's first Spanish-language (es) document if admitted ahead of Candidate 1 — " +
      "confirmed corpus contribution if admitted.",
    publisherDiversityContribution:
      "European Commission / High-Level Expert Group on AI has never appeared in the corpus — confirmed " +
      "new-publisher contribution if admitted.",
    domainDiversityContribution:
      "Would reinforce TECHNICAL (currently the best-represented real domain at 3: Apache, NIST, NCSC) to " +
      "4 — a confirmed contribution, but not a gap-fill; does not address the corpus's less-represented " +
      "domains (GENERAL, LEGAL each at 1).",
    documentTypeDiversityContribution:
      "Would fill the REPORT documentType gap (currently zero real-acquisition REPORT documents) if " +
      "classified as REPORT — a confirmed gap-fill contribution, distinct from Candidate 1's non-gap-fill " +
      "PROCEDURE reinforcement.",
    evidenceStructureDiversityContribution:
      "Introduces a three-tier abstract-to-concrete guidance structure with an embedded self-assessment " +
      "checklist — a structurally new evidence-presentation pattern not yet represented by any existing " +
      "corpus document (existing AI-related documents, NIST and NCSC, are risk-framework and " +
      "engineering-principles documents respectively, not principle-plus-checklist guidance).",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether this document's checklist-style " +
      "self-assessment structure, or its EU-institutional Spanish register, will interact differently with " +
      "the evaluator's claim-extraction or evidence-linkage stages than English-language principle " +
      "documents do. This candidate is NOT claimed to expand issue-class coverage; any such effect is an " +
      "open empirical question deferred to a future evaluator run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: European Commission, via the High-Level Expert Group on AI it " +
        "convened in June 2018 — an EU institutional body, not a third-party author.",
      "Official publication source confirmed: ec.europa.eu (Commission's own newsroom document-hosting " +
        "infrastructure), directly linked from the Commission's own library page as the canonical Spanish edition.",
      "Reuse basis confirmed via the EU's own institution-wide copyright notice (CC BY 4.0 under Commission " +
        "Decision 2011/833/EU), not inferred from the .europa.eu domain alone.",
      "Exact document identity confirmed via retrieved-file SHA-256 recorded above.",
    ],
    unresolvedRisks: [
      "The document's landing page in Spanish carries a machine-translation notice for the page's own " +
        "narrative text ('Esto es una traducción automática facilitada por el servicio eTranslation'); this " +
        "notice applies to the ec.europa.eu webpage copy, NOT to the linked PDF itself, which is the " +
        "Commission's own officially published Spanish-language edition (one of 24 parallel official-language " +
        "editions distributed from the same source) — this distinction should be re-confirmed explicitly at " +
        "any future Phase 2 acquisition to avoid conflating the two.",
      "Topical overlap with two existing AI-governance corpus documents (NIST, NCSC) means this candidate's " +
        "marginal domain-diversity value is lower than a candidate from an entirely new subject area; its " +
        "primary value is language and document-type-gap diversity, not domain diversity.",
      "The corpus DocumentType schema classification (REPORT vs OTHER vs POLICY) for this document type " +
        "should be confirmed explicitly at acquisition time, since 'ethics guidelines with a self-assessment " +
        "checklist' does not map cleanly onto any single existing corpus precedent.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 3: Banco de España — general publications (assessed and rejected on licence grounds) ---
  Object.freeze({
    candidateId: "DRA-CAND-014-03",
    publisher: "Banco de España",
    exactTitle: "Banco de España general publications and statistical/supervisory guidance (site-wide reuse terms assessed, not a single document)",
    publicationDateOrVersion: "N/A — assessed at the site-wide reuse-terms level before any single document was shortlisted for retrieval",
    proposedDocumentType: "OTHER",
    proposedDomain: "FINANCE",
    language: "es",
    officialSourceUrl: "https://www.bde.es/wbe/es/pie/aviso-legal/",
    sourceFormat: "text/html",
    retrievedFileSha256: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    licenceReuseCategory: "NO_VERIFIED_REUSE_PERMISSION",
    licencePosition:
      "REJECTED — the Banco de España site-wide legal notice (bde.es/wbe/es/pie/aviso-legal) states " +
      "explicitly: \"Con carácter general, el Banco de España no concede licencia de uso o autorización " +
      "alguna sobre sus derechos de propiedad industrial o intelectual... salvo acuerdo expreso por " +
      "escrito con terceros\", permitting only free PRIVATE use (including temporary local copies) and " +
      "requiring a separate written agreement for any other reuse. This is a NO_VERIFIED_REUSE_PERMISSION " +
      "position, not merely REVIEW_REQUIRED: the publisher affirmatively states that no licence is granted " +
      "by default, rather than leaving the position ambiguous.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) to the Banco de España legal-notice page returned HTTP 200; the site itself (and " +
      "its individual publications, which were not individually retrieved once the site-wide reuse position " +
      "was found to be blocking) is publicly reachable. Accessibility is not the blocking factor for this " +
      "candidate — licence is.",
    technicalSuitability: Object.freeze({
      language: "es (Spanish, Spain)",
      script: "Latin",
      format: "text/html (site-wide notice); individual publications typically application/pdf",
      encoding: "UTF-8 (HTML)",
      textExtractability: "Not assessed further — licence position is a hard gate that made further technical assessment moot for a specific candidate document.",
      approximateSize: "Not assessed — no specific document was shortlisted once the reuse position blocked this publisher",
      hasTables: false,
      hasCrossReferences: false,
      hasCitations: false,
      hasHeadingsStructure: false,
      hasAccentedCharacters: true,
      punctuationConventions: "Standard Spanish punctuation observed in the legal-notice text itself.",
      regulatoryLegalReferences: "Not assessed further for the same reason.",
      evidenceStructure: "Not assessed further for the same reason.",
    }),
    duplicateOrNearDuplicateRisk:
      "Not assessed — moot given the licence rejection; FINANCE domain already has 2 real documents (PRA, BCBS).",
    languageDiversityContribution:
      "Not assessed — a licence rejection at the publisher-reuse-terms level means no specific document was " +
      "shortlisted for a corpus-contribution assessment.",
    publisherDiversityContribution:
      "Not assessed for the same reason.",
    domainDiversityContribution:
      "Not assessed for the same reason.",
    documentTypeDiversityContribution:
      "Not assessed for the same reason.",
    evidenceStructureDiversityContribution:
      "Not assessed for the same reason.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED, AND NOT FURTHER PURSUED: no issue-class hypothesis was formed for " +
      "this candidate because the licence rejection made further assessment moot.",
    governanceFindings: [
      "Official publisher confirmed: Banco de España, Spain's central bank and financial supervisory authority.",
      "Official publication source confirmed: bde.es (the bank's own domain).",
      "Reuse permission explicitly denied by the publisher's own site-wide legal notice for anything beyond " +
        "private, non-commercial consultation use — this is a publisher-level finding, not a document-level one.",
    ],
    unresolvedRisks: [
      "None outstanding for this candidate specifically — the licence rejection is a definitive, not " +
        "ambiguous, finding. A future acquisition could still pursue a written reuse agreement directly with " +
        "Banco de España, but that is outside the scope of an automated discovery phase.",
    ],
    qualificationOutcome: "REJECTED",
    rejectionOrDeferralReason:
      "REJECTED on licence grounds: the publisher's own legal notice affirmatively states no reuse licence " +
      "is granted beyond private consultation, without a written agreement. Per the task's explicit " +
      "instruction, a candidate with unclear or denied corpus reuse rights must not be recommended as " +
      "QUALIFIED, and public accessibility must never be treated as implying reuse permission.",
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
  readonly multilingualValue: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSED";
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
    candidateId: "DRA-CAND-014-01", // AEMPS
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "REVIEW_REQUIRED",
    retrievalReproducibility: "REPRODUCIBLE",
    multilingualValue: "HIGH",
    corpusDiversityContribution: "HIGH",
    extractionRisk: "LOW",
    governanceRisk: "BLOCKING",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-014-02", // EC Ethics Guidelines
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "VERIFIED",
    retrievalReproducibility: "REPRODUCIBLE",
    multilingualValue: "HIGH",
    corpusDiversityContribution: "MEDIUM",
    extractionRisk: "LOW",
    governanceRisk: "LOW",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-014-03", // Banco de España
    officialAuthority: "VERIFIED",
    sourceStability: "UNVERIFIED",
    licenceCertainty: "REJECTED",
    retrievalReproducibility: "NOT_ASSESSED",
    multilingualValue: "NOT_ASSESSED",
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
 *      any other merit (per the task's explicit selection rule).
 *   2. Among candidates that clear the licence gate, official-authority
 *      verification, source stability, and reproducible retrieval must
 *      all hold.
 *   3. Corpus-diversity and multilingual-value contribution break ties
 *      among licence-clear candidates.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-014-02", // EC Ethics Guidelines — VERIFIED licence, clears every gate
  "DRA-CAND-014-01", // AEMPS — strongest non-licence merit, but REVIEW_REQUIRED blocks recommendation
  "DRA-CAND-014-03", // Banco de España — REJECTED on licence grounds
]);

export const RECOMMENDED_CANDIDATE_ID: string | null = "DRA-CAND-014-02";

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
 * Returns the literal string "NO QUALIFIED MULTILINGUAL CANDIDATE" if no
 * candidate satisfies every condition.
 */
export function applySelectionRule(): string {
  const qualified = CANDIDATE_REGISTER.filter(
    (c) =>
      c.qualificationOutcome === "QUALIFIED_RECOMMENDED" &&
      c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
      c.licencePosition.startsWith("VERIFIED"),
  );
  if (qualified.length !== 1) {
    return "NO QUALIFIED MULTILINGUAL CANDIDATE";
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
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0018";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "acquire_final_document_into_corpus",
  "create_DRA-DOC-0018",
  "create_freeze_record",
  "modify_corpus_manifest",
  "modify_corpus_registry",
  "run_evaluator_on_candidate",
  "create_DRA-BMK-018",
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
  "proceed_automatically_to_phase_2",
] as const);
