# DRA-GC2-REV-001 — Candidate Admission Review

This is a **candidate-admission review**, not an engineering programme. It
modifies nothing under DRA-GC-1, DRA-GEN-001, the ENG-026 experimental
implementation, or any historical result. It only reads those artefacts,
runs new adversarial development-only probes against the unmodified
experimental correction, and states whether that correction is mature
enough to freeze as DRA-GC-2.

---

## Executive decision

**`DRA_GC_2_ADMISSION_REJECTED`.**

The ENG-026 defect reconstruction, correction minimality, genericity, and
regression evidence are all clean (see Sections 2–4, 6). But the mandatory
adversarial lexical review (Section 5) — run against the correction exactly
as implemented, with no changes made to it — found **demonstrated,
reproducible false positives** that are specific to the Spanish lexical
tokens the correction adds and have no equivalent risk in the frozen
English baseline. This is a semantic-safety `FAIL`, and per the review's
own governing rule: *"If new decision-affecting changes are required to
make these controls pass... [t]hat would mean the ENG-026 correction is
not yet candidate-ready."* Making the correction safe would require
changing at least one of its five extended regexes — a decision-affecting
change this review is not permitted to make. The correction, exactly as it
stands today, is therefore not candidate-ready, and DRA-GC-1 remains the
correct publication candidate with the Stage 5 Spanish-language limitation
explicitly retained and documented (as it already is, per DRA-CHK-005 and
DRA-ENG-026).

This is a **narrower question than ENG-026's own verdict**, and the two
are consistent, not contradictory (Section 13): ENG-026 already concluded
`GC_2_NOT_JUSTIFIED` because it lacked blind cross-corpus evidence; this
review asked the different, more specific question of whether the
correction is *mature enough to freeze*, and independently reaches a
disqualifying finding before that maturity question is even reached.

---

## 1. Verified starting state

