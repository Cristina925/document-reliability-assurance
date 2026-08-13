/**
 * DRA-GC-1 — Generalisation Candidate 1 Freeze Manifest
 *
 * Milestone: DRA-GC-1 Freeze Execution (authorised by DRA-ROB-002's
 * READY_FOR_DRA_GC_1_FREEZE verdict).
 *
 * This module is the canonical, machine-verifiable identity record for the
 * frozen DRA-GC-1 generalisation candidate. It is DATA ONLY: it does not
 * alter evaluator behaviour, does not change any pipeline stage, and is not
 * imported by any production evaluation code path. Its sole purpose is to
 * let a later reader or automated check answer:
 *
 *     "Does the current decision-affecting DRA state still exactly match
 *      the DRA-GC-1 candidate that was frozen?"
 *
 * ---------------------------------------------------------------------------
 * What is frozen, and why these files specifically
 * ---------------------------------------------------------------------------
 *
 * `FROZEN_CORE_EVALUATOR_FILES` — the always-executed evaluation pipeline.
 * Every one of these modules runs on every call to `evaluateDocument` and
 * therefore can change a document's decision outcome: canonical data model
 * and version constants (`model/`), Stage 1-2 input normalisation
 * (`normalisation/`), Stage 3 authority resolution, Stage 4 evidence
 * linkage, Stage 5 materiality assessment, the pipeline orchestration/
 * proof-receipt construction/canonical serialisation (`pipeline/`), and
 * shared identifier utilities used throughout.
 *
 * `FROZEN_ACQUISITION_REPRESENTATION_FILES` — acquisition-side logic that
 * determines what text/representation reaches the evaluator for a given
 * source document, and therefore is equally decision-affecting even though
 * it runs before `evaluateDocument`: text normalisation, media-type
 * detection (including the ENG-011 PDF fallback), multi-column layout
 * reconstruction (ENG-024/025), the PDF layout prober, currentness
 * assessment and its integrity binding (ENG-020/021/022), the acquisition
 * freeze-record construction itself, and representation-integrity/
 * -provenance capture (ENG-017).
 *
 * Deliberately EXCLUDED as non-decision-affecting for this candidate
 * (see DRA-GC-1-FREEZE-SPECIFICATION.md Section 2 and the freeze-readiness
 * review for the full three-way classification): corpus governance/
 * admission workflow (`benchmark/governance/*`, `benchmark/acquisition/
 * eligibility.ts`, `licence.ts`, `provenance.ts`, `metadata.ts`,
 * `manifest-integration.ts`, `integrity.ts`, `trust-properties.ts`,
 * `schema.ts`, `request.ts`, `pipeline.ts`, `governed-pipeline.ts`,
 * `candidate-registry.ts`, `corpus-validator.ts`, `reports.ts`) — these
 * determine whether/how a document is ADMITTED to the corpus, not how an
 * already-acquired document's content is EVALUATED, and do not run again
 * for a blind DRA-GEN-001 document; network fetching mechanics
 * (`fetcher.ts`, `http-fetcher.ts`) — fetching bytes over the network is
 * infrastructure, not evaluation logic; the ENG-018 graphical-semantic-risk
 * analysis engine, which DRA-ENG-018's own closure record describes as
 * "decoupled from the frozen pipeline (no version bump)" and which does not
 * feed into `evaluateDocument`'s decision; all `__tests__/` and `fixtures/`
 * content anywhere in the tree (test-only, never executed in production);
 * and all `benchmark/corpus/`, `benchmark/evidence/`, `benchmark/execution/`
 * modules, which are benchmark-programme tooling around the evaluator, not
 * part of the evaluator itself.
 *
 * ---------------------------------------------------------------------------
 * Aggregate digest computation (deterministic canonicalisation)
 * ---------------------------------------------------------------------------
 *
 * 1. Build `manifestCore`:
 *      {
 *        candidateId: "DRA-GC-1",
 *        evaluatorVersion: DRA_EVALUATOR_VERSION,
 *        pipelineVersion: DRA_PIPELINE_VERSION,
 *        modelVersion: DRA_MODEL_VERSION,
 *        corpusVersion: INITIAL_CORPUS_VERSION,
 *        frozenFileDigests: { "<path>": "<sha256-hex>", ... } — every path is
 *          relative to lib/dra-reference/src/, using forward slashes, and
 *          object keys are inserted/read in lexicographic sort order.
 *      }
 * 2. Canonicalise recursively: object keys are sorted at every nesting
 *    level, primitives are JSON-encoded as-is, and the result contains no
 *    extraneous whitespace (a plain recursive sorted-key JSON.stringify,
 *    matching the canonicalisation convention already used by
 *    `pipeline/canonical-serialise.ts` for proof-receipt digests).
 * 3. `aggregateDigest = SHA-256(canonicalisedManifestCoreString)`, hex-encoded.
 *
 * Each individual file digest is `SHA-256(rawFileBytesAsCommittedToGit)`,
 * hex-encoded, computed with no normalisation of line endings or encoding —
 * an intentional stricter check than the evaluator's own text normalisation,
 * because this manifest is about detecting ANY byte-level change to the
 * frozen source, not about evaluating document content.
 *
 * The verification test for this module
 * (`__tests__/dra-gc-1-freeze-integrity.test.ts`) recomputes both the
 * per-file digests and the aggregate digest from the live repository state
 * and asserts equality against the values recorded here. A change to any
 * frozen file — including a single-character change — changes its digest,
 * changes the aggregate digest, and fails that test.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Frozen candidate identity
// ---------------------------------------------------------------------------

export const GC1_CANDIDATE_ID = "DRA-GC-1" as const;

export const GC1_FREEZE_TIMESTAMP = "2026-08-12T00:00:00.000Z" as const;

/**
 * Repository commit identifier for the state DRA-ROB-002 reviewed and this
 * freeze is executed against. Recorded here as the exact `git rev-parse
 * HEAD` output captured at freeze time; not fabricated or assumed.
 */
