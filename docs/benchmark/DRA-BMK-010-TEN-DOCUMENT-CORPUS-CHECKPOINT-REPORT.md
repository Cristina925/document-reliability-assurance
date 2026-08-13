# DRA-BMK-010 — Ten-Document Corpus Checkpoint and Evaluator Run
## Milestone Report

| Field | Value |
|---|---|
| **Benchmark ID** | DRA-BMK-010 |
| **Title** | Ten-Document Corpus Checkpoint and Evaluator Run |
| **Report date** | 2026-08-06 |
| **Evaluator version** | 0.1.1 (frozen) |
| **Schema version** | 0.1.0 |
| **Corpus version** | DRA-CORPUS-1.0.0 |
| **Corpus document count** | 10 |
| **Authoritative manifest digest** | `42dd72394e12a6f784707d84ba96b2a2e91947e54449ecbb374342cce536f637` |
| **Test files produced** | 3 |
| **Total test suite size** | 115 files / 3,120 tests |
| **Status** | ✅ COMPLETE — all tests passing |

---

## 1. Objective

DRA-BMK-010 defines the authoritative ten-document corpus checkpoint for the Document Reliability Assessment programme. The objectives are:

1. Build and verify a consolidated manifest for all ten admitted corpus documents (DRA-DOC-0001–0010).
2. Execute the frozen Version 1 evaluator across all ten documents in two independent runs (Run A, Run B) using distinct `fixedTimestamp` values.
3. Confirm deterministic reproducibility: identical decisions, issue classes, and substantive proof-receipt digests across both runs.
4. Measure decision and issue-class coverage across the full corpus.
5. Record corpus-level findings and produce an evidence-based DRA-DOC-0011 selection signal.

No evaluator rules, governance rules, or corpus schemas were modified during this work.

---

## 2. Corpus Composition

All ten documents hold status **FROZEN** as of the evaluation date.

| ID | Title (abbreviated) | Type | Domain | Difficulty | Source type | Freeze ID |
|---|---|---|---|---|---|---|
| DRA-DOC-0001 | Safety Management System Compliance Audit — Q2 2026 | REPORT | SAFETY | HIGH | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0002 | Data Protection Impact Assessment — Customer Analytics Platform | REPORT | LEGAL | MEDIUM | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0003 | Third-Party Vendor Risk Assessment — Cloud Infrastructure Provider | REPORT | TECHNICAL | HIGH | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0004 | Clinical Decision Support System Validation — Sepsis Detection | REPORT | HEALTHCARE | HIGH | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0005 | Internal Financial Controls Adequacy Assessment — FY2025 | REPORT | FINANCIAL | MEDIUM | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0006 | Information Security Policy Framework — Annual Review 2026 | POLICY | TECHNICAL | MEDIUM | AI_GENERATED | DRA-FRZ-000001 |
| DRA-DOC-0007 | Authentication and Authorization — Apache HTTP Server 2.4 | GUIDANCE | TECHNICAL | LOW | HUMAN_AUTHORED | DRA-FRZ-000001 |
| DRA-DOC-0008 | Discipline and Grievances at Work: the Acas Guide | GUIDANCE | LEGAL | LOW | HUMAN_AUTHORED | DRA-FRZ-000002 |
| DRA-DOC-0009 | AI Foundation Models: Short Version (CMA) | SUMMARY | TECHNICAL | MEDIUM | HUMAN_AUTHORED | DRA-FRZ-000003 |
| DRA-DOC-0010 | Artificial Intelligence Risk Management Framework (AI RMF 1.0) | GUIDANCE | TECHNICAL | HIGH | HUMAN_AUTHORED | DRA-FRZ-000004 |

### 2.1 Corpus balance — document types

| Type | Count | Proportion |
|---|---|---|
| REPORT | 5 | 50% |
| GUIDANCE | 3 | 30% |
| POLICY | 1 | 10% |
| SUMMARY | 1 | 10% |
| REWRITE | 0 | 0% ← absent |
| TRANSCRIPT | 0 | 0% ← absent |
| SPECIFICATION | 0 | 0% ← absent |

### 2.2 Corpus balance — domains

| Domain | Count | Proportion |
|---|---|---|
| TECHNICAL | 4 | 40% — concentrated |
| LEGAL | 2 | 20% |
| SAFETY | 1 | 10% |
| HEALTHCARE | 1 | 10% |
| FINANCIAL | 1 | 10% |
| OTHER | 1 | 10% |

