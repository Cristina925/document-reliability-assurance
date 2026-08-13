# DRA-ENG-001A — Existing Repository Assessment Report

**Document identifier:** DRA-ENG-001A  
**Milestone:** DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline  
**Status:** COMPLETE  
**Date:** 2026-07-26 (UTC)  
**Programme:** DRA-001 — Document Release Assurance, Version 1

---

## 1. Repository Structure Findings

The workspace is a pnpm monorepo managed by `pnpm-workspace.yaml`.

### 1.1 Top-level layout

```
/
├── artifacts/              Deployable applications (in pnpm workspace)
│   ├── api-server/         Express REST API (ESM, TypeScript, esbuild)
│   ├── mockup-sandbox/     Design preview server (Vite, React)
│   └── research-workspace/ CTS research UI + test suite (Vite, React, Vitest)
├── cts-reference/          Frozen CTS v0.1 reference evaluator (standalone — NOT in workspace)
├── lib/                    Shared workspace libraries
│   ├── api-client-react/   Generated React query client
│   ├── api-spec/           OpenAPI specification
│   ├── api-zod/            Zod-typed API schemas
│   └── db/                 Drizzle ORM schema + database client
├── docs/                   Programme documentation
│   ├── dra/                DRA-001 governing documents (established DRA-001-CONS-001)
│   ├── cts-xvii/           CTS external reviewer programme
│   └── publication/        CTS v0.1 publication artefacts
├── research-artifacts/     Frozen CTS experimental records
├── scripts/                Publication pipeline (Bash, Lua, Python, LaTeX)
├── lib/dra-reference/      DRA reference evaluator (scaffold — created DRA-ENG-001)
├── package.json            Workspace root
├── pnpm-workspace.yaml     Workspace package declarations
├── tsconfig.base.json      Shared TypeScript compiler options
└── tsconfig.json           Root project references (tsc --build)
```

### 1.2 pnpm workspace package declarations

```yaml
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
```

`cts-reference/` is **not** declared in the workspace packages. It is a standalone package with its own independent build and test execution. This is an intentional design decision: `cts-reference` is a frozen reference implementation independent from ContinuityOS.

### 1.3 Root TypeScript build

`tsconfig.json` uses project references (`tsc --build`). Referenced packages at baseline:
- `lib/db`
- `lib/api-client-react`
- `lib/api-zod`

`lib/dra-reference` was added to this list at DRA-ENG-001.

---

## 2. Package Boundaries and Technology Stack

| Package | Name | Type | Module | Test runner | Build tool |
|---|---|---|---|---|---|
| `cts-reference/` | `cts-reference` | Standalone (not workspace) | CommonJS | Node.js built-in (`node --test`) | tsc |
| `lib/db/` | `@workspace/db` | Shared lib | ESM | — | tsc (declarations only) |
| `lib/api-zod/` | `@workspace/api-zod` | Shared lib | ESM | — | tsc (declarations only) |
| `lib/api-client-react/` | `@workspace/api-client-react` | Shared lib | ESM | — | tsc (declarations only) |
| `artifacts/research-workspace/` | `@workspace/research-workspace` | Vite app | ESM | Vitest | Vite |
| `artifacts/api-server/` | `@workspace/api-server` | Express app | ESM | — | esbuild (custom build.mjs) |
| `artifacts/mockup-sandbox/` | `@workspace/mockup-sandbox` | Vite app | ESM | — | Vite |

---

## 3. TypeScript Configuration

**Base configuration** (`tsconfig.base.json`):
- `target`: `es2022`
- `module`: `esnext`
- `moduleResolution`: `bundler`
- `strict`: partial (noImplicitAny, strictNullChecks, alwaysStrict; strictFunctionTypes disabled)
- `noImplicitReturns`: true
- `skipLibCheck`: true

**CTS-reference configuration** (`cts-reference/tsconfig.json`):
- `target`: `ES2022`, `module`: `commonjs`, `moduleResolution`: `node`
- Full strict mode including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Compiles to `dist/` for Node.js test runner execution

**lib/ package convention**: `extends ../../tsconfig.base.json`, `composite: true`, `emitDeclarationOnly: true`, source directly exported from `src/index.ts`.

---

## 4. Test Frameworks and Test Locations

| Scope | Framework | Test locations | Command |
|---|---|---|---|
| `cts-reference` | Node.js built-in (`node --test`) | `cts-reference/src/tests/*.test.ts` (compiled to `dist/tests/`) | `cd cts-reference && pnpm test` |
| `research-workspace` | Vitest 4.1.10 | `artifacts/research-workspace/src/research/*.test.ts` | `cd artifacts/research-workspace && pnpm test` |
| `dra-reference` | Vitest 4.1.10 | `lib/dra-reference/src/tests/*.test.ts` | `cd lib/dra-reference && pnpm test` |

No other packages have test suites at baseline.

---

## 5. Build Commands

| Scope | Command | What it does |
|---|---|---|
| Workspace (all) | `pnpm run build` | typecheck + all package builds |
| Typecheck (all) | `pnpm run typecheck` | `tsc --build` (lib refs) + all artifacts/scripts typecheck |
| Typecheck (libs only) | `pnpm run typecheck:libs` | `tsc --build` against root tsconfig.json project refs |
| CTS evaluator | `cd cts-reference && pnpm build` | tsc → `dist/` |
| CTS evaluator tests | `cd cts-reference && pnpm test` | `node --test dist/tests/**/*.test.js` |
| Research workspace | `cd artifacts/research-workspace && pnpm test` | `vitest run` |
| DRA reference | `cd lib/dra-reference && pnpm test` | `vitest run` |

---

## 6. Existing CTS Module Locations

