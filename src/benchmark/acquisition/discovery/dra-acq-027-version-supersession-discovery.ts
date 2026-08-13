/**
 * DRA-ACQ-027 — Phase 1: Version/Supersession Robustness Candidate Discovery
 * for DRA-DOC-0031
 *
 * CONTEXT — Documents 1-30 and their companion engineering tickets have
 * exercised source authenticity (official-domain verification, byte/text
 * stability), licence basis, representation fidelity (OCR, tables, graphics,
 * citations), language, and scale. None has asked a *temporal authority*
 * question: whether an authentic, correctly-extracted, internally coherent
 * document can still be UNSAFE for current use because a newer authoritative
 * version has superseded it.
 *
 * CENTRAL RESEARCH QUESTION — Can DRA's current document-level trust model
 * distinguish AUTHENTIC_CURRENT from AUTHENTIC_SUPERSEDED? This is
 * deliberately narrower than "is this document authentic" (already covered)
 * and asks instead whether DRA has ANY mechanism — in acquisition metadata,
 * freeze records, evaluation input, authority resolution, or the proof
 * receipt — capable of representing "this document was once authoritative
 * but no longer is."
 *
 * ANTI-CONTAMINATION STATEMENT (verbatim pattern established at DRA-ACQ-018
 * through DRA-ACQ-026) — No candidate in CANDIDATE_REGISTER was fetched
 * into, or run through, evaluator 0.1.2, the DRA pipeline, or any of its
 * stages, at any point during this Phase 1 investigation. Candidate
 * selection used only (a) live HTTP/licence/official-source verification,
 * (b) each publisher's own supersession/withdrawal notices, and (c) each
 * publisher's own published summary-of-changes documentation — never the
 * DRA evaluator's own output, and never a prediction of whether a candidate
 * would make the evaluator fail. No formal admission, freeze, or evaluation
 * was performed on any candidate. DRA-DOC-0030 (already admitted, FROZEN,
 * separately fully evaluated under DRA-ENG-019) is referenced read-only, as
 * pre-existing corpus ground truth, and is not re-frozen or re-evaluated by
 * this module.
 *
 * SCOPE — Phase 1 (candidate discovery and qualification) ONLY. This module
 * does not download-and-freeze, admit, or evaluate any document. It does not
 * create DRA-DOC-0031, a new freeze record, or a new acquisition record, and
 * it does not add version metadata, modify authority resolution, activate an
 * AUTHORITY_EXPIRED issue class (none exists — see the capability audit
 * below), modify evaluator semantics, alter issue classes, or change the
 * freeze schema.
 *
 * Current evaluator identity (unchanged by this programme):
 *   evaluatorVersion = 0.1.2, pipelineVersion = 1.0, schemaVersion = 0.1.0.
 * Current admitted corpus: 30 documents (DRA-DOC-0001-0030).
 *
 * All live verification (HTTP status, official-domain confirmation,
 * publisher-stated supersession/withdrawal notices, and two-independent-GET
 * SHA-256 byte-stability checks for both NIST PDF candidates) was performed
 * on 2026-08-11 against the documents' official publisher URLs and is
 * recorded here as fixed, measured data (see `byteStability` on each
 * candidate record). This module does not re-fetch anything at runtime, and
 * the companion test file in `__tests__/` performs no live network calls —
 * it only checks data-integrity and reasoning invariants over the fixed
 * records captured here, matching the established Phase 1 discovery-test
 * convention (DRA-ACQ-018 through DRA-ACQ-026).
 */

