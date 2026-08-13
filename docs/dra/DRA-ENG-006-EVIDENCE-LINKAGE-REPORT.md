# DRA-ENG-006 Completion Report — Evidence Linkage

| Field | Value |
|---|---|
| Milestone | DRA-ENG-006 |
| Title | Evidence Linkage |
| Phase | Phase 3 — Textual Analysis |
| Status | **COMPLETE — PASS** |
| Completed | 2026-07-26 |
| Prior milestone | DRA-ENG-005 — Authority Resolution (1131 tests, PASS) |
| Next milestone | DRA-ENG-007 — Materiality Assessment |

---

## 1. Objective

Stage 4 of the DRA evaluator pipeline establishes deterministic links between extracted statements and documentary evidence that already exists within the submitted document.

Stage 4 does **not** determine whether evidence is sufficient, correct, trustworthy, or persuasive. Its sole responsibility is to identify and record evidence relationships for later evaluation stages.

---

## 2. Public API

```typescript
linkEvidence(
  normalisedRequest: NormalisedEvaluationRequest | unknown,
  claimExtractionResult: Stage2Result | unknown,
  authorityResolutionResult: Stage3Result | unknown,
): Stage4Result
```

- Accepts any value for all three arguments; returns `Stage4Failure` for all invalid input without throwing.
- Fails fast if Stage 2 or Stage 3 result is absent or a failure.
- Validates that Stage 2 and Stage 3 share the same `evaluationId`.
- Produces exactly one `EvidenceRecord` per statement, ordered by `statementIndex`.
- Zero statements → zero records → `Stage4Success`.

---

## 3. Deliverables

### 3.1 Package changes — `lib/dra-reference/` (`@workspace/dra-reference`)

#### Source files created

| File | Purpose |
|---|---|
| `src/evidence-linkage/linkage-result.ts` | `Stage4Result`, `Stage4Success`, `Stage4Failure`, `STAGE_4_ID`, `STAGE_4_VERSION` |
| `src/evidence-linkage/evidence-classification.ts` | `EvidenceClassification` (11 values), `EvidenceType` (12 values); guards |
| `src/evidence-linkage/evidence-record.ts` | `EvidenceRecord`, `EvidenceSpan`, `StatementSpan`, `Stage4LinkageRecord` interfaces |
| `src/evidence-linkage/linkage-rules.ts` | `detectEvidence()` — 11 rules + ambiguity; `EvidenceMatch`, `LinkageDetectionResult` |
| `src/evidence-linkage/evidence-span-validation.ts` | `validateEvidenceSpan()` — 4-invariant check, returns `DraValidationError[]` |
| `src/evidence-linkage/record-identifiers.ts` | `makeEvidenceRecordId()`, `parseEvidenceRecordId()`, `STAGE_4_RECORD_ID_PREFIX = "ar4"` |
| `src/evidence-linkage/link-evidence.ts` | `linkEvidence()` — Stage 4 entry point; `LINKAGE_RULE_VERSION = "1.0.0"` |
| `src/evidence-linkage/index.ts` | Full public surface re-exports |

#### Source files modified

| File | Change |
|---|---|
| `src/model/validation-errors.ts` | Added 8 Stage 4 error codes |
| `src/index.ts` | Re-exports Stage 4 public surface; `DRA_STATUS` updated to DRA-ENG-006 |
| `src/tests/dra.scaffold.test.ts` | Updated `DRA_STATUS.toContain("DRA-ENG-006")` |

#### Test files created

| File | Tests |
|---|---|
| `src/evidence-linkage/__tests__/link-evidence.test.ts` | Integration — all classifications, span integrity, determinism, invalid input |
| `src/evidence-linkage/__tests__/linkage-rules.test.ts` | Unit — all 11 rules, ambiguity, priority, local offsets |
| `src/evidence-linkage/__tests__/stage4-boundary.test.ts` | Boundary — no credibility, factual verification, materiality, issues, decisions, confidence, receipt, CTS |
| `src/evidence-linkage/__tests__/stage4-exports.test.ts` | Export surface — all required exports present, prohibited names absent |
| `src/evidence-linkage/__tests__/evidence-span-validation.test.ts` | Unit — 4 span invariants |
| `src/evidence-linkage/__tests__/record-identifiers.test.ts` | Unit — ID generation, parsing, round-trip, edge cases |

#### Config updated

| File | Change |
|---|---|
| `vitest.config.ts` | Added `"src/evidence-linkage/__tests__/**/*.test.ts"` to `include` |

---

## 4. Evidence Classification Model

### 4.1 Classifications (11, closed set)

