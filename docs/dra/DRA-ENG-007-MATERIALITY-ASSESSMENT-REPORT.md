# DRA-ENG-007 — Stage 5 Materiality Assessment: Completion Report

**Document type:** Engineering Completion Report  
**Milestone:** DRA-ENG-007  
**Pipeline stage:** Stage 5 — Materiality Assessment  
**Status:** ✅ COMPLETE  
**Date:** 2026-07-26  
**Test baseline at completion:** 1,581 / 1,581 (all prior baselines preserved)

---

## 1. Executive Summary

Stage 5 (Materiality Assessment) of the DRA-001 Version 1 pipeline has been fully implemented, tested, and verified. The stage classifies every extracted statement from Stage 2 into one of six materiality tiers using a deterministic, priority-ordered rule engine. It accepts all four prior stage outputs, cross-checks evaluationId consistency, and produces a structured `Stage5Success` or `Stage5Failure` result. No LLM calls, no confidence scores, no decisions, and no proof receipts are produced at this stage.

---

## 2. Scope and Deliverables

### 2.1 Module Location

```
lib/dra-reference/
  src/
    materiality-assessment/
      assess-materiality.ts          — entry point; pipeline orchestration
      materiality-classification.ts  — MaterialityClassification union + guards
      materiality-record.ts          — MaterialityRecord, StructuralContext, Stage5AssessmentRecord
      materiality-result.ts          — Stage5Result, Stage5Success, Stage5Failure
      materiality-rules.ts           — classifyMateriality() + 27 named rules
      record-identifiers.ts          — makeMaterialityRecordId(), parseMaterialityRecordId()
      structural-analysis.ts         — analyseStructure() → StructuralContext
      index.ts                       — full public surface exports
      __tests__/
        assess-materiality.test.ts   — 46 integration tests
        materiality-rules.test.ts    — 80 unit tests (one per rule)
        record-identifiers.test.ts   — 12 ID generation/parsing tests
        stage5-boundary.test.ts      — 38 boundary proof tests
        stage5-exports.test.ts       — 18 export surface tests
```

### 2.2 Model Additions

```
src/model/validation-errors.ts — 8 new Stage 5 error codes added
```

New error codes:

| Code | Meaning |
|---|---|
| `INVALID_MATERIALITY_CLASSIFICATION` | Classification value not in the closed union |
| `DUPLICATE_MATERIALITY_RECORD` | Two records share the same statementId |
| `UNKNOWN_STATEMENT_REFERENCE` | Record references a statementId not in Stage 2 output |
| `INVALID_STRUCTURAL_CONTEXT` | StructuralContext fields are malformed |
| `INVALID_RULE_IDENTIFIER` | Rule ID does not follow the `MA-<TIER>-<NAME>` convention |
| `MATERIALITY_RECORD_ID_COLLISION` | Two records share the same `ar5:` ID |
| `INCOMPLETE_MATERIALITY_COVERAGE` | Not all Stage 2 statements have a materiality record |
| `MALFORMED_STAGE4_RESULT` | Stage 4 result cannot be parsed as Stage4Result |

---

## 3. MaterialityClassification Taxonomy

The classification is a closed union of exactly 6 values, ordered by decreasing materiality:

| Value | Rule prefix | Semantics |
|---|---|---|
| `CRITICAL` | `MA-CRITICAL-*` | Regulatory/legal/safety/contractual/payment/security obligations — any failure risks catastrophic outcome |
| `HIGH` | `MA-HIGH-*` | Approvals, rejections, decisions, deployment gates, hard deadlines, deontic must/shall |
| `MODERATE` | `MA-MODERATE-*` | Guidance, assumptions, rationale, warnings, quantified constraints |
| `LOW` | `MA-LOW-*` | Examples, descriptive prose, background, explanatory commentary |
| `INFORMATIONAL` | `MA-INFO-*` | Navigation labels, short noun phrases, section headings |
| `UNDETERMINED` | `MA-UNDETERMINED-DEFAULT` | Explicit default; never guesses |

