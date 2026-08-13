/**
 * DRA-ENG-021 — Currentness Assertion Digest: tamper-detection unit tests.
 *
 * Mechanically proves that computeCurrentnessAssertionDigest /
 * verifyCurrentnessAssertionDigest detect every tamper scenario enumerated
 * by the DRA-ENG-021 spec, and that altering a deliberately non-bound field
 * (notes) does NOT invalidate the digest.
 */

import { describe, it, expect } from "vitest";
import {
  CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
  computeCurrentnessAssertionDigest,
  verifyCurrentnessAssertionDigest,
} from "../currentness-integrity.js";
import type { CurrentnessAssessment } from "../currentness.js";

const FREEZE_RECORD_ID = "DRA-FRZ-TEST-021-A";
const CORPUS_DOCUMENT_ID = "DRA-DOC-TEST-021";

const SUPERSEDED: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_SUPERSEDED",
  relatedDocumentIdentifier: "Example Standard Revision 2",
  relatedCorpusDocumentId: "DRA-DOC-TEST-022",
  evidenceUrl: "https://example.gov/catalog/standard-r1",
  evidenceQuote: "Withdrawn; superseded by Revision 2.",
  assessedBy: "test-operator",
  assessedAt: "2026-08-11T12:00:00.000Z",
  notes: "Non-material commentary.",
};

const CURRENT: CurrentnessAssessment = {
  currentnessStatus: "CONFIRMED_CURRENT",
  evidenceUrl: "https://example.gov/catalog/standard-r2",
  evidenceQuote: "This is the current, active version.",
  assessedBy: "test-operator",
  assessedAt: "2026-08-11T12:00:00.000Z",
};

const UNKNOWN: CurrentnessAssessment = {
  currentnessStatus: "UNKNOWN",
  assessedBy: "test-operator",
  assessedAt: "2026-08-11T12:00:00.000Z",
};

function digestFor(assessment: CurrentnessAssessment): string {
  return computeCurrentnessAssertionDigest({
    freezeRecordId: FREEZE_RECORD_ID,
    corpusDocumentId: CORPUS_DOCUMENT_ID,
    currentnessAssessment: assessment,
  });
}

function verifies(
  assessment: CurrentnessAssessment,
  expectedDigest: string,
  schemaVersion: string = CURRENTNESS_INTEGRITY_SCHEMA_VERSION,
): boolean {
  return verifyCurrentnessAssertionDigest({
    freezeRecordId: FREEZE_RECORD_ID,
    corpusDocumentId: CORPUS_DOCUMENT_ID,
    currentnessAssessment: assessment,
    schemaVersion,
    expectedDigest,
  });
}

describe("DRA-ENG-021 — computeCurrentnessAssertionDigest / verifyCurrentnessAssertionDigest", () => {
  it("is deterministic: identical inputs produce identical digests", () => {
    const d1 = digestFor(SUPERSEDED);
    const d2 = digestFor({ ...SUPERSEDED });
    expect(d1).toBe(d2);
    expect(d1).toHaveLength(64);
  });

  it("verifies a correctly bound assessment against its own digest", () => {
    const digest = digestFor(SUPERSEDED);
    expect(verifies(SUPERSEDED, digest)).toBe(true);
  });

  it("TAMPER 1: CONFIRMED_CURRENT -> CONFIRMED_SUPERSEDED is detected", () => {
    const digest = digestFor(CURRENT);
    const tampered: CurrentnessAssessment = { ...CURRENT, currentnessStatus: "CONFIRMED_SUPERSEDED" };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 2: CONFIRMED_SUPERSEDED -> UNKNOWN is detected", () => {
    const digest = digestFor(SUPERSEDED);
    // UNKNOWN carries no evidence fields per currentness.ts's schema; simulate
    // the raw tampered shape directly rather than round-tripping through Zod.
    const tampered = { ...UNKNOWN } as CurrentnessAssessment;
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 3: superseding-document identity changed (relatedDocumentIdentifier) is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const tampered: CurrentnessAssessment = {
      ...SUPERSEDED,
      relatedDocumentIdentifier: "A Completely Different Successor Document",
    };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 3b: superseding-document identity changed (relatedCorpusDocumentId) is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const tampered: CurrentnessAssessment = { ...SUPERSEDED, relatedCorpusDocumentId: "DRA-DOC-TEST-999" };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 4: authoritative evidence/provenance (evidenceQuote) changed is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const tampered: CurrentnessAssessment = {
      ...SUPERSEDED,
      evidenceQuote: "This document remains current and has not been withdrawn.",
    };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 5: evidence locator (evidenceUrl) changed is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const tampered: CurrentnessAssessment = { ...SUPERSEDED, evidenceUrl: "https://attacker.example/fake-catalog" };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 6: material authority identity (assessedBy) changed is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const tampered: CurrentnessAssessment = { ...SUPERSEDED, assessedBy: "someone-else" };
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 7: removal of required evidence (evidenceQuote deleted) is detected", () => {
    const digest = digestFor(SUPERSEDED);
    const { evidenceQuote, ...withoutEvidenceQuote } = SUPERSEDED;
    void evidenceQuote;
    expect(verifies(withoutEvidenceQuote as CurrentnessAssessment, digest)).toBe(false);
  });

  it("TAMPER 8: insertion of evidence after proof generation (UNKNOWN gains evidenceUrl) is detected", () => {
    const digest = digestFor(UNKNOWN);
    const tampered = {
      ...UNKNOWN,
      evidenceUrl: "https://attacker.example/fabricated-catalog",
      evidenceQuote: "Fabricated evidence inserted after digest issuance.",
    } as CurrentnessAssessment;
    expect(verifies(tampered, digest)).toBe(false);
  });

  it("TAMPER 9: malformed/version-incompatible schema version is rejected (fails closed)", () => {
    const digest = digestFor(SUPERSEDED);
    // Correct payload, but claims an unrecognised schema version — must fail
    // closed rather than silently accept an unknown canonicalisation rule set.
    expect(verifies(SUPERSEDED, digest, "dra-currentness-integrity-v99-unknown")).toBe(false);
  });

  it("binding identity changed (freezeRecordId) is detected — a currentness assertion is meaningless " +
    "detached from which frozen artefact it was made about", () => {
    const digest = digestFor(SUPERSEDED);
    const differentFreezeRecordDigest = computeCurrentnessAssertionDigest({
      freezeRecordId: "DRA-FRZ-TEST-021-DIFFERENT",
      corpusDocumentId: CORPUS_DOCUMENT_ID,
      currentnessAssessment: SUPERSEDED,
    });
    expect(differentFreezeRecordDigest).not.toBe(digest);
  });

  it("CONTROL: altering the deliberately non-bound 'notes' field does NOT invalidate the digest", () => {
    const digest = digestFor(SUPERSEDED);
    const withDifferentNotes: CurrentnessAssessment = { ...SUPERSEDED, notes: "A totally different, edited note." };
    const withNoNotes: CurrentnessAssessment = { ...SUPERSEDED };
    delete (withNoNotes as { notes?: string }).notes;
    expect(verifies(withDifferentNotes, digest)).toBe(true);
    expect(verifies(withNoNotes, digest)).toBe(true);
  });
});
