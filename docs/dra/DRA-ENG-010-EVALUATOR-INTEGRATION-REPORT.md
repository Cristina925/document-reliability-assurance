# DRA-ENG-010 — Evaluator Integration — Completion Report

| Field | Value |
|---|---|
| Milestone | DRA-ENG-010 — Evaluator Integration |
| Covers | DRA-ENG-008 (Consistency Check + Confidence Scoring) + DRA-ENG-009 (Decision and Receipt) + DRA-ENG-010 (evaluateDocument) |
| Completion date | 2026-07-27 |
| Test baseline entering | 1,581 / 1,581 |
| Test count at completion | 1,654 / 1,654 |
| New tests added | 73 |
| Status | **COMPLETE — PASS** |

---

## 1. Scope

This milestone implemented the final three stages of the DRA-001 Version 1 evaluator pipeline and the top-level `evaluateDocument(input): DocumentAssuranceEvaluation` orchestrator.

| Code stage | Spec stage | Name | Milestone |
|---|---|---|---|
| Stage 6 | Stage 5 | Consistency Check | DRA-ENG-008 |
| Stage 7 | Stage 6 | Confidence Scoring | DRA-ENG-008 |
| Decision | Stage 7 | Decision and Receipt | DRA-ENG-009 |
| Integration | — | `evaluateDocument` + proof receipt | DRA-ENG-010 |

---

## 2. New Source Files

### Stage 6 — Consistency Check (`src/consistency-check/`)

| File | Purpose |
|---|---|
| `consistency-result.ts` | `Stage6Result`, `Stage6Success`, `Stage6Failure`, `STAGE_6_ID/VERSION` |
| `issue-detection.ts` | `detectIssues()` — cross-stage IC-1/IC-3/IC-4/IC-5/IC-7 detection |
| `check-consistency.ts` | `checkConsistency()` — entry point (5 args: stages 1–5) |
| `index.ts` | Public surface |

### Stage 7 — Confidence Scoring (`src/confidence-scoring/`)

| File | Purpose |
|---|---|
| `confidence-level.ts` | `ConfidenceLevel` union, `CONFIDENCE_LEVELS`, `confidencePriority()` |
| `confidence-result.ts` | `Stage7Result`, `Stage7Success`, `Stage7Failure`, `ConfidenceRecord` |
| `score-confidence.ts` | `scoreConfidence()` — entry point (6 args: stages 1–6) |
| `index.ts` | Public surface |

### Pipeline Integration (`src/pipeline/`)

| File | Purpose |
|---|---|
| `evaluation-result.ts` | `DocumentAssuranceEvaluation` discriminated union |
| `derive-decision.ts` | `deriveDecision(issues)` → `{ decision, rationale }` |
| `build-proof-receipt.ts` | `buildProofReceipt()` — constructs `ProofReceipt` (DRA-001 §8) |
| `evaluate-document.ts` | `evaluateDocument(input)` — top-level pipeline orchestrator |
| `index.ts` | Public surface |

---

## 3. Issue Detection Rules (DRA-001 §6)

Implemented in `src/consistency-check/issue-detection.ts`:

| Issue Class | Severity | Trigger |
|---|---|---|
| IC-1 `UNSUPPORTED_CLAIM` | BLOCKING | CRITICAL/HIGH materiality + `NO_IDENTIFIABLE_SOURCE` + `NO_DOCUMENT_EVIDENCE` |
| IC-3 `AUTHORITY_ABSENT` | ADVISORY | CRITICAL/HIGH materiality + `NO_IDENTIFIABLE_SOURCE` + evidence present |
| IC-4 `EVIDENCE_ABSENT` | BLOCKING | CRITICAL materiality + authority present + `NO_DOCUMENT_EVIDENCE` |
| IC-5 `EVIDENCE_INADEQUATE` | ADVISORY | HIGH materiality + authority present + `NO_DOCUMENT_EVIDENCE` or `AMBIGUOUS_EVIDENCE_LINK` |
| IC-7 `CLAIM_INCONSISTENCY` | ADVISORY | CRITICAL/HIGH pair with contradictory deontic modals on the same verb |

IC-2, IC-6, IC-8, IC-9 are not implemented in the Version 1 reference evaluator.

**IC-1 subsumption rule:** When IC-1 fires for a statement (no authority AND no evidence), IC-3 and IC-4/IC-5 are NOT additionally raised for the same statement. IC-1 is the most specific rule.

---

## 4. Confidence Level Assignment (Stage 7)

Implemented in `src/confidence-scoring/score-confidence.ts`:

| Level | Rule |
|---|---|
| `CONTESTED` | Statement is in an IC-7 `CLAIM_INCONSISTENCY` issue (overrides all other levels) |
| `CONFIRMED` | Named/structural authority (`EXPLICIT_NAMED_SOURCE`, `EXPLICIT_UNNAMED_SOURCE`, `STRUCTURALLY_INHERITED_SOURCE`) AND positive documentary evidence |
| `UNVERIFIED` | `NO_IDENTIFIABLE_SOURCE` AND `NO_DOCUMENT_EVIDENCE` |
| `PARTIAL` | All other cases (one side only, ambiguous evidence, etc.) |

---

## 5. Decision Derivation (DRA-001 §7)

Implemented in `src/pipeline/derive-decision.ts`:

| Decision | Rule |
|---|---|
| `HOLD` | Any BLOCKING issue present (IC-1 or IC-4) |
| `REVIEW` | No BLOCKING issues, but at least one ADVISORY issue (IC-3, IC-5, or IC-7) |
| `SUPPORTED` | No issues of any severity |

---

## 6. ProofReceipt Construction (DRA-001 §8)

The proof receipt contains exactly **7 StageRecord entries** in frozen stage-number order:

| stageNumber | stageName | Content |
|---|---|---|
| 1 | Input Normalisation | Stage 1 summary (document title, warning count) |
| 2 | Claim Extraction | Statement count, warning count |
| 3 | Authority Resolution | Authority record count, warning count |
| 4 | Evidence Linkage | Evidence record count + **Materiality Assessment embedded** |
| 5 | Consistency Check | Issue counts (blocking, advisory) |
| 6 | Confidence Scoring | Level counts |
| 7 | Decision and Receipt | Decision, rationale, issue counts |

**Materiality Assessment folding:** The extra Stage 5 (Materiality Assessment), not in the frozen seven-stage spec, is embedded in the "Evidence Linkage" StageRecord's opaque `output` field under key `materialityAssessment`. This preserves the exact 7-record constraint while maintaining full traceability.

---

## 7. Key Design Invariants

- `evaluateDocument()` never throws. Stage failures are returned as `DocumentAssuranceFailure`.
- The only impure aspect of `evaluateDocument` is the `evaluatedAt` timestamp (`new Date()`).
- `evaluatedAt` is formatted as `"YYYY-MM-DDTHH:mm:ss.mmm"` (no `Z`) to satisfy `z.string().datetime({ offset: false })` in `ProofReceiptSchema.timestamp` and `DocumentIdentitySchema.evaluatedAt`.
- `EvidenceRecord.statementId` and `MaterialityRecord.statementId` are typed as `unknown` in their respective record types. The issue detection engine casts them to `string` via `String(x as string)` for Map keying.
- `Stage2Success` has no `statementCount` field — statement count is `stage2.statements.length`. The count in the ProofReceipt Stage 2 output is derived from `stage2.statements.length`.

---

## 8. Modified Files

| File | Change |
|---|---|
| `src/model/validation-errors.ts` | Added `MALFORMED_STAGE5_RESULT`, `MALFORMED_STAGE6_RESULT` error codes |
| `src/index.ts` | Added Stage 6/7/pipeline exports; updated `DRA_STATUS` to `DRA-ENG-010` |
| `src/tests/dra.scaffold.test.ts` | Updated `DRA_STATUS` assertion to `DRA-ENG-010` |
| `src/model/__tests__/package-exports.test.ts` | Updated confidence-level export test to reflect intentional export |
| `vitest.config.ts` | Added consistency-check, confidence-scoring, pipeline test patterns |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | DRA-ENG-008–010 marked COMPLETE |

---

## 9. Test Summary

| Test file | New tests | Status |
|---|---|---|
| `consistency-check/__tests__/check-consistency.test.ts` | 12 | PASS |
| `consistency-check/__tests__/stage6-exports.test.ts` | 7 | PASS |
| `confidence-scoring/__tests__/score-confidence.test.ts` | 11 | PASS |
| `confidence-scoring/__tests__/stage7-exports.test.ts` | 8 | PASS |
| `pipeline/__tests__/evaluate-document.test.ts` | 28 | PASS |
| `pipeline/__tests__/pipeline-exports.test.ts` | 13 | PASS |
| **Total new** | **73** | **PASS** |
| **Total cumulative** | **1,654** | **PASS** |

---

## 10. Next Milestone

**DRA-ENG-011 — Public API Freeze.** Freeze and document the canonical public surface for `@workspace/dra-reference`. No further breaking changes to exported types, function signatures, or error codes after this point.
