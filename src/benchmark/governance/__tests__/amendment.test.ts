/**
 * DRA-001-04B — Amendment Rules Tests
 */

import { describe, it, expect } from "vitest";
import {
  createAmendmentRecord,
  computeAmendmentDigest,
  AmendmentError,
} from "../amendment.js";
import type { ChangedEntry } from "../amendment.js";
import { freezeCorpus } from "../freeze.js";
import { buildMinimalProtocol, transitionProtocol } from "../schema.js";
import { AllocationTracker } from "../allocation.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { INITIAL_CORPUS_VERSION, incrementMinor, incrementMajor, incrementPatch } from "../version.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

const V1 = INITIAL_CORPUS_VERSION; // DRA-CORPUS-1.0.0
const V2 = incrementMinor(V1);     // DRA-CORPUS-1.1.0

const DOC: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0001",
  title: "Test",
  sourceType: "AI_GENERATED",
  documentType: "SUMMARY",
  domain: "GENERAL",
  language: "en",
  generator: "G",
  creationMethod: "test",
  difficulty: "LOW",
  sourceReference: "r",
  benchmarkStatus: "DRAFT",
};

function makeFreezeRecord() {
  const registry = new CorpusRegistry();
  registry.add(DOC);
  const protocol = transitionProtocol(buildMinimalProtocol(), "APPROVED");
  const tracker = new AllocationTracker(protocol);
  const snap = tracker.snapshot();
  const { freezeRecord } = freezeCorpus(registry, protocol, snap, V1);
  return freezeRecord;
}

const CHANGED_ENTRY: ChangedEntry = {
  corpusId: "DRA-DOC-0001",
  changeType: "MODIFIED_METADATA",
  priorDigest: "a".repeat(64),
  newDigest: "b".repeat(64),
  description: "Fixed title typo",
};

describe("createAmendmentRecord — valid amendment", () => {
  it("creates an AmendmentRecord for a minor version bump", () => {
    const freeze = makeFreezeRecord();
    const record = createAmendmentRecord({
      amendmentId: "AMD-001",
      priorFreezeRecord: freeze,
      newCorpusVersion: V2,
      newManifestDigest: "c".repeat(64),
      changedEntries: [CHANGED_ENTRY],
      reason: "Fixed metadata error",
      compatibilityClassification: "PATCH",
    });
    expect(record.amendmentId).toBe("AMD-001");
    expect(record.priorCorpusVersion).toBe(V1);
    expect(record.newCorpusVersion).toBe(V2);
    expect(record.compatibilityClassification).toBe("PATCH");
  });

  it("amendmentDigest is a 64-char hex string", () => {
    const record = createAmendmentRecord({
      amendmentId: "AMD-002",
      priorFreezeRecord: makeFreezeRecord(),
      newCorpusVersion: V2,
      newManifestDigest: "d".repeat(64),
      changedEntries: [CHANGED_ENTRY],
      reason: "Test",
      compatibilityClassification: "MINOR",
    });
    expect(record.amendmentDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(record.amendmentDigest)).toBe(true);
  });

  it("record is frozen (immutable)", () => {
    const record = createAmendmentRecord({
      amendmentId: "AMD-003",
      priorFreezeRecord: makeFreezeRecord(),
      newCorpusVersion: V2,
      newManifestDigest: "e".repeat(64),
      changedEntries: [CHANGED_ENTRY],
      reason: "Test",
      compatibilityClassification: "MINOR",
    });
    expect(Object.isFrozen(record)).toBe(true);
  });

  it("priorFreezeDigest is preserved in the record", () => {
    const freeze = makeFreezeRecord();
    const record = createAmendmentRecord({
      amendmentId: "AMD-004",
      priorFreezeRecord: freeze,
      newCorpusVersion: V2,
      newManifestDigest: "f".repeat(64),
      changedEntries: [CHANGED_ENTRY],
      reason: "Test",
      compatibilityClassification: "MAJOR",
    });
    expect(record.priorFreezeDigest).toBe(freeze.freezeDigest);
    expect(record.priorManifestDigest).toBe(freeze.manifestDigest);
  });
});

describe("createAmendmentRecord — version validation", () => {
  it("throws DOWNGRADE_REJECTED for a lower version", () => {
    const freeze = makeFreezeRecord();
    let caught: AmendmentError | undefined;
    try {
      createAmendmentRecord({
        amendmentId: "AMD-X",
        priorFreezeRecord: freeze,
        newCorpusVersion: "DRA-CORPUS-0.9.0",
        newManifestDigest: "g".repeat(64),
        changedEntries: [CHANGED_ENTRY],
        reason: "bad",
        compatibilityClassification: "MAJOR",
      });
    } catch (e) {
      caught = e as AmendmentError;
    }
    expect(caught).toBeInstanceOf(AmendmentError);
    expect(caught?.code).toBe("DOWNGRADE_REJECTED");
  });

  it("throws SAME_VERSION_REJECTED for the same version", () => {
    const freeze = makeFreezeRecord();
    let caught: AmendmentError | undefined;
    try {
      createAmendmentRecord({
        amendmentId: "AMD-Y",
        priorFreezeRecord: freeze,
        newCorpusVersion: V1,
        newManifestDigest: "h".repeat(64),
        changedEntries: [CHANGED_ENTRY],
        reason: "bad",
        compatibilityClassification: "PATCH",
      });
    } catch (e) {
      caught = e as AmendmentError;
    }
    expect(caught?.code).toBe("SAME_VERSION_REJECTED");
  });
});

