# DRA-ACQ-006 — Acquisition Preparation Report

**Document status:** PREPARATION COMPLETE — REVIEW_REQUIRED  
**Report date:** 2026-08-06  
**Proposed corpus ID:** DRA-DOC-0011  
**Proposed freeze ID:** DRA-FRZ-000005  
**Discovery ID:** DRA-DIS-000001  
**Acquisition ID:** DRA-ACQ-000013  

---

## Section A — Candidate Identification

**A.1 Discovery record**

| Field | Value |
|---|---|
| Discovery ID | DRA-DIS-000001 (first discovery record in repository) |
| Discovered by | DRA-ACQ-006 acquisition operator |
| Discovery date | 2026-08-06 |
| Discovery method | Web search for authoritative UK AI regulation and data protection guidance documents from public sector bodies |
| Rationale for candidacy | First document from a UK data protection supervisory authority; first AI-specific regulatory guidance in corpus; new publisher; OGL-licensed HTML publication |

**A.2 Publication details**

| Field | Value |
|---|---|
| Title | Guidance on AI and data protection |
| Publisher | Information Commissioner's Office (ICO) |
| Publisher role | UK statutory supervisory authority for data protection (Data Protection Act 2018, UK GDPR) |
| Publication date (last updated) | 22 September 2025 |
| Source format | Multi-page HTML (no consolidated PDF available) |
| Publication URL | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/ |
| Language | English (en-GB) |
| Character count (normalised) | 367,376 chars |
| Word count (normalised) | 57,519 words |

**A.3 Proposed metadata**

| Field | Value |
|---|---|
| Corpus ID | DRA-DOC-0011 |
| Domain | LEGAL |
| Document type | OTHER (regulatory guidance — schema does not include GUIDANCE type) |
| Difficulty | HIGH |
| Source type | HUMAN_AUTHORED |
| Language | en |

---

## Section B — Source Boundary and Section Inventory

**B.1 Source format determination**

The ICO guidance on AI and data protection is a web-native multi-page HTML publication. No consolidated PDF download exists. The publication provides a "Print this page" browser button (standard browser print dialogue) but no downloadable artefact.

**B.2 Canonical section order**

Section order is determined from the `multipage-nav` DOM element on the landing page, read 2026-08-06. DOM position (not CMS data-id values) is authoritative for ordering.

| # | Slug | Label | Text length (chars) | Word count |
|---|---|---|---|---|
| 01 | `/` | Landing/index page | 7,435 | 1,142 |
| 02 | `/whats-new/` | What's new | 7,465 | 1,144 |
| 03 | `/about-this-guidance/` | About this guidance | 17,494 | 2,743 |
| 04 | `/what-are-the-accountability-and-governance-implications-of-ai/` | Accountability and governance implications | 42,072 | 6,630 |
| 05 | `/how-do-we-ensure-transparency-in-ai/` | How do we ensure transparency in AI | 4,023 | 644 |
| 06 | `/how-do-we-ensure-lawfulness-in-ai/` | How do we ensure lawfulness in AI | 21,786 | 3,539 |
| 07 | `/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/` | Accuracy and statistical accuracy | 18,166 | 2,901 |
| 08 | `/how-do-we-ensure-fairness-in-ai/` | How do we ensure fairness in AI | 24,273 | 3,800 |
| 09 | `/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/` | Fairness: bias and discrimination | (logged in test) | — |
| 10 | `/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/` | Fairness: Article 22 impact | (logged in test) | — |
| 11 | `/how-should-we-assess-security-and-data-minimisation-in-ai/` | Security and data minimisation | (logged in test) | — |
| 12 | `/how-do-we-ensure-individual-rights-in-our-ai-systems/` | Individual rights | (logged in test) | — |
| 13 | `/annex-a-fairness-in-the-ai-lifecycle/` | Annex A: Fairness in the AI lifecycle | (logged in test) | — |
| 14 | `/glossary/` | Glossary | (logged in test) | — |

**Total in scope:** 14 pages. **Combined:** 367,376 chars / 57,519 words.

