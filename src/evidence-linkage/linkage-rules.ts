/**
 * DRA-001 — Stage 4: Evidence Linkage — Evidence Linkage Rules
 *
 * Milestone: DRA-ENG-006 — Evidence Linkage
 *
 * Deterministic rule-based detection of documentary evidence in statement text.
 *
 * No AI, NLP, probabilistic reasoning, network access, or external services.
 * Rules are explicit, testable, and reproducible for identical inputs.
 *
 * Resolution rules (applied in priority order):
 *
 *   EL-URL              — HTTP/HTTPS URL in the statement text
 *   EL-NUMBERED-CITE    — [1], [1,2], [1-3] numbered citation
 *   EL-BRACKETED-CITE   — (Author Year) or (Author, Year) citation
 *   EL-FIGURE-REF       — Figure N, Fig. N, Chart N
 *   EL-TABLE-REF        — Table N, Table A
 *   EL-APPENDIX-REF     — Appendix A, Annex B, Schedule C
 *   EL-FOOTNOTE-REF     — ¹ superscript, [^1] markdown footnote
 *   EL-STANDARD-REF     — ISO, NIST, RFC, IEEE, GDPR, HIPAA etc.
 *   EL-LEGISLATION-REF  — Act, Regulation, Directive, Statute, Treaty
 *   EL-SECTION-REF      — Section N, Chapter N, Clause N
 *   EL-QUOTED-TEXT      — Quoted text with or without attribution
 *   EL-NO-EVIDENCE      — Default (no evidence detected)
 *
 * Ambiguity:
 *   When two or more distinct rule patterns match simultaneously AND they
 *   identify different evidence items with no deterministic precedence,
 *   EL-AMBIGUOUS is returned.
 *
 * Limitations (Version 1):
 *   - Non-English evidence markers are not detected.
 *   - Evidence appearing only in other sections (not the statement text) is
 *     not linked (evidence must appear in or be referenced by the statement).
 *   - Multi-step indirect cross-references are not resolved.
 *   - Bibliography section parsing is limited to heuristic title detection.
 */

import type { EvidenceClassification, EvidenceType } from "./evidence-classification.js";

// ---------------------------------------------------------------------------
// Rule detection result
// ---------------------------------------------------------------------------

export interface EvidenceMatch {
  /** Offset relative to the statement text (for in-statement evidence). */
  readonly localStart: number;
  readonly localEnd: number;
  readonly evidenceText: string;
  readonly evidenceType: EvidenceType;
  readonly linkageRule: string;
  readonly classification: EvidenceClassification;
  readonly ambiguityDetails?: string;
}

export interface LinkageDetectionResult {
  readonly classification: EvidenceClassification;
  readonly linkageRule: string;
  readonly matches: ReadonlyArray<EvidenceMatch>;
  readonly ambiguityDetails?: string;
}

// ---------------------------------------------------------------------------
// Pattern constants
// ---------------------------------------------------------------------------

/** Numbered citation: [1], [2], [1,2], [1,2,3], [1-3] */
const NUMBERED_CITATION_RE = /\[(\d+(?:[,\-–]\s*\d+)*)\]/g;

/**
 * Bracketed author-year citation: (Smith 2023), (Smith, 2023),
 * (Smith et al. 2023), (Smith et al., 2023), (WHO 2021)
 */
