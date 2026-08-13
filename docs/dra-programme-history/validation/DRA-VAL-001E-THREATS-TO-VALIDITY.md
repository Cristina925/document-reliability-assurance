# DRA-VAL-001E — Bias and Threats to Validity Register

**Document Release Assurance — Version 1 Scientific Validation**

| Field | Value |
|-------|-------|
| Document ID | DRA-VAL-001E |
| Version | 1.0.0 |
| Status | DRAFT |
| Date | 2026-07-27 |
| Total threats registered | 17 |

---

## 1. Purpose

This register records all known threats to the scientific validity of the DRA-001 validation study. Every threat is assessed for likelihood, impact, and residual risk, and a mitigation measure is specified.

Threats are not listed to disqualify the study but to make its limitations explicit and navigable. Honest threat identification is a condition of scientific credibility.

---

## 2. Threat Record Schema

Each record contains:
- **ID:** TVR-NNN
- **Title:** Short label
- **Description:** What the threat is and why it compromises validity
- **Affected component(s):** Which part of the study is at risk
- **Likelihood:** LOW | MEDIUM | HIGH (probability of materialising)
- **Impact:** LOW | MEDIUM | HIGH (effect on validity if materialised)
- **Mitigation:** Specific countermeasure(s)
- **Residual risk:** LOW | MEDIUM | HIGH (remaining risk after mitigation)
- **Status:** OPEN | MITIGATED | ACCEPTED

---

## 3. Registered Threats

---

### TVR-001 — Founder-designed evaluator bias

**Description:** The evaluator was designed, implemented, and tested by the same team conducting the validation. This creates structural incentive to design validation conditions that favour the evaluator.

**Affected component:** Corpus design, comparison protocol, interpretation

**Likelihood:** HIGH

**Impact:** HIGH

**Mitigation:** The validation protocol is pre-registered and frozen before results are inspected. Independent reviewers assess documents without knowledge of the evaluator. The corpus design does not target documents expected to match evaluator strengths.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-002 — Founder-designed corpus risk

**Description:** Even with good intentions, the corpus designers may unconsciously select documents that align with the evaluator's known capabilities.

**Affected component:** Corpus selection

**Likelihood:** MEDIUM

**Impact:** HIGH

**Mitigation:** Corpus selection criteria are pre-registered. Domain quotas are fixed. Contamination controls prevent engineering-validation documents from appearing in the benchmark. An external corpus review is planned for the full validation corpus.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-003 — Synthetic-document bias

**Description:** AI-generated documents in the corpus may exhibit characteristic patterns that the evaluator — itself operating on rule-based pattern matching — detects more reliably than it detects issues in human-authored documents. This would inflate performance metrics on synthetic documents.

**Affected component:** Corpus composition, primary metrics

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:** Source-type is recorded for every document. All primary metrics are stratified by source type. Results on AI-generated, human-authored, and hybrid documents are reported separately.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-004 — Reviewer-selection bias

**Description:** Reviewers are recruited through the DRA programme's professional network. This may produce a systematically more thorough or more lenient reviewer pool than the target population of practitioners using the evaluator in production.

**Affected component:** Reviewer findings, adjudicated reference standard

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:** Reviewer eligibility criteria are pre-specified. Domain expertise requirements are documented. Reviewer inter-rater reliability metrics (MTR-009 through MTR-012) provide a partial check on reviewer consistency.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-005 — Domain-coverage imbalance

**Description:** The corpus contains nine domains but only 120 documents. Some domains have as few as 10 documents. Stratum-level conclusions from 10 documents will have wide confidence intervals and limited inferential value.

**Affected component:** Stratified analysis

**Likelihood:** HIGH

**Impact:** MEDIUM

**Mitigation:** Stratum results with fewer than 10 documents are flagged as imprecise. No directional interpretation is made from strata with insufficient sample sizes. The pilot corpus (20 documents) allows a preliminary sample-size assessment.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-006 — Low issue prevalence

**Description:** If the corpus contains many clean documents (no material issues), recall estimates will have high variance because the denominator (reference issue instances) will be small.

**Affected component:** Recall metrics (MTR-001, MTR-004)