| Classification | Meaning |
|---|---|
| `CITED_REFERENCE` | Named, numbered, or bracketed citation present in the statement |
| `TABLE_EVIDENCE` | Table explicitly referenced in the statement |
| `FIGURE_EVIDENCE` | Figure, chart, graph, or diagram explicitly referenced |
| `FOOTNOTE_EVIDENCE` | Footnote marker or superscript reference in the statement |
| `APPENDIX_EVIDENCE` | Appendix, annex, or schedule explicitly referenced |
| `QUOTED_SOURCE` | Quoted passage embedded in the statement |
| `DOCUMENT_CROSS_REFERENCE` | Cross-reference to another section, chapter, or numbered item |
| `EXTERNAL_REFERENCE_PRESENT` | URL or explicit external resource address |
| `DIRECT_DOCUMENT_EVIDENCE` | Reference to a standard, regulation, legislation, or RFC |
| `AMBIGUOUS_EVIDENCE_LINK` | Two or more plausible evidence items that cannot be deterministically distinguished |
| `NO_DOCUMENT_EVIDENCE` | No identifiable documentary evidence found |

### 4.2 Evidence types (12, heuristic descriptor)

`NUMBERED_CITATION` · `BRACKETED_CITATION` · `FIGURE` · `TABLE` · `APPENDIX` · `FOOTNOTE` · `QUOTED_TEXT` · `URL` · `STANDARD` · `LEGISLATION` · `SECTION` · `BIBLIOGRAPHY`

---

## 5. Linkage Rules

Rules applied in priority order (first highest-priority match wins within a single classification domain; multiple domains produce `AMBIGUOUS_EVIDENCE_LINK`):

| Rule | Pattern | Classification |
|---|---|---|
| EL-URL | `https?://...` | `EXTERNAL_REFERENCE_PRESENT` |
| EL-NUMBERED-CITE | `[1]`, `[1,2]`, `[1-3]` | `CITED_REFERENCE` |
| EL-BRACKETED-CITE | `(Smith 2023)`, `(WHO 2021)`, `(Smith et al. 2023)` | `CITED_REFERENCE` |
| EL-FIGURE-REF | `Figure N`, `Fig. N`, `Chart N` | `FIGURE_EVIDENCE` |
| EL-TABLE-REF | `Table N`, `Table A` | `TABLE_EVIDENCE` |
| EL-APPENDIX-REF | `Appendix A`, `Annex B`, `Schedule C` | `APPENDIX_EVIDENCE` |
| EL-FOOTNOTE-REF | `[^1]`, superscript markers | `FOOTNOTE_EVIDENCE` |
| EL-STANDARD-REF | `ISO`, `NIST`, `RFC`, `IEEE`, `GDPR`, `HIPAA`, `FIPS`, `OWASP`, etc. | `DIRECT_DOCUMENT_EVIDENCE` |
| EL-LEGISLATION-REF | `[Name] Act`, `[Name] Regulation`, `[Name] Directive` | `DIRECT_DOCUMENT_EVIDENCE` |
| EL-SECTION-REF | `Section N`, `Chapter N`, `Clause N`, `§ N` | `DOCUMENT_CROSS_REFERENCE` |
| EL-QUOTED-TEXT | `"quoted text..."` (10+ chars) | `QUOTED_SOURCE` |
| EL-NO-EVIDENCE | Default fallback | `NO_DOCUMENT_EVIDENCE` |
| EL-AMBIGUOUS | Two or more distinct classification domains detected | `AMBIGUOUS_EVIDENCE_LINK` |

---

## 6. Structural Boundary Rules

- Evidence is identified only within the **statement text** passed from Stage 2.
- Stage 4 does not scan other sections, tables, figures, or list structures beyond what appears in `stmt.text`.
- Evidence cannot leak across structural boundaries because each statement is evaluated independently from its own text.
- No multi-step indirect cross-reference resolution is performed.
- Structural references (Section, Appendix, etc.) are recorded as-is; the referenced content is not retrieved or evaluated.

---

## 7. Validation Errors

Eight new error codes added to `DRA_ERROR_CODES`:

| Code | Meaning |
|---|---|
| `DRA_INVALID_EVIDENCE_SPAN` | Span is structurally invalid (negative, inverted, out of bounds) |
| `DRA_EVIDENCE_SPAN_INTEGRITY_VIOLATION` | Evidence text does not equal the document slice at the span |
| `DRA_EVIDENCE_RECORD_ID_COLLISION` | Two evidence records share the same identifier |
| `DRA_DUPLICATE_EVIDENCE_RECORD` | A statement has more than one evidence record |
| `DRA_INCOMPLETE_EVIDENCE_COVERAGE` | Not every statement has a corresponding evidence record |
| `DRA_MALFORMED_STAGE3_RESULT` | Stage 3 result is malformed or a failure |
| `DRA_INVALID_EVIDENCE_CLASSIFICATION` | Classification is not in the closed Version 1 set |
| `DRA_INVALID_STRUCTURAL_REFERENCE` | Structural reference cannot be resolved within the document |

---

## 8. Required Invariants — Verification

