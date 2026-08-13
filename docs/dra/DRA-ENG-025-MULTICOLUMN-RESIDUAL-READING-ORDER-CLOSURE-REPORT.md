# DRA-ENG-025 — Multi-Column Residual Reading-Order Closure

## 1. Objective and scope

DRA-ENG-024 closed `PARTIALLY_CLOSED`, improving pair-adjacency preservation on the frozen Federal
Register (FR) granule (`DRA-DOC-0034`'s underlying oracle document) from 14/36 (38.9%) to 23/41
(56.1%), but left the remaining ~44% (18 of 41 locatable oracle-adjacent pairs) uncausally
classified. DRA-ENG-025's mandate was to, in strict order: (1) reproduce the ENG-024 baseline
exactly without redefining the oracle or denominator; (2) extract the complete residual-failure
population with full structural evidence as a machine-readable fixture; (3) classify all residual
failures into a generic structural taxonomy; (4) apply a principled, machine-tested
RECOVERABLE / AMBIGUOUS-REPRESENTATION-LIMITED / OUT-OF-SCOPE-STRUCTURE distinction; (5) implement
corrections only for material, safe, generic RECOVERABLE categories; (6) provide ablation evidence
per change; (7) re-measure against the frozen oracle; (8) run generalisation and regression checks.
No new document acquisition, evaluator change, or programme beyond this scope was in bounds.

## 2. Phase 1 — Baseline reproduction

Re-ran the existing `dra-eng-024-federal-register-postfix.test.ts` against the live-refetched,
byte-verified FR granule (182,409 bytes, matching `REFERENCE_GRANULE_BYTE_LENGTH`) without any code
change. Result: pre-fix 14/36 (38.9%), post-fix 23/41 (56.1%) pair-adjacency preservation — exactly
reproducing ENG-024's reported numbers. This is the frozen baseline this programme is measured
against; it was not redefined.

## 3. Phase 2 — Residual population and evidence fixture

A standalone analysis script re-ran the real pipeline (`pdftotext -bbox-layout` → bbox parsing →
`reconstructDocumentReadingOrder`) against the frozen granule, loaded the frozen oracle fixture, and
for every oracle-adjacent line pair recorded full structural evidence: page, column/cluster
assignment, reconstruction method, cross-page flag, extraction-order index gap, and bounding boxes
for both endpoints.

Of 314 oracle lines / 41 locatable adjacent pairs: **23 preserved, 18 failed**. A further 272
oracle-adjacent pairs have at least one line not locatable verbatim in the candidate text at all —
these are excluded from the metric denominator by the pre-existing `pairAdjacencyPreservation()`
convention (unchanged from ENG-024), not additional silent failures; inspection confirms they arise
from exact-line-matching limitations between the oracle fixture's line splitting and the candidate's
extraction line splitting, not from reconstruction defects.

The full trimmed evidence set (bounding boxes, index gaps, inversion flags, page/column assignment
for all 18 failures) is committed at
`docs/dra/evidence/dra-eng-025-residual-failure-corpus.json` for future reuse.

**Key structural finding:** all 18 failures trace to page 1 only (either both endpoints on page 1,
or a cross-page pair touching page 1). Page 2 — `COLUMN_RECONSTRUCTED`, 5 clusters — has **zero**
failures among its locatable pairs. Page 1 is classified `SINGLE_COLUMN_PASSTHROUGH`,
`clusteringConfident: false`.

## 4. Phase 3 — Residual taxonomy

Manual inspection of all 18 failures' bounding boxes and content, cross-checked against a direct
sorted dump of page 1's raw `pdftotext -bbox-layout` block sequence, yields three failure classes,
**all traceable to a single underlying mechanism**: page 1 is a genuinely mixed-regime page — a
2/3-column prose/notice section (columns at x≈45, 222, 399) coexisting with a differently-dimensioned
3-sub-column SSA reference table (a very wide "system name" column overlapping the prose column
boundary, plus narrower "No." and citation sub-columns) — and `pdftotext`'s own internal bbox block
sequence for this page is not merely column-major or row-major but **genuinely scrambled**: a direct
dump of the raw block order (§ evidence corpus) shows, e.g., a y=401.9 content block immediately
followed by a y=671.2 footer block, then back to y=457, then a jump to y=93.9 — no simple sort
recovers a single consistent reading order from this sequence.

| Class | Count | % of 18 | Description |
|---|---|---|---|
| **PROSE_COLUMN_BOUNDARY_UNDETECTED** | 8 | 44% | Pairs spanning a column-1→column-2 (or masthead→column) transition in the prose/notice section that `clusterByXMin` did not confidently split, so no column-aware ordering was attempted (oracle indices 10, 11, 32, 33, 44, 45, 49, 167). |
| **TABLE_SUBCOLUMN_INTERLEAVING** | 5 | 28% | Pairs within the SSA reference table where the oracle expects a 3-way per-row interleave (label / No. / citation) but the table's citation sub-column sits in a separate block run at page end rather than being row-interleaved (oracle indices 34, 35, 36, 37, 168). |
| **MARGINAL_FURNITURE_MISPLACEMENT** | 5 | 28% | Pairs involving a running-footer/margin-stamp fragment ("lotter on DSK11XQN23PROD…", "PO 00000", "Unclassified.") whose position in the raw extraction stream does not match its true vertical placement relative to neighbouring content (oracle indices 38, 39, 196, 197, 206). |

All three classes are downstream of the same root defeat: page 1's column-clustering evidence is
polluted by the coexistence of two structurally different column-width regimes on one page, which
the architecture clusters globally per page rather than per structural region, so `clusterByXMin`
falls back to `SINGLE_COLUMN_PASSTHROUGH` for the whole page and no reading-order correction is
attempted at all for any of the 18 pairs. This is a complete classification of the residual
population (18/18 failures accounted for); the 272 not-located pairs are separately explained above
as a matching-method limitation, not an unclassified defect.

## 5. Phase 4 — Recoverability classification

- **In-principle evidence sufficiency:** the PDF's bounding-box geometry is precise enough, in
  principle, that a more sophisticated region-aware algorithm could distinguish the prose columns
  from the table sub-columns and the footer from body content — so this is not a case of missing
  source evidence.
- **Machine-tested distinction, not an assertion of difficulty:** three independent, concretely
  implemented and empirically ablation-tested correction strategies were built and measured (§6).
  Each is publisher-independent and uses only pre-existing structural signal (dot-leader typography,
  geometric position, confirmed-furniture classification) — none is FR-specific or oracle-aware.
  None produced a net, safe improvement (§6). This satisfies the "no purely geometric/structural
  signal currently available reliably resolves this without regressing other correctly-working
  pages" bar the task requires before invoking ambiguity — it is not simply "hard to fix."
- **Classification:** the 18 residual failures are classified
  **AMBIGUOUS-REPRESENTATION-LIMITED** at current evidence and architecture level: the single-document
  evidence base is insufficient to safely generalise a fix for the page's mixed-regime column
  structure without risking regressions on other pages (as concretely demonstrated in the dot-leader
  ablation, §6.1), and building genuine per-region/regime-aware clustering is a materially larger
  architectural change not justifiable from one document's evidence. They are not
  OUT-OF-SCOPE-STRUCTURE (the content is ordinary multi-column/tabular prose, squarely within the
  reconstruction contract's intended scope) and not confirmed RECOVERABLE (no safe correction was
  found despite genuine, ablation-tested attempts).

## 6. Phase 5/6 — Engineering attempts and ablation evidence

Three candidate corrections were implemented and ablation-tested against both the targeted failure
categories and the full regression surface (synthetic fixtures + FR oracle). All three were
**rejected** and are not present in the final code; the net production diff is zero behavioural
change (only additive, already-existing-logic-exposing diagnostic exports were kept — see §9).

### 6.1 Dot-leader reference-row exclusion (targets TABLE_SUBCOLUMN_INTERLEAVING)

Detected rows containing a leader-dot run (`label ..... value`, a generic, publisher-independent
reference-table/TOC typographic convention) and excluded them from column-clustering evidence, the
same way furniture rows are excluded.

**Result: REGRESSION.** FR pair-adjacency dropped from 23/41 (56.1%) to 14/36 (38.9%) — it destroyed
page 2's previously-working `COLUMN_RECONSTRUCTED` result (page 2 fell back to
`SINGLE_COLUMN_PASSTHROUGH`) without fixing page 1 (which remained `SINGLE_COLUMN_PASSTHROUGH`
regardless). Root cause: page 2 is almost entirely the same reference table continuing from page 1,
and its 5-way column-clustering evidence was itself anchored by the dot-leader label cells; removing
them destroyed the geometric evidence page 2's reconstruction depended on. This is a clean example of
the task's warning against attributing single-page evidence to a "safe" generic fix — a change that
looked well-justified in isolation had a causally-connected side effect elsewhere in the same
document.

