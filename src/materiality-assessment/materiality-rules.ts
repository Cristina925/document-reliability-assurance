/**
 * DRA-001 — Stage 5: Materiality Assessment — Materiality Rule Engine
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Deterministic rule-based materiality classification for statement text.
 *
 * No AI, NLP, probabilistic reasoning, network access, or external services.
 * Rules are explicit, testable, and reproducible for identical inputs.
 *
 * Rule evaluation order (highest priority first):
 *
 *   CRITICAL rules (checked first):
 *     MA-CRITICAL-SAFETY       — Safety instructions, risk of injury/death
 *     MA-CRITICAL-LEGAL        — Legally required, prohibited by law
 *     MA-CRITICAL-CONTRACT     — Contractual commitments, warranties
 *     MA-CRITICAL-PAYMENT      — Payment authorisations, invoices, penalties
 *     MA-CRITICAL-SECURITY     — Security controls, authentication mandates
 *     MA-CRITICAL-REGULATORY   — Regulatory obligations (GDPR, HIPAA, PCI, etc.)
 *
 *   HIGH rules:
 *     MA-HIGH-APPROVAL         — Approvals, sign-off granted
 *     MA-HIGH-REJECTION        — Rejections, denials
 *     MA-HIGH-DECISION         — Formal decisions, resolutions
 *     MA-HIGH-RECOMMENDATION   — Executive or formal recommendations
 *     MA-HIGH-DEPLOYMENT       — Deployment instructions, go-live directives
 *     MA-HIGH-DEADLINE         — Deadlines, due dates, time-critical obligations
 *     MA-HIGH-OBLIGATION       — Deontic obligation (must / shall) without CRITICAL trigger
 *
 *   MODERATE rules:
 *     MA-MODERATE-GUIDANCE     — Guidance, best practices, should/advisable
 *     MA-MODERATE-ASSUMPTION   — Design or process assumptions
 *     MA-MODERATE-RATIONALE    — Supporting rationale, causal explanation
 *     MA-MODERATE-WARNING      — Warnings, cautions, important notices
 *     MA-MODERATE-QUANTIFIED   — Quantified limits/thresholds (non-payment)
 *
 *   LOW rules:
 *     MA-LOW-EXAMPLE           — Examples, illustrations
 *     MA-LOW-DESCRIPTIVE       — Descriptive / declarative statements
 *     MA-LOW-BACKGROUND        — Historical / general background
 *     MA-LOW-EXPLANATORY       — Explanatory commentary
 *
 *   INFORMATIONAL rules:
 *     MA-INFO-LABEL            — Known metadata label patterns
 *     MA-INFO-SHORT-NOUN       — Very short noun phrases (≤ 4 words, no verb)
 *     MA-INFO-NAVIGATION       — Navigation references (see also, refer to)
 *
 *   UNDETERMINED (default):
 *     MA-UNDETERMINED-DEFAULT  — No deterministic classification possible
 *
 * Version 1 limitations:
 *   - Rules operate on statement text only; broader document context is
 *     not consulted.
 *   - Non-English obligation markers are not detected.
 *   - Sarcasm, irony, and rhetorical negation are not handled.
 *   - Nested or conditional obligations are classified at face value.
 */

import type { MaterialityClassification } from "./materiality-classification.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface MaterialityDetectionResult {
  /** Assigned materiality classification. */
  readonly classification: MaterialityClassification;
  /** Identifier of the rule that produced the classification. */
  readonly ruleId: string;
  /**
   * Lexical fragments from the statement text that triggered the rule.
   * May be empty for the UNDETERMINED default rule.
   */
  readonly triggeringCharacteristics: ReadonlyArray<string>;
  /** Human-readable explanation of why this classification was assigned. */
  readonly rationale: string;
}

// ---------------------------------------------------------------------------
// CRITICAL patterns
// ---------------------------------------------------------------------------

/** Safety: risk of injury, death, or emergency action. */
const CRITICAL_SAFETY_RE =
  /\b(?:safety[- ]critical|life[- ]threatening|risk\s+of\s+(?:injury|death|fatality|harm)|emergency\s+(?:stop|procedure|exit|evacuation|shutdown)|must\s+not\s+operate|immediately\s+(?:stop|cease|evacuate)|do\s+not\s+(?:operate|use|touch|remove)\s+(?:unless|without|if)|hazardous\s+(?:material|substance|condition)|serious\s+(?:injury|harm|damage)|fatal(?:ity|ly)?)\b/i;