export const GC1_REPOSITORY_COMMIT = "21e0e6a11452754a7aa258d799226553f3cb1d38" as const;

// ---------------------------------------------------------------------------
// Frozen version identifiers (referenced, not redefined — see the live
// constants in model/versions.ts and benchmark/governance/version.ts; the
// integrity test asserts these copies match those live values so the
// manifest can never silently drift from the actual constants it freezes).
// ---------------------------------------------------------------------------

export const GC1_EVALUATOR_VERSION = "0.1.2" as const;
export const GC1_PIPELINE_VERSION = "1.0" as const;
export const GC1_MODEL_VERSION = "0.1.0" as const;
export const GC1_CORPUS_VERSION = "DRA-CORPUS-1.0.0" as const;

// ---------------------------------------------------------------------------
// Frozen decision-affecting file sets (paths relative to lib/dra-reference/src)
// ---------------------------------------------------------------------------

/** Always-executed core evaluator pipeline (Stages 1-7 + shared model/utilities). */
export const FROZEN_CORE_EVALUATOR_FILES: readonly string[] = [
  "authority-resolution/attribution-patterns.ts",
  "authority-resolution/authority-classification.ts",
  "authority-resolution/authority-record.ts",
  "authority-resolution/authority-span-validation.ts",
  "authority-resolution/index.ts",
  "authority-resolution/record-identifiers.ts",
  "authority-resolution/resolution-result.ts",
  "authority-resolution/resolve-authority.ts",
  "evidence-linkage/evidence-classification.ts",
  "evidence-linkage/evidence-record.ts",
  "evidence-linkage/evidence-span-validation.ts",
  "evidence-linkage/index.ts",
  "evidence-linkage/linkage-result.ts",
  "evidence-linkage/linkage-rules.ts",
  "evidence-linkage/link-evidence.ts",
  "evidence-linkage/record-identifiers.ts",
  "evidence-linkage/semantic-paraphrase.ts",
  "materiality-assessment/assess-materiality.ts",
  "materiality-assessment/index.ts",
  "materiality-assessment/materiality-classification.ts",
  "materiality-assessment/materiality-record.ts",
  "materiality-assessment/materiality-result.ts",
  "materiality-assessment/materiality-rules.ts",
  "materiality-assessment/record-identifiers.ts",
  "materiality-assessment/structural-analysis.ts",
  "model/decisions.ts",
  "model/documents.ts",
  "model/evaluation.ts",
  "model/evidence.ts",
  "model/identifiers.ts",
  "model/index.ts",
  "model/invariants.ts",
  "model/issue-classes.ts",
  "model/issues.ts",
  "model/pipeline-stages.ts",
  "model/proof-receipts.ts",
  "model/statements.ts",
  "model/validation-errors.ts",
  "model/versions.ts",
  "normalisation/index.ts",
  "normalisation/normalise-documents.ts",
  "normalisation/normalise-evaluation-request.ts",
  "normalisation/normalise-evidence.ts",
  "normalisation/normalise-statements.ts",
  "normalisation/normalise-strings.ts",
  "normalisation/stage1-types.ts",
  "pipeline/build-proof-receipt.ts",
  "pipeline/canonical-serialise.ts",
  "pipeline/derive-decision.ts",
  "pipeline/evaluate-document.ts",
  "pipeline/evaluation-result.ts",
  "pipeline/index.ts",
  "shared/identifier-utils.ts",
  "shared/index.ts",
] as const;

