# DRA-ENG-002AR — Canonical Model Ambiguity Resolution Report

**Document identifier:** DRA-ENG-002AR  
**Milestone:** DRA-ENG-002A — Canonical Model Ambiguity Resolution  
**Status:** COMPLETE  
**Verdict:** **PASS**  
**Date:** 2026-07-26 (UTC)  
**Programme:** DRA-001 — Document Release Assurance, Version 1  
**Preceded by:** DRA-ENG-002 (commit `f1b0ea0`), DRA-ENG-002R

---

## 1. Files Inspected

| File | Purpose |
|---|---|
| `docs/dra/DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md` | Authoritative specification — issue classes §6, pipeline §5 |
| `lib/dra-reference/src/model/issue-classes.ts` | Issue class constants, schemas, maps |
| `lib/dra-reference/src/model/evaluation.ts` | EvaluationResult, ConfidenceIndicator |
| `lib/dra-reference/src/model/index.ts` | Canonical model export surface |
| `lib/dra-reference/src/model/__tests__/issue-classes.test.ts` | Issue class tests |
| `lib/dra-reference/src/model/__tests__/evaluation.test.ts` | Evaluation tests |
| `lib/dra-reference/src/model/__tests__/package-exports.test.ts` | Export surface tests |
| `lib/dra-reference/src/fixtures/model/valid.ts` | Valid entity fixtures |
| `lib/dra-reference/src/fixtures/model/invalid.ts` | Invalid entity fixtures |
| `docs/dra/DRA-ENG-002R-CANONICAL-DATA-MODEL-REPORT.md` | DRA-ENG-002 completion report |

---

## 2. Issue 1 — Canonical Issue-Class Representation

### 2.1 Finding

The nine descriptive issue-class literals from DRA-001 §6 (`UNSUPPORTED_CLAIM` … `SCOPE_VIOLATION`) were already the canonical runtime and public model values in `issue-classes.ts`. `DraIssue.issueClass` used `DraIssueClass`, typed from the descriptive literal tuple. The `ISSUE_CLASS_CODES` and `ISSUE_CLASS_TO_CODE` maps were present.

**Missing at DRA-ENG-002:**
- No distinct `IssueClassCode` type existed for the IC-N reference codes.
- No `IssueClassCodeSchema` existed to validate IC-N codes as a separate type.
- `INVALID_ISSUE_CLASSES` did not include IC-1 through IC-9, so `DraIssueClassSchema` was not tested to reject them.
- No tests proved the two sets were distinct, mutually exclusive, or one-to-one.

### 2.2 Resolution Applied

Added to `lib/dra-reference/src/model/issue-classes.ts`:

| Addition | Purpose |
|---|---|
| `ISSUE_CLASS_CODE_VALUES` tuple | The nine IC-N codes (`IC-1` … `IC-9`) as a frozen ordered tuple |
| `IssueClassCode` type | TypeScript union of the nine IC-N code strings |
| `IssueClassCodeSchema` | Zod enum accepting IC-1 through IC-9; rejecting descriptive literals |
| `isIssueClassCode` helper | Runtime guard for `IssueClassCode` values |
| `getIssueClassFromCode` helper | Reverse lookup: IC-N code → descriptive literal |

Added to `lib/dra-reference/src/fixtures/model/invalid.ts`:

| Addition | Purpose |
|---|---|
| IC-1 through IC-9 entries in `INVALID_ISSUE_CLASSES` | Proves `DraIssueClassSchema` rejects reference codes |
| `INVALID_ISSUE_CLASS_CODES` | Includes all nine descriptive literals; proves `IssueClassCodeSchema` rejects them |

Exported from `lib/dra-reference/src/model/index.ts`:
- `ISSUE_CLASS_CODE_VALUES`, `IssueClassCodeSchema`, `isIssueClassCode`, `getIssueClassFromCode`
- `IssueClassCode` (type)

### 2.3 Exact Nine Canonical Descriptive Literals

Source: DRA-001 §6 — authoritative, frozen for Version 1

| IC-N reference code | Canonical descriptive literal |
|---|---|
| IC-1 | `UNSUPPORTED_CLAIM` |
| IC-2 | `AUTHORITY_EXPIRED` |
| IC-3 | `AUTHORITY_ABSENT` |
| IC-4 | `EVIDENCE_ABSENT` |
| IC-5 | `EVIDENCE_INADEQUATE` |
| IC-6 | `EVIDENCE_CONFLICT` |
| IC-7 | `CLAIM_INCONSISTENCY` |
| IC-8 | `TRACEABILITY_BROKEN` |
| IC-9 | `SCOPE_VIOLATION` |

