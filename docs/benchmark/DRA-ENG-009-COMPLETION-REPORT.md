# DRA-ENG-009 — Completion Report

## Status: COMPLETE

---

## What was built

DRA-ENG-009 extends the existing governed acquisition, provenance, eligibility, corpus, and benchmark infrastructure with source-byte preservation, governed official-source and licence assessments, normalised-text integrity, per-document immutable freeze linkage, and benchmark execution linkage for public documents.

---

## Files created

| Path | Purpose |
|------|---------|
| `src/benchmark/acquisition/schema.ts` | `AcquisitionRequest` Zod schema, `OfficialSourceAssessment`, `ACQUISITION_PIPELINE_STAGES` |
| `src/benchmark/acquisition/request.ts` | `createAcquisitionRequest`, `formatAcquisitionId`, `validateSourceUrl` |
| `src/benchmark/acquisition/fetcher.ts` | `SourceFetcher` interface, `AcquiredSource`, `createMockFetcher` |
| `src/benchmark/acquisition/licence.ts` | `LicenceAssessment`, `isLicenceApproved`, `isPublicDomainBasis` |
| `src/benchmark/acquisition/metadata.ts` | `ExtractedMetadataField<T>`, `DocumentMetadata`, `ApprovedMetadata`, extraction helpers |
| `src/benchmark/acquisition/normalisation.ts` | `normaliseContent`, `NormalisedDocument`, `PdfExtractor`, `NORMALISATION_VERSION` |
| `src/benchmark/acquisition/integrity.ts` | `computeSourceDigest` (new byte-level primitive), verify helpers, metadata/freeze record digest functions |
| `src/benchmark/acquisition/eligibility.ts` | `checkFreezeEligibility`, `FreezeEligibilityResult`, `FreezeEligibilityCheck` |
| `src/benchmark/acquisition/freeze.ts` | `AcquisitionFreezeRecord`, `createAcquisitionFreezeRecord`, `verifyAcquisitionFreezeRecordDigest` |
| `src/benchmark/acquisition/manifest-integration.ts` | `integrateWithCorpus`, `buildCorpusDocumentInput` |
| `src/benchmark/acquisition/governed-pipeline.ts` | `acquireFreezeAndEvaluate`, `evaluateFrozenBenchmarkDocument`, `BenchmarkProofReference`, `BenchmarkDocumentResult` |
| `src/benchmark/acquisition/fixtures/public-document-fixture.ts` | `NIST_FIPS_199_FIXTURE` (repository fixture) |
| `src/benchmark/acquisition/__tests__/governed-acquisition.test.ts` | Comprehensive test suite (12 categories) |
| `docs/benchmark/DRA-ENG-009-GOVERNED-ACQUISITION-FREEZE-PIPELINE.md` | Architecture and operational reference |
| `docs/benchmark/DRA-ENG-009-COMPLETION-REPORT.md` | This document |

## Files modified

| Path | Change |
|------|--------|
| `src/benchmark/acquisition/index.ts` | Added 163-line section exporting all new public APIs; all existing exports preserved unchanged |

---

## New public exports

All exports are named re-exports (no `export *`), consistent with the existing barrel pattern.

**schema:** `SUPPORTED_MEDIA_TYPES`, `isSupportedMediaType`, `ACQUISITION_ID_REGEX`, `AcquisitionIdSchema`, `AcquisitionRequestSchema`, `OFFICIAL_SOURCE_ASSESSMENT_STATUSES`, `OfficialSourceAssessmentSchema`, `ACQUISITION_PIPELINE_STAGES`, types `SupportedMediaType`, `AcquisitionId`, `AcquisitionRequest`, `OfficialSourceAssessmentStatus`, `OfficialSourceAssessment`, `AcquisitionPipelineStage`, `AcquisitionPipelineError`

**request:** `createAcquisitionRequest`, `validateSourceUrl`, `formatAcquisitionId`, type `RequestValidationResult`

