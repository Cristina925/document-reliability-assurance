# DRA-CHK-002 — Version 1 Issue-Class Reachability and Coverage-Ceiling Report

**Checkpoint ID:** DRA-CHK-002  
**Checkpoint Date:** 2026-08-06  
**Corpus State:** 14 frozen documents (DRA-DOC-0001–0014) — DRA-BMK-014  
**Evaluator Version:** DRA-EVALUATOR-v1, version `0.1.1` (frozen)  
**Programme Phase:** Version 1 Behavioural Boundary Determination  
**Status:** COMPLETE  

---

## 1. Purpose and Scope

DRA-CHK-002 determines the true behavioural boundary of the frozen DRA Version 1 evaluator before further corpus expansion. It is not an acquisition milestone and does not admit DRA-DOC-0015.

The checkpoint answers three questions that raw benchmark coverage statistics cannot:

1. Which of the nine canonical issue classes can the Version 1 pipeline actually produce?
2. Which are incapable of being produced — and why?
3. What is the maximum attainable issue-class coverage under the current evaluator freeze?

No evaluator semantics have been modified. All findings derive from reading the frozen implementation and running tests against it.

---

## 2. Methodology

### 2.1 Analysis approach

For each of the nine canonical issue classes (IC-1 through IC-9):

1. **Code-path analysis** — read the emission rule in `issue-detection.ts` (if any), the upstream stage(s) that must supply the required state, and the complete call graph from `evaluateDocument` through each stage.
2. **Schema analysis** — inspect `authority-classification.ts`, `evidence-classification.ts`, `materiality-classification.ts`, and `issue-classes.ts` to determine whether required field values exist in the type system.
3. **Fallback analysis** — trace each stage's fallback and default return paths to determine whether required states can survive to the emission rule.
4. **Targeted pipeline tests** — run realistic content through the full pipeline via the unmodified `evaluateDocument` entry point to confirm or refute reachability.
5. **Adversarial valid-input construction** — for every unobserved class, construct the strongest valid input likely to trigger it, run it through the canonical pipeline, and record the actual output.
6. **Corpus reconciliation** — verify findings against the 14-document corpus results from DRA-BMK-014.

### 2.2 Evidence-strength model

Each conclusion is supported by one or more of:

| Label | Meaning |
|---|---|
| `CODE_PATH_PROVEN` | Implementation analysis proves the finding |
| `TARGETED_TEST_PROVEN` | A targeted test confirms the finding |
| `CORPUS_OBSERVED` | At least one frozen corpus document has produced this class |
| `EMPIRICALLY_CHALLENGED` | A best-effort adversarial input failed to trigger the class |
| `MULTIPLE_EVIDENCE_SOURCES` | More than one independent evidence type supports the finding |

### 2.3 Critical distinction

This report enforces three distinct levels that must not be conflated:

**A. Emission-rule executability** — the emission code in `issue-detection.ts` can be invoked with a manually fabricated internal object that produces the required state. This is rule-isolation testing only; it does not prove pipeline reachability.

**B. Pipeline reachability** — a complete valid execution path exists from a valid public evaluator input through all upstream stages to the emission rule. This requires every upstream stage to be able to produce the required intermediate state.

**C. Corpus observation** — at least one frozen corpus document has produced the class in a real evaluation run.

---

## 3. Evaluator Architecture

The Version 1 pipeline comprises the following stages in order:

| Stage | Function | Role in issue detection |
|---|---|---|
| Stage 1 | `normaliseEvaluationRequest` | Input validation and normalisation |
| Stage 2 | `extractClaims` | Statement extraction |
| Stage 3 | `resolveAuthority` | Authority classification per statement |
| Stage 4 | `linkEvidence` | Evidence classification per statement |
| Stage 5 | `assessMateriality` | Materiality classification per statement |
| Stage 6 | `checkConsistency` → `detectIssues` | **Issue emission** |
| Stage 6.5 | `scoreConfidence` | Confidence scoring (reads issues, does not emit new ones) |
| Stage 7 | `deriveDecision` + `buildProofReceipt` | Decision and proof receipt |

All issue emission occurs in `detectIssues` (`lib/dra-reference/src/consistency-check/issue-detection.ts`), which is called from `checkConsistency`. No other stage in the pipeline emits issue instances.

---

## 4. Per-Class Analysis

