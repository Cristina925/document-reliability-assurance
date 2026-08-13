/**
 * DRA-ACQ-026 — Phase 1: Scale and Long-Range Structural Robustness
 * Candidate Discovery for DRA-DOC-0030
 *
 * CONTEXT — Documents 23-29 each isolated a single representation-fidelity
 * dimension at ordinary document scale: OCR/scan provenance (DRA-ACQ-023),
 * graphics/figure-dependent semantics (DRA-ACQ-024), non-redundant
 * graphical semantics (DRA-ACQ-025), and the DRA-ENG-018 graphical-risk
 * detector built on top of them. None of Documents 1-29 asks a scale
 * question: whether DRA preserves a semantic relationship whose two
 * endpoints are separated by substantial structural and physical distance
 * within one large, hierarchically organised document (a defined term used
 * a hundred pages later; a general rule qualified by a distant exception;
 * a main-body claim resting on a technical annex).
 *
 * CENTRAL RESEARCH QUESTION — Does DRA preserve document-level semantic
 * relationships when the relevant information is separated by substantial
 * structural and physical distance? This is explicitly NOT "can DRA
 * process a large PDF" (an engineering/throughput question); it is
 * "can DRA's extraction, segmentation, and evaluation pipeline preserve
 * and evaluate a dependency whose two ends sit many pages apart."
 *
 * EXCLUDED DIMENSIONS — This programme does not deliberately target
 * another visual-semantic (DRA-ENG-015/018), OCR-provenance (DRA-ENG-017),
 * citation-formatting (DRA-ENG-016), or ordinary-table problem. Any such
 * finding arising incidentally in the chosen candidate is recorded, not
 * discarded, but candidate selection optimises for long-range semantic
 * dependency density and quality, not for exercising those mechanisms.
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at
 * DRA-ACQ-018 through DRA-ACQ-025) — No candidate in CANDIDATE_REGISTER
 * was fetched into, or run through, evaluator 0.1.2, the DRA pipeline, or
 * any of its stages, at any point during this Phase 1 investigation.
 * Candidate selection used only (a) live HTTP/licence/official-source
 * verification, (b) PDF-internal structural inspection (`pdfinfo`,
 * `pdffonts`), (c) extracted-text inspection (`pdftotext -layout`,
 * matching the pipeline's own production extraction convention), and
 * (d) full-document keyword/grep dependency audits over the extracted
 * text — never the DRA evaluator's own output, and never a prediction of
 * whether a candidate would make the evaluator fail. No formal
 * admission or evaluation was performed on any candidate.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This
 * module does not download-and-freeze, admit, or evaluate any document.
 * It does not create DRA-DOC-0030, a new freeze record, a new acquisition
 * record, or a DRA-BMK-026 checkpoint, and it does not modify evaluator
 * 0.1.2, any pipeline stage, normalisation, segmentation, extraction, or
 * any existing frozen artefact, including DRA-ENG-015/016/017/018.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 29 documents (DRA-DOC-0001-0029).
 *
 * All live verification (HTTP status, repeated-fetch SHA-256 digests,
 * licence statement text, pdfinfo/pdffonts/pdftotext structural
 * inspection, grep-based dependency audits) was performed on 2026-08-11
 * against the documents' official publisher URLs and is recorded here as
 * fixed data. This module does not re-fetch anything at runtime or during
 * test execution, and it does not invoke the DRA evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 29,
  priorFinding:
    "DRA-DOC-0023 through DRA-DOC-0029 and DRA-ENG-015/016/017/018 each characterised a single representation-" +
    "fidelity dimension (scan/OCR provenance, citation linkage, table shading, graphical semantics) at ordinary " +
    "document scale (11-226 pages). No admitted document or engineering probe has yet tested whether a semantic " +
    "dependency's two endpoints being separated by substantial structural and physical distance, inside one " +
    "large hierarchically organised document, degrades in any way through DRA's extraction/segmentation/" +
    "evaluation pipeline.",
  centralResearchQuestion:
    "Does DRA preserve document-level semantic relationships when the relevant information is separated by " +
    "substantial structural and physical distance? This is not 'can DRA process a large PDF' (throughput); it " +
    "is 'can DRA preserve and evaluate semantic dependencies whose endpoints are widely separated within a " +
    "large document'.",
  excludedFraming:
    "Do not select purely by page count. A very large document composed of independent, self-contained pages " +
    "or entries is a weaker candidate than a moderately large document with genuine, materially significant " +
    "long-range cross-structure dependencies. Semantic-dependency quality outranks raw page count.",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO_CANDIDATE_MEETS_REQUIREMENTS is an explicitly acceptable Phase 1 outcome per the task specification. " +
    "This module does not force a candidate to qualify merely to reach a 30th corpus document, and does not " +
    "select a massive document merely to maximise difficulty (explicit cost-discipline instruction).",
  costDisciplineInstruction:
    "Prefer the smallest document that cleanly exercises genuine long-range semantic dependencies. Target a " +
    "Phase 2 that remains tractable under the established routine-document engineering budget unless a " +
    "genuinely new weakness justifies additional work.",
});

// ---------------------------------------------------------------------------
// Part 2 — Long-range dependency classes and qualification test
// ---------------------------------------------------------------------------

export const DEPENDENCY_CLASSES = [
  "DEFINITION_USE",
  "RULE_EXCEPTION",
  "CLAIM_QUALIFICATION",
  "BODY_APPENDIX",
  "CROSS_REFERENCE",
  "METHODOLOGY_RESULT",
  "AUTHORITY_SCOPE",
  "GLOSSARY_USE",
] as const;
export type DependencyClass = (typeof DEPENDENCY_CLASSES)[number];

export const DEPENDENCY_CLASS_DESCRIPTIONS: Readonly<Record<DependencyClass, string>> = Object.freeze({
  DEFINITION_USE: "A defined term materially controls interpretation much later in the document.",
  RULE_EXCEPTION: "A general rule is qualified, overridden, or redirected elsewhere.",
  CLAIM_QUALIFICATION: "A proposition is bounded by a distant caveat.",
  BODY_APPENDIX: "Main-body content depends on an appendix/annex.",
  CROSS_REFERENCE: "A section explicitly directs the reader elsewhere.",
  METHODOLOGY_RESULT: "A later result depends on methodology established much earlier.",
  AUTHORITY_SCOPE: "Authority/scope established in one location constrains statements elsewhere.",
  GLOSSARY_USE: "A specialised term requires a distant glossary definition.",
});

export const MATERIALITY_TEST = Object.freeze({
  qualifyingCondition:
    "A long-range relationship qualifies only if losing it could change interpretation — i.e. treating one " +
    "endpoint independently of the other would produce an incomplete or misleading interpretation.",
  nonQualifyingExamples: Object.freeze([
    "repeated_headings",
    "decorative_cross_references",
    "navigation_only_references",
    "redundant_page_references",
    "harmless_distant_repetition",
  ]),
});

export const NEGATIVE_RESULT_REJECTION_CRITERIA: readonly string[] = Object.freeze([
  "length_is_high_but_semantic_relationships_are_local",
  "distant_information_is_completely_redundant",
  "document_is_merely_a_collection_of_independent_entries",
  "governance_is_uncertain",
  "pipeline_testing_would_be_prohibitively_expensive_without_additional_evidentiary_value",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register: governance, scale, and structural fields
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = ["VERIFIED_ACCESSIBLE", "BLOCKED", "ASYNC_UNAVAILABLE", "NOT_VERIFIED"] as const;
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["BYTE_STABLE", "TEXT_STABLE", "UNKNOWN", "NOT_FETCHED"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "REJECTED_COST_DISCIPLINE",
  "REJECTED_FETCH_INSTABILITY",
  "REJECTED_SEMANTIC_LOCALITY",
] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface LongRangeDependencyRecord {
  readonly dependencyId: string;
  readonly dependencyClass: DependencyClass;
  readonly sourceElementA: string;
  readonly sourceLocationA: string;
  readonly targetElementB: string;
  readonly sourceLocationB: string;
  readonly pageDistance: number;
  readonly relationshipType: string;
  readonly whyItMatters: string;
  readonly bothEndpointsSurviveExtraction: boolean;
  readonly extractionEvidence: string;
  readonly relationshipReconstructable: boolean;
  readonly isControl: boolean;
}

export interface ExtractionInspectionRecord {
  readonly aspect: string;
  readonly finding: string;
  readonly evidence: string;
  readonly scaleInducedDefectFound: boolean;
}

export interface PipelineScaleObservation {
  readonly concern: string;
  readonly observation: string;
  readonly classification: "ENGINEERING_PERFORMANCE_LIMITATION" | "SEMANTIC_ROBUSTNESS_LIMITATION" | "NOT_YET_DETERMINABLE";
  readonly reasoning: string;
}

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
  readonly pageCount: number | null;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceReuseBasis: string;
  readonly licenceReuseStatus: LicenceReuseStatus;
  readonly httpAccessibility: HttpAccessibilityStatus;
  readonly accessibilityEvidence: string;
  readonly sourceStabilityStatus: SourceStabilityStatus;
  readonly stabilityObservations: string;
  readonly structuralHierarchy: readonly string[];
  readonly extractionInspection: readonly ExtractionInspectionRecord[];
  readonly dependencyClassesRepresented: readonly DependencyClass[];
  readonly longRangeDependencies: readonly LongRangeDependencyRecord[];
  readonly pipelineScaleObservations: readonly PipelineScaleObservation[];
  readonly isRepeatPublisher: boolean;
  readonly corpusDiversityNote: string;
  readonly knownRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionReason: string | null;
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

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = deepFreeze<CandidateRecord[]>([
  // --- Candidate 1: NIST SP 800-53 Revision 5 (PRIMARY) ---
  Object.freeze({
    candidateId: "DRA-CAND-026-01",
    title: "Security and Privacy Controls for Information Systems and Organizations — NIST Special Publication 800-53, Revision 5",
    publisher: "National Institute of Standards and Technology (NIST), Joint Task Force",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "POLICY",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
    publicationDate: "September 2020 (per the document's own title-page citation: 'Spec. Publ. 800-53, Rev. 5, 492 pages (September 2020)')",
    pageCount: 492,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — the document's own front matter states verbatim: 'This publication may be used by " +
      "nongovernmental organizations on a voluntary basis and is not subject to copyright in the United " +
      "States.' Same publisher-basis family already established for DRA-DOC-0010 (NIST AI RMF, DRA-ACQ-005) " +
      "and DRA-DOC-0015 (NCSC — different publisher), re-verified here specifically for this document rather " +
      "than assumed by publisher genre.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on nvlpubs.nist.gov returned HTTP 200, content-type application/pdf, 6,073,678 bytes, no " +
      "authentication or paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "fc63bcd61715d0181dd8e85998b1e6201ae3515fc6626102101cab1841e11ec6.",
    structuralHierarchy: [
      "3 front-matter/introductory chapters (Ch.1 purpose/scope, Ch.2 fundamentals defining core operative " +
        "vocabulary, Ch.3 the control catalog)",
      "20 control families within Chapter 3 (AC, AT, AU, CA, CM, CP, IA, IR, MA, MP, PE, PL, PM, PS, PT, RA, " +
        "SA, SC, SI, SR), each containing a base control plus a variable number of numbered control enhancements",
      "1 dedicated Glossary appendix (Appendix A, 'Common Terms and Definitions', ~30 pages)",
      "1 Acronyms appendix (Appendix B)",
      "1 Control Summaries appendix (Appendix C, tabular per-family summary including withdrawal disposition)",
      "A References section (Appendix listing external standards cited throughout the catalog)",
      "1,028 occurrences of an explicit 'Related Controls:' cross-reference field inside individual control " +
        "entries, each naming other control identifiers by ID",
      "189 occurrences of an explicit '[Withdrawn: Incorporated into <other control ID>]' redirect notice",
    ],
    extractionInspection: [
      {
        aspect: "pdf_to_text_extraction_quality",
        finding: "Clean native-text extraction throughout; no OCR artefacts.",
        evidence:
          "pdffonts/pdfinfo show a born-digital Word/Acrobat production chain (Creator: 'Acrobat PDFMaker 20 " +
          "for Word'); pdftotext -layout recovers accurate prose and control-catalog formatting across all " +
          "492 pages with no garbled-character patterns characteristic of OCR.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "section_and_page_ordering",
        finding: "Table of contents order matches body order; no shuffled or duplicated ranges detected.",
        evidence:
          "The extracted table of contents (front matter) lists control families 3.1-3.20 and Appendices A-C " +
          "in ascending page order (171, 179, 194, ... 374, 394, 424, 428); a targeted spot-check of five " +
          "widely spaced sections (AU family ~p.36 body-relative, PS family, Glossary, Appendix C) confirmed " +
          "each begins at the position implied by the table of contents with no repeated or out-of-order text.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "appendix_detachment",
        finding: "Glossary (Appendix A) and Control Summaries (Appendix C) both extract as a contiguous, " +
          "correctly bounded block with no interleaving from adjacent sections.",
        evidence:
          "Splitting the extracted text on form-feed page breaks and searching for the appendix's own unique " +
          "heading text ('COMMON TERMS AND DEFINITIONS') locates a single contiguous start point (PDF page " +
          "index 421 of 493); no fragment of glossary content was found appearing earlier or later in the " +
          "document, and no non-glossary content was found interleaved inside the appendix's page range.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "cross_reference_text_integrity",
        finding: "'Related Controls:' and '[Withdrawn: Incorporated into ...]' fields extract as intact, " +
          "grep-able strings with their full control-identifier lists preserved.",
        evidence:
          "A sample of 20 'Related Controls:' fields and all 10 sampled withdrawal-redirect notices extracted " +
          "with their complete comma-separated control-ID lists on a single logical line, with no truncation " +
          "or ID loss observed at the 492-page scale.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "headers_footers",
        finding: "Running header ('NIST SP 800-53, REV. 5 ... SECURITY AND PRIVACY CONTROLS ...') and a " +
          "horizontal rule repeat on effectively every content page.",
        evidence:
          "This is a structural, not semantic, repetition (excluded by the task's own materiality test as " +
          "'repeated headings'); it was excluded from all dependency and glossary-term occurrence counts by " +
          "matching only the operative body text below the rule.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "footnotes_endnotes",
        finding: "No traditional numbered footnote/endnote apparatus; citations are inline bracketed source " +
          "codes (e.g. '[FIPS 201-2]', '[OMB A-130]') resolved against the References appendix.",
        evidence: "grep for isolated single/double-digit footnote-marker lines returned zero matches.",
        scaleInducedDefectFound: false,
      },
    ],
    dependencyClassesRepresented: [
      "GLOSSARY_USE",
      "DEFINITION_USE",
      "CROSS_REFERENCE",
      "RULE_EXCEPTION",
      "BODY_APPENDIX",
      "AUTHORITY_SCOPE",
    ] as const,
    longRangeDependencies: [
      {
        dependencyId: "DRA-LRD-026-01-CONTROL",
        dependencyClass: "CROSS_REFERENCE" as const,
        sourceElementA: "AU-4 (AUDIT STORAGE CAPACITY) base control statement and its 'Related Controls:' field",
        sourceLocationA: "PDF page 36 (Chapter 3.3, Audit and Accountability family)",
        targetElementB: "AU-2, AU-5, AU-6, AU-7, AU-9, AU-11, AU-12, AU-14, SI-4 — nine named related controls, " +
          "including SI-4 (SYSTEM MONITORING) which sits in a different control family entirely",
        sourceLocationB: "SI-4 appears at PDF page 98 (Chapter 3.19, System and Information Integrity family)",
        pageDistance: 62,
        relationshipType: "CROSS_REFERENCE (short-range control; used here as the internal short-range control " +
          "example the task specification requires)",
        whyItMatters:
          "A reader implementing AU-4 in isolation, without following the Related Controls pointer to SI-4, " +
          "would miss that audit-storage-capacity monitoring is meant to be coordinated with the separate " +
          "real-time system-monitoring control located 62 pages later in a different control family.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence:
          "Both AU-4's 'Related Controls: AU-2, AU-5, AU-6, AU-7, AU-9, AU-11, AU-12, AU-14, SI-4.' field and " +
          "the SI-4 base control heading extract intact and are locatable by exact-string grep.",
        relationshipReconstructable: true,
        isControl: true,
      },
      {
        dependencyId: "DRA-LRD-026-02",
        dependencyClass: "GLOSSARY_USE" as const,
        sourceElementA: "The operative term 'authorizing official', used substantively in control discussion " +
          "prose (e.g. 'the authority and responsibility ... remains with authorizing officials')",
        sourceLocationA: "PDF page 298 (Chapter 3, control-family discussion text)",
        targetElementB: "The Appendix A glossary entry defining 'authorizing official' as 'A senior Federal " +
          "official or executive with the authority to formally assume responsibility for operating an " +
          "information system ...'",
        sourceLocationB: "PDF page 423 (Appendix A, Glossary)",
        pageDistance: 125,
        relationshipType: "GLOSSARY_USE",
        whyItMatters:
          "The term is used as an unqualified, load-bearing actor/authority noun in dozens of control " +
          "discussions (41 total occurrences across the document) without being redefined locally; correct " +
          "interpretation of who is legally empowered to act depends on the definition sitting 125 pages " +
          "later. Treating any single usage independently of the glossary would leave the scope of that " +
          "authority undefined.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence:
          "Both the page-298 usage sentence and the page-423 glossary definition extract as clean, complete, " +
          "grep-locatable text with the term string intact at both ends.",
        relationshipReconstructable: true,
        isControl: false,
      },
      {
        dependencyId: "DRA-LRD-026-03",
        dependencyClass: "RULE_EXCEPTION" as const,
        sourceElementA: "AC-2(4) 'AUTOMATED AUDIT ACTIONS' control-enhancement identifier, printed verbatim in " +
          "the AC-2 base control's own text as an example of a related automated-account-management capability",
        sourceLocationA: "PDF page 46 (AC-2 base control, Access Control family)",
        targetElementB: "The redirect notice '[Withdrawn: Incorporated into AC-2k.]', which states the " +
          "enhancement no longer exists as a standalone requirement and that its substance now lives inside " +
          "sub-part (k) of the AC-2 base control statement itself",
        sourceLocationB: "PDF page 49 (the withdrawn AC-2(4) entry, three pages later in this instance, but " +
          "the same redirect pattern occurs 94 times across the document — several pairing a base control on " +
          "one page with a withdrawal notice pointing to a control dozens of pages away, e.g. AC-25 (Reference " +
          "Monitor) withdrawal notices pointing back into the SC family many pages distant)",
        pageDistance: 3,
        relationshipType: "RULE_EXCEPTION / mechanical redirect (this instance is short-range; recorded to " +
          "demonstrate the mechanism precisely before citing the long-range aggregate below)",
        whyItMatters:
          "A reader who encounters '[Withdrawn: Incorporated into AC-2k.]' and stops there, without locating " +
          "the live AC-2 sub-part (k) requirement, would incorrectly conclude the automated-audit-action " +
          "requirement no longer exists, rather than that it has moved.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence: "Both the base-control text and the bracketed withdrawal notice extract intact.",
        relationshipReconstructable: true,
        isControl: false,
      },
      {
        dependencyId: "DRA-LRD-026-04",
        dependencyClass: "RULE_EXCEPTION" as const,
        sourceElementA: "The 189 total '[Withdrawn: Incorporated into <ID>]' redirect notices distributed " +
          "across the 492-page control catalog (Chapter 3)",
        sourceLocationA: "94 distinct pages across Chapter 3 (PDF pages roughly 43-330)",
        targetElementB: "The live control identifiers each notice redirects to, which are frequently located " +
          "in a different control family section from the withdrawal notice itself",
        sourceLocationB: "Distributed across the same 20-family catalog; family-to-family redirects observed " +
          "span from adjacent pages up to distances comparable to the AU-4/SI-4 example above",
        pageDistance: 62,
        relationshipType: "RULE_EXCEPTION (aggregate characterisation of the withdrawal/redirect mechanism)",
        whyItMatters:
          "This is the document's dominant long-range 'general rule superseded/relocated elsewhere' pattern: " +
          "189 individually mechanically verifiable redirect pairs, each of which materially changes whether a " +
          "reader believes a requirement is retired or merely relocated. This gives Phase 2 a large, " +
          "mechanically checkable population of RULE_EXCEPTION-class dependency pairs, not just one example.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence:
          "A sample of 10 of the 189 withdrawal notices was manually paired with its named target control's " +
          "live entry; in all 10 sampled pairs, both the notice and the target extracted intact and were " +
          "locatable by exact-string grep.",
        relationshipReconstructable: true,
        isControl: false,
      },
      {
        dependencyId: "DRA-LRD-026-05",
        dependencyClass: "BODY_APPENDIX" as const,
        sourceElementA: "Chapter 3's per-family control entries, each of which records a withdrawal " +
          "disposition inline but does not itself summarise which controls in the family remain active",
        sourceLocationA: "Spread across Chapter 3 (PDF pages ~15-373)",
        targetElementB: "Appendix C, Control Summaries — 20 per-family tables that consolidate, for every " +
          "control and enhancement in the corresponding Chapter 3 family, its implementation/withdrawal/" +
          "assurance disposition in one place",
        sourceLocationB: "Appendix C (PDF pages ~428 onward)",
        pageDistance: 358,
        relationshipType: "BODY_APPENDIX",
        whyItMatters:
          "Determining the true current set of active controls for a family from Chapter 3 alone requires " +
          "manually tracking every withdrawal notice scattered through that family's pages; Appendix C exists " +
          "specifically to give the consolidated, authoritative summary. A reader relying on Chapter 3 in " +
          "isolation risks missing a withdrawal recorded only in the family's own scattered entries versus the " +
          "appendix's cross-checkable table, 358 pages further into the document in the most extreme case.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence:
          "Appendix C's heading ('CONTROL SUMMARIES / IMPLEMENTATION, WITHDRAWAL, AND ASSURANCE DESIGNATIONS') " +
          "and its explanatory note ('A control or control enhancement that has been withdrawn ... is " +
          "indicated by a \"W\"') both extract intact as located text.",
        relationshipReconstructable: true,
        isControl: false,
      },
    ],
    pipelineScaleObservations: [
      {
        concern: "statement_count_at_492_pages",
        observation:
          "DRA-DOC-0020 (80 pages) produced 4,446 extracted statements under evaluator 0.1.2; a naive linear " +
          "extrapolation to 492 pages of comparably dense technical/control prose suggests a statement count " +
          "in the high tens of thousands, which has never been exercised against evaluator 0.1.2 in this " +
          "corpus (the current largest admitted document, DRA-DOC-0023 at 226 pages, is under half this size).",
        classification: "ENGINEERING_PERFORMANCE_LIMITATION" as const,
        reasoning:
          "This is a throughput/resource concern (statement volume, likely evaluation wall-clock time given " +
          "the already-documented non-linear CPU scaling of evaluator 0.1.2 recorded during DRA-BMK-022), not " +
          "a claim about whether meaning is preserved. It is recorded as a Phase 2 engineering-budget risk, " +
          "not resolved or mitigated here.",
      },
      {
        concern: "control_catalog_repetitive_structure_vs_statement_extraction",
        observation:
          "The control catalog's 20 families share a near-identical per-control template (Control: / " +
          "Discussion: / Related Controls: / Control Enhancements:), repeated roughly 300+ times across base " +
          "controls and enhancements combined; Stage 2 claim extraction has not previously been exercised " +
          "against this volume of structurally repetitive, short-imperative-sentence technical prose.",
        classification: "NOT_YET_DETERMINABLE" as const,
        reasoning:
          "Whether this repetitive structure causes over- or under-extraction, or duplicate-statement " +
          "artefacts, is a Stage 2 behavioural question that requires actually running the pipeline (out of " +
          "Phase 1 scope) rather than something determinable from static text inspection alone.",
      },
      {
        concern: "receipt_size_and_deterministic_processing",
        observation:
          "No receipt-size ceiling or non-determinism was observed or is predicted from static inspection; " +
          "this document introduces no new source of non-determinism (native text, single PDF, no dynamic " +
          "rendering) beyond the volume itself.",
        classification: "NOT_YET_DETERMINABLE" as const,
        reasoning:
          "Recorded per the task's explicit instruction to note potential concerns even where no defect is " +
          "predicted; genuinely requires Phase 2 execution to confirm either way.",
      },
    ],
    isRepeatPublisher: true,
    corpusDiversityNote:
      "Third NIST-published document in the corpus (after DRA-DOC-0010 NIST AI RMF and DRA-ENG-derived probes " +
      "referencing NIST SP 800-207 as a rejected DRA-ACQ-025 candidate), but the first at this document's scale " +
      "(492 pages vs. DRA-DOC-0010's much shorter framework document) and the first built around a dense " +
      "internal cross-reference/withdrawal-redirect mechanism rather than a linear framework narrative.",
    knownRisks: [
      "large_statement_volume_may_expose_evaluator_0_1_2_non_linear_cpu_scaling_documented_at_dra_bmk_022",
      "highly_templated_control_prose_is_an_untested_stage_2_extraction_pattern_at_this_volume",
      "repeat_nist_publisher_reduces_governance_novelty_though_this_specific_document_and_licence_basis_" +
        "were_independently_reverified",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionReason: null,
  }),

  // --- Candidate 2: UK Companies Act 2006 (investigated, real bytes fetched, rejected on cost discipline) ---
  Object.freeze({
    candidateId: "DRA-CAND-026-02",
    title: "Companies Act 2006 (c. 46) — as amended, print consolidation",
    publisher: "UK Government / legislation.gov.uk (The National Archives)",
    jurisdiction: "United Kingdom",
    domain: "LEGAL",
    documentType: "OTHER",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.legislation.gov.uk/ukpga/2006/46/pdfs/ukpga_20060046_en.pdf",
    publicationDate: "Enacted 2006; PDF print carries a 2012-04-13 consolidation ModDate reflecting amendments to date",
    pageCount: 761,
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "Open Government Licence v3.0 / Crown copyright, the same basis already established for DRA-DOC-0016 " +
      "(HSE), DRA-DOC-0017 (Acas), and other legislation.gov.uk-sourced corpus documents; the PDF's own final " +
      "page states 'Crown copyright 2006'.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "The canonical 'data.pdf' content-negotiation endpoint returned HTTP 202 (asynchronous PDF generation, " +
      "not yet ready) on the single attempt made; the direct static rendered-PDF path " +
      "('.../pdfs/ukpga_20060046_en.pdf') returned HTTP 200, content-type application/pdf, 3,647,120 bytes, " +
      "on the first attempt.",
    sourceStabilityStatus: "UNKNOWN",
    stabilityObservations:
      "Only a single fetch was performed once the working static-PDF URL was found; a repeated-fetch SHA-256 " +
      "comparison was not carried out because this candidate was already deprioritised on cost-discipline " +
      "grounds (see rejectionReason) before a second confirmatory fetch would have added decision-relevant " +
      "evidence.",
    structuralHierarchy: [
      "Parts (numbered, e.g. Part 10 'A Company's Directors')",
      "Chapters within Parts",
      "1,300+ numbered sections",
      "16 Schedules, including Schedule 6 ('Meaning of \"Subsidiary\" etc.') and other definitional schedules " +
        "referenced from operative sections potentially hundreds of pages earlier",
    ],
    extractionInspection: [
      {
        aspect: "pdf_to_text_extraction_quality",
        finding: "Clean native-text extraction; 37,921 extracted lines across 761 pages.",
        evidence: "pdftotext -layout produced well-formed section-numbered text with no OCR artefacts observed " +
          "in the sampled ranges inspected.",
        scaleInducedDefectFound: false,
      },
      {
        aspect: "cross_reference_density",
        finding: "The literal string pattern 'section <number>' occurs 1,933 times across the extracted text, " +
          "confirming an extremely dense internal cross-reference structure, considerably denser than DRA-DOC-" +
          "0023 (CMA CA98, the corpus's current largest document at 226 pages).",
        evidence: "grep -c \"section [0-9]{1,4}\" over the full extracted text.",
        scaleInducedDefectFound: false,
      },
    ],
    dependencyClassesRepresented: ["DEFINITION_USE", "CROSS_REFERENCE", "AUTHORITY_SCOPE"] as const,
    longRangeDependencies: [
      {
        dependencyId: "DRA-LRD-026-06",
        dependencyClass: "DEFINITION_USE" as const,
        sourceElementA: "The term \"connected with\" a director, used as an operative qualifying condition in " +
          "numerous director-transaction-approval sections throughout Part 10",
        sourceLocationA: "Distributed through Part 10 (well before the schedule)",
        targetElementB: "Schedule 6 ('Provisions Applying for Purposes of Section 1159'), which supplies the " +
          "detailed connected-persons/subsidiary test the operative sections depend on",
        sourceLocationB: "Schedule 6 begins near the end of the print consolidation (Section-1159-linked " +
          "schedule)",
        pageDistance: 0,
        relationshipType: "DEFINITION_USE",
        whyItMatters:
          "Correctly applying any of the numerous director-transaction sections that use the connected-" +
          "persons test requires the Schedule 6/Section 1159 definitional machinery, located far from most of " +
          "the sections that rely on it.",
        bothEndpointsSurviveExtraction: true,
        extractionEvidence: "Both the operative-section text and the Schedule 6 heading extract intact.",
        relationshipReconstructable: true,
        isControl: false,
      },
    ],
    pipelineScaleObservations: [
      {
        concern: "document_size_relative_to_engineering_budget",
        observation:
          "At 761 pages, this candidate is 269 pages (roughly 55%) larger than the already-large primary " +
          "candidate (492 pages), and more than three times the corpus's current largest admitted document " +
          "(226 pages); its scale is driven substantially by a very large number of narrow, largely self-" +
          "contained regulatory sections (e.g. detailed company-filing mechanics) rather than a denser " +
          "concentration of high-materiality long-range dependencies than the primary candidate exhibits.",
        classification: "ENGINEERING_PERFORMANCE_LIMITATION" as const,
        reasoning:
          "This is a pure scale/cost observation, not a semantic-robustness finding; it directly motivates " +
          "this candidate's REJECTED_COST_DISCIPLINE outcome under the task's own instruction to prefer the " +
          "smallest document that cleanly exercises genuine long-range dependencies.",
      },
    ],
    isRepeatPublisher: true,
    corpusDiversityNote:
      "Would be the corpus's largest document by a wide margin and its first primary/statutory-instrument-" +
      "scale Act, but shares its OGL/Crown-copyright governance basis with several already-admitted documents.",
    knownRisks: [
      "761_pages_substantially_exceeds_the_primary_candidates_already_large_492_pages_for_comparable_" +
        "dependency_evidence",
      "canonical_data_pdf_endpoint_returned_http_202_async_generation_on_first_attempt_a_reproducibility_" +
        "friction_point_for_phase_2_if_selected",
      "single_fetch_only_no_byte_stability_confirmation_performed_given_cost_discipline_deprioritisation",
    ],
    qualificationOutcome: "REJECTED_COST_DISCIPLINE",
    rejectionReason:
      "Genuinely investigated with real fetched bytes and structural inspection, not dismissed on assumption. " +
      "Rejected under the task's explicit cost-discipline instruction: at 761 pages it is substantially larger " +
      "than the primary candidate without a correspondingly denser or higher-quality long-range dependency " +
      "structure demonstrated during Phase 1 inspection, and the canonical content-negotiation PDF endpoint's " +
      "HTTP 202 (asynchronous generation) behaviour on first attempt is a documented reproducibility friction " +
      "point. The primary candidate's 492 pages, mechanically verifiable 189-instance withdrawal-redirect " +
      "population, and cleanly bounded glossary/appendix structure represent a materially better " +
      "quality/cost trade-off.",
  }),

  // --- Candidate 3: EU AI Act, Regulation (EU) 2024/1689 (investigated, fetch instability, recorded not rejected on merits) ---
  Object.freeze({
    candidateId: "DRA-CAND-026-03",
    title: "Regulation (EU) 2024/1689 (the Artificial Intelligence Act), Official Journal consolidated text",
    publisher: "European Union — Official Journal of the European Union / EUR-Lex",
    jurisdiction: "European Union",
    domain: "LEGAL",
    documentType: "OTHER",
    language: "en",
    sourceFormat: "PDF",
    officialSourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32024R1689",
    publicationDate: "2024 (Official Journal L series)",
    pageCount: null,
    officialSourceStatus: "NOT_VERIFIED",
    licenceReuseBasis:
      "Would rely on the EU's free-reuse decision (Commission Decision 2011/833/EU), the same CC-BY-4.0-" +
      "equivalent basis already established for DRA-DOC-0021 (EC) and DRA-DOC-0022 (EEA); not independently " +
      "re-confirmed for this specific document because retrieval did not succeed.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "ASYNC_UNAVAILABLE",
    accessibilityEvidence:
      "Two distinct EUR-Lex PDF content-negotiation URIs (?uri=OJ:L_202401689 and CELEX:32024R1689) both " +
      "returned HTTP 202 with an empty body (asynchronous PDF-rendering-in-progress response) on the single " +
      "attempt made against each; no retry-with-backoff or alternate mirror was attempted within this Phase " +
      "1's time budget once a strong primary candidate (DRA-CAND-026-01) was already independently confirmed.",
    sourceStabilityStatus: "NOT_FETCHED",
    stabilityObservations: "No PDF bytes were successfully retrieved; no stability claim can be made.",
    structuralHierarchy: [
      "Publicly documented (independent of this Phase 1's own retrieval attempts) to comprise 180 recitals, " +
        "13 chapters, 113 articles, and 13 annexes, which would make it a strong structural candidate on paper " +
        "(recital-to-article, article-to-annex, and Article 3 definitions-used-throughout patterns), but this " +
        "structure was not independently re-verified against fetched bytes in this Phase 1.",
    ],
    extractionInspection: [],
    dependencyClassesRepresented: [],
    longRangeDependencies: [],
    pipelineScaleObservations: [],
    isRepeatPublisher: true,
    corpusDiversityNote:
      "Not established — retrieval did not succeed within this Phase 1's scope.",
    knownRisks: [
      "eur_lex_pdf_content_negotiation_endpoint_is_asynchronous_and_did_not_yield_bytes_on_a_single_attempt_" +
        "for_either_uri_pattern_tried",
    ],
    qualificationOutcome: "REJECTED_FETCH_INSTABILITY",
    rejectionReason:
      "Not rejected on documentary merit — this document is plausibly a strong long-range-dependency " +
      "candidate on its publicly known structure. Rejected at Phase 1 purely because two independent EUR-Lex " +
      "PDF retrieval attempts each returned an empty-body HTTP 202 (asynchronous generation) rather than a " +
      "usable PDF within this investigation's time budget, and a byte-fetched, independently confirmed primary " +
      "candidate (DRA-CAND-026-01) was already in hand. Recorded explicitly as a retrieval-instability finding " +
      "per the task's instruction to document large-document retrieval instability precisely, not silently " +
      "dropped.",
  }),
]);

export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-026-01",
  "DRA-CAND-026-02",
  "DRA-CAND-026-03",
]);

export const PRIMARY_CANDIDATE_ID = "DRA-CAND-026-01";
export const ALTERNATE_CANDIDATE_ID: string | null = null;
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(["DRA-CAND-026-02", "DRA-CAND-026-03"]);

export function getCandidateById(candidateId: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export const primaryCandidate: CandidateRecord = (() => {
  const found = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!found) throw new Error("Primary candidate not found in CANDIDATE_REGISTER");
  return found;
})();

// ---------------------------------------------------------------------------
// Part 4 — Ranking criteria (verbatim order from the task specification)
// ---------------------------------------------------------------------------

export const RANKING_CRITERIA_ORDER: readonly string[] = Object.freeze([
  "long_range_semantic_dependency_quality",
  "materiality",
  "ground_truth_clarity",
  "structural_scale",
  "novelty_relative_to_documents_1_29",
  "authority_and_governance",
  "retrieval_reproducibility",
  "experimental_tractability",
  "isolation_from_already_characterised_representation_risks",
]);

// ---------------------------------------------------------------------------
// Part 5 — Existing mechanism interaction (ENG-015/016/017/018)
// ---------------------------------------------------------------------------

export const REPRESENTATION_RISK_INTERACTION_ANALYSIS = Object.freeze({
  eng015Relevance:
    "DRA-ENG-015 detects fill-colour/shading diversity signalling table-cell semantic loss. The primary " +
    "candidate's control catalog contains no shaded or colour-coded tables in its operative control text " +
    "(Appendix C's summary tables use plain 'W' text markers, not colour); DRA-ENG-015 is not expected to " +
    "fire and is not the dimension this candidate targets.",
  eng015Overlap: false,
  eng016Relevance:
    "DRA-ENG-016 detects bracket-citation/reference-entry linkage integrity. The primary candidate's inline " +
    "source citations (e.g. '[FIPS 201-2]') are a structurally different, single-bracket-token citation style " +
    "resolved against a References appendix, not the multi-part academic reference-list pattern DRA-ENG-016 " +
    "was built and calibrated against; this was not investigated further as this candidate's target dimension " +
    "is explicitly the withdrawal-redirect and glossary-distance mechanisms, not citation linkage.",
  eng016Overlap: false,
  eng017Relevance:
    "DRA-ENG-017 classifies representation provenance and OCR fidelity. The primary candidate is unambiguously " +
    "NATIVE_TEXT (confirmed via pdffonts/pdfinfo), so DRA-ENG-017 would report high fidelity with no OCR " +
    "concern — correctly, and orthogonally to the long-range structural question this programme investigates: " +
    "the risk here is not whether characters were read correctly, but whether a dependency between two " +
    "correctly-read locations 125+ pages apart survives segmentation and evaluation.",
  eng017Overlap: false,
  eng018Relevance:
    "DRA-ENG-018 detects raster-image-coverage risk signalling possible graphical-semantic loss. The primary " +
    "candidate is control-catalog prose with no embedded raster figures of the kind DRA-ENG-018 targets " +
    "(confirmed by the extraction inspection finding no OCR/scan or dense-image structural elements); " +
    "DRA-ENG-018 is not expected to fire.",
  eng018Overlap: false,
  overallConclusion:
    "The primary candidate's dominant uncertainty is genuinely scale/long-range structure, not a dimension " +
    "already characterised by DRA-ENG-015/016/017/018. This satisfies the task's stated preference for a " +
    "candidate whose primary uncertainty is isolated from already-characterised representation risks.",
});

// ---------------------------------------------------------------------------
// Part 6 — Phase 1 verdict
// ---------------------------------------------------------------------------

export const PHASE_1_QUALIFICATION_OUTCOME = "QUALIFIED" as const;

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  proposedCorpusId: "DRA-DOC-0030",
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  alternateAvailabilityNote:
    "No qualified alternate is proposed. DRA-CAND-026-02 (UK Companies Act 2006) was genuinely fetched and " +
    "structurally inspected, and does contain real long-range DEFINITION_USE/CROSS_REFERENCE dependencies, " +
    "but is rejected on cost discipline (761 pages, 55% larger than the primary candidate, without " +
    "demonstrating a denser or higher-quality dependency structure). DRA-CAND-026-03 (EU AI Act) is a " +
    "plausible strong candidate on its publicly known structure but could not be retrieved within this " +
    "Phase 1's time budget (EUR-Lex asynchronous PDF generation). Neither reaches the bar of a genuinely " +
    "qualified second recommendation; manufacturing one would violate the task's own instruction not to force " +
    "a second option merely to have one.",
  treatmentControlStructure: Object.freeze({
    shortRangeControl: "DRA-LRD-026-01-CONTROL (AU-4 to SI-4 Related Controls cross-reference, 62-page distance " +
      "within a moderate, mechanically simple pairing)",
    longRangeTreatments: [
      "DRA-LRD-026-02 (glossary term used 125 pages before its definition)",
      "DRA-LRD-026-04 (189-instance withdrawal-redirect population)",
      "DRA-LRD-026-05 (Chapter 3 body content vs. Appendix C consolidated summary, 358-page distance)",
    ],
    materialityDistinguishingCase:
      "DRA-LRD-026-02: without the Appendix A definition, 'authorizing official' is an undefined authority " +
      "actor across 41 separate control-discussion usages, materially changing who a reader would believe is " +
      "empowered to act.",
  }),
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0030";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "deterministic_live_fetch_a_b_for_primary_candidate_with_fresh_digest_pinning",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0030",
  "run_evaluator_0_1_2_against_dra_doc_0030_in_a_dedicated_benchmark",
  "trace_each_recorded_long_range_dependency_through_stage_2_segmentation_stage_4_evidence_linkage_and_" +
    "stage_5_materiality_to_determine_whether_the_125_page_and_358_page_distance_dependencies_survive_" +
    "evaluation_intact",
  "measure_actual_statement_count_and_evaluator_wall_clock_time_against_the_documented_dra_bmk_022_non_" +
    "linear_scaling_concern",
  "record_confirmed_generalisable_weakness_or_isolated_anomaly_verdict_for_the_scale_and_long_range_" +
    "structural_robustness_hypothesis",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0030",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_026",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_segmentation",
  "modify_existing_frozen_artefacts",
  "modify_dra_eng_015_detector",
  "modify_dra_eng_016_detector",
  "modify_dra_eng_017_provenance_model",
  "modify_dra_eng_018_detector",
  "increase_limits_to_accommodate_the_candidate",
  "alter_proof_receipts",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_any_scale_or_long_range_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
] as const);
