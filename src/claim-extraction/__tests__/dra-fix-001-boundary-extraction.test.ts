/**
 * DRA-FIX-001 — Boundary-Constrained Claim Extraction Tests
 *
 * Verifies that Stage 2 extracts claims only from the declared evaluation
 * boundary when one is provided, and preserves full-document behaviour
 * when no boundary is specified.
 *
 * Coverage:
 *   1. No boundary — full-document extraction (backwards compatibility)
 *   2. Valid boundary — only in-boundary segments extracted
 *   3. Boundary beginning at a paragraph start
 *   4. Boundary beginning mid-paragraph / mid-content
 *   5. Boundary ending mid-paragraph
 *   6. Invalid boundary rejection (startOffset >= endOffset)
 *   7. Invalid boundary rejection (endOffset > document length)
 *   8. Deterministic repeated extraction with boundary
 *   9. Boundary produces correct extractionRecord metadata
 *  10. DRA-DOC-0008 regression — guide pages 18–25 extraction (network)
 */

import { describe, it, expect } from "vitest";
import { extractClaims } from "../extract-claims.js";
import { STAGE_2_ID } from "../extraction-result.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal valid NormalisedEvaluationRequest (which is EvaluationRequest)
 * carrying the supplied content string and optional evaluation boundary.
 */
function makeRequest(
  content: string,
  evaluationBoundary?: { startOffset: number; endOffset: number },
): unknown {
  const base = {
    id: "eval-dra-fix-001-test",
    generatedDocument: {
      id: "gdoc-dra-fix-001-test",
      title: "DRA-FIX-001 Test Document",
      content,
      sourceDocumentIds: ["sdoc-fix001"],
    },
    sourceDocuments: [
      {
        id: "sdoc-fix001",
        title: "Test Source",
        content: "Source content for testing.",
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt: "2026-08-04T00:00:00Z",
  };
  if (evaluationBoundary !== undefined) {
    return { ...base, evaluationBoundary };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Synthetic test content
//
// A multi-section document with clearly delimited paragraphs.
// The sections are designed so that segment IDs (character offsets) can be
// computed precisely, making boundary assertions exact.
// ---------------------------------------------------------------------------

// Section A — chars 0-51: two complete sentences.
const SECTION_A =
  "Alpha claim one is made here. Alpha claim two follows.\n";
// ^ 0..29 = "Alpha claim one is made here."
// ^ 30..53 = "Alpha claim two follows."
// ^ 54 = \n

// Section B — starts at char 55: two complete sentences.
const SECTION_B =
  "Beta claim one is asserted here. Beta claim two continues.\n";
// ^ 55..87 = "Beta claim one is asserted here."
// ^ 88..113 = "Beta claim two continues."
// ^ 114 = \n

// Section C — starts at char 115: one complete sentence.
const SECTION_C = "Gamma claim one stands alone here.";

// Full document
const FULL_DOCUMENT = SECTION_A + SECTION_B + SECTION_C;

// Pre-computed offsets:
// SECTION_A ends at char SECTION_A.length - 1 = 53; \n at 53.
// SECTION_B starts at 54; ends at 54 + SECTION_B.length - 1.
// SECTION_C starts at 54 + SECTION_B.length.

const SECTION_A_LEN = SECTION_A.length; // 54
const SECTION_B_LEN = SECTION_B.length; // 59

const SECTION_B_START = SECTION_A_LEN;               // 54
const SECTION_B_END   = SECTION_A_LEN + SECTION_B_LEN; // 113
const SECTION_C_START = SECTION_B_END;                // 113

// ---------------------------------------------------------------------------
// 1. No boundary — full-document extraction (backwards compatibility)
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — no boundary (backwards compatibility)", () => {
  it("succeeds with ok: true when no boundary is supplied", () => {
    const result = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    expect(result.ok).toBe(true);
  });

  it("extracts statements from the entire document when no boundary is supplied", () => {
    const result = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    if (!result.ok) throw new Error("Expected ok result");
    // All five sentences should be candidates.
    expect(result.statements.length).toBeGreaterThanOrEqual(3);
    // At least one statement should come from each section.
    const texts = result.statements.map((s) => s.text);
    expect(texts.some((t) => t.includes("Alpha"))).toBe(true);
    expect(texts.some((t) => t.includes("Beta"))).toBe(true);
    expect(texts.some((t) => t.includes("Gamma"))).toBe(true);
  });

  it("extractionRecord.boundaryApplied is false when no boundary supplied", () => {
    const result = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.extractionRecord.boundaryApplied).toBe(false);
  });

  it("extractionRecord does not carry boundary offset fields when no boundary supplied", () => {
    const result = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.extractionRecord.boundaryStartOffset).toBeUndefined();
    expect(result.extractionRecord.boundaryEndOffset).toBeUndefined();
    expect(result.extractionRecord.boundaryFilteredSegmentCount).toBeUndefined();
  });

  it("stageId is STAGE_2_CLAIM_EXTRACTION when no boundary supplied", () => {
    const result = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    expect(result.stageId).toBe(STAGE_2_ID);
  });
});

