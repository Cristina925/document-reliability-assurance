/**
 * DRA-001-04B — Allocation Plan Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateAllocationTotals,
  AllocationTracker,
} from "../allocation.js";
import { buildMinimalProtocol, transitionProtocol } from "../schema.js";
import { buildContentPayload, type CorpusCandidate } from "../eligibility.js";

function makeCandidate(
  corpusId: string,
  domain: CorpusCandidate["domain"],
  documentType: CorpusCandidate["documentType"],
  difficulty: CorpusCandidate["difficulty"],
): CorpusCandidate {
  return {
    corpusId: corpusId as never,
    title: "Test",
    sourceType: "AI_GENERATED",
    documentType,
    domain,
    language: "en",
    generator: "G",
    creationMethod: "test",
    difficulty,
    sourceReference: "r",
    benchmarkStatus: "DRAFT",
    sourceContent: buildContentPayload(`src-${corpusId}`, "SOURCE"),
    generatedContent: buildContentPayload(`gen-${corpusId}`, "GENERATED"),
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
  };
}

const BASE_PROTOCOL = buildMinimalProtocol();
// targetCorpusSize=6: domain[6]=1 each, docType: SUMMARY=2,REPORT=2,POLICY=2, difficulty: LOW=2,MED=2,HIGH=2

describe("validateAllocationTotals", () => {
  it("passes when all dimensions sum to targetCorpusSize", () => {
    const result = validateAllocationTotals(BASE_PROTOCOL);
    expect(result.ok).toBe(true);
  });

  it("fails with DOMAIN_TOTAL_MISMATCH when domain total is wrong", () => {
    const p = buildMinimalProtocol({
      domainAllocationTargets: { GENERAL: 1, BUSINESS: 1 }, // total=2, not 6
    });
    const result = validateAllocationTotals(p);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DOMAIN_TOTAL_MISMATCH");
  });

  it("fails with DOCTYPE_TOTAL_MISMATCH when document-type total is wrong", () => {
    const p = buildMinimalProtocol({
      documentTypeAllocationTargets: { SUMMARY: 1 }, // total=1, not 6
    });
    const result = validateAllocationTotals(p);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DOCTYPE_TOTAL_MISMATCH");
  });

  it("fails with DIFFICULTY_TOTAL_MISMATCH when difficulty total is wrong", () => {
    const p = buildMinimalProtocol({
      difficultyAllocationTargets: { LOW: 1, MEDIUM: 1 }, // total=2, not 6
    });
    const result = validateAllocationTotals(p);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DIFFICULTY_TOTAL_MISMATCH");
  });
});

describe("AllocationTracker — checkCapacity", () => {
  it("returns true when space is available in all dimensions", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const c = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    expect(tracker.checkCapacity(c)).toBe(true);
  });

  it("returns false when domain cell is full", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const c1 = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    const c2 = makeCandidate("DRA-DOC-0002", "GENERAL", "REPORT", "MEDIUM");
    tracker.recordAdmission(c1); // GENERAL target=1, now full
    expect(tracker.checkCapacity(c2)).toBe(false);
  });

  it("returns false when documentType cell is full", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const c1 = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    const c2 = makeCandidate("DRA-DOC-0002", "BUSINESS", "SUMMARY", "MEDIUM");
    const c3 = makeCandidate("DRA-DOC-0003", "TECHNICAL", "SUMMARY", "HIGH");
    tracker.recordAdmission(c1);
    tracker.recordAdmission(c2); // SUMMARY target=2, now full
    expect(tracker.checkCapacity(c3)).toBe(false);
  });

  it("returns false when difficulty cell is full", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const c1 = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    const c2 = makeCandidate("DRA-DOC-0002", "BUSINESS", "REPORT", "LOW");
    const c3 = makeCandidate("DRA-DOC-0003", "TECHNICAL", "POLICY", "LOW");
    tracker.recordAdmission(c1);
    tracker.recordAdmission(c2); // LOW target=2, now full
    expect(tracker.checkCapacity(c3)).toBe(false);
  });
});

describe("AllocationTracker — recordAdmission", () => {
  it("increments admitted counts", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const c = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    tracker.recordAdmission(c);
    expect(tracker.getCellForDomain("GENERAL").admitted).toBe(1);
    expect(tracker.getCellForDocumentType("SUMMARY").admitted).toBe(1);
    expect(tracker.getCellForDifficulty("LOW").admitted).toBe(1);
  });

  it("totalAdmitted reflects all admitted documents", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    tracker.recordAdmission(makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW"));
    tracker.recordAdmission(makeCandidate("DRA-DOC-0002", "BUSINESS", "REPORT", "MEDIUM"));
    expect(tracker.totalAdmitted()).toBe(2);
  });
});

describe("AllocationTracker — snapshot", () => {
  it("snapshot is deterministic (same state → same output)", () => {
    const t1 = new AllocationTracker(BASE_PROTOCOL);
    const t2 = new AllocationTracker(BASE_PROTOCOL);
    const c = makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW");
    t1.recordAdmission(c);
    t2.recordAdmission(c);
    expect(JSON.stringify(t1.snapshot())).toBe(JSON.stringify(t2.snapshot()));
  });

  it("snapshot keys are sorted within each dimension", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const snap = tracker.snapshot();
    const domainKeys = Object.keys(snap.domain);
    expect(domainKeys).toEqual([...domainKeys].sort());
  });

  it("remaining decreases after admission", () => {
    const tracker = new AllocationTracker(BASE_PROTOCOL);
    const before = tracker.getCellForDomain("GENERAL").remaining;
    tracker.recordAdmission(makeCandidate("DRA-DOC-0001", "GENERAL", "SUMMARY", "LOW"));
    const after = tracker.getCellForDomain("GENERAL").remaining;
    expect(after).toBe(before - 1);
  });
});
