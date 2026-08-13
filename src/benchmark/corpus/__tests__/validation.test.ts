/**
 * DRA-001-04A — Benchmark Corpus — Validation Tests
 */

import { describe, it, expect } from "vitest";
import {
  validateCorpusId,
  validateCorpusDocumentInput,
  validateCorpusDocument,
  validateRegistryIntegrity,
  validateManifest,
  validateManifestAgainstRegistry,
} from "../validation.js";
import { CorpusRegistry } from "../registry.js";
import { computeCorpusDocumentDigest, computeManifestDigest } from "../integrity.js";
import { CORPUS_SCHEMA_VERSION } from "../schema.js";
import {
  SAMPLE_CORPUS_INPUT_A,
  SAMPLE_CORPUS_INPUT_B,
} from "../fixtures/sample-inputs.js";

// ---------------------------------------------------------------------------
// validateCorpusId
// ---------------------------------------------------------------------------

describe("validateCorpusId", () => {
  it("accepts a valid corpus ID", () => {
    const result = validateCorpusId("DRA-DOC-0001");
    expect(result.ok).toBe(true);
  });

  it("rejects a malformed ID with INVALID_CORPUS_ID", () => {
    const result = validateCorpusId("DRA-DOC-001");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_CORPUS_ID");
  });

  it("rejects a number with INVALID_CORPUS_ID", () => {
    const result = validateCorpusId(42);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_CORPUS_ID");
  });

  it("rejects null with INVALID_CORPUS_ID", () => {
    const result = validateCorpusId(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_CORPUS_ID");
  });
});

// ---------------------------------------------------------------------------
// validateCorpusDocumentInput
// ---------------------------------------------------------------------------

describe("validateCorpusDocumentInput", () => {
  it("accepts a valid document input", () => {
    const result = validateCorpusDocumentInput(SAMPLE_CORPUS_INPUT_A);
    expect(result.ok).toBe(true);
  });

  it("rejects null with INVALID_SCHEMA", () => {
    const result = validateCorpusDocumentInput(null);
    expect(result.ok).toBe(false);
  });

  it("rejects a document with a missing required field (title)", () => {
    const { title: _, ...noTitle } = SAMPLE_CORPUS_INPUT_A;
    const result = validateCorpusDocumentInput(noTitle);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("MISSING_REQUIRED_FIELD");
  });

  it("rejects an invalid domain enum value", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, domain: "SPACE" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_ENUM");
  });

  it("rejects an invalid documentType enum value", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, documentType: "MEMO" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_ENUM");
  });

  it("rejects an invalid difficulty enum value", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, difficulty: "VERY_HIGH" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_ENUM");
  });

  it("rejects an invalid benchmarkStatus enum value", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, benchmarkStatus: "PUBLISHED" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_ENUM");
  });

  it("rejects an invalid sourceType enum value", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, sourceType: "BOT_GENERATED" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_ENUM");
  });

  it("rejects a malformed corpus ID", () => {
    const bad = { ...SAMPLE_CORPUS_INPUT_A, corpusId: "DOC-001" };
    const result = validateCorpusDocumentInput(bad);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateCorpusDocument (with integrityDigest)
// ---------------------------------------------------------------------------

describe("validateCorpusDocument", () => {
  it("accepts a document with a correct integrity digest", () => {
    const digest = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const doc = { ...SAMPLE_CORPUS_INPUT_A, integrityDigest: digest };
    const result = validateCorpusDocument(doc);
    expect(result.ok).toBe(true);
  });

  it("rejects a document with an incorrect integrity digest", () => {
    const doc = { ...SAMPLE_CORPUS_INPUT_A, integrityDigest: "x".repeat(64) };
    const result = validateCorpusDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INTEGRITY_DIGEST_MISMATCH");
  });

  it("rejects a document with a tampered field even if digest length is correct", () => {
    const digest = computeCorpusDocumentDigest(SAMPLE_CORPUS_INPUT_A);
    const doc = {
      ...SAMPLE_CORPUS_INPUT_A,
      title: "Tampered",
      integrityDigest: digest, // digest is for original title
    };
    const result = validateCorpusDocument(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INTEGRITY_DIGEST_MISMATCH");
  });
});

// ---------------------------------------------------------------------------
// validateRegistryIntegrity
// ---------------------------------------------------------------------------

describe("validateRegistryIntegrity", () => {
  it("passes for a registry with correctly-computed digests", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    registry.add(SAMPLE_CORPUS_INPUT_B);
    const result = validateRegistryIntegrity(registry);
    expect(result.ok).toBe(true);
  });

  it("passes for an empty registry", () => {
    expect(validateRegistryIntegrity(new CorpusRegistry()).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateManifest
// ---------------------------------------------------------------------------

describe("validateManifest", () => {
  it("accepts a valid manifest from the registry", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    const result = validateManifest(manifest);
    expect(result.ok).toBe(true);
  });

  it("rejects null input", () => {
    const result = validateManifest(null);
    expect(result.ok).toBe(false);
  });

  it("rejects a manifest with a tampered overallDigest", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    const tampered = { ...manifest, overallDigest: "d".repeat(64) };
    const result = validateManifest(tampered);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("MANIFEST_DIGEST_MISMATCH");
  });

  it("rejects a manifest with an invalid schemaVersion", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    const tampered = { ...manifest, schemaVersion: "99.0" };
    const result = validateManifest(tampered);
    expect(result.ok).toBe(false);
  });

  it("rejects a manifest missing documentCount", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const { documentCount: _, ...noCount } = registry.exportManifest();
    const result = validateManifest(noCount);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateManifestAgainstRegistry
// ---------------------------------------------------------------------------

describe("validateManifestAgainstRegistry", () => {
  it("passes when manifest matches the registry state", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const manifest = registry.exportManifest();
    const result = validateManifestAgainstRegistry(manifest, registry);
    expect(result.ok).toBe(true);
  });

  it("fails when manifest documentCount does not match registry size", () => {
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_A);
    const ids = ["DRA-DOC-0001"] as const;
    // Craft a manifest claiming 2 documents when registry has 1.
    const overallDigest = computeManifestDigest(CORPUS_SCHEMA_VERSION, "DRA-CORPUS-1.0.0", 2, ids);
    const badManifest = {
      schemaVersion: CORPUS_SCHEMA_VERSION,
      corpusVersion: "DRA-CORPUS-1.0.0",
      documentCount: 2,
      documentIds: [...ids],
      overallDigest,
    };
    const result = validateManifestAgainstRegistry(badManifest, registry);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_MANIFEST");
  });
});
