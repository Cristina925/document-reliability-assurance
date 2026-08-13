# DRA-VAL-001A — Benchmark Corpus Design Protocol

**Document Release Assurance — Version 1 Scientific Validation**

| Field | Value |
|-------|-------|
| Document ID | DRA-VAL-001A |
| Version | 1.0.0 |
| Status | DRAFT |
| Date | 2026-07-27 |

---

## 1. Purpose

This protocol defines the rules governing the design, acquisition, composition, freeze, and maintenance of the independent scientific validation benchmark corpus.

It applies from the point of protocol registration through to corpus freeze. No document may be added to the scientific validation corpus without satisfying all criteria in this protocol.

---

## 2. Staged Corpus Design

The validation uses a three-stage corpus design.

| Stage | Name | Target size | Purpose |
|-------|------|-------------|---------|
| Stage 1 | Pilot validation corpus | 20 documents | Procedural dry-run; verify reviewer protocol and comparison procedures. |
| Stage 2 | Minimum scientific corpus | 60 documents | Smallest corpus providing defensible statistical results given expected issue prevalence. |
| Stage 3 | Target validation corpus | 120 documents | Full corpus providing stratified analysis across all nine domains. |

**Important:** Raw document count is not sufficient for scientific adequacy. Sample-size adequacy depends on observed issue prevalence, the proportion of documents with evaluator-detected issues, and the resulting confidence intervals. The 60-document minimum and 120-document target are starting points; statistical power must be assessed after pilot results are available.

---

## 3. Domain Allocation

### 3.1 Target allocation (120 documents)

| Domain | Target count |
|--------|-------------|
| Legal and regulatory | 15 |
| Healthcare and life sciences | 15 |
| Finance and accounting | 15 |
| Cybersecurity and technical assurance | 15 |
| Business and executive reporting | 15 |
| Procurement and third-party risk | 15 |
| HR and workplace policy | 10 |
| Public policy and governance | 10 |
| General operational documents | 10 |
| **Total** | **120** |

### 3.2 Minimum allocation (60 documents)

Each domain must supply at least half its target allocation. Documents may not be concentrated in a single domain to reach the minimum.

### 3.3 Pilot allocation (20 documents)

Each domain must supply at least 2 pilot documents. The pilot corpus must include at least three domains and both clean and issue-bearing documents.

---

## 4. Source-Type Allocation

The target corpus approximates equal thirds across source types:

| Source type | Target proportion | Target count (of 120) |
|-------------|------------------|-----------------------|
| AI-generated | ~33% | ~40 |
| Human-authored | ~33% | ~40 |
| Hybrid or AI-assisted | ~33% | ~40 |

Exact balance is not required; the composition must be reported. No single source type may account for more than 50% of the final corpus.

---

## 5. Difficulty Strata

| Stratum | Description | Target count |
|---------|-------------|-------------|
| LOW | Clear source-document traceability; well-supported claims; evaluator expected to perform well. | 40 |
| MEDIUM | Partial or ambiguous traceability; some unsupported claims; realistic operational complexity. | 40 |
| HIGH | Complex, contested, or absent traceability; multiple overlapping standards; challenging for evaluator and reviewer alike. | 40 |

Difficulty classification is assigned by the corpus curator before documents are evaluated and must not be revised after evaluation.

---

## 6. Document-Length Strata

| Stratum | Word count range | Target count |
|---------|-----------------|-------------|
| SHORT | 200–1,000 words | 30 |
| MEDIUM | 1,001–5,000 words | 60 |
| LONG | 5,001–50,000 words | 30 |

Documents outside the 200–50,000 word range are excluded.

---

## 7. Clean Document Inclusion

Not all corpus documents must contain evaluable issues. Clean documents — those for which no reviewer identifies any material issue — are included to measure evaluator false-positive rates.

Target: at least 20% of corpus documents (24 of 120) should be clean, where "clean" is determined post-review by the adjudication process.

---

## 8. Defective Document Inclusion

Issue-bearing documents must represent the full range of the DRA evaluator's issue taxonomy (IC-1 through IC-9). No issue class may be absent from the entire corpus; each class must appear in at least 5 documents.

Do not create documents merely to satisfy expected evaluator issue classes. Documents are acquired from real or realistic sources and classified; they are not fabricated to hit issue-class quotas.

---

## 9. Inclusion Criteria

A document is eligible for corpus inclusion if all of the following apply:

**IC-1:** The document is complete and self-contained (not a fragment, excerpt, or template without content).

**IC-2:** The document falls within one of the nine defined corpus domains.

**IC-3:** The document is between 200 and 50,000 words in length.

**IC-4:** The document is in English.

**IC-5:** The source evidence (reference documents, standards, or citations) is available for reviewer inspection.

**IC-6:** The document can be assigned a difficulty stratum before evaluation.

**IC-7:** The document's provenance (origin, authorship, and generation method) can be recorded.

**IC-8:** Including the document does not violate any confidentiality, licensing, or legal obligation.

---

## 10. Exclusion Criteria

A document is excluded if any of the following apply:

**EC-1:** The document contains unredacted personally identifiable information (PII) that cannot be anonymised without altering its evaluable content.

**EC-2:** The document's source evidence is unavailable, lost, or inaccessible to reviewers.

**EC-3:** The document is substantially duplicated in the corpus (near-duplicate detection threshold: ≥70% n-gram overlap on 5-grams).

**EC-4:** The document was created specifically to produce a predetermined evaluator result.

**EC-5:** The document was created by members of the DRA development team for purposes other than the engineering-validation corpus.

