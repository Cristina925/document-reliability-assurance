/**
 * DRA-ENG-016 Part D — Generic Citation Integrity Detector
 *
 * Purpose
 * -------
 * A representation-level detector (not an evaluator issue class — see the
 * DRA-ENG-016 Part E evaluator-boundary analysis for why) that mechanically
 * answers, for a document whose citation structure is bracket-number style
 * ("[19]", "[1–3]", "[7, 8]") with a numbered reference list:
 *
 *   1. Which citation identifiers appear in body text?
 *   2. Which reference identifiers exist?
 *   3. Which citations resolve to references?
 *   4. Which citation markers appear malformed or interrupted?
 *   5. Are numbered reference entries structurally coherent?
 *   6. Are there citation identifiers with no identifiable reference target?
 *   7. Are there reference targets that cannot be structurally distinguished?
 *
 * Design constraints (per DRA-ENG-016):
 *   - No journal-specific rules, no hard-coded citation numbers, no
 *     coordinate assumptions tied to any specific document.
 *   - Operates only on the normalised text and the Stage 2 MaterialStatement
 *     array — the same representation the rest of the pipeline consumes.
 *   - Must NOT report a successful/verified result for citation styles it
 *     cannot reliably analyse (superscript fusion, author-date, footnote
 *     symbols, etc.) — those produce citationStyleDetected: "NONE_DETECTED"
 *     and an overall NOT_ASSESSABLE status.
 *
 * This module is intentionally NOT wired into the evaluator pipeline
 * (extract-claims.ts / evaluate-document.ts) or the issue taxonomy. It is a
 * standalone, opt-in analysis utility. See the DRA-ENG-016 report for the
 * Part E decision on whether/how this should eventually feed the evaluator.
 */

import type { MaterialStatement } from "../model/statements.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LinkageStatus =
  | "VERIFIED_LINKAGE"
  | "POTENTIAL_LINKAGE_DEGRADATION"
  | "NOT_ASSESSABLE";

export interface CitationMarkerRecord {
  readonly raw: string;
  readonly identifiers: readonly string[];
  readonly startOffset: number;
  readonly endOffset: number;
  /**
   * True when no single Stage 2 MaterialStatement contains this marker's
   * exact raw text intact within its span — i.e. the representation lost
   * (or never held) the marker as one coherent unit, regardless of cause.
   */
  readonly malformed: boolean;
}

export interface ReferenceEntryRecord {
  readonly identifier: string;
  readonly markerStartOffset: number;
  /**
   * False when the only Stage 2 statement covering this reference marker's
   * position consists solely of the bare number/marker with no
   * accompanying bibliographic content in the same statement (the W2
   * signature) — i.e. identifier and content cannot both be recovered from
   * a single statement without relying on an undocumented adjacency
   * convention.
   */
  readonly structurallyCoherent: boolean;
  /** True when this identifier appears more than once in the reference list. */
  readonly duplicate: boolean;
}

export interface CitationIntegrityReport {
  readonly citationStyleDetected: "BRACKET_NUMBER" | "NONE_DETECTED";
  readonly markers: readonly CitationMarkerRecord[];
  readonly referenceEntries: readonly ReferenceEntryRecord[];
  readonly citedIdentifiers: readonly string[];
  readonly referenceIdentifiers: readonly string[];
  readonly resolvedIdentifiers: readonly string[];
  readonly unresolvedCitationIdentifiers: readonly string[];
  readonly malformedMarkers: readonly CitationMarkerRecord[];
  readonly structurallyIncoherentReferenceIdentifiers: readonly string[];
  readonly duplicateReferenceIdentifiers: readonly string[];
  readonly status: LinkageStatus;
  readonly reasons: readonly string[];
}

// ---------------------------------------------------------------------------
// Regexes — generic bracket-number citation style, no journal-specific rules
// ---------------------------------------------------------------------------

/**
 * Matches a whole bracket-number citation marker, tolerant of internal
 * whitespace (including newlines) between digits/separators — this
 * deliberately matches the LOGICAL marker even when it was physically split
 * across a line break in the source layout; whether the *representation*
 * (Stage 2 statements) preserved it intact is a separate, later check.
 */
const CITATION_MARKER_RE =
  /\[\s*\d{1,3}(?:\s*[\u2013\u2014-]\s*\d{1,3})?(?:\s*,\s*\d{1,3}(?:\s*[\u2013\u2014-]\s*\d{1,3})?)*\s*\]/g;

/**
 * Matches a numbered reference-list marker at the start of a line, tolerant
 * of leading whitespace (same bound as segment-content.ts's NUMBERED_RE).
 */
const REFERENCE_MARKER_RE = /^[ \t]{0,60}(\d{1,3})[.)](?:[ \t]+(?=\S)|[ \t]*$)/;

