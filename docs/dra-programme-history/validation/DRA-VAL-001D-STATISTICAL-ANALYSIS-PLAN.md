# DRA-VAL-001D — Statistical Analysis Plan

**Document Release Assurance — Version 1 Scientific Validation**

| Field | Value |
|-------|-------|
| Document ID | DRA-VAL-001D |
| Version | 1.0.0 |
| Status | DRAFT |
| **Seal status** | **Must be frozen before evaluator results are unsealed** |
| Date | 2026-07-27 |

---

## 1. Purpose

This Statistical Analysis Plan (SAP) pre-registers every metric, stratum, interpretation rule, and edge-case handling procedure used in the DRA-001 validation analysis.

The SAP must be frozen before evaluator results are unsealed. Post-result metric additions or changes to handling procedures are categorically prohibited without a recorded protocol amendment filed before unsealing.

---

## 2. No Arbitrary Success Thresholds

This plan does not prescribe arbitrary numerical thresholds as proof of commercial readiness, production suitability, or regulatory compliance.

Metrics are defined and computed. Results are reported with confidence intervals. Interpretation bands (section 9) are descriptive, not prescriptive.

Conclusions must consider:
- Confidence interval width (not only the point estimate)
- Corpus composition (domain, source type, difficulty distribution)
- Reviewer inter-rater reliability
- Protocol deviation rate

---

## 3. Primary Evaluation Metrics

### MTR-001 — Issue-instance recall (INSTANCE granularity)

**Numerator:** Number of reference issue instances for which a corresponding evaluator finding is AGREED (full or partial match).
**Denominator:** Total issue instances in the adjudicated human reference standard across all evaluated documents.
**Zero-denominator policy:** Report as undefined (N/A) with a note that no reference issues were identified. This applies per-document; corpus-level is always computable given a non-empty corpus.
**Confidence interval:** 95% CI using the Wilson score interval for proportions.

---

### MTR-002 — Issue-instance precision (INSTANCE granularity)

**Numerator:** Number of evaluator issue instances that are AGREED (full or partial match) with a reference finding.
**Denominator:** Total evaluator issue instances across all evaluated documents.
**Zero-denominator policy:** Report as undefined (N/A) with a note that the evaluator identified no instances. Reported per-document and at corpus level.
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-003 — Issue-instance F1 (INSTANCE granularity)

**Formula:** 2 × (precision × recall) / (precision + recall)
**Zero-denominator policy:** Report as undefined when both precision and recall are undefined; otherwise use defined values.
**Confidence interval:** 95% CI using bootstrap (1,000 samples).

---

### MTR-004 — Issue-class recall (CLASS granularity)

**Numerator:** Number of (document, IC-N) pairs classified as AGREED across the corpus.
**Denominator:** Total (document, IC-N) pairs in the adjudicated reference standard.
**Zero-denominator policy:** Report as undefined per document when the document has no reference issues. Corpus-level is always computable.
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-005 — Issue-class precision (CLASS granularity)

**Numerator:** Number of (document, IC-N) pairs classified as AGREED.
**Denominator:** Total (document, IC-N) pairs flagged by the evaluator.
**Zero-denominator policy:** Report as undefined per document when the evaluator identifies no classes. Corpus-level is always computable given a non-empty corpus.
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-006 — Document-level decision agreement (DOCUMENT granularity)

**Numerator:** Number of documents where the evaluator decision matches the adjudicated reference recommendation.
**Denominator:** Total evaluated documents with a valid adjudicated reference.
**Zero-denominator policy:** Report as undefined if no documents have valid adjudicated references (study-level failure condition).
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-007 — Evaluator false-positive count (CORPUS granularity)

**Definition:** Number of EVALUATOR_ONLY (document, IC-N) pairs across the corpus.
**Reported as:** Count and proportion of total evaluator-flagged classes.
**Confidence interval:** 95% CI on the proportion using the Wilson score interval.

---

### MTR-008 — Evaluator false-negative count (CORPUS granularity)

**Definition:** Number of REVIEWER_ONLY (document, IC-N) pairs across the corpus.
**Reported as:** Count and proportion of total reference classes.
**Confidence interval:** 95% CI on the proportion using the Wilson score interval.

---

## 4. Reviewer Reliability Metrics

### MTR-009 — Reviewer issue-class agreement rate (REVIEWER granularity)

**Numerator:** Number of (document, IC-N) pairs where both reviewers independently identify the class.
**Denominator:** Total (document, IC-N) pairs identified by at least one reviewer.
**Zero-denominator policy:** Report as undefined for documents where neither reviewer identifies any issue.
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-010 — Reviewer decision agreement rate (REVIEWER granularity)

**Numerator:** Number of documents where both reviewers reach the same release recommendation.
**Denominator:** Total documents with two complete reviewer submissions.
**Zero-denominator policy:** Report as undefined if no complete reviewer pairs exist.
**Confidence interval:** 95% CI using the Wilson score interval.

---

### MTR-011 — Cohen's kappa for document-level decision agreement (REVIEWER granularity)

**Method:** Cohen's kappa for ordinal agreement (SUPPORTED < REVIEW < HOLD), two raters.
**Zero-denominator policy:** Report as undefined if there is no variance in ratings.
**Interpretation note:** Kappa is reported alongside the raw agreement rate. Results must not be interpreted solely from kappa without the underlying confusion matrix.

---

### MTR-012 — Adjudication rate (REVIEWER granularity)