import type { Domain, DocumentType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

export const PROGRAMME_CONTEXT = Object.freeze({
  corpusSizeBeforeThisAcquisition: 30,
  priorFinding:
    "DRA-DOC-0001 through DRA-DOC-0030 and their companion engineering tickets (DRA-ENG-009 through DRA-ENG-019) " +
    "have exercised source authenticity, licence basis, representation fidelity (OCR/scan, tables, graphics, " +
    "citations), multilingual robustness, footnote density, and document scale. None has admitted a document " +
    "specifically to test whether DRA can distinguish a currently-authoritative document from an authentic BUT " +
    "SUPERSEDED prior version of the same publication family.",
  centralResearchQuestion:
    "Can DRA's current document-level trust model distinguish AUTHENTIC_CURRENT from AUTHENTIC_SUPERSEDED? An " +
    "obsolete document may be authentic, byte-stable, officially published, correctly extracted, and internally " +
    "coherent, and still be unsafe for current machine consumption because a newer authoritative version " +
    "supersedes it. This is a temporal-authority question, distinct from ordinary source-authenticity questions " +
    "already covered by DRA-ENG-009/010 and the acquisition governance pipeline.",
  distinguishingFromAuthenticity:
    "Source authenticity asks 'was this document genuinely published by the claimed authority, unmodified since " +
    "publication'. Temporal authority asks a different question: 'even granting full authenticity, is this " +
    "still the CURRENT authoritative statement, or has it been superseded by a later one from the same " +
    "authority'. A document can score VERIFIED on every existing DRA governance check and still be the wrong " +
    "document to trust today.",
  negativeResultIsAcceptable: true,
  negativeResultPolicy:
    "NO_CANDIDATE_MEETS_REQUIREMENTS is an explicitly acceptable Phase 1 outcome. This module does not lower the " +
    "evidentiary bar (ambiguous supersession, unauthenticated historical version, or purely editorial " +
    "differences) merely to reach a 31st corpus document.",
  engineeringConstraint:
    "Phase 1 is discovery only. This module and its companion test do not add version metadata, modify " +
    "authority resolution, activate or introduce an AUTHORITY_EXPIRED (or equivalent) issue class, modify " +
    "evaluator semantics, alter issue classes, or change the freeze schema. Any temporal-authority weakness " +
    "discovered is documented here for a possible Phase 2 / future engineering ticket, not acted on now.",
});

// ---------------------------------------------------------------------------
// Part 2 — Current DRA capability audit (read-only; no code modified)
// ---------------------------------------------------------------------------
//
// Established by direct source inspection of src/model, src/benchmark, and
// src/authority-resolution (2026-08-11). See DRA-ACQ-027 Phase 1 report for
// the full file/line citations.

export const CAPABILITY_AUDIT = Object.freeze({
  versionOrRevisionField: Object.freeze({
    existsAnywhere: true,
    location: "SourceDocument.version (model/documents.ts, optional free-form string); CorpusDocumentInput.generatorVersion (benchmark/corpus/schema.ts, identifies the DRA schema/toolchain generation, not the source publication's revision)",
    propagatesToFreezeMetadata: false,
    propagatesToEvaluationInput: false,
    propagatesToAuthorityResolution: false,
    propagatesToProofReceipt: false,
    verdict:
      "Exists as an optional free-form field with no semantic meaning attached anywhere downstream. Nothing " +
      "reads SourceDocument.version to affect authority classification, materiality, or the final decision. It " +
      "is dead for trust-semantics purposes.",
  }),
  supersededWithdrawnReplacedField: Object.freeze({
    existsAnywhere: false,
    location: "Appears only as acquisition-discovery PROSE (candidate notes, inclusion rationale sentences) in " +
      "prior Phase-1 discovery modules and admission-test docblocks — never as a typed field, enum value, or " +
      "schema property on SourceDocument, CorpusDocumentInput, AcquisitionFreezeRecord, or ProofReceipt.",
    propagatesToFreezeMetadata: false,
    propagatesToEvaluationInput: false,
    propagatesToAuthorityResolution: false,
    propagatesToProofReceipt: false,
    verdict:
      "No lifecycle-relation concept exists in the schema at all. freeze.ts documents that a new version of a " +
      "source requires an entirely new corpusDocumentId — i.e. DRA's freeze model treats every revision as an " +
      "unrelated document, with no structural link back to any prior or superseding version.",
  }),
  effectiveDateOrCurrentnessField: Object.freeze({
    existsAnywhere: true,
    location: "SourceDocument.publishedAt (model/documents.ts) — comment states it may be used for 'authority " +
      "currency checks' in Stage 3, but the current authority-resolution implementation does not read or " +
      "compare this field against any reference date, another document's date, or a supersession relationship.",
    propagatesToFreezeMetadata: false,
    propagatesToEvaluationInput: true,
    propagatesToAuthorityResolution: false,
    propagatesToProofReceipt: false,
    verdict:
      "The field exists structurally on the evaluation-input model and is CAPABLE of carrying a publication " +
      "date into the pipeline, but is not actually inspected by any Stage 3 (Authority Resolution) logic today. " +
      "It is present but unused — a real but currently-dormant hook, not an active capability.",
  }),
  freezeRecordDateFields: Object.freeze({
    onlyField: "frozenAt (operational freeze timestamp — when DRA froze the artefact, not when the source was published or became effective)",
    corpusDocumentInputHasAnyDateField: false,
    verdict:
      "CorpusDocumentInput has no date field at all — not even one generic publication date, let alone a " +
      "distinct publication-date vs effective/superseded-date pair. AcquisitionFreezeRecord's only timestamp is " +
      "the operational frozenAt.",
  }),
  authorityClassificationEnum: Object.freeze({
    values: [
      "DOCUMENT_AUTHOR",
      "EXPLICIT_NAMED_SOURCE",
      "EXPLICIT_UNNAMED_SOURCE",
      "STRUCTURALLY_INHERITED_SOURCE",
      "AMBIGUOUS_SOURCE",
      "NO_IDENTIFIABLE_SOURCE",
    ] as const,
    hasTemporalOrCurrencyValue: false,
    verdict:
      "None of the six authority classifications is temporal or currency-related. A statement drawn from a " +
      "superseded-but-authentic document would classify identically (e.g. DOCUMENT_AUTHOR) to the same statement " +
      "drawn from the current version — the classification captures WHO is speaking, not WHEN their statement " +
      "stopped being current.",
  }),
  authorityExpiredIssueClass: Object.freeze({
    exists: false,
    verdict:
      "No AUTHORITY_EXPIRED, AUTHORITY_SUPERSEDED, or equivalent issue class exists anywhere in the issue " +
      "taxonomy (issues.ts) or the Stage 6 Consistency Check rule set. The existing AUTHORITY_ABSENT class " +
      "targets a different condition entirely (no identifiable source at all), and would not fire for a " +
      "well-sourced statement drawn from a document whose source has since been superseded.",
  }),
  theoreticalRepresentability: Object.freeze({
    couldArchitectureRepresentSupersessionInPrinciple: true,
    howWithoutCodeChange:
      "Not producible today without a code change. The freeze/corpus/evaluation-input schemas have no field to " +
      "carry a supersession relationship, and no stage reads publication or effective dates to compare " +
      "documents. This is a genuine architectural gap, not a dormant field waiting to be populated.",
    conclusion:
      "The required condition (an evaluation producing observably different trust output for an authentic-but-" +
      "superseded document vs. its current replacement) is CURRENTLY NOT PRODUCIBLE by the existing pipeline. " +
      "This is the central Phase 1 finding and the motivating rationale for DRA-DOC-0031's proposed role.",
  }),
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register: version-pair governance and change fields
// ---------------------------------------------------------------------------

export const LICENCE_STATUSES = ["VERIFIED", "PROVISIONAL", "NOT_VERIFIED"] as const;
export type LicenceStatus = (typeof LICENCE_STATUSES)[number];

export const SELF_DISCLOSURE_STATUSES = [
  "OLD_VERSION_SELF_DISCLOSES_SUPERSESSION",
  "SUPERSESSION_ONLY_DISCOVERABLE_EXTERNALLY",
  "UNKNOWN",
] as const;
export type SelfDisclosureStatus = (typeof SELF_DISCLOSURE_STATUSES)[number];

export const CHANGE_TYPES = [
  "REQUIREMENT_ADDED",
  "REQUIREMENT_REMOVED",
  "THRESHOLD_CHANGED",
  "SCOPE_CHANGED",
  "RECOMMENDATION_REVERSED",
  "TERMINOLOGY_REDEFINED",
  "OBLIGATION_STRENGTHENED",
  "OBLIGATION_WEAKENED",
  "EXCEPTION_ADDED_OR_REMOVED",
  "PROCESS_CHANGED",
  "STRUCTURAL_REORGANISATION",
  "NO_SUBSTANTIVE_CHANGE",
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];

export const MATERIALITY_LEVELS = ["MATERIAL", "EDITORIAL_ONLY", "UNCHANGED_CONTROL"] as const;
export type MaterialityLevel = (typeof MATERIALITY_LEVELS)[number];

export interface ByteStabilityCheck {
  readonly url: string;
  readonly httpStatus: number;
  readonly byteLength: number;
  readonly sha256Hashes: readonly [string, string];
  readonly stable: boolean;
  readonly verifiedOn: string;
}

export interface VersionDifferenceRecord {
  readonly recordId: string;
  readonly oldProposition: string;
  readonly newProposition: string;
  readonly changeType: ChangeType;
  readonly materiality: MaterialityLevel;
  readonly evidence: string;
}

export const CANDIDATE_REPRESENTATION_OPTIONS = [
  "SUPERSEDED_DOCUMENT_ITSELF",
  "CURRENT_DOCUMENT_WITH_OLD_VERSION_COMPARISON_GROUND_TRUTH",
  "OTHER_GOVERNANCE_JUSTIFIED_ARRANGEMENT",
] as const;
export type CandidateRepresentationOption = (typeof CANDIDATE_REPRESENTATION_OPTIONS)[number];

export const QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "REJECTED_GOVERNANCE_UNCERTAIN",
  "REJECTED_AMBIGUOUS_SUPERSESSION",
  "REJECTED_EDITORIAL_ONLY",
] as const;
export type QualificationOutcome = (typeof QUALIFICATION_OUTCOMES)[number];

export interface VersionPairCandidateRecord {
  readonly candidateId: string;
  readonly publicationFamily: string;
  readonly publisher: string;
  readonly jurisdiction: string;
  readonly domain: Domain;
  readonly documentType: DocumentType;
  readonly language: string;

  readonly oldVersionIdentifier: string;
  readonly oldVersionUrl: string;
  readonly oldVersionPublicationDate: string;
  readonly oldVersionStillOfficiallyHosted: boolean;
  readonly oldVersionByteStability: ByteStabilityCheck | null;

  readonly currentVersionIdentifier: string;
  readonly currentVersionUrl: string;
  readonly currentVersionPublicationDate: string;
  readonly currentVersionAlreadyInCorpus: string | null;

  readonly supersessionEvidenceUrl: string;
  readonly supersessionEvidenceQuote: string;
  readonly supersessionChronologyIndependentlyVerifiable: boolean;

  readonly selfDisclosureStatus: SelfDisclosureStatus;
  readonly selfDisclosureEvidence: string;

  readonly licenceBasis: string;
  readonly licenceStatus: LicenceStatus;
  readonly licenceEvidence: string;

  readonly versionDifferences: readonly VersionDifferenceRecord[];

  readonly recommendedRepresentation: CandidateRepresentationOption | null;
  readonly representationRationale: string;

  readonly qualificationOutcome: QualificationOutcome;
  readonly rejectionReason: string | null;
  readonly rankingNotes: string;
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

export const CANDIDATE_REGISTER: readonly VersionPairCandidateRecord[] = deepFreeze<VersionPairCandidateRecord[]>([
  // --- Candidate 1: NIST SP 800-53 Rev 4 -> Rev 5 (PRIMARY RECOMMENDATION) ---
  {
    candidateId: "DRA-CAND-027-01",
    publicationFamily: "NIST Special Publication 800-53 — Security and Privacy Controls",
    publisher: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "POLICY",
    language: "en-US",

    oldVersionIdentifier: "NIST SP 800-53 Revision 4 (published April 2013; includes updates as of 01-22-2015)",
    oldVersionUrl: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
    oldVersionPublicationDate: "2013-04 (text updates as of 2015-01-22)",
    oldVersionStillOfficiallyHosted: true,
    oldVersionByteStability: {
      url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
      httpStatus: 200,
      byteLength: 5212362,
      sha256Hashes: [
        "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2",
        "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2",
      ],
      stable: true,
      verifiedOn: "2026-08-11",
    },

    currentVersionIdentifier: "NIST SP 800-53 Revision 5 (published September 2020)",
    currentVersionUrl: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
    currentVersionPublicationDate: "2020-09",
    currentVersionAlreadyInCorpus:
      "DRA-DOC-0030 (admitted DRA-ACQ-026 Phase 2, freeze DRA-FRZ-000024; fully evaluated under DRA-ENG-019 Part " +
      "G with decision REVIEW / 1 EVIDENCE_INADEQUATE issue). Reusing this existing admission as the CURRENT " +
      "reference avoids a redundant second full-scale acquisition of the same 492-page/25,603-statement " +
      "document and directly enables representation option B (see below).",

    supersessionEvidenceUrl: "https://csrc.nist.gov/pubs/sp/800/53/r4/upd4/final",
    supersessionEvidenceQuote:
      "NIST's own CSRC publication catalog record for SP 800-53 Rev. 4 states: 'To be withdrawn on September 23, " +
      "2021' and 'Superseded By: SP 800-53 Rev. 5 (09/23/2020)'. The companion Rev. 5 catalog record states " +
      "'Supersedes: SP 800-53 Rev. 4 (01/22/2015)'. This is an explicit, publisher-authored, bidirectional " +
      "supersession record independent of any DRA-side inference.",
    supersessionChronologyIndependentlyVerifiable: true,

    selfDisclosureStatus: "SUPERSESSION_ONLY_DISCOVERABLE_EXTERNALLY",
    selfDisclosureEvidence:
      "Direct fetch and inspection of the Rev. 4 PDF's extracted text (front matter, table of contents, and " +
      "body) contains no withdrawal, supersession, or 'obsolete' notice of any kind — it reads as a complete, " +
      "internally coherent, self-consistent, currently-authoritative-looking standard when viewed in isolation. " +
      "The withdrawal/supersession fact exists ONLY on NIST's separate CSRC catalog page, not inside the " +
      "document artefact itself. This is the strongest possible instance of the task's preferred experimental " +
      "design: 'the old PDF itself remains perfectly plausible when viewed in isolation' and 'current DRA " +
      "evaluation has no intrinsic way to know that the old document has been superseded' — because DRA's " +
      "pipeline only ever ingests the PDF's extracted text, never the publisher's separate catalog metadata.",

    licenceBasis: "U.S. Government work, public domain (17 U.S.C. §105) — direct NIST authorship, matching the " +
      "precedent already accepted for DRA-DOC-0012, DRA-DOC-0024, and DRA-DOC-0030 (the current version of this " +
      "very family).",
    licenceStatus: "VERIFIED",
    licenceEvidence:
      "Both versions are authored directly by NIST, a U.S. federal agency; both PDFs carry the same 'U.S. " +
      "Department of Commerce' front-matter attribution; no contradictory copyright notice found on either.",

    versionDifferences: [
      {
        recordId: "DRA-CAND-027-01-DIFF-01",
        oldProposition:
          "Rev. 4's control catalog was written primarily for FEDERAL information systems and organizations " +
          "('Security and Privacy Controls for FEDERAL Information Systems and Organizations' — title-page " +
          "wording), structured around a security/privacy-controls-are-separate-catalogs model with control " +
          "statements phrased around a specific implementer's actions.",
        newProposition:
          "Rev. 5 retitles the publication 'Security and Privacy Controls for Information Systems and " +
          "Organizations' (federal-specific scoping removed from the title), unifies security and privacy " +
          "controls into one consolidated catalog, and restates controls in outcome-based form decoupled from a " +
          "specific implementer (per NIST's own published 'Summary of Significant Changes' document).",
        changeType: "SCOPE_CHANGED",
        materiality: "MATERIAL",
        evidence:
          "NIST's official 'Summary of Significant Changes Between NIST SP 800-53 Rev. 4 and [Rev. 5]' " +
          "(csrc.nist.gov) states the changes include 'making the controls more outcome-based' and broadening " +
          "applicability beyond the federal-only frame, with a worked example contrasting the Rev. 4 vs Rev. 5 " +
          "text of control AC-3.",
      },
      {
        recordId: "DRA-CAND-027-01-DIFF-02",
        oldProposition:
          "Rev. 4 does not include a dedicated Supply Chain Risk Management (SR) control family.",
        newProposition:
          "Rev. 5 adds a new Supply Chain Risk Management (SR) control family as one of its significant " +
          "structural additions.",
        changeType: "REQUIREMENT_ADDED",
        materiality: "MATERIAL",
        evidence:
          "Independently corroborated by NIST's own transition materials and multiple published third-party " +
          "change summaries (e.g. 'Significant Changes from NIST SP 800-53 rev4 to rev5', which describes 'new " +
          "control families, privacy transparency and supply chain risk management' as a central theme of the " +
          "revision) — used here only as corroboration, not as the primary authority (NIST's own summary " +
          "document is primary).",
      },
      {
        recordId: "DRA-CAND-027-01-DIFF-03",
        oldProposition: "Both Rev. 4 and Rev. 5 carry the same publisher name ('National Institute of Standards " +
          "and Technology') and the same DOI-prefix citation convention ('This publication is available free of " +
          "charge from: https://dx.doi.org/10.6028/...').",
        newProposition: "Unchanged between versions — publisher identity and citation-format convention are " +
          "identical in both documents.",
        changeType: "NO_SUBSTANTIVE_CHANGE",
        materiality: "UNCHANGED_CONTROL",
        evidence: "Direct comparison of both PDFs' front-matter text confirms identical publisher-attribution " +
          "phrasing conventions across the version boundary — used as an internal control demonstrating that " +
          "not every difference between the two documents is being manufactured as 'material'.",
      },
    ],

    recommendedRepresentation: "CURRENT_DOCUMENT_WITH_OLD_VERSION_COMPARISON_GROUND_TRUTH",
    representationRationale:
      "DRA-DOC-0030 (Rev. 5, current) is already admitted and already fully evaluated (DRA-ENG-019). Admitting " +
      "DRA-DOC-0031 as the SUPERSEDED Rev. 4 document, explicitly paired with the existing DRA-DOC-0030 as its " +
      "current-version comparison ground truth, is representation option B from the task specification. This " +
      "avoids redundantly re-admitting the already-corpus-present current version, and directly sets up the " +
      "intended Phase 2 experiment (evaluate DRA-DOC-0031 in isolation and confirm the evaluator's output " +
      "contains no signal that a Rev. 5 supersedes it) without inventing a second, unrelated 'current' document.",

    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionReason: null,
    rankingNotes:
      "Ranks first on every stated criterion: (1) explicit, publisher-authored, bidirectional supersession " +
      "record (csrc.nist.gov catalog); (2) multiple independently corroborated material changes (scope, new " +
      "control family, outcome-based restructuring) plus one internal unchanged-control comparison; (3) old " +
      "version (Rev. 4) remains live and officially retrievable from nvlpubs.nist.gov; (4) maximal diagnostic " +
      "clarity — the old PDF is self-consistent and contains zero internal obsolescence markers, isolating " +
      "temporal currentness from every other representation problem; (5) governance certainty is very high " +
      "(same PUBLIC_DOMAIN basis already accepted three times in this corpus); (6) byte/retrieval " +
      "reproducibility verified live (see companion test); (7) cleanly isolates temporal authority from " +
      "ordinary authenticity per the task's own 'strongest experiment' description; (8) tractable — reuses the " +
      "already-frozen and already-evaluated DRA-DOC-0030 as the current-version reference, avoiding a second " +
      "492-page/25,603-statement acquisition.",
  },

  // --- Candidate 2: NIST Cybersecurity Framework 1.1 -> 2.0 (ALTERNATE) ---
  {
    candidateId: "DRA-CAND-027-02",
    publicationFamily: "NIST Cybersecurity Framework",
    publisher: "National Institute of Standards and Technology (NIST)",
    jurisdiction: "United States",
    domain: "TECHNICAL",
    documentType: "POLICY",
    language: "en-US",

    oldVersionIdentifier: "Framework for Improving Critical Infrastructure Cybersecurity, Version 1.1 (NIST.CSWP.04162018, published 2018-04-16)",
    oldVersionUrl: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.04162018.pdf",
    oldVersionPublicationDate: "2018-04-16",
    oldVersionStillOfficiallyHosted: true,
    oldVersionByteStability: {
      url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.04162018.pdf",
      httpStatus: 200,
      byteLength: 1062822,
      sha256Hashes: [
        "0f3ca796610ab024cbc3484cbd6799e19b4d9159d3634972a2a76af83f15fb92",
        "0f3ca796610ab024cbc3484cbd6799e19b4d9159d3634972a2a76af83f15fb92",
      ],
      stable: true,
      verifiedOn: "2026-08-11",
    },

    currentVersionIdentifier: "The NIST Cybersecurity Framework (CSF) 2.0 (NIST CSWP 29, published 2024-02-26)",
    currentVersionUrl: "https://doi.org/10.6028/NIST.CSWP.29",
    currentVersionPublicationDate: "2024-02-26",
    currentVersionAlreadyInCorpus: null,

    supersessionEvidenceUrl: "https://www.nist.gov/cyberframework/framework-development-archive",
    supersessionEvidenceQuote:
      "NIST retitled the publication from 'Framework for Improving Critical Infrastructure Cybersecurity' " +
      "(v1.0/v1.1) to 'The NIST Cybersecurity Framework (CSF) 2.0' and moved the v1.1 material to a dedicated " +
      "'Framework Development Archive' page, with NIST's own CSF 2.0 FAQ publishing an explicit 'Transitioning " +
      "from CSF v1.1 to CSF v2.0' section describing the successor relationship and detailed Core-level mapping " +
      "of changes between the versions.",
    supersessionChronologyIndependentlyVerifiable: true,

    selfDisclosureStatus: "SUPERSESSION_ONLY_DISCOVERABLE_EXTERNALLY",
    selfDisclosureEvidence:
      "The Version 1.1 PDF's own text contains a 'Note to Readers on the Update' explaining its relationship to " +
      "the earlier Version 1.0, but (as expected, since it predates CSF 2.0 by six years) contains no forward-" +
      "looking notice that it would itself later be superseded. Like the primary candidate, the fact that v1.1 " +
      "is no longer current is discoverable only via NIST's separate website/FAQ, not from the v1.1 PDF text " +
      "itself.",

    licenceBasis: "U.S. Government work, public domain (17 U.S.C. §105) — same basis as DRA-DOC-0012/0024/0030.",
    licenceStatus: "VERIFIED",
    licenceEvidence: "Both versions are NIST-authored publications on nist.gov / nvlpubs.nist.gov domains; no " +
      "contradictory notice found on either.",

    versionDifferences: [
      {
        recordId: "DRA-CAND-027-02-DIFF-01",
        oldProposition: "Version 1.1's Core organises outcomes under five Functions: Identify, Protect, Detect, " +
          "Respond, Recover — with governance-related content (e.g. ID.GV, ID.RM, ID.SC) distributed inside the " +
          "Identify function.",
        newProposition: "CSF 2.0 adds a sixth Function, Govern (GV), and moves the governance-related content " +
          "out of Identify into the new Govern function (e.g. ID.GV/ID.RM/ID.SC become GV.OC/GV.RM/GV.SC).",
        changeType: "STRUCTURAL_REORGANISATION",
        materiality: "MATERIAL",
        evidence: "NIST's own published CSF FAQ, 'Transitioning from CSF v1.1 to CSF v2.0', lists this exact " +
          "mapping as the first item under 'major changes to the five (5) existing CSF Functions'.",
      },
      {
        recordId: "DRA-CAND-027-02-DIFF-02",
        oldProposition: "The publication's scope, per its title, was framed around 'Improving Critical " +
          "Infrastructure Cybersecurity'.",
        newProposition: "CSF 2.0 drops the critical-infrastructure-specific title and scope, retitling the " +
          "publication as a general-purpose framework 'for industry, government agencies, and other " +
          "organizations' of any size or sector.",
        changeType: "SCOPE_CHANGED",
        materiality: "MATERIAL",
        evidence: "NIST's own CSF 2.0 publication abstract states the framework 'can be used by any organization " +
          "— regardless of its size, sector, or maturity' — a direct contrast with v1.1's critical-" +
          "infrastructure-scoped title and abstract.",
      },
    ],

    recommendedRepresentation: "SUPERSEDED_DOCUMENT_ITSELF",
    representationRationale:
      "Unlike the primary candidate, no CSF document is yet in the corpus, so this alternate would require " +
      "admitting BOTH the old (v1.1) and current (2.0) versions to construct the comparison, rather than reusing " +
      "an existing admission. This is a genuine, valid design (representation option A/'other governance-" +
      "justified arrangement' combined with a fresh current-version admission), but is structurally heavier " +
      "than the primary candidate's reuse of DRA-DOC-0030.",

    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionReason: null,
    rankingNotes:
      "Fully qualified on every evidentiary criterion (explicit supersession, material structural change, old " +
      "version still hosted, governance certainty identical to the primary candidate's NIST public-domain " +
      "basis). Ranked as the alternate rather than primary because (a) it requires two fresh acquisitions " +
      "instead of reusing an already-admitted current version, and (b) it shares the same publisher (NIST) as " +
      "the primary candidate and as three prior corpus documents, whereas the primary candidate at least reuses " +
      "rather than adds to that publisher concentration. If the primary candidate were later found unsuitable " +
      "at Phase 2, this is a fully independent, equally well-evidenced fallback.",
  },

  // --- Candidate 3: BoE/PRA enforcement Statement of Policy (REJECTED) ---
  {
    candidateId: "DRA-CAND-027-03",
    publicationFamily: "The Bank of England's/PRA's approach to enforcement: statement(s) of policy and procedure",
    publisher: "Bank of England / Prudential Regulation Authority (PRA)",
    jurisdiction: "United Kingdom",
    domain: "FINANCE",
    documentType: "POLICY",
    language: "en-GB",

    oldVersionIdentifier: "The PRA's approach to enforcement: statutory statements of policy and procedure, September 2021 (updating October 2019)",
    oldVersionUrl: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/statement-of-policy/2019/the-pras-approach-to-enforcement-statutory-statements-of-policy-and-procedure-sop-sep-21.pdf",
    oldVersionPublicationDate: "2021-09 (updating 2019-10)",
    oldVersionStillOfficiallyHosted: true,
    oldVersionByteStability: null,

    currentVersionIdentifier: "The Bank of England's approach to enforcement: statements of policy and procedure, published 30 January 2024, updated 12 November 2024",
    currentVersionUrl: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/publication/boe-approach-to-enforcement-sop-procedure.pdf",
    currentVersionPublicationDate: "2024-01-30 (current text effective 2024-11-12)",
    currentVersionAlreadyInCorpus: null,

    supersessionEvidenceUrl: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/statement-of-policy/2019/the-pras-approach-to-enforcement-statutory-statements-of-policy-and-procedure-sop-sep-21.pdf",
    supersessionEvidenceQuote:
      "The old PDF's own pages are stamped, in-line, 'This SoP has been superseded. Please see: [current URL]' " +
      "and 'SUPERSEDED', repeated at multiple points including the cover and inside the front matter.",
    supersessionChronologyIndependentlyVerifiable: true,

    selfDisclosureStatus: "OLD_VERSION_SELF_DISCLOSES_SUPERSESSION",
    selfDisclosureEvidence:
      "Unlike both NIST candidates, this document's own extracted text visibly and repeatedly contains the word " +
      "'SUPERSEDED' and a direct URL to its replacement — meaning the fact of supersession IS present in the " +
      "text DRA would actually ingest. This makes it a weaker instance of the task's stated 'strongest " +
      "experiment' preference (old document 'remains perfectly plausible when viewed in isolation'), since the " +
      "supersession signal is trivially present in-band, not purely external metadata. It would still be a " +
      "valid test of whether DRA's pipeline does anything with an in-text self-declared 'SUPERSEDED' marker (it " +
      "currently would not, per the capability audit), but is diagnostically less clean than isolating pure " +
      "external/metadata-only supersession.",

    licenceBasis: "Bank of England / PRA Crown-adjacent copyright — NOT the same public-domain basis as the NIST " +
      "candidates.",
    licenceStatus: "NOT_VERIFIED",
    licenceEvidence:
      "The Bank of England's general 'Legal' terms page (bankofengland.co.uk/legal) states its Resources 'are " +
      "provided for general reference purposes only' with a broad accuracy/fitness disclaimer, but does not " +
      "state an OGL-equivalent or public-domain reuse licence for PDF publications of this kind (unlike prior " +
      "corpus precedents such as ICO's OGL v3 or CMA's explicit OGL notices). The Bank of England's dedicated " +
      "copyright page (bankofengland.co.uk/legal/copyright) returned HTTP 404 at verification time (2026-08-11) " +
      "— i.e. the specific copyright terms this acquisition would need to cite could not be located and " +
      "confirmed live. Per DRA governance convention (do not use a licence basis that has not been read and " +
      "confirmed), this is NOT_VERIFIED, not merely provisional.",

    versionDifferences: [
      {
        recordId: "DRA-CAND-027-03-DIFF-01",
        oldProposition: "The 2021 SoP's title and scope statement address the 'Prudential Regulation Authority's " +
          "approach to enforcement' specifically.",
        newProposition: "The 2024 SoP retitles the publication as 'The Bank of England's approach to " +
          "enforcement' and explicitly broadens scope to cover the Bank's wider statutory powers across multiple " +
          "regimes (PRA prudential supervision, FMI supervision, resolution, the Scottish/NI banknote regime, " +
          "wholesale cash oversight, and Critical Third Parties oversight — several of which post-date the 2021 " +
          "text and derive from the Financial Services and Markets Act 2023).",
        changeType: "SCOPE_CHANGED",
        materiality: "MATERIAL",
        evidence: "Direct comparison of the two publications' own scope statements (2024 current-version landing " +
          "page vs. 2021 PDF title/introduction).",
      },
    ],

    recommendedRepresentation: null,
    representationRationale:
      "Not pursued — see rejection reason.",

    qualificationOutcome: "REJECTED_GOVERNANCE_UNCERTAIN",
    rejectionReason:
      "Rejected under the task's own negative-result-discipline criterion 'governance cannot support corpus " +
      "use'. Supersession ground truth is in fact the strongest of all three candidates (explicit in-document " +
      "'SUPERSEDED' stamp plus successor URL), and the material-change evidence is solid, but the licence basis " +
      "could not be verified live (the Bank of England's dedicated copyright terms page 404'd, and its general " +
      "legal-terms page states only a reference-purposes disclaimer, not an affirmative reuse permission). Per " +
      "the explicit instruction not to lower standards to obtain a candidate, and given two fully-licence-" +
      "verified NIST alternatives were already found, this candidate is not carried forward. It is retained here " +
      "as evidence of real discovery breadth across a second publisher/domain (UK financial regulation, FINANCE " +
      "domain) and as a genuine negative result, not discarded silently.",
    rankingNotes:
      "Would rank very highly on supersession-ground-truth clarity and diagnostic value (in-text self-disclosure " +
      "is itself an interesting contrast case) if licence governance could be confirmed. Documented for possible " +
      "future reconsideration if Bank of England reuse terms are later confirmed through a different page or " +
      "direct enquiry.",
  },
]);

// ---------------------------------------------------------------------------
// Part 4 — Ranking, selection, and Phase 1 outcome
// ---------------------------------------------------------------------------

export function getCandidateById(candidateId: string): VersionPairCandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === candidateId);
}

export const RANKING_CRITERIA_ORDER: readonly string[] = Object.freeze([
  "explicit_supersession_ground_truth",
  "material_semantic_change_present",
  "old_version_still_officially_retrievable",
  "diagnostic_clarity_of_temporal_isolation",
  "governance_certainty",
  "byte_and_retrieval_reproducibility",
  "ability_to_isolate_temporal_currentness_from_other_representation_problems",
  "experimental_tractability",
]);

export const PRIMARY_CANDIDATE_ID = "DRA-CAND-027-01" as const;
export const ALTERNATE_CANDIDATE_ID = "DRA-CAND-027-02" as const;
export const REJECTED_CANDIDATE_IDS: readonly string[] = Object.freeze(["DRA-CAND-027-03"]);
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  ...REJECTED_CANDIDATE_IDS,
]);

