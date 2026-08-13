# DRA-ENG-021 — Currentness Evidence Integrity and Digest-Binding Closure

**Status:** CLOSED
**Date:** 2026-08-11
**Prior work closed by this report:** DRA-ENG-020 (Version/Supersession Currentness Semantics)

## 1. Problem (audit finding)

DRA-ENG-020 introduced `CurrentnessAssessment` as a third, independent
governance axis, but left it — by explicit design at the time — completely
outside DRA's tamper-evident integrity boundary. An audit of the two existing
integrity mechanisms confirmed the gap is total, not partial:

1. **`AcquisitionFreezeRecord.freezeRecordDigest`**
   (`computeAcquisitionFreezeRecordDigest` in `integrity.ts`) hashes a fixed
   allowlist of material fields that explicitly excludes
   `currentnessAssessment`.
2. **`ProofReceipt.substantiveDigest`** (`build-proof-receipt.ts`) hashes a
   hand-built `stageOutputs` array. Stage 1's stage record never includes
   `requesterMetadata` — the channel `currentnessAssessment` is propagated
   through into the evaluator — so the assessment never reaches the receipt
   digest even indirectly.

Net effect: a bound currentness assertion (e.g. `CONFIRMED_SUPERSEDED` with
NIST's own withdrawal notice as evidence) could be silently altered on a
persisted freeze record — flipped to `CONFIRMED_CURRENT`, its evidence
replaced, its `assessedBy` changed — without invalidating any digest DRA
currently verifies. The assertion was governed at creation time but not
tamper-evident afterward.

## 2. Architecture chosen

A **new, separately versioned digest** — `currentnessAssertionDigest` —
computed by a new module,
`lib/dra-reference/src/benchmark/acquisition/currentness-integrity.ts`, and
attached as two new **optional** fields on `AcquisitionFreezeRecord`:
`currentnessAssertionDigest` and `currentnessIntegritySchemaVersion`.

### Alternatives considered and rejected

- **Extend `freezeRecordDigest`'s material-fields allowlist.** Rejected: this
  would change the computed digest for every future freeze record carrying a
  `currentnessAssessment`, and would recompute DRA-DOC-0030/0031's original
  freeze digests differently were their creation code path ever re-run —
  violating the explicit "never recompute historical digests" constraint. It
  also conflates two distinct evidence objects: the frozen source artefact's
  identity (immutable, established once) and an externally-established
  governance assertion about that artefact's lineage.
- **Extend `ProofReceipt.substantiveDigest` / `stageOutputs`.** Rejected: the
  seven-stage, DRA-001 §8 proof receipt shape is frozen production format.
  Folding an acquisition-layer governance concern into it conflates the
  evaluator's pipeline-integrity boundary with the acquisition layer's
  governance boundary, and would require a receipt schema/version bump for a
  concern that has nothing to do with Stage 1–7 evaluation semantics.
- **Composite/Merkle structure spanning freeze + receipt + currentness.**
  Rejected as unnecessary complexity: there are exactly two evidence objects
  in play (the frozen artefact, and the assertion about it); one additional
  digest binding the assertion to the specific frozen artefact it was made
  about is sufficient.

### What is bound (and why)

| Field | Bound? | Rationale |
|---|---|---|
| `schemaVersion` | ✅ | Identifies the canonicalisation rule set itself. |
| `freezeRecordId` | ✅ | Ties the assertion to **one specific frozen artefact** — a currentness assertion is meaningless detached from which frozen instance it was made about. |
| `corpusDocumentId` | ✅ | Assessed-document identity. |
| `currentnessStatus` | ✅ | The core claim. |
| `relatedDocumentIdentifier` | ✅ | Superseding/current document identity. |
| `relatedCorpusDocumentId` | ✅ | In-corpus relation. |
| `evidenceUrl` | ✅ | Authoritative evidence locator. |
| `evidenceQuote` | ✅ | Authoritative evidence content. |
| `assessedBy` | ✅ | Authority identity of the assessor. |
| `assessedAt` | ✅ | When the authoritative evidence was reviewed — part of the assertion's substance, unlike a receipt's operational issuance timestamp. |
| `notes` | ❌ (excluded) | Assessor free-text commentary with no evidentiary role — mirrors the existing `frozenAt`-exclusion precedent already in `freeze.ts`. |

### Compatibility / versioning strategy

`CURRENTNESS_INTEGRITY_SCHEMA_VERSION` (`"dra-currentness-integrity-v1"`) is
embedded in the hashed payload and stored alongside the digest.
`verifyCurrentnessAssertionDigest` only recognises schema versions it
implements and **fails closed** (returns `false`, never throws) for any
unrecognised version — this both satisfies the spec's "malformed or
version-incompatible schema version" tamper scenario and means a future v2
canonicalisation can be added by adding a new case to `verify`, never
mutating the v1 payload shape, so v1-issued digests keep verifying under v1
rules forever.

### Placement (historical-digest preservation, by construction)

The two new fields are optional additions to `AcquisitionFreezeRecord`
(`freeze.ts`) and `BenchmarkProofReference` (`governed-pipeline.ts`), never
merged into either existing digest's input allowlist. This means every
pre-existing frozen document (DRA-DOC-0001–0031) keeps a byte-identical
`freezeRecordDigest` and `substantiveDigest` regardless of whether this
programme ran — not merely as a tested outcome, but as a structural guarantee
of where the new code was placed.

## 3. Enforcement point

`createAcquisitionFreezeRecord` computes and attaches
`currentnessAssertionDigest`/`currentnessIntegritySchemaVersion` whenever a
`currentnessAssessment` is supplied. A new exported
`verifyAcquisitionCurrentnessIntegrity(record)` (`freeze.ts`) returns:

- `true` when no assessment/digest is present at all (vacuous — nothing to
  tamper);
- `false` on any inconsistency (assessment present but digest missing, or
  vice versa) or digest mismatch;
- never throws.

`evaluateFrozenBenchmarkDocument` (`governed-pipeline.ts`) calls this check
as part of its INTEGRITY stage and returns
`fail("INTEGRITY", "CURRENTNESS_ASSERTION_DIGEST_MISMATCH", ...)` on failure
— this is the actual runtime tamper-detection enforcement point. Both
`acquireFreezeAndEvaluate` and `evaluateFrozenBenchmarkDocument` populate
`BenchmarkProofReference.currentnessAssertionDigest` as a pure, read-only
pass-through from the freeze record.

## 4. Tamper experiment (unit level)

`dra-eng-021-currentness-integrity-tamper.test.ts` — 14 tests, all passing —
exercises `computeCurrentnessAssertionDigest` / `verifyCurrentnessAssertionDigest`
directly against every scenario enumerated by the governing spec, plus one
binding-identity case and the required control:

| # | Scenario | Result |
|---|---|---|
| 1 | `CONFIRMED_CURRENT` → `CONFIRMED_SUPERSEDED` | detected |
| 2 | `CONFIRMED_SUPERSEDED` → `UNKNOWN` | detected |
| 3 | Superseding-document identity changed (`relatedDocumentIdentifier`) | detected |
| 3b | Superseding-document identity changed (`relatedCorpusDocumentId`) | detected |
| 4 | Authoritative evidence/provenance (`evidenceQuote`) changed | detected |
| 5 | Evidence locator (`evidenceUrl`) changed | detected |
| 6 | Material authority identity (`assessedBy`) changed | detected |
| 7 | Required evidence removed (`evidenceQuote` deleted) | detected |
| 8 | Evidence inserted after proof generation (`UNKNOWN` gains fabricated evidence) | detected |
| 9 | Malformed/version-incompatible `schemaVersion` | rejected (fails closed) |
| — | Binding identity changed (`freezeRecordId`) — different frozen artefact | digest differs |
| **Control** | Altering the deliberately non-bound `notes` field (edited or removed) | **digest still verifies** |

## 5. Pipeline-level integration tests

`dra-eng-021-currentness-integrity-pipeline.test.ts` — 3 tests, mock fetcher,
no live network — proves, at the `acquireFreezeAndEvaluate` /
`evaluateFrozenBenchmarkDocument` level:

- `currentnessAssertionDigest`/`currentnessIntegritySchemaVersion` are present
  iff a `currentnessAssessment` was supplied, and surfaced identically on
  `BenchmarkProofReference`.
- `freezeRecordDigest` is byte-identical for the same inputs with and without
  a `currentnessAssessment` present (historical-digest preservation, at the
  pipeline level, not just the fixture level already covered by
  `dra-eng-020-freeze-digest-regression.test.ts`).
- A freeze record whose `currentnessAssessment` was altered post-hoc (without
  the digest being reissued) is **rejected** by
  `evaluateFrozenBenchmarkDocument` with
  `INTEGRITY` / `CURRENTNESS_ASSERTION_DIGEST_MISMATCH`, while its own
  `freezeRecordDigest` still verifies — proving the two digests are genuinely
  independent evidence objects, not aliases of each other.
- The untampered record still evaluates successfully and carries the
  matching digest through to the result.

## 6. Real closure experiment — DRA-DOC-0031 / DRA-DOC-0030

`dra-eng-021-currentness-integrity-closure-experiment.test.ts` reuses the
exact real specimens and disk caches from DRA-ACQ-027 / DRA-ENG-019 / the
ENG-020 closure experiment (no new live acquisition; no new document). It
runs the full governed pipeline for both documents with real NIST CSRC
catalog evidence, then demonstrates tampering against both:

| Document | Baseline decision (unchanged) | Baseline issues (unchanged) | `currentnessAssertionDigest` bound | Tamper detected |
|---|---|---|---|---|
| DRA-DOC-0031 (Rev. 4, `CONFIRMED_SUPERSEDED`) | HOLD | 5 | ✅ 64-hex digest, schema `v1` | ✅ status-flip + relation-strip rejected by `evaluateFrozenBenchmarkDocument` |
| DRA-DOC-0030 (Rev. 5, control, `CONFIRMED_CURRENT`) | REVIEW | 1 | ✅ 64-hex digest, schema `v1` | ✅ `evidenceUrl` swap rejected |

Results:

1. Both documents' Stage 1–7 decisions, issue counts, and statement counts
   are unchanged from the DRA-ENG-020 baseline (HOLD/5/24,310+ and
   REVIEW/1/25,603+) — the integrity layer introduces zero evaluation
   regression.
2. Both documents' `freezeRecordDigest` still verifies (`true`) — including
   on the tampered copies — proving the currentness tamper is caught by a
   dedicated, independent check, not by `freezeRecordDigest` incidentally
   covering it.
3. `verifyAcquisitionCurrentnessIntegrity` correctly returns `false` for both
   tampered freeze records, and `evaluateFrozenBenchmarkDocument` rejects both
   with `CURRENTNESS_ASSERTION_DIGEST_MISMATCH`.
4. Determinism preserved: an untampered re-evaluation of DRA-DOC-0031 via
   `evaluateFrozenBenchmarkDocument` reproduces the identical decision, issue
   count, statement count, `currentnessAssessment`, and
   `currentnessAssertionDigest` as the original `acquireFreezeAndEvaluate` run.

Full test run: 1/1 passing, 17.4s wall clock (disk-cached, no live fetch
required beyond what DRA-ACQ-027/DRA-ENG-019 already populated).

## 7. Regression evidence

- `dra-eng-021-currentness-integrity-tamper.test.ts` — 14/14 pass.
- `dra-eng-021-currentness-integrity-pipeline.test.ts` — 3/3 pass.
- `dra-eng-021-currentness-integrity-closure-experiment.test.ts` — 1/1 pass.
- `dra-eng-020-freeze-digest-regression.test.ts`, `dra-eng-020-currentness-semantics.test.ts`,
  `governed-acquisition.test.ts` — 106/106 pass, unchanged.
- Governance suites (`admissions`, `allocation`, `amendment`, `content-boundary`,
  `near-duplicate`, `protocol`, `version`) plus `eligibility.test.ts` and
  `freeze.test.ts` — 144/144 pass, unchanged.
- Full `src/benchmark/acquisition/__tests__/` sweep (excluding the
  multi-hundred-second `dra-bmk-*`/`dra-chk-*` checkpoint suites, which do
  not exercise the acquisition/freeze layer touched by this programme):
  515/530 pass. The 15 failures are **pre-existing and unrelated** —
  confirmed via `git stash` (they fail identically with this programme's
  changes stashed out): stale hard-coded baselines from before evaluator
  version 0.1.2 (DRA-ENG-014) and a stale reference digest in
  `dra-doc-0008-blind-evaluation.test.ts` / `dra-val-002-result-review.test.ts`
  / `dra-eval-002-improved-evaluator.test.ts` / `dra-ops-001-execution.test.ts`
  / `dra-acq-026-nist-sp80053-admission.test.ts` (a machine-timing assertion).
  None involve `currentness.ts`, `currentness-integrity.ts`, `freeze.ts`, or
  `governed-pipeline.ts` logic, and none are new relative to this programme's
  starting state.

## 8. `tsc --noEmit` status

Clean for every file this programme touched or added
(`currentness-integrity.ts`, `freeze.ts`, `governed-pipeline.ts`, all three
new test files). Two **pre-existing, unrelated** errors remain elsewhere in
the package, confirmed via `git status`/`git stash` to predate this
programme and to be untouched by it:

- `dra-acq-026-long-range-structural-robustness.test.ts` — references
  `CitationIntegrityReport.overallStatus`, a property absent from that type.
- `dra-acq-025-non-redundant-graphics-discovery.ts` — a `groundTruthExamples`
  literal-union type mismatch on `RedundancyAuditEntry.classification`.

Per this programme's scope discipline (no unrelated engineering), these were
**documented, not fixed** — fixing them is out of scope for DRA-ENG-021 and is
left as a small, separate follow-up.

## 9. Scope discipline

As required by the governing spec, this closure:

- Made **no** changes to `currentness.ts`'s evidence-gating semantics, the
  tri-state status model, or the never-inferred design — the integrity layer
  is purely additive on top of it.
- Never recomputed or altered any historical digest for DRA-DOC-0001–0031.
- Implemented the smallest general mechanism: one digest, two optional
  fields, one verification function, one enforcement call site — no
  document-specific production logic anywhere in `currentness-integrity.ts`,
  `freeze.ts`, or `governed-pipeline.ts`.
- Did **not** acquire DRA-DOC-0032 and did **not** start autonomous
  supersession discovery or any unrelated engineering.

## 10. Remaining limitations (documented, not resolved here)

- `currentnessAssertionDigest` itself is not embedded in `freezeRecordDigest`
  or the proof receipt's `substantiveDigest` — a party with write access to a
  persisted freeze record can still delete both new fields entirely (rather
  than editing the assessment in place) and produce a record that
  `verifyAcquisitionCurrentnessIntegrity` treats as "never assessed" (vacuous
  `true`). Closing this fully would require folding a reference to
  `currentnessAssertionDigest` into one of the two existing digests, which
  this programme deliberately avoided per the "never recompute historical
  digests" constraint. A future programme could close this residual gap by
  including `currentnessAssertionDigest` (not the assessment itself) in
  `freezeRecordDigest`'s allowlist **only for freeze records created after**
  a version cut-over, leaving DRA-DOC-0001–0031's existing digests untouched.
- No persistence/audit-log layer for prior assertion versions exists — a
  legitimately corrected assertion (new evidence supersedes old evidence)
  simply replaces the digest with no record of what the previous, differently
  digested assertion said. Out of scope here; not required by the spec.

## 11. Recommended next step (not started)

Close the residual gap in §10: extend the freeze-record schema with an
explicit `integritySchemaCutoverVersion` marker so that freeze records issued
after a chosen future benchmark version fold `currentnessAssertionDigest`
into their own `freezeRecordDigest` allowlist, while every pre-cutover record
(DRA-DOC-0001–0031, plus any interim documents) keeps its existing formula
verbatim. This would close the "delete both new fields" bypass without ever
touching a historical digest.