### 4.1 IC-1 — UNSUPPORTED_CLAIM

**Emission location:** `issue-detection.ts` lines 184–205  
**Emission predicate:** `isHighOrCritical && noAuth && noEvid`  
where `noAuth = NO_AUTHORITY.has(ar.classification)` and `NO_AUTHORITY = {"NO_IDENTIFIABLE_SOURCE"}`

**Required upstream state:** `AuthorityRecord.classification === "NO_IDENTIFIABLE_SOURCE"` from Stage 3

**Stage 3 behaviour:** `detectAttribution` in `attribution-patterns.ts` applies 10 ordered rules. The final fallback (Priority 10, rule `AR-DOCUMENT-AUTHOR`) unconditionally returns `DOCUMENT_AUTHOR`. The five classifications actually produced by Stage 3 are:

| Classification | Stage 3 rule |
|---|---|
| DOCUMENT_AUTHOR | AR-SELF-REF, AR-DOCUMENT-AUTHOR (fallback) |
| EXPLICIT_NAMED_SOURCE | AR-SPEAKER-LABEL, AR-ACCORDING-NAMED, AR-SUBJECT-NAMED, AR-POST-NAMED, AR-ATTR-INLINE |
| EXPLICIT_UNNAMED_SOURCE | AR-ACCORDING-UNNAMED, AR-SUBJECT-UNNAMED, AR-POST-UNNAMED |
| STRUCTURALLY_INHERITED_SOURCE | AR-INHERITED-NAMED, AR-INHERITED-UNNAMED |
| AMBIGUOUS_SOURCE | AR-PRONOUN-AMBIG, AR-UNATTR-QUOTE |

`NO_IDENTIFIABLE_SOURCE` is defined in `AUTHORITY_CLASSIFICATIONS` (the schema) but **no rule in `detectAttribution` returns it**. The `NO_AUTHORITY` sentinel set therefore can never be satisfied by any valid Stage 3 output.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **DORMANT_SCHEMA_OR_TAXONOMY** — emission rule exists; required producer state absent
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.2 IC-2 — AUTHORITY_EXPIRED

**Emission location:** None — no emission rule exists anywhere in the pipeline

**Schema analysis:** `AuthorityRecord` (`authority-record.ts`) contains no expiry, validity-period, effective-date, or temporal fields. `Stage3ResolutionRecord` contains no temporal metadata. No stage performs any temporal check on authority records.

**Stage 3 behaviour:** Performs pattern-based attribution detection only. No date parsing, no standard-version tracking, no expiry logic.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **IMPLEMENTATION_GAP** — class exists in canonical taxonomy; no emission code or data structure implemented
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.3 IC-3 — AUTHORITY_ABSENT

**Emission location:** `issue-detection.ts` lines 229–248  
**Emission predicate:** `isHighOrCritical && noAuth && !noEvid`  
where `noAuth = NO_AUTHORITY.has(ar.classification)` — same sentinel as IC-1

**Required upstream state:** `AuthorityRecord.classification === "NO_IDENTIFIABLE_SOURCE"` AND evidence present

**Stage 3 barrier:** Identical to IC-1. `detectAttribution` never produces `NO_IDENTIFIABLE_SOURCE`; its final fallback is always `DOCUMENT_AUTHOR`. AMBIGUOUS_SOURCE (from pronoun subjects or unattributed quotes) is NOT in the `NO_AUTHORITY` set and does not satisfy `noAuth`.

**Additional note — IC-1 subsumption:** When both `noAuth` and `noEvid` are true, IC-1 subsumes IC-3 (the IC-3 check is never reached due to `continue` after IC-1). This is irrelevant to the barrier: `noAuth` is always false regardless of `noEvid`.

**DRA-BMK-014 empirical confirmation:** DRA-DOC-0014 (BCBS *Principles for Operational Resilience*) was selected as the optimal IC-3 test case: international standards body, ambiguous authority chain, normative cross-framework references. IC-3 was not raised. Stage 3 resolved to `DOCUMENT_AUTHOR` (BCBS as document author). This empirical result is fully explained by the structural barrier.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **DORMANT_SCHEMA_OR_TAXONOMY** — emission rule exists; required producer state absent
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, CORPUS_OBSERVED (negative result), EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.4 IC-4 — EVIDENCE_ABSENT

