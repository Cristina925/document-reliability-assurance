# DRA-VAL-002 — Benchmark Result Review: DRA-DOC-0008

**Document:** Discipline and grievances at work: the Acas guide  
**Corpus ID:** DRA-DOC-0008 | **Freeze ID:** DRA-FRZ-000002  
**Blind evaluation decision:** HOLD  
**Review date:** 2026-08-04  
**Review test:** `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-val-002-result-review.test.ts`

---

## A. Claim Extraction Analysis

### Volume and proportionality

| Metric | Value |
|--------|-------|
| Total extracted statements | 3,013 |
| Guide text length | 164,726 chars |
| Average statement length | 49 chars |
| Minimum statement length | 3 chars |
| Maximum statement length | 87 chars |
| SpanRef coverage | 100% (3,013 / 3,013) |
| Linked to evidence | 0 / 3,013 |

**Assessment: the extraction count is not proportionate for the selected guide boundary.**

The guide PDF is a 164,726-character document covering the full breadth of ACAS disciplinary and grievance practice — far wider than the declared evaluation boundary of pages 18–25 ("Informing the employee" through "Allowing a worker to be accompanied"). The statement IDs use character-offset encoding (`s2:<start>:<end>`), and the span widths average 49 characters across the full 164,726-character document. This confirms that all 3,013 statements were extracted from the **entire normalised guide text**, not from the boundary section alone.

The boundary section (pages 18–25) covers roughly 8,000–12,000 characters of the 164,726-character document, or approximately 5–7% of the text. A proportionate extraction from that boundary alone would yield approximately 150–250 statements. The 3,013-statement figure is approximately 12–20 times higher than expected for the declared boundary, because the extractor processed the full document.

### Length distribution

| Band | Count | Interpretation |
|------|-------|----------------|
| < 20 chars | 549 (18%) | Headers, labels, page markers, partial words at extraction window boundaries |
| 20–49 chars | 911 (30%) | Short sentence fragments; many are incomplete clauses |
| 50–99 chars | 1,553 (52%) | Near-complete sentences; typical target window |
| 100–199 chars | 0 | None: the extractor appears to apply a hard cap below 100 chars |
| ≥ 200 chars | 0 | None |

### Statement types

**Over-fragmentation examples** (shortest statements — 3–14 chars):
- `[s2:0:14]` → `"Discipline and"` — document title fragment
- `[s2:15:28]` → `"Grievances at"` — document title fragment  
- `[s2:29:33]` → `"work"` — single word
- `[s2:34:48]` → `"The Acas guide"` — label
- `[s2:53:62]` → `"July 2020"` — metadata date
- `[s2:404:407]` → `"For"` — single word (article/preposition)
- `[s2:8896:8899]` → `"Any"` — single word
- `[s2:34505:34508]` → `"The"` — single word

These are clear over-fragmentation cases: the extractor is slicing text mechanically by character window, producing partial words, headers, and metadata tokens as standalone "claims."

**Correctly extracted statements** (50–87 chars, meaningful content):
- `"It may be useful to confirm in writing what has been decided."` (61 chars) — a complete procedural recommendation
- `"Employers must deal with these cases carefully."` (47 chars) — a complete obligation statement
- `"An employer must always act fairly in order to avoid a finding of unfair"` (72 chars) — a complete normative statement (truncated at boundary)
- `"representative who is not an employed official must have been certified by their"` (80 chars) — a clause from a statutory right statement
- `"To exercise the statutory right to be accompanied workers must make a"` (69 chars) — a statutory obligation

**Under-fragmentation examples** (longest — 85–87 chars):
- `"If it is not practical for witnesses to attend, consider proceeding if it is clear that…"` (87 chars) — one complete sentence, well-bounded
- `"If the offence is sufficiently serious, or if there is further misconduct or a failure…"` (86 chars) — complete conditional sentence at the cap

No genuine under-fragmentation is observed: the 87-char cap means no multi-sentence spans are produced. The concern is the opposite direction — over-fragmentation at the low end.

### Assessment