**Likelihood:** LOW

**Impact:** MEDIUM

**Mitigation:** The corpus design targets at least 80% issue-bearing documents. Prevalence is monitored during corpus acquisition.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-007 — High issue prevalence

**Description:** If the corpus is dominated by issue-bearing documents with many issues, precision estimates may be artificially depressed (evaluator identifies many issues that partially match but are not full AGREED matches).

**Affected component:** Precision metrics (MTR-002, MTR-005)

**Likelihood:** LOW

**Impact:** MEDIUM

**Mitigation:** Clean-document inclusion target (≥20% clean). Difficulty strata are balanced. Prevalence is monitored.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-008 — Reviewer disagreement

**Description:** High inter-rater disagreement among reviewers reduces confidence in the adjudicated reference standard and limits the interpretability of comparison metrics.

**Affected component:** Adjudicated reference standard, all comparison metrics

**Likelihood:** MEDIUM

**Impact:** HIGH

**Mitigation:** Reviewer agreement metrics (MTR-009, MTR-010, MTR-011) are pre-registered and reported. The adjudication procedure convenes a third expert for material disagreements. Results with low inter-rater reliability are explicitly qualified in the interpretation.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-009 — Adjudicator bias

**Description:** The adjudicator resolving reviewer disagreements may have systematic tendencies (leniency, severity, domain familiarity) that bias the reference standard.

**Affected component:** Adjudicated reference standard

**Likelihood:** LOW

**Impact:** MEDIUM

**Mitigation:** Adjudicators must be independent and conflict-of-interest declared. Adjudicator decisions are recorded in full. The adjudication rate (MTR-012) provides a metric for how often adjudication was needed.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-010 — Taxonomy-induced matching bias

**Description:** The comparison uses the DRA evaluator's issue taxonomy (IC-1 through IC-9). Reviewers are asked to map their findings to this taxonomy. Reviewers may map findings differently from the evaluator, inflating false-positive or false-negative counts not because the evaluator is wrong but because the taxonomy is ambiguous.

**Affected component:** Class-level comparison (MTR-004, MTR-005)

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:** Reviewers receive a taxonomy guide before submission. Taxonomy mapping disagreements are recorded at the adjudication stage. INDETERMINATE findings are excluded from primary metrics and reported separately.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-011 — Evaluator overfitting

**Description:** The evaluator may have been implicitly optimised against the same types of documents used in the engineering-validation corpus, limiting its generalisation to novel documents.

**Affected component:** All evaluator performance metrics

**Likelihood:** MEDIUM

**Impact:** HIGH

**Mitigation:** Contamination controls exclude engineering-validation documents from the benchmark corpus. The benchmark corpus is drawn from the target population, not from engineering-validation sources.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-012 — Benchmark contamination

**Description:** One or more benchmark documents may inadvertently appear in the evaluator's design knowledge (as examples, fixtures, or test cases).

**Affected component:** Evaluator performance on contaminated documents

**Likelihood:** LOW

**Impact:** HIGH

**Mitigation:** Contamination check procedure (section 12 of DRA-VAL-001A) screens all documents against the engineering-validation corpus. Near-duplicate detection (≥50% overlap threshold for contamination) provides a systematic control.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-013 — Source-evidence quality variation

**Description:** The quality and completeness of the source evidence available to reviewers varies across documents. Reviewers with poor source evidence may under-identify issues, reducing the reference standard's sensitivity.

**Affected component:** Reviewer findings, adjudicated reference standard

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:** Source evidence availability is recorded as provenance metadata. Documents where source evidence is incomplete are excluded (EC-2). Source evidence quality is a potential covariate in sensitivity analysis.

**Residual risk:** LOW

**Status:** OPEN

---

### TVR-014 — Simulated-review contamination

**Description:** The DRA-001-07 engineering-validation corpus includes pre-defined simulated reviewer submissions. If anyone involved in the scientific validation has access to these fixtures, their expectations for what "good" reviewer output looks like may be biased.

**Affected component:** Reviewer protocol, reference standard

**Likelihood:** LOW

**Impact:** MEDIUM

