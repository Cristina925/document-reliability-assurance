# DRA-ROB-001 — Robustness Evidence Coverage and Remaining-Gap Review

**Status:** Analysis/checkpoint programme. No document acquired, no production evaluator behaviour modified,
no historical benchmark result altered. DRA-DOC-0034 not started.

**Corpus scope reviewed:** the 32 admitted documents (DRA-DOC-0001–DRA-DOC-0032), with focus on the
deliberate robustness programme beginning at DRA-DOC-0024.

**DRA-DOC-0033 status (unchanged by this programme):** `DRA-ACQ-029 Phase 2 — BLOCKED_PENDING_LIVE_SOURCE_REACQUISITION`.
Not counted as admitted evidence anywhere below. The Hindi/Devanagari findings from DRA-ACQ-029 Phase 1
discovery and the two blocked Phase 2 acquisition attempts are labelled **PRE_ADMISSION_EMPIRICAL_RECONNAISSANCE**
throughout this report, never corpus validation. The prepared DRA-ACQ-029 artefacts (admission test, danda-aware
counterfactual segmenter) were not modified during this review.

---

## A. Executive conclusion

**MID-STAGE, closer to NEAR_CLOSURE than to EARLY.**

The programme has already engineered-and-closed five genuinely demonstrated defects (Stage 4 scalability,
citation-linkage, three-part currentness/supersession chain, and Unicode segmentation), and has produced
strong, disclosed, evidence-backed acceptance of four representation-boundary limitations (footnotes, table
shading, OCR, graphics) that are correctly understood to be *out of scope for correction*, not open defects.
Evaluation robustness (Category C) is in the best shape of the three categories: every closed defect there has
a frozen pre-fix baseline, an isolated root cause, a non-document-specific fix, a post-fix measurement, and a
zero-regression full-suite check — this is the strongest evidence in the entire programme.

It is not yet READY_FOR_GC1_FREEZE for two concrete reasons:

1. **One genuinely new, high-value gap (non-Latin scripts) is only half-closed.** DRA-DOC-0032 (Japanese)
   confirmed the ENG-023 Unicode fix generalises to CJK ideographic script and closed the specific defect it
   found. But the corpus still has **zero admitted documents in any non-CJK, non-Latin script family**
   (Devanagari/Brahmic abugida, Arabic/Hebrew abjad, Cyrillic, Hangul, etc.), and the single planned experiment
   to test the next such family (DRA-ACQ-029, Devanagari) is currently blocked at the acquisition gate, not
   merely unscheduled. Freezing DRA-GC-1 before this resolves would mean generalising a "non-Latin scripts:
   closed" claim from a sample of one script family.
2. **One genuine gap remains formally NOT_TESTED with no experiment even attempted**: compound/extreme
   documents. It does not block a freeze on its own (it is ranked below non-Latin scripts and is structurally
   similar to already-characterised representation-boundary problems), but a freeze checklist cannot honestly
   claim "major planned representation dimensions exercised" while it sits at zero evidence.
3. **Multi-column layout is now DEFECT_DEMONSTRATED_OPEN, not UNTESTED.** DRA-ACQ-030 Phase 2 demonstrated a
   material, measured defect (55% of truth-order pairs interleaved; 51% statement-count divergence between
   production and corrected reading order) with no engineering fix built. This moves multi-column from "zero
   evidence" to "evidence exists, remediation pending" — an improvement in evidentiary completeness, but it does
   **not** itself clear the freeze checklist, since the open defect still needs an explicit accept/fix decision
   before GC-1.

The shortest defensible path to a freeze does **not** require reaching Document 40, and does not require a
second CJK document. It requires: (a) resolving the DRA-ACQ-029 acquisition block or substituting an
equally-suited alternate non-Latin, non-CJK candidate, (b) one compact compound/extreme experiment, and (c) an
explicit accept-or-fix decision on the now-demonstrated multi-column defect. See Section F/H for the exact
recommended programme.

---

## B. Robustness evidence matrix

This report reuses, rather than reinvents, the existing formal evidence-gap ranking already produced in code at
`lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-028-non-latin-script-discovery.ts`
(`ROBUSTNESS_EVIDENCE_MAP`, lines 134–350; `RANKED_REMAINING_GAPS`, lines 374–428). That map was built by the
DRA-ACQ-028 Phase 1 programme specifically to answer "which dimension should be tested next" and remains
accurate as of the 32-document corpus (DRA-DOC-0032 only closed the non-Latin-scripts entry partially — see
below — and touched no other row). It already correctly distinguishes EXPLICITLY_TESTED evidence from
INCIDENTALLY_PRESENT exposure via its `exposureVsDemonstratedNote` field on every row — this report adopts that
same distinction rather than restating it with new terminology.