### 6.2 Geometric (yMin, xMin) sort as passthrough fallback order (targets
PROSE_COLUMN_BOUNDARY_UNDETECTED and MARGINAL_FURNITURE_MISPLACEMENT)

Replaced the raw-extraction-order passthrough text with a full position-based sort, on the reasoning
that `pdftotext`'s internal flow order is not guaranteed to already be top-to-bottom (confirmed
scrambled on page 1, §4).

**Result: NET-NEUTRAL/UNSAFE, REJECTED.** FR pair-adjacency moved from 23/41 to 24/41 (+1 pair) —
a marginal, non-material gain — but the change broke two pre-existing synthetic test contracts
(`dra-eng-024-synthetic-layout-cases.test.ts`, cases 15 and 16) that explicitly assert extraction
order is preserved when column evidence is below threshold. Inspection showed why: for genuinely
undetected multi-column content, the correct order is column-major (all of column 1, then all of
column 2), and real extractors — including the synthetic tests' own construction and most of the FR
page's own column runs — often already emit blocks in column-major order; a naive geometric sort
converts this to row-major order, which is actively wrong for that case. The fix trades one failure
mode for a different, test-contract-violating one, with only a 1-pair net gain on the one document
available as evidence. Rejected as unsafe and not generalisable.

### 6.3 Furniture-only positional relocation (targets MARGINAL_FURNITURE_MISPLACEMENT, narrowly)

