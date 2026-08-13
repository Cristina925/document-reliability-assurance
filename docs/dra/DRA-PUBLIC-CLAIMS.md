# DRA Public Claims Register (Canonical Publication-Safe Language)

**Authority:** derived from `docs/dra/DRA-PUB-002-PHASE1-REPORT.md` §5 (claim-boundary matrix) and §6 (independence terminology). This document is the single source of truth for any external-facing wording about DRA (README, abstract, announcement, paper). If a draft sentence is not traceable to an entry below, do not publish it until it is added here and classified.

Every entry gives: canonical wording, an abstract-length version, its evidence reference, required qualification, and prohibited stronger variants.

---

## What DRA is

- **Canonical:** "DRA (Document Reliability Assurance) is a research-stage reference evaluator that assesses documents against a defined set of reliability issue classes — evidence absence, evidence inadequacy, and internal claim inconsistency — using a deterministic, multi-stage pipeline."
- **Abstract-length:** "DRA is a research-stage, deterministic document-reliability evaluator."
- **Evidence:** `docs/dra/DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md`; pipeline implementation under `lib/dra-reference/src`.
- **Qualification:** always describe it as "research-stage" — never omit this qualifier.
- **Prohibited:** "a production system," "an AI trust platform," "a document-verification service."

## What problem DRA addresses

- **Canonical:** "DRA addresses the problem of assessing whether a document's substantive claims are adequately evidenced and internally consistent, within a defined and disclosed scope of languages, formats, and domains."
- **Abstract-length:** "DRA assesses evidence adequacy and internal consistency in documents, within a disclosed scope."
- **Evidence:** programme specification; reachability matrix (3/9 classes reachable — see below).
- **Qualification:** must state the scope boundary in the same breath as the problem statement; do not state the problem in unscoped/universal terms.
- **Prohibited:** "DRA solves the problem of unreliable documents," "DRA verifies whether documents are true."

## What has been experimentally demonstrated

- **Canonical:** "DRA's evaluations are deterministic and cryptographically reproducible via proof receipts: re-running the frozen evaluator on the same input reproduces the same decision and the same substantive digest. On its 33-document development corpus, exactly 3 of the 9 defined issue classes are exercised, and the other 6 are proven structurally unreachable by the current implementation — not merely unobserved."
- **Abstract-length:** "DRA produces deterministic, digest-verifiable decisions; 3 of 9 defined issue classes are currently reachable by the implementation."
- **Evidence:** `model/proof-receipts.ts`, `pipeline/canonical-serialise.ts` (`verifyReceiptIntegrity`); `benchmark/analysis/reachability-matrix.ts`; `DRA-ROB-001`/`DRA-ROB-002`.
- **Qualification:** "structurally unreachable" must always be paired with "by the current implementation" — it is a code-path fact, not a claim about the real-world unimportance of those 6 classes.
- **Prohibited:** "DRA detects all forms of document unreliability," "DRA covers all 9 issue classes."

## DRA-GC-1

- **Canonical:** "DRA-GC-1 is the first frozen, publication-candidate state of the DRA evaluator (version 0.1.2), whose implementation, corpus bindings, and identity digest are fixed and machine-verifiable."
- **Abstract-length:** "DRA-GC-1 is the first frozen evaluator candidate (v0.1.2), identity-verifiable by digest."
- **Evidence:** `DRA-GC-1-FREEZE-SPECIFICATION.md`, `DRA-GC-1-FREEZE-RECEIPT.md`, `dra-gc-1-freeze-manifest.ts`.
- **Qualification:** "frozen" refers to code/version immutability, not to a claim that no further DRA research will occur.
- **Prohibited:** "DRA-GC-1 is the final version of DRA," "GC-1 is production-certified."

## DRA-GEN-001

- **Canonical:** "DRA-GEN-001 is a pre-registered, prospective, contamination-blind internal study in which DRA-GC-1 evaluated 75 previously unseen documents (of 100 sampled; 25 excluded as a then-unreachable HTML case later closed by VAL-002), producing outcomes broadly consistent with development-corpus behaviour, with one confirmed material exception in Spanish-language materiality assessment."
- **Abstract-length:** "In a pre-registered blind study, GC-1 evaluated 75 unseen documents with broadly consistent outcomes, excepting a disclosed Spanish-language limitation."
- **Evidence:** `DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md`, `DRA-GEN-001-POST-BLIND-EVIDENCE-REVIEW.md`.
- **Qualification:** always state "internal" — see independence terminology below. Never say "validated" without "internally."
- **Prohibited:** "independently validated," "externally validated," "peer-reviewed validation."

## DRA-VAL-002

- **Canonical:** "DRA-VAL-002 is a second, separate, pre-registered internal blind study of 25 previously unseen English-language HTML documents, purpose-built to close the one gap GEN-001 left untested; all 25 were evaluated successfully."
- **Abstract-length:** "A follow-up internal blind study of 25 English HTML documents closed GEN-001's untested gap."
- **Evidence:** `DRA-VAL-002-ENGLISH-HTML-VALIDATION-PROTOCOL.md`, `DRA-VAL-002-ENGLISH-HTML-BLIND-VALIDATION-REPORT.md`.
- **Qualification:** must be described as evidentially independent *of GEN-001's own sample* (a distinct, non-overlapping document set) — not organisationally independent.
- **Prohibited:** "third-party validated," "externally reviewed."

## Generalisation

