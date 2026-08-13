# DRA Reproducibility Guide

This document explains, precisely, what a third party can and cannot reproduce from this repository, and what does and does not count as a failure of DRA's evidence. Commands below are verified against the actual `lib/dra-reference/package.json` scripts and monorepo tooling — none are invented.

## 1. Prerequisites

- Node.js and `pnpm` (this is a pnpm-managed monorepo; `npm`/`yarn` are actively rejected by the root `preinstall` script).
- No API keys, secrets, or paid services are required to run any of the steps below.

## 2. Installation

From the repository root:

```
pnpm install
```

This installs dependencies for the whole workspace, including `lib/dra-reference`.

## 3. Frozen-evidence verification (Mode A — see §8 for the reproducibility-mode model)

Run the identity/freeze-integrity test suites, which recompute every digest and compare it against the frozen recorded value — no network access required:

```
cd lib/dra-reference
npx vitest run \
  src/benchmark/analysis/__tests__/dra-gc-1-freeze-integrity.test.ts \
  src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts \
  src/benchmark/analysis/__tests__/dra-gen-001-protocol-freeze-integrity.test.ts \
  src/benchmark/analysis/gen-001-phase1/__tests__/dra-gen-001-sample-lock-integrity.test.ts \
  src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-phase2-integrity.test.ts \
  src/benchmark/analysis/gen-001-phase2/__tests__/dra-gen-001-post-blind-evidence-review.test.ts \
  src/benchmark/analysis/__tests__/dra-val-002-freeze-integrity.test.ts \
  src/benchmark/analysis/val-002-phase1 \
  src/benchmark/analysis/val-002-phase2 \
  src/benchmark/analysis/__tests__/dra-pub-001-evidence-synthesis.test.ts \
  src/benchmark/analysis/__tests__/dra-rob-002-freeze-readiness-review.test.ts
```

**Expected result:** all files pass (9 files / 218 tests as of this audit). This is the single most important reproducibility command — it verifies that GC-1, GEN-001, and VAL-002's recorded identities have not drifted.

## 4. Evaluator / core pipeline test execution

```
cd lib/dra-reference
npx vitest run src/model/__tests__ src/pipeline/__tests__
```

**Expected result:** all pass (16 files / 598 tests as of this audit). This exercises the 8-stage pipeline (`evaluateDocument`) and the proof-receipt schema/verification logic against fixed, in-repo fixtures — no network access required.

## 5. GEN-001 verification

The freeze-integrity commands in §3 already re-verify GEN-001's manifest, protocol, sample-lock, Phase 2 result set, and post-blind evidence review bindings against their frozen digests. There is nothing further to "re-run" for GEN-001 beyond these digest checks — per Phase 1's instruction, historical evidence must not be regenerated merely to obtain new timestamps, and GEN-001's own evaluation output is itself part of the frozen evidence being checked, not something to be recomputed from scratch.

## 6. VAL-002 verification

Same principle: §3's `val-002-phase1`/`val-002-phase2`/`dra-val-002-freeze-integrity.test.ts` commands re-verify VAL-002's frozen sample, Run A/B evaluation records, and protocol bindings by digest recomputation. VAL-002's raw source bytes (`val-002-phase1/data/raw/*.bin`) are also available for direct manual inspection if desired — they are the exact bytes VAL-002 evaluated (see §8 Mode A).

## 7. Proof-receipt verification

```
cd lib/dra-reference
npx vitest run src/pipeline/__tests__/canonical-serialise.test.ts src/model/__tests__/proof-receipts.test.ts
```

This exercises `verifyReceiptIntegrity`, which recomputes a SHA-256 digest over the ordered substantive fields of a proof receipt (evaluator identity, all 7 stage outputs, sorted issue register, decision, rationale) and compares it against the receipt's own `substantiveDigest`, deliberately excluding operational fields (`id`, `timestamp`, `documentIdentity.evaluatedAt`).

## 8. Optional live-source reacquisition (Mode B)

**This section is optional and may legitimately fail; failure here does not indicate a defect in DRA's evidence.**

### Reproducibility modes, defined explicitly

- **Mode A — Frozen-evidence reproduction.** Reproduces DRA's recorded results using the byte-identical, locally-persisted representations already committed in this repository (`val-002-phase1/data/raw/*.bin`, GEN-001/VAL-002 frame and result JSON, all digest-bearing manifests). Mode A requires **no network access** and is what §3–§7 exercise. Mode A is the basis of every reproducibility claim this programme makes.
- **Mode B — Live-source reacquisition verification.** Attempts to re-fetch a document from its canonical publisher URL (e.g. `https://www.ons.gov.uk/...`, `https://www.ftc.gov/...`) and compares the freshly fetched bytes against the recorded digest, as a supplementary check of source stability over time — not as a requirement for reproducing DRA's evaluation results.

Live-network tests exist in the suite and are explicitly identified here (do not treat them as part of the deterministic core suite):

