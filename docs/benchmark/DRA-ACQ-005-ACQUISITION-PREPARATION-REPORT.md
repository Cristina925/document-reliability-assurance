# DRA-ACQ-005 Acquisition Preparation Report
## NIST Artificial Intelligence Risk Management Framework (AI RMF 1.0) — DRA-DOC-0010 Candidate

**Report ID:** DRA-ACQ-005-PREP  
**Preparation date:** 2026-08-04  
**Prepared by:** DRA-ACQ-005 automated acquisition pipeline  
**Status:** REVIEW_REQUIRED — awaiting human governance attestation  
**Proposed Corpus ID:** DRA-DOC-0010  

---

## Section A — Publication Identification

| Field | Value |
|-------|-------|
| **Publication title** | Artificial Intelligence Risk Management Framework (AI RMF 1.0) |
| **Publication number** | NIST AI 100-1 |
| **Publisher** | National Institute of Standards and Technology (NIST) |
| **Publisher parent** | U.S. Department of Commerce |
| **Publication date** | January 2023 (formal date: 26 January 2023) |
| **Subject** | AI risk management governance framework for organisations developing, deploying, or using AI systems |
| **DOI** | 10.6028/NIST.AI.100-1 |
| **DOI URL** | https://doi.org/10.6028/NIST.AI.100-1 |
| **Canonical PDF URL** | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| **NIST CSRC page** | https://csrc.nist.gov/pubs/ai/100/1/final (returned HTTP 404 during preparation; nvlpubs.nist.gov is the active canonical host) |

---

## Section B — Document Inventory

The NIST AI RMF 1.0 is a **single-document publication**. There is no separate "short version" or companion summary document equivalent to the DRA-ACQ-004 pairing. The canonical PDF at the registered DOI URL is the complete document.

| Document | URL | Bytes | Last-Modified |
|----------|-----|-------|---------------|
| AI RMF 1.0 (complete) | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf | 1,946,127 | Wed, 04 Jun 2025 17:14:26 GMT |

### Note on Last-Modified date

The HTTP `Last-Modified` header returns `Wed, 04 Jun 2025 17:14:26 GMT`. The document internal text consistently states "January 2023" and identifies itself as "AI RMF 1.0" throughout. No version 1.1 or later indicators were found in the pdftotext-extracted text. The June 2025 date likely reflects a server-side re-rendering (for example, accessibility tagging or PDF standards compliance update), not a substantive content revision. Human review must confirm the fetched document is the published AI RMF Version 1.0 (January 2023).

### Note on single-document acquisition

Unlike DRA-ACQ-004 (which acquired a paired short version + full report), DRA-ACQ-005 acquires the AI RMF 1.0 as a single self-contained framework document:
- **Acquisition ID DRA-ACQ-000012**: The complete AI RMF 1.0 PDF — functions as both the document under evaluation and its own primary source.
- No separate evidence-source PDF is acquired.
- Cited external references (NIST CSF, NIST SP 800-series, ISO/IEC standards, OECD AI Principles) constitute the external evidence base and are consulted via cited authority resolution during the evaluation pipeline (Stage 3).

### Note on HEAD request behaviour

`HEAD` requests to `nvlpubs.nist.gov` return HTTP 404 (server configuration). `GET` requests return HTTP 200 with the full PDF content. The DRA HTTP fetcher uses `GET` and correctly receives the document. This behaviour is confirmed by the preparation run.

---

## Section C — HTTP Acquisition Record

| Field | Value |
|-------|-------|
| **Acquisition ID** | DRA-ACQ-000012 |
| **Requested URL** | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| **Final URL** | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| **HTTP status** | 200 OK |
| **Content-Type** | application/pdf |
| **Content-Length** | 1,946,127 bytes |
| **Last-Modified** | Wed, 04 Jun 2025 17:14:26 GMT |
| **ETag** | "327b21f74d5db1:0" |
| **Retrieved at (pass 1)** | 2026-08-06T07:07:13.163Z |

---

## Section D — Digest Record

### Source digest (SHA-256 of raw PDF bytes)

| Acquisition ID | Source digest | Byte length |
|----------------|---------------|-------------|
| DRA-ACQ-000012 | `7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1` | 1,946,127 |

