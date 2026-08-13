# DRA-ACQ-028 Phase 2 — DRA-DOC-0032 Japanese Non-Latin/Non-Whitespace Script Baseline Experiment

**Status:** COMPLETE
**Type:** Baseline acquisition/evaluation experiment (not an engineering programme)
**Document admitted:** DRA-DOC-0032 (Japanese original only)
**Reference material used, never admitted:** official English translation of the same guideline

---

## 1. Purpose and scope

Phase 1 (DRA-ACQ-028) identified a coverage gap: the 31-document corpus contained no
document written in a non-Latin, non-whitespace-delimited script. This Phase 2 experiment
closes that observational gap by admitting exactly one such document — the Japanese
original of the Cabinet Office's *"Guidelines Concerning the Assurance of Appropriateness
in the Research, Development and Utilisation of AI-Related Technologies"* — and using it
as a controlled baseline to test whether the DRA pipeline's Stage 1–7 machinery, which
was designed and validated exclusively against Latin-script documents, has any
script-specific blind spots.

This is **not** an engineering programme. No production code was modified. No
Japanese-specific logic was added anywhere in the pipeline. The English translation was
used strictly as a semantic reference for comparison and was never frozen, never admitted,
and never assigned a corpus/document ID (there is no DRA-DOC-0033).

## 2. Governance re-verification (independent of Phase 1)

Governance, licence, and stability were re-verified live rather than copied from Phase 1
notes:

- **Source landing page:** Cabinet Office (内閣府) AI guideline page,
  `https://www8.cao.go.jp/cstp/ai/ai_guideline/index.html` (confirmed live, 200 OK).
- **Exact file pairing confirmed:** the landing page hosts two distinct document pairs — the
  guideline itself (`ai_gl_2025.pdf`, Japanese, 538,281 bytes / `ai_gl_eng_20260116.pdf`,
  English, 255,422 bytes) and a separate, larger 概要 (overview/summary) pair. The
  guideline pair — matching Phase 1's sizing — is the one acquired.
- **Licence correction (material finding of this phase):** Phase 1 had cited the older
  "Government Standard Terms of Use (Version 2.0)" as the reuse basis. Live
  re-verification found the Cabinet Office's Japanese terms-of-use page now points to the
  **Public Data License (PDL) v1.0**, issued by the Digital Agency, Government of Japan, as
  the current successor licence. The stale English notice page (dated June 2023) was
  **not** relied upon. PDL v1.0's terms were read directly and confirmed materially
  CC-BY-equivalent: commercial use is permitted and attribution is required, with no
  field-of-use or share-alike restriction. The reuse **conclusion is unchanged** from Phase
  1 (admissible), but the **citation is corrected**. Licence basis is recorded as
  `OPEN_LICENCE` (a bespoke-but-CC-BY-equivalent government licence), consistent with how
  OGL and other national government licences are already categorised elsewhere in the
  corpus, rather than `CREATIVE_COMMONS_BY` (which is reserved for licences that are
  literally the Creative Commons instrument).
- **Byte stability:** two independent live fetches of the Japanese PDF, minutes apart,
  produced an identical SHA-256 digest
  (`29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0`), 538,281 bytes,
  `Last-Modified: 2025-12-19` → **BYTE_STABLE**.
- **English translation** was fetched once for reference purposes only (SHA-256
  `e16ebd6c16688d5348ce08bf782f7c7d26e4809b0c3010ae6b54bd612694ee3b`, 255,422 bytes). The
  document explicitly self-labels **"【Provisional translation】"** — it is not a certified
  equivalent and is treated throughout this report as an approximate semantic reference,
  not ground truth.

## 3. Admission, freeze, and identifiers

DRA-DOC-0032 was admitted through the full unmodified governed pipeline
(`acquireFreezeAndEvaluate`), executed twice (Run A via the full pipeline, Run B via
`evaluateFrozenBenchmarkDocument` against the frozen inputs) to test determinism.

