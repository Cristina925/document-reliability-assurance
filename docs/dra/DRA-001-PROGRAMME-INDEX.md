# DRA-001 Programme Index

**Document identifier:** DRA-001-IDX  
**Status:** ACTIVE — AUTHORITATIVE  
**Version:** 1.0  
**Established:** DRA-001-CONS-001 (Programme Artefact Consolidation)  
**Programme:** DRA-001 — Document Release Assurance, Version 1

---

## 1. Programme Identity

| Field | Value |
|---|---|
| Programme | Document Release Assurance — Version 1 |
| Identifier | DRA-001 |
| Scientific foundation | CTS v0.1 (source commit `17cb968`, publication commit `7af039c`) |
| Current phase | **Gate 1 — Engineering Implementation** |
| Current milestone | **DRA-001-04A — Benchmark Corpus Schema and Registry — COMPLETE** |
| Next milestone | **DRA-001-04B — Benchmark Corpus Population** |

---

## 2. Active Governing Artefacts

These are the four active governing documents for DRA-001 Version 1. No other planning or governance documents are active.

| # | Identifier | Title | Path | Status |
|---|---|---|---|---|
| 1 | DRA-001 | Version 1 Programme Specification | `docs/dra/DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md` | ACTIVE — AUTHORITATIVE |
| 2 | DRA-001-13 | Version 1 Authoritative Engineering Backlog | `docs/dra/DRA-001-13-AUTHORITATIVE-ENGINEERING-BACKLOG.md` | ACTIVE — AUTHORITATIVE |
| 3 | DRA-VBP-001 | DRA Verification and Benchmark Protocol | `docs/dra/DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md` | ACTIVE — AUTHORITATIVE |
| 4 | DRA-EES-001 | DRA Engineering Evidence Standard | `docs/dra/DRA-ENGINEERING-EVIDENCE-STANDARD.md` | ACTIVE — AUTHORITATIVE |

---

## 3. Superseded Artefacts

The following identifiers were reviewed during consolidation (DRA-001-CONS-001). All were NOT PRESENT in the repository. They are listed here as superseded/absorbed to prevent their re-creation as standalone documents. Any content from prior session discussions associated with these identifiers has been preserved in the four active governing documents above.

| Identifier | Former title | Disposition | Content preserved in |
|---|---|---|---|
| DRA-001-14 | Engineering Execution Protocol | NOT PRESENT — identifier retired | DRA-001-13 (milestone sequencing) + DRA-EES-001 (evidence standard) |
| DRA-ENG-000 | Engineering Milestone Execution Standard | NOT PRESENT — identifier retired | DRA-EES-001 |
| DRA-ENG-START | (no formal title) | NOT PRESENT — identifier retired | DRA-001-13 §3 Phase 1 |
| DRA-ENG-REPORT-001 | (no formal title) | NOT PRESENT — identifier retired | DRA-EES-001 §3 |
| DRA-ENG-001 | **RESERVED — Existing Repository Assessment and Engineering Baseline** | Identifier permanently reserved for first engineering implementation milestone | DRA-001-13 §3 Phase 1 |
| DRA-ENG-001A | Execution Instruction | NOT PRESENT — identifier retired | DRA-EES-001 §5 |
| DRA-ENG-001B | Implementation Brief | NOT PRESENT — identifier retired | DRA-EES-001 §3 |
| DRA-ENG-001X | Engineering Work Request | NOT PRESENT — identifier retired | DRA-001-13 (milestone definitions) |
| DRA-ENG-001-EXEC | Engineering Execution Handoff | NOT PRESENT — identifier retired | DRA-001-13 + DRA-EES-001 |
| DRA-ENG-GOV-001 | Engineering Progress Principle | NOT PRESENT — identifier retired | DRA-EES-001 §2 (lifecycle) + §6 (PASS/PARTIAL/FAIL) |
| DRA-001-15 | Transition to Evidence-Driven Engineering | NOT PRESENT — identifier retired | DRA-001 §4 (scope) + DRA-001-13 §5 (gate boundaries) |

