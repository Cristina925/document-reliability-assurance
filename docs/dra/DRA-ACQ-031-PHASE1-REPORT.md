# DRA-ACQ-031 — Phase 1: Next Robustness-Gap Discovery and Candidate Qualification

**Status:** Phase 1 complete. **No document acquired, frozen, or admitted.** No new `DRA-DOC`, `DRA-FRZ`,
or `DRA-ACQ` identifier claimed. Evaluator 0.1.2 and the production pipeline are unmodified.

**Source module:** `lib/dra-reference/src/benchmark/acquisition/discovery/dra-acq-031-next-robustness-gap-discovery.ts`
**Tests:** `lib/dra-reference/src/benchmark/acquisition/discovery/__tests__/dra-acq-031-next-robustness-gap-discovery.test.ts` (30 passing)

---

## 1. Updated robustness evidence map

Reconstructed as of DRA-ENG-024's closure (multi-column reading order). Full detail in
`RECONSTRUCTED_EVIDENCE_MAP`; summary:

| Dimension | Status | Evidence class | Source |
|---|---|---|---|
| footnotes/endnotes | DEFECT_DEMONSTRATED_AND_CLOSED (accepted limitation) | EXPLICITLY_TESTED | ACQ-020 |
| tables/tabular semantics | CLOSED_WITH_POSITIVE_EVIDENCE; shading loss accepted | EXPLICITLY_TESTED | ACQ-021, ENG-015 |
| **multi-column layout** | **PARTIALLY_CLOSED** (per DRA-ENG-024; not reopened here, per explicit programme instruction) | EXPLICITLY_TESTED | ACQ-030, ENG-024 |
| very large documents/scalability | DEFECT_DEMONSTRATED_AND_CLOSED (O(n²)→O(n)) | EXPLICITLY_TESTED | ACQ-026, ENG-019 |
| scientific citations/references | DEFECT_DEMONSTRATED_AND_CLOSED | EXPLICITLY_TESTED | ACQ-022, ENG-016 |
| legal authority/versioning | DEFECT_DEMONSTRATED_AND_CLOSED | EXPLICITLY_TESTED | ACQ-027, ENG-020/021/022 |
| document supersession/currentness | DEFECT_DEMONSTRATED_AND_CLOSED | EXPLICITLY_TESTED | ACQ-027, ENG-020/021/022 |
| scans/OCR/image-only | CLOSED_WITH_POSITIVE_EVIDENCE; OCR corruption accepted | EXPLICITLY_TESTED | ACQ-023, ENG-017 |
| graphics/charts/diagrams | CLOSED_WITH_POSITIVE_EVIDENCE; semantics loss accepted | EXPLICITLY_TESTED | ACQ-024/025, ENG-018 |
| **non-Latin scripts** | **PARTIALLY_TESTED** — CJK only (DOC-0032, ENG-023-closed); zero evidence in any other family; DOC-0033 (Devanagari) blocked, not admitted | EXPLICITLY_TESTED | ACQ-028, ENG-023; ACQ-029 (blocked) |
| mixed-language (single doc, code-switched) | UNTESTED | NOT_TESTED | none |
| complex HTML | CLOSED_WITH_POSITIVE_EVIDENCE | EXPLICITLY_TESTED | ACQ-006/012/016 |
| appendices/annexes | PARTIALLY_TESTED — one data point | EXPLICITLY_TESTED_NARROW | ACQ-024 |
| multiple evidence sources | PARTIALLY_TESTED — incidental only | INCIDENTALLY_PRESENT | DOC-0001/3/4/5 |
| provenance beyond OCR | PARTIALLY_TESTED — narrow (OCR fidelity only) | EXPLICITLY_TESTED_NARROW | ENG-017 |
| compound/extreme documents | UNTESTED (deliberately deferred) | NOT_TESTED | none |
| cross-language (EN/ES) materiality divergence | DEFECT_DEMONSTRATED_OPEN — 1/7 pairs confirmed, root-caused, never engineered | EXPLICITLY_TESTED | CHK-003, CHK-005 |

This map carries forward all rows unaffected by intervening work unchanged, and updates only the two
rows this programme's context requires: multi-column (now explicitly PARTIALLY_CLOSED, treated as
closed input) and non-Latin scripts (now explicitly re-derived as the top-ranked open gap).

## 2. Ranked remaining gaps (8 named criteria)

Criteria used, exactly as specified for this programme: material risk to trustworthy consumption,
novelty relative to corpus, likelihood of exposing a distinct failure, ground-truth availability,
official-source/licensing suitability, acquisition stability, single-variable testability, and
evidentiary value per cost. Full per-criterion scoring in `RANKED_REMAINING_GAPS`.

