/**
 * DRA-ENG-021 — Pipeline-level integration tests (fast, mock fetcher, no live
 * network) for the currentness assertion digest.
 *
 * Verifies:
 *   - createAcquisitionFreezeRecord attaches currentnessAssertionDigest +
 *     currentnessIntegritySchemaVersion iff currentnessAssessment is present.
 *   - freezeRecordDigest is byte-identical whether or not the new fields are
 *     present (historical-digest preservation, at the pipeline level).
 *   - acquireFreezeAndEvaluate surfaces currentnessAssertionDigest on
 *     BenchmarkProofReference.
 *   - evaluateFrozenBenchmarkDocument REJECTS a freeze record whose
 *     currentnessAssessment was altered after the digest was computed,
 *     without the digest being recomputed/reissued (the tamper-detection
 *     enforcement point).
 *   - evaluateFrozenBenchmarkDocument still ACCEPTS the untampered record.
 */

import { describe, it, expect } from "vitest";
import { createAcquisitionRequest } from "../request.js";
import { OfficialSourceAssessmentSchema } from "../schema.js";
import { createMockFetcher } from "../fetcher.js";
import { LicenceAssessmentSchema } from "../licence.js";
import {
  acquireFreezeAndEvaluate,
  evaluateFrozenBenchmarkDocument,
} from "../governed-pipeline.js";
import {
  verifyAcquisitionFreezeRecordDigest,
  verifyAcquisitionCurrentnessIntegrity,
} from "../freeze.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { NIST_FIPS_199_FIXTURE, NIST_FIPS_199_TEXT } from "../fixtures/public-document-fixture.js";
import type { CurrentnessAssessment } from "../currentness.js";

const FIXED_TS = "2026-08-11T17:00:00.000Z";

function makeApprovedMetadata() {
  return {
    title: NIST_FIPS_199_FIXTURE.title,
    publisher: NIST_FIPS_199_FIXTURE.publisher,
    publicationDate: "2004-02",
    domain: "TECHNICAL" as const,
    documentType: "POLICY" as const,
    difficulty: "MEDIUM" as const,
    language: "en",
    wordCount: NIST_FIPS_199_FIXTURE.wordCount,
  };
}

function makeFixtureBytes(): Uint8Array {
  return new TextEncoder().encode(NIST_FIPS_199_TEXT);
}

function makeFixtureFetcher() {
  const responses = new Map([
    [
      NIST_FIPS_199_FIXTURE.officialSourceUrl,
      { httpStatus: 200, mediaType: "text/plain", body: NIST_FIPS_199_TEXT },
    ],
  ]);
  return createMockFetcher(responses, FIXED_TS);
}

function makeOfficialSourceAssessment() {
  return OfficialSourceAssessmentSchema.parse({
    status: "VERIFIED",
    assessedBy: "test-reviewer",
    assessedAt: "2026-08-11T09:00:00",
    evidence: ["NIST.gov domain confirmed"],
  });
}

function makeLicenceAssessment() {
  return LicenceAssessmentSchema.parse({
    status: "VERIFIED",
    licenceName: "US Government Work",
    licenceBasis: "US_GOVERNMENT_WORK",
    evidence: ["17 U.S.C. § 105 applies to NIST publications"],
    assessedBy: "test-reviewer",
    assessedAt: "2026-08-11T09:00:00",
  });
}

const SAMPLE_CURRENTNESS: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_SUPERSEDED",
  relatedDocumentIdentifier: "Example Successor Standard",
  relatedCorpusDocumentId: "DRA-DOC-0099",
  evidenceUrl: "https://example.gov/catalog/fips-199",
  evidenceQuote: "Withdrawn; superseded by the successor standard.",
  assessedBy: "test-operator",
  assessedAt: FIXED_TS,
};

function makePipelineInput(overrides: Record<string, unknown> = {}) {
  const reqResult = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000001",
    sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
    requestedBy: "test-operator",
    requestedAt: FIXED_TS,
  });
  if (!reqResult.ok) throw new Error("request invalid");
  return {
    request: reqResult.request,
    officialSourceAssessment: makeOfficialSourceAssessment(),
    licenceAssessment: makeLicenceAssessment(),
    approvedMetadata: makeApprovedMetadata(),
    corpusDocumentId: "DRA-DOC-0007",
    freezeRecordId: "DRA-FRZ-000001",
    frozenBy: "test-operator",
    benchmarkVersion: "1.0.0",
    inclusionRationale: "NIST FIPS 199 is the federal standard for security categorization.",
    ...overrides,
  };
}

function makeDeps(registry: CorpusRegistry) {
  return {
    fetcher: makeFixtureFetcher(),
    registry,
    protocol: buildMinimalProtocol(),
    fixedTimestamp: FIXED_TS,
  };
}