| # | Dimension | Status (DRA-ROB-001 classification) | Evidence class | Source |
|---|---|---|---|---|
| 1 | Footnotes/endnotes | **DEFECT_DEMONSTRATED_AND_CLOSED** (as an acceptance, not a fix) — extraction-level flattening confirmed at DRA-DOC-0009 (BCBS) and DRA-DOC-0024 (CRS); DRA-ACQ-020 Phase 2 showed it does not reliably cascade to decision level | EXPLICITLY_TESTED | ACQ-020 Phase 2 |
| 2 | Tables/tabular semantics | **CLOSED_WITH_POSITIVE_EVIDENCE** for *detection* (ENG-015 fill-colour-diversity signal, 0/15 false-positive rate); underlying shading-semantics loss remains an **accepted, disclosed representation boundary**, not a defect requiring closure | EXPLICITLY_TESTED | ACQ-021 Phase 2, ENG-015 |
| 3 | Multi-column layout | **PARTIALLY_CLOSED** (was DEFECT_DEMONSTRATED_OPEN) — DRA-ENG-024 built an opt-in, document-independent bbox-based column detection/reconstruction engine with fail-safe passthrough on ambiguous layouts (16 synthetic cases, 0 regressions on the existing corpus/test suite). Re-testing the frozen DRA-ACQ-030 Federal Register granule live shows a measured, partial improvement (pair-adjacency preservation against the Phase 2 oracle rose from ~39% to ~56%), not full restoration: the granule's embedded page-furniture/table hybrid layout on one of its two pages still falls back to passthrough by design rather than guessing. An out-of-sample control (Congressional Record Vol. 170 No. 4) engaged reconstruction on 10/51 pages with coherent, correctly-ordered output and zero observed reordering of the 41 single-column pages. See `DRA-ENG-024-MULTICOLUMN-READING-ORDER-CLOSURE-REPORT.md`. | EXPLICITLY_TESTED | ACQ-030 Phase 1 (discovery), ACQ-030 Phase 2 (materiality experiment), ENG-024 (closure engineering + re-test) |
| 4 | Very large documents/scalability | **DEFECT_DEMONSTRATED_AND_CLOSED** — O(n²)→O(n) Stage 4 fix, exactness proof, 35–45 min → <5 s | EXPLICITLY_TESTED | ACQ-026 Phase 2, ENG-019 |
| 5 | Scientific citations/references | **DEFECT_DEMONSTRATED_AND_CLOSED** — two narrow segment-content.ts fixes (bracket line-wrap, reference-entry shredding), DRA-DOC-0026 regression verified | EXPLICITLY_TESTED | ACQ-022 Phase 2, ENG-016 |
| 6 | Legal authority/versioning | **DEFECT_DEMONSTRATED_AND_CLOSED** — three-programme chain (ENG-020/021/022) | EXPLICITLY_TESTED | ACQ-027, ENG-020/021/022 |
| 7 | Document supersession/currentness | **DEFECT_DEMONSTRATED_AND_CLOSED** — same chain as #6 | EXPLICITLY_TESTED | ACQ-027, ENG-020/021/022 |
| 8 | Scans/OCR/image-only content | **CLOSED_WITH_POSITIVE_EVIDENCE** for provenance/fidelity *detection* (ENG-017); underlying OCR-corruption problem is an **accepted limitation by design** | EXPLICITLY_TESTED | ACQ-023 Phase 2, ENG-017 |
| 9 | Graphics/charts/diagrams (non-textual meaning) | **CLOSED_WITH_POSITIVE_EVIDENCE** for *detection* (ENG-018 six-property model); underlying graphical-semantics loss is an **accepted limitation by design** | EXPLICITLY_TESTED | ACQ-024/025 Phase 2, ENG-018 |
| 10 | Non-Latin scripts | **PARTIALLY_TESTED** (see discussion below — this report downgrades the pre-DOC-0032 "NOT_TESTED" row in code to PARTIALLY_TESTED now that Japanese exists, but explicitly not to CLOSED) | EXPLICITLY_TESTED for CJK only | ACQ-028 Phase 1/2, ENG-023 |
| 11 | Mixed-language documents (single doc, code-switched) | **UNTESTED** | NOT_TESTED | none |
| 12 | Complex HTML | **CLOSED_WITH_POSITIVE_EVIDENCE** | EXPLICITLY_TESTED | ACQ-006, ACQ-012, ACQ-016 |
| 13 | Appendices/annexes | **PARTIALLY_TESTED** — one data point (ACQ-024 Phase 2 appendix-mediated recoverability), not generalised | EXPLICITLY_TESTED (narrow) | ACQ-024 Phase 2 |
| 14 | Multiple evidence sources (single evaluation, >1 authoritative source) | **PARTIALLY_TESTED** — real incidental exposure (DRA-DOC-0001/0003/0004/0005 cite multiple standards), no dedicated reconciliation/conflict experiment | INCIDENTALLY_PRESENT | corpus documents 1/3/4/5 |
| 15 | Provenance/source integrity | **PARTIALLY_TESTED** — narrowly engineered for OCR/scan fidelity only (ENG-017); broader chain-of-custody/mirror/translation provenance untested | EXPLICITLY_TESTED (narrow) | ENG-017 |
| 16 | Compound/extreme documents | **UNTESTED** (deliberately deferred by design, per ACQ-013's single-variable discipline — not an oversight) | NOT_TESTED | none |
| 17 | Cross-language materiality divergence (EN vs ES) | **DEFECT_DEMONSTRATED_OPEN** — CHK-003/CHK-005 traced one confirmed EN/ES statement-level divergence to Stage 5 materiality; 6/7 candidate pairs unresolved (no anchor); never engineered | EXPLICITLY_TESTED | CHK-003, CHK-005 |
| 18 | Lowercase-follows-period ("bare EN"/EL-STANDARD-REF) false positive | **DEFECT_DEMONSTRATED_AND_CLOSED**, with disclosed residual | EXPLICITLY_TESTED | ENG-012/013/014/014A |

Additional dimensions this review recovers beyond the task's seed list (per instruction not to assume the
seed list complete): **document supersession/currentness** (distinct from static authority classification —
row 10 above), **cross-language materiality divergence** (row 17, a genuine open finding not covered by the
task's seed list), and the **lowercase-follows-period sentence-boundary false positive** (row 18, closed
pre-programme but structurally the same *kind* of risk — ASCII-centric sentence-boundary heuristics — that the
danda gap now re-raises for Devanagari).