**Emission location:** `issue-detection.ts` lines 207–227  
**Emission predicate:** `isCritical && noEvid && !noAuth`  
where `noEvid = NO_EVIDENCE.has(er.classification)` and `NO_EVIDENCE = {"NO_DOCUMENT_EVIDENCE"}`

**Required upstream state:**
- Stage 5: `MaterialityRecord.classification === "CRITICAL"` — producible via MA-CRITICAL-SECURITY, MA-CRITICAL-REGULATORY, MA-CRITICAL-LEGAL, etc.
- Stage 4: `EvidenceRecord.classification === "NO_DOCUMENT_EVIDENCE"` — producible when no evidence is detected in document text
- Stage 3: any classification other than `NO_IDENTIFIABLE_SOURCE` — always satisfied

**Execution path:** Policy document with CRITICAL mandatory obligations and no inline citations → Stage 5 CRITICAL, Stage 4 NO_DOCUMENT_EVIDENCE, Stage 3 DOCUMENT_AUTHOR → IC-4 fires

**Corpus observation:** DRA-DOC-0008 (Acas guide), DRA-DOC-0009 (CMA AI Foundation Models summary)

**Conclusion:**
- Reachability: **OBSERVED_REACHABLE**
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, CORPUS_OBSERVED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.5 IC-5 — EVIDENCE_INADEQUATE

**Emission location:** `issue-detection.ts` lines 250–269  
**Emission predicate:** `!isCritical && mat === "HIGH" && (noEvid || ambigEvid) && !noAuth`  
where `ambigEvid = AMBIGUOUS_EVIDENCE.has(er.classification)` and `AMBIGUOUS_EVIDENCE = {"AMBIGUOUS_EVIDENCE_LINK"}`

**Required upstream state:**
- Stage 5: `MaterialityRecord.classification === "HIGH"` — producible via MA-HIGH-OBLIGATION, MA-HIGH-RECOMMENDATION, MA-HIGH-DECISION, etc.
- Stage 4: `NO_DOCUMENT_EVIDENCE` or `AMBIGUOUS_EVIDENCE_LINK` — both producible
- Stage 3: any non-`NO_IDENTIFIABLE_SOURCE` — always satisfied

**Corpus observation:** DRA-DOC-0004, 0006, 0008, 0009, 0010, 0011, 0012

**Conclusion:**
- Reachability: **OBSERVED_REACHABLE**
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, CORPUS_OBSERVED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.6 IC-6 — EVIDENCE_CONFLICT

**Emission location:** None — no emission rule exists anywhere in the pipeline

**Schema analysis:** `EvidenceRecord` contains a single `classification: EvidenceClassification` field and an array of `EvidenceSpan`s. There is no conflict-state field, no second-classification field, and no multi-record conflict schema. Stage 4 (`link-evidence.ts`) produces exactly one `EvidenceRecord` per statement. The `detectIssues` function in `issue-detection.ts` does not contain any predicate checking for conflicting evidence.

**Note:** IC-6 appears in `model/issues.ts` comments alongside IC-7 and in `issue-classes.ts` taxonomy, but has no executable end-to-end path.

**Adversarial attempt:** A document citing two named sources with directly contradictory guidance on the same policy. Result: Stage 4 assigned one `EvidenceClassification` per statement; no conflict state produced; IC-6 not raised.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **IMPLEMENTATION_GAP** — class in taxonomy; no emission code or conflict-state data structure
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.7 IC-7 — CLAIM_INCONSISTENCY

**Emission location:** `issue-detection.ts` lines 272–290  
**Emission predicate:** two statements where both have HIGH/CRITICAL materiality and `parseDeonticVerb` returns the same verb with opposite negation flags

**Required upstream state:**
- Stage 2: two extracted statements with opposite deontic modals on the same verb
- Stage 5: both statements classified HIGH or CRITICAL

**Execution path:** Document containing "must [verb]…" and "must not [verb]…" (or "cannot [verb]…") where both statements meet HIGH/CRITICAL materiality → contradictions detected by `detectContradictions` → IC-7 emitted with ADVISORY severity

**Corpus observation:** DRA-DOC-0011 (ICO *Explaining decisions made with AI*)

**Conclusion:**
- Reachability: **OBSERVED_REACHABLE**
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, CORPUS_OBSERVED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.8 IC-8 — TRACEABILITY_BROKEN

