# DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population

**Completion Report**

---

## 1. Files Created

### Source Modules

| File | Description |
|------|-------------|
| `src/benchmark/acquisition/provenance.ts` | Immutable provenance model (`ProvenanceRecord`, `buildProvenance`, `computeProvenanceDigest`, `verifyProvenanceIntegrity`, `isProvenanceComplete`) |
| `src/benchmark/acquisition/pipeline.ts` | `AcquisitionPipeline` — validates UTF-8, assigns sequential corpus IDs, builds content payloads and provenance |
| `src/benchmark/acquisition/candidate-registry.ts` | `CandidateRegistry` — append-only acquisition-layer audit ledger recording every admission decision |
| `src/benchmark/acquisition/corpus-validator.ts` | `validateCorpus` — six independent automated validation checks |
| `src/benchmark/acquisition/reports.ts` | Five typed report generators: Initial Corpus, Statistics, Provenance, Validation, Freeze |
| `src/benchmark/acquisition/index.ts` | Public module surface |

### Test Files (7 files, 112 new tests)

| File | Tests |
|------|-------|
| `__tests__/provenance.test.ts` | 19 |
| `__tests__/pipeline.test.ts` | 22 |
| `__tests__/candidate-registry.test.ts` | 17 |
| `__tests__/corpus-validator.test.ts` | 11 |
| `__tests__/duplicate-detection.test.ts` | 7 |
| `__tests__/reports.test.ts` | 20 |
| `__tests__/freeze-integration.test.ts` | 16 |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/benchmark/index.ts` | Added `export * from "./acquisition/index.js"` |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | Marked 04C complete |

---

## 3. Acquisition Architecture

The acquisition pipeline is a stateful class (`AcquisitionPipeline`) that processes raw `AcquisitionInput` records in a defined sequence:

```
AcquisitionInput
  → Field presence validation (filename, origin, content, date)
  → UTF-8 round-trip validation (Buffer.from/toString guard)
  → Sequential corpus ID assignment (DRA-DOC-NNNN)
  → ContentPayload construction (source + generated, with SHA-256)
  → ProvenanceRecord construction (uses generatedContent digest)
  → AcquiredDocument (frozen, satisfies CorpusCandidate interface)
```

`AcquiredDocument` extends `CorpusCandidate` — it can be passed directly to the governance admission workflow without conversion.

---

## 4. Provenance Implementation

Every acquired document carries an immutable `ProvenanceRecord` with:

| Field | Description |
|-------|-------------|
| `acquisitionSource` | `SYNTHETIC \| CURATED \| WEB_SCRAPE \| INTERNAL_DATASET \| PROVIDED` |
| `acquisitionDate` | ISO 8601 acquisition datetime |
| `documentOrigin` | URL, file path, or description |
| `originalFilename` | Original filename at the source |
| `licenceStatus` | `CC0 \| CC_BY \| CC_BY_SA \| PROPRIETARY \| INTERNAL \| UNKNOWN` |
| `licenceDetails?` | Optional SPDX expression, URL, or free-text note |
| `contentDigest` | SHA-256 of the generated document content |
| `provenanceDigest` | SHA-256 of all substantive provenance fields |

`acquisitionDate` is included in the substantive digest (it is part of the provenance claim identity, not operational metadata).  `provenanceDigest` is excluded from its own hash (circularity prevention).

---

## 5. Candidate Registry

`CandidateRegistry` is an append-only acquisition-layer audit ledger, distinct from the governance `AdmissionRegistry`:

- Records every decision (ADMITTED and REJECTED) with typed `ExclusionReason[]`
- Each entry carries a deterministic `entryDigest` (excludes `admissionTimestamp`)
- `list()`, `admitted()`, `rejected()`, `findById()`, `admittedCount()`, `rejectedCount()`, `totalCount()` accessors
- Snapshot-safe: `list()` returns a copy; mutations to the snapshot do not affect the registry

---

## 6. Allocation Validation

`validateCorpus` check 6 runs two sub-validations independently:

**6a — Protocol consistency** (`validateAllocationTotals`): verifies that all three dimension targets (domain, document type, difficulty) each sum to `targetCorpusSize`.

**6b — Actual distribution**: counts admitted documents by domain, documentType, and difficulty; compares each cell to the protocol target; reports per-cell mismatches when `target > 0 && actual ≠ target`.

Both sub-checks contribute to the allocation check's `failures[]` array, which is reported at the same level as the other five checks.

---

## 7. Duplicate Screening

**Exact-duplicate** detection: `AdmissionRegistry` maintains a `Set<string>` of admitted `contentDigest` values. Any candidate whose generated content digest appears in the set is immediately rejected with `DUPLICATE_CONTENT`.

**Near-duplicate** detection: `AdmissionRegistry` maintains a list of admitted content strings. For each new candidate, `assessDuplicate()` (3-gram Jaccard) is called against all prior admitted strings. Any pair with Jaccard ≥ 0.80 is rejected with `NEAR_DUPLICATE_CONTENT`.

**Post-hoc validation**: `validateCorpus` check 4 (`nearDuplicates`) performs an O(n²) all-pairs near-duplicate scan over the admitted corpus. This catches cases where individual admission-time screening missed a pair (e.g. when the corpus was assembled from multiple registries).

---

## 8. Corpus Freeze Implementation

The freeze workflow composes the 04B governance `freezeCorpus` function with the acquisition layer's populated `CorpusRegistry`:

```
CorpusRegistry (admitted docs added via registry.add(acquiredDoc))
  + BenchmarkSelectionProtocol (APPROVED)
  + AllocationSnapshot (from AllocationTracker after all admissions)
  + CorpusVersion (DRA-CORPUS-1.0.0)
  → freezeCorpus()
  → { frozenCorpus: FrozenCorpus, freezeRecord: FreezeRecord }
  → verifyCorpusFreeze(freezeRecord) → true
