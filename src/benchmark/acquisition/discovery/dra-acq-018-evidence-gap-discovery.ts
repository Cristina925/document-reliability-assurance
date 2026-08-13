/**
 * DRA-ACQ-018 — Phase 1: Evidence-Gap Candidate Discovery and Qualification
 * for DRA-DOC-0022
 *
 * Governed, reproducible candidate-discovery and qualification evidence
 * package for the twenty-second corpus document, following the pattern
 * established by DRA-ACQ-013/014/015/016/017 (`dra-acq-01{3,4,5,6,7}-*`).
 *
 * CONTEXT — this programme deliberately returns to corpus-growth-by-gap
 * rather than continuing the just-closed EN/ES parallel-language
 * investigation (DRA-BMK-021, DRA-CHK-003, DRA-CHK-004, DRA-ENG-012,
 * DRA-ENG-013, DRA-ENG-014, DRA-ENG-014A, DRA-CHK-005). That branch is
 * CLOSED for now; DRA-CHK-005 concluded SYSTEMATIC_ENGLISH_LEXICAL_
 * COVERAGE_PATTERN / DOCUMENTED_LANGUAGE_LIMITATION and did NOT recommend
 * an evaluator fix, version bump, or further language acquisition in this
 * phase.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 *
 * Current admitted corpus: 21 documents (DRA-DOC-0001–0021).
 * Current 21-document decision distribution: SUPPORTED 10 / REVIEW 9 / HOLD 2.
 * Issue-class coverage: 3/9 (IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE,
 * IC-7 CLAIM_INCONSISTENCY). DRA-CHK-002 established the other six classes
 * are STRUCTURALLY_UNREACHABLE under the frozen Version 1 pipeline — this
 * programme does NOT chase them.
 *
 * PURPOSE — return to corpus growth: find and qualify the strongest
 * available candidate for DRA-DOC-0022 that increases the scientific value
 * and representativeness of the benchmark, without simply increasing
 * document count and without automatically continuing the EN/ES/FR
 * language experiment.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This module
 * does not download-and-freeze, admit, or evaluate any document. It does
 * not create DRA-DOC-0022, a new freeze record, a new registry entry, or
 * DRA-BMK-022, and it does not modify evaluator 0.1.2, Stage 4, Stage 5,
 * normalisation, or any existing frozen artefact. See the accompanying test
 * file and PHASE_1_PROHIBITED_ACTIONS below for explicit assertions of that
 * constraint.
 *
 * This module records:
 *
 *   1. A reconstructed profile of the current 21-document corpus, computed
 *      from authoritative repository field values (DRA-BMK-021 checkpoint
 *      entries and the DRA-ACQ-013/014/017 discovery-precedent inventories),
 *      not from narrative memory.
 *   2. A ranked evidence-gap analysis following the exact priority
 *      dimensions given by the DRA-ACQ-018 task specification (Part 2,
 *      items 1–10), fixed BEFORE candidate scoring.
 *   3. A candidate shortlist of five genuinely researched, real,
 *      official-source documents, each independently live-verified today
 *      (HTTP fetch, licence-page inspection, and — for the top-ranked
 *      candidate — a repeated byte-identical fetch).
 *   4. A governance pre-screen and a transparent, pre-declared 9-dimension
 *      diversity/novelty score (fixed weights, documented BEFORE scoring;
 *      never adjusted after seeing which candidate wins).
 *   5. A qualitative acquisition-cost/value assessment.
 *   6. A deterministic ranking, a Phase 1 qualification decision for the
 *      primary candidate, two alternates, an H22 hypothesis (framed as an
 *      open question, never a predicted decision or issue-class outcome),
 *      and a proposed (not executed) Phase 2 plan.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Reconstructed 21-document corpus profile
// ---------------------------------------------------------------------------

export interface CorpusInventoryRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly language: string;
  readonly sourceFormat: "PDF" | "STATIC_HTML" | "MULTI_PAGE_HTML";
  readonly difficulty: "LOW" | "MEDIUM" | "HIGH";
  /** Whether this document originated from a real acquisition (DRA-ACQ-NNN) rather than the synthetic seed corpus. */
  readonly isRealAcquisition: boolean;
  readonly acquisitionId: string | null;
}

/**
 * Transcribed field-for-field from the authoritative sources: DRA-DOC-0001–
 * 0006 from `evidence/corpus-data.ts`; DRA-DOC-0007–0021 from the
 * DRA-BMK-021 checkpoint's canonical entries
 * (`execution/__tests__/dra-bmk-021-twentyone-document-checkpoint.test.ts`,
 * ENTRY_0007..ENTRY_0021), cross-checked against the DRA-ACQ-013/014/017
 * discovery-precedent inventories for publisher/domain/documentType/language
 * agreement. Not re-derived at runtime — this phase does not run the
 * evaluator or re-read the corpus registry.
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
]);

export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

function tally<K extends string>(
  rows: readonly CorpusInventoryRow[],
  field: "domain" | "documentType" | "publisher" | "language" | "sourceFormat" | "difficulty",
): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const key = row[field] as K;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export const REAL_DOMAIN_COUNTS: ReadonlyMap<Domain, number> = tally<Domain>(REAL_ACQUISITIONS, "domain");
export const REAL_DOCUMENT_TYPE_COUNTS: ReadonlyMap<DocumentType, number> = tally<DocumentType>(REAL_ACQUISITIONS, "documentType");
export const REAL_PUBLISHER_COUNTS: ReadonlyMap<string, number> = tally<string>(REAL_ACQUISITIONS, "publisher");
export const REAL_LANGUAGE_COUNTS: ReadonlyMap<string, number> = tally<string>(REAL_ACQUISITIONS, "language");
export const REAL_SOURCE_FORMAT_COUNTS: ReadonlyMap<string, number> = tally(REAL_ACQUISITIONS, "sourceFormat");
export const REAL_DIFFICULTY_COUNTS: ReadonlyMap<string, number> = tally(REAL_ACQUISITIONS, "difficulty");

export const DECISION_DISTRIBUTION_21_DOCS = Object.freeze({
  SUPPORTED: 10,
  REVIEW: 9,
  HOLD: 2,
});

export const ISSUE_CLASS_COVERAGE_21_DOCS = Object.freeze({
  observed: Object.freeze(["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"]),
  coverageFraction: "3/9",
  structurallyUnreachablePerChk002: Object.freeze([
    "UNSUPPORTED_CLAIM", "AUTHORITY_EXPIRED", "AUTHORITY_ABSENT",
    "EVIDENCE_CONFLICT", "TRACEABILITY_BROKEN", "SCOPE_VIOLATION",
  ]),
});

/** Domains at the current minimum real-acquisition count (the under-represented tier). */
export function leastRepresentedRealDomains(): readonly Domain[] {
  const allDomains: readonly Domain[] = ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"];
  const min = Math.min(...allDomains.map((d) => REAL_DOMAIN_COUNTS.get(d) ?? 0));
  return Object.freeze(allDomains.filter((d) => (REAL_DOMAIN_COUNTS.get(d) ?? 0) === min));
}

