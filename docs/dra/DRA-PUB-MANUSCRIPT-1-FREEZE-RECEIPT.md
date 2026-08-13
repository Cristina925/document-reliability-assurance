# DRA-PUB-MANUSCRIPT-1 — Publication Manuscript Freeze Receipt

| Field | Value |
|---|---|
| Freeze identifier | `DRA-PUB-MANUSCRIPT-1` |
| Manuscript path | `docs/dra/DRA-PUB-003-MANUSCRIPT.md` |
| Final title | *"Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents"* |
| Final word count | **6,315 words** (`wc -w`; the corrected, post-DRA-PUB-003A-audit version — not the 6,244-word pre-audit version) |
| SHA-256 digest of manuscript bytes | `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e` |
| Freeze date | 2026-08-12 |
| Repository commit | `156ac59a106e898c73380564e7a3080325938ee9` |
| Claim-register reference | `docs/dra/DRA-PUBLIC-CLAIMS.md`, as last modified at commit `065c3b3388f423d3e9e9959dffbfa13197865992`; re-audited against the frozen manuscript under DRA-PUB-003A with no violation found |
| Statistical-erratum reference | `docs/dra/DRA-GEN-001-STATISTICAL-ERRATUM.md` (corrects a rule-of-three arithmetic error in the historical GEN-001 reports from ≤3.0% to ≤4.0% at n=75; the manuscript already cites the corrected figure directly and required no further edit to incorporate the erratum) |
| Audit reference | `docs/dra/DRA-PUB-003A-AUDIT-REPORT.md` |
| Frozen evidence-artefact modification | **None.** No evaluator, corpus, governance, GC-1, GEN-001, ENG-026, GC2-REV-001, VAL-002, or proof-receipt artefact was modified in producing this freeze. The two historical GEN-001 reports named in the statistical erratum remain byte-identical to their pre-audit state. |
| Publication status | **Frozen publication candidate.** This is the exact byte content approved for external release under `DRA-PUB-MANUSCRIPT-1`. Any future substantive change to the manuscript requires a new, distinct freeze identifier (e.g. `DRA-PUB-MANUSCRIPT-2`) rather than mutating this record. |

## What this receipt certifies

`DRA-PUB-MANUSCRIPT-1` is the specific, byte-identical version of `docs/dra/DRA-PUB-003-MANUSCRIPT.md` — incorporating every correction made under DRA-PUB-003A (the rule-of-three/Wilson-CI fix, the "majority" wording fix, the language/script terminology fixes, the "independently reproduced" softenings, the Section 15 scope qualifier and canonical-blindness wording, and the Table 5 defect-citation completeness fix) — that this programme designates as its publication candidate. The digest above is computed directly over the manuscript file's current bytes and can be independently re-verified at any time with `sha256sum docs/dra/DRA-PUB-003-MANUSCRIPT.md`.

This freeze record itself is a publication-layer artefact, analogous in spirit to `DRA-GC-1-FREEZE-RECEIPT.md` but scoped to the manuscript rather than the evaluator: it fixes an identity (byte digest) for citation and distribution purposes and does not alter, supersede, or reduce the authority of any evaluator/evidence freeze (DRA-GC-1, DRA-GEN-001, DRA-VAL-002) it describes.

## Relationship to the statistical erratum

This freeze incorporates the manuscript as corrected during DRA-PUB-003A, which already states the accurate GEN-001 75/75 confidence bound (Wilson 95% CI `[95.1%, 100%]`; rule-of-three ≤4.0%) directly in its own text. The erratum document (`DRA-GEN-001-STATISTICAL-ERRATUM.md`) exists to explain that correction's relationship to the historical GEN-001 reports it does not modify; no further manuscript edit was required or made to incorporate the erratum, and the manuscript's word count and digest are unaffected by the erratum's creation.

## Verification

To independently verify this freeze:

```
sha256sum docs/dra/DRA-PUB-003-MANUSCRIPT.md
# expected: 5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e
wc -w docs/dra/DRA-PUB-003-MANUSCRIPT.md
# expected: 6315
```
