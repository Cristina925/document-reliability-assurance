# DRA-GEN-001 Phase 1 — Blind Sample Lock Receipt

**Verdict: `DRA_GEN_001_BLIND_SAMPLE_LOCKED`**

| Field | Value |
|---|---|
| Sample ID | `DRA-GEN-001-PHASE-1-SAMPLE-000001` |
| Lock timestamp | `2026-08-12T00:00:00.000Z` |
| Bound protocol digest | `GEN001_PROTOCOL_AGGREGATE_DIGEST` (see `dra-gen-001-freeze-manifest.ts`) |
| Frame construction date | `2026-08-12` |
| Raw frame size | 1,917 candidates |
| Eligible frame size | 1,288 candidates |
| Primary sample size | 100 (25 × 4 hard strata) |
| Replacements used | 7 (all `GOVERNANCE_INELIGIBLE` word-count floor, all pre-freeze) |
| Sample aggregate digest | `GEN001_SAMPLE_AGGREGATE_DIGEST` (see `dra-gen-001-sample-manifest.ts`) |

## Frame sources (Programme Section B2)

Three authoritative, machine-readable, publicly documented publisher APIs, each queried by a
fixed deterministic rule recorded in `build-sample.ts` *before* any candidate was inspected:

1. **US Federal Register API** (`federalregister.gov/api/v1/documents.json`) — `type=RULE`,
   `order=newest`, 2 pages × 100 → 200 raw candidates → stratum `PDF_ENGLISH`.
2. **GOV.UK Content Search API** (`www.gov.uk/api/search.json`) — `filter_format=guidance`,
   `order=-public_timestamp`, 200 raw candidates → stratum `HTML_ENGLISH`.
3. **Spanish BOE Open Data API** (`boe.es/datosabiertos/api/boe/sumario`) — the 8 most recent
   business days before the frame-construction date, 1,517 raw candidates, split by a
   deterministic even/odd parity rule on discovery order into `PDF_NON_ENGLISH` (PDF
   representation) and `HTML_NON_ENGLISH` (HTML representation of a *different* set of
   publications — no publication ever appears as a candidate in both sub-strata).

No convenience substitution occurred: all three sources were fixed before any candidate document
was examined, and no source was swapped after the frame or its yield was observed.

## Contamination exclusion (Programme Section B3)

Checked against: 33 development-corpus document IDs, `DRA-DOC-0033` (excluded/unadmitted), all
143 considered-candidate URLs, and all 78 considered-candidate IDs from the frozen Phase 0
registry — plus an in-frame duplicate-publication-family guard. **Result: 0 exclusions matched.**
This is expected and was not assumed in advance: the three sources draw exclusively from
publications dated within days of 2026-08-12, while every prior DRA acquisition (Phase 0's
considered-candidate registry and the 33-document development corpus) was built from material
acquired in 2023–2025. The exclusion pass ran in full regardless, and the test suite verifies zero
overlap directly against the live registry rather than assuming it.

## Eligibility criteria applied without DRA/GC-1 output (Programme Section B4)

Applied purely on document/source metadata and extractable text, never on GC-1 behaviour:

- **E2 (licence)** — public-domain (US federal government work, 17 U.S.C. § 105) for
  `PDF_ENGLISH`; Open Government Licence v3.0 (gov.uk default) for `HTML_ENGLISH`; statutory
  reuse conditions under Spain's Ley 37/2007, per BOE's general reuse licence (Resolución of 27
  June 2024), for both non-English strata.
- **E5 (≥500 extractable words)** — verified by real fetch + extraction (`pdftotext -layout` for
  PDF, tag-stripping for HTML) at freeze time for every selected unit; a structural page-span
  proxy (BOE-only, ≥2 pages) was additionally applied at the metadata stage after early testing
  showed many single-page BOE personnel notices are far too short — this is the *same* E5
  criterion applied with an available non-content structural signal, not a new or
  content-sensitive criterion.
- **E6 (identity)**, **E8 (2011–2026 date window)**, **E4 (reachable without login)** — verified
  directly; every unit fetched successfully with a real HTTP 200 and non-empty body.
- **E9 (validated language)** — English (`en`) or Spanish (`es`), both in GC-1's carried-forward
  validated-language set.
- **E10 (deduplication)** — enforced per stratum on publication family id.

No candidate's eligibility, inclusion, or exclusion was ever decided by running GC-1 or by any
DRA output. GC-1 was never invoked at any point in Phase 1.

## Strata, allocation, and randomisation (Programme Section B5/B6)

