# DRA-001-04A — Benchmark Corpus Schema and Registry — Completion Report

| Field | Value |
|---|---|
| Milestone | DRA-001-04A — Benchmark Corpus Schema and Registry |
| Prior baseline | DRA-ENG-008B complete; 1,747 / 1,747 tests passing |
| Test count at completion | 1,861 / 1,861 |
| New tests added | 114 |
| TypeScript result | **CLEAN** — `tsc --noEmit` exits 0 |
| Build result | N/A — library package |
| Lint result | N/A — no linter configured |
| Evaluator modified | **NO** — zero changes to evaluator, pipeline, decisions, issues, or proof receipts |
| Status | **COMPLETE — ALL VALIDATIONS PASS** |

---

## 1. Files Created

| File | Purpose |
|---|---|
| `src/benchmark/corpus/schema.ts` | Schema, enumerations, corpus identifier contract, `CorpusDocumentInput`, `CorpusDocument`, `CorpusManifest` |
| `src/benchmark/corpus/integrity.ts` | SHA-256 digest computation for documents and manifests; verification functions |
| `src/benchmark/corpus/registry.ts` | `CorpusRegistry` class; add, get, list, manifest export; `CorpusRegistryError` |
| `src/benchmark/corpus/manifest.ts` | Manifest re-exports and verification utilities |
| `src/benchmark/corpus/validation.ts` | Typed `ValidationResult<T>` validators for all corpus entities |
| `src/benchmark/corpus/loader.ts` | `loadCorpus()` — validates, registers, and returns typed corpus documents |
| `src/benchmark/corpus/index.ts` | Corpus module public surface |
| `src/benchmark/corpus/fixtures/sample-inputs.ts` | Three fixture inputs for use in tests (not real benchmark documents) |
| `src/benchmark/index.ts` | Benchmark module public surface (re-exports corpus) |
| `src/benchmark/corpus/__tests__/identifier.test.ts` | Identifier tests |
| `src/benchmark/corpus/__tests__/registry.test.ts` | Registry tests |
| `src/benchmark/corpus/__tests__/integrity.test.ts` | Integrity tests |
| `src/benchmark/corpus/__tests__/manifest.test.ts` | Manifest tests |
| `src/benchmark/corpus/__tests__/validation.test.ts` | Validation tests |
| `src/benchmark/corpus/__tests__/loader.test.ts` | Loader tests |

## 2. Files Modified

| File | Change |
|---|---|
| `src/index.ts` | Added `export * from "./benchmark/index.js"` |
| `vitest.config.ts` | Added `src/benchmark/**/__tests__/**/*.test.ts` include pattern |

---

## 3. Schema Implemented

### Corpus schema version

`CORPUS_SCHEMA_VERSION = "1.0"` — frozen for this milestone. Stored in the manifest `schemaVersion` field and validated at load time against `RECOGNISED_CORPUS_SCHEMA_VERSIONS`.

### Corpus identifier

Format: `DRA-DOC-NNNN` (regex `^DRA-DOC-\d{4}$`). Validated by `CorpusIdSchema` (Zod). Utilities: `tryParseCorpusId(value)`, `corpusIdSequence(id)`.

Properties: unique, immutable, deterministic, never reused, validated on every add.

### `CorpusDocumentInput` — input type (no digest)

| Field | Type | Required |
|---|---|---|
| `corpusId` | `CorpusId` (`DRA-DOC-NNNN`) | ✅ |
| `title` | non-empty string | ✅ |
| `sourceType` | `HUMAN_AUTHORED \| AI_GENERATED \| HYBRID` | ✅ |
| `documentType` | `SUMMARY \| REWRITE \| REPORT \| EMAIL \| POLICY \| PROCEDURE \| ARTICLE \| OTHER` | ✅ |
| `domain` | `GENERAL \| BUSINESS \| TECHNICAL \| LEGAL \| HEALTHCARE \| FINANCE` | ✅ |
| `language` | non-empty string (BCP-47) | ✅ |
| `generator` | non-empty string | ✅ |
| `generatorVersion` | string | optional |
| `creationMethod` | non-empty string | ✅ |
| `difficulty` | `LOW \| MEDIUM \| HIGH` | ✅ |
| `sourceReference` | non-empty string | ✅ |
| `benchmarkStatus` | `DRAFT \| READY \| FROZEN` | ✅ |
| `notes` | string | optional |

No evaluator decisions, reviewer scores, or benchmark outcomes — by design.

### `CorpusDocument` — stored type (with digest)

Extends `CorpusDocumentInput` with `integrityDigest: string` (length 64). Always computed by the registry; callers do not supply it.

### `CorpusManifest`

| Field | Type |
|---|---|
| `schemaVersion` | `"1.0"` |
| `corpusVersion` | non-empty string |
| `documentCount` | non-negative integer |
| `documentIds` | `CorpusId[]` in canonical order |
| `overallDigest` | 64-char hex SHA-256 |

