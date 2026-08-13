# DRA-ACQ-027 Phase 2 — Completion Report

## Freeze, Admission, and Version-Supersession Detection Capability-Gap Experiment for DRA-DOC-0031
### NIST Special Publication 800-53 Revision 4 — "Security and Privacy Controls for Federal Information Systems and Organizations" (withdrawn 2021-09-23, superseded by Revision 5 / DRA-DOC-0030)

Date executed: 2026-08-11
Programme: DRA-ACQ-027 (version/supersession robustness discovery)
Phase: 2 of 2 (Phase 1 = candidate discovery and qualification, already accepted; this phase = acquisition/freeze/admission + the version-supersession detection experiment)

---

## 0. Scope discipline — read first

This phase is an **experiment, not remediation**. Per the explicit task specification, the following were NOT done, anywhere in this phase:

- No supersession/currentness field was added to any schema.
- `SourceDocument` was not modified.
- Stage 3 (Authority Resolution) was not touched.
- `publishedAt` (or any similar field) was not reinterpreted.
- No `AUTHORITY_EXPIRED` issue class, or any other new issue class, was introduced.
- The evaluator was not otherwise engineered, tuned, or special-cased for this document.

The two documents involved (DRA-DOC-0031 and DRA-DOC-0030) were evaluated **strictly independently** throughout: neither evaluation input references the other document, its corpus ID, its freeze record, or any fact about supersession. All comparison between the two results happens **after** both evaluations are already final, as external, read-only analysis.

---

## 1. Files created

| File | Change |
|---|---|
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-027-nist-sp80053r4-admission.test.ts` | **Created.** Phase 2A/2B: governance re-verification, two independent live fetches (byte-stability), 30→31-document corpus admission via the unmodified `acquireFreezeAndEvaluate()`, Run A/Run B determinism check via `evaluateFrozenBenchmarkDocument()`, proof receipt integrity verification. |
| `lib/dra-reference/src/benchmark/acquisition/__tests__/dra-acq-027-supersession-detection-experiment.test.ts` | **Created.** Phase 2C: independently re-derives both DRA-DOC-0031's and DRA-DOC-0030's full evaluation results via `evaluateDocument()` (each run twice for its own determinism check), then performs a keyword/structural scan of both complete result graphs for any supersession-like signal. |
| `lib/dra-reference/docs/dra/DRA-ACQ-027-PHASE2-NIST-SP80053R4-REPORT.md` | **Created.** This report. |

**No engineering/production code was created or modified.** No file under `src/` other than the two new test files above was touched.

---

## 2. Governance re-verification (2026-08-11, independent of Phase 1)

- **Official source:** `nvlpubs.nist.gov` — NIST's official publications-hosting domain (Legacy/SP path). Re-confirmed live.
- **Availability/stability:** two independent live HTTP GETs of the canonical PDF URL, performed fresh for this acquisition, both returned HTTP 200, `application/pdf`, content-length 5,212,362 bytes, and identical SHA-256 `5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2` both times — matching the DRA-ACQ-027 Phase 1 discovery digest exactly. **BYTE_STABLE.**
- **Supersession evidence (re-verified, source-external):** NIST's own CSRC publication catalog record (`https://csrc.nist.gov/pubs/sp/800/53/r4/upd4/final`) states Rev. 4 was withdrawn on 2021-09-23 and is "Superseded By: SP 800-53 Rev. 5 (09/23/2020)"; the Rev. 5 catalog record states "Supersedes: SP 800-53 Rev. 4 (01/22/2015)". This is an explicit, publisher-authored, bidirectional record — independent of any DRA-side inference.
- **Self-disclosure check (re-confirmed live, at admission time, not just at Phase 1 discovery):** direct structural inspection of the extracted Rev. 4 text confirms it contains **no** publication-level withdrawal/supersession notice of any kind. The document *does* contain 182 uses of the word "Withdrawn" — but these are all NIST's ordinary internal control-lifecycle notation for individual controls retired *within* the 800-53 catalog (e.g. "AC-13 Withdrawn"), not a statement about the publication's own currentness. This distinction matters methodologically: a naive keyword search for "withdrawn" inside the document text would have produced false positives from this legitimate internal usage — the actual publication-level withdrawal fact exists *only* on NIST's separate catalog page, never inside the PDF artefact itself.
- **Licence:** PUBLIC_DOMAIN (17 U.S.C. §105) — NIST Special Publications are U.S. federal government works, direct NIST authorship. Same basis already accepted for DRA-DOC-0012, DRA-DOC-0024, and DRA-DOC-0030 (the current version of this very publication family).
- **Public accessibility:** no authentication, paywall, or access circumvention required.

