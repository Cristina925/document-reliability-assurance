# DRA Validation Programme Index

**Document Release Assurance — Scientific Validation Programme**

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | Active / In progress |
| ⬜ | Not started |
| 🔒 | Blocked (prerequisite incomplete) |

---

## Planned Milestone Sequence

| ID | Title | Status | Dependencies |
|----|-------|--------|-------------|
| **DRA-VAL-001A** | **Scientific Validation Protocol and Benchmark Design** | ✅ | DRA-001-07 complete |
| **DRA-VAL-001B** | **Corpus Acquisition and Freeze** | ✅ | DRA-VAL-001A |
| **DRA-VAL-001C** | **Reviewer Recruitment and Qualification** | 🔄 | DRA-VAL-001A |
| DRA-VAL-001D | Pilot Independent Review | 🔒 | DRA-VAL-001B, DRA-VAL-001C (READY) |
| DRA-VAL-001E | Full Benchmark Execution | ⬜ | DRA-VAL-001D |
| DRA-VAL-001F | Comparative and Statistical Analysis | ⬜ | DRA-VAL-001E |
| DRA-VAL-001G | Scientific Validation Report | ⬜ | DRA-VAL-001F |
| DRA-VAL-001H | Independent Audit and Release Freeze | ⬜ | DRA-VAL-001G |

---

## Milestone Descriptions

### DRA-VAL-001A — Scientific Validation Protocol and Benchmark Design

**Status: COMPLETE**

All six protocol documents frozen and registered. Protocol registration record issued (DRA-VAL-001F). Amendment rules active from 2026-07-27. Machine-readable schemas implemented and tested.

**Protocol package digest:** `100c2daa4447db45061132a2f17c3993acbbc472c6ffd13368d9f201201831bd`

**Deliverables:** Scientific Validation Charter · Benchmark Corpus Design Protocol · Reviewer Independence Protocol · Issue Matching and Comparison Protocol · Statistical Analysis Plan · Threats to Validity Register · Protocol Registration Record

**Machine-readable schemas:** `src/benchmark/validation/` (DRA-VAL-001A)

---

### DRA-VAL-001B — Corpus Acquisition and Freeze

**Status: COMPLETE (Partial Pilot)**

Pilot corpus frozen at `DRA-VAL-PILOT-001-PARTIAL`. 7 of 20 pilot documents acquired and frozen. All 7 are AI-generated synthetic documents across 7 domains. 13 pilot slots remain PLANNED with documented acquisition blockers (human-authored and hybrid sources require external acquisition).

**Corpus manifest digest:** `137c7c698dcdd2e02a94e173cbc12ae2ec76a14eb591feb7b6323e487125c43f`

**Post-pilot (DRA-VAL-DOC-0021–0120):** 100 slots PLANNED.

**Deliverables:** 7 frozen corpus documents · Corpus manifest · Acquisition register · Source acquisition guide · Pilot freeze record · Acquisition status dashboard

**Machine-readable schemas:** `src/benchmark/validation/corpus-*.ts`

---

### DRA-VAL-001C — Reviewer Recruitment and Qualification

**Status: INFRASTRUCTURE COMPLETE — RECRUITMENT OPEN — SCIENTIFIC READINESS: NOT_READY**

| Sub-component | Status |
|---------------|--------|
| Infrastructure | ✅ COMPLETE |
| External recruitment | 🔄 OPEN (0 prospects identified) |
| Reviewer qualification | ⬜ NOT STARTED |
| Pilot review readiness | ❌ NOT_READY |

**Infrastructure status: COMPLETE**

All recruitment, qualification, and readiness infrastructure is implemented, tested, and verified:
- Reviewer schemas and validation rules (10 TypeScript modules, 114 tests, 0 TypeScript errors)
- Recruitment plan, eligibility standard, COI declaration, consent framework
- Qualification procedure, exercises (QEX-0001, QEX-0002, QEX-0005, QEX-0010), scoring rubric, assessment template
- Reviewer onboarding guide, application form, data handling policy
- External recruitment brief, outreach message pack (3 templates), recruitment priorities (Wave 1 and Wave 2)
- Registry (empty), outreach tracker (empty), coverage matrix, pilot readiness assessment
- Completion report (DRA-VAL-001C-COMPLETION-REPORT.md)