**fetcher:** `DEFAULT_MAX_SOURCE_BYTES`, `createMockFetcher`, types `AcquiredSource`, `SourceFetchErrorCode`, `SourceFetchResult`, `SourceFetcherOptions`, `SourceFetcher`, `MockFetcherResponse`

**licence:** `LICENCE_ASSESSMENT_STATUSES`, `LICENCE_BASIS_VALUES`, `LicenceAssessmentSchema`, `isLicenceApproved`, `isPublicDomainBasis`, types `LicenceAssessmentStatus`, `LicenceBasis`, `LicenceAssessment`

**metadata:** `METADATA_SOURCES`, `METADATA_CONFIDENCE_LEVELS`, `computeWordCount`, `extractMetadataFromHtml`, `extractMetadataFromMarkdown`, `extractMetadataFromPlainText`, types `MetadataSource`, `MetadataConfidence`, `ExtractedMetadataField`, `DocumentMetadata`, `ApprovedMetadata`

**normalisation:** `NORMALISATION_VERSION`, `normaliseContent`, types `PdfExtractor`, `NormalisedDocument`, `NormalisationResult`, `NormalisationErrorCode`

**integrity:** `computeSourceDigest`, `verifySourceDigest`, `verifyTextDigest`, `computeApprovedMetadataDigest`, `verifyApprovedMetadataDigest`, `computeAcquisitionFreezeRecordDigest`

**eligibility:** `checkFreezeEligibility`, types `FreezeEligibilityCheck`, `FreezeBlockingReason`, `FreezeEligibilityResult`

**freeze:** `ACQUISITION_FREEZE_RECORD_ID_REGEX`, `formatFreezeRecordId`, `createAcquisitionFreezeRecord`, `verifyAcquisitionFreezeRecordDigest`, types `AcquisitionFreezeRecord`, `CreateAcquisitionFreezeRecordInput`

**manifest-integration:** `buildCorpusDocumentInput`, `integrateWithCorpus`, types `CorpusIntegrationResult`, `CorpusIntegrationErrorCode`

**governed-pipeline:** `acquireFreezeAndEvaluate`, `evaluateFrozenBenchmarkDocument`, types `BenchmarkProofReference`, `BenchmarkDocumentResult`, `AcquisitionDependencies`, `AcquireFreezeAndEvaluateInput`, `AcquireFreezeAndEvaluateResult`, `FrozenBenchmarkEvaluationInput`, `FrozenBenchmarkEvaluationResult`

---

## Quality gate results

| Gate | Result |
|------|--------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| Workspace typecheck (`pnpm -w run typecheck:libs`) | 0 errors |
| Existing tests (pre-DRA-ENG-009) | 2814 pass — 0 regressions |
| New tests (DRA-ENG-009) | 88 pass (12 categories) |
| Total tests | 2902 pass |
| CTS changes | None |
| DRA decision/issue-class semantics changed | None |
| Existing `acquisition/index.ts` exports removed | None |

---

## Fixture: REPOSITORY_FIXTURE — NOT LIVE ACQUISITION

**Label:** `REPOSITORY_FIXTURE — NOT LIVE ACQUISITION`

The test fixture (`fixtures/public-document-fixture.ts`) contains the verbatim text of NIST FIPS PUB 199 "Standards for Security Categorization of Federal Information and Information Systems" (February 2004), Sections 1–5. The text was checked into the repository for deterministic testing on **2026-07-01**.

| Field | Value |
|-------|-------|
| Document | NIST FIPS PUB 199 — Sections 1–5 |
| Publisher | National Institute of Standards and Technology (NIST), U.S. Department of Commerce |
| Official source URL | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf |
| Publication date | February 2004 |
| Legal basis | US Government Work — Public Domain (17 U.S.C. § 105) |
| Fixture acquisition date | 2026-07-01 (date text was checked into repository) |
| Word count | 567 |
| `sourceDigest` | `562b50ad13a82ebc2c2da632bec89e74bc2812ca5a9c73ebaea5ec6bbe924ec5` |
| `normalisedTextDigest` | `562b50ad13a82ebc2c2da632bec89e74bc2812ca5a9c73ebaea5ec6bbe924ec5` |
| Why digests are equal | Plain text with LF endings and no BOM; normalisation is a no-op for this input |

