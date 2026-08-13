/**
 * DRA-001 — Stage 2 Edge-Case and Failure Fixtures
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Fixtures for edge cases, boundary conditions, and invalid input.
 *
 * Fixture index:
 *  14.  FIXTURE_PUNCTUATION_ONLY      — punctuation-only content
 *  15.  FIXTURE_WHITESPACE_ONLY       — whitespace-only content
 *  18.  FIXTURE_DUPLICATE_SPANS       — content designed to test duplicate-span handling
 *  21.  FIXTURE_ID_COLLISION_CHECK    — verifies IDs are distinct for different spans
 *  22.  FIXTURE_INVALID_INPUT_*       — invalid/unnormalised Stage 1 input scenarios
 *  23.  FIXTURE_EXACT_SPAN_INTEGRITY  — tests for exact span-integrity invariant
 */

import type { NormalisedEvaluationRequest } from "../../normalisation/stage1-types.js";

const T_REQUESTED = "2026-07-26T10:00:00.000Z";
const T_GENERATED = "2026-07-26T09:55:00.000Z";

function makeRequest(
  id: string,
  genDocId: string,
  content: string,
): NormalisedEvaluationRequest {
  return {
    id: id as NormalisedEvaluationRequest["id"],
    generatedDocument: {
      id: genDocId as NormalisedEvaluationRequest["generatedDocument"]["id"],
      title: "Edge Case Document",
      content,
      sourceDocumentIds: [],
      generatedAt: T_GENERATED,
    },
    sourceDocuments: [],
    requestedAt: T_REQUESTED,
  };
}

// ---------------------------------------------------------------------------
// Fixture 14: Punctuation-only content
// ---------------------------------------------------------------------------

export const FIXTURE_PUNCTUATION_ONLY = makeRequest(
  "eval-014",
  "gen-014",
  "... --- ...--- ...",
);

export const FIXTURE_PUNCTUATION_ONLY_EXPECTED_COUNT = 0;

// ---------------------------------------------------------------------------
// Fixture 15: Whitespace-only content
// ---------------------------------------------------------------------------

export const FIXTURE_WHITESPACE_ONLY = makeRequest(
  "eval-015",
  "gen-015",
  "   \n   \n\n   ",
);

export const FIXTURE_WHITESPACE_ONLY_EXPECTED_COUNT = 0;

// ---------------------------------------------------------------------------
// Fixture 18: Duplicate/overlapping candidate spans
// ---------------------------------------------------------------------------

// This tests the DUPLICATE_SPAN exclusion at the classification level.
// Two segments with the same (startOffset, endOffset) cannot arise naturally
// from the segmenter (it is linear and non-overlapping). This fixture tests
// the case where content has clear non-overlapping segments with no duplicates.
export const FIXTURE_NO_DUPLICATE_SPANS = makeRequest(
  "eval-018",
  "gen-018",
  "First claim is here. Second claim is here. Third claim is here.",
);

// All three should be distinct candidates with distinct IDs
export const FIXTURE_NO_DUPLICATE_SPANS_EXPECTED_COUNT = 3;

// ---------------------------------------------------------------------------
// Fixture 21: Statement ID collision test (verifies distinct IDs)
// ---------------------------------------------------------------------------

// Two sentences with the same text but at different character positions.
// They should receive distinct IDs because their offsets differ.
export const FIXTURE_ID_COLLISION_CHECK = makeRequest(
  "eval-021",
  "gen-021",
  "The system is compliant. Details follow.\n\nThe system is compliant. Further evidence is provided.",
);

export const FIXTURE_ID_COLLISION_SAME_TEXT = "The system is compliant.";

// ---------------------------------------------------------------------------
// Fixture 22: Invalid / unnormalised input
// ---------------------------------------------------------------------------

/** null input — should produce Stage2Failure */
export const FIXTURE_INVALID_NULL = null;

/** undefined input — should produce Stage2Failure */
export const FIXTURE_INVALID_UNDEFINED = undefined;

