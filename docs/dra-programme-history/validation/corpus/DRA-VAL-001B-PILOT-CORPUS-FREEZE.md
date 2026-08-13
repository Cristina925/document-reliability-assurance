# DRA-VAL-001B — Pilot Corpus Freeze Record

**Corpus version:** `DRA-VAL-PILOT-001-PARTIAL`  
**Freeze timestamp:** 2026-07-27T12:00:00  
**Status: FROZEN (PARTIAL)**

---

## 1. Summary

The pilot corpus has been frozen as `DRA-VAL-PILOT-001-PARTIAL` because fewer than 20 scientifically admissible documents were available for acquisition within the current repository. Only purpose-generated (AI-generated synthetic) documents could be honestly acquired without external source material. Human-authored and hybrid documents require real source material that cannot be fabricated or invented.

**This corpus is explicitly described as partial. It must not be represented as the completed 20-document pilot.**

---

## 2. Freeze Statistics

| Metric | Value |
|--------|-------|
| Pilot target | 20 documents |
| Planned count | 20 |
| Identified count | 7 |
| Acquired count | 7 |
| Admitted count | 7 |
| **Frozen count** | **7** |
| Excluded count | 0 |
| Withdrawn count | 0 |
| Unfilled slot count | 13 |
| Evaluator execution occurred | NO |
| Scientific metrics produced | NO |

---

## 3. Frozen Document Index

| Document ID | Domain | Source Type | Difficulty | Length | Synthetic |
|-------------|--------|-------------|------------|--------|-----------|
| DRA-VAL-DOC-0001 | LEGAL_AND_REGULATORY | AI_GENERATED | LOW | SHORT | Yes |
| DRA-VAL-DOC-0002 | HEALTHCARE_AND_LIFE_SCIENCES | AI_GENERATED | MEDIUM | MEDIUM | Yes |
| DRA-VAL-DOC-0003 | FINANCE_AND_ACCOUNTING | AI_GENERATED | LOW | SHORT | Yes |
| DRA-VAL-DOC-0004 | CYBERSECURITY_AND_TECHNICAL_ASSURANCE | AI_GENERATED | HIGH | MEDIUM | Yes |
| DRA-VAL-DOC-0005 | BUSINESS_AND_EXECUTIVE_REPORTING | AI_GENERATED | MEDIUM | SHORT | Yes |
| DRA-VAL-DOC-0006 | PROCUREMENT_AND_THIRD_PARTY_RISK | AI_GENERATED | LOW | MEDIUM | Yes |
| DRA-VAL-DOC-0007 | HR_AND_WORKPLACE_POLICY | AI_GENERATED | MEDIUM | SHORT | Yes |

**Unfilled slots (13):** DRA-VAL-DOC-0008 through DRA-VAL-DOC-0020 — all PLANNED, acquisition blocked (see §8).

---

## 4. Distributions

### Domain Distribution

| Domain | Frozen | Pilot Target | Coverage |
|--------|--------|-------------|---------|
| LEGAL_AND_REGULATORY | 1 | 3 | 33% |
| HEALTHCARE_AND_LIFE_SCIENCES | 1 | 3 | 33% |
| FINANCE_AND_ACCOUNTING | 1 | 2 | 50% |
| CYBERSECURITY_AND_TECHNICAL_ASSURANCE | 1 | 3 | 33% |
| BUSINESS_AND_EXECUTIVE_REPORTING | 1 | 2 | 50% |
| PROCUREMENT_AND_THIRD_PARTY_RISK | 1 | 2 | 50% |
| HR_AND_WORKPLACE_POLICY | 1 | 2 | 50% |
| PUBLIC_POLICY_AND_GOVERNANCE | 0 | 1 | 0% |
| GENERAL_OPERATIONAL | 0 | 2 | 0% |
| **Total** | **7** | **20** | **35%** |

No domain is unrepresented in the frozen set except PUBLIC_POLICY_AND_GOVERNANCE and GENERAL_OPERATIONAL, which are entirely blocked pending external source acquisition.

### Source-Type Distribution

| Source Type | Frozen | Pilot Target | Notes |
|------------|--------|-------------|-------|
| AI_GENERATED | 7 | 7 | Target met |
| HUMAN_AUTHORED | 0 | 7 | Blocked — requires external source acquisition |
| HYBRID | 0 | 6 | Blocked — requires external source acquisition |

### Difficulty Distribution

| Difficulty | Frozen | Pilot Target |
|-----------|--------|-------------|
| LOW | 3 | 6 |
| MEDIUM | 3 | 7 |
| HIGH | 1 | 7 |

### Document Length Distribution

| Length | Frozen | Pilot Target |
|--------|--------|-------------|
| SHORT | 4 | ~7 |
| MEDIUM | 3 | ~9 |
| LONG | 0 | ~4 |

### Confidentiality Distribution

| Level | Count |
|-------|-------|
| PUBLIC | 7 |
| INTERNAL_RESTRICTED | 0 |
| CONFIDENTIAL | 0 |
| STRICTLY_CONFIDENTIAL | 0 |

### Synthetic Document Count

| Synthetic | Count |
|-----------|-------|
| Yes (`syntheticFlag: true`) | 7 |
| No | 0 |

All 7 frozen documents are purpose-generated (AI-generated synthetic). All are explicitly labelled as synthetic within the document content.

---

## 5. Duplicate Control Summary