/** A statement whose entire (trimmed) text is just a bare number marker. */
const BARE_NUMBER_ONLY_RE = /^\d{1,3}[.)]?$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Expands a marker's inner content ("19, 20" / "1\u20133" / "7") into individual identifier strings. */
function expandIdentifiers(inner: string): string[] {
  const out: string[] = [];
  for (const part of inner.split(",")) {
    const trimmed = part.trim();
    const rangeMatch = /^(\d{1,3})\s*[\u2013\u2014-]\s*(\d{1,3})$/.exec(trimmed);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1]!, 10);
      const hi = parseInt(rangeMatch[2]!, 10);
      if (Number.isFinite(lo) && Number.isFinite(hi) && hi >= lo && hi - lo < 200) {
        for (let n = lo; n <= hi; n++) out.push(String(n));
        continue;
      }
    }
    const single = /^(\d{1,3})$/.exec(trimmed);
    if (single) out.push(single[1]!);
  }
  return out;
}

/** True if any statement's span fully covers [start,end) and its text contains `raw` verbatim. */
function isMarkerIntactInSomeStatement(
  statements: readonly MaterialStatement[],
  start: number,
  end: number,
  raw: string,
): boolean {
  for (const s of statements) {
    const span = s.spanRef;
    if (span === undefined || span.startOffset === undefined || span.endOffset === undefined) continue;
    if (span.startOffset <= start && span.endOffset >= end && s.text.includes(raw)) {
      return true;
    }
  }
  return false;
}

/**
 * Finds the statement(s) whose span overlaps [pos, pos + probeLen) — used to
 * assess whether a reference marker's own number co-occurs with real
 * bibliographic content in the same statement.
 */
