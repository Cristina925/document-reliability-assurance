/**
 * DRA-ENG-026 — EXPERIMENTAL Stage 5 correction (NOT part of DRA-GC-1)
 *
 * STATUS: EXPERIMENTAL / DEVELOPMENT ONLY. This module is a deliberately
 * separate clone of `materiality-assessment/materiality-rules.ts`, used to
 * test whether a minimal, generic lexicon extension resolves the
 * CONFIRMED_BOUNDED_DEFECT identified by the ENG-026 controlled experiment.
 *
 * It is NOT imported by `materiality-assessment/index.ts`, `pipeline/`, or
 * any other production/decision-affecting module, and it is NOT part of
 * DRA-GC-1's frozen file set (see `dra-gc-1-freeze-manifest.ts`). Adding,
 * changing, or removing this file does not change `GC1_AGGREGATE_DIGEST`.
 *
 * Scope of the correction (minimum change supported by the root-cause
 * evidence in DRA-ENG-026, Section 8 of this programme's report):
 *   - Exactly five rules were shown to diverge by language in the ENG-026
 *     controlled matrix, all via the same mechanism (an English-only
 *     lexical trigger with no non-English equivalent token):
 *       MA-HIGH-OBLIGATION, MA-HIGH-RECOMMENDATION, MA-MODERATE-GUIDANCE,
 *       MA-LOW-BACKGROUND, MA-LOW-DESCRIPTIVE.
 *   - Each of those five regexes is extended with a documented Spanish
 *     token alternation (additive only — no existing English alternative
 *     is removed or altered), reusing exactly the Spanish deontic tokens
 *     already validated by DRA-CHK-005's test-only counterfactual mapping
 *     (`deber/debe/deben/deberá/deberán`, `es preciso`, `será lícito`) plus
 *     natural Spanish equivalents for recommendation/guidance/background/
 *     descriptive markers, chosen from the same semantic dictionaries a
 *     native-speaker-reviewed lexicon would use, not tuned to any specific
 *     sentence in the ENG-026 matrix.
 *   - All 19 other rules are copied byte-for-byte unchanged from the
 *     production file. No rule precedence order changes. No new
 *     classification value, rule ID, or negation/scope semantics are
 *     introduced.
 *
 * This module is diagnostic. Per the ENG-026 programme boundaries, it must
 * NOT be wired into GC-1, must NOT be used to reinterpret GEN-001, and does
 * not itself constitute or authorise a GC-2.
 */

import type { MaterialityClassification } from "../materiality-classification.js";
import type { MaterialityDetectionResult } from "../materiality-rules.js";

// ---------------------------------------------------------------------------
// CRITICAL patterns (byte-for-byte unchanged from production)
// ---------------------------------------------------------------------------

const CRITICAL_SAFETY_RE =
  /\b(?:safety[- ]critical|life[- ]threatening|risk\s+of\s+(?:injury|death|fatality|harm)|emergency\s+(?:stop|procedure|exit|evacuation|shutdown)|must\s+not\s+operate|immediately\s+(?:stop|cease|evacuate)|do\s+not\s+(?:operate|use|touch|remove)\s+(?:unless|without|if)|hazardous\s+(?:material|substance|condition)|serious\s+(?:injury|harm|damage)|fatal(?:ity|ly)?)\b/i;

const CRITICAL_LEGAL_RE =
  /\b(?:legally\s+required|required\s+by\s+law|prohibited\s+by\s+law|criminal\s+(?:liability|offence?|offense?|penalty|prosecution)|statutory\s+(?:obligation|requirement|duty|breach)|civil\s+liability|violat(?:es?|ing|ion)\s+(?:the\s+)?(?:law|regulation|statute|act)|subject\s+to\s+(?:criminal|legal|civil)\s+(?:penalty|sanction|prosecution))\b/i;

