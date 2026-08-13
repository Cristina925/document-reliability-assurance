# DRA-ACQ-003 — Controlled Acquisition Preparation Report

**Report ID:** DRA-ACQ-003  
**Prepared:** 2026-08-04  
**Prepared by:** DRA-ACQ-003-machine-preparation  
**Status:** REVIEW_REQUIRED — awaiting human governance decisions  
**Pipeline stage:** Acquisition preparation complete; freeze blocked pending human attestation  

---

## Section A — Purpose and Scope

This report documents the controlled acquisition preparation for DRA-DOC-0009, the ninth entry in the DRA benchmark corpus. The pipeline follows the governed acquisition and freeze protocol (DRA-ENG-009) and uses the HTTP fetcher component (DRA-ENG-010).

**Pipeline scope:**
- Fetch both PDFs from nao.org.uk (live HTTPS)
- Compute source and text digests
- Run freeze-eligibility check (13 checks)
- Record machine-prepared governance assessments (REVIEW_REQUIRED)
- Define proposed evaluation boundary
- Document corpus balance contribution

**Does NOT perform:**
- Freeze-record creation
- Corpus-manifest mutation
- Evaluator execution (DRA-ENG-001 through DRA-ENG-007)
- Proof-receipt generation
- Admission decision

---

## Section B — Acquisition Pivot Notice

### Primary Candidate (OBR) — Inaccessible

The DRA-DOC-0009 qualification report (DRA-DOC-0009-QUAL-001) ranked the **OBR Economic and Fiscal Outlook March 2025** (Executive Summary) as the primary candidate. During DRA-ACQ-003 execution, every access path to `obr.uk` returned HTTP 403 with Cloudflare challenge pages (`cf-mitigated: challenge`) regardless of User-Agent header. The OBR does not mirror its publications on `assets.publishing.service.gov.uk` for the March 2025 edition (only the March 2026 EFO is available on GOV.UK). No curl-accessible alternative host for the OBR EFO March 2025 was found.

**Result:** OBR primary candidate cannot be acquired from this environment. Acquisition of OBR EFO March 2025 requires a browser-capable environment or a direct GOV.UK mirror of the publication.

### Fallback to Candidate 2 — NAO HC 543

The qualification report ranked **NAO HC 543 "Government's approach to technology suppliers: addressing the challenges"** as the second candidate. Accessibility was confirmed during qualification. Both PDFs were confirmed accessible (HTTP 200) at the time of acquisition.

**Fallback decision:** Proceed with NAO HC 543 as DRA-DOC-0009. The candidate was qualified by the same procedure and meets the same corpus-balance criteria as the OBR candidate.

---

## Section C — Document Identity

| Field | Value |
|-------|-------|
| Proposed Corpus ID | DRA-DOC-0009 |
| Document title (evaluated) | Government's approach to technology suppliers: addressing the challenges — Summary |
| Document title (source) | Government's approach to technology suppliers: addressing the challenges |
| Parliamentary Paper | HC 543, Session 2024-25 |
| Report date | 16 January 2025 |
| Publisher | National Audit Office |
| Mandate | Prepared under Section 6 of the National Audit Act 1983 |
| Ordered by | House of Commons, 14 January 2025 |
| Domain | GENERAL |
| Document type | SUMMARY |
| Difficulty | MEDIUM |
| Language | en-GB |

---

## Section D — Source Identification and Acquisition Records

### DRA-ACQ-000004 — Document Under Evaluation (Summary PDF)

| Field | Value |
|-------|-------|
| Acquisition ID | DRA-ACQ-000004 |
| Source URL | `https://www.nao.org.uk/wp-content/uploads/2025/01/governments-approach-to-technology-suppliers-addressing-the-challenges-summary.pdf` |
| Final URL | Same as source (no redirect) |
| HTTP status | 200 OK |
| Content-Type | application/pdf |
| Content-Length | 132,382 bytes |
| Last-Modified | Wed, 15 Jan 2025 10:42:06 GMT |
| ETag | `"678790fe-2051e"` |
| Retrieved at | 2026-08-04T17:29:22.332Z |
| Source digest (SHA-256) | `80c765aee266ce385c089bcf58e25ede54c2031ce0451d70345bc1c41293d220` |
| Normalised text digest | `baa4a3997753143a44196ec9f2f527dec705a6ed6e2f0ab22664c5ce19bf6c1f` |
| Normalised text length | 31,974 characters |
| Word count | 3,902 words |
| PDF extraction | pdftotext (Poppler, Nix system package) |
| Normalisation version | DRA-NORM-v1 |
| Warnings | none |

### DRA-ACQ-000005 — Evidence Source (Full Report PDF, not frozen)