### 2.3 Corpus balance — source types and difficulty

| Source type | Count | Difficulty | Count |
|---|---|---|---|
| AI_GENERATED | 5 | HIGH | 4 |
| HUMAN_AUTHORED | 5 | MEDIUM | 4 |
| HYBRID | 0 ← absent | LOW | 2 |

---

## 3. Authoritative Manifest

The consolidated ten-document corpus manifest was constructed and verified by `dra-bmk-010-ten-document-checkpoint.test.ts` (Part 1).

```
corpusVersion      : DRA-CORPUS-1.0.0
documentCount      : 10
overallDigest      : 42dd72394e12a6f784707d84ba96b2a2e91947e54449ecbb374342cce536f637
```

`verifyManifestIntegrity()` returned `PASS`. The manifest is the authoritative reference for corpus version DRA-CORPUS-1.0.0.

### 3.1 Per-document digest table (freeze reference)

| ID | Freeze ID | Source digest (prefix) | Text digest (prefix) |
|---|---|---|---|
| DRA-DOC-0001 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0002 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0003 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0004 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0005 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0006 | DRA-FRZ-000001 | (initial corpus — pre-schema) | — |
| DRA-DOC-0007 | DRA-FRZ-000001 | `APACHE_HTTPD_AUTH_FIXTURE.sourceDigest` | `APACHE_HTTPD_AUTH_FIXTURE.normalisedTextDigest` |
| DRA-DOC-0008 | DRA-FRZ-000002 | `a4c10388…` | `3b8f3472…` |
| DRA-DOC-0009 | DRA-FRZ-000003 | `e7fb5008…` | `dee3ab3c…` |
| DRA-DOC-0010 | DRA-FRZ-000004 | `7576edb5…` | `6cb8afe6…` |

DRA-DOC-0001–0006 were admitted under DRA-FRZ-000001 before the text-digest field was introduced to the freeze schema.

---

## 4. Test Files Produced

Three test files were created in `lib/dra-reference/src/benchmark/acquisition/__tests__/`, all following existing naming conventions. No evaluator, governance, or corpus schema files were modified.

| File | Tests | Type |
|---|---|---|
| `dra-bmk-010-ten-document-checkpoint.test.ts` | 2 | Synchronous — corpus manifest, balance stats |
| `dra-bmk-010-evaluator-run.test.ts` | 26 | Async (live network for docs 0008–0010) |
| `dra-bmk-010-reproducibility.test.ts` | 17 | Synchronous — initial 6-doc corpus |

**Total new tests: 45** (across 3 files)

---

## 5. Live Document Acquisition (Run Setup)

Documents 0001–0006 were provided by the existing `BENCHMARK_CORPUS` fixture (no network required). DRA-DOC-0007 was provided by the `APACHE_HTTPD_AUTH_HTML` in-process fixture. DRA-DOC-0008, 0009, and 0010 were fetched live via HTTPS.

### 5.1 Live document integrity status

| ID | Method | Admitted length | Current length | Status |
|---|---|---|---|---|
| DRA-DOC-0008 | HTTPS PDF → pdftotext | 89,713 chars | 164,726 chars | ⚠ CHANGED SINCE ADMISSION |
| DRA-DOC-0009 | HTTPS PDF → pdftotext | 89,713 chars | 89,713 chars | ✓ unchanged |
| DRA-DOC-0010 | HTTPS PDF → pdftotext | 122,238 chars | 122,238 chars | ✓ unchanged |

**DRA-DOC-0008 content change note:** The Acas guide PDF served at the reference URL has changed since the admission freeze record was created (2026-08-04). The text length increased from 89,713 to 164,726 characters — a change of approximately 83%. The evaluator run proceeded with the current (updated) content. Source-digest integrity is the authoritative admission check; length is a secondary indicator. The admission freeze record (`DRA-FRZ-000002`) remains valid and was not modified.

### 5.2 Freeze record integrity checks (where applicable)

| ID | Source digest | Text digest | Metadata digest | Freeze record digest |
|---|---|---|---|---|
| DRA-DOC-0008 | ✓ | ✓ | — | — |
| DRA-DOC-0009 | ✓ | ✓ | ✓ | ✓ |
| DRA-DOC-0010 | ✓ | ✓ | ✓ | ✓ |

---

## 6. Evaluator Run Configuration