**Emission location:** None — no emission rule exists in the evaluator pipeline

**Note on reviewer-simulation.ts:** IC-8 appears in `lib/dra-reference/src/benchmark/evidence/reviewer-simulation.ts` (a benchmark evidence fixture that simulates human reviewer findings). This is not the evaluator pipeline; it is a static fixture for testing the governance review framework. No instance of `TRACEABILITY_BROKEN` can be produced by `evaluateDocument`.

**Schema analysis:** `EvidenceClassification` contains no "broken traceability" value. The minimum possible Stage 4 output for a statement with unresolvable references is `NO_DOCUMENT_EVIDENCE` — which triggers IC-4 or IC-5, not IC-8.

**Adversarial attempt:** A document referencing entirely missing annexures and broken citation links. Result: Stage 4 assigned `NO_DOCUMENT_EVIDENCE`; IC-4/IC-5 raised; IC-8 not raised.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **IMPLEMENTATION_GAP** — class in taxonomy and reviewer-simulation fixture; no pipeline emission rule
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

### 4.9 IC-9 — SCOPE_VIOLATION

**Emission location:** None — no emission rule exists in the evaluator pipeline

**Note on reviewer-simulation.ts:** IC-9 also appears in the reviewer simulation fixture (not the evaluator). This creates an apparent but non-functional reference.

**Schema analysis:** `NormalisedEvaluationRequest` carries no scope declaration field. Stage 5 (`materiality-rules.ts`) operates on statement text only with no scope-awareness metadata. No stage captures or compares scope boundaries. `detectIssues` has no scope-violation predicate.

**Adversarial attempt:** A document explicitly declaring EU-only scope with statements making global and US-specific claims. Result: No scope metadata consumed by any stage; IC-9 not raised.

**Conclusion:**
- Reachability: **STRUCTURALLY_UNREACHABLE**
- Defect: **IMPLEMENTATION_GAP** — class in taxonomy and reviewer-simulation; no pipeline scope metadata or emission rule
- Evidence: CODE_PATH_PROVEN, TARGETED_TEST_PROVEN, EMPIRICALLY_CHALLENGED, MULTIPLE_EVIDENCE_SOURCES

---

## 5. Reachability Matrix Summary

| Code | Name | Emission Rule | Reachability | Defect | Evidence |
|---|---|---|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | ✓ (exists) | **STRUCTURALLY_UNREACHABLE** | DORMANT_SCHEMA_OR_TAXONOMY | CODE_PATH, TEST, EMPIRICAL, MULTIPLE |
| IC-2 | AUTHORITY_EXPIRED | ✗ (absent) | **STRUCTURALLY_UNREACHABLE** | IMPLEMENTATION_GAP | CODE_PATH, TEST, EMPIRICAL, MULTIPLE |
| IC-3 | AUTHORITY_ABSENT | ✓ (exists) | **STRUCTURALLY_UNREACHABLE** | DORMANT_SCHEMA_OR_TAXONOMY | CODE_PATH, TEST, CORPUS(neg), EMPIRICAL, MULTIPLE |
| IC-4 | EVIDENCE_ABSENT | ✓ | **OBSERVED_REACHABLE** | N/A | CODE_PATH, TEST, CORPUS, MULTIPLE |
| IC-5 | EVIDENCE_INADEQUATE | ✓ | **OBSERVED_REACHABLE** | N/A | CODE_PATH, TEST, CORPUS, MULTIPLE |
| IC-6 | EVIDENCE_CONFLICT | ✗ (absent) | **STRUCTURALLY_UNREACHABLE** | IMPLEMENTATION_GAP | CODE_PATH, TEST, EMPIRICAL, MULTIPLE |
| IC-7 | CLAIM_INCONSISTENCY | ✓ | **OBSERVED_REACHABLE** | N/A | CODE_PATH, TEST, CORPUS, MULTIPLE |
| IC-8 | TRACEABILITY_BROKEN | ✗ (absent) | **STRUCTURALLY_UNREACHABLE** | IMPLEMENTATION_GAP | CODE_PATH, TEST, EMPIRICAL, MULTIPLE |
| IC-9 | SCOPE_VIOLATION | ✗ (absent) | **STRUCTURALLY_UNREACHABLE** | IMPLEMENTATION_GAP | CODE_PATH, TEST, EMPIRICAL, MULTIPLE |

