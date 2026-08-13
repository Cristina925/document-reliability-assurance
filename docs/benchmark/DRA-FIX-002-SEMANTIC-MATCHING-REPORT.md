# DRA-FIX-002 — Deterministic Semantic Evidence Matching

**Milestone:** DRA-FIX-002  
**Date:** 2026-08-04  
**Decision:** DRA-FIX-002 COMPLETE  
**Test files:**
- `lib/dra-reference/src/evidence-linkage/__tests__/semantic-paraphrase.test.ts` (52 tests)
- `lib/dra-reference/src/evidence-linkage/__tests__/dra-fix-002-semantic-matching.test.ts` (37 tests)

---

## A. Root-Cause Analysis

### Primary finding: Stage 4 evidence linkage is purely citation-pattern based

The Stage 4 `detectEvidence` function scans the statement text for eleven citation and reference pattern families: numbered citations (`[1]`), bracketed citations `(Author Year)`, figure/table/appendix references, footnote markers, standards (ISO, GDPR, etc.), legislation names (Employment Rights Act), section references (Section N, Paragraph N), URLs, and quoted text. None of these patterns are present in plain-English paraphrase statements.

**Result:** Any statement that does not contain a citation, reference, or quoted text returns `classification: "NO_DOCUMENT_EVIDENCE"` with `linkageRule: "EL-NO-EVIDENCE"`. The evidence classification is then consumed by Stage 6 (Consistency Check), which produces an `EVIDENCE_ABSENT` (IC-4, BLOCKING) issue for any statement with CRITICAL materiality and an identifiable authority.

### Exact failure for paragraph 17

Guide statement text (pages 18–25 companion section):

> "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing."

Normalisation applied: none (the statement text is fed as-is to `detectEvidence`).

Eleven regex families evaluated against this text:
- `NUMBERED_CITATION_RE` (`[1]` etc.) → no match
- `BRACKETED_CITATION_RE` (`(Smith 2023)` etc.) → no match
- `FIGURE_REF_RE`, `TABLE_REF_RE`, `APPENDIX_REF_RE`, `FOOTNOTE_RE` → no match
- `STANDARD_RE` (ISO, GDPR, etc.) → no match
- `LEGISLATION_RE` (Employment Rights Act etc.) → no match
- `SECTION_REF_RE` (Section N, Paragraph N, §N) → no match
- `URL_RE` → no match
- `QUOTED_TEXT_RE` (quoted passage ≥ 10 chars) → no match

Outcome: `deduped.length === 0` → returns `{ classification: "NO_DOCUMENT_EVIDENCE", linkageRule: "EL-NO-EVIDENCE", matches: [] }`.

The corresponding source authority — Code paragraph 17 — was never consulted. Stage 4 has no mechanism to compare statement text against source document passages.

### Why EVIDENCE_ABSENT fires

Stage 6 `issue-detection.ts` line 208:
```typescript
if (isCritical && noEvid && !noAuth) {
  // IC-4: EVIDENCE_ABSENT (BLOCKING)
```
Where `noEvid = NO_EVIDENCE.has(er.classification)` and `NO_EVIDENCE = new Set(["NO_DOCUMENT_EVIDENCE"])`.

The companion-questions statement has CRITICAL materiality (Stage 5), an identifiable authority (Code, via Stage 3), and `NO_DOCUMENT_EVIDENCE` (Stage 4). All three conditions satisfied → IC-4 fires.

---

## B. Exact Paragraph 17 Statement Pair

**Guide statement** (from pages 18–25 evaluation boundary):
> "You are, however, not legally required to permit the companion to answer questions on your behalf at the hearing."

Content terms after canonicalisation: `["required", "permit", "companion", "answer", "questions", "behalf", "hearing"]`  
Polarity: **negative** (token `"not"`)

**Code paragraph 17** (canonical source authority):
> "The companion does not, however, have the right to answer questions on the worker's behalf, or to address the meeting in a way which prevents the employer from explaining their case."

Content terms: `["right", "companion", "answer", "questions", "worker", "behalf", "address", "meeting", "prevents", "employer", "explaining", "case"]`  
Polarity: **negative** (token `"not"` in "does not")

**Shared content terms:** `companion`, `answer`, `questions`, `behalf` → 4 ≥ MIN_SHARED_TERMS (3) ✓  
**Shared content bigrams:** `companion answer`, `answer questions` → 2 ≥ MIN_SHARED_BIGRAMS (1) ✓  
**Polarity match:** both negative ✓  
**Result:** SEMANTIC_PARAPHRASE_MATCH ✓

---

## C. Files Modified

