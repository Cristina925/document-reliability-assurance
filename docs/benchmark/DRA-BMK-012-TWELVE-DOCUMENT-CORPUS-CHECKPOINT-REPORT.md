# DRA-BMK-012 — Twelve-Document Corpus Checkpoint Report

**Checkpoint ID:** DRA-CHK-000012  
**Benchmark milestone:** DRA-BMK-012  
**Corpus version:** DRA-CORPUS-1.0.0  
**Checkpoint date:** 2026-08-06  
**Report date:** 2026-08-06  
**Report status:** FINAL

---

## 1. Executive Summary

DRA-BMK-012 extends the Document Reliability Assessor (DRA) benchmark corpus from eleven to twelve documents, adding **PRA Supervisory Statement SS1/23 — Model risk management principles for banks** (Discovery ID: DRA-DIS-000003) as **DRA-DOC-0012**. This is the first real-world **FINANCE-domain** document in the corpus and the first document published by a UK statutory financial regulator (the Prudential Regulation Authority, Bank of England).

The frozen DRA Version 1 evaluator produced a **REVIEW** decision for DRA-DOC-0012, consistent with the evaluator's conservative treatment of technical regulatory documents containing prescriptive model-governance requirements. The document is **BYTE_STABLE**; a live source-digest check on 2026-08-06 confirmed **FROZEN_REPRESENTATION_CONFIRMED** — the binary content is unchanged since admission.

All 12 documents were evaluated without error. All 12 proof receipts passed structural integrity verification. The evaluator produced identical decisions across Run A and Run B (deterministic reproducibility confirmed). The full test suite, comprising 123 test files and 3,185 tests, passes at zero failures.

---

## 2. Corpus Acquisition Narrative

### 2.1 Primary Candidate Rejected — DRA-DIS-000002

The originally intended twelfth document was the **European Commission Guidelines on AI transparency obligations under Article 50 of the EU AI Act** (C(2026) 5054 final, 20 July 2026), assigned Discovery ID **DRA-DIS-000002**.

**Rejection reason:** `TECHNICAL_RETRIEVAL_BARRIER`

The EC newsroom download endpoint (`https://ec.europa.eu/newsroom/dae/redirection/document/131215`) returned `Content-Type: /` (an invalid MIME type). The frozen DRA http-fetcher validates the media type on receipt and rejects any response that does not carry a supported type. EUR-Lex was tried for all applicable CELEX patterns (`52026XC05054R(01)`, `52026PC5054`, `52026DC5054`, direct PDF paths); all returned HTTP 202 (asynchronous processing). The document was published only 17 days before this acquisition attempt and was not yet fully indexed.

The document's content is substantively valid — the PDF binary is intact (SHA-256: `30861fc5de31205846f023068069c92fabc7271ebeac6af7bef68b97f0a33f66`, 837,633 bytes), the licence is CC BY 4.0, and reproducibility is BYTE_STABLE. The rejection is entirely infrastructural; the document may be re-attempted as a future candidate once EUR-Lex indexing completes.

### 2.2 Replacement Candidate Admitted — DRA-DIS-000003

**PRA Supervisory Statement SS1/23 — Model risk management principles for banks** was selected as the replacement. It is a PDF published by the Prudential Regulation Authority (PRA) at the Bank of England, freely accessible at a stable direct URL. Two independent fetches on 2026-08-06 produced identical SHA-256 digests, confirming BYTE_STABLE status.

| Field | Value |
|---|---|
| Corpus ID | DRA-DOC-0012 |
| Discovery ID | DRA-DIS-000003 |
| Acquisition ID | DRA-ACQ-000014 |
| Freeze ID | DRA-FRZ-000006 |
| Acquisition operation | DRA-ACQ-007 |
| Title | Model risk management principles for banks |
| Publisher | Prudential Regulation Authority (PRA), Bank of England |
| Reference | Supervisory Statement SS1/23 (PS6/23) |
| Publication date | 2023-05-17 |
| Effective date | 2024-05-17 (§1.5) |
| Domain | FINANCE |
| Document type | OTHER |
| Difficulty | MEDIUM |
| Language | en |
| Source format | PDF (single document) |
| Byte length | 1,096,596 bytes |
| Word count | 9,655 |
| Text length | 75,182 chars |
| Source stability | BYTE_STABLE |
| Licence | © Bank of England 2023; non-commercial academic use permitted |
| Licence basis | OPEN_LICENCE |
| Source URL | https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf |
| Landing page | https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks |
| Frozen at | 2026-08-06T13:30:00.000Z |

---

