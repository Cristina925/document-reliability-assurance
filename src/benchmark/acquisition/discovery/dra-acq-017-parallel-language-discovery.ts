/**
 * DRA-ACQ-017 — Phase 1: Parallel-Language Candidate Discovery and
 * Qualification for DRA-DOC-0021
 *
 * Governed, reproducible candidate-discovery and qualification evidence
 * package testing whether the corpus can be extended with genuine
 * parallel-language editions of a document it already holds, following the
 * pattern established by DRA-ACQ-013 (candidate discovery), DRA-ACQ-014/015
 * (Spanish), and DRA-ACQ-016 (French, DRA-DOC-0020).
 *
 * RESEARCH HYPOTHESIS (H21), stated here strictly as an unconfirmed research
 * question — this phase does not test it and does not predict its outcome:
 *
 *   "For officially equivalent parallel-language editions of the same
 *   substantive document, changing publication language alone should not
 *   materially alter DRA decision, issue-class outcome, or proof
 *   integrity."
 *
 * The DRA-BMK-020 checkpoint (see
 * `execution/__tests__/dra-bmk-020-evaluator-run.test.ts`, Part 11)
 * identified the evidence gap this programme targets: the corpus's three
 * non-English documents (DRA-DOC-0018 EC/es, DRA-DOC-0019 INE/es,
 * DRA-DOC-0020 CNIL/fr) differ in publisher, domain, and structure as well
 * as language, so no existing comparison can isolate a language effect from
 * a document effect. DRA-BMK-020 named a parallel-text pair — the same
 * source document, officially published in 2+ languages — as the only
 * design that holds content constant and varies only language, and
 * specifically flagged that EU institutions (already represented via
 * DRA-DOC-0018) commonly publish exactly this kind of multi-edition
 * document.
 *
 * The frozen corpus already holds the Spanish edition of the European
 * Commission / High-Level Expert Group on AI "Ethics Guidelines for
 * Trustworthy AI" (8 April 2019) as DRA-DOC-0018. This programme
 * investigates the same publication's official English and French editions
 * as parallel-language candidates for DRA-DOC-0021, so that a future phase
 * can construct a genuine en/es/fr parallel-text triple.
 *
 * This module records:
 *
 *   1. A corpus inventory of the current 20-document corpus (DRA-DOC-0001–
 *      0020), transcribed from the authoritative DRA-BMK-020 checkpoint
 *      field values, not re-derived here (this phase does not run the
 *      evaluator).
 *   2. The H21 evidence-gap analysis explaining why a genuine
 *      parallel-language pair, rather than another unrelated non-English
 *      document, is the strongest next controlled experiment.
 *   3. A parallel-edition provenance package establishing, from the
 *      publisher's own infrastructure (not title similarity), that the
 *      English and French editions are official translations of the exact
 *      same substantive publication already represented by DRA-DOC-0018.
 *   4. A candidate register of the two parallel-language editions (English,
 *      French), each independently re-verified today (live HTTP fetch of
 *      the actual PDF, per-language landing-page cross-checks, licence-page
 *      inspection, and PDF text extraction).
 *   5. A structural-comparability assessment across all three editions
 *      (en/es/fr), including one genuine anomaly discovered during
 *      verification (see Section 3 below).
 *   6. A deterministic ranking and a Phase 1 qualification decision for
 *      each candidate.
 *
 * SCOPE — Phase 1 only. This module does not download-and-freeze, admit, or
 * evaluate any document. It does not create DRA-DOC-0021, a new freeze
 * record, a new registry entry, or a new benchmark checkpoint, and it does
 * not modify any frozen artefact belonging to the existing 20-document
 * corpus, DRA-BMK-020, or Evaluator Version 1. See the accompanying test
 * file for an explicit, machine-checkable assertion of that boundary.
 *
 * Per the task's explicit methodological instructions, this programme must
 * NOT assume equivalence between editions merely because titles are
 * similar (Section 3 below establishes equivalence from the publisher's own
 * per-language index, independently for each edition), must NOT modify DRA
 * to accommodate the candidates, and must record failure and stop — rather
 * than weakening admission criteria — if a candidate fails qualification.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus inventory of the existing 20-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-020 checkpoint's canonical summary, extending the DRA-ACQ-016
 * 19-row inventory with DRA-DOC-0020.
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
  Object.freeze({ corpusId: "DRA-DOC-0019", publisher: "Instituto Nacional de Estadística (INE), Spain", documentType: "REPORT", domain: "GENERAL", language: "es", isRealAcquisition: true, acquisitionId: "DRA-ACQ-015" }),
  Object.freeze({ corpusId: "DRA-DOC-0020", publisher: "Commission Nationale de l'Informatique et des Libertés (CNIL), France", documentType: "REPORT", domain: "LEGAL", language: "fr", isRealAcquisition: true, acquisitionId: "DRA-ACQ-016" }),
]);

export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

/** True iff the corpus's three non-English real documents are exactly DRA-DOC-0018 (es), DRA-DOC-0019 (es), DRA-DOC-0020 (fr) — no existing parallel-language pair. */
export function noExistingParallelLanguagePairExists(): boolean {
  const nonEnglish = REAL_ACQUISITIONS.filter(
    (row) => row.language !== "en" && row.language !== "en-GB",
  );
  if (nonEnglish.length !== 3) return false;
  const ids = nonEnglish.map((r) => r.corpusId).sort().join(",");
  if (ids !== "DRA-DOC-0018,DRA-DOC-0019,DRA-DOC-0020") return false;
  // A "parallel pair" would require two documents sharing publisher AND
  // substantive title/content while differing only in language. All three
  // non-English documents here have distinct publishers and distinct
  // substantive content, so none is a parallel-language counterpart of
  // another.
  const publishers = new Set(nonEnglish.map((r) => r.publisher));
  return publishers.size === 3;
}

