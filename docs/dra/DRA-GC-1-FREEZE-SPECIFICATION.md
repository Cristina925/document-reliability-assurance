# DRA-GC-1 — Freeze Specification

**STATUS: FROZEN**

**Candidate identifier:** `DRA-GC-1`
**Freeze timestamp:** `2026-08-12T00:00:00.000Z`
**Repository commit:** `21e0e6a11452754a7aa258d799226553f3cb1d38`
**Canonical aggregate digest:** `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`
**Evaluator version:** `0.1.2` · **Pipeline version:** `1.0` · **Model/schema version:** `0.1.0`
· **Corpus version:** `DRA-CORPUS-1.0.0`
**Authority:** DRA-ROB-002, verdict `READY_FOR_DRA_GC_1_FREEZE` (zero `FREEZE_BLOCKER` entries in
the 10-entry known-defect ledger; see `docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md`).
**Freeze manifest (machine-verifiable):**
`lib/dra-reference/src/benchmark/analysis/dra-gc-1-freeze-manifest.ts`, verified by
`lib/dra-reference/src/benchmark/analysis/__tests__/dra-gc-1-freeze-integrity.test.ts` (26/26 passing).
**Freeze receipt:** `docs/dra/DRA-GC-1-FREEZE-RECEIPT.md`.

This document was converted from a draft readiness artefact into the canonical, executed freeze
specification once pre-freeze verification (Section 0) confirmed the repository state still
exactly matched the state DRA-ROB-002 reviewed. No decision-affecting production code was changed
to perform this conversion; the manifest below records what already existed, byte-for-byte. The
historical DRA-ROB-002 evidence is unmodified by this freeze — see that report for the underlying
review.

---

## 0. Pre-freeze verification (performed before this freeze was executed)

1. **Read the complete ROB-002 report and the complete draft freeze specification** — both in
   full, immediately prior to freeze execution.
2. **Repository-state correspondence check:** `git log` confirmed the ROB-002 commit
   (`Add specification and conventions for DRA-ROB-002 generalisation freeze`,
   `21e0e6a11452754a7aa258d799226553f3cb1d38`) was still `HEAD`; `git status` showed no
   uncommitted changes to any repository file (only the incoming task's own attached-assets upload
   was untracked, which is not part of the repository proper). **No commit occurred between
   ROB-002 completion and this freeze**, so no decision-affecting drift was possible in principle;
   this was still verified empirically (Sections 0.3–0.5) rather than assumed from the commit log
   alone.
