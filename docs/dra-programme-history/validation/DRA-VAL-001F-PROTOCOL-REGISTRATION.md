# DRA-VAL-001F — Protocol Registration Record

**Status: REGISTERED**

---

## 1. Overview

This record constitutes the formal registration of the DRA Scientific Validation Protocol package. Registration activates the amendment rules and authorises corpus acquisition to proceed. No scientific benchmark results were inspected before registration.

---

## 2. Protocol Package Registry

The following six protocol documents are registered as the frozen DRA-VAL-001 protocol package. Each document is identified by its canonical relative path from the repository root of `lib/dra-reference/`.

| # | Document | Version |
|---|----------|---------|
| 1 | `docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` | DRA-VAL-001 v1.0 |
| 2 | `docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` | DRA-VAL-001A v1.0 |
| 3 | `docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md` | DRA-VAL-001B-REV v1.0 |
| 4 | `docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md` | DRA-VAL-001C v1.0 |
| 5 | `docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` | DRA-VAL-001D v1.0 |
| 6 | `docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md` | DRA-VAL-001E v1.0 |

---

## 3. Per-File Integrity Record

### File 1 — Scientific Validation Charter

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md` |
| Protocol version | DRA-VAL-001 v1.0 |
| Byte size | 10,245 |
| SHA-256 digest | `97fb718144272d155f269c92d48087f8d427f91c1d30104d52736bd00a0f550a` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

### File 2 — Benchmark Corpus Protocol

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md` |
| Protocol version | DRA-VAL-001A v1.0 |
| Byte size | 12,627 |
| SHA-256 digest | `401b7900ef0c4e881051abdf511dc50092fcd0a41bf0907c0da79b64f680356e` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

### File 3 — Reviewer Protocol

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md` |
| Protocol version | DRA-VAL-001B-REV v1.0 |
| Byte size | 11,092 |
| SHA-256 digest | `67b2e1d9d7d8a8f2fb4ae691dfc671b812ef62fa1cda15b50d6823207d00d83c` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

### File 4 — Comparison Protocol

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md` |
| Protocol version | DRA-VAL-001C v1.0 |
| Byte size | 8,851 |
| SHA-256 digest | `fe4b2d494d9fa277bce245660789ad311b61d092292c67209f7521ad948e2edf` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