- **Canonical:** "Across two internal blind studies (100 previously unseen documents combined, evaluated as 75+25 under separate protocols and never pooled into one statistic), DRA-GC-1 shows outcomes broadly consistent with its development-corpus behaviour for English content in PDF and HTML from UK/US/EU public-sector sources, with one confirmed, disclosed exception for Spanish-language materiality assessment."
- **Abstract-length:** "GC-1 generalises consistently to unseen English public-sector documents (PDF/HTML); Spanish generalisation is materially degraded and disclosed."
- **Evidence:** GEN-001 + VAL-002 reports; `DRA-PUB-001-CLAIM-EVIDENCE-MATRIX.md` (C4, C8).
- **Qualification:** every generalisation claim must name the tested scope (language/format/domain/publisher) — never state generalisation unscoped.
- **Prohibited:** "DRA generalises to unseen documents" (bare), "DRA works on any document," "DRA generalises across languages."

## Robustness

- **Canonical:** "DRA's robustness programme deliberately probed for and documented failure modes — including footnote flattening, citation line-wrap loss, OCR corruption, multi-column reading-order errors, non-Latin-script segmentation loss, and graphical-semantic loss — closing or bounding each one found, and disclosing residual limitations rather than omitting them."
- **Abstract-length:** "A dedicated robustness programme found, closed, or disclosed multiple extraction-fidelity failure modes."
- **Evidence:** `DRA-ROB-001-ROBUSTNESS-EVIDENCE-REVIEW.md`; ENG-011/015–019/023–025 closure reports.
- **Qualification:** "closed or bounded each one found" must not be read as "found all possible failure modes" — absence of further discovery is not evidence of absence.
- **Prohibited:** "DRA has no undiscovered failure modes," "DRA is fully robust."

## Determinism / reproducibility

- **Canonical:** "Given the same frozen input bytes, DRA-GC-1 always produces the same decision and the same cryptographically verifiable substantive digest. This determinism is a property of the frozen evaluator applied to fixed input bytes, not a guarantee that re-fetching a source URL later will yield identical bytes."
- **Abstract-length:** "DRA is deterministic and digest-verifiable on fixed input bytes; live re-fetch is not guaranteed to match."
- **Evidence:** `model/proof-receipts.ts`, `canonical-serialise.ts`; VAL-002 Run A/B byte-identical replication; VAL-002's own observed post-hoc live-URL drift.
- **Qualification:** always distinguish frozen-byte reproduction from live-source reproduction (see `DRA-REPRODUCIBILITY.md`, Mode A vs Mode B).
- **Prohibited:** "fully reproducible from the live web," "reproducible by anyone visiting the source URL."

## Evidence / provenance / authority handling

- **Canonical:** "DRA's authority-resolution and evidence-linkage stages are designed to trace a document's substantive claims to cited sources and to flag when cited evidence is absent or inadequate; this is one of the three issue-class families exercised in current evidence."
- **Abstract-length:** "DRA traces claims to cited evidence and flags absent or inadequate evidence — the most-exercised part of its current evidence base."
- **Evidence:** `authority-resolution/`, `evidence-linkage/`; reachability matrix (IC-4, IC-5 `OBSERVED_REACHABLE`).
- **Qualification:** scope to "a document's own citation apparatus" — DRA does not independently fact-check against external ground truth.
- **Prohibited:** "DRA verifies factual accuracy," "DRA confirms whether claims are true."

## Machine-consumed documents

- **Canonical:** "DRA has not been tested or deployed as a component consuming or gating machine-to-machine document exchange; this is a potential future application area, not a demonstrated one."
- **Abstract-length:** "DRA has not been tested in machine-consumption pipelines; this is future work."
- **Evidence:** absence of any such artefact in the repository (negative finding, stated explicitly per Phase 1 §5, C8).
- **Qualification:** any mention of this application must be clearly future-tense and hedged.
- **Prohibited:** "DRA is built for machine-consumed documents," "DRA integrates with automated decision systems" (no such integration exists).

## Potential future role as "trust infrastructure"

- **Canonical (only permitted framing):** "A long-term, currently unevidenced design aspiration for DRA is to serve as one building block toward more reliable machine and human consumption of documents; this is a stated design intent, not an empirical finding, and no evidence in this programme establishes DRA as infrastructure of any kind."
- **Abstract-length:** "DRA's long-term design aspiration — not yet evidenced — is to contribute toward more reliable document consumption."
- **Evidence:** `DRA-001-VERSION-1-PROGRAMME-SPECIFICATION.md` (design intent only); Phase 1 §5, C9/C13.
- **Qualification:** the phrase **"trust infrastructure" must never be presented as an achieved empirical fact.** It may appear only inside a sentence that is unambiguously prospective/aspirational and explicitly labelled as interpretation, e.g. "one way to interpret DRA's long-term potential is as a step toward trust infrastructure for documents — a goal this programme's evidence does not yet establish."
- **Prohibited:** "DRA is trust infrastructure," "DRA provides trust infrastructure for AI systems," any unqualified present-tense use of "trust infrastructure."

---

## Mandatory global rules

1. The phrase **"independently validated"** must never be used for GEN-001, VAL-002, or the DRA programme as a whole — no third party (organisation, external reviewer, separate research group) has participated in study design, execution, or review. State this limitation affirmatively wherever validation is discussed: *"No external or third-party validation has yet been performed."*
2. **"Blind"** always means prospective, contamination-blind (no performance-predicting inspection before sample lock) — never a blinded human evaluator or an evaluator denied access to document content.
3. Do not dilute a `DEMONSTRATED` or `SUPPORTED` claim's substance merely to hedge — qualify scope, don't understate the result itself. (E.g., determinism and the 3/9 reachability fact are real, verified results and should be stated with confidence, with scope attached — not softened into vagueness.)
4. Every claim above must retain its stated qualification when shortened for an abstract; if a shortened form cannot retain the qualification, do not shorten it further.
