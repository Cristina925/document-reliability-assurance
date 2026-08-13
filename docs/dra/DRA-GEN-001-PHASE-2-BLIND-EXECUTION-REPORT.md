# DRA-GEN-001 Phase 2 — Frozen-Candidate Blind Execution Report

**Status: DRA_GEN_001_BLIND_EXECUTION_COMPLETE**

This report documents the blind execution of the frozen DRA-GC-1 evaluator
against the DRA-GEN-001 locked 100-document blind sample, for **measurement
only**. No engineering, defect investigation, or replacement occurred during
execution, per the protocol's sequential-contamination-control rules
(`SEQUENTIAL_CONTAMINATION_CONTROL.noEngineeringBetweenUnits`). All numbers
below are computed directly from the persisted result artefacts (see
`lib/dra-reference/src/benchmark/analysis/gen-001-phase2/data/`) and are
reproducible by re-running the three Phase 2 scripts against those files.

---

## 1. Preconditions

Before any execution, all four required identity checks passed
(`preconditions.ts` → `runAllPreconditionChecks()`):

| Check | Result |
|---|---|
| GC-1 candidate identity (`DRA-GC-1`) and live aggregate digest | **VERIFIED** — matches the digest bound in the frozen protocol (`BOUND_CANDIDATE_DIGEST`) |
| Protocol identity (`DRA-GEN-001`) and live aggregate digest | **VERIFIED** — matches the digest recorded at sample lock |
| Contamination exclusion still holds | **VERIFIED** — no selected unit is present in any prior DRA benchmark corpus entry |
| Sample lock unchanged since Phase 1 | **VERIFIED** — live `FROZEN_UNITS` (100 records) digest matches the Phase 1 lock manifest |

No `severeStopConditions` were triggered at any point (no digest mismatch, no
contamination breach, no crash-class defect). Execution proceeded for the
full sample.

## 2. Execution environment

| Field | Value |
|---|---|
| Repository commit | `6505d106a96aa6acd1236e4b73b02bb998b246dc` |
| Node.js | v24.13.0 |
| TypeScript toolchain | tsx v4.23.0 / `tsc` via project `tsconfig.json` |
| Evaluator version | `0.1.2` |
| Pipeline version | `1.0` |
| Model version | `0.1.0` |
| GC-1 bound aggregate digest | `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` |
| Protocol bound aggregate digest | `08739050c3c7f7fbb9b08c2afdbbb9a665df69709ae3760a5a8ac9d6f8daea0e` |
| Sample bound aggregate digest | `37a12cb678541949739ecb7dcd3229572fc48edb9d01c091ad25c83fb1e77536` |

These three digests are re-verified against the live codebase by
`verifyPhase2ArtefactBinding()` and are part of the immutable result bundle
digest below.

## 3. Locked-bytes-only acquisition and re-verification

Phase 1 (`freeze-selection.ts`) deliberately did **not** persist raw source
bytes — only each unit's SHA-256 digest, byte length, and word count were
locked. Phase 2 therefore live-refetched every one of the 100 locked sources
and verified each against its Phase-1-locked digest **before** any
normalisation or evaluation was attempted, per the protocol's "locked source
bytes only" rule. Units failing verification were never evaluated.

**Result: 75/100 units verified byte-identical to their lock; 25/100 did
not.**

| Stratum | n | Digest-verified | Digest-mismatched |
|---|---|---|---|
| `PDF_ENGLISH` | 25 | 25 | 0 |
| `PDF_NON_ENGLISH` (BOE, Spanish) | 25 | 25 | 0 |
| `HTML_ENGLISH` (GOV.UK) | 25 | **0** | **25** |
| `HTML_NON_ENGLISH` (BOE, Spanish) | 25 | 25 | 0 |

All 25 mismatches occurred in a single stratum and a single publisher
(GOV.UK), all returned HTTP 200, and in a manually spot-checked case the live
byte length matched the Phase-1-locked byte length exactly while the SHA-256
still differed — indicating the page content has drifted since lock (most
likely a fixed-length, dynamically-generated token embedded in the page)
rather than a structural change or a fetch-tooling artefact. The precise
mechanism was **not** investigated further, since root-cause engineering
during blind execution is explicitly out of scope for Phase 2.

