# DRA-ROB-002 — Generalisation Candidate (DRA-GC-1) Freeze-Readiness Review

**Status:** Review/decision programme. No production evaluator behaviour, corpus history, frozen
artefact, or historical benchmark result was changed by this programme. No document was acquired.
No evaluator semantics were changed. DRA-GC-1 is not declared frozen by this document.

**Corpus scope reviewed:** the 33 admitted documents (DRA-DOC-0001–0032, DRA-DOC-0034),
corpus version `DRA-CORPUS-1.0.0`, evaluator version `0.1.2`. DRA-DOC-0033 remains unadmitted
(`DRA-ACQ-029 Phase 2 — BLOCKED_PENDING_LIVE_SOURCE_REACQUISITION`).

---

## 1. Executive verdict

**READY_FOR_DRA_GC_1_FREEZE.**

No item in the known-defect ledger (Section 6) is classified `FREEZE_BLOCKER`. Every unresolved
uncertainty is either (a) a bounded, mechanistically-understood limitation with disclosed
consequences, or (b) explicitly excluded from DRA-GC-1's validated claim scope as a declared
generalisation boundary, not asserted safe. This review does not require closing DRA-DOC-0033,
does not require another representation-robustness document, and does not require any further
engineering. A draft freeze specification is provided in
`docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md`, but the freeze itself is not executed here.

The two concrete reasons DRA-ROB-001 gave for NOT_YET_READY have both been substantively
addressed since that review, without lowering any evidentiary bar:

1. **Non-Latin scripts** were previously evidenced from a sample of one script family (CJK,
   DRA-DOC-0032). A second, structurally distinct non-Latin family — Cyrillic, alphabetic and
   whitespace-delimited (DRA-DOC-0034, DRA-ACQ-031) — has since been admitted with a clean **PASS**
   verdict, confirming the ENG-023 Unicode fix generalises across two different non-Latin
   mechanisms (no-whitespace ideographic segmentation, and non-Latin-alphabet character
   classification). The remaining non-Latin gap (RTL scripts, abugida/conjunct-consonant
   composition such as Devanagari, scriptio-continua without enumerated terminators) is now
   addressed as an explicit **DECLARED_GENERALISATION_BOUNDARY** (Section 4A) rather than left
   as an open, unscoped uncertainty.
2. **Multi-column layout** was DEFECT_DEMONSTRATED_OPEN in DRA-ROB-001. DRA-ENG-024 and
   DRA-ENG-025 have since exhaustively engineered, ablation-tested, and closed this to
   `PARTIALLY_CLOSED`: every one of the 18 residual failures on the frozen Federal Register oracle
   is classified into one of three generic sub-mechanisms, three genuinely different correction
   candidates were built and safely rejected (none shipped), and the production behaviour is
   confirmed identical to the validated ENG-024 baseline. This is now an accepted, bounded
   representation limitation (Section 4B), not an open defect requiring a fix/accept decision.

This review does surface one item that was not fully weighed in DRA-ROB-001's own conclusion: the
DRA-CHK-005 EN/ES Stage 5 materiality lexicon gap is stronger evidence than the ROB-001 "1/7
confirmed, 6/7 unresolved" wording implied — it is now root-caused and generalised to 12/12
constructed obligation pairs. This review classifies it as `ACCEPTED_GC-1_LIMITATION`
(Section 6, entry D3), not a blocker, but requires it to be an explicit exclusion in DRA-GC-1's
claim scope (Section 7): non-English materiality/obligation-detection quality is not validated to
the same standard as English.

---

## 2. Scope and methodology

Per the governing task, this is a review and decision programme: existing evidence is reused
wherever it exists; only load-bearing claims are re-verified by machine-checkable test, and no
expensive full-corpus re-evaluation was run beyond what the acquisition-suite regression check
(Section 8) already exercises. The review proceeds through the eight phases specified by the task:
robustness-map reconstruction (Section 3), ROB-001 gap reassessment (Section 4), freeze criteria
(Section 5), known-defect ledger (Section 6), contamination review (Section 7), claim-scope
statement (Section 7), decision (Section 1/9), and — because the verdict is READY — a draft freeze
specification (separate file, not executed).

---

## 3. Evidence reviewed