---

## C. Document 24–32 contribution matrix

| Doc | Publisher / jurisdiction / domain | Format, language, scale | Intended robustness target | Decision / issues | Defect exposed |
|---|---|---|---|---|---|
| DRA-DOC-0024 | Congressional Research Service (US, TECHNICAL) | PDF, en-US, ~9,235 statements | Dense footnote/citation structure | REVIEW, 1×EVIDENCE_INADEQUATE | Y — footnote-flattening reproduced (Category B), decision-level impact prose-dependent |
| DRA-DOC-0025 | U.S. EIA/DOE (US, FINANCE) | PDF, en-US, 4,854 statements | Complex tables, historical/forecast visual shading | HOLD, 89×EVIDENCE_ABSENT | Y — silent shading loss, representation-boundary (not evaluator) defect |
| DRA-DOC-0026 | PLOS (international, TECHNICAL) | PDF, en-US, 1,127 statements | Citation linkage, bracket line-wrap | SUPPORTED, 0 issues | Y — bracket-internal wrap loss + reference-entry shredding (Stage 2), fixed by ENG-016 |
| DRA-DOC-0027 | US GPO/GovInfo, House Science Committee (US, GENERAL) | OCR-derived PDF, en-US, 5,323 statements | Scan/OCR representation fidelity | HOLD, 11 issues | Y — stamp-garbling + a second silent-incompleteness pattern, addressed by ENG-017 provenance/fidelity metadata |
| DRA-DOC-0028 | FDA/CDRH (US, HEALTHCARE) | PDF, en-US | Flowchart topology preservation | REVIEW, 1×EVIDENCE_INADEQUATE | Y — flowchart topology loss; appendix checklist made it MATERIAL_BOUNDED not unrecoverable |
| DRA-DOC-0029 | CDC, Emerging Infectious Diseases (US, HEALTHCARE) | PDF, en-US, 581 statements | Non-redundant whole-diagram raster loss | HOLD, 3 issues | Y — whole-diagram loss confirmed SILENT, MATERIAL_UNRECOVERABLE falsified → MATERIAL_BOUNDED |
| DRA-DOC-0030 | NIST (US, TECHNICAL) | PDF, en-US, 25,603 statements (SP 800-53 Rev5) | Long-range linkage at very large scale | REVIEW, 1×EVIDENCE_INADEQUATE | Y — O(n²) Stage 4 scaling prevented timely completion pre-ENG-019; closed |
| DRA-DOC-0031 | NIST (US, TECHNICAL) | PDF, en-US (SP 800-53 Rev4) | Version/supersession vs DOC-0030 | HOLD, 4×EVIDENCE_ABSENT + 1×EVIDENCE_INADEQUATE | Y — supersession/currentness capability gap confirmed, closed by ENG-020/021/022 |
| DRA-DOC-0032 | Cabinet Office, Japan (Japan, GENERAL) | PDF, ja, 538,281 bytes, 70→273 statements pre/post fix | Non-Latin, non-whitespace-delimited script baseline | SUPPORTED, 0 issues | Y — 75.4% Japanese content loss pre-ENG-023, 0% post-fix, closed |

**What each document actually contributed** (not just "what it is"): 0024 established that a demonstrated
extraction defect need not be decision-material; 0025 established the representation-boundary vs. defect
distinction that ENG-015 later formalised; 0026 is the only document that produced a *directly engineered and
regression-verified fix* among 24–29; 0027 forced the provenance/fidelity axis to be invented (0024–0026 had no
mechanism to say "this text came from OCR"); 0028/0029 jointly established that graphical-semantic loss is
SILENT and sometimes appendix-recoverable, forcing ENG-018's detection model; 0030/0031 are the only pair in
the whole corpus that were acquired specifically *as a pair* to test a relational property (supersession)
rather than each document's own content; 0032 is the only document in the corpus that ever exercised the
normalisation stage against non-Latin, non-whitespace-delimited text.

---

## D. Defect/closure ledger

