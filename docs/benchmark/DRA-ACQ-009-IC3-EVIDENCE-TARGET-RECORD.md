# DRA-ACQ-009 — Evidence Target Record
## Issue Class IC-3 AUTHORITY_ABSENT: Structural Analysis and Acquisition Strategy

```
Evidence Target Record
  ID:              DRA-ACQ-009-ETR-001
  Created:         2026-08-06
  Programme stage: Phase 1 — Evidence Target Selection
  Analyst:         DRA benchmark programme (machine analysis)
  Status:          COMPLETE — structural impossibility confirmed; acquisition proceeds
                   for corpus diversity
```

---

## 1. Programme Context

This record documents the Phase 1 evidence-target selection analysis for **DRA-ACQ-009**,
the governed acquisition of **DRA-DOC-0014** — the fourteenth document in the DRA Version 1
benchmark corpus.

Starting canonical state (after DRA-BMK-013):
- Corpus: 13 frozen documents (DRA-DOC-0001 through DRA-DOC-0013)
- Issue-class coverage: **3 of 9** — IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE,
  IC-7 CLAIM_INCONSISTENCY
- Unexercised: IC-1, IC-2, IC-3, IC-6, IC-8, IC-9

The evaluator is frozen at Version 1. No evaluator changes are permitted under the
DRA-ENG-009 governed acquisition protocol.

---

## 2. Issue-Class Inventory and Feasibility Analysis

### 2.1 Source files examined

| Stage | File |
|-------|------|
| Stage 3 attribution detection | `attribution-patterns.ts` |
| Stage 3 classification model | `authority-classification.ts` |
| Stage 3 entry point | `resolve-authority.ts` |
| Stage 4 evidence linkage | `linkage-rules.ts` |
| Stage 5 materiality rules | `materiality-rules.ts` |
| Stage 6 issue detection | `issue-detection.ts` |

### 2.2 Stage 6 implementation inventory

Stage 6 (`issue-detection.ts`) contains detection rules for five of the nine issue classes:

| Class | Stage 6 rules present? |
|-------|------------------------|
| IC-1 UNSUPPORTED_CLAIM | **YES** |
| IC-2 AUTHORITY_EXPIRED | NO — not implemented |
| IC-3 AUTHORITY_ABSENT | **YES** |
| IC-4 EVIDENCE_ABSENT | YES (covered) |
| IC-5 EVIDENCE_INADEQUATE | YES (covered) |
| IC-6 EVIDENCE_CONFLICT | NO — not implemented |
| IC-7 CLAIM_INCONSISTENCY | YES (covered) |
| IC-8 TRACEABILITY_BROKEN | NO — not implemented |
| IC-9 SCOPE_VIOLATION | NO — not implemented |

### 2.3 Stage 3 production-path analysis for NO_IDENTIFIABLE_SOURCE

IC-1 and IC-3 both require `ar.classification === "NO_IDENTIFIABLE_SOURCE"` (via the
sentinel set `NO_AUTHORITY = new Set(["NO_IDENTIFIABLE_SOURCE"])` in Stage 6).

Stage 3 assigns authority classifications exclusively through `detectAttribution()` in
`attribution-patterns.ts`. The detection function applies thirteen rules in priority order:

| Priority | Rule | Result classification |
|----------|------|-----------------------|
| 1 | AR-SELF-REF | DOCUMENT_AUTHOR |
| 2 | AR-PRONOUN-AMBIG | AMBIGUOUS_SOURCE |
| 3 | AR-SPEAKER-LABEL | EXPLICIT_NAMED_SOURCE |
| 4 | AR-UNATTR-QUOTE | AMBIGUOUS_SOURCE |
| 5 | AR-ACCORDING-NAMED | EXPLICIT_NAMED_SOURCE |
| 6 | AR-ACCORDING-UNNAMED | EXPLICIT_UNNAMED_SOURCE |
| 7 | AR-SUBJECT-NAMED | EXPLICIT_NAMED_SOURCE |
| 8 | AR-SUBJECT-UNNAMED | EXPLICIT_UNNAMED_SOURCE |
| 9 | AR-POST-NAMED | EXPLICIT_NAMED_SOURCE |
| 10 | AR-POST-UNNAMED | EXPLICIT_UNNAMED_SOURCE |
| 11 | AR-ATTR-INLINE | EXPLICIT_NAMED_SOURCE |
| 12 | AR-INHERITED | STRUCTURALLY_INHERITED_SOURCE |
| 13 | AR-DOCUMENT-AUTHOR *(default)* | **DOCUMENT_AUTHOR** |