/** Publishers appearing more than once among real acquisitions (the corpus's only repeated publisher). */
export function repeatedRealPublishers(): readonly string[] {
  return Object.freeze([...REAL_PUBLISHER_COUNTS.entries()].filter(([, n]) => n > 1).map(([p]) => p));
}

/**
 * Free-text summary of the reconstructed 21-document corpus profile,
 * computed from the tallies above — recorded as a fixed narrative snapshot
 * for the Phase 1 report, not re-derived at report-generation time.
 */
export const CORPUS_PROFILE_SUMMARY = Object.freeze({
  totalDocuments: 21,
  realAcquisitions: 15,
  syntheticSeedDocuments: 6,
  domainCountsReal: "TECHNICAL 5, BUSINESS 2, GENERAL 2, LEGAL 2, FINANCE 2, HEALTHCARE 2 (TECHNICAL is the only domain above the 2-document floor; the other five domains are jointly least-represented)",
  documentTypeCountsReal: "REPORT 4, PROCEDURE 3, POLICY 3, OTHER 3, ARTICLE 1, SUMMARY 1 (REWRITE and EMAIL have zero real-acquisition representation, but neither is a realistic acquisition target)",
  languageCountsReal: "en 8, en-GB 4, es 2, fr 1 (all three non-English documents came from the closed EN/ES/FR investigation branch)",
  sourceFormatCountsReal: "PDF 12, MULTI_PAGE_HTML 2 (ICO, HSE), STATIC_HTML 1 (Apache)",
  difficultyCountsReal: "HIGH 7, MEDIUM 6, LOW 2",
  repeatedPublishers: "European Commission / HLEG-AI (DRA-DOC-0018, DRA-DOC-0021) is the corpus's only repeated publisher, and by design — it is the deliberate parallel-language pair. Every other real-acquisition publisher (13 distinct publishers across the other 13 documents) appears exactly once.",
  underrepresentedDimensions:
    "(a) domain balance — TECHNICAL (5) is markedly overrepresented relative to the other five domains (2 each), driven substantially by AI-governance subject matter (NIST, NCSC, and both EC/HLEG-AI editions); " +
    "(b) authority-type diversity — no environmental regulator, energy regulator, aviation/transport authority, or financial-conduct/enforcement authority has ever been represented; " +
    "(c) document-genre diversity — no formal enforcement/penalty decision, audit report, or dense indicator/annex-heavy scientific-monitoring report exists in the corpus; " +
    "(d) all TECHNICAL-domain real acquisitions except Apache and NCSC concentrate on AI governance specifically (NIST AI RMF, EC/HLEG-AI x2), an acknowledged over-concentration risk the task explicitly warns against deepening.",
});

// ---------------------------------------------------------------------------
// Part 2 — Ranked evidence-gap priorities (fixed BEFORE candidate search)
// ---------------------------------------------------------------------------

export interface EvidenceGapPriority {
  readonly rank: number;
  readonly key: string;
  readonly description: string;
  readonly currentState: string;
}

/**
 * Fixed data, not a runtime scoring function. Reproduces the DRA-ACQ-018
 * task's own ten candidate-contribution dimensions (Part 2), ranked in the
 * priority order this programme adopts given the reconstructed corpus
 * profile above — determined BEFORE any candidate was scored (Part 6 below
 * never re-orders this list after seeing results).
 */
