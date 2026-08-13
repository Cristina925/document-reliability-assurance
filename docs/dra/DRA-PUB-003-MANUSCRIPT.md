# Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents

*Working manuscript. Status: research-stage first candidate report (DRA-GC-1). Prepared as part of the DRA research programme's publication package (DRA-PUB-003), governed by `docs/dra/DRA-PUBLIC-CLAIMS.md`. This is a draft for technical review, not a peer-reviewed publication.*

---

## Rejected title candidates and selection rationale

Before settling on a title, the following candidates were drafted and rejected, each for a specific overclaim or ambiguity risk:

1. *"DRA: A Trust Infrastructure for the Age of Machine-Consumed Documents"* — rejected: presents "trust infrastructure" as an achieved state rather than a prospective interpretation, directly contradicting `DRA-PUBLIC-CLAIMS.md`'s ban on unqualified use of that phrase.
2. *"Solving Document Reliability with DRA"* — rejected: "solving" implies a completed, universal solution to an open-ended problem; DRA addresses a narrow, disclosed slice of that problem.
3. *"DRA: A Validated Evaluator for Reliable AI Document Consumption"* — rejected: "validated" without qualification reads as external validation, which has not occurred; also asserts an AI-consumption use case that has never been tested.
4. *"Towards Reliable Documents: The DRA Evaluator"* — rejected as too vague; does not name the specific technical contribution (evidence/authority/claim-consistency auditing) or its evidentiary basis (deterministic, reproducible, blind-tested).
5. *"DRA-GC-1: A Deterministic Evaluator for Evidence and Authority Auditing in Documents, with Blind Generalisation Evidence"* — closest fit, but reads as a technical report title rather than a manuscript title, and buries the more legible framing (document reliability) behind the internal candidate name.

**Selected title:** *"Document Reliability Assurance: A Deterministic, Evidence-Auditable Approach to Assessing Claim Support in Machine- and Human-Consumed Documents"*

This title was chosen because it: (a) names the actual technical mechanism (deterministic evaluation, evidence auditing) rather than an aspirational end-state; (b) uses "assessing claim support" rather than "verifying truth" or "ensuring reliability," matching the claim-boundary distinction that DRA evaluates evidentiary structure, not factual accuracy; (c) mentions "machine- and human-consumed documents" as the motivating context without asserting DRA has been deployed in either; and (d) contains no variant of "validated," "universal," "production," or "trust infrastructure."

---

## Abstract

Documents that carry consequential claims — regulatory guidance, scientific findings, financial disclosures, technical specifications — are increasingly consumed by automated systems as well as by people, yet the tooling available to assess whether such a document's claims are adequately evidenced and internally consistent has not kept pace. Mere availability or superficial authenticity of a document (it loads, it is signed, it comes from a known domain) does not establish that its substantive claims are properly supported. This manuscript reports on Document Reliability Assurance (DRA), a research-stage reference evaluator that assesses documents against a defined, disclosed set of reliability issue classes — evidence absence, evidence inadequacy, and internal claim inconsistency are the three classes exercised by the current implementation, out of nine formally defined — using a deterministic, eight-stage evaluation pipeline whose outputs are bound to cryptographically verifiable proof receipts.

We report the first frozen, publication-candidate state of the evaluator (DRA-GC-1, version 0.1.2), and its accumulated internal evidence base: a 33-document, hypothesis-driven development corpus used to discover representation and robustness gaps; a documented robustness programme that engineered-and-closed five demonstrated defects and disclosed four accepted representation-boundary limitations; and two internal, pre-registered, contamination-blind generalisation studies (DRA-GEN-001, 75 of 100 locked documents evaluated after a protocol-driven exclusion of one entire stratum, and DRA-VAL-002, a targeted 25-document follow-up purpose-built to close that stratum) totalling 100 blindly-evaluated documents across two separate protocols. Across these two studies, DRA-GC-1's outcomes were broadly consistent with development-corpus behaviour for English- and Spanish-language PDF and HTML content from UK, US, and EU public-sector publishers, with one confirmed, disclosed material exception: a controlled 25-pair experiment found Stage 5 (materiality) accuracy of 25/25 for English versus 11/25 for Spanish, traced to five English-only lexical rules; a proposed correction was independently rejected at admission review after adversarial testing revealed a new failure mode, and DRA-GC-1 retains this limitation, disclosed rather than fixed.

DRA-GC-1's evaluations are deterministic and reproducible from frozen input bytes via digest-verified proof receipts, but reproducibility from live re-fetch of original source URLs is not guaranteed and was observed to fail for a meaningful fraction of sources across both studies. No third party has yet independently implemented, re-run, or evaluated DRA-GC-1 — external validation remains a stated, unmet requirement, not a formality. We present this as a first, internally rigorous research candidate with disclosed scope and limitations, intended as a basis for external scrutiny and future validation work, not as an established or universally reliable trust mechanism.

---

## 1. The problem

