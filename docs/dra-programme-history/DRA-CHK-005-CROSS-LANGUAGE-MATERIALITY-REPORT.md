# DRA-CHK-005 — Cross-Language Materiality Coverage Investigation

STATUS: DIAGNOSTIC CHECKPOINT ONLY. No production code (Stage 4, Stage 5,
normalisation, acquisition, evaluator) was changed or behaves differently as
a result of this investigation. `evaluatorVersion` remains `"0.1.2"`. No new
document was acquired or frozen (no DRA-DOC-0022 / DRA-ACQ-018). The
counterfactual re-lexicalisation used in Part 9 is a test-local pure
function, never imported by or reachable from any production stage.

Supporting test:
`src/benchmark/analysis/__tests__/dra-chk-005-cross-language-materiality.test.ts`
(13 tests, all passing).

Source pair: DRA-DOC-0021 (EC "Ethics Guidelines for Trustworthy AI", EN,
frozen REVIEW/7 issues) and DRA-DOC-0018 (same document, ES translation,
frozen SUPPORTED/0 issues) — the same publisher, same underlying document,
two language editions, first analysed for a single reference pair in
DRA-CHK-003/004.

---

## Part 1 — Stage 5 rule inventory

`materiality-rules.ts` runs six severity tiers in fixed order —
CRITICAL (6 rules) → HIGH (7 rules) → MODERATE (5 rules) → LOW (4 rules) →
INFORMATIONAL (3 rules, custom logic) → `MA-UNDETERMINED-DEFAULT` — and stops
at the first rule that matches.

The rule responsible for almost every finding in this investigation is:

```
MA-HIGH-OBLIGATION: /\b(?:must|shall)\b/i
```

This is case-insensitive but matches **only the English tokens** `must` /
`shall`. No rule anywhere in the six tiers recognises any Spanish deontic
marker (`debe`, `deben`, `deberá`, `deberán`, `es preciso`, `será lícito`,
etc.). The same is true one tier down: `MA-MODERATE-GUIDANCE` matches English
`should` but not Spanish `debería`.

This is not a newly discovered gap. The rule file's own header docstring
already states, as a named Version 1 limitation: **"Non-English obligation
markers are not detected."** Part 1's tests confirm this directly against
the live rule engine (`classifyMateriality`), independent of any document.

---

## Part 2/3 — Pair construction and CONFIRMED status

17 pairs were built by manually diffing the two PDFs' extracted text and
anchoring on structural markers stable across both editions — footnote
numbers and named sub-section headings (e.g. "Prevention of harm principle",
"Fairness principle") — then resolving each anchor to a real Stage 2
statement on both the EN and ES sides via `evaluateDocument`. All 17 resolved
to a real statement on both sides (CONFIRMED):

- **12 OBLIGATION pairs** (P1–P12): sentences containing an English
  must/shall obligation matched against their Spanish deontic counterpart
  (deber(á/án), deben/debe, es preciso, será lícito).
- **5 CONTROL pairs** (C1–C5): non-obligation descriptive/citation sentences
  — Charter/GDPR/UN Convention references, a verbatim bibliographic
  citation, and a "requires further research" sentence (non-deontic
  "require") — expected to show no obligation-lexicon divergence.

Two structural artefacts were found and worked around, both orthogonal to
the core finding:
- `pdftotext -layout` line-wraps mid-sentence at some points, which the
  Stage 2 segmenter occasionally treats as a break; anchors were adjusted to
  match the actual (sometimes mid-sentence-truncated) segmented statement
  text rather than the full source sentence.
- A trailing `\b` after an accented Spanish vowel (e.g. `deberá`) silently
  fails to match in a plain regex, because `\w` does not include accented
  letters — the same class of pitfall as prior DRA-ENG regex issues in this
  codebase. The test-only counterfactual mapping in Part 9 uses lookahead
  assertions instead of a trailing `\b` to route around this.

---

## Parts 4–7 — Per-pair Stage 4/5 trace and taxonomy

