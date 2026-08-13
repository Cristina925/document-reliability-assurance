# DRA-001-05A — Minimum Evaluator Version 1

**Completion Report**

---

## 1. Files Created

This milestone formalises the evaluator already implemented across
DRA-ENG-002 through DRA-ENG-010 and hardened at DRA-ENG-008B as
**Minimum Evaluator Version 1**. No evaluator source files were created
at 05A time; all listed files were authored at the milestones shown.

| File | Milestone | Description |
|------|-----------|-------------|
| `src/model/decisions.ts` | DRA-ENG-002 | Three frozen assurance decisions |
| `src/model/issue-classes.ts` | DRA-ENG-002 | Nine frozen issue classes (IC-1 … IC-9) |
| `src/model/issues.ts` | DRA-ENG-002 | `DraIssue` schema and `IssueSummary` |
| `src/model/proof-receipts.ts` | DRA-ENG-002 | `ProofReceipt`, `StageRecord`, `DocumentIdentity`, `EvaluatorIdentity` |
| `src/model/evaluation.ts` | DRA-ENG-002 | `EvaluationRequest`, `EvaluationResult` |
| `src/model/versions.ts` | DRA-ENG-002 | `DRA_MODEL_VERSION`, `DRA_PIPELINE_VERSION`, `SchemaVersionSchema` |
| `src/model/pipeline-stages.ts` | DRA-ENG-002 | Seven frozen stage names, metadata, count |
| `src/normalisation/` | DRA-ENG-003 | Stage 1 — Input Normalisation |
| `src/claim-extraction/` | DRA-ENG-004 | Stage 2 — Claim Extraction |
| `src/authority-resolution/` | DRA-ENG-005 | Stage 3 — Authority Resolution |
| `src/evidence-linkage/` | DRA-ENG-006 | Stage 4 — Evidence Linkage |
| `src/materiality-assessment/` | DRA-ENG-007 | Stage 5\* — Materiality Assessment (extra stage) |
| `src/consistency-check/` | DRA-ENG-008 | Stage 6 / spec Stage 5 — Consistency Check |
| `src/confidence-scoring/` | DRA-ENG-008 | Stage 7 / spec Stage 6 — Confidence Scoring |
| `src/pipeline/evaluate-document.ts` | DRA-ENG-010 | `evaluateDocument()` — top-level entry point |
| `src/pipeline/derive-decision.ts` | DRA-ENG-009 | `deriveDecision()` — deterministic decision engine |
| `src/pipeline/build-proof-receipt.ts` | DRA-ENG-009 | `buildProofReceipt()` — receipt builder |
| `src/pipeline/canonical-serialise.ts` | DRA-ENG-008B | `computeDigestFromPayload()`, `verifyReceiptIntegrity()` |
| `src/pipeline/evaluation-result.ts` | DRA-ENG-010 | `DocumentAssuranceEvaluation` discriminated union |
| `src/index.ts` | DRA-ENG-002 | Package public surface |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | Added 05A entry, marked complete |

---

## 3. Evaluator Architecture

The evaluator is a **stateless, deterministic, single-pass pipeline**.
It accepts an `unknown` input, validates and normalises it through Stage 1,
propagates the structured request through six further stages, and returns a
fully-typed `DocumentAssuranceEvaluation` (success or failure) that always
includes a decision and a sealed proof receipt.

```
evaluateDocument(input: unknown): DocumentAssuranceEvaluation
                 │
    ┌────────────▼────────────┐
    │ Stage 1: Input          │  normaliseEvaluationRequest()
    │ Normalisation           │  validates structure, normalises strings,
    │                         │  produces NormalisedEvaluationRequest
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 2: Claim          │  extractClaims()
    │ Extraction              │  segments content, classifies segments,
    │                         │  emits MaterialStatements (MS-NNNN IDs)
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 3: Authority      │  resolveAuthority()
    │ Resolution              │  detects attribution patterns, classifies
    │                         │  authority types, builds AuthorityRecords
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 4: Evidence       │  linkEvidence()
    │ Linkage                 │  applies 5 linkage rules, builds EvidenceRecords,
    │                         │  classifies evidence relationships
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 5*: Materiality   │  assessMateriality()  [extra stage — not in
    │ Assessment              │  spec §5 seven-stage list; embedded in
    │                         │  Evidence Linkage stage record in receipt]
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 6 / Spec 5:       │  checkConsistency()
    │ Consistency Check       │  applies 9 issue-detection rules, emits
    │                         │  DraIssues (BLOCKING or ADVISORY)
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Stage 7 / Spec 6:       │  scoreConfidence()
    │ Confidence Scoring      │  per-claim confidence classification
    │                         │  (HIGH / MEDIUM / LOW)
    └────────────┬────────────┘
    ┌────────────▼────────────┐
    │ Spec Stage 7:           │  deriveDecision() + buildProofReceipt()
    │ Decision and Receipt    │  deterministic decision; frozen receipt with
    │                         │  SHA-256 substantive integrity digest
    └─────────────────────────┘
```

