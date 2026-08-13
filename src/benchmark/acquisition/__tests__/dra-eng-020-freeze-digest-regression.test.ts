/**
 * DRA-ENG-020 — Freeze-digest backward-compatibility regression test.
 *
 * Proves that adding a currentnessAssessment to an AcquisitionFreezeRecord
 * (via CreateAcquisitionFreezeRecordInput) does not change freezeRecordDigest.
 * This is the structural guarantee that the 31-document corpus's existing
 * freeze records remain byte-for-byte valid after this programme — no
 * existing document silently acquires a fabricated currentness status, and
 * no existing digest is perturbed by the presence/absence of this field.
 */

import { describe, it, expect } from "vitest";
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
  type CreateAcquisitionFreezeRecordInput,
} from "../freeze.js";
import { computeSourceDigest } from "../integrity.js";
import { normaliseContent } from "../normalisation.js";
import { NIST_FIPS_199_FIXTURE } from "../fixtures/public-document-fixture.js";
import type { CurrentnessAssessment } from "../currentness.js";

const FIXED_TS = "2026-08-11T15:30:00.000Z";

function makeFixtureBytes(): Uint8Array {
  return new TextEncoder().encode(NIST_FIPS_199_FIXTURE.text);
}

async function makeNormalisedFixture() {
  const bytes = makeFixtureBytes();
  const sourceDigest = computeSourceDigest(bytes);
  const normResult = await normaliseContent(bytes, "text/plain", sourceDigest);
  if (!normResult.ok) throw new Error("normalisation failed in test setup");
  return { bytes, sourceDigest, normalised: normResult.document };
}

const SAMPLE_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_CURRENT",
  evidenceUrl: "https://example.gov/catalog/fips-199",
  evidenceQuote: "FIPS PUB 199 remains in effect; no rescission notice on file.",
  assessedBy: "test-operator",
  assessedAt: FIXED_TS,
};

describe("DRA-ENG-020 — freezeRecordDigest is unaffected by currentnessAssessment", () => {
  it("produces an identical freezeRecordDigest with and without currentnessAssessment present", async () => {
    const { normalised, sourceDigest } = await makeNormalisedFixture();

    const baseInput: CreateAcquisitionFreezeRecordInput = {
      freezeRecordId: "DRA-FRZ-TEST-020-A",
      corpusDocumentId: "DRA-DOC-TEST-020",
      acquisitionId: "DRA-ACQ-TEST-020",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest,
      normalised,
      metadataDigest: "0".repeat(64),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    };

    const withoutCurrentness = createAcquisitionFreezeRecord(baseInput);
    const withCurrentness = createAcquisitionFreezeRecord({
      ...baseInput,
      currentnessAssessment: SAMPLE_CURRENTNESS,
    });

    expect(withoutCurrentness.currentnessAssessment).toBeUndefined();
    expect(withCurrentness.currentnessAssessment).toEqual(SAMPLE_CURRENTNESS);

    // The critical regression guarantee: digest is byte-identical either way.
    expect(withCurrentness.freezeRecordDigest).toBe(withoutCurrentness.freezeRecordDigest);

    // Both records must still independently verify as valid.
    expect(verifyAcquisitionFreezeRecordDigest(withoutCurrentness)).toBe(true);
    expect(verifyAcquisitionFreezeRecordDigest(withCurrentness)).toBe(true);
  });

  it("does not fabricate a currentnessAssessment when none is supplied (absence, not default-current)", async () => {
    const { normalised, sourceDigest } = await makeNormalisedFixture();
    const record = createAcquisitionFreezeRecord({
      freezeRecordId: "DRA-FRZ-TEST-020-B",
      corpusDocumentId: "DRA-DOC-TEST-020B",
      acquisitionId: "DRA-ACQ-TEST-020B",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest,
      normalised,
      metadataDigest: "0".repeat(64),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    });
    expect("currentnessAssessment" in record).toBe(false);
  });
});
