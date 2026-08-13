# DRA-001-13 — Version 1 Authoritative Engineering Backlog

**Document identifier:** DRA-001-13  
**Status:** ACTIVE — AUTHORITATIVE  
**Version:** 1.0  
**Established:** DRA-001-CONS-001 (Programme Artefact Consolidation)  
**Programme:** DRA-001 — Document Release Assurance, Version 1

> **Governance clarification (added by DRA-PUB-006):** This document's `ACTIVE — AUTHORITATIVE` status describes its continued role as the operative engineering-process authority for how DRA engineering work is planned and sequenced; it is not a claim that DRA-001's originally-specified scope (see `DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md`, now `HISTORICAL — SUPERSEDED AS PROGRAMME AUTHORITY`) remains the normative description of the published DRA-GC-1 research state. See `docs/dra/DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md` for the full governance record.

---

## 1. Purpose

This document is the single authoritative engineering backlog for DRA-001 Version 1. It defines all engineering phases, ordered milestones, dependencies, gate boundaries, acceptance criteria, and implementation sequence.

Engineering work must not begin outside this backlog. Milestones must be executed in the defined order unless a dependency permits parallel execution.

---

## 2. Programme Gate Structure

| Gate | Name | Entry condition | Exit condition |
|---|---|---|---|
| Gate 0 | Programme Governance | DRA-001 programme specification exists | Consolidation milestone (CONS-001) complete |
| **Gate 1** | **Engineering Implementation** | **CONS-001 complete; DRA-ENG-001 ready** | **All Version 1 engineering milestones complete** |
| Gate 2 | Verification and Benchmark | Gate 1 complete | Benchmark execution and evidence synthesis complete |
| Gate 3 | Programme Closure | Gate 2 complete | Closure report produced and archived |

**Current gate: Gate 1 — Engineering Implementation**

---

## 3. Engineering Phases

### Phase 1 — Engineering Baseline (Gate 1 entry)

Establish the engineering baseline before any evaluator implementation begins. All Phase 1 work is analytical and structural; no evaluator code is written.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-001 | Existing Repository Assessment and Engineering Baseline | Inspect the existing repository. Map current code, data structures, and test infrastructure relevant to DRA implementation. Identify reusable components. Identify gaps. Produce a baseline report. Reserve this identifier permanently for this milestone. | CONS-001 |

**Gate 1 entry is contingent on DRA-ENG-001 completion.**

---

### Phase 2 — Canonical Data Model

Establish the typed data structures that the entire evaluator depends on before any pipeline stage is implemented.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-002 | Canonical Data Model | Define and implement the TypeScript types for: normalised document representation; claim; authority reference; evidence reference; issue (all nine classes); confidence indicator; assurance decision; proof receipt. All types must be frozen before Stage implementation begins. | DRA-ENG-001 |

---

### Phase 3 — Evaluator Pipeline Implementation

Implement each pipeline stage in order. Each stage depends on the previous stage being complete and its types accepted by the type system. Stages may not be reordered.

| Milestone | Name | Pipeline stage | Depends on |
|---|---|---|---|
| DRA-ENG-003 | Input Normalisation | Stage 1 | DRA-ENG-002 |
| DRA-ENG-004 | Claim Extraction | Stage 2 | DRA-ENG-003 |
| DRA-ENG-005 | Authority Resolution | Stage 3 | DRA-ENG-004 |
| DRA-ENG-006 | Evidence Linkage | Stage 4 | DRA-ENG-005 |
| DRA-ENG-007 | Consistency Check | Stage 5 | DRA-ENG-006 |
| DRA-ENG-008 | Confidence Scoring | Stage 6 | DRA-ENG-007 |
| DRA-ENG-009 | Decision and Receipt | Stage 7 | DRA-ENG-008 |

---

### Phase 4 — Integration and Public API