export function primaryCandidate(): VersionPairCandidateRecord {
  const found = getCandidateById(PRIMARY_CANDIDATE_ID);
  if (!found) throw new Error("Primary candidate record missing from CANDIDATE_REGISTER.");
  return found;
}

export function alternateCandidate(): VersionPairCandidateRecord {
  const found = getCandidateById(ALTERNATE_CANDIDATE_ID);
  if (!found) throw new Error("Alternate candidate record missing from CANDIDATE_REGISTER.");
  return found;
}

export const PHASE_1_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_CANDIDATE_SELECTED",
  "NO_CANDIDATE_MEETS_REQUIREMENTS",
] as const;
export type Phase1QualificationOutcome = (typeof PHASE_1_QUALIFICATION_OUTCOMES)[number];

export const PHASE_1_QUALIFICATION_OUTCOME: Phase1QualificationOutcome = "QUALIFIED_CANDIDATE_SELECTED";

export const PHASE_1_QUALIFICATION_RECORD = Object.freeze({
  outcome: PHASE_1_QUALIFICATION_OUTCOME,
  primaryCandidateId: PRIMARY_CANDIDATE_ID,
  alternateCandidateId: ALTERNATE_CANDIDATE_ID,
  rejectedCandidateIds: REJECTED_CANDIDATE_IDS,
  capabilityGapConfirmed: true,
  capabilityGapSummary:
    "No field, enum value, or pipeline stage anywhere in DRA (SourceDocument, CorpusDocumentInput, " +
    "AcquisitionFreezeRecord, ProofReceipt, or the six-value authority-classification enum) represents or " +
    "detects document supersession/currentness. SourceDocument.publishedAt exists structurally but is not " +
    "consulted by authority resolution today. No AUTHORITY_EXPIRED-equivalent issue class exists. This is a " +
    "confirmed, genuine capability gap, not a naming or discoverability problem.",
  representationDecision: "CURRENT_DOCUMENT_WITH_OLD_VERSION_COMPARISON_GROUND_TRUTH" as CandidateRepresentationOption,
  representationDecisionSummary:
    "DRA-DOC-0031 is recommended to be NIST SP 800-53 Revision 4 (superseded), evaluated against the already-" +
    "admitted DRA-DOC-0030 (Revision 5, current) as its comparison ground truth — representation option B from " +
    "the task specification. No second document is auto-admitted; DRA-DOC-0030 is referenced read-only.",
});

