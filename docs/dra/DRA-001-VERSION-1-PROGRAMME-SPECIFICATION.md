# DRA-001 — Version 1 Programme Specification

**Document identifier:** DRA-001  
**Status:** HISTORICAL — SUPERSEDED AS PROGRAMME AUTHORITY  
**Version:** 1.0  
**Established:** DRA-001-CONS-001 (Programme Artefact Consolidation)  
**Scientific foundation:** CTS v0.1 Executive Technical Overview (source commit 17cb968)

---

## Governance notice (added by DRA-PUB-005, publication-governance closure)

DRA-001 records the founding Version 1 programme specification and is preserved as a historical research artefact. Subsequent robustness engineering, DRA-GC-1 freezing, blind generalisation testing, targeted validation, and publication synthesis materially evolved the implemented research system. DRA-001 is therefore not the normative description of the published DRA-GC-1 research state. No original scientific or programme content in this document has been retrospectively rewritten.

See `docs/dra/DRA-PUB-005-PUBLICATION-IDENTITY-GOVERNANCE.md` for the full governance record.

---

## 1. Problem Statement

AI-generated documents are produced without systematic assurance of their content properties. Existing engineering controls — linting, spell-check, formatting review, human sign-off — do not evaluate whether the claims within a document are supported by traceable evidence, whether the authorities cited are current and applicable, or whether the document is internally consistent.

The absence of structured assurance creates risk in consequential document contexts: technical specifications, compliance reports, regulatory submissions, audit outputs, and engineering evidence packages. A document may be syntactically correct and stylistically acceptable while containing claims that are unsubstantiated, authorities that have expired, or evidence that is internally contradictory.

DRA-001 addresses this gap by applying continuity-based assurance principles — established by CTS v0.1 — to the specific problem of AI-generated document evaluation.

---

## 2. Scientific Foundation

DRA-001 is an implementation programme. Its conceptual foundations are provided by CTS v0.1.

CTS v0.1 remains authoritative for:

- continuity-based assurance principles;
- authority and evidence concepts;
- assurance decision semantics;
- proof-oriented evaluation;
- engineering evidence discipline.

DRA-001 applies these concepts specifically to AI-generated document assurance. DRA-001 does not modify, extend, or supersede CTS v0.1. Where differences are identified between DRA-001 and CTS v0.1, CTS v0.1 remains authoritative unless a future published research programme explicitly revises those concepts.

**Normative reference:** CTS v0.1 Executive Technical Overview — source commit `17cb968`, publication release CTS-PUB-004C, commit `7af039c`.

---

## 3. Research Objective

Determine whether a structured, rule-based evaluator can produce consistent, traceable, and reproducible assurance assessments of AI-generated documents — specifically with respect to claim support, authority currency, evidence consistency, and internal coherence.

Version 1 does not seek to produce a production system. It seeks to produce a working reference evaluator and a verified experimental record sufficient to support or refute the assurance hypothesis.

---

## 4. Version 1 Scope

### 4.1 In scope

- Design and implementation of the DRA reference evaluator (seven-stage pipeline).
- Definition and implementation of the nine DRA issue classes.
- Implementation of SUPPORTED / REVIEW / HOLD decision semantics.
- Implementation of proof receipt requirements.
- Benchmark corpus construction (AI-generated documents, independently reviewed).
- End-to-end evaluation execution against the benchmark corpus.
- Experimental record: frozen inputs, frozen outputs, adjudication records.
- Evidence synthesis and programme closure report.

### 4.2 Explicitly deferred (Version 2 and beyond)

The following are outside Version 1 scope and must not be introduced during Version 1 engineering:

- Version 2 features of any kind;
- Additional issue classes beyond the nine frozen classes;
- Enterprise integrations (identity providers, document management systems, workflow platforms);
- Agent Action Assurance Core implementation;
- Additional assurance modules beyond document assurance;
- Production UI enhancements;
- Performance, concurrency, or failure-recovery hardening;
- Multi-tenant or multi-organisation deployment;
- External API productisation.

---

## 5. Frozen Seven-Stage Evaluator Pipeline

The DRA evaluator pipeline is frozen for Version 1. No stage may be added, removed, reordered, or redefined during engineering implementation.

| Stage | Name | Description |
|---|---|---|
| 1 | Input Normalisation | Parse and normalise the document into a canonical structured representation suitable for evaluation. |
| 2 | Claim Extraction | Identify and enumerate all evaluable claims within the document. A claim is any assertion of fact, specification, or requirement. |
| 3 | Authority Resolution | For each claim, identify the authority or authorities cited. Determine whether each authority is current, applicable, and properly cited. |
| 4 | Evidence Linkage | For each claim, identify the evidence cited in support. Determine whether evidence is present, traceable, and structurally adequate. |
| 5 | Consistency Check | Evaluate internal document consistency: identify claims that contradict one another, evidence that conflicts across claims, or authorities that are mutually incompatible. |
| 6 | Confidence Scoring | Assign a per-claim confidence indicator based on the outputs of stages 3–5. The confidence score is a structured classification, not a numeric probability. |
| 7 | Decision and Receipt | Produce the assurance decision (SUPPORTED / REVIEW / HOLD) and a proof receipt recording the evaluation inputs, stage outputs, and decision rationale. |

