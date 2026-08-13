# DRA-ENG-004R — Claim Extraction Completion Report

**Milestone identifier:** DRA-ENG-004  
**Report identifier:** DRA-ENG-004R  
**Stage:** Stage 2 — Claim Extraction  
**Milestone status:** **COMPLETE — PASS**  
**Report date:** 2026-07-26  
**Programme:** DRA-001 — Document Release Assurance, Version 1

---

## 1. Milestone Objective

Implement Stage 2 of the DRA evaluator pipeline: deterministic claim extraction.

The milestone required:
- A new package module at `lib/dra-reference/src/claim-extraction/`.
- Entry point `extractClaims(normalisedRequest: NormalisedEvaluationRequest): Stage2Result`.
- Rule-based, deterministic segmentation with no AI, NLP, or network calls.
- Exact span references satisfying `content.slice(start, end) === text`.
- Deterministic statement identifiers (`s2:{startOffset}:{endOffset}`).
- 25 documented fixture scenarios.
- Comprehensive test suite.
- Documentation and updated programme index.

---

## 2. Deliverables

### 2.1 New Module Files

| File | Purpose |
|---|---|
| `src/claim-extraction/extract-claims.ts` | Main entry point: `extractClaims()` |
| `src/claim-extraction/extraction-result.ts` | `Stage2Result`, `Stage2Success`, `Stage2Failure` types |
| `src/claim-extraction/extraction-record.ts` | `ExtractionRecord`, `RejectionRecord` types |
| `src/claim-extraction/segment-content.ts` | Deterministic content segmenter |
| `src/claim-extraction/classify-segments.ts` | Segment classification |
| `src/claim-extraction/statement-identifiers.ts` | Deterministic ID generation |
| `src/claim-extraction/span-integrity.ts` | Span integrity invariant validation |
| `src/claim-extraction/index.ts` | Public surface exports |
| `src/claim-extraction/README.md` | Implementation documentation |

### 2.2 New Test Files

| File | Test Count (approx.) |
|---|---|
| `__tests__/extract-claims.test.ts` | ~110 tests |
| `__tests__/segment-content.test.ts` | ~35 tests |
| `__tests__/classify-segments.test.ts` | ~30 tests |
| `__tests__/span-integrity.test.ts` | ~15 tests |
| `__tests__/statement-identifiers.test.ts` | ~15 tests |
| `__tests__/stage2-boundary.test.ts` | ~25 tests |
| `__tests__/stage2-exports.test.ts` | ~20 tests |

### 2.3 New Fixture Files

| File | Fixtures |
|---|---|
| `src/fixtures/claim-extraction/valid.ts` | Fixtures 1–13, 16, 17, 19, 20, 24, 25 |
| `src/fixtures/claim-extraction/edge-cases.ts` | Fixtures 14, 15, 18, 21, 22, 23 (+ additional edge cases) |

### 2.4 Updated Files

| File | Change |
|---|---|
| `src/model/validation-errors.ts` | Added `DRA_INVALID_SPAN`, `DRA_SPAN_INTEGRITY_VIOLATION`, `DRA_STATEMENT_ID_COLLISION` |
| `lib/dra-reference/vitest.config.ts` | Added `src/claim-extraction/__tests__/**/*.test.ts` pattern |
| `lib/dra-reference/src/index.ts` | Re-exports full Stage 2 public surface; updated `DRA_STATUS` |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | DRA-ENG-004 COMPLETE, DRA-ENG-005 READY |
| `src/tests/dra.scaffold.test.ts` | Updated status assertion to DRA-ENG-004 |

### 2.5 Completion Report (this document)

`docs/dra/DRA-ENG-004R-CLAIM-EXTRACTION-REPORT.md`

---

## 3. Test Results

| Metric | Value |
|---|---|
| Total tests | **910** |
| Tests passing | **910** |
| Tests failing | **0** |
| Test files | **24** |
| Pre-existing frozen baselines preserved | DRA 679 → 679, research-workspace 2030 → 2030 |

All 910 tests pass. No pre-existing baselines were broken.

---

## 4. Design Decisions

### 4.1 Entry Point Signature

`extractClaims(normalisedRequest: NormalisedEvaluationRequest): Stage2Result`

Accepts the canonical `NormalisedEvaluationRequest` directly (the `.normalisedRequest`
field from `Stage1Success`), not the `Stage1Success` wrapper. This keeps the Stage 2
interface clean and independent of the Stage 1 result type. Never throws.

### 4.2 Statement Identifier Format

`s2:{startOffset}:{endOffset}`

Properties:
- Deterministic: same content position → same ID.
- Unique within one evaluation: non-overlapping segmentation + duplicate-span exclusion.
- Stable: no wall-clock time, no random UUID.
- Human-readable: encodes the document location.
- Parseable: `parseStatementId()` round-trips correctly.

Documented limitation: IDs are unique within one evaluation but not globally across evaluations. Different evaluations processing content at the same character positions will produce the same IDs.

### 4.3 Span Convention

Zero-based, start-inclusive, end-exclusive (Python-slice convention):

```
content.slice(startOffset, endOffset) === statement.text
```

This invariant is enforced by `validateAllSpans()` before the result is returned. A span integrity failure causes `Stage2Failure` — never silently ignored.

Character offsets are UTF-16 code units (JavaScript `string.length` semantics).

### 4.4 Segmentation Approach

Line-then-sentence, two-pass:

1. **Line pass:** Each line is classified by its leading pattern (heading, bullet, numbered item, horizontal rule, or plain).
2. **Sentence pass:** Plain text lines are sentence-split using deterministic rules (abbreviation set, decimal detection, lowercase-continuation guard).