**Critical finding**: `NO_IDENTIFIABLE_SOURCE` is defined as a valid `AuthorityClassification`
in `authority-classification.ts`, but it has **no production path** in `detectAttribution()`.
The classification description states it is used "when the text hints at an external source
but provides no basis for deterministic resolution." However, the closest matching rule in
the current engine is AR-DOCUMENT-AUTHOR (the default fallback), which returns `DOCUMENT_AUTHOR`
— not `NO_IDENTIFIABLE_SOURCE`.

`resolve-authority.ts` never constructs an `AuthorityRecord` with `NO_IDENTIFIABLE_SOURCE`
independently; it always uses the `DetectionResult.classification` returned by
`detectAttribution()`.

**Conclusion**: `NO_IDENTIFIABLE_SOURCE` is a dead classification in the Version 1 engine.
It cannot be produced by any statement pattern in any real-world document.

---

## 3. Trigger Condition Analysis for All Six Unexercised Classes

### IC-3 AUTHORITY_ABSENT *(primary target)*

```
Stage 6 trigger condition (from issue-detection.ts):
  isHighOrCritical  = mat ∈ {"CRITICAL", "HIGH"}
  noAuth            = ar.classification ∈ NO_AUTHORITY = {"NO_IDENTIFIABLE_SOURCE"}
  noEvid            = er.classification ∈ NO_EVIDENCE  = {"NO_DOCUMENT_EVIDENCE"}
  IC-3 fires when:  isHighOrCritical AND noAuth AND !noEvid
```

Stage 3 barrier: `noAuth` can never be true because `detectAttribution()` never returns
`NO_IDENTIFIABLE_SOURCE`. IC-3 **cannot fire** for any document under the frozen evaluator.

**Status: STRUCTURALLY UNTRIGGERABLE — Stage 3 production path does not exist.**

### IC-1 UNSUPPORTED_CLAIM

```
Stage 6 trigger condition:
  IC-1 fires when:  isHighOrCritical AND noAuth AND noEvid
```

Same Stage 3 barrier: `noAuth` is always false. Additionally, IC-1 requires both no
authority AND no evidence — a stricter condition than IC-3. IC-1 **cannot fire**.

**Status: STRUCTURALLY UNTRIGGERABLE — Stage 3 production path does not exist.**

### IC-2 AUTHORITY_EXPIRED

No detection rules for IC-2 exist anywhere in Stage 6. The class would require temporal
analysis of authority dates, which Stage 3 does not perform (no date parsing, no currency
checking). IC-2 **cannot fire**.

**Status: NOT IMPLEMENTED in Stage 6 — no detection rules.**

### IC-6 EVIDENCE_CONFLICT

No detection rules for IC-6 exist in Stage 6. The class would require cross-statement
comparison of evidence items. IC-6 **cannot fire**.

**Status: NOT IMPLEMENTED in Stage 6 — no detection rules.**

### IC-8 TRACEABILITY_BROKEN

No detection rules for IC-8 exist in Stage 6. The class would require citation-chain
validation beyond the per-statement evidence linkage model. IC-8 **cannot fire**.

**Status: NOT IMPLEMENTED in Stage 6 — no detection rules.**

### IC-9 SCOPE_VIOLATION

No detection rules for IC-9 exist in Stage 6. The class would require cross-statement
comparison of scope boundaries. IC-9 **cannot fire**.

**Status: NOT IMPLEMENTED in Stage 6 — no detection rules.**

---

## 4. Issue-Class Ranking

| Rank | Class | Basis for rank |
|------|-------|----------------|
| 1 | **IC-3 AUTHORITY_ABSENT** | Stage 6 has implementation; barrier is Stage 3 (closer to triggerable in principle) |
| 2 | IC-1 UNSUPPORTED_CLAIM | Same Stage 3 barrier; stricter condition (requires also no evidence) |
| 3 | IC-9 SCOPE_VIOLATION | Stage 6 not implemented; appeared in reviewer simulation (conceptually clear) |
| 4 | IC-2 AUTHORITY_EXPIRED | Stage 6 not implemented; requires temporal authority analysis |
| 5 | IC-6 EVIDENCE_CONFLICT | Stage 6 not implemented; requires cross-statement evidence comparison |
| 6 | IC-8 TRACEABILITY_BROKEN | Stage 6 not implemented; requires citation-chain validation (most complex) |

---

## 5. Primary Target Selection

**Primary target: IC-3 AUTHORITY_ABSENT**

