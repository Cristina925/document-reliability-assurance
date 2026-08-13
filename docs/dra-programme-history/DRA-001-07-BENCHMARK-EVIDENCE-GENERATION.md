# DRA-001-07 — Initial Benchmark Evidence Generation

**Completion Report**

---

## 1. Files Created

### Source Modules

| File | Description |
|------|-------------|
| `src/benchmark/evidence/corpus-data.ts` | Six frozen benchmark document entries (`BenchmarkDocumentEntry[]`) with metadata and text content |
| `src/benchmark/evidence/corpus-loader.ts` | `loadBenchmarkCorpus()` — loads corpus via the existing corpus framework |
| `src/benchmark/evidence/reviewer-simulation.ts` | `createSimulatedReviewSession()` — deterministic independent reviewer workflow |
| `src/benchmark/evidence/programme.ts` | `BenchmarkEvidenceProgramme.run()` → `BenchmarkEvidencePackage` |
| `src/benchmark/evidence/index.ts` | Public module surface |

### Test Files (5 files, 199 new tests)

| File | Tests |
|------|-------|
| `__tests__/corpus-data.test.ts` | 46 |
| `__tests__/corpus-loader.test.ts` | 28 |
| `__tests__/reviewer-simulation.test.ts` | 38 |
| `__tests__/programme.test.ts` | 41 |
| `__tests__/integration.test.ts` | 38 |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/benchmark/index.ts` | Added `export * from "./evidence/index.js"` |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | DRA-001-07 marked complete |

---

## 3. Benchmark Corpus

Six frozen documents covering all six defined domains and all three difficulty levels:

| Corpus ID | Title | Domain | Difficulty | Source Type |
|-----------|-------|--------|------------|-------------|
| DRA-DOC-0001 | Safety Management System Compliance Audit Report — Q2 2026 | TECHNICAL | HIGH | AI_GENERATED |
| DRA-DOC-0002 | Data Protection Impact Assessment — Customer Analytics Platform | LEGAL | HIGH | AI_GENERATED |
| DRA-DOC-0003 | Third-Party Vendor Risk Assessment — Cloud Infrastructure Providers | BUSINESS | MEDIUM | HYBRID |
| DRA-DOC-0004 | Clinical Decision Support System Validation Report — Sepsis Alerting Module | HEALTHCARE | HIGH | AI_GENERATED |
| DRA-DOC-0005 | Internal Financial Controls Adequacy Assessment — FY2025 | FINANCE | MEDIUM | AI_GENERATED |
| DRA-DOC-0006 | Information Security Policy Framework — Annual Review 2026 | GENERAL | LOW | HUMAN_AUTHORED |

### Corpus Design Rationale

Each document was designed to exercise different evaluator capabilities:

**DRA-DOC-0001 (TECHNICAL):** Well-sourced ISO 31000:2018 / ISO 45001:2018 compliance audit with specific clause references. Tests evaluator precision on clearly-supported technical claims.

**DRA-DOC-0002 (LEGAL):** GDPR Article 35 DPIA with claims that extend beyond the cited source (data portability guarantee, Article 36/22 references). Tests UNSUPPORTED_CLAIM and AUTHORITY_ABSENT detection.

**DRA-DOC-0003 (BUSINESS):** NIST CSF 2.0 and ISO 27036-1:2021 vendor risk assessment with strong traceability. Tests evaluator performance on well-supported business documents.

**DRA-DOC-0004 (HEALTHCARE):** Clinical CDS validation with multiple cross-referenced standards not all present in source (FDA CDS guidance, DCB0129, ISO 62304). Tests AUTHORITY_ABSENT and TRACEABILITY_BROKEN detection across complex standards.

**DRA-DOC-0005 (FINANCE):** SOX 404 and IFRS 9 financial controls report with a management judgement claim (ECL adequacy) not supported by the source, plus unreferenced IFRS 9 Section 6.4. Tests EVIDENCE_INADEQUATE and UNSUPPORTED_CLAIM in financial domain.

**DRA-DOC-0006 (GENERAL):** ISO 27001:2022 information security policy with a scope claim extending into employment law not within the cited clauses. Tests SCOPE_VIOLATION detection.

---

## 4. Corpus Loader Architecture

```
loadBenchmarkCorpus(entries?)
  │
  ├─ Extract CorpusDocumentInputs
  ├─ loadCorpus(rawInputs)           ← existing corpus framework (validates + registers)
  │    ├─ validateCorpusDocumentInput() per document
  │    ├─ CorpusRegistry.add() per document (computes integrityDigest)
  │    └─ validateRegistryIntegrity()
  │
  ├─ Pair each CorpusDocument with text content (by corpus ID)
  └─ Return BenchmarkCorpusLoadSuccess | BenchmarkCorpusLoadFailure
