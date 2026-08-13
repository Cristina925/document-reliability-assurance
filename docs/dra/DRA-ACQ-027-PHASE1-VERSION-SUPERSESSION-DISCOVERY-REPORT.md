# DRA-ACQ-027 — Phase 1: Version/Supersession Robustness Candidate Discovery for DRA-DOC-0031

**Status:** Phase 1 complete. Qualified candidate selected. No document frozen, admitted, or evaluated. No engineering performed. Phase 2 has not begun.

## 1. Objective

Find and qualify the strongest candidate for DRA-DOC-0031 to test whether DRA can distinguish an `AUTHENTIC_CURRENT` document from an `AUTHENTIC_SUPERSEDED` one — a trust dimension distinct from source authenticity. An old document can be authentic, byte-stable, officially published, cleanly extracted, and internally coherent, and still be unsafe to trust because a newer authoritative version has superseded it.

## 2. Current DRA capability audit (read-only; no code modified)

Direct inspection of `src/model/documents.ts`, `src/benchmark/corpus/schema.ts`, `src/benchmark/acquisition/freeze.ts`, `src/model/proof-receipts.ts`, and `src/authority-resolution/authority-classification.ts` confirms a genuine, end-to-end capability gap:

| Question | Finding |
|---|---|
| Does any field track source-document version/revision (not generator/tooling version)? | `SourceDocument.version` and `CorpusDocumentInput.generatorVersion` exist but are free-form/tooling identifiers with no downstream semantics. |
| Does any field represent superseded/withdrawn/replaced status? | **No.** No such field, enum, or concept exists anywhere in the schema. `freeze.ts` requires a brand-new `corpusDocumentId` for any new version — no lifecycle link between versions is modeled. |
| Does any field carry publication/effective date into evaluation? | `SourceDocument.publishedAt` exists and is structurally available to evaluation input, but no Stage 3 (Authority Resolution) logic reads or compares it. It is a dormant hook, not an active capability. |
| Does `CorpusDocumentInput` carry any date? | **No.** No date field of any kind. |
| Does the six-value authority-classification enum (`DOCUMENT_AUTHOR`, `EXPLICIT_NAMED_SOURCE`, `EXPLICIT_UNNAMED_SOURCE`, `STRUCTURALLY_INHERITED_SOURCE`, `AMBIGUOUS_SOURCE`, `NO_IDENTIFIABLE_SOURCE`) include a temporal/currency value? | **No.** |
| Does an `AUTHORITY_EXPIRED`-equivalent issue class exist? | **No**, anywhere in the issue taxonomy or Stage 6 rule set. |
| Could the architecture represent this in principle? | Yes, but not without a schema/pipeline change. This condition is **currently not producible** by the unmodified pipeline. |

**Conclusion:** an authentic-but-superseded document today produces no distinguishable trust signal anywhere in DRA's output. This confirms the ticket's premise and motivates DRA-DOC-0031's role.

## 3. Candidates investigated

Three publication families were investigated with live, dated verification (2026-08-11):

### 3.1 PRIMARY (QUALIFIED_RECOMMENDED) — NIST SP 800-53 Revision 4 → Revision 5

- **Old:** NIST SP 800-53 Rev. 4 (April 2013, updates as of 2015-01-22), `nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf`.
- **Current:** NIST SP 800-53 Rev. 5 (September 2020) — **already admitted as DRA-DOC-0030** (freeze `DRA-FRZ-000024`, fully evaluated under DRA-ENG-019 with decision REVIEW/1 issue).
- **Supersession evidence:** NIST's own CSRC catalog record for Rev. 4 states "To be withdrawn on September 23, 2021" and "Superseded By: SP 800-53 Rev. 5 (09/23/2020)"; the Rev. 5 record states "Supersedes: SP 800-53 Rev. 4 (01/22/2015)." Explicit, bidirectional, publisher-authored.
- **Self-disclosure:** The Rev. 4 PDF's own text contains **no** withdrawal/obsolescence notice of any kind — supersession is discoverable **only** via NIST's separate catalog page. This is the strongest possible instance of the task's preferred "old document looks perfectly plausible in isolation" design.
- **Material change:** NIST's own published "Summary of Significant Changes" document confirms scope broadened beyond federal-only systems, controls restated as outcome-based, and a new Supply Chain Risk Management (SR) control family added. One internal unchanged-control comparison (publisher-attribution phrasing) is also recorded.
- **Licence:** U.S. Government work, public domain (17 U.S.C. §105) — same basis already accepted for DRA-DOC-0012/0024/0030.
- **Byte stability (measured, 2026-08-11):** two independent GETs of the Rev. 4 PDF returned HTTP 200, identical SHA-256 (`5460dfd6...123b2`), 5,212,362 bytes.
- **Representation decision:** **Option B** — DRA-DOC-0031 = the superseded Rev. 4 document, evaluated against the already-admitted DRA-DOC-0030 (Rev. 5) as its current-version comparison ground truth. No second document is auto-admitted.

