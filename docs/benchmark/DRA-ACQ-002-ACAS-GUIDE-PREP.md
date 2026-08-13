# DRA-ACQ-002 — Controlled Acquisition Preparation for DRA-DOC-0008

**Status:** ACQUISITION PREPARED — READY FOR HUMAN VERIFICATION  
**Prepared:** 2026-08-04  
**Test file:** `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-acas-guide-prep.test.ts`

---

## A. Files Reviewed and Modified

### Files reviewed (read-only)

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/benchmark/acquisition/eligibility.ts` | `checkFreezeEligibility` — 13-check procedure, exact field names, blocking reasons |
| `lib/dra-reference/src/benchmark/acquisition/governed-pipeline.ts` | `acquireFreezeAndEvaluate` — pipeline stages, stop-before boundary |
| `lib/dra-reference/src/benchmark/acquisition/licence.ts` | `LicenceAssessment` schema, VERIFIED invariant, `LICENCE_BASIS_VALUES` |
| `lib/dra-reference/src/benchmark/acquisition/metadata.ts` | `ApprovedMetadata` interface, all field types |
| `lib/dra-reference/src/benchmark/acquisition/schema.ts` | `AcquisitionRequestSchema`, `ACQUISITION_ID_REGEX`, `SupportedMediaType` |
| `lib/dra-reference/src/benchmark/acquisition/request.ts` | `createAcquisitionRequest` signature |
| `lib/dra-reference/src/benchmark/acquisition/normalisation.ts` | `normaliseContent`, `PdfExtractor` hook, `NormalisedDocument` |
| `lib/dra-reference/src/benchmark/acquisition/http-fetcher.ts` | `createHttpFetcher`, `HttpFetcherOptions` |
| `lib/dra-reference/src/benchmark/acquisition/integrity.ts` | `computeSourceDigest` |
| `lib/dra-reference/src/benchmark/corpus/registry.ts` | `CorpusRegistry` |
| `lib/dra-reference/src/benchmark/governance/schema.ts` | `buildMinimalProtocol` |
| `lib/dra-reference/src/benchmark/evidence/corpus-data.ts` | `BENCHMARK_CORPUS` — DRA-DOC-0001 to 0006 texts |
| `lib/dra-reference/src/benchmark/acquisition/fixtures/apache-httpd-auth-fixture.ts` | `APACHE_HTTPD_AUTH_HTML` — DRA-DOC-0007 source text |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-ops-001-execution.test.ts` | Pattern reference for operational test construction |

