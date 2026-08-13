# DRA-ACQ-028 — Phase 1: Post-Currentness Robustness Gap Audit and Candidate Discovery for DRA-DOC-0032

**Status:** Phase 1 complete. Qualified candidate selected. No document frozen, admitted, or evaluated. No production/evaluator code modified. DRA-ENG-020/021/022 (currentness semantics/integrity/cutover) are not reopened. Phase 2 has not begun.

## 1. Objective

DRA-ACQ-027 and DRA-ENG-020/021/022 are complete and treated as frozen. The corpus holds 31 admitted documents (DRA-DOC-0001–0031). This phase asks: **what is now the highest-value unresolved uncertainty about DRA, and which admissible real-world document provides the cleanest experiment against it?** This is read-only discovery and qualification only — nothing is frozen, admitted, evaluated, or engineered.

## 2. Robustness evidence map through Document 31

Corpus count (31, contiguous DRA-DOC-0001–0031) and per-document metadata were reconstructed by direct inspection of the corpus registry/fixtures and the acquisition report trail (2026-08-11), most authoritatively `docs/dra/DRA-ACQ-027-PHASE2-NIST-SP80053R4-REPORT.md`. All 31 documents are in English, Spanish, or French — Latin-script, whitespace-delimited, left-to-right languages. No document exists in any other script family.

Each dimension below is classified using the required taxonomy (`NOT_TESTED`, `PARTIALLY_TESTED`, `TESTED_NO_GAP`, `GAP_DEMONSTRATED`, `ENGINEERED_AND_CLOSED`, `KNOWN_LIMITATION_ACCEPTED`), with the likely failure boundary (source acquisition → representation/extraction → normalisation → freeze/governance → Stage 1–7 evaluation → proof/integrity) and an explicit note distinguishing **exposure** (a feature merely appeared in a document) from **demonstrated evidence** (a dedicated experiment isolated the dimension and produced an interpretable result).

| Dimension | Classification | Failure boundary | Exposure vs. demonstrated |
|---|---|---|---|
| Footnotes/endnotes | GAP_DEMONSTRATED | Representation/extraction | Demonstrated (ACQ-009, ACQ-020/BMK-023): flattening confirmed at extraction; decision-level impact is prose-dependent, not universal |
| Tables/tabular semantics | KNOWN_LIMITATION_ACCEPTED | Representation/extraction | Demonstrated (ACQ-021 Phase 2); ENG-015 built a detector for the boundary, not a fix for the underlying loss |
| Multi-column layout | NOT_TESTED | Representation/extraction | Never isolated as the tested variable in any programme |
| Very large documents/scalability | ENGINEERED_AND_CLOSED | Stage 1–7 evaluation | Demonstrated and closed (ACQ-026/ENG-019): O(n²)→O(n), measured 35–45 min → <5 s |
| Scientific citations/references | ENGINEERED_AND_CLOSED | Representation/extraction | Demonstrated and closed (ACQ-022/ENG-016), scoped to the two demonstrated failure modes only |
| Legal authority/versioning | ENGINEERED_AND_CLOSED | Stage 1–7 evaluation | Demonstrated and closed across ACQ-027/ENG-020/021/022 |
| Document supersession/currentness | ENGINEERED_AND_CLOSED | Stage 1–7 evaluation | Same closed chain; **not reopened here** |
| Scans/OCR/image-only content | KNOWN_LIMITATION_ACCEPTED | Representation/extraction | Demonstrated (ACQ-023); ENG-017 engineered provenance/fidelity metadata, but classified corruption *detection* (not correction) as an accepted limitation |
| Graphics/charts/diagrams (non-textual meaning) | KNOWN_LIMITATION_ACCEPTED | Representation/extraction | Demonstrated twice (ACQ-024, ACQ-025); ENG-018 engineered a detection model, not recovery |
| Non-Latin scripts | **NOT_TESTED** | Normalisation | No document has ever exposed the pipeline to non-Latin text at any stage |
| Mixed-language documents (single document) | NOT_TESTED | Normalisation | Prior work (ACQ-014–017, CHK-003/005) tested cross-*document* language pairs, never a single document with an internal language boundary |
| Complex HTML | TESTED_NO_GAP | N/A | Demonstrated across three separate acquisitions (ACQ-006, ACQ-012, ACQ-016) with no unresolved defect |
| Appendices/annexes | PARTIALLY_TESTED | Stage 1–7 evaluation | One demonstrated data point (ACQ-024 appendix-checklist recoverability), not a general characterisation |
| Multiple evidence sources | PARTIALLY_TESTED | Stage 1–7 evaluation | Real exposure (several documents cite >1 standard); no dedicated reconciliation experiment |
| Provenance | PARTIALLY_TESTED | Freeze/governance | Engineered narrowly for OCR/scan fidelity (ENG-017); broader provenance (mirrors, republication, translation chains) untested |
| Compound/extreme documents | NOT_TESTED | Stage 1–7 evaluation | Deliberately deferred by the corpus's own single-variable discipline (ACQ-013), not an oversight |

