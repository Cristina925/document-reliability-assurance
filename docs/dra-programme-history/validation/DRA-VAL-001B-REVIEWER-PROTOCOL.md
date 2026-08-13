# DRA-VAL-001B — Reviewer Independence and Adjudication Protocol

**Document Release Assurance — Version 1 Scientific Validation**

| Field | Value |
|-------|-------|
| Document ID | DRA-VAL-001B |
| Version | 1.0.0 |
| Status | DRAFT |
| Date | 2026-07-27 |

---

## 1. Purpose

This protocol defines the rules governing reviewer eligibility, assignment, blinding, submission, disagreement handling, adjudication, and withdrawal for the DRA-001 scientific validation benchmark.

The central principle is **reviewer independence**: every reviewer assesses the document and its source evidence without knowledge of what any other reviewer or the DRA evaluator has found. Evaluator results must remain sealed until all independent submissions are frozen.

---

## 2. Reviewer Eligibility

### 2.1 Minimum qualifications

A reviewer must:
- Have at least five years of professional experience in a domain relevant to the assigned document.
- Be able to demonstrate familiarity with the type of document being reviewed (compliance audit, risk assessment, policy document, etc.).
- Be able to assess the source evidence cited in the document (standards, regulations, clinical guidelines, etc.).

### 2.2 Domain expertise

Reviewers are assigned to documents in their domain of expertise where possible. Domain matching is the preferred assignment method. Where domain matching is not feasible, the assignment is recorded as a protocol deviation.

### 2.3 Conflict of interest

All reviewers must complete a conflict-of-interest (COI) declaration before assignment. The declaration covers:
- Financial relationships with the DRA programme or its operators
- Prior knowledge of the document's content or origin
- Prior access to the DRA evaluator or its outputs

Reviewers with an undisclosed or unresolved material conflict of interest are excluded.

### 2.4 Confidentiality

All reviewers must sign a confidentiality agreement before receiving documents. The agreement covers:
- The documents they review
- The source evidence provided
- Their own findings (until the study is published)

---

## 3. Reviewer Count

**Two independent reviewers are required per document.**

A document with fewer than two complete reviewer submissions is excluded from the primary analysis. Its exclusion is recorded.

No document proceeds to primary analysis on a single reviewer submission.

---

## 4. Reviewer Assignment

### 4.1 Assignment method

Reviewers are assigned to documents using domain matching. Each reviewer's domain expertise profile is matched against the document's domain, source type, and subject matter.

### 4.2 Maximum load

No single reviewer is assigned more than 15 documents. This limits the influence of any one reviewer's systematic tendencies on the corpus-wide results.

### 4.3 Assignment record

The assignment record for every document–reviewer pair is maintained in the study data repository. Assignments are made before documents are distributed and are not changed after distribution.

---

## 5. Reviewer Blinding

### 5.1 Blinding to evaluator output

Reviewers must not have access to any DRA evaluator output at any point before submitting their review. This includes:
- Issue lists
- Issue severity ratings
- Release decisions (SUPPORTED, REVIEW, HOLD)
- Rationale text
- Any intermediate or partial evaluator outputs

Evaluator results are stored in a sealed record. The seal is not broken until all reviewer submissions for the study are frozen.

### 5.2 Blinding to other reviewers

Reviewers must not discuss their findings with any other reviewer before submission. Pre-submission coordination is prohibited.

Each reviewer receives the document and its source evidence independently, without knowledge of who the other reviewer is for that document.

### 5.3 Blinding verification

Blinding is verified by:
- Logging reviewer access to the review system (access logs must not show evaluator result records)
- Requiring reviewers to confirm in writing before submission that they have not accessed evaluator outputs or discussed their findings with others

---

## 6. What Reviewers Receive

Each reviewer receives:
- The full text of the assigned document
- The source evidence cited in the document (standards, regulations, guidelines, or equivalent)
- The review submission form (as defined below)
- Study instructions (without any reference to the evaluator or its expected findings)

Reviewers do not receive:
- Any information about the DRA evaluator
- Any information about other reviewers assigned to the same document
- Any prior review findings for the document

---

## 7. Review Submission Requirements

Each reviewer must submit:

### 7.1 Issue log (independent)

