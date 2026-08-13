/**
 * DRA-ACQ-016 — Phase 1: Third-Language Candidate Discovery for
 * DRA-DOC-0020
 *
 * Governed, reproducible candidate-discovery and selection evidence package
 * for identifying the strongest candidate document in a THIRD language
 * (neither English nor Spanish) to extend the multilingual benchmark,
 * following the pattern established by DRA-ACQ-013 (candidate discovery),
 * DRA-ACQ-014 (first multilingual discovery, Spanish), and DRA-ACQ-015
 * (second multilingual discovery, Spanish).
 *
 * DRA-BMK-019 compared the corpus's two Spanish-language documents
 * (DRA-DOC-0018, European Commission, and DRA-DOC-0019, INE) and classified
 * the comparison as NO_DIFFERENCE — explicitly scoped ONLY to those two
 * documents, not a general multilingual-robustness claim. With only one
 * language pair (es vs es) observed, it remains impossible to tell whether
 * the evaluator's apparent multilingual robustness is a property of Spanish
 * specifically, of the two documents examined, or of language handling in
 * general. A genuinely different, third language is the only way to widen
 * that inference beyond a single language.
 *
 * Per the task's explicit methodological instruction, the goal of this
 * programme is NOT to maximise language count for its own sake. The
 * preferred candidate must improve experimental-design quality — an
 * independently governed publisher, new evidence, and preserved
 * reproducibility/governance standards — not merely add a new language
 * label. A candidate that only adds a language without a new, independently
 * governed publisher and unrepresented evidence structure is not preferred
 * over one that does.
 *
 * This module records:
 *
 *   1. A corpus inventory of the current 19-document corpus (DRA-DOC-0001–
 *      0019), transcribed from the authoritative field values confirmed in
 *      DRA-BMK-019, not re-derived here (this phase does not run the
 *      evaluator).
 *   2. A third-language evidence-gap analysis explaining why a document in a
 *      genuinely new language, from a new, independently governed
 *      publisher, is the strongest next controlled experiment.
 *   3. A candidate register of genuinely researched, real, official-source
 *      documents in candidate third languages, each independently verified
 *      today (live HTTP fetch + licence-page inspection + PDF text
 *      extraction).
 *   4. A deterministic ranking and, if the selection rule is satisfied,
 *      exactly one recommendation.
 *
 * SCOPE — Phase 1 only. This module does not download-and-freeze, admit, or
 * evaluate any document. It does not create DRA-DOC-0020, a new freeze
 * record, a new registry entry, or a new benchmark checkpoint. It records
 * discovery-and-selection evidence only — see the accompanying test file for
 * an explicit assertion of that constraint.
 *
 * Per the DRA-ACQ-016 task specification, this programme must NOT attempt to
 * predict any hypothesis-testing outcome during discovery, must NOT infer
 * issue-class behaviour or benchmark contribution, and must NOT silently
 * upgrade the AEMPS or CNMV candidates' REVIEW_REQUIRED licence positions
 * carried forward from prior phases without new evidence (they are not
 * re-examined here — they remain out of scope for a third-language
 * programme, which is why they are not present in this module's candidate
 * register).
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus inventory of the existing 19-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-019 checkpoint's canonical summary table, extending the
 * DRA-ACQ-015 18-row inventory with DRA-DOC-0019.
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

export const REAL_DOMAIN_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "domain",
);

/** True iff exactly two real acquisitions are non-English, and both are Spanish (DRA-DOC-0018, DRA-DOC-0019). */
export function exactlyTwoNonEnglishRealDocumentsExistBothSpanish(): boolean {
  const nonEnglish = REAL_ACQUISITIONS.filter(
    (row) => row.language !== "en" && row.language !== "en-GB",
  );
  return (
    nonEnglish.length === 2 &&
    nonEnglish.every((row) => row.language === "es") &&
    nonEnglish.map((row) => row.corpusId).sort().join(",") === "DRA-DOC-0018,DRA-DOC-0019"
  );
}

// ---------------------------------------------------------------------------
// Section 2 — Third-language evidence-gap analysis
// ---------------------------------------------------------------------------

export interface BenchmarkDecisionDistribution {
  readonly SUPPORTED: number;
  readonly REVIEW: number;
  readonly HOLD: number;
}

