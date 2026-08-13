# DRA-ACQ-029 — Phase 1: Candidate Discovery and Qualification for DRA-DOC-0033

**Status: QUALIFIED — Recommended primary candidate identified, one alternate qualified, six candidates rejected and recorded.**

## 1. Purpose and hard boundary

DRA-ACQ-028 (discovery) and DRA-ENG-023 (Unicode-aware segmentation/tokenisation closure) established that DRA's
pipeline generalises to at least one non-Latin script — Japanese CJK, admitted as DRA-DOC-0032 — after a genuine
gap (a script-blind `PUNCTUATION_ONLY` regex and a Latin-only sentence-terminator set) was found and fixed. This
programme is an **out-of-family robustness test**: does the ENG-023 fix generalise to script families CJK does
not exercise, or was it narrowly tuned to CJK's specific properties (left-to-right, no inter-word whitespace,
ASCII-shaped fullwidth punctuation, no letter-joining, no case distinction)?

This is Phase 1: **discovery and qualification only**. Per the governing directive, this phase:

- does **not** create, freeze, admit, or evaluate DRA-DOC-0033;
- does **not** modify any production code — segmentation, classification, normalisation, or any Stage 1-7 logic
  — even where a concrete defect is identified (see §4, the Devanagari danda finding);
- does **not** fix any discovered defect;
- does **not** reopen DRA-ENG-023.

The corpus holds 32 admitted documents (DRA-DOC-0001 through DRA-DOC-0032) before this acquisition. The next
reserved corpus ID is `DRA-DOC-0033`.

## 2. Script-family framing and ranking

The ENG-023 evidence base covers exactly one non-Latin script family (CJK). Three genuinely distinct,
un-exercised script families were considered:

| Rank | Script family | Key property untested by CJK | Outcome |
|---|---|---|---|
| 1 | **Devanagari / Indic (Brahmic abugida)** | Conjunct/matra composition; native danda (।/॥) sentence punctuation | **Candidate qualified** |
| 2 | Arabic / Hebrew (right-to-left abjads) | Right-to-left directionality; Arabic's cursive letter-joining | No licence-qualified candidate found |
| 3 | Cyrillic | Case distinction, non-conjunct letterforms (smallest incremental value) | Qualified only as a low-risk fallback |

Twelve ranking criteria were used (the nine from DRA-ACQ-028 plus three added for this programme's specific
questions: directionality/joining-model diversity, structural suitability of the source PDF's text layer, and
licence-basis strength independent of publisher government status — the last motivated directly by a finding in
this programme, §5.3). Devanagari ranks first not because it is the theoretically sharpest test (Arabic/Hebrew's
directionality reversal arguably is) but because it is the only family for which a candidate satisfying every
other criterion — licence, ground truth, stability, falsifiability — could actually be found.

## 3. Primary candidate: Supreme Court of India judgment, official Hindi translation

**DRA-CAND-029-01** — a Supreme Court of India civil-appeal judgment, in its official Hindi translation, published
under the Supreme Court's Model Translation Programme via the Allahabad High Court's eLegalix e-SCR portal.

- **Script**: Devanagari (conjunct consonant clusters, dependent vowel signs/matras, virama, native danda ।/॥
  sentence punctuation, no case distinction, left-to-right and word-level whitespace-delimited).
- **Domain / type**: LEGAL / OTHER (the corpus schema has no dedicated court-judgment `DocumentType`).
- **Licence basis**: Indian Copyright Act, 1957, **s.52(1)(q)(iv)** — a statutory exemption excluding "any
  judgment or order of a court, tribunal or other judicial authority" from copyright, verified independently via
  multiple sources (SpicyIP commentary, Indian Kanoon's own public-domain reproduction practice, AdvocateKhoj's
  summary). This is a statutory public-domain-equivalent basis, structurally analogous to the already-accepted 17
  U.S.C. §105 precedent (DRA-DOC-0013, DRA-DOC-0024), and — critically — does not depend on any single agency's
  discretionary reuse policy (contrast §5.3).
- **Ground truth**: the English original is the sole legally authoritative text; the source PDFs carry an
  explicit official disclaimer that the Hindi rendering is provided only for the litigant's understanding and
  that English governs for all practical, official, and enforcement purposes — the same authoritative-
  original/convenience-translation pattern already relied on (but rejected on licence grounds) for the Bank of
  Israel and Central Bank of Jordan candidates, §5.
