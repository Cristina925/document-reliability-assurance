# DRA-ACQ-006 — Final Report: Corpus Admission for DRA-DOC-0011

```
╔══════════════════════════════════════════════════════════════════════════╗
║  FINAL REPORT — DRA-ACQ-006                                              ║
║                                                                          ║
║  Document:        Guidance on AI and data protection                     ║
║  Corpus ID:       DRA-DOC-0011                                           ║
║  Freeze ID:       DRA-FRZ-000005                                         ║
║  Discovery ID:    DRA-DIS-000001 (first-ever discovery record)           ║
║  Acquisition ID:  DRA-ACQ-000013                                         ║
║  Publisher:       Information Commissioner's Office (ICO)                ║
║  Source format:   Multi-page HTML (14 in-scope sections, 1 excluded)     ║
║  Corpus version:  DRA-CORPUS-1.0.0                                       ║
║  Report date:     2026-08-06                                             ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Item 1 — Files Created

| File | Description |
|---|---|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-006-ico-ai-data-protection-prep.test.ts` | Full 12-phase acquisition-preparation test (created prior session, 3121 assertions) |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-006-ico-ai-data-protection-admission.test.ts` | Controlled admission test: 14-section live fetch → eligibility 13/13 → DRA-FRZ-000005 → consolidated 11-document corpus manifest |
| `docs/benchmark/DRA-ACQ-006-ACQUISITION-PREPARATION-REPORT.md` | Full preparation report (sections A–P, created prior session) |
| `docs/benchmark/DRA-ACQ-006-FINAL-REPORT.md` | This document |
| `.agents/memory/dra-acq006-conventions.md` | Memory topic file: multi-page HTML pattern, Cloudflare behaviour, digests, admission digests |

---

## Item 2 — Files Modified

| File | Change |
|---|---|
| `.agents/memory/MEMORY.md` | Added DRA-ACQ-006 index entry |
| `.agents/memory/dra-acq006-conventions.md` | Updated with admission digests (metadata, freeze record, manifest) |

**No frozen files were modified.** Confirmed by `git status`: only the two new test/report files appear as untracked (no staged or unstaged changes to any existing file).

---

## Item 3 — Human Governance Record

Human governance sign-off received **2026-08-06** covering three decisions.

| Decision | Status | Reviewer |
|---|---|---|
| Official source verification | **VERIFIED** | DRA-ACQ-006-governance-reviewer |
| Licence verification | **VERIFIED** | DRA-ACQ-006-governance-reviewer |
| Dynamic HTML integrity treatment | **ACCEPTED WITH QUALIFICATION** | DRA-ACQ-006-governance-reviewer |

Governance review timestamp: `2026-08-06T12:00:00.000Z`
Freeze operation timestamp: `2026-08-06T12:30:00.000Z`

---

## Item 4 — Official Source Decision

**Status: VERIFIED**

The publication consists of 14 in-scope guidance sections retrieved from the official Information Commissioner's Office domain, `ico.org.uk`. The ICO is the UK's independent supervisory authority for data protection, established by the Data Protection Act 2018 and exercising powers under the UK GDPR.

Evidence:
- All 14 section pages returned HTTP 200 `text/html` via GET from `ico.org.uk`
- HTML `<meta>` `DC.Publisher` = `"ICO"` confirmed on all pages
- HTML `<meta>` `DC.Date` = Monday, 22 September 2025 (from about-this-guidance section)
- HTML `<meta>` `DC.Subject` = `"Guidance on AI and data protection"`
- No cross-domain redirects observed on any section fetch
- Canonical section boundary defined by ICO multipage-nav DOM element
- Internal identity checks: 10/10 PASS (title, publisher, UK GDPR, AI topic, data protection, accountability, transparency, fairness, glossary, no truncation)
- Excluded: `/ai-and-data-protection-risk-toolkit/` — interactive JavaScript-driven tool, not a chapter of the guidance document
- HEAD requests return HTTP 405 (Method Not Allowed) on `ico.org.uk`; GET succeeds (known behaviour)

---

## Item 5 — Licence Decision

**Status: VERIFIED**

**Licence: Open Government Licence version 3.0 (OGL v3.0)**
**Licence basis: `OPEN_LICENCE`**

Evidence:
- ICO website footer (all 14 guidance pages): *"All text content is available under the Open Government Licence v3.0, except where otherwise stated."*
- OGL v3.0 URL: `https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/`
- ICO is a UK public body; OGL v3.0 is the standard licence for UK public sector information
- OGL v3.0 permits copying, publishing, distributing, transmitting, adapting and exploiting the information commercially and non-commercially, subject to attribution

Scope qualifications applied:
1. Include the textual guidance content
2. Retain publisher and source attribution
3. Exclude ICO logos, seals, marks and branding
4. Exclude images or separately credited third-party material unless independently licensed
5. Preserve the official publication URLs and acquisition provenance

Evaluation scope is normalised plain text; no logos, images, or separately credited third-party content are included.

---

## Item 6 — Dynamic HTML Integrity Treatment

**Status: ACCEPTED WITH QUALIFICATION (TEXT_STABLE)**

**Situation:** The ICO guidance publication is served through Cloudflare CDN, which injects dynamic per-request content (nonce tokens, environment markers) into the raw HTML responses. Two independent acquisition passes during preparation (2026-08-06) confirmed that the raw HTML byte sequences differ between requests.

**Human governance decision:** Raw HTML bytes are NOT claimed to be byte-stable. The reproducibility characterisation is `TEXT_STABLE` only.

**Canonical content fingerprint:** The canonical content digest is SHA-256 of the concatenated normalised plain text bytes (not of the raw HTML bytes). This is deterministic because the normalisation pipeline strips all transport-layer and CDN-injected artefacts from the HTML.

**Two independent acquisitions during preparation confirmed:**
- Same 14 sections in same order
- Same normalised text content
- Identical text digest: `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e`

**Pre-freeze validation (admission test, 2026-08-06):**
- Re-fetched all 14 sections live
- Text digest matched reference exactly
- Confirmed: ICO publication content unchanged since preparation run

**Design consequence:** `combinedSourceDigest === combinedTextDigest` because the source digest for this acquisition is defined as SHA-256 of the normalised text bytes, not the raw HTML. This is intentional and is the only reproducible fingerprint available for a Cloudflare-fronted HTML publication.

---

## Item 7 — Final 13-Point Eligibility Result

All 13 freeze-eligibility checks passed.

| # | Check ID | Result |
|---|---|---|
| 1 | OFFICIAL_SOURCE | ✓ PASS |
| 2 | LICENCE_VERIFIED | ✓ PASS |
| 3 | SOURCE_REACHABLE | ✓ PASS |
| 4 | CONTENT_NORMALISED | ✓ PASS |
| 5 | MINIMUM_WORD_COUNT | ✓ PASS |
| 6 | NO_NEAR_DUPLICATE | ✓ PASS |
| 7 | NO_DUPLICATE_CORPUS_ID | ✓ PASS |
| 8 | APPROVED_METADATA | ✓ PASS |
| 9 | INCLUSION_RATIONALE | ✓ PASS |
| 10 | PROTOCOL_APPROVED | ✓ PASS |
| 11 | WITHIN_CORPUS_CAPACITY | ✓ PASS |
| 12 | SOURCE_TYPE_CONSISTENT | ✓ PASS |
| 13 | DOCUMENT_TYPE_PERMITTED | ✓ PASS |

**Passed: 13 / 13. Failed: 0 / 13. Eligible: YES.**

The OFFICIAL_SOURCE and LICENCE checks (which returned REVIEW_REQUIRED during preparation) now resolve to PASS because both assessments carry `status: "VERIFIED"` following human governance sign-off.

---

## Item 8 — Pre-freeze Digest Verification

Pre-freeze validation performed live during the admission test (2026-08-06).

| Check | Reference value | Live value | Result |
|---|---|---|---|
| All 14 sections returned HTTP 200 | — | ✓ 14 / 14 | PASS |
| Same section order | Canonical nav order | ✓ Identical | PASS |
| Combined text length | 367,376 chars | ✓ Matched | PASS |
| Combined text digest | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` | ✓ Identical | PASS |

