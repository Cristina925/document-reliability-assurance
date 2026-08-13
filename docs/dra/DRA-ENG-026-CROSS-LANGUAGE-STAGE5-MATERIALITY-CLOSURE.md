# DRA-ENG-026 — Cross-Language Stage 5 Materiality Closure

This is an **engineering/investigation programme**, launched as the
top-priority follow-up recommended by
`docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md`. It determines, under
controlled (confound-free) conditions, whether Stage 5 (Materiality
Assessment) has a genuine language-dependent obligation-detection defect,
isolates its generic mechanism, and evaluates a minimal candidate
correction. It does **not** modify DRA-GC-1, does not reinterpret or alter
GEN-001, does not create or freeze a GC-2, and does not select a new blind
sample.

---

## Executive conclusion

Stage 5 (`classifyMateriality`) has a **real, precisely-bounded**
language-dependent defect, now demonstrated under controlled conditions
rather than inferred from a single real-document pair. Of 25 valid
semantically-matched EN/ES sentence pairs spanning all 13 required semantic
classes, **14 pairs (56%) diverge**; in every one of the 14, English reaches
its pre-registered oracle classification and Spanish falls to
`MA-UNDETERMINED-DEFAULT` — never the reverse, and never a false positive.
The other 11 pairs (44%), spanning 5 semantic classes, show **zero**
divergence, because neither language's Stage 5 has any rule for that
construction at all — a structural coverage gap, not a language asymmetry.

The root cause is a single, well-isolated mechanism: **exactly 5 of Stage
5's ~24 classification rules** (`MA-HIGH-OBLIGATION`,
`MA-HIGH-RECOMMENDATION`, `MA-MODERATE-GUIDANCE`, `MA-LOW-BACKGROUND`,
`MA-LOW-DESCRIPTIVE`) use regexes whose only lexical triggers are English
tokens (`must`/`shall`, `should`, `recommend`/`recommended`,
`historically`/`in general`, `the system provides`-style noun-verb phrases).
Ablation experiments confirm the mechanism is exactly this — and only
this — lexical-coverage gap: morphology, word order, negation, and
punctuation are all shown *not* to be causal; substituting only the modal
or marker token from Spanish to English (holding everything else fixed)
deterministically flips the classification to match English.

**Defect status: `CONFIRMED_BOUNDED_DEFECT`.**

A minimal, purely additive, language-general lexicon extension to those
same 5 regexes (implemented in a separate, non-frozen experimental module)
resolves all 14 confirmed divergences (Spanish accuracy 11/25 → 25/25) with
zero change to English-side output, and independently reproduces the
DRA-CHK-005 correction (development/post-hoc check only, not validation).

**Closure verdict: `DRA_ENG_026_CLOSED`.**
**Candidate verdict: `GC_2_NOT_JUSTIFIED`** (see Section 15) — this
programme confirms and closes a targeted defect; it does not itself
constitute the broader generalisation evidence a new frozen candidate would
require.

---

## 1. DRA-GC-1 identity (preserved, unmodified)

| Field | Value |
|---|---|
| Candidate ID | `DRA-GC-1` |
| Aggregate digest (`GC1_AGGREGATE_DIGEST`) | `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` |
| Live re-hash at programme start (`computeAggregateDigest()`) | Matches `GC1_AGGREGATE_DIGEST` (verified — see Section 14, `dra-gc-1-freeze-integrity.test.ts`, 26/26 passing) |
| Evaluator version | `0.1.2` (`DRA_EVALUATOR_VERSION`) |
| Pipeline version | `1.0` |
| Stage 5 implementation file (frozen, part of `FROZEN_DECISION_AFFECTING_FILES`) | `materiality-assessment/materiality-rules.ts` |
| Prior limitation reference | DRA-CHK-005 finding D3 — `SYSTEMATIC_ENGLISH_LEXICAL_COVERAGE_PATTERN` / `DOCUMENTED_LANGUAGE_LIMITATION` / decision gate `STAGE5_ENGINEERING_INVESTIGATION` |