A growing share of documents with consequential claims — government guidance, regulatory notices, scientific papers, technical standards, financial statements — are read not only by people but by automated systems: search indexes, retrieval-augmented generation pipelines, compliance tooling, and increasingly, autonomous agents that must decide whether to act on what a document says. The question these consumers face is not "does this document exist and come from where it claims to" but "are this document's substantive claims properly supported, and is the document internally consistent." These are different questions, and the tooling that answers the first (TLS certificates, digital signatures, domain reputation, document metadata, availability checks) does not answer the second.

A document can be perfectly authentic — correctly signed, served from the right domain, unmodified in transit — while still making claims that cite no identifiable source, cite evidence that does not actually support the claim being made, or contradict themselves internally. Conversely, a document can look unremarkable and still be well-evidenced and internally consistent. Authenticity and availability are necessary but not sufficient conditions for the kind of reliability that matters to a downstream consumer deciding whether to trust a claim.

## 2. Why availability and authenticity are not enough

Existing infrastructure for document trust is concentrated almost entirely at the transport and identity layer: is this bit stream what the claimed sender sent, unmodified, from a domain we recognise. This layer is necessary — a tampered or spoofed document cannot be reliable in any sense — but it is silent on the document's internal evidentiary quality. A correctly-authenticated PDF can still assert a compliance deadline without citing the regulation it derives from, or assert a threshold value while its supporting table lost its historical/forecast distinction to a PDF text-extraction artefact. No signature, hash, or domain check can detect either failure, because both are properties of the document's content and structure, not its transport integrity. DRA is motivated by this gap: assessing evidentiary structure — is a claim traceable to an identifiable authority, is the cited evidence adequate, is the document self-consistent — as a distinct concern from transport-layer authenticity.

## 3. DRA's conceptual model

