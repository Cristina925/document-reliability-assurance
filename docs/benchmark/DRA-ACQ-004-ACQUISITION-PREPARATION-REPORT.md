# DRA-ACQ-004 Acquisition Preparation Report
## CMA AI Foundation Models: Short Version — DRA-DOC-0009 Candidate

**Report ID:** DRA-ACQ-004-PREP  
**Preparation date:** 2026-08-04  
**Prepared by:** DRA-ACQ-004 automated acquisition pipeline  
**Status:** REVIEW_REQUIRED — awaiting human governance attestation  
**Proposed Corpus ID:** DRA-DOC-0009  

---

## Context: Predecessor Attempts

### DRA-ACQ-001 — Apache HTTP Server Guide (Fixture)
Used exclusively as a validation fixture. Not a public acquisition.

### DRA-ACQ-002 — Acas Discipline and Grievances Guide
Successfully acquired and frozen as DRA-DOC-0008 (PDF: `discipline-and-grievances-at-work-the-acas-guide.pdf`, 4,165,714 bytes). Acquisition IDs DRA-ACQ-000002 (guide, DUE) and DRA-ACQ-000003 (Code of Practice, evidence source).

### DRA-ACQ-003 — NAO Technology Suppliers Review (ABANDONED)
**Status: ABANDONED — BLOCKING GOVERNANCE FAILURE**

The NAO Technology and Suppliers Review (HC 543, 2023–24) was the initial DRA-DOC-0009 candidate. Acquisition IDs DRA-ACQ-000004 (summary) and DRA-ACQ-000005 (full report) were reserved. The document was technically accessible and fully normalised, but the licence governance check failed irrecoverably:

- The NAO holds its own non-OGL copyright for all NAO reports.
- The report's Parliamentary Paper status does not convert the licence to OGL v3.
- The phrase "reproduction of Parliamentary information is permitted under the Open Parliament Licence" applies to parliamentary proceedings only, not to NAO-authored reports.
- No reuse of the normalised text in a public benchmark is permitted without express NAO consent.

**Decision:** Candidate abandoned. All artefacts (digests, test file, governance assessment) are retained for the governance record under DRA-ACQ-003. IDs DRA-ACQ-000004 and DRA-ACQ-000005 remain reserved and will not be reassigned.

### DRA-ACQ-003-REPL — Replacement Discovery
A systematic survey of ~15 candidate sources was conducted. Approximately twelve were eliminated (Cloudflare blocks, non-commercial licences, 404s, World Bank HTML-only, Bank of England non-commercial copyright, CCC no separate summary PDF, NIST 404). Two qualified candidates were identified, both CMA publications on `assets.publishing.service.gov.uk`, both OGL v3:

1. **CMA AI Foundation Models Initial Review (Sep 2023)** — *recommended*
2. CMA Housebuilding Market Study Final Report (Feb 2024) — backup

Human governance authorised candidate 1 (CMA AI Foundation Models Initial Review) for DRA-ACQ-004.

---

## Section A — Publication Identification

| Field | Value |
|-------|-------|
| **Publication title** | AI Foundation Models: Initial Report |
| **Publisher** | Competition and Markets Authority (CMA) |
| **Publisher type** | Non-ministerial government department, UK |
| **Publication date** | 18 September 2023 |
| **Subject** | Competition and consumer protection analysis for AI foundation models |
| **GOV.UK landing page** | https://www.gov.uk/government/publications/ai-foundation-models-initial-report |
| **CMA case page** | https://www.gov.uk/cma-cases/ai-foundation-models-initial-review |
| **GOV.UK Content API** | https://www.gov.uk/api/content/government/publications/ai-foundation-models-initial-report |
| **Content API first_published_at** | 2023-09-18 |
| **Content API updated_at** | 2026-06-30 |

---

## Section B — Document Inventory (Landing Page)

Three documents are listed on the GOV.UK publication landing page. Asset URLs were resolved directly from the GOV.UK Content API on 2026-08-04.