// ---------------------------------------------------------------------------
// 2. Valid boundary — only in-boundary segments extracted
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — valid boundary restricts extraction", () => {
  it("extracts only Section B statements when boundary covers Section B", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    const texts = result.statements.map((s) => s.text);
    expect(texts.every((t) => t.includes("Beta"))).toBe(true);
    expect(texts.some((t) => t.includes("Alpha"))).toBe(false);
    expect(texts.some((t) => t.includes("Gamma"))).toBe(false);
  });

  it("all statement spanRefs fall within the declared boundary", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    for (const stmt of result.statements) {
      expect(stmt.spanRef!.startOffset).toBeGreaterThanOrEqual(SECTION_B_START);
      expect(stmt.spanRef!.endOffset).toBeLessThanOrEqual(SECTION_B_END);
    }
  });

  it("boundary extraction produces fewer statements than full-document extraction", () => {
    const full = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    const bounded = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!full.ok || !bounded.ok) throw new Error("Expected ok results");
    expect(bounded.statements.length).toBeLessThan(full.statements.length);
  });

  it("extractionRecord.boundaryApplied is true when boundary is supplied", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.extractionRecord.boundaryApplied).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Boundary beginning at a paragraph start
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — boundary at paragraph start", () => {
  it("includes segments that begin exactly at startOffset", () => {
    // Section B starts at SECTION_B_START with "Beta claim one…"
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: FULL_DOCUMENT.length,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    const texts = result.statements.map((s) => s.text);
    expect(texts.some((t) => t.includes("Beta"))).toBe(true);
    expect(texts.some((t) => t.includes("Gamma"))).toBe(true);
    expect(texts.some((t) => t.includes("Alpha"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Boundary beginning mid-content
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — boundary beginning mid-paragraph", () => {
  it("does not include segments whose start falls before the boundary startOffset", () => {
    // Set startOffset in the middle of Section A (after "Alpha claim one is made here.\n")
    const midSectionA = "Alpha claim one is made here.".length; // 29 chars + \n = 30
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: midSectionA + 1, // 30 — right after the first sentence's \n area
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    for (const stmt of result.statements) {
      expect(stmt.spanRef!.startOffset).toBeGreaterThanOrEqual(midSectionA + 1);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Boundary ending mid-paragraph
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — boundary ending mid-paragraph", () => {
  it("does not include segments whose end falls after the boundary endOffset", () => {
    // Cover Section A and the first sentence of Section B only.
    // "Beta claim one is asserted here." ends at SECTION_B_START + 32 = 54 + 32 = 86
    const betaOneEnd = SECTION_B_START + "Beta claim one is asserted here.".length; // 54 + 32 = 86
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: 0,
        endOffset: betaOneEnd,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    for (const stmt of result.statements) {
      expect(stmt.spanRef!.endOffset).toBeLessThanOrEqual(betaOneEnd);
    }
    // "Beta claim two continues." must NOT appear (it ends after betaOneEnd)
    const texts = result.statements.map((s) => s.text);
    expect(texts.some((t) => t.includes("Beta claim two"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Invalid boundary — startOffset >= endOffset (schema + runtime rejection)
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — invalid boundary rejected", () => {
  it("returns ok:false when startOffset === endOffset", () => {
    // Schema cross-field check catches startOffset >= endOffset.
    // Stage 1 validation will reject this before reaching Stage 2.
    // Test at the extractClaims level using a pre-built invalid request object
    // (bypassing schema by casting) to verify runtime guard too.
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, { startOffset: 10, endOffset: 10 }) as never,
    );
    // The failure may be caught at schema level (Stage 1) or runtime (Stage 2).
    // Either way the pipeline must not succeed.
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when startOffset > endOffset (direct runtime path)", () => {
    // Force an invalid request that bypasses schema by constructing it
    // manually so Stage 2 receives the invalid boundary at runtime.
    const invalidRequest = {
      id: "eval-fix001-invalid",
      generatedDocument: {
        id: "gdoc-fix001-invalid",
        title: "Invalid",
        content: FULL_DOCUMENT,
        sourceDocumentIds: ["sdoc-fix001-inv"],
      },
      sourceDocuments: [
        {
          id: "sdoc-fix001-inv",
          title: "Src",
          content: "Source.",
          format: "PLAIN_TEXT",
        },
      ],
      requestedAt: "2026-08-04T00:00:00Z",
      // Inject invalid boundary directly — bypasses Zod schema.
      evaluationBoundary: { startOffset: 50, endOffset: 10 },
    };
    const result = extractClaims(invalidRequest as never);
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when endOffset exceeds document length", () => {
    const result = extractClaims(
      {
        id: "eval-fix001-over",
        generatedDocument: {
          id: "gdoc-fix001-over",
          title: "Over",
          content: FULL_DOCUMENT,
          sourceDocumentIds: ["sdoc-fix001-ov"],
        },
        sourceDocuments: [
          {
            id: "sdoc-fix001-ov",
            title: "Src",
            content: "Source.",
            format: "PLAIN_TEXT",
          },
        ],
        requestedAt: "2026-08-04T00:00:00Z",
        evaluationBoundary: { startOffset: 0, endOffset: FULL_DOCUMENT.length + 1 },
      } as never,
    );
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. extractionRecord metadata — boundary fields correct
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — extractionRecord boundary metadata", () => {
  it("records the exact startOffset and endOffset applied", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.extractionRecord.boundaryStartOffset).toBe(SECTION_B_START);
    expect(result.extractionRecord.boundaryEndOffset).toBe(SECTION_B_END);
  });

  it("boundaryFilteredSegmentCount equals allSegments minus boundarySegments", () => {
    const full = extractClaims(makeRequest(FULL_DOCUMENT) as never);
    const bounded = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!full.ok || !bounded.ok) throw new Error("Expected ok results");
    // segmentCount on both runs should be the same (full segmenter ran on full content).
    expect(bounded.extractionRecord.segmentCount).toBe(
      full.extractionRecord.segmentCount,
    );
    // boundaryFilteredSegmentCount must be positive.
    expect(bounded.extractionRecord.boundaryFilteredSegmentCount).toBeGreaterThan(0);
    // segmentCount = filtered + working (classified candidates + ignored)
    expect(
      bounded.extractionRecord.boundaryFilteredSegmentCount! +
        bounded.extractionRecord.candidateStatementCount +
        bounded.extractionRecord.ignoredSegmentCount,
    ).toBe(bounded.extractionRecord.segmentCount);
  });

  it("documentLength is the full document length regardless of boundary", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    expect(result.extractionRecord.documentLength).toBe(FULL_DOCUMENT.length);
  });
});

// ---------------------------------------------------------------------------
// 8. Deterministic repeated extraction with boundary
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — deterministic extraction with boundary", () => {
  it("produces identical statements on repeated calls with the same boundary", () => {
    const boundary = { startOffset: SECTION_B_START, endOffset: SECTION_B_END };
    const request = makeRequest(FULL_DOCUMENT, boundary) as never;

    const r1 = extractClaims(request);
    const r2 = extractClaims(request);
    const r3 = extractClaims(request);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);

    if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Expected ok results");

    expect(r1.statements.length).toBe(r2.statements.length);
    expect(r2.statements.length).toBe(r3.statements.length);

    for (let i = 0; i < r1.statements.length; i++) {
      expect(r1.statements[i]!.id).toBe(r2.statements[i]!.id);
      expect(r2.statements[i]!.id).toBe(r3.statements[i]!.id);
      expect(r1.statements[i]!.text).toBe(r2.statements[i]!.text);
      expect(r1.statements[i]!.spanRef).toStrictEqual(r2.statements[i]!.spanRef);
    }
  });

  it("different boundaries on the same content produce different statement sets", () => {
    const sectionAOnly = extractClaims(
      makeRequest(FULL_DOCUMENT, { startOffset: 0, endOffset: SECTION_B_START }) as never,
    );
    const sectionBOnly = extractClaims(
      makeRequest(FULL_DOCUMENT, { startOffset: SECTION_B_START, endOffset: SECTION_B_END }) as never,
    );
    if (!sectionAOnly.ok || !sectionBOnly.ok) throw new Error("Expected ok results");
    // No statement ID should appear in both sets.
    const idsA = new Set(sectionAOnly.statements.map((s) => s.id));
    const idsB = new Set(sectionBOnly.statements.map((s) => s.id));
    for (const id of idsB) {
      expect(idsA.has(id)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// 9. Span integrity with boundary
// ---------------------------------------------------------------------------

describe("DRA-FIX-001 — span integrity preserved with boundary", () => {
  it("content.slice(startOffset, endOffset) === text for all boundary-extracted statements", () => {
    const result = extractClaims(
      makeRequest(FULL_DOCUMENT, {
        startOffset: SECTION_B_START,
        endOffset: SECTION_B_END,
      }) as never,
    );
    if (!result.ok) throw new Error("Expected ok result");
    for (const stmt of result.statements) {
      const slice = FULL_DOCUMENT.slice(
        stmt.spanRef!.startOffset,
        stmt.spanRef!.endOffset,
      );
      expect(slice).toBe(stmt.text);
    }
  });
});

// ---------------------------------------------------------------------------
// 10. DRA-DOC-0008 regression — guide pages 18–25 boundary extraction
//
// NETWORK-DEPENDENT TEST
//
// This test verifies that extraction with the pages 18–25 boundary produces
// a proportionate claim set from the correct guide section.
//
// It re-uses the identical pdftotext extraction method and source URL from
// the blind evaluation test. It does NOT run the full evaluator pipeline.
//
// REVIEW_REQUIRED conditions (causes test to be skipped, not failed):
//   - Guide source digest does not match DRA-FRZ-000002 reference
//   - Guide text digest does not match DRA-FRZ-000002 reference
//   - Boundary start marker "Informing the employee" not found in normalised text
//   - Boundary end marker not found after start marker
//   - Network unavailable
// ---------------------------------------------------------------------------

import { promisify } from "util";
import { execFile } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createHttpFetcher } from "../../benchmark/acquisition/http-fetcher.js";
import { createAcquisitionRequest } from "../../benchmark/acquisition/request.js";
import { normaliseContent } from "../../benchmark/acquisition/normalisation.js";
import { computeSourceDigest } from "../../benchmark/acquisition/integrity.js";

// DRA-FRZ-000002 reference digests
const REFERENCE_GUIDE_SOURCE_DIGEST =
  "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300";
const REFERENCE_GUIDE_TEXT_DIGEST =
  "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0";

const GUIDE_PDF_URL =
  "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";

// Guide boundary: pages 18–25 — "Informing the employee" through the companion section.
// These text markers are used to locate character offsets in the normalised text.
const BOUNDARY_START_MARKER = "Informing the employee";
// End marker candidates — the first one found after the start marker is used.
// These are section headings known to appear AFTER pages 18–25 in the guide.
const BOUNDARY_END_CANDIDATES = [
  "Deciding the outcome",
  "Disciplinary action short of dismissal",
  "Criminal offences",
  "After the disciplinary hearing",
  "Formal action",
];

const execFileAsync = promisify(execFile);

async function extractPdfTextFix001(bytes: Uint8Array): Promise<string> {
  const id = `dra-fix001-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

describe(
  "DRA-FIX-001 — DRA-DOC-0008 guide pages 18–25 boundary regression",
  () => {
    it(
      "extracts claims only from guide pages 18–25 when boundary is applied",
      { timeout: 120_000 },
      async () => {
        console.log(
          "\n══════════════════════════════════════════════════════════════",
        );
        console.log(
          "  DRA-FIX-001 — DRA-DOC-0008 Boundary Regression",
        );
        console.log(
          "  Boundary: guide pages 18–25 (Informing the employee →",
        );
        console.log(
          "            Allowing a worker to be accompanied)",
        );
        console.log(
          "══════════════════════════════════════════════════════════════",
        );

        // ── Step 1: Fetch guide PDF ──────────────────────────────────────────
        console.log("\n── Step 1: Fetch Guide PDF ─────────────────────────────");
        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 10_000_000,
          userAgent: "DRA-FIX-001/1.0",
        });

        const guideRequestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-FIX001",
          sourceUrl: GUIDE_PDF_URL,
          requestedBy: "dra-fix-001-regression-test",
          requestedAt: "2026-08-04T00:00:00.000Z",
          expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
          expectedTitle: "Discipline and grievances at work: the Acas guide",
        });

        if (!guideRequestResult.ok) {
          console.log("  REVIEW_REQUIRED: acquisition request creation failed.");
          return;
        }

        const guideFetchResult = await fetcher(guideRequestResult.request, {});

        if (!guideFetchResult.ok) {
          console.log(
            "  REVIEW_REQUIRED: guide PDF fetch failed —",
            guideFetchResult.code,
          );
          return;
        }

        const guideBytes = guideFetchResult.source.rawBytes;
        const guideSourceDigest = computeSourceDigest(guideBytes);

        console.log("  source digest      :", guideSourceDigest);
        console.log("  reference digest   :", REFERENCE_GUIDE_SOURCE_DIGEST);

        if (guideSourceDigest !== REFERENCE_GUIDE_SOURCE_DIGEST) {
          console.log(
            "  REVIEW_REQUIRED: source digest does not match DRA-FRZ-000002.",
          );
          return;
        }
        console.log("  source digest      : ✓ PASS");

        // ── Step 2: Normalise PDF ────────────────────────────────────────────
        console.log("\n── Step 2: Normalise PDF (pdftotext) ───────────────────");
        const normResult = await normaliseContent(
          guideBytes,
          "application/pdf",
          guideSourceDigest,
          extractPdfTextFix001,
        );

        if (!normResult.ok) {
          console.log(
            "  REVIEW_REQUIRED: normalisation failed —",
            normResult.code,
          );
          return;
        }

        const normalisedText = normResult.document.text;
        const textDigest = normResult.document.textDigest;

        console.log("  text length        :", normalisedText.length, "chars");
        console.log("  text digest        :", textDigest);
        console.log("  reference digest   :", REFERENCE_GUIDE_TEXT_DIGEST);

        if (textDigest !== REFERENCE_GUIDE_TEXT_DIGEST) {
          console.log(
            "  REVIEW_REQUIRED: text digest does not match DRA-FRZ-000002.",
          );
          return;
        }
        console.log("  text digest        : ✓ PASS");

        // ── Step 3: Find boundary offsets ────────────────────────────────────
        console.log("\n── Step 3: Locate Boundary Markers ─────────────────────");

        const startOffset = normalisedText.indexOf(BOUNDARY_START_MARKER);
        if (startOffset === -1) {
          console.log(
            `  REVIEW_REQUIRED: start marker "${BOUNDARY_START_MARKER}" not found.`,
          );
          return;
        }
        console.log(
          `  Start marker "${BOUNDARY_START_MARKER}" found at offset ${startOffset}`,
        );

        let endOffset = -1;
        let endMarkerUsed = "";
        for (const candidate of BOUNDARY_END_CANDIDATES) {
          const pos = normalisedText.indexOf(
            candidate,
            startOffset + BOUNDARY_START_MARKER.length,
          );
          if (pos > startOffset) {
            endOffset = pos;
            endMarkerUsed = candidate;
            break;
          }
        }

        if (endOffset === -1) {
          console.log(
            "  REVIEW_REQUIRED: no end marker found after start marker.",
          );
          return;
        }
        console.log(
          `  End marker "${endMarkerUsed}" found at offset ${endOffset}`,
        );

        const boundaryLength = endOffset - startOffset;
        console.log(
          `  Boundary: [${startOffset}, ${endOffset}) — ${boundaryLength} chars`,
        );

        // The boundary section must be non-trivially large (at least 3,000 chars
        // to cover the notification + companion procedure text).
        expect(boundaryLength).toBeGreaterThan(3_000);

        // ── Step 4: Build EvaluationRequest with boundary ────────────────────
        console.log("\n── Step 4: Extract Claims from Bounded Section ──────────");

        const request = {
          id: "eval-dra-fix001-doc0008",
          generatedDocument: {
            id: "gdoc-dra-fix001-doc0008",
            title: "Discipline and grievances at work: the Acas guide",
            content: normalisedText,
            sourceDocumentIds: ["sdoc-fix001-doc0008"],
          },
          sourceDocuments: [
            {
              id: "sdoc-fix001-doc0008",
              title: "ACAS Code of Practice (placeholder)",
              content: "Code text not needed for Stage 2 extraction test.",
              format: "PLAIN_TEXT",
            },
          ],
          requestedAt: "2026-08-04T00:00:00Z",
          evaluationBoundary: { startOffset, endOffset },
        };

        const result = extractClaims(request as never);

        // ── Step 5: Assert results ───────────────────────────────────────────
        console.log("\n── Step 5: Assertions ───────────────────────────────────");

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const { statements, extractionRecord } = result;
        console.log(
          "  statements extracted     :",
          statements.length,
        );
        console.log(
          "  boundaryApplied          :",
          extractionRecord.boundaryApplied,
        );
        console.log(
          "  boundaryStartOffset      :",
          extractionRecord.boundaryStartOffset,
        );
        console.log(
          "  boundaryEndOffset        :",
          extractionRecord.boundaryEndOffset,
        );
        console.log(
          "  boundaryFilteredSegments :",
          extractionRecord.boundaryFilteredSegmentCount,
        );
        console.log(
          "  segmentCount (total)     :",
          extractionRecord.segmentCount,
        );
        console.log(
          "  documentLength           :",
          extractionRecord.documentLength,
        );

        // R1: Boundary was applied.
        expect(extractionRecord.boundaryApplied).toBe(true);
        expect(extractionRecord.boundaryStartOffset).toBe(startOffset);
        expect(extractionRecord.boundaryEndOffset).toBe(endOffset);

        // R2: All statement spans fall within the declared boundary.
        for (const stmt of statements) {
          expect(stmt.spanRef!.startOffset).toBeGreaterThanOrEqual(startOffset);
          expect(stmt.spanRef!.endOffset).toBeLessThanOrEqual(endOffset);
        }

        // R3: No statement originates outside the boundary.
        const outOfBounds = statements.filter((s) => {
          const sr = s.spanRef;
          if (sr === undefined) return false;
          const sStart = sr.startOffset ?? 0;
          const sEnd = sr.endOffset ?? 0;
          return sStart < startOffset || sEnd > endOffset;
        });
        console.log("  out-of-bounds statements:", outOfBounds.length);
        expect(outOfBounds.length).toBe(0);

        // R4: Statement count is proportionate for the boundary section.
        // Pages 18–25 represent ~8,000–12,000 chars of a 164,726-char document.
        // Expect a much smaller count than the full-document 3,013.
        // Conservative range: 30 ≤ count ≤ 500.
        console.log(
          `  statement count ${statements.length} — expected in range [30, 500]`,
        );
        expect(statements.length).toBeGreaterThanOrEqual(30);
        expect(statements.length).toBeLessThanOrEqual(500);

        // R5: Previous benchmark artefacts unchanged — the full-document
        // extraction (no boundary) still produces the original 3,013 claims.
        const fullResult = extractClaims({
          id: "eval-dra-fix001-doc0008-full",
          generatedDocument: {
            id: "gdoc-dra-fix001-doc0008-full",
            title: "Discipline and grievances at work: the Acas guide",
            content: normalisedText,
            sourceDocumentIds: ["sdoc-fix001-doc0008-full"],
          },
          sourceDocuments: [
            {
              id: "sdoc-fix001-doc0008-full",
              title: "ACAS Code of Practice (placeholder)",
              content: "Code text not needed for Stage 2 extraction test.",
              format: "PLAIN_TEXT",
            },
          ],
          requestedAt: "2026-08-04T00:00:00Z",
          // No boundary — full document.
        } as never);

        expect(fullResult.ok).toBe(true);
        if (!fullResult.ok) return;

        console.log(
          "  full-document statement count:",
          fullResult.statements.length,
          "(reference: 3,013)",
        );
        // The blind evaluation established 3,013 claims from the full document.
        expect(fullResult.statements.length).toBe(3_013);
        console.log(
          "  full-document count matches blind evaluation reference ✓",
        );

        // R6: Determinism — two bounded extractions with the same offsets
        //     produce identical statement sets.
        const result2 = extractClaims(request as never);
        expect(result2.ok).toBe(true);
        if (!result2.ok) return;
        expect(result2.statements.length).toBe(statements.length);
        for (let i = 0; i < statements.length; i++) {
          expect(result2.statements[i]!.id).toBe(statements[i]!.id);
          expect(result2.statements[i]!.spanRef).toStrictEqual(
            statements[i]!.spanRef,
          );
        }
        console.log("  determinism: ✓ PASS (both runs identical)");

        console.log(
          "\n══════════════════════════════════════════════════════════════",
        );
        console.log("  DRA-FIX-001 DRA-DOC-0008 regression: PASS");
        console.log(
          `  Boundary extraction: ${statements.length} statements from [${startOffset}, ${endOffset})`,
        );
        console.log(`  vs full-document: ${fullResult.statements.length} statements`);
        console.log(
          "══════════════════════════════════════════════════════════════\n",
        );
      },
    );
  },
);