**No live network fetch was performed** at any point during DRA-ENG-009 implementation or testing. The test suite runs entirely with injected mock data via `createMockFetcher`.

To verify authenticity of the fixture text, compare it against the official PDF at the source URL above.

---

## Reuse record

The following existing exports are called directly by the new modules (no competing implementations were created):

| Existing export | Used by |
|----------------|---------|
| `computeContentDigest()` — `governance/eligibility.ts` | `normalisation.ts` (textDigest), `integrity.ts` (verifyTextDigest) |
| `buildContentPayload()` — `governance/eligibility.ts` | `eligibility.ts` (CorpusCandidate construction) |
| `checkEligibility()` — `governance/eligibility.ts` | `eligibility.ts` (corpus-level eligibility gate) |
| `assessDuplicate()` — `governance/near-duplicate.ts` | `eligibility.ts` (near-duplicate detection) |
| `NEAR_DUPLICATE_JACCARD_THRESHOLD` — `governance/near-duplicate.ts` | `eligibility.ts` (threshold label in check detail) |
| `CorpusRegistry.add/hasId/hasDigest/exportManifest` — `corpus/registry.ts` | `eligibility.ts`, `manifest-integration.ts`, `governed-pipeline.ts` |
| `verifyManifestIntegrity()` — `corpus/integrity.ts` | `manifest-integration.ts`, `governed-pipeline.ts` |
| `canonicalJsonStringify()` — `pipeline/canonical-serialise.ts` | `integrity.ts` (canonical JSON for digests) |
| `evaluateDocument()` — `pipeline/evaluate-document.ts` | `governed-pipeline.ts` (both entry points) |
| `DocumentAssuranceEvaluation` — `pipeline/evaluation-result.ts` | `governed-pipeline.ts` |
| `buildMinimalProtocol()` — `governance/schema.ts` | `__tests__/governed-acquisition.test.ts` (test setup) |

---

## Architecture decisions recorded

1. **`governed-pipeline.ts` not `pipeline.ts`**: `pipeline.ts` already exists with 7 test files. The orchestration module is named `governed-pipeline.ts` to avoid conflict. All existing `pipeline.ts` exports and tests are untouched.

2. **`AcquisitionFreezeRecord` not `FreezeRecord`**: The existing `governance/freeze.ts` `FreezeRecord` is per-corpus-version. The new `AcquisitionFreezeRecord` is per-document. Different concepts; distinct names prevent confusion.

3. **`FreezeEligibilityResult` not `EligibilityResult`**: The existing `governance/eligibility.ts` `EligibilityResult` checks corpus candidate eligibility against a selection protocol. The new `FreezeEligibilityResult` checks per-document freeze eligibility (source bytes, assessments, metadata). Complementary checks; distinct names.

4. **`LicenceAssessment` outcome vs `LicenceStatus` classification**: The existing `LicenceStatus` enum (`CC0/CC_BY/...`) classifies the type of licence. The new `LicenceAssessment` records the human-review outcome (`VERIFIED/REVIEW_REQUIRED/REJECTED`). Different concepts; no collision.

5. **`computeSourceDigest(bytes: Uint8Array)` is genuinely new**: The existing `computeContentDigest` operates on strings. The byte-level primitive is new and necessary for raw-source integrity independent of character encoding.

6. **Registry never mutated on failure**: The `acquireFreezeAndEvaluate` function checks all eligibility conditions before calling `registry.add()`. A failed eligibility check never reaches the registry mutation point.

7. **Fixture distinguished from live acquisition**: The fixture file carries an explicit `fixtureLabel: "REPOSITORY_FIXTURE — NOT LIVE ACQUISITION"` field and is documented to be verified against the official source URL.