| File | Change | Reason |
|------|--------|--------|
| `lib/dra-reference/src/evidence-linkage/semantic-paraphrase.ts` | **Created** — phrase-canonicalisation + content-term-overlap matcher | Core implementation |
| `lib/dra-reference/src/evidence-linkage/evidence-classification.ts` | Added `SEMANTIC_PARAPHRASE_MATCH` to `EVIDENCE_CLASSIFICATIONS` | New evidence classification for semantic paraphrase |
| `lib/dra-reference/src/evidence-linkage/link-evidence.ts` | Added semantic fallback in Step 4 loop + source text extraction | Wires matcher into pipeline |
| `lib/dra-reference/src/evidence-linkage/evidence-record.ts` | Updated `evidenceSpans` doc comment | Clarifies empty-spans for semantic matches |
| `lib/dra-reference/src/evidence-linkage/index.ts` | Export `detectSemanticParaphrase` and `SemanticParaphraseResult` | Public API surface |
| `lib/dra-reference/src/evidence-linkage/__tests__/stage4-exports.test.ts` | Updated count checks: `toHaveLength(11)` → `toHaveLength(12)` (×2); added `SEMANTIC_PARAPHRASE_MATCH` to classification list | Test reflects new classification |
| `lib/dra-reference/src/evidence-linkage/__tests__/link-evidence.test.ts` | Updated "classificationCounts covers all 11" → 12; added `SEMANTIC_PARAPHRASE_MATCH` | Test reflects new classification |

**Files created:**

| File | Purpose |
|------|---------|
| `lib/dra-reference/src/evidence-linkage/__tests__/semantic-paraphrase.test.ts` | 52 unit tests for `semantic-paraphrase.ts` |
| `lib/dra-reference/src/evidence-linkage/__tests__/dra-fix-002-semantic-matching.test.ts` | 37 pipeline + regression + compatibility tests |

**Files NOT modified** (as required):
- DRA-DOC-0001 through DRA-DOC-0008
- DRA-FRZ-000001, DRA-FRZ-000002
- DRA-VAL-002 artefacts
- Previous benchmark results or proof receipts
- Issue-class definitions (`model/issue-classes.ts`)
- Severity semantics, decision semantics
- Corpus and governance rules
- CTS artefacts

---

## D. Matching Change Implemented

**New module:** `semantic-paraphrase.ts`

**Algorithm:** Phrase-canonicalisation + content-term bigram overlap + polarity check.

### Phase 1: Phrase canonicalisation
A controlled phrase-equivalence map substitutes semantically equivalent modal/entitlement expressions before content analysis:

| Pattern | Canonical form | Polarity |
|---------|---------------|---------|
| `does not have the right to` | `may not` | negative |
| `do not have the right to` | `may not` | negative |
| `is not entitled to` | `may not` | negative |
| `are not entitled to` | `may not` | negative |
| `not legally required to` | `not required to` | negative (preserves "not") |
| `not permitted to` | `may not` | negative |
| `has the right to` | `may` | positive |
| `have the right to` | `may` | positive |
| `is entitled to` | `may` | positive |
| `are entitled to` | `may` | positive |
| `is permitted to` | `may` | positive |
| `are permitted to` | `may` | positive |

### Phase 2: Content term extraction
After canonicalisation, text is tokenised and filtered to content terms: tokens ≥ 4 characters that are not in the stopword set. A curated 80-word stopword set removes pronouns, prepositions, auxiliaries, and common connectors while retaining substantive domain words.

### Phase 3: Content bigram overlap
Consecutive content-term pairs (bigrams) are extracted from both statement and source chunk. Shared bigrams represent shared two-word propositions, which are far more specific than individual shared terms. `MIN_SHARED_BIGRAMS = 1` requires at least one shared two-word content proposition.

### Phase 4: Term overlap threshold
`MIN_SHARED_TERMS = 3` requires at least three shared content terms beyond the bigram anchor, preventing single-term topic matches.

### Phase 5: Polarity check
`detectPolarity` checks the **original (pre-canonicalisation)** text for negation tokens (`not`, `no`, `never`, `without`, `prohibited`, `forbidden`). Statement and source chunk must have identical polarity. This is the primary safeguard against polarity confusion.

### Fallback integration in `link-evidence.ts`

```
for each statement in Stage 2:
  detection = detectEvidence(stmt.text)   // existing citation matching
  
  if detection == NO_DOCUMENT_EVIDENCE AND sourceTexts.length > 0:
    paraMatch = detectSemanticParaphrase(stmt.text, sourceTexts)
    if paraMatch != null:
      detection = { SEMANTIC_PARAPHRASE_MATCH, EL-SEMANTIC-PARAPHRASE, matches: [] }
  
  // continue with detection to build EvidenceRecord
```