### File 5 — Statistical Analysis Plan

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md` |
| Protocol version | DRA-VAL-001D v1.0 |
| Byte size | 11,971 |
| SHA-256 digest | `f4d7b85bf4b9ee87132d204a8a0f40535a11a416451037b234e130259e21c113` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

### File 6 — Threats to Validity Register

| Field | Value |
|-------|-------|
| Canonical path | `docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md` |
| Protocol version | DRA-VAL-001E v1.0 |
| Byte size | 13,888 |
| SHA-256 digest | `98d02e74fd0503a957d7ff669422e52e12cf8641b532515a4a30ce92c55fcfd3` |
| Registration timestamp | 2026-07-27T12:00:00 |
| Status | REGISTERED |
| Integrity verification | PASS |

---

## 4. Aggregate Protocol-Package Digest

The aggregate digest is computed deterministically as:

```
SHA-256( JSON.stringify( canonically-ordered [{path, digest}] ) )
```

where the array is sorted lexicographically by `path`.

**Input (canonical JSON):**

```json
[{"path":"docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md","digest":"97fb718144272d155f269c92d48087f8d427f91c1d30104d52736bd00a0f550a"},{"path":"docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md","digest":"401b7900ef0c4e881051abdf511dc50092fcd0a41bf0907c0da79b64f680356e"},{"path":"docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md","digest":"67b2e1d9d7d8a8f2fb4ae691dfc671b812ef62fa1cda15b50d6823207d00d83c"},{"path":"docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md","digest":"fe4b2d494d9fa277bce245660789ad311b61d092292c67209f7521ad948e2edf"},{"path":"docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md","digest":"f4d7b85bf4b9ee87132d204a8a0f40535a11a416451037b234e130259e21c113"},{"path":"docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md","digest":"98d02e74fd0503a957d7ff669422e52e12cf8641b532515a4a30ce92c55fcfd3"}]
```

**Aggregate protocol-package digest:**

```
100c2daa4447db45061132a2f17c3993acbbc472c6ffd13368d9f201201831bd
```

This digest is recorded in all corpus manifests as `protocolPackageDigest` and is verified by `computeProtocolPackageDigest()` in `src/benchmark/validation/corpus-manifest.ts`.

---

## 5. Registration Attestations

The following attestations are made as conditions of registration. Each must be true. Any false attestation invalidates this registration record.

| # | Attestation | Status |
|---|-------------|--------|
| ATT-1 | No scientific benchmark results were inspected before protocol registration | **TRUE** |
| ATT-2 | No evaluator outputs were used to construct any protocol document | **TRUE** |
| ATT-3 | No protocol document is missing from this registration | **TRUE** — all 6 documents registered |
| ATT-4 | All per-file integrity digests have been verified | **TRUE** — all 6 PASS |
| ATT-5 | The aggregate protocol-package digest is correct | **TRUE** — verified by computation |
| ATT-6 | Amendment rules are now active | **TRUE** — from registration timestamp |
| ATT-7 | The frozen evaluator identifier is recorded | **TRUE** — DRA-EV-001 v1.0 (frozen, not modified) |
| ATT-8 | The DRA-001-07 engineering fixtures are separate from the scientific corpus | **TRUE** — engineering fixtures are not admitted to the scientific corpus |

---

## 6. Frozen Evaluator Identifier

The evaluator whose outputs will be assessed during scientific validation is:

| Field | Value |
|-------|-------|
| Identifier | DRA-EV-001 v1.0 |
| Status | FROZEN |
| Freeze milestone | DRA-ENG-002 through DRA-ENG-010 |
| Evaluator entry point | `src/pipeline/evaluate-document.ts` |
| Decision engine | `src/pipeline/derive-decision.ts` |
| Proof receipt version | `ProofReceipt` as defined in `src/model/` |
| Engineering validation | DRA-001-07 (6 documents, 12 simulated reviewer submissions) |

The evaluator semantics must not be modified during the scientific validation programme (DRA-VAL-001A through DRA-VAL-001H). Any proposed modification requires a formal programme amendment.

---

## 7. Amendment Rules (Now Active)

From the registration timestamp, the following amendment rules are in force:

1. **Protocol amendments must be pre-registered** before any result is produced that they would affect.
2. **Retrospective amendments are prohibited** — no amendment may alter the interpretation of results that have already been produced.
3. **Matching-rule amendments** must be pre-registered before any document results are unsealed.
4. **Statistical-plan amendments** must be pre-registered before any metric is computed.
5. **Corpus amendments** (additions, withdrawals, replacements) must be documented in the acquisition register with full provenance.
6. **All amendments must be filed in an `AmendmentLog`** using the `ProtocolAmendment` schema in `src/benchmark/validation/amendment.ts`.

---

## 8. Next Steps Authorised by This Registration

1. **DRA-VAL-001B: Corpus Acquisition and Freeze** — in progress. Pilot corpus (DRA-VAL-PILOT-001-PARTIAL) being assembled.
2. **DRA-VAL-001C: Reviewer Recruitment and Qualification** — not yet started. Prerequisite: pilot corpus admitted.
3. **DRA-VAL-001D: Independent Reviewer Execution** — not yet started. Prerequisite: DRA-VAL-001C complete.

---

## 9. Registration Verification Command

To re-verify the aggregate digest at any time:

```bash
node -e "
const crypto = require('crypto');
const register = [
  { path: 'docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md',  digest: '97fb718144272d155f269c92d48087f8d427f91c1d30104d52736bd00a0f550a' },
  { path: 'docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md',      digest: '401b7900ef0c4e881051abdf511dc50092fcd0a41bf0907c0da79b64f680356e' },
  { path: 'docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md',              digest: '67b2e1d9d7d8a8f2fb4ae691dfc671b812ef62fa1cda15b50d6823207d00d83c' },
  { path: 'docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md',            digest: 'fe4b2d494d9fa277bce245660789ad311b61d092292c67209f7521ad948e2edf' },
  { path: 'docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md',      digest: 'f4d7b85bf4b9ee87132d204a8a0f40535a11a416451037b234e130259e21c113' },
  { path: 'docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md',            digest: '98d02e74fd0503a957d7ff669422e52e12cf8641b532515a4a30ce92c55fcfd3' },
];
const digest = crypto.createHash('sha256').update(JSON.stringify(register), 'utf8').digest('hex');
console.log(digest);
// Expected: 100c2daa4447db45061132a2f17c3993acbbc472c6ffd13368d9f201201831bd
"
```

To re-verify individual file digests:

```bash
sha256sum docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md \
          docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md \
          docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md \
          docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md \
          docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md \
          docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md
```
