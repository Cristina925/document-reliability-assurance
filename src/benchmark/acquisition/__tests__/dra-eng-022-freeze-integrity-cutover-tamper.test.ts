/**
 * DRA-ENG-022 — Currentness Integrity Cutover and Downgrade-Resistance:
 * unit tamper/legacy tests for the freeze-record integrity regime.
 *
 * Reproduces the DRA-ENG-021 residual bypass mechanically (§1), then proves
 * every §5 post-cutover attack scenario fails closed, and every §6 legacy
 * compatibility property holds.
 */

import { describe, it, expect } from "vitest";
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
  verifyAcquisitionCurrentnessIntegrity,
  FREEZE_INTEGRITY_SCHEMA_VERSION_V2,
  type AcquisitionFreezeRecord,
  type CreateAcquisitionFreezeRecordInput,
} from "../freeze.js";
import type { CurrentnessAssessment } from "../currentness.js";
import type { NormalisedDocument } from "../normalisation.js";

const NORMALISED: NormalisedDocument = {
  text: "Example normalised document text.",
  textDigest: "a".repeat(64),
  sourceDigest: "b".repeat(64),
  encoding: "utf-8",
  normalisationVersion: "DRA-NORM-v1",
  warnings: [],
};

const CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_SUPERSEDED",
  relatedDocumentIdentifier: "Successor Standard v2",
  relatedCorpusDocumentId: "DRA-DOC-TEST-999",
  evidenceUrl: "https://example.gov/catalog/standard",
  evidenceQuote: "Withdrawn; superseded by v2.",
  assessedBy: "test-operator",
  assessedAt: "2026-08-11T12:00:00.000Z",
};

function baseInput(overrides: Partial<CreateAcquisitionFreezeRecordInput> = {}): CreateAcquisitionFreezeRecordInput {
  return {
    freezeRecordId: "DRA-FRZ-TEST-022",
    corpusDocumentId: "DRA-DOC-TEST-022",
    acquisitionId: "DRA-ACQ-TEST-022",
    sourceUrl: "https://example.gov/doc",
    finalUrl: "https://example.gov/doc",
    sourceDigest: "b".repeat(64),
    normalised: NORMALISED,
    metadataDigest: "c".repeat(64),
    frozenBy: "test-operator",
    benchmarkVersion: "1.0.0",
    fixedTimestamp: "2026-08-11T12:00:00.000Z",
    ...overrides,
  };
}

describe("DRA-ENG-022 §1 — reproduce the ENG-021 residual bypass mechanically", () => {
  it("stripping BOTH currentness-integrity fields from a legitimate legacy-style record makes it " +
    "verify as a record that never had a currentness assessment — the exact residual bypass", () => {
      const legitimate = createAcquisitionFreezeRecord(
        baseInput({ currentnessAssessment: CURRENTNESS }),
      );
      expect(legitimate.currentnessAssertionDigest).toBeDefined();

      const stripped = { ...legitimate } as Record<string, unknown>;
      delete stripped["currentnessAssessment"];
      delete stripped["currentnessAssertionDigest"];
      delete stripped["currentnessIntegritySchemaVersion"];

      // ENG-021's own check is vacuously satisfied — it cannot tell "never
      // assessed" apart from "assessed, then stripped".
      expect(verifyAcquisitionCurrentnessIntegrity(stripped as never)).toBe(true);
      // Pre-ENG-022 freezeRecordDigest formula never covered currentness at
      // all, so it is unaffected either way — this is the missing
      // authenticated distinction the audit must identify as root cause.
      expect(verifyAcquisitionFreezeRecordDigest(stripped as never)).toBe(true);
    });
});