**Note:** These landing-page asset IDs differ from the PDFA versions on the CMA case page (`Summary_of_report_PDFA.pdf`, `Short_Report_PDFA.pdf`, `Full_Non-Confidential_Report_PDFA.pdf`). DRA-ACQ-004 uses the landing-page URLs as the canonical source.

| # | Landing page title | Filename | Asset URL | Bytes | Last-Modified |
|---|-------------------|----------|-----------|-------|---------------|
| 1 | AI Foundation Models: Summary (PDF, 452KB) | `Summary_.pdf` | https://assets.publishing.service.gov.uk/media/65081d1b4cd3c3001468cb6e/Summary_.pdf | 479,730 | Mon, 18 Sep 2023 |
| 2 | AI Foundation Models: Short version (PDF, 964KB) | `Short_version_.pdf` | https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf | 999,699 | Mon, 18 Sep 2023 |
| 3 | AI Foundation Models: Full report (PDF, 2438KB) | `Full_report_.pdf` | https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf | 2,514,017 | Mon, 18 Sep 2023 |

### Document selection rationale

The `Summary_.pdf` (479,730 bytes, internal title "AI Foundation Models: Summary") is a 3-page, 613-word overview that is too brief for meaningful DRA evaluation. It does not contain traceable claims; it is effectively a press-release summary.

The `Short_version_.pdf` (999,699 bytes, internal title "AI Foundation Models: Short Version") is a substantive 37-page, 12,628-word short report. It preserves the full chapter structure of the Initial Report in condensed form, provides explicit numbered paragraphs (1.1–1.96), and is the genuine "official short report" intended for public readers who want a full but concise account of the review.

**Selected document under evaluation:** `Short_version_.pdf` — "AI Foundation Models: Short Version"  
**Selected evidence source:** `Full_report_.pdf` — "AI Foundation Models: Initial Report"

---

## Section C — HTTP Acquisition Record

### Document under evaluation — DRA-ACQ-000008

| Field | Value |
|-------|-------|
| **Acquisition ID** | DRA-ACQ-000008 |
| **Document role** | Document under evaluation (SUMMARY type) |
| **Requested URL** | https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf |
| **Final URL** | https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf |
| **HTTP status** | 200 OK |
| **Content-Type** | application/pdf |
| **Content-Length** | 999,699 bytes |
| **Last-Modified** | Mon, 18 Sep 2023 09:49:32 GMT |
| **ETag** | (recorded at test time) |
| **Retrieved at (pass 1)** | 2026-08-04T18:44:58.559Z |

### Evidence source — DRA-ACQ-000009

| Field | Value |
|-------|-------|
| **Acquisition ID** | DRA-ACQ-000009 |
| **Document role** | Evidence source (not frozen in corpus) |
| **Requested URL** | https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf |
| **Final URL** | https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf |
| **HTTP status** | 200 OK |
| **Content-Type** | application/pdf |
| **Content-Length** | 2,514,017 bytes |
| **Last-Modified** | Mon, 18 Sep 2023 09:49:46 GMT |
| **ETag** | (recorded at test time) |
| **Retrieved at (pass 1)** | 2026-08-04T18:44:59.423Z |

---

## Section D — Digest Record

### Source digests (SHA-256 of raw PDF bytes)

| Document | Acquisition ID | Source digest | Byte length |
|----------|----------------|---------------|-------------|
| Short Version (DUE) | DRA-ACQ-000008 | `e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f` | 999,699 |
| Full Report (evidence) | DRA-ACQ-000009 | `8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af` | 2,514,017 |

### Text digests (SHA-256 of pdftotext DRA-NORM-v1 normalised text)

Normalisation: pdftotext -layout → UTF-8 BOM removal → CRLF→LF normalisation.  
Algorithm: `computeContentDigest` = `createHash("sha256").update(text, "utf8").digest("hex")`.

| Document | Acquisition ID | Text digest | Text length (chars) | Word count |
|----------|----------------|-------------|---------------------|------------|
| Short Version (DUE) | DRA-ACQ-000008 | `dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed` | 89,713 | 12,628 |
| Full Report (evidence) | DRA-ACQ-000009 | `e81c6ffe5f4d1f9ec3e958aa215f49bcf4ab32766305fd73b8c6755765757d84` | 370,671 | 49,444 |