---

## 6. Coverage Metrics

### 6.1 Canonical class inventory
**Total canonical issue classes: 9**

### 6.2 Raw canonical coverage
**Observed: 3/9 = 33.33%**

This is the metric appropriate for "how many of the nine classes have been seen in the benchmark corpus." It is the lower-bound metric: structurally unreachable classes appear in the denominator but cannot be moved to the numerator by any corpus expansion.

### 6.3 Reachable-class coverage
**Observed reachable: 3/3 = 100%**

This is the metric appropriate for "how much of what the evaluator can actually produce has been exercised." All three reachable classes (IC-4, IC-5, IC-7) have been observed in the 14-document corpus.

### 6.4 Structural-unreachability count
**Unreachable: 6/9 = 66.67%**

Six canonical classes cannot be produced by any valid Version 1 input. This is a fixed property of the frozen implementation, not a function of corpus size.

### 6.5 Maximum Version 1 coverage ceiling
**Ceiling: 3/9 = 33.33%**

No further corpus acquisition can increase the raw coverage ceiling beyond 3/9 under the frozen Version 1 evaluator. The ceiling is set by the number of reachable classes (3), not by corpus size. The 14-document corpus already achieves this ceiling.

---

## 7. Structural Barrier Analysis

### 7.1 The NO_IDENTIFIABLE_SOURCE barrier (IC-1 and IC-3)

IC-1 and IC-3 both have emission rules in `issue-detection.ts`. Both require `ar.classification === "NO_IDENTIFIABLE_SOURCE"` (via `noAuth = NO_AUTHORITY.has(ar.classification)` where `NO_AUTHORITY = {"NO_IDENTIFIABLE_SOURCE"}`).

**Why Stage 3 never produces `NO_IDENTIFIABLE_SOURCE`:**

`detectAttribution` in `attribution-patterns.ts` applies 10 rules in priority order:

1. AR-SELF-REF → DOCUMENT_AUTHOR
2. AR-PRONOUN-AMBIG → AMBIGUOUS_SOURCE
3. AR-SPEAKER-LABEL → EXPLICIT_NAMED_SOURCE
4. AR-UNATTR-QUOTE → AMBIGUOUS_SOURCE
5. AR-ACCORDING-NAMED/UNNAMED → EXPLICIT_NAMED_SOURCE or EXPLICIT_UNNAMED_SOURCE
6. AR-SUBJECT-NAMED/UNNAMED → EXPLICIT_NAMED_SOURCE or EXPLICIT_UNNAMED_SOURCE
7. AR-POST-NAMED/UNNAMED → EXPLICIT_NAMED_SOURCE or EXPLICIT_UNNAMED_SOURCE
8. AR-ATTR-INLINE → EXPLICIT_NAMED_SOURCE
9. AR-INHERITED → STRUCTURALLY_INHERITED_SOURCE
10. AR-DOCUMENT-AUTHOR → **DOCUMENT_AUTHOR** ← unconditional final fallback

`NO_IDENTIFIABLE_SOURCE` exists in the `AUTHORITY_CLASSIFICATIONS` schema constant (it is a valid type value) but **no rule in `detectAttribution` returns it**. It was documented as the intended classification for "a statement with no identifiable authority and no plausible authority inferable from structure," but the corresponding implementation path was never completed — the fallback at Priority 10 was instead set to `DOCUMENT_AUTHOR`.

**Consequence:** The `noAuth` sentinel is always `false` in any valid pipeline execution. IC-1 and IC-3 are therefore structurally unreachable despite having complete emission-rule implementations.

### 7.2 The no-emission-rule barrier (IC-2, IC-6, IC-8, IC-9)

These four classes have no emission rule in `detectIssues` or anywhere else in the evaluator pipeline. They appear in:
- `issue-classes.ts` — the canonical taxonomy enum
- `model/issues.ts` — comments referencing IC-6 alongside IC-7
- `reviewer-simulation.ts` — IC-8 and IC-9 in the benchmark evidence fixture (not the evaluator)

None of these references constitutes an executable path through the evaluation pipeline.

---

## 8. Defect Classification

### 8.1 IC-1 UNSUPPORTED_CLAIM — DORMANT_SCHEMA_OR_TAXONOMY

