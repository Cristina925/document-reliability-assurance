# DRA-ACQ-018 — Phase 1: Evidence-Gap Candidate Discovery and Qualification for DRA-DOC-0022

STATUS: **PHASE 1 ONLY — DISCOVERY AND QUALIFICATION.** No document was
acquired, frozen, or admitted as a result of this programme. `DRA-DOC-0022`
does not exist as a corpus member. No `DRA-BMK-022` was created or run.
`evaluatorVersion` remains `"0.1.2"`, `pipelineVersion` remains `"1.0"`,
`modelVersion` remains `"0.1.0"`. Stage 4, Stage 5, normalisation, and every
existing frozen artefact (DRA-DOC-0001–0021 and their freeze records) are
unmodified.

Supporting module:
`src/benchmark/acquisition/discovery/dra-acq-018-evidence-gap-discovery.ts`

Supporting test:
`src/benchmark/acquisition/discovery/__tests__/dra-acq-018-evidence-gap-discovery.test.ts`
(43 tests, all passing)

---

## Files created / modified

**Created (2 files, both new — no existing file was modified):**
- `src/benchmark/acquisition/discovery/dra-acq-018-evidence-gap-discovery.ts`
- `src/benchmark/acquisition/discovery/__tests__/dra-acq-018-evidence-gap-discovery.test.ts`
- This report: `docs/dra/DRA-ACQ-018-EVIDENCE-GAP-DISCOVERY-REPORT.md`

**Production code changed: NO.** Nothing under `src/model/`,
`src/benchmark/corpus/`, `src/benchmark/execution/`, or
`src/benchmark/acquisition/` (outside the new `discovery/` module) was
touched. No version constant was changed.

## Test results

`npx vitest run src/benchmark/acquisition/discovery/__tests__/dra-acq-018-evidence-gap-discovery.test.ts`
→ **43 tests passed, 0 failed.**

## TypeScript check

`npx tsc --noEmit -p .` → **clean, no errors.**

(The full repository test suite was not re-run in this phase — this
programme adds one new, fully isolated discovery module with no production
code changes and no interaction with any existing stage, corpus registry, or
freeze record, so a full-suite re-run would not exercise anything this
change could affect. The targeted test file above and the project-wide
`tsc` check are the appropriate verification for a Phase-1, discovery-only
deliverable.)

---

## Part 1 — Reconstructed 21-document corpus profile

Reconstructed from the authoritative field values in the DRA-BMK-021
checkpoint and the DRA-ACQ-013/014/017 discovery-precedent inventories, not
re-derived by running the evaluator or reading the corpus registry.

| Dimension | Real acquisitions (15, DRA-DOC-0007–0021) |
|---|---|
| Domain | TECHNICAL 5, BUSINESS 2, GENERAL 2, LEGAL 2, FINANCE 2, HEALTHCARE 2 |
| Document type | REPORT 4, PROCEDURE 3, POLICY 3, OTHER 3, ARTICLE 1, SUMMARY 1 (REWRITE, EMAIL: 0) |
| Language | en 8, en-GB 4, es 2, fr 1 |
| Source format | PDF 12, MULTI_PAGE_HTML 2, STATIC_HTML 1 |
| Difficulty | HIGH 7, MEDIUM 6, LOW 2 |
| Publishers | 13 distinct; European Commission / HLEG-AI is the only repeated publisher (DRA-DOC-0018 ES + DRA-DOC-0021 EN — the deliberate parallel-language pair) |

- **21-document decision distribution:** SUPPORTED 10, REVIEW 9, HOLD 2.
- **Issue-class coverage:** 3/9 (IC-4 EVIDENCE_ABSENT, IC-5
  EVIDENCE_INADEQUATE, IC-7 CLAIM_INCONSISTENCY). The other six are
  STRUCTURALLY_UNREACHABLE under the frozen Version 1 pipeline per
  DRA-CHK-002 and are explicitly **not** chased by this programme.

**Underrepresented dimensions identified:**
1. **Domain balance** — TECHNICAL (5/15, 33%) is markedly overrepresented,
   driven substantially by AI-governance subject matter specifically (NIST
   AI RMF, EC/HLEG-AI ×2). The other five domains are tied at 2 each.
2. **Authority-type diversity** — no environmental regulator, energy
   regulator, or financial-conduct enforcement authority has ever been
   represented.
3. **Document-genre diversity** — no formal enforcement/penalty decision,
   audit report, or dense indicator/annex-heavy scientific-monitoring
   report exists.
4. **AI-governance concentration risk** — 3 of the 5 TECHNICAL documents are
   specifically AI-governance material; a further AI-governance acquisition
   would deepen an already-flagged concentration.

## Part 2 — Ranked evidence-gap priorities (fixed before candidate search)