| Field | Value |
|-------|-------|
| Acquisition ID | DRA-ACQ-000005 |
| Source URL | `https://www.nao.org.uk/wp-content/uploads/2025/01/governments-approach-to-technology-suppliers-addressing-the-challenges.pdf` |
| Final URL | Same as source (no redirect) |
| HTTP status | 200 OK |
| Content-Type | application/pdf |
| Content-Length | 395,147 bytes |
| Last-Modified | Wed, 15 Jan 2025 10:41:02 GMT |
| ETag | `"678790be-6078b"` |
| Retrieved at | 2026-08-04T17:29:23.195Z |
| Source digest (SHA-256) | `3e39df6d5f82fb4f5deb06efcee92810850b0be74745a87edb18df44be5d8b88` |
| Normalised text digest | `c3a0a00c7e8a92f5d24e2003157f6915e7b37a5eeeb1336ffc23ab83dafb0d5e` |
| Normalised text length | 164,382 characters |
| Word count | 18,130 words |
| PDF extraction | pdftotext (Poppler, Nix system package) |
| Normalisation version | DRA-NORM-v1 |
| Warnings | none |

---

## Section E — Governance Assessments (Machine-Prepared, REVIEW_REQUIRED)

Both assessments are machine-prepared from confirmed live HTTP observations. A human reviewer must examine the evidence and, if satisfied, upgrade each to VERIFIED. The machine must not independently assign VERIFIED.

### E.1 — Official Source Assessment

**Status:** REVIEW_REQUIRED

**Machine-assembled evidence:**

1. Summary PDF served from `nao.org.uk` (HTTP 200, `application/pdf`)
2. Full report served from `nao.org.uk` (HTTP 200, `application/pdf`)
3. `nao.org.uk` is the official domain of the National Audit Office (UK statutory body)
4. Full report PDF states: "Report by the Comptroller and Auditor General"
5. Full report PDF states: "Ordered by the House of Commons to be printed on 14 January 2025"
6. Full report PDF states: "This report has been prepared under Section 6 of the National Audit Act 1983"
7. Parliamentary Paper HC 543, Session 2024-25, dated 16 January 2025
8. No evidence of third-party mirroring; both documents downloaded directly from `nao.org.uk`

**Human reviewer actions required:**
- Confirm `nao.org.uk` is the definitive canonical host for HC 543
- Confirm both PDFs represent the current authoritative versions of the Summary and Full Report
- Confirm this is the correct DRA-DOC-0009 candidate following the OBR pivot

### E.2 — Licence Assessment

**Status:** REVIEW_REQUIRED

**Critical finding:** The NAO HC 543 full report PDF contains the following copyright notice:

> *"The material featured in this document is subject to National Audit Office (NAO) copyright. The material may be copied or reproduced for non-commercial purposes only, namely reproduction for research, private study or for limited internal circulation within an organisation for the purpose of review. [...] To reproduce NAO copyright material for any other use, you must contact copyright@nao.org.uk. [...] the NAO reserves its right to pursue copyright infringement proceedings against individuals or companies who reproduce material for commercial gain without our permission."*
>
> © National Audit Office 2025

**This is NOT Open Government Licence v3.0.** The NAO uses its own bespoke copyright regime. The relevant distinctions are:

| Dimension | OGL v3.0 | NAO Copyright |
|-----------|----------|---------------|
| Commercial use | Permitted | Requires NAO permission |
| Research / private study | Permitted | Explicitly permitted |
| Attribution required | Yes | Yes |
| Licence URL | nationalarchives.gov.uk/doc/open-government-licence/version/3/ | nao.org.uk/about-us/copyright-statement/ |

**Open questions for human review:**

1. **Research exception:** The DRA benchmark is a research use (systematic document reliability analysis). Does this fall within the NAO non-commercial "research or private study" exception?

2. **Parliamentary Paper route:** HC 543 is a Parliamentary Paper presented by the Comptroller and Auditor General. Parliamentary Papers are typically Crown copyright (not NAO copyright). If Crown copyright applies, OGL v3 may be available via the Parliamentary Papers route. Human reviewer must determine whether Crown copyright or NAO copyright governs this specific document.

3. **Benchmark publication scope:** If the DRA corpus and evaluation results are published, does this constitute commercial gain requiring NAO permission?

4. **Third-party content:** The full report references external sources. Human reviewer must confirm the evaluation scope (summary PDF) contains no third-party copyright material.

**Licence basis (machine assessment):** UNKNOWN — pending human determination.

---

## Section F — Freeze-Eligibility Results

**Test run:** 2026-08-04 (dra-acq-003-nao-tech-suppliers-prep.test.ts)

