# DRA-VAL-002 — Targeted English-HTML Blind Follow-Up: Validation Protocol

**Status: FROZEN**
**Protocol identity module:** `lib/dra-reference/src/benchmark/analysis/dra-val-002-protocol.ts`
**Freeze manifest:** `lib/dra-reference/src/benchmark/analysis/dra-val-002-freeze-manifest.ts`

## 0. Administrative renumbering notice

This programme was specified under the working name **"DRA-VAL-001 — Targeted English-HTML
Blind Follow-Up"**. That identifier collides with the already-entrenched, unrelated
**DRA-VAL-001A..F "Scientific Validation Charter"** programme (external human-reviewer corpus
validation; see `docs/dra/validation/`). The user explicitly approved renumbering this programme
to **DRA-VAL-002** to resolve the collision.

**This renumbering is purely administrative.** Every methodological requirement, boundary,
endpoint, freeze rule, and intended verdict from the original specification is preserved
unchanged below. Nothing in this document, or in any file it describes, has any relationship to
the DRA-VAL-001A..F Scientific Validation Charter programme.

## 1. Purpose and the frozen validation question

DRA-GEN-001's blind generalisation study lost its entire `HTML_ENGLISH` stratum: all 25 sampled
GOV.UK/HTML-English units drifted post-lock against GEN-001's live-refetch verification rule and
were excluded from Phase 2 execution, leaving that population question formally
`NOT_TESTED_DUE_TO_STRATUM_LOSS`.

DRA-VAL-002 exists to answer, narrowly:

> **How reliably does frozen DRA-GC-1 execute on previously unseen, eligible English-language
> HTML documents under a prospectively defined source-freezing procedure?**

This is a targeted, single-stratum repair study — not a new benchmark, not an issue-class
expansion, not a multilingual or PDF study, and not a GC-2 admission test.

## 2. What this programme does NOT do (hard boundary)

- Does not modify DRA-GC-1, DRA-GEN-001 (protocol, sample, or historical classification), ENG-026,
  or GC2-REV-001.
- Does not reopen or repair the rejected ENG-026 Spanish Stage-5 correction.
- Does not create or admit DRA-GC-2.
- Does not run a new 100-document benchmark.
- Does not pool its statistics with DRA-GEN-001's.

## 3. Target population

Authoritative, substantive, previously-unseen English-language HTML published by a government
body, statutory regulator, or national statistics office, under an open licence or lawful
public-domain basis, excluding all documents already touched by GC-1, GEN-001, or any prior DRA
programme (see `dra-val-002-considered-registry.ts`).

## 4. Source-family diversity

Three distinct, non-dominating publisher families (see `SOURCE_FAMILIES` in the protocol module):

| Family | Description | Licence basis | Target allocation |
|---|---|---|---|
| `GOV_UK` | UK GOV.UK, multiple departments | OGL v3.0 | 34% |
| `ONS_GOV_UK` | UK Office for National Statistics (distinct domain) | OGL v3.0 | 32% |
| `US_FEDERAL` | EPA, FTC, US Census Bureau | US federal public domain (17 U.S.C. §105) | 34% |

No family may exceed 40% of the locked sample. GOV.UK is included but capped exactly like every
other family — this directly corrects the single-family (GOV.UK-only) concentration that made
GEN-001's HTML_ENGLISH stratum vulnerable to one kind of drift event.

## 5. Source identity model

Three distinct concepts, per Section 4 of the protocol module:
1. **Selection-time identity** — canonical URL/publisher/title at draw time.
2. **Evaluation-input identity** — the exact frozen bytes SHA-256-digested at lock time; GC-1
   evaluates this, and only this, representation.
3. **Live source drift** — a later observed difference between live and locked bytes. This is
   recorded as a descriptive provenance observation and is **never** grounds to discard,
   re-fetch, or substitute a locked unit. This is the precise mechanism correction versus
   GEN-001, whose live-refetch verification rule is what destroyed its HTML_ENGLISH stratum.

## 6. HTML-freezing integrity fields

Recorded for every unit prior to selection lock: canonical URL, publisher, title, publication/
version date, acquisition timestamp, HTTP status, redirect chain, media type, raw HTML digest,
normalised representation digest, byte size, language, and governance eligibility evidence. Only
the primary document response body is frozen; externally linked resources are out of scope.

## 7. Eligibility criteria (V1–V11)

See `ELIGIBILITY_CRITERIA` in the protocol module: official source, licence/lawful-use basis,
HTML-only, English-only, accessible without gating, ≥500-word floor, non-trivial content,
document identity present, not contaminated, no in-frame duplicate, no prior human performance
inspection.

## 8. Sample size

| n | 90%-CI width (approx) | Rule-of-three upper bound (0 failures) | Recommendation |
|---|---|---|---|
| 20 | 24.6pp | 15% | Minimum viable |
| **25** | **22.4pp** | **12%** | **Recommended primary** |
| 30 | 20.7pp | 10% | Rejected — unjustified cost |
| 40 | 17.9pp | 7.5% | Rejected — unjustified cost |

**n=25 selected.** It is the smallest size giving a credible zero-failure bound (12%) that is
also acquirable across 3 non-dominating families without violating the no-duplicate-family rule.
Its numeric match to GEN-001's original stratum allocation is a coincidence of the Wilson-interval
mathematics at this precision target, not a decision to reuse "25" uncritically — see
`SAMPLE_SIZE_OPTIONS`/`SAMPLE_SIZE_JUSTIFICATION` in the protocol module for the full comparison.

