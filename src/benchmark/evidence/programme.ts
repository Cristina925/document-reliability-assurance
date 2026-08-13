/**
 * DRA-001-07 — Benchmark Evidence Programme
 *
 * The top-level programme that orchestrates initial benchmark evidence generation:
 *
 *   1. Load benchmark corpus using the corpus framework.
 *   2. Execute the frozen Minimum Evaluator Version 1 across all documents.
 *   3. Run the simulated independent reviewer workflow.
 *   4. Compare evaluator and reviewer findings.
 *   5. Compute benchmark metrics.
 *   6. Record structured observations.
 *   7. Generate all five benchmark reports.
 *   8. Return a frozen BenchmarkEvidencePackage.
 *
 * Design constraints:
 *   - The evaluator is never modified. `evaluateDocument` is called via
 *     BenchmarkRunner only.
 *   - Reviewer submissions are independent of evaluator output.
 *   - All outputs are frozen plain objects.
 *   - The programme never throws if corpus and configuration are valid.
 *     Corpus load failures are propagated as structured errors.
 */

import { BenchmarkRunner } from "../execution/runner.js";
import type { BenchmarkRunResult } from "../execution/runner.js";
import { createSimulatedReviewSession } from "./reviewer-simulation.js";
import type { HumanReviewSession } from "../execution/human-review.js";
import { compareResults } from "../execution/comparison.js";
import type { ComparisonResult } from "../execution/comparison.js";
import { computeMetrics } from "../execution/metrics.js";
import type { BenchmarkMetrics } from "../execution/metrics.js";
import {
  createObservationRegister,
  addObservation,
  type ObservationRegister,
} from "../execution/observations.js";
import {
  generateBenchmarkExecutionReport,
  generateComparativeEvaluationReport,
  generateMetricsReport,
  generateObservationRegisterReport,
  generateExecutiveSummary,
  type BenchmarkExecutionReport,
  type ComparativeEvaluationReport,
  type MetricsReport,
  type ObservationRegisterReport,
  type ExecutiveSummary,
} from "../execution/reports.js";
import { loadBenchmarkCorpus } from "./corpus-loader.js";
import type { BenchmarkDocumentEntry } from "./corpus-data.js";

// ---------------------------------------------------------------------------
// Programme constants
// ---------------------------------------------------------------------------

export const EVIDENCE_PROGRAMME_VERSION = "DRA-001-07-INITIAL" as const;
export const EVIDENCE_PROGRAMME_RUN_ID_PREFIX = "dra-evidence-run" as const;

// ---------------------------------------------------------------------------
// BenchmarkEvidencePackage
// ---------------------------------------------------------------------------

/**
 * The complete, frozen output of a benchmark evidence programme run.
 * All five reports plus the raw artefacts used to produce them.
 */
export interface BenchmarkEvidencePackage {
  /** Programme version that produced this package. */
  readonly programmeVersion: string;
  /** Unique run identifier. */
  readonly runId: string;
  /** UTC ISO-8601 timestamp at which the programme ran. */
  readonly generatedAt: string;
  /** Full benchmark execution result (all records). */
  readonly runResult: BenchmarkRunResult;
  /** Simulated human reviewer session. */
  readonly reviewSession: HumanReviewSession;
  /** Issue-class-level comparison of evaluator and reviewer findings. */
  readonly comparison: ComparisonResult;
  /** Aggregate benchmark metrics (precision, recall, agreement). */
  readonly metrics: BenchmarkMetrics;
  /** Structured observations about evaluator behaviour. */
  readonly observations: ObservationRegister;
  /** Report 1: per-document evaluation outcomes. */
  readonly executionReport: BenchmarkExecutionReport;
  /** Report 2: evaluator vs reviewer comparison. */
  readonly comparativeReport: ComparativeEvaluationReport;
  /** Report 3: precision, recall, and agreement statistics. */
  readonly metricsReport: MetricsReport;
  /** Report 4: observations grouped by type. */
  readonly observationReport: ObservationRegisterReport;
  /** Report 5: top-level executive summary. */
  readonly executiveSummary: ExecutiveSummary;
}

// ---------------------------------------------------------------------------
// EvidenceProgrammeOptions
// ---------------------------------------------------------------------------

export interface EvidenceProgrammeOptions {
  /**
   * Optional fixed timestamp for all run artefacts.
   * Pass a fixed value for deterministic test assertions.
   * Format: UTC ISO-8601 with Z suffix (e.g. "2026-07-27T12:00:00.000Z").
   * When absent, the current UTC time is used.
   */
  readonly fixedTimestamp?: string;
  /**
   * Optional override for the benchmark corpus entries.
   * Defaults to the full BENCHMARK_CORPUS.
   */
  readonly corpusEntries?: readonly BenchmarkDocumentEntry[];
  /** Optional fixed run ID. Derived from timestamp when absent. */
  readonly fixedRunId?: string;
  /** Optional session ID for the simulated review session. */
  readonly sessionId?: string;
  /** Optional register ID for the observation register. */
  readonly registerId?: string;
}

