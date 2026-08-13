# DRA-ACQ-030 Phase 2 — Multi-Column Baseline Admission and Materiality Experiment

**Status:** Experiment complete. **No corpus admission performed** (sequence-blocked — see §1).
No production code modified. No DRA-ROB-002 document created. Phase 1 evidence untouched.

**Candidate:** Federal Register, Vol. 89 No. 4, Friday, January 5, 2024 — FR Doc. 2024-00001
granule (pp. 824–825, a 2-page, 3-column "Notices" excerpt from the full daily issue examined
in Phase 1).

**Reserved identifiers this programme does not touch:** `DRA-DOC-0033`, `DRA-FRZ-000027`,
`DRA-ACQ-000036` (still allocated to the blocked DRA-ACQ-029 Hindi baseline experiment).

---

## 1. Sequencing constraint and its resolution

The task specification requires verifying, not assuming, whether `DRA-DOC-0033` is admitted
before any DRA-DOC-0034 corpus admission is attempted, and forbids silently violating or
silently obeying the "must follow 0033" convention without stating it.

**Live re-verification performed this session:** the committed admission test
`dra-acq-029-doc0033-hindi-admission.test.ts` was executed live (not just read). It **fails
today** with an HTTP 429 from eLegalix on both of its live re-fetch calls — the same
persistent rate-limit block recorded in DRA-ACQ-029's own evidence. The test file's presence
in the repository does **not** mean DRA-DOC-0033 is admitted; no code path has ever
successfully completed its acquisition. `DRA-ROB-001`'s existing status line
(`DRA-ACQ-029 Phase 2 — BLOCKED_PENDING_LIVE_SOURCE_REACQUISITION`) is confirmed accurate as of
2026-08-11.

**Code-level check:** `CorpusRegistry.add()` (`lib/dra-reference/src/benchmark/corpus/registry.ts`)
only rejects duplicate corpus IDs and duplicate digests. There is no technical/sequential-ID
gate in code — the "0033 before 0034" rule is a documentation/programme convention (every
acquisition test independently reconstructs the full prior-entries chain in strict order), not
an enforced invariant.

**Resolution:** because the convention is real (even if unenforced in code) and the task
explicitly forbids "manufacturing corpus continuity," this experiment does **not** call
`integrateWithCorpus()` and does **not** allocate a `DRA-DOC-0034` / `DRA-FRZ` / `DRA-ACQ`
identifier. It runs `evaluateDocument()` directly — the same function
`acquireFreezeAndEvaluate()` wraps internally — against the candidate text, with no registry
mutation.

**Sequencing status:** `PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE`.

---

## 2. Governance re-verification

- **Official source:** `https://www.govinfo.gov/content/pkg/FR-2024-01-05/pdf/2024-00001.pdf`
  — GovInfo is the U.S. Government Publishing Office's official portal for Federal Register
  content; the same domain basis already used precedentially for other US federal acquisitions
  (NIST, FDA, EIA/STEO, CRS) in this corpus.
- **Licence basis:** `PUBLIC_DOMAIN` under 17 U.S.C. §105 (federal government works are not
  subject to copyright in the United States). This is the identical statutory basis relied on
  for DRA-DOC-0013 (FDA), DRA-DOC-0024 (CRS), DRA-DOC-0025 (EIA/STEO), and others.
- **Third-party material check:** the granule is a set of official agency notices (SBA licence
  surrender orders, an SSA Privacy Act system-of-records notice, a State Department notice)
  authored directly by the issuing federal agencies for publication in the Federal Register.
  No third-party submissions, quoted external copyrighted works, or licensed images appear in
  this granule.
- **DRA usage permissions:** public-domain status grants unrestricted reproduction, excerption,
  and redistribution for the purposes of this evaluation programme; no additional permission is
  required.
- **Note on JS-rendered policy pages:** GovInfo's `/help/faq` and `/about/legal-notice` pages
  render via JavaScript and could not be scraped directly via `curl`. This is disclosed rather
  than glossed over; the public-domain conclusion rests on the well-established statutory basis
  for US federal government works, not on scraping those pages.

