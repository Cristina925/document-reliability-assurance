/**
 * DRA-ACQ-024 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0028 (Graphics/Figure-Dependent Semantics Probe)
 *
 * CONTEXT — Every representation-fidelity probe run so far (DRA-ACQ-020
 * footnote density, DRA-ACQ-021 table cell shading / DRA-ENG-015,
 * DRA-ACQ-022 citation linkage / DRA-ENG-016, DRA-ACQ-023 scan/OCR
 * provenance / DRA-ENG-017) tested whether meaning that already exists in
 * the extractable TEXT layer survives the pipeline. This programme tests a
 * different and more fundamental question: whether the source document's
 * MEANING sometimes lives primarily in a figure, chart, diagram, or map —
 * a graphical object with no text-layer equivalent at all — such that no
 * amount of faithful text extraction could recover it. This is explicitly
 * NOT another footnote/reading-order probe (DRA-ENG-012/013), NOT another
 * table cell-shading probe (DRA-ENG-015), NOT another citation-linkage
 * probe (DRA-ENG-016), and NOT another scan/OCR provenance probe
 * (DRA-ENG-017); those four dimensions are excluded by the task
 * specification.
 *
 * CENTRAL RESEARCH QUESTION — Can DRA tell whether a proposition in a
 * source document depends on graphical information (a figure, chart,
 * diagram, or map) that does not survive the canonical machine-readable
 * (extracted-text) representation of that document?
 *
 * THREE-WAY DISTINCTION (required by the task specification) — Every
 * candidate figure examined below is classified into exactly one of:
 *   (1) INDEPENDENTLY_COMPLETE_PROSE     — the surrounding prose already
 *       states the figure's material content; the figure is a redundant
 *       visual restatement.
 *   (2) ILLUSTRATIVE_OF_COMPLETE_PROSE   — the figure decorates or
 *       visually summarises prose that is itself already complete
 *       (a weaker version of (1); still not the target).
 *   (3) MATERIAL_GRAPHIC_SEMANTICS       — the figure carries a
 *       proposition (a specific relationship, ordering, threshold, or
 *       topology) that is NOT recoverable from the surrounding prose, and
 *       that is lost or scrambled by the canonical text extraction path.
 * Only category (3) is the actual target of this probe; categories (1)
 * and (2) are recorded as rejected/control evidence, not as failures of
 * the discovery process.
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at
 * DRA-ACQ-018 through DRA-ACQ-023) — No candidate in CANDIDATE_REGISTER
 * was fetched into, or run through, evaluator 0.1.2, the DRA pipeline, or
 * any of its stages, at any point during this Phase 1 investigation.
 * Candidate selection used only (a) live HTTP/licence/official-source
 * verification, (b) direct visual inspection of each PDF's own rendered
 * pages (via `pdftoppm`), (c) extracted-text inspection (via `pdftotext
 * -layout`, matching the pipeline's own production extraction convention
 * as used in DRA-ACQ-002), and (d) PDF-internal structural inspection
 * (`pdfinfo`) — never the DRA evaluator's own output, and never a
 * prediction of whether a candidate would make the evaluator fail.
 *
 * NO COMPUTER VISION / NO CHART PARSING — Phase 1 does not build, invoke,
 * or propose any image-understanding, computer-vision, OCR-on-figures, or
 * chart-parsing capability. All figure content below was read by a human
 * (the agent) directly viewing rendered page images; the ground-truth
 * comparisons record what a human sees against what `pdftotext -layout`
 * produces, nothing more automated than that.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This
 * module does not download-and-freeze, admit, or evaluate any document.
 * It does not create DRA-DOC-0028, a new freeze record, a new acquisition
 * record, or a DRA-BMK-024 checkpoint, and it does not modify evaluator
 * 0.1.2, any pipeline stage, normalisation, extraction, or any existing
 * frozen artefact, including the DRA-ENG-015 fill-colour detector or the
 * DRA-ENG-017 provenance/fidelity model.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 27 documents (DRA-DOC-0001-0027).
 *
 * All live verification (HTTP status, repeated-fetch SHA-256 digests,
 * licence statement text, rendered-page visual inspection, pdfinfo/
 * pdftotext structural inspection) was performed on 2026-08-10 against
 * the documents' official publisher URLs and is recorded here as fixed
 * data. This module does not re-fetch anything at runtime or during test
 * execution, and it does not invoke the DRA evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 27,
  excludedDimensions: Object.freeze([
    "footnote_or_reading_order_degradation",
    "table_or_cell_shading_structural_loss",
    "scientific_citation_linkage",
    "scan_or_ocr_representation_provenance",
  ]),
  excludedDimensionsRationale:
    "DRA-ACQ-020/021/022/023 already produced data points on footnote density, tabular cell shading, citation " +
    "linkage, and scan/OCR provenance. The task specification explicitly excludes re-targeting any of these " +
    "four dimensions; DRA-DOC-0028 must attack a materially different uncertainty: graphics whose meaning has " +
    "no text-layer equivalent at all, as opposed to text-layer meaning that survives extraction imperfectly.",
  newTargetDimension: "graphics_and_figure_dependent_semantics",
  newTargetRationale:
    "Every prior probe (footnote markers, cell shading, citation brackets, OCR text) tested whether meaning " +
    "that ALREADY EXISTS in extractable text survives the pipeline. None of the 27 admitted documents tests " +
    "the more fundamental case where the authoritative proposition is carried by a figure, chart, diagram, or " +
    "map with no textual equivalent — a topology, ordering, threshold, or magnitude comparison that a reader " +
    "can only recover by looking at the graphic itself, not by reading any amount of surrounding prose.",
  centralResearchQuestion:
    "Can DRA tell whether a proposition in a source document depends on graphical information (a figure, " +
    "chart, diagram, or map) that does not survive the canonical machine-readable (extracted-text) " +
    "representation of that document?",
  candidateFocusInstruction:
    "Do not select a candidate merely because it contains charts or diagrams — search for a document where a " +
    "specific, checkable proposition is carried ONLY by a figure and is not restated, even partially, in the " +
    "surrounding prose. Distinguish this from the far more common case of a figure that illustrates prose " +
    "that is already independently complete.",
});

// ---------------------------------------------------------------------------
// Part 2 — Graphic-semantic classification and target failure modes
// ---------------------------------------------------------------------------

export const GRAPHIC_SEMANTIC_CLASSIFICATIONS = [
  "INDEPENDENTLY_COMPLETE_PROSE",
  "ILLUSTRATIVE_OF_COMPLETE_PROSE",
  "MATERIAL_GRAPHIC_SEMANTICS",
] as const;
export type GraphicSemanticClassification = (typeof GRAPHIC_SEMANTIC_CLASSIFICATIONS)[number];

export const GRAPHIC_CONSTRUCT_KINDS = [
  "SEQUENTIAL_CHECKLIST_FLOWCHART",
  "BRANCHING_TOPOLOGY_FLOWCHART",
  "PROCESS_WHEEL_OR_CYCLE_DIAGRAM",
  "PLOTTED_CONFIDENCE_INTERVAL_CHART",
  "COLOUR_CODED_MAP",
  "BAR_OR_LINE_CHART_WITH_STATED_VALUES",
] as const;
export type GraphicConstructKind = (typeof GRAPHIC_CONSTRUCT_KINDS)[number];

export const TARGET_FAILURE_MODES: readonly string[] = Object.freeze([
  "branch_topology_lost_arrows_and_routing_not_present_in_extracted_text",
  "cross_column_or_backward_routing_collapsed_into_a_false_linear_sequence",
  "which_terminal_outcome_follows_which_answer_path_becomes_unrecoverable",
  "spatial_or_positional_relationship_encoded_only_by_diagram_layout_is_dropped",
  "silent_plausibility_the_flattened_text_still_reads_as_coherent_prose_giving_no_signal_that_meaning_was_lost",
]);

export const DESIRED_STRUCTURAL_ELEMENTS: readonly string[] = Object.freeze([
  "multi_column_diamond_or_box_diagram",
  "backward_or_cross_column_arrows",
  "forward_only_single_column_sequence_as_a_negative_control",
  "explicit_publisher_disclaimer_that_the_figure_is_a_visual_aid_not_a_full_restatement",
  "terminal_outcome_boxes_reachable_from_multiple_distinct_paths",
  "native_vector_or_born_digital_page_no_ocr_confound",
  "no_fill_colour_or_shading_semantics_no_eng_015_confound",
  "prose_that_narrates_the_figures_topic_without_restating_its_specific_routing",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED", "RESTRICTIVE_UNCONFIRMED"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = ["VERIFIED_ACCESSIBLE", "BLOCKED", "NOT_VERIFIED"] as const;
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["BYTE_STABLE", "TEXT_STABLE", "UNKNOWN", "BLOCKED"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED_GOVERNANCE",
  "REJECTED_SEMANTIC_REDUNDANCY",
  "REJECTED_BLOCKED",
] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface GroundTruthExample {
  readonly category: string;
  readonly location: string;
  readonly sourceFigureContent: string;
  readonly extractedRepresentationObserved: string;
  readonly materialSemanticsSurvive: boolean;
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
  readonly graphicSemanticClassification: GraphicSemanticClassification | null;
  readonly classificationEvidence: string;
  readonly structuralElementsObserved: readonly string[];
  readonly visuallyInspectedPages: readonly string[];
  readonly groundTruthExamples: readonly GroundTruthExample[];
  readonly eng015InteractionNote: string;
  readonly eng017InteractionNote: string;
  readonly isRepeatPublisher: boolean;
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
  // --- Candidate 1: FDA "Deciding When to Submit a 510(k) for a Change to an Existing Device" (primary) ---
  Object.freeze({
    candidateId: "DRA-CAND-024-01",
    title: "Deciding When to Submit a 510(k) for a Change to an Existing Device — Guidance for Industry and Food and Drug Administration Staff",
    publisher: "U.S. Food and Drug Administration (FDA), Center for Devices and Radiological Health (CDRH) / Center for Biologics Evaluation and Research (CBER)",
    jurisdiction: "United States",
    domain: "HEALTHCARE",
    documentType: "POLICY",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.fda.gov/media/99812/download",
    publicationDate:
      "Originally issued October 25, 2017 (confirmed via the canonical FDA guidance-portal landing page " +
      "'fda.gov/regulatory-information/search-fda-guidance-documents/deciding-when-submit-510k-change-existing-device', " +
      "which states 'Issued by: Center for Devices and Radiological Health ... Issue Date: October 25, 2017'); " +
      "the PDF binary served at the canonical download URL carries a 2026-02-06 Acrobat CreationDate, which is " +
      "a portal re-rendering/re-hosting timestamp, not a new substantive issuance — the guidance's own content, " +
      "title, and docket number are unchanged from the 2017 issuance per the landing page's own document " +
      "history statement.",
    approximateSize: "78 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a work of the U.S. federal government (FDA/CDRH/CBER guidance for industry) under 17 " +
      "U.S.C. §105, the same basis already established for DRA-DOC-0013 (FDA AI/ML SaMD, DRA-ACQ-008) and " +
      "re-confirmed here specifically for this document rather than assumed by genre: the PDF itself carries " +
      "no copyright notice, and FDA's guidance-document portal states guidance documents 'do not create or " +
      "confer any rights for or on any person' and are issued by a federal agency, consistent with no " +
      "third-party copyright being asserted.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on fda.gov/media/99812/download returned HTTP 200, content-type application/pdf, no " +
      "authentication or paywall; the canonical guidance-portal landing page (a distinct fda.gov URL) also " +
      "returned HTTP 200 and independently corroborates title, docket, and issuance history.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical download URL both returned identical SHA-256 " +
      "b20870151ab63bf61e21cbc4730a459317bd1fc9339da8099c8e557d6d466f34.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports Creator/Producer consistent with Adobe Acrobat (born-digital authoring tool, not a " +
      "scan-and-OCR toolchain); pdftotext -layout (the project's own production extraction convention, " +
      "confirmed by inspecting the extractPdfText helper used in the DRA-ACQ-002 admission test) recovers " +
      "clean, accurate prose throughout the document's narrative sections with no OCR-confusable-character " +
      "artefacts — this candidate is deliberately native-text to avoid confounding graphics-semantic loss with " +
      "the scan/OCR provenance dimension DRA-ACQ-023/DRA-ENG-017 already investigated.",
    graphicConstructKinds: ["SEQUENTIAL_CHECKLIST_FLOWCHART", "BRANCHING_TOPOLOGY_FLOWCHART"] as const,
    graphicSemanticClassification: "MATERIAL_GRAPHIC_SEMANTICS",
    classificationEvidence:
      "The guidance contains five flowcharts: a single-column 'Main Flowchart' (Figure 1) plus four detailed, " +
      "multi-column decision flowcharts — Flowchart A (labeling changes, Figure 2), Flowchart B (technology/" +
      "engineering/performance changes, Figure 3), Flowchart C (materials changes, Figure 4), and Flowchart D " +
      "(IVD-specific changes, Figure 5). Figure 1 (Main Flowchart) is INDEPENDENTLY_COMPLETE_PROSE: its single, " +
      "purely top-to-bottom sequence of Yes/No boxes reconstructs cleanly and unambiguously from pdftotext " +
      "-layout output alone, serving as this candidate's own internal negative control (a figure whose meaning " +
      "survives extraction intact). Figures 2 and 3 (Flowcharts A and B), by contrast, are genuine multi-column " +
      "diamond/box diagrams with backward and cross-column arrows: visual rendering (pdftoppm, 150 DPI) of both " +
      "confirms 'Yes' and 'No' branches from mid-chart decision diamonds route sideways and upward/downward " +
      "across multiple rows and columns to shared terminal boxes ('New 510(k)', 'Documentation') located in " +
      "different visual positions depending on which path is taken (e.g. Flowchart A's node A1.1 'Yes' branch " +
      "loops left back to a 'New 510(k)' box, while A1.4's 'Yes' branch routes down-and-left across several " +
      "rows to a different 'New 510(k)' box; Flowchart B shows the identical pattern: B2's 'Yes' and B3.2's " +
      "'Yes' both converge on the same right-hand 'New 510(k)' oval from different rows, while B3.1's 'No' " +
      "branch routes down to B4.1 rather than continuing in reading order). This routing topology is the " +
      "guidance's actual decision-making mechanism — which Yes/No answer sequence leads to which regulatory " +
      "outcome (submit a new 510(k), or document the change without submission) — and it is NOT restated in " +
      "the surrounding prose, which only narrates each individual question ('B3.1 Is it a change to a Cat. B " +
      "or novel method...') without stating which downstream box each answer connects to. The guidance's own " +
      "text explicitly warns readers that 'Flowcharts are provided as a visual aid, but do not capture all " +
      "necessary considerations' — an explicit publisher acknowledgment that the flowchart, not the prose, " +
      "carries the operative connective logic.",
    structuralElementsObserved: [
      "multi_column_diamond_or_box_diagram",
      "backward_or_cross_column_arrows",
      "forward_only_single_column_sequence_as_a_negative_control",
      "explicit_publisher_disclaimer_that_the_figure_is_a_visual_aid_not_a_full_restatement",
      "terminal_outcome_boxes_reachable_from_multiple_distinct_paths",
      "native_vector_or_born_digital_page_no_ocr_confound",
      "no_fill_colour_or_shading_semantics_no_eng_015_confound",
      "prose_that_narrates_the_figures_topic_without_restating_its_specific_routing",
    ],
    visuallyInspectedPages: [
      "Page 17 (rendered at 150 DPI): Figure 2, Flowchart A (labeling changes) — multi-column diamond diagram " +
        "with confirmed backward/cross-column arrow routing to two distinct 'New 510(k)' terminal boxes",
      "Page 25 (rendered at 150 DPI): Figure 3, Flowchart B (technology/engineering/performance changes) — " +
        "same multi-column, cross-branch topology pattern independently confirmed in a second flowchart",
      "Page 6 (pdftotext -layout cross-check, not separately rendered): Figure 1, Main Flowchart — single-" +
        "column, purely sequential, used as the internal negative control",
    ],
    groundTruthExamples: [
      {
        category: "branch_topology",
        location: "Figure 2 / Flowchart A, page 17: node A1.1's 'Yes' branch",
        sourceFigureContent:
          "Visually, A1.1's 'Yes' arrow routes leftward and connects to a 'New 510(k)' terminal box positioned " +
          "at the top-right of the diagram — a specific, only-graphically-encoded connection.",
        extractedRepresentationObserved:
          "pdftotext -layout output for this region is a flat sequence of box-label fragments (A1, A1.1, A2, " +
          "A4, A1.3, A1.4, A1.5, 'New 510(k)', 'Documentation') in an order that does not correspond to the " +
          "true decision path and carries no arrow/connector information at all.",
        materialSemanticsSurvive: false,
        note:
          "The single most direct evidence for this candidate: which terminal outcome follows from which " +
          "Yes/No answer sequence is only recoverable by looking at the diagram's arrows, not from any amount " +
          "of reading of the extracted text.",
      },
      {
        category: "branch_topology",
        location: "Figure 3 / Flowchart B, page 25: node B3.2's 'No' branch vs. B3.1's 'No' branch",
        sourceFigureContent:
          "B3.1's 'No' arrow routes down to B4.1; B3.2's 'No' arrow routes down to a separate 'Documentation' " +
          "box; the two 'No' paths are visually and topologically distinct despite both diamonds appearing in " +
          "the same row of the diagram.",
        extractedRepresentationObserved:
          "pdftotext -layout renders both diamonds' question text in sequence with no indication that their " +
          "'No' branches lead to different destinations.",
        materialSemanticsSurvive: false,
        note:
          "Independent confirmation, in a second flowchart within the same document, that the routing-topology " +
          "loss observed in Flowchart A is a general property of this document's multi-column diagrams, not a " +
          "one-off artefact of a single figure.",
      },
      {
        category: "sequential_negative_control",
        location: "Figure 1 / Main Flowchart, page 6 (single-column, purely top-to-bottom)",
        sourceFigureContent:
          "A simple linear sequence of Yes/No questions with no branch that returns upward or crosses columns.",
        extractedRepresentationObserved:
          "pdftotext -layout reconstructs the box text and Yes/No labels in the same order as the true " +
          "top-to-bottom visual sequence.",
        materialSemanticsSurvive: true,
        note:
          "The required internal control: a figure in the SAME document whose meaning is fully recoverable " +
          "from extracted text, demonstrating the loss observed in Figures 2-3 is a property of branching " +
          "topology specifically, not of 'this document's flowcharts' in general.",
      },
    ],
    eng015InteractionNote:
      "DRA-ENG-015 detects loss of fill-colour/shading semantics via SVG-rendering-based colour-diversity " +
      "measurement. None of this document's five flowcharts use fill colour or shading to encode meaning — " +
      "every diamond, box, and arrow is rendered in plain black-and-white line art with text labels only. This " +
      "candidate is therefore cleanly outside DRA-ENG-015's detection scope in both directions: DRA-ENG-015 " +
      "would report zero colour diversity (correctly, since there is none) and would give no signal at all " +
      "about the arrow-topology loss demonstrated above, which is a connectivity/graph-structure property, not " +
      "a colour property. The two representation-integrity concerns are orthogonal.",
    eng017InteractionNote:
      "DRA-ENG-017 classifies representation provenance (NATIVE_TEXT vs. OCR_TEXT_LAYER vs. IMAGE_ONLY vs. " +
      "MIXED_REPRESENTATION) and OCR fidelity. This document is unambiguously NATIVE_TEXT (Acrobat-authored, " +
      "no scan artefacts, no embedded raster page images, clean pdftotext output for all prose sections), so " +
      "DRA-ENG-017 would correctly report high representation fidelity for the TEXT that is present — while " +
      "still giving no signal about the flowchart connectivity loss, because that loss occurs even though the " +
      "text extraction is itself faithful to what characters exist on the page; the missing information is the " +
      "spatial/connective relationship between those characters, which no OCR-fidelity measure addresses. This " +
      "confirms the two failure modes are genuinely independent axes, and that this candidate was deliberately " +
      "chosen to isolate the graphics-semantics dimension from the OCR-provenance dimension.",
    isRepeatPublisher: true,
    corpusDiversityContribution:
      "First document in the corpus whose representation-integrity finding concerns diagram/flowchart " +
      "connectivity (arrow topology) rather than colour, footnotes, citations, or scan quality; provides a " +
      "clean within-document positive/negative control pair (Figure 1 vs. Figures 2-3) and a within-document " +
      "replication (Figure 2 vs. Figure 3) not available in any single-figure candidate.",
    corpusDiversityLimitation:
      "Repeats the FDA/HEALTHCARE/POLICY/PUBLIC_DOMAIN profile already established by DRA-DOC-0013; selected " +
      "purely for graphics-semantic experimental merit, consistent with the task's explicit instruction not to " +
      "select for publisher novelty over structural/failure-mode value.",
    knownRisks: [
      "The guidance's own 2017 issuance vs. the PDF's 2026 portal-rendering CreationDate must be recorded " +
        "precisely at Phase 2 admission (issuance date = 2017-10-25; retrieval/rendering date = 2026; SHA-256 " +
        "pinned against the 2026-served bytes) so the freeze record is not ambiguous about which date governs.",
      "Flowcharts C and D (Figures 4-5) were located and their page ranges confirmed via the document's own " +
        "text (pages ~33 onward) but were not individually re-rendered and visually inspected in this Phase 1 " +
        "pass, since Figures 2 and 3 already establish and replicate the target finding; a Phase 2 evaluation " +
        "sampling statements should still consider including them for completeness.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 2: NIST Cybersecurity Framework 2.0 (rejected, semantic redundancy) ---
  Object.freeze({
    candidateId: "DRA-CAND-024-02",
    title: "The NIST Cybersecurity Framework (CSF) 2.0 (NIST CSWP 29)",
    publisher: "National Institute of Standards and Technology (NIST)",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "POLICY",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf",
    publicationDate: "2024-02-26",
    approximateSize: "32 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a NIST Cybersecurity White Paper, a work of the U.S. federal government under 17 U.S.C. " +
      "§105, the same basis already used for DRA-DOC-0012 (NIST AI RMF, DRA-ACQ-005).",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on nvlpubs.nist.gov returned HTTP 200, content-type application/pdf, no authentication or " +
      "paywall (the nvlpubs.nist.gov HEAD=404/GET=200 quirk already documented at DRA-ACQ-005 was accounted " +
      "for by issuing a GET directly).",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations: "Content matches the already-established stable NIST CSWP publication pattern; a single live GET was performed and treated as sufficient given this candidate was not advanced past rejection.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports Acrobat PDFMaker/Word producer (born-digital); pdftotext -layout recovers clean prose " +
      "throughout, with no scan or OCR artefacts.",
    graphicConstructKinds: ["PROCESS_WHEEL_OR_CYCLE_DIAGRAM"] as const,
    graphicSemanticClassification: "INDEPENDENTLY_COMPLETE_PROSE",
    classificationEvidence:
      "Figure 2 (the 'CSF Functions wheel', with GOVERN at the centre and the five other Functions arranged " +
      "around it) and Figure 3 (a numbered 'Steps for creating and using a CSF Organizational Profile' process " +
      "diagram) were both examined. In both cases the surrounding prose explicitly and completely restates the " +
      "figure's material content: the text states in full sentences why GOVERN is centred ('GOVERN is in the " +
      "center of the wheel because it informs how an organization will implement the other five Functions') " +
      "and why the Functions relate to one another, and Figure 3's six numbered steps are each individually " +
      "restated as a numbered prose list immediately following the figure ('1. Scope the Organizational " +
      "Profile...', '2. ...' etc.) with the same content and same ordering as the diagram. No specific " +
      "proposition carried by either figure was found that is absent from, or contradicted by, the prose.",
    structuralElementsObserved: [
      "forward_only_single_column_sequence_as_a_negative_control",
      "native_vector_or_born_digital_page_no_ocr_confound",
      "no_fill_colour_or_shading_semantics_no_eng_015_confound",
    ],
    visuallyInspectedPages: [
      "Page 4 (pdftotext -layout cross-check): Figure 2, CSF Functions wheel — prose fully restates the " +
        "wheel's structure and rationale",
      "Page 6 (pdftotext -layout cross-check): Figure 3, Organizational Profile steps diagram — prose restates " +
        "each of the six numbered steps in the same order as the diagram",
    ],
    groundTruthExamples: [
      {
        category: "process_wheel",
        location: "Figure 2, page 4",
        sourceFigureContent:
          "A wheel diagram with GOVERN centred and five Functions (IDENTIFY, PROTECT, DETECT, RESPOND, " +
          "RECOVER) arranged around it.",
        extractedRepresentationObserved:
          "Prose immediately preceding and following the figure states the same relationships in full " +
          "sentences, including why GOVERN is central.",
        materialSemanticsSurvive: true,
        note: "A clean example of ILLUSTRATIVE_OF/INDEPENDENTLY_COMPLETE_PROSE: useful as a negative finding, not as this probe's target.",
      },
    ],
    eng015InteractionNote:
      "Not applicable in a way that would change the finding — the wheel uses colour to distinguish Functions, " +
      "but since the prose already names and explains every Function and their relationships, colour loss (an " +
      "DRA-ENG-015-type concern) would not remove any proposition not already available in text.",
    eng017InteractionNote:
      "Not applicable — this document is unambiguously NATIVE_TEXT; the rejection here is about semantic " +
      "redundancy, not representation provenance.",
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would have added a new TECHNICAL-domain document had it qualified; instead provides a valuable negative " +
      "data point establishing that not every diagram-rich document exhibits material graphic dependence — " +
      "well-written framework documents of this kind tend to fully narrate their own diagrams in prose.",
    corpusDiversityLimitation: "Rejected before any diversity contribution could be realised.",
    knownRisks: [],
    qualificationOutcome: "REJECTED_SEMANTIC_REDUNDANCY",
    rejectionOrDeferralReason:
      "Both examined figures (the Functions wheel and the Organizational Profile steps diagram) are fully and " +
      "explicitly restated in the surrounding prose; per the task specification's three-way distinction, this " +
      "makes both figures INDEPENDENTLY_COMPLETE_PROSE / ILLUSTRATIVE_OF_COMPLETE_PROSE rather than the target " +
      "MATERIAL_GRAPHIC_SEMANTICS category, so this candidate does not test the central research question.",
  }),
  // --- Candidate 3: PLOS ONE epidemic-threshold SHAP figure (rejected, semantic redundancy) ---
  Object.freeze({
    candidateId: "DRA-CAND-024-03",
    title:
      "A Hybrid AI-Mathematical Approach for Epidemic Threshold Prediction in Metapopulation Networks: " +
      "Integrating Physics-Guided Neural Networks with Spectral Graph Theory",
    publisher: "PLOS ONE",
    jurisdiction: "International (open-access journal)",
    domain: "TECHNICAL",
    documentType: "ARTICLE",
    language: "en",
    sourceFormat: "PDF",
    officialSourceUrl:
      "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0344827&type=printable",
    publicationDate: "2026-06-18",
    approximateSize: "26 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "CC BY 4.0 — PLOS ONE's standard open-access licence, the same basis already used for DRA-DOC-0026 " +
      "(PLOS ONE citation-linkage probe, DRA-ACQ-022).",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on journals.plos.org's printable-PDF endpoint returned HTTP 200, content-type application/pdf, " +
      "content-length 2,166,368 bytes, no authentication or paywall.",
    sourceStabilityStatus: "TEXT_STABLE",
    stabilityObservations:
      "A single live GET was performed and treated as sufficient given this candidate was not advanced past " +
      "rejection; PLOS ONE's published-article PDFs are treated as stable following the DRA-ACQ-022 precedent.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports Adobe InDesign/Adobe PDF Library (born-digital publishing toolchain); pdftotext -layout " +
      "recovers clean prose and numeric values throughout.",
    graphicConstructKinds: ["BAR_OR_LINE_CHART_WITH_STATED_VALUES"] as const,
    graphicSemanticClassification: "INDEPENDENTLY_COMPLETE_PROSE",
    classificationEvidence:
      "Figure 4 (SHAP feature-importance bar chart and topology-dependent coefficient chart) was examined as a " +
      "candidate for a 'relative magnitude visible only in a plot' construct. Every numeric value depicted in " +
      "both panels is also stated explicitly in the surrounding prose (e.g. 'τQMF ... dominates with " +
      "importance 0.045', 'k∗(WS) = 0.627 ... k∗(REG) = 1.322', and every other bar's value), including the " +
      "ranking claims the chart is meant to convey ('γ (0.040) and β (0.032) jointly account for more " +
      "importance ... than any individual spectral feature', 'λmax ranks tenth (0.011)'). No proposition " +
      "carried by the chart was found that is absent from the prose.",
    structuralElementsObserved: ["native_vector_or_born_digital_page_no_ocr_confound", "no_fill_colour_or_shading_semantics_no_eng_015_confound"],
    visuallyInspectedPages: [],
    groundTruthExamples: [
      {
        category: "bar_chart_ranking",
        location: "Figure 4A, page 11",
        sourceFigureContent: "A bar chart ranking input-feature SHAP importances from highest to lowest.",
        extractedRepresentationObserved:
          "Prose states every bar's exact numeric value and the resulting ranking claims in full sentences.",
        materialSemanticsSurvive: true,
        note: "A modern, well-written open-access paper of this kind tends to fully restate its own figures numerically in prose — a second independent instance of the same negative finding as DRA-CAND-024-02.",
      },
    ],
    eng015InteractionNote: "Not applicable — rejection is on semantic-redundancy grounds, not colour loss.",
    eng017InteractionNote: "Not applicable — this document is unambiguously NATIVE_TEXT.",
    isRepeatPublisher: true,
    corpusDiversityContribution:
      "Would have added a second TECHNICAL/PLOS-ONE data point; instead reinforces, from an entirely different " +
      "publisher and genre than DRA-CAND-024-02, that fully-restated figures are common in careful technical " +
      "writing and are not a reliable source of MATERIAL_GRAPHIC_SEMANTICS candidates.",
    corpusDiversityLimitation: "Rejected before any diversity contribution could be realised; would also have repeated the DRA-DOC-0026 publisher.",
    knownRisks: [],
    qualificationOutcome: "REJECTED_SEMANTIC_REDUNDANCY",
    rejectionOrDeferralReason:
      "The examined figure's every numeric value and ranking claim is explicitly restated in prose, making it " +
      "INDEPENDENTLY_COMPLETE_PROSE rather than the target MATERIAL_GRAPHIC_SEMANTICS category.",
  }),
  // --- Candidate 4: Bank of England Monetary Policy Report, April 2026 (deferred, governance) ---
  Object.freeze({
    candidateId: "DRA-CAND-024-04",
    title: "Monetary Policy Report — April 2026",
    publisher: "Bank of England",
    jurisdiction: "United Kingdom",
    domain: "FINANCE",
    documentType: "REPORT",
    language: "en-GB",
    sourceFormat: "PDF",
    officialSourceUrl:
      "https://www.bankofengland.co.uk/-/media/boe/files/monetary-policy-report/2026/april/monetary-policy-report-april-2026.pdf",
    publicationDate: "2026-04 (April 2026 Monetary Policy Report)",
    approximateSize: "107 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "NOT the Open Government Licence and NOT a public-domain basis. The Bank of England's own 'Legal' terms " +
      "page (bankofengland.co.uk/legal) states copyright in its published Resources 'are owned by the Governor " +
      "and Company of the Bank of England' and that re-use beyond 'personal use or internal use within an " +
      "individual organisation for non-commercial purposes' requires case-by-case written authorisation from " +
      "the Bank's Head of Communications Division. This is a materially more restrictive basis than every " +
      "OGL/PUBLIC_DOMAIN/CC-BY precedent used elsewhere in this corpus, and it is not clear that redistributing " +
      "extracted excerpts as part of a benchmark corpus falls within the permitted 'personal/internal, " +
      "non-commercial' scope without seeking that authorisation.",
    licenceReuseStatus: "RESTRICTIVE_UNCONFIRMED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on bankofengland.co.uk returned HTTP 200, content-type application/pdf, no authentication or " +
      "paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "fa822e5b1442f9fa6a12d528f34339b1715bccd47f31f61d06361605b23b5fef.",
    nativeRepresentation: true,
    nativeRepresentationEvidence:
      "pdfinfo reports a Chrome/Skia 'print to PDF' producer (born-digital rendering pipeline, not a scan-and-" +
      "OCR toolchain).",
    graphicConstructKinds: ["BAR_OR_LINE_CHART_WITH_STATED_VALUES", "PLOTTED_CONFIDENCE_INTERVAL_CHART"] as const,
    graphicSemanticClassification: null,
    classificationEvidence:
      "Several numbered charts (Chart 1.1-1.6) decompose CPI inflation news into colour-coded bar segments " +
      "(e.g. Chart 1.3 splits a bar into green/orange/purple segments for direct and indirect energy-cost " +
      "contributions) whose individual segment magnitudes are not given exact numeric values in the " +
      "surrounding prose (which only states qualitative claims such as 'a larger direct contribution ... is " +
      "the main driver'), a plausible MATERIAL_GRAPHIC_SEMANTICS candidate; the classic Bank of England " +
      "'fan chart' probability-distribution construct that motivated this candidate's initial selection was " +
      "not located by text search in the April 2026 edition's extracted text and was not visually located " +
      "page-by-page within this Phase 1 time budget. Full classification work was not completed because the " +
      "governance concern below was identified first and this candidate was not advanced further.",
    structuralElementsObserved: ["no_fill_colour_or_shading_semantics_no_eng_015_confound"],
    visuallyInspectedPages: [],
    groundTruthExamples: [],
    eng015InteractionNote:
      "Unlike the primary candidate, the colour-coded stacked-bar charts observed here (e.g. Chart 1.3) DO use " +
      "fill colour to distinguish categories, which is a genuine partial overlap with the DRA-ENG-015 fill-" +
      "colour dimension; a Phase 2 evaluation of this candidate (if the governance concern were resolved) " +
      "would need to explicitly separate 'which colour segment is which category' (an DRA-ENG-015-type " +
      "concern) from 'what is each segment's exact magnitude' (the graphics-semantics concern this programme " +
      "targets) rather than treating the two as a single finding.",
    eng017InteractionNote: "Not applicable — this document is unambiguously NATIVE_TEXT.",
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would add a new FINANCE-domain publisher (Bank of England) and a genuinely different graphic construct " +
      "(colour-coded magnitude decomposition, and potentially a plotted confidence-interval fan chart) not " +
      "present in the primary candidate's flowchart-topology construct.",
    corpusDiversityLimitation: "None identified beyond the governance concern.",
    knownRisks: [
      "Per the established rule that reuse rights must not be inferred from mere public accessibility, this " +
        "candidate cannot be treated as licence-VERIFIED on the strength of being freely downloadable; written " +
        "confirmation from the Bank's Communications Division (or an equivalent, explicit corpus-reuse " +
        "clearance) would be required before any Phase 2 admission.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "Strong potential graphic-construct diversity (colour-coded magnitude decomposition, and a possible " +
      "plotted-confidence-interval fan chart not yet located), but the Bank of England's own published terms " +
      "restrict re-use to personal/internal non-commercial use pending case-by-case authorisation, which is " +
      "materially more restrictive than every OGL/PUBLIC_DOMAIN/CC-BY basis used elsewhere in this corpus and " +
      "was not resolved within this Phase 1 pass; recorded as DEFERRED (governance-blocked) rather than " +
      "rejected outright, since the underlying graphic-construct question was never fully investigated.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

/**
 * Deterministic, pre-declared ranking rule: candidates confirmed as MATERIAL_GRAPHIC_SEMANTICS with
 * VERIFIED_ACCESSIBLE + BYTE_STABLE + VERIFIED licence evidence rank first; among those, the count of
 * observed desired structural elements (descending) breaks ties. Candidates with an unresolved licence
 * (RESTRICTIVE_UNCONFIRMED) or an unset classification rank below any fully-qualified candidate regardless
 * of accessibility, since governance and classification completeness are prerequisites, not tie-breakers.
 */
