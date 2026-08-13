# DRA-VAL-001C — Reviewer Registry

**Registry Version:** DRA-REG-v1.0  
**Registry last updated:** 2026-07-27  
**Status: EMPTY — Open Recruitment Required**

---

## Registry Purpose and Rules

This registry is the authoritative record of all persons who have entered the DRA-VAL-001C reviewer recruitment process. It is append-only — records are added as new applicants enter the process; no record is silently removed or overwritten.

### Integrity Rules

1. **No placeholder reviewers.** Registry entries may not use placeholder names (e.g. "Reviewer 1", "TBD", "Placeholder"). Every entry with a status beyond PLANNED must represent a genuine person.
2. **No fabricated qualifications.** Qualification status fields may not be set to any qualified status without genuine qualification evidence on file.
3. **Withdrawn reviewers are excluded from coverage calculations** and may not be assigned.
4. **Suspended reviewers are excluded from coverage calculations** and may not be assigned pending resolution.
5. **Registry digest** is computed deterministically using `computeReviewerRegistryDigest()` and must be updated whenever the registry changes.

---

## Open Recruitment Requirement

The reviewer pool is currently empty. The following genuine recruitment actions are required before DRA-VAL-001D can proceed:

| Requirement | Count Needed | Current Count |
|-------------|-------------|---------------|
| Genuine qualified reviewers (any category) | 6 minimum | **0** |
| General assurance reviewers | 2 minimum | **0** |
| Domain specialists | 3 minimum | **0** |
| Independent adjudicators | 1 minimum | **0** |

### Required Actions

1. Identify genuine prospects from recruitment channels defined in `DRA-VAL-001C-REVIEWER-RECRUITMENT-PLAN.md`.
2. Record each prospect in the Recruitment Outreach Tracker.
3. Conduct outreach and invite applications.
4. Process applications through the qualification procedure.
5. Register qualified reviewers in this registry.

Until at least 6 genuine qualified reviewers are registered, no pilot review work may proceed.

---

## Registry Status Summary

| Status | Count |
|--------|-------|
| PLANNED | 0 |
| PROSPECT | 0 |
| CONTACTED | 0 |
| APPLIED | 0 |
| SCREENED | 0 |
| QUALIFIED | 0 |
| CONDITIONALLY_QUALIFIED | 0 |
| REJECTED | 0 |
| WITHDRAWN | 0 |
| SUSPENDED | 0 |
| **Total** | **0** |

---

## Reviewer Records

*No reviewer records exist at this time. Registry is empty.*

When reviewer records are added, each entry will contain:

| Field | Description |
|-------|-------------|
| Reviewer ID | DRA-REV-NNNN format |
| Display name | Real name or "Anonymous" per reviewer preference |
| Anonymous flag | Whether reviewer has requested anonymity |
| Recruitment status | Current position in the recruitment pipeline |
| Qualification status | Current qualification level |
| Reviewer categories | General / Domain Specialist / Adjudicator |
| Domain expertise | Domains with verified expertise and evidence |
| Verified experience summary | Summary of verified professional experience |
| Evidence references | Supporting evidence items |
| Conflict declaration status | NOT_SUBMITTED / SUBMITTED / ASSESSED / CLEARED / DISQUALIFYING |
| Conflict disposition | Independent assessment outcome |
| Consent status | NOT_SUBMITTED / COMPLETE / REVOKED |
| Confidentiality status | NOT_ACCEPTED / ACCEPTED / EXPIRED |
| Qualification exercise status | NOT_STARTED / IN_PROGRESS / COMPLETE / FAILED |
| Qualification score summary | Brief summary of exercise performance |
| Qualification decision | Eligibility outcome |
| Decision maker ID | Identifier of the person who made the decision |
| Workload limit | Maximum documents per execution window |
| Availability | Current availability status |
| Assignment restrictions | Any restrictions on assignment |
| Withdrawn | Whether reviewer has withdrawn |
| Suspended | Whether reviewer is currently suspended |
| Created at | ISO-8601 timestamp |
| Last updated | ISO-8601 timestamp |
| Integrity digest | Computed digest of substantive fields |

---

## Machine-Readable Registry

The machine-readable registry is maintained using `ReviewerRegistrySchema` in  
`src/benchmark/validation/reviewer-record.ts`.

Registry digest computation: `computeReviewerRegistryDigest()` in the same module.

Status counts computation: `computeRegistryStatusCounts()` — manual entry prohibited.

---

## Identifier Series

Reviewer identifiers follow the format `DRA-REV-NNNN` beginning at `DRA-REV-0001`.

Next available identifier: **DRA-REV-0001**

---

## Amendment Log

| Date | Change | Changed By |
|------|--------|------------|
| 2026-07-27 | Registry initialised — empty | DRA-VAL-001C activation |
