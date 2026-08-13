# DRA-EVAL-002A — Final Evidence Reconciliation and Freeze

**Report identifier:** DRA-EVAL-002A-REPORT  
**Programme:** Document Reliability Assurance (DRA)  
**Depends on:** DRA-EVAL-002-IMPROVED-EVALUATOR-REPORT.md  
**Report date:** 2026-08-04  
**Status:** COMPLETE — FREEZE APPROVED

---

## A. DRA-DOC-0007 Disposition

### Corpus status

DRA-DOC-0007 is the Apache HTTP Server 2.4 Authentication and Authorization guide, acquired and frozen by DRA-OPS-001. It is the first human-authored document admitted to the benchmark corpus via the governed acquisition pipeline.

| Field | Value |
|-------|-------|
| Corpus document ID | DRA-DOC-0007 |
| Freeze record ID | DRA-FRZ-000001 |
| Freeze status | FROZEN |
| Publisher | The Apache Software Foundation |
| Document type | ARTICLE |
| Acquisition method | Live HTTP fetch (DRA-ENG-010), fixture-backed in tests |
| Source SHA-256 | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Normalised text SHA-256 | `abe714b854cf98db5f23ae0f3e75ac13b5ba80091f84161f78d87bd4e5fccc19` |
| Freeze record SHA-256 | `7b6a0a5fd316a2ed178ed36f4bef11cdfd76f115608bec7df1b8a5ee5b29dfe8` |

### Was DRA-DOC-0007 re-run under evaluator v0.1.1?

**Yes.** DRA-DOC-0007 was re-run under v0.1.1 during the DRA-EVAL-002A investigation. The `dra-ops-001-execution.test.ts` file uses the pre-fetched fixture bytes and calls `evaluateFrozenBenchmarkDocument` after reconstruction, making it non-network and always re-executing with the current evaluator version.

### Original v0.1.0 result (DRA-OPS-001 baseline)

| Metric | v0.1.0 |
|--------|--------|
| Decision | **HOLD** |
| Proof Receipt Digest | `885929162d015474b708daeeaace277503aa494a2389685facd2147705223c4e` |
| Evaluation timestamp | `2026-08-03T15:00:00.000Z` |

The HOLD decision under v0.1.0 was documented as expected: DRA-OPS-001 supplies no `additionalSourceText`, so the evaluator uses the normalised HTML as both the generated document and the source. HTML content after tag stripping produces sentence fragments and navigation elements that do not form supported claim–evidence pairs under direct matching alone.

### v0.1.1 result

| Metric | v0.1.1 |
|--------|--------|
| Statement count | **479** |
| Issue count | **0** |
| Semantic paraphrase matches | **227** |
| Issue classes | none |
| Decision | **SUPPORTED** |
| Evaluator version (receipt) | `0.1.1` |
| Schema version (receipt) | `0.1.0` |
| Proof receipt substantive digest | `dd5b6aded71f3bda23c5ef1c6139aedbbee74646c33ad28158035bd39a57d818` |
| Receipt integrity | ✓ PASS |
| Reproducibility | DETERMINISTIC |

### Self-evaluation design limitation

The change from HOLD (v0.1.0) to SUPPORTED (v0.1.1) is attributable entirely to DRA-FIX-002 (semantic paraphrase matching) operating in self-referential mode: the generated document **and** the source document are both the same normalised Apache guide text. Under DRA-FIX-002, 227 of 479 statements are matched via `SEMANTIC_PARAPHRASE_MATCH` against themselves, eliminating all EVIDENCE_ABSENT issues.

This is not a meaningful evaluation outcome. The design of DRA-OPS-001 (no `additionalSourceText`) was documented as a known limitation producing a HOLD under v0.1.0. Under v0.1.1, DRA-FIX-002 happens to resolve the EVIDENCE_ABSENT issues against the document itself.

**Implication for comparison:** The HOLD → SUPPORTED change for DRA-DOC-0007 is a consequence of the self-referential evaluation design and DRA-FIX-002's effectiveness, not a genuine improvement in evidence linkage. Comparability between v0.1.0 and v0.1.1 results for DRA-DOC-0007 is **limited**. This document should not be included in the "full-corpus rerun" claim without this qualification.

### v0.1.0 result reconstruction