**No frozen file was modified by this programme.** `computeAggregateDigest()`
was re-verified equal to `GC1_AGGREGATE_DIGEST` both before and after the
full experimental evaluation (Sections 14/Part 1 and Part 7 of the new test
file).

---

## 2. CHK-005 baseline reproduction

Before any new experiment was built, the existing CHK-005 test suite
(`dra-chk-005-cross-language-materiality.test.ts`) was re-run unmodified
against the live repository:

```
Test Files  1 passed (1)
     Tests  13 passed (13)
```

This reproduces CHK-005's original result exactly: **12/12 confirmed
obligation-statement pairs diverge** (all EN `MA-HIGH-OBLIGATION` /
`MA-CRITICAL-*`, all ES `MA-UNDETERMINED-DEFAULT`), all 5 control pairs
show no divergence, and the counterfactual re-lexicalization check
(substituting only the Spanish deontic phrase for its English equivalent)
restores the expected classification. The baseline reproduces cleanly, so
the programme proceeded directly to the controlled-pair experiment rather
than an investigation of a non-reproducing baseline.

---

## 3. Controlled-pair methodology

**Design choice: direct pure-function invocation, not full-document
reconstruction.** CHK-005 already established that Stage 5's
`classifyMateriality(statementText)` is a pure function of statement text
alone — it takes no document, language, or structural-context argument.
Given that fact (independently verified by reading `materiality-rules.ts`
in full), the tightest confound-free experiment calls `classifyMateriality`
directly on synthetic, semantically-matched EN/ES sentence pairs, rather
than re-running full acquire→freeze→evaluate pipelines on real documents.
This eliminates translation-quality noise, document-structure noise, and
Stage 1–4 segmentation variance as possible confounds — leaving language
itself, and only language, as the varying factor per pair.

**Held constant per pair:** proposition, authority, obligation strength,
evidence, modality, negation, scope, materiality, and grammatical structure
(declarative/conditional/exception-clause form is mirrored on both sides of
each pair). **Deviations from literal word-for-word translation** are
documented per pair in the `translationNote` field of
`dra-eng-026-controlled-matrix.ts` — all deviations are idiomatic-register
choices (e.g. "shall" → future-tense "deberán" rather than a stilted
literal calque), never semantic changes.

**Independent oracle (pre-registered, not derived from running the
matrix):** for each pair, `expectedClassification`/`expectedRuleId` were
set from Stage 5's own already-frozen, English-regression-tested rule
catalogue (`materiality-rules.ts`, `materiality-rules.test.ts`) — i.e.
"what a semantically-equivalent, idiomatic English construction of this
type already receives, per Stage 5's documented and tested behaviour" — not
a new normative theory of obligation. This is the same evidentiary stance
CHK-005 took. One pair (`FACTUAL_2`) was excluded rather than forced when
its English side did not trigger the intended rule on construction (a
pre-existing English-side rule-coverage gap, unrelated to language,
documented in Section 8).

---

## 4. Semantic test matrix

25 valid pairs (26 constructed, 1 excluded) across all 13 required semantic
classes, 2 independently-worded variants per class:

`MANDATORY_OBLIGATION`, `PROHIBITION`, `STRONG_RECOMMENDATION`,
`WEAK_RECOMMENDATION`, `PERMISSION`, `FACTUAL_STATEMENT`,
`DESCRIPTIVE_BACKGROUND`, `CONDITIONAL_OBLIGATION`, `EXCEPTION`,
`NEGATED_OBLIGATION`, `FUTURE_INTENDED_ACTION`, `AUTHORITY_STATEMENT`,
`SCOPE_LIMITATION`.

Full sentence pairs, oracle values, and translation notes:
`lib/dra-reference/src/benchmark/analysis/dra-eng-026-controlled-matrix.ts`.

---

## 5. Frozen GC-1 Stage 5 results on the controlled matrix

Frozen, unmodified `classifyMateriality` was run against all 25 valid pairs
(both EN and ES sides):

