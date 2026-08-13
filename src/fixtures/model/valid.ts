/**
 * DRA-001 — Valid Model Fixtures
 *
 * Milestone: DRA-ENG-002 — Canonical Data Model
 *
 * Synthetic, deterministic fixtures for all canonical DRA-001 Version 1 entities.
 * All data is fabricated for testing purposes only.
 *
 * Do not use private, sensitive, or production document content.
 * Do not claim these fixtures demonstrate assurance performance.
 */

import type {
  SourceDocument,
  GeneratedDocument,
  MaterialStatement,
  EvidenceUnit,
  EvidenceRelationship,
  DraIssue,
  EvaluationRequest,
  EvaluationResult,
  ProofReceipt,
  StageRecord,
} from "../../model/index.js";
import { PIPELINE_STAGES } from "../../model/index.js";

// ---------------------------------------------------------------------------
// Fixed timestamps (deterministic)
// ---------------------------------------------------------------------------

export const T_REQUESTED = "2026-07-26T09:00:00.000Z";
export const T_COMPLETED = "2026-07-26T09:05:00.000Z";
export const T_PUBLISHED = "2026-01-15T00:00:00.000Z";
export const T_INGESTED = "2026-07-25T12:00:00.000Z";
export const T_GENERATED = "2026-07-26T08:55:00.000Z";

// ---------------------------------------------------------------------------
// Fixture: valid SourceDocument
// ---------------------------------------------------------------------------

export const VALID_SOURCE_DOCUMENT: SourceDocument = {
  id: "src-doc-001" as SourceDocument["id"],
  title: "DRA Test Reference Standard v1.0",
  content:
    "This is the reference text for the DRA evaluation test. " +
    "Section 3.1 states that all claims must be traceable to an authority. " +
    "The authority for claim-traceability requirements is ISO/IEC 12345:2024. " +
    "Evidence for this requirement is provided in Appendix A.",
  format: "PLAIN_TEXT",
  version: "1.0",
  author: "DRA Test Programme",
  publishedAt: T_PUBLISHED,
  ingestedAt: T_INGESTED,
  provenanceNotes: "Synthetic fixture document. Not a real standard.",
};

// ---------------------------------------------------------------------------
// Fixture: valid GeneratedDocument
// ---------------------------------------------------------------------------

export const VALID_GENERATED_DOCUMENT: GeneratedDocument = {
  id: "gen-doc-001" as GeneratedDocument["id"],
  title: "AI-Generated Summary of Reference Standard",
  content:
    "The reference standard requires that all claims be traceable to an authority (Section 3.1). " +
    "ISO/IEC 12345:2024 is the governing authority for traceability requirements. " +
    "Supporting evidence is available in Appendix A of the source document.",
  sourceDocumentIds: ["src-doc-001"],
  generatedAt: T_GENERATED,
  generatorMetadata: {
    model: "test-model-v1",
    promptVersion: "prompt-v0.1",
  },
};

// ---------------------------------------------------------------------------
// Fixture: valid MaterialStatement
// ---------------------------------------------------------------------------

export const VALID_MATERIAL_STATEMENT: MaterialStatement = {
  id: "stmt-001" as MaterialStatement["id"],
  text: "All claims must be traceable to an authority.",
  statementIndex: 0,
  spanRef: {
    startOffset: 0,
    endOffset: 50,
    locationLabel: "Sentence 1",
  },
  materiality: "HIGH",
  linkedEvidenceUnitIds: [],
};

// ---------------------------------------------------------------------------
// Fixture: valid EvidenceUnit
// ---------------------------------------------------------------------------

export const VALID_EVIDENCE_UNIT: EvidenceUnit = {
  id: "ev-unit-001" as EvidenceUnit["id"],
  sourceDocumentId: "src-doc-001" as EvidenceUnit["sourceDocumentId"],
  passageText:
    "Section 3.1 states that all claims must be traceable to an authority.",
  spanRef: {
    locationLabel: "Section 3.1",
  },
  locationLabel: "Section 3.1",
};

// ---------------------------------------------------------------------------
// Fixture: valid EvidenceRelationship
// ---------------------------------------------------------------------------