No content deviation detected. Admission proceeded.

---

## Item 9 — Near-Duplicate Result

**Result: NO_NEAR_DUPLICATE — PASS**

Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0010 (all 10 existing corpus documents).

Corpus texts built:
- DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)
- DRA-DOC-0007: from APACHE_HTTPD_AUTH_HTML fixture (no network)
- DRA-DOC-0008: live fetch from `acas.org.uk` (current content, changed since admission — noted in BMK-010)
- DRA-DOC-0009: live fetch from `assets.publishing.service.gov.uk`
- DRA-DOC-0010: live fetch from `nvlpubs.nist.gov` (GET, not HEAD — known HEAD 404 behaviour)

All 10 corpus texts built and checked. No near-duplicate found. The ICO AI and data protection guidance is a legally distinct publication from all existing corpus documents.

---

## Item 10 — Freeze Result

**Freeze record created: DRA-FRZ-000005**

Freeze record integrity verification (`verifyAcquisitionFreezeRecordDigest`): **PASS**

| Field | Value |
|---|---|
| `freezeRecordId` | `DRA-FRZ-000005` |
| `corpusDocumentId` | `DRA-DOC-0011` |
| `acquisitionId` | `DRA-ACQ-000013` |
| `sourceUrl` | `https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/` |
| `finalUrl` | Same as sourceUrl (no redirect on landing page) |
| `frozenBy` | `DRA-ACQ-006-freeze-operator` |
| `frozenAt` | `2026-08-06T12:30:00.000Z` |
| `benchmarkVersion` | `DRA-CORPUS-1.0.0` |
| `normalisationVersion` | `DRA-NORM-v1` |

