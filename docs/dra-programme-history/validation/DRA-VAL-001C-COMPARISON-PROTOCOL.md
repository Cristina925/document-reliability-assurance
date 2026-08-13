# DRA-VAL-001C — Issue Matching and Comparison Protocol

**Document Release Assurance — Version 1 Scientific Validation**

| Field | Value |
|-------|-------|
| Document ID | DRA-VAL-001C |
| Version | 1.0.0 |
| Status | DRAFT |
| **Seal status** | **Must be frozen before evaluator results are unsealed** |
| Date | 2026-07-27 |

---

## 1. Purpose

This protocol defines — in advance and in full — the rules for comparing DRA evaluator findings against the adjudicated human reference standard.

These rules must be frozen before any evaluator output is examined. Post-result changes to matching rules are categorically prohibited except via a recorded protocol amendment filed before unsealing, with an authorised reason.

---

## 2. Two Required Analysis Levels

All comparisons are conducted at two levels:

| Level | Unit of comparison | Description |
|-------|--------------------|-------------|
| **INSTANCE** | Individual issue instances | One-to-one matching of specific findings |
| **CLASS** | Issue class per document | Presence/absence of each IC-N class per document |

Both analyses are required. Neither alone is sufficient.

---

## 3. Terminology

| Term | Definition |
|------|-----------|
| **Evaluator finding** | An issue (class, severity, and optionally location) produced by the DRA evaluator |
| **Reviewer finding** | An issue recorded by an individual reviewer in their independent submission |
| **Adjudicated reference finding** | The output of the formal adjudication process — the authoritative reference for comparison |
| **Adjudicated human reference standard** | The full set of adjudicated reference findings for a document |
| **Agreed** | Both the evaluator and the reference standard identify the same issue (class or instance) |
| **Evaluator-only** | The evaluator identifies an issue not present in the reference standard |
| **Reviewer-only** | The reference standard contains an issue not identified by the evaluator |

---

## 4. Issue Instance Matching (INSTANCE Level)

### 4.1 Match criteria

Two findings (one evaluator, one reference) are an **INSTANCE-LEVEL AGREED match** when:
- They are assigned the same IC-N issue class, **and**
- They reference the same section, clause, or comparable document location (within one section or heading level), **and**
- The document is the same.

### 4.2 Partial match

Two findings are a **PARTIAL_MATCH** when:
- They are assigned the same IC-N issue class, **but**
- They reference different sections of the same document (or the location of one or both is unspecified).

Partial matches are recorded separately from full matches. Their treatment in primary metrics is specified in section 8.

### 4.3 EVALUATOR_ONLY (instance level)

An evaluator finding has no matched reference finding after the matching procedure is complete.

### 4.4 REVIEWER_ONLY (instance level)

A reference finding has no matched evaluator finding after the matching procedure is complete.

### 4.5 One-to-one matching rule

Each evaluator finding may match at most one reference finding, and each reference finding may match at most one evaluator finding. Once matched, a finding is removed from the unmatched pool.

Matching priority: full matches are assigned before partial matches. Among multiple potential full matches, the closest location match takes priority.

---

## 5. Issue Class Matching (CLASS Level)

### 5.1 Match criteria

For a given document, an issue class IC-N is **AGREED at the class level** when:
- The evaluator flags IC-N for the document, **and**
- The adjudicated reference standard contains at least one finding classified IC-N for the same document.

### 5.2 EVALUATOR_ONLY (class level)

An issue class IC-N is EVALUATOR_ONLY for a document when:
- The evaluator flags IC-N for the document, **and**
- The adjudicated reference standard contains no finding classified IC-N for the same document.

### 5.3 REVIEWER_ONLY (class level)

An issue class IC-N is REVIEWER_ONLY for a document when:
- The adjudicated reference standard contains at least one finding classified IC-N, **and**
- The evaluator does not flag IC-N for the document.

### 5.4 Neither flags

When neither the evaluator nor the reference standard identifies IC-N for a document, that class is not counted in any numerator or denominator. It is a true negative.