export const VALID_EVIDENCE_RELATIONSHIP: EvidenceRelationship = {
  id: "ev-rel-001" as EvidenceRelationship["id"],
  statementId: "stmt-001" as EvidenceRelationship["statementId"],
  evidenceUnitId: "ev-unit-001" as EvidenceRelationship["evidenceUnitId"],
  relationshipType: "SUPPORTING",
  explanation:
    "The source document passage directly supports the claim that all claims must be traceable.",
};

// ---------------------------------------------------------------------------
// Fixtures: one valid DraIssue for each of the nine issue classes
// ---------------------------------------------------------------------------

export const VALID_ISSUE_UNSUPPORTED_CLAIM: DraIssue = {
  id: "issue-ic1-001" as DraIssue["id"],
  issueClass: "UNSUPPORTED_CLAIM",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation:
    "Claim has no supporting evidence cited in the generated document.",
  stageAssociation: "Evidence Linkage",
};

export const VALID_ISSUE_AUTHORITY_EXPIRED: DraIssue = {
  id: "issue-ic2-001" as DraIssue["id"],
  issueClass: "AUTHORITY_EXPIRED",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation: "The cited authority has been superseded by a later version.",
  stageAssociation: "Authority Resolution",
};

export const VALID_ISSUE_AUTHORITY_ABSENT: DraIssue = {
  id: "issue-ic3-001" as DraIssue["id"],
  issueClass: "AUTHORITY_ABSENT",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation: "Claim requires an authority citation but none is provided.",
  stageAssociation: "Authority Resolution",
};

export const VALID_ISSUE_EVIDENCE_ABSENT: DraIssue = {
  id: "issue-ic4-001" as DraIssue["id"],
  issueClass: "EVIDENCE_ABSENT",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation: "No supporting evidence is provided for this claim.",
  stageAssociation: "Evidence Linkage",
};

export const VALID_ISSUE_EVIDENCE_INADEQUATE: DraIssue = {
  id: "issue-ic5-001" as DraIssue["id"],
  issueClass: "EVIDENCE_INADEQUATE",
  severity: "ADVISORY",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: ["ev-unit-001" as DraIssue["affectedEvidenceUnitIds"][0]],
  explanation: "Evidence is cited but has insufficient detail for this claim.",
  stageAssociation: "Evidence Linkage",
};

export const VALID_ISSUE_EVIDENCE_CONFLICT: DraIssue = {
  id: "issue-ic6-001" as DraIssue["id"],
  issueClass: "EVIDENCE_CONFLICT",
  severity: "ADVISORY",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: ["ev-unit-001" as DraIssue["affectedEvidenceUnitIds"][0]],
  explanation: "Two evidence passages contradict each other on this claim.",
  stageAssociation: "Consistency Check",
};

export const VALID_ISSUE_CLAIM_INCONSISTENCY: DraIssue = {
  id: "issue-ic7-001" as DraIssue["id"],
  issueClass: "CLAIM_INCONSISTENCY",
  severity: "ADVISORY",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation: "Two claims within the document contradict each other.",
  stageAssociation: "Consistency Check",
};

export const VALID_ISSUE_TRACEABILITY_BROKEN: DraIssue = {
  id: "issue-ic8-001" as DraIssue["id"],
  issueClass: "TRACEABILITY_BROKEN",
  severity: "BLOCKING",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation: "The citation reference cannot be resolved to a traceable source.",
  stageAssociation: "Evidence Linkage",
};

export const VALID_ISSUE_SCOPE_VIOLATION: DraIssue = {
  id: "issue-ic9-001" as DraIssue["id"],
  issueClass: "SCOPE_VIOLATION",
  severity: "ADVISORY",
  affectedStatementIds: ["stmt-001" as DraIssue["affectedStatementIds"][0]],
  affectedEvidenceUnitIds: [],
  explanation:
    "Claim falls outside the stated scope of the document and is not flagged as out-of-scope.",
  stageAssociation: "Claim Extraction",
};

