# DRA-BMK-013 — Thirteen-Document Corpus Checkpoint Report

**Checkpoint ID:** DRA-CHK-000013  
**Benchmark milestone:** DRA-BMK-013  
**Corpus version:** DRA-CORPUS-1.0.0  
**Checkpoint date:** 2026-08-06  
**Report status:** FINAL

---

## 1. Executive Summary

DRA-BMK-013 extends the validated twelve-document corpus (DRA-BMK-012) with the
admission of DRA-DOC-0013 — the U.S. Food and Drug Administration (FDA)
*Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device
(SaMD) Action Plan* (January 2021). This is the first HEALTHCARE-domain document
and the first FDA document in the corpus.

All 13 documents evaluated without error under the frozen Version 1 evaluator.
Both Run A and Run B are fully reproducible across decisions, substantive proof-receipt
digests, and issue counts. DRA-DOC-0013 returned decision SUPPORTED with zero issues.
Issue-class coverage remains 3/9 — unchanged from DRA-BMK-012 — as DRA-DOC-0013 did
not trigger any additional issue classes under the current evaluator.

The 13-document manifest is structurally intact and the corpus registry correctly
enforces canonical document ordering.

---

## 2. Corpus State

| Field | Value |
|---|---|
| Corpus version | DRA-CORPUS-1.0.0 |
| Document count | 13 |
| Document IDs | DRA-DOC-0001 through DRA-DOC-0013 |
| Manifest integrity | ✓ PASS |
| Manifest digest | Computed per run — consistent across executions |
| 13-document manifest digest (admission) | `f66762257a286cf8869bf4ba8b0dd9ecc3b8424c4f3172e989630be033484ded` |

### Document ID Inventory

| # | Corpus ID | Publisher | Domain | Type | Status |
|---|---|---|---|---|---|
| 1 | DRA-DOC-0001 | Internal (AI generated) | TECHNICAL | REPORT | Initial corpus |
| 2 | DRA-DOC-0002 | Internal (AI generated) | BUSINESS | REPORT | Initial corpus |
| 3 | DRA-DOC-0003 | Internal (AI+human) | GENERAL | REPORT | Initial corpus |
| 4 | DRA-DOC-0004 | Internal (AI generated) | GENERAL | REPORT | Initial corpus |
| 5 | DRA-DOC-0005 | Internal (AI generated) | LEGAL | REPORT | Initial corpus |
| 6 | DRA-DOC-0006 | Internal (human) | TECHNICAL | REPORT | Initial corpus |
| 7 | DRA-DOC-0007 | Apache Software Foundation | TECHNICAL | ARTICLE | DRA-FRZ-000001 |
| 8 | DRA-DOC-0008 | Acas | BUSINESS | PROCEDURE | DRA-FRZ-000002 |
| 9 | DRA-DOC-0009 | Competition and Markets Authority | GENERAL | SUMMARY | DRA-FRZ-000003 |
| 10 | DRA-DOC-0010 | NIST | TECHNICAL | POLICY | DRA-FRZ-000004 |
| 11 | DRA-DOC-0011 | Information Commissioner's Office | LEGAL | OTHER | DRA-FRZ-000005 |
| 12 | DRA-DOC-0012 | PRA, Bank of England | FINANCE | OTHER | DRA-FRZ-000006 |
| 13 | DRA-DOC-0013 | U.S. FDA | HEALTHCARE | POLICY | DRA-FRZ-000007 |

---

## 3. DRA-DOC-0013 Profile

**Title:** Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a
Medical Device (SaMD) Action Plan

| Field | Value |
|---|---|
| Corpus ID | DRA-DOC-0013 |
| Discovery ID | DRA-DIS-000004 |
| Acquisition ID | DRA-ACQ-000015 |
| Freeze ID | DRA-FRZ-000007 |
| Publisher | U.S. Food and Drug Administration (FDA) |
| Domain | HEALTHCARE (first in corpus) |
| Document type | POLICY |
| Source type | HUMAN_AUTHORED |
| Difficulty | MEDIUM |
| Language | en |
| Publication date | January 2021 |
| Source URL | https://www.fda.gov/media/145022/download |
| Landing URL | https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device |
| Licence basis | PUBLIC_DOMAIN |
| Licence name | US Government Work — Public Domain (17 U.S.C. § 105) |
| Source format | PDF (single document) |
| Source byte length | 764,505 bytes |
| Source digest | `83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a` |
| Text digest | `f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186` |
| Metadata digest | `a4337084bfccb3b32741eca377bb0f27a4b0870619f1edc0f9309c190ecf63e2` |
| Freeze record digest | `c084a209cf437421d61888b00d6d602c8e2e7ca121628ee37bb51d26f4a9c511` |
| Text length | 24,390 chars |
| Word count | 3,306 |
| Source stability | BYTE_STABLE (two independent fetches, 2026-08-06) |

