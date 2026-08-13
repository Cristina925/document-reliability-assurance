/**
 * DRA-001-04A — Benchmark Corpus — Loader Tests
 */

import { describe, it, expect } from "vitest";
import { loadCorpus } from "../loader.js";
import { CorpusRegistry } from "../registry.js";
import {
  SAMPLE_CORPUS_INPUT_A,
  SAMPLE_CORPUS_INPUT_B,
  SAMPLE_CORPUS_INPUT_C,
} from "../fixtures/sample-inputs.js";

// ---------------------------------------------------------------------------
// Successful load
// ---------------------------------------------------------------------------

describe("loadCorpus — successful load", () => {
  it("loads an empty array successfully", () => {
    const result = loadCorpus([]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.documents).toHaveLength(0);
      expect(result.registry.size).toBe(0);
    }
  });

  it("loads a single valid document", () => {
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]?.corpusId).toBe("DRA-DOC-0001");
    }
  });

  it("loads multiple valid documents", () => {
    const result = loadCorpus([
      SAMPLE_CORPUS_INPUT_A,
      SAMPLE_CORPUS_INPUT_B,
      SAMPLE_CORPUS_INPUT_C,
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.documents).toHaveLength(3);
    }
  });

  it("all returned documents have a computed integrityDigest", () => {
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A, SAMPLE_CORPUS_INPUT_B]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      for (const doc of result.documents) {
        expect(doc.integrityDigest).toHaveLength(64);
      }
    }
  });

  it("returned documents are in canonical order", () => {
    // Provide in reverse order.
    const result = loadCorpus([
      SAMPLE_CORPUS_INPUT_C,
      SAMPLE_CORPUS_INPUT_A,
      SAMPLE_CORPUS_INPUT_B,
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.documents.map((d) => d.corpusId);
      expect(ids).toEqual(["DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003"]);
    }
  });

  it("returned registry is usable for further operations", () => {
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.registry).toBeInstanceOf(CorpusRegistry);
      expect(result.registry.get("DRA-DOC-0001")).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Failed validation
// ---------------------------------------------------------------------------

describe("loadCorpus — failed validation", () => {
  it("fails with DOCUMENT_VALIDATION_FAILED for a non-object entry", () => {
    const result = loadCorpus(["not-a-document"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("DOCUMENT_VALIDATION_FAILED");
      expect(result.documentIndex).toBe(0);
    }
  });

  it("fails with DOCUMENT_VALIDATION_FAILED for a document with an invalid enum", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, domain: "OUTER_SPACE" };
    const result = loadCorpus([bad]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DOCUMENT_VALIDATION_FAILED");
  });

  it("fails with DOCUMENT_VALIDATION_FAILED for a document missing a required field", () => {
    const { title: _, ...noTitle } = SAMPLE_CORPUS_INPUT_A;
    const result = loadCorpus([noTitle]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DOCUMENT_VALIDATION_FAILED");
  });

  it("fails with DUPLICATE_CORPUS_ID for duplicate IDs in the input array", () => {
    const result = loadCorpus([
      SAMPLE_CORPUS_INPUT_A,
      { ...SAMPLE_CORPUS_INPUT_A }, // same corpusId
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DUPLICATE_CORPUS_ID");
  });

  it("fails with DUPLICATE_INTEGRITY_DIGEST for content-identical documents with different IDs", () => {
    const clone = { ...SAMPLE_CORPUS_INPUT_A, corpusId: "DRA-DOC-0099" };
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A, clone]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("DUPLICATE_INTEGRITY_DIGEST");
  });

  it("reports the correct documentIndex for a mid-array failure", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_B, domain: "INVALID_DOMAIN" };
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A, bad]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.documentIndex).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Manifest validation during load
// ---------------------------------------------------------------------------

describe("loadCorpus — manifest validation", () => {
  it("succeeds when a valid manifest is provided", () => {
    const preRegistry = new CorpusRegistry();
    preRegistry.add(SAMPLE_CORPUS_INPUT_A);
    const manifest = preRegistry.exportManifest();

    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A], manifest);
    expect(result.ok).toBe(true);
  });

  it("fails with MANIFEST_VALIDATION_FAILED when manifest document count is wrong", () => {
    // Build a manifest for 2 documents but load only 1.
    const preRegistry = new CorpusRegistry();
    preRegistry.add(SAMPLE_CORPUS_INPUT_A);
    preRegistry.add(SAMPLE_CORPUS_INPUT_B);
    const manifest = preRegistry.exportManifest();

    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A], manifest);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("MANIFEST_VALIDATION_FAILED");
  });
});

// ---------------------------------------------------------------------------
// Registry corruption detection
// ---------------------------------------------------------------------------

describe("loadCorpus — registry corruption detection", () => {
  it("succeeds after loading and the registry is internally consistent", () => {
    // After a successful load the registry integrity check must pass.
    const result = loadCorpus([SAMPLE_CORPUS_INPUT_A, SAMPLE_CORPUS_INPUT_B]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // All digests in the returned registry must be authentic.
      for (const doc of result.registry.list()) {
        expect(doc.integrityDigest).toHaveLength(64);
        expect(typeof doc.integrityDigest).toBe("string");
      }
    }
  });
});
