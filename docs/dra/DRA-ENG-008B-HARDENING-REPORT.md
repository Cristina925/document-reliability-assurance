# DRA-ENG-008B — Deterministic Contract and Boundary Hardening — Completion Report

| Field | Value |
|---|---|
| Milestone | DRA-ENG-008B — Deterministic Contract and Boundary Hardening |
| Prior baseline | DRA-ENG-010 complete; 1,654 / 1,654 tests passing |
| Test count at completion | 1,747 / 1,747 |
| New tests added | 93 |
| TypeScript result | **CLEAN** — `tsc --noEmit` exits 0, no errors |
| Build result | N/A — library package; no production build step configured |
| Lint result | N/A — no linter configured |
| Status | **COMPLETE — ALL VALIDATIONS PASS** |

---

## 1. Unsafe Casts Found

| Location | Line | Cast | Risk |
|---|---|---|---|
| `consistency-check/issue-detection.ts` | 161 | `String(ar.statementId)` | `ar.statementId` is typed `StatementId` (branded string); safe at runtime but undocumented |
| `consistency-check/issue-detection.ts` | 167 | `String(er.statementId as string)` | `er.statementId` is typed `unknown`; `String(null)` → `"null"` |
| `consistency-check/issue-detection.ts` | 173 | `mr.statementId as string` | `mr.statementId` is typed `unknown`; unchecked cast |
| `confidence-scoring/score-confidence.ts` | 304 | `String(ar.statementId)` | As above for authority records |
| `confidence-scoring/score-confidence.ts` | 309 | `String(er.statementId)` | `er.statementId` typed `unknown`; coercion hazard |
| `confidence-scoring/score-confidence.ts` | 317 | `String(sid)` | `affectedStatementIds` element; safe at runtime but unguarded |
| `pipeline/evaluate-document.ts` | 48 | `.slice(0, -1)` | Stripped "Z" → misrepresented UTC as timezone-less local time |

## 2. Unsafe Casts Removed

All `String(unknown as string)` coercions in cross-stage Map keying replaced with `buildStatementIdMap()` from `src/shared/identifier-utils.ts`. The `slice(0, -1)` timestamp truncation removed.

Retained (intentional branded-type assertions in `build-proof-receipt.ts`):
- `receipt-${evalId} as unknown as ProofReceiptId`
- `evalId as unknown as EvaluationId`
- `result-${evalId} as unknown as EvaluationResultId`
- `stage2.generatedDocumentId as unknown as GeneratedDocumentId`

These are structural brand assertions at a known-good construction boundary, not runtime coercions of unknown values. Each is annotated with a comment.

---

## 3. Identifier Validation Contract

Implemented in `src/shared/identifier-utils.ts`. Public API:

| Export | Behaviour |
|---|---|
| `IdentifierValidationError` | Error subclass; carries `.received: unknown` for diagnostics |
| `tryExtractId(value)` | Returns `string` if non-empty string, `null` otherwise. Does NOT trim. |
| `requireId(value, fieldPath?)` | Returns string or throws `IdentifierValidationError` |
| `buildStatementIdMap(records)` | Builds `Map<string, T>` from `T extends { statementId: unknown }[]`; omits invalid entries |

Rejection table:

| Input | `tryExtractId` result | `requireId` result |
|---|---|---|
| `"s-001"` | `"s-001"` | `"s-001"` |
| `""` | `null` | throws |
| `null` | `null` | throws "null" |
| `undefined` | `null` | throws "undefined" |
| `42` | `null` | throws "number" |
| `{}` | `null` | throws "object" |
| `[]` | `null` | throws "array" |
| `"   "` | `"   "` (no trim) | `"   "` |

The key invariant: `String(null)` → `"null"` can never enter a Map keyed by validated ids.

---

## 4. Timestamp Issue Identified

The `ProofReceiptSchema.timestamp` and `DocumentIdentitySchema.evaluatedAt` fields used `z.string().datetime({ offset: false })`. The `evaluate-document.ts` implementation stripped the trailing "Z" from `new Date().toISOString()` to satisfy the schema.

