/**
 * DRA-001-04C — Acquisition Pipeline Tests
 */

import { describe, it, expect } from "vitest";
import { AcquisitionPipeline, AcquisitionError } from "../pipeline.js";
import type { AcquisitionInput } from "../pipeline.js";
import { verifyContentIntegrity } from "../../governance/eligibility.js";
import { verifyProvenanceIntegrity } from "../provenance.js";

function baseInput(overrides: Partial<AcquisitionInput> = {}): AcquisitionInput {
  return {
    originalFilename: "doc.txt",
    acquisitionSource: "SYNTHETIC",
    documentOrigin: "internal:fixture",
    licenceStatus: "INTERNAL",
    acquisitionDate: "2026-07-27T00:00:00.000Z",
    title: "Test Document",
    domain: "GENERAL",
    documentType: "SUMMARY",
    difficulty: "LOW",
    sourceType: "AI_GENERATED",
    language: "en",
    generator: "TestGen v1",
    creationMethod: "Automated test fixture generation",
    sourceReference: "internal:test",
    benchmarkStatus: "DRAFT",
    sourceText: "This is the source material provided to the generator for document creation.",
    generatedText: "This is the generated document output that will be benchmarked and evaluated.",
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
    ...overrides,
  };
}

describe("AcquisitionPipeline — ID assignment", () => {
  it("assigns DRA-DOC-0001 for the first document", () => {
    const pipeline = new AcquisitionPipeline();
    const doc = pipeline.acquire(baseInput());
    expect(doc.corpusId).toBe("DRA-DOC-0001");
  });

  it("assigns sequential IDs for multiple documents", () => {
    const pipeline = new AcquisitionPipeline();
    const d1 = pipeline.acquire(baseInput({ title: "Doc A", generatedText: "Alpha content unique to first document." }));
    const d2 = pipeline.acquire(baseInput({ title: "Doc B", generatedText: "Beta content unique to second document." }));
    expect(d1.corpusId).toBe("DRA-DOC-0001");
    expect(d2.corpusId).toBe("DRA-DOC-0002");
  });

  it("respects startingId constructor parameter", () => {
    const pipeline = new AcquisitionPipeline(50);
    const doc = pipeline.acquire(baseInput());
    expect(doc.corpusId).toBe("DRA-DOC-0050");
  });

  it("tracks processedCount accurately", () => {
    const pipeline = new AcquisitionPipeline();
    expect(pipeline.processedCount).toBe(0);
    pipeline.acquire(baseInput({ generatedText: "Unique content A for count test." }));
    pipeline.acquire(baseInput({ generatedText: "Unique content B for count test." }));
    expect(pipeline.processedCount).toBe(2);
  });

  it("nextSequenceValue advances after each acquisition", () => {
    const pipeline = new AcquisitionPipeline();
    expect(pipeline.nextSequenceValue).toBe(1);
    pipeline.acquire(baseInput());
    expect(pipeline.nextSequenceValue).toBe(2);
  });
});

describe("AcquisitionPipeline — content integrity", () => {
  it("sourceContent digest is the SHA-256 of sourceText", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(verifyContentIntegrity(doc.sourceContent)).toBe(true);
  });

  it("generatedContent digest is the SHA-256 of generatedText", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(verifyContentIntegrity(doc.generatedContent)).toBe(true);
  });

  it("sourceContent.contentType is SOURCE", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(doc.sourceContent.contentType).toBe("SOURCE");
  });

  it("generatedContent.contentType is GENERATED", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(doc.generatedContent.contentType).toBe("GENERATED");
  });

  it("different generatedText → different contentDigest", () => {
    const p = new AcquisitionPipeline();
    const d1 = p.acquire(baseInput({ generatedText: "Text alpha for document one." }));
    const d2 = p.acquire(baseInput({ generatedText: "Text beta for document two." }));
    expect(d1.generatedContent.contentDigest).not.toBe(d2.generatedContent.contentDigest);
  });
});