---

## 4. Registry Behaviour

**Class:** `CorpusRegistry`

| Operation | Method | Notes |
|---|---|---|
| Add document | `add(input)` | Computes digest; rejects duplicate ID or duplicate digest |
| Get by ID | `get(id)` | Returns `CorpusDocument \| undefined` |
| Get or throw | `require(id)` | Throws `CorpusRegistryError(NOT_FOUND)` if absent |
| List (canonical) | `list()` | Returns documents sorted ascending by numeric sequence |
| Check ID | `hasId(id)` | `boolean` |
| Check digest | `hasDigest(digest)` | `boolean` |
| Export manifest | `exportManifest(corpusVersion?)` | Returns a frozen `CorpusManifest` |
| Count | `size` | `number` |

**Rejection rules:**

| Condition | Error code |
|---|---|
| Corpus ID already registered | `DUPLICATE_CORPUS_ID` |
| Content-identical document under different ID | `DUPLICATE_INTEGRITY_DIGEST` |
| ID not found (require only) | `NOT_FOUND` |

Returned documents are frozen (`Object.freeze`). The registry is append-only.

---

## 5. Manifest Structure

The manifest is produced by `CorpusRegistry.exportManifest(corpusVersion?)` and is deterministic:

```
{
  schemaVersion:  "1.0",
  corpusVersion:  string,       // caller-supplied; default "1.0"
  documentCount:  number,
  documentIds:    CorpusId[],   // canonical order (ascending numeric sequence)
  overallDigest:  string        // 64-char SHA-256 hex
}
```

`overallDigest` covers `{schemaVersion, corpusVersion, documentCount, documentIds}` — the same registry state always produces the same digest. The digest field itself is excluded from its own computation.

---

## 6. Integrity Mechanism

**Algorithm:** SHA-256 (via `node:crypto` `createHash`)

**Serialisation:** `canonicalJsonStringify` (reused from `src/pipeline/canonical-serialise.ts`) — keys sorted lexicographically at every depth; arrays preserve element order; `undefined` omitted; `null` preserved.

**Document digest payload** (all fields except `corpusId` and `integrityDigest`):

| Decision | Rationale |
|---|---|
| `corpusId` excluded | `corpusId` is the identity key, not content. Excluding it allows the registry to detect content-identical documents submitted under different IDs — a corpus management error that would be invisible if the ID were folded into the digest. |
| `integrityDigest` excluded | Self-referential; excluded to prevent circularity. |
| Optional fields (`generatorVersion`, `notes`) | Included when defined, omitted when absent — `JSON.stringify` handles this naturally. |

**Manifest digest payload:** `{schemaVersion, corpusVersion, documentCount, documentIds}`.

**Verification:**
- `verifyCorpusDocumentIntegrity(doc)` → `boolean`
- `verifyManifestIntegrity(manifest)` → `boolean`

---

## 7. Loader Behaviour

`loadCorpus(rawDocuments: readonly unknown[], manifest?: CorpusManifest): LoadResult`

Steps in order:
1. For each element in `rawDocuments`: validate with `validateCorpusDocumentInput()`. Fail immediately on schema error, reporting `documentIndex`.
2. Add each validated input to a fresh `CorpusRegistry`. Fail immediately on duplicate ID or digest.
3. Validate registry integrity — all digest round-trips. Fail with `REGISTRY_INTEGRITY_FAILED`.
4. If a `manifest` is provided: validate it against the registry. Fail with `MANIFEST_VALIDATION_FAILED`.
5. Return `{ ok: true, registry, documents }` where `documents` is in canonical order.

**Load error codes:**

| Code | Trigger |
|---|---|
| `DOCUMENT_VALIDATION_FAILED` | Schema error on any input element |
| `DUPLICATE_CORPUS_ID` | Two elements share a corpus ID |
| `DUPLICATE_INTEGRITY_DIGEST` | Two elements have identical content |
| `REGISTRY_INTEGRITY_FAILED` | Digest round-trip mismatch post-registration |
| `MANIFEST_VALIDATION_FAILED` | Provided manifest is inconsistent with loaded registry |

Failures are explicit and typed — no silent coercion or partial results.

---

## 8. Validation Rules

All validators return `ValidationResult<T>` — a discriminated union `{ ok: true, value: T } | { ok: false, code, message, zodIssues? }`. They never throw.

| Validator | What it checks |
|---|---|
| `validateCorpusId(value)` | `DRA-DOC-NNNN` format; non-string values |
| `validateCorpusDocumentInput(value)` | Full Zod schema parse; enum values; missing required fields; malformed ID; invalid schema version |
| `validateCorpusDocument(value)` | Schema + stored `integrityDigest` matches recomputed value |
| `validateRegistryIntegrity(registry)` | Every registered document's digest round-trips |
| `validateManifest(value)` | Schema parse + `overallDigest` verification |
| `validateManifestAgainstRegistry(manifest, registry)` | Document count, ordered ID list, overall digest consistency |

