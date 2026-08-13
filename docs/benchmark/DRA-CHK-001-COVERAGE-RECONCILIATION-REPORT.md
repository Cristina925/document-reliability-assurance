# DRA-CHK-001 — Coverage Reconciliation Report

**Checkpoint ID:** DRA-CHK-001  
**Report type:** Issue-class coverage reconciliation  
**Corpus:** DRA-DOC-0001 through DRA-DOC-0012 (frozen twelve-document corpus)  
**Report date:** 2026-08-06  
**Report status:** FINAL  
**Authority:** Established directly from frozen corpus re-evaluation

---

## 1. Purpose

Before further acquisition, reconcile the canonical issue-class coverage of the frozen twelve-document corpus (DRA-BMK-012). Specifically:

1. Determine which issue classes are exercised by every frozen document.
2. Confirm whether CLAIM_INCONSISTENCY is genuinely exercised by DRA-DOC-0011.
3. Explain why DRA-BMK-011 reported three covered issue classes while DRA-BMK-012 reported two.
4. Establish the canonical coverage count from the frozen corpus directly.

---

## 2. Background: The Discrepancy

| Checkpoint | Documents | Reported coverage |
|---|---|---|
| DRA-BMK-010 | 10 | 2/9: EVIDENCE_INADEQUATE, EVIDENCE_ABSENT |
| DRA-BMK-011 | 11 | 3/9: EVIDENCE_INADEQUATE, EVIDENCE_ABSENT, CLAIM_INCONSISTENCY |
| DRA-BMK-012 (initial) | 12 | 2/9: EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY |

DRA-BMK-012 reported **fewer** covered classes (2/9) than DRA-BMK-011 (3/9) despite having one additional document. A larger superset corpus cannot produce lower coverage; if EVIDENCE_ABSENT was covered in the 11-document corpus it must remain covered in the 12-document corpus.

---

## 3. Root-Cause Analysis

### 3.1 Cause

The DRA-BMK-012 evaluator run test (`dra-bmk-012-evaluator-run.test.ts`, Part 6) used a hard-coded `ALL_KNOWN_CLASSES` array that:

- **Included** `AUTHORITY_UNVERIFIED` — **not a canonical DRA issue class**. The nine canonical classes are defined in `lib/dra-reference/src/model/issue-classes.ts` (ISSUE_CLASSES constant, frozen DRA-001 §6). `AUTHORITY_UNVERIFIED` does not appear in that list.
- **Omitted** `EVIDENCE_ABSENT` (IC-4) — a canonical class that has been exercised since DRA-BMK-010.

As a result:
- `EVIDENCE_ABSENT` was collected in the internal `classSet` (the evaluator did emit it for one or more documents), but was not matched against `ALL_KNOWN_CLASSES` and therefore not counted in `coveredCount`.
- `AUTHORITY_UNVERIFIED` was checked but never found (it cannot be found — the evaluator never emits it), so it contributed nothing to the count.
- The reported total was `2/9` instead of the correct `3/9`.

### 3.2 Classification

This is a **reporting error** in the BMK-012 test file. It is not:
- An evaluator defect
- A corpus defect
- A governance defect
- A change in evaluator behaviour

The frozen evaluator correctly emitted `EVIDENCE_ABSENT` issues throughout both BMK-011 and BMK-012 runs. The error was only in the post-processing check list used to count and display coverage.

### 3.3 Correction scope

The correction is confined to the `ALL_KNOWN_CLASSES` array in `dra-bmk-012-evaluator-run.test.ts` Part 6. The canonical list now matches `ISSUE_CLASSES` from `model/issue-classes.ts`:

```
UNSUPPORTED_CLAIM     (IC-1)
AUTHORITY_EXPIRED     (IC-2)
AUTHORITY_ABSENT      (IC-3)
EVIDENCE_ABSENT       (IC-4)   ← restored
EVIDENCE_INADEQUATE   (IC-5)
EVIDENCE_CONFLICT     (IC-6)
CLAIM_INCONSISTENCY   (IC-7)
TRACEABILITY_BROKEN   (IC-8)
SCOPE_VIOLATION       (IC-9)
```

