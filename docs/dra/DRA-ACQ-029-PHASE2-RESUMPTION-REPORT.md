# DRA-ACQ-029 / DRA-DOC-0033 — Resumption Attempt from Blocked State

**Status: BLOCKED (confirmed, unchanged). No admission occurred. No corpus, evaluator, or production-code changes were made.**
**Date:** 2026-08-12

---

## 1. What this session did

Per the resumption directive, this session did **not** search for new candidates, modify historical evidence, alter frozen artefacts or prior reports, or touch evaluator/pipeline/corpus code. It performed exactly the prescribed Phase 1 re-check of the existing DRA-ACQ-029 / DRA-DOC-0033 state, then followed Branch B (source still blocked) through to its stated stopping point.

## 2. Existing state reviewed (not modified)

- **Discovery record** (`docs/dra/DRA-ACQ-029-PHASE1-CANDIDATE-DISCOVERY-REPORT.md`, `discovery/dra-acq-029-non-cjk-non-latin-script-discovery.ts`): primary candidate `DRA-CAND-029-01`, QUALIFIED_RECOMMENDED — Supreme Court of India civil-appeal judgment (Asma Lateef and others v. Shabbir Ahmed and others, Civil Appeal No. 9695/2013, [2024] 1 S.C.R. 517 : 2024 INSC 36), official Hindi (Devanagari) translation, distributed via the Allahabad High Court's eLegalix e-SCR portal. Alternate `DRA-CAND-029-02`, QUALIFIED_ALTERNATE — a Bulgarian-language (Cyrillic) EU institutional document, retained only as a low-risk fallback.
- **Qualified source URL:** `https://elegalix.allahabadhighcourt.in/elegalix/WebDownloadTranslatedSCJudgmentDocument.do?SCJudgmentID=306`.
- **Publisher / document identity:** Supreme Court of India (judgment); official Hindi translation under the Court's Model Translation Programme, distributed via the Allahabad High Court's own eLegalix subdomain.
- **Licence/governance determination (already established, unchanged):** PUBLIC_DOMAIN — Indian Copyright Act 1957, s.52(1)(q)(iv) (statutory exemption for court judgments/orders, unless the court itself restricts reproduction; no such restriction found).
- **Expected media type:** `application/pdf`.
- **Previously recorded expected digest/size (from the last successful live fetch, prior session):** SHA-256 `2124a4c347a5512248455acd4e939c1808e030685e7eefd5703a629c5ddca76c`, 468,335 bytes — this is legitimate prior evidence, not assumed fresh in this session's own governance conclusions.
- **Previous HTTP 429 evidence (memory, `dra-acq029-conventions.md`):** domain-wide `mod_qos`-pattern block first observed 2026-08-11 ~16:25 UTC, still in effect after waits of 12s/60s/180s/280s within that session; a second independent check ~42 minutes later (2026-08-11T16:58:09Z) confirmed the block was still fully in effect.
- **Fully-built Phase 2 admission test** already exists (`__tests__/dra-acq-029-doc0033-hindi-admission.test.ts`), targeting `DRA-FRZ-000027` / `DRA-ACQ-000036` / `DRA-DOC-0033`, unexecuted to completion in the prior session due to the block. This session reused it as-is (no edits) to obtain a fresh, code-path-verified result rather than relying only on manual `curl`.

## 3. Phase 1 — fresh live accessibility check (this session, 2026-08-12 ~05:42–05:45 UTC)

Three independent live checks were performed, all via plain HTTPS GET (no bypasses, no browser impersonation, no anti-bot workarounds):

