/**
 * DRA-001 — Stage 1 Valid Normalisation Fixtures
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Deterministic synthetic fixtures for valid Stage 1 input.
 * All fixtures should pass normaliseEvaluationRequest() successfully.
 *
 * Fixture index:
 *   1.  VALID_CANONICAL             — fully canonical valid input
 *   2.  VALID_WHITESPACE_METADATA   — valid input requiring metadata trimming
 *   3.  VALID_CRLF_CONTENT          — valid input with CRLF line endings
 *   4.  VALID_UNORDERED_SOURCES     — semantically equivalent, different source order
 *   5.  VALID_EMPTY_SOURCES         — request with no source documents
 *   6.  VALID_NO_SOURCE_IDS         — generated doc with empty sourceDocumentIds
 *   7.  VALID_SINGLE_SOURCE         — request with exactly one source document
 *   8.  VALID_VERSION_IN_METADATA   — requesterMetadata carries version hints
 *   9.  VALID_MUTATION_TEST         — raw input for non-mutation proof
 *  10.  VALID_DETERMINISM_TEST      — two semantically equivalent inputs
 *
 * All data is synthetic and non-sensitive.
 */

// ---------------------------------------------------------------------------
// Fixed timestamps (deterministic)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Fixture 11 & 12: evaluationBoundary preservation (DRA-FIX-001 regression)
// ---------------------------------------------------------------------------

/**
 * Valid request WITH an evaluationBoundary.
 *
 * Used by DRA-FIX-001 regression tests to verify that
 * normaliseEvaluationRequest preserves evaluationBoundary exactly.
 * Dropping the field (the bug fixed in DRA-FIX-001 normalisation wiring)
 * would cause the boundary offsets to be absent in the normalised request,
 * which in turn causes Stage 2 to evaluate the full document instead of
 * the restricted range.
 *
 * Boundary: startOffset=10, endOffset=100 (arbitrary valid range within
 * the 93-character content string below).
 */
export const VALID_WITH_BOUNDARY = {
  id: "eval-req-boundary-001",
  generatedDocument: {
    id: "gen-doc-boundary-001",
    title: "Boundary Fixture Document",
    content:
      "Preamble text. Section 1: All systems must comply. Section 2: Evidence required.",
    sourceDocumentIds: ["src-boundary-001"],
  },
  sourceDocuments: [
    {
      id: "src-boundary-001",
      title: "Boundary Source",
      content: "All systems must comply. Evidence of compliance must be provided.",
      format: "PLAIN_TEXT" as const,
    },
  ],
  requestedAt: "2026-07-26T10:00:00.000Z",
  evaluationBoundary: {
    startOffset: 15,
    endOffset: 79,
  },
};

/**
 * Structurally identical to VALID_WITH_BOUNDARY but without evaluationBoundary.
 * Used to confirm that the absence of evaluationBoundary in the input
 * produces undefined in the normalised request (no phantom field).
 */
export const VALID_WITHOUT_BOUNDARY = {
  id: "eval-req-boundary-002",
  generatedDocument: {
    id: "gen-doc-boundary-002",
    title: "No-Boundary Fixture Document",
    content:
      "Preamble text. Section 1: All systems must comply. Section 2: Evidence required.",
    sourceDocumentIds: ["src-boundary-002"],
  },
  sourceDocuments: [
    {
      id: "src-boundary-002",
      title: "No-Boundary Source",
      content: "All systems must comply. Evidence of compliance must be provided.",
      format: "PLAIN_TEXT" as const,
    },
  ],
  requestedAt: "2026-07-26T10:00:00.000Z",
};

export const T_REQUESTED = "2026-07-26T10:00:00.000Z";
export const T_PUBLISHED = "2026-01-15T00:00:00.000Z";
export const T_INGESTED = "2026-07-25T12:00:00.000Z";
export const T_GENERATED = "2026-07-26T09:55:00.000Z";

// ---------------------------------------------------------------------------
// Fixture 1: Fully canonical valid input
// ---------------------------------------------------------------------------