- `docs/dra/DRA-ROB-001-ROBUSTNESS-EVIDENCE-REVIEW.md` (full).
- `docs/dra/DRA-ACQ-029-PHASE1-CANDIDATE-DISCOVERY-REPORT.md`, `DRA-ACQ-029-PHASE2-RESUMPTION-REPORT.md`.
- `docs/dra/DRA-ACQ-031-PHASE1-REPORT.md`, `DRA-ACQ-031-PHASE2-REPORT.md`.
- `docs/dra/DRA-ENG-024-MULTICOLUMN-READING-ORDER-CLOSURE-REPORT.md`,
  `DRA-ENG-025-MULTICOLUMN-RESIDUAL-READING-ORDER-CLOSURE-REPORT.md`, and the evidence fixture
  `docs/dra/evidence/dra-eng-025-residual-failure-corpus.json`.
- `lib/dra-reference/src/benchmark/analysis/__tests__/dra-chk-003-parallel-language-divergence.test.ts`
  and `dra-chk-005-cross-language-materiality.test.ts` (no standalone CHK-003/005 report file
  exists; the tests are the primary artefacts).
- `lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-028-non-latin-script-discovery.ts`
  (`ROBUSTNESS_EVIDENCE_MAP`) and its integrity test
  `dra-rob-001-evidence-matrix-integrity.test.ts`.
- Corpus/evaluator/governance state: `lib/dra-reference/src/model/versions.ts`,
  `lib/dra-reference/src/benchmark/governance/version.ts` and `freeze.ts`,
  `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-031-phase2-doc0034-bulgarian-admission.test.ts`.
- Determinism/proof-receipt implementation: `lib/dra-reference/src/pipeline/build-proof-receipt.ts`,
  `evaluate-document.ts`, `canonical-serialise.ts`, and their test suites.
- `docs/dra/DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md` (full).
- `.agents/memory/dra-acq031-phase2-conventions.md` (registry-gap handling at DRA-DOC-0033).

No document was acquired and no expensive full-corpus evaluation was re-run beyond the standard
acquisition-suite regression check (Section 8).

---

## 4. Updated robustness matrix (DRA-ROB-001 dimensions, reclassified)

Reconstructed and made machine-verifiable at
`lib/dra-reference/src/benchmark/analysis/dra-rob-002-freeze-readiness-ledger.ts`
(`ROBUSTNESS_MATRIX`, 18 entries, checked against
`dra-rob-002-freeze-readiness-review.test.ts`).

| # | Dimension | ROB-001 classification | ROB-002 classification | Changed? |
|---|---|---|---|---|
| 1 | Footnotes/endnotes | DEFECT_DEMONSTRATED_AND_CLOSED (acceptance) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | No |
| 2 | Tables/tabular semantics | CLOSED_WITH_POSITIVE_EVIDENCE (detection) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | No |
| 3 | Multi-column layout | PARTIALLY_CLOSED (open defect) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | **Yes — ENG-025** |
| 4 | Very large documents/scalability | DEFECT_DEMONSTRATED_AND_CLOSED | CLOSED_STRONGLY_EVIDENCED | No |
| 5 | Scientific citations/references | DEFECT_DEMONSTRATED_AND_CLOSED | CLOSED_STRONGLY_EVIDENCED | No |
| 6 | Legal authority/versioning | DEFECT_DEMONSTRATED_AND_CLOSED | CLOSED_STRONGLY_EVIDENCED | No |
| 7 | Document supersession/currentness | DEFECT_DEMONSTRATED_AND_CLOSED | CLOSED_STRONGLY_EVIDENCED | No |
| 8 | Scans/OCR/image-only content | CLOSED_WITH_POSITIVE_EVIDENCE (detection) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | No |
| 9 | Graphics/charts/diagrams | CLOSED_WITH_POSITIVE_EVIDENCE (detection) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | No |
| 10 | Non-Latin scripts | PARTIALLY_TESTED (CJK only) | ADEQUATELY_EVIDENCED_WITH_LIMITATION | **Yes — DOC-0034/ACQ-031** |
| 11 | Mixed-language documents (code-switched) | UNTESTED | UNTESTED | No (declared boundary, Section 7) |
| 12 | Complex HTML | CLOSED_WITH_POSITIVE_EVIDENCE | CLOSED_STRONGLY_EVIDENCED | No |
| 13 | Appendices/annexes | PARTIALLY_TESTED | PARTIALLY_EVIDENCED | No |
| 14 | Multiple evidence sources | PARTIALLY_TESTED | PARTIALLY_EVIDENCED | No |
| 15 | Provenance/source integrity | PARTIALLY_TESTED | PARTIALLY_EVIDENCED | No |
| 16 | Compound/extreme documents | UNTESTED (deliberate) | UNTESTED | No (declared boundary, Section 7) |
| 17 | Cross-language materiality divergence (EN/ES) | DEFECT_DEMONSTRATED_OPEN | PARTIALLY_EVIDENCED | **Yes — CHK-005 generalised** |
| 18 | Bare-EN/EL-STANDARD-REF false positive | DEFECT_DEMONSTRATED_AND_CLOSED | CLOSED_STRONGLY_EVIDENCED | No |

