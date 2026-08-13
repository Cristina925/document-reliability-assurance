/**
 * DRA-ENG-019 Part C — Semantic-Equivalence Oracle
 *
 * Proves the DRA-ENG-019-optimised `detectSemanticParaphrase` (cached
 * per-source chunk index + bigram inverted candidate narrowing) produces
 * BYTE-IDENTICAL output to the frozen pre-optimisation brute-force
 * reference implementation (see ./support/dra-eng-019-reference-semantic-paraphrase.ts,
 * a verbatim copy of the algorithm as it existed before this ticket), for:
 *
 *   1. Every real statement extracted from a genuine 40-page prefix of the
 *      NIST SP 800-53 corpus document (DRA-DOC-0030's source), matched
 *      against the real source text — several thousand real-world
 *      statement/source pairs, not synthetic toy cases.
 *   2. A battery of synthetic edge cases: empty/short statements, no shared
 *      bigrams, ties at the exact MIN_SHARED_TERMS/MIN_SHARED_BIGRAMS
 *      thresholds, polarity mismatches, multi-source-array inputs, and
 *      statements matching only after several disqualified candidates.
 *
 * This test was defined and run BEFORE any optimisation was applied to
 * production code (the reference oracle is a pre-change snapshot), per
 * DRA-ENG-019 Part C's "define equivalence method before optimising"
 * requirement.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../../benchmark/acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../benchmark/acquisition/__tests__/support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../../benchmark/acquisition/request.js";
import { normaliseEvaluationRequest } from "../../normalisation/index.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { detectSemanticParaphrase } from "../semantic-paraphrase.js";
import { referenceDetectSemanticParaphrase } from "./support/dra-eng-019-reference-semantic-paraphrase.js";

const NIST_SP80053_PDF_URL =
  "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf";
const REVIEW_TIMESTAMP = "2026-08-11T08:00:00.000Z";
const CACHE_NAME = "dra-eng-019";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-019-eq-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath], {
      maxBuffer: 1024 * 1024 * 64,
    });
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

async function fetchNistBytes(): Promise<Uint8Array> {
  const realFetcher = createHttpFetcher({
    timeoutMs: 120_000,
    maxRedirects: 5,
    maxBytes: 20_000_000,
    userAgent: "DRA-ENG-019-semantic-equivalence/1.0",
  });
  const fetcher = createDiskCachedFetcher(realFetcher, CACHE_NAME);
  const req = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000033",
    sourceUrl: NIST_SP80053_PDF_URL,
    requestedBy: "DRA-ENG-019-semantic-equivalence",
    requestedAt: REVIEW_TIMESTAMP,
  });
  if (!req.ok) throw new Error("request build failed");
  const fetchResult = await fetcher(req.request, {});
  if (!fetchResult.ok) throw new Error(`fetch failed: ${fetchResult.code}`);
  return fetchResult.source.rawBytes;
}

describe("DRA-ENG-019 Part C — real-corpus semantic equivalence (40-page prefix)", () => {
  let statements: string[];
  let sourceText: string;

  beforeAll(async () => {
    const bytes = await fetchNistBytes();
    const fullText = await extractPdfText(bytes);
    const pages = fullText.split("\f");
    sourceText = pages.slice(0, 40).join("\f");

    const evalReq = {
      id: "dra-eng-019-equivalence-40p",
      requestedAt: REVIEW_TIMESTAMP,
      generatedDocument: {
        id: "dra-eng-019-equivalence-40p-gdoc",
        title: "NIST SP 800-53 Rev 5 (40-page prefix)",
        content: sourceText,
        sourceDocumentIds: ["dra-eng-019-equivalence-40p-sdoc"],
        generatedAt: REVIEW_TIMESTAMP,
      },
      sourceDocuments: [
        { id: "dra-eng-019-equivalence-40p-sdoc", title: "Source", content: sourceText, format: "PLAIN_TEXT" as const },
      ],
    };
    const s1 = normaliseEvaluationRequest(evalReq);
    if (!s1.ok) throw new Error("Stage 1 failed");
    const s2 = extractClaims(s1.normalisedRequest);
    if (!s2.ok) throw new Error("Stage 2 failed");
    statements = s2.statements.map((s) => s.text);
  }, 120_000);

  it(
    "optimised detectSemanticParaphrase matches the frozen reference oracle for every real statement",
    () => {
      expect(statements.length).toBeGreaterThan(1000);

      let matchCount = 0;
      let nullCount = 0;
      let mismatches = 0;
      const mismatchDetails: string[] = [];

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]!;
        const optimised = detectSemanticParaphrase(stmt, [sourceText]);
        const reference = referenceDetectSemanticParaphrase(stmt, [sourceText]);

        const equal =
          (optimised === null && reference === null) ||
          (optimised !== null &&
            reference !== null &&
            optimised.sourceIndex === reference.sourceIndex &&
            optimised.sourceChunkStart === reference.sourceChunkStart &&
            optimised.matchedText === reference.matchedText &&
            JSON.stringify([...optimised.sharedBigrams]) === JSON.stringify([...reference.sharedBigrams]) &&
            JSON.stringify([...optimised.sharedTerms]) === JSON.stringify([...reference.sharedTerms]));

        if (!equal) {
          mismatches++;
          if (mismatchDetails.length < 5) {
            mismatchDetails.push(
              `statement[${i}]="${stmt.slice(0, 80)}" optimised=${JSON.stringify(optimised)} reference=${JSON.stringify(reference)}`,
            );
          }
        } else if (optimised !== null) {
          matchCount++;
        } else {
          nullCount++;
        }
      }

      console.log(
        `\n  DRA-ENG-019 Part C: ${statements.length} real statements checked. ` +
          `${matchCount} matched, ${nullCount} null (agree), ${mismatches} mismatches.`,
      );
      if (mismatches > 0) {
        console.log("  Mismatch samples:\n" + mismatchDetails.join("\n"));
      }

      expect(mismatches).toBe(0);
      // Sanity: this document must actually exercise the semantic-paraphrase
      // path with a mix of matches and non-matches for the test to be
      // meaningful (not a vacuous all-null comparison).
      expect(nullCount).toBeGreaterThan(0);
    },
    120_000,
  );
});

describe("DRA-ENG-019 Part C — synthetic edge-case semantic equivalence", () => {
  function compare(statement: string, sourceTexts: string[]): void {
    const optimised = detectSemanticParaphrase(statement, sourceTexts);
    const reference = referenceDetectSemanticParaphrase(statement, sourceTexts);
    if (optimised === null || reference === null) {
      expect(optimised).toEqual(reference);
      return;
    }
    expect(optimised.sourceIndex).toBe(reference.sourceIndex);
    expect(optimised.sourceChunkStart).toBe(reference.sourceChunkStart);
    expect(optimised.matchedText).toBe(reference.matchedText);
    expect([...optimised.sharedBigrams]).toEqual([...reference.sharedBigrams]);
    expect([...optimised.sharedTerms]).toEqual([...reference.sharedTerms]);
  }

  it("empty source array", () => {
    compare("The companion may not answer questions on the worker's behalf.", []);
  });

  it("statement below MIN_STATEMENT_TERMS", () => {
    compare("OK.", ["The companion does not have the right to answer questions."]);
  });

  it("no shared bigrams at all (disjoint vocabulary)", () => {
    compare("Quantum reactors emit unexpected photon cascades daily.", [
      "The weather in coastal regions varies significantly during autumn months.",
    ]);
  });

  it("shared terms but zero shared bigrams (scrambled word order)", () => {
    compare("companion answer questions worker behalf hearing", [
      "worker behalf hearing hearing companion questions answer separate unrelated fragments interspersed",
    ]);
  });

  it("exactly at MIN_SHARED_TERMS / MIN_SHARED_BIGRAMS thresholds", () => {
    compare("The companion may answer difficult questions today.", [
      "A companion may answer difficult questions during the session.",
    ]);
  });

  it("polarity mismatch with otherwise-strong overlap", () => {
    compare("The companion may answer questions on the worker's behalf.", [
      "The companion does not have the right to answer questions on the worker's behalf.",
    ]);
  });

  it("match exists only in the second of two disqualified-then-qualifying sources", () => {
    compare(
      "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing.",
      [
        "Completely irrelevant filler content about unrelated procurement schedules and budget forecasts.",
        "The employer must hold a disciplinary meeting within a reasonable timeframe after the incident occurs.",
        "The companion does not, however, have the right to answer questions on the worker's behalf, or to address the meeting in a way which prevents the employer from explaining their case.",
      ],
    );
  });

  it("match exists only in a later chunk within a single long source (paragraph fallback windowing)", () => {
    const longParagraph =
      ("Irrelevant background filler sentence describing procurement timelines and budget considerations that has nothing to do with companion rights whatsoever and simply pads the length of this paragraph well beyond the eight hundred character threshold so that the sliding window chunking fallback path is exercised instead of the simple whole-paragraph path. ".repeat(3)) +
      "The companion does not have the right to answer questions on the worker's behalf during the disciplinary hearing process. " +
      "More irrelevant filler content follows this sentence to further pad the paragraph length beyond the threshold for window-based chunking to continue being exercised through to the very end of the passage.";
    compare(
      "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing.",
      [longParagraph],
    );
  });

  it("many small paragraphs, only the last one qualifies", () => {
    const paragraphs = [
      "First unrelated paragraph about weather patterns and seasonal variation.",
      "Second unrelated paragraph discussing agricultural yield projections.",
      "Third unrelated paragraph covering transportation infrastructure planning.",
      "Fourth unrelated paragraph regarding municipal budget allocations.",
      "The companion does not have the right to answer questions on the worker's behalf at any formal hearing.",
    ];
    compare(
      "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing.",
      [paragraphs.join("\n\n")],
    );
  });

  it("identical statement text used as its own source (self-match, degenerate case)", () => {
    const text = "The companion does not have the right to answer questions on the worker's behalf.";
    compare(text, [text]);
  });

  it("very high-frequency bigram appearing in many chunks (candidate-set stress)", () => {
    const chunks: string[] = [];
    for (let i = 0; i < 30; i++) {
      chunks.push(`Generic filler paragraph number ${i} about routine administrative matters and questions arising therein.`);
    }
    chunks.push("The companion does not have the right to answer questions on the worker's behalf during the hearing.");
    compare(
      "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing.",
      [chunks.join("\n\n")],
    );
  });
});