| Metric | Value |
|---|---|
| EN accuracy vs. oracle | **25/25 (100%)** |
| ES accuracy vs. oracle | **11/25 (44%)** |
| Cross-language equivalence rate | **11/25 (44%)** |
| Divergent pairs | **14/25 (56%)** |
| Direction of every divergence | EN matches oracle, ES falls to `MA-UNDETERMINED-DEFAULT` (100% false-negative, 0% false-positive) |

---

## 6. EN vs ES quantitative comparison, per semantic class

| Semantic class | Divergent? | Mechanism |
|---|---|---|
| MANDATORY_OBLIGATION (2/2) | Yes | `MA-HIGH-OBLIGATION` English-only lexicon |
| PROHIBITION (2/2) | Yes | `MA-HIGH-OBLIGATION` English-only lexicon (negated obligation still routes through the same rule) |
| STRONG_RECOMMENDATION (2/2) | Yes | `MA-HIGH-RECOMMENDATION` English-only lexicon |
| WEAK_RECOMMENDATION (2/2) | Yes | `MA-MODERATE-GUIDANCE` English-only lexicon |
| PERMISSION (2/2) | No | Neither language has a rule for bare permission (structural, symmetric) |
| FACTUAL_STATEMENT (1/1 valid) | Yes | `MA-LOW-DESCRIPTIVE` English-only noun-phrase lexicon |
| DESCRIPTIVE_BACKGROUND (2/2) | Yes | `MA-LOW-BACKGROUND` English-only marker lexicon |
| CONDITIONAL_OBLIGATION (2/2) | Yes | `MA-HIGH-OBLIGATION`, inherited unchanged when wrapped in a conditional clause |
| EXCEPTION (1/2) | Mixed | Bare exception clause (no embedded obligation): symmetric non-coverage. Exception wrapping an embedded "must"/"debe" obligation: diverges via `MA-HIGH-OBLIGATION`, unchanged by the exception framing |
| NEGATED_OBLIGATION (2/2) | No | Neither language has a rule for "not required to"/"need not" absence-of-duty phrasing (structural, symmetric) |
| FUTURE_INTENDED_ACTION (2/2) | No | Neither language's plain future-tense-intent phrasing triggers any rule (structural, symmetric) |
| AUTHORITY_STATEMENT (2/2) | No | "is authorised to"/"may authorise" phrasing is a distinct grammatical form from `MA-HIGH-APPROVAL`'s required passive "is approved" — uncovered on both sides |
| SCOPE_LIMITATION (2/2) | No | "this policy"/"these requirements" is outside `MA-LOW-DESCRIPTIVE`'s closed noun-phrase list on both sides |

**7 of 13 semantic classes show real EN/ES divergence; 5 of 13 show zero
divergence because of a structural (language-neutral) coverage gap; 1 class
(EXCEPTION) is mixed, and its divergent case is fully explained by the same
`MA-HIGH-OBLIGATION` mechanism as the other obligation classes.**

---

## 7. Failure taxonomy

All 14 divergences fall into exactly one failure class:

**`ENGLISH_ONLY_LEXICAL_COVERAGE`** — the rule that correctly classifies
the English construction has no Spanish-token alternative in its
regex, and no upstream normalisation (stemming, lemmatization, or
cross-lingual mapping) exists anywhere in the pipeline to compensate.
There is no second failure class: no divergence was traced to
tokenization, segmentation, negation handling, word order, punctuation,
or a Spanish-specific morphological form that an equivalent English
form does not also exhibit.

---

## 8. Causal / root-cause evidence

Read in full: `materiality-assessment/materiality-rules.ts`. The file's own
header already names "Non-English obligation markers are not detected" as a
documented Version 1 limitation; this programme establishes precisely
*which* rules are affected, that the effect is symmetric-absent (not merely
weaker) for un-triggered classes, and that no other candidate mechanism
contributes.

Investigated and ruled out as independent contributing causes:

| Candidate cause | Finding |
|---|---|
| Spanish morphology / conjugation | Ruled out as an independent cause: `debe`, `deben`, `deberá`, `deberán` — four distinct conjugations — all fail identically; the gap is the entire deber-family lexicon, not one missing conjugation |
| Tokenization / lemmatization absence | Not implicated: Stage 5 operates on raw statement text via regex, with no tokenizer/lemmatizer stage to fail; the absence of lemmatization is a design property, not a bug introduced elsewhere |
| Negation handling | Ruled out: `"El equipo debe completar..."` and `"El equipo no debe completar..."` both fail identically — negation does not change the outcome in either direction |
| Word order | Ruled out: reordering the Spanish clause around the deontic verb (fronting the verb, or moving the deadline clause) does not change the outcome |
| Punctuation / capitalisation | Ruled out: terminal punctuation, absence of punctuation, and full-caps casing do not change either language's outcome |
| Stop-words / phrase-length thresholds | Not implicated: no length- or stop-word-based gate exists in the rule engine; classification is decided purely by whether any rule's fixed alternation matches |
| Upstream segmentation (Stage 2) | Not implicated: CHK-005 already confirmed Spanish statements segment and resolve correctly through Stages 2–4; Stage 5 receives complete, correctly-bounded statement text in both languages |
| Materiality-heuristic interaction / rule-precedence ordering | Not implicated: no CRITICAL-tier rule shadows or intercepts the affected MODERATE/LOW/HIGH rules for these pairs; each divergent pair's English side matches exactly the rule the oracle predicted, at the expected tier |

**Root cause: a single, isolated property of exactly 5 named regexes in
`materiality-rules.ts` — their lexical alternation contains only English
tokens.** This is a data/lexicon-coverage property of those 5 rules, not an
architectural, tokenization, or upstream-pipeline defect.

---

## 9. Ablation experiments (see Part 4 of the new test file)

1. **Morphology ablation** — `debe`/`deben`/`deberá`/`deberán` on an
   otherwise-identical carrier sentence all fail identically. Rules out
   "one missing conjugation" as the explanation.
2. **Punctuation ablation** — terminal period/none/exclamation, and
   full-caps casing, leave both languages' outcomes unchanged.
3. **Word-order ablation** — fronting the Spanish deontic verb, or moving
   the deadline clause to the front, leaves the outcome unchanged.
4. **Negation ablation** — `"debe"` vs. `"no debe"` fail identically;
   negation is not the differentiator.
5. **Modal-phrase-only substitution** — replacing *only* the Spanish
   deontic/marker phrase with its literal English equivalent (rest of the
   sentence, including all other Spanish words, left untouched) flips the
   classification to the oracle-matching value in all 4 tested rule
   families (`MA-HIGH-OBLIGATION`, `MA-HIGH-RECOMMENDATION`,
   `MA-MODERATE-GUIDANCE`, `MA-LOW-BACKGROUND`). This isolates the specific
   lexical token, and nothing else in the sentence, as the sole causal
   factor.
6. **Literal-vs-idiomatic translation** — the matrix already uses natural,
   idiomatic Spanish throughout (documented per pair in `translationNote`),
   not stilted literal calques, so the finding is not an artefact of
   unnatural translation.

---

## 10. Defect status classification

**`CONFIRMED_BOUNDED_DEFECT`.**

Not `CONFIRMED_GENERIC_DEFECT`: 11/25 (44%) of constructed pairs, spanning 5
of 13 semantic classes, show *zero* language-dependent divergence, because
Stage 5 has no rule for that construction in *either* language — this is a
structural, language-neutral coverage boundary, not part of the defect.

Not `NO_CONTROLLED_DEFECT_DEMONSTRATED` or `INCONCLUSIVE`: the defect is
real, reproduced across 14 independently-constructed pairs spanning 7
semantic classes and 5 distinct rule families, with a single, fully-isolated
causal mechanism confirmed by 5 independent ablations.

