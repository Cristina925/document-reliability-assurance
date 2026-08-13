# DRA-GC-1 — Freeze Receipt

| Field | Value |
|---|---|
| Candidate identifier | `DRA-GC-1` |
| Status | **FROZEN** |
| Freeze timestamp | `2026-08-12T00:00:00.000Z` |
| Repository commit | `21e0e6a11452754a7aa258d799226553f3cb1d38` |
| Canonical aggregate digest | `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` |
| Evaluator version | `0.1.2` |
| Pipeline version | `1.0` |
| Model/schema version | `0.1.0` |
| Corpus version | `DRA-CORPUS-1.0.0` |
| Frozen decision-affecting files | 63 (54 core evaluator + 9 acquisition-representation) |
| Freeze authority | DRA-ROB-002, verdict `READY_FOR_DRA_GC_1_FREEZE` |
| Accepted limitations carried forward | 10 ledger entries (D1–D10), 0 `FREEZE_BLOCKER` |
| Development-corpus size (excluded from future blind tests) | 33 documents (`DRA-DOC-0001`–`0032`, `0034`) |
| Unadmitted, explicitly excluded | `DRA-DOC-0033` (external acquisition block, not part of GC-1) |
| Freeze specification | `docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md` |
| Freeze manifest (machine-verifiable) | `lib/dra-reference/src/benchmark/analysis/dra-gc-1-freeze-manifest.ts` |
| Freeze-integrity test suite | `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gc-1-freeze-integrity.test.ts` |

## What this receipt certifies

DRA-GC-1 — the specific evaluator (`0.1.2`), pipeline (`1.0`), data model (`0.1.0`), and 63-file
decision-affecting implementation set reviewed by DRA-ROB-002 — is now an immutable, digest-bound,
machine-verifiable frozen baseline. No decision-affecting engineering was performed as part of this
freeze; every value recorded above was read from, or computed from, the live repository at freeze
time, not asserted from prose.

## Frozen component classification (Section 2 of the freeze specification)

- **Core evaluator (54 files):** `model/`, `normalisation/`, `authority-resolution/`,
  `evidence-linkage/`, `materiality-assessment/`, `pipeline/`, `shared/` (production sources only).
- **Acquisition representation (9 files):** the components that determine what text reaches the
  evaluator — `normalisation.ts`, `media-type-detection.ts`, `column-layout-reconstruction.ts`,
  `pdf-layout-prober.ts`, `currentness.ts`, `currentness-integrity.ts`, `freeze.ts`,
  `representation-integrity.ts`, `representation-provenance.ts`, all under
  `benchmark/acquisition/`.
- **Explicitly excluded as non-decision-affecting** (documented with rationale in the manifest's
  `NON_FROZEN_CATEGORIES` export): corpus governance/admission workflow (determines *whether* to
  admit a document, not *how* an admitted one is evaluated), network-fetch mechanics, the
  ENG-018 graphical-semantic-risk module (independently documented as decoupled from the frozen
  pipeline), and all benchmark-programme tooling (`corpus/`, `evidence/`, `execution/`,
  `analysis/`) plus all test/fixture content anywhere.

## Verification performed

1. **Pre-freeze drift check:** `git log`/`git status` confirmed the repository was still at the
   exact commit DRA-ROB-002 reviewed, with no intervening code changes.
2. **Freeze-integrity test suite:** 26/26 passing — covers manifest identity/completeness,
   identifier correspondence with live `model/versions.ts` and
   `benchmark/governance/version.ts` constants, deterministic canonicalisation, an independently
   re-implemented digest cross-check, tampering detection (synthetic mutation of both a file digest
   and a version identifier), live re-hash equality for all 63 frozen files, and referencing (not
   restating) ROB-002's ledger and development-corpus set.
3. **ROB-002 regression suite:** `dra-rob-002-freeze-readiness-review.test.ts`, 14/14 passing,
   confirming the zero-`FREEZE_BLOCKER` ledger and `READY_FOR_DRA_GC_1_FREEZE` verdict are still
   current.
4. **`npx tsc --noEmit`:** reproduced exactly the 2 pre-existing, unrelated type errors already
   disclosed in DRA-ROB-002 Section 8 (one in `dra-acq-026` test assertions, one in the
   `dra-acq-025` discovery candidate-record typing) — no new type errors.
5. **`npx vitest run src/benchmark/acquisition`:** reproduced the 22 pre-existing, documented
   `DRA_EVALUATOR_VERSION` stale-assertion failures, plus additional failures in a small number of
   tests that perform *live re-fetches* of external documents at test-run time (e.g.
   `dra-acq-002-code-variation-check`, `dra-acq-006`, `dra-acq-011`, `dra-acq-013`–`017`,
   `dra-acq-021`, `dra-acq-026`, `dra-acq-029`, `dra-bmk-010`, `dra-doc-0008`, `dra-eval-002`,
   `dra-ops-001`, `dra-val-002`). Inspection of the failure output showed byte-level and
   text-digest drift between the fetched-at-test-time content and each test's frozen reference
   baseline (e.g. Code's HTML source changing between the original admission and this run) — an
   already-documented, environment/time-dependent instability class specific to *live-network*
   acquisition tests, unconnected to any file in the frozen set (verified separately by the
   file-level byte-identity check in item 2 above). No new decision-affecting failure was found in
   any file that is part of DRA-GC-1's frozen 63-file set.

## Explicit statement on engineering scope

No evaluator behaviour, issue definition, decision threshold, normalisation/segmentation logic,
evidence-linkage logic, materiality logic, or layout-reconstruction logic was changed, tuned, or
"improved" as part of this freeze. CHK-005 was not fixed. No new language support was added. No
multi-column reconstruction change was made. No new document was acquired. DRA-DOC-0033 was not
retried. No historical benchmark result was altered. No ROB-002 limitation was redefined, softened,
or removed. `DRA-GEN-001` was not selected, designed, or executed.

## Files created or modified by this freeze

- **Created:** `lib/dra-reference/src/benchmark/analysis/dra-gc-1-freeze-manifest.ts`
- **Created:** `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gc-1-freeze-integrity.test.ts`
- **Created:** `docs/dra/DRA-GC-1-FREEZE-RECEIPT.md` (this file)
- **Modified (draft → executed):** `docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md`

No file inside the frozen 63-file set, and no historical DRA-ROB-002/ROB-001 evidence file, was
modified.

## Final verdict

**`DRA_GC_1_FROZEN`**
