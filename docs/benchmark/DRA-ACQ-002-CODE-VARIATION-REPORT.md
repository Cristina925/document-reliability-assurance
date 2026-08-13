# DRA-ACQ-002 — Code HTML Source Variation Investigation Report

**Final decision: SOURCE VARIATION RESOLVED — READY FOR BLIND EVALUATION**  
**Date:** 2026-08-04  
**Test file:** `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-code-variation-check.test.ts`

---

## A. Representations Compared

| Representation | Acquisition ID | Byte count | Source digest | Retrieved at |
|----------------|---------------|-----------|--------------|-------------|
| Original (prep baseline, DRA-ACQ-000003) | DRA-ACQ-000003 | 86,099 | `ac3df85a…9143` | 2026-08-04T13:10:19.640Z |
| Admission run | DRA-ACQ-000003 (re-fetch) | 86,098 | differs from baseline | 2026-08-04T13:24:19.640Z |
| Investigation fetch-1 | DRA-ACQ-000010 | 86,099 | `5aba4ca4…71b` | 2026-08-04T13:35:41.592Z |
| Investigation fetch-2 | DRA-ACQ-000011 | 86,099 | `5571906c…1fd` | 2026-08-04T13:35:45.702Z |

**Key observation:** Every fetch produces a different raw source digest, including two fetches 4 seconds apart. The raw source digest is not stable across requests. This is the primary finding of the investigation.

---

## B. Raw-Byte Comparison

**Between investigation fetch-1 and fetch-2 (same byte length, 86,099):**

Four differing regions were found, all confined to Drupal CMS hidden form input elements:

| Offset | Field name | Field type | Nature |
|--------|-----------|-----------|--------|
| 61,187 | `honeypot_time` | `<input type="hidden">` | Drupal anti-spam/bot detection token |
| 61,308 | `form_build_id` | `<input type="hidden">` | Drupal CSRF session token |
| 63,991 | `honeypot_time` | `<input type="hidden">` | Drupal anti-spam/bot detection token (second form) |
| 64,112 | `form_build_id` | `<input type="hidden">` | Drupal CSRF session token (second form) |

**Example (fetch-1 vs fetch-2 at offset 61,187):**
```
[fetch-1]  value="SGTFi2_XY77EH_ATjK-6iYPRJPNL9jDhvD7sYudrL64"
[fetch-2]  value="ZutxO97H1lj4X84l89gbTmpJzNp_b_I7osINpravYfs"
```

These are server-generated per-request random tokens embedded in two Drupal contact/search forms present on the page. They change on every HTTP request. The byte-count variation between the prep run (86,099) and the admission run (86,098) was caused by one of these token strings being 1 character shorter in that particular response.

**No differences in document content, Code of Practice text, HTML structure (outside the two form elements), headings, paragraph text, links, or metadata.**

---

## C. Full Normalised Text Comparison

| Item | Value |
|------|-------|
| Reference text digest (prep run) | `c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40` |
| Investigation fetch-1 text digest | `c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40` |
| Investigation fetch-2 text digest | `c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40` |
| Fetch-1 matches reference | **YES — exact match** |
| Fetch-2 matches reference | **YES — exact match** |
| Fetch-1 equals fetch-2 | **IDENTICAL** |
| Normalised text length | 21,717 characters (all three representations) |

**The full normalised texts are identical across all fetches.** The HTML normalisation pipeline strips `<input>` elements entirely, so the per-request Drupal tokens do not appear in the normalised text. The normalised text digest is stable.

---

## D. Paragraphs 9–17 Comparison (Evaluation Boundary)

The evaluation boundary was extracted from each normalised text representation. The extraction covered the disciplinary notification and meeting procedure section, from "Inform the employee" through the companion rights paragraphs.

| Check | Result |
|-------|--------|
| Boundary extracted (non-empty) | ✓ YES — from both fetch-1 and fetch-2 |
| Boundaries identical across fetches | ✓ YES — exact string match |
| Para 9 — Inform the employee | ✓ PRESENT |
| Para 10 — Right to be accompanied | ✓ PRESENT |
| Para 11 — Unreasonable delay | ✓ PRESENT |
| Para 13 — Statutory right to companion | ✓ PRESENT |
| Para 16 — Postponement | ✓ PRESENT |
| Para 17 — Companion role (cannot answer questions) | ✓ PRESENT |
| Paragraph order | ✓ UNCHANGED |
| Wording | ✓ UNCHANGED |
| Punctuation | ✓ UNCHANGED |

**All boundary paragraphs remain present, in order, with identical wording and punctuation.**

---

## E. Variation Classification

**Classification: `TRANSPORT_OR_DYNAMIC_MARKUP_ONLY`**

**Basis:**
- Raw HTML differences are exclusively in Drupal CMS hidden form fields (`honeypot_time` and `form_build_id`)
- These are per-request server-generated tokens embedded in `<input type="hidden">` elements within Drupal contact/search forms on the page
- They are not part of the Code of Practice document content
- The tokens change on every HTTP request, making the raw source digest inherently unstable for this page
- The HTML normalisation pipeline strips all `<input>` elements, so the tokens do not appear in the normalised text
- The normalised text is fully stable across requests (text digest matches reference on every fetch)

