# DRA-GEN-001 — Statistical Erratum

**Status:** Publication-layer erratum. **This document does not modify, replace, rewrite, or regenerate the digest of any historical GEN-001 evidence artefact.** The two affected reports remain byte-identical to their original contemporaneous form; this erratum exists solely to correct how one of their reported figures should be read and cited going forward.

**Issued:** 2026-08-12, as part of DRA-PUB-003A (Scientific and Statistical Manuscript Audit), following discovery of the error during that audit.

---

## 1. Affected historical artefacts and exact locations

| Artefact | Line(s) | Exact original statement |
|---|---|---|
| `docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md` | 163 | "`PIPELINE_COMPLETION_RATE` \| Successfully acquired documents \| 75 (the acquired subset) \| ... 75/75 = 1.000, rule-of-three upper bound on the failure rate ≤0.030 at n=75." |
| `docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md` | 164 | "`PROOF_INTEGRITY_RATE` \| Completed evaluations \| 75 \| Same scope limitation as above. 75/75 = 1.000, rule-of-three upper bound ≤0.030 at n=75." |
| `docs/dra/DRA-GEN-001-PHASE-2-BLIND-EXECUTION-REPORT.md` | 129 | "`PIPELINE_COMPLETION_RATE` \| 75/75 \| 1.000 \| [0.951, 1.000] (rule-of-three upper bound on the complementary failure rate: ≤0.030 at n=75)" |
| `docs/dra/DRA-GEN-001-PHASE-2-BLIND-EXECUTION-REPORT.md` | 130 | "`PROOF_INTEGRITY_RATE` \| 75/75 \| 1.000 \| [0.951, 1.000] (rule-of-three: ≤0.030 at n=75)" |
| `docs/dra/DRA-GEN-001-PHASE-2-BLIND-EXECUTION-REPORT.md` | 153 | "`DETERMINISM_REPEATABILITY_RATE` \| 75/75 = 1.000, [0.951, 1.000] (rule-of-three: ≤0.030 at n=75)" |

All five locations report the same underlying quantity — the rule-of-three approximate upper bound on the complementary failure rate for a 75/75 (zero-failure) result at n=75 — as **≤0.030 (3.0%)**.

## 2. Original reported value

**≤0.030, i.e. ≤3.0%**, at n=75, for each of `PIPELINE_COMPLETION_RATE`, `PROOF_INTEGRITY_RATE`, and `DETERMINISM_REPEATABILITY_RATE`.

## 3. Corrected value

**≤0.04, i.e. ≤4.0%**, at n=75, for the same three rates.

## 4. Calculation

The conventional "rule of three" approximates the upper bound of a 95% confidence interval for a proportion when zero events are observed in `n` trials as:

```
upper bound ≈ 3 / n
```

For zero observed failures among 75 evaluated documents:

```
3 / 75 = 0.04 = 4.0%
```

Therefore the correct rule-of-three approximate 95% upper bound on the failure rate at n=75 is **≤4.0%**, not ≤3.0%.

This is independently corroborated by the properly-computed Wilson score interval already present alongside the erroneous figure in `DRA-GEN-001-PHASE-2-BLIND-EXECUTION-REPORT.md` itself: for x=75 successes out of n=75 (p̂=1, z=1.96), the Wilson interval is `[0.951, 1.000]`, i.e. an upper failure-rate bound of ≈4.9% — consistent with (and slightly more conservative than) the corrected 4.0% rule-of-three approximation, and inconsistent with the original, erroneous 3.0% figure.

## 5. Why the original value was incorrect

`3/100 = 0.03 = 3.0%` is the correct rule-of-three bound for `MATERIAL_FAILURE_RATE`, which is separately measured at n=100 in the same reports. The evidence indicates the 0.030 figure computed for that n=100 quantity was carried over unchanged to the three n=75 quantities (`PIPELINE_COMPLETION_RATE`, `PROOF_INTEGRITY_RATE`, `DETERMINISM_REPEATABILITY_RATE`) without being recalculated for the smaller denominator. This is a copy-forward arithmetic error, not a difference in method or a deliberate rounding convention.