| Pair | EN materiality / rule | ES materiality / rule | Divergence class | Mechanism |
|---|---|---|---|---|
| P1 (Art. 6 GDPR, footnote 71 — reference pair from DRA-CHK-003/004) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P2 (governmental power must be authorised) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P3 (must not undermine democratic processes) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P4 (must also embed a commitment to ensure) | CRITICAL / MA-CRITICAL-CONTRACT | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_CRITICAL_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P5 (moral worth and dignity must be ensured) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P6 (must be safe and secure) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P7 (must be technically robust) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P8 (particular attention must also be paid) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P9 (must be fair) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P10 (accountable entity must be identifiable) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P11 (must keep full self-determination) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| P12 (must be translated into concrete requirements) | HIGH / MA-HIGH-OBLIGATION | UNDETERMINED / MA-UNDETERMINED-DEFAULT | EN_HIGH_ES_UNDETERMINED | ENGLISH_ONLY_LEXICAL_COVERAGE |
| C1–C5 (controls) | UNDETERMINED / MA-UNDETERMINED-DEFAULT | UNDETERMINED / MA-UNDETERMINED-DEFAULT | FULL_MATERIALITY_PARITY | NO_DIVERGENCE |

**12/12 obligation pairs diverge; 0/12 obligation pairs show materiality
parity; 5/5 control pairs show full parity.** P4 diverges via a different
Stage 5 rule (`MA-CRITICAL-CONTRACT`, triggered by the English phrase
"commitment ... to ensure") rather than `MA-HIGH-OBLIGATION`, but the root
cause is the same: no Spanish equivalent of that phrase pattern exists in
any Stage 5 rule either, so it is still classed as
`ENGLISH_ONLY_LEXICAL_COVERAGE`. All other 11 pairs go through
`MA-HIGH-OBLIGATION` specifically.

---

## Part 8 — Stage 4 vs Stage 5 causation isolation

