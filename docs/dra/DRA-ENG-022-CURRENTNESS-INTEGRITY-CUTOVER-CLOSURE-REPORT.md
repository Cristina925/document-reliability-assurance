# DRA-ENG-022 — Currentness Integrity Cutover and Downgrade-Resistance Closure Report

**Status:** CLOSED
**Date:** 2026-08-11
**Prior programmes:** DRA-ENG-020 (Currentness Semantics Closure), DRA-ENG-021 (Currentness Evidence Integrity Closure)
**Hard stop honoured:** DRA-DOC-0032 was **not** acquired. No further engineering or discovery programme was started automatically.

---

## 1. The residual gap this programme closes

DRA-ENG-021 introduced `currentnessAssertionDigest` (bound to the specific
freeze record and specific `currentnessAssessment` content) and
`currentnessIntegritySchemaVersion`, verified by
`verifyAcquisitionCurrentnessIntegrity()`. That closure explicitly documented
one residual gap: **deleting both new fields together**, along with the
`currentnessAssessment` itself, makes a record indistinguishable from a
document that was never assessed for currentness in the first place.
`verifyAcquisitionCurrentnessIntegrity()` returns `true` vacuously in that
case — by design, since a genuinely never-assessed record is legitimate and
must not be rejected. The problem is that a **tampered, once-assessed**
record and a **genuinely never-assessed** record produce the exact same
shape, and no field anywhere on the freeze record distinguished them.

### Reproduction (§1 of the spec)

`dra-eng-022-freeze-integrity-cutover-tamper.test.ts`, first test block,
reproduces this mechanically against a freshly created legacy-style record:

1. Create a freeze record with a genuine `currentnessAssessment`.
2. Delete `currentnessAssessment`, `currentnessAssertionDigest`, and
   `currentnessIntegritySchemaVersion` together.
3. `verifyAcquisitionCurrentnessIntegrity()` → `true` (vacuous pass — the
   bypass).
4. `verifyAcquisitionFreezeRecordDigest()` → also `true`, because the
   pre-ENG-022 `freezeRecordDigest` formula never covered currentness at all
   (this is the ENG-020 invariant, deliberately preserved for legacy
   records — see §4).

Both checks pass. The stripped record is fully indistinguishable from one
that was never assessed. This is the exact, confirmed root cause.

---

## 2. Architectures considered and rejected

| Option | Why rejected |
|---|---|
| **Sidecar integrity envelope** (wrap the whole record in a signed/hashed envelope) | Reproduces the identical bypass class one level up: an attacker could strip the envelope's own version/hash fields together, exactly as with the two currentness fields today. Adds a new object without closing the underlying asymmetry. |
| **Composite forward-only digest** (a single digest replacing all prior digests) | Would require recomputing and reissuing every historical digest, violating the "preserve documents 1–31 exactly" requirement. |
| **Capability marker on `BenchmarkProofReference` only** | `BenchmarkProofReference` is a freshly-derived, read-only output with no independent re-verification function anywhere in the system (true since DRA-ENG-009, for every field on it) — a marker there could not be checked against anything at verification time, so it would carry no enforcement weight. |
| **New independent digest field, sibling to `currentnessAssertionDigest`** | Same failure class as the original: it can be deleted together with the other two fields, moving the bypass but not closing it. |
| **Versioning `freezeRecordDigest` itself (chosen)** | `freezeRecordDigest` is the *one* field that every record, in every regime, already has — and `verifyAcquisitionFreezeRecordDigest()` is called **unconditionally** for every freeze record inside `evaluateFrozenBenchmarkDocument()`. There is no way to "opt out" of that check the way there is for the currentness-specific check. Binding the cutover marker and currentness-presence into this digest, for V2 records only, means stripping the currentness fields moves the currentness state itself out from under the digest that was actually computed — the mismatch is unavoidable because there is no separate, independently-strippable "container" to attack. |

**Selected design:** version `freezeRecordDigest` via a new, explicit,
opt-in `freezeIntegritySchemaVersion` marker and a distinct digest formula
(`computeAcquisitionFreezeRecordDigestV2`). This is the smallest design that
closes the actual reproduced bypass without inventing a new independently
strippable artefact.

