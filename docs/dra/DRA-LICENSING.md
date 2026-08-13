# DRA Licensing Boundary

**Document identifier:** DRA-LICENSING-001
**Status:** ACTIVE — AUTHORITATIVE (licensing/publication governance only)
**Established:** DRA-PUB-007 (Documentation and Publication Licence Closure)

This is the authoritative, human-readable licensing boundary for the DRA (Document Reliability Assurance) research programme and its public release. It does not describe, and has no effect on, DRA's scientific content, evaluator behaviour, corpus evidence, experimental results, or claim boundaries — see `docs/dra/DRA-PUBLIC-CLAIMS.md` for those. If any statement here ever appears to conflict with a specific file's own licence notice, the specific file's notice controls (see "Precedence" below).

## Software

Unless otherwise indicated, original DRA software/source code — the evaluator implementation, pipeline, benchmark/acquisition/governance tooling, and test suite (principally `lib/dra-reference/src/`) — is licensed under the **MIT License**. See the repository's root `LICENSE` file for the full legal text.

## Original DRA research and documentation

Unless otherwise indicated, original DRA-authored material — the research manuscript, protocol documents, freeze/governance records, benchmark and acquisition reports, explanatory documentation, and diagrams (principally the contents of `docs/dra/`) — is licensed under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

- Canonical identifier: `CC-BY-4.0`
- Canonical URL: https://creativecommons.org/licenses/by/4.0/
- See the repository's root `LICENSE-DOCUMENTATION` file for the licence notice and legal-code reference.

CC BY 4.0 applies only to material for which the DRA author holds the necessary rights — that is, DRA's own original authored text, analysis, protocol design, and diagrams. **Third-party material is excluded from the CC BY 4.0 grant and remains subject to its original rights and licence terms**, even where it is quoted, excerpted, summarised, or referenced within an otherwise CC-BY-4.0-licensed DRA document (see "Third-party material" below).

## Third-party material

Third-party documents, source materials, datasets, extracts, quotations, figures, standards, or other content originating outside this research programme retain their original copyright and licensing status. **DRA does not relicense third-party material under MIT or CC BY 4.0**, in whole or in part, unless DRA actually holds the necessary rights to do so.

This applies regardless of where the third-party material appears — including short quotations or extracts embedded inside an otherwise CC-BY-4.0-licensed DRA report, protocol document, or the manuscript itself. Embedding a third-party excerpt for citation, analysis, or evidentiary purposes does not bring that excerpt under DRA's own licence.

See `docs/dra/DRA-ATTRIBUTION.md` for the complete per-document licence/public-domain breakdown of persisted third-party material, and `docs/dra/DRA-THIRD-PARTY-LICENSING.md` for a publication-oriented summary by licence category.

## Restricted or uncertain redistribution

Where DRA has sufficient evidence to evaluate a third-party document or preserve its provenance, but public redistribution rights for the raw document bytes are absent, unclear, restricted, or separately scoped (for example, material licensed CC BY-ND, Crown-copyright material outside OGL, or material under a bespoke publisher notice), the future curated public repository should normally publish only:

- the source URL;
- the publisher's identity;
- acquisition metadata (acquisition date, method, licence determination);
- the cryptographic digest of the acquired content;
- freeze/provenance metadata; and
- reproduction instructions,

rather than redistributing the raw source bytes without an established permission. This is already how the vast majority of DRA's corpus and generalisation-study source material is treated (metadata/digest-only) — the exception is the 25 DRA-VAL-002 raw-byte files, individually cleared for redistribution (see `DRA-ATTRIBUTION.md`, Category 1).

**Excluding raw third-party bytes from the curated public repository for licensing reasons does not alter historical freeze records, digests, evaluation results, or experimental provenance.** A document's inclusion in DRA's evidence base, and the redistributability of its raw bytes, are independent questions; narrowing the latter never retroactively changes the former.

## Precedence

Individual third-party licences and explicit per-file or per-passage notices take precedence over this document's general MIT/CC BY 4.0 declarations for the material they cover. Where a specific document's acquisition record (a `DRA-ACQ-0NN` report) recorded a narrower or more specific determination than the general categories described here, that determination controls.

## Scope note

This document governs *publication licensing* only. It does not add, remove, or reinterpret any scientific claim, evaluator behaviour, corpus content, or experimental result; those are governed exclusively by the scientific and evidentiary records referenced throughout `docs/dra/` (see in particular `DRA-PUBLIC-CLAIMS.md` and the DRA-GC-1 freeze records).
