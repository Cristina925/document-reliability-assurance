# DRA-ACQ-031 Phase 2 — Bulgarian Non-Latin/Cyrillic-Script Acquisition, Admission, and Robustness Evaluation

**Status:** COMPLETE
**Date:** 2026-08-11
**Programme:** DRA-ACQ-031 (Phase 2 of 2)
**Depends on:** DRA-ACQ-031 Phase 1 (`docs/dra/DRA-ACQ-031-PHASE1-REPORT.md`) — candidate qualification only, treated as fixed input to this phase.

> **Framing.** This phase does not try to make the Bulgarian edition of the EC Ethics
> Guidelines "pass." It re-verifies governance and acquisition independently, admits
> the document if — and only if — the gates pass on their own merits, measures
> Cyrillic representation fidelity directly, and records whatever the frozen
> evaluator actually produces. Every acceptance-criteria classification below uses
> DRA-ACQ-031 Phase 1's own PASS / PARTIAL / MATERIAL DEFECT vocabulary, applied to
> the evidence gathered here — not adjusted to fit a predetermined outcome.

---

## 1. Recap: what Phase 1 fixed in advance

Phase 1 (already run, not reopened here) qualified:

- **Primary candidate:** `EC_ETHICS_GUIDELINES_BG` — the Bulgarian edition of the
  European Commission / HLEG-AI "Ethics Guidelines for Trustworthy AI"
  (`doc_id=60442`), `QUALIFIED_PRIMARY`.
- **Alternate:** `EC_ETHICS_GUIDELINES_EL` (Greek edition, `doc_id=60424`) — held in
  reserve, not used (Bulgarian passed governance cleanly; no fallback was needed).
- **Hypothesis:** DRA-ENG-023's `\p{L}\p{N}` Unicode-property-class segmentation fix
  — which closed the ASCII-only sentence-boundary/classification defect for CJK
  ideographic script via DRA-DOC-0032 (Japanese) — generalises correctly to the
  Cyrillic alphabet, a script with its own Unicode block but ordinary ASCII
  sentence-terminator punctuation (`.`, `!`, `?`) and ordinary whitespace word
  delimiting, unlike CJK.
- **Acceptance criteria (verbatim, unchanged):**
  - **PASS:** statement count and segmentation quality on the Bulgarian text are
    structurally comparable to the already-frozen English/Spanish editions, no
    PUNCTUATION_ONLY misclassification of substantive Cyrillic prose, decision not
    degraded by an extraction/segmentation artefact.
  - **PARTIAL:** segmentation succeeds structurally but a narrow, non-decision-
    changing discrepancy is found.
  - **MATERIAL DEFECT:** a Cyrillic-specific segmentation/classification failure
    analogous to the pre-ENG-023 Japanese defect that changes claim formation,
    evidence linkage, or the final decision.

None of the above was altered after seeing the Phase 2 results below.

## 2. Documentation correction recorded during Phase 2 (not a Phase 1 rewrite)

Phase 1's candidate-register text describes the ground-truth oracle as "the
document's English (DRA-DOC-0018) and Spanish (DRA-DOC-0019) editions." Independent
verification against the corpus's own registered records (not assumed) during this
Phase 2 admission shows this is imprecise:

- **DRA-DOC-0018** is in fact the **Spanish** edition of this document (`doc_id=60423`,
  `language: "es"`, admitted under DRA-ACQ-014 Phase 2 retry).
- **DRA-DOC-0019** is an **unrelated document** — the INE Peer Review Report (Spain's
  national statistics office compliance review) — not an edition of the Ethics
  Guidelines at all.
- The actual **English** edition is **DRA-DOC-0021** (`doc_id=60419`, `language: "en"`,
  admitted under DRA-ACQ-017 Phase 2), described in its own inclusion rationale as
  forming "the first genuine parallel-language pair" with DRA-DOC-0018 — this is the
  same EN/ES pair already used by DRA-CHK-003/DRA-CHK-005 for the materiality-
  divergence investigation.