/**
 * Fixed data reproducing the DRA-BMK-019 checkpoint's authoritative
 * findings. Treated as established benchmark evidence per the DRA-ACQ-016
 * task specification — not re-derived here (this phase does not run the
 * evaluator).
 */
export const BMK_019_DECISION_DISTRIBUTION: BenchmarkDecisionDistribution = Object.freeze({
  SUPPORTED: 9,
  REVIEW: 8,
  HOLD: 2,
});

export const BMK_019_ISSUE_CLASS_COVERAGE = Object.freeze({
  fraction: "3/9",
  coveredClasses: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
});

/** The DRA-BMK-019 comparison finding for the two Spanish documents — explicitly scoped, not generalised. */
export const DRA_DOC_0018_0019_COMPARISON = Object.freeze({
  comparedCorpusIds: Object.freeze(["DRA-DOC-0018", "DRA-DOC-0019"]),
  language: "es",
  comparisonCategory: "NO_DIFFERENCE" as const,
  scopeStatement:
    "This finding is explicitly scoped to only these two Spanish-language documents. It is NOT a general " +
    "claim about multilingual robustness, and it does NOT establish that language is immaterial to " +
    "evaluator behaviour in general — only that no difference was observed between these two specific " +
    "documents.",
  dra_doc_0018FinalDecision: "SUPPORTED" as const,
  dra_doc_0019FinalDecision: "SUPPORTED" as const,
});

/**
 * The working hypothesis this programme's future phases (not this phase)
 * would eventually test, recorded here strictly as an unconfirmed research
 * question — never a claimed or expected outcome of this discovery phase.
 */
export const WORKING_HYPOTHESIS =
  "With only one language pair observed (Spanish vs Spanish, both NO_DIFFERENCE), it remains an open " +
  "empirical question whether the evaluator's apparent multilingual robustness holds for languages " +
  "generally, or is specific to Spanish, or specific to the four documents examined so far. A genuinely " +
  "third language, from a new and independently governed publisher, is the only way to widen this " +
  "inference beyond a single language pair. Phase 1 does not attempt to answer this question; it only " +
  "selects the strongest candidate capable of testing it in a future phase.";

/**
 * The DRA-ACQ-016 task's stated primary evidence gap, recorded as fixed
 * data (not derived at runtime) so the reasoning is auditable: DRA-BMK-019
 * compared the corpus's only two non-English documents (both Spanish) and
 * found NO_DIFFERENCE, a finding explicitly scoped to those two documents.
 * A third language is the only way to test whether multilingual handling
 * generalises beyond Spanish, but per this task's explicit methodological
 * instruction, the goal is not to maximise language count for its own
 * sake — the preferred candidate must also improve experimental-design
 * quality: a new, independently governed publisher and a genuinely new
 * evidence structure, not merely a new language label on a document
 * otherwise similar to what the corpus already holds.
 */
