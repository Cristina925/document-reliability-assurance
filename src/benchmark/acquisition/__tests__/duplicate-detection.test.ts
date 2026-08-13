/**
 * DRA-001-04C — Duplicate Detection in Acquisition Context
 *
 * Tests that the full acquisition + governance admission pipeline correctly
 * rejects exact and near-duplicate documents before they enter the corpus.
 */

import { describe, it, expect } from "vitest";
import { AcquisitionPipeline } from "../pipeline.js";
import type { AcquisitionInput } from "../pipeline.js";
import { AdmissionRegistry } from "../../governance/admissions.js";
import { AllocationTracker } from "../../governance/allocation.js";
import { buildMinimalProtocol, transitionProtocol } from "../../governance/schema.js";

const PROTOCOL = transitionProtocol(buildMinimalProtocol(), "APPROVED");

function input(domain: AcquisitionInput["domain"], docType: AcquisitionInput["documentType"], difficulty: AcquisitionInput["difficulty"], text: string): AcquisitionInput {
  return {
    originalFilename: "doc.txt",
    acquisitionSource: "SYNTHETIC",
    documentOrigin: "internal:test",
    licenceStatus: "INTERNAL",
    acquisitionDate: "2026-07-27T00:00:00.000Z",
    title: "Test",
    domain,
    documentType: docType,
    difficulty,
    sourceType: "AI_GENERATED",
    language: "en",
    generator: "G",
    creationMethod: "test",
    sourceReference: "r",
    benchmarkStatus: "DRAFT",
    sourceText: `Source: ${text}`,
    generatedText: text,
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
  };
}

describe("Exact-duplicate detection via admission pipeline", () => {
  it("rejects a second document with identical generated content", () => {
    const pipeline = new AcquisitionPipeline();
    const admissionRegistry = new AdmissionRegistry();
    const tracker = new AllocationTracker(PROTOCOL);

    const content = "The economic impact of global trade agreements on domestic manufacturing industries and employment patterns across developed nations provides compelling insights into comparative advantage theory.";

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW", content));
    const doc2 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM", content)); // identical generated text

    const r1 = admissionRegistry.admit(doc1, PROTOCOL, tracker);
    const r2 = admissionRegistry.admit(doc2, PROTOCOL, tracker);

    expect(r1.decision).toBe("ADMITTED");
    expect(r2.decision).toBe("REJECTED");
    expect(r2.exclusionReasons).toContain("DUPLICATE_CONTENT");
  });

  it("admits a document with different generated content after an exact duplicate is rejected", () => {
    const pipeline = new AcquisitionPipeline();
    const admissionRegistry = new AdmissionRegistry();
    const tracker = new AllocationTracker(PROTOCOL);

    const content = "Machine learning algorithms require careful hyperparameter tuning and cross-validation to prevent overfitting on the training dataset while maintaining generalisation.";
    const different = "Regulatory frameworks governing financial derivatives markets impose margin requirements and reporting obligations that significantly affect trading strategies of institutional investors.";

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW", content));
    const doc2 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW", content));    // exact dup
    const doc3 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM", different));

    admissionRegistry.admit(doc1, PROTOCOL, tracker);
    const r2 = admissionRegistry.admit(doc2, PROTOCOL, tracker);
    const r3 = admissionRegistry.admit(doc3, PROTOCOL, tracker);

    expect(r2.decision).toBe("REJECTED");
    expect(r3.decision).toBe("ADMITTED");
  });
});

describe("Near-duplicate detection via admission pipeline", () => {
  it("rejects a document whose content is nearly identical to an admitted one", () => {
    const pipeline = new AcquisitionPipeline();
    const admissionRegistry = new AdmissionRegistry();
    const tracker = new AllocationTracker(PROTOCOL);

    // Two texts that differ in only two words — Jaccard similarity will be very high
    const base = "Healthcare data privacy regulations mandate strict access controls and audit logging for patient records stored in electronic health information systems across hospital networks.";
    const nearDup = "Healthcare data privacy regulations mandate strict access controls and audit logging for patient records stored in electronic health information systems across clinical networks.";

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW", base));
    const doc2 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM", nearDup));

    const r1 = admissionRegistry.admit(doc1, PROTOCOL, tracker);
    const r2 = admissionRegistry.admit(doc2, PROTOCOL, tracker);

    expect(r1.decision).toBe("ADMITTED");
    // Near-duplicate OR exact-duplicate depending on exact 3-gram overlap
    expect(["REJECTED"]).toContain(r2.decision);
    if (r2.decision === "REJECTED") {
      const isNearOrExact = r2.exclusionReasons.includes("NEAR_DUPLICATE_CONTENT") || r2.exclusionReasons.includes("DUPLICATE_CONTENT");
      expect(isNearOrExact).toBe(true);
    }
  });

  it("admits a document with sufficiently different content", () => {
    const pipeline = new AcquisitionPipeline();
    const admissionRegistry = new AdmissionRegistry();
    const tracker = new AllocationTracker(PROTOCOL);

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW",
      "Photosynthesis is the biological process by which plants convert sunlight into chemical energy stored in glucose molecules through complex biochemical reaction pathways."));
    const doc2 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM",
      "International arbitration proceedings offer neutral dispute resolution for cross-border commercial contracts by applying agreed procedural rules through appointed independent arbitrators."));

    admissionRegistry.admit(doc1, PROTOCOL, tracker);
    const r2 = admissionRegistry.admit(doc2, PROTOCOL, tracker);

    expect(r2.decision).toBe("ADMITTED");
  });
});

describe("Corpus-level duplicate screening via validateCorpus", () => {
  it("validateCorpus catches near-duplicates not screened by admission (post-hoc validation)", async () => {
    const { validateCorpus } = await import("../corpus-validator.js");
    const pipeline = new AcquisitionPipeline();

    const base = "Supply chain logistics optimisation requires balancing inventory holding costs with order fulfilment speed across distribution networks serving multiple regional warehouses and retail outlets.";
    const nearDup = "Supply chain logistics optimisation requires balancing inventory holding costs with order fulfilment speed across distribution networks serving multiple regional warehouses and retail centres.";

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW", base));
    const doc2 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM", nearDup));

    const result = validateCorpus([doc1, doc2], PROTOCOL);
    const check = result.checks.find((c) => c.name === "nearDuplicates")!;
    expect(check.passed).toBe(false);
  });

  it("validateCorpus passes nearDuplicates for clearly distinct content", async () => {
    const { validateCorpus } = await import("../corpus-validator.js");
    const pipeline = new AcquisitionPipeline();

    const doc1 = pipeline.acquire(input("GENERAL", "SUMMARY", "LOW",
      "Quantum computing leverages superposition and entanglement to perform computations on multiple states simultaneously, offering exponential speedup for specific cryptographic problem classes."));
    const doc2 = pipeline.acquire(input("BUSINESS", "REPORT", "MEDIUM",
      "Medieval European guild systems regulated craft production through apprenticeship hierarchies, quality standards, and monopoly protections that structured pre-industrial urban economies for centuries."));

    const result = validateCorpus([doc1, doc2], PROTOCOL);
    const check = result.checks.find((c) => c.name === "nearDuplicates")!;
    expect(check.passed).toBe(true);
  });
});