A narrower variant of 6.2: leave all undecided content in its original extraction order untouched,
and relocate only blocks *already confidently classified* as spanning/furniture (via the existing,
unmodified `isFurnitureRow`/width-fraction logic) to their correct vertical position among the
content stream.

**Result: SAFE BUT INEFFECTIVE.** Zero regressions — all 24 pre-existing tests still passed, and the
change is a no-op for any page with no furniture rows (confirmed for the two previously-broken
synthetic cases). However, re-measuring against the FR oracle showed the **exact same 18 failures**,
unchanged in identity (only minor index-gap magnitude shifts from the relocation itself) — the
change is safe but produces no measurable correction for any of the three residual classes. Because
it is a purely additive, higher-risk piece of production logic with no demonstrated benefit on the
only real-world evidence available, it does not meet the "material" bar for a correction and was
reverted rather than shipped as dead-weight complexity.

No fourth candidate was pursued: with two independent structural hypotheses (typographic dot-leader
signal, geometric position) both tested to failure and a third (narrow furniture relocation) tested
to null effect, further candidates would be speculating without new evidence, which the task
explicitly does not authorise (no new document acquisition permitted).

## 7. Phase 7 — Final measurement

**No engineering change was retained.** The frozen FR oracle result after this programme is
identical to the ENG-024 baseline: **23/41 (56.1%)** pair-adjacency preservation. Absolute/percentage
change: **0 pairs / 0.0 percentage points.** All 18 residual failures remain exactly as classified in
§4; no new failures were introduced (the one code path change ultimately retained — diagnostic-only
exports — is behaviourally inert, confirmed via `tsc --noEmit` and full targeted-suite re-runs at
each stage, §9).

## 8. Remaining failures and why they were not corrected

All 18 residual failures are `AMBIGUOUS-REPRESENTATION-LIMITED` per §5: they stem from a single
page whose PDF-internal extraction order is non-monotonic in every simple structural dimension tried
(typographic, geometric, furniture-classification), and whose true fix — per-region/regime-aware
column clustering that can separate a prose regime from a differently-shaped table regime on the same
page — is a materially larger architectural undertaking than can be safely validated from a single
document's evidence. Two genuinely different, non-trivial correction strategies were implemented and
ablation-tested to failure (one caused a page-2 regression, one broke existing fallback-preservation
test contracts for marginal gain); a third, narrower and safe strategy was tested to null effect. No
untried, plausible, low-risk generic strategy remains identified at this evidence level.

## 9. Generalisation and regression evidence

- **Synthetic fixtures** (`dra-eng-024-synthetic-layout-cases.test.ts`, 16 cases): all 16 pass,
  unaffected — final code is byte-behaviourally identical to the ENG-024 baseline.
- **Parser unit tests** (`dra-eng-024-pdf-layout-prober.test.ts`): pass, unaffected.
- **Independent out-of-sample control:** ENG-024's Congressional Record Vol. 170 No. 4 control
  (10/51 pages correctly reconstructed, 41/51 correctly left single-column, verified by inspection)
  is unaffected by this programme, since no production behaviour changed; it was not re-fetched
  (doing so would add no new evidence and is unnecessary for a zero-diff outcome).
- **Full acquisition-package test suite** (110 files, 1,513 tests): 1,491 passed, 22 failed — all 22
  failures are the pre-existing, previously-documented stale `DRA_EVALUATOR_VERSION` assertions
  (`expected '0.1.2' to be '0.1.1'`) in `dra-acq-010`..`017` discovery test files, unrelated to and
  unaffected by this programme. Zero new or ENG-025-attributable failures.