The 4 hard strata frozen in Phase 0 — `PDF_ENGLISH`, `PDF_NON_ENGLISH`, `HTML_ENGLISH`,
`HTML_NON_ENGLISH` — each received exactly 25 units (100 total), matching the frozen equal
allocation exactly.

Randomisation: a seeded mulberry32 PRNG, seeded from `SHA-256("DRA-GEN-001:PHASE-1:SAMPLE-
SELECTION-SEED:v1")` (first 4 bytes, big-endian), XORed per stratum with a hash of the stratum id
so the four strata draw independently from one documented root seed. Each stratum's eligible
frame (sorted deterministically by frame id before shuffling, to remove any incidental API
ordering) was Fisher–Yates shuffled once; the first 25 became the primary draw, the next 25 the
reserve order. No re-rolling occurred at any point.

## Replacements (Programme Section B7 / Section 11 compliance)

7 of the 100 primary draws were replaced, all for the single permitted reason class,
**pre-evaluation governance ineligibility** — specifically, extracted word count below the 500-word
floor once the actual document was fetched (word counts observed: 396, 355, 320, 436, 354, 476,
487 — all short BOE personnel/appointment notices that the page-span proxy did not catch). Every
replacement is logged with its original frame id, reason, and the specific reserve unit that
replaced it; **no original draw record was deleted**. No replacement was made, or would have been
permitted, for DRA crashing, poor representation, HOLD/REVIEW decisions, issue classes, known
limitations, or new defects — no such signal exists anywhere in this pipeline, since GC-1 was
never run.

## Source freezing (Programme Section B8/B9)

All 100 final units were fetched for real (live HTTP), and for each: SHA-256 of the raw bytes,
byte length, extracted word count, publisher, publication date, media type, language, licence
basis, and fetch timestamp were recorded in `frozen-units.json`. **The evaluator was never
invoked.** Total corpus size: 100 documents, ~15.4 MB of raw source bytes, 50 English + 50
Spanish.

## Sample manifest and digest binding (Programme Section B10)

`dra-gen-001-sample-manifest.ts` is a machine-readable, digest-bound manifest: it binds the sample
id, the frozen protocol's aggregate digest, the seed and seed-derivation rule, the raw- and
eligible-frame digests, every unit's `(frameId, stratumId, sha256, byteLength)`, and the full
replacement log, into one canonicalised, SHA-256-hashed aggregate (`GEN001_SAMPLE_AGGREGATE_DIGEST`).
Changing any bound value changes this digest (verified by the integrity test suite). The original
raw frame, the excluded/ineligible logs, and the full 100-unit frozen record are preserved as
source-of-truth JSON files alongside the manifest module — no intermediate artefact was discarded.

## Mandatory integrity tests (Programme Section B11)

26 tests in `dra-gen-001-sample-lock-integrity.test.ts`, all passing, covering: exact 100-unit /
25-per-stratum allocation; no duplicate publication families; universal ≥500-word governance
floor; well-formed and non-colliding SHA-256 per unit; non-empty licence basis per unit;
preserved (never deleted) original-draw/replacement history with no DRA-performance reason ever
appearing in a replacement log entry; **an explicit structural guard proving no evaluator-output
field (decision/issue/confidence/receipt/materiality/claim/evidence/stage) exists on any frozen
unit, both via a semantic check and a literal field-enumeration check**; zero considered-candidate
URL overlap; correct protocol-digest binding; deterministic and change-sensitive aggregate sample
digest; and the final lock verdict computing to `DRA_GEN_001_BLIND_SAMPLE_LOCKED` with an empty
failed-checks list.

## Files created

- `lib/dra-reference/src/benchmark/analysis/gen-001-phase1/build-sample.ts` (frame construction +
  selection script)
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase1/freeze-selection.ts` (source freezing +
  replacement resolution script)
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase1/dra-gen-001-sample-manifest.ts` (digest-
  bound manifest module)
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase1/data/*.json` (frozen units, replacement
  log, selection summary, excluded/ineligible logs — full audit trail)
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase1/__tests__/dra-gen-001-sample-lock-integrity.test.ts`
- `docs/dra/DRA-GEN-001-PHASE-1-SAMPLE-LOCK-RECEIPT.md` (this document)

No GC-1 evaluator code, no DRA-GC-1 freeze, and no Phase 0 protocol file was modified or invoked.

## Phase 2 — explicitly not started

Per Programme Part C, this lock is a stopping point. No unit in the sample has been evaluated, no
decision has been produced or inspected, no issue class has been observed, and no frozen artefact
(GC-1, the protocol, the strata, the endpoints) was changed based on this sample's contents. Phase
2 (frozen-candidate blind execution) is a future, separate programme.