---

## Section E — Reproducibility Check

Both PDFs were acquired twice from the same URLs (live HTTPS). Results:

| Document | Pass 1 source digest | Pass 2 source digest | Match | Pass 1 text digest | Pass 2 text digest | Match |
|----------|----------------------|----------------------|-------|--------------------|--------------------|-------|
| Short Version | `e7fb5008...` | `e7fb5008...` | ✓ IDENTICAL | `dee3ab3c...` | `dee3ab3c...` | ✓ IDENTICAL |
| Full Report | `8346bc78...` | `8346bc78...` | ✓ IDENTICAL | `e81c6ffe...` | `e81c6ffe...` | ✓ IDENTICAL |

**Result:** Both documents are deterministic. Source content is stable at the recorded URLs.

---

## Section F — Internal Title Verification

Internal titles were confirmed by extracting PDF text with `pdftotext -layout`:

| Asset filename | Landing page title | Internal cover heading | First content heading | Date on cover |
|----------------|-------------------|------------------------|----------------------|---------------|
| `Summary_.pdf` | "AI Foundation Models: Summary (PDF, 452KB)" | "AI Foundation Models: Summary" | (body text, no heading) | 18 September 2023 |
| `Short_version_.pdf` | "AI Foundation Models: Short version (PDF, 964KB)" | "AI Foundation Models: Short Version" | "AI Foundation Models: Short Version" | 18 September 2023 |
| `Full_report_.pdf` | "AI Foundation Models: Full report (PDF, 2438KB)" | "AI Foundation Models: Initial Report" | "AI Foundation Models: Initial Report" | 18 September 2023 |

**Key finding:** The Full Report is titled "AI Foundation Models: **Initial Report**" internally — not "Full report" as shown on the landing page. This is the canonical title for citation purposes.

---

## Section G — Official Source Assessment

**Status: REVIEW_REQUIRED — machine-prepared, not verified**

### Evidence

1. Both PDFs resolved from the canonical GOV.UK publication landing page:  
   `https://www.gov.uk/government/publications/ai-foundation-models-initial-report`  
   GOV.UK Content API confirmed: `first_published_at: 2023-09-18`, `updated_at: 2026-06-30`

2. Publisher listed on landing page: **Competition and Markets Authority**

3. Both PDFs served from `assets.publishing.service.gov.uk` — the official GOV.UK CDN.

4. Both PDFs carry the internal heading "18 September 2023" (consistent with the official publication date).

5. The CMA is a non-ministerial government department of the United Kingdom, established under the Enterprise and Regulatory Reform Act 2013.

6. The CMA case page (`/cma-cases/ai-foundation-models-initial-review`) cross-references the same publication.

7. The asset URLs differ from the PDFA versions on the CMA case page. Both sets carry the same publication date. The landing-page PDFs (selected here) are the primary publication files.

### Requires human review

- [ ] Confirm both PDFs represent the authoritative official publications as intended by the CMA
- [ ] Confirm no subsequent revisions have replaced these asset files since 18 September 2023
- [ ] Confirm `Short_version_.pdf` is the intended "short report" for DRA-DOC-0009 (not the `Summary_.pdf`)
- [ ] Confirm the CMA qualifies as an official government source for DRA corpus purposes

**Machine pre-assessment:** REVIEW_REQUIRED. Upgrade to VERIFIED only after all human review items are confirmed.

---

## Section H — Licence Assessment

**Status: REVIEW_REQUIRED — machine-prepared, not verified**

### Evidence — Full Report

The Full Report PDF (`Full_report_.pdf`) states on its second page (immediately after the cover):

> **© Crown copyright 2022**  
> You may reuse this information (not including logos) free of charge in any format or medium, under the terms of the Open Government Licence.  
> To view this licence, visit www.nationalarchives.gov.uk/doc/open-government-licence/ or  
> write to the Information Policy Team, The National Archives, Kew, London TW94DU, or  
> email: psi@nationalarchives.gsi.gov.uk

