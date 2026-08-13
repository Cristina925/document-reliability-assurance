/**
 * DRA-001-04A — Benchmark Corpus — Manifest Tests
 */

import { describe, it, expect } from "vitest";
import { CorpusRegistry } from "../registry.js";
import { verifyManifestIntegrity } from "../integrity.js";
import { CORPUS_SCHEMA_VERSION } from "../schema.js";
import {
  SAMPLE_CORPUS_INPUT_A,
  SAMPLE_CORPUS_INPUT_B,
  SAMPLE_CORPUS_INPUT_C,
} from "../fixtures/sample-inputs.js";

function makePopulatedRegistry() {
  const r = new CorpusRegistry();
  r.add(SAMPLE_CORPUS_INPUT_A);
  r.add(SAMPLE_CORPUS_INPUT_B);
  r.add(SAMPLE_CORPUS_INPUT_C);
  return r;
}

describe("CorpusManifest — structure", () => {
  it("manifest has schemaVersion matching CORPUS_SCHEMA_VERSION", () => {
    const registry = makePopulatedRegistry();
    const manifest = registry.exportManifest();
    expect(manifest.schemaVersion).toBe(CORPUS_SCHEMA_VERSION);
  });

  it("manifest has the correct documentCount", () => {
    const registry = makePopulatedRegistry();
    expect(registry.exportManifest().documentCount).toBe(3);
  });

  it("manifest documentIds are in canonical order", () => {
    // Add in reverse order to confirm sorting is applied.
    const registry = new CorpusRegistry();
    registry.add(SAMPLE_CORPUS_INPUT_C);
    registry.add(SAMPLE_CORPUS_INPUT_A);
    registry.add(SAMPLE_CORPUS_INPUT_B);
    const manifest = registry.exportManifest();
    expect(manifest.documentIds).toEqual([
      "DRA-DOC-0001",
      "DRA-DOC-0002",
      "DRA-DOC-0003",
    ]);
  });

  it("overallDigest is a 64-char hex string", () => {
    const manifest = makePopulatedRegistry().exportManifest();
    expect(manifest.overallDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(manifest.overallDigest)).toBe(true);
  });
});

describe("CorpusManifest — digest stability", () => {
  it("same registry state always produces the same overallDigest", () => {
    const r1 = makePopulatedRegistry();
    const r2 = makePopulatedRegistry();
    expect(r1.exportManifest().overallDigest).toBe(
      r2.exportManifest().overallDigest,
    );
  });

  it("insertion-order-independent: digest is stable regardless of add order", () => {
    const r1 = new CorpusRegistry();
    r1.add(SAMPLE_CORPUS_INPUT_A);
    r1.add(SAMPLE_CORPUS_INPUT_B);
    r1.add(SAMPLE_CORPUS_INPUT_C);

    const r2 = new CorpusRegistry();
    r2.add(SAMPLE_CORPUS_INPUT_C);
    r2.add(SAMPLE_CORPUS_INPUT_A);
    r2.add(SAMPLE_CORPUS_INPUT_B);

    expect(r1.exportManifest().overallDigest).toBe(
      r2.exportManifest().overallDigest,
    );
  });

  it("adding a document changes the overallDigest", () => {
    const r1 = new CorpusRegistry();
    r1.add(SAMPLE_CORPUS_INPUT_A);
    const d1 = r1.exportManifest().overallDigest;

    const r2 = new CorpusRegistry();
    r2.add(SAMPLE_CORPUS_INPUT_A);
    r2.add(SAMPLE_CORPUS_INPUT_B);
    const d2 = r2.exportManifest().overallDigest;

    expect(d1).not.toBe(d2);
  });
});

describe("CorpusManifest — integrity verification", () => {
  it("verifyManifestIntegrity returns true for an authentic manifest", () => {
    const manifest = makePopulatedRegistry().exportManifest();
    expect(verifyManifestIntegrity(manifest)).toBe(true);
  });

  it("verifyManifestIntegrity returns false after tampering with documentCount", () => {
    const manifest = makePopulatedRegistry().exportManifest();
    const tampered = { ...manifest, documentCount: 99 };
    expect(verifyManifestIntegrity(tampered)).toBe(false);
  });

  it("verifyManifestIntegrity returns false after tampering with documentIds", () => {
    const manifest = makePopulatedRegistry().exportManifest();
    const tampered = {
      ...manifest,
      documentIds: [...manifest.documentIds, "DRA-DOC-9999"],
    };
    expect(verifyManifestIntegrity(tampered)).toBe(false);
  });
});

describe("CorpusManifest — regeneration", () => {
  it("re-exporting manifest from same registry gives identical manifest", () => {
    const registry = makePopulatedRegistry();
    const m1 = registry.exportManifest();
    const m2 = registry.exportManifest();
    expect(m1.overallDigest).toBe(m2.overallDigest);
    expect(m1.documentCount).toBe(m2.documentCount);
    expect(m1.documentIds).toEqual(m2.documentIds);
  });

  it("manifest corpusVersion is carried through to overallDigest", () => {
    const registry = makePopulatedRegistry();
    const m1 = registry.exportManifest("DRA-CORPUS-1.0.0");
    const m2 = registry.exportManifest("DRA-CORPUS-2.0.0");
    expect(m1.overallDigest).not.toBe(m2.overallDigest);
  });
});
