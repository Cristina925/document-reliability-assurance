# DRA-PUB-003 — Publication Manuscript and Public Release Package: Completion Report

## Verdict

**`PUBLICATION_DRAFT_READY_WITH_REMEDIATIONS`**

The manuscript and release package are substantively complete, evidence-grounded, and pass their own claim-boundary audit. The qualifier reflects two pre-existing, disclosed, non-blocking repository residuals (described below) and one packaging decision (root README left untouched) that a human reviewer should explicitly sign off on before external distribution — not any defect discovered in the manuscript's content or in DRA-GC-1 itself.

## Final title

*"Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents"* — five candidate titles were drafted and rejected first (see manuscript, "Rejected title candidates and selection rationale") for overclaiming ("trust infrastructure," "solving," "validated," "universal") or insufficient specificity.

## Word count

6,244 words (`docs/dra/DRA-PUB-003-MANUSCRIPT.md`, measured by `wc -w`; excludes this report and the companion attribution/citation/README files).

## Principal quantitative results reported

- DRA-GC-1: evaluator `0.1.2`, aggregate digest `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`, 63 frozen decision-affecting files, 26/26 freeze-integrity tests.
- Development corpus: 33 documents admitted (`DRA-DOC-0001`–`0032`, `0034`); `DRA-DOC-0033` reserved but never admitted (excluded from all evidence counts).
- Issue-class coverage: 3/9 reachable (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`); 6/9 proven `STRUCTURALLY_UNREACHABLE`.
- DRA-GEN-001: 100 locked / 75 evaluated / 25 excluded (`EXTERNAL_ACQUISITION_FAILURE`); 75/75 operational reliability (Wilson 95% CI [95.1%, 100%]; rule-of-three ≤4.0% at n=75 — see `DRA-GEN-001-STATISTICAL-ERRATUM.md` for the correction of an arithmetic error in the original GEN-001 reports, which stated ≤3.0%); 75/100 acquisition success (Wilson 95% CI [65.7%, 82.5%]); decisions 64 `SUPPORTED` / 10 `HOLD` / 1 `REVIEW`; verdict `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`.
- DRA-VAL-002: 25 locked / 25 evaluated across 2 runs; 100% on all primary endpoints (Wilson 95% CI [86.7%, 100%]); decisions 24 `SUPPORTED` / 1 `REVIEW`; post-hoc drift 15 identical / 7 drifted / 3 unreachable; verdict `DRA_VAL_002_COMPLETE` / `ENGLISH_HTML_GAP_CLOSED`.
- ENG-026/GC2-REV-001: controlled matrix 25/25 English vs 11/25 Spanish Stage 5 accuracy; correction resolved 14/14 divergences on its own matrix but was rejected (`DRA_GC_2_ADMISSION_REJECTED`) after adversarial testing found a new false positive (`"es preciso"`); DRA-GC-1 unchanged, limitation retained and disclosed.
- Robustness programme: 5 defects engineered and closed with regression evidence, 4 representation-boundary limitations disclosed with positive detection evidence, 1 defect partially closed (multi-column, `AMBIGUOUS-REPRESENTATION-LIMITED`), 10-entry known-defect ledger with 0 freeze blockers.
- Total blind evaluation coverage across the programme: 100 documents (75 GEN-001 + 25 VAL-002) under two separately governed, non-pooled protocols.

## Deliverables produced this task

| File | Purpose |
|---|---|
| `docs/dra/DRA-PUB-003-MANUSCRIPT.md` | Full 16-section publication manuscript, abstract, 6 result tables, AI-authorship disclosure |
| `docs/dra/DRA-PUB-003-REPORT.md` | This completion report |
| `docs/dra/DRA-ATTRIBUTION.md` | Full third-party attribution (OGL v3.0 and US public-domain bases for all 25 persisted VAL-002 source files; referenced-only corpus explained) |
| `docs/dra/DRA-CITATION.cff` | Citation File Format v1.2.0 metadata, syntax-validated |
| `docs/dra/DRA-RELEASE-README.md` | Release-facing landing document (dedicated DRA doc; see packaging decision below) |

No pre-existing DRA evidence file (evaluator, corpus, GC-1, GEN-001, ENG-026, GC2-REV-001, VAL-002, or the PUB-001/PUB-002 review chain) was modified. `git status --short` confirms only the five new files above plus the pre-existing input spec attachment were added; nothing was changed or deleted.

## Claim-boundary audit

Ran a targeted search of all new deliverables against `DRA-PUBLIC-CLAIMS.md`'s prohibited-phrase list (`independently validated`, `externally validated`, `proven worldwide`, `solves unreliab*`, `guarantees reliab*`, `production-ready`, `universal*`, `trust infrastructure`, `generalises to unseen documents` unqualified). Every hit found was either (a) inside the "rejected title candidates" section explicitly naming and rejecting the overclaim, (b) a negated statement ("has not yet been... performed," "is not... guaranteed"), or (c) inside the Limitations section explicitly labelling the framing as prospective/not demonstrated. No unqualified overclaim was found or required correction. `docs/dra/DRA-PUBLIC-CLAIMS.md`'s non-merge rule (GEN-001 and VAL-002 must never be pooled into one statistic) and blindness-terminology rule (contamination-blind, not third-party) were both checked and are honoured throughout the manuscript.

## Attribution / licensing status

Complete. All 25 files with persisted raw third-party bytes (the entire DRA-VAL-002 corpus) were previously individually audited in `DRA-PUB-002-PHASE2-REPORT.md` and confirmed `REDISTRIBUTION_VERIFIED`; `DRA-ATTRIBUTION.md` restates that audit as a stand-alone, publication-facing document with the two applicable licence bases (UK OGL v3.0, 17 documents; US federal public domain under 17 U.S.C. §105, 8 documents) and full per-document attribution. Software licence is MIT (`package.json`). The broader referenced-only corpus (33 development-corpus documents plus GEN-001's 100-document sample) requires no redistribution clearance because no third-party document text is persisted for it — confirmed by inspection of the corpus/study data directories.

## Citation-metadata status

`docs/dra/DRA-CITATION.cff` was parsed with `js-yaml` and confirmed syntactically valid CFF v1.2.0. It does not invent a DOI (none has been minted); it identifies the release by its DRA-GC-1 aggregate digest instead, with a pointer to the freeze receipt for independent re-verification.

## AI-authorship disclosure status

Included in the manuscript's dedicated "Authorship and AI-assistance disclosure" section: identifies a human directing principal as responsible for all research decisions and final claims, discloses substantial AI assistance in implementation, evidence generation, and manuscript drafting, names no fabricated human contributors, and does not list any AI system as an author.

## Packaging decision: root README and LICENSE

The repository has no root `README.md` (only a generic, unpopulated monorepo template) and no root `LICENSE` file (license is declared only via `package.json`'s `"license": "MIT"` field). Per the task's own instruction to decide, rather than default, this location: a dedicated `docs/dra/DRA-RELEASE-README.md` was created instead of overwriting the root README, because the root template is a general workspace scaffold unrelated to DRA specifically and this repository is not exclusively a DRA project. **This is flagged as a remediation item for human decision**, not resolved unilaterally: a maintainer should decide whether to (a) leave the root README as the generic template and treat `docs/dra/DRA-RELEASE-README.md` as DRA's own entry point (current state), or (b) populate the root README with DRA-specific content if this repository is intended to present DRA as its primary artefact. No root `LICENSE` file exists; if formal redistribution is intended, a maintainer should add one matching the declared MIT `package.json` license, since `DRA-ATTRIBUTION.md` and the manuscript currently point to `package.json` as the sole license source of record.

## Tests / checks executed

- Re-ran DRA-GC-1, DRA-GEN-001 (all phases), DRA-VAL-002 (all phases), DRA-PUB-001, and DRA-ROB-002's freeze-integrity/evidence-synthesis test suites: **25 test files, 816 tests, all passing**, both confirming evidence integrity and matching the two pre-existing disclosed residuals already on record in `DRA-REPRODUCIBILITY.md` §10 (8 stale-version-literal test failures and 16 TypeScript strictness errors, both confined to non-evaluator modules, unrelated to this task and unchanged by it).
- Verified every internal cross-reference filename cited in the manuscript, attribution file, citation metadata, and release README resolves to an existing file in `docs/dra/`.
- Validated `DRA-CITATION.cff` YAML syntax via `js-yaml`.
- Ran the claim-boundary phrase audit described above.
- Confirmed via `git status --short` that no pre-existing tracked file was modified or deleted; only the five new deliverables (plus the pre-existing task-spec attachment) appear as additions.
- Cross-checked every quantitative figure in the manuscript's Sections 5–12 and Tables 1–6 directly against `DRA-PUB-001-FINAL-EVIDENCE-SYNTHESIS.md`, `DRA-PUB-001-CLAIM-EVIDENCE-MATRIX.md`, `DRA-PUB-001-PUBLICATION-LIMITATIONS.md`, `DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md`'s defect ledger, and `DRA-GC2-REV-001-CANDIDATE-ADMISSION-REVIEW.md`; no discrepancy was found between the manuscript and its cited sources.

## Confirmation of unchanged evidence artefacts

Confirmed. No file under evaluator, corpus, governance, GC-1, GEN-001, ENG-026, GC2-REV-001, or VAL-002 scope was modified, and the DRA-GC-1 aggregate digest was independently re-verified as unchanged via the passing freeze-integrity suite.

## Remaining remediations

1. Human decision on root `README.md` / `LICENSE` placement (see "Packaging decision" above) — not a defect, but requires a maintainer's explicit call before external distribution.
2. The two pre-existing disclosed repository residuals (8 stale-literal test failures, 16 TypeScript strictness errors in non-evaluator modules) remain open; they do not block publication readiness per `DRA-REPRODUCIBILITY.md`'s own classification, but a maintainer may wish to close them before or shortly after release for repository hygiene.
3. No DOI has been minted for this release; obtaining one (e.g. via Zenodo) is optional future work, not a blocker, and `DRA-CITATION.cff` is already structured to accept one without further changes to its shape.

## Recommended next programme

**External, independent validation of DRA-GC-1** — an evaluation conducted by a party outside this research programme, ideally against a sample it selects itself, using its own tooling to verify determinism and proof-receipt integrity. This is the single most significant open item this manuscript identifies (Sections 14 and 16), and closing it is the natural successor programme to DRA-PUB-003.