/** Legal obligation: required by law, prohibited, criminal liability. */
const CRITICAL_LEGAL_RE =
  /\b(?:legally\s+required|required\s+by\s+law|prohibited\s+by\s+law|criminal\s+(?:liability|offence?|offense?|penalty|prosecution)|statutory\s+(?:obligation|requirement|duty|breach)|civil\s+liability|violat(?:es?|ing|ion)\s+(?:the\s+)?(?:law|regulation|statute|act)|subject\s+to\s+(?:criminal|legal|civil)\s+(?:penalty|sanction|prosecution))\b/i;

/** Contractual commitment: agreements, warranties, indemnities. */
const CRITICAL_CONTRACT_RE =
  /\b(?:agree(?:s|d)?\s+to\s+(?:provide|deliver|pay|indemnify|compensate)|commit(?:s|ted|ment)?\s+to\s+(?:deliver|provide|pay|ensure)|warrant(?:s|ed|y|ies)\s+that|indemnif(?:y|ies|ied|ication)|covenant(?:s|ed)?\s+(?:to|that)|breach\s+of\s+contract|contractual\s+obligation|bound\s+(?:by\s+contract|to\s+deliver|to\s+pay)|obligation\s+to\s+(?:pay|deliver|provide|indemnify))\b/i;

/** Payment: invoices, fees, financial penalties, currency amounts. */
const CRITICAL_PAYMENT_RE =
  /\b(?:(?:must|shall)\s+pay|payment\s+(?:of|due|is\s+required)|invoice\s+(?:for|of|amount)|fee\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|penalty\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|charge\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|financial\s+penalty|overdue\s+payment|pay(?:able|ment)\s+within|remit\s+(?:payment|funds?))\b|(?:\$|£|€)\s*\d[\d,]*(?:\.\d{2})?(?:\s*(?:USD|GBP|EUR|million|billion|thousand))?/i;

/** Security control: mandatory authentication, encryption, access controls. */
const CRITICAL_SECURITY_RE =
  /\b(?:must\s+(?:encrypt|authenticate|authoriz|use\s+(?:MFA|multi[- ]factor|two[- ]factor)|implement\s+(?:encryption|authentication|MFA)|enable\s+encryption)|shall\s+(?:encrypt|authenticate|use\s+(?:MFA|multi[- ]factor))|encryption\s+(?:is\s+)?(?:required|mandatory|must\s+be\s+enabled)|authentication\s+(?:is\s+)?(?:required|mandatory|must\s+be\s+(?:required|enforced|enabled|implemented|applied))|authentication\s+(?:must|shall)\s+be\s+(?:required|enforced|enabled|implemented|applied)|multi[- ]factor\s+authentication\s+(?:is\s+)?(?:required|mandatory|must)|access\s+control\s+(?:policy|requirement|must)|password\s+(?:must|shall|policy\s+requires?)|security\s+control\s+(?:requires?|mandates?|must))\b/i;

/** Regulatory obligation: explicit regulatory frameworks with compliance language. */
const CRITICAL_REGULATORY_RE =
  /\b(?:must\s+comply\s+with\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FERPA|COPPA|PIPEDA|DPDPA|UK\s+GDPR)|in\s+compliance\s+with\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FERPA|COPPA|PIPEDA|DPDPA|UK\s+GDPR)|subject\s+to\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FCA\s+regulation|regulation)|GDPR\s+(?:requires?|mandates?|obligates?|compliance)|HIPAA\s+(?:requires?|mandates?|compliance)|regulatory\s+(?:obligation|requirement|mandate|breach)\s+(?:to|for|under)|compliance\s+(?:with\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|the\s+(?:Act|Regulation|Directive))\s+(?:is\s+)?(?:required|mandatory))\b/i;

// ---------------------------------------------------------------------------
// HIGH patterns
// ---------------------------------------------------------------------------

