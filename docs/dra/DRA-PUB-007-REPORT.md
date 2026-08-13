# DRA-PUB-007 Report — Documentation and Publication Licence Closure

## 1. Objective

Close the documentation-licensing residual identified by DRA-PUB-006 and establish an explicit, publication-ready licensing architecture for DRA, without changing any frozen scientific content, evaluator behaviour, corpus evidence, experimental evidence, results, claim boundaries, or GC-1 identity.

## 2. Starting state and relationship to PUB-006

- Expected DRA-PUB-006 closure commit: `b13b82e`.
- `HEAD` at PUB-007 start: `39e04c3fdc8a5674de4741f7c24315f934428dc9` — one commit ahead of `b13b82e`.
- Explanation: the extra commit, `"Document DRA-PUB-006 conventions and asset attachments in agent memory"`, is the same kind of automatic platform checkpoint pattern already documented in the DRA-PUB-006 audit — it committed only `.agents/memory/MEMORY.md`, a new `.agents/memory/dra-pub-006-conventions.md` (the PUB-006 session's own memory write), and the attached DRA-PUB-006 spec text asset. No file under any scientific or documentation-content path was touched. This is consistent with, not a departure from, the DRA-PUB-006 closure state.
- `git status` at start: clean except the newly attached DRA-PUB-007 spec text asset.
- `git log -5 --oneline` at start: `39e04c3` → `b13b82e` → `3340653` → `d2639a6` → `d71bb84`.
- No PUB-005/PUB-006 history was squashed or rewritten by this task.

## 3. Approved licensing architecture (per governing task)

| Material | Licence |
|---|---|
| Software/source code | MIT |
| Original DRA research manuscript, reports, diagrams, documentation | CC BY 4.0 |
| Third-party documents/source materials/extracts/datasets | Original upstream licence (not relicensed) |
| Third-party material without established public redistribution rights | Excluded from the future curated public repository unless redistribution rights are established |

Recorded formally in `docs/dra/DRA-PUB-007-DOCUMENTATION-LICENCE-GOVERNANCE.md`.

## 4. Root MIT software licence — verified, unchanged

Inspected the existing root `LICENSE` (created by DRA-PUB-006). It contains the standard MIT licence text with a correct copyright line (`Copyright (c) 2026 the DRA (Document Reliability Assurance) research programme contributors`) and an existing scope note limiting it to software. **No change was made to the MIT legal text or copyright line** — it was already correct.

## 5. Documentation CC BY 4.0 licence — created

Created root `LICENSE-DOCUMENTATION`, containing: an explicit scope statement (applies to original DRA-authored documentation, principally `docs/dra/`; does not apply to software or third-party material), the canonical identifier (`CC-BY-4.0`), canonical name, canonical URL (`https://creativecommons.org/licenses/by/4.0/`), canonical legal-code URL, and a concise, accurate summary of the licence terms (Share/Adapt permissions, Attribution/No-additional-restrictions conditions) with an explicit statement that the summary is not a substitute for the full legal code, which is incorporated by reference. No modified or custom "DRA Licence" was invented.

## 6. Licensing boundary document — created

Created `docs/dra/DRA-LICENSING.md`, the authoritative human-readable licensing boundary. It covers: software (MIT), original DRA documentation (CC BY 4.0), third-party material (original upstream licence, never relicensed, including embedded excerpts), restricted/uncertain redistribution (metadata/digest/link-only publication pattern), no effect on scientific provenance (exclusion from redistribution ≠ exclusion from the evidence base), and precedence (specific per-file/upstream notices control over the general declarations here). Explicitly does not claim "everything in docs/ is CC BY" — the third-party-embedded-excerpt case is called out by name.

## 7. Licence scope precision

`DRA-LICENSING.md` and `LICENSE-DOCUMENTATION` both state the CC BY 4.0 grant is scoped to material for which the DRA author holds the necessary rights, and both explicitly reserve third-party embedded extracts from that grant (§17 of the governing task, "do not relicense third-party extracts" — implemented as an explicit reservation sentence, not an implicit assumption).

## 8. Third-party licensing audit

Re-used the existing PUB-002/PUB-004/PUB-006 records and acquisition history (not re-derived from scratch). Directly re-confirmed via repository search (as in PUB-006) that the 25 DRA-VAL-002 `.bin` files remain the only third-party raw bytes persisted anywhere in the repository, and that no CC BY-ND document's raw bytes have been added since PUB-006. Produced a category-level classification in the new `docs/dra/DRA-THIRD-PARTY-LICENSING.md`, covering: UK OGL v3.0, US federal public domain (17 U.S.C. §105), CC BY 4.0 (referenced-only), CC BY-ND 4.0 (CNIL, referenced-only), Crown copyright/non-OGL (NAO), publisher-specific/bespoke-notice material, non-US public domain, and rejected/blocked discovery candidates — each classified against the governing task's five-value scheme (`RAW_REDISTRIBUTION_PERMITTED` / `ATTRIBUTION_REQUIRED` / `RAW_REDISTRIBUTION_RESTRICTED` / `DIGEST_METADATA_LINK_ONLY` / `REVIEW_REQUIRED`).

## 9. CC BY-ND treatment (special attention)

Re-confirmed, by direct repository search (not by re-deriving a new legal conclusion), that the CNIL document (DRA-DOC-0020, CC BY-ND, French, admitted in DRA-ACQ-016 Phase 2) has **no raw bytes persisted anywhere** in this repository — only a test-code reference to the acquisition exists. `DRA-LICENSING.md`, `DRA-THIRD-PARTY-LICENSING.md`, and this report all state explicitly that DRA's own CC BY 4.0 documentation licence does not purport to relicense this or any other CC-BY-ND-licensed source document. Since no raw bytes exist for this document, the publication boundary is already, and remains, metadata/digest/source-link only — the narrowest option, consistent with the existing record and not loosened by this task. Classification: `DIGEST_METADATA_LINK_ONLY` (not `REVIEW_REQUIRED`, since there are no raw bytes whose inclusion is even in question).

## 10. Public repository fileset plan — updated

`docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md` was updated with an explicit "Licensing note (DRA-PUB-007)" section stating the three-way licence split (MIT / CC BY 4.0 / original upstream) and requiring the curated repository to ship both `LICENSE` and `LICENSE-DOCUMENTATION` plus `DRA-LICENSING.md`/`DRA-THIRD-PARTY-LICENSING.md` at its root — explicitly prohibiting a single blanket licence statement. The "Included" table was extended to list `LICENSE-DOCUMENTATION`, `DRA-LICENSING.md`, and `DRA-THIRD-PARTY-LICENSING.md` as required root/near-root content, not merely incidental members of `docs/dra/**`.

## 11. Public README licensing section — updated

`docs/dra/DRA-RELEASE-README.md`'s "Licensing" section was corrected to state all three categories explicitly (MIT for software, CC BY 4.0 for original documentation, third-party retains its own licence), each with a pointer to the detailed governing document (`DRA-LICENSING.md`, `DRA-THIRD-PARTY-LICENSING.md`, `DRA-ATTRIBUTION.md`). The scientific sections of the README (What this is, Principal evidence, Manuscript, Reproduction instructions, Limitations) were not touched.

## 12. Citation metadata — updated

`docs/dra/DRA-CITATION.cff`: the `license` field was changed from the single string `MIT` to a list, `[MIT, CC-BY-4.0]`, since the CFF 1.2.0 schema supports multiple SPDX identifiers and this citation object explicitly covers both the software and the manuscript/documentation. The `message` field was extended with one sentence clarifying the split and pointing to `DRA-LICENSING.md`. Two new `references` entries (DRA-PUB-006, DRA-PUB-007) were added for completeness, consistent with the existing pattern of listing every publication-programme document. No DOI, repository URL, or other identifier was invented; the existing "No DOI has been minted" language was left unchanged.

## 13. Archival/publication metadata — updated (one record) / preserved (others)

- `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md`: the "License" field, previously "MIT (DRA-authored code and documentation only)", was updated to state the correct MIT/CC-BY-4.0 split with a pointer to the new governance record. This document is explicitly a "prepared, not filed" deposit-staging record — no external deposit has ever been made from it — so updating it to the current, correct decision is not a historical-record rewrite; it is exactly the kind of forward-looking record this task's own purpose (preparing for a future actual deposit) requires to stay current. See the governance record's "Historical-record treatment" section for the reasoning.
- `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md` (row 14, VAL-002 raw artefacts) and `docs/dra/DRA-PUB-004-EDITION.md` were inspected; neither makes a licence-terminology claim that conflicts with the PUB-007 decision, so neither was modified.
- `docs/dra/DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md` and its report were inspected; both correctly describe themselves as governance-only records with no licensing claim to correct.

## 14. Third-party licensing inventory — created

`docs/dra/DRA-THIRD-PARTY-LICENSING.md` (new document; no equivalent concise, publication-oriented inventory existed previously — `DRA-ATTRIBUTION.md` gives the complete per-document breakdown for the one persisted-bytes category but does not summarise the wider category landscape). See §8 above for its contents.

## 15. Repository-wide licence terminology audit

Searched tracked files under `docs/dra/` and the repository root for: `license`/`licence`, `MIT`, `CC BY`/`CC-BY`, `Creative Commons`, `copyright`, `all rights reserved`, `public domain`, `OGL`, `CC BY-ND`, and case variants.

- Every `MIT` occurrence found outside the newly-created/updated documents refers correctly to the software licence, the DRA-PUB-006 audit's own account of adding the `LICENSE` file, or the DRA-PUB-004 report's historical statement that "no single repository-wide licence was applied in a way that would misleadingly imply MIT terms cover third-party document content" (a statement that remains true and required no correction).
- No document was found describing "the repository" or "documentation" as wholly MIT-licensed in present tense outside the one corrected `DRA-PUB-004-ARCHIVAL-METADATA.md` field (§13).
- No stale "licence TBD" or "unlicensed" language was found anywhere.
- The only "all rights reserved" occurrences found are in `DRA-ACQ-028`'s discovery report and the new `DRA-THIRD-PARTY-LICENSING.md`'s summary of it — both correctly describing a **rejected, non-admitted** UN Media candidate's own restrictive notice, not a claim about DRA's own material.
- No incorrect "all rights reserved" declaration was found on any DRA-authored CC BY documentation.

**Conclusion: no additional terminology contradiction requiring correction was found beyond the one addressed in §13.**

## 16. Author attribution check

Checked attribution consistency across the manuscript's authorship section, `DRA-CITATION.cff`, `DRA-PUB-004-ARCHIVAL-METADATA.md` ("Directing human principal (research programme lead). No individual named co-authors beyond the directing principal; no AI system is listed as an author"), and `DRA-RELEASE-README.md`. All four describe the same attribution model consistently: a single directing human principal, no named individual co-authors, no AI system listed as an author. No spelling inconsistency exists because no individual personal name is used anywhere in these records — the attribution is deliberately role-based ("directing human principal"), consistently, across every record checked. No correction was needed, and no additional author was invented.

## 17. AI-assistance disclosure check

Re-read `DRA-RELEASE-README.md`'s "AI-assistance disclosure" section and the manuscript's "Authorship and AI-assistance disclosure" section (referenced, not re-opened for editing, since neither makes a licensing claim). Both state that the implementation, evidence-generation tooling, and publication package were produced with substantial AI assistance under human direction, kept as a transparency statement separate from authorship and licensing. `DRA-LICENSING.md` and `DRA-PUB-007-DOCUMENTATION-LICENCE-GOVERNANCE.md` do not add any AI system as a copyright owner or licence grantor — the CC BY 4.0 grant is made by "the DRA author" (the human directing principal), consistent with the existing disclosure. No change was needed to any AI-disclosure text.

## 18. Files created

- `LICENSE-DOCUMENTATION`
- `docs/dra/DRA-LICENSING.md`
- `docs/dra/DRA-THIRD-PARTY-LICENSING.md`
- `docs/dra/DRA-PUB-007-DOCUMENTATION-LICENCE-GOVERNANCE.md`
- `docs/dra/DRA-PUB-007-REPORT.md` (this document)

## 19. Files modified

- `docs/dra/DRA-CITATION.cff` — `license` field (MIT → [MIT, CC-BY-4.0]), `message` field extension, two new `references` entries.
- `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md` — "License" field corrected (see §13).
- `docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md` — added licensing-note section and extended "Included" table.
- `docs/dra/DRA-RELEASE-README.md` — "Licensing" section rewritten to state all three categories explicitly.

No file under `lib/dra-reference/src/**`, no GEN-001/VAL-002 protocol/data/output file, no proof-receipt file, no frozen manuscript file, and no DRA-PUB-005/PUB-006 governance record's substantive content was modified.

## 20. Verification

- `git diff --stat` after all edits (pre-commit): exactly 4 modified files (`DRA-CITATION.cff`, `DRA-PUB-004-ARCHIVAL-METADATA.md`, `DRA-PUBLIC-REPOSITORY-FILESET.md`, `DRA-RELEASE-README.md`) plus new files — confirmed licensing/governance/metadata only; `git diff --name-only` checked against the frozen scientific path list, zero matches.
- `npx vitest run` over the same 7-file/153-test freeze-integrity suite used at PUB-006 (DRA-ENG-022 cutover pipeline/closure/tamper, DRA-GC-1 freeze integrity, DRA-GEN-001 freeze + protocol-freeze integrity, DRA-VAL-002 freeze integrity): **153/153 tests passed**, unchanged.
- `npx tsc --noEmit` in `lib/dra-reference`: **16 errors**, byte-for-byte identical (via `diff`) to the error list recorded at PUB-006.
- GC-1 canonical aggregate digest confirmed unchanged in `dra-gc-1-freeze-manifest.ts`: `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`.
- `GC1_EVALUATOR_VERSION = "0.1.2"`, `GC1_CORPUS_VERSION = "DRA-CORPUS-1.0.0"` confirmed unchanged in source.
- Pipeline version `1.0` and model/schema version `0.1.0` are embedded in the same manifest module referenced above and were not touched by any edit in this task; not independently re-verified beyond confirming the file itself was not modified.
- GEN-001 and VAL-002 bindings: their freeze-integrity test files (both included in the 153-test run above) passed unchanged, and no file under either study's protocol/data/output directories appears in `git diff --name-only`.
- Claim boundaries: `docs/dra/DRA-PUBLIC-CLAIMS.md` does not appear in `git diff --name-only` — unchanged.

## 21. Remaining licensing uncertainties

None material. The one item PUB-006 flagged (missing documentation licence) is closed by this task. `DRA-THIRD-PARTY-LICENSING.md` retains several `REVIEW_REQUIRED`/restricted classifications for specific third-party categories (Crown-copyright non-OGL material, bespoke-notice material) — these are intentional, conservative classifications carried over from existing acquisition records, not open questions this task failed to resolve; they correctly gate any *future* decision to add raw bytes for that material, which this task does not do and does not need to do.

## 22. Final verdicts

- `DOCUMENTATION_LICENCE_CLOSED`
- `SOFTWARE_LICENCE_CONFIRMED`
- `THIRD_PARTY_RIGHTS_BOUNDARY_DEFINED`
- `SCIENTIFIC_STATE_UNCHANGED`
- `READY_FOR_CURATED_PUBLIC_REPOSITORY_BUILD`

All five verdicts are supported by the verification in §20 and the absence of any material unresolved licensing blocker (§21). This task does not create, push, or upload anything externally, and does not perform DRA-PUB-008 (Curated Public Repository Construction).
