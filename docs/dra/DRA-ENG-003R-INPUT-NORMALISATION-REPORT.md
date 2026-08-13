# DRA-ENG-003R — Input Normalisation Completion Report

**Milestone:** DRA-ENG-003 — Input Normalisation (Stage 1)  
**Programme:** DRA-001 — Document Release Assurance, Version 1  
**Report identifier:** DRA-ENG-003R  
**Status:** **COMPLETE — PASS**  
**Completed:** 2026-07-26

---

## 1. Milestone Summary

DRA-ENG-003 implements Stage 1 of the DRA-001 evaluator pipeline: **Input Normalisation**.

Stage 1 is the runtime boundary of the DRA evaluator. It accepts untrusted input of unknown
type, validates it against the canonical DRA data model (established at DRA-ENG-002),
applies all authorised normalisation transformations, and returns a discriminated
success/failure result. It never throws for ordinary invalid input.

---

## 2. Deliverables Produced

### 2.1 Implementation Files

| File | Purpose |
|---|---|
| `lib/dra-reference/src/normalisation/stage1-types.ts` | Stage1Result, Stage1Success, Stage1Failure, NormalisedEvaluationRequest, NormalisationRecord, NormalisationEntityCounts |
| `lib/dra-reference/src/normalisation/normalise-strings.ts` | CRLF→LF normalisation; metadata trimming; content field utilities |
| `lib/dra-reference/src/normalisation/normalise-documents.ts` | SourceDocument and GeneratedDocument normalisation; reference integrity checks |
| `lib/dra-reference/src/normalisation/normalise-statements.ts` | MaterialStatement and SpanReference normalisation (Stage 2+ use) |
| `lib/dra-reference/src/normalisation/normalise-evidence.ts` | EvidenceUnit and EvidenceRelationship normalisation (Stage 4+ use) |
| `lib/dra-reference/src/normalisation/normalise-evaluation-request.ts` | `normaliseEvaluationRequest(rawInput: unknown): Stage1Result` entry point |
| `lib/dra-reference/src/normalisation/index.ts` | Stage 1 public surface re-exports |
| `lib/dra-reference/src/normalisation/README.md` | Stage 1 documentation |

### 2.2 Fixture Files

| File | Content |
|---|---|
| `lib/dra-reference/src/fixtures/normalisation/valid.ts` | 10 valid Stage 1 fixture scenarios |
| `lib/dra-reference/src/fixtures/normalisation/invalid.ts` | 20 invalid Stage 1 fixture scenarios (fixtures 5–20) |

### 2.3 Test Files

| File | Tests |
|---|---|
| `src/normalisation/__tests__/normalise-strings.test.ts` | String utility unit tests |
| `src/normalisation/__tests__/normalise-evaluation-request.test.ts` | Main Stage 1 integration tests |
| `src/normalisation/__tests__/stage1-boundary.test.ts` | Boundary: no decisions, no issues, no receipts, no confidence |
| `src/normalisation/__tests__/stage1-exports.test.ts` | Export surface verification; CTS import boundary |

### 2.4 Updated Files

| File | Change |
|---|---|
| `lib/dra-reference/vitest.config.ts` | Added `src/normalisation/__tests__/**/*.test.ts` pattern |
| `lib/dra-reference/src/index.ts` | Re-exports Stage 1 surface; updated `DRA_STATUS` |
| `lib/dra-reference/src/tests/dra.scaffold.test.ts` | Updated scaffold status assertion for post-Stage-1 reality |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | DRA-ENG-003 marked COMPLETE; next milestone DRA-ENG-004 |

---

## 3. Normalisation Rules Implemented

### Rule 1: Structural Validation (Zod)

Raw input parsed against `EvaluationRequestSchema`. Zod errors mapped to
`DraValidationError` instances with DRA error codes. Parsing failures are
deterministically sorted by `path` (lexicographic) then `code` (lexicographic).

### Rule 2: Document Identity Separation

`generatedDocument.id` must not equal any `sourceDocument.id`. Conflict
rejected with `DRA_DUPLICATE_IDENTIFIER`.

### Rule 3: Duplicate Source Document Identifiers

Source documents checked for duplicate `id` values within the request.
Duplicates rejected with `DRA_DUPLICATE_IDENTIFIER`.

### Rule 4: String Normalisation — Metadata Fields (trim + line endings)

Fields trimmed (leading/trailing whitespace) AND line endings normalised:

- `SourceDocument.title`, `.author`, `.version`, `.provenanceNotes`, `.contentRef`
- `GeneratedDocument.title`
- `SpanReference.locationLabel`