| # | Check ID | Result | Detail |
|---|----------|--------|--------|
| 1 | PROTOCOL_APPROVED | ✓ PASS | |
| 2 | CORPUS_ID_FORMAT_VALID | ✓ PASS | DRA-DOC-0009 |
| 3 | CORPUS_ID_NOT_DUPLICATE | ✓ PASS | Not present in registry |
| 4 | OFFICIAL_SOURCE_VERIFIED | ✗ **FAIL** | REVIEW_REQUIRED — machine cannot assign VERIFIED |
| 5 | LICENCE_VERIFIED | ✗ **FAIL** | REVIEW_REQUIRED — NAO copyright requires human attestation |
| 6 | TEXT_LENGTH_ADEQUATE | ✓ PASS | 31,974 chars (summary) |
| 7 | WORD_COUNT_ADEQUATE | ✓ PASS | 3,902 words |
| 8 | DOCUMENT_TYPE_PERMITTED | ✓ PASS | SUMMARY |
| 9 | LANGUAGE_DECLARED | ✓ PASS | en-GB |
| 10 | INCLUSION_RATIONALE_PROVIDED | ✓ PASS | |
| 11 | NEAR_DUPLICATE_ABSENT | ✓ PASS | No near-duplicate in DRA-DOC-0001–0008 |
| 12 | METADATA_COMPLETE | ✓ PASS | All required fields present |
| 13 | NORMALISATION_VERSION_CURRENT | ✓ PASS | DRA-NORM-v1 |

**Total:** 11 pass, 2 fail  
**Blocking reasons:** `OFFICIAL_SOURCE_NOT_VERIFIED`, `LICENCE_NOT_VERIFIED`  
**Eligible for freeze:** **No** — blocked pending human governance decisions

Both failures are expected. They are structural invariants: the pipeline must not assign VERIFIED automatically. Human governance decisions are required before freeze may proceed.

---

## Section G — Proposed Evaluation Boundary

### Document Under Evaluation (DRA-ACQ-000004 — Summary)

**Scope:** Entire normalised text of the NAO HC 543 Summary PDF.

**Content:**
- Key facts section (statistics: £14bn annual spend, 6,000 commercial function staff, etc.)
- Summary paragraphs 1–N (numbered claims on digital procurement, technology supplier relationships, programme outcomes, government recommendations)

**Character range:** 0 to 31,974 of the normalised summary text (entire document)

**Justification:** The summary PDF is a self-contained publication. It does not share pagination with the full report. No sub-section extraction is needed because the entire document constitutes the evaluation scope. This is the natural, reproducible boundary for a SUMMARY document type.

**evaluationBoundary field:** Not required in the governed pipeline input. Stage 2 will evaluate the full document text.

### Evidence Source (DRA-ACQ-000005 — Full Report, not frozen)

**Scope:** Entire normalised text of the NAO HC 543 full report PDF.

**Content:** All chapters — background analysis, findings chapters, methodology appendix, endnotes, supporting tables.

**Character range:** 0 to 164,382 of the normalised full report text (entire document)

**Justification:** The full report provides the complete evidence base for the summary's claims. No chapter sub-selection is applied — the evidence boundary is the entire full report, making it reproducible and maximally informative for the evaluator.

---

## Section H — Corpus Balance Analysis

### New contributions

| Dimension | Current corpus (0001–0008) | DRA-DOC-0009 adds |
|-----------|---------------------------|-------------------|
| Document type SUMMARY | 0 | **+1 (first)** |
| Domain GENERAL | 1 (DRA-DOC-0006) | +1 |
| Difficulty MEDIUM | N (est. 2–3) | +1 |
| Publisher NAO | 0 | **+1 (third named institution)** |
| Summary-vs-source structure | 0 genuine cases | **+1 (first)** |

### Evaluator exercise profile

DRA-DOC-0009 is expected to exercise previously underused classifier outcomes:

- **CLAIM_INCONSISTENCY:** The summary may characterise findings or statistics differently from the full report.
- **TRACEABILITY_BROKEN:** The summary references specific named programmes (e.g., Universal Credit, Police National Computer) that must appear in the full report's findings.
- **EVIDENCE_INADEQUATE:** Quantified assertions in the summary (e.g., "£14 billion annually") may not be directly traceable to a specific report section.
- **PARTIALLY_SUPPORTED:** Summary paragraphs may combine multiple findings in ways that the full report supports only partially.

The existing corpus predominately triggers `EVIDENCE_INADEQUATE`. DRA-DOC-0009 diversifies the triggered classifier set.

### Near-duplicate check

All 8 existing corpus members (DRA-DOC-0001 through DRA-DOC-0008) were checked. No near-duplicate detected. The NAO summary (government technology procurement policy, UK public spending watchdog) is topically distinct from all existing entries.

---

## Section I — Decision and Next Steps

**Preparation decision:** READY FOR HUMAN VERIFICATION

Both source digests match the preparation run. All non-governance eligibility checks pass. The document is correctly identified, accessible, and structurally suitable for the corpus.

**Blocked by:** Two governance decisions requiring human attestation.

### Required human actions before freeze may proceed

**Decision 1 — Official Source Verification:**
- Review the evidence in Section E.1
- Confirm `nao.org.uk` is the canonical host and both PDFs are authoritative
- If satisfied: upgrade `PREPARED_OFFICIAL_SOURCE_ASSESSMENT.status` to `"VERIFIED"` in the admission test
- Record attestation date and assessor ID