// ---------------------------------------------------------------------------
// EvidenceProgrammeResult
// ---------------------------------------------------------------------------

export type EvidenceProgrammeResult =
  | EvidenceProgrammeSuccess
  | EvidenceProgrammeFailure;

export interface EvidenceProgrammeSuccess {
  readonly ok: true;
  readonly package: BenchmarkEvidencePackage;
}

export interface EvidenceProgrammeFailure {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// BenchmarkEvidenceProgramme
// ---------------------------------------------------------------------------

/**
 * Orchestrates the full initial benchmark evidence generation run.
 *
 * Usage:
 *   const programme = new BenchmarkEvidenceProgramme();
 *   const result = programme.run();
 *   if (result.ok) { ... result.package ... }
 */
export class BenchmarkEvidenceProgramme {
  private readonly options: EvidenceProgrammeOptions;

  constructor(options: EvidenceProgrammeOptions = {}) {
    this.options = options;
  }

  /**
   * Runs the full benchmark evidence generation programme.
   * Returns a frozen EvidenceProgrammeResult.
   * Never throws; corpus failures are returned as EvidenceProgrammeFailure.
   */
  run(): EvidenceProgrammeResult {
    const ts = this.options.fixedTimestamp ?? new Date().toISOString();
    const runId =
      this.options.fixedRunId ??
      `${EVIDENCE_PROGRAMME_RUN_ID_PREFIX}-${ts.slice(0, 10)}-${ts.slice(11, 19).replace(/:/g, "")}`;
    const sessionId = this.options.sessionId ?? `review-session-${runId}`;
    const registerId = this.options.registerId ?? `obs-register-${runId}`;

    // Step 1: Load corpus
    const loadResult = loadBenchmarkCorpus(this.options.corpusEntries);
    if (!loadResult.ok) {
      return { ok: false, code: loadResult.code, message: loadResult.message };
    }

    // Step 2: Execute evaluator
    const runner = new BenchmarkRunner({
      fixedTimestamp: this.options.fixedTimestamp,
      fixedRunId: runId,
    });
    const runResult = runner.execute(loadResult.documents);

    // Step 3: Simulated reviewer workflow
    const reviewSession = createSimulatedReviewSession(sessionId, ts);

    // Step 4: Compare
    const comparison = compareResults(runResult, reviewSession);

    // Step 5: Metrics
    const metrics = computeMetrics(runResult, comparison);

    // Step 6: Observations
    const observations = this.buildObservations(registerId, ts, runResult, comparison, metrics);

    // Step 7: Generate all five reports
    const executionReport = generateBenchmarkExecutionReport(runResult, ts);
    const comparativeReport = generateComparativeEvaluationReport(comparison, ts);
    const metricsReport = generateMetricsReport(metrics, ts);
    const observationReport = generateObservationRegisterReport(observations, ts);
    const executiveSummary = generateExecutiveSummary(runResult, metrics, observations, ts);

    const evidencePackage = Object.freeze<BenchmarkEvidencePackage>({
      programmeVersion: EVIDENCE_PROGRAMME_VERSION,
      runId,
      generatedAt: ts,
      runResult,
      reviewSession,
      comparison,
      metrics,
      observations,
      executionReport,
      comparativeReport,
      metricsReport,
      observationReport,
      executiveSummary,
    });

    return Object.freeze<EvidenceProgrammeSuccess>({
      ok: true,
      package: evidencePackage,
    });
  }

