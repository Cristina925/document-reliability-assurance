# DRA-001-06 — Benchmark Execution and Comparative Evaluation

**Completion Report**

---

## 1. Files Created

### Source Modules

| File | Description |
|------|-------------|
| `src/benchmark/execution/runner.ts` | `BenchmarkRunner` — executes corpus documents through the frozen evaluator, preserves all results |
| `src/benchmark/execution/human-review.ts` | `HumanReviewSession` — independent reviewer submission model |
| `src/benchmark/execution/comparison.ts` | `compareResults()` — issue-class-level comparison engine |
| `src/benchmark/execution/metrics.ts` | `computeMetrics()` — precision, recall, agreement rate, class distribution |
| `src/benchmark/execution/observations.ts` | `ObservationRegister` — structured observation recording |
| `src/benchmark/execution/reports.ts` | Five typed report generators |
| `src/benchmark/execution/index.ts` | Public module surface |

### Test Files (7 files, 123 new tests)

| File | Tests |
|------|-------|
| `__tests__/fixtures.ts` | (shared fixtures, not test-counted) |
| `__tests__/runner.test.ts` | 21 |
| `__tests__/human-review.test.ts` | 19 |
| `__tests__/comparison.test.ts` | 17 |
| `__tests__/metrics.test.ts` | 18 |
| `__tests__/observations.test.ts` | 20 |
| `__tests__/reports.test.ts` | 24 |
| `__tests__/reproducibility.test.ts` | 11 |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/benchmark/index.ts` | Added `export * from "./execution/index.js"` |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | Added DRA-001-06, marked complete |

---

## 3. Benchmark Execution Architecture

```
BenchmarkExecutionDocument[]         (corpus docs + text content)
         │
         ▼
  BenchmarkRunner.execute()
    ├─ buildRequest(doc, timestamp)   → raw EvaluationRequest (unknown)
    │    id: "eval-DRA-DOC-NNNN"
    │    generatedDocument: { id, title, content: generatedText, ... }
    │    sourceDocuments: [{ id, title, content: sourceText, format: PLAIN_TEXT }]
    │    requestedAt: UTC ISO-8601 with Z
    │
    └─ evaluateDocument(request)      → DocumentAssuranceEvaluation
         │  (frozen Minimum Evaluator Version 1 — unmodified)
         │
         ▼
  ExecutionRecord[]                   (corpusId, corpusDocument, evaluationResult, executedAt)
         │
         ▼
  BenchmarkRunResult                  (runId, startedAt, completedAt, counts, records)
```

### BenchmarkExecutionDocument

The `CorpusDocument` schema carries only corpus metadata (no text content). The
`BenchmarkExecutionDocument` pairs a `CorpusDocument` with the actual text:

```typescript
interface BenchmarkExecutionDocument {
  corpusDocument: CorpusDocument;  // metadata from the corpus registry
  generatedText: string;           // content for the evaluator's generatedDocument
  sourceText: string;              // content for the evaluator's sourceDocuments[0]
}
```

### Immutability Guarantee

`BenchmarkRunResult` and all `ExecutionRecord` objects are frozen with
`Object.freeze()`. Records are emitted in corpus-ID order.

### Never-Throw Guarantee

`BenchmarkRunner.execute()` never throws. If the evaluator pipeline fails for a
document (e.g. Stage 1 rejects the input), the failure is captured in
`ExecutionRecord.evaluationResult` with `ok: false` and `failedAtStage` set.

---

## 4. Human Review Model

Human reviewer data is kept entirely separate from evaluator outputs.

```typescript
// A single issue identified by a reviewer
interface ReviewIssueSubmission {
  issueClass: DraIssueClass;       // one of the nine frozen IC-N classes
  severity: IssueSeverity;         // BLOCKING | ADVISORY
  explanation: string;
}

// One reviewer's complete submission for one document
interface ReviewerSubmission {
  reviewerId: string;
  corpusId: CorpusId;
  submittedAt: string;
  issues: readonly ReviewIssueSubmission[];
  recommendation: AssuranceDecision;    // SUPPORTED | REVIEW | HOLD
  confidence: ReviewerConfidence;       // HIGH | MEDIUM | LOW
  notes?: string;
}

