/**
 * DRA-001 — Invalid Model Fixtures
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Synthetic fixtures for invalid inputs, covering every major validation rule.
 * Used to verify that validators reject invalid data deterministically.
 *
 * All data is fabricated for testing purposes only.
 */

// ---------------------------------------------------------------------------
// Invalid identifier fixtures
// ---------------------------------------------------------------------------

export const INVALID_EMPTY_ID = "";
export const INVALID_WHITESPACE_ID = "   ";

// ---------------------------------------------------------------------------
// Invalid decision fixtures
// ---------------------------------------------------------------------------

export const INVALID_DECISIONS = [
  "PASS",
  "FAIL",
  "OK",
  "REFUSE",
  "APPROVED",
  "REJECTED",
  "pass",
  "supported",
  "",
  null,
  undefined,
  123,
] as const;

// ---------------------------------------------------------------------------
// Invalid issue class fixtures
// ---------------------------------------------------------------------------

/**
 * Values that DraIssueClassSchema (descriptive literals) must reject.
 * Includes IC-N codes, which are reference codes only — not canonical
 * runtime issue-class values.
 */
export const INVALID_ISSUE_CLASSES = [
  // IC-N codes are reference codes, not canonical issue-class values
  "IC-1",
  "IC-2",
  "IC-3",
  "IC-4",
  "IC-5",
  "IC-6",
  "IC-7",
  "IC-8",
  "IC-9",
  // other invalid values
  "IC_1_UNSUPPORTED_CLAIM",   // wrong separator
  "IC-10_UNKNOWN_CLASS",       // out of range
  "UNSUPPORTED",               // incomplete name
  "ic-1_unsupported_claim",   // wrong case
  "FAKE_ISSUE",
  "",
  null,
  undefined,
  0,
] as const;

/**
 * Values that IssueClassCodeSchema (IC-N codes) must reject.
 * Includes descriptive issue-class names, which are the canonical runtime
 * values — not valid IC-N reference codes.
 */
export const INVALID_ISSUE_CLASS_CODES = [
  // descriptive names are canonical runtime values, not IC-N codes
  "UNSUPPORTED_CLAIM",
  "AUTHORITY_EXPIRED",
  "AUTHORITY_ABSENT",
  "EVIDENCE_ABSENT",
  "EVIDENCE_INADEQUATE",
  "EVIDENCE_CONFLICT",
  "CLAIM_INCONSISTENCY",
  "TRACEABILITY_BROKEN",
  "SCOPE_VIOLATION",
  // other invalid values
  "IC-0",
  "IC-10",
  "ic-1",
  "",
  null,
  0,
] as const;

// ---------------------------------------------------------------------------
// Invalid stage names
// ---------------------------------------------------------------------------

export const INVALID_STAGE_NAMES = [
  "Input Normalization",       // American spelling
  "input normalisation",       // wrong case
  "Stage 1",                   // wrong format
  "InputNormalisation",        // no space
  "",
  null,
] as const;

// ---------------------------------------------------------------------------
// Invalid timestamps
// ---------------------------------------------------------------------------

export const INVALID_TIMESTAMPS = [
  "2026-07-26T09:00:00",         // no Z suffix
  "2026-07-26T09:00:00+01:00",   // offset not Z (offset: false)
  "26/07/2026",                   // wrong format
  "not-a-date",
  "",
  "2026-13-01T00:00:00.000Z",    // invalid month
] as const;

// ---------------------------------------------------------------------------
// Invalid schema versions
// ---------------------------------------------------------------------------

export const INVALID_SCHEMA_VERSIONS = [
  "0.2.0",
  "1.0.0",
  "v0.1.0",
  "",
  null,
] as const;

// ---------------------------------------------------------------------------
// Invalid source document fixtures
// ---------------------------------------------------------------------------

export const INVALID_SOURCE_DOCUMENT_EMPTY_ID = {
  id: "",
  title: "Test Document",
  content: "Some content",
};

export const INVALID_SOURCE_DOCUMENT_EMPTY_TITLE = {
  id: "src-doc-001",
  title: "",
  content: "Some content",
};

export const INVALID_SOURCE_DOCUMENT_BAD_TIMESTAMP = {
  id: "src-doc-001",
  title: "Test Document",
  content: "Some content",
  publishedAt: "not-a-timestamp",
};

export const INVALID_SOURCE_DOCUMENT_NO_ID = {
  title: "Test Document",
  content: "Some content",
};

// ---------------------------------------------------------------------------
// Invalid generated document fixtures
// ---------------------------------------------------------------------------

export const INVALID_GENERATED_DOCUMENT_EMPTY_CONTENT = {
  id: "gen-doc-001",
  title: "AI Document",
  content: "",
  sourceDocumentIds: [],
};

export const INVALID_GENERATED_DOCUMENT_EMPTY_TITLE = {
  id: "gen-doc-001",
  title: "",
  content: "Some content",
  sourceDocumentIds: [],
};

export const INVALID_GENERATED_DOCUMENT_BAD_TIMESTAMP = {
  id: "gen-doc-001",
  title: "AI Document",
  content: "Some content",
  sourceDocumentIds: [],
  generatedAt: "2026-07-26 09:00:00",
};

// ---------------------------------------------------------------------------
// Invalid material statement fixtures
// ---------------------------------------------------------------------------

export const INVALID_STATEMENT_EMPTY_TEXT = {
  id: "stmt-001",
  text: "",
  statementIndex: 0,
};

export const INVALID_STATEMENT_NEGATIVE_INDEX = {
  id: "stmt-001",
  text: "Some claim",
  statementIndex: -1,
};

// ---------------------------------------------------------------------------
// Invalid evidence unit fixtures
// ---------------------------------------------------------------------------

