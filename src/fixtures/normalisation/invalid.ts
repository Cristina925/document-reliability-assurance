/**
 * DRA-001 — Stage 1 Invalid Normalisation Fixtures
 *
 * Milestone: DRA-ENG-003 — Input Normalisation
 *
 * Deterministic synthetic fixtures for invalid Stage 1 input.
 * All fixtures should cause normaliseEvaluationRequest() to return
 * a Stage1Failure result.
 *
 * Fixture index:
 *   5.  INVALID_EMPTY_IDENTIFIER         — empty id field
 *   6.  INVALID_DUPLICATE_SOURCE_IDS     — two source docs with same id
 *   7.  INVALID_TIMESTAMP                — invalid requestedAt format
 *   8.  INVALID_MISSING_REQUIRED_FIELD   — generatedDocument absent
 *   9.  INVALID_UNRESOLVED_SOURCE_REF    — sourceDocumentId not in sourceDocuments
 *  10.  INVALID_UNKNOWN_FIELDS_ONLY      — only unknown fields (no canonical content)
 *  11.  INVALID_MISSPELLED_FIELD         — misspelled canonical field name
 *  12.  INVALID_ENUM_VALUE               — invalid document format enum
 *  13.  INVALID_INCOMPLETE_SOURCE_DOC    — source document missing required title
 *  14.  INVALID_INCOMPLETE_GENERATED_DOC — generated document missing required content
 *  15.  INVALID_SPAN_REF_NEGATIVE_OFFSET — negative spanRef values (future stage use)
 *  16.  INVALID_DUPLICATE_GEN_SOURCE_ID  — generated doc id = source doc id
 *  17.  INVALID_MULTIPLE_ERRORS          — several independent errors (ordering test)
 *  18.  NULL_INPUT                       — null
 *  19.  UNDEFINED_INPUT                  — undefined
 *  20.  EMPTY_OBJECT                     — {}
 *
 * All data is synthetic and non-sensitive.
 */

export const T_REQUESTED = "2026-07-26T10:00:00.000Z";

// ---------------------------------------------------------------------------
// Fixture 5: Empty identifier
// ---------------------------------------------------------------------------

