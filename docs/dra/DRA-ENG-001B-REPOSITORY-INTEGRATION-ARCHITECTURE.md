# DRA-ENG-001B — Repository Integration Architecture

**Document identifier:** DRA-ENG-001B  
**Milestone:** DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline  
**Status:** COMPLETE  
**Date:** 2026-07-26 (UTC)  
**Programme:** DRA-001 — Document Release Assurance, Version 1

---

## 1. Module Structure

The DRA reference evaluator is implemented as the workspace package `@workspace/dra-reference` at `lib/dra-reference/`.

### 1.1 Directory layout

```
lib/dra-reference/
├── package.json              Package manifest: @workspace/dra-reference v0.1.0
├── tsconfig.json             TypeScript config (extends tsconfig.base.json)
├── vitest.config.ts          Test configuration
└── src/
    ├── index.ts              Public API entry point
    ├── types/                Canonical DRA type definitions (DRA-ENG-002)
    │   └── README.md         Placeholder — types defined at DRA-ENG-002
    ├── pipeline/             Seven-stage evaluator pipeline (DRA-ENG-003–009)
    │   └── README.md         Placeholder — stages implemented DRA-ENG-003–009
    ├── fixtures/             Evaluation fixtures and benchmark corpus
    │   └── README.md         Placeholder — fixtures added DRA-ENG-012–017
    └── tests/                Test suite
        └── dra.scaffold.test.ts   Baseline scaffold integration test
```

### 1.2 Source locations

| DRA component | Location | Milestone |
|---|---|---|
| Public entry point | `lib/dra-reference/src/index.ts` | DRA-ENG-001 (scaffold) |
| Canonical types | `lib/dra-reference/src/types/` | DRA-ENG-002 |
| Stage 1: Input Normalisation | `lib/dra-reference/src/pipeline/stage1-normalise.ts` | DRA-ENG-003 |
| Stage 2: Claim Extraction | `lib/dra-reference/src/pipeline/stage2-claims.ts` | DRA-ENG-004 |
| Stage 3: Authority Resolution | `lib/dra-reference/src/pipeline/stage3-authority.ts` | DRA-ENG-005 |
| Stage 4: Evidence Linkage | `lib/dra-reference/src/pipeline/stage4-evidence.ts` | DRA-ENG-006 |
| Stage 5: Consistency Check | `lib/dra-reference/src/pipeline/stage5-consistency.ts` | DRA-ENG-007 |
| Stage 6: Confidence Scoring | `lib/dra-reference/src/pipeline/stage6-confidence.ts` | DRA-ENG-008 |
| Stage 7: Decision and Receipt | `lib/dra-reference/src/pipeline/stage7-decision.ts` | DRA-ENG-009 |
| Evaluator integration | `lib/dra-reference/src/pipeline/evaluator.ts` | DRA-ENG-010 |

### 1.3 Test locations

| Test scope | Location | Milestone |
|---|---|---|
| Scaffold baseline | `lib/dra-reference/src/tests/dra.scaffold.test.ts` | DRA-ENG-001 |
| Component (per stage) | `lib/dra-reference/src/tests/stage*.test.ts` | DRA-ENG-012 |
| Integration | `lib/dra-reference/src/tests/integration.test.ts` | DRA-ENG-013 |
| End-to-end | `lib/dra-reference/src/tests/e2e.test.ts` | DRA-ENG-014 |
| Regression suite | All of the above | DRA-ENG-015 |

### 1.4 Fixture locations

| Fixture type | Location | Milestone |
|---|---|---|
| Component test fixtures | `lib/dra-reference/src/fixtures/unit/` | DRA-ENG-012 |
| End-to-end document fixtures | `lib/dra-reference/src/fixtures/documents/` | DRA-ENG-014 |
| Benchmark corpus documents | `lib/dra-reference/src/fixtures/benchmark/` | DRA-ENG-016 |

### 1.5 Engineering evidence locations

| Evidence type | Location |
|---|---|
| Milestone reports | `docs/dra/DRA-ENG-*.md` |
| Benchmark comparison workbooks | `docs/dra/benchmark/` (created at DRA-ENG-017) |
| Frozen proof receipts | `docs/dra/receipts/` (created at DRA-ENG-017) |

---

## 2. Dependency Boundaries

### 2.1 Permitted dependency directions

```
lib/dra-reference  →  (no workspace dependencies at baseline)
lib/dra-reference  →  @workspace/db           (if proof receipts require persistence — assess at DRA-ENG-009)
lib/dra-reference  →  zod                     (for document input validation schemas — assess at DRA-ENG-002)
artifacts/research-workspace  →  lib/dra-reference   (for future DRA UI integration)
artifacts/api-server          →  lib/dra-reference   (for future DRA API endpoint — Version 2 deferred)
```

### 2.2 Prohibited dependency directions

The following dependency directions are **strictly prohibited**:

```
lib/dra-reference  →  cts-reference           PROHIBITED — DRA must not import CTS evaluator internals
cts-reference      →  lib/dra-reference       PROHIBITED — CTS is frozen; no new dependencies permitted
lib/dra-reference  →  artifacts/*             PROHIBITED — lib packages must not depend on artifacts
lib/dra-reference  →  lib/api-client-react    PROHIBITED — UI client has no role in evaluator logic
```

**Rationale for CTS boundary:** DRA may reference CTS v0.1 as its scientific foundation in documentation and specification. DRA must not import, extend, or reuse CTS evaluator source code as implementation logic in `lib/dra-reference/src/`. This boundary must hold unless a future DRA-001 specification update explicitly authorises a specific CTS import and a corresponding milestone is defined.

### 2.3 How to verify the boundary at each milestone

