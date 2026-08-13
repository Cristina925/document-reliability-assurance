# DRA-ACQ-030 — Phase 1: Multi-Column Layout Candidate Discovery and Qualification

**Date:** 2026-08-11
**Corpus size before this programme:** 32 admitted documents (DRA-DOC-0001 – DRA-DOC-0032)
**Scope:** Phase 1 (candidate discovery and qualification) only. No acquisition, freeze,
admission, or evaluator execution was performed against any candidate. DRA-DOC-0034 has
not been created. DRA-FRZ-000027, DRA-ACQ-000036, and DRA-DOC-0033 (still reserved for
the blocked DRA-ACQ-029 Devanagari admission) were not touched, reused, or renumbered.

---

## 1. Why this programme exists

DRA-ROB-001, the robustness-evidence coverage review conducted against the full
32-document corpus plus DRA-ENG-015 through DRA-ENG-023, ranked **multi-column layout**
as the **#5 highest-value untested robustness dimension** in its `RANKED_REMAINING_GAPS`
list (code-level artefact reused unmodified from `dra-acq-028-non-latin-script-discovery.ts`).
No admitted document and no engineering probe in this corpus has ever isolated genuine
multi-column reading order as its primary experimental variable:

- DRA-ACQ-021 (tabular structure) and DRA-ENG-015 (representation-boundary detection)
  characterised table/shading visual semantics — not prose column flow.
- DRA-ACQ-024/025 and DRA-ENG-018 characterised figure/diagram semantics — not prose
  column flow.
- DRA-ACQ-023 and DRA-ENG-017 characterised OCR/scan provenance — not prose column flow
  in text-native documents.

**Central research question:** does DRA preserve correct semantic reading order through
extraction, normalisation, and segmentation for genuinely multi-column source documents,
isolated as cleanly as possible from those already-tested dimensions?

---

## 2. Candidate discovery and qualification

Eight candidates were investigated across five distinct publishers and two domains
(LEGAL/government and TECHNICAL/scientific). Every HTTP status, licence statement, page
count, and layout observation below was live-verified on 2026-08-11 against the
candidate's official publisher URL — never against DRA's own extraction output, and
never through the DRA evaluator or any pipeline stage.

| Candidate | Publisher | Domain | Licence | Layout | Outcome |
|---|---|---|---|---|---|
| Federal Register, Vol. 89 No. 4, 5 Jan 2024 (full issue, 170 pp.) | Office of the Federal Register / U.S. GPO | LEGAL | Public domain (17 U.S.C. §105) | Genuine 3-column (Notices) / 2-column (Rules) | **QUALIFIED — PRIMARY** |
| Congressional Record, Vol. 170 No. 4, 9 Jan 2024 (full issue, 51 pp.) | U.S. GPO / Office of the Clerk | LEGAL | Public domain (17 U.S.C. §105) | Genuine 2-column | **QUALIFIED — ALTERNATE** |
| Canada Gazette, Part I, Vol. 160 No. 28, 11 Jul 2026 (83 pp.) | Government of Canada | LEGAL | Permission required (explicit in-document notice) | Parallel bilingual 2-column | Rejected — licence |
| EU Official Journal, Regulation (EU) 2024/1689 (AI Act, 144 pp.) | Publications Office of the EU | LEGAL | CC BY (reuse policy) | Single column throughout sampled pages | Rejected — not genuinely multi-column |
| Copernicus ACP article (Shah et al. 2023, 31 pp.) | Copernicus Publications | TECHNICAL | CC BY 4.0 (in-document) | Genuine 2-column, no defect observed | Rejected — lower information gain (retained as control) |
| SciPy Proceedings article (9 pp.) | SciPy Proceedings / Curvenote | TECHNICAL | CC BY 4.0 (in-document) | Single main column + margin sidebar | Rejected — not genuinely multi-column |
| IEEE Access sample | IEEE | TECHNICAL | Unverified | Unverified | Rejected — source inaccessible (HTTP 418 anti-bot) |
| Nature Communications sample | Springer Nature | TECHNICAL | Unverified | Unverified | Rejected — source inaccessible (redirects to auth gate) |

### 2.1 Rejected candidates, with reasons