Full field-level detail, citations, and the exposure/demonstrated rationale for each row are recorded in `lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-028-non-latin-script-discovery.ts` (`ROBUSTNESS_EVIDENCE_MAP`), proven by 34 passing tests in the companion `__tests__` file.

### Distinguishing extraction limitations from evaluator limitations

Per the directive's required distinction: where information exists only through visual encoding and never reaches extracted text (table shading, diagram topology, OCR corruption), the failure boundary is **representation/extraction**, not Stage 1–7 evaluator reasoning — the evaluator cannot reason about information it never receives. This is why ENG-015/017/018 all built *detection* mechanisms operating on the raw source artefact (PDF fill-colour diversity, font-embedding status, raster-image trust properties) rather than *evaluator logic changes* — the gap sits upstream of the evaluator itself. The non-Latin-script question below sits at a different boundary: **normalisation**, because the raw text *is* extracted successfully (native-script PDFs extract cleanly at the byte/character level); the open question is whether the tokenisation/pattern-matching rules that consume that correctly-extracted text generalise, not whether the text arrives at all.

## 3. Ranking methodology and result

Applied the nine required criteria in order: potential impact on DRA's trust claim; probability of real-world occurrence; whether existing evidence already substantially addresses it; ability to construct a clean falsifiable experiment; ability to obtain authoritative ground truth; governance/licensing feasibility; acquisition stability/reproducibility; incremental information relative to cost; and whether the experiment tests a genuinely new boundary rather than another instance of a known limitation.

| Rank | Dimension | Summary rationale |
|---|---|---|
| 1 | **Non-Latin scripts** | True `NOT_TESTED` gap (not a weak instance of a tested one); high real-world prevalence (most machine-consumed documents worldwide are not Latin-script); clean falsifiable design available by reusing the already-validated parallel-translation ground-truth method (ACQ-017/BMK-021); unambiguously a new architectural boundary — no prior programme touched script or tokenisation model, only vocabulary/grammar within Latin script |
| 2 | Compound/extreme documents | High potential impact, but ACQ-013 already established that confounding new variables destroys diagnostic clarity — ranks below a clean single-variable experiment |
| 3 | Mixed-language documents (single document) | Genuinely untested, but narrower in real-world probability and mechanistically overlaps with the non-Latin-script normalisation boundary; natural *follow-on* experiment |
| 4 | Multiple evidence sources | Real gap, but harder to construct a clean falsifiable Phase-1-scale experiment with authoritative ground truth |
| 5 | Multi-column layout | Real `NOT_TESTED` gap, but structurally similar in kind to already-characterised table/graphics representation-boundary problems (ENG-015/018) — smaller marginal architectural insight |