### Files created

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-acas-guide-prep.test.ts` | Controlled acquisition preparation test (this task) |
| `docs/benchmark/DRA-ACQ-002-ACAS-GUIDE-PREP.md` | This report |

### Files not modified

All existing files are read-only for this task. No evaluator logic, issue classes, decision semantics, governance rules, eligibility rules, schemas, normalisation logic, acquisition infrastructure, existing frozen corpus entries, DRA-DOC-0001 through DRA-DOC-0007, or any CTS artefact was modified.

---

## B. Corrected Candidate Metadata

| Field | Recorded value | Basis |
|-------|---------------|-------|
| **Corpus document ID** | DRA-DOC-0008 | Proposed; next available ID |
| **Acquisition ID** | DRA-ACQ-000002 | Next sequential after DRA-ACQ-000001 |
| **Document title** | Acas guide to discipline and grievances at work | Landing page HTML `<title>` tag (stripped " \| Acas" suffix); also confirmed from document internal title "Discipline and grievances at work: the Acas guide" |
| **Publisher** | Advisory, Conciliation and Arbitration Service (Acas) | Official name of the statutory body |
| **Guide PDF URL** | https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf | Official ACAS server |
| **Guide landing page URL** | https://www.acas.org.uk/acas-guide-to-discipline-and-grievances-at-work | Official ACAS server |
| **Document edition/date** | July 2020 | Stated on landing page as `<p>Published July 2020</p>` — exact HTML element text |
| **File-path date** | 2024-08 | File hosting path element only; **not** an adequate indicator of publication date |
| **Document type** | PROCEDURE | Step-by-step practical guidance |
| **Domain** | BUSINESS | Employment discipline and grievance procedures |
| **Source type** | HUMAN_AUTHORED | Official institutional document |
| **Difficulty** | LOW | Plain-language employment guidance |
| **Language** | en | Confirmed from `lang="en"` attribute on landing page HTML |

**Mandatory date correction applied:** The guide is recorded as "July 2020" based on the explicit statement on the landing page HTML (`<p>Published July 2020</p>`). The `/2024-08/` element in the PDF file-path URL is a file hosting/upload timestamp and was not used as evidence of publication date.

---

## C. Official Source Evidence

**Assessment status: REVIEW_REQUIRED — human attestation required before freeze**

The machine has prepared the following evidence. A human reviewer must verify each point and, if satisfied, may upgrade the assessment to VERIFIED.

| Evidence item | Source |
|---------------|--------|
| Guide PDF URL fetched: HTTP 200 OK; `content-type: application/pdf` | Live HTTP response, 2026-08-04T13:10:18.950Z |
| Guide landing page: HTTP 200 OK; `content-type: text/html; charset=UTF-8; content-language: en` | Live HTTP response |
| Landing page `<title>`: "Acas guide to discipline and grievances at work \| Acas" | HTML inspection |
| Landing page states: "Published July 2020" (exact `<p>` element text) | HTML inspection |
| Document internal title: "Discipline and grievances at work: the Acas guide" | PDF text extraction |
| PDF `last-modified` response header: `Tue, 20 Aug 2024 13:35:05 GMT` | HTTP response header |
| PDF `content-length`: 932334 bytes; `etag: "e39ee-6201d7e473440"` | HTTP response header |
| Domain `acas.org.uk` is the official domain of ACAS | Public knowledge; requires human confirmation |
| Document downloaded directly from `acas.org.uk`; no evidence of third-party mirroring | HTTP observation |
| ACAS is a UK statutory body established under the Employment Protection Act 1975 | Public knowledge; requires human confirmation |

**For human reviewer:** Confirm `acas.org.uk` is the authoritative domain for this publication and that this PDF is the current definitive version of the guide.

---

## D. Licence Evidence and Human-Verification Status

**Assessment status: REVIEW_REQUIRED — human attestation required before freeze**

**Proposed licence basis:** `OPEN_LICENCE`  
**Proposed licence name:** Open Government Licence v3.0  
**Proposed licence URL:** https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

| Evidence item | Source |
|---------------|--------|
| Copyright page URL: https://www.acas.org.uk/copyright — HTTP 200 OK | Live HTTP fetch, 2026-08-04 |
| Copyright page states: "© Crown copyright 2022" | Copyright page HTML text |
| Copyright page states: "This website is licensed under the Open Government Licence except where otherwise stated." | Copyright page HTML text |
| Copyright page states: Crown copyright material may be reproduced for research, private study or internal circulation | Copyright page HTML text |
| Copyright page notes: permission does not extend to third-party copyright material on the site | Copyright page HTML text |
| Copyright page last reviewed: 21 September 2022 | Copyright page HTML text |
| OGL version 3.0 URL linked from copyright page | Copyright page HTML text |

**Exclusions noted:** The copyright page explicitly states that "The permission to reproduce Crown-protected material does not extend to any material on this site identified as being the copyright of a third party." The guide is a predominantly text document. The evaluation boundary (paragraphs 9–17 of the Code text) contains no images, logos, or identifiable third-party content.

**For human reviewer:**
1. Confirm OGL applies to the guide PDF document itself (not only to website HTML pages)
2. Confirm the selected evaluation boundary sections contain no third-party copyright content
3. Confirm no logos, trademarks or third-party material appear in the selected sections
4. Confirm proposed benchmark use is within the scope of the OGL

---

## E. Acquisition Representation Selected

**Primary document (guide):** `application/pdf`

**Rationale:**
- The guide is published exclusively as PDF and DOCX at `acas.org.uk`. No HTML version of the guide content exists; the landing page HTML contains only navigation, a description, and download links (confirmed by inspection).
- The ACAS guide landing page does not provide a machine-readable HTML representation of the guide text.
- `application/pdf` is a supported media type in `SUPPORTED_MEDIA_TYPES` (schema.ts).
- The `AcquisitionDependencies` interface includes `pdfExtractor?: PdfExtractor` — a designed injectable hook for exactly this use case.
- `pdftotext` (Poppler 25.07.0) is installed in the Nix environment as a system package. It was injected as the `pdfExtractor` using a Node.js `child_process.execFile` wrapper. **No new npm packages were added.**
- The pdftotext extraction produced 24,203 words / 164,726 characters with no warnings.
- The pipeline's `normaliseContent("application/pdf", ..., pdfExtractor)` call succeeded without errors.

**Source evidence document (Code of Practice):** `text/html`

- An HTML version of the ACAS Code of Practice is published at the official `/html` path:  
  `https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html`
- `text/html` is fully supported by the existing normalisation pipeline with no extractor needed.
- No new infrastructure was required for the Code HTML acquisition.
- The Code HTML will be provided as `additionalSourceText` to the pipeline at freeze time.

**Rejected alternatives:**
- `.docx` format: not a supported media type in the existing pipeline schema
- Adding a PDF npm package: excluded per the task constraint ("do not add PDF parsing infrastructure solely for this case"); the existing `pdfExtractor` hook was used with an already-installed system utility instead

---

## F. Acquired Artefacts and Integrity Digests

### Guide PDF — DRA-ACQ-000002

| Field | Value |
|-------|-------|
| Acquisition ID | DRA-ACQ-000002 |
| Requested URL | https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf |
| Final URL | https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf |
| Media type | application/pdf |
| HTTP status | 200 OK |
| Byte length | 932,334 bytes |
| Retrieved at | 2026-08-04T13:10:18.950Z |
| HTTP `last-modified` | Tue, 20 Aug 2024 13:35:05 GMT |
| HTTP `etag` | `"e39ee-6201d7e473440"` |
| **Source digest (SHA-256)** | `a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300` |
| Normalisation version | DRA-NORM-v1 |
| Encoding | utf-8 |
| Normalised text length | 164,726 characters |
| Word count | 24,203 |
| pdftotext warnings | none |
| **Normalised text digest (SHA-256)** | `3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0` |

### Code of Practice HTML — DRA-ACQ-000003 (source evidence only)

| Field | Value |
|-------|-------|
| Acquisition ID | DRA-ACQ-000003 |
| Requested URL | https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html |
| Final URL | https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html |
| Media type | text/html |
| HTTP status | 200 OK |
| Byte length | 86,099 bytes |
| Retrieved at | 2026-08-04T13:10:19.640Z |
| **Source digest (SHA-256)** | `ac3df85ab5573a41da3de291a07f07e8a02840bc76a63c55c7944f23de0b9143` |
| Normalisation version | DRA-NORM-v1 |
| Encoding | utf-8 |
| **Normalised text digest (SHA-256)** | `c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40` |

*Note: The Code of Practice is fetched as source evidence only. It will not be frozen as an independent corpus entry. Its normalised text will be supplied as `additionalSourceText` in the `acquireFreezeAndEvaluate` call at freeze time.*

---

## G. Proposed Evaluation Boundary

**Subject:** Disciplinary notification and meeting procedure

**Guide sections (generatedText):**  
"Informing the employee" through "Allowing a worker to be accompanied at the disciplinary meeting"  
Approximate extent: guide pages 18–25

**Code paragraphs (sourceText):**  
Paragraphs 9–17 of the Acas Code of Practice 1:

- Para 9: Notification in writing with sufficient information and evidence
- Para 10: Notification to include time, venue and right to be accompanied
- Para 11: Meeting held without unreasonable delay; employee reasonable preparation time
- Para 12: Employer explains complaint and evidence; employee sets out case; witnesses
- Para 13: Statutory right to companion (formal warning or disciplinary action at stake)
- Para 14: Companion from permitted categories; employer must agree to reasonable request
- Para 15: Exercising the statutory right; what constitutes a reasonable request
- Para 16: Five working days postponement rule when chosen companion unavailable
- Para 17: Companion's permitted role: address, sum up, confer; cannot answer questions or prevent employer

**Rationale for this boundary:**
- One coherent procedural subject: notification through meeting conduct
- The Code states the statutory minimum in numbered, discrete paragraphs
- The guide provides practical elaboration, preparation checklists, and procedural specifics not stated in the Code text — creating a natural evaluation surface without fabricating defects
- All Code paragraphs relevant to this subject are included (9–17); no paragraph is omitted to induce TRACEABILITY_BROKEN
- No guide sections are combined across unrelated topics
- No sentences are truncated; no wording is edited; no defects are inserted
- The boundary will not be adjusted after seeing evaluator results

**Capability note:** The guide-versus-Code structure may exercise evidence adequacy, traceability, unsupported-claim and scope analysis. No issue class or assurance decision is predetermined.

---

## H. Duplicate and Near-Duplicate Results

Assessed against normalised texts of DRA-DOC-0001 through DRA-DOC-0007 (7 existing corpus documents).

| Check | Result |
|-------|--------|
| Duplicate corpus ID `DRA-DOC-0008` | NOT FOUND — ID is available |
| Near-duplicate (Jaccard ≥ 0.8) | NOT DETECTED |
| Check result from `checkFreezeEligibility` | **PASS** — `NO_NEAR_DUPLICATE` |

**Assessment:** Employment discipline and grievance procedures share no vocabulary with the existing corpus topics (ISO 31000/45001 safety audit, GDPR DPIA, vendor cloud risk, NHS sepsis alerting, SOX/IFRS financial controls, ISO 27001 security policy, Apache HTTP authentication). Jaccard similarity against all seven existing texts was below the 0.6 "requires manual review" threshold.

---

## I. Eligibility Check Results

All 13 `checkFreezeEligibility` checks were run. Results from the live test run:

| # | Check ID | Result | Detail |
|---|----------|--------|--------|
| 1 | SOURCE_DIGEST_PRESENT | **PASS** | `a4c10388…` (64 hex chars) |
| 2 | NORMALISED_TEXT_NON_EMPTY | **PASS** | 164,726 characters |
| 3 | TEXT_DIGEST_PRESENT | **PASS** | `3b8f3472…` (64 hex chars) |
| 4 | OFFICIAL_SOURCE_VERIFIED | **FAIL** | status: REVIEW_REQUIRED — awaiting human attestation |
| 5 | LICENCE_VERIFIED | **FAIL** | status: REVIEW_REQUIRED — awaiting human attestation |
| 6 | APPROVED_TITLE_PRESENT | **PASS** | "Acas guide to discipline and grievances at work" |
| 7 | APPROVED_PUBLISHER_PRESENT | **PASS** | "Advisory, Conciliation and Arbitration Service (Acas)" |
| 8 | APPROVED_LANGUAGE_PRESENT | **PASS** | "en" |
| 9 | CORPUS_ID_FORMAT | **PASS** | DRA-DOC-0008 matches DRA-DOC-NNNN |
| 10 | INCLUSION_RATIONALE_PRESENT | **PASS** | 724 characters |
| 11 | NO_DUPLICATE_CORPUS_ID | **PASS** | DRA-DOC-0008 is available |
| 12 | NO_NEAR_DUPLICATE | **PASS** | no near-duplicates detected across 7 texts |
| 13 | CORPUS_ELIGIBILITY | **PASS** | eligible |

**Summary:** 11/13 PASS, 2/13 FAIL  
**Blocking reasons:** `OFFICIAL_SOURCE_NOT_VERIFIED`, `LICENCE_NOT_VERIFIED`  
**Assessment:** Both failures are structurally expected and correct. The machine may not independently assign VERIFIED to official-source or licence assessments. All 11 checks that do not require human attestation passed without exception.

---

## J. Repository Validation and Test Results

```
pnpm tsc --noEmit          →  0 errors (clean)
vitest run dra-acq-002-acas-guide-prep.test.ts
  Tests:   1 passed (1)
  Duration: 1.45s (live network: PDF 932KB + HTML 86KB)
  All assertions:   passed