---

## F. Effect on the Frozen Evidence Boundary

The variation is entirely in Drupal CMS hidden form fields that are stripped during HTML normalisation. The normalised Code text — which is the evidence supplied to the evaluator as `additionalSourceText` — is unaffected.

| Item | Status |
|------|--------|
| Normalised Code text | Identical to prep-run reference |
| Normalised text digest | `c838df56…bf40` — matches reference exactly |
| Evaluation boundary paragraphs 9–17 | Present, in order, wording unchanged |
| Freeze record DRA-FRZ-000002 | Not affected — guide digests verified exact-match |
| Amendment to freeze record required | **NO** |

**Both raw source digests are preserved:**

| Fetch | Source digest |
|-------|--------------|
| Prep reference (DRA-ACQ-000003, 2026-08-04T13:10) | `ac3df85ab5573a41da3de291a07f07e8a02840bc76a63c55c7944f23de0b9143` |
| Representative current (investigation, 2026-08-04T13:35) | `5aba4ca4f494dd33914ad49a6c67bd98ae041e64ac752d14d633f7120d02071b` |

The prep-run representation (digest `ac3df85a…`) is identified as the original frozen evidence baseline. The normalised text digest `c838df56…` is the canonical evaluation input; it is stable regardless of which raw representation is used.

---

## G. Admission-Test Behaviour

The admission test (`dra-acq-002-acas-guide-admission.test.ts`) correctly:

1. Detected the Code source digest mismatch and emitted a `SOURCE_CHANGE_DETECTED` classification to stderr
2. Recorded both byte counts and the classification in the test log
3. Proceeded with the current bytes for evaluation boundary preparation, noting that a human reviewer should confirm the Code text content

**Did the test incorrectly allow a `SOURCE_CHANGE_DETECTED` condition to be treated as non-blocking?**

No. The admission test governs the freeze of DRA-DOC-0008 (the guide), not the Code HTML. The eligibility checks and digest integrity checks apply exclusively to the guide source and text digests — both of which matched their reference exactly. The Code HTML is source evidence only; its source digest is not part of the freeze record for DRA-DOC-0008.

**Test-fixture decision vs frozen governance requirement:**

| Layer | Behaviour |
|-------|-----------|
| Test fixture | Treated Code digest mismatch as a non-blocking `WARNING` for the guide admission; recorded for review |
| Frozen governance requirement | Guide source digest and text digest must match their reference — both do exactly |
| Conclusion | The test behaviour is correct. No corrective action is required to preserve factual integrity. |

---

## H. Governance Disposition

**READY FOR BLIND EVALUATION**

The Code HTML raw-source variation is `TRANSPORT_OR_DYNAMIC_MARKUP_ONLY`. The normalised Code text — the evidence boundary — is stable and matches the preparation-run reference on every fetch.

- No amendment to DRA-FRZ-000002 is required
- No new freeze record is required
- The evaluation may proceed using the normalised Code text as `additionalSourceText` (text digest: `c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40`)
- Task #5 (Code of Practice source confirmation) is resolved

**Note for the operational evaluation:** Because the raw source digest of the Code HTML is inherently unstable (per-request Drupal tokens), future fetches for `additionalSourceText` should record the normalised text digest, not the raw source digest, as the evidence integrity reference for the Code.

---

## I. Files Created or Modified

### Created

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-002-code-variation-check.test.ts` | Variation investigation test |
| `docs/benchmark/DRA-ACQ-002-CODE-VARIATION-REPORT.md` | This report |

### Modified

None. No existing file was modified. DRA-FRZ-000002, DRA-DOC-0001 through DRA-DOC-0007, and all CTS artefacts are unchanged.

---

## J. Tests and Typecheck

```
pnpm tsc --noEmit (lib/dra-reference)
  → 0 errors (clean)

vitest run dra-acq-002-code-variation-check.test.ts
  Tests:    1 passed (1)
  Duration: 4.95s (live network: two HTML fetches with 3s pause)
  All assertions: passed

Full test suite (pnpm vitest run, lib/dra-reference):
  Test Files: 101 passed (101)
  Tests:      2949 passed (2949)
  No regressions
```

---

## K. Final Decision

### **SOURCE VARIATION RESOLVED — READY FOR BLIND EVALUATION**

The one-byte raw-source change in the ACAS Code HTML between the preparation run and the admission run is classified as `TRANSPORT_OR_DYNAMIC_MARKUP_ONLY`. It is caused by Drupal CMS per-request tokens in hidden form fields that are stripped entirely during HTML normalisation. The normalised Code text and evaluation boundary are identical across every fetch, matching the preparation-run reference exactly.

DRA-DOC-0008 may proceed to blind evaluation.

---

## L. Confirmation: Evaluator Not Executed

**Confirmed.** The evaluator was not executed.

- `evaluateDocument` was not called
- No assurance decision was produced (no SUPPORTED, REVIEW, or HOLD)
- No proof receipt was generated
- DRA-FRZ-000002 was not modified
- No new freeze record was created
- DRA-DOC-0001 through DRA-DOC-0007 were not altered
- No CTS artefact was modified
- No governance rules, schemas, normalisation logic, issue-detection logic, or evaluator logic was modified