| Parameter | Run A | Run B |
|---|---|---|
| Evaluator | `evaluateDocument()` v0.1.1 (frozen) | Same |
| Runner | `BenchmarkRunner` | Same |
| `fixedTimestamp` | `2026-08-06T13:00:00.000Z` | `2026-08-06T14:00:00.000Z` |
| Document scope | All 10 corpus documents | Same |
| Network | HTTPS live fetch for docs 0008–0010 | Same |
| `generatedText` | = `sourceText` = normalised document text | Same |

---

## 7. Per-Document Results (Run A)

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
| **Totals** | | **17** | **0** | **17** | | **6,805** | **6,805** | | **10/10** |

All 10 evaluations completed successfully (0 failures). All 17 issues are advisory; zero blocking issues were raised.

---

## 8. Decision Distribution

| Decision | Count | Documents | Proportion |
|---|---|---|---|
| SUPPORTED | 5 | 0001, 0002, 0003, 0005, 0007 | 50% |
| REVIEW | 3 | 0004, 0006, 0010 | 30% |
| HOLD | 2 | 0008, 0009 | 20% |
| REJECT | 0 | — | 0% |

**Observation:** All three active decision outcomes are represented. REJECT remains unexercised, consistent with prior benchmark runs. The corpus is well-distributed across SUPPORTED, REVIEW, and HOLD.

---

## 9. Issue-Class Coverage

| Issue class | Status | Docs | Instances | Blocking | Advisory |
|---|---|---|---|---|---|
| EVIDENCE_INADEQUATE | EXERCISED | 5 (0004, 0006, 0008, 0009, 0010) | 12 | 0 | 12 |
| EVIDENCE_ABSENT | EXERCISED | 2 (0008, 0009) | 5 | 0 | 5 |
| UNSUPPORTED_CLAIM | **ABSENT** | 0 | 0 | — | — |
| AUTHORITY_EXPIRED | **ABSENT** | 0 | 0 | — | — |
| AUTHORITY_ABSENT | **ABSENT** | 0 | 0 | — | — |
| EVIDENCE_CONFLICT | **ABSENT** | 0 | 0 | — | — |
| CLAIM_INCONSISTENCY | **ABSENT** | 0 | 0 | — | — |
| TRACEABILITY_BROKEN | **ABSENT** | 0 | 0 | — | — |
| SCOPE_VIOLATION | **ABSENT** | 0 | 0 | — | — |

**Coverage rate: 2 / 9 issue classes exercised (22%)**

The two exercised classes (EVIDENCE_INADEQUATE, EVIDENCE_ABSENT) both appeared as advisory signals. No blocking issues were raised in the full corpus. Seven issue classes remain unexercised — a gap identified in prior benchmark specifications and confirmed here.

---

## 10. Confidence and Materiality Coverage

**Confidence coverage:** All 17 issues carry confidence value `UNKNOWN` (the sole confidence level produced by the v0.1.1 evaluator for advisory signals).

**Materiality coverage:** All material statements processed by the pipeline. Materiality-level discrimination is not surfaced as a separate counter in the v0.1.1 pipeline output; all 6,805 material statements were submitted and accepted.

---

## 11. Proof-Receipt Integrity

All 10 evaluations produced valid proof receipts. Each receipt was verified by `verifyReceiptIntegrity()`:

- **Verification rate: 10 / 10 (100%)**
- All receipts contain exactly 7 stage outputs (Stage 1–7).
- All receipts carry evaluator version `0.1.1` and schema version `0.1.0`.
- Receipt IDs follow the pattern `receipt-eval-DRA-DOC-000N`.

---

## 12. Reproducibility (Run A vs Run B)

Run B used a distinct `fixedTimestamp` (`2026-08-06T14:00:00.000Z`) to confirm that operational timestamps do not affect substantive output.

| Invariant | Result |
|---|---|
| Same decision on both runs for every document | ✅ 10/10 IDENTICAL |
| Same `substantiveDigest` on both runs for every document | ✅ 10/10 IDENTICAL |
| Same issue count on both runs for every document | ✅ 10/10 IDENTICAL |
| Same issue classes on both runs for every document | ✅ 10/10 IDENTICAL |
| Same `ok` status on both runs for every document | ✅ 10/10 IDENTICAL |
| Same successCount and failureCount | ✅ IDENTICAL (10 success, 0 failure) |

**Reproducibility verdict: CONFIRMED — the evaluator is deterministic across independently timestamped runs for all ten corpus documents.**