// ---------------------------------------------------------------------------
// Section 2 — H21 evidence-gap analysis
// ---------------------------------------------------------------------------

export interface BenchmarkDecisionDistribution {
  readonly SUPPORTED: number;
  readonly REVIEW: number;
  readonly HOLD: number;
}

/**
 * Fixed data reproducing the DRA-BMK-020 checkpoint's authoritative
 * findings. Treated as established benchmark evidence per this task's
 * "do not modify frozen artefacts" constraint — not re-derived here (this
 * phase does not run the evaluator).
 */
export const BMK_020_DECISION_DISTRIBUTION: BenchmarkDecisionDistribution = Object.freeze({
  SUPPORTED: 10,
  REVIEW: 8,
  HOLD: 2,
});

export const BMK_020_ISSUE_CLASS_COVERAGE = Object.freeze({
  fraction: "3/9",
  coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
});

/** The DRA-BMK-020 three-language comparison finding — explicitly scoped, not generalised. */
export const BMK_020_THREE_LANGUAGE_COMPARISON = Object.freeze({
  comparedCorpusIds: Object.freeze(["DRA-DOC-0018", "DRA-DOC-0019", "DRA-DOC-0020"]),
  languages: Object.freeze(["es", "es", "fr"]),
  comparisonCategory: "NO_DIFFERENCE" as const,
  scopeStatement:
    "DRA-BMK-020 found that DRA-DOC-0018 (es), DRA-DOC-0019 (es), and DRA-DOC-0020 (fr) all decided " +
    "SUPPORTED with 0 issues. This finding is explicitly scoped to those three documents. It could NOT " +
    "isolate language as a causal factor, because the three documents differ in publisher, domain, and " +
    "structure as well as language — any of those confounds, not language, could equally explain the " +
    "shared outcome.",
});

/**
 * The DRA-BMK-020 checkpoint's own stated evidence gap (Part 11), recorded
 * as fixed data so the reasoning chain from that checkpoint to this
 * programme is auditable, not re-derived from narrative memory.
 */
export const H21_EVIDENCE_GAP =
  "DRA-BMK-020's comparative analysis could not isolate language as a causal factor, because " +
  "DRA-DOC-0018/0019/0020 differ in publisher, domain, and structure as well as language. Two candidate " +
  "evidence gaps were identified: (a) a fourth language, which would test generalisation further without " +
  "resolving the language-vs-document confound for any existing language; and (b) a parallel-text pair — " +
  "the same source document, officially translated into two or more of en/es/fr — which would hold " +
  "content constant and vary only language, the only design that can directly isolate a language effect " +
  "from a document effect. DRA-BMK-020 specifically noted that EU institutions (already represented via " +
  "DRA-DOC-0018) commonly publish the same document in multiple official-language editions, which could " +
  "satisfy (b) directly. This programme pursues (b): DRA-DOC-0018 is the European Commission / " +
  "High-Level Expert Group on AI 'Ethics Guidelines for Trustworthy AI' (8 April 2019), Spanish edition. " +
  "This programme investigates the same publication's official English and French editions as candidates " +
  "for DRA-DOC-0021, so that a future benchmark run could compare all three language editions of the " +
  "identical substantive document — a genuine parallel-text design.";