**Ranking result:**

1. **Non-Latin scripts (family diversity beyond CJK)** — HIGH on 6/8 criteria, MEDIUM on the two
   novelty-adjacent criteria (disclosed honestly, see §4). Only remaining FAIL/CONDITIONAL row in the
   DRA-ROB-001 freeze checklist resolvable by a single additional acquisition.
2. Compound/extreme documents — LOW on single-variable testability; would conflate the still-open
   non-Latin-script question with an already-combined-weakness document. Deliberately deferred.
3. Mixed-language (code-switched) documents — shares the same normalisation mechanism as non-Latin
   scripts; cannot be cleanly isolated until a second script family exists on its own.
4. Cross-language (EN/ES) materiality divergence closure — real and valuable, but requires no
   acquisition (pure direct-pipeline analysis on already-frozen content), so it is out of scope for a
   document-discovery Phase 1 and is recorded as a parallel-track recommendation rather than ranked
   head-to-head against acquisition candidates.
5. Multiple evidence sources / conflicting provenance — already has incidental real-world exposure;
   a dedicated artificial-conflict experiment would weaken ground-truth cleanliness for modest gain.

**Selected dimension: non-Latin scripts (family diversity beyond CJK).**

## 3. Candidate investigation record (including rejects)

All records live in `CANDIDATE_REGISTER`; all HTTP/byte-stability/extraction checks below were
performed live on 2026-08-11 against each publisher's own URL, read-only, with no fetch into the DRA
pipeline or evaluator.

| Candidate | Script | Outcome | Key facts |
|---|---|---|---|
| **EC Ethics Guidelines — Bulgarian** (`doc_id=60442`) | Cyrillic | **QUALIFIED_PRIMARY** | HTTP 200, 58pp, byte-identical across 2 independent fetches (SHA-256 confirmed), clean Cyrillic pdftotext extraction, single-column/no tables/no graphics, CC BY 4.0 (same institution-wide basis already twice-verified for DOC-0018/0019), same document already admitted in English and Spanish |
| **EC Ethics Guidelines — Greek** (`doc_id=60424`) | Greek | **QUALIFIED_ALTERNATE** | Same verification profile as Bulgarian (HTTP 200, 58pp, byte-stable, clean extraction, CC BY 4.0); genuinely different Unicode block from the primary |
| **eLegalix DRA-DOC-0033 retry** (Devanagari, Supreme Court of India judgment) | Devanagari (abugida) | **REJECTED** | Third confirmed HTTP 429 in a growing cooldown window (16:25 → 16:58 → 19:28 UTC, same day) — rejected on `ACQUISITION_STABILITY`, not merit. Would carry the **highest** structural novelty of any candidate considered; left as a separate, untouched DRA-ACQ-029 thread |

No other candidates were investigated in depth this phase — the EC-multilingual family was
identified as strictly dominant (same publisher, same licence basis, same genre, existing parallel
ground truth) over searching for a wholly new publisher, and the eLegalix path was the only concrete
alternative already in flight.

## 4. Primary candidate

**Bulgarian edition of the EC "Ethics Guidelines for Trustworthy AI"** (`EC_ETHICS_GUIDELINES_BG`).

- Official publisher: European Commission / High-Level Expert Group on AI.
- Licence: CC BY 4.0, same institution-wide notice already verified for the English (DOC-0018) and
  Spanish (DOC-0019) editions of this exact document.
- Live-verified 2026-08-11: HTTP 200, 58-page native-text PDF, byte-identical across two independent
  fetches (SHA-256 `bf61352b…dac3d313`), clean Cyrillic text layer confirmed via `pdftotext`.
- Structurally clean: single-column, no tables, no graphics requiring interpretation, no OCR/scan
  artefacts — deliberately isolates script family as the only new variable relative to every other
  already-characterised representation dimension.
- Ground truth: the identical document is already admitted, frozen, and evaluated in English and
  Spanish, giving an unusually strong three-way parallel-translation oracle.
- Hypothesis: ENG-023's `\p{L}\p{N}` Unicode-property fix (closed for CJK) generalises to the Cyrillic
  alphabet, an alphabetic/whitespace-delimited script using ordinary ASCII sentence punctuation
  (unlike CJK).

**Disclosed limitation:** Cyrillic is an alphabetic, whitespace-delimited script structurally similar
to Latin. It tests Unicode character-range coverage but **does not** test a genuinely different
composition model (abugida, abjad, or right-to-left script). This report does not claim the
non-Latin-script robustness dimension will be fully closed by admitting this candidate — the
highest-novelty gap (Devanagari, via the still-blocked DRA-ACQ-029 thread) remains genuinely open.