DRA formalises document reliability as a question about **claims**, not about documents as opaque wholes. A document is decomposed into individual substantive statements (claims); each claim is checked for (a) whether it can be traced to an identifiable authority or source, (b) whether evidence supporting the claim is present and adequate in the document's own citation apparatus, and (c) whether the claim is consistent with the document's other claims. These three concerns map to a formally defined taxonomy of nine canonical issue classes (`UNSUPPORTED_CLAIM`, `AUTHORITY_EXPIRED`, `AUTHORITY_ABSENT`, `EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `EVIDENCE_CONFLICT`, `CLAIM_INCONSISTENCY`, `TRACEABILITY_BROKEN`, `SCOPE_VIOLATION`), each representing a distinct way a claim's evidentiary structure can fail.

A central methodological commitment distinguishes DRA from an ad hoc heuristic checker: every evaluation is deterministic and produces a cryptographically verifiable proof receipt binding the evaluator's identity, the input document's identity, the stage-by-stage evaluation record, and the final decision into a single digest. This makes every decision independently re-checkable without re-running the evaluation or trusting the original run — a property this manuscript treats as one of DRA's most concretely demonstrated contributions (Section 11).

## 4. Architecture and methodology

DRA-GC-1 implements an eight-stage evaluation pipeline: (1) input normalisation, (2) claim/statement extraction and segmentation, (3) authority resolution, (4) evidence linkage, (5) materiality assessment, (6–7) consistency checking and issue-class detection, and a final stage that assembles the seven-record proof receipt and renders a decision (`SUPPORTED`, `HOLD`, or `REVIEW`, depending on the issues found and their materiality). Every stage's output is included, in canonical serialised form, in the substantive digest that the proof receipt commits to; only genuinely operational fields (timestamps, evaluation IDs) are excluded from this digest, so that re-evaluating the same bytes with the same evaluator version always reproduces the same digest.

This architecture was built incrementally: the canonical data model and each pipeline stage were engineered and hardened in sequence (claim extraction, authority resolution, evidence linkage, materiality assessment, consistency/issue detection), followed by a governance layer that manages document acquisition, corpus admission, and evaluator/candidate freezing as first-class, digest-bound operations — not informal file management. This governance layer is what later made it possible to freeze DRA-GC-1 as an immutable, independently re-hashable artefact (Section 7) and to bind two separate blind studies to that exact frozen artefact (Sections 8–9).

## 5. Development methodology

DRA's development corpus comprises 33 admitted documents (identifiers `DRA-DOC-0001` through `DRA-DOC-0032` and `DRA-DOC-0034`; `DRA-DOC-0033` was reserved for a planned Hindi/Devanagari acquisition but never admitted, having been blocked at the acquisition stage by a sustained third-party rate limit — it is not counted as evidence anywhere in this manuscript). This corpus spans five topical domains (finance, healthcare, technical, legal, general), a broad mix of UK (GOV.UK, ONS, ICO), US (NIST, FDA, EIA/DOE, CDC, GPO/GovInfo, Congressional Research Service, EPA, FTC, Census Bureau), and EU/international publishers (European Commission, OECD, PLOS, Basel Committee on Banking Supervision, CNIL, INE, CNMV), one Japanese national publisher (Cabinet Office), both PDF (native-text, OCR-derived, and scanned/image-hybrid) and HTML formats, and five languages spanning three writing systems: Latin script (English, Spanish, French), the Japanese writing system (a mixed logographic/syllabic system combining kanji, hiragana, and katakana), and Cyrillic script (Bulgarian).

Critically, this corpus was **not** assembled as a representative population sample. It was built by deliberate, hypothesis-driven selection: each acquisition after the initial broad-coverage phase targeted a specific representation or robustness dimension — footnote density, tabular shading semantics, citation linkage, OCR/scan fidelity, non-textual graphics, extreme document scale, document supersession, non-Latin scripts, multi-column layout — chosen precisely because it was expected to stress a particular part of the pipeline. Its diversity is real and its discovery value is high, but it is explicitly reserved in this manuscript for **discovery** claims ("the programme found and characterised these representation failure modes"), not **generalisation** claims ("DRA-GC-1 performs reliably on an unseen, representative sample") — that distinction is preserved throughout this document and rests instead on the two blind studies described in Sections 8 and 9.

## 6. The robustness programme

Following the development corpus's broad-coverage phase, a deliberate robustness programme (documents `DRA-DOC-0024` onward) systematically probed representation and evaluation-robustness dimensions. The programme's outcomes, summarised precisely (not rounded up):

- **Five defects engineered and closed, with regression evidence:** a quadratic-time scalability defect in Stage 4 evidence linkage (fixed via reference-keyed caching, reducing a 25,603-statement document's evaluation time from 35–45 minutes to under 5 seconds, with an exactness proof and zero decision/digest change); two citation-linkage extraction defects (bracket-internal line-wrap loss and reference-list shredding); a three-part legal-authority/document-currentness chain (adding a previously nonexistent capability to detect that an authentic, well-evidenced document had been superseded); Unicode segmentation for non-Latin, non-whitespace-delimited scripts (fixing a defect that caused 75.4% content loss on a Japanese-language document, reduced to 0% after the fix, decision unchanged); and a lowercase-follows-period sentence-boundary false positive.
- **Four accepted, disclosed representation-boundary limitations** (deliberately not "fixed," because the underlying loss occurs during PDF/HTML-to-text extraction, upstream of anything the evaluator's decision logic can recover): footnote/endnote flattening, table historical/forecast cell-shading semantics, OCR/scan content corruption, and non-textual graphics/diagram meaning. For each, a positive-evidence *detection* mechanism was built and validated (a fill-colour-diversity signal for shading loss with a 0% false-positive rate across the full corpus; independent provenance/fidelity metadata for OCR fidelity; a six-property graphical-semantic-completeness model for diagrams) even though the underlying content loss itself remains, by design, uncorrected.
- **One partially-closed defect:** multi-column reading-order reconstruction. An opt-in, bounding-box-based column-detection engine measurably improved pair-adjacency preservation on the document that discovered the defect (from approximately 39% to approximately 56%) and performed cleanly on an out-of-sample pure multi-column control document, but on hybrid prose/table layouts it deliberately falls back to unmodified passthrough rather than guessing at structure it cannot confidently resolve. This residual state is formally classified `AMBIGUOUS-REPRESENTATION-LIMITED`.
- **One open, disclosed, never-engineered defect:** cross-language (English/Spanish) divergence in Stage 5 materiality classification, characterised in a controlled experiment (Section 8's companion investigation, `DRA-ENG-026`) but deliberately not corrected in DRA-GC-1 — discussed fully in Section 9.
- **Two dimensions formally untested by design**, per an explicit single-variable-per-experiment discipline adopted early in the programme: intra-document mixed-language (code-switched) text, and compound/extreme documents combining several stress dimensions simultaneously.

The resulting known-defect ledger contains ten entries (D1–D10), of which zero are rated a freeze blocker; the review that produced this ledger (`DRA-ROB-002`) is what authorised freezing DRA-GC-1.

## 7. DRA-GC-1: the freeze

DRA-GC-1 is the programme's first — and to date only — frozen, publication-candidate state: evaluator version `0.1.2`, pipeline version `1.0`, model/schema version `0.1.0`, and corpus version `DRA-CORPUS-1.0.0`, frozen 2026-08-12 at repository commit `21e0e6a11452754a7aa258d799226553f3cb1d38`. Its identity is a single canonical aggregate digest, `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`, computed over exactly 63 decision-affecting files (54 core evaluator files plus 9 acquisition-representation files that determine what text reaches the evaluator). Corpus governance/admission workflow, network-fetch mechanics, and all benchmark-programme tooling are explicitly and documentedly excluded from this digest as non-decision-affecting.

The freeze prevented exactly what it is meant to prevent: any change to the 63 frozen files after this point would change the aggregate digest and would be immediately detectable by re-hashing, without needing to trust a changelog or commit message. This matters methodologically because both blind studies described below were run against this exact digest, and — as Section 10 argues — the fact that the digest has not moved through either study, nor through a rejected candidate-improvement attempt, is itself part of the evidence that DRA-GC-1's blind-study results are not an artefact of tuning to the test material.

## 8. DRA-GEN-001: the blind generalisation study

DRA-GEN-001 is an internal, pre-registered, contamination-blind generalisation study: a stratified sample of 100 documents was locked under a frozen protocol — four strata of 25 each (English PDF, Spanish PDF, English HTML from GOV.UK, Spanish HTML) — drawn from sources with no overlap with the 33-document development corpus, verified explicitly during protocol construction. Of the 100 locked units, 75 were evaluated; 25 (the entire English-HTML stratum) were excluded under the taxonomy category `EXTERNAL_ACQUISITION_FAILURE`, because the study's protocol required a live re-fetch-and-verify step at execution time, and all 25 GOV.UK pages in that stratum had drifted their live content between sample lock and execution — a combination of the protocol's own re-fetch-to-verify design and the genuine, ordinary update cadence of frequently-revised government web pages, not a failure of DRA-GC-1's evaluation pipeline (which never ran on the excluded units).

Across the 75 evaluated documents: 64 `SUPPORTED`, 10 `HOLD`, 1 `REVIEW`. Operational-reliability endpoints — pipeline completion, proof-integrity re-verification, and determinism repeatability — were all 75/75 (100%, Wilson 95% CI [95.1%, 100%]; rule-of-three approximation ≤4.0% at n=75) on the evaluated subset. Measured against the full locked sample of 100, acquisition success was 75/100 (75.0%, Wilson 95% confidence interval [65.7%, 82.5%]) and material failure was 0/100 (95% CI [0%, 3.7%]); these two denominators — 75 evaluated and 100 locked — answer different questions and are kept separate throughout this manuscript, per the study's own protocol. Within the evaluated subset, the same 3-of-9 issue-class reachability finding described in Section 4 was reproduced within this blind-study sample (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY` observed; the other six not observed). A descriptive pattern — zero-issue `SUPPORTED` outcomes across both Spanish strata (50/50) versus 11/25 non-`SUPPORTED` outcomes in the evaluated English-PDF stratum — was noted but is confounded by publisher and jurisdiction differences between the Spanish and English source sets, and is classified an exploratory signal, not a validated language effect.