### Admission Notes

- First HEALTHCARE-domain document in the corpus.
- New publisher: FDA — distinct from all 12 prior publishers.
- Selected to target unexercised issue classes IC-3 (AUTHORITY_ABSENT) and IC-9
  (SCOPE_VIOLATION). See Section 7 for evaluation outcome.
- Licence basis PUBLIC_DOMAIN (same basis as DRA-DOC-0010 NIST AI RMF).
- 13/13 freeze-eligibility checks passed at admission time.

---

## 4. Freeze Record Verification

| Corpus ID | Freeze ID | Source digest (prefix) | Text digest (prefix) | Metadata digest | FRD digest |
|---|---|---|---|---|---|
| DRA-DOC-0007 | DRA-FRZ-000001 | `a49e60ed…` | (BYTE_STABLE) | — | — |
| DRA-DOC-0008 | DRA-FRZ-000002 | `a4c10388…` | `3b8f3472…` | — | — |
| DRA-DOC-0009 | DRA-FRZ-000003 | `e7fb5008…` | `dee3ab3c…` | `15597eef…` | `092a1219…` |
| DRA-DOC-0010 | DRA-FRZ-000004 | `7576edb5…` | `6cb8afe6…` | `61c283bf…` | `7d99f6b3…` |
| DRA-DOC-0011 | DRA-FRZ-000005 | `b3b98f13…` | `b3b98f13…` | `7a9f8fad…` | `74433e6a…` |
| DRA-DOC-0012 | DRA-FRZ-000006 | `6165a8ba…` | `bd7ad967…` | `ebfefefc…` | `0dea2b61…` |
| DRA-DOC-0013 | DRA-FRZ-000007 | `83c70423…` | `f2d29332…` | `a4337084…` | `c084a209…` |

All 7 live freeze records validated. All source and text digests are valid 64-character
hex strings. Metadata and freeze-record digests are present where applicable (DRA-FRZ-000003
onwards). Source and text digests differ for all PDF documents (expected).

---

## 5. Evaluator Run Results

**Run A fixed timestamp:** `2026-08-06T17:00:00.000Z` (run ID: `bmk-013-run-A`)  
**Run B fixed timestamp:** `2026-08-06T17:30:00.000Z` (run ID: `bmk-013-run-B`)

### Document Count

- **13/13 documents evaluated** in Run A and Run B.
- **0 evaluator-level errors** in either run.
- **13/13 proof receipts passed** structural integrity check (Run A and Run B).

### Live Source Stability (Run A fetch)

| Corpus ID | Stability class | Live match |
|---|---|---|
| DRA-DOC-0008 | BYTE_STABLE (admitted) | ⚠ LIVE_CONTENT_CHANGE_OBSERVED (text grew: 89,713 → 164,726 chars) |
| DRA-DOC-0009 | BYTE_STABLE | ✓ FROZEN_REPRESENTATION_CONFIRMED |
| DRA-DOC-0010 | BYTE_STABLE | ✓ FROZEN_REPRESENTATION_CONFIRMED |
| DRA-DOC-0011 | TEXT_STABLE | ✓ FROZEN_REPRESENTATION_CONFIRMED |
| DRA-DOC-0012 | BYTE_STABLE | ✓ FROZEN_REPRESENTATION_CONFIRMED |
| DRA-DOC-0013 | BYTE_STABLE | ✓ FROZEN_REPRESENTATION_CONFIRMED |

Note: DRA-DOC-0008 (Acas guide) continues to show live content change first observed
in DRA-BMK-011. The evaluator runs on current content; this is classified
LIVE_CONTENT_CHANGE_OBSERVED and does not abort the run.

---

## 6. Decision Matrix

| Corpus ID | Decision (Run A) | Decision (Run B) | Reproducibility |
|---|---|---|---|
| DRA-DOC-0001 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |
| DRA-DOC-0002 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |
| DRA-DOC-0003 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |
| DRA-DOC-0004 | REVIEW | REVIEW | IDENTICAL ✓ |
| DRA-DOC-0005 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |
| DRA-DOC-0006 | REVIEW | REVIEW | IDENTICAL ✓ |
| DRA-DOC-0007 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |
| DRA-DOC-0008 | HOLD | HOLD | IDENTICAL ✓ |
| DRA-DOC-0009 | HOLD | HOLD | IDENTICAL ✓ |
| DRA-DOC-0010 | REVIEW | REVIEW | IDENTICAL ✓ |
| DRA-DOC-0011 | REVIEW | REVIEW | IDENTICAL ✓ |
| DRA-DOC-0012 | REVIEW | REVIEW | IDENTICAL ✓ |
| DRA-DOC-0013 | SUPPORTED | SUPPORTED | IDENTICAL ✓ |

