# DRA-001 — Stage 1: Input Normalisation

**Milestone:** DRA-ENG-003  
**Status:** Complete  
**Package:** `@workspace/dra-reference`

---

## Overview

Stage 1 is the runtime boundary of the DRA evaluator pipeline. It accepts
untrusted input of unknown type, validates it against the canonical DRA
data model, applies all authorised normalisation transformations, and
returns a discriminated success/failure result. It never throws for
ordinary invalid input.

**Entry point:**

```typescript
import { normaliseEvaluationRequest } from "@workspace/dra-reference";

const result = normaliseEvaluationRequest(rawInput);

if (result.ok) {
  // result.normalisedRequest — canonical EvaluationRequest, ready for Stage 2
  // result.normalisationRecord — structured record of Stage 1 processing
  // result.warnings — non-fatal informational observations
} else {
  // result.errors — deterministic array of DraValidationError
  // result.errorCount — convenience: equals result.errors.length
}
```

---

## Scope

Stage 1 performs **input normalisation only**. It does not:

- Extract material statements
- Determine what is or is not material
- Retrieve, search for, or score evidence
- Detect any of the nine DRA issue classes
- Calculate severity, confidence, or assurance decisions
- Generate a proof receipt
- Execute any later pipeline stage (Stage 2–7)

---

## Normalisation Rules

### 1. Structural Validation

The raw input is parsed against `EvaluationRequestSchema` (Zod v3). Any
structural failure — wrong type, missing required field, invalid enum —
produces a deterministic set of `DraValidationError` values with mapped
DRA error codes.

Unknown top-level fields beyond the canonical schema are stripped silently
(Zod default). The canonical extension point for requester metadata is
`requesterMetadata: Record<string, unknown>`, which is preserved exactly.

### 2. Document Identity Separation

The `generatedDocument.id` must not equal any `sourceDocument.id`. A
conflict is rejected with `DRA_DUPLICATE_IDENTIFIER`.

### 3. Duplicate Source Document Identifiers

Source documents are checked for duplicate `id` values. Any duplicate is
rejected with `DRA_DUPLICATE_IDENTIFIER`.

### 4. String Normalisation — Metadata Fields

The following fields are trimmed (leading/trailing whitespace removed)
**and** have line endings normalised:

| Field | Location |
|---|---|
| `title` | `SourceDocument`, `GeneratedDocument` |
| `author` | `SourceDocument` (optional) |
| `version` | `SourceDocument` (optional) |
| `provenanceNotes` | `SourceDocument` (optional) |
| `contentRef` | `SourceDocument` (optional) |
| `locationLabel` | `SpanReference` (optional) |

Optional metadata fields that are non-empty but become empty after
trimming are treated as absent (`undefined`).

### 5. String Normalisation — Content Fields

The following fields have **line endings normalised only** (CRLF → LF;
standalone CR → LF). They are **not trimmed** — trimming document prose
could remove semantically significant leading or trailing text:

| Field | Location |
|---|---|
| `content` | `SourceDocument`, `GeneratedDocument` |
| `text` | `MaterialStatement` (Stage 2+) |
| `passageText` | `EvidenceUnit` (Stage 4+) |

### 6. Source Document Reference Integrity

Each ID in `generatedDocument.sourceDocumentIds` must correspond to a
source document provided in `sourceDocuments`. An unresolved reference
is rejected with `DRA_UNRESOLVED_REFERENCE`.

An empty `sourceDocumentIds` array is valid at Stage 1.

### 7. Deterministic Ordering

- **`sourceDocuments`** — sorted by `id` (lexicographic ascending, Unicode code-point order)

Statement and evidence collections (not present in EvaluationRequest)
are sorted by `statementIndex` then `id` (statements) or by `id`
(evidence units and relationships).

### 8. Immutability

Stage 1 never mutates the caller's input object. All normalised output
objects are freshly constructed from the parsed (Zod-separated) data.
Subsequent mutation of the raw input does not affect the normalised result.

### 9. Version Declaration

Stage 1 always declares:
- `outputModelVersion: "0.1.0"` (= `DRA_MODEL_VERSION`)
- `outputPipelineVersion: "1.0"` (= `DRA_PIPELINE_VERSION`)

