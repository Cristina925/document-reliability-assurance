# DRA-PUB-006 — Public Repository Exposure and Release Safety Gate

## 1. Objective

Determine whether the current, post-DRA-PUB-005 repository can be made public safely — without exposing secrets, private information, inappropriate artefacts, licensing problems, misleading authority signals, or unnecessary internal material. This is a public-release safety and repository-hygiene audit only; it is not a scientific-development task, and it made no change to DRA-GC-1, evaluator behaviour, corpus content, GEN-001, VAL-002, proof receipts, issue semantics, decision semantics, or publication claims.

## 2. Starting state

- Expected DRA-PUB-005 closure commit: `d2639a6010307978e78c9a551d729ec7c97c5bce`.
- Actual `HEAD` at PUB-006 start: `3340653d7e488e3376c5cc877ae3f9df6facc2cc` — **one commit ahead** of the expected value.
- Explanation of the difference (investigated before proceeding, per task instruction): this extra commit, `"Add publication conventions and attach complete project archive"`, was produced by the platform's own automatic checkpoint/backup mechanism after the prior DRA-PUB-005 session ended — not by an explicit PUB-006 action. It added `.agents/memory/MEMORY.md` and `.agents/memory/dra-pub-005-conventions.md` (the PUB-005 session's own memory write, expected and benign), a new `.gitattributes` declaring Git LFS filters for the two full-project backup ZIPs, and the ZIP `DRA-COMPLETE-PROJECT-PUBLICATION-READY-2026-08-13.zip` itself (stored via LFS). This commit was not scientific: no file under `lib/dra-reference/src/**` or any frozen evidence path is touched by it. It is, however, directly relevant to this audit's large-file and repository-hygiene sections (see §7) — the automatic commit tracking of a 436 MB full-project backup archive into the public-facing repository is exactly the kind of unintended exposure PUB-006 exists to catch, and is treated as a finding below rather than ignored.
- `git status` at PUB-006 start: clean except the newly attached PUB-006 spec text asset (`attached_assets/Pasted-Execute-DRA-PUB-006-*.txt`).
- `git log -5 --oneline` at start: `3340653` → `d2639a6` → `d71bb84` → `cdf40c4` → `dd9be2b`.
- No PUB-005 history was rewritten or squashed by this task.

## 3. Relationship to PUB-005