**Result: non-Latin scripts is the single highest-value remaining uncertainty.** Every regex/tokenisation rule across Stages 1–7 — including the `\b`-word-boundary metacharacter already shown to have language-specific edge-case behaviour *within* Latin script (DRA-ENG-012's bare-`EN`/Spanish-`en` collision; DRA-CHK-005's `\b`-after-accented-vowel pitfall) — has never been exercised against a script with no inter-word whitespace or a non-Latin letterform model. This is a materially different and more fundamental question than the already-closed cross-document multilingual work.

## 4. Candidate search and qualification

Live web verification was performed 2026-08-11 against each candidate's official publisher domain.

### 4.1 PRIMARY (QUALIFIED_RECOMMENDED) — Japan Cabinet Office AI guideline

- **Title:** 人工知能関連技術の研究開発及び活用の適正性確保に関する指針 (*Guideline for Ensuring the Appropriateness of Research & Development and Utilization of Artificial Intelligence-Related Technology*)
- **Publisher:** Cabinet Office, Government of Japan — Council for Science, Technology and Innovation
- **Source URL:** `https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_guideline.html`
- **Document type / domain:** POLICY / GENERAL
- **Languages / script:** Japanese (kanji + hiragana + katakana, no inter-word whitespace) plus an official English "provisional translation" published by the same publisher on the same page
- **Size:** native Japanese PDF ~526 KB; companion English translation PDF ~250 KB; page count not yet measured (Phase 1 does not fetch document bytes for admission)
- **Targeted dimension:** non-Latin scripts, specifically the zero-whitespace CJK sub-case — the sharpest possible test of whitespace/`\b`-boundary assumptions
- **Why Documents 1–31 do not already answer this:** none contain any Japanese or any script lacking whitespace word delimiting
- **Expected ground truth:** the publisher's own official English translation, published side by side with the original — the same parallel-document ground-truth method already validated at DRA-ACQ-017/DRA-BMK-021, extended to a genuinely non-Latin script
- **Official-source status:** primary Cabinet Office domain; formally adopted 2025-12-19 (a current, not archival, policy instrument)
- **Reuse/licence status: VERIFIED.** Governed by the *Government of Japan Standard Terms of Use (Version 2.0)*, the cross-government reuse licence applied uniformly across `cao.go.jp` and other central-government sites. Its text permits free use, copying, public transmission, translation, and modification, and explicitly states "commercial use of Content is also permitted" — materially equivalent to CC BY, the licence tier already accepted for DRA-DOC-0018/0020.
- **Fetch accessibility:** both PDFs are linked from a plain, non-Cloudflare-gated HTML page and returned content on direct fetch; no bot-blocking observed (unlike OBR, Ofwat, Ofcom, CDC MMWR — all previously rejected for this reason)
- **Preliminary stability:** not yet byte-hash-verified across two independent fetches (deferred to Phase 2, matching established Phase 1 convention); the document is a dated, formally-decided instrument, the stability profile already associated with low volatility in this corpus
- **Likely acquisition/evaluation cost:** low-to-moderate — comparable in scale to the DRA-DOC-0017/0018 parallel-pair admission, not to the large-document scale of DRA-DOC-0030/0031
- **Success criterion (capability gap demonstrated):** the Japanese-script evaluation silently produces a statement count/structure materially inconsistent with what the English-translation baseline predicts, OR any Stage 2–6 regex-based rule (issue detection, authority-resolution keyword matching, EL-STANDARD-REF-style checks) demonstrably fails to fire, fires spuriously, or mis-tokenises text traceably to a Latin-script/whitespace assumption
- **Failure criterion (architecture generalises):** normalisation and claim extraction produce a statement count/structure proportionate to the English-translation baseline, no rule mis-fires due to a script-dependent assumption, and the final decision is not degraded relative to a structurally similar Latin-script POLICY document of comparable length