Optional metadata fields that become empty after trimming are treated as absent.

### Rule 5: String Normalisation — Content Fields (line endings only)

`\r\n` → `\n` and `\r` → `\n` applied. Fields NOT trimmed:

- `SourceDocument.content`
- `GeneratedDocument.content`
- `MaterialStatement.text` (Stage 2+ use)
- `EvidenceUnit.passageText` (Stage 4+ use)

### Rule 6: Source Document Reference Integrity

Every ID in `generatedDocument.sourceDocumentIds` must resolve to a source
document in `sourceDocuments`. Unresolved references rejected with
`DRA_UNRESOLVED_REFERENCE`. Empty `sourceDocumentIds` is valid at Stage 1.

### Rule 7: Deterministic Ordering

- `sourceDocuments` sorted by `id` (lexicographic ascending).
- `statements` (when present) sorted by `statementIndex` then `id`.
- `evidenceUnits` (when present) sorted by `id`.
- `evidenceRelationships` (when present) sorted by `id`.

### Rule 8: Immutability

`normaliseEvaluationRequest` never mutates the caller's raw input. All
normalised output objects are freshly constructed from Zod-parsed data
(already separated from the caller's object graph). Subsequent mutation
of the raw input does not affect the normalised result.

### Rule 9: Version Declaration

The normalisation record always declares:
- `outputModelVersion: "0.1.0"` (= `DRA_MODEL_VERSION`)
- `outputPipelineVersion: "1.0"` (= `DRA_PIPELINE_VERSION`)

---

## 4. Stage 1 Type API

### Entry Point

```typescript
function normaliseEvaluationRequest(rawInput: unknown): Stage1Result
```

### Stage1Result (discriminated union)

```typescript
type Stage1Result = Stage1Success | Stage1Failure;

interface Stage1Success {
  readonly ok: true;
  readonly stageId: "STAGE_1_INPUT_NORMALISATION";
  readonly pipelineVersion: string;           // "1.0"
  readonly modelVersion: string;              // "0.1.0"
  readonly normalisedRequest: EvaluationRequest;
  readonly normalisationRecord: NormalisationRecord;
  readonly warnings: ReadonlyArray<string>;
}

interface Stage1Failure {
  readonly ok: false;
  readonly stageId: "STAGE_1_INPUT_NORMALISATION";
  readonly errors: ReadonlyArray<DraValidationError>;
  readonly errorCount: number;
}
```

### NormalisationRecord

```typescript
interface NormalisationRecord {
  readonly stageId: "STAGE_1_INPUT_NORMALISATION";
  readonly stageVersion: string;
  readonly outputModelVersion: string;         // "0.1.0"
  readonly outputPipelineVersion: string;      // "1.0"
  readonly fieldsNormalised: ReadonlyArray<string>;
  readonly collectionsReordered: ReadonlyArray<string>;
  readonly inputEntityCounts: NormalisationEntityCounts;
  readonly outputEntityCounts: NormalisationEntityCounts;
  readonly warnings: ReadonlyArray<string>;
}
```

---

## 5. Stage 1 Scope Boundary

Stage 1 does NOT:

- Extract material statements ← Stage 2 (DRA-ENG-004)
- Determine materiality ← Stage 2 (DRA-ENG-004)
- Retrieve or score evidence ← Stage 4 (DRA-ENG-006)
- Detect any of the nine DRA issue classes ← Stage 5 (DRA-ENG-007)
- Calculate severity, confidence, or assurance decisions ← Stages 6–7
- Generate a proof receipt ← Stage 7 (DRA-ENG-009)
- Execute any later pipeline stage

Validation checks (automated):
- No `SUPPORTED`, `REVIEW`, or `HOLD` appears as a decision value in Stage 1 output
- No `DraIssue` instances constructed in Stage 1 source
- No `ProofReceipt` constructed or referenced in Stage 1 source
- No `confidenceIndicators` in any Stage 1 result field
- No `cts-reference` imports in any Stage 1 source file

---

## 6. Validation Results

### 6.1 DRA Test Suite

| Metric | Value |
|---|---|
| DRA test files | 17 / 17 PASS |
| DRA total tests | **679 / 679 PASS** |
| Tests added this milestone | +173 (was 506 at DRA-ENG-002A) |

### 6.2 Workspace Typecheck

```
pnpm -w tsc --noEmit
→ CLEAN (no output, exit code 0)
```

### 6.3 Frozen Test Baselines

| Suite | Result |
|---|---|
| CTS reference | 293 / 293 PASS (frozen baseline) |
| research-workspace | **2030 / 2030 PASS** (frozen baseline) |

### 6.4 Full Build

```
pnpm -w run build
→ artifacts/mockup-sandbox: PORT environment variable is required but was not provided. (PRE-EXISTING — not caused by DRA work)
→ All other artifacts and libraries: PASS
```

The `mockup-sandbox` PORT error is a pre-existing build limitation carried
forward from all prior milestones (DRA-ENG-001, DRA-ENG-002, DRA-ENG-002A).
It is not caused by DRA Stage 1 work.

### 6.5 CTS Import Boundary

```
grep -r "from.*cts-reference|require.*cts-reference|import.*@workspace/cts" lib/dra-reference/src/ --include="*.ts"
→ CLEAN — no live CTS imports found (only a comment in src/index.ts)
```

### 6.6 SUPPORTED/REVIEW/HOLD in Stage 1 Grep

```
grep -n "SUPPORTED|REVIEW|HOLD" lib/dra-reference/src/normalisation/*.ts
→ CLEAN — not present in normalisation source files
```

### 6.7 DraIssue Construction Grep

```
grep -n "DraIssue|new.*Issue|issueClass|affectedStatementIds" lib/dra-reference/src/normalisation/*.ts
→ CLEAN — only a JSDoc comment reference, no construction
```

### 6.8 Proof Receipt Grep

```
grep -n "ProofReceipt|proofReceipt|stageOutputs|decisionRationale|issueRegister" lib/dra-reference/src/normalisation/*.ts
→ CLEAN
```

### 6.9 Mutation Check

Three automated tests verify immutability:
- `does not mutate the raw input object` — PASS
- `does not mutate the sourceDocuments array in the raw input` — PASS
- `subsequent mutation of the raw input does not alter the normalised result` — PASS

### 6.10 Determinism Check

Two automated tests verify determinism:
- `same valid input produces deeply equal normalised output when normalised twice` — PASS
- `semantically equivalent inputs with different source order produce equal normalised output` — PASS
- `normalising an already-normalised result produces equal output` — PASS (idempotence)

---

## 7. New Tests by Category

| Category | Tests |
|---|---|
| String normalisation (normalise-strings.test.ts) | 28 |
| Successful normalisation, version policy | 14 |
| Trimming rules | 7 |
| Line-ending normalisation | 5 |
| Preservation of meaningful content | 5 |
| Deterministic ordering | 3 |
| Determinism / idempotence | 3 |
| Immutability | 3 |
| Reference integrity | 6 |
| Duplicate identifier rejection | 2 |
| Timestamp validation | 4 |
| Unknown-field policy | 3 |
| Required field validation | 7 |
| Null/undefined/empty inputs | 6 |
| Deterministic error ordering | 4 |
| Normalisation record | 5 |
| Edge cases | 3 |
| Stage 1 boundary (boundary test file) | 21 |
| Export surface + CTS boundary | 34 |
| **Total new tests** | **173** |

---

## 8. Frozen-Artefact Diff

No files under `lib/cts-reference/` or `artifacts/research-workspace/` were
modified by this milestone.

The only modifications to pre-existing files:
- `lib/dra-reference/src/tests/dra.scaffold.test.ts` — scaffold status assertion updated to track the new `DRA_STATUS` string (which no longer says "SCAFFOLD" now that real evaluator behaviour is present)
- `lib/dra-reference/src/index.ts` — `DRA_STATUS` updated; Stage 1 surface re-exported
- `lib/dra-reference/vitest.config.ts` — normalisation test pattern added
- `docs/dra/DRA-001-PROGRAMME-INDEX.md` — milestone register updated

---

## 9. Commit

```
DRA-ENG-003 — Input Normalisation (Stage 1)
```

---

## 10. Outstanding Known Issues (Carried Forward)

| Issue | Status |
|---|---|
| `mockup-sandbox` build failure (PORT env var not set) | Pre-existing, not DRA-related |
| `ConfidenceIndicator` deferred (DRA-001 §5 Stage 6 lists no classification values) | Reserved for DRA-ENG-008 |

---

## 11. Next Milestone

**DRA-ENG-004 — Claim Extraction (Stage 2)**

Stage 2 accepts a `Stage1Success.normalisedRequest` and extracts
`MaterialStatement` instances from the generated document content.

DRA-ENG-004 must not be started until explicitly opened.

---

*Report produced by DRA-ENG-003 execution.*  
*Programme: DRA-001 — Document Release Assurance, Version 1.*
