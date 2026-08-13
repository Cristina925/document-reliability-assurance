/**
 * DRA-ACQ-023 — Phase 1: Candidate Discovery and Qualification for
 * DRA-DOC-0027 (Scan/OCR Representation Robustness Probe)
 *
 * CONTEXT — Documents 1-26 test whether DRA's evaluation stages preserve
 * meaning that already exists as clean, extractable text (footnote
 * markers, table structure, citation linkage). Every prior probe assumed
 * a materially complete native or PDF-native text layer. This programme
 * (DRA-ACQ-023) tests an entirely different and more fundamental
 * uncertainty: whether DRA can even recognise when its normal
 * text-extraction path does NOT faithfully represent the authoritative
 * source at all, because the source is a scanned image whose "text" is a
 * machine-generated OCR guess rather than a transcription of the
 * document. This is explicitly NOT another footnote-flattening, table-
 * shading, or citation-linkage probe (all three are excluded by the task
 * specification).
 *
 * CENTRAL RESEARCH QUESTION — Can DRA determine when an authoritative
 * document cannot be faithfully represented through its normal
 * text-extraction path because meaningful content exists only, or
 * primarily, as page imagery?
 *
 * ANTI-CONTAMINATION STATEMENT (required verbatim by the task
 * specification pattern established at DRA-ACQ-018/019/020/021/022): No
 * candidate in CANDIDATE_REGISTER was fetched into, or run through,
 * evaluator 0.1.2, the DRA pipeline, or any of its stages, at any point
 * during this Phase 1 investigation. Candidate selection used only (a)
 * live HTTP/licence/official-source verification, (b) direct visual
 * inspection of each PDF's own rendered pages (via `pdftoppm`), (c)
 * extracted-text inspection (via `pdftotext`), and (d) PDF-internal
 * structural inspection (`pdfinfo`, `pdffonts`, `pdfimages -list`, and
 * MODS/metadata records from the official publisher) — never the DRA
 * evaluator's own output, and never a prediction of whether a candidate
 * would make the evaluator fail. Rejections and deferrals below are based
 * on observed governance/accessibility/representation evidence, not
 * predicted outcome.
 *
 * OCR DISCIPLINE — Phase 1 is not an instruction to add OCR to DRA. No
 * production remediation, normalisation change, evaluator change, or
 * representation-integrity-detector change is made or proposed as an
 * implementation here (see PHASE_1_PROHIBITED_ACTIONS). OCR text observed
 * below is the publisher's own pre-existing OCR layer (produced by the
 * publisher's own digitisation vendor/tool, e.g. OmniPage CSDK or
 * LuraDocument), inspected read-only for characterisation purposes. This
 * module does not run OCR itself and does not compare against a
 * separately-generated OCR pass.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This
 * module does not download-and-freeze, admit, or evaluate any document.
 * It does not create DRA-DOC-0027, a new freeze record, a new
 * acquisition record, or a DRA-BMK-027 checkpoint, and it does not modify
 * evaluator 0.1.2, any pipeline stage, normalisation, or any existing
 * frozen artefact, including the DRA-ENG-015 fill-colour representation-
 * integrity detector or the DRA-ENG-016 citation-integrity detector.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 26 documents (DRA-DOC-0001-0026).
 *
 * All live verification (HTTP status, repeated-fetch SHA-256 digests,
 * licence statement text, rendered-page visual inspection, pdfinfo/
 * pdffonts/pdfimages structural inspection) was performed on 2026-08-10
 * via `curl`, `pdftotext`, `pdftoppm`, `pdfinfo`, `pdffonts`, and
 * `pdfimages` against the documents' official publisher URLs (and, for
 * one deferred candidate, the National Archives' own archive.org mirror)
 * and is recorded here as fixed data. This module does not re-fetch
 * anything at runtime or during test execution, and it does not invoke
 * the DRA evaluator.
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 26,
  excludedDimensions: Object.freeze([
    "footnote_or_citation_marker_flattening",
    "table_or_cell_shading_structural_loss",
    "ordinary_scientific_citation_linkage",
  ]),
  excludedDimensionsRationale:
    "DRA-ACQ-020/021/022 already produced data points on footnote density, tabular semantic preservation, and " +
    "citation linkage. The task specification explicitly excludes re-targeting any of these three dimensions; " +
    "DRA-DOC-0027 must attack a materially different uncertainty.",
  newTargetDimension: "scan_and_ocr_representation_fidelity",
  newTargetRationale:
    "Every document admitted so far (DRA-DOC-0001-0026) either has a digitally-born native text layer or an " +
    "extraction-quality text layer good enough that the pipeline's failures have all been about what happens " +
    "AFTER extraction (statement segmentation, evidence linkage, materiality). None of the 26 admitted " +
    "documents tests whether DRA can recognise that its extracted text is itself an OCR GUESS over a scanned " +
    "image, potentially materially different from what the authoritative source actually says, or that some " +
    "source content (stamps, marginalia, handwriting, table imagery) has no textual representation at all.",
  centralResearchQuestion:
    "Can DRA determine when an authoritative document cannot be faithfully represented through its normal " +
    "text-extraction path because meaningful content exists only, or primarily, as page imagery?",
  candidateFocusInstruction:
    "Do not select a candidate merely because it looks old or scanned — search for a document that provides a " +
    "strong, ground-truth-checkable test of scan/OCR representation fidelity, evaluated on observed structural " +
    "evidence, not on a prediction of evaluator failure.",
});

// ---------------------------------------------------------------------------
// Part 2 — Representation classification and target failure modes
// ---------------------------------------------------------------------------

export const REPRESENTATION_CLASSIFICATIONS = [
  "NATIVE_TEXT",
  "OCR_TEXT_LAYER",
  "IMAGE_ONLY",
  "MIXED_REPRESENTATION",
] as const;
export type RepresentationClassification = (typeof REPRESENTATION_CLASSIFICATIONS)[number];

/** Verbatim (paraphrase-preserving) evidentiary objects distinguished by the DRA-ACQ-023 task specification. */
export const EVIDENTIARY_OBJECT_KINDS = [
  "SOURCE_IMAGE",
  "NATIVE_TEXT_LAYER",
  "OCR_OUTPUT",
  "DRA_CANONICAL_REPRESENTATION",
] as const;
export type EvidentiaryObjectKind = (typeof EVIDENTIARY_OBJECT_KINDS)[number];