The fallback is a terminal else-branch: citations always take priority. If `detectEvidence` produces any non-`NO_DOCUMENT_EVIDENCE` classification, the semantic matcher is not invoked.

### Evidence span design
`EvidenceSpan` offsets reference positions in the **generated document** content. For semantic paraphrase, the matching evidence resides in the **source document** — a different coordinate space. Therefore `evidenceSpans` is empty (`[]`) for `SEMANTIC_PARAPHRASE_MATCH` records. The `evidence-record.ts` doc comment has been updated to document this invariant.

---

## E. Polarity and Negation Safeguards

### Explicit negative controls verified

| Statement | Source | Expected | Result |
|-----------|--------|----------|--------|
| "may answer questions" | "may not answer questions" | NO MATCH | ✓ PASS |
| "has the right to answer questions" | "does not have the right to answer questions" | NO MATCH | ✓ PASS |
| "is entitled to answer questions" | "is not entitled to answer questions" | NO MATCH | ✓ PASS |
| "must notify" | "must not notify" | NO MATCH | ✓ PASS |

### How polarity is preserved through canonicalisation

The canonical forms are intentionally distinct: `"does not have the right to"` → `"may not"` (retains negation) vs `"has the right to"` → `"may"` (no negation). After canonicalisation, the original polarity of each phrase is recoverable from the canonical form itself.

Additionally, `detectPolarity` operates on the **original text** (before canonicalisation), not the canonical form. This means polarity detection is not affected by phrase substitution even when substitution removes or transforms a negation marker.

### IC-7 CLAIM_INCONSISTENCY is unaffected

The consistency check's IC-7 contradiction detection (`parseDeonticVerb`) scans for `must [not]`, `shall [not]`, and `cannot` — not for `may [not]`. SEMANTIC_PARAPHRASE_MATCH statements using the modal "may not" are not subject to IC-7. This is correct: entitlement language is not deontic obligation language.

---

## F. Positive Regression Results

### DRA-FIX-002 — paragraph 17 direct regression

| Assertion | Result |
|-----------|--------|
| Guide paraphrase matches Code paragraph 17 | ✓ PASS |
| `classification === SEMANTIC_PARAPHRASE_MATCH` | ✓ PASS |
| Shared bigrams include `"answer questions"` | ✓ PASS |
| Shared terms include `companion`, `answer`, `questions` | ✓ PASS |
| Shared term count ≥ 3 | ✓ PASS |
| Shared bigram count ≥ 1 | ✓ PASS |
| Both statement and Code chunk have negative polarity | ✓ PASS |

### Additional positive paraphrase tests

| Pair | Result |
|------|--------|
| `"does not have the right to"` ↔ `"may not"` (companion answering) | ✓ PASS |
| `"is entitled to"` ↔ `"has the right to"` (companion choice) | ✓ PASS |
| `"may address the hearing"` ↔ `"is permitted to address the hearing"` | ✓ PASS |
| Guide with extra detail not in source | ✓ PASS |
| Correct sourceIndex when multiple source docs provided | ✓ PASS |

---

## G. Negative-Control Results

### Polarity mismatch — must not match

| Control | Result |
|---------|--------|
| Positive `"may answer"` vs negative Code para 17 | ✓ NO MATCH |
| Positive `"has the right to answer"` vs negative `"does not have the right"` | ✓ NO MATCH |
| Positive `"is entitled to answer"` vs negative `"is not entitled to answer"` | ✓ NO MATCH |
| Positive `"must notify"` vs negative `"must not notify"` | ✓ NO MATCH |

### Topic-only overlap — must not overmatch

| Control | Result |
|---------|--------|
| Source far less specific than claim | ✓ NO MATCH |
| Same actor/object, completely different action | ✓ NO MATCH |
| `"companion must stay silent"` vs companion rights text | ✓ NO MATCH |

The MIN_SHARED_BIGRAMS=1 threshold is the key anti-overmatch guard: topic-only matches share individual terms (companion, questions, meeting) but do not share any two-word content proposition. Two consecutive content words appearing in the same order in both texts indicates substantive semantic overlap rather than mere topic co-occurrence.

---

## H. Existing-Fixture Compatibility

All existing evidence-linkage expectations are preserved:

| Fixture | Expected | Verified |
|---------|----------|---------|
| `[1]` citation | `CITED_REFERENCE` / `EL-NUMBERED-CITE` | ✓ |
| `Section 5` reference | `DOCUMENT_CROSS_REFERENCE` / `EL-SECTION-REF` | ✓ |
| Plain statement, no source | `NO_DOCUMENT_EVIDENCE` | ✓ |
| Plain statement, non-matching source | `NO_DOCUMENT_EVIDENCE` | ✓ |
| URL | `EXTERNAL_REFERENCE_PRESENT` | ✓ |
| Legislation name | `DIRECT_DOCUMENT_EVIDENCE` | ✓ |
| Statement with citation AND paraphrase → citation wins | `CITED_REFERENCE` | ✓ |