Integrate all pipeline stages into a coherent evaluator and expose the public API.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-010 | Evaluator Integration | Compose Stages 1–7 into a single evaluator. Implement the evaluation entry point. Verify that all nine issue classes can be triggered. Verify end-to-end pipeline execution. | DRA-ENG-009 |
| DRA-ENG-011 | Public API Freeze | Define and freeze the public API for the DRA evaluator. Document all public types and entry points. Produce the API reference. | DRA-ENG-010 |

---

### Phase 5 — Verification

Verify the evaluator against the protocol defined in the DRA Verification and Benchmark Protocol.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-012 | Component Verification | Verify each pipeline stage in isolation. All component-level tests must pass. | DRA-ENG-011 |
| DRA-ENG-013 | Integration Verification | Verify pipeline stage interactions. All integration-level tests must pass. | DRA-ENG-012 |
| DRA-ENG-014 | End-to-End Verification | Execute the full evaluator against known-good and known-bad documents. All end-to-end tests must pass. | DRA-ENG-013 |
| DRA-ENG-015 | Regression Verification | Confirm that all prior verification levels remain passing after DRA-ENG-014. No regressions permitted. | DRA-ENG-014 |

---

### Phase 6 — Benchmark Execution

Execute the evaluator against the benchmark corpus and produce the experimental record.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-016 | Benchmark Corpus Construction | Construct the benchmark corpus per the DRA Verification and Benchmark Protocol. Freeze all corpus documents before evaluation. | DRA-ENG-015 |
| DRA-ENG-017 | Benchmark Execution and Adjudication | Execute the evaluator against all corpus documents. Independently review all evaluator outputs. Adjudicate all differences. Produce the experimental record. | DRA-ENG-016 |
| DRA-ENG-018 | Evidence Synthesis | Synthesise benchmark results into a structured evidence summary. Identify surviving, reduced, eliminated, and undetermined differences. Produce the evidence register. | DRA-ENG-017 |

---

### Phase 7 — Programme Closure

Produce the final programme closure artefacts and archive the Version 1 experimental record.

| Milestone | Name | Description | Depends on |
|---|---|---|---|
| DRA-ENG-019 | Programme Closure Report | Produce the DRA-001 Version 1 closure report. Include: results summary, evidence register, limitations, deferred work, archive manifest. | DRA-ENG-018 |

---

## 4. Identifier Reservation

**DRA-ENG-001 is permanently reserved for: Existing Repository Assessment and Engineering Baseline.**

No planning document, governance document, or prior session artefact may continue using DRA-ENG-001 for any other purpose. If any prior document used this identifier for a different purpose, that document is superseded.

---

## 5. Gate Boundaries and Acceptance Criteria

### Gate 1 → Gate 2

All of the following must be true:

- DRA-ENG-001 through DRA-ENG-015 complete and reported per the DRA Engineering Evidence Standard.
- All verification milestones (DRA-ENG-012–015) returned PASS.
- Public API frozen (DRA-ENG-011 complete).
- No open defects at blocking severity.
- CTS evaluator, CTS Type Kernel, CTS public API, and existing ContinuityOS functionality unchanged.

### Gate 2 → Gate 3

All of the following must be true:

- DRA-ENG-016 through DRA-ENG-018 complete and reported.
- Benchmark corpus frozen before evaluation execution.
- Experimental record produced and archived.
- Evidence synthesis complete.

---

## 6. Parallel Work Permitted

CTS-XVII external reviewer outreach may continue in parallel with DRA engineering. CTS-XVII must not delay DRA implementation milestones. DRA engineering milestones take scheduling priority.

---

## 7. Deferred Milestones (Version 2 and beyond)

The following milestone types are deferred and must not be introduced during Version 1 engineering:

- Additional issue class implementation;
- Enterprise integration milestones;
- Agent Action Assurance Core milestones;
- Production deployment milestones;
- Additional assurance module milestones.

---

*Established by DRA-001-CONS-001 — Programme Artefact Consolidation.*
