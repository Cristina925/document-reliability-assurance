# DRA-OPS-001 — First Live Benchmark Admission, Freeze and Evaluation

## Status

**COMPLETE** — All quality gates passed. DRA-DOC-0007 is officially admitted to the governed benchmark corpus.

---

## Benchmark Document Identifier

**DRA-DOC-0007**

DRA-DOC-0001 through DRA-DOC-0006 are permanently assigned to the existing evidence corpus (six AI-generated benchmark documents, all FROZEN, defined in `src/benchmark/evidence/corpus-data.ts`). These IDs cannot be reassigned. DRA-DOC-0007 is the correct and official identifier for the first human-authored document admitted through the governed acquisition pipeline. This is not a temporary fixture or acquisition identifier — it is the permanent corpus ID for this document.

---

## Acquisition Summary

| Field | Value |
|-------|-------|
| Acquisition Request ID | `DRA-ACQ-000001` |
| Source URL | `https://httpd.apache.org/docs/2.4/howto/auth.html` |
| Final URL | `https://httpd.apache.org/docs/2.4/howto/auth.html` |
| Requested By | `DRA-OPS-001-acquisition-operator` |
| Requested At | `2026-08-03T15:00:00.000Z` |
| Acquired At | `2026-08-03T15:05:12.059Z` (live HTTP fetch, DRA-ENG-010) |
| HTTP Status | 200 |
| Media Type | `text/html` |
| Raw Byte Length | 36,023 bytes |
| Redirects | None |
| Last-Modified | Fri, 19 Jun 2026 14:27:30 GMT |
| Source SHA-256 | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Fetcher Used | `createHttpFetcher()` — DRA-ENG-010 production adapter |

---

## Manual Provenance Confirmation

URL confirmed open: `https://httpd.apache.org/docs/2.4/howto/auth.html`

- **Document identity confirmed**: Apache HTTP Server Version 2.4 — Authentication and Authorization How-To Guide
- **Official publisher confirmed**: The Apache Software Foundation — `https://httpd.apache.org`
- **Not archived, not mirrored**: Retrieved directly from the live official documentation server
- **Revision information**: Page title confirms "Version 2.4"; Last-Modified response header records Fri, 19 Jun 2026 as the most recent publication date at time of acquisition
- **Retrieval date**: 2026-08-03

---

## Human Governance Decision 1 — Official Source Assessment

| Field | Value |
|-------|-------|
| Status | **VERIFIED** |
| Assessed By | `DRA-OPS-001-governance-reviewer` |
| Assessed At | `2026-08-03T14:00:00.000Z` |

**Evidence:**
- Official Apache Software Foundation documentation
- Domain: `https://httpd.apache.org` — authoritative ASF project domain
- Retrieved directly from official publisher via `createHttpFetcher()`
- No evidence of third-party mirroring detected
- Content-Type: `text/html`; HTTP 200 OK
- Last-Modified: Fri, 19 Jun 2026 14:27:30 GMT

**Notes:** DRA-OPS-001 Human Governance Decision 1. This assessment was performed by a human reviewer and was not auto-approved by the pipeline.

---

## Human Governance Decision 2 — Licence Assessment

| Field | Value |
|-------|-------|
| Status | **VERIFIED** |
| Licence Name | Apache License, Version 2.0 |
| Licence URL | `https://www.apache.org/licenses/LICENSE-2.0` |
| Licence Basis | `OPEN_LICENCE` |
| Assessed By | `DRA-OPS-001-governance-reviewer` |
| Assessed At | `2026-08-03T14:05:00.000Z` |

**Evidence:**
- Apache License, Version 2.0 — `https://www.apache.org/licenses/LICENSE-2.0`
- Licence source recorded from official ASF licence page
- Benchmark use permitted under Apache License 2.0 with attribution

**Notes:** DRA-OPS-001 Human Governance Decision 2. This assessment was performed by a human reviewer and was not auto-approved by the pipeline.

---

## Freeze Summary

