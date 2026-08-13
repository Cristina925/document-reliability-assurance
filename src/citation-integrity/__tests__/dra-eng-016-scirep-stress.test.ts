/**
 * DRA-ENG-016 — Scientific Reports superscript-fusion stress test.
 *
 * Per the DRA-ENG-016 ticket, this uses the Scientific Reports
 * superscript-fusion citation-style snippet identified during DRA-ACQ-022
 * Phase 1 discovery (see .agents/memory/dra-acq022-conventions.md) as a
 * NON-CORPUS stress fixture only. This does NOT admit the document as
 * DRA-DOC-0027 and does NOT constitute a corpus acquisition — it is a pure,
 * offline robustness check of the Part D detector's scope boundary.
 *
 * Style: superscript numbers fused directly onto words with no bracket,
 * comma-with-space, or other punctuation boundary at all, e.g.
 * "mammals1,13,14and", "fungi18and plants19,20", "BiP)8". This is a
 * fundamentally different representation problem from the PLOS ONE
 * bracket-number style DRA-DOC-0026 exercises — recovering it would require
 * font-size/baseline-shift information that plain-text extraction (and
 * hence DRA's representation) does not carry at all, not a segmentation fix.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractClaims } from "../../claim-extraction/extract-claims.js";
import { detectCitationIntegrity } from "../detect-citation-integrity.js";
import type { MaterialStatement } from "../../model/statements.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures", "scirep-superscript-fusion-snippet.txt");

function stripBomAndNormaliseCrlf(text: string): string {
  const withoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  return withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function makeRequest(content: string) {
  return {
    id: "eval-dra-eng-016-scirep-stress",
    generatedDocument: {
      id: "gdoc-scirep-stress",
      title: "Scientific Reports superscript-fusion stress fixture (non-corpus)",
      content,
      sourceDocumentIds: ["sdoc-scirep-stress"],
    },
    sourceDocuments: [
      {
        id: "sdoc-scirep-stress",
        title: "Placeholder source",
        content: "Placeholder source content for this offline stress test.",
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt: "2026-08-10T00:00:00Z",
  };
}

describe("DRA-ENG-016 — Scientific Reports superscript-fusion stress test (non-corpus fixture)", () => {
  let normalisedText: string;

  beforeAll(async () => {
    const raw = await readFile(FIXTURE_PATH, "utf-8");
    normalisedText = stripBomAndNormaliseCrlf(raw);
  });

  it("fixture contains the known superscript-fusion pattern (sanity check)", () => {
    expect(normalisedText).toContain("mammals1,13,14and");
  });

  it("detector correctly returns NOT_ASSESSABLE — superscript-fusion is out of this detector's mechanical scope", () => {
    const stage2 = extractClaims(makeRequest(normalisedText) as never);
    expect(stage2.ok).toBe(true);
    if (!stage2.ok) return;
    const statements: MaterialStatement[] = [...stage2.statements];

    const report = detectCitationIntegrity(normalisedText, statements);

    console.log("Scientific Reports stress fixture — detectCitationIntegrity report:");
    console.log("  citationStyleDetected :", report.citationStyleDetected);
    console.log("  status                :", report.status);
    console.log("  reasons               :", report.reasons);

    // No bracket-number markers exist in this style at all, so the detector
    // must not claim any linkage verdict for it.
    expect(report.citationStyleDetected).toBe("NONE_DETECTED");
    expect(report.status).toBe("NOT_ASSESSABLE");
    expect(report.markers).toEqual([]);
  });

  it("does not fabricate identifiers by misinterpreting fused superscripts as bracket markers", () => {
    const stage2 = extractClaims(makeRequest(normalisedText) as never);
    expect(stage2.ok).toBe(true);
    if (!stage2.ok) return;
    const report = detectCitationIntegrity(normalisedText, [...stage2.statements]);
    expect(report.citedIdentifiers).toEqual([]);
  });
});