**Note on copyright year:** The notice states "Crown copyright 2022" while the publication date is 2023-09-18. This is likely a typographic error in the PDF. The OGL coverage is not affected by the year notation.

The OGL URL (`www.nationalarchives.gov.uk/doc/open-government-licence/`) is the unversioned National Archives OGL URL, which currently redirects to OGL v3 at:  
`https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/`

### Evidence — Short Version

The Short Version PDF (`Short_version_.pdf`) does not contain an explicit OGL notice in its pdftotext-extracted text. The following indirect evidence supports Crown copyright / OGL v3 coverage:

1. Published on the same GOV.UK landing page as the Full Report, by the same publisher (CMA), on the same date (18 September 2023).
2. The GOV.UK terms of use state: "Most content on GOV.UK is subject to Crown copyright protection and is published under the Open Government Licence."
3. The GOV.UK standard page footer states: "All content is available under the Open Government Licence v3.0, except where otherwise stated."
4. The CMA is a non-ministerial government department; its publications default to Crown copyright + OGL v3 unless explicitly exempted.
5. No "except where otherwise stated" carve-out was observed on the landing page or in the Short Version PDF text.

### Evidence — Summary PDF (for reference, not selected as DUE)

The Summary PDF similarly shows no explicit OGL notice in extracted text. Same GOV.UK/CMA reasoning applies.

### OGL v3 scope for DRA use

- OGL v3 permits free reuse of information in any format or medium, including commercial use, subject to attribution.
- Attribution required: "Contains public sector information licensed under the Open Government Licence v3.0."
- Logos are excluded from OGL reuse. The DRA evaluation scope is text only; no logos are included.
- OGL v3 does not require share-alike.
- Publishing benchmark results with attribution fully satisfies OGL v3 terms.

### Requires human review

- [ ] Confirm Full Report PDF cover page copyright notice ("Crown copyright 2022, OGL") is authentic and applies to the Full Report text
- [ ] Confirm Short Version PDF cover page shows the same Crown copyright / OGL notice (visual inspection of PDF cover page required — the notice was not captured by pdftotext extraction)
- [ ] Confirm no "except where otherwise stated" exception applies to either PDF
- [ ] Confirm no third-party copyright material within evaluation scope requires separate clearance
- [ ] Confirm commercial use of benchmark results is covered by OGL v3

**Machine pre-assessment:** OPEN_LICENCE (OGL v3, Crown copyright). Upgrade to VERIFIED only after all human review items are confirmed.

---

## Section I — Section Boundary Map

### Short Version chapter structure

The Short Version (12,628 words, 37 pages) uses a single-chapter numbered paragraph structure (1.1–1.96) with titled sub-sections:

| Paragraph range | Section heading | Approx. pages |
|----------------|-----------------|---------------|
| 1.1–1.8 | (Introduction) | pp. 1–2 |
| 1.9–1.10 | How FMs are developed and deployed today | pp. 2–4 |
| 1.11–1.19 | Key inputs required for building a FM; How FMs are deployed and used in user-facing applications; Firm structure and integration | pp. 4–7 |
| 1.20–1.43 | Competition in the development of FMs (incl. Conclusion) | pp. 8–14 |
| 1.44–1.68 | (Impact on other markets); Effective choice and the ability to switch; The impact of vertical integration and partnerships (incl. Conclusion) | pp. 14–24 |
| 1.69–1.91 | Consumer protection (incl. Conclusion) | pp. 24–36 |
| 1.92–1.96 | Next steps | pp. 36–37 |

### Full Report chapter structure

The Full Report (49,444 words) contains the following chapters (from the table of contents):

| Chapter | Title | Full Report pages |
|---------|-------|-------------------|
| 1 | Introduction | p. 5 |
| 2 | Background (What are FMs, development, computing power, deployment, landscape) | p. 8 |
| 3 | Competition and barriers to entry in the development of FMs | p. 27 |
| 4 | The impact of FMs on competition in other markets | p. 54 |
| 5 | Consumer Protection | p. 79 |

### Section-to-chapter mapping