**Decision 2 — Licence Verification:**
- Review the evidence in Section E.2
- Determine whether DRA benchmark use is within the NAO non-commercial research exception, OR whether the Parliamentary Paper route yields Crown copyright / OGL v3 coverage
- If licence is determined compatible: upgrade `PREPARED_LICENCE_ASSESSMENT.status` to `"VERIFIED"`, record the correct `licenceBasis`, and document any required exclusions (logos, third-party content)
- If licence requires NAO permission: obtain written permission before proceeding
- Record attestation date and assessor ID

**After human sign-off, proceed to:**
1. Create `dra-acq-003-nao-tech-suppliers-admission.test.ts` — full pipeline (fetch → verify digests → eligibility with VERIFIED status → freeze record DRA-FRZ-000003 → corpus integration → manifest integrity)
2. Verify both PDFs still return the same source digests on reacquisition
3. Freeze DRA-DOC-0009 in the corpus registry
4. Proceed to blind evaluation (Task 11: evaluator v0.1.1 on DRA-DOC-0009)

---

## Appendix — Freeze Record Template (DRA-FRZ-000003)

The following fields are identified for the freeze record. Exact values will be computed during the admission step when both governance decisions are VERIFIED.

| Field | Value |
|-------|-------|
| freezeId | DRA-FRZ-000003 |
| corpusId | DRA-DOC-0009 |
| acquisitionId (evaluated doc) | DRA-ACQ-000004 |
| acquisitionId (evidence source) | DRA-ACQ-000005 |
| sourceDigest (evaluated) | `80c765aee266ce385c089bcf58e25ede54c2031ce0451d70345bc1c41293d220` |
| textDigest (evaluated) | `baa4a3997753143a44196ec9f2f527dec705a6ed6e2f0ab22664c5ce19bf6c1f` |
| sourceDigest (source) | `3e39df6d5f82fb4f5deb06efcee92810850b0be74745a87edb18df44be5d8b88` |
| textDigest (source) | `c3a0a00c7e8a92f5d24e2003157f6915e7b37a5eeeb1336ffc23ab83dafb0d5e` |
| frozenAt | (to be set in admission test) |
| evaluationBoundary | null (entire summary document) |
| documentType | SUMMARY |
| publisher | National Audit Office |
| publicationDate | 2025-01-16 |
| language | en-GB |

---

*Report generated by DRA-ACQ-003 acquisition preparation pipeline.*  
*Human governance decisions required before any freeze operation may proceed.*

---

---

# DRA-ACQ-003 — Replacement Candidate Discovery Report

**Addendum ID:** DRA-ACQ-003-REPL  
**Prepared:** 2026-08-04  
**Prepared by:** DRA-ACQ-003-machine-replacement-discovery  
**Status:** REPLACEMENT CANDIDATE QUALIFIED — awaiting human acquisition decision  
**Trigger:** Human governance decisions for NAO HC 543 received; licence determination: NOT VERIFIED — BLOCKING

---

## Section A — NAO HC 543 Closure

The NAO HC 543 candidate ("Government's approach to technology suppliers: addressing the challenges") was rejected during the human governance review phase that followed DRA-ACQ-003 preparation. Both human governance decisions are now recorded:

| Decision | Outcome |
|----------|---------|
| Official Source Verification | **VERIFIED** — `nao.org.uk` confirmed as canonical host; both PDFs confirmed authoritative |
| Licence Verification | **NOT VERIFIED — BLOCKING** — NAO copyright is not commercially permissive |

**Licence determination detail:**

The full report PDF contains the following operative copyright statement:

> *"The material featured in this document is subject to National Audit Office (NAO) copyright. The material may be copied or reproduced for non-commercial purposes only, namely reproduction for research, private study or for limited internal circulation within an organisation for the purpose of review."*

Key findings from the human review:
1. The document is **NAO copyright**, not Crown copyright. HC 543 Parliamentary Paper status does not convert NAO copyright to Crown copyright for the purposes of OGL v3 availability; the NAO is a statutory body that publishes under its own copyright regime separate from OGL.
2. The licence basis is therefore **not** `OPEN_LICENCE`, `CREATIVE_COMMONS_BY`, or any other commercially permissive category recognised by the DRA acquisition protocol.
3. Runtime Governance Labs intends the DRA corpus for potential commercial use. The NAO non-commercial exception does not cover that scope.
4. Written permission from copyright@nao.org.uk could unlock this candidate but was not sought in this cycle.

**Outcome:** NAO HC 543 is **abandoned** as DRA-DOC-0009. No freeze record, no corpus admission, no evaluator run was performed. The candidate is closed. All acquisition artefacts (digests, test files, this report) are retained for the governance record.

---

## Section B — Governance Decisions Recorded

The following human governance decisions for the NAO HC 543 candidate are entered into the permanent record:

| Decision ID | Field | Value | Recorded |
|-------------|-------|-------|---------|
| GOV-DEC-0009-001 | `officialSource.status` | `VERIFIED` | 2026-08-04 |
| GOV-DEC-0009-001 | `officialSource.attestedBy` | Human reviewer (Runtime Governance Labs) | 2026-08-04 |
| GOV-DEC-0009-002 | `licence.status` | `NOT_VERIFIED` — BLOCKING | 2026-08-04 |
| GOV-DEC-0009-002 | `licence.blockingReason` | NAO copyright; non-commercial only; no OGL v3 coverage | 2026-08-04 |
| GOV-DEC-0009-002 | `licence.writtenPermissionRequired` | true | 2026-08-04 |
| GOV-DEC-0009-003 | `candidateDisposition` | ABANDONED — licence incompatible | 2026-08-04 |
| GOV-DEC-0009-003 | `candidateReplacementRequired` | true | 2026-08-04 |

No corpus admission, freeze, or evaluator operation was associated with these decisions.

---

## Section C — Licence Incompatibility Explanation

### Why NAO copyright is not sufficient

The DRA acquisition protocol permits the following licence bases for corpus admission:

| Permitted basis | Notes |
|-----------------|-------|
| `OPEN_LICENCE` | OGL v3 or equivalent; commercial use permitted |
| `CREATIVE_COMMONS_BY` | CC BY 3.0 or later; commercial use permitted |
| `CREATIVE_COMMONS_BY_SA` | CC BY-SA; commercial use permitted with share-alike |
| `CREATIVE_COMMONS_ZERO` | CC0; no restrictions |
| `PUBLIC_DOMAIN` | Copyright expired or explicitly waived |
| `US_GOVERNMENT_WORK` | 17 U.S.C. § 105 works of US federal government |
| `OTHER_PERMISSIVE` | Written terms that clearly permit planned commercial use |

The NAO copyright regime falls into none of these categories. It grants non-commercial access only. Planned use of the DRA corpus includes commercial deployment; the NAO exception cannot be relied upon.

### Why Parliamentary Paper status does not help

HC 543 is a Parliamentary Paper (ordered by the House of Commons). Parliamentary Papers published by government **departments** are Crown copyright and, by default, OGL v3. However, the NAO is an independent statutory body that is explicitly **not** a government department. The NAO publishes under its own copyright, not Crown copyright, even when tabling documents before Parliament. This is consistent with the treatment of other arm's-length bodies such as the Bank of England and the Office for Budget Responsibility.

### Correct licence standard for replacement candidates

The replacement candidate must provide positive, explicit evidence of commercial reuse permission. Acceptable evidence includes:
- A GOV.UK publication page footer stating "Open Government Licence v3.0" (Crown copyright, government department or non-ministerial department)
- A document or webpage explicitly stating CC BY, CC0, or an equivalent commercially permissive licence
- US federal government authorship (works of the federal government are not subject to US copyright)

