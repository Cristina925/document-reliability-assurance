# DRA-ENG-014A — Version Preservation and Correction Closure Review

STATUS: CLOSURE / GOVERNANCE REVIEW ONLY. No production code was changed or
behaves differently as a result of this review. `evaluatorVersion` remains
`"0.1.2"`, `pipelineVersion` remains `"1.0"`, receipt `schemaVersion` remains
`"0.1.0"`.

Supporting tests:
`src/benchmark/analysis/__tests__/dra-eng-014a-closure-review.test.ts` (13 tests, all passing).

---

## Part 1 — Reproducibility terminology

| Term | Definition adopted |
|---|---|
| **EVIDENCE_INTEGRITY** | A frozen historical receipt/record can be cryptographically re-verified (`verifyReceiptIntegrity`) and has not been altered since issuance. |
| **RESULT_PRESERVATION** | The historical benchmark outputs and decisions (decision, issue register, digest) remain recorded exactly as originally produced, in immutable storage (frozen corpus/benchmark records). |
| **EXECUTABLE_REPRODUCIBILITY** | Given the historical frozen inputs and a declared historical evaluator version, the repository can *execute* the corresponding historical implementation and regenerate the historical outputs from scratch. |
| **CURRENT_VERSION_REPRODUCIBILITY** | The *current* evaluator implementation, run repeatedly on the same frozen input, produces identical outputs (deterministic digest, decision, issues) every time. |

**What DRA methodology actually claims (evidence, not inference):**

- `docs/dra/DRA-001-05A-MINIMUM-EVALUATOR-V1.md` §10: *"the evaluator is a reference implementation whose outputs must be **reproducible across invocations**; runtime-mutable configuration would create undetectable divergence **between evaluation runs**."* This is CURRENT_VERSION_REPRODUCIBILITY — same code, repeated calls, same output. It says nothing about re-executing a superseded version.
- `docs/dra/DRA-001-06-BENCHMARK-EVALUATION.md` §12 ("Reproducibility Verification") defines reproducibility entirely in terms of: two `BenchmarkRunner` instances with identical timestamps/documents producing identical `substantiveDigest`; digest independence from *when* a run occurred; metric stability across identical repeated runs. Again, CURRENT_VERSION_REPRODUCIBILITY only.
- `docs/dra/DRA-001-05A` §9 explicitly documents the receipt as **frozen** (`Object.freeze()`) and **immutable**, backing RESULT_PRESERVATION / EVIDENCE_INTEGRITY.
- No file in `docs/dra/`, `src/benchmark/governance/`, `src/benchmark/validation/`, or `src/pipeline/` contains any requirement, test, or design note asserting that a *superseded* evaluator version must remain separately executable. The words "replay" and "historical" appear only in the sense of replaying a *comparison* (CHK-series statement-level comparisons between two live evaluations of different documents) or preserving *prior frozen corpus state* (`amendment.ts`), never re-executing old evaluator code.

**Conclusion:** DRA methodology defines and enforces CURRENT_VERSION_REPRODUCIBILITY and RESULT_PRESERVATION/EVIDENCE_INTEGRITY as explicit requirements. It does not state, test, or imply an EXECUTABLE_REPRODUCIBILITY requirement anywhere in the corpus of governance, benchmark, or evaluator documentation searched.

---

## Part 2 — Historical precedent review

Inspected: DRA-EVAL-002 (0.1.0→0.1.1) precedent via `versions.ts`, receipt versioning, benchmark freeze conventions, and all tests referencing historical evaluator versions (the DRA-ENG-014 test suite itself).

Findings:
- `versions.ts` treats `DRA_EVALUATOR_VERSION` as a single mutable "current" constant; the prior value is preserved only as a separately named, never-recomputed literal (`DRA_EVALUATOR_VERSION_0_1_1`), appended to `RECOGNISED_SCHEMA_VERSIONS` rather than replacing anything.
- No version-dispatch table, rule registry keyed by version, or evaluator snapshot module exists anywhere in `src/`.
- Historical benchmark/freeze records (`FrozenCorpus`, `FreezeRecord`, `AdmissionRecord`, `AmendmentRecord`) are all designed as **immutable stored data**, never as re-executable code paths — the entire freeze/amendment governance model (`src/benchmark/governance/*`) is built around "preserve the prior frozen snapshot as data," not "preserve the prior code path."