| Check | Method | Result |
|---|---|---|
| Direct document download endpoint (`WebDownloadTranslatedSCJudgmentDocument.do?SCJudgmentID=306`) | Manual `curl` | **HTTP 429**, `Retry-After: 10`, body `"Too many requests. Retry after 10 seconds."`, fresh `Set-Cookie: X-Client-Id=...` |
| Same endpoint | Repository's own governed acquisition path (`createHttpFetcher` + `createAcquisitionRequest`, via the existing, unmodified admission test) | **HTTP_ERROR / HTTP 429**, identical failure mode, confirmed by the test's own assertion failure (`fetchA.ok` = `false`) |
| Unrelated portal endpoint — public judgment listing page (`WebViewAllTranslatedSCJudgment.do`) | Manual `curl` | **HTTP 429**, identical error body and headers |

No document bytes, digest, or media type could be obtained — the endpoint returns a 42-byte plain-text error body, not a PDF, on every attempt. This reconfirms, roughly 13–14 hours after the last confirmed block, that the restriction is domain-wide (affecting a completely unrelated endpoint on the same host) rather than per-URL or per-download, consistent with the `mod_qos`-based sustained-block pattern already characterised in memory. Per the documented caution against compounding a `mod_qos`-style block with repeated probing, no further retries were attempted beyond these three confirmatory checks.

**Conclusion: the primary source remains inaccessible. Branch A (primary now accessible) does not apply.**

## 4. Branch B — alternate-route assessment

Branch B requires determining whether the previously qualified alternate (`DRA-CAND-029-02`, the Bulgarian/Cyrillic EU document) can now answer the same robustness question with equivalent or better evidentiary quality, reusing existing evidence rather than repeating work.

**Finding: the alternate route has already been fully and independently exercised, with a definitive answer, by DRA-ACQ-031 (Phase 1 + Phase 2, `docs/dra/DRA-ACQ-031-PHASE1-REPORT.md` / `DRA-ACQ-031-PHASE2-REPORT.md`), which admitted a Bulgarian (Cyrillic) document as DRA-DOC-0034 and returned a definitive PASS verdict** — zero Cyrillic-script segmentation/classification misclassifications, decision unaffected, DRA-ENG-023's fix confirmed to generalise cleanly to the Cyrillic alphabet.

Re-running the Cyrillic alternate again here would not produce equivalent-or-better evidentiary quality on any open question — it would only reproduce a result already established, at the cost of corpus count with zero information gain, directly contrary to this programme's explicit constraint ("optimise for information gain and methodological validity, not for increasing the corpus count"). More importantly, Cyrillic does **not** exercise the specific properties DRA-ACQ-029 was scoped to test — Devanagari's conjunct/matra composition and native danda (।/॥) sentence punctuation, and (more generally) genuinely non-whitespace-delimited or non-alphabetic script behaviour. Cyrillic is alphabetic and whitespace-delimited, the same broad category as Latin; it was only ever ranked as a "least differentiating" fallback in the original discovery ranking (§2 of the Phase 1 report). Substituting it now would not answer DRA-ROB-001's actual remaining open question about abugida/conjunct-script and native-punctuation robustness — it would merely stand in for a question that script family cannot meaningfully answer, dressed up as "using the alternate."

**Conclusion: the alternate is not viable as a source of new information. No further candidate was pursued, open-ended or otherwise**, per the explicit instruction not to perform an open-ended search unless both primary and previously-qualified-alternate routes fail — the alternate here has not "failed" in the sense of being inaccessible; it has already been answered elsewhere, which is treated as the equivalent stopping condition given the programme's information-gain constraint.

## 5. Required final report fields

