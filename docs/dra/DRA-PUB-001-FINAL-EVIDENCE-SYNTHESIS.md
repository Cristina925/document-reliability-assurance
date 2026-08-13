# DRA-PUB-001 — Final Evidence Synthesis and Publication-Readiness Review

**Status:** Read-only synthesis and decision-gate review. No document acquired, no evaluator
semantics modified, no corpus altered, no historical benchmark result changed, no issue-class
architecture changed, DRA-GC-2 not revived, DRA-DOC-0033 not retried.

**Final verdict: `DRA_READY_FOR_FIRST_PUBLICATION`**
**Engineering-state verdict: `DRA_V1_ENGINEERING_FROZEN_FOR_PUBLICATION`**

---

## 1. Identity-integrity gate (must pass before any synthesis)

Re-ran, unmodified, the full set of load-bearing identity/integrity suites:
`dra-gc-1-freeze-integrity.test.ts`, `dra-gen-001-freeze-integrity.test.ts`,
`dra-gen-001-protocol-freeze-integrity.test.ts`, `dra-gen-001-sample-lock-integrity.test.ts`,
`dra-gen-001-phase2-integrity.test.ts`, `dra-gen-001-post-blind-evidence-review.test.ts`,
`dra-val-002-freeze-integrity.test.ts`.

**Result: 178/178 passed. No drift detected in any load-bearing digest.**

| Candidate | Live-recomputed aggregate digest | Matches frozen value |
|---|---|---|
| DRA-GC-1 | `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` | ✅ |
| DRA-GEN-001 protocol | bound via `GEN001_BOUND_GC1_DIGEST === GC1_AGGREGATE_DIGEST` | ✅ |
| DRA-VAL-002 protocol | bound via `VAL002_BOUND_GC1_DIGEST === GC1_AGGREGATE_DIGEST` | ✅ |

Because this gate passed cleanly, the review proceeds. Had any digest failed to reproduce, this
document would stop here and issue `DRA_NOT_READY_FOR_FIRST_PUBLICATION` without performing any
further synthesis.

---

## 2. Programme chronology (reconstructed from the repository, not from memory)

The chronology below is reconstructed from the existing `docs/dra/` file set and corpus/defect
ledgers, in the order the underlying work was actually done (not the order files are alphabetized):

1. **Foundational specification and engine build** (`DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md`,
   `DRA-ENGINEERING-EVIDENCE-STANDARD.md`) — defines the 8-stage evaluator runtime / 7-record
   `ProofReceipt` architecture, the 9 canonical issue classes, and the evidentiary standard every
   later report follows.
2. **Stage-by-stage engine construction** (Stage 2 Claim Extraction → Stage 7 issue detection,
   pipeline assembly) — produced the frozen evaluator core later captured in DRA-GC-1's
   `FROZEN_CORE_EVALUATOR_FILES`.
3. **Governance and validation infrastructure** (Governance conventions, Validation Protocol,
   Benchmark Execution/Corpus modules, Evidence Programme, Reviewer Module) — the admission,
   freeze, and benchmark-execution machinery the corpus programme runs on top of.
4. **Development corpus acquisition, DRA-DOC-0001 → DRA-DOC-0023** (`DRA-ENG-009` governed
   acquisition pipeline through `DRA-ACQ-019`/`DRA-BMK-023`) — broad-coverage document admission
   (finance, healthcare, legal, technical, general domains; UK/US/EU/international publishers;
   PDF and HTML; growing checkpoint corpus with periodic `DRA-BMK-0NN` re-verification), alongside
   incremental engine fixes (media-type fallback, multilingual segmentation groundwork).
5. **Deliberate robustness programme, DRA-DOC-0024 → DRA-DOC-0032/0034** (`DRA-ACQ-020` through
   `DRA-ACQ-031`, interleaved with `DRA-ENG-015` through `DRA-ENG-025`) — each acquisition targeted
   a specific representation or language dimension (footnotes, tables, citations, scans/OCR,
   graphics, scale, supersession, non-Latin scripts, multi-column layout, additional language
   families), each followed by either an engineered-and-closed fix or a disclosed, accepted
   representation-boundary limitation.
6. **DRA-ROB-001** — first systematic robustness-evidence review; found the programme MID_STAGE,
   identified non-Latin scripts and multi-column layout as the two concrete gaps blocking a freeze.
7. **DRA-ACQ-031 / DRA-ENG-024/025** — closed or partially closed those two gaps (Bulgarian
   Cyrillic admission; bbox-based multi-column reconstruction engine).
8. **DRA-ROB-002** — second robustness-evidence review; issued `READY_FOR_DRA_GC_1_FREEZE`.
9. **DRA-GC-1 freeze** — the first and only production evaluator candidate freeze to date.
10. **DRA-GEN-001** — first blind, pre-registered generalisation study against DRA-GC-1 (Phase 0
    contamination check → Phase 1 protocol freeze and 100-unit sample lock → Phase 2 blind
    execution → Post-Blind Evidence Review). Found the HTML_ENGLISH stratum unrecoverable at
    Phase 2 and an unresolved Spanish/English descriptive signal.
11. **DRA-ENG-026** — GEN-001's top-ranked follow-up; a controlled (non-blind) experiment that
    found and fixed, in an experimental branch only, a 5-rule English-only-lexicon defect in Stage
    5 materiality classification. GC-1 itself was left untouched.