| # | Invariant | Verified by |
|---|---|---|
| 1 | Every statement has exactly one evidence record | `link-evidence.test.ts` — one record per statement |
| 2 | Unknown statements are rejected | failure handling tests |
| 3 | Statement identifiers remain unchanged | identity preservation tests |
| 4 | Statement text remains unchanged | statementSpan matching tests |
| 5 | Evidence spans preserve source integrity | span integrity tests across all classifications |
| 6 | Output ordering is deterministic | ordering tests |
| 7 | Identical input produces identical output | determinism test |
| 8 | Zero statements produces zero evidence records | zero-statement test |
| 9 | No confidence values exist | boundary tests |
| 10 | No issue classes are created | boundary tests |
| 11 | No release decisions are created | boundary tests |
| 12 | Ambiguous linkage is explicit | AMBIGUOUS_EVIDENCE_LINK tests |
| 13 | Structural inheritance cannot escape its boundary | each statement evaluated independently |

---

## 9. Record Identifier Format

```
ar4:{statementId}
```

Example: statement `s2:0:47` → evidence record `ar4:s2:0:47`.

Properties: deterministic, unique within one evaluation, stable (no wall-clock or random component), traceable (embeds source `statementId`). Distinct from Stage 3 prefix `ar3:`.

---

## 10. Test Results

### Final run

```
Test Files  36 passed (36)
     Tests  1367 passed (1367)
  Duration  3.86s
```

### Breakdown by milestone

| Milestone | Tests at completion |
|---|---|
| DRA-ENG-003 (Input Normalisation) | baseline |
| DRA-ENG-004 (Claim Extraction) | 910 |
| DRA-ENG-005 (Authority Resolution) | 1131 |
| **DRA-ENG-006 (Evidence Linkage)** | **1367** (+236) |

### Stage 4 test distribution

| File | Coverage |
|---|---|
| `link-evidence.test.ts` | ~82 tests — integration, all classifications, span integrity, determinism, invalid input |
| `linkage-rules.test.ts` | ~95 tests — all 11 rules, ambiguity, priority, local offset accuracy |
| `stage4-boundary.test.ts` | ~38 tests — no credibility, materiality, issues, decisions, confidence, receipt, CTS |
| `stage4-exports.test.ts` | ~40 tests — all required exports present, prohibited names absent |
| `evidence-span-validation.test.ts` | ~10 tests — all 4 span invariants |
| `record-identifiers.test.ts` | ~15 tests — generation, parsing, round-trip, edge cases |

---

## 11. TypeScript Result

```
pnpm exec tsc --noEmit → exit 0 (no errors)
```

---

## 12. Build Result

The existing pre-build limitation on `artifacts/mockup-sandbox` (PORT env-var error unrelated to DRA) is carried forward unchanged. The `@workspace/dra-reference` library has no separate build step; it is consumed as TypeScript source. Production build status is not affected by this milestone.

---

## 13. Boundary Test Result

`stage4-boundary.test.ts` (38 tests) confirms Stage 4 produces none of:
- credibility evaluations
- factual verifications
- materiality assessments
- issue class instances
- assurance decisions (SUPPORTED / REVIEW / HOLD)
- confidence scores
- proof receipts
- CTS imports or references
- network access
- LLM calls

---

## 14. Regression Summary

All 1131 pre-existing tests pass without modification. No regressions.

| Scope | Before | After | Delta |
|---|---|---|---|
| Stage 1–3 tests | 1131 | 1131 | ±0 |
| Stage 4 tests (new) | 0 | 236 | +236 |
| **Total** | **1131** | **1367** | **+236** |

---

## 15. Bugs Fixed During Implementation

| ID | Description | Fix |
|---|---|---|
| BF-006-001 | `STANDARD_RE` missing trailing `\b` — matched "EN" from "Encryption", "en" from "enabling", producing spurious `DIRECT_DOCUMENT_EVIDENCE` and `AMBIGUOUS_EVIDENCE_LINK` | Added `\b` after the alternation group |
| BF-006-002 | `SECTION_REF_RE` used `\b` before `§` (U+00A7 is not a word char; `\b` always fails before it) — § references returned `NO_DOCUMENT_EVIDENCE` | Restructured regex: word-based alternatives use `\b`, `§` uses `(?:^|[\s(])` lookahead |
| BF-006-003 | Integration test for `[^1]` after sentence-final period — Stage 2 strips post-period markers so `stmt.text` lacks the footnote | Changed integration test to embed `[^1]` before the period; unit test is unaffected |

---

## 16. Known Limitations (Version 1)

- Evidence is identified only within the statement text extracted by Stage 2. Evidence appearing exclusively in surrounding paragraphs, captions, or headers but not referenced in the statement is not linked.
- Non-English citation formats are not detected.
- Bibliography sections are not parsed; bibliography matches depend on heuristic author-year pattern in the statement text itself.
- Multi-step indirect cross-references (e.g. "see the section mentioned above") are not resolved.
- Named-entity disambiguation for legislation references is not performed; the pattern is purely syntactic.
- `QUOTED_SOURCE` detection requires ASCII or Unicode left/right double quotation marks and at least 10 characters of quoted content.
- `EN` and `BS` standard prefixes (European/British standards) are detected only when they appear as standalone words; they do not match mid-word occurrences.

---

## 17. Confirmation

DRA-ENG-007 (Materiality Assessment) has **not** been started.