---

## 6. Document-Level Decision Comparison

The evaluator produces a document-level decision: SUPPORTED, REVIEW, or HOLD.

The adjudicated reference standard produces a document-level recommendation: SUPPORTED, REVIEW, or HOLD.

A **document-level agreement** is recorded when both match exactly.

A **document-level disagreement** is recorded when they differ. Disagreements are classified by type:
- **SUPPORTED vs REVIEW** — minor disagreement
- **SUPPORTED vs HOLD** — major disagreement
- **REVIEW vs HOLD** — borderline disagreement

Decision agreement rates are computed overall and stratified by domain, source type, and difficulty.

---

## 7. Severity Disagreements

Severity classifications are recorded from both evaluator and reviewers. Severity disagreements (where the evaluator and reference standard agree on the class but not the severity) are recorded and reported but do not affect the primary recall and precision metrics.

---

## 8. Treatment of Multiple Issues from One Underlying Defect

A single underlying document defect may generate multiple findings from both the evaluator and reviewers.

- **Instance level:** Each finding is counted separately. If three findings arise from one defect, they are counted as three instances.
- **Class level:** If all three findings are the same issue class, they are counted as one class occurrence.

This is the pre-registered rule. It may not be changed retrospectively.

---

## 9. Treatment of One Evaluator Finding Covering Several Reviewer Findings

When one evaluator finding is broad enough to cover several reviewer findings at the instance level:

- **Instance level:** The evaluator finding is matched to the highest-priority reviewer finding (closest location match or most severe). Remaining reviewer findings are classified as REVIEWER_ONLY.
- **Class level:** If the evaluator finding and any reviewer finding share a class, the class is AGREED. Reviewer-only classes remain REVIEWER_ONLY.

---

## 10. Unclassifiable and Ambiguous Findings

A finding is **INDETERMINATE** when:
- It cannot be assigned to any IC-N class, **or**
- Its location is too vague to support instance matching, **or**
- The adjudicator classified it as ambiguous.

INDETERMINATE findings are reported separately. They are excluded from the primary recall and precision computations, with their count noted.

---

## 11. Excluded Findings

A finding is **EXCLUDED** from analysis when:
- The document was withdrawn after freeze, **or**
- The reviewer submission was disqualified (e.g. reviewer blinding failure), **or**
- A protocol deviation directly affects the finding's reliability.

Excluded findings and their reasons are reported in the analysis.

---

## 12. Borderline Match Procedure

When no rule in sections 4–10 produces a definitive classification, the adjudicator classifies the finding using the following procedure:

1. Apply the closest matching rule by analogy.
2. If no analogy applies, classify as INDETERMINATE.
3. Record the borderline case in the borderline register.
4. Report the number of borderline cases in the analysis.

The borderline register is reviewed at the end of the analysis phase. Patterns in borderline cases may generate protocol amendment proposals for future studies.

---

## 13. Prohibition on Post-Result Changes

Once evaluator results are unsealed, no changes to this protocol are permitted except:
- Corrections to typographical errors that do not affect the matching logic (reason: PROCEDURAL_CORRECTION)
- Corrections to errors in the document-withdrawal record (reason: DOCUMENT_WITHDRAWAL)

Any post-result change that alters a matching rule, a classification criterion, or the handling of any finding type is categorically prohibited and, if made, must be reported as a major protocol violation in the validation report.

---

## 14. Protocol Freeze Confirmation

This protocol is frozen when the following record is completed in `DRA-VAL-001F-PROTOCOL-REGISTRATION.md`:
- `frozenBeforeResultsInspected: true`
- The SHA-256 digest of this document is recorded in the `integrityDigests` field.

Until that registration is complete, this protocol is in DRAFT status and may be amended.

---

## 15. References

- `DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` — study charter
- `DRA-VAL-001B-REVIEWER-PROTOCOL.md` — reviewer independence rules
- `DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` — statistical plan
- `DRA-VAL-001F-PROTOCOL-REGISTRATION.md` — protocol registration record