12. **DRA-GC2-REV-001** — reviewed the ENG-026 correction for candidate-freeze admission; found a
    new semantic-safety false positive (`"es preciso"`) under adversarial probing and rejected the
    admission (`DRA_GC_2_ADMISSION_REJECTED`). GC-1 remains the sole candidate.
13. **DRA-VAL-002** — a second, narrower blind study, purpose-built to close exactly the
    HTML_ENGLISH gap GEN-001 left open, using a re-engineered acquisition protocol that persists
    raw bytes at freeze time (eliminating GEN-001's re-fetch-verification failure mode). Result:
    25/25 evaluated, gap closed.
14. **DRA-PUB-001 (this document)** — first evidence-synthesis and publication-readiness review.

No step in this chronology was skipped, reordered, or omitted to make the story cleaner; the
robustness programme's own dead ends (DRA-DOC-0033 blocked acquisition, ENG-026's rejected V2
correction) are carried forward unmodified in Section 8 and the companion limitations document.

---

## 3. What DRA-GC-1 actually is (vs. "DRA" as a broader research programme)

**DRA-GC-1 is one specific, immutable, digest-bound artefact**: the combination of
evaluator version `0.1.2`, pipeline version `1.0`, model/schema version `0.1.0`, and corpus version
`DRA-CORPUS-1.0.0`, frozen 2026-08-12 at repository commit `21e0e6a11452754a7aa258d799226553f3cb1d38`,
comprising exactly 63 frozen decision-affecting files (54 core evaluator files + 9
acquisition/representation files) and identified by the single aggregate digest
`77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`. Its behaviour is fixed: the
same input document, evaluated twice, produces a byte-identical decision and proof receipt (this
is exactly what GEN-001's and VAL-002's determinism endpoints measure).

**"DRA" (the broader label used in prior conversation)** refers to the multi-year research
*programme* that built, tested, and evaluated GC-1 — the 8-stage runtime architecture, the 9-class
issue taxonomy, the acquisition/freeze/benchmark infrastructure, and the accumulated experimental
record (ROB-001/002, ENG-001–026, ACQ-001–031, GEN-001, VAL-002, GC2-REV-001). The programme is
ongoing and produced exactly one frozen, publication-eligible candidate: GC-1. It has *not* (yet)
produced a second candidate — GC-2 was explicitly rejected at admission review.

**Publication in this document's sense** means: is there now sufficient accumulated evidence to
publish DRA-GC-1 — this one frozen artefact, with its disclosed scope and limitations — as a first
research candidate? It does **not** mean publishing "DRA" as a general-purpose, universally
reliable document-assurance method. Section 15's thesis statement narrows this further.

---

## 4. Five-level evidence hierarchy

| Level | Evidence type | What it measures | Blindness | Scale | Status |
|---|---|---|---|---|---|
| 1 | Unit/engineering-level tests | Individual stage/rule correctness | N/A (white-box) | Thousands of unit tests across the 8-stage pipeline | Passing (178/178 identity suites re-verified here; broader suites checked per-programme) |
| 2 | Development corpus (DRA-DOC-0001–0032, 0034) | Whether real, diverse documents survive the full pipeline without crashing and produce plausible decisions; used to *discover* representation/robustness gaps | Not blind — documents chosen deliberately to stress specific dimensions | 33 admitted documents | Complete for its purpose (discovery, not generalisation) |
| 3 | Robustness/defect programme (ROB-001, ROB-002, and the ENG-0NN closure reports) | Whether discovered gaps are closed, are accepted representation boundaries, or remain open defects | Not blind — targeted, hypothesis-driven experiments | 18-dimension matrix, 10-entry known-defect ledger (D1–D10) | `READY_FOR_DRA_GC_1_FREEZE` (ROB-002) |
| 4 | DRA-GEN-001 blind generalisation study | Whether GC-1 generalises to an independently, pre-registered, stratified, blindly-drawn sample it was never tuned against | Fully blind, pre-registered protocol frozen before evaluation | 100 locked / 75 evaluated / 25 excluded | `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION` |
| 5 | DRA-VAL-002 targeted blind follow-up | Whether the one material gap GEN-001 left open (English-language HTML) closes under a corrected, drift-resistant blind protocol | Fully blind, pre-registered protocol frozen before evaluation | 25/25 evaluated | `DRA_VAL_002_COMPLETE` / `ENGLISH_HTML_GAP_CLOSED` |

**External validation status (separate axis, does not sit on the ladder above):**
`EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED`. Every evidence level above was produced
inside this same research programme, by the same team, using the same evaluator, corpus
infrastructure, and statistical tooling. No independent party, independent implementation, or
independently-drawn sample has yet evaluated DRA-GC-1. This is a genuine, unresolved gap, not a
formality — see Section 12 and the companion limitations document.

---

## 5. Development-corpus evidence, quantified

- **33 admitted documents** (`DRA-DOC-0001`–`DRA-DOC-0032`, `DRA-DOC-0034`; `DRA-DOC-0033` reserved
  but explicitly excluded — blocked at the acquisition gate by a sustained third-party rate-limit,
  never admitted, not counted anywhere as evidence).
- **Domains represented:** FINANCE, HEALTHCARE, TECHNICAL, LEGAL, GENERAL (per corpus domain
  tagging used throughout ACQ-0NN reports).
- **Formats:** PDF (native-text, OCR-derived, and scanned/image-hybrid) and HTML (including
  multi-page and Cloudflare-fronted HTML).