/** Acquisition-side logic that determines the representation an admitted document presents to the evaluator. */
export const FROZEN_ACQUISITION_REPRESENTATION_FILES: readonly string[] = [
  "benchmark/acquisition/normalisation.ts",
  "benchmark/acquisition/media-type-detection.ts",
  "benchmark/acquisition/column-layout-reconstruction.ts",
  "benchmark/acquisition/pdf-layout-prober.ts",
  "benchmark/acquisition/currentness.ts",
  "benchmark/acquisition/currentness-integrity.ts",
  "benchmark/acquisition/freeze.ts",
  "benchmark/acquisition/representation-integrity.ts",
  "benchmark/acquisition/representation-provenance.ts",
] as const;

export const FROZEN_DECISION_AFFECTING_FILES: readonly string[] = [
  ...FROZEN_CORE_EVALUATOR_FILES,
  ...FROZEN_ACQUISITION_REPRESENTATION_FILES,
].sort();

/**
 * Categories explicitly NOT part of the frozen decision-affecting manifest,
 * recorded here (rather than left implicit) so a future reader can see the
 * classification boundary was deliberate. See the module doc comment above
 * for the reasoning behind each category.
 */
export const NON_FROZEN_CATEGORIES = {
  CORPUS_GOVERNANCE_AND_ADMISSION_WORKFLOW: [
    "benchmark/governance/**",
    "benchmark/acquisition/eligibility.ts",
    "benchmark/acquisition/licence.ts",
    "benchmark/acquisition/provenance.ts",
    "benchmark/acquisition/metadata.ts",
    "benchmark/acquisition/manifest-integration.ts",
    "benchmark/acquisition/integrity.ts",
    "benchmark/acquisition/trust-properties.ts",
    "benchmark/acquisition/schema.ts",
    "benchmark/acquisition/request.ts",
    "benchmark/acquisition/pipeline.ts",
    "benchmark/acquisition/governed-pipeline.ts",
    "benchmark/acquisition/candidate-registry.ts",
    "benchmark/acquisition/corpus-validator.ts",
    "benchmark/acquisition/reports.ts",
  ],
  NETWORK_FETCHING_INFRASTRUCTURE: [
    "benchmark/acquisition/fetcher.ts",
    "benchmark/acquisition/http-fetcher.ts",
  ],
  DECOUPLED_ANALYSIS_ENGINES: [
    "benchmark/acquisition/graphical-semantic-risk.ts",
  ],
  BENCHMARK_PROGRAMME_TOOLING: [
    "benchmark/corpus/**",
    "benchmark/evidence/**",
    "benchmark/execution/**",
    "benchmark/analysis/**",
  ],
  TEST_AND_FIXTURE_CONTENT: ["**/__tests__/**", "**/fixtures/**"],
} as const;

// ---------------------------------------------------------------------------
// Frozen per-file SHA-256 digests (of raw file bytes, relative to
// lib/dra-reference/src/), recorded at freeze time.
// ---------------------------------------------------------------------------