/** Approval granted by an authority. */
const HIGH_APPROVAL_RE =
  /\b(?:(?:is|has\s+been|was)\s+approved|approval\s+(?:is\s+)?(?:granted|given|received|confirmed)|approved\s+by\s+(?:the\s+)?(?:board|executive|committee|director|management|CEO|CTO|CFO)|sign[- ]off\s+(?:has\s+been\s+)?(?:received|granted|given|confirmed)|formally\s+approved|unconditionally\s+approved)\b/i;

/** Rejection or denial. */
const HIGH_REJECTION_RE =
  /\b(?:(?:is|has\s+been|was)\s+(?:rejected|denied|declined|refused)|not\s+approved|rejection\s+of|denied\s+by|request\s+(?:is|has\s+been|was)\s+(?:rejected|denied|declined))\b/i;

/** Formal decision recorded. */
const HIGH_DECISION_RE =
  /\b(?:(?:it\s+has\s+been|it\s+was|has\s+been)\s+decided|decision\s+(?:to|has\s+been|was\s+made\s+to|is\s+to)|resolved\s+(?:to|that)\b|formally\s+(?:agreed|resolved|decided)|the\s+decision\s+is\s+to|agreed\s+to\s+proceed\s+with)\b/i;

/** Executive or formal recommendation. */
const HIGH_RECOMMENDATION_RE =
  /\b(?:we\s+recommend|it\s+is\s+recommended|(?:strongly|formally|officially|explicitly)\s+recommends?\b|our\s+recommendation\s+(?:is|was)|the\s+recommendation\s+(?:is|was)\s+to|recommend(?:ation)?\s+(?:is\s+)?to\s+(?:adopt|proceed|migrate|implement|use|deploy|replace|remove))\b/i;

/** Deployment or release instruction. */
const HIGH_DEPLOYMENT_RE =
  /\b(?:(?:must|shall|will)\s+be\s+deployed|deploy(?:ment)?\s+to\s+(?:production|staging|live|the\s+(?:production|live)\s+environment)|go[- ]live\s+(?:date|on|is|scheduled)|release\s+to\s+(?:production|live|staging)|rollout\s+to\s+(?:all|production|live))\b/i;

/** Firm deadline or due date. */
const HIGH_DEADLINE_RE =
  /\b(?:deadline\s+(?:is|of|for)|no\s+later\s+than|must\s+be\s+(?:completed|delivered|submitted|finalised?|finalized?)\s+by|due\s+by|due\s+date|by\s+(?:end\s+of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)|by\s+\d{1,2}[\/\-]\d{1,2}|by\s+(?:Q[1-4]\s+)?\d{4}|time[- ]critical|time-sensitive\s+obligation)\b/i;

/**
 * Deontic obligation (must / shall) without a CRITICAL-level trigger.
 * Acts as a catch-all for RFC 2119 obligation language.
 */
const HIGH_OBLIGATION_RE = /\b(?:must|shall)\b/i;

// ---------------------------------------------------------------------------
// MODERATE patterns
// ---------------------------------------------------------------------------

/** Implementation guidance or best-practice recommendation. */
const MODERATE_GUIDANCE_RE =
  /\b(?:should\b|it\s+is\s+(?:advisable|recommended|suggested|best\s+practice)\s+to|best\s+practice(?:s)?\s+(?:is|are|dictate|suggest|recommend)|guideline(?:s)?\s+(?:state|recommend|suggest)|it\s+is\s+(?:good\s+practice|preferred|advised)\s+to|consider(?:ing)?\s+(?:using|adopting|implementing))\b/i;

/** Design or process assumption. */
const MODERATE_ASSUMPTION_RE =
  /\b(?:assumes?\s+(?:that\s+)?(?:all|the|a|an|this|users?|systems?|the\s+(?:client|server|system|user))|assumption(?:s)?\s+(?:is|are|include|that)\b|assuming\s+that|this\s+design\s+assumes?|it\s+is\s+assumed\s+that|on\s+the\s+assumption\s+that)\b/i;

/** Supporting rationale or causal explanation. */
const MODERATE_RATIONALE_RE =
  /\b(?:because\s+(?:the|this|it|of|a)\b|therefore\b|consequently\b|as\s+a\s+result\s+of\b|for\s+this\s+reason\b|due\s+to\s+(?:the|this|a)\b|this\s+is\s+(?:because|due\s+to)\b|(?:the\s+)?reason\s+(?:for|is|why)\b|given\s+that\b|in\s+light\s+of\b)\b/i;

