/**
 * DRA-ACQ-025 — Phase 1: Non-Redundant Graphical Semantics Candidate
 * Discovery for DRA-DOC-0029
 *
 * CONTEXT — DRA-ACQ-024 established that DRA's canonical text-extraction
 * pipeline can silently lose graphical topology (flowchart arrow routing).
 * DRA-DOC-0028's admission and DRA-ACQ-024 Phase 2's robustness experiment
 * then showed that, for THAT specific document, the lost routing was
 * MATERIAL_BOUNDED — a diligent reader could reconstruct the correct
 * regulatory outcome from Appendix B's plain-text checklist, so the loss
 * was recoverable elsewhere in the same document's canonical
 * representation. This programme asks a sharper, harder question: does an
 * authoritative document exist whose graphically-encoded material meaning
 * is lost by extraction AND cannot be reconstructed from ANY other part of
 * that document's canonical representation (prose, captions, tables,
 * appendices, checklists, summaries, footnotes, or repeated figures)? A
 * negative result (NO_QUALIFIED_CANDIDATE_FOUND) is an explicitly
 * acceptable and useful Phase 1 outcome; this module does not lower the
 * qualification bar merely to admit a 29th document.
 *
 * SIX-CONDITION QUALIFICATION TEST (from the task specification) — a
 * candidate relationship must be: (1) materially relevant to the
 * document's meaning; (2) encoded graphically; (3) not preserved
 * faithfully by extraction; (4) not independently stated in surrounding
 * prose; (5) not reconstructable from tables, appendices, captions, or
 * other document content; and (6) associated with a defensible, objective
 * ground truth. Only relationships passing all six qualify as
 * NON_REDUNDANT primary-candidate material.
 *
 * MANDATORY REDUNDANCY AUDIT — for every promising graphical claim
 * examined below, the WHOLE source document (not just the nearest
 * paragraph) was searched — prose, captions, tables, appendices,
 * footnotes/endnotes, and repeated or cross-referenced figures — and the
 * result classified as REDUNDANT_COMPLETE, REDUNDANT_PARTIAL, or
 * NON_REDUNDANT. Only NON_REDUNDANT or exceptionally strong
 * REDUNDANT_PARTIAL findings are treated as serious primary-candidate
 * material, per the task specification.
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at
 * DRA-ACQ-018 through DRA-ACQ-024) — No candidate in CANDIDATE_REGISTER
 * was fetched into, or run through, evaluator 0.1.2, the DRA pipeline, or
 * any of its stages, at any point during this Phase 1 investigation.
 * Candidate selection used only (a) live HTTP/licence/official-source
 * verification, (b) direct visual inspection of each PDF's own rendered
 * pages (via `pdftoppm`), (c) extracted-text inspection (via `pdftotext
 * -layout`, matching the pipeline's own production extraction convention),
 * (d) PDF-internal structural inspection (`pdfinfo`, `pdffonts`,
 * `pdfimages -list`), and (e) full-document keyword/grep redundancy audits
 * over the extracted text — never the DRA evaluator's own output, and
 * never a prediction of whether a candidate would make the evaluator fail.
 *
 * NO COMPUTER VISION / NO CHART PARSING — Phase 1 does not build, invoke,
 * or propose any image-understanding, computer-vision, OCR-on-figures, or
 * chart-parsing capability. All figure content below was read by a human
 * (the agent) directly viewing rendered page images; the ground-truth
 * comparisons record what a human sees against what `pdftotext -layout`
 * and full-text grep produce, nothing more automated than that.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This
 * module does not download-and-freeze, admit, or evaluate any document.
 * It does not create DRA-DOC-0029, a new freeze record, a new acquisition
 * record, or a DRA-BMK-024 checkpoint, and it does not modify evaluator
 * 0.1.2, any pipeline stage, normalisation, extraction, or any existing
 * frozen artefact, including DRA-ENG-015, DRA-ENG-016, or DRA-ENG-017.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 28 documents (DRA-DOC-0001-0028).
 *
 * All live verification (HTTP status, repeated-fetch SHA-256 digests,
 * licence statement text, rendered-page visual inspection, pdfinfo/
 * pdffonts/pdfimages/pdftotext structural inspection) was performed on
 * 2026-08-11 against the documents' official publisher URLs and is
 * recorded here as fixed data. This module does not re-fetch anything at
 * runtime or during test execution, and it does not invoke the DRA
 * evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 28,
  priorFinding:
    "DRA-DOC-0028 (DRA-ACQ-024) demonstrated genuine flowchart arrow-topology loss at extraction, but the " +
    "DRA-ACQ-024 Phase 2 robustness experiment found the loss was MATERIAL_BOUNDED: the same document's " +
    "Appendix B checklist independently reconstructs the correct regulatory outcome for every tested path, so " +
    "the missing routing information is recoverable elsewhere in the document's canonical representation.",
  followUpQuestion:
    "Does an authoritative document exist whose graphically-encoded material meaning is (a) lost by extraction " +
    "AND (b) not reconstructable from any other part of that same document's canonical representation? This " +
    "programme searches specifically for NON_REDUNDANT graphical semantics, not merely for 'contains a figure'.",
  centralResearchQuestion:
    "Can an authoritative document be found whose graphically-encoded material relationship both fails to " +
    "survive DRA's canonical text-extraction path AND cannot be reconstructed from any other content in that " +
    "same document (prose, captions, tables, appendices, checklists, summaries, footnotes, or other figures)?",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO_QUALIFIED_CANDIDATE_FOUND is an explicitly acceptable and useful Phase 1 outcome per the task " +
    "specification. This module does not lower the six-condition qualification bar, and does not force a " +
    "candidate to qualify, merely to admit a 29th corpus document.",
  investigationBreadthInstruction:
    "Discovery is not limited to flowcharts. Constructs investigated include causal/directed-acyclic-graph " +
    "diagrams, network/architecture diagrams with dependency arrows, and colour-coded geographic/contour maps, " +
    "spanning scientific-journal, standards-body, and geological-survey genres, per the task specification's " +
    "instruction to search broadly across document genres and graphical construct kinds.",
});

// ---------------------------------------------------------------------------
// Part 2 — Redundancy classification, qualification test, and construct kinds
// ---------------------------------------------------------------------------

export const REDUNDANCY_CLASSIFICATIONS = Object.freeze([
  "REDUNDANT_COMPLETE",
  "REDUNDANT_PARTIAL",
  "NON_REDUNDANT",
] as const);
export type RedundancyClassification = (typeof REDUNDANCY_CLASSIFICATIONS)[number];

export const GRAPHIC_CONSTRUCT_KINDS = Object.freeze([
  "CAUSAL_DIRECTED_ACYCLIC_GRAPH",
  "ARCHITECTURE_OR_LOGICAL_COMPONENT_DIAGRAM",
  "COLOUR_CODED_CONTOUR_OR_CHOROPLETH_MAP",
  "BRANCHING_TOPOLOGY_FLOWCHART",
] as const);
export type GraphicConstructKind = (typeof GRAPHIC_CONSTRUCT_KINDS)[number];

/** The six conditions a candidate relationship must satisfy to qualify as NON_REDUNDANT primary-candidate material. */
export const QUALIFICATION_TEST_CONDITIONS: readonly string[] = Object.freeze([
  "materially_relevant_to_the_documents_meaning",
  "encoded_graphically",
  "not_preserved_faithfully_by_extraction",
  "not_independently_stated_in_surrounding_prose",
  "not_reconstructable_from_tables_appendices_captions_or_other_document_content",
  "has_a_defensible_objective_ground_truth",
]);