export const FROZEN_FILE_DIGESTS: Readonly<Record<string, string>> = {
  "authority-resolution/attribution-patterns.ts":
    "4b59757ecf8bbcbc7394c18a4eb388996d34652b17e00ce40cd76be80ed62ba4",
  "authority-resolution/authority-classification.ts":
    "dd38a16c765ea65f9b8e5a53ecdcbc2c95a15d3bfba36d66b1d822203258f211",
  "authority-resolution/authority-record.ts":
    "912204edd72704221dee061c855fe5c91933a25b9693dbab113c8c76c8471f1b",
  "authority-resolution/authority-span-validation.ts":
    "4417d51e4e85074ce57db7c88fc20f77e89389b31bb86e19e79ec712da8ecbde",
  "authority-resolution/index.ts":
    "183a0e972145763b8c27fbfc389d2571a257ee9599898d11c426721951540173",
  "authority-resolution/record-identifiers.ts":
    "c3e8e0faf7924455440f7b75d4f638223cea29d97cd6c5a6376ce0ac69847356",
  "authority-resolution/resolution-result.ts":
    "9ba3093a500744cbb53dd8459cd3001e607323acc61affbb18e43897be22dd7e",
  "authority-resolution/resolve-authority.ts":
    "eb4efe9855f8c2c4a360f57741b745df70a10085273d2b605001c6c591a6ad83",
  "evidence-linkage/evidence-classification.ts":
    "097263aa378fa80106ea2eeb0d18d96643004ea83f9b35fffccb776e08afd7df",
  "evidence-linkage/evidence-record.ts":
    "8c757dbaa616ba692c0c6288f23a7d08e612deed1e8362a772e92c19acdcf602",
  "evidence-linkage/evidence-span-validation.ts":
    "48271d1428592b4bed5fe0c054b0d4dbc3df43f527aab83704eaa6c00b03f937",
  "evidence-linkage/index.ts":
    "b24921f6d245db4f4adb00511c813309c14f2d4b0c0752fa9b424f9b0ab4311b",
  "evidence-linkage/linkage-result.ts":
    "98dc07e7996eca61b5006cb5bf99cc498ae7d6b68deb417ddc0bb70351763513",
  "evidence-linkage/linkage-rules.ts":
    "59671199a17a10025d01d2484e6eaf695c0618a288368d5c4b7622eea6df396c",
  "evidence-linkage/link-evidence.ts":
    "9f596c77f9899052010a4b62389c44c8321db6c65bc7fde00423d85acdabaf59",
  "evidence-linkage/record-identifiers.ts":
    "09b3f2d730aa9f7a489421903bcb253ffff988e9bed9cf6567d43e281c2a7e64",
  "evidence-linkage/semantic-paraphrase.ts":
    "1cedf9f9c75f5748bd0744bc1fc0836decc3f6c6a24e6d6f1bc1949ba992362e",
  "materiality-assessment/assess-materiality.ts":
    "658f3dc9db5129f1e126c0567548e6c7d176c1f069eb51280bf1b3d3e8522260",
  "materiality-assessment/index.ts":
    "a1796695f97d3cea34b1dede89b11939fc34274df9881d9959a33a2a3f98370c",
  "materiality-assessment/materiality-classification.ts":
    "b6619d4574e2db3413011a9ba1e0a122700d7e52a89425984d715d681b7a5151",
  "materiality-assessment/materiality-record.ts":
    "68927ca8de5804a281df0c022c70a766a6bfe936231b6d6a562190d44bb7757c",
  "materiality-assessment/materiality-result.ts":
    "45600ac6e69803d112f0177946675b399c261dec41e2919d7ae710de27b2c748",
  "materiality-assessment/materiality-rules.ts":
    "56308531ae116295d62b00946a49934680d05a3b4b03a3dfd95128ec1acc5140",
  "materiality-assessment/record-identifiers.ts":
    "dd70e04af7baf0c05aa757793edb87c830433b9473185950ff738c4c698e6f39",
  "materiality-assessment/structural-analysis.ts":
    "b07875160ecb539f5b1c200ce8c270b010b11623935376742552825d5d18cf56",
  "model/decisions.ts":
    "5056164c6b39440a071a01495d2989ba2152210ba822184f7393a2c4059e9d4a",
  "model/documents.ts":
    "935e6cb8aa2443536062e44a3d289de48885e8ef316a7d78d12c8c7020d3767c",
  "model/evaluation.ts":
    "9c4973b2ef8c81ee1d7aeab00358fe9b92eceb2668ee136a7e8c093810d08136",
  "model/evidence.ts":
    "787089e84a13cd9f7ea9c779c351ef59afb5f67f661cc7fa6b9efad6034f3b8d",
  "model/identifiers.ts":
    "eeab489d4724588f1119ac6777d31e75fae49698fd6bb6e53d659790b7211eb8",
  "model/index.ts":
    "317aee765510114b4cc17d526fbf3477507ecb9babd13f2e365594641a7ea71c",
  "model/invariants.ts":
    "cf5e2db0ebc8ef02e917fe7b61e277d7c1329bd0c6f1facf3c80f7d221d92389",
  "model/issue-classes.ts":
    "9d5cd8152212ae1479f63409baf0335e95f118567e5b75b1b4d4c51091647744",
  "model/issues.ts":
    "d08b9ced1e6495de5df412976ffe1aa0b685d3215ab164708e02b5124ec52cd2",
  "model/pipeline-stages.ts":
    "6a09ade641641e15fcfe14f8de733cc38e7b61abcf3647285b151e50f444c1da",
  "model/proof-receipts.ts":
    "c9c1e1f8717e9bc43da83841ff8c5561a839a8955bc5e65cc6ec7b6d3c3fb893",
  "model/statements.ts":
    "d1794c1cf6a319e7206742106698a9f0d830b268060ae7951b3351048ef97329",
  "model/validation-errors.ts":
    "58913dc0117d0700924c045a1debafb6a33265213bb9dbb3ca514063ee01a361",
  "model/versions.ts":
    "efb752cd064a5d3e3776f5f8b1b031c4ce1b7122ab3db8a2edba96e7442a2144",
  "normalisation/index.ts":
    "072802033267c046eaee65172c2d22414ec2dc998de2505453fa3137e4f7bf92",
  "normalisation/normalise-documents.ts":
    "a357f9cf8f131cfd2fe4023443a1fe7ed200f1195641a83a319eb83f21c63b23",
  "normalisation/normalise-evaluation-request.ts":
    "8101222aa470721d814e1009842505c3e6c88a7a73c10d05b05a8ccf237eca7b",
  "normalisation/normalise-evidence.ts":
    "6894128c7329bc0af11e087183696cc35c46f62cd07c0560abad2f02ba707144",
  "normalisation/normalise-statements.ts":
    "7042def464782deb38a5ae8dd4e341895feb7fc9104b386d7743956781276887",
  "normalisation/normalise-strings.ts":
    "129970baa8c6468c8cc612371b7c2f729b336ea3e1c12d139f5566c49a442729",
  "normalisation/stage1-types.ts":
    "8de28fd040cdc907d9d98079f27ad2a186ee7f631c698d034a09ce9c552f10b1",
  "pipeline/build-proof-receipt.ts":
    "17ea15612b4b267a6966eeaa4d2126f2926583ef73696a644d8e7a209f645646",
  "pipeline/canonical-serialise.ts":
    "d776d9b371f18ba6fc7e06a68e86dfb7b7ea89fb6e93d294356aac3d4703f3d0",
  "pipeline/derive-decision.ts":
    "a0b8acb8b34a8581e4d0f699bdff2a92d5420812b648f33fceb551fe7fac9b3d",
  "pipeline/evaluate-document.ts":
    "cc67fb8e1b257726fba44bce8dfd0cfffc1787f722db3c73856a5c4fe019bafa",
  "pipeline/evaluation-result.ts":
    "6fef1713fee9492ea690e1fd5e7abd5408057fa1486a6e46125b57eca6f5cc12",
  "pipeline/index.ts":
    "7f3fe56d62ea6ec3a692470a388db48198009f7916cab7267b1d850ef14bff2e",
  "shared/identifier-utils.ts":
    "62486f95c206f0930d7f5b020595176db5754666941ec8e3a66ebc2c125615fb",
  "shared/index.ts":
    "49f021f837a4a6046ded66815927e8985d2200831ce2be1396dab68bd784c67c",
  "benchmark/acquisition/normalisation.ts":
    "89a0dc697161d79cedc2d67f847ac914c33823445db57e1f09b9baceba2058d7",
  "benchmark/acquisition/media-type-detection.ts":
    "03553ebd1a88b5428745fc4d7b201739811b210e5e2e73391fe17e694b39a2b2",
  "benchmark/acquisition/column-layout-reconstruction.ts":
    "a6cf6f0f40bec5f34e59087106aa353d81334f9bcab2dab1a027df54bf0f6912",
  "benchmark/acquisition/pdf-layout-prober.ts":
    "e141714e79a423254437751a30149c23046e1dd0438426aa4bf7693129208e78",
  "benchmark/acquisition/currentness.ts":
    "f3e89c37d90636bef61697b1c4c8d9e01de16abdbf8ea3aa58fb5d242879fc61",
  "benchmark/acquisition/currentness-integrity.ts":
    "a05451e7d4599459d51c0ed251a0e42244ea90b2cc18b5434d4338ee795fc7d5",
  "benchmark/acquisition/freeze.ts":
    "25accfd9b106f2b922133d9169f0867b22293f43a95d60277de75f3f6cfb1c44",
  "benchmark/acquisition/representation-integrity.ts":
    "bb280be9dc3b4978ac59418899bb86ea5f6b89c23c9e665d8e0dc7e3a5a1a5d3",
  "benchmark/acquisition/representation-provenance.ts":
    "4d84998612b52209be867db0dfb297f900642268565e3fdb00491d848d2505da",
};