```bash
# Confirm dra-reference has no dependency on cts-reference
grep -r "cts-reference\|from.*cts" lib/dra-reference/src/ --include="*.ts"
# Expected: zero results
```

---

## 3. CTS Boundary Protections

The following CTS components are frozen and must not be modified during any DRA milestone:

| Component | Location | Protection |
|---|---|---|
| CTS evaluator source | `cts-reference/src/` | Zero-diff required at every milestone completion |
| CTS Type Kernel | `cts-reference/src/types/` | 293 regression tests must continue to pass |
| CTS public API | `cts-reference/src/index.ts` | API surface must not change |
| CTS test fixtures | `cts-reference/src/fixtures/` | Existing fixture outputs must not change |
| CTS frozen experiments | `research-artifacts/EXP-*/` | Git diff must be zero |
| CTS v0.1 manuscript | `docs/publication/CTS_V0.1_EXECUTIVE_TECHNICAL_OVERVIEW.md` | Git diff must be zero |
| CTS publication release | `release/` | Git diff must be zero |

**Mandatory check at every DRA milestone:**

```bash
cd cts-reference && pnpm build && pnpm test
# Required: 293 passed, 0 failed

git diff HEAD -- cts-reference/ docs/publication/ research-artifacts/ release/
# Required: 0 lines
```

---

## 4. Anticipated Future Evaluator Entry Point

At DRA-ENG-010 (Evaluator Integration), the public entry point will be:

```typescript
// lib/dra-reference/src/index.ts (anticipated — not yet implemented)
export function evaluateDocument(input: DraDocumentInput): ProofReceipt { ... }
```

Where:
- `DraDocumentInput` — defined at DRA-ENG-002
- `ProofReceipt` — defined at DRA-ENG-002, fully populated at DRA-ENG-009
- The function executes Stages 1–7 in fixed order

The entry point must be the only public API surface. Internal pipeline stages are not part of the public API and must not be exported directly.

---

## 5. Anticipated Future Public Interfaces (not yet implemented)

The following interfaces are anticipated based on DRA-001 §§5–8. They are listed here for architectural planning only. **None are implemented at this milestone.**

```typescript
// Stage inputs / outputs
interface NormalisedDocument { ... }     // Stage 1 output
interface Claim { ... }                  // Stage 2 output element
interface AuthorityReference { ... }     // Stage 3 input
interface EvidenceReference { ... }      // Stage 4 input
interface ConfidenceIndicator { ... }    // Stage 6 output

// Issue classification
type DraIssueClass =
  | "IC-1_UNSUPPORTED_CLAIM"
  | "IC-2_AUTHORITY_EXPIRED"
  | "IC-3_AUTHORITY_ABSENT"
  | "IC-4_EVIDENCE_ABSENT"
  | "IC-5_EVIDENCE_INADEQUATE"
  | "IC-6_EVIDENCE_CONFLICT"
  | "IC-7_CLAIM_INCONSISTENCY"
  | "IC-8_TRACEABILITY_BROKEN"
  | "IC-9_SCOPE_VIOLATION";

// Assurance decision
type AssuranceDecision = "SUPPORTED" | "REVIEW" | "HOLD";

// Proof receipt
interface ProofReceipt {
  documentIdentity: DocumentIdentity;
  evaluatorIdentity: EvaluatorIdentity;
  stageOutputs: StageOutput[];
  issueRegister: DraIssue[];
  decision: AssuranceDecision;
  decisionRationale: string;
  timestamp: string;       // UTC ISO-8601
  receiptId: string;       // Unique identifier
}
```

These interfaces will be finalised at DRA-ENG-002 (Canonical Data Model). They may change before that milestone.

---

## 6. How DRA Evaluation Results Remain Distinguishable from CTS Results

DRA and CTS produce structurally different outputs:

| Dimension | CTS output | DRA output |
|---|---|---|
| Programme | `cts-reference` (v0.1.4) | `@workspace/dra-reference` (v0.1.x) |
| Package | `cts-reference` | `@workspace/dra-reference` |
| Result type | `CtsEvaluationResult` | `ProofReceipt` |
| Decision values | `FULLY_COVERED` / `PARTIALLY_COVERED` / `NOT_COVERED` | `SUPPORTED` / `REVIEW` / `HOLD` |
| Domain | Consequential state transitions | AI-generated document assurance |
| Receipt identifier | None (CTS has no receipt) | `receiptId` — unique per evaluation |
| Issue classification | Obstruction classes | Nine DRA issue classes (IC-1 to IC-9) |

The `ProofReceipt.evaluatorIdentity` field will record the DRA evaluator version and commit, making every receipt unambiguously identifiable as a DRA output.

---

## 7. Validation Workflow

The following commands constitute the DRA validation workflow. They must be run and recorded at every milestone:

```bash
# 1. CTS evaluator regression guard
cd cts-reference && pnpm build && pnpm test
# Required: build clean, 293 passed, 0 failed

# 2. Frozen artefact integrity
git diff HEAD -- cts-reference/ docs/publication/ research-artifacts/ release/
# Required: 0 lines

# 3. DRA package typecheck
cd lib/dra-reference && pnpm typecheck
# Required: 0 errors

# 4. DRA tests
cd lib/dra-reference && pnpm test
# Required: all tests pass, 0 failed

# 5. Workspace typecheck (all packages)
pnpm run typecheck
# Required: 0 errors across all packages

# 6. Research workspace tests (ContinuityOS regression)
cd artifacts/research-workspace && pnpm test
# Required: 2030 passed, 0 failed (baseline; count grows as DRA UI added)
```

---

*Produced at DRA-ENG-001 — Existing Repository Assessment and Engineering Baseline.*