**Invariants:**

- `evaluateDocument` never throws. Stage failures return `DocumentAssuranceFailure`.
- All stages execute in fixed order; a stage failure stops the pipeline.
- The proof receipt contains **exactly 7 `StageRecord` entries** (frozen spec §5).
- The only impure aspect is the `evaluatedAt` timestamp (derived from
  `Date.now()` at call time). All other outputs are deterministic.

---

## 4. Seven-Stage Pipeline Implementation

The proof receipt exposes **exactly seven stage records** (per spec §5). The
implementation has an extra Materiality Assessment stage (our Stage 5) whose
output is embedded within the "Evidence Linkage" stage record:

| Spec Stage | Receipt `stageNumber` | Receipt `stageName` | Implementation module |
|-----------|----------------------|--------------------|-----------------------|
| 1 | 1 | Input Normalisation | `src/normalisation/` |
| 2 | 2 | Claim Extraction | `src/claim-extraction/` |
| 3 | 3 | Authority Resolution | `src/authority-resolution/` |
| 4 | 4 | Evidence Linkage | `src/evidence-linkage/` (+ embedded materiality) |
| 5 | 5 | Consistency Check | `src/consistency-check/` |
| 6 | 6 | Confidence Scoring | `src/confidence-scoring/` |
| 7 | 7 | Decision and Receipt | `src/pipeline/derive-decision.ts` + `build-proof-receipt.ts` |

### Stage 1 — Input Normalisation

Validates the raw input against `EvaluationRequestSchema` (Zod), then
normalises all string fields (line endings, whitespace, encoding). Produces a
`NormalisedEvaluationRequest` and a `NormalisationRecord` capturing entity
counts. Generates a `NormalisedGeneratedDocument` and zero or more
`NormalisedSourceDocument` entries.

### Stage 2 — Claim Extraction

Segments the generated document content into candidate segments using a
rule-based segmenter. Classifies each segment via `classifySegments()`.
Material segments become `MaterialStatement` objects with `MS-NNNN` identifiers.
Immaterial segments are recorded in rejection records with typed `ExclusionReason`
values. Assigns an `evaluationId` derived from the request identifier.

### Stage 3 — Authority Resolution

Applies four attribution detection rules (`detectAttribution()`) against each
statement's content span. Classifies each detected attribution by authority
type (`REGULATORY`, `STANDARD`, `TECHNICAL`, `ORGANISATIONAL`). Emits
`AuthorityRecord` objects with `AR-NNNN` identifiers and an authority
classification (`AUTHORITATIVE`, `ADVISORY`, `INCONCLUSIVE`).

### Stage 4 — Evidence Linkage

Applies five linkage rules (`STANDARD_RE`, `REGULATION_RE`, `DATE_RE`,
`SECTION_REF_RE`, `FOOTNOTE_RE`) against each statement span. Classifies
evidence relationships by type (`DIRECT`, `INDIRECT`, `INFERRED`). Emits
`EvidenceRecord` objects with `EV-NNNN` identifiers and classification
(`ADEQUATE`, `PARTIAL`, `ABSENT`).

### Stage 5\* — Materiality Assessment (extra stage)

Applies a 27-rule engine (`classifyMateriality()`) to every statement,
assigning a materiality classification (`HIGH`, `MEDIUM`, `LOW`, `NONE`).
Produces a `Stage5AssessmentRecord` with per-classification counts. Output is
embedded in the Evidence Linkage stage record within the proof receipt to
preserve the seven-record structure.

### Stage 6 / Spec Stage 5 — Consistency Check

Applies the issue-detection rule set against the accumulated pipeline outputs
from Stages 2–5. Emits `DraIssue` objects for each triggered issue class.
Issues are categorised as `BLOCKING` (→ HOLD) or `ADVISORY` (→ REVIEW). The
set of detected issues is the direct input to the decision engine.