| Outcome | Count |
|---------|-------|
| DISTINCT (no duplicates) | 7 |
| RELATED_BUT_ADMISSIBLE | 0 |
| NEAR_DUPLICATE_EXCLUDED | 0 |
| EXACT_DUPLICATE_EXCLUDED | 0 |
| INDETERMINATE | 0 |

Method: MinHash Jaccard similarity on 3-gram tokens with 128 hash functions; threshold 0.80. All 7 documents scored 0.00 similarity against each other (distinct domains, distinct content structures).

---

## 6. Contamination Control Summary

| Signal | Count |
|--------|-------|
| ADMITTED_NO_SIGNAL | 7 |
| ADMITTED_SIGNAL_MITIGATED | 0 |
| EXCLUDED_CONTAMINATION_CONFIRMED | 0 |
| PENDING_REVIEW | 0 |

All 7 documents were generated after the DRA evaluator was frozen. No evaluator outputs, development history, or fixture content was consulted during generation. All seven contamination categories checked clear.

---

## 7. Individual Document Integrity Digests

SHA-256 digests are computed by `computeDocumentDigest()` in `src/benchmark/validation/corpus-manifest.ts`. Digests exclude operational metadata (`status`, `lastUpdated`, `frozenAt`, `integrityDigest` itself).

Digests are recorded in `data/dra-validation/manifests/DRA-VAL-PILOT-001-PARTIAL.manifest.json`.

---

## 8. Unresolved Acquisition Blockers

The following 13 pilot slots could not be acquired:

| Slots | Source Type | Blocker |
|-------|------------|---------|
| 0008, 0009 | HUMAN_AUTHORED, HYBRID | Legal/regulatory domain — requires identification of publicly available human-authored or hybrid documents meeting all inclusion criteria |
| 0010, 0011 | HUMAN_AUTHORED, HYBRID | Healthcare domain — requires identification of publicly available clinical governance documents with appropriate permitted-use basis |
| 0012 | HUMAN_AUTHORED | Finance domain — requires identification of publicly available financial control document |
| 0013, 0014 | HUMAN_AUTHORED, HYBRID | Cybersecurity domain — requires identification of publicly available information security documents |
| 0015 | HUMAN_AUTHORED | Business/executive reporting domain — requires identification of appropriate public document |
| 0016 | HUMAN_AUTHORED | Procurement domain — requires identification of appropriate public document |
| 0017 | HUMAN_AUTHORED | HR/workplace policy domain — requires identification of appropriate public document |
| 0018 | HUMAN_AUTHORED | Public policy/governance domain — requires identification of appropriate public document |
| 0019, 0020 | HUMAN_AUTHORED, HYBRID | General operational domain — requires identification of appropriate public documents |

**Resolution path:** All 13 slots are eligible for filling from public regulatory documents, public corporate reports, or open-licensed templates as defined in `DRA-VAL-001B-SOURCE-ACQUISITION-GUIDE.md`. No fabrication of source material is permitted.

---

## 9. Known Deviations from Protocol

| Deviation | Reference | Impact |
|-----------|-----------|--------|
| Pilot corpus frozen at 7/20 documents (35% of target) | DRA-VAL-001A §3.1 (pilotSize = 20) | Pilot tests infrastructure but does not demonstrate all 9 domains or all 3 source types. Reviewer workflow readiness cannot be fully validated at this stage. |
| No human-authored or hybrid documents in pilot | DRA-VAL-001A §4 (sourceTypeRatios) | Cannot validate human-authored or hybrid document handling in this partial pilot. |
| PUBLIC_POLICY_AND_GOVERNANCE and GENERAL_OPERATIONAL domains have zero pilot representation | DRA-VAL-001A §5 (pilot domain balance) | These domains require post-partial-pilot acquisition. |

These deviations are recorded as known and acknowledged. They do not invalidate the infrastructure freeze.

---

## 10. Permitted Uses and Attribution

All 7 frozen documents: `PURPOSE_GENERATED_NO_RESTRICTION`. No attribution required. Storage and publication permitted.

---

## 11. Amendment and Withdrawal Process

Post-freeze amendments to this pilot corpus:

- **Document withdrawal:** Create a `CorpusWithdrawalRecord` with `postFreezeWithdrawal: true`. The original manifest entry is preserved. A new manifest version is generated.
- **Slot replacement:** Create a `CorpusReplacementRecord` preserving the original document ID. The replacement document goes through the full admission workflow.
- **Corpus version:** A new corpus version identifier (e.g. `DRA-VAL-PILOT-001-PARTIAL-R1`) must be assigned for any post-freeze change.
- **Evaluator must not be run:** Neither the original nor replacement documents may be evaluated before the scientific comparison phase.

---

## 12. Attestations

| # | Attestation | Status |
|---|-------------|--------|
| F-1 | All 7 frozen documents satisfy all freeze invariants | **TRUE** |
| F-2 | All 7 documents have integrity digests computed and recorded in the manifest | **TRUE** |
| F-3 | No evaluator execution occurred on any corpus document | **TRUE** |
| F-4 | No scientific performance metrics were produced | **TRUE** |
| F-5 | The partial pilot is correctly labelled as `DRA-VAL-PILOT-001-PARTIAL` | **TRUE** |
| F-6 | No document was fabricated, invented, or silently synthesized to fill slots | **TRUE** — 13 slots left unfilled |
| F-7 | All frozen documents are explicitly marked as synthetic within their content | **TRUE** |
| F-8 | The frozen evaluator identifier (DRA-EV-001 v1.0) has not been modified | **TRUE** |
