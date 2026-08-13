# DRA-ENG-005 Completion Report — Authority Resolution

| Field | Value |
|---|---|
| Milestone | DRA-ENG-005 |
| Title | Authority Resolution |
| Phase | Phase 3 — Textual Analysis |
| Status | **COMPLETE — PASS** |
| Completed | 2026-07-26 |
| Prior milestone | DRA-ENG-004 — Claim Extraction (910 tests, PASS) |
| Next milestone | DRA-ENG-006 — Evidence Linkage |

---

## 1. Objective

Stage 3 of the DRA evaluator pipeline assigns one **authority record** to each extracted material statement. Authority resolution is fully deterministic, rule-based, and requires no external services, network access, or LLM inference.

---

## 2. Deliverables

### 2.1 Package changes — `lib/dra-reference/` (`@workspace/dra-reference`)

#### Source files created

| File | Purpose |
|---|---|
| `src/authority-resolution/resolution-result.ts` | `Stage3Result`, `Stage3Success`, `Stage3Failure` discriminated union; `STAGE_3_ID`, `STAGE_3_VERSION` |
| `src/authority-resolution/authority-classification.ts` | Closed `AuthorityClassification` (6) and `AuthorityType` (7) unions; `isAuthorityClassification()`, `isAuthorityType()` guards; `AUTHORITY_CLASSIFICATIONS`, `AUTHORITY_TYPES` |
| `src/authority-resolution/authority-record.ts` | `AuthorityRecord`, `AuthoritySpan`, `StatementSpan`, `Stage3ResolutionRecord` interfaces |
| `src/authority-resolution/attribution-patterns.ts` | `detectAttribution()` — 13 resolution rules in priority order; `detectAuthorityType()` |
| `src/authority-resolution/authority-span-validation.ts` | `validateAuthoritySpan()` — 4-invariant check, returns `DraValidationError[]` |
| `src/authority-resolution/record-identifiers.ts` | `makeAuthorityRecordId()`, `parseAuthorityRecordId()`, `STAGE_3_RECORD_ID_PREFIX = "ar3"` |
| `src/authority-resolution/resolve-authority.ts` | `resolveAuthority()` — Stage 3 entry point; `RESOLUTION_RULE_VERSION = "1.0.0"` |
| `src/authority-resolution/index.ts` | Full public surface re-exports |

#### Source files modified

| File | Change |
|---|---|
| `src/model/validation-errors.ts` | Added 8 Stage 3 error codes |
| `src/index.ts` | Re-exports Stage 3 public surface; `DRA_STATUS` updated to DRA-ENG-005 |
| `src/tests/dra.scaffold.test.ts` | Updated `DRA_STATUS.toContain("DRA-ENG-005")` |

#### Test files created

| File | Tests |
|---|---|
| `src/authority-resolution/__tests__/resolve-authority.test.ts` | Integration — all classification paths, span integrity, determinism, invalid input |
| `src/authority-resolution/__tests__/attribution-patterns.test.ts` | Unit — each of the 13 resolution rules, `detectAuthorityType()` |
| `src/authority-resolution/__tests__/authority-span-validation.test.ts` | Unit — 4 span invariants |
| `src/authority-resolution/__tests__/record-identifiers.test.ts` | Unit — ID generation, parsing, round-trip, edge cases |
| `src/authority-resolution/__tests__/stage3-boundary.test.ts` | Boundary — proves no evidence, credibility, materiality, issues, decisions, confidence, proof receipt, CTS |
| `src/authority-resolution/__tests__/stage3-exports.test.ts` | Export surface — all public identifiers present; prohibited names absent |

#### Config updated

| File | Change |
|---|---|
| `vitest.config.ts` | Added `"src/authority-resolution/__tests__/**/*.test.ts"` to `include` |

---

## 3. Design

### 3.1 Entry point signature

```typescript
resolveAuthority(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
): Stage3Result
```

- Accepts any value for both arguments; returns `Stage3Failure` for all invalid input without throwing.
- Fails fast if Stage 2 result is absent or is a failure.
- Produces exactly one `AuthorityRecord` per statement, ordered by `statementIndex`.
- Zero statements → zero records → `Stage3Success`.

### 3.2 Authority classifications (6)

| Classification | Meaning |
|---|---|
| `DOCUMENT_AUTHOR` | Default; no external attribution detected |
| `EXPLICIT_NAMED_SOURCE` | Named person, organisation, publication, regulation, study, dataset |
| `EXPLICIT_UNNAMED_SOURCE` | Vague attribution ("experts say", "officials reported") |
| `STRUCTURALLY_INHERITED_SOURCE` | Attribution carried from immediately preceding line |
| `AMBIGUOUS_SOURCE` | Pronoun (he/she/they/it), unattributed quote, unclear multi-source |
| `NO_IDENTIFIABLE_SOURCE` | Reserved; defined in type but no rule produces it in Version 1 |

### 3.3 Authority types (7)

`PERSON`, `ORGANISATION`, `PUBLICATION`, `REGULATION`, `STUDY`, `DATASET`, `UNNAMED`

Detected heuristically from authority text; `UNNAMED` for vague terms.

### 3.4 Resolution rules (priority order)

