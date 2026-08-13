/**
 * DRA-001 — Stage 3: Authority Resolution — Classification Model
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Closed Version 1 authority classification model.
 *
 * Classifications represent who or what is presented as the source of a statement.
 * They describe attribution structure only — not source credibility, source independence,
 * or whether a statement is adequately supported.
 *
 * Version 1 classifications are frozen. Do not add probabilistic or
 * confidence-based classifications.
 */

// ---------------------------------------------------------------------------
// Authority classification
// ---------------------------------------------------------------------------

/**
 * Closed Version 1 authority classification values.
 *
 * Applied to every extracted material statement. Exactly one classification
 * per statement. Never undefined — ambiguity and absence are explicit values.
 */
export const AUTHORITY_CLASSIFICATIONS = [
  /**
   * The document itself directly asserts the statement without assigning it
   * to another source. Includes first-person author assertions, document-level
   * recommendations, forecasts, conclusions, and unsupported declarations.
   */
  "DOCUMENT_AUTHOR",

  /**
   * A person, organisation, publication, system, dataset, regulation, study,
   * or other identifiable source is explicitly and unambiguously named as
   * the authority for this statement.
   */
  "EXPLICIT_NAMED_SOURCE",

  /**
   * A source is explicitly invoked but not individually identifiable.
   * Examples: "experts say", "according to reports", "officials confirmed".
   * The attribution is present but vague.
   */
  "EXPLICIT_UNNAMED_SOURCE",

  /**
   * Attribution is inherited from a clearly bounded structural element:
   * a quotation block, speaker section, interview answer, attributed
   * subsection, or table row with explicit attribution.
   * The structure provides an unambiguous boundary for the inherited attribution.
   */
  "STRUCTURALLY_INHERITED_SOURCE",

  /**
   * More than one plausible authority exists, or attribution cannot be
   * deterministically attached to a single authority.
   * Includes unclear pronouns, multiple competing sources, and quotes
   * without a resolvable speaker.
   */
  "AMBIGUOUS_SOURCE",

  /**
   * The statement makes or reports a claim but no identifiable authority
   * is supplied and no plausible authority can be inferred from the structure.
   * Used when the text hints at an external source but provides no basis
   * for deterministic resolution.
   */
  "NO_IDENTIFIABLE_SOURCE",
] as const;

export type AuthorityClassification = (typeof AUTHORITY_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// Authority entity type
// ---------------------------------------------------------------------------

/**
 * The type of the authority entity when deterministically identifiable.
 * Used to enrich authority records for downstream stages.
 * Not a classification of source credibility.
 */
export const AUTHORITY_TYPES = [
  "PERSON",         // Individual person (Dr. Smith, Jane Doe)
  "ORGANISATION",   // Company, agency, government body, NGO, committee
  "PUBLICATION",    // Journal, report, article, book, whitepaper
  "REGULATION",     // Law, standard, code, directive, policy, protocol
  "DATASET",        // Data set, database, survey, census, registry
  "STUDY",          // Study, research, investigation, trial, experiment
  "UNNAMED",        // Source exists but is individually unidentifiable (vague)
] as const;

export type AuthorityType = (typeof AUTHORITY_TYPES)[number];

// ---------------------------------------------------------------------------
// Classification guards
// ---------------------------------------------------------------------------

/** Returns true if the value is a valid AuthorityClassification. */
export function isAuthorityClassification(value: unknown): value is AuthorityClassification {
  return AUTHORITY_CLASSIFICATIONS.includes(value as AuthorityClassification);
}

/** Returns true if the value is a valid AuthorityType. */
export function isAuthorityType(value: unknown): value is AuthorityType {
  return AUTHORITY_TYPES.includes(value as AuthorityType);
}