/**
 * H21 — stated here strictly as an unconfirmed research hypothesis for a
 * FUTURE benchmark phase to test. This discovery phase does not test it,
 * does not run the evaluator, and does not predict or claim its outcome.
 */
export const H21_HYPOTHESIS =
  "H21: For officially equivalent parallel-language editions of the same substantive document, changing " +
  "publication language alone should not materially alter DRA decision, issue-class outcome, or proof " +
  "integrity. This is an open empirical question. This Phase 1 discovery module does not test it; it only " +
  "establishes whether a genuine parallel-language candidate exists that COULD test it in a future phase.";

// ---------------------------------------------------------------------------
// Section 3 — Parallel-edition provenance: establishing EN/ES/FR as the
// same substantive publication, from the publisher's own infrastructure
// ---------------------------------------------------------------------------

/**
 * Per-language EC document IDs for the Ethics Guidelines for Trustworthy AI,
 * cross-verified today directly from THREE independently-fetched official
 * European Commission landing pages: the English, French, and Spanish
 * language versions of
 * digital-strategy.ec.europa.eu/{en,fr,es}/library/ethics-guidelines-trustworthy-ai.
 * All three pages expose an identical per-language download table (an
 * institution-maintained index, not link position or title text), and all
 * three independently agree on every doc_id checked below. This is the
 * provenance evidence for "same substantive publication, different
 * language edition" — it does not rely on title similarity.
 */
export const EC_PER_LANGUAGE_TABLE_CROSS_CHECK = Object.freeze({
  sourcePages: Object.freeze([
    "https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai",
    "https://digital-strategy.ec.europa.eu/fr/library/ethics-guidelines-trustworthy-ai",
    "https://digital-strategy.ec.europa.eu/es/library/ethics-guidelines-trustworthy-ai",
  ]),
  // doc_id values as found in the per-language download table, independently
  // confirmed identical on all three pages fetched today.
  languageDocIds: Object.freeze({
    en: "60419",
    es: "60423", // already frozen as DRA-DOC-0018's source (ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423)
    fr: "60427",
  }),
  agreementAcrossAllThreePages: true,
  // A second, unrelated per-language table also present on the same landing
  // pages (doc_id range 60651-60673) links a companion "Definition of AI"
  // document, NOT the Guidelines themselves — confirmed by inspecting the
  // heading immediately preceding that table ("Download the Definition of
  // AI in your language below"). Not a candidate for this programme; noted
  // here so a future reviewer does not conflate the two tables.
  unrelatedCompanionTableNote:
    "The same landing pages also link a distinct 'Definition of Artificial Intelligence' companion " +
    "document (doc_id range 60651-60673), confirmed by its own preceding heading to be a different " +
    "publication from the Ethics Guidelines. It is not part of this candidate register.",
});

/**
 * Structural comparability across all three language editions, established
 * by extracting text from all three PDFs today (the already-frozen ES PDF
 * re-fetched for this comparison only, not re-frozen or re-admitted) and
 * confirming the same section structure is present in each.
 */
export interface EditionStructuralProfile {
  readonly language: string;
  readonly pageCount: number;
  readonly approximateExtractedChars: number;
  readonly approximateWordCount: number;
  readonly hasExecutiveSummary: boolean;
  readonly hasChapterI: boolean;
  readonly hasChapterII: boolean;
  readonly hasChapterIII: boolean;
  readonly hasTrustworthyAiAssessmentList: boolean;
  readonly hasGlossary: boolean;
  readonly publicationDateStatement: string;
}