---

## 4. Reserved Identifiers

| Identifier | Reserved for | Notes |
|---|---|---|
| DRA-ENG-001 | Existing Repository Assessment and Engineering Baseline | **Do not use for any other purpose.** First engineering implementation milestone. |
| DRA-ENG-002 | Canonical Data Model | Next substantive implementation milestone after DRA-ENG-001. |
| DRA-001-CONS-001R | Programme Artefact Consolidation Report | Consolidation report produced by this consolidation milestone. |

---

## 5. Frozen Version 1 Scope

The following are frozen for Version 1 and must not be changed during engineering:

- Seven-stage evaluator pipeline (defined in DRA-001 §5).
- Nine issue classes (defined in DRA-001 §6).
- SUPPORTED / REVIEW / HOLD decision semantics (defined in DRA-001 §7).
- Proof receipt requirements (defined in DRA-001 §8).
- Benchmark methodology (defined in DRA-VBP-001).

---

## 6. Current Programme Phase

**Gate 1 — Engineering Implementation**

Consolidation milestone (DRA-001-CONS-001) is complete. The programme is now ready for engineering implementation.

**Immediate next step:** Execute DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline.

---

## 7. Deferred Until Version 1 Evidence Exists

The following are explicitly deferred. They must not be introduced during Version 1 engineering:

- Version 2 features of any kind;
- Additional issue classes beyond the nine frozen classes;
- Enterprise integrations;
- Agent Action Assurance Core implementation;
- Additional assurance modules;
- Production UI enhancements;
- External API productisation;
- Independent external reviewer programme for DRA.

---

## 8. Parallel Work Permitted

CTS-XVII external reviewer outreach may continue in parallel with DRA engineering implementation. CTS-XVII work must not delay DRA-ENG-001 or any subsequent DRA implementation milestone. DRA engineering takes scheduling priority.

---

## 9. Milestone Status Register

| Milestone | Name | Phase | Status |
|---|---|---|---|
| DRA-001-CONS-001 | Programme Artefact Consolidation | Governance | **COMPLETE** |
| DRA-ENG-001 | Existing Repository Assessment and Engineering Baseline | Phase 1 | **COMPLETE — PASS** |
| DRA-ENG-002 | Canonical Data Model | Phase 2 | **COMPLETE — PASS** |
| DRA-ENG-002A | Canonical Model Ambiguity Resolution | Phase 2 (corrective) | **COMPLETE — PASS** |
| DRA-ENG-003 | Input Normalisation | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-004 | Claim Extraction | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-005 | Authority Resolution | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-006 | Evidence Linkage | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-007 | Materiality Assessment | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-008 | Consistency Check | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-008 | Confidence Scoring | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-009 | Decision and Receipt | Phase 3 | **COMPLETE — PASS** |
| DRA-ENG-010 | Evaluator Integration | Phase 4 | **COMPLETE — PASS** |
| DRA-ENG-011 | Public API Freeze | Phase 4 | PENDING |
| DRA-ENG-012 | Component Verification | Phase 5 | PENDING |
| DRA-ENG-013 | Integration Verification | Phase 5 | PENDING |
| DRA-ENG-014 | End-to-End Verification | Phase 5 | PENDING |
| DRA-ENG-015 | Regression Verification | Phase 5 | PENDING |
| DRA-ENG-016 | Benchmark Corpus Construction | Phase 6 | PENDING |
| DRA-ENG-017 | Benchmark Execution and Adjudication | Phase 6 | PENDING |
| DRA-ENG-018 | Evidence Synthesis | Phase 6 | PENDING |
| DRA-ENG-019 | Programme Closure Report | Phase 7 | PENDING |

---

*Established by DRA-001-CONS-001 — Programme Artefact Consolidation.*  
*Update this index at the start and close of each milestone.*