3. **Confirmed no decision-affecting production change occurred:** every one of the 63 files listed
   in `FROZEN_DECISION_AFFECTING_FILES` (see Section 2 below) was re-hashed from the live
   repository and compared against the digests recorded in the freeze manifest — all 63 matched
   exactly (verified by the `dra-gc-1-freeze-integrity.test.ts` suite, "live repository state
   matches the frozen candidate" group, 3/3 passing).
4. **Verified identifiers/versions/configuration/digests from the repository, not from prose:** the
   manifest's `GC1_EVALUATOR_VERSION`, `GC1_PIPELINE_VERSION`, `GC1_MODEL_VERSION` and
   `GC1_CORPUS_VERSION` constants were asserted equal to the live `DRA_EVALUATOR_VERSION` /
   `DRA_PIPELINE_VERSION` / `DRA_MODEL_VERSION` (from `lib/dra-reference/src/model/versions.ts`)
   and `INITIAL_CORPUS_VERSION` (from `lib/dra-reference/src/benchmark/governance/version.ts`)
   constants by direct import and comparison in the integrity test suite, not by copying the
   numbers from the ROB-002 report text.
5. **Confirmed the ROB-002 verdict remains internally consistent with the machine-readable
   evidence:** re-ran `dra-rob-002-freeze-readiness-review.test.ts` (14/14 passing) and asserted,
   in the new freeze-integrity suite, that `KNOWN_DEFECT_LEDGER` still contains zero
   `FREEZE_BLOCKER` entries and that `GC1_FREEZE_VERDICT` is still `READY_FOR_DRA_GC_1_FREEZE`.

**No material decision-affecting change was found.** The freeze proceeded. No discrepancy required
stopping the freeze, and none was manufactured or repaired to force a successful outcome — Sections
0.2–0.5 report exactly what was checked and found.

---

## 1. Components to freeze

| Component | Frozen value / identifier |
|---|---|
| Evaluator version | `DRA_EVALUATOR_VERSION = "0.1.2"` (`lib/dra-reference/src/model/versions.ts`) |
| Pipeline version | `DRA_PIPELINE_VERSION = "1.0"` |
| Data-model schema version | `DRA_MODEL_VERSION = "0.1.0"` |
| Corpus version | `DRA-CORPUS-1.0.0` (`lib/dra-reference/src/benchmark/governance/version.ts`) |
| Corpus role | Development/robustness corpus (DRA-DOC-0001–0032, DRA-DOC-0034; 33 documents). **Not** the blind generalisation test set — must never be reused as GEN-001 material (Section 5). |
| Normalisation implementation | Stage 1–2 as of the ENG-023 Unicode-property fix (`\p{L}\p{N}` classification, ideographic terminator set) |
| Layout-reconstruction behaviour | The ENG-024 opt-in bbox hybrid column detection/reconstruction engine, unchanged since ENG-025 (confirmed behaviourally identical by `tsc`/regression) |
| Issue definitions | The 9 defined issue classes; 3 currently triggerable (`EVIDENCE_ABSENT`, `EVIDENCE_INADEQUATE`, `CLAIM_INCONSISTENCY`) |
| Decision semantics | SUPPORTED / REVIEW / HOLD and their triggering rules, as implemented in Stage 6/7 |
| Thresholds/configuration | Materiality classification rules (Stage 5), confidence levels, size/oversized limits, all currently-hardcoded constants governing evaluation |
| Proof-receipt schema/semantics | 7-record structure (Input Normalisation, Claim Extraction, Authority Resolution, Evidence Linkage, Consistency Check, Confidence Scoring, Decision and Receipt); digest boundary excluding only `id`, `timestamp`, `documentIdentity.evaluatedAt`, and `substantiveDigest` itself |

## 2. Repository commit/state requirements

- **Executed against:** commit `21e0e6a11452754a7aa258d799226553f3cb1d38`, verified unchanged from
  the commit DRA-ROB-002 reviewed (Section 0.2).
- `npx tsc --noEmit` in `lib/dra-reference` reproduced exactly the 2 pre-existing, documented,
  unrelated type errors (Section 8 of DRA-ROB-002; `dra-acq-026-*.test.ts` line ~443,
  `dra-acq-025-non-redundant-graphics-discovery.ts` line ~245) and no others.
- `npx vitest run src/benchmark/acquisition` at freeze time reproduced the 22 pre-existing,
  documented `DRA_EVALUATOR_VERSION` stale-assertion failures plus a small number of additional
  failures traced to live re-fetches of external documents whose byte content had drifted since
  those tests' frozen reference baselines were recorded (e.g. `dra-acq-002-code-variation-check`,
  `dra-acq-029-doc0033-hindi-admission`) — an already-documented, environment-dependent
  instability class for live-network acquisition tests (see multiple prior ACQ programme
  conventions in project memory), not a change to any frozen component. No failure in this run
  originated from, or was affected by, the freeze artefacts added by this programme (which touch
  zero files in the frozen set — see Section 0.3).
- All 34 acquisition/admission attempts (33 admitted + DRA-DOC-0033 reserved-but-unused) remain
  present and unmodified in the repository's test/fixture history.
- **Machine-checkable freeze manifest:** `lib/dra-reference/src/benchmark/analysis/dra-gc-1-freeze-manifest.ts`
  records, for all 63 frozen files, a SHA-256 digest of their exact byte content at commit
  `21e0e6a1...`, plus one canonical aggregate digest computed by deterministically sorted-key JSON
  serialisation (mirroring `pipeline/canonical-serialise.ts`) over `{candidateId, evaluatorVersion,
  pipelineVersion, modelVersion, corpusVersion, frozenFileDigests}`. The manifest is a pure-data
  module never imported by any production evaluation code path; it exists solely to make this
  specification's claims machine-verifiable, via
  `lib/dra-reference/src/benchmark/analysis/__tests__/dra-gc-1-freeze-integrity.test.ts` (26/26
  passing), which re-hashes every frozen file live and fails if any byte has changed.

