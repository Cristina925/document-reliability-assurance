/**
 * DRA-ENG-018 — Trust Property Model (Part A)
 *
 * DRA-DOC-0029 (DRA-ACQ-025 Phase 2) demonstrated a gap: the pipeline can
 * report a document's canonical text as NATIVE_TEXT / VERIFIED (DRA-ENG-017)
 * while a materially information-bearing graphical region (a 17-node/19-edge
 * causal diagram) is completely absent from that text, with no existing
 * mechanism flagging the loss. Investigation traced this to an implicit
 * conflation: "the extracted words are faithful to what characters exist in
 * the canonical text" was being read as "the document's meaning has been
 * captured," which are different claims.
 *
 * This module names the properties DRA implicitly relies on so that gap
 * cannot recur silently. It does not implement anything; it is a shared
 * vocabulary that graphical-semantic-risk.ts (DRA-ENG-018's new mechanism)
 * and existing modules (DRA-ENG-009/015/016/017) can each be understood
 * against.
 *
 * IMPORTANT: naming a property here is not a claim that DRA fully verifies
 * it. Several properties below are only PARTIALLY addressed, or addressed
 * for a narrow sub-case, by existing mechanisms. That is stated explicitly
 * per property rather than implied by inclusion in this list.
 */

/**
 * The six trust properties a benchmark document's evidentiary chain can be
 * evaluated against, from "is this really the document it claims to be" to
 * "has its meaning been correctly assessed."
 */
export type TrustProperty =
  | "SOURCE_AUTHENTICITY"
  | "REPRESENTATION_PROVENANCE"
  | "LEXICAL_FIDELITY"
  | "STRUCTURAL_FIDELITY"
  | "GRAPHICAL_SEMANTIC_COMPLETENESS"
  | "SEMANTIC_EVALUATION";

export interface TrustPropertyDescription {
  readonly property: TrustProperty;
  readonly definition: string;
  /** What in DRA currently addresses this property, and how completely. */
  readonly currentMechanism: string;
  /** Explicit statement of what is NOT covered, so this is not read as "solved." */
  readonly knownGap: string;
}

/**
 * The trust-property model. Order reflects the pipeline's evidentiary
 * dependency chain: each property assumes the ones before it hold, but
 * holding an earlier property never implies a later one holds.
 */
export const TRUST_PROPERTY_MODEL: readonly TrustPropertyDescription[] = [
  {
    property: "SOURCE_AUTHENTICITY",
    definition:
      "The acquired bytes genuinely originate from the claimed official source and have not been substituted or tampered with.",
    currentMechanism:
      "DRA-ENG-009 governed acquisition pipeline: fetcher provenance (finalUrl, redirects, httpStatus), sourceDigest computed and pinned at freeze time, verifySourceDigest() on every re-evaluation, official-source/licence assessment gates before freeze is permitted.",
    knownGap:
      "Trusts the fetch transport and the human OFFICIAL_SOURCE_VERIFIED assessment; does not independently authenticate the publisher (e.g. no cryptographic publisher signature verification).",
  },
  {
    property: "REPRESENTATION_PROVENANCE",
    definition:
      "The mechanism by which the canonical text was produced from the source bytes is known (born-digital extraction vs. OCR vs. unknown), because that mechanism has different, non-interchangeable failure modes.",
    currentMechanism:
      "DRA-ENG-017 assessRepresentationProvenance(): classifies NATIVE_TEXT / OCR_TEXT_LAYER / IMAGE_ONLY / MIXED_REPRESENTATION / UNKNOWN from font-embedding and extraction signals.",
    knownGap:
      "Structural/format-based only — does not read the extracted text for meaning, and explicitly excludes image presence as a provenance signal by design (image presence is a different property; see GRAPHICAL_SEMANTIC_COMPLETENESS).",
  },
  {
    property: "LEXICAL_FIDELITY",
    definition:
      "The characters/words present in the canonical text accurately represent the characters/words present in the corresponding region of the source document (no garbling, no OCR substitution, no line-wrap corruption).",
    currentMechanism:
      "DRA-ENG-017 deriveRepresentationFidelity() (VERIFIED / PARTIALLY_VERIFIED / UNVERIFIED / DEGRADED / NOT_ASSESSABLE) via garbled-token density; DRA-ENG-016 citation-linkage integrity for bracket/reference-entry text specifically.",
    knownGap:
      "Only assesses fidelity of text that WAS extracted. Says nothing about content that exists in the source but has no corresponding extracted text at all — a diagram entirely outside the text layer can be LEXICAL_FIDELITY=VERIFIED (correctly, for the text that exists) while carrying unassessed meaning. This is precisely the DRA-DOC-0029 gap and is why LEXICAL_FIDELITY must never be read as a proxy for GRAPHICAL_SEMANTIC_COMPLETENESS.",
  },
  {
    property: "STRUCTURAL_FIDELITY",
    definition:
      "Document-level structure that is itself part of the meaning — reading order, section/heading hierarchy, table row/column association, footnote-to-anchor linkage, cell shading semantics — survives extraction.",
    currentMechanism:
      "Partially addressed by several independent, narrow mechanisms: DRA-ENG-015 (cell-shading/fill-colour loss), DRA-ENG-016 (citation bracket/reference-entry linkage), footnote-integration logic in Stage 4 evidence linkage.",
    knownGap:
      "No single, general structural-fidelity mechanism exists; coverage is a set of point solutions for specific carriers (shading, citations) discovered empirically one robustness experiment at a time. Vector line-art topology (e.g. flowchart arrow routing, confirmed lost in DRA-DOC-0028) has no detector at all as of this ticket.",
  },
  {
    property: "GRAPHICAL_SEMANTIC_COMPLETENESS",
    definition:
      "Meaning carried by graphical regions of the source (figures, diagrams, charts, maps, annotated images) that is NOT restated in the canonical text is either absent, or its absence is flagged rather than silently assumed away.",
    currentMechanism:
      "DRA-ENG-018 (this ticket) graphical-semantic-risk.ts: a general, format/property-based RISK detector — flags when materially-sized graphical content exists without commensurate local narration. Does not attempt figure understanding.",
    knownGap:
      "Detects RISK, not completeness or recoverability. Scoped to raster image regions detectable via embedded-image signals; vector-drawn diagrams (e.g. DRA-DOC-0028's flowcharts, confirmed pure black-and-white vector line art) are outside this detector's signal domain and are a documented, known blind spot, not a silent gap.",
  },
  {
    property: "SEMANTIC_EVALUATION",
    definition:
      "Given a faithfully-represented document, the DRA evaluator's claim extraction, authority resolution, evidence linkage, and materiality assessment correctly judge the document's assurance decision.",
    currentMechanism:
      "The full 7-stage DRA evaluator (evaluateDocument()) and its issue-detection rule set, exercised and calibrated across the benchmark corpus.",
    knownGap:
      "Assumes its input (the canonical text) already satisfies LEXICAL_FIDELITY, STRUCTURAL_FIDELITY, and GRAPHICAL_SEMANTIC_COMPLETENESS. It has no visibility into graphical content at all — by design, this property sits downstream of, and does not itself address, the first five.",
  },
];

/**
 * Looks up a single property's description. Throws if the property is not
 * one of the six named properties (a fixed, closed set — not extensible ad
 * hoc, so any new property must be added here deliberately).
 */
export function describeTrustProperty(property: TrustProperty): TrustPropertyDescription {
  const found = TRUST_PROPERTY_MODEL.find((p) => p.property === property);
  if (!found) {
    throw new Error(`Unknown trust property: ${property}`);
  }
  return found;
}
