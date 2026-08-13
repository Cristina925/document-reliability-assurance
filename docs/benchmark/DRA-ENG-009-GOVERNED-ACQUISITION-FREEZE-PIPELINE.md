# DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline

## Overview

DRA-ENG-009 extends the existing governed acquisition, provenance, eligibility, corpus, and benchmark infrastructure with:

- **Source-byte preservation** from HTTP/HTTPS sources via an injectable `SourceFetcher` abstraction
- **Governed official-source and licence assessments** by human reviewers (machine collects evidence; only VERIFIED status unblocks freeze)
- **Byte-level and text-level integrity** with per-document SHA-256 digests at the raw-byte, normalised-text, and approved-metadata levels
- **Per-document immutable freeze records** (`AcquisitionFreezeRecord`, `DRA-FRZ-NNNNNN`) distinct from the corpus-version-level `FreezeRecord` in `governance/freeze.ts`
- **Corpus integration** mapping acquired documents to `CorpusDocumentInput` for the existing `CorpusRegistry`
- **Benchmark execution linkage** connecting the DRA proof receipt to the exact frozen document via `BenchmarkProofReference`

No changes are made to the CTS evaluator, CTS schemas, CTS fixtures, or existing DRA decision and issue-class semantics.

---

## Architecture

### Trust boundary

The pipeline enforces two unconditional human-governed gates:

1. **Official-source assessment** (`OfficialSourceAssessment.status === "VERIFIED"`)  
   A qualified reviewer confirms the document originates from an authoritative official source. The machine may collect URL and domain evidence; it may not auto-set VERIFIED.

2. **Licence assessment** (`LicenceAssessment.status === "VERIFIED"`)  
   A qualified reviewer confirms the licence permits benchmark use. No automated legal-certainty claims are made. Missing or unclear licence information never defaults to VERIFIED.

Both gates are checked at the OFFICIAL_SOURCE and LICENCE stages respectively. A failed gate returns a typed error; the registry is never mutated.

### Integrity layers

| Layer | Digest | Computed by |
|---|---|---|
| Raw source bytes | `sourceDigest` (SHA-256 of `Uint8Array`) | `computeSourceDigest()` — new in DRA-ENG-009 |
| Normalised text | `normalisedTextDigest` (SHA-256 of text string) | Reuses `computeContentDigest()` from `governance/eligibility.ts` |
| Approved metadata | `metadataDigest` (SHA-256 of canonical JSON) | `computeApprovedMetadataDigest()` |
| Per-document freeze record | `freezeRecordDigest` (SHA-256 over material fields) | `computeAcquisitionFreezeRecordDigest()` |
| Corpus manifest | `overallDigest` (SHA-256 over manifest fields) | Reuses `verifyManifestIntegrity()` from `corpus/integrity.ts` |

The `frozenAt` timestamp is excluded from the `freezeRecordDigest` so that timestamp variance does not invalidate substantive identity. All digests are 64-character lowercase hex strings.

### Per-document vs corpus-version freeze

- `governance/freeze.ts` `FreezeRecord` — per-corpus-version: one record per full corpus freeze (all documents, protocol digest, manifest digest, allocation snapshot). Created by `freezeCorpus()`.
- `acquisition/freeze.ts` `AcquisitionFreezeRecord` — per-document: one record per acquired public document (source URL, byte digest, text digest, metadata digest). Created by `createAcquisitionFreezeRecord()`.

These are complementary. A corpus-version freeze may reference multiple per-document `AcquisitionFreezeRecord`s.

### Normalisation

Normalisation (`normalisation.ts`) converts raw source bytes to a canonical plain-text `NormalisedDocument`:

| Media type | Processing |
|---|---|
| `text/plain` | BOM removal, CRLF→LF |
| `text/markdown` | BOM removal, CRLF→LF |
| `text/html` | Tag stripping (preserving text), entity decoding, whitespace condensing |
| `application/pdf` | Delegated to injectable `PdfExtractor` |

`NORMALISATION_VERSION = "DRA-NORM-v1"` is recorded in every `NormalisedDocument` so that future normalisation changes can be identified.

### Eligibility checks

`checkFreezeEligibility()` runs 14 checks in deterministic order. All checks complete and all blocking reasons are collected:

1. Source digest present (64 chars)
2. Normalised text non-empty
3. Text digest present (64 chars)
4. Official-source assessment VERIFIED
5. Licence assessment VERIFIED
6. Approved title non-empty
7. Approved publisher non-empty
8. Approved language non-empty
9. Corpus document ID matches `DRA-DOC-NNNN` format
10. Inclusion rationale non-empty
11. Source digest not already in registry (`registry.hasDigest()`)
12. Text digest not already in registry (`registry.hasDigest()`)
13. No near-duplicate via `assessDuplicate()` (Jaccard ≥ 0.8 threshold)
14. Corpus-level eligibility via reused `checkEligibility(candidate, protocol)`

### Reused infrastructure

The following existing modules are called directly — no competing implementations exist:

| Existing module | What is reused |
|---|---|
| `governance/eligibility.ts` | `computeContentDigest`, `buildContentPayload`, `ContentPayload`, `checkEligibility`, `CorpusCandidate` |
| `governance/near-duplicate.ts` | `assessDuplicate`, `NEAR_DUPLICATE_JACCARD_THRESHOLD` |
| `corpus/registry.ts` | `CorpusRegistry.add`, `hasId`, `hasDigest`, `exportManifest` |
| `corpus/integrity.ts` | `verifyManifestIntegrity` |
| `acquisition/provenance.ts` | `ACQUISITION_SOURCES`, `LicenceStatus` |
| `pipeline/canonical-serialise.ts` | `canonicalJsonStringify` |
| `pipeline/evaluate-document.ts` | `evaluateDocument` |
| `pipeline/evaluation-result.ts` | `DocumentAssuranceEvaluation` |
| `benchmark/execution/runner.ts` | `buildRequest` pattern for evaluator input construction |