// ---------------------------------------------------------------------------
// Deterministic canonicalisation and aggregate digest
// ---------------------------------------------------------------------------

/**
 * Canonicalises a JSON-compatible value into a stable string: object keys
 * are sorted (recursively) at every nesting level, arrays preserve order,
 * and no extraneous whitespace is emitted. Mirrors the canonicalisation
 * discipline already used by `pipeline/canonical-serialise.ts`.
 */
export function canonicalizeForDigest(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalizeForDigest).join(",") + "]";
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + canonicalizeForDigest(record[k]))
      .join(",") +
    "}"
  );
}

/** Builds the canonical manifest-core object whose digest is `GC1_AGGREGATE_DIGEST`. */
export function buildManifestCore(): {
  readonly candidateId: string;
  readonly evaluatorVersion: string;
  readonly pipelineVersion: string;
  readonly modelVersion: string;
  readonly corpusVersion: string;
  readonly frozenFileDigests: Readonly<Record<string, string>>;
} {
  return {
    candidateId: GC1_CANDIDATE_ID,
    evaluatorVersion: GC1_EVALUATOR_VERSION,
    pipelineVersion: GC1_PIPELINE_VERSION,
    modelVersion: GC1_MODEL_VERSION,
    corpusVersion: GC1_CORPUS_VERSION,
    frozenFileDigests: FROZEN_FILE_DIGESTS,
  };
}