- **`tsc --noEmit`** (package-level): exactly the same two pre-existing, unrelated errors as before
  this programme (`CitationIntegrityReport.overallStatus` in the ACQ-026 test;
  `GroundTruthExample.redundancyAudit` literal-type mismatch in the ACQ-025 discovery file). Zero new
  errors.

## 10. Exact files touched

- `lib/dra-reference/src/benchmark/acquisition/column-layout-reconstruction.ts` — the only file with
  a retained diff. Purely additive: `Row`, `groupIntoRows`, `isFurnitureRow`, `ClusterCandidate`,
  `clusterByXMin`, `isNumericLikeToken` changed from module-private to exported (unchanged
  implementations), plus a new read-only `PageReconstructionDiagnostics` interface and
  `diagnosePage()` function that mirrors `reconstructPage`'s existing internal logic for external
  inspection. Confirmed zero behavioural change via `tsc --noEmit` and full targeted-suite re-run.
  Three candidate corrections (dot-leader exclusion, geometric sort, furniture relocation) were
  implemented, ablation-tested, and fully reverted — none are present in the final diff.
- `docs/dra/evidence/dra-eng-025-residual-failure-corpus.json` — new. Machine-readable evidence
  fixture: full structural detail (bounding boxes, index gaps, page/column assignment, reconstruction
  method) for all 18 residual failures, plus summary counts.
- `docs/dra/DRA-ENG-025-MULTICOLUMN-RESIDUAL-READING-ORDER-CLOSURE-REPORT.md` — this report.

No other files were modified. No evaluator, benchmark result, frozen source artefact, or corpus
record was touched.

## 11. Limitations

- The evidence base is a single document (`DRA-DOC-0034`'s underlying FR granule); the taxonomy and
  recoverability classification in §4–5 are demonstrated for this document only, not proven to
  generalise to other mixed prose/table layouts. The out-of-sample Congressional Record control
  (§9) validates the *reconstruction detector* generalises to a different publisher, but that control
  document did not happen to exercise a mixed-regime page, so it provides no direct evidence about
  §4's specific defect class.
- `diagnosePage()`'s exposure of internal state is a convenience for future evidence-gathering
  programmes; it duplicates `reconstructPage`'s row/spanning/clustering logic rather than sharing it,
  which is a minor maintenance-cost tradeoff accepted to keep this change strictly additive and
  risk-free to the frozen, tested `reconstructPage` path.

## 12. DRA robustness implications

The `DRA-ROB-001` multi-column row remains `PARTIALLY_CLOSED` (unchanged from ENG-024) — this
programme did not move it, since no material correction was found. The specific residual defect
class (per-page global column clustering cannot separate coexisting prose/table regimes) is now
concretely evidenced and taxonomised for the first time and should inform any future decision about
whether a region-aware clustering redesign is worth the investment; it is a candidate for, but not
itself, that redesign.

## 13. Next-programme recommendation

Any future work on this specific defect should be evidence-driven across **multiple** documents
exhibiting mixed-regime pages before attempting a redesign — a single-document evidence base cannot
safely validate a per-region/regime-aware clustering architecture, as this programme's two failed
ablations concretely demonstrate (each looked reasonable in isolation and failed only when tested
against the full page/document). Per the explicit programme boundary for this task, no such work,
new acquisition, evaluator change, or combined robustness review is started here — this closure
report is the final action of DRA-ENG-025.

## Verdicts

- **Root cause:** confirmed and taxonomised (§4) — global per-page column clustering cannot
  disambiguate a page mixing structurally distinct column-width regimes (prose vs. table), compounded
  by non-monotonic `pdftotext` internal block ordering on that page.
- **Residual classification:** `AMBIGUOUS-REPRESENTATION-LIMITED` (18/18 failures, comprehensively
  accounted for; see §4–5).
- **Correction attempts:** 3 implemented, ablation-tested, and rejected (1 regression, 1 unsafe
  marginal gain, 1 safe-but-null); 0 retained.
- **FR granule result:** unchanged from ENG-024 baseline — 23/41 (56.1%), 0 pp change.
- **Regression safety:** `CONFIRMED` — zero new test or `tsc` failures.
- **DRA-ENG-025 status:** `PARTIALLY_CLOSED` — comprehensive classification and ablation evidence
  achieved; no safe generic correction was found this round; residual failures are evidenced as
  representation-limited rather than a known-solvable defect being left unfixed.
- **DRA-ROB-001 multi-column status:** unchanged, `PARTIALLY_CLOSED`.
