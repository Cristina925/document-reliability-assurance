# DRA-PUB-001 — Publication Limitations

Companion to `DRA-PUB-001-FINAL-EVIDENCE-SYNTHESIS.md`. This is the disclosure section intended to
travel with any first publication of DRA-GC-1. Every item below is a limitation this programme has
already found and evidenced — none is speculative, and none is softened relative to the source
report it is drawn from.

## 1. Issue-class coverage ceiling (3 of 9)

DRA-GC-1's frozen Version 1 evaluator can only ever produce 3 of its own 9 defined issue classes:
`EVIDENCE_ABSENT` (IC-4), `EVIDENCE_INADEQUATE` (IC-5), and `CLAIM_INCONSISTENCY` (IC-7). The other
6 (`UNSUPPORTED_CLAIM`, `AUTHORITY_EXPIRED`, `AUTHORITY_ABSENT`, `EVIDENCE_CONFLICT`,
`TRACEABILITY_BROKEN`, `SCOPE_VIOLATION`) are `STRUCTURALLY_UNREACHABLE` — proven by code-path
analysis, targeted tests, and adversarial challenge to be impossible under the current
implementation, not merely absent from the documents evaluated so far. Any reader interpreting a
`SUPPORTED` decision as "no issues of any of the 9 defined kinds exist" is drawing an unsupported
inference; DRA-GC-1 can only speak to the 3 reachable kinds.

## 2. Stage 5 (materiality) cross-language degradation for Spanish

Demonstrated by a controlled 25-pair experiment (ENG-026): 25/25 accuracy in English, 11/25 in
Spanish, root-caused to 5 of roughly 24 materiality rules having English-only lexical triggers. An
experimental correction exists but is **not** part of GC-1 and was independently rejected at
candidate-admission review (`GC2-REV-001`) for introducing a new adversarial false positive
(`"es preciso"`). This limitation is accepted and disclosed (known-defect-ledger item D3,
`ACCEPTED_GC-1_LIMITATION`), not fixed.

## 3. Non-Latin script coverage is CJK- and Cyrillic-only

The programme has admitted and evaluated exactly one Japanese document (CJK) and one Bulgarian
document (Cyrillic) that exercised non-Latin, non-whitespace-delimited text handling. No document
in any script family beyond these two — Devanagari or other Brahmic abugidas, Arabic or Hebrew
abjads, Hangul, or any right-to-left script — has ever been admitted to the corpus or evaluated.
One planned acquisition into this space (DRA-DOC-0033, Hindi/Devanagari) remains blocked at the
external acquisition gate and was never admitted; its Phase 1 discovery findings are explicitly
labelled preliminary reconnaissance, not corpus validation, in `DRA-ROB-001`.

## 4. Multi-column layout reconstruction is partial and fails safe, not complete

An opt-in, bbox-based column-detection engine (ENG-024/025) measurably improves reading-order
recovery on the document that discovered the defect (pair-adjacency preservation rose from ~39% to
~56%) and performs cleanly on an out-of-sample pure multi-column control document, but on hybrid
prose/table layouts it deliberately falls back to passthrough rather than guessing. The residual
gap is formally classified `AMBIGUOUS-REPRESENTATION-LIMITED`. This is a real, current limit on
how reliably DRA-GC-1 reconstructs reading order in multi-column source material, not a solved
problem with edge cases.

## 5. Rejected GC-2 candidate

A candidate successor evaluator with a corrected Stage 5 (intended to fix the Spanish materiality
gap in item 2) was built, tested, and formally rejected at admission review because adversarial
probing found a new false-positive class not present in the frozen GC-1. DRA-GC-2 does not exist
as an admitted candidate. Any future reference to "DRA-GC-2" prior to a fresh, successful admission
review would be inaccurate.

## 6. GEN-001's HTML_ENGLISH stratum was entirely lost, and is a separate study from its replacement

DRA-GEN-001, the programme's original broad blind generalisation study, lost its entire
`HTML_ENGLISH` stratum (25 of its 100 locked units) to external content drift between sample
lock and evaluation, due to a re-fetch-verification design in its own protocol. This gap was
subsequently closed by a second, independently pre-registered study (DRA-VAL-002, 25/25
evaluated), but VAL-002 is a distinct study with its own protocol, sample, and denominators — it
does not retroactively change GEN-001's own reported 75/100 evaluated figure, its exclusion count,
or its verdict language (`GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION`).

## 7. Mixed-language and compound/extreme documents are untested by design

The programme has deliberately followed a single-variable-per-experiment discipline throughout its
robustness programme (established explicitly at `DRA-ACQ-013`). As a direct consequence, no
document combining multiple languages within a single file, and no document deliberately combining
several stress dimensions at once (e.g. large scale + heavy tables + OCR + multi-column in one
file), has ever been tested. This is a genuine, currently-unaddressed scope boundary, not an
oversight, and not evidence of either success or failure on those dimensions.

## 8. No external independent validation has been performed

Every piece of evidence behind DRA-GC-1 — development corpus, robustness experiments, both blind
studies, and this synthesis — was produced within the same research programme, using the same
evaluator, the same infrastructure, and the same statistical methods. No outside party has
independently implemented, re-run, or evaluated DRA-GC-1 against a sample it did not select. This
status (`EXTERNAL_INDEPENDENT_VALIDATION_NOT_YET_PERFORMED`) is the most significant open item
before any claim stronger than "internally evidenced first candidate" could be made.

## 9. Live re-fetch of cited source URLs is not a reliable reproducibility path

Measured directly, twice: GEN-001 lost 25/25 units of one stratum to live content drift, and
VAL-002's own post-hoc check (performed after its results were already frozen via persisted bytes)
found 7 of 25 sources had already drifted and 3 of 25 were rate-limited within roughly the same
programme period. Anyone attempting to independently confirm this programme's findings by
re-fetching the original public URLs should expect a meaningful fraction of drift or
unavailability; reliable reproducibility requires the frozen, locally-persisted source bytes plus
proof-receipt verification, not live re-acquisition.

## 10. `SUPPORTED` is an evidentiary-structure judgement, not a factual-truth verification

DRA-GC-1 evaluates whether a document's claims have identifiable authority, linked evidence,
appropriate materiality classification, and internal consistency. A `SUPPORTED` decision means the
document passed this structural evaluation; it is not, and must not be represented as, an
independent verification that the document's underlying factual content is true or accurate.

## 11. Development-corpus diversity is real but not a generalisation sample

The 33-document development corpus spans five domains, multiple jurisdictions, five languages,
and both PDF and HTML formats — but it was assembled by deliberate, hypothesis-driven selection to
discover specific robustness gaps (Section 5 of the synthesis document), not drawn as a
representative population sample. Its diversity supports "the programme has exercised many
different document shapes" claims; it does not, by itself, support generalisation claims — those
rest on the two blind studies (GEN-001, VAL-002) specifically.

## 12. Publication package is not yet assembled

This review produced the evidence synthesis, claim matrix, and this limitations document, but did
not draft the actual research manuscript, a literature-positioning section, a public-facing
summary, or a consolidated reader-facing evidence appendix. These remain outstanding work items
for whoever assembles the actual publication, separate from the readiness question this review
answers.
