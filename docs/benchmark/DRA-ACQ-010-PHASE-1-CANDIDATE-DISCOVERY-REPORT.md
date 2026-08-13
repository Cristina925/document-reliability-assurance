# DRA-ACQ-010 — Phase 1: Candidate Discovery for DRA-DOC-0015

**Status:** Phase 1 (discovery and recommendation only) — COMPLETE. Awaiting approval before Phase 2 (acquisition, freeze, admission).

**Identifier note:** this work was originally requested as DRA-ACQ-007, but that identifier was already assigned (PRA SS1/23, DRA-DOC-0012). DRA-ACQ-008 and DRA-ACQ-009 are also taken (FDA, BCBS). The next available acquisition identifier is **DRA-ACQ-010**, confirmed with the user before starting.

---

## A. Scope and constraints

Phase 1 is discovery only. This report and its accompanying code:
- Do NOT download or permanently acquire any document.
- Do NOT freeze any document or create DRA-DOC-0015.
- Do NOT admit anything to the corpus.
- Do NOT run the evaluator or generate a proof receipt.
- Do NOT modify any frozen corpus record or evaluator v0.1.1.
- Do NOT alter the DRA-CHK-002 issue-class coverage finding (3/9, fixed).

Machine-checkable evidence for these constraints lives in
`lib/dra-reference/src/benchmark/acquisition/discovery/__tests__/dra-acq-010-candidate-discovery.test.ts`
(Part 7).

---

## B. Corpus-balance analysis (authoritative source)

The analysis below is derived directly from the field values used in the
DRA-BMK-014 fourteen-document checkpoint test's canonical summary table
(`src/benchmark/execution/__tests__/dra-bmk-014-fourteen-document-checkpoint.test.ts`),
cross-checked against the corpus schema — not from earlier narrative reports,
whose labels have drifted from the schema (a pattern already flagged once
before, in the DRA-CHK-002 finding).

### B.1 — Real acquisitions only (DRA-DOC-0007 through DRA-DOC-0014, 8 documents)

| CorpusId | Publisher | DocumentType | Domain |
|---|---|---|---|
| DRA-DOC-0007 | Apache Software Foundation | ARTICLE | TECHNICAL |
| DRA-DOC-0008 | Acas | PROCEDURE | BUSINESS |
| DRA-DOC-0009 | Competition and Markets Authority | SUMMARY | GENERAL |
| DRA-DOC-0010 | NIST | POLICY | TECHNICAL |
| DRA-DOC-0011 | ICO | OTHER | LEGAL |
| DRA-DOC-0012 | PRA, Bank of England | OTHER | FINANCE |
| DRA-DOC-0013 | FDA | POLICY | HEALTHCARE |
| DRA-DOC-0014 | BCBS | POLICY | FINANCE |

**Domain distribution (real acquisitions):** TECHNICAL 2, FINANCE 2,
BUSINESS 1, GENERAL 1, LEGAL 1, HEALTHCARE 1.

- **Best-represented:** TECHNICAL and FINANCE (2 each).
- **Least-represented (tied):** BUSINESS, GENERAL, LEGAL, HEALTHCARE (1 each).

**DocumentType distribution (real acquisitions):** POLICY 3, OTHER 2,
ARTICLE 1, PROCEDURE 1, SUMMARY 1. **REPORT, REWRITE, and EMAIL have zero
real-acquisition representation.** REPORT is the one realistically fillable
gap (REWRITE/EMAIL structurally lack official-source equivalents).

**Publisher distribution:** 8 distinct publishers for 8 documents — no
repeats yet.

**Recency concentration:** of the three most recent acquisitions
(DRA-DOC-0012 OTHER/FINANCE, DRA-DOC-0013 POLICY/HEALTHCARE, DRA-DOC-0014
POLICY/FINANCE), two of three are documentType POLICY and two of three are
domain FINANCE — a real, if modest, concentration risk worth correcting
rather than deepening.

### B.2 — Implication for DRA-DOC-0015

The strongest corpus-balance case is for a document that:
1. Falls in BUSINESS, GENERAL, LEGAL, or HEALTHCARE (currently tied at 1
   real document each), **not** TECHNICAL or FINANCE.
2. Is not documentType POLICY (already 3 of 8 real documents, including
   2 of the last 3).
3. Ideally uses documentType REPORT (zero real-acquisition coverage) if a
   qualifying, accessible source exists.

---

## C. Candidate register

Seven candidates were researched from official public sources, each fetched
and evidenced directly (HTTP status, content-type, byte size, and — where
possible — licence text), not merely identified by title. Full machine-
readable records are in
`lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-010-candidate-discovery.ts`
(`CANDIDATE_REGISTER`).

