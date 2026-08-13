/**
 * DRA-001-04C — Reports Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateInitialCorpusReport,
  generateStatisticsReport,
  generateProvenanceReport,
  generateValidationReport,
  generateFreezeReport,
} from "../reports.js";
import { CandidateRegistry } from "../candidate-registry.js";
import { AcquisitionPipeline } from "../pipeline.js";
import { validateCorpus } from "../corpus-validator.js";
import { buildMinimalProtocol, transitionProtocol } from "../../governance/schema.js";
import { INITIAL_CORPUS_VERSION } from "../../governance/version.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { freezeCorpus, verifyCorpusFreeze } from "../../governance/freeze.js";
import { AllocationTracker } from "../../governance/allocation.js";
import type { AcquiredDocument } from "../pipeline.js";

const PROTOCOL = transitionProtocol(buildMinimalProtocol(), "APPROVED");
const VERSION = INITIAL_CORPUS_VERSION;
const TS = "2026-07-27T00:00:00.000Z";

function makeDocs(count: number): AcquiredDocument[] {
  const DOMAINS = ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"] as const;
  const DOC_TYPES = ["SUMMARY", "SUMMARY", "REPORT", "REPORT", "POLICY", "POLICY"] as const;
  const DIFFICULTIES = ["LOW", "MEDIUM", "HIGH", "MEDIUM", "HIGH", "LOW"] as const;
  const TEXTS = [
    "Renewable energy transition policies across developed nations focus on grid modernisation, storage technology and carbon pricing mechanisms to achieve net-zero emissions targets.",
    "Digital transformation strategies in financial services leverage cloud computing, application programming interfaces and data analytics to improve operational efficiency and customer experience.",
    "Distributed system reliability patterns include circuit breakers, retry logic with exponential backoff, and bulkhead isolation to prevent cascading failures across microservice architectures.",
    "Fiduciary duty obligations in trust law require trustees to act solely in beneficiaries' interests, maintain accurate accounts and avoid conflicts of interest when managing trust assets.",
    "Evidence-based clinical guidelines for chronic disease management integrate patient-reported outcomes with diagnostic biomarkers to personalise treatment protocols and reduce hospital readmissions.",
    "Fixed income portfolio duration management strategies use interest rate derivatives to hedge against yield curve shifts affecting bond valuations across multiple maturity buckets.",
  ];
  const pipeline = new AcquisitionPipeline();
  return Array.from({ length: count }, (_, i) =>
    pipeline.acquire({
      originalFilename: `doc_${i}.txt`,
      acquisitionSource: "SYNTHETIC",
      documentOrigin: "internal:fixture",
      licenceStatus: "INTERNAL",
      acquisitionDate: TS,
      title: `Document ${i}`,
      domain: DOMAINS[i % 6]!,
      documentType: DOC_TYPES[i % 6]!,
      difficulty: DIFFICULTIES[i % 6]!,
      sourceType: "AI_GENERATED",
      language: "en",
      generator: "TestGen",
      creationMethod: "automated",
      sourceReference: "internal",
      benchmarkStatus: "DRAFT",
      sourceText: `Source for doc ${i}: ${TEXTS[i % 6]!}`,
      generatedText: TEXTS[i % 6]!,
      evaluatorInfluenced: false,
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    }),
  );
}

// ---------------------------------------------------------------------------
// generateInitialCorpusReport
// ---------------------------------------------------------------------------

describe("generateInitialCorpusReport", () => {
  it("returns correct admitted and rejected counts", () => {
    const docs = makeDocs(6);
    const registry = new CandidateRegistry();
    docs.forEach((d) => registry.record({ document: d, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION }));
    const doc7 = new AcquisitionPipeline(100).acquire({ originalFilename: "r.txt", acquisitionSource: "SYNTHETIC", documentOrigin: "x", licenceStatus: "INTERNAL", acquisitionDate: TS, title: "R", domain: "GENERAL", documentType: "SUMMARY", difficulty: "LOW", sourceType: "AI_GENERATED", language: "en", generator: "G", creationMethod: "t", sourceReference: "r", benchmarkStatus: "DRAFT", sourceText: "Rejected source material for testing.", generatedText: "Rejected doc unique content for testing the initial corpus report generation.", evaluatorInfluenced: false, hasPreannotatedOutcome: false, sourceVerifiable: true });
    registry.record({ document: doc7, decision: "REJECTED", exclusionReasons: ["DUPLICATE_CONTENT"], reasons: ["dup"], corpusVersion: VERSION });

    const report = generateInitialCorpusReport(registry, PROTOCOL, VERSION, { timestamp: TS });
    expect(report.admittedCount).toBe(6);
    expect(report.rejectedCount).toBe(1);
    expect(report.totalProcessed).toBe(7);
    expect(report.corpusVersion).toBe(VERSION);
    expect(report.title).toBe("DRA-001 Initial Corpus Report");
    expect(report.generatedAt).toBe(TS);
  });

  it("protocolId and protocolVersion are populated", () => {
    const registry = new CandidateRegistry();
    const report = generateInitialCorpusReport(registry, PROTOCOL, VERSION, { timestamp: TS });
    expect(report.protocolId).toBeDefined();
    expect(typeof report.protocolId).toBe("string");
    expect(report.protocolVersion).toBe(PROTOCOL.protocolVersion);
  });
});

// ---------------------------------------------------------------------------
// generateStatisticsReport
// ---------------------------------------------------------------------------

describe("generateStatisticsReport", () => {
  it("totalDocuments matches the number of documents", () => {
    const docs = makeDocs(6);
    const report = generateStatisticsReport(docs, PROTOCOL, VERSION, { timestamp: TS });
    expect(report.totalDocuments).toBe(6);
  });

  it("byDomain has one entry per domain present", () => {
    const docs = makeDocs(6);
    const report = generateStatisticsReport(docs, PROTOCOL, VERSION, { timestamp: TS });
    expect(report.byDomain).toHaveLength(6);
    const domains = report.byDomain.map((d) => d.dimension);
    expect(domains).toContain("GENERAL");
    expect(domains).toContain("FINANCE");
  });

  it("domain percentages sum to 100 (within rounding)", () => {
    const docs = makeDocs(6);
    const report = generateStatisticsReport(docs, PROTOCOL, VERSION, { timestamp: TS });
    const sum = report.byDomain.reduce((acc, d) => acc + d.percentage, 0);
    expect(Math.round(sum)).toBe(100);
  });

  it("byDocumentType is sorted alphabetically", () => {
    const docs = makeDocs(6);
    const report = generateStatisticsReport(docs, PROTOCOL, VERSION, { timestamp: TS });
    const dims = report.byDocumentType.map((d) => d.dimension);
    expect(dims).toEqual([...dims].sort());
  });

  it("target fields are present when protocol specifies them", () => {
    const docs = makeDocs(6);
    const report = generateStatisticsReport(docs, PROTOCOL, VERSION, { timestamp: TS });
    const generalEntry = report.byDomain.find((d) => d.dimension === "GENERAL");
    expect(generalEntry?.target).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// generateProvenanceReport
// ---------------------------------------------------------------------------

describe("generateProvenanceReport", () => {
  it("has one entry per document", () => {
    const docs = makeDocs(6);
    const report = generateProvenanceReport(docs, VERSION, { timestamp: TS });
    expect(report.totalEntries).toBe(6);
    expect(report.entries).toHaveLength(6);
  });

  it("allComplete is true when all provenance records are authentic", () => {
    const docs = makeDocs(6);
    const report = generateProvenanceReport(docs, VERSION, { timestamp: TS });
    expect(report.allComplete).toBe(true);
  });

  it("each entry carries originalFilename and provenanceDigest", () => {
    const docs = makeDocs(1);
    const report = generateProvenanceReport(docs, VERSION, { timestamp: TS });
    expect(report.entries[0]!.originalFilename).toBe("doc_0.txt");
    expect(report.entries[0]!.provenanceDigest).toHaveLength(64);
    expect(report.entries[0]!.integrityVerified).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// generateValidationReport
// ---------------------------------------------------------------------------

describe("generateValidationReport", () => {
  it("overallResult is PASS for a valid corpus", () => {
    const docs = makeDocs(6);
    const validationResult = validateCorpus(docs, PROTOCOL);
    const report = generateValidationReport(validationResult, VERSION, { timestamp: TS });
    expect(report.overallResult).toBe("PASS");
    expect(report.failedChecks).toBe(0);
    expect(report.passedChecks).toBeGreaterThan(0);
  });

  it("overallResult is FAIL when validation fails", () => {
    const validationResult = validateCorpus([], PROTOCOL); // empty → allocation fails
    const report = generateValidationReport(validationResult, VERSION, { timestamp: TS });
    expect(report.overallResult).toBe("FAIL");
    expect(report.failedChecks).toBeGreaterThan(0);
  });

  it("checks have name, passed, details, failureCount", () => {
    const validationResult = validateCorpus(makeDocs(6), PROTOCOL);
    const report = generateValidationReport(validationResult, VERSION, { timestamp: TS });
    for (const check of report.checks) {
      expect(typeof check.name).toBe("string");
      expect(typeof check.passed).toBe("boolean");
      expect(typeof check.details).toBe("string");
      expect(typeof check.failureCount).toBe("number");
    }
  });
});

// ---------------------------------------------------------------------------
// generateFreezeReport
// ---------------------------------------------------------------------------

describe("generateFreezeReport", () => {
  it("freezeVerified=true for an authentic freeze record", () => {
    const docs = makeDocs(6);
    const corpusRegistry = new CorpusRegistry();
    docs.forEach((d) => corpusRegistry.add(d));
    const tracker = new AllocationTracker(PROTOCOL);
    docs.forEach((d) => tracker.recordAdmission(d));
    const { freezeRecord } = freezeCorpus(corpusRegistry, PROTOCOL, tracker.snapshot(), VERSION);
    const verified = verifyCorpusFreeze(freezeRecord);
    const report = generateFreezeReport(freezeRecord, verified, { timestamp: TS });
    expect(report.freezeVerified).toBe(true);
    expect(report.documentCount).toBe(6);
    expect(report.freezeDigest).toHaveLength(64);
    expect(report.manifestDigest).toHaveLength(64);
    expect(report.canonicalDocumentIds).toHaveLength(6);
  });

  it("corpusVersion is carried from the freeze record", () => {
    const docs = makeDocs(6);
    const corpusRegistry = new CorpusRegistry();
    docs.forEach((d) => corpusRegistry.add(d));
    const { freezeRecord } = freezeCorpus(corpusRegistry, PROTOCOL, new AllocationTracker(PROTOCOL).snapshot(), VERSION);
    const report = generateFreezeReport(freezeRecord, true, { timestamp: TS });
    expect(report.corpusVersion).toBe(VERSION);
  });
});