## 6. Effect on GEN-001 findings

This correction is a **confidence-interval labelling correction only**. It does not change, and this erratum makes no claim to change, any of the following:

- **Decisions:** the 75 evaluated documents' individual decisions (64 `SUPPORTED`, 10 `HOLD`, 1 `REVIEW`) are unaffected — these are exact counts, not interval estimates.
- **Verdict:** GEN-001's preserved verdict, `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`, is unaffected.
- **Exclusion:** the exclusion of the 25-document English-HTML stratum under `EXTERNAL_ACQUISITION_FAILURE` is unaffected; it is a categorical, protocol-defined exclusion, not a statistical estimate.
- **Evaluator results:** no evaluator output, decision, or issue-class observation changes.
- **Proof receipts:** no proof receipt, receipt digest, or `verifyReceiptIntegrity` result changes.
- **Digests:** no frozen manifest digest, aggregate digest, or corpus/evaluator identity digest changes. Neither historical report's own bytes, nor any digest computed over them, is touched by this erratum.
- **Substantive study conclusion:** the underlying fact the bound describes — zero observed failures across all 75 evaluated documents on pipeline completion, proof integrity, and determinism repeatability — is unchanged. Only the width of the approximate confidence bound placed around that zero-failure observation is corrected (from ≤3.0% to ≤4.0%), and even that correction moves the bound to be *more conservative* (wider), not less.

**Values confirmed to remain correct and unchanged:**

- The n=100 rule-of-three value for `MATERIAL_FAILURE_RATE` (**≤3.0%**) is arithmetically correct (`3/100 = 0.03`) and requires no correction.
- The DRA-VAL-002 n=25 rule-of-three value (**≤12%**) is arithmetically correct (`3/25 = 0.12`) and requires no correction.
- No study denominator (75, 100, or 25) is changed by this erratum.
- DRA-GEN-001 and DRA-VAL-002 remain two separate, non-pooled studies with their own independent denominators, exclusions, and confidence intervals, exactly as before.

## 7. Preservation of evidence identity

This erratum is a **later, interpretive, publication-layer correction**. It is issued outside, and subsequent to, the original GEN-001 study record, and it does not alter the historical evidence artefacts in any way:

- `docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md` and `docs/dra/DRA-GEN-001-PHASE-2-BLIND-EXECUTION-REPORT.md` remain **unmodified**, byte-for-byte, as the original contemporaneous study record. Their file digests are unchanged because their file contents are unchanged.
- No frozen manifest, freeze receipt, proof receipt, or aggregate/canonical digest anywhere in the repository is regenerated, recomputed, or altered as a consequence of this erratum.
- The reports are not replaced, rewritten, deprecated, or superseded by this erratum — they remain the authoritative primary record of what GEN-001 reported at the time, including this specific error, exactly as it originally appeared. This erratum supplements that record for citation purposes; it does not supersede it.
- Any publication-facing document that cites the affected 75/75 confidence bound should cite this erratum alongside (or instead of) the raw historical figure. See Section 8.

## 8. Citation guidance

When citing the GEN-001 75/75 operational-reliability confidence bound in any publication-facing document, use:

> "75/75 = 100% (Wilson 95% CI [95.1%, 100%]; rule-of-three approximation ≤4.0% at n=75 — see `DRA-GEN-001-STATISTICAL-ERRATUM.md` for the correction of an arithmetic error in the original GEN-001 reports, which stated ≤3.0%)."

`docs/dra/DRA-PUB-003-MANUSCRIPT.md` already cites the corrected figure directly (Section 8 and Table 3), as recorded in Section 9 below.

## 9. Disposition

`docs/dra/DRA-PUB-003-MANUSCRIPT.md` has already been corrected to state the accurate figure (Wilson 95% CI `[95.1%, 100%]`; rule-of-three ≤4.0% at n=75) in both its Section 8 body text and Table 3, as part of DRA-PUB-003A. This erratum is the canonical record explaining that correction and its relationship to the historical GEN-001 reports, and is the reference publication-facing documents should point to when the affected statistic is cited.
