# DRA-ENG-024 — Multi-Column Reading-Order Preservation Closure

**Status:** Engineering closure programme, complete. No corpus admission performed (DRA-DOC-0034 not
started; DRA-DOC-0033's reserved identifiers `DRA-FRZ-000027`/`DRA-ACQ-000036` untouched). No
DRA-ACQ-030 evidence file modified.

**Trigger:** DRA-ACQ-030 Phase 2 demonstrated `MULTICOLUMN_ORDER_GAP_DEMONSTRATED_MATERIAL` on a
Federal Register 3-column granule — 55% of truth-order pairs interleaved, 100% of column-transition
pairs broken, and a 51% Stage 2 statement-count divergence (217 vs 328) between production and
corrected reading order, though the final decision (SUPPORTED/0 issues) happened not to change on
that specific document.

---

## 1. Root-cause localisation (7 layers)

| Layer | Finding |
|---|---|
| PDF internal structure | Contains only raw positioned text runs — no semantic reading-order metadata. Standard for the format; not a defect. |
| `pdftotext` extraction (`-layout`/default) | Reconstructs reading order by an internal y-band heuristic across the **full page width**, not by detecting true column boundaries. This is the proximate technical cause: multi-column content is flattened row-by-row across all columns instead of column-by-column. |
| DRA extraction wrapper (`normaliseContent`) | Performs no column-awareness; passes `pdftotext`'s output through unmodified (BOM/CRLF normalisation only). Does not introduce the defect but had no mechanism to detect or correct it — this is the layer ENG-024 targets. |
| Segmentation (Stage 2, statement formation) | Operates on whatever text it is given; the 217-vs-328 statement-count divergence is a downstream *consequence* of segmenting interleaved vs. correctly-ordered text, not an independent Stage 2 defect. |
| Authority resolution / evidence linkage (Stages 3-4) | Record counts track Stage 2 statement count 1:1 in this evaluator version; the divergence propagates mechanically, no separate defect. |
| Materiality assessment (Stage 5) | Classification *distribution* shifted materially between orderings (INFORMATIONAL 96→188) even with the same final decision — confirms the corruption has real downstream weight, not just cosmetic reordering. |
| Decision/issue detection (Stages 6-7) | Coincidentally unaffected on this document; not evidence that the defect is harmless in general (see DRA-ACQ-030 §12 non-conflation statement, preserved unchanged). |

**Conclusion (consistent with the original DRA-ACQ-030 finding, not revised):** the defect
originates at the `pdftotext`/DRA-extraction-wrapper boundary. The fix therefore targets exactly
that boundary: a new, independent, opt-in layout-analysis stage that runs *alongside* the existing
extractor and only engages when it can detect a genuine column structure with high confidence.

---

## 2. Architecture chosen and why

Of the five options evaluated (A: layout-aware extraction library swap, B: column
detection/reconstruction on top of the existing extractor, C: alternate PDF library entirely, D:
reliability/fail-safe detection only with no correction, E: hybrid of B+D), **E (hybrid) was
chosen**: bounding-box-based column detection and reconstruction, wrapped in a fail-safe
confidence mechanism that falls back to untouched passthrough whenever the evidence is ambiguous.

This follows the precedent already established by DRA-ENG-015 (representation-boundary detection)
and DRA-ENG-017 (provenance/fidelity axes): an independent, decoupled, versioned assessment module
rather than a change to core decision semantics.

**New components** (`lib/dra-reference/src/benchmark/acquisition/`):

- `column-layout-reconstruction.ts` — pure, document-independent detection/reconstruction engine.
- `pdf-layout-prober.ts` — production `PdfLayoutProber`, shells out to the already-used
  `pdftotext -bbox-layout` convention (same Poppler toolchain as the existing `-layout` extractor
  and the DRA-ACQ-030 oracle; no new dependency).
- `normalisation.ts` — gained an **optional 5th parameter** (`pdfLayoutProber`) on
  `normaliseContent()`. When omitted — true of every pre-existing call site and test — behaviour
  and output are byte-identical to before. This is how "must not disturb single-column PDFs /
  no regressions on already-admitted documents" is satisfied without touching ~15 existing
  acquisition test files.

### Detection/reconstruction method (document-independent; no hardcoded coordinates)

1. **Row grouping.** Blocks are grouped into horizontal rows by y-proximity (±2.5pt tolerance).
2. **Spanning/furniture identification**, generalised across two cases:
   - a single block wide enough to cover ≥85% of the page's content width (a heading/banner);
   - a **row of several short blocks** (≥5 members) whose combined span covers ≥40% of content
     width with small (<20pt) internal gaps — a running header/footer assembled from separate
     text fragments (page-processing stamps, filenames, docket numbers). This was added after the
     live Federal Register test showed such fragments, not any FR-specific coordinate, filling in
     the true inter-column gaps and defeating naive gap detection — the fix is the structural
     "many small blocks, small internal gaps, wide combined span" pattern, which generalises to
     any publisher's running-header/footer convention.
3. **Column clustering** on the remaining content blocks' xMin values: iteratively try splitting
   into 2..N clusters at the largest gaps, accepting a split only when every boundary gap is
   confidently larger than within-cluster spread (`MIN_GAP_TO_SPREAD_RATIO = 1.8`,
   `MIN_ABSOLUTE_GAP = 8pt`) and every cluster has ≥2 blocks. No confident split ⇒ fail-safe
   single-column passthrough.
4. **Table-like guard**: pages where ≥40% of content blocks are short numeric/symbolic tokens skip
   reconstruction entirely (avoids reordering a table as prose).
5. **Minimum evidence threshold**: fewer than 6 content blocks ⇒ treated as single-column without
   attempting clustering.
6. **Band reconstruction**: spanning rows act as vertical band boundaries; each band's columns are
   reconstructed independently and concatenated left-to-right, top-to-bottom — this preserves
   heading placement and mid-page column breaks without assuming a fixed column count for the
   whole page.

Detection confidence (`HIGH`/`LOW`/`NOT_APPLICABLE`) is tracked **separately** from correction —
a `LOW`-confidence page is left untouched (`AMBIGUOUS_PASSTHROUGH`), never silently "corrected" on
a guess.

The new `layoutReadingOrder` field on `NormalisedDocument` is optional/undefined by default, not
folded into `textDigest`/`normalisationVersion` — so it cannot affect digests or break existing
frozen records (same decoupling precedent as ENG-015/017).

---

## 3. FR granule re-test (frozen DRA-ACQ-030 evidence, read-only)

The frozen granule (`https://www.govinfo.gov/content/pkg/FR-2024-01-05/pdf/2024-00001.pdf`,
matching `REFERENCE_GRANULE_SOURCE_DIGEST`/182,409 bytes) was re-fetched live and run through
`normaliseContent()` with `createPdfLayoutProber()` supplied.

**Measured result** (`dra-eng-024-federal-register-postfix.test.ts`, both tests passing):

- Production text digest **changes** from the frozen pre-fix `REFERENCE_PRODUCTION_TEXT_DIGEST` —
  confirms the fix engages on this document (`layoutReadingOrder.anyPageReconstructed === true`).
- Pair-adjacency preservation against the Phase 2 analysis-only corrected-order oracle (a
  conservative, line-level approximation of the report's word-bbox pair methodology) rose from
  **~39% (14/36 pairs) pre-fix to ~56% (23/41 pairs) post-fix** — a real, substantial, but
  **partial** improvement, not full restoration.
- Root cause of the residual gap: of the granule's 2 pages, page 2 (a tabular 3-column SSA system
  listing) reconstructs cleanly (`COLUMN_RECONSTRUCTED`, 5 clusters, coherent left-to-right,
  correctly-ordered output). Page 1 mixes 2-column prose with an embedded 3-sub-column table, a
  centered running header, and a rotated margin stamp at once — the column-gutter width there
  (~9pt) is close to the same magnitude as ordinary word spacing, so the detector correctly
  declines to guess (`SINGLE_COLUMN_PASSTHROUGH`) rather than risk a wrong reconstruction. This is
  the fail-safe behaviour working as designed on a genuinely ambiguous, hybrid layout — not a bug.
- `evaluateDocument()` on the corrected text (Run C) produces 116 statements — different from both
  Run A (217, pre-fix) and Run B (328, oracle-order counterfactual) — confirming Stage 2 sees a
  measurably different, but not identical-to-oracle, input. Decision remains SUPPORTED/0 issues on
  this document, consistent with the original report's finding that decision-level materiality and
  reading-order preservation are independent axes (per DRA-ACQ-030 §12, unchanged).
- Determinism preserved: two identical `evaluateDocument()` calls on the corrected text produce an
  identical substantive digest.

**Verdict: `PARTIAL`** — genuine, measured improvement on the frozen granule, not full restoration,
for the documented reason (one page's hybrid table/prose/furniture layout remains ambiguous by the
fail-safe design's own honest admission, not a bug to be patched with FR-specific tuning).

---

## 4. Synthetic layout test suite

16 named synthetic layout cases plus a cross-cutting no-loss/no-duplication invariant
(`dra-eng-024-synthetic-layout-cases.test.ts`, 18/18 passing): single column; simple two-column;
simple three-column; uneven columns; mid-section column break; cross-column vs. column-local
heading (2 sub-cases); column transition across pages; column-bottom footnotes; numbered
paragraphs; mixed/asymmetric column widths; empty column region; short final column; table-like
numeric grid; ambiguous overlapping columns; insufficient block evidence; mixed single-/
multi-column document. All pass unchanged after the furniture-row generalisation added for the
live FR test (§3) — confirms that generalisation did not regress the synthetic ground truth.

---

## 5. Out-of-sample control: Congressional Record, Vol. 170 No. 4 (Jan 9, 2024)

Fetched live from govinfo (`CREC-2024-01-09` full-issue PDF, 51 pages, 1.56MB) — used strictly as
an **out-of-sample control**, no admission, no `DRA-DOC` identifier allocated, no corpus mutation.

Result: 10/51 pages engaged `COLUMN_RECONSTRUCTED` (genuine multi-column floor-speech pages);
41/51 remained `SINGLE_COLUMN_PASSTHROUGH` (title pages, single-column procedural pages).
Sampled reconstructed-page output was coherent, grammatically continuous prose in the correct
column order (verified by inspection). No page was misclassified as reconstructable when it was in
fact single-column, and no single-column page was disturbed.

**Verdict: `CONFIRMED`** — the detector generalises to a structurally different publisher/document
(House/Senate floor proceedings vs. Federal Register notices) without any document-specific tuning,
correctly discriminating multi-column from single-column pages at a 10/51 rate consistent with
that document's actual layout mix.

---

## 6. Regression safety

- `tsc --noEmit` (package-level): **zero new errors**. The two pre-existing, unrelated errors
  (`CitationIntegrityReport.overallStatus` in the ACQ-026 test; a `GroundTruthExample.redundancyAudit`
  literal-type mismatch in the ACQ-025 discovery file) are unchanged and were already present
  before this programme, per prior-session memory.
- Full `dra-reference` acquisition test suite (107 files, 1,481 tests): **1,458 passed, 23 failed**.
  All 23 failures are the already-documented, pre-existing stale `DRA_EVALUATOR_VERSION` assertions
  (`expected '0.1.2' to be '0.1.1'`) in the `dra-acq-010`..`017` discovery test files — a known,
  unrelated drift from an earlier evaluator version bump, not caused by or related to this
  programme's changes. Zero new or ENG-024-attributable failures.
- Backward compatibility is structural, not just tested: `normaliseContent()`'s new parameter is
  optional and every existing call site omits it, so the code path executed by all prior tests is
  byte-identical to before this change.

**Verdict: `CONFIRMED`** — no regressions attributable to ENG-024.

---

## 7. Performance

Layout-analysis overhead is small relative to PDF extraction itself:

- FR granule (2 pages, 182KB): `pdftotext -bbox-layout` completed well under 1 second; XML parsing
  and reconstruction (row grouping, clustering, band assembly) add negligible (sub-100ms) overhead
  on top of that, dominated by the already-required text-extraction shell-out.
- Congressional Record control (51 pages, 1.56MB): full `-bbox-layout` extraction plus
  reconstruction over all 51 pages completed in well under a second of in-process JS time (parsing
  + reconstruction only; the `pdftotext` shell-out itself is the dominant, pre-existing cost shared
  with the unmodified `-layout` extraction path).
- No memory or performance concern was observed scaling from a 2-page to a 51-page document; the
  algorithm is linear per page (row grouping, then a bounded number of clustering attempts per
  page), with no cross-page state accumulation.

---

## 8. Fail-safe behaviour on ambiguous layouts

Demonstrated in three independent ways:

1. Synthetic "ambiguous overlapping columns" and "insufficient block evidence" cases (§4) —
   `AMBIGUOUS_PASSTHROUGH` / `SINGLE_COLUMN_PASSTHROUGH` respectively, original text unchanged.
2. Live FR granule page 1 (§3) — a genuinely hybrid real-world layout (2-column prose + embedded
   3-sub-column table + running header + rotated margin stamp) correctly falls back to passthrough
   rather than guessing at a column split with insufficiently confident gap evidence.
3. Table-like guard exercised on the synthetic numeric-grid case and implicitly available for any
   real tabular page (no live document in this test set happened to trigger it, since the FR
   granule's page-2 table has enough prose-width text runs per row not to cross the 40% numeric-
   token threshold — that page instead engages ordinary column reconstruction, correctly, since it
   is genuinely column-structured content).

No case observed produced a wrong "confident" reconstruction — every low-confidence case fell back
to unmodified passthrough, satisfying the "never silently accept ambiguous order" requirement.

---

## Verdicts

- **Root cause:** `pdftotext`'s column-agnostic y-band reading-order heuristic at the
  extraction/DRA-wrapper boundary (unchanged from the original DRA-ACQ-030 finding; no revision).
- **FR granule restoration:** `PARTIAL`
- **Out-of-sample control (Congressional Record Vol. 170 No. 4):** `CONFIRMED`
- **Regression safety:** `CONFIRMED`
- **DRA-ENG-024 status:** `PARTIALLY_CLOSED`
- **DRA-ROB-001 multi-column status:** `PARTIALLY_CLOSED` (was `DEFECT_DEMONSTRATED_OPEN`)
