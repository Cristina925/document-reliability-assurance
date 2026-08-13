/**
 * DRA-001 — Stage 3: Authority Resolution — Attribution Pattern Detection
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * Deterministic rule-based detection of attribution patterns in statement text
 * and its immediate structural context.
 *
 * No AI, NLP, probabilistic reasoning, network access, or external services.
 * Rules are explicit, testable, and reproducible for identical inputs.
 *
 * Resolution rules (applied in priority order):
 *
 *   AR-SELF-REF          — Self-referential subject (document/author/we/I)
 *   AR-PRONOUN-AMBIG     — Unresolvable pronoun subject (he/she/they/it)
 *   AR-SPEAKER-LABEL     — "Speaker Name: statement text" at line start
 *   AR-UNATTR-QUOTE      — Entire statement is a direct quotation without attribution
 *   AR-ACCORDING-NAMED   — "According to [Named Source]..." or post-statement variant
 *   AR-ACCORDING-UNNAMED — "According to [vague term]..."
 *   AR-SUBJECT-NAMED     — "[Named Source] states/said/reports..."
 *   AR-SUBJECT-UNNAMED   — "[Vague subject] say/report..."
 *   AR-POST-NAMED        — "..., according to [Named Source]." (authority after claim)
 *   AR-POST-UNNAMED      — "..., according to [vague]."
 *   AR-ATTR-INLINE       — "... — Source" or "(Source: X)" at statement end
 *   AR-INHERITED         — Inherited from immediately preceding line (no boundary)
 *   AR-DOCUMENT-AUTHOR   — Default (no attribution detected)
 *
 * Limitations (Version 1):
 *   - Non-English attribution markers are not detected.
 *   - Coreference resolution is not performed.
 *   - Attribution inheritance across headings or sections is not implemented.
 *   - Multi-sentence inherited attribution is not tracked.
 *   - Named-entity disambiguation is not performed.
 */

import type { AuthorityClassification, AuthorityType } from "./authority-classification.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Vague authority terms — present in "according to X" or "[X] says" patterns
 * but do not identify a specific named source.
 */
const VAGUE_AUTHORITY_RE =
  /^(?:the\s+)?(?:experts?|officials?|researchers?|scientists?|analysts?|sources?|reports?|studies?|investigators?|observers?|insiders?|critics?|watchdogs?|witnesses?|historians?|economists?|commentators?|pundits?|academics?|specialists?|practitioners?|industry|market\s+(?:analysts?|observers?|sources?)|government\s+(?:officials?|sources?)|unnamed\s+(?:sources?|officials?)|anonymous\s+(?:sources?|officials?))(?:\s|$)/i;

/**
 * Attribution verbs — indicate the subject is the author of the quoted claim.
 */
const ATTRIBUTION_VERBS =
  /(?:state[sd]?|said|say|report(?:s|ed)?|claim(?:s|ed)?|note[sd]?|found|find|show(?:s|n)?|indicate[sd]?|suggest(?:s|ed)?|confirm(?:s|ed)?|reveal(?:s|ed)?|announce[sd]?|declare[sd]?|conclude[sd]?|add(?:s|ed)?|warn(?:s|ed)?|explain(?:s|ed)?|argue[sd]?|assert(?:s|ed)?|maintain(?:s|ed)?|believe[sd]?|estimate[sd]?|predict(?:s|ed)?|project(?:s|ed)?|forecast(?:s|ed)?|calculate[sd]?|determine[sd]?|observe[sd]?|identif(?:y|ied))/;

/**
 * Self-referential subject terms — indicate the document author is the source.
 */
const SELF_REF_RE =
  /^(?:we|i|this\s+(?:document|report|paper|analysis|review|study|assessment|evaluation|guide|manual)|the\s+(?:document|present\s+(?:report|document|analysis|paper))|the\s+author(?:s)?)(?:\s+|$)/i;

/**
 * Common non-name labels that can appear before a colon and are NOT speaker labels.
 * (e.g. "Note:", "Warning:", "Example:", "Summary:")
 */
const NON_SPEAKER_LABELS = new Set([
  "note", "notes", "warning", "caution", "tip", "important",
  "example", "summary", "overview", "background", "conclusion",
  "result", "results", "outcome", "outcomes", "action", "see",
  "definition", "definitions", "section", "subsection", "figure",
  "table", "appendix", "reference", "references", "source", "sources",
  "date", "time", "location", "status", "type", "category", "subject",
  "from", "to", "re", "cc", "bcc",
]);