// All reviewer submissions for a benchmark run
interface HumanReviewSession {
  sessionId: string;
  createdAt: string;
  submissions: readonly ReviewerSubmission[];
}
```

`HumanReviewSession` is an immutable value. `addSubmission()` returns a new
session; the original is unchanged. Multiple reviewers may submit for the
same document. Reviewer identifiers are opaque strings.

---

## 5. Comparative Analysis Engine

`compareResults(runResult, session): ComparisonResult`

Comparison is performed at the **issue-class level per document**:

- Multiple evaluator issues of the same class on the same document → counted as **one class**.
- A reviewer issue class "agrees" when the same class appears in the evaluator output for the same document.

```
For each document:
  evaluatorClasses = deduplicated issue classes from evaluationResult.issues
  reviewerClasses  = union of issue classes from all reviewer submissions for this doc

  agreedIssueClasses    = evaluatorClasses ∩ reviewerClasses
  evaluatorOnlyClasses  = evaluatorClasses \ reviewerClasses  (potential false positives)
  reviewerOnlyClasses   = reviewerClasses \ evaluatorClasses  (potential false negatives)
  decisionComparisons   = per-reviewer: evaluatorDecision === reviewerRecommendation?
```

When the evaluator pipeline failed (`ok: false`):
- `evaluatorDecision` → `null`
- `evaluatorIssueClasses` → `[]`
- `evaluatorOnlyClasses` → `[]`
- `reviewerOnlyClasses` → all reviewer-submitted classes
- `decisionComparisons` → `[]`

---

## 6. Benchmark Metrics

`computeMetrics(runResult, comparison): BenchmarkMetrics`

All metrics are computed from the `ComparisonResult`. All fractional values are
rounded to 4 decimal places.

| Metric | Formula | Special cases |
|--------|---------|---------------|
| `recall` | agreedIssues / totalReviewerIssues | 0 when totalReviewerIssues = 0 |
| `precision` | agreedIssues / totalEvaluatorIssues | 1 when both = 0 (vacuous agreement); 0 when evaluator = 0 but reviewers > 0 |
| `falsePositives` | totalEvaluatorIssues − totalAgreedIssues | |
| `falseNegatives` | totalReviewerIssues − totalAgreedIssues | |
| `decisionAgreementRate` | agreedPairs / totalReviewerPairs | 0 when no submissions |

`issueClassDistribution` contains an entry for each of the nine frozen issue
classes, recording `evaluatorCount` (documents where the evaluator detected that
class) and `reviewerCount` (documents where at least one reviewer identified
that class).

---

## 7. Observation Framework

`ObservationRegister` is an immutable, append-only value. Observations do not
alter evaluator behaviour — they are a human-managed annotation layer.

Five observation types:

| Type | When to use |
|------|-------------|
| `STRENGTH` | The evaluator performed well on this aspect |
| `WEAKNESS` | The evaluator underperformed on this aspect |
| `AMBIGUOUS_CASE` | The correct answer is unclear from the corpus document |
| `REVIEWER_DISAGREEMENT` | Human reviewers disagreed with each other |
| `LIMITATION` | A constraint on the benchmark's generalisability |

Observations may be document-specific (`corpusId` present) or corpus-wide
(`corpusId` absent). All register operations return new instances; the original
is unchanged.

---

## 8. Reports Generated

Five typed, frozen report generators. All accept an optional `timestamp` for
deterministic test assertions.

| Report | Key content |
|--------|------------|
| `BenchmarkExecutionReport` | Run metadata, per-document decisions, issue counts, success/failure |
| `ComparativeEvaluationReport` | Per-document: evaluator decision, reviewer count, agreed/evaluator-only/reviewer-only classes, agreement counts |
| `MetricsReport` | Full `BenchmarkMetrics` + interpretation strings (recall summary, precision summary, decision agreement summary) |
| `ObservationRegisterReport` | All observations grouped by type with counts |
| `ExecutiveSummary` | Document count, decision distribution, recall, precision, agreement rate, top-3 strengths/weaknesses/limitations, `overallAssessment` string |

---

## 9. Test Results

| Milestone | Tests Added | Cumulative |
|-----------|-------------|------------|
| DRA-ENG-008B | 93 | 1,747 |
| DRA-001-04A | 114 | 1,861 |
| DRA-001-04B | 144 | 2,005 |
| DRA-001-04C | 112 | 2,117 |
| DRA-001-05A | 0 | 2,117 |
| DRA-001-06 | 123 | **2,240** |

```
Test Files  79 passed (79)
     Tests  2240 passed (2240)
  Duration  ~8s