| Field | Value |
|---|---|
| Corpus document ID | `DRA-DOC-0032` |
| Freeze record ID | `DRA-FRZ-000026` |
| Acquisition ID | `DRA-ACQ-000035` |
| Domain / type / difficulty | GENERAL / POLICY / HIGH |
| Language | `ja` |
| Source digest (SHA-256) | `29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0` |
| Normalised-text digest | `7f755338c736a878a57407c33681200b34894fc83090dc9903d0ff6396cd24d3` |
| Metadata digest | `accbdc70da89e2d909f173e553a43f164e21738a3aa464e24bab4b3c4ecf0101` |
| Manifest digest (32-document corpus) | `b2d8c8b839c146f02fefeb9df4d209eb99db29acc425043993f10ad3aa42fe38` |
| Corpus size after integration | 32 documents |

**Freeze-integrity regime:** the freeze record was verified to carry
`freezeIntegritySchemaVersion === "dra-freeze-integrity-v2"` (the ENG-022 V2 versioned
`freezeRecordDigest` regime), confirming the current production freeze-integrity cutover
applies uniformly regardless of source-document script — no separate code path exists or
was needed.

**Currentness:** no currentness assessment was supplied for this acquisition, consistent
with every other acquisition in the corpus. Admission proceeded normally under the
documented currentness-UNKNOWN default (ENG-020/021/022), with no admission-blocking
behaviour observed and no changes needed to that closed code.

**Determinism (Run A vs Run B):** decision, statement count, issue count, issue classes,
and substantive digest all matched exactly between the full-pipeline run and the
frozen-input re-evaluation.

| | Run A | Run B |
|---|---|---|
| Decision | SUPPORTED | SUPPORTED |
| Statement count | 70 | 70 |
| Issue count | 0 | 0 |
| Substantive digest | `91086dded45ded6ac4f3208d9be93d803704508905364ff9b3e03cbbf4ba0824` | (identical) |
| Proof receipt integrity | true | true |

Executable evidence: `dra-acq-028-doc0032-japanese-admission.test.ts` (passing).

## 4. Representation-boundary inspection

A dedicated inspection (`dra-acq-028-doc0032-japanese-baseline-experiment.test.ts`) ran the
pipeline's own unmodified `segmentContent()` / `classifySegments()` functions directly
against the extracted Japanese text, and against the English translation as a same-method
contrast, to localise any defect to a specific pipeline layer.

### 4.1 Extraction layer (pdftotext) — materially intact

- `pdftotext -layout` (the same invocation used for every prior acquisition; no
  Japanese-specific flag or fallback was used) extracted the document faithfully: kanji,
  hiragana, katakana, ideographic punctuation, and full-width Latin (e.g. "ＡＩ") are all
  present in the output text.
- **Extraction-layer artifact (observed, not fixed):** `-layout` mode injects a large
  amount of spurious ASCII whitespace while reconstructing the PDF's multi-column layout —
  1,753 spaces in `-layout` mode versus 130 in plain mode for the same document. This is a
  column-reconstruction artifact of `-layout`, not a script-specific defect (the same
  behaviour would occur for any multi-column Latin-script PDF). Per house convention
  (identical extraction method for every acquisition, no per-document special-casing), the
  acquisition retained `-layout`; this finding is recorded here for completeness, not
  corrected.
- **Conclusion:** extraction is **not** the locus of the material findings below. A
  hypothesis of extraction-only failure is **rejected**.

### 4.2 Segmentation layer — sentence-boundary blindness (H3)

`segmentContent()` / `splitLineIntoSentences()` recognise only ASCII `.`, `!`, `?` as
sentence terminators and process text line-by-line from the PDF's physical line breaks.
Japanese uses `。` (ideographic full stop) and `、` (ideographic comma), which this code has
**no representation of at all**.

- The extracted Japanese text contains 94 ideographic full stops (`。`) but the segmenter's
  terminator check recognises **0** ASCII sentence terminators in that same text.
- Effect: real, multi-line Japanese sentences are never re-joined across the PDF's
  incidental line-wrap boundaries. Segment boundaries default to wherever `pdftotext`
  happened to break a line, not to actual sentence boundaries. A directly-probed sample
  showed one genuine sentence fragmented into roughly nine separate short segments (29–33
  average characters each, versus 66.5 average characters for equivalent English segments).