## 5. Alternate candidate

**Greek edition of the same document** (`EC_ETHICS_GUIDELINES_EL`, `doc_id=60424`) — identical
verification profile (HTTP 200, 58pp, byte-stable, clean extraction, same CC BY 4.0 basis), a
genuinely different Unicode block (Greek, not Cyrillic), usable if the primary proves unworkable in
Phase 2. Running both would mostly re-confirm the same alphabetic-script mechanism rather than reveal
a second distinct one, so Greek is the alternate, not a second concurrent primary.

## 6. Proposed Phase 2 experiment and acceptance criteria

Full detail in `PROPOSED_PHASE_2_SCOPE`. Summary:

1. Re-verify governance immediately before acquisition (standard ACQ practice for live sources).
2. Freeze and admit the Bulgarian primary via `acquireFreezeAndEvaluate` — no pipeline modification.
3. Run twice (`evaluateFrozenBenchmarkDocument`) to confirm Run A/Run B digest equality (DRA-BMK-023
   corpus-lock convention) before drawing conclusions.
4. Directly compare segmentation/statement output against the already-frozen English (DOC-0018) and
   Spanish (DOC-0019) evaluations, using the CHK-003/CHK-005 direct-pipeline comparison technique.
5. If a signal appears, run the Greek alternate as a second independent data point.
6. Assess materiality strictly against ENG-023's own materiality standard (statement formation, claim
   boundaries, evidence linkage, authority interpretation, issue generation, or final decision).
7. Classify using exactly one of: `SCRIPT_GENERALISATION_CONFIRMED`,
   `SCRIPT_GENERALISATION_GAP_DEMONSTRATED_MATERIAL`,
   `SCRIPT_GENERALISATION_GAP_DEMONSTRATED_NONMATERIAL`, `INCONCLUSIVE`.
8. Explicitly record that abugida/abjad/RTL scripts remain untested after this experiment.

**Acceptance criteria:**
- **PASS:** segmentation/statement counts structurally comparable to the EN/ES editions; no
  `PUNCTUATION_ONLY` misclassification of substantive Cyrillic/Greek prose; decision unaffected.
- **PARTIAL:** a narrow, non-decision-changing discrepancy is found and disclosed (analogous to
  ENG-014A's accepted ALL-CAPS residual).
- **MATERIAL DEFECT:** a script-specific segmentation/classification failure analogous to the
  pre-ENG-023 Japanese defect that changes claim formation, evidence linkage, or the decision.

**Explicit non-goals for Phase 2:** no pipeline fix/patch as part of classification (any remediation
is a separate later DRA-ENG programme); no interference with `DRA-FRZ-000027`, `DRA-ACQ-000036`, or
`DRA-DOC-0033`; no retry of the DRA-ACQ-029 eLegalix fetch.

## 7. Targeted tests

`dra-acq-031-next-robustness-gap-discovery.test.ts` — 30 tests, all passing, covering: programme
context invariants, evidence-map structure and specific row content, the 8-criterion ranking
(exhaustive scoring, non-Latin-scripts ranked #1, multi-column correctly absent from the ranked list),
the eLegalix re-check record, full candidate-register schema/enum validity, primary/alternate/rejected
candidate content checks, the Phase 1 qualification verdict (including the disclosed limitation), and
the Phase 2 proposal/prohibited-actions content. No live network calls; no pipeline or evaluator
invocation.

## 8. TypeScript verification

`npx tsc --noEmit` in `lib/dra-reference` produces no new errors from the ACQ-031 module or its test
file. Two pre-existing, unrelated errors remain (in `dra-acq-026` long-range test and
`dra-acq-025-non-redundant-graphics-discovery.ts`), documented previously as known drift unrelated to
any single acquisition.

## 9. Governance / hard-constraint compliance

- No document acquired, frozen, or admitted.
- No new `DRA-DOC`, `DRA-FRZ`, or `DRA-ACQ` identifier created or claimed.
- `DRA-FRZ-000027`, `DRA-ACQ-000036`, and `DRA-DOC-0033` untouched.
- No further multi-column engineering performed (DRA-ENG-024's closure treated as fixed input).
- Evaluator 0.1.2 and the production pipeline unmodified.
- New production defect found: **none** — this phase reproduces only reconnaissance-level candidate
  verification (HTTP/byte-stability/`pdftotext`), not a pipeline run, so no new defect claim is made or
  could be made from this evidence alone; any defect discovery is deferred to Phase 2 as designed.