The emission rule was implemented. The required upstream state (`NO_IDENTIFIABLE_SOURCE`) was defined in the schema. The producer path in Stage 3 was not completed — the final fallback was set to `DOCUMENT_AUTHOR` instead of `NO_IDENTIFIABLE_SOURCE`. The class exists as a dormant but structurally incomplete pathway.

**This is not an evaluator defect requiring Version 1 correction.** The current behaviour is internally consistent: `DOCUMENT_AUTHOR` is a more informative fallback than `NO_IDENTIFIABLE_SOURCE` for most real documents.

### 8.2 IC-2 AUTHORITY_EXPIRED — IMPLEMENTATION_GAP

Neither the emission rule nor the data structures for temporal authority validation were implemented. The class exists in the canonical taxonomy but has no executable end-to-end path. This is a planned feature not yet implemented.

### 8.3 IC-3 AUTHORITY_ABSENT — DORMANT_SCHEMA_OR_TAXONOMY

Same pattern as IC-1: emission rule exists; `NO_IDENTIFIABLE_SOURCE` producer path in Stage 3 not completed. The absence of IC-3 is a consequence of the same Stage 3 design decision that prevents IC-1.

### 8.4 IC-6 EVIDENCE_CONFLICT — IMPLEMENTATION_GAP

Neither the emission rule nor the conflict-state data structure in Stage 4 were implemented. The class exists in taxonomy and appears in comments but has no executable path.

### 8.5 IC-8 TRACEABILITY_BROKEN — IMPLEMENTATION_GAP

The emission rule was not implemented in the evaluator. The class appears in the reviewer-simulation fixture (which simulates human reviewer findings for governance testing), creating a misleading apparent reference. The evaluator itself never produces IC-8.

### 8.6 IC-9 SCOPE_VIOLATION — IMPLEMENTATION_GAP

Neither the emission rule nor the scope-metadata structures were implemented. No stage captures scope declarations from the input; no stage compares claims against declared scope.

---

## 9. Adversarial Construction Attempt Results

| Target | Input characteristics | Expected trigger path | Barrier stage | Actual output | Conclusion |
|---|---|---|---|---|---|
| IC-1 | CRITICAL mandate, self-referential "We", no citations | Stage 3 → NO_IDENTIFIABLE_SOURCE | Stage 3 | IC-4 (BLOCKING) or IC-5 | Stage 3 → DOCUMENT_AUTHOR; noAuth = false |
| IC-2 | Named standard with explicit expiry year | Temporal check in Stage 3 | Stage 3 | IC-4 or IC-5 | No temporal logic; no emission rule |
| IC-3 | CRITICAL statement, pronoun subject, evidence present | Stage 3 → NO_IDENTIFIABLE_SOURCE | Stage 3 | No IC-3; possible IC-5 | AMBIGUOUS_SOURCE ∉ NO_AUTHORITY; noAuth = false |
| IC-6 | Two named sources with contradictory policies | Stage 4 → conflict state | Stage 4 | No IC-6 | One EvidenceClassification per statement; no conflict-detection logic |
| IC-8 | References to missing annexures, broken citation links | Stage 4 → broken-chain state | Stage 4 | IC-4/IC-5 | NO_DOCUMENT_EVIDENCE assigned; no IC-8 emission rule |
| IC-9 | Explicit EU-only scope; global claims | Stage 5 → scope-violation condition | Stage 5 | No IC-9 | No scope metadata; no IC-9 emission rule |

All six adversarial attempts produced zero instances of their target class. The results are fully predicted by the structural barrier analysis.

---

## 10. Checkpoint Questions Answered

**1. How many canonical issue classes exist?**  
Nine (IC-1 through IC-9).

**2. Which classes are observed and reachable?**  
IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, IC-7 CLAIM_INCONSISTENCY.

**3. Which classes are reachable but unobserved?**  
None — all three reachable classes have been observed in the frozen corpus.

**4. Which classes are structurally unreachable?**  
IC-1, IC-2, IC-3, IC-6, IC-8, IC-9 — six classes.

**5. Are any classes indeterminate?**  
No. All nine classes have conclusive reachability classifications at confidence level 3.