**Disclosed interpretive judgement:** the frozen 10-category failure taxonomy
(`FAILURE_TAXONOMY`) does not contain a category for "source is reachable but
cannot be reproduced byte-identical to its lock." These 25 units were mapped
to **`EXTERNAL_ACQUISITION_FAILURE`** ("official source cannot be obtained
... with no DRA-caused defect involved"), reading "obtained" as "obtained in
the exact, previously-locked form the protocol requires for blind
evaluation." This is a judgement call, not a literal fit, and is flagged here
for transparency rather than applied silently. No alternative taxonomy
category fit better: the drift is external and pre-evaluation, so it is not
`REPRESENTATION_FAILURE`, `PIPELINE_FAILURE`, `DETERMINISM_FAILURE`,
`PROOF_INTEGRITY_FAILURE`, or `SEMANTIC_EVALUATOR_FAILURE`.

Per the protocol's replacement rules (`REPLACEMENT_POLICY`), replacement
sampling applies only during Phase 1 sample construction, not during a Phase
2 execution run against an already-locked sample — so these 25 units were
**not** replaced. They remain in the denominator for `ACQUISITION_SUCCESS_RATE`
and are carried through the full accounting below as
`EXTERNAL_ACQUISITION_FAILURE`, with no evaluation attempted.

## 4. Run A / Run B execution and determinism

For each of the 75 verified units, the identical cached raw bytes were
normalised once and evaluated **twice** — Run A (`fixedTimestamp =
2026-08-12T12:00:00.000Z`) and Run B (`fixedTimestamp =
2026-08-12T18:00:00.000Z`) — against the same `EvaluationRequest`, isolating
pipeline determinism from any source-acquisition variability (the raw bytes
are fetched and verified only once, then reused for both runs).

- **0 pipeline exceptions.** `BenchmarkRunner.execute()` has no `try/catch`
  around `evaluateDocument()` in the existing codebase despite its module
  comment claiming "never throws"; Phase 2 added a `safeEvaluateDocument`
  wrapper so a single runner exception could not abort the batch. It was
  never triggered — no exception occurred across 150 evaluation calls (75
  units × 2 runs).
- **0 `{ok:false}` pipeline failures** at any of the 8 evaluator runtime
  stages.
- **75/75 proof receipts independently re-verified** via
  `verifyReceiptIntegrity()` (Run A basis).
- **75/75 units SUBSTANTIVELY_IDENTICAL between Run A and Run B** — same
  `decision`, same set of `issueClass`es, and identical
  `proofReceipt.substantiveDigest` (which itself excludes only timestamp
  fields, per the receipt's own canonical-digest design). **0 determinism
  failures.**

## 5. Endpoint results

### Primary endpoints

| Endpoint | Numerator/Denominator | Point estimate | 95% Wilson CI |
|---|---|---|---|
| `ACQUISITION_SUCCESS_RATE` | 75/100 | 0.750 | [0.657, 0.825] |
| `PIPELINE_COMPLETION_RATE` | 75/75 | 1.000 | [0.951, 1.000] (rule-of-three upper bound on the complementary failure rate: ≤0.030 at n=75) |
| `PROOF_INTEGRITY_RATE` | 75/75 | 1.000 | [0.951, 1.000] (rule-of-three: ≤0.030 at n=75) |
| `MATERIAL_FAILURE_RATE` | 0/100 | 0.000 | [0.000, 0.037] (rule-of-three: ≤0.030 at n=100) |

`MATERIAL_FAILURE_RATE`'s denominator is the full locked sample of 100 (per
its protocol definition), not just the 75 evaluated units — the 25
`EXTERNAL_ACQUISITION_FAILURE` units do **not** count toward it, by the
taxonomy's own design (`countsTowardMaterialFailureRate: false` for that
category), so the material-failure numerator is 0 regardless of denominator
choice.

No confidence interval here was reported without at least one of the two
underlying methods (Wilson score for non-zero/non-full counts, rule-of-three
for the zero-count edge case) since no such utility previously existed in
this codebase — both were implemented from the textbook formulas for Phase 2
(`statistics.ts`) and unit-tested against hand-derived reference values.

### Secondary endpoints

