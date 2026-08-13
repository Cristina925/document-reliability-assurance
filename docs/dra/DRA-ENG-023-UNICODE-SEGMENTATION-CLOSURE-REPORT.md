# DRA-ENG-023 — Unicode-Aware Segmentation and Tokenisation Closure Report

## 1. Purpose and scope

This engineering programme closes the `SEGMENTATION_TOKENISATION_GAP_DEMONSTRATED`
finding from DRA-ACQ-028 Phase 2 (see
`DRA-ACQ-028-PHASE2-DOC0032-JAPANESE-BASELINE-REPORT.md`), which showed that the
pipeline's Stage 2 (claim extraction / segmentation) treated substantive
ideographic content as punctuation-only noise, discarding 75.4% of the content
of a real Japanese-language document (DRA-DOC-0032) at the segmentation stage,
against 0% loss on the same document's English translation.

Scope is deliberately narrow: fix the two demonstrated ASCII-only defects in
Stage 2, verify the fix on the originating document and corpus, and close the
finding. This programme does **not** start a new document acquisition
(DRA-DOC-0033) — per the governing instruction, DRA-DOC-0033 is only named as
a *future target* at the end of this report, and is not acquired here.

## 2. Frozen pre-fix oracle

Before any production code was touched, the exact pre-fix `segmentContent()`
and `classifySegments()` implementations were copied verbatim into
`src/claim-extraction/__frozen__/pre-eng-023/` (renamed exports
`segmentContentPreEng023` / `classifySegmentsPreEng023`, docblocked
"DO NOT MODIFY"). A new test,
`dra-eng-023-pre-fix-oracle.test.ts`, imports only these frozen functions and
independently re-derives the DRA-ACQ-028 Phase 2 baseline numbers directly
from the same cached PDF text used at admission time:

| Metric | Value (frozen pre-fix code) |
|---|---|
| Japanese segments | 407 |
| Japanese PUNCTUATION_ONLY exclusions | 183 (182 of which are real ideographic script, misclassified) |
| Japanese candidates surviving to Stage 3 | 70 |
| Content loss | 75.4% |
| English segments | 534 |
| English PUNCTUATION_ONLY exclusions | 0 |

This matches the DRA-ACQ-028 Phase 2 report exactly and gives a permanent,
code-independent oracle: this test will keep passing even after the
production fix, because it never touches the live modules.

## 3. Root cause (confirmed, not re-derived)

Exactly the two locations identified in DRA-ACQ-028 Phase 2, confirmed by
direct inspection — no other contributing code paths were found:

1. **`classify-segments.ts`** — the `PUNCTUATION_ONLY` substantive-content
   test used `/[a-zA-Z0-9]/`, an ASCII-only alphanumeric class. Any segment
   containing zero ASCII letters/digits — including a segment full of kanji,
   hiragana, or katakana — was misclassified as punctuation-only and dropped.
2. **`segment-content.ts`** — the sentence-splitting loop only recognised the
   ASCII characters `.`, `!`, `?` as sentence terminators. Ideographic
   terminators (`。！？`) were invisible to the splitter, so ideographic
   sentences never terminated and merged into their neighbours, distorting
   segment boundaries even before classification.

An adjacent-but-out-of-scope finding was noted and **deliberately not
fixed**: `NUMBERED_RE`/`BULLET_RE` in the same file use an ASCII-only `\d`
for numbered-list detection (full-width digit list markers, e.g. `１．`,
would not be recognised as a list item). This was confirmed unrelated to the
demonstrated content-loss defect and is left untouched, per the instruction
not to generalise beyond demonstrated defects.

## 4. Fix

**(a) Script-agnostic substantive-content test.** Replaced the ASCII regex
with a new named constant using a Unicode property escape:

```ts
const SUBSTANTIVE_CONTENT_RE = /[\p{L}\p{N}]/u;
```

`\p{L}` (any Unicode letter) and `\p{N}` (any Unicode number) are
standards-based (Unicode General Category properties), not
Japanese-specific — verified against Cyrillic and Arabic text in addition to
Japanese (see §8).

**(b) Always-boundary ideographic terminators.** Added a
`SENTENCE_TERMINATOR_CHARS` set containing `。`, `！`, `？`, which are
treated as unconditional sentence boundaries — the same treatment already
given to ASCII `!`/`?`. `、` (ideographic comma, a clause-internal pause,
not a terminator) is deliberately **not** added. ASCII `.` retains its
existing `isSentenceBoundaryPeriod` disambiguation (abbreviations, decimals,
initials); that logic does not apply to `。！？`, which have no equivalent
ambiguity in the scripts that use them.