**Classification: DATA_PRESERVATION_ONLY.**

---

## Part 3 — Requirement decision

**Verdict: B — EVIDENCE_PRESERVATION_SUFFICIENT.**

This is evidence-based, not assumed:
1. DRA-001-05A/06/07's only stated reproducibility guarantees are CURRENT_VERSION_REPRODUCIBILITY and RESULT_PRESERVATION/EVIDENCE_INTEGRITY (Part 1).
2. The repository's only precedent for a version change (DRA-EVAL-002, and now DRA-ENG-014) is DATA_PRESERVATION_ONLY (Part 2) — this is the established, working pattern the whole benchmark/governance subsystem already depends on (frozen corpora, frozen receipts, append-only version constants), not a gap.
3. No design document, schema, or test anywhere states or checks executable-replay-of-a-superseded-version as a requirement.

Because frozen 0.1.1 receipts, frozen BMK-021 benchmark records, and full git history of `linkage-rules.ts`/`versions.ts` (the exact prior source) already jointly satisfy "what 0.1.1 produced, and what its code looked like, remain preserved and inspectable," EXECUTABLE_REPRODUCIBILITY is not needed to satisfy DRA's actual stated methodology. Introducing a version-dispatch or snapshot-module architecture now would add real complexity to solve a requirement the methodology does not impose — which is exactly what this review's constraints prohibit doing "without first proving it is required." It is not proven required.

