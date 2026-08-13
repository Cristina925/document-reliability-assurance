/**
 * DRA-001-07 — Benchmark Corpus Loader
 *
 * Loads the benchmark corpus data into the corpus framework and returns
 * BenchmarkExecutionDocument objects ready for the runner.
 *
 * Uses the existing corpus framework (loadCorpus) to validate and register
 * every document, ensuring all corpus integrity checks pass before
 * evaluation begins.
 *
 * Design:
 *   - Never throws if corpus data is valid; propagates LoadFailure as a
 *     structured error instead.
 *   - BenchmarkExecutionDocuments preserve the canonical corpus order.
 *   - Text content is paired with CorpusDocuments by corpus ID, not by index.
 */

import { loadCorpus, type LoadResult } from "../corpus/loader.js";
import type { CorpusDocument } from "../corpus/schema.js";
import type { BenchmarkExecutionDocument } from "../execution/runner.js";
import {
  BENCHMARK_CORPUS,
  type BenchmarkDocumentEntry,
} from "./corpus-data.js";

// ---------------------------------------------------------------------------
// BenchmarkCorpusLoadResult
// ---------------------------------------------------------------------------

export type BenchmarkCorpusLoadResult =
  | BenchmarkCorpusLoadSuccess
  | BenchmarkCorpusLoadFailure;

export interface BenchmarkCorpusLoadSuccess {
  readonly ok: true;
  /** Loaded CorpusDocuments from the corpus registry, in canonical order. */
  readonly documents: readonly BenchmarkExecutionDocument[];
  /** Total number of documents loaded. */
  readonly documentCount: number;
}

export interface BenchmarkCorpusLoadFailure {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// loadBenchmarkCorpus
// ---------------------------------------------------------------------------

/**
 * Loads the benchmark corpus (all six frozen documents) using the existing
 * corpus framework and returns BenchmarkExecutionDocuments ready for the runner.
 *
 * @param entries Override the corpus entries (defaults to BENCHMARK_CORPUS).
 *                Useful in tests that want to supply a subset.
 */
export function loadBenchmarkCorpus(
  entries: readonly BenchmarkDocumentEntry[] = BENCHMARK_CORPUS,
): BenchmarkCorpusLoadResult {
  // Extract CorpusDocumentInput objects for the corpus loader
  const rawInputs = entries.map((e) => e.input);

  const loadResult: LoadResult = loadCorpus(rawInputs);

  if (!loadResult.ok) {
    return {
      ok: false,
      code: loadResult.code,
      message: loadResult.message,
    };
  }

  // Pair each CorpusDocument with its text content, preserving canonical order
  const execDocuments: BenchmarkExecutionDocument[] = [];

  for (const doc of loadResult.documents) {
    const entry = entries.find((e) => e.input.corpusId === doc.corpusId);
    if (!entry) {
      return {
        ok: false,
        code: "CORPUS_ENTRY_MISSING",
        message: `No corpus entry found for corpus ID ${doc.corpusId}`,
      };
    }
    execDocuments.push(
      Object.freeze<BenchmarkExecutionDocument>({
        corpusDocument: doc as CorpusDocument,
        generatedText: entry.generatedText,
        sourceText: entry.sourceText,
      }),
    );
  }

  return Object.freeze<BenchmarkCorpusLoadSuccess>({
    ok: true,
    documents: Object.freeze(execDocuments),
    documentCount: execDocuments.length,
  });
}