export const ALL_VALID_ISSUES: DraIssue[] = [
  VALID_ISSUE_UNSUPPORTED_CLAIM,
  VALID_ISSUE_AUTHORITY_EXPIRED,
  VALID_ISSUE_AUTHORITY_ABSENT,
  VALID_ISSUE_EVIDENCE_ABSENT,
  VALID_ISSUE_EVIDENCE_INADEQUATE,
  VALID_ISSUE_EVIDENCE_CONFLICT,
  VALID_ISSUE_CLAIM_INCONSISTENCY,
  VALID_ISSUE_TRACEABILITY_BROKEN,
  VALID_ISSUE_SCOPE_VIOLATION,
];

// ---------------------------------------------------------------------------
// Fixture: valid EvaluationRequest
// ---------------------------------------------------------------------------

export const VALID_EVALUATION_REQUEST: EvaluationRequest = {
  id: "eval-req-001" as EvaluationRequest["id"],
  generatedDocument: VALID_GENERATED_DOCUMENT,
  sourceDocuments: [VALID_SOURCE_DOCUMENT],
  requestedAt: T_REQUESTED,
  requesterMetadata: { requestedBy: "dra-eng-002-fixture" },
};

// ---------------------------------------------------------------------------
// Stage records fixture builder
// ---------------------------------------------------------------------------

/** Builds a minimal but valid set of 7 stage records in correct order. */
export function buildValidStageRecords(): StageRecord[] {
  return PIPELINE_STAGES.map((stageName, i) => ({
    stageNumber: (i + 1) as StageRecord["stageNumber"],
    stageName,
    output: { status: "FIXTURE_PLACEHOLDER", stageIndex: i + 1 },
  }));
}

// ---------------------------------------------------------------------------
// Fixture: valid ProofReceipt
// ---------------------------------------------------------------------------

export const VALID_PROOF_RECEIPT: ProofReceipt = {
  id: "receipt-001" as ProofReceipt["id"],
  evaluationRequestId: "eval-req-001" as ProofReceipt["evaluationRequestId"],
  evaluationResultId: "eval-result-001" as ProofReceipt["evaluationResultId"],
  schemaVersion: "0.1.0",
  documentIdentity: {
    generatedDocumentId: "gen-doc-001" as ProofReceipt["documentIdentity"]["generatedDocumentId"],
    generatedDocumentTitle: "AI-Generated Summary of Reference Standard",
    evaluatedAt: T_COMPLETED,
  },
  evaluatorIdentity: {
    evaluatorVersion: "0.1.0",
    commitIdentifier: "fixture-commit-abc123",
    pipelineVersion: "1.0",
  },
  stageOutputs: buildValidStageRecords(),
  issueRegister: [],
  issueSummary: { total: 0, blocking: 0, advisory: 0 },
  decision: "SUPPORTED",
  decisionRationale:
    "All seven pipeline stages completed without triggering any assurance issues. " +
    "All claims are substantiated by current authorities and traceable evidence.",
  timestamp: T_COMPLETED,
  // Placeholder digest for fixture: not a real SHA-256 of the receipt payload.
  // Use verifyReceiptIntegrity() only against receipts produced by buildProofReceipt().
  substantiveDigest: "a".repeat(64),
};

// ---------------------------------------------------------------------------
// Fixture: valid EvaluationResult
// ---------------------------------------------------------------------------

export const VALID_EVALUATION_RESULT: EvaluationResult = {
  id: "eval-result-001" as EvaluationResult["id"],
  evaluationRequestId: "eval-req-001" as EvaluationResult["evaluationRequestId"],
  schemaVersion: "0.1.0",
  decision: "SUPPORTED",
  issues: [],
  statements: [VALID_MATERIAL_STATEMENT],
  evidenceUnits: [VALID_EVIDENCE_UNIT],
  evidenceRelationships: [VALID_EVIDENCE_RELATIONSHIP],
  // Note: confidenceIndicators is not a canonical Version 1 field.
  // Deferred to DRA-ENG-008 (Confidence Scoring stage implementation).
  stageRecords: buildValidStageRecords(),
  proofReceipt: VALID_PROOF_RECEIPT,
  completedAt: T_COMPLETED,
  warnings: [],
};