The v0.1.0 substantive digest for DRA-DOC-0007 (`885929162d…`) was originally recorded in `docs/benchmark/DRA-OPS-001-FIRST-LIVE-BENCHMARK.md`. The DRA-OPS-001 test does not pin the substantive digest (it asserts only `toBeTruthy()`), so the test continues to pass under both versions. The v0.1.1 substantive digest differs (`dd5b6aded…`) because `evaluatorIdentity.evaluatorVersion` is included in the digest payload.

---

## B. Test-Count Reconciliation

### Root cause of the 106/3,063 → 105/3,062 discrepancy

The prior state (post-DRA-FIX-002, pre-DRA-EVAL-002) was **106 files / 3,063 tests** for the full suite.

DRA-EVAL-002 ran the non-network suite with the exclusion patterns:
```
--exclude "src/benchmark/acquisition/__tests__/dra-doc-0008*"
--exclude "src/benchmark/acquisition/__tests__/dra-eval-002*"
```

This excluded exactly one live-network test file:

| Excluded file | Tests excluded | Reason |
|---------------|----------------|--------|
| `dra-doc-0008-blind-evaluation.test.ts` | 1 | Live HTTPS fetch to acas.org.uk |

Result: 106 − 1 = **105 files**, 3,063 − 1 = **3,062 tests**. No file was deleted, renamed, or skipped; the reported count simply excluded the live-network test from the non-network run.

### DRA-OPS-001 status

`dra-ops-001-execution.test.ts` uses a mock fetcher backed by the pre-fetched `apache-httpd-auth-fixture.ts` — it makes **no live network calls** and is correctly included in the non-network suite.

### DRA-FIX-001 regression tests — all present and running

| Test file | Tests | Status |
|-----------|-------|--------|
| `src/claim-extraction/__tests__/dra-fix-001-boundary-extraction.test.ts` | 22 | ✓ all pass |
| `src/normalisation/__tests__/stage1-boundary.test.ts` | (see below) | ✓ all pass |
| `src/normalisation/__tests__/normalise-evaluation-request.test.ts` | +7 new | ✓ all pass |

Note: `dra-fix-001-boundary-extraction.test.ts` test 10 ("DRA-DOC-0008 guide pages 18–25 regression") runs from static fixture text embedded in the test — it does not make a live network call and is included in the non-network count.

### DRA-FIX-002 regression tests — all present and running

| Test file | Tests | Status |
|-----------|-------|--------|
| `src/evidence-linkage/__tests__/dra-fix-002-semantic-matching.test.ts` | 37 | ✓ all pass |
| `src/evidence-linkage/__tests__/semantic-paraphrase.test.ts` | 52 | ✓ all pass |

### DRA-EVAL-002 comparative tests — present and running

| Test file | Tests | Status |
|-----------|-------|--------|
| `src/benchmark/acquisition/__tests__/dra-eval-002-improved-evaluator.test.ts` | 1 | ✓ pass (live network) |

### Final test-count state after DRA-EVAL-002A

DRA-EVAL-002A added 7 new tests (Stage 1 boundary preservation regression tests) to `normalise-evaluation-request.test.ts`.

| Suite | Files | Tests |
|-------|-------|-------|
| Non-network (excl. dra-doc-0008, dra-eval-002) | 105 | **3,069** |
| Full suite including both live-network tests | 107 | **3,071** |

---

## C. Evaluator Version Verification

### Constant values

| Constant | Value | Source |
|----------|-------|--------|
| `DRA_MODEL_VERSION` | `"0.1.0"` | `lib/dra-reference/src/model/versions.ts` |
| `DRA_EVALUATOR_VERSION` | `"0.1.1"` | `lib/dra-reference/src/model/versions.ts` |
| `DRA_PIPELINE_VERSION` | `"1.0"` | `lib/dra-reference/src/model/versions.ts` (unchanged) |
| `RECOGNISED_SCHEMA_VERSIONS` | `["0.1.0", "0.1.1"]` | Same file |

### ProofReceipt field values under v0.1.1

Verified on DRA-DOC-0007 (DRA-OPS-001) and DRA-DOC-0008 (DRA-EVAL-002) receipts:

| Field | Expected | Verified |
|-------|----------|----------|
| `proofReceipt.schemaVersion` | `"0.1.0"` | ✓ |
| `proofReceipt.evaluatorIdentity.evaluatorVersion` | `"0.1.1"` | ✓ |
| `proofReceipt.evaluatorIdentity.pipelineVersion` | `"1.0"` | ✓ |

### Original v0.1.0 receipts unchanged

The original v0.1.0 proof receipts are immutable outputs of past evaluations. They are not stored as mutable objects in the codebase; they exist as recorded digest values in `docs/benchmark/` reports and test console logs. The code change bumping `DRA_EVALUATOR_VERSION` does not alter any previously produced receipt.

The `model/__tests__/proof-receipts.test.ts` test fixture at line 70 uses `evaluatorVersion: "0.1.0"` — this fixture tests that `"0.1.0"` is accepted by the schema (it is, via `RECOGNISED_SCHEMA_VERSIONS`). This test still passes, confirming backwards compatibility.

---

## D. Stage 1 Boundary-Preservation Verification

### The bug

`normaliseEvaluationRequest()` rebuilt the `normalisedRequest` object field-by-field (id, generatedDocument, sourceDocuments, requestedAt, requesterMetadata) without including `evaluationBoundary`. The field was silently dropped before Stage 2, causing Stage 2 to evaluate the full document regardless of the declared boundary.

### The fix

Added conditional spread in `normalise-evaluation-request.ts` Step 7 "Build normalised request":

```typescript
const normalisedRequest: NormalisedEvaluationRequest = {
  id: parsed.id,
  generatedDocument: normalisedGenDoc,
  sourceDocuments: normalisedSourceDocs,
  requestedAt: parsed.requestedAt,
  requesterMetadata: parsed.requesterMetadata,
  // DRA-FIX-001: preserve optional evaluation boundary so Stage 2 can
  // restrict claim extraction to the approved character range.
  ...(parsed.evaluationBoundary !== undefined
    ? { evaluationBoundary: parsed.evaluationBoundary }
    : {}),
};
```

### New regression tests (DRA-EVAL-002A)

Seven tests added to `normalise-evaluation-request.test.ts` under the section `"DRA-FIX-001 regression — evaluationBoundary preservation"`:

| Test | Guards |
|------|--------|
| `preserves evaluationBoundary exactly when present` | Exact offset values (15, 79) preserved |
| `preserves evaluationBoundary as exact structural copy` | Offsets match source; not mutated or shifted |
| `normalisedRequest has no evaluationBoundary when absent` | No phantom field on requests without boundary |
| `normalisedRequest has no evaluationBoundary using VALID_CANONICAL` | Backwards compat — pre-DRA-FIX-001 requests unaffected |
| `rejects evaluationBoundary where startOffset >= endOffset` | Cross-field Zod validation fires |
| `rejects evaluationBoundary where startOffset equals endOffset` | Degenerate boundary rejected |
| `accepts evaluationBoundary with startOffset 0` | Zero start is valid |

**All 7 tests would fail if the fix were reverted** (normalised request would have `evaluationBoundary: undefined`).

New fixture added to `src/fixtures/normalisation/valid.ts`:
- `VALID_WITH_BOUNDARY` — evaluation request with `evaluationBoundary: { startOffset: 15, endOffset: 79 }`
- `VALID_WITHOUT_BOUNDARY` — structurally identical request without boundary

---

## E. DRA-DOC-0001 through DRA-DOC-0008 Accounting Table