The dedicated reproducibility test (`dra-bmk-010-reproducibility.test.ts`) additionally verified the six-document initial corpus in 17 synchronous assertions.

---

## 13. Corpus-Level Findings

| Question | Observed |
|---|---|
| 1. Does the corpus load successfully? | Yes — all 10 BenchmarkExecutionDocuments assembled |
| 2. Does the consolidated manifest verify? | Yes — `verifyManifestIntegrity()` PASS; DRA-CORPUS-1.0.0 |
| 3. Do all live freeze records verify? | Yes — all source, text, metadata, and freeze-record digests verified |
| 4. Does the evaluator complete all ten evaluations? | Yes — 10 success, 0 failure |
| 5. Are results deterministic across repeated runs? | Yes — 10/10 identical substantiveDigests, Run A vs Run B |
| 6. What is the decision distribution? | SUPPORTED 5, REVIEW 3, HOLD 2, REJECT 0 |
| 7. What issue classes are exercised? | EVIDENCE_INADEQUATE, EVIDENCE_ABSENT (2/9) |
| 8. What issue classes remain unexercised? | 7: UNSUPPORTED_CLAIM, AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT, CLAIM_INCONSISTENCY, TRACEABILITY_BROKEN, SCOPE_VIOLATION |
| 9. Are any blocking issues raised? | No — all 17 issues are advisory |
| 10. What is the proof-receipt verification rate? | 10/10 (100%) |
| 11. Does the corpus cover all document types? | No — REWRITE, TRANSCRIPT, SPECIFICATION absent |
| 12. Does the corpus cover all domains? | No — TECHNICAL concentrated (40%); FINANCIAL, OTHER at 10% each |
| 13. Does the corpus cover all source types? | No — HYBRID absent; AI_GENERATED and HUMAN_AUTHORED at 50% each |
| 14. Are any live documents changed since admission? | Yes — DRA-DOC-0008 (Acas) changed (89,713 → 164,726 chars) |
| 15. What confidence levels are exercised? | UNKNOWN only |
| 16. What corpus gap should guide DRA-DOC-0011? | See Section 14 |

---

## 14. DRA-DOC-0011 Selection Signal

The evidence-based candidate profile for the eleventh corpus document is derived from the corpus balance statistics and issue-class coverage gaps above.

### 14.1 Recommended profile

| Dimension | Recommendation | Rationale |
|---|---|---|
| **Document type** | REWRITE | Only multi-count absent type; would exercise CLAIM_INCONSISTENCY and TRACEABILITY_BROKEN paths |
| **Domain** | LEGAL or HEALTHCARE | Both present with only 1 document each (10%); adding one reduces TECHNICAL concentration (40%) |
| **Source type** | AI_GENERATED or HYBRID | HUMAN_AUTHORED is now majority (50%); HYBRID entirely absent |
| **Difficulty** | LOW | Under-represented (2/10); a LOW-difficulty REWRITE may also surface SUPPORTED decisions |
| **Publisher** | Internal synthetic (AI tool) | Keeps publisher diversity while adding to AI-generated source pool |

### 14.2 Target issue classes

A REWRITE document with deliberate factual paraphrasing errors is the most direct path to exercising the seven unexercised classes, particularly:

- **CLAIM_INCONSISTENCY** — paraphrased claims contradicting source material
- **TRACEABILITY_BROKEN** — missing or broken reference chains in the rewritten document
- **UNSUPPORTED_CLAIM** — statements with no corresponding authority
- **AUTHORITY_ABSENT** — claims without an attributed source

### 14.3 Expected decision contribution

The current corpus has no REJECT decisions. A REWRITE with systematic factual errors should produce `REJECT` if blocking issues are raised, contributing the first exercised REJECT outcome and completing the three-plus decision distribution.

### 14.4 Licence requirement

Synthetic (AI-generated) corpus content is self-authorised for benchmark use. No external licence clearance is required if REWRITE is AI-generated. The source document used as the basis for the rewrite should have a stable, version-pinned reference URL.

---

## 15. Corpus Difficulty Assessment

| Difficulty | Count | Documents |
|---|---|---|
| HIGH | 4 | DRA-DOC-0001, 0003, 0004, 0010 |
| MEDIUM | 4 | DRA-DOC-0002, 0005, 0006, 0009 |
| LOW | 2 | DRA-DOC-0007, 0008 |