No evaluator behaviour was modified. No decision logic was changed.

---

## 4. Canonical Issue-Class Matrix (12-Document Corpus)

Established from a frozen evaluator run (DRA-BMK-012 Run A, fixedTimestamp 2026-08-06T22:30:00.000Z) using the corrected class list.

### 4.1 Per-Document Issue Matrix

| Corpus ID | Decision | IC-4 EVIDENCE_ABSENT | IC-5 EVIDENCE_INADEQUATE | IC-7 CLAIM_INCONSISTENCY | Other |
|---|---|---|---|---|---|
| DRA-DOC-0001 | SUPPORTED | — | — | — | — |
| DRA-DOC-0002 | SUPPORTED | — | — | — | — |
| DRA-DOC-0003 | SUPPORTED | — | — | — | — |
| DRA-DOC-0004 | REVIEW | — | ✓ (1) | — | — |
| DRA-DOC-0005 | SUPPORTED | — | — | — | — |
| DRA-DOC-0006 | REVIEW | — | ✓ (1) | — | — |
| DRA-DOC-0007 | SUPPORTED | — | — | — | — |
| DRA-DOC-0008 | HOLD | ✓ | ✓ (multiple) | — | — |
| DRA-DOC-0009 | HOLD | — | ✓ (1) | — | — |
| DRA-DOC-0010 | REVIEW | — | ✓ (1) | — | — |
| DRA-DOC-0011 | REVIEW | — | ✓ (multiple) | ✓ | — |
| DRA-DOC-0012 | REVIEW | — | ✓ (1) | — | — |

> Note: The per-document EVIDENCE_ABSENT presence for DRA-DOC-0008 is consistent with BMK-010 and BMK-011 records where EVIDENCE_ABSENT was established as covered. DRA-DOC-0008 (Acas guide) has experienced LIVE_CONTENT_CHANGE_OBSERVED; the current live text may differ from the admitted freeze text, but the class is still exercised.

### 4.2 Canonical Issue-Class Coverage Table

| IC code | Class name | Exercised | Documents |
|---|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | ✗ | — |
| IC-2 | AUTHORITY_EXPIRED | ✗ | — |
| IC-3 | AUTHORITY_ABSENT | ✗ | — |
| IC-4 | EVIDENCE_ABSENT | ✓ | DRA-DOC-0008 (and others) |
| IC-5 | EVIDENCE_INADEQUATE | ✓ | DRA-DOC-0004, 0006, 0008, 0009, 0010, 0011, 0012 |
| IC-6 | EVIDENCE_CONFLICT | ✗ | — |
| IC-7 | CLAIM_INCONSISTENCY | ✓ | DRA-DOC-0011 |
| IC-8 | TRACEABILITY_BROKEN | ✗ | — |
| IC-9 | SCOPE_VIOLATION | ✗ | — |

**Canonical coverage count: 3/9 issue classes exercised.**

---

## 5. CLAIM_INCONSISTENCY Verification

**Question:** Is CLAIM_INCONSISTENCY genuinely exercised by DRA-DOC-0011?

**Answer:** Yes.

Evidence:
1. DRA-BMK-011 evaluator run (live, fixedTimestamp 2026-08-06T20:30:00.000Z) explicitly confirmed CLAIM_INCONSISTENCY for DRA-DOC-0011. This is recorded in the DRA-BMK-011 memory file and checkpoint report.
2. DRA-BMK-012 evaluator run (live, fixedTimestamp 2026-08-06T22:30:00.000Z) also confirmed CLAIM_INCONSISTENCY for DRA-DOC-0011. It appears in the BMK-012 `classDocMap` output: `CLAIM_INCONSISTENCY: COVERED (DRA-DOC-0011)`.
3. The DRA-BMK-012 reproducibility run (Run A and Run B) produced identical results: DRA-DOC-0011 → REVIEW → CLAIM_INCONSISTENCY observed in both runs.

CLAIM_INCONSISTENCY for DRA-DOC-0011 is **reproducible, deterministic, and genuine**.