const BRACKETED_CITATION_RE =
  /\(([A-Z][A-Za-z\-']{1,30}(?:\s+et\s+al\.?)?(?:,?\s+\d{4}[a-z]?(?:[,\-–]\d{4}[a-z]?)*))\)/g;

/** Figure reference: Figure 1, Fig. 1, Fig 1, Figure A, FIGURE 1 */
const FIGURE_REF_RE = /\b(?:Fig(?:ure)?\.?|Chart|Diagram|Exhibit)\s+([A-Z]?\d+[A-Za-z]?|[A-Z])\b/gi;

/** Table reference: Table 1, Table A, TABLE I */
const TABLE_REF_RE = /\bTable\s+([A-Z]?\d+[A-Za-z]?|[A-Z]|[IVX]+)\b/gi;

/** Appendix / Annex / Schedule / Exhibit reference */
const APPENDIX_REF_RE =
  /\b(?:Appendix|Annex|Schedule|Exhibit|Attachment)\s+([A-Z0-9]+(?:\.\d+)?)\b/gi;

/** Footnote markers: superscript digits¹²³, or markdown-style [^1] */
const FOOTNOTE_RE = /(?:\[\^(\d+)\]|([¹²³⁴⁵⁶⁷⁸⁹⁰]+|\^\d+))/g;

/**
 * Standards / regulations by name prefix:
 * ISO, NIST, RFC, IEEE, IEC, ASTM, GDPR, HIPAA, PCI, SOX, FIPS, ANSI, BS
 *
 * NOTE: trailing \b is required to prevent matching abbreviations that appear
 * as substrings of longer words (e.g. "ANSI" in "organisation").
 *
 * DRA-ENG-014: the "EN" alternative was removed from this case-insensitive
 * group and moved to EN_STANDARD_RE below. It is matched separately,
 * case-sensitively. See that constant's doc comment for the rationale.
 * This is otherwise byte-for-byte the frozen Version 1 (0.1.1) alternation,
 * unchanged in behaviour for every remaining prefix.
 */
const STANDARD_RE =
  /\b(?:ISO|NIST|RFC|IEEE|IEC|ASTM|GDPR|HIPAA|PCI[-\s]DSS|SOX|FIPS|ANSI|OWASP|BS)\b\s*(?:[-/\s]?\d[\d\-.:]*\w*)?/gi;

/**
 * European Norm ("EN") standard-reference alternative — DRA-ENG-014.
 *
 * Split out of STANDARD_RE and matched WITHOUT the case-insensitive flag.
 *
 * Background (DRA-CHK-004, DRA-ENG-012, DRA-ENG-013): under the frozen
 * Version 1 case-insensitive STANDARD_RE, the bare "EN" alternative matched
 * ordinary Spanish/French "en" (and sentence-initial "En"), producing false
 * DIRECT_DOCUMENT_EVIDENCE classifications (EN-alternative confusion matrix:
 * TP=9, FP=19). DRA-ENG-013 established that every authoritative EN-family
 * citation convention (EN 301 549, EN 71-1, EN ISO 12100, BS EN 62368-1,
 * etc.) is written with "EN" in full capitals, while Spanish and French only
 * capitalize the ordinary preposition's first letter in prose (never the
 * whole word). Requiring an exact-case uppercase "EN" token — with no other
 * change to the match shape — eliminates the entire demonstrated collision
 * (TP=9, FP=0, FN=0 in DRA-ENG-013's evidence set) without narrowing or
 * broadening what counts as a genuine EN reference beyond Version 1's
 * existing (optional-numeric-suffix) shape.
 *
 * Deliberately NOT changed here (out of scope for this narrow correction,
 * per DRA-ENG-014): the numeric identifier is NOT made mandatory, compound
 * prefixes (EN ISO, EN IEC) and national-adoption prefixes (BS EN, DIN EN)
 * are NOT specially recognised, and the two ENG-013 bounded limitations
 * (EN 2025 vs. a genuine standard number; truncation before a trailing
 * non-numeric token, e.g. "EN 6 months" -> "EN 6") are NOT addressed — all
 * are pre-existing Version 1 shape characteristics this fix intentionally
 * leaves untouched.
 */
const EN_STANDARD_RE = /\bEN\b\s*(?:[-/\s]?\d[\d\-.:]*\w*)?/g;

/** Legislation: Acts, Directives, Regulations, Statutes, Treaties, Codes, Ordinances */
const LEGISLATION_RE =
  /\b(?:(?:[A-Z][A-Za-z]+\s+){1,5}(?:Act|Directive|Regulation|Statute|Treaty|Code|Ordinance|Convention|Framework|Law)\b|(?:Act|Directive|Regulation)\s+(?:No\.?\s*)?\d+[\w/\-]*)/g;

/**
 * Section / Chapter / Clause / Article / Paragraph cross-reference.
 *
 * NOTE: § (U+00A7) is a non-word character so \b cannot precede it.
 * The word-based alternatives use \b; § is handled with a separate alternative
 * that requires a space or start of line before it.
 */
const SECTION_REF_RE =
  /(?:\b(?:Section|Sec\.|Chapter|Ch\.|Clause|Cl\.|Article|Art\.|Paragraph|Para\.?)|(?:^|[\s(])§)\s*(\d+(?:\.\d+)*(?:[A-Za-z])?|[A-Z])\b/gi;

/** URL (http or https) */
const URL_RE = /https?:\/\/[^\s\]\)>"']+/gi;

/** Direct or indirect quotation: "..." or "..." */
const QUOTED_TEXT_RE = /[""\u201c]([^""\u201d]{10,}?)[""\u201d]/g;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectMatches(
  text: string,
  re: RegExp,
  evidenceType: EvidenceType,
  classification: EvidenceClassification,
  linkageRule: string,
): EvidenceMatch[] {
  const matches: EvidenceMatch[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0]!;
    matches.push({
      localStart: m.index,
      localEnd: m.index + raw.length,
      evidenceText: raw,
      evidenceType,
      linkageRule,
      classification,
    });
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Individual rule functions
// ---------------------------------------------------------------------------

function tryUrl(text: string): EvidenceMatch[] {
  return collectMatches(text, URL_RE, "URL", "EXTERNAL_REFERENCE_PRESENT", "EL-URL");
}

function tryNumberedCitation(text: string): EvidenceMatch[] {
  return collectMatches(
    text,
    NUMBERED_CITATION_RE,
    "NUMBERED_CITATION",
    "CITED_REFERENCE",
    "EL-NUMBERED-CITE",
  );
}

function tryBracketedCitation(text: string): EvidenceMatch[] {
  return collectMatches(
    text,
    BRACKETED_CITATION_RE,
    "BRACKETED_CITATION",
    "CITED_REFERENCE",
    "EL-BRACKETED-CITE",
  );
}

function tryFigureRef(text: string): EvidenceMatch[] {
  return collectMatches(text, FIGURE_REF_RE, "FIGURE", "FIGURE_EVIDENCE", "EL-FIGURE-REF");
}

function tryTableRef(text: string): EvidenceMatch[] {
  return collectMatches(text, TABLE_REF_RE, "TABLE", "TABLE_EVIDENCE", "EL-TABLE-REF");
}

function tryAppendixRef(text: string): EvidenceMatch[] {
  return collectMatches(text, APPENDIX_REF_RE, "APPENDIX", "APPENDIX_EVIDENCE", "EL-APPENDIX-REF");
}

function tryFootnoteRef(text: string): EvidenceMatch[] {
  return collectMatches(text, FOOTNOTE_RE, "FOOTNOTE", "FOOTNOTE_EVIDENCE", "EL-FOOTNOTE-REF");
}

function tryStandardRef(text: string): EvidenceMatch[] {
  // DRA-ENG-014: EN is matched via a separate, case-sensitive pass
  // (EN_STANDARD_RE) so it is unaffected by STANDARD_RE's /i flag.
  return [
    ...collectMatches(
      text,
      STANDARD_RE,
      "STANDARD",
      "DIRECT_DOCUMENT_EVIDENCE",
      "EL-STANDARD-REF",
    ),
    ...collectMatches(
      text,
      EN_STANDARD_RE,
      "STANDARD",
      "DIRECT_DOCUMENT_EVIDENCE",
      "EL-STANDARD-REF",
    ),
  ];
}

function tryLegislationRef(text: string): EvidenceMatch[] {
  // Only match if at least two words before the legislation keyword
  const raw = collectMatches(
    text,
    LEGISLATION_RE,
    "LEGISLATION",
    "DIRECT_DOCUMENT_EVIDENCE",
    "EL-LEGISLATION-REF",
  );
  // Filter: must be at least 4 chars and not just the keyword alone
  return raw.filter((m) => m.evidenceText.trim().length >= 4);
}

function trySectionRef(text: string): EvidenceMatch[] {
  return collectMatches(
    text,
    SECTION_REF_RE,
    "SECTION",
    "DOCUMENT_CROSS_REFERENCE",
    "EL-SECTION-REF",
  );
}

function tryQuotedText(text: string): EvidenceMatch[] {
  return collectMatches(text, QUOTED_TEXT_RE, "QUOTED_TEXT", "QUOTED_SOURCE", "EL-QUOTED-TEXT");
}

// ---------------------------------------------------------------------------
// Deduplication: remove matches that are entirely contained within another
// ---------------------------------------------------------------------------

function deduplicateMatches(matches: EvidenceMatch[]): EvidenceMatch[] {
  if (matches.length <= 1) return matches;
  return matches.filter((m, i) => {
    for (let j = 0; j < matches.length; j++) {
      if (i === j) continue;
      const other = matches[j]!;
      if (other.localStart <= m.localStart && other.localEnd >= m.localEnd && other !== m) {
        // m is contained within other; keep the outer (longer) match
        if (other.localEnd - other.localStart > m.localEnd - m.localStart) return false;
      }
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Ambiguity detection
// ---------------------------------------------------------------------------

/**
 * Returns true when two matches identify genuinely distinct evidence items
 * (different classification domains), warranting AMBIGUOUS_EVIDENCE_LINK.
 */
function isAmbiguous(matches: EvidenceMatch[]): boolean {
  if (matches.length < 2) return false;
  const classSet = new Set(matches.map((m) => m.classification));
  // Ambiguous when two different top-level classification domains conflict
  return classSet.size >= 2;
}

// ---------------------------------------------------------------------------
// Main detection function
// ---------------------------------------------------------------------------

/**
 * Detects documentary evidence for a single statement using priority-ordered rules.
 *
 * @param statementText - Exact statement text from Stage 2.
 * @returns LinkageDetectionResult with all matched evidence items.
 */
export function detectEvidence(statementText: string): LinkageDetectionResult {
  const allMatches: EvidenceMatch[] = [
    ...tryUrl(statementText),
    ...tryNumberedCitation(statementText),
    ...tryBracketedCitation(statementText),
    ...tryFigureRef(statementText),
    ...tryTableRef(statementText),
    ...tryAppendixRef(statementText),
    ...tryFootnoteRef(statementText),
    ...tryStandardRef(statementText),
    ...tryLegislationRef(statementText),
    ...trySectionRef(statementText),
    ...tryQuotedText(statementText),
  ];

  const deduped = deduplicateMatches(allMatches);

  if (deduped.length === 0) {
    return {
      classification: "NO_DOCUMENT_EVIDENCE",
      linkageRule: "EL-NO-EVIDENCE",
      matches: [],
    };
  }

  if (isAmbiguous(deduped)) {
    const ruleList = [...new Set(deduped.map((m) => m.linkageRule))].join(", ");
    return {
      classification: "AMBIGUOUS_EVIDENCE_LINK",
      linkageRule: "EL-AMBIGUOUS",
      matches: deduped,
      ambiguityDetails: `Multiple evidence types detected (${ruleList}); cannot deterministically resolve to a single classification.`,
    };
  }

  // Single domain — use highest-priority match's classification
  // Priority by rule order: URL > numbered cite > bracketed cite > figure > table >
  //   appendix > footnote > standard > legislation > section > quoted text
  const RULE_PRIORITY: Record<string, number> = {
    "EL-URL": 0,
    "EL-NUMBERED-CITE": 1,
    "EL-BRACKETED-CITE": 2,
    "EL-FIGURE-REF": 3,
    "EL-TABLE-REF": 4,
    "EL-APPENDIX-REF": 5,
    "EL-FOOTNOTE-REF": 6,
    "EL-STANDARD-REF": 7,
    "EL-LEGISLATION-REF": 8,
    "EL-SECTION-REF": 9,
    "EL-QUOTED-TEXT": 10,
  };

  const sorted = [...deduped].sort(
    (a, b) => (RULE_PRIORITY[a.linkageRule] ?? 99) - (RULE_PRIORITY[b.linkageRule] ?? 99),
  );
  const primary = sorted[0]!;

  // If all matches share the same classification, use it directly
  const classSet = new Set(deduped.map((m) => m.classification));
  const classification = classSet.size === 1 ? primary.classification : "AMBIGUOUS_EVIDENCE_LINK";

  return {
    classification,
    linkageRule: primary.linkageRule,
    matches: sorted,
    ambiguityDetails:
      classification === "AMBIGUOUS_EVIDENCE_LINK"
        ? `Multiple evidence types detected; cannot deterministically resolve.`
        : undefined,
  };
}