**B.3 Excluded section**

| Slug | Reason for exclusion |
|---|---|
| `/ai-and-data-protection-risk-toolkit/` | Interactive tool with a JavaScript-driven interface. Not a chapter of the guidance document; no guidance text content. Excluded from evaluation scope by design. |

**B.4 HEAD request behaviour**

ICO server returns HTTP 405 (Method Not Allowed) to HEAD requests. All sections fetched via GET (HTTP 200 text/html). This is a known server configuration for Cloudflare-fronted ICO pages.

**B.5 Raw byte non-determinism (Cloudflare dynamic HTML)**

ICO pages are served through Cloudflare CDN which injects dynamic content (CSRF tokens, nonce values, session identifiers) into each HTML response. Raw HTML bytes are therefore non-deterministic between requests. The normalised text (after HTML stripping) is stable, confirmed by second-pass reproducibility check (text digests matched for all 14 sections; see Section G).

Implication: the combined source digest is computed from the concatenated normalised text bytes (not raw HTML bytes), making it deterministic and meaningful as a content fingerprint.

**B.6 HTTP metadata**

| Property | Value |
|---|---|
| HTTP method | GET |
| HTTP status (all sections) | 200 |
| Media type (all sections) | text/html |
| Total raw HTML bytes | 1,072,008 bytes (informational; non-deterministic) |

---

## Section C — Provenance and Authority

**C.1 Publisher identification**

The Information Commissioner's Office (ICO) is the UK's independent regulatory authority for data protection and freedom of information. Established under the Data Protection Act 2018, it exercises supervisory powers under the UK GDPR. The ICO is the primary point of regulatory guidance for organisations processing personal data in the UK.

- Official domain: `ico.org.uk`
- All 14 sections served from `ico.org.uk` with no cross-domain redirects
- HTML meta `DC.Publisher`: "ICO" (confirmed on all section pages)
- HTML meta `DC.Subject`: "Guidance on AI and data protection"
- HTML meta `DC.Date`: "Monday, September 22, 2025" (from about-this-guidance section)
- Breadcrumb: For organisations → UK GDPR guidance and resources → Artificial intelligence → Guidance on AI and data protection

**C.2 Official source assessment**

Status: **REVIEW_REQUIRED**

Machine pre-assessment supports that `ico.org.uk` is the authoritative source for ICO publications. A human reviewer must confirm:
1. That `ico.org.uk` is the authoritative publication host for this specific guidance
2. That the 14 fetched pages represent the complete and current guidance (not a superseded or draft version)
3. That the last-updated date (22 September 2025) identifies the version under evaluation

**C.3 Version identification**

The `DC.Date` meta tag on the `about-this-guidance` section records: `Monday, September 22, 2025`. This is taken as the "last updated" date for the version acquired on 2026-08-06. The "What's new" section (02) documents revision history; this section is included in the evaluation scope.

---

## Section D — Licence Assessment

**D.1 Licence determination**

The ICO website footer states on all guidance pages:

> "All text content is available under the Open Government Licence v3.0, except where otherwise stated."

This statement is present on every one of the 14 in-scope section pages.

**D.2 OGL v3.0 permissions summary**

The Open Government Licence version 3.0 (OGL v3.0) permits:
- Copying, publishing, distributing, transmitting, adapting and exploiting the information commercially and non-commercially
- Combining information with other information and databases
- Attribution required: must acknowledge ICO as the source and include the OGL URL

OGL v3.0 exclusions:
- ICO logos, emblems, and heraldic devices
- Third-party materials (images, photographs, separately credited content)
- Personal data

The DRA evaluation scope is normalised plain text. No logos, images, or separately credited third-party content is included in the text extraction. No personal data is present in the normalised text.

**D.3 Licence assessment**

Status: **REVIEW_REQUIRED**

Machine pre-assessment: OGL v3.0 — OPEN_LICENCE

A human reviewer must confirm:
1. No "except where otherwise stated" carve-out applies to any section within the evaluation scope
2. No third-party copyrighted text appears in the normalised evaluation scope
3. OGL v3.0 attribution will be included in all DRA benchmark publications citing this document