IC-3 is ranked first because Stage 6 contains a complete implementation of its detection
logic. The barrier is exclusively in Stage 3 — `detectAttribution()` lacks a production
path to `NO_IDENTIFIABLE_SOURCE`. If a future Version 2 evaluator were to add this
production path (e.g. a rule that returns `NO_IDENTIFIABLE_SOURCE` when a statement
contains a vague external-attribution marker that matches none of the existing attribution
patterns), IC-3 would immediately become triggerable.

**Secondary target: None**

IC-1 (ranked 2nd) shares the identical Stage 3 barrier and is eliminated by the same
structural reason. IC-9 through IC-8 (ranked 3rd–6th) have no Stage 6 implementation
and are eliminated at an earlier stage. No secondary target is designated — the acquisition
can proceed directly to corpus diversity objectives once the IC-3 negative result is confirmed.

---

## 6. Hypothesis and Expected Outcomes

**Hypothesis**: No document in any public corpus can trigger IC-3 AUTHORITY_ABSENT under
the frozen Version 1 evaluator, regardless of content. The structural barrier (Stage 3
never producing `NO_IDENTIFIABLE_SOURCE`) guarantees a negative result.

**Expected pipeline outcome**: A well-structured regulatory governance document will
produce REVIEW (ADVISORY issues from IC-5 EVIDENCE_INADEQUATE) or HOLD (BLOCKING issues
from IC-4 EVIDENCE_ABSENT). IC-3 will not appear in any issue list.

**Explicit failure criteria**:
- If IC-3 does appear in the pipeline output, that is an evaluator implementation error
  (either Stage 3 was modified or Stage 6 misidentifies the classification sentinel).
  The test must fail and the anomaly must be investigated before proceeding.
- If the document cannot be fetched, normalised, or frozen under governance requirements,
  the candidate is replaced with the next-ranked candidate (see §7).

**Corpus diversity success criteria** (achievable regardless of IC-3 outcome):
- New publisher not previously in corpus
- New jurisdiction (not US, not UK)
- Second document in an under-represented domain (FINANCE: currently 1 real-world doc)
- Source BYTE_STABLE and licence verified

---

## 7. Acquisition Strategy

Since all six unexercised issue classes are structurally untriggerable, the acquisition
objective shifts to **corpus diversity**. The fourteenth document should maximise the
number of diversity dimensions added simultaneously:

| Dimension | Target |
|-----------|--------|
| Publisher | New (not in DRA-DOC-0001–0013) |
| Jurisdiction | International or non-US/non-UK |
| Domain | FINANCE (second real-world after PRA SS1/23) |
| Licence | CC BY 4.0 or equivalent open licence |
| Difficulty | HIGH (under-represented: currently 2 of 13) |
| Document type | REPORT or POLICY (normative regulatory content) |

**Primary candidate (DRA-DIS-000005)**:

```
Document:    Principles for Operational Resilience
Publisher:   Basel Committee on Banking Supervision (BCBS)
Institution: Bank for International Settlements (BIS)
URL (PDF):   https://www.bis.org/bcbs/publ/d516.pdf
Date:        March 2021
Domain:      FINANCE
Jurisdiction: International (BIS, Basel, Switzerland)
Licence:     Creative Commons Attribution 4.0 International (CC BY 4.0)
```

Rationale: BCBS d516 is an authoritative international banking regulatory framework
published by the Basel Committee (BCBS), secretariat at the Bank for International
Settlements (BIS). It is a compact (~25–30 pages), principles-based governance document
with extensive "must/shall" normative language — high expected IC-4/IC-5 yield. The BIS
is an international institution headquartered in Basel, Switzerland, adding a new
jurisdiction and publisher. All BIS publications use CC BY 4.0, a strong open licence
that is compatible with any use. The FINANCE domain has only one real-world representative
(PRA SS1/23, a UK prudential regulator); BIS/BCBS adds an international counterpart.

---

## 8. Governance Notes

- This record constitutes the Phase 1 evidence-target completion for DRA-ACQ-009.
- No evaluator rules are modified as a result of this analysis.
- The finding that IC-3 is untriggerable is documented in the BMK-014 checkpoint report.
- The acquisition proceeds to Phase 2 (candidate discovery and qualification) using the
  primary candidate identified in §7.
- If the primary candidate fails any of the 14 acquisition governance requirements
  (fetch failure, licence failure, size limit, near-duplicate match, etc.), fallback
  candidates are:
  1. EBA Report on Big Data and Advanced Analytics (European Banking Authority, EU)
  2. APRA CPS 230 Operational Risk Management (Australian Prudential Regulation Authority)