The semantic matcher is invoked **only** when `detectEvidence` returns `NO_DOCUMENT_EVIDENCE`. Citations always take priority.

---

## I. Local DRA-DOC-0008 Regression Fixture

The regression is reproduced entirely offline using local text fixtures defined in `dra-fix-002-semantic-matching.test.ts`:

**`FIXTURE_GUIDE_COMPANION_SECTION`** — Guide excerpt (pages 18–25, companion rights):
```
Attending a disciplinary hearing – the role of the companion

A worker may be accompanied at a disciplinary hearing by a companion
of their choice.
…
You are, however, not legally required to permit the companion to answer
questions on your behalf at the hearing.
…
```

**`FIXTURE_CODE_PARA_17`** — Code paragraph 17:
```
17

The companion does not, however, have the right to answer questions on
the worker's behalf, or to address the meeting in a way which prevents
the employer from explaining their case.
```

These fixtures are minimal, stable, and contain no network dependencies. The test does not call `extractPdfText`, `createHttpFetcher`, or any acquisition infrastructure. The paragraph 17 paraphrase is reproduced deterministically from these constants in every run.

**Instruction 12 compliance:** The full DRA-DOC-0008 evaluator pipeline is NOT executed. Tests call `extractClaims`, `resolveAuthority`, `linkEvidence`, `assessMateriality`, and `checkConsistency` on the local fixture only. No blind evaluation, proof receipt, or benchmark result is produced.

---

## J. Determinism Results

| Test | Result |
|------|--------|
| Identical inputs produce identical `SemanticParaphraseResult` | ✓ PASS |
| Swapped source order produces consistent result (different sourceIndex, same shared terms/bigrams) | ✓ PASS |
| Identical Stage 4 inputs produce identical classification arrays | ✓ PASS |
| Identical Stage 4 inputs produce identical `classificationCounts` | ✓ PASS |

**Determinism guarantee:** The algorithm processes sources left-to-right and chunks left-to-right (paragraph order), returning the first qualifying match. All intermediate data structures are derived from the input text through pure functions. No randomness, timestamps, or external state is involved.

---

## K. Full Tests and Typecheck

```
Test Files  106 passed (106)
Tests       3062 passed (3062)

pnpm tsc --noEmit  →  (no output, exit 0)
```

- 106 test files (2 new: `semantic-paraphrase.test.ts`, `dra-fix-002-semantic-matching.test.ts`)
- 3,062 tests (89 new from DRA-FIX-002; 2,973 pre-existing)
- 0 failures
- 0 skipped

---

## L. Decision

**DRA-FIX-002 COMPLETE**

The root cause (Stage 4 having no mechanism to compare statement content against source document passages) has been addressed with the minimum deterministic change: a phrase-canonicalisation + content-term-overlap + polarity-parity fallback that activates only when the existing citation matcher returns `NO_DOCUMENT_EVIDENCE`. All existing behaviour is preserved. Polarity is explicitly protected. Overmatching is prevented by requiring both a shared content bigram (two consecutive non-trivial words in the same order) and a minimum shared term count. The implementation is deterministic, locally testable, and introduces no external dependencies.

---

## M. Frozen Benchmark, Governance, Schema, Decision and Issue-Class Artefacts — Confirmation

No frozen benchmark artefact, governance rule, schema, decision-class value, or issue-class definition was modified:

| Category | Status |
|----------|--------|
| DRA-DOC-0001 through DRA-DOC-0008 | **Unmodified** |
| DRA-FRZ-000001, DRA-FRZ-000002 | **Unmodified** |
| DRA-VAL-002 artefacts | **Unmodified** |
| Previous proof receipts | **Unmodified** |
| `model/issue-classes.ts` (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, etc.) | **Unmodified** |
| Severity semantics | **Unmodified** |
| Decision semantics (`SUPPORTED`, `REVIEW`, `HOLD`) | **Unmodified** |
| Corpus and governance rules | **Unmodified** |
| CTS artefacts | **Unmodified** |
| `DRA_PIPELINE_VERSION`, `DRA_MODEL_VERSION` | **Unmodified** |
| Stage identifiers (1–8) | **Unmodified** |
| Confidence scoring rules | **Unmodified** |
| `NO_EVIDENCE` sentinel set in `issue-detection.ts` | **Unmodified** (SEMANTIC_PARAPHRASE_MATCH is not in it, which is the intended behaviour) |