describe("DRA-ENG-022 §5 — post-cutover (V2) fail-closed behaviour", () => {
  function v2WithCurrentness(): AcquisitionFreezeRecord {
    return createAcquisitionFreezeRecord(
      baseInput({ currentnessAssessment: CURRENTNESS, freezeIntegrityRegime: "V2" }),
    );
  }

  it("baseline: a genuine V2 record with currentness verifies", () => {
    const record = v2WithCurrentness();
    expect(record.freezeIntegritySchemaVersion).toBe(FREEZE_INTEGRITY_SCHEMA_VERSION_V2);
    expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);
    expect(verifyAcquisitionCurrentnessIntegrity(record)).toBe(true);
  });

  it("ATTACK 1: removes currentnessAssertionDigest only", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record } as Record<string, unknown>;
    delete tampered["currentnessAssertionDigest"];
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 2: removes currentnessIntegritySchemaVersion (the ENG-021 proof-reference-equivalent field)", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record } as Record<string, unknown>;
    delete tampered["currentnessIntegritySchemaVersion"];
    // verifyAcquisitionCurrentnessIntegrity already catches this asymmetry.
    expect(verifyAcquisitionCurrentnessIntegrity(tampered as never)).toBe(false);
  });

  it("ATTACK 3: removes BOTH currentness-integrity fields (the ENG-021 residual bypass) — " +
    "now caught by freezeRecordDigest itself", () => {
      const record = v2WithCurrentness();
      const stripped = { ...record } as Record<string, unknown>;
      delete stripped["currentnessAssessment"];
      delete stripped["currentnessAssertionDigest"];
      delete stripped["currentnessIntegritySchemaVersion"];
      // Still claims V2 — this is the "looks like never-assessed V2 record"
      // shape. freezeRecordDigest was baked with the real digest bound in,
      // so recomputing with currentnessBinding=null must fail.
      expect(verifyAcquisitionFreezeRecordDigest(stripped as never)).toBe(false);
    });

  it("ATTACK 4: changes the integrity/schema version to a legacy-looking absence (marker deleted)", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record } as Record<string, unknown>;
    delete tampered["freezeIntegritySchemaVersion"];
    // Now indistinguishable in shape from a legacy record — verifier falls
    // back to the legacy formula, which does not match the V2-computed digest.
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 5: removes the version/cutover marker while keeping currentness fields present", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record } as Record<string, unknown>;
    delete tampered["freezeIntegritySchemaVersion"];
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 6: substitutes a fully legacy-looking structure (strip marker + both currentness fields)", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record } as Record<string, unknown>;
    delete tampered["freezeIntegritySchemaVersion"];
    delete tampered["currentnessAssessment"];
    delete tampered["currentnessAssertionDigest"];
    delete tampered["currentnessIntegritySchemaVersion"];
    // Structurally now looks exactly like a genuine legacy record with no
    // currentness assessment — but its freezeRecordDigest was computed
    // under the V2 formula (which bound in the real currentness digest), so
    // the legacy-formula recomputation triggered by marker-absence fails.
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 7: changes the currentness assessment while retaining the original digest", () => {
    const record = v2WithCurrentness();
    const tampered = {
      ...record,
      currentnessAssessment: { ...record.currentnessAssessment, currentnessStatus: "CONFIRMED_CURRENT" },
    };
    expect(verifyAcquisitionCurrentnessIntegrity(tampered as never)).toBe(false);
    // freezeRecordDigest binds the DIGEST value, not the assessment content
    // itself, so it is unaffected — this attack is caught by the ENG-021
    // check, which remains active and load-bearing under V2 too.
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(true);
  });

  it("ATTACK 8: changes the digest while retaining the original assertion", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record, currentnessAssertionDigest: "f".repeat(64) };
    expect(verifyAcquisitionCurrentnessIntegrity(tampered as never)).toBe(false);
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 9: changes the freeze-record identity to which the assertion is bound", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record, freezeRecordId: "DRA-FRZ-DIFFERENT" };
    expect(verifyAcquisitionCurrentnessIntegrity(tampered as never)).toBe(false);
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 10: supplies an unknown/future unsupported integrity version", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record, freezeIntegritySchemaVersion: "dra-freeze-integrity-v99-unknown" };
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("ATTACK 11: supplies malformed/internally inconsistent version metadata (empty string)", () => {
    const record = v2WithCurrentness();
    const tampered = { ...record, freezeIntegritySchemaVersion: "" };
    expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
  });

  it("also closes the bypass for a V2 record that legitimately had NO currentness assessment: " +
    "stripping the marker still fails, because V2's null-binding is also baked into the digest", () => {
      const record = createAcquisitionFreezeRecord(baseInput({ freezeIntegrityRegime: "V2" }));
      expect(record.currentnessAssessment).toBeUndefined();
      expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);

      const tampered = { ...record } as Record<string, unknown>;
      delete tampered["freezeIntegritySchemaVersion"];
      expect(verifyAcquisitionFreezeRecordDigest(tampered as never)).toBe(false);
    });
});

describe("DRA-ENG-022 §6 — legacy compatibility", () => {
  it("a genuine legacy record (no freezeIntegrityRegime opt-in) continues to verify", () => {
    const record = createAcquisitionFreezeRecord(baseInput());
    expect(record.freezeIntegritySchemaVersion).toBeUndefined();
    expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);
  });

  it("a genuine legacy record with a currentness assessment (ENG-020/021-style) continues to verify, " +
    "and is NOT incorrectly required to carry freezeIntegritySchemaVersion", () => {
      const record = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS }));
      expect(record.freezeIntegritySchemaVersion).toBeUndefined();
      expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);
      expect(verifyAcquisitionCurrentnessIntegrity(record)).toBe(true);
    });

  it("retains its exact historical digest formula: legacy freezeRecordDigest is IDENTICAL whether or " +
    "not a currentnessAssessment is present (the ENG-021 invariant, unperturbed by ENG-022)", () => {
      const without = createAcquisitionFreezeRecord(baseInput());
      const withCurrentness = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS }));
      expect(withCurrentness.freezeRecordDigest).toBe(without.freezeRecordDigest);
    });

  it("is not silently upgraded during verification: a legacy record's absence of " +
    "freezeIntegritySchemaVersion is verified via the legacy formula, never coerced into the V2 path", () => {
      const record = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS }));
      // If verification silently "upgraded" this record to V2 semantics, it
      // would try to fold a currentnessBinding into the digest and FAIL,
      // since this record's digest was computed by the legacy formula.
      expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);
    });

  it("retains original proof semantics: verifyAcquisitionCurrentnessIntegrity's ENG-021 tamper " +
    "detection is fully preserved for legacy records under ENG-022", () => {
      const record = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS }));
      const tampered = {
        ...record,
        currentnessAssessment: { ...record.currentnessAssessment, currentnessStatus: "CONFIRMED_CURRENT" },
      };
      expect(verifyAcquisitionCurrentnessIntegrity(tampered as never)).toBe(false);
    });
});

describe("DRA-ENG-022 — determinism", () => {
  it("V2 freezeRecordDigest is deterministic across repeated calls with identical inputs", () => {
    const a = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS, freezeIntegrityRegime: "V2" }));
    const b = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: { ...CURRENTNESS }, freezeIntegrityRegime: "V2" }));
    expect(a.freezeRecordDigest).toBe(b.freezeRecordDigest);
    expect(a.currentnessAssertionDigest).toBe(b.currentnessAssertionDigest);
  });

  it("V2 and legacy digests for the SAME content are different (distinct regimes, distinct formulas)", () => {
    const legacy = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS }));
    const v2 = createAcquisitionFreezeRecord(baseInput({ currentnessAssessment: CURRENTNESS, freezeIntegrityRegime: "V2" }));
    expect(v2.freezeRecordDigest).not.toBe(legacy.freezeRecordDigest);
  });
});