`!` and `?` are always sentence boundaries. `.` is a sentence boundary when followed by whitespace + uppercase or end-of-string, subject to four non-boundary conditions (decimal digits, lowercase next character, known abbreviation, single-character initial).

### 4.5 Materiality Assignment

Materiality is not assessed at Stage 2. `MaterialStatement.materiality` is left as `undefined` for all extracted statements. Materiality classification is deferred to Stages 3–5.

### 4.6 Inclusion Decisions (Conservative)

Questions, commands, quotations, disclaimers, and bullet/numbered items are all included as candidate claims. This is intentionally conservative: over-extraction is preferable to under-extraction at Stage 2. Stages 3–7 will filter by evidence support, authority, consistency, and confidence.

### 4.7 Zero-Claims Result

Zero extracted statements is a valid `Stage2Success`. It is not a failure, a SUPPORTED decision, a REVIEW flag, or a HOLD flag. The result carries an empty `statements` array. This covers cases such as documents consisting entirely of headings.

### 4.8 New Error Codes

Three new codes added to `DRA_ERROR_CODES` in `model/validation-errors.ts`:

| Code | Description |
|---|---|
| `DRA_INVALID_SPAN` | A span reference is structurally invalid (negative, inverted, out-of-bounds) |
| `DRA_SPAN_INTEGRITY_VIOLATION` | `content.slice(start, end)` does not equal `statement.text` |
| `DRA_STATEMENT_ID_COLLISION` | Two statements produced the same identifier (defensive guard) |

---

## 5. Implementation Limitations (Version 1)

All limitations are documented in `src/claim-extraction/README.md`. Summary:

1. **Non-English text:** Segmented by English rules; accuracy varies.
2. **Multi-line soft-wrapped sentences:** Split at line boundary, not at the semantic sentence end.
3. **Table content:** Each row treated as plain text; column structure not parsed.
4. **Multi-line bullet continuation:** Continuation lines become separate segments.
5. **Materiality assignment:** Deferred to later stages.
6. **Evidence linkage:** `linkedEvidenceUnitIds` is always empty at Stage 2.
7. **MIN_CANDIDATE_CHARS = 3:** Very short fragments excluded; may exclude valid assertions of three characters or fewer.
8. **Questions included:** Conservative choice; may produce non-propositional candidates.

---

## 6. Stage 2 Boundary Verification

Stage 2 has been verified to not:

- Inspect source evidence for support (no evidence-to-statement mapping)
- Produce `DraIssue` instances (errors are `DraValidationError`)
- Assign assurance decisions (`SUPPORTED`, `REVIEW`, `HOLD`)
- Assign confidence indicators
- Generate proof receipts
- Execute later pipeline stages
- Import from `@workspace/cts-reference` or any CTS module

These properties are enforced by the boundary test suite (`stage2-boundary.test.ts`).

---

## 7. Pre-existing Milestone Baselines

| Package | Before | After | Status |
|---|---|---|---|
| `@workspace/dra-reference` | 679 tests | 910 tests | +231 tests, all PASS |
| `@workspace/research-workspace` | 2030 tests | 2030 tests | Unchanged — PASS |

The mockup-sandbox `pnpm run build` failure is a pre-existing PORT env-var issue unrelated to DRA-ENG-004. It is carried forward.

---

## 8. Fixtures Coverage

| # | Fixture | Type | Result |
|---|---|---|---|
| 1 | Simple declarative claim | Valid | ✓ |
| 2 | Multiple claims in one paragraph | Valid | ✓ |
| 3 | Multiple paragraphs | Valid | ✓ |
| 4 | Bullet-list claims | Valid | ✓ |
| 5 | Numbered-list claims | Valid | ✓ |
| 6 | Headings followed by claims | Valid | ✓ |
| 7 | Repeated identical text at different positions | Valid | ✓ |
| 8 | Decimal numbers | Valid | ✓ |
| 9 | Abbreviations | Valid | ✓ |
| 10 | Dates | Valid | ✓ |
| 11 | Quoted claims | Valid | ✓ |
| 12 | Questions | Valid | ✓ |
| 13 | Commands/imperatives | Valid | ✓ |
| 14 | Punctuation-only content | Edge | ✓ (0 candidates, success) |
| 15 | Whitespace-only content | Edge | ✓ (0 candidates, success) |
| 16 | Already-normalised (LF only) | Valid | ✓ |
| 17 | Mixed punctuation | Valid | ✓ |
| 18 | No duplicate spans | Edge | ✓ (3 distinct candidates) |
| 19 | Long synthetic document | Valid | ✓ (≥ 30 candidates) |
| 20 | Zero candidate statements | Valid | ✓ (0 candidates, success) |
| 21 | Statement ID uniqueness | Edge | ✓ (distinct IDs for same text) |
| 22 | Invalid input (5 variants) | Invalid | ✓ (Stage2Failure for all) |
| 23 | Exact span integrity | Edge | ✓ (exact offsets verified) |
| 24 | Unicode text | Valid | ✓ |
| 25 | Non-English text | Valid | ✓ (≥ 3 candidates, deterministic) |

---

## 9. Next Milestone

**DRA-ENG-005 — Authority Resolution (Stage 3)** — READY.

Must not be started until this report (DRA-ENG-004R) is accepted.

---

*Report produced at close of DRA-ENG-004 — Claim Extraction.*  
*Programme: DRA-001 — Document Release Assurance, Version 1.*