- **This is a genuine, reproducible SEGMENTATION-layer defect** — confirmed with executable
  evidence, without modifying the segmenter.

### 4.3 Classification layer — PUNCTUATION_ONLY script blindness (H4, the decisive finding)

`classifySegments()`'s `PUNCTUATION_ONLY` exclusion rule tests a segment's text against
`/[a-zA-Z0-9]/` and discards the segment if that ASCII-only pattern finds no match — on the
documented rationale that a segment with "no alphabetic or numeric characters" is
presumably decorative punctuation, not content.

This check is **script-blind**: it recognises ASCII Latin letters and Arabic digits as "the
alphabet," and nothing else. A segment consisting entirely of kanji, hiragana, or katakana
— with no incidental embedded ASCII digit or Latin letter — contains **zero** characters
this regex treats as alphanumeric, and is therefore classified as `PUNCTUATION_ONLY` even
though it is ordinary, complete, substantive prose.

Direct measurement on the frozen Japanese text:

| | Count |
|---|---|
| Total segments (Japanese) | 407 |
| Excluded as `PUNCTUATION_ONLY` | 183 |
| ...of which contain real Japanese-script text (misclassified) | 182 |
| ...of which are genuinely decorative (correctly excluded) | 1 |
| Retained as `CANDIDATE` (→ Stage 2 statements) | 70 |
| Japanese-script characters in misclassified excluded segments | 5,002 |
| Japanese-script characters retained in candidate segments | 1,636 |
| **Proportion of Japanese-script content lost to this misclassification** | **75.4%** |

**Controlled contrast (same method, English translation of the same document):**

| | Japanese | English (reference) |
|---|---|---|
| Total segments | 407 | 534 |
| `PUNCTUATION_ONLY` exclusions | 183 | **0** |
| Candidates (→ statements) | 70 | 316 |

The English translation of the identical document, run through the identical unmodified
classifier, produces **zero** `PUNCTUATION_ONLY` exclusions. This is a clean,
same-document, same-method contrast: the defect is specific to non-Latin script, not to
this particular document's structure, length, or content.

**Consequence for the admission result:** the 70 statements the frozen pipeline actually
evaluated for DRA-DOC-0032 are heavily biased toward table-of-contents entries, dated
headers, and numbered-clause fragments that happen to contain an incidental ASCII digit —
not the guideline's substantive normative body prose, three-quarters of which (by character
volume) never reached Stage 2 statement construction, let alone Stages 3–7. The
`SUPPORTED / 0 issues` decision recorded in Section 3 should be read in this light: it
reflects a genuine, deterministic pipeline run, but over a corpus of statements that
substantially under-represents the document's actual normative content.

### 4.4 Metadata layer — word-count metric mismatch (H2, narrow/scoped)

`computeWordCount()` (in `metadata.ts`) splits on `/\s+/`. Japanese does not use
inter-word whitespace, so this produces a number close to a *line count*, not a *word
count*, for the reported `wordCount` metadata field. This is a metadata/reporting-layer
observation only — `wordCount` is not consumed by Stages 2–7 of the evaluation itself, so
it does not affect the decision, statements, or issues produced. Recorded as a known
limitation, not corrected.

### 4.5 Other observations

- Full-width Latin characters (e.g. "ＡＩ" for "AI") appear throughout the Japanese text as
  legitimate embedded terminology; these are Unicode fullwidth forms, not ASCII, so they
  do **not** rescue a segment from the `PUNCTUATION_ONLY` check either.
- No evidence of "giant merged block" segmentation was found — the opposite occurred
  (excessive fragmentation via 4.2), so the giant-token risk named in the original task
  framing did not materialise for this document.
- No content-loss was observed at the raw byte or character-extraction level; all loss
  identified above occurs after extraction, inside Stage 2's segmentation/classification
  logic.

Executable evidence for §4.2–4.4: `dra-acq-028-doc0032-japanese-baseline-experiment.test.ts`
(passing; console output captures all counts above).

