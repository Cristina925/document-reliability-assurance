/**
 * DRA-001-06 — Benchmark Execution Runner
 *
 * Executes every document in a benchmark corpus through the frozen
 * Minimum Evaluator Version 1. Preserves every raw evaluation result
 * and generates immutable proof receipts.
 *
 * Design invariants:
 *   - Never throws. Evaluation failures are captured in ExecutionRecord.
 *   - All outputs (BenchmarkRunResult, ExecutionRecord) are frozen.
 *   - Repeated execution with identical inputs and fixedTimestamp produces
 *     identical proof-receipt substantiveDigests.
 */

import { evaluateDocument } from "../../pipeline/index.js";
import type { DocumentAssuranceEvaluation } from "../../pipeline/index.js";
import type { CorpusDocument, CorpusId } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// BenchmarkExecutionDocument
// ---------------------------------------------------------------------------

/**
 * A corpus document paired with its text content for evaluation.
 * CorpusDocument carries corpus metadata only; the text fields supply
 * the actual content fed to the frozen evaluator.
 */
export interface BenchmarkExecutionDocument {
  readonly corpusDocument: CorpusDocument;
  /** Generated document text — the primary input to the evaluator. */
  readonly generatedText: string;
  /** Source reference text — the evidence base for the generated document. */
  readonly sourceText: string;
}

// ---------------------------------------------------------------------------
// ExecutionRecord
// ---------------------------------------------------------------------------

/** The raw result of evaluating one corpus document. Preserved immutably. */
export interface ExecutionRecord {
  /** Permanent corpus identifier. */
  readonly corpusId: CorpusId;
  /** The corpus document metadata. */
  readonly corpusDocument: CorpusDocument;
  /** Raw evaluation result — success (ok:true) or failure (ok:false). */
  readonly evaluationResult: DocumentAssuranceEvaluation;
  /** UTC ISO-8601 timestamp at which this document was submitted for evaluation. */
  readonly executedAt: string;
}

// ---------------------------------------------------------------------------
// BenchmarkRunResult
// ---------------------------------------------------------------------------

/** The complete, immutable result of a benchmark execution run. */
export interface BenchmarkRunResult {
  /** Unique run identifier. */
  readonly runId: string;
  /** UTC ISO-8601 datetime at which the run started. */
  readonly startedAt: string;
  /** UTC ISO-8601 datetime at which the run completed. */
  readonly completedAt: string;
  /** Total number of documents submitted to the runner. */
  readonly documentCount: number;
  /** Documents that returned ok:true from the evaluator. */
  readonly successCount: number;
  /** Documents that returned ok:false from the evaluator. */
  readonly failureCount: number;
  /** All execution records, in corpus-ID order. */
  readonly records: readonly ExecutionRecord[];
}

// ---------------------------------------------------------------------------
// BenchmarkRunnerOptions
// ---------------------------------------------------------------------------

export interface BenchmarkRunnerOptions {
  /**
   * Optional fixed timestamp for evaluation requests and run metadata.
   * When provided, all timestamps in this run use this value — enabling
   * deterministic test assertions.
   * Format: UTC ISO-8601 with Z suffix (e.g. "2026-07-27T12:00:00.000Z").
   * When absent, the runner uses the current UTC time for each call.
   */
  readonly fixedTimestamp?: string;
  /**
   * Optional fixed run ID.
   * When absent, the runner derives a run ID from the start timestamp.
   */
  readonly fixedRunId?: string;
}

// ---------------------------------------------------------------------------
// BenchmarkRunner
// ---------------------------------------------------------------------------

/**
 * Executes a set of benchmark documents through the frozen Minimum Evaluator
 * Version 1 and returns a complete, immutable BenchmarkRunResult.
 *
 * Reproducibility: when fixedTimestamp and fixedRunId are provided, repeated
 * calls with the same documents produce the same proof-receipt substantiveDigest
 * on every record. Operational timestamps (evaluatedAt, proofReceipt.timestamp)
 * may vary but are excluded from the substantive digest.
 */
export class BenchmarkRunner {
  private readonly options: BenchmarkRunnerOptions;

  constructor(options: BenchmarkRunnerOptions = {}) {
    this.options = options;
  }

  /**
   * Executes all provided documents through the evaluator in document order.
   *
   * @param documents  Corpus documents with their text content.
   * @returns          A frozen BenchmarkRunResult containing every record.
   */
  execute(
    documents: readonly BenchmarkExecutionDocument[],
  ): BenchmarkRunResult {
    const startedAt = this.timestamp();
    const runId =
      this.options.fixedRunId ??
      `run-${startedAt.replace(/[:.Z]/g, "-").replace(/-+$/, "")}`;

    const records: ExecutionRecord[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const doc of documents) {
      const executedAt = this.timestamp();
      const request = this.buildRequest(doc, executedAt);
      const evaluationResult = evaluateDocument(request);

      if (evaluationResult.ok) {
        successCount++;
      } else {
        failureCount++;
      }

      records.push(
        Object.freeze<ExecutionRecord>({
          corpusId: doc.corpusDocument.corpusId as CorpusId,
          corpusDocument: doc.corpusDocument,
          evaluationResult,
          executedAt,
        }),
      );
    }

    const completedAt = this.timestamp();

    return Object.freeze<BenchmarkRunResult>({
      runId,
      startedAt,
      completedAt,
      documentCount: documents.length,
      successCount,
      failureCount,
      records: Object.freeze(records),
    });
  }

  /**
   * Constructs a raw evaluation request (unknown) from a BenchmarkExecutionDocument.
   * Stage 1 (Input Normalisation) validates and normalises the result.
   */
  private buildRequest(
    doc: BenchmarkExecutionDocument,
    requestedAt: string,
  ): unknown {
    const corpusId = doc.corpusDocument.corpusId;
    const sourceId = `sdoc-${corpusId}-src`;
    return {
      id: `eval-${corpusId}`,
      generatedDocument: {
        id: `gdoc-${corpusId}`,
        title: doc.corpusDocument.title,
        content: doc.generatedText,
        sourceDocumentIds: [sourceId],
      },
      sourceDocuments: [
        {
          id: sourceId,
          title: `Source: ${doc.corpusDocument.title}`,
          content: doc.sourceText,
          format: "PLAIN_TEXT",
        },
      ],
      requestedAt,
    };
  }

  /** Returns a UTC ISO-8601 timestamp. Uses fixedTimestamp when set. */
  private timestamp(): string {
    return this.options.fixedTimestamp ?? new Date().toISOString();
  }
}