describe("createAmendmentRecord — entry validation", () => {
  it("throws MISSING_CHANGED_ENTRIES for an empty array", () => {
    const freeze = makeFreezeRecord();
    let caught: AmendmentError | undefined;
    try {
      createAmendmentRecord({
        amendmentId: "AMD-Z",
        priorFreezeRecord: freeze,
        newCorpusVersion: V2,
        newManifestDigest: "i".repeat(64),
        changedEntries: [],
        reason: "empty",
        compatibilityClassification: "PATCH",
      });
    } catch (e) {
      caught = e as AmendmentError;
    }
    expect(caught?.code).toBe("MISSING_CHANGED_ENTRIES");
  });

  it("throws DESTRUCTIVE_OVERWRITE when all documents are removed", () => {
    const freeze = makeFreezeRecord(); // 1 document
    const removeAll: ChangedEntry = {
      corpusId: "DRA-DOC-0001",
      changeType: "REMOVED",
      priorDigest: "a".repeat(64),
      newDigest: null,
      description: "Removing only document",
    };
    let caught: AmendmentError | undefined;
    try {
      createAmendmentRecord({
        amendmentId: "AMD-W",
        priorFreezeRecord: freeze,
        newCorpusVersion: V2,
        newManifestDigest: "j".repeat(64),
        changedEntries: [removeAll],
        reason: "delete all",
        compatibilityClassification: "MAJOR",
      });
    } catch (e) {
      caught = e as AmendmentError;
    }
    expect(caught?.code).toBe("DESTRUCTIVE_OVERWRITE");
  });
});

describe("createAmendmentRecord — digest properties", () => {
  it("amendmentTimestamp is excluded from amendmentDigest", () => {
    const freeze = makeFreezeRecord();
    const base = {
      amendmentId: "AMD-DIG",
      priorFreezeRecord: freeze,
      newCorpusVersion: V2,
      newManifestDigest: "k".repeat(64),
      changedEntries: [CHANGED_ENTRY],
      reason: "test digest",
      compatibilityClassification: "PATCH" as const,
    };
    const r1 = createAmendmentRecord({ ...base, timestamp: "2026-01-01T00:00:00.000Z" });
    const r2 = createAmendmentRecord({ ...base, timestamp: "2099-12-31T23:59:59.999Z" });
    expect(r1.amendmentDigest).toBe(r2.amendmentDigest);
  });

  it("changedEntries sort order does not affect digest", () => {
    const freeze = makeFreezeRecord();
    const entryA: ChangedEntry = {
      corpusId: "DRA-DOC-0001",
      changeType: "MODIFIED_METADATA",
      priorDigest: "a".repeat(64),
      newDigest: "b".repeat(64),
      description: "Entry A",
    };
    const entryB: ChangedEntry = {
      corpusId: "DRA-DOC-0002",
      changeType: "ADDED",
      priorDigest: null,
      newDigest: "c".repeat(64),
      description: "Entry B",
    };
    // documentCount=1, so two REMOVED entries would trigger DESTRUCTIVE_OVERWRITE
    // Use a corpus with 2 docs to avoid that
    const registry2 = new CorpusRegistry();
    registry2.add(DOC);
    registry2.add({ ...DOC, corpusId: "DRA-DOC-0002", title: "Doc 2" });
    const protocol = transitionProtocol(buildMinimalProtocol(), "APPROVED");
    const { freezeRecord: freeze2 } = freezeCorpus(
      registry2, protocol, new AllocationTracker(protocol).snapshot(), V1,
    );

    const r1 = createAmendmentRecord({
      amendmentId: "AMD-ORD",
      priorFreezeRecord: freeze2,
      newCorpusVersion: V2,
      newManifestDigest: "l".repeat(64),
      changedEntries: [entryA, entryB],
      reason: "order test",
      compatibilityClassification: "MINOR",
    });
    const r2 = createAmendmentRecord({
      amendmentId: "AMD-ORD",
      priorFreezeRecord: freeze2,
      newCorpusVersion: V2,
      newManifestDigest: "l".repeat(64),
      changedEntries: [entryB, entryA], // reversed
      reason: "order test",
      compatibilityClassification: "MINOR",
    });
    expect(r1.amendmentDigest).toBe(r2.amendmentDigest);
  });
});