## 5. Comparison against the official English translation

The English translation ("【Provisional translation】") was used as a controlled semantic
reference, never as a corpus member. Because the translation is explicitly non-certified,
the comparison below is framed as an approximate cross-check of representational parity,
not a claim about semantic-equivalence exactness.

- **Structural parity:** both documents share the same section numbering (１, ２, ３ /
  1, 2, 3), the same heading hierarchy depth, and equivalent cross-references (e.g. "Article
  13" appears in both; "AI Act" reference confirmed present in the Japanese original via a
  script-neutral spot check).
- **Representational asymmetry:** the English translation, run through the identical
  unmodified pipeline code, suffers **none** of the segmentation or classification defects
  found for the Japanese original (§4.2, §4.3). The same guideline, translated, is treated
  by the pipeline as ordinary, well-behaved input.
- **Candidate-statement yield:** English yields 316 candidate segments from 534 total;
  Japanese yields 70 candidate segments from 407 total. Even accounting for the
  translation's typical expansion in length relative to Japanese source text, this gap is
  far larger than length differences alone would predict, and is fully explained by §4.3.
- Representative categories named in the task spec (headings, normative statements,
  prohibitions/requirements, conditionals, lists, definitions, cross-references, numeric
  conditions, mixed Japanese/Latin terms) were spot-checked structurally (heading numbering,
  the AI Act reference, "Article 13", publisher name in kanji, mixed-script terms like
  "ＡＩガバナンス") and found present in the Japanese extraction; the material issue is not
  that this content is absent from the extracted text, but that most of it is discarded
  before Stage 2 statement construction, per §4.3.

## 6. Hypothesis evaluation (H1–H5)

| Hypothesis | Verdict | Basis |
|---|---|---|
| **H1** — No material script-specific defect exists | **REJECTED** | §4.3: a clean, same-document, same-method English-vs-Japanese contrast shows 75.4% Japanese-script content loss versus 0% for English, isolating a script-specific cause. |
| **H2** — Whitespace/tokenisation defect | **PARTIALLY CONFIRMED (narrow scope)** | §4.4: `computeWordCount()`'s `/\s+/` split is meaningless for Japanese, but this affects only reported metadata, not Stage 2–7 evaluation semantics. |
| **H3** — Sentence-boundary defect | **CONFIRMED** | §4.2: the segmenter recognises 0 of the document's 94 ideographic sentence terminators; segment boundaries default to incidental PDF line breaks rather than real sentence boundaries. |
| **H4** — Extraction defect | **REJECTED as extraction; CONFIRMED as classification** | §4.1: `pdftotext` extraction is faithful. §4.3: the *downstream* `PUNCTUATION_ONLY` classification check in `classifySegments()` is the actual, decisive, script-blind defect — this is the dominant finding of the experiment. |
| **H5** — Mixed/compound failure | **CONFIRMED** | Extraction is intact, but two independent, compounding Stage 2 defects (H3 sentence-boundary blindness, H4 script-blind punctuation classification) jointly determine what content reaches statement construction, with H4 by far the larger effect (75.4% content loss) and H3 degrading the granularity/coherence of what survives. |

## 7. Gap classification

Using the required enumeration, this experiment's outcome is classified as:

**`SEGMENTATION_TOKENISATION_GAP_DEMONSTRATED`**

