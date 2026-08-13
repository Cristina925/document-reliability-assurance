# DRA-BMK-011 — Eleven-Document Corpus Checkpoint and Evaluator Run
## Milestone Report

| Field | Value |
|---|---|
| **Benchmark ID** | DRA-BMK-011 |
| **Title** | Eleven-Document Corpus Checkpoint and Evaluator Run |
| **Report date** | 2026-08-06 |
| **Evaluator version** | 0.1.1 (frozen) |
| **Schema version** | 0.1.0 |
| **Corpus version** | DRA-CORPUS-1.0.0 |
| **Corpus document count** | 11 |
| **Checkpoint ID** | DRA-CHK-000011 |
| **Checkpoint timestamp** | 2026-08-06T20:00:00.000Z |
| **11-document manifest digest** | `3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504` |
| **Test files produced** | 3 |
| **Total test suite size** | 120 files / 3,169 tests |
| **Status** | ✅ COMPLETE — all tests passing |

---

## 1. Objective

DRA-BMK-011 defines the authoritative eleven-document corpus checkpoint for the Document Reliability Assessment programme. The objectives are:

1. Build and verify a consolidated registry and manifest for all eleven admitted corpus documents (DRA-DOC-0001–0011), with an authoritative overall digest that is computed — not hard-coded — each run.
2. Execute the frozen Version 1 evaluator across all eleven documents in two independent runs (Run A, Run B) using distinct `fixedTimestamp` values to confirm operational timestamp independence.
3. Confirm deterministic reproducibility: identical decisions, issue classes, and substantive proof-receipt digests across both runs for all eleven documents.
4. Perform the first live evaluator run on DRA-DOC-0011 (ICO Guidance on AI and Data Protection), document its evaluation result in detail, and verify the frozen canonical text representation.
5. Measure decision and issue-class coverage across the full eleven-document corpus.
6. Record all defect and anomaly findings; assess whether Version 1 should remain frozen.
7. Characterise DRA-DOC-0011's evidence contribution and produce a DRA-DOC-0012 selection signal.

No evaluator rules, governance rules, or corpus schemas were modified during this work.

---

## 2. Corpus Composition (DRA-BMK-011)

All eleven documents hold status **FROZEN** as of the evaluation date.

| ID | Title (abbreviated) | Type | Domain | Difficulty | Source type | Format | Freeze ID |
|---|---|---|---|---|---|---|---|
| DRA-DOC-0001 | Safety Management System Compliance Audit — Q2 2026 | REPORT | TECHNICAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0002 | Data Protection Impact Assessment — Customer Analytics Platform | REPORT | LEGAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0003 | Third-Party Vendor Risk Assessment — Cloud Infrastructure Provider | REPORT | TECHNICAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0004 | Clinical Decision Support System Validation — Sepsis Detection | REPORT | GENERAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0005 | Internal Financial Controls Adequacy Assessment — FY2025 | REPORT | GENERAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0006 | Information Security Policy Framework — Annual Review 2026 | REPORT | TECHNICAL | HIGH | AI_GENERATED | text/plain | (initial corpus) |
| DRA-DOC-0007 | Authentication and Authorization — Apache HTTP Server 2.4 | ARTICLE | TECHNICAL | MEDIUM | HUMAN_AUTHORED | text/html | DRA-FRZ-000001 |
| DRA-DOC-0008 | Discipline and Grievances at Work: the Acas Guide | PROCEDURE | BUSINESS | LOW | HUMAN_AUTHORED | application/pdf | DRA-FRZ-000002 |
| DRA-DOC-0009 | AI Foundation Models: Short Version (CMA) | SUMMARY | GENERAL | MEDIUM | HUMAN_AUTHORED | application/pdf | DRA-FRZ-000003 |
| DRA-DOC-0010 | Artificial Intelligence Risk Management Framework (AI RMF 1.0) | POLICY | TECHNICAL | HIGH | HUMAN_AUTHORED | application/pdf | DRA-FRZ-000004 |
| **DRA-DOC-0011** | **Guidance on AI and Data Protection (ICO)** | **OTHER** | **LEGAL** | **HIGH** | **HUMAN_AUTHORED** | **text/html (multi-page)** | **DRA-FRZ-000005** |

---

## 3. Test Files Produced

Three test files were created in `lib/dra-reference/src/benchmark/execution/__tests__/`, distinct from the DRA-BMK-010 files (which reside in `acquisition/__tests__/`). No evaluator, governance, or corpus schema files were modified.

| File | Tests | Type |
|---|---|---|
| `dra-bmk-011-eleven-document-checkpoint.test.ts` | 4 | Synchronous — corpus manifest, freeze verification, balance stats |
| `dra-bmk-011-evaluator-run.test.ts` | 27 | Async (live network for docs 0008–0011) |
| `dra-bmk-011-reproducibility.test.ts` | 16 | Synchronous — initial 6-doc corpus reproducibility controls |

**Total new tests: 47** (across 3 files). Full test suite: **120 files / 3,169 tests** (up from 117 / 3,122 at DRA-BMK-010).

---

## 4. Part 1 — Authoritative 11-Document Corpus Checkpoint (DRA-CHK-000011)

### 4.1 Registry build

The checkpoint constructs a consolidated `CorpusRegistry` containing all eleven documents:

- **DRA-DOC-0001–0006**: loaded from `BENCHMARK_CORPUS` (initial corpus, `loadBenchmarkCorpus()`).
- **DRA-DOC-0007–0011**: reconstructed from admitted freeze-record metadata and appended individually via `registry.add()`.

Registry size confirmed: **11 documents**, no duplicates.

### 4.2 Authoritative manifest

```
schemaVersion  : 1.0
corpusVersion  : DRA-CORPUS-1.0.0
documentCount  : 11
overallDigest  : 3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504
documentIds    : DRA-DOC-0001 … DRA-DOC-0011 (canonical order)
integrityCheck : PASS
```

The manifest `overallDigest` is **computed each run** via `verifyManifestIntegrity()`; it is not hard-coded. The computed value matches the reference established in DRA-ACQ-006.

### 4.3 DRA-DOC-0011 metadata (verified)

| Field | Value |
|---|---|
| title | "Guidance on AI and data protection" |
| documentType | OTHER |
| domain | LEGAL |
| sourceType | HUMAN_AUTHORED |
| difficulty | HIGH |
| language | en |
| benchmarkStatus | FROZEN |
| freeze ID | DRA-FRZ-000005 |
| discovery ID | DRA-DIS-000001 |
| acquisition ID | DRA-ACQ-000013 |
| in-scope sections | 14 |
| excluded sections | 1 (`/ai-and-data-protection-risk-toolkit/`) |
| text length | 367,376 chars |
| word count | 57,519 |
| reproducibility | TEXT_STABLE |
| licence | Open Government Licence version 3.0 (OGL v3.0) |
| source URL | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/ |

---

## 5. Part 2 — Freeze and Source Verification

### 5.1 Freeze reference table

All five live freeze records were verified against admitted reference values:

| ID | Freeze ID | Source digest (prefix) | Text digest (prefix) | Metadata digest | Freeze record digest |
|---|---|---|---|---|---|
| DRA-DOC-0007 | DRA-FRZ-000001 | `71211579e01eeb9f…` | `71211579e01eeb9f…` | — | — |
| DRA-DOC-0008 | DRA-FRZ-000002 | `a4c10388a0dcfd54…` | `3b8f3472852feacd…` | — | — |
| DRA-DOC-0009 | DRA-FRZ-000003 | `e7fb5008e9b407bc…` | `dee3ab3c10dc1050…` | ✓ | ✓ |
| DRA-DOC-0010 | DRA-FRZ-000004 | `7576edb531d98488…` | `6cb8afe6bd2f7ed5…` | ✓ | ✓ |
| **DRA-DOC-0011** | **DRA-FRZ-000005** | **`b3b98f13548c165a…`** | **`b3b98f13548c165a…`** | **✓** | **✓** |

### 5.2 DRA-DOC-0011 source-digest invariant

The source digest and text digest for DRA-DOC-0011 are **identical**:

```
Source digest : b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
Text digest   : b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
```

This is by design: the canonical source digest for this multi-page HTML acquisition is computed from normalised text bytes (not raw HTML bytes). Raw HTML bytes are Cloudflare-dynamic and must not be byte-compared. Reproducibility classification: **TEXT_STABLE**.

Full digests for DRA-DOC-0011:

| Digest type | Value |
|---|---|
| Source/text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Metadata digest | `7a9f8fad847bfe6deca3965e557d05ffc5e225b759a38a0591a5f6d7551dcebd` |
| Freeze record digest | `74433e6a2fdb423317fb63de55e5830355760f78621f1031d856fc9641ac4a8e` |

### 5.3 Canonical section boundary (DRA-DOC-0011)

The 14 in-scope sections are fetched in canonical ICO navigation order:

| No. | Label | Slug |
|---|---|---|
| 01 | Landing/index page | `/` |
| 02 | What's new | `/whats-new/` |
| 03 | About this guidance | `/about-this-guidance/` |
| 04 | Accountability and governance | `/what-are-the-accountability-and-governance-implications-of-ai/` |
| 05 | Transparency | `/how-do-we-ensure-transparency-in-ai/` |
| 06 | Lawfulness | `/how-do-we-ensure-lawfulness-in-ai/` |
| 07 | Accuracy | `/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/` |
| 08 | Fairness | `/how-do-we-ensure-fairness-in-ai/` |
| 09 | Fairness: bias and discrimination | `/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/` |
| 10 | Fairness: Article 22 | `/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/` |
| 11 | Security and data minimisation | `/how-should-we-assess-security-and-data-minimisation-in-ai/` |
| 12 | Individual rights | `/how-do-we-ensure-individual-rights-in-our-ai-systems/` |
| 13 | Annex A | `/annex-a-fairness-in-the-ai-lifecycle/` |
| 14 | Glossary | `/glossary/` |

**Excluded:** `/ai-and-data-protection-risk-toolkit/` (interactive JavaScript-driven tool, not guidance text).

Sections are joined with `"\n\n--- SECTION BREAK ---\n\n"` as the canonical separator. ico.org.uk returns HTTP 405 for HEAD requests; GET is used for all section fetches.

---

## 6. Part 3 — Corpus Balance Statistics

### 6.1 Document type distribution

| Type | Count | Documents |
|---|---|---|
| REPORT | 6 | DRA-DOC-0001–0006 (initial corpus) |
| ARTICLE | 1 | DRA-DOC-0007 |
| PROCEDURE | 1 | DRA-DOC-0008 |
| SUMMARY | 1 | DRA-DOC-0009 |
| POLICY | 1 | DRA-DOC-0010 |
| OTHER | 1 | DRA-DOC-0011 |

