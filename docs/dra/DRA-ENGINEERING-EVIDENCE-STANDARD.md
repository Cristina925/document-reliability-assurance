# DRA Engineering Evidence Standard

**Document identifier:** DRA-EES-001  
**Status:** ACTIVE — AUTHORITATIVE  
**Version:** 1.0  
**Established:** DRA-001-CONS-001 (Programme Artefact Consolidation)  
**Programme:** DRA-001 — Document Release Assurance, Version 1

> **Governance clarification (added by DRA-PUB-006):** This document's `ACTIVE — AUTHORITATIVE` status describes its continued role as the operative engineering-evidence standard; it is not a claim that DRA-001's originally-specified scope (see `DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md`, now `HISTORICAL — SUPERSEDED AS PROGRAMME AUTHORITY`) remains the normative description of the published DRA-GC-1 research state. See `docs/dra/DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md` for the full governance record.

---

## 1. Purpose

This document defines the engineering evidence standard for DRA-001. It governs how engineering milestones are reported, what evidence must accompany each milestone completion, what constitutes PASS / PARTIAL / FAIL, and how reproducibility is confirmed.

All engineering milestones defined in DRA-001-13 must comply with this standard. A milestone is not complete until its evidence package satisfies this standard.

---

## 2. Engineering Milestone Lifecycle

Each DRA engineering milestone passes through the following lifecycle states:

| State | Description |
|---|---|
| PENDING | Milestone defined; predecessor milestones not yet complete. |
| READY | All predecessor milestones complete; milestone may begin. |
| IN PROGRESS | Implementation work underway. |
| EVIDENCE REQUIRED | Implementation complete; evidence package being assembled. |
| COMPLETE | Evidence package satisfies this standard; milestone closed. |
| SUPERSEDED | Milestone replaced or absorbed by a later milestone. |

A milestone moves from IN PROGRESS to EVIDENCE REQUIRED when the implementation work is done. It moves from EVIDENCE REQUIRED to COMPLETE when the evidence package is produced and the milestone result is PASS or PARTIAL. A FAIL result returns the milestone to IN PROGRESS.

---

## 3. Completion Report Requirements

Every completed milestone must produce a completion report. The completion report is the primary record that a milestone was executed.

A completion report must contain:

### 3.1 Identification

- Milestone identifier (e.g. DRA-ENG-003).
- Milestone name.
- Date of completion (UTC).
- Git commit identifier at the time of completion.
- Branch and repository URL.

### 3.2 Objective Summary

One paragraph stating what the milestone was intended to achieve.

### 3.3 Work Performed

A description of the implementation work performed. This section must be factual and specific — it must describe what was actually done, not what was planned.

### 3.4 Evidence Package

A list of all evidence items produced, with their types and locations (file paths or commit references).

### 3.5 Validation Results

The exact results of all validation steps executed (see §5 below). Results must include raw counts — pass, fail, total — not summaries.

### 3.6 Milestone Result

One of: PASS / PARTIAL / FAIL (see §6 below).

### 3.7 Issues and Deviations

Any protocol deviations, unexpected findings, or open issues discovered during milestone execution. If none, state explicitly: "No deviations. No open issues."

### 3.8 Next Milestone

The identifier and name of the next milestone in the backlog.

---

## 4. Engineering Evidence Requirements

The following evidence categories apply to DRA engineering milestones. Each milestone must produce the evidence required for its type.

### 4.1 Implementation milestones (code produced)

| Evidence item | Required |
|---|---|
| Source code committed to repository | Mandatory |
| TypeScript compilation: zero errors | Mandatory |
| Lint: zero errors (warnings permitted) | Mandatory |
| Unit test results (pass/fail/total) | Mandatory |
| Coverage report (line and branch) | Recommended |
| API surface description (for public API milestones) | Mandatory for DRA-ENG-011 |

### 4.2 Verification milestones