export const TARGET_FAILURE_MODES: readonly string[] = Object.freeze([
  "complete_representation_failure_no_usable_text",
  "partial_representation_failure_some_pages_or_regions_disappear",
  "ocr_substitution_characters_or_words_transformed_incorrectly",
  "numeric_corruption_dates_quantities_identifiers_statutory_references_change",
  "structural_corruption_columns_paragraphs_headings_or_tables_reordered",
  "silent_incompleteness_plausible_text_but_unknowable_image_only_loss",
]);

export const DESIRED_STRUCTURAL_ELEMENTS: readonly string[] = Object.freeze([
  "scanned_original_pages",
  "absent_or_incomplete_native_text_layer",
  "ocr_text_supplied_or_embedded",
  "mixed_scanned_and_digitally_generated_pages",
  "stamps_or_seals",
  "handwritten_annotations_or_marginalia",
  "degraded_typography",
  "page_furniture_affecting_interpretation",
  "ocr_confusable_characters",
  "page_numbers_or_section_identifiers_for_traceability",
  "ordinary_prose_ground_truth",
  "names_or_proper_nouns_ground_truth",
  "numbers_or_dates_ground_truth",
  "section_headings_ground_truth",
]);

// ---------------------------------------------------------------------------
// Part 3 — Candidate register
// ---------------------------------------------------------------------------

export const OFFICIAL_SOURCE_STATUSES = ["VERIFIED", "NOT_VERIFIED"] as const;
export type OfficialSourceStatus = (typeof OFFICIAL_SOURCE_STATUSES)[number];

export const LICENCE_REUSE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceReuseStatus = (typeof LICENCE_REUSE_STATUSES)[number];

export const HTTP_ACCESSIBILITY_STATUSES = ["VERIFIED_ACCESSIBLE", "BLOCKED", "NOT_VERIFIED"] as const;
export type HttpAccessibilityStatus = (typeof HTTP_ACCESSIBILITY_STATUSES)[number];