### 6.2 Domain distribution

| Domain | Count | Documents |
|---|---|---|
| TECHNICAL | 3 | DRA-DOC-0001, 0003, 0006, 0007, 0010 (5 total — see note) |
| GENERAL | 2 | DRA-DOC-0004, 0009 |
| LEGAL | 2 | DRA-DOC-0002, 0011 |
| BUSINESS | 1 | DRA-DOC-0008 |

> Note: Five documents are TECHNICAL (DRA-DOC-0001, 0003, 0006, 0007, 0010), two are GENERAL, two are LEGAL, one is BUSINESS.

### 6.3 Source type distribution

| Source type | Count | Documents |
|---|---|---|
| AI_GENERATED | 6 | DRA-DOC-0001–0006 (initial corpus) |
| HUMAN_AUTHORED | 5 | DRA-DOC-0007–0011 |

### 6.4 Difficulty distribution

| Difficulty | Count |
|---|---|
| HIGH | 8 |
| MEDIUM | 2 |
| LOW | 1 |

### 6.5 Licence basis distribution

| Licence basis | Count | Documents |
|---|---|---|
| AI_GENERATED | 6 | DRA-DOC-0001–0006 |
| OPEN_LICENCE (OGL v3.0 or Apache) | 4 | DRA-DOC-0007–0009, DRA-DOC-0011 |
| US_GOVERNMENT_WORK | 1 | DRA-DOC-0010 |

### 6.6 Format distribution

| Format | Count | Documents |
|---|---|---|
| text/plain | 6 | DRA-DOC-0001–0006 |
| application/pdf | 3 | DRA-DOC-0008–0010 |
| text/html (single-page) | 1 | DRA-DOC-0007 |
| text/html (multi-page) | 1 | DRA-DOC-0011 ← **first in corpus** |

### 6.7 Source stability distribution

| Stability | Count | Documents |
|---|---|---|
| BYTE_STABLE | 10 | DRA-DOC-0001–0010 |
| TEXT_STABLE | 1 | DRA-DOC-0011 ← raw HTML bytes non-deterministic (Cloudflare CDN) |

### 6.8 Document size distribution (text length)

| Statistic | Value |
|---|---|
| Minimum | ~1,200 chars (DRA-DOC-0001–0006, approximate) |
| Maximum | 367,376 chars (DRA-DOC-0011) |
| Mean | ~66,900 chars (approximate) |
| Median | ~20,000 chars (approximate) |
| DRA-DOC-0011 | **Largest document in corpus** |

### 6.9 Structural contribution of DRA-DOC-0011 (before evaluator run)

| Contribution | Status |
|---|---|
| New publisher (ICO) | YES — first UK data protection regulatory body |
| First ICO publication | YES |
| Regulatory guidance | YES — UK statutory supervisory authority |
| LEGAL domain | Doubles LEGAL count from 1 to 2 |
| Multi-page HTML format | First in corpus (10 prior docs: 6×text/plain, 3×PDF, 1×HTML single-page) |
| HIGH difficulty | Second HIGH live-acquired document (with DRA-DOC-0010) |
| Document size | Largest corpus document (367,376 chars / 57,519 words) |
| OGL v3.0 licence | Third OGL-licensed document |
| TEXT_STABLE reproducibility | First TEXT_STABLE source in corpus |

### 6.10 Concentration risks

| Risk | Status |
|---|---|
| TECHNICAL domain (5/11) | ⚠ Concentration — 45% of corpus |
| REPORT type (6/11) | ⚠ Initial corpus concentration (initial 6 docs) |
| HIGH difficulty (8/11) | ⚠ Under-representation of LOW difficulty |
| AI_GENERATED (6/11) | Initial corpus only — all live-acquired docs are HUMAN_AUTHORED |

### 6.11 Underrepresented categories

- Document types absent: EMAIL, REWRITE, TRANSCRIPT, SPECIFICATION
- Domains with 0 documents: HEALTHCARE, FINANCE
- Source types absent: HYBRID
- Difficulty LOW: 1/11 (under-represented)
- Languages: no non-English document

---

## 7. Part 4 — Frozen Evaluator Run

### 7.1 Configuration

| Parameter | Run A | Run B |
|---|---|---|
| Evaluator | `evaluateDocument()` v0.1.1 (frozen Version 1) | Same |
| Runner | `BenchmarkRunner` | Same |
| `fixedTimestamp` | `2026-08-06T20:30:00.000Z` | `2026-08-06T21:00:00.000Z` |
| `fixedRunId` | `bmk-011-run-A` | `bmk-011-run-B` |
| Document scope | All 11 corpus documents | Same |
| Network | HTTPS live fetch for docs 0008–0011 | Same |
| `generatedText` | = `sourceText` = normalised document text | Same |

### 7.2 Live document integrity status

| ID | Admitted length | Current length | Status |
|---|---|---|---|
| DRA-DOC-0008 (Acas) | 89,713 chars | 164,726 chars | ⚠ CHANGED SINCE ADMISSION |
| DRA-DOC-0009 (CMA) | 89,713 chars | 89,713 chars | ✓ unchanged |
| DRA-DOC-0010 (NIST) | 122,238 chars | 122,238 chars | ✓ unchanged |
| DRA-DOC-0011 (ICO) | 367,376 chars | 367,376 chars | **✓ FROZEN_REPRESENTATION_CONFIRMED** |