const CRITICAL_CONTRACT_RE =
  /\b(?:agree(?:s|d)?\s+to\s+(?:provide|deliver|pay|indemnify|compensate)|commit(?:s|ted|ment)?\s+to\s+(?:deliver|provide|pay|ensure)|warrant(?:s|ed|y|ies)\s+that|indemnif(?:y|ies|ied|ication)|covenant(?:s|ed)?\s+(?:to|that)|breach\s+of\s+contract|contractual\s+obligation|bound\s+(?:by\s+contract|to\s+deliver|to\s+pay)|obligation\s+to\s+(?:pay|deliver|provide|indemnify))\b/i;

const CRITICAL_PAYMENT_RE =
  /\b(?:(?:must|shall)\s+pay|payment\s+(?:of|due|is\s+required)|invoice\s+(?:for|of|amount)|fee\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|penalty\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|charge\s+of\s+(?:\$|£|€|USD|GBP|EUR|\d)|financial\s+penalty|overdue\s+payment|pay(?:able|ment)\s+within|remit\s+(?:payment|funds?))\b|(?:\$|£|€)\s*\d[\d,]*(?:\.\d{2})?(?:\s*(?:USD|GBP|EUR|million|billion|thousand))?/i;

const CRITICAL_SECURITY_RE =
  /\b(?:must\s+(?:encrypt|authenticate|authoriz|use\s+(?:MFA|multi[- ]factor|two[- ]factor)|implement\s+(?:encryption|authentication|MFA)|enable\s+encryption)|shall\s+(?:encrypt|authenticate|use\s+(?:MFA|multi[- ]factor))|encryption\s+(?:is\s+)?(?:required|mandatory|must\s+be\s+enabled)|authentication\s+(?:is\s+)?(?:required|mandatory|must\s+be\s+(?:required|enforced|enabled|implemented|applied))|authentication\s+(?:must|shall)\s+be\s+(?:required|enforced|enabled|implemented|applied)|multi[- ]factor\s+authentication\s+(?:is\s+)?(?:required|mandatory|must)|access\s+control\s+(?:policy|requirement|must)|password\s+(?:must|shall|policy\s+requires?)|security\s+control\s+(?:requires?|mandates?|must))\b/i;

const CRITICAL_REGULATORY_RE =
  /\b(?:must\s+comply\s+with\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FERPA|COPPA|PIPEDA|DPDPA|UK\s+GDPR)|in\s+compliance\s+with\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FERPA|COPPA|PIPEDA|DPDPA|UK\s+GDPR)|subject\s+to\s+(?:the\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|CCPA|SOX|FCA\s+regulation|regulation)|GDPR\s+(?:requires?|mandates?|obligates?|compliance)|HIPAA\s+(?:requires?|mandates?|compliance)|regulatory\s+(?:obligation|requirement|mandate|breach)\s+(?:to|for|under)|compliance\s+(?:with\s+)?(?:GDPR|HIPAA|PCI[- ]DSS|the\s+(?:Act|Regulation|Directive))\s+(?:is\s+)?(?:required|mandatory))\b/i;

// ---------------------------------------------------------------------------
// HIGH patterns — MA-HIGH-OBLIGATION and MA-HIGH-RECOMMENDATION EXTENDED
// ---------------------------------------------------------------------------

const HIGH_APPROVAL_RE =
  /\b(?:(?:is|has\s+been|was)\s+approved|approval\s+(?:is\s+)?(?:granted|given|received|confirmed)|approved\s+by\s+(?:the\s+)?(?:board|executive|committee|director|management|CEO|CTO|CFO)|sign[- ]off\s+(?:has\s+been\s+)?(?:received|granted|given|confirmed)|formally\s+approved|unconditionally\s+approved)\b/i;

const HIGH_REJECTION_RE =
  /\b(?:(?:is|has\s+been|was)\s+(?:rejected|denied|declined|refused)|not\s+approved|rejection\s+of|denied\s+by|request\s+(?:is|has\s+been|was)\s+(?:rejected|denied|declined))\b/i;