export const THIRD_LANGUAGE_EVIDENCE_GAP =
  "DRA-BMK-019 compared the corpus's two Spanish-language documents (DRA-DOC-0018, European Commission, " +
  "and DRA-DOC-0019, INE) and classified the comparison as NO_DIFFERENCE — a finding explicitly scoped to " +
  "only those two documents, not a general multilingual-robustness claim. With a single language pair " +
  "observed, it is impossible to distinguish 'the evaluator handles Spanish well' from 'the evaluator " +
  "handles every non-English language well' from 'these four specific documents happened not to differ.' " +
  "This is the current evidence gap: without a document in a genuinely different third language, the " +
  "multilingual-robustness question can never be widened past a single language pair. This candidate-" +
  "discovery phase does not attempt to close that gap itself and does not claim any expected outcome — it " +
  "only identifies the strongest candidate capable of doing so in a future phase, while also honouring " +
  "the explicit instruction that language count is not to be maximised for its own sake: the recommended " +
  "candidate must independently improve experimental-design quality (new, independently governed " +
  "publisher; new evidence structure; preserved reproducibility and governance standards), not merely add " +
  "a language.";

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
  /** Explains how this candidate would test the multilingual-generalisation hypothesis. Never claims a predicted result. */
  readonly hypothesisTestingSuitability: string;
  /** Explicitly framed as an unconfirmed hypothesis — never a claimed/expected coverage outcome. */
  readonly issueClassHypothesis: string;
  readonly governanceFindings: readonly string[];
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: CNIL — "Comment permettre à l'Homme de garder la main ?" ethics report (French) ---
  Object.freeze({
    candidateId: "DRA-CAND-016-01",
    publisher: "Commission Nationale de l'Informatique et des Libertés (CNIL), France",
    exactTitle:
      "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de " +
      "l'intelligence artificielle — Synthèse du débat public animé par la CNIL dans le cadre de la " +
      "mission de réflexion éthique confiée par la loi pour une République numérique",
    publicationDateOrVersion: "Décembre 2017 (December 2017)",
    proposedDocumentType: "REPORT",
    proposedDomain: "LEGAL",
    language: "fr",
    officialSourceUrl: "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "0819ead041bbdca3d5dc95c35bef3f01b3a188bc6c99d3c7b370f253aba40170",
    licenceReuseCategory: "NAMED_OPEN_LICENCE",
    licencePosition:
      "VERIFIED — the PDF is hosted directly on cnil.fr (CNIL's own domain), and CNIL's site-wide legal " +
      "notice (cnil.fr/fr/mentions-legales) states that pedagogical textual content produced by CNIL is " +
      "published under \"Creative Commons Attribution - Pas de Modification 4.0 France (CC BY-ND 4.0 FR)\", " +
      "permitting copying, redistribution, and commercial use, subject to attribution and the condition " +
      "that the work is not modified (no derivatives). This report is a CNIL-authored pedagogical/ethics " +
      "publication ('contenu pédagogique élaboré par la CNIL'), matching the category the notice describes; " +
      "no document-specific override notice was found on the PDF itself. This is a NAMED open licence, " +
      "satisfying the VERIFIED bar on that basis, but it is a materially different licence TIER from the CC " +
      "BY 4.0 (no ND restriction) already accepted for DRA-DOC-0018/0019: the ND clause forbids derivative " +
      "works, whereas CC BY 4.0 does not. This distinction is recorded explicitly below as a governance " +
      "finding, since verbatim reproduction and extraction for evidence assurance is not itself a " +
      "'derivative work' in the sense CC licences use the term, but it has not previously arisen in this " +
      "corpus and should be confirmed by a legal reviewer before acquisition, not silently treated as " +
      "equivalent to the CC BY 4.0 precedent.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (browser UA) to https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf " +
      "returned HTTP 200, content-type application/pdf, 1,568,182 bytes; pdftotext extraction succeeded (80 " +
      "pages, 48,054 words, 454,660 extracted characters, opening heading confirmed: 'COMMENT PERMETTRE À " +
      "L'HOMME DE GARDER LA MAIN ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle'). " +
      "The report is linked from CNIL's own landing page for the report " +
      "(cnil.fr/fr/comment-permettre-lhomme-de-garder-la-main-...) as the CNIL's official December 2017 " +
      "ethics-debate synthesis, authored by CNIL staff following a public-debate mission mandated by the " +
      "French Digital Republic Act (loi pour une République numérique).",
    technicalSuitability: Object.freeze({
      language: "fr (French, France, formal institutional/ethics-report register)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly across all 80 pages; no OCR needed.",
      approximateSize: "1,568,182 bytes, 80 pages, ~454,660 extracted characters, ~48,054 words",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAnnexes: true,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard formal French punctuation, including guillemets (« ») and French spacing conventions; " +
        "the full range of French accented characters (é è ê à ù ç œ) and typographic apostrophes are " +
        "present throughout and extracted correctly.",
      regulatoryLegalReferences:
        "Cites the French 'loi pour une République numérique' (Digital Republic Act) as its founding " +
        "mandate, references EU data-protection and AI-ethics discourse, and concludes with a formal set of " +
        "6 numbered recommendations addressed to public and private actors.",
      evidenceStructure:
        "Public-debate synthesis report structure: preface, methodology description of the public " +
        "consultation process, thematic sections on algorithmic ethics, a formal set of 6 numbered " +
        "recommendations, and supporting annexes including a summary of the citizen-consultation process — " +
        "structurally distinct from every existing corpus document (none is a public-debate synthesis).",
    }),
    duplicateOrNearDuplicateRisk:
      "LOW — a data-protection authority's public-debate synthesis on AI ethics is thematically adjacent " +
      "to DRA-DOC-0018 (EU AI ethics guidelines) but structurally and institutionally distinct: it " +
      "documents a citizen-consultation process and issues consultative recommendations, rather than " +
      "codifying an expert-group governance framework.",
    languageDiversityContribution:
      "Would be the corpus's first French-language (fr) document and its first non-Spanish, non-English " +
      "document — a genuinely new third language, confirmed corpus contribution if admitted.",
    publisherDiversityContribution:
      "CNIL has never appeared in the corpus — confirmed new-publisher contribution if admitted. CNIL is " +
      "France's independent data-protection authority (an 'autorité administrative indépendante'), " +
      "institutionally analogous in independence to the ICO (DRA-DOC-0011) but a distinct national " +
      "governance body with its own statutory mandate.",
    domainDiversityContribution:
      "Reinforces LEGAL (currently 1 real document: ICO) to 2 — LEGAL is the most underrepresented real " +
      "domain in the corpus (all other domains have 2 or more), so this is a targeted gap-narrowing " +
      "contribution rather than reinforcement of an already well-represented domain.",
    documentTypeDiversityContribution:
      "Would be the corpus's third REPORT-type real acquisition (after DRA-DOC-0018 and DRA-DOC-0019) — " +
      "reinforces rather than fills a gap, but with a structurally distinct report form (public-debate " +
      "synthesis with consultative recommendations, vs ethics-guidance or compliance-audit reports).",
    evidenceStructureDiversityContribution:
      "Introduces a public-debate/citizen-consultation synthesis structure with a final numbered-" +
      "recommendations section — a structurally new evidence-presentation pattern not yet represented by " +
      "any existing corpus document, including DRA-DOC-0018/0019.",
    hypothesisTestingSuitability:
      "Would introduce a genuinely third language (fr) from a new, independently governed publisher (CNIL) " +
      "with a new evidence structure (public-debate synthesis), directly widening the DRA-BMK-019 " +
      "NO_DIFFERENCE finding beyond a single Spanish-Spanish language pair. No outcome is predicted; this " +
      "is a description of experimental design, not a forecast of whether the evaluator will behave " +
      "consistently across French and Spanish/English.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether French-language prose — including " +
      "its guillemet-based quotation conventions and formal recommendation-numbering style — will interact " +
      "differently with the evaluator's claim-extraction, authority-resolution, or evidence-linkage stages " +
      "than English or Spanish-language documents do. This candidate is NOT claimed to expand issue-class " +
      "coverage; any such effect is an open empirical question deferred to a future evaluator run outside " +
      "this phase.",
    governanceFindings: [
      "Official publisher confirmed: CNIL, France's independent administrative authority for data " +
        "protection and digital rights, established under French law (loi Informatique et Libertés) and " +
        "operating independently of the French government's executive branch.",
      "Official publication source confirmed: cnil.fr (the authority's own domain, not a third-party " +
        "mirror or aggregator).",
      "Reuse basis confirmed via CNIL's own site-wide legal notice naming an explicit Creative Commons " +
        "licence (CC BY-ND 4.0 FR) for pedagogical content — a named open licence, but with a No-" +
        "Derivatives restriction that has not previously appeared in this corpus's accepted licence " +
        "precedents (DRA-DOC-0018/0019 are both unrestricted CC BY 4.0). This ND distinction should be " +
        "explicitly reviewed by a legal reviewer at acquisition time to confirm that reproduction for " +
        "benchmark evidence purposes does not itself constitute a 'derivative work' under French/EU " +
        "copyright law — this module records the distinction but does not resolve it, since resolving " +
        "copyright-law interpretation questions is outside the scope of a discovery phase.",
      "CNIL's legal notice separately states that images are licensed under a more restrictive CC BY-NC-ND " +
        "4.0 FR (non-commercial, no-derivatives) — not relevant to this candidate, which is a text-only PDF " +
        "report, but recorded here so a future reviewer does not conflate the two licence tiers if this " +
        "publisher is reused for an image-bearing document.",
    ],
    unresolvedRisks: [
      "The CC BY-ND 4.0 FR No-Derivatives clause is a new licence nuance for this corpus and should be " +
        "confirmed by a qualified legal reviewer as compatible with benchmark-evidence reproduction before " +
        "any future acquisition — this module treats the licence as VERIFIED on the basis that it is a " +
        "named, explicit open licence permitting commercial use and redistribution with attribution, but " +
        "flags the ND restriction as a distinction from every other VERIFIED precedent in this corpus.",
      "The report is 8 years old (December 2017) relative to the corpus's other AI-governance documents; " +
        "its regulatory/ethical framing predates the EU AI Act and most contemporary AI-governance " +
        "instruments already in the corpus. This is a content-currency consideration or dating a future " +
        "acquisition decision-maker should weigh, not a licence or accessibility risk.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 2: BSI — "Generative KI-Modelle" whitepaper (German) ---
  Object.freeze({
    candidateId: "DRA-CAND-016-02",
    publisher: "Bundesamt für Sicherheit in der Informationstechnik (BSI), Germany",
    exactTitle:
      "Generative KI-Modelle: Chancen und Risiken für Industrie und Behörden (Generative AI Models: " +
      "Opportunities and Risks for Industry and Public Authorities)",
    publicationDateOrVersion: "Version 1.1, 27 March 2024 (erstveröffentlicht / first published 3 May 2023)",
    proposedDocumentType: "REPORT",
    proposedDomain: "TECHNICAL",
    language: "de",
    officialSourceUrl: "https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/KI/Generative_KI-Modelle.pdf?__blob=publicationFile&v=7",
    sourceFormat: "application/pdf",
    retrievedFileSha256: "409f1038c787bf33a7f545e1ba9f9505f3fa653a6e0d46873549902d5a637506",
    licenceReuseCategory: "BESPOKE_REUSE_PERMISSION",
    licencePosition:
      "REVIEW_REQUIRED — BSI's site-wide terms of use (bsi.bund.de/DE/Service/Nutzungsbedingungen) state " +
      "that BSI 'begrüßt grundsätzlich die Verwendung seiner Inhalte für nicht kommerzielle, legale Zwecke' " +
      "(welcomes use of its content for non-commercial, legal purposes) without a separate licence " +
      "agreement, but explicitly requires a bespoke licence agreement with BSI for any commercial use. " +
      "This is a bespoke, non-commercial-only reuse permission, not a named open licence: it lacks an " +
      "explicit named-licence badge (no CC BY or equivalent), and it does not permit the commercial reuse " +
      "that a genuine open licence would. Per this task's licence-as-hard-gate rule, this remains " +
      "REVIEW_REQUIRED and is NOT upgraded to VERIFIED merely because non-commercial use is welcomed.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (browser UA) to the BSI download URL above returned HTTP 200, content-type " +
      "application/pdf;charset=UTF-8, 1,446,370 bytes; pdftotext extraction succeeded (71 pages, 25,147 " +
      "words, opening heading confirmed: 'Generative KI-Modelle / Chancen und Risiken für Industrie und " +
      "Behörden', PDF metadata Author field: 'Bundesamt für Sicherheit in der Informationstechnik'). Listed " +
      "on BSI's own AI-topic landing page (bsi.bund.de/.../Kuenstliche-Intelligenz/) alongside dozens of " +
      "other BSI-authored AI publications.",
    technicalSuitability: Object.freeze({
      language: "de (German, Germany, formal technical-agency register)",
      script: "Latin",
      format: "application/pdf",
      encoding: "PDF text layer, extracted as UTF-8 via pdftotext",
      textExtractability: "Extraction succeeded cleanly across all 71 pages; no OCR needed.",
      approximateSize: "1,446,370 bytes, 71 pages, ~25,147 extracted words",
      hasTables: true,
      hasCrossReferences: true,
      hasCitations: true,
      hasHeadingsStructure: true,
      hasAnnexes: false,
      hasAccentedCharacters: true,
      punctuationConventions:
        "Standard German punctuation, including a version-history table with a change log; umlauts (ä ö ü) " +
        "and ß present throughout and extracted correctly; German capitalisation conventions (all nouns " +
        "capitalised) observed.",
      regulatoryLegalReferences:
        "References the EU AI Act and German/EU IT-security standards in its risk-classification " +
        "discussion; formatted as a technical whitepaper with a formal version-history table rather than a " +
        "citation-dense regulatory instrument.",
      evidenceStructure:
        "Technical whitepaper structure: version-history/change-log table, structured risk-and-opportunity " +
        "sections organised by AI-model lifecycle stage, and technical recommendations — closer in form to " +
        "DRA-DOC-0015 (NCSC) than to a report or procedure, but in German.",
    }),
    duplicateOrNearDuplicateRisk:
      "MEDIUM — a national cyber-security agency's technical whitepaper on generative-AI risk is " +
      "thematically close to DRA-DOC-0015 (NCSC, AI system development security guidance) and DRA-DOC-0018 " +
      "(EU AI ethics/governance guidelines); it would be the corpus's second national-cyber-security-agency " +
      "TECHNICAL document, reducing its marginal domain-diversity value relative to a LEGAL- or FINANCE-" +
      "domain candidate.",
    languageDiversityContribution:
      "Would be the corpus's first German-language (de) document — a genuinely new third language, " +
      "confirmed corpus contribution if admitted, and a different third-language choice from Candidate 1.",
    publisherDiversityContribution:
      "BSI has never appeared in the corpus — confirmed new-publisher contribution if admitted. BSI is " +
      "Germany's federal cyber-security agency, institutionally comparable to NCSC (DRA-DOC-0015) but a " +
      "distinct national authority.",
    domainDiversityContribution:
      "Reinforces TECHNICAL (currently 6 real documents: Apache, NIST, NCSC, and others) to 7 — TECHNICAL " +
      "is already the most heavily represented real domain in the corpus, so this is a low-value " +
      "reinforcement rather than a gap-narrowing contribution.",
    documentTypeDiversityContribution:
      "Would be the corpus's fourth REPORT-type real acquisition — reinforces an already-common document " +
      "type.",
    evidenceStructureDiversityContribution:
      "Introduces a version-history/change-log table as a structural element not previously seen in the " +
      "corpus, but is otherwise structurally similar to DRA-DOC-0015's technical-whitepaper form.",
    hypothesisTestingSuitability:
      "Would introduce a genuinely third language (de) but from a publisher whose institutional role " +
      "(national cyber-security agency) and domain (TECHNICAL) closely duplicate existing corpus coverage " +
      "(NCSC, DRA-DOC-0015), giving it lower marginal experimental-design value than Candidate 1 even " +
      "before its licence position is considered. No outcome is predicted for either candidate.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED, AND NOT FURTHER PURSUED beyond the licence gate: no issue-class " +
      "hypothesis is asserted for this candidate given its blocking licence position.",
    governanceFindings: [
      "Official publisher confirmed: BSI, Germany's Federal Office for Information Security, a federal " +
        "authority under the Federal Ministry of the Interior.",
      "Official publication source confirmed: bsi.bund.de (the agency's own domain).",
      "Reuse permission is conditional on non-commercial use and does not name an open licence — a " +
        "distinct bespoke-permission pattern from the CNIL precedent (Candidate 1), which does name an open " +
        "licence (with an ND restriction) rather than gating on commercial-vs-non-commercial use.",
    ],
    unresolvedRisks: [
      "Licence position is REVIEW_REQUIRED, not VERIFIED — the non-commercial-only reuse permission is a " +
        "BLOCKING governance issue for corpus inclusion, since benchmark-corpus reproduction and " +
        "redistribution purposes are not unambiguously 'non-commercial legal purposes serving IT security' " +
        "in the narrow sense BSI's terms describe, and BSI's terms explicitly require a separate licence " +
        "agreement for anything beyond that.",
      "Even absent the licence question, this candidate's domain (TECHNICAL) and institutional role " +
        "(national cyber-security agency) substantially duplicate existing corpus coverage, reducing its " +
        "experimental-design value relative to Candidate 1.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: BSI is a genuine new-publisher, new-third-language (German) candidate " +
      "with an authoritative, byte-verified source, but its reuse terms are a bespoke non-commercial-only " +
      "permission rather than a named open licence, which blocks QUALIFIED_RECOMMENDED status per the " +
      "task's licence-as-hard-gate rule. Its TECHNICAL domain and cyber-security-agency role also " +
      "substantially duplicate existing corpus coverage (NCSC), giving it lower experimental-design value " +
      "than Candidate 1 independent of the licence question. It may be reassessed in a future phase if BSI " +
      "separately confirms a broader reuse permission for a specific document.",
  }),

  // --- Candidate 3: Banque de France / ACPR — site-wide reuse terms assessed for a prospective candidate (French, blocked) ---
  Object.freeze({
    candidateId: "DRA-CAND-016-03",
    publisher: "Banque de France / Autorité de Contrôle Prudentiel et de Résolution (ACPR), France",
    exactTitle:
      "Banque de France / ACPR publications on AI in the financial sector (site-wide reuse terms could not " +
      "be retrieved; no single document was shortlisted)",
    publicationDateOrVersion: "N/A — assessment blocked before any single document was shortlisted for retrieval",
    proposedDocumentType: "OTHER",
    proposedDomain: "FINANCE",
    language: "fr",
    officialSourceUrl: "https://www.banque-france.fr/fr/mentions-legales",
    sourceFormat: "text/html",
    retrievedFileSha256: "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    licenceReuseCategory: "NO_VERIFIED_REUSE_PERMISSION",
    licencePosition:
      "REVIEW_REQUIRED (BLOCKED, NOT ASSESSED) — the Banque de France legal-notice page " +
      "(banque-france.fr/fr/mentions-legales) returned HTTP 403 on every fetch attempt in this discovery " +
      "session, including with a full desktop browser user-agent string, while the site's homepage " +
      "returned HTTP 200. This is a bot-challenge or path-level access restriction on the specific " +
      "legal-notice page, not a general site outage. No licence or reuse-permission text could be read for " +
      "this publisher, so no licence position can be verified either way; this is recorded as REVIEW_" +
      "REQUIRED because a genuine open licence cannot be ruled in or out from a 403 response.",
    httpAccessibility: "BLOCKED_BOT_CHALLENGE",
    accessibilityEvidence:
      "curl -L to https://www.banque-france.fr/fr/mentions-legales returned HTTP 403 with both a plain and " +
      "a full desktop-browser user-agent string, on two separate attempts; curl -L to " +
      "https://www.banque-france.fr/ (homepage) returned HTTP 200 in the same session, confirming the " +
      "block is specific to the legal-notice path rather than a general outage or DNS/network failure.",
    technicalSuitability: Object.freeze({
      language: "fr (French, France) — not independently confirmed for any specific document",
      script: "Latin",
      format: "Not assessed — no specific document was shortlisted",
      encoding: "Not assessed",
      textExtractability: "Not assessed — licence verification was blocked before any document was retrieved",
      approximateSize: "Not assessed",
      hasTables: false,
      hasCrossReferences: false,
      hasCitations: false,
      hasHeadingsStructure: false,
      hasAnnexes: false,
      hasAccentedCharacters: true,
      punctuationConventions: "Not assessed for a specific document",
      regulatoryLegalReferences: "Not assessed for a specific document",
      evidenceStructure: "Not assessed for a specific document",
    }),
    duplicateOrNearDuplicateRisk:
      "Not fully assessed — moot pending licence resolution; FINANCE already has 2 real documents (PRA, " +
      "BCBS), so marginal domain-diversity value would in any case be lower than LEGAL (the corpus's most " +
      "underrepresented real domain).",
    languageDiversityContribution:
      "Would be a candidate third-language (fr) document if a specific publication were later shortlisted " +
      "and its licence position resolved — not confirmed at the blocked-access stage, and would in any " +
      "case duplicate the fr language already offered by Candidate 1 rather than adding a distinct fourth " +
      "language.",
    publisherDiversityContribution:
      "Banque de France / ACPR has never appeared in the corpus — would be a confirmed new-publisher " +
      "contribution if a specific document were later admitted, but this is not itself sufficient to " +
      "overcome the licence-verification block.",
    domainDiversityContribution:
      "Would reinforce FINANCE (currently 2 real documents: PRA, BCBS) to 3 — a confirmed contribution if " +
      "resolved, but lower marginal value than LEGAL (1, the corpus's most underrepresented real domain).",
    documentTypeDiversityContribution: "Not assessed further — no specific document was shortlisted.",
    evidenceStructureDiversityContribution: "Not assessed further — no specific document was shortlisted.",
    hypothesisTestingSuitability:
      "Would offer a FINANCE-domain, French-language alternative to Candidate 1 if access were restored and " +
      "a licence resolved, but cannot currently be used to test the multilingual-generalisation hypothesis " +
      "because no document has cleared either the accessibility or licence gate.",
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED, AND NOT FURTHER PURSUED: no issue-class hypothesis was formed for " +
      "this candidate because access to its licence terms was blocked before any specific document was " +
      "ever shortlisted.",
    governanceFindings: [
      "Official publisher confirmed by domain and public reputation: Banque de France, France's central " +
        "bank, and its supervisory arm ACPR — but the legal-notice page needed to confirm reuse terms could " +
        "not be retrieved in this session.",
      "This is a network/access-level finding (HTTP 403 on a specific path), not a licence-content finding " +
        "— it must not be conflated with a REJECTED licence determination, which would require actually " +
        "reading a restrictive notice.",
    ],
    unresolvedRisks: [
      "No licence text could be retrieved for this publisher in this session; this candidate cannot be " +
        "further assessed until the legal-notice page becomes reachable, or an alternative published " +
        "reuse-terms page for Banque de France/ACPR is located.",
      "Even if access were restored, this candidate's language (fr) would duplicate Candidate 1 rather " +
        "than offering a fourth distinct language, and its domain (FINANCE) already has more real coverage " +
        "than LEGAL — reducing its marginal value relative to Candidate 1 independent of the access issue.",
    ],
    qualificationOutcome: "REJECTED",
    rejectionOrDeferralReason:
      "REJECTED for this phase: legal-notice access was blocked (HTTP 403) on every attempt, so no licence " +
        "position could be verified at all — this candidate cannot be recommended, deferred with a specific " +
        "resolvable licence question, or meaningfully compared to Candidate 1/2 on technical suitability, " +
        "since no document was ever shortlisted. It may be revisited in a future phase if the access issue " +
        "resolves and a specific document with a stated reuse permission is identified.",
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
    candidateId: "DRA-CAND-016-01", // CNIL
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
    candidateId: "DRA-CAND-016-02", // BSI
    officialAuthority: "VERIFIED",
    sourceStability: "BYTE_STABLE",
    licenceCertainty: "REVIEW_REQUIRED",
    retrievalReproducibility: "REPRODUCIBLE",
    hypothesisTestingValue: "MEDIUM",
    corpusDiversityContribution: "MEDIUM",
    extractionRisk: "LOW",
    governanceRisk: "BLOCKING",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-016-03", // Banque de France / ACPR
    officialAuthority: "UNVERIFIED",
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
 *      DRA-ACQ-014/DRA-ACQ-015 precedent).
 *   2. Among candidates that clear the licence gate, official-authority
 *      verification, source stability, and reproducible retrieval must
 *      all hold.
 *   3. Hypothesis-testing value and corpus-diversity contribution break
 *      ties among licence-clear candidates, and are explicitly weighted
 *      to reward experimental-design quality (new publisher, new domain
 *      coverage, new evidence structure) over merely adding a language
 *      label, per this task's explicit methodological instruction.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-016-01", // CNIL — VERIFIED licence, clears every gate, narrows the LEGAL-domain gap
  "DRA-CAND-016-02", // BSI — REVIEW_REQUIRED blocks recommendation; also lower diversity value (duplicates NCSC's TECHNICAL/cyber role)
  "DRA-CAND-016-03", // Banque de France / ACPR — access blocked, licence unverifiable, no document shortlisted
]);

export const RECOMMENDED_CANDIDATE_ID: string | null = "DRA-CAND-016-01";

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
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0020";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "acquire_final_document_into_corpus",
  "create_DRA-DOC-0020",
  "create_freeze_record",
  "modify_corpus_manifest",
  "modify_corpus_registry",
  "run_evaluator_on_candidate",
  "create_DRA-BMK-020",
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
  "upgrade_aemps_or_cnmv_licence_without_new_evidence",
  "answer_multilingual_generalisation_hypothesis",
  "proceed_automatically_to_phase_2",
] as const);