| Short Version section | Short Version paragraphs | Full Report chapter/section | Relationship | Charts/annexes |
|-----------------------|-------------------------|-----------------------------|--------------|----------------|
| Introduction | 1.1–1.8 | Ch 1: Introduction | Direct | None |
| How FMs are developed and deployed today | 1.9–1.10 | Ch 2: Background — What are FMs?, FM landscape | Direct | None |
| Key inputs required for building a FM | 1.11–1.13 | Ch 2: Background — How are FMs developed? (Pre-training, Fine-tuning, Computing power) | Direct | Figure 1 caption (deployment overview) |
| How FMs are deployed (user-facing apps) | 1.14–1.15 | Ch 2: Background — Deployment, routes to market | Direct | None |
| Firm structure and integration | 1.17–1.19 | Ch 2: Background — AI supply chains; Ch 4: vertical integration | Cross-cutting | None |
| Competition in the development of FMs | 1.20–1.43 | Ch 3: Competition and barriers to entry | Direct | Box 1 (open-source model example → Ch 3 "Open-source models") |
| Impact on other markets (access/switch) | 1.44–1.51 | Ch 4: Deploying FMs in downstream markets; Ch 4: effective choice | Direct | Box 2 (online search case study) |
| Impact on other markets (vertical integration) | 1.52–1.68 | Ch 4: vertical integration; anti-competitive conduct | Direct | Box 3 (productivity software case study) |
| Consumer protection | 1.69–1.91 | Ch 5: Consumer Protection | Direct | None |
| Next steps | 1.92–1.96 | Ch 1 next steps; principles from Ch 3–5 | Cross-cutting | None |

### Unresolved mapping questions

1. **Seven guiding principles (1.5–1.7):** The Short Version lists 7 principles at paragraphs 1.5–1.7. These principles are developed across Chapters 3–5 of the Full Report; the Short Version may require the evaluator to search multiple chapters for supporting evidence.
2. **Figure 1:** The deployment overview diagram (referenced at 1.13) is not evaluable as text; its caption is within scope.
3. **Open-source model uncertainties (1.38–1.40 / Box 1):** Maps to Ch 3, section "Open-source models / Will open-source models remain a key part of the market?".
4. **Statistical claims:** FM developer counts, parameter counts, funding figures in the Short Version map to Ch 2 footnotes and Ch 3 data sections in the Full Report. These will be evaluated for evidence adequacy.

---

## Section J — Metadata Proposal

**Status: REVIEW_REQUIRED — requires human confirmation before freeze**

| Field | Proposed value | Basis |
|-------|----------------|-------|
| `corpusId` | DRA-DOC-0009 | Next available corpus ID |
| `title` | AI Foundation Models: Short Version | Internal PDF heading |
| `publisher` | Competition and Markets Authority | GOV.UK landing page, PDF cover |
| `publicationDate` | 2023-09-18 | PDF internal heading; GOV.UK Content API |
| `domain` | GENERAL | AI/digital markets policy; topically distinct from all DRA-DOC-0001–0008 |
| `documentType` | SUMMARY | First SUMMARY type in corpus; Short Version is a substantive condensed version of the Initial Report |
| `difficulty` | MEDIUM | Regulatory/policy analysis; accessible to informed public; no specialist AI or legal prerequisites required |
| `language` | en-GB | British English throughout |
| `sourceType` | HUMAN_AUTHORED | CMA-authored document; no AI generation |

### Justification for SUMMARY type

The SUMMARY type was chosen (rather than REPORT) because:
- The document is explicitly titled "Short Version" — it is a condensed narrative of the longer Initial Report
- It was published simultaneously with the full Initial Report on the same landing page, as a companion short version
- All substantive claims in the Short Version are traceable to the Initial Report
- The purpose is DRA evaluation of summary-vs-source claim accuracy, which is the defining characteristic of SUMMARY-type corpus entries

---

## Section K — Inclusion Rationale

The CMA AI Foundation Models Short Version adds distinct coverage on three dimensions not represented in DRA-DOC-0001–0008:

1. **First SUMMARY-type entry.** The corpus previously contained zero SUMMARY-type documents (DRA-DOC-0001–0006 are REWRITE or REPORT; DRA-DOC-0007 is PROCEDURE; DRA-DOC-0008 is PROCEDURE). Adding a SUMMARY type exercises the evaluator on a distinct and important relationship: condensed narrative vs. full report, where claims are expected to be supported but may be under-evidenced, imprecisely attributed, or cross-cutting.

2. **New institution.** The CMA is not represented in the current corpus. Its regulatory/analytical writing style (formal but accessible, numbered paragraphs, explicitly hedged claims) provides new surface variation.

3. **New domain coverage.** The document covers AI market competition and consumer protection policy — distinct from all existing corpus entries (which cover employment law, web authentication, technology procurement, and physical measurement standards). Adding GENERAL-domain AI policy coverage exercises the evaluator on technology governance claims.

4. **Genuine summary relationship.** Both the Short Version (12,628 words) and the Initial Report (49,446 words) were published simultaneously on the same landing page. The condensation ratio (~1:4) and the chapter-by-chapter parallel structure provide well-defined mapping between the summary and its source.

5. **No self-evaluation risk.** The CMA AI Foundation Models review examined competition in AI markets. It is not an evaluation of document reliability or claim-tracing systems; there is no risk that the evaluator is assessing content that references its own domain.

6. **No predetermined issue class.** The evaluator will assess claims without foreknowledge of expected issues. The summary-vs-full-report relationship may exercise CLAIM_INCONSISTENCY, EVIDENCE_INADEQUATE, and TRACEABILITY_BROKEN analysis, but no issue is forced.

---

## Section L — Near-Duplicate Check

The Short Version normalised text was checked for near-duplication against the existing corpus (DRA-DOC-0001 through DRA-DOC-0008) using the `checkFreezeEligibility` pipeline:

| Existing document | Source | Result |
|-------------------|--------|--------|
| DRA-DOC-0001 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0002 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0003 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0004 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0005 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0006 | BENCHMARK_CORPUS | Not a near-duplicate |
| DRA-DOC-0007 | Apache HTTPD fixture | Not a near-duplicate |
| DRA-DOC-0008 | Acas guide (live fetch) | Not a near-duplicate |

**Result:** NEAR_DUPLICATE check PASSED. The Short Version text is not a near-duplicate of any existing corpus entry.

---

## Section M — Freeze Eligibility Pre-Assessment

**Status at time of preparation:** 11/13 checks PASS, 2/13 checks FAIL (REVIEW_REQUIRED)

| Check ID | Result | Detail |
|----------|--------|--------|
| SOURCE_DIGEST_PRESENT | ✓ PASS | Source digest computed and present |
| SOURCE_BYTES_NON_EMPTY | ✓ PASS | 999,699 bytes |
| NORMALISED_TEXT_NON_EMPTY | ✓ PASS | 89,713 chars |
| OFFICIAL_SOURCE_VERIFIED | ✗ FAIL — BLOCKING | Machine-prepared assessment; human attestation required |
| LICENCE_VERIFIED | ✗ FAIL — BLOCKING | Machine-prepared assessment; human attestation required |
| CORPUS_ID_FORMAT | ✓ PASS | DRA-DOC-0009 matches required format |
| NOT_ALREADY_IN_REGISTRY | ✓ PASS | DRA-DOC-0009 not yet registered |
| PROTOCOL_APPROVED | ✓ PASS | Protocol status: APPROVED |
| PERMITTED_DOCUMENT_TYPE | ✓ PASS | SUMMARY is in permittedDocumentTypes |
| INCLUSION_RATIONALE_PRESENT | ✓ PASS | Non-empty inclusion rationale |
| NEAR_DUPLICATE_ABSENT | ✓ PASS | No near-duplicate in existing corpus |
| TARGET_CORPUS_SIZE_NOT_REACHED | ✓ PASS | Registry has capacity |
| LANGUAGE_SUPPORTED | ✓ PASS | en-GB is supported |

**Blocking reasons:** OFFICIAL_SOURCE_NOT_VERIFIED, LICENCE_NOT_VERIFIED  
**Path to eligibility:** Human reviewer must attest both governance checks (Sections G and H above) and upgrade both to VERIFIED. All other checks are expected to pass without further changes.

