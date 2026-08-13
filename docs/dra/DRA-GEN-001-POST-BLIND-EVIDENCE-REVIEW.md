# DRA-GEN-001 Post-Blind Evidence Review

This is an **evidence-interpretation review**, not an engineering programme. It
modifies nothing under DRA-GC-1, the frozen GEN-001 protocol, the locked
blind sample, Phase 2 results, or any historical benchmark record. It only
reads those artefacts and states what they do and do not support.

---

## Executive conclusion

GEN-001 Phase 2 produced a clean, fully reproducible reliability result on
**75 of the 100 locked documents**: zero pipeline, determinism, or
proof-integrity failures, with valid, independently re-verifiable proof
receipts on every evaluated unit. It does **not** produce a complete
four-stratum generalisation result, because the entire `HTML_ENGLISH`
stratum (25/25 units) failed pre-evaluation source-stability verification
and was never evaluated. The evidence is strong for *"GC-1 is operationally
reliable on documents it actually reaches,"* and is silent — not negative,
silent — on English-language HTML specifically. A secondary, exploratory,
confounded pattern (all 50 evaluated Spanish documents SUPPORTED/0-issues
vs. 11/25 evaluated English documents HOLD/REVIEW) is directionally
consistent with, but does not independently confirm, the previously
documented D3 (CHK-005) non-English-materiality limitation.

**Benchmark evidence verdict: `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`.**
**Next-evidence verdict: `TARGETED_FOLLOW_UP_REQUIRED`.**

---

## 1. Evidence reconstruction (verified against repository artefacts)

All of the following were independently recomputed from
`lib/dra-reference/src/benchmark/analysis/gen-001-phase2/data/*.json`
(`run-a.json`, `ab-comparison.json`, `proof-verification.json`,
`failure-classification.json`), not taken from prose summaries, and are
pinned by the automated tests in Section 15.