```

The loader uses `loadCorpus()` from the existing corpus framework. This ensures all registry integrity checks, duplicate detection, and schema validation run before any document reaches the evaluator.

---

## 5. Independent Reviewer Simulation

Two reviewers with independent assessments:

| Reviewer | Role | Coverage |
|----------|------|----------|
| `REV-001` | General Assurance Analyst | All 6 documents |
| `REV-002` | Domain Specialist | All 6 documents |

**Total submissions:** 12 (2 reviewers × 6 documents)

### Reviewer Design

Reviewers were designed to produce realistic disagreement patterns:

| Document | REV-001 | REV-002 | Agreement |
|----------|---------|---------|-----------|
| DRA-DOC-0001 | SUPPORTED (0 issues) | SUPPORTED (1 advisory) | ✓ recommendation |
| DRA-DOC-0002 | HOLD (2 issues) | REVIEW (2 issues) | ✗ |
| DRA-DOC-0003 | SUPPORTED (0 issues) | SUPPORTED (0 issues) | ✓ |
| DRA-DOC-0004 | REVIEW (1 issue) | HOLD (3 issues) | ✗ |
| DRA-DOC-0005 | REVIEW (1 issue) | REVIEW (2 issues) | ✓ recommendation |
| DRA-DOC-0006 | SUPPORTED (0 issues) | REVIEW (1 advisory) | ✗ |

- Reviewers agree on the recommendation for 3/6 documents
- Reviewers disagree on 3/6 documents (DRA-DOC-0002, -0004, -0006)
- DRA-DOC-0002 is an explicit AMBIGUOUS_CASE (HOLD vs REVIEW)
- DRA-DOC-0004 shows domain expertise gap (generalist vs specialist)

---

## 6. Evidence Programme

`BenchmarkEvidenceProgramme.run()` orchestrates the full pipeline:

```
1. loadBenchmarkCorpus()               → BenchmarkCorpusLoadResult
2. BenchmarkRunner.execute()           → BenchmarkRunResult
3. createSimulatedReviewSession()      → HumanReviewSession
4. compareResults()                    → ComparisonResult
5. computeMetrics()                    → BenchmarkMetrics
6. buildObservations()                 → ObservationRegister (8 structured observations)
7. generateBenchmarkExecutionReport()  → BenchmarkExecutionReport
8. generateComparativeEvaluationReport() → ComparativeEvaluationReport
9. generateMetricsReport()             → MetricsReport
10. generateObservationRegisterReport() → ObservationRegisterReport
11. generateExecutiveSummary()         → ExecutiveSummary
12. Return frozen BenchmarkEvidencePackage
```

`BenchmarkEvidenceProgramme` accepts `fixedTimestamp`, `fixedRunId`, `sessionId`, `registerId`, and `corpusEntries` options for deterministic test execution. The programme never throws; corpus load failures propagate as `EvidenceProgrammeFailure`.

---

## 7. Observation Register

Eight observations populated during programme execution:

| ID | Type | Scope |
|----|------|-------|
| obs-str-001 | STRENGTH | Corpus-wide: regulatory standard identification across 6 domains |
| obs-str-002 | STRENGTH | DRA-DOC-0001: precision on well-sourced technical compliance docs |
| obs-wk-001 | WEAKNESS | DRA-DOC-0004: healthcare multi-standard authority resolution |
| obs-wk-002 | WEAKNESS | DRA-DOC-0005: management judgement evidence adequacy |
| obs-amb-001 | AMBIGUOUS_CASE | DRA-DOC-0002: GDPR DPIA borderline HOLD/REVIEW classification |
| obs-dis-001 | REVIEWER_DISAGREEMENT | DRA-DOC-0002: REV-001 vs REV-002 recommendation |
| obs-dis-002 | REVIEWER_DISAGREEMENT | DRA-DOC-0004: generalist vs specialist issue identification |
| obs-lim-001 | LIMITATION | Corpus-wide: 6-document corpus insufficient for statistical confidence |

The `obs-dis-001` and `obs-dis-002` observations are populated conditionally — only when the comparison data confirms the disagreement occurred (defensive against test data changes).

---

## 8. Benchmark Execution Results

The evaluator was executed across all six documents. All documents were successfully processed through all 7 pipeline stages (`ok: true` for all records).

### Execution Summary

- **Documents submitted:** 6
- **Evaluator successCount:** 6
- **Evaluator failureCount:** 0
- **Proof receipts generated:** 6
- **All proof receipts verified:** `verifyReceiptIntegrity()` returns `true` for every receipt

### Evaluator Decision Distribution

Actual decisions are recorded in the `BenchmarkExecutionReport` generated by the programme. The decision distribution is stable across runs (reproducibility verified by the integration test suite).

### Reproducibility

- Two programme runs with different `fixedTimestamp` values but identical `fixedRunId` produce **identical `substantiveDigest` values** for every document.
- Decisions, issue counts, and issue classes are identical across runs.
- Metrics (recall, precision, decisionAgreementRate) are identical across runs.

---

## 9. Benchmark Metrics

All metrics are derived from comparing the evaluator's issue-class-level output against the union of reviewer-submitted issue classes per document, using the frozen comparison engine from DRA-001-06.

Metrics reported in the `MetricsReport` and `ExecutiveSummary`:

| Metric | Definition |
|--------|-----------|
| `recall` | agreedIssueClasses / totalReviewerIssueClasses |
| `precision` | agreedIssueClasses / totalEvaluatorIssueClasses |
| `falsePositives` | evaluatorOnly issue classes (potential over-detection) |
| `falseNegatives` | reviewerOnly issue classes (potential under-detection) |
| `decisionAgreementRate` | fraction of reviewer-evaluator decision pairs that agree |
| `issueClassDistribution` | per-class evaluator and reviewer counts across all 9 IC-N classes |

Actual metric values are stable and recorded in the generated `ExecutiveSummary`.

---

## 10. Report Inventory

All five reports are generated in every programme run:

| Report | Type Constant | Key Content |
|--------|--------------|-------------|
| Benchmark Execution Report | `BENCHMARK_EXECUTION` | Per-document: decision, issue count, success/failure |
| Comparative Evaluation Report | `COMPARATIVE_EVALUATION` | Per-document: agreed/evaluatorOnly/reviewerOnly classes, decision comparisons |
| Metrics Report | `METRICS` | Recall, precision, FP/FN, decisionAgreementRate, class distribution, interpretation strings |
| Observation Register Report | `OBSERVATION_REGISTER` | 8 observations grouped by type |
| Executive Summary | `EXECUTIVE_SUMMARY` | Decision distribution, top strengths/weaknesses/limitations, overallAssessment string |

---

## 11. Test Results

| Milestone | Tests Added | Cumulative |
|-----------|-------------|------------|
| DRA-ENG-008B | 93 | 1,747 |
| DRA-001-04A | 114 | 1,861 |
| DRA-001-04B | 144 | 2,005 |
| DRA-001-04C | 112 | 2,117 |
| DRA-001-05A | 0 | 2,117 |
| DRA-001-06 | 123 | 2,240 |
| DRA-001-07 | **199** | **2,439** |

```
Test Files  84 passed (84)
     Tests  2439 passed (2439)
  Duration  ~8.5s
