# DRA-ACQ-004 and DRA-ACQ-005 — Batch Corpus Admission Report

**Report ID:** DRA-ACQ-004-005-BATCH-ADMISSION  
**Admission date:** 2026-08-06  
**Governance review session:** Batch human review, 2026-08-06  
**Status:** COMPLETE — DRA-DOC-0009 and DRA-DOC-0010 admitted and frozen

---

## Part 1 — Execution Order

Executed per the batch governance workflow:

| Step | Action | Result |
|------|--------|--------|
| 1 | Validate current registry (DRA-DOC-0001–0008 confirmed) | ✓ PASS |
| 2 | Record CMA human governance decisions (VERIFIED×2) | ✓ Complete |
| 3 | Re-run CMA freeze eligibility | ✓ 13/13 PASS |
| 4 | Freeze and admit CMA as DRA-DOC-0009 | ✓ DRA-FRZ-000003 created |
| 5 | Re-run NIST near-duplicate check including DRA-DOC-0009 | ✓ NO_NEAR_DUPLICATE PASS |
| 6 | Record NIST human governance decisions (VERIFIED×2) | ✓ Complete |
| 7 | Re-run NIST freeze eligibility | ✓ 13/13 PASS |
| 8 | Freeze and admit NIST as DRA-DOC-0010 | ✓ DRA-FRZ-000004 created |
| 9 | Validate final registry and manifest integrity | ✓ PASS |
| 10 | Run full test suite | ✓ 3,076 tests / 112 files passed |
| 11 | Run TypeScript typecheck | ✓ Clean |

---

## Part 2 — Human Governance Records

### DRA-ACQ-004 — CMA AI Foundation Models

**Reviewer:** DRA-ACQ-004-governance-reviewer  
**Review timestamp:** 2026-08-06T10:00:00.000Z

| Decision | Outcome |
|----------|---------|
| Official Source | VERIFIED — Short Version and Initial Report are official CMA publications via GOV.UK / assets.publishing.service.gov.uk |
| Licence | VERIFIED — Crown copyright, Open Government Licence v3.0; exclusions: logos and separately credited third-party material |

### DRA-ACQ-005 — NIST AI RMF 1.0

**Reviewer:** DRA-ACQ-005-governance-reviewer  
**Review timestamp:** 2026-08-06T11:00:00.000Z

| Decision | Outcome |
|----------|---------|
| Document Identity | VERIFIED — AI RMF 1.0, January 2023 (title, NIST AI 100-1, DOI, version markers all consistent) |
| Last-Modified | RECORDED, NOT OVERCLAIMED — June 2025 date does not prove re-render vs. content change; no v1.1 indicators |
| Official Source | VERIFIED — retrieved from official NIST publication infrastructure; corresponds to NIST AI 100-1 catalogue record |
| Licence | VERIFIED WITH SCOPE QUALIFICATION — PUBLIC_DOMAIN_US_GOVERNMENT_WORK (17 U.S.C. § 105); include NIST-authored text; exclude logos, marks, third-party material |

---

## Part 3 — CMA Final Eligibility (DRA-DOC-0009)

**Test file:** `dra-acq-004-cma-ai-fm-admission.test.ts`  
**Result: 13/13 PASS**

| Check ID | Result | Detail |
|----------|--------|--------|
| SOURCE_DIGEST_PRESENT | ✓ PASS | e7fb5008… |
| NORMALISED_TEXT_NON_EMPTY | ✓ PASS | 89,713 characters |
| TEXT_DIGEST_PRESENT | ✓ PASS | dee3ab3c… |
| OFFICIAL_SOURCE_VERIFIED | ✓ PASS | status: VERIFIED |
| LICENCE_VERIFIED | ✓ PASS | status: VERIFIED |
| APPROVED_TITLE_PRESENT | ✓ PASS | AI Foundation Models: Short Version |
| APPROVED_PUBLISHER_PRESENT | ✓ PASS | Competition and Markets Authority |
| APPROVED_LANGUAGE_PRESENT | ✓ PASS | en-GB |
| CORPUS_ID_FORMAT | ✓ PASS | DRA-DOC-0009 |
| INCLUSION_RATIONALE_PRESENT | ✓ PASS | rationale present |
| NO_DUPLICATE_CORPUS_ID | ✓ PASS | DRA-DOC-0009 available |
| NO_NEAR_DUPLICATE | ✓ PASS | no near-duplicates (checked vs. DRA-DOC-0001–0008) |
| CORPUS_ELIGIBILITY | ✓ PASS | eligible |

