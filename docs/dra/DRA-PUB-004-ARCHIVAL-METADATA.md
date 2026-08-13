# DRA-PUB-004 — Archival Deposit Metadata (Prepared, Not Filed)

## Purpose

This document prepares metadata suitable for later deposit into an archival service (e.g. Zenodo) and/or a preprint repository. **No deposit has been made.** No DOI, Zenodo record ID, arXiv identifier, or preprint-server accession number exists for this work. Any such identifier referenced here in the future must be added only after the corresponding external platform has actually minted it — never asserted in advance.

## Deposit-ready metadata

| Field | Value |
|---|---|
| Title | Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents |
| Publication edition | DRA-PUB-004 |
| Scientific source | DRA-PUB-MANUSCRIPT-1 (SHA-256 `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e`) |
| Upload type | Preprint / Software (dual — manuscript + reference evaluator) |
| Publication date | Not yet published externally. Internal edition prepared 2026-08-12. |
| Creators | Directing human principal (research programme lead). No individual named co-authors beyond the directing principal; no AI system is listed as an author (see manuscript's Authorship and AI-assistance disclosure). |
| License | MIT (original DRA software/source code); Creative Commons Attribution 4.0 International — CC-BY-4.0 (original DRA-authored manuscript, reports, and documentation), per `docs/dra/DRA-PUB-007-DOCUMENTATION-LICENCE-GOVERNANCE.md`. See `docs/dra/DRA-LICENSING.md` for the complete boundary and `docs/dra/DRA-ATTRIBUTION.md` for third-party material governed by separate licences (UK Open Government Licence v3.0; US federal public domain, 17 U.S.C. §105). |
| Version | DRA-GC-1 (evaluator `0.1.2`, pipeline `1.0`, model/schema `0.1.0`, corpus `DRA-CORPUS-1.0.0`); publication edition `DRA-PUB-004` |
| Keywords | document-reliability, evidence-auditing, authority-resolution, claim-verification, reproducibility, proof-receipts, deterministic-evaluation, machine-consumed-documents |
| Related identifiers | Repository (self-hosted; no external mirror registered), `docs/dra/DRA-CITATION.cff` |
| DOI | **None minted.** Do not populate until Zenodo (or equivalent) actually issues one. |
| Journal / conference | **None.** This is presented as a research-stage technical report / preprint, not a peer-reviewed publication. |
| Institutional affiliation | **None asserted.** No institution is claimed as a sponsor or affiliate of this work. |
| External reviewers | **None.** No external review has occurred (see `docs/dra/DRA-EXTERNAL-REVIEWER-ENTRY.md`). |
| External validation status | `EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED` |

## What remains for an actual deposit (human/external action)

1. Choose a deposit target (e.g. Zenodo for a versioned software+preprint deposit, or a preprint server such as arXiv for the manuscript specifically) — a decision requiring human judgement about venue, licensing implications, and long-term maintenance commitment.
2. Create the account/organisation record on that platform if one does not exist.
3. Upload the release archive (see `docs/dra/DRA-PUB-004-REPORT.md` for its filename and SHA-256) and the manuscript PDF.
4. Record the platform-issued DOI/identifier back into this file and into `docs/dra/DRA-CITATION.cff` **only after** it has been issued.
5. Consider whether a GitHub (or equivalent) public mirror should be created before or alongside the archival deposit, since most archival services expect a public source location to link to.

None of the above steps have been performed as part of DRA-PUB-004; they are explicitly out of scope for an internal publication-production programme and require external platform interaction.
