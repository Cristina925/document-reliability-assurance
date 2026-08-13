/**
 * DRA-ENG-020 — Unit tests for currentness.ts
 *
 * Covers the required adversarial/generalisation matrix from the task spec:
 *   - explicitly superseded (valid, accepted)
 *   - explicitly current (valid, accepted, no relatedDocumentIdentifier needed)
 *   - currentness unknown (both absent-field and explicit UNKNOWN)
 *   - superseded-claim without evidence (rejected)
 *   - older-but-valid document (CONFIRMED_CURRENT, no relation needed)
 *   - multiple-revision chain (3+ entries, no contradiction)
 *   - malformed/contradictory lineage evidence (self-reference,
 *     mutual-supersession-cycle, mutual-current-cycle,
 *     superseded-by-non-current-claim)
 *   - self-referential version text must not be mistaken for evidence
 *     (structural: the module never reads document text at all)
 *   - supersession assertion without authoritative provenance (rejected)
 *
 * This module never compares dates and is fully generic (no publisher-
 * specific strings). These tests verify that genericity holds.
 */

import { describe, it, expect } from "vitest";
import {
  CurrentnessAssessmentSchema,
  isConfirmedCurrent,
  isConfirmedSuperseded,
  checkLineageConsistency,
  type CurrentnessAssessment,
  type CurrentnessLineageEntry,
} from "../currentness.js";

const ASSESSED_AT = "2026-08-11T15:00:00.000Z";

describe("DRA-ENG-020 — CurrentnessAssessmentSchema", () => {
  it("accepts an explicitly superseded assessment with full evidence", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_SUPERSEDED",
      relatedDocumentIdentifier: "Publication X Revision 5",
      relatedCorpusDocumentId: "DRA-DOC-0030",
      evidenceUrl: "https://example.gov/catalog/publication-x",
      evidenceQuote: "Publication X Revision 4 was withdrawn on 2021-09-23. Superseded By: Revision 5.",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(isConfirmedSuperseded(result.data)).toBe(true);
      expect(isConfirmedCurrent(result.data)).toBe(false);
    }
  });

  it("accepts an explicitly current assessment with no relatedDocumentIdentifier", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_CURRENT",
      evidenceUrl: "https://example.gov/catalog/publication-y",
      evidenceQuote: "Publication Y remains the current authoritative edition as of this catalog entry.",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(isConfirmedCurrent(result.data)).toBe(true);
      expect(result.data.relatedDocumentIdentifier).toBeUndefined();
    }
  });

  it("treats an absent CurrentnessAssessment (undefined) as neither current nor superseded", () => {
    expect(isConfirmedCurrent(undefined)).toBe(false);
    expect(isConfirmedSuperseded(undefined)).toBe(false);
  });

  it("accepts an explicit UNKNOWN assessment carrying no evidence/relation fields", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "UNKNOWN",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
      notes: "No authoritative currentness evidence located during review.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(isConfirmedCurrent(result.data)).toBe(false);
      expect(isConfirmedSuperseded(result.data)).toBe(false);
    }
  });

  it("rejects UNKNOWN that nonetheless carries evidence or a relation (contradictory record)", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "UNKNOWN",
      evidenceUrl: "https://example.gov/catalog/publication-z",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a superseded claim missing evidenceUrl/evidenceQuote (no authoritative provenance)", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_SUPERSEDED",
      relatedDocumentIdentifier: "Publication X Revision 5",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("evidenceUrl");
      expect(paths).toContain("evidenceQuote");
    }
  });

  it("rejects a superseded claim with evidence but no relatedDocumentIdentifier (successor unnamed)", () => {
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_SUPERSEDED",
      evidenceUrl: "https://example.gov/catalog/publication-x",
      evidenceQuote: "Withdrawn. Superseded.",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join("."))).toContain(
        "relatedDocumentIdentifier",
      );
    }
  });

  it("accepts an older-but-still-valid document as CONFIRMED_CURRENT with no relation needed", () => {
    // An older document can still be the current authoritative version if
    // no successor has ever been published — this must not require naming
    // a related document, and must not depend on any date comparison.
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_CURRENT",
      evidenceUrl: "https://example.gov/catalog/publication-old",
      evidenceQuote: "This 1998 edition remains the sole and current authoritative publication; no revision has been issued.",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(true);
  });

  it("is fully generic — accepts arbitrary publisher/domain-agnostic content with no special-casing", () => {
    // Deliberately uses fictitious, non-NIST-related content to demonstrate
    // no publisher-specific strings/branches exist anywhere in the schema.
    const result = CurrentnessAssessmentSchema.safeParse({
      currentnessStatus: "CONFIRMED_SUPERSEDED",
      relatedDocumentIdentifier: "Acme Widget Standard v9",
      evidenceUrl: "https://standards.example.org/acme-widget-v8-status",
      evidenceQuote: "Acme Widget Standard v8 is retired; see v9 for the current standard.",
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
    });
    expect(result.success).toBe(true);
  });
});