## 3. Evaluator/version identifiers

`evaluatorVersion: "0.1.2"`, `pipelineVersion: "1.0"`, `schemaVersion: "0.1.0"`,
`corpusVersion: "DRA-CORPUS-1.0.0"`. Any DRA-GC-1 result must be stamped with all four.

## 4. Corpus role and development-corpus separation mechanism

The 33 admitted documents are **development/robustness evidence**, not generalisation-test
material. They may continue to be cited as evidence for DRA-GC-1's claim scope (Section 6), but
must never be scored as part of a blind `DRA-GEN-001` benchmark, and no document sharing a
byte-identical or near-identical source with any of them (e.g. a different edition of the same
underlying publication chosen with hindsight) should be selected for that benchmark either.

**Concrete anti-contamination mechanism (not prose-only):** the freeze manifest exports
`GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS` — the explicit, enumerable set of DRA-DOC identifiers
(`DRA-DOC-0001`–`DRA-DOC-0032`, `DRA-DOC-0034`; 33 entries) that formed the ROB-002-reviewed
development/robustness evidence base — and `GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID` (`DRA-DOC-0033`,
never admitted, so likewise excluded rather than silently assumed present). Any future
`DRA-GEN-001` candidate-selection or admission tooling must check a proposed blind-test document's
identifier, source URL, and (once fetched) content digest against this set — and, since publisher
identity and source URL can be renamed or mirrored, must also apply a manual publisher/near-duplicate
review — before admitting it to a blind run. This list is intentionally exhaustive and file-based
(not derived from a live corpus registry query) so that it remains fixed and auditable even if the
corpus registry itself grows after this freeze.

## 5. Configuration

No environment-specific or document-specific configuration exists in the frozen pipeline (verified:
every shipped fix — ENG-016, ENG-017, ENG-018, ENG-019, ENG-020/021/022, ENG-023, ENG-024 — is
generic; all document-specific-shaped candidates were rejected, most recently ENG-025's three
ablation candidates). No configuration flag differentiates "known" from "unknown" documents.

## 6. Relevant digests

- Freeze-record digest: versioned V2 regime (`ENG-022`), binding `evaluatorIdentity` and
  currentness fields; the legacy V1 formula remains untouched and unused for new freezes.
- Currentness assertion digest: separate, versioned (`ENG-021`), not folded into the freeze-record
  digest.
- Substantive result digest (`canonical-serialise.ts`): SHA-256 over lexicographically key-sorted,
  recursively normalised payload; excludes only the four operational fields listed in Section 1.

## 7. Immutable test definitions

The following existing test suites constitute the frozen behavioural contract and must not be
edited to make a future `DRA-GEN-001` result pass — any GEN-001 failure must be fixed (if at all)
by a new, explicitly versioned evaluator, never by adjusting the frozen tests below:

- `src/pipeline/__tests__/evaluate-document.test.ts`, `canonical-serialise.test.ts`
- `src/model/__tests__/proof-receipts.test.ts`
- The full `dra-acq-0{01..31}-*-admission.test.ts` / `*-discovery.test.ts` family
- `dra-eng-024-synthetic-layout-cases.test.ts`, `dra-eng-024-federal-register-postfix.test.ts`,
  `dra-eng-024-pdf-layout-prober.test.ts`
- `dra-chk-002-reachability-analysis.test.ts`, `dra-chk-003-parallel-language-divergence.test.ts`,
  `dra-chk-005-cross-language-materiality.test.ts`