### Stage 7 / Spec Stage 6 — Confidence Scoring

Applies confidence-scoring rules per statement, producing per-claim
`ConfidenceRecord` objects classified as `HIGH`, `MEDIUM`, or `LOW`. Level
counts are included in the stage record. Confidence classification does not
affect the assurance decision in Version 1; it informs human reviewers.

### Spec Stage 7 — Decision and Receipt

`deriveDecision()` maps the issue list to one of three decisions (pure,
synchronous, deterministic). `buildProofReceipt()` assembles the frozen
`ProofReceipt` with a SHA-256 substantive integrity digest computed by
`computeDigestFromPayload()`.

---

## 5. Evaluation Model

All evaluation objects are immutable plain-object structures validated by Zod
schemas. The proof receipt is explicitly frozen with `Object.freeze()`.

| Type | Source | Description |
|------|--------|-------------|
| `EvaluationRequest` | `src/model/evaluation.ts` | Canonical input — request id, generated document, source documents, timestamp |
| `EvaluationResult` | `src/model/evaluation.ts` | Full evaluation output schema with 7 stage records, issues, decision, proof receipt |
| `DraIssue` | `src/model/issues.ts` | Single assurance issue — class, severity, affected statements/evidence, explanation |
| `IssueSummary` | `src/model/issues.ts` | Counts: total, blocking, advisory |
| `ProofReceipt` | `src/model/proof-receipts.ts` | Frozen, sealed receipt with integrity digest |
| `StageRecord` | `src/model/proof-receipts.ts` | One stage's output within the proof receipt |
| `DocumentIdentity` | `src/model/proof-receipts.ts` | Evaluated document snapshot (id, title, evaluatedAt) |
| `EvaluatorIdentity` | `src/model/proof-receipts.ts` | Evaluator version and pipeline version |
| `AssuranceDecision` | `src/model/decisions.ts` | `"SUPPORTED" \| "REVIEW" \| "HOLD"` |
| `DocumentAssuranceEvaluation` | `src/pipeline/evaluation-result.ts` | Top-level discriminated union returned by `evaluateDocument` |
| `DocumentAssuranceSuccess` | `src/pipeline/evaluation-result.ts` | All stages completed |
| `DocumentAssuranceFailure` | `src/pipeline/evaluation-result.ts` | A stage failed |
| `DecisionResult` | `src/pipeline/derive-decision.ts` | `{ decision, rationale }` |

---

## 6. Issue Taxonomy

Exactly nine issue classes, frozen in DRA-001 §6. No class may be added,
removed, renamed, or redefined in Version 1.

| IC-N | Literal | Severity trigger | Detecting stage |
|------|---------|-----------------|-----------------|
| IC-1 | `UNSUPPORTED_CLAIM` | BLOCKING | Consistency Check |
| IC-2 | `AUTHORITY_EXPIRED` | ADVISORY | Consistency Check |
| IC-3 | `AUTHORITY_ABSENT` | BLOCKING | Consistency Check |
| IC-4 | `EVIDENCE_ABSENT` | BLOCKING | Consistency Check |
| IC-5 | `EVIDENCE_INADEQUATE` | ADVISORY | Consistency Check |
| IC-6 | `EVIDENCE_CONFLICT` | ADVISORY | Consistency Check |
| IC-7 | `CLAIM_INCONSISTENCY` | BLOCKING | Consistency Check |
| IC-8 | `TRACEABILITY_BROKEN` | ADVISORY | Consistency Check |
| IC-9 | `SCOPE_VIOLATION` | ADVISORY | Consistency Check |

Each `DraIssue` instance carries:

- `id` — unique issue identifier scoped to the evaluation
- `issueClass` — one of the nine canonical literals above
- `severity` — `BLOCKING` or `ADVISORY`
- `affectedStatementIds` — at least one `MS-NNNN` reference (cross-claim issues reference multiple)
- `affectedEvidenceUnitIds` — zero or more `EV-NNNN` references
- `explanation` — human-readable description of why the issue was triggered
- `stageAssociation` — the pipeline stage that detected the issue
- `metadata` — optional free-form stage-specific data

**Subsumption rule (IC-1):** `UNSUPPORTED_CLAIM` subsumes `EVIDENCE_ABSENT`
and `AUTHORITY_ABSENT` when all three would fire on the same statement, to
prevent duplicate BLOCKING issues for the same root cause.