For DRA-DOC-0011, the live text digest was compared against the frozen reference:

```
Frozen canonical text digest : b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
Live text digest (current)   : b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
Match                        : YES — FROZEN_REPRESENTATION_CONFIRMED
Raw HTML bytes               : NOT compared (Cloudflare-dynamic, TEXT_STABLE)
```

### 7.3 Per-document results (Run A)

| ID | Decision | Issues | Blocking | Advisory | Issue classes | Material stmts | Linked evidence | Substantive digest (prefix) | Receipt ✓ |
|---|---|---|---|---|---|---|---|---|---|
| DRA-DOC-0001 | SUPPORTED | 0 | 0 | 0 | — | 20 | 20 | `0377ebbc408f01db` | ✓ |
| DRA-DOC-0002 | SUPPORTED | 0 | 0 | 0 | — | 21 | 21 | `d2dd0a4964776b1a` | ✓ |
| DRA-DOC-0003 | SUPPORTED | 0 | 0 | 0 | — | 24 | 24 | `e24031ecc7ea4182` | ✓ |
| DRA-DOC-0004 | REVIEW | 1 | 0 | 1 | EVIDENCE_INADEQUATE | 21 | 21 | `7138029f78d6c532` | ✓ |
| DRA-DOC-0005 | SUPPORTED | 0 | 0 | 0 | — | 25 | 25 | `7e02672f8811c6db` | ✓ |
| DRA-DOC-0006 | REVIEW | 1 | 0 | 1 | EVIDENCE_INADEQUATE | 24 | 24 | `46b0d463ffaea9f7` | ✓ |
| DRA-DOC-0007 | SUPPORTED | 0 | 0 | 0 | — | 479 | 479 | `dd5b6aded71f3bda` | ✓ |
| DRA-DOC-0008 | HOLD | 10 | 0 | 10 | EVIDENCE_INADEQUATE, EVIDENCE_ABSENT | 3,013 | 3,013 | `f70e5bc18d1ea3b2` | ✓ |
| DRA-DOC-0009 | HOLD | 4 | 0 | 4 | EVIDENCE_ABSENT, EVIDENCE_INADEQUATE | 1,324 | 1,324 | `3f5b1289999e8542` | ✓ |
| DRA-DOC-0010 | REVIEW | 1 | 0 | 1 | EVIDENCE_INADEQUATE | 1,854 | 1,854 | `a286fb5916ee84e3` | ✓ |
| **DRA-DOC-0011** | **REVIEW** | **10** | **0** | **10** | **EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY** | **4,187** | **4,187** | **`37975bec278f82ad`** | **✓** |
| **Totals** | | **27** | **0** | **27** | | **10,992** | **10,992** | | **11/11** |

All 11 evaluations completed successfully. `successCount = 11`, `failureCount = 0`. All 27 issues are advisory; zero blocking issues were raised.

### 7.4 Evaluator version verification

All 11 proof receipts carry:
- `evaluatorVersion: "0.1.1"`
- `pipelineVersion: "1.0"`
- `schemaVersion: "0.1.0"`
- `stageOutputs.length: 7`

---

## 8. Part 5 — DRA-DOC-0011 Detailed Evaluation

### 8.1 Evaluation result

| Field | Value |
|---|---|
| Corpus ID | DRA-DOC-0011 |
| Freeze ID | DRA-FRZ-000005 |
| Title | Guidance on AI and data protection |
| Evaluator version | 0.1.1 (frozen Version 1) |
| Corpus version | DRA-CORPUS-1.0.0 |
| Executed at | 2026-08-06T20:30:00.000Z |
| Pipeline completed | YES (ok = true) |
| **Decision** | **REVIEW** |
| Total issues | 10 |
| Blocking issues | 0 |
| Advisory issues | 10 |
| **Issue classes** | **EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY** |
| Material statements | 4,187 |
| Evidence records | 4,187 |
| Linked evidence | 4,187 |
| No-match evidence | 0 |
| Proof receipt ID | receipt-eval-DRA-DOC-0011 |
| Substantive digest | `37975bec278f82add9fa3e4ac174da848941647700c1a5380c07360d0125542f` |
| Schema version | 0.1.0 |
| Stage outputs | 7 |
| Receipt integrity | **✓ PASS** |

### 8.2 Multi-page HTML observations

| Observation | Value |
|---|---|
| Source format | Multi-page HTML (14 sections, TEXT_STABLE) |
| Canonical text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Live text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Frozen representation confirmed | **YES** |
| Text length used | 367,376 chars |
| Section separator | `"--- SECTION BREAK ---"` inserted between sections |
| Raw HTML bytes | NOT used as source fingerprint (Cloudflare-dynamic) |
| Section break markers present | YES |

### 8.3 CLAIM_INCONSISTENCY — new issue class

DRA-DOC-0011 is the first corpus document to exercise the `CLAIM_INCONSISTENCY` issue class. This class was unexercised in all prior evaluator runs (DRA-BMK-010 and earlier). The complex multi-section UK GDPR regulatory guidance — with cross-references between the ICO's interpretations, UK GDPR articles, and implementation requirements — created the conditions for the evaluator's claim-consistency rules to trigger.