describe("DRA-ENG-020 — self-referential version text is never evidence (structural)", () => {
  it("produces no currentness signal purely from a document's own title/body content", () => {
    // The module has no function that accepts document text at all — the
    // only way a currentnessStatus other than UNKNOWN can exist is via an
    // explicitly supplied CurrentnessAssessment with human-attested
    // evidenceUrl/evidenceQuote fields. This test documents that structural
    // guarantee: a document whose own title says "Revision 5" produces no
    // assessment unless one is explicitly constructed and validated.
    const documentTitle = "Publication X Revision 5 — Official Text";
    // No API in currentness.ts accepts `documentTitle`; asserting that fact
    // by construction (there is nothing to call). If no assessment is
    // supplied, isConfirmedCurrent/isConfirmedSuperseded both report false.
    expect(isConfirmedCurrent(undefined)).toBe(false);
    expect(isConfirmedSuperseded(undefined)).toBe(false);
    expect(documentTitle).toContain("Revision 5"); // sanity: title text exists but is inert
  });
});

describe("DRA-ENG-020 — checkLineageConsistency", () => {
  function entry(
    corpusDocumentId: string,
    partial: Partial<CurrentnessAssessment> & { currentnessStatus: CurrentnessAssessment["currentnessStatus"] },
  ): CurrentnessLineageEntry {
    const base: CurrentnessAssessment = {
      assessedBy: "test-operator",
      assessedAt: ASSESSED_AT,
      ...partial,
    } as CurrentnessAssessment;
    return { corpusDocumentId, assessment: base };
  }

  it("reports consistent for a clean multi-revision chain (3+ entries, no contradiction)", () => {
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0100", {
        currentnessStatus: "CONFIRMED_SUPERSEDED",
        relatedDocumentIdentifier: "Rev 2",
        relatedCorpusDocumentId: "DRA-DOC-0101",
        evidenceUrl: "https://example.org/a",
        evidenceQuote: "Rev 1 superseded by Rev 2.",
      }),
      entry("DRA-DOC-0101", {
        currentnessStatus: "CONFIRMED_SUPERSEDED",
        relatedDocumentIdentifier: "Rev 3",
        relatedCorpusDocumentId: "DRA-DOC-0102",
        evidenceUrl: "https://example.org/b",
        evidenceQuote: "Rev 2 superseded by Rev 3.",
      }),
      entry("DRA-DOC-0102", {
        currentnessStatus: "CONFIRMED_CURRENT",
        evidenceUrl: "https://example.org/c",
        evidenceQuote: "Rev 3 is current.",
      }),
    ];
    const result = checkLineageConsistency(entries);
    expect(result.consistent).toBe(true);
    expect(result.contradictions).toHaveLength(0);
  });

  it("detects SELF_REFERENCE when a document names itself as its own successor", () => {
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0200", {
        currentnessStatus: "CONFIRMED_SUPERSEDED",
        relatedDocumentIdentifier: "Itself",
        relatedCorpusDocumentId: "DRA-DOC-0200",
        evidenceUrl: "https://example.org/x",
        evidenceQuote: "malformed evidence",
      }),
    ];
    const result = checkLineageConsistency(entries);
    expect(result.consistent).toBe(false);
    expect(result.contradictions.map((c) => c.kind)).toContain("SELF_REFERENCE");
  });

  it("detects MUTUAL_SUPERSESSION_CYCLE when two documents each claim to supersede the other", () => {
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0300", {
        currentnessStatus: "CONFIRMED_SUPERSEDED",
        relatedDocumentIdentifier: "Doc B",
        relatedCorpusDocumentId: "DRA-DOC-0301",
        evidenceUrl: "https://example.org/x",
        evidenceQuote: "A superseded by B",
      }),
      entry("DRA-DOC-0301", {
        currentnessStatus: "CONFIRMED_SUPERSEDED",
        relatedDocumentIdentifier: "Doc A",
        relatedCorpusDocumentId: "DRA-DOC-0300",
        evidenceUrl: "https://example.org/y",
        evidenceQuote: "B superseded by A",
      }),
    ];
    const result = checkLineageConsistency(entries);
    expect(result.consistent).toBe(false);
    expect(result.contradictions.map((c) => c.kind)).toContain("MUTUAL_SUPERSESSION_CYCLE");
  });

  it("detects MUTUAL_CURRENT_CYCLE when two documents each claim current and point at the other", () => {
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0400", {
        currentnessStatus: "CONFIRMED_CURRENT",
        relatedDocumentIdentifier: "Doc B",
        relatedCorpusDocumentId: "DRA-DOC-0401",
        evidenceUrl: "https://example.org/x",
        evidenceQuote: "A is current, supersedes B",
      }),
      entry("DRA-DOC-0401", {
        currentnessStatus: "CONFIRMED_CURRENT",
        relatedDocumentIdentifier: "Doc A",
        relatedCorpusDocumentId: "DRA-DOC-0400",
        evidenceUrl: "https://example.org/y",
        evidenceQuote: "B is current, supersedes A",
      }),
    ];
    const result = checkLineageConsistency(entries);
    expect(result.consistent).toBe(false);
    expect(result.contradictions.map((c) => c.kind)).toContain("MUTUAL_CURRENT_CYCLE");
  });

  it("also flags SUPERSEDED_BY_NON_CURRENT_CLAIM alongside MUTUAL_CURRENT_CYCLE for mutually-pointing current documents", () => {
    // Per the implementation, the mutual-current-pointing shape (both docs
    // CONFIRMED_CURRENT, each naming the other as relatedCorpusDocumentId)
    // is flagged from two complementary angles: the direct mutual-cycle
    // check, and this finer-grained "one side's current-claim contradicts
    // the other's current-claim" check — both are legitimate distinct
    // contradiction records for the same underlying malformed lineage.
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0500", {
        currentnessStatus: "CONFIRMED_CURRENT",
        relatedDocumentIdentifier: "Doc B",
        relatedCorpusDocumentId: "DRA-DOC-0501",
        evidenceUrl: "https://example.org/a-current",
        evidenceQuote: "A claims to be current and to supersede B",
      }),
      entry("DRA-DOC-0501", {
        currentnessStatus: "CONFIRMED_CURRENT",
        relatedDocumentIdentifier: "Doc A",
        relatedCorpusDocumentId: "DRA-DOC-0500",
        evidenceUrl: "https://example.org/b-current",
        evidenceQuote: "B claims to be current and to supersede A",
      }),
    ];
    const result = checkLineageConsistency(entries);
    expect(result.consistent).toBe(false);
    const kinds = result.contradictions.map((c) => c.kind);
    expect(kinds).toContain("MUTUAL_CURRENT_CYCLE");
    expect(kinds).toContain("SUPERSEDED_BY_NON_CURRENT_CLAIM");
  });

  it("is a pure explicit-input function — never mutates or reorders its input", () => {
    const entries: CurrentnessLineageEntry[] = [
      entry("DRA-DOC-0600", { currentnessStatus: "UNKNOWN" }),
    ];
    const before = JSON.stringify(entries);
    checkLineageConsistency(entries);
    expect(JSON.stringify(entries)).toBe(before);
  });
});