**Extension:** New issue classes in a future version require only adding to
`ISSUE_CLASSES`, `ISSUE_CLASS_CODES`, and `ISSUE_CLASS_TO_CODE` in
`src/model/issue-classes.ts`. No other source file needs modification.
Existing behaviour is unaffected because the Zod schema derives from the
same authoritative tuple.

---

## 7. Decision Engine

`deriveDecision(issues: ReadonlyArray<DraIssue>): DecisionResult`

Pure function. No probabilistic logic, no AI inference, no external calls.

```
HOLD      → any issue with severity === "BLOCKING"
REVIEW    → no BLOCKING issues, but at least one issue with severity === "ADVISORY"
SUPPORTED → no issues of any severity
```

Decision rationale is a deterministic English string that names the IC-N
classes that triggered the decision. The rationale is included verbatim in
the proof receipt.

---

## 8. Proof Receipt Implementation

`buildProofReceipt(params: BuildReceiptParams): ProofReceipt`

The receipt is assembled from all eight stage results and frozen with
`Object.freeze()`. It satisfies all DRA-001 §8 mandatory fields:

| §8 Field | Receipt field | Value |
|----------|--------------|-------|
| §8.1 Document identity | `documentIdentity` | `{ generatedDocumentId, generatedDocumentTitle, evaluatedAt }` |
| §8.2 Evaluator identity | `evaluatorIdentity` | `{ evaluatorVersion: "0.1.0", pipelineVersion: "1.0" }` |
| §8.3 Stage outputs | `stageOutputs` | Array of exactly 7 `StageRecord` objects (stageNumber 1–7) |
| §8.4 Issue register | `issueRegister` | All `DraIssue` objects from Stage 6; empty when SUPPORTED |
| §8.5 Decision | `decision` | `"SUPPORTED" \| "REVIEW" \| "HOLD"` |
| §8.6 Decision rationale | `decisionRationale` | Deterministic English rationale string |
| §8.7 Timestamp | `timestamp` | UTC ISO-8601 with Z suffix |
| §8.8 Receipt identifier | `id` | `receipt-{evaluationId}` |

**Integrity digest — `substantiveDigest`:**

SHA-256 hex (64 characters) computed over the deterministic substantive payload
via `computeDigestFromPayload()`. The canonical payload includes:
`evaluationRequestId`, `evaluationResultId`, `schemaVersion`,
`documentIdentity.generatedDocumentId`, `documentIdentity.generatedDocumentTitle`,
`evaluatorIdentity`, `stageOutputs` (stage-number order),
`issueRegister` (sorted by id string), `issueSummary`, `decision`,
`decisionRationale`.

Excluded from the digest (operational metadata):
`id`, `timestamp`, `documentIdentity.evaluatedAt`, `substantiveDigest` itself.

**Verification:** `verifyReceiptIntegrity(receipt: ProofReceipt): boolean`
recomputes the digest and compares it to `substantiveDigest`.

---

## 9. Public API

```typescript
// Top-level entry point
import { evaluateDocument } from "@workspace/dra-reference";
const result = evaluateDocument(input: unknown);

// Discriminate on result.ok
if (result.ok) {
  result.decision;        // "SUPPORTED" | "REVIEW" | "HOLD"
  result.proofReceipt;    // ProofReceipt (frozen)
  result.issues;          // ReadonlyArray<DraIssue>
  result.decisionRationale;
  result.pipeline;        // all stage results
} else {
  result.failedAtStage;   // stage name string
  result.errors;          // ReadonlyArray<DraValidationError>
}

// Integrity verification
import { verifyReceiptIntegrity } from "@workspace/dra-reference";
verifyReceiptIntegrity(result.proofReceipt); // → boolean

// Canonical serialisation
import { canonicalJsonStringify, computeDigestFromPayload } from "@workspace/dra-reference";

// Decision derivation (standalone)
import { deriveDecision } from "@workspace/dra-reference";
```

The public API is intentionally minimal. `evaluateDocument` is the sole
entry point for evaluation. All other exports are available for consumers
who need to build on top of individual stages, but the guaranteed stable
surface for Version 1 callers is `evaluateDocument` and
`verifyReceiptIntegrity`.

---

## 10. Configuration Model

In Version 1, evaluator configuration is **compile-time constant** rather
than runtime-mutable. This is a deliberate design decision: the evaluator
is a reference implementation whose outputs must be reproducible across
invocations; runtime-mutable configuration would create undetectable
divergence between evaluation runs.