The claim extractor operates as a sliding character-window over the full document text. It does not semantically segment sentences, does not respect the declared page 18–25 boundary, and does not filter headers or metadata. The 3,013 claim count is technically accurate (it extracted that many spans) but is **not proportionate** for a boundary evaluation of ~8,000–12,000 characters. Approximately 2,800–2,850 of the 3,013 statements relate to content outside the declared evaluation boundary.

---

## B. Issue Analysis

### Summary

| Class | Severity | Count |
|-------|----------|-------|
| `EVIDENCE_INADEQUATE` | `ADVISORY` | 51 |
| `EVIDENCE_ABSENT` | `BLOCKING` | 13 |
| **Total** | | **64** |

**Issue explanation template observed:**
- ADVISORY: `"Statement has HIGH materiality but evidence is inadequate (evidence: NO_DOCUMENT_EVIDENCE; authority: <X>)."`
- BLOCKING: `"Statement has CRITICAL materiality but no documentary evidence (authority: DOCUMENT_AUTHOR, evidence: NO_DOCUMENT_EVIDENCE)."`

**Authority classifications seen in ADVISORY issues:**

| Authority value | Meaning | Frequency |
|----------------|---------|-----------|
| `DOCUMENT_AUTHOR` | Statement attributed to the document author | ~40 of 51 |
| `AMBIGUOUS_SOURCE` | Authority not clearly identified | ~5 of 51 |
| `EXPLICIT_NAMED_SOURCE` | Named external source (e.g. a specific Act) | ~3 of 51 |
| `STRUCTURALLY_INHERITED_SOURCE` | Authority inherited from document structure | ~3 of 51 |

All 64 issues share `evidence: NO_DOCUMENT_EVIDENCE` — meaning the evidence linkage stage found no passage in the Code text that could be associated with the affected statement.

### Complete issue list