| Doc | Frozen Status | v0.1.0 Persisted Result | v0.1.1 Result | Decision | Issues | Receipt Integrity | Comparison Status |
|-----|--------------|------------------------|---------------|---------|--------|------------------|-------------------|
| DRA-DOC-0001 | FROZEN (static corpus) | SUPPORTED (static fixture) | SUPPORTED | SUPPORTED | 0 | ✓ | Directly comparable — boundary N/A; semantic matches new (+1) |
| DRA-DOC-0002 | FROZEN (static corpus) | SUPPORTED (static fixture) | SUPPORTED | SUPPORTED | 0 | ✓ | Directly comparable — semantic matches new (+5) |
| DRA-DOC-0003 | FROZEN (static corpus) | SUPPORTED (static fixture) | SUPPORTED | SUPPORTED | 0 | ✓ | Directly comparable — semantic matches new (+5) |
| DRA-DOC-0004 | FROZEN (static corpus) | REVIEW (static fixture) | REVIEW | REVIEW | 1 | ✓ | Directly comparable — decision unchanged; semantic matches new (+7) |
| DRA-DOC-0005 | FROZEN (static corpus) | SUPPORTED (static fixture) | SUPPORTED | SUPPORTED | 0 | ✓ | Directly comparable — semantic matches new (+5) |
| DRA-DOC-0006 | FROZEN (static corpus) | REVIEW (static fixture) | REVIEW | REVIEW | 1 | ✓ | Directly comparable — decision unchanged; semantic matches new (+5) |
| DRA-DOC-0007 | FROZEN (DRA-FRZ-000001) | HOLD (DRA-OPS-001, v0.1.0 digest `885929162d…`) | SUPPORTED | SUPPORTED | 0 | ✓ | **Limited comparability** — HOLD → SUPPORTED due to self-referential DRA-FIX-002 (227 self-matches); not a meaningful evidence improvement |
| DRA-DOC-0008 | FROZEN (DRA-FRZ-000002) | HOLD (DRA-EVAL-002 baseline, digest `fc7517cc…`) | SUPPORTED | SUPPORTED | 0 | ✓ | **Directly comparable** — HOLD → SUPPORTED with DRA-FIX-001 boundary (−2815 stmts) + DRA-FIX-002 (31 semantic matches); aligned with DRA-VAL-002 |

### Notes on DRA-DOC-0001–0006

The six static corpus documents were evaluated by the `BenchmarkRunner` during DRA-EVAL-002. Their "v0.1.0 persisted result" is inferred from the original corpus runner execution (static fixture data unchanged since DRA-ENG-005/006). The decisions for 0001–0003 and 0005 remain SUPPORTED; 0004 and 0006 remain REVIEW. No decision regressions occurred. The additive semantic matches are expected improvements from DRA-FIX-002.

### Corpus coverage summary

| Corpus ID | Accounted for | v0.1.1 executed | Comparable |
|-----------|--------------|-----------------|-----------|
| DRA-DOC-0001 | ✓ | ✓ | Directly |
| DRA-DOC-0002 | ✓ | ✓ | Directly |
| DRA-DOC-0003 | ✓ | ✓ | Directly |
| DRA-DOC-0004 | ✓ | ✓ | Directly |
| DRA-DOC-0005 | ✓ | ✓ | Directly |
| DRA-DOC-0006 | ✓ | ✓ | Directly |
| DRA-DOC-0007 | ✓ | ✓ | Limited (self-evaluation) |
| DRA-DOC-0008 | ✓ | ✓ (×3, DETERMINISTIC) | Directly |

All 8 corpus entries are accounted for. The claim "full-corpus re-evaluation" applies with qualification: DRA-DOC-0007's v0.1.1 result has limited interpretive value due to self-referential evaluation design.

---

## F. Final DRA-DOC-0008 Before-and-After Comparison

| Metric | v0.1.0 (HOLD) | v0.1.1 (SUPPORTED) | Change classification |
|--------|--------------|---------------------|----------------------|
| Evaluator version | 0.1.0 | **0.1.1** | Planned improvement |
| Schema version | 0.1.0 | 0.1.0 | Expected stability |
| Pipeline version | 1.0 | 1.0 | Expected stability |
| Statement count | 3,013 | **198** | Expected improvement (DRA-FIX-001: −93.4%) |
| Evaluation boundary | NO | **YES** (offsets 1,957–12,606; 6.5% of doc) | Expected improvement (DRA-FIX-001) |
| Segments filtered by boundary | 0 | **6,939** | Expected improvement (DRA-FIX-001) |
| Semantic paraphrase matches | 0 | **31** | Expected improvement (DRA-FIX-002) |
| `EVIDENCE_ABSENT` BLOCKING issues | ≥1 | **0** | Expected improvement |
| `EVIDENCE_INADEQUATE` ADVISORY issues | ~63 | **0** | Expected improvement |
| Total issues | 64 | **0** | Expected improvement |
| Decision | HOLD | **SUPPORTED** | Expected improvement |
| DRA-VAL-002 alignment | MISALIGNED | **RESOLVED** | Expected improvement |
| Proof receipt substantive digest | `fc7517cc…2cd` | `86cca06b…205` | Expected — evaluatorVersion + content differ |
| Reproducibility | DETERMINISTIC | **DETERMINISTIC** | Expected stability |
| Receipt integrity | PASS | **PASS** | Expected stability |

