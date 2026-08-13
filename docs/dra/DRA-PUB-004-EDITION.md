# DRA-PUB-004 — Publication Edition Record

## Purpose

This document establishes **DRA-PUB-004** as a publication *edition* — a production/packaging identity distinct from, and strictly downstream of, the frozen scientific manuscript it renders and packages. DRA-PUB-004 is a publication-production and archival-release programme, not a research or manuscript-development programme. It performs no scientific work and makes no new scientific claims.

## Identity

| Field | Value |
|---|---|
| Publication edition identifier | `DRA-PUB-004` |
| Scientific source (frozen manuscript) | `DRA-PUB-MANUSCRIPT-1` |
| Frozen manuscript path | `docs/dra/DRA-PUB-003-MANUSCRIPT.md` |
| Frozen manuscript SHA-256 | `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e` |
| Frozen manuscript word count | 6,315 |
| Freeze receipt | `docs/dra/DRA-PUB-MANUSCRIPT-1-FREEZE-RECEIPT.md` |
| Manuscript scientific-readiness verdict | `MANUSCRIPT_SCIENTIFICALLY_READY` (`docs/dra/DRA-PUB-003A-AUDIT-REPORT.md`) |
| Edition preparation date | 2026-08-12 |
| Source repository commit at edition preparation | see `docs/dra/DRA-PUB-004-REPORT.md` §"Files created/modified" for the exact commit recorded at verification time |

## What this edition is

DRA-PUB-004 produces, from the immutable `DRA-PUB-MANUSCRIPT-1` bytes above and without altering them:

1. A publication-quality PDF rendering — `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf`.
2. A standalone archival HTML rendering — `docs/dra/release/DRA-PUB-004-MANUSCRIPT.html`.
3. A clean, manifest-compliant release package/archive.
4. Supporting release metadata: checksum ledger, citation metadata validation, licensing/README decisions, and an external-reviewer entry document.

## What this edition is not

- It is **not** a scientifically modified successor to `DRA-PUB-MANUSCRIPT-1`. No wording, table value, statistic, claim, or conclusion has been changed.
- It does **not** constitute external or third-party validation. DRA-GC-1 remains a research-stage evaluator with no external, independent validation performed by any party outside this research programme.
- It does **not** claim any DOI, journal, conference, or institutional affiliation. None exists as of this edition.
- It does **not** re-open, re-litigate, or extend any of the frozen evidence artefacts it packages (DRA-GC-1, GEN-001, ENG-026, GC2-REV-001, VAL-002, historical reports, proof receipts, or the manuscript's own claim boundaries).

## Authority in case of apparent conflict

If any rendered artefact produced under DRA-PUB-004 (PDF, HTML, or any excerpt) ever appears to disagree with the frozen Markdown manuscript on substance, the frozen Markdown source at path `docs/dra/DRA-PUB-003-MANUSCRIPT.md`, verified against SHA-256 `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e`, is authoritative. Any such disagreement found during this edition's preparation would be a publication-production defect to be corrected in the rendering, not a licence to alter the manuscript; none was found (see `docs/dra/DRA-PUB-004-REPORT.md` §"Preflight results").

## Escalation discipline

Per the governing instructions for this programme, this edition:

- Never modifies the frozen manuscript, DRA-GC-1, corpus evidence, GEN-001, ENG-026, GC2-REV-001, VAL-002, historical reports, proof receipts, or scientific claim boundaries.
- Treats any genuine scientific contradiction discovered during production as an escalation trigger, not a silent-edit opportunity. None was found during this edition's preparation.