| ID | Discovering doc | Stage | Symptom | Magnitude | Root cause | Fix | Post-fix | Regression evidence | Closure |
|---|---|---|---|---|---|---|---|---|---|
| Footnote flattening | DOC-0009, DOC-0024 | Representation/extraction | Footnote markers/text absorbed into body prose, anchor lost | Prose-style dependent; no corpus-wide % | PDF text-extraction linearisation | None attempted (by design) | N/A | N/A | **ACCEPTED_LIMITATION** |
| Table shading loss | DOC-0025 | Representation/extraction | Historical/forecast status (fill colour only) lost | 89/89 statements in affected doc lost the distinction | Text extraction omits visual fill semantics | ENG-015: pdftocairo-SVG fill-diversity *detector* (not a recovery) | 0/15 corpus false-positive rate | ENG-019 regression list preserves DOC-0025 | **DETECTION CLOSED / underlying loss ACCEPTED_LIMITATION** |
| Citation bracket line-wrap + reference shredding | DOC-0026 | Stage 2 (claim extraction) | Bracket-internal citation markers split across lines; reference-list entries shredded into fragment statements | 2 named failure modes (W1, W2) | segment-content.ts line-based splitting logic | ENG-016: narrow, non-document-specific regex fixes | DOC-0026 regression: VERIFIED_LINKAGE | 205-test ENG-019 full regression, zero change | **DEFECT_DEMONSTRATED_AND_CLOSED** |
| OCR corruption absorbed as ordinary content | DOC-0027 | Extraction→Stage 2 boundary | Stamp-garbling + a second silent-incompleteness pattern, no distinguishing signal | 2 defect instances, no document-wide % measured | No representation-provenance concept existed | ENG-017: independent `provenance`/`fidelity` axes on freeze record, digest-excluded | Font-embedding-status OCR discriminator validated | Representation regression test suite | **PROVENANCE/FIDELITY DETECTION CLOSED / underlying OCR loss ACCEPTED_LIMITATION** |
| Flowchart topology loss | DOC-0028 | Representation/extraction | Directed-edge/backward-arrow topology lost as flattened prose | FALSE_TOPOLOGY (not merely silent) | Extraction has no graph/diagram model | ENG-018: 6-property graphical-semantic-completeness detector (raster-only) | Appendix-checklist redundancy recovered topology → MATERIAL_BOUNDED (not MATERIAL_UNRECOVERABLE) | 3 independent closure classifications | **DETECTION CLOSED / recovery out of scope by design** |
| Whole-diagram raster loss | DOC-0029 | Representation/extraction | Entire non-redundant diagram's meaning absent from text | Total loss for that diagram | Same as above — no graphical model | ENG-018 (shared programme) | SILENT confirmed; MATERIAL_UNRECOVERABLE hypothesis falsified → MATERIAL_BOUNDED | ENG-018 3-classification framework | **DETECTION CLOSED / recovery out of scope by design** |
| Stage 4 O(n²) scalability | DOC-0030 | Evaluation (Stage 4) | Evidence linkage did not complete in reasonable time at scale | 25,603 statements: 35–45 min pre-fix | Per-call source re-derivation, no caching | ENG-019: WeakMap-by-reference cache, exactness proof | <5 s for the same document | Full regression suite, zero digest/decision change | **DEFECT_DEMONSTRATED_AND_CLOSED (STRONG)** |
| Supersession/currentness blind spot | DOC-0030 vs DOC-0031 | Governance (outside Stages 1–7) | No signal that an authentic document had been superseded | Both evaluated identically pre-fix | No currentness concept existed | ENG-020 (semantics) → ENG-021 (evidence-integrity digest) → ENG-022 (freeze-digest V2 cutover, closes strip-both-fields bypass) | DOC-0031 HOLD/5, DOC-0030 REVIEW/1, both correct and unchanged | 16 semantic + 14 tamper + 11 attack-scenario tests | **DEFECT_DEMONSTRATED_AND_CLOSED (STRONG, 3-stage chain)** |
| ASCII-only Stage 2 segmentation (Unicode/CJK) | DOC-0032 | Stage 2 (segmentation + classification) | Ideographic terminators (。！？) not recognised; ASCII `[a-zA-Z0-9]` substantive test misclassified Japanese as PUNCTUATION_ONLY | 182/182 real misclassifications, 75.4% content loss, 70 vs 273 statements | ASCII-only regex assumptions in `segment-content.ts`/`classify-segments.ts` | ENG-023: `\p{L}\p{N}` Unicode property classes, ideographic terminator set | 0% loss, 434 segments (was 407), 273 statements (was 70), decision unchanged SUPPORTED/0 | 36 focused tests + full-suite regression, zero genuine regressions | **DEFECT_DEMONSTRATED_AND_CLOSED (STRONG)** |
| Cross-language (EN/ES) materiality divergence | CHK-003/CHK-005 (not a numbered acquisition) | Stage 5 (materiality) | One confirmed EN/ES statement pair with different materiality outcomes on parallel-translated content | 1/7 candidate pairs confirmed; root cause traced to Stage 5 for that pair only | Root cause traced but not generalised/fixed | None | N/A | N/A | **DEFECT_DEMONSTRATED_OPEN** |
| Devanagari danda (।/॥) not recognised as sentence terminator | DRA-ACQ-029 Phase 1 reconnaissance (**PRE_ADMISSION**, DOC-0033 not admitted) | Stage 2 (segmentation) | Multi-sentence Hindi passages collapse into one segment; pure Devanagari prose still correctly passes the ENG-023 substantive-content test | Counted in reconnaissance only (328 danda / 0 double-danda in the selected candidate PDF); no corpus-admitted measurement yet | `SENTENCE_TERMINATOR_CHARS` set has no Devanagari entries (script gap symmetrical to the pre-ENG-023 CJK gap) | Analysis-only counterfactual segmenter written (`support/segment-content-danda-aware-counterfactual.ts`); no production fix | N/A — not yet run against admitted content | N/A | **PRE_ADMISSION_FINDING / EXPERIMENT_PENDING** |

Per the task's explicit precision requirement, the Japanese Stage 2 defect entry above is stated to the exact
figures required: DRA-DOC-0032; 75.4% pre-fix Japanese-script content loss; 0% official-English-control loss;
ASCII-only substantive-content assumption as root cause; ENG-023 Unicode-aware correction; loss 75.4%→0%;
statements 70→273; English control unchanged; final decision remained SUPPORTED/0 issues; gap **CLOSED**.