Rationale: the dominant, quantitatively decisive defect (§4.3, 75.4% content loss, 0%
English-language occurrence rate for the identical check) sits squarely in Stage 2's
segmentation/classification logic (`classify-segments.ts`'s `PUNCTUATION_ONLY` rule), not
in extraction (§4.1, confirmed intact) and not in the evaluator's later reasoning stages
(3–7, which never see the discarded content and therefore cannot be blamed or credited for
it). The secondary sentence-boundary finding (§4.2) is in the same architectural layer
(Stage 2 segmentation). This is not classified as `COMPOUND_GAP_DEMONSTRATED` because both
confirmed defects live in the same pipeline layer (Stage 2 segmentation/classification)
rather than spanning genuinely separate layers (e.g. extraction *and* evaluator reasoning).

## 8. Quantitative summary (no false precision)

All figures below are exact counts from a single frozen document and its one reference
translation; they characterise this document's behaviour under the current pipeline and
should not be read as a general "X% of Japanese content is lost" rate across all possible
Japanese documents, layouts, or PDF structures.

- Japanese source: 538,281 bytes, PDF, BYTE_STABLE across 2 independent fetches.
- Extracted text (pdftotext -layout): 11,281 characters.
- Total Stage 2 segments: 407 (Japanese) vs. 534 (English translation, reference only).
- Segments retained as statement candidates: 70 (Japanese, 17.2% of segments) vs. 316
  (English, 59.2% of segments).
- `PUNCTUATION_ONLY` exclusions: 183 (Japanese) vs. 0 (English) — on the same document,
  same pipeline code.
- Of the 183 Japanese `PUNCTUATION_ONLY` exclusions, 182 (99.5%) contain genuine
  Japanese-script prose, not decorative punctuation.
- Japanese-script character loss to this single misclassification: 5,002 of 6,638 total
  Japanese-script characters across segmented content (75.4%).
- Ideographic sentence terminators (`。`) in the source: 94; recognised by the segmenter's
  terminator logic: 0.
- Final evaluator result on the 70 surviving statements: `SUPPORTED`, 0 issues, fully
  deterministic across two independent evaluation runs (identical substantive digest).

## 9. Remaining uncertainties

- This experiment covers exactly one document, one script family (Japanese, a mix of
  kanji/hiragana/katakana), and one PDF layout style. It does not establish how the
  `PUNCTUATION_ONLY` defect behaves on Chinese, Korean, Thai, Arabic, or other non-Latin,
  non-whitespace-delimited scripts, though the same ASCII-only regex would plausibly
  produce similar loss for any of them — this is inferred, not measured.
- The exact quantitative loss rate (75.4%) is specific to this document's mix of dated
  headers, TOC page numbers, and prose density; a document with fewer incidental ASCII
  digits embedded in its prose could see an even higher loss rate, and one with more
  Latin/numeric interleaving could see a lower one.
- The interaction between the two confirmed Stage 2 defects (H3, H4) and later Stage 5
  materiality/Stage 6 consistency logic on a *hypothetically fixed* segmentation was not
  measured (doing so would require modifying production code, which is out of scope for
  this experiment).
- Whether other non-ASCII scripts trigger different or additional defects in Stages 3–7
  (authority resolution regexes, evidence-linkage patterns, etc.) was not investigated here;
  this experiment's evidence is scoped to Stage 2.

## 10. Recommended next programme (not started)

A follow-on engineering programme should scope and fix the `PUNCTUATION_ONLY` classification
rule (and, ideally in the same programme, the sentence-boundary terminator set) to recognise
non-Latin scripts as containing "alphabetic content" — for example, testing for the presence
of any Unicode letter category rather than an ASCII-only character class, and adding
ideographic/other-script sentence terminators to the boundary-detection logic. This report
recommends such a programme; per this experiment's explicit boundary, **no such fix has been
made**, and DRA-DOC-0032 remains admitted and evaluated exactly as the current, unmodified
pipeline processes it.

## 11. Hard-boundary compliance confirmation

- No Japanese-specific (or any script-specific) logic was added to any production file.
- No DRA-DOC-0033 was created; the English translation was never frozen or admitted.
- The gap identified in §4.3/§4.4/§6/§7 is documented, not fixed.
- ENG-020/021/022 (currentness and freeze-integrity) code was not reopened or modified;
  their behaviour was only observed (§3) and confirmed sane under the UNKNOWN-currentness
  default.
- The Korean alternate candidate identified in Phase 1 was not touched.

## 12. Executable evidence index

- `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-028-doc0032-japanese-admission.test.ts`
  — governance re-verification, byte-stability determinism, admission, freeze (V2
  freeze-integrity), 32-document corpus integration, Run A/B determinism.
- `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-028-doc0032-japanese-baseline-experiment.test.ts`
  — representation-boundary inspection, English-translation contrast, H1–H5 evidence.