Corpus count alone was not treated as evidence anywhere above; every classification is anchored to
what was actually tested, per the governing instruction.

### 4A. Non-Latin / no-whitespace / script-boundary assessment

The evidence must be kept separated by mechanism, not collapsed into one "non-Latin" bucket:

- **Latin-script multilingual evidence** (en/es/fr): CLOSED, unchanged, not in question here.
- **CJK evidence (DRA-DOC-0032, Japanese):** closed defect — ASCII-only substantive-content
  assumptions misclassified 182/182 real Japanese segments as `PUNCTUATION_ONLY` pre-fix (75.4%
  content loss); ENG-023's `\p{L}\p{N}` Unicode-property fix plus an ideographic terminator set
  (。！？) closed this to 0% loss, decision unchanged (SUPPORTED/0). This is the "no whitespace word
  delimiting" mechanism.
- **Cyrillic evidence (DRA-DOC-0034, Bulgarian):** admitted post-ROB-001, verdict **PASS**. Zero
  Cyrillic-script `PUNCTUATION_ONLY` misclassifications on first contact (the ENG-023 fix
  generalised without further engineering), 2,815 statements, deterministic (Run A = Run B). This
  is the "different, non-Latin alphabet, but still alphabetic/whitespace-delimited/LTR" mechanism —
  structurally closer to Latin than CJK is. Residual: a narrow, non-decision-changing gap in
  Bulgarian sentence-boundary abbreviation recognition (напр./т.е./стр. not in the Latin
  abbreviation list), disclosed, not fixed.
- **DRA-DOC-0033 (still unexecuted):** the intended Devanagari/Hindi candidate, blocked at
  acquisition by a domain-wide eLegalix HTTP 429, independently confirmed unresolved at three
  separate time points spanning roughly 13–14 hours (2026-08-11 ~16:25 UTC, ~16:58 UTC, and
  2026-08-12 ~05:42 UTC), with retries at 12s/60s/180s/280s not clearing it. Per the governing
  instruction, **this external block does not itself count as a DRA robustness failure**, and is
  recorded as `EXTERNAL_DEPENDENCY` (ledger entry D10), not as robustness evidence in either
  direction.
- **The specific unresolved question:** Devanagari (and abugida/conjunct-consonant scripts,
  RTL/abjad scripts such as Arabic/Hebrew, and scriptio-continua scripts without enumerated
  sentence terminators, e.g. Thai) remain genuinely untested. DRA-ACQ-029 Phase 1 reconnaissance
  (pre-admission, not corpus validation) already characterised one specific, narrow mechanism for
  Devanagari: `SENTENCE_TERMINATOR_CHARS` has no danda (।/॥) entries, so multi-sentence Hindi
  passages would collapse into one segment — the same *shape* of gap already twice demonstrated and
  closed (bare-EN/EL-STANDARD-REF at ENG-012–014; CJK ideographic terminators at ENG-023). A
  counterfactual segmenter for this specific gap already exists (unshipped, analysis-only).

**Determination: DECLARED_GENERALISATION_BOUNDARY, not FREEZE_BLOCKING.**

Reasoning on methodological materiality (not on the cause of the block):

- For the *terminator-set* class of risk (the concrete, reconnaissance-scoped Devanagari finding):
  the mechanism, its likely magnitude, and its remediation approach are already understood in
  advance, by direct analogy to two prior instances of exactly this kind of gap being found,
  characterised, and closed without any evaluator-architecture change. Its consequence (segmentation
  granularity — sentences merging — not silent content loss or corruption) is also already bounded
  by precedent. This is legitimately "sufficiently understood to remain outside the validated scope
  of GC-1," not "credible mechanism with unbounded risk."