### 2.4 Exact Nine IC-N Reference Codes

`IC-1`, `IC-2`, `IC-3`, `IC-4`, `IC-5`, `IC-6`, `IC-7`, `IC-8`, `IC-9`

### 2.5 Authoritative Type for Runtime Issue-Class Fields

**`DraIssueClass`** — the union of the nine descriptive literals.

Used by: `DraIssue.issueClass`, `DraIssueClassSchema`, all evaluation result issue lists.

### 2.6 Authoritative Type for Future Evaluator and Public API Use

**`DraIssueClass`** is the type for all runtime evaluation fields, public API interfaces, evaluation requests, evaluation results, and proof receipt issue registers.

**`IssueClassCode`** is the type for reference-code fields only (documentation, audit trail output, IC-N display). It must not be used in place of `DraIssueClass` in any runtime evaluation field.

### 2.7 Mapping Design

- `ISSUE_CLASS_CODES: Readonly<Record<string, DraIssueClass>>` — maps `"IC-1"` → `"UNSUPPORTED_CLAIM"`, etc.
- `ISSUE_CLASS_TO_CODE: Readonly<Record<DraIssueClass, string>>` — maps `"UNSUPPORTED_CLAIM"` → `"IC-1"`, etc.
- Both maps are frozen, immutable, one-to-one, and exhaustive over the nine pairs.
- The `getIssueClassCode` helper resolves descriptive → code.
- The `getIssueClassFromCode` helper resolves code → descriptive.

### 2.8 Confirmation: Reference Codes Are Not Canonical Runtime Issue Values

Confirmed:

- `DraIssueClassSchema` rejects all nine IC-N codes (`IC-1` through `IC-9`).
- `DraIssueSchema.issueClass` is typed as `DraIssueClass`, not `IssueClassCode`.
- `IssueClassCodeSchema` rejects all nine descriptive literals.
- The two sets (`ISSUE_CLASSES` and `ISSUE_CLASS_CODE_VALUES`) have zero overlap (tested).
- IC-1 through IC-9 appear in zero runtime model fields in `lib/dra-reference/src/model/`.

---

## 3. Issue 2 — Confidence Indicator

### 3.1 Specification Authority Determination

Inspected: DRA-001 §5, Stage 6 (Confidence Scoring).

**Exact specification text:**
> Stage 6 — Confidence Scoring: Assign a per-claim confidence indicator based on the outputs of stages 3–5. The confidence score is a structured classification, not a numeric probability.

**Determination:**
- The specification confirms that confidence indicators are a concept produced by Stage 6.
- The specification does **not** enumerate specific classification values.
- `HIGH | MEDIUM | LOW` is **inferred** from general practice. These values have **no specification authority**.
- No other section of DRA-001 Version 1 defines confidence indicator values.

**Conclusion:** DRA-001 Version 1 defines that confidence indicators exist (Stage 6 produces them) but does not explicitly define the classification values. The `HIGH | MEDIUM | LOW` enumeration introduced at DRA-ENG-002 was AMBIGUITY-002 and is hereby resolved as **deferred**.

### 3.2 Resolution Applied

Per the milestone instruction: "Prefer full removal from the active model."

**Removed from the canonical Version 1 active model:**
- `confidenceIndicators: z.array(ConfidenceIndicatorSchema)` field removed from `EvaluationResultSchema`.
- `CONFIDENCE_LEVELS`, `ConfidenceLevelSchema`, `ConfidenceIndicatorSchema` removed from `model/index.ts` exports.
- `ConfidenceLevel`, `ConfidenceIndicator` types removed from `model/index.ts` exports.
- `confidenceIndicators` field removed from `VALID_EVALUATION_RESULT` fixture.
- All confidence-indicator tests removed from `evaluation.test.ts`.

**Kept in `evaluation.ts` as deferred, non-normative symbols:**
The internal symbols are retained in `evaluation.ts` with `_DEFERRED_` prefix and `@deprecated` annotations to preserve the future implementation anchor without polluting the canonical surface:
- `_DEFERRED_CONFIDENCE_LEVELS`
- `_DeferredConfidenceLevel`
- `_DeferredConfidenceLevelSchema`
- `_DeferredConfidenceIndicatorSchema`
- `_DeferredConfidenceIndicator`

These symbols:
- Are not exported from `model/index.ts`.
- Are not used by any canonical Version 1 entity.
- Are not accepted by any runtime evaluation schema.
- Have no effect on decisions.
- Are clearly documented as non-normative, deferred, and unused.