```

Coverage of each spec requirement area:

| Requirement | Test file |
|-------------|-----------|
| Benchmark execution | `runner.test.ts` |
| Human review model | `human-review.test.ts` |
| Comparison engine | `comparison.test.ts` |
| Metrics calculations | `metrics.test.ts` |
| Observation recording | `observations.test.ts` |
| Report generation | `reports.test.ts` |
| Reproducibility | `reproducibility.test.ts` |
| Proof receipts generated | `runner.test.ts`, `reproducibility.test.ts` |
| All documents executed | `runner.test.ts` |
| Internal consistency | `metrics.test.ts` (count invariants) |

---

## 10. TypeScript Status

```
pnpm exec tsc --noEmit
(no output — zero errors)
```

---

## 11. Production Build Status

`pnpm -w run typecheck:libs` — zero errors.

---

## 12. Reproducibility Verification

**Substantive digest stability:** Two `BenchmarkRunner` instances with identical
`fixedTimestamp` and `fixedRunId` and identical documents produce identical
`proofReceipt.substantiveDigest` values for every document. This is guaranteed
by the evaluator's deterministic pipeline and `computeDigestFromPayload()`
(which excludes operational timestamps from the digest).

**Timestamp independence:** Two runs with *different* `fixedTimestamp` values
still produce identical `substantiveDigest` values. The `evaluatedAt` and
`timestamp` fields on the proof receipt are operational metadata, excluded from
the substantive digest.

**Metric stability:** Identical runs with identical reviewer inputs produce
identical `recall`, `precision`, `decisionAgreementRate`, `falsePositives`,
and `falseNegatives` values.

**Document order:** Records always appear in the order documents were submitted
to `execute()`. This ordering is stable across runs.

---

## 13. Evaluator, Benchmark Corpus, Governance, Issue Taxonomy, and Decision Semantics — Unchanged

No files in the following modules were modified at DRA-001-06:

- `src/pipeline/` — `evaluateDocument`, `deriveDecision`, `buildProofReceipt`, `canonical-serialise`
- `src/normalisation/` through `src/confidence-scoring/` — all seven pipeline stages
- `src/model/` — `DraIssueClass`, `AssuranceDecision`, `ProofReceipt`, all schemas
- `src/benchmark/corpus/` — corpus schema, registry, loader
- `src/benchmark/governance/` — selection protocol, eligibility, allocation, freeze
- `src/benchmark/acquisition/` — provenance, pipeline, candidate registry, corpus validator

The `BenchmarkRunner` passes all corpus documents to `evaluateDocument()` via
a raw `unknown` input object. The evaluator runs as-is; the runner does not
intercept, modify, or reinterpret any evaluator output. All 2,117 pre-existing
tests continue to pass.

---

## Design Decisions

### D1 — Comparison at issue-class level (not instance level)

A benchmark corpus without pre-annotated instance-level ground truth cannot
support instance-level comparison. Class-level comparison (which of the nine
IC-N classes appear per document) is appropriate and unambiguous.

**Why:** Prevents double-counting when the evaluator detects multiple instances
of the same class; focuses on whether the class was detected at all.

### D2 — BenchmarkExecutionDocument: corpus metadata + separate text fields

`CorpusDocument` carries only metadata (no text content). The text content
is supplied separately in `BenchmarkExecutionDocument`. This allows the corpus
registry to remain content-agnostic while the runner can be fed any content.

**Why:** Preserves the corpus schema design from 04A–04C; the runner adapts
to the evaluator's `EvaluationRequest` shape without coupling corpus storage
to evaluator input format.

### D3 — HumanReviewSession is an immutable value

All operations return new sessions; originals are unchanged. This matches the
pattern established for `CorpusRegistry`, `ObservationRegister`, and all other
benchmark data structures.

**Why:** Consistent value-object pattern across the benchmark module; enables
test assertions on original vs. updated sessions without explicit cloning.

### D4 — Precision = 1 when both sides have zero issues

When the evaluator detects no issues AND reviewers report no issues, the
definition `agreed / evaluatorTotal` would be 0/0. The convention is 1.0
(perfect vacuous agreement) rather than NaN or 0.

**Why:** A document where no one finds issues is a genuine agreement that it
is clean. Treating it as 0 precision would penalise the evaluator for agreeing
with reviewers.

### D5 — Operational timestamps excluded from digest; fixedTimestamp enables reproducibility

`BenchmarkRunner` supports a `fixedTimestamp` option so tests can assert on
exact report timestamps. The proof-receipt `substantiveDigest` (computed by
`computeDigestFromPayload()`) already excludes `evaluatedAt` and `timestamp`,
so identical document content always produces the same digest regardless of
when the run occurred.

**Why:** Determinism is the primary reproducibility guarantee; the option is
a test convenience, not a requirement for digest stability.