const HIGH_DECISION_RE =
  /\b(?:(?:it\s+has\s+been|it\s+was|has\s+been)\s+decided|decision\s+(?:to|has\s+been|was\s+made\s+to|is\s+to)|resolved\s+(?:to|that)\b|formally\s+(?:agreed|resolved|decided)|the\s+decision\s+is\s+to|agreed\s+to\s+proceed\s+with)\b/i;

/**
 * EXTENDED: original English alternation preserved unchanged; adds Spanish
 * recommendation markers ("recomendamos", "se recomienda", "se recomienda
 * encarecidamente") as an additive alternative.
 */
const HIGH_RECOMMENDATION_RE_V2 =
  /\b(?:we\s+recommend|it\s+is\s+recommended|(?:strongly|formally|officially|explicitly)\s+recommends?\b|our\s+recommendation\s+(?:is|was)|the\s+recommendation\s+(?:is|was)\s+to|recommend(?:ation)?\s+(?:is\s+)?to\s+(?:adopt|proceed|migrate|implement|use|deploy|replace|remove)|recomendamos\b|se\s+recomienda(?:\s+encarecidamente)?\b|(?:es|resulta)\s+recomendable\b)\b/i;

const HIGH_DEPLOYMENT_RE =
  /\b(?:(?:must|shall|will)\s+be\s+deployed|deploy(?:ment)?\s+to\s+(?:production|staging|live|the\s+(?:production|live)\s+environment)|go[- ]live\s+(?:date|on|is|scheduled)|release\s+to\s+(?:production|live|staging)|rollout\s+to\s+(?:all|production|live))\b/i;

const HIGH_DEADLINE_RE =
  /\b(?:deadline\s+(?:is|of|for)|no\s+later\s+than|must\s+be\s+(?:completed|delivered|submitted|finalised?|finalized?)\s+by|due\s+by|due\s+date|by\s+(?:end\s+of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)|by\s+\d{1,2}[\/\-]\d{1,2}|by\s+(?:Q[1-4]\s+)?\d{4}|time[- ]critical|time-sensitive\s+obligation)\b/i;

/**
 * EXTENDED: original English "must"/"shall" alternation preserved unchanged;
 * adds the Spanish deontic tokens already validated by DRA-CHK-005's
 * test-only counterfactual mapping (present/future indicative "deber",
 * "es preciso", "será lícito"). Trailing accented-vowel forms use a
 * negative lookahead instead of a trailing \b, per the documented
 * \b-after-accented-vowel pitfall (see DRA-CHK-005/DRA-ENG-012 memory).
 */
const HIGH_OBLIGATION_RE_V2 =
  /\b(?:must|shall)\b|\bdeber[aá]n(?![a-zA-Z\u00e1-\u00fa])|\bdeber[aá](?![a-zA-Z\u00e1-\u00fa])|\bdeben(?![a-zA-Z\u00e1-\u00fa])|\bdebe(?![a-zA-Z\u00e1-\u00fa])|\bes\s+preciso\b|\bser[aá]\s+l[ií]cito\b/i;

// ---------------------------------------------------------------------------
// MODERATE patterns — MA-MODERATE-GUIDANCE EXTENDED
// ---------------------------------------------------------------------------

/**
 * EXTENDED: original English alternation preserved unchanged; adds the
 * Spanish conditional-mood guidance markers "debería(n)" (weak-obligation
 * counterpart of "should").
 */
const MODERATE_GUIDANCE_RE_V2 =
  /\b(?:should\b|it\s+is\s+(?:advisable|recommended|suggested|best\s+practice)\s+to|best\s+practice(?:s)?\s+(?:is|are|dictate|suggest|recommend)|guideline(?:s)?\s+(?:state|recommend|suggest)|it\s+is\s+(?:good\s+practice|preferred|advised)\s+to|consider(?:ing)?\s+(?:using|adopting|implementing)|deber[ií]an?(?![a-zA-Z\u00e1-\u00fa]))\b/i;

