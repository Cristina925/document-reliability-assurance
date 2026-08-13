# DRA-PUB-006 Report — Public Repository Exposure and Release Safety Gate

## 1. Identity

- **Task:** DRA-PUB-006 — Public Repository Exposure and Release Safety Gate.
- **Type:** Public-release safety / repository-hygiene audit. Not a scientific-development task.
- **Prior closure referenced:** DRA-PUB-005 (Publication Identity and Governance Closure).
- **Frozen research state audited:** DRA-GC-1 (evaluator `0.1.2`, pipeline `1.0`, model/schema `0.1.0`, corpus `DRA-CORPUS-1.0.0`), plus DRA-GEN-001 and DRA-VAL-002 — all unchanged by this task.
- **Starting `HEAD`:** `3340653d7e488e3376c5cc877ae3f9df6facc2cc` — one commit ahead of the DRA-PUB-005 closure commit (`d2639a6`) due to an automatic platform checkpoint commit, investigated and explained in full in `DRA-PUB-006-PUBLIC-REPOSITORY-EXPOSURE-AUDIT.md` §2.

## 2. Security audit (secrets/credentials)

**Result: CLEAR.** No API key, token, password, private key, cloud-provider credential, or `.env`-style secret file was found anywhere in tracked files or git history. Full method and evidence in the audit document §5 and §15.

## 3. Privacy audit

**Result: CLEAR**, with one low-severity, no-action informational note (a Replit sandbox path, `/home/runner/workspace/...`, quoted inside historical test-run console output in an engineering baseline report — not a personal identifier). Full method and evidence in the audit document §6.

## 4. Repository hygiene audit

**Result: NON_SCIENTIFIC_REMEDIATION_REQUIRED, remediated.** Two full-project backup ZIP archives (149 MB and 437 MB) were tracked in the git index — one inherited from an earlier session, one added by the automatic platform checkpoint commit that put `HEAD` ahead of the expected DRA-PUB-005 closure point. Both were untracked (`git rm --cached`, files preserved on disk) and excluded going forward via `.gitignore`. A preventive `.gitignore` rule for stray root-level `.log` files was also added (none were tracked, so no removal was necessary). Full detail in the audit document §7.

## 5. Large-file audit

**Result:** the two backup ZIPs above are the only files over 10 MB in the repository; both are addressed by the hygiene remediation. No other tracked file approaches concerning size (largest ordinary blob: 3.6 MB). Full detail in the audit document §8.

## 6. Licensing audit

**Result: NON_SCIENTIFIC_REMEDIATION_REQUIRED, remediated**, plus one non-blocking open item. `package.json` declared `"license": "MIT"` with no root `LICENSE` file present; a standard MIT `LICENSE` file was added, scoped explicitly to software (pointing to `DRA-ATTRIBUTION.md`/`DRA-PUBLIC-RELEASE-MANIFEST.md` for third-party material). Open, non-blocking item: no explicit documentation licence (e.g. CC-BY) has ever been declared for the manuscript/reports; recorded as a residual risk for future policy decision, not unilaterally fixed. Full detail in the audit document §9.

## 7. Third-party copyright/source-byte audit

**Result: CLEAR.** Directly re-verified (not merely trusted from prior task memory) that the 25 VAL-002 raw-source `.bin` files are the *only* third-party raw document bytes persisted anywhere in the repository, all previously cleared `REDISTRIBUTION_VERIFIED` (UK OGL v3.0 / US federal public domain) under DRA-PUB-002 and unchanged. No restrictively-licensed document (e.g. the CC-BY-ND CNIL document, DRA-DOC-0020) has its raw bytes stored anywhere. Full detail in the audit document §10.

## 8. Authority review of the three `ACTIVE — AUTHORITATIVE` sibling documents

**Result: legitimately authoritative for their own subsystems; potential external-reader ambiguity resolved via non-scientific clarification.** `DRA-001-13-AUTHORITATIVE-ENGINEERING-BACKLOG.md`, `DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md` (DRA-VBP-001), and `DRA-ENGINEERING-EVIDENCE-STANDARD.md` (DRA-EES-001) each remain the correct operative process authority for their own subsystem (milestone sequencing, verification/benchmark methodology, and evidence-reporting standard, respectively) and were **not** stripped of that status. Each received an additive, two-sentence governance clarification note (no `Status:` line or other content changed) stating that this status describes their own subsystem authority, not a claim that DRA-001's originally-specified scope remains normative for the published DRA-GC-1 state, with a pointer to `DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md`. Full detail in the audit document §11.

## 9. Public metadata audit

**Result: CLEAR.** `DRA-CITATION.cff`, the manuscript, the release README, and the release manifest were checked for author-name inconsistency, placeholder/invalid contact fields, fabricated DOIs, and internal/Replit URLs — none found. Full detail in the audit document §12–§14 (metadata, README, external links).

## 10. Public release boundary