| # | ID | Class | Sev. | Statement (truncated) |
|---|----|-------|------|-----------------------|
| 1 | issue-0001 | EVIDENCE_INADEQUATE | ADVISORY | "It may be useful to confirm in writing what has been decided." |
| 2 | issue-0002 | EVIDENCE_INADEQUATE | ADVISORY | "statement of employment particulars which must include a note about" |
| 3 | issue-0003 | EVIDENCE_INADEQUATE | ADVISORY | "(Guidance on what the written statement must" |
| 4 | issue-0004 | EVIDENCE_INADEQUATE | ADVISORY | "suspension is to be without pay, this must be provided for in the" |
| 5 | issue-0005 | EVIDENCE_INADEQUATE | ADVISORY | "disclosed as a disability, the employer must make reasonable adjustments to the" |
| 6 | issue-0006 | EVIDENCE_INADEQUATE | ADVISORY | "Employees must always receive their full pay and benefits during a period of" |
| **7** | **issue-0007** | **EVIDENCE_ABSENT** | **BLOCKING** | "breach of contract, or in extreme cases to resign and claim constructive" |
| 8 | issue-0008 | EVIDENCE_INADEQUATE | ADVISORY | "representative who is not an employed official must have been certified by their" |
| 9 | issue-0009 | EVIDENCE_INADEQUATE | ADVISORY | "Employers must agree to a" |
| 10 | issue-0010 | EVIDENCE_INADEQUATE | ADVISORY | "To exercise the statutory right to be accompanied workers must make a" |
| 11 | issue-0011 | EVIDENCE_INADEQUATE | ADVISORY | "hearing by the employer, the employer must postpone the hearing to a time" |
| 12 | issue-0012 | EVIDENCE_INADEQUATE | ADVISORY | "official must have been certified by their union as being competent to" |
| 13 | issue-0013 | EVIDENCE_INADEQUATE | ADVISORY | "Workers must make a reasonable request to their" |
| 14 | issue-0014 | EVIDENCE_INADEQUATE | ADVISORY | "An employer must" |
| 15 | issue-0015 | EVIDENCE_INADEQUATE | ADVISORY | "The companion must be allowed to address the hearing in order to:" |
| 16 | issue-0016 | EVIDENCE_INADEQUATE | ADVISORY | "The companion must also be allowed to confer with the worker during the" |
| **17** | **issue-0017** | **EVIDENCE_ABSENT** | **BLOCKING** | "however, not legally required to permit the companion to answer questions on" |
| 18 | issue-0018 | EVIDENCE_INADEQUATE | ADVISORY | "A decision to dismiss should only be taken by a manager who has the authority" |
| 19–21 | issue-0019–0021 | EVIDENCE_INADEQUATE | ADVISORY | (disciplinary decision / dismissal authority) |
| **22** | **issue-0022** | **EVIDENCE_ABSENT** | **BLOCKING** | "• deliberate and serious damage to property" |
| **23** | **issue-0023** | **EVIDENCE_ABSENT** | **BLOCKING** | "Employers are required by law to comply" |
| 24–25 | issue-0024–0025 | EVIDENCE_INADEQUATE | ADVISORY | (criminal offence context) |
| **26** | **issue-0026** | **EVIDENCE_ABSENT** | **BLOCKING** | "If an employee is charged with, or convicted of a criminal offence this is not" |
| **27** | **issue-0027** | **EVIDENCE_ABSENT** | **BLOCKING** | "or she has been charged with or convicted of a criminal offence." |
| **28** | **issue-0028** | **EVIDENCE_ABSENT** | **BLOCKING** | "the outcome of the criminal prosecution before taking fair and reasonable" |
| **29** | **issue-0029** | **EVIDENCE_ABSENT** | **BLOCKING** | "Where an employee, charged with or convicted of a criminal offence, refuses or" |
| **30** | **issue-0030** | **EVIDENCE_ABSENT** | **BLOCKING** | "An employee who has been charged with, or convicted of, a criminal offence may" |
| 31–37 | issue-0031–0037 | EVIDENCE_INADEQUATE | ADVISORY | (various: dismissal reasonableness, companion rights re-occurrence) |
| **38** | **issue-0038** | **EVIDENCE_ABSENT** | **BLOCKING** | "about an employer's legal obligations, such as payment of the National Minimum" |
| 39–41 | issue-0039–0041 | EVIDENCE_INADEQUATE | ADVISORY | (unfair dismissal, companion rights re-occurrence) |
| **42** | **issue-0042** | **EVIDENCE_ABSENT** | **BLOCKING** | "however, not legally required to permit the companion to answer questions on" |
| 43 | issue-0043 | EVIDENCE_INADEQUATE | ADVISORY | — |
| **44** | **issue-0044** | **EVIDENCE_ABSENT** | **BLOCKING** | "• deliberate and serious damage to property" |
| 45–58 | issue-0045–0058 | EVIDENCE_INADEQUATE | ADVISORY | (appeal rights, dismissal, medical reports, GP consent) |
| **59** | **issue-0059** | **EVIDENCE_ABSENT** | **BLOCKING** | "employment tribunal, or breach of contract." |
| 60–64 | issue-0060–0064 | EVIDENCE_INADEQUATE | ADVISORY | (dismissal reasonableness, data protection, monitoring, discipline) |

### Duplicate and near-identical ADVISORY groups

Several ADVISORY issues involve the same or near-identical statements appearing at different character offsets (the guide PDF contains repeated procedural sections for different contexts — disciplinary and grievance procedures are presented in parallel). Examples:
- Issues 8/12/34: companion certification requirement (`"representative who is not an employed official must have been certified by their"`) — same clause repeated for disciplinary and grievance contexts
- Issues 9/35: `"Employers must agree to a"` — repeated across sections
- Issues 10/36: statutory right to be accompanied — repeated across sections
- Issues 11/37: postponement obligation — repeated
- Issues 15/40: companion address right — repeated
- Issues 17/42: companion question limitation — same clause, different offset
- Issues 22/44: gross misconduct bullet point — repeated in disciplinary/grievance sections

The duplication reflects the guide's structure (parallel disciplinary and grievance chapters) not evaluator error.

---

## C. Blocking Issue Review

### The 13 blocking issues fall into five thematic groups:

**Group 1 — Constructive dismissal / resignation rights (issues 7, 59)**
- Statements: "breach of contract, or in extreme cases to resign and claim constructive" (chars 30,933–31,005); "employment tribunal, or breach of contract." (chars 148,519–148,562)
- These are clauses from the guide's statement that an employee may treat certain conduct as breach of contract and resign. The Code paragraphs 9–17 concern procedural rights at the disciplinary meeting (notification, accompaniment) and do not address resignation or constructive dismissal. The EVIDENCE_ABSENT classification is **technically justified**: the Code evidence boundary genuinely does not contain material on constructive dismissal.
- However, these statements are **outside the declared guide boundary (pages 18–25)**. The guide's constructive dismissal content appears in a section on employee rights after dismissal, not in the notification/meeting procedure section. This is a consequence of the extractor processing the full document rather than the declared boundary.

**Group 2 — Companion question limitation (issues 17, 42)**
- Statement: "however, not legally required to permit the companion to answer questions on" (chars 53,786–53,862 and 108,025–108,101)
- This is a fragment of Code paragraph 17: "The companion does not, however, have the right to answer questions on the worker's behalf…"
- The full statement **is present in the Code evidence boundary (Code paragraph 17)**. The evaluator raised EVIDENCE_ABSENT because the extracted fragment (`"however, not legally required to permit the companion to answer questions on"`) is a guide paraphrase — the guide uses slightly different wording from the Code — and the evidence linkage failed to match it to the Code paragraph.
- This is an evaluator limitation: the paraphrase is semantically equivalent to Code paragraph 17 but the lexical matching failed.

**Group 3 — Criminal offences (issues 26, 27, 28, 29, 30)**
- Statements concern employees charged with or convicted of criminal offences, covering how an employer should handle the employment relationship during and after proceedings.
- These statements are **outside the declared guide boundary (pages 18–25)**. The criminal offences section of the ACAS guide is a separate chapter. Code paragraphs 9–17 cover notification and accompaniment only and have no content on criminal offences.
- EVIDENCE_ABSENT classification is **technically justified** given the Code evidence boundary. The finding reflects a genuine evidence gap — but the gap is caused by evaluating content outside the declared guide boundary against a Code boundary that was never intended to cover criminal proceedings.

**Group 4 — Gross misconduct list item (issues 22, 44)**
- Statement: "• deliberate and serious damage to property" (chars 65,882–65,927 and 119,944–119,989)
- This is a bullet point from the guide's list of examples of gross misconduct.
- The Code paragraphs 9–17 do not define or list gross misconduct examples (that is addressed in Code paragraphs 23–25). EVIDENCE_ABSENT is **technically correct** given the selected evidence boundary, but the guide bullet point is illustrative and does not make a formal claim requiring Code citation.

**Group 5 — Legal compliance / National Minimum Wage (issue 38) and "Employers are required by law to comply" (issue 23)**
- Statement (issue 38): "about an employer's legal obligations, such as payment of the National Minimum" — a reference to general employment law compliance in the guide
- Statement (issue 23): "Employers are required by law to comply" — a generic compliance statement
- These statements reference statutory obligations beyond the Code of Practice. Code paragraphs 9–17 contain no material on National Minimum Wage or general legal compliance. EVIDENCE_ABSENT is **technically correct** but again reflects content outside the pages 18–25 boundary.

### Would an experienced reviewer agree?

**For Group 2 (companion question limitation — issues 17, 42):** An experienced reviewer would likely **disagree** with EVIDENCE_ABSENT. Code paragraph 17 explicitly states that a companion "does not… have the right to answer questions on the worker's behalf." The guide's paraphrase to "not legally required to permit the companion to answer questions on" is a direct restatement. A reviewer would classify this as SUPPORTED, not EVIDENCE_ABSENT.

**For Groups 1, 3, 4, 5:** An experienced reviewer would likely **agree that no supporting evidence exists within paragraphs 9–17** but would note that the guide statements are themselves outside pages 18–25 and should not have been included in the claim set at all. The finding is correct given the actual inputs to the evaluator but would not arise in a properly bounded evaluation.

---

## D. Proof Receipt Assessment

### Completeness