- **Languages:** English, Spanish, French, Japanese, Bulgarian — five language families across
  Latin, CJK, and Cyrillic scripts.
- **Publishers/jurisdictions:** a broad mix of UK (GOV.UK, ONS, ICO, BoE-adjacent, FCA-adjacent),
  US (NIST, FDA, EIA/DOE, CDC, GPO/GovInfo, Congressional Research Service, EPA/FTC/Census),
  EU/international (European Commission, OECD, PLOS, BCBS, CNIL, INE, CNMV), and one Japanese
  national publisher (Cabinet Office).
- **Scale range:** from small documents up to DRA-DOC-0030 at 25,603 statements (the document that
  originally exposed and then, post-ENG-019, validated the O(n²)→O(n) Stage 4 scalability fix).
- **Purpose-built pairs:** DRA-DOC-0030/0031 were acquired specifically as a superseded/superseding
  pair to test a relational property (document currentness), not evaluated as independent content.

This corpus is deliberately **not** a representative population sample — it was built by
hypothesis-driven selection to *discover* robustness gaps (Level 2 in Section 4), and its
diversity is real but should not be read as evidence of generalisation. That claim is reserved for
Levels 4 and 5.

---

## 6. Robustness and defect ledger (summary; full detail in DRA-ROB-002)

The 18-dimension robustness matrix (`ROBUSTNESS_EVIDENCE_MAP`, re-classified twice, by ROB-001
then ROB-002) resolves, as of the frozen state, into:

- **Engineered-and-closed defects (demonstrated, fixed, regression-verified):** Stage 4
  quadratic-scaling defect (ENG-019), citation/reference-linkage defects (ENG-016), the
  three-part legal-authority/currentness-supersession chain (ENG-020/021/022), Unicode
  segmentation for non-Latin, non-whitespace-delimited scripts (ENG-023), and the lowercase-
  bare-"EN" sentence-boundary false positive (ENG-012/013/014/014A).
- **Accepted, disclosed representation-boundary limitations (not defects; correction is out of
  scope by design):** footnote/endnote flattening, table historical/forecast cell-shading
  semantics, OCR/scan content corruption, non-textual graphics/diagram meaning. Each has a
  positive-evidence *detection* mechanism (ENG-015 fill-colour signal, ENG-017 provenance/fidelity
  metadata, ENG-018 six-property graphical-completeness model) even though the underlying content
  loss itself is not corrected.
- **Partially closed:** multi-column reading order (ENG-024/025) — an opt-in bbox-based
  reconstruction engine measurably improves pair-adjacency preservation on the discovering
  document (~39%→~56%) and performs well out-of-sample on a pure multi-column control document,
  but fails safe (passthrough, no guessing) on hybrid prose/table layouts; residual gap formally
  classified `AMBIGUOUS-REPRESENTATION-LIMITED`, not silently claimed fixed. Non-Latin scripts:
  closed for CJK (Japanese, via ENG-023) and for Cyrillic (Bulgarian, via ACQ-031), but no
  Devanagari/abugida, Arabic/Hebrew/abjad, or Hangul document has ever been admitted — this remains
  a genuine, disclosed scope boundary, not a false "all non-Latin scripts" claim.
- **Open, disclosed, and never engineered:** Stage 5 (materiality classification) cross-language
  divergence between English and Spanish (CHK-003, CHK-005), later reproduced under a controlled
  25-pair matrix by ENG-026 (25/25 EN accuracy vs. 11/25 ES accuracy) and formally accepted as
  `ACCEPTED_GC-1_LIMITATION` (known-defect-ledger item D3) — an experimental fix exists but was
  **rejected at candidate-admission review** (GC2-REV-001) for introducing a new semantic false
  positive, and is *not* part of GC-1.
- **Formally untested, deliberately deferred (not oversights):** mixed-language/code-switched
  single documents; compound/extreme documents combining several stress dimensions at once
  (deferred per the programme's explicit single-variable-per-experiment discipline).

**Known-defect ledger: 10 entries (D1–D10), 0 rated `FREEZE_BLOCKER`.** Two items are
worth flagging precisely because they resolved in GC-1's favour rather than against it: D8 (a
suspected corpus-registry gap) was checked and found to be a non-issue, `CLOSED`; D10 (the
DRA-DOC-0033 eLegalix acquisition block) was classified an `EXTERNAL_DEPENDENCY`, not a DRA defect.

---

## 7. Issue-class reachability (publication-critical; reconstructed directly from
`reachability-matrix.ts`, not from summary prose)

The frozen DRA Version 1 evaluator defines **exactly 9 canonical issue classes (IC-1–IC-9)**.
Programmatic analysis (`DRA-CHK-002`) classifies each by four possible reachability statuses:
`OBSERVED_REACHABLE`, `REACHABLE_UNOBSERVED`, `STRUCTURALLY_UNREACHABLE`, `INDETERMINATE`.