/** Warning, caution, or important notice. */
const MODERATE_WARNING_RE =
  /\b(?:warning\b|caution\b|note\s+that\b|be\s+aware\s+(?:that|of)\b|important(?:\s+note)?:\s|important\s+–\b|please\s+note\b|attention\b|take\s+care\s+(?:to|when|not\s+to)\b)\b/i;

/**
 * Non-payment quantified limit or threshold.
 * NOTE: no trailing \b — digit sequences within numbers (e.g. "500") would
 * prevent a word boundary from matching after the first digit.
 */
const MODERATE_QUANTIFIED_RE =
  /\b(?:maximum(?:\s+of)?\s+\d[\d,]*|minimum(?:\s+of)?\s+\d[\d,]*|no\s+more\s+than\s+\d[\d,]*|no\s+fewer\s+than\s+\d[\d,]*|at\s+(?:least|most)\s+\d[\d,]*|up\s+to\s+\d[\d,]*\s*(?:users?|requests?|items?|records?)|(?:timeout|threshold|limit|capacity|rate\s+limit)\s+(?:of|is)\s+\d[\d,]*|SLA\s+of\s+\d[\d,]*|availability\s+of\s+\d{2,3}(?:\.\d+)?%|\d{2,3}(?:\.\d+)?%\s+(?:uptime|availability))/i;

// ---------------------------------------------------------------------------
// LOW patterns
// ---------------------------------------------------------------------------

/**
 * Examples and illustrations.
 * NOTE: "e.g." ends with "." (non-word char) so the outer trailing \b
 * would always fail for it. It is placed as a separate alternative outside
 * the \b-bounded group so it does not require a word boundary suffix.
 */
const LOW_EXAMPLE_RE =
  /(?:\b(?:for\s+example|for\s+instance|such\s+as|to\s+illustrate|as\s+an\s+example|by\s+way\s+of\s+example|consider\s+the\s+(?:case|example|scenario)\s+(?:where|in\s+which)|an\s+example\s+of\s+this\s+(?:is|would\s+be))\b|e\.g\.)/i;

/** Descriptive or declarative statements about system state. */
const LOW_DESCRIPTIVE_RE =
  /\b(?:(?:the\s+system|this\s+component|the\s+application|the\s+module|the\s+service|the\s+platform|the\s+tool|the\s+feature)\s+(?:provides?|contains?|includes?|consists?\s+of|supports?|offers?|enables?|exposes?|returns?|displays?|shows?|renders?|accepts?|processes?|handles?|manages?)\b|this\s+(?:section|document|report|chapter|appendix)\s+(?:describes?|outlines?|presents?|summarises?|summarizes?|covers?|explains?)\b)\b/i;

/** Historical or general background context. */
const LOW_BACKGROUND_RE =
  /\b(?:historically\b|traditionally\b|in\s+general\b|generally\s+speaking\b|as\s+a\s+general\s+rule\b|in\s+most\s+cases\b|typically\b|commonly\b|in\s+practice\b|by\s+convention\b|it\s+is\s+common\s+(?:practice|to)\b)\b/i;

/**
 * Explanatory commentary (clarification).
 * NOTE: "i.e." ends with "." (non-word char) so the outer trailing \b
 * would always fail for it. It is placed as a separate alternative outside
 * the \b-bounded group so it does not require a word boundary suffix.
 */
const LOW_EXPLANATORY_RE =
  /(?:\b(?:this\s+means\s+that?|that\s+is(?:[,:]\s?|\s+to\s+say)|in\s+other\s+words|to\s+clarify|to\s+(?:put\s+this|explain\s+this)\s+(?:another\s+way|differently)|in\s+summary|to\s+(?:sum\s+up|summarise|summarize))\b|i\.e\.)/i;

// ---------------------------------------------------------------------------
// INFORMATIONAL patterns
// ---------------------------------------------------------------------------

/** Known metadata label patterns at the start of the statement. */
const INFO_LABEL_RE =
  /^(?:Title|Author|Date|Version|Status|Ref(?:erence)?|Source|Document|Classification|Owner|Approved\s+by|Prepared\s+by|Reviewed\s+by|Last\s+(?:updated|modified|reviewed)|Effective\s+(?:date|from)|Expiry\s+date|Note|See\s+also|Related)(?:\s*[:–—])/i;