/** A fully canonical, already-normalised EvaluationRequest. */
export const VALID_CANONICAL = {
  id: "eval-req-norm-001",
  generatedDocument: {
    id: "gen-doc-norm-001",
    title: "AI-Generated Technical Summary",
    content:
      "This document summarises the key technical requirements.\n" +
      "Section 1: All systems must comply with ISO 27001.\n" +
      "Section 2: Evidence of compliance must be provided.",
    sourceDocumentIds: ["src-norm-001"],
    generatedAt: T_GENERATED,
  },
  sourceDocuments: [
    {
      id: "src-norm-001",
      title: "Technical Requirements Standard v2.0",
      content:
        "1. All systems must comply with ISO 27001.\n" +
        "2. Evidence of compliance must be provided in Appendix B.",
      format: "PLAIN_TEXT" as const,
      version: "2.0",
      author: "Standards Body",
      publishedAt: T_PUBLISHED,
      ingestedAt: T_INGESTED,
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 2: Valid input requiring whitespace normalisation
// ---------------------------------------------------------------------------

/**
 * Valid input where metadata fields have leading/trailing whitespace.
 * After normalisation, title and author should be trimmed.
 * Content must be preserved exactly (not trimmed).
 */
export const VALID_WHITESPACE_METADATA = {
  id: "eval-req-norm-002",
  generatedDocument: {
    id: "gen-doc-norm-002",
    title: "  AI-Generated Summary with Spaces  ",
    content: "The document content must not be trimmed.",
    sourceDocumentIds: ["src-norm-002"],
  },
  sourceDocuments: [
    {
      id: "src-norm-002",
      title: "  Reference Document with Leading Space  ",
      content: "Reference content here.",
      author: "  Test Author  ",
      provenanceNotes: "  Notes with spaces  ",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 3: Valid input with CRLF line endings
// ---------------------------------------------------------------------------

/**
 * Valid input where content fields use CRLF (\r\n) line endings.
 * After normalisation, all \r\n should be converted to \n.
 */
export const VALID_CRLF_CONTENT = {
  id: "eval-req-norm-003",
  generatedDocument: {
    id: "gen-doc-norm-003",
    title: "CRLF Test Document",
    content:
      "Line one.\r\nLine two.\r\nLine three.\r\n" +
      "Section 2: More content.\r\nEnd of document.",
    sourceDocumentIds: ["src-norm-003"],
  },
  sourceDocuments: [
    {
      id: "src-norm-003",
      title: "Source with CRLF",
      content: "Reference line one.\r\nReference line two.\r\nEnd.",
    },
  ],
  requestedAt: T_REQUESTED,
};

/** Expected content after CRLF normalisation. */
export const VALID_CRLF_EXPECTED_GEN_CONTENT =
  "Line one.\nLine two.\nLine three.\nSection 2: More content.\nEnd of document.";
export const VALID_CRLF_EXPECTED_SRC_CONTENT =
  "Reference line one.\nReference line two.\nEnd.";

// ---------------------------------------------------------------------------
// Fixture 4: Valid input with unordered source documents
// ---------------------------------------------------------------------------

/**
 * Valid input where source documents are provided in reverse alphabetical order.
 * After normalisation, they should be sorted by id (lexicographic ascending).
 */
export const VALID_UNORDERED_SOURCES = {
  id: "eval-req-norm-004",
  generatedDocument: {
    id: "gen-doc-norm-004",
    title: "Document referencing multiple sources",
    content: "Content referencing src-norm-004-b and src-norm-004-a.",
    sourceDocumentIds: ["src-norm-004-b", "src-norm-004-a"],
  },
  sourceDocuments: [
    {
      id: "src-norm-004-b",
      title: "Source B",
      content: "Content of source B.",
    },
    {
      id: "src-norm-004-a",
      title: "Source A",
      content: "Content of source A.",
    },
  ],
  requestedAt: T_REQUESTED,
};

/** Expected source document order after normalisation (sorted by id). */
export const VALID_UNORDERED_SOURCES_EXPECTED_ORDER = [
  "src-norm-004-a",
  "src-norm-004-b",
];

// ---------------------------------------------------------------------------
// Fixture 5: Valid input with no source documents
// ---------------------------------------------------------------------------

/**
 * Valid input with an empty sourceDocuments array.
 * The generated document also has no sourceDocumentIds.
 * This is structurally valid at Stage 1.
 */
export const VALID_EMPTY_SOURCES = {
  id: "eval-req-norm-005",
  generatedDocument: {
    id: "gen-doc-norm-005",
    title: "Document with no source references",
    content: "This document has no associated source documents.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 6: Valid input with no sourceDocumentIds in generated document
// ---------------------------------------------------------------------------

/**
 * Valid input where the generated document has no sourceDocumentIds
 * but sourceDocuments ARE provided. This is valid: the association
 * may be supplied later or may use a different linkage mechanism.
 */
export const VALID_NO_SOURCE_IDS = {
  id: "eval-req-norm-006",
  generatedDocument: {
    id: "gen-doc-norm-006",
    title: "Document without explicit source IDs",
    content: "Content without explicit source document references.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [
    {
      id: "src-norm-006",
      title: "Available Source Document",
      content: "Available source content.",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 7: Valid input with a single source document
// ---------------------------------------------------------------------------

export const VALID_SINGLE_SOURCE = {
  id: "eval-req-norm-007",
  generatedDocument: {
    id: "gen-doc-norm-007",
    title: "Document with one source",
    content: "Content derived from exactly one source document.",
    sourceDocumentIds: ["src-norm-007"],
  },
  sourceDocuments: [
    {
      id: "src-norm-007",
      title: "Single Source Document",
      content: "The sole source of evidence for this evaluation.",
      format: "MARKDOWN" as const,
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 8: Valid input with version hints in requesterMetadata
// ---------------------------------------------------------------------------

/**
 * Valid input where requesterMetadata contains optional version hints.
 * requesterMetadata is opaque — these values are preserved but not
 * interpreted as DRA model or pipeline version constraints.
 * The normalisation record must always declare the canonical versions.
 */
export const VALID_VERSION_IN_METADATA = {
  id: "eval-req-norm-008",
  generatedDocument: {
    id: "gen-doc-norm-008",
    title: "Document with version metadata",
    content: "Content for version metadata test.",
    sourceDocumentIds: ["src-norm-008"],
  },
  sourceDocuments: [
    {
      id: "src-norm-008",
      title: "Version Metadata Source",
      content: "Source content for version test.",
    },
  ],
  requestedAt: T_REQUESTED,
  requesterMetadata: {
    requestedBy: "test-agent",
    requestedModelVersion: "0.1.0",   // matches current — preserved, not validated
    requestedPipelineVersion: "1.0",   // matches current — preserved, not validated
    clientVersion: "3.2.1",
  },
};

// ---------------------------------------------------------------------------
// Fixture 9: Raw input for non-mutation proof
// ---------------------------------------------------------------------------

/**
 * A plain JavaScript object used to verify that normaliseEvaluationRequest
 * does not mutate the caller's raw input.
 *
 * The test should:
 *   1. Take a deep copy of this object.
 *   2. Call normaliseEvaluationRequest(VALID_MUTATION_TEST_RAW).
 *   3. Verify the original object is unchanged.
 *   4. Mutate the raw object after normalisation.
 *   5. Verify the normalised result is unchanged.
 */
export const VALID_MUTATION_TEST_RAW = {
  id: "eval-req-norm-009",
  generatedDocument: {
    id: "gen-doc-norm-009",
    title: "Mutation Test Document",
    content: "This content should not be mutated.\r\nLine two.",
    sourceDocumentIds: ["src-norm-009"],
  },
  sourceDocuments: [
    {
      id: "src-norm-009",
      title: "Mutation Test Source",
      content: "Source content for mutation test.\r\nLine two.",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 10: Two semantically equivalent inputs for determinism test
// ---------------------------------------------------------------------------

/**
 * Two requests with the same semantic content but different field ordering
 * and whitespace, used to verify that repeated normalisation produces
 * deeply equal output.
 */
export const VALID_DETERMINISM_INPUT_A = {
  id: "eval-req-norm-010",
  generatedDocument: {
    id: "gen-doc-norm-010",
    title: "  Determinism Test  ",
    content: "Content A.\r\nContent B.",
    sourceDocumentIds: ["src-norm-010-b", "src-norm-010-a"],
  },
  sourceDocuments: [
    { id: "src-norm-010-b", title: "  Source B  ", content: "B content.\r\n" },
    { id: "src-norm-010-a", title: "  Source A  ", content: "A content.\r\n" },
  ],
  requestedAt: T_REQUESTED,
};

export const VALID_DETERMINISM_INPUT_B = {
  id: "eval-req-norm-010",
  generatedDocument: {
    id: "gen-doc-norm-010",
    title: "  Determinism Test  ",
    content: "Content A.\r\nContent B.",
    sourceDocumentIds: ["src-norm-010-b", "src-norm-010-a"],
  },
  sourceDocuments: [
    { id: "src-norm-010-a", title: "  Source A  ", content: "A content.\r\n" },
    { id: "src-norm-010-b", title: "  Source B  ", content: "B content.\r\n" },
  ],
  requestedAt: T_REQUESTED,
};
