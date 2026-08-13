# DRA-ACQ-018 Phase 2 — Completion Report

## Governed Acquisition, Freeze, and Admission of DRA-DOC-0022
### European Environment Agency — "Tracking waste prevention progress" (EEA Report 02/2023)

Date executed: 2026-08-10
Programme: DRA-ACQ-018 (evidence-gap-driven acquisition)
Phase: 2 of 2 (Phase 1 = candidate discovery, already accepted; this phase = acquisition/freeze/admission only)

---

## 1. Files created / modified

| File | Change |
|---|---|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-018-eea-waste-prevention-admission.test.ts` | **Created.** Single Vitest admission test (follows the DRA-ACQ-017 template): two independent live fetches, 21-document registry reconstruction, `acquireFreezeAndEvaluate()` governed-pipeline call, and verbatim recording of all resulting fields. |
| `lib/dra-reference/docs/dra/DRA-ACQ-018-PHASE2-EEA-ADMISSION-REPORT.md` | **Created.** This report. |

**No engineering/production code was created or modified.** No file under `src/` other than the new test file above was touched. `git status` before this report was written showed only these two new files; nothing else in the working tree changed.

---

## 2. Part 1 — Publication identity confirmation

Re-verified live today (2026-08-10) against the official EEA source and cross-checked against the Phase‑1‑qualified candidate (`DRA-CAND-018-01`):

- **Title:** "Tracking waste prevention progress — A narrative-based waste prevention monitoring framework at the EU level"
- **Report number:** EEA Report 02/2023
- **Publisher:** European Environment Agency (EEA)
- **ISBN:** 978-92-9480-556-0 · **ISSN:** 1977-8449 · **DOI:** 10.2800/612143
- **Format:** PDF, 94 pages, A4, PDF 1.5, created 2023-04-28 (per `pdfinfo`)
- **Canonical URL:** `https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file`
- **Content-Disposition filename:** `TH-AL-23-002-EN-N Tracking waste prevention FINAL.pdf`

All facts match the Phase 1 record exactly. **Identity confirmed: MATCH.**

---

## 3. Part 2 — Two independent live A/B fetches

| | Fetch A | Fetch B |
|---|---|---|
| HTTP status | 200 | 200 |
| Content-Type | `application/pdf` | `application/pdf` |
| Byte length | 1,838,985 | 1,838,985 |
| SHA-256 | `238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d` | `238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d` |

Both fetches performed independently (via `curl` pre-check and again inside the Vitest test via `createHttpFetcher`, ~3s apart each time). Byte length and SHA-256 are identical across both runs, and identical to the digest recorded during DRA-ACQ-018 Phase 1 discovery.

**Stability classification: BYTE_STABLE.**

---

## 4. Part 3 — Official-source governance verdict

**VERIFIED.**

Evidence: served from the EEA's own first-party domain (`eea.europa.eu`) via the EEA's own Volto/Plone publications CMS; no mirror or third-party republication host; PDF front matter and `pdfinfo` metadata (Title, Author "EEA", report number, ISBN/ISSN/DOI, Publications Office of the European Union imprint) match the publisher and title claimed. Confirmed to be the same artefact qualified in Phase 1 (same URL, byte length, and digest).

No STOP condition triggered.

---

## 5. Part 4 — Licence / reuse determination

**VERIFIED — CREATIVE_COMMONS_BY (CC BY 4.0).**

Evidence (re-fetched live today):
- EEA's institution-wide legal notice (`eea.europa.eu/en/legal-notice`) states materials are published under CC BY 4.0 (linked to `creativecommons.org/licenses/by/4.0/`) and may be re-used commercially or non-commercially with attribution.
- The report's own front-matter copyright line ("© European Environment Agency, 2023. Reproduction is authorised provided the source is acknowledged.") is consistent attribution-only language — **no document-specific override** narrowing the site-wide grant was found.
- **Third-party material checked:** cover photo credited to a named photographer, and co-authorship credited to IVL, VTT, and VITO in the acknowledgements. These are attribution/contributor credits within an EEA-owned publication, not independent third-party copyright claims that would exclude any part of the report — consistent with the precedent already accepted for other EU-institution documents in this corpus (DRA-DOC-0018/0020/0021).

No STOP condition triggered (not BLOCKING, not NOT_VERIFIED).

---

## 6. Part 5 — Final classification

| Field | Value |
|---|---|
| documentType | REPORT |
| domain | GENERAL |
| language | en |
| difficulty | HIGH |
| publisher | European Environment Agency (EEA) |
| format | PDF |
| stability | BYTE_STABLE |

All values drawn from the existing taxonomy; no new enum values were introduced.

---

## 7. Part 6 — Normalisation

Ran the existing, unmodified `normaliseContent()` (PDF branch, via the same `pdftotext -layout` extractor used by every prior PDF acquisition) against the frozen bytes.

- Source digest: `238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d`
- Normalised text digest: `52e6265864bb52a560263a9a5707db369dedd96fbe6de64c2b5405256a6cd5cc`
- Structural observation: 94-page PDF; formal three-step methodology; quantitative indicator tables; numbered technical annex ("Annex 1 — All indicators and RACER evaluation results") scoring indicators against Relevance/Acceptance/Credibility/Ease/Robustness criteria — a multi-indicator monitoring-framework structure not previously present in the corpus.

---

## 8. Part 7 — Freeze

Frozen via the existing, unmodified freeze mechanism (`acquireFreezeAndEvaluate()` → `freezeAcquiredDocument()`), no engineering changes.

| Field | Value |
|---|---|
| freezeRecordId | `DRA-FRZ-000016` |
| corpusDocumentId | `DRA-DOC-0022` |
| acquisitionId | `DRA-ACQ-000025` |
| sourceDigest | `238f506e5aa10e5a3f9ecce8570c1d3a04e436131c0aaea368dc5c99b2341e4d` |
| normalisedTextDigest | `52e6265864bb52a560263a9a5707db369dedd96fbe6de64c2b5405256a6cd5cc` |
| metadataDigest | `b3a6d9d90ee759bf862f5a59d1a5e73524b402bad1defbd6c523bc317c7fbce0` |
| freezeRecordDigest | `a37a9a3d903a04f6840b9c9211138f1165ca6c03a1d9e6416ce16fbd96079adf` |
| frozenAt | `2026-08-10T12:30:00.000Z` |
| status | FROZEN |

All digests are well-formed 64-character hex SHA-256 values; freeze eligibility checks (official source VERIFIED, licence VERIFIED, no duplicate corpus ID, no duplicate digest) all passed.

---

## 9. Part 8 — Acquisition/admission record and manifest verification

- Manifest document count: **21 → 22.**
- New manifest overall digest: `dc14706ac99fd3e64fe98b9bb1ecc42c42e434422408bfa13cd301fcd15aa4d8`
- `verifyManifestIntegrity()` (existing, unmodified): **PASS.**
- All 21 prior document IDs (`DRA-DOC-0001` … `DRA-DOC-0021`) confirmed present, in original order, unchanged, ahead of the new `DRA-DOC-0022` entry (asserted via exact slice equality in the test, not just membership).

**Scope note (documented, intentional):** the (optional) near-duplicate *content*-similarity check was not exercised — it only engages when `existingCorpusTexts` is supplied, and the 21 prior corpus documents' full texts were not re-fetched for this admission (a metadata-only registry reconstruction was used instead, which fully exercises the corpus-ID/digest duplicate checks and the manifest transition). This is reasonable given the EEA document's subject matter (EU waste-policy monitoring) is not substantively similar to any of the 21 existing documents. This does not affect any of the 14 success-gate items below, none of which require the near-duplicate check.

---

## 10. Part 9 — Admission-time evaluation (evaluator 0.1.2, unmodified)

Recorded **verbatim**, no assumptions:

| Field | Value |
|---|---|
| Decision | **REVIEW** |
| Issue count | **3** |
| Issue classes | `["EVIDENCE_INADEQUATE"]` |
| Statement count | **4,839** |
| Evaluation timestamp | `2026-08-10T12:30:00.000Z` |
| Proof receipt substantive digest | `171bb5f6840a290949770a1d8b179f09d40029f862cf60d9f5e6f1021aed35d9` |

No prediction was made in advance of this run (H22 in the Phase 1 discovery module was explicitly framed as an open question with no predicted outcome); this is simply the evaluator's actual, unmodified output on this new document.

---

## 11. Part 10 — Version identity stamps and receipt integrity

| Field | Expected | Actual | Match |
|---|---|---|---|
| evaluatorVersion | 0.1.2 | 0.1.2 | ✓ |
| pipelineVersion | 1.0 | 1.0 | ✓ |
| receipt schemaVersion | 0.1.0 | 0.1.0 | ✓ |

Proof receipt substantive digest is a well-formed 64-character hex SHA-256 value. No version identifier was modified by this acquisition.

---

## 12. Part 11 — Post-admission corpus integrity checks

- Corpus count = **22** ✓
- Manifest internally consistent (`verifyManifestIntegrity` = PASS) ✓
- All 21 prior entries present, unchanged, and in original order ✓
- First-20-document baseline untouched ✓
- DRA-DOC-0021 (most recent prior admission) present and unchanged ✓

---

## 13. Part 12 — Regression testing

| Check | Result |
|---|---|
| New admission test (isolated run) | **PASS** — 1/1 test, 53.6s |
| `tsc --noEmit` (whole `lib/dra-reference` package) | **PASS** — no errors |
| Acquisition + governance + corpus test directories (`src/benchmark/acquisition/`, `src/benchmark/governance/`, `src/benchmark/corpus/`) | **52 files passed, 16 files failed** (1,009 tests passed, 16 tests failed) — see classification below |

**Failure classification — all 16 failures are PRE_EXISTING, unrelated to this change:**

Every failure is the identical assertion pattern in 16 separate discovery-module test files (`dra-acq-010` through `dra-acq-017` candidate-discovery tests), each asserting `expect(DRA_EVALUATOR_VERSION).toBe("0.1.1")`. The actual constant (`lib/dra-reference/src/model/versions.ts`) has read `"0.1.2"` since the DRA-ENG-014 versioned correction, which predates this acquisition. `git status` before any work in this session showed a clean tree except for the task's own attached-assets file; the new admission test is the only file added. This confirms these 16 failures existed **before** this Phase 2 work began and are a pre-existing gap where DRA-ENG-014 updated the evaluator constant but a run of earlier discovery-module tests were left pinned to the prior value. Classification: **PRE_EXISTING_STALE_ASSERTION** (not a network flake, not a timeout — a stale hardcoded expectation in unrelated discovery-module tests, outside this task's scope to fix).

**Full monorepo test suite was not run** (would exceed the tool's execution-time budget); the acquisition/governance/corpus subtree above (68 files, 1,025 tests) was chosen as the most relevant regression scope for this change. This is disclosed rather than characterized as a full clean-suite result.

---

## 14. Part 13 — Confirmation of no production/engineering code changes

**Confirmed: NO.** No file under `src/` other than the new test file was created or modified. The EEA document required no new engineering (no new media-type handling, no new licence-basis enum value, no new document type) — the existing `normaliseContent`, `createHttpFetcher`, `acquireFreezeAndEvaluate`, `CorpusRegistry`, and evaluator pipeline (all unmodified) were sufficient. No STOP-and-report for engineering was triggered.

---

## 15. Part 14 — Success gate checklist

| # | Gate | Status |
|---|---|---|
| 1 | Publication identity confirmed and matches Phase 1 candidate | ✓ |
| 2 | Two independent live fetches, byte/SHA-256 identical, BYTE_STABLE | ✓ |
| 3 | Official-source governance verdict VERIFIED | ✓ |
| 4 | Licence/reuse determination VERIFIED (not BLOCKING/NOT_VERIFIED) | ✓ |
| 5 | Final classification recorded using existing taxonomy only | ✓ |
| 6 | Normalisation run unmodified; digests/observations recorded | ✓ |
| 7 | Freeze completed via existing mechanism; digests verified | ✓ |
| 8 | Manifest 21→22 confirmed; no existing entries changed | ✓ |
| 9 | Admission-time evaluation run; decision/issues/statements recorded verbatim | ✓ |
| 10 | Version identity stamps confirmed (0.1.2 / 1.0 / 0.1.0); receipt integrity confirmed | ✓ |
| 11 | Post-admission corpus integrity checks all pass | ✓ |
| 12 | Regression tests run and failures correctly classified | ✓ |
| 13 | No production/engineering code changed | ✓ |
| 14 | All of the above pass | ✓ |

---

## 16. Verdict

# **COMPLETE**

DRA-DOC-0022 (EEA "Tracking waste prevention progress", EEA Report 02/2023) has been formally acquired, governed, frozen as `DRA-FRZ-000016`, and admitted to the corpus (21 → 22 documents) via the unmodified DRA-ENG-009 governed pipeline and unmodified evaluator 0.1.2. Decision: **REVIEW**, 3 issues, class `EVIDENCE_INADEQUATE`. No engineering code was changed. All 14 success-gate items pass.

---

## 17. Proposed scope for a future DRA-BMK-022 (NOT executed in this phase)

Per the task's explicit instruction, **DRA-BMK-022 was not started.** If commissioned, its scope should be:

1. Extend the 22-document checkpoint pattern established by DRA-BMK-015 through DRA-BMK-021: rebuild the full 22-document manifest (this time including DRA-DOC-0022), verify the manifest digest exactly matches `dc14706ac99fd3e64fe98b9bb1ecc42c42e434422408bfa13cd301fcd15aa4d8`, and re-confirm per-document decisions for all 22 entries.
2. Re-verify issue-class coverage against the fixed 9-class taxonomy (currently 3/9 covered as of DRA-DOC-0021/DRA-CHK-002); confirm whether DRA-DOC-0022's `EVIDENCE_INADEQUATE` result changes or reconfirms that ceiling.
3. Explicitly test the open **H22** question from Phase 1 discovery — whether GENERAL-domain, non-AI-governance subject matter (waste-policy monitoring) with a multi-indicator/RACER-scored annex structure produces any decision or issue-class pattern different from the rest of the corpus. This is a genuinely open question; DRA-BMK-022 should state a falsifiable comparison method before drawing any conclusion, following the same discipline used for the EN/ES H21 investigation (DRA-CHK-003/005).
4. Do not draw conclusions about domain-balance or "TECHNICAL/AI-governance deconcentration" from a single document; if that remains a research interest, it should be scoped as a multi-document trend across future acquisitions, not asserted from DRA-DOC-0022 alone.
5. As with all prior checkpoints, keep the checkpoint read-only against the frozen corpus — no new acquisition work.