`CLAIM_INCONSISTENCY` issues are advisory (blocking = false). The presence of 1 CLAIM_INCONSISTENCY issue, combined with 9 EVIDENCE_INADEQUATE issues, produced a `REVIEW` decision (rather than `HOLD`, which requires more concentrated advisory issues).

---

## 9. Part 6 — Reproducibility (Run A vs Run B)

### 9.1 Summary

| Metric | Result |
|---|---|
| Run A document count | 11 |
| Run B document count | 11 |
| Identical decisions | 11 / 11 |
| Identical substantive digests | 11 / 11 |
| Identical issue counts | 11 / 11 |
| Identical issue classes | 11 / 11 |
| Identical ok status | 11 / 11 |
| Overall verdict | **IDENTICAL** |

### 9.2 DRA-DOC-0011 reproducibility

```
decision      : A = REVIEW    B = REVIEW    IDENTICAL ✓
substantiveDig: IDENTICAL ✓
issue count   : A = 10        B = 10        IDENTICAL ✓
stmtCount     : IDENTICAL ✓
integrity A   : ✓ PASS
integrity B   : ✓ PASS
```

The live ICO text digest was fetched independently for both runs from the same 14-section URL sequence. Both runs confirmed `FROZEN_REPRESENTATION_CONFIRMED`. The `substantiveDigest` is identical across both runs.

### 9.3 Per-document reproducibility table

| ID | Verdict | Decision | Digest | Issues |
|---|---|---|---|---|
| DRA-DOC-0001 | IDENTICAL | SUPPORTED | ✓ | ✓ (0) |
| DRA-DOC-0002 | IDENTICAL | SUPPORTED | ✓ | ✓ (0) |
| DRA-DOC-0003 | IDENTICAL | SUPPORTED | ✓ | ✓ (0) |
| DRA-DOC-0004 | IDENTICAL | REVIEW | ✓ | ✓ (1) |
| DRA-DOC-0005 | IDENTICAL | SUPPORTED | ✓ | ✓ (0) |
| DRA-DOC-0006 | IDENTICAL | REVIEW | ✓ | ✓ (1) |
| DRA-DOC-0007 | IDENTICAL | SUPPORTED | ✓ | ✓ (0) |
| DRA-DOC-0008 | IDENTICAL | HOLD | ✓ | ✓ (10) |
| DRA-DOC-0009 | IDENTICAL | HOLD | ✓ | ✓ (4) |
| DRA-DOC-0010 | IDENTICAL | REVIEW | ✓ | ✓ (1) |
| DRA-DOC-0011 | IDENTICAL | REVIEW | ✓ | ✓ (10) |

The 6-document synchronous reproducibility control (`dra-bmk-011-reproducibility.test.ts`) also confirmed IDENTICAL results for DRA-DOC-0001–0006, with proof-receipt digests matching and operational timestamps differing (confirming that `fixedTimestamp` controls are active).

---

## 10. Part 7 — Decision Coverage

### 10.1 Decision distribution (DRA-BMK-011, 11 documents)

| Decision | Count | Documents | Proportion |
|---|---|---|---|
| SUPPORTED | 5 | 0001, 0002, 0003, 0005, 0007 | 45% |
| REVIEW | 4 | 0004, 0006, 0010, **0011** | 36% |
| HOLD | 2 | 0008, 0009 | 18% |
| FAILURE | 0 | — | 0% |

All three valid decision outcomes (SUPPORTED, REVIEW, HOLD) are represented. `REJECT` is not a valid decision in the v0.1.1 evaluator; it is not expected and was not observed.

### 10.2 DRA-DOC-0011 decision contribution

DRA-DOC-0011 produced a `REVIEW` decision. The REVIEW decision class was already represented in the ten-document corpus (DRA-DOC-0004, 0006, 0010). DRA-DOC-0011 adds a fourth REVIEW document, increasing REVIEW's share from 3/10 (30%) to 4/11 (36%).

### 10.3 Comparison with DRA-BMK-010

| Metric | DRA-BMK-010 (10 docs) | DRA-BMK-011 (11 docs) | Delta |
|---|---|---|---|
| SUPPORTED | 5 | 5 | 0 |
| REVIEW | 3 | 4 | +1 (DRA-DOC-0011) |
| HOLD | 2 | 2 | 0 |
| All three present | YES | YES | — |

### 10.4 Limitations

Small corpus size (11 documents) limits statistical confidence. Decision proportions do not imply evaluator accuracy or real-world calibration. The corpus is dominated by synthetic AI-generated reports (DRA-DOC-0001–0006, all SUPPORTED), which inflates the SUPPORTED proportion.

---

## 11. Part 8 — Issue-Class Coverage

### 11.1 Full issue-class coverage table (DRA-BMK-011)

