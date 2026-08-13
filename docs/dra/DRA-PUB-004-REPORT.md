# DRA-PUB-004 — Publication Production and Archival Release Report

## 1. Publication edition

`DRA-PUB-004`. See `docs/dra/DRA-PUB-004-EDITION.md` for the full edition record. This is a publication-production and packaging programme; it performed no research work and made no scientific claims of its own.

## 2. Scientific-source manuscript identifier

`DRA-PUB-MANUSCRIPT-1`, at `docs/dra/DRA-PUB-003-MANUSCRIPT.md`.

## 3. Frozen manuscript SHA-256

`5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e` — independently recomputed at both the start and the end of this task (`sha256sum docs/dra/DRA-PUB-003-MANUSCRIPT.md`). **Matches the required value exactly. No drift.** The manuscript was not modified at any point in this task.

## 4. PDF filename and SHA-256

`docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf`
SHA-256: `4a17b2ebbb0e601fbee193f1c85a34324036111d63e325db6f172c41c6f37873`
16 pages, A4, generated via `pandoc` (Markdown → standalone HTML with embedded CSS) → `wkhtmltopdf` (HTML → PDF with running header/footer, page numbers "Page N of 16", and PDF outline/bookmarks from the manuscript's heading structure).

## 5. HTML filename and SHA-256

`docs/dra/release/DRA-PUB-004-MANUSCRIPT.html`
SHA-256: `bb7ffa7bfdc5e5cd30c5af9220717379e9fa9129a6bdf2bb40d06ecdb215b85b`
Self-contained (`pandoc --embed-resources --standalone`; CSS inlined, no external stylesheets, fonts, or scripts, no JavaScript). Includes a table of contents generated from manuscript headings.

## 6. Release-package/archive filename and SHA-256

`docs/dra/release/DRA-PUB-004-RELEASE-PACKAGE.tar.gz`
SHA-256: `4eac8a419b92f144175bed5d21e42f6f0d406341b3933cd0346ff19462a3e493`
723 entries, 3,754,063 bytes. See §9 for full creation-procedure detail.

## 7. Release-manifest compliance

Constructed strictly from `docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md`'s 21 classified categories:

- **INCLUDE** (14 categories): all of `docs/dra/*.md` except the manifest's own designated exclusions, plus `lib/dra-reference/src` core evaluator, benchmark/corpus/acquisition/governance code, frozen manifests, proof-receipt code, GC-1/GEN-001/ENG-026/GC2-REV-001/VAL-002/PUB-001/PUB-002 documents and code, and the DRA-ACQ-*/DRA-BMK-*/DRA-ROB-*/DRA-ENG-0**-* history — all copied into the staged package.
- **INCLUDE_WITH_NOTICE** (3 categories): tests (`__tests__/**/*.test.ts`, copied in full — the 8 pre-existing known-failing tests and live-network dependence are disclosed via `docs/dra/DRA-REPRODUCIBILITY.md` §10, itself included); the ENG-026 experimental rejected module (`materiality-assessment/experimental/dra-eng-026-materiality-rules-v2-experimental.ts`, included, still clearly labelled rejected/never-merged in its own filename and the ENG-026/GC2-REV-001 reports); the 25 VAL-002 raw `.bin` source files (included, with `docs/dra/DRA-ATTRIBUTION.md` as the required top-level attribution notice per the manifest's own recommendation).
- **REFERENCE_ONLY** (1 category): everything outside `lib/dra-reference` and `docs/dra` (other artifacts, root workspace scaffolding) — correctly excluded from the package.
- **EXCLUDE** (3 categories): scratch/temp test-output directories (`.bmk-*-scratch/`, verified absent from the staged package by directory search), internal agent/memory files (`.agents/**`, `.local/**`, never part of either source tree copied), and caches/build outputs (`node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`, `lib/dra-reference/.cache/` — all excluded; `.cache/` alone was 170 MB and was the single largest exclusion).
- **N/A** (1 category): no artefact exists to classify (row 15).

Verified post-build: extracted the archive to a scratch location and confirmed zero occurrences of `scratch`, `.cache`, `node_modules`, `.agents`, or `.local` anywhere in its contents (see §11).

## 8. README decision

**Decision: Option B — DRA remains a subdirectory within the existing monorepo. No root `README.md` or `LICENSE` was created or overwritten for the whole workspace.**

Rationale: this workspace hosts multiple unrelated artifacts (`research-workspace`, `api-server`, `mockup-sandbox`) with their own branding and purpose. No root `README.md` currently exists. Promoting `DRA-RELEASE-README.md` to a workspace-root `README.md` would misrepresent an unrelated multi-artifact monorepo as being about DRA specifically, and would risk pre-empting whatever the other artifacts' own documentation needs turn out to be — this is exactly the "blindly overwrite unrelated repository material" outcome the governing instructions prohibit. `docs/dra/DRA-RELEASE-README.md` (pre-existing from DRA-PUB-003, and already stating this same rationale) remains the DRA-specific landing document within the monorepo; it was updated in this task only to point at the new DRA-PUB-004 edition, PDF, and HTML.

Separately, the **release package itself** (the extracted archive) has its own dedicated, immediately understandable landing `README.md` at its package root — created fresh in this task, distinct from both the monorepo's (nonexistent) root README and from `DRA-RELEASE-README.md`. It orients a recipient who has only the extracted package (no access to the rest of the monorepo) to the manuscript, PDF/HTML, checksums, licence, and reviewer entry point.

## 9. Licensing decision

**Decision: scoped licensing, not a single blanket relicense.**

- **DRA-authored source code and documentation** (`lib/dra-reference/src/**` excluding third-party fixture text, and all of `docs/dra/*.md` originally authored by this programme): MIT. This is consistent with, not new to, this task — the monorepo root `package.json` already declares `"license": "MIT"`, and `docs/dra/DRA-CITATION.cff` and `docs/dra/DRA-ATTRIBUTION.md` already stated MIT for the software prior to this task. A `LICENSE` file (MIT text, with an explicit third-party carve-out paragraph) was added to the release-package root in this task; no equivalent file was added to the monorepo root, since the existing `package.json` field already covers it there and a new root `LICENSE` file was judged out of scope for a DRA-specific packaging task (see §8's rationale).
- **Third-party material** (persisted raw bytes: 25 VAL-002 documents under UK Open Government Licence v3.0 or US federal public domain, 17 U.S.C. §105; referenced-only material: the 33-document development corpus and GEN-001's 100-document sample, stored as metadata/digests only, never as redistributed full text): retains its own original licence or public-domain basis, exactly as already documented in `docs/dra/DRA-ATTRIBUTION.md`. Nothing has been relicensed. The release package's `LICENSE` file explicitly states it does not cover this material and points to `DRA-ATTRIBUTION.md`.
- No licensing right was invented, and no single repository-wide licence was applied in a way that would misleadingly imply MIT terms cover third-party document content.

## 10. Citation-metadata status

`docs/dra/DRA-CITATION.cff` was validated (already `cff-version: 1.2.0`, valid `type: software`, valid `license: MIT`) and extended in this task with two new `references` entries: one clarifying the frozen manuscript's SHA-256/freeze-receipt/erratum linkage, and one for the new DRA-PUB-004 edition and its PDF/HTML artefacts. No DOI, journal, conference, institutional affiliation, or external reviewer was added or invented — the file continues to state "No DOI has been minted for this release" in its `message` field, and the identifiers block continues to record only the internal `DRA-GC-1` aggregate-digest identifier.

A new `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md` prepares Zenodo/preprint-style deposit metadata (title, creators, licence, keywords, version, upload type) explicitly marked as **not filed** — DOI, journal, conference, affiliation, and external-reviewer fields are all explicitly recorded as absent, with the concrete human/external steps required to actually deposit listed at the end of that document.

## 11. Preflight results

Performed against both the PDF (via `pdftotext -layout`) and the standalone HTML:

- **All manuscript sections present**: Rejected title candidates, Abstract, Sections 1–16, Authorship/AI-assistance disclosure, and Appendix — confirmed present by heading search in the extracted PDF text.
- **Tables 1–6 present**: all six table headings and their full row sets found intact in the PDF text extraction, including the least visually simple ones (Table 3/4's multi-line CI cells, Table 5/6's long evidence-source cells).
- **No truncated paragraphs / no missing characters**: spot-checked the abstract, Sections 8–10 (the statistically dense sections), and the Limitations section end-to-end against the source Markdown; all present in full.
- **Unicode rendering correct**: verified specifically for `§` (`17 U.S.C. §105`), em dashes, smart quotes, and the `×` multiplication sign in Table 3 — all rendered correctly, none replaced with placeholder glyphs or dropped.
- **Mathematical/statistical notation correct**: Wilson confidence-interval bracket notation (e.g. `[95.1%, 100%]`), percentage figures, and the rule-of-three approximations were spot-checked against source and matched exactly, including the corrected `≤4.0%` figure (not the erratum-superseded `≤3.0%`) — confirming the frozen manuscript's own already-correct text rendered without alteration.
- **Repository paths rendered sensibly**: inline code spans (e.g. `` `reachability-matrix.ts` ``, `` `docs/dra/DRA-REPRODUCIBILITY.md` ``) rendered as monospace text in both PDF and HTML, unaltered.
- **Page breaks acceptable**: table rows and section headings use `page-break-inside: avoid` / `page-break-after: avoid` CSS rules; no table was observed split with an orphaned header row across a page boundary in the rendered PDF.
- **Title and publication-status metadata correct**: PDF document title metadata (`pdfinfo`) reads "Document Reliability Assurance — DRA-PUB-004"; both PDF and HTML carry a publication-banner block (edition, source manuscript identifier, manuscript SHA-256, freeze-receipt path, and an explicit "no external validation" status line) before the manuscript body, and a status-reminder block after it — these are wrapper elements added around, not edits within, the manuscript content (via `pandoc --include-before-body` / `--include-after-body`).
- **Authorship/AI disclosure present**: "Authorship and AI-assistance disclosure" section confirmed present, unaltered, in both renderings.
- **Limitations present**: Section 14 (Limitations) confirmed present in full, including all nine bullet items, unaltered.
- **No accidental text substitution**: targeted grep checks against the PDF text extraction for specific frozen-manuscript figures (`75/75`, `64`, `10`, `25/25`, `11/25`, `0.1.2`, the full GC-1 aggregate digest) confirmed byte-exact matches to the source. A bag-of-words token-count comparison (source Markdown vs. PDF-extracted text) showed a higher token count in the PDF, fully attributable to the repeated per-page header/footer banner text (16 pages × running header/footer) and publication-banner wrapper content — not to duplicated or substituted manuscript prose.

**Any differences observed were formatting-only** (Markdown table syntax → HTML/PDF table rendering; heading-level typography; page pagination). **No substantive textual difference was found; there is no blocker from this preflight.**

## 12. Integrity verification results

- Frozen manuscript SHA-256 independently recomputed twice (start and end of task): `5aa6cf64b3e985dca5178db6aeb1487a8103782105d968ed62625457eb8e4f8e` both times — **matches required value exactly**.
- Ran the GC-1/GEN-001/VAL-002/ROB-002/PUB-001 freeze-integrity and evidence-synthesis test suites (9 test files: `dra-eng-022-freeze-integrity-cutover-{pipeline,closure-experiment,tamper}`, `dra-rob-002-freeze-readiness-review`, `dra-gc-1-freeze-integrity`, `dra-gen-001-freeze-integrity`, `dra-gen-001-protocol-freeze-integrity`, `dra-val-002-freeze-integrity`, `dra-pub-001-evidence-synthesis`): **193/193 tests passed.**
- `git status` confirmed no historical GEN-001/GC-1/VAL-002/ENG-026/GC2-REV-001 report file was modified during this task — only `docs/dra/DRA-CITATION.cff` and `docs/dra/DRA-RELEASE-README.md` were edited (both publication-metadata files, not evidence artefacts), plus new files created (listed in §13).
- Release package scanned for excluded/internal material: extracted the built archive and searched for `scratch`, `.cache`, `node_modules`, `.agents`, `.local` — **zero matches**.
- Release package scanned for accidental secrets/credentials: searched extracted contents for `SESSION_SECRET`, API-key/password/private-key patterns — the only two matches were (a) `DRA-PUBLIC-RELEASE-MANIFEST.md`'s own prose *documenting* that `SESSION_SECRET` exists but is unrelated to DRA, and (b) a pre-existing Apache HTTP Server documentation fixture (`apache-httpd-auth-fixture.ts`) containing only public tutorial text about `htpasswd`, not a real credential. **No actual secret found.**
- Citation metadata validated: `DRA-CITATION.cff` parses as valid CFF structure (unchanged `cff-version`, `type`, `license` fields), no invented DOI/journal/conference/affiliation/reviewer fields introduced.
- PDF/HTML content completeness verified per §11.
- **Pre-existing, disclosed, non-blocking residuals were left untouched, as instructed**: the 8 stale-version-literal test failures and 16 TypeScript strictness errors (both confined to non-evaluator modules, per `DRA-REPRODUCIBILITY.md` §10) were not "fixed" as part of this release, and their existing disclosure was preserved rather than re-audited or re-counted here.

## 13. Files created/modified

**Created:**
- `docs/dra/DRA-PUB-004-EDITION.md`
- `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md`
- `docs/dra/DRA-EXTERNAL-REVIEWER-ENTRY.md`
- `docs/dra/DRA-PUB-004-CHECKSUMS.sha256`
- `docs/dra/DRA-PUB-004-REPORT.md` (this file)
- `docs/dra/release/DRA-PUB-004-MANUSCRIPT.pdf`
- `docs/dra/release/DRA-PUB-004-MANUSCRIPT.html`
- `docs/dra/release/DRA-PUB-004-RELEASE-PACKAGE.tar.gz`

**Modified (metadata/pointer edits only, no scientific content changed):**
- `docs/dra/DRA-CITATION.cff` — added two `references` entries (manuscript freeze/erratum cross-reference; DRA-PUB-004 edition).
- `docs/dra/DRA-RELEASE-README.md` — updated status line to reference `MANUSCRIPT_SCIENTIFICALLY_READY`, the DRA-PUB-004 edition, and the new PDF/HTML location.

**Not modified:** the frozen manuscript, DRA-GC-1 and its freeze receipt, all corpus/evidence artefacts, GEN-001 (protocol, reports, or erratum), ENG-026, GC2-REV-001, VAL-002, any other historical `DRA-*` report, any proof receipt, or `docs/dra/DRA-PUBLIC-CLAIMS.md`'s claim-boundary wording.

Source repository commit at verification time: `93a2735d7a677eb9bb18c8041d05d55468ee1ced`.

## 14. Confirmation that no scientific/evidence-bearing artefact changed

Confirmed by: (a) exact SHA-256 match on the frozen manuscript, independently recomputed at both the start and end of this task; (b) `git status` showing no modification to any historical report, freeze receipt, or protocol file; (c) 193/193 freeze-integrity and evidence-synthesis tests passing unchanged; (d) no edit was made to any file under the "do not modify" list in the governing instructions. This task's only edits were to two publication-metadata files (`DRA-CITATION.cff`, `DRA-RELEASE-README.md`), and its only new files are publication-production artefacts (edition record, archival-metadata preparation, reviewer entry point, checksum ledger, this report, and the PDF/HTML/archive deliverables themselves).

## 15. Remaining publication actions requiring human/external platform interaction

1. Choosing and executing an actual archival deposit (Zenodo, a preprint server, or equivalent) — no identifier exists yet; see `docs/dra/DRA-PUB-004-ARCHIVAL-METADATA.md` for the prepared-but-unfiled metadata and the concrete steps required.
2. Deciding whether and where to host a public source mirror (e.g. a public GitHub repository), which most archival services expect to link to.
3. Recruiting an actual external, independent reviewer — `docs/dra/DRA-EXTERNAL-REVIEWER-ENTRY.md` prepares the entry point but cannot itself constitute or substitute for that review.
4. Any decision to publicly announce, share, or link this release outside the current workspace.
5. Populating a DOI, journal/venue, or institutional affiliation into `DRA-CITATION.cff` and `DRA-PUB-004-ARCHIVAL-METADATA.md` — explicitly deferred until such an identifier is actually issued by an external platform.

## Verdict

**ARCHIVAL_RELEASE_READY**

The publication edition (DRA-PUB-004), PDF, HTML, checksum ledger, and clean manifest-compliant release archive are all produced, internally verified, and technically ready to be uploaded or published. This verdict does not imply that any external platform (GitHub, Zenodo, arXiv, or otherwise) has accepted or published this package — that step has not been taken and remains listed in §15.