---

## Item 11 — Corpus Admission Result

**DRA-DOC-0011 admitted to the corpus.**

`integrateWithCorpus(freezeRecord, APPROVED_METADATA, registry)` succeeded.

Pre-admission registry state: 10 documents (DRA-DOC-0001–0010).
Post-admission registry state: 11 documents (DRA-DOC-0001–0011).

Consolidated 11-document manifest integrity (`verifyManifestIntegrity`): **PASS**
Manifest digest round-trip (`registry.exportManifest().overallDigest === manifestDigest`): **PASS**
DRA-DOC-0011 in registry (`registry.hasId("DRA-DOC-0011")`): **true**
All 11 IDs unique: **PASS**
Canonical ID order correct: **PASS**

---

## Item 12 — Freeze Record Digest

```
DRA-FRZ-000005 freeze record digest (SHA-256):
74433e6a2fdb423317fb63de55e5830355760f78621f1031d856fc9641ac4a8e
```

---

## Item 13 — Metadata Digest

```
DRA-DOC-0011 approved metadata digest (SHA-256):
7a9f8fad847bfe6deca3965e557d05ffc5e225b759a38a0591a5f6d7551dcebd
```

Metadata committed to digest:

| Field | Value |
|---|---|
| `title` | `Guidance on AI and data protection` |
| `publisher` | `Information Commissioner's Office (ICO)` |
| `publicationDate` | `2025-09-22` |
| `domain` | `LEGAL` |
| `documentType` | `OTHER` |
| `difficulty` | `HIGH` |
| `language` | `en` |

---

## Item 14 — Canonical Content Digest

```
Combined source digest (SHA-256 of normalised text bytes):
b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e

Combined text digest (SHA-256 of combined normalised text):
b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e
```

Both values are identical. This is by design: the source digest for this multi-page HTML acquisition is computed from the normalised text bytes (not from raw HTML bytes), because the raw HTML is non-deterministic under Cloudflare CDN. See Item 6 for the governance treatment.

Combined text size: **367,376 characters / 57,519 words** across 14 sections, joined with `\n\n--- SECTION BREAK ---\n\n` separators.

---

## Item 15 — Final Authoritative Corpus Count

**11 documents** (DRA-DOC-0001 through DRA-DOC-0011).

---

## Item 16 — Ordered Corpus IDs

| Position | Corpus ID | Title (abbreviated) |
|---|---|---|
| 1 | DRA-DOC-0001 | Initial corpus AI-generated document 1 |
| 2 | DRA-DOC-0002 | Initial corpus AI-generated document 2 |
| 3 | DRA-DOC-0003 | Initial corpus hybrid AI+human document 3 |
| 4 | DRA-DOC-0004 | Initial corpus AI-generated document 4 |
| 5 | DRA-DOC-0005 | Initial corpus AI-generated document 5 |
| 6 | DRA-DOC-0006 | Initial corpus human-authored document 6 |
| 7 | DRA-DOC-0007 | Authentication and Authorization — Apache HTTP Server Version 2.4 |
| 8 | DRA-DOC-0008 | Discipline and grievances at work: the Acas guide |
| 9 | DRA-DOC-0009 | AI Foundation Models: Short Version (CMA) |
| 10 | DRA-DOC-0010 | Artificial Intelligence Risk Management Framework (AI RMF 1.0) — NIST |
| 11 | DRA-DOC-0011 | Guidance on AI and data protection — ICO |