**Recruitment status: OPEN — NOT STARTED**
- Prospects identified: **0**
- Outreach conducted: **0**
- Applications received: **0**
- Qualified reviewers: **0**

No fictitious prospects, simulated reviewers, or fabricated qualifications have been created.

**Qualification status: NOT STARTED**
- Qualification exercises issued: **0**
- Exercises completed: **0**
- Reviewers qualified: **0**

**Scientific readiness: NOT_READY**
- Pilot reviewer readiness assessment: **NOT_READY**
- Critical criteria satisfied: 3/13 (RC-10 evaluator sealed, RC-11 manifest verified, RC-13 vacuous)
- Critical criteria failed: 8/13 (all reviewer-dependent criteria)
- Corpus integrity: PASSED — evaluator sealed, manifest verified

Wave 1 recruitment priority: 2 general assurance reviewers, 1 legal/regulatory specialist, 1 healthcare/life-sciences specialist, 1 cybersecurity/technical-assurance specialist, 1 adjudicator. See `DRA-VAL-001C-RECRUITMENT-PRIORITIES.md`.

**Machine-readable schemas:** `src/benchmark/validation/reviewer-*.ts`

---

### DRA-VAL-001D — Pilot Independent Review

**Status: BLOCKED**

Blocked pending:
1. **DRA-VAL-001C pilot reviewer readiness assessment reaching READY** (or an independently approved CONDITIONALLY_READY), AND
2. **DRA-VAL-001B pilot corpus freeze** ✅ (satisfied — 7 documents frozen)

DRA-VAL-001D must not begin with simulated, placeholder, or unverified reviewers. The NOT_READY assessment must be resolved by genuine recruitment.

**Prerequisites not yet satisfied:** 
- Genuine qualified reviewer pool (currently 0, minimum 6 required)
- Coverage across pilot domains (currently NO_COVERAGE in all 7 domains)
- At least 1 qualified adjudicator (currently 0)

---

### DRA-VAL-001E — Full Benchmark Execution

**Status: NOT STARTED**

Execute the full 120-document independent review. All reviewer submissions must be frozen before DRA evaluator results are unsealed.

**Prerequisite:** DRA-VAL-001D (pilot review complete, sample-size assessment satisfactory).

**Key deliverable:** Frozen reviewer submission dataset; evaluator output dataset; sealed comparison inputs.

---

### DRA-VAL-001F — Comparative and Statistical Analysis

**Status: NOT STARTED**

Unseal evaluator results. Apply pre-registered matching rules and statistical analysis plan. Compute all 12 pre-registered metrics with 95% confidence intervals.

**Prerequisite:** DRA-VAL-001E (all submissions frozen).

---

### DRA-VAL-001G — Scientific Validation Report

**Status: NOT STARTED**

Produce the full scientific validation report. Report all outcomes transparently including failure and inconclusive results.

**Prerequisite:** DRA-VAL-001F.

---

### DRA-VAL-001H — Independent Audit and Release Freeze

**Status: NOT STARTED**

Independent audit of the validation process, data, and report. If audit passes: release freeze confirming the validation status.

**Prerequisite:** DRA-VAL-001G.

---

## Important Boundary

### Engineering validation is not scientific validation

The DRA-001-07 milestone (Initial Benchmark Evidence Generation) produced six documents and twelve simulated reviewer submissions for engineering-validation purposes. These are **not** scientific validation evidence:

- The documents were selected to test evaluator functionality, not to represent the target population.
- The reviewer submissions are pre-programmed fixtures, not independent human assessment.
- The corpus size (6 documents) is statistically insufficient for any population-level conclusion.
- The DRA-001-07 simulated reviewers must not be imported, converted, or represented as scientific reviewers.