describe("DRA-ENG-021 — pipeline integration: currentness assertion digest", () => {
  it("acquireFreezeAndEvaluate attaches currentnessAssertionDigest to the freeze record and " +
    "surfaces it on BenchmarkProofReference, without perturbing freezeRecordDigest", async () => {
    const registryWith = new CorpusRegistry();
    const withCurrentness = await acquireFreezeAndEvaluate(
      makePipelineInput({ currentnessAssessment: SAMPLE_CURRENTNESS }),
      makeDeps(registryWith),
    );
    expect(withCurrentness.ok).toBe(true);
    if (!withCurrentness.ok) return;

    const registryWithout = new CorpusRegistry();
    const withoutCurrentness = await acquireFreezeAndEvaluate(
      makePipelineInput(),
      makeDeps(registryWithout),
    );
    expect(withoutCurrentness.ok).toBe(true);
    if (!withoutCurrentness.ok) return;

    // New fields present iff currentnessAssessment was supplied.
    expect(withCurrentness.result.freeze.currentnessAssertionDigest).toHaveLength(64);
    expect(withCurrentness.result.freeze.currentnessIntegritySchemaVersion).toBe(
      "dra-currentness-integrity-v1",
    );
    expect(withCurrentness.result.proofReference.currentnessAssertionDigest).toBe(
      withCurrentness.result.freeze.currentnessAssertionDigest,
    );
    expect(withoutCurrentness.result.freeze.currentnessAssertionDigest).toBeUndefined();
    expect(withoutCurrentness.result.proofReference.currentnessAssertionDigest).toBeUndefined();

    // As of DRA-ENG-022, acquireFreezeAndEvaluate always creates freeze
    // records under the V2 integrity regime, which deliberately binds
    // currentness-presence into freezeRecordDigest (closing the ENG-021
    // residual stripping bypass at the production entry point). The
    // "digest unaffected by currentnessAssessment presence" property is
    // therefore now a LEGACY-ONLY invariant — it remains proven directly
    // against createAcquisitionFreezeRecord() in
    // dra-eng-020-freeze-digest-regression.test.ts, which never opts into V2.
    expect(withCurrentness.result.freeze.freezeIntegritySchemaVersion).toBeDefined();
    expect(withCurrentness.result.freeze.freezeRecordDigest).not.toBe(
      withoutCurrentness.result.freeze.freezeRecordDigest,
    );

    // Both freeze records remain independently valid under their existing checks.
    expect(verifyAcquisitionFreezeRecordDigest(withCurrentness.result.freeze)).toBe(true);
    expect(verifyAcquisitionFreezeRecordDigest(withoutCurrentness.result.freeze)).toBe(true);

    // The new currentness-specific check: present+valid, and vacuously true
    // when no currentness assessment was ever supplied.
    expect(verifyAcquisitionCurrentnessIntegrity(withCurrentness.result.freeze)).toBe(true);
    expect(verifyAcquisitionCurrentnessIntegrity(withoutCurrentness.result.freeze)).toBe(true);
  });

  it("evaluateFrozenBenchmarkDocument REJECTS a freeze record whose currentnessAssessment was " +
    "altered after the digest was issued, without the digest being recomputed/reissued", async () => {
    const registry = new CorpusRegistry();
    const acquired = await acquireFreezeAndEvaluate(
      makePipelineInput({ currentnessAssessment: SAMPLE_CURRENTNESS }),
      makeDeps(registry),
    );
    expect(acquired.ok).toBe(true);
    if (!acquired.ok) return;

    // Simulate tampering: flip the currentness status on the freeze record's
    // stored assessment, WITHOUT recomputing currentnessAssertionDigest —
    // exactly what an attacker with write access to persisted freeze records
    // (but not the ability to reissue a valid digest) would produce.
    const tamperedFreeze = {
      ...acquired.result.freeze,
      currentnessAssessment: {
        ...acquired.result.freeze.currentnessAssessment,
        currentnessStatus: "CONFIRMED_CURRENT",
      },
    };

    // The freeze record's OWN digest (over source/text/metadata/etc.) is
    // untouched by this tamper — it must still verify — proving the
    // currentness tamper is caught by a DIFFERENT, dedicated check, not by
    // freezeRecordDigest incidentally covering it.
    expect(verifyAcquisitionFreezeRecordDigest(tamperedFreeze as never)).toBe(true);
    expect(verifyAcquisitionCurrentnessIntegrity(tamperedFreeze as never)).toBe(false);

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: tamperedFreeze as never,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("INTEGRITY");
    expect(result.errors[0]?.code).toBe("CURRENTNESS_ASSERTION_DIGEST_MISMATCH");
  });

  it("evaluateFrozenBenchmarkDocument ACCEPTS the untampered freeze record and surfaces the " +
    "same currentnessAssertionDigest on the resulting proofReference", async () => {
    const registry = new CorpusRegistry();
    const acquired = await acquireFreezeAndEvaluate(
      makePipelineInput({ currentnessAssessment: SAMPLE_CURRENTNESS }),
      makeDeps(registry),
    );
    expect(acquired.ok).toBe(true);
    if (!acquired.ok) return;

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: acquired.result.freeze,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      console.error("Stage:", result.stage, "Errors:", result.errors);
      return;
    }
    expect(result.result.proofReference.currentnessAssertionDigest).toBe(
      acquired.result.freeze.currentnessAssertionDigest,
    );
    expect(result.result.currentnessAssessment).toEqual(SAMPLE_CURRENTNESS);
  });
});