### Text digest (SHA-256 of pdftotext DRA-NORM-v1 normalised text)

Normalisation: `pdftotext -layout` → UTF-8 BOM removal → CRLF→LF normalisation.  
Algorithm: `computeContentDigest` = `createHash("sha256").update(text, "utf8").digest("hex")`.

| Acquisition ID | Text digest | Text length (chars) | Word count |
|----------------|-------------|---------------------|------------|
| DRA-ACQ-000012 | `6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430` | 122,238 | 15,918 |

---

## Section E — Reproducibility Check

The NIST AI RMF PDF was acquired twice from the same URL (live HTTPS) during the preparation run.

| Pass | Source digest | Match | Text digest | Match |
|------|---------------|-------|-------------|-------|
| Pass 1 | `7576edb5…` | — | `6cb8afe6…` | — |
| Pass 2 | `7576edb5…` | ✓ IDENTICAL | `6cb8afe6…` | ✓ IDENTICAL |

**Result:** The document is deterministic. Source content is stable at the canonical URL.

---

## Section F — Internal Title Verification

Internal titles confirmed by `pdftotext -layout` extraction:

| Field | Value found in PDF text |
|-------|------------------------|
| Cover page title | "Artificial Intelligence Risk Management Framework (AI RMF 1.0)" |
| Publication number (cover) | "NIST AI 100-1" |
| Publication date (cover) | "January 2023" |
| Authoring organisation | "National Institute of Standards and Technology" |
| Author/signer | "Laurie E. Locascio, NIST Director and Under Secretary of Commerce for Standards and Technology" |
| DOI reference (internal) | "This publication is available free of charge from: https://doi.org/10.6028/NIST.AI.100-1" |
| Version string in text | "AI RMF 1.0" (throughout); "Version 1.0" in version control section |
| Version 1.1+ indicators | None found in extracted text |

---

## Section G — Official Source Assessment

**Status: REVIEW_REQUIRED — machine-prepared, not verified**

### Evidence

1. Document fetched from `https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf` — the NIST official publications host.

2. DOI `10.6028/NIST.AI.100-1` resolves via `https://doi.org/10.6028/NIST.AI.100-1` to the nvlpubs URL. DOI resolution confirmed during preparation.

3. Publisher: National Institute of Standards and Technology — a non-regulatory federal agency of the U.S. Department of Commerce, established by the National Institute of Standards and Technology Act (15 U.S.C. § 271 et seq.).

4. Internal attributions consistent with official NIST publication:
   - "U.S. Department of Commerce / Gina M. Raimondo, Secretary"
   - "National Institute of Standards and Technology / Laurie E. Locascio, NIST Director"

5. Document content, structure, and disclaimers are consistent with NIST Special Publication format.

6. HTTP response headers (ETag, Last-Modified, Content-Length) are stable across two independent fetches.

7. **Last-Modified Jun 2025:** The server timestamp post-dates the January 2023 publication date. The extracted document text consistently identifies itself as "AI RMF 1.0" throughout; no version 1.1 or higher indicators were found. The update is assessed as a server-side re-rendering, not a substantive content revision.

### Requires human review

- [ ] Confirm the fetched PDF is the published NIST AI RMF Version 1.0 (January 2023) without substantive content changes since original publication
- [ ] Confirm the June 2025 Last-Modified date reflects only a server-side re-rendering (not a content revision)
- [ ] Confirm NIST qualifies as an official government source for DRA corpus purposes
- [ ] Confirm the nvlpubs.nist.gov URL is the authoritative canonical source for this document

**Machine pre-assessment:** REVIEW_REQUIRED. Upgrade to VERIFIED only after all human review items are confirmed.

---

## Section H — Licence Assessment

**Status: REVIEW_REQUIRED — machine-prepared, not verified**

### Evidence

1. **17 U.S.C. § 105 (U.S. Copyright Law):** "Copyright protection under this title is not available for any work of the United States Government." NIST is an agency of the U.S. federal government; its authored works are U.S. government works.