---

## Part 4 — CMA Freeze and Admission Result (DRA-FRZ-000003)

| Field | Value |
|-------|-------|
| Corpus ID | DRA-DOC-0009 |
| Freeze ID | DRA-FRZ-000003 |
| Title | AI Foundation Models: Short Version |
| Publisher | Competition and Markets Authority |
| Publication date | 2023-09-18 |
| Domain | GENERAL |
| Document type | SUMMARY |
| Difficulty | MEDIUM |
| Language | en-GB |
| Source URL | https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf |
| Final URL | https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf |
| Acquisition ID | DRA-ACQ-000008 |
| Source digest | `e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f` |
| Text digest | `dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed` |
| Metadata digest | `15597eefbfb483697efc7f003e187e4cd8207e455e160a83591adad02968586e` |
| Freeze record digest | `092a1219536aa6eec0905bdce2c0a2d37e5c07e5863f90df290638e17456d848` |
| Frozen at | 2026-08-06T10:30:00.000Z |
| Frozen by | DRA-ACQ-004-freeze-operator |
| Benchmark version | DRA-CORPUS-1.0.0 |
| Manifest digest | `8b5990dedf60106aeede4496024893a7333daa4574446208524f47956fdde066` |

**Evidence source (not frozen):**

| Field | Value |
|-------|-------|
| Title | AI Foundation Models: Initial Report |
| Acquisition ID | DRA-ACQ-000009 |
| Source URL | https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf |
| Source digest | `8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af` |
| Digest verified at admission | ✓ MATCHES reference |

---

## Part 5 — NIST Near-Duplicate Result Including DRA-DOC-0009

Near-duplicate check was run against **9 corpus texts** (DRA-DOC-0001 through DRA-DOC-0009):

| Document | Source | Result |
|----------|--------|--------|
| DRA-DOC-0001 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0002 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0003 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0004 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0005 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0006 | BENCHMARK_CORPUS (generatedText) | Not a near-duplicate |
| DRA-DOC-0007 | Apache HTTPD fixture | Not a near-duplicate |
| DRA-DOC-0008 | Acas guide (live fetch) | Not a near-duplicate |
| **DRA-DOC-0009** | **CMA Short Version (live fetch — newly admitted)** | **Not a near-duplicate** |

**Result: NO_NEAR_DUPLICATE — PASS ✓**

CMA Short Version source digest at NIST admission fetch: `e7fb5008…` — matches DRA-FRZ-000003 reference.

---

## Part 6 — NIST Final Eligibility (DRA-DOC-0010)

**Test file:** `dra-acq-005-nist-ai-rmf-admission.test.ts`  
**Result: 13/13 PASS**

| Check ID | Result | Detail |
|----------|--------|--------|
| SOURCE_DIGEST_PRESENT | ✓ PASS | 7576edb5… |
| NORMALISED_TEXT_NON_EMPTY | ✓ PASS | 122,238 characters |
| TEXT_DIGEST_PRESENT | ✓ PASS | 6cb8afe6… |
| OFFICIAL_SOURCE_VERIFIED | ✓ PASS | status: VERIFIED |
| LICENCE_VERIFIED | ✓ PASS | status: VERIFIED |
| APPROVED_TITLE_PRESENT | ✓ PASS | Artificial Intelligence Risk Management Framework (AI RMF 1.0) |
| APPROVED_PUBLISHER_PRESENT | ✓ PASS | National Institute of Standards and Technology (NIST) |
| APPROVED_LANGUAGE_PRESENT | ✓ PASS | en |
| CORPUS_ID_FORMAT | ✓ PASS | DRA-DOC-0010 |
| INCLUSION_RATIONALE_PRESENT | ✓ PASS | rationale present |
| NO_DUPLICATE_CORPUS_ID | ✓ PASS | DRA-DOC-0010 available |
| NO_NEAR_DUPLICATE | ✓ PASS | no near-duplicates (checked vs. DRA-DOC-0001–0009) |
| CORPUS_ELIGIBILITY | ✓ PASS | eligible |

