# DRA-PUB-007 — Documentation and Publication Licence Governance

**Document identifier:** DRA-PUB-007
**Status:** ACTIVE — AUTHORITATIVE (publication-licensing governance only)
**Established:** DRA-PUB-007 (Documentation and Publication Licence Closure)
**Closes:** the licensing residual disclosed in `docs/dra/DRA-PUB-006-REPORT.md` §13, residual risk #1.

## Decision

| Material | Licence |
|---|---|
| Software/source code (evaluator, pipeline, tooling, tests) | **MIT** — unchanged; see root `LICENSE`. |
| Original DRA research/documentation (manuscript, reports, protocols, freeze/governance records, diagrams, explanatory documentation) | **CC-BY-4.0** — Creative Commons Attribution 4.0 International; see root `LICENSE-DOCUMENTATION` and `docs/dra/DRA-LICENSING.md`. |
| Third-party content (documents, source materials, extracts, datasets) | **ORIGINAL UPSTREAM LICENCE** — never relicensed by DRA under MIT or CC BY 4.0; see `docs/dra/DRA-ATTRIBUTION.md` and `docs/dra/DRA-THIRD-PARTY-LICENSING.md`. |
| Third-party material without sufficiently established public redistribution rights | **EXCLUDE FROM PUBLIC SOURCE REPOSITORY UNLESS REDISTRIBUTION RIGHTS ARE ESTABLISHED** — applies to every referenced-only corpus/study document; the only exception is the 25 DRA-VAL-002 raw-byte files, individually cleared `REDISTRIBUTION_VERIFIED` under DRA-PUB-002. |

## Boundaries (explicit)

- MIT does **not** automatically govern the DRA research manuscript, reports, or other original documentation — that material is CC-BY-4.0, distinctly licensed from the software.
- CC BY 4.0 does **not** govern DRA software unless a specific file separately and explicitly indicates it (none currently does).
- CC BY 4.0 does **not** relicense third-party material, including short quotations, extracts, or figures sourced from third parties and embedded within an otherwise CC-BY-4.0-licensed DRA document. CC BY 4.0 applies only to material for which the DRA author holds the necessary rights.
- Per-file or per-passage third-party licences and explicit notices take precedence over this document's and `DRA-LICENSING.md`'s general MIT/CC BY 4.0 declarations, for the specific material they cover.
- This decision changes **publication licensing only**. It does not add, remove, reinterpret, or otherwise affect any scientific claim, evaluator behaviour, corpus content, experimental result, issue-class semantics, decision semantics, accepted limitation, or the DRA-GC-1 identity.
- No scientific content, evidence, protocol, receipt, or historical experimental record was changed by this task.

## Rationale

DRA-PUB-006's repository-safety audit found that `package.json` declared `"license": "MIT"` and a root `LICENSE` file existed, but no licence had ever been declared for the manuscript and documentation text itself — a disclosed, non-blocking residual, not a defect requiring urgent remediation, but an open item that should be closed before any actual external publication. This task closes that residual with the licensing architecture specified by the governing task: MIT for software (unchanged), CC BY 4.0 for original DRA-authored documentation (newly declared), and an explicit, unambiguous boundary preventing either licence from being read as covering third-party material.

## Historical-record treatment

One historical/staging record, `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md`, previously stated the licence field as "MIT (DRA-authored code and documentation only)". This document is explicitly a "prepared, not filed" deposit-metadata staging record (no external deposit has ever been made from it), not a frozen historical audit report of a past programme state — it exists specifically to be kept current until an actual deposit occurs. It was therefore updated directly to reflect this decision, rather than left as a stale claim requiring a separate superseding pointer. No other document was found describing DRA's documentation as MIT-licensed in a way that constituted a frozen historical claim requiring preservation-in-place; see `docs/dra/DRA-PUB-007-REPORT.md` §"Repository-wide licence terminology audit" for the full search record.

## Cross-references

- `docs/dra/DRA-LICENSING.md` — the complete, detailed licensing boundary (software / documentation / third-party / restricted-redistribution / precedence).
- `docs/dra/DRA-THIRD-PARTY-LICENSING.md` — publication-oriented third-party licence category inventory.
- `docs/dra/DRA-ATTRIBUTION.md` — complete per-document licence/public-domain breakdown of persisted third-party material (unchanged by this task).
- `docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md` — updated to reflect the three-way licence split for the curated public repository.
- `docs/dra/DRA-PUB-006-PUBLIC-REPOSITORY-EXPOSURE-AUDIT.md` / `DRA-PUB-006-REPORT.md` — the audit that identified this residual.
- `docs/dra/DRA-PUB-007-REPORT.md` — full execution report for this task, including verification results.