```

`FrozenCorpus.add()`, `.remove()`, `.modify()` throw `CorpusAlreadyFrozenError` at runtime.  `verifyCorpusFreeze` recomputes the `freezeDigest` from substantive fields (excluding `freezeTimestamp`) and confirms it matches the stored digest.

---

## 9. Reports Generated

The five reports are typed plain-object snapshots.  All generators accept an optional `timestamp` override for deterministic test assertions.

| Report | Key fields |
|--------|-----------|
| `InitialCorpusReport` | `admittedCount`, `rejectedCount`, `totalProcessed`, `protocolId`, `protocolVersion`, `corpusVersion` |
| `CorpusStatisticsReport` | `byDomain`, `byDocumentType`, `byDifficulty`, `bySourceType` (each `DimensionStatistic[]` with `count`, `percentage`, `target?`) |
| `ProvenanceReport` | `entries[]` with `integrityVerified` per document; `allComplete` summary flag |
| `ValidationReport` | `overallResult: "PASS" \| "FAIL"`, `passedChecks`, `failedChecks`, per-check `failureCount` |
| `FreezeReport` | `documentCount`, `manifestDigest`, `freezeDigest`, `protocolDigest`, `freezeVerified`, `canonicalDocumentIds[]` |

---

## 10. Test Results

| Milestone | Tests Added | Running Total |
|-----------|-------------|---------------|
| DRA-ENG-008B | 93 | 1,747 |
| DRA-001-04A | 114 | 1,861 |
| DRA-001-04B | 144 | 2,005 |
| DRA-001-04C | 112 | **2,117** |

```
Test Files  72 passed (72)
     Tests  2117 passed (2117)
  Duration  ~7s
```

---

## 11. TypeScript Status

```
pnpm exec tsc --noEmit
(no output — zero errors)
```

---

## 12. Production Build Status

Production build: **passed**.

---

## 13. Evaluator Semantics

No evaluator semantics or decision logic were modified.

The frozen 7-stage pipeline (`src/pipeline/`), all stage implementations (`src/stages/`), the issue taxonomy, the decision engine, and all proof-receipt logic remain entirely unchanged.  The acquisition module imports only from `src/benchmark/` and `src/pipeline/canonical-serialise.ts` (for digest computation).

---

## Design Decisions

### D1 — AcquiredDocument extends CorpusCandidate

`AcquiredDocument` satisfies the `CorpusCandidate` interface (from 04B governance) by composition, not inheritance.  This means an `AcquiredDocument` can be passed directly to `AdmissionRegistry.admit()` and `CorpusRegistry.add()` without conversion, eliminating an entire mapping layer.

**Why:** Reduces error-prone data copying; any governance check operates on real pipeline output.

### D2 — Provenance digest includes acquisitionDate

Unlike operational timestamps in other governance records, `acquisitionDate` is substantive provenance data — two provenance claims for the same document acquired at different times are different claims.

**Why:** Enables audit of acquisition history; changing the claimed acquisition date is a substantive alteration.

### D3 — CandidateRegistry is separate from AdmissionRegistry

`AdmissionRegistry` (04B) records detailed governance workflow evidence (near-dup assessments, allocation snapshots, protocol version at decision time).  `CandidateRegistry` (04C) is the acquisition-layer ledger: lighter, oriented toward operators who need to see what entered or was rejected from the corpus and why, without needing governance internals.

**Why:** Separation of concerns; the governance layer should not depend on acquisition concepts.

### D4 — validateCorpus runs all checks independently

All six checks run to completion regardless of whether earlier checks fail.  The complete failure list is always available.

**Why:** Debugging a corpus with multiple problems requires seeing all problems simultaneously; early exit hides information.

### D5 — Two-tier duplicate prevention (admission + post-hoc validation)

Near-duplicate checks at admission time cover the incremental case (one new document arriving against a known admitted set).  The `validateCorpus` all-pairs scan covers the batch case (multiple registries merged, or a corpus loaded from storage without admission history).

**Why:** Defence in depth; the acquisition layer cannot assume all documents passed through the same `AdmissionRegistry` instance.