/** Navigation references within a document. */
const INFO_NAVIGATION_RE =
  /\b(?:see\s+(?:also|section|chapter|appendix|above|below|figure|table)\b|refer\s+to\s+(?:section|chapter|appendix|the|above|below)\b|as\s+described\s+(?:in|above|below)\b|as\s+noted\s+(?:above|below|in\s+section)\b|as\s+(?:discussed|mentioned)\s+(?:in|above|below)\b|for\s+(?:more\s+)?(?:details?|information|context)\s+see\b|(?:further\s+)?details?\s+(?:can\s+be\s+found|are\s+provided|are\s+given)\s+in\b)\b/i;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractMatches(text: string, re: RegExp): string[] {
  const results: string[] = [];
  const clone = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  clone.lastIndex = 0;
  while ((m = clone.exec(text)) !== null) {
    results.push(m[0].trim());
    if (!re.flags.includes("g")) break;
  }
  return results;
}

/** True when the statement is a short noun phrase (≤ 4 words, no deontic verb). */
function isShortNounPhrase(text: string): boolean {
  const trimmed = text.trim().replace(/[.!?:;,]+$/, "");
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length > 4) return false;
  // Reject if the phrase contains an obvious finite verb
  if (/\b(?:is|are|was|were|has|have|had|do|does|did|will|would|could|should|must|shall|can|may|might|need)\b/i.test(trimmed)) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Rule catalogue
// ---------------------------------------------------------------------------

type RuleCheck = (text: string) => MaterialityDetectionResult | null;