// ---------------------------------------------------------------------------
// Detection result
// ---------------------------------------------------------------------------

export interface DetectionResult {
  /** Resolved authority classification. */
  readonly classification: AuthorityClassification;
  /**
   * The authority text, copied verbatim from the statement text (or preceding line).
   * Undefined for DOCUMENT_AUTHOR and NO_IDENTIFIABLE_SOURCE.
   */
  readonly authorityText?: string;
  /**
   * Offset of authority text start, relative to statement text (or preceding line).
   * Undefined when no authority text was located.
   */
  readonly authorityLocalStart?: number;
  /**
   * Offset of authority text end, relative to statement text (or preceding line).
   * Undefined when no authority text was located.
   */
  readonly authorityLocalEnd?: number;
  /** Whether the authority was found in the preceding line (not the statement text). */
  readonly isFromPreceding: boolean;
  /** Resolution rule identifier. */
  readonly resolutionRule: string;
  /** Context reference for STRUCTURALLY_INHERITED_SOURCE. */
  readonly inheritedContextRef?: string;
  /** Ambiguity description for AMBIGUOUS_SOURCE. */
  readonly ambiguityDetails?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strips trailing punctuation from an authority text candidate.
 * Keeps internal punctuation (e.g. "Dr." "U.S." "Ltd.") intact.
 */
function trimAuthorityText(raw: string): string {
  return raw.trim().replace(/[\.,;:!?]+$/, "").trim();
}

/**
 * Determines AuthorityType from authority text.
 */
export function detectAuthorityType(authorityText: string): AuthorityType {
  const lower = authorityText.toLowerCase().trim();

  if (VAGUE_AUTHORITY_RE.test(lower)) return "UNNAMED";

  // Regulation / standard
  if (
    /\b(act|law|regulation|standard|code|directive|policy|rule|requirement|protocol|guideline|framework|statute|bylaw|ordinance|treaty|convention|iso|gdpr|hipaa|pci|sox|nist|fips)\b/i.test(
      authorityText,
    )
  )
    return "REGULATION";

  // Publication
  if (
    /\b(report|journal|article|book|publication|paper|review|survey|guide|manual|handbook|whitepaper|bulletin|newsletter|gazette|digest|proceedings|monograph)\b/i.test(
      authorityText,
    )
  )
    return "PUBLICATION";

  // Study / research
  if (
    /\b(study|research|investigation|trial|experiment|analysis|assessment|evaluation|audit|meta-analysis|finding|findings)\b/i.test(
      authorityText,
    )
  )
    return "STUDY";

  // Dataset
  if (
    /\b(dataset|database|data|statistics|figures|census|poll|registry|index)\b/i.test(
      authorityText,
    )
  )
    return "DATASET";

  // Organisation
  if (
    /\b(inc\.?|llc\.?|ltd\.?|corp\.?|co\.?\b|company|organisation|organization|agency|institute|university|department|ministry|government|administration|bureau|council|court|tribunal|panel|committee|commission|association|foundation|authority|board|office|center|centre|group|division|unit|body|ngo|npo|who|cdc|fda|sec|nato|eu\b|un\b|cia|fbi|nsa|gchq)\b/i.test(
      authorityText,
    )
  )
    return "ORGANISATION";

  // Person (honorific)
  if (
    /^(?:dr\.?\s+|mr\.?\s+|mrs\.?\s+|ms\.?\s+|prof\.?\s+|rev\.?\s+|sir\s+|dame\s+|sen\.?\s+|rep\.?\s+|pres\.?\s+)/i.test(
      authorityText,
    )
  )
    return "PERSON";

  // Person (two-word proper name: First Last)
  if (/^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/.test(authorityText)) return "PERSON";

  // Default for named sources
  return "ORGANISATION";
}

// ---------------------------------------------------------------------------
// Pattern matchers (return null if rule does not apply)
// ---------------------------------------------------------------------------

function tryPronounAmbiguous(text: string): DetectionResult | null {
  if (/^(?:he|she|they|it)\s+/i.test(text)) {
    return {
      classification: "AMBIGUOUS_SOURCE",
      isFromPreceding: false,
      resolutionRule: "AR-PRONOUN-AMBIG",
      ambiguityDetails:
        "Pronoun subject (he/she/they/it) whose referent cannot be deterministically resolved from statement text alone.",
    };
  }
  return null;
}

function trySelfRef(text: string): DetectionResult | null {
  if (SELF_REF_RE.test(text)) {
    return {
      classification: "DOCUMENT_AUTHOR",
      isFromPreceding: false,
      resolutionRule: "AR-SELF-REF",
    };
  }
  return null;
}

function trySpeakerLabel(text: string): DetectionResult | null {
  // Match "Name:" at the start of the statement (speaker label convention)
  // Require at least one space in the name (two-word) OR an honorific
  const match = /^((?:Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Rev\.|Sen\.|Rep\.)\s*[A-Za-z][A-Za-z\-']{0,30}|[A-Z][A-Za-z\-'.]{0,30}(?:\s+[A-Z][A-Za-z\-'.]{0,25}){1,3}|[A-Z]{2,10})\s*:\s+/.exec(
    text,
  );
  if (!match) return null;

  const label = match[1]!.trim();
  const labelLower = label.toLowerCase();

  // Exclude known non-speaker labels
  if (NON_SPEAKER_LABELS.has(labelLower)) return null;

  // Exclude single all-lowercase words (field labels, not names)
  if (/^[a-z]+$/.test(label)) return null;

  return {
    classification: "EXPLICIT_NAMED_SOURCE",
    authorityText: label,
    authorityLocalStart: 0,
    authorityLocalEnd: label.length,
    isFromPreceding: false,
    resolutionRule: "AR-SPEAKER-LABEL",
  };
}

function tryUnattributedQuote(text: string): DetectionResult | null {
  // Entire statement enclosed in quote marks (no attribution present)
  if (/^["'""][^"'""]{5,}["'""]\.?\s*$/.test(text)) {
    return {
      classification: "AMBIGUOUS_SOURCE",
      isFromPreceding: false,
      resolutionRule: "AR-UNATTR-QUOTE",
      ambiguityDetails: "Statement is a direct quotation with no resolvable attribution.",
    };
  }
  return null;
}

/** Tries to match "according to [source]" anywhere in the text. */
function tryAccordingTo(text: string): DetectionResult | null {
  // Pattern captures prefix + authority text
  const match =
    /(according\s+to\s+(?:the\s+)?)([A-Za-z][^,;:\n]*?)(?=\s*[,;:]|\s+(?:which|who|said|state|report|claim|the\s+|a\s+|an\s+)\b|$)/i.exec(
      text,
    );
  if (!match) return null;

  const prefix = match[1]!;
  let rawAuthority = match[2]!;
  rawAuthority = trimAuthorityText(rawAuthority);

  if (!rawAuthority) return null;

  const matchStart = match.index ?? 0;
  const authorityLocalStart = matchStart + prefix.length;
  const authorityLocalEnd = authorityLocalStart + rawAuthority.length;

  // Check if vague
  if (VAGUE_AUTHORITY_RE.test(rawAuthority)) {
    return {
      classification: "EXPLICIT_UNNAMED_SOURCE",
      authorityText: rawAuthority,
      authorityLocalStart,
      authorityLocalEnd,
      isFromPreceding: false,
      resolutionRule: "AR-ACCORDING-UNNAMED",
    };
  }

  return {
    classification: "EXPLICIT_NAMED_SOURCE",
    authorityText: rawAuthority,
    authorityLocalStart,
    authorityLocalEnd,
    isFromPreceding: false,
    resolutionRule: "AR-ACCORDING-NAMED",
  };
}

/** Tries to match "[Source] [attribution verb] that ..." at statement start. */
function trySubjectAttribution(text: string): DetectionResult | null {
  const verbPattern = ATTRIBUTION_VERBS.source;
  const re = new RegExp(
    `^((?:The\\s+)?(?:Dr\\.|Mr\\.|Mrs\\.|Ms\\.|Prof\\.|Rev\\.|Sen\\.|Rep\\.)?\\s*[A-Z][A-Za-z\\s\\.\\-\\&\\/']{1,70}?)\\s+(${verbPattern})(?:\\s+that)?\\s+`,
    "i",
  );
  const match = re.exec(text);
  if (!match) return null;

  let rawSubject = match[1]!;
  rawSubject = trimAuthorityText(rawSubject);

  if (!rawSubject || rawSubject.length < 2) return null;

  // Exclude self-referential subjects
  if (SELF_REF_RE.test(rawSubject + " ")) return null;

  // Exclude pronoun subjects (handled by higher priority rule)
  if (/^(?:he|she|they|it)$/i.test(rawSubject)) return null;

  const authorityLocalStart = 0;
  const authorityLocalEnd = rawSubject.length;

  // Check if vague
  if (VAGUE_AUTHORITY_RE.test(rawSubject)) {
    return {
      classification: "EXPLICIT_UNNAMED_SOURCE",
      authorityText: rawSubject,
      authorityLocalStart,
      authorityLocalEnd,
      isFromPreceding: false,
      resolutionRule: "AR-SUBJECT-UNNAMED",
    };
  }

  return {
    classification: "EXPLICIT_NAMED_SOURCE",
    authorityText: rawSubject,
    authorityLocalStart,
    authorityLocalEnd,
    isFromPreceding: false,
    resolutionRule: "AR-SUBJECT-NAMED",
  };
}

/** Tries to match "..., according to [Source]." at end of statement. */
function tryPostStatementAttribution(text: string): DetectionResult | null {
  const match =
    /,\s+(according\s+to\s+(?:the\s+)?)([A-Za-z][^,;:\n\.]*?)(?:\.|,|;|\s*$)/i.exec(text);
  if (!match) return null;

  const prefix = match[1]!;
  let rawAuthority = match[2]!;
  rawAuthority = trimAuthorityText(rawAuthority);

  if (!rawAuthority) return null;

  const matchStart = match.index ?? 0;
  // The comma takes 1 char, then whitespace
  const commaAndWhitespace = match[0].slice(0, match[0].indexOf(match[1]!));
  const authorityLocalStart = matchStart + commaAndWhitespace.length + prefix.length;
  const authorityLocalEnd = authorityLocalStart + rawAuthority.length;

  if (VAGUE_AUTHORITY_RE.test(rawAuthority)) {
    return {
      classification: "EXPLICIT_UNNAMED_SOURCE",
      authorityText: rawAuthority,
      authorityLocalStart,
      authorityLocalEnd,
      isFromPreceding: false,
      resolutionRule: "AR-POST-UNNAMED",
    };
  }

  return {
    classification: "EXPLICIT_NAMED_SOURCE",
    authorityText: rawAuthority,
    authorityLocalStart,
    authorityLocalEnd,
    isFromPreceding: false,
    resolutionRule: "AR-POST-NAMED",
  };
}

/** Tries to match inline attribution: "... — Source" or "(Source: X)" */
function tryInlineAttribution(text: string): DetectionResult | null {
  // Dash attribution: "statement text — Source Name" at end
  const dashMatch = /\s+[—–-]\s+([A-Z][A-Za-z\s\.\-\']{1,60})\s*$/.exec(text);
  if (dashMatch) {
    const rawAuthority = trimAuthorityText(dashMatch[1]!);
    const authStart = dashMatch.index! + dashMatch[0].length - dashMatch[1]!.length;
    // Adjust for trimming — find actual start after dash prefix
    const matchPrefix = dashMatch[0].slice(0, dashMatch[0].indexOf(dashMatch[1]!));
    const authorityLocalStart = dashMatch.index! + matchPrefix.length;
    const authorityLocalEnd = authorityLocalStart + rawAuthority.length;

    return {
      classification: "EXPLICIT_NAMED_SOURCE",
      authorityText: rawAuthority,
      authorityLocalStart,
      authorityLocalEnd,
      isFromPreceding: false,
      resolutionRule: "AR-ATTR-INLINE-DASH",
    };
    void authStart;
  }

  // Parenthetical: "(Source: X)" or "(via X)" or "(per X)"
  const parenMatch =
    /\(\s*(?:source|via|from|per|attributed to|according to|cited in)\s*:\s*([^)]+)\)/i.exec(
      text,
    );
  if (parenMatch) {
    const rawAuthority = trimAuthorityText(parenMatch[1]!);
    const authStart = parenMatch.index! + parenMatch[0].indexOf(parenMatch[1]!);
    return {
      classification: "EXPLICIT_NAMED_SOURCE",
      authorityText: rawAuthority,
      authorityLocalStart: authStart,
      authorityLocalEnd: authStart + rawAuthority.length,
      isFromPreceding: false,
      resolutionRule: "AR-ATTR-INLINE-PAREN",
    };
  }

  return null;
}

/**
 * Tries to find attribution in the immediately preceding line.
 * Only applied when there is no paragraph boundary between lines.
 * Returns a result with isFromPreceding=true if a pattern matches.
 */
function tryPrecedingLineAttribution(
  precedingLine: string,
  precedingLineStart: number,
): DetectionResult | null {
  if (!precedingLine) return null;

  // Apply "according to" pattern to preceding line
  const accordingResult = tryAccordingTo(precedingLine);
  if (accordingResult) {
    const rule =
      accordingResult.classification === "EXPLICIT_NAMED_SOURCE"
        ? "AR-INHERITED-NAMED"
        : "AR-INHERITED-UNNAMED";
    return {
      ...accordingResult,
      isFromPreceding: true,
      resolutionRule: rule,
      classification: "STRUCTURALLY_INHERITED_SOURCE",
      inheritedContextRef: `preceding-line:${precedingLineStart}`,
    };
  }

  // Apply subject attribution to preceding line
  const subjectResult = trySubjectAttribution(precedingLine);
  if (subjectResult) {
    const rule =
      subjectResult.classification === "EXPLICIT_NAMED_SOURCE"
        ? "AR-INHERITED-NAMED"
        : "AR-INHERITED-UNNAMED";
    return {
      ...subjectResult,
      isFromPreceding: true,
      resolutionRule: rule,
      classification: "STRUCTURALLY_INHERITED_SOURCE",
      inheritedContextRef: `preceding-line:${precedingLineStart}`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public detection function
// ---------------------------------------------------------------------------

/**
 * Detects attribution for a single statement using priority-ordered rules.
 *
 * @param statementText    - Exact statement text (from Stage 2).
 * @param precedingLine    - Text of the immediately preceding line (empty string if none).
 * @param precedingLineStart - Absolute offset of the preceding line in the document.
 * @param hasBoundary      - True if a paragraph boundary separates the preceding line
 *                           from the current statement (disables inheritance).
 * @returns DetectionResult with the highest-priority matching rule.
 */
export function detectAttribution(
  statementText: string,
  precedingLine: string,
  precedingLineStart: number,
  hasBoundary: boolean,
): DetectionResult {
  // Priority 1: Self-referential subject → DOCUMENT_AUTHOR
  const selfRef = trySelfRef(statementText);
  if (selfRef) return selfRef;

  // Priority 2: Pronoun subject → AMBIGUOUS_SOURCE
  const pronoun = tryPronounAmbiguous(statementText);
  if (pronoun) return pronoun;

  // Priority 3: Speaker label "Name: content"
  const speaker = trySpeakerLabel(statementText);
  if (speaker) return speaker;

  // Priority 4: Unattributed direct quote → AMBIGUOUS_SOURCE
  const unquote = tryUnattributedQuote(statementText);
  if (unquote) return unquote;

  // Priority 5: "According to [source]..." (anywhere in statement)
  const accordingTo = tryAccordingTo(statementText);
  if (accordingTo) return accordingTo;

  // Priority 6: "[Subject] [verb] that ..." (subject attribution)
  const subjectAttr = trySubjectAttribution(statementText);
  if (subjectAttr) return subjectAttr;

  // Priority 7: "..., according to [source]." (post-statement)
  const postAttr = tryPostStatementAttribution(statementText);
  if (postAttr) return postAttr;

  // Priority 8: "... — Source" or "(Source: X)"
  const inlineAttr = tryInlineAttribution(statementText);
  if (inlineAttr) return inlineAttr;

  // Priority 9: Inherited from immediately preceding line (no boundary)
  if (!hasBoundary) {
    const inherited = tryPrecedingLineAttribution(precedingLine, precedingLineStart);
    if (inherited) return inherited;
  }

  // Priority 10: Default → DOCUMENT_AUTHOR
  return {
    classification: "DOCUMENT_AUTHOR",
    isFromPreceding: false,
    resolutionRule: "AR-DOCUMENT-AUTHOR",
  };
}