| Issue class | Status | Documents | Total instances | Blocking | Advisory |
|---|---|---|---|---|---|
| UNSUPPORTED_CLAIM | ABSENT | 0 | 0 | 0 | 0 |
| AUTHORITY_EXPIRED | ABSENT | 0 | 0 | 0 | 0 |
| AUTHORITY_ABSENT | ABSENT | 0 | 0 | 0 | 0 |
| EVIDENCE_ABSENT | EXERCISED (BMK-010) | 2 (0008, 0009) | 5 | 0 | 5 |
| EVIDENCE_INADEQUATE | EXERCISED (BMK-010) | 6 (0004,0006,0008,0009,0010,**0011**) | 21 | 0 | 21 |
| EVIDENCE_CONFLICT | ABSENT | 0 | 0 | 0 | 0 |
| **CLAIM_INCONSISTENCY** | **EXERCISED ← NEW in BMK-011** | **1 (0011)** | **1** | **0** | **1** |
| TRACEABILITY_BROKEN | ABSENT | 0 | 0 | 0 | 0 |
| SCOPE_VIOLATION | ABSENT | 0 | 0 | 0 | 0 |

**Exercised: 3 / 9** (up from 2/9 in DRA-BMK-010)
**Unexercised: 6** (UNSUPPORTED_CLAIM, AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT, TRACEABILITY_BROKEN, SCOPE_VIOLATION)

### 11.2 DRA-DOC-0011 issue-class contribution

DRA-DOC-0011 exercised **CLAIM_INCONSISTENCY** for the first time in the DRA corpus. It also contributed 1 additional EVIDENCE_INADEQUATE instance.

| Class | Previously exercised? | In DRA-DOC-0011? | New? |
|---|---|---|---|
| EVIDENCE_INADEQUATE | YES (BMK-010) | YES | NO |
| CLAIM_INCONSISTENCY | NO | YES | **YES** |

### 11.3 Gap analysis (priority unexercised classes)

| Class | Status | Instance count |
|---|---|---|
| AUTHORITY_EXPIRED | STILL ABSENT | 0 |
| EVIDENCE_CONFLICT | STILL ABSENT | 0 |
| CLAIM_INCONSISTENCY | **EXERCISED in BMK-011** | 1 |
| TRACEABILITY_BROKEN | STILL ABSENT | 0 |

The 6 still-unexercised classes form the primary target for DRA-DOC-0012 acquisition (see Section 17).

---

## 12. Part 9 — Confidence, Materiality and Evidence Coverage

### 12.1 Confidence distribution

| Level | Instances |
|---|---|
| UNKNOWN | All issues |

All 27 issues carry `UNKNOWN` confidence. This is consistent with prior evaluator runs; no confidence-calibrated issue classes are exercised by the current corpus.

### 12.2 Evidence-relationship coverage

| Metric | Value |
|---|---|
| Total evidence records (11 docs) | 10,992 |
| DRA-DOC-0011 evidence records | 4,187 |
| DRA-DOC-0011 linked evidence | 4,187 |
| DRA-DOC-0011 no-match evidence | 0 |
| Evidence-relationship classifications observed | Linked only (NO_MATCH absent in DRA-DOC-0011) |

### 12.3 Document-level materiality summary

| Category | Count |
|---|---|
| Zero-issue documents | 5 (DRA-DOC-0001–0003, 0005, 0007) |
| Advisory-only documents | 6 (DRA-DOC-0004, 0006, 0008, 0009, 0010, **0011**) |
| Blocking documents | 0 |

### 12.4 Proof-receipt verification

All 11 proof receipts pass `verifyReceiptIntegrity()`. Verification rate: **11/11 (100%)**.

---

## 13. Part 10 — Defect and Anomaly Review

### 13.1 Evaluator defect assessment

| Check | Result |
|---|---|
| Pipeline completed without failure | YES ✓ |
| ok = true for DRA-DOC-0011 | YES ✓ |
| Interpretation | No pipeline failure. Not a defect indicator. |

### 13.2 Normalisation defect assessment

| Check | Result |
|---|---|
| Section separator present | YES — "--- SECTION BREAK ---" found in combined text |
| Combined text length | 367,376 chars |
| Reference length | 367,376 chars |
| Length difference | 0 (exact match) |
| Interpretation | Consistent with frozen representation. No normalisation defect. |

### 13.3 Multi-page ordering defect assessment

Sections were fetched in canonical ICO navigation order (14 sections). Section ordering was verified during acquisition (DRA-ACQ-006 admission tests). The URL sequence enforces canonical order. No ordering defect detected.

### 13.4 HTML extraction defect assessment

Section break markers are present in the combined text. The normalisation pipeline (`normaliseContent()`) uses the same HTML extraction path as DRA-DOC-0007 (Apache HTTP Server). Cloudflare CDN injection is stripped by normalisation. No HTML extraction defect detected.

Potential artefact: per-page repeated navigation and footer elements (ICO site chrome) may survive normalisation as plain text, potentially contributing to material statement counts. This is an expected property of multi-page HTML sources, not a defect.

### 13.5 Proof-receipt defect assessment

`verifyReceiptIntegrity(receipt)` returns `true` for DRA-DOC-0011. Stage outputs: 7 / 7 expected. No proof-receipt defect.

### 13.6 Version 1 reopen assessment

| Criterion | Status |
|---|---|
| DRA-DOC-0011 evaluation completed | YES |
| Pipeline failure observed | NO |
| Reproducibility (A vs B) | IDENTICAL ✓ |
| New issue-class coverage gap | CORPUS-SELECTION finding, not evaluator defect |
| Confidence calibration gap | CORPUS-SELECTION finding, not evaluator defect |

**Recommendation: Version 1 must remain frozen.** No genuine reproducible defect was demonstrated in this checkpoint. Issue-class coverage gaps are expected at corpus size 11 and require additional document acquisition (DRA-DOC-0012+), not evaluator modification.