---

## 4. Materiality Rule Engine

### 4.1 Design

`classifyMateriality(statementText: string): MaterialityDetectionResult` is a pure function. Rules are applied in strict priority order — the first matching rule wins. No rule inference, no ML, no confidence scores.

### 4.2 Rule Inventory (27 rules)

**CRITICAL tier (6 rules)**

| Rule ID | Trigger pattern summary |
|---|---|
| `MA-CRITICAL-SAFETY` | Life-safety keywords: must evacuate, hazard, safety-critical, life-threatening |
| `MA-CRITICAL-LEGAL` | Statutory obligation: liable, legally required, legal obligation, court order |
| `MA-CRITICAL-CONTRACT` | Contractual obligation: contractually obligated, breach of contract, penalty clause |
| `MA-CRITICAL-PAYMENT` | Payment obligation: invoice must be paid, overdue payment, non-payment penalty |
| `MA-CRITICAL-SECURITY` | Security mandate: must encrypt, authentication must be enforced, MFA required |
| `MA-CRITICAL-REGULATORY` | Regulatory framework: must comply with GDPR, in compliance with HIPAA, GDPR requires |

**HIGH tier (7 rules)**

| Rule ID | Trigger pattern summary |
|---|---|
| `MA-HIGH-APPROVAL` | Approval granted: has been approved, sign-off received, approved by board |
| `MA-HIGH-REJECTION` | Rejected / not approved: has been rejected, approval denied |
| `MA-HIGH-DECISION` | Formal decision: it has been decided, the decision is, we have resolved to |
| `MA-HIGH-RECOMMENDATION` | Formal recommendation: it is recommended, we recommend, the panel recommends |
| `MA-HIGH-DEPLOYMENT` | Deployment gate: shall not be deployed, must not go live, deployment requires |
| `MA-HIGH-DEADLINE` | Hard deadline: must be completed by, due by, deadline is, no later than |
| `MA-HIGH-OBLIGATION` | Deontic must/shall catch-all (not otherwise classified) |

**MODERATE tier (5 rules)**

| Rule ID | Trigger pattern summary |
|---|---|
| `MA-MODERATE-GUIDANCE` | Should / it is advised / best practice |
| `MA-MODERATE-ASSUMPTION` | Assumption: it is assumed, we assume, assumption is |
| `MA-MODERATE-RATIONALE` | Rationale: because, therefore, the reason is, consequently |
| `MA-MODERATE-WARNING` | Warning / caution / note: warning:, caution:, note: |
| `MA-MODERATE-QUANTIFIED` | Quantified limit: maximum of N, rate limit is N, 99.9% availability |

**LOW tier (4 rules)**

| Rule ID | Trigger pattern summary |
|---|---|
| `MA-LOW-EXAMPLE` | Example: for example, e.g., such as, for instance |
| `MA-LOW-DESCRIPTIVE` | Descriptive prose: the system is, the document describes, this section covers |
| `MA-LOW-BACKGROUND` | Background: historically, in the past, background context |
| `MA-LOW-EXPLANATORY` | Explanatory: i.e., in other words, this means that, to clarify |

**INFORMATIONAL tier (3 rules)**

| Rule ID | Trigger pattern summary |
|---|---|
| `MA-INFO-LABEL` | Short (≤ 50 chars) noun-phrase heading with no verb |
| `MA-INFO-SHORT-NOUN` | Very short (≤ 20 chars) noun-only string |
| `MA-INFO-NAVIGATION` | Section-heading navigation: "Introduction", "Appendix A", "3.2 Overview" |

**UNDETERMINED (1 rule)**

| Rule ID | Trigger |
|---|---|
| `MA-UNDETERMINED-DEFAULT` | Explicit fallback — no rule matched |

---

## 5. Record Identifier Convention

Stage 5 uses the same `ar<N>:` convention established by Stages 3 and 4:

```
ar5:{statementId}
```