- `dra-rob-001-evidence-matrix-integrity.test.ts`,
  `dra-rob-002-freeze-readiness-review.test.ts` (this programme's own tests)

## 8. Accepted limitations (frozen into DRA-GC-1's disclosed scope)

Exactly the ledger in DRA-ROB-002 Section 6 (`KNOWN_DEFECT_LEDGER`, entries D1–D10). None is a
freeze blocker; D3, D4, D5, and the RTL/abugida portion of D2 require the explicit claim-scope
exclusions in Section 9 below whenever DRA-GC-1 results are published or cited.

## 9. Permitted vs prohibited claim scope

Reproduced from DRA-ROB-002 Section 7 as the binding claim-scope contract for any use of DRA-GC-1:

**Permitted:** English/Spanish/French/Japanese/Bulgarian, LTR, PDF/HTML, official/licensed source,
up to ~25,600-statement scale; deterministic/reproducible evaluation with verifiable proof
receipts; detection (not correction) of footnote/table-shading/OCR/graphics representation loss and
multi-column reading-order corruption on ambiguous hybrid layouts; issue detection limited to
`EVIDENCE_ABSENT` / `EVIDENCE_INADEQUATE` / `CLAIM_INCONSISTENCY`; well-formed multi-column layout
reconstruction.

**Prohibited (must not be claimed as validated):** RTL scripts; abugida/conjunct-consonant scripts;
scriptio-continua scripts without enumerated terminators; non-English materiality/obligation
detection quality; compound/extreme multi-weakness documents; intra-document mixed-language
code-switching; full reading-order restoration on structurally mixed column-width pages; any issue
class beyond the 3 currently triggerable ones; and any universal claim such as "works on all
documents" or "solves unreliable digital documents worldwide."

## 10. Blind-test contamination rules

1. The `DRA-GEN-001` (or successor) blind-test corpus must be disjoint from DRA-DOC-0001–0034 and
   must not be selected with knowledge of which specific documents or publishers previously exposed
   a defect.
2. No engineering change may be made to the frozen components (Section 1) in response to an
   observed blind-test result. If a blind-test failure reveals a genuine defect, the correct
   response is: (a) document the failure, (b) version-bump the evaluator under a new identifier
   (never silently patch `0.1.2`), and (c) re-run the *entire* blind test under the new version —
   never patch-and-rescore the same run.
3. Any change to normalisation, layout reconstruction, issue definitions, decision semantics, or
   thresholds after the freeze commit invalidates the frozen candidate; a new candidate
   (`DRA-GC-2`) must be declared instead of silently mutating `DRA-GC-1`.
4. Corpus additions after freeze (e.g. finally resolving DRA-DOC-0033) do not automatically fold
   into `DRA-GC-1` — they become development evidence for a future candidate, consistent with the
   corpus's existing hard freeze-governance boundary (`CorpusAlreadyFrozenError`).

## 11. Permitted vs prohibited changes after freeze

**Permitted:** acquiring and admitting new development-corpus documents under a *new* corpus
version (does not touch the frozen `DRA-CORPUS-1.0.0`); writing new analysis/review programmes;
documentation; new tests that verify frozen behaviour without changing it.

**Prohibited:** any change to the components listed in Section 1; editing any test listed in
Section 7 to accommodate new results; reusing corpus documents as blind-test material; adjusting
thresholds, issue definitions, or decision semantics based on blind-test outcomes.

## 12. Criteria for invalidating or restarting the generalisation benchmark

The benchmark must be invalidated and restarted if, after freeze:

- Any frozen component (Section 1) was changed before or during the blind run.
- Any blind-test document is later found to overlap (by content, not just filename) with
  DRA-DOC-0001–0034.
- Any document-specific heuristic is discovered to have been introduced at any point in the frozen
  pipeline's history that was not caught by this review.
- The `tsc --noEmit` / acquisition-suite regression baseline (Section 2) no longer reproduces at
  the frozen commit, indicating the commit boundary was not actually stable.

---

## 13. Freeze execution record

This specification was executed (converted from draft to `STATUS: FROZEN`) on
`2026-08-12T00:00:00.000Z`, at commit `21e0e6a11452754a7aa258d799226553f3cb1d38`, under the
canonical aggregate digest `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b`. No
component listed in Section 1 was modified to perform this execution. Verification results are
summarised in `docs/dra/DRA-GC-1-FREEZE-RECEIPT.md`. This freeze does not select, define, or start
`DRA-GEN-001` — that remains an explicit, separate follow-on decision outside this document's
scope, to be taken only under the immutability rules (Section 11) and contamination rules (Section
10) fixed above.