### 4.2 ALTERNATE (QUALIFIED_ALTERNATE) — Korea KISDI AI-policy report

- **Title:** 한국 AI 정책 현황 및 발전 방안: OECD AI 원칙을 중심으로 (*Korea's AI Policy Status and Development Directions: Centred on the OECD AI Principles*)
- **Publisher:** Korea Information Society Development Institute (KISDI), a government-funded research institute — governance tier comparable to the already-accepted Congressional Research Service precedent (DRA-DOC-0020/0024)
- **Source URL:** `https://kisdi.re.kr/report/fileView.do?arrMasterId=4334696&id=1875076&key=m2102058837181`
- **Script:** Hangul — whitespace-delimited at the word/phrase level, a useful **controlled contrast** to the primary candidate: if a defect is confirmed in Japanese, an alternate Korean acquisition could isolate whether the cause is specifically the *absence* of whitespace tokenisation or non-Latin letterforms more generally
- **Licence:** **PROVISIONAL.** Korea Open Government License (KOGL) Type 1 is confirmed generically as a CC-BY-equivalent framework for Korean public institutions, but the specific KOGL marking on this document was not directly visible in the fetched content — requires explicit per-document confirmation before any Phase 2 acquisition
- **Ground truth:** no official same-publisher parallel translation was found; would require an independently-sourced or manually-constructed reference — a weaker evidentiary position than the primary candidate
- **Why alternate, not primary:** provisional (not verified) licence status and the absence of a built-in authoritative translation

### 4.3 Rejected candidates

| Candidate | Script | Outcome | Reason |
|---|---|---|---|
| PRC central-government AI/technology policy documents | Simplified Chinese | REJECTED_LICENCE_UNCERTAIN | No general-purpose reuse licence comparable to this corpus's OGL/CC-BY-equivalent precedents was identified for PRC central-government publications. Recorded explicitly (not silently discarded) because this represents the largest concentration of non-Latin-script real-world machine-consumed documents globally. |
| United Nations Arabic-language documents | Arabic (RTL) | REJECTED_LICENCE_UNCERTAIN | UN Media's own copyright notice states content is "© United Nations, All rights reserved"; UN Publications requires an affirmative permission request rather than a general reuse grant — more restrictive than every licence basis accepted so far in this corpus. Recorded explicitly because Arabic RTL script remains the single strongest available test of directionality assumptions, unresolved by either qualified candidate, and worth revisiting against a different Arabic-language publisher in a future acquisition. |
| Taiwan Open Government Data License publications | Traditional Chinese | REJECTED_INSUFFICIENT_GROUND_TRUTH | Licence (OGDL-Taiwan-1.0) is genuinely strong — CC-BY-equivalent, confirmed at `data.gov.tw/en/license`, arguably the cleanest licence basis of any non-Latin-script candidate found. Rejected only because the portal's contents are predominantly structured/tabular open datasets rather than substantive prose documents, and no specific prose document with adequate ground truth was identified during Phase 1 search. Recorded as a strong future candidate family for a Traditional-Chinese-script variant. |

No candidate was rejected on instability, inaccessibility, or cost grounds in this programme; all three rejections were licence- or ground-truth-driven, and are recorded as methodological evidence per the directive rather than silently discarded.

## 5. Preferring an experiment over a demonstration

Before any admission: **what does DRA currently receive?** — correctly byte-extracted native-script text (extraction itself is not expected to fail for a digitally-typeset PDF). **What should it preserve or recognise?** — a statement count, claim structure, and authority/materiality classification proportionate to the same content in the parallel English translation. **What would demonstrate a capability gap?** — silent mis-tokenisation, spurious or missing rule firing traceable to a whitespace/Latin-script assumption, or a statement count/structure materially inconsistent with the translation baseline. **What would demonstrate the architecture handles the challenge?** — proportionate extraction and classification with no script-dependent rule failure. Both outcomes are genuinely possible by construction: DRA's Stage 1 normalisation does not currently branch on script, so the result is not guaranteed in either direction, satisfying the requirement that DRA be able to be wrong. No engineering toward either expected answer was performed in this phase.

## 6. Governance/licensing and stability summary

The primary candidate's licence (Government of Japan Standard Terms of Use v2.0) is VERIFIED to the same evidentiary standard as prior corpus admissions (explicit reuse/commercial-use grant, cross-referenced against the publisher's own English notice page). Fetch accessibility was directly confirmed (non-gated HTML, successful content retrieval, no bot-blocking). Byte-hash stability across two independent fetches was intentionally deferred to Phase 2, consistent with the established Phase 1 convention (ACQ-018 through ACQ-027) of not performing acquisition-grade verification during discovery.