The defect is precisely bounded to: **any Stage 5 rule whose sole
lexical trigger is an English-language token**, currently
`MA-HIGH-OBLIGATION`, `MA-HIGH-RECOMMENDATION`, `MA-MODERATE-GUIDANCE`,
`MA-LOW-BACKGROUND`, and `MA-LOW-DESCRIPTIVE`.

---

## 11. Engineering gate and correction properties

Because the defect is `CONFIRMED_BOUNDED_DEFECT` with a fully-isolated
mechanism, the engineering gate is satisfied. Correction properties
required before any implementation:

- **Language-general**: fixes the mechanism (missing token coverage), not
  a specific document or sentence.
- **Semantic, not publisher-specific**: extends the same 5 rules' own
  existing semantic categories; introduces no new category.
- **No vocabulary hardcoding to a specific test sentence**: the added
  Spanish tokens are the deber-family deontic forms already validated by
  CHK-005's own counterfactual mapping, plus natural dictionary equivalents
  for recommendation/guidance/background/descriptive markers — not tuned
  per-sentence.
- **No English regression**: purely additive alternation; no existing
  English branch removed or reordered.
- **No negation/scope weakening**: negation and scope handling are
  untouched; the fix only adds detection of the affirmative deontic/marker
  token, exactly mirroring the existing English rule's own negation
  behaviour (which also does not special-case negation — see Section 8).
- **No oracle-aware special-casing**: the fix is a generic lexicon
  extension of the rule's own regex, not a rule keyed to "if this exact
  matrix sentence, then...".
- **Compatible with the existing Stage 5 contract**: `classifyMateriality`'s
  signature, return type, and rule-ID space are unchanged; the same 20 other
  rules are byte-for-byte identical.

**Preferred approach — generic representation vs. per-language dictionary:**
a fully generic (language-agnostic) representation (e.g., a semantic-role
model of "deontic strength" independent of surface tokens) was considered
but rejected as disproportionate to the evidence: the confirmed defect is a
narrow, 5-rule lexicon gap, not a demonstrated deficiency in the underlying
regex-rule architecture itself (11/25 structural non-coverage pairs are
symmetric and not language-dependent, so a general semantic-role rewrite
would not measurably improve on the targeted fix for the evidence
collected). A minimum, targeted per-rule lexicon extension is the
correction actually supported by the ablation evidence.

---

## 12. Candidate correction implemented (experimental, not GC-1)

**File (new, not part of GC-1):**
`lib/dra-reference/src/materiality-assessment/experimental/dra-eng-026-materiality-rules-v2-experimental.ts`

- Full clone of `materiality-rules.ts`'s rule engine; 19 of 24 rules are
  byte-for-byte identical to production.
- Exactly the 5 implicated rules (`MA-HIGH-OBLIGATION`,
  `MA-HIGH-RECOMMENDATION`, `MA-MODERATE-GUIDANCE`, `MA-LOW-BACKGROUND`,
  `MA-LOW-DESCRIPTIVE`) have their regex additively extended with
  documented Spanish token alternatives (see the module's inline
  documentation for the exact tokens and rationale per rule).
- Not exported from `materiality-assessment/index.ts`, not imported by
  `assess-materiality.ts`, `pipeline/`, or any production/decision code
  path. Not part of `FROZEN_DECISION_AFFECTING_FILES` — confirmed by
  re-running `computeAggregateDigest()` after the module was added (Section
  14, unchanged).
- One implementation pitfall encountered and fixed during development: the
  first version of the extended `MA-HIGH-OBLIGATION` regex used a shared
  trailing `\b` across all alternatives, which silently failed to match
  Spanish forms ending in an accented vowel (`deberá`) because JavaScript's
  `\b` treats accented characters as non-word characters — the same
  trailing-`\b`-after-accented-vowel pitfall already on record from
  DRA-CHK-005/DRA-ENG-012. Fixed by giving each alternative its own
  boundary construct instead of a single shared trailing `\b`.

---

## 13. Before/after evidence and regression checks