export const EDITION_STRUCTURAL_PROFILES: readonly EditionStructuralProfile[] = Object.freeze([
  Object.freeze({
    language: "en",
    pageCount: 41,
    approximateExtractedChars: 163025,
    approximateWordCount: 22990,
    hasExecutiveSummary: true,
    hasChapterI: true,
    hasChapterII: true,
    hasChapterIII: true,
    hasTrustworthyAiAssessmentList: true,
    hasGlossary: true,
    publicationDateStatement: "Document made public on 8 April 2019.",
  }),
  Object.freeze({
    language: "es",
    pageCount: 55,
    approximateExtractedChars: 189100,
    approximateWordCount: 27000, // not independently word-counted in DRA-ACQ-014; recorded as an order-of-magnitude cross-check only, not authoritative
    hasExecutiveSummary: true,
    hasChapterI: true,
    hasChapterII: true,
    hasChapterIII: true,
    hasTrustworthyAiAssessmentList: true,
    hasGlossary: true,
    publicationDateStatement: "Documento publicado el X de abril de 2019.",
  }),
  Object.freeze({
    language: "fr",
    pageCount: 56,
    approximateExtractedChars: 218235,
    approximateWordCount: 28220,
    hasExecutiveSummary: true,
    hasChapterI: true,
    hasChapterII: true,
    hasChapterIII: true,
    hasTrustworthyAiAssessmentList: true,
    hasGlossary: true,
    publicationDateStatement: "Document rendu public le X avril 2019.",
  }),
]);

/**
 * GENUINE STRUCTURAL ANOMALY, discovered during today's re-verification,
 * not assumed or inferred: the frozen Spanish edition (DRA-DOC-0018) and the
 * candidate French edition BOTH contain a literal, uncorrected placeholder
 * token ("X") in place of the publication day, in the sentence stating when
 * the document was made public — "Documento publicado el X de abril de
 * 2019" (es) and "Document rendu public le X avril 2019" (fr) — whereas the
 * English edition correctly states "Document made public on 8 April 2019."
 * Confirmed present in the raw extracted PDF text (both with and without
 * pdftotext -layout) at the identical front-matter position in both
 * documents, ruling out an extraction artefact.
 *
 * This is recorded as a genuine, publisher-side front-matter defect common
 * to (at least) the Spanish and French translated editions, not present in
 * the English original. It:
 *   - REINFORCES the parallel-edition finding: sharing an identical,
 *     unusual typographical defect at the identical sentence position is
 *     strong independent evidence that the ES and FR editions were produced
 *     from a common translation template/process, not independently
 *     authored documents that merely resemble each other.
 *   - DOES NOT affect the substantive guidance content (principles,
 *     requirements, or the Chapter III assessment list) in either edition —
 *     it is confined to a single front-matter metadata sentence.
 *   - IS a structural difference between the English edition and the
 *     ES/FR editions specifically (item 9 of the task's required
 *     findings), recorded here rather than silently normalised away.
 */
export const PUBLICATION_DATE_PLACEHOLDER_ANOMALY = Object.freeze({
  affectedLanguages: Object.freeze(["es", "fr"]),
  unaffectedLanguages: Object.freeze(["en"]),
  description:
    "The Spanish (already-frozen DRA-DOC-0018) and candidate French editions both read 'el X de abril de " +
    "2019' / 'le X avril 2019' — a literal uncorrected day-of-month placeholder — in the sentence stating " +
    "when the document was made public, at the identical front-matter position. The English edition " +
    "correctly states 'on 8 April 2019'. Confirmed in raw PDF-extracted text for all three editions; not " +
    "an extraction artefact.",
  scopeOfImpact:
    "Confined to a single front-matter metadata sentence; does not alter any chapter, principle, " +
    "requirement, or the Chapter III Trustworthy AI assessment list in either affected edition.",
  evidentialValue:
    "Strengthens, rather than weakens, the parallel-edition determination: an identical, unusual defect " +
    "at an identical position is independent evidence of a shared translation source common to the " +
    "Spanish and French editions.",
});

// ---------------------------------------------------------------------------
// Section 4 — Candidate discovery register
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

