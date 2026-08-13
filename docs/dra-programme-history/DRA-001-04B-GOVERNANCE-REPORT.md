# DRA-001-04B — Benchmark Document Selection and Corpus Governance Protocol

**Completion Report**

---

## 1. Milestone Overview

DRA-001-04B extends the corpus infrastructure established in DRA-001-04A with a
complete governance framework for document selection, corpus freeze, and post-freeze
amendment.  The evaluator pipeline remains frozen and untouched.

---

## 2. Deliverables

### 2.1 New Source Modules

| Module | Path | Description |
|--------|------|-------------|
| Corpus Version | `src/benchmark/governance/version.ts` | `CorpusVersionSchema` (DRA-CORPUS-X.Y.Z), `INITIAL_CORPUS_VERSION`, `parseCorpusVersion`, `incrementMajor/Minor/Patch`, `compareCorpusVersions` |
| Exclusion Registry | `src/benchmark/governance/exclusions.ts` | 16 typed `ExclusionReason` codes, `ExclusionRecord`, `buildExclusionRecord`, `computeExclusionDigest` |
| Near-Duplicate | `src/benchmark/governance/near-duplicate.ts` | 3-gram Jaccard similarity; `NEAR_DUPLICATE=0.80`, `MANUAL_REVIEW=0.60` thresholds; `DuplicateStatus`, `DuplicateAssessment`, `assessDuplicate` |
| Protocol Schema | `src/benchmark/governance/schema.ts` | `BenchmarkSelectionProtocol`, `ProtocolStatus` (DRAFT→APPROVED→FROZEN→SUPERSEDED), `transitionProtocol`, `computeProtocolDigest`, `createProtocol`, `buildMinimalProtocol` |
| Eligibility | `src/benchmark/governance/eligibility.ts` | `ContentPayload` (inline UTF-8 + SHA-256), `buildContentPayload`, `verifyContentIntegrity`, `CorpusCandidate`, `checkEligibility` (11 ordered checks) |
| Allocation | `src/benchmark/governance/allocation.ts` | `AllocationTracker`, `validateAllocationTotals` (three independent dimensions), `AllocationCell`, `AllocationSnapshot` |
| Admissions | `src/benchmark/governance/admissions.ts` | `AdmissionRegistry.admit()` (5-step workflow), `AdmissionRecord`, `computeAdmissionDigest` |
| Freeze | `src/benchmark/governance/freeze.ts` | `FreezeRecord`, `FrozenCorpus`, `freezeCorpus`, `verifyCorpusFreeze`, `CorpusAlreadyFrozenError`, `computeFreezeDigest` |
| Amendment | `src/benchmark/governance/amendment.ts` | `AmendmentRecord`, `ChangedEntry`, `createAmendmentRecord`, `AmendmentError`, `computeAmendmentDigest` |
| Public Index | `src/benchmark/governance/index.ts` | Single-surface re-export for all governance symbols |

### 2.2 Updated Modules

| Module | Change |
|--------|--------|
| `src/benchmark/corpus/schema.ts` | `CorpusManifestSchema.corpusVersion` now uses `CorpusVersionSchema` (DRA-CORPUS-X.Y.Z format enforced at runtime) |
| `src/benchmark/corpus/registry.ts` | `exportManifest()` default version changed from `"1.0"` to `INITIAL_CORPUS_VERSION` (`"DRA-CORPUS-1.0.0"`) |
| `src/benchmark/index.ts` | Adds `export * from "./governance/index.js"` |

### 2.3 Updated Tests (04A compatibility)

All existing 04A test files updated: `"1.0"` → `"DRA-CORPUS-1.0.0"`, `"2.0"` → `"DRA-CORPUS-2.0.0"` across `integrity.test.ts`, `manifest.test.ts`, and `validation.test.ts`.

---

## 3. Test Coverage

### 3.1 New Test Files (9 files, 144 tests)

| File | Tests | Coverage |
|------|-------|---------|
| `__tests__/version.test.ts` | 18 | CorpusVersionSchema validation, parse, increment, compare |
| `__tests__/protocol.test.ts` | 17 | Protocol creation, all lifecycle transitions, canAdmitDocuments |
| `__tests__/content-boundary.test.ts` | 12 | ContentPayload construction, verifyContentIntegrity |
| `__tests__/eligibility.test.ts` | 11 | All 11 eligibility checks (valid path + 10 failure modes) |
| `__tests__/allocation.test.ts` | 12 | validateAllocationTotals (3 dimensions), AllocationTracker capacity and snapshot |
| `__tests__/near-duplicate.test.ts` | 22 | normaliseText, computeNgramSet, jaccardSimilarity, assessDuplicate (all 4 statuses) |
| `__tests__/admissions.test.ts` | 18 | Full admit workflow: ADMITTED, REJECTED (ineligible, exact-dup, allocation), reproducibility |
| `__tests__/freeze.test.ts` | 16 | freezeCorpus, verifyCorpusFreeze, FrozenCorpus mutation enforcement |
| `__tests__/amendment.test.ts` | 18 | createAmendmentRecord, all 4 error codes, digest stability |

### 3.2 Final Test Counts

