# DRA-VAL-001 — Scientific Validation Charter

**Document Release Assurance — Version 1 — Independent Scientific Validation**

| Field | Value |
|-------|-------|
| Protocol ID | DRA-VAL-001A |
| Version | 1.0.0 |
| Status | DRAFT |
| Custodian | DRA Programme |
| Evaluator frozen at | DRA-EVALUATOR-V1-FROZEN |
| Date | 2026-07-27 |

---

## 1. Purpose and Scope

This charter defines the governance and scientific intent of the independent validation study for Document Release Assurance (DRA) Version 1.

The study assesses whether the frozen DRA Version 1 evaluator identifies material document-release issues found by independent human reviewers. It does not prove that the evaluator is commercially ready, safe for autonomous deployment, or suitable for any specific operational context.

The results of this study are evidence — one category of information among several that should inform decisions about the evaluator's fitness for use.

---

## 2. Separation of Engineering Validation and Scientific Validation

### 2.1 Engineering Validation

The DRA-001-07 corpus (six documents) and its simulated reviewer submissions are **engineering-validation fixtures only**.

They must not be represented as:
- independent scientific evidence
- human-review evidence
- statistical validation of evaluator effectiveness
- proof that the evaluator accurately identifies issues in real documents

Engineering-validation data exists to verify that the software implementation is functionally correct. It is not a sample drawn from the target population. The simulated reviewers are predetermined fixtures — not independent human assessment.

### 2.2 Scientific Validation

Scientific validation begins with this charter. It requires:
- a pre-registered protocol frozen before results are examined
- a heterogeneous benchmark corpus drawn from the target population
- independent human reviewers blinded to evaluator output
- a pre-registered comparison protocol
- a pre-registered statistical analysis plan
- transparent reporting of all outcomes including failure and inconclusive results

---

## 3. Primary Research Question

> **To what extent does the frozen Document Release Assurance Version 1 evaluator identify material document-release issues found by independent human reviewers across a predefined, heterogeneous benchmark corpus?**

This question is empirical and neutral. It does not presuppose a positive result.

---

## 4. Secondary Research Questions

**RQ-002:** At which issue classes does the evaluator perform best, and at which does it underperform relative to the adjudicated human reference standard?

**RQ-003:** How does evaluator performance vary across corpus domains (legal, healthcare, finance, technical, etc.)?

**RQ-004:** How does evaluator performance vary across document source types (AI-generated, human-authored, hybrid)?

**RQ-005:** How does evaluator performance vary across difficulty strata?

**RQ-006:** What is the level of inter-rater reliability among independent reviewers, and how does it affect the confidence of comparisons?

---

## 5. Study Objectives