function makeRule(
  classification: MaterialityClassification,
  ruleId: string,
  re: RegExp,
  rationale: string,
): RuleCheck {
  return (text: string) => {
    const matches = extractMatches(text, re);
    if (matches.length === 0) return null;
    // Deduplicate triggering characteristics (case-insensitive)
    const seen = new Set<string>();
    const unique = matches.filter((m) => {
      const key = m.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { classification, ruleId, triggeringCharacteristics: unique, rationale };
  };
}

const RULES: RuleCheck[] = [
  // ---- CRITICAL ----
  makeRule("CRITICAL", "MA-CRITICAL-SAFETY", CRITICAL_SAFETY_RE,
    "The statement contains a safety instruction, risk of injury or death, or emergency action directive."),
  makeRule("CRITICAL", "MA-CRITICAL-LEGAL", CRITICAL_LEGAL_RE,
    "The statement records a legal obligation, statutory requirement, or exposure to criminal or civil liability."),
  makeRule("CRITICAL", "MA-CRITICAL-CONTRACT", CRITICAL_CONTRACT_RE,
    "The statement contains a contractual commitment, warranty, indemnity, or binding obligation."),
  makeRule("CRITICAL", "MA-CRITICAL-PAYMENT", CRITICAL_PAYMENT_RE,
    "The statement authorises a payment, invoice, financial penalty, or currency-denominated obligation."),
  makeRule("CRITICAL", "MA-CRITICAL-SECURITY", CRITICAL_SECURITY_RE,
    "The statement mandates a security control such as encryption, authentication, or access control enforcement."),
  makeRule("CRITICAL", "MA-CRITICAL-REGULATORY", CRITICAL_REGULATORY_RE,
    "The statement records a regulatory compliance obligation under a named framework (GDPR, HIPAA, PCI-DSS, etc.)."),

  // ---- HIGH ----
  makeRule("HIGH", "MA-HIGH-APPROVAL", HIGH_APPROVAL_RE,
    "The statement records that a proposal, plan, or action has been formally approved."),
  makeRule("HIGH", "MA-HIGH-REJECTION", HIGH_REJECTION_RE,
    "The statement records that a proposal, request, or action has been rejected or denied."),
  makeRule("HIGH", "MA-HIGH-DECISION", HIGH_DECISION_RE,
    "The statement records a formal decision or resolution."),
  makeRule("HIGH", "MA-HIGH-RECOMMENDATION", HIGH_RECOMMENDATION_RE,
    "The statement contains a formal or executive recommendation."),
  makeRule("HIGH", "MA-HIGH-DEPLOYMENT", HIGH_DEPLOYMENT_RE,
    "The statement issues a deployment, release, or go-live instruction."),
  makeRule("HIGH", "MA-HIGH-DEADLINE", HIGH_DEADLINE_RE,
    "The statement specifies a deadline, due date, or time-critical completion requirement."),
  makeRule("HIGH", "MA-HIGH-OBLIGATION", HIGH_OBLIGATION_RE,
    "The statement contains deontic obligation language (must / shall) indicating a required action."),

  // ---- MODERATE ----
  makeRule("MODERATE", "MA-MODERATE-GUIDANCE", MODERATE_GUIDANCE_RE,
    "The statement provides implementation guidance, best practice, or a non-binding recommendation."),
  makeRule("MODERATE", "MA-MODERATE-ASSUMPTION", MODERATE_ASSUMPTION_RE,
    "The statement records a design or process assumption that conditions later conclusions."),
  makeRule("MODERATE", "MA-MODERATE-RATIONALE", MODERATE_RATIONALE_RE,
    "The statement provides supporting rationale or causal explanation for another statement."),
  makeRule("MODERATE", "MA-MODERATE-WARNING", MODERATE_WARNING_RE,
    "The statement issues a warning, caution, or important notice."),
  makeRule("MODERATE", "MA-MODERATE-QUANTIFIED", MODERATE_QUANTIFIED_RE,
    "The statement specifies a quantified limit, threshold, or SLA (non-payment)."),

  // ---- LOW ----
  makeRule("LOW", "MA-LOW-EXAMPLE", LOW_EXAMPLE_RE,
    "The statement provides an example or illustration."),
  makeRule("LOW", "MA-LOW-DESCRIPTIVE", LOW_DESCRIPTIVE_RE,
    "The statement describes the attributes or capabilities of a system or component."),
  makeRule("LOW", "MA-LOW-BACKGROUND", LOW_BACKGROUND_RE,
    "The statement provides historical or general background context."),
  makeRule("LOW", "MA-LOW-EXPLANATORY", LOW_EXPLANATORY_RE,
    "The statement provides explanatory commentary or clarification."),
];

/**
 * Checks INFORMATIONAL rules, which require custom logic beyond a simple regex.
 */
function tryInformational(text: string): MaterialityDetectionResult | null {
  // Label patterns
  const labelMatches = extractMatches(text, INFO_LABEL_RE);
  if (labelMatches.length > 0) {
    return {
      classification: "INFORMATIONAL",
      ruleId: "MA-INFO-LABEL",
      triggeringCharacteristics: labelMatches,
      rationale: "The statement is a metadata label or administrative field header.",
    };
  }

  // Short noun phrase (heading-like)
  if (isShortNounPhrase(text)) {
    return {
      classification: "INFORMATIONAL",
      ruleId: "MA-INFO-SHORT-NOUN",
      triggeringCharacteristics: [],
      rationale: "The statement is a short noun phrase consistent with a heading, label, or navigation marker.",
    };
  }

  // Navigation references
  const navMatches = extractMatches(text, INFO_NAVIGATION_RE);
  if (navMatches.length > 0) {
    return {
      classification: "INFORMATIONAL",
      ruleId: "MA-INFO-NAVIGATION",
      triggeringCharacteristics: navMatches,
      rationale: "The statement is a navigation reference directing the reader to another section or resource.",
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main classification function
// ---------------------------------------------------------------------------

/**
 * Applies the Version 1 materiality rule set to a single statement.
 *
 * Rules are tested in priority order (CRITICAL first, UNDETERMINED last).
 * The first matching rule wins. Never throws.
 *
 * @param statementText - Exact statement text from Stage 2.
 * @returns MaterialityDetectionResult with classification, rule, triggers, rationale.
 */
export function classifyMateriality(statementText: string): MaterialityDetectionResult {
  for (const rule of RULES) {
    const result = rule(statementText);
    if (result !== null) return result;
  }

  // Informational rules (require custom logic)
  const info = tryInformational(statementText);
  if (info !== null) return info;

  // Default: UNDETERMINED
  return {
    classification: "UNDETERMINED",
    ruleId: "MA-UNDETERMINED-DEFAULT",
    triggeringCharacteristics: [],
    rationale:
      "No deterministic materiality indicator was found in the statement text. " +
      "The classification is UNDETERMINED because the statement's importance " +
      "depends on context not present in the statement itself.",
  };
}