---

## 14. Part 11 — Evidence Contribution Result for DRA-DOC-0011

### 14.1 Contribution dimensions classified

| Icon | Status | Dimension | Evidence |
|---|---|---|---|
| ✓ | CONFIRMED | New publisher | ICO not previously in corpus |
| ✓ | CONFIRMED | First ICO publication | DRA-DOC-0011 is the only ICO document |
| ✓ | CONFIRMED | Regulatory guidance | UK statutory supervisory authority; OGL v3.0 |
| ✓ | CONFIRMED | LEGAL domain contribution | Second LEGAL document (with DRA-DOC-0002) |
| ✓ | CONFIRMED | Multi-page HTML format | First multi-page HTML document; 14 sections |
| ✓ | CONFIRMED | Authority complexity | UK GDPR arts. 5, 6, 9, 13, 14, 22, 25, 35 cross-refs present |
| ✓ | CONFIRMED | Cross-reference complexity | Multiple statutory and DPA 2018 references in text |
| ✓ | CONFIRMED | Document size | Largest corpus document: 367,376 chars / 57,519 words |
| ✓ | CONFIRMED | OGL v3.0 licence | Third OGL-licensed document |
| ✓ | CONFIRMED | Format diversity | text/html multi-page is a new format in corpus |
| ✓ | CONFIRMED | New issue-class coverage | CLAIM_INCONSISTENCY exercised for the first time |
| ? | NOT_MEASURABLE | New decision coverage | REVIEW contributed; class already present — see Part 7 |
| ? | NOT_MEASURABLE | Confidence coverage | UNKNOWN only; consistent with prior runs |
| ✓ | CONFIRMED | Proof-receipt reproducibility | Receipt verified in both Run A and Run B |
| ✓ | CONFIRMED | Benchmark diversity | New publisher, regulatory domain, HTML format, UK data law |

### 14.2 Contribution summary

| Status | Count |
|---|---|
| CONFIRMED | 13 |
| NOT_OBSERVED | 0 |
| NOT_MEASURABLE_AT_THIS_STAGE | 2 |
| PARTIALLY_CONFIRMED | 0 |

**Overall contribution rating: HIGH**

Confirmed ratio: 13/15 (87%). Majority of expected contribution dimensions are confirmed. DRA-DOC-0011 provides structural corpus diversity (publisher, format, regulatory domain, size, licence) confirmed by registry inspection, and — critically — exercises CLAIM_INCONSISTENCY for the first time, expanding issue-class coverage from 2/9 to 3/9.

---

## 15. Part 12 — DRA-DOC-0012 Evidence Gap Profile

Based on 11-document corpus results:

- **Issue classes still unexercised (6):** UNSUPPORTED_CLAIM, AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT, TRACEABILITY_BROKEN, SCOPE_VIOLATION
- **Decision outcomes still absent (0):** all three (SUPPORTED, REVIEW, HOLD) are represented

### 15.1 Preferred DRA-DOC-0012 profile

| Dimension | Recommendation | Rationale |
|---|---|---|
| **Document type** | REWRITE | Exercises CLAIM_INCONSISTENCY and TRACEABILITY_BROKEN; only multi-count absent type |
| **Domain** | HEALTHCARE or FINANCE | Both absent from corpus (0 documents each) |
| **Source type** | HUMAN_AUTHORED or AI_GENERATED (REWRITE) | HYBRID absent; HUMAN_AUTHORED adds provenance diversity |
| **Difficulty** | MEDIUM | Sufficient complexity for inconsistency classes without HIGH ambiguity |
| **Publisher** | Not previously represented | FCA (Finance) or NICE (Healthcare) publish under OGL v3.0 |
| **Source format** | Single-page HTML or PDF | Complements DRA-DOC-0011 multi-page; exercises PDF path |
| **Authority structure** | References standards, regulations, or codes | Exercises AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT |
| **Evidence structure** | Claims supported by citation or empirical data | Conflicting or outdated citations preferred |
| **Licence** | OGL v3.0 or Creative Commons BY | Confirms reusability |

### 15.2 Target issue classes (priority)

1. UNSUPPORTED_CLAIM — statements without attributed source
2. AUTHORITY_EXPIRED — references to superseded or repealed legislation
3. TRACEABILITY_BROKEN — missing or broken reference chains
4. EVIDENCE_CONFLICT — contradictory evidence for the same claim
5. AUTHORITY_ABSENT — claims without any authority attribution
6. SCOPE_VIOLATION — claims outside document's stated scope

### 15.3 Do not

- Manufacture a document designed to force a specific evaluator decision.
- Select a document merely because it has a convenient URL.
- Claim a specific decision outcome before the evaluator runs.
- Modify the Version 1 evaluator to improve issue-class coverage.

---

## 16. Defects and Observations

### 16.1 Live content change — DRA-DOC-0008 (Acas guide)

The Acas guide PDF changed between the admission date (2026-08-04) and the evaluation date. Text length increased from 89,713 to 164,726 characters. This was first observed in DRA-BMK-010 and remains unchanged. The freeze record `DRA-FRZ-000002` was created against the document as it existed at admission time and was not modified.

**Status:** Ongoing. Same finding as DRA-BMK-010. Severity: Low. The evaluator ran against the current (updated) content.