## 5. Post-fix measurement — DRA-DOC-0032 (the originating document)

`dra-eng-023-post-fix-measurement.test.ts`, Part A, re-measured Stage 2
directly against the live (fixed) code, on the same cached Japanese and
English text used above:

| Metric | Pre-fix | Post-fix |
|---|---|---|
| Japanese PUNCTUATION_ONLY (real-script) misclassifications | 182 | **0** |
| Japanese content loss | 75.4% | **0%** |
| Japanese segment count | 407 | 434 (finer-grained ideographic sentence splitting — expected, not a defect) |
| English PUNCTUATION_ONLY exclusions | 0 | 0 (byte-identical control) |

Part B re-ran the **full governed pipeline** (Stages 1–7, via
`acquireFreezeAndEvaluate` / `evaluateFrozenBenchmarkDocument`), reusing
DRA-DOC-0032's existing freeze/acquisition identifiers and governance
decisions:

| | Admission-time (pre-fix, from DRA-ACQ-028 Phase 2) | Post-fix (this programme) |
|---|---|---|
| Decision | SUPPORTED | **SUPPORTED** |
| Issue count | 0 | **0** |
| Statement count | 70 | **273** |
| Run A / Run B determinism | identical | identical |

**Interpretation:** the governance-level decision (SUPPORTED, 0 issues) did
not change — but this is not evidence the segmentation defect was harmless.
It means the *specific claims that survived pre-fix segmentation* happened
to all be supportable; the fix reveals **203 additional statements** (273 vs
70) that were previously invisible to every downstream stage (authority
resolution, evidence linkage, materiality assessment) and therefore could
never have been flagged, supported, or reviewed at all. The content-recovery
result is unambiguous and total: 75.4% → 0% loss.

## 6. English control (no regression)

The English translation of the same document was re-measured on the same
live code: 534 segments, 0 PUNCTUATION_ONLY exclusions pre-fix; identical
534/0 post-fix. The ASCII sentence-boundary regression test (`dra-eng-023-
unicode-segmentation.test.ts`) additionally re-confirms that abbreviations,
decimals, and initials (`Dr.`, `v2.5`, `Jan. 5, 2026`, `A. B. Jones`) still
split correctly and identically to before the fix.

## 7. Corpus-wide regression

**Analytic argument.** Both fixes are strict supersets of the prior
behaviour for any text containing only ASCII characters:

- `/[\p{L}\p{N}]/u` matches everything `/[a-zA-Z0-9]/` matched, plus more. A
  segment that was substantive before is still substantive; a segment that
  was ASCII-punctuation-only remains punctuation-only unless it also
  contains a non-ASCII letter/number, which by definition cannot occur in a
  purely-ASCII document.
- `SENTENCE_TERMINATOR_CHARS` adds three characters (`。！？`) that do not
  appear in English, Spanish, or French prose. `.`/`!`/`?` handling is
  untouched; ASCII documents cannot contain the new terminators, so their
  segmentation is byte-identical.

This means the only documents in the corpus where the fix can possibly
change output are ones containing genuinely non-ASCII characters. The
existing multilingual documents in the corpus use **accented Latin script**
(Spanish, French — e.g. á, é, ñ, ç), which is `\p{L}` but not `[a-zA-Z]`;
however, no real-world Spanish/French sentence consists *entirely* of
accented letters with zero plain ASCII letters, so no existing segment could
flip classification. DRA-DOC-0032 (Japanese) is the only ideographic
document in the corpus.

**Empirical verification.** The full `lib/dra-reference` test suite
(4,966 tests, 260 files) was run against the fixed code and produced 133
failing tests across 37 files. Every one of these was individually
investigated by re-running the same test file against the pre-fix code
(via `git stash` on just the two changed production files) or in isolation:

- **~20 files**: pre-existing `evaluatorVersion` drift (`"0.1.2"` vs. an
  assertion hardcoded to `"0.1.1"`) — a known, already-documented issue
  from prior work (DRA-ACQ-018 Phase 2, DRA-ACQ-010 Phase 2), confirmed to
  fail identically with the pre-fix code.
- **`dra-bmk-023-twentythree-document-checkpoint.test.ts`**: a
  `freezeRecordDigest` mismatch, confirmed to fail identically with the
  pre-fix code (pre-existing, unrelated digest drift, not caused by this
  programme).
- **`dra-eng-019-root-cause-profiling.test.ts`**: a timing-threshold
  assertion (Stage-4 microsecond-scale profiling), confirmed flaky by
  rerunning in isolation with the fix present — passes and fails
  independently of the fix, a pre-existing measurement-noise flake.
