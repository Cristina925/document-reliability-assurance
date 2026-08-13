# DRA-001 — Stage 2: Claim Extraction

**Milestone:** DRA-ENG-004  
**Stage ID:** `STAGE_2_CLAIM_EXTRACTION`  
**Package:** `@workspace/dra-reference`  
**Module path:** `lib/dra-reference/src/claim-extraction/`

---

## 1. Purpose

Stage 2 of the DRA evaluator pipeline accepts the canonical normalised evaluation
request produced by Stage 1 and extracts **candidate material statements** from
the generated document.

A candidate material statement is any text segment that may assert a proposition
of fact, specification, or requirement. Stage 2 does not determine whether a
statement is correct, supported, or material — that is reserved for Stages 3–7.

---

## 2. Entry Point

```typescript
import { extractClaims } from "@workspace/dra-reference";

const result = extractClaims(normalisedRequest);

if (result.ok) {
  // result.statements — ReadonlyArray<MaterialStatement>
  // result.extractionRecord — ExtractionRecord
  // result.warnings — ReadonlyArray<string>
} else {
  // result.errors — ReadonlyArray<DraValidationError>
  // result.errorCount — number
}
```

`extractClaims` **never throws**. All failures are returned as `Stage2Failure`.

---

## 3. Inputs and Outputs

| Item | Type | Notes |
|---|---|---|
| Input | `NormalisedEvaluationRequest` | Output of Stage 1 (`normaliseEvaluationRequest(...).normalisedRequest`) |
| Output | `Stage2Result` | Discriminated union on `ok` |
| Success | `Stage2Success` | Carries `statements`, `extractionRecord`, `warnings` |
| Failure | `Stage2Failure` | Carries `errors`, `errorCount` |

### MaterialStatement fields at Stage 2

| Field | Value at Stage 2 |
|---|---|
| `id` | Deterministic — format `s2:{startOffset}:{endOffset}` |
| `text` | Exact document text slice |
| `statementIndex` | 0-based, document order |
| `spanRef.startOffset` | Zero-based inclusive offset into document content |
| `spanRef.endOffset` | Zero-based exclusive offset (Python-slice convention) |
| `materiality` | Not set (`undefined`) — deferred to later stages |
| `linkedEvidenceUnitIds` | `[]` — evidence linkage is Stage 4 |
| `stageMetadata` | Not set — deferred |

---

## 4. Span Integrity Invariant

For every extracted statement:

```
content.slice(statement.spanRef.startOffset, statement.spanRef.endOffset) === statement.text
```

This invariant is validated internally before the result is returned. A span
integrity violation causes a `Stage2Failure` — it is never silently ignored.

Character offsets are **UTF-16 code unit positions** (JavaScript `string.length`
semantics). For documents containing only ASCII text, this is equivalent to
byte offsets.

---

## 5. Segmentation Rules

Segmentation is **deterministic, rule-based, and requires no external services**.

### 5.1 Paragraph Boundaries

Blank lines (`\n\n`) delimit paragraph blocks. Single newlines within a block
produce separate segments (one per line).

### 5.2 Line Classification

Each line is classified before segmentation:

| Pattern | Segment Type | Candidate? |
|---|---|---|
| `# ...` (markdown heading) | `HEADING` | No — excluded |
| `- item`, `* item`, `• item` | `BULLET_ITEM` | Yes (marker stripped) |
| `1. item`, `2) item` | `NUMBERED_ITEM` | Yes (marker stripped) |
| `---`, `===`, `***` | `HORIZONTAL_RULE` | No — excluded |
| Everything else | `SENTENCE` | Sentence-split |

### 5.3 Sentence Splitting

Within plain lines, the sentence splitter detects terminal punctuation (`.`, `!`, `?`):

- `!` and `?` are always sentence boundaries.
- `.` is a sentence boundary when followed by whitespace + uppercase OR end-of-string, subject to the **non-boundary conditions** below.

**Non-boundary conditions for `.`:**

| Condition | Example | Outcome |
|---|---|---|
| Next char is a digit | `3.14` | Not a boundary |
| Next non-whitespace is lowercase | `e.g. lower` | Not a boundary |
| Word before `.` is a known abbreviation | `Dr. Smith` | Not a boundary |
| Word before `.` is a single character | `A. Smith` | Not a boundary |

### 5.4 Exclusion Criteria

Segments are excluded (not candidate claims) when:

| Reason | Example |
|---|---|
| `EMPTY` | Zero-length segment |
| `WHITESPACE_ONLY` | `   ` |
| `PUNCTUATION_ONLY` | `...` (no alphabetic characters) |
| `HEADING` | `# Section Title` |
| `HORIZONTAL_RULE` | `---` |
| `PAGE_NUMBER` | `Page 3 of 10` |
| `SHORT_FRAGMENT` | Fewer than 3 non-whitespace characters |
| `DUPLICATE_SPAN` | Identical `(startOffset, endOffset)` to an earlier candidate |

### 5.5 Inclusion Decisions (Conservative)

The following content types are **included** as candidate claims under Version 1
conservative rules. These are documented implementation choices, not scientific
conclusions.

| Content type | Included? | Rationale |
|---|---|---|
| Questions | Yes | Rhetorical questions embed assertions |
| Commands/imperatives | Yes | Requirements use imperative mood |
| Quotations | Yes | Quoted text is the asserted claim |
| Disclaimers | Yes | A disclaimer is a claim about limitations |
| Bullet items | Yes | Each item is an independent assertion |
| Numbered items | Yes | Each item is an independent assertion |
| Captions | Yes | May assert document structure |
| Parenthetical statements | Yes | Captured as part of containing sentence |

---

## 6. Statement Identifier Strategy

Statement identifiers follow the format `s2:{startOffset}:{endOffset}`.

| Property | Guaranteed |
|---|---|
| Deterministic | Same content position always produces the same ID |
| Unique within one evaluation | Non-overlapping segments → no two statements share a span |
| Stable | No wall-clock time or random UUID |
| Human-readable | Encodes document location |

**Limitation:** IDs are unique within one evaluation but not globally unique
across evaluations. The same character offsets in different documents produce
the same ID.

---

## 7. Implementation Limitations (Version 1)

1. **Non-English text:** Segmented by English rules. Accuracy varies for non-English
   abbreviations and sentence-ending patterns.

2. **Multi-line soft-wrapped sentences:** A sentence that wraps across two lines
   is split at the line boundary, producing two segments. One or both may be
   short fragments and thus excluded.

3. **Table content:** Each table row is treated as a plain text line. Column
   structure is not parsed.

4. **Multi-line bullet continuation:** A bullet item that continues on the next
   line (indented continuation) produces two separate segments.

5. **Materiality assignment:** Materiality is not assessed at Stage 2. All
   statements are candidates. Materiality classification is reserved for
   Stages 3–5.

6. **Evidence linkage:** `linkedEvidenceUnitIds` is always empty at Stage 2.
   Evidence linkage is performed at Stage 4.

7. **MIN_CANDIDATE_CHARS = 3:** Segments with fewer than 3 non-whitespace
   characters are excluded. This threshold may include very short valid assertions
   (e.g. "OK." "No."). Documented as an implementation choice.

8. **Questions included:** Including questions as candidates may produce
   non-propositional statements. This is intentional (conservative over-extraction)
   and documented.

---

## 8. Stage 2 Must Not

Stage 2 must not and does not:

- Inspect source evidence for support
- Map claims to evidence units (that is Stage 4)
- Determine truth or factual correctness
- Detect any of the nine DRA issue classes
- Assign severity, confidence, or decisions
- Generate a proof receipt
- Execute later pipeline stages

---

## 9. Module Files

| File | Purpose |
|---|---|
| `extract-claims.ts` | Main entry point: `extractClaims()` |
| `extraction-result.ts` | `Stage2Result`, `Stage2Success`, `Stage2Failure` types |
| `extraction-record.ts` | `ExtractionRecord`, `RejectionRecord` types |
| `segment-content.ts` | Deterministic content segmenter |
| `classify-segments.ts` | Segment classification (candidate vs excluded) |
| `statement-identifiers.ts` | Deterministic statement ID generation |
| `span-integrity.ts` | Span integrity invariant validation |
| `index.ts` | Public surface exports |
| `__tests__/` | Test suite (6 test files) |

---

## 10. Test Coverage

Tests are in `src/claim-extraction/__tests__/`. Run with:

```
pnpm --filter @workspace/dra-reference run test
```

Test files:
- `extract-claims.test.ts` — Full integration tests across all 25 fixture scenarios
- `segment-content.test.ts` — Unit tests for the sentence/paragraph segmenter
- `classify-segments.test.ts` — Unit tests for segment classification
- `span-integrity.test.ts` — Unit tests for span integrity invariants
- `statement-identifiers.test.ts` — Unit tests for deterministic ID generation
- `stage2-boundary.test.ts` — Boundary tests (no evidence/issues/decisions/receipt/CTS)
- `stage2-exports.test.ts` — Package export verification tests

---

*Implemented at DRA-ENG-004 — Claim Extraction.*  
*Part of the DRA-001 Version 1 engineering programme.*