**Validation error codes:** `INVALID_CORPUS_ID`, `INVALID_SCHEMA`, `INVALID_ENUM`, `MISSING_REQUIRED_FIELD`, `DUPLICATE_ID`, `DUPLICATE_DIGEST`, `INTEGRITY_DIGEST_MISMATCH`, `INVALID_MANIFEST`, `MANIFEST_DIGEST_MISMATCH`, `INVALID_SCHEMA_VERSION`.

---

## 9. Tests Added by Category

| Category | File | Tests |
|---|---|---|
| Identifier — format validation | `identifier.test.ts` | 14 |
| Identifier — `tryParseCorpusId` | `identifier.test.ts` | 5 |
| Identifier — `corpusIdSequence` | `identifier.test.ts` | 4 |
| Identifier — regex and ordering | `identifier.test.ts` | 3 |
| Registry — add | `registry.test.ts` | 3 |
| Registry — duplicate rejection | `registry.test.ts` | 4 |
| Registry — retrieve | `registry.test.ts` | 4 |
| Registry — list ordering | `registry.test.ts` | 4 |
| Registry — manifest export | `registry.test.ts` | 4 |
| Manifest — structure | `manifest.test.ts` | 5 |
| Manifest — digest stability | `manifest.test.ts` | 3 |
| Manifest — integrity verification | `manifest.test.ts` | 3 |
| Manifest — regeneration | `manifest.test.ts` | 2 |
| Integrity — document determinism | `integrity.test.ts` | 3 |
| Integrity — material change detection | `integrity.test.ts` | 7 |
| Integrity — operational metadata excluded | `integrity.test.ts` | 1 |
| Integrity — `verifyCorpusDocumentIntegrity` | `integrity.test.ts` | 3 |
| Integrity — manifest digest determinism | `integrity.test.ts` | 4 |
| Integrity — `verifyManifestIntegrity` | `integrity.test.ts` | 2 |
| Validation — `validateCorpusId` | `validation.test.ts` | 4 |
| Validation — `validateCorpusDocumentInput` | `validation.test.ts` | 8 |
| Validation — `validateCorpusDocument` | `validation.test.ts` | 3 |
| Validation — `validateRegistryIntegrity` | `validation.test.ts` | 2 |
| Validation — `validateManifest` | `validation.test.ts` | 5 |
| Validation — `validateManifestAgainstRegistry` | `validation.test.ts` | 2 |
| Loader — successful load | `loader.test.ts` | 6 |
| Loader — failed validation | `loader.test.ts` | 6 |
| Loader — manifest validation | `loader.test.ts` | 2 |
| Loader — registry corruption detection | `loader.test.ts` | 1 |
| **Total** | | **114** |

---

## 10. Previous Test Count

1,747

## 11. New Test Count

114

## 12. Total Passing Tests

**1,861 / 1,861**

---

## 13. TypeScript Result

**CLEAN** — `pnpm exec tsc --noEmit` exits 0. No type errors.

## 14. Build Result

N/A — `@workspace/dra-reference` is a library package. TypeScript compilation is validated via `tsc --noEmit`.

---

## 15. Known Limitations

1. **In-memory registry only.** `CorpusRegistry` is not persistent. Persistence (serialisation to JSON, loading from JSON files) is a future concern — likely DRA-001-04B or a dedicated storage milestone.

2. **Corpus schema version is frozen at `"1.0"`.** `RECOGNISED_CORPUS_SCHEMA_VERSIONS` is a one-element tuple. A schema migration path is not yet defined.

3. **Corpus version (`corpusVersion` in the manifest) is caller-supplied** and not validated beyond being a non-empty string. There is no enforced versioning policy (e.g. semantic versioning) at this milestone.

4. **No freeze enforcement.** A document with `benchmarkStatus: "FROZEN"` can still be replaced or have its fields changed before it is registered. The `FROZEN` status is a metadata value, not a registry-level lock.

5. **No corpus document content storage.** `CorpusDocumentInput.sourceReference` is a free-text reference string. The actual document content (text) is not stored in the corpus schema — that is deferred to the document storage layer in a future milestone.

---

## 16. Recommended Next Milestone

**DRA-001-04B — Benchmark Corpus Population**

Populate the benchmark corpus with the initial set of DRA-001 benchmark documents. For each document:
- Assign a permanent `DRA-DOC-NNNN` identifier.
- Complete all required metadata fields.
- Set `benchmarkStatus` appropriately (DRAFT → READY → FROZEN).
- Register in the corpus registry.
- Verify integrity digests.
- Export and validate the corpus manifest.

Do not execute the evaluator during 04B. Evaluation is a separate milestone.

---

## 17. Commit Hash

Not applicable — Replit environment; no Git commit recorded for this milestone.