DRA-GEN-001's own preserved verdict is `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`, with a documented follow-up requirement to close the lost English-HTML stratum. This manuscript does not upgrade or reinterpret that verdict; it is treated as a historical, frozen finding describing what was known at the time GEN-001 concluded.

GEN-001 must be described, precisely, as an internal, pre-registered, contamination-blind generalisation study. "Blind" here means the sample was drawn and locked before evaluation, under a protocol fixed in advance, with no ability to select or adjust the sample based on how DRA-GC-1 would perform on it. It must never be described as an external or third-party validation: every part of GEN-001's design, execution, and review was conducted within this same research programme.

## 9. ENG-026 and the rejected GC-2 candidate

GEN-001's descriptive Spanish/English pattern (Section 8) prompted a dedicated, controlled follow-up investigation, `DRA-ENG-026`, built specifically to determine whether a real, mechanistic defect underlay the observed pattern, rather than accepting it as evidence on its own. Using a controlled, non-blind, 25-valid-pair matrix spanning 13 semantic classes of parallel English/Spanish content, the frozen Stage 5 (materiality) rules scored 25/25 on the English side and 11/25 on the Spanish side — 14 of 25 pairs diverged, entirely in the false-negative direction (no false positives were observed on this original matrix). Five separate ablation experiments ruled out morphological variation, negation, word order, and punctuation as causes, isolating the mechanism precisely: exactly five of the roughly 24 Stage 5 rules have English-only lexical triggers, and simply do not fire on equivalent Spanish text. This is classified a `CONFIRMED_BOUNDED_DEFECT` — bounded because the 11 non-divergent pairs reflect the same structural rule coverage gaps present in both languages, not an English-only failure across the board.

ENG-026 also built an experimental corrected version of the affected rules (kept in a separate, non-imported, non-frozen file, never merged into GC-1) that resolved all 14 of 14 divergences on the original matrix with zero English-side regression, and — critically, verified explicitly — zero change to DRA-GC-1's own aggregate digest. ENG-026's own conclusion was two-part: the investigation itself was closed as engineering characterisation work, but a new candidate freeze was explicitly judged `GC_2_NOT_JUSTIFIED` on the grounds that a controlled experiment alone, without blind cross-corpus evidence, does not justify freezing a new candidate evaluator.

A separate, subsequent review, `DRA-GC2-REV-001`, then specifically assessed whether the ENG-026 correction was mature enough to admit as a new frozen candidate (DRA-GC-2). This review independently reproduced ENG-026's own evidence and reconfirmed DRA-GC-1 was unmodified, but its mandatory adversarial lexical probing — testing the correction against inputs it had not been built or tuned against — found new, reproducible false positives specific to the Spanish lexical tokens the correction adds, most notably the Spanish phrase *"es preciso"* (ordinarily "precise" or "accurate," but colliding with the obligation-sense pattern the correction targets), with no equivalent ambiguity risk identified on the English side. Because remedying this would require further decision-affecting regex changes — outside the scope of an admission review, which is only permitted to accept or reject an existing correction as-is — the review's verdict was `DRA_GC_2_ADMISSION_REJECTED`.

