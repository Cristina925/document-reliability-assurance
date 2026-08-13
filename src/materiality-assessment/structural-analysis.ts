/**
 * DRA-001 — Stage 5: Materiality Assessment — Structural Analysis
 *
 * Milestone: DRA-ENG-007 — Materiality Assessment
 *
 * Derives deterministic structural characteristics from statement text.
 * These characteristics are carried in the materiality record as supporting
 * structural context. They do NOT determine materiality; the rule engine
 * does that. They are informational annotations only.
 *
 * No external knowledge, internet access, or LLM inference.
 */

import type { StructuralContext } from "./materiality-record.js";

// ---------------------------------------------------------------------------
// Pattern constants for structural analysis
// ---------------------------------------------------------------------------

/**
 * Quantified limit: a number followed by a unit, percentage, or currency.
 * Also matches explicit threshold language.
 */
const QUANTIFIED_LIMIT_RE =
  /\b(?:\d[\d,]*(?:\.\d+)?\s*(?:%|percent|ms|seconds?|minutes?|hours?|days?|weeks?|months?|years?|users?|requests?|items?|records?|bytes?|[kmgKMG][Bb])|(?:maximum|minimum|at\s+least|at\s+most|no\s+more\s+than|no\s+fewer\s+than|up\s+to|limit(?:ed)?\s+to)\s+\d|(?:\$|£|€|USD|GBP|EUR)\s*\d)/i;

/**
 * Temporal reference: dates, deadlines, named time periods, relative time.
 */
const TEMPORAL_RE =
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}[\/\-]\d{2}[\/\-]\d{2}|deadline|due\s+(?:by|date|on)|no\s+later\s+than|by\s+end\s+of|within\s+\d+\s*(?:days?|weeks?|months?|hours?)|annually|quarterly|monthly|weekly|daily|yesterday|today|tomorrow)\b/i;

/**
 * Negation markers.
 */
const NEGATION_RE =
  /\b(?:not|never|no\s+(?:longer|more)|must\s+not|shall\s+not|cannot|can't|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|won't|wouldn't|shouldn't|mustn't)\b/i;

/**
 * Deontic modals: obligation and permission markers.
 */
const DEONTIC_MODAL_RE = /\b(?:must|shall|should|may|ought\s+to|need\s+to|have\s+to|required\s+to)\b/i;

// ---------------------------------------------------------------------------
// Exported analysis function
// ---------------------------------------------------------------------------

/**
 * Derives deterministic structural characteristics from a statement's text.
 *
 * @param statementText - Exact text of the statement from Stage 2.
 * @returns StructuralContext populated from text-pattern analysis only.
 */
export function analyseStructure(statementText: string): StructuralContext {
  return {
    statementLength: statementText.length,
    hasQuantifiedLimit: QUANTIFIED_LIMIT_RE.test(statementText),
    hasTemporalReference: TEMPORAL_RE.test(statementText),
    hasNegation: NEGATION_RE.test(statementText),
    hasDeonticModal: DEONTIC_MODAL_RE.test(statementText),
  };
}