**6. What exact barrier prevents each unreachable class?**  
- IC-1, IC-3: Stage 3 never produces `NO_IDENTIFIABLE_SOURCE` (final fallback is `DOCUMENT_AUTHOR`)
- IC-2: No temporal fields on authority records; no emission rule
- IC-6: No conflict-state in Stage 4; no emission rule
- IC-8: No emission rule in evaluator (only in reviewer simulation)
- IC-9: No scope metadata in pipeline; no emission rule

**7. Is the barrier in schema, upstream stage, fallback logic, filtering, normalisation or emission rule?**  
- IC-1, IC-3: Fallback logic in Stage 3 (`detectAttribution`, Priority 10 rule)
- IC-2, IC-6, IC-8, IC-9: Absent emission rule and absent upstream state structure

**8. Can any unobserved class be triggered through a valid public evaluator input?**  
No. All six adversarial valid-input attempts produced zero instances of their target class.

**9. Can any be triggered only through fabricated internal state?**  
IC-1 and IC-3: Yes, their emission rules can be called with a fabricated `AuthorityRecord` having `classification === "NO_IDENTIFIABLE_SOURCE"`. This is rule-isolation testing only and does not constitute pipeline reachability.

IC-2, IC-6, IC-8, IC-9: No. These classes have no emission rules; fabricating any internal state cannot trigger them.

**10. What is the raw canonical coverage?**  
3/9 = 33.33%

**11. What is the reachable-class coverage?**  
3/3 = 100%

**12. What is the Version 1 maximum attainable coverage ceiling?**  
3/9 = 33.33%. No corpus expansion can exceed this ceiling under the frozen evaluator.

**13. Does the existing 14-document corpus already cover every reachable class?**  
Yes. All three reachable classes (IC-4, IC-5, IC-7) have been observed.

**14. Should further acquisitions target any of the six unobserved classes?**  
No. The six unobserved classes are structurally unreachable. Targeting them produces documented negative results (as demonstrated by DRA-DOC-0014 for IC-3) but cannot exercise the classes.

**15. What evidence objectives should govern Documents 15 onward?**  
See Section 12 (Path Recommendation).

**16. Does this finding expose an evaluator defect?**  
Not a defect requiring Version 1 correction. The unreachable classes reflect a combination of dormant pathways (IC-1, IC-3) and implementation gaps (IC-2, IC-6, IC-8, IC-9). The Version 1 evaluator operates correctly within its actual boundary.

**17. Does it require a Version 1 correction?**  
No. Version 1 remains frozen. The unreachable classes are documented as programme findings, not bugs requiring fixes.

**18. Does it justify future Version 2 design work?**  
Yes. The six implementation gaps and dormant pathways are candidates for Version 2 design: completing the `NO_IDENTIFIABLE_SOURCE` producer path (IC-1, IC-3), adding temporal authority validation (IC-2), adding conflict detection (IC-6), implementing traceability tracking (IC-8), and adding scope-awareness (IC-9).

**19. Does Version 1 remain frozen?**  
Yes. No evaluator semantics have been modified by DRA-CHK-002.

**20. What claims are now permitted and prohibited in benchmark reporting?**  
See Section 11.

---

## 11. Permitted and Prohibited Benchmark Language

### 11.1 Permitted (supported by DRA-CHK-002 analysis)

- "DRA Version 1 defines nine canonical issue classes."
- "Three issue classes are reachable under the frozen Version 1 pipeline: IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, and IC-7 CLAIM_INCONSISTENCY."
- "Six canonical classes are structurally unreachable under the frozen Version 1 pipeline."
- "The 14-document corpus has observed all three of Version 1's reachable issue-class behaviours."
- "Reachable-class coverage is 100% (3/3 reachable classes observed)."
- "Raw canonical coverage is 33.33% (3/9 canonical classes observed)."
- "The maximum attainable issue-class coverage under Version 1 is 3/9 = 33.33%."
- "No corpus expansion under Version 1 can raise issue-class coverage above the 3/9 ceiling."
- "The 14-document corpus does not demonstrate the six unreachable classes because the Version 1 pipeline cannot produce them."
- "IC-3 AUTHORITY_ABSENT was empirically confirmed as structurally unreachable in DRA-BMK-014 using an optimal test case (DRA-DOC-0014)."

### 11.2 Prohibited (not supported — would be misleading)

