# DRA-VAL-001A — Scientific Validation Protocol and Benchmark Design

**Completion Report**

---

## 1. Files Created

### Protocol Documents (8 files)

| File | Description |
|------|-------------|
| `docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` | Scientific Validation Charter — primary research question, permitted outcomes, prohibited claims, independence requirements |
| `docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` | Benchmark Corpus Design Protocol — 120-document target, 9 domains, source-type ratios, acquisition and freeze rules |
| `docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md` | Reviewer Independence and Adjudication Protocol — blinding, COI, 2 reviewers per document, adjudication procedure |
| `docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md` | Issue Matching and Comparison Protocol — INSTANCE and CLASS analysis, pre-registered matching rules |
| `docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` | Statistical Analysis Plan — 12 pre-registered metrics, stratified analysis, confidence intervals, no arbitrary thresholds |
| `docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md` | Bias and Threats to Validity Register — 17 registered threats |
| `docs/dra/validation/DRA-VAL-001F-PROTOCOL-REGISTRATION.md` | Protocol Registration Record — freeze attestation template |
| `docs/dra/validation/DRA-VALIDATION-PROGRAMME-INDEX.md` | Validation Programme Index — 8-milestone planned sequence |

### Source Modules (11 files)

All under `src/benchmark/validation/`:

| File | Description |
|------|-------------|
| `identifiers.ts` | 9 identifier schemas (DRA-VAL-NNN, RQ-NNN, H-NNN, NH-NNN, MTR-NNN, MR-NNN, TVR-NNN, AMD-NNN, REG-NNN) |
| `research-questions.ts` | ResearchQuestion, Hypothesis, NullHypothesis, StudyObjective, PERMITTED_STUDY_OUTCOMES |
| `corpus-design.ts` | CorpusDesign, CorpusQuota, SourceTypeRatios, DifficultyStrata — with quota-sum and strata-sum invariants |
| `reviewer-protocol.ts` | ReviewerEligibility, ReviewerAssignmentRule, ReviewSubmissionPolicy, AdjudicationPolicy |
| `comparison-rules.ts` | IssueMatchingRule, ComparisonProtocol — INSTANCE and CLASS coverage requirements |
| `statistical-plan.ts` | StatisticalMetricDefinition, StatisticalAnalysisPlan — CI requirements, zero-denominator policy |
| `threats.ts` | ThreatToValidity, ThreatsRegister |
| `amendment.ts` | ProtocolAmendment, AmendmentLog — retrospective prohibition enforced |
| `registration.ts` | ProtocolRegistration — noResultsInspected literal, digest coverage requirement |
| `protocol.ts` | ValidationProtocol (top-level), computeValidationProtocolDigest, verifyProtocolIntegrity, validateProtocolForFreeze, freezeProtocol |
| `index.ts` | Public module surface |

### Test Files (9 files)

All under `src/benchmark/validation/__tests__/`:

| File | Tests |
|------|-------|
| `identifiers.test.ts` | 30 |
| `corpus-design.test.ts` | 22 |
| `reviewer-protocol.test.ts` | 30 |
| `comparison-rules.test.ts` | 22 |
| `statistical-plan.test.ts` | 20 |
| `threats.test.ts` | 22 |
| `amendment.test.ts` | 18 |
| `registration.test.ts` | 21 |
| `protocol.test.ts` | 45 |
| **Total** | **170** |

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/benchmark/index.ts` | Added `export * from "./validation/index.js"` |
| `docs/dra/DRA-001-PROGRAMME-INDEX.md` | (updated separately in DRA-001-07 report) |

---

## 3. Protocol Documents Produced

### Scientific Validation Charter

- **Primary research question:** *To what extent does the frozen Document Release Assurance Version 1 evaluator identify material document-release issues found by independent human reviewers across a predefined, heterogeneous benchmark corpus?*
- **Secondary research questions:** 5 defined (RQ-002 through RQ-006)
- **Study objectives:** 7 defined
- **Hypotheses:** H-001 (primary), H-002
- **Null hypotheses:** NH-001 (primary), NH-002
- **Permitted outcomes:** SUPPORTED, PARTIALLY_SUPPORTED, INCONCLUSIVE, NOT_SUPPORTED — all explicitly accommodated
- **Intended claims:** 4 (IC-1 through IC-4) — all qualified with confidence intervals
- **Prohibited claims:** 6 (PC-1 through PC-6) — including explicit prohibition on citing DRA-001-07 engineering fixtures as scientific evidence
- **Evaluation boundaries:** 6 (EB-1 through EB-6)
- **Separation of engineering and scientific validation:** Explicit; engineering fixtures may not be represented as independent scientific evidence

### Benchmark Corpus Design Protocol

| Corpus stage | Size | Purpose |
|-------------|------|---------|
| Pilot | 20 documents | Procedural dry-run, sample-size assessment |
| Minimum scientific | 60 documents | Smallest defensible corpus |
| Target | 120 documents | Full stratified corpus |

**Domain allocation (120-document target):**

| Domain | Target |
|--------|--------|
| Legal and regulatory | 15 |
| Healthcare and life sciences | 15 |
| Finance and accounting | 15 |
| Cybersecurity and technical assurance | 15 |
| Business and executive reporting | 15 |
| Procurement and third-party risk | 15 |
| HR and workplace policy | 10 |
| Public policy and governance | 10 |
| General operational documents | 10 |

Source-type allocation: ~⅓ AI-generated, ~⅓ human-authored, ~⅓ hybrid. Difficulty: equal thirds (40 each at LOW/MEDIUM/HIGH). Document length: SHORT 30, MEDIUM 60, LONG 30. Inclusion criteria: 8. Exclusion criteria: 8.

### Reviewer Independence Protocol

- 2 independent reviewers per document (minimum, enforced by schema)
- Blinding to evaluator output: mandatory (schema literal `true`)
- Pre-submission coordination: prohibited (schema literal `true`)
- COI declaration: mandatory (schema literal `true`)
- Adjudication: mandatory for material disagreements (schema literal `true`)
- Reference standard term: **adjudicated human reference standard** (enforced as a schema literal — not "ground truth")
- Reviewer submission: issue log + severity + issue class + release recommendation + uncertainty level

### Comparison Protocol (pre-registered matching rules)

Two required analysis levels: INSTANCE (individual issue instances) and CLASS (issue class per document). Both enforced by schema. Four required dispositions: AGREED, EVALUATOR_ONLY, REVIEWER_ONLY, PARTIAL_MATCH. Freeze-before-unsealing requirement recorded.

### Statistical Analysis Plan

**Primary metrics (MTR-001 through MTR-008):**
- Issue-instance recall, precision, F1 (INSTANCE granularity)
- Issue-class recall, precision (CLASS granularity)
- Document-level decision agreement (DOCUMENT granularity)
- Evaluator FP count, FN count (CORPUS granularity)

**Reviewer reliability metrics (MTR-009 through MTR-012):**
- Reviewer issue-class agreement rate
- Reviewer decision agreement rate
- Cohen's kappa for document-level decisions
- Adjudication rate

**Strata:** domain, source type, difficulty, document length, issue class, reviewer expertise, clean vs issue-bearing.

**Key requirements enforced by schema:**
- `confidenceIntervalRequired: true` (schema literal) — all metrics
- `zeroDenominatorPolicy` non-empty — all metrics
- `noArbitrarySuccessThreshold: true` (schema literal) — plan level
- No stratum with fewer than 10 documents is interpreted directionally

### Threats to Validity Register

**17 registered threats** covering:

| Category | Threats |
|----------|---------|
| Developer bias | TVR-001 (evaluator), TVR-002 (corpus) |
| Corpus composition | TVR-003 (synthetic), TVR-005 (domain imbalance), TVR-006 (low prevalence), TVR-007 (high prevalence), TVR-017 (public docs) |
| Reviewer integrity | TVR-004 (selection), TVR-008 (disagreement), TVR-009 (adjudicator) |
| Analysis integrity | TVR-010 (taxonomy matching), TVR-012 (contamination), TVR-013 (source evidence), TVR-014 (simulated-review) |
| Evaluator integrity | TVR-011 (overfitting) |
| Study constraints | TVR-015 (small sample), TVR-016 (confidentiality) |

Status: 16 OPEN, 1 MITIGATED (TVR-014).

---

## 4. Machine-Readable Schemas Implemented

| Schema | Key invariants enforced at parse time |
|--------|--------------------------------------|
| `ValidationProtocolIdSchema` | DRA-VAL-NNN or DRA-VAL-NNNA format |
| `CorpusDesignSchema` | pilotSize < minimumViableSize < targetSize; quota sum = targetSize; strata sum = targetSize |
| `SourceTypeRatiosSchema` | aiGenerated + humanAuthored + hybrid = 1.0 (±0.01) |
| `ReviewerEligibilitySchema` | minimumReviewersPerDocument ≥ 2; blinding literal; coordination prohibition literal; COI literal |
| `ReviewerAssignmentRuleSchema` | allowSingleReviewer: literal false; allowReviewerAsAdjudicator: literal false |
| `ReviewSubmissionPolicySchema` | requireIndependentIssueRecording: literal true; requireReleaseRecommendation: literal true |
| `AdjudicationPolicySchema` | triggerOnMaterialDisagreement/adjudicatorMustBeIndependent/adjudicatorCannotBeOriginalReviewer: all literal true; referenceStandardTerm: literal "adjudicated human reference standard" |
| `ComparisonProtocolSchema` | ≥1 INSTANCE rule; ≥1 CLASS rule; AGREED/EVALUATOR_ONLY/REVIEWER_ONLY rules required; unique IDs |
| `StatisticalMetricDefinitionSchema` | confidenceIntervalRequired: literal true; zeroDenominatorPolicy non-empty |
| `StatisticalAnalysisPlanSchema` | ≥1 INSTANCE metric; ≥1 CLASS metric; ≥1 reviewer metric; noArbitrarySuccessThreshold: literal true; unique IDs |
| `ThreatToValiditySchema` | All 8 fields required; minimum text lengths enforced |
| `ThreatsRegisterSchema` | Non-empty; unique IDs |
| `ProtocolAmendmentSchema` | isProhibitedRetrospective: literal false; authorised reason required |
| `ProtocolRegistrationSchema` | noResultsInspected: literal true; filesIncluded ↔ integrityDigests coverage; 64-char digests |
| `ValidationProtocolSchema` | Exactly one primary RQ; ≥1 null hypothesis; frozenAt + integrityDigest required when FROZEN |
| `computeValidationProtocolDigest` | SHA-256 over substantive fields; excludes status, frozenAt, integrityDigest, amendments |
| `freezeProtocol` | Validates completeness; sets FROZEN status; does not mutate input |

---

## 5. Corpus Allocation Totals

| Dimension | Total |
|-----------|-------|
| Target corpus size | 120 documents |
| Minimum scientific corpus | 60 documents |
| Pilot corpus | 20 documents |
| Domains | 9 |
| Domain quota sum check | ✓ 120 |
| Difficulty strata sum check | ✓ 120 (40 + 40 + 40) |
| Source-type ratio sum check | ✓ 1.0 (±0.01) |

---

## 6. Reviewer Independence Safeguards

All enforced by schema literal constraints (cannot be disabled without schema change):

| Safeguard | Enforcement |
|-----------|------------|
| Minimum 2 reviewers per document | `minimumReviewersPerDocument ≥ 2` |
| Blinding to evaluator output | `blindedToEvaluatorOutput: literal true` |
| No pre-submission coordination | `prohibitCoordinationBeforeSubmission: literal true` |
| COI declarations required | `conflictOfInterestDeclarationRequired: literal true` |
| No reviewer serves as adjudicator | `allowReviewerAsAdjudicator: literal false` |
| Single-reviewer path blocked | `allowSingleReviewer: literal false` |
| Adjudicator must be independent | `adjudicatorMustBeIndependent: literal true` |
| No original reviewer as adjudicator | `adjudicatorCannotBeOriginalReviewer: literal true` |
| Adjudication for material disagreements | `triggerOnMaterialDisagreement: literal true` |
| Reference standard term | `referenceStandardTerm: literal "adjudicated human reference standard"` |
| Issue recording is independent | `requireIndependentIssueRecording: literal true` |
| Release recommendation required | `requireReleaseRecommendation: literal true` |

---

## 7. Frozen Comparison Rules

Pre-registered matching rules must be frozen before evaluator results are unsealed. The `ComparisonProtocol` schema enforces:
- At least one INSTANCE-level rule
- At least one CLASS-level rule
- Covering AGREED, EVALUATOR_ONLY, and REVIEWER_ONLY dispositions
- Unique rule identifiers (MR-NNN format)

Retrospective changes to matching rules are categorically prohibited by the `ProtocolAmendment` schema (`isProhibitedRetrospective: literal false`).

---

## 8. Statistical Methods

All 12 metrics pre-registered with:
- Explicit numerator and denominator
- Zero-denominator policy (required non-empty)
- 95% confidence interval method (Wilson score interval for proportions; bootstrap for F1)
- Granularity (INSTANCE, CLASS, DOCUMENT, REVIEWER, CORPUS)

Uncertainty reporting: every result must include numerator, denominator, point estimate, 95% CI, and N. Point estimates are never interpreted in isolation.

No arbitrary success thresholds: `noArbitrarySuccessThreshold: literal true` is enforced at the plan level.

Stratified analysis across 7 dimensions: domain, source type, difficulty, document length, issue class, reviewer expertise, clean vs issue-bearing.

---

## 9. Threats-to-Validity Count

**17 threats registered** (TVR-001 through TVR-017).

- HIGH likelihood: TVR-001 (founder bias), TVR-005 (domain imbalance), TVR-015 (small sample), TVR-017 (public docs)
- HIGH impact: TVR-001, TVR-002, TVR-008, TVR-011, TVR-012
- MITIGATED: TVR-014 (simulated-review contamination)
- OPEN: 16

---

## 10. Validation Results

```
pnpm exec tsc --noEmit   → 0 errors
pnpm run test            → 2,609 passed (2,609)   +170 new
```

| Test suite | Result |
|------------|--------|
| DRA-ENG-002 → DRA-ENG-010 (evaluator core) | ✅ |
| DRA-001-04A/B/C (corpus/governance/acquisition) | ✅ |
| DRA-001-06 (execution/comparison/metrics) | ✅ |
| DRA-001-07 (evidence programme) | ✅ |
| DRA-VAL-001A (validation protocol schemas) | ✅ 170 new tests |
| Evaluator semantics | **unchanged** |

Naming collision with `governance/schema.ts` (5 exports: `PROTOCOL_STATUSES`, `ProtocolStatus`, `ProtocolStatusSchema`, `VALID_PROTOCOL_TRANSITIONS`, `computeProtocolDigest`) was resolved by prefixing all validation-module equivalents with `VALIDATION_` or `Validation` (e.g. `VALIDATION_PROTOCOL_STATUSES`, `ValidationProtocolStatus`, `computeValidationProtocolDigest`).

---

## 11. Confirmation: No Benchmark Execution Occurred

**No scientific benchmark results were produced or inspected during this milestone.**

- The DRA evaluator was not executed against any scientific validation corpus document.
- No scientific reviewer submissions were collected or processed.
- No comparison, metric, or analysis result was produced from independent human review data.
- The DRA-001-07 engineering-validation fixtures (6 documents, 12 simulated submissions) were neither modified nor represented as scientific evidence.

---

## 12. Confirmation: No Evaluator Semantics Changed

No files in the following modules were modified:
- `src/pipeline/` — evaluateDocument, deriveDecision, buildProofReceipt
- `src/normalisation/` through `src/confidence-scoring/` — all 7 pipeline stages
- `src/model/` — all schemas and types (ProofReceipt, StageRecord, AssuranceDecision)
- `src/benchmark/corpus/`, `governance/`, `acquisition/`, `execution/`, `evidence/` — all prior benchmark modules

---

## 13. Next Milestone

**DRA-VAL-001B — Corpus Acquisition and Freeze**

Acquire 120 benchmark documents across 9 domains. Apply all inclusion, exclusion, deduplication, and contamination criteria defined in `DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md`. Assign difficulty strata. Freeze the corpus. Prerequisites: DRA-VAL-001A fully frozen (all 6 protocol documents registered with SHA-256 digests in `DRA-VAL-001F`).