**Classification:** domain TECHNICAL, documentType POLICY, language en-US, difficulty HIGH.

**Corpus-balance disclosure:** DRA-DOC-0031 does not add a novel domain or jurisdiction — TECHNICAL is already represented, including by the current version of this exact publication family (DRA-DOC-0030). It was admitted purely as the deliberate AUTHENTIC_SUPERSEDED half of a version-pair experiment, not for corpus-balance reasons.

---

## 3. Freeze and admission (WITH full evaluator execution — now tractable)

Unlike DRA-DOC-0030's original DRA-ACQ-026 admission (which could not complete full Stage 4 execution due to its then-O(n²) scaling), DRA-DOC-0031 was admitted through the **full, unmodified** `acquireFreezeAndEvaluate()` governed pipeline, end to end, in a single call. This is now tractable because DRA-ENG-019 replaced Stage 4's O(n²) re-derivation with an O(n)-amortised, cache-based implementation — a document of this same size class (5.2MB, ~460 pages) now evaluates in single-digit seconds rather than ~35–45 minutes.

| Field | Value |
|---|---|
| Freeze record ID | `DRA-FRZ-000025` |
| Corpus document ID | `DRA-DOC-0031` |
| Acquisition ID | `DRA-ACQ-000034` |
| Source digest (SHA-256) | `5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2` |
| Freeze status | `FROZEN` |
| Manifest document count | 31 |
| Manifest integrity check | ✓ PASS |
| Document IDs | `DRA-DOC-0001` … `DRA-DOC-0031`, contiguous, no gaps or collisions |

All 30 pre-existing corpus documents (DRA-DOC-0001…0030) were verified unchanged and in original order; DRA-DOC-0031 was appended as document 31.

---

## 4. Baseline evaluation results (Run A = Run B, fully deterministic)

| Field | DRA-DOC-0031 (Rev 4, superseded) | DRA-DOC-0030 (Rev 5, current) |
|---|---|---|
| Decision | **HOLD** | **REVIEW** |
| Stage 2 statement count | 24,310 | 25,603 |
| Issue count | 5 | 1 |
| Issue classes | `EVIDENCE_INADEQUATE` ×3, `EVIDENCE_ABSENT` ×2 | `EVIDENCE_INADEQUATE` ×1 |
| Determinism (Run A vs Run B) | Identical decision, issue set, and substantive digest | Identical decision, issue set, and substantive digest (previously established under DRA-ENG-019 Part G) |
| Proof receipt integrity | ✓ VALID (both runs) | ✓ VALID (both runs) |
| evaluatorVersion / pipelineVersion / schemaVersion | 0.1.2 / 1.0 / 0.1.0 | 0.1.2 / 1.0 / 0.1.0 |

These results are recorded **verbatim**, as returned by the unmodified evaluator — no expected outcome was assumed or forced. DRA-DOC-0031's HOLD/5-issue result and DRA-DOC-0030's REVIEW/1-issue result were **not predicted in advance**; both are ordinary evidence-linkage outcomes of the kind already seen across numerous unrelated prior corpus documents, and neither issue set contains, implies, or is caused by version supersession in any way discernible from the issue records themselves.

---

## 5. Version-supersession detection capability-gap experiment (the central finding)

**Question:** does the unmodified evaluator emit any signal — in decision, issue set, `decisionRationale`, or proof receipt — that would let a downstream consumer infer DRA-DOC-0031 has been superseded by DRA-DOC-0030?

**Method:** both documents were evaluated completely independently via `evaluateDocument()` (no shared corpus context, no cross-reference between the two evaluation inputs). After both results were final, their entire result graphs (decision, decisionRationale, every issue object, and the full proof receipt) were recursively flattened to strings and scanned for a list of supersession-adjacent keywords (`supersede`, `withdraw(n)`, `obsolete`, `outdated`, `deprecated`, `expired authority`, `authority_expired`, etc.).

**Result: zero hits in either document's result graph.**

One methodological note from this scan is itself a small but genuine finding: an initial, broader keyword list included bare version labels like "Revision 5" / "current version". This produced a **false positive** on DRA-DOC-0030's own result graph — not because the evaluator detected anything about DRA-DOC-0031, but because DRA-DOC-0030's own generated/source document title self-identifies as "Revision 5" (it *is* Revision 5). This demonstrates that even a naive keyword heuristic cannot reliably distinguish "a document's own version label" from "a live cross-document supersession signal" without engineered cross-document semantics that do not exist in the pipeline today. The refined keyword list (excluding self-referential version labels) confirmed the zero-hit result cleanly.

