# DRA-ACQ-002 — Controlled Corpus Admission for DRA-DOC-0008

**Decision: DRA-DOC-0008 ADMITTED AND FROZEN — READY FOR BLIND EVALUATION**  
**Date:** 2026-08-04  
**Test file:** `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-acas-guide-admission.test.ts`  
**Freeze record:** DRA-FRZ-000002  
**Corpus version:** DRA-CORPUS-1.0.0

---

## A. Files Created and Modified

### Created

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-acas-guide-admission.test.ts` | Controlled corpus admission test (this task) |
| `docs/benchmark/DRA-ACQ-002-ACAS-GUIDE-ADMISSION.md` | This report |

### Modified

None. No existing file was modified. No evaluator logic, governance rules, schemas, normalisation logic, acquisition infrastructure, existing frozen corpus entries (DRA-DOC-0001 through DRA-DOC-0007), or CTS artefacts were altered.

### Reviewed (read-only)

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/benchmark/acquisition/freeze.ts` | `createAcquisitionFreezeRecord`, `verifyAcquisitionFreezeRecordDigest` |
| `lib/dra-reference/src/benchmark/acquisition/manifest-integration.ts` | `integrateWithCorpus` |
| `lib/dra-reference/src/benchmark/acquisition/integrity.ts` | `computeSourceDigest`, `computeApprovedMetadataDigest` |
| `lib/dra-reference/src/benchmark/acquisition/eligibility.ts` | `checkFreezeEligibility` |
| `lib/dra-reference/src/benchmark/corpus/registry.ts` | `CorpusRegistry` |
| `lib/dra-reference/src/benchmark/corpus/integrity.ts` | `verifyManifestIntegrity` |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-ops-001-execution.test.ts` | Pattern reference |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-acas-guide-prep.test.ts` | Preparation checkpoint reference |
| `lib/dra-reference/src/benchmark/acquisition/metadata.ts` | Language field schema (confirms BCP-47 string) |

---

## B. Human Attestations Recorded

Both governance assessments upgraded from `REVIEW_REQUIRED` to `VERIFIED` per the human-review sign-off received 2026-08-04.

### Official Source Assessment — VERIFIED

**Assessed by:** DRA-ACQ-002-governance-reviewer  
**Assessed at:** 2026-08-04T14:00:00.000Z

Evidence basis confirmed by human reviewer:
- The guide was acquired from the official `acas.org.uk` domain
- The guide PDF is linked from the official ACAS guide landing page
- The Code was acquired from the official ACAS HTML publication at the `/html` path
- Both acquisitions returned successful HTTP responses (200 OK)
- Raw-source and normalised-text digests were recorded and verified
- The publisher is Advisory, Conciliation and Arbitration Service (Acas)

### Licence Assessment — VERIFIED WITH RECORDED EXCLUSIONS

**Assessed by:** DRA-ACQ-002-governance-reviewer  
**Assessed at:** 2026-08-04T14:00:00.000Z  
**Licence:** Open Government Licence v3.0  
**Licence URL:** https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/  
**Basis:** OPEN_LICENCE

Evidence basis confirmed by human reviewer:
- Copyright page (`https://www.acas.org.uk/copyright`) states Crown copyright and OGL v3.0 reuse terms
- OGL confirmed to apply to the guide PDF (not only website HTML pages)
- Selected evaluation boundary sections (guide pages 18–25; Code paragraphs 9–17) confirmed to contain no third-party copyright content
- No ACAS logos, trademarks or third-party material in selected evaluation boundary

**Recorded exclusions:**
- ACAS logos, trademarks, and any third-party copyright material identified on the site are excluded from the OGL grant
- Attribution requirement: source must be identified and copyright status acknowledged on republication

---

## C. Final Approved Metadata

| Field | Value | Basis |
|-------|-------|-------|
| Corpus document ID | DRA-DOC-0008 | Next available ID |
| Freeze record ID | DRA-FRZ-000002 | Next available freeze ID |
| **Title** | Discipline and grievances at work: the Acas guide | Internal document title (from guide PDF and landing page); corrected from the HTML `<title>` navigation label "Acas guide to discipline and grievances at work" |
| Publisher | Advisory, Conciliation and Arbitration Service (Acas) | Official name of the statutory body |
| Publication date | 2020-07 | July 2020 — stated on landing page as `<p>Published July 2020</p>` |
| Domain | BUSINESS | Employment discipline and grievance procedures |
| Document type | PROCEDURE | Step-by-step procedural guidance |
| Difficulty | LOW | Plain-language employment guidance |
| Language | en-GB | BCP-47; the corpus schema accepts this tag (field type: `string`) |
| Source type | HUMAN_AUTHORED | Official institutional document |
| Licence basis | OPEN_LICENCE | OGL v3.0 |
| Evaluator influenced | false | — |
| Has pre-annotated outcome | false | — |
| Source verifiable | true | Official ACAS domain |