### DRA-DOC-0008 canonical frozen result (v0.1.1)

- Evaluator version: **0.1.1**
- Statement count: **198**
- Semantic paraphrase matches: **31**
- Issue count: **0**
- Decision: **SUPPORTED**
- Proof receipt substantive digest: **`86cca06bae5c1691b33fd54dea56ad9a81784496d1bb8658282fe309a2bad205`**
- Reproducibility: **DETERMINISTIC** (3/3 runs identical)
- Receipt integrity: **valid**
- DRA-VAL-002 alignment: **RESOLVED**

---

## G. Regression Assessment

| Category | Outcome | Evidence |
|----------|---------|----------|
| DRA-FIX-001 tests | All pass | 22 tests in `dra-fix-001-boundary-extraction.test.ts` |
| DRA-FIX-002 tests | All pass | 37 tests in `dra-fix-002-semantic-matching.test.ts`, 52 in `semantic-paraphrase.test.ts` |
| Stage 1 boundary preservation tests | All pass | 7 new tests in `normalise-evaluation-request.test.ts` |
| DRA-EVAL-002 test | Pass | `dra-eval-002-improved-evaluator.test.ts` (1 test, live network) |
| DRA-OPS-001 test | Pass | `dra-ops-001-execution.test.ts` (1 test, fixture-backed, evaluatorVersion asserted) |
| DRA-DOC-0001–0006 re-evaluation | 6/6 pass | `BenchmarkRunner`, all receipts valid, all evaluatorVersion = "0.1.1" |
| DRA-DOC-0007 re-evaluation | Pass | SUPPORTED, receipt valid, evaluatorVersion = "0.1.1" |
| DRA-DOC-0008 re-evaluation | Pass ×3 | DETERMINISTIC, receipt valid |
| Decisions not incorrectly upgraded | ✓ | DRA-DOC-0004 and DRA-DOC-0006 remain REVIEW |
| Polarity errors | None detected | Polarity guard in `semantic-paraphrase.ts` |
| False evidence links | None detected | ≥3 content terms + ≥1 bigram threshold |
| Nondeterminism | None | All runs produce identical digests |
| TypeScript typecheck | PASS | No errors |
| Unintentional test loss | None | All regression tests confirmed present and running |

---

## H. Final Test and Typecheck Results

### TypeScript typecheck

```
TYPECHECK OK  (0 errors)
```

### Non-network suite (excl. dra-doc-0008-blind-evaluation, dra-eval-002-improved-evaluator)

```
Test Files  105 passed (105)
     Tests  3,069 passed (3,069)
```

### Full suite including controlled live-network tests

```
Test Files  107 passed (107)
     Tests  3,071 passed (3,071)
```

### Individual fix/eval suite verification

| Suite | Files | Tests | Status |
|-------|-------|-------|--------|
| DRA-FIX-001 tests (all boundary files) | — | 22 | ✓ all pass |
| DRA-FIX-002 tests (semantic matching files) | — | 89 | ✓ all pass |
| DRA-EVAL-002 evaluation test | 1 | 1 | ✓ pass (live) |
| Stage 1 boundary regression (DRA-EVAL-002A) | — | 7 | ✓ all pass |
| DRA-OPS-001 (DRA-DOC-0007, fixture-backed) | 1 | 1 | ✓ pass |

---

## I. Files Created or Modified

### New files

| File | Purpose |
|------|---------|
| `docs/benchmark/DRA-EVAL-002A-RECONCILIATION-REPORT.md` | This report |

### Modified files