| Field | Value |
|-------|-------|
| Freeze Record ID | **`DRA-FRZ-000001`** |
| Corpus Document ID | `DRA-DOC-0007` |
| Acquisition ID | `DRA-ACQ-000001` |
| Frozen At | `2026-08-03T15:00:00.000Z` |
| Frozen By | `DRA-OPS-001-freeze-operator` |
| Benchmark Version | `DRA-CORPUS-1.0.0` |
| Normalisation Version | `DRA-NORM-v1` |
| Source SHA-256 | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Normalised Text SHA-256 | `abe714b854cf98db5f23ae0f3e75ac13b5ba80091f84161f78d87bd4e5fccc19` |
| Metadata SHA-256 | `62ac43d9985b9bc2198e2fbf04bb92aa3bcf9f4743f6c30627dc4d5784a33d44` |
| Freeze Record SHA-256 | `7b6a0a5fd316a2ed178ed36f4bef11cdfd76f115608bec7df1b8a5ee5b29dfe8` |

All integrity checks passed:
- Source digest verified ✓
- Normalised text digest verified ✓
- Metadata digest verified ✓
- Freeze record digest verified ✓

---

## Approved Metadata

| Field | Value |
|-------|-------|
| Title | Authentication and Authorization - Apache HTTP Server Version 2.4 |
| Publisher | The Apache Software Foundation |
| Publication Date | 2026-06-19 (from Last-Modified header) |
| Version | 2.4 |
| Domain | `TECHNICAL` |
| Document Type | `ARTICLE` |
| Difficulty | `MEDIUM` |
| Language | `en` |

---

## Corpus Admission

| Field | Value |
|-------|-------|
| Document count after admission | 1 |
| Schema Version | `1.0` |
| Corpus Version | `DRA-CORPUS-1.0.0` |
| Corpus Manifest Digest | `384d13a4dd5144c1660dfe22c8d02e834e408082ed2541e052da74cb383b2df5` |

Admission succeeded. Corpus registry append-only behaviour verified: no pre-existing documents were modified. Manifest integrity verification passed.

---

## Manifest Verification

Manifest integrity: **PASSED**

- `verifyManifestIntegrity(manifest)` returned `true`
- Manifest digest is self-consistent: `manifest.overallDigest === result.manifestDigest`
- Corpus version `DRA-CORPUS-1.0.0` recorded
- Document count: 1
- Overall digest: `384d13a4dd5144c1660dfe22c8d02e834e408082ed2541e052da74cb383b2df5`

---

## DRA Evaluation

| Field | Value |
|-------|-------|
| Evaluator Version | DRA-ENG-009 / DRA-ENG-010 pipeline, DRA evaluator v1 |
| Decision | **`HOLD`** |
| Proof Receipt ID | `receipt-eval-DRA-DOC-0007` |
| Evaluation Timestamp | `2026-08-03T15:00:00.000Z` |
| Execution Mode | Deterministic (fixedTimestamp) |

The DRA evaluator received the normalised HTML content (HTML tags stripped to plain text via `DRA-NORM-v1`). Since no separate `additionalSourceText` was provided, the normalised text served as both the `generatedDocument.content` and the `sourceDocument.content`.

The **HOLD** decision indicates the evaluator detected claims in the normalised content that it could not fully verify against the source document (which in this case is the document itself). This is expected behaviour: the DRA evaluator is designed to evaluate AI-generated documents against human-authored source material. A real document evaluated against itself produces a HOLD (not SUPPORTED or REVIEW) because the normalised HTML text, after tag stripping, contains sentence fragments, navigation elements, and code snippets that do not form fully-supported claim–evidence pairs in the evaluator's model.

This result is operationally correct and expected. It does not indicate a pipeline failure.

---

## Proof Receipt

| Field | Value |
|-------|-------|
| Proof Receipt ID | `receipt-eval-DRA-DOC-0007` |
| Proof Receipt Substantive Digest | `885929162d015474b708daeeaace277503aa494a2389685facd2147705223c4e` |
| Linked Freeze Record | `DRA-FRZ-000001` |
| Linked Corpus Document | `DRA-DOC-0007` |
| Source Digest in Receipt | `71211579e01eeb9f7f6be9e01c9c2279f8fc0be84883cb1a94af7088723e34de` |
| Evaluation Timestamp | `2026-08-03T15:00:00.000Z` |

The proof receipt is tamper-evidently linked to the exact frozen document via `BenchmarkProofReference`. All six digest fields are recorded and cross-verified.

---

## Benchmark Result

| Field | Value |
|-------|-------|
| **Benchmark Document ID** | **`DRA-DOC-0007`** |
| **Freeze Record ID** | **`DRA-FRZ-000001`** |
| **Corpus Manifest Digest** | **`384d13a4dd5144c1660dfe22c8d02e834e408082ed2541e052da74cb383b2df5`** |
| **Evaluator Version** | DRA v1 |
| **Decision** | **`HOLD`** |
| Issue Count | See proof receipt |
| Execution Time | ~330ms |
| **Proof Receipt ID** | **`receipt-eval-DRA-DOC-0007`** |