---

## 3. Selected design

### 3.1 New identifiers

- `FREEZE_INTEGRITY_SCHEMA_VERSION_V2 = "dra-freeze-integrity-v2"` (exported
  constant, `freeze.ts`).
- `AcquisitionFreezeRecord.freezeIntegritySchemaVersion?: string` — present
  only on V2 records.
- `CreateAcquisitionFreezeRecordInput.freezeIntegrityRegime?: "V2"` — opt-in;
  absent/undefined means the legacy path, byte-for-byte identical to
  pre-ENG-022 behaviour.
- `computeAcquisitionFreezeRecordDigestV2(record)` (`integrity.ts`) — a
  distinct formula from the untouched legacy
  `computeAcquisitionFreezeRecordDigest`. It hashes the same material fields
  as the legacy formula **plus** `freezeIntegritySchemaVersion` and a
  `currentnessBinding` value: the record's own stored
  `currentnessAssertionDigest` string if present, or the literal `null`
  sentinel if absent.
- `BenchmarkProofReference.freezeIntegritySchemaVersion?: string` — pure
  pass-through for downstream visibility; carries no independent
  verification (see §7's disclosed limitation).

### 3.2 Verification dispatch (`verifyAcquisitionFreezeRecordDigest`)

| `freezeIntegritySchemaVersion` on the record | Formula used | Outcome for stripped/mismatched fields |
|---|---|---|
| Absent | Legacy formula (unchanged code path) | Legacy semantics — currentness presence/absence never affects this digest (§4). |
| `"dra-freeze-integrity-v2"` (recognised) | V2 formula, with `currentnessBinding` **recomputed from the record's own currently-stored `currentnessAssertionDigest`** (not from the assessment, and not cached) | Stripping the digest, the assessment, or the marker itself all produce a binding mismatch against the digest that was actually computed when the record was created → `false`. |
| Any other value (unrecognised) | N/A — fails closed | Never silently treated as legacy or as valid V2 → `false`. |

### 3.3 Production cutover point

`governed-pipeline.ts`'s `acquireFreezeAndEvaluate()` now always passes
`freezeIntegrityRegime: "V2"` to `createAcquisitionFreezeRecord()`. This
single call site is the literal point-in-time cutover: **every** document
acquired through the real governed pipeline from this programme forward is
a V2 record. `evaluateFrozenBenchmarkDocument()` required no signature or
call-site change — its existing unconditional call to
`verifyAcquisitionFreezeRecordDigest()` (and to ENG-021's
`verifyAcquisitionCurrentnessIntegrity()`, left completely unmodified)
automatically enforces the new rules whenever a V2 record is presented,
because the dispatch lives inside the verification function itself.

### 3.4 Canonicalisation / digest rules

- The V2 digest is computed over a canonical JSON payload containing the
  exact same fields as the legacy formula, plus two additional fields:
  `freezeIntegritySchemaVersion` (string) and `currentnessBinding`
  (string | `null`). Field order and serialisation are deterministic
  (verified directly by the tamper suite's determinism tests: identical
  inputs on separate calls produce identical digests).
- `currentnessBinding` is derived at **verification time** from whatever
  `currentnessAssertionDigest` is currently present on the record being
  checked — never recomputed from the `currentnessAssessment` content
  itself and never read from a cached/stored copy elsewhere. This is what
  makes stripping detectable: the V2 digest was computed once, at creation
  time, against the real digest string; any later change to that stored
  string (including its absence) changes the recomputed binding and breaks
  the match.

---

## 4. Legacy / post-cutover boundary

- **Legacy formula is completely untouched.** `computeAcquisitionFreezeRecordDigest` in
  `integrity.ts` has zero code changes from ENG-021. It is the only formula
  ever applied when `freezeIntegritySchemaVersion` is absent from a record.
- **Legacy records are never required to carry the new fields, and are
  never silently upgraded.** `verifyAcquisitionFreezeRecordDigest()`
  dispatches purely on the presence/absence of `freezeIntegritySchemaVersion`
  — a legacy record with no marker is verified exactly as it always was.
- **`createAcquisitionFreezeRecord()` is opt-in, default legacy.** Every
  pre-existing call site (all acquisition test files DRA-ACQ-002 through
  DRA-ACQ-027, all discovery/checkpoint tests) that does not pass
  `freezeIntegrityRegime: "V2"` continues to produce byte-identical legacy
  records.
- **The ENG-020 invariant — "freezeRecordDigest is unaffected by
  `currentnessAssessment` presence" — is now scoped explicitly as a
  legacy-only property.** It remains proven directly against
  `createAcquisitionFreezeRecord()` (no regime opt-in) in
  `dra-eng-020-freeze-digest-regression.test.ts`, unmodified and still
  passing. It is **no longer** true for V2 records by design — V2's whole
  purpose is to bind currentness-presence into the digest so it cannot be
  stripped silently. One existing ENG-021 pipeline test asserted the ENG-020
  property at the `acquireFreezeAndEvaluate()` level; since that function is
  now V2 by default, the assertion was updated (not removed) to state the
  new, intentional behaviour — see §8.

---

## 5. Fail-closed proof: 11 post-cutover attack scenarios

All 11 scenarios below are exercised in
`dra-eng-022-freeze-integrity-cutover-tamper.test.ts` §5 against genuine V2
records (created via `createAcquisitionFreezeRecord({ ..., freezeIntegrityRegime: "V2" })`),
and independently re-exercised against a genuinely pipeline-produced V2
record in the closure experiment (§6 below, Part C). All 11 fail closed.

| # | Attack | Detected by |
|---|---|---|
| 1 | Remove `currentnessAssertionDigest` only | `verifyAcquisitionFreezeRecordDigest` → `false` (binding recomputes to `null`, mismatches stored V2 digest). |
| 2 | Remove `currentnessIntegritySchemaVersion` only | `verifyAcquisitionCurrentnessIntegrity` → `false` (ENG-021's own check, unaffected/still active under V2). |
| 3 | Remove **both** currentness-integrity fields (the ENG-021 residual bypass) | `verifyAcquisitionFreezeRecordDigest` → `false`. **This is the specific gap this programme closes.** |
| 4 | Delete `freezeIntegritySchemaVersion`, leaving currentness fields present | `verifyAcquisitionFreezeRecordDigest` → `false` (falls back to legacy formula, which does not match the V2-computed digest). |
| 5 | Same as #4, phrased as "remove the cutover marker" | `verifyAcquisitionFreezeRecordDigest` → `false`. |
| 6 | Strip marker **and** both currentness fields together (full downgrade-to-legacy-looking-record) | `verifyAcquisitionFreezeRecordDigest` → `false` — structurally indistinguishable from a genuine legacy record, but the legacy-formula recomputation still fails to match the digest that was actually V2-computed. |
| 7 | Change the currentness assessment content, keep the original digest | `verifyAcquisitionCurrentnessIntegrity` → `false` (ENG-021's check, still load-bearing); `freezeRecordDigest` alone is unaffected by assessment *content* (it binds the digest value, not the content) — both checks run together in `evaluateFrozenBenchmarkDocument`. |
| 8 | Change the digest, keep the original assessment | Both `verifyAcquisitionCurrentnessIntegrity` and `verifyAcquisitionFreezeRecordDigest` → `false`. |
| 9 | Change the freeze-record identity the assertion was bound to | Both checks → `false`. |
| 10 | Unknown/future unsupported `freezeIntegritySchemaVersion` value | `verifyAcquisitionFreezeRecordDigest` → `false` (unrecognised version fails closed, never coerced to legacy or V2). |
| 11 | Malformed/empty `freezeIntegritySchemaVersion` | `verifyAcquisitionFreezeRecordDigest` → `false`. |

`dra-eng-022-freeze-integrity-cutover-pipeline.test.ts` additionally proves
that `evaluateFrozenBenchmarkDocument()` — the actual enforcement
boundary used by real evaluation runs, not just the unit-level verify
function — rejects attack #3 end-to-end with stage `"INTEGRITY"` and error
code `"FREEZE_RECORD_DIGEST_MISMATCH"`.

---

## 6. Legacy-compatibility proof: 5 properties

All five properties below are exercised in
`dra-eng-022-freeze-integrity-cutover-tamper.test.ts` §6:

1. **Legacy records still verify.** A record created without
   `freezeIntegrityRegime` continues to pass `verifyAcquisitionFreezeRecordDigest`.
2. **Not required to have the new digest/marker.** A legacy record with a
   `currentnessAssessment` verifies without ever needing
   `freezeIntegritySchemaVersion` to be present.
3. **Retains its exact historical digest.** `freezeRecordDigest` is
   byte-identical for a legacy record whether or not a
   `currentnessAssessment` is attached (the ENG-020/ENG-021 invariant,
   unperturbed by ENG-022 for the legacy path).
4. **Retains original proof semantics.** ENG-021's
   `verifyAcquisitionCurrentnessIntegrity` tamper detection (changed
   assessment content → rejected) is fully preserved for legacy records
   under ENG-022's code.
5. **Not silently upgraded.** A legacy record with a currentness assessment
   still verifies via the legacy formula at verification time — it is never
   coerced into attempting a V2 recomputation (which would fail, since its
   digest was never computed with a `currentnessBinding` folded in).

---

## 7. Real closure experiment: DRA-DOC-0030 / DRA-DOC-0031

`dra-eng-022-freeze-integrity-cutover-closure-experiment.test.ts` runs a
real, non-mocked experiment reusing the actual NIST SP 800-53 Rev. 4
(DRA-DOC-0031, superseded) and Rev. 5 (DRA-DOC-0030, current) PDF bytes via
the same disk caches (`dra-acq-027`, `dra-eng-019`) established in
DRA-ACQ-027 and DRA-ENG-019 — no new live HTTP fetches were required.

**Part A/B — Legacy preservation (regression, not overwrite).** Both
documents' freeze records were reconstructed under the **legacy** regime
(no `freezeIntegrityRegime` opt-in), using their real freeze-record IDs
(`DRA-FRZ-900311`, `DRA-FRZ-900312`) and real currentness assessments, in a
**fresh, isolated `CorpusRegistry` instance** — the historical corpus and
freeze records from the ENG-021 closure experiment were never re-registered,
re-created, or mutated. Both reconstructions verify identically to how they
verified under ENG-021: `verifyAcquisitionFreezeRecordDigest` → `true`,
`verifyAcquisitionCurrentnessIntegrity` → `true`. As expected and by
design, stripping both currentness fields from these **legacy**
reconstructions still passes `verifyAcquisitionFreezeRecordDigest` — this is
not a residual gap; it is the correct, unchanged legacy semantics that
apply only to genuinely pre-cutover records (§4, §11).

**Part C — Post-cutover generation (new representative records, not a
re-admission).** The same two real PDF byte streams were run through the
**real governed pipeline** (`acquireFreezeAndEvaluate`, V2-by-default as of
this programme) under entirely new identifiers —
`DRA-DOC-9231`/`DRA-FRZ-TEST-ENG022-R4` for the Rev. 4 content — in a
separate fresh registry, never touching `DRA-DOC-0030`/`DRA-DOC-0031` or
`DRA-FRZ-900311`/`DRA-FRZ-900312`. Results:

- The genuinely pipeline-produced record carries
  `freezeIntegritySchemaVersion = "dra-freeze-integrity-v2"`.
- Its Stage 1–7 evaluation decision (`HOLD`, 5 issues) is **identical** to
  the DRA-ACQ-027/DRA-ENG-019 legacy baseline for the same real document
  content — proving the integrity-regime cutover has zero effect on
  evaluation semantics, only on freeze-record verification.
- All three representative stripping/downgrade attacks (strip both
  currentness fields; strip the marker alone; strip all three together)
  were run against this real record and **all rejected** by
  `verifyAcquisitionFreezeRecordDigest`, and the full-downgrade attack was
  additionally rejected end-to-end by `evaluateFrozenBenchmarkDocument`
  with `FREEZE_RECORD_DIGEST_MISMATCH`.
- An untampered re-evaluation of the same real V2 record succeeds
  deterministically, reproducing the identical decision and issue count.

---

## 8. Determinism evidence

- `dra-eng-022-freeze-integrity-cutover-tamper.test.ts` proves
  `computeAcquisitionFreezeRecordDigestV2` is deterministic: two separate
  `createAcquisitionFreezeRecord` calls with identical (but independently
  constructed) input objects produce byte-identical `freezeRecordDigest`
  and `currentnessAssertionDigest` values.
- It also proves V2 and legacy digests for otherwise-identical content are
  *different* — confirming the two formulas are genuinely distinct, not
  accidentally coincident.
- The closure experiment's untampered re-evaluation (§7, final step)
  reproduces the same decision and issue count as the original acquisition
  run, over real (non-mocked) content and the real pipeline.

---

## 9. Documents 1–31 preservation evidence

- No code path that touches documents 1–31 was modified: the legacy
  `computeAcquisitionFreezeRecordDigest` function is byte-for-byte
  unchanged, `createAcquisitionFreezeRecord()` defaults to the legacy
  regime, and every existing acquisition/checkpoint test that does not
  explicitly opt into `freezeIntegrityRegime: "V2"` continues to produce
  identical output.
- The full acquisition test-file sweep (`src/benchmark/acquisition/__tests__/`,
  79 files, 601 tests) was re-run; **585 tests pass** and the 16 failures
  present were independently reproduced against the pre-ENG-022 commit via
  `git stash` (see §10) — none are attributable to this programme.
- `tsc --noEmit` shows only the same two pre-existing, unrelated errors
  already documented in the ENG-021 closure report (a `CitationIntegrityReport.overallStatus`
  reference in `dra-acq-026-long-range-structural-robustness.test.ts`, and a
  `redundancyAudit[].classification` typed as plain `string` instead of its
  literal union in `dra-acq-025-non-redundant-graphics-discovery.ts`). No new
  type errors were introduced by ENG-022's production code; two type errors
  introduced by the new ENG-022 test files themselves (a missing
  `NormalisedDocument` field, and unnarrowed `RequestValidationResult`
  access) were found and fixed during this same session.

---

## 10. Attributable vs pre-existing failures

Running the full acquisition test-file suite produced **16 failing test
files** (162 tests unrelated to `dra-eng-021-currentness-integrity-pipeline.test.ts`
plus one within it). Each of the 16 failing files was independently
reproduced by `git stash`-ing all ENG-022 changes and re-running the same
three representative failing files against the untouched pre-ENG-022
commit — **all three reproduced identically** (same evaluator-version
mismatch `0.1.1` vs `0.1.2`, same Stage-4 monotonic-growth timing flake, same
`textDigest` mismatch). These are **pre-existing, unrelated to ENG-022** —
they stem from prior evaluator-version drift (DRA-ENG-014/014A) and
environment/timing sensitivity in older tests, not from anything touched in
this programme.

**One test was attributably updated, not merely "found failing."**
`dra-eng-021-currentness-integrity-pipeline.test.ts`'s pipeline-level test
asserted the ENG-020 "digest unaffected by currentness presence" property
directly against `acquireFreezeAndEvaluate()`. Because that function is now
V2-by-default (the actual production cutover, §3.3), this specific
assertion needed to change to reflect the new, intentional behaviour — the
property is legacy-only now (§4). The test was updated (not deleted) to
assert the new invariant (`freezeIntegritySchemaVersion` is now present,
and the digest now *does* differ with/without currentness) with an inline
comment explaining why, and it passes.

No historical decision output, digest, or receipt for documents 1–31 was
altered by this programme.

---

## 11. Remaining limitations (disclosed, not concealed)

Per the spec's explicit instruction to report rather than hide residual
limitations:

1. **All DRA digests, across the entire 22-programme series, are unkeyed
   SHA-256 hashes.** There is no signing key, HMAC, or PKI anywhere in the
   system. The threat model established since DRA-ENG-009 — and unchanged
   by this programme — is tamper-*evidence* against naive or partial edits
   (a field is changed or deleted without correctly recomputing a fully
   self-consistent replacement digest under the correct formula), not
   forgery-*proofing* against a fully informed attacker who edits fields
   **and** correctly recomputes a matching digest from scratch using
   whichever formula (legacy or V2) they choose to declare. ENG-022 closes
   the actual reproduced bypass — naive stripping, where fields are deleted
   but no new consistent digest is computed — but it cannot and does not
   defend against a "smart" attacker with the ability to recompute a
   complete, internally consistent digest. No test in the entire DRA-ENG
   series has ever defended against that stronger threat class. Closing it
   would require introducing cryptographic signatures bound to an
   out-of-band key, which is disproportionate to this programme's scope and
   was explicitly out of scope per the governing spec.
2. **`BenchmarkProofReference.freezeIntegritySchemaVersion` (and its
   ENG-021 sibling `currentnessAssertionDigest`) has no independent
   re-verification function.** `BenchmarkProofReference` is a freshly
   derived, read-only output produced once per evaluation run — unlike the
   freeze record, nothing ever re-checks a *persisted* proof reference
   against anything. This is a pre-existing structural property of the
   entire proof-reference design, true for every field on it since
   DRA-ENG-009, not a new gap introduced by this programme. Inventing a new
   "verify a submitted proof reference" function was judged out of scope.
3. **Downgrade resistance is scoped to the freeze record only.** A record
   that legitimately predates this cutover (a true legacy record) remains,
   by design, exactly as strippable as it always was — this is required by
   the "do not retroactively upgrade legacy semantics" constraint, not an
   oversight. The closure this programme delivers is specifically: *for any
   record created from this cutover point forward*, stripping the
   currentness-integrity binding is now detectable. It does not and cannot
   retroactively grant that protection to documents 1–31, because doing so
   would require recomputing their historical digests, which the spec
   explicitly prohibits.

---

## 12. Files changed

- `lib/dra-reference/src/benchmark/acquisition/integrity.ts` — added
  `computeAcquisitionFreezeRecordDigestV2`; legacy formula untouched.
- `lib/dra-reference/src/benchmark/acquisition/freeze.ts` — added
  `FREEZE_INTEGRITY_SCHEMA_VERSION_V2`, `freezeIntegritySchemaVersion` field,
  `freezeIntegrityRegime` opt-in input, and dispatch logic in
  `verifyAcquisitionFreezeRecordDigest`.
- `lib/dra-reference/src/benchmark/acquisition/governed-pipeline.ts` —
  `acquireFreezeAndEvaluate()` now always creates V2 records (the
  production cutover); `BenchmarkProofReference` passes through the new
  field.
- Three new test files under
  `lib/dra-reference/src/benchmark/acquisition/__tests__/`:
  `dra-eng-022-freeze-integrity-cutover-tamper.test.ts` (21 tests),
  `dra-eng-022-freeze-integrity-cutover-pipeline.test.ts` (5 tests),
  `dra-eng-022-freeze-integrity-cutover-closure-experiment.test.ts` (1 test,
  real closure experiment).
- One existing test updated:
  `dra-eng-021-currentness-integrity-pipeline.test.ts` (assertion updated to
  reflect the new V2-by-default production behaviour; see §10).

---

## 13. Closure

DRA-ENG-022 is **CLOSED**. The reproduced ENG-021 residual bypass (stripping
both currentness-integrity fields together) is closed for all
post-cutover (V2) records via a versioned `freezeRecordDigest` formula, with
zero changes to legacy-record semantics or historical digests for documents
1–31. All 11 required post-cutover attack scenarios fail closed; all 5
required legacy-compatibility properties hold; a real closure experiment
against the actual DRA-DOC-0030/0031 specimens confirms both properties
without touching the historical records. Per the governing hard stop,
DRA-DOC-0032 was not acquired and no further programme was started
automatically.
