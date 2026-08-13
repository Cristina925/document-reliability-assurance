# DRA-ENG-020 — Version/Supersession Currentness Semantics and Closure

**Status:** CLOSED
**Date:** 2026-08-11
**Prior work closed by this report:** DRA-ACQ-027 Phases 1–2 (capability-gap discovery)

## 1. Problem

DRA-ACQ-027 established, empirically, that the frozen evaluator (version 0.1.2)
has no mechanism — in its decision, issue set, `decisionRationale`, or proof
receipt — to signal that a document in the corpus has been superseded by a
newer authoritative version of the same publication family. DRA-DOC-0031
(NIST SP 800-53 Revision 4, withdrawn 2021-09-23) evaluates identically to any
other admitted document, with no indication that DRA-DOC-0030 (Revision 5) is
the current, active replacement.

The spec for this closure work imposed one hard constraint throughout: **the
mechanism must never compare publication dates or infer supersession from
"newest date wins."** Publication dates are unreliable and manipulable
metadata; DRA must never treat "later date" as "current version" without an
authoritative source saying so explicitly.

## 2. Semantic model chosen

Currentness is introduced as a **third, independent governance axis**,
alongside the two that already exist in the acquisition pipeline:

| Axis | Represents | Existing type |
|---|---|---|
| Authenticity | Is this a genuine, unaltered artefact from its claimed source? | `OfficialSourceAssessment` |
| Authority | Is the publisher/venue entitled to make the claims in the document? | `AuthorityRecord` (Stage 3) |
| **Currentness** (new) | Is this specific version of the document still the active one, or has it been superseded? | `CurrentnessAssessment` |

`CurrentnessAssessment` is a new type in
`lib/dra-reference/src/benchmark/acquisition/currentness.ts`, structurally
parallel to the acquisition-time `OfficialSourceAssessment` /
`LicenceAssessment` pair: a **governed, human-reviewed judgement supplied at
acquisition time**, never inferred by DRA from document content or metadata.

### Why not reuse `AUTHORITY_EXPIRED` (IC-2)?

Rejected for two reasons:

1. **Structural**: the nine issue classes are explicitly frozen for
   Evaluator Version 1 in `model/issue-classes.ts`. Reusing or extending one
   would violate that freeze.
2. **Semantic**: `AUTHORITY_EXPIRED` is about whether an authority's mandate
   to make a claim has lapsed — it belongs to the authority axis, not
   currentness. A document can be fully authoritative (correctly published by
   its issuing body) and still be a superseded version.

Currentness therefore lives entirely **outside the issue taxonomy**, as an
additive, non-blocking field. It can inform downstream consumers without
altering the evaluator's Stage 1–7 decision.

### Why not a full lineage graph?

Rejected as disproportionate to the demonstrated need. The mechanism is
deliberately minimal: a tri-state status plus **one optional directed
reference** to a related document (`relatedDocumentIdentifier` free text, plus
an optional `relatedCorpusDocumentId` for in-corpus links). This is enough to
answer "is this current, and if not, what superseded it?" without building
general graph-traversal machinery DRA doesn't yet need.

### Why not date comparison?

Never implemented, anywhere. `currentness.ts` contains no date-parsing or
date-comparison logic of any kind, and no code path in `freeze.ts` or
`governed-pipeline.ts` reads `publishedAt` when constructing or propagating a
`CurrentnessAssessment`. This satisfies the constraint structurally, not just
by policy — there is no date-comparison function to accidentally call.

## 3. Model details

```
CurrentnessStatus = "UNKNOWN" | "CONFIRMED_CURRENT" | "CONFIRMED_SUPERSEDED"

CurrentnessAssessment {
  currentnessStatus: CurrentnessStatus
  relatedDocumentIdentifier?: string       // free text, required if SUPERSEDED
  relatedCorpusDocumentId?: string         // optional in-corpus link
  evidenceUrl?: string                     // required if status != UNKNOWN
  evidenceQuote?: string                   // required if status != UNKNOWN
  assessedBy: string
  assessedAt: string (ISO 8601)
  notes?: string
}
```

Key design points:

- **Tri-state, with absence as a fourth (implicit) state.** A document that
  was never assessed for currentness simply has no `currentnessAssessment`
  field at all — this is deliberately distinct from an explicit `UNKNOWN`
  (assessed, evidence inconclusive), even though both behave identically
  downstream (no currentness claim is asserted either way). This prevents the
  system from ever fabricating a status for a document nobody looked at.