export const INVALID_EVIDENCE_UNIT_EMPTY_PASSAGE = {
  id: "ev-001",
  sourceDocumentId: "src-001",
  passageText: "",
};

export const INVALID_EVIDENCE_UNIT_EMPTY_SOURCE_ID = {
  id: "ev-001",
  sourceDocumentId: "",
  passageText: "Some text",
};

// ---------------------------------------------------------------------------
// Invalid issue fixtures
// ---------------------------------------------------------------------------

export const INVALID_ISSUE_UNKNOWN_CLASS = {
  id: "issue-001",
  issueClass: "FAKE_CLASS",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001"],
  affectedEvidenceUnitIds: [],
  explanation: "Some explanation",
};

export const INVALID_ISSUE_EMPTY_STATEMENTS = {
  id: "issue-001",
  issueClass: "UNSUPPORTED_CLAIM",
  severity: "BLOCKING",
  affectedStatementIds: [],   // must have at least one
  affectedEvidenceUnitIds: [],
  explanation: "Some explanation",
};

export const INVALID_ISSUE_EMPTY_EXPLANATION = {
  id: "issue-001",
  issueClass: "UNSUPPORTED_CLAIM",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001"],
  affectedEvidenceUnitIds: [],
  explanation: "",
};

export const INVALID_ISSUE_UNKNOWN_SEVERITY = {
  id: "issue-001",
  issueClass: "UNSUPPORTED_CLAIM",
  severity: "CRITICAL",
  affectedStatementIds: ["stmt-001"],
  affectedEvidenceUnitIds: [],
  explanation: "Some explanation",
};

// ---------------------------------------------------------------------------
// Invalid proof receipt fixtures
// ---------------------------------------------------------------------------

/** Proof receipt with wrong stage count (6 instead of 7). */
export const INVALID_PROOF_RECEIPT_WRONG_STAGE_COUNT = {
  id: "receipt-001",
  evaluationRequestId: "eval-req-001",
  evaluationResultId: "eval-result-001",
  schemaVersion: "0.1.0",
  documentIdentity: {
    generatedDocumentId: "gen-doc-001",
    generatedDocumentTitle: "Test Document",
    evaluatedAt: "2026-07-26T09:05:00.000Z",
  },
  evaluatorIdentity: {
    evaluatorVersion: "0.1.0",
    pipelineVersion: "1.0",
  },
  stageOutputs: Array.from({ length: 6 }, (_, i) => ({
    stageNumber: i + 1,
    stageName: ["Input Normalisation", "Claim Extraction", "Authority Resolution",
      "Evidence Linkage", "Consistency Check", "Confidence Scoring"][i],
    output: {},
  })),
  issueRegister: [],
  issueSummary: { total: 0, blocking: 0, advisory: 0 },
  decision: "SUPPORTED",
  decisionRationale: "Test rationale",
  timestamp: "2026-07-26T09:05:00.000Z",
};

/** Proof receipt with invalid decision. */
export const INVALID_PROOF_RECEIPT_BAD_DECISION = {
  id: "receipt-001",
  evaluationRequestId: "eval-req-001",
  evaluationResultId: "eval-result-001",
  schemaVersion: "0.1.0",
  documentIdentity: {
    generatedDocumentId: "gen-doc-001",
    generatedDocumentTitle: "Test Document",
    evaluatedAt: "2026-07-26T09:05:00.000Z",
  },
  evaluatorIdentity: {
    evaluatorVersion: "0.1.0",
    pipelineVersion: "1.0",
  },
  stageOutputs: [],
  issueRegister: [],
  issueSummary: { total: 0, blocking: 0, advisory: 0 },
  decision: "PASS",  // invalid
  decisionRationale: "Test",
  timestamp: "2026-07-26T09:05:00.000Z",
};

/** Proof receipt with empty decision rationale. */
export const INVALID_PROOF_RECEIPT_EMPTY_RATIONALE = {
  id: "receipt-001",
  evaluationRequestId: "eval-req-001",
  evaluationResultId: "eval-result-001",
  schemaVersion: "0.1.0",
  documentIdentity: {
    generatedDocumentId: "gen-doc-001",
    generatedDocumentTitle: "Test Document",
    evaluatedAt: "2026-07-26T09:05:00.000Z",
  },
  evaluatorIdentity: {
    evaluatorVersion: "0.1.0",
    pipelineVersion: "1.0",
  },
  stageOutputs: [],
  issueRegister: [],
  issueSummary: { total: 0, blocking: 0, advisory: 0 },
  decision: "SUPPORTED",
  decisionRationale: "",  // must not be empty
  timestamp: "2026-07-26T09:05:00.000Z",
};

// ---------------------------------------------------------------------------
// Invalid evaluation request fixtures
// ---------------------------------------------------------------------------

export const INVALID_REQUEST_MISSING_DOCUMENT = {
  id: "eval-req-001",
  sourceDocuments: [],
  requestedAt: "2026-07-26T09:00:00.000Z",
  // generatedDocument: missing
};

export const INVALID_REQUEST_BAD_TIMESTAMP = {
  id: "eval-req-001",
  generatedDocument: {
    id: "gen-doc-001",
    title: "Test",
    content: "Content",
    sourceDocumentIds: [],
  },
  sourceDocuments: [],
  requestedAt: "not-a-timestamp",
};

// ---------------------------------------------------------------------------
// Invalid evaluation result fixtures
// ---------------------------------------------------------------------------

export const INVALID_RESULT_MISMATCHED_DECISION = {
  // decision in result is HOLD but proof receipt says SUPPORTED
  decision: "HOLD",
  proofReceiptDecision: "SUPPORTED",
};