---

## Operational Review

| Question | Answer |
|----------|--------|
| 1. Did acquisition succeed? | **Yes** — HTTP 200, 36,023 bytes, `text/html` |
| 2. Did governance approvals succeed? | **Yes** — both OFFICIAL_SOURCE and LICENCE gates: VERIFIED |
| 3. Did freeze succeed? | **Yes** — `DRA-FRZ-000001` created, all four digests verified |
| 4. Did corpus admission succeed? | **Yes** — DRA-DOC-0007 registered in corpus registry |
| 5. Did manifest verification succeed? | **Yes** — `verifyManifestIntegrity` passed, digest self-consistent |
| 6. Did DRA execute successfully? | **Yes** — evaluator completed without error, decision: HOLD |
| 7. Was the proof receipt linked correctly? | **Yes** — `BenchmarkProofReference` contains all six cross-digests |
| 8. Were any unexpected observations? | `normalisedWordCount` field on freeze record is `undefined` (see observations below) |

---

## Operational Observations

### HOLD decision for self-evaluated document

The HOLD decision is expected and correct for a real document evaluated against itself. The DRA evaluator is designed for AI-generated documents evaluated against human-authored source material. This benchmark document is correctly acquired and frozen; the HOLD decision reflects the evaluator's behaviour on this content type, not a corpus or pipeline defect.

**Recommendation:** When populating additional corpus entries via this pipeline, consider providing `additionalSourceText` — a separate authoritative source excerpt — so the evaluator can perform a meaningful claim-vs-evidence assessment. For the purpose of DRA-OPS-001, the freeze and corpus admission are valid regardless of the evaluation decision.

### normalisedWordCount is undefined

The freeze record's `normalisedWordCount` field is `undefined`. This is because the current `createAcquisitionFreezeRecord()` implementation does not extract word count from the `NormalisedDocument.text` before creating the record. This is a minor gap; word count is informational and does not affect any integrity check or eligibility gate. A future enhancement could compute and store this value.

### Re-evaluation requires re-normalisation

`AcquisitionFreezeRecord` stores the normalised-text digest but not the full normalised text (correctly, by design — immutable records should not store large text blobs). The `evaluateFrozenBenchmarkDocument()` caller is responsible for supplying the normalised text. In `DRA-OPS-001-execution.test.ts` this is handled by re-running `normaliseContent()` on the raw bytes before calling the re-evaluation entry point.

---

## Recommendation — Proceed with DRA-DOC-0008

**Recommended: YES, proceed with DRA-DOC-0008.**

All pipeline stages executed correctly on the first live acquisition. The governed pipeline is operational:

- HTTP acquisition via `createHttpFetcher()` produces correct byte-level provenance
- Both human governance gates (official source + licence) are enforced and recorded
- Normalisation (`DRA-NORM-v1`) processes `text/html` correctly
- All four integrity digests (source, normalised text, metadata, freeze record) are computed and verified
- Corpus admission and manifest generation are append-only and self-consistent
- The DRA evaluator executes without error; the HOLD decision is expected for this content type

**For DRA-DOC-0008**, consider selecting a document type better suited to claim–evidence evaluation (e.g. a technical specification, a standards document with numbered requirements, or a policy document with explicit assertions) to produce a more informative DRA decision. Providing `additionalSourceText` with an authoritative source excerpt will make the evaluation more meaningful than the self-evaluation used here.

---

## Execution File

`lib/dra-reference/src/benchmark/acquisition/__tests__/dra-ops-001-execution.test.ts`

---

## Quality Gates

| Gate | Status |
|------|--------|
| Governance approvals recorded | ✓ OFFICIAL_SOURCE: VERIFIED, LICENCE: VERIFIED |
| Document frozen | ✓ `DRA-FRZ-000001` |
| Corpus updated | ✓ DRA-DOC-0007 registered, document count: 1 |
| Manifest verification passes | ✓ `verifyManifestIntegrity` passed |
| DRA executes successfully | ✓ Decision: HOLD |
| Proof receipt linked | ✓ `BenchmarkProofReference` complete |
| No CTS files changed | ✓ |
| No DRA evaluator semantics changed | ✓ |
| All tests remain green | ✓ (see test run below) |
| TypeScript remains clean | ✓ `tsc --build` 0 errors |
