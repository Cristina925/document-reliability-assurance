# Document Reliability Assurance (DRA)

**Status:** Research-stage. First frozen candidate: **DRA-GC-1** (evaluator `0.1.2`, pipeline `1.0`, model/schema `0.1.0`, corpus `DRA-CORPUS-1.0.0`). No external, third-party validation has yet been performed. This repository is a curated publication projection of an internal research repository — see `PUBLIC-REPOSITORY-MANIFEST.md` for provenance details.

## What is DRA?

DRA (Document Reliability Assurance) is a research-stage reference evaluator that assesses whether a document's substantive claims are adequately evidenced and internally consistent. It uses a deterministic, eight-stage evaluation pipeline whose outputs are bound to cryptographically verifiable proof receipts, so any claimed result can be independently re-derived and checked.

## What problem does it address?

Machine- and human-consumed documents often make claims that are unsupported, weakly supported, or internally inconsistent, without any explicit, auditable signal to that effect. DRA formally defines nine reliability issue classes and evaluates documents against them deterministically, producing a decision plus a verifiable evidentiary trail — rather than an opaque, unauditable judgement.

## What is DRA-GC-1?

DRA-GC-1 is the first frozen, publication-candidate state of the evaluator: a specific, hash-identified combination of evaluator version, pipeline version, model/schema version, and development corpus version, frozen so that its behaviour cannot silently drift. Its canonical aggregate digest and full verification procedure are in `docs/dra/DRA-GC-1-FREEZE-RECEIPT.md` and `docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md`.

## What evaluator version is published?

Evaluator `0.1.2`, pipeline `1.0`, model/schema `0.1.0`, development corpus `DRA-CORPUS-1.0.0`. These identities must not drift for this to remain "DRA-GC-1" — see `docs/dra/DRA-PUB-008-CURATED-REPOSITORY-MANIFEST.md`-equivalent verification in the source repository for confirmation that curation did not alter them.

## What has been demonstrated?

DRA-GC-1 currently exercises 3 of its 9 formally defined issue classes (evidence absence, evidence inadequacy, internal claim inconsistency) against a 33-document internal development corpus, plus two internal, pre-registered, contamination-blind generalisation studies:

- **DRA-GEN-001** — 100 documents locked, 75 evaluated, 25 excluded due to external content drift at fetch time.
- **DRA-VAL-002** — a second, targeted 25/25 blind study that closed GEN-001's one open coverage gap (English-language HTML).

See `docs/dra/DRA-PUBLIC-CLAIMS.md` for the exact, publication-controlled statement of every claim this programme makes — treat that file, not this README, as authoritative if the two ever appear to differ.

## What has not been demonstrated?

No external, third-party validation has yet been performed — both blind studies were conducted internally by the same programme that built the evaluator. The other 6 issue classes are proven structurally unreachable by the current implementation, not merely unobserved. A confirmed, disclosed Spanish-language materiality limitation remains unfixed (a proposed fix was rejected on adversarial testing — see `docs/dra/DRA-GC2-REV-001-CANDIDATE-ADMISSION-REVIEW.md`). Non-Latin-script coverage is limited to one Japanese and one Bulgarian document. This system does **not** provide independent validation, production readiness, certification, universal document trust, guaranteed truth detection, or guaranteed real-world safety.

## Where is the paper?

`docs/dra/DRA-PUB-003-MANUSCRIPT.md` (canonical source), with a rendered PDF and standalone HTML at `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf` and `docs/dra/release/DRA-PUB-004-MANUSCRIPT.html`. It covers the problem statement, architecture, development methodology, robustness programme, the GC-1 freeze, both blind studies, the rejected GC-2 candidate, quantitative results, reproducibility, and an explicit, non-boilerplate limitations section.

## How can the evaluator/tests be run?

```
npm install
npm run typecheck
npm test
```

This runs the full test suite, including the freeze-integrity suites that verify DRA-GC-1's, DRA-GEN-001's, and DRA-VAL-002's frozen identities from locally-persisted evidence — no network access required.

## How is reproducibility structured?

Two distinct modes, and they should not be conflated:

- **Mode A (frozen/offline reproducibility, supported):** re-run the persisted evaluator against locally-stored, frozen evidence. This is fully deterministic and requires no network access. `npm test` exercises this mode.
- **Mode B (live/network re-fetch, exploratory only):** re-fetch an original third-party source URL to check for drift since acquisition. This is **not** a guaranteed-reproducible path — live sources can and do change or disappear — and a live-fetch mismatch does not, by itself, indicate a defect in DRA's evidence. See `docs/dra/DRA-REPRODUCIBILITY.md` for the full treatment, including specific documented drift observations.

## What are the key limitations?

See "What has not been demonstrated?" above and, for the complete and authoritative treatment, `docs/dra/DRA-PUBLIC-CLAIMS.md` and the manuscript's Limitations section.

## How is the repository licensed?

- **Software** (`src/`, `scripts/`): MIT — see `LICENSE`.
- **Original DRA research and documentation** (`docs/dra/`, `docs/benchmark/`, this README): Creative Commons Attribution 4.0 International (CC BY 4.0) — see `LICENSE-DOCUMENTATION`.
- **Third-party material**: retains its original licence and is **not** relicensed by DRA under MIT or CC BY 4.0. See `docs/dra/DRA-LICENSING.md` for the complete boundary and `docs/dra/DRA-THIRD-PARTY-LICENSING.md` for a category-level summary.

## How should DRA be cited?

See `CITATION.cff` (root) for machine-readable citation metadata. No DOI has been minted for this release; no external repository URL is asserted until one actually exists.

## What third-party material is intentionally not redistributed?

The vast majority of DRA's corpus and generalisation-study source documents are represented **only** by publisher name, source URL, licence determination, and a SHA-256 digest — never by the underlying document bytes. The sole exception is 25 documents from the DRA-VAL-002 study, individually cleared for redistribution under UK Open Government Licence v3.0 or US federal public domain and included as raw bytes under `src/benchmark/analysis/val-002-phase1/data/raw/`. See `docs/dra/DRA-ATTRIBUTION.md` and `docs/dra/DRA-THIRD-PARTY-LICENSING.md` for the complete breakdown, including material such as a CC BY-ND document for which no raw bytes are or should be persisted anywhere.

## Where are validation records?

`docs/dra/DRA-GEN-001-*` and `docs/dra/DRA-VAL-002-*` for the two blind studies; `docs/dra/DRA-ROB-001-ROBUSTNESS-EVIDENCE-REVIEW.md` and `docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md` for the robustness programme; `docs/dra/DRA-EXTERNAL-REVIEWER-ENTRY.md` for the (currently empty) external-review process.

## Repository structure

- `docs/dra/` — the current, authoritative specifications, protocols, freeze records, study reports, and publication package (79 documents as of this release).
- `docs/benchmark/` — earlier-programme acquisition and benchmark-checkpoint records (still valid provenance for specific corpus documents; superseded in style, not in substance, by `docs/dra/`'s later records).
- `docs/dra-programme-history/` — a superseded, pre-consolidation snapshot of programme documentation, including an abandoned human-reviewer recruitment track (DRA-VAL-001B/C) that was never executed (zero applicants) and was replaced by the automated DRA-GEN-001/DRA-VAL-002 blind studies. Retained for historical transparency only; **not** part of DRA's current evidentiary basis. See that directory's own `README.md`.
- `src/` — the evaluator implementation, acquisition/governance tooling, and full test suite.
  - `model/`, `normalisation/`, `authority-resolution/`, `evidence-linkage/`, `materiality-assessment/`, `pipeline/`, `shared/` — the frozen core evaluator.
  - `benchmark/` — corpus, acquisition, governance, execution, and analysis tooling (not itself frozen; determines *whether* to admit a document, not *how* an admitted one is evaluated).
- `data/` — small locally-cached validation manifests referenced by the analysis tooling.
- `scripts/` — development utility scripts used during acquisition (e.g. live source fetching); not required to run the test suite.

See `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md` and `PUBLIC-REPOSITORY-MANIFEST.md` (this repository's own manifest) for the exact publication treatment of every category of content.

## AI-assistance disclosure

This programme's evaluator implementation, evidence-generation tooling, and publication package were produced with substantial AI assistance under human direction. See the manuscript's "Authorship and AI-assistance disclosure" section for the complete statement. AI assistance is disclosed as a transparency matter only; it does not affect authorship or licensing (see `LICENSE-DOCUMENTATION`).