**Structural comparison:** both documents' issues are ordinary `EVIDENCE_ABSENT` / `EVIDENCE_INADEQUATE` records — the same issue classes already exercised by many unrelated prior corpus documents. Nothing in either issue set references, implies, or is affected by the other document's existence.

**Determination: CONFIRMED.** The unmodified DRA evaluator (0.1.2 / pipeline 1.0) has **no mechanism whatsoever** to receive, request, or reason about cross-document version relationships, publisher-side withdrawal/supersession metadata, or temporal currentness. This matches, empirically, the DRA-ACQ-027 Phase 1 capability audit's prediction (Part 2 — `versionOrRevisionField` and related capability checks): any version-adjacent field that exists anywhere in the schema (`SourceDocument.version`, `CorpusDocumentInput.generatorVersion`) is either absent from the evaluation path entirely or semantically dead for trust-decision purposes. `evaluateDocument()` takes no corpus-context parameter at all, so there is no architectural seam through which a "this document has a newer authoritative sibling" fact could even be injected without a schema change.

**No remediation was attempted in this phase**, per the explicit task-spec constraint.

---

## 6. Ten-question conclusion

1. **Was the document admitted to the corpus?** Yes — DRA-DOC-0031, freeze `DRA-FRZ-000025`, corpus size now 31.
2. **Was it assigned a decision?** Yes — **HOLD**, 5 issues, fully deterministic across two independent runs (both via the governed pipeline and via direct `evaluateDocument()` re-derivation).
3. **Was the byte-stability/governance re-verification independent of Phase 1?** Yes — two fresh live fetches at admission time reproduced the exact Phase 1 digest; the licence and official-source assessments were re-authored (not copy-pasted) for this acquisition.
4. **Does the Rev. 4 text itself disclose its own withdrawal?** No — confirmed by direct structural inspection at admission time. The only "Withdrawn" occurrences are ordinary internal control-lifecycle notation, unrelated to the publication's own currentness.
5. **Was DRA-DOC-0030 (Rev 5) re-evaluated or modified as part of this acquisition?** No — it was independently re-derived (not re-frozen, not re-admitted) purely to obtain its result graph for comparison; its existing DRA-FRZ-000024 admission record and DRA-ENG-019 Part G evaluation are unaltered.
6. **Does the evaluator detect the supersession relationship?** **No — confirmed by direct experiment**, not by assumption. Zero supersession-adjacent keyword hits in either result graph; no architectural mechanism exists to carry this information even if a signal were engineered elsewhere.
7. **Was any workaround (sampling, truncation, extrapolated decision, forced expected outcome) used?** No — both documents' actual decisions (HOLD and REVIEW respectively) were recorded exactly as returned, including the initial keyword-scan false positive, which was corrected methodologically rather than hidden.
8. **What is the single most valuable finding?** A directly-demonstrated capability gap: DRA can distinguish AUTHENTIC from INAUTHENTIC but has no concept of AUTHENTIC_CURRENT vs. AUTHENTIC_SUPERSEDED — confirmed via controlled experiment rather than static code audit.
9. **What could not be assessed?** Whether a hypothetical remediation (e.g. an injected currentness signal) would actually change the evaluator's decision — that would require engineering the evaluator, explicitly out of scope for this phase.
10. **What should happen next?** A separately-scoped future engineering programme should design and implement a version/currentness signal (analogous in spirit to DRA-ENG-017's representation-provenance escape hatch via `requesterMetadata`, or a genuine schema extension), then run a closure experiment re-evaluating DRA-DOC-0031 with that signal present to confirm it measurably changes the evaluator's behaviour, followed by a full corpus regression to confirm no unintended side effects.

---

## 7. Recommended follow-up (not undertaken here)

A future **DRA-ENG** ticket should:
- Design a version/supersession/currentness representation — either a new optional field on the freeze record or corpus entry (following the DRA-ENG-017/018 precedent of digest-excluded, non-breaking additive fields), or a `requesterMetadata`-based escape hatch analogous to DRA-ENG-017's `representationProvenance`/`representationFidelity` fields.
- Determine what happens to that signal at each pipeline stage: does it merely ride along in the proof receipt (informational only), or does it participate in the decision logic (e.g. a new issue class, or a decision-downgrade rule)?
- Re-run the DRA-DOC-0031/DRA-DOC-0030 experiment with the new signal present to confirm the evaluator's output now measurably reflects supersession status, closing the gap demonstrated here.
- Run a full corpus regression (31+ documents) to confirm the change is purely additive and does not alter any existing document's decision.

This work was **not** performed as part of DRA-ACQ-027 Phase 2, per explicit scope instruction to stop after admission, baseline evaluation, and the capability-gap experiment.