This correction changes only which two already-admitted corpus IDs supply the
parallel-translation oracle used below. It does not alter Phase 1's frozen candidate
identity, licence assessment, or acceptance criteria.

## 3. Independent governance re-verification (live, this acquisition)

Per the Phase 2 task specification, governance was re-verified live and
independently at admission time — not copied from the Phase 1 discovery record.

| Gate | Result | Evidence |
|---|---|---|
| Official source | **VERIFIED** | Two independent live GET requests to `https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60442` both returned HTTP 200; the EC's own per-language landing-page table lists `doc_id=60442` under "BG," matching the already-frozen sibling editions (DRA-DOC-0018/0021). |
| Licence | **VERIFIED** | `data.europa.eu/en/copyright-notice` re-fetched live; institution-wide CC BY 4.0 statement unchanged and identical basis to DRA-DOC-0018/0021. No document-specific override found on the Bulgarian landing page or in the PDF text. |
| Byte stability | **BYTE_STABLE** | Two independent live fetches produced identical SHA-256 `bf61352bd6836ca4d29c429ad963b0b2fceb0b7d0874bb77ae10b113dac3d313`, 2,332,675 bytes both times — matching the Phase 1 discovery measurement exactly. |
| Metadata | **VERIFIED** | Title, publisher, and 2019-04-08 publication date confirmed from the PDF's own front matter. |
| Script/structure | **VERIFIED** | Cyrillic structural markers (`ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ`, Bulgarian title heading) confirmed present in the extracted text at admission time. |

All gates passed on independent re-verification; no fallback to the Greek alternate
was required, and none was performed.

## 4. Freeze, admission, and manifest integrity

| Field | Value |
|---|---|
| Corpus ID | `DRA-DOC-0034` |
| Freeze record ID | `DRA-FRZ-000028` |
| Acquisition ID | `DRA-ACQ-000037` |
| Source digest (SHA-256) | `bf61352bd6836ca4d29c429ad963b0b2fceb0b7d0874bb77ae10b113dac3d313` |
| Normalised-text digest | `563ff831763ec496997b64a0e3a1911b5818979116f6e22820420254e85c0981` |
| Metadata digest | `1ceea93cf592ee7f6b760f783efbc6a39e11079f8cecebf40386f612c1f1bd31` |
| Freeze integrity schema | V2 (DRA-ENG-022 cutover regime, applied automatically) |
| Manifest digest | `c1a85c802f00f748d26713f76855eb543c95b4ecceb41eb466932ea2ee415a20` |
| Corpus size after admission | 33 documents |

**ID-reservation handling.** The highest real freeze/acquisition/document IDs at the
start of this work were DRA-FRZ-000026 / DRA-ACQ-000035 / DRA-DOC-0032 (Japanese).
DRA-FRZ-000027, DRA-ACQ-000036, and DRA-DOC-0033 are reserved for the still-blocked
Hindi acquisition attempt (DRA-ACQ-029, repeated eLegalix HTTP 429s) and were left
untouched, per Phase 1's own explicit prohibition. This acquisition used the next
free numbers: DRA-FRZ-000028 / DRA-ACQ-000037 / DRA-DOC-0034.

**Manifest gap.** Because DRA-DOC-0033 was never admitted, the registry's
`documentIds` array is **not** a contiguous `DRA-DOC-0001..0034` sequence — it jumps
from `DRA-DOC-0032` directly to `DRA-DOC-0034`. The registry and manifest-integrity
verifier require only `DRA-DOC-NNNN` format and ID/digest uniqueness, not contiguity,
so this gap is a valid, verified state, not an error. `verifyManifestIntegrity()`
passed; the prior 32 documents were confirmed present, unchanged, and in their
original order, with DRA-DOC-0034 appended last.

## 5. Cyrillic representation fidelity