This manuscript treats the GC-2 rejection as a substantive scientific result, not a failed engineering attempt to be minimised. It demonstrates methodological restraint: a superficially attractive fix that resolved every failure on its own test matrix was still rejected once adversarial testing outside that matrix surfaced a new class of risk, rather than being adopted because it "passed its own tests." Retaining DRA-GC-1 — with the Spanish-materiality limitation disclosed and unfixed — over adopting a correction with a demonstrated but different failure mode is, in this programme's judgement, the methodologically stronger choice, and it is reported here exactly as it occurred rather than reframed as a completed fix.

## 10. DRA-VAL-002: the targeted follow-up

DRA-VAL-002 is a second, separate, internal, pre-registered, contamination-blind study, purpose-built to close exactly the one coverage gap GEN-001 left open: unseen English-language HTML. Its sample comprised 25 locked units across three publisher families — 9 UK government (GOV.UK, Open Government Licence v3.0), 8 Office for National Statistics (OGL v3.0), and 8 US federal agencies (Census Bureau, FTC, EPA; US federal public domain under 17 U.S.C. §105). Its architectural correction, directly targeting GEN-001's failure mode, was to persist the actual frozen source bytes for every locked unit to disk at freeze time, so that Phase 2 evaluation reads those persisted bytes directly with zero network access during evaluation staging — eliminating the re-fetch-to-verify step that destroyed GEN-001's HTML stratum.

Results: 25 of 25 units achieved `SUCCESSFUL_EVALUATION` across two independent runs at different fixed timestamps (Run A and Run B), with 100% acquisition, pipeline-completion, proof-integrity, and Run-A-versus-Run-B determinism-repeatability rates (Wilson 95% CI [86.7%, 100%] on each measured rate, reflecting the smaller sample size relative to GEN-001) and zero material failures (rule-of-three upper bound 12%). The decision distribution was 24 `SUPPORTED` and 1 `REVIEW` (one `EVIDENCE_INADEQUATE` issue, agreed identically by both runs). A post-hoc, non-gating observation performed after the analysis was already complete — solely for transparency, not as part of the study's own evidence — found that of the 25 source URLs, 15 were still byte-identical to the frozen copy at observation time, 7 had drifted, and 3 were unreachable (HTTP 429); this corroborates, rather than contradicts, the diagnosis in Section 8: a re-fetch-verification design, as GEN-001 used, would again have discarded a substantial fraction of this sample (10 of 25, 40%).

DRA-VAL-002's preserved verdicts are `DRA_VAL_002_COMPLETE` and `ENGLISH_HTML_GAP_CLOSED`. It must not be described as third-party or external validation: it is a second internal study, methodologically distinct from GEN-001 (different protocol, different sample-lock event, different acquisition architecture), that is evidentially independent of GEN-001 in the specific sense that it drew a wholly separate, non-overlapping sample under a separate pre-registered protocol — not independent in any organisational sense. It reduces the specific uncertainty GEN-001 left open (whether DRA-GC-1 could be evaluated at all on unseen English HTML without losing the entire sample to acquisition failure); it does not reduce, and does not attempt to address, any of the other limitations disclosed in Section 12 — including external validation status, non-Latin script coverage beyond the Japanese and Cyrillic scripts tested, or the Spanish-materiality limitation from Section 9.

Consistent with the programme's own non-merge discipline, GEN-001 and VAL-002 are reported throughout this manuscript as two separate studies with their own denominators, exclusions, and confidence intervals — never folded into a single pooled "100/100" statistic. The one legitimate combined statement: across the two studies, DRA-GC-1 has now been blindly evaluated on 100 total documents (75 from GEN-001, 25 from VAL-002) under two separately governed protocols, with the sole material coverage gap the first study identified directly and successfully addressed by the second.

## 11. Principal empirical findings

1. **Determinism and reproducibility from frozen evidence** (Section 3, Sections 8–10): every evaluation across both blind studies re-verified at 100% via independent proof-receipt digest recomputation, and Run-A/Run-B repeat evaluation in VAL-002 produced byte-identical results.
2. **Issue-class coverage ceiling of 3 of 9**: proven, not merely observed, via code-path analysis (`reachability-matrix.ts`) and confirmed identically inside both blind studies' own evaluated samples. `EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, and `CLAIM_INCONSISTENCY` are the only classes the frozen Version 1 evaluator can currently produce.
3. **Broadly consistent generalisation for the tested scope, with one confirmed exception**: across 100 blindly-evaluated documents in English and Spanish, PDF and HTML, from UK/US/EU public-sector publishers, DRA-GC-1's decision behaviour was consistent with development-corpus expectations, except for the confirmed Spanish-language Stage 5 materiality degradation (Section 9), which is disclosed, not hidden or minimised.
4. **A disciplined robustness programme that found real defects and disclosed real limitations**: five demonstrated defects closed with regression evidence; four representation-boundary limitations disclosed with positive detection evidence rather than silently accepted; one defect partially closed with an honest, fails-safe residual.
5. **A rejected candidate improvement, reported as a positive scientific result**: the Spanish-materiality correction that would have "fixed" finding 3 was built, evaluated, and rejected once adversarial testing exposed a new risk class — evidence of methodological discipline, not evidence that the underlying limitation has been resolved.
6. **Live-source reproducibility limits, measured twice**: 25 of 25 GEN-001 HTML sources drifted between lock and execution; a subsequent, independent VAL-002 post-hoc check found 7 of 25 sources drifted and 3 of 25 were rate-limited within a similar timeframe. Reliable reproducibility of this programme's findings depends on the frozen, persisted source bytes and proof-receipt verification (Mode A, Section 13), not on re-fetching original URLs (Mode B).