---

## Part 7 — NIST Freeze and Admission Result (DRA-FRZ-000004)

| Field | Value |
|-------|-------|
| Corpus ID | DRA-DOC-0010 |
| Freeze ID | DRA-FRZ-000004 |
| Title | Artificial Intelligence Risk Management Framework (AI RMF 1.0) |
| Publisher | National Institute of Standards and Technology (NIST) |
| Publication date | 2023-01-26 |
| Domain | TECHNICAL |
| Document type | POLICY |
| Difficulty | HIGH |
| Language | en |
| Source URL | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| Final URL | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf |
| Acquisition ID | DRA-ACQ-000012 |
| Source digest | `7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1` |
| Text digest | `6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430` |
| Metadata digest | `61c283bffec8677844f2f54ba0f239abd03d0380b815442f95317b0119871f97` |
| Freeze record digest | `7d99f6b3fc2ae9e4cb5d1754cbd381ba73e316a79454988345c92faf99f69312` |
| Frozen at | 2026-08-06T11:30:00.000Z |
| Frozen by | DRA-ACQ-005-freeze-operator |
| Benchmark version | DRA-CORPUS-1.0.0 |
| Manifest digest | `4dc9509fa6db638508324d0b3942ebf258db8f117b1f0521f04bb552fc5b4478` |

---

## Part 8 — Final Admitted Corpus Document Count

**Admitted corpus documents at completion of this batch admission: 10**

The active registry contains DRA-DOC-0001 through DRA-DOC-0008 (initial corpus + DRA-ACQ-002 admissions). DRA-DOC-0009 and DRA-DOC-0010 were admitted in this batch session. The admission tests each create a fresh in-session registry to validate the admission workflow; the overall corpus count is derived from the repository state.

**Final ordered corpus IDs:**

| Corpus ID | Title | Type | Domain | Freeze ID |
|-----------|-------|------|--------|-----------|
| DRA-DOC-0001 | Safety Management System Compliance Audit Report — Q2 2026 | REPORT | TECHNICAL | (initial corpus) |
| DRA-DOC-0002 | Data Protection Impact Assessment — Customer Analytics Platform | REWRITE | LEGAL | (initial corpus) |
| DRA-DOC-0003 | Vendor Risk Assessment Report — Third-Party Software Integration | REPORT | BUSINESS | (initial corpus) |
| DRA-DOC-0004 | Clinical Validation Study Report — AI-Assisted Diagnostic Tool | REPORT | HEALTHCARE | (initial corpus) |
| DRA-DOC-0005 | Information Security Controls Assessment — Cloud Infrastructure | REWRITE | TECHNICAL | (initial corpus) |
| DRA-DOC-0006 | Financial Controls Review — Accounts Payable Process | REPORT | FINANCE | (initial corpus) |
| DRA-DOC-0007 | Apache HTTP Server Authentication Guide (official documentation) | OTHER | TECHNICAL | DRA-FRZ-000001 |
| DRA-DOC-0008 | Discipline and grievances at work: the Acas guide | PROCEDURE | BUSINESS | DRA-FRZ-000002 |
| **DRA-DOC-0009** | **AI Foundation Models: Short Version** | **SUMMARY** | **GENERAL** | **DRA-FRZ-000003** |
| **DRA-DOC-0010** | **Artificial Intelligence Risk Management Framework (AI RMF 1.0)** | **POLICY** | **TECHNICAL** | **DRA-FRZ-000004** |

---

## Part 9 — Freeze IDs and Integrity Digests