Stages execute in order 1 → 7. No stage may be bypassed. All stage outputs are preserved as part of the proof receipt.

---

## 6. Frozen Nine Issue Classes

The DRA issue classes are frozen for Version 1. No issue class may be added, removed, renamed, or redefined during engineering implementation.

| # | Issue class | Trigger condition |
|---|---|---|
| IC-1 | UNSUPPORTED_CLAIM | A claim is made for which no supporting evidence is present or cited. |
| IC-2 | AUTHORITY_EXPIRED | The authority cited for a claim has expired, been superseded, or is no longer applicable. |
| IC-3 | AUTHORITY_ABSENT | A claim requires an authority but none is cited. |
| IC-4 | EVIDENCE_ABSENT | A claim requires supporting evidence but none is provided. |
| IC-5 | EVIDENCE_INADEQUATE | Supporting evidence is cited but is structurally inadequate: insufficient detail, wrong scope, or wrong evidence type. |
| IC-6 | EVIDENCE_CONFLICT | Two or more pieces of evidence cited within the document contradict each other. |
| IC-7 | CLAIM_INCONSISTENCY | Two or more claims within the document are mutually contradictory. |
| IC-8 | TRACEABILITY_BROKEN | A citation, reference, or evidence pointer cannot be resolved to a traceable source. |
| IC-9 | SCOPE_VIOLATION | A claim falls outside the stated scope of the document and is not flagged as out-of-scope. |

---

## 7. Decision Semantics

The DRA evaluator produces one of three assurance decisions per document:

### SUPPORTED

The document passes all evaluation stages without triggering any issue class at blocking severity. All claims are substantiated by current authorities and traceable evidence. The document is internally consistent. A proof receipt is issued confirming this determination.

A SUPPORTED decision is not a guarantee of correctness. It is a structured determination that the document satisfies the Version 1 assurance criteria as evaluated by the DRA reference evaluator.

### REVIEW

One or more issue classes were triggered at advisory severity. The document requires human review before the assurance determination can be confirmed. The proof receipt identifies the specific issues flagged and the claims to which they attach.

A REVIEW decision does not mean the document is incorrect. It means the evaluator cannot confirm assurance without human assessment of the flagged issues.

### HOLD

One or more issue classes were triggered at blocking severity. The document cannot receive an assurance determination until the blocking issues are resolved and the document is re-evaluated. The proof receipt identifies all blocking issues and the claims to which they attach.

A HOLD decision is not a finding of incorrectness. It is a determination that the document does not meet the Version 1 assurance criteria in its current form.

---

## 8. Proof Receipt Requirements

Every DRA evaluation, regardless of outcome, produces a proof receipt. The proof receipt is a frozen, immutable record.

A proof receipt must contain:

1. **Document identity** — document title, version, author, date, and cryptographic hash of the evaluated input.
2. **Evaluator identity** — DRA evaluator version, commit identifier, pipeline version (frozen).
3. **Stage outputs** — the structured output of each of the seven pipeline stages, in order.
4. **Issue register** — all issues triggered, classified by issue class, severity, and the specific claim(s) to which each issue attaches.
5. **Decision** — SUPPORTED / REVIEW / HOLD, with the rule basis for the decision.
6. **Decision rationale** — a human-readable summary of the reasoning behind the decision, derived from stage outputs and issue register entries.
7. **Timestamp** — UTC timestamp of the evaluation.
8. **Receipt identifier** — a unique identifier for this proof receipt, usable for audit and traceability.

Proof receipts must not be modified after issuance. A new evaluation produces a new proof receipt; it does not overwrite or amend a prior receipt.

---

## 9. Limitations

The following limitations apply to DRA Version 1 and must be disclosed in any external communication of results:

- **Reference implementation only.** The DRA evaluator is a reference implementation. It has not been evaluated for performance, concurrency, security, or production reliability.
- **Rule-based classification.** The evaluator is a deterministic, rule-based classifier. It does not learn, generalise, or reason outside the seven-stage pipeline.
- **Benchmark scope.** Version 1 results are bounded by the benchmark corpus. Generalisability beyond the corpus is not claimed.
- **Founder-led evaluation.** The benchmark evaluation is conducted by the programme team. Independent external evaluation is deferred.
- **No external authority validation.** The evaluator cannot independently verify whether a cited authority is genuinely current; it can only evaluate whether the document's citation of that authority is structurally correct.
- **NOT_COVERED cases.** Documents or claims that do not map to any of the nine issue classes produce a NOT_COVERED result. NOT_COVERED is not an assurance decision; it indicates a fixture structural limitation.

---

## 10. Deferred Work

The following work is explicitly deferred until Version 1 evidence exists:

- Version 2 scope definition;
- Additional issue class specification;
- Enterprise integration design;
- Agent Action Assurance Core;
- Additional assurance modules;
- Production UI design;
- External reviewer programme for DRA (analogous to CTS-XVII);
- Independent replication study.

---

## 11. Normative References

1. CTS v0.1 Executive Technical Overview — source commit `17cb968`, publication commit `7af039c`.
2. DRA-001-13 — Version 1 Authoritative Engineering Backlog (this repository).
3. DRA Verification and Benchmark Protocol (this repository).
4. DRA Engineering Evidence Standard (this repository).

---

*Established by DRA-001-CONS-001 — Programme Artefact Consolidation.*