PUB-006 does not reopen or modify any DRA-PUB-005 governance decision. It performs a distinct, later-stage check: whether the *repository as a whole* (not just DRA's publication-facing documentation, which PUB-005 already audited) is safe to expose. Findings that overlap with PUB-005's scope (e.g., the three `ACTIVE — AUTHORITATIVE` sibling documents) are re-examined here with a public-exposure lens specifically, per the governing task's explicit instruction, rather than assumed closed.

## 4. Audit scope

Repository-wide, excluding `.git` internals (inspected separately, §14), `node_modules`, build output (`dist/`, `.cache/`, `.vite/`, `*.tsbuildinfo`), and other generated caches, unless those specific paths were themselves the subject of a hygiene check (§8).

## 5. Secrets and credentials audit — **CLEAR**

Searched tracked files for the full pattern set specified by the task (api key / secret / token / password / private key / cloud-provider credential variants, `.env`/`.npmrc`/`.pypirc`/`.netrc`/service-account patterns, and named env-var literals such as `OPENAI_API_KEY`, `AWS_SECRET_ACCESS_KEY`, `REPLIT_DB_URL`).

- No `.env` or `.env.*` file exists anywhere in the working tree (tracked or untracked).
- No `.pem`, `id_rsa`, service-account JSON, or credential-store file is tracked.
- The only tracked dotfile in this family is `.npmrc`, containing two innocuous pnpm settings (`auto-install-peers=false`, `strict-peer-dependencies=false`) — no registry token, auth line, or credential of any kind.
- Broader keyword greps (`api_key`, `secret`, `password`, `bearer`, `private_key`, etc.) across all tracked, non-`node_modules` files returned only false positives: (a) CTS-programme test/fixture code that uses "secret-scanner" as a *domain-name literal* being tested for absence in evaluator branching logic (unrelated meaning), and (b) a frozen third-party HTML fixture (`apache-httpd-auth-fixture.ts`) that is Apache HTTP Server's own public `.htaccess`/`htpasswd` tutorial documentation, quoted for citation-extraction testing — illustrative text about passwords, not a live credential.
- No named credential environment-variable literal (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GITHUB_TOKEN`, `GH_TOKEN`, `REPLIT_DB_URL`) appears anywhere in tracked files with an assigned value.
- No BEGIN PRIVATE KEY / BEGIN RSA PRIVATE KEY block found anywhere in tracked files.

**No real, active credential of any kind was found.** No redaction, revocation recommendation, or history-rewrite action was necessary.

## 6. Private / personal information audit — **CLEAR** (one low-severity note)

- Email addresses found in tracked files are all legitimate third-party-document metadata: a UK National Audit Office copyright contact address quoted from NAO's own published copyright notice (`copyright@nao.org.uk`, appearing in the ACQ-003 acquisition record and its tests — the correct citation of a public institutional contact, not a private individual's address), and two academic authors' institutional email addresses appearing verbatim inside frozen third-party citation-fixture text (`lib/dra-reference/src/citation-integrity/__tests__/fixtures/*.txt`) — these are the *source documents'* own published author contact details, not DRA-project personal information, and are necessary, unmodified reproductions of the evidence being tested.
- No phone numbers, home addresses, payment information, private correspondence, personal photographs, or unrelated user documents were found.
- No machine-local absolute path containing a real personal username was found. One low-severity item: `docs/dra/DRA-ENG-001R-ENGINEERING-BASELINE-REPORT.md` quotes raw `vitest` console output containing the sandbox path `/home/runner/workspace/...` twice, as evidence of an early engineering-baseline test run. `runner` is Replit's generic sandbox account name, not a personal identifier, and the path reveals only the (already-known, already-public) fact that this programme was developed on Replit. Classified **CLEAR** — no remediation required, noted for completeness.
- No private information was found embedded in any frozen scientific evidence artefact, so the "STOP and classify REVIEW_REQUIRED" branch of this section's instructions does not apply.

## 7. File and repository hygiene audit — **NON_SCIENTIFIC_REMEDIATION_REQUIRED (completed)**

| Finding | Classification | Remediation |
|---|---|---|
| Two full-project backup archives (`DRA-COMPLETE-PROJECT-BACKUP-2026-08-12.zip`, 149 MB; `DRA-COMPLETE-PROJECT-PUBLICATION-READY-2026-08-13.zip`, 437 MB) were tracked in the repository's git index (the latter added by the automatic checkpoint commit described in §2; the former inherited from an earlier session). Both are whole-repository, point-in-time backup snapshots — archival artefacts, not source or evidence content — and are exactly the category the governing task instructs to keep out of a public source repository by default. | NON_SCIENTIFIC_REMEDIATION_REQUIRED | **Untracked from the git index** (`git rm --cached`, files preserved on disk unchanged) and added to `.gitignore` under a new "Archival full-project backups" section, so future checkpoints will not silently re-add them. This does not rewrite this repository's existing git history (both blobs remain reachable via Git LFS from earlier commits in this internal repository) — see §14 and the recommended curated-repository construction method in §16, which avoids ever publishing that history externally. |
| No `.DS_Store`, editor swap file, or other OS/editor metadata is tracked or present anywhere in the working tree. | CLEAR | None needed. |
| Four stray root-level log files from earlier interactive debugging sessions (`acq017_full_output.log`, `acq017_phase2_test.log`, `sleep_test.log`, `sleep_test2.log`) exist on disk but were **not tracked** by git. | CLEAR (preventive hygiene only) | Added `/*.log` to `.gitignore` to prevent any future accidental tracking of this exact pattern. |
| `.gitignore` already excluded `node_modules`, `dist`, `.cache`, `.local`, common build/IDE artefacts, and `.DS_Store`/`Thumbs.db` — reviewed and found adequate apart from the two additions above. | CLEAR | Extended per above; no other gap identified. |
| `docs/dra/release/DRA-PUB-004-RELEASE-PACKAGE.tar.gz` (3.6 MB) and `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf` (156 KB) are tracked. | CLEAR | These are the intended DRA-PUB-004 public release artefacts (`REQUIRED_PUBLIC_RELEASE_ARTEFACT`); left unchanged. |
| Non-DRA repository content (`cts-reference/`, `research-artifacts/`, `research-protocols/`, `scripts/`, `.agents/`, `.local/`, other artifacts) is present and, in the case of `.agents/`/`.local/`, already `.gitignore`d; the rest is tracked but out of DRA's scope. | REVIEW_REQUIRED for public-boundary purposes only (not a defect in the internal repository) | Not deleted — internal monorepo structure is legitimate for Replit's own development use. Addressed via the release-boundary recommendation in §16 / `DRA-PUBLIC-REPOSITORY-FILESET.md`, which excludes these paths from the *curated public repository* rather than the internal one. |

## 8. Large-file audit

Git-aware object scan (`git rev-list --objects --all` + `git cat-file --batch-check`) over the full history, plus a working-tree scan for files >10 MB:

| File | Size | Classification |
|---|---|---|
| `DRA-COMPLETE-PROJECT-BACKUP-2026-08-12.zip` | 149 MB (git-LFS object) | ARCHIVAL_ONLY — see §7 remediation. |
| `DRA-COMPLETE-PROJECT-PUBLICATION-READY-2026-08-13.zip` | 437 MB (git-LFS object) | ARCHIVAL_ONLY — see §7 remediation. |
| `docs/dra/release/DRA-PUB-004-RELEASE-PACKAGE.tar.gz` | 3.6 MB (largest ordinary git blob) | REQUIRED_PUBLIC_RELEASE_ARTEFACT. |
| 25 VAL-002 raw-source `.bin` files | 4 KB – 986 KB each | REQUIRED_FOR_REPRODUCIBILITY (all previously `REDISTRIBUTION_VERIFIED` under DRA-PUB-002 — see §9/§10). |
| `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf` | 156 KB | REQUIRED_PUBLIC_RELEASE_ARTEFACT. |
| `pnpm-lock.yaml` (several historical revisions across commits, ~200–242 KB each) | — | ordinary, expected lockfile size; CLEAR. |
| CTS-programme PDFs/HTML under `release/` and `research-artifacts/CTS-PUB-003/` (each well under 300 KB) | — | out of DRA's scope (§7); no size concern in isolation. |

No file over 10 MB exists in the tracked repository other than the two backup archives, which are remediated above. No file approaches GitHub's 100 MB hard limit outside those two (already LFS-tracked) archives.

## 9. Licensing audit

- Root `package.json` declares `"license": "MIT"`, but **no root `LICENSE` file existed** before this task — classified NON_SCIENTIFIC_REMEDIATION_REQUIRED and remediated: a standard MIT `LICENSE` file was added at the repository root, with a note clarifying its scope (software only) and pointing to `DRA-ATTRIBUTION.md`/`DRA-PUBLIC-RELEASE-MANIFEST.md` for third-party material.
- `docs/dra/DRA-RELEASE-README.md` already states the licensing split correctly (software: MIT; third-party source material: per `DRA-ATTRIBUTION.md`) — no change needed there.
- No documentation-specific licence (e.g. CC-BY for the manuscript/reports) has been declared anywhere. This is a genuine open item, not a blocker: nothing in the existing publication chain (PUB-001 through PUB-005) asserts a documentation licence, so there is nothing to contradict, but an external reader has no explicit answer to "what may I do with the manuscript text itself." Classified **REVIEW_REQUIRED (non-blocking)** — recorded as a residual risk (§"Residual risks" in the companion report) for a future decision, not fixed unilaterally here since choosing a documentation licence is a policy decision, not a hygiene fix.
- PUB-002/PUB-004's licensing determinations (UK OGL v3.0, US federal public domain as the only two bases under which raw third-party bytes are persisted) are correctly reflected in `DRA-ATTRIBUTION.md` and the release manifest; re-confirmed, not re-litigated, by this audit.

## 10. Third-party copyright / source-byte audit — **CLEAR**

Re-verified directly (not merely by trusting the PUB-002 record) that the **only** third-party raw source bytes persisted anywhere in the repository are the 25 VAL-002 `.bin` files under `lib/dra-reference/src/benchmark/analysis/val-002-phase1/data/raw/` — confirmed by a repository-wide `.bin` file search returning exactly that directory and no other. Every other corpus/source document (GC-1's 33-document development corpus, GEN-001's 100-document sample, all ACQ-series acquisitions) is represented only by metadata, digests, and source URLs — no other raw third-party full text exists to audit or exclude.

The 25 VAL-002 files were already individually cleared `REDISTRIBUTION_VERIFIED` under UK OGL v3.0 / US federal public domain in DRA-PUB-002 (Phase 1/2) and are unchanged. No CC-BY-ND-licensed document (e.g. DRA-DOC-0020, CNIL) has its raw bytes persisted anywhere — confirmed by direct search; only test-code *references* to that acquisition exist, no stored source bytes. This is consistent with, and reconfirms, the existing DRA-PUB-002 determination that permission to evaluate a document does not imply, and was never treated as implying, permission to republish its full bytes.

`apache-httpd-auth-fixture.ts` (a synthetic test fixture reproducing part of the Apache HTTP Server documentation's own public `.htaccess` tutorial, used to test citation/authority-resolution extraction) is not part of the governed corpus or any frozen evidence chain; it is ordinary Apache Software Foundation documentation content (freely licensed for reproduction) used as illustrative test data. Classified CLEAR; noted for completeness rather than treated as a redistribution risk.

## 11. Three remaining `ACTIVE — AUTHORITATIVE` documents — individually assessed

| Document | Identifier | Scope | Assessment |
|---|---|---|---|
| `docs/dra/DRA-001-13-AUTHORITATIVE-ENGINEERING-BACKLOG.md` | DRA-001-13 | The single authoritative engineering backlog/milestone sequence for DRA-001-era engineering work. | **Legitimately authoritative for its own subsystem** (how engineering milestones were/are sequenced), but its unqualified `ACTIVE — AUTHORITATIVE` status, combined with an unqualified `Programme: DRA-001` line, could read to an external reviewer as contradicting DRA-001's own now-`HISTORICAL` status. Classified **misleading-but-fixable via non-scientific clarification** — remediated (see below), not left as a publication blocker and not stripped of its own authority. |
| `docs/dra/DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md` (DRA-VBP-001) | DRA-VBP-001 | The verification-levels and benchmark-corpus methodology used to build and measure the evaluator, still in active use. | Same assessment and same remediation as above. |
| `docs/dra/DRA-ENGINEERING-EVIDENCE-STANDARD.md` (DRA-EES-001) | DRA-EES-001 | The evidence/reporting standard every engineering milestone report is written against, still in active use. | Same assessment and same remediation as above. |

**Remediation performed (non-scientific, additive only):** a two-sentence "Governance clarification (added by DRA-PUB-006)" note was inserted into each of the three documents directly beneath their existing header block, stating explicitly that the document's `ACTIVE — AUTHORITATIVE` status describes its continued role as the operative process/methodology authority for its own subsystem, and does **not** imply that DRA-001's originally-specified scope is the normative description of the published DRA-GC-1 research state — with a pointer to `DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md`. **No other text, and in particular no `Status:` line, was changed in any of the three documents** — their authority over their own subsystems is preserved exactly as PUB-005 already decided it should be (see PUB-005 §4, "Scope note on sibling DRA-001-era governance documents").

An external reader could not, after this clarification, reasonably infer that any of the three documents overrides DRA-PUB-005 governance, DRA-GC-1's identity, the canonical publication identity, DRA-PUB-004, or current public claims — the clarification note forecloses exactly that inference.

## 12. Public-facing author / metadata audit — **CLEAR**

Inspected `docs/dra/DRA-CITATION.cff`, `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md`, `docs/dra/DRA-PUB-003-MANUSCRIPT.md`'s metadata, `docs/dra/DRA-RELEASE-README.md`, `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md`, the rendered HTML edition's `<head>` metadata, and root `package.json`.

- No author name is asserted anywhere as an individual (the citation file frames this as a repository/programme citation, consistent with its own `message:` field); no inconsistent spelling issue exists because no personal name is used.
- No invalid or placeholder email/contact field, no placeholder username, no `localhost` or Replit workspace URL, and no fake DOI value were found anywhere in publication-facing metadata. `DRA-CITATION.cff` explicitly states "No DOI has been minted for this release" rather than fabricating one — correct per this task's own instruction not to invent missing identifiers.
- `package.json`'s `"name": "workspace"` is the internal monorepo package name (private, `"private": true`) and is not publication-facing; it is not surfaced anywhere as DRA's identity. No `repository`/`homepage` field exists anywhere in the codebase's `package.json` files to audit for a placeholder GitHub URL — none has been fabricated, consistent with instructions.
- Terminology usage of "Document Reliability Assurance (DRA)" is consistent everywhere it was checked (citation file, README, governance record, manifest).

## 13. Public README audit — **CLEAR**

`docs/dra/DRA-RELEASE-README.md` (the dedicated public release entry point, distinct from the unrelated generic monorepo root — a distinction the README itself states) was re-read in full against the task's checklist: it states what DRA is and is not, the manuscript title/location, the frozen candidate (DRA-GC-1), evaluator version, publication edition, evidence maturity (3/9 issue classes exercised, the rest proven structurally unreachable), reproduction path (Mode A/B), licensing, limitations, citation instructions, and repository structure with a pointer to the full release manifest. It does not claim independent validation, production readiness, certification, industry-standard status, universal reliability, or guaranteed truth/trustworthiness detection anywhere — consistent with the terminology audit already performed in DRA-PUB-005. No remediation was required to this document.

The generic monorepo root previously had **no root `README.md` at all** (not merely an unsuitable one). This is addressed as part of the public release *boundary* recommendation (§16 / `DRA-PUBLIC-REPOSITORY-FILESET.md`) rather than by adding a root README to this internal monorepo, which would be out of PUB-006's scope and is unnecessary for the internal repository's own purposes.

## 14. External link audit — **CLEAR**

No `localhost`, `127.0.0.1`, `*.replit.dev`, or `repl.co` reference was found in any file under `docs/dra/`. Historical acquisition-source URLs (government/publisher websites, some since redirected or blocked, per the extensive ACQ-series disclosure already in the corpus) are correctly treated throughout the documentation as historical provenance evidence, not live navigation links, and are not required to be live today — consistent with the task's explicit instruction not to require every historical source URL to remain reachable.

## 15. Git history exposure review

Targeted, git-aware searches (not a full byte-by-byte history scan, which would be impractical over this repository's size) were run for: any commit that ever added a path matching `.env*` (`git log --diff-filter=A --name-only --all | grep -i "\.env"` — zero results), and any commit message mentioning secret/password/API-key/credential (`git log --all --oneline -i --grep=...` — zero results). Combined with the working-tree-wide secrets sweep in §5 (which would have caught a credential re-added or left in a later commit even if an earlier one were deleted), no evidence of a secret or private artefact having ever existed in this repository's history was found.

Classified **CLEAR**, not merely REVIEW_REQUIRED, on the basis that both the targeted historical searches and the current-state sweep are negative and mutually reinforcing. No git history rewrite was performed or is recommended on this basis. (History handling *is* still relevant to the large-file finding in §7/§8 — addressed there via the curated-repository construction method in §16, not via rewriting this repository's history.)

## 16. Tracked file inventory / public release boundary

High-level classification of tracked content, and the recommended public release boundary, are documented in full in the companion document **`docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md`**, prioritized in the order the governing task specifies (reproducibility, licence compliance, privacy/security, usability, provenance preservation). Summary: the public repository should be a **curated release repository** (fresh `git init`, not this monorepo's history) containing `lib/dra-reference/src/**` (evaluator + tests), `docs/dra/**` (full documentation/evidence trail), the new root `LICENSE`, a DRA-scoped README, and the DRA-PUB-004 release artefacts — excluding the unrelated CTS research programme, Replit product-scaffolding artifacts, internal agent memory/skills, and both full-project backup ZIPs. No external repository was created by this task.

## 17. Non-scientific remediations performed — summary

1. `.gitignore`: added an "Archival full-project backups" exclusion for `DRA-COMPLETE-PROJECT-BACKUP-*.zip` / `DRA-COMPLETE-PROJECT-PUBLICATION-READY-*.zip`, and a root-level `/*.log` exclusion.
2. Untracked (`git rm --cached`, files preserved on disk) both full-project backup ZIPs from the git index.
3. Added a root `LICENSE` file (MIT), matching `package.json`'s existing declaration.
4. Added a short, additive, non-scientific "Governance clarification" note to each of the three `ACTIVE — AUTHORITATIVE` sibling documents (`DRA-001-13-AUTHORITATIVE-ENGINEERING-BACKLOG.md`, `DRA-VERIFICATION-AND-BENCHMARK-PROTOCOL.md`, `DRA-ENGINEERING-EVIDENCE-STANDARD.md`), without changing their status line or any other content.
5. Created `docs/dra/DRA-PUBLIC-REPOSITORY-FILESET.md` (public release boundary plan).

Every remediation above was verified, before being made, not to touch any path under `lib/dra-reference/src/{normalisation,claim-extraction,authority-resolution,evidence-linkage,materiality-assessment,pipeline,model,shared}` (GC-1 frozen decision-affecting scope), any GEN-001/VAL-002 data/protocol/output file, any proof-receipt file, or any historical experimental report's substantive content.

## 18. Integrity verification

See `docs/dra/DRA-PUB-006-REPORT.md` §"Verification" for exact commands and results. Summary: GC-1 aggregate digest unchanged, evaluator/pipeline/model/corpus identities unchanged, GEN-001/VAL-002 bindings unchanged, the established 193-test integrity suite passes unchanged, and `npx tsc --noEmit` shows exactly the same 16 pre-existing, previously-disclosed errors as DRA-PUB-005 — no new TypeScript error was introduced by any PUB-006 remediation.

## 19. Final gate verdict

**SAFE_WITH_NON_SCIENTIFIC_REMEDIATIONS** — see the companion report for the full acceptance-gate checklist and the reasoning for this verdict versus the unconditional `SAFE_FOR_PUBLIC_REPOSITORY_RELEASE` verdict.