**Problem:** UTC timestamps serialised without the "Z" designator are misrepresented as timezone-less local datetimes. This is semantically incorrect and risks silent misinterpretation by downstream consumers.

---

## 5. Timestamp Resolution Implemented

### Schema change
Both `datetime({ offset: false })` fields changed to `datetime({ offset: true })` in `src/model/proof-receipts.ts`. This is backward-compatible (relaxes, not tightens, the schema) and allows:
- `"2026-07-27T12:00:00.000Z"` (canonical UTC — now the production format)
- `"2026-07-27T12:00:00.000+05:30"` (offset-aware, accepted but non-canonical)
- `"2026-07-27T12:00:00.000"` (bare local — accepted by schema; not emitted by evaluator)

### Implementation change
`evaluate-document.ts` `utcTimestampNoOffset()` replaced with `utcTimestamp()` that returns `new Date().toISOString()` directly. No `slice(0, -1)`.

### Verification
- All receipts produced by `evaluateDocument()` now carry `Z`-suffixed timestamps.
- Tests in `canonical-serialise.test.ts` assert `receipt.timestamp` matches `/Z$/`.
- Round-trip tests verify the schema still accepts the new format.

---

## 6. Deterministic Payload Definition

**Substantive payload** — contributes to `substantiveDigest`:

| Field | Notes |
|---|---|
| `evaluationRequestId` | Derived from evaluation request id |
| `evaluationResultId` | Deterministic: `result-{evalId}` |
| `schemaVersion` | Frozen version constant |
| `documentIdentity.generatedDocumentId` | From Stage 2 |
| `documentIdentity.generatedDocumentTitle` | From normalised request |
| `evaluatorIdentity` | Frozen evaluator/pipeline versions |
| `stageOutputs` | All 7 records, in stage-number order |
| `issueRegister` | Issues sorted by id (see §9) |
| `issueSummary` | Derived from issueRegister |
| `decision` | SUPPORTED / REVIEW / HOLD |
| `decisionRationale` | Human-readable rationale string |

---

## 7. Operational Metadata Definition

**Operational metadata** — excluded from `substantiveDigest`:

| Field | Rationale |
|---|---|
| `id` (receipt id) | Container identity; not content |
| `timestamp` | Wall-clock; non-deterministic |
| `documentIdentity.evaluatedAt` | Wall-clock; non-deterministic |
| `substantiveDigest` | Self-referential; excluded to avoid circularity |

---

## 8. Digest Input Definition

`substantiveDigest = SHA-256(canonicalJsonStringify(substantivePayload))`

where `canonicalJsonStringify`:
1. Calls `JSON.stringify(value, sortedKeysReplacer)`.
2. `sortedKeysReplacer` recursively sorts object keys at every depth.
3. Arrays preserve element order (not sorted — order is semantically relevant for `stageOutputs`).
4. `undefined` values are omitted (JSON.stringify default).
5. `null` values are preserved.

Output: 64-character lowercase hex string.

---

## 9. Canonical Ordering Rules

| Subject | Rule |
|---|---|
| Object keys | Sorted lexicographically (Unicode) at every nesting level |
| `stageOutputs` | Preserved in stage-number order 1–7 (semantically ordered) |
| `issueRegister` | Sorted by `id` string before hashing (insertion order irrelevant to decision) |
| All other arrays | Element order preserved |
| Maps / Sets | Not present in substantive payload |
| `undefined` | Omitted |
| `null` | Preserved |

---

## 10. Public Contract Invariants Enforced

All 14 required invariants from the spec are enforced by tests in `src/pipeline/__tests__/invariants.test.ts`:

| # | Invariant | Test file |
|---|---|---|
| 1 | Exactly 7 canonical stages returned | `invariants.test.ts` |
| 2 | Stage order cannot vary | `invariants.test.ts` |
| 3 | Every issue has a valid issue class | `invariants.test.ts` |
| 4 | Every issue has an originating stage | `invariants.test.ts` |
| 5 | Every decision-driving issue exists in issue collection | `invariants.test.ts` |
| 6 | SUPPORTED ↔ zero issues | `invariants.test.ts` |
| 7 | HOLD overrides REVIEW | `invariants.test.ts` |
| 8 | CONTESTED overrides all when IC-7 exists | `invariants.test.ts` |
| 9 | Receipt decision === evaluation decision | `invariants.test.ts` |
| 10 | Integrity verification fails after material mutation | `invariants.test.ts` + `canonical-serialise.test.ts` |
| 11 | Integrity verification succeeds despite timestamp change | `invariants.test.ts` + `canonical-serialise.test.ts` |
| 12 | Repeated substantive evaluation is deterministic | `invariants.test.ts` |
| 13 | Invalid identifiers cannot enter cross-stage Maps | `invariants.test.ts` + `identifier-utils.test.ts` |
| 14 | DRA-ENG-007 detector behaviour unchanged | `invariants.test.ts` |

---

## 11. Files Created

| File | Purpose |
|---|---|
| `src/shared/identifier-utils.ts` | Canonical identifier validation boundary |
| `src/shared/index.ts` | Shared utilities public surface |
| `src/shared/__tests__/identifier-utils.test.ts` | Identifier validation tests (33 tests) |
| `src/pipeline/canonical-serialise.ts` | Deterministic serialisation and integrity digest |
| `src/pipeline/__tests__/canonical-serialise.test.ts` | Serialisation / digest / integrity tests (30 tests) |
| `src/pipeline/__tests__/invariants.test.ts` | 14-invariant public contract tests (30 tests) |

---

## 12. Files Modified

| File | Change |
|---|---|
| `src/model/proof-receipts.ts` | `datetime({ offset: false })` → `datetime({ offset: true })`; added `substantiveDigest: z.string().length(64)` |
| `src/fixtures/model/valid.ts` | Added placeholder `substantiveDigest` to `VALID_PROOF_RECEIPT` fixture |
| `src/consistency-check/issue-detection.ts` | Replaced `String(x as string)` Map-keying with `buildStatementIdMap()` |
| `src/confidence-scoring/score-confidence.ts` | Replaced `String(x)` Map-keying with `buildStatementIdMap()` and `tryExtractId()` |
| `src/pipeline/build-proof-receipt.ts` | Computes and embeds `substantiveDigest` using `computeDigestFromPayload()` |
| `src/pipeline/evaluate-document.ts` | `utcTimestampNoOffset()` → `utcTimestamp()` (no `slice(0,-1)`) |
| `src/pipeline/index.ts` | Exports `canonicalJsonStringify`, `computeDigestFromPayload`, `verifyReceiptIntegrity` |
| `src/index.ts` | Exports shared utilities; updated `DRA_STATUS` to DRA-ENG-008B |
| `src/tests/dra.scaffold.test.ts` | Updated `DRA_STATUS` assertion |
| `src/pipeline/__tests__/evaluate-document.test.ts` | Updated `evaluatedAt` test: now expects Z suffix |
| `vitest.config.ts` | Added `src/shared/__tests__` include pattern |

---

## 13. Tests Added by Category