/** Raw string (not a request object) — should produce Stage2Failure */
export const FIXTURE_INVALID_STRING = "not a request object";

/** Number input — should produce Stage2Failure */
export const FIXTURE_INVALID_NUMBER = 42;

/** Empty object (missing required fields) — should produce Stage2Failure */
export const FIXTURE_INVALID_EMPTY_OBJECT = {};

/**
 * Object with generatedDocument but missing content.
 * Note: Stage 1 guarantees content is always present and non-empty.
 * This fixture tests the Stage 2 guard for the case where a caller bypasses
 * Stage 1 and provides a structurally incorrect object.
 */
export const FIXTURE_INVALID_MISSING_CONTENT = {
  id: "eval-022c",
  generatedDocument: {
    id: "gen-022c",
    title: "Test",
    content: null, // invalid — content must be a string
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "2026-07-26T10:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Fixture 23: Exact span integrity cases
// ---------------------------------------------------------------------------

/**
 * Document designed to test the span integrity invariant precisely.
 * The content has known character positions.
 *
 * "ABC. DEF. GHI."
 *  0123456789...
 *
 * Expected statements and spans:
 *   "ABC." → startOffset=0, endOffset=4, content.slice(0,4)="ABC."
 *   "DEF." → startOffset=5, endOffset=9, content.slice(5,9)="DEF."
 *   "GHI." → startOffset=10, endOffset=14, content.slice(10,14)="GHI."
 */
export const FIXTURE_EXACT_SPAN_CONTENT = "ABC. DEF. GHI.";

export const FIXTURE_EXACT_SPAN = makeRequest(
  "eval-023",
  "gen-023",
  FIXTURE_EXACT_SPAN_CONTENT,
);

export const FIXTURE_EXACT_SPAN_EXPECTED: Array<{
  text: string;
  startOffset: number;
  endOffset: number;
}> = [
  { text: "ABC.", startOffset: 0, endOffset: 4 },
  { text: "DEF.", startOffset: 5, endOffset: 9 },
  { text: "GHI.", startOffset: 10, endOffset: 14 },
];

// Verify invariant: content.slice(start, end) === text for each expected span
for (const expected of FIXTURE_EXACT_SPAN_EXPECTED) {
  const slice = FIXTURE_EXACT_SPAN_CONTENT.slice(
    expected.startOffset,
    expected.endOffset,
  );
  if (slice !== expected.text) {
    throw new Error(
      `Fixture 23 invariant violation: ` +
        `content.slice(${expected.startOffset}, ${expected.endOffset}) = ${JSON.stringify(slice)} ` +
        `but expected ${JSON.stringify(expected.text)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional edge-case documents
// ---------------------------------------------------------------------------

/** Empty content string (should produce zero candidates, not a failure). */
export const FIXTURE_EMPTY_CONTENT = makeRequest(
  "eval-ec-001",
  "gen-ec-001",
  " ", // single space — whitespace only, Stage 1 allows this since min(1) is satisfied
);

/** Single-word content */
export const FIXTURE_SINGLE_WORD = makeRequest(
  "eval-ec-002",
  "gen-ec-002",
  "Compliant.",
);

/** Content with only a horizontal rule */
export const FIXTURE_HORIZONTAL_RULE_ONLY = makeRequest(
  "eval-ec-003",
  "gen-ec-003",
  "---\n\n---\n\n===",
);

/** Content with trailing newline */
export const FIXTURE_TRAILING_NEWLINE = makeRequest(
  "eval-ec-004",
  "gen-ec-004",
  "The system is compliant.\n",
);

/** Content with a mix of bullets and sentences */
export const FIXTURE_MIXED_STRUCTURE = makeRequest(
  "eval-ec-005",
  "gen-ec-005",
  "Overview of compliance:\n\n- ISO 27001 is required.\n- Encryption is mandatory.\n\nAll findings are documented below.",
);
