/**
 * DRA-001-04A — Benchmark Corpus — Integrity Tests
 */

import { describe, it, expect } from "vitest";
import {
  computeCorpusDocumentDigest,
  verifyCorpusDocumentIntegrity,
  computeManifestDigest,
  verifyManifestIntegrity,
} from "../integrity.js";
import {
  SAMPLE_CORPUS_INPUT_A,
  SAMPLE_CORPUS_INPUT_B,
} from "../fixtures/sample-inputs.js";
import type { CorpusDocumentInput, CorpusDocument } from "../schema.js";
import { CORPUS_SCHEMA_VERSION } from "../schema.js";

// ---------------------------------------------------------------------------
// Document digest
// ---------------------------------------------------------------------------

describe("computeCorpusDocumentDigest — determinism", () => {
  it("identical inputs produce identical digests", () => {
    const d1 = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const d2 = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    expect(d1).toBe(d2);
  });

  it("returns a 64-character lowercase hex string", () => {
    const digest = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("different documents produce different digests", () => {
    const d1 = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const d2 = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_B);
    expect(d1).not.toBe(d2);
  });
});

describe("computeCorpusDocumentDigest — material change detection", () => {
  it("corpusId does NOT affect the digest — identity key is excluded from the content fingerprint", () => {
    // corpusId is the permanent identity, not the content.  Two registrations
    // of the same content under different IDs must produce the same digest so
    // the registry's duplicate-digest check can detect them.
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const differentId = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_A,
      corpusId: "DRA-DOC-0099",
    });
    expect(original).toBe(differentId);
  });

  it("changing title changes the digest", () => {
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const modified = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_A,
      title: "A Completely Different Title",
    });
    expect(original).not.toBe(modified);
  });

  it("changing domain changes the digest", () => {
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const modified = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_A,
      domain: "FINANCE",
    });
    expect(original).not.toBe(modified);
  });

  it("changing difficulty changes the digest", () => {
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const modified = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_A,
      difficulty: "HIGH",
    });
    expect(original).not.toBe(modified);
  });

  it("changing benchmarkStatus changes the digest", () => {
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const modified = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_A,
      benchmarkStatus: "FROZEN",
    });
    expect(original).not.toBe(modified);
  });

  it("adding notes changes the digest", () => {
    // SAMPLE_CORPUS_INPUT_B has no notes.
    const original = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_B);
    const modified = computeCorpusDocumentDigest({
      ...SAMPLE_CORPUS_INPUT_B,
      notes: "Added note",
    });
    expect(original).not.toBe(modified);
  });

  it("adding generatorVersion changes the digest", () => {
    const withoutVersion: CorpusDocumentInput = {
      ...SAMPLE_CORPUS_INPUT_B,
      generatorVersion: undefined,
    };
    const withVersion: CorpusDocumentInput = {
      ...SAMPLE_CORPUS_INPUT_B,
      generatorVersion: "99.0",
    };
    expect(computeCorpusDocumentDigest(withoutVersion)).not.toBe(
      computeCorpusDocumentDigest(withVersion),
    );
  });
});

describe("computeCorpusDocumentDigest — operational metadata excluded", () => {
  it("integrityDigest field is NOT part of the digest input (no self-reference)", () => {
    // Build two CorpusDocument objects with different stored digests but same input.
    const input = SAMPLE_CORPUS_INPUT_A;
    const computed = computeCorpusDocumentDigest(input);
    const docA: CorpusDocument = { ...input, integrityDigest: computed };
    const docB: CorpusDocument = { ...input, integrityDigest: "a".repeat(64) };

    // Recomputing from either document's input fields (excluding integrityDigest)
    // must give the same result — the stored integrityDigest is not part of the input.
    const { integrityDigest: _a, ...inputA } = docA;
    const { integrityDigest: _b, ...inputB } = docB;
    expect(computeCorpusDocumentDigest(inputA as CorpusDocumentInput)).toBe(
      computeCorpusDocumentDigest(inputB as CorpusDocumentInput),
    );
  });
});

// ---------------------------------------------------------------------------
// verifyCorpusDocumentIntegrity
// ---------------------------------------------------------------------------

describe("verifyCorpusDocumentIntegrity", () => {
  function makeDoc(input: CorpusDocumentInput): CorpusDocument {
    return { ...input, integrityDigest: computeCorpusDocumentDigest(input) };
  }

  it("returns true for a document with a correct digest", () => {
    const doc = makeDoc(SAMPLE_CORPUS_INPUT_A);
    expect(verifyCorpusDocumentIntegrity(doc)).toBe(true);
  });

  it("returns false when the stored digest is wrong", () => {
    const doc: CorpusDocument = {
      ...SAMPLE_CORPUS_INPUT_A,
      integrityDigest: "b".repeat(64),
    };
    expect(verifyCorpusDocumentIntegrity(doc)).toBe(false);
  });

  it("returns false after mutating a substantive field", () => {
    const doc = makeDoc(SAMPLE_CORPUS_INPUT_A);
    const mutated: CorpusDocument = { ...doc, title: "Tampered Title" };
    expect(verifyCorpusDocumentIntegrity(mutated)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Manifest digest
// ---------------------------------------------------------------------------

describe("computeManifestDigest — determinism", () => {
  it("identical inputs produce identical digests", () => {
    const d1 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ["DRA-DOC-0001", "DRA-DOC-0002"]);
    const d2 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ["DRA-DOC-0001", "DRA-DOC-0002"]);
    expect(d1).toBe(d2);
  });

  it("changing document count changes the digest", () => {
    const d1 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ["DRA-DOC-0001", "DRA-DOC-0002"]);
    const d2 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 3, ["DRA-DOC-0001", "DRA-DOC-0002"]);
    expect(d1).not.toBe(d2);
  });

  it("changing documentIds order changes the digest", () => {
    const d1 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ["DRA-DOC-0001", "DRA-DOC-0002"]);
    const d2 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ["DRA-DOC-0002", "DRA-DOC-0001"]);
    expect(d1).not.toBe(d2);
  });

  it("changing corpusVersion changes the digest", () => {
    const d1 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 1, ["DRA-DOC-0001"]);
    const d2 = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-2.0.0", 1, ["DRA-DOC-0001"]);
    expect(d1).not.toBe(d2);
  });
});

describe("verifyManifestIntegrity", () => {
  it("returns true for a manifest with a correct overallDigest", () => {
    const ids = ["DRA-DOC-0001", "DRA-DOC-0002"] as const;
    const overallDigest = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ids);
    const manifest = {
      schemaVersion: CORPUS_SCHEMA_VERSION,
      corpusVersion: "DRA-CORPUS-1.0.0",
      documentCount: 2,
      documentIds: [...ids],
      overallDigest,
    };
    expect(verifyManifestIntegrity(manifest)).toBe(true);
  });

  it("returns false when overallDigest is tampered", () => {
    const manifest = {
      schemaVersion: CORPUS_SCHEMA_VERSION,
      corpusVersion: "DRA-CORPUS-1.0.0",
      documentCount: 1,
      documentIds: ["DRA-DOC-0001"],
      overallDigest: "c".repeat(64),
    };
    expect(verifyManifestIntegrity(manifest)).toBe(false);
  });
});