| Milestone | Tests Added | Running Total |
|-----------|-------------|---------------|
| DRA-ENG-008B | 93 | 1,747 |
| DRA-001-04A | 114 | 1,861 |
| DRA-001-04B | 144 | **2,005** |

All 2,005 tests pass.  TypeScript: zero errors.

---

## 4. Design Decisions

### 4.1 Corpus Version Format: DRA-CORPUS-X.Y.Z

Replaces the free-form `"1.0"` strings used in 04A.  The prefix `DRA-CORPUS-`
makes version strings self-describing and unambiguous in mixed contexts.
`CorpusVersionSchema` (Zod) enforces the format at runtime; `CorpusVersionSchema.safeParse`
is the single canonical validator.

This is a breaking change from 04A — all `"1.0"` and `"2.0"` strings in existing
tests were updated in this milestone.

### 4.2 Content Model: Immutable Inline UTF-8

`ContentPayload` carries content as an inline UTF-8 string alongside its SHA-256
`contentDigest`.  File-path and URL references were rejected because they introduce
external mutable state; inline storage makes the payload self-contained and the
digest check trivially reproducible.

### 4.3 Near-Duplicate Algorithm: 3-Gram Jaccard

Named constants `NEAR_DUPLICATE_JACCARD_THRESHOLD = 0.80` and
`MANUAL_REVIEW_JACCARD_THRESHOLD = 0.60` define the three classification bands.
The full `DuplicateAssessment` struct (n-gram counts, intersection, union,
similarity, status) is always retained as governance evidence, even for
`NOT_DUPLICATE` results.

No external APIs or ML models are required — the algorithm is deterministic and
reproducible from the raw text.

### 4.4 Admission Workflow: 5-Step Sequential

The `AdmissionRegistry.admit()` workflow runs checks in a fixed, documented
order:
1. Eligibility (schema, metadata, governance flags)
2. Exact-duplicate (content digest)
3. Near-duplicate (Jaccard similarity — skipped if exact-dup detected)
4. Allocation capacity (skipped if any prior check failed)
5. Record and return

Near-duplicate runs before allocation so that similarity evidence is always
collected before capacity limits are applied.

### 4.5 Operational Timestamps Excluded from All Substantive Digests

Consistent with DRA-ENG-008B convention:
`admissionTimestamp`, `excludedAt`, `freezeTimestamp`, `amendmentTimestamp`
are operational metadata and are excluded from their respective substantive
digests.  Replaying the same logical operation at different wall-clock times
always produces the same digest.

### 4.6 Freeze Boundary: Runtime Enforcement, Not Metadata

`FrozenCorpus.add()`, `.remove()`, and `.modify()` throw `CorpusAlreadyFrozenError`
at runtime.  The freeze is not merely recorded metadata — it is an enforced
constraint.  `verifyCorpusFreeze` provides tamper evidence on the `FreezeRecord`
itself.

### 4.7 Amendment: Downgrade and Destructive-Overwrite Prohibition

`createAmendmentRecord` rejects:
- `newCorpusVersion` ≤ `priorCorpusVersion` (DOWNGRADE_REJECTED or SAME_VERSION_REJECTED)
- An empty `changedEntries` list (MISSING_CHANGED_ENTRIES)
- Removal of all documents from a non-empty corpus (DESTRUCTIVE_OVERWRITE)

`changedEntries` are sorted by `corpusId` before hashing, so insertion order
does not affect the `amendmentDigest`.

### 4.8 Allocation: Three Independent Dimensions

`validateAllocationTotals` verifies that domain targets, document-type targets,
and difficulty targets each independently sum to `targetCorpusSize`.  All three
checks are independent — a failure in one does not suppress reporting of the
others (validation is eager in the presence of multiple mismatch conditions).

### 4.9 Protocol Digest Covers Status

`computeProtocolDigest` includes `protocolStatus` in the hashed payload.  Each
lifecycle transition (DRAFT → APPROVED → FROZEN → SUPERSEDED) therefore produces
a distinct digest, providing tamper evidence at every stage.

---

## 5. Invariants Established

1. **CorpusVersion format** — All corpus version strings in the system match `DRA-CORPUS-\d+\.\d+\.\d+`.
2. **Content integrity** — Every `ContentPayload.contentDigest` is the SHA-256 of `ContentPayload.content`; `verifyContentIntegrity` confirms this.
3. **Admission audit log** — Every call to `AdmissionRegistry.admit()` appends exactly one `AdmissionRecord` to the audit log, regardless of outcome.
4. **Admitted content sets** — Exact-duplicate detection uses a `Set<string>` of content digests; near-duplicate detection uses a growing list of admitted content strings; neither is exposed externally.
5. **Freeze immutability** — `FrozenCorpus` enforces the mutation boundary at runtime; `verifyCorpusFreeze` provides substantive-field tamper detection.
6. **Amendment traceability** — Every `AmendmentRecord` carries `priorFreezeDigest` and `priorManifestDigest`, linking it cryptographically to the frozen corpus being amended.
7. **No evaluator involvement** — The frozen 7-stage pipeline is never called by any governance module.

---

## 6. Next Milestone

**DRA-001-04C** — Reference Document Evaluation and Scoring
