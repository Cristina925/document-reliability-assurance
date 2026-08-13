# DRA Public Repository File Set (DRA-PUB-006, licensing detail updated by DRA-PUB-007)

**Purpose:** define, concretely, what should and should not be copied into a future external public repository for DRA. This is a planning/inventory document only — no external repository is created by this task, and no files are moved, deleted, or uploaded as a result of it.

**Licensing note (DRA-PUB-007):** the curated repository's content divides into three licence categories, not one. See `docs/dra/DRA-LICENSING.md` for the authoritative boundary:
- **MIT** — original DRA software/source code (`lib/dra-reference/src/**` and related package config).
- **CC BY 4.0** — original DRA-authored documentation (`docs/dra/**`, excluding third-party excerpts embedded within it).
- **Original upstream licence** — any third-party material referenced or (in the one audited case, DRA-VAL-002) persisted as raw bytes; never relicensed by DRA. The curated repository must ship both `LICENSE` (MIT) and `LICENSE-DOCUMENTATION` (CC BY 4.0) at its root, plus `DRA-LICENSING.md` and `DRA-THIRD-PARTY-LICENSING.md`, so this boundary is unambiguous to an external reader — a single blanket "this repo is licensed under X" statement must not be used.

**Recommended external repository name:** `document-reliability-assurance`.

**Recommended construction method:** a **curated release repository**, built by copying the paths below into a fresh working tree and running `git init` there, **not** by pushing this monorepo's existing `.git` history. This repository is a multi-project Replit workspace (DRA plus an unrelated CTS research programme and several Replit product-scaffolding artifacts); its full history is also not needed for DRA reproducibility, and it currently contains two large full-project backup archives (see `DRA-PUB-006-PUBLIC-REPOSITORY-EXPOSURE-AUDIT.md` §7) that should never appear in the public repository's history. Starting fresh avoids both problems without touching this repository's own internal history.

## Included

| Path | Rationale |
|---|---|
| `lib/dra-reference/src/**` (excluding `dist/`) | The evaluator implementation, benchmark/acquisition/governance tooling, and the full test suite — the object of publication. |
| `lib/dra-reference/package.json`, `tsconfig*.json`, other package-level config needed to build/test the package | Required to install, build, and run the reference implementation and its tests independently. |
| `docs/dra/**` | Every DRA specification, protocol, freeze record, acquisition/benchmark/engineering report, and publication document — the complete disclosed evidentiary and governance trail (per `DRA-PUBLIC-RELEASE-MANIFEST.md`). |
| `docs/dra/release/*` | The DRA-PUB-004 rendered manuscript (PDF/HTML) and release package. |
| Root `LICENSE` | MIT licence text for the software. |
| Root `LICENSE-DOCUMENTATION` | CC BY 4.0 licence notice for original DRA-authored documentation. |
| `docs/dra/DRA-LICENSING.md`, `docs/dra/DRA-THIRD-PARTY-LICENSING.md` | The licensing boundary and third-party inventory (already part of `docs/dra/**`, called out explicitly here as required reading, not optional). |
| A root `README.md` for the curated repository | Recommend using `docs/dra/DRA-RELEASE-README.md`'s content (adapted to sit at the curated repo's root, since that repo will not have an unrelated generic root README to distinguish itself from). |
| A minimal root `package.json` / lockfile scoped to `lib/dra-reference`'s dependencies | Only what is needed to `pnpm install` and run the evaluator/tests in isolation — not this monorepo's full workspace manifest, which references unrelated artifacts. |

## Excluded

| Path | Reason | Classification |
|---|---|---|
| `cts-reference/`, `release/CTS-*`, `research-artifacts/CTS-*`, `CTS-RESEARCH-WORKSPACE-v0.1-SUMMARY.md` | A separate, unrelated research programme (CTS) sharing this monorepo. Out of scope for a DRA-specific public repository; it has its own claims register and release conventions and should be published, if ever, as its own repository. | SHOULD_NOT_BE_IN_PUBLIC_SOURCE_REPO (for *this* repository) |
| `artifacts/research-workspace/`, `artifacts/api-server/`, `.local/`, `.agents/`, `scripts/`, `attached_assets/`, `research-protocols/`, `research-artifacts/` (non-CTS parts) | Replit workspace scaffolding, internal agent memory/skills, and task-execution artefacts — not part of the DRA evaluator or its evidence chain. | SHOULD_NOT_BE_IN_PUBLIC_SOURCE_REPO |
| `DRA-COMPLETE-PROJECT-BACKUP-2026-08-12.zip`, `DRA-COMPLETE-PROJECT-PUBLICATION-READY-2026-08-13.zip` | Full-repository point-in-time backup archives, not source or evidence content; duplicative of what the curated repository itself represents. Now untracked from this repository's git index (see audit §7) and excluded from any future public repository. | ARCHIVAL_ONLY |
| `node_modules/`, `dist/`, `.cache/`, `.vite/`, `*.tsbuildinfo` | Build/dependency output, regenerable from `package.json`/lockfile. | Standard build hygiene exclusion |
| `pnpm-workspace.yaml`, root `package.json`, `.replit`, `.replit.nix`, `.replitignore`, `.npmrc` at the monorepo root | Monorepo/Replit-environment configuration referencing artifacts outside DRA's scope; not meaningful or necessary outside this workspace. A minimal, DRA-scoped replacement should be authored for the curated repository instead of copying these verbatim. | SHOULD_NOT_BE_IN_PUBLIC_SOURCE_REPO (as-is); replace with a scoped equivalent |

## Licensing treatment

- Software: MIT (root `LICENSE`, matching `package.json` and `DRA-RELEASE-README.md`).
- Frozen scientific manuscript and documentation: included as-is; not separately relicensed by this task (no explicit documentation licence has been declared to date — see the open item in `DRA-PUB-006-REPORT.md` §"Licensing").
- Third-party source material: per `DRA-ATTRIBUTION.md` / `DRA-PUBLIC-RELEASE-MANIFEST.md` rows 14–15 — the 25 VAL-002 raw-byte files (UK OGL v3.0 / US federal public domain, all `REDISTRIBUTION_VERIFIED`) are the *only* third-party raw bytes persisted anywhere in the repository, and are included as-is (`PUBLIC_REPUBLICATION_PERMITTED`). Every other corpus/source document is represented only by metadata, digests, and source URLs (`METADATA/DIGEST_ONLY` / `SOURCE_LINK_ONLY`) — no other raw third-party document bytes exist to exclude.

## Archival-only materials

The two full-project backup ZIPs above are the only archival-only materials identified. They should continue to exist as local/internal Replit artefacts (or be moved to dedicated external archival storage, e.g. a private cloud bucket) rather than being committed to any git repository, internal or public.
