# DRA-GEN-001 — Blind Generalisation Protocol and Sampling Design

**STATUS: DRAFT** (Phase 0 methodology design; not frozen; no blind sample selected)

**Bound candidate:** `DRA-GC-1`, canonical aggregate digest
`77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` (see
`docs/dra/DRA-GC-1-FREEZE-RECEIPT.md`).

**Machine-readable core:** `lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts`
**Considered-candidate exclusion registry:** `lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts`
**Integrity tests:** `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts`

This document defines and locks the *methodology* for testing DRA-GC-1 against genuinely unseen
documents. No blind-test document has been selected, inspected, acquired, parsed, frozen, or
evaluated as part of producing this document. Per its own Section 24, this is a protocol-design
programme, not a robustness-engineering or acquisition programme.

---

## 1. Primary objective

Define a preregistered-style blind generalisation benchmark answering: **how reliably does the
frozen DRA-GC-1 candidate operate on previously unseen eligible documents drawn under a
predefined sampling protocol, without post-freeze tuning?**

The benchmark must measure actual generalisation, not demonstrate that DRA works. Failures are
evidence. The protocol below is designed specifically to prevent cherry-picking, retrospective
stratification, replacement of hard documents, development-corpus leakage, post-result metric
changes, post-freeze evaluator tuning, and silent exclusion of failures — see Sections 5, 7, 11,
12, and 14 respectively.

## 2. Inferential target population

**In-scope population:** see `IN_SCOPE_POPULATION_DESCRIPTION`. In short: documents published by
an authoritative public-sector or intergovernmental institution, in PDF or HTML, in one of GC-1's
five validated languages (English, Spanish, French, Japanese, Bulgarian) for decision-level
claims, published in the last 15 years, under a licence or lawful-use basis permitting benchmark
evaluation, containing regulatory/policy/legal/standards/technical/public-sector-scientific
content.

**Out-of-scope population:** see `OUT_OF_SCOPE_POPULATION_DESCRIPTION`. In short: general internet
content, paywalled/gated sources, non-official mirrors, unvalidated scripts (RTL, Devanagari-type,
scriptio continua), image-only documents, and any claim about the real-world truth of a document's
subject matter.

**Declared GC-1 boundaries carried forward** (`CARRIED_FORWARD_LIMITATIONS`, sourced from the
DRA-ROB-002 ledger, restated without softening):

| ID | Ledger entry | Consequence for GEN-001 |
|---|---|---|
| `SCRIPT_BOUNDARY_RTL_ABUGIDA_SCRIPTIO_CONTINUA` | D2 | These scripts are excluded from the sampling frame entirely; GEN-001 makes no claim about them. |
| `NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE` | D3 | Non-English documents may be sampled for non-decision endpoints, but decision-correctness/materiality claims are scoped to English only. |
| `MULTICOLUMN_BOUNDED_RESIDUAL_RISK` | D1 | Multi-column PDFs remain eligible; a reading-order defect consistent with the documented failure mode is `KNOWN_LIMITATION_ENCOUNTERED`, not an unexpected failure. |
| `UNTESTED_MULTI_WEAKNESS_INTERACTION` | D4 | GEN-001 may be the first exposure to multi-weakness documents; any resulting failure is classified on its own merits, not waved through as "expected." |
| `SIX_OF_NINE_ISSUE_CLASSES_UNTRIGGERABLE` | D6 | The issue-class-distribution endpoint cannot support claims about the 6 untriggerable classes. |

## 3. Unit of analysis