| ID | Publisher | Title | Domain / Type | Accessibility | Outcome |
|---|---|---|---|---|---|
| 010-01 | OECD | Recommendation of the Council on Artificial Intelligence (OECD/LEGAL/0449) | GENERAL / OTHER | VERIFIED_ACCESSIBLE (200, PDF, 2.25MB) | **QUALIFIED_RECOMMENDED** |
| 010-02 | EDPB | Guidelines 1/2024 on Art. 6(1)(f) GDPR | LEGAL / OTHER | VERIFIED_ACCESSIBLE (200, PDF, 722KB) | QUALIFIED_ALTERNATE |
| 010-03 | NCSC (UK) | Principles for the security of machine learning | TECHNICAL / PROCEDURE | VERIFIED_ACCESSIBLE (200, HTML) | QUALIFIED_ALTERNATE |
| 010-04 | WHO | Ethics and governance of AI for health | HEALTHCARE / OTHER | PARTIAL_LANDING_PAGE_ONLY (PDF mirrors return 403) | DEFERRED |
| 010-05 | US GAO | GAO-21-519SP AI Accountability Framework | GENERAL / REPORT | BLOCKED_NETWORK_LEVEL (gao.gov 403 domain-wide) | REJECTED |
| 010-06 | Australian Govt (DISR) | Australia's AI Ethics Principles | GENERAL / ARTICLE | BLOCKED_CONNECTIVITY_TIMEOUT (TLS stalls) | DEFERRED |
| 010-07 | PDPC (Singapore) | Model AI Governance Framework (2nd Ed.) | TECHNICAL / PROCEDURE | BLOCKED_BOT_CHALLENGE (HTTP 202 interstitial) | DEFERRED |

### C.1 — Per-candidate evidence detail

**010-01 OECD-LEGAL-0449 (RECOMMENDED).** Fetched directly:
`curl -L` (Chrome UA) → HTTP 200, `application/pdf`, 2,246,383 bytes, from
`https://oecd.ai/en/assets/files/OECD-LEGAL-0449-en.pdf`. Originally adopted
22 May 2019 by the OECD Council — a settled, multi-year-standing
international instrument, not a draft. Fills the GENERAL-domain gap
(currently 1 real document: CMA). Licence: OECD operates a stated
open-access policy, but the specific terms page
(`www.oecd.org/en/about/terms-conditions.html`) sits behind a Cloudflare
interactive challenge from this environment, so licence status is
**REVIEW_REQUIRED**, not VERIFIED. The precise adoption/amendment date on
the authoritative `legalinstruments.oecd.org` record could not be confirmed
(JS-rendered page).

**010-02 EDPB Guidelines 1/2024.** Fetched directly: HTTP 200,
`application/pdf`, 721,935 bytes, 37 pages extracted via `pdftotext`. Fills
the LEGAL-domain gap (currently 1 real document: ICO) with a new
jurisdiction (EU vs UK). **Content-stability risk found during review:**
every page footer reads "Adopted - version for public consultation," and
EDPB's own consultation page confirms the feedback window closed
20 November 2024 — a finalised, possibly revised text may since exist and
was not located. This is why it ranks below OECD despite an equivalent
domain-diversity contribution.

**010-03 NCSC "Principles for the security of machine learning."** HTTP 200
HTML; OGL wording confirmed present in the page text (same licence
precedent as Acas/ICO — cleanest licence position of all 7 candidates).
Not recommended: it would be the corpus's **third** TECHNICAL document
(already best-represented) and the corpus's **fourth** UK-government
publisher (Acas, ICO, PRA, +NCSC), working against — not for — the
diversity objective.

**010-04 WHO "Ethics and governance of AI for health."** The WHO
publication landing page (`who.int/publications/i/item/9789240029200`)
returns HTTP 200, but both known PDF mirrors on `iris.who.int`
(`/bitstream/handle/...` and `/server/api/core/bitstreams/.../content`)
return **HTTP 403** on every attempt, with and without a browser User-Agent.
The actual document bytes were never retrieved. Its CC BY-NC-SA 3.0 IGO
licence is not a novel risk category for this corpus (PRA and BCBS already
carry non-commercial licence bases), but accessibility is the hard blocker.

**010-05 US GAO-21-519SP.** Would be the single strongest content-fit
candidate — REPORT is the one documentType with zero real-acquisition
coverage, GENERAL/BUSINESS domain reinforcement, and the same
US_GOVERNMENT_WORK licence basis already VERIFIED for NIST and FDA. Rejected
for Phase 1 purely on accessibility: `curl` to both the specific product
page and the bare `gao.gov` root domain returned HTTP 403 — a domain-wide
block from this environment, not a page-specific issue. Worth reattempting
from a different network path in a future phase.

**010-06 Australia's AI Ethics Principles.** `curl -v` shows DNS resolution
and TLS ServerHello/Certificate exchange completing, then the connection
stalling indefinitely before the handshake finishes, across repeated
15–20s-timeout attempts. Deferred pending a retry from a different egress
path.

**010-07 Singapore PDPC Model AI Governance Framework.** Every fetch attempt
returns HTTP 202 with `text/html` content-type (a bot-detection interstitial)
instead of the PDF. Deferred pending an alternate access route.

---

## D. Ranking methodology and recommendation

Ranking is fixed, auditable data (`RANKED_CANDIDATE_IDS`), not a scoring
formula, applied in strict priority order:

1. **HTTP accessibility is a hard gate.** A candidate whose actual document
   bytes cannot be reproducibly fetched is excluded from the qualified set
   regardless of content merit. This is why GAO (010-05) — otherwise the
   best content fit — is REJECTED, and WHO (010-04), Australia (010-06),
   and Singapore (010-07) are DEFERRED.
2. **Content stability.** A settled, final instrument outranks one flagged
   as a consultation draft or otherwise provisional. This is the deciding
   factor between OECD (settled since 2019) and EDPB (public-consultation
   text, possible unseen final revision).
3. **Corpus-diversity contribution.** Candidates reinforcing a
   least-represented domain outrank candidates deepening an
   already-best-represented one. This is why NCSC (deepens TECHNICAL and UK
   concentration) ranks below OECD and EDPB despite full accessibility and
   the cleanest licence position of all seven.
4. **Licence-position tractability** as the final tiebreaker.

**Recommendation: DRA-CAND-010-01 — OECD-LEGAL-0449, "Recommendation of the
Council on Artificial Intelligence," for DRA-DOC-0015.**

It is the only candidate that is simultaneously (a) confirmed accessible,
(b) a settled rather than provisional text, and (c) a genuine reinforcement
of an under-represented domain (GENERAL) without deepening the corpus's
existing POLICY-type or FINANCE/TECHNICAL-domain concentration.

---

## E. Rejected / deferred alternatives — summary of reasons

| Candidate | Reason |
|---|---|
| EDPB (010-02) | Accessible and domain-appropriate, but text is explicitly marked "public consultation" — content-stability risk the OECD candidate does not share for an equivalent diversity contribution. |
| NCSC (010-03) | Fully accessible with the cleanest licence position, but reinforces the already best-represented real domain (TECHNICAL) and the already best-represented jurisdiction (UK government). |
| WHO (010-04) | Fills the HEALTHCARE gap and has an unsurprising licence position, but the actual PDF is unreachable (HTTP 403 on both known mirrors) — fails the reproducible-fetch precondition. |
| GAO (010-05) | Otherwise the strongest content fit (fills the REPORT gap), but `gao.gov` is blocked network-wide (HTTP 403) from this environment. |
| Australia (010-06) | Comparable value to OECD but connection stalls at the TLS handshake stage; not yet demonstrated reachable. |
| Singapore PDPC (010-07) | Returns a bot-detection interstitial (HTTP 202) instead of the document; content never verified. |

---

## F. Unresolved risks (carried forward, not resolved here)

1. OECD-LEGAL-0449's exact adoption/amendment date could not be scraped from
   the authoritative `legalinstruments.oecd.org` record (JS-rendered SPA).
2. OECD's specific reuse/licence terms text is behind a Cloudflare
   interactive challenge; licence status must remain REVIEW_REQUIRED until a
   human reviewer inspects it directly.
3. No `DocumentType` schema value cleanly represents a "recommendation" or
   "guidance"-style instrument (recurring gap, previously logged for ICO);
   OECD would need an explicit OTHER-vs-POLICY mapping decision at
   acquisition time.
4. Two near-identical PDF mirrors exist for OECD-LEGAL-0449
   (`oecd.ai` and `legalinstruments.oecd.org/api/print`); the canonical
   source for digest purposes must be chosen and documented before
   acquisition.
5. `LicenceBasis` has no dedicated NC/IGO variant, which is why WHO was
   deferred rather than rejected outright — likely to recur with other
   international-body sources in future phases.
6. **Pre-existing test-suite finding, unrelated to this candidate
   selection:** `dra-acq-008-fda-samd-admission.test.ts` and
   `dra-acq-009-bcbs-operational-resilience-admission.test.ts` (and
   occasionally `dra-acq-006-ico-ai-data-protection-prep.test.ts`) contain a
   `buildExistingCorpusTexts()` helper that silently drops a document from
   its count when one of its live PDF/HTML fetches transiently fails under
   concurrent network load, rather than asserting fetch success. This
   surfaces only when several live-fetch acquisition test files are
   scheduled into the same worker concurrently; every file passes cleanly
   in isolation and in non-conflicting batches (137 files / 3408 tests, 0
   failures, confirmed by batch). It predates this task and was not
   modified here — flagged for future hardening, not fixed under DRA-ACQ-010.

---

## G. Explicit confirmation — prohibited actions not taken

- No document was downloaded for permanent retention or freeze.
- No freeze record was created; no `DRA-DOC-0015` exists anywhere in the
  corpus schema, registry, or manifest as a result of this work.
- No document was admitted to the corpus.
- The evaluator was not run on any new document; no proof receipt was
  generated.
- No frozen corpus record (DRA-DOC-0001–0014) or evaluator v0.1.1 was
  modified.
- The DRA-CHK-002 issue-class coverage finding (3/9, fixed) was not altered;
  no candidate's diversity rationale claims a coverage increase (enforced by
  test).

---

## H. Next action

Await user approval before any Phase 2 work (acquisition, freeze, or
admission of DRA-DOC-0015 from OECD-LEGAL-0449, or reconsideration of the
ranking). No further corpus, acquisition, or evaluator work should proceed
until that approval is given.