**Definition:** Proportion of documents where a material disagreement triggered adjudication.
**Reported as:** Count and proportion.
**Interpretation:** High adjudication rates indicate low reviewer reliability and should be flagged in the interpretation section.

---

## 5. Stratified Analysis

All primary metrics (MTR-001 through MTR-008) are computed for the full corpus and for each of the following strata:

| Stratum | Values |
|---------|--------|
| Domain | Legal, Healthcare, Finance, Cybersecurity, Business, Procurement, HR, Public policy, General |
| Source type | AI-generated, Human-authored, Hybrid |
| Difficulty | LOW, MEDIUM, HIGH |
| Document length | SHORT (200–1,000 words), MEDIUM (1,001–5,000), LONG (5,001–50,000) |
| Issue class | IC-1 through IC-9 (for class-level metrics) |
| Reviewer expertise | Domain-matched vs non-domain-matched reviewers |
| Document type | Clean (no reference issues) vs issue-bearing |

Where a stratum contains fewer than 10 documents, the stratum result is reported with a flag indicating low sample size and no interpretation is made from it alone.

---

## 6. Handling Missing and Excluded Data

### 6.1 Missing reviewer submissions

Documents with fewer than two complete reviewer submissions are excluded from the primary analysis. Their exclusion is recorded. A sensitivity analysis is reported that includes these documents using single-reviewer data, noted separately.

### 6.2 Excluded documents

Documents excluded for corpus or protocol reasons are listed in the exclusion register. Exclusions after freeze are recorded as protocol deviations.

### 6.3 Withdrawn documents

Withdrawn documents are excluded. Their withdrawal is recorded and counted in the protocol deviation log.

### 6.4 INDETERMINATE findings

INDETERMINATE findings are excluded from recall and precision computations. The count of INDETERMINATE findings is reported. If the INDETERMINATE rate exceeds 5% of total reference findings, a sensitivity analysis is reported.

### 6.5 Protocol deviations

Protocol deviations are categorised as MINOR or MAJOR.
- MINOR deviations: reported but do not affect the primary analysis.
- MAJOR deviations: reported and a sensitivity analysis is conducted excluding the affected documents.

---

## 7. Uncertainty Reporting

Every metric result must be reported with:
- **Numerator and denominator** (explicit, not implied)
- **Point estimate**
- **95% confidence interval** (method specified per metric)
- **Sample size** (N documents, M issue instances/classes)

No claim may be made based solely on a point estimate. Where confidence intervals are wide (width > 0.2), the result is flagged as imprecise and no directional interpretation is made.

No significance claims are made where sample sizes are inadequate. The word "significant" is not used in the sense of statistical significance without reporting the exact p-value, test statistic, and sample size.

---

## 8. Interpretation Approach

### 8.1 Required considerations

Every interpretation must address:
1. Confidence interval width: is the interval narrow enough to support a conclusion?
2. Corpus composition: are the results driven by a single domain or difficulty stratum?
3. Reviewer reliability: does reviewer inter-rater agreement support the reference standard's reliability?
4. Protocol deviation rate: do deviations affect the reliability of results?

### 8.2 Permitted interpretation pattern

> "The evaluator identified [X]% (95% CI: [lower, upper]) of adjudicated issue classes across [N] documents. This estimate is [precise/imprecise] given the confidence interval width of [W]. Results varied by domain: [highest domain] showed the strongest alignment ([X]%, [CI]) while [lowest domain] showed the weakest ([X]%, [CI]). Reviewer inter-rater agreement was [X]% (kappa [K]), which [supports/limits] confidence in the reference standard."

### 8.3 Prohibited interpretation patterns

- Stating a metric is "good", "acceptable", or "passing" without reference to confidence intervals.
- Comparing results to a fixed threshold as proof of commercial readiness.
- Concluding the evaluator "works" or "doesn't work" without specifying the context.
- Ignoring domains or strata with low sample sizes.

---

## 9. Descriptive Interpretation Bands

These bands are descriptive, not pass/fail thresholds.

| Band | Recall (class level) | Interpretation |
|------|---------------------|----------------|
| Very low | 0–0.30 | Evaluator detects fewer than one-third of reference issue classes; substantial under-detection indicated. |
| Low | 0.30–0.50 | Evaluator detects under half; notable under-detection. |
| Moderate | 0.50–0.70 | Evaluator detects over half; meaningful alignment. |
| High | 0.70–0.85 | Evaluator detects most reference classes; strong alignment in this context. |
| Very high | 0.85–1.0 | Near-complete detection; interpret carefully for corpus contamination or difficulty skew. |

These bands do not constitute certification. They are reference points for discussion only.

---

## 10. Reporting Requirements

The validation report must include:
- All primary metrics (MTR-001 through MTR-008) with numerators, denominators, and 95% CIs
- All reviewer reliability metrics (MTR-009 through MTR-012)
- All stratified results (section 5)
- Exclusion register (counts and reasons)
- Protocol deviation log
- Sensitivity analyses where required
- Full methodology description sufficient for independent replication

---

## 11. Protocol Freeze Confirmation

This SAP is frozen when recorded in `DRA-VAL-001F-PROTOCOL-REGISTRATION.md` with `noResultsInspected: true` and this document's SHA-256 digest registered.

---

## 12. References

- `DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` — study charter
- `DRA-VAL-001C-COMPARISON-PROTOCOL.md` — comparison protocol
- `DRA-VAL-001F-PROTOCOL-REGISTRATION.md` — registration record