**EC-6:** The document is shorter than 200 words or longer than 50,000 words.

**EC-7:** The document is not in English.

**EC-8:** The corpus domain quota for the document's domain has already been satisfied at the target level.

---

## 11. Duplicate and Near-Duplicate Controls

- All documents undergo near-duplicate screening using 5-gram overlap analysis.
- Documents with ≥70% overlap with any existing corpus document are excluded.
- Thematically similar documents from the same source are permitted only if they differ materially in content, claims, or supporting evidence.
- Screening is performed before the document is added to the corpus registry.

---

## 12. Contamination Controls

A document is contaminated if it was used during the design, training, testing, or debugging of the DRA evaluator. Contaminated documents are excluded.

Contamination check procedure:
1. The corpus curator obtains the list of all documents used during DRA evaluator development (the engineering validation corpus, DRA-001-07 and predecessor documents).
2. Each candidate document is screened against this list using identifier comparison and near-duplicate analysis.
3. Documents with ≥50% overlap with any engineering-validation document are excluded.

---

## 13. Source Provenance Requirements

For each corpus document, the following provenance metadata must be recorded:

| Field | Required | Description |
|-------|----------|-------------|
| Origin | Yes | URL, repository, or publisher reference |
| Authorship | Yes | Human, AI model (specify), or hybrid |
| Generation date | Yes | Approximate date of creation |
| Acquisition date | Yes | Date added to corpus candidate list |
| Licensing | Yes | Licence type and any restrictions |
| Anonymisation applied | Yes | None, partial, or full; describe changes |
| Contamination check | Yes | Result of contamination screening |

---

## 14. Licensing and Confidentiality Requirements

- Documents must be acquired under a licence that permits use in internal research and benchmark evaluation.
- Commercially sensitive or legally privileged documents may only be included under a confidentiality agreement that permits their use in this study.
- Documents whose licence is unclear or unknown are excluded.
- Anonymised documents must have anonymisation applied before addition to the corpus; anonymisation must not alter evaluable claims or evidence relationships.

---

## 15. Anonymisation Rules

Anonymisation must:
- Remove or replace PII (names, organisations, addresses, account numbers) where possible without altering claims.
- Preserve all structural relationships between claims and supporting evidence.
- Not introduce new claims or remove existing claims.
- Be documented in the provenance record.

Documents where anonymisation would distort evaluable content are excluded.

---

## 16. Corpus Acquisition Procedure

1. **Candidate identification:** Curators identify candidate documents from public sources, synthetic generation, and partner contributions.
2. **Provenance recording:** Provenance metadata is recorded for each candidate.
3. **Eligibility screening:** Each candidate is assessed against inclusion and exclusion criteria.
4. **Near-duplicate screening:** Duplicate detection is run.
5. **Contamination check:** Contamination screening is run.
6. **Difficulty classification:** The corpus curator assigns a difficulty stratum.
7. **Domain assignment:** The domain is confirmed.
8. **Corpus registry entry:** The document is added to the corpus registry with an integrity digest.
9. **Quota check:** Domain and source-type quotas are updated.

---

## 17. Corpus Freeze Procedure

The corpus is frozen when the target size is reached or a decision is made to proceed with the minimum corpus.

Freeze procedure:
1. Final quota check: domain, source-type, difficulty, and length quotas are verified.
2. Near-duplicate check: a full corpus-wide duplicate scan is run.
3. Contamination check: a full corpus-wide contamination scan is run.
4. Corpus manifest is generated: all document IDs and integrity digests are recorded.
5. Corpus version is assigned: format DRA-CORPUS-X.Y.Z.
6. Freeze record is created and signed by the corpus custodian.
7. The corpus is locked: no additions, removals, or metadata changes are permitted after freeze.

---

## 18. Corpus Replacement Rules

After freeze, individual documents may not be replaced. The only mechanism for changing a frozen corpus is a full corpus revision with a new corpus version number.

A corpus revision requires:
- A recorded protocol amendment (reason: DOCUMENT_WITHDRAWAL)
- Re-running all deduplication and contamination checks
- Incrementing the corpus version (minor version bump for additions; major version bump for deletions or domain rebalancing)
- A new freeze record

---

## 19. Document Withdrawal Rules

A frozen document may be withdrawn if:
- A legal or confidentiality obligation requires removal
- Contamination is discovered after freeze

Withdrawn documents are:
- Removed from active evaluation
- Recorded in the corpus withdrawal register with a reason and date
- Excluded from analysis with their exclusion noted in the results

Withdrawn documents are not replaced in the same study run. Their withdrawal is recorded as a protocol deviation if it materially affects corpus quotas.

---

## 20. Integrity Digest Requirements

Every corpus document entry must have a SHA-256 integrity digest computed over its substantive content (text, metadata fields — excluding operational timestamps).

The corpus manifest digest covers all document-level digests in canonical document-ID order.

Both document-level and manifest-level digests are verified before corpus freeze and before benchmark execution.

---

## 21. Versioning Rules

| Version component | Meaning |
|-------------------|---------|
| Major (X) | Materially different corpus design: domain structure, target size, or source-type allocation changed. |
| Minor (Y) | Documents added or replaced before freeze. |
| Patch (Z) | Metadata-only corrections; no substantive document changes. |

Corpus versions are immutable after freeze. A frozen corpus version may not be modified; any change requires a new version.

---

## 22. References

- `DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` — study charter
- `DRA-VAL-001B-REVIEWER-PROTOCOL.md` — reviewer rules
- `DRA-VAL-001C-COMPARISON-PROTOCOL.md` — comparison rules
- `DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` — statistical plan