**D.4 Attribution requirement**

Under OGL v3.0, all publications citing this document must include: "Contains public sector information licensed under the Open Government Licence v3.0. Source: Information Commissioner's Office."

---

## Section E — Acquisition Procedure

**E.1 Fetcher configuration**

```typescript
createHttpFetcher({
  timeoutMs:    60_000,    // 60s per section
  maxRedirects: 5,
  maxBytes:     15_000_000, // 15MB (ICO pages are ~48–200KB each)
  userAgent:    "DRA-ENG-010/1.0",
})
```

**E.2 Request protocol**

Each section page fetched with `createAcquisitionRequest` using:
- `acquisitionId`: "DRA-ACQ-000013" (shared across all section requests)
- `requestedBy`: "DRA-ACQ-006-acquisition-operator"
- `requestedAt`: "2026-08-06T00:00:00.000Z"

**E.3 Section fetch results**

All 14 in-scope sections returned HTTP 200 with `text/html` media type. No redirect loops or HTTP errors encountered.

---

## Section F — Normalisation

**F.1 Normalisation method**

Each section page normalised individually using:
```typescript
normaliseContent(pageBytes, "text/html", pageSourceDigest)
```

This strips HTML tags, decodes HTML entities, and condenses whitespace to produce clean plain text. No external extractor required (HTML normalisation is native to the DRA pipeline).

**F.2 Multi-page text assembly**

Normalised page texts joined with separator:
```
\n\n--- SECTION BREAK ---\n\n
```

This separator is deterministic and produces a clearly delimited combined document.

**F.3 NormalisedDocument construction**

The combined NormalisedDocument is produced by:
```typescript
normaliseContent(combinedTextBytes, "text/plain", combinedSourceDigest)
```

where `combinedTextBytes = TextEncoder.encode(pageTexts.join(SECTION_SEPARATOR))`.

This gives a standard `NormalisedDocument` with normalisation version, text digest, and source digest.

**F.4 Normalisation results**

| Property | Value |
|---|---|
| Normalisation version | DRA-NORM-v1 |
| Combined text length | 367,376 chars |
| Combined word count | 57,519 words |
| Combined source digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Combined text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |

*Note: source digest equals text digest because source digest is computed from the normalised text bytes for this publication. This is by design for Cloudflare-fronted multi-page HTML where raw bytes are non-deterministic.*

---

## Section G — Reproducibility Verification

**G.1 Second pass (independent re-fetch)**

All 14 sections were independently re-fetched in a second pass immediately following the first. Results:

| Property | Result |
|---|---|
| Sections fetched (pass 2) | 14 / 14 |
| Raw HTML source digests | DYNAMIC (expected — Cloudflare nonce injection) |
| Normalised text digests | ✓ ALL IDENTICAL across both passes |
| Reproducibility result | TEXT_STABLE |

**G.2 Raw byte non-determinism**

Raw HTML source digests differed between passes for multiple sections (sections 4, 5, 6, 7, 8, 13, 14 observed to differ in one test run). This is an expected consequence of Cloudflare CDN injecting dynamic per-request content into the HTML. The normalisation pipeline strips all such injections, producing stable text content.

**G.3 Reproducibility conclusion**

The canonical content fingerprint for DRA-DOC-0011 is the **combined text digest** (`b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e`), which is stable and deterministic. The combined source digest is computed from the same text bytes and is therefore also stable. Raw HTML bytes are not suitable as a stable content fingerprint for this publication.

---

## Section H — Internal Identity Verification

All identity checks passed:

| Check | Result |
|---|---|
| `titleInContent` — "Guidance on AI and data protection" found in text | ✓ PASS |
| `icoNamePresent` — "Information Commissioner" or "ICO" found | ✓ PASS |
| `ukGdprPresent` — "UK GDPR" or "UK-GDPR" found | ✓ PASS |
| `aiTopicPresent` — "artificial intelligence" or "machine learning" found | ✓ PASS |
| `dataProtection` — "data protection" found | ✓ PASS |
| `accountabilitySection` — accountability/governance content present | ✓ PASS |
| `transparencySection` — transparency content present | ✓ PASS |
| `fairnessSection` — fairness/discrimination content present | ✓ PASS |
| `glossaryPresent` — glossary section has substantial text (>500 chars) | ✓ PASS |
| `noTruncation` — all sections have substantial text (>100 chars each) | ✓ PASS |

---

## Section I — Near-Duplicate Check

**I.1 Corpus coverage**

Near-duplicate check conducted against all 10 currently admitted corpus documents:

| Doc ID | Source used |
|---|---|
| DRA-DOC-0001–0006 | From BENCHMARK_CORPUS (no network required) |
| DRA-DOC-0007 | From APACHE_HTTPD_AUTH_HTML fixture (no network) |
| DRA-DOC-0008 | Live re-fetch from acas.org.uk (content changed since admission; noted) |
| DRA-DOC-0009 | Live re-fetch from assets.publishing.service.gov.uk (CMA) |
| DRA-DOC-0010 | Live re-fetch from nvlpubs.nist.gov (NIST AI RMF 1.0) |

**I.2 Note on DRA-DOC-0008 content change**

DRA-BMK-010 recorded that the Acas guide content changed since admission (89,713 → 164,726 chars). The current live content was used for the near-duplicate similarity check. This is acceptable because ICO AI and data protection guidance is not similar to Acas employment law guidance in any version.

**I.3 Eligibility check result**

The `NO_NEAR_DUPLICATE` eligibility check passed. The ICO guidance on AI and data protection has no near-duplicate relationship with any of the 10 admitted corpus documents. Content domains are distinct:
- DRA-DOC-0001–0005: Technical AI strategy and ethics reports
- DRA-DOC-0006: Information security policy
- DRA-DOC-0007: Apache HTTP Server authentication reference
- DRA-DOC-0008: Acas employment law guidance
- DRA-DOC-0009: CMA AI foundation models summary
- DRA-DOC-0010: NIST AI Risk Management Framework

---

## Section J — Freeze Eligibility Assessment

**J.1 Summary**

| Overall result | FREEZE_BLOCKED |
|---|---|
| Blocking reasons | OFFICIAL_SOURCE_NOT_VERIFIED, LICENCE_NOT_VERIFIED |
| Total checks | 13 |
| Checks passing | 11 |
| Checks failing | 2 (both governance attestation checks) |

**J.2 Check-by-check results**

| # | Check ID | Result | Notes |
|---|---|---|---|
| 1 | SOURCE_DIGEST_PRESENT | ✓ PASS | Combined source digest present and hex-formatted |
| 2 | NORMALISED_TEXT_NON_EMPTY | ✓ PASS | 367,376 chars |
| 3 | TEXT_DIGEST_PRESENT | ✓ PASS | Combined text digest present |
| 4 | OFFICIAL_SOURCE_VERIFIED | ✗ FAIL | REVIEW_REQUIRED — machine cannot attest |
| 5 | LICENCE_VERIFIED | ✗ FAIL | REVIEW_REQUIRED — machine cannot attest |
| 6 | METADATA_COMPLETE | ✓ PASS | All required metadata fields populated |
| 7 | DOCUMENT_TYPE_PERMITTED | ✓ PASS | OTHER is a permitted document type |
| 8 | CORPUS_ID_AVAILABLE | ✓ PASS | DRA-DOC-0011 not in registry |
| 9 | INCLUSION_RATIONALE_PRESENT | ✓ PASS | Rationale provided |
| 10 | PROTOCOL_ACTIVE | ✓ PASS | Protocol in APPROVED state |
| 11 | DOCUMENT_TYPE_PERMITTED_BY_PROTOCOL | ✓ PASS | OTHER in permitted types list |
| 12 | NO_NEAR_DUPLICATE | ✓ PASS | No near-duplicate in corpus |
| 13 | WORD_COUNT_SUFFICIENT | ✓ PASS | 57,519 words >> minimum threshold |