1. Measure issue-class recall and precision relative to the adjudicated human reference standard.
2. Measure issue-instance recall and precision relative to the adjudicated human reference standard.
3. Measure document-level decision agreement between evaluator and reviewers.
4. Quantify evaluator false-positive and false-negative rates by issue class.
5. Measure reviewer inter-rater reliability (decision agreement, issue-class agreement, Cohen's kappa).
6. Identify domains, issue classes, and difficulty strata where evaluator performance is strongest and weakest.
7. Assess whether study results are sufficiently precise (narrow confidence intervals) to draw defensible conclusions.

---

## 6. Hypotheses

### H-001 (Primary)

The DRA Version 1 evaluator identifies a non-trivial proportion of issue classes identified by the adjudicated human reference standard across the benchmark corpus.

Supported by outcomes: SUPPORTED, PARTIALLY_SUPPORTED.

### H-002

Evaluator performance varies significantly across corpus domains, with higher recall in domains where training documents emphasise explicit authority references.

Supported by outcomes: SUPPORTED, PARTIALLY_SUPPORTED.

---

## 7. Null Hypotheses

### NH-001 (Primary null — for H-001)

There is no meaningful association between DRA Version 1 evaluator issue-class output and adjudicated human reviewer issue-class findings across the benchmark corpus.

### NH-002 (For H-002)

There is no meaningful difference in evaluator recall across corpus domains.

---

## 8. Unit of Analysis

The primary unit of analysis is the **individual document**.

Secondary units of analysis:
- issue class within a document (for class-level metrics)
- issue instance within a document (for instance-level metrics)
- document pair (for reviewer agreement metrics)

---

## 9. Intended Claims

Findings from this study may support the following types of claim (with appropriate confidence intervals and caveats):

**IC-1:** The DRA Version 1 evaluator identified [X]% (95% CI: [lower, upper]) of adjudicated issue classes across [N] benchmark documents.

**IC-2:** Evaluator precision at the issue-class level was [X]% (95% CI: [lower, upper]) across [N] benchmark documents.

**IC-3:** Document-level decision agreement between the evaluator and reviewers was [X]% (95% CI: [lower, upper]).

**IC-4:** The evaluator's performance varied across domains as described in the stratified analysis.

---

## 10. Prohibited Claims

Findings from this study must not be used to assert:

**PC-1:** The evaluator is suitable for unsupervised production use without human review oversight.

**PC-2:** The evaluator achieves the same performance as an experienced domain specialist.

**PC-3:** The evaluator has been validated for any specific operational context not represented in the benchmark corpus.

**PC-4:** A benchmark result above any numerical threshold constitutes proof of commercial readiness.

**PC-5:** The engineering-validation corpus (DRA-001-07) demonstrates the evaluator's scientific accuracy or population-level performance.

**PC-6:** The six DRA-001-07 simulated reviewer submissions constitute independent human review evidence.

---

## 11. Evaluation Boundaries

**EB-1:** This study does not assess evaluator performance on documents in languages other than English.

**EB-2:** This study does not assess evaluator performance on documents shorter than 200 words or longer than 50,000 words.

**EB-3:** This study does not assess the evaluator's suitability for legal, regulatory, or compliance decisions.

**EB-4:** This study does not assess whether the evaluator's issue taxonomy is complete or optimal.

**EB-5:** This study does not assess evaluator performance outside the nine corpus domains defined in the corpus design protocol.

**EB-6:** This study does not constitute certification, accreditation, or regulatory approval.

---

## 12. Permitted Outcomes

The study design explicitly accommodates all four outcomes:

| Outcome | Interpretation |
|---------|----------------|
| **SUPPORTED** | Results indicate meaningful alignment between evaluator and reviewer findings; confidence intervals are narrow enough to be informative. |
| **PARTIALLY_SUPPORTED** | Results indicate alignment in some domains or issue classes but not others; overall precision is limited. |
| **INCONCLUSIVE** | Results cannot distinguish evaluator performance from chance, or confidence intervals are too wide to be informative. |
| **NOT_SUPPORTED** | Results indicate no meaningful alignment between evaluator and reviewer findings. |

No outcome is structurally excluded. The study is not designed to produce a positive result.

---

## 13. Scientific Independence Requirements

### 13.1 Corpus independence

The benchmark corpus must not be selected to match expected evaluator capabilities. See `DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md`.

### 13.2 Reviewer independence

Reviewers must assess documents without access to evaluator output. Evaluator results must remain sealed until all independent submissions are frozen. See `DRA-VAL-001B-REVIEWER-PROTOCOL.md`.

### 13.3 Protocol pre-registration

The comparison protocol and statistical analysis plan must be frozen before evaluator results are unsealed. See `DRA-VAL-001C-COMPARISON-PROTOCOL.md` and `DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md`.

### 13.4 Amendment restrictions

No retrospective amendments to the comparison protocol or statistical analysis plan are permitted after results are inspected. All amendments must be filed before unsealing.

---

## 14. Success, Failure, and Inconclusive Criteria

### 14.1 Success criteria (for study completion, not evaluator approval)

A study run is considered complete and reportable when:
- At least 60 documents yield valid reviewer submissions (minimum scientific corpus)
- All pre-registered metrics can be computed with 95% confidence intervals
- Reviewer inter-rater reliability metrics are computable and reported
- All protocol deviations are documented

### 14.2 Failure criteria

A study run is considered failed when:
- Fewer than 60 documents yield valid reviewer submissions
- The corpus freeze process was not completed before evaluation
- Reviewers had access to evaluator output before submission

### 14.3 Inconclusive criteria

Results are classified inconclusive when:
- Confidence intervals for primary metrics are too wide to support any interpretation
- Reviewer inter-rater reliability is below an acceptable threshold
- The protocol deviation rate materially compromises comparability

---

## 15. References

- `DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` — corpus design and acquisition rules
- `DRA-VAL-001B-REVIEWER-PROTOCOL.md` — reviewer independence and adjudication rules
- `DRA-VAL-001C-COMPARISON-PROTOCOL.md` — pre-registered matching rules
- `DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` — pre-registered statistical methods
- `DRA-VAL-001E-THREATS-TO-VALIDITY.md` — registered threats
- `DRA-VAL-001F-PROTOCOL-REGISTRATION.md` — freeze record
- `DRA-VALIDATION-PROGRAMME-INDEX.md` — programme milestone index