---

## Module map

```
src/benchmark/acquisition/
├── schema.ts                    AcquisitionRequest, OfficialSourceAssessment
├── request.ts                   createAcquisitionRequest, formatAcquisitionId
├── fetcher.ts                   SourceFetcher, AcquiredSource, createMockFetcher
├── licence.ts                   LicenceAssessment, isLicenceApproved
├── metadata.ts                  DocumentMetadata, ApprovedMetadata, extraction helpers
├── normalisation.ts             normaliseContent, NormalisedDocument, PdfExtractor
├── integrity.ts                 computeSourceDigest (new), verifySourceDigest, …
├── eligibility.ts               checkFreezeEligibility, FreezeEligibilityResult
├── freeze.ts                    createAcquisitionFreezeRecord, AcquisitionFreezeRecord
├── manifest-integration.ts      integrateWithCorpus, buildCorpusDocumentInput
├── governed-pipeline.ts         acquireFreezeAndEvaluate, evaluateFrozenBenchmarkDocument
├── fixtures/
│   └── public-document-fixture.ts   NIST_FIPS_199_FIXTURE (repository fixture)
├── __tests__/
│   └── governed-acquisition.test.ts  Comprehensive test suite (12 categories)
└── index.ts                     Updated barrel — all new exports alongside existing
```

---

## Data flow

```
HTTP/HTTPS URL
     │
     ▼ SourceFetcher (injectable)
AcquiredSource { rawBytes, mediaType, httpStatus, redirects, ... }
     │
     ├─► computeSourceDigest(rawBytes) ──────────────────────► sourceDigest
     │
     ▼ normaliseContent(bytes, mediaType, sourceDigest)
NormalisedDocument { text, textDigest, sourceDigest, normalisationVersion }
     │
     ├─► OfficialSourceAssessment (human gate)
     ├─► LicenceAssessment (human gate)
     ├─► ApprovedMetadata (human-reviewed)
     │
     ▼ computeApprovedMetadataDigest(approvedMetadata)
metadataDigest
     │
     ▼ checkFreezeEligibility(...)
FreezeEligibilityResult { eligible, checks, blockingReasons? }
     │ [eligible only]
     ▼ createAcquisitionFreezeRecord(...)
AcquisitionFreezeRecord { freezeRecordId, sourceDigest, normalisedTextDigest,
                           metadataDigest, freezeRecordDigest, status: "FROZEN" }
     │
     ▼ integrateWithCorpus(record, metadata, registry)
CorpusManifest + manifestDigest
     │
     ▼ evaluateDocument(request)
DocumentAssuranceEvaluation { ok, decision, proofReceipt, issues }
     │
     ▼ BenchmarkProofReference (tamper-evident linkage)
{ freezeRecordId, corpusDocumentId, sourceDigest, normalisedTextDigest,
  metadataDigest, freezeRecordDigest, proofReceiptSubstantiveDigest }
```

---

## Operational workflow (adding DRA-DOC-0007 through DRA-DOC-0010)

1. **Identify source**: Select a complete, short, self-contained public-domain government publication. Record the official URL, publisher, and legal basis.
2. **Perform official-source assessment**: A qualified reviewer confirms the domain, certificate, and publisher identity. Records evidence in `OfficialSourceAssessment`.
3. **Perform licence assessment**: A qualified reviewer confirms the licence permits redistribution. Records evidence in `LicenceAssessment`.
4. **Prepare approved metadata**: A reviewer maps the document to corpus fields (`domain`, `documentType`, `difficulty`, `language`, `title`, `publisher`, `publicationDate`).
5. **Call `acquireFreezeAndEvaluate()`**: The pipeline fetches the source, computes integrity digests, runs eligibility checks, creates the freeze record, integrates with the registry, evaluates, and returns `BenchmarkDocumentResult`.
6. **Inspect the result**: Check `decision`, `issues`, `proofReference.proofReceiptSubstantiveDigest`, `manifestDigest`.
7. **Archive the proof reference**: Store `BenchmarkProofReference` alongside the corpus record for future re-evaluation with `evaluateFrozenBenchmarkDocument()`.

---

## Prohibited claims

- The machine must not claim that a source is VERIFIED official without human review.
- The machine must not claim that a licence is VERIFIED without human review.
- The pipeline must not silently fall back to a weaker check if the primary check fails.
- Failed pipelines must not mutate the corpus registry.
- The completion report must accurately distinguish fixture execution from live acquisition.

---

## Known limitations

- **No live HTTP client**: `SourceFetcher` is defined as an interface only. A production HTTP client must be provided by the caller.
- **PDF extraction**: PDF text extraction is delegated to an injectable `PdfExtractor`. No built-in PDF parser is provided.
- **Near-duplicate checking**: `existingCorpusTexts` must be provided by the caller; the registry stores metadata, not text content, so the caller must manage text storage separately.
- **No automated domain mapping**: The mapping from acquired document characteristics to corpus `Domain` and `DocumentType` is human-reviewed metadata; the machine suggests, a human approves.