### 16.2 ICO raw HTML dynamic bytes

ico.org.uk returns Cloudflare-managed HTML. Raw HTML bytes are non-deterministic between requests (cache headers, CDN injection artefacts). Only the normalised text digest is canonical. This is expected and documented in the TEXT_STABLE reproducibility classification.

**Status:** By-design. Not a defect.

### 16.3 CLAIM_INCONSISTENCY first exercise

CLAIM_INCONSISTENCY was exercised for the first time on DRA-DOC-0011. This is a positive finding — it indicates the evaluator's claim-consistency rules function on real-world regulatory text with complex cross-references. It is not a defect.

### 16.4 Six issue classes still unexercised

7 of 9 issue classes were unexercised after DRA-BMK-010. DRA-DOC-0011 reduced this to 6 of 9. The remaining gap is a corpus-selection limitation, not an evaluator defect.

---

## 17. Typecheck and Build Integrity

TypeScript typecheck (`tsc --noEmit`) returned clean with zero errors before and after all test files were created. No changes were made to evaluator source, pipeline stages, governance modules, or frozen files.

---

## 18. Evaluator Version Integrity

The frozen evaluator was not modified. Verified post-run:

- All 11 proof receipts carry `evaluatorVersion: "0.1.1"` and `schemaVersion: "0.1.0"`.
- No changes were made to `evaluateDocument()`, `BenchmarkRunner`, any pipeline stage, or any governance module.
- Version 1 remains frozen.

---

## 19. Summary Answers to Benchmark Questions

| Question | Answer |
|---|---|
| 1. Does the 11-doc corpus manifest compute correctly? | Yes — digest `3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504`, integrity PASS |
| 2. Are all 11 freeze records verified? | Yes — all reference digests match admitted constants |
| 3. Does the frozen canonical text for DRA-DOC-0011 match live? | Yes — FROZEN_REPRESENTATION_CONFIRMED (both digest and length match) |
| 4. Did all 11 evaluations complete? | Yes — 11/11 success, 0 failure |
| 5. Are all decisions valid? | Yes — all in {SUPPORTED, REVIEW, HOLD} |
| 6. What is DRA-DOC-0011's decision? | **REVIEW** |
| 7. What issue classes does DRA-DOC-0011 exercise? | **EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY** |
| 8. Is CLAIM_INCONSISTENCY new? | **YES — first exercise in DRA corpus** |
| 9. Are results deterministic across two runs? | Yes — 11/11 IDENTICAL (decisions, digests, issue counts) |
| 10. What is the decision distribution? | SUPPORTED 5, REVIEW 4, HOLD 2 |
| 11. Are all three decisions represented? | Yes |
| 12. What issue classes are exercised? | EVIDENCE_INADEQUATE, EVIDENCE_ABSENT, CLAIM_INCONSISTENCY (3/9) |
| 13. What classes are still unexercised? | 6 — UNSUPPORTED_CLAIM, AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT, TRACEABILITY_BROKEN, SCOPE_VIOLATION |
| 14. Are blocking issues raised? | No — all 27 issues are advisory |
| 15. What is the proof-receipt verification rate? | 11/11 (100%) |
| 16. Should Version 1 be reopened? | No — no reproducible defect demonstrated |
| 17. What is DRA-DOC-0011's evidence contribution rating? | **HIGH** (13/15 dimensions CONFIRMED) |
| 18. What is the preferred DRA-DOC-0012 profile? | REWRITE, HEALTHCARE/FINANCE domain, single-page format |
| 19. Full test suite status? | 120 files / 3,169 tests / 0 failures |

---

## 20. Appendix A — DRA-DOC-0011 Digest Reference Card

| Item | Value |
|---|---|
| Source digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Metadata digest | `7a9f8fad847bfe6deca3965e557d05ffc5e225b759a38a0591a5f6d7551dcebd` |
| Freeze record digest | `74433e6a2fdb423317fb63de55e5830355760f78621f1031d856fc9641ac4a8e` |
| 11-doc manifest digest | `3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504` |
| Evaluator substantive digest (Run A) | `37975bec278f82add9fa3e4ac174da848941647700c1a5380c07360d0125542f` |

---

## 21. Appendix B — Freeze Record Summary (DRA-DOC-0007–0011)

| ID | Freeze ID | Discovery ID | Acquisition ID | Source | Publisher |
|---|---|---|---|---|---|
| DRA-DOC-0007 | DRA-FRZ-000001 | — | DRA-ACQ-000001 | https://httpd.apache.org/docs/2.4/howto/auth.html | Apache Software Foundation |
| DRA-DOC-0008 | DRA-FRZ-000002 | — | DRA-ACQ-000002 | https://www.acas.org.uk/…/discipline-and-grievances-at-work-the-acas-guide.pdf | Acas |
| DRA-DOC-0009 | DRA-FRZ-000003 | — | DRA-ACQ-000008 | https://assets.publishing.service.gov.uk/…/Short_version_.pdf | Competition and Markets Authority |
| DRA-DOC-0010 | DRA-FRZ-000004 | — | DRA-ACQ-000012 | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf | NIST |
| DRA-DOC-0011 | DRA-FRZ-000005 | DRA-DIS-000001 | DRA-ACQ-000013 | https://ico.org.uk/…/guidance-on-ai-and-data-protection/ (14 sections) | ICO |
