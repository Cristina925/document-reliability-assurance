/**
 * DRA-001-04C — Freeze Integration Test
 *
 * Full end-to-end test of the initial corpus population workflow:
 *
 *   1. Define a selection protocol.
 *   2. Acquire 6 documents through the acquisition pipeline.
 *   3. Run each through the governance admission workflow.
 *   4. Record each in the candidate registry.
 *   5. Add admitted documents to the corpus registry.
 *   6. Validate the corpus (all 6 checks).
 *   7. Freeze the corpus at DRA-CORPUS-1.0.0.
 *   8. Verify the freeze record.
 *   9. Generate all 5 reports.
 *  10. Assert success criteria.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { AcquisitionPipeline } from "../pipeline.js";
import type { AcquiredDocument } from "../pipeline.js";
import { CandidateRegistry } from "../candidate-registry.js";
import { validateCorpus } from "../corpus-validator.js";
import {
  generateInitialCorpusReport,
  generateStatisticsReport,
  generateProvenanceReport,
  generateValidationReport,
  generateFreezeReport,
} from "../reports.js";
import { AdmissionRegistry } from "../../governance/admissions.js";
import { AllocationTracker } from "../../governance/allocation.js";
import { buildMinimalProtocol, transitionProtocol } from "../../governance/schema.js";
import { freezeCorpus, verifyCorpusFreeze } from "../../governance/freeze.js";
import { INITIAL_CORPUS_VERSION } from "../../governance/version.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import type { FreezeRecord } from "../../governance/freeze.js";
import type { CorpusValidationResult } from "../corpus-validator.js";

// ---------------------------------------------------------------------------
// Shared state built once in beforeAll
// ---------------------------------------------------------------------------

const PROTOCOL = transitionProtocol(buildMinimalProtocol(), "APPROVED");
const CORPUS_VERSION = INITIAL_CORPUS_VERSION;
const FIXED_TS = "2026-07-27T00:00:00.000Z";

// Six documents satisfying the buildMinimalProtocol allocation exactly:
//   Domain:      GENERAL, BUSINESS, TECHNICAL, LEGAL, HEALTHCARE, FINANCE  (1 each)
//   DocType:     SUMMARY×2, REPORT×2, POLICY×2
//   Difficulty:  LOW×2, MEDIUM×2, HIGH×2
const DOC_BLUEPRINTS = [
  {
    domain: "GENERAL",    docType: "SUMMARY", difficulty: "LOW",
    source: "Carbon capture and storage technologies are essential components of climate mitigation strategies, removing atmospheric carbon dioxide for long-term geological sequestration.",
    generated: "Carbon capture technologies remove atmospheric carbon dioxide for geological sequestration, playing a critical role in global climate change mitigation efforts and net-zero strategies.",
  },
  {
    domain: "BUSINESS",   docType: "REPORT",  difficulty: "MEDIUM",
    source: "Mergers and acquisitions in the pharmaceutical sector frequently create economies of scale while raising antitrust concerns about reduced market competition and drug pricing.",
    generated: "Pharmaceutical mergers create economies of scale and raise antitrust concerns about market concentration, affecting drug pricing and access for patients across healthcare systems globally.",
  },
  {
    domain: "TECHNICAL",  docType: "POLICY",  difficulty: "HIGH",
    source: "Zero-trust network architecture eliminates implicit trust by requiring continuous verification of every user, device and connection regardless of network location or prior authentication.",
    generated: "Zero-trust architecture requires continuous verification of users, devices and connections regardless of network location, enforcing least-privilege access through identity-centric security controls.",
  },
  {
    domain: "LEGAL",      docType: "SUMMARY", difficulty: "MEDIUM",
    source: "Intellectual property licensing agreements must clearly define the scope, duration, territory, exclusivity and royalty structures to prevent future disputes between licensors and licensees.",
    generated: "Intellectual property licences require precise definition of scope, duration, territory, exclusivity terms and royalty structures to provide legal certainty and prevent commercial disputes.",
  },
  {
    domain: "HEALTHCARE", docType: "REPORT",  difficulty: "HIGH",
    source: "Antibiotic resistance poses a global public health threat requiring stewardship programmes, novel drug development pipelines and international coordination to preserve antimicrobial efficacy.",
    generated: "Antimicrobial resistance requires stewardship programmes and coordinated international responses to slow resistance development, combined with novel drug discovery to preserve treatment options.",
  },
  {
    domain: "FINANCE",    docType: "POLICY",  difficulty: "LOW",
    source: "Retail banking deposit insurance schemes protect consumer savings up to defined limits, maintaining public confidence in the financial system during periods of banking sector stress.",
    generated: "Deposit insurance schemes protect retail savings up to statutory limits, preserving public confidence in banking institutions and reducing the risk of bank runs during financial crises.",
  },
] as const;

// Results populated by beforeAll
let acquiredDocs: AcquiredDocument[];
let candidateRegistry: CandidateRegistry;
let admittedDocs: AcquiredDocument[];
let corpusRegistry: CorpusRegistry;
let validationResult: CorpusValidationResult;
let freezeRecord: FreezeRecord;
let freezeVerified: boolean;

beforeAll(() => {
  const pipeline = new AcquisitionPipeline();
  const admissionRegistry = new AdmissionRegistry();
  const tracker = new AllocationTracker(PROTOCOL);
  candidateRegistry = new CandidateRegistry();
  corpusRegistry = new CorpusRegistry();
  acquiredDocs = [];
  admittedDocs = [];

  for (const bp of DOC_BLUEPRINTS) {
    const doc = pipeline.acquire({
      originalFilename: `${bp.domain.toLowerCase()}_${bp.docType.toLowerCase()}.txt`,
      acquisitionSource: "SYNTHETIC",
      documentOrigin: "internal:integration-test",
      licenceStatus: "INTERNAL",
      acquisitionDate: FIXED_TS,
      title: `${bp.domain} ${bp.docType}`,
      domain: bp.domain,
      documentType: bp.docType,
      difficulty: bp.difficulty,
      sourceType: "AI_GENERATED",
      language: "en",
      generator: "DRA-TestGen-1.0",
      creationMethod: "Integration test fixture",
      sourceReference: `internal:${bp.domain.toLowerCase()}`,
      benchmarkStatus: "DRAFT",
      sourceText: bp.source,
      generatedText: bp.generated,
      evaluatorInfluenced: false,
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    });

    acquiredDocs.push(doc);

    const admissionRecord = admissionRegistry.admit(doc, PROTOCOL, tracker, {
      timestamp: FIXED_TS,
    });

    candidateRegistry.record({
      document: doc,
      decision: admissionRecord.decision,
      exclusionReasons: [...admissionRecord.exclusionReasons],
      reasons: [...admissionRecord.reasons],
      corpusVersion: CORPUS_VERSION,
      timestamp: FIXED_TS,
    });

    if (admissionRecord.decision === "ADMITTED") {
      admittedDocs.push(doc);
      corpusRegistry.add(doc);
    }
  }

  validationResult = validateCorpus(admittedDocs, PROTOCOL);

  const freeze = freezeCorpus(
    corpusRegistry,
    PROTOCOL,
    tracker.snapshot(),
    CORPUS_VERSION,
    { timestamp: FIXED_TS },
  );
  freezeRecord = freeze.freezeRecord;
  freezeVerified = verifyCorpusFreeze(freezeRecord);
});

// ---------------------------------------------------------------------------
// Acquisition pipeline results
// ---------------------------------------------------------------------------

describe("Integration — acquisition pipeline", () => {
  it("acquires all 6 documents without error", () => {
    expect(acquiredDocs).toHaveLength(6);
  });

  it("assigns sequential corpus IDs DRA-DOC-0001 through DRA-DOC-0006", () => {
    const ids = acquiredDocs.map((d) => d.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003",
      "DRA-DOC-0004", "DRA-DOC-0005", "DRA-DOC-0006",
    ]);
  });

  it("all content payloads pass integrity verification", async () => {
    const { verifyContentIntegrity } = await import("../../governance/eligibility.js");
    for (const doc of acquiredDocs) {
      expect(verifyContentIntegrity(doc.sourceContent)).toBe(true);
      expect(verifyContentIntegrity(doc.generatedContent)).toBe(true);
    }
  });

  it("all provenance records are authentic", async () => {
    const { verifyProvenanceIntegrity } = await import("../provenance.js");
    for (const doc of acquiredDocs) {
      expect(verifyProvenanceIntegrity(doc.provenance)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Admission results
// ---------------------------------------------------------------------------

describe("Integration — governance admission", () => {
  it("all 6 documents are admitted", () => {
    expect(admittedDocs).toHaveLength(6);
    expect(candidateRegistry.admittedCount()).toBe(6);
    expect(candidateRegistry.rejectedCount()).toBe(0);
  });

  it("candidate registry records all 6 entries", () => {
    expect(candidateRegistry.totalCount()).toBe(6);
  });

  it("all candidate registry entries have authentic entryDigests", () => {
    for (const entry of candidateRegistry.list()) {
      expect(entry.entryDigest).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(entry.entryDigest)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Corpus validation
// ---------------------------------------------------------------------------

describe("Integration — corpus validation", () => {
  it("all 6 checks pass", () => {
    expect(validationResult.ok).toBe(true);
    expect(validationResult.failedCheckNames).toHaveLength(0);
  });

  it("eligibility check passes", () => {
    const check = validationResult.checks.find((c) => c.name === "eligibility")!;
    expect(check.passed).toBe(true);
  });

  it("uniqueIds check passes", () => {
    expect(validationResult.checks.find((c) => c.name === "uniqueIds")!.passed).toBe(true);
  });

  it("uniqueDigests check passes", () => {
    expect(validationResult.checks.find((c) => c.name === "uniqueDigests")!.passed).toBe(true);
  });

  it("nearDuplicates check passes", () => {
    expect(validationResult.checks.find((c) => c.name === "nearDuplicates")!.passed).toBe(true);
  });

  it("provenance check passes", () => {
    expect(validationResult.checks.find((c) => c.name === "provenance")!.passed).toBe(true);
  });

  it("allocation check passes", () => {
    expect(validationResult.checks.find((c) => c.name === "allocation")!.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Corpus freeze
// ---------------------------------------------------------------------------

describe("Integration — corpus freeze", () => {
  it("freeze record has corpusVersion DRA-CORPUS-1.0.0", () => {
    expect(freezeRecord.corpusVersion).toBe("DRA-CORPUS-1.0.0");
  });

  it("freeze record has documentCount=6", () => {
    expect(freezeRecord.documentCount).toBe(6);
  });

  it("freeze record freezeStatus is FROZEN", () => {
    expect(freezeRecord.freezeStatus).toBe("FROZEN");
  });

  it("freezeDigest is 64-char hex", () => {
    expect(freezeRecord.freezeDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(freezeRecord.freezeDigest)).toBe(true);
  });

  it("verifyCorpusFreeze returns true", () => {
    expect(freezeVerified).toBe(true);
  });

  it("canonicalDocumentIds contains all 6 IDs", () => {
    expect(freezeRecord.canonicalDocumentIds).toHaveLength(6);
    expect(freezeRecord.canonicalDocumentIds).toContain("DRA-DOC-0001");
    expect(freezeRecord.canonicalDocumentIds).toContain("DRA-DOC-0006");
  });
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

describe("Integration — reports", () => {
  it("Initial Corpus Report has correct counts", () => {
    const report = generateInitialCorpusReport(candidateRegistry, PROTOCOL, CORPUS_VERSION, { timestamp: FIXED_TS });
    expect(report.admittedCount).toBe(6);
    expect(report.rejectedCount).toBe(0);
    expect(report.corpusVersion).toBe(CORPUS_VERSION);
  });

  it("Statistics Report has 6 distinct domain entries", () => {
    const report = generateStatisticsReport(admittedDocs, PROTOCOL, CORPUS_VERSION, { timestamp: FIXED_TS });
    expect(report.totalDocuments).toBe(6);
    expect(report.byDomain).toHaveLength(6);
  });

  it("Provenance Report is fully complete and verified", () => {
    const report = generateProvenanceReport(admittedDocs, CORPUS_VERSION, { timestamp: FIXED_TS });
    expect(report.allComplete).toBe(true);
    expect(report.totalEntries).toBe(6);
    for (const entry of report.entries) {
      expect(entry.integrityVerified).toBe(true);
    }
  });

  it("Validation Report shows PASS", () => {
    const report = generateValidationReport(validationResult, CORPUS_VERSION, { timestamp: FIXED_TS });
    expect(report.overallResult).toBe("PASS");
    expect(report.failedChecks).toBe(0);
  });

  it("Freeze Report shows freezeVerified=true and documentCount=6", () => {
    const report = generateFreezeReport(freezeRecord, freezeVerified, { timestamp: FIXED_TS });
    expect(report.freezeVerified).toBe(true);
    expect(report.documentCount).toBe(6);
    expect(report.corpusVersion).toBe(CORPUS_VERSION);
  });
});