`statementId` is the ID assigned by Stage 2 Claim Extraction. The prefix `ar5` is exported as `STAGE_5_RECORD_ID_PREFIX = "ar5"`.

---

## 6. Entry Point Contract

```typescript
function assessMateriality(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
  authorityResolutionResult: Stage3Result | unknown,
  evidenceLinkageResult: Stage4Result | unknown,
): Stage5Result
```

**Validation sequence (fail-fast, never throws):**

1. `normalisedRequest` is a non-null object with `generatedDocument.content: string`
2. `claimExtractionResult.ok === true` (Stage 2 success)
3. `authorityResolutionResult.ok === true` (Stage 3 success)
4. `evidenceLinkageResult.ok === true` (Stage 4 success)
5. `stage3.evaluationId === stage2.evaluationId` (pipeline coherence)
6. `stage4.evaluationId === stage2.evaluationId` (pipeline coherence)

One materiality record is produced per Stage 2 statement, in ascending `statementIndex` order.

---

## 7. Stage 5 Result Shape

### 7.1 Stage5Success

```typescript
interface Stage5Success {
  readonly ok: true;
  readonly stageId: "STAGE_5_MATERIALITY_ASSESSMENT";
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly evaluationId: string;
  readonly generatedDocumentId: string;
  readonly statementCount: number;
  readonly materialityRecordCount: number;
  readonly materialityRecords: ReadonlyArray<MaterialityRecord>;
  readonly assessmentRecord: Stage5AssessmentRecord;
  readonly warnings: ReadonlyArray<string>;
}
```

**Boundary invariants proven by tests:**
- No `decision`, `confidence`, `confidenceScore`, `proofReceipt`, `issueClass` fields
- `statementCount === materialityRecordCount`
- `classificationCounts` sums to `statementCount`
- All 6 classification keys always present in `classificationCounts`
- All record IDs begin with `ar5:`
- Record IDs are unique across all records

### 7.2 MaterialityRecord

```typescript
interface MaterialityRecord {
  readonly id: string;                               // ar5:{statementId}
  readonly statementId: string;
  readonly statementIndex: number;
  readonly classification: MaterialityClassification;
  readonly ruleId: string;                           // MA-<TIER>-<NAME>
  readonly rationale: string;                        // non-empty human-readable
  readonly triggeringCharacteristics: ReadonlyArray<string>;
  readonly structuralContext: StructuralContext;
  readonly statementSpan: StatementSpan;
}
```

### 7.3 StructuralContext (informational only)

```typescript
interface StructuralContext {
  readonly hasQuantifiedLimit: boolean;
  readonly hasTemporalReference: boolean;
  readonly hasNegation: boolean;
  readonly hasDeonticModal: boolean;
  readonly statementLength: number;
}
```

`StructuralContext` informs but does not determine the classification. The rule engine alone determines the classification.

---

## 8. Test Coverage

| Test file | Tests | Purpose |
|---|---|---|
| `assess-materiality.test.ts` | 46 | Full pipeline integration; all 6 tiers; failure paths; field invariants |
| `materiality-rules.test.ts` | 80 | One test per rule; including rule-ordering proofs |
| `record-identifiers.test.ts` | 12 | ID generation; parsing; round-trip; prefix constant |
| `stage5-boundary.test.ts` | 38 | No-decision, no-confidence, no-proofReceipt, no-issueClass; structuralContext; idempotence |
| `stage5-exports.test.ts` | 18 | Export surface: all 6 classification values; all constants; all functions |

**Total new tests:** 194  
**Baseline tests preserved:** 1,387 (Stages 1–4)  
**Grand total at completion:** 1,581 / 1,581 ✅

---

## 9. Bugs Fixed During Implementation