| Endpoint | Result |
|---|---|
| `REPRESENTATION_SUCCESS_RATE` | 0 demonstrated `REPRESENTATION_FAILURE` observed among the 75 evaluated units. **Not a confirmed rate** — the protocol's own oracle strategy requires spot-checking against publisher-provided structured content for this endpoint, which was not performed within Phase 2 (a measurement pass, not an investigation); reported here as a limitation of this report, not as "0% representation failure." |
| `DECISION_DISTRIBUTION` (of 75 evaluated) | SUPPORTED: 64, HOLD: 10, REVIEW: 1 |
| `ISSUE_CLASS_DISTRIBUTION` (of 75 evaluated) | `EVIDENCE_ABSENT`: 22, `EVIDENCE_INADEQUATE`: 16, `CLAIM_INCONSISTENCY`: 1. Consistent with the previously-documented GC-1 limitation that only 3 of 9 defined issue classes are triggerable under the frozen V1 evaluator. |
| `DETERMINISM_REPEATABILITY_RATE` | 75/75 = 1.000, [0.951, 1.000] (rule-of-three: ≤0.030 at n=75) |
| `KNOWN_LIMITATION_ENCOUNTER_RATE` | **0/100.** No individual unit's outcome was traced, with affirmative evidence, to a specific `CARRIED_FORWARD_LIMITATIONS` entry (D1–D6) during this blind pass. Per the task's explicit instruction, non-English-language status alone was **not** treated as evidence that limitation D3 (non-English materiality) manifested on any specific unit — see the stratum-level finding below, which is population-level and exploratory only. |

### Exploratory endpoints

**Stratum-level breakdown** (of the 75 evaluated units):

| Stratum | Evaluated | SUPPORTED | HOLD | REVIEW | Total issues | Zero-issue docs |
|---|---|---|---|---|---|---|
| `PDF_ENGLISH` | 25/25 | 14 | 10 | 1 | 39 | 14 |
| `PDF_NON_ENGLISH` (Spanish) | 25/25 | 25 | 0 | 0 | 0 | 25 |
| `HTML_ENGLISH` (GOV.UK) | 0/25 | — | — | — | — | — (all `EXTERNAL_ACQUISITION_FAILURE`) |
| `HTML_NON_ENGLISH` (Spanish) | 25/25 | 25 | 0 | 0 | 0 | 25 |

**Notable pattern (hypothesis-generating only, per the protocol's own
`EXPLORATORY` tier — not confirmatory):** all 50 evaluated non-English-stratum
units received `SUPPORTED` with **zero** issues each, while the evaluated
English stratum (`PDF_ENGLISH`, the only evaluated English stratum, since
`HTML_ENGLISH` produced no evaluable units) shows 11/25 non-`SUPPORTED`
outcomes and 39 total issues. This is directionally consistent with the
previously-documented limitation `NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE`
(D3), but Phase 2 explicitly defers root-cause investigation, and these are
different underlying documents (not parallel translations of the same
content), so stratum composition alone does not constitute per-unit evidence
of that limitation manifesting. This is flagged as a candidate for a future
targeted investigation, not acted on here.

**Publisher/format correlate of the sole observed systemic failure:** the
only failure category observed at all (`EXTERNAL_ACQUISITION_FAILURE`, 25
units) correlates perfectly with a single publisher (GOV.UK) and format
(`HTML_ENGLISH`). No PDF and no BOE.es (Spanish) HTML source exhibited it,
suggesting the drift is specific to how gov.uk serves this content rather
than a general HTML-normalisation or non-English-handling issue.

## 6. Failure classification (all 100 units, frozen 10-category taxonomy)

| Taxonomy category | Count |
|---|---|
| `SUCCESSFUL_EVALUATION` | 75 |
| `EXTERNAL_ACQUISITION_FAILURE` | 25 |
| `GOVERNANCE_INELIGIBLE` | 0 |
| `REPRESENTATION_FAILURE` | 0 |
| `PIPELINE_FAILURE` | 0 |
| `DETERMINISM_FAILURE` | 0 |
| `PROOF_INTEGRITY_FAILURE` | 0 |
| `SEMANTIC_EVALUATOR_FAILURE` | 0 |
| `KNOWN_LIMITATION_ENCOUNTERED` | 0 |
| `UNCLASSIFIED` | 0 |

Full per-unit classification with rationale for every one of the 100 units
is in `lib/dra-reference/src/benchmark/analysis/gen-001-phase2/data/failure-classification.json`.

## 7. Failure review

Only one class of failure occurred (`EXTERNAL_ACQUISITION_FAILURE`, 25
units), fully described in Section 3. No `PIPELINE_FAILURE`,
`DETERMINISM_FAILURE`, `PROOF_INTEGRITY_FAILURE`, or
`SEMANTIC_EVALUATOR_FAILURE` occurred, so no other failure review is
required. No new generic defect was discovered or investigated during
execution; the GOV.UK byte-drift phenomenon is logged as a candidate for a
future acquisition-tooling investigation (e.g. content-hash-stable extraction
of the meaningful text vs. an embedded volatile token), not pursued further
here.