## 12. Development corpus and quantitative results

See Tables 1–6 (Appendix). All figures below are drawn directly from the frozen manifests, freeze receipts, and study reports cited throughout this manuscript; no percentage in this manuscript is computed over a denominator not explicitly stated alongside it.

## 13. Reproducibility and evidence integrity

DRA's reproducibility claims are structured around two explicitly separated modes, defined in full in `docs/dra/DRA-REPRODUCIBILITY.md`:

- **Mode A — frozen-evidence reproduction.** Uses only the byte-identical, locally-persisted representations already present in the repository (persisted raw source bytes for VAL-002's 25 documents, frame and result metadata for GEN-001, and every frozen manifest's recorded digests). Requires no network access. This is the mode every reproducibility claim in this manuscript rests on, and it was re-verified as part of assembling this publication package: the full set of GC-1, GEN-001, VAL-002, PUB-001, and ROB-002 freeze-integrity and evidence-synthesis suites — 25 test files, 816 individual tests — passed in full both before and after this manuscript's supporting documents were written, confirming no evidence-bearing artefact was altered in the course of producing this publication package.
- **Mode B — live-source reacquisition verification.** An optional, explicitly non-gating check that re-fetches a document from its canonical publisher URL and compares it against the recorded digest. Mode B can fail — and, as Sections 8 and 10 report, has been observed to fail on a meaningful fraction of sources in both directions of this programme's own testing — for reasons entirely external to DRA (publisher content updates, rate limiting, redirects, anti-bot controls, source removal). A Mode B failure is never evidence of a Mode A (frozen-evidence) failure, and this manuscript treats the two as strictly non-interchangeable.