function rankCandidates(candidates: readonly CandidateRecord[]): readonly string[] {
  const fullyQualified = candidates
    .filter(
      (c) =>
        c.httpAccessibility === "VERIFIED_ACCESSIBLE" &&
        c.licenceReuseStatus === "VERIFIED" &&
        c.graphicSemanticClassification === "MATERIAL_GRAPHIC_SEMANTICS",
    )
    .slice()
    .sort((a, b) => b.structuralElementsObserved.length - a.structuralElementsObserved.length);
  const rejectedRedundant = candidates.filter((c) => c.qualificationOutcome === "REJECTED_SEMANTIC_REDUNDANCY");
  const governanceBlocked = candidates.filter((c) => c.qualificationOutcome === "DEFERRED");
  const rest = candidates.filter(
    (c) => !fullyQualified.includes(c) && !rejectedRedundant.includes(c) && !governanceBlocked.includes(c),
  );
  return Object.freeze([...fullyQualified, ...governanceBlocked, ...rejectedRedundant, ...rest].map((c) => c.candidateId));
}

export const RANKED_CANDIDATE_IDS: readonly string[] = rankCandidates(CANDIDATE_REGISTER);
export const PRIMARY_CANDIDATE_ID = "DRA-CAND-024-01";
export const ALTERNATE_1_CANDIDATE_ID = "DRA-CAND-024-04";
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(["DRA-CAND-024-02", "DRA-CAND-024-03"]);

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
 * QUALIFIED requires: VERIFIED official source, VERIFIED licence, VERIFIED_ACCESSIBLE + BYTE_STABLE or
 * TEXT_STABLE, a confirmed MATERIAL_GRAPHIC_SEMANTICS classification, at least one visually inspected page,
 * at least one ground-truth example demonstrating a genuine loss (materialSemanticsSurvive === false), AND
 * at least one ground-truth example demonstrating survival (materialSemanticsSurvive === true) so the
 * candidate carries its own internal positive/negative control, native (non-OCR) representation, and a
 * non-trivial count of observed desired structural elements (>= 6). All hold for the primary candidate.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const accessible = c.httpAccessibility === "VERIFIED_ACCESSIBLE";
  const stable = c.sourceStabilityStatus === "BYTE_STABLE" || c.sourceStabilityStatus === "TEXT_STABLE";
  const officialAndLicensed = c.officialSourceStatus === "VERIFIED" && c.licenceReuseStatus === "VERIFIED";
  const classified = c.graphicSemanticClassification === "MATERIAL_GRAPHIC_SEMANTICS";
  const visuallyVerified = c.visuallyInspectedPages.length > 0;
  const hasObservedLoss = c.groundTruthExamples.some((g) => !g.materialSemanticsSurvive);
  const hasObservedControl = c.groundTruthExamples.some((g) => g.materialSemanticsSurvive);
  const richStructure = c.structuralElementsObserved.length >= 6;
  if (c.httpAccessibility === "BLOCKED") return "BLOCKED";
  if (
    accessible &&
    stable &&
    officialAndLicensed &&
    classified &&
    c.nativeRepresentation &&
    visuallyVerified &&
    hasObservedLoss &&
    hasObservedControl &&
    richStructure
  ) {
    return "QUALIFIED";
  }
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
    proposedCorpusId: "DRA-DOC-0028",
  }),
  governance: Object.freeze({
    officialSourceStatus: primaryCandidate().officialSourceStatus,
    licenceReuseStatus: primaryCandidate().licenceReuseStatus,
    licenceReuseBasis: primaryCandidate().licenceReuseBasis,
    unresolvedQuestions: Object.freeze([
      "The PDF's 2026-02-06 Acrobat CreationDate (a portal re-rendering timestamp) should be recorded " +
        "alongside, not instead of, the guidance's true 2017-10-25 issuance date at Phase 2 admission time, " +
        "to avoid ambiguity about which date governs the freeze record.",
    ]),
  }),
  acquisition: Object.freeze({
    sourceFormat: primaryCandidate().sourceFormat,
    sourceStabilityStatus: primaryCandidate().sourceStabilityStatus,
    stabilityObservations: primaryCandidate().stabilityObservations,
    nativeRepresentation: primaryCandidate().nativeRepresentation,
    graphicSemanticClassification: primaryCandidate().graphicSemanticClassification,
    risks: primaryCandidate().knownRisks,
  }),
  evidenceContribution:
    "DRA-DOC-0028 would provide the corpus's first document whose material decision-logic is carried by " +
    "flowchart arrow topology rather than by text, footnotes, table shading, citations, or OCR fidelity, " +
    "directly targeting the DRA-ACQ-024 central research question. It provides two independently observed, " +
    "ground-truth-checkable instances of graphic-semantic loss (Flowchart A and Flowchart B, both examined by " +
    "direct visual rendering) plus a genuine within-document internal control (Figure 1's fully-recoverable " +
    "simple sequence) — a stronger evidentiary structure than either rejected candidate offered.",
  corpusContribution:
    "Adds no new domain (HEALTHCARE) or jurisdiction (United States) diversification relative to DRA-DOC-0013; " +
    "selected purely for graphics-semantics experimental merit, consistent with the task's explicit instruction " +
    "not to select for publisher novelty over structural/failure-mode value.",
  risks: primaryCandidate().knownRisks,
  recommendationReasoning:
    "DRA-CAND-024-01 is the only candidate confirmed as MATERIAL_GRAPHIC_SEMANTICS by direct visual inspection, " +
    "with VERIFIED official-source and licence status, VERIFIED_ACCESSIBLE and BYTE_STABLE evidence across two " +
    "independent live fetches, native (non-OCR) representation cleanly isolating it from the DRA-ACQ-023/DRA-" +
    "ENG-017 dimension, no fill-colour semantics cleanly isolating it from the DRA-ENG-015 dimension, and both " +
    "an observed loss (Flowcharts A and B) and an observed survival (Figure 1) within the same document. " +
    "DRA-CAND-024-02 (NIST CSF 2.0) and DRA-CAND-024-03 (PLOS ONE epidemic-threshold paper) were both " +
    "genuinely investigated by direct visual/text inspection and both rejected on the same ground: every " +
    "proposition carried by their examined figures is explicitly restated in prose, making them " +
    "INDEPENDENTLY_COMPLETE_PROSE rather than the target category — a useful negative finding establishing " +
    "that well-written technical and scientific documents commonly narrate their own figures fully, and that " +
    "MATERIAL_GRAPHIC_SEMANTICS candidates require either genuine topological complexity (as in the primary " +
    "candidate) or an author who does not restate figure content in words. DRA-CAND-024-04 (Bank of England " +
    "Monetary Policy Report) was the strongest genre fit encountered (colour-coded magnitude decomposition " +
    "charts, and a plausible but not-yet-located plotted-confidence-interval fan chart), but its publisher's " +
    "own re-use terms are materially more restrictive than every other licence basis used in this corpus and " +
    "were not resolved within this Phase 1 pass, so it is recorded as DEFERRED rather than advanced, per the " +
    "rule that reuse rights are never inferred from mere accessibility. No candidate was chosen, or rejected, " +
    "on the basis of whether it seemed likely to make the evaluator fail; that determination is explicitly " +
    "reserved for a future Phase 2 evaluation and is out of scope for this Phase 1 discovery module.",
  nextBestCandidateIfRejected:
    `${ALTERNATE_1_CANDIDATE_ID} would need the Bank of England's licence-reuse terms explicitly resolved ` +
    `(written authorisation or an equivalent clearance) and its candidate graphic (colour-coded magnitude ` +
    `decomposition, or the not-yet-located fan chart) fully visually verified before it could be reconsidered; ` +
    `no other candidate examined in this Phase 1 pass reached MATERIAL_GRAPHIC_SEMANTICS classification.`,
});