| Evidence item | Required |
|---|---|
| Test suite execution transcript | Mandatory |
| Pass count, fail count, total count | Mandatory |
| Zero failures confirmation | Mandatory |
| Issue class coverage confirmation (for component/E2E) | Mandatory |
| Regression suite results (for DRA-ENG-015) | Mandatory |

### 4.3 Benchmark milestones

| Evidence item | Required |
|---|---|
| Corpus manifest with SHA-256 hashes | Mandatory |
| Frozen baseline assessments (one per corpus document) | Mandatory |
| Frozen evaluator proof receipts (one per corpus document) | Mandatory |
| Comparison workbooks (one per corpus document) | Mandatory |
| Adjudication records (one per corpus document) | Mandatory |
| Protocol deviation log | Mandatory |
| Evidence synthesis report | Mandatory |

### 4.4 Analytical milestones (no code produced)

| Evidence item | Required |
|---|---|
| Written baseline report | Mandatory |
| Repository state description (relevant paths and files) | Mandatory |
| Identified gaps and reuse opportunities | Mandatory |
| Commit identifier at time of report | Mandatory |

---

## 5. Validation Reporting

Validation results must be reported with exact counts. The following formats are required:

**Test results:**
```
Tests: <pass> passed, <fail> failed, <total> total
TypeScript: <error count> errors
Lint: <error count> errors, <warning count> warnings
```

If any test fails, the specific failing tests must be listed with their error messages.

If TypeScript compilation produces errors, the errors must be quoted verbatim.

Validation results must not be summarised as "all tests pass" without the supporting counts. Counts are the evidence; summaries are not.

---

## 6. PASS / PARTIAL / FAIL Rules

### PASS

All of the following are true:

- All required evidence items are present and complete.
- TypeScript compilation: zero errors.
- All tests pass (zero failures) for verification milestones.
- No open defects at blocking severity.
- The milestone objective was fully achieved.
- No required protocol step was skipped.

### PARTIAL

One or more of the following apply, but no FAIL condition is present:

- One or more evidence items are present but incomplete (e.g. coverage report not produced for an implementation milestone).
- Minor test failures in non-blocking test categories.
- The milestone objective was substantially achieved with documented exceptions.
- Non-blocking protocol deviations were recorded.

A PARTIAL result requires a written explanation of what was not achieved and what the remediation plan is. A PARTIAL milestone may be closed if the incomplete items do not block the next milestone.

### FAIL

One or more of the following apply:

- A required evidence item is absent.
- TypeScript compilation errors are present.
- Test failures exist in a verification milestone.
- A blocking defect is open.
- The milestone objective was not achieved.
- A required protocol step was skipped without documented justification.

A FAIL result returns the milestone to IN PROGRESS. A new completion report must be produced when the milestone is re-attempted.

---

## 7. Version and Commit Recording

Every completion report must record:

- The Git commit SHA at the time of completion (full 40-character SHA preferred; minimum 7-character short SHA).
- The branch name.
- Whether the commit is on the main branch or a feature branch.
- Whether the commit has been merged.

Milestone results are anchored to specific commits. If a subsequent commit alters the implementation, the milestone result remains anchored to the original commit; the new commit must be noted separately.

---

## 8. Reproducibility Requirements

All DRA engineering milestones must be reproducible from their completion commit.

Reproducibility means: given the commit identifier and the instructions in the completion report, a person with access to the repository and the standard toolchain (Node.js, pnpm, TypeScript) can reproduce the validation results independently.

To confirm reproducibility, the completion report must include:

1. The exact command(s) to build and test the implementation:
   ```
   pnpm install
   pnpm typecheck
   pnpm test
   ```
2. The expected output (pass counts, zero errors).
3. Confirmation that the commands were executed and produced the stated results at the recorded commit.

If any step requires environment-specific configuration, that configuration must be documented.

---

## 9. Normative References

1. DRA-001 — Version 1 Programme Specification (this repository).
2. DRA-001-13 — Version 1 Authoritative Engineering Backlog (this repository).
3. DRA Verification and Benchmark Protocol (this repository).

---

*Established by DRA-001-CONS-001 — Programme Artefact Consolidation.*