**Mitigation:** The scientific validation uses independent human reviewers, not algorithmic simulation. The simulated reviewer fixtures (DRA-001-07) are explicitly designated as engineering-validation-only. Reviewers are not told what the engineering-validation reviewers found.

**Residual risk:** LOW

**Status:** MITIGATED

---

### TVR-015 — Small-sample uncertainty

**Description:** Even at 120 documents, confidence intervals for many stratified metrics will be wide. The study may be underpowered to detect differences across domains or source types.

**Affected component:** Stratified analysis, all metrics

**Likelihood:** HIGH

**Impact:** MEDIUM

**Mitigation:** Wide confidence intervals are flagged. No directional conclusions are made from strata with fewer than 10 documents. The pilot phase allows a sample-size reassessment before the full corpus is assembled.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-016 — Document confidentiality constraints

**Description:** Confidentiality requirements may prevent the full benchmark corpus from being published, limiting independent replication of the study.

**Affected component:** Study replicability, transparency

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:** Corpus provenance metadata is published. Document integrity digests allow integrity verification without revealing content. A subset of public-domain documents will be released for replication if possible.

**Residual risk:** MEDIUM

**Status:** OPEN

---

### TVR-017 — Selection effects from publicly available documents

**Description:** Documents drawn from public sources (standards, regulatory guidance, published reports) may differ systematically from documents the evaluator encounters in operational use (internal, proprietary, organisation-specific). Public documents tend to be better structured and more clearly referenced.

**Affected component:** Generalisability of results

**Likelihood:** HIGH

**Impact:** MEDIUM

**Mitigation:** The corpus includes both public-domain and partner-contributed proprietary documents (with appropriate permissions). Source type (public vs proprietary) is recorded in provenance metadata and is a potential covariate in analysis.

**Residual risk:** MEDIUM

**Status:** OPEN

---

## 4. Threat Summary

| Threat | Likelihood | Impact | Residual risk | Status |
|--------|------------|--------|---------------|--------|
| TVR-001 Founder-designed evaluator bias | HIGH | HIGH | MEDIUM | OPEN |
| TVR-002 Founder-designed corpus risk | MEDIUM | HIGH | MEDIUM | OPEN |
| TVR-003 Synthetic-document bias | MEDIUM | MEDIUM | LOW | OPEN |
| TVR-004 Reviewer-selection bias | MEDIUM | MEDIUM | MEDIUM | OPEN |
| TVR-005 Domain-coverage imbalance | HIGH | MEDIUM | MEDIUM | OPEN |
| TVR-006 Low issue prevalence | LOW | MEDIUM | LOW | OPEN |
| TVR-007 High issue prevalence | LOW | MEDIUM | LOW | OPEN |
| TVR-008 Reviewer disagreement | MEDIUM | HIGH | MEDIUM | OPEN |
| TVR-009 Adjudicator bias | LOW | MEDIUM | LOW | OPEN |
| TVR-010 Taxonomy-induced matching bias | MEDIUM | MEDIUM | MEDIUM | OPEN |
| TVR-011 Evaluator overfitting | MEDIUM | HIGH | MEDIUM | OPEN |
| TVR-012 Benchmark contamination | LOW | HIGH | LOW | OPEN |
| TVR-013 Source-evidence quality variation | MEDIUM | MEDIUM | LOW | OPEN |
| TVR-014 Simulated-review contamination | LOW | MEDIUM | LOW | MITIGATED |
| TVR-015 Small-sample uncertainty | HIGH | MEDIUM | MEDIUM | OPEN |
| TVR-016 Document confidentiality constraints | MEDIUM | MEDIUM | MEDIUM | OPEN |
| TVR-017 Selection effects from public documents | HIGH | MEDIUM | MEDIUM | OPEN |

**Total threats:** 17 | **Open:** 16 | **Mitigated:** 1 | **Accepted:** 0

---

## 5. Threat Review Schedule

The threat register must be reviewed:
- Before corpus freeze
- Before reviewer recruitment begins
- After pilot execution
- Before unsealing evaluator results
- In the final validation report

Threats whose status changes must be documented with an amendment record.