| Rule | Pattern |
|---|---|
| AR-SELF-REF | we/I/this document/the author → DOCUMENT_AUTHOR |
| AR-PRONOUN-AMBIG | he/she/they/it at sentence start → AMBIGUOUS_SOURCE |
| AR-SPEAKER-LABEL | "Name: statement text" → EXPLICIT_NAMED_SOURCE |
| AR-UNATTR-QUOTE | Entire statement in quote marks, no attribution → AMBIGUOUS_SOURCE |
| AR-ACCORDING-NAMED | "According to [Named], ..." → EXPLICIT_NAMED_SOURCE |
| AR-ACCORDING-UNNAMED | "According to [vague], ..." → EXPLICIT_UNNAMED_SOURCE |
| AR-SUBJECT-NAMED | "[Named] states/said/confirms ..." → EXPLICIT_NAMED_SOURCE |
| AR-SUBJECT-UNNAMED | "[Vague] say/report ..." → EXPLICIT_UNNAMED_SOURCE |
| AR-POST-NAMED | "..., according to [Named]." → EXPLICIT_NAMED_SOURCE |
| AR-POST-UNNAMED | "..., according to [vague]." → EXPLICIT_UNNAMED_SOURCE |
| AR-ATTR-INLINE | "... — Source" or "(Source: X)" → EXPLICIT_NAMED_SOURCE |
| AR-INHERITED | Preceding-line attribution, no boundary → STRUCTURALLY_INHERITED_SOURCE |
| AR-DOCUMENT-AUTHOR | Default fallback |

### 3.5 Authority span invariant

For any record with a resolved authority span:
```
content.slice(authoritySpan.startOffset, authoritySpan.endOffset) === authorityText
```

Span integrity is validated by `validateAuthoritySpan()`. On failure the span is dropped with a warning (soft failure); the authority text is preserved, and the record is still emitted.

### 3.6 Record identifier format

```
ar3:{statementId}
```

Example: statement `s2:0:47` → authority record `ar3:s2:0:47`.

Properties: deterministic, unique within one evaluation, stable (no wall-clock or random component), traceable (embeds source statementId).

### 3.7 Structural inheritance

Inherited from the **immediately preceding line only**. Cannot propagate across:
- Blank lines (paragraph boundaries)
- Section headings
- Any other structural break

Carries `inheritedContextRef = "preceding-line:{offset}"` in the record.

---

## 4. Stage 3 boundary enforcement

The following operations are explicitly **not performed** in Stage 3:

- Evidence retrieval or mapping
- Source credibility scoring
- Materiality assignment
- Issue detection (any of the 9 DRA issue classes)
- Assurance decisions (`SUPPORTED`, `REVIEW`, `HOLD`)
- Confidence scoring
- Proof receipt generation
- CTS import or invocation
- Network access or LLM inference
- Re-segmentation of the document
- Modification of Stage 2 statement text or spans

All of these are verified by the Stage 3 boundary test suite (`stage3-boundary.test.ts`).

---

## 5. Test results

### Final run

```
Test Files  30 passed (30)
     Tests  1131 passed (1131)
  Duration  2.89s
```

### Breakdown by milestone

| Milestone | Tests at completion |
|---|---|
| DRA-ENG-003 (Input Normalisation) | baseline |
| DRA-ENG-004 (Claim Extraction) | 910 |
| **DRA-ENG-005 (Authority Resolution)** | **1131** (+221) |

### Stage 3 test distribution

| File | Tests |
|---|---|
| `resolve-authority.test.ts` | ~115 |
| `attribution-patterns.test.ts` | ~65 |
| `stage3-boundary.test.ts` | ~53 |
| `stage3-exports.test.ts` | ~45 |
| `authority-span-validation.test.ts` | ~12 |
| `record-identifiers.test.ts` | ~22 |

### Typecheck

```
pnpm exec tsc --noEmit → exit 0 (no errors)
```

---

## 6. Bug fixes during implementation

| ID | Description | Fix |
|---|---|---|
| BF-005-001 | `detectAuthorityType("ISO 27001")` returned `ORGANISATION` — the `\biso\s*\d\b` boundary failed because "ISO 2" has no word boundary mid-number | Changed `iso\s*\d` to `iso\b` in the REGULATION regex |
| BF-005-002 | Stage 2 strips surrounding quote marks from statement text, so `tryUnattributedQuote` cannot detect them at the integration level | Moved unattributed-quote coverage to the attribution-patterns unit test; removed the integration test |
| BF-005-003 | TypeScript strict mode: casting `Stage3Failure` / `AuthorityRecord` to `Record<string, unknown>` requires `as unknown` first | All boundary/no-downstream-semantics test casts changed to `as unknown as Record<string, unknown>` |
| BF-005-004 | Pre-existing Stage 2 test (`extract-claims.test.ts:947`) had the same cast error | Applied the same `as unknown as Record<string, unknown>` fix |

---

## 7. Known limitations (Version 1)

- `NO_IDENTIFIABLE_SOURCE` is defined in the classification set but is unreachable — no rule produces it. Reserved for Version 2.
- Non-English attribution markers are not detected.
- Coreference resolution is not performed; pronoun referents are always `AMBIGUOUS_SOURCE`.
- Attribution inheritance is limited to the immediately preceding line (depth = 1).
- Named-entity disambiguation is not performed; classification is heuristic.

---

## 8. Programme index update

| Milestone | Previous status | New status |
|---|---|---|
| DRA-ENG-005 Authority Resolution | READY — next milestone | **COMPLETE — PASS** |
| DRA-ENG-006 Evidence Linkage | PENDING | **READY — next milestone** |