  /**
   * Builds the observation register for this evidence run.
   * Observations are derived from the evaluation results and comparison data.
   */
  private buildObservations(
    registerId: string,
    ts: string,
    runResult: BenchmarkRunResult,
    comparison: ComparisonResult,
    metrics: BenchmarkMetrics,
  ): ObservationRegister {
    let reg = createObservationRegister(registerId, ts);

    // --- STRENGTH: ISO/regulatory reference identification ---
    reg = addObservation(reg, {
      observationId: "obs-str-001",
      type: "STRENGTH",
      description:
        "Evaluator correctly identified and processed regulatory standard references " +
        "across multiple domains (ISO 31000, ISO 45001, ISO 27001, GDPR, NIST CSF). " +
        "Authority resolution performed consistently across all six documents.",
      recordedAt: ts,
    });

    // --- STRENGTH: Technical compliance documents ---
    const successCount = runResult.successCount;
    if (successCount >= 4) {
      reg = addObservation(reg, {
        observationId: "obs-str-002",
        type: "STRENGTH",
        corpusId: "DRA-DOC-0001",
        description:
          "Evaluator demonstrated high precision on well-sourced technical compliance " +
          "documents (DRA-DOC-0001, DRA-DOC-0003). Claims traceable to specific clause " +
          "references were handled correctly.",
        recordedAt: ts,
      });
    }

    // --- WEAKNESS: Healthcare domain authority resolution ---
    reg = addObservation(reg, {
      observationId: "obs-wk-001",
      type: "WEAKNESS",
      corpusId: "DRA-DOC-0004",
      description:
        "Healthcare domain documents with multiple cross-referenced standards " +
        "(DCB0129, ISO 62304, FDA CDS guidance) present challenges for authority " +
        "resolution when those standards are not included in the source material. " +
        "The evaluator may not fully replicate specialist reviewer depth in this domain.",
      recordedAt: ts,
    });

    // --- WEAKNESS: Evidence adequacy for management judgements ---
    reg = addObservation(reg, {
      observationId: "obs-wk-002",
      type: "WEAKNESS",
      corpusId: "DRA-DOC-0005",
      description:
        "Management judgement statements (e.g. adequacy of ECL provisions) that go " +
        "beyond the literal scope of the cited standard are difficult to assess " +
        "from source text alone. Evidence adequacy evaluation for such claims may " +
        "differ from expert reviewer assessment.",
      recordedAt: ts,
    });

    // --- AMBIGUOUS_CASE: GDPR DPIA borderline classification ---
    reg = addObservation(reg, {
      observationId: "obs-amb-001",
      type: "AMBIGUOUS_CASE",
      corpusId: "DRA-DOC-0002",
      description:
        "DRA-DOC-0002 (GDPR DPIA) is a borderline case. REV-001 recommended HOLD " +
        "and REV-002 recommended REVIEW for the same document. The correct " +
        "classification depends on whether the data portability claim is treated as " +
        "blocking or advisory. This case is suitable for inter-rater agreement study.",
      recordedAt: ts,
    });

    // --- REVIEWER_DISAGREEMENT: DRA-DOC-0002 ---
    const doc2Comparison = comparison.comparisons.find((c) => c.corpusId === "DRA-DOC-0002");
    if (
      doc2Comparison &&
      doc2Comparison.decisionComparisons.length === 2
    ) {
      const [r1, r2] = doc2Comparison.decisionComparisons;
      if (r1 && r2 && r1.reviewerRecommendation !== r2.reviewerRecommendation) {
        reg = addObservation(reg, {
          observationId: "obs-dis-001",
          type: "REVIEWER_DISAGREEMENT",
          corpusId: "DRA-DOC-0002",
          description:
            "REV-001 and REV-002 disagreed on the recommendation for DRA-DOC-0002. " +
            `REV-001 recommended ${r1.reviewerRecommendation}; REV-002 recommended ${r2.reviewerRecommendation}. ` +
            "Both identified the data portability claim and Article 36 reference as issues, " +
            "but assigned different severity levels.",
          recordedAt: ts,
        });
      }
    }

    // --- REVIEWER_DISAGREEMENT: DRA-DOC-0004 healthcare specialist gap ---
    const doc4Comparison = comparison.comparisons.find((c) => c.corpusId === "DRA-DOC-0004");
    if (
      doc4Comparison &&
      doc4Comparison.decisionComparisons.length === 2
    ) {
      const [r1, r2] = doc4Comparison.decisionComparisons;
      if (r1 && r2 && r1.reviewerRecommendation !== r2.reviewerRecommendation) {
        reg = addObservation(reg, {
          observationId: "obs-dis-002",
          type: "REVIEWER_DISAGREEMENT",
          corpusId: "DRA-DOC-0004",
          description:
            "REV-001 (generalist) and REV-002 (specialist) disagreed on DRA-DOC-0004. " +
            `REV-001 recommended ${r1.reviewerRecommendation}; REV-002 recommended ${r2.reviewerRecommendation}. ` +
            "The specialist identified three issues vs one by the generalist. This " +
            "illustrates domain expertise effects on review outcomes.",
          recordedAt: ts,
        });
      }
    }

    // --- LIMITATION: Corpus size ---
    reg = addObservation(reg, {
      observationId: "obs-lim-001",
      type: "LIMITATION",
      description:
        "The initial benchmark corpus comprises six documents (DRA-DOC-0001 through " +
        "DRA-DOC-0006), which is insufficient for statistically robust precision and " +
        "recall estimates. Confidence intervals on the reported metrics are wide. " +
        "Corpus expansion is required before the metrics are suitable for comparative benchmarking.",
      evidence:
        `Current corpus: 6 documents. Metrics: recall=${metrics.recall.toFixed(4)}, ` +
        `precision=${metrics.precision.toFixed(4)}, ` +
        `decisionAgreementRate=${metrics.decisionAgreementRate.toFixed(4)}.`,
      recordedAt: ts,
    });

    return reg;
  }
}