- **Primary live-source result:** BLOCKED. HTTP 429 on the canonical download URL, both via manual `curl` and via the repository's own governed HTTP fetcher/acquisition-request code path.
- **HTTP/stability evidence:** Three independent live checks (2026-08-12, ~05:42–05:45 UTC) all returned HTTP 429, `Retry-After: 10`, identical 42-byte error body, on both the target download endpoint and an unrelated listing-page endpoint on the same domain — confirming a domain-wide, not per-endpoint, sustained block, now observed across three separate time points spanning roughly 13–14 hours (2026-08-11 ~16:25 UTC, 2026-08-11 ~16:58 UTC, 2026-08-12 ~05:42 UTC).
- **Governance status:** Unchanged from Phase 1/the prior session's re-verification — licence basis (PUBLIC_DOMAIN, Indian Copyright Act 1957 s.52(1)(q)(iv)) and official-source identity remain valid and were not re-litigated, since no new document bytes were ever obtained to re-verify against.
- **Whether DRA-DOC-0033 was admitted:** **No.** DRA-DOC-0033 remains NOT ADMITTED. `DRA-FRZ-000027` and `DRA-ACQ-000036` remain reserved-but-unused, exactly as before this session.
- **Corpus state:** Unchanged — 33 documents (DRA-DOC-0001–0032, plus DRA-DOC-0034 admitted separately under DRA-ACQ-031). No registry, freeze, or manifest changes were made in this session.
- **Evaluator result:** Not applicable — no admission occurred, so the evaluator was never run against this document in this session.
- **Determinism/proof-receipt result:** Not applicable, for the same reason.
- **Non-Latin experiment methodology:** Not executed this session (see below — no new empirical measurement was possible without the source document; the alternate route was assessed and found already-answered rather than re-run).
- **Measured findings:** The only new measurement this session is negative/blocking evidence — the primary source's inaccessibility, confirmed three independent ways, plus the reasoned conclusion (§4) that the qualified alternate no longer represents an open question.
- **Any newly demonstrated generic defect:** None. This is an external site-availability condition on a third-party government portal, not a DRA acquisition, extraction, segmentation, evidence-linkage, or evaluator defect. It does not distinguish among those categories because no document content was ever retrieved to analyse.
- **Whether engineering remediation is required:** No. This is not a DRA pipeline limitation; no source-specific bypass, anti-bot workaround, or governance weakening was introduced, and none is proposed.
- **Exact files created or modified:** None in the source tree. This report (`docs/dra/DRA-ACQ-029-PHASE2-RESUMPTION-REPORT.md`) is the only new file. No test file, discovery file, evaluator code, corpus registry, or freeze record was created or modified. (Temporary `curl` probe output was written only to `/tmp`, outside the repository, and is not part of this deliverable.)
- **Tests and TypeScript results:**
  - `dra-acq-029-doc0033-hindi-admission.test.ts` (unmodified, existing file): 1 test run, **failed** at the live-fetch determinism step with `HTTP_ERROR` (429) — this is the expected, correctly-surfaced failure given the confirmed live block, not a new defect. No file was edited to force a different outcome.
  - `dra-acq-029-non-cjk-non-latin-script-discovery.test.ts` + `dra-rob-001-evidence-matrix-integrity.test.ts`: 47/47 passed, no regression.
  - `npx tsc --noEmit`: 2 pre-existing, unrelated errors only (`dra-acq-026-long-range-structural-robustness.test.ts`'s `overallStatus` property, and `dra-acq-025-non-redundant-graphics-discovery.ts`'s `CandidateRecord` literal-type mismatch) — both already catalogued in memory as pre-existing and confirmed untouched by this session (no files were edited).
- **Final status: BLOCKED.**
- **Recommended next programme:** Do not automatically retry DRA-ACQ-029 in the near term — the sustained, multi-hour, domain-wide `mod_qos`-style block on `elegalix.allahabadhighcourt.in` shows no sign of clearing on the timescales tried so far (12s through ~14 hours). A future resumption attempt should wait substantially longer (days, not hours) before the next live check, or independently confirm via other means that the block has lifted before spending another attempt. Absent that, the abugida/conjunct-script/native-punctuation robustness question DRA-ROB-001 raised remains genuinely open pending either this source clearing or a new, separately-scoped discovery pass for a different Devanagari (or other abugida-family) source — which was explicitly out of scope for this resumption attempt. Per the governing instruction, the multi-column residual-closure work (DRA-ENG-024 follow-on) should now be scoped from the current evidence rather than waiting on this blocked acquisition.