const MODERATE_ASSUMPTION_RE =
  /\b(?:assumes?\s+(?:that\s+)?(?:all|the|a|an|this|users?|systems?|the\s+(?:client|server|system|user))|assumption(?:s)?\s+(?:is|are|include|that)\b|assuming\s+that|this\s+design\s+assumes?|it\s+is\s+assumed\s+that|on\s+the\s+assumption\s+that)\b/i;

const MODERATE_RATIONALE_RE =
  /\b(?:because\s+(?:the|this|it|of|a)\b|therefore\b|consequently\b|as\s+a\s+result\s+of\b|for\s+this\s+reason\b|due\s+to\s+(?:the|this|a)\b|this\s+is\s+(?:because|due\s+to)\b|(?:the\s+)?reason\s+(?:for|is|why)\b|given\s+that\b|in\s+light\s+of\b)\b/i;

const MODERATE_WARNING_RE =
  /\b(?:warning\b|caution\b|note\s+that\b|be\s+aware\s+(?:that|of)\b|important(?:\s+note)?:\s|important\s+–\b|please\s+note\b|attention\b|take\s+care\s+(?:to|when|not\s+to)\b)\b/i;

const MODERATE_QUANTIFIED_RE =
  /\b(?:maximum(?:\s+of)?\s+\d[\d,]*|minimum(?:\s+of)?\s+\d[\d,]*|no\s+more\s+than\s+\d[\d,]*|no\s+fewer\s+than\s+\d[\d,]*|at\s+(?:least|most)\s+\d[\d,]*|up\s+to\s+\d[\d,]*\s*(?:users?|requests?|items?|records?)|(?:timeout|threshold|limit|capacity|rate\s+limit)\s+(?:of|is)\s+\d[\d,]*|SLA\s+of\s+\d[\d,]*|availability\s+of\s+\d{2,3}(?:\.\d+)?%|\d{2,3}(?:\.\d+)?%\s+(?:uptime|availability))/i;

// ---------------------------------------------------------------------------
// LOW patterns — MA-LOW-BACKGROUND and MA-LOW-DESCRIPTIVE EXTENDED
// ---------------------------------------------------------------------------

const LOW_EXAMPLE_RE =
  /(?:\b(?:for\s+example|for\s+instance|such\s+as|to\s+illustrate|as\s+an\s+example|by\s+way\s+of\s+example|consider\s+the\s+(?:case|example|scenario)\s+(?:where|in\s+which)|an\s+example\s+of\s+this\s+(?:is|would\s+be))\b|e\.g\.)/i;

/**
 * EXTENDED: original English noun-phrase alternation preserved unchanged;
 * adds the Spanish equivalents of the same closed noun-phrase set
 * ("el sistema", "este componente", "la aplicación", "el módulo",
 * "el servicio", "la plataforma", "la herramienta", "la función") paired
 * with the Spanish equivalents of the same closed verb set
 * ("proporciona(n)", "contiene(n)", "incluye(n)", "admite(n)", "ofrece(n)",
 * "permite(n)", "expone(n)", "devuelve(n)", "muestra(n)", "procesa(n)",
 * "gestiona(n)", "maneja(n)").
 */
const LOW_DESCRIPTIVE_RE_V2 =
  /\b(?:(?:the\s+system|this\s+component|the\s+application|the\s+module|the\s+service|the\s+platform|the\s+tool|the\s+feature)\s+(?:provides?|contains?|includes?|consists?\s+of|supports?|offers?|enables?|exposes?|returns?|displays?|shows?|renders?|accepts?|processes?|handles?|manages?)\b|this\s+(?:section|document|report|chapter|appendix)\s+(?:describes?|outlines?|presents?|summarises?|summarizes?|covers?|explains?)\b|(?:el\s+sistema|este\s+componente|la\s+aplicaci[oó]n|el\s+m[oó]dulo|el\s+servicio|la\s+plataforma|la\s+herramienta|la\s+funci[oó]n)\s+(?:proporciona(?:n)?|contiene(?:n)?|incluye(?:n)?|admite(?:n)?|ofrece(?:n)?|permite(?:n)?|expone(?:n)?|devuelve(?:n)?|muestra(?:n)?|procesa(?:n)?|gestiona(?:n)?|maneja(?:n)?))\b/i;