**Decision distribution:**
- SUPPORTED: 6 (DRA-DOC-0001, 0002, 0003, 0005, 0007, **0013**)
- REVIEW: 5 (DRA-DOC-0004, 0006, 0010, 0011, 0012)
- HOLD: 2 (DRA-DOC-0008, 0009)
- REJECT: 0

All 13 decisions are identical across Run A and Run B.

---

## 7. DRA-DOC-0013 Evaluator Result

| Field | Value |
|---|---|
| Decision | SUPPORTED |
| Issues | 0 |
| Issue classes observed | (none) |
| ProofReceipt digest | `c5aaab74e2b793b8cf993629181cab4f46366d87fc306d5f321b475a0c1d4a16` |
| Run A = Run B | ✓ IDENTICAL |
| ProofReceipt integrity | ✓ PASS |

### Target Issue-Class Assessment

DRA-DOC-0013 was selected with the goal of exercising:
- **IC-3 AUTHORITY_ABSENT** — the document references 21 CFR parts, ISO 13485/14971,
  IEC 62304, and HL7 FHIR, suggesting possible authority gaps.
- **IC-9 SCOPE_VIOLATION** — the short (~3,306-word) action plan has broad scope claims
  across patient safety and regulatory contexts.

Under the frozen Version 1 evaluator, neither IC-3 nor IC-9 was triggered. The evaluator
returned decision SUPPORTED with 0 issues. This is a legitimate outcome — the evaluator
is frozen and no tuning was performed. The document is an action plan (not a technical
standard), its regulatory claims are attributed correctly to FDA, and no scope violations
were detected by the current rule set.

**Engineering constraint maintained:** no evaluator rules were modified, no new issue
classes added, no decision logic changed for DRA-DOC-0013.

---

## 8. Issue-Class Coverage Matrix

| # | Class | Status | Documents |
|---|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | **not observed** | — |
| IC-2 | AUTHORITY_EXPIRED | **not observed** | — |
| IC-3 | AUTHORITY_ABSENT | **not observed** | — |
| IC-4 | EVIDENCE_ABSENT | ✓ **COVERED** | DRA-DOC-0008 (×2), DRA-DOC-0009 (×3) |
| IC-5 | EVIDENCE_INADEQUATE | ✓ **COVERED** | DRA-DOC-0004, 0006, 0008 (×8), 0009, 0010, 0011 (×9), 0012 |
| IC-6 | EVIDENCE_CONFLICT | **not observed** | — |
| IC-7 | CLAIM_INCONSISTENCY | ✓ **COVERED** | DRA-DOC-0011 |
| IC-8 | TRACEABILITY_BROKEN | **not observed** | — |
| IC-9 | SCOPE_VIOLATION | **not observed** | — |

**Coverage: 3/9 classes** (IC-4, IC-5, IC-7).  
Unchanged from DRA-BMK-012 — DRA-DOC-0013 did not exercise additional classes.

Unexercised (6/9): IC-1, IC-2, IC-3, IC-6, IC-8, IC-9.

---

## 9. Corpus Balance Statistics

### Domain Distribution (13 documents)

| Domain | Count | Change |
|---|---|---|
| TECHNICAL | 3 | Unchanged |
| BUSINESS | 2 | Unchanged |
| GENERAL | 2 | Unchanged |
| LEGAL | 2 | Unchanged |
| FINANCE | 1 | Unchanged |
| HEALTHCARE | 1 | **+1 (DRA-DOC-0013)** |

### Source-Type Distribution

| Type | Count |
|---|---|
| AI_GENERATED | 6 (initial corpus) |
| HUMAN_AUTHORED | 7 |

### Difficulty Distribution

| Difficulty | Count |
|---|---|
| HIGH | 2 (DRA-DOC-0010, DRA-DOC-0011) |
| MEDIUM | 10 |
| LOW | 1 (DRA-DOC-0008) |

### Document-Type Distribution

| Type | Count |
|---|---|
| REPORT | 6 (initial corpus) |
| POLICY | 2 (DRA-DOC-0010, **DRA-DOC-0013**) |
| OTHER | 2 (DRA-DOC-0011, DRA-DOC-0012) |
| ARTICLE | 1 (DRA-DOC-0007) |
| PROCEDURE | 1 (DRA-DOC-0008) |
| SUMMARY | 1 (DRA-DOC-0009) |

### Source Format Distribution