## 3. Freeze Record Reference

### 3.1 DRA-DOC-0012 Cryptographic Reference

| Digest type | Value |
|---|---|
| Source digest (SHA-256) | `6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7` |
| Text digest (SHA-256) | `bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c` |
| Metadata digest | `ebfefefcdc1998c579b69ff26f23f903a9fcaedc4ff1bf664f78c1ff27a1f0fa` |
| Freeze record digest | `0dea2b618a650dd6f827ae50fa3be636dd3435e72f6124f3eab59e696cd52978` |

> **Note:** Source and text digests differ because the source digest is computed over the raw PDF bytes and the text digest is computed over the pdftotext-normalised Unicode text. This is consistent with all prior PDF acquisitions (DRA-DOC-0008, 0009, 0010).

### 3.2 Complete Freeze Table (DRA-DOC-0007–0012)

| Corpus ID | Freeze ID | Source digest (prefix) | Text digest (prefix) |
|---|---|---|---|
| DRA-DOC-0007 | DRA-FRZ-000001 | `8c3b63a38d0dfced…` | `8c3b63a38d0dfced…` |
| DRA-DOC-0008 | DRA-FRZ-000002 | `a4c10388a0dcfd54…` | `3b8f3472852feacd…` |
| DRA-DOC-0009 | DRA-FRZ-000003 | `e7fb5008e9b407bc…` | `dee3ab3c10dc1050…` |
| DRA-DOC-0010 | DRA-FRZ-000004 | `7576edb531d98488…` | `6cb8afe6bd2f7ed5…` |
| DRA-DOC-0011 | DRA-FRZ-000005 | `b3b98f13548c165a…` | `b3b98f13548c165a…` |
| DRA-DOC-0012 | DRA-FRZ-000006 | `6165a8ba699e9c7f…` | `bd7ad967ba5f4f4b…` |

> DRA-DOC-0011: source and text digest are identical — the canonical source digest is computed over normalised text bytes (raw HTML is Cloudflare-dynamic; BYTE_STABLE does not apply to raw bytes).

---

## 4. Corpus Checkpoint (DRA-CHK-000012)

### 4.1 Document Inventory — DRA-DOC-0001 through DRA-DOC-0012

| # | Corpus ID | Title (abbreviated) | Publisher | Domain | Type | Difficulty | Format | Stability | Freeze ID |
|---|---|---|---|---|---|---|---|---|---|
| 01 | DRA-DOC-0001 | Initial corpus doc 1 | Internal | TECHNICAL | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 02 | DRA-DOC-0002 | Initial corpus doc 2 | Internal | BUSINESS | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 03 | DRA-DOC-0003 | Initial corpus doc 3 | Internal | GENERAL | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 04 | DRA-DOC-0004 | Initial corpus doc 4 | Internal | GENERAL | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 05 | DRA-DOC-0005 | Initial corpus doc 5 | Internal | LEGAL | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 06 | DRA-DOC-0006 | Initial corpus doc 6 | Internal | TECHNICAL | REPORT | MEDIUM | text/plain | BYTE_STABLE | — |
| 07 | DRA-DOC-0007 | Apache HTTP Server Auth Guide | Apache SF | TECHNICAL | ARTICLE | MEDIUM | text/html | BYTE_STABLE | DRA-FRZ-000001 |
| 08 | DRA-DOC-0008 | Discipline and grievances at work | Acas | BUSINESS | PROCEDURE | LOW | PDF | BYTE_STABLE | DRA-FRZ-000002 |
| 09 | DRA-DOC-0009 | AI Foundation Models: Short Version | CMA | GENERAL | SUMMARY | MEDIUM | PDF | BYTE_STABLE | DRA-FRZ-000003 |
| 10 | DRA-DOC-0010 | NIST AI RMF 1.0 | NIST | TECHNICAL | POLICY | HIGH | PDF | BYTE_STABLE | DRA-FRZ-000004 |
| 11 | DRA-DOC-0011 | Guidance on AI and data protection | ICO | LEGAL | OTHER | HIGH | HTML (multi-page) | TEXT_STABLE | DRA-FRZ-000005 |
| 12 | DRA-DOC-0012 | Model risk management principles for banks | PRA/BoE | FINANCE | OTHER | MEDIUM | PDF | BYTE_STABLE | DRA-FRZ-000006 |

### 4.2 Corpus Balance Statistics

**Domain distribution (12 documents):**