**J.3 Freeze eligibility conclusion**

Preparation complete. Freeze blocked by exactly two governance attestation checks — the expected pattern for machine-prepared acquisitions. No content, source, metadata, or technical failures were detected. The document is technically ready for freeze pending human reviewer attestation of official source status and licence.

---

## Section K — Corpus Balance Contribution

**K.1 Publisher diversity**

DRA-DOC-0011 introduces a **new publisher** not previously represented in the corpus: the Information Commissioner's Office (ICO). Prior to DRA-DOC-0011, the corpus contained no publications from a UK data protection supervisory authority.

**K.2 Domain contribution**

Adds to the LEGAL domain (which currently contains DRA-DOC-0008, Acas employment law guidance). ICO guidance covers a distinct legal subdomain: UK GDPR compliance and AI-specific data protection requirements. The two LEGAL documents complement rather than overlap.

**K.3 Source format diversity**

First multi-page HTML document in the corpus. Prior HTML documents (DRA-DOC-0007) are single-page. DRA-DOC-0011 exercises the multi-page acquisition pipeline with 14 sections.

**K.4 Document type contribution**

Uses the OTHER type (regulatory guidance predating the schema's type enumeration). The schema does not include a GUIDANCE type; OTHER is the appropriate assignment.

**K.5 Content complexity**

HIGH difficulty rating. Extensive cross-references to UK GDPR Articles (5, 6, 9, 13, 14, 22, 25, 35), Data Protection Act 2018, ICO enforcement decisions, and ICO accountability framework. Complex authority chain spanning statutory provisions, ICO guidance, case law references, and technical AI standards. This complexity exercises DRA Stage 3 (Authority Resolution) with real regulatory citation patterns.

---

## Section L — Evidence Contribution Plan

**L.1 Hypothesis**

This is an evidence contribution plan — a hypothesis only. The evaluator outcome is not predetermined. DRA-DOC-0011 was selected because its structural properties suggest it will exercise evaluator capabilities in underrepresented ways.

**L.2 Hypothesised issue class opportunities**

| Issue class | Basis for hypothesis |
|---|---|
| AUTHORITY_ABSENT | Regulatory claims citing UK GDPR provisions may lack substantive evidential support within the text itself; the statute reference IS authority but may not constitute direct evidence for specific claims |
| EVIDENCE_INADEQUATE | Practical guidance recommendations (e.g. "you should implement X") may have weak evidentiary support within the text boundaries |
| EVIDENCE_ABSENT | Cross-references to other ICO guidance sections not in evaluation scope may leave cited evidence unreachable |

**L.3 Expected decision contribution**

Hypothesis: REVIEW or HOLD likely; specific issue class distribution unknown. The evaluator runs without foreknowledge of expected outcomes.

**L.4 Benchmark representativeness**

- First multi-page HTML document in corpus
- First UK regulatory authority publication
- First AI-specific data protection guidance
- First document with 14-section multi-part structure
- OGL v3.0 — well-established reuse pathway (same family as DRA-DOC-0007, DRA-DOC-0008)

---

## Section M — Proposed Freeze Record Structure

**M.1 Proposed freeze ID:** DRA-FRZ-000005

**M.2 Freeze record fields (pending human attestation)**

```json
{
  "freezeId": "DRA-FRZ-000005",
  "corpusId": "DRA-DOC-0011",
  "acquisitionId": "DRA-ACQ-000013",
  "title": "Guidance on AI and data protection",
  "publisher": "Information Commissioner's Office (ICO)",
  "publicationDate": "2025-09-22",
  "domain": "LEGAL",
  "documentType": "OTHER",
  "difficulty": "HIGH",
  "language": "en",
  "sourceUrl": "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  "sourceFormat": "text/html",
  "sourcePages": 14,
  "combinedSourceDigest": "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e",
  "combinedTextDigest": "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e",
  "combinedTextLength": 367376,
  "combinedWordCount": 57519,
  "normalisationVersion": "DRA-NORM-v1",
  "licenceName": "Open Government Licence version 3.0",
  "licenceUrl": "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  "officialSourceVerified": false,
  "licenceVerified": false,
  "frozenAt": "[PENDING — set by freeze operator]"
}
```

**M.3 Fields that require human completion before freeze:**

- `officialSourceVerified`: set to `true` after reviewer confirms ico.org.uk is the authoritative source
- `licenceVerified`: set to `true` after reviewer confirms OGL v3.0 applies to the full evaluation scope
- `frozenAt`: set by the freeze operator at freeze time

---

## Section N — Outstanding Actions Before Freeze

| # | Action | Owner | Status |
|---|---|---|---|
| N.1 | Confirm ico.org.uk is the authoritative publication host for this guidance | Human reviewer | PENDING |
| N.2 | Confirm the 14 fetched pages are the complete and current guidance (not superseded) | Human reviewer | PENDING |
| N.3 | Confirm last-updated date 22 September 2025 identifies the version under evaluation | Human reviewer | PENDING |
| N.4 | Confirm OGL v3.0 applies to the full evaluation scope with no applicable carve-outs | Human reviewer | PENDING |
| N.5 | Confirm OGL v3.0 attribution requirement is met for all publications citing DRA-DOC-0011 | Human reviewer | PENDING |
| N.6 | Update `officialSourceVerified` and `licenceVerified` in freeze record to `true` | Human reviewer | PENDING |
| N.7 | Execute freeze (DRA-FRZ-000005) and update corpus manifest | Freeze operator | BLOCKED on N.1–N.6 |
| N.8 | Update corpus manifest digest | Freeze operator | BLOCKED on N.7 |

---

## Section O — Technical Artefacts

**O.1 Test file**

`lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-006-ico-ai-data-protection-prep.test.ts`

- 14 sections fetched in canonical order (all HTTP 200 text/html)
- Per-section HTML normalisation
- Combined source digest from concatenated normalised text bytes
- Two-pass reproducibility (text stable; raw HTML Cloudflare-dynamic — expected)
- Near-duplicate check against all 10 admitted corpus documents
- 13-point freeze eligibility → exactly 2 blocking failures (OFFICIAL_SOURCE_NOT_VERIFIED, LICENCE_NOT_VERIFIED)

**O.2 Reference digests**

| Digest | Value |
|---|---|
| Combined source digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Combined text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |

Both digests are identical because both are SHA-256 of the concatenated normalised text bytes. This is by design: using normalised text as the canonical fingerprint ensures determinism for this Cloudflare-fronted multi-page HTML publication.

**O.3 Total raw HTML (informational)**

1,072,008 bytes across 14 sections. This value is non-deterministic between fetches due to Cloudflare dynamic content injection and is provided for reference only.

---

## Section P — Disposition and Next Steps

**P.1 Preparation status:** COMPLETE  
**P.2 Freeze eligibility:** BLOCKED (2 governance attestation failures — expected)  
**P.3 Technical readiness:** READY  
**P.4 Human actions required:** N.1–N.6 (see Section N)  

**P.5 Notes**

1. The ICO guidance has changed substantially since its original publication (multiple sections updated as of September 2025). The acquisition targets the version as of 2026-08-06. Any future acquisition run may capture updated content; the text digest should be verified against the reference value before any freeze.

2. The multi-page HTML acquisition pattern established by DRA-ACQ-006 (14-section concatenation with section separators) should be documented as a reusable pattern for other web-native regulatory guidance publications.

3. The Cloudflare dynamic HTML behaviour (raw byte non-determinism, GET required, HEAD returns 405) is consistent with DRA-ACQ-003 (NAO, Cloudflare-blocked) and should be noted as a class of source behaviour requiring text-digest-based reproducibility checking.

4. This is the first use of `DRA-DIS-NNNNNN` discovery IDs in the repository. DRA-DIS-000001 is the first. Future acquisitions should increment from DRA-DIS-000002.

---

*Report prepared by DRA-ACQ-006 acquisition pipeline. Preparation date: 2026-08-06.*  
*Human review required before freeze execution.*