### 3.3 Specification Section

**DRA-001 §5, Stage 6 (Confidence Scoring)** — establishes that Stage 6 produces per-claim confidence indicators as a structured classification. Specific classification values are not enumerated. The implementation will be defined at DRA-ENG-008.

### 3.4 Disposition Summary

| Symbol | Status |
|---|---|
| `CONFIDENCE_LEVELS` | Removed from canonical export; moved to `_DEFERRED_CONFIDENCE_LEVELS` in `evaluation.ts` |
| `ConfidenceLevel` | Removed from canonical export; available as `_DeferredConfidenceLevel` |
| `ConfidenceLevelSchema` | Removed from canonical export; available as `_DeferredConfidenceLevelSchema` |
| `ConfidenceIndicator` | Removed from canonical export; available as `_DeferredConfidenceIndicator` |
| `ConfidenceIndicatorSchema` | Removed from canonical export; available as `_DeferredConfidenceIndicatorSchema` |
| `EvaluationResult.confidenceIndicators` | Removed from `EvaluationResultSchema` |
| Future definition | Deferred to DRA-ENG-008 (Confidence Scoring stage implementation) |

---

## 4. Files Created

| File | Purpose |
|---|---|
| `docs/dra/DRA-ENG-002AR-CANONICAL-MODEL-AMBIGUITY-RESOLUTION-REPORT.md` | This report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `lib/dra-reference/src/model/issue-classes.ts` | Added `ISSUE_CLASS_CODE_VALUES`, `IssueClassCode`, `IssueClassCodeSchema`, `isIssueClassCode`, `getIssueClassFromCode` |
| `lib/dra-reference/src/model/evaluation.ts` | Removed `confidenceIndicators` from `EvaluationResultSchema`; renamed confidence symbols to `_DEFERRED_` prefix with `@deprecated` annotations |
| `lib/dra-reference/src/model/index.ts` | Added `IssueClassCode*` exports; removed `ConfidenceIndicator*` exports |
| `lib/dra-reference/src/fixtures/model/valid.ts` | Removed `confidenceIndicators` from `VALID_EVALUATION_RESULT` |
| `lib/dra-reference/src/fixtures/model/invalid.ts` | Added IC-1…IC-9 to `INVALID_ISSUE_CLASSES`; added `INVALID_ISSUE_CLASS_CODES` |
| `lib/dra-reference/src/model/__tests__/issue-classes.test.ts` | Rewrote to add distinction, mutual-exclusion, one-to-one, and DraIssue rejection tests |
| `lib/dra-reference/src/model/__tests__/evaluation.test.ts` | Removed confidence tests; added deferred-field absence assertions |
| `lib/dra-reference/src/model/__tests__/package-exports.test.ts` | Added absence tests for confidence exports; added `IssueClassCodeSchema` and helper assertions |

---

## 6. Exports Changed

### Added to canonical export surface (`model/index.ts`)

| Export | Type |
|---|---|
| `ISSUE_CLASS_CODE_VALUES` | `readonly ["IC-1", ..., "IC-9"]` |
| `IssueClassCodeSchema` | `ZodEnum` accepting IC-1…IC-9 only |
| `isIssueClassCode` | `(value: unknown) => value is IssueClassCode` |
| `getIssueClassFromCode` | `(code: string) => DraIssueClass \| undefined` |
| `IssueClassCode` | TypeScript union type |

### Removed from canonical export surface (`model/index.ts`)

| Export | Disposition |
|---|---|
| `CONFIDENCE_LEVELS` | Deferred — internal `_DEFERRED_CONFIDENCE_LEVELS` in `evaluation.ts` |
| `ConfidenceLevelSchema` | Deferred — internal `_DeferredConfidenceLevelSchema` in `evaluation.ts` |
| `ConfidenceIndicatorSchema` | Deferred — internal `_DeferredConfidenceIndicatorSchema` in `evaluation.ts` |
| `ConfidenceLevel` | Deferred — internal `_DeferredConfidenceLevel` type in `evaluation.ts` |
| `ConfidenceIndicator` | Deferred — internal `_DeferredConfidenceIndicator` type in `evaluation.ts` |

---

## 7. Schemas Changed

| Schema | Change |
|---|---|
| `EvaluationResultSchema` | Removed `confidenceIndicators` field |
| `IssueClassCodeSchema` | **Added** — accepts IC-1…IC-9; rejects descriptive literals |
| `DraIssueClassSchema` | No change to schema logic; now tested to reject IC-N codes |

---

## 8. Fixtures Changed