/**
 * EXTENDED: original English alternation preserved unchanged; adds the
 * Spanish cognate/equivalent background markers ("históricamente",
 * "tradicionalmente", "en general", "generalmente", "por lo general",
 * "por regla general", "normalmente", "com\u00fanmente", "en la pr\u00e1ctica").
 */
const LOW_BACKGROUND_RE_V2 =
  /\b(?:historically\b|traditionally\b|in\s+general\b|generally\s+speaking\b|as\s+a\s+general\s+rule\b|in\s+most\s+cases\b|typically\b|commonly\b|in\s+practice\b|by\s+convention\b|it\s+is\s+common\s+(?:practice|to)\b|hist[oó]ricamente\b|tradicionalmente\b|en\s+general\b|generalmente\b|por\s+lo\s+general\b|por\s+regla\s+general\b|normalmente\b|com[uú]nmente\b|en\s+la\s+pr[aá]ctica\b)\b/i;

const LOW_EXPLANATORY_RE =
  /(?:\b(?:this\s+means\s+that?|that\s+is(?:[,:]\s?|\s+to\s+say)|in\s+other\s+words|to\s+clarify|to\s+(?:put\s+this|explain\s+this)\s+(?:another\s+way|differently)|in\s+summary|to\s+(?:sum\s+up|summarise|summarize))\b|i\.e\.)/i;

// ---------------------------------------------------------------------------
// INFORMATIONAL patterns (byte-for-byte unchanged from production)
// ---------------------------------------------------------------------------

const INFO_LABEL_RE =
  /^(?:Title|Author|Date|Version|Status|Ref(?:erence)?|Source|Document|Classification|Owner|Approved\s+by|Prepared\s+by|Reviewed\s+by|Last\s+(?:updated|modified|reviewed)|Effective\s+(?:date|from)|Expiry\s+date|Note|See\s+also|Related)(?:\s*[:–—])/i;

const INFO_NAVIGATION_RE =
  /\b(?:see\s+(?:also|section|chapter|appendix|above|below|figure|table)\b|refer\s+to\s+(?:section|chapter|appendix|the|above|below)\b|as\s+described\s+(?:in|above|below)\b|as\s+noted\s+(?:above|below|in\s+section)\b|as\s+(?:discussed|mentioned)\s+(?:in|above|below)\b|for\s+(?:more\s+)?(?:details?|information|context)\s+see\b|(?:further\s+)?details?\s+(?:can\s+be\s+found|are\s+provided|are\s+given)\s+in\b)\b/i;

// ---------------------------------------------------------------------------
// Helpers (byte-for-byte unchanged from production)
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

function isShortNounPhrase(text: string): boolean {
  const trimmed = text.trim().replace(/[.!?:;,]+$/, "");
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length > 4) return false;
  if (/\b(?:is|are|was|were|has|have|had|do|does|did|will|would|could|should|must|shall|can|may|might|need)\b/i.test(trimmed)) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Rule catalogue (five rules use the _V2 extended regex; all others identical)
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