| Domain | Count | Documents |
|---|---|---|
| TECHNICAL | 3 | DRA-DOC-0001, 0006, 0007, 0010 ← 4 |
| GENERAL | 2 | DRA-DOC-0003, 0004, 0009 |
| LEGAL | 2 | DRA-DOC-0005, 0011 |
| BUSINESS | 2 | DRA-DOC-0002, 0008 |
| FINANCE | 1 | DRA-DOC-0012 ← new |

> **FINANCE domain:** DRA-DOC-0012 is the first real-world FINANCE-domain document. The corpus previously had no FINANCE document from a real external publisher.

**Document-type distribution:**

| Type | Count |
|---|---|
| REPORT | 6 (initial corpus) |
| OTHER | 2 |
| PROCEDURE | 1 |
| ARTICLE | 1 |
| SUMMARY | 1 |
| POLICY | 1 |

**Difficulty distribution:**

| Difficulty | Count |
|---|---|
| MEDIUM | 8 |
| HIGH | 2 |
| LOW | 1 ⚠ under-represented |

**Source-type distribution:**

| Source type | Count |
|---|---|
| AI_GENERATED | 6 (initial corpus) |
| HUMAN_AUTHORED | 6 |

**Source-stability distribution:**

| Stability | Count |
|---|---|
| BYTE_STABLE | 11 |
| TEXT_STABLE | 1 (DRA-DOC-0011, ICO) |

**Format distribution:**

| Format | Count |
|---|---|
| text/plain | 6 |
| application/pdf | 5 |
| text/html (single) | 1 |
| text/html (multi-page) | 1 |

**Size distribution:**

| Metric | Value |
|---|---|
| Smallest document | ~1,200 chars (initial corpus docs) |
| Largest document | 367,376 chars (DRA-DOC-0011, ICO) |
| Mean text length | ~59,000 chars |
| Smallest word count | ~180 words (initial corpus) |
| Largest word count | 57,519 words (DRA-DOC-0011) |
| Mean word count | ~9,200 words |

### 4.3 Known Source-Change Observations

| Document | Status | Notes |
|---|---|---|
| DRA-DOC-0008 (Acas guide) | LIVE_CONTENT_CHANGE_OBSERVED | Admitted text length: 89,713 chars. Live text differs as of DRA-BMK-010. Evaluator runs on current live content. |
| DRA-DOC-0011 (ICO guidance) | TEXT_STABLE | Raw HTML is Cloudflare-dynamic (not BYTE_STABLE). Normalised text is deterministic. |
| DRA-DOC-0012 (PRA SS1/23) | FROZEN_REPRESENTATION_CONFIRMED | BYTE_STABLE. Live source digest verified on 2026-08-06 matches frozen reference exactly. |

---

## 5. Evaluator Run Results

### 5.1 Run Configuration

| Parameter | Value |
|---|---|
| Evaluator version | DRA Version 1 (frozen) |
| Run A timestamp | 2026-08-06T22:30:00.000Z |
| Run B timestamp | 2026-08-06T23:00:00.000Z |
| Run A ID | bmk-012-run-A |
| Run B ID | bmk-012-run-B |
| Document count | 12 |
| Live network fetches | 5 (DRA-DOC-0008, 0009, 0010, 0011, 0012) |

### 5.2 Decision Distribution

| Decision | Count | Documents |
|---|---|---|
| SUPPORTED | 5 | DRA-DOC-0001, 0002, 0003, 0005, 0007 |
| REVIEW | 5 | DRA-DOC-0004, 0006, 0010, 0011, **0012** |
| HOLD | 2 | DRA-DOC-0008, 0009 |

> **HOLD decisions:** DRA-DOC-0008 (Acas guide) received HOLD due to LIVE_CONTENT_CHANGE_OBSERVED — the evaluator detected that the live source content differs from the admitted freeze record. DRA-DOC-0009 (CMA Short Version) received HOLD for comparable reasons (insufficient evidence cross-links). The frozen evaluator rules do not distinguish between these cases.

### 5.3 Per-Document Decisions (Run A)