For each material issue identified:
- Issue description (what the problem is)
- Location in document (section, clause, or page reference)
- Issue class (mapped to DRA IC-1 through IC-9 taxonomy)
- Severity (CRITICAL, SIGNIFICANT, or ADVISORY)
- Confidence level (HIGH, MEDIUM, or LOW — the reviewer's certainty about this finding)

Issues must be recorded independently. Reviewers must not aggregate multiple issues into a summary before submission.

### 7.2 Document-level release recommendation

Every reviewer must record a document-level release recommendation:
- **SUPPORTED** — no material issues; document may proceed.
- **REVIEW** — issues identified that require clarification or minor correction before release.
- **HOLD** — significant or critical issues that must be resolved before the document may proceed.

### 7.3 Uncertainty recording

Reviewers must record their overall confidence in their assessment:
- **HIGH** — confident in findings and recommendation
- **MEDIUM** — some uncertainty; findings may be incomplete
- **LOW** — significant uncertainty; findings may be substantially incomplete

---

## 8. Submission Deadline

Reviewers must submit their findings within **14 calendar days** of receiving the document.

Submissions received after the deadline are accepted only if a protocol deviation is recorded and the delay is documented with a justification.

---

## 9. What Distinguishes Reviewer Findings from Other Data

This study produces four distinct categories of findings for each document:

| Category | Definition |
|----------|-----------|
| **Individual reviewer findings** | The unmodified submission of a single reviewer |
| **Reviewer consensus** | The union or intersection of findings where both reviewers agree |
| **Adjudicated reference findings** | The output of the adjudication process — the authoritative reference for comparison |
| **Evaluator findings** | The DRA evaluator's output |

**Reviewer consensus must not be equated with the adjudicated reference standard.** The adjudicated reference standard is the output of the formal adjudication process described in section 11. Consensus (where two reviewers happen to agree) and adjudication (where a qualified third party resolves disagreement) are different things.

The term **adjudicated human reference standard** is used throughout this study for the authoritative per-document reference finding. The phrase "ground truth" is not used without explicit qualification.

---

## 10. Disagreement Handling

A material disagreement exists when:
- Reviewers reach different document-level release recommendations (e.g. SUPPORTED vs HOLD; SUPPORTED vs REVIEW; REVIEW vs HOLD), **or**
- Reviewers identify non-overlapping issue classes where the difference would affect the release recommendation, **or**
- One reviewer identifies at least one CRITICAL or SIGNIFICANT issue that the other reviewer does not.

Non-material disagreements (e.g. two reviewers both recommend REVIEW but list partially different ADVISORY issues) are recorded but do not trigger adjudication.

All disagreements — material and non-material — are recorded in the study data.

---

## 11. Adjudication Procedure

### 11.1 Trigger

A third adjudicator is convened when a material disagreement is identified (section 10).

### 11.2 Adjudicator independence

The adjudicator must:
- Be independent of the DRA development team
- Not be one of the original reviewers for the document
- Have domain expertise at least equivalent to the original reviewers
- Complete a conflict-of-interest declaration before adjudication

### 11.3 What the adjudicator receives

The adjudicator receives:
- The full document text and source evidence
- Both reviewer submissions (in anonymised form where practical)
- The specific points of disagreement

The adjudicator does not receive:
- Any evaluator output (which remains sealed)
- Any indication of which reviewer's view is "preferred"

### 11.4 Adjudicator output

The adjudicator produces:
- A set of adjudicated issue findings (with class, severity, and confidence)
- An adjudicated release recommendation
- A rationale for the decision
- Any areas of residual uncertainty

This output constitutes the **adjudicated human reference standard** for the document.

---

## 12. Reviewer Withdrawal

A reviewer may withdraw from the study at any point. Withdrawal reasons are recorded (medical, professional obligation, conflict of interest discovered, etc.).

When a reviewer withdraws before submitting findings:
- A replacement reviewer is assigned if the withdrawal occurs before the submission deadline.
- The replacement assignment is recorded as a protocol amendment (reason: REVIEWER_REPLACEMENT).
- The replacement reviewer has the full 14-day submission window.

When a reviewer withdraws after submitting findings:
- The submitted findings are retained if the reviewer consents to their continued use.
- If the reviewer does not consent, the document is treated as having only one reviewer submission and is excluded from the primary analysis.

---

## 13. Missing Review Handling

A missing review occurs when a reviewer fails to submit within the deadline and does not formally withdraw.

Procedure:
1. A reminder is sent at day 10.
2. A final reminder is sent at day 13.
3. On day 15, the review is classified as missing.
4. A replacement reviewer is assigned if the corpus freeze deadline allows.
5. If no replacement is possible, the document is noted for potential exclusion from the primary analysis.

The rate of missing reviews is reported as a study metric.

---

## 14. Protocol Deviation Recording

Any deviation from this protocol is recorded in the protocol deviation log with:
- Date
- Affected document(s) or reviewer(s)
- Nature of the deviation
- Reason
- Impact assessment
- Classification (MINOR or MAJOR)
- Corrective action taken

Protocol deviations are reported in full in the validation report. Major deviations that affect corpus completeness or reviewer independence are classified in the analysis.

---

## 15. References

- `DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` — study charter
- `DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` — corpus protocol
- `DRA-VAL-001C-COMPARISON-PROTOCOL.md` — comparison protocol (frozen before unsealing)
- `DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` — statistical plan