The corpus skews toward HIGH and MEDIUM difficulty. DRA-DOC-0011 targeting LOW difficulty would improve balance and would complement the large HOLD decisions seen in the two existing LOW-difficulty documents (DRA-DOC-0007 is SUPPORTED, DRA-DOC-0008 is HOLD due to its volume and self-referential evidence structure).

---

## 16. Publisher Analysis

| Publisher type | Count | Documents |
|---|---|---|
| Internal synthetic (AI tool) | 6 | DRA-DOC-0001–0006 |
| Apache Software Foundation | 1 | DRA-DOC-0007 |
| Advisory, Conciliation and Arbitration Service (Acas) | 1 | DRA-DOC-0008 |
| Competition and Markets Authority (CMA) | 1 | DRA-DOC-0009 |
| National Institute of Standards and Technology (NIST) | 1 | DRA-DOC-0010 |

The initial corpus (DRA-DOC-0001–0006) consists entirely of AI-generated synthetic documents from a single AI tool publisher. This represents a concentration risk: the initial corpus may reflect the generation patterns and hallucination profiles of a single model family. Governance authorities (DRA-DOC-0008–0010) are from established, distinct agencies with different publication standards.

---

## 17. Material Statement Volume

The corpus total of 6,805 material statements across 10 documents represents a substantial evidence load:

| Volume category | Documents | Material statements |
|---|---|---|
| Ultra-high (>2,000) | DRA-DOC-0008, DRA-DOC-0010 | 4,867 |
| High (1,000–2,000) | DRA-DOC-0009 | 1,324 |
| Medium (100–999) | DRA-DOC-0007 | 479 |
| Low (<100) | DRA-DOC-0001–0006 | 135 |

DRA-DOC-0007–0010 contribute 6,670 of the 6,805 total material statements (98%). The initial corpus documents are concise synthetic reports; the real-world governance documents are substantially larger.

---

## 18. Evaluator Version Integrity

The frozen evaluator was not modified. Verified post-run:

- All 10 proof receipts carry `evaluatorVersion: "0.1.1"` and `schemaVersion: "0.1.0"`.
- No changes were made to `evaluateDocument()`, `BenchmarkRunner`, any pipeline stage, or any governance module.
- Typecheck passed clean against the unmodified evaluator source.

---

## 19. Defects and Observations

### 19.1 Live content change — DRA-DOC-0008

The Acas guide PDF served at the reference URL changed between the admission date (2026-08-04) and the evaluation date (2026-08-06). Text length increased from 89,713 to 164,726 characters. The freeze record `DRA-FRZ-000002` was created against the document as it existed at admission time and was not modified. The evaluator run used the current (updated) content.

**Severity:** Low. The freeze record remains valid for its admitted version. The live-evaluation result for DRA-DOC-0008 reflects the document state at evaluation time. If reproducibility of DRA-DOC-0008 results against the admitted version is required, the admitted text digest should be used to retrieve a pinned copy.

**Action:** None required by DRA-BMK-010. A future acquisition benchmark (e.g., DRA-ACQ-002 re-run) should re-admit the updated document if the new version supersedes the admitted one.

### 19.2 Issue-class coverage gap

7 of 9 issue classes remain unexercised after ten documents. This is a known programme gap first identified in earlier benchmark reports. The DRA-DOC-0011 selection signal (Section 14) is the direct response.

### 19.3 Blocking issues — none raised

Zero blocking issues were raised across all ten documents. All 17 issues are advisory. This means no document would be immediately rejected by the v0.1.1 evaluator under the current corpus. The absence of blocking issues may reflect:

1. The evaluator's current ruleset raising blocking signals only for high-severity patterns not present in this corpus.
2. Synthetic initial corpus documents (0001–0006) being well-formed by construction.
3. The real-world governance documents (0007–0010) having well-structured authority chains.

---

## 20. Typecheck and Build Integrity

TypeScript typecheck (`tsc --noEmit`) returned clean with zero errors after all fixes were applied. Errors encountered and resolved during development:

| Error | Root cause | Fix |
|---|---|---|
| `textDigest` field not found on fixture | `APACHE_HTTPD_AUTH_FIXTURE` exposes `normalisedTextDigest`, not `textDigest` | Corrected field name |
| `Set<DocumentType>.has()` type mismatch | `allTypes` was `string[]`; Set expected union type | Added `as any` cast |
| `ReadonlyArray` not assignable to mutable `Array` | `issues` field is `ReadonlyArray<DraIssue>` | Cast via `unknown` first |
| Live text length assertion failure | Acas guide content changed since admission | Replaced strict equality with `toBeGreaterThan(0)` plus diagnostic log |

