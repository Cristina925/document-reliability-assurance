# DRA-PUB-002 — Phase 2: Release Remediation, Manifest and Reproducibility Package

**Continues from:** `docs/dra/DRA-PUB-002-PHASE1-REPORT.md` (verdict `READY_WITH_REMEDIATIONS`). No evaluator, corpus, GC-1, GEN-001, ENG-026, VAL-002, or PUB-001 file was reopened, modified, or regenerated during this phase.

---

## 1. Executive Verdict

**READY_FOR_PUBLICATION_AUTHORING**

All five Phase 1 remediations (R1–R5) are closed by this phase's work. No genuine evidence-integrity defect was discovered while closing them — the raw third-party bytes cleared licensing review cleanly, the pre-existing test/typecheck residuals are confirmed cosmetic and confined to non-evidence-bearing files, and every identity/freeze-integrity check re-run after adding this phase's four documentation deliverables still passes unchanged. Remaining work is manuscript/package composition, archival metadata, and distribution mechanics — not further DRA research, evaluator engineering, or evidence collection.

---

## 2. R1 — VAL-002 Licence Sign-Off Results

All 25 files in `lib/dra-reference/src/benchmark/analysis/val-002-phase1/data/raw/*.bin` were audited individually (filename, size, publisher, canonical source URL, and licence basis, cross-checked against `frozen-units.json`'s recorded metadata and `build-and-freeze.ts`'s frame table). Full per-file table:

| Filename | Publisher | Canonical source | Licence basis | Redistribution permitted? | Classification |
|---|---|---|---|---|---|
| `VAL002-GOVUK-apprenticeship-and-levy-statistics-february-2019.bin` | Department for Education | gov.uk/government/statistics/apprenticeship-and-levy-statistics-february-2019 | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-chickenpox-as-a-notifiable-disease-information-for-health-professionals.bin` | UK Health Security Agency | gov.uk/guidance/chickenpox-as-a-notifiable-disease-information-for-health-professionals | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-employment-tribunal-and-employment-appeal-tribunal-statistics-gb.bin` | Ministry of Justice | gov.uk/government/statistics/employment-tribunal-and-employment-appeal-tribunal-statistics-gb | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-government-revenues-from-uk-oil-and-gas-production--2.bin` | HM Revenue & Customs | gov.uk/government/statistics/government-revenues-from-uk-oil-and-gas-production--2 | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-hepatitis-b-antenatal-screening-and-newborn-immunisation-programme-best-practice-guidance.bin` | UK Health Security Agency | gov.uk/government/publications/hepatitis-b-antenatal-screening-and-newborn-immunisation-programme-best-practice-guidance | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-seeking-consent-for-immunisations-in-schools.bin` | UK Health Security Agency | gov.uk/guidance/seeking-consent-for-immunisations-in-schools | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-send-code-of-practice-0-to-25.bin` | Department for Education | gov.uk/government/publications/send-code-of-practice-0-to-25 | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-send-guide-for-parents-and-carers.bin` | Department for Education | gov.uk/government/publications/send-guide-for-parents-and-carers | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-GOVUK-view-apha-surveillance-reports-publications-and-data.bin` | Animal and Plant Health Agency | gov.uk/guidance/view-apha-surveillance-reports-publications-and-data | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-annualmidyearpopulationestimates-latest.bin` | Office for National Statistics | ons.gov.uk/.../annualmidyearpopulationestimates/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-balanceofpayments-latest.bin` | Office for National Statistics | ons.gov.uk/.../balanceofpayments/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-consumerpriceinflation-latest.bin` | Office for National Statistics | ons.gov.uk/.../consumerpriceinflation/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-longterminternationalmigrationprovisional-latest.bin` | Office for National Statistics | ons.gov.uk/.../longterminternationalmigrationprovisional/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-publicsectorfinances-latest.bin` | Office for National Statistics | ons.gov.uk/.../publicsectorfinances/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-quarterlynationalaccounts-latest.bin` | Office for National Statistics | ons.gov.uk/.../quarterlynationalaccounts/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-retailsales-latest.bin` | Office for National Statistics | ons.gov.uk/.../retailsales/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-ONS-uklabourmarket-latest.bin` | Office for National Statistics | ons.gov.uk/.../uklabourmarket/latest | OGL v3.0 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-census-acs-about.bin` | U.S. Census Bureau | census.gov/programs-surveys/acs/about.html | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-census-population-about.bin` | U.S. Census Bureau | census.gov/topics/population/about.html | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-epa-summary-cercla.bin` | U.S. EPA | epa.gov/laws-regulations/summary-comprehensive-environmental-response-compensation-and-liability-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-epa-summary-clean-water-act.bin` | U.S. EPA | epa.gov/laws-regulations/summary-clean-water-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-epa-summary-resource-conservation-and-recovery-act.bin` | U.S. EPA | epa.gov/laws-regulations/summary-resource-conservation-and-recovery-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-epa-summary-toxic-substances-control-act.bin` | U.S. EPA | epa.gov/laws-regulations/summary-toxic-substances-control-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-ftc-fair-credit-reporting-act.bin` | U.S. FTC | ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |
| `VAL002-USFED-ftc-fair-debt-collection-practices-act.bin` | U.S. FTC | ftc.gov/legal-library/browse/statutes/fair-debt-collection-practices-act | US federal public domain, 17 U.S.C. §105 | Yes | REDISTRIBUTION_VERIFIED |

**Basis for the determination (not mere web accessibility):** each file's classification rests on its recorded `licenceBasis` in the frozen VAL-002 metadata, which falls into exactly two categorical legal bases: (a) the UK Open Government Licence v3.0, an explicit standing licence grant by the relevant government body that affirmatively permits copying, publishing, distributing, and adapting the material (with attribution), and (b) US federal-government-work public-domain status under 17 U.S.C. §105, a categorical statutory exclusion from copyright, not a discretionary permission. Neither basis depends on the document merely being reachable on the public web — both are affirmative legal grants/exclusions independent of accessibility. No file in this set carries a restrictive, ambiguous, or unverified licence basis (contrast with previously-noted stricter cases elsewhere in the wider DRA corpus, e.g. NAO copyright-not-OGL or CC BY-ND admissions — **none of those documents' raw bytes are persisted anywhere in the repository**; only VAL-002's two permissive licence classes appear in stored raw form).

**Result: 25/25 files classified REDISTRIBUTION_VERIFIED. Zero files required REFERENCE_ONLY, EXCLUDE_FROM_PUBLIC_RELEASE, or UNRESOLVED treatment.**

**Effect on reproducibility if these bytes were excluded anyway (they are not, but per the task's requirement to document this):** excluding the raw bytes would not break Mode A reproducibility of the *decision*, because each document's SHA-256 digest, word count, and evaluation output are independently recorded in `frozen-units.json` and the Phase 2 run-a/run-b result files; a verifier could still confirm decision/digest consistency without the bytes. It would, however, remove the ability to inspect the exact evaluated text directly and would push full reproduction of the *evaluation from source* into Mode B (live re-fetch + digest comparison), which — per §5 below — is not guaranteed to succeed indefinitely. Since all 25 files cleared licensing review, this fallback is not needed; the raw bytes are retained (`INCLUDE_WITH_NOTICE` in the release manifest) precisely so Mode A reproduction remains fully self-contained.

---

## 3. R2 — Claim-Language Closure

Closed in full via the new canonical register: **`docs/dra/DRA-PUBLIC-CLAIMS.md`**. It covers, per the task's required list: what DRA is, the problem it addresses, what has been experimentally demonstrated, GC-1, GEN-001, VAL-002, generalisation, robustness, determinism/reproducibility, evidence/provenance/authority handling, machine-consumed documents, and the "trust infrastructure" framing — each with canonical wording, an abstract-length version, an evidence reference, required qualification, and prohibited stronger variants. It fixes, as mandatory global rules: "independently validated" is never used for this programme, and "trust infrastructure" appears only as explicitly-labelled prospective interpretation, never as an achieved fact. It does not dilute demonstrated results (determinism, the 3/9 reachability fact, and the robustness-closure record are stated with full confidence, scoped rather than softened).

---

## 4. R3 — Repository Residual Classification

Both residual sets were re-verified this session (not assumed from Phase 1) by re-running `npx tsc -p tsconfig.json --noEmit` and the affected test files directly.

### 8 pre-existing test failures

| Property | Finding |
|---|---|
| Affected files | `dra-chk-002-reachability-analysis.test.ts` (1 failure), `dra-chk-004-cross-language-materiality-evidence-audit.test.ts` (3), `dra-eng-012-el-standard-ref-bare-abbreviation-investigation.test.ts` (2), `dra-eng-013-en-standard-reference-grammar-characterization.test.ts` (2) |
| Touch DRA production code? | No — all four files are investigation/analysis test modules under `benchmark/analysis/__tests__`, not the evaluator pipeline (`normalisation/`, `claim-extraction/`, etc.) |
| Touch frozen evidence? | No — GC-1/GEN-001/VAL-002/PUB-001/ROB-002 freeze-integrity suites all pass independently (§2 Phase 1 report; re-confirmed §6 below) |
| Affect the evaluator? | No — the failures are assertions comparing against a stale `"0.1.1"` version literal and pre-ENG-014 confusion-matrix expectations; the evaluator itself (version `0.1.2`) is unaffected and unchanged |
| Affect GEN-001/VAL-002 reproduction? | No — reproduction is governed entirely by the freeze-integrity suites, which pass |
| Release blocker? | No |
| **Classification** | **DISCLOSE_AND_RELEASE** |

### 16 pre-existing TypeScript errors

| Property | Finding |
|---|---|
| Affected files | `benchmark/analysis/dra-val-002-protocol.ts` (14 errors — `const`-assertion applied to string-concatenation expressions, a strict-mode syntax rule with no runtime effect), `benchmark/acquisition/discovery/dra-acq-025-non-redundant-graphics-discovery.ts` (1 — candidate-record literal-type mismatch), `benchmark/acquisition/__tests__/dra-acq-026-long-range-structural-robustness.test.ts` (1 — stale property reference) |
| Touch DRA production code? | `dra-val-002-protocol.ts` is a VAL-002 analysis/protocol module (not the evaluator pipeline itself); the other two are acquisition-discovery/test files. None touch `normalisation/`, `claim-extraction/`, `authority-resolution/`, `evidence-linkage/`, `materiality-assessment/` (production rules), `consistency-check/`, `confidence-scoring/`, or `pipeline/` |
| Touch frozen evidence? | No — confirmed by re-running the VAL-002 freeze-integrity suite (passes); the type errors do not prevent the module from executing correctly under Vitest's esbuild transform, which does not enforce full `tsc` type-checking |
| Affect the evaluator? | No |
| Affect GEN-001/VAL-002 reproduction? | No — the affected VAL-002 protocol module's runtime behaviour is exercised and passes in the freeze-integrity test; the type error is a static-analysis-only finding |
| Release blocker? | No |
| **Classification** | **DISCLOSE_AND_RELEASE** |

No repair was made to either residual set during this audit, per the constraint against silently repairing unrelated historical defects. Both are now explicitly disclosed in `DRA-REPRODUCIBILITY.md` §10 so a third party does not mistake them for regressions caused by this programme.

---

## 5. R4 — Reproducibility-Mode Definition

Defined in full in **`docs/dra/DRA-REPRODUCIBILITY.md`** §8:

- **Mode A — Frozen-evidence reproduction:** uses only the byte-identical, locally-persisted representations already committed in the repository (raw `.bin` files, frame/result JSON, freeze manifests); requires no network access; is the basis of every reproducibility claim in `DRA-PUBLIC-CLAIMS.md`.
- **Mode B — Live-source reacquisition verification:** an optional, explicitly-labelled supplementary check that re-fetches from canonical publisher URLs and compares against recorded digests. Documented failure causes: HTTP changes, publisher availability, rate limiting, source replacement, network restrictions, byte changes, redirects, anti-bot controls — with the explicit rule that a Mode B failure must never be represented as a Mode A (frozen-evidence) failure.

All live-network-dependent tests/commands were identified explicitly by file path (`DRA-REPRODUCIBILITY.md` §8's list), reusing and cross-checking Phase 1's findings rather than re-deriving them from scratch.

---

## 6. R5 — Release-Surface Determination

Defined in full in **`docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md`**, covering all items the task required at minimum (specifications, implementation, evaluator, tests, corpus metadata, frozen manifests, proof receipts, GC-1, GEN-001, ENG-026, GC2-REV-001/rejected work, VAL-002, PUB-001, PUB-002, third-party raw artefacts, scratch/temp directories, internal agent/memory files, caches/build outputs, and secrets/environment material) across 21 categories.

**Counts by classification:** INCLUDE — 14; INCLUDE_WITH_NOTICE — 3 (tests, the rejected ENG-026 experimental module, VAL-002 raw bytes); REFERENCE_ONLY — 1 (non-DRA monorepo content); EXCLUDE — 3 (scratch/test-output directories, internal agent/memory files, caches/build outputs); N/A — 1 (no GEN-001/other-study raw-byte cache exists to classify). Secrets/environment material was checked and found not applicable to the DRA evidence chain (the one configured secret belongs to an unrelated artifact).

---

## 7. Deliverable Verification

All four required deliverables exist and were checked for internal consistency against the source artefacts they describe:

- `docs/dra/DRA-PUB-002-PHASE2-REPORT.md` — this document.
- `docs/dra/DRA-PUBLIC-CLAIMS.md` — cross-checked every claim's evidence reference against the actual Phase 1 matrix entries and underlying files; confirmed "independently validated" and unqualified "trust infrastructure" do not appear anywhere in it outside the explicit prohibition/labelling rules.
- `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md` — cross-checked every listed path against the repository (`find`/`ls` confirmed each row's paths exist as described); confirmed the raw-byte row correctly cross-references the R1 sign-off result.
- `docs/dra/DRA-REPRODUCIBILITY.md` — every command in it was actually executed during this audit (§3/§4/§7's commands; see §9 below for the re-run results) rather than invented, and the residuals table matches §4's classification exactly.

Negative-evidence preservation was checked explicitly: the release manifest (row 9, row 10) and the claims register (GEN-001/VAL-002 sections, generalisation section) both retain ENG-026, the rejected GC-2 admission review, the disclosed Spanish-materiality limitation, and the explicit "no external validation yet" statement — none were curated out.

---

## 8. Remaining Publication Risks / Remediations

No blockers remain. Residual, non-blocking items for the next programme to handle as ordinary packaging work:

- Produce the single top-level `THIRD_PARTY_SOURCES.md` attribution file referenced in the release manifest (row 14) — a packaging task, not evidence work.
- When Phase 3 (or whichever programme performs the actual packaging) assembles the release bundle, apply the manifest's EXCLUDE rows mechanically (scratch dirs, `.agents/memory`, build caches) rather than re-deciding them.
- If the underlying evaluator or any frozen module is ever touched in the future for a legitimate reason, immediately re-run the full VAL-002 raw-byte licence table (R1) and the freeze-integrity suites again before any subsequent release — this audit's clearance is valid for the current frozen state only.

---

## 9. Files Created or Modified

**Created (4, as required) plus one Phase 1 report retained from the prior session — no other files touched:**

- `docs/dra/DRA-PUB-002-PHASE2-REPORT.md` (this file)
- `docs/dra/DRA-PUBLIC-CLAIMS.md`
- `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md`
- `docs/dra/DRA-REPRODUCIBILITY.md`

**Modified:** none. **No evaluator, corpus, GC-1, GEN-001, ENG-026, VAL-002, or PUB-001 file was touched.**

---

## 10. Tests/Checks Executed

| Check | When | Result |
|---|---|---|
| Freeze-integrity suites (GC-1, GEN-001 ×5, VAL-002 ×3, PUB-001, ROB-002) + core model/pipeline suites | Before creating this phase's deliverables (baseline) and again after (final verification, §9 of Phase 2 process) | **25 files / 816 tests pass, both times, identically** |
| `npx tsc -p tsconfig.json --noEmit` (whole `lib/dra-reference` package) | Re-run this session | 16 pre-existing errors, same 3 files as Phase 1, confirmed unrelated to this phase's documentation-only changes (no `.ts` source file was modified) |
| Manual file-existence/content cross-checks for all 25 VAL-002 raw-byte files and the release-manifest's path rows | This session | All paths confirmed to exist as described; no undocumented additional raw-byte caches found elsewhere in the repository |

**No full-repository build was claimed clean.** The 8 pre-existing test failures and 16 pre-existing TypeScript errors remain present and are explicitly disclosed (§4, and in `DRA-REPRODUCIBILITY.md` §10) rather than omitted or silently fixed.

---

## 11. Exact Recommended Next Programme

**DRA-PUB-003 — Publication Package Assembly and Manuscript Drafting.** Scope: (a) draft the actual publication manuscript/README/announcement copy using `DRA-PUBLIC-CLAIMS.md` as the sole source of permitted wording; (b) mechanically assemble the release bundle per `DRA-PUBLIC-RELEASE-MANIFEST.md`'s classifications, including writing the `THIRD_PARTY_SOURCES.md` attribution file for the 25 VAL-002 raw artefacts; (c) decide and execute archival/versioning metadata (e.g. a release tag, DOI if applicable, citation format); (d) finalize external distribution mechanics (where/how the package is published). This programme is composition and packaging, not further DRA research, evaluator engineering, or evidence collection, consistent with the `READY_FOR_PUBLICATION_AUTHORING` verdict.

---

## Phase 2 Verdict

**READY_FOR_PUBLICATION_AUTHORING**