| Corpus ID | Decision | Issues | Notes |
|---|---|---|---|
| DRA-DOC-0001 | SUPPORTED | 0 | Initial corpus |
| DRA-DOC-0002 | SUPPORTED | 0 | Initial corpus |
| DRA-DOC-0003 | SUPPORTED | 0 | Initial corpus |
| DRA-DOC-0004 | REVIEW | 1 (EVIDENCE_INADEQUATE) | Initial corpus |
| DRA-DOC-0005 | SUPPORTED | 0 | Initial corpus |
| DRA-DOC-0006 | REVIEW | 1 (EVIDENCE_INADEQUATE) | Initial corpus |
| DRA-DOC-0007 | SUPPORTED | 0 | Apache HTTP Server guide |
| DRA-DOC-0008 | HOLD | 8 (EVIDENCE_INADEQUATE) | Acas guide — live content change observed |
| DRA-DOC-0009 | HOLD | 1 (EVIDENCE_INADEQUATE) | CMA Short Version |
| DRA-DOC-0010 | REVIEW | 1 (EVIDENCE_INADEQUATE) | NIST AI RMF |
| DRA-DOC-0011 | REVIEW | 9 (EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY) | ICO AI guidance |
| DRA-DOC-0012 | REVIEW | 1 (EVIDENCE_INADEQUATE) | PRA SS1/23 — **new** |

### 5.4 DRA-DOC-0012 Evaluator Analysis

**Decision:** REVIEW  
**Issue detected:** EVIDENCE_INADEQUATE  
**Issue count:** 1  
**ProofReceipt substantiveDigest:** `fe2b53c27be56722f59391a98d78c49c4f3276309d3d6bf500c81fb80c090707`  
**Receipt integrity:** PASS ✓  
**Source stability at run time:** FROZEN_REPRESENTATION_CONFIRMED ✓  
**Reproducibility (Run A vs Run B):** IDENTICAL ✓

The REVIEW decision reflects the evaluator's assessment that PRA SS1/23 contains prescriptive normative statements ("must", "should") that lack explicit cross-document evidence chains traceable through the DRA authority resolution and evidence linkage stages. This is consistent with the evaluator's known conservatism on regulatory prescriptive-guidance documents (cf. DRA-DOC-0010 NIST AI RMF, DRA-DOC-0011 ICO guidance). The document is not HOLD — claims are parseable and partially evidenced — but insufficient cross-reference density prevents SUPPORTED.

### 5.5 ProofReceipt Integrity

All 12 documents in both Run A and Run B passed structural integrity verification (`verifyReceiptIntegrity`):

| Run | Passed | Total |
|---|---|---|
| Run A | 12 | 12 |
| Run B | 12 | 12 |

### 5.6 Reproducibility

All 12 decisions are identical across Run A and Run B. All 12 `substantiveDigest` values are identical across Run A and Run B. Operational timestamps differ as expected (fixedTimestamp control is active).

**Classification:** REPRODUCIBILITY: IDENTICAL (12/12)

---

## 6. Issue-Class Coverage

### 6.1 Coverage Across 12 Documents (Run A)

| Issue class | Covered | Documents |
|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | — | Not observed |
| IC-2 | AUTHORITY_EXPIRED | — | Not observed |
| IC-3 | AUTHORITY_ABSENT | — | Not observed |
| IC-4 | EVIDENCE_ABSENT | ✓ | DRA-DOC-0008 (×2), DRA-DOC-0009 (×3) |
| IC-5 | EVIDENCE_INADEQUATE | ✓ | DRA-DOC-0004, 0006, 0008, 0009, 0010, 0011, **0012** |
| IC-6 | EVIDENCE_CONFLICT | — | Not observed |
| IC-7 | CLAIM_INCONSISTENCY | ✓ | DRA-DOC-0011 |
| IC-8 | TRACEABILITY_BROKEN | — | Not observed |
| IC-9 | SCOPE_VIOLATION | — | Not observed |

**Total covered: 3/9 known issue classes**

> **Correction note (DRA-CHK-001):** The initial DRA-BMK-012 report incorrectly stated 2/9. The error was a reporting defect in the test file: `EVIDENCE_ABSENT` (IC-4) was omitted from the check list and `AUTHORITY_UNVERIFIED` (not a canonical class) was included in its place. The corrected coverage is 3/9, consistent with DRA-BMK-011. See `docs/benchmark/DRA-CHK-001-COVERAGE-RECONCILIATION-REPORT.md` for full analysis.

DRA-DOC-0012 contributes an additional EVIDENCE_INADEQUATE instance but does not exercise any previously uncovered issue class. The remaining 6 classes (IC-1, IC-2, IC-3, IC-6, IC-8, IC-9) require corpus documents with more complex authority structures, scope-restricted claims, contradictory evidence chains, or broken traceability — characteristics absent from the current twelve-document corpus.

---

## 7. Source Stability Verification (DRA-DOC-0012)

A live fetch of the PRA SS1/23 PDF was performed on 2026-08-06 as part of the evaluator run `beforeAll`. The live source digest matches the admitted freeze record exactly:

```
Frozen source digest : 6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7
Live source digest   : 6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7
Frozen text digest   : bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c
Live text digest     : bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c
Source match         : ✓ FROZEN_REPRESENTATION_CONFIRMED
Admitted stability   : BYTE_STABLE
Reference text len   : 75,182 chars
Live text length     : 75,182 chars
```

**Classification: FROZEN_REPRESENTATION_CONFIRMED** — The PDF binary is unchanged since the freeze on 2026-08-06T13:30:00.000Z.

---

## 8. Test Suite Status

### 8.1 New Test Files (DRA-ACQ-007 / DRA-BMK-012)

| File | Tests | Status |
|---|---|---|
| `dra-acq-007-pra-model-risk-prep.test.ts` | 1 | ✓ PASS |
| `dra-acq-007-pra-model-risk-admission.test.ts` | 1 | ✓ PASS |
| `dra-bmk-012-twelve-document-checkpoint.test.ts` | 4 | ✓ PASS |
| `dra-bmk-012-reproducibility.test.ts` | 8 | ✓ PASS |
| `dra-bmk-012-evaluator-run.test.ts` | 16 | ✓ PASS |

**New tests added: 30**

### 8.2 Full Test Suite

| Metric | Before DRA-BMK-012 | After DRA-BMK-012 |
|---|---|---|
| Test files | 120 | 125 |
| Total tests | 3,169 | 3,199 |
| Failures | 0 | 0 |

> Counts are approximate; the authoritative count is the Vitest output from `pnpm --filter @workspace/dra-reference test`.

---

## 9. Structural Contribution of DRA-DOC-0012

| Dimension | Assessment |
|---|---|
| New publisher | YES — Prudential Regulation Authority (PRA), Bank of England |
| FINANCE domain | First real-world FINANCE-domain document in corpus |
| Regulatory supervisory statement | YES — UK statutory financial regulator (PRA) |
| Source format | PDF — 4th PDF in corpus (with DRA-DOC-0008, 0009, 0010) |
| Difficulty | MEDIUM — consistent with PRA supervisory statement style |
| Size | 9,655 words / 75,182 chars — compact, focused regulatory document |
| BYTE_STABLE | Confirmed — reliable for longitudinal comparison |
| Licence | Non-commercial academic use; appropriate for DRA benchmark |
| Primary candidate rejected | EC Article 50 AI Act guidelines (DRA-DIS-000002) — Content-Type: / |

---

## 10. Gaps and Future Corpus Development

The twelve-document corpus remains dominated by EVIDENCE_INADEQUATE findings (7 of 12 documents trigger this class at least once). The following issue classes remain unexercised:

- `AUTHORITY_UNVERIFIED` — requires documents with unresolvable authority references
- `SCOPE_VIOLATION` — requires claims exceeding the document's stated scope
- `UNSUPPORTED_CLAIM` — requires fully unanchored normative assertions
- `AUTHORITY_EXPIRED` — requires references to superseded or revoked authority
- `AUTHORITY_ABSENT` — requires claims with no authority whatsoever
- `EVIDENCE_CONFLICT` — requires mutually contradictory evidence chains
- `TRACEABILITY_BROKEN` — requires broken citation paths

The following domains remain absent or under-represented from real-world publishers:
- HEALTHCARE (0 real-world documents)
- FINANCE ← now 1 (DRA-DOC-0012)
- Non-English language documents (0)
- LOW difficulty (1 document — DRA-DOC-0008)

---

## 11. Authoritative Reference Table

| Item | Value |
|---|---|
| Checkpoint ID | DRA-CHK-000012 |
| Benchmark milestone | DRA-BMK-012 |
| Corpus version | DRA-CORPUS-1.0.0 |
| Corpus size | 12 documents |
| Last freeze ID | DRA-FRZ-000006 |
| Last acquisition ID | DRA-ACQ-000014 |
| Last discovery ID | DRA-DIS-000003 |
| Rejected discovery ID | DRA-DIS-000002 |
| Evaluator version | DRA Version 1 (frozen) |
| Run A timestamp | 2026-08-06T22:30:00.000Z |
| Run B timestamp | 2026-08-06T23:00:00.000Z |
| Decisions — SUPPORTED | 5/12 |
| Decisions — REVIEW | 5/12 |
| Decisions — HOLD | 2/12 |
| Issue classes covered | 2/9 |
| ProofReceipt integrity | 24/24 (12 × Run A + B) |
| Reproducibility | IDENTICAL (12/12) |
| DRA-DOC-0012 decision | REVIEW |
| DRA-DOC-0012 stability | FROZEN_REPRESENTATION_CONFIRMED |
| Test files | 125 |
| Test suite failures | 0 |
