# DRA-VAL-002 — Protocol Freeze Receipt

**Verdict: `DRA_VAL_002_PROTOCOL_FROZEN`**
**Freeze timestamp:** 2026-08-12T00:00:00.000Z
**Manifest module:** `lib/dra-reference/src/benchmark/analysis/dra-val-002-freeze-manifest.ts`

## 0. Administrative renumbering

This receipt concerns the programme originally specified as **"DRA-VAL-001 — Targeted
English-HTML Blind Follow-Up"**, renumbered to **DRA-VAL-002** solely to avoid a collision with
the pre-existing, unrelated DRA-VAL-001A..F Scientific Validation Charter programme. No
methodological content changed as a result of the renumbering.

## 1. Bound candidate identity

| Field | Value |
|---|---|
| Bound candidate | `DRA-GC-1` |
| Bound GC-1 aggregate digest | `VAL002_BOUND_GC1_DIGEST` (matches live `computeAggregateDigest()` at freeze time) |

DRA-VAL-002 is bound to the exact same frozen DRA-GC-1 identity used by DRA-GEN-001 and
DRA-GC2-REV-001. Nothing in this freeze act touches GC-1.

## 2. Frozen protocol-defining files and digests

| File | SHA-256 |
|---|---|
| `docs/dra/DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md` | `0f863decbc13c01246a0bfef620431e3c11ca664f2212e3d011800a1d7762ac7` |
| `lib/dra-reference/src/benchmark/analysis/dra-val-002-protocol.ts` | `46e4146e388a1e2aae44a681497e24919cd0951f59cec3a6586b7eeb7b484003` |
| `lib/dra-reference/src/benchmark/analysis/dra-val-002-considered-registry.ts` | `b659e774a5f83035d153fa7a102aa044298c4abb24e1c4b47041b989dc02dc63` |
| `lib/dra-reference/src/benchmark/analysis/__tests__/dra-val-002-freeze-integrity.test.ts` | `e43ae44f33e0be82138ef3f480231307124232088d478c88cdb017da88f06e15` |

These four digests, plus the bound GC-1 digest, plus the frozen sample-size/source-family/
endpoint/failure-taxonomy parameters, plus the considered-candidate registry digest, are combined
(canonical JSON, sorted keys) into `VAL002_PROTOCOL_AGGREGATE_DIGEST` — the single value every
downstream Phase 2 precondition check compares against a fresh, live re-hash.

## 3. Frozen methodological parameters restated for audit

- **Sample size:** 25 (see protocol doc Section 8 for the full Wilson/rule-of-three
  20/25/30/40 comparison).
- **Source families and caps:** `GOV_UK` (34% target), `ONS_GOV_UK` (32% target), `US_FEDERAL`
  (34% target); no family may exceed 40% of the locked sample.
- **Endpoints:** evaluation completion rate, determinism rate, proof-integrity rate,
  representation-materiality-failure rate (primary); decision distribution, issue-class
  distribution, family distribution, post-lock drift (secondary/descriptive).
- **Failure taxonomy:** `ELIGIBILITY_FAILURE`, `SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK`,
  `REPRESENTATION_FAILURE`, `PIPELINE_FAILURE`, `DETERMINISM_FAILURE`, `PROOF_INTEGRITY_FAILURE`,
  `KNOWN_LIMITATION_ENCOUNTERED`, `SUCCESSFUL_EVALUATION`, `UNCLASSIFIED`.
- **Considered-candidate registry:** wraps GEN-001's entire considered registry (including all 100
  GEN-001 locked sample URLs across all four strata) plus ~31 URLs manually screened during
  VAL-002's own discovery phase.

## 4. Ordering guarantee

Per protocol Section 13, this freeze act — and the `PROTOCOL_STATUS = "FROZEN"` value it
certifies — precedes any sample-lock verdict. `dra-val-002-sample-manifest.ts`'s
`computeSampleLockVerdict()` explicitly checks `VAL002_PROTOCOL_STATUS === "FROZEN"` as its first
gating condition (`PROTOCOL_IS_FROZEN`), so no sample can be locked against a draft protocol.

## 5. Verification

`dra-val-002-freeze-integrity.test.ts` (37 tests, all passing at freeze time) independently
re-hashes all four frozen files, recomputes the protocol aggregate digest, recomputes the sample
aggregate digest, and re-derives both the protocol-freeze and sample-lock verdicts, confirming
this receipt's claims mechanically rather than by assertion alone.
