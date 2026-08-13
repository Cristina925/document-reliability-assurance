# DRA-001 Programme Index

Document-Assurance Reference Evaluator — Milestone Tracking

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete — all tests passing, TypeScript clean |
| 🔄 | In progress |
| ⬜ | Not started |

---

## Engineering Milestones

| ID | Title | Status | Tests Added | Cumulative |
|----|-------|--------|-------------|------------|
| DRA-ENG-002 | Canonical Data Model | ✅ | — | — |
| DRA-ENG-003 | Input Normalisation | ✅ | — | — |
| DRA-ENG-004 | Claim Extraction | ✅ | — | — |
| DRA-ENG-005 | Authority Resolution | ✅ | — | — |
| DRA-ENG-006 | Evidence Linkage | ✅ | — | — |
| DRA-ENG-007 | Materiality Assessment | ✅ | — | — |
| DRA-ENG-008 | Consistency Check + Confidence Scoring | ✅ | — | — |
| DRA-ENG-008B | Deterministic Contract and Boundary Hardening | ✅ | 93 | 1,747 |
| DRA-ENG-009 | Decision and Receipt | ✅ | — | — |
| DRA-ENG-010 | Evaluator Integration | ✅ | — | — |

## Version 1 Evaluator Milestone

| ID | Title | Status | Tests Added | Cumulative |
|----|-------|--------|-------------|------------|
| DRA-001-05A | Minimum Evaluator Version 1 | ✅ | 0 (formalisation) | 1,747 |

## Benchmark Corpus Milestones (DRA-001-04)

| ID | Title | Status | Tests Added | Cumulative |
|----|-------|--------|-------------|------------|
| DRA-001-04A | Benchmark Corpus Schema and Registry | ✅ | 114 | 1,861 |
| DRA-001-04B | Benchmark Document Selection and Corpus Governance Protocol | ✅ | 144 | 2,005 |
| DRA-001-04C | Benchmark Document Acquisition and Initial Corpus Population | ✅ | 112 | 2,117 |

## Benchmark Execution Milestones

| ID | Title | Status | Tests Added | Cumulative |
|----|-------|--------|-------------|------------|
| DRA-001-06 | Benchmark Execution and Comparative Evaluation | ✅ | 123 | 2,240 |
| DRA-001-07 | Initial Benchmark Evidence Generation | ✅ | 199 | 2,439 |
| DRA-001-08 | — | ⬜ | — | — |

---

## Frozen Baselines

**Minimum Evaluator Version 1** — formally established at DRA-001-05A.
Implementation delivered across DRA-ENG-002 through DRA-ENG-010.
Hardened at DRA-ENG-008B (deterministic contract, identifier validation, digest, datetime semantics).

The 7-stage evaluator pipeline (`src/pipeline/`) and all stage implementations
must not be modified. Only the benchmark and corpus modules extend the system.

**Initial Benchmark Corpus** — established at DRA-001-07.
Six frozen documents (DRA-DOC-0001 through DRA-DOC-0006) covering all six domains
and all three difficulty levels. Corpus version: DRA-001-07-INITIAL.

---

## Next Milestone

**DRA-001-08** — (to be specified)