- ~~"DRA Version 1 detects all nine issue classes."~~ (Only 3 are reachable)
- ~~"Further corpus growth is expected to exercise all nine classes."~~ (6 are structurally unreachable)
- ~~"The six unobserved classes are rare real-world behaviours not yet encountered."~~ (They are unreachable, not rare)
- ~~"The corpus lacks adequate documents for those classes."~~ (The evaluator cannot produce them)
- ~~"Issue-class coverage is incomplete solely because the corpus is small."~~ (It is incomplete because 6 classes are unreachable)
- ~~"IC-1 is reachable because its emission rule exists in issue-detection.ts."~~ (Emission-rule existence ≠ pipeline reachability)

---

## 12. Future Programme Recommendation

### Recommended Path: **Path A — Continue Version 1 evidence expansion with revised objectives**

The Version 1 corpus has achieved its reachable-class coverage ceiling (3/3 = 100%). Further corpus growth under Version 1 should optimise for secondary evidence objectives, not issue-class coverage.

**Revised evidence objectives for DRA-DOC-0015 onward:**

1. **Repeated evidence for reachable classes** — additional IC-4, IC-5, IC-7 observations from diverse publishers and document types (not one each, multiple confirmations)
2. **Domain diversity** — underrepresented domains: no pure AI, HEALTHCARE under-represented
3. **Publisher diversity** — new jurisdictions, non-regulatory publishers, multilateral organisations
4. **Document-type diversity** — STANDARD, TECHNICAL_SPECIFICATION, FRAMEWORK not yet represented
5. **Decision distribution** — additional HOLD documents; any REJECT would be novel
6. **Difficulty coverage** — LOW difficulty currently 7/14 (benchmark docs); HIGH real-world docs remain scarce
7. **Source stability variation** — more TEXT_STABLE observations; HYBRID source type not yet represented
8. **Deterministic execution validation** — continued reproducibility confirmation across corpus growth
9. **Performance benchmarking** — corpus growing; evaluate pipeline performance at scale
10. **Negative controls** — documents designed to produce zero issues (SUPPORTED with evidence) as positive controls

**Path C supplementary:** While continuing Version 1 evidence expansion, open a Version 2 research record documenting the six unreachable classes as design targets. No Version 2 engineering during Version 1 programme.

---

## 13. Version 1 Freeze Status

**Version 1 evaluator: FROZEN — no changes made by DRA-CHK-002**

| Component | Status |
|---|---|
| Evaluator version | `0.1.1` — unchanged |
| Stage 3 authority resolution | Unchanged |
| Stage 4 evidence linkage | Unchanged |
| Stage 5 materiality assessment | Unchanged |
| Stage 6 consistency check / issue detection | Unchanged |
| Issue-class definitions | Unchanged |
| Decision derivation | Unchanged |
| Proof receipt semantics | Unchanged |
| Corpus governance | Unchanged |
| Frozen corpus documents | Unchanged |

---

## 14. Test Suite

| Test category | Tests | Status |
|---|---|---|
| Part 1: Canonical enumeration | 5 | ✓ |
| Part 2: Emission-rule inventory | 4 | ✓ |
| Part 3: Upstream-producer inventory | 6 | ✓ |
| Part 4: Per-class reachability | 11 | ✓ |
| Part 5: Observed-class execution paths | 9 | ✓ |
| Part 6: IC-1/IC-3 barrier proof | 5 | ✓ |
| Part 7: IC-2/6/8/9 barrier proof | 9 | ✓ |
| Part 8: Adversarial construction | 7 | ✓ |
| Part 9: Stage 3 fallback proof | 3 | ✓ |
| Part 10: Corpus reconciliation | 8 | ✓ |
| Part 11: Coverage-ceiling calculation | 11 | ✓ |
| Part 12: Historical consistency | 5 | ✓ |
| Part 13: Freeze preservation | 6 | ✓ |
| **DRA-CHK-002 total** | **89** | **✓** |

*All tests run against the unmodified Version 1 evaluator via canonical `evaluateDocument` entry point. No mocks bypass canonical stages. Rule-isolation tests (Part 6, IC-1 isolation) are clearly labelled as such and do not claim pipeline reachability.*

---

*Report generated: 2026-08-06*  
*Evaluator version: DRA-EVALUATOR-v1 (`0.1.1`) — frozen*  
*Corpus version: DRA-CORPUS-1.14.0 (14 documents, DRA-DOC-0001–0014)*