| Fixture | Change |
|---|---|
| `VALID_EVALUATION_RESULT` | Removed `confidenceIndicators` array |
| `INVALID_ISSUE_CLASSES` | Added IC-1, IC-2, IC-3, IC-4, IC-5, IC-6, IC-7, IC-8, IC-9 |
| `INVALID_ISSUE_CLASS_CODES` | **Added** — all nine descriptive literals plus other invalid values |

---

## 9. Tests Changed

### `issue-classes.test.ts` — new tests added

| Test group | Tests added |
|---|---|
| Canonical descriptive literals — exactly nine | Retained from DRA-ENG-002 |
| IC-N reference codes — exactly nine codes | New — verifies `ISSUE_CLASS_CODE_VALUES` length and values |
| Distinctness — two sets mutually exclusive | New — verifies no overlap between `ISSUE_CLASSES` and `ISSUE_CLASS_CODE_VALUES` |
| IC-N code maps — one-to-one | Retained and expanded with injectivity tests |
| `DraIssueClassSchema` rejects IC-N codes | New — all nine IC-N codes rejected |
| `IssueClassCodeSchema` accepts IC-N codes | New — all nine IC-N codes accepted |
| `IssueClassCodeSchema` rejects descriptive literals | New — all nine descriptive literals rejected |
| `DraIssue.issueClass` uses descriptive type | New — `DraIssueSchema` rejects IC-N codes in `issueClass` field |
| Helpers | Added `isIssueClassCode`, `getIssueClassFromCode` tests |

### `evaluation.test.ts` — changes

| Change | Details |
|---|---|
| Removed | `CONFIDENCE_LEVELS`, `ConfidenceLevelSchema`, `ConfidenceIndicatorSchema` tests |
| Added | Test confirming `EvaluationResultSchema` does not have `confidenceIndicators` |
| Added | Test confirming `VALID_EVALUATION_RESULT` does not have `confidenceIndicators` |
| Added | Test confirming parsed result strips unknown `confidenceIndicators` if supplied |

### `package-exports.test.ts` — changes

| Change | Details |
|---|---|
| Removed | `ConfidenceLevelSchema`, `ConfidenceIndicatorSchema` from expected schemas list |
| Added | Tests verifying `CONFIDENCE_LEVELS`, `ConfidenceLevelSchema`, `ConfidenceIndicatorSchema`, `ConfidenceLevel`, `ConfidenceIndicator` are NOT exported |
| Added | `IssueClassCodeSchema` in expected schemas list |
| Added | Tests for `isIssueClassCode`, `getIssueClassFromCode`, `isDraIssueClass`, `getIssueClassCode` as exported functions |
| Added | Three-decision count and value assertions |
| Added | Package root confidence isolation assertion |

---

## 10. Exact Validation Results

### DRA package tests
```bash
cd lib/dra-reference && pnpm test
```
**Result:** Test Files 13 passed (13), Tests **506 passed (506)** — PASS  
*(Prior: 421 tests at DRA-ENG-002; 85 new tests added at DRA-ENG-002A)*

### DRA package typecheck
```bash
cd lib/dra-reference && pnpm typecheck
```
**Result:** 0 errors — PASS

### Workspace TypeScript typecheck
```bash
pnpm run typecheck
```
**Result:** 0 errors across all packages — PASS

### CTS evaluator tests
```bash
cd cts-reference && pnpm test
```
**Result:** tests 293, pass **293**, fail 0 — PASS

### Research workspace tests
```bash
cd artifacts/research-workspace && pnpm test
```
**Result:** Test Files 16 passed (16), Tests **2030 passed (2030)** — PASS

### Full production build
```bash
pnpm run build
```
**Result:** PARTIAL — `artifacts/mockup-sandbox` fails with PORT environment variable error (pre-existing limitation, not caused by DRA-ENG-002A; see §11).

---

## 11. Pre-existing Build Limitation Status

The `artifacts/mockup-sandbox` PORT environment variable error is pre-existing, carried forward from DRA-ENG-001 and recorded in DRA-ENG-002R. DRA-ENG-002A introduced no new build failures.

---

## 12. CTS Import Boundary Result

```bash
grep -r "cts-reference\|from.*cts" lib/dra-reference/src/ --include="*.ts"
```

**Result:** One match — documentation comment in `src/index.ts` recording the boundary prohibition. Zero implementation imports. — PASS

---

## 13. Frozen Artefact Diff

```bash
git diff HEAD -- cts-reference/ docs/publication/ research-artifacts/ release/
```

**Result:** 0 lines — PASS