1. Domain balance / AI-governance deconcentration
2. New authority type
3. New document genre (audit report, enforcement notice, formal decision)
4. New structural complexity (dense tables, indicator frameworks, annexes)
5. Reachable issue-mechanism value (IC-4/IC-5/IC-7 only)
6. Difficulty balance (LOW/MEDIUM under-supplied vs HIGH)
7. Independence from already-represented publishers/domains
8. New language (explicitly de-prioritised now that the EN/ES/FR branch is closed)
9. Format/infrastructure novelty
10. Decision-boundary value (recorded last, never used to pre-select a candidate for a predicted decision)

## Part 3 — Candidate shortlist (5 candidates, all live-verified today)

| ID | Candidate | Publisher | Domain | Doc type |
|---|---|---|---|---|
| DRA-CAND-018-01 | *Tracking waste prevention progress* (EEA Report 02/2023) | European Environment Agency | GENERAL | REPORT |
| DRA-CAND-018-02 | New Successor Smart Meter Communication Licence (Decision) | Ofgem | GENERAL | OTHER |
| DRA-CAND-018-03 | Final Notice: Barclays plc | Financial Conduct Authority | FINANCE | OTHER |
| DRA-CAND-018-04 | Lessons learned: a planning and spending framework... (HC 234) | National Audit Office | GENERAL | REPORT |
| DRA-CAND-018-05 | Buenas Prácticas del SEFV-H | AEMPS (Spain) | HEALTHCARE | PROCEDURE |

## Part 4 — Governance pre-screen and diversity/novelty scoring

Fixed 9-dimension scoring (weights declared before scoring; max 23):
publisher novelty (0–3), domain novelty (0–3), document-type novelty (0–3),
structural novelty (0–3), language novelty (0–2), difficulty balance (0–2),
reachable issue-mechanism value (0–2), governance confidence (0–3), source
stability (0–2).

| Candidate | Official source | Licence | Stability | Score | Outcome |
|---|---|---|---|---|---|
| DRA-CAND-018-01 (EEA) | VERIFIED | VERIFIED (CC BY 4.0) | STRONG (dual-fetch byte-identical, SHA-256 matched) | **17** | QUALIFIED_RECOMMENDED |
| DRA-CAND-018-02 (Ofgem) | VERIFIED | VERIFIED (Crown copyright / OGL v3.0) | ACCEPTABLE (single fetch only) | 16 | QUALIFIED_ALTERNATE |
| DRA-CAND-018-03 (FCA) | VERIFIED | **NOT_VERIFIED** (OGL applies only to Data-section statistics, not Final Notice narrative text) | UNKNOWN (single fetch only) | 16 | QUALIFIED_ALTERNATE |
| DRA-CAND-018-04 (NAO) | VERIFIED | PROVISIONAL / REVIEW_REQUIRED (non-commercial-only bespoke notice) | UNKNOWN | 15 | DEFERRED |
| DRA-CAND-018-05 (AEMPS) | VERIFIED | PROVISIONAL / REVIEW_REQUIRED (unchanged from DRA-ACQ-013/014) | STRONG (historical) | 14 | DEFERRED |