- **Canada Gazette** — the PDF itself states "For information regarding reproduction
  rights, please contact Services publics et Approvisionnement Canada," an explicit
  permission-required notice rather than an open licence grant. No Open Government
  Licence – Canada grant was located for this specific publication within the Phase 1
  budget. This mirrors the DRA-ACQ-024 Bank-of-England precedent: an otherwise strong
  candidate rejected purely on unresolved licence grounds. (Its bilingual EN/FR column
  structure would have given an unusually strong language-identity reading-order oracle,
  and both extraction modes tested already reproduced correct block-level alternation
  with no observed defect — so it would also have ranked lower on expected information
  gain even had the licence cleared.)
- **EU Official Journal (AI Act)** — `pdfinfo`/`pdftotext` inspection of the sampled
  recitals and enacting terms shows the body running full-page-width in a single column
  throughout; no column-boundary artefacts were observed. This specific EU OJ act does
  not carry the genuinely multi-column layout the task requires (other EU OJ series may;
  none were re-verified here).
- **SciPy Proceedings** — a modern Typst/MyST template with one wide main-body column
  and a narrow non-prose margin sidebar (author metadata, correspondence, copyright
  notice), not genuine multi-column continuous prose.
- **IEEE Access / Nature Communications** — both nominally CC BY open-access venues with
  classic two-column layouts, but neither was reachable during this session (IEEE's
  direct PDF endpoint returned an anti-bot HTTP 418; Nature's redirected to an
  authentication gate even for the specific article probed). Documented as investigated-
  but-inaccessible rather than fabricated as verified candidates.
- **Copernicus ACP article** — genuine, cleanly isolated 2-column academic prose with
  full licence/source-strength certainty, but sampled default-mode extraction showed no
  reading-order defect at all (each column completes before the next begins). Retained
  in the register as a documented **correctly-behaving control**, not as a candidate,
  because it offers low expected information gain relative to the primary.

---

## 3. Reading-order oracle

For the **primary candidate**, three independent, non-DRA, non-OCR oracles exist
simultaneously:

1. **GovInfo MODS/XML metadata** (`https://www.govinfo.gov/metadata/pkg/FR-2024-01-05/mods.xml`,
   verified HTTP 200, `application/xml`) lists every constituent granule's title,
   publisher part (e.g. "Rules and Regulations"), page-range extent, a unique
   granule/access identifier, and a per-granule HTML mirror URL (e.g.
   `.../html/2024-00028.htm`) — an official, independently produced parallel text
   representation.
2. **FR-Doc citation stamps.** Every granule self-terminates with a globally unique
   `[FR Doc. YYYY-NNNNN Filed ...]` string assigned by GPO, giving a trivially
   checkable boundary: no other granule's heading may appear between a granule's own
   opening heading and its own citation stamp.
3. **Sequential numbered CFR sections** (e.g. §88.1 → §88.2 → §88.3 → §88.4 in the
   Rules-and-Regulations granules) give a strict, monotonic ordering check independent
   of both (1) and (2).

The **alternate candidate** (Congressional Record) has the same MODS/XML mechanism plus
the House Clerk's independent roll-call vote database as a secondary oracle for its
vote-list sections.

---

## 4. Reconnaissance against real candidate bytes

Reconnaissance used only Poppler's `pdftotext` (both default mode and `-layout` mode —
the extraction convention this corpus's own admission tests invoke as DRA's production
convention, e.g. `dra-acq-023-metric-system-admission.test.ts` and
`dra-acq-028-doc0032-japanese-admission.test.ts`, both of which call
`pdftotext -layout <in> <out>`). No DRA pipeline stage, segmentation logic, or evaluator
code was exercised.