**Governance verdict:** VERIFIED (consistent with existing corpus precedent for US federal
works).

---

## 3. Source stability re-verification (live, this session)

The granule PDF was fetched live, independently, twice:

| Fetch | Status | Bytes | SHA-256 |
|---|---|---|---|
| Fetch 1 | 200 | 182,409 | `038eb623d296b5701d31fad6cfa4ade9121eef9a5f25f95b65b6ec2aec589329` |
| Fetch 2 | 200 | 182,409 | `038eb623d296b5701d31fad6cfa4ade9121eef9a5f25f95b65b6ec2aec589329` |

Both digests are identical to each other **and** to the Phase 1 reconnaissance copy
(`fr1.pdf`, never modified). **Classification: BYTE_STABLE.** This confirms the artifact used
for Phase 2 is the exact same bytes Phase 1 examined, not a re-crawled or re-published variant.

This re-verification is now encoded as a live test
(`dra-acq-030-phase2-multicolumn-materiality-experiment.test.ts`, "live source stability
re-verification" describe block) rather than only a one-off shell check, so it can be
re-executed by anyone reviewing this experiment.

---

## 4. Oracle preservation

Phase 1's discovery evidence (`DRA-ACQ-030-MULTICOLUMN-LAYOUT-DISCOVERY-PHASE1-REPORT.md`) is
**unmodified** by this programme. No file under that report's evidence trail was altered. All
new artifacts in this phase are additive: a new report (this file), a new test file, and one
new fixture, none of which touch Phase 1's outputs.

---

## 5. Admission decision

Per §1, no corpus admission was performed. Classification:
**`PHASE2_EXECUTED_ADMISSION_PENDING_SEQUENCE`.**

The candidate is evaluated directly and repeatably via `evaluateDocument()`, with all
identifiers, digests, and results recorded as fixed reference constants in the committed test
file — equivalent evidentiary rigor to a formal admission, without registering a corpus entry
out of sequence.

---

## 6. Production extraction and segmentation — raw measurements

Extraction used the exact same production convention as the rest of this corpus:
`pdftotext -layout`, wrapped through `normaliseContent()`.

| Metric | Value |
|---|---|
| Pages | 2 |
| Raw extracted characters (`pdftotext -layout`) | 34,276 |
| Normalised text SHA-256 | `9e004998ba5bc352894da9d37a1aa3600a09df35463b8c6bf1f6cea204c2729a` |
| Analysis-only corrected-order text characters | 10,305 |
| Corrected-order text SHA-256 | `f872e9fe74e3b814715cccf5f2f664452ea43c385410cb8deb5cf9af2bd1e115` |

The ~3.3× character-count gap between production and corrected-order text is **not** missing
content — it is `-layout` mode's column-position whitespace padding (each line padded out to
its column's horizontal slot). A content-level check (§7) confirms no paragraph text is
duplicated or dropped between the two representations; only order and padding differ.

**Stage 2 (claim/statement segmentation) counts, per evaluator run (§8):**

| Representation | Statement count |
|---|---|
| Production order (Run A) | 217 |
| Corrected order (Run B) | 328 |

---

## 7. Named defect-category counts (Federal Register granule, this experiment)

Pair-level analysis: every adjacent pair in the corrected ("truth") reading order was checked
against its position in the production reading order, per page, using PDF word/block bounding
boxes (`pdftotext -bbox-layout`) clustered into 3 columns by x-position.

| Page | Truth-order adjacent pairs | Preserved | Inverted | Interleaved |
|---|---|---|---|---|
| 1 | 47 | 15 (32%) | 9 (19%) | 23 (49%) |
| 2 | 56 | 16 (29%) | 6 (11%) | 34 (61%) |
| **Total** | **103** | **31 (30%)** | **15 (15%)** | **57 (55%)** |

Mapped onto the five required named categories:

| Category | Count (this granule) | Evidence |
|---|---|---|
| **COLUMN_INTERLEAVING** | 57 of 103 truth-order pairs (55%) | Blocks from a different column inserted between two blocks that belong together; e.g. "under the Small Business Investment Company License..." is separated from its own continuation "Bailey DeVries, Associate Administrator..." by an unrelated column-1 block in production order. |
| **HEADING_BODY_MISORDER** | 2 confirmed instances (of 5 all-caps section headings inspected) | (a) "SOCIAL SECURITY ADMINISTRATION" heading (p.1) is immediately followed, in production order, by an unrelated column-1 sentence — its own "AGENCY: Social Security Administration" body line is displaced two positions later. (b) "DEPARTMENT OF STATE" heading (p.2) is immediately followed by an unrelated column-1 sentence rather than its own body. One heading inspected ("SMALL BUSINESS ADMINISTRATION") was **not** misordered — its body followed correctly, because that stretch of column 0 had no competing column content at that y-range. |
| **COLUMN_ORDER_REVERSAL** | 15 of 103 pairs (15%) | Pairs where the truth-order successor appears at an *earlier* position in production order than its predecessor (a genuine order inversion, distinct from interleaving). |
| **COLUMN_TRANSITION_LOSS** | 4 of 4 column-transition pairs (100%) | Every truth-order pair that crosses a column boundary (2 per page × 2 pages = 4) fails to remain adjacent in production order — production's reading-order algorithm never cleanly hands off from one column to the next in this granule. |
| **PAGE_STREAM_CORRUPTION** | 0 (measured, not assumed) | Per-page footer stamps (`VerDate Sep<11>2014 ... Jkt 262001 ... Frm 00078/00079 ...`) appear exactly once per page, correctly scoped to their own page, with no duplication or bleed across the page boundary in this 2-page granule. Reported as zero per the task's explicit instruction to report every category "even if zero." |

**Duplication/loss check (explicitly required, §6/§7):** a block-level frequency count found only
*legitimate* repeated content — e.g. "BILLING CODE P" appears twice because two independent SBA
notices both end with that exact phrase, and table row labels ("No. 5", "No. 6" …) repeat
because they are genuine repeated table values on page 2. **No extraction-artifact duplication
or content loss was found**; the corrected-order text is a pure reordering of the same
paragraph units pdftotext produced, not a re-derivation with different content.

---

## 8. Evaluator Run A / Run B (determinism and baseline)

`evaluateDocument()` was called directly (bypassing the corpus-mutating governed pipeline) on
the production-order text, twice, to check determinism, then once on the analysis-only
corrected-order text.

| Run | Input | Statement count | Decision | Issues | Proof-receipt substantive digest |
|---|---|---|---|---|---|
| A (1st call) | Production order | 217 | SUPPORTED | 0 | `3d8898b641814566008580ad688056dcb7ba436f3b215ac30e68aa0923a95b90` |
| A (2nd call) | Production order (identical input) | 217 | SUPPORTED | 0 | `3d8898b641814566008580ad688056dcb7ba436f3b215ac30e68aa0923a95b90` |
| B | Corrected order (analysis-only) | 328 | SUPPORTED | 0 | `3c7d0466746b47dc2209c1718b95c7783b88dbb9e5b3ba27b13eb5a52f204696` |

Run A's two calls on identical input produced an **identical** substantive digest —
**DETERMINISTIC**. Run A vs Run B necessarily differ in digest (different input text), which is
expected and not itself evidence of nondeterminism.

**Materiality assessment (Stage 5) classification counts:**

| Level | Run A (production) | Run B (corrected) |
|---|---|---|
| CRITICAL | 0 | 0 |
| HIGH | 1 | 1 |
| MODERATE | 1 | 1 |
| LOW | 0 | 0 |
| INFORMATIONAL | 96 | 188 |
| UNDETERMINED | 119 | 138 |

**Confidence (Stage 7):** CONFIRMED 1 / PARTIAL 216 (Run A) vs CONFIRMED 1 / PARTIAL 327 (Run B).

All values above are pinned as reference constants in the committed test and re-verified on
every test run — this table is reproducible, not a one-off transcript.

---

## 9. Analysis-only corrected-order counterfactual — construction method

Built from `pdftotext -bbox-layout` word/line bounding boxes per page:

1. Parsed every `<block>` element's `xMin`/`yMin` and constituent words.
2. Clustered blocks into 3 columns by `xMin` threshold (col 0 < 205pt, col 1 < 385pt, col 2 ≥
   385pt — calibrated from a histogram of block `xMin` values on this granule).
3. Sorted blocks within each column by vertical position (`yMin`).
4. Concatenated columns in reading order (col 0 → col 1 → col 2) per page, pages in document
   order.

This reconstructs the semantically correct reading order (verified by manual inspection — e.g.
the SBA license-surrender notice now reads start-to-finish before the SSA notice's heading and
body appear together, uninterrupted) using **only reordering of pdftotext's own extracted text
blocks** — no paraphrasing, no text alteration, no content invented. The fixture is stored at
`lib/dra-reference/src/benchmark/acquisition/__tests__/fixtures/dra-acq-030-fr-2024-00001-corrected-order.txt`,
carries an explicit `ANALYSIS-ONLY` header identifying it as non-production, and is never
imported by any production code path (only by this experiment's test file).

---

## 10–11. Full-pipeline comparison and multi-column robustness verdict

Both runs converge on the **same final decision** (SUPPORTED, 0 issues) — but diverge
substantially in the structural evidence the evaluator builds along the way:

- Stage 2 statement count: **217 vs 328** (≈51% more statements from the same source content,
  purely because the corrected ordering groups sentence fragments differently than the
  production ordering's mid-sentence column interruptions do).
- Stage 3 authority-record count and Stage 4 evidence-record count track the statement count
  1:1 in this evaluator version, so the divergence propagates through both stages.
- Stage 5 materiality classification distribution shifts materially (INFORMATIONAL 96→188,
  UNDETERMINED 119→138) — not just a relabeling, a genuinely different distribution of how much
  evidence the evaluator judges informational vs. undetermined.

Per the task's own definitions (§11), "evaluator materiality" is explicitly **not** limited to
whether the final decision changes — it includes whether the evaluator's *substantive downstream
properties* (statement formation, evidence linkage, authority resolution, materiality
distribution) are measurably altered. On that definition, this granule shows a real, measured,
non-trivial divergence, even though the specific final decision (SUPPORTED/0 issues) happens not
to flip on this document.

**Two axis verdicts (kept separate, not conflated):**

- **Reading-order preservation: `NOT_PRESERVED`.** 55% of truth-order pairs are interleaved,
  15% inverted, and 100% of column-transition pairs fail to remain adjacent.
- **Evaluator materiality: `MATERIAL`.** Statement/authority/evidence-record formation and the
  materiality-classification distribution are substantially and measurably altered (≈51% more
  statements; a near-doubling of INFORMATIONAL-classified evidence), even though the specific
  final decision on this document is unaffected. The final-decision coincidence should not be
  read as "no consequence" — the underlying evidence structure the evaluator built to reach that
  decision is materially different between the two orderings.

**Multi-column robustness verdict: `MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL`.**

---

## 12. Explicit non-conflation statement

This report deliberately reports reading-order preservation and evaluator materiality as two
separate axes (§10–11), because they can diverge independently: a document could have severely
corrupted reading order with no downstream consequence (`NONMATERIAL`), or subtly corrupted
order with large downstream consequence. On this granule, both axes point the same direction —
badly corrupted order *and* material downstream consequence — but that alignment is a finding
about this specific document, not a proof that the two axes always move together.

---

## 13. Defect localisation

- **Source PDF:** contains no reading-order metadata beyond raw text-run positions; this is
  standard for PDF (a page-description format, not a semantic-order format).
- **pdftotext (`-layout` and default mode):** both exhibit the same interleaving — the tool's
  own column-reconstruction heuristic groups by approximate y-band across the full page width
  rather than detecting true column boundaries in this granule's layout. This is the proximate
  cause of the observed corruption.
- **DRA's extraction wrapper (`normaliseContent`):** performs no column-awareness of its own; it
  passes through whatever `pdftotext -layout` returns unmodified (BOM/CRLF normalisation only).
  It does not introduce the defect, but it also does not detect or correct it — it silently
  trusts the extractor's reading order.
- **Segmentation / statement formation (Stage 2):** operates on the extractor's output text as
  given; the statement-count divergence (217 vs 328) is a direct downstream consequence of
  segmenting already-interleaved vs. correctly-ordered text, not an independent Stage 2 defect.

**Conclusion:** the corruption originates in the third-party `pdftotext` extraction dependency,
not in DRA-authored code. However, DRA's pipeline has no representation-boundary or
reading-order-confidence signal for multi-column layouts (unlike, e.g., DRA-ENG-015's shading
detector or DRA-ENG-017's OCR-fidelity axis), so this class of corruption currently passes
through undetected into statement formation and materiality assessment. That is a real
robustness gap even though it is not a DRA coding bug.

---

## 14. No production fix in this phase

No change was made to `normalisation.ts`, the evaluator pipeline, or any extraction code. Given
the `MATERIAL` verdict (§11), a **future engineering programme is recommended** (not undertaken
here) to add a multi-column reading-order confidence signal or corrected extraction path,
following the precedent set by DRA-ENG-015 (representation-boundary detection) and DRA-ENG-017
(provenance/fidelity axes) — i.e., detect-and-flag rather than silently trust, without
necessarily attempting full column-order correction in the first iteration.

---

## 15. Corpus and DRA-ROB-001 impact

- **Corpus impact:** none. No DRA-DOC-0034 (or any other) identifier was allocated or admitted;
  per §1/§5, this experiment is correctly excluded from all corpus counts and coverage figures
  until DRA-DOC-0033 is admitted and the sequence can be honoured.
- **DRA-ROB-001 status update:** the multi-column dimension moves from `UNTESTED` to
  `DEFECT_DEMONSTRATED_OPEN` — a real defect (reading-order corruption) has been demonstrated
  with measured material downstream consequence, but no engineering fix has been built in this
  phase. See the corresponding update in `DRA-ROB-001-ROBUSTNESS-EVIDENCE-REVIEW.md`.

---

## Validation ladder (Section 17)

| # | Check | Result |
|---|---|---|
| 1 | Sequencing constraint test (`describe("... sequencing and identifier constraint")`) | PASS |
| 2 | Live governance re-verification (statutory/domain basis, §2) | PASS (manual + documented) |
| 3 | Live source stability re-verification (2 independent fetches) | PASS |
| 4 | Oracle/Phase 1 evidence integrity (no files under Phase 1 report modified) | PASS (verified via `git status` — no changes outside this phase's new files) |
| 5 | Production extraction measurement reproducibility (`pdftotext -layout` digest match) | PASS |
| 6 | Run A determinism (2× identical substantive digest) | PASS |
| 7 | Run B counterfactual digest/decision match | PASS |
| 8 | Production-vs-counterfactual statement-count divergence assertion (217 vs 328) | PASS |
| 9 | Corrected-order fixture correctly labelled `ANALYSIS-ONLY` and never imported outside the test | PASS |
| 10 | `tsc --noEmit` (package-level) | PASS (see below) |
| 11 | Full `dra-reference` test suite (regression) | PASS (see below) |

Live-network steps (#2, #3) inherit the same live-fetch flakiness precedent already accepted
elsewhere in this corpus (ACQ-006/007/008/029) — a transient failure here would indicate
network conditions, not a code defect, and should be re-run rather than treated as a regression.

---

## Verdicts

- **Reading-order preservation:** `NOT_PRESERVED`
- **Evaluator materiality:** `MATERIAL`
- **Multi-column robustness verdict:** `MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL`
- **DRA-ROB-001 status:** `DEFECT_DEMONSTRATED_OPEN`