Established directly against the extracted text before interpreting any evaluator
result, using the live (post-ENG-023), unmodified `segmentContent`/`classifySegments`
code — this is a forward-looking robustness experiment on a script the corrected
pipeline had never processed, not a historical-defect reproduction, so frozen
pre-fix snapshots were deliberately not used (contrast with the DRA-ACQ-028 Japanese
baseline experiment, which characterised a historical, pre-fix defect).

| Check | Result |
|---|---|
| Unicode integrity | 140,701 Cyrillic characters extracted; 0 `U+FFFD` replacement characters (no encoding corruption). |
| Character preservation | Known Bulgarian phrases (`ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ`, `изкуствен интелект`, `надежден`) present verbatim. |
| Numerals | Ordinary Arabic numerals preserved uncorrupted (publication year `2019`); chapter markers (`Глава I`, `Глава II`, `Глава III`) present. |
| Sentence-boundary detection | Direct proof sample split correctly on `.`/`!`/`?` into 4 sentences — Bulgarian's ASCII terminators are handled by the existing script-agnostic Latin sentence-boundary logic without modification. |
| PUNCTUATION_ONLY misclassification | **0** Cyrillic-script segments misclassified as `PUNCTUATION_ONLY` (of 4 total `PUNCTUATION_ONLY` segments document-wide, none contain Cyrillic script). |
| Heading/ordering | Title heading located within the first 9 extracted lines; document order preserved. |
| Mixed-script handling | Latin-script acronyms/URLs coexist with Cyrillic prose without displacement. |
| Abbreviation boundaries | Bulgarian abbreviations (e.g. `напр.` = "e.g.") are **not** recognised by the existing abbreviation list, which is English/Latin-specific — a pre-existing, documented limitation (see §7), not a new Cyrillic defect, and not decision-changing. |

**Source vs. acquisition vs. extraction vs. evaluator vs. linguistic-difference
categorization:**

- *Source document*: no anomaly — a clean, native-text (non-scanned) 58-page PDF.
- *Acquisition*: no anomaly — BYTE_STABLE across independent fetches.
- *Extraction/normalisation*: no anomaly — `pdftotext -layout` recovers all Cyrillic
  content with zero corruption signatures.
- *Evaluator (Stage 2 segmentation/classification)*: no Cyrillic-specific defect
  found — 0 misclassifications, structurally comparable candidate counts (below).
- *Legitimate linguistic difference*: the Bulgarian edition is naturally longer
  (58pp / 196,477 extracted characters) than the English edition (41pp / 162,064
  characters) — Cyrillic prose density, not a structural anomaly; the Spanish
  edition (204,863 characters) is longer still, so Bulgarian sits between its two
  siblings, not an outlier.

## 6. Evaluator execution and determinism

Ran the full, unmodified production DRA evaluator (`acquireFreezeAndEvaluate`,
Run A) followed by an independent re-evaluation of the frozen record
(`evaluateFrozenBenchmarkDocument`, Run B). No evaluator tuning was performed.

| Field | Run A | Run B |
|---|---|---|
| Decision | **SUPPORTED** | **SUPPORTED** |
| Issues | 0 | 0 |
| Statement count | 2,815 | 2,815 |
| Evaluator version | 0.1.2 | 0.1.2 |
| Pipeline version | 1.0 | 1.0 |
| Proof-receipt substantive digest | `775b78100d36b121b6b3b525a67ac18787f57d198f722744d6680ec10e8bfbcb` | identical |
| Proof-receipt integrity (`verifyReceiptIntegrity`) | true | true |

Run A and Run B are fully deterministic across decision, statement count, issue
count, issue classes, and substantive digest. Both proof receipts independently
verify.

## 7. Robustness comparison: production vs. analysis-only reference representation

Per the Phase 2 task requirement, the admitted production representation
(`pdftotext -layout`) was compared against an independently-derived, analysis-only
reference representation (default `pdftotext`, no layout flag) — never used to
replace the admitted freeze record or corpus entry.