## 8. Benchmark integrity review

| Check | Result |
|---|---|
| GC-1 identity unchanged throughout execution | **Confirmed** — same digest reverified before and after the run |
| Protocol identity unchanged throughout execution | **Confirmed** |
| Sample identity/lock unchanged throughout execution | **Confirmed** — same 100 `FROZEN_UNITS`, same digest |
| Any performance-based exclusion or replacement | **None.** The 25 `EXTERNAL_ACQUISITION_FAILURE` exclusions were availability-based (byte-verification failures against the lock), decided **before** any evaluation was attempted on those units — DRA's evaluation behaviour on those documents is entirely unknown and was never a factor in the exclusion decision. |
| All 100 locked units represented in the final accounting | **Confirmed** — 75 evaluated + 25 acquisition-failed = 100; no unit was silently dropped |
| Run A and Run B used identical inputs | **Confirmed** — same cached raw bytes, same normalisation, differing only in `fixedTimestamp` |
| All result artefacts digest-bound | **Confirmed** — `dra-gen-001-phase2-manifest.ts` binds the full result bundle to the three canonical identity digests; `verifyPhase2ArtefactBinding()` passes all 9 checks |

## 9. Publication-safe result statement

> Under the frozen DRA-GC-1 evaluator (evaluator v0.1.2 / pipeline v1.0 /
> model v0.1.0), executed blind against the DRA-GEN-001 locked 100-document
> sample: 75 of 100 locked sources could be reacquired byte-identical to
> their Phase 1 lock (25 GOV.UK sources had drifted since lock and were
> excluded from evaluation, unrelated to DRA's own behaviour). Of the 75
> evaluated documents, 100% (75/75) completed the full evaluation pipeline
> without failure, 100% (75/75) produced independently-verifiable proof
> receipts, and 100% (75/75) produced substantively identical results across
> two independent repeated runs. No pipeline failure, determinism failure,
> proof-integrity failure, or evaluator-specification failure was observed.
> Decisions on the 75 evaluated documents were SUPPORTED (64), HOLD (10), and
> REVIEW (1); only 3 of the 9 defined issue classes were triggered, consistent
> with a previously-documented limitation of the frozen V1 evaluator. All 50
> evaluated non-English (Spanish) documents received SUPPORTED with zero
> issues, versus 11 of 25 evaluated English documents receiving a non-SUPPORTED
> decision — a population-level pattern reported as exploratory and
> hypothesis-generating, not as a confirmed defect.

## 10. Final verdict

**`DRA_GEN_001_BLIND_EXECUTION_COMPLETE`**

Justification against `STOPPING_RULES.severeStopConditions`: no candidate/
protocol/sample identity mismatch occurred; no contamination or blindness
breach was discovered; no `SEMANTIC_EVALUATOR_FAILURE` (severe or otherwise)
occurred. The GOV.UK source-drift finding is an `EXTERNAL_ACQUISITION_FAILURE`
result to be reported, not a stopping condition — the protocol anticipates
and explicitly categorises exactly this kind of external non-reproducibility.
Execution therefore ran to completion on the full 100-unit locked sample and
this report constitutes the complete, final Phase 2 deliverable.

## 11. Programme boundary

Per Phase 2's scope (measurement, not improvement), this report identifies
no engineering work, proposes no fixes, and does not open a "Post-Blind
Evidence Review" or GC-2 programme. Two items are noted only as **candidates
for future, separately-scoped investigation** (not undertaken here):

1. The GOV.UK byte-drift mechanism (Section 3, Section 7).
2. The non-English zero-issue / English 11-of-25-non-SUPPORTED stratum
   pattern (Section 5), as a possible (not confirmed) manifestation of the
   previously-documented `NON_ENGLISH_MATERIALITY_OUT_OF_DECISION_SCOPE`
   limitation.

---

### Reproducibility

All raw and derived result artefacts are committed under
`lib/dra-reference/src/benchmark/analysis/gen-001-phase2/data/` and bound
together by `dra-gen-001-phase2-manifest.ts`. Re-running
`verifyPhase2ArtefactBinding()` reproduces the `DRA_GEN_001_PHASE2_ARTEFACTS_BOUND`
verdict; re-running `computePhase2ResultDigest()` against the same files
reproduces the identical aggregate digest. Automated tests covering
precondition verification, artefact binding, proof integrity, taxonomy
application, and the statistics module are in
`lib/dra-reference/src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-phase2-integrity.test.ts`
(15/15 passing).