## 7. Estimated execution/cost implications

Acquiring, freezing, and evaluating DRA-DOC-0032 is expected to be low-to-moderate cost: two PDF fetches (native Japanese + official English translation, the latter used only as an out-of-band comparison reference, not admitted as a corpus document), one acquisition/freeze/evaluation cycle through the unmodified governed pipeline (including the DRA-ENG-022 V2 currentness-integrity regime, applied without modification), and a direct `evaluateDocument()` structural comparison against the translation's independently-known statement structure — comparable in scale to the DRA-DOC-0017/0018 admission, not to the DRA-DOC-0030/0031 large-document scale.

## 8. Recommended Phase 2 experiment

Acquire, freeze, and evaluate the Japan Cabinet Office AI guideline (`DRA-CAND-028-01`) as **DRA-DOC-0032** under the existing, unmodified governed-acquisition pipeline. Separately fetch the publisher's own official English translation as an out-of-band ground-truth reference (not admitted as a corpus document). Compare the evaluator's output on the Japanese-script original against the independently-known statement/claim structure implied by the translation, watching specifically for silent mis-tokenisation or script-dependent rule failure in Stages 1–6. If a capability gap is confirmed, document it (per the ACQ-027 → ENG-020/021/022 precedent) as a candidate for a **separate, later** engineering ticket — do not remediate inline during Phase 2.

## 9. Deliverables

- `lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-028-non-latin-script-discovery.ts` — programme context, 16-dimension robustness evidence map, ranking methodology and result, candidate register (2 qualified + 3 rejected), Phase 1 qualification record, proposed Phase 2 scope, and the explicit hard-boundary record.
- `lib/dra-reference/src/benchmark/acquisition/discovery/__tests__/dra-acq-028-non-latin-script-discovery.test.ts` — 34 passing tests proving the above; no network calls, no evaluator execution.
- This report.

## 10. Explicitly not done (per Phase 1 scope)

No document was frozen, admitted, or evaluated. No production or evaluator code was modified. DRA-ENG-020/021/022 (currentness semantics, evidence integrity, and the freeze-record integrity cutover) were not reopened, and no signature/key-management engineering was started for the already-disclosed unkeyed-SHA-256 limitation. No remediation was begun for any capability gap this audit documents. Phase 2 has not begun.

## 11. Answer to the final question

**Which Document 32 experiment gives us the greatest new evidence about whether DRA can generalise beyond the weaknesses already exercised by Documents 1–31?**

Acquiring the Japan Cabinet Office AI guideline in native Japanese script, evaluated against its own publisher's official English translation as ground truth. Every one of the 31 admitted documents, and every regex/tokenisation rule built to parse them, has been exercised exclusively against whitespace-delimited Latin-script text. A Japanese-script document — with zero inter-word whitespace, a wholly different letterform model, and a verified CC-BY-equivalent licence plus a built-in authoritative translation for ground truth — is the cleanest available test of whether DRA's pipeline architecture generalises beyond Latin script, or whether its apparent multilingual robustness (demonstrated only across English/Spanish/French) was in fact contingent on a shared alphabet and tokenisation model all along.