These are the only supported versions in Version 1. There is no mechanism
to request a different output version at Stage 1 — the normalised output
is always at the current canonical model version.

---

## Result Types

### Stage1Success

```typescript
interface Stage1Success {
  ok: true;
  stageId: "STAGE_1_INPUT_NORMALISATION";
  pipelineVersion: string;         // always "1.0"
  modelVersion: string;            // always "0.1.0"
  normalisedRequest: EvaluationRequest;
  normalisationRecord: NormalisationRecord;
  warnings: ReadonlyArray<string>;
}
```

### Stage1Failure

```typescript
interface Stage1Failure {
  ok: false;
  stageId: "STAGE_1_INPUT_NORMALISATION";
  errors: ReadonlyArray<DraValidationError>;
  errorCount: number;  // equals errors.length
}
```

### NormalisationRecord

```typescript
interface NormalisationRecord {
  stageId: "STAGE_1_INPUT_NORMALISATION";
  stageVersion: string;            // implementation version
  outputModelVersion: string;      // always "0.1.0"
  outputPipelineVersion: string;   // always "1.0"
  fieldsNormalised: ReadonlyArray<string>;     // sorted; dot-path of normalised fields
  collectionsReordered: ReadonlyArray<string>; // names of reordered collections
  inputEntityCounts: NormalisationEntityCounts;
  outputEntityCounts: NormalisationEntityCounts;
  warnings: ReadonlyArray<string>;
}
```

---

## Error Codes Used at Stage 1

All error codes are defined in `DRA_ERROR_CODES` (`model/validation-errors.ts`).

| Code | Scenario |
|---|---|
| `DRA_MISSING_REQUIRED_FIELD` | Required field absent in raw input |
| `DRA_EMPTY_REQUIRED_STRING` | Required string is present but empty |
| `DRA_INVALID_TIMESTAMP` | `requestedAt`, `publishedAt`, etc. not valid UTC ISO-8601 |
| `DRA_DUPLICATE_IDENTIFIER` | Two source documents with same `id`; gen doc id = source doc id |
| `DRA_UNRESOLVED_REFERENCE` | `sourceDocumentIds` entry has no matching source document |
| `DRA_STRUCTURALLY_INCOMPLETE_REQUEST` | Zod parse failure (type mismatch, invalid enum, etc.) |

---

## Determinism Guarantee

Stage 1 is deterministic:

1. **Same valid input → same normalised output.** The only output differences
   between runs are order-dependent effects that are themselves made
   deterministic by sorting.
2. **Normalising an already-normalised request is idempotent.** The output
   of normalising a `Stage1Success.normalisedRequest` is deeply equal to
   the first normalised output.
3. **Same invalid input → same error array in same order.** Errors are
   sorted by `path` (lexicographic) then `code` (lexicographic).

---

## Module Structure

```
src/normalisation/
├── README.md                           ← this file
├── index.ts                            ← public surface
├── stage1-types.ts                     ← Stage1Result, NormalisationRecord
├── normalise-strings.ts                ← string utility functions
├── normalise-documents.ts              ← SourceDocument, GeneratedDocument normalisation
├── normalise-statements.ts             ← MaterialStatement normalisation (Stage 2+ use)
├── normalise-evidence.ts               ← EvidenceUnit, EvidenceRelationship normalisation (Stage 4+ use)
├── normalise-evaluation-request.ts     ← main entry point
└── __tests__/
    ├── normalise-strings.test.ts       ← string utility tests
    ├── normalise-evaluation-request.test.ts ← main Stage 1 tests
    ├── stage1-boundary.test.ts         ← no decisions/issues/receipts/confidence
    └── stage1-exports.test.ts          ← package export surface + CTS boundary
```

---

## Fixtures

```
src/fixtures/normalisation/
├── valid.ts    — 10 valid fixture scenarios
└── invalid.ts  — 20 invalid fixture scenarios (fixtures 5–20)
```

---

## What Comes Next

**Stage 2: Claim Extraction** (`DRA-ENG-004`) accepts a
`Stage1Success.normalisedRequest` and extracts `MaterialStatement`
instances from the generated document content.

Stage 2 must not be started until DRA-ENG-004 is explicitly opened.