describe("AcquisitionPipeline — provenance", () => {
  it("provenance digest is authentic (verifyProvenanceIntegrity=true)", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(verifyProvenanceIntegrity(doc.provenance)).toBe(true);
  });

  it("provenance.contentDigest matches generatedContent.contentDigest", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(doc.provenance.contentDigest).toBe(doc.generatedContent.contentDigest);
  });

  it("provenance carries all input metadata", () => {
    const input = baseInput({ acquisitionSource: "CURATED", licenceStatus: "CC0", licenceDetails: "CC0-1.0" });
    const doc = new AcquisitionPipeline().acquire(input);
    expect(doc.provenance.acquisitionSource).toBe("CURATED");
    expect(doc.provenance.licenceStatus).toBe("CC0");
    expect(doc.provenance.licenceDetails).toBe("CC0-1.0");
    expect(doc.provenance.originalFilename).toBe(input.originalFilename);
    expect(doc.provenance.acquisitionDate).toBe(input.acquisitionDate);
  });
});

describe("AcquisitionPipeline — metadata preservation", () => {
  it("all corpus metadata fields are preserved on the document", () => {
    const input = baseInput({
      domain: "LEGAL",
      documentType: "REPORT",
      difficulty: "HIGH",
      language: "en",
      sourceType: "HUMAN_AUTHORED",
    });
    const doc = new AcquisitionPipeline().acquire(input);
    expect(doc.domain).toBe("LEGAL");
    expect(doc.documentType).toBe("REPORT");
    expect(doc.difficulty).toBe("HIGH");
    expect(doc.language).toBe("en");
    expect(doc.sourceType).toBe("HUMAN_AUTHORED");
  });

  it("governance flags are preserved", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput({
      evaluatorInfluenced: false,
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    }));
    expect(doc.evaluatorInfluenced).toBe(false);
    expect(doc.hasPreannotatedOutcome).toBe(false);
    expect(doc.sourceVerifiable).toBe(true);
  });

  it("returned document is frozen (immutable)", () => {
    const doc = new AcquisitionPipeline().acquire(baseInput());
    expect(Object.isFrozen(doc)).toBe(true);
  });
});

describe("AcquisitionPipeline — error handling", () => {
  it("throws EMPTY_FILENAME when originalFilename is blank", () => {
    let err: AcquisitionError | undefined;
    try { new AcquisitionPipeline().acquire(baseInput({ originalFilename: "  " })); }
    catch (e) { err = e as AcquisitionError; }
    expect(err).toBeInstanceOf(AcquisitionError);
    expect(err?.code).toBe("EMPTY_FILENAME");
  });

  it("throws EMPTY_ORIGIN when documentOrigin is blank", () => {
    let err: AcquisitionError | undefined;
    try { new AcquisitionPipeline().acquire(baseInput({ documentOrigin: "" })); }
    catch (e) { err = e as AcquisitionError; }
    expect(err?.code).toBe("EMPTY_ORIGIN");
  });

  it("throws EMPTY_SOURCE_CONTENT when sourceText is blank", () => {
    let err: AcquisitionError | undefined;
    try { new AcquisitionPipeline().acquire(baseInput({ sourceText: "  " })); }
    catch (e) { err = e as AcquisitionError; }
    expect(err?.code).toBe("EMPTY_SOURCE_CONTENT");
  });

  it("throws EMPTY_GENERATED_CONTENT when generatedText is blank", () => {
    let err: AcquisitionError | undefined;
    try { new AcquisitionPipeline().acquire(baseInput({ generatedText: "" })); }
    catch (e) { err = e as AcquisitionError; }
    expect(err?.code).toBe("EMPTY_GENERATED_CONTENT");
  });

  it("throws INVALID_ACQUISITION_DATE when acquisitionDate is blank", () => {
    let err: AcquisitionError | undefined;
    try { new AcquisitionPipeline().acquire(baseInput({ acquisitionDate: " " })); }
    catch (e) { err = e as AcquisitionError; }
    expect(err?.code).toBe("INVALID_ACQUISITION_DATE");
  });

  it("does not advance ID counter on failure", () => {
    const pipeline = new AcquisitionPipeline();
    try { pipeline.acquire(baseInput({ originalFilename: "" })); } catch { /* expected */ }
    // After a failed acquisition, the counter should NOT have advanced
    // (the ID is assigned after validation — so it's NOT incremented)
    expect(pipeline.nextSequenceValue).toBe(1);
  });
});