- **Accessibility**: the eLegalix per-judgment download endpoint returned real Hindi judgment text on direct
  fetch (2026-08-11, two SCJudgmentIDs sampled); no bot-blocking observed.
- **Explicit caveat — structural suitability**: Phase 1 reconnaissance observed **partial PDF text-layer
  corruption** (mismapped conjunct/ligature sequences) in some sampled eLegalix judgments, and independently in
  an unrelated Gazette-of-India bilingual PDF — consistent with known legacy non-Unicode-font-mapping issues in
  older Indian government PDF production. This is a source-side extraction risk, distinct from DRA's own
  segmentation/tokenisation logic, and could confound a Phase 2 experiment if not controlled for. **Phase 2 must
  select a specific judgment with an independently verified clean Unicode text layer** before freezing it
  (analogous to DRA-ACQ-025's pinned-fetcher caveat for byte-instability).

### Alternate: Bulgarian-language EU document (Cyrillic fallback)

**DRA-CAND-029-02**, `QUALIFIED_ALTERNATE` — a Bulgarian-language EU institutional document (specific instrument
not yet selected), reusing the EU's CC BY 4.0 institutional reuse policy already verified for DRA-DOC-0018 and
DRA-DOC-0020. Retained as a low-risk fallback per the governing script-preference order, not pursued further
because Cyrillic is expected to be the least differentiating of the three families (§2).

## 4. Empirical Phase 1 reconnaissance (H1/H2)

Per the Phase 1 hard boundary, no candidate document was fetched, frozen, or evaluated. However, H1 and H2 were
tested directly by running the real `segmentContent`/`classifySegments` functions (via a disposable, since-
removed vitest scratch test) against genuine fetched Devanagari prose from an official Supreme Court translated
judgment — not the eventual candidate document, but representative real-world text from the same source family.

- **H1 (substantive-content recognition) — CONFIRMED_NO_GAP.** All 15 real segments were classified; 0 were
  excluded as `PUNCTUATION_ONLY`, and a direct probe confirmed `/[\p{L}\p{N}]/u.test("१२३")` (Devanagari digits)
  is `true`. The ENG-023 fix's script-agnostic content check generalises cleanly to Devanagari, independently of
  the CJK evidence that motivated it.
- **H2 (sentence-boundary recognition) — GAP_CONFIRMED.** `SENTENCE_TERMINATOR_CHARS` in `segment-content.ts`
  does not include the Devanagari danda (**।**, U+0964) or double danda (**॥**, U+0965) — the script's own native
  sentence-terminator glyphs, used at the end of nearly every sentence in the fetched real text. A five-sentence
  Devanagari paragraph containing five internal dandas was returned by `segmentContent()` as a **single unsplit
  segment**. A second, related artefact was also observed: an ASCII period embedded in a Devanagari citation
  abbreviation ("एस.सी.आर.", the Hindi rendering of "S.C.R.") was **over-split** into three fragments, because
  the abbreviation-suppression heuristic has no Devanagari entries and Devanagari has no case distinction to
  trigger the existing lowercase-follows suppression rule. Neither defect is fixed in this phase.
- **H3 (directionality/cursive joining) — NOT_APPLICABLE_TO_SELECTED_SCRIPT.** Devanagari is left-to-right and
  word-level whitespace-delimited, so the Indic candidate does not exercise H3 at all. This remains a fully open
  question; no licence-qualified RTL candidate was found in this programme (§5).
- **H4 (conjunct/matra normalisation integrity) — NOT_YET_TESTED.** Visual inspection of the reconnaissance
  segments showed no replacement characters or mojibake, but no dedicated normalisation-level experiment isolated
  this as the tested variable; deferred to Phase 2's full `acquireFreezeAndEvaluate` run.

## 5. Rejected candidates

Six candidates were investigated and rejected, each recorded with a distinct reason rather than uniform
boilerplate (`lib/dra-reference/.../dra-acq-029-non-cjk-non-latin-script-discovery.ts`, `REJECTED_CANDIDATES`).

### 5.1 Arabic (four candidates, all rejected on licence grounds)
- **SDAIA AI Ethics Principles** (Saudi Arabia) — the document's own terms include explicit restrictive language
  ("may not reproduce without prior permission").
- **UAE National AI Strategy 2031** — u.ae's terms are usage-restrictions only, with no affirmative reuse grant;
  the document's dedicated host (ai.gov.ae) was Cloudflare-blocked during Phase 1 fetch attempts.
- **Central Bank of Jordan** bilingual corporate-governance regulation — a genuine bilingual Arabic/English
  parallel text with an "Arabic version shall prevail" precedence clause (structurally the closest RTL analogue
  to the Devanagari pattern ultimately selected), but no locatable explicit reuse licence.
- **Qatar** government copyright policy — explicitly restrictive on inspection, reinforcing rather than
  contradicting the pattern found across the other Arabic candidates.

### 5.2 Hebrew (one candidate, rejected on licence grounds)
- **Bank of Israel Banking Supervision circulars** — a strong structural candidate (explicit "only the Hebrew
  text is binding" disclaimer with an official same-publisher English convenience translation), but the
  boi.org.il terms-of-use page was unreachable during Phase 1 and no explicit reuse licence was found in the
  circular text itself.

### 5.3 Devanagari (one candidate, rejected — and a methodologically useful finding)
- **Reserve Bank of India Master Directions** (Hindi/English bilingual) — investigated as an alternative
  Devanagari source before the Supreme Court judgment candidate was selected. RBI's own disclaimer page was
  found to contain only liability disclaimers, **not** an affirmative reproduction licence — in explicit contrast
  to several other Indian government publishers (PIB, BIS, Income Tax India, Publications Division), each
  independently found during the same research pass to carry an explicit "may be reproduced free of charge...
  source acknowledged" copyright policy. **This heterogeneity within a single country's central government is
  recorded as a durable methodological finding**: publisher government status alone does not establish an
  affirmative reuse licence, and is the direct motivation for adding
  `LICENCE_BASIS_STRENGTH_INDEPENDENT_OF_PUBLISHER_GOVERNMENT_STATUS` as a ranking criterion in this programme
  (§2). The Supreme Court judgment candidate's statutory basis (s.52(1)(q)(iv)) sidesteps this heterogeneity
  entirely, since it does not depend on any single agency's discretionary policy.

## 6. Proposed Phase 2 scope (not executed)

Select a specific Supreme Court judgment with an independently verified clean Devanagari PDF text layer, locate
and fetch its official English original as an out-of-band ground-truth reference, then acquire, freeze, and
evaluate the Hindi translation as DRA-DOC-0033 under the existing, unmodified governed-acquisition pipeline.
Compare the evaluation output against the English original's independently-known statement/claim structure, and
explicitly measure whether the already-confirmed danda sentence-boundary gap has a **decision-level** impact
(BOUNDED, as with the shading/citation precedents at DRA-ENG-015/016) or a **material** one (as footnote-
flattening's prose-style-dependent impact showed at DRA-ACQ-020). Phase 2 must not modify segmentation,
classification, normalisation, or any Stage 1-7 rule — including the already-confirmed danda gap — even if a
material impact is found; any confirmed gap would be scoped to a separate, later engineering ticket, per the
ACQ-027 → ENG-020/021/022 precedent.

Explicitly out of scope for Phase 2: an Arabic/Hebrew (H3) experiment, since no licence-qualified RTL candidate
was found in this programme; and any reopening of DRA-ENG-023.

## 7. Verification

- `pnpm --filter @workspace/dra-reference exec vitest run src/benchmark/acquisition/discovery/__tests__/dra-acq-029-non-cjk-non-latin-script-discovery.test.ts` — 40 tests passed.
- `pnpm --filter @workspace/dra-reference exec vitest run src/benchmark/acquisition/discovery/__tests__/dra-acq-028-non-latin-script-discovery.test.ts` — 34 tests passed (no regression).
- `pnpm --filter @workspace/dra-reference exec tsc --noEmit` — no new errors introduced by this programme's files;
  two pre-existing, unrelated errors remain in `dra-acq-026-long-range-structural-robustness.test.ts` and
  `dra-acq-025-non-redundant-graphics-discovery.ts` (confirmed via `git diff` to be untouched by this programme).
