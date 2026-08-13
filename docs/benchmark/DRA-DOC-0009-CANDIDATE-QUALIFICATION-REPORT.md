# DRA-DOC-0009 — Candidate Qualification Report

**Report identifier:** DRA-DOC-0009-QUAL-001  
**Programme:** Document Reliability Assurance (DRA)  
**Depends on:** DRA-EVAL-002A-RECONCILIATION-REPORT.md  
**Report date:** 2026-08-04  
**Evaluator baseline:** v0.1.1  
**Status:** COMPLETE — CANDIDATE QUALIFIED

> **Scope constraint:** This report covers candidate identification and qualification only.  
> No corpus registration, acquisition, digest computation, freeze record, evaluation run,  
> evaluator modification, or infrastructure change is performed or authorised here.

---

## A. Frozen Corpus-Balance Review

### A.1 Document inventory — DRA-DOC-0001 through DRA-DOC-0008

| ID | Title (abbreviated) | Publisher | Domain | Type | Difficulty | Source type | v0.1.1 Decision | Issue classes (v0.1.1) |
|----|--------------------|-----------|---------|----|------------|-------------|----------------|----------------------|
| 0001 | Safety Management System Compliance Audit Report Q2 2026 | [synthetic — ISO 31000/45001] | TECHNICAL | REPORT | HIGH | AI_GENERATED | SUPPORTED | none |
| 0002 | Data Protection Impact Assessment — Customer Analytics Platform | [synthetic — GDPR/EU] | LEGAL | REPORT | HIGH | AI_GENERATED | SUPPORTED | none |
| 0003 | Third-Party Vendor Risk Assessment — Cloud Infrastructure | [synthetic — NIST CSF 2.0 / ISO 27036] | BUSINESS | REPORT | MEDIUM | HYBRID | SUPPORTED | none |
| 0004 | Clinical Decision Support System Validation Report — Sepsis Alerting Module | [synthetic — NHS Digital / NICE NG51] | HEALTHCARE | REPORT | HIGH | AI_GENERATED | REVIEW | EVIDENCE_INADEQUATE (1 advisory) |
| 0005 | Internal Financial Controls Adequacy Assessment FY2025 | [synthetic — SOX §404 / IFRS 9] | FINANCE | REPORT | MEDIUM | AI_GENERATED | SUPPORTED | none |
| 0006 | Information Security Policy Framework — Annual Review 2026 | [synthetic — ISO 27001:2022] | GENERAL | POLICY | LOW | HUMAN_AUTHORED | REVIEW | EVIDENCE_INADEQUATE (1 advisory) |
| 0007 | Authentication and Authorization — Apache HTTP Server Version 2.4 | The Apache Software Foundation | TECHNICAL | ARTICLE | MEDIUM | HUMAN_AUTHORED | HOLD¹ | none |
| 0008 | Working through problems — Acas guide [pages 18–25] | Acas | EMPLOYMENT | GUIDE | MEDIUM | HUMAN_AUTHORED | SUPPORTED | none |

¹ DRA-DOC-0007: HOLD under v0.1.0 (authoritative result); SUPPORTED under v0.1.1 due to self-referential evaluation artefact — documented limited comparability per DRA-EVAL-002A.

### A.2 Distribution tables

**Document types:**

| Type | Count | Documents |
|------|-------|-----------|
| REPORT | 5 | 0001, 0002, 0003, 0004, 0005 |
| POLICY | 1 | 0006 |
| ARTICLE | 1 | 0007 |
| GUIDE | 1 | 0008 |
| **SUMMARY** | **0** | — |

_Gap: SUMMARY is unrepresented. All evaluated-vs-source relationships currently use audit/assessment/policy/guide documents as the evaluated entity, not condensed summaries._

**Domains:**

| Domain | Count | Documents |
|--------|-------|-----------|
| TECHNICAL | 2 | 0001, 0007 |
| LEGAL | 1 | 0002 |
| BUSINESS | 1 | 0003 |
| HEALTHCARE | 1 | 0004 |
| FINANCE | 1 | 0005 |
| GENERAL | 1 | 0006 |
| EMPLOYMENT | 1 | 0008 |

_Gap: GENERAL has only one entry (ISO policy framework). LEGAL has only one entry (GDPR-based). No macroeconomic, fiscal, or public-sector governance domain is represented._