These engineering fixtures may not be cited as evidence of evaluator accuracy, recall, precision, or fitness for use in any scientific or operational claim.

---

## Protocol Document Index

| Document | Location |
|----------|----------|
| Scientific Validation Charter | `docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` |
| Benchmark Corpus Design Protocol | `docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` |
| Reviewer Independence Protocol | `docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md` |
| Issue Matching and Comparison Protocol | `docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md` |
| Statistical Analysis Plan | `docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` |
| Threats to Validity Register | `docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md` |
| Protocol Registration Record | `docs/dra/validation/DRA-VAL-001F-PROTOCOL-REGISTRATION.md` |

## Reviewer Documents Index (DRA-VAL-001C)

| Document | Location |
|----------|----------|
| Reviewer Recruitment Plan | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-RECRUITMENT-PLAN.md` |
| Reviewer Eligibility Standard | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-ELIGIBILITY-STANDARD.md` |
| Conflict of Interest Declaration | `docs/dra/validation/reviewers/DRA-VAL-001C-CONFLICT-OF-INTEREST-DECLARATION.md` |
| Confidentiality and Consent Agreement | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-CONFIDENTIALITY-AND-CONSENT.md` |
| Qualification Procedure | `docs/dra/validation/reviewers/DRA-VAL-001C-QUALIFICATION-PROCEDURE.md` |
| Qualification Guide | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-QUALIFICATION-GUIDE.md` |
| General Qualification Exercise | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-GENERAL-QUALIFICATION-EXERCISE.md` |
| Domain Qualification Exercise | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-DOMAIN-QUALIFICATION-EXERCISE.md` |
| Adjudicator Qualification Exercise | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-ADJUDICATOR-QUALIFICATION-EXERCISE.md` |
| Qualification Scoring Rubric | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-QUALIFICATION-SCORING-RUBRIC.md` |
| Qualification Assessment Template | `docs/dra/validation/reviewers/qualification/DRA-VAL-001C-QUALIFICATION-ASSESSMENT-TEMPLATE.md` |
| Reviewer Onboarding Guide | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-ONBOARDING-GUIDE.md` |
| Reviewer Application Form | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-APPLICATION.md` |
| Reviewer Registry | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-REGISTRY.md` |
| Recruitment Outreach Tracker | `docs/dra/validation/reviewers/DRA-VAL-001C-RECRUITMENT-OUTREACH-TRACKER.md` |
| Reviewer Coverage Matrix | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-COVERAGE-MATRIX.md` |
| Pilot Reviewer Readiness Assessment | `docs/dra/validation/reviewers/DRA-VAL-001C-PILOT-REVIEWER-READINESS.md` |
| Reviewer Data Handling Policy | `docs/dra/validation/reviewers/DRA-VAL-001C-REVIEWER-DATA-HANDLING.md` |
| External Recruitment Brief | `docs/dra/validation/reviewers/DRA-VAL-001C-EXTERNAL-RECRUITMENT-BRIEF.md` |
| Outreach Message Pack | `docs/dra/validation/reviewers/DRA-VAL-001C-OUTREACH-MESSAGE-PACK.md` |
| Recruitment Priorities | `docs/dra/validation/reviewers/DRA-VAL-001C-RECRUITMENT-PRIORITIES.md` |
| Completion Report | `docs/dra/validation/reviewers/DRA-VAL-001C-COMPLETION-REPORT.md` |

## Machine-Readable Schema Index

| Module | Location |
|--------|----------|
| Validation protocol schemas | `lib/dra-reference/src/benchmark/validation/` |
| Corpus acquisition schemas | `lib/dra-reference/src/benchmark/validation/corpus-*.ts` |
| Reviewer schemas | `lib/dra-reference/src/benchmark/validation/reviewer-*.ts` |
| Public surface | `lib/dra-reference/src/benchmark/validation/index.ts` |