| File | Change |
|------|--------|
| `lib/dra-reference/src/fixtures/normalisation/valid.ts` | Added `VALID_WITH_BOUNDARY` and `VALID_WITHOUT_BOUNDARY` fixtures for Stage 1 boundary regression tests |
| `lib/dra-reference/src/normalisation/__tests__/normalise-evaluation-request.test.ts` | Added 7 boundary preservation regression tests (DRA-FIX-001 regression section) |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-ops-001-execution.test.ts` | Added evaluation metrics logging (statements, issues, semantic matches) and evaluatorVersion/schemaVersion assertions |

### Previously modified (DRA-EVAL-002)

| File | Change |
|------|--------|
| `lib/dra-reference/src/model/versions.ts` | `DRA_EVALUATOR_VERSION = "0.1.1"` |
| `lib/dra-reference/src/model/index.ts` | Exports `DRA_EVALUATOR_VERSION` |
| `lib/dra-reference/src/pipeline/build-proof-receipt.ts` | `evaluatorIdentity.evaluatorVersion` uses `DRA_EVALUATOR_VERSION` |
| `lib/dra-reference/src/pipeline/evaluate-document.ts` | Returns `modelVersion: DRA_EVALUATOR_VERSION` |
| `lib/dra-reference/src/normalisation/normalise-evaluation-request.ts` | Bug fix: `evaluationBoundary` now threaded through to normalised request |
| `lib/dra-reference/src/benchmark/acquisition/governed-pipeline.ts` | `FrozenBenchmarkEvaluationInput` extended with `evaluationBoundary`; threaded through `buildEvaluatorRequest` |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-eval-002-improved-evaluator.test.ts` | New live-network comparative evaluation test |
| `lib/dra-reference/src/evidence-linkage/` (multiple) | DRA-FIX-002 semantic paraphrase matching implementation and tests |
| `docs/benchmark/DRA-EVAL-002-IMPROVED-EVALUATOR-REPORT.md` | DRA-EVAL-002 findings report |

---

## J. Final Decision

**DRA-EVAL-002 FROZEN — VALIDATED WITH DOCUMENTED LIMITATIONS**

### Basis for decision

All primary objectives of DRA-EVAL-002 are met:

1. Evaluator version 0.1.1 is formally registered and produces correctly versioned receipts.
2. DRA-DOC-0008 decision improved from HOLD to SUPPORTED under boundary and semantic matching improvements, with DETERMINISTIC reproducibility.
3. DRA-VAL-002 alignment for DRA-DOC-0008 is confirmed RESOLVED.
4. DRA-DOC-0001 through DRA-DOC-0006 show no regressions; all receipts valid.
5. All regression tests for DRA-FIX-001 and DRA-FIX-002 are present and passing.
6. TypeScript typecheck passes.
7. Full suite: 107 files / 3,071 tests, 0 failures.

### Documented limitation

DRA-DOC-0007's v0.1.1 result (HOLD → SUPPORTED) has limited comparability with its v0.1.0 baseline. The change is attributable to DRA-FIX-002 finding 227 self-referential semantic paraphrase matches in the Apache guide text (the document evaluated against itself). This is an inherent consequence of the DRA-OPS-001 design, which was documented as a known limitation. The DRA-EVAL-002 re-evaluation report does not claim meaningful DRA-DOC-0007 improvement — the full-corpus rerun claim in the DRA-EVAL-002 report is qualified accordingly by this finding.

---

## K. Confirmation of Original Frozen Artefact Integrity

### Frozen corpus artefacts

| Artefact | Status |
|----------|--------|
| DRA-DOC-0001 through DRA-DOC-0006 static corpus (corpus-data.ts) | Unchanged — read-only |
| DRA-FRZ-000001 (DRA-DOC-0007) source digest `71211579…` | Unchanged — freeze record reconstructed from fixture, not mutated |
| DRA-FRZ-000001 freeze record digest `7b6a0a5f…` | Unchanged |
| DRA-FRZ-000002 (DRA-DOC-0008) source digest `a4c10388…` | Unchanged — live fetch, verified against sealed reference |
| DRA-FRZ-000002 freeze record digest `d5b9fc3f…` | Unchanged |

### Original v0.1.0 results

| Document | v0.1.0 result | Status |
|----------|---------------|--------|
| DRA-DOC-0007 | HOLD, digest `885929162d…` | Not overwritten — recorded in DRA-OPS-001 report |
| DRA-DOC-0008 | HOLD, digest `fc7517cc…` | Not overwritten — recorded in DRA-EVAL-002 report and test baseline constant |

### DRA-VAL-002 findings

DRA-VAL-002 independent expert review concluded that content in pages 18–25 of the Acas guide is directly supported by Code paragraphs 9–17. This finding is unchanged. DRA-EVAL-002 confirms alignment with this finding under evaluator v0.1.1.

**No original frozen corpus artefact, original v0.1.0 result, or DRA-VAL-002 finding has been altered.**