---

## E. Category-separated coverage (acquisition / representation / evaluation robustness)

**A. Acquisition robustness** — official-source verification, licensing, source stability, redirects, dynamic
sources, rate limiting, byte-vs-text stability, versioning, provenance.
- CLOSED_WITH_POSITIVE_EVIDENCE: official-source verification methodology (every acquisition since ACQ-006 has
  an independent governance record); dynamic/hidden HTML reconstruction (ACQ-006/012/016); byte-stability
  determinism (every admission test's two-independent-fetch check, 29 consecutive successful pairs through
  DOC-0032); redirect handling (ACQ-015's redirect-chain licence verification).
- PARTIALLY_TESTED: rate limiting — DRA-ACQ-029's own eLegalix experience (HTTP 429 + `Retry-After`, persisting
  through multiple wait intervals) is the *first* time the acquisition pipeline has actually encountered a live,
  sustained rate-limit block, and it happened outside a numbered acquisition report (recorded only in this
  session's memory and the blocked admission test). This is real operational evidence that acquisition
  robustness includes "graceful stop when blocked," which the pipeline handled correctly (it does not currently
  auto-retry or evade), but it has not been formalised into a named acquisition-robustness finding.
- UNTESTED: cross-organisation source versioning beyond the NIST Rev4/Rev5 pair (a single instance, not a
  general capability); provenance beyond OCR/scan (chain-of-custody through mirrors/republication/translation
  — see row 15 above).

**B. Representation robustness** — extraction, layout, tables, visual semantics, OCR, Unicode, segmentation,
sentence boundaries, multilingual text, appendices, ordering, scale.
- This category holds essentially all of the *accepted limitations* (footnotes, tables, OCR, graphics) — DRA's
  position here is well-evidenced and well-disclosed, not weak; the evidence strength is high precisely because
  each acceptance is backed by a dedicated experiment plus, in most cases, an engineered *detection* capability.
- The one live UNTESTED gap (compound/extreme), the now-DEFECT_DEMONSTRATED_OPEN multi-column gap (DRA-ACQ-030
  Phase 2), and the one PARTIALLY_TESTED gap (non-Latin scripts beyond CJK) all sit in this category. This is
  where the remaining freeze-relevant uncertainty is concentrated.
- Scale is CLOSED (DOC-0030, ENG-019) with a strong mechanistic proof, not just an empirical pass.

**C. Evaluation robustness** — claim formation, evidence linkage, authority handling, inconsistency detection,
issue generation, deterministic decisions, proof receipts, semantic preservation, evaluator scaling.
- This is the strongest category. Every defect classified DEFECT_DEMONSTRATED_AND_CLOSED above (Stage 4 scaling,
  citation linkage, currentness chain, Unicode segmentation) lives here, and each has all nine STRONG-closure
  properties from Section 6 methodology (see below).
- Determinism: every admission test since DOC-0018 runs a Run A/Run B substantive-digest equality check; this
  has passed on every one of the 32 admitted documents with no exception recorded anywhere in the corpus.
- Proof receipts: `verifyReceiptIntegrity` has been checked on every admitted document with no failure.
- Open item: issue-class coverage is stuck at 3/9 (IC-4 EVIDENCE_ABSENT, IC-5 EVIDENCE_INADEQUATE, IC-7
  CLAIM_INCONSISTENCY) across all 32 documents and confirmed by DRA-CHK-002 to be a **structural ceiling of the
  frozen V1 evaluator**, not a corpus-sampling failure — six issue classes (IC-1, IC-2, IC-3, IC-6, IC-8, IC-9)
  are untriggerable by any document under the current evaluator and require Version 2+ evaluator development.
  This is explicitly out of scope for DRA-ROB-001 (no evaluator changes) but is a material fact for the GC-1
  freeze checklist in Section G.

---

## F. Remaining uncertainty ranking (highest to lowest information value)

1. **Non-Latin, non-CJK script family (e.g. Devanagari/Brahmic abugida, Arabic/Hebrew abjad, Cyrillic, Hangul).**
   HIGH_INFORMATION_GAIN. DOC-0032 confirmed the ENG-023 fix generalises to *one* non-Latin family (CJK,
   ideographic, no whitespace word delimiting). It has not been shown to generalise to a family with an entirely
   different composition model (Devanagari conjunct consonants + matra vowel signs + danda punctuation, or a
   right-to-left abjad). A second CJK document would be LOW_INFORMATION_GAIN (same mechanism); a genuinely
   different script family is not redundant.
2. **Multi-column layout.** MEDIUM_INFORMATION_GAIN. Genuinely untested, structurally similar in *kind* to
   already-characterised representation-boundary problems (table/graphics loss), so the marginal architectural
   surprise is smaller than #1, but it is a real, plausible, and currently completely unaddressed failure mode
   for reading order.
3. **Compound/extreme documents (2+ already-known weaknesses combined).** MEDIUM_INFORMATION_GAIN, but only once
   individual dimensions are well-characterised (which they now largely are for 8 of the 9 seed dimensions).
   This is the natural next experiment after #1 and #2, not a replacement for either.
4. **Mixed-language (single-document, code-switched) text.** MEDIUM_INFORMATION_GAIN once a second script
   baseline exists; LOW value in isolation before that, since it shares the normalisation-stage mechanism with
   #1 and would confound two variables if attempted first.
5. **Cross-language (EN/ES) materiality divergence (the one open CHK-005 finding).** MEDIUM_INFORMATION_GAIN for
   evaluator correctness specifically, but this is a Stage 5 evaluation-logic question, not a corpus-acquisition
   question — closing it does not require a new document, only further direct-pipeline analysis of already-frozen
   content (CHK-003/CHK-005 style). Relevant to GC-1 readiness (Section G) independent of document count.
6. **Multiple evidence sources / conflicting provenance.** LOW_INFORMATION_GAIN relative to cost — real exposure
   already exists incidentally in 4 corpus documents; a dedicated experiment would need to construct an
   artificial conflict scenario (weakening authoritative-ground-truth cleanliness) to add much beyond what is
   already observed.
7. **Appendices/annexes generalisation beyond the one ACQ-024 data point.** LOW_INFORMATION_GAIN — the existing
   data point already demonstrates the mechanism (redundant restatement can recover lost meaning); a second
   instance would mostly confirm rather than newly inform.
8. **Provenance beyond OCR/scan (mirrors, translations, chain of custody).** LOW_INFORMATION_GAIN for the GC-1
   freeze specifically (not required by the blind-benchmark methodology), though potentially relevant to later
   production/infrastructure readiness (see Section I).
9. **A second instance of any already-CLOSED dimension** (second footnote document, second OCR document, second
   large-scale document, etc.) — **REDUNDANT** for GC-1 purposes unless it targets a demonstrably different
   sub-mechanism (e.g. right-to-left OCR, or a footnote style with numbered cross-references rather than markers).

---

## G. DRA-GC-1 freeze readiness checklist

| Criterion | Status | Evidence |
|---|---|---|
| **Evaluator — deterministic** | ✅ PASS | 32/32 admitted documents show Run A = Run B substantive-digest equality, no exception |
| **Evaluator — no known material unresolved correctness defect** | ⚠️ CONDITIONAL PASS | All *representation-boundary* limitations are disclosed, not defects. The one open *evaluation-logic* finding (CHK-005 EN/ES Stage 5 divergence, 1/7 pairs) is unresolved but narrowly scoped and does not block the blind-benchmark's validity if disclosed as a known limitation |
| **Evaluator — proof receipts verify** | ✅ PASS | `verifyReceiptIntegrity` checked on all 32 documents, zero failures |
| **Evaluator — relevant semantic-preservation defects closed** | ✅ PASS | Citation linkage (ENG-016), Unicode segmentation (ENG-023) both closed with regression evidence |
| **Evaluator — scaling sufficient for intended blind benchmark** | ✅ PASS | O(n) Stage 4 confirmed on a 25,603-statement document in <5s (ENG-019) |
| **Acquisition — reproducible admission methodology** | ✅ PASS | Uniform governed-pipeline pattern (`acquireFreezeAndEvaluate`) used identically for all 32 documents |
| **Acquisition — source and licence gates defined** | ✅ PASS | `OFFICIAL_SOURCE_ASSESSMENT`/`LICENCE_ASSESSMENT` VERIFIED-status gate enforced on every admission |
| **Acquisition — freeze integrity established** | ✅ PASS | ENG-022 V2 freeze-integrity regime active; tamper-resistant on currentness fields |
| **Acquisition — source-stability classifications operational** | ✅ PASS | BYTE_STABLE/TEXT_STABLE distinction used consistently since ACQ-006; rate-limit handling now observed (ACQ-029, correctly fails closed rather than evading) |
| **Robustness — major planned representation dimensions exercised** | ❌ FAIL (conditional) | 9/9 seed dimensions now have real evidence (multi-column closed the last zero-evidence gap via DRA-ACQ-030 Phase 2); non-Latin scripts is only 1-of-N-families tested; compound/extreme remains completely untested; multi-column itself is now DEFECT_DEMONSTRATED_OPEN and needs an explicit accept/fix decision, not just evidence |
| **Robustness — no known material open defect that would invalidate blind testing** | ✅ PASS | No open defect meets the bar of invalidating a blind benchmark; CHK-005 finding is narrow and disclosable |
| **Robustness — remaining limitations explicitly bounded** | ✅ PASS | Every accepted limitation (footnotes/tables/OCR/graphics) has a specific, written boundary description |
| **Robustness — sufficient diversity across format/language/script/domain/publisher** | ⚠️ CONDITIONAL PASS | Strong format/domain/publisher diversity (32 documents, ~15 distinct publishers, 6 domains); language/script diversity is currently 4 languages (en, es, fr, ja) in 2 script families (Latin, CJK) — thin for a "script-agnostic" generalisation claim |
| **Methodology — blind benchmark protocol predefined** | ❓ NOT ASSESSED HERE | Outside DRA-ROB-001 scope; no blind-benchmark protocol document was found in this review's evidence search |
| **Methodology — sampling methodology predefined** | ❓ NOT ASSESSED HERE | Same as above |
| **Methodology — success/failure criteria predefined** | ❓ NOT ASSESSED HERE | Same as above |
| **Methodology — architecture freeze rule explicit; no document-specific engineering during DRA-GEN-001** | ❓ NOT ASSESSED HERE | No `DRA-GEN-001` or `DRA-GC-1` artefact exists yet in the repository under either name — this is a **methodology-design gap**, not a robustness gap, and is the natural next-programme candidate (Section H) |

**Binary overall readiness: NOT YET READY.** Two robustness rows fail/conditionally-pass (representation
dimension coverage; script diversity), and the four methodology rows are simply undefined — DRA-GC-1 as a named
artefact does not yet exist anywhere in the repository. Both gaps are closable without reaching Document 40.

---

## H. Future-document recommendation

### Minimum defensible robustness closure — **1 additional document**
- Resolve DRA-ACQ-029 (or a substitute non-Latin, non-CJK, non-Devanagari-blocked candidate if the eLegalix
  block does not clear) as DRA-DOC-0033. This is the single highest-information-gain remaining acquisition, and
  without it the "non-Latin scripts" claim generalises from a sample of one script family.
- Evidence target: does ENG-023's `\p{L}\p{N}` fix generalise beyond CJK; does the family's own sentence-
  terminator punctuation (if any) reveal a segmentation gap analogous to (or different from) the danda finding.
- Major uncertainty remaining afterward: compound/extreme still untested; multi-column now has evidence but an
  open, unfixed defect; script diversity still limited to 2–3 families.

### Recommended robustness closure — **1–2 additional documents/experiments**
- The same DOC-0033 acquisition, **plus** one compact compound experiment (multi-column is now covered by
  DRA-ACQ-030 Phase 2; do not duplicate it) —
  whichever can be constructed with a single new variable per ACQ-013's discipline. A multi-column document is
  cheaper to source and analyse in isolation (no other engineering programme depends on it); recommended over
  compound/extreme as the second experiment specifically because it is a clean single-variable test, whereas a
  compound-extreme document by definition combines variables and is best attempted *after* multi-column is
  independently characterised.
- Evidence target: does the pipeline preserve reading order across column boundaries; if it does not, is the
  resulting statement-level corruption SILENT or detectable.
- Major uncertainty remaining afterward: compound/extreme combinations still untested (acceptable to defer
  further, per Section F ranking #3); mixed-language code-switching still untested (acceptable to defer,
  lower-ranked).

### Maximum original plan (through Document 40) adds, beyond the recommended scenario
- A compound/extreme document (rank 3): information gain only after #1–#2 above are independently established;
  otherwise risks an undiagnosable multi-cause result.
- A mixed-language single-document test (rank 4): meaningfully informative but lower priority than script
  diversity or layout.
- A second non-Latin script family beyond the one added in "minimum"/"recommended" (e.g. an abjad or a purely
  syllabic script): MEDIUM information gain if the first non-CJK family (recommended above) reveals a *new*
  mechanism; LOW/REDUNDANT if it confirms the same danda-shaped "native punctuation not in terminator set"
  pattern a second time.
- One additional "multiple evidence sources / conflicting provenance" experiment: LOW information gain per
  Section F, retained mainly for narrative completeness of a 40-document corpus rather than for GC-1 readiness.
- **Conclusion: reaching Document 40 does not retire any HIGH-information uncertainty that the recommended
  2–3-document path does not already retire.** The additional 7–8 documents implied by "through 40" would
  primarily add MEDIUM/LOW/REDUNDANT evidence per Section F's ranking. Document count should not be optimised
  for its own sake — see the core methodological rule.

---

## I. Publication readiness vs. generalisation-candidate readiness vs. production readiness

- **Research-publication readiness:** already strong. The corpus, its acquisition governance, the five
  demonstrated-and-closed defects with full before/after evidence, and the four disclosed representation
  boundaries collectively make a complete and honest methodology narrative. This report itself, plus the
  existing closure reports, would support a publication describing DRA's development-corpus robustness findings
  today, without waiting for DOC-0033 or Document 40.
- **Generalisation-candidate readiness (DRA-GC-1):** this is the question DRA-ROB-001 is asked to answer, and
  the answer is **not yet**, for the concrete, closable reasons in Section G — thin script diversity and two
  untested representation dimensions, plus an undefined blind-benchmark methodology artefact. The recommended
  path in Section H closes the evidentiary half of this gap; the methodology half (blind protocol, sampling,
  success criteria, architecture-freeze rule) is a separate, lightweight documentation programme, not a
  robustness-acquisition programme.
- **Production/infrastructure readiness:** explicitly out of scope here and should stay that way — external
  replication, adversarial validation, operational reliability under real deployment, and adoption evidence are
  all *harder and different* questions than "is the development corpus diverse enough to freeze a
  generalisation candidate," and treating them as prerequisites for GC-1 would be over-scoping this programme.

---

## J. Cost/information efficiency (remaining recommended experiments)

| Experiment | Acquisition difficulty | Replit execution burden | Engineering risk | Information gain | Reuse existing evidence/candidate? |
|---|---|---|---|---|---|
| Resolve DRA-DOC-0033 (Devanagari, currently blocked) | Medium — official source identified, candidate governance pre-verified twice; sole blocker is a live rate-limit that must clear on its own | Low — admission test and counterfactual segmenter already written | Low — no production change planned or permitted | HIGH | Yes — fully reuses Phase 1 discovery + both prior Phase 2 preparation attempts |
| Multi-column layout document | Medium — needs a new candidate search (not yet scoped) | Low–Medium — one new acquisition + admission cycle | Low | MEDIUM | Partially — reuses the standard acquisition/admission pattern, not a specific candidate |
| Compound/extreme document | Higher — deliberately harder to find and to keep single-cause-diagnosable | Medium | Medium — risk of an undiagnosable result if attempted before #1/#2 | MEDIUM (conditional on #1/#2 completing first) | No — genuinely new candidate work required |
| Second non-Latin script family (beyond DOC-0033's family) | Medium–High, depending on family chosen | Low–Medium | Low | LOW–MEDIUM (depends on whether it reveals a new mechanism vs. confirms the "native punctuation" pattern again) | Partially — reuses the parallel-language-pair ground-truth methodology from ACQ-017 |
| Mixed-language single-document test | Medium | Low–Medium | Low | MEDIUM (after #1) / LOW (before #1) | Partially |
| CHK-005-style EN/ES materiality closure | None (no acquisition) — pure direct-pipeline analysis on frozen content | Low | Low | MEDIUM (evaluator-correctness value, independent of document count) | Fully — no new document needed |

No evidentiary standard is proposed to be lowered to save cost anywhere in this table.

---

## K. DRA-DOC-0033 handling (unchanged)

DRA-DOC-0033 remains **not admitted**. Status: `DRA-ACQ-029 Phase 2 — BLOCKED_PENDING_LIVE_SOURCE_REACQUISITION`,
confirmed twice in this workspace (first blocked attempt, then one additional controlled single-attempt retry
per explicit instruction, both returning HTTP 429 from the eLegalix portal with a `Retry-After` header that did
not resolve the block even after waits up to ~5 minutes and, on the second occasion, roughly 42 minutes after
the first). The qualified Hindi candidate and Phase 1/Phase 2-preparation reconnaissance are used throughout
this report only for future experimental-design reasoning (Sections F and H) and are labelled
**PRE_ADMISSION_EMPIRICAL_RECONNAISSANCE**, not corpus validation, everywhere they appear. No prepared
DRA-ACQ-029 artefact (admission test, danda-aware counterfactual segmenter) was modified during this review.

---

## L. Recommended next programme (exactly one)

**Retry DRA-ACQ-029 Phase 2 live acquisition of DRA-DOC-0033**, after a substantially longer cooldown than
already attempted (the eLegalix rate-limit has not cleared after single-attempt retries spaced by minutes; a
much longer wait — hours, attempted in a later session — is the correct next step per the governing acquisition
programme's own instruction not to evade or hammer the block). If the block still has not cleared after a
genuinely long cooldown, the second-choice recommended programme is a **fresh, from-scratch candidate-discovery
pass for a non-Latin, non-CJK script family** that does not depend on the eLegalix domain at all (e.g. a
different-jurisdiction Devanagari, Arabic-abjad, or Cyrillic official-source document), so that the single
highest-ranked remaining uncertainty (Section F, #1) does not remain indefinitely blocked by one server's rate
limiting. Either path is preferred over immediately starting the compound/extreme experiment (multi-column is
now covered by DRA-ACQ-030 Phase 2 and should not be repeated), because non-Latin script diversity is ranked
highest information gain (Section F) and is the only FAIL/CONDITIONAL
row in Section G's readiness checklist that a single additional document can fully resolve.

---

## M. Validation performed for this programme

Per Section 15 of the task instructions, DRA-ROB-001 is primarily an analysis programme; no expensive
full-corpus evaluator repetitions were run. The following targeted, low-cost verification was performed instead
(see `lib/dra-reference/src/benchmark/acquisition/discovery/__tests__/dra-rob-001-evidence-matrix-integrity.test.ts`):

1. Machine-verified that the shared base corpus fixtures (`BENCHMARK_CORPUS`: DRA-DOC-0001–0006;
   `PRIOR_CORPUS_ENTRIES`: DRA-DOC-0007–0022, 22 documents total, sequential, no gaps) contain no
   `DRA-DOC-0033` or `DRA-DOC-0034`. The remaining ten documents (DRA-DOC-0023–0032) are reconstructed
   independently inside each acquisition's own admission test file by design (each test freezes its own view
   of "everything admitted so far") rather than re-exported from one shared module, so their count was
   reconciled by direct inspection of the ten `dra-acq-0{20..29}-*-admission.test.ts` files in this session
   (Section C) rather than by an additional automated registry-count test — see the new test file's own header
   for this scoping rationale.
2. Confirmed the existing `ROBUSTNESS_EVIDENCE_MAP` (ACQ-028 Phase 1) still contains exactly the dimension set
   this report's Section B table is built from, and that `RANKED_REMAINING_GAPS[0].dimension === "non-Latin scripts"`
   — machine-verifying the ranking claim underpinning Sections F, H, and L.
3. Ran `tsc --noEmit` for the package to confirm no new type errors were introduced by the new test file. Two
   pre-existing, unrelated type errors were reconfirmed present (already known from ENG-021's audit — see
   `docs/dra/DRA-ENG-021-CURRENTNESS-EVIDENCE-INTEGRITY-CLOSURE-REPORT.md`): a `CitationIntegrityReport.overallStatus`
   reference in `dra-acq-026-long-range-structural-robustness.test.ts` and a `groundTruthExamples` literal-union
   mismatch in `dra-acq-025-non-redundant-graphics-discovery.ts`. Both are classified **PRE_EXISTING**, unrelated
   to this review, and were not modified.

No production evaluator file was changed. No historical benchmark result was changed. No document was acquired.