---

## Section N — Proposed Freeze Record Skeleton

**Freeze ID to be assigned:** DRA-FRZ-000003  
**Status:** NOT YET CREATED — freeze is blocked pending governance attestation

When the human reviewer has verified Sections G and H, the freeze record will contain:

```json
{
  "freezeId": "DRA-FRZ-000003",
  "corpusId": "DRA-DOC-0009",
  "acquisitionId": "DRA-ACQ-000008",
  "frozenAt": "<reviewer-assigned timestamp>",
  "sourceDigest": "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f",
  "textDigest": "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed",
  "byteLength": 999699,
  "mediaType": "application/pdf",
  "normalisationVersion": "DRA-NORM-v1",
  "metadata": {
    "title": "AI Foundation Models: Short Version",
    "publisher": "Competition and Markets Authority",
    "publicationDate": "2023-09-18",
    "domain": "GENERAL",
    "documentType": "SUMMARY",
    "difficulty": "MEDIUM",
    "language": "en-GB"
  },
  "officialSourceStatus": "VERIFIED",
  "licenceStatus": "VERIFIED",
  "licenceBasis": "OPEN_LICENCE",
  "inclusionRationale": "<see Section K>",
  "evaluationBoundary": "<see test file PROPOSED_EVALUATION_BOUNDARY>"
}
```

Note: `normalisedText` and `wordCount` are omitted from the freeze record per DRA-OPS-001 convention (these fields are recomputed from the digest, not stored in the freeze record).

---

## Section O — Evidence Source Record (Not Frozen)

The Full Report (DRA-ACQ-000009) is the evidence source for DRA-DOC-0009. It is **not** frozen in the corpus as a separate document. It is retained as a reference source for the evaluator to consult during Stage 4 (Evidence Linkage) when tracing Short Version claims.

| Field | Value |
|-------|-------|
| Acquisition ID | DRA-ACQ-000009 |
| Internal title | AI Foundation Models: Initial Report |
| URL | https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf |
| Source digest | `8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af` |
| Text digest | `e81c6ffe5f4d1f9ec3e958aa215f49bcf4ab32766305fd73b8c6755765757d84` |
| Byte length | 2,514,017 |
| Text length | 370,671 chars |
| Word count | 49,444 |

---

## Section P — Next Actions

1. **Human reviewer:** Inspect `Section G` (Official Source Assessment) and confirm that both PDFs represent the authoritative official CMA publications. Mark official source as VERIFIED.

2. **Human reviewer:** Inspect `Section H` (Licence Assessment) and:
   - Open the Short Version PDF and visually inspect the cover page for a Crown copyright / OGL notice.
   - Confirm no "except where otherwise stated" carve-out applies to either PDF.
   - Mark licence as VERIFIED.

3. **Once both attestations complete:** Create the freeze record (DRA-FRZ-000003) for DRA-DOC-0009 using the skeleton in Section N.

4. **Register DRA-DOC-0009** in the corpus registry with the freeze record.

5. **Add DRA-DOC-0009 entry to BENCHMARK_CORPUS** (`corpus-data.ts`) — document type SUMMARY, evidence source pointing to the Full Report (DRA-ACQ-000009 text).

6. **Run the full test suite** after freeze and corpus registration to confirm no regressions (expected: 3,072+ tests passing).

7. **Proceed to DRA-TASK-10 (DRA-DOC-0009 acquisition and freeze)** and **DRA-TASK-11 (evaluator run on DRA-DOC-0009)** as per the task queue.

---

## Appendix — Acquisition Test File Reference

Test file: `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-004-cma-ai-fm-prep.test.ts`  
Test suite: `DRA-ACQ-004 — Controlled Acquisition Preparation for DRA-DOC-0009`  
Result: 1 test, 1 passed  
Duration: ~8.1 seconds (live HTTP, including second-pass reproducibility check)  
Run date: 2026-08-04

---

*DRA-ACQ-004 — Acquisition Preparation Report — Generated 2026-08-04 — Status: REVIEW_REQUIRED*