**Authority description (Code of Practice):**  
"Acas Code of Practice on disciplinary and grievance procedures — Acas Code of Practice 1."

The primary statutory basis (section 199 of the Trade Union and Labour Relations (Consolidation) Act 1992) is supported by the acquired Code HTML text directly. It was not described as a statutory instrument.

**Date note:** The guide is recorded as "July 2020" (stored as `2020-07`). The `/2024-08/` element in the PDF file-path URL is a file hosting date and was not used as evidence of publication date.

---

## D. Licence Exclusions Check

**Assessment:** Evaluation boundary confirmed to contain no excluded content.

The selected evaluation boundary (guide pages 18–25; Code paragraphs 9–17) covers the disciplinary notification and meeting procedure in plain text. Human reviewer confirmed:

| Exclusion category | Status |
|-------------------|--------|
| ACAS logos | Not present in selected boundary sections |
| ACAS trademarks | Not present in selected boundary sections |
| Third-party copyright content | Not present in selected boundary sections |
| Images | Not applicable (text-only boundary) |

The full normalised Code text (supplied as `additionalSourceText` at evaluation time) contains only Crown-copyright text covered by the OGL. The guide PDF normalised text contains only Crown-copyright text covered by the OGL within the selected boundary.

---

## E. Source and Text Digest Verification

### Guide PDF (DRA-ACQ-000002) — primary document

| Item | Reference (prep run) | Reacquisition | Status |
|------|---------------------|---------------|--------|
| Source digest (SHA-256) | `a4c10388…ef300` | `a4c10388…ef300` | ✓ MATCH |
| Text digest (SHA-256) | `3b8f3472…83a0` | `3b8f3472…83a0` | ✓ MATCH |
| Byte length | 932,334 | 932,334 | ✓ MATCH |
| Text length (chars) | 164,726 | 164,726 | ✓ MATCH |
| Word count | 24,203 | 24,203 | ✓ MATCH |
| HTTP last-modified | Tue, 20 Aug 2024 13:35:05 GMT | Tue, 20 Aug 2024 13:35:05 GMT | ✓ MATCH |
| HTTP etag | `"e39ee-6201d7e473440"` | `"e39ee-6201d7e473440"` | ✓ MATCH |

**Result: Guide source and text digests verified — identical to preparation reference.**

### Code of Practice HTML (DRA-ACQ-000003) — source evidence only

| Item | Reference (prep run) | Reacquisition | Status |
|------|---------------------|---------------|--------|
| Source digest (SHA-256) | `ac3df85a…9143` | differs | ⚠ MISMATCH |
| Byte length | 86,099 | 86,098 | 1 byte change |
| Text digest (SHA-256) | `c838df56…bf40` | — | ⚠ MISMATCH |

**Classification:** `SOURCE_CHANGE_DETECTED` — byte count changed from 86,099 to 86,098. Possible causes: minor server-side HTML normalisation or 1-byte trailing character change between fetch timestamps.

**Impact on admission:** None. The Code of Practice is source evidence only; it is not the document being frozen as DRA-DOC-0008. The 1-byte change does not affect the guide admission, eligibility checks, freeze record, or corpus manifest.

**Review item recorded:** The Code source digest change is recorded in the test log. A human reviewer should confirm the Code text content remains substantively unchanged before evaluation time. The test continued with current bytes for evaluation boundary preparation.

---

## F. Evaluation-Boundary Preservation Record

**Subject:** Disciplinary notification and meeting procedure

**Guide boundary (generatedText):**  
From "Informing the employee" through "Allowing a worker to be accompanied at the disciplinary meeting"  
Guide pages 18–25 (acquired guide PDF, normalised via pdftotext)

**Source boundary (sourceText — Code of Practice):**  
Full normalised text of the Acas Code of Practice 1 on disciplinary and grievance procedures  
Paragraphs 9–17 are the primary boundary within that text:

| Para | Subject |
|------|---------|
| 9 | Notification in writing with sufficient information and evidence |
| 10 | Notification to include time, venue and right to be accompanied |
| 11 | Meeting held without unreasonable delay; employee reasonable preparation time |
| 12 | Employer explains complaint and evidence; employee sets out case; witnesses |
| 13 | Statutory right to companion (formal warning or disciplinary action at stake) |
| 14 | Companion from permitted categories; employer must agree to reasonable request |
| 15 | Exercising the statutory right; what constitutes a reasonable request |
| 16 | Five working days postponement rule when chosen companion unavailable |
| 17 | Companion's permitted role: address, sum up, confer; cannot answer questions or prevent employer |

**Boundary constraints satisfied:**
- ✓ Complete sentences and paragraph order preserved
- ✓ All Code paragraphs reasonably relevant to the selected guide section included
- ✓ No Code paragraph omitted to induce an issue
- ✓ No wording edited
- ✓ No annotations added to evaluated text
- ✓ No expected issue class or expected decision stored
- ✓ Boundary preservation record created before evaluator execution
- ✓ `additionalSourceText` ready: full normalised Code text normalised and verified present

**Boundary marker verification (live test):**

| Marker | Present in normalised Code text |
|--------|--------------------------------|
| "Inform the employee" | ✓ |
| "right to be accompanied" | ✓ |
| "Hold a meeting" | ✓ |
| "companion" | ✓ |

**Permitted hypothesis:**  
"The guide-versus-Code structure may exercise evidence adequacy, traceability, unsupported-claim and scope analysis. No issue class or assurance decision is predetermined."

---

## G. Duplicate and Near-Duplicate Results

| Check | Result |
|-------|--------|
| NO_DUPLICATE_CORPUS_ID — DRA-DOC-0008 | PASS — ID is available |
| NO_NEAR_DUPLICATE — against DRA-DOC-0001 to 0007 (7 texts) | PASS — no near-duplicates detected |

Assessment conducted against normalised texts of all 7 existing corpus documents. Employment discipline and grievance procedures share no vocabulary with existing corpus topics.

---

## H. Complete Eligibility Results

All 13 `checkFreezeEligibility` checks run with VERIFIED governance assessments. Results from the live admission test:

| # | Check ID | Result | Detail |
|---|----------|--------|--------|
| 1 | SOURCE_DIGEST_PRESENT | **PASS** | `a4c10388…` |
| 2 | NORMALISED_TEXT_NON_EMPTY | **PASS** | 164,726 characters |
| 3 | TEXT_DIGEST_PRESENT | **PASS** | `3b8f3472…` |
| 4 | OFFICIAL_SOURCE_VERIFIED | **PASS** | status: VERIFIED |
| 5 | LICENCE_VERIFIED | **PASS** | status: VERIFIED |
| 6 | APPROVED_TITLE_PRESENT | **PASS** | "Discipline and grievances at work: the Acas guide" |
| 7 | APPROVED_PUBLISHER_PRESENT | **PASS** | "Advisory, Conciliation and Arbitration Service (Acas)" |
| 8 | APPROVED_LANGUAGE_PRESENT | **PASS** | "en-GB" |
| 9 | CORPUS_ID_FORMAT | **PASS** | DRA-DOC-0008 matches DRA-DOC-NNNN |
| 10 | INCLUSION_RATIONALE_PRESENT | **PASS** | rationale present |
| 11 | NO_DUPLICATE_CORPUS_ID | **PASS** | DRA-DOC-0008 is available |
| 12 | NO_NEAR_DUPLICATE | **PASS** | no near-duplicates detected |
| 13 | CORPUS_ELIGIBILITY | **PASS** | eligible |

**Summary: 13/13 PASS. No blocking reasons. Document eligible for freeze.**

Improvement from preparation phase: checks 4 and 5 (OFFICIAL_SOURCE_VERIFIED, LICENCE_VERIFIED) moved from FAIL (REVIEW_REQUIRED) to PASS (VERIFIED) following human sign-off.

---

## I. Registry and Corpus-Admission Result

| Verification | Result |
|-------------|--------|
| DRA-DOC-0008 registered in `CorpusRegistry` | ✓ PASS |
| Corpus manifest document count = 1 | ✓ PASS |
| Append-only registry behaviour (no prior entries overwritten) | ✓ PASS |
| Corpus manifest digest round-trips via `registry.exportManifest()` | ✓ PASS |