| Freeze ID | Corpus ID | Freeze record digest | Manifest digest after admission |
|-----------|-----------|---------------------|--------------------------------|
| DRA-FRZ-000001 | DRA-DOC-0007 | (from DRA-OPS-001) | (from DRA-OPS-001) |
| DRA-FRZ-000002 | DRA-DOC-0008 | (from DRA-ACQ-002) | (from DRA-ACQ-002) |
| **DRA-FRZ-000003** | **DRA-DOC-0009** | `092a1219536aa6eec0905bdce2c0a2d37e5c07e5863f90df290638e17456d848` | `8b5990dedf60106aeede4496024893a7333daa4574446208524f47956fdde066` |
| **DRA-FRZ-000004** | **DRA-DOC-0010** | `7d99f6b3fc2ae9e4cb5d1754cbd381ba73e316a79454988345c92faf99f69312` | `4dc9509fa6db638508324d0b3942ebf258db8f117b1f0521f04bb552fc5b4478` |

---

## Part 10 — Manifest Version and Digest

Each admission test creates a fresh in-session registry containing the single newly admitted document; manifests are per-admission-session records.

| Session | Manifest corpus version | Document count | Manifest digest |
|---------|------------------------|----------------|-----------------|
| DRA-ACQ-004 session (DRA-DOC-0009 only) | DRA-CORPUS-1.0.0 | 1 | `8b5990dedf60106aeede4496024893a7333daa4574446208524f47956fdde066` |
| DRA-ACQ-005 session (DRA-DOC-0010 only) | DRA-CORPUS-1.0.0 | 1 | `4dc9509fa6db638508324d0b3942ebf258db8f117b1f0521f04bb552fc5b4478` |

---

## Part 11 — Updated Allocation Statistics

New document types and domains admitted in this batch:

| Category | Pre-batch | Added | Post-batch |
|----------|-----------|-------|------------|
| **Document types** | | | |
| SUMMARY | 0 | 1 (DRA-DOC-0009) | 1 |
| POLICY | 0 | 1 (DRA-DOC-0010) | 1 |
| PROCEDURE | 1 | 0 | 1 |
| REPORT | 4 | 0 | 4 |
| REWRITE | 2 | 0 | 2 |
| OTHER | 1 | 0 | 1 |
| **Domains** | | | |
| GENERAL | 1 | 1 (DRA-DOC-0009) | 2 |
| TECHNICAL | 3 | 1 (DRA-DOC-0010) | 4 |
| BUSINESS | 2 | 0 | 2 |
| LEGAL | 1 | 0 | 1 |
| HEALTHCARE | 1 | 0 | 1 |
| FINANCE | 1 | 0 | 1 |
| **Total documents** | 8 | 2 | 10 |

---

## Part 12 — Full Test Totals

**Verdict: ALL PASS**

| Metric | Value |
|--------|-------|
| Test files | 112 |
| Tests | 3,076 |
| Failures | 0 |
| New test files added | 2 (`dra-acq-004-cma-ai-fm-admission.test.ts`, `dra-acq-005-nist-ai-rmf-admission.test.ts`) |
| Baseline before this session | 110 files / 3,074 tests |

---

## Part 13 — TypeScript Result

**Clean — no errors.**

---

## Part 14 — Blockers, Deviations, Unresolved Evidence

**No blockers.** Both admissions completed without deviation from the governed workflow.

| Item | Status | Note |
|------|--------|------|
| CMA source digest mismatch | No mismatch | `e7fb5008…` confirmed at admission time |
| CMA text digest mismatch | No mismatch | `dee3ab3c…` confirmed at admission time |
| Full Report (evidence source) digest | ✓ Matches reference | `8346bc78…` confirmed at admission time |
| NIST source digest mismatch | No mismatch | `7576edb5…` confirmed at admission time |
| NIST text digest mismatch | No mismatch | `6cb8afe6…` confirmed at admission time |
| Last-Modified overclaim (NIST) | Resolved | June 2025 recorded without overclaiming per governance decision |
| DRA-DOC-0009 in NIST near-duplicate check | ✓ Included | CMA Short Version re-fetched for NIST near-dup scope; NO_NEAR_DUPLICATE PASS |
| Evaluator execution | Correctly not executed | Both tests stop before evaluateDocument() per protocol |

---

*DRA-ACQ-004 / DRA-ACQ-005 Batch Admission Report — 2026-08-06 — Status: COMPLETE*