- For the *composition-model* class of risk (RTL bidirectional reordering, abugida
  conjunct-consonant clustering, complex script shaping): there is **no** reconnaissance or test
  evidence of any kind. This is architecturally a different question from character classification
  or terminator sets — it could interact with the left-to-right span/offset assumptions used
  throughout Stages 1–2, which is a deeper assumption than anything ENG-023 touched. Declaring this
  a boundary is honest specifically *because* it is unknown, not because it is assumed safe: DRA-GC-1's
  scope statement (Section 7) explicitly excludes RTL and abugida/complex-shaping scripts from its
  validated claim, rather than silently including them.
- Equally, the eLegalix block is not used to dismiss this dimension's importance: it remains ranked
  as the single most information-valuable open uncertainty in the programme (unchanged from
  DRA-ROB-001 Section F), and the freeze specification (separate file) requires this exclusion to
  be stated explicitly in any published claim, not glossed over.

### 4B. Multi-column layout assessment

- **Original frozen result:** DRA-ACQ-030 Phase 2 demonstrated a material, measured defect on the
  frozen Federal Register granule — 55% of oracle-order pairs interleaved, 51% statement-count
  divergence between production and corrected reading order, with no fix built
  (`DEFECT_DEMONSTRATED_OPEN`).
- **ENG-024 improvement:** an opt-in, document-independent, fail-safe hybrid bbox-based column
  detection/reconstruction engine (16/16 synthetic cases, 0 regressions on the existing suite).
  Re-testing the same frozen granule raised pair-adjacency preservation from ~39% (14/36) to ~56%
  (23/41); page 2 reconstructed cleanly (`COLUMN_RECONSTRUCTED`), page 1's ambiguous hybrid layout
  safely fell back to `SINGLE_COLUMN_PASSTHROUGH`. An out-of-sample control (Congressional Record
  Vol. 170 No. 4) engaged reconstruction on 10/51 pages with coherent output and zero disturbance
  of the other 41 single-column pages. Verdict: `PARTIALLY_CLOSED`.
- **ENG-025 reproduced baseline:** live re-run confirmed the exact same figures — 23/41 = 56.1%
  pair-adjacency preservation — as the measurement this review is pinned against
  (machine-verified in Section 8 against `docs/dra/evidence/dra-eng-025-residual-failure-corpus.json`).
- **Complete classification of all 18 residual failures:** `PROSE_COLUMN_BOUNDARY_UNDETECTED` (8,
  44%), `TABLE_SUBCOLUMN_INTERLEAVING` (5, 28%), `MARGINAL_FURNITURE_MISPLACEMENT` (5, 28%). All 18
  trace to one root mechanism.
- **The mixed prose/reference-table page regime:** page 1 of the granule mixes a 2/3-column prose
  section with a differently-dimensioned 3-sub-column reference table; global per-page
  `clusterByXMin` clustering cannot disambiguate the mix, so the whole page falls back to
  passthrough by design rather than guessing.
- **Non-monotonic extractor ordering:** `pdftotext`'s raw bbox block sequence for this page is
  genuinely scrambled in y — not column-major or row-major — independent of any DRA-side defect.
- **Three correction candidates tested:** dot-leader reference-row exclusion (regressed page 2's
  clean result), a global geometric (yMin, xMin) sort fallback (+1 pair only, broke two existing
  synthetic test contracts), and furniture-only positional relocation (safe, zero regressions, but
  zero measurable benefit — produced the exact same 18 failures).
- **Why none satisfied the safety/materiality bar:** each either regressed previously-correct
  behaviour, broke an existing behavioural contract for negligible gain, or added complexity with
  no measurable improvement. None was a safe, generic, materially beneficial change.
- **No unsafe heuristic was shipped**, and **the current implementation is behaviourally identical
  to the validated ENG-024 baseline** (confirmed by `tsc --noEmit` and full targeted-suite
  re-runs producing the same 23/41 result with zero regressions).

**Determination: an acceptable bounded representation limitation, requiring explicit GC-1 scope
wording** — not a freeze blocker, and not so severe as to require its own dedicated scope-limitation
carve-out beyond stating the boundary plainly. Full reading-order reconstruction was never required
for this freeze; the demonstrated behaviour (safe passthrough on ambiguous hybrid layouts, correct
reconstruction on well-formed multi-column layouts, zero silent corruption of content, zero
regression on single-column documents) is exactly the standard a first generalisation candidate
should meet.

---