### 3.2 ALTERNATE (QUALIFIED_ALTERNATE) — NIST Cybersecurity Framework 1.1 → 2.0

- **Old:** CSF Version 1.1 (2018-04-16), `nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.04162018.pdf`.
- **Current:** CSF 2.0 (NIST CSWP 29, 2024-02-26).
- **Supersession evidence:** NIST's "Framework Development Archive" and its CSF 2.0 FAQ ("Transitioning from CSF v1.1 to CSF v2.0") give an explicit successor relationship and detailed Core-level change mapping.
- **Self-disclosure:** externally discoverable only, same as the primary candidate.
- **Material change:** a new Govern (GV) Function added, governance content moved out of Identify; critical-infrastructure-specific scope dropped in favor of a general-purpose framework — both confirmed by NIST's own FAQ and abstract.
- **Licence:** same public-domain basis as the primary candidate.
- **Byte stability (measured, 2026-08-11):** two independent GETs of the v1.1 PDF returned HTTP 200, identical SHA-256 (`0f3ca796...5fb92`), 1,062,822 bytes.
- **Why alternate, not primary:** requires two fresh acquisitions (no CSF document is yet in the corpus), versus the primary candidate's reuse of the already-admitted and already-evaluated DRA-DOC-0030.

### 3.3 REJECTED — Bank of England / PRA "approach to enforcement" Statement of Policy (September 2021 → January/November 2024)

- **Supersession evidence:** the strongest of all three — the old PDF's own pages are stamped "SUPERSEDED" with a direct link to the replacement.
- **Self-disclosure:** the old version **self-discloses** its own obsolescence in-band — a weaker instance of the task's preferred "plausible in isolation" design than either NIST candidate, though still a valid (if less clean) test.
- **Material change:** confirmed (scope broadened to cover FMI supervision, resolution, Critical Third Parties, following the Financial Services and Markets Act 2023).
- **Rejected on:** licence governance could not be verified. `bankofengland.co.uk/legal/copyright` returned HTTP 404 at verification time; the general `bankofengland.co.uk/legal` page states only that resources are "provided for general reference purposes only" with an accuracy disclaimer — no affirmative reuse permission comparable to the OGL precedents used elsewhere in the corpus. Per negative-result discipline, standards were not lowered given two fully licence-verified NIST candidates were already qualified.

## 4. Ranking

Applied in the task's specified order (explicit supersession ground truth > material semantic change > old version still retrievable > diagnostic clarity > governance certainty > byte/retrieval reproducibility > ability to isolate temporal currentness > experimental tractability):

1. **NIST SP 800-53 Rev. 4 → Rev. 5** — PRIMARY
2. **NIST CSF 1.1 → 2.0** — ALTERNATE
3. **BoE/PRA enforcement SoP** — REJECTED (governance uncertain)

## 5. Recommendation

Admit **NIST SP 800-53 Revision 4** as **DRA-DOC-0031**, paired against the already-frozen and already-evaluated **DRA-DOC-0030** (Revision 5) as its current-version comparison ground truth (representation option B). Proposed Phase 2 scope (not started): acquire/freeze/evaluate DRA-DOC-0031 under existing unmodified governance, compare its evaluation output against DRA-DOC-0030's, and — only if the predicted capability gap is confirmed — document (not build) a candidate future engineering ticket.

## 6. Deliverables

- `lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-027-version-supersession-discovery.ts` — programme context, capability audit, three-candidate register with full governance/supersession/material-change evidence, ranking, and Phase 1 qualification record.
- `lib/dra-reference/src/benchmark/acquisition/discovery/__tests__/dra-acq-027-version-supersession-discovery.test.ts` — 31 passing tests proving the above (no network calls, no evaluator execution).
- This report.

## 7. Explicitly not done (per Phase 1 scope)

No document was frozen, admitted, or evaluated. No version/supersession metadata field was added. Authority resolution was not modified. No `AUTHORITY_EXPIRED`-equivalent issue class was created or activated. Evaluator semantics, issue taxonomy, and the freeze schema are unchanged. Phase 2 has not begun.
