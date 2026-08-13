/**
 * DRA-ENG-007 — Materiality Assessment — Export Surface Tests
 *
 * Verifies that the Stage 5 public API exports exactly the required names
 * and does not export prohibited downstream-semantics names.
 */

import { describe, it, expect } from "vitest";
import * as stage5 from "../index.js";
import * as pkgRoot from "../../index.js";

// ---------------------------------------------------------------------------
// Required exports — Stage 5 module
// ---------------------------------------------------------------------------

describe("Stage 5 module exports — required names present", () => {
  it("exports assessMateriality", () => {
    expect(typeof stage5.assessMateriality).toBe("function");
  });

  it("exports ASSESSMENT_RULE_VERSION", () => {
    expect(typeof stage5.ASSESSMENT_RULE_VERSION).toBe("string");
    expect(stage5.ASSESSMENT_RULE_VERSION.length).toBeGreaterThan(0);
  });

  it("exports STAGE_5_ID", () => {
    expect(stage5.STAGE_5_ID).toBe("STAGE_5_MATERIALITY_ASSESSMENT");
  });

  it("exports STAGE_5_VERSION", () => {
    expect(typeof stage5.STAGE_5_VERSION).toBe("string");
    expect(stage5.STAGE_5_VERSION).toBe("1.0.0");
  });

  it("exports MATERIALITY_CLASSIFICATIONS", () => {
    expect(Array.isArray(stage5.MATERIALITY_CLASSIFICATIONS)).toBe(true);
    expect(stage5.MATERIALITY_CLASSIFICATIONS.length).toBe(6);
  });

  it("exports isMaterialityClassification", () => {
    expect(typeof stage5.isMaterialityClassification).toBe("function");
  });

  it("exports materialityPriority", () => {
    expect(typeof stage5.materialityPriority).toBe("function");
  });

  it("exports classifyMateriality", () => {
    expect(typeof stage5.classifyMateriality).toBe("function");
  });

  it("exports analyseStructure", () => {
    expect(typeof stage5.analyseStructure).toBe("function");
  });

  it("exports makeMaterialityRecordId", () => {
    expect(typeof stage5.makeMaterialityRecordId).toBe("function");
  });

  it("exports parseMaterialityRecordId", () => {
    expect(typeof stage5.parseMaterialityRecordId).toBe("function");
  });

  it("exports STAGE_5_RECORD_ID_PREFIX", () => {
    expect(stage5.STAGE_5_RECORD_ID_PREFIX).toBe("ar5");
  });
});

// ---------------------------------------------------------------------------
// Materiality classification set
// ---------------------------------------------------------------------------

describe("MATERIALITY_CLASSIFICATIONS", () => {
  const cls = stage5.MATERIALITY_CLASSIFICATIONS;

  it("contains CRITICAL", () => expect(cls).toContain("CRITICAL"));
  it("contains HIGH", () => expect(cls).toContain("HIGH"));
  it("contains MODERATE", () => expect(cls).toContain("MODERATE"));
  it("contains LOW", () => expect(cls).toContain("LOW"));
  it("contains INFORMATIONAL", () => expect(cls).toContain("INFORMATIONAL"));
  it("contains UNDETERMINED", () => expect(cls).toContain("UNDETERMINED"));
  it("has exactly 6 values", () => expect(cls.length).toBe(6));
});

// ---------------------------------------------------------------------------
// isMaterialityClassification guard
// ---------------------------------------------------------------------------

describe("isMaterialityClassification", () => {
  it("accepts all valid classifications", () => {
    for (const c of stage5.MATERIALITY_CLASSIFICATIONS) {
      expect(stage5.isMaterialityClassification(c)).toBe(true);
    }
  });

  it("rejects unknown strings", () => {
    expect(stage5.isMaterialityClassification("VERY_HIGH")).toBe(false);
    expect(stage5.isMaterialityClassification("CERTAIN")).toBe(false);
    expect(stage5.isMaterialityClassification("")).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(stage5.isMaterialityClassification(null)).toBe(false);
    expect(stage5.isMaterialityClassification(undefined)).toBe(false);
    expect(stage5.isMaterialityClassification(42)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// materialityPriority ordering
// ---------------------------------------------------------------------------

describe("materialityPriority", () => {
  it("CRITICAL < HIGH < MODERATE < LOW < INFORMATIONAL < UNDETERMINED", () => {
    const p = stage5.materialityPriority;
    expect(p("CRITICAL")).toBeLessThan(p("HIGH"));
    expect(p("HIGH")).toBeLessThan(p("MODERATE"));
    expect(p("MODERATE")).toBeLessThan(p("LOW"));
    expect(p("LOW")).toBeLessThan(p("INFORMATIONAL"));
    expect(p("INFORMATIONAL")).toBeLessThan(p("UNDETERMINED"));
  });
});

// ---------------------------------------------------------------------------
// Package root re-exports Stage 5 surface
// ---------------------------------------------------------------------------

describe("Package root re-exports Stage 5 surface", () => {
  it("re-exports assessMateriality", () => {
    expect(typeof (pkgRoot as Record<string, unknown>)["assessMateriality"]).toBe("function");
  });

  it("re-exports STAGE_5_ID", () => {
    expect((pkgRoot as Record<string, unknown>)["STAGE_5_ID"]).toBe("STAGE_5_MATERIALITY_ASSESSMENT");
  });

  it("re-exports MATERIALITY_CLASSIFICATIONS", () => {
    expect(Array.isArray((pkgRoot as Record<string, unknown>)["MATERIALITY_CLASSIFICATIONS"])).toBe(true);
  });

  it("re-exports STAGE_5_RECORD_ID_PREFIX", () => {
    expect((pkgRoot as Record<string, unknown>)["STAGE_5_RECORD_ID_PREFIX"]).toBe("ar5");
  });
});

// ---------------------------------------------------------------------------
// Prohibited exports (downstream-semantics boundary)
// ---------------------------------------------------------------------------

describe("Stage 5 module — prohibited exports absent", () => {
  const s5 = stage5 as Record<string, unknown>;

  it("does not export SUPPORTED decision", () => expect(s5["SUPPORTED"]).toBeUndefined());
  it("does not export REVIEW decision", () => expect(s5["REVIEW"]).toBeUndefined());
  it("does not export HOLD decision", () => expect(s5["HOLD"]).toBeUndefined());
  it("does not export issueClass or IssueClass", () => {
    expect(s5["issueClass"]).toBeUndefined();
    expect(s5["IssueClass"]).toBeUndefined();
  });
  it("does not export proofReceipt or ProofReceipt", () => {
    expect(s5["proofReceipt"]).toBeUndefined();
    expect(s5["ProofReceipt"]).toBeUndefined();
  });
  it("does not export confidence or confidenceScore", () => {
    expect(s5["confidence"]).toBeUndefined();
    expect(s5["confidenceScore"]).toBeUndefined();
  });
});