A curated public repository (fresh `git init`, not this monorepo's own history) is recommended, scoped to `lib/dra-reference/src/**`, `docs/dra/**`, the new root `LICENSE`, a DRA-scoped README, and the DRA-PUB-004 release artefacts — excluding the unrelated CTS research programme, Replit product-scaffolding artifacts, internal agent memory/skills, and both full-project backup ZIPs. Full detail and a complete include/exclude table in the companion document `docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md`. **No external repository, upload, push, or DOI request was performed or attempted** — this is a plan only, per the governing task's explicit instruction.

## 11. Non-scientific remediations performed

1. `.gitignore`: added exclusions for the two full-project backup ZIP name patterns and for stray root-level `.log` files.
2. `git rm --cached` on both full-project backup ZIPs (files preserved on disk, only untracked from the git index going forward).
3. Added root `LICENSE` (MIT), matching `package.json`'s existing declaration.
4. Added an additive governance-clarification note to each of the three `ACTIVE — AUTHORITATIVE` sibling documents (no status or substantive content change).
5. Created `docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md` (public release boundary plan — new document, no existing content changed).
6. Created this report and its companion audit document (new documents).

No remediation touched any file under `lib/dra-reference/src/{normalisation,claim-extraction,authority-resolution,evidence-linkage,materiality-assessment,pipeline,model,shared}`, any GEN-001/VAL-002 protocol/data/output file, any proof-receipt file, any frozen manuscript file, or DRA-PUB-005's own governance record.

## 12. Verification

Re-ran the established DRA-PUB-004/PUB-005 integrity check set after all remediations:

- `npx vitest run` over the 7-file freeze-integrity suite (DRA-ENG-022 cutover pipeline/closure/tamper tests, DRA-GC-1 freeze integrity, DRA-GEN-001 freeze + protocol-freeze integrity, DRA-VAL-002 freeze integrity): **153/153 tests passed**, unchanged from the pre-PUB-006 baseline.
- `npx tsc --noEmit` in `lib/dra-reference`: **exactly the same 16 pre-existing, previously-disclosed errors** as observed at DRA-PUB-005 closure (byte-for-byte identical error list via diff) — no new error introduced by any PUB-006 change.
- DRA-GC-1 canonical aggregate digest, confirmed unchanged in source: `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`.
- Evaluator `0.1.2`, corpus `DRA-CORPUS-1.0.0` constants confirmed unchanged in `dra-gc-1-freeze-manifest.ts`.
- `git diff --stat` confirms the only modified *existing* tracked files are `.gitignore` and the three governance-clarification edits (17 lines inserted total, 0 removed from those three docs' original content); the only tracked-content removal is the two backup ZIPs (intentional, per §4); all other changes are new files. No file under any frozen scientific path appears in the diff.

## 13. Residual risks (disclosed, not blocking)

1. **No documentation-specific licence declared** for the manuscript/reports (software MIT is clear; the text/data licence is not). Recommend a future explicit decision (e.g. CC-BY-4.0) before or shortly after any actual external publication; does not block a curated-repository release since nothing currently misrepresents the position.
2. **This internal repository's git history still contains both full-project backup ZIPs** via already-existing commits (via Git LFS). They are now excluded from future tracking, but a literal push of *this repository's full internal history* (as opposed to the recommended curated fresh-history repository) would still expose them. Mitigated entirely by following the curated-repository construction method in §16 of the audit document / `DRA-PUBLIC-REPOSITORY-FILESET.md`, which does not use this repository's history at all.
3. **No root README exists for this internal monorepo** (only the DRA-specific `docs/dra/DRA-RELEASE-README.md`). Not a defect for this internal repository's own purposes; addressed for the public boundary via the fileset plan, not by adding a generic root README here.

None of the three residual risks affects DRA-GC-1's evaluator behaviour, decision semantics, proof receipts, corpus, or any existing scientific claim.

## 14. Final verdict

**SAFE_WITH_NON_SCIENTIFIC_REMEDIATIONS**

Rationale: no secrets, credentials, or private information were found (which would independently permit an unconditional `SAFE_FOR_PUBLIC_REPOSITORY_RELEASE`); however, genuine, non-scientific hygiene and licensing gaps were found and fixed during this audit (untracked backup archives, added a missing root LICENSE, clarified three documents' authority scope) rather than being merely noted, and one non-blocking documentation-licence decision remains open for future resolution. This verdict — not an unconditional SAFE — accurately reflects that concrete remediation work, not just a clean read, was required to reach a public-release-safe state, and that one residual (non-blocking, disclosed) policy decision remains outstanding.

This verdict does not authorize, and this task did not perform, any actual creation of an external repository, upload, push, DOI request, or public announcement. It authorizes proceeding to that step in a future task, using `DRA-PUBLIC-REPOSITORY-FILESET.md` as the boundary definition, once the one residual documentation-licence decision is made.