export const EVIDENCE_GAP_PRIORITIES: readonly EvidenceGapPriority[] = Object.freeze([
  Object.freeze({
    rank: 1,
    key: "domain_balance_and_ai_governance_deconcentration",
    description: "New authority type / domain-balance improvement, explicitly away from AI governance.",
    currentState:
      "TECHNICAL holds 5 of 15 real acquisitions (33%) versus 2 each for the other five domains, and 3 of those 5 " +
      "TECHNICAL documents (NIST, EC/es, EC/en) are AI-governance subject matter specifically. The task explicitly " +
      "warns against deepening AI-governance overconcentration; a candidate outside TECHNICAL and outside AI " +
      "governance carries the highest marginal balancing value.",
  }),
  Object.freeze({
    rank: 2,
    key: "new_authority_type",
    description: "A materially different authority/institutional source not yet represented.",
    currentState:
      "13 distinct real-acquisition publishers exist, but every one is either a national regulator, a UK/US " +
      "healthcare or standards body, or an EU institution already covering AI-ethics/data-protection. No " +
      "environmental regulator, energy regulator, or financial-conduct enforcement authority has ever been " +
      "represented.",
  }),
  Object.freeze({
    rank: 3,
    key: "new_document_genre",
    description: "A document type/genre not yet represented (audit report, enforcement notice, formal decision, dense monitoring report).",
    currentState:
      "Real DocumentType coverage is REPORT 4, PROCEDURE 3, POLICY 3, OTHER 3, ARTICLE 1, SUMMARY 1 — every " +
      "existing document is a guidance, procedure, policy statement, or narrative report. No formal penalty/" +
      "enforcement decision, audit report, or indicator/annex-heavy scientific monitoring report exists.",
  }),
  Object.freeze({
    rank: 4,
    key: "new_structural_complexity",
    description: "New structural complexity: dense tables, annex-heavy publication, quantitative indicator frameworks.",
    currentState:
      "Existing structures observed: single-PDF policy/procedure documents, two multi-page HTML collections " +
      "(ICO, HSE), one static-HTML how-to article (Apache), and narrative REPORT-type documents (EC x2, INE, " +
      "CNIL). No document combines a formal methodology, a multi-indicator quantitative framework, and a " +
      "numbered technical annex in the way a scientific monitoring or audit report typically does.",
  }),
  Object.freeze({
    rank: 5,
    key: "reachable_issue_mechanism_value",
    description: "Value from exercising the 3 reachable issue classes (IC-4, IC-5, IC-7) in a new document context.",
    currentState:
      "Only IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, and IC-7 CLAIM_INCONSISTENCY are reachable per " +
      "DRA-CHK-002. A document with many quantitative, externally-sourced claims (statistics, indicators, " +
      "financial figures, dated findings) offers more opportunities to exercise these three mechanisms than a " +
      "principle- or procedure-oriented document, without any claim about the outcome.",
  }),
  Object.freeze({
    rank: 6,
    key: "difficulty_balance",
    description: "LOW/MEDIUM/HIGH balance rather than automatically choosing HIGH.",
    currentState: "Real acquisitions currently skew HIGH (7) and MEDIUM (6), with only 2 LOW documents (Acas, HSE).",
  }),
  Object.freeze({
    rank: 7,
    key: "independence_from_concentrated_publishers_domains",
    description: "Reduce dependence on already-well-represented publishers/domains.",
    currentState:
      "European Commission / HLEG-AI is the only repeated real-acquisition publisher (by deliberate design, the " +
      "EN/ES parallel pair); every other publisher appears once. A new, unrelated publisher preserves this " +
      "pattern rather than concentrating further on any single institution.",
  }),
  Object.freeze({
    rank: 8,
    key: "new_language",
    description: "A fourth language, only if it adds independent value beyond the closed EN/ES/FR branch.",
    currentState:
      "Per the DRA-ACQ-018 task specification, language is explicitly de-prioritised now that the EN/ES branch " +
      "has produced substantial evidence (DRA-CHK-003/004/005). A fourth language is not automatically valuable " +
      "and is not pursued as a primary criterion in this programme.",
  }),
  Object.freeze({
    rank: 9,
    key: "format_and_acquisition_infrastructure_value",
    description: "A new stable official publication format/infrastructure without unjustified engineering.",
    currentState:
      "PDF acquisition via DRA-ENG-009/011 is well-proven (12 of 15 real documents). A new PDF-hosting " +
      "institution adds infrastructure diversity at effectively zero new engineering cost; multi-page HTML has " +
      "already been demonstrated twice, so it is not itself a novel format at this point.",
  }),
  Object.freeze({
    rank: 10,
    key: "decision_boundary_value_unscored_in_advance",
    description: "Likely to exercise reachable mechanisms differently, but never chosen to target a predicted decision.",
    currentState:
      "Recorded last and explicitly not used to pre-select a candidate for an expected SUPPORTED/REVIEW/HOLD " +
      "outcome, per the task's explicit prohibition on choosing a document because a particular decision is " +
      "expected.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate shortlist
// ---------------------------------------------------------------------------

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED",
] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED", "BLOCKING"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["STRONG", "ACCEPTABLE", "WEAK", "UNKNOWN"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export interface DiversityNoveltyScore {
  readonly publisherNovelty: number;      // 0-3
  readonly domainNovelty: number;         // 0-3
  readonly documentTypeNovelty: number;   // 0-3
  readonly structuralNovelty: number;     // 0-3
  readonly languageNovelty: number;       // 0-2
  readonly difficultyBalance: number;     // 0-2
  readonly reachableIssueMechanismValue: number; // 0-2
  readonly governanceConfidence: number;  // 0-3
  readonly sourceStability: number;       // 0-2
  readonly total: number;                 // max 23
}

export interface CandidateRecord {
  readonly candidateId: string;
  readonly title: string;
  readonly publisher: string;
  readonly jurisdiction: string;
  readonly officialSourceUrl: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly language: string;
  readonly sourceFormat: string;
  readonly approximateSize: string;
  readonly publicationDate: string;
  readonly licenceReuseBasis: string;
  readonly stabilityObservations: string;
  readonly structuralCharacteristics: string;
  readonly likelyDifficulty: "LOW" | "MEDIUM" | "HIGH";
  readonly publisherNoveltyNote: string;
  readonly domainNoveltyNote: string;
  readonly documentTypeNoveltyNote: string;
  readonly structuralNoveltyNote: string;
  readonly expectedEvidenceContribution: string;
  readonly knownRisks: readonly string[];
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceReuseStatus: LicenceReuseStatus;
  readonly sourceStabilityStatus: SourceStabilityStatus;
  readonly httpAccessibility:
    | "VERIFIED_ACCESSIBLE"
    | "PARTIAL_LANDING_PAGE_ONLY"
    | "BLOCKED_NETWORK_LEVEL"
    | "BLOCKED_BOT_CHALLENGE"
    | "BLOCKED_CONNECTIVITY_TIMEOUT";
  readonly accessibilityEvidence: string;
  readonly acquisitionCost: "LOW" | "MEDIUM" | "HIGH";
  readonly acquisitionCostRationale: string;
  readonly diversityNoveltyScore: DiversityNoveltyScore;
  readonly issueClassHypothesis: string;
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

function scoreTotal(s: Omit<DiversityNoveltyScore, "total">): number {
  return (
    s.publisherNovelty + s.domainNovelty + s.documentTypeNovelty + s.structuralNovelty +
    s.languageNovelty + s.difficultyBalance + s.reachableIssueMechanismValue +
    s.governanceConfidence + s.sourceStability
  );
}

function withTotal(s: Omit<DiversityNoveltyScore, "total">): DiversityNoveltyScore {
  return Object.freeze({ ...s, total: scoreTotal(s) });
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  // --- Candidate 1: European Environment Agency — Tracking waste prevention progress (EEA Report 02/2023) ---
  Object.freeze({
    candidateId: "DRA-CAND-018-01",
    title: "Tracking waste prevention progress — A narrative-based waste prevention monitoring framework at the EU level (EEA Report 02/2023)",
    publisher: "European Environment Agency (EEA)",
    jurisdiction: "European Union",
    officialSourceUrl:
      "https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file",
    documentType: "REPORT",
    domain: "GENERAL",
    language: "en",
    sourceFormat: "application/pdf",
    approximateSize: "1,838,985 bytes; 94 PDF pages (25 numbered content pages plus front matter, annex, and reference sections)",
    publicationDate: "2023 (EEA Report 02/2023, ISBN 978-92-9480-556-0, doi:10.2800/612143)",
    licenceReuseBasis:
      "VERIFIED — the EEA's own legal notice (eea.europa.eu/en/legal-notice, modified 2 Jul 2026) states EEA " +
      "materials are published under CC BY 4.0 and \"may be re-used without prior permission, free of charge, " +
      "for commercial or non-commercial purposes, provided the EEA is always acknowledged.\" The report's own " +
      "front-matter copyright notice (\"© European Environment Agency, 2023. Reproduction is authorised provided " +
      "the source is acknowledged.\") does not narrow this. This is the same standard of evidence already " +
      "accepted for the EC/HLEG-AI candidate at DRA-ACQ-014 (an EU-institution-wide CC BY 4.0 policy statement, " +
      "not domain-name inference).",
    stabilityObservations:
      "Live-refetched today (curl, Chrome UA): HTTP 200, content-type application/pdf, 1,838,985 bytes on both " +
      "of two independent fetches, SHA-256 238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d on " +
      "both — BYTE_STABLE. content-disposition confirms the canonical filename " +
      "(TH-AL-23-002-EN-N_Tracking_waste_prevention_FINAL.pdf). Served from a CDN-fronted Plone/Volto CMS with " +
      "long cache TTLs, consistent with the corpus's other stable EU-institution PDF sources.",
    structuralCharacteristics:
      "A formal three-step methodology (narrative framework, data-availability mapping, RACER-criteria indicator " +
      "selection), an executive summary, per-cluster indicator results sections with quantitative tables, an " +
      "analysis/discussion section, an abbreviations list, a references section, and a numbered technical annex " +
      "(\"Annex 1 — All indicators and RACER evaluation results\"). This annex-plus-multi-indicator-table " +
      "structure is not represented by any existing corpus document.",
    likelyDifficulty: "HIGH",
    publisherNoveltyNote: "EEA has never appeared in the corpus — confirmed new-publisher contribution.",
    domainNoveltyNote:
      "Classified GENERAL (environmental-policy monitoring does not fit BUSINESS/TECHNICAL/LEGAL/HEALTHCARE/" +
      "FINANCE any more precisely, matching the precedent already used for CMA/INE). Reinforces GENERAL (2→3), " +
      "one of the five domains tied at the current floor, and — critically — does NOT reinforce TECHNICAL, the " +
      "corpus's only overrepresented domain, or AI-governance subject matter specifically.",
    documentTypeNoveltyNote:
      "Classified REPORT (already the most common real documentType at 4). The genre novelty is NOT in the " +
      "schema-level DocumentType label but in the underlying document kind — a quantitative environmental " +
      "monitoring/indicator report with a formal RACER-scored annex, structurally distinct from the three " +
      "existing REPORT documents (two AI-ethics guidance documents, one statistical peer-review report).",
    structuralNoveltyNote:
      "Introduces a multi-indicator quantitative scoring framework (RACER: Relevance, Acceptance, Credibility, " +
      "Ease, Robustness) with a dedicated results annex — a structurally new evidence-presentation pattern.",
    expectedEvidenceContribution:
      "Densely cites external national/EU datasets, named indicators, and a formal scoring methodology across " +
      "many short factual claims — a plausible new substrate for exercising IC-4/IC-5/IC-7 differently than " +
      "principle-oriented or procedural documents do. Framed strictly as an open question below.",
    knownRisks: [
      "This would be the corpus's first document whose primary subject is environmental/circular-economy policy " +
        "rather than AI governance, finance, healthcare, legal/regulatory process, or general competition/" +
        "statistics — the DocumentType and Domain schema enums have no bespoke category for it, so the GENERAL " +
        "classification is a judgement call to confirm explicitly at acquisition time.",
      "94 PDF pages is on the larger end of the corpus's existing HIGH-difficulty documents; extraction and " +
        "claim-volume behaviour at this length has precedent (DRA-DOC-0018/0021 are also large) but should be " +
        "reconfirmed at Phase 2.",
      "The report cites third-party research partners (IVL, VTT, VITO) as co-authors within an EEA-owned " +
        "publication; the CC BY 4.0 licence covers the EEA's own publication as a whole per its site-wide notice, " +
        "but this joint-authorship structure is a new pattern worth flagging (not previously seen with a single, " +
        "sole-author publisher).",
    ],
    officialSourceStatus: "VERIFIED",
    licenceReuseStatus: "VERIFIED",
    sourceStabilityStatus: "STRONG",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "curl -L (Chrome UA) HTTP 200, content-type application/pdf, content-length 1,838,985, " +
      "content-disposition inline with canonical filename; identical byte count and SHA-256 across two " +
      "independent fetches taken seconds apart today.",
    acquisitionCost: "LOW",
    acquisitionCostRationale:
      "Single stable PDF, well within existing pdftotext extraction precedent, no OCR needed, English-language " +
      "(no new normalisation-pipeline risk), CC BY 4.0 licence already accepted for an EU institution in this " +
      "corpus — no new engineering required.",
    diversityNoveltyScore: withTotal({
      publisherNovelty: 3,
      domainNovelty: 2,
      documentTypeNovelty: 1,
      structuralNovelty: 3,
      languageNovelty: 0,
      difficultyBalance: 1,
      reachableIssueMechanismValue: 2,
      governanceConfidence: 3,
      sourceStability: 2,
    }),
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis exists to predict whether a dense, indicator-and-annex-heavy " +
      "quantitative monitoring report will exercise IC-4/IC-5/IC-7 more, less, or differently than the corpus's " +
      "existing principle- and procedure-oriented documents. This candidate is NOT claimed to expand issue-class " +
      "coverage beyond 3/9; any such effect is an open empirical question deferred to a future evaluator run.",
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),

  // --- Candidate 2: Ofgem — New Successor Smart Meter Communication Licence (Decision) ---
  Object.freeze({
    candidateId: "DRA-CAND-018-02",
    title: "New Successor Smart Meter Communication Licence (Decision)",
    publisher: "Office of Gas and Electricity Markets (Ofgem)",
    jurisdiction: "United Kingdom",
    officialSourceUrl:
      "https://www.ofgem.gov.uk/sites/default/files/2026-04/Successor-Smart-Meter-Communication-Licence-Decision.pdf",
    documentType: "OTHER",
    domain: "GENERAL",
    language: "en-GB",
    sourceFormat: "application/pdf",
    approximateSize: "692,167 bytes; 76 PDF pages",
    publicationDate: "1 May 2026",
    licenceReuseBasis:
      "VERIFIED — Ofgem's site-wide copyright page (ofgem.gov.uk, \"Copyright\") states \"Material featured on " +
      "this website is subject to Crown copyright protection... you may use Crown copyright information... under " +
      "the terms of the Open Government Licence\", matching the precedent already accepted for Acas, HSE, and " +
      "MHRA (all UK Crown-copyright/OGL v3.0 sources).",
    stabilityObservations:
      "Live-fetched today (curl, Chrome UA): HTTP 200, content-type application/pdf, 692,167 bytes, etag present, " +
      "long cache TTL (max-age 2,592,000). Only a single fetch was performed in this phase; a repeated fetch to " +
      "confirm byte-identity is deferred to Phase 2 per the task's instruction to reserve two-fetch deterministic " +
      "acquisition for Phase 2.",
    structuralCharacteristics:
      "A formal regulatory-decision structure: background/consultation summary, numbered licence-condition " +
      "amendments, stakeholder-response analysis, and a decision rationale section citing the Gas Act 1986 / " +
      "Electricity Act 1989 licensing framework — a decision-genre structure not yet represented (existing " +
      "PRA/ICO/NCSC OTHER-type documents are guidance/framework documents, not licence-amendment decisions).",
    likelyDifficulty: "MEDIUM",
    publisherNoveltyNote: "Ofgem has never appeared in the corpus — confirmed new-publisher and new-authority-type (energy regulator) contribution.",
    domainNoveltyNote: "Classified GENERAL (energy-market licence regulation, similar in kind to the CMA precedent). Reinforces GENERAL (2→3).",
    documentTypeNoveltyNote: "Classified OTHER (already 3 real documents). Genre novelty: a formal licence-modification decision, not a guidance/framework document.",
    structuralNoveltyNote: "Numbered licence-condition amendment structure with consultation-response analysis — new in kind, though the same top-level 'regulatory document with legal citations' family as ICO/PRA.",
    expectedEvidenceContribution:
      "Cites specific consultation dates, named respondent categories, and statutory licence conditions — a " +
      "plausible substrate for evidence-linkage and consistency checks distinct from the corpus's existing " +
      "guidance documents.",
    knownRisks: [
      "Only a single live fetch was performed in this phase (not yet dual-fetch confirmed) — must be repeated " +
        "at Phase 2 before freeze eligibility.",
      "Licence verification relied on Ofgem's general site-wide copyright page, not a document-specific OGL " +
        "footer inside the PDF itself (unlike the MHRA/HSE precedent, which had an explicit in-document OGL " +
        "statement) — worth reconfirming directly on the document at Phase 2.",
      "The regulatory decision concerns a fairly narrow smart-meter-infrastructure licensing matter; its general " +
        "public interest and evidence density should be spot-checked against the alternative Ofgem decisions " +
        "surfaced during this search before final Phase 2 selection.",
    ],
    officialSourceStatus: "VERIFIED",
    licenceReuseStatus: "VERIFIED",
    sourceStabilityStatus: "ACCEPTABLE",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) HTTP 200, content-type application/pdf, content-length 692,167, etag present.",
    acquisitionCost: "LOW",
    acquisitionCostRationale: "Single stable PDF, English, standard UK-government OGL precedent already used three times in this corpus (Acas, HSE, MHRA) — no new engineering required.",
    diversityNoveltyScore: withTotal({
      publisherNovelty: 3,
      domainNovelty: 2,
      documentTypeNovelty: 2,
      structuralNovelty: 2,
      languageNovelty: 0,
      difficultyBalance: 1,
      reachableIssueMechanismValue: 2,
      governanceConfidence: 3,
      sourceStability: 1,
    }),
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: dense citation of consultation dates and licence conditions could " +
      "plausibly exercise IC-5/IC-7 differently than existing guidance documents; not verifiable without " +
      "post-admission evaluator execution, out of scope here.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended ahead of Candidate 1: lower diversity/novelty score (16 vs 17), driven mainly by weaker " +
      "source-stability evidence (single fetch only) and a document-type/domain contribution that, while solid, " +
      "reinforces GENERAL less distinctively than Candidate 1's structurally novel indicator-and-annex report. " +
      "Retained as a fully qualified alternate.",
  }),

  // --- Candidate 3: FCA — Final Notice (enforcement decision) ---
  Object.freeze({
    candidateId: "DRA-CAND-018-03",
    title: "Final Notice: Barclays plc (financial penalty under s.91 FSMA)",
    publisher: "Financial Conduct Authority (FCA)",
    jurisdiction: "United Kingdom",
    officialSourceUrl: "https://www.fca.org.uk/publication/final-notices/barclays-plc-2024.pdf",
    documentType: "OTHER",
    domain: "FINANCE",
    language: "en-GB",
    sourceFormat: "application/pdf",
    approximateSize: "704,844 bytes",
    publicationDate: "25 November 2024",
    licenceReuseBasis:
      "AMBIGUOUS/NOT_VERIFIED — the FCA's own legal-terms page (fca.org.uk/legal) states the Open Government " +
      "Licence applies ONLY to \"statistical outputs... published jointly by the FCA and the Bank of England " +
      "and/or the PRA\" and to charts/tables/datasets within the site's Data section; it explicitly states that " +
      "\"conditions 3.2 to 3.5... continue to apply to any narrative or explanatory text\" outside that scope. A " +
      "Final Notice is narrative enforcement text, not a Data-section statistical output, so it does NOT clearly " +
      "fall under the FCA's OGL carve-out; the default copyright terms (3.2–3.5) were not independently obtained " +
      "and read in this phase. This is a materially weaker licence position than the other candidates.",
    stabilityObservations:
      "Live-fetched today (curl, Chrome UA): HTTP 200, content-type application/pdf, 704,844 bytes, long cache " +
      "TTL (max-age 1,209,600), served via Cloudflare with cf-cache-status HIT. Single fetch only in this phase.",
    structuralCharacteristics:
      "A formal enforcement-decision structure unique among all shortlisted and existing corpus documents: " +
      "numbered statutory findings, a chronological facts section, a financial-penalty calculation methodology " +
      "citing the FCA's own penalty policy, and formal rights-of-referral text — an enforcement-notice genre " +
      "explicitly named in the task's own document-type examples.",
    likelyDifficulty: "MEDIUM",
    publisherNoveltyNote: "FCA has never appeared in the corpus — confirmed new-publisher and new-authority-type (financial-conduct enforcement) contribution.",
    domainNoveltyNote: "FINANCE domain (reinforces 2→3, tied floor).",
    documentTypeNoveltyNote: "Classified OTHER; genre is a formal enforcement/penalty notice — the single most novel document genre among the five candidates, matching the task's own suggested 'enforcement notice' category verbatim.",
    structuralNoveltyNote: "Numbered statutory-finding and penalty-calculation structure — not represented by any existing corpus document (PRA's OTHER-type document is a supervisory statement, not an individual enforcement action).",
    expectedEvidenceContribution:
      "Densely cites specific dates, monetary amounts, and statutory contravention findings — a strong candidate " +
      "substrate for evidence-linkage checks, but this is recorded strictly as an open question.",
    knownRisks: [
      "Licence position is the weakest of the five candidates: the OGL carve-out on fca.org.uk explicitly does " +
        "NOT extend to Final Notice narrative text, and the applicable default terms (conditions 3.2–3.5) were " +
        "not independently read and confirmed permissive in this phase — this is a material, not cosmetic, risk.",
      "Single fetch only; no dual-fetch stability confirmation performed in this phase.",
      "As an individual enforcement action against a named firm, a Final Notice carries different reputational/" +
        "sensitivity considerations than the corpus's existing institutional-guidance documents — worth an " +
        "explicit governance sign-off before any Phase 2 freeze, independent of the licence question.",
    ],
    officialSourceStatus: "VERIFIED",
    licenceReuseStatus: "NOT_VERIFIED",
    sourceStabilityStatus: "UNKNOWN",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) HTTP 200, content-type application/pdf, content-length 704,844, cf-cache-status HIT.",
    acquisitionCost: "MEDIUM",
    acquisitionCostRationale:
      "Technical acquisition is simple (single stable-looking PDF), but the licence ambiguity requires a " +
      "dedicated legal-review step before any freeze — an acquisition-cost driver distinct from technical " +
      "extraction cost.",
    diversityNoveltyScore: withTotal({
      publisherNovelty: 3,
      domainNovelty: 2,
      documentTypeNovelty: 3,
      structuralNovelty: 3,
      languageNovelty: 0,
      difficultyBalance: 1,
      reachableIssueMechanismValue: 2,
      governanceConfidence: 1,
      sourceStability: 1,
    }),
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: no basis to predict effect on IC-4/IC-5/IC-7; not scored further given " +
      "the governance blocker below.",
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended ahead of Candidate 1 or 2: despite the highest document-type and structural novelty score " +
      "of any candidate, its licence position is NOT_VERIFIED (materially weaker than Candidates 1–2's VERIFIED " +
      "CC BY 4.0/OGL positions) and would require dedicated legal review of the FCA's default narrative-content " +
      "terms before any Phase 2 acquisition could proceed. Retained as a fully-documented alternate given its " +
      "otherwise strong evidence-gap value, per the task's instruction to rank ambiguous licensing as a material " +
      "risk rather than an automatic disqualifier.",
  }),

  // --- Candidate 4: National Audit Office — Lessons learned value-for-money report ---
  Object.freeze({
    candidateId: "DRA-CAND-018-04",
    title: "Lessons learned: a planning and spending framework that enables long-term value for money",
    publisher: "National Audit Office (NAO)",
    jurisdiction: "United Kingdom",
    officialSourceUrl: "https://www.nao.org.uk/wp-content/uploads/2024/10/lessons-learned-a-planning-and-spending-framework.pdf",
    documentType: "REPORT",
    domain: "GENERAL",
    language: "en-GB",
    sourceFormat: "application/pdf",
    approximateSize: "Multi-page PDF (HC 234, Session 2024-25); exact byte count not captured in this phase",
    publicationDate: "24 October 2024 (Ordered by the House of Commons)",
    licenceReuseBasis:
      "REVIEW_REQUIRED (RECONFIRMED, consistent with the DRA-ACQ-003 finding on a different NAO document) — the " +
      "PDF's own front-matter states: \"The material... is subject to National Audit Office (NAO) copyright. The " +
      "material may be copied or reproduced for non-commercial purposes only... To reproduce NAO copyright " +
      "material for any other use, you must contact copyright@nao.org.uk\" — a bespoke, non-commercial-only " +
      "reuse notice, not a named open licence (no OGL/CC badge), and explicitly narrower than the OGL/CC BY 4.0 " +
      "positions verified for Candidates 1–2.",
    stabilityObservations: "Live-fetched today via web search result; HTTP-level dual-fetch stability check not separately performed in this phase.",
    structuralCharacteristics:
      "A formal parliamentary audit-report structure: Comptroller and Auditor General's report framing, " +
      "cross-government case studies, and value-for-money findings prepared under Section 6 of the National " +
      "Audit Act 1983 — a distinct audit-report genre named explicitly in the task's own document-type list.",
    likelyDifficulty: "MEDIUM",
    publisherNoveltyNote: "NAO has never been admitted to the corpus (previously investigated but not admitted under DRA-ACQ-003) — would be a confirmed new-publisher contribution if licence permitted.",
    domainNoveltyNote: "Classified GENERAL (cross-government audit findings, similar in kind to CMA/INE). Reinforces GENERAL (2→3).",
    documentTypeNoveltyNote: "Classified REPORT (already 4). Genre novelty: a statutory audit report is a new document kind even though it maps to the same enum value as the EC/INE/CNIL REPORT documents.",
    structuralNoveltyNote: "Parliamentary-audit case-study structure — new in kind, though broadly similar in register to INE's statistical peer-review report.",
    expectedEvidenceContribution: "Cites specific spending figures and named case studies across government departments — a plausible substrate for evidence-linkage checks, framed strictly as an open question.",
    knownRisks: [
      "Licence position is REVIEW_REQUIRED and materially weaker than Candidates 1–2 (non-commercial-only, " +
        "bespoke permission requiring direct NAO contact for any other use) — a human legal reviewer must " +
        "confirm the reuse basis is sufficient for corpus inclusion before any Phase 2 acquisition.",
      "This licence position has now been observed on two independent NAO documents across two separate " +
        "acquisition programmes (DRA-ACQ-003 and this one) — a fairly stable but unfavourable pattern, not a " +
        "one-off finding.",
    ],
    officialSourceStatus: "VERIFIED",
    licenceReuseStatus: "PROVISIONAL",
    sourceStabilityStatus: "UNKNOWN",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) HTTP 200 on the NAO wp-content PDF URL, content-type application/pdf.",
    acquisitionCost: "MEDIUM",
    acquisitionCostRationale: "Technical acquisition is simple, but the non-commercial-only licence requires a dedicated legal-review/permission step before any freeze, raising governance cost above Candidates 1–2.",
    diversityNoveltyScore: withTotal({
      publisherNovelty: 3,
      domainNovelty: 2,
      documentTypeNovelty: 3,
      structuralNovelty: 2,
      languageNovelty: 0,
      difficultyBalance: 1,
      reachableIssueMechanismValue: 2,
      governanceConfidence: 1,
      sourceStability: 1,
    }),
    issueClassHypothesis:
      "HYPOTHESIS ONLY, NOT CONFIRMED: not scored further beyond the register given the governance blocker.",
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, not disqualified: strong topical/genre novelty (audit report, new publisher), but its licence " +
      "position is REVIEW_REQUIRED (non-commercial-only, bespoke), reconfirming the same limitation already " +
      "found for a different NAO document under DRA-ACQ-003. May be reconsidered if a qualified legal reviewer " +
      "confirms the reuse basis, but cannot be recommended as QUALIFIED in this phase.",
  }),

  // --- Candidate 5: AEMPS — Buenas Prácticas del Sistema Español de Farmacovigilancia (retained from DRA-ACQ-013/014) ---
  Object.freeze({
    candidateId: "DRA-CAND-018-05",
    title:
      "Buenas Prácticas del Sistema Español de Farmacovigilancia de Medicamentos de Uso Humano " +
      "(Good Pharmacovigilance Practices of the Spanish Pharmacovigilance System for Human-Use Medicines)",
    publisher: "Agencia Española de Medicamentos y Productos Sanitarios (AEMPS), Spain",
    jurisdiction: "Spain",
    officialSourceUrl: "https://www.aemps.gob.es/vigilancia/medicamentosUsoHumano/SEFV-H/docs/Buenas-practicas-farmacovigilancia-SEFV-H.pdf",
    documentType: "PROCEDURE",
    domain: "HEALTHCARE",
    language: "es",
    sourceFormat: "application/pdf",
    approximateSize: "1,957,512 bytes; ~13,900 words extracted",
    publicationDate: "December 2016 edition (SEFV-H Technical Committee approval, 15 December 2016)",
    licenceReuseBasis:
      "REVIEW_REQUIRED (UNCHANGED from DRA-ACQ-013/014 findings — no new evidence obtained in this phase) — " +
      "AEMPS's site-wide legal notice permits attribution-conditioned reproduction, not a named open licence.",
    stabilityObservations: "Not independently re-fetched in this phase; last confirmed BYTE_STABLE (identical SHA-256) across the DRA-ACQ-013 and DRA-ACQ-014 assessments.",
    structuralCharacteristics: "Formal regulatory quality-management-system structure with defined roles, procedures, inspection criteria, and a numbered annex, citing Spanish and EU pharmacovigilance legislation.",
    likelyDifficulty: "HIGH",
    publisherNoveltyNote: "AEMPS has never appeared in the corpus — confirmed new-publisher contribution if admitted.",
    domainNoveltyNote: "HEALTHCARE domain (reinforces 2→3, tied floor).",
    documentTypeNoveltyNote: "Classified PROCEDURE (already 3 real documents) — reinforces, does not fill a gap.",
    structuralNoveltyNote: "Spanish-language regulatory QMS structure with annexes — structurally similar in kind to existing OTHER-type regulatory frameworks (ICO, PRA, NCSC), not a new pattern.",
    expectedEvidenceContribution: "No new hypothesis beyond what DRA-CHK-005 already investigated for Spanish obligation language; primary marginal value would be publisher/domain, not language, per the task's explicit de-prioritisation of language as an automatic driver.",
    knownRisks: [
      "Licence position has remained REVIEW_REQUIRED, unresolved, across two prior acquisition phases " +
        "(DRA-ACQ-013, DRA-ACQ-014) with no new evidence in this phase to change that assessment.",
      "Would be a fourth non-English document in the corpus at a time when the task explicitly de-prioritises " +
        "adding language variation as a primary selection criterion; its marginal value here is publisher/domain " +
        "novelty only, not a genuinely new evidence-gap dimension.",
    ],
    officialSourceStatus: "VERIFIED",
    licenceReuseStatus: "PROVISIONAL",
    sourceStabilityStatus: "STRONG",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "Historical BYTE_STABLE finding from DRA-ACQ-013/014 (identical SHA-256 across two independently-timed fetches); not independently re-verified in this phase.",
    acquisitionCost: "MEDIUM",
    acquisitionCostRationale: "Technical acquisition already demonstrated feasible via the DRA-ENG-011 malformed-Content-Type fallback in the same acquisition family as DRA-DOC-0018/0021, but the unresolved licence review remains a governance-cost driver.",
    diversityNoveltyScore: withTotal({
      publisherNovelty: 3,
      domainNovelty: 2,
      documentTypeNovelty: 1,
      structuralNovelty: 2,
      languageNovelty: 1,
      difficultyBalance: 1,
      reachableIssueMechanismValue: 1,
      governanceConfidence: 1,
      sourceStability: 2,
    }),
    issueClassHypothesis: "HYPOTHESIS ONLY, NOT CONFIRMED: no new hypothesis beyond the closed EN/ES branch findings.",
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "DEFERRED, unchanged from prior phases: licence remains REVIEW_REQUIRED with no new evidence, and its " +
      "primary would-be contribution (a fourth non-English document) is explicitly de-prioritised by this " +
      "programme's own evidence-gap ranking (rank 8 of 10).",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Acquisition-cost / value discipline summary
// ---------------------------------------------------------------------------

export interface AcquisitionCostValueRow {
  readonly candidateId: string;
  readonly acquisitionCost: "LOW" | "MEDIUM" | "HIGH";
  readonly scientificValue: number; // diversityNoveltyScore.total, cross-referenced
  readonly note: string;
}

export const ACQUISITION_COST_VALUE_TABLE: readonly AcquisitionCostValueRow[] = Object.freeze(
  CANDIDATE_REGISTER.map((c) =>
    Object.freeze({
      candidateId: c.candidateId,
      acquisitionCost: c.acquisitionCost,
      scientificValue: c.diversityNoveltyScore.total,
      note: c.acquisitionCostRationale,
    }),
  ),
);

// ---------------------------------------------------------------------------
// Part 5 — Deterministic ranking and Phase 1 decision
// ---------------------------------------------------------------------------

/**
 * Ranked strictly by diversityNoveltyScore.total (descending), with ties
 * broken by governanceConfidence (descending) then sourceStability
 * (descending) — a fixed, pre-declared rule applied mechanically, not
 * re-ordered after computing scores.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze(
  [...CANDIDATE_REGISTER]
    .sort((a, b) => {
      const byTotal = b.diversityNoveltyScore.total - a.diversityNoveltyScore.total;
      if (byTotal !== 0) return byTotal;
      const byGov = b.diversityNoveltyScore.governanceConfidence - a.diversityNoveltyScore.governanceConfidence;
      if (byGov !== 0) return byGov;
      return b.diversityNoveltyScore.sourceStability - a.diversityNoveltyScore.sourceStability;
    })
    .map((c) => c.candidateId),
);

export const PRIMARY_CANDIDATE_ID: string = "DRA-CAND-018-01";
export const ALTERNATE_1_CANDIDATE_ID: string = "DRA-CAND-018-02";
export const ALTERNATE_2_CANDIDATE_ID: string = "DRA-CAND-018-03";

export function getCandidateById(id: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === id);
}

export function primaryCandidate(): CandidateRecord {
  const c = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!c) throw new Error(`Invariant violated: PRIMARY_CANDIDATE_ID ${PRIMARY_CANDIDATE_ID} not found`);
  return c;
}

export const PHASE_1_VERDICTS = ["QUALIFIED_RECOMMENDED", "NOT_QUALIFIED"] as const;
export type Phase1Verdict = (typeof PHASE_1_VERDICTS)[number];

/**
 * Applies the task's own QUALIFIED_RECOMMENDED gate mechanically to the
 * primary candidate: official source sufficiently verified, licensing has a
 * credible non-blocking path, source sufficiently stable, materially
 * improves corpus evidence, no stronger candidate dominates it, and
 * acquisition is technically feasible without unjustified evaluator change.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const gatesPass =
    c.officialSourceStatus === "VERIFIED" &&
    c.licenceReuseStatus === "VERIFIED" &&
    (c.sourceStabilityStatus === "STRONG" || c.sourceStabilityStatus === "ACCEPTABLE") &&
    c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
    c.qualificationOutcome === "QUALIFIED_RECOMMENDED" &&
    RANKED_CANDIDATE_IDS[0] === c.candidateId;
  return gatesPass ? "QUALIFIED_RECOMMENDED" : "NOT_QUALIFIED";
}

// ---------------------------------------------------------------------------
// Part 6 — H22 hypothesis (open question only — no predicted decision/issue class)
// ---------------------------------------------------------------------------

export const H22_HYPOTHESIS =
  "H22: Adding the European Environment Agency's 'Tracking waste prevention progress' report (EEA Report " +
  "02/2023) will expand the benchmark along publisher diversity (first EEA document), domain balance (reinforces " +
  "GENERAL rather than the already-overrepresented TECHNICAL/AI-governance domain), and structural diversity " +
  "(a multi-indicator quantitative monitoring framework with a numbered RACER-evaluation annex, not previously " +
  "represented), while preserving deterministic acquisition and evaluation under evaluator 0.1.2 and without " +
  "requiring any evaluator, normalisation, or pipeline modification.";

// Explicit non-predictions, mirroring the task's own prohibition.
export const H22_DOES_NOT_PREDICT = Object.freeze([
  "a SUPPORTED / REVIEW / HOLD decision for DRA-DOC-0022",
  "expansion of issue-class coverage beyond the current 3/9 (IC-4, IC-5, IC-7)",
  "any specific count or severity of issues that will be raised",
]);

// ---------------------------------------------------------------------------
// Part 7 — Phase 2 plan (defined, NOT executed)
// ---------------------------------------------------------------------------

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "deterministic_live_fetch_a_b_for_primary_candidate",
  "digest_comparison_across_the_two_fetches",
  "official_source_final_determination",
  "licence_final_determination_including_document_specific_footer_check",
  "domain_and_document_type_classification_sign_off",
  "normalisation_and_text_extraction",
  "freeze_record_creation",
  "corpus_admission_as_dra_doc_0022",
  "evaluator_0_1_2_run_unmodified",
  "proof_receipt_generation",
  "manifest_verification",
  "preparation_for_dra_bmk_022",
]);

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0022",
  "run_final_admission_evaluator",
  "create_dra_bmk_022",
  "modify_evaluator_0_1_2",
  "modify_stage_4",
  "modify_stage_5",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "change_evaluator_version",
  "change_pipeline_version",
  "modify_dra_doc_0001_through_0021_or_their_freeze_records",
] as const);

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0022";