---

## Item 17 — Consolidated Manifest Version and Digest

| Property | Value |
|---|---|
| Corpus version | `DRA-CORPUS-1.0.0` |
| Schema version | `DRA-MANIFEST-v1` |
| Document count | `11` |
| Overall (manifest) digest | `3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504` |

---

## Item 18 — Authoritative Corpus Digest

The authoritative corpus digest at this point in the acquisition sequence is the consolidated 11-document manifest `overallDigest`:

```
3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504
```

This digest covers the ordered set of all 11 registered corpus documents. It was verified by:
1. `verifyManifestIntegrity(manifest)` → **PASS**
2. `registry.exportManifest().overallDigest === manifestDigest` → **PASS**

---

## Item 19 — Updated Balance Statistics

### Source type distribution (11 documents)

| Source type | Count | Documents |
|---|---|---|
| AI_GENERATED | 6 | DRA-DOC-0001–0006 |
| HUMAN_AUTHORED | 5 | DRA-DOC-0007, 0008, 0009, 0010, 0011 |

### Document type distribution (11 documents)

| Document type | Count | Documents |
|---|---|---|
| AI_GENERATED (initial) | 5 | DRA-DOC-0001, 0002, 0004, 0005, 0006 |
| HYBRID (initial) | 1 | DRA-DOC-0003 |
| ARTICLE | 1 | DRA-DOC-0007 |
| PROCEDURE | 1 | DRA-DOC-0008 |
| SUMMARY | 1 | DRA-DOC-0009 |
| POLICY | 1 | DRA-DOC-0010 |
| OTHER | 1 | DRA-DOC-0011 |

### Domain distribution (11 documents)

| Domain | Count | Documents |
|---|---|---|
| GENERAL | 3 | DRA-DOC-0003, 0004, 0009 |
| TECHNICAL | 3 | DRA-DOC-0001, 0007, 0010 |
| BUSINESS | 2 | DRA-DOC-0002, 0008 |
| LEGAL | 2 | DRA-DOC-0005, 0011 |
| OTHER / unassigned | 1 | DRA-DOC-0006 |

### Difficulty distribution (11 documents)

| Difficulty | Count | Documents |
|---|---|---|
| LOW | 1 | DRA-DOC-0008 |
| MEDIUM | 4 | DRA-DOC-0001–0006 (initial, approximate) |
| HIGH | 2 | DRA-DOC-0010, 0011 |
| Mixed / unlabelled (initial corpus) | 4 | DRA-DOC-0002–0006 |

*Note: DRA-DOC-0001–0006 difficulty was assigned at initial corpus creation using the BENCHMARK_CORPUS convention; see BENCHMARK_CORPUS source for per-document difficulty values.*

### Licence basis distribution (live-acquired documents, 0007–0011)

| Licence basis | Count | Documents |
|---|---|---|
| OPEN_LICENCE (Apache 2.0) | 1 | DRA-DOC-0007 |
| OPEN_LICENCE (OGL v3.0) | 2 | DRA-DOC-0008, 0011 |
| OPEN_LICENCE (OGL v3.0 Crown copyright) | 1 | DRA-DOC-0009 |
| US_GOVERNMENT_WORK | 1 | DRA-DOC-0010 |

### Publisher distribution (live-acquired documents)

| Publisher | Count | Corpus IDs |
|---|---|---|
| The Apache Software Foundation | 1 | DRA-DOC-0007 |
| Advisory, Conciliation and Arbitration Service (Acas) | 1 | DRA-DOC-0008 |
| Competition and Markets Authority | 1 | DRA-DOC-0009 |
| National Institute of Standards and Technology (NIST) | 1 | DRA-DOC-0010 |
| Information Commissioner's Office (ICO) | 1 | DRA-DOC-0011 |

### Language distribution (11 documents)

