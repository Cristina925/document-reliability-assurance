# DRA-VAL-001C — Reviewer Coverage Matrix

**Matrix Version:** DRA-COV-v1.0  
**Last updated:** 2026-07-27  
**Status: NO COVERAGE across all domains**

---

## Coverage Summary

| Metric | Value |
|--------|-------|
| Distinct qualified reviewers | **0** |
| Distinct qualified adjudicators | **0** |
| Pilot minimum met | **NO** |
| Preferred pilot pool met | **NO** |
| Full benchmark target met | **NO** |
| Domains with coverage gaps | **All 9 domains** |

---

## Domain Coverage Table

| Domain | Qualified General | Qualified Specialists | Qualified Adjudicators | With Manageable Conflict | Available | Needed (Pilot) | Needed (Full Benchmark) | Coverage Status |
|--------|------------------|-----------------------|-----------------------|--------------------------|-----------|----------------|-------------------------|-----------------|
| LEGAL_AND_REGULATORY | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| HEALTHCARE_AND_LIFE_SCIENCES | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| FINANCE_AND_ACCOUNTING | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| CYBERSECURITY_AND_TECHNICAL_ASSURANCE | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| BUSINESS_AND_EXECUTIVE_REPORTING | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| PROCUREMENT_AND_THIRD_PARTY_RISK | 0 | 0 | 0 | 0 | 0 | 2 | 10 | **NO_COVERAGE** |
| HR_AND_WORKPLACE_POLICY | 0 | 0 | 0 | 0 | 0 | 2 | 6 | **NO_COVERAGE** |
| PUBLIC_POLICY_AND_GOVERNANCE | 0 | 0 | 0 | 0 | 0 | 0 | 6 | **NO_COVERAGE** |
| GENERAL_OPERATIONAL | 0 | 0 | 0 | 0 | 0 | 0 | 6 | **NO_COVERAGE** |

Notes:
- "Needed (Pilot)": based on pilot documents in this domain × 2 reviewers per document.
- PUBLIC_POLICY_AND_GOVERNANCE and GENERAL_OPERATIONAL have 0 pilot documents (no frozen pilot documents in those domains), but still require coverage for the full benchmark.
- All figures assume the minimum workload of 1 document per reviewer — actual requirements depend on workload distribution.

---

## Coverage Status Definitions

| Status | Definition |
|--------|------------|
| **NO_COVERAGE** | Zero qualified reviewers for this domain |
| **INSUFFICIENT** | Some qualified reviewers, but fewer than required for pilot execution (2 reviewers per document + ≥1 adjudicator) |
| **PILOT_READY** | ≥ 2 independent eligible reviewers available per frozen pilot document AND ≥ 1 eligible adjudicator for the domain. No unresolved conflicts blocking required assignments. |
| **FULL_BENCHMARK_READY** | Sufficient qualified reviewers and adjudicators for all 120-document benchmark assignments with workload limits respected. |

**Note on PILOT_READY:** A domain is NOT classified as PILOT_READY merely because the reviewer count equals the minimum. Workload limits, conflict restrictions, and availability must all be verified. A single reviewer with a workload limit of 1 does not cover a domain with 2 pilot documents even if they are the only specialist.

---

## Effect of Conflicts on Coverage

Reviewers with MANAGEABLE conflicts are counted in the table above under "With Manageable Conflict" but may not be assigned to all documents. Effective coverage after conflict restrictions may be lower than the raw qualified-reviewer count suggests.

DISQUALIFYING conflicts exclude the reviewer from all counts.

REQUIRES_INDEPENDENT_ASSESSMENT conflicts exclude the reviewer from coverage until resolved.

---

## Required Coverage Actions

To reach PILOT_READY status for all 7 pilot-document domains:

| Domain | Current Gap | Action Required |
|--------|------------|-----------------|
| LEGAL_AND_REGULATORY | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| HEALTHCARE_AND_LIFE_SCIENCES | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| FINANCE_AND_ACCOUNTING | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| CYBERSECURITY_AND_TECHNICAL_ASSURANCE | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| BUSINESS_AND_EXECUTIVE_REPORTING | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| PROCUREMENT_AND_THIRD_PARTY_RISK | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |
| HR_AND_WORKPLACE_POLICY | 0/2 reviewers | Recruit ≥ 2 eligible reviewers; ≥ 1 adjudicator |

A reviewer with genuine cross-domain expertise may count toward multiple domains. The programme should seek domain specialists who cover multiple represented pilot domains.

---

## Machine-Readable Coverage Matrix

Coverage matrix records are defined by `ReviewerCoverageMatrixSchema` in  
`src/benchmark/validation/reviewer-coverage.ts`.

Coverage statuses are computed by `isDomainPilotReady()` — not entered manually.

This Markdown file is the human-readable snapshot. The authoritative record is the machine-readable matrix.