- **Evidence gating (Zod `superRefine`).** Any non-`UNKNOWN` status requires
  `evidenceUrl` and `evidenceQuote`. `CONFIRMED_SUPERSEDED` additionally
  requires `relatedDocumentIdentifier`. `UNKNOWN` must carry no dangling
  evidence or relation fields — you cannot claim "confirmed" without
  attached, externally-sourced evidence, and you cannot leave stale evidence
  attached to an inconclusive assessment.
- **Never reads document text.** The module has no code path that inspects
  `SourceDocument` or `GeneratedDocument` content. Evidence is always an
  explicitly supplied field, populated by a human reviewer from an
  authoritative external source (e.g. a publisher's own catalog page) — this
  directly prevents recurrence of the exact false-positive pattern DRA-DOC-0030
  exhibits (its own title contains the string "Revision 5", which must never
  be mistaken for supersession evidence).
- **`checkLineageConsistency()`** is a separate, pure utility over an
  explicit array of `{ corpusDocumentId, assessment }` entries. It is not
  auto-wired into the freeze or eligibility flow (mirroring the existing
  near-duplicate-check precedent, which also takes explicit inputs rather
  than querying the registry itself). It detects self-reference, mutual
  supersession cycles, mutual "both claim current" cycles, and superseded
  claims pointing at a document that itself claims to be non-current.

## 4. Wiring into the pipeline

- **`AcquisitionFreezeRecord`** gained an optional `currentnessAssessment`
  field, populated via the same conditional-spread pattern already used for
  `representationAssessment` (DRA-ENG-017) and `graphicalSemanticAssessment`
  (DRA-ENG-018).
- **Digest exclusion.** `currentnessAssessment` is excluded from
  `freezeRecordDigest` and from the proof receipt's `substantiveDigest`. This
  guarantees **zero digest change** for every pre-existing frozen document —
  verified directly (`dra-eng-020-freeze-digest-regression.test.ts`) by
  computing the digest of a real fixture with and without the field present
  and asserting byte-identical output.
- **Known limitation** (documented, not resolved by this closure): the
  currentness assessment itself is not yet hash-bound into the tamper-evident
  receipt chain. It can be attached or altered without affecting any digest
  DRA currently verifies. This is an intentional trade-off — closing it would
  require either including a new field in the digest (breaking every existing
  frozen document's `freezeRecordDigest`) or a separate cryptographic binding
  mechanism, either of which is out of scope for this closure and is flagged
  as future work.
- **Machine-readable exposure.** `BenchmarkDocumentResult` gained an explicit
  `currentnessAssessment` field, and `requesterMetadata` gained sibling keys
  (`currentnessStatus`, `currentnessRelatedDocumentIdentifier`,
  `currentnessRelatedCorpusDocumentId`, `currentnessEvidenceUrl`,
  `currentnessEvidenceQuote`, `currentnessAssessedBy`, `currentnessAssessedAt`)
  — the same pass-through channel used by DRA-ENG-017/018. No changes were
  made to `pipeline/evaluate-document.ts`, and there is no evaluator or
  pipeline version bump: the evaluator's own Stages 1–7 are entirely
  unmodified and unaware currentness exists.

## 5. Closure experiment

`dra-eng-020-currentness-closure-experiment.test.ts` re-evaluates the exact
DRA-ACQ-027 Phase 2 document pair through the real governed pipeline
(`acquireFreezeAndEvaluate` / `evaluateFrozenBenchmarkDocument`), using a
minimal 2-document registry and real NIST CSRC catalog evidence gathered
during DRA-ACQ-027 Phase 2.

| Document | Assessment supplied | Baseline decision (unchanged) | Baseline issues (unchanged) | currentnessAssessment on result |
|---|---|---|---|---|
| DRA-DOC-0031 (Rev. 4) | `CONFIRMED_SUPERSEDED`, evidence = NIST CSRC "Withdrawn on September 23, 2021 ... Superseded By: SP 800-53 Rev. 5", `relatedCorpusDocumentId: "DRA-DOC-0030"` | HOLD | 5 | ✅ present, `CONFIRMED_SUPERSEDED` |
| DRA-DOC-0030 (Rev. 5, **control**) | `CONFIRMED_CURRENT`, evidence = NIST CSRC catalog listing as active/current | REVIEW | 1 | ✅ present, `CONFIRMED_CURRENT` — **not** misclassified as superseded despite its own title containing "Revision 5" |

Results:

1. **Decisions/issue counts/statement counts unchanged** — both documents
   reproduce their exact DRA-ACQ-027 Phase 2 baselines
   (HOLD/5/24,310 statements; REVIEW/1/25,603 statements). The currentness
   mechanism is purely additive to Stage 1–7 evaluation outcomes.
2. **Explicit, machine-readable signal present** on both
   `BenchmarkDocumentResult` objects, with the correct status, evidence, and
   (for the superseded case) the correct in-corpus relation.
3. **Control case correct**: DRA-DOC-0030's own normalised text was asserted
   to contain the literal string "Revision 5" (`expect(text).toMatch(/Revision 5/)`)
   immediately before constructing its `CurrentnessAssessment` — proving the
   `CONFIRMED_CURRENT` result did not and could not have come from inspecting
   that text.
4. **Determinism**: DRA-DOC-0031 was evaluated twice — once via
   `acquireFreezeAndEvaluate` (admission) and once via
   `evaluateFrozenBenchmarkDocument` (direct re-evaluation of the same freeze
   record) — producing byte-identical decisions, issue counts, statement
   counts, and `currentnessAssessment` objects.
5. **Freeze digest reproducibility**: `verifyAcquisitionFreezeRecordDigest`
   passed for both freeze records with `currentnessAssessment` attached,
   confirming the digest-exclusion design holds for real (not just fixture)
   documents.

## 6. Adversarial / generalisation coverage

Covered in `dra-eng-020-currentness-semantics.test.ts` (16 tests) and the
closure experiment's control case:

- Absence of the field vs. an explicit `UNKNOWN` status are distinguishable
  but behave identically downstream.
- `UNKNOWN` with attached evidence is rejected (schema-level).
- `CONFIRMED_SUPERSEDED` without evidence, or without
  `relatedDocumentIdentifier`, is rejected.
- An older document that is still current (no supersession relation) is
  accepted with no forced relation field.
- No publisher-specific branching exists anywhere in `currentness.ts`
  (genericity check).
- `checkLineageConsistency()` correctly flags self-reference, mutual
  supersession cycles, mutual "both current" cycles, and combined
  cycle-plus-non-current-claim cases, using a synthetic multi-revision chain
  — no real corpus documents required for this coverage.
- The closure experiment's live control case is the strongest adversarial
  test available: a real document whose own title contains the exact
  supersession-adjacent string ("Revision 5") is correctly assessed as
  current, because the mechanism structurally cannot read that text.

## 7. Corpus regression

No pre-existing test changed behaviour. Targeted regression run after all
`DRA-ENG-020` changes:

- `dra-eng-020-currentness-semantics.test.ts` — 16/16 pass
- `dra-eng-020-freeze-digest-regression.test.ts` — 2/2 pass
- `dra-eng-020-currentness-closure-experiment.test.ts` — 1/1 pass
- `dra-acq-027-nist-sp80053r4-admission.test.ts` — pass, baseline unchanged
- `dra-acq-027-supersession-detection-experiment.test.ts` — pass, baseline unchanged
- `dra-eng-019-doc0030-full-evaluation.test.ts` — pass, baseline unchanged
- `governed-acquisition.test.ts`, `freeze-integration.test.ts` — 113/113 pass

`tsc --noEmit` on the full package: clean except two pre-existing, unrelated
type errors in `dra-acq-026-long-range-structural-robustness.test.ts` and
`dra-acq-025-non-redundant-graphics-discovery.ts` (confirmed pre-existing via
`git stash` in an earlier session, unrelated to this closure).

## 8. Scope discipline

As required by the governing spec, this closure:

- Made **no** changes to Stage 3 (authority resolution), `SourceDocument`, or
  any reinterpretation of `publishedAt`.
- Added **no** new or modified issue class.
- Added **no** date-comparison logic anywhere.
- Added **no** publisher-specific (e.g. NIST-specific) strings or branches in
  production code — `currentness.ts`, `freeze.ts`, and `governed-pipeline.ts`
  remain fully generic; only the closure-experiment *test* contains
  NIST-specific evidence text, as an appropriate test fixture.
- Did **not** acquire DRA-DOC-0032 or any new document. Per the governing
  spec, that is intentionally left as a separately recommended future step,
  not started here.

## 9. Recommended next step (not started)

Acquire a document that exercises `checkLineageConsistency()` against a
**real, multi-document, in-corpus** supersession chain (the closure
experiment only exercised the two-document NIST pair and synthetic chains).
A good candidate is a publication family with three or more admitted
revisions in the corpus, which would test the lineage-consistency utility
against genuine acquisition-time judgements rather than constructed fixtures.