DRA-DOC-0008 is registered in the in-session `CorpusRegistry` instance used by the test. The manifest records exactly one document (this session's registry; the corpus data store for DRA-DOC-0001 through DRA-DOC-0007 is maintained separately in `BENCHMARK_CORPUS` and the Apache fixture).

---

## J. Freeze Record and Manifest Verification

### Freeze record (DRA-FRZ-000002)

| Field | Value |
|-------|-------|
| freezeRecordId | DRA-FRZ-000002 |
| corpusDocumentId | DRA-DOC-0008 |
| acquisitionId | DRA-ACQ-000002 |
| sourceUrl | https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf |
| finalUrl | https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf |
| **sourceDigest** | `a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300` |
| **normalisedTextDigest** | `3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0` |
| **metadataDigest** | `d27a1b899bc71819675ffdf36de52975bb3c6bd9c5fb1e137e3c18a553efaee4` |
| **freezeRecordDigest** | `d5b9fc3f2c9be2af365ab20c449a9b9877472a80cc1ae1b6964f17e3138ee9e7` |
| frozenAt | 2026-08-04T14:30:00.000Z |
| frozenBy | DRA-ACQ-002-freeze-operator |
| benchmarkVersion | DRA-CORPUS-1.0.0 |
| normalisationVersion | DRA-NORM-v1 |

### Corpus manifest

| Field | Value |
|-------|-------|
| documentCount | 1 |
| **manifestDigest** | `fc39e1b7a6629996da3c02c7daf3faa27f1598a9d173e00661877989b8a45a93` |

### Integrity verifications

| Check | Result |
|-------|--------|
| `verifyAcquisitionFreezeRecordDigest(freezeRecord)` | ✓ PASS |
| `sourceDigest` matches reference preparation digest | ✓ PASS |
| `normalisedTextDigest` matches reference preparation digest | ✓ PASS |
| `verifyManifestIntegrity(manifest)` | ✓ PASS |
| `manifest.overallDigest === manifestDigest` | ✓ PASS |
| `registry.exportManifest().overallDigest === manifestDigest` | ✓ PASS |

---

## K. Test and Typecheck Results

```
pnpm tsc --noEmit (lib/dra-reference)
  → 0 errors (clean)

vitest run dra-acq-002-acas-guide-admission.test.ts
  Tests:    1 passed (1)
  Duration: 1.84s (live network: PDF 932KB + HTML 86KB)
  All assertions: passed

Full test suite (pnpm vitest run, lib/dra-reference):
  Test Files: 100 passed (100)
  Tests:      2948 passed (2948)
  No regressions
```

---

## L. Decision

### **DRA-DOC-0008 ADMITTED AND FROZEN — READY FOR BLIND EVALUATION**

All admission pipeline stages completed successfully:

| Stage | Result |
|-------|--------|
| Live acquisition (guide PDF, Code HTML) | ✓ PASS — HTTP 200, correct media types |
| Source digest verification vs reference | ✓ PASS — exact match |
| PDF normalisation (pdftotext, no new packages) | ✓ PASS — DRA-NORM-v1 |
| Text digest verification vs reference | ✓ PASS — exact match |
| Evaluation boundary preservation | ✓ PASS — all markers present in Code text |
| Freeze eligibility (13/13) | ✓ PASS |
| Freeze record creation (DRA-FRZ-000002) | ✓ PASS |
| Freeze record digest integrity | ✓ PASS |
| Corpus integration (DRA-DOC-0008 registered) | ✓ PASS |
| Manifest integrity | ✓ PASS |

**One review item noted (not blocking):**  
The Code of Practice HTML source digest changed by 1 byte (86,099 → 86,098 bytes) between the preparation run and the admission run. This is classified as SOURCE_CHANGE_DETECTED. The Code is source evidence only and is not frozen as DRA-DOC-0008. A human reviewer should confirm the Code text content remains substantively unchanged before evaluation. The admission itself is not affected.

**DRA-DOC-0008 is frozen and ready for blind evaluation via `evaluateFrozenBenchmarkDocument`.** The `additionalSourceText` (full normalised Code text) is prepared and available. At evaluation time, supply it via the `additionalSourceText` field of `acquireFreezeAndEvaluate` or `evaluateFrozenBenchmarkDocument`.

---

## M. Confirmation: Evaluator Not Executed; No Assurance Decision or Proof Receipt Produced

**Confirmed.**

- `evaluateDocument` was not called
- `acquireFreezeAndEvaluate` was not called (pipeline stages were called individually to stop before the evaluation step)
- `evaluateFrozenBenchmarkDocument` was not called
- No assurance decision was produced (no SUPPORTED, REVIEW, or HOLD)
- No proof receipt was generated
- No DRA-CASE infrastructure was created
- DRA-DOC-0001 through DRA-DOC-0007 were not altered
- No CTS artefact was modified
- No governance rules, schemas, normalisation logic, issue-detection logic, or evaluator logic was modified