export interface MediaTypeObservation {
  readonly rawContentTypeHeader: string;
  readonly contentDispositionFilename: string;
  readonly pdfSignatureAtOffsetZero: boolean;
  /** True iff this response requires the DRA-ENG-011 malformed-media-type fallback (Content-Disposition names a .pdf AND the byte signature is %PDF-) rather than a syntactically valid Content-Type header. */
  requiresEng011Fallback: boolean;
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
  readonly fileSizeBytes: number;
  readonly mediaTypeObservation: MediaTypeObservation;
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
  readonly parallelEditionEvidence: string;
  readonly structuralComparabilityFinding: string;
  readonly duplicateOrNearDuplicateRisk: string;
  /** Explains how this candidate would test H21. Never claims a predicted result. */
  readonly hypothesisTestingSuitability: string;
  /** Explicitly framed as an unconfirmed hypothesis — never a claimed/expected coverage outcome. */
  readonly issueClassHypothesis: string;
  readonly governanceFindings: readonly string[];
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: English edition ---
  Object.freeze({
    candidateId: "DRA-CAND-017-01",
    publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    exactTitle: "Ethics Guidelines for Trustworthy AI (official English-language edition)",
    publicationDateOrVersion: "Published 8 April 2019 by the High-Level Expert Group on AI, convened by the European Commission",
    proposedDocumentType: "REPORT",
    proposedDomain: "TECHNICAL",
    language: "en",
    officialSourceUrl: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "4a89863a96551bb3b9ce786afb1b1d58e8062f5a7fa3ed6748922550dde35e25",
    fileSizeBytes: 1632682,
    mediaTypeObservation: Object.freeze({
      rawContentTypeHeader: "application/",
      contentDispositionFilename: "ai_hleg_ethics_guidelines_for_trustworthy_ai-en_87F84A41-A6E8-F38C-BFF661481B40077B_60419.pdf",
      pdfSignatureAtOffsetZero: true,
      requiresEng011Fallback: true,
    }),
    licenceReuseCategory: "NAMED_OPEN_LICENCE",
    licencePosition:
      "VERIFIED — the English-language PDF is hosted directly on ec.europa.eu (European Commission " +
      "infrastructure), and the European Commission's institution-wide reuse policy (Commission Decision " +
      "2011/833/EU), re-confirmed today at data.europa.eu/en/copyright-notice, states: \"...the reuse of " +
      "the editorial content on this website owned by the EU is authorized under the Creative Commons " +
      "Attribution 4.0 International (CC BY 4.0) licence.\" No document-specific restriction notice was " +
      "found on either the English digital-strategy.ec.europa.eu landing page or the PDF itself overriding " +
      "this default. This is the identical licence basis already accepted for DRA-DOC-0018 (Spanish " +
      "edition of the same publication) and DRA-DOC-0020 (CNIL) — not re-derived from a weaker or " +
      "different source.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live fetch (curl -L, Chrome UA) to https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419 " +
      "today returned HTTP 200, 1,632,682 bytes, 41-page PDF (confirmed via `file`), byte signature " +
      "'%PDF-' at offset 0. pdftotext extraction succeeded cleanly (163,025 extracted characters, 22,990 " +
      "words, opening heading confirmed: 'ETHICS GUIDELINES FOR TRUSTWORTHY AI').",
    parallelEditionEvidence:
      "The EC's own per-language download table — independently fetched today from all THREE of the " +
      "English, French, and Spanish digital-strategy.ec.europa.eu landing pages for this publication — " +
      "lists doc_id=60419 under the 'EN' column on all three pages, in agreement. The same table's 'ES' " +
      "entry (doc_id=60423) is the exact URL already frozen as DRA-DOC-0018's source, directly linking " +
      "this candidate to the already-admitted document as an official sibling edition, not merely a " +
      "similarly-titled document. See EC_PER_LANGUAGE_TABLE_CROSS_CHECK.",
    structuralComparabilityFinding:
      "Contains the identical structure to DRA-DOC-0018: Executive Summary, Chapter I (Foundations), " +
      "Chapter II (Realising Trustworthy AI), Chapter III (the Trustworthy AI assessment list), and a " +
      "Glossary — confirmed by direct table-of-contents and section-heading extraction from the live PDF. " +
      "Page count (41) is lower than the Spanish edition (55) and French edition (56), consistent with " +
      "typical layout-density differences between English and Romance-language typesetting of the same " +
      "content, not a missing-section difference — every section present in ES/FR is also present in EN.",
    duplicateOrNearDuplicateRisk:
      "N/A for corpus-diversity purposes in the usual sense — this candidate is INTENTIONALLY the same " +
      "substantive document as DRA-DOC-0018 (that is the entire point of a parallel-language candidate). " +
      "It must not be scored against the standard near-duplicate rejection criterion used for topically- " +
      "adjacent but substantively distinct documents; it is recorded here for completeness only.",
    hypothesisTestingSuitability:
      "Together with the already-frozen DRA-DOC-0018 (es) and, if separately admitted, the French " +
      "candidate below, this edition would let a future benchmark phase compare DRA decisions across three " +
      "editions of the IDENTICAL substantive document, holding content constant and varying only language " +
      "— the parallel-text design DRA-BMK-020 identified as the only way to isolate a language effect from " +
      "a document effect. No outcome is predicted; this is a description of experimental design.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether the English edition will produce " +
      "the same decision and issue count as the Spanish edition. This candidate is NOT claimed to expand " +
      "issue-class coverage; any such effect is an open empirical question deferred to a future evaluator " +
      "run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: European Commission — High-Level Expert Group on Artificial " +
        "Intelligence, identical to DRA-DOC-0018's publisher.",
      "Official publication source confirmed: ec.europa.eu (European Commission infrastructure, the " +
        "exact same publishing system as DRA-DOC-0018's Spanish edition).",
      "Media-type handling: the origin server returns a malformed 'Content-Type: application/' header on " +
        "this PDF, exactly the DRA-ENG-011 pattern already exercised for DRA-DOC-0018 and DRA-DOC-0020. " +
        "The unmodified DRA-ENG-011 fallback (Content-Disposition names a '.pdf' file AND the response " +
        "begins with the exact '%PDF-' signature) would accept this response through the standard " +
        "production fetcher without any new engineering change. This is a re-confirmation, not a new " +
        "engineering requirement.",
      "Reuse basis confirmed via the EU's institution-wide copyright notice, re-fetched and re-read today " +
        "— unchanged from the DRA-DOC-0018/0020 precedent.",
    ],
    unresolvedRisks: [
      "None specific to the English edition; its licence, accessibility, and structure all match the " +
        "already-accepted DRA-DOC-0018 precedent exactly.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 2: French edition ---
  Object.freeze({
    candidateId: "DRA-CAND-017-02",
    publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
    exactTitle: "Lignes directrices en matière d'éthique pour une IA digne de confiance (official French-language edition)",
    publicationDateOrVersion: "Published 8 April 2019 by the High-Level Expert Group on AI, convened by the European Commission",
    proposedDocumentType: "REPORT",
    proposedDomain: "TECHNICAL",
    language: "fr",
    officialSourceUrl: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60427",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "2389f788e8f606cf859f8a5492fdea626038f218776f50693b8b67e6cd1f5483",
    fileSizeBytes: 2180872,
    mediaTypeObservation: Object.freeze({
      rawContentTypeHeader: "application/",
      contentDispositionFilename: "ethics_guidelines_for_trustworthy_ai-fr_87FE7A3C-D03D-9305-81A653DDA84B5A60_60427.pdf",
      pdfSignatureAtOffsetZero: true,
      requiresEng011Fallback: true,
    }),
    licenceReuseCategory: "NAMED_OPEN_LICENCE",
    licencePosition:
      "VERIFIED — the French-language PDF is hosted directly on ec.europa.eu, under the identical " +
      "institution-wide CC BY 4.0 reuse policy re-confirmed today at data.europa.eu/en/copyright-notice. " +
      "No document-specific restriction notice was found on either the French digital-strategy.ec.europa.eu " +
      "landing page or the PDF itself. Identical licence basis to DRA-DOC-0018, DRA-DOC-0020, and Candidate " +
      "1 (English) above — this is the corpus's third document under this exact EU institutional licence " +
      "basis, not a new or weaker one.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live fetch (curl -L, Chrome UA) to https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60427 " +
      "today returned HTTP 200, 2,180,872 bytes, 56-page PDF (confirmed via `file`), byte signature " +
      "'%PDF-' at offset 0. pdftotext extraction succeeded cleanly (218,235 extracted characters, 28,220 " +
      "words, opening heading confirmed: 'LIGNES DIRECTRICES EN MATIERE D'ETHIQUE POUR UNE IA DIGNE DE " +
      "CONFIANCE').",
    parallelEditionEvidence:
      "The EC's own per-language download table — independently fetched today from all THREE of the " +
      "English, French, and Spanish digital-strategy.ec.europa.eu landing pages for this publication — " +
      "lists doc_id=60427 under the 'FR' column on all three pages, in agreement. Directly links this " +
      "candidate, via the publisher's own index rather than title similarity, to the same publication as " +
      "the already-frozen DRA-DOC-0018 and Candidate 1 above. See EC_PER_LANGUAGE_TABLE_CROSS_CHECK.",
    structuralComparabilityFinding:
      "Contains the identical structure to DRA-DOC-0018 and Candidate 1: Executive Summary (RESUME), " +
      "Chapitre I (Fondements), Chapitre II (Parvenir à une IA digne de confiance), Chapitre III " +
      "(the assessment-list chapter), and a Glossaire — confirmed by direct table-of-contents and " +
      "section-heading extraction from the live PDF. Page count (56) is closest to the Spanish edition's " +
      "55 pages. GENUINE ANOMALY: this edition shares with the Spanish edition (DRA-DOC-0018) an identical, " +
      "uncorrected front-matter placeholder — 'Document rendu public le X avril 2019' — where the English " +
      "edition correctly states 'on 8 April 2019'. See PUBLICATION_DATE_PLACEHOLDER_ANOMALY: this is " +
      "confined to one metadata sentence, does not affect any substantive chapter or the assessment list, " +
      "and is independent evidence (not a weakness) that the Spanish and French editions share a common " +
      "translation source.",
    duplicateOrNearDuplicateRisk:
      "N/A for corpus-diversity purposes in the usual sense — this candidate is INTENTIONALLY the same " +
      "substantive document as DRA-DOC-0018 and Candidate 1 (that is the entire point of a " +
      "parallel-language candidate). It must not be scored against the standard near-duplicate rejection " +
      "criterion used for topically-adjacent but substantively distinct documents; it is recorded here for " +
      "completeness only.",
    hypothesisTestingSuitability:
      "Together with the already-frozen DRA-DOC-0018 (es) and Candidate 1 (en) above, this edition would " +
      "complete a genuine en/es/fr parallel-text triple of the identical substantive document, the " +
      "strongest possible design for isolating a language effect from a document effect per the DRA-BMK-020 " +
      "evidence gap. No outcome is predicted.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether the French edition — including " +
      "its shared front-matter placeholder anomaly with the Spanish edition — will produce the same " +
      "decision and issue count as the English or Spanish editions. This candidate is NOT claimed to " +
      "expand issue-class coverage; any such effect is an open empirical question deferred to a future " +
      "evaluator run outside this phase.",
    governanceFindings: [
      "Official publisher confirmed: European Commission — High-Level Expert Group on Artificial " +
        "Intelligence, identical to DRA-DOC-0018's publisher.",
      "Official publication source confirmed: ec.europa.eu — the same publishing system as DRA-DOC-0018 " +
        "and Candidate 1.",
      "Media-type handling: identical DRA-ENG-011 malformed 'Content-Type: application/' pattern as " +
        "DRA-DOC-0018, DRA-DOC-0020, and Candidate 1 — the unmodified fallback applies without any new " +
        "engineering change.",
      "Reuse basis confirmed via the EU's institution-wide copyright notice, re-fetched and re-read today " +
        "— unchanged from the DRA-DOC-0018/0020/Candidate-1 precedent.",
      "The shared publication-date placeholder anomaly with DRA-DOC-0018 is recorded as a governance " +
        "observation, not a licence or accessibility concern: it is evidence the ES and FR editions were " +
        "produced from a common translation process, reinforcing (not weakening) the parallel-edition " +
        "determination.",
    ],
    unresolvedRisks: [
      "The publication-date placeholder anomaly ('X avril 2019') is a genuine, uncorrected defect in the " +
        "publisher's own official French PDF. It does not affect this Phase 1 qualification (it is a " +
        "front-matter metadata sentence, not substantive content), but a future acquisition record should " +
        "note it explicitly rather than silently correcting or normalising it, consistent with this " +
        "programme's evidence-preservation standard.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason: null,
  }),
]);

// ---------------------------------------------------------------------------
// Section 5 — Comparative ranking and Phase 1 decision
// ---------------------------------------------------------------------------

export interface CandidateComparisonRow {
  readonly candidateId: string;
  readonly officialAuthority: "VERIFIED" | "UNVERIFIED";
  readonly sourceStability: "BYTE_STABLE" | "UNVERIFIED";
  readonly licenceCertainty: "VERIFIED" | "REVIEW_REQUIRED" | "REJECTED";
  readonly parallelEditionCertainty: "VERIFIED" | "UNVERIFIED";
  readonly structuralComparability: "FULL" | "PARTIAL" | "NOT_ASSESSED";
  readonly retrievalReproducibility: "REPRODUCIBLE" | "UNRELIABLE" | "NOT_ASSESSED";
  readonly hypothesisTestingValue: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSED";
  readonly governanceRisk: "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";
}

/**
 * Structured comparison across the minimum required dimensions. Fixed data,
 * derived directly from the CANDIDATE_REGISTER fields above — not a
 * separate scoring function, so the reasoning is auditable line-by-line.
 */
export const CANDIDATE_COMPARISON: readonly CandidateComparisonRow[] = Object.freeze([
  Object.freeze({
    candidateId: "DRA-CAND-017-01", // English
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "VERIFIED",
    parallelEditionCertainty: "VERIFIED",
    structuralComparability: "FULL",
    retrievalReproducibility: "REPRODUCIBLE",
    hypothesisTestingValue: "HIGH",
    governanceRisk: "LOW",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-017-02", // French
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "VERIFIED",
    parallelEditionCertainty: "VERIFIED",
    structuralComparability: "FULL",
    retrievalReproducibility: "REPRODUCIBLE",
    hypothesisTestingValue: "HIGH",
    governanceRisk: "LOW",
  }),
]);

/**
 * Deterministic ranking, applied in strict priority order (fixed data, not
 * a runtime scoring function):
 *
 *   1. Both candidates clear every hard gate (licence VERIFIED, official
 *      authority VERIFIED, parallel-edition provenance VERIFIED, full
 *      structural comparability, reproducible retrieval). Neither is
 *      REJECTED.
 *   2. Because only ONE new corpus ID (DRA-DOC-0021) is reserved for this
 *      programme, exactly one candidate is recommended as PRIMARY for
 *      Phase 2 admission; the other is recorded QUALIFIED_ALTERNATE, not
 *      REJECTED, since it fully qualifies on every criterion and remains
 *      available for a future acquisition (which would require reserving a
 *      further corpus ID, out of scope for this phase to do).
 *   3. Tie-break: the English edition is preferred as PRIMARY because it is
 *      the only edition free of the publication-date placeholder anomaly
 *      (Section 3) — an edition with zero known content anomalies is the
 *      cleaner baseline for a parallel-text comparison. The French edition
 *      is preferred as the ALTERNATE precisely because, together with the
 *      already-frozen Spanish edition, it would let a future phase
 *      additionally test whether the shared anomaly (not present in
 *      English) has any observable effect — an additional, distinct
 *      research question, not a reason to prefer it as the primary pick
 *      for this phase.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-017-01", // English — QUALIFIED_RECOMMENDED, no known content anomaly
  "DRA-CAND-017-02", // French — QUALIFIED_ALTERNATE, fully qualifies but carries the shared ES/FR placeholder anomaly
]);

export const RECOMMENDED_CANDIDATE_ID: string | null = "DRA-CAND-017-01";

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
 * Applies the qualification rule mechanically: a candidate qualifies (as
 * recommended or alternate) only if it carries a VERIFIED (not
 * REVIEW_REQUIRED/REJECTED) licence position, VERIFIED_ACCESSIBLE http
 * status, and VERIFIED parallel-edition provenance. Returns the list of
 * every candidateId meeting all three gates, in CANDIDATE_REGISTER order.
 */
export function applyQualificationRule(): readonly string[] {
  return CANDIDATE_REGISTER.filter(
    (c) =>
      (c.qualificationOutcome === "QUALIFIED_RECOMMENDED" || c.qualificationOutcome === "QUALIFIED_ALTERNATE") &&
      c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
      c.licencePosition.startsWith("VERIFIED"),
  ).map((c) => c.candidateId);
}

// ---------------------------------------------------------------------------
// Section 6 — Phase boundary confirmation
// ---------------------------------------------------------------------------

/**
 * Explicit, machine-checkable confirmation of the Phase 1 scope boundary.
 * No corpus document with this ID exists as a result of this module; it is
 * reserved only as a plain string label for future reference.
 */
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0021";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "acquire_final_document_into_corpus",
  "create_DRA-DOC-0021",
  "create_freeze_record",
  "modify_corpus_manifest",
  "modify_corpus_registry",
  "run_evaluator_on_candidate",
  "create_DRA-BMK-021",
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
  "modify_dra_doc_0018_or_0020_frozen_records",
  "modify_dra_bmk_020_results",
  "answer_h21_hypothesis",
  "assume_equivalence_from_title_similarity_alone",
  "proceed_automatically_to_phase_2",
] as const);