export const NON_MATERIALITY_REJECTION_EXAMPLES: readonly string[] = Object.freeze([
  "decorative_or_presentation_only_visual_styling_with_no_interpretive_consequence",
  "figure_that_merely_repeats_a_number_or_category_already_given_in_prose_in_a_prettier_form",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = Object.freeze(["VERIFIED", "NOT_VERIFIED"] as const);
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = Object.freeze([
  "VERIFIED",
  "PROVISIONAL",
  "NOT_VERIFIED",
  "RESTRICTIVE_UNCONFIRMED",
] as const);
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = Object.freeze(["VERIFIED_ACCESSIBLE", "BLOCKED", "NOT_VERIFIED"] as const);
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = Object.freeze(["BYTE_STABLE", "TEXT_STABLE", "UNKNOWN", "BLOCKED"] as const);
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = Object.freeze([
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED_SEMANTIC_REDUNDANCY",
  "REJECTED_DOCUMENT_STRUCTURE_MISFIT",
  "REJECTED_GOVERNANCE",
  "REJECTED_BLOCKED",
] as const);
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface RedundancyAuditEntry {
  readonly searchedLocation: string;
  readonly searchTermsOrMethod: string;
  readonly finding: string;
  readonly classification: RedundancyClassification;
}

export interface GroundTruthExample {
  readonly category: string;
  readonly location: string;
  readonly sourceGraphicContent: string;
  readonly materialRelationship: string;
  readonly canonicalRepresentationObserved: string;
  readonly redundancyAudit: readonly RedundancyAuditEntry[];
  readonly recoverabilityVerdict: RedundancyClassification;
  readonly note: string;
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
  readonly approximateSize: string;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly licenceReuseBasis: string;
  readonly licenceReuseStatus: LicenceReuseStatus;
  readonly httpAccessibility: HttpAccessibilityStatus;
  readonly accessibilityEvidence: string;
  readonly sourceStabilityStatus: SourceStabilityStatus;
  readonly stabilityObservations: string;
  readonly nativeRepresentation: boolean;
  readonly nativeRepresentationEvidence: string;
  readonly graphicConstructKinds: readonly GraphicConstructKind[];
  readonly visuallyInspectedPages: readonly string[];
  readonly groundTruthExamples: readonly GroundTruthExample[];
  readonly eng015InteractionNote: string;
  readonly eng016InteractionNote: string;
  readonly eng017InteractionNote: string;
  readonly corpusDiversityContribution: string;
  readonly corpusDiversityLimitation: string;
  readonly knownRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
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

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = deepFreeze([
  // --- Candidate 1: CDC EID Legionella longbeachae causal DAG (primary) ---
  Object.freeze({
    candidateId: "DRA-CAND-025-01",
    title:
      "Risk Factors for Legionella longbeachae Legionnaires' Disease, New Zealand (including Technical " +
      "Appendix Figure: causal diagram for compost use and Legionnaires' disease)",
    publisher: "Centers for Disease Control and Prevention (CDC), Emerging Infectious Diseases journal",
    jurisdiction: "United States (publisher); study conducted in New Zealand",
    domain: "HEALTHCARE",
    documentType: "ARTICLE",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
    publicationDate: "2017-07 (Emerging Infectious Diseases, Volume 23, Number 7, DOI 10.3201/eid2307.161429)",
    approximateSize: "9 pages (combined article + technical appendix)",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — CDC's own 'Copyright, Usage, and Disclaimer' page for Emerging Infectious Diseases " +
      "states verbatim: 'Emerging Infectious Diseases is published by the Centers for Disease Control and " +
      "Prevention, a U.S. Government agency. Therefore, materials published in Emerging Infectious Diseases, " +
      "including text, figures, tables, and photographs are in the public domain and can be reprinted or used " +
      "without permission with proper citation,' and separately confirms the journal is fully open access " +
      "(Budapest Open Access Initiative terms, no reuse restriction). This is a first-time, direct " +
      "confirmation of the licence basis for this publisher (not previously used in the corpus).",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on wwwnc.cdc.gov returned HTTP 200, content-type application/pdf, no authentication or " +
      "paywall, for both the combined article PDF and the standalone technical-appendix PDF.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the combined-article URL both returned identical SHA-256 " +
      "4cf5ce4f27f9b712cc0d9898eefd8b7d39f7964ab36af978931c2ed0c7671a00; two independent live GETs of the " +
      "standalone technical-appendix URL both returned identical SHA-256 " +
      "aae514a1700e54740edcd6eac99fe48080c965dfba733d2fa24b255999bb99f9.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports a born-digital producer (iTextSharp for the combined PDF; Acrobat PDFMaker for the " +
      "standalone appendix); pdftotext -layout recovers clean, accurate prose throughout every non-figure " +
      "section of both files, with no OCR-confusable-character artefacts — deliberately native-text to avoid " +
      "confounding this candidate with the DRA-ACQ-023/DRA-ENG-017 scan/OCR dimension.",
    graphicConstructKinds: ["CAUSAL_DIRECTED_ACYCLIC_GRAPH"] as const,
    visuallyInspectedPages: [
      "Technical Appendix, page 1 (rendered at 200 DPI via pdftoppm): the causal diagram (directed acyclic " +
        "graph) for the relationship between compost use and Legionnaires' disease, generated with DAGitty — " +
        "approximately 17 nodes (Has_a_garden, Does_gardening, Uses_compost, Tip/Trowel, Rip_open, " +
        "Use_indoors, Compost_hand_to_face, Aerosolise, Inhale, Pets, Compost_on_pets, " +
        "Close_contact_with_pets, LD, Smoking, COPD, Reduced_lung_function, Immunocompromise) connected by " +
        "roughly 20 directed edges across three sub-structures: a compost-exposure fan-in to an " +
        "Aerosolise/Inhale mediator pair, a pets-to-inhalation side pathway, and a smoking/COPD-to-reduced-" +
        "lung-function side pathway, all converging on the outcome node LD.",
    ],
    groundTruthExamples: [
      {
        category: "confirmed_stated_relationship_used_as_internal_positive_control",
        location: "Technical Appendix Figure caption, and the causal-diagram image itself",
        sourceGraphicContent:
          "The diagram shows Smoking and COPD as a side branch connected to Reduced_lung_function, which " +
          "feeds into LD, structurally separate from the Uses_compost branch, with no edge at all between " +
          "Smoking/COPD and Uses_compost or Does_gardening.",
        materialRelationship:
          "Smoking and COPD are not confounders of the compost-use/Legionnaires'-disease relationship, " +
          "because the diagram encodes no causal path between them and compost use.",
        canonicalRepresentationObserved:
          "The figure's own caption text (extracted cleanly by pdftotext -layout) states this in full " +
          "sentences: 'this diagram ... makes clear that smoking and COPD are not confounders of the " +
          "relationship between compost use and Legionnaires' disease; no relationship between smoking and " +
          "COPD and compost use was found.'",
        redundancyAudit: [
          {
            searchedLocation: "Technical Appendix Figure caption (same page as the diagram)",
            searchTermsOrMethod: "direct reading of the caption text as extracted by pdftotext -layout",
            finding: "The caption explicitly restates this specific relationship in prose.",
            classification: "REDUNDANT_COMPLETE",
          },
        ],
        recoverabilityVerdict: "REDUNDANT_COMPLETE",
        note:
          "Recorded as the required internal positive control: at least one relationship carried by this same " +
          "diagram IS fully recoverable from text (the figure's own caption), demonstrating the redundancy " +
          "audit is discriminating and not simply labelling every relationship NON_REDUNDANT by default.",
      },
      {
        category: "unstated_mediation_structure_across_five_distinct_compost_exposure_routes",
        location:
          "Causal diagram: Tip/Trowel, Rip_open, Use_indoors, and Compost_hand_to_face nodes, each with a " +
          "directed edge into either Aerosolise or Inhale, versus the main-article prose and Tables 3-4",
        sourceGraphicContent:
          "The diagram shows four textually distinct compost-handling exposure variables (tipping/troweling, " +
          "ripping open a bag, using compost indoors, hand-to-face contact after using compost) as four " +
          "separate nodes, each independently wired into the Aerosolise or Inhale mediator nodes, forming a " +
          "multi-route fan-in structure rather than a single generic 'compost exposure' node.",
        materialRelationship:
          "The specific exposure route (aerosolisation activities vs. hand-to-face activities) determines " +
          "which mediating mechanism (Aerosolise vs. direct Inhale) is invoked in the causal model used to " +
          "interpret the study's adjusted odds ratios — the diagram is the operative specification of the " +
          "adjustment/mediation structure the statistical analysis is built on.",
        canonicalRepresentationObserved:
          "pdftotext -layout output for the technical-appendix page containing this diagram extracts ZERO " +
          "characters from the diagram region (confirmed via `pdfimages -list`: the diagram is embedded as a " +
          "1020x886 indexed raster image with a soft mask, not as text or vector paths with a text layer) — " +
          "only the surrounding caption paragraph is extracted. The main article's prose (grep-searched in " +
          "full for 'aerosol' and 'hand-to-face') discusses 'aerosolization' and 'hand-to-face transfer' only " +
          "as two named composite variables in a multivariable-regression narrative, without stating which of " +
          "the four individual node-level exposure activities maps to which of the two mediators, and without " +
          "stating the fan-in topology itself.",
        redundancyAudit: [
          {
            searchedLocation: "Main article body text (Methods and Results sections, full text)",
            searchTermsOrMethod: "grep -i for 'aerosol', 'hand-to-face', 'tip', 'trowel', 'indoors'",
            finding:
              "Prose names the two composite variables (aerosolisation activities; hand-to-face activities) " +
              "and states they were combined for modelling purposes, but never enumerates which of the four " +
              "diagram nodes belongs to which composite, nor states that these are mediators feeding into " +
              "the same two downstream nodes as shown in the diagram.",
            classification: "REDUNDANT_PARTIAL",
          },
          {
            searchedLocation: "Table 4 ('Univariate analyses of the associations between gardening behaviors...')",
            searchTermsOrMethod: "full read of Table 4's row labels and the surrounding Results paragraph",
            finding:
              "Table 4 tabulates univariate odds ratios for individual hand-to-face activities (ate/drank, " +
              "touched face, smoked, any opportunity), which is a different and narrower list than the " +
              "diagram's four exposure-route nodes, and states no causal-graph relationship (mediator vs. " +
              "independent path) at all — it is a statistical association table, not a topology restatement.",
            classification: "NON_REDUNDANT",
          },
          {
            searchedLocation: "Whole-document check: captions, footnotes, appendix references, repeated figures",
            searchTermsOrMethod:
              "full-text grep for the diagram's own node-label strings ('Tip/Trowel', 'Rip_open', " +
              "'Use_indoors', 'Compost_hand_to_face', 'Aerosolise') across the entire combined PDF's extracted " +
              "text",
            finding:
              "None of the diagram's five node-label strings appear anywhere in the extracted text outside " +
              "the (non-extractable) image itself — confirming the specific fan-in topology exists only in " +
              "the graphic, in no caption, table, footnote, or appendix text anywhere in the document.",
            classification: "NON_REDUNDANT",
          },
        ],
        recoverabilityVerdict: "NON_REDUNDANT",
        note:
          "Satisfies all six qualification conditions: materially relevant (defines the mediation structure " +
          "underlying the paper's central multivariable-adjustment claim), graphically encoded (a DAGitty-" +
          "generated diagram), not preserved by extraction (zero text recovered from the diagram region, " +
          "confirmed via pdfimages), not independently stated in prose (only named at the composite-variable " +
          "level, not the node/edge level), not reconstructable from tables (Table 4 covers a different, " +
          "narrower variable list with no topology information), and has a defensible ground truth (the " +
          "diagram is a discrete, enumerable DAGitty graph with objectively countable nodes and edges).",
      },
      {
        category: "unstated_pets_to_inhalation_side_pathway",
        location:
          "Causal diagram: Pets -> Compost_on_pets -> Close_contact_with_pets -> Inhale, versus Table 3's " +
          "univariate pet-ownership associations",
        sourceGraphicContent:
          "The diagram encodes pet ownership as feeding a distinct three-node side chain (contamination of " +
          "pets by compost, then close contact with pets) that joins the main causal pathway only at the " +
          "Inhale node — i.e., pets are modelled as a secondary route to the same physiological mediator as " +
          "direct compost aerosolisation, not as an independent direct risk factor for the outcome.",
        materialRelationship:
          "Whether pet ownership is modelled as acting through inhalation (a mediated pathway sharing the " +
          "same mechanism as compost aerosolisation) or as an independent direct risk factor changes how a " +
          "reader should interpret the cat-ownership association reported elsewhere in the paper (OR 3.0, " +
          "95% CI 1.3-6.8) — the diagram asserts it operates through the same causal mechanism as compost use.",
        canonicalRepresentationObserved:
          "Table 3 ('Univariate analyses of the associations between garden type, garden exposures, or pets') " +
          "reports raw odds ratios for owning a dog, cat, or bird, with no mediator, no mention of compost " +
          "contamination of pets, and no statement of a causal pathway; grep of the full combined text for " +
          "'immunocomp' and 'reduced lung' (the diagram's two other side-chain concepts) returns zero matches " +
          "anywhere in the document, confirming those nodes' connections are asserted only by the diagram.",
        redundancyAudit: [
          {
            searchedLocation: "Table 3 and its surrounding Results paragraph",
            searchTermsOrMethod: "full read of Table 3 and the paragraph introducing it",
            finding:
              "Table 3 gives a direct case/control odds ratio for pet ownership without asserting any " +
              "mediating mechanism or intermediate node; it is evidentially compatible with, but does not " +
              "state, the diagram's specific mediated-through-inhalation structure.",
            classification: "NON_REDUNDANT",
          },
          {
            searchedLocation:
              "Whole-document grep for 'Compost_on_pets', 'Close_contact_with_pets', 'immunocomp', 'reduced " +
              "lung' (Immunocompromise and Reduced_lung_function node labels)",
            searchTermsOrMethod: "full-text grep across the entire combined PDF's extracted text",
            finding:
              "Zero matches for all four terms anywhere outside the image itself; the pets-mediation chain " +
              "and the Immunocompromise/Reduced_lung_function nodes are asserted nowhere in extractable text.",
            classification: "NON_REDUNDANT",
          },
        ],
        recoverabilityVerdict: "NON_REDUNDANT",
        note:
          "A second, independently confirmed NON_REDUNDANT instance in the same diagram, spanning a different " +
          "sub-structure (pets, and the smoking/COPD/reduced-lung-function/immunocompromise side of the " +
          "graph) from the compost fan-in example above, demonstrating the finding is a property of this " +
          "diagram's design (an entire causal model rendered as a single unextractable image) rather than a " +
          "one-off artefact of a single edge.",
      },
    ],
    eng015InteractionNote:
      "DRA-ENG-015 detects loss of fill-colour/shading semantics via SVG-rendering-based colour-diversity " +
      "measurement, aimed at table-cell shading. This diagram uses only two flat node-outline colours (blue " +
      "for observed variables, grey for unobserved) to distinguish node categories, not to encode a " +
      "continuous or categorical VALUE the way table shading does; more importantly, the finding here is " +
      "total loss of the entire diagram (all node labels and all edges), not a shading-specific loss, so " +
      "DRA-ENG-015's fill-colour-diversity signal is not the relevant detection mechanism even if it were " +
      "wired to this candidate.",
    eng016InteractionNote:
      "DRA-ENG-016 addresses citation-marker/reference-entry linkage (e.g., bracket-citation splitting across " +
      "line wraps). This candidate's finding concerns a causal-diagram image with no citation markers " +
      "involved; DRA-ENG-016 is not applicable and would give no signal either way.",
    eng017InteractionNote:
      "DRA-ENG-017 classifies representation provenance (NATIVE_TEXT/OCR_TEXT_LAYER/IMAGE_ONLY/" +
      "MIXED_REPRESENTATION) and OCR fidelity — i.e., whether extracted TEXT faithfully represents what " +
      "characters exist on the page. This document is unambiguously NATIVE_TEXT for its prose (Acrobat/" +
      "iTextSharp-authored, no scan artefacts), so DRA-ENG-017 would correctly report high fidelity for the " +
      "text that IS present, while giving no signal about the diagram: the diagram was never OCR'd and was " +
      "never expected to yield text, so there is no 'corrupted OCR text' for DRA-ENG-017's fidelity model to " +
      "flag — the loss here is a complete absence of a text representation for an entire semantic object " +
      "(the causal graph), a genuinely different and currently unaddressed representation class from OCR " +
      "corruption of characters that do have a text-layer counterpart.",
    corpusDiversityContribution:
      "First candidate in the corpus targeting causal/directed-acyclic-graph diagrams specifically (a " +
      "distinct construct from DRA-DOC-0028's decision flowchart); first candidate publisher confirmed as " +
      "CDC/Emerging Infectious Diseases (a new, directly-verified PUBLIC_DOMAIN open-access scientific-journal " +
      "basis); demonstrates total (not partial) loss of an entire graphical semantic object, a stronger " +
      "failure mode than DRA-DOC-0028's partial arrow-routing loss.",
    corpusDiversityLimitation:
      "Repeats the HEALTHCARE domain already well-represented in the corpus (DRA-DOC-0013, DRA-DOC-0028); " +
      "the candidate document itself is short (9 pages combined), so if admitted it would contribute a " +
      "narrower base of surrounding prose/statements than most other corpus documents.",
    knownRisks: [
      "The technical appendix (containing the diagram) is hosted as both a standalone 2-page PDF and as pages " +
        "within a 9-page 'combined' PDF that also includes the full main article; a Phase 2 admission would " +
        "need to decide explicitly which of the two is the canonical acquisition target (the combined PDF is " +
        "recommended, since it is the only one containing both the diagram and the prose needed for a " +
        "meaningful redundancy/materiality evaluation).",
      "The combined PDF's Producer metadata (iTextSharp) indicates it was synthesised by CDC's own publishing " +
        "pipeline rather than being the 'as typeset' journal PDF; this is consistent with the standalone " +
        "technical-appendix PDF's independently-confirmed SHA-256 stability and does not affect the diagram's " +
        "content, but should be recorded precisely in a Phase 2 freeze record.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 2: NIST SP 800-207 Zero Trust Architecture (rejected, semantic redundancy) ---
  Object.freeze({
    candidateId: "DRA-CAND-025-02",
    title: "NIST Special Publication 800-207: Zero Trust Architecture",
    publisher: "National Institute of Standards and Technology (NIST)",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "POLICY",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-207.pdf",
    publicationDate: "2020-08-10",
    approximateSize: "59 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a NIST Special Publication, a work of the U.S. federal government under 17 U.S.C. " +
      "§105, the same basis already used for DRA-DOC-0012 (NIST AI RMF).",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on nvlpubs.nist.gov returned HTTP 200, content-type application/pdf, no authentication or " +
      "paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "0290d6ece24874287316f4bf430fef770aa4ec08a2227c8f2c1e5b2ff975e03d.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports an Acrobat PDFMaker/Word producer (born-digital); pdftotext -layout recovers clean " +
      "prose throughout, with no scan or OCR artefacts.",
    graphicConstructKinds: ["ARCHITECTURE_OR_LOGICAL_COMPONENT_DIAGRAM"] as const,
    visuallyInspectedPages: [
      "Page 9 (pdftotext -layout cross-check, figure not separately rendered): Figure 2, 'Core Zero Trust " +
        "Logical Components' — a logical-architecture diagram showing the policy engine (PE), policy " +
        "administrator (PA), and policy enforcement point (PEP), plus five external data-source components " +
        "(CDM, industry compliance, threat intelligence, activity logs, data access policies, PKI, ID " +
        "management, SIEM) connected via control-plane and data-plane arrows.",
    ],
    groundTruthExamples: [
      {
        category: "component_connectivity",
        location: "Figure 2, page 9: each of the seven external data-source/support components' link to the PE",
        sourceGraphicContent:
          "The diagram draws a directed arrow from each of the seven support components (CDM, industry " +
          "compliance, threat intelligence, logs, data access policies, PKI/ID management, SIEM) into the " +
          "policy engine, and a bidirectional control-plane link between PE/PA and PEP.",
        materialRelationship:
          "Which systems feed decision-relevant input into the policy engine, and via which plane " +
          "(control vs. data), is the architecture's core dependency structure.",
        canonicalRepresentationObserved:
          "Section 3's prose individually describes every one of the seven components in full paragraphs " +
          "immediately following the figure, explicitly stating each one's role and that it 'provides the " +
          "policy engine with information' or is used 'as input to a trust algorithm,' and separately states " +
          "that PA communicates with PEP 'via the control plane' while application data uses 'a separate ... " +
          "data plane.'",
        redundancyAudit: [
          {
            searchedLocation: "Section 3 prose (component-by-component bullet descriptions, pages 9-11)",
            searchTermsOrMethod: "full read of the seven component-description bullets following Figure 2",
            finding:
              "Every arrow shown in the diagram (each of the seven components feeding the PE; PA-PEP over the " +
              "control plane; PEP guarding the trust-zone boundary) is independently and explicitly restated " +
              "in prose, naming both the source and destination of each relationship.",
            classification: "REDUNDANT_COMPLETE",
          },
        ],
        recoverabilityVerdict: "REDUNDANT_COMPLETE",
        note:
          "This document was investigated specifically because architecture diagrams with dependency arrows " +
          "were named as a preferred construct to search for; the diagram's connectivity is, however, fully " +
          "and individually narrated in prose immediately after the figure, making this an " +
          "INDEPENDENTLY_COMPLETE_PROSE case (mirroring the NIST CSF 2.0 wheel-diagram rejection already on " +
          "record from DRA-ACQ-024) rather than a NON_REDUNDANT candidate.",
      },
    ],
    eng015InteractionNote: "Not applicable — the diagram uses no fill colour or shading to encode meaning.",
    eng016InteractionNote: "Not applicable — no citation markers are involved.",
    eng017InteractionNote: "Not applicable — this document is unambiguously NATIVE_TEXT.",
    corpusDiversityContribution:
      "Would have added an architecture/dependency-diagram construct kind not present in DRA-DOC-0028, but " +
      "this value is moot given the rejection below.",
    corpusDiversityLimitation:
      "Repeats the TECHNICAL/NIST/PUBLIC_DOMAIN profile already established by DRA-DOC-0012.",
    knownRisks: [],
    qualificationOutcome: "REJECTED_SEMANTIC_REDUNDANCY",
    rejectionOrDeferralReason:
      "Figure 2's full connectivity structure is independently and completely restated in the prose " +
      "immediately following it; genuinely investigated (component-by-component prose read against the " +
      "rendered diagram) but found REDUNDANT_COMPLETE, not NON_REDUNDANT, and therefore does not qualify.",
  }),
  // --- Candidate 3: USGS Seismic-Hazard Maps for the Conterminous United States, 2014 (rejected, structural misfit) ---
  Object.freeze({
    candidateId: "DRA-CAND-025-03",
    title: "Seismic-Hazard Maps for the Conterminous United States, 2014 (USGS Scientific Investigations Map 3325)",
    publisher: "U.S. Geological Survey (USGS)",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://pubs.usgs.gov/sim/3325/pdf/SIM3325_sheet1.pdf",
    publicationDate: "2015-04-08",
    approximateSize: "1 page (2232 x 1728 pt map sheet); 6 such sheets published under SIM 3325 in total",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a USGS Scientific Investigations Map, a work of the U.S. federal government under " +
      "17 U.S.C. §105.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on pubs.usgs.gov returned HTTP 200, content-type application/pdf, no authentication or " +
      "paywall, for the map-sheet PDF and its index directory.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical sheet-1 URL both returned identical SHA-256 " +
      "b9b97ffa6ba562e0ccc17e2d5efd55428cc164a1918544b66d9675c5fccef457.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports an Adobe Illustrator producer (born-digital vector cartography); pdftotext -layout " +
      "recovers real embedded text: the map's plotted peak-ground-acceleration values are numeric text runs " +
      "positioned at their map coordinates, not a raster image.",
    graphicConstructKinds: ["COLOUR_CODED_CONTOUR_OR_CHOROPLETH_MAP"] as const,
    visuallyInspectedPages: [
      "Sheet 1, single page: examined via pdftotext -layout (not separately rendered with pdftoppm, since the " +
        "structural-fit problem identified below made further visual inspection unnecessary) — the page " +
        "consists of a US map with hundreds of scattered decimal-valued text labels representing peak ground " +
        "acceleration at grid points, plus a legend and title block, with no narrative sentences.",
    ],
    groundTruthExamples: [],
    eng015InteractionNote: "Not evaluated — see rejection reason.",
    eng016InteractionNote: "Not evaluated — see rejection reason.",
    eng017InteractionNote: "Not evaluated — see rejection reason.",
    corpusDiversityContribution:
      "Would have been the corpus's first geographic/contour-map candidate and the strongest theoretical case " +
      "for non-redundancy (a continuous, thousands-of-points spatial value field cannot practically be " +
      "restated in any finite prose passage), but the structural problem below prevented pursuing it further.",
    corpusDiversityLimitation:
      "The publication series (SIM 3325) consists of six standalone map sheets with no accompanying pamphlet " +
      "or narrative text document; the USGS publication landing page confirms 'This publication consists of " +
      "six map sheets ... and metadata,' with no separate prose report.",
    knownRisks: [
      "DRA's pipeline is built to evaluate claims/statements extracted from prose; a document that is almost " +
        "entirely a scattered numeric-label map with a short legend and no narrative sentences would very " +
        "likely yield zero or near-zero extractable statements at Stage 2, making a meaningful redundancy " +
        "audit or materiality assessment impossible to conduct within this document's own canonical " +
        "representation — there is no prose to search for redundancy against in the first place.",
    ],
    qualificationOutcome: "REJECTED_DOCUMENT_STRUCTURE_MISFIT",
    rejectionOrDeferralReason:
      "Genuinely investigated (fetched, pdfinfo/pdftotext-inspected, and confirmed as a real native-vector " +
      "contour map with byte-stable public-domain access), but the document consists almost entirely of " +
      "scattered numeric map labels with no accompanying narrative prose, table, or appendix of any kind. The " +
      "six-condition qualification test presupposes a document with prose/tables/appendices to audit for " +
      "redundancy against; a document with essentially no prose cannot produce a meaningful REDUNDANT vs. " +
      "NON_REDUNDANT finding, since there is no non-graphical content to compare against. Recorded as a " +
      "genre-level finding (representation confound distinct from governance or redundancy) rather than " +
      "forcing a redundancy verdict onto a document type the qualification test cannot meaningfully be " +
      "applied to.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

/**
 * Deterministic, pre-declared ranking rule: candidates with at least one NON_REDUNDANT ground-truth example
 * (confirmed by direct visual/text inspection), VERIFIED official-source and licence status, and
 * VERIFIED_ACCESSIBLE + a stable source rank first, ordered by descending count of NON_REDUNDANT ground-truth
 * examples (more independently-confirmed non-redundant relationships = stronger candidate). Candidates
 * rejected for document-structure misfit or semantic redundancy rank below any qualifying candidate
 * regardless of accessibility, since passing the six-condition qualification test is a prerequisite, not a
 * tie-breaker.
 */
function rankCandidates(candidates: readonly CandidateRecord[]): readonly string[] {
  const nonRedundantCount = (c: CandidateRecord) =>
    c.groundTruthExamples.filter((g) => g.recoverabilityVerdict === "NON_REDUNDANT").length;
  const fullyQualified = candidates
    .filter(
      (c) =>
        c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
        c.licenceReuseStatus === "VERIFIED" &&
        c.officialSourceStatus === "VERIFIED" &&
        nonRedundantCount(c) > 0,
    )
    .slice()
    .sort((a, b) => nonRedundantCount(b) - nonRedundantCount(a));
  const structureMisfit = candidates.filter((c) => c.qualificationOutcome === "REJECTED_DOCUMENT_STRUCTURE_MISFIT");
  const semanticRedundant = candidates.filter((c) => c.qualificationOutcome === "REJECTED_SEMANTIC_REDUNDANCY");
  const rest = candidates.filter(
    (c) => !fullyQualified.includes(c) && !structureMisfit.includes(c) && !semanticRedundant.includes(c),
  );
  return Object.freeze(
    [...fullyQualified, ...structureMisfit, ...semanticRedundant, ...rest].map((c) => c.candidateId),
  );
}

export const RANKED_CANDIDATE_IDS: readonly string[] = rankCandidates(CANDIDATE_REGISTER);
export const PRIMARY_CANDIDATE_ID = "DRA-CAND-025-01";
export const ALTERNATE_CANDIDATE_ID: string | null = null;
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(["DRA-CAND-025-02", "DRA-CAND-025-03"]);

export function getCandidateById(candidateId: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export function primaryCandidate(): CandidateRecord {
  const candidate = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!candidate) throw new Error(`Primary candidate ${PRIMARY_CANDIDATE_ID} not found in CANDIDATE_REGISTER`);
  return candidate;
}

export type Phase1Verdict = "QUALIFIED" | "NO_QUALIFIED_CANDIDATE_FOUND" | "BLOCKED";

/**
 * QUALIFIED requires: VERIFIED official source, VERIFIED licence, VERIFIED_ACCESSIBLE + BYTE_STABLE or
 * TEXT_STABLE, native (non-OCR) representation, at least one visually inspected page, at least one
 * ground-truth example with recoverabilityVerdict === "NON_REDUNDANT" (satisfying all six qualification
 * conditions), AND at least one ground-truth example with a non-NON_REDUNDANT verdict recorded as an
 * internal positive control (demonstrating the redundancy audit is discriminating, not defaulting every
 * relationship to NON_REDUNDANT). All hold for the primary candidate.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const accessible = c.httpAccessibility === "VERIFIED_ACCESSIBLE";
  const stable = c.sourceStabilityStatus === "BYTE_STABLE" || c.sourceStabilityStatus === "TEXT_STABLE";
  const officialAndLicensed = c.officialSourceStatus === "VERIFIED" && c.licenceReuseStatus === "VERIFIED";
  const visuallyVerified = c.visuallyInspectedPages.length > 0;
  const hasNonRedundantFinding = c.groundTruthExamples.some((g) => g.recoverabilityVerdict === "NON_REDUNDANT");
  const hasInternalControl = c.groundTruthExamples.some((g) => g.recoverabilityVerdict !== "NON_REDUNDANT");
  if (c.httpAccessibility === "BLOCKED") return "BLOCKED";
  if (
    accessible &&
    stable &&
    officialAndLicensed &&
    c.nativeRepresentation &&
    visuallyVerified &&
    hasNonRedundantFinding &&
    hasInternalControl
  ) {
    return "QUALIFIED";
  }
  return "NO_QUALIFIED_CANDIDATE_FOUND";
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
    proposedCorpusId: "DRA-DOC-0029",
  }),
  governance: Object.freeze({
    officialSourceStatus: primaryCandidate().officialSourceStatus,
    licenceReuseStatus: primaryCandidate().licenceReuseStatus,
    licenceReuseBasis: primaryCandidate().licenceReuseBasis,
    unresolvedQuestions: Object.freeze([
      "Whether the standalone 2-page technical-appendix PDF or the 9-page combined article+appendix PDF is " +
        "the canonical Phase 2 acquisition target must be decided explicitly; this module recommends the " +
        "combined PDF, since only it contains the prose needed to run the redundancy/materiality audit at " +
        "evaluation time.",
    ]),
  }),
  acquisition: Object.freeze({
    sourceFormat: primaryCandidate().sourceFormat,
    sourceStabilityStatus: primaryCandidate().sourceStabilityStatus,
    stabilityObservations: primaryCandidate().stabilityObservations,
    nativeRepresentation: primaryCandidate().nativeRepresentation,
    risks: primaryCandidate().knownRisks,
  }),
  evidenceContribution:
    "DRA-DOC-0029 would provide the corpus's first document demonstrating TOTAL loss of an entire graphical " +
    "semantic object (a causal diagram with ~17 nodes and ~20 edges, extracted as zero characters) that is " +
    "also NON_REDUNDANT against the whole document's prose, tables, and captions — a stronger and more " +
    "clear-cut finding than DRA-DOC-0028's partial, ultimately MATERIAL_BOUNDED flowchart-routing loss. It " +
    "carries two independently confirmed NON_REDUNDANT ground-truth examples (the compost-exposure fan-in " +
    "structure, and the pets/smoking/COPD side pathways) plus a genuine internal positive control (the " +
    "smoking/COPD-non-confounder fact, which IS fully restated in the figure's own caption).",
  corpusContribution:
    "Adds a first directly-confirmed PUBLIC_DOMAIN CDC/Emerging Infectious Diseases publisher basis and a " +
    "first causal-diagram/DAG construct kind; repeats the already-represented HEALTHCARE domain, selected " +
    "purely for graphics-semantics experimental merit consistent with the task's explicit instruction not to " +
    "select for publisher novelty over structural/failure-mode value.",
  risks: primaryCandidate().knownRisks,
  recommendationReasoning:
    "DRA-CAND-025-01 is the only candidate in this pass confirmed to satisfy all six qualification conditions " +
    "for at least one specific graphical relationship, backed by direct visual inspection (pdftoppm), " +
    "structural confirmation that the diagram is a non-extractable raster image (pdfimages -list), and a " +
    "full-document grep-based redundancy audit against the main article's prose and tables (not merely the " +
    "nearest caption). DRA-CAND-025-02 (NIST SP 800-207) was genuinely investigated as a promising " +
    "architecture/dependency-diagram candidate but rejected once its diagram's connectivity was confirmed " +
    "fully restated in the immediately following prose (REDUNDANT_COMPLETE), consistent with the DRA-ACQ-024 " +
    "finding that well-written technical standards commonly narrate their own diagrams completely. " +
    "DRA-CAND-025-03 (USGS Seismic-Hazard Maps) was genuinely investigated as the theoretically strongest " +
    "non-redundancy case (a continuous spatial value field with no possible finite prose restatement) but " +
    "rejected for a different reason: the publication has no accompanying prose, table, or appendix at all, " +
    "so the six-condition qualification test (which presupposes non-graphical content to audit against) " +
    "cannot be meaningfully applied to it. No candidate was chosen, or rejected, on the basis of whether it " +
    "seemed likely to make the evaluator fail; that determination is explicitly reserved for a future Phase 2 " +
    "evaluation and is out of scope for this Phase 1 discovery module.",
  alternateCandidateStatus:
    "No alternate is proposed. The task specification requires an alternate only if one is genuinely and " +
    "independently qualified; neither rejected candidate in this pass reached a NON_REDUNDANT finding, so " +
    "manufacturing an alternate would violate the task's explicit instruction not to lower standards merely " +
    "to produce a second option.",
});

// ---------------------------------------------------------------------------
// Part 6 — DRA-ENG-015/016/017 interaction analysis (observation only)
// ---------------------------------------------------------------------------

/**
 * Records the required consideration of whether the existing DRA-ENG-015 fill-colour detector, DRA-ENG-016
 * citation-integrity mechanism, or DRA-ENG-017 representation-provenance/fidelity model already cover the
 * risk demonstrated by the primary candidate. This is an observation, not an implementation change; no
 * detector or model code is modified.
 */
export const ENG_015_016_017_INTERACTION_ANALYSIS = Object.freeze({
  eng015Relevance: "NOT_APPLICABLE",
  eng015Reasoning:
    "DRA-ENG-015 measures fill-colour diversity to detect lost table-cell shading semantics. The primary " +
    "candidate's finding is total absence of an entire diagram's text representation (zero characters " +
    "extracted), not a colour-encoding loss within an otherwise-extracted table; DRA-ENG-015's signal would " +
    "not fire on, and was not designed to address, this failure mode.",
  eng016Relevance: "NOT_APPLICABLE",
  eng016Reasoning:
    "DRA-ENG-016 addresses citation-marker and reference-entry linkage integrity. The primary candidate's " +
    "diagram contains no citation markers; this dimension is unrelated.",
  eng017Relevance: "PARTIALLY_ADJACENT_BUT_DISTINCT",
  eng017Reasoning:
    "DRA-ENG-017 classifies representation provenance (NATIVE_TEXT/OCR_TEXT_LAYER/IMAGE_ONLY/" +
    "MIXED_REPRESENTATION) and OCR fidelity — whether extracted text faithfully represents page characters. " +
    "The primary candidate's document is classifiable as MIXED_REPRESENTATION under DRA-ENG-017's own " +
    "taxonomy (native text plus one embedded image region), and DRA-ENG-017 would correctly flag that the " +
    "diagram's region has no text layer at all. However, DRA-ENG-017's FIDELITY measure (how accurately OCR " +
    "text represents characters that ARE present) is not the same question as whether a NON-TEXT semantic " +
    "object's meaning (a causal graph's edges) is reconstructable elsewhere in the document — DRA-ENG-017 " +
    "would correctly report 'no text present in this region' but has no mechanism to determine whether that " +
    "absent content is redundant with, or unique relative to, the rest of the document's prose. That " +
    "redundancy judgement is the genuinely unresolved capability this programme's finding calls for.",
  doesEitherExistingMechanismSolveNonRedundancyDetection: false,
  nonRedundancyDetectionRequires: Object.freeze([
    "a_mechanism_that_can_enumerate_a_documents_graphical_semantic_claims_at_acquisition_time_and_cross_check_" +
      "them_against_the_full_extracted_prose_table_and_caption_text_for_restatement",
    "a_way_to_flag_to_downstream_evaluation_that_a_given_statement_or_claim_may_rely_on_graphical_content_with_" +
      "no_text_layer_counterpart_anywhere_in_the_document_rather_than_silently_treating_absence_as_absence_of_" +
      "a_claim",
  ]),
  architecturalChangeRequiredNow: false,
  note:
    "This analysis is Phase 1 observation only, required by the task specification's instruction to check " +
    "whether DRA-ENG-015, DRA-ENG-016, or DRA-ENG-017 already cover the candidate's risk before treating it " +
    "as novel. It proposes no code change and implements no new signal, no computer vision, and no chart " +
    "parsing; that determination (if any) is explicitly out of scope for this discovery-only phase.",
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0029";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "explicit_decision_between_standalone_technical_appendix_pdf_and_combined_article_pdf_as_acquisition_target",
  "deterministic_live_fetch_a_b_for_primary_candidate_with_fresh_digest_pinning",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0029",
  "run_evaluator_0_1_2_against_dra_doc_0029_in_a_dedicated_benchmark",
  "compare_source_diagram_topology_vs_extracted_vs_normalised_vs_statements_vs_evaluation_for_the_causal_" +
    "diagram_figure",
  "assess_whether_the_complete_absence_of_the_diagrams_content_propagates_into_statement_extraction_evidence_" +
    "linkage_or_materiality_as_a_silent_gap_rather_than_a_visible_flag",
  "record_confirmed_generalisable_weakness_or_isolated_anomaly_verdict_for_the_non_redundant_graphics_" +
    "semantics_hypothesis",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0029",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_025",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "modify_dra_eng_015_detector",
  "modify_dra_eng_016_mechanism",
  "modify_dra_eng_017_provenance_model",
  "build_or_invoke_computer_vision_or_chart_parsing",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_any_graphics_semantics_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
  "lower_the_six_condition_qualification_bar_to_force_a_candidate_to_qualify",
] as const);
