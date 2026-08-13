# DRA-GEN-001 Protocol Freeze Receipt

**Verdict: `DRA_GEN_001_PROTOCOL_FROZEN`**

| Field | Value |
|---|---|
| Protocol ID | `DRA-GEN-001` |
| Protocol version | `1.0.0` |
| Freeze timestamp | `2026-08-12T00:00:00.000Z` |
| Repository commit | `4310a53d4fbae151f75241ffcfef4e43873dcc9f` |
| Bound GC-1 candidate ID | `DRA-GC-1` |
| Bound GC-1 aggregate digest | `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` |
| Protocol aggregate digest | see `GEN001_PROTOCOL_AGGREGATE_DIGEST` in `dra-gen-001-freeze-manifest.ts` (deterministic; recomputed live by the freeze-integrity tests, not restated here as a literal to avoid a second hand-copied value drifting from the source of truth) |
| Considered-candidate registry | 143 URLs, 78 candidate IDs; digest bound into protocol identity |
| Frozen sample size | 100 |
| Frozen hard strata | `PDF_ENGLISH`, `PDF_NON_ENGLISH`, `HTML_ENGLISH`, `HTML_NON_ENGLISH` (25 each) |

## Frozen components

No substantive methodological content was changed. The following files are frozen byte-for-byte
(SHA-256 recorded in `FROZEN_PROTOCOL_FILE_DIGESTS`):

1. `docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md`
2. `lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts`
3. `lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts`
4. `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts`

The freeze act itself is recorded in a new, separate module,
`dra-gen-001-freeze-manifest.ts` — mirroring the DRA-GC-1 pattern, where the freeze wrapper
declares frozen files frozen without editing their contents. `dra-gen-001-protocol.ts` retains its
internal `PROTOCOL_STATUS = "DRAFT"` self-description unmodified; `GEN001_PROTOCOL_STATUS =
"FROZEN"` in the freeze manifest is the authoritative post-freeze status.

## Preserved without modification

n = 100; target population; unit of analysis; eligibility rules; hard stratification and
allocation; endpoints (primary/secondary/exploratory); failure taxonomy; replacement rules;
blindness rules; oracle strategy; stopping rules; statistical reporting rules; publication-claim
discipline; contamination exclusions (development corpus + considered-candidate registry).

## Scope-interpretation statement (Programme Section A2)

The English/non-English hard stratification is a sampling-power choice bound to GC-1's five
already-validated languages (English, Spanish, French, Japanese, Bulgarian). It does not override
or broaden GC-1's declared language/script boundary. Successful observations in the non-English
stratum do not establish generalisation to RTL/bidirectional scripts, Devanagari-type
complex/conjunct scripts, Thai-style scriptio continua, or any other explicitly unvalidated
complex-script behaviour. The frozen GC-1 limitation ledger (DRA-ROB-002 `KNOWN_DEFECT_LEDGER`)
continues to govern claim scope regardless of GEN-001's results. See
`SCOPE_INTERPRETATION_STATEMENT` in `dra-gen-001-freeze-manifest.ts`.

## Canonicalisation procedure (Programme Section A3)

The protocol manifest core (`buildProtocolManifestCore()`) is a plain JSON-compatible object
containing: protocol ID/version, bound GC-1 candidate ID/digest, frozen sample size, frozen
stratum allocation, frozen endpoint IDs, frozen failure-taxonomy IDs, the considered-candidate
registry digest and counts, and the per-file SHA-256 digest map for the 4 frozen protocol files.
This object is canonicalised with `canonicalizeForDigest()` (recursive key-sorted, whitespace-free
JSON string — the same routine `dra-gc-1-freeze-manifest.ts` uses), then hashed with SHA-256 to
produce `GEN001_PROTOCOL_AGGREGATE_DIGEST`. Any change to a frozen file's bytes, the GC-1 binding,
the sample size, the stratum allocation, the endpoint/taxonomy ID lists, or the registry's content
changes this digest when recomputed.

## Freeze verification (Programme Section A4)

- 42 pre-existing Phase 0 integrity tests: **all pass** (`dra-gen-001-freeze-integrity.test.ts`).
- 21 new targeted protocol-freeze integrity tests: **all pass**
  (`dra-gen-001-protocol-freeze-integrity.test.ts`), confirming: protocol identity is deterministic
  (idempotent recomputation); GC-1 digest binding matches a live GC-1 recomputation; all 4
  protocol-defining components are represented with live-matching file digests; the
  considered-candidate registry digest/counts are structurally bound into the manifest core;
  mutating any protocol-defining component (sample size, GC-1 binding, endpoint list, taxonomy
  list, a file digest, or the registry digest) changes the resulting aggregate digest; and no
  blind-sample manifest reference exists at freeze time (explicitly `null`).
- No substantive inconsistency was found.

## Files created

- `lib/dra-reference/src/benchmark/analysis/dra-gen-001-freeze-manifest.ts`
- `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-protocol-freeze-integrity.test.ts`
- `docs/dra/DRA-GEN-001-PROTOCOL-FREEZE-RECEIPT.md` (this document)

No existing GEN-001 Phase 0 file was modified.