// ---------------------------------------------------------------------------
// Part 6 — DRA-ENG-015 and DRA-ENG-017 interaction analysis (observation only)
// ---------------------------------------------------------------------------

/**
 * Records the required consideration of whether the existing DRA-ENG-015 fill-colour detector or the
 * DRA-ENG-017 representation-provenance/fidelity model offer any relevant precedent, or create any overlap
 * risk, for the graphics/figure-dependent-semantics dimension. This is an observation, not an implementation
 * change; no detector or model code is modified.
 */
export const ENG_015_ENG_017_INTERACTION_ANALYSIS = Object.freeze({
  eng015Precedent:
    "DRA-ENG-015 established the pattern of a decoupled, non-wired representation-integrity SIGNAL that " +
    "inspects a PDF's own visual/structural properties independently of extracted text, to detect when a " +
    "representation-carrying property (there: cell fill-colour diversity) cannot be recovered from text alone.",
  eng015OverlapWithPrimaryCandidate: false,
  eng015OverlapReasoning:
    "The primary candidate's flowcharts use no fill colour or shading at all — every diamond, box, and arrow " +
    "is plain black-and-white line art. DRA-ENG-015's colour-diversity signal would correctly report zero " +
    "diversity and give no information about the arrow-topology loss this programme documents, which is a " +
    "graph-connectivity property, not a colour property. The two are cleanly orthogonal for this candidate.",
  eng015OverlapWithDeferredAlternate: true,
  eng015OverlapReasoningForAlternate:
    "The deferred Bank of England candidate's stacked-bar charts DO use fill colour to distinguish categories, " +
    "a genuine partial overlap with DRA-ENG-015; a future evaluation of that candidate (if pursued) would need " +
    "to separate the 'which colour is which category' question (DRA-ENG-015's domain) from the 'what is this " +
    "segment's exact magnitude' question (this programme's domain) rather than conflating the two findings.",
  eng017Precedent:
    "DRA-ENG-017 classifies representation provenance (NATIVE_TEXT/OCR_TEXT_LAYER/IMAGE_ONLY/" +
    "MIXED_REPRESENTATION) and OCR fidelity, addressing whether the TEXT that was extracted faithfully " +
    "represents what characters exist on the page.",
  eng017OverlapWithPrimaryCandidate: false,
  eng017OverlapReasoning:
    "The primary candidate is unambiguously NATIVE_TEXT with no OCR involved; DRA-ENG-017 would (correctly) " +
    "report high fidelity for the prose text, while the flowchart connectivity loss this programme documents " +
    "occurs upstream of any OCR concern — the extracted characters are accurate, but the spatial/connective " +
    "relationship between them (which arrow points to which box) has no textual representation to begin with. " +
    "This candidate was deliberately chosen to be native-text specifically so this distinction would be clean.",
  doesEitherExistingDetectorSolveGraphicsSemantics: false,
  graphicsSemanticsRequires: Object.freeze([
    "a_further_decoupled_signal_distinct_from_both_dra_eng_015_and_dra_eng_017_that_inspects_vector_drawing_" +
      "connectivity_arrow_endpoints_and_node_adjacency_rather_than_colour_or_text_fidelity",
    "acquisition_time_classification_of_each_figure_into_the_three_way_semantic_category_recorded_alongside_" +
      "licence_and_stability_evidence",
    "explicit_surfacing_to_downstream_consumers_that_a_statement_derived_from_a_flattened_diagram_may_omit_" +
      "connectivity_information_rather_than_silently_trusting_the_flattened_box_order",
  ]),
  architecturalChangeRequiredNow: false,
  note:
    "This analysis is Phase 1 observation only, required by the DRA-ACQ-024 task specification's instruction " +
    "to analyse interaction/overlap with DRA-ENG-015 and DRA-ENG-017 explicitly. It proposes no code change and " +
    "implements no new signal, no computer vision, and no chart parsing; that determination (if any) is " +
    "explicitly out of scope for this discovery-only phase.",
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0028";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "deterministic_live_fetch_a_b_for_primary_candidate_with_fresh_digest_pinning",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0028",
  "run_evaluator_0_1_2_against_dra_doc_0028_in_a_dedicated_benchmark",
  "compare_source_flowchart_topology_vs_extracted_vs_normalised_vs_statements_vs_evaluation_for_figures_1_2_and_3",
  "assess_whether_the_flattened_box_order_for_flowcharts_a_and_b_propagates_into_statement_extraction_evidence_" +
    "linkage_or_materiality_as_a_false_confident_claim_about_decision_routing",
  "record_confirmed_generalisable_weakness_or_isolated_anomaly_verdict_for_the_graphics_figure_dependent_" +
    "semantics_hypothesis",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0028",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_024",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "modify_dra_eng_015_detector",
  "modify_dra_eng_017_provenance_model",
  "build_or_invoke_computer_vision_or_chart_parsing",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_any_graphics_semantics_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
] as const);
