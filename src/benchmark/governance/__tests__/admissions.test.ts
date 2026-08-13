/**
 * DRA-001-04B — Admission Workflow Tests
 */

import { describe, it, expect } from "vitest";
import { AdmissionRegistry, computeAdmissionDigest } from "../admissions.js";
import { AllocationTracker } from "../allocation.js";
import { buildMinimalProtocol, transitionProtocol } from "../schema.js";
import { buildContentPayload, type CorpusCandidate } from "../eligibility.js";
import type { BenchmarkSelectionProtocol } from "../schema.js";

function approvedProtocol(): BenchmarkSelectionProtocol {
  return transitionProtocol(buildMinimalProtocol(), "APPROVED");
}

let candidateCounter = 1;
function makeCandidate(
  overrides: Partial<CorpusCandidate> = {},
  contentSuffix?: string,
): CorpusCandidate {
  const id = `DRA-DOC-00${String(candidateCounter++).padStart(2, "0")}`;
  const suffix = contentSuffix ?? id;
  return {
    corpusId: id as never,
    title: `Test Document ${id}`,
    sourceType: "AI_GENERATED",
    documentType: "SUMMARY",
    domain: "GENERAL",
    language: "en",
    generator: "TestGen",
    creationMethod: "test",
    difficulty: "LOW",
    sourceReference: `ref:${id}`,
    benchmarkStatus: "DRAFT",
    sourceContent: buildContentPayload(`Source ${suffix} content unique text here`, "SOURCE"),
    generatedContent: buildContentPayload(
      `Generated ${suffix} output unique text for this document benchmark`,
      "GENERATED",
    ),
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
    ...overrides,
  };
}

describe("AdmissionRegistry — admitted candidate", () => {
  it("admits a valid candidate", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const record = registry.admit(makeCandidate(), protocol, tracker);
    expect(record.decision).toBe("ADMITTED");
    expect(record.exclusionReasons).toHaveLength(0);
  });

  it("admission record has a 64-char admissionDigest", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const record = registry.admit(makeCandidate(), protocol, tracker);
    expect(record.admissionDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(record.admissionDigest)).toBe(true);
  });

  it("admitted record is frozen (immutable)", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const record = registry.admit(makeCandidate(), protocol, tracker);
    expect(Object.isFrozen(record)).toBe(true);
  });

  it("admittedCount increases after admission", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    registry.admit(makeCandidate(), protocol, tracker);
    expect(registry.admittedCount()).toBe(1);
  });
});

describe("AdmissionRegistry — rejected candidate", () => {
  it("rejects ineligible candidate (evaluatorInfluenced)", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const record = registry.admit(
      makeCandidate({ evaluatorInfluenced: true }),
      protocol,
      tracker,
    );
    expect(record.decision).toBe("REJECTED");
    expect(record.exclusionReasons).toContain("EVALUATOR_INFLUENCED_SELECTION");
  });

  it("rejected record is still in the audit log", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    registry.admit(makeCandidate({ evaluatorInfluenced: true }), protocol, tracker);
    expect(registry.totalCount()).toBe(1);
    expect(registry.rejectedCount()).toBe(1);
  });

  it("rejection does not mutate the tracker counts", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const before = tracker.totalAdmitted();
    registry.admit(makeCandidate({ evaluatorInfluenced: true }), protocol, tracker);
    expect(tracker.totalAdmitted()).toBe(before); // no change
  });
});

describe("AdmissionRegistry — exact duplicate rejection", () => {
  it("rejects a second candidate with the same generated content digest", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const c1 = makeCandidate({}, "shared-content-fingerprint-abc");
    const c2 = makeCandidate({}, "shared-content-fingerprint-abc"); // same generated content
    registry.admit(c1, protocol, tracker);
    const record2 = registry.admit(c2, protocol, tracker);
    expect(record2.decision).toBe("REJECTED");
    expect(record2.exclusionReasons).toContain("DUPLICATE_CONTENT");
  });
});

describe("AdmissionRegistry — allocation capacity", () => {
  it("rejects when allocation is full", () => {
    // GENERAL target=1, SUMMARY target=2, LOW target=2
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const c1 = makeCandidate(
      { domain: "GENERAL", documentType: "SUMMARY", difficulty: "LOW" },
      "first-candidate-content-alpha-foo",
    );
    // c2 uses very different content to avoid near-duplicate rejection,
    // so the allocation check is the deciding factor.
    const c2 = makeCandidate(
      { domain: "GENERAL", documentType: "SUMMARY", difficulty: "LOW" },
      "zyxwvutsrqponmlkjihgfedcba-second-entirely-distinct-987654321-content-here",
    );
    registry.admit(c1, protocol, tracker); // fills GENERAL (target=1)
    const record2 = registry.admit(c2, protocol, tracker);
    expect(record2.decision).toBe("REJECTED");
    expect(record2.exclusionReasons).toContain("ALLOCATION_FILLED");
  });
});

describe("AdmissionRegistry — reproducibility", () => {
  it("same candidate + same protocol + same state → same admissionDigest", () => {
    // Two fresh registries processing the same candidate.
    candidateCounter = 500; // pin the counter
    const c = makeCandidate();
    const protocol = approvedProtocol();

    const r1 = new AdmissionRegistry();
    const t1 = new AllocationTracker(protocol);
    const rec1 = r1.admit(c, protocol, t1, { timestamp: "2026-01-01T00:00:00.000Z" });

    const r2 = new AdmissionRegistry();
    const t2 = new AllocationTracker(protocol);
    const rec2 = r2.admit(c, protocol, t2, { timestamp: "2026-01-01T00:00:00.000Z" });

    expect(rec1.admissionDigest).toBe(rec2.admissionDigest);
  });

  it("admissionTimestamp does not affect admissionDigest", () => {
    candidateCounter = 600;
    const c = makeCandidate();
    const protocol = approvedProtocol();

    const r1 = new AdmissionRegistry();
    const rec1 = r1.admit(c, protocol, new AllocationTracker(protocol), {
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    const r2 = new AdmissionRegistry();
    const rec2 = r2.admit(c, protocol, new AllocationTracker(protocol), {
      timestamp: "2030-12-31T23:59:59.999Z",
    });

    expect(rec1.admissionDigest).toBe(rec2.admissionDigest);
  });
});

describe("AdmissionRegistry — list and findByCandidateRef", () => {
  it("list returns all records in insertion order", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const c1 = makeCandidate();
    const c2 = makeCandidate({}, "unique-diff-content-xyz");
    registry.admit(c1, protocol, tracker);
    registry.admit(c2, protocol, tracker);
    expect(registry.list()).toHaveLength(2);
  });

  it("findByCandidateRef returns the record for a given ID", () => {
    const registry = new AdmissionRegistry();
    const protocol = approvedProtocol();
    const tracker = new AllocationTracker(protocol);
    const c = makeCandidate();
    registry.admit(c, protocol, tracker);
    const found = registry.findByCandidateRef(c.corpusId);
    expect(found).toBeDefined();
    expect(found?.candidateReference).toBe(c.corpusId);
  });
});