const RULES_V2: RuleCheck[] = [
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

  makeRule("HIGH", "MA-HIGH-APPROVAL", HIGH_APPROVAL_RE,
    "The statement records that a proposal, plan, or action has been formally approved."),
  makeRule("HIGH", "MA-HIGH-REJECTION", HIGH_REJECTION_RE,
    "The statement records that a proposal, request, or action has been rejected or denied."),
  makeRule("HIGH", "MA-HIGH-DECISION", HIGH_DECISION_RE,
    "The statement records a formal decision or resolution."),
  makeRule("HIGH", "MA-HIGH-RECOMMENDATION", HIGH_RECOMMENDATION_RE_V2,
    "The statement contains a formal or executive recommendation."),
  makeRule("HIGH", "MA-HIGH-DEPLOYMENT", HIGH_DEPLOYMENT_RE,
    "The statement issues a deployment, release, or go-live instruction."),
  makeRule("HIGH", "MA-HIGH-DEADLINE", HIGH_DEADLINE_RE,
    "The statement specifies a deadline, due date, or time-critical completion requirement."),
  makeRule("HIGH", "MA-HIGH-OBLIGATION", HIGH_OBLIGATION_RE_V2,
    "The statement contains deontic obligation language (must / shall / Spanish deber-family) indicating a required action."),

  makeRule("MODERATE", "MA-MODERATE-GUIDANCE", MODERATE_GUIDANCE_RE_V2,
    "The statement provides implementation guidance, best practice, or a non-binding recommendation."),
  makeRule("MODERATE", "MA-MODERATE-ASSUMPTION", MODERATE_ASSUMPTION_RE,
    "The statement records a design or process assumption that conditions later conclusions."),
  makeRule("MODERATE", "MA-MODERATE-RATIONALE", MODERATE_RATIONALE_RE,
    "The statement provides supporting rationale or causal explanation for another statement."),
  makeRule("MODERATE", "MA-MODERATE-WARNING", MODERATE_WARNING_RE,
    "The statement issues a warning, caution, or important notice."),
  makeRule("MODERATE", "MA-MODERATE-QUANTIFIED", MODERATE_QUANTIFIED_RE,
    "The statement specifies a quantified limit, threshold, or SLA (non-payment)."),

  makeRule("LOW", "MA-LOW-EXAMPLE", LOW_EXAMPLE_RE,
    "The statement provides an example or illustration."),
  makeRule("LOW", "MA-LOW-DESCRIPTIVE", LOW_DESCRIPTIVE_RE_V2,
    "The statement describes the attributes or capabilities of a system or component."),
  makeRule("LOW", "MA-LOW-BACKGROUND", LOW_BACKGROUND_RE_V2,
    "The statement provides historical or general background context."),
  makeRule("LOW", "MA-LOW-EXPLANATORY", LOW_EXPLANATORY_RE,
    "The statement provides explanatory commentary or clarification."),
];

function tryInformational(text: string): MaterialityDetectionResult | null {
  const labelMatches = extractMatches(text, INFO_LABEL_RE);
  if (labelMatches.length > 0) {
    return {
      classification: "INFORMATIONAL",
      ruleId: "MA-INFO-LABEL",
      triggeringCharacteristics: labelMatches,
      rationale: "The statement is a metadata label or administrative field header.",
    };
  }
  if (isShortNounPhrase(text)) {
    return {
      classification: "INFORMATIONAL",
      ruleId: "MA-INFO-SHORT-NOUN",
      triggeringCharacteristics: [],
      rationale: "The statement is a short noun phrase consistent with a heading, label, or navigation marker.",
    };
  }
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

/**
 * EXPERIMENTAL Stage 5 classifier — DRA-ENG-026 candidate correction.
 * Not part of DRA-GC-1. See module header for scope and status.
 */
export function classifyMaterialityV2Experimental(statementText: string): MaterialityDetectionResult {
  for (const rule of RULES_V2) {
    const result = rule(statementText);
    if (result !== null) return result;
  }
  const info = tryInformational(statementText);
  if (info !== null) return info;
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

/** Marker export confirming this module's experimental, non-frozen status (used by tests). */
export const ENG_026_EXPERIMENTAL_MODULE_ID = "DRA-ENG-026-STAGE5-V2-EXPERIMENTAL" as const;