## 5. Explicit DRA-GC-1 freeze criteria

| Criterion | Status | Evidence |
|---|---|---|
| Acquisition/governance integrity | PASS | Uniform `acquireFreezeAndEvaluate` pipeline for all 34 acquisition attempts; `OFFICIAL_SOURCE_ASSESSMENT`/`LICENCE_ASSESSMENT` VERIFIED-status gate enforced on every admission; freeze governance is a hard runtime boundary (`CorpusAlreadyFrozenError` on any post-freeze add/remove/modify) |
| Representation robustness | CONDITIONAL PASS | 9/9 seed representation dimensions have real evidence; 4 are accepted representation-boundary limitations (footnotes, tables, OCR, graphics); multi-column is now an accepted bounded limitation (Section 4B); non-Latin scripts covers 2 of an open-ended number of script families, with the remainder a declared boundary (Section 4A); compound/extreme and mixed-language remain untested and are declared out of scope (Section 7) |
| Normalisation stability | PASS | Unicode segmentation defect closed (ENG-023) and regression-verified across the full suite; no open normalisation defect for any in-scope script/language |
| Evaluator semantic stability | CONDITIONAL PASS | Every defect classified DEFECT_DEMONSTRATED_AND_CLOSED has a frozen pre-fix baseline, isolated root cause, non-document-specific fix, post-fix measurement, and zero-regression full-suite check. One open, root-caused, not-yet-fixed evaluator defect remains (CHK-005, Stage 5 English-only deontic lexicon) — accepted with an explicit non-English materiality-quality exclusion (Section 7) |
| Determinism | PASS | Run A = Run B substantive-digest equality on every one of the 34 admission/evaluation attempts (33 admitted + DOC-0033's would-be run never executed), no exception on record |
| Proof-receipt integrity | PASS | `verifyReceiptIntegrity` checked on every admitted document, zero failures; exactly 7 stage records per receipt, enforced by schema (`proof-receipts.test.ts`); digest boundary excludes only operational fields (receipt id/timestamp, `evaluatedAt`, the digest itself), never substantive content |
| Corpus integrity | PASS | Corpus version `DRA-CORPUS-1.0.0`, immutable post-freeze; registry requires `DRA-DOC-NNNN` format and uniqueness only, not contiguity — the DRA-DOC-0033 numbering gap is a verified valid state (ledger entry D8), not an integrity defect |
| Absence of known material unfixed defects | CONDITIONAL PASS | No defect meets the bar of invalidating a blind benchmark within GC-1's declared scope (Section 7); all open items are accepted limitations or declared boundaries (Section 6), none is a `FREEZE_BLOCKER` |
| Boundedness of known limitations | PASS | Every accepted limitation in Section 6 has a specific, evidence-backed boundary description; none is "we don't know how bad this is" without also being explicitly excluded from claim scope |
| Independence of the future blind test | PASS, CONDITIONAL ON PROCESS | See Section 7 — requires the blind-test corpus to be disjoint from DRA-DOC-0001–0034 and requires no post-hoc, blind-test-specific engineering |
| No document-specific heuristics | PASS | Every shipped fix in the programme (ENG-016, ENG-017, ENG-018, ENG-019, ENG-020/021/022, ENG-023, ENG-024) is generic and non-document-specific by explicit design and test; every document-specific-shaped candidate fix (ENG-025's three ablation candidates) was rejected rather than shipped |
| Reproducibility of the candidate being frozen | PASS | Fixed evaluator version (`0.1.2`), fixed corpus version (`DRA-CORPUS-1.0.0`), fixed pipeline version (`1.0`), fixed model/schema version (`0.1.0`); benchmark runner supports fixed-timestamp/run-ID reproduction |

### Terminology used consistently in Section 6

- **Known limitation** — a documented boundary whose mechanism and consequences are sufficiently
  understood (e.g. footnote flattening, table-shading loss, the multi-column hybrid-page boundary,
  the Devanagari terminator-set gap).
- **Known defect** — a demonstrated failure in expected behaviour that remains materially and
  safely fixable (e.g. the CHK-005 Stage 5 lexicon gap — root-caused, and a fix path exists, just
  not yet implemented and out of ROB-002's own scope to implement).
- **Untested uncertainty** — a boundary where evidence is insufficient to know whether a material
  defect exists (e.g. RTL/abugida composition-model risk, compound/extreme documents,
  mixed-language code-switching).

These are not conflated anywhere in this review: Section 6 tags each ledger entry with which of
these three categories it belongs to via its `remediationStatus`/`safelyFixable` fields.

---

## 6. Known-defect / limitation ledger

Machine-verified at
`lib/dra-reference/src/benchmark/analysis/dra-rob-002-freeze-readiness-ledger.ts`
(`KNOWN_DEFECT_LEDGER`, 10 entries).

| ID | Subsystem | Category | Severity | Safely fixable | Remediation status | Freeze consequence |
|---|---|---|---|---|---|---|
| D1 | Layout reconstruction (multi-column) | Known limitation | MEDIUM | Attempted, no safe fix found | 3 candidates ablation-tested and rejected; behaviour unchanged from ENG-024 baseline | **ACCEPTED_GC-1_LIMITATION** |
| D2 | Normalisation/segmentation, non-Latin scripts beyond CJK/Cyrillic | Known limitation (terminator-set class) / Untested uncertainty (RTL/abugida class) | MEDIUM_HIGH | Not attempted (blocked externally) | Terminator-set gap mechanistically bounded by precedent; RTL/abugida composition-model risk has zero characterisation | **ACCEPTED_GC-1_LIMITATION** (declared boundary; excluded from claim scope) |
| D3 | Evaluator Stage 5 materiality (EN/ES) | Known defect | MEDIUM_HIGH | Yes, not yet done | Root cause confirmed and generalised (CHK-003 → CHK-005, 12/12); requires a versioned non-English lexicon + new evaluator version, out of ROB-002 scope | **ACCEPTED_GC-1_LIMITATION** (mandatory scope exclusion, Section 7) |
| D4 | Whole-pipeline interaction effects (compound/extreme) | Untested uncertainty | LOW | N/A | Deliberately deferred (ACQ-013 discipline) | **ACCEPTED_GC-1_LIMITATION** (declared boundary) |
| D5 | Normalisation, intra-document mixed-language | Untested uncertainty | LOW | N/A | Not attempted | **ACCEPTED_GC-1_LIMITATION** (declared boundary) |
| D6 | Evaluator Stage 6/7, issue-class coverage ceiling | Known limitation | MEDIUM | N/A (requires V2+ evaluator) | Characterised and disclosed (CHK-002); structural to the frozen V1 evaluator | **ACCEPTED_GC-1_LIMITATION** (bounds claim scope) |
| D7 | Representation/extraction (footnotes, tables, OCR, graphics) | Known limitation | LOW | N/A | Detection closed where feasible; underlying loss accepted by design | **ACCEPTED_GC-1_LIMITATION** |
| D8 | Corpus governance/registry (DOC-0033 numbering gap) | Verified non-issue | NONE | N/A | Verified: registry requires format + uniqueness, not contiguity | **CLOSED** |
| D9 | Evaluator Stage 4 (EL-STANDARD-REF ALL-CAPS residual) | Known limitation | LOW | N/A | Closed with disclosed residual | **ACCEPTED_GC-1_LIMITATION** |
| D10 | Acquisition (eLegalix external block) | External dependency | NONE (to DRA) | N/A | Correctly failed closed; not a DRA robustness failure | **EXTERNAL_DEPENDENCY** |

**No item is classified `FREEZE_BLOCKER`.** This is machine-verified (see Section 8): the ledger
integrity test asserts that if the verdict is `READY_FOR_DRA_GC_1_FREEZE`, the set of
`FREEZE_BLOCKER` entries must be empty, and it is.

---

## 7. Generalisation contamination review and claim scope

### Contamination analysis

The robustness programme has been heavily document-acquisition-driven: 34 documents, each
individually selected to probe a specific hypothesised weakness (footnotes, tables, OCR, graphics,
scale, currentness, Unicode, multi-column, script family, etc.), with iterative engineering
responses to what each one found. This is exactly the kind of process that could make a
"generalisation test" quietly become development-set reuse if the blind-test corpus overlaps with,
or is drawn from the same narrow candidate pool as, the 34 admitted documents (or their publishers'
other documents, chosen with hindsight of what DRA is known to handle well or poorly).

**What must be frozen at DRA-GC-1** (detailed in the freeze specification):

- Evaluator version (`DRA_EVALUATOR_VERSION = "0.1.2"`) and pipeline version (`1.0`).
- Normalisation implementation (Stage 1–2, including the ENG-023 Unicode fix).
- Acquisition semantics relevant to evaluation (freeze governance, digest boundary, currentness V2).
- Layout-reconstruction behaviour (the ENG-024 bbox hybrid engine, unchanged since ENG-025).
- Issue definitions (the 9 issue classes, 3 currently triggerable under V1).
- Decision semantics (SUPPORTED/REVIEW/HOLD and their triggering rules).
- Thresholds/configuration (materiality rules, confidence levels, SIZE_LIMIT/OVERSIZED constants,
  etc.).
- Proof-receipt schema/semantics (7-record structure, digest exclusions).

**What would invalidate a subsequent blind generalisation run:**

- Any change to the items above made *because of* an observed blind-test result (this would be
  exactly the document-specific-heuristic pattern this programme has consistently refused to ship,
  e.g. all three rejected ENG-025 candidates).
- Reusing any of DRA-DOC-0001–0034 (or byte-identical/near-identical documents from the same
  publisher chosen after seeing how those specific documents perform) as blind-test material.
- Any relaxation of the "no document-specific heuristics" discipline that has held for the entire
  programme to date.

### Permitted claim scope for DRA-GC-1

**In scope (validated):**

- English, Spanish, French, Japanese, and Bulgarian source documents in PDF or HTML format, from an
  official/licensed source, left-to-right, of the sizes tested (up to and including ~25,600
  statements, with confirmed O(n) Stage 4 scaling).
- Deterministic, reproducible evaluation with verifiable proof receipts.
- Detection (not necessarily correction) of: footnote-anchor loss, table-shading-semantics loss,
  OCR/scan corruption, non-redundant graphical/diagram meaning loss, and reading-order corruption on
  ambiguous hybrid-layout pages.
- Issue detection limited to the 3 currently triggerable classes: `EVIDENCE_ABSENT`,
  `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`.
- Well-formed multi-column layouts (confirmed reconstruction, e.g. the Congressional Record
  out-of-sample control).

**Explicitly excluded from DRA-GC-1's claim scope (not evidenced as safe):**

- Right-to-left scripts (Arabic, Hebrew, and similar abjads).
- Abugida/conjunct-consonant composition scripts (Devanagari and related Brahmic scripts).
- Scriptio-continua scripts without an enumerated sentence-terminator set (e.g. Thai).
- Materiality/obligation-detection quality for non-English source text (known Stage 5 English-only
  deontic-lexicon gap, ledger D3) — English-language materiality assessment is unaffected.
- Compound/extreme documents that combine two or more already-characterised weaknesses.
- Single documents with internally mixed languages/code-switching.
- Full reading-order restoration on pages that mix structurally different column-width regimes
  (e.g. prose columns adjacent to a differently-dimensioned reference table) — behaviour fails safe
  to passthrough rather than corrupting content, but does not reconstruct correct order there.
- Any issue class beyond `EVIDENCE_ABSENT`/`EVIDENCE_INADEQUATE`/`CLAIM_INCONSISTENCY`.

**Claims DRA-GC-1 must not make:** "works on all documents," "solves unreliable digital documents
worldwide," "proven universal document trust infrastructure," or any claim implying validated
non-Latin script support beyond the two tested families, validated multi-language decision quality,
or validated compound/mixed-language handling. The scope above is what a subsequent publication
methodology should cite.

---

## 8. Test and verification results

Per the governing instruction, only genuinely load-bearing ROB-002 claims were made
machine-verifiable, added at
`lib/dra-reference/src/benchmark/analysis/dra-rob-002-freeze-readiness-ledger.ts` (data) and
`lib/dra-reference/src/benchmark/analysis/__tests__/dra-rob-002-freeze-readiness-review.test.ts`
(14 tests). These check:

1. The robustness matrix reconstructs exactly the 18 dimensions inherited from DRA-ROB-001.
2. Every dimension has a classification and an explicit, non-vacuous "can this invalidate the
   GC-1 claim" judgement, and no dimension is left both unbounded/undocumented *and* capable of
   invalidating the claim.
3. The non-Latin-scripts and multi-column rows reflect the ROB-002 update, not stale ROB-001 wording.
4. Every known-defect ledger entry has all required fields populated and a recognised
   `freezeConsequence`; ledger IDs are unique.
5. **No entry is classified `FREEZE_BLOCKER`, consistent with the `READY_FOR_DRA_GC_1_FREEZE`
   verdict** (this assertion is bidirectional: it would also fail loudly if the verdict were
   flipped to NOT_READY while a blocker-free ledger remained).
6. The eLegalix acquisition block is recorded as `EXTERNAL_DEPENDENCY`, never as a robustness
   defect.
7. The CHK-005 finding is recorded with `safelyFixable: YES_NOT_YET_DONE` and
   `ACCEPTED_GC-1_LIMITATION`, not silently dropped.
8. The frozen evaluator version (`0.1.2`) and corpus version (`DRA-CORPUS-1.0.0`) cited by this
   review match the live values in `lib/dra-reference/src/model/versions.ts` and
   `lib/dra-reference/src/benchmark/governance/version.ts` (drift detection).
9. The multi-column baseline (41 total pairs, 23 preserved, 56.1% fraction, 18 residual failures)
   cited by this review is read directly from `docs/dra/evidence/dra-eng-025-residual-failure-corpus.json`
   and asserted equal, not independently re-typed.
10. Exactly one recognised primary verdict is issued.

**Run 1 — targeted ROB-002 integrity tests:**
`npx vitest run src/benchmark/analysis/__tests__/dra-rob-002-freeze-readiness-review.test.ts` →
**14/14 passed.**

**Run 2 — relevant repository/regression tests** (full `src/benchmark/acquisition` suite, the same
scope used by the ENG-025 closure review for an apples-to-apples comparison):
`npx vitest run src/benchmark/acquisition` → **1,491 passed / 22 failed of 1,513, across 110 files**
— identical to the baseline recorded at ENG-025 closure. All 22 failures are pre-existing, stale
`DRA_EVALUATOR_VERSION` assertions in discovery tests written before the ENG-014 `0.1.1 → 0.1.2`
version bump (e.g. `dra-acq-015/016/017-*-discovery.test.ts`), unrelated to this review. A broader
run of `src/benchmark` (210 files, including execution/benchmark-runner suites that depend on
network access or pre-populated disk caches) additionally surfaces known, previously-documented,
environment-dependent flakiness (e.g. `DRA-BMK-022` text-cache-not-found errors) — these are
infrastructure-dependent, not attributable to this review's changes, and are outside the scope of
"relevant" tests for a data-only review programme.

**Run 3 — `tsc --noEmit`:** exactly the same 2 pre-existing, unrelated type errors reconfirmed by
every prior closure report since ENG-021: `CitationIntegrityReport.overallStatus` in
`dra-acq-026-long-range-structural-robustness.test.ts`, and a `groundTruthExamples` literal-union
mismatch in `dra-acq-025-non-redundant-graphics-discovery.ts`. No new type error was introduced.

**No pre-existing failure was newly introduced or masked by this review; no pre-existing failure
was fixed (out of scope).**

---

## 9. Exact files created or modified

**Created:**
- `docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md` (this file).
- `docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md` (draft freeze specification; freeze not executed).
- `lib/dra-reference/src/benchmark/analysis/dra-rob-002-freeze-readiness-ledger.ts` (robustness
  matrix + known-defect ledger, data-only).
- `lib/dra-reference/src/benchmark/analysis/__tests__/dra-rob-002-freeze-readiness-review.test.ts`
  (14 integrity tests).

**Modified:** none. No production evaluator file, corpus fixture, frozen artefact, or historical
benchmark result was changed.

---

## 10. Remaining limitations (carried into DRA-GC-1's scope statement)

See Section 7 for the exhaustive excluded-scope list. In one sentence each, for quick reference:
non-Latin scripts beyond CJK/Cyrillic are untested and excluded; Spanish/French materiality
detection has a known, disclosed lexicon gap; compound/extreme and mixed-language documents are
untested and excluded; multi-column reconstruction is bounded and fails safe on hybrid layouts;
only 3 of 9 issue classes are triggerable under the frozen V1 evaluator.

---

## 11. Final recommendation

**Issue verdict `READY_FOR_DRA_GC_1_FREEZE`.** Proceed to review and approve the draft freeze
specification (`docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md`), but do not execute the freeze or start
`DRA-GEN-001` automatically — both remain explicit next-programme decisions outside ROB-002's scope.
Per the governing programme boundaries, this review does not retry DRA-DOC-0033, acquire a new
document, engineer another multi-column heuristic, change evaluator semantics, alter corpus
history, redefine issue classes, or attempt to improve any score.
