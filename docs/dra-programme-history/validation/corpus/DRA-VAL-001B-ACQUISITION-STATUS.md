# DRA-VAL-001B — Corpus Acquisition Status Dashboard

**Last updated:** 2026-07-27  
**Corpus version:** DRA-VAL-PILOT-001-PARTIAL

---

## 1. Corpus Targets vs Acquired

### Pilot Corpus (20 documents)

| Metric | Target | Acquired | Frozen | Remaining |
|--------|--------|----------|--------|-----------|
| Pilot corpus | 20 | 7 | 7 | 13 unfilled |
| — AI_GENERATED | 7 | 7 | 7 | 0 |
| — HUMAN_AUTHORED | 7 | 0 | 0 | 7 |
| — HYBRID | 6 | 0 | 0 | 6 |

**Pilot status: PARTIAL** — 35% of target acquired and frozen. 13 slots remain PLANNED.

### Minimum Scientific Corpus (60 documents)

| Metric | Target | Acquired | Frozen | % Complete |
|--------|--------|----------|--------|------------|
| Minimum corpus | 60 | 7 | 7 | 12% |

**Minimum corpus not yet reached.** 53 additional admissible documents required.

### Full Target Corpus (120 documents)

| Metric | Target | Acquired | Frozen | % Complete |
|--------|--------|----------|--------|------------|
| Full corpus | 120 | 7 | 7 | 6% |

**Full target not yet reached.** 113 additional admissible documents required.

---

## 2. Status by Domain

| Domain | Target | Pilot Target | Frozen (Pilot) | Status |
|--------|--------|-------------|----------------|--------|
| LEGAL_AND_REGULATORY | 15 | 3 | 1 | PARTIAL |
| HEALTHCARE_AND_LIFE_SCIENCES | 15 | 3 | 1 | PARTIAL |
| FINANCE_AND_ACCOUNTING | 15 | 2 | 1 | PARTIAL |
| CYBERSECURITY_AND_TECHNICAL_ASSURANCE | 15 | 3 | 1 | PARTIAL |
| BUSINESS_AND_EXECUTIVE_REPORTING | 15 | 2 | 1 | PARTIAL |
| PROCUREMENT_AND_THIRD_PARTY_RISK | 15 | 2 | 1 | PARTIAL |
| HR_AND_WORKPLACE_POLICY | 10 | 2 | 1 | PARTIAL |
| PUBLIC_POLICY_AND_GOVERNANCE | 10 | 1 | 0 | BLOCKED |
| GENERAL_OPERATIONAL | 10 | 2 | 0 | BLOCKED |
| **Total** | **120** | **20** | **7** | PARTIAL |

---

## 3. Status by Source Type

| Source Type | Full Target | Frozen | Remaining | Status |
|------------|-------------|--------|-----------|--------|
| AI_GENERATED | ~40 | 7 | ~33 | IN PROGRESS |
| HUMAN_AUTHORED | ~40 | 0 | ~40 | BLOCKED |
| HYBRID | ~40 | 0 | ~40 | BLOCKED |

---

## 4. Status by Difficulty Stratum

| Difficulty | Full Target | Frozen | Status |
|-----------|-------------|--------|--------|
| LOW | 40 | 3 | IN PROGRESS |
| MEDIUM | 40 | 3 | IN PROGRESS |
| HIGH | 40 | 1 | IN PROGRESS |

---

## 5. Status by Document Length

| Length | Full Target | Frozen | Status |
|--------|-------------|--------|--------|
| SHORT | 30 | 4 | IN PROGRESS |
| MEDIUM | 60 | 3 | IN PROGRESS |
| LONG | 30 | 0 | BLOCKED |

No LONG documents have been acquired. LONG documents require either substantial human-authored sources or extended purpose-generated content with appropriate provenance.

---

## 6. Licensing Blockers

No licensing blockers have been encountered for the 7 frozen documents (all purpose-generated with no restriction). 

Anticipated licensing blockers for remaining slots:

| Blocker Type | Likely Affected Slots | Mitigation |
|-------------|----------------------|------------|
| Copyright — no open licence | Public corporate reports | Target documents under OGL, Creative Commons, or statutory disclosure requirements |
| Subscription-only access | Academic journal articles | Use open-access or preprint versions only |
| Confidential source without authority | Organisational policy documents | Use contributed documents with explicit permission or anonymised organisational documents |

---

## 7. Confidentiality Blockers

No confidentiality blockers for current frozen documents. All 7 are PUBLIC.

For future acquisitions involving internal organisational documents:
- Confidentiality classification must be recorded before admission
- Documents above PUBLIC require documented handling restrictions
- Documents with personal data require completed anonymisation records

---

## 8. Missing Source-Evidence Blockers

No source-evidence blockers for current frozen documents (all purpose-generated; source evidence is the generation record).

For human-authored and hybrid documents:
- Source evidence must be available for reviewer comparison
- Documents where source evidence is inaccessible cannot be admitted where source comparison is required

---

## 9. Duplicate Control Results

| Check | Count |
|-------|-------|
| Documents checked for duplicates | 7 |
| Exact duplicates found | 0 |
| Near-duplicate flags triggered | 0 |
| Excluded for duplication | 0 |

All 7 frozen documents are DISTINCT from each other.

---

## 10. Contamination Control Results

| Check | Count |
|-------|-------|
| Documents screened | 7 |
| Positive contamination signals | 0 |
| Excluded for contamination | 0 |
| PENDING_REVIEW | 0 |

All 7 frozen documents screened ADMITTED_NO_SIGNAL.

---

## 11. Acquisition Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Human-authored and hybrid sources not yet identified | HIGH | 13 pilot slots and 100 post-pilot slots blocked. Requires external acquisition programme. |
| PUBLIC_POLICY_AND_GOVERNANCE domain has zero representation | MEDIUM | 1 pilot slot + 9 post-pilot slots blocked. Suitable public policy documents should be available under OGL or equivalent. |
| GENERAL_OPERATIONAL domain has zero representation | MEDIUM | 2 pilot slots + 8 post-pilot slots blocked. |
| LONG document strata entirely empty | MEDIUM | Requires either extended purpose-generated documents or acquisition of longer public reports. |
| Source-evidence availability for human-authored documents | MEDIUM | Must be confirmed before admission for all human-authored documents |
| Minimum scientific corpus threshold (60 documents) not reached | HIGH | Cannot conduct scientifically valid evaluation until minimum met. |

---

## 12. Next Acquisition Priorities

1. **PUBLIC_POLICY_AND_GOVERNANCE (pilot slot DRA-VAL-DOC-0018):** Target public government policy documents released under the Open Government Licence (OGL). Examples: policy papers, strategy documents, consultation outcomes.

2. **GENERAL_OPERATIONAL (pilot slots DRA-VAL-DOC-0019, 0020):** Target operational documents in open-access repositories or from contributors with explicit permission.

3. **LEGAL_AND_REGULATORY human-authored (DRA-VAL-DOC-0008, 0009):** Target publicly filed regulatory guidance, statutory instruments, or ICO/FCA/CMA published documentation.

4. **HEALTHCARE_AND_LIFE_SCIENCES human-authored (DRA-VAL-DOC-0010, 0011):** Target NHS England published frameworks, NICE quality standards, or CQC guidance documents.

5. **Increase difficulty HIGH representation:** Only 1 of 7 frozen documents is HIGH difficulty. Subsequent acquisitions should prioritise HIGH difficulty documents.

6. **Increase LONG document count:** No LONG documents yet. Target annual reports, comprehensive governance frameworks, or multi-section technical standards.

---

## 13. Quota Computation Note

All quota figures in this dashboard are computed from the machine-readable acquisition register by `computeQuotaSummary()` in `src/benchmark/validation/corpus-manifest.ts`. Manual quota entry is prohibited by the `CorpusAcquisitionRegisterSchema` design. Any update to document records automatically changes the computed totals.
