/**
 * DRA-001-04B — Eligibility Tests
 */

import { describe, it, expect } from "vitest";
import {
  buildContentPayload,
  computeContentDigest,
  checkEligibility,
  type CorpusCandidate,
  type ContentPayload,
} from "../eligibility.js";
import { buildMinimalProtocol, transitionProtocol } from "../schema.js";
import type { BenchmarkSelectionProtocol } from "../schema.js";

function approvedProtocol(): BenchmarkSelectionProtocol {
  return transitionProtocol(buildMinimalProtocol(), "APPROVED");
}

function validCandidate(overrides: Partial<CorpusCandidate> = {}): CorpusCandidate {
  return {
    corpusId: "DRA-DOC-0001",
    title: "Test Document",
    sourceType: "AI_GENERATED",
    documentType: "SUMMARY",
    domain: "GENERAL",
    language: "en",
    generator: "TestGenerator",
    creationMethod: "Single-pass generation",
    difficulty: "LOW",
    sourceReference: "internal:test",
    benchmarkStatus: "DRAFT",
    sourceContent: buildContentPayload("Source material text for testing.", "SOURCE"),
    generatedContent: buildContentPayload("Generated output for this document.", "GENERATED"),
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
    ...overrides,
  };
}

describe("checkEligibility — valid candidate", () => {
  it("returns ELIGIBLE for a fully valid candidate", () => {
    const result = checkEligibility(validCandidate(), approvedProtocol());
    expect(result.outcome).toBe("ELIGIBLE");
  });
});

describe("checkEligibility — content integrity", () => {
  it("returns CORRUPT_CONTENT when source content digest is wrong", () => {
    const bad: ContentPayload = {
      content: "Source material text for testing.",
      contentDigest: "x".repeat(64),
      contentType: "SOURCE",
      encoding: "utf-8",
    };
    const result = checkEligibility(validCandidate({ sourceContent: bad }), approvedProtocol());
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("CORRUPT_CONTENT");
  });

  it("returns CORRUPT_CONTENT when generated content digest is wrong", () => {
    const bad: ContentPayload = {
      content: "Generated output.",
      contentDigest: "y".repeat(64),
      contentType: "GENERATED",
      encoding: "utf-8",
    };
    const result = checkEligibility(validCandidate({ generatedContent: bad }), approvedProtocol());
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("CORRUPT_CONTENT");
  });
});

describe("checkEligibility — domain, type, source, language", () => {
  it("returns OUT_OF_SCOPE_DOMAIN for a disallowed domain", () => {
    const protocol = buildMinimalProtocol({
      permittedDomains: ["LEGAL"],
      domainAllocationTargets: { LEGAL: 2, BUSINESS: 2, TECHNICAL: 1, HEALTHCARE: 1 },
    });
    const approved = transitionProtocol(protocol, "APPROVED");
    const result = checkEligibility(validCandidate({ domain: "GENERAL" }), approved);
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("OUT_OF_SCOPE_DOMAIN");
  });

  it("returns OUT_OF_SCOPE_DOCUMENT_TYPE for a disallowed document type", () => {
    const protocol = buildMinimalProtocol({
      permittedDocumentTypes: ["REPORT"],
      documentTypeAllocationTargets: { REPORT: 4, POLICY: 2 },
    });
    const approved = transitionProtocol(protocol, "APPROVED");
    const result = checkEligibility(validCandidate({ documentType: "SUMMARY" }), approved);
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("OUT_OF_SCOPE_DOCUMENT_TYPE");
  });

  it("returns DISALLOWED_SOURCE_TYPE for a disallowed source type", () => {
    const protocol = buildMinimalProtocol({
      permittedSourceTypes: ["HUMAN_AUTHORED"],
      domainAllocationTargets: { GENERAL: 1, BUSINESS: 1, TECHNICAL: 1, LEGAL: 1, HEALTHCARE: 1, FINANCE: 1 },
    });
    const approved = transitionProtocol(protocol, "APPROVED");
    const result = checkEligibility(validCandidate({ sourceType: "AI_GENERATED" }), approved);
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("DISALLOWED_SOURCE_TYPE");
  });

  it("returns DISALLOWED_LANGUAGE for a disallowed language", () => {
    const result = checkEligibility(
      validCandidate({ language: "fr" }),
      approvedProtocol(),
    );
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("DISALLOWED_LANGUAGE");
  });
});

describe("checkEligibility — governance flags", () => {
  it("returns EVALUATOR_INFLUENCED_SELECTION when evaluatorInfluenced=true", () => {
    const result = checkEligibility(
      validCandidate({ evaluatorInfluenced: true }),
      approvedProtocol(),
    );
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("EVALUATOR_INFLUENCED_SELECTION");
  });

  it("returns PREANNOTATED_OUTCOME when hasPreannotatedOutcome=true", () => {
    const result = checkEligibility(
      validCandidate({ hasPreannotatedOutcome: true }),
      approvedProtocol(),
    );
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("PREANNOTATED_OUTCOME");
  });

  it("returns UNVERIFIABLE_SOURCE when sourceVerifiable=false", () => {
    const result = checkEligibility(
      validCandidate({ sourceVerifiable: false }),
      approvedProtocol(),
    );
    expect(result.outcome).toBe("INELIGIBLE");
    if (result.outcome === "INELIGIBLE") expect(result.reason).toBe("UNVERIFIABLE_SOURCE");
  });
});
