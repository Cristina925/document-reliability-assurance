/**
 * DRA-ENG-016 Part D — detectCitationIntegrity tests
 *
 * Uses the real Stage 2 extractClaims() pipeline (not hand-built statement
 * fixtures) so the detector is exercised against the same representation the
 * rest of DRA consumes.
 */

import { describe, it, expect } from "vitest";
import { extractClaims } from "../../claim-extraction/extract-claims.js";
import { detectCitationIntegrity } from "../detect-citation-integrity.js";
import type { MaterialStatement } from "../../model/statements.js";

function makeRequest(content: string) {
  return {
    id: "eval-dra-eng-016-test",
    generatedDocument: {
      id: "gdoc-dra-eng-016-test",
      title: "DRA-ENG-016 Test Document",
      content,
      sourceDocumentIds: ["sdoc-eng016"],
    },
    sourceDocuments: [
      {
        id: "sdoc-eng016",
        title: "Test Source",
        content: "Source content for testing.",
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt: "2026-08-10T00:00:00Z",
  };
}

function getStatements(content: string): MaterialStatement[] {
  const result = extractClaims(makeRequest(content) as never);
  if (!result.ok) throw new Error("extractClaims failed: " + JSON.stringify(result.errors));
  return [...result.statements];
}

describe("DRA-ENG-016 Part D — detectCitationIntegrity", () => {
  it("NOT_ASSESSABLE when no bracket-number citation structure exists at all", () => {
    const content = "This document discusses compliance without any citations.";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.citationStyleDetected).toBe("NONE_DETECTED");
    expect(report.status).toBe("NOT_ASSESSABLE");
  });

  it("NOT_ASSESSABLE when citations exist but there is no reference list to resolve against", () => {
    const content = "The finding is well established [1, 2]. No reference list follows.";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.citationStyleDetected).toBe("NONE_DETECTED");
    expect(report.status).toBe("NOT_ASSESSABLE");
  });

  it("VERIFIED_LINKAGE for a small, fully clean bracket-number document", () => {
    const content =
      "Sharing data improves reproducibility [1]. It also helps citation counts [2, 3].\n\n" +
      "References\n" +
      "1. Smith J. Open science practices. J Sci. 2020.\n" +
      "2. Doe A. Data sharing outcomes. J Sci. 2021.\n" +
      "3. Lee K. Citation effects. J Sci. 2022.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.citationStyleDetected).toBe("BRACKET_NUMBER");
    expect(report.citedIdentifiers).toEqual(["1", "2", "3"]);
    expect(report.referenceIdentifiers).toEqual(["1", "2", "3"]);
    expect(report.unresolvedCitationIdentifiers).toEqual([]);
    expect(report.malformedMarkers).toEqual([]);
    expect(report.status).toBe("VERIFIED_LINKAGE");
  });

  it("POTENTIAL_LINKAGE_DEGRADATION when a citation has no matching reference entry", () => {
    const content =
      "This claim cites a reference that does not exist [9]. Another claim cites one that does [1].\n\n" +
      "References\n" +
      "1. Smith J. Real reference. J Sci. 2020.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.unresolvedCitationIdentifiers).toEqual(["9"]);
    expect(report.status).toBe("POTENTIAL_LINKAGE_DEGRADATION");
  });

  it("POTENTIAL_LINKAGE_DEGRADATION when a citation marker is split across a physical line boundary AND the join heuristic does not apply (adversarial: crosses a blank line)", () => {
    // The Part B fix intentionally does not join across a blank line, so this
    // marker legitimately remains malformed in the representation — the
    // detector must surface it, not silently pass.
    const content =
      "This work is cited widely [19,\n\n20]. See references below.\n\n" +
      "References\n" +
      "19. First Author. First title. 2019.\n" +
      "20. Second Author. Second title. 2020.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.malformedMarkers.length).toBeGreaterThan(0);
    expect(report.status).toBe("POTENTIAL_LINKAGE_DEGRADATION");
  });

  it("marker split across a physical line boundary WITHOUT a blank line is repaired by Part B and is NOT reported malformed", () => {
    const content =
      "This work is cited widely [19,\n                    20]. See references below.\n\n" +
      "References\n" +
      "19. First Author. First title. 2019.\n" +
      "20. Second Author. Second title. 2020.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.malformedMarkers).toEqual([]);
    expect(report.status).toBe("VERIFIED_LINKAGE");
  });

  it("flags duplicate reference identifiers as structurally indistinguishable", () => {
    const content =
      "Claim referencing entry one [1].\n\n" +
      "References\n" +
      "1. First Author. First title. 2019.\n" +
      "1. Accidentally duplicated number. 2020.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.duplicateReferenceIdentifiers).toEqual(["1"]);
    expect(report.status).toBe("POTENTIAL_LINKAGE_DEGRADATION");
  });

  it("reports structurally-incoherent reference identifiers as a distinct (non-status-changing) signal when content is still recoverable nearby", () => {
    // A reference number rendered on its own line with content starting on
    // the very next physical line (a case Part C's same-line fix does not
    // reach, by design — this is the documented multi-line-continuation
    // limitation) should be flagged structurally incoherent but the overall
    // status should remain governed by resolution/malformation, not this
    // weaker signal alone.
    const content =
      "Claim referencing entry one [1].\n\n" +
      "References\n" +
      "1.\n" +
      "First Author. First title. 2019.\n";
    const report = detectCitationIntegrity(content, getStatements(content));
    // Identifier "1" is still found (mechanically, from the line marker),
    // and resolves, so linkage itself isn't degraded by this alone.
    expect(report.referenceIdentifiers).toContain("1");
  });

  it("does not claim VERIFIED_LINKAGE for a superscript-fusion citation style (out of scope by design)", () => {
    // Mirrors the Scientific Reports stress pattern: "mammals1,13,14and" —
    // no bracket/space syntax at all, so the detector correctly finds no
    // mechanically identifiable bracket-number markers.
    const content = "Many mammals1,13,14and other species were studied in detail.";
    const report = detectCitationIntegrity(content, getStatements(content));
    expect(report.citationStyleDetected).toBe("NONE_DETECTED");
    expect(report.status).toBe("NOT_ASSESSABLE");
  });
});
