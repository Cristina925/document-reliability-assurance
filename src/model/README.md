# DRA-001 Canonical Data Model

**Milestone:** DRA-ENG-002 — Canonical Data Model  
**Package:** `@workspace/dra-reference`  
**Schema version:** `0.1.0`  
**Status:** Version 1 implementation — pre-production reference only

---

## Purpose

This directory contains the canonical Version 1 data model for DRA-001 (Document Release Assurance). It defines all types, schemas, validators, and invariant checks required to represent DRA evaluation inputs and outputs consistently.

This module defines **representation only**. It does not implement the evaluator pipeline or any assurance behaviour.

---

## Implemented Entities

| Module | Entity | Description |
|---|---|---|
| `identifiers.ts` | Branded ID types | EvaluationId, SourceDocumentId, GeneratedDocumentId, StatementId, EvidenceUnitId, IssueId, ProofReceiptId, EvaluationResultId, EvidenceRelationshipId |
| `versions.ts` | Schema versions | DRA_MODEL_VERSION (0.1.0), DRA_PIPELINE_VERSION (1.0) |
| `decisions.ts` | AssuranceDecision | SUPPORTED / REVIEW / HOLD (frozen, DRA-001 §7) |
| `issue-classes.ts` | DraIssueClass | Nine frozen issue classes (DRA-001 §6) |
| `pipeline-stages.ts` | PipelineStageName | Seven frozen pipeline stages (DRA-001 §5) |
| `validation-errors.ts` | DraValidationError | Structured error type with code, path, message, received |
| `documents.ts` | SourceDocument, GeneratedDocument | Reference documents and AI-generated documents |
| `statements.ts` | MaterialStatement, SpanReference | Claims/assertions within the generated document |
| `evidence.ts` | EvidenceUnit, EvidenceRelationship | Source passages and typed relationships to statements |
| `issues.ts` | DraIssue, IssueSummary | Assurance issues with severity and class |
| `proof-receipts.ts` | ProofReceipt, StageRecord | Frozen evaluation record per DRA-001 §8 |
| `evaluation.ts` | EvaluationRequest, EvaluationResult, ConfidenceIndicator | Complete evaluation input/output structures |
| `invariants.ts` | Invariant check functions | Cross-entity consistency checks |

---

## Exact Canonical Literals

### Assurance Decisions (DRA-001 §7) — exactly three
```
SUPPORTED
REVIEW
HOLD
```

### Issue Classes (DRA-001 §6) — exactly nine
| Code | Literal |
|---|---|
| IC-1 | UNSUPPORTED_CLAIM |
| IC-2 | AUTHORITY_EXPIRED |
| IC-3 | AUTHORITY_ABSENT |
| IC-4 | EVIDENCE_ABSENT |
| IC-5 | EVIDENCE_INADEQUATE |
| IC-6 | EVIDENCE_CONFLICT |
| IC-7 | CLAIM_INCONSISTENCY |
| IC-8 | TRACEABILITY_BROKEN |
| IC-9 | SCOPE_VIOLATION |

### Pipeline Stages (DRA-001 §5) — exactly seven, in frozen order
| # | Name |
|---|---|
| 1 | Input Normalisation |
| 2 | Claim Extraction |
| 3 | Authority Resolution |
| 4 | Evidence Linkage |
| 5 | Consistency Check |
| 6 | Confidence Scoring |
| 7 | Decision and Receipt |

---

## Validation Approach

- **Zod v3** is used for all runtime schema validation.
- Branded identifier types enforce cross-entity type safety at compile time.
- Validation helpers (`validateSourceDocument`, `validateEvaluationRequest`, etc.) return `SafeParseReturnType` from Zod.
- Invariant-check functions return `DraValidationResult` (either `{ ok: true }` or `{ ok: false, errors: DraValidationError[] }`).

### Validation error structure
```typescript
interface DraValidationError {
  code: DraErrorCode;   // e.g. "DRA_EMPTY_IDENTIFIER"
  path: string;         // e.g. "issues[0].issueClass"
  message: string;      // human-readable
  received?: unknown;   // actual value (no secrets)
}
```

---

## Invariants

| ID | Description |
|---|---|
| INV-001 | All identifiers within a collection are unique |
| INV-002 | All referenced statement IDs exist |
| INV-003 | All referenced evidence unit IDs exist |
| INV-004 | All issue references resolve |
| INV-005 | All proof-receipt references resolve |
| INV-006 | Pipeline stage records are unique, ordered, and complete (exactly 7) |
| INV-007 | Exactly nine canonical issue classes exist |
| INV-008 | Exactly three canonical decisions exist |
| INV-009 | Timestamps are valid ISO-8601 UTC and logically ordered where required |
| INV-010 | Schema version values are recognised |
| INV-011 | Stage record names match their stage numbers |
| INV-013 | Evaluation input/output identities are internally consistent |

---

## Package Exports

The public surface is exported from `src/model/index.ts` and re-exported from `src/index.ts`:

- All canonical constants
- All TypeScript types (inferred from schemas)
- All Zod schemas
- Validation helpers (per entity)
- Invariant-check functions
- `DraValidationError`, `DraValidationResult`, `DRA_ERROR_CODES`

**Not exported:**
- Evaluator functions
- Pipeline stage execution
- Decision calculation from document content
- Stub evaluation outputs

---

## Explicit Exclusions

This module does not implement:
- Document parsing, PDF parsing, OCR, text segmentation
- Material-statement extraction, AI model calls
- Evidence retrieval, mapping, or comparison
- Factuality checking, contradiction detection, omission detection
- Issue detection or classification logic
- Severity calculation, assurance checks, decision calculation
- Pipeline execution, proof-receipt generation
- Cryptographic signing, benchmark execution
- APIs, database storage, enterprise integrations, UI features

---

## Known Limitations

1. **Confidence indicator levels** (HIGH/MEDIUM/LOW) are not enumerated in DRA-001 §5. These values are defined as a minimum reasonable set. See AMBIGUITY-001 in DRA-ENG-002R.

2. **Stage output shapes** are typed as `Record<string, unknown>` at this milestone. Specific shapes are defined at DRA-ENG-003 through DRA-ENG-009.

3. **Schema version 0.1.0** is the only recognised version. New versions require explicit programme specification update.

4. **Reference implementation only.** Not evaluated for production performance, concurrency, or security.

---

## Relationship to Future Evaluator Milestones

| Milestone | Dependency on this model |
|---|---|
| DRA-ENG-003 | Stage 1 implementation uses `SourceDocument`, `GeneratedDocument`, `NormalisedDocument` (defined at DRA-ENG-003) |
| DRA-ENG-004 | Stage 2 uses `MaterialStatement`, `StatementId` |
| DRA-ENG-005 | Stage 3 uses `SourceDocument`, authority fields |
| DRA-ENG-006 | Stage 4 uses `EvidenceUnit`, `EvidenceRelationship` |
| DRA-ENG-007 | Stage 5 uses `DraIssue` (IC-6, IC-7) |
| DRA-ENG-008 | Stage 6 uses `ConfidenceIndicator` |
| DRA-ENG-009 | Stage 7 uses `ProofReceipt`, `AssuranceDecision` |
| DRA-ENG-010 | Evaluator integration uses `EvaluationRequest`, `EvaluationResult` |
| DRA-ENG-011 | Public API freeze — no new types added, surface frozen |

---

*Established at DRA-ENG-002 — Canonical Data Model.*