Version 1 configuration is expressed through frozen constants:

| Constant | Location | Value | What it configures |
|----------|----------|-------|--------------------|
| `DRA_MODEL_VERSION` | `src/model/versions.ts` | `"0.1.0"` | Schema/model version |
| `DRA_PIPELINE_VERSION` | `src/model/versions.ts` | `"1.0"` | Pipeline version |
| `ISSUE_CLASSES` | `src/model/issue-classes.ts` | nine literals | Enabled issue taxonomy |
| `ASSURANCE_DECISIONS` | `src/model/decisions.ts` | `["SUPPORTED","REVIEW","HOLD"]` | Decision outcomes |
| `PIPELINE_STAGES` | `src/model/pipeline-stages.ts` | seven names | Stage order |
| `PIPELINE_STAGE_COUNT` | `src/model/pipeline-stages.ts` | `7` | Stage count |

Severity thresholds are fixed per issue class in the detection rules in
`src/consistency-check/issue-detection.ts`. They are not runtime-configurable
in Version 1; changing a severity threshold requires a programme amendment.

Reporting options are determined by the caller: `DocumentAssuranceSuccess`
exposes the full pipeline, issue register, decision, rationale, and proof
receipt — callers select the subset they need.

---

## 11. Test Results

| Milestone | Tests added | Cumulative |
|-----------|-------------|------------|
| DRA-ENG-002 … DRA-ENG-008B | 1,747 | 1,747 |
| DRA-001-04A | 114 | 1,861 |
| DRA-001-04B | 144 | 2,005 |
| DRA-001-04C | 112 | 2,117 |
| DRA-001-05A | 0 (formalisation milestone) | **2,117** |

```
Test Files  72 passed (72)
     Tests  2117 passed (2117)
  Duration  ~7s
```

Tests covering every DRA-001-05A requirement area:

| Requirement | Test files |
|-------------|------------|
| Stage 1 — Input Normalisation | `__tests__/normalise-evaluation-request.test.ts` |
| Stage 2 — Claim Extraction | `__tests__/extract-claims.test.ts`, `segment-content.test.ts` |
| Stage 3 — Authority Resolution | `__tests__/resolve-authority.test.ts` |
| Stage 4 — Evidence Linkage | `__tests__/link-evidence.test.ts` |
| Stage 5\* — Materiality | `__tests__/assess-materiality.test.ts` |
| Stage 6 — Consistency / Issues | `__tests__/check-consistency.test.ts`, `issue-detection.test.ts` |
| Stage 7 — Confidence | `__tests__/score-confidence.test.ts` |
| Decision engine | `__tests__/derive-decision.test.ts` |
| Proof receipt | `__tests__/build-proof-receipt.test.ts`, `canonical-serialise.test.ts` |
| Full pipeline | `__tests__/evaluate-document.test.ts` |
| Invalid inputs | Covered in stage 1 and pipeline tests |
| Deterministic repeat | `__tests__/evaluate-document.test.ts` determinism section |
| Receipt integrity | `__tests__/canonical-serialise.test.ts` |
| Issue aggregation | `__tests__/check-consistency.test.ts` |
| Each decision outcome | `__tests__/derive-decision.test.ts`, `evaluate-document.test.ts` |

---

## 12. TypeScript Status

```
pnpm exec tsc --noEmit
(no output — zero errors)
```

---

## 13. Production Build Status

`pnpm -w run typecheck:libs` — zero errors across all library packages.

The workspace-level `pnpm -w run build` typecheck phase passes cleanly.

---

## 14. Benchmark Governance and Corpus Infrastructure — Unchanged

No files in the following modules were modified at DRA-001-05A:

- `src/benchmark/corpus/` — Corpus schema, manifest, registry, loader
- `src/benchmark/governance/` — Selection protocol, eligibility, allocation, admission, duplicate detection, freeze
- `src/benchmark/acquisition/` — Provenance, pipeline, candidate registry, corpus validator, reports

All 112 benchmark acquisition tests (DRA-001-04C) continue to pass. All
144 governance tests (DRA-001-04B) continue to pass. All 114 corpus schema
tests (DRA-001-04A) continue to pass.

The evaluator pipeline does not import from the benchmark module.
The benchmark module imports only `computeDigestFromPayload` from
`src/pipeline/canonical-serialise.ts` for provenance and corpus integrity
operations. This boundary is preserved.