| Claim | Verified value |
|---|---|
| Locked sample size | 100 |
| Evaluated sample size | 75 |
| Pre-evaluation exclusions | 25 |
| All 25 exclusions belong to GOV.UK / `HTML_ENGLISH` | Confirmed — 25/25 |
| Exclusion classification | `EXTERNAL_ACQUISITION_FAILURE` (all 25) |
| Successful evaluations | 75/75 |
| Pipeline failures | 0 |
| Determinism failures | 0 (75/75 Run A ≡ Run B) |
| Proof-integrity failures | 0 (75/75 independently re-verified) |
| Decision distribution | 64 SUPPORTED, 10 HOLD, 1 REVIEW (sums to 75) |
| Issue-class reachability | 3 of 9 observed (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`); 6 remaining classes are the already-documented V1-architecture-unreachable set |
| Spanish pattern | 50/50 evaluated Spanish documents (`PDF_NON_ENGLISH` + `HTML_NON_ENGLISH`) SUPPORTED with 0 issues |
| English pattern | 11/25 evaluated English documents (`PDF_ENGLISH`; `HTML_ENGLISH` contributed 0 evaluated units) received HOLD or REVIEW |

No discrepancy was found between the task's stated figures and the
repository artefacts.

## 2. Three denominators

| Population | N | Description |
|---|---|---|
| **A. Locked blind sample** | 100 | The full sample fixed under the frozen protocol at Phase 1 sample lock. |
| **B. Evaluated blind sample** | 75 | Subset of A that reached GC-1 evaluation. |
| **C. Excluded pre-evaluation units** | 25 | Subset of A that did not reach evaluation, per the frozen protocol's acquisition/stability handling — not a DRA execution outcome. |

These three populations are kept distinct throughout this review.
**`ACQUISITION_SUCCESS_RATE` uses denominator A (100).** `PIPELINE_COMPLETION_RATE`,
`PROOF_INTEGRITY_RATE`, and `DETERMINISM_REPEATABILITY_RATE` use denominator B
(75), matching each endpoint's own frozen definition
(`ENDPOINTS` in `dra-gen-001-protocol.ts`). `MATERIAL_FAILURE_RATE` uses
denominator A (100), per its own frozen definition, even though its
numerator (0) is unaffected by which denominator is chosen. No claim in this
review or in the underlying Phase 2 report treats 75 as if DRA "executed
successfully on 100 documents" — DRA never executed on the 25 excluded
units at all.

## 3. Review of the 25 GOV.UK drift exclusions

**Was exclusion strictly required by the frozen protocol?** Yes.
`SEQUENTIAL_CONTAMINATION_CONTROL` and the general "locked source bytes
only" design (confirmed in Phase 1's `freeze-selection.ts`, which persists
only `sha256`/`byteLength`/`wordCount`, never raw bytes) together mean Phase
2 has no protocol-sanctioned way to evaluate a source whose live bytes do
not verify against its lock — doing so would evaluate unverified content
under the DRA-GC-1 label, which the protocol does not permit. Given that
constraint, exclusion of the 25 non-verifying units was not a judgement
call; it followed directly from the frozen locked-bytes-only design.

**Is `EXTERNAL_ACQUISITION_FAILURE` the best taxonomy fit?** It is the best
available fit, but not an exact one, and this was already flagged as an
interpretive judgement in the Phase 2 report. The frozen taxonomy's
definition reads *"official source cannot be obtained ... due to external
availability/rate-limiting/access restriction, with no DRA-caused defect
involved."* The GOV.UK case is subtly different: the source **was**
obtained (HTTP 200 on every attempt), but its content did not match the
Phase 1 lock. No category in `FAILURE_TAXONOMY` addresses "reachable but not
byte-reproducible" directly. Of the ten categories, `EXTERNAL_ACQUISITION_FAILURE`
remains the closest fit (external, pre-evaluation, no DRA-caused defect),
better than any alternative:
- Not `GOVERNANCE_INELIGIBLE` (no licence/eligibility criterion failed).
- Not `REPRESENTATION_FAILURE` (representation was never attempted; nothing was extracted incorrectly — the *input itself* was unverifiable).
- Not `PIPELINE_FAILURE`/`DETERMINISM_FAILURE`/`PROOF_INTEGRITY_FAILURE`/`SEMANTIC_EVALUATOR_FAILURE` (GC-1 was never invoked on these units).

**Is source drift external, an acquisition-reproducibility limitation, an
overly strict rule, or a combination?** A combination, with external
behaviour as the dominant factor: the manually spot-checked case showed
byte-length parity with the lock but a different SHA-256, consistent with a
fixed-length, dynamically-generated token embedded in GOV.UK's page output
— an external, publisher-side behaviour DRA does not control. Simultaneously,
the *protocol's own choice* not to persist raw bytes at lock time (an
acquisition-reproducibility design decision, not a GC-1 defect) is what
converts that external drift into a benchmark-visible exclusion; a protocol
that persisted raw bytes at lock time would not have needed to re-verify
byte identity at all and could have evaluated the originally-locked bytes
directly. Whether requiring live re-verification (rather than persisting
bytes) is itself "overly strict" is a legitimate methodological design
question, but it is the protocol as frozen, and this review does not
recommend or perform a retroactive change to it (see Section 18).

**Could GC-1 technically have been evaluated on the already-locked Phase 1
bytes?** No — the Phase 1 bytes themselves were never persisted (only their
digest/length/word-count), so there was no cached byte sequence available to
evaluate even if the protocol had permitted skipping re-verification. The
only way to obtain evaluable bytes at all was to fetch live and check them
against the lock digest, which is exactly what Phase 2 did.

**Did requiring reacquisition materially affect inferential coverage?**
Yes, substantially: it is the sole reason the entire `HTML_ENGLISH` stratum
produced zero evaluated units (see Section 4).

## 4. Stratum-loss consequence

| Stratum | Locked (n) | Evaluated (n) | Status |
|---|---|---|---|
| `PDF_ENGLISH` | 25 | 25 | Fully represented |
| `PDF_NON_ENGLISH` (Spanish) | 25 | 25 | Fully represented |
| `HTML_ENGLISH` (GOV.UK) | 25 | **0** | **Fully lost** |
| `HTML_NON_ENGLISH` (Spanish) | 25 | 25 | Fully represented |

Three of the four hard strata (75/75 of their combined locked size) survived
completely intact; one hard stratum was lost in its entirety. The surviving
75 documents are **not** a balanced four-stratum sample — they are three
complete strata plus a fourth stratum contributing zero evaluated evidence.

**Classification of intended inferences:**

| Intended inference | Classification |
|---|---|
| English-language PDF regulatory documents | `SUPPORTED_BY_GEN_001` |
| Spanish-language PDF/HTML (BOE) documents | `SUPPORTED_BY_GEN_001` |
| English HTML (GOV.UK-style) documents | `NOT_TESTED_DUE_TO_STRATUM_LOSS` |
| "HTML in general" | `NOT_TESTED_DUE_TO_STRATUM_LOSS` (only non-English HTML was evaluated; no English HTML evidence exists in this run) |
| "English in general" | `PARTIALLY_SUPPORTED` (English PDF is evaluated; English HTML is not) |
| Format × language interaction (the 2×2 design cell structure) | `PARTIALLY_SUPPORTED` — 3 of 4 cells evaluated; the PDF-English/PDF-Spanish/HTML-Spanish cells are populated, the HTML-English cell is empty |
| The complete frozen four-stratum target population | `NOT_TESTED_DUE_TO_STRATUM_LOSS` (as a whole design; no single endpoint spans all four cells with evidence) |
| Non-Latin-script/RTL/scriptio-continua populations | `OUTSIDE_GC_1_SCOPE` (excluded by the protocol's own population definition, not a GEN-001 finding) |

## 5. Primary endpoint reinterpretation

| Endpoint | Original intended denominator | Actual observed denominator | Exclusion affects interpretation? |
|---|---|---|---|
| `ACQUISITION_SUCCESS_RATE` | Locked sample (100), including replacements per Section 11 | 100 (no replacement occurred — see Section 3) | Directly measures the exclusion: 75/100 = 0.750, 95% Wilson CI [0.657, 0.825]. This is the one endpoint where the 25 exclusions are the finding, not a caveat. |
| `PIPELINE_COMPLETION_RATE` | Successfully acquired documents | 75 (the acquired subset) | Not affected by the exclusion in its own denominator terms (its denominator excludes acquisition failures by design), but its evidentiary *scope* is limited to the 75 acquired documents — it says nothing about the 25 that were never acquired. 75/75 = 1.000, rule-of-three upper bound on the failure rate ≤0.030 at n=75. |
| `PROOF_INTEGRITY_RATE` | Completed evaluations | 75 | Same scope limitation as above. 75/75 = 1.000, rule-of-three upper bound ≤0.030 at n=75. |
| `MATERIAL_FAILURE_RATE` | Locked sample (100) | 100 | Not affected in denominator, and the exclusions do not count toward it by taxonomy design (`countsTowardMaterialFailureRate: false` for `EXTERNAL_ACQUISITION_FAILURE`). 0/100 = 0.000, 95% CI [0.000, 0.037] (rule-of-three ≤0.030). |

**Distinguishing three separate claims:**
- *Operational evaluator reliability* (pipeline/determinism/proof integrity): **strong**, measured at 75/75 on every dimension, conditional on a document reaching evaluation.
- *Acquisition/reproducibility behaviour*: **materially imperfect** — 25% of the locked sample, concentrated entirely in one publisher/format, could not be reacquired byte-identical to its lock.
- *Inferential generalisation coverage*: **incomplete** — one of four hard strata (English HTML) has zero evaluated evidence; the population-level claim "GC-1 generalises across the full target population" is not supported by this run, only the narrower claim about the three strata that were evaluated.

**The precise, supportable claim:**
> GC-1 completed all 75 evaluations that reached it with no pipeline,
> determinism, or proof failures.

**The claim this review explicitly does not support:**
> GC-1 generalised successfully across the complete 100-document target
> sample.

The second claim requires evidence GEN-001 does not have (zero evaluated
English-HTML documents), and is not asserted anywhere in this review or the
underlying Phase 2 report.

## 6. Strength of the 75-document result

Applying the protocol's own statistical conventions (Wilson score / rule of
three, as implemented in `gen-001-phase2/statistics.ts` and used unchanged
here — no new metric or method was introduced for this review):

| Metric | n | Observed failures | Rule-of-three 95% upper bound on true failure rate |
|---|---|---|---|
| Pipeline completion | 75 | 0 | ≤ 3/75 = 0.040 (Wilson computation gives an equivalent lower bound on the success rate of 0.951) |
| Determinism | 75 | 0 | ≤ 0.040 |
| Proof integrity | 75 | 0 | ≤ 0.040 |

**Precise inferential scope:** these bounds describe reliability
*conditional on a document reaching evaluation* — i.e., "if GC-1 evaluates a
document drawn from a population resembling the evaluated 75, its true
failure rate on these three dimensions is very unlikely to exceed ~4%." They
say nothing about reliability across the full sample-selection →
acquisition → evaluation chain, where the empirically observed failure rate
(acquisition-stage) was 25/100 = 25%, far higher and driven entirely by one
publisher/format combination. Conflating the two — citing 75/75 as evidence
about "the chain" rather than "the evaluation step" — would overstate the
result.

## 7. Spanish/English exploratory pattern

Observed: 50/50 evaluated Spanish documents SUPPORTED/0 issues; 14/25
evaluated English documents SUPPORTED, 11/25 HOLD or REVIEW (39 total
issues, concentrated in a subset of documents — 14 of the 25 English
documents had 0 issues, and one single document, from the Nuclear
Regulatory Commission, carried 10 of the 39 issues; another, from the Office
of Personnel Management, carried 16).

**Candidate explanatory factors assessed against available Phase 2
metadata:**

| Factor | Assessment |
|---|---|
| Language | Perfectly confounded with the observed pattern — cannot be isolated from format/publisher/domain below. |
| Publisher | Not a clean confound-breaker: English non-SUPPORTED documents span at least 7 distinct US federal publishers (Transportation, NCUA, EPA, NRC, HHS, Treasury, OPM), not one outlier; Spanish documents are uniformly BOE (Spain's official gazette). Publisher and language are correlated by sampling design (US federal register vs. Spanish BOE), not independently varied. |
| Source family / format | `PDF_ENGLISH` (Federal Register) vs. `PDF_NON_ENGLISH`+`HTML_NON_ENGLISH` (BOE); format is not the isolating factor since BOE's own HTML and PDF sub-strata behave identically (both 25/25 SUPPORTED/0 issues), while only the English PDF stratum shows the pattern — this argues against a pure format explanation and toward either language or something specific to Federal Register content. |
| Document domain | Federal Register content spans many regulatory domains; BOE content is comparably varied. No domain-level metadata was collected in Phase 1 beyond publisher/title, so this cannot be assessed further without new data collection (out of scope here). |
| Length / structural complexity | Not measured in the Phase 2 artefacts; would require reopening document-level analysis beyond what this review's evidence-only scope permits. |
| Issue-producing content characteristics | Plausible: Federal Register notices of the kind sampled here plausibly contain more claim/evidence-style regulatory assertions that trigger `EVIDENCE_ABSENT`/`EVIDENCE_INADEQUATE` than BOE's genre of notices — this is a content-genre hypothesis distinct from a language hypothesis, and cannot be distinguished from language with current data. |
| Known CHK-005 Stage 5 materiality behaviour | Directly relevant — see Section 8. |
| Correlated sampling design | The stratification itself pairs each language with a specific publisher/jurisdiction (US Federal Register for English, Spanish BOE for Spanish) rather than sampling the same publisher in two languages, so language, publisher, and jurisdiction are jointly confounded by construction, not just correlated by chance. |

**Statistical strikingness, with an explicit confounding caveat:** a 50/50
zero-issue outcome versus 14/25 zero-issue outcome in the other stratum is a
large, non-subtle difference (Fisher-exact-style intuition: observing zero
non-SUPPORTED results in 50 independent draws when the comparison stratum
shows a ~44% non-zero-issue rate would be very unlikely under a shared
underlying rate). This is reported as **descriptively striking**, not as a
confirmed causal effect — the confound structure above (language ≡ publisher
≡ jurisdiction ≡ possibly genre, all varying together) means causality
cannot be attributed to language alone from this data.

## 8. Relationship to CHK-005

The frozen CHK-005 finding: non-English (Spanish) Stage 5
materiality/obligation detection is confirmed systematically
English-lexicon-only (12/12 constructed Spanish obligation pairs
under-detected in a controlled experiment); French untested but suspected to
share the mechanism. This is carried forward as limitation D3
(`NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE`).

**GEN-001's relationship to this prior finding:** GEN-001 is observational,
not a controlled replication — it did not construct matched obligation pairs
across languages, and its Spanish/English documents are entirely different,
unrelated source documents (Federal Register vs. BOE), not translations of
one another. The pattern GEN-001 observed (zero materiality-implicated
issues on any Spanish document, versus a non-trivial issue rate on English
documents) is **directionally consistent** with under-detection of Spanish
obligation/materiality language — a systematic under-detection of Stage 5
materiality signals in Spanish text would produce exactly this
signature (fewer flagged issues, more blanket SUPPORTED decisions). However,
because the two language strata are also completely different document
populations, the same observation is equally consistent with the Spanish
documents genuinely containing fewer evidentiary gaps for reasons unrelated
to language (a weaker, non-materiality explanation cannot be ruled out).

**Classification: `SUPPORTING_EXPLORATORY_SIGNAL`.**

This is not `NO_NEW_SIGNAL` — the pattern is directionally consistent with,
not silent on, D3. It is not `STRONG_TARGET_FOR_FOLLOW_UP` on its own,
because GEN-001 alone (with its confound structure) cannot upgrade a prior
controlled-experiment finding into a stronger claim; however, in combination
with the pre-existing CHK-005 controlled result, it does add real weight to
prioritising a targeted, controlled follow-up (see Option B, Section 13) —
that combined weight is why the next-evidence verdict below is
`TARGETED_FOLLOW_UP_REQUIRED` rather than "sufficient."

## 9. Decision-distribution interpretation

64 SUPPORTED / 10 HOLD / 1 REVIEW is **not** interpreted here as evidence of
64 correct documents — `SUPPORTED` records the absence of a
protocol-detectable issue, not ground-truth correctness, and the protocol's
own `SUCCESS_CRITERIA_BANDS` explicitly forbids treating any one decision
class as inherently correct.

- **Internal plausibility:** the distribution is plausible for a mixed
  regulatory-document sample — a majority of well-evidenced notices with a
  smaller tail of documents containing detectable evidentiary gaps is an
  unsurprising shape, not an anomaly in itself.
- **Concentration by stratum:** yes — all 11 non-SUPPORTED decisions and all
  39 issues are concentrated in the single `PDF_ENGLISH` stratum; the two
  evaluated Spanish strata contributed zero non-SUPPORTED decisions. This
  concentration is the same pattern discussed in Sections 7–8, not a
  separate anomaly.
- **Concentration by publisher within `PDF_ENGLISH`:** mild, not extreme —
  Transportation Department contributed the most documents (12/25) and a
  moderate share of non-SUPPORTED outcomes (5/12), but two of the largest
  single-document issue counts (10 and 16 issues) came from Nuclear
  Regulatory Commission and the Office of Personnel Management respectively,
  each contributing only one document — so the concentration is more
  "a few high-issue outlier documents" than "one systematically bad
  publisher."
- **Suspiciously uniform behaviour suggesting evaluator insensitivity:** the
  Spanish-stratum result (50/50 identical SUPPORTED/0-issues) is the one
  pattern in this dataset that could indicate insensitivity rather than
  genuine document quality — this is exactly the CHK-005-related concern
  raised in Section 8, not a new, independent anomaly.

## 10. 3/9 issue-class result

GEN-001 observed exactly 3 of the 9 defined issue classes
(`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`) across 75
evaluated documents.

- **Confirms the architectural coverage ceiling:** yes — this matches the
  previously documented reachability ceiling for the frozen V1 evaluator
  (memory: "3/9 coverage ceiling"), rather than showing any expansion or
  contraction of it.
- **Any unexpected reachable class:** no — no class outside the
  already-known reachable set fired.
- **New evidence about the six unreachable classes:** none obtained, and
  none could be obtained this way. The absence of the other six classes in
  this sample must be read as **"not observable under the evaluator's
  current architecture,"** not as **"not observed because the 75 documents
  lacked those problems."** GEN-001's blind sample provides no information
  about whether those six issue types are actually present in the
  documents, because the evaluator has no mechanism to detect them
  regardless of the input.

## 11. Structured judgement across dimensions

| Dimension | Assessment |
|---|---|
| Frozen-candidate integrity | **STRONG** — GC-1's aggregate digest, live-reverified before and after execution, matched the bound value throughout; no file under `pipeline/`, `model/`, or the GC-1 freeze manifest changed during Phase 2 or this review (confirmed via `git status`, Section 15). |
| Blindness | **STRONG** — the full 100-unit sample was selected and locked (Phase 1) before any unit was evaluated (Phase 2); no unit was inspected for likely-performance reasons before lock. |
| Operational reliability | **STRONG** — 75/75 on pipeline completion, determinism, and proof integrity, with formal rule-of-three bounds reported rather than asserting perfection. |
| Sample coverage | **WEAK** — one of four hard strata (25% of the design) contributed zero evaluated units; the surviving sample is not the balanced four-cell design that was intended. |
| Generalisation evidence | **ADEQUATE_WITH_LIMITATION** — real evidence exists for 3 of 4 strata; no evidence exists for English HTML, and the design's format×language interaction claim is only partially testable. |
| Scope completeness | English HTML (`HTML_ENGLISH`) is entirely untested; the full frozen target population (all four strata jointly) is untested as a whole. |
| Methodological validity | **ADEQUATE_WITH_LIMITATION** — the benchmark remains a valid, non-contaminated blind test of the 75 documents it reached; the stratum loss must be disclosed as a limitation in any publication, not treated as a disqualifying flaw, since the loss occurred through a pre-registered, protocol-driven mechanism (locked-bytes-only acquisition) rather than post hoc cherry-picking. |

No single overall rating is issued in place of the above; see the two final
verdicts (Section 17) for the review's overall conclusions, which build on
but do not collapse this per-dimension table.

## 12. Publication-safe claims

**Supportable claim (the draft from the task, verified against measured
values and left materially unchanged):**

> DRA-GC-1 was frozen before blind sample selection and evaluated without
> modification on 75 previously unseen documents from a 100-document locked
> sample. All 75 completed successfully, reproduced substantively across two
> runs, and produced valid proof receipts. Twenty-five locked GOV.UK
> HTML-English documents did not reach evaluation because the frozen
> protocol treated post-lock source drift as an external acquisition
> failure. Therefore, GEN-001 provides strong conditional
> operational-reliability evidence for the evaluated strata but does not
> provide complete four-stratum generalisation evidence.

**Additional supportable claims:**
- GC-1 produced no detectable pipeline, determinism, or proof-integrity
  failure on any of the 75 evaluated documents, with a rule-of-three 95%
  upper bound of ~4% on the true failure rate for each of those three
  dimensions, conditional on reaching evaluation.
- All 50 evaluated Spanish-language documents received SUPPORTED with zero
  issues, versus 11 of 25 evaluated English-language documents receiving
  HOLD or REVIEW — a descriptively striking, exploratory pattern that is
  directionally consistent with a previously documented (CHK-005/D3)
  non-English Stage 5 materiality-detection limitation, but that cannot be
  causally attributed to language alone due to confounding with publisher,
  jurisdiction, and possibly content genre.
- Only 3 of the 9 defined DRA issue classes were observed in this run,
  consistent with the previously documented V1 evaluator architectural
  reachability ceiling; this is not evidence that the documents lacked the
  other six problem types.

**Prohibited claims (must not be made from this evidence):**
- 100/100 successful evaluations.
- Universal document reliability, or reliability across the full
  sample-selection/acquisition/evaluation chain (the true chain-level
  success rate observed was 75/100, not 75/75).
- Validated English-HTML generalisation (zero English-HTML documents were
  evaluated).
- Validated performance outside GC-1's five validated languages or its
  script boundary (RTL/abugida/scriptio-continua remain untested and
  out of scope by design).
- Independent external validation (this review, like Phase 2, was performed
  internally, not by an external party).
- Causal attribution of the Spanish/English pattern to language.
- Treating `SUPPORTED` as ground-truth correctness.

## 13. Ranked next steps

| Rank | Option | Scientific importance | Publication consequence | Overfitting risk | Cost | Ability to change DRA's claim | Independence from GEN-001 |
|---|---|---|---|---|---|---|---|
| 1 | **B — GC-2 language/materiality investigation** (targeted, controlled Spanish/English Stage 5 follow-up building on CHK-005) | High — resolves a real, previously-flagged, now doubly-suggested limitation | High — currently the single biggest caveat on any DRA generalisation claim | Low — a controlled, matched-pair design (as CHK-005 already used) avoids overfitting to GEN-001's specific documents | Moderate — reuses existing CHK-005 methodology | High — could confirm, bound, or rule out a real accuracy gap | High — a controlled experiment, not dependent on GEN-001's specific sample |
| 2 | **D — Publication preparation** (freeze existing evidence, write up with declared limitations) | Moderate — captures value already produced | High — delivers a result now, with honest caveats | None — no new data collection | Low | None (doesn't change GC-1) | N/A |
| 3 | **A — Protocol/benchmark follow-up for HTML drift** (prospective locked-byte-vs-live semantics test + restore English-HTML coverage) | Moderate — closes a real coverage gap | Moderate — mainly a methodology fix, not a capability finding | Low-moderate | Moderate-high (new acquisition engineering + a fresh HTML-English sample) | Low-moderate — mainly restores missing coverage rather than surfacing new capability information | High |
| 4 | **C — Issue-class architecture work** (six unreachable V1 issue classes) | High in the long run, but not motivated by any new GEN-001 evidence — this is a pre-existing, already-documented architectural ceiling | Low near-term (large engineering effort before any measurable publication benefit) | N/A | High | Very high, but slow | High |

**Rationale for the ranking:** Option B is ranked first because GEN-001's
own strongest unresolved signal (Section 7–8) directly motivates it, it is
comparatively cheap (methodology already exists from CHK-005), and it has
the highest chance of changing what DRA can honestly claim about non-English
performance. Option D is ranked second, not first, because publishing before
resolving a doubly-suggested, unaddressed language-materiality gap risks a
retraction-style correction later; but it remains a strong, low-cost, low-risk
option if the language gap is instead disclosed rather than resolved. Option
A is ranked third: it is legitimate and would close the stratum-coverage gap,
but the coverage gap by itself (an unknown, not a demonstrated failure) is
less urgent than the language pattern (a suggestive, if confounded, signal of
an actual behavioural gap). Option C is ranked last: it is not motivated by
any new evidence from GEN-001 or this review — it was already a known,
documented limitation before Phase 2 ran, and attacking it now would not use
GEN-001's evidence at all. This review does **not** default to "more
engineering is better" — Option D (no new engineering) is a legitimate
second-ranked choice, and Option C is explicitly deprioritised despite being
technically substantial work.

## 14. Is a second blind benchmark needed?

**`TARGETED_FOLLOW_UP_REQUIRED`.**

A second full 100-document blind benchmark is not justified by current
evidence: the operational-reliability result (75/75 on three dimensions) is
already strong and would not be meaningfully strengthened by simply drawing
another large sample under the same protocol. What is actually missing is
not *more blind documents in general*, but two specific, narrower things:

1. **Non-English materiality evidence** — resolved by a targeted, controlled
   experiment (Option B), not by another large blind draw; a second 100-doc
   blind sample would still leave the same confound structure (language ≡
   publisher ≡ jurisdiction) unless specifically redesigned to break it,
   which would make it a different, purpose-built study, not "GEN-001
   again."
2. **English-HTML stratum coverage** — resolved by either (a) a protocol
   fix that persists raw bytes at lock time and a fresh, smaller HTML-English
   draw, or (b) accepting the gap as a declared limitation for now (Option D)
   and deferring it. Neither requires a full second 100-document benchmark.

If the targeted follow-up (Option B) itself surfaces a confirmed,
substantial accuracy gap, that could motivate a larger confirmatory blind
benchmark at that later stage — but that decision is out of scope for this
review and should not be pre-committed to now.

## 15. Machine-verifiable evidence review

Two new test files were added, covering only load-bearing claims made in
this report (not written to inflate coverage):

- `lib/dra-reference/src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-phase2-integrity.test.ts` (pre-existing, 15 tests, unchanged by this review) — preconditions, artefact binding, proof integrity, taxonomy validity, statistics module correctness.
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-post-blind-evidence-review.test.ts` (new, 11 tests) — covers exactly the claims listed in the task's Section 15 checklist:
  - 100 locked / 75 evaluated / 25 excluded, summing correctly.
  - All 25 exclusions belong to the single `HTML_ENGLISH` stratum; `EXTERNAL_ACQUISITION_FAILURE` is a real taxonomy category that does not count toward `MATERIAL_FAILURE_RATE`.
  - 75/75 determinism and 75/75 proof integrity.
  - Decision totals (64/10/1) sum to exactly 75.
  - Spanish/English descriptive counts (50/50 zero-issue Spanish; 11/25 non-SUPPORTED English; 0 evaluated `HTML_ENGLISH`) match the Phase 2 artefacts.
  - Exactly 3 of 9 issue classes observed, matching the exact class names.
  - No file under `pipeline/`, `model/`, the GC-1 freeze manifest, the GEN-001 protocol, or the Phase 1 sample-lock module changed (via `git status --porcelain`).
  - `CARRIED_FORWARD_LIMITATIONS` still declares D3 unchanged, and `ENDPOINTS` still declares `ACQUISITION_SUCCESS_RATE`'s denominator as the locked sample — guarding against this review silently redefining frozen protocol semantics.

**Test results:** both files pass in full — **26/26 tests passing**
(`npx vitest run src/benchmark/analysis/gen-001-phase2/__tests__/`).
`npx tsc --noEmit` shows zero new errors introduced by this review (the two
pre-existing, unrelated errors in `dra-acq-025`/`dra-acq-026` modules,
present before this review began, are unchanged).

## 16. Exact files created/modified by this review

**Created:**
- `docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md` (this file)
- `lib/dra-reference/src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-post-blind-evidence-review.test.ts`

**Modified:** none. No file under `DRA-GC-1`, the frozen GEN-001 protocol,
the locked blind sample, Phase 2 results, or any historical benchmark
record was changed, consistent with the programme boundaries in Section 18
of the task.

---

## 17. Final verdicts

**Benchmark evidence verdict: `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`.**

Not `STRONG_WITH_DECLARED_LIMITATIONS`, because the limitation (complete
loss of one of four hard strata, plus an unresolved, exploratory
language-materiality signal) is material to the benchmark's core
generalisation purpose, not a minor caveat. Not `WEAK` or `INVALID`, because
the evaluated-subset evidence itself is methodologically sound, blind,
uncontaminated, and internally strong (75/75 on every operational-reliability
dimension) — the limitation is one of coverage and an unresolved signal, not
a flaw in what was actually measured.

**Next-evidence verdict: `TARGETED_FOLLOW_UP_REQUIRED`.**

Not `GEN_001_SUFFICIENT_WITH_DECLARED_LIMITATIONS`, because the
Spanish/English pattern combined with the pre-existing CHK-005 finding
represents a real, actionable, currently-unresolved question that should be
answered before treating DRA's non-English claims as settled. Not
`SECOND_FULL_BLIND_BENCHMARK_REQUIRED`, because the specific uncertainties
that remain (non-English materiality behaviour; English-HTML coverage) are
each better resolved by a narrower, purpose-built study than by another
large, generically-drawn blind sample (Section 14).

These verdicts were reached independent of commercial attractiveness and
are based solely on the evidentiary analysis above.

---

## Recommended next programme

Per the ranking in Section 13: **Option B — a targeted GC-2 language/
materiality investigation**, extending the existing CHK-005 controlled-pair
methodology to determine whether GEN-001's exploratory Spanish/English
pattern reflects a genuine, systematic non-English detection gap. This
review does not initiate that programme; it only recommends it as the
highest-priority next step.

This Post-Blind Evidence Review is now complete. No engineering work was
performed. DRA-GC-1, the frozen protocol, the locked sample, and all
historical benchmark records remain unmodified.