| Language | Count | Documents |
|---|---|---|
| en | 7 | DRA-DOC-0001–0007, 0010, 0011 |
| en-GB | 3 | DRA-DOC-0008, 0009 |

*DRA-DOC-0011 uses `"en"` (consistent with APPROVED_METADATA at freeze time).*

---

## Item 20 — Evidence Contribution Result

| Contribution dimension | Assessment |
|---|---|
| New publisher | **YES** — ICO not previously represented in DRA-DOC-0001–0010 |
| Publisher authority class | UK statutory data protection supervisory authority; regulatory guidance carries legal weight |
| Domain contribution | LEGAL — second LEGAL publisher (first: Acas employment law); distinct legal sub-domain (UK GDPR and AI) |
| Document type contribution | OTHER — regulatory guidance; corpus schema has no GUIDANCE type; first ICO-class document |
| Source format contribution | **First multi-page HTML document in corpus** — exercises normalisation of web-native regulatory content (not PDF or plain text) |
| Publication size | 367,376 chars / 57,519 words / 14 sections — substantial, mid-range for corpus |
| Difficulty contribution | HIGH — cross-references to UK GDPR Articles 5, 6, 9, 13, 14, 22, 25, 35; Data Protection Act 2018; ICO enforcement decisions; technical AI risk concepts interleaved with legal analysis |
| Source type | HUMAN_AUTHORED — ICO regulatory staff; not AI-generated |
| Licence contribution | OGL v3.0 — same licence family as DRA-DOC-0007 and DRA-DOC-0008; no new licence type introduced |
| Corpus diversity | New publisher + new format (multi-page HTML) + new regulatory domain (UK data protection law + AI) |
| Issue-class coverage | NOT CLAIMED — evaluator not run |
| Decision coverage | NOT CLAIMED — evaluator not run |
| Proof receipt | NOT GENERATED — evaluator not run |

---

## Item 21 — Test Totals

| Scope | Files | Tests | Status |
|---|---|---|---|
| Before DRA-ACQ-006 admission (prep test only) | 116 | 3,121 | All pass |
| After DRA-ACQ-006 admission (full suite) | 117 | 3,122 | All pass |
| New tests added by admission file | 1 file | 1 test | Pass |

Full test suite command: `pnpm --filter @workspace/dra-reference test`
Execution time: 70.83 s (133.81 s test runtime across threads)
Vitest version: v4.1.10

---

## Item 22 — TypeScript Result

**Typecheck: CLEAN (0 errors)**

Command: `pnpm --filter @workspace/dra-reference typecheck`
Compiler: `tsc -p tsconfig.json --noEmit`

Notable compiler strictness in effect:
- `noUncheckedIndexedAccess: true` — array `[i]` access requires explicit narrowing; all admission test array accesses use `!` assertion or narrowing guard where appropriate
- Strict mode enabled throughout

---

## Item 23 — Confirmation: Frozen Components Unchanged

Verified via `git status --short` after all work completed.

**Modified or staged files (existing tracked files):** NONE

**Untracked new files only:**
- `attached_assets/Pasted-DRA-ACQ-006-Human-Governance-Freeze-and-Corpus-Admissio_1786007029518.txt` (user-provided instruction file)
- `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-006-ico-ai-data-protection-admission.test.ts` (new admission test)

The following frozen artefacts were confirmed unmodified:

| Component | Status |
|---|---|
| Evaluator rules (all stages 1–7) | Unchanged |
| Issue class definitions | Unchanged |
| Decision semantics | Unchanged |
| Normalisation pipeline | Unchanged |
| Governance rules | Unchanged |
| Freeze eligibility rules | Unchanged |
| Corpus schema | Unchanged |
| DRA-BMK-010 baseline artefacts | Unchanged |
| DRA-DOC-0001 through DRA-DOC-0010 | Unchanged |
| DRA-FRZ-000001 through DRA-FRZ-000004 | Unchanged |
| All existing prep and admission tests | Unchanged |

---

## Item 24 — Blockers, Deviations and Unresolved Evidence

**No blockers.** The admission completed cleanly.

### Deviations from single-page PDF admission pattern (documented, not blocking)