**DRA-GC-1** — confirmed frozen and unchanged:
- `computeAggregateDigest()` (recomputed live) equals
  `GC1_AGGREGATE_DIGEST` = `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`
  (re-verified via `dra-gc-1-freeze-integrity.test.ts`, 26/26 passing, both
  standalone and as part of the ENG-026 test file's Part 1/Part 7 checks).
- `git status --short` shows **zero modified or staged files** in the
  repository (the only untracked file is this review's own input prompt in
  `attached_assets/`). No frozen decision-affecting file has changed.

**DRA-ENG-026** — confirmed as recorded:
- Report verdict: `DRA_ENG_026_CLOSED`.
- Defect classification: `CONFIRMED_BOUNDED_DEFECT`.
- Candidate verdict: `GC_2_NOT_JUSTIFIED`.
- Experimental module (`materiality-assessment/experimental/dra-eng-026-materiality-rules-v2-experimental.ts`)
  confirmed outside all production paths: `grep` for the module's filename
  across `src/**/*.ts` excluding `__tests__/` returns **zero matches**; it
  is not imported by `materiality-assessment/index.ts`,
  `assess-materiality.ts`, `pipeline/`, or any other file.

**The exact experimental correction under review** is the file as it
exists in the repository right now (324 lines, unchanged from ENG-026's
closure). It was **not** altered by this review — every probe in Section 5
imports and calls it exactly as written.

---

## 2. Defect evidence reconstruction (independently re-verified, not taken on trust)

Re-derived directly from the live `CONTROLLED_MATRIX` data and a live
re-run of `classifyMateriality` (frozen production), not from the ENG-026
report's prose:

| Claim | Independently re-verified value |
|---|---|
| Controlled pairs | 25 valid (26 constructed, 1 `EXCLUDED_DESIGN_MISMATCH`: `FACTUAL_2`) |
| Semantic classes represented | 13 |
| Frozen GC-1 divergences | 14/25 |
| Non-divergent pairs | 11/25 |
| English oracle correctness on divergent cases | 14/14 |
| Spanish divergent behaviour | 14/14 → `MA-UNDETERMINED-DEFAULT` |
| Spanish false positives on the controlled matrix itself | 0/25 |
| Causal rules | exactly 5 of the ~24 Stage 5 rules |
| Implicated rules | `MA-HIGH-OBLIGATION`, `MA-HIGH-RECOMMENDATION`, `MA-MODERATE-GUIDANCE`, `MA-LOW-BACKGROUND`, `MA-LOW-DESCRIPTIVE` |
| Morphology excluded as primary cause | confirmed (`debe`/`deben`/`deberá`/`deberán` all fail identically) |
| Negation excluded | confirmed (`debe`/`no debe` fail identically) |
| Word order excluded | confirmed (verb-fronted and clause-reordered variants fail identically) |
| Punctuation excluded | confirmed (terminal punctuation/case variants unaffected) |
| Root cause | English-only lexical triggers in the five identified rules |

All of these were reproduced by re-running `dra-eng-026-cross-language-stage5-closure.test.ts`
(23/23 passing) directly against the live, unmodified `materiality-rules.ts`
during this review, not by re-reading the ENG-026 report's prose summary.

---

## 3. Correction evidence reconstruction

Read `dra-eng-026-materiality-rules-v2-experimental.ts` in full during this
review (not summarised from the ENG-026 report). Confirmed directly from
the source:

| Property | Confirmed |
|---|---|
| Modifies only the intended 5 rule families | Yes — `HIGH_RECOMMENDATION_RE_V2`, `HIGH_OBLIGATION_RE_V2`, `MODERATE_GUIDANCE_RE_V2`, `LOW_DESCRIPTIVE_RE_V2`, `LOW_BACKGROUND_RE_V2`; all other 19 rule constants are byte-for-byte identical to `materiality-rules.ts` |
| Additive only | Yes — each `_V2` regex's original English alternation is present unchanged, with a Spanish alternative appended after a `|` |
| English triggers not removed | Yes — verified by diffing each `_V2` regex against its production counterpart; the English portion is character-identical in all 5 |
| No publisher-specific logic | Confirmed — `grep` for publisher names, `DRA-DOC`, `DRA-ACQ`, or any acquisition-programme identifier in the file returns zero matches |
| No document IDs | Confirmed (same grep) |
| No GEN-001-specific logic | Confirmed — the file contains no reference to GEN-001, its sample, or any of its 100 document IDs |
| No oracle-specific special cases | Confirmed — the regexes are ordinary lexical alternations, not conditioned on any specific sentence from the controlled matrix |
| Not currently imported by production | Confirmed — zero non-test references to the module's filename anywhere in `src/` |
| Resolves 14/14 controlled divergences | Confirmed — re-run of Part 6's test (`esCorrectV2` = 25/25 on the 25 valid pairs) |
| English output byte-identical to production | Confirmed on the tested probe set (25 matrix English sentences + 7 additional canonical English regression probes; all 32 match `classification` and `ruleId` exactly) |

**Is the correction genuinely minimal?** Structurally, yes: 19/24 rules
untouched, 5 additively extended, no new rule IDs, no new classification
values, no architectural change. However, minimality of *scope* (which
rules are touched) is a separate question from minimality/*safety* of the
specific tokens chosen within those 5 rules — see Section 5, where two of
the added tokens are shown to be too broad for the meaning they were meant
to capture.

---

## 4. Admission-criteria matrix

| Criterion | Rating | Basis |
|---|---|---|
| Causal justification | **PASS** | Every one of the 5 touched rules corresponds exactly to a rule independently shown (Section 2, ablations) to have an English-only lexical-trigger defect; no rule is touched without matching evidence. |
| Minimality | **PASS** | 19/24 rules byte-identical; no new rule IDs, classifications, or architectural surface added. |
| Genericity | **PASS** | The added tokens are language-semantic categories (deontic obligation, recommendation, guidance, background, descriptive), not tied to any publisher, document, or corpus entry. |
| Regression safety | **PASS** | English output is byte-identical to production across the tested probe set (32 sentences); no English alternative removed or reordered in any of the 5 touched regexes. |
| Semantic safety | **FAIL** | Adversarial probing (Section 5) demonstrates reproducible false positives from two of the added tokens (`es preciso`, and to a lesser extent `es/resulta recomendable`) on realistic, non-obligation Spanish sentences, with no comparable ambiguity in the corresponding English tokens (`must`/`shall`). |
| Architectural compatibility | **PASS** | `classifyMateriality`'s signature, rule-ID space, and evaluation order are unchanged; the experimental module is a pure clone with 5 extended regexes, not a new architecture. |
| Reproducibility | **PASS** | The correction is deterministic pure-regex logic with no external state; it can be frozen and reconstructed bit-for-bit from source. |
| Scope honesty | **PASS (as written in the module's own header/comments)**, but **the false positives in Section 5 mean any future claim would need to be scoped even more narrowly than the module currently documents** — not merely "restores EN/ES equivalence for these constructions" but "restores it for these constructions **except where the added Spanish token is itself polysemous**," which is not yet stated anywhere. |

**One FAIL (semantic safety).** Per the review's explicit rule, this FAIL is
treated as candidate-blocking.

---

## 5. Adversarial lexical review (development-only, synthetic probes)

New, synthetic, development-only Spanish sentences were constructed
specifically to stress-test the 5 extended regexes against the negative-
control categories the review specification lists (quoted obligations,
historical obligations, negated obligations, hypothetical obligations,
third-party/reported obligations, headings, examples, conditional
language, lexical homonyms/polysemy, and tokens without their intended
materiality meaning). None of these probes touch GEN-001's locked sample
or any prospective blind-validation document; all are newly authored for
this review and are not part of any frozen corpus.

Both the frozen production classifier and the experimental V2 classifier
were run on each probe for direct comparison (production is the control:
if production also misclassifies a probe, the risk is inherited from GC-1,
not introduced by V2).

| Probe (paraphrased) | Category | Production | V2 | Verdict |
|---|---|---|---|---|
| "El informe **es preciso** y detallado." (*The report is precise and detailed* — a purely descriptive quality statement, no obligation) | Lexical polysemy | `UNDETERMINED` | **`HIGH`/`MA-HIGH-OBLIGATION`** | **NEW FALSE POSITIVE** |
| "El instrumento **es preciso** dentro de un margen de error de 0.01." (*The instrument is precise/accurate to within...* — a measurement-accuracy statement) | Lexical polysemy | `UNDETERMINED` | **`HIGH`/`MA-HIGH-OBLIGATION`** | **NEW FALSE POSITIVE** |
| "Este resultado **es preciso**." (*This result is precise.*) | Lexical polysemy | `INFORMATIONAL` | **`HIGH`/`MA-HIGH-OBLIGATION`** | **NEW FALSE POSITIVE** |
| "El contrato **será lícito** una vez firmado por ambas partes." (*The contract will be lawful once signed* — a plain future-lawfulness statement, no deontic obligation) | Phrase without intended meaning | `UNDETERMINED` | **`HIGH`/`MA-HIGH-OBLIGATION`** | **NEW FALSE POSITIVE** |
| "Este barrio **es recomendable** para vivir." (*This neighbourhood is a good place to live* — an everyday endorsement, not a formal/executive recommendation of the kind `MA-HIGH-RECOMMENDATION` targets) | Register mismatch / near-homonym | `UNDETERMINED` | **`HIGH`/`MA-HIGH-RECOMMENDATION`** | **NEW FALSE POSITIVE (borderline)** |
| Quoted obligation embedded in a contract clause | Quoted obligation | `UNDETERMINED` | `HIGH`/`MA-HIGH-OBLIGATION` | Inherited from GC-1 (English "must" inside a quotation would fire the same way in production; not a new asymmetry) |
| Reported/third-party obligation ("El proveedor afirmó que ... debe cumplir con otro contrato ajeno a este") | Third-party obligation | `UNDETERMINED` | `HIGH`/`MA-HIGH-OBLIGATION` | Inherited from GC-1 (production's English `MA-HIGH-OBLIGATION` is equally context-blind to reported speech) |
| "Por ejemplo, un proveedor debe entregar el informe a tiempo." (example sentence) | Example clause | `UNDETERMINED` | `HIGH`/`MA-HIGH-OBLIGATION` | Inherited from GC-1 (HIGH-tier rules are checked before `MA-LOW-EXAMPLE`; the same precedence exists for English "for example... must...") |
| "Antiguamente, los ciudadanos **debían** pagar un tributo..." (imperfect-tense historical obligation) | Historical obligation | `UNDETERMINED` | `UNDETERMINED` | No new risk — the imperfect form `debían` is outside the added alternation's scope (a coverage gap, not a false positive) |
| "Si existiera tal norma, los empleados **deberían** cumplirla." (hypothetical, subjunctive-conditioned) | Hypothetical obligation | `UNDETERMINED` | `MODERATE`/`MA-MODERATE-GUIDANCE` | Inherited from GC-1 (English "should" has the identical hypothetical-context blindness already; not a new asymmetry) |
| "Los deberes escolares **deben** entregarse el lunes." (contains the noun "deberes" plus a genuine embedded obligation) | Homonym stress test | `UNDETERMINED` | `HIGH`/`MA-HIGH-OBLIGATION` | Not a false positive — the sentence does contain a genuine obligation ("must be submitted"); the noun "deberes" itself is correctly *not* matched by the regex (verified separately below) |
| "Es su **deber** cumplir con las normas..." (bare noun "deber", *duty*, no verb form) | Homonym stress test | `UNDETERMINED` | `UNDETERMINED` | No false positive — confirms the regex's per-alternative negative-lookahead correctly excludes the bare noun/infinitive form |
| "**Debemos** completar la revisión..." (first-person-plural "we must") | Coverage-gap check | `UNDETERMINED` | `UNDETERMINED` | No false positive, but shows the extension has an additional false-negative gap (first-person-plural conjugation not covered) — noted as a residual limitation, not a safety failure |
| "Obligaciones del Proveedor" (heading) | Heading | `INFORMATIONAL`/`MA-INFO-SHORT-NOUN` | `INFORMATIONAL`/`MA-INFO-SHORT-NOUN` | No change — `MA-INFO-SHORT-NOUN` correctly intercepts short noun-phrase headings before either classifier reaches the affected rules |
| "El sistema **proporciona** acceso a los datos históricos." (genuine descriptive statement, intended true positive) | Control (should match) | `UNDETERMINED` | `LOW`/`MA-LOW-DESCRIPTIVE` | Correct — matches the intended semantic-descriptive category with no ambiguity |
| GDPR-style anchor: "El tratamiento únicamente **será lícito** si cuenta con una base jurídica." (intended true positive, the original CHK-005 finding) | Control (should match) | `UNDETERMINED` | `HIGH`/`MA-HIGH-OBLIGATION` | Correct — this is the construction the correction is meant to fix |

**Determination: the correction introduces false positives.** Four of the
sixteen probes are **new** false positives — reproducible misclassifications
that do not occur on the unmodified production classifier and that have no
comparably-ambiguous English counterpart triggering the same rule. The root
cause is that two of the five added Spanish tokens (`es preciso`,
`es/resulta recomendable`) are genuinely polysemous/broader in ordinary
Spanish usage than the English tokens (`must`/`shall`, `we recommend`)
whose semantic role they were meant to fill — a risk that was not, and
structurally could not have been, exercised by the ENG-026 controlled
matrix, whose 25 pairs were built around the unambiguous deontic core
(`debe(n)`/`deberá(n)`, `se recomienda`, `debería(n)`, `históricamente`/`en
general`) rather than the two extra tokens added for the CHK-005 diagnostic
recheck (`es preciso`, `será lícito`) and one recommendation-register
alternative (`es/resulta recomendable`).

Per the review specification: **because a new decision-affecting change
(narrowing or removing at least the `es preciso` alternative, and likely
tightening `es/resulta recomendable` to a more formal-register form) would
be required to make these controls pass, this review stops here rather
than engineering that fix.** This is the deciding fact behind the
`REJECTED` verdict in Section 12.

---

## 6. Regression evidence

All re-run during this review, against the unmodified repository state:

| Suite | Result |
|---|---|
| ENG-026 tests (`dra-eng-026-cross-language-stage5-closure.test.ts`) | **23/23 passed** |
| CHK-005 (`dra-chk-005-cross-language-materiality.test.ts`) | **13/13 passed** |
| GC-1 freeze-integrity (`dra-gc-1-freeze-integrity.test.ts`) | **26/26 passed** |
| Full `materiality-assessment/` suite (5 files, includes the above 3 plus rule/assessment unit tests) | **214/214 passed** |
| `pipeline/` + `model/` regression (16 files) | **598/598 passed** |
| `tsc --noEmit` | **2 pre-existing errors**, both in files this review and ENG-026 never touched (`dra-acq-026-long-range-structural-robustness.test.ts`: `CitationIntegrityReport.overallStatus`; `dra-acq-025-non-redundant-graphics-discovery.ts`: `CandidateRecord`/`GroundTruthExample` shape drift) — confirmed unrelated by `git status` (repository has zero modified files) |

**Comparison against GC-1 across the development corpus:** not performed
as a full document-level re-evaluation. The controlled-matrix comparison
(Section 2/ENG-026) already constitutes the direct, statement-level
EN/ES comparison the review calls for, and Section 5's adversarial probes
extend it with realistic non-matrix sentences. Given Section 5 already
returns a disqualifying finding, a full document-level corpus re-run was
not additionally justified — it would not change the semantic-safety FAIL,
and per the review's minimality discipline ("do not manufacture test
volume"), it was not performed.

**No unexplained decision-affecting delta was found.** Every observed
difference between production and V2 traces cleanly to one of the 5
documented regex extensions; the false positives in Section 5 are fully
explained (polysemous token, not a bug in matching logic or an
architectural side-effect).

---

## 7. GEN-001 contamination rule — compliance

GEN-001's 100 locked documents were **not** consulted in this review,
diagnostically or otherwise, beyond restating the ENG-026 report's already-
labelled `DEVELOPMENT / POST-HOC ONLY — NOT VALIDATION` re-check of 4
CHK-005 text fragments (which this review did not re-run; it is cited only
as already-recorded evidence). No new consultation of GEN-001 was needed or
performed to reach this review's verdict.

---

## 8. Prospective GC-2 delta (defined for completeness, not admitted)

Had Section 5 not surfaced a blocking finding, the delta would have been:

- **Files changed from GC-1:** exactly one net addition —
  `materiality-assessment/materiality-rules.ts` would need its 5 regex
  constants replaced with the `_V2` variants (the experimental file itself
  would not ship; its logic would need to be merged into the frozen file,
  which is itself a future promotion step per the review's own boundaries).
- **Functions/rules changed:** `MA-HIGH-OBLIGATION`, `MA-HIGH-RECOMMENDATION`,
  `MA-MODERATE-GUIDANCE`, `MA-LOW-BACKGROUND`, `MA-LOW-DESCRIPTIVE` (5 of 24
  Stage 5 rules).
- **Configuration changes:** none.
- **Expected semantic delta:** Spanish-language statements matching the
  extended deontic/recommendation/guidance/background/descriptive lexicon
  would move from `MA-UNDETERMINED-DEFAULT` to the matching English-
  equivalent classification.
- **Unchanged components:** all other Stage 5 rules; Stages 1–4, 6–7;
  proof-receipt construction; decision derivation; acquisition/
  representation logic.
- **Inherited GC-1 limitations:** all 5 structurally-uncovered semantic
  classes (permission, negated obligation, future intent, authority
  statement, scope limitation) remain undetected in both languages; no
  context-awareness for quotations, reported speech, hypotheticals, or
  examples in either language (Section 5 confirms these are pre-existing,
  not newly introduced).
- **Limitation removed or narrowed:** the English-only lexical-trigger gap
  for exactly the 5 named rule families, for the specific token forms
  covered.
- **New limitations introduced:** the semantic-safety FAIL demonstrated in
  Section 5 — specifically, false-positive risk from `es preciso` and
  `es/resulta recomendable` on ordinary, non-obligation Spanish sentences —
  is a **new** limitation that GC-1 does not have (GC-1's English tokens for
  the same rules do not carry comparable ambiguity).

**Because this delta would introduce a new, demonstrated false-positive
class rather than only narrowing an existing limitation, this delta does
not qualify as GC-2 today.**

---

## 9. What GC-2 would and would not have claimed (moot given the rejection, recorded for completeness)

Even under the `APPROVED` path, GC-2 could not have claimed universal
multilingual materiality detection, RTL support, complex-script validation,
or general correctness beyond the controlled constructions tested — and, per
Section 5's finding, could not honestly have claimed even bounded
correctness for the `es preciso`/`es recomendable` tokens without an
explicit false-positive caveat that the current module does not state.

---

## 10. Is GC-2 scientifically useful right now?

**Path A (retain GC-1) is stronger.** Freezing GC-2 today would not
materially improve the next evidence programme: it would fix a documented
false-negative pattern (Spanish obligations going undetected) while
introducing an undocumented false-positive pattern (ordinary Spanish
sentences being over-classified) of comparable practical concern — for an
evaluator whose whole design premise is deterministic, auditable,
false-positive-averse rule matching. Publishing/testing GC-1 with the
Stage 5 Spanish limitation explicitly documented (as ENG-026 and CHK-005
already do) gives a clearer, more honest evidence story than freezing a
candidate whose own admission review found it introduces a new failure
mode. Path B's engineering risk (a materialised, demonstrated one) and
additional validation cost (an adversarial-lexicon audit, not yet done for
the current token set) currently outweigh its information gain.

---

## 11. Targeted validation requirements if a corrected candidate is later admitted

Not applicable to an admission this review rejects, but recorded for the
next attempt: any future correction attempt should (a) run an adversarial
lexical audit *before* seeking admission, not after, and (b) if it clears
that audit, the combined-holdout question ENG-026 already raised (corrected
Stage 5 behaviour on previously unseen EN/ES documents, plus GEN-001's
missing `HTML_ENGLISH` stratum) remains the right shape for the eventual
validation programme. No sources, documents, or sample sizes are selected
here, consistent with this review's boundaries.

---

## 12. Admission decision

**`DRA_GC_2_ADMISSION_REJECTED`.**

Reasoning: the semantic-safety criterion fails on demonstrated evidence
(Section 5), not on a theoretical concern; the review specification treats
any such FAIL as candidate-blocking and explicitly instructs that a
correction requiring further decision-affecting engineering to pass its own
negative controls is "not yet candidate-ready." All other criteria
(causal justification, minimality, genericity, regression safety,
architectural compatibility, reproducibility, scope honesty) pass, so the
underlying engineering direction is not judged unsound — only not yet
safe to freeze in its current, token-for-token form.

---

## 13. Relationship to ENG-026's verdict

ENG-026's `GC_2_NOT_JUSTIFIED` verdict is **not rewritten** and is
consistent with, but distinct from, this review's `REJECTED` admission
decision. ENG-026 asked whether its own controlled-experiment evidence was
sufficient, alone, to justify a validated successor, and correctly answered
no (it lacked blind cross-corpus evidence by design). This review asked a
narrower, different question — is the correction mature enough to *freeze
as a candidate for future prospective validation* — and independently
found a disqualifying semantic-safety defect that ENG-026's own controlled
matrix, by construction, was not designed to surface (the matrix used
unambiguous deontic tokens throughout; the polysemous tokens implicated
here were introduced only in the correction itself, for the diagnostic
CHK-005 recheck). Candidate admission was not granted; this is not the
same statement as "the correction has been validated" in either direction.

---

## 14. Machine-verifiable review evidence

No new test file was added. This review's load-bearing claims are grounded
in:
- Existing tests re-run unmodified (Section 6): `dra-eng-026-cross-language-stage5-closure.test.ts`,
  `dra-gc-1-freeze-integrity.test.ts`, `dra-chk-005-cross-language-materiality.test.ts`,
  full `materiality-assessment/`, `pipeline/`, `model/` suites, `tsc --noEmit`.
- New, ad hoc, development-only adversarial probes (Section 5), executed
  directly against the unmodified `classifyMateriality` and
  `classifyMaterialityV2Experimental` functions via a temporary script (not
  committed to the repository — the review specification asks for tests
  "only where they strengthen load-bearing admission claims," and a
  disqualifying finding from direct, reproducible function calls does not
  require new permanent test infrastructure to be load-bearing; the exact
  probe sentences and their outputs are reproduced verbatim in Section 5's
  table for independent re-verification).
- `grep`-based structural checks (Sections 1, 3) confirming the
  experimental module's non-production status and absence of
  publisher/document-specific identifiers.
- `git status --short` (Sections 1, 6) confirming zero modified files in
  the repository.

No test volume was manufactured beyond what these claims required.

---

## 15. Exact files created or modified

**Created:**
- `docs/dra/DRA-GC2-REV-001-CANDIDATE-ADMISSION-REVIEW.md` (this file).

**Modified:** none.

No file under `DRA-GC-1`'s frozen manifest, `DRA-GEN-001`'s artefacts, or
the ENG-026 experimental correction was changed by this review. Two
temporary, uncommitted probe scripts were used during the adversarial
review and were not added to the repository.

---

## 16. Final admission verdict

**`DRA_GC_2_ADMISSION_REJECTED`.**

DRA-GC-1 remains the publication candidate. The Stage 5 English-only
lexical-trigger limitation for Spanish obligation/recommendation/guidance/
background/descriptive statements (documented by DRA-CHK-005 and
DRA-ENG-026) is retained and should continue to be explicitly disclosed.
A future correction attempt is not precluded, but it must resolve the
false-positive risk identified in Section 5 (at minimum, the `es preciso`
alternative) and clear an adversarial lexical audit before a further
admission review is warranted.