Underlying both modes is the proof-receipt mechanism described in Section 3: every evaluation's substantive digest can be independently recomputed and compared without re-running the pipeline, and every frozen candidate's (and study's) own identity is bound to a recomputable aggregate digest. This manuscript does not report the underlying repository as free of all defects: two disclosed, pre-existing residuals — 8 test failures confined to non-evaluator investigation modules referencing a stale evaluator-version literal, and 16 TypeScript type-strictness errors confined to a non-evaluator protocol-definition module and two acquisition-discovery files — remain present, confirmed to touch neither the evaluator nor any frozen evidence binding, and are disclosed rather than silently omitted (`docs/dra/DRA-REPRODUCIBILITY.md`, §10).

## 14. Limitations

This section is deliberately explicit rather than a boilerplate disclaimer; each item below is drawn from a specific, evidenced finding elsewhere in this manuscript, not asserted as a generic caveat.

- **No external, third-party validation has yet been performed.** Every piece of evidence in this manuscript — the development corpus, the robustness programme, both blind studies, and this publication audit itself — was produced within the same research programme, by the same team, using the same evaluator and infrastructure. No outside party has independently implemented, re-run, or evaluated DRA-GC-1 against a sample it did not select. This is the single most significant open item before any stronger claim could be made.
- **Finite study populations.** GEN-001 evaluated 75 of 100 locked documents; VAL-002 evaluated 25. These are not small numbers for an internal blind study, but they are finite, and confidence intervals (Wilson score and rule-of-three, reported throughout Sections 8 and 10) reflect genuine sampling uncertainty rather than certainty.
- **Publisher, domain, language, and script boundaries.** Blind evidence covers English and Spanish content, PDF and HTML formats, and UK/US/EU public-sector publishers specifically. The development corpus additionally exercises French, Japanese, and Bulgarian, but only Japanese (its own mixed logographic/syllabic writing system) and Bulgarian (Cyrillic script) have ever tested non-Latin script handling — no Devanagari, Arabic, Hebrew, Hangul, or Chinese/Korean document has ever been admitted or evaluated.
- **The development-corpus-versus-generalisation-evidence distinction is load-bearing.** The 33-document development corpus is real, diverse, and useful for discovering robustness gaps, but it was assembled by deliberate selection, not sampled to represent a population; it must not be cited as generalisation evidence, which rests specifically on GEN-001 and VAL-002.
- **Extraction and representation limitations are real and disclosed, not corrected.** Footnote flattening, table cell-shading semantics, OCR/scan corruption, and non-textual graphical meaning are all confirmed content-loss modes upstream of the evaluator's decision logic; detection mechanisms exist for each, but the underlying loss does not.
- **DRA's assessment quality depends on the source document's own citation apparatus and available evidence.** DRA traces and audits a document's own cited evidence; it does not independently fact-check claims against external ground truth, and cannot compensate for a document that omits citations it should have included.
- **Authority and provenance inference has real limits.** Authority resolution and currentness/supersession detection operate on signals present in the document and its metadata; they do not constitute an independent chain-of-custody or legal-authority verification service.
- **Live-source instability materially affects reproduction of the original acquisition process** (though not of already-recorded, frozen evaluations) — see Section 13's Mode A/Mode B distinction and the drift rates measured in Sections 8 and 10.
- **Applicability to production automated-decision environments has not been established.** DRA has never been deployed as, or tested as, a component gating or informing an automated decision pipeline, a machine-to-machine document exchange, or any production system. This is a potential future application area, not a demonstrated one.
- **The "trust infrastructure" framing remains prospective, not demonstrated.** A long-term design aspiration for DRA is to serve as one building block toward more reliable machine and human consumption of documents; this manuscript treats that framing strictly as interpretation and future direction (Section 15), never as an achieved fact.

## 15. Implications

The evidence in this manuscript supports a narrow but concrete claim: a deterministic, reproducible evaluator can be built that meaningfully distinguishes documents with adequate, self-consistent evidentiary support from those without it, at least for the three issue classes it currently reaches and within the disclosed scope of languages, formats, and domains this programme has tested, and that this capability survives contact with an internal, pre-registered, contamination-blind evaluation exercise rather than only performing well on material it was tuned against. The methodological pattern demonstrated here — freeze a candidate before blind testing, test it blindly, investigate what the blind test reveals, and reject a proposed correction when adversarial testing finds it trades one failure mode for another — is, we believe, itself a transferable contribution independent of DRA's specific implementation.

It is reasonable, on this evidence, to argue that further investigation of DRA — or evaluators built on similar principles — as a component of infrastructure for more reliable machine-consumed document trust is worth pursuing. It is not reasonable, and this manuscript does not argue, that DRA has already become such infrastructure, that it has been validated by any party outside this programme, or that its current 3-of-9 issue-class coverage and disclosed language/script boundaries represent a solved problem. The chain from evidence to interpretation to future possibility is deliberately kept visible throughout this manuscript rather than compressed into a single confident claim.

## 16. Future work: external validation and deployment research

The most important next step this programme identifies is external, independent validation: an evaluation of DRA-GC-1 (or a successor candidate) conducted by a party outside this research programme, ideally against a sample it selects itself, with its own tooling for verifying determinism and proof-receipt integrity. Additional concrete directions, each tied to a specific disclosed limitation above: closing the Spanish-materiality gap with a correction that survives adversarial testing (the GC-2 rejection in Section 9 defines the bar any future correction must clear); admitting and evaluating documents in additional script families (Devanagari/Brahmic, Arabic/Hebrew abjad, Hangul); a dedicated experiment on intra-document mixed-language and compound/extreme documents; and — should DRA be considered for any production or automated-decision role — a dedicated deployment study measuring its behaviour under adversarial or high-stakes conditions that neither the development corpus nor either blind study was designed to probe.

---

## Authorship and AI-assistance disclosure

This research programme was directed by a human principal, who set its research questions, approved each phase's scope and gating decisions (including the decision to reject the GC-2 candidate and to commission this publication audit), and bears final responsibility for every claim in this manuscript and its accompanying publication package. The evaluator's implementation, the acquisition and freeze infrastructure, the blind-study protocols and execution code, and this manuscript's drafting were produced with substantial AI assistance (an AI coding agent operating under human direction), including AI-assisted research synthesis, code generation, test and report generation, and repository-grounded verification of every quantitative claim in this document against the underlying frozen artefacts. No human contributors beyond the directing principal are named or implied; no AI system is listed as an author of this manuscript. Every quantitative and factual claim in this manuscript was checked, as part of producing it, against the specific repository artefact it cites (test result, digest, ledger entry, or report) rather than transcribed from an earlier conversational summary.

---

## Appendix: Tables

### Table 1 — Development corpus characteristics

| Property | Value |
|---|---|
| Documents admitted | 33 (`DRA-DOC-0001`–`0032`, `0034`) |
| Documents reserved but never admitted | 1 (`DRA-DOC-0033`, blocked at acquisition, not counted as evidence) |
| Domains | Finance, Healthcare, Technical, Legal, General |
| Formats | PDF (native-text, OCR-derived, scanned/image-hybrid), HTML (including multi-page and Cloudflare-fronted) |
| Languages / scripts | English, Spanish, French (Latin script); Japanese (mixed logographic/syllabic writing system: kanji, hiragana, katakana); Bulgarian (Cyrillic script) |
| Largest document by scale | `DRA-DOC-0030`, 25,603 statements (NIST SP 800-53 Rev. 5) |
| Purpose-built relational pair | `DRA-DOC-0030`/`DRA-DOC-0031` (document supersession/currentness) |
| Corpus construction method | Deliberate, hypothesis-driven selection for robustness-gap discovery — not a representative population sample |

### Table 2 — Evidence hierarchy / programme stages

| Level | Evidence type | Scale | Blindness | Status |
|---|---|---|---|---|
| 1 | Unit/engineering tests | Thousands of unit tests across the 8-stage pipeline | N/A (white-box) | Passing |
| 2 | Development corpus | 33 documents | Not blind (deliberate selection) | Complete for discovery purpose |
| 3 | Robustness/defect programme | 18-dimension matrix, 10-entry defect ledger | Not blind (targeted experiments) | `READY_FOR_DRA_GC_1_FREEZE` |
| 4 | DRA-GEN-001 blind generalisation study | 100 locked / 75 evaluated / 25 excluded | Fully blind, pre-registered | `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION` |
| 5 | DRA-VAL-002 targeted blind follow-up | 25 locked / 25 evaluated | Fully blind, pre-registered | `ENGLISH_HTML_GAP_CLOSED` |
| — | External independent validation | 0 | N/A | `EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED` |

### Table 3 — DRA-GEN-001 study design and outcomes

| Property | Value |
|---|---|
| Sample locked | 100 (4 strata × 25: PDF-English, PDF-Spanish, HTML-English, HTML-Spanish) |
| Evaluated | 75/100 |
| Excluded | 25/100 (entire HTML-English stratum, `EXTERNAL_ACQUISITION_FAILURE`) |
| Decision distribution (of 75 evaluated) | 64 `SUPPORTED`, 10 `HOLD`, 1 `REVIEW` |
| Operational-reliability rate (denominator 75) | 75/75 = 100% (Wilson 95% CI [95.1%, 100%]; rule-of-three approximation ≤4.0%) |
| Acquisition success rate (denominator 100) | 75/100 = 75.0% (Wilson 95% CI [65.7%, 82.5%]) |
| Material failure rate (denominator 100) | 0/100 (95% CI [0%, 3.7%]) |
| Issue classes observed | 3/9 (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`) — matches Section 4/12 exactly |
| Final verdict | `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION` |

### Table 4 — DRA-VAL-002 study design and outcomes

| Property | Value |
|---|---|
| Sample locked and evaluated | 25 (9 GOV.UK, 8 ONS, 8 US federal) |
| Runs | 2 (Run A, Run B; separate fixed timestamps) |
| Primary endpoint rates | 100% acquisition, pipeline completion, proof-integrity, and A-vs-B determinism (Wilson 95% CI [86.7%, 100%] each) |
| Material failure rate | 0/25 (rule-of-three upper bound 12%) |
| Decision distribution | 24 `SUPPORTED`, 1 `REVIEW` (1 `EVIDENCE_INADEQUATE` issue, agreed by both runs) |
| Post-hoc live-drift observation (non-gating) | 15/25 byte-identical, 7/25 drifted, 3/25 unreachable (HTTP 429) |
| Final verdict | `DRA_VAL_002_COMPLETE` / `ENGLISH_HTML_GAP_CLOSED` |

### Table 5 — Demonstrated properties and evidence source

| Property | Evidence source |
|---|---|
| Deterministic, digest-verifiable evaluation | `verifyReceiptIntegrity()`; GEN-001 75/75 and VAL-002 25/25 proof-integrity re-verification; VAL-002 Run A/B identical results |
| Frozen candidate identity, independently re-hashable | DRA-GC-1 freeze manifest/receipt; 26/26 freeze-integrity tests |
| 3 of 9 issue classes reachable, all 3 observed | `reachability-matrix.ts` (`DRA-CHK-002`); reconfirmed inside GEN-001's blind sample |
| 5 defects engineered and closed with regression evidence | ENG-016 (citation/reference-linkage), ENG-019 (Stage 4 scalability), ENG-020/021/022 (legal-authority/currentness/supersession chain), ENG-023 (Unicode segmentation), ENG-012/013/014/014A (bare-"EN"/EL-STANDARD-REF sentence-boundary false positive) closure reports |
| 4 representation-boundary limitations disclosed with positive detection evidence | ENG-015, ENG-017, ENG-018; ACQ-020/021/023/024/025 |
| Broad consistency across 100 blindly-evaluated documents (2 studies) | GEN-001 + VAL-002 reports (Sections 8, 10) |
| One confirmed, disclosed material limitation (Spanish Stage 5 materiality) | ENG-026 controlled matrix (25/25 EN vs 11/25 ES); GC2-REV-001 rejection |

### Table 6 — Known limitations / unresolved validation requirements

| Limitation | Status | Evidence |
|---|---|---|
| No external/third-party validation | Open, unresolved | Explicit `EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED` status |
| Spanish-language Stage 5 materiality degradation | Confirmed, disclosed, unfixed | ENG-026 (25/25 EN vs 11/25 ES); GC2-REV-001 rejection |
| Non-Latin script coverage limited to Japanese + Cyrillic | Confirmed scope boundary | 1 Japanese document (Japanese writing system) + 1 Bulgarian document (Cyrillic script); `DRA-DOC-0033` (Devanagari) never admitted |
| Multi-column layout reconstruction partial | Confirmed, partially closed | ENG-024/025 (~39%→~56% pair-adjacency; hybrid layouts fall back to passthrough) |
| Mixed-language / compound-extreme documents | Untested by design | Single-variable-per-experiment discipline (`DRA-ACQ-013`) |
| Live-source reproducibility of original acquisition | Confirmed limitation | GEN-001 25/25 stratum lost to drift; VAL-002 post-hoc 7/25 drifted, 3/25 unreachable |
| Applicability to production/automated-decision environments | Not established | No such deployment or test has occurred |