```

Full test suite run after adding the new test file: all existing tests continue to pass (no regressions).

---

## K. Decision

### **ACQUISITION PREPARED — READY FOR HUMAN VERIFICATION**

All machine-verifiable preparation steps completed successfully:

- Both documents acquired live from official ACAS servers (HTTP 200, correct media types)
- Guide PDF normalised via `pdftotext` using the existing `PdfExtractor` injectable hook; no new packages added
- Source and normalised-text digests computed and recorded
- All 11 non-attestation eligibility checks pass
- No duplicate corpus ID; no near-duplicate content detected
- Metadata, inclusion rationale, and evaluation boundary proposed

**Blocking condition for freeze:** Two governance attestation checks (OFFICIAL_SOURCE_VERIFIED, LICENCE_NOT_VERIFIED) require human sign-off. A human reviewer must:

1. Examine the official-source evidence (section C) and, if satisfied, upgrade `PREPARED_OFFICIAL_SOURCE_ASSESSMENT.status` from `REVIEW_REQUIRED` to `VERIFIED`
2. Examine the licence evidence (section D) — specifically confirming OGL applies to the guide PDF and that no third-party exclusions apply to the evaluation boundary sections — and, if satisfied, upgrade `PREPARED_LICENCE_ASSESSMENT.status` from `REVIEW_REQUIRED` to `VERIFIED`
3. Review and confirm the proposed metadata (section B) including the publication date correction (July 2020, not 2024-08)
4. Review and approve the proposed evaluation boundary (section G)

Once both assessments are VERIFIED and metadata/boundary are approved, the acquisition is ready to proceed to `acquireFreezeAndEvaluate` with the recorded digests as the reference baseline.

---

## L. Confirmation: Evaluator Not Executed; Document Not Admitted or Frozen

**Confirmed.** The evaluator was not executed.

- `acquireFreezeAndEvaluate` was not called
- `evaluateDocument` was not called
- No freeze record was created
- No corpus manifest was mutated
- No proof receipt was generated
- No persisted decision was created
- DRA-DOC-0008 is not registered in any `CorpusRegistry` instance
- No existing corpus entry (DRA-DOC-0001 through DRA-DOC-0007) was modified
- No evaluator logic, issue classes, decision semantics, governance rules, eligibility rules, schemas, normalisation logic, or acquisition infrastructure was modified
- No CTS artefact was modified