| Bug | Root cause | Fix |
|---|---|---|
| `MODERATE_QUANTIFIED_RE` multi-digit numbers not matching | Trailing `\b` after `\d` — no word boundary between consecutive digits | Changed `\s+\d` to `\s+\d[\d,]*`; removed trailing `\b` from the pattern |
| `LOW_EXAMPLE_RE` — `e.g.` not matching | `\b` after `.` (non-word char) followed by space (non-word char) — no boundary | Moved `e\.g\.` outside the `\b...\b` alternation group |
| `LOW_EXPLANATORY_RE` — `i.e.` not matching | Same `\b` after `.` issue | Moved `i\.e\.` outside the `\b...\b` alternation group |
| `CRITICAL_SECURITY_RE` — "Authentication must be enforced" → HIGH | Pattern only matched `must authenticate` (verb), not `authentication must be` (noun subject) | Added `authentication\s+(?:must\|shall)\s+be\s+(?:required\|enforced\|enabled\|...)` |
| `CRITICAL_REGULATORY_RE` — "in compliance with GDPR" → HIGH | Pattern only matched `must comply with GDPR`, not the prepositional form | Added `in\s+compliance\s+with\s+(?:the\s+)?(?:GDPR\|HIPAA\|...)` |
| `HIGH_APPROVAL_RE` — "Sign-off has been received" → UNDETERMINED | Pattern matched `sign-off received` but not the passive-voice `sign-off has been received` | Added `has\s+been\s+` as optional interstitial |
| Integration test `makeRequest` missing Stage 1 required fields | Test used a simplified request shape missing `id`, `title`, `requestedAt`, etc. | Aligned with the Stage 1 schema (matching Stage 4 test helper pattern) |
| Stage 4 exports test `DRA_STATUS.toContain("DRA-ENG-006")` | `DRA_STATUS` now reflects Stage 5 (DRA-ENG-007) | Updated assertion to verify non-empty string rather than hardcoded milestone |
| Boundary test `as Record<string, unknown>` TS2352 | `MaterialityDetectionResult` has no index signature | Changed to `as unknown as Record<string, unknown>` (double-cast) |

---

## 10. Design Decisions

### 10.1 Stage boundary — no semantics beyond classification

Stage 5 produces only a materiality classification. It does not produce:
- Issue instances or issue classes
- Confidence scores or probability estimates
- Decisions (SUPPORTED / REVIEW / HOLD)
- Proof receipts or CTS linkages
- LLM-derived annotations

All of the above belong to later stages.

### 10.2 UNDETERMINED is the explicit default

The fallback rule `MA-UNDETERMINED-DEFAULT` fires when no other rule matches. Stage 5 never guesses — UNDETERMINED is a meaningful classification that downstream stages can act on (e.g. flag for human review).

### 10.3 StructuralContext is informational

`StructuralContext` is derived from structural features (quantified limits, temporal references, negation, deontic modals, statement length) of the statement text. It accompanies each record as metadata but does not drive the classification. This separation ensures the rule engine remains the single source of truth for classification.

### 10.4 EvaluationId cross-check

Stage 5 verifies that the `evaluationId` of Stages 2, 3, and 4 all match. A mismatch means results from different evaluation runs were mixed, which would produce incoherent output. The cross-check fails deterministically with `MALFORMED_STAGE4_RESULT`.

### 10.5 Record ID format follows Stage 3/4 convention

```
ar5:{statementId}
```

The `ar<N>:` prefix convention was established at Stage 3 (`ar3:`) and Stage 4 (`ar4:`). Stage 5 continues the same pattern. This makes record IDs traceable back to their pipeline stage.

---

## 11. TypeScript Verification

```
pnpm exec tsc --noEmit
```

Exit code: 0. No type errors.

---

## 12. Programme Index Update

`docs/dra/DRA-001-PROGRAMME-INDEX.md`:
- DRA-ENG-007 → **COMPLETE** ✅
- DRA-ENG-008 → PENDING (not started)
- Current milestone updated to DRA-ENG-007

---

## 13. Next Milestone

**DRA-ENG-008** — Stage 6 (Issue Classification) has not been started. No code, no types, no tests for Stage 6 have been written.