function statementsOverlapping(
  statements: readonly MaterialStatement[],
  pos: number,
  probeLen: number,
): MaterialStatement[] {
  const end = pos + probeLen;
  return statements.filter((s) => {
    const span = s.spanRef;
    if (span === undefined || span.startOffset === undefined || span.endOffset === undefined) return false;
    return span.startOffset < end && span.endOffset > pos;
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Detects citation-linkage integrity for a document, given its normalised
 * text and Stage 2 MaterialStatement output. Purely mechanical: makes no
 * claim about semantic correctness of citations, only about whether the
 * document's own bracket-number/numbered-reference structure survives
 * intact and cross-resolvable in DRA's representation.
 */
export function detectCitationIntegrity(
  normalisedText: string,
  statements: readonly MaterialStatement[],
): CitationIntegrityReport {
  const reasons: string[] = [];

  // ---- Locate body citation markers -----------------------------------
  const markers: CitationMarkerRecord[] = [];
  const citedIdentifierSet = new Set<string>();
  for (const m of normalisedText.matchAll(CITATION_MARKER_RE)) {
    const raw = m[0];
    const start = m.index;
    const end = start + raw.length;
    const inner = raw.slice(1, -1);
    const identifiers = expandIdentifiers(inner);
    if (identifiers.length === 0) continue; // not a well-formed numeric marker
    for (const id of identifiers) citedIdentifierSet.add(id);
    const malformed = !isMarkerIntactInSomeStatement(statements, start, end, raw);
    markers.push({ raw, identifiers, startOffset: start, endOffset: end, malformed });
  }

  // ---- Locate reference-list entries -----------------------------------
  const referenceEntries: ReferenceEntryRecord[] = [];
  const seenReferenceIds = new Map<string, number>();
  const lines = normalisedText.split("\n");
  let lineOffset = 0;
  for (const line of lines) {
    const match = REFERENCE_MARKER_RE.exec(line);
    if (match !== null) {
      const identifier = match[1]!;
      const markerStartOffset = lineOffset;
      seenReferenceIds.set(identifier, (seenReferenceIds.get(identifier) ?? 0) + 1);

      // Structural coherence: does any statement overlapping this marker's
      // position combine the number with real content (not just the bare
      // number by itself)?
      const overlapping = statementsOverlapping(statements, markerStartOffset, match[0].length + 40);
      const hasContentBearingStatement = overlapping.some(
        (s) => !BARE_NUMBER_ONLY_RE.test(s.text.trim()) && s.text.trim().length > 3,
      );
      referenceEntries.push({
        identifier,
        markerStartOffset,
        structurallyCoherent: hasContentBearingStatement,
        duplicate: false, // filled in below once all entries are collected
      });
    }
    lineOffset += line.length + 1; // +1 for the split "\n"
  }
  // Mark duplicates now that full counts are known.
  const finalReferenceEntries = referenceEntries.map((r) => ({
    ...r,
    duplicate: (seenReferenceIds.get(r.identifier) ?? 0) > 1,
  }));
  const duplicateReferenceIdentifierSet = new Set(
    finalReferenceEntries.filter((r) => r.duplicate).map((r) => r.identifier),
  );

  const referenceIdentifierSet = new Set(finalReferenceEntries.map((r) => r.identifier));
  const citedIdentifiers = Array.from(citedIdentifierSet).sort((a, b) => Number(a) - Number(b));
  const referenceIdentifiers = Array.from(referenceIdentifierSet).sort((a, b) => Number(a) - Number(b));

  const citationStyleDetected: CitationIntegrityReport["citationStyleDetected"] =
    markers.length > 0 && finalReferenceEntries.length > 0 ? "BRACKET_NUMBER" : "NONE_DETECTED";

  if (citationStyleDetected === "NONE_DETECTED") {
    if (markers.length === 0 && finalReferenceEntries.length === 0) {
      reasons.push(
        "No mechanically identifiable bracket-number citation markers or numbered reference list were found; this citation style (if any) is outside this detector's scope.",
      );
    } else if (markers.length > 0 && finalReferenceEntries.length === 0) {
      reasons.push(
        "Bracket-number citation markers were found in body text, but no numbered reference list was found — linkage cannot be assessed without a reference list.",
      );
    } else {
      reasons.push(
        "A numbered reference list was found, but no bracket-number citation markers were found in body text — nothing to resolve.",
      );
    }
    return {
      citationStyleDetected,
      markers,
      referenceEntries: finalReferenceEntries,
      citedIdentifiers,
      referenceIdentifiers,
      resolvedIdentifiers: [],
      unresolvedCitationIdentifiers: citedIdentifiers,
      malformedMarkers: markers.filter((m) => m.malformed),
      structurallyIncoherentReferenceIdentifiers: Array.from(
        new Set(finalReferenceEntries.filter((r) => !r.structurallyCoherent).map((r) => r.identifier)),
      ),
      duplicateReferenceIdentifiers: Array.from(duplicateReferenceIdentifierSet),
      status: "NOT_ASSESSABLE",
      reasons,
    };
  }

  const resolvedIdentifiers = citedIdentifiers.filter((id) => referenceIdentifierSet.has(id));
  const unresolvedCitationIdentifiers = citedIdentifiers.filter((id) => !referenceIdentifierSet.has(id));
  const malformedMarkers = markers.filter((m) => m.malformed);
  const structurallyIncoherentReferenceIdentifiers = Array.from(
    new Set(finalReferenceEntries.filter((r) => !r.structurallyCoherent).map((r) => r.identifier)),
  );
  const duplicateReferenceIdentifiers = Array.from(duplicateReferenceIdentifierSet);

  let status: LinkageStatus;
  if (
    unresolvedCitationIdentifiers.length > 0 ||
    malformedMarkers.length > 0 ||
    duplicateReferenceIdentifiers.length > 0
  ) {
    status = "POTENTIAL_LINKAGE_DEGRADATION";
    if (unresolvedCitationIdentifiers.length > 0) {
      reasons.push(
        `${unresolvedCitationIdentifiers.length} cited identifier(s) have no matching reference-list entry: ${unresolvedCitationIdentifiers.join(", ")}.`,
      );
    }
    if (malformedMarkers.length > 0) {
      reasons.push(
        `${malformedMarkers.length} citation marker(s) are not preserved intact within any single Stage 2 statement.`,
      );
    }
    if (duplicateReferenceIdentifiers.length > 0) {
      reasons.push(
        `${duplicateReferenceIdentifiers.length} reference identifier(s) appear more than once in the reference list, so they cannot be structurally distinguished: ${duplicateReferenceIdentifiers.join(", ")}.`,
      );
    }
  } else {
    status = "VERIFIED_LINKAGE";
    reasons.push(
      "All cited identifiers resolve to a distinguishable reference-list entry; no malformed markers were detected.",
    );
  }

  if (structurallyIncoherentReferenceIdentifiers.length > 0) {
    // Note: this is recorded but does NOT by itself downgrade the status,
    // because the content is still recoverable via statement-order
    // adjacency (see DRA-ACQ-022 Phase 2C) — it is a distinct, weaker
    // signal (INDIRECTLY_DETECTABLE) from unresolved/malformed markers
    // (which are stronger, unrecoverable signals).
    reasons.push(
      `${structurallyIncoherentReferenceIdentifiers.length} reference entry(ies) have their identifier isolated from bibliographic content within a single statement (recoverable only via statement-order adjacency): ${structurallyIncoherentReferenceIdentifiers.join(", ")}.`,
    );
  }

  return {
    citationStyleDetected,
    markers,
    referenceEntries: finalReferenceEntries,
    citedIdentifiers,
    referenceIdentifiers,
    resolvedIdentifiers,
    unresolvedCitationIdentifiers,
    malformedMarkers,
    structurallyIncoherentReferenceIdentifiers,
    duplicateReferenceIdentifiers,
    status,
    reasons,
  };
}
