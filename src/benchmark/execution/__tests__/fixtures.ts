/**
 * Shared test fixtures for DRA-001-06 benchmark execution tests.
 */

import { CorpusRegistry } from "../../corpus/registry.js";
import type { CorpusDocument } from "../../corpus/schema.js";
import type { BenchmarkExecutionDocument } from "../runner.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

export const FIXED_TS = "2026-07-27T12:00:00.000Z";
export const FIXED_RUN_ID = "run-test-001";
export const FIXED_SESSION_ID = "session-test-001";
export const FIXED_REGISTER_ID = "register-test-001";

// ---------------------------------------------------------------------------
// Corpus documents (built via registry so integrityDigest is real)
// ---------------------------------------------------------------------------

function buildCorpusDoc(
  corpusId: string,
  title: string,
  domain: "GENERAL" | "TECHNICAL" | "LEGAL" | "BUSINESS" | "HEALTHCARE" | "FINANCE",
): CorpusDocument {
  const registry = new CorpusRegistry();
  return registry.add({
    corpusId: corpusId as `DRA-DOC-${string}`,
    title,
    sourceType: "AI_GENERATED",
    documentType: "REPORT",
    domain,
    language: "en",
    generator: "TestGen",
    creationMethod: "automated-test",
    difficulty: "MEDIUM",
    sourceReference: `ref-${corpusId}`,
    benchmarkStatus: "FROZEN",
  });
}

export const CORPUS_DOC_1: CorpusDocument = buildCorpusDoc(
  "DRA-DOC-0001",
  "Safety Management System Compliance Report",
  "TECHNICAL",
);

export const CORPUS_DOC_2: CorpusDocument = buildCorpusDoc(
  "DRA-DOC-0002",
  "Business Risk Assessment Summary",
  "BUSINESS",
);

export const CORPUS_DOC_3: CorpusDocument = buildCorpusDoc(
  "DRA-DOC-0003",
  "Regulatory Compliance Audit Report",
  "LEGAL",
);

// ---------------------------------------------------------------------------
// BenchmarkExecutionDocuments with content
// ---------------------------------------------------------------------------

export const EXEC_DOC_1: BenchmarkExecutionDocument = {
  corpusDocument: CORPUS_DOC_1,
  generatedText:
    "The safety management system ensures compliance with ISO 31000:2018 risk management standards. " +
    "All control measures were verified by certified quality personnel. " +
    "The risk assessment was completed in accordance with applicable regulatory requirements. " +
    "Personnel training records confirm certification is current.",
  sourceText:
    "ISO 31000:2018 provides guidance on risk management principles and implementation. " +
    "Organisations must document control measures and verify their effectiveness. " +
    "Regulatory requirements mandate annual risk assessments for safety-critical processes. " +
    "Personnel must maintain certification records.",
};

export const EXEC_DOC_2: BenchmarkExecutionDocument = {
  corpusDocument: CORPUS_DOC_2,
  generatedText:
    "The business continuity plan was reviewed by the risk committee on 2026-01-15. " +
    "Financial exposure is limited to ten percent of annual revenue under section 4.2. " +
    "All identified risks have been mitigated using the approved risk treatment framework. " +
    "The board approved the risk appetite statement in accordance with governance requirements.",
  sourceText:
    "Business continuity plans must be reviewed annually by a qualified risk committee. " +
    "Financial exposure limits should not exceed ten percent of annual revenue. " +
    "Risk treatment frameworks provide structured mitigation approaches. " +
    "Board approval of risk appetite is required by corporate governance standards.",
};

export const EXEC_DOC_3: BenchmarkExecutionDocument = {
  corpusDocument: CORPUS_DOC_3,
  generatedText:
    "The audit confirms full compliance with GDPR Article 32 security requirements. " +
    "Data processing activities were assessed against current regulatory standards. " +
    "All findings from the previous audit have been remediated as of 2026-03-01. " +
    "The organisation maintains a documented record of processing activities.",
  sourceText:
    "GDPR Article 32 requires technical and organisational security measures. " +
    "Data processing assessments must be conducted against applicable standards. " +
    "Previous audit findings must be tracked to closure. " +
    "Records of processing activities must be maintained and updated.",
};

export const ALL_EXEC_DOCS: readonly BenchmarkExecutionDocument[] = [
  EXEC_DOC_1,
  EXEC_DOC_2,
  EXEC_DOC_3,
];
