# DRA-PUB-005 — Publication Identity and Governance

**Status:** GOVERNANCE RECORD — no scientific content.
**Scope:** This document is the canonical, authoritative record of DRA's public identity and of the DRA-001 governance resolution performed under DRA-PUB-005. It makes no scientific, evaluator, corpus, or evidence-bearing change of any kind.

---

## 1. Canonical identity

| Field | Value |
|---|---|
| Canonical public name | Document Reliability Assurance |
| Canonical acronym | DRA |
| Published research candidate | DRA-GC-1 |
| Evaluator | DRA Evaluator `0.1.2` |
| Pipeline | DRA Pipeline `1.0` |
| Model/schema | `0.1.0` |
| Development corpus | `DRA-CORPUS-1.0.0` |
| Publication manuscript | DRA-PUB-MANUSCRIPT-1 (`docs/dra/DRA-PUB-003-MANUSCRIPT.md`) |
| Publication edition | DRA-PUB-004 |
| Research manuscript title | *Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents* |

The manuscript title is not renamed. DRA-GC-1 is not renamed. No `DRA-SPEC-1.0` or "DRA Specification" identity is created or declared at this stage.

At the current publication stage, DRA is described only as: research work, a research programme, a document-assurance methodology, a deterministic evidence-auditable evaluator, a reference evaluator, or (where technically accurate) a reference implementation. DRA is not described as an industry standard, certification standard, formally adopted standard, independently validated system, or production-ready trust infrastructure — see `docs/dra/DRA-PUBLIC-CLAIMS.md` for the full, binding claim-boundary register, which already enforced this vocabulary discipline prior to DRA-PUB-005 and required no correction for these specific phrases.

## 2. Governance decisions

1. **DRA-001 is retained** as a historical founding programme specification (`docs/dra/DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md`). It is not deleted, and none of its original scientific or programme content (problem statement, scientific foundation, Version 1 scope, the frozen seven-stage pipeline design, the frozen nine issue classes, decision semantics, proof-receipt requirements, limitations, deferred work, or normative references) has been retrospectively rewritten.
2. **DRA-001 is superseded as current programme authority.** Its governance status is changed from `ACTIVE — AUTHORITATIVE` to `HISTORICAL — SUPERSEDED AS PROGRAMME AUTHORITY`, with a supersession notice added directly beneath the status line (see §3 below and the edited file itself).
3. **DRA-001 is not the normative description of the published DRA-GC-1 research state.** The originally-specified seven-stage pipeline and AI-generated-document-only scope have been materially superseded by subsequent engineering (an eight-stage evaluator, per `DRA-PUB-004-EDITION.md` and the manuscript), corpus admission of non-AI-generated public-sector/legislative/scientific documents, DRA-GC-1 freezing, DRA-GEN-001 blind generalisation testing, DRA-VAL-002 targeted validation, and DRA-PUB-001 through DRA-PUB-004 publication synthesis. DRA-001's historical seven-stage/nine-issue-class design and its AI-generated-document scope statement are preserved verbatim as a historical record of the programme's starting point, not edited to match later results.
4. **DRA-GC-1 remains immutable and is not renamed.** No file in `lib/dra-reference/src/{normalisation,claim-extraction,authority-resolution,evidence-linkage,materiality-assessment,pipeline,model,shared}` or any GC-1 freeze-record file was modified by DRA-PUB-005. The GC-1 aggregate digest is unchanged (verified in `docs/dra/DRA-PUB-005-REPORT.md` §6).
5. **DRA-PUB-005 makes no scientific change.** No evaluator behaviour, decision semantics, issue-class semantics, corpus content, or experimental result was altered.
6. **No evaluator behaviour changes.** Evaluator identity remains `0.1.2`; pipeline remains `1.0`; model/schema remains `0.1.0`.
7. **No corpus changes.** The development corpus identity remains `DRA-CORPUS-1.0.0`; no document was added, removed, or reclassified.
8. **No GEN-001 or VAL-002 changes.** Neither study's protocol, sample, evidence, outputs, results, or bindings were modified.
9. **No issue-class or decision-semantic changes.** The nine issue classes, their trigger conditions, and the SUPPORTED/REVIEW/HOLD decision semantics are unchanged.
10. **No claim-boundary changes.** `docs/dra/DRA-PUBLIC-CLAIMS.md` was audited (see `DRA-PUB-005-REPORT.md` §7) and required no edits — its canonical wording, prohibitions, and qualifications were already fully consistent with this governance record.
11. **No `DRA-SPEC-1.0` is being issued at this stage.** No implementation-independent technical specification is declared, named, or implied to exist as part of DRA-PUB-005.
12. **A future implementation-independent DRA technical specification may be developed separately**, after publication and external scrutiny of the current research-stage material. This is noted as a possible future direction only; it is not scheduled, scoped, or committed to by this record.
13. **The current publication is not described as an industry standard, certification standard, independently validated system, or production-ready trust infrastructure**, anywhere in the publication-facing documentation audited under DRA-PUB-005 (see the repository-wide terminology audit in `docs/dra/DRA-PUB-005-REPORT.md` §7).

## 3. DRA-001 supersession notice (as applied)

The following notice was added directly beneath DRA-001's document header, and its status line was changed. No other text in the document was altered:

> **Status:** HISTORICAL — SUPERSEDED AS PROGRAMME AUTHORITY
>
> ## Governance notice (added by DRA-PUB-005, publication-governance closure)
>
> DRA-001 records the founding Version 1 programme specification and is preserved as a historical research artefact. Subsequent robustness engineering, DRA-GC-1 freezing, blind generalisation testing, targeted validation, and publication synthesis materially evolved the implemented research system. DRA-001 is therefore not the normative description of the published DRA-GC-1 research state. No original scientific or programme content in this document has been retrospectively rewritten.
>
> See `docs/dra/DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md` for the full governance record.

## 4. Scope note on sibling DRA-001-era governance documents

Three further documents share DRA-001's `ACTIVE — AUTHORITATIVE` status line and are programmatically scoped to "DRA-001 — Document Release Assurance, Version 1": `docs/dra/DRA-001-13-AUTHORITATIVE-ENGINEERING-BACKLOG.md`, `docs/dra/DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md`, and `docs/dra/DRA-ENGINEERING-EVIDENCE-STANDARD.md`. The governing DRA-PUB-005 instructions named only `DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md` for a status correction; per the "make only the minimum governance/identity changes required" and "do not perform blind global replacements" principles, these three sibling documents were **not** edited under DRA-PUB-005. They are documented here, and classified in the repository-wide audit (`DRA-PUB-005-REPORT.md` §7), as historical process artefacts whose own supersession is a plausible future governance action but is explicitly out of this task's authorised scope. This is a deliberate scope boundary, not an oversight.

## 5. Relationship to DRA-PUB-004

DRA-PUB-005 does not modify, reopen, or supersede DRA-PUB-004. DRA-PUB-004 remains the current publication edition (PDF, HTML, release package, checksums). DRA-PUB-005 is a governance-only correction layer applied on top of the existing DRA-PUB-004 publication state, addressing public-identity and DRA-001-governance concerns that DRA-PUB-004 did not itself scope to resolve.