| Component | Location |
|---|---|
| CTS evaluator core | `cts-reference/src/core/` |
| CTS pipeline stages | `cts-reference/src/core/stages/` |
| CTS type definitions | `cts-reference/src/types/` |
| CTS test fixtures | `cts-reference/src/fixtures/` |
| CTS invariants | `cts-reference/src/invariants/` |
| CTS reports | `cts-reference/src/reports/` |
| CTS tests | `cts-reference/src/tests/` |
| CTS verification | `cts-reference/src/verification/` |
| CTS public API | `cts-reference/src/index.ts` |

---

## 7. Frozen CTS Artefact Locations

| Artefact | Location |
|---|---|
| CTS v0.1 manuscript (audited source) | `docs/publication/CTS_V0.1_EXECUTIVE_TECHNICAL_OVERVIEW.md` |
| CTS publication release artefacts | `release/` |
| CTS experimental records | `research-artifacts/EXP-DEV-001/`, `EXP-DEV-002/`, `EXP-INT-001/`, `EXP-HLD-001/` |
| CTS implementation logs | `research-artifacts/CTS-XVI-IMP-*/` |
| CTS publication milestone records | `research-artifacts/CTS-PUB-001/` through `CTS-PUB-005/` |
| CTS audit report | `docs/publication/CTS-PUB-003A-AUDIT.md` |
| CTS external reviewer documents | `docs/cts-xvii/` |

---

## 8. Reusable Infrastructure, Libraries, and Patterns

### Directly reusable

| Item | Location | Reuse opportunity for DRA |
|---|---|---|
| Vitest test framework | workspace devDeps | DRA test suite (already adopted for `lib/dra-reference`) |
| TypeScript base config | `tsconfig.base.json` | DRA tsconfig extends this |
| pnpm workspace | `pnpm-workspace.yaml` | DRA package registered as `@workspace/dra-reference` |
| `lib/*` package pattern | e.g. `lib/db/` | DRA follows same `composite: true`, `emitDeclarationOnly` convention |
| SHA-256 integrity checking | `scripts/release.sh` | DRA proof receipt integrity verification |
| Frozen artefact pattern | `research-artifacts/` | DRA benchmark corpus and evidence preservation |

### Potentially reusable (assess at DRA-ENG-002+)

| Item | Location | Notes |
|---|---|---|
| Zod schema validation | `lib/api-zod/` | DRA may use Zod for document input validation |
| Drizzle ORM + Postgres | `lib/db/` | DRA persistence (if proof receipts require DB storage) |
| Express API server | `artifacts/api-server/` | DRA API endpoint (deferred; not in Version 1 scope) |

### Not reusable — CTS evaluator internals

The `cts-reference` evaluator stages, Type Kernel, pipeline, and decision semantics are **not reusable** as DRA implementation logic. DRA must not inherit CTS evaluator semantics unless explicitly authorised by the DRA-001 specification at a future milestone.

---

## 9. Identified Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| RISK-001 | DRA developer accidentally imports `cts-reference` internals | Medium | Explicit dependency prohibition documented in DRA-ENG-001B; `cts-reference` has no `@workspace` name and is not in workspace package list |
| RISK-002 | DRA decision semantics drift from DRA-001 specification | High | Seven-stage pipeline and nine issue classes are frozen; changes require explicit specification update before implementation |
| RISK-003 | `cts-reference` modified during DRA implementation | Critical | Frozen artefact diff check required at every milestone; 293 tests serve as regression guard |
| RISK-004 | DRA test fixtures conflated with CTS experiment fixtures | Low | DRA fixtures stored in `lib/dra-reference/src/fixtures/`, clearly separate from `research-artifacts/` |
| RISK-005 | Benchmark independence compromised | Medium | Baseline assessments must be frozen before DRA evaluator output is revealed (DRA-VBP-001 §3.3) |

---

## 10. Recommended DRA Module Location

**Recommendation:** `lib/dra-reference/` — workspace package `@workspace/dra-reference`.

---

## 11. Rationale for Recommendation

1. **Separation from CTS.** `cts-reference/` is explicitly standalone and independent. DRA should not be placed inside or adjacent to it. A peer location in `lib/` creates a clear architectural boundary.

2. **Workspace integration.** `lib/*` packages are declared in `pnpm-workspace.yaml`. Placing DRA here gives it full workspace tooling: shared `tsconfig.base.json`, workspace dependency resolution, `pnpm run typecheck:libs` coverage.

3. **Consistency with existing lib pattern.** `lib/db`, `lib/api-zod`, `lib/api-client-react` all follow the same `package.json` + `tsconfig.json` + `src/index.ts` pattern. DRA can follow this pattern without introducing new conventions.

4. **Named package boundary.** `@workspace/dra-reference` gives DRA a distinct package name. This makes import boundaries explicit — any file that `import`s from `@workspace/dra-reference` is clearly depending on DRA, and the reverse is also traceable.

5. **Future flexibility.** If DRA Version 2 requires an API server integration, `artifacts/api-server` can import `@workspace/dra-reference` without restructuring.

---

## 12. Alternatives Considered and Rejected

| Alternative | Reason rejected |
|---|---|
| Place inside `cts-reference/` | `cts-reference` is frozen. DRA must not be co-located with frozen CTS implementation. Violates CTS protection boundary. |
| Place inside `artifacts/research-workspace/` | Research workspace is a CTS research UI, not a DRA evaluator host. Co-locating DRA here conflates two separate programmes. |
| Standalone root package (peer to `cts-reference/`) | Would require excluding it from workspace packages (as `cts-reference/` is excluded). Loses workspace tooling benefits without a compensating reason. |
| New top-level `dra/` directory | Introduces a new top-level directory type not consistent with existing monorepo conventions. `lib/` already exists for shared evaluation libraries. |

---

*Produced at DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline.*