- `src/benchmark/acquisition/__tests__/dra-acq-010-oecd-ai-recommendation-prep.test.ts` (live OECD API / PDF URLs)
- `src/benchmark/acquisition/__tests__/http-fetcher.test.ts` (exercises the fetch mechanism itself against live URLs)
- `src/benchmark/execution/__tests__/dra-bmk-011-evaluator-run.test.ts` through `dra-bmk-021-evaluator-run(-b).test.ts`, and `dra-bmk-023-twentythree-document-checkpoint.test.ts` (live re-fetch of benchmark corpus PDFs/HTML — see each file's header comment for its exact document range)
- Various `benchmark/acquisition/__tests__/dra-acq-0##-*-prep.test.ts` acquisition-preparation tests that invoke the live HTTP fetcher against public source URLs

**Mode B may legitimately fail** for reasons that have nothing to do with DRA's evidence quality, including: HTTP endpoint changes, publisher site unavailability, rate limiting, source document replacement or removal, network restrictions in the reproducing environment, byte-level content changes at the source since acquisition, redirects, and anti-bot/Cloudflare-style access controls. VAL-002's own report documents an observed instance of post-hoc live-URL byte drift after its results were already locked — this is expected Mode B behaviour, not a Mode A failure. **A Mode B failure must never be represented, by DRA or by a third party reproducing this work, as a failure of frozen-evidence reproducibility (Mode A).**

## 9. Expected results (summary)

| Command group | Expected outcome |
|---|---|
| §3 freeze-integrity suites | 9 files / 218 tests pass |
| §4 model+pipeline suites | 16 files / 598 tests pass |
| §7 proof-receipt suites | included in §4's count |
| `npx tsc -p tsconfig.json --noEmit` (whole package) | **16 pre-existing type errors** — see §10; this is a known, disclosed state, not a regression to fix before trusting §3/§4's results |
| Full `npx vitest run src/benchmark/analysis` | 14/18 files pass; 8 pre-existing test failures in `dra-chk-002`, `dra-chk-004`, `dra-eng-012`, `dra-eng-013` — see §10 |

## 10. Known repository residuals (disclosed, not hidden)

As of this audit, plus one statistical (not evidence-integrity) erratum: the original GEN-001 reports state a rule-of-three upper bound of ≤3.0% at n=75 for three operational-reliability rates, which is an arithmetic error (the correct value is ≤4.0%). This does not affect any decision, verdict, exclusion, evaluator result, proof receipt, or digest — see `DRA-GEN-001-STATISTICAL-ERRATUM.md` for the full correction and its citation guidance. The affected reports themselves are unmodified.

- **8 pre-existing test failures**, confined to `dra-chk-002-reachability-analysis.test.ts` (1), `dra-chk-004-cross-language-materiality-evidence-audit.test.ts` (3), `dra-eng-012-el-standard-ref-bare-abbreviation-investigation.test.ts` (2), `dra-eng-013-en-standard-reference-grammar-characterization.test.ts` (2). These are frozen-snapshot investigation tests that assert against a stale evaluator-version literal (`"0.1.1"`) or pre-`ENG-014` confusion-matrix expectations, predating the current evaluator version (`0.1.2`) and the ENG-014 versioned correction. They do **not** touch DRA production/evaluator code, do **not** touch any frozen evidence artefact (GC-1/GEN-001/VAL-002/PUB-001 all pass independently — see §3–§4), and do **not** affect reproduction of GEN-001 or VAL-002.
- **16 pre-existing TypeScript errors** under strict `tsc --noEmit`: 14 in `benchmark/analysis/dra-val-002-protocol.ts` (a `const`-assertion syntax rule applied to string-concatenation expressions — a type-strictness issue with no runtime effect, confirmed because the corresponding vitest suite for this exact file passes at runtime via esbuild transform), 1 in `benchmark/acquisition/discovery/dra-acq-025-non-redundant-graphics-discovery.ts` (a candidate-record literal-type mismatch), 1 in `benchmark/acquisition/__tests__/dra-acq-026-long-range-structural-robustness.test.ts` (a stale property reference on a report type). None are in production evaluator code paths (`normalisation/`, `claim-extraction/`, `authority-resolution/`, `evidence-linkage/`, `materiality-assessment/` excluding the clearly-labelled experimental ENG-026 module, `consistency-check/`, `confidence-scoring/`, `pipeline/`), and none affect GEN-001 or VAL-002 reproduction (their freeze-integrity tests pass — see §3).

These residuals are disclosed here precisely so a third party running `pnpm test`/`pnpm typecheck` does not mistake them for evidence of a broken reproduction.

## 11. What constitutes successful reproduction

A reproduction attempt is successful if:

- §3's freeze-integrity suites pass in full (all recomputed digests match their frozen recorded values), and
- §4's model/pipeline suites pass in full, and
- Mode B (if attempted) is understood as supplementary, not required.

A third party achieving the above has reproduced the DRA-GC-1 / DRA-GEN-001 / DRA-VAL-002 evidence chain in the sense this programme claims reproducibility.

## 12. What does NOT constitute evidence failure

The following do **not** indicate a defect in DRA's evidence and must not be reported as such:

- A Mode B (live re-fetch) failure of any kind listed in §8.
- Any of the 16 pre-existing `tsc` errors listed in §10.
- Any of the 8 pre-existing test failures listed in §10.
- Byte drift observed between a document's originally-frozen bytes and a fresh fetch of the same URL at a later date — this is a property of the live web, not of DRA.
