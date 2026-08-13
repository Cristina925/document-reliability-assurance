/**
 * DRA-001-04B — Freeze Enforcement Tests
 */

import { describe, it, expect } from "vitest";
import {
  freezeCorpus,
  verifyCorpusFreeze,
  FrozenCorpus,
  CorpusAlreadyFrozenError,
  computeFreezeDigest,
} from "../freeze.js";
import { AllocationTracker } from "../allocation.js";
import { buildMinimalProtocol, transitionProtocol } from "../schema.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildContentPayload, type CorpusCandidate } from "../eligibility.js";
import { AdmissionRegistry } from "../admissions.js";
import { INITIAL_CORPUS_VERSION } from "../version.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

const CORPUS_V = INITIAL_CORPUS_VERSION;

function makeRegistry(...inputs: CorpusDocumentInput[]): CorpusRegistry {
  const r = new CorpusRegistry();
  for (const input of inputs) r.add(input);
  return r;
}

const DOC_A: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0001",
  title: "Doc A",
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

function approvedProtocol() {
  return transitionProtocol(buildMinimalProtocol(), "APPROVED");
}

function emptySnapshot() {
  return new AllocationTracker(approvedProtocol()).snapshot();
}

describe("freezeCorpus — structure", () => {
  it("returns a FreezeRecord and FrozenCorpus", () => {
    const registry = makeRegistry(DOC_A);
    const protocol = approvedProtocol();
    const { frozenCorpus, freezeRecord } = freezeCorpus(
      registry,
      protocol,
      emptySnapshot(),
      CORPUS_V,
    );
    expect(frozenCorpus).toBeInstanceOf(FrozenCorpus);
    expect(freezeRecord.freezeStatus).toBe("FROZEN");
  });

  it("FreezeRecord has corpusVersion, protocolVersion, documentCount", () => {
    const registry = makeRegistry(DOC_A);
    const protocol = approvedProtocol();
    const { freezeRecord } = freezeCorpus(registry, protocol, emptySnapshot(), CORPUS_V);
    expect(freezeRecord.corpusVersion).toBe(CORPUS_V);
    expect(freezeRecord.protocolVersion).toBe(protocol.protocolVersion);
    expect(freezeRecord.documentCount).toBe(1);
  });

  it("FreezeRecord.canonicalDocumentIds contains the document IDs in order", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(freezeRecord.canonicalDocumentIds).toEqual(["DRA-DOC-0001"]);
  });

  it("freezeDigest is a 64-char hex string", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(freezeRecord.freezeDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(freezeRecord.freezeDigest)).toBe(true);
  });
});

describe("freezeCorpus — determinism", () => {
  it("same registry → same freezeDigest", () => {
    const r1 = makeRegistry(DOC_A);
    const r2 = makeRegistry(DOC_A);
    const protocol = approvedProtocol();
    const { freezeRecord: f1 } = freezeCorpus(r1, protocol, emptySnapshot(), CORPUS_V, {
      timestamp: "2026-01-01T00:00:00.000Z",
    });
    const { freezeRecord: f2 } = freezeCorpus(r2, protocol, emptySnapshot(), CORPUS_V, {
      timestamp: "2026-01-01T00:00:00.000Z",
    });
    expect(f1.freezeDigest).toBe(f2.freezeDigest);
  });

  it("manifest is reproducible from same registry state", () => {
    const registry = makeRegistry(DOC_A);
    const protocol = approvedProtocol();
    const { freezeRecord: f1 } = freezeCorpus(registry, protocol, emptySnapshot(), CORPUS_V);
    const { freezeRecord: f2 } = freezeCorpus(registry, protocol, emptySnapshot(), CORPUS_V);
    expect(f1.manifestDigest).toBe(f2.manifestDigest);
  });
});

describe("verifyCorpusFreeze", () => {
  it("returns true for an authentic freeze record", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(verifyCorpusFreeze(freezeRecord)).toBe(true);
  });

  it("returns false after tampering with documentCount", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    const tampered = { ...freezeRecord, documentCount: 99 };
    expect(verifyCorpusFreeze(tampered)).toBe(false);
  });

  it("returns false after tampering with manifestDigest", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    const tampered = { ...freezeRecord, manifestDigest: "a".repeat(64) };
    expect(verifyCorpusFreeze(tampered)).toBe(false);
  });

  it("returns true after changing only freezeTimestamp (operational)", () => {
    const registry = makeRegistry(DOC_A);
    const { freezeRecord } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    const changed = { ...freezeRecord, freezeTimestamp: "2099-01-01T00:00:00.000Z" };
    expect(verifyCorpusFreeze(changed)).toBe(true);
  });
});

describe("FrozenCorpus — mutation enforcement", () => {
  it("add() throws CorpusAlreadyFrozenError", () => {
    const registry = makeRegistry(DOC_A);
    const { frozenCorpus } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(() => frozenCorpus.add()).toThrow(CorpusAlreadyFrozenError);
  });

  it("remove() throws CorpusAlreadyFrozenError", () => {
    const registry = makeRegistry(DOC_A);
    const { frozenCorpus } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(() => frozenCorpus.remove()).toThrow(CorpusAlreadyFrozenError);
  });

  it("modify() throws CorpusAlreadyFrozenError", () => {
    const registry = makeRegistry(DOC_A);
    const { frozenCorpus } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(() => frozenCorpus.modify()).toThrow(CorpusAlreadyFrozenError);
  });

  it("documents returns the frozen list", () => {
    const registry = makeRegistry(DOC_A);
    const { frozenCorpus } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(frozenCorpus.documents).toHaveLength(1);
    expect(frozenCorpus.documents[0]?.corpusId).toBe("DRA-DOC-0001");
  });

  it("documentCount is correct", () => {
    const registry = makeRegistry(DOC_A);
    const { frozenCorpus } = freezeCorpus(
      registry,
      approvedProtocol(),
      emptySnapshot(),
      CORPUS_V,
    );
    expect(frozenCorpus.documentCount).toBe(1);
  });
});
