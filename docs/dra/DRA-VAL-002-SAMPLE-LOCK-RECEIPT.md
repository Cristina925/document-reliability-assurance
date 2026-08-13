# DRA-VAL-002 — Sample Lock Receipt

**Verdict: `DRA_VAL_002_SAMPLE_LOCKED`**
**Lock timestamp:** 2026-08-12T00:00:00.000Z
**Sample manifest module:** `lib/dra-reference/src/benchmark/analysis/val-002-phase1/dra-val-002-sample-manifest.ts`
**Bound protocol digest:** `VAL002_BOUND_PROTOCOL_DIGEST` (matches live `VAL002_PROTOCOL_AGGREGATE_DIGEST` at lock time)

## 0. Administrative renumbering

As with every other DRA-VAL-002 deliverable: this programme was originally specified as
"DRA-VAL-001"; renumbered to DRA-VAL-002 purely to resolve an ID collision with the pre-existing
DRA-VAL-001A..F Scientific Validation Charter programme. No methodological content changed.

## 1. Frame construction and selection summary

- **Seed derivation rule:** `DRA-VAL-002:PHASE-1:SAMPLE-SELECTION-SEED:v1` (SHA-256 of this fixed
  literal, recorded before any candidate frame was inspected).
- **Raw frame size:** 31 real, live-verified candidate URLs across 3 source families.
- **Contamination exclusion:** 0 of the 31 candidates overlapped the DRA-VAL-002 considered
  registry (GEN-001's full registry + all 100 GEN-001 sample URLs + VAL-002's own ~31
  session-screened URLs).
- **Metadata eligibility:** 31/31 candidates passed V1–V11 eligibility at the metadata level.
- **Seeded family-quota selection:** mulberry32 PRNG seeded from the rule above, drawing within
  each family's target allocation, with a predetermined per-family reserve order for replacement.

## 2. Frozen unit counts

| Family | Target allocation | Locked units |
|---|---|---|
| `GOV_UK` | 34% | 9 |
| `ONS_GOV_UK` | 32% | 8 |
| `US_FEDERAL` | 34% | 8 |
| **Total** | | **25** |

All three families are within the 40% diversity cap; none is dominant.

## 3. Replacements

**2 replacements used**, both for `SOURCE_ACQUISITION_FAILURE` during Phase 1 freezing (a fetch
that failed the ≥500-word floor or returned a non-2xx status before lock) — never for a
DRA-performance reason, per the frozen replacement policy (Section 11 of the protocol doc):

1. `VAL002-ONS-uklabourmarket-latest` replaced a reserve-exhausted ONS candidate.
2. `VAL002-USFED-census-acs-about` replaced a reserve-exhausted US-federal candidate.

Both replacements were drawn from that family's predetermined seeded reserve order — no fresh
manual pick was made at replacement time.

## 4. Evaluation-input identity: frozen bytes, not live re-fetch

Unlike DRA-GEN-001's Phase 1 (which discarded raw bytes after computing their digest and word
count, requiring a live re-fetch to re-derive matching bytes at Phase 2 time — the exact mechanism
that destroyed GEN-001's entire HTML_ENGLISH stratum when GOV.UK pages changed between freeze and
execution), DRA-VAL-002's acquisition script persists the **actual frozen bytes** for all 25 units
to `val-002-phase1/data/raw/<frameId>.bin` at freeze time. Phase 2 evaluates these persisted bytes
directly and performs **no network access** during evaluation staging — live drift is
observed only afterward, descriptively (see the validation report's live-drift section), and
never gates or substitutes evaluation input.

## 5. Sample-lock verification checks (all passed)

`PROTOCOL_IS_FROZEN`, `TOTAL_SAMPLE_SIZE_IS_25`, `FAMILY_ALLOCATION_WITHIN_CAP`,
`NO_DUPLICATE_FAMILIES`, `ALL_UNITS_MEET_WORD_COUNT_FLOOR`, `ORIGINAL_DRAW_HISTORY_PRESERVED`,
`NO_EVALUATOR_OUTPUT_FIELDS_PRESENT`, `ALL_UNITS_HAVE_SHA256_AND_BYTE_LENGTH`.

## 6. Aggregate sample digest

`VAL002_SAMPLE_AGGREGATE_DIGEST` binds the bound protocol digest, seed, raw/eligible-frame
digests, every unit's `(frameId, familyId, sha256, byteLength)`, and the full replacement log into
one canonical (sorted-key JSON) SHA-256 value, independently recomputed and checked by
`dra-val-002-freeze-integrity.test.ts`.
