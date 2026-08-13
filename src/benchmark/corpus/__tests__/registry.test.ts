/**
 * DRA-001-04A — Benchmark Corpus — Registry Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CorpusRegistry, CorpusRegistryError } from "../registry.js";
import {
  SAMPLE_CORPUS_INPUT_A,
  SAMPLE_CORPUS_INPUT_B,
  SAMPLE_CORPUS_INPUT_C,
} from "../fixtures/sample-inputs.js";
import type { CorpusDocumentInput } from "../schema.js";

function makeRegistry(...inputs: CorpusDocumentInput[]): CorpusRegistry {
  const r = new CorpusRegistry();
  for (const input of inputs) r.add(input);
  return r;
}

describe("CorpusRegistry — add", () => {
  it("adds a valid document and returns a CorpusDocument with integrityDigest", () => {
    const registry = new CorpusRegistry();
    const doc = registry.add(SAMPLE_CORPUS_INPUT_A);
    expect(doc.corpusId).toBe("DRA-DOC-0001");
    expect(doc.integrityDigest).toHaveLength(64);
    expect(typeof doc.integrityDigest).toBe("string");
  });

  it("the returned document is frozen", () => {
    const registry = new CorpusRegistry();
    const doc = registry.add(SAMPLE_CORPUS_INPUT_A);
    expect(Object.isFrozen(doc)).toBe(true);
  });

  it("adds multiple documents successfully", () => {
    const registry = makeRegistry(
      SAMPLE_CORPUS_INPUT_A,
      SAMPLE_CORPUS_INPUT_B,
      SAMPLE_CORPUS_INPUT_C,
    );
    expect(registry.size).toBe(3);
  });
});

describe("CorpusRegistry — duplicate rejection", () => {
  it("throws DUPLICATE_CORPUS_ID when the same ID is added twice", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    expect(() => registry.add(SAMPLE_CORPUS_INPUT_A)).toThrow(
      CorpusRegistryError,
    );
  });

  it("the thrown error has code DUPLICATE_CORPUS_ID", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    let caught: CorpusRegistryError | undefined;
    try {
      registry.add(SAMPLE_CORPUS_INPUT_A);
    } catch (e) {
      caught = e as CorpusRegistryError;
    }
    expect(caught?.code).toBe("DUPLICATE_CORPUS_ID");
  });

  it("throws DUPLICATE_INTEGRITY_DIGEST when content-identical documents have different IDs", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const clone: CorpusDocumentInput = {
      ...SAMPLE_CORPUS_INPUT_A,
      corpusId: "DRA-DOC-0099",
    };
    let caught: CorpusRegistryError | undefined;
    try {
      registry.add(clone);
    } catch (e) {
      caught = e as CorpusRegistryError;
    }
    expect(caught?.code).toBe("DUPLICATE_INTEGRITY_DIGEST");
  });

  it("does NOT throw when documents differ only in title (different digest)", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const different: CorpusDocumentInput = {
      ...SAMPLE_CORPUS_INPUT_A,
      corpusId: "DRA-DOC-0099",
      title: "Completely Different Title",
    };
    expect(() => registry.add(different)).not.toThrow();
    expect(registry.size).toBe(2);
  });
});

describe("CorpusRegistry — retrieve", () => {
  it("get returns the document by ID", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A, SAMPLE_CORPUS_INPUT_B);
    const doc = registry.get("DRA-DOC-0001");
    expect(doc?.corpusId).toBe("DRA-DOC-0001");
  });

  it("get returns undefined for an unknown ID", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A);
    expect(registry.get("DRA-DOC-9999")).toBeUndefined();
  });

  it("require returns the document by ID", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A);
    expect(registry.require("DRA-DOC-0001").title).toBe(
      SAMPLE_CORPUS_INPUT_A.title,
    );
  });

  it("require throws NOT_FOUND for an unknown ID", () => {
    const registry = new CorpusRegistry();
    let caught: CorpusRegistryError | undefined;
    try {
      registry.require("DRA-DOC-9999");
    } catch (e) {
      caught = e as CorpusRegistryError;
    }
    expect(caught?.code).toBe("NOT_FOUND");
  });
});

describe("CorpusRegistry — list ordering", () => {
  it("list returns documents in ascending numeric sequence order", () => {
    // Add in reverse order.
    const registry = makeRegistry(
      SAMPLE_CORPUS_INPUT_C,
      SAMPLE_CORPUS_INPUT_A,
      SAMPLE_CORPUS_INPUT_B,
    );
    const ids = registry.list().map((d) => d.corpusId);
    expect(ids).toEqual(["DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003"]);
  });

  it("list is deterministic regardless of insertion order", () => {
    const r1 = makeRegistry(SAMPLE_CORPUS_INPUT_A, SAMPLE_CORPUS_INPUT_B, SAMPLE_CORPUS_INPUT_C);
    const r2 = makeRegistry(SAMPLE_CORPUS_INPUT_C, SAMPLE_CORPUS_INPUT_B, SAMPLE_CORPUS_INPUT_A);
    expect(r1.list().map((d) => d.corpusId)).toEqual(
      r2.list().map((d) => d.corpusId),
    );
  });

  it("hasId returns true for a registered ID", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A);
    expect(registry.hasId("DRA-DOC-0001")).toBe(true);
  });

  it("hasId returns false for an unregistered ID", () => {
    const registry = new CorpusRegistry();
    expect(registry.hasId("DRA-DOC-0001")).toBe(false);
  });
});

describe("CorpusRegistry — exportManifest", () => {
  it("manifest has the correct document count", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A, SAMPLE_CORPUS_INPUT_B);
    const manifest = registry.exportManifest();
    expect(manifest.documentCount).toBe(2);
  });

  it("manifest documentIds are in canonical order", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_B, SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    expect(manifest.documentIds).toEqual(["DRA-DOC-0001", "DRA-DOC-0002"]);
  });

  it("manifest overallDigest is a 64-char hex string", () => {
    const registry = makeRegistry(SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    expect(manifest.overallDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(manifest.overallDigest)).toBe(true);
  });

  it("empty registry produces a manifest with documentCount 0", () => {
    const registry = new CorpusRegistry();
    const manifest = registry.exportManifest();
    expect(manifest.documentCount).toBe(0);
    expect(manifest.documentIds).toEqual([]);
  });
});