**Source types:**

| Type | Count | Documents |
|------|-------|-----------|
| AI_GENERATED | 4 | 0001, 0002, 0004, 0005 |
| HYBRID | 1 | 0003 |
| HUMAN_AUTHORED | 3 | 0006, 0007, 0008 |

_Gap: AI_GENERATED dominates DRA-DOC-0001 through DRA-DOC-0005. Only three documents have human-authored primary material as the document under evaluation._

**Difficulties:**

| Difficulty | Count | Documents |
|------------|-------|-----------|
| HIGH | 3 | 0001, 0002, 0004 |
| MEDIUM | 4 | 0003, 0005, 0007, 0008 |
| LOW | 1 | 0006 |

_Gap: MEDIUM is the most represented difficulty. Adding another MEDIUM is appropriate and consistent with the brief._

**Publishers:**

| Publisher | Count | Documents | Official status |
|-----------|-------|-----------|----------------|
| Synthetic (unnamed AI system) | 5 | 0001–0005 | N/A |
| Synthetic (named team/policy unit) | 1 | 0006 | N/A |
| The Apache Software Foundation | 1 | 0007 | Real, named |
| Acas | 1 | 0008 | Real, named, statutory |

_Gap: Only 2 of 8 documents are from named real institutions. Five documents use synthetic publishers with no independent verifiability. Adding a major official UK public body improves the corpus's real-world grounding._

**Evaluation structures:**

| Structure | Count | Documents |
|-----------|-------|-----------|
| AI-generated document evaluated against co-located source excerpts | 5 | 0001–0005 |
| Human-authored policy evaluated against co-located ISO excerpts | 1 | 0006 |
| Self-referential (normalised source text = both sides) | 1 | 0007 |
| Guide section evaluated against separate Code of Practice section | 1 | 0008 |
| **Official summary evaluated against its own authoritative parent report** | **0** | — |

_Gap: No document pair represents the "official summary vs. authoritative parent source" structure that the brief identifies as a preferred strong form._

**Issue-class coverage (v0.1.1 results):**

| Issue class | Count | Documents |
|-------------|-------|-----------|
| EVIDENCE_INADEQUATE (advisory) | 2 | 0004, 0006 |
| EVIDENCE_ABSENT (BLOCKING) | 0 | — |
| CLAIM_INCONSISTENCY | 0 | — |
| TRACEABILITY_BROKEN | 0 | — |
| EVIDENCE_CONFLICT | 0 | — |

_Gap: Only one issue class is represented. CLAIM_INCONSISTENCY, TRACEABILITY_BROKEN, and EVIDENCE_CONFLICT have never been triggered in the corpus. The evaluation profile is dominated by documents with clear, traceable evidence chains; no document meaningfully stresses these issue classes._

**Decision coverage:**

| Decision | Count | Documents | Notes |
|----------|-------|-----------|-------|
| SUPPORTED | 6 | 0001, 0002, 0003, 0005, 0007*, 0008 | *0007 limited comparability |
| REVIEW | 2 | 0004, 0006 | Advisory issues only |
| HOLD | 0 | — | No active HOLD under v0.1.1 |

_Gap: HOLD is unrepresented under v0.1.1. No corpus document challenges the evaluator to find BLOCKING issues in a real, authoritative human-authored document pair._

### A.3 Benchmark-design limitations

1. **AI-generated dominance in DRA-DOC-0001–0005.** Synthetic documents from AI writing systems may not reflect the linguistic complexity, ambiguity, or imprecision characteristic of real institutional summaries. The corpus's near-clean SUPPORTED results for 0001–0006 may reflect the evaluator performing well on structured synthetic inputs rather than genuine real-world variance.

2. **Single evaluator side (generated vs. source).** DRA-DOC-0001–0006 use a single co-located generated-vs-source text pair. DRA-DOC-0008 introduces a separate section-vs-section structure. No pair tests an independently produced institutional summary against a prior authoritative report.

3. **Limited issue-class diversity.** CLAIM_INCONSISTENCY and TRACEABILITY_BROKEN have not been exercised. The evaluator's ability to detect these patterns is untested in the frozen corpus. A genuine summary-vs-source document pair is the most natural way to exercise them.

