/**
 * DRA-001-04C — Candidate Registry Tests
 */

import { describe, it, expect } from "vitest";
import { CandidateRegistry, computeEntryDigest } from "../candidate-registry.js";
import { AcquisitionPipeline } from "../pipeline.js";
import type { AcquisitionInput } from "../pipeline.js";
import { INITIAL_CORPUS_VERSION } from "../../governance/version.js";

const VERSION = INITIAL_CORPUS_VERSION;

function makeInput(suffix: string): AcquisitionInput {
  return {
    originalFilename: `doc_${suffix}.txt`,
    acquisitionSource: "SYNTHETIC",
    documentOrigin: "internal:test",
    licenceStatus: "INTERNAL",
    acquisitionDate: "2026-07-27T00:00:00.000Z",
    title: `Document ${suffix}`,
    domain: "GENERAL",
    documentType: "SUMMARY",
    difficulty: "LOW",
    sourceType: "AI_GENERATED",
    language: "en",
    generator: "G",
    creationMethod: "test",
    sourceReference: "r",
    benchmarkStatus: "DRAFT",
    sourceText: `Source material for document ${suffix} with enough text to pass validation.`,
    generatedText: `Generated output for document ${suffix} containing unique content and information specific to this fixture.`,
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
  };
}

describe("CandidateRegistry — record", () => {
  it("records an ADMITTED entry", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(makeInput("admit-a"));
    const registry = new CandidateRegistry();
    const entry = registry.record({
      document: doc,
      decision: "ADMITTED",
      exclusionReasons: [],
      reasons: [],
      corpusVersion: VERSION,
    });
    expect(entry.decision).toBe("ADMITTED");
    expect(entry.corpusVersion).toBe(VERSION);
  });

  it("records a REJECTED entry with reasons", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(makeInput("reject-a"));
    const registry = new CandidateRegistry();
    const entry = registry.record({
      document: doc,
      decision: "REJECTED",
      exclusionReasons: ["EVALUATOR_INFLUENCED_SELECTION"],
      reasons: ["Document was selected based on evaluator output"],
      corpusVersion: VERSION,
    });
    expect(entry.decision).toBe("REJECTED");
    expect(entry.exclusionReasons).toContain("EVALUATOR_INFLUENCED_SELECTION");
    expect(entry.reasons[0]).toContain("evaluator output");
  });

  it("entry is frozen (immutable)", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(makeInput("freeze-b"));
    const registry = new CandidateRegistry();
    const entry = registry.record({ document: doc, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    expect(Object.isFrozen(entry)).toBe(true);
  });

  it("entryDigest is a 64-char hex string", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(makeInput("digest-c"));
    const registry = new CandidateRegistry();
    const entry = registry.record({ document: doc, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    expect(entry.entryDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(entry.entryDigest)).toBe(true);
  });
});

describe("CandidateRegistry — digest stability", () => {
  it("same inputs → same entryDigest (admissionTimestamp excluded)", () => {
    const pipeline1 = new AcquisitionPipeline();
    const pipeline2 = new AcquisitionPipeline();
    const doc1 = pipeline1.acquire(makeInput("stable-x"));
    const doc2 = pipeline2.acquire(makeInput("stable-x")); // identical content

    const r1 = new CandidateRegistry();
    const e1 = r1.record({ document: doc1, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION, timestamp: "2026-01-01T00:00:00.000Z" });

    const r2 = new CandidateRegistry();
    const e2 = r2.record({ document: doc2, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION, timestamp: "2099-12-31T23:59:59.000Z" });

    expect(e1.entryDigest).toBe(e2.entryDigest);
  });

  it("different decision → different entryDigest", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(makeInput("diff-dec"));
    const r = new CandidateRegistry();
    const admitted = r.record({ document: doc, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION, timestamp: "T" });
    // Manually compute digest for rejected
    const rejectedDigest = computeEntryDigest(
      `cr-${doc.corpusId}-rejected`,
      doc.corpusId,
      "REJECTED",
      ["DUPLICATE_CONTENT"],
      ["Exact duplicate"],
      VERSION,
      doc.generatedContent.contentDigest,
    );
    expect(admitted.entryDigest).not.toBe(rejectedDigest);
  });
});

describe("CandidateRegistry — append-only invariant", () => {
  it("list() returns all entries in insertion order", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    const d1 = pipeline.acquire(makeInput("ord-1"));
    const d2 = pipeline.acquire(makeInput("ord-2"));
    registry.record({ document: d1, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    registry.record({ document: d2, decision: "REJECTED", exclusionReasons: ["DUPLICATE_CONTENT"], reasons: ["dup"], corpusVersion: VERSION });
    const list = registry.list();
    expect(list).toHaveLength(2);
    expect(list[0]!.document.corpusId).toBe(d1.corpusId);
    expect(list[1]!.document.corpusId).toBe(d2.corpusId);
  });

  it("list() returns a snapshot — mutations do not affect the original", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    const doc = pipeline.acquire(makeInput("snap-a"));
    registry.record({ document: doc, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    const snapshot = registry.list() as unknown as CandidateRegistryEntry[];
    snapshot.push(null as never); // mutate snapshot
    expect(registry.totalCount()).toBe(1); // original unaffected
  });
});

// Keep the TS import happy
import type { CandidateRegistryEntry } from "../candidate-registry.js";

describe("CandidateRegistry — filters", () => {
  it("admitted() returns only ADMITTED entries", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    const d1 = pipeline.acquire(makeInput("filt-a"));
    const d2 = pipeline.acquire(makeInput("filt-b"));
    registry.record({ document: d1, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    registry.record({ document: d2, decision: "REJECTED", exclusionReasons: ["DUPLICATE_CONTENT"], reasons: ["x"], corpusVersion: VERSION });
    expect(registry.admitted()).toHaveLength(1);
    expect(registry.admitted()[0]!.decision).toBe("ADMITTED");
  });

  it("rejected() returns only REJECTED entries", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    const d1 = pipeline.acquire(makeInput("filt-c"));
    const d2 = pipeline.acquire(makeInput("filt-d"));
    registry.record({ document: d1, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    registry.record({ document: d2, decision: "REJECTED", exclusionReasons: ["PREANNOTATED_OUTCOME"], reasons: ["x"], corpusVersion: VERSION });
    expect(registry.rejected()).toHaveLength(1);
    expect(registry.rejected()[0]!.decision).toBe("REJECTED");
  });

  it("findById returns the correct entry", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    const doc = pipeline.acquire(makeInput("find-a"));
    registry.record({ document: doc, decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    const found = registry.findById(doc.corpusId);
    expect(found?.document.corpusId).toBe(doc.corpusId);
  });

  it("findById returns undefined for unknown ID", () => {
    const registry = new CandidateRegistry();
    expect(registry.findById("DRA-DOC-9999")).toBeUndefined();
  });

  it("counts are accurate", () => {
    const pipeline = new AcquisitionPipeline();
    const registry = new CandidateRegistry();
    registry.record({ document: pipeline.acquire(makeInput("cnt-a")), decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    registry.record({ document: pipeline.acquire(makeInput("cnt-b")), decision: "ADMITTED", exclusionReasons: [], reasons: [], corpusVersion: VERSION });
    registry.record({ document: pipeline.acquire(makeInput("cnt-c")), decision: "REJECTED", exclusionReasons: ["DUPLICATE_CONTENT"], reasons: ["x"], corpusVersion: VERSION });
    expect(registry.admittedCount()).toBe(2);
    expect(registry.rejectedCount()).toBe(1);
    expect(registry.totalCount()).toBe(3);
  });
});