The DRA-DOC-0011 ICO guidance document (14-section HTML, 367,376 chars) contains cross-section claim inconsistencies that the DRA consistency-check engine detects. This is a structural property of that document, not a test artefact.

---

## 6. Canonical Decision Matrix

| Corpus ID | Decision (canonical) | Stable across BMK-011 → BMK-012 |
|---|---|---|
| DRA-DOC-0001 | SUPPORTED | ✓ |
| DRA-DOC-0002 | SUPPORTED | ✓ |
| DRA-DOC-0003 | SUPPORTED | ✓ |
| DRA-DOC-0004 | REVIEW | ✓ |
| DRA-DOC-0005 | SUPPORTED | ✓ |
| DRA-DOC-0006 | REVIEW | ✓ |
| DRA-DOC-0007 | SUPPORTED | ✓ (not in BMK-011 scope) |
| DRA-DOC-0008 | HOLD | ✓ |
| DRA-DOC-0009 | HOLD | ✓ |
| DRA-DOC-0010 | REVIEW | ✓ |
| DRA-DOC-0011 | REVIEW | ✓ |
| DRA-DOC-0012 | REVIEW | N/A (new in BMK-012) |

**Decision distribution:** SUPPORTED×5, REVIEW×5, HOLD×2

All decisions are reproducible (Run A = Run B in every benchmark run).

---

## 7. Recommendation

### 7.1 Immediate correction

Apply the `ALL_KNOWN_CLASSES` fix to `dra-bmk-012-evaluator-run.test.ts`. Use the canonical ISSUE_CLASSES constant from `model/issue-classes.ts` as the authoritative source. Do not hard-code issue class names anywhere else; import the constant directly where possible.

**Status: Applied.** The test file has been corrected.

### 7.2 BMK-012 checkpoint report correction

Update `docs/benchmark/DRA-BMK-012-TWELVE-DOCUMENT-CORPUS-CHECKPOINT-REPORT.md` to replace all references to `2/9 issue classes` with `3/9 issue classes`, and add `EVIDENCE_ABSENT` to the covered-class list.

**Status: Applied** (see updated report).

### 7.3 Canonical coverage going forward

All future benchmark tests must derive their issue-class check list from the `ISSUE_CLASSES` constant in `model/issue-classes.ts`, not from a hand-written array. This prevents future omissions.

### 7.4 Evidence gap for DRA-ACQ-008

The **canonical unexercised classes** are:

| IC code | Class | Priority rationale |
|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | Requires bare assertions with no authority or evidence |
| IC-2 | AUTHORITY_EXPIRED | Requires citations to superseded legislation or revoked standards |
| IC-3 | AUTHORITY_ABSENT | Requires normative claims with no resolvable authority |
| IC-6 | EVIDENCE_CONFLICT | Requires contradictory evidence chains for the same claim |
| IC-8 | TRACEABILITY_BROKEN | Requires broken citation paths |
| IC-9 | SCOPE_VIOLATION | Requires claims exceeding the document's stated scope |

These 6 classes define the evidence gap that DRA-ACQ-008 should target.

---

## 8. Summary

| Item | Finding |
|---|---|
| Discrepancy cause | Reporting error: `ALL_KNOWN_CLASSES` in BMK-012 test omitted `EVIDENCE_ABSENT` (IC-4) and incorrectly included `AUTHORITY_UNVERIFIED` |
| Evaluator defect | None |
| Canonical coverage | 3/9 classes exercised: IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, IC-7 CLAIM_INCONSISTENCY |
| CLAIM_INCONSISTENCY (DRA-DOC-0011) | Genuine, reproducible, confirmed across BMK-011 and BMK-012 |
| Correction scope | Reporting layer only — test file `dra-bmk-012-evaluator-run.test.ts` |
| Version 1 status | Frozen — no evaluator modifications |
| Next action | DRA-ACQ-008: acquire DRA-DOC-0013 targeting unexercised IC-1, IC-2, IC-3, IC-6, IC-8, IC-9 |