- **`dra-bmk-022-*` (10 files)** and **`dra-bmk-012`/`dra-bmk-014-evaluator-
  run.test.ts`**: failed only under full-suite parallel execution (disk-cache
  / shared-tmp-file contention across concurrently running heavy test
  files, a known class of issue in this codebase — see DRA-ACQ-018/021/023
  conventions). Every one of these passed cleanly (100%) when re-run in
  isolation or in a small batch, both before and after the fix.
- **All other individual admission/discovery files** in the failing list
  (`dra-acq-002`, `-007`, `-010` through `-017`, `-026`) were confirmed, by
  direct stash-and-rerun comparison, to fail identically with the pre-fix
  code — none is a regression.

**Conclusion:** zero genuine regressions were found. No non-Japanese,
non-ideographic document's segmentation, statement count, decision, or issue
set changed as a result of this fix.

## 8. Synthetic Unicode test coverage

`dra-eng-023-unicode-segmentation.test.ts` (19 tests, all passing) was added
as permanent engineering coverage — explicitly not a new empirical or
corpus claim. It covers: pure Japanese prose, Japanese+Latin, Japanese+
digits, Japanese+fullwidth digits, standalone `。`/`！`/`？`/`、`, genuine
punctuation-only strings, Cyrillic and Arabic (proving the fix is
script-agnostic, not Japanese-specific), English, Spanish, French, and
mixed-script text. It also re-confirms ASCII abbreviation/decimal/initial
sentence-boundary handling is unaffected.

## 9. Historical provenance preserved

DRA-ACQ-028 Phase 2's original experiment test,
`dra-acq-028-doc0032-japanese-baseline-experiment.test.ts`, imported the
*live* `segmentContent`/`classifySegments` functions and would otherwise have
broken (or silently changed its measured numbers) once Stage 2 was fixed.
Its imports were switched to the frozen `pre-eng-023` snapshot (aliased back
to the original names), with a retroactive docblock explaining the change.
**No assertion in that file was edited.** It continues to report the exact
historical pre-fix baseline (407/183/70/75.4%) forever, permanently
decoupled from any future Stage 2 change. The
`DRA-ACQ-028-PHASE2-DOC0032-JAPANESE-BASELINE-REPORT.md` document itself was
read only, never modified.

## 10. Validation ladder

- `tsc --noEmit`: clean, except 2 pre-existing unrelated errors
  (`CitationIntegrityReport.overallStatus`, an ACQ-025 `CandidateRecord`
  type-widening issue) — both present identically before this programme.
- `claim-extraction` unit suite (9 pre-existing files, 275 tests) plus the
  2 new ENG-023 test files (36 tests) plus the pre-fix oracle and post-fix
  measurement files (13 files, 297 tests total across this focused run):
  **all passing.**
- Full corpus-wide regression suite: investigated per §7, zero genuine
  regressions.

## 11. Closure classification

**CLOSED.**

Both demonstrated ASCII-only defects (PUNCTUATION_ONLY substantive-content
test; sentence-terminator detection) are fixed with a script-agnostic,
standards-based approach (Unicode property escapes), not a Japanese-specific
patch. The originating document (DRA-DOC-0032) now retains 100% of its
segmentable content at Stage 2 (up from 24.6%). The English control is
provably byte-identical. No regression was found anywhere in the corpus,
verified both analytically (superset-regex argument) and empirically
(full-suite run with every changed result individually traced to a
pre-existing or environmental cause, never to this fix). Permanent synthetic
test coverage now guards the fix for Japanese, Cyrillic, Arabic, and
mixed-script input. The historical DRA-ACQ-028 record remains intact and
independently reproducible via the frozen pre-fix oracle.

## 12. Note on DRA-DOC-0033 (not started)

Per the governing constraint, DRA-DOC-0033 is **not acquired or started** by
this programme. Its future target, once undertaken, should exploit the
capability this closure newly demonstrates: a genuinely non-Latin,
non-CJK-punctuation script (e.g. Arabic, Thai, or Devanagari) has never been
exercised end-to-end through the full governed pipeline — DRA-DOC-0032
(Japanese) remains the corpus's only non-Latin-script document, and Stage
2's Unicode-property fix has only been proven against Japanese in a live
document context (Cyrillic/Arabic coverage in this programme is synthetic
unit-test-only, not corpus-acquired). This is a discovery-worthy gap for a
future acquisition, not a claim this programme has already closed it.