/** Computes SHA-256(canonicalizeForDigest(buildManifestCore())), hex-encoded. */
export function computeAggregateDigest(): string {
  return createHash("sha256")
    .update(canonicalizeForDigest(buildManifestCore()))
    .digest("hex");
}

/**
 * The aggregate digest recorded at freeze time. Any change to a frozen
 * file's bytes, or to any of the version identifiers above, changes this
 * value when recomputed by `computeAggregateDigest()`.
 */
export const GC1_AGGREGATE_DIGEST =
  "77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b" as const;

// ---------------------------------------------------------------------------
// Live re-hash utility (used by the freeze-integrity test; not used by any
// production evaluation code path)
// ---------------------------------------------------------------------------

const SRC_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Reads and re-hashes every frozen file from the live repository (SHA-256 of raw bytes). */
export function computeLiveFileDigests(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const relativePath of FROZEN_DECISION_AFFECTING_FILES) {
    const bytes = readFileSync(join(SRC_ROOT, relativePath));
    result[relativePath] = createHash("sha256").update(bytes).digest("hex");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Referenced evidence and accepted limitations (pointers, not restatements)
// ---------------------------------------------------------------------------

export const GC1_ROB002_REFERENCE =
  "docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md" as const;

export const GC1_FREEZE_SPECIFICATION_REFERENCE =
  "docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md" as const;

export const GC1_KNOWN_DEFECT_LEDGER_REFERENCE =
  "lib/dra-reference/src/benchmark/analysis/dra-rob-002-freeze-readiness-ledger.ts (KNOWN_DEFECT_LEDGER, 10 entries, 0 FREEZE_BLOCKER)" as const;

/**
 * Corpus/development-state reference: the 33 admitted documents that formed
 * the ROB-002-reviewed development/robustness evidence base for this
 * candidate. DRA-DOC-0033 remains unadmitted (external eLegalix block,
 * ledger entry D10) and is excluded from this reference set, not silently
 * assumed present.
 */
export const GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS: readonly string[] = [
  ...Array.from({ length: 32 }, (_, i) =>
    `DRA-DOC-${String(i + 1).padStart(4, "0")}`,
  ),
  "DRA-DOC-0034",
] as const;

/** DRA-DOC-0033 is explicitly excluded: not admitted, not evaluated, not part of GC-1. */
export const GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID = "DRA-DOC-0033" as const;
