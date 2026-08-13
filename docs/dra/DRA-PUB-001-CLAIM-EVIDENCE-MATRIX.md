# DRA-PUB-001 — Claim-Evidence Matrix

Companion to `DRA-PUB-001-FINAL-EVIDENCE-SYNTHESIS.md`. Each candidate claim (C1–C12) is rated
`SUPPORTED`, `SUPPORTED_WITH_LIMITATION`, `NOT_SUPPORTED`, or `OUT_OF_SCOPE`, with the specific
evidence backing the rating and, where relevant, the exact limitation that keeps a claim from
being unconditionally `SUPPORTED`.

| ID | Claim | Verdict | Evidence | Limitation (if any) |
|---|---|---|---|---|
| C1 | DRA-GC-1 is a well-defined, immutable, digest-verifiable artefact | `SUPPORTED` | Section 1 identity gate: 178/178 tests pass; live-recomputed aggregate digest `77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b` matches frozen value; 63 frozen decision-affecting files enumerated | None |
| C2 | DRA-GC-1 produces deterministic, repeatable decisions on the same input | `SUPPORTED` | GEN-001: 75/75 determinism; VAL-002: 25/25 Run-A-vs-Run-B determinism (100%, Wilson CI [86.7%,100%]) | None |
| C3 | DRA-GC-1's evaluations are independently verifiable via proof receipts without re-running the pipeline | `SUPPORTED` | GEN-001: 75/75 proof-integrity re-verification via `verifyReceiptIntegrity()`; VAL-002: 25/25 re-verified against `substantiveDigest` | Verifies the *recorded evaluation*, not independent re-acquisition of the source bytes (see C11) |
| C4 | DRA-GC-1 completes its full pipeline reliably on real-world documents across formats (PDF/HTML) and several languages | `SUPPORTED_WITH_LIMITATION` | 33-document development corpus across PDF/HTML/OCR-PDF; GEN-001 75/75 and VAL-002 25/25 pipeline completion | Demonstrated for English, Spanish, French, Japanese, Bulgarian only; no non-Latin-non-CJK/non-Cyrillic script tested; mixed-language and compound/extreme documents never tested |
| C5 | DRA-GC-1 reliably detects missing evidence, inadequate evidence, and internal claim inconsistency (IC-4, IC-5, IC-7) | `SUPPORTED` | `reachability-matrix.ts`: all three classified `OBSERVED_REACHABLE`; corpus examples cited (DRA-DOC-0024/0025/0028/0031, VAL-002's one REVIEW unit); GEN-001 independently reproduces exactly these 3 classes | None within these 3 classes specifically |
| C6 | DRA-GC-1 detects the full 9-class issue taxonomy it defines | `NOT_SUPPORTED` | `reachability-matrix.ts`: 6 of 9 classes (IC-1, IC-2, IC-3, IC-6, IC-8, IC-9) classified `STRUCTURALLY_UNREACHABLE`, proven by code-path analysis, targeted tests, and adversarial challenge, not merely unobserved | Coverage ceiling is 3/9 by design of the current implementation, not sampling luck |
| C7 | DRA-GC-1's materiality classification is accurate for English-language content | `SUPPORTED` | ENG-026 controlled matrix: 25/25 English accuracy; GEN-001/VAL-002 English-language decisions internally consistent with document content across 100 evaluated blind units | None |
| C8 | DRA-GC-1's materiality classification generalises reliably to Spanish-language content | `NOT_SUPPORTED` | ENG-026 controlled matrix: 11/25 Spanish accuracy, 14/25 divergent, root-caused to 5 English-only-lexicon Stage 5 rules; classified `CONFIRMED_BOUNDED_DEFECT`; known-defect ledger item D3, `ACCEPTED_GC-1_LIMITATION`, unfixed in GC-1 | A correction was built experimentally but independently rejected at admission review (GC2-REV-001) for introducing a new false positive (`"es preciso"`) |
| C9 | DRA-GC-1 generalises to a broad, blindly-drawn, pre-registered sample of unseen documents | `SUPPORTED_WITH_LIMITATION` | GEN-001: 75/75 operational-reliability endpoints on the evaluated subset; verdict `GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION` (not upgraded here) | 25/100 of the original locked sample (the entire HTML_ENGLISH stratum) was excluded due to external content drift, not evaluated at all under GEN-001 itself |
| C10 | The specific gap left open by GEN-001 (unseen English-language HTML) has since been directly, blindly evaluated | `SUPPORTED` | VAL-002: 25/25 units across GOV_UK/ONS_GOV_UK/US_FEDERAL, 100% on all primary endpoints, verdict `ENGLISH_HTML_GAP_CLOSED` | Result is a separate study from GEN-001 per Section 10's non-merge discipline, not a retroactive fix to GEN-001's own reported numbers |
| C11 | Findings in this programme can be independently reproduced by re-fetching the same public source URLs used at acquisition time | `NOT_SUPPORTED` | VAL-002 post-hoc drift observation: 15/25 identical, 7/25 drifted, 3/25 unreachable (HTTP 429) within one programme cycle; GEN-001's entire HTML_ENGLISH stratum failure is the same mechanism at larger scale | Reproducibility instead depends on the frozen, locally-persisted bytes plus the proof receipt (C3), not on live re-fetch |
| C12 | DRA-GC-1 has been independently validated by a party outside this research programme | `NOT_SUPPORTED` | No such evaluation has occurred; explicit status `EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED` | This is a genuine, disclosed gap, not a scope exclusion — it is the leading item for post-publication work |

## Notes on scope-only claims

No claim above is rated `OUT_OF_SCOPE`; all twelve were judged directly answerable from existing
evidence (either as supported, limited, or unsupported) rather than requiring new work to even
assess. Claims that would require new work to evaluate — e.g. "DRA-GC-1 generalises to
right-to-left scripts" or "DRA-GC-1 handles mixed-language documents" — are addressed instead as
disclosed scope boundaries in the limitations document, not scored here as pending claims, because
no version of them was ever asserted as a candidate publication claim in the first place.