| Code | Class | Reachability | Defect classification | Meaning |
|---|---|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | `STRUCTURALLY_UNREACHABLE` | `DORMANT_SCHEMA_OR_TAXONOMY` | Stage 3's authority-detection fallback always resolves to `DOCUMENT_AUTHOR`; the `NO_IDENTIFIABLE_SOURCE` classification this rule needs is never produced by any code path, even though the enum value exists |
| IC-2 | AUTHORITY_EXPIRED | `STRUCTURALLY_UNREACHABLE` | `IMPLEMENTATION_GAP` | Required upstream state never produced |
| IC-3 | AUTHORITY_ABSENT | `STRUCTURALLY_UNREACHABLE` | `DORMANT_SCHEMA_OR_TAXONOMY` | Same structural cause as IC-1 |
| **IC-4** | **EVIDENCE_ABSENT** | **`OBSERVED_REACHABLE`** | N/A | Actually produced by frozen corpus evaluations (e.g. DRA-DOC-0025, DRA-DOC-0031) |
| **IC-5** | **EVIDENCE_INADEQUATE** | **`OBSERVED_REACHABLE`** | N/A | Actually produced (e.g. DRA-DOC-0024, DRA-DOC-0028, VAL-002's one REVIEW unit) |
| IC-6 | EVIDENCE_CONFLICT | `STRUCTURALLY_UNREACHABLE` | `IMPLEMENTATION_GAP` | Required upstream state never produced |
| **IC-7** | **CLAIM_INCONSISTENCY** | **`OBSERVED_REACHABLE`** | N/A | Actually produced in the benchmark corpus |
| IC-8 | TRACEABILITY_BROKEN | `STRUCTURALLY_UNREACHABLE` | `IMPLEMENTATION_GAP` | Required upstream state never produced |
| IC-9 | SCOPE_VIOLATION | `STRUCTURALLY_UNREACHABLE` | `IMPLEMENTATION_GAP` | Required upstream state never produced |

**Exactly 3 of 9 classes (IC-4, IC-5, IC-7) are reachable under the frozen Version 1 evaluator, and
all 3 have in fact been observed in corpus evaluations — there is no `REACHABLE_UNOBSERVED` class
in the current matrix.** The remaining 6 are `STRUCTURALLY_UNREACHABLE`: for 2 of those (IC-1,
IC-3) an emission rule exists in code but its required upstream state is never produced anywhere
in a valid pipeline execution (`DORMANT_SCHEMA_OR_TAXONOMY` — the rule is inert, not merely
unexercised); for the other 4 (IC-2, IC-6, IC-8, IC-9) the classification is `IMPLEMENTATION_GAP`.

**The distinction the publication package must preserve precisely:** "not detected" (a class that
could in principle be produced by the frozen evaluator but happened not to appear in any given
sample — this does not currently apply to any of the 9 classes, since all 3 reachable classes have
been observed) is a different, weaker claim than "structurally unreachable" (a class that *cannot*
be produced by the frozen Version 1 code no matter what document is supplied, proven by code-path
analysis and confirmed by targeted and adversarial testing). DRA-GC-1's true operating coverage is
3/9 classes, not "9/9 minus some we haven't seen yet."

---

## 8. DRA-GEN-001 reconstructed exactly (no upgrades from prior verdicts)

- **Locked sample:** 100 units, four hard strata of 25 each — `PDF_ENGLISH`, `PDF_NON_ENGLISH`
  (Spanish), `HTML_ENGLISH` (GOV.UK), `HTML_NON_ENGLISH` (Spanish).
- **Evaluated:** 75/100. **Excluded:** 25/100, all from the single `HTML_ENGLISH` stratum,
  taxonomy category `EXTERNAL_ACQUISITION_FAILURE` (a real, defined taxonomy category — the
  Post-Blind Review notes it is a *best fit*, not an exact fit, for what happened).
- **Root mechanism (not a GC-1 pipeline defect):** the frozen GEN-001 protocol persisted only a
  digest and word count at Phase 1 lock, not raw bytes, and required a live re-fetch-and-verify
  step at Phase 2. All 25 GOV.UK pages had drifted their live content between lock and execution,
  failing that verification and forcing exclusion. This is a combination of (a) a protocol design
  choice — re-fetch-to-verify — and (b) genuine external content mutability of frequently-updated
  government web pages; it is not a failure of DRA-GC-1's evaluation pipeline, which never ran on
  the excluded units.
- **Decisions across the 75 evaluated:** 64 `SUPPORTED`, 10 `HOLD`, 1 `REVIEW` (sums to 75).
- **Operational-reliability endpoints (denominator 75, the evaluated subset):** pipeline
  completion, proof-integrity, and determinism repeatability all 75/75 = 100% (rule-of-three upper
  bound on failure ≤ 0.030 at 95% confidence).
- **Endpoints keyed to the full locked sample (denominator 100):** acquisition success rate
  75/100 = 0.750 (Wilson 95% CI [0.657, 0.825]); material failure rate 0/100 = 0 (CI [0, 0.037]).
  **These two denominators must never be conflated** — GEN-001's own frozen protocol fixes which
  endpoint uses which denominator, and this report preserves that assignment exactly.
- **Issue-class reachability confirmed independently within GEN-001's own blind sample:** exactly
  3 of 9 classes observed (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`),
  matching Section 7 exactly.
- **Spanish/English descriptive pattern:** 50/50 zero-issue `SUPPORTED` outcomes across both
  Spanish strata vs. 11/25 non-`SUPPORTED` (`HOLD`/`REVIEW`) outcomes in the evaluated English PDF
  stratum (the English HTML stratum was entirely excluded, so no English-HTML comparison point
  exists here). This is confounded by publisher and jurisdiction (the Spanish documents are drawn
  from different source institutions than the English ones) and is explicitly classified
  `SUPPORTING_EXPLORATORY_SIGNAL`, **not** a validated or causally-attributed language effect.
- **Preserved final verdicts, verbatim:** benchmark evidence verdict
  `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`; next-evidence verdict
  `TARGETED_FOLLOW_UP_REQUIRED`. Neither is upgraded here, even though DRA-VAL-002 has since closed
  the HTML_ENGLISH gap — GEN-001 is a historical, frozen artefact and its own verdict language
  describes what was known and evidenced *at the time it concluded*, not the programme's current
  overall state (Section 4's five-level hierarchy is where the current overall state lives).

---

## 9. DRA-VAL-002 reconstructed exactly

- **Purpose:** close exactly the one material coverage gap GEN-001 left open — English-language
  HTML — under a new, independently pre-registered, blind protocol.
- **Sample:** 25 locked units across three families: `GOV_UK` (9, OGL v3.0), `ONS_GOV_UK` (8, OGL
  v3.0), `US_FEDERAL` (8, US federal public domain, 17 U.S.C. §105).
- **Root architectural fix:** VAL-002's Phase 1 acquisition persists the actual frozen bytes for
  every locked unit to disk *at freeze time*; Phase 2 evaluates those persisted bytes directly,
  performing **zero network access during evaluation staging**. This directly targets the failure
  mode that destroyed GEN-001's HTML stratum (a re-fetch-to-verify design against externally
  mutable content).
- **Results:** 25/25 `SUCCESSFUL_EVALUATION` across two independent runs (Run A / Run B at
  different fixed timestamps) — 100% acquisition, pipeline-completion, proof-integrity, and A-vs-B
  determinism-repeatability rates (Wilson 95% CI [86.7%, 100%] on each); 0/25 material failures
  (rule-of-three upper bound 12%). Decision distribution: 24 `SUPPORTED`, 1 `REVIEW`
  (`EVIDENCE_INADEQUATE`, 1 issue, agreed by both runs).
- **Post-hoc, non-gating live-drift observation** (performed after analysis was already complete,
  for transparency only): of the 25 units, 15 were still byte-identical to the frozen copy, 7 had
  drifted (all `ONS_GOV_UK`/`US_FEDERAL` dynamic-content pages), and 3 were unreachable at
  observation time (HTTP 429, `ONS_GOV_UK`). This corroborates, rather than contradicts, Section
  8's diagnosis: a re-fetch-verification gate (GEN-001's actual method) would again have discarded
  a majority of this sample.
- **Preserved verdicts, verbatim:** `DRA_VAL_002_COMPLETE`, `ENGLISH_HTML_GAP_CLOSED`,
  `READY_FOR_FINAL_EVIDENCE_SYNTHESIS`.

---

## 10. Non-merge discipline: GEN-001 and VAL-002 are two separate studies, not one 100/100 result

DRA-GEN-001 and DRA-VAL-002 are methodologically distinct blind studies: different pre-registered
protocols, different sample-lock events, different acquisition architectures (re-fetch-verify vs.
frozen-bytes-at-lock), and different scopes (broad four-stratum sample vs. a narrow, targeted
three-family sample built specifically to answer one open question). **This report does not, and
the publication package must not, describe them as a single combined "100/100 pre-registered
evaluations" result.** Where a combined descriptive figure is useful at all, it must be explicitly
labelled a **cross-study descriptive aggregation** of two independently governed studies, with
each study's own denominators, exclusions, and confidence intervals stated alongside it, not
folded into one pooled statistic. The one legitimate way to state the combined picture: across the
two studies, DRA-GC-1 has now been blindly evaluated on 100 total units (75 from GEN-001 + 25 from
VAL-002) drawn from two separate pre-registered protocols, with the sole material gap identified
by the first (English HTML) directly and successfully addressed by the second.

---

## 11. Statistical synthesis (per study, no new method)

Both studies already compute and report their own confidence intervals using two documented,
pre-existing methods — Wilson score (95%) for observed rates, and rule-of-three (95% upper bound)
for zero-numerator rates — and this synthesis reuses those figures verbatim rather than inventing
a new or more favourable statistical treatment:

- **GEN-001** (n=75 evaluated / n=100 locked, as applicable per endpoint): operational-reliability
  endpoints 75/75 = 100% (rule-of-three upper bound on failure ≤ 3.0%); acquisition success 75/100
  = 75.0% (Wilson CI [65.7%, 82.5%]); material failure 0/100 (CI [0%, 3.7%]).
- **VAL-002** (n=25): all primary endpoints 25/25 = 100% (Wilson CI [86.7%, 100%]); material
  failure 0/25 (rule-of-three upper bound 12%). Note the wider interval than GEN-001's
  operational-reliability figures — this is a direct, honest consequence of VAL-002's smaller
  sample size (25 vs. 75), not a stronger or weaker underlying result.
- No single combined interval is computed across both studies' primary reliability endpoints in
  this synthesis, consistent with Section 10's non-merge discipline; each study's interval stands
  on its own sample and protocol.

---

## 12. Stage 5 Spanish materiality, ENG-026, and GC2-REV-001 — the full story, unresolved

This must be preserved in full because it is the single largest, most concretely evidenced
limitation on any non-English claim DRA-GC-1 could make:

1. **CHK-003/CHK-005** first traced one confirmed English/Spanish statement-level divergence to
   Stage 5 (materiality classification), out of 7 candidate pairs, with 6/7 left unresolved/no
   anchor found.
2. **ENG-026** built a controlled, non-blind, 25-valid-pair matrix across 13 semantic classes
   specifically to characterise this. Frozen GC-1 Stage 5 scored 25/25 on the English side and
   11/25 on the Spanish side, with 14/25 pairs divergent — 100% in the false-negative direction (no
   false positives observed on the original matrix). Root cause: exactly 5 of roughly 24 Stage 5
   rules have English-only lexical triggers. Five separate ablations ruled out morphology,
   negation, word order, and punctuation as causes, isolating lexical-token coverage as the sole
   mechanism. This is classified `CONFIRMED_BOUNDED_DEFECT` — bounded because the other 11/25
   non-divergent pairs reflect symmetric structural non-coverage present in *both* languages, not
   an English-only gap.
3. An experimental V2 correction (kept in a separate, non-imported, non-frozen file) resolved all
   14/14 divergences with zero English regression and, critically, **zero change to GC-1's own
   digest** — verified unchanged before and after. GEN-001's 100 locked documents were explicitly
   never touched by this experiment.
4. ENG-026's own verdicts: `DRA_ENG_026_CLOSED` (as engineering characterisation work) but
   `GC_2_NOT_JUSTIFIED` as a candidate — a controlled experiment alone, without blind cross-corpus
   evidence, does not justify freezing a new candidate.
5. **GC2-REV-001** then reviewed the V2 correction specifically for candidate-freeze admission
   (not more engineering). It independently reproduced ENG-026's evidence and confirmed GC-1 was
   unchanged, but adversarial development-only probing (not the original controlled matrix) found
   4 new false positives under V2, most notably the Spanish phrase `"es preciso"` (polysemous:
   ordinary "precise/accurate" vs. the obligation sense V2's fix targets), with no comparable
   English-side ambiguity found. Because closing this would require further decision-affecting
   regex changes — out of scope for an admission review — the verdict was
   **`DRA_GC_2_ADMISSION_REJECTED`**.
6. **Net state, preserved exactly:** DRA-GC-1 remains the sole publication candidate, with its
   Stage 5 Spanish-materiality limitation disclosed and accepted (`ACCEPTED_GC-1_LIMITATION`,
   ledger item D3), unfixed. The rejected V2 correction is not part of GC-1 and this synthesis does
   not revive, adopt, or reference it as a mitigating fix — only as evidence that the limitation
   has been actively investigated and that a naive fix attempt was found, on adversarial testing,
   to trade one class of error for another.

---

## 13. Candidate integrity / non-overfitting argument

DRA-GC-1 was frozen (Section 2, step 9) *before* either blind study (GEN-001, VAL-002) began, and
before the ENG-026/GC2-REV-001 Spanish-materiality investigation existed. The chronology itself is
the evidence against overfitting-to-the-test-set concerns: the frozen artefact under evaluation in
both blind studies is bit-for-bit the same artefact whose digest predates the studies' own
protocol freezes (`GEN001_BOUND_GC1_DIGEST` and `VAL002_BOUND_GC1_DIGEST` both bind, and were
verified in Section 1 to still equal, `GC1_AGGREGATE_DIGEST`). No document in either blind sample
overlaps with the 33-document development corpus (a distinctness both protocols verify explicitly
via their contamination/frame-construction phases). The one occasion where GC-1's actual
production behaviour could have been changed in response to test results — the ENG-026 Stage 5
finding — was deliberately kept out of GC-1 (an experimental, non-imported file) and its proposed
promotion to a real candidate was independently rejected (GC2-REV-001). GC-1's digest today is the
same digest it has been since 2026-08-12, through two full blind evaluation cycles and one
rejected improvement attempt.

---

## 14. Proof, reproducibility, and the limits of future live re-acquisition

Every corpus and blind-study evaluation in this programme produces a `ProofReceipt` with a
`substantiveDigest`, independently re-verifiable via `verifyReceiptIntegrity()` without re-running
the pipeline. GEN-001 (75/75) and VAL-002 (25/25) both report 100% proof-integrity re-verification.
This gives strong reproducibility for *already-executed* evaluations: anyone with the frozen
evaluator, the frozen input bytes, and the proof receipt can independently confirm the recorded
decision was actually produced by that exact pipeline on that exact input, without trusting the
original run.

**What this does not give:** guaranteed reproducibility of *re-acquisition* from a live external
source. GEN-001's own history is the direct demonstration — 25/25 GOV.UK pages drifted between
lock and re-fetch — and VAL-002's own post-hoc drift observation (15 identical / 7 drifted / 3
unreachable, Section 9) confirms the same phenomenon recurs on a second sample less than one
programme-cycle later. Any future attempt to "re-verify DRA's results by re-fetching the same
public URLs" should expect a non-trivial fraction of external drift or unavailability by design,
not by implementation defect — this is a property of the live web, not of DRA. Proof-receipt
verification against the frozen, locally-persisted bytes remains fully reliable; live re-fetch
verification does not, and the publication package should say so plainly rather than implying live
URLs are a stable long-term reproducibility mechanism.

---

## 15. Source-mutability methodological finding

The single clearest methodological lesson this programme has produced, evidenced by direct
contrast between two real studies rather than by argument: **a benchmark protocol that verifies
sample integrity by re-fetching-and-matching against a live source is fragile against ordinary,
routine content updates on government and institutional web pages, at a scale (a majority of a
sample) large enough to destroy an entire stratum (GEN-001: 25/25 lost).** The fix demonstrated to
work is architectural, not statistical: **persist the actual evaluated bytes at acquisition/freeze
time, and treat any later live-fetch comparison as a separate, non-gating, purely observational
measurement** (VAL-002: 25/25 preserved; live drift measured afterward, non-gating, and consistent
with the mechanism that broke GEN-001). This finding is scoped to acquisition/benchmark protocol
design; it says nothing about DRA-GC-1's own evaluation correctness, which is unaffected either
way once valid input bytes are supplied to it.

---

## 16. External validation status

**`EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED`.** Every piece of evidence in this synthesis
— development corpus, robustness experiments, both blind studies, and this review itself — was
produced within the same research programme, by the same team, using the same evaluator
implementation, the same acquisition/freeze/benchmark tooling, and the same statistical methods.
No external party has independently re-implemented, re-run, or re-evaluated DRA-GC-1 against a
sample it did not select. This status is stated here as a fact for the record, not softened or
implied to be equivalent to external validation by virtue of the blind-study design (blindness to
sample content is not the same property as independence of the evaluating party).

---

## 17. Claim-evidence matrix

See the companion document `DRA-PUB-001-CLAIM-EVIDENCE-MATRIX.md` for the full C1–C12 matrix with
per-claim evidence citations and verdicts.

---

## 18. Strongest defensible publication thesis

**Not:** "DRA solves the problem of unreliable digital documents."

**Defensible thesis actually supported by the evidence above:**

> DRA-GC-1 is a frozen, digest-verified, deterministic document-assurance evaluator that, across a
> 33-document hypothesis-driven development corpus and two independent, pre-registered blind
> studies totalling 100 evaluated units (English- and Spanish-language PDF and HTML from UK, US,
> and EU public-sector and quasi-public-sector sources), reliably completes its full pipeline,
> produces independently re-verifiable proof of its own evaluation, and reaches deterministic,
> repeatable decisions, while reachably detecting exactly 3 of 9 defined issue classes
> (missing evidence, inadequate evidence, and internal claim inconsistency). Its materiality
> classification is demonstrated accurate for English-language content and demonstrated
> materially degraded for Spanish-language content, a known and disclosed limitation that was
> investigated but not resolved without introducing a new class of error. It has not yet been
> independently validated outside the research programme that built it.

This is deliberately narrower than a general reliability claim: it names the exact evidence base,
the exact reachable issue-class subset, the one confirmed language limitation, and the absence of
external validation, in the same sentence as the positive claims.

---

## 19. Prohibited-claims register

The publication package must **not** assert any of the following, none of which the evidence
above supports:

1. That DRA (or DRA-GC-1) achieves universal or general-purpose document-assurance correctness.
2. That DRA works reliably in "all languages" or "any language" — only English is demonstrated
   accurate for materiality classification; Spanish is demonstrated materially degraded; French,
   Japanese, and Bulgarian have single-document, non-materiality-focused exposure only.
3. That DRA detects "all" or "most" categories of document defects — only 3 of 9 defined issue
   classes are even structurally reachable under the frozen Version 1 evaluator.
4. That a `SUPPORTED` decision constitutes independent verification of factual truth, accuracy, or
   correctness of the underlying document's content — DRA evaluates evidentiary structure
   (authority, evidence linkage, materiality, internal consistency), not ground truth.
5. That the programme has received independent, external, or third-party validation — it has not
   (Section 16).
6. That GEN-001 and VAL-002 together constitute a single, larger, 100/100 pre-registered result —
   they are two separate studies (Section 10).
7. That the Spanish/English descriptive pattern observed in GEN-001 (50/50 vs. 11/25) is a
   validated, causally-attributed language effect — it is an unresolved, confounded, exploratory
   signal (Section 8).
8. That DRA-GC-2 exists, was admitted, or is available for use — it was explicitly rejected at
   admission review (Section 12).
9. That representation-boundary limitations (footnotes, table shading, OCR, graphics) have been
   "fixed" — they are disclosed, accepted limitations with positive *detection* mechanisms only.
10. That multi-column layout reconstruction is fully solved — it is measurably improved and fails
    safe, not complete, on hybrid layouts.
11. That live re-fetch of any cited source URL will reliably reproduce the original evaluated
    content — Section 14 demonstrates the opposite is common and expected.

---

## 20. Publication limitations

See the companion document `DRA-PUB-001-PUBLICATION-LIMITATIONS.md` for the full limitations
section.

---

## 21. Remaining-gap classification

| Gap / defect | Classification |
|---|---|
| 3/9 issue-class reachability ceiling (6 classes structurally unreachable) | `DOES_NOT_BLOCK_WITH_DISCLOSURE` |
| Stage 5 Spanish materiality degradation (D3) | `DOES_NOT_BLOCK_WITH_DISCLOSURE` |
| Rejected GC-2 / `"es preciso"` false positive | `DOES_NOT_BLOCK_WITH_DISCLOSURE` (documents that a naive fix was tried and correctly rejected) |
| Multi-column residual (hybrid layouts, passthrough-only) | `DOES_NOT_BLOCK_WITH_DISCLOSURE` |
| Non-Latin, non-CJK/non-Cyrillic scripts untested (Devanagari, Arabic/Hebrew, Hangul, etc.) | `DOES_NOT_BLOCK_WITH_DISCLOSURE` |
| GEN-001's 25-unit HTML_ENGLISH stratum loss | `DOES_NOT_BLOCK_WITH_DISCLOSURE` (superseded/closed by VAL-002, but the historical loss itself is disclosed, not erased) |
| No external independent validation | `DOES_NOT_BLOCK_WITH_DISCLOSURE` for a *first* research-candidate publication; would `BLOCKS_FIRST_PUBLICATION` for any claim stronger than "first candidate, internally evidenced" |
| Mixed-language and compound/extreme documents (never tested) | `OUT_OF_SCOPE` for this candidate's claimed coverage |
| DRA-DOC-0033 acquisition block (eLegalix) | `OUT_OF_SCOPE` (external dependency, not a DRA defect; document never admitted, not part of GC-1's evidence base) |
| Second full blind benchmark cycle, external validation programme, literature novelty search | `POST_PUBLICATION_RESEARCH` |

No item in this table is rated `BLOCKS_FIRST_PUBLICATION` given the scope of the thesis in Section
18, because that thesis explicitly names and bounds every one of these limitations rather than
implying broader coverage.

---

## 22. Novelty / contribution assessment (no literature search performed)

Judged solely against this programme's own internal evidence, without any external
literature-novelty search (explicitly out of scope per the task boundaries):

- **Methodological contribution:** a frozen, digest-bound, independently-reproducible evaluation
  artefact paired with a formal reachability analysis that distinguishes "structurally
  unreachable" issue classes from merely-unobserved ones (Section 7) — a level of self-diagnosed
  precision about a system's own coverage ceiling that is not typical of ad hoc document-QA tools.
- **Methodological contribution:** the source-mutability finding (Section 15), demonstrated by
  direct before/after protocol contrast rather than assertion.
- **Empirical contribution:** a documented, root-caused, ablation-isolated cross-language
  materiality defect (ENG-026) plus a documented, adversarially-tested rejection of a naive fix
  (GC2-REV-001) — the rejection itself is evidence of methodological discipline, not merely an
  unresolved bug report.
- **Empirical contribution:** two independent blind studies with pre-registered protocols, proof
  receipts, and explicit non-merge statistical discipline.
- No claim is made here about how this compares to any specific external tool, paper, or standard
  — that comparison requires the literature search this review is barred from performing.

---

## 23. Publication-package artefact inventory (what exists vs. what is missing)

**Exists today, usable directly:**
- Frozen candidate artefact and freeze receipt (`DRA-GC-1-FREEZE-RECEIPT.md`).
- Full robustness/defect ledger (`DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md`).
- Two full blind-study protocol/execution/review document sets (GEN-001: 5 docs; VAL-002: 4 docs).
- Machine-verifiable reachability matrix (`reachability-matrix.ts`) and its test suite.
- This synthesis, the claim-evidence matrix, and the publication-limitations document.

**Missing, not assembled by this review (explicitly out of scope per Section 31 boundaries):**
- The actual research paper / manuscript draft.
- A literature-positioning / related-work section.
- An external-validation plan or execution.
- A publication-ready condensed dataset/appendix export (the raw evidence lives across ~45
  separate `docs/dra/` reports plus source code; no single reader-facing appendix consolidates it).
- Any public-facing summary, abstract, or non-technical description suitable for an audience
  outside this programme.

---

## 24. Twelve publication-readiness dimensions

| # | Dimension | Rating |
|---|---|---|
| 1 | Candidate identity/freeze integrity | `STRONG` |
| 2 | Development-corpus diversity | `ADEQUATE` |
| 3 | Robustness/defect-closure discipline | `STRONG` |
| 4 | Issue-class coverage breadth | `ADEQUATE_WITH_LIMITATION` (3/9, precisely characterised) |
| 5 | Blind generalisation evidence (GEN-001) | `ADEQUATE_WITH_LIMITATION` |
| 6 | Targeted follow-up evidence (VAL-002) | `STRONG` |
| 7 | Cross-language materiality reliability | `WEAK` (English strong, Spanish materially degraded, disclosed) |
| 8 | Statistical rigor / non-merge discipline | `STRONG` |
| 9 | Reproducibility (proof receipts, frozen bytes) | `STRONG` |
| 10 | Reproducibility (live re-acquisition) | `ADEQUATE_WITH_LIMITATION` (works for GEN-001/VAL-002-style frozen-byte design; not for naive re-fetch) |
| 11 | External independent validation | `MISSING` |
| 12 | Publication-package completeness (paper, literature position, public summary) | `MISSING` |

**Overall judgement: sufficient for a first, narrowly-scoped, internally-evidenced research
candidate publication (per the thesis in Section 18), explicitly not sufficient for any
externally-validated or general-reliability claim.**

---

## 25. Final verdicts

**`DRA_READY_FOR_FIRST_PUBLICATION`** — for the narrow thesis in Section 18, with the disclosed
limitations in Section 20/21 and the prohibited claims in Section 19 carried into the publication
package unmodified. No dimension in Section 24 is rated low enough to withhold *this* narrow
publication; `MISSING` items (external validation, package assembly) are explicitly out of scope
for readiness-to-publish-a-first-candidate and are instead the leading items for post-publication
work.

**`DRA_V1_ENGINEERING_FROZEN_FOR_PUBLICATION`** — a recorded programme state, not an executed code
action: no further engineering changes to DRA-GC-1, Stage 5, the issue-class architecture, or any
frozen file should be made in service of this publication. Any future engineering work (e.g. a
genuine Stage 5 Spanish fix, a DRA-GC-2 re-attempt, non-Latin-script expansion) is post-publication
research, tracked separately, and must go through the same freeze/blind-validation discipline this
programme has already established.
