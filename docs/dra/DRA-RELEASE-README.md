# DRA — Document Reliability Assurance

**Status:** Research-stage. First frozen candidate: **DRA-GC-1** (evaluator `0.1.2`). Manuscript status: `MANUSCRIPT_SCIENTIFICALLY_READY` (see `DRA-PUB-003A-AUDIT-REPORT.md`). Current publication edition: **DRA-PUB-004** — see `DRA-PUB-004-EDITION.md` and `DRA-PUB-004-REPORT.md`. A publication-quality PDF and standalone HTML rendering of the manuscript are in `docs/dra/release/`.

This is a dedicated release document for the DRA research programme, distinct from this monorepo's root `README.md` (which describes an unrelated, generic workspace template and is not specific to DRA). If you arrived here from the manuscript or citation file, this page is your entry point into the repository.

## What this is

DRA is a research-stage reference evaluator that assesses whether a document's substantive claims are adequately evidenced and internally consistent, using a deterministic, eight-stage pipeline whose outputs are bound to cryptographically verifiable proof receipts. It currently exercises 3 of the 9 issue classes it formally defines (evidence absence, evidence inadequacy, internal claim inconsistency); the other 6 are proven structurally unreachable by the current implementation, not merely unobserved. See `DRA-PUBLIC-CLAIMS.md` for the exact, publication-controlled description of every claim this programme makes — treat that file, not this README, as the authority if the two ever appear to differ.

## Principal evidence

- **DRA-GC-1** — the frozen evaluator candidate. `DRA-GC-1-FREEZE-SPECIFICATION.md` / `DRA-GC-1-FREEZE-RECEIPT.md`.
- **DRA-GEN-001** — an internal, pre-registered, contamination-blind generalisation study (100 locked / 75 evaluated / 25 excluded to external content drift). `DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md`, `DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md`. Note: a rule-of-three arithmetic error in the original GEN-001 reports (≤3.0% instead of the correct ≤4.0% at n=75) is documented and corrected for citation purposes in `DRA-GEN-001-STATISTICAL-ERRATUM.md`; the original reports remain unmodified.
- **DRA-VAL-002** — a second, targeted internal blind study (25/25 evaluated) that closed GEN-001's one open coverage gap. `DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md`, `DRA-VAL-002-ENGLISH-HTML-BLIND-VALIDATION-REPORT.md`.
- **ENG-026 / GC2-REV-001** — a disclosed, unresolved Spanish-language limitation, and a rejected candidate correction, reported as a positive methodological result rather than hidden. `DRA-ENG-026-CROSS-LANGUAGE-STAGE5-MATERIALITY-CLOSURE.md`, `DRA-GC2-REV-001-CANDIDATE-ADMISSION-REVIEW.md`.
- **The manuscript** — `DRA-PUB-003-MANUSCRIPT.md`, the full technical writeup drawing on all of the above.

## Manuscript

Read **`docs/dra/DRA-PUB-003-MANUSCRIPT.md`** for the full technical account: problem statement, architecture, development methodology, robustness programme, GC-1 freeze, both blind studies, the rejected GC-2 candidate, quantitative results (six tables), reproducibility, limitations (explicit, non-boilerplate), implications, and future work.

## Reproduction instructions

Full instructions, including exact commands and expected results, are in **`docs/dra/DRA-REPRODUCIBILITY.md`**. Summary:

1. `pnpm install` at the repository root.
2. `cd lib/dra-reference && npx vitest run <freeze-integrity suite paths>` — reproduces DRA-GC-1's, DRA-GEN-001's, and DRA-VAL-002's frozen identities from locally-persisted evidence, no network required (**Mode A**).
3. Optional: re-fetch original source URLs to check for live drift (**Mode B**) — this may legitimately fail and does not indicate any defect in DRA's evidence; see the reproducibility document's explicit list of live-network tests and known drift observations.

## Repository structure (DRA-specific)

- `docs/dra/` — every specification, protocol, freeze record, study report, and this publication package.
- `lib/dra-reference/src/` — the evaluator implementation, acquisition/governance tooling, and full test suite.
  - `model/`, `normalisation/`, `authority-resolution/`, `evidence-linkage/`, `materiality-assessment/`, `pipeline/`, `shared/` — the frozen core evaluator.
  - `benchmark/` — corpus, acquisition, governance, execution, and analysis tooling (not itself frozen; determines *whether* to admit a document, not *how* an admitted one is evaluated).

See `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md` for the exact publication treatment (include/exclude) of every category of repository content.

## Limitations (summary — see the manuscript for the full, explicit treatment)

No external, third-party validation has yet been performed. Blind evidence covers English and Spanish, PDF and HTML, UK/US/EU public-sector sources. A confirmed, disclosed Spanish-language materiality limitation remains unfixed (a proposed fix was rejected on adversarial testing). Non-Latin script coverage is limited to one Japanese and one Bulgarian document. Live re-fetch of original source URLs is not a reliable reproducibility path — use the frozen, persisted evidence instead.

## Citation

See `docs/dra/DRA-CITATION.cff` for machine-readable citation metadata. No DOI has been minted for this release.

## Licensing

- **Software** (evaluator, pipeline, tooling): MIT, per this repository's `package.json` and root `LICENSE`, unless otherwise indicated.
- **Original DRA research and documentation** (the manuscript, reports, protocols, and this README): Creative Commons Attribution 4.0 International (CC BY 4.0), per the root `LICENSE-DOCUMENTATION`, unless otherwise indicated.
- **Third-party material**: retains its original licence and is not relicensed by DRA under MIT or CC BY 4.0. See `docs/dra/DRA-LICENSING.md` for the complete licensing boundary, `docs/dra/DRA-THIRD-PARTY-LICENSING.md` for a category-level summary, and `docs/dra/DRA-ATTRIBUTION.md` for the complete per-document licence/public-domain breakdown (UK Open Government Licence v3.0 and US federal public domain are the only two bases under which raw third-party bytes are persisted in this repository).

## AI-assistance disclosure

This programme's evaluator implementation, evidence-generation tooling, and this publication package were produced with substantial AI assistance under human direction. See the manuscript's "Authorship and AI-assistance disclosure" section for the complete statement.