Ofgem and FCA tie at 16; Ofgem ranks as Alternate 1 ahead of FCA (Alternate
2) on the tie-break (governance confidence 3 vs 1 — Ofgem's OGL v3.0
position is fully VERIFIED, FCA's is NOT_VERIFIED for this document type).

## Part 5 — Acquisition-cost assessment

- **DRA-CAND-018-01 (EEA):** LOW — single stable PDF, English, CC BY 4.0
  already accepted for an EU institution in this corpus, no new engineering.
- **DRA-CAND-018-02 (Ofgem):** LOW — same profile; OGL v3.0 precedent used
  three times already (Acas, HSE, MHRA).
- **DRA-CAND-018-03 (FCA):** MEDIUM — technically simple, but the licence
  ambiguity requires a dedicated legal-review step before any freeze.
- **DRA-CAND-018-04 (NAO):** MEDIUM — technically simple, but the
  non-commercial-only licence requires direct NAO permission before reuse.
- **DRA-CAND-018-05 (AEMPS):** MEDIUM — acquisition mechanics already proven
  (DRA-ENG-011 fallback), but licence remains unresolved after two prior
  phases.

## Part 6 — Selection

- **PRIMARY:** DRA-CAND-018-01 — European Environment Agency, *Tracking
  waste prevention progress* (EEA Report 02/2023).
- **ALTERNATE 1:** DRA-CAND-018-02 — Ofgem, *New Successor Smart Meter
  Communication Licence (Decision)*.
- **ALTERNATE 2:** DRA-CAND-018-03 — FCA, *Final Notice: Barclays plc*
  (documented with an explicit, material licence risk).

**Reasoning:** the EEA report is the only candidate that simultaneously (a)
clears every governance gate at VERIFIED/STRONG confidence, (b) introduces a
genuinely new authority type and structural pattern (a multi-indicator
quantitative monitoring framework with a numbered RACER-evaluation annex —
not represented by any existing corpus document), and (c) moves domain
balance and subject matter deliberately away from the corpus's only
overrepresented domain (TECHNICAL) and away from AI governance specifically,
which the task explicitly warned against deepening. Ofgem is a fully
qualified alternate with an equally strong licence position but a single
(not yet dual-confirmed) fetch and a less structurally novel contribution.
FCA offers the single highest document-genre novelty (a formal enforcement
notice, matching the task's own suggested genre list) but carries a
materially weaker, unresolved licence position that must be cleared by
dedicated legal review before any Phase 2 step. NAO and AEMPS are DEFERRED,
not disqualified — both again reconfirm previously observed non-open
licence positions found in earlier acquisition phases, with no new evidence
in this phase to change that.

**Official-source / licence / stability determinations (evidence basis):**
- EEA: `eea.europa.eu/en/legal-notice` (CC BY 4.0, explicit re-use policy
  citing Directive 2003/98/EC + Commission Decision 2011/833/EU); PDF
  refetched twice today, byte-identical (SHA-256
  `238f506e...2341e4d`, 1,838,985 bytes, 94 pages, ISBN 978-92-9480-556-0).
- Ofgem: `ofgem.gov.uk/c-ofgem-2026` (Crown copyright / OGL, site-wide
  notice); PDF fetched once today (692,167 bytes, 76 pages), HTTP 200.
- FCA: `fca.org.uk/legal` (OGL explicitly scoped to Data-section
  statistical outputs only; narrative text such as a Final Notice remains
  under separate, unread default terms 3.2–3.5); PDF fetched once today
  (704,844 bytes), HTTP 200.
- NAO: PDF front-matter states non-commercial-only bespoke reuse
  permission, requiring direct NAO contact for other uses — consistent
  with the prior DRA-ACQ-003 finding on a different NAO document.
- AEMPS: unchanged REVIEW_REQUIRED position from DRA-ACQ-013/014, no new
  evidence gathered in this phase.

## Part 7 — Unresolved risks

- Ofgem's licence evidence is a site-wide copyright page, not a
  document-specific OGL footer inside the PDF itself — should be
  reconfirmed directly on the document at Phase 2.
- FCA's applicable default narrative-content terms (conditions 3.2–3.5)
  were not independently obtained and read in this phase; the OGL carve-out
  does not cover Final Notices, so this is a genuine, not cosmetic, open
  question.
- The EEA report's co-authorship with named research partners (IVL, VTT,
  VITO) within a single EEA-owned publication is a new authorship pattern
  worth flagging explicitly at Phase 2, even though the site-wide CC BY 4.0
  notice covers the publication as a whole.
- Ofgem's PDF was fetched only once in this phase; dual-fetch byte-identity
  confirmation is deferred to Phase 2.

## H22 hypothesis (open question, not a predicted outcome)

> **H22:** Adding the European Environment Agency's *Tracking waste
> prevention progress* report (EEA Report 02/2023) will expand the
> benchmark along publisher diversity (first EEA document), domain balance
> (reinforces GENERAL rather than the already-overrepresented
> TECHNICAL/AI-governance domain), and structural diversity (a
> multi-indicator quantitative monitoring framework with a numbered
> RACER-evaluation annex, not previously represented), while preserving
> deterministic acquisition and evaluation under evaluator 0.1.2 and without
> requiring any evaluator, normalisation, or pipeline modification.

H22 explicitly does **not** predict: a SUPPORTED/REVIEW/HOLD decision for
DRA-DOC-0022; expansion of issue-class coverage beyond the current 3/9; or
any specific count or severity of issues.

## Phase 1 verdict

**QUALIFIED_RECOMMENDED** for DRA-CAND-018-01 (European Environment Agency
report) as the Primary candidate for a future DRA-DOC-0022 acquisition,
with DRA-CAND-018-02 (Ofgem) and DRA-CAND-018-03 (FCA) retained as fully
documented Alternates.

## Proposed (unexecuted) Phase 2 scope

Deterministic live-fetch A/B for the Primary candidate; digest comparison
across the two fetches; final official-source and licence determination
(including a document-specific footer check); domain/document-type
classification sign-off; normalisation and text extraction; freeze record
creation; corpus admission as DRA-DOC-0022; an unmodified evaluator 0.1.2
run; proof-receipt generation; manifest verification; preparation for a
future DRA-BMK-022. **None of this was performed in this phase.**