**Finding 1 — COLUMN_INTERLEAVING and HEADING_BODY_MISORDER (default extraction).**
On the 3-column Notices-section granule (FR Doc. 2024-00001, pages 824-825), default
`pdftotext` produced this order: [end of Small Business Administration notice's body] →
[**Social Security Administration** heading, belonging to the adjacent column] → [Small
Business Administration notice's signature block] → [Social Security Administration
notice's own opening line] → [Small Business Administration notice's filing stamp] →
[next Small Business Administration notice's heading]. A second notice's heading and
part of its body were physically interposed inside the first notice's own text, between
its closing sentence and its own signature block — a direct, reproducible
`COLUMN_INTERLEAVING` and `HEADING_BODY_MISORDER` instance.

**Finding 2 — COLUMN_INTERLEAVING persists under `-layout` mode, via a different
mechanism.** On the same granule, `pdftotext -layout` preserved each column's physical
x-position, but produced single output lines that interleave short fragments from all
three physical columns side by side (column-1-row-N, column-2-row-N, column-3-row-N on
one text line). A downstream consumer reading the resulting string linearly top-to-bottom
still receives a column-interleaved reading order — the same named failure mode, present
under both extraction modes DRA's own admission-test precedent uses, via two different
underlying mechanisms.

**Finding 3 — PAGE_STREAM_CORRUPTION without loss of section order.** On the 2-column
Rules-and-Regulations granule (FR Doc. 2024-00091, 45 CFR Part 88), default extraction
correctly preserved strict §88.1 → §88.2 → §88.3 → §88.4 order, but print-shop tracking
stamps and running headers/footers were spliced directly into the middle of prose rather
than appearing only at page boundaries — a distinct `PAGE_STREAM_CORRUPTION` symptom that
did not, in this sampled section, disturb the numbered-section reading order itself.

**Control finding — no defect observed for the deprioritised Copernicus candidate.**
Default extraction over this article's clean, evenly balanced 2-column academic layout
completed column 1 in full before starting column 2 in every sampled section, with
correct heading placement. This sharpens the finding: the failure is not "any multi-
column layout" but specifically dense, narrower, unevenly sized layouts of the kind the
Federal Register's Notices section uses.

---

## 5. Ranking (12 named criteria)

Full per-candidate, per-criterion scores (`HIGH` / `MEDIUM` / `LOW` / `NOT_APPLICABLE`)
are recorded in `RANKED_CANDIDATE_SCORES` in the discovery module. Summary:

- **Federal Register** scores `HIGH` on 10 of 12 criteria (multi-column complexity,
  oracle strength, official-source strength, licence certainty, source stability,
  text-layer quality, semantic risk, multi-page coverage, reproducibility, expected
  GC-1 information gain), `MEDIUM` on isolation and OCR/table confounding (a few pages
  carry small tables/signature blocks alongside the target column-flow prose).
- **Congressional Record** scores `HIGH` on official-source strength, licence certainty,
  source stability, text-layer quality, multi-page coverage, and reproducibility;
  `MEDIUM` elsewhere, including expected information gain (weaker oracle, 2 columns vs.
  3) — a solid alternate, not a stronger primary.
- **Copernicus ACP** scores `HIGH` on isolation, OCR/table confounding, and licence/
  source strength, but `LOW` on expected GC-1 information gain (no defect observed) —
  correctly deprioritised as a control rather than a candidate.
- **Canada Gazette** scores `HIGH` on oracle strength (language-identity separation) but
  is hard-gated by `LICENCE_CERTAINTY = LOW`, which excludes it from qualification
  regardless of its other strengths, consistent with DRA governance treating licence as
  an eligibility gate rather than a soft scoring input.

---

## 6. Materiality standard (pre-defined for Phase 2)

A demonstrated reading-order defect is **MATERIAL** only if it measurably changes
downstream semantics — statement formation, claim boundaries, evidence linkage,
authority interpretation, issue generation, or the final decision. Textual misordering
alone, without a demonstrated evaluation-level impact, is a **NONMATERIAL**
representation defect. This mirrors the same correctness/materiality separation already
applied at DRA-ACQ-020 (footnote flattening), DRA-ACQ-024 (flowchart topology), and
DRA-ACQ-025 (non-redundant graphics): Phase 1's reconnaissance findings above prove the
extraction-layer symptom exists; they say nothing yet about whether it changes any
evaluator conclusion.

---

## 7. Phase 1 verdict

> **QUALIFIED — Federal Register, Vol. 89, No. 4, Friday, January 5, 2024 (primary)**,
> with the **Congressional Record, Vol. 170, No. 4, Tuesday, January 9, 2024**, as
> alternate.

The primary candidate is an official-publisher, public-domain, text-native, genuinely
3-column source with three independent reading-order oracles and a reproducible
reconnaissance finding of `COLUMN_INTERLEAVING` and `HEADING_BODY_MISORDER` under real,
unmodified `pdftotext` extraction — the same extraction family DRA's injectable
`PdfExtractor` is invoked with in this corpus's own admission-test precedent. Neither
candidate claims a DRA-DOC or DRA-FRZ identifier in Phase 1; if the primary is admitted
in Phase 2, it is reserved conceptually as **DRA-DOC-0034** (the document after the
still-blocked DRA-DOC-0033), and no admission has occurred here.

---

## 8. Multi-column robustness status after Phase 1

**PARTIALLY_TESTED** (not `UNTESTED`, not closed).

Reconnaissance reproducibly demonstrates that genuine 3-column source layout produces
`COLUMN_INTERLEAVING` and `HEADING_BODY_MISORDER` symptoms in the extraction family
DRA's `PdfExtractor` delegates to in production. This is real evidence that the risk
exists at the extraction layer. It does not close the dimension because: (a) it has not
been run through DRA's actual normalisation/segmentation/evaluation pipeline end to end;
(b) materiality has not been assessed at all; (c) no admitted document, freeze record,
or evaluation exists yet. Per the task specification, Phase 1 reconnaissance alone
cannot count as closure regardless of how compelling the recon evidence is.

---

## 9. Proposed Phase 2 experiment design

1. Re-verify governance (official-source status, licence, HTTP stability) for the
   primary candidate immediately before acquisition, per standard DRA-ACQ practice for
   time-sensitive live sources.
2. Freeze and admit the primary candidate via the existing governed acquisition
   pipeline (`acquireFreezeAndEvaluate`), producing a real DRA-DOC identifier, freeze
   record, and evaluation, without modifying any pipeline stage.
3. Evaluate the frozen document twice (`evaluateFrozenBenchmarkDocument`) to confirm
   evaluator determinism before drawing any conclusion from a single run, per the
   established DRA-BMK-023 corpus-lock convention.
4. Compare DRA's normalised/segmented text against the independent oracle (MODS/XML
   metadata, per-granule HTML mirrors, FR-Doc citation stamps), quantifying observed
   instances of each of the seven named failure modes with raw counts and percentages —
   no invented composite score.
5. If feasible, run an analysis-only corrected-order counterfactual (re-segmenting a
   corrected-order version of the same text offline, without touching production code)
   and compare evaluation-level outputs against the as-extracted run to isolate
   materiality, following the same technique used at DRA-ACQ-024/025.
6. Assess materiality strictly per the standard in Section 6.
7. Classify the dimension using exactly one of:
   `MULTICOLUMN_ORDER_PRESERVATION_CONFIRMED` /
   `MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL` /
   `MULTICOLUMN_ORDER_GAP_DEMONSTRATED_NONMATERIAL` / `INCONCLUSIVE`, without modifying,
   patching, or otherwise fixing any pipeline stage as part of this classification
   exercise (any engineering remediation is a separate, later DRA-ENG programme, as at
   DRA-ACQ-023→DRA-ENG-017).

**Explicit non-goals for Phase 2:** do not fix, patch, or otherwise modify extraction,
normalisation, or segmentation as part of classification; do not touch, reuse, renumber,
or interfere with DRA-FRZ-000027, DRA-ACQ-000036, or DRA-DOC-0033.

---

## 10. Recommended next action

Run **DRA-ACQ-030 Phase 2** exactly as scoped in Section 9 against the qualified primary
candidate (falling back to the qualified alternate only if the primary proves
logistically or technically unworkable), to move multi-column robustness from
`PARTIALLY_TESTED` to a closed classification (`CLOSED_WITH_POSITIVE_EVIDENCE`,
`DEFECT_DEMONSTRATED_AND_CLOSED`, or `DEFECT_DEMONSTRATED_OPEN`, per the DRA-ROB-001
closure vocabulary) before this dimension can be dropped from `RANKED_REMAINING_GAPS`.

---

## 11. Validation performed

- `npx tsc --noEmit -p .` in `lib/dra-reference`: exactly the same two pre-existing,
  unrelated type errors present before this programme (`CitationIntegrityReport.overallStatus`
  in `dra-acq-026-long-range-structural-robustness.test.ts`; `RedundancyAuditEntry`
  literal-union mismatch in `dra-acq-025-non-redundant-graphics-discovery.ts`) — zero new
  errors introduced.
- `npx vitest run src/benchmark/acquisition/discovery/__tests__/dra-acq-030-multicolumn-layout-discovery.test.ts`:
  36/36 tests passing, covering programme context, failure-mode taxonomy, materiality
  standard, candidate register integrity (including per-candidate rejection-reason
  checks), ranking criteria/scores, reconnaissance findings, Phase 1 verdict, status
  classification, and the Phase 2 proposal/scope boundary.
- `npx vitest run src/benchmark/acquisition/discovery/`: 838/844 passing; the 6 failures
  are pre-existing, unrelated stale `DRA_EVALUATOR_VERSION === "0.1.1"` assertions in
  `dra-acq-010/013/014/015/016/017` discovery tests (documented in prior sessions, e.g.
  DRA-ACQ-018 Phase 2 conventions memory), not introduced by this programme.
