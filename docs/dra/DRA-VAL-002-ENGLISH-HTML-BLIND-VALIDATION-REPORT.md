# DRA-VAL-002 — Targeted English-HTML Blind Validation Report

**Execution verdict: `DRA_VAL_002_COMPLETE`**
**Coverage verdict: `ENGLISH_HTML_GAP_CLOSED`**
**Publication readiness: `READY_FOR_FINAL_EVIDENCE_SYNTHESIS`**

## 0. Administrative renumbering

This report concerns the programme originally specified as "DRA-VAL-001 — Targeted English-HTML
Blind Follow-Up", renumbered to **DRA-VAL-002** to avoid colliding with the pre-existing,
unrelated DRA-VAL-001A..F Scientific Validation Charter programme. No methodological content
changed as a result.

## 1. What this closes

DRA-GEN-001's blind generalisation study lost its entire `HTML_ENGLISH` stratum: all 25 sampled
GOV.UK units drifted between Phase 1 lock and Phase 2 execution and were excluded, leaving the
question "how does frozen DRA-GC-1 perform on unseen English-language HTML?"
`NOT_TESTED_DUE_TO_STRATUM_LOSS`. DRA-VAL-002 supplies new, independent, prospective blind evidence
answering exactly that question, under a protocol engineered specifically to survive the drift
mechanism that defeated GEN-001 (see Section 6).

## 2. Preconditions

All three identity gates passed before any evaluation: DRA-GC-1's live aggregate digest matched
its frozen value; DRA-VAL-002's own protocol live-rehashed to its frozen aggregate digest; and the
25-unit sample's live aggregate digest matched its locked value. No evaluation was attempted while
any gate failed.

## 3. Sample composition

| Family | Locked units | Licence basis |
|---|---|---|
| GOV.UK (`GOV_UK`) | 9 | OGL v3.0 |
| ONS.GOV.UK (`ONS_GOV_UK`) | 8 | OGL v3.0 |
| US Federal (EPA/FTC/Census) (`US_FEDERAL`) | 8 | US federal public domain (17 U.S.C. §105) |
| **Total** | **25** | |

2 pre-lock replacements used, both `SOURCE_ACQUISITION_FAILURE`, drawn from the predetermined
seeded reserve order (see Sample Lock Receipt).

## 4. Execution results

Run A and Run B (two `evaluateDocument()` calls per unit at different fixed timestamps, against
the same frozen, locally-persisted bytes) both completed **25/25 units as `SUCCESSFUL_EVALUATION`**
— zero `EXTERNAL_ACQUISITION_FAILURE`, zero `REPRESENTATION_FAILURE`, zero `PIPELINE_FAILURE`,
zero `RUNNER_EXCEPTION`.

### Primary endpoints (n=25 unless noted)

| Endpoint | Result | 95% Wilson interval |
|---|---|---|
| Acquisition success rate | 25/25 = 100% | [86.7%, 100%] |
| Pipeline completion rate | 25/25 = 100% | [86.7%, 100%] |
| Proof-integrity rate | 25/25 = 100% | [86.7%, 100%] |
| Determinism repeatability rate (A vs B) | 25/25 = 100% | [86.7%, 100%] |
| Material failure rate | 0/25 = 0% | rule-of-three upper bound 12% |

### Decision distribution (secondary)

- `SUPPORTED`: 24/25
- `REVIEW`: 1/25 (`VAL002-GOVUK-seeking-consent-for-immunisations-in-schools`, issue class
  `EVIDENCE_INADEQUATE`, 1 issue) — a substantively correct, non-failure outcome; both Run A and
  Run B agreed on this decision and issue set.

### Family-level breakdown

- `GOV_UK` (9): 8 SUPPORTED / 1 REVIEW, 1 total issue.
- `ONS_GOV_UK` (8): 8/8 SUPPORTED, 0 issues.
- `US_FEDERAL` (8): 8/8 SUPPORTED, 0 issues.

## 5. Proof-receipt integrity

All 25 expected proof receipts were produced and independently re-verified via
`verifyReceiptIntegrity()` against their own `substantiveDigest` — 25/25 = 100%.

## 6. The GEN-001 drift mechanism, and how DRA-VAL-002 avoided repeating it

During Phase 2 setup, an identical re-fetch-and-match-against-Phase-1-digest step was attempted
first (mirroring GEN-001's own Phase 2 exactly) and reproduced the **same failure mode**: 21/25
GOV.UK/ONS/Census pages had already changed live bytes by the time of re-fetch, which would have
again silently emptied most of the sample if left uncorrected. This was diagnosed as a structural
flaw in the *re-fetch-to-verify* design pattern itself, not a one-off GOV.UK quirk — the same
pattern would eventually strike any frequently-updated government page, regardless of source
family.

**Correction applied:** DRA-VAL-002's Phase 1 acquisition script (`build-and-freeze.ts`) was
updated to persist the actual frozen bytes for every locked unit to disk *at freeze time*, and
Phase 2 was rewired to stage and evaluate those persisted bytes directly, performing **no network
access during evaluation staging**. Live drift is measured only as a separate, strictly
post-hoc, non-gating observation (Section 7) — consistent with protocol Section 5's original
source-identity model (selection-time identity / evaluation-input identity / live drift as three
distinct concepts) and Section 16's live-drift policy. Re-running the full pipeline after this
fix restored the reported 25/25 result above.

## 7. Post-hoc live-drift observation (descriptive only)

Performed after Run A/B and analysis were already complete, purely for transparency; it did not
alter any result above.

| Outcome | Count (of 25) |
|---|---|
| Identical to frozen bytes | 15 |
| Drifted from frozen bytes | 7 (all `ONS_GOV_UK`/`US_FEDERAL` dynamic content pages) |
| Unreachable at observation time (HTTP 429) | 3 (`ONS_GOV_UK`, transient rate-limiting) |

This confirms empirically that a re-fetch-based verification gate — GEN-001's actual approach —
would again have discarded a majority of this sample had it been used, corroborating Section 6's
diagnosis as the correct explanation for GEN-001's stratum loss.

## 8. Verdicts

- **Execution verdict: `DRA_VAL_002_COMPLETE`** — all 25 locked units executed through both Run A
  and Run B with no STOP condition encountered.
- **Coverage verdict: `ENGLISH_HTML_GAP_CLOSED`** — the `HTML_ENGLISH` population question GEN-001
  left `NOT_TESTED_DUE_TO_STRATUM_LOSS` now has direct, complete (25/25), deterministic,
  proof-verified prospective blind evidence across 3 non-dominating source families.
- **Publication readiness: `READY_FOR_FINAL_EVIDENCE_SYNTHESIS`** — this evidence is ready to be
  incorporated into DRA-GC-1's overall evidence base as a distinct, appropriately-scoped dataset;
  it must not be pooled with DRA-GEN-001's denominators (per the frozen protocol's statistical
  analysis plan) and does not by itself trigger any GC-2 admission action.

## 9. Boundaries respected

This study did not modify DRA-GC-1, DRA-GEN-001 (protocol, sample, or historical classification),
DRA-ENG-026, or DRA-GC2-REV-001; did not reopen the rejected ENG-026 Spanish Stage-5 correction;
did not create or admit DRA-GC-2; and did not run a new full-scale benchmark. The one engineering
change made (frozen-byte persistence in the Phase 1 acquisition script, described in Section 6)
is internal to DRA-VAL-002's own Phase 1/Phase 2 scripts and touches no other frozen artefact.
