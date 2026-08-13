# DRA External Reviewer Entry Point

## Read this first

**No external, independent validation of DRA-GC-1 has yet occurred.** Every piece of evidence referenced from this document — the development corpus, the robustness programme, both blind studies, and the publication audit itself — was produced within this same research programme, by the same team, using the same evaluator and infrastructure. This document exists to make an eventual external, independent review easier to start; it does not assert that such a review has already happened.

If you are the first external reviewer of this work, you are the validation this programme has explicitly identified as its most important open item (manuscript, Section 16).

## Suggested reading order

Follow this order; each step names the exact file(s) to open and what to check.

1. **The manuscript.** `docs/dra/DRA-PUB-003-MANUSCRIPT.md` (or the rendered `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf` / `.html`). Read in full — it is the single account of the problem, architecture, methodology, and results. Its SHA-256 is `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e`; verify this against `docs/dra/DRA-PUB-MANUSCRIPT-1-FREEZE-RECEIPT.md` before trusting the copy you are reading.
2. **Claim boundaries.** `docs/dra/DRA-PUBLIC-CLAIMS.md`. This is the authoritative register of what this programme does and does not claim. If any other document (including the manuscript's own prose) ever appears to overclaim relative to this register, treat that as a defect to report, not as evidence the claim is true.
3. **DRA-GC-1, the frozen evaluator.** `docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md` and `docs/dra/DRA-GC-1-FREEZE-RECEIPT.md`. This is the exact, digest-bound evaluator version (`0.1.2`) every other result below was produced against. Independently recompute its aggregate digest (`77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`) rather than trusting the recorded value.
4. **DRA-GEN-001, the first blind generalisation study.** `docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md` and `docs/dra/DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md`. Pay particular attention to the 75-evaluated/100-locked distinction and the excluded English-HTML stratum — these are two different denominators answering two different questions, and conflating them is a common misreading.
5. **ENG-026 and the rejected GC-2 candidate.** `docs/dra/DRA-ENG-026-CROSS-LANGUAGE-STAGE5-MATERIALITY-CLOSURE.md` and `docs/dra/DRA-GC2-REV-001-CANDIDATE-ADMISSION-REVIEW.md`. This is the programme's one confirmed, disclosed, unfixed material limitation (English/Spanish Stage 5 materiality divergence) and a rejected attempt to fix it. Treat the rejection as a positive methodological result, not a hidden failure — it is reported openly for exactly this reason.
6. **DRA-VAL-002, the targeted follow-up study.** `docs/dra/DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md` and `docs/dra/DRA-VAL-002-ENGLISH-HTML-BLIND-VALIDATION-REPORT.md`. This closed the one coverage gap GEN-001 left open (unseen English HTML), using persisted raw source bytes rather than live re-fetch.
7. **The statistical erratum.** `docs/dra/DRA-GEN-001-STATISTICAL-ERRATUM.md`. Documents a corrected rule-of-three approximation (≤3.0% → ≤4.0% at n=75) found during the manuscript audit, applied for citation purposes without modifying the original, historical GEN-001 reports. Cite the corrected figure; understand why the original reports were left untouched.
8. **Reproducibility instructions.** `docs/dra/DRA-REPRODUCIBILITY.md`. Explains Mode A (frozen-evidence reproduction, no network required — this is what you should attempt first) versus Mode B (live-source re-fetch verification, which is optional, non-gating, and known to fail for a meaningful fraction of sources through no fault of the evaluator). Follow Mode A's exact commands to reproduce DRA-GC-1's, DRA-GEN-001's, and DRA-VAL-002's frozen identities locally.
9. **Proof-receipt verification.** Every evaluation's proof receipt binds evaluator identity, input identity, stage-by-stage record, and decision into a single recomputable digest (manuscript, Section 3 and Section 13). Independently recompute at least one receipt's digest by hand or with your own tooling rather than trusting the repository's own verification code — this is the single strongest check available to a reviewer who has not yet built independent tooling.

## What an external review could most usefully do

- Independently re-implement, or independently re-run, DRA-GC-1's evaluation pipeline against a sample the reviewer selects (not one this programme selected).
- Attempt Mode B (live-source) reproduction on a fresh sample and report failure/drift rates for comparison against this programme's own measured rates.
- Adversarially probe the Spanish-language Stage 5 materiality limitation (Section 9 of the manuscript) with test cases this programme has not already constructed.
- Assess whether the claim-boundary register (`DRA-PUBLIC-CLAIMS.md`) is in fact honoured throughout every public-facing document, including this one.

## What this document is not

It is not a validation report, a peer-review certificate, or evidence that any of the above steps have already been carried out by anyone outside this research programme. It is an entry point, prepared in advance of that work, by the same programme whose evidence it describes.