Stage 5's `classifyMateriality` is a pure function of statement text alone
(per `assess-materiality.ts`'s own stated constraint that it "must not ...
judge source credibility or evidence quality"). It never reads Stage 4's
evidence-detection output. This was confirmed directly: for all 12
lexical-coverage pairs, the ES side's rule is exactly
`MA-UNDETERMINED-DEFAULT` and the EN side's is not — deterministically, with
no dependency on `detectEvidence`'s outcome.

As a corroborating (not causal) cross-check, 10 of the 12 pairs also have an
identical Stage 4 "standard reference" evidence-match outcome on both sides.
Two pairs (P1, P12) differ on that unrelated Stage 4 signal — this is an
orthogonal, independent Stage 4 phenomenon (a standard-reference token
present in one language's exact phrasing but not the other's) and does not
affect the Stage 5 attribution, since Stage 5 does not consume it.

---

## Part 9 — Test-only counterfactual

A local, unexported `counterfactualSpanishToEnglishDeontic()` function
regex-replaces Spanish deontic forms (`deberá(n)`, `debe(n)`, `es preciso` /
`preciso`, `será lícito`) with their English must/shall equivalents, then
feeds the result into the real, unmodified `classifyMateriality()`.

**Result: all 12 lexical-coverage pairs are restored to
`HIGH`/`MA-HIGH-OBLIGATION`** once English deontic tokens are substituted
into the otherwise-unchanged Spanish statement text. This directly confirms
the mechanism: the divergence is caused by lexical absence in the rule set,
not by any structural or semantic difference between the EN/ES statements
themselves.

This function is declared only inside the test file, is never exported, and
is confirmed not reachable from any production import graph
(`src/materiality-assessment`, `src/evidence-linkage`, `src/normalisation`,
`src/benchmark/acquisition`).

---

## Part 10 — Frequency / pattern summary

| Metric | Value |
|---|---|
| CONFIRMED obligation pairs | 12 |
| CONFIRMED control pairs | 5 |
| Obligation pairs with materiality divergence | 12 / 12 (100%) |
| Obligation pairs attributable to ENGLISH_ONLY_LEXICAL_COVERAGE | 12 / 12 (100%) |
| Control pairs with any divergence | 0 / 5 (0%) |
| Lexical-coverage pairs also confirmed via counterfactual restoration | 12 / 12 (100%) |
| Lexical-coverage pairs with a Stage 4 evidence-outcome confound | 2 / 12 (orthogonal, not causal) |

---

## Part 11 — Systematic-behaviour verdict

**SYSTEMATIC_ENGLISH_LEXICAL_COVERAGE_PATTERN.**

All 12 independent, structurally-anchored obligation pairs diverge, and
every divergence traces to the identical single mechanism — Stage 5's
obligation-detection rules matching only English tokens — independently
reproduced by the counterfactual test in Part 9. This is not an isolated or
occasional effect; it is the deterministic, 100%-reproducing behaviour of
the current rule set whenever an obligation sentence is expressed in
Spanish.

## Part 12 — Limitation-vs-defect verdict

**DOCUMENTED_LANGUAGE_LIMITATION.**

`materiality-rules.ts`'s own header already names this exact limitation
("Non-English obligation markers are not detected") for Version 1. This
investigation generalises that statement from one previously-analysed pair
(DRA-CHK-003/004) to 12 independently confirmed instances across the full
range of Stage 5 obligation-triggering rules (HIGH and CRITICAL tiers). It
is a confirmed, systematic instance of an already-documented scope
limitation — not a newly discovered defect.

## Part 13 — Impact on the 7 English IC-5 findings

`issue-detection.ts`'s `IC-5 EVIDENCE_INADEQUATE` fires only when materiality
is exactly `HIGH` with weak/absent evidence and authority present. Since all
7 IC-5 findings in DRA-DOC-0021 (EN) require materiality HIGH, and HIGH is
reachable in Spanish text only via English tokens, the counterfactual
Part 9 result implies that *if* the Spanish statements were re-lexicalised,
equivalent HIGH classifications — and potentially equivalent IC-5-style
findings — could in principle appear. This is stated strictly as a
**counterfactual** implication of the test-only mapping. It is **not** a
claim about the real, frozen DRA-DOC-0018 evaluation, which remains
SUPPORTED/0 issues under the current (unmodified) evaluator.

## Part 14 — Engineering-readiness verdict

**NOT READY.**

A real fix would require: a documented, versioned Spanish deontic lexicon
(covering at minimum `deber(á/án)`, `debe(n)`, `es preciso`, `será/es
lícito`, and their negations), native-Spanish-speaker review of that
lexicon's precision/recall against real obligation and non-obligation
sentences, and a new evaluator version issued under the append-only
precedent established by DRA-ENG-014 (no live dual-version routing exists in
this repository; a correction can only be added as a new version, never as
an in-place edit of a frozen rule). None of this is authorised or attempted
by this diagnostic checkpoint.

## Part 15 — Decision gate

**STAGE5_ENGINEERING_INVESTIGATION.**

Twelve independent, structurally-anchored EN/ES obligation pairs from the
same source document show a 100% divergence rate, with one single,
counterfactually-confirmed mechanism responsible for every case. This
exceeds the threshold for an isolated or "repeated but limited" finding and
warrants a dedicated Stage 5 engineering-scoping effort (lexicon design,
native-language review, versioning plan) before any further multilingual
corpus acquisition. `RESUME_ACQUISITION` is not recommended without first
scoping that investigation, since any newly acquired non-English document
would predictably exhibit the same systematic under-detection of
obligations.

---

## Explicitly out of scope for this checkpoint

- No Stage 5 rule was added, modified, or versioned.
- No new document was acquired, and no DRA-DOC-0022 / DRA-ACQ-018 exists.
- No evaluator version bump occurred; `evaluatorVersion` remains `"0.1.2"`.
- The counterfactual lexicon in Part 9 is diagnostic-only and is not a
  candidate implementation — a real fix requires the scoping work named in
  Part 14, done as separate, explicitly authorised engineering work.