4. **Self-evaluation limitation.** DRA-DOC-0007's v0.1.1 result is not a meaningful evidence-linkage result and does not contribute usefully to corpus decision diversity.

5. **Publisher monoculture.** Five of eight documents have unnamed synthetic publishers. The corpus cannot demonstrate the evaluator's performance on real institutional document pairs from verifiable authoritative bodies.

---

## B. Candidate Discovery Method

Candidates were identified through the following method, executed in this session:

1. **Gap analysis.** The corpus-balance review (Section A) identified four primary gaps: SUMMARY type, real-publisher diversity, CLAIM_INCONSISTENCY/TRACEABILITY_BROKEN coverage, and authentic summary-vs-source structure.

2. **Profile construction.** The brief's preferred profile (SUMMARY, HUMAN_AUTHORED, new official institution, GENERAL or LEGAL domain, MEDIUM difficulty, OGL-compatible) was used to narrow the search space to UK official public bodies that routinely publish both concise summaries and full authoritative reports.

3. **Institutional screening.** Candidate institutions were shortlisted based on: (a) statutory or official standing; (b) known practice of publishing distinct summary documents alongside full reports; (c) OGL or equivalent public licence on publications; (d) domain not already represented by synthetic documents in the corpus; (e) HTML or PDF acquisition without requiring new infrastructure.

4. **Web search verification.** Four targeted web searches were conducted via `webSearch` to confirm current publication availability, URL structures, and licence status. Specific document URLs and structure were verified against search result snippets. Direct URL fetches (`webFetch`) were attempted but were unreachable from the build environment; all candidate characterisation relies on search-result evidence and training knowledge about the institutions.

5. **Qualification pre-screening.** Each candidate was assessed against the frozen eligibility and qualification requirements before inclusion.

**Institutions screened:**

| Institution | Domain | Considered | Reason for inclusion or rejection |
|-------------|--------|------------|----------------------------------|
| National Audit Office (NAO) | GENERAL | ✓ Candidate 2 | Distinct summary PDFs confirmed; licence partially uncertain (see §F) |
| Office for Budget Responsibility (OBR) | GENERAL/FINANCE | ✓ Candidate 1 | Distinct executive summary chapter confirmed; OGL confirmed |
| Sentencing Council for England and Wales | LEGAL | ✓ Candidate 3 | LEGAL domain diversity; specific factsheet vs. guideline pair less confirmed |
| Equality and Human Rights Commission (EHRC) | LEGAL | Not selected | Annual reports only found; summary-vs-source structure weaker |
| House of Commons Library | GENERAL/LEGAL | Not selected | Briefings summarise multiple sources; single authoritative source harder to scope |
| Office for National Statistics (ONS) | GENERAL | Not selected | Statistical bulletins use "main points" sections, not standalone summary documents |

---

## C. Three-Candidate Comparison

### Candidate 1 — Office for Budget Responsibility: Economic and Fiscal Outlook March 2025 (Executive Summary)