2. **No copyright notice in document.** No "©", "Copyright", or Creative Commons licence statement appears in the pdftotext-extracted text. This is consistent with U.S. government public domain status.

3. **Free availability statement on cover page:** "This publication is available free of charge from: https://doi.org/10.6028/NIST.AI.100-1"

4. **USA.gov government works policy:** "U.S. government works are not subject to copyright protection in the United States. Most U.S. government works are in the public domain." (https://www.usa.gov/government-works)

5. **Third-party content disclaimer (cover page):** "Certain commercial entities, equipment, or materials may be identified in this document in order to describe an experimental procedure or concept adequately. Such identification is not intended to imply recommendation or endorsement by the National Institute of Standards and Technology, nor is it intended to imply that the entities, materials, or equipment are necessarily the best available for the purpose." This disclaimer pertains to identification of specific commercial entities, not to copyright in referenced materials.

6. **Figures and diagrams:** The document contains figures (Figs. 1–3) and tables (Tables 1–4). The AI RMF 1.0 sources some figures from third parties (e.g., "Modified from OECD (2022) OECD Framework..."). The DRA evaluation scope is text only; figures are not evaluated.

### Scope for DRA use

- U.S. government works are unrestricted for reuse (public domain in the United States).
- The evaluation scope is the normalised plain text; no logos, diagrams, or figures are included.
- Publishing benchmark results that include excerpted text from the AI RMF 1.0 is permissible under U.S. public domain rules.
- No attribution requirement exists under public domain, but DRA documentation includes full publication metadata as a matter of practice.

### Requires human review

- [ ] Confirm the document qualifies entirely as a U.S. government work (no incorporated third-party copyrighted text in the evaluation scope)
- [ ] Confirm no portions of the text scope are subject to third-party copyright restrictions
- [ ] Confirm public domain status applies to the evaluation use (benchmark publication with excerpts)

**Machine pre-assessment:** OPEN_LICENCE (PUBLIC_DOMAIN — U.S. government work, 17 U.S.C. § 105). Upgrade to VERIFIED only after all human review items are confirmed.

---

## Section I — Document Structure and Evaluation Boundary

### Document structure (from Table of Contents)

| Section | Title | Approx. pages |
|---------|-------|---------------|
| — | Executive Summary | p. 1 |
| Part 1 | Foundational Information | pp. 4–19 |
| 1 | Framing Risk | p. 4 |
| 1.1 | Understanding and Addressing Risks, Impacts, and Harms | p. 4 |
| 1.2 | Challenges for AI Risk Management | p. 5 |
| 1.2.1 | Risk Measurement | p. 5 |
| 1.2.2 | Risk Tolerance | p. 7 |
| 1.2.3 | Risk Prioritization | p. 7 |
| 1.2.4 | Organizational Integration and Management of Risk | p. 8 |
| 2 | Audience | p. 9 |
| 3 | AI Risks and Trustworthiness | p. 12 |
| 3.1 | Valid and Reliable | p. 13 |
| 3.2 | Safe | p. 14 |
| 3.3 | Secure and Resilient | p. 15 |
| 3.4 | Accountable and Transparent | p. 15 |
| 3.5 | Explainable and Interpretable | p. 16 |
| 3.6 | Privacy-Enhanced | p. 17 |
| 3.7 | Fair – with Harmful Bias Managed | p. 17 |
| 4 | Effectiveness of the AI RMF | p. 19 |
| Part 2 | Core and Profiles | pp. 20–34 |
| 5 | AI RMF Core | p. 20 |
| 5.1 | Govern | p. 21 |
| 5.2 | Map | p. 24 |
| 5.3 | Measure | p. 28 |
| 5.4 | Manage | p. 31 |
| 6 | AI RMF Profiles | p. 33 |
| App. A | Descriptions of AI Actor Tasks from Figures 2 and 3 | p. 35 |
| App. B | How AI Risks Differ from Traditional Software Risks | p. 38 |
| App. C | AI Risk Management and Human-AI Interaction | p. 40 |
| App. D | Attributes of the AI RMF | p. 42 |

**Total document extent:** 42 pages of substantive content (plus cover matter, TOC, list of figures/tables).

### Evaluation boundary

**In scope (full normalised text, excluding navigation and boilerplate):**
- Executive Summary
- Part 1: Chapters 1–4 (all sections and subsections)
- Part 2: Chapters 5–6 (including Tables 1–4: all categories and subcategories for GOVERN, MAP, MEASURE, MANAGE)
- Appendices A–D

**Excluded:**
- Cover matter (title page, DOI availability notice, cover page attributions)
- Table of Contents, List of Tables, List of Figures (navigation, not substantive)
- Running headers ("NIST AI 100-1", "AI RMF 1.0" repeated at page tops)
- "This publication is available free of charge from:" footer lines (boilerplate)
- Page number artefacts at page breaks

**Evidence source:** The document is self-contained. External evidence cited within the document (NIST CSF, NIST SP 800-37, NIST SP 800-30, ISO/IEC 23894, OECD AI Principles, NIST Privacy Framework) constitutes the external evidence base for Stage 3 (Authority Resolution) and Stage 4 (Evidence Linkage).

---

## Section J — Metadata Proposal

**Status: REVIEW_REQUIRED — requires human confirmation before freeze**

| Field | Proposed value | Basis |
|-------|----------------|-------|
| `corpusId` | DRA-DOC-0010 | Next available corpus ID after DRA-DOC-0009 (CMA, proposed) |
| `title` | Artificial Intelligence Risk Management Framework (AI RMF 1.0) | PDF cover page heading |
| `publisher` | National Institute of Standards and Technology (NIST) | PDF cover page |
| `publicationDate` | 2023-01-26 | Formal publication date for NIST AI 100-1 |
| `domain` | TECHNICAL | AI risk management, trustworthiness, governance |
| `documentType` | POLICY | Authoritative government framework establishing governance principles for AI risk management; explicitly outcome-focused and non-prescriptive |
| `difficulty` | HIGH | Technical risk management taxonomy; cross-functional governance language; assumes familiarity with enterprise risk management |
| `language` | en | US English |
| `sourceType` | HUMAN_AUTHORED | NIST-authored framework document |

### Justification for POLICY type

The document is explicitly described as a "Framework" — a non-prescriptive, outcome-focused governance document. It establishes four functions (GOVERN, MAP, MEASURE, MANAGE) with categories and subcategories, but explicitly states it is "outcome-focused and non-prescriptive" (Appendix D, Attribute 7). This distinguishes it from a PROCEDURE (step-by-step instructions) and from a REPORT (findings). POLICY is the correct type for authoritative governance frameworks that establish principles and categories without mandating specific implementation steps.

---

## Section K — Inclusion Rationale

The NIST AI RMF 1.0 adds distinct coverage across three dimensions not represented in DRA-DOC-0001–0009:

1. **First POLICY-type corpus entry.** DRA-DOC-0001–0009 contain no POLICY-type documents. The corpus currently holds AI_GENERATED REPORT/REWRITE types (0001–0006), PROCEDURE types (0007–0008), and one proposed SUMMARY type (0009). Adding POLICY exercises the evaluator on a fundamentally different document relationship: a framework that makes governance claims (in the GOVERN/MAP/MEASURE/MANAGE structure) where the evidence is the cited standards and principles, not a paired full-report source.

2. **New institution.** NIST is not represented in the current corpus. Its technical standards writing style (formal definitions, subcategory tables, cross-references to NIST CSF and SP 800-series) provides new surface variation distinct from CMA regulatory narrative (DRA-DOC-0009), Acas employment guidance (DRA-DOC-0008), or Apache HTTP Server technical documentation (DRA-DOC-0007).

3. **New domain coverage within TECHNICAL.** Existing TECHNICAL entries cover safety audit compliance (DRA-DOC-0001–0002) and technical systems compliance (DRA-DOC-0003–0005). The AI RMF adds AI governance and trustworthiness — a distinct subdomain that exercises the evaluator on governance claims (organisational risk management, trustworthiness characteristics) rather than physical-system or process compliance claims.

4. **PUBLIC_DOMAIN source.** The first U.S. government public domain document in the corpus. All previous entries are either AI-generated or published under OGL/bespoke licences. Public domain status removes all licence constraints.

5. **Self-contained structure.** The AI RMF 1.0 is a single 42-page framework document. There is no separate "short version" pair. The evaluator assesses the framework claims directly, exercising cross-referencing between the narrative (Part 1) and the structured categories/subcategories (Part 2: Tables 1–4). This exercises EVIDENCE_INADEQUATE and TRACEABILITY_BROKEN analysis in a novel structured-document context.

6. **No self-evaluation risk.** The NIST AI RMF addresses organisational AI risk management. It does not reference document reliability assessment, DRA methodology, or claim-tracing systems. There is no risk that the evaluator is assessing content in its own domain.

7. **No predetermined issue class.** The evaluator will assess policy claims without foreknowledge of expected outcomes.

---

## Section L — Near-Duplicate Check

The NIST AI RMF 1.0 normalised text was checked against the eight existing corpus documents (DRA-DOC-0001 through DRA-DOC-0008) using the `checkFreezeEligibility` pipeline:

| Check | Existing document | Source | Result |
|-------|-------------------|--------|--------|
| NO_NEAR_DUPLICATE | DRA-DOC-0001 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0002 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0003 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0004 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0005 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0006 | BENCHMARK_CORPUS | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0007 | Apache HTTPD fixture | Not a near-duplicate |
| NO_NEAR_DUPLICATE | DRA-DOC-0008 | Acas guide (live fetch) | Not a near-duplicate |

**Eligibility check result:** NO_NEAR_DUPLICATE — PASS. The NIST AI RMF text is not a near-duplicate of any existing corpus entry.

**Note:** DRA-DOC-0009 (CMA AI Foundation Models Short Version) is pending human governance review and is not yet registered in the corpus. Near-duplicate comparison against DRA-DOC-0009 will be required before DRA-DOC-0010 is frozen, if DRA-DOC-0009 is frozen first.

---

## Section M — Freeze Eligibility Pre-Assessment

**Status at time of preparation:** 11/13 checks PASS, 2/13 checks FAIL (REVIEW_REQUIRED)

| Check ID | Result | Detail |
|----------|--------|--------|
| SOURCE_DIGEST_PRESENT | ✓ PASS | digest: 7576edb5… |
| NORMALISED_TEXT_NON_EMPTY | ✓ PASS | 122,238 characters |
| TEXT_DIGEST_PRESENT | ✓ PASS | digest: 6cb8afe6… |
| OFFICIAL_SOURCE_VERIFIED | ✗ FAIL — BLOCKING | status: REVIEW_REQUIRED |
| LICENCE_VERIFIED | ✗ FAIL — BLOCKING | status: REVIEW_REQUIRED |
| APPROVED_TITLE_PRESENT | ✓ PASS | Artificial Intelligence Risk Management Framework (AI RMF 1.0) |
| APPROVED_PUBLISHER_PRESENT | ✓ PASS | National Institute of Standards and Technology (NIST) |
| APPROVED_LANGUAGE_PRESENT | ✓ PASS | en |
| CORPUS_ID_FORMAT | ✓ PASS | id: DRA-DOC-0010 |
| INCLUSION_RATIONALE_PRESENT | ✓ PASS | 1,327 characters |
| NO_DUPLICATE_CORPUS_ID | ✓ PASS | DRA-DOC-0010 is available |
| NO_NEAR_DUPLICATE | ✓ PASS | no near-duplicates detected |
| CORPUS_ELIGIBILITY | ✓ PASS | eligible |

**Blocking reasons:** OFFICIAL_SOURCE_NOT_VERIFIED, LICENCE_NOT_VERIFIED  
**Path to eligibility:** Human reviewer must attest both governance checks (Sections G and H above) and upgrade both to VERIFIED. All other checks are expected to pass without further changes.

---

## Section N — Proposed Freeze Record Skeleton

**Freeze ID to be assigned:** DRA-FRZ-000004 *(DRA-FRZ-000003 is reserved for DRA-DOC-0009)*  
**Status:** NOT YET CREATED — freeze is blocked pending governance attestation

When the human reviewer has verified Sections G and H, the freeze record will contain:

```json
{
  "freezeId": "DRA-FRZ-000004",
  "corpusId": "DRA-DOC-0010",
  "acquisitionId": "DRA-ACQ-000012",
  "frozenAt": "<reviewer-assigned timestamp>",
  "sourceDigest": "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1",
  "textDigest": "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430",
  "byteLength": 1946127,
  "mediaType": "application/pdf",
  "normalisationVersion": "DRA-NORM-v1",
  "metadata": {
    "title": "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
    "publisher": "National Institute of Standards and Technology (NIST)",
    "publicationDate": "2023-01-26",
    "domain": "TECHNICAL",
    "documentType": "POLICY",
    "difficulty": "HIGH",
    "language": "en"
  },
  "officialSourceStatus": "VERIFIED",
  "licenceStatus": "VERIFIED",
  "licenceBasis": "OPEN_LICENCE",
  "licenceDetail": "PUBLIC_DOMAIN — U.S. government work, 17 U.S.C. § 105",
  "inclusionRationale": "<see Section K>",
  "evaluationBoundary": "<see test file PROPOSED_EVALUATION_BOUNDARY>"
}
```

Note: `normalisedText` and `wordCount` are omitted from the freeze record per DRA-OPS-001 convention.

---

## Section O — Outstanding Governance Decisions

The following decisions are outstanding and must be resolved by a human reviewer before DRA-DOC-0010 can be frozen:

| # | Decision required | Section | Priority |
|---|-------------------|---------|----------|
| 1 | Confirm fetched PDF is AI RMF 1.0 (January 2023) — not a revised version | G | BLOCKING |
| 2 | Confirm June 2025 Last-Modified reflects a server re-rendering only | G | BLOCKING |
| 3 | Upgrade official source status to VERIFIED | G | BLOCKING |
| 4 | Confirm no copyrighted third-party text in evaluation scope | H | BLOCKING |
| 5 | Upgrade licence status to VERIFIED (PUBLIC_DOMAIN, 17 U.S.C. § 105) | H | BLOCKING |
| 6 | Confirm DRA-DOC-0010 is the correct next corpus ID (given DRA-DOC-0009 pending) | J | Advisory |
| 7 | Confirm POLICY is the correct document type (not PROCEDURE or OTHER) | J | Advisory |
| 8 | Assign freeze timestamp for DRA-FRZ-000004 | N | Post-attestation |
| 9 | Add DRA-DOC-0010 entry to BENCHMARK_CORPUS after freeze | — | Post-freeze |
| 10 | Run near-duplicate check against DRA-DOC-0009 if frozen before DRA-DOC-0010 | L | Pre-freeze |

---

## Section P — Recommended Next Action

1. **Human reviewer:** Inspect Section G and confirm the fetched PDF is the authoritative NIST AI RMF 1.0 (January 2023). Verify the June 2025 Last-Modified reflects only a re-rendering. Upgrade official source to VERIFIED.

2. **Human reviewer:** Inspect Section H and confirm public domain status (17 U.S.C. § 105) applies in full to the evaluation text scope. Upgrade licence to VERIFIED.

3. **After both attestations:** Create the freeze record (DRA-FRZ-000004) for DRA-DOC-0010 using the skeleton in Section N.

4. **Register DRA-DOC-0010** in the corpus registry and add entry to `BENCHMARK_CORPUS` in `corpus-data.ts`.

5. **If DRA-DOC-0009 (CMA) is frozen first:** run the near-duplicate check between DRA-DOC-0009 text and DRA-DOC-0010 text before finalising the DRA-DOC-0010 freeze.

6. **Run the full test suite** after freeze and corpus registration to confirm no regressions.

---

## Appendix — Acquisition Test File Reference

Test file: `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-005-nist-ai-rmf-prep.test.ts`  
Test suite: `DRA-ACQ-005 — Controlled Acquisition Preparation for DRA-DOC-0010 (NIST AI RMF 1.0)`  
Result: 1 test, 1 passed  
Duration: ~4.2 seconds (live HTTP, including second-pass reproducibility check)  
Run date: 2026-08-06

---

*DRA-ACQ-005 — Acquisition Preparation Report — Generated 2026-08-04 — Status: REVIEW_REQUIRED*