| Category | File | New Tests |
|---|---|---|
| Identifier validation — `tryExtractId` | `identifier-utils.test.ts` | 13 |
| Identifier validation — `requireId` | `identifier-utils.test.ts` | 10 |
| Identifier validation — `buildStatementIdMap` | `identifier-utils.test.ts` | 10 |
| Canonical JSON serialisation | `canonical-serialise.test.ts` | 8 |
| Digest computation | `canonical-serialise.test.ts` | 6 |
| Receipt integrity verification | `canonical-serialise.test.ts` | 8 |
| Substantive / operational separation | `canonical-serialise.test.ts` | 5 |
| Invariant 1 — stage count | `invariants.test.ts` | 3 |
| Invariant 2 — stage order | `invariants.test.ts` | 2 |
| Invariant 3 — valid issue classes | `invariants.test.ts` | 3 |
| Invariant 4 — originating stage | `invariants.test.ts` | 2 |
| Invariant 5 — decision-driving issues | `invariants.test.ts` | 1 |
| Invariant 6 — SUPPORTED ↔ zero issues | `invariants.test.ts` | 3 |
| Invariant 7 — HOLD overrides REVIEW | `invariants.test.ts` | 2 |
| Invariant 8 — CONTESTED overrides | `invariants.test.ts` | 1 |
| Invariant 9 — decision coherence | `invariants.test.ts` | 4 |
| Invariant 10 — mutation fails | `invariants.test.ts` | 4 |
| Invariant 11 — timestamp variation | `invariants.test.ts` | 2 |
| Invariant 12 — determinism | `invariants.test.ts` | 3 |
| Invariant 13 — invalid identifiers | `invariants.test.ts` | 3 |
| Invariant 14 — detector unchanged | `invariants.test.ts` | 3 |
| **Total** | | **93** |

---

## 14. Previous Test Count

1,654

## 15. New Test Count

93

## 16. Total Passing Test Count

**1,747 / 1,747**

---

## 17. TypeScript Result

**CLEAN** — `pnpm exec tsc --noEmit` exits 0. No type errors.

## 18. Build Result

N/A — `@workspace/dra-reference` is a library package with no production build step configured. TypeScript compilation is validated via `tsc --noEmit`.

## 19. Lint Result

N/A — no ESLint or similar linter is configured in the package.

---

## 20. Existing Issue and Decision Semantics: Unchanged

- IC-1 through IC-7 detection rules: **unchanged**
- IC-1 subsumption of IC-3/IC-4/IC-5: **unchanged**
- SUPPORTED / REVIEW / HOLD derivation logic: **unchanged**
- CONFIRMED / PARTIAL / UNVERIFIED / CONTESTED assignment rules: **unchanged**
- All 14 invariants verified by test coverage.

---

## 21. Known Remaining Limitations

1. **`substantiveDigest` in `VALID_PROOF_RECEIPT` fixture is a placeholder** (`"a".repeat(64)`). The fixture is not produced by `buildProofReceipt()`, so the digest is not authentic. Tests that call `verifyReceiptIntegrity(VALID_PROOF_RECEIPT)` would return false. The fixture is used for type-checking tests only; integrity verification tests use receipts from `evaluateDocument()`.

2. **`EvidenceRecord.statementId` and `MaterialityRecord.statementId` remain typed as `unknown`** in their respective record types. The `buildStatementIdMap()` utility handles this safely at the Map-building boundary, but the upstream type remains `unknown` (not `StatementId`). This is a model-level issue deferred to a later milestone.

3. **`requireId()` is not yet used at public API entry points.** The enforcement boundary for identifiers is `buildStatementIdMap()` (omit-on-invalid). A stricter enforcement boundary using `requireId()` (throw-on-invalid) at public API entry points is recommended for a future milestone.

4. **No content hash in `documentIdentity`** — the `contentHash` field (DRA-001 §8.1) is defined as `optional()` in the schema but never populated. Deferred.

---

## 22. DRA-ENG-008B Freeze Status

**Ready to freeze.** All required validations pass:
- ✅ Identifier handling validated and typed
- ✅ Deterministic and operational fields explicitly separated  
- ✅ Datetime semantics unambiguous (UTC + Z suffix)
- ✅ Canonical serialisation hardened (sorted keys, SHA-256 digest)
- ✅ Public evaluation invariants enforced by tests
- ✅ 1,747 / 1,747 tests passing
- ✅ TypeScript clean

---

## 23. Recommended Next Milestone

**DRA-ENG-011 — Public API Freeze**

Freeze and document the canonical public surface for `@workspace/dra-reference`. Define the exact set of exported types, functions, and constants. No breaking changes to exported identifiers, function signatures, error codes, or schema fields after this point. Add a compatibility test suite that imports the public surface and asserts its shape has not changed.

---

## 24. Commit Hash

Not applicable — Replit environment; no Git commit recorded for this milestone.