## 9. Endpoints

**Primary:** evaluation completion rate, determinism rate (Run A vs Run B), proof-integrity rate,
representation-materiality-failure rate.
**Secondary/descriptive:** decision distribution, issue-class distribution, document length/
complexity, publisher-family distribution, observed post-lock source drift.

Decision distribution (SUPPORTED/REVIEW/HOLD) is deliberately secondary: a correct REVIEW/HOLD on
a genuinely ambiguous document is not a system failure.

## 10. Failure taxonomy

`ELIGIBILITY_FAILURE`, `SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK` (pre-lock only, replacement-
eligible), `REPRESENTATION_FAILURE`, `PIPELINE_FAILURE`, `DETERMINISM_FAILURE`,
`PROOF_INTEGRITY_FAILURE`, `KNOWN_LIMITATION_ENCOUNTERED`, `SUCCESSFUL_EVALUATION`,
`UNCLASSIFIED` (mandatory disclosure). Live source drift after lock never causes reclassification
into any of these.

## 11. Replacement policy

Allowed **only before lock**: eligibility failure, pre-lock acquisition failure, contamination
discovered late, ungovernable licence basis. **Forbidden after lock, for any reason**, including
crashes, poor representation, REVIEW/HOLD outcomes, known limitations, or new issue classes —
these are DRA-performance results, not sampling defects. Replacements are drawn from the same
family's predetermined seeded reserve order, never a fresh manual pick.

## 12. Blindness / contamination

Programmatic exclusion (not hand-curated) against: all 33 GC-1 development-corpus IDs +
DRA-DOC-0033; the full GEN-001 considered-candidate registry; all 100 GEN-001 Phase-1 sample
source URLs (including the lost HTML_ENGLISH stratum itself); every URL manually screened during
VAL-002's own discovery for reachability/licence/word-count (recorded in
`dra-val-002-considered-registry.ts`). See `dra-val-002-considered-registry.ts`.

## 13. Sampling procedure (fixed order)

1. Construct eligible frame from each family's public search/content interface.
2. Apply contamination exclusion (programmatic).
3. Apply metadata-level eligibility.
4. Assign stable frame IDs.
5. Stratify by source family.
6. Seeded deterministic selection within each family (mulberry32, GEN-001's algorithm, fixed
   literal seed string recorded before frame contents are known).
7. Freeze all selected inputs (live fetch, SHA-256, word-count check).
8. Lock the final sample manifest and compute its canonical digest.

GC-1 is never invoked during frame construction; the only inspections performed are HTTP
reachability, word count, and licence verification.

## 14. Freeze / lock identifiers

- Protocol freeze verdict: `DRA_VAL_002_PROTOCOL_FROZEN`
- Sample lock verdict: `DRA_VAL_002_SAMPLE_LOCKED`

## 15. Statistical analysis plan

Per primary endpoint: numerator/denominator, point estimate, 95% Wilson score interval (reusing
`gen-001-phase2/statistics.ts` unchanged), and — when the numerator is 0 — the rule-of-three 95%
upper bound. Every endpoint is broken out by source family. VAL-002 denominators are never pooled
with GEN-001's.

## 16. Live-drift observation (optional, post-hoc)

After Run A/B results are safely persisted, locked units' live URLs may optionally be re-fetched
and compared to the locked SHA-256, purely to report drift counts. Never used to substitute bytes
into an already-produced result.

## 17. Minimum integrity tests

`GC1_DIGEST_UNCHANGED`, `PROTOCOL_FROZEN_BEFORE_SAMPLE_SELECTION`,
`SAMPLE_LOCKED_BEFORE_EVALUATION`, `CONTAMINATION_OVERLAP_IS_ZERO`,
`FINAL_SAMPLE_SIZE_MATCHES_PROTOCOL`, `SOURCE_FAMILY_ALLOCATION_MATCHES_PROTOCOL`,
`EVERY_UNIT_HAS_VALID_FROZEN_SOURCE_DIGEST`, `EVALUATOR_CONSUMES_FROZEN_INPUT_NOT_LIVE_BYTES`,
`NO_POST_LOCK_REPLACEMENT_FOR_DRA_PERFORMANCE`, `RUN_A_RUN_B_COMPARISON_COMPLETE`,
`PROOF_RECEIPTS_VERIFIED_AS_REQUIRED`, `AGGREGATE_STATISTICS_MATCH_CANONICAL_RESULT_DATA`.

## 18. Verdict vocabularies

- Coverage: `ENGLISH_HTML_GAP_CLOSED` / `ENGLISH_HTML_GAP_PARTIALLY_CLOSED` /
  `ENGLISH_HTML_GAP_NOT_CLOSED`
- Execution: `DRA_VAL_002_COMPLETE` / `DRA_VAL_002_STOPPED`
- Publication readiness: `READY_FOR_FINAL_EVIDENCE_SYNTHESIS` /
  `ADDITIONAL_TARGETED_EVIDENCE_REQUIRED`

## 19. Relationship to other frozen work

This programme supplies new, separate, prospective evidence addressing the same population
question GEN-001's HTML_ENGLISH stratum was designed to answer; it does not alter GEN-001's frozen
protocol, sample, or historical classification. It has no bearing on ENG-026 or GC2-REV-001 — the
accepted Spanish Stage-5 limitation and GC2-REV-001's `DRA_GC_2_ADMISSION_REJECTED` verdict remain
unchanged.