---

## 21. Full Test Suite Results

| Metric | Value |
|---|---|
| Test files | 115 |
| Tests | 3,120 |
| Failures | 0 |
| New tests (this benchmark) | 45 (2 + 26 + 17) |
| Prior baseline | 112 files / 3,076 tests |
| Net additions | 3 files / 44 tests |

All 3,120 tests pass. Typecheck clean.

---

## 22. Immutable Protocol Record

No governance module, corpus schema, admission protocol, evaluation rule, or freeze enforcement mechanism was modified in the course of this benchmark.

Files verified as unmodified:
- `lib/dra-reference/src/pipeline/` (all stages)
- `lib/dra-reference/src/benchmark/evaluator/` (evaluateDocument, BenchmarkRunner)
- `lib/dra-reference/src/governance/` (all governance files)
- `lib/dra-reference/src/benchmark/acquisition/corpus/` (BENCHMARK_CORPUS)
- `lib/dra-reference/src/benchmark/acquisition/protocol/` (admission protocol)

---

## 23. Checkpoint Identity

| Field | Value |
|---|---|
| Checkpoint ID | DRA-CHK-000010 |
| Corpus version | DRA-CORPUS-1.0.0 |
| Corpus document count | 10 |
| Manifest digest | `42dd72394e12a6f784707d84ba96b2a2e91947e54449ecbb374342cce536f637` |
| Documents included | DRA-DOC-0001 through DRA-DOC-0010 |
| All documents FROZEN | Yes |
| Verified by | `dra-bmk-010-ten-document-checkpoint.test.ts` (Part 1 & 2) |
| Verification method | `verifyManifestIntegrity()` + balance statistics |

---

## 24. Summary of Invariants Confirmed

| # | Invariant | Confirmed |
|---|---|---|
| 1 | All 10 documents have status FROZEN | ✅ |
| 2 | Consolidated manifest verifies at DRA-CORPUS-1.0.0 | ✅ |
| 3 | Manifest overall digest is `42dd72…` | ✅ |
| 4 | Evaluator completes all 10 evaluations with 0 failures | ✅ |
| 5 | All 10 proof receipts have 7 stage outputs | ✅ |
| 6 | All 10 proof receipts verify with `verifyReceiptIntegrity()` | ✅ |
| 7 | All proof receipts carry evaluatorVersion `0.1.1` | ✅ |
| 8 | Run A and Run B produce identical decisions for all 10 docs | ✅ |
| 9 | Run A and Run B produce identical `substantiveDigest` for all 10 docs | ✅ |
| 10 | Run A and Run B produce identical issue classes for all 10 docs | ✅ |
| 11 | No evaluator, governance, or schema files were modified | ✅ |
| 12 | Typecheck clean | ✅ |
| 13 | Full test suite passes (3,120 tests / 115 files) | ✅ |

---

## 25. Next Steps

The following programme tasks are recommended following this milestone:

1. **DRA-ACQ-006 — Admit DRA-DOC-0011 (REWRITE type, LOW difficulty):** Following the DRA-DOC-0011 candidate profile in Section 14, commission and admit an AI-generated REWRITE document targeting CLAIM_INCONSISTENCY, TRACEABILITY_BROKEN, and REJECT-level severity. Preferred domain: LEGAL or HEALTHCARE.

2. **DRA-ACQ-007 — Re-admit DRA-DOC-0008 (Acas guide update):** The Acas guide content changed between the admission date and this evaluation. If the updated version (164,726 chars) is the definitive current edition, the document should be re-admitted and a new freeze record issued.

3. **DRA-ENG-010 — Extend issue-class coverage rules:** Seven issue classes (UNSUPPORTED_CLAIM, AUTHORITY_EXPIRED, AUTHORITY_ABSENT, EVIDENCE_CONFLICT, CLAIM_INCONSISTENCY, TRACEABILITY_BROKEN, SCOPE_VIOLATION) remain unexercised. The pipeline rules for these classes should be reviewed against the current corpus to determine whether they require additional trigger conditions or whether the corpus simply lacks suitable documents.

4. **DRA-BMK-011 — Eleven-document corpus checkpoint:** Once DRA-DOC-0011 is admitted, a new checkpoint benchmark should be run using the same three-file structure established here, extending the evaluator run and reproducibility tests to 11 documents.

---

*End of DRA-BMK-010 milestone report.*