---

## 14. ConfidenceIndicator Presence Search

```bash
grep -rn "ConfidenceIndicator\|CONFIDENCE_LEVELS\|ConfidenceLevel" \
  lib/dra-reference/src/model/index.ts \
  lib/dra-reference/src/index.ts \
  lib/dra-reference/src/fixtures/
```

**Result:**
```
lib/dra-reference/src/model/index.ts:210:// Note: ConfidenceIndicator is intentionally NOT exported from this surface.
```

One match — a comment in `model/index.ts` recording the intentional exclusion. No live exports. No fixture references. — PASS

---

## 15. IC-N Codes in Runtime Model Fields Search

```bash
grep -rn "\"IC-[1-9]\"" \
  lib/dra-reference/src/model/identifiers.ts \
  lib/dra-reference/src/model/decisions.ts \
  lib/dra-reference/src/model/documents.ts \
  lib/dra-reference/src/model/evaluation.ts \
  lib/dra-reference/src/model/evidence.ts \
  lib/dra-reference/src/model/issues.ts \
  lib/dra-reference/src/model/proof-receipts.ts \
  lib/dra-reference/src/model/statements.ts \
  lib/dra-reference/src/model/invariants.ts
```

**Result:** 0 matches — PASS

IC-N reference codes appear only in `issue-classes.ts` (as reference-code constants), nowhere in runtime model field definitions.

---

## 16. Unresolved Issues

None. Both ambiguities from DRA-ENG-002R are fully resolved:

- **AMBIGUITY-001** (issue-class literal format): Confirmed RESOLVED. Descriptive literals are the canonical runtime values. IC-N codes are reference-code use only. Distinction is enforced by types and runtime validation.

- **AMBIGUITY-002** (confidence indicator levels): Confirmed RESOLVED. `HIGH | MEDIUM | LOW` had no specification authority. `ConfidenceIndicator` removed from active canonical model. Deferred to DRA-ENG-008.

---

## 17. Confirmation: No Evaluator Behaviour Introduced

Confirmed. No evaluator behaviour, pipeline execution, document processing, decision calculation, or content analysis was introduced at this milestone.

---

## 18. Confirmation: Version 1 Scope Unchanged

Confirmed. The DRA-001 Version 1 Programme Specification was not modified. The frozen seven-stage pipeline, nine issue classes, and SUPPORTED/REVIEW/HOLD decision semantics remain exactly as specified.

---

## 19. DRA-ENG-002R Ambiguity Status Addendum

This report (DRA-ENG-002AR) serves as the linked corrective addendum to DRA-ENG-002R. The two ambiguities recorded in DRA-ENG-002R §21 are now resolved:

- AMBIGUITY-001: **RESOLVED** — see §2 above.
- AMBIGUITY-002: **RESOLVED** — see §3 above.

---

## 20. Milestone Verdict

**PASS**

All acceptance criteria satisfied:

- [x] Descriptive issue-class names confirmed as the canonical runtime and public values.
- [x] IC-1 through IC-9 are limited to reference-code use (`IssueClassCode` type and `ISSUE_CLASS_CODE_VALUES` constant).
- [x] Distinction enforced by types (`DraIssueClass` vs `IssueClassCode`) and runtime validation (`DraIssueClassSchema` vs `IssueClassCodeSchema`).
- [x] Mappings are deterministic, one-to-one, immutable, and tested for injectivity.
- [x] Descriptive schema rejects IC-N codes; code schema rejects descriptive literals; `DraIssueSchema.issueClass` rejects IC-N codes.
- [x] `ConfidenceIndicator` removed from active canonical Version 1 surface (no specification authority for classification values).
- [x] Deferred confidence symbols isolated as `_DEFERRED_` prefixed, unexported, non-normative symbols in `evaluation.ts`.
- [x] Exactly three decision values remain: SUPPORTED, REVIEW, HOLD.
- [x] DRA package tests pass: 506/506.
- [x] DRA package typecheck: 0 errors.
- [x] Workspace typecheck: 0 errors.
- [x] CTS unchanged: 293/293 tests pass.
- [x] Frozen-artefact diff: 0 lines.
- [x] CTS import boundary clean.
- [x] No active canonical entity depends on ConfidenceIndicator.
- [x] Canonical export surface does not expose an unauthorised active confidence concept.
- [x] No evaluator behaviour introduced.
- [x] DRA Version 1 scope unchanged.

---

## 21. Exact Commit Identifier

```
847dd59
```

---

*Produced at DRA-ENG-002A — Canonical Model Ambiguity Resolution.*