(For completeness, since Part 3 asks for options to be described even under a hypothetical A-verdict: the smallest architecture that *would* provide EXECUTABLE_REPRODUCIBILITY is a frozen historical module — copy `linkage-rules.ts` verbatim into a `versions/v0_1_1/` snapshot directory and dispatch on `evaluatorVersion` in `detectEvidence()`'s caller. Trade-off: every future correction would need a new frozen snapshot, permanently growing the codebase and creating a second thing that can silently drift out of sync with its own frozen copy. This is not being implemented; it is recorded only as the answer to "what would it take," per instruction.)

---

## Part 4 — Current 0.1.2 reproducibility (verified)

From `dra-eng-014a-closure-review.test.ts`, Part 4 group (5/5 passing):
- DRA-DOC-0018 (ES): decision `SUPPORTED`, 0 issues — deterministic.
- DRA-DOC-0021 (EN): decision `REVIEW`, 7 issues — deterministic.
- Two `evaluateDocument()` calls on the identical frozen ES input produce an **identical `substantiveDigest`**, identical decision, identical issue count (CURRENT_VERSION_REPRODUCIBILITY, directly measured, not assumed).
- Both receipts stamp `evaluatorIdentity.evaluatorVersion === "0.1.2"` and `pipelineVersion === DRA_PIPELINE_VERSION`.
- Both receipts pass `verifyReceiptIntegrity`.

---

## Part 5 — Historical 0.1.1 evidence status (verified)

- `DRA_EVALUATOR_VERSION_0_1_1` still equals `"0.1.1"` — not removed, not renumbered.
- `"0.1.1"` remains in `RECOGNISED_SCHEMA_VERSIONS` alongside current `"0.1.2"` and `DRA_MODEL_VERSION` `"0.1.0"`; `isRecognisedSchemaVersion("0.1.1")` and `SchemaVersionSchema.parse("0.1.1")` both succeed.
- A receipt payload honestly constructed with `evaluatorVersion: "0.1.1"` and digested via the real `computeDigestFromPayload()` passes `verifyReceiptIntegrity` — the schema/digest machinery fully supports "0.1.1" as a first-class historical version value.
- As a control: relabelling a genuine 0.1.2 receipt's `evaluatorVersion` to `"0.1.1"` **without** recomputing its digest correctly **fails** `verifyReceiptIntegrity`. This is expected and correct — `evaluatorIdentity` is part of the digest input, so a version label cannot be forged onto an existing receipt after the fact. This is a tamper-detection property, not a defect.
- No historical file (`versions.ts` prior value, BMK-021 stored receipts/records) was rewritten by DRA-ENG-014 or by this review — confirmed by `git status` showing no modifications to any pre-existing BMK-021 data file, and by DRA-ENG-014's own verification suite re-checking those exact stored values.

**Reported status:**
- Historical evidence integrity: **PRESERVED**
- Historical result preservation: **PRESERVED**
- Historical executable reproducibility: **NOT_REQUIRED** (per Part 3 verdict B; current architecture cannot re-execute 0.1.1 behaviour through today's `evaluateDocument()` entry point, and DRA methodology does not require that it can)

---

## Part 6 — Bare-EN reconciliation

Formal record:
- **ENG-013** established: bare uppercase `EN` with no numeric standard identifier is **not** a legitimate complete EN-family standard citation (`OUT_OF_SCOPE` for valid standard-reference grammar).
- **ENG-014** intentionally implemented the narrower, demonstrated correction only: it made the EN branch case-sensitive to eliminate the confirmed Spanish/French lowercase `en` collision. It did **not** add a mandatory-numeric-suffix requirement. Bare uppercase `EN` matched under 0.1.1 and **still matches identically under 0.1.2** — this dimension of behaviour is unchanged by DRA-ENG-014 (confirmed directly: `detectEvidence("...conforms to EN as required.")` still returns an `EL-STANDARD-REF` match on bare `EN` in this review's test suite).
- Therefore evaluator 0.1.2 has a known, pre-existing, unresolved over-broad EN-family behaviour that ENG-014 did not introduce and was not authorized to fix.

**Classification: ACCEPTED_KNOWN_LIMITATION.** (Not `REQUIRES_IMMEDIATE_CORRECTION` — no corpus consequence was found, see below; not a `SEMANTIC_RECORD_INCONSISTENCY` — ENG-013's and ENG-014's records agree with each other and with the observed code behaviour; scoping it as `REQUIRES_FUTURE_SCOPED_CORRECTION` is the honest label for "should eventually be fixed, but is out of scope for any evaluator change already authorized," and is noted below as the residual limitation.)

**Corpus-impact check (scoped to the two documents this arc has directly investigated, DRA-DOC-0018 and DRA-DOC-0021 — the only documents where EN-family false positives have ever been demonstrated in this programme):**
- DRA-DOC-0021 (EN): **zero** bare-uppercase-EN matches anywhere in its 2,176 statements.
- DRA-DOC-0018 (ES): **one** bare-uppercase-EN match — statement `s2:96:143`, "CREADO POR LA COMISIÓN EUROPEA EN JUNIO DE 2018" ("created by the European Commission **in** June 2018"). This is itself a genuine lowercase-Spanish-`en`-as-preposition case, but it happens to appear in an ALL-CAPS section header/caption in the source PDF, so the extracted text preserves it as uppercase `EN` and the case-sensitive fix cannot distinguish it from a real EN standard citation by case alone.
- That one match is **not attached to any flagged issue** — it does not appear in `affectedStatementIds` of any of the document's issues (the document has 0 issues; it is `SUPPORTED`).

**Reported finding, as required by Part 6:** there is no bare-uppercase-EN corpus false positive that currently affects any frozen 21-document corpus decision. The one observed instance (DRA-DOC-0018) is evidentially inert — present in the Stage-4 evidence-linkage layer, but with no effect on the document's decision or issue register. This is a genuine (if narrow) blind spot — ALL-CAPS source formatting can still produce the exact collision the case-sensitivity fix targets — but it has zero demonstrated corpus consequence today.

---

## Part 7 — 0.1.2 acceptance gate

**Verdict: ACCEPT_0_1_2_WITH_GOVERNANCE_ACTION.**

Rationale: the demonstrated defect (lowercase Spanish/French `en` collision) is fixed with a clean regression suite, current-version reproducibility is verified, historical evidence is preserved, and the residual bare-EN limitation has no demonstrated corpus consequence. It is not a bare `ACCEPT_0_1_2` only because two facts must be formally carried forward rather than silently closed out: (1) historical executable reproducibility is architecturally absent (acceptable per Part 3, but must be a recorded, not assumed, governance position), and (2) the ALL-CAPS bare-EN blind spot found in Part 6 is a newly-documented edge case that ENG-013 did not specifically anticipate (it characterized bare EN in running prose, not in caption/heading formatting) and should be tracked explicitly rather than left as an implicit assumption.

**Required governance action before evaluator 0.1.3 or any further production correction:**
1. Record this report's Part 3 verdict (EVIDENCE_PRESERVATION_SUFFICIENT / DATA_PRESERVATION_ONLY precedent) as the standing policy for future evaluator version bumps, so it does not need to be re-litigated per change.
2. Carry the Part 6 finding (bare uppercase EN, including the ALL-CAPS-heading edge case) forward as a named, tracked residual limitation of evaluator 0.1.2 in any future EL-STANDARD-REF work — it must not be conflated with or silently resolved by the DRA-ENG-014 fix.

---

## Part 8 — Programme closure decision

**DRA-ENG-014: COMPLETE_WITH_FOLLOW_UP_GOVERNANCE.**

The technical correction (case-sensitive EN branch, evaluatorVersion 0.1.2) is complete, tested, and regression-clean — nothing about the correction itself is unfinished. What remains open is governance-level, not implementation-level: the two items in Part 7's required governance action are documentation/policy commitments, not code changes, and this DRA-ENG-014A review discharges them by recording the decisions explicitly in this report.

---

## Completion report

- **Files created:** `src/benchmark/analysis/__tests__/dra-eng-014a-closure-review.test.ts`; `docs/dra/DRA-ENG-014A-CLOSURE-REPORT.md` (this file).
- **Files modified:** none (no source, model, or evidence-linkage files touched).
- **Tests added:** 13 (Part 4: 5, Part 5: 3, Part 6: 3, plus 2 setup/support checks folded into those groups — see file for exact list).
- **Exact test results:** `dra-eng-014a-closure-review.test.ts` — 13 passed, 0 failed.
- **TypeScript result:** `tsc --noEmit` — clean, zero errors.
- **Production code changed:** **NO.**
- **Definitions adopted:** EVIDENCE_INTEGRITY, RESULT_PRESERVATION, EXECUTABLE_REPRODUCIBILITY, CURRENT_VERSION_REPRODUCIBILITY — see Part 1.
- **Repository historical precedent classification:** DATA_PRESERVATION_ONLY (Part 2).
- **Historical reproducibility requirement verdict:** B — EVIDENCE_PRESERVATION_SUFFICIENT (Part 3).
- **0.1.1 evidence integrity:** PRESERVED.
- **0.1.1 result preservation:** PRESERVED.
- **0.1.1 executable reproducibility:** NOT_REQUIRED.
- **0.1.2 reproducibility:** verified — deterministic digest/decision/issues across repeated runs, correct version stamping, receipt integrity holds (Part 4).
- **Bare-EN semantic reconciliation:** ACCEPTED_KNOWN_LIMITATION — ENG-013's and ENG-014's records are consistent with each other and with current code; 0.1.2 intentionally did not implement ENG-013's full semantic grammar (Part 6).
- **Bare uppercase EN corpus impact:** none currently demonstrated — one evidentially-inert match found in DRA-DOC-0018 (ALL-CAPS heading text), zero in DRA-DOC-0021, neither attached to any issue or affecting any decision.
- **Residual limitations:** (1) no executable-replay path for evaluator 0.1.1 exists or is required; (2) bare uppercase EN (including in ALL-CAPS source formatting) still over-matches as a standard citation — unresolved, inert in the current corpus, tracked as a named limitation.
- **Evaluator 0.1.2 acceptance verdict:** ACCEPT_0_1_2_WITH_GOVERNANCE_ACTION (Part 7).
- **DRA-ENG-014 closure verdict:** COMPLETE_WITH_FOLLOW_UP_GOVERNANCE (Part 8).
- **Required governance action before evaluator 0.1.3:** record the Part 3 DATA_PRESERVATION_ONLY policy as standing precedent; carry forward the Part 6 bare-EN limitation (including its ALL-CAPS edge case) as a named tracked item, not a silently-closed one.
- **Narrowest defensible conclusion:** evaluator 0.1.2 is accepted for continued use; nothing about its behaviour, versioning, or regression status requires a code change as a result of this review. What was missing was explicit governance documentation of two decisions the codebase already implicitly makes — this report is that documentation.
- **Recommended next programme:** none — per this task's explicit instruction, no further engineering programme (no DRA-DOC-0022, no DRA-ACQ-018, no Stage 5 multilingual work, no further bare-EN grammar correction) proceeds without your review of this report.

**STOP after DRA-ENG-014A**, per instruction. `evaluatorVersion`, `pipelineVersion`, and receipt `schemaVersion` are unchanged.