| Check | Before (production) | After (V2 experimental) |
|---|---|---|
| ES accuracy on the 25-pair controlled matrix | 11/25 (44%) | **25/25 (100%)** |
| Cross-language equivalence on the matrix | 11/25 (44%) | **25/25 (100%)** |
| English output on the matrix + a wider English regression probe set (7 additional canonical English statements spanning CRITICAL/HIGH/MODERATE/LOW/UNDETERMINED) | — | **Byte-identical to production on every probe** (classification and ruleId both match) |
| CHK-005's original real-document Spanish obligation fragments (4 fragments re-used directly, not re-run through full pipeline) | `MA-UNDETERMINED-DEFAULT` (reproduces the original defect) | `MA-HIGH-OBLIGATION` (resolves it) — labelled **DEVELOPMENT / POST-HOC ONLY — NOT VALIDATION** per programme boundary; this is a diagnostic re-check of already-observed text, not a blind or new-sample result, and is not cited as evidence of generalisation |
| GC-1 aggregate digest, before and after the full experimental evaluation | `77544648dcb37caf...` | **Unchanged** |

No regressions were observed on any check performed. GEN-001's 100 locked
documents were **not** re-run against V2 — per the programme's explicit
boundary, GEN-001 is diagnostic-only material once touched by any
experimental Stage 5 code and must never be used to validate a fix; this
programme did not touch GEN-001 documents at all, to avoid even the
appearance of doing so.

---

## 14. Verification ladder results

| Step | Result |
|---|---|
| Targeted ENG-026 tests (`dra-eng-026-cross-language-stage5-closure.test.ts`) | **23/23 passed** |
| Relevant Stage 5 / evaluator regression tests (`src/materiality-assessment/**`) | **214/214 passed** (5 files) |
| Original CHK-005 tests (re-run unmodified) | **13/13 passed** |
| Relevant DRA regression suite (`src/pipeline`, `src/model`) | **598/598 passed** (16 files) |
| GC-1 freeze-integrity verification (`dra-gc-1-freeze-integrity.test.ts`) | **26/26 passed**, both before and after the experimental evaluation |
| `tsc --noEmit` | **2 pre-existing errors**, both in files untouched by this programme (`dra-acq-026-long-range-structural-robustness.test.ts` and `dra-acq-025-non-redundant-graphics-discovery.ts`, unrelated `CitationIntegrityReport`/`CandidateRecord` type-shape drift); **zero new errors** introduced by any ENG-026 file |

All checks pre-date this programme's pre-existing-vs-new distinction
cleanly: nothing newly failed, and the two tsc errors were confirmed (by
`git status`) to be in files this programme never touched.

---

## 15. Implications for GEN-001 interpretation

GEN-001's secondary, exploratory, confounded pattern (all 50 evaluated
Spanish documents SUPPORTED/0-issues vs. 11/25 evaluated English documents
HOLD/REVIEW, per the Post-Blind Evidence Review) is now **substantially
better explained**: this programme confirms, under controlled conditions,
that Stage 5 systematically under-detects materiality in Spanish text via a
specific, named 5-rule mechanism, which would suppress HIGH/MODERATE/LOW
findings (pushing documents toward SUPPORTED) in exactly the direction
GEN-001 observed. This strengthens the confidence that GEN-001's pattern
reflects a real evaluator limitation rather than a corpus-selection
artefact — but it does **not** retroactively convert GEN-001's exploratory,
confounded observation into a controlled, blind confirmation; GEN-001
remains diagnostic evidence only, as this programme's own controlled
matrix is the actual confirming evidence.

## 16. Implications for GC-2

**`GC_2_NOT_JUSTIFIED`** at this time. This programme confirms and closes a
specific, bounded Stage 5 defect and validates a minimal experimental
correction against the controlled matrix, CHK-005, and existing regression
tests — but it does not constitute the broader, blind, cross-corpus
generalisation evidence a new frozen evaluator candidate would require. If
a future programme determines GC-2 is warranted (e.g., after broader
validation of the V2 correction, or after further defects are confirmed), a
future targeted holdout should test:

- **Generalisation beyond this controlled experiment**: whether the V2
  lexicon extension behaves correctly on real, naturally-occurring Spanish
  documents beyond the already-inspected CHK-005 pair (a genuinely blind
  sample, not GEN-001's now-diagnostic-only 100 documents).
- **Restoring English-HTML coverage**: GEN-001's missing `HTML_ENGLISH`
  stratum (identified in the Post-Blind Evidence Review) remains an open,
  separate gap this programme does not address.

This programme does **not** select that holdout, and does not create or
freeze a GC-2 candidate.

---

## 17. Remaining limitations

- The controlled matrix covers only English and Spanish. The task
  explicitly scoped this as a two-language (with an optional extra
  diagnostic language) controlled experiment, not a broad multilingual
  programme; other languages (French, Bulgarian, Japanese, etc., already
  touched by earlier ACQ milestones) were not tested against Stage 5 here.
- The V2 experimental lexicon covers only the 5 rule families this
  programme's evidence implicates. It is not a claim that all 24 Stage 5
  rules are now language-neutral — the 5 structurally-uncovered classes
  (permission, negated obligation, future intent, authority statement,
  scope limitation) remain undetected in *both* languages, unchanged by
  this work, and out of this programme's scope.
- `FACTUAL_2`'s exclusion (Section 4) reveals a small, pre-existing,
  English-side rule-coverage gap in `MA-LOW-DESCRIPTIVE` (missing "this
  service" from its noun-phrase list) that is unrelated to language but was
  incidentally discovered; it is noted here for future reference, not
  corrected, since correcting English-side rule coverage is outside this
  programme's cross-language scope.
- V2 is experimental and untested against GEN-001's 100 documents (by
  design, per the programme boundary) and against the wider live corpus
  beyond the regression suites listed in Section 14.

---

## 18. Exact files created or modified

**Created:**
- `lib/dra-reference/src/benchmark/analysis/dra-eng-026-controlled-matrix.ts`
- `lib/dra-reference/src/materiality-assessment/experimental/dra-eng-026-materiality-rules-v2-experimental.ts`
- `lib/dra-reference/src/benchmark/analysis/__tests__/dra-eng-026-cross-language-stage5-closure.test.ts`
- `docs/dra/DRA-ENG-026-CROSS-LANGUAGE-STAGE5-MATERIALITY-CLOSURE.md` (this file)

**Modified:** none. No frozen GC-1 file, GEN-001 artefact, or existing test
file was changed.

---

## 19. Final verdicts

**Closure verdict: `DRA_ENG_026_CLOSED`.**
**Candidate verdict: `GC_2_NOT_JUSTIFIED`.**

## 20. Summary answers

1. **Does a controlled Stage 5 language defect exist?** Yes —
   `CONFIRMED_BOUNDED_DEFECT`, reproduced on 14/25 controlled pairs across 7
   semantic classes.
2. **What is its root cause?** Exactly 5 named Stage 5 rules
   (`MA-HIGH-OBLIGATION`, `MA-HIGH-RECOMMENDATION`, `MA-MODERATE-GUIDANCE`,
   `MA-LOW-BACKGROUND`, `MA-LOW-DESCRIPTIVE`) trigger only on English-language
   lexical tokens; no other candidate mechanism (morphology, negation, word
   order, punctuation, tokenization, upstream segmentation) contributes.
3. **Does a safe generic correction exist?** Yes — a minimal, additive,
   language-general lexicon extension to those same 5 regexes, implemented
   in a separate experimental module, resolves all 14 divergences with zero
   English regression and zero change to GC-1's frozen digest.
4. **Is GC-2 justified?** Not yet — `GC_2_NOT_JUSTIFIED`. This closes a
   bounded defect; it is not broader generalisation evidence.
5. **What is the minimum next evidence programme?** A genuinely blind,
   newly-selected Spanish-document holdout (not GEN-001's now-diagnostic
   corpus) to validate the V2 lexicon extension on real documents, paired
   with a separate targeted programme to restore GEN-001's missing
   `HTML_ENGLISH` stratum coverage — both out of scope for this programme.