/** Request with an empty evaluation id. */
export const INVALID_EMPTY_IDENTIFIER = {
  id: "",
  generatedDocument: {
    id: "gen-doc-invalid-005",
    title: "Test Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
};

/** Source document with an empty id. */
export const INVALID_EMPTY_SOURCE_DOC_ID = {
  id: "eval-req-invalid-005b",
  generatedDocument: {
    id: "gen-doc-invalid-005b",
    title: "Test Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [
    { id: "", title: "Source with Empty ID", content: "Content." },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 6: Duplicate source document IDs
// ---------------------------------------------------------------------------

/** Two source documents with the same id — must be rejected. */
export const INVALID_DUPLICATE_SOURCE_IDS = {
  id: "eval-req-invalid-006",
  generatedDocument: {
    id: "gen-doc-invalid-006",
    title: "Document with duplicate source IDs",
    content: "Content referencing duplicate sources.",
    sourceDocumentIds: ["src-dup-001"],
  },
  sourceDocuments: [
    { id: "src-dup-001", title: "Source One", content: "First content." },
    { id: "src-dup-001", title: "Source Two", content: "Second content." },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 7: Invalid timestamp
// ---------------------------------------------------------------------------

/** Request with a non-UTC timestamp (missing Z suffix). */
export const INVALID_TIMESTAMP_NO_Z = {
  id: "eval-req-invalid-007a",
  generatedDocument: {
    id: "gen-doc-invalid-007a",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "2026-07-26T10:00:00",  // no Z — invalid
};

/** Request with an entirely non-date string as timestamp. */
export const INVALID_TIMESTAMP_STRING = {
  id: "eval-req-invalid-007b",
  generatedDocument: {
    id: "gen-doc-invalid-007b",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "not-a-date",
};

/** Request with a timezone offset timestamp (offset: false required). */
export const INVALID_TIMESTAMP_OFFSET = {
  id: "eval-req-invalid-007c",
  generatedDocument: {
    id: "gen-doc-invalid-007c",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "2026-07-26T10:00:00+01:00",
};

// ---------------------------------------------------------------------------
// Fixture 8: Missing required field
// ---------------------------------------------------------------------------

/** Request with no generatedDocument field. */
export const INVALID_MISSING_GENERATED_DOCUMENT = {
  id: "eval-req-invalid-008",
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
  // generatedDocument: missing
};

/** Request with no id field. */
export const INVALID_MISSING_ID = {
  generatedDocument: {
    id: "gen-doc-invalid-008b",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
  // id: missing
};

// ---------------------------------------------------------------------------
// Fixture 9: Unresolved source document reference
// ---------------------------------------------------------------------------

/** sourceDocumentIds contains an ID not present in sourceDocuments. */
export const INVALID_UNRESOLVED_SOURCE_REF = {
  id: "eval-req-invalid-009",
  generatedDocument: {
    id: "gen-doc-invalid-009",
    title: "Document with unresolved reference",
    content: "Content referencing a missing source.",
    sourceDocumentIds: ["src-does-not-exist"],
  },
  sourceDocuments: [
    {
      id: "src-valid-009",
      title: "Valid Source",
      content: "Valid source content.",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 10: Unknown fields only
// ---------------------------------------------------------------------------

/**
 * An object with only unknown fields (no canonical EvaluationRequest fields).
 * Zod will fail to parse this as an EvaluationRequest.
 */
export const INVALID_UNKNOWN_FIELDS_ONLY = {
  unknownField1: "value1",
  unknownField2: 42,
  data: { nested: "object" },
};

// ---------------------------------------------------------------------------
// Fixture 11: Misspelled canonical field
// ---------------------------------------------------------------------------

/**
 * Request with a misspelled canonical field "requestAt" instead of "requestedAt".
 * The canonical requestedAt will be missing, causing validation failure.
 */
export const INVALID_MISSPELLED_FIELD = {
  id: "eval-req-invalid-011",
  generatedDocument: {
    id: "gen-doc-invalid-011",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestAt: T_REQUESTED,  // typo: should be "requestedAt"
  // requestedAt: missing
};

// ---------------------------------------------------------------------------
// Fixture 12: Invalid enum value
// ---------------------------------------------------------------------------

/** Source document with an invalid format value. */
export const INVALID_ENUM_FORMAT = {
  id: "eval-req-invalid-012",
  generatedDocument: {
    id: "gen-doc-invalid-012",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: ["src-invalid-012"],
  },
  sourceDocuments: [
    {
      id: "src-invalid-012",
      title: "Source with bad format",
      content: "Content.",
      format: "WORD_DOCUMENT",  // not a valid SourceDocumentFormat
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 13: Structurally incomplete source document
// ---------------------------------------------------------------------------

/** Source document missing required title. */
export const INVALID_INCOMPLETE_SOURCE_DOC = {
  id: "eval-req-invalid-013",
  generatedDocument: {
    id: "gen-doc-invalid-013",
    title: "Document",
    content: "Content.",
    sourceDocumentIds: ["src-incomplete-013"],
  },
  sourceDocuments: [
    {
      id: "src-incomplete-013",
      title: "",  // empty title — violates min(1)
      content: "Content.",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 14: Structurally incomplete generated document
// ---------------------------------------------------------------------------

/** Generated document with empty content. */
export const INVALID_INCOMPLETE_GENERATED_DOC = {
  id: "eval-req-invalid-014",
  generatedDocument: {
    id: "gen-doc-invalid-014",
    title: "Document",
    content: "",  // empty content — violates min(1)
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
};

/** Generated document with empty title. */
export const INVALID_EMPTY_GENERATED_TITLE = {
  id: "eval-req-invalid-014b",
  generatedDocument: {
    id: "gen-doc-invalid-014b",
    title: "",  // empty title — violates min(1)
    content: "Some content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 15: Invalid span reference (future stage — structural test)
// ---------------------------------------------------------------------------

/**
 * A span reference with a negative startOffset.
 * The canonical model uses z.number().int().nonnegative() for offsets.
 * This will be rejected if span refs appear in Stage 1 input.
 */
export const INVALID_SPAN_REF_NEGATIVE_OFFSET = {
  startOffset: -1,
  endOffset: 10,
};

// ---------------------------------------------------------------------------
// Fixture 16: Generated document ID conflicts with source document ID
// ---------------------------------------------------------------------------

/** generatedDocument.id equals a source document id — must be rejected. */
export const INVALID_DUPLICATE_GEN_SOURCE_ID = {
  id: "eval-req-invalid-016",
  generatedDocument: {
    id: "shared-doc-id",  // same as source document below
    title: "Generated Document",
    content: "Generated content.",
    sourceDocumentIds: ["shared-doc-id"],
  },
  sourceDocuments: [
    {
      id: "shared-doc-id",  // same as generated document above
      title: "Source Document",
      content: "Source content.",
    },
  ],
  requestedAt: T_REQUESTED,
};

// ---------------------------------------------------------------------------
// Fixture 17: Multiple independent errors (deterministic error ordering)
// ---------------------------------------------------------------------------

/**
 * A request with several independent errors:
 *   - empty evaluation id
 *   - empty generated document id
 *   - empty generated document title
 *   - invalid requestedAt timestamp
 *
 * Used to verify that all errors are returned deterministically (not just
 * the first error) and that errors are sorted deterministically.
 */
export const INVALID_MULTIPLE_ERRORS = {
  id: "",                          // error 1: empty id
  generatedDocument: {
    id: "",                         // error 2: empty generated doc id
    title: "",                      // error 3: empty title
    content: "Some content.",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "not-a-timestamp",  // error 4: invalid timestamp
};

// ---------------------------------------------------------------------------
// Fixture 18: Null input
// ---------------------------------------------------------------------------

export const INVALID_NULL_INPUT = null;

// ---------------------------------------------------------------------------
// Fixture 19: Undefined input
// ---------------------------------------------------------------------------

export const INVALID_UNDEFINED_INPUT = undefined;

// ---------------------------------------------------------------------------
// Fixture 20: Empty object
// ---------------------------------------------------------------------------

export const INVALID_EMPTY_OBJECT = {};