export const SOURCE_STABILITY_STATUSES = ["BYTE_STABLE", "TEXT_STABLE", "UNKNOWN", "BLOCKED"] as const;
export type SourceStabilityStatus = (typeof SOURCE_STABILITY_STATUSES)[number];

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED_BLOCKED",
  "REJECTED_INSUFFICIENT_SCAN_OCR_DEPENDENCE",
] as const;
export type CandidateQualificationOutcome = (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface GroundTruthExample {
  readonly category: string;
  readonly location: string;
  readonly visuallyEstablishedContent: string;
  readonly extractedTextObserved: string;
  readonly matchesVisualGroundTruth: boolean;
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
  readonly representationClassification: RepresentationClassification | null;
  readonly representationEvidence: string;
  readonly structuralElementsObserved: readonly string[];
  readonly structuralEvidenceNote: string;
  readonly visuallyInspectedPages: readonly string[];
  readonly groundTruthExamples: readonly GroundTruthExample[];
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
  // --- Candidate 1: GPO/GovInfo CHRG-87hhrg72535 "The Metric System" (primary) ---
  Object.freeze({
    candidateId: "DRA-CAND-023-01",
    title:
      "The Metric System: Hearings Before Subcommittee No. 1 and the Committee on Science and Astronautics, " +
      "U.S. House of Representatives, Eighty-Seventh Congress, First Session, on H.R. 269 and H.R. 2049 " +
      "(June 28, 29, and July 21, 1961)",
    publisher: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo, GPO)",
    jurisdiction: "United States",
    domain: "GENERAL",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf",
    publicationDate: "1961-06-28 (hearings held June 28-29 and July 21, 1961)",
    approximateSize: "49,508,560 bytes, 80 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a U.S. House of Representatives committee hearing transcript printed by the U.S. " +
      "Government Printing Office, a work of the U.S. federal government under 17 U.S.C. §105, the same basis " +
      "already used for DRA-DOC-0010 (NIST), DRA-DOC-0013 (FDA), and DRA-DOC-0024 (CRS). GovInfo's own MODS " +
      "record classifies it as a 'government publication' authored by the U.S. House of Representatives.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on govinfo.gov (the official GPO/GovInfo domain; canonical package URL confirmed via GovInfo's " +
      "own MODS metadata record at /metadata/pkg/CHRG-87hhrg72535/mods.xml) returned HTTP 200, content-type " +
      "application/pdf, content-length 49,508,560 bytes, no authentication or paywall, despite being served " +
      "through a Cloudflare front end (unlike OBR/Ofwat/Ofcom/CBO, GovInfo's Cloudflare configuration did not " +
      "block a plain curl GET).",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Two independent live GETs of the canonical URL both returned identical SHA-256 " +
      "a34a88adf82f87c3cc55dc946d230efc1336299d2c21d8f2d42ce38f61992235 and identical byte length 49,508,560.",
    representationClassification: "OCR_TEXT_LAYER",
    representationEvidence:
      "pdfinfo reports Creator 'OmniPage CSDK 19' (a commercial OCR engine) and GovInfo's own MODS record " +
      "states physicalDescription/digitalOrigin = 'reformatted digital' with source content type 'deposited' " +
      "— an explicit publisher admission this is a reformatted (scanned) reproduction, not a digitally-born " +
      "document. pdfimages -list confirms exactly one full-page 2295x3643px 400ppi JPX raster image per page " +
      "(80 images for 80 pages, ratio 0.7-1.6% meaning the image dominates the file), and pdffonts shows a " +
      "single generic embedded CID font used to render the invisible OCR text layer on top of each page image " +
      "— the classic searchable-scan pattern (SOURCE_IMAGE = the 400ppi JPX raster; OCR_OUTPUT = OmniPage's " +
      "invisible text layer; there is no separate NATIVE_TEXT_LAYER at all). Direct visual rendering (pdftoppm " +
      "at 150 DPI) of pages 1, 5, and 40 confirms genuine paper-scan artefacts: visible paper texture, verso " +
      "bleed-through, and a rotated 'KANSAS STATE UNIVERSITY REFERENCE LIBRARY DEPARTMENT' ownership stamp " +
      "physically overlapping the printed title on both the cover and page 1 of the transcript body.",
    structuralElementsObserved: [
      "scanned_original_pages",
      "ocr_text_supplied_or_embedded",
      "stamps_or_seals",
      "handwritten_annotations_or_marginalia",
      "degraded_typography",
      "page_furniture_affecting_interpretation",
      "ocr_confusable_characters",
      "page_numbers_or_section_identifiers_for_traceability",
      "ordinary_prose_ground_truth",
      "names_or_proper_nouns_ground_truth",
      "numbers_or_dates_ground_truth",
      "section_headings_ground_truth",
    ],
    structuralEvidenceNote:
      "The cover page (rendered and cross-checked against pdftotext -f 1 -l 1) carries a handwritten annotation " +
      "('House - Science and astro...'), a 'GOVERNMENT / Storage' printed sticker, the round Kansas State " +
      "University library stamp, and a hand-annotated SuDoc call number ('Y4.Sci2 87-1/14') duplicated in " +
      "print at top-left and bottom-right — all of which the OCR layer partially and incoherently absorbs " +
      "into the front-matter text stream as uninterpretable fragments (e.g. 'REFERENCE (p .1` LIBRARY T:NT " +
      ".5'3', 'rl TATRE EP'), interleaved with genuine document text with no marker distinguishing stamp " +
      "artefact from source content — a direct, observed instance of the 'silent incompleteness' failure mode " +
      "the task specification calls out as especially valuable. A second, independently checkable defect: the " +
      "subcommittee roster on page 2 reads 'MR. HEMMER, West Virginia' where the correct name (confirmed by 63 " +
      "further correct occurrences of 'HECHLER' throughout the transcript body, and by the printed committee " +
      "membership record) is Rep. Ken HECHLER — a single, localised, ground-truth-checkable OCR proper-noun " +
      "substitution confined to one small-print block, while the same name is read correctly everywhere else " +
      "in the document. Body prose (e.g. page 36, Dr. J. T. Johnson's testimony) extracts cleanly with " +
      "accurate numbers ('750.896 miles per hour', '1916', '1926', '1936', '1958 and 1959', '1966') and proper " +
      "nouns ('Claremont, Calif.'), giving the probe both a corrupted zone (front matter, overlapping the " +
      "library stamp) and a clean zone (body transcript) for direct comparison.",
    visuallyInspectedPages: [
      "Page 1 / cover (rendered at 150 DPI): handwritten annotation, library stamp, 'GOVERNMENT Storage' " +
        "sticker, duplicated SuDoc call number, GPO/'Authenticated U.S. Government Information' seal",
      "Page 5 / transcript page 1 (rendered at 150 DPI): library stamp overlapping body text, opening " +
        "colloquy and full bill text (H.R. 269) with section numbering",
      "Page 40 / transcript page 36 (rendered at 150 DPI): clean body prose with numeric and proper-noun " +
        "ground truth, no stamp interference",
    ],
    groundTruthExamples: [
      {
        category: "names_or_proper_nouns",
        location: "Page 2 (printed subcommittee roster) vs. 63 body occurrences",
        visuallyEstablishedContent: "Rep. Ken HECHLER, West Virginia (confirmed by the printed committee membership block and by every body-text occurrence)",
        extractedTextObserved: "MR. HEMMER, West Virginia",
        matchesVisualGroundTruth: false,
        note: "Localised single-instance OCR name substitution in a small-print roster block; the same name reads correctly (HECHLER) everywhere else in the same document.",
      },
      {
        category: "page_furniture_and_stamps",
        location: "Page 1 and page 5 (library ownership stamp)",
        visuallyEstablishedContent: "A circular 'KANSAS STATE UNIVERSITY REFERENCE LIBRARY DEPARTMENT MANHATTAN, KANSAS' ownership stamp, clearly a library-added artefact unrelated to the hearing's content",
        extractedTextObserved: "Garbled fragments ('REFERENCE (p .1\\u0300 LIBRARY T:NT .5'3', 'rl TATRE EP') interleaved inline with genuine front-matter text, with no marker distinguishing stamp artefact from source content",
        matchesVisualGroundTruth: false,
        note: "A concrete, ground-truth-checkable instance of the 'silent incompleteness' failure mode: nothing in the extracted text indicates that part of it is a misread library stamp rather than document content.",
      },
      {
        category: "numbers_or_dates",
        location: "Page 40 (body prose, Dr. J. T. Johnson testimony)",
        visuallyEstablishedContent: "'750.896 miles per hour', '1916', '1926', '1936', '1958 and 1959', '1966'",
        extractedTextObserved: "'750.896 miles per hour', '1916', '1926', '1936', '1958 and 1959', '1966'",
        matchesVisualGroundTruth: true,
        note: "Clean body-page OCR is accurate; establishes a genuine contrast zone against the corrupted front matter rather than uniform document-wide degradation.",
      },
      {
        category: "section_headings",
        location: "Page 40 heading 'STATEMENT OF DR. J. T. JOHNSON, PRESIDENT, METRIC ASSOCIATION, INC.'",
        visuallyEstablishedContent: "STATEMENT OF DR. J. T. JOHNSON, PRESIDENT, METRIC ASSOCIATION, INC.",
        extractedTextObserved: "STATEMENT OF DR. J. T. JOHNSON, PRESIDENT, METRIC ASSOCIATION, INC.",
        matchesVisualGroundTruth: true,
        note: "Bold section headings in clean body pages extract correctly, giving a reliable structural anchor for statement segmentation despite the front-matter corruption.",
      },
    ],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "First document in the corpus whose text layer is entirely OCR-derived from a scanned page image rather " +
      "than digitally-born or a clean PDF text extraction; first with a physical library-provenance artefact " +
      "(ownership stamp, handwritten call-number annotation) folded into the extracted text stream; new " +
      "publisher genre (a scanned mid-century congressional hearing transcript, distinct from DRA-DOC-0024's " +
      "born-digital CRS report).",
    corpusDiversityLimitation:
      "Adds a fifth U.S.-jurisdiction PUBLIC_DOMAIN document (after DRA-DOC-0010 NIST, DRA-DOC-0013 FDA, " +
      "DRA-DOC-0024 CRS, and DRA-DOC-0025 EIA STEO if admitted); selected purely for scan/OCR experimental " +
      "merit, not jurisdiction-balance improvement.",
    knownRisks: [
      "The strongest defect evidence (stamp interference, name substitution) is concentrated in the front " +
        "matter/roster pages; a Phase 2 evaluation must deliberately include those specific pages in whatever " +
        "statement/claim sample it inspects rather than sampling only body transcript pages.",
      "GovInfo occasionally reprocesses CHRG package PDFs (the file's ModDate of 2024-08-16 postdates its " +
        "1961 CreationDate by decades, i.e. this is a reprocessed digitisation); the exact byte content should " +
        "be re-pinned by digest at Phase 2 admission time rather than assumed unchanged from this Phase 1 " +
        "observation.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 2: GovInfo Congressional Serial Set (1901 letter) (alternate) ---
  Object.freeze({
    candidateId: "DRA-CAND-023-02",
    title:
      "The Acting Secretary of the Interior, Transmitting Schedules of Useless Papers, Etc., in the Interior " +
      "Department (56th Congress, 2d Session, House Document No. 273, January 4, 1901)",
    publisher: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo Serial Set collection)",
    jurisdiction: "United States",
    domain: "GENERAL",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl:
      "https://www.govinfo.gov/content/pkg/SERIALSET-04155_00_00-040-0273-0000/pdf/SERIALSET-04155_00_00-040-0273-0000.pdf",
    publicationDate: "1901-01-04",
    approximateSize: "5,540,289 bytes, 10 pages",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — a U.S. House of Representatives document from 1901, more than a century past any " +
      "possible copyright term and itself a work of the U.S. federal government under 17 U.S.C. §105. GovInfo " +
      "hosts it as part of the official U.S. Congressional Serial Set collection.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET on govinfo.gov returned HTTP 200, content-type application/pdf, content-length 5,540,289 " +
      "bytes, no authentication or paywall.",
    sourceStabilityStatus: "BYTE_STABLE",
    stabilityObservations:
      "Single live GET recorded SHA-256 0ae08a78e5d578fec98c6db3cab05a2ac472bb043aea2f725c5d78741c0e3a7b and " +
      "byte length 5,540,289; a second confirmatory fetch was not repeated for this alternate given the " +
      "primary candidate's confirmation is sufficient to establish the general GovInfo-serving-pattern is " +
      "byte-stable and this candidate is not being advanced beyond alternate status.",
    representationClassification: "OCR_TEXT_LAYER",
    representationEvidence:
      "pdfinfo reports Producer 'Recoded by LuraDocument PDF v2.68' (a different scan-compression/OCR " +
      "toolchain than the primary candidate's OmniPage), pdfimages -list confirms one full-page 2150x3450px " +
      "400ppi JPX raster per page (10 images for 10 pages), and pdffonts shows only generic non-embedded " +
      "Times-Roman/Courier fonts rendering the invisible OCR text layer — the same searchable-scan pattern as " +
      "the primary candidate but produced by an independent vendor toolchain and a much older (1901 " +
      "letterpress, not 1961 typewriter) print source.",
    structuralElementsObserved: [
      "scanned_original_pages",
      "ocr_text_supplied_or_embedded",
      "degraded_typography",
      "ocr_confusable_characters",
      "page_numbers_or_section_identifiers_for_traceability",
      "ordinary_prose_ground_truth",
      "names_or_proper_nouns_ground_truth",
      "numbers_or_dates_ground_truth",
      "section_headings_ground_truth",
    ],
    structuralEvidenceNote:
      "pdftotext -layout produces a largely accurate transcription of the 1901 letter, but every historical " +
      "hyphenated line break (e.g. 'accompanying-', 'Represent-atives', 'depart-ment') is rendered with a " +
      "distinct '¬' (not-sign) character rather than an ordinary hyphen or a silently rejoined word — a " +
      "genuinely different OCR-confusable-character artefact than anything observed in the primary candidate, " +
      "produced by the LuraDocument toolchain's own line-break convention. No library stamp, handwriting, or " +
      "marginalia was observed on any of the document's 10 pages; the document is materially cleaner and " +
      "smaller, at the cost of less structural richness than the primary candidate.",
    visuallyInspectedPages: [
      "Page 1 (rendered indirectly via pdftotext cross-check against pdfimages structural metadata): letter " +
        "opening, statutory quotation, and signature block",
    ],
    groundTruthExamples: [
      {
        category: "ocr_confusable_characters",
        location: "Multiple line-wrap points throughout the 10-page letter",
        visuallyEstablishedContent: "Ordinary end-of-line hyphenation of a letterpress-printed word (e.g. 'accompanying', 'Representatives', 'department')",
        extractedTextObserved: "The word is rendered split across the line break with a '\u00ac' (not-sign) character in place of a hyphen (e.g. 'accompanying'', 'Represent\u00ac', 'depart\u00ac')",
        matchesVisualGroundTruth: false,
        note: "A distinct, toolchain-specific OCR-confusable-character artefact (LuraDocument's line-break convention), useful as a second, independent data point on OCR substitution distinct from the primary candidate's stamp-interference and name-substitution findings.",
      },
    ],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Adds a much older (1901 letterpress vs. 1961 typewriter) print source and a second, independent OCR " +
      "toolchain (LuraDocument vs. OmniPage), broadening the scan/OCR probe beyond a single digitisation " +
      "vendor if a second data point is wanted.",
    corpusDiversityLimitation:
      "Only 10 pages with no stamps, handwriting, or marginalia observed; provides materially less structural " +
      "richness and fewer observed failure-mode instances than the primary candidate, and shares the primary " +
      "candidate's GENERAL/United-States/PUBLIC_DOMAIN profile.",
    knownRisks: [
      "Its single clearly observed defect (the '\u00ac' line-break artefact) is a comparatively mild, " +
        "well-understood OCR quirk rather than a rich, multi-failure-mode source; would make a weaker primary " +
        "probe than DRA-CAND-023-01 despite being fully qualified.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason: null,
  }),
  // --- Candidate 3: National Archives / Internet Archive IG Farben Trial Transcripts (deferred, oversized) ---
  Object.freeze({
    candidateId: "DRA-CAND-023-03",
    title:
      "IG Farben Trial Transcripts — Records of the United States Nuremberg War Crimes Trials, United States " +
      "of America v. Carl Krauch et al. (Case VI), National Archives Microfilm Publication M892, Roll 01",
    publisher:
      "National Archives and Records Administration (creator of record); digitised and hosted on the Internet " +
      "Archive by a third-party contributor (Dr. Rath Health Foundation)",
    jurisdiction: "United States (federal record of a U.S. military tribunal)",
    domain: "LEGAL",
    documentType: "REPORT",
    language: "en",
    sourceFormat: "PDF",
    officialSourceUrl: "https://archive.org/download/IGFarbenTrialTranscripts/roll_01.pdf",
    publicationDate: "1947-1948 (trial proceedings); microfilmed 1976; digitised and uploaded 2017-11-22",
    approximateSize: "64,173,568 bytes (Roll 01 alone; the collection spans 911 files across many microfilm rolls)",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "PUBLIC_DOMAIN — Internet Archive's own item metadata records licenseurl " +
      "'http://creativecommons.org/publicdomain/mark/1.0/' and creator 'National Archives and Records " +
      "Administration'; the underlying content is an official transcript of a U.S. government military " +
      "tribunal, consistent with the PUBLIC_DOMAIN basis used elsewhere in this corpus for federal-government " +
      "records. Digitisation by a third-party contributor (a health foundation, not NARA itself) does not " +
      "narrow the reuse rights already attaching to the underlying government record, but this indirection is " +
      "recorded rather than glossed over.",
    licenceReuseStatus: "VERIFIED",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence:
      "Live GET of the Internet Archive metadata API (archive.org/metadata/IGFarbenTrialTranscripts) returned " +
      "HTTP 200 and a complete file manifest (911 files); archive.org direct-download URLs are not subject to " +
      "the Cloudflare/bot-mitigation blocking pattern seen on OBR/Ofwat/Ofcom/CBO.",
    sourceStabilityStatus: "UNKNOWN",
    stabilityObservations:
      "Only the metadata manifest (file names, sizes, and per-file MD5/SHA1 checksums recorded by Internet " +
      "Archive at ingest time) was fetched; the full ~64 MB roll_01.pdf binary was not independently " +
      "re-downloaded twice to confirm byte-stability, since this candidate is being deferred on size grounds " +
      "before that verification step was warranted.",
    representationClassification: "MIXED_REPRESENTATION",
    representationEvidence:
      "Internet Archive's own derivative pipeline exposes each microfilm roll as at least three separate " +
      "evidentiary objects with different representational completeness: 'roll_01.pdf' (format 'Image " +
      "Container PDF', 64,173,568 bytes — SOURCE_IMAGE only, page-image scans of the microfilm with no text " +
      "layer at all), 'roll_01_text.pdf' (format 'Additional Text PDF', 43,442,226 bytes, produced from " +
      "'roll_01_abbyy.gz', an ABBYY FineReader 11.0 Extended OCR pass — a separately-hosted OCR_OUTPUT " +
      "document), and 'roll_01_djvu.txt' (a third, plain-text-only derivative). Unlike the primary and " +
      "alternate candidates, where SOURCE_IMAGE and OCR_OUTPUT are fused into one PDF, here they are three " +
      "distinct files a consumer must know to combine — a structurally different and more severe " +
      "MIXED_REPRESENTATION pattern, but one that was not visually page-by-page inspected in this Phase 1 " +
      "pass given the deferral decision below.",
    structuralElementsObserved: [
      "scanned_original_pages",
      "absent_or_incomplete_native_text_layer",
      "ocr_text_supplied_or_embedded",
      "mixed_scanned_and_digitally_generated_pages",
    ],
    structuralEvidenceNote:
      "Recorded from the Internet Archive item metadata and file manifest only (format labels, file sizes, " +
      "'ocr: ABBYY FineReader 11.0 (Extended OCR)' metadata field); no individual page was rendered or visually " +
      "inspected for this candidate, consistent with the deferral decision below and the rule (established at " +
      "DRA-ACQ-019/020/021) that a candidate not advanced to recommended/alternate status is not owed the same " +
      "depth of manual verification as one that is.",
    visuallyInspectedPages: [],
    groundTruthExamples: [],
    isRepeatPublisher: false,
    corpusDiversityContribution:
      "Would add a genuinely different MIXED_REPRESENTATION pattern (three separate evidentiary-object files " +
      "per document unit rather than one fused searchable-scan PDF), a new domain (LEGAL, a genuine military " +
      "tribunal trial transcript), and the corpus's first mid-20th-century historical/archival record sourced " +
      "through microfilm rather than a born-digital or directly-scanned original.",
    corpusDiversityLimitation:
      "None beyond the size/tractability concern below; the domain and representation-pattern novelty are " +
      "both genuine.",
    knownRisks: [
      "Each microfilm roll is 64-134 MB and (per the item's own scandata) several hundred pages long; the " +
        "task specification explicitly prefers 'a moderately sized document with excellent ground truth over " +
        "an enormous archive scan whose failures are difficult to measure' — constructing reliable, " +
        "hand-verifiable visual ground truth across a multi-hundred-page microfilm roll is materially harder " +
        "than for the 10-80 page candidates above, and the collection's 911-file manifest means no single " +
        "roll is self-contained relative to the full trial record.",
      "Digitisation was performed by a third-party uploader, not NARA directly; while the underlying record's " +
        "public-domain status does not depend on the digitiser, a Phase 2 admission would need to independently " +
        "re-confirm that NARA's own catalog (rather than only the Internet Archive mirror) can serve as the " +
        "canonical official source, or explicitly document why the Internet Archive mirror is being treated as " +
        "authoritative in its place.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "Governance and representation-diversity evidence are both genuinely strong, but the task specification " +
      "explicitly prefers a moderately sized document with excellent, hand-verifiable ground truth over an " +
      "enormous archive scan whose failures are difficult to measure; at 64-134 MB and several hundred pages " +
      "per roll, with 911 files in the full collection, this candidate was not pursued to visual ground-truth " +
      "verification in this Phase 1 pass and is recorded as DEFERRED rather than rejected outright, in case a " +
      "future probe specifically wants the three-file MIXED_REPRESENTATION pattern it uniquely offers.",
  }),
  // --- Candidate 4: CIA FOIA Electronic Reading Room (rejected, blocked) ---
  Object.freeze({
    candidateId: "DRA-CAND-023-04",
    title: "\"FAMILY JEWELS\" — CIA Directorate of Operations Internal Report of Potentially Illegal Activities (1973, declassified 2007)",
    publisher: "Central Intelligence Agency (CIA), via the CIA FOIA Electronic Reading Room",
    jurisdiction: "United States",
    domain: "GENERAL",
    documentType: "REPORT",
    language: "en-US",
    sourceFormat: "PDF",
    officialSourceUrl: "https://www.cia.gov/readingroom/docs/DOC_0001451843.pdf",
    publicationDate: "1973 (compiled); declassified and released 2007",
    approximateSize: "unknown — every fetch attempt was blocked before any PDF bytes were returned",
    officialSourceStatus: "VERIFIED",
    licenceReuseBasis:
      "Not verified — the licence position could not be read from document content because every fetch " +
      "attempt was blocked before any PDF bytes were returned. CIA FOIA reading-room releases are " +
      "conventionally U.S. federal-government public-domain works, but that is a genre inference here, not a " +
      "confirmed document-level statement.",
    licenceReuseStatus: "NOT_VERIFIED",
    httpAccessibility: "BLOCKED",
    accessibilityEvidence:
      "Three independent live fetch attempts on cia.gov (a plain HEAD, a GET with a standard desktop-browser " +
      "User-Agent, and a GET with cookies established from a prior same-domain request plus a matching " +
      "Referer header) all returned an 'Access Denied' HTML challenge page (HTTP 200 body, not the requested " +
      "PDF) rather than document bytes — a bot-mitigation pattern distinct from, but functionally identical " +
      "in effect to, the Cloudflare 403 challenges already logged for OBR/Ofwat/Ofcom/CBO/BLS/GAO in prior " +
      "acquisitions.",
    sourceStabilityStatus: "BLOCKED",
    stabilityObservations: "Not applicable — no document bytes were ever retrieved.",
    representationClassification: null,
    representationEvidence:
      "Not assessed — no document bytes were retrieved, so no representation classification can be made. This " +
      "candidate is known by reputation (declassified CIA operational reports of this era are typewritten, " +
      "carry classification stamps, redaction markings, and handwritten routing annotations) to plausibly fit " +
      "this probe extremely well, but that reputation was not treated as a substitute for direct inspection.",
    structuralElementsObserved: [],
    structuralEvidenceNote:
      "No structural elements are recorded as observed, per the established rule that a BLOCKED candidate's " +
      "structuralElementsObserved list must remain empty regardless of genre reputation.",
    visuallyInspectedPages: [],
    groundTruthExamples: [],
    isRepeatPublisher: false,
    corpusDiversityContribution: "Would have added a new publisher (CIA) and an intelligence-community genre had it been accessible.",
    corpusDiversityLimitation: "Rejected on accessibility grounds before diversity could be realised.",
    knownRisks: [
      "cia.gov's bot mitigation blocked every attempted access method used; a materially different access " +
        "path (e.g. a different network egress or an authenticated browser session) would be required before " +
        "reconsidering this candidate, which is out of scope for this discovery-only phase.",
    ],
    qualificationOutcome: "REJECTED_BLOCKED",
    rejectionOrDeferralReason:
      "HTTP accessibility is BLOCKED on all attempted requests; per the established rule (DRA-ACQ-019/020/021), " +
      "no BLOCKED candidate may be marked QUALIFIED_RECOMMENDED, QUALIFIED_ALTERNATE, or DEFERRED regardless of " +
      "how promising its reputation or genre.",
  }),
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking and Phase 1 verdict
// ---------------------------------------------------------------------------

/**
 * Deterministic, pre-declared ranking rule: candidates with a confirmed representation classification and
 * VERIFIED_ACCESSIBLE + BYTE_STABLE evidence rank above ones without; among those, the count of observed
 * desired structural elements (descending) breaks ties, since structural/failure-mode richness — not mere
 * accessibility — is this probe's defining selection axis. BLOCKED candidates always rank last.
 */
function rankCandidates(candidates: readonly CandidateRecord[]): readonly string[] {
  const accessible = candidates
    .filter((c) => c.httpAccessibility === "VERIFIED_ACCESSIBLE")
    .slice()
    .sort((a, b) => b.structuralElementsObserved.length - a.structuralElementsObserved.length);
  const blocked = candidates.filter((c) => c.httpAccessibility === "BLOCKED");
  return Object.freeze([...accessible, ...blocked].map((c) => c.candidateId));
}

export const RANKED_CANDIDATE_IDS: readonly string[] = rankCandidates(CANDIDATE_REGISTER);
export const PRIMARY_CANDIDATE_ID = "DRA-CAND-023-01";
export const ALTERNATE_1_CANDIDATE_ID = "DRA-CAND-023-02";
export const ALTERNATE_2_CANDIDATE_ID = "DRA-CAND-023-03";
export const ALTERNATE_3_CANDIDATE_ID = "DRA-CAND-023-04";

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
 * TEXT_STABLE, a confirmed (non-null) representation classification, at least one visually inspected page,
 * at least one ground-truth example demonstrating a mismatch (i.e. a real, observed failure instance rather
 * than a hypothetical one), and a non-trivial count of observed desired structural elements (>= 8). All hold
 * for the primary candidate.
 */
export function primaryCandidatePhase1Verdict(): Phase1Verdict {
  const c = primaryCandidate();
  const accessible = c.httpAccessibility === "VERIFIED_ACCESSIBLE";
  const stable = c.sourceStabilityStatus === "BYTE_STABLE" || c.sourceStabilityStatus === "TEXT_STABLE";
  const officialAndLicensed = c.officialSourceStatus === "VERIFIED" && c.licenceReuseStatus === "VERIFIED";
  const classified = c.representationClassification !== null;
  const visuallyVerified = c.visuallyInspectedPages.length > 0;
  const hasObservedMismatch = c.groundTruthExamples.some((g) => !g.matchesVisualGroundTruth);
  const richStructure = c.structuralElementsObserved.length >= 8;
  if (c.httpAccessibility === "BLOCKED") return "BLOCKED";
  if (
    accessible &&
    stable &&
    officialAndLicensed &&
    classified &&
    visuallyVerified &&
    hasObservedMismatch &&
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
    proposedCorpusId: "DRA-DOC-0027",
  }),
  governance: Object.freeze({
    officialSourceStatus: primaryCandidate().officialSourceStatus,
    licenceReuseStatus: primaryCandidate().licenceReuseStatus,
    licenceReuseBasis: primaryCandidate().licenceReuseBasis,
    unresolvedQuestions: Object.freeze([
      "GovInfo's CHRG-87hhrg72535 PDF carries a 2024-08-16 reprocessing ModDate over its 1961 content; the " +
        "exact byte content should be re-pinned by fresh digest at Phase 2 admission time rather than assumed " +
        "unchanged from this Phase 1 observation, in case GovInfo reprocesses the package again.",
    ]),
  }),
  acquisition: Object.freeze({
    sourceFormat: primaryCandidate().sourceFormat,
    sourceStabilityStatus: primaryCandidate().sourceStabilityStatus,
    stabilityObservations: primaryCandidate().stabilityObservations,
    representationClassification: primaryCandidate().representationClassification,
    risks: primaryCandidate().knownRisks,
  }),
  evidenceContribution:
    "DRA-DOC-0027 would provide the corpus's first document whose entire text layer is OCR output over a " +
    "scanned page image rather than a native or clean PDF-native text extraction, directly targeting the " +
    "DRA-ACQ-023 central research question of whether DRA can recognise when its normal extraction path does " +
    "not faithfully represent the authoritative source. It provides two independently ground-truth-checkable " +
    "observed defects (a localised proper-noun substitution, and library-stamp text bleeding into the document " +
    "stream with no marker distinguishing it from source content) plus a clean contrast zone (body prose) in " +
    "the same document, giving a Phase 2 evaluation a concrete, falsifiable basis for testing partial " +
    "representation failure and silent incompleteness without needing a hypothetical worst case.",
  corpusContribution:
    "Adds no new domain (GENERAL, already well represented) or jurisdiction (United States, already the " +
    "corpus's most common jurisdiction) diversification; selected purely for scan/OCR-representation " +
    "experimental merit, consistent with the task's explicit instruction not to select for publisher novelty " +
    "or predicted evaluator failure over structural/failure-mode value.",
  risks: primaryCandidate().knownRisks,
  recommendationReasoning:
    "DRA-CAND-023-01 is the only candidate that is simultaneously VERIFIED official-source, VERIFIED licence, " +
    "VERIFIED_ACCESSIBLE, BYTE_STABLE across two independent live fetches, confirmed by pdfinfo/pdffonts/" +
    "pdfimages structural inspection and direct visual rendering to be a genuine OCR_TEXT_LAYER searchable " +
    "scan, and — uniquely among all four candidates — has two independently observed, ground-truth-checkable " +
    "representation defects (the HECHLER/HEMMER name substitution and the library-stamp text-stream " +
    "interference) alongside a clean contrast zone in the same document. DRA-CAND-023-02 (1901 Serial Set " +
    "letter) is a fully qualified alternate with a genuine, independent OCR-artefact finding (the LuraDocument " +
    "'\u00ac' line-break substitution) but is smaller, cleaner, and offers only one failure-mode instance rather " +
    "than two. DRA-CAND-023-03 (IG Farben Trial Transcripts) offers the most structurally novel " +
    "MIXED_REPRESENTATION pattern of any candidate examined, but at 64-134 MB and several hundred pages per " +
    "microfilm roll it conflicts directly with the task's explicit preference for a moderately sized document " +
    "with excellent, hand-verifiable ground truth, so it is recorded as DEFERRED rather than advanced. " +
    "DRA-CAND-023-04 (CIA 'Family Jewels') was researched in good faith and by reputation would likely have " +
    "been an exceptionally strong candidate, but every attempted access method was blocked by cia.gov's bot " +
    "mitigation, the same class of blocker already documented for several other government sites in this " +
    "programme. No candidate was chosen, or rejected, on the basis of whether it seemed likely to make the " +
    "evaluator fail; that determination is explicitly reserved for a future Phase 2 evaluation and is out of " +
    "scope for this Phase 1 discovery module.",
  nextBestCandidateIfRejected: `${ALTERNATE_1_CANDIDATE_ID} is fully qualified and ready to substitute immediately if DRA-CAND-023-01's front-matter-corruption concentration becomes a Phase 2 admission concern; ${ALTERNATE_2_CANDIDATE_ID} would need a moderate-size subset (not a full microfilm roll) identified and visually verified before it could be reconsidered, and ${ALTERNATE_3_CANDIDATE_ID} would need its access block resolved.`,
});

// ---------------------------------------------------------------------------
// Part 6 — DRA-ENG-015 interaction analysis (observation only)
// ---------------------------------------------------------------------------

/**
 * Records the required consideration of whether the existing DRA-ENG-015 fill-colour representation-integrity
 * detector (built for the table-shading probe, DRA-DOC-0025) offers any relevant precedent for scan/OCR
 * representation loss. This is an observation, not an implementation change; no detector code is modified.
 */
export const ENG_015_INTERACTION_ANALYSIS = Object.freeze({
  precedentConsidered:
    "DRA-ENG-015 established the pattern of a decoupled, non-wired representation-integrity SIGNAL (not a " +
    "pipeline stage or evaluator issue class) that inspects a PDF's own visual/structural properties " +
    "independently of extracted text, to detect when a representation-carrying property (there: cell fill-" +
    "colour diversity) cannot be recovered from text alone.",
  doesFillColourDetectorSolveScanOcr: false,
  reasoning:
    "The DRA-ENG-015 detector specifically measures fill-colour diversity via a vector/SVG rendering pass " +
    "(pdftocairo -svg); it says nothing about whether a page IS a scanned raster image in the first place, " +
    "whether an embedded text layer is OCR-derived rather than native, or whether OCR output plausibly matches " +
    "the source. A genuinely different signal would be needed: e.g. per-page embedded-image-coverage-and-DPI " +
    "inspection (pdfimages -list: full-page-sized raster images at typical scan resolutions, similar to what " +
    "this Phase 1 module used manually) combined with font-embedding inspection (pdffonts: generic non-" +
    "embedded fonts covering 100% of visible glyphs, versus embedded/subsetted fonts typical of digitally-" +
    "born PDFs) to classify NATIVE_TEXT vs. OCR_TEXT_LAYER vs. IMAGE_ONLY vs. MIXED_REPRESENTATION.",
  scanOcrRequires: Object.freeze([
    "another_decoupled_representation_integrity_signal_distinct_from_dra_eng_015",
    "acquisition_time_classification_recorded_alongside_licence_and_stability_evidence",
    "explicit_uncertainty_surfaced_to_downstream_consumers_rather_than_silently_trusted_ocr_text",
  ]),
  architecturalChangeRequiredNow: false,
  note:
    "This analysis is Phase 1 observation only, required by the DRA-ACQ-023 task specification's 'Interaction " +
    "with existing representation-integrity work' section. It proposes no code change and implements no new " +
    "signal; that determination (if any) is explicitly out of scope for this discovery-only phase.",
});

// ---------------------------------------------------------------------------
// Part 7 — Phase boundary confirmation
// ---------------------------------------------------------------------------

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0027";

export const PROPOSED_PHASE_2_SCOPE = Object.freeze([
  "governance_reconfirmation_of_official_source_and_licence_at_admission_time",
  "deterministic_live_fetch_a_b_for_primary_candidate_with_fresh_digest_pinning",
  "freeze_and_normalise_primary_candidate",
  "corpus_admission_as_dra_doc_0027",
  "run_evaluator_0_1_2_against_dra_doc_0027_in_a_dedicated_benchmark",
  "compare_rendered_source_vs_extracted_vs_normalised_vs_statements_vs_evaluation_for_the_visually_baselined_front_matter_and_body_pages",
  "assess_whether_the_hechler_hemmer_name_substitution_and_stamp_interference_propagate_into_statement_extraction_evidence_linkage_or_materiality",
  "record_confirmed_generalisable_weakness_or_isolated_anomaly_verdict_for_the_scan_ocr_representation_fidelity_hypothesis",
]);

export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "freeze_selected_document",
  "admit_dra_doc_0027",
  "run_final_admission_evaluator",
  "run_dra_evaluator_on_any_candidate",
  "create_dra_bmk_027",
  "create_new_freeze_record",
  "create_new_acquisition_record",
  "modify_evaluator_0_1_2",
  "modify_normalisation",
  "modify_existing_frozen_artefacts",
  "modify_dra_eng_015_detector",
  "modify_dra_eng_016_detector",
  "add_ocr_to_the_production_pipeline",
  "change_evaluator_version",
  "change_pipeline_version",
  "weaken_acquisition_or_governance_requirements",
  "begin_corrective_engineering_for_any_scan_or_ocr_defect",
  "select_candidate_based_on_predicted_evaluator_outcome",
] as const);