export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0031" as const;

export const PROPOSED_PHASE_2_SCOPE: readonly string[] = Object.freeze([
  "Acquire, verify, and freeze NIST SP 800-53 Revision 4 as DRA-DOC-0031 under existing acquisition governance " +
    "(no schema changes required for the acquisition itself).",
  "Run DRA-DOC-0031 through the unmodified evaluator (0.1.2) and record its decision/issues exactly as produced, " +
    "with no attempt to force or suppress any particular outcome.",
  "Compare DRA-DOC-0031's evaluation output against DRA-DOC-0030's existing evaluation output (already on file " +
    "from DRA-ENG-019) to confirm — or refute — the prediction that the pipeline produces no signal " +
    "distinguishing the superseded document from the current one.",
  "If the prediction is confirmed, document the demonstrated capability gap as a candidate future engineering " +
    "ticket (e.g. an AUTHORITY_EXPIRED-equivalent issue class fed by a new supersession-relationship field) — " +
    "proposed, not built, in Phase 2.",
  "Do not add any version/supersession metadata field, modify authority resolution, or change the freeze/issue " +
    "schema as part of Phase 2 unless a separate engineering ticket is explicitly opened for that purpose.",
]);

export const PHASE_1_PROHIBITED_ACTIONS: readonly string[] = Object.freeze([
  "freezing_or_admitting_any_candidate_document",
  "beginning_phase_2_acquisition_work",
  "adding_version_or_supersession_metadata_fields",
  "modifying_authority_resolution_logic",
  "activating_or_creating_an_authority_expired_issue_class",
  "modifying_evaluator_semantics_or_issue_taxonomy",
  "changing_the_freeze_schema",
]);