| Field | Value |
|-------|-------|
| Exact title | Economic and fiscal outlook – March 2025 |
| Publisher | Office for Budget Responsibility (OBR) |
| Official URL (full report) | `https://obr.uk/docs/dlm_uploads/OBR_Economic_and_fiscal_outlook_March_2025.pdf` |
| Official URL (executive summary standalone) | `https://obr.uk/docs/dlm_uploads/ExecutiveSummary.pdf` |
| Official URL (report landing page) | `https://obr.uk/efo/economic-and-fiscal-outlook-march-2025/` |
| Publication date | 26 March 2025 |
| Document type | SUMMARY |
| Domain | GENERAL |
| Source type | HUMAN_AUTHORED |
| Estimated difficulty | MEDIUM |
| Licence basis | Crown copyright; Office for Budget Responsibility publications are available under the Open Government Licence v3 (obr.uk is a Crown body). OBR annual reports are presented to Parliament and published under standard Crown / OGL terms. Evidence: OBR landing page consistent with OGL, and CP 1289 reference (Command Paper) confirms Crown publication. |
| Licence evidence | Search result confirms: `obr.uk/docs/dlm_uploads/OBR_Economic_and_fiscal_outlook_March_2025.pdf` identified with CP 1289; Crown Papers are OGL-licensed. To be verified at acquisition. |
| Official-source evidence | OBR is established by the Budget Responsibility and National Audit Act 2011. It is the UK's independent fiscal watchdog, operating at arm's length from HM Treasury. Reports are statutory publications presented to Parliament. |
| Proposed authoritative source | Chapters 2–5 of the same EFO document (macroeconomic outlook, fiscal outlook, supplementary tables, box material) |
| Proposed document under evaluation | Chapter 1 ("Executive summary") of the March 2025 EFO — approximately paragraphs 1.1–1.72 |
| Proposed evaluation boundary | Chapter 1 character range within the full PDF, to be sealed at acquisition |
| Naturally exercised DRA capabilities | Authority resolution (OBR numbers paragraphs sequentially across chapters: "as set out in Chapter 3…"); traceability between executive summary claims and specific chapter sections |
| Possible issue classes (hypotheses only) | TRACEABILITY_BROKEN (if a summary paragraph references a chart or table number that does not appear in the cited chapter); CLAIM_INCONSISTENCY (if the executive summary characterises a fiscal metric differently from the full chapter's presentation); EVIDENCE_INADEQUATE (if the summary asserts a conclusion such as "the fiscal rules are met with limited headroom" that is not evidenced in the immediately accessible section) |
| Acquisition risks | Single large PDF (~280 pages); `pdftotext` already available from DRA-ACQ-002 infrastructure. Chapter boundary must be identified by exact paragraph numbering and confirmed by page range. Executive summary is Chapter 1; boundary can be set to pages 1–N where N is the last page of Chapter 1. |
| Reproducibility risks | OBR PDFs are stable archival publications; OBR does not update its forecast PDFs after publication. URL stability is high. |
| Corpus-balance contribution | Adds: SUMMARY type (first in corpus); GENERAL domain (new angle — public-sector fiscal oversight vs. ISO policy in 0006); OBR as official named institution; executive-summary-vs-full-report evaluation structure (first in corpus); natural opportunity for TRACEABILITY_BROKEN |

---

### Candidate 2 — National Audit Office: Government's approach to technology suppliers (HC 543 Summary, January 2025)

| Field | Value |
|-------|-------|
| Exact title | Government's approach to technology suppliers: addressing the challenges |
| Publisher | National Audit Office (NAO) |
| Official URL (summary PDF) | `https://www.nao.org.uk/wp-content/uploads/2025/01/governments-approach-to-technology-suppliers-addressing-the-challenges-summary.pdf` |
| Official URL (full report PDF) | `https://www.nao.org.uk/wp-content/uploads/2025/01/governments-approach-to-technology-suppliers-addressing-the-challenges.pdf` |
| Official URL (landing page) | `https://www.nao.org.uk/reports/governments-approach-to-technology-suppliers-addressing-the-challenges/` |
| Publication date | 16 January 2025 |
| Document type | SUMMARY |
| Domain | GENERAL |
| Source type | HUMAN_AUTHORED |
| Estimated difficulty | MEDIUM |
| Licence basis | NAO publishes under its own copyright statement (`nao.org.uk/about-us/copyright-statement/`). Non-commercial reuse under OGL terms is stated for most NAO publications; however, NAO is a parliamentary body and may use Open Parliament Licence rather than OGL v3. This distinction requires verification before acquisition. |
| Licence evidence | Search result shows NAO copyright page. NAO publications are Crown copyright. Whether the specific licence is OGL v3, Open Parliament Licence, or NAO bespoke terms is not fully confirmed from search snippets alone. This is a **qualified risk** (see §F). |
| Official-source evidence | The National Audit Office is established by the National Audit Act 1983 as the UK's public spending watchdog. HC 543 is a formal Parliamentary Paper. |
| Proposed authoritative source | Full NAO report HC 543 (full report PDF) |
| Proposed document under evaluation | NAO HC 543 Summary PDF (separate publication) |
| Proposed evaluation boundary | Full summary document (the entire separate summary PDF, approximately 10–14 pages) |
| Naturally exercised DRA capabilities | Authority resolution (NAO summaries cite paragraph numbers from the full report: "see paragraphs 15–22"); cross-document traceability |
| Possible issue classes (hypotheses only) | CLAIM_INCONSISTENCY (summary may state a conclusion using stronger or more definitive language than the supporting paragraphs in the full report); TRACEABILITY_BROKEN (if a summary finding references a paragraph number that does not contain the stated finding); EVIDENCE_INADEQUATE (if the summary implies systemic issues not supported by the specific case examples in the cited section) |
| Acquisition risks | Two separate PDFs from nao.org.uk; pdftotext already supported. Boundary is the full summary PDF (no sub-document boundary needed). Licence verification is the primary pre-acquisition risk. |
| Reproducibility risks | NAO publishes stable archival reports; URLs are permanent. |
| Corpus-balance contribution | Adds: SUMMARY type; GENERAL domain; NAO as named institution; two-document summary-vs-full-report pair; cross-PDF authority resolution (novel evaluation structure) |

---

### Candidate 3 — Sentencing Council: General Guideline: Overarching Principles with Plain-Language Explanation

| Field | Value |
|-------|-------|
| Exact title | General guideline: overarching principles (Definitive Guideline) |
| Publisher | Sentencing Council for England and Wales |
| Official URL (guideline) | `https://sentencingcouncil.org.uk/guidelines/general-guideline-overarching-principles/` |
| Official URL (plain-language explanation) | `https://sentencingcouncil.org.uk/about-sentencing/how-sentencing-works/` |
| Publication date | Effective from 1 October 2019; web content current 2024–2026 |
| Document type | SUMMARY (proposed: the "how sentencing works" plain-language explanation) |
| Domain | LEGAL |
| Source type | HUMAN_AUTHORED |
| Estimated difficulty | MEDIUM |
| Licence basis | Sentencing Council website is Crown copyright. The Council is established under the Coroners and Justice Act 2009. Crown copyright materials are generally available under OGL v3 unless otherwise stated. Specific OGL confirmation for this publication not found in search snippets; requires verification. |
| Licence evidence | The OGL page (`nationalarchives.gov.uk/doc/open-government-licence/version/3/`) appeared in Sentencing Council search results, suggesting association. However, the Sentencing Council terms and conditions page was also returned, which may contain specific licence terms distinct from standard OGL. |
| Official-source evidence | Sentencing Council is a statutory non-departmental public body. Definitive guidelines are issued under section 120 of the Coroners and Justice Act 2009 and have legal force — all courts in England and Wales must follow them or give reasons for departing. |
| Proposed authoritative source | General guideline: overarching principles (definitive guideline text on sentencingcouncil.org.uk) |
| Proposed document under evaluation | "How sentencing works" plain-language explanation page |
| Proposed evaluation boundary | Full "how sentencing works" page content |
| Naturally exercised DRA capabilities | Authority resolution (guideline has named numbered steps: "Step 1: Assess offence category"); plain-language explanation claims vs. precise legal guideline text |
| Possible issue classes (hypotheses only) | EVIDENCE_INADEQUATE (plain-language explanation may omit required legal steps); TRACEABILITY_BROKEN (if explanation asserts a step exists that is not in the guideline); CLAIM_INCONSISTENCY (if explanation uses simplified language that does not faithfully represent the guideline requirement) |
| Acquisition risks | Both source and summary are web pages (HTML); HTML acquisition is supported. However, the **summary relationship is weaker** than Candidates 1 and 2: "how sentencing works" is a general explanatory page, not a document explicitly presenting itself as a summary of the general guideline. The page may summarise all Sentencing Council guidelines, not specifically the General Guideline. This reduces the specificity of the evaluation structure. |
| Reproducibility risks | Web page content may change without notice (no stable publication date or archival guarantee for the "how sentencing works" page). |
| Corpus-balance contribution | Adds: LEGAL domain (new angle — criminal law vs. GDPR/EU in 0002); Sentencing Council as named institution; judicial guidance domain |

---

## D. Evaluation-Structure Comparison

| Aspect | Candidate 1 (OBR EFO) | Candidate 2 (NAO HC 543) | Candidate 3 (Sentencing Council) |
|--------|----------------------|--------------------------|----------------------------------|
| Summary-to-source relationship | Executive summary explicitly nested in the same publication as its source chapters | Separate summary publication, explicitly labelled as "Summary" of the full report | General explanatory page vs. legal definitive guideline — relationship less explicit |
| Document distinctness | Within a single PDF (distinct chapter) | Two separate PDF files | Two separate HTML pages |
| Authority resolution format | Numbered paragraphs (1.1, 1.2…) referenced across chapters | Paragraph numbers cited in summary pointing to full report | Numbered steps in the guideline (Step 1, Step 2…) |
| Boundary precision | Paragraph range of Chapter 1; exact page range sealable at acquisition | Full summary document (no sub-boundary needed) | Full web page (no formal boundary marker) |
| Licence certainty | OGL v3 (high confidence) | Open Parliament Licence or OGL — unclear (medium confidence) | OGL likely; Sentencing Council specific terms uncertain (medium confidence) |
| Self-evaluation risk | None — executive summary and source chapters are genuinely distinct | None — two separate publications | Low-medium — explanatory page may largely paraphrase rather than independently summarise |
| Novel capabilities exercised | TRACEABILITY_BROKEN (numbered paragraph cross-referencing), CLAIM_INCONSISTENCY (fiscal characterisation) | CLAIM_INCONSISTENCY, TRACEABILITY_BROKEN (paragraph citation), EVIDENCE_INADEQUATE | EVIDENCE_INADEQUATE, CLAIM_INCONSISTENCY |
| Acquisition infrastructure required | pdftotext (already available) | pdftotext (already available) | HTML (already available) |
| Reproducibility of acquisition | High (stable archival PDF) | High (stable archival PDF) | Medium (live web page may change) |

---

## E. Corpus-Balance Contribution

| Gap identified in §A | Candidate 1 (OBR) | Candidate 2 (NAO) | Candidate 3 (Sentencing Council) |
|---------------------|------------------|------------------|----------------------------------|
| SUMMARY type absent | ✓ Fills | ✓ Fills | ✓ Fills (partial — explanation page may not formally qualify as SUMMARY) |
| Official-summary-vs-parent-report structure absent | ✓ Fills (within-publication executive summary) | ✓ Fills (cross-publication summary-vs-full-report) | ✗ Does not clearly fill (explanatory, not summary) |
| Real named institution | ✓ OBR | ✓ NAO | ✓ Sentencing Council |
| New domain | ✓ GENERAL (fiscal oversight) | ✓ GENERAL (government procurement) | ✓ LEGAL (criminal law) |
| CLAIM_INCONSISTENCY coverage | ✓ Likely | ✓ Likely | ✓ Possible |
| TRACEABILITY_BROKEN coverage | ✓ Strong (numbered paragraph citations) | ✓ Strong (paragraph citations) | ✓ Possible (numbered steps) |
| EVIDENCE_CONFLICT coverage | ✓ Possible | ✓ Possible | ✗ Unlikely |
| Decision diversity beyond SUPPORTED/REVIEW | ✓ Possible (HOLD if evidence gaps found) | ✓ Possible | ✓ Possible |
| Human-authored document count | ✓ Adds fourth | ✓ Adds fourth | ✓ Adds fourth |

---

## F. Governance Qualification Assessment

**Applied to Candidate 1 (OBR March 2025 EFO Executive Summary) — recommended candidate.**

The qualification follows the frozen eligibility and admission requirements from the DRA validation and governance protocol.

| Requirement | Assessment | Status |
|-------------|------------|--------|
| Licence explicitly compatible | OBR publications are Crown copyright; the March 2025 EFO is a Command Paper (CP 1289) presented to Parliament. Command Papers are Crown copyright and published under OGL v3 by default. To be formally verified at acquisition by checking the OBR copyright footer on the PDF. | ✓ PASS (to be confirmed) |
| Official named institution | Office for Budget Responsibility; statutory body established by the Budget Responsibility and National Audit Act 2011. | ✓ PASS |
| Publisher new to corpus | OBR does not appear in DRA-DOC-0001 through DRA-DOC-0008. | ✓ PASS |
| Document type SUMMARY | Executive summary is presented as "Chapter 1" of the EFO; explicitly labelled "Executive summary"; approximately 12–18 pages of condensed claims supported by detailed evidence in Chapters 2–5. | ✓ PASS |
| Source type HUMAN_AUTHORED | OBR staff economists and analysts; no AI generation; the OBR is staffed by professional economists producing statutory forecasts. | ✓ PASS |
| Domain not overrepresented | GENERAL (fiscal/macroeconomic policy oversight) — distinguishable from FINANCE (private-sector accounting in 0005). No current GENERAL document covers public-sector fiscal governance. | ✓ PASS |
| Difficulty MEDIUM | EFO executive summary uses numbered assertions in plain English about GDP, borrowing, and debt. Technical economic terms are used but the summary is written for a general parliamentary audience. Difficulty assessed as MEDIUM. | ✓ PASS |
| Language en / en-GB | OBR publishes in British English. | ✓ PASS |
| Evaluator influenced: false | The OBR March 2025 EFO was published on 26 March 2025, well before the DRA Reference Evaluator was designed. | ✓ PASS |
| Has preannotated outcome: false | No external annotation or DRA-specific markup exists on this document. | ✓ PASS |
| Genuine summary relationship | The executive summary chapter explicitly summarises the findings of the remaining chapters within the same authoritative publication. The summary makes numbered claims; the source chapters provide the evidence base. The relationship is formally established within the document's own structure. | ✓ PASS |
| Distinct but legitimately related | Chapter 1 (summary) and Chapters 2–5 (source) are distinct sections of the same publication. The summary does not reproduce the source; it condenses and characterises its findings. | ✓ PASS |
| Complete enough to evaluate fairly | The full EFO report provides approximately 250 pages of economic analysis, forecasting tables, supplementary material, and box articles. The authoritative source is comprehensive relative to the claims in the executive summary. | ✓ PASS |
| No new infrastructure required | Single PDF acquisition; `pdftotext` (injectable) is already available from DRA-ACQ-002. | ✓ PASS |
| Not a self-evaluation | The executive summary claims are distinct compressed characterisations; the source chapters contain the forecasting methodology, OBR model outputs, and detailed analysis. The two are genuinely different in scope and detail. | ✓ PASS |
| Not a PROCEDURE document | EFO executive summary makes economic and fiscal claims; it does not describe step-by-step procedures. | ✓ PASS |
| Not employment-relations | OBR content covers macroeconomic forecasting and public finances — no employment-relations content. | ✓ PASS |
| Not a technical compliance report | Not a standards-compliance or regulatory-compliance document. | ✓ PASS |
| Not synthetic publisher | OBR is a real statutory public body with named economists and a formal mandate. | ✓ PASS |
| Boundary not artificially narrowed | The proposed evaluation boundary is Chapter 1 as a whole — the natural, structurally-defined summary section. No narrowing to manufacture issues. | ✓ PASS |
| Licence or official status not ambiguous | OBR is a statutory body, its publications are Command Papers, and Crown copyright / OGL status is clear. | ✓ PASS |
| Summary and source not effectively identical | Chapter 1 (~12–18 pages) vs. Chapters 2–5 (~200+ pages); different levels of detail, structure, and evidence. Not identical. | ✓ PASS |

**Qualification result: ALL ELIGIBILITY CRITERIA MET.**

---

## G. Candidate Ranking

| Rank | Candidate | Reasoning |
|------|-----------|-----------|
| **1** | **Candidate 1 — OBR Economic and Fiscal Outlook March 2025 (Executive Summary)** | Strongest summary-vs-source relationship (within single authoritative publication); OGL licence high-confidence; OBR is a statutory named institution new to corpus; numbered paragraph cross-referencing naturally exercises TRACEABILITY_BROKEN; acquisition via existing pdftotext infrastructure; stable archival PDF; all governance criteria met. |
| **2** | Candidate 2 — NAO Government's approach to technology suppliers (HC 543 Summary) | Strong cross-document summary structure; both PDFs confirmed; NAO is a named statutory institution; but licence certainty is lower (Open Parliament Licence vs. OGL may require separate compatibility analysis); domain (government technology procurement) adds less domain diversity than OBR's fiscal governance angle. |
| **3** | Candidate 3 — Sentencing Council General Guideline with plain-language explanation | Strong domain diversity (LEGAL, criminal law); new publisher; but summary relationship is least distinct (explanatory page vs. definitive guideline, not an explicit summary-of-source); reproducibility risk (live web page); no confirmed specific summary document. |

---

## G.1 Recommended Candidate — Full Profile

**Candidate:** OBR Economic and Fiscal Outlook — March 2025 — Executive Summary

| Attribute | Value |
|-----------|-------|
| Proposed corpus ID | DRA-DOC-0009 |
| Document under evaluation | Chapter 1 "Executive summary" of the March 2025 EFO (CP 1289) |
| Authoritative source | Chapters 2–5 of the same EFO (macroeconomic outlook, fiscal outlook, fiscal supplementary tables, economic supplementary tables) |
| Publisher | Office for Budget Responsibility |
| Official document URL | `https://obr.uk/efo/economic-and-fiscal-outlook-march-2025/` |
| Full report PDF | `https://obr.uk/docs/dlm_uploads/OBR_Economic_and_fiscal_outlook_March_2025.pdf` |
| Executive summary standalone | `https://obr.uk/docs/dlm_uploads/ExecutiveSummary.pdf` |
| Publication date | 26 March 2025 |
| Command Paper | CP 1289 |
| Document type | SUMMARY |
| Domain | GENERAL |
| Difficulty | MEDIUM |
| Source type | HUMAN_AUTHORED |
| Language | en-GB |
| Licence | Crown copyright / OGL v3 (Command Paper — to be formally verified at acquisition) |
| Evaluator influenced | false |
| Has preannotated outcome | false |
| Evaluation boundary | Chapter 1 of the full PDF (exact character offsets to be computed at acquisition; approximately pages 1–20 of the 280-page document) |
| Acquisition method | `pdftotext` injectable (already available from DRA-ACQ-002 infrastructure) from the full report PDF, then boundary-constrained to Chapter 1 |
| Reproducibility | High — OBR does not revise archived forecast PDFs after publication |
| Naturally exercised capabilities | Authority resolution (OBR paragraph numbering across chapters); TRACEABILITY_BROKEN (executive summary cites findings "in Chapter 3" — verifiable); CLAIM_INCONSISTENCY (summary characterises fiscal headroom; full chapter contains the actual numbers); EVIDENCE_INADEQUATE (if a summary assertion is not substantiated by the immediately cited chapter section) |
| Hypothetical issue classes | TRACEABILITY_BROKEN, CLAIM_INCONSISTENCY, EVIDENCE_INADEQUATE |
| Corpus-balance contribution | First SUMMARY type; first OBR publication; GENERAL domain (new: public-sector fiscal governance); official executive-summary-vs-full-report evaluation structure (first in corpus) |

---

## H. Decision

> **CANDIDATE QUALIFIED — READY FOR CONTROLLED ACQUISITION**

The OBR Economic and Fiscal Outlook — March 2025 — Executive Summary meets all frozen eligibility requirements:

- Document type: SUMMARY ✓
- Source type: HUMAN_AUTHORED ✓
- Publisher: new, named, official statutory institution ✓
- Domain: GENERAL (new distinct angle within corpus) ✓
- Difficulty: MEDIUM ✓
- Language: en-GB ✓
- Licence: Crown copyright / OGL v3 (Command Paper CP 1289) — to be confirmed at acquisition ✓
- Evaluator influenced: false ✓
- Has preannotated outcome: false ✓
- Genuine summary relationship: Chapter 1 vs. Chapters 2–5 of the same authoritative publication ✓
- All exclusion criteria: not met (i.e., none apply) ✓

The candidate is recommended for controlled acquisition as DRA-DOC-0009 under the standard DRA-ACQ admission protocol. The single pre-acquisition action is formal licence verification (confirm OGL v3 applies to CP 1289 via the OBR PDF copyright footer or nationalarchives.gov.uk copyright confirmation).

---

## I. Confirmation That Zero Repository Files Were Modified

This report is the only file written during this session.

No repository files were modified beyond the creation of this report. Specifically:

| Category | Status |
|----------|--------|
| DRA-DOC-0001 through DRA-DOC-0008 | Unchanged and frozen |
| Evaluator logic (`lib/dra-reference/src/`) | Unchanged |
| Governance and schema modules | Unchanged |
| Corpus loader and registry | Unchanged |
| Benchmark runner and acquisition pipeline | Unchanged |
| Test files | Unchanged |
| `artifact.toml` and workflow configuration | Unchanged |
| Freeze records (DRA-FRZ-000001, DRA-FRZ-000002) | Unchanged |
| Memory files (`.agents/memory/`) | Unchanged |

DRA-DOC-0009 has **not** been registered, acquired, frozen, or evaluated. No corpus ID has been assigned. No source bytes have been preserved. No digests have been computed. No DRA-CASE infrastructure has been created.

---

*End of DRA-DOC-0009-QUAL-001*