One unit = one independently citable publication artefact at a specific edition, identified by a
single canonical source URL (or canonical ordered URL set for multi-page HTML publications, per
DRA's existing multi-page-HTML precedent — ACQ-006/012/016). See `UNIT_OF_ANALYSIS_DEFINITION` and
`UNIT_EDGE_CASE_POLICIES` for the fixed rules on multi-file reports (main file only), translated
editions (separate units, but family-limited to one draw per underlying work), revised editions
(latest identifiable edition only), periodical issues (the dated issue is the unit, not the
series), and mirrors (canonical source only, deduplicated at eligibility). Each unit carries a
"publication family identifier" (normalised publisher + title + base edition) so that translations
or republications of one work cannot be double-counted as independent observations.

## 4. Eligibility criteria

Twelve deterministic criteria (`ELIGIBILITY_CRITERIA`, E1–E12), assessed without looking at DRA's
performance on the candidate: official-source requirement, licence/lawful-use basis, media type
(PDF/HTML only), accessibility without login/CAPTCHA/paywall gating (a bot-blocked source stays in
the frame and is handled via Section 11, not silently excluded), minimum 500-word substantive
content, document-identity sufficiency, latest-edition-only, a 2011–present publication window,
the validated-language/script constraint from Section 2, no-duplicate-in-frame, exclusion from the
development/considered set (Section 5), and no prior human inspection of the specific document.

## 5. Development-contamination exclusion

**Minimum exclusion set:** the 33-document GC-1 development corpus
(`GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS`) plus `DRA-DOC-0033`
(`GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID`, unadmitted but human-inspected).

**Extended exclusion (this protocol's addition):** every document ever considered during any
DRA-ACQ discovery/candidate-discovery programme — admitted, rejected, deferred, or externally
blocked alike (e.g. the Cloudflare-blocked OBR/Ofwat/Ofcom/CBO/BLS/GAO/CDC-MMWR candidates) —
because a human inspected each of them to judge DRA suitability, which is precisely what Section
12's blindness rule prohibits before selection. This is enforced by a **computed, not hand-written,
registry**: `dra-gen-001-considered-candidate-registry.ts` was generated by statically scanning
every file under `benchmark/acquisition/discovery/` and `benchmark/acquisition/__tests__/` (plus
the acquisition module files) for every HTTP(S) URL literal (normalised to origin+pathname,
query/fragment stripped, lowercased) and every `candidateId:` literal, yielding 143 distinct
considered URLs and 78 distinct considered candidate IDs at generation time. Matching is
deliberately over-inclusive (a spurious exclusion only shrinks the frame; an omission would
silently break blindness).

Exclusion matching uses: DRA-DOC ID, normalised source URL, publisher identifier, normalised
title, edition/date, and source digest where retained — **never** a wholesale publisher ban; a
publisher having one document in development does not disqualify their other publications (per
explicit task instruction).

## 6. Sampling frame

**Frame construction** (deterministic, no randomness): enumerate a fixed, versioned list of
authoritative publisher sources not already exhausted by development; for each publisher, apply a
predeclared deterministic query rule against their public document index (e.g. "N most recent
publications in category X as of frame-construction date"); concatenate per-publisher pools in a
fixed publisher order into one master eligible-candidate list with sequential frame-position
numbers; hash and record the full frame *before* any random draw.

**Selection** (separate step): a seeded, without-replacement pseudo-random draw from the recorded
frame, stratified per Section 7. The seed, the frame hash, and the draw order are all recorded —
frame construction and selection are independently auditable.

## 7. Stratification design

**Hard, pre-allocated strata** (`HARD_STRATA`): media type (PDF/HTML) × language group
(English/other-validated), 4 cells, equal allocation (25% each). This crosses the two dimensions
most directly tied to the two strongest declared GC-1 limitations — D1 (multi-column/PDF layout)
and D3 (English/non-English materiality) — giving the benchmark maximum statistical power on its
most decision-relevant comparison, while keeping the cell count low enough to remain interpretable
at the recommended sample size.

**Soft, monitored dimension:** domain/publisher class (Legal/Regulatory, Government/Policy,
Standards/Technical-Guidance, Statistical/Scientific-report) is sampled proportionally to its
natural frequency in the frame and reported descriptively, not force-balanced. A full 2×2×4 cross
(16 cells) was considered and rejected: at n=90–100 it would leave only ~5–6 units per cell, too
thin to support any claim, which is exactly the over-stratification the task warns against.

## 8. Sample-size analysis

Evaluated n ∈ {50, 75, 100, 150, 200} against two criteria: (a) the width of the 95% Wilson
confidence interval around an observed proportion, and (b) the minimum failure rate detectable
with ≥95% probability of observing at least one occurrence (rule-of-three).

| n | 95% CI half-width at p=0.90 | Min. detectable failure rate (95% conf., ≥1 occurrence) | Verdict |
|---|---|---|---|
| 50 | ±17.0pp | ~6% | Rejected — underpowered, per-stratum n≈12–13 |
| 75 | ±13.8pp | ~4% | Minimum viable fallback |
| **100** | **±11.9pp** | **~3%** | **Recommended primary** |
| 150 | ±9.7pp | ~2% | Rejected — meaningful but unjustified marginal cost |
| 200 | ±8.4pp | ~1% | Rejected — reserved for a possible future GEN-002 |

(Full table across p ∈ {0.5, 0.8, 0.9, 0.95} is in `SAMPLE_SIZE_OPTIONS`.)

**Recommendation: n = 100**, not because a prior programme used that number, but because it is the
smallest evaluated size that reliably detects a ≥3% material failure rate while keeping the
overall 95% CI under ±12 points and leaving n=25 per hard stratum — workable for descriptive
stratum comparison given this project's demonstrated per-document acquisition cost (31 acquisition
programmes to admit the 33-document development corpus).

**What n=100 can establish:** a reasonably precise estimate of the overall material-failure rate
and pipeline-completion rate (±~9–12pp depending on the true rate), detection of failure modes
occurring at ≥3% frequency, and a descriptive (not high-precision) comparison across the 4 hard
strata (n≈25 each).

**What n=100 cannot establish:** precise sub-3% failure-rate estimation, statistically powered
comparisons within the soft (domain/publisher-class) stratum, or any claim beyond the declared
population (Section 2).

If stratification requirements changed materially (e.g. if a fifth hard stratum were required),
this would proportionally increase the recommended n; this was evaluated and rejected in Section 7.

## 9. Primary outcomes (predeclared)

`ENDPOINTS` fixes three tiers before execution:

- **Primary:** `ACQUISITION_SUCCESS_RATE`, `PIPELINE_COMPLETION_RATE`, `PROOF_INTEGRITY_RATE`,
  `MATERIAL_FAILURE_RATE`.
- **Secondary:** `REPRESENTATION_SUCCESS_RATE`, `DECISION_DISTRIBUTION`,
  `ISSUE_CLASS_DISTRIBUTION`, `DETERMINISM_REPEATABILITY_RATE`,
  `KNOWN_LIMITATION_ENCOUNTER_RATE`.
- **Exploratory:** `STRATUM_LEVEL_BREAKDOWNS`, `PUBLISHER_OR_FORMAT_CORRELATES_OF_FAILURE`.

`MATERIAL_FAILURE_RATE` is the single most important number, and it explicitly excludes correct
REVIEW/HOLD decisions and `KNOWN_LIMITATION_ENCOUNTERED` — the protocol distinguishes DRA correctly
flagging a document from DRA itself failing.

## 10. Failure taxonomy (predeclared, `FAILURE_TAXONOMY`)

Ten categories fixed in advance: `EXTERNAL_ACQUISITION_FAILURE`, `GOVERNANCE_INELIGIBLE`,
`REPRESENTATION_FAILURE`, `PIPELINE_FAILURE`, `DETERMINISM_FAILURE`, `PROOF_INTEGRITY_FAILURE`,
`SEMANTIC_EVALUATOR_FAILURE`, `KNOWN_LIMITATION_ENCOUNTERED`, `SUCCESSFUL_EVALUATION`, and the
exceptional `UNCLASSIFIED` (usable only with mandatory review and full disclosure — see
`FAILURE_TAXONOMY` for the exact boundary of each, which document/replacement eligibility it
carries, and whether it counts toward `MATERIAL_FAILURE_RATE`). No new favourable category may be
invented after seeing results.

## 11. External acquisition failure and replacement rules

Legitimate replacement reasons: `EXTERNAL_ACQUISITION_FAILURE` after the full retry protocol,
`GOVERNANCE_INELIGIBLE` discovered post-selection, or a duplicate discovered post-selection.
**Illegitimate:** DRA performing badly or being difficult to process after successful acquisition
— such a document is *never* replaced (`postAcquisitionFailureNeverReplaced`).

Retry protocol: up to 3 attempts (t=0, +60s, +300s from first failure), or immediate
classification on an explicit permanent-failure signal (HTTP 404/410). All attempt evidence is
retained. Replacement is drawn from the *same stratum*, using the *same seeded selection
procedure* (next un-drawn frame position), never a fresh manual pick. The original draw and the
replacement are both recorded and both appear in the reported sampling flow (Section 20).

## 12. Blindness rules

No document may be inspected — by a human or by DRA tooling — for the purpose of predicting DRA's
likely performance before it is locked into the selected sample manifest (Section 18). After
locking, inspection is permitted only for governance verification, oracle/ground-truth assessment,
and failure classification, and such inspection must never change GC-1 itself. Any human judgement
involved is recorded (`BLINDNESS_RULES`).

## 13. Ground truth and oracle strategy

Automatically measurable endpoints (acquisition success, pipeline completion, proof integrity,
determinism repeatability, decision distribution, issue-class distribution) require no human
oracle. Two endpoints require independent reference: `REPRESENTATION_SUCCESS_RATE` (spot-checked
against publisher-provided structured HTML/table-of-contents/visual layout, not exhaustively
re-keyed by hand) and `SEMANTIC_EVALUATOR_FAILURE` classification (blinded adjudication against a
predefined rubric, with mandatory dual review for high-impact failures and disclosed, never
silently resolved, disagreement — `ORACLE_STRATEGY`).

## 14. Preventing post-hoc metric selection

Sections 9's three tiers are fixed before execution. An exploratory finding may motivate a future
programme but can never be presented as confirmatory GEN-001 evidence, and no exploratory metric
may be promoted to primary after results are seen.

## 15. Success criteria

No single aggregate pass/fail score, because different failure classes carry materially different
consequences (`SUCCESS_CRITERIA_BANDS`). Proof integrity is treated as an effective hard
requirement — any `PROOF_INTEGRITY_FAILURE` is individually reported regardless of overall rate.
Pipeline completion and material-failure rates are reported with their 95% CIs against the
development-corpus baseline (34/34 = 100% completion), with any shortfall reported as a finding
requiring investigation rather than an automatic fail. Known-limitation encounters are reported
descriptively and never merged into the material-failure denominator.

## 16. GC-1 immutability during GEN-001

GEN-001 is explicitly bound to `BOUND_CANDIDATE_DIGEST =
77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`. Before every execution batch,
the live GC-1 aggregate digest must be recomputed
(`dra-gc-1-freeze-manifest.computeAggregateDigest()`) and compared; any mismatch is an immediate
**STOP** — GEN-001 does not continue under the DRA-GC-1 label. Observational tooling may be added
during execution only if demonstrably non-decision-affecting; when in doubt, it is treated as
decision-affecting and withheld (`STOPPING_RULES`).

## 17. Defect discovery protocol

If a blind document exposes a genuine defect: (1) preserve the original GC-1 input/output/evidence;
(2) record the failure against GC-1, not erase it; (3) classify under the fixed taxonomy (Section
10); (4) do not modify GC-1; (5) continue the benchmark only if doing so does not contaminate
subsequent units (Section 18); (6) any warranted engineering happens outside GEN-001; (7) a new
candidate such as `DRA-GC-2` is created for the fix; (8) GC-1's results are never retroactively
replaced with corrected ones. `STOPPING_RULES.severeStopConditions` defines when the benchmark must
halt entirely rather than continue (candidate-identity mismatch, a blindness breach, a frame/sample
construction integrity breach, or a systemic defect that would invalidate all remaining units).

## 18. Sequential contamination control

Default ordering: **select and lock the entire blind sample (including a pre-reserved per-stratum
replacement pool) before evaluating the first selected document.** Acquisition/eligibility
reverification for the full locked sample completes before any unit proceeds to evaluation, so
acquisition-stage learning cannot influence which units get evaluated or how. No engineering occurs
between units, and detailed root-cause investigation of any observed failure is deferred until the
full run is complete and reported (`SEQUENTIAL_CONTAMINATION_CONTROL`).

## 19. Reproducibility and audit trail

GEN-001 must preserve: protocol version/digest, sampling-frame definition and hash, the random seed
and full deterministic selection record, the complete candidate frame, every eligibility decision,
every exclusion reason, the selected sample manifest, all replacements (original + replacement
pairs), acquisition evidence, source digests, GC-1 identity verification results per batch,
evaluation outputs, proof receipts, repeatability results, failure classifications, adjudication
records, and aggregate results. This mirrors the audit-trail discipline already established by
`DRA-ACQ-*`/`DRA-BMK-*` programmes; nothing new needs to be invented, only applied consistently
across the full locked sample.

## 20. Statistical reporting

Report explicit denominators throughout; counts and proportions for every endpoint; 95% Wilson
confidence intervals for all primary rates; stratified breakdowns where sample size permits (hard
strata only, treated as exploratory per Section 9); external acquisition failures reported
separately from DRA-caused system failures; known-limitation encounters reported separately from
material failures; and no denominator manipulation — a selected-then-replaced unit is shown in the
sampling flow even though its replacement is the one scored.

## 21. Publication claim discipline

Supportable claim forms (examples): "DRA-GC-1 was frozen before blind sample selection and
evaluated on N previously unseen documents selected under a predefined sampling protocol";
"X/N eligible and acquired blind documents completed the frozen DRA pipeline without a
benchmark-defined material system failure"; "Results were obtained without modifying the candidate
in response to blind-test observations." **Not supportable from GEN-001 alone:** universal
correctness, worldwide coverage, perfect document trustworthiness, correctness across explicitly
excluded scripts/formats (Section 2), correctness of the underlying source information itself, or
replacement of independent external validation.

## 22. Phase 0 artefacts

- `docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md` (this document).
- `lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts` — machine-readable protocol
  core: identity/status, population definition, carried-forward limitations, unit-of-analysis
  rules, eligibility criteria, sampling-frame/stratification design, sample-size analysis,
  endpoints (primary/secondary/exploratory), failure taxonomy, replacement policy, blindness
  rules, oracle strategy, success-criteria bands, GC-1 digest binding/stopping rules, and
  sequential contamination control.
- `lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts` —
  computed (not hand-transcribed) registry of every URL/candidateId ever considered across all
  DRA-ACQ discovery programmes, for Section 5 contamination exclusion.
- `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts` —
  integrity tests for the load-bearing protocol commitments (Section 22 requirement below).

## 23. Phase 0 final decision

**Verdict: `DRA_GEN_001_PROTOCOL_READY_TO_FREEZE`**

The methodology is complete: inferential target, unit of analysis, eligibility, contamination
exclusion (with a computed registry, not prose), sampling frame and stratification, a justified
sample size (n=100, with documented alternatives and rejection reasons), predeclared primary/
secondary/exploratory endpoints, a predeclared failure taxonomy with replacement eligibility per
category, replacement rules that never permit swapping out a poorly-performing document,
operational blindness rules, an oracle strategy scoped to what actually needs human judgement,
interpretation-band success criteria (not a single arbitrary score), a GC-1 digest-binding stopping
rule, a defect-discovery protocol that forces escalation to a new candidate rather than silent
patching, sequential contamination control (lock-then-evaluate), a full audit-trail specification,
a statistical-reporting plan, and explicit publication claim-discipline boundaries.

No load-bearing methodological decision was deferred to "decide later." Per Section 23's
instruction, **this protocol is not being frozen in this same action** — freezing it is a
follow-on decision left for explicit review, exactly as GC-1's own freeze followed, rather than
immediately followed, its readiness review.

---

**Programme boundaries maintained:** no blind-test document was selected, inspected, acquired, or
evaluated; DRA-GC-1 was not modified; CHK-005 was not fixed; layout reconstruction was not
modified; DRA-DOC-0033 was not retried; no GC-1 limitation was engineered around; DRA-GEN-001
execution was not started.