Evidence that is **not** sufficient:
- Public web accessibility (does not imply commercial licence)
- Parliamentary Paper status alone (does not override publisher's own copyright)
- Crown body or statutory body status (the NAO, BoE, OBR, and similar bodies use their own copyright)
- Research exception, fair dealing, or assumed OGL from GOV.UK hosting

---

## Section D — Replacement Candidate Discovery Method

### Scope and constraint

Discovery was conducted on 2026-08-04. The constraints carried forward from the DRA-DOC-0009 qualification requirements were:

| Constraint | Value |
|------------|-------|
| Document type | SUMMARY |
| Summary-to-source structure | Two separately published documents required |
| Publisher | New (not DRA-DOC-0001–0008 publishers) |
| Domain | GENERAL or LEGAL preferred |
| Difficulty | MEDIUM |
| Licence | Commercially permissive; positive explicit evidence required |
| Parser | No new infrastructure (pdftotext and HTML normalisation available) |
| Accessibility | Direct HTTP download; no browser required |

### Sources probed

The following sources were evaluated in discovery order. "Inaccessible" means the environment cannot fetch the document programmatically (Cloudflare, JS-rendering, or bot challenge). "Licence failed" means the document is accessible but copyright terms are not commercially permissive.

| Source | Outcome | Reason |
|--------|---------|--------|
| OBR obr.uk (EFO March 2026) | Inaccessible | Cloudflare 403 (`cf-mitigated: challenge`); no GOV.UK mirror for March 2026 EFO found via GOV.UK search API |
| Congressional Research Service (crsreports.congress.gov) | Inaccessible | Cloudflare 403 |
| FAS.org CRS mirror | Inaccessible | Bot challenge (HTTP 202) |
| Australian Productivity Commission (pc.gov.au) | Inaccessible | JS-rendered pages; PDF URLs not extractable |
| Law Commission (lawcom.gov.uk) | Inaccessible | PDF URL guesses all 404; publication pages JS-rendered |
| Scottish Government (gov.scot) | Inaccessible | JS-rendered |
| ONS (ons.gov.uk) | Inaccessible | JS-rendered |
| Ofcom (ofcom.org.uk) | Inaccessible | Cloudflare 403 |
| IEA (iea.org blob storage) | Inaccessible | Incorrect URL format (404) |
| NIST nvlpubs.nist.gov | Inaccessible | DOI redirect resolves to HTTP 404 at nvlpubs.nist.gov; publication may have moved |
| FTC.gov | Inaccessible | Guessed PDF URLs all 404 |
| World Bank openknowledge.worldbank.org | Licence failed (access) | PDF URL paths return `text/html` (HTML wrapper), not `application/pdf`; direct download not available without session |
| Bank of England bankofengland.co.uk | Licence failed | BoE copyright is "for non-commercial purposes" (confirmed from bankofengland.co.uk/legal); Monetary Policy Summary PDF also returns 404 on followed redirect |
| Committee on Climate Change theccc.org.uk | Not qualified | Full report PDF accessible (HTTP 200, 5.9 MB); no separately published summary PDF found on theccc.org.uk; licence not confirmed as commercially permissive |
| DSIT AI Regulation White Paper (assets.publishing.service.gov.uk) | Not qualified | GOV.UK publication page lists policy paper + impact assessment; these are complementary documents, not a summary-to-source pair |
| **CMA AI Foundation Models Initial Review** | **QUALIFIED** | Both Summary PDF and Full Report PDF HTTP 200; OGL v3 confirmed; summary-to-source structure confirmed |
| **CMA Housebuilding Market Study Final Report** | **QUALIFIED** | Both Summary PDF and Full Report PDF HTTP 200; OGL v3 confirmed; summary-to-source structure confirmed |

### Discovery tool

Primary discovery tool: GOV.UK Search API (`www.gov.uk/api/search.json`) combined with GOV.UK Content API (`www.gov.uk/api/content/{path}`). This combination is the most reliable method for identifying accessible UK government PDFs because:
1. Search API confirms publication exists and provides the correct GOV.UK URL slug
2. Content API returns JSON with actual `assets.publishing.service.gov.uk` PDF attachment URLs
3. `assets.publishing.service.gov.uk` is not Cloudflare-protected and serves PDFs directly

---

## Section E — Candidate Comparison

Three candidates were brought to shortlist stage. Two qualified; one was investigated but did not meet the two-document requirement.

### Candidate E.1 — CMA AI Foundation Models Initial Review

| Attribute | Value |
|-----------|-------|
| Publisher | Competition and Markets Authority (CMA) |
| Publication date | September 2023 |
| GOV.UK case | `/cma-cases/ai-foundation-models-initial-review` |
| Domain | GENERAL (digital markets / AI policy) |
| Difficulty | MEDIUM |
| Document type | SUMMARY |
| Summary document | `Summary_of_report_PDFA.pdf` |
| Summary URL | `https://assets.publishing.service.gov.uk/media/650425485b07380013029f7f/Summary_of_report_PDFA.pdf` |
| Summary size | 462,463 bytes |
| Summary HTTP status | 200 OK, `application/pdf` |
| Source document | `Full_Non-Confidential_Report_PDFA.pdf` |
| Source URL | `https://assets.publishing.service.gov.uk/media/650449e86771b90014fdab4c/Full_Non-Confidential_Report_PDFA.pdf` |
| Source size | 2,495,587 bytes |
| Source HTTP status | 200 OK, `application/pdf` |
| Licence basis | OGL v3 — Crown copyright (confirmed: GOV.UK page footer "All content is available under the Open Government Licence v3.0") |
| Summary-to-source relationship | Clear: the CMA published a titled "Summary of report" as a standalone PDF condensing the full non-confidential investigation report |
| Two-document requirement | ✓ Met |
| Publisher new to corpus | ✓ CMA not in DRA-DOC-0001–0008 |
| Qualified | **Yes** |

**Additional notes:** The case also has a "Short Report" (999,320 bytes), making three nested levels of detail available (Summary → Short Report → Full Report). For DRA purposes the Summary + Full Report pair is the natural acquisition target.

### Candidate E.2 — CMA Housebuilding Market Study Final Report

| Attribute | Value |
|-----------|-------|
| Publisher | Competition and Markets Authority (CMA) |
| Publication date | February 2024 |
| GOV.UK publication | `/government/publications/housebuilding-market-study-final-report` |
| Domain | GENERAL (housing / construction market policy) |
| Difficulty | MEDIUM |
| Document type | SUMMARY |
| Summary document | `_Summary_of_housebuilding_final_report_.pdf` |
| Summary URL | `https://assets.publishing.service.gov.uk/media/65d8badb6efa830011dcc5bc/_Summary_of_housebuilding_final_report_.pdf` |
| Summary size | 342,195 bytes |
| Summary HTTP status | 200 OK, `application/pdf` |
| Source document | `Housebuilding_market_study_final_report.pdf` |
| Source URL | `https://assets.publishing.service.gov.uk/media/65d8baed6efa83001ddcc5cd/Housebuilding_market_study_final_report.pdf` |
| Source size | 1,855,321 bytes |
| Source HTTP status | 200 OK, `application/pdf` |
| Licence basis | OGL v3 — Crown copyright (same GOV.UK footer applies) |
| Summary-to-source relationship | Clear: the CMA published a titled "Summary of housebuilding final report" as a standalone PDF alongside the full report |
| Two-document requirement | ✓ Met |
| Publisher new to corpus | ✓ (same CMA as E.1; CMA is new to corpus for both) |
| Qualified | **Yes** |

**Weakness relative to E.1:** Same publisher as E.1 (both CMA). Domain is more specialised (UK residential housebuilding). Less immediately relevant to NLP/AI evaluator familiarity. Summary is smaller (342 KB) than E.1 (462 KB), which slightly reduces evaluator exercise scope.

### Candidate E.3 — CCC Progress in Reducing Emissions 2024

| Attribute | Value |
|-----------|-------|
| Publisher | Committee on Climate Change (CCC) |
| Publication date | July 2024 |
| URL | `https://www.theccc.org.uk/publication/progress-in-reducing-emissions-2024-report-to-parliament/` |
| Domain | GENERAL (climate policy) |
| Full report URL | `https://www.theccc.org.uk/wp-content/uploads/2024/07/Progress-in-reducing-emissions-2024-Report-to-Parliament-Web.pdf` |
| Full report HTTP status | 200 OK, `application/pdf`, 5,889,909 bytes |
| Summary document | Not found — no separately published summary PDF identified on theccc.org.uk |
| Two-document requirement | **Not met** — only one PDF document published for this report |
| Licence basis | Not confirmed — CCC is an independent statutory body; no OGL v3 attribution found on publication page or theccc.org.uk footer |
| Qualified | **No** — fails two-document requirement; licence not confirmed |

**Disposition:** Investigated but not qualified. Would require human confirmation of: (a) existence of a separate summary PDF, and (b) explicitly commercially permissive licence terms. Not recommended for this acquisition cycle.

---

## Section F — Licence Verification Table

| Candidate | Publisher type | Licence evidence source | Licence basis | Commercial use permitted |
|-----------|---------------|------------------------|---------------|-------------------------|
| CMA AI Foundation Models | Non-ministerial government department (Crown body) | GOV.UK page footer: "All content is available under the Open Government Licence v3.0, except where otherwise stated"; GOV.UK terms and conditions confirm Crown copyright + OGL default | `OPEN_LICENCE` (OGL v3) | **Yes** |
| CMA Housebuilding | Non-ministerial government department (Crown body) | Same GOV.UK footer and terms; same Crown copyright + OGL v3 default | `OPEN_LICENCE` (OGL v3) | **Yes** |
| CCC 2024 Progress Report | Independent statutory advisory body | No explicit OGL attribution found; theccc.org.uk footer does not state OGL v3 | Unknown | Unknown — not confirmed |
| NAO HC 543 (closed) | Independent statutory body | NAO copyright statement in document: non-commercial only | NAO bespoke copyright | **No** |
| Bank of England (rejected) | Independent statutory body | bankofengland.co.uk/legal: "for non-commercial purposes" | BoE bespoke copyright | **No** |

**Positive OGL v3 evidence (CMA):** The GOV.UK terms and conditions page states: *"Most content on GOV.UK is subject to Crown copyright protection and is published under the Open Government Licence (OGL)."* The CMA is a non-ministerial government department, not an arm's-length body. Its publications on GOV.UK are Crown copyright and OGL v3 by default. The CMA AI Foundation Models case page bears the standard GOV.UK footer confirming OGL v3 applies. No "except where otherwise stated" carve-out was observed.

---

## Section G — Recommended Replacement

**Recommended DRA-DOC-0009 replacement candidate:**

> **CMA AI Foundation Models Initial Review — Summary of report**  
> (September 2023; Competition and Markets Authority)

### Recommendation rationale

| Criterion | AI Foundation Models | Housebuilding |
|-----------|---------------------|---------------|
| Licence confirmed | ✓ OGL v3 | ✓ OGL v3 |
| Direct HTTP access | ✓ | ✓ |
| Summary-to-source structure | ✓ Clear ("Summary of report" / "Full Non-Confidential Report") | ✓ Clear |
| Domain fit (GENERAL preferred) | ✓ AI/digital markets policy | ✓ Housing/construction policy |
| Summary document size | 452 KB (more substantive) | 334 KB |
| Full report size | 2.4 MB | 1.8 MB |
| Publication date | Sep 2023 | Feb 2024 |
| Evaluator exercise diversity | High — AI policy language, market analysis, claim density | Moderate — housing sector terminology |
| Evaluator self-referential risk | None — CMA is not a document reliability evaluator | None |
| Predetermined decision risk | None — investigation outcome is factual and observable | None |
| Issue class diversity | Likely: `CLAIM_INCONSISTENCY`, `TRACEABILITY_BROKEN`, `EVIDENCE_INADEQUATE` | Likely: similar, but narrower domain |

**Primary reason for ranking AI Foundation Models above Housebuilding:**

The AI Foundation Models topic is more substantively aligned with the evaluator's intended exercise profile. The summary makes high-level claims about market structure, competitive dynamics, and regulatory principles that are traceable to specific sections of the full report. This produces richer claim extraction (Stage 2) and authority resolution (Stage 3) results than the housebuilding domain, which is more numeric and planning-focused.

**No self-evaluation concern:** The CMA AI Foundation Models initial review examined AI foundation models as market participants — it is not an evaluation of document reliability assessment systems. There is no structural similarity between the subject of that report and the DRA evaluator itself.

### Proposed document identity for DRA-DOC-0009 (replacement)

| Field | Value |
|-------|-------|
| Proposed Corpus ID | DRA-DOC-0009 |
| Document title (evaluated) | AI Foundation Models: Initial Review — Summary of report |
| Document title (source) | AI Foundation Models: Initial Review — Full Non-Confidential Report |
| Publisher | Competition and Markets Authority (CMA) |
| Publication date | September 2023 |
| Domain | GENERAL |
| Document type | SUMMARY |
| Difficulty | MEDIUM |
| Language | en-GB |
| Licence basis | `OPEN_LICENCE` — Open Government Licence v3.0 |

---

## Section H — Decision

> **Decision: REPLACEMENT CANDIDATE QUALIFIED**

The CMA AI Foundation Models Initial Review (Summary of report + Full Non-Confidential Report) is a qualified replacement candidate for DRA-DOC-0009. Both documents are:

1. Accessible via direct HTTP (`assets.publishing.service.gov.uk`; HTTP 200, `application/pdf`) without browser or session requirements
2. Published under OGL v3 (Crown copyright; confirmed from GOV.UK standard terms)
3. From a new publisher not represented in DRA-DOC-0001–0008
4. In a clear summary-to-source relationship (the "Summary of report" is titled and published as a standalone condensed document)
5. Appropriately sized for the DRA pipeline (452 KB summary; 2.4 MB full report)
6. In the GENERAL domain at MEDIUM difficulty
7. Human-authored (CMA staff report; no AI generation)
8. Free of self-evaluation risk and predetermined issue class

**Acquisition may proceed** subject to the standard DRA-ACQ-003 governed acquisition pipeline: fetch → compute digests → run freeze-eligibility checks → obtain human governance decisions (Official Source Verified; Licence Verified) → freeze → corpus admission → evaluator.

The machine notes that both governance checks (Official Source and Licence) will again require human sign-off before freeze. The machine pre-assesses:
- Official Source: REVIEW_REQUIRED (awaiting human confirmation that cma.gov.uk or assets.publishing.service.gov.uk is the canonical host for this CMA publication)
- Licence: REVIEW_REQUIRED (machine has confirmed OGL v3 from GOV.UK standard terms; human reviewer should confirm no "except where otherwise stated" carve-out applies to this specific CMA case)

---

## Section I — Corpus Integrity Confirmation

The following is a formal record confirming no corpus operations occurred during or following the DRA-ACQ-003 NAO HC 543 candidate phase or the replacement discovery phase:

| Operation | Status |
|-----------|--------|
| Freeze record created for NAO HC 543 | **Not performed** |
| Corpus manifest mutated for NAO HC 543 | **Not performed** |
| Evaluator run on NAO HC 543 | **Not performed** |
| Proof receipt generated for NAO HC 543 | **Not performed** |
| Freeze record created for CMA AI Foundation Models | **Not performed** — discovery only; awaiting acquisition pipeline |
| Corpus manifest mutated for CMA AI Foundation Models | **Not performed** |
| Evaluator run on CMA AI Foundation Models | **Not performed** |
| Any operation on DRA-DOC-0001–0008 | **Not performed** — existing corpus unchanged |

**Corpus state:** DRA-DOC-0001 through DRA-DOC-0008 are frozen and unchanged. DRA-DOC-0009 is unassigned. The corpus contains 8 documents. The next admission will assign DRA-DOC-0009.

**Next action required:** Human governance authorisation to proceed with the CMA AI Foundation Models acquisition. Upon authorisation, the DRA-ACQ-003 governed acquisition pipeline should be executed for:
- Summary: `https://assets.publishing.service.gov.uk/media/650425485b07380013029f7f/Summary_of_report_PDFA.pdf`
- Full Report: `https://assets.publishing.service.gov.uk/media/650449e86771b90014fdab4c/Full_Non-Confidential_Report_PDFA.pdf`

---

*Replacement discovery addendum prepared by DRA-ACQ-003 replacement discovery pipeline.*  
*No corpus admission, freeze, evaluator operation, or proof receipt was performed.*  
*Human governance decisions required before acquisition pipeline may execute.*