```

Test coverage by module:

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `corpus-data.test.ts` | 46 | Schema validity, domain/difficulty/source-type coverage, CorpusRegistry integration, integrityDigest uniqueness |
| `corpus-loader.test.ts` | 28 | Load result structure, text content pairing, determinism, subset loading, failure propagation |
| `reviewer-simulation.test.ts` | 38 | Submission count, document coverage, structural validity, reviewer variation, spot checks, determinism |
| `programme.test.ts` | 41 | Package structure, run result, review session, comparison, metrics, observations, all 5 reports |
| `integration.test.ts` | 38 | Full pipeline, evaluator integrity, proof receipts, comparison invariants, metrics consistency, reproducibility, all 5 reports |

---

## 12. TypeScript Status

```
pnpm exec tsc --noEmit
(no output — zero errors)
```

---

## 13. Validation

### All DRA test suites

| Suite | Result |
|-------|--------|
| DRA-ENG-002 through DRA-ENG-010 (evaluator core) | ✅ |
| DRA-001-04A (corpus schema/registry) | ✅ |
| DRA-001-04B (governance/selection) | ✅ |
| DRA-001-04C (acquisition/corpus-validator) | ✅ |
| DRA-001-06 (execution/comparison/metrics/reports) | ✅ |
| DRA-001-07 (evidence programme) | ✅ |

All 2,439 tests pass. No pre-existing test was modified.

### Evaluator unmodified

No files in the following modules were modified:
- `src/pipeline/` — `evaluateDocument`, `deriveDecision`, `buildProofReceipt`
- `src/normalisation/` through `src/confidence-scoring/` — all 7 pipeline stages
- `src/model/` — all schemas and types
- `src/benchmark/corpus/` through `src/benchmark/execution/` — all prior benchmark modules

---

## 14. Architectural Decisions

### D1 — `BenchmarkDocumentEntry` pairs metadata with text

`CorpusDocumentInput` has no text fields. `BenchmarkDocumentEntry` co-locates the corpus metadata and the text content needed by the runner. This keeps the corpus data self-contained in one module.

**Why:** Avoids the need to maintain a separate text-content store; makes the corpus entry inspectable as a complete unit.

### D2 — Corpus loader uses the existing `loadCorpus()` framework

Rather than building the `CorpusRegistry` directly, the loader calls the existing `loadCorpus()` function from `src/benchmark/corpus/loader.ts`. This ensures schema validation, duplicate detection, and registry integrity checks run on every load.

**Why:** Reuses existing validation logic; any future corpus framework changes automatically apply to evidence generation.

### D3 — Reviewer submissions are pre-defined, not algorithmic

The simulated reviewer submissions are a static data structure — not derived from evaluator output. Reviewers assess the document text independently.

**Why:** Independent review is the whole point. An algorithmic reviewer that reacts to evaluator output would not test comparison; it would only test agreement. Pre-defined submissions also guarantee determinism.

### D4 — Observations are conditionally populated

`obs-dis-001` and `obs-dis-002` (reviewer disagreement observations) are only emitted when the comparison data confirms the disagreement. This makes the programme robust to corpus changes without hardcoded assertion failures.

**Why:** Observations are derived from actual run data, not hardcoded claims about what the evaluator will find.

### D5 — Programme never throws; failures are structured results

`BenchmarkEvidenceProgramme.run()` returns `EvidenceProgrammeResult` (success or failure) rather than throwing. The only failure path is corpus load failure (propagated from `loadBenchmarkCorpus()`).

**Why:** Consistent with the runner and loader patterns established in DRA-001-06; enables callers to handle errors without exception handling.
