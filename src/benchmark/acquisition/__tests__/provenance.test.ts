/**
 * DRA-001-04C — Provenance Tests
 */

import { describe, it, expect } from "vitest";
import {
  buildProvenance,
  computeProvenanceDigest,
  verifyProvenanceIntegrity,
  isProvenanceComplete,
  type ProvenanceRecord,
} from "../provenance.js";

const DIGEST = "a".repeat(64); // placeholder content digest

const BASE = {
  acquisitionSource: "SYNTHETIC" as const,
  acquisitionDate: "2026-07-27T10:00:00.000Z",
  documentOrigin: "internal:test-fixture",
  originalFilename: "doc_001.txt",
  licenceStatus: "INTERNAL" as const,
  contentDigest: DIGEST,
};

describe("computeProvenanceDigest", () => {
  it("returns a 64-char lowercase hex string", () => {
    const d = computeProvenanceDigest(
      BASE.acquisitionSource,
      BASE.acquisitionDate,
      BASE.documentOrigin,
      BASE.originalFilename,
      BASE.licenceStatus,
      BASE.contentDigest,
    );
    expect(d).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(d)).toBe(true);
  });

  it("is deterministic for identical inputs", () => {
    const d1 = computeProvenanceDigest(...Object.values(BASE) as Parameters<typeof computeProvenanceDigest>);
    const d2 = computeProvenanceDigest(...Object.values(BASE) as Parameters<typeof computeProvenanceDigest>);
    expect(d1).toBe(d2);
  });

  it("changes when acquisitionSource changes", () => {
    const d1 = computeProvenanceDigest("SYNTHETIC", BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest);
    const d2 = computeProvenanceDigest("CURATED", BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest);
    expect(d1).not.toBe(d2);
  });

  it("changes when contentDigest changes", () => {
    const d1 = computeProvenanceDigest(BASE.acquisitionSource, BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, "a".repeat(64));
    const d2 = computeProvenanceDigest(BASE.acquisitionSource, BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, "b".repeat(64));
    expect(d1).not.toBe(d2);
  });

  it("changes when licenceDetails is added", () => {
    const without = computeProvenanceDigest(BASE.acquisitionSource, BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest);
    const with_ = computeProvenanceDigest(BASE.acquisitionSource, BASE.acquisitionDate, BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest, "MIT");
    expect(without).not.toBe(with_);
  });

  it("changes when acquisitionDate changes", () => {
    const d1 = computeProvenanceDigest(BASE.acquisitionSource, "2026-01-01T00:00:00.000Z", BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest);
    const d2 = computeProvenanceDigest(BASE.acquisitionSource, "2026-06-01T00:00:00.000Z", BASE.documentOrigin, BASE.originalFilename, BASE.licenceStatus, BASE.contentDigest);
    expect(d1).not.toBe(d2);
  });
});

describe("buildProvenance", () => {
  it("creates a frozen ProvenanceRecord", () => {
    const r = buildProvenance(BASE);
    expect(Object.isFrozen(r)).toBe(true);
  });

  it("provenanceDigest has 64 chars", () => {
    const r = buildProvenance(BASE);
    expect(r.provenanceDigest).toHaveLength(64);
  });

  it("all input fields are preserved", () => {
    const r = buildProvenance(BASE);
    expect(r.acquisitionSource).toBe(BASE.acquisitionSource);
    expect(r.acquisitionDate).toBe(BASE.acquisitionDate);
    expect(r.documentOrigin).toBe(BASE.documentOrigin);
    expect(r.originalFilename).toBe(BASE.originalFilename);
    expect(r.licenceStatus).toBe(BASE.licenceStatus);
    expect(r.contentDigest).toBe(BASE.contentDigest);
  });

  it("licenceDetails is preserved when present", () => {
    const r = buildProvenance({ ...BASE, licenceDetails: "Apache-2.0" });
    expect(r.licenceDetails).toBe("Apache-2.0");
  });

  it("licenceDetails is absent when not provided", () => {
    const r = buildProvenance(BASE);
    expect("licenceDetails" in r).toBe(false);
  });

  it("same inputs → same provenanceDigest (deterministic)", () => {
    const r1 = buildProvenance(BASE);
    const r2 = buildProvenance(BASE);
    expect(r1.provenanceDigest).toBe(r2.provenanceDigest);
  });
});

describe("verifyProvenanceIntegrity", () => {
  it("returns true for an authentic record", () => {
    const r = buildProvenance(BASE);
    expect(verifyProvenanceIntegrity(r)).toBe(true);
  });

  it("returns false when documentOrigin is tampered", () => {
    const r = buildProvenance(BASE);
    const tampered: ProvenanceRecord = { ...r, documentOrigin: "tampered://origin" };
    expect(verifyProvenanceIntegrity(tampered)).toBe(false);
  });

  it("returns false when contentDigest is tampered", () => {
    const r = buildProvenance(BASE);
    const tampered: ProvenanceRecord = { ...r, contentDigest: "z".repeat(64) };
    expect(verifyProvenanceIntegrity(tampered)).toBe(false);
  });

  it("returns false when licenceStatus is tampered", () => {
    const r = buildProvenance(BASE);
    const tampered: ProvenanceRecord = { ...r, licenceStatus: "CC0" };
    expect(verifyProvenanceIntegrity(tampered)).toBe(false);
  });

  it("returns true for a record with licenceDetails", () => {
    const r = buildProvenance({ ...BASE, licenceDetails: "MIT" });
    expect(verifyProvenanceIntegrity(r)).toBe(true);
  });
});

describe("isProvenanceComplete", () => {
  it("returns true for a complete record", () => {
    const r = buildProvenance(BASE);
    expect(isProvenanceComplete(r)).toBe(true);
  });

  it("returns false when documentOrigin is empty", () => {
    const r = buildProvenance({ ...BASE, documentOrigin: "" });
    // provenanceDigest is derived from empty string — record will verify but not be complete
    const modified: ProvenanceRecord = { ...r, documentOrigin: "" };
    expect(isProvenanceComplete(modified)).toBe(false);
  });

  it("returns false when originalFilename is empty string", () => {
    const r = buildProvenance(BASE);
    const modified: ProvenanceRecord = { ...r, originalFilename: "" };
    expect(isProvenanceComplete(modified)).toBe(false);
  });

  it("returns false when contentDigest is wrong length", () => {
    const r = buildProvenance(BASE);
    const modified: ProvenanceRecord = { ...r, contentDigest: "short" };
    expect(isProvenanceComplete(modified)).toBe(false);
  });

  it("returns false when provenanceDigest is wrong length", () => {
    const r = buildProvenance(BASE);
    const modified: ProvenanceRecord = { ...r, provenanceDigest: "bad" };
    expect(isProvenanceComplete(modified)).toBe(false);
  });
});