| Field | Value | Assessment |
|-------|-------|------------|
| `id` | `receipt-eval-DRA-DOC-0008` | Present |
| `schemaVersion` | `0.1.0` | Present |
| `decision` | `HOLD` | Present |
| `decisionRationale` | `"HOLD — 13 blocking issue(s) detected (EVIDENCE_ABSENT). All blocking issues must be resolved and the document re-evaluated before an assurance determination can be issued."` | Present; machine-generated; accurate |
| `timestamp` | `2026-08-04T13:57:17.342Z` | Present |
| `substantiveDigest` | `fc7517cc…2cd` (64 chars) | Present; verified ✓ |
| `documentIdentity` | `{generatedDocumentId, generatedDocumentTitle, evaluatedAt}` | Present; no `contentHash` field (optional — not a gap) |
| `evaluatorIdentity` | `{evaluatorVersion: "0.1.0", pipelineVersion: "1.0"}` | Present; no `commitIdentifier` (optional) |
| `stageOutputs` | 7 records | Present; all 7 stages represented |
| `issueRegister` | 64 records | Present |
| `issueSummary` | `{total: 64, blocking: 13, advisory: 51}` | Present; accurate |

**Stage output content:**

| Stage | Name | Key output |
|-------|------|------------|
| 1 | Input Normalisation | `statementCount` absent (warningCount: 0) |
| 2 | Claim Extraction | `statementCount: 3013`, `warningCount: 0` |
| 3 | Authority Resolution | `authorityRecordCount: 3013`, `warningCount: 8` |
| 4 | Evidence Linkage | `evidenceRecordCount: 3013`, embeds materiality assessment with classification counts |
| 5 | Consistency Check | `issueCount: 64`, `blockingIssueCount: 13`, `advisoryIssueCount: 51` |
| 6 | Confidence Scoring | `levelCounts: {CONFIRMED: 4, PARTIAL: 3009, UNVERIFIED: 0, CONTESTED: 0}` |
| 7 | Decision and Receipt | `decision: HOLD`, issue counts confirmed |

Stage 3 reports 8 warnings (authority resolution warnings). These are not surfaced to the caller or mentioned in the decision rationale.

### Traceability

Each issue in the `issueRegister` carries an `id`, `issueClass`, `severity`, `affectedStatementIds`, and `explanation`. Statement IDs use character-offset encoding (`s2:<start>:<end>`) which uniquely identifies each span in the normalised text. This is sufficient to locate the source span but requires a tool to render the span text; the receipt does not embed the full statement text.

### Reproducibility

The `substantiveDigest` (`fc7517cc…2cd`) is stable across all three evaluation runs (confirmed in the blind evaluation). The receipt correctly excludes `id`, `timestamp`, and `evaluatedAt` from the digest, ensuring that different wall-clock times do not produce different digests.

### Readability

The `decisionRationale` is a machine-generated template: `"HOLD — N blocking issue(s) detected (CLASS)."` It accurately states the count and class but does not describe the content of the blocking issues or explain why the decision was not REVIEW. For a production receipt this is functional but minimal.

### Whether the HOLD decision is adequately explained

The decision template states that "all blocking issues must be resolved and the document re-evaluated." This is a standard formula. A reviewer reading only the receipt would know there are 13 EVIDENCE_ABSENT blocking issues but would not know which statements are affected or why the Code evidence was deemed absent. The `issueRegister` provides the statement IDs, allowing a reviewer to look up the affected spans — but the receipt does not embed the span text, requiring an external lookup.

**Assessment:** The receipt is complete and technically correct. Its machine-generated rationale is functional for automated processing. For human review, the lack of embedded statement text in the issueRegister entries requires a secondary lookup step.

---

## E. Independent Reviewer Assessment

*This section was written before examining the evaluator findings.*

### Guide boundary (pages 18–25): "Informing the employee" → "Allowing a worker to be accompanied"

The ACAS guide section covers the procedural steps from the moment a disciplinary decision is made to investigate through to the conduct of the disciplinary meeting itself. The key procedural claims the guide makes in this section are:

1. **Notification obligation:** The employee must be informed in writing of the alleged misconduct, told the basis of the allegation, and given copies of evidence in advance.
2. **Meeting notice:** Reasonable notice of the meeting must be given; the employee must have time to prepare.
3. **Companion right:** The employee has a statutory right to be accompanied by a colleague or trade union representative.
4. **Companion scope:** The companion may address the meeting and confer with the worker but may not answer questions on the worker's behalf.
5. **Postponement:** If the companion is unavailable, the employer must postpone to a worker-nominated time within five working days.
6. **Fair hearing:** The meeting should be conducted fairly; the employee should have the opportunity to respond to allegations.

### Code paragraphs 9–17: "Inform the employee" → companion rights

Code paragraphs 9–17 cover:
- Para 9–12: Notification of the meeting (written notice, nature of complaint, evidence, time to prepare)
- Para 13–16: Right to be accompanied (statutory companions, reasonable request, postponement obligation)
- Para 17: Companion role (address, confer, but not answer questions)

### Independent assessment

The guide's procedural claims in pages 18–25 closely correspond to Code paragraphs 9–17. The guide provides elaborated practical guidance on how to exercise the Code's requirements. My independent assessment is that:

- Claims about notification, evidence disclosure, meeting notice, and preparation time in the guide are **directly supported** by Code paragraphs 9–12.
- Claims about companion rights (who may accompany, reasonable request, postponement) are **directly supported** by Code paragraphs 13–16.
- The claim that a companion "does not have the right to answer questions on the worker's behalf" is **directly stated** in Code paragraph 17.
- The guide contains additional procedural guidance (e.g. specific wording for confirmation letters, the manager's role in conducting meetings) that goes beyond the Code but is consistent with it.

**Independent assessment result:** Within the declared guide boundary (pages 18–25) and Code boundary (paragraphs 9–17), I would expect the evaluation to find that the principal procedural claims are SUPPORTED or PARTIAL — not HOLD. The guide boundary section is, substantively, a practical elaboration of exactly what the Code paragraphs cover.

---

## F. Evaluator Comparison

### Areas of agreement

| Finding | Agreement |
|---------|-----------|
| The full guide text (164,726 chars) was processed | Confirmed by character offsets spanning 0–157,033 |
| The Code text was correctly normalised and its digest verified | Confirmed by text digest match |
| The proof receipt is structurally complete | Confirmed |
| 4 statements are CONFIRMED; 3,009 are PARTIAL | This suggests the evaluator found very limited but non-zero evidence linkage |
| Issues 22/44 (gross misconduct list) and 23/38 (legal compliance) are genuinely outside Code paras 9–17 scope | Agreed |

### Areas of disagreement

| Evaluator finding | Reviewer assessment | Basis |
|-------------------|--------------------|----|
| Issues 17 and 42 — EVIDENCE_ABSENT for companion question limitation | **Disagree.** The guide's paraphrase of Code paragraph 17 is a direct restatement. A human reviewer would classify as SUPPORTED. | Code para 17 explicitly states the companion "does not… have the right to answer questions on the worker's behalf" |
| 51 ADVISORY EVIDENCE_INADEQUATE issues including statutory companion rights (issues 8–16, 34–37) | **Partially disagree.** Several of these span the companion rights content (paras 13–16) which is directly present in the Code. The evidence linkage stage appears not to have matched guide companion-right clauses to Code companion-right paragraphs. | Issues 8–16 and 34–37 concern companion certification, request requirements, and postponement — all covered in Code paras 14–16 |
| HOLD decision | **Partially agrees.** A human reviewer would agree that issues exist but would be unlikely to find 13 blocking-severity EVIDENCE_ABSENT issues. The HOLD is technically consistent with the evaluation rules but is driven largely by content outside the guide's declared boundary. | The primary cause is the extractor processing the full 164,726-char document rather than pages 18–25 |
| 0 evidence linkages across all 3,013 statements | **Disagree for in-boundary content.** For the guide's companion rights and notification claims (which align directly with Code paras 9–17), evidence linkage should have produced matches. | The 4 CONFIRMED and 3,009 PARTIAL confidence scores suggest the confidence scorer found some support, but the evidence linker found none |

### Summary of comparison

The evaluator's findings for out-of-boundary content (criminal offences, constructive dismissal, gross misconduct examples, general legal compliance) are technically correct given the evidence boundary: those topics are absent from Code paragraphs 9–17. However, for the in-boundary content (notification procedure, companion rights, postponement obligation), the evaluator failed to establish evidence linkage despite the Code containing directly supporting material, resulting in EVIDENCE_INADEQUATE findings across companion rights statements that a human reviewer would classify as SUPPORTED.

The single most significant disagreement is issues 17 and 42 (EVIDENCE_ABSENT, BLOCKING) for the companion question-limitation clause, which is directly stated in Code paragraph 17.

---

## G. Observations

### Evaluator strengths

1. **Deterministic behaviour.** Three runs produced identical decisions, claim counts, issue counts, and proof-receipt substantive digests. The evaluator is fully reproducible given frozen inputs and a fixed timestamp.

2. **Complete span coverage.** All 3,013 extracted statements carry character-offset span references (`s2:<start>:<end>`), enabling precise traceability to the source document.

3. **Structured issue records.** Each issue carries a consistent machine-readable schema (`id`, `issueClass`, `severity`, `affectedStatementIds`, `explanation`), suitable for automated downstream processing.

4. **Proof receipt integrity.** The receipt's `substantiveDigest` is stable across runs and verified by `verifyReceiptIntegrity`, providing a cryptographic guarantee of receipt consistency.

5. **Authority classification diversity.** The authority resolution stage produced four distinct authority labels (DOCUMENT_AUTHOR, AMBIGUOUS_SOURCE, EXPLICIT_NAMED_SOURCE, STRUCTURALLY_INHERITED_SOURCE), demonstrating nuanced attribution detection.

### Evaluator limitations

6. **Full-document extraction ignores the declared boundary.** The claim extractor processes the entire normalised document text (164,726 chars) rather than restricting to the declared evaluation boundary (pages 18–25, approximately 8,000–12,000 chars). This produces ~2,800 out-of-scope claims which then generate EVIDENCE_INADEQUATE and EVIDENCE_ABSENT issues against a Code evidence boundary that was never intended to cover those topics. This is the primary driver of the 64-issue count and the HOLD decision.

7. **Zero evidence linkage across all 3,013 statements.** Despite 3,009 statements being scored PARTIAL in confidence (indicating the confidence scorer found partial support), the evidence linkage stage found no document-level links for any statement. This suggests a systematic failure in matching guide clauses to Code passages even for in-boundary content that is directly supported.

8. **False EVIDENCE_ABSENT for directly mirrored Code content.** Issues 17 and 42 raise BLOCKING EVIDENCE_ABSENT for the guide's paraphrase of Code paragraph 17. The paraphrase is a direct semantic equivalent. The evaluator's lexical matching failed to recognise the paraphrase as evidence, producing a blocking issue for a statement that is factually correct and directly supported.

9. **Character-window extraction produces non-claim artefacts.** 549 statements are under 20 characters, including single words ("For", "Any", "The"), document title fragments ("Discipline and", "Grievances at"), and metadata ("July 2020"). These are not claims and should not enter the evaluation pipeline. Their presence inflates issue counts and dilutes the signal-to-noise ratio.

10. **Stage 3 warnings not surfaced.** Stage 3 (authority resolution) produced 8 warnings, none of which appear in the decision rationale or receipt. A human reviewer has no visibility into what authority warnings were generated.

### Benchmark limitations

11. **Evidence boundary narrower than guide content.** Supplying the full normalised guide text (164,726 chars, entire document) against a Code evidence boundary of paragraphs 9–17 (approximately 3,000–4,000 chars) creates a structural mismatch. The evidence boundary covers roughly 14% of the Code text and is designed to test a specific procedural subsection. Evaluating the full guide against this boundary means approximately 93% of guide content has no corresponding Code evidence by design.

12. **No guide-boundary extraction step.** The evaluation pipeline does not include a step to extract the declared boundary section from the guide before evaluation. This would require the pipeline to understand page-number ranges in the normalised text, which is a capability the current pipeline does not have.

### Corpus limitations

13. **DRA-DOC-0008 is the first PROCEDURE-type document.** The evaluator has no prior PROCEDURE-type benchmark cases. The pattern of guide-elaborating-Code is novel relative to the corpus, which previously contained ARTICLE and POLICY documents with more self-contained evidence structures.

### Documentation improvements

14. The blind evaluation report (section D, pipeline stages 3–5) noted that stages 3–5 appeared to return 0 records via the traversal path used. The actual stage outputs are embedded under different keys (`authorityRecords`, `evidenceRecords`, `materialityRecords`) and are confirmed present in the proof receipt (stage 3: 3,013 authority records; stage 4: 3,013 evidence records). Future test templates should access these stages via their confirmed field names.

15. The proof receipt `issueRegister` carries issue `id`, class, severity, and `affectedStatementIds` but does not embed the statement text. Adding the statement text (or at least the first 100 characters) to each `issueRegister` entry would make the receipt self-contained for human review.

---

## H. Overall Conclusion

### **RESULT REQUIRES HUMAN ADJUDICATION**

The evaluator's HOLD decision is technically consistent with the evaluation rules: 13 EVIDENCE_ABSENT BLOCKING issues were detected, and the pipeline's decision derivation correctly maps blocking issues to HOLD. The evaluation is deterministic and the proof receipt is complete and verifiable.

However, the HOLD result is primarily driven by two structural issues that require human judgment to adjudicate:

1. **The claim extractor processed the full 164,726-character guide text** rather than the declared pages 18–25 boundary. Approximately 2,800 of the 3,013 claims relate to content outside the declared boundary (criminal offences, constructive dismissal, gross misconduct examples, National Minimum Wage, medical report requirements, data protection). These out-of-boundary claims generated the majority of the 64 issues against a Code evidence boundary intentionally limited to companion rights and notification procedure. A properly bounded extraction would produce approximately 150–250 claims from pages 18–25, the majority of which would be directly supported by Code paragraphs 9–17.

2. **Issues 17 and 42** (BLOCKING, EVIDENCE_ABSENT) flag the guide's paraphrase of Code paragraph 17 as having no documentary evidence. The paraphrase is a direct semantic restatement of Code paragraph 17 and should have been classified as SUPPORTED. These two blocking issues alone are sufficient to determine the HOLD outcome, yet they represent evaluator error rather than a genuine evidence gap.

**Recommended adjudication questions for a human reviewer:**
- Do the blocking issues relating to out-of-boundary content (Groups 1, 3, 4, 5 from section C) warrant a HOLD given that those statements are outside pages 18–25?
- Do issues 17 and 42 (companion question limitation) constitute genuine evidence gaps given that Code paragraph 17 directly states the companion's question-limitation?
- Given a properly bounded evaluation (pages 18–25 only, ~150–250 claims), would the principal procedural claims (notification, accompaniment, postponement) be SUPPORTED by Code paragraphs 9–17?

If the answer to all three is "no, no, yes" — the most likely outcome of human adjudication — the result would be revised from HOLD to REVIEW or SUPPORTED after boundary correction and re-evaluation.

---

## I. Confirmation

No repository files, frozen artefacts, or evaluator logic were modified during this review.

| Item | Status |
|------|--------|
| Evaluator logic | NOT MODIFIED |
| Governance rules | NOT MODIFIED |
| Corpus entries | NOT MODIFIED |
| Freeze records (DRA-FRZ-000002) | NOT MODIFIED |
| Manifests | NOT MODIFIED |
| Issue classes | NOT MODIFIED |
| Decision semantics | NOT MODIFIED |
| Proof receipts | NOT MODIFIED |
| Benchmark artefacts | NOT MODIFIED |
| DRA-DOC-0001 through DRA-DOC-0007 | NOT MODIFIED |
| CTS artefacts | NOT MODIFIED |

The review test (`dra-val-002-result-review.test.ts`) is read-only with respect to all frozen artefacts. It re-runs the evaluation from frozen inputs to extract pipeline data, but produces no new artefacts and makes no writes to any benchmark record.