| Format | Count |
|---|---|
| text/plain (initial corpus) | 6 |
| application/pdf | 5 (DRA-DOC-0008, 0009, 0010, 0012, **0013**) |
| text/html | 1 (DRA-DOC-0007) |
| text/html (multi-page) | 1 (DRA-DOC-0011) |

### Source Stability Distribution

| Class | Count |
|---|---|
| BYTE_STABLE | 12 |
| TEXT_STABLE | 1 (DRA-DOC-0011) |

### Licence Basis Distribution

| Basis | Count |
|---|---|
| AI_GENERATED | 6 |
| OPEN_LICENCE | 4 (Apache, Acas, CMA, ICO) |
| US_GOVERNMENT_WORK (17 USC 105) | 1 (NIST) |
| PUBLIC_DOMAIN (17 USC 105) | 1 (**FDA**) |
| BOE_NON_COMMERCIAL_ACADEMIC | 1 (PRA) |

### Underrepresented Categories

- Domains under 2 documents: HEALTHCARE (1), FINANCE (1)
- Difficulty LOW: 1/13 (under-represented)
- No non-English documents
- No HYBRID source-type documents

---

## 10. Reproducibility Verification

### Full 13-Document Run A vs Run B

All 13 decisions are identical. All 13 substantive proof-receipt digests are identical.
Operational timestamps differ correctly between runs (`17:00:00.000Z` vs `17:30:00.000Z`).

### 6-Document Synchronous Reproducibility (DRA-BMK-013 repro run)

Fixed timestamps:  
- Run A: `2026-08-06T18:00:00.000Z` (run ID: `bmk-013-repro`)  
- Run B: `2026-08-06T18:30:00.000Z` (run ID: `bmk-013-repro`)

All 6 initial-corpus decisions: IDENTICAL. All 6 proof-receipt digests: IDENTICAL.
All proof receipts pass structural integrity check.

---

## 11. Test Suite Counts

| Test file | Tests | Status |
|---|---|---|
| `dra-bmk-013-thirteen-document-checkpoint.test.ts` | 5 | ✓ PASS |
| `dra-bmk-013-evaluator-run.test.ts` | 17 | ✓ PASS |
| `dra-bmk-013-reproducibility.test.ts` | 9 | ✓ PASS |
| **DRA-BMK-013 total** | **31** | **✓ PASS** |

Prior checkpoint (DRA-BMK-012): 125 files, 3,199 tests, 0 failures.  
After DRA-BMK-013: expected **128 files, ~3,230 tests, 0 failures** (pending full-suite run).

---

## 12. Known Observations

1. **DRA-DOC-0008 live content change** — Acas guide text grew from 89,713 chars (admitted)
   to ~164,726 chars at current fetch. The evaluator operates on live content.
   Classified: LIVE_CONTENT_CHANGE_OBSERVED. No corpus freeze integrity impact.

2. **DRA-DOC-0013 did not exercise target classes** — IC-3 and IC-9 were not triggered.
   This is an evaluator behaviour observation, not a failure. The frozen evaluator
   is used as-is; no changes were made to improve coverage.

3. **Coverage plateau at 3/9** — The corpus now contains 13 documents across 6 domains
   without triggering 6 of the 9 issue classes. Future acquisitions targeting these
   classes should consider documents with: explicit authority references that are missing
   or unresolvable (IC-3), contradictory claims (IC-6), broken cross-references (IC-8),
   or statements that exceed the document's stated scope (IC-9).

---

## 13. Identifiers Consumed

| Identifier | Type | Assigned to |
|---|---|---|
| DRA-DIS-000004 | Discovery | FDA AI/ML SaMD Action Plan |
| DRA-ACQ-000015 | Acquisition | DRA-DOC-0013 acquisition record |
| DRA-FRZ-000007 | Freeze | DRA-DOC-0013 freeze record |
| DRA-DOC-0013 | Corpus document | FDA AI/ML SaMD Action Plan |
| DRA-CHK-000013 | Checkpoint | DRA-BMK-013 checkpoint |

---

## 14. Next Steps

The 3/9 coverage plateau is now well-documented. Future acquisitions should target:

- **IC-1 UNSUPPORTED_CLAIM** — documents with unsubstantiated assertions
- **IC-2 AUTHORITY_EXPIRED** — documents citing superseded or lapsed standards
- **IC-3 AUTHORITY_ABSENT** — documents referencing unnamed or missing authorities  
- **IC-6 EVIDENCE_CONFLICT** — documents with internally contradictory evidence bases
- **IC-8 TRACEABILITY_BROKEN** — documents with broken citation chains
- **IC-9 SCOPE_VIOLATION** — documents making claims outside their stated scope

No governance, evaluator, or schema changes are required for the next acquisition cycle.

---

*Report generated: 2026-08-06. Frozen Version 1 evaluator. No evaluator modifications.*