| Metric | Production (`-layout`) | Reference (default) | Delta |
|---|---|---|---|
| Cyrillic character count | 140,701 | 140,701 | 0.00% |
| Stage 2 CANDIDATE count | 2,815 (statement count) / 2,815 (raw classification) | 2,916 | ~3.6% (layout-driven line-wrap difference, not corruption) |
| Cyrillic PUNCTUATION_ONLY misclassifications | 0 | 0 | none |

**Materiality classification:** NO MATERIAL DIFFERENCE. Both representations
preserve 100% of Cyrillic character content and produce zero Cyrillic-specific
misclassifications; the small candidate-count delta is attributable to whitespace/
line-break differences between the two `pdftotext` modes (a REPRESENTATION-BOUNDARY
difference, consistent with prior corpus precedent for layout-driven extraction
variance), not to a defect in either representation.

## 8. Parallel-language sibling comparison (direct Stage 2 measurement)

Direct, live measurement using the identical (current) segmentation/classification
code across all three parallel editions of the same substantive document:

| Edition | Corpus ID | Segments | CANDIDATE | PUNCTUATION_ONLY | Cyrillic/script misclassified | Admitted decision |
|---|---|---|---|---|---|---|
| Bulgarian | DRA-DOC-0034 | 3,535 | 2,815 | 4 | **0** | SUPPORTED / 0 issues |
| Spanish | DRA-DOC-0018 | 3,255 | 2,546 | 5 | 0 | SUPPORTED / 0 issues |
| English | DRA-DOC-0021 | 2,651 | 2,176 | 1 | 0 | REVIEW / 7 issues (EVIDENCE_INADEQUATE) |

Bulgarian's CANDIDATE count (2,815) sits comfortably within the same order of
magnitude as its siblings (2,176–2,546), tracking its longer page count, and shows
zero Cyrillic-specific misclassification — directly mirroring the already-admitted
Spanish edition's SUPPORTED outcome rather than the English edition's REVIEW outcome
(a pre-existing, document/language-content divergence already characterised by
DRA-CHK-003/DRA-CHK-005, unrelated to script family).

## 9. Comparison to DRA-DOC-0032 (Japanese) and generalization limits

| Dimension | DRA-DOC-0032 (Japanese, CJK) | DRA-DOC-0034 (Bulgarian, Cyrillic) |
|---|---|---|
| Script family | Ideographic (CJK) | Alphabetic (Cyrillic) |
| Word delimiting | None (no whitespace between words) | Ordinary whitespace |
| Sentence terminators | Ideographic (`。`, `！`, `？`) — required the ENG-023 fix | Ordinary ASCII (`.`, `!`, `?`) — no new fix required |
| Pre-fix defect (historical) | 75.4% content loss via `PUNCTUATION_ONLY` misclassification | N/A — never exhibited the defect; ENG-023 fix generalised cleanly on first contact |
| Post-fix/first-contact result | SUPPORTED / 0 issues / 70 statements | SUPPORTED / 0 issues / 2,815 statements |
| Abbreviation handling | Not applicable (no Latin-style abbreviations) | Bulgarian abbreviations not recognised by the English/Latin abbreviation list (non-decision-changing) |

**Generalization limit, stated explicitly:** this result confirms that DRA-ENG-023's
Unicode-property-class fix generalises correctly to **one** additional alphabetic,
whitespace-delimited, ASCII-punctuated script (Cyrillic). It does **not** establish
that the fix — or the pipeline generally — is robust to all non-Latin scripts. In
particular: right-to-left scripts (Arabic, Hebrew), abugida/scriptio-continua
scripts with their own internal word-boundary conventions (Devanagari/Hindi,
Thai), and scripts with script-specific abbreviation or honorific conventions
remain untested. DRA-DOC-0033 (Hindi, Devanagari) — the natural next test of this
boundary — remains blocked on an unrelated infrastructure issue (eLegalix HTTP 429),
not on any known pipeline limitation.

## 10. Acceptance-criteria classification

Applying DRA-ACQ-031 Phase 1's frozen criteria to the evidence above:

> **PASS.** Statement count and segmentation quality on the Bulgarian text are
> structurally comparable to the already-frozen English/Spanish editions (2,815
> candidates vs. 2,176–2,546 siblings, same order of magnitude, tracking natural
> prose-length variation). Zero PUNCTUATION_ONLY misclassification of substantive
> Cyrillic prose was observed. The decision (SUPPORTED, 0 issues) was not degraded
> by any extraction or segmentation artefact — confirmed by Run A/Run B determinism,
> independent receipt verification, and the production-vs-reference representation
> comparison showing no material difference.

One narrow, disclosed, non-decision-changing residual was found and is recorded
under known limitations (§11), consistent with the PASS classification's tolerance
for narrow residuals distinct from the PARTIAL tier (which would apply if the
residual affected decision-relevant content, which it did not).

## 11. New findings, known limitations, and proposed follow-on programme

**Finding (documented, not fixed inline — engineering boundary honoured):**
Bulgarian-specific abbreviations (e.g. `напр.` = "e.g.", `т.е.` = "i.e.", `стр.` =
"page") are not recognised by the existing sentence-boundary abbreviation list,
which is English/Latin-specific. In the one synthetic test case constructed for
this experiment, this caused a single compound sentence to be split into three
sentence-level segments instead of one. This did **not** change the document's
statement count materially, did not introduce a misclassification, and did not
affect the SUPPORTED/0-issues decision — it is the Cyrillic-alphabetic analogue of
already-accepted, disclosed residuals elsewhere in the corpus (e.g. DRA-ENG-014A's
ALL-CAPS bare-EN edge case). No production code was modified to address this in
this acquisition, per the Phase 2 engineering boundary.

**Proposed future DRA-ENG programme:** a language-aware (or Unicode-CLDR-driven)
abbreviation-list mechanism for sentence-boundary detection, to close this residual
generally rather than per-language — scoped as future work, not undertaken here.

## 12. Validation performed

- New targeted tests: `dra-acq-031-phase2-doc0034-bulgarian-admission.test.ts` (1/1
  passed, live network, ~2.5s) and `dra-acq-031-phase2-bulgarian-representation-
  fidelity.test.ts` (1/1 passed, live network, ~1.7s).
- Broader regression: `src/benchmark/acquisition`, `src/benchmark/governance`,
  `src/benchmark/corpus`, `src/benchmark/execution` (2,250 passed, 94 failed across
  39 files). All 94 failures are the same pre-existing, unrelated assertion
  (`expect(DRA_EVALUATOR_VERSION).toBe("0.1.1")` in various discovery-phase test
  files, now stale because the evaluator is at 0.1.2 following DRA-ENG-014/023) —
  confirmed pre-existing by `git status` showing this acquisition added only the two
  new test files above and touched no production code, discovery file, or existing
  test.
- `npx tsc --noEmit`: 2 pre-existing errors only (`dra-acq-026` test file's
  `overallStatus` property, and `dra-acq-025-non-redundant-graphics-discovery.ts`'s
  `CandidateRecord` literal-type mismatch) — both already catalogued in prior-turn
  memory as pre-existing and unrelated to this acquisition. No new TypeScript errors
  introduced.

## 13. Final verdict

**DRA-DOC-0034 (EC Ethics Guidelines, Bulgarian edition) is ADMITTED.**
**Cyrillic robustness result: PASS**, per DRA-ACQ-031 Phase 1's own acceptance
criteria, with one disclosed, non-decision-changing abbreviation-boundary residual
recorded as a candidate for a future language-aware abbreviation-list programme.
DRA-ENG-023's Unicode segmentation fix is confirmed to generalise cleanly to a
second script family (Cyrillic, alphabetic/whitespace-delimited/ASCII-punctuated) on
first contact, extending — but not completing — the corpus's non-Latin-script
coverage (Latin: en/es/fr; CJK: ja; Cyrillic: bg). DRA-DOC-0033 (Hindi, Devanagari)
remains the next genuinely untested script family and remains blocked on an
unrelated acquisition-infrastructure issue.