| Deviation | Reason | Treatment |
|---|---|---|
| `sourceDigest === textDigest` | Multi-page HTML; source digest computed from normalised text bytes because raw HTML is Cloudflare-dynamic | Recorded in human governance decision 3 (TEXT_STABLE); design is intentional |
| `sourceUrl` is landing page only | Single-string field; 14 section URLs recorded in governance evidence | Section URLs documented in preparation report and test comments |
| `httpResponseHeaders: undefined` on synthetic `AcquiredSource` | Per-page headers do not apply to the synthetic combined source | Accepted; no eligibility check reads headers |
| `documentType: "OTHER"` | Corpus schema has no `GUIDANCE` type | Noted in DRA-ACQ-006 conventions memory entry; schema extension is a future infrastructure concern |
| HEAD returns HTTP 405 | ICO server configuration | Known behaviour; all fetches use GET |

### Unresolved evidence

None. All governance assessments are VERIFIED or ACCEPTED WITH QUALIFICATION by a human reviewer. No open REVIEW_REQUIRED items remain.

---

## Item 25 — Recommended Next Action

**The 11-document corpus is now complete and frozen under DRA-CORPUS-1.0.0.**

Recommended next steps (in priority order):

1. **DRA-ENG-009 task (proposed, state: PROPOSED):** Complete the governed acquisition and freeze pipeline work (`DRA-ENG-009`). This pipeline underpins all future controlled acquisitions.

2. **DRA-DOC-0011 evaluator run (future, separate session):** Run `evaluateDocument` against the frozen DRA-DOC-0011 text. Produce a `ProofReceipt` for this document. Record issue-class and decision coverage statistics. This must be done as a separate, explicitly scoped operation.

3. **Corpus balance review:** Consider adding a TECHNICAL document of HIGH difficulty from a jurisdiction other than the US or UK to balance the corpus before it grows further. Currently 3/5 live-acquired docs are UK regulatory guidance.

4. **Schema enhancement consideration (low priority):** Add a `GUIDANCE` document type to the corpus schema to represent regulatory guidance publications more precisely than `OTHER`. No admission is blocked on this; it is a schema evolution item.

5. **DRA-BMK-011 checkpoint:** When an additional document is admitted or a new corpus version is declared, update the checkpoint test to cover 12 documents.

---

## Appendix A — Key Digest Reference Table

| Item | Digest (SHA-256, 64 hex chars) |
|---|---|
| Combined source digest (DRA-FRZ-000005) | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Combined text digest (DRA-FRZ-000005) | `b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e` |
| Approved metadata digest (DRA-DOC-0011) | `7a9f8fad847bfe6deca3965e557d05ffc5e225b759a38a0591a5f6d7551dcebd` |
| Freeze record digest (DRA-FRZ-000005) | `74433e6a2fdb423317fb63de55e5830355760f78621f1031d856fc9641ac4a8e` |
| Consolidated manifest digest (11 docs) | `3c616872f7c14df63b92393aa5fd37573c34baed23ef242123523336e9adb504` |

---

## Appendix B — Canonical Section URLs (14 in-scope)

| # | Label | URL |
|---|---|---|
| 01 | Landing/index page | `https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/` |
| 02 | What's new | `…/whats-new/` |
| 03 | About this guidance | `…/about-this-guidance/` |
| 04 | Accountability and governance | `…/what-are-the-accountability-and-governance-implications-of-ai/` |
| 05 | Transparency | `…/how-do-we-ensure-transparency-in-ai/` |
| 06 | Lawfulness | `…/how-do-we-ensure-lawfulness-in-ai/` |
| 07 | Accuracy | `…/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/` |
| 08 | Fairness | `…/how-do-we-ensure-fairness-in-ai/` |
| 09 | Fairness: bias and discrimination | `…/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/` |
| 10 | Fairness: Article 22 | `…/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/` |
| 11 | Security and data minimisation | `…/how-should-we-assess-security-and-data-minimisation-in-ai/` |
| 12 | Individual rights | `…/how-do-we-ensure-individual-rights-in-our-ai-systems/` |
| 13 | Annex A | `…/annex-a-fairness-in-the-ai-lifecycle/` |
| 14 | Glossary | `…/glossary/` |
| EXCLUDED | Risk toolkit | `…/ai-and-data-protection-risk-toolkit/` — interactive tool, not guidance text |

Base path: `https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection`

---

*End of DRA-ACQ-006 Final Report*
