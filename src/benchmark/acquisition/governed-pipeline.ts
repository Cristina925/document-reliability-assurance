/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: governed-pipeline.ts — Main orchestration
 *
 * Provides two public entry points:
 *
 *   acquireFreezeAndEvaluate()
 *     Full pipeline: fetch → normalise → freeze → corpus-integrate → evaluate.
 *     Never throws for expected failures; failed runs do not mutate the registry.
 *     Returns a discriminated union {ok:true,...} | {ok:false,...}.
 *
 *   evaluateFrozenBenchmarkDocument()
 *     Re-evaluation path: verifies all digests against a known freeze record,
 *     then evaluates via the existing DRA evaluator. Rejects tampered inputs.
 *
 * Naming: this module is governed-pipeline.ts because pipeline.ts already
 * exists in this directory with its own exports and test suite.
 *
 * Reuses:
 *   - evaluateDocument() from pipeline/evaluate-document.ts (never reimplemented)
 *   - buildContentPayload() from governance/eligibility.ts
 *   - verifyManifestIntegrity() from corpus/integrity.ts
 *   - All integrity, freeze, eligibility, and manifest-integration modules.
 */

import { evaluateDocument } from "../../pipeline/evaluate-document.js";
import type { DocumentAssuranceEvaluation } from "../../pipeline/evaluation-result.js";
import { verifyManifestIntegrity } from "../corpus/integrity.js";
import type { CorpusManifest } from "../corpus/manifest.js";
import type { CorpusRegistry } from "../corpus/registry.js";
import type { BenchmarkSelectionProtocol } from "../governance/schema.js";
import { computeSourceDigest, verifySourceDigest, verifyTextDigest, computeApprovedMetadataDigest } from "./integrity.js";
import { normaliseContent, type PdfExtractor } from "./normalisation.js";
import { checkFreezeEligibility } from "./eligibility.js";
import { createAcquisitionFreezeRecord, verifyAcquisitionFreezeRecordDigest, verifyAcquisitionCurrentnessIntegrity, type AcquisitionFreezeRecord } from "./freeze.js";
import { integrateWithCorpus } from "./manifest-integration.js";
import type { AcquisitionRequest, OfficialSourceAssessment, AcquisitionPipelineError, AcquisitionPipelineStage } from "./schema.js";
import type { LicenceAssessment } from "./licence.js";
import type { ApprovedMetadata } from "./metadata.js";
import type { SourceFetcher } from "./fetcher.js";
import { assessRepresentationProvenance, type PdfRepresentationProber, type RepresentationAssessment } from "./representation-provenance.js";
import { assessGraphicalSemanticRisk, type PdfImageRegionProbe, type GraphicalSemanticRiskAssessment } from "./graphical-semantic-risk.js";
import type { CurrentnessAssessment } from "./currentness.js";

// ---------------------------------------------------------------------------
// BenchmarkProofReference
// ---------------------------------------------------------------------------

/**
 * A tamper-evident linkage between a DRA proof receipt and the exact frozen
 * document that was evaluated.
 *
 * Contains every digest needed to verify that the proof receipt was produced
 * from the correct, unmodified frozen document.
 */
export interface BenchmarkProofReference {
  /** Per-document freeze record identifier. Format: DRA-FRZ-NNNNNN. */
  readonly freezeRecordId: string;
  /** Corpus document identifier. Format: DRA-DOC-NNNN. */
  readonly corpusDocumentId: string;
  /** SHA-256 of the raw source bytes at freeze time. */
  readonly sourceDigest: string;
  /** SHA-256 of the normalised text at freeze time. */
  readonly normalisedTextDigest: string;
  /** SHA-256 of the approved metadata at freeze time. */
  readonly metadataDigest: string;
  /** Substantive digest of the entire freeze record. */
  readonly freezeRecordDigest: string;
  /** Substantive digest of the DRA proof receipt. */
  readonly proofReceiptSubstantiveDigest: string;
  /** ISO-8601 timestamp of the evaluation. */
  readonly evaluationTimestamp: string;
  /**
   * DRA-ENG-021 — SHA-256 digest cryptographically binding this document's
   * currentnessAssessment (if any) to this specific freeze record. Pure
   * pass-through of freezeRecord.currentnessAssertionDigest — never
   * recomputed here. Absent when no currentnessAssessment was ever supplied.
   * See currentness-integrity.ts for the binding rules and rationale.
   */
  readonly currentnessAssertionDigest?: string;
  /**
   * DRA-ENG-022 — pure pass-through of freezeRecord.freezeIntegritySchemaVersion.
   * Present iff the freeze record was created under the post-cutover ("V2")
   * integrity regime. Absent for freeze records created under the legacy
   * regime (including documents 1-31). Never recomputed here.
   */
  readonly freezeIntegritySchemaVersion?: string;
}

// ---------------------------------------------------------------------------
// BenchmarkDocumentResult
// ---------------------------------------------------------------------------

/**
 * The complete result of a governed acquisition-and-evaluation run.
 */
export interface BenchmarkDocumentResult {
  /** The immutable per-document freeze record. */
  readonly freeze: AcquisitionFreezeRecord;
  /** The updated corpus manifest after integration. */
  readonly manifest: CorpusManifest;
  /** SHA-256 of the updated corpus manifest. */
  readonly manifestDigest: string;
  /** Tamper-evident linkage between the proof receipt and the frozen document. */
  readonly proofReference: BenchmarkProofReference;
  /** The DRA evaluator decision for this document. */
  readonly decision: string;
  /** Raw DRA evaluation result (ok:true or ok:false). */
  readonly evaluationResult: DocumentAssuranceEvaluation;
  /**
   * DRA-ENG-020 — explicit, top-level currentness/supersession signal for
   * this document, pulled directly (pure pass-through, no re-derivation)
   * from the freeze record's currentnessAssessment. Absent when no
   * currentness assessment was ever supplied for this document (never
   * silently defaulted to CONFIRMED_CURRENT or any other status). This is
   * the machine-readable surface a downstream consumer should read; it does
   * not affect `decision` or `evaluationResult.issues` and carries no
   * publisher-specific logic — see currentness.ts.
   */
  readonly currentnessAssessment?: CurrentnessAssessment;
}

// ---------------------------------------------------------------------------
// AcquisitionDependencies
// ---------------------------------------------------------------------------

/**
 * Injectable dependencies for the governed acquisition pipeline.
 *
 * All dependencies are provided by the caller so that tests can inject
 * deterministic mocks without live network or clock access.
 */
export interface AcquisitionDependencies {
  /** Injectable source fetcher (use createMockFetcher() in tests). */
  readonly fetcher: SourceFetcher;
  /** Injectable PDF text extractor. Required for application/pdf sources. */
  readonly pdfExtractor?: PdfExtractor;
  /**
   * DRA-ENG-017 — injectable PDF representation-provenance prober. Optional:
   * when absent, PDF sources are assessed as provenance UNKNOWN (explicit
   * uncertainty) rather than silently skipped or guessed.
   */
  readonly pdfRepresentationProber?: PdfRepresentationProber;
  /**
   * DRA-ENG-018 — injectable PDF image-region probe. Optional: when absent,
   * PDF sources are assessed as GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE
   * (explicit uncertainty) rather than silently skipped or assumed risk-free.
   */
  readonly pdfImageRegionProbe?: PdfImageRegionProbe;
  /** The active corpus registry. Never mutated on pipeline failure. */
  readonly registry: CorpusRegistry;
  /** The active benchmark selection protocol (governs corpus eligibility). */
  readonly protocol: BenchmarkSelectionProtocol;
  /** Fixed timestamp for deterministic test replay. */
  readonly fixedTimestamp?: string;
}

// ---------------------------------------------------------------------------
// AcquireFreezeAndEvaluateInput
// ---------------------------------------------------------------------------

export interface AcquireFreezeAndEvaluateInput {
  /** Validated acquisition request (from createAcquisitionRequest). */
  readonly request: AcquisitionRequest;
  /** Human-provided official-source assessment. */
  readonly officialSourceAssessment: OfficialSourceAssessment;
  /** Human-provided licence assessment. */
  readonly licenceAssessment: LicenceAssessment;
  /** Human-approved corpus metadata. */
  readonly approvedMetadata: ApprovedMetadata;
  /** Target corpus document ID. Format: DRA-DOC-NNNN. */
  readonly corpusDocumentId: string;
  /** Unique freeze record identifier. Format: DRA-FRZ-NNNNNN. */
  readonly freezeRecordId: string;
  /** Identity of the freeze authoriser. */
  readonly frozenBy: string;
  /** Benchmark protocol version at freeze time. */
  readonly benchmarkVersion: string;
  /** Non-empty rationale for corpus inclusion. */
  readonly inclusionRationale: string;
  /**
   * Optional additional source context for the DRA evaluator.
   * When provided, this text is supplied as the evaluator's "source document"
   * alongside the normalised acquisition text. When absent, the acquisition
   * text itself serves as both the generated and source document.
   */
  readonly additionalSourceText?: string;
  /**
   * Optional list of existing normalised corpus texts for near-duplicate detection.
   * When absent, near-duplicate checking is skipped.
   */
  readonly existingCorpusTexts?: readonly string[];
  /**
   * DRA-ENG-020 — optional human-reviewed currentness/supersession
   * assessment for this document. Stored on the freeze record, propagated
   * (unmodified) into the evaluator's requesterMetadata, and surfaced as an
   * explicit top-level field on BenchmarkDocumentResult. Absent by default;
   * never inferred or fabricated by the pipeline itself.
   */
  readonly currentnessAssessment?: CurrentnessAssessment;
}

// ---------------------------------------------------------------------------
// AcquireFreezeAndEvaluateResult
// ---------------------------------------------------------------------------

export type AcquireFreezeAndEvaluateResult =
  | { readonly ok: true; readonly result: BenchmarkDocumentResult }
  | {
      readonly ok: false;
      readonly stage: AcquisitionPipelineStage;
      readonly errors: readonly AcquisitionPipelineError[];
    };

// ---------------------------------------------------------------------------
// Internal: build evaluator request
// ---------------------------------------------------------------------------

function buildEvaluatorRequest(
  corpusDocumentId: string,
  title: string,
  normalisedText: string,
  sourceText: string,
  requestedAt: string,
  evaluationBoundary?: { readonly startOffset: number; readonly endOffset: number },
  representationAssessment?: RepresentationAssessment,
  graphicalSemanticAssessment?: GraphicalSemanticRiskAssessment,
  currentnessAssessment?: CurrentnessAssessment,
): unknown {
  const sourceId = `sdoc-${corpusDocumentId}-src`;
  const req: Record<string, unknown> = {
    id: `eval-${corpusDocumentId}`,
    generatedDocument: {
      id: `gdoc-${corpusDocumentId}`,
      title,
      content: normalisedText,
      sourceDocumentIds: [sourceId],
    },
    sourceDocuments: [
      {
        id: sourceId,
        title: `Source: ${title}`,
        content: sourceText,
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt,
  };
  if (evaluationBoundary !== undefined) {
    req["evaluationBoundary"] = evaluationBoundary;
  }
  if (representationAssessment !== undefined) {
    // DRA-ENG-017 (Part B) — propagate representation provenance/fidelity
    // into the evaluation input via the existing, already-optional
    // requesterMetadata escape hatch on EvaluationRequest. Verified (via
    // Stage 1's normalise-evaluation-request.ts) to survive unmodified into
    // Stage1Success.normalisedRequest.requesterMetadata, and from there into
    // the proof receipt's Stage 1 stage-record output. This does not alter
    // Stage 2-7 semantics, issue classes, or evaluator/pipeline versioning.
    req["requesterMetadata"] = {
      representationProvenance: representationAssessment.provenance,
      representationFidelity: representationAssessment.fidelity,
      representationDetectorVersion: representationAssessment.detectorVersion,
    };
  }
  if (graphicalSemanticAssessment !== undefined) {
    // DRA-ENG-018 (Part J) — propagate graphical-semantic risk via the same
    // requesterMetadata escape hatch as DRA-ENG-017, as a SIBLING field, not
    // merged into representationProvenance/representationFidelity above.
    // Kept as a distinct key so a downstream consumer can read
    // representationFidelity="VERIFIED" and graphicalSemanticRisk=
    // "POTENTIAL_GRAPHICAL_SEMANTIC_LOSS" simultaneously without either
    // overwriting the other. Metadata-only: no evaluator issue class, no
    // Stage 2-7 semantics change, no evaluator/pipeline version bump
    // (Part K, Option 1 — see graphical-semantic-risk.ts module docs).
    const existing = (req["requesterMetadata"] as Record<string, unknown> | undefined) ?? {};
    req["requesterMetadata"] = {
      ...existing,
      graphicalSemanticRisk: graphicalSemanticAssessment.state,
      graphicalSemanticRiskDetectorVersion: graphicalSemanticAssessment.detectorVersion,
    };
  }
  if (currentnessAssessment !== undefined) {
    // DRA-ENG-020 — propagate the currentness/supersession assessment via
    // the same requesterMetadata escape hatch as DRA-ENG-017/018, as a
    // SIBLING field. This is an independent axis from representation
    // fidelity and graphical-semantic risk; none of the three fields
    // overwrite each other. Metadata-only: no issue class, no Stage 2-7
    // semantics change, no evaluator/pipeline version bump. The evidence
    // fields are propagated exactly as supplied by the human reviewer —
    // no document text is read or inspected here.
    const existing = (req["requesterMetadata"] as Record<string, unknown> | undefined) ?? {};
    req["requesterMetadata"] = {
      ...existing,
      currentnessStatus: currentnessAssessment.currentnessStatus,
      ...(currentnessAssessment.relatedDocumentIdentifier !== undefined
        ? { currentnessRelatedDocumentIdentifier: currentnessAssessment.relatedDocumentIdentifier }
        : {}),
      ...(currentnessAssessment.relatedCorpusDocumentId !== undefined
        ? { currentnessRelatedCorpusDocumentId: currentnessAssessment.relatedCorpusDocumentId }
        : {}),
      ...(currentnessAssessment.evidenceUrl !== undefined
        ? { currentnessEvidenceUrl: currentnessAssessment.evidenceUrl }
        : {}),
      ...(currentnessAssessment.evidenceQuote !== undefined
        ? { currentnessEvidenceQuote: currentnessAssessment.evidenceQuote }
        : {}),
      currentnessAssessedBy: currentnessAssessment.assessedBy,
      currentnessAssessedAt: currentnessAssessment.assessedAt,
    };
  }
  return req;
}

// ---------------------------------------------------------------------------
// acquireFreezeAndEvaluate
// ---------------------------------------------------------------------------

/**
 * Full governed acquisition pipeline:
 *   fetch → compute source digest → normalise → freeze eligibility →
 *   create freeze record → integrate with corpus → evaluate via DRA →
 *   return proof reference.
 *
 * Never throws for expected failures. Returns {ok:false,...} for any stage
 * failure. The corpus registry is never mutated if any stage before
 * corpus integration fails.
 *
 * @param input  All human-provided governed inputs.
 * @param deps   Injectable dependencies (fetcher, registry, protocol).
 * @returns      AcquireFreezeAndEvaluateResult.
 */
export async function acquireFreezeAndEvaluate(
  input: AcquireFreezeAndEvaluateInput,
  deps: AcquisitionDependencies,
): Promise<AcquireFreezeAndEvaluateResult> {
  const ts = deps.fixedTimestamp ?? new Date().toISOString();
  const fail = (
    stage: AcquisitionPipelineStage,
    code: string,
    message: string,
    detail?: string,
  ): AcquireFreezeAndEvaluateResult => ({
    ok: false,
    stage,
    errors: [{ code, message, stage, detail }],
  });

  // ── ACQUISITION ──────────────────────────────────────────────────────────
  let fetchResult;
  try {
    fetchResult = await deps.fetcher(input.request, {
      fixedRetrievedAt: deps.fixedTimestamp,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return fail("ACQUISITION", "FETCH_EXCEPTION", `Fetcher threw unexpectedly: ${msg}`);
  }

  if (!fetchResult.ok) {
    return {
      ok: false,
      stage: "ACQUISITION",
      errors: [
        {
          code: fetchResult.code,
          message: fetchResult.message,
          stage: "ACQUISITION",
          detail: fetchResult.detail,
        },
      ],
    };
  }

  const { source } = fetchResult;

  // ── OFFICIAL SOURCE ───────────────────────────────────────────────────────
  if (input.officialSourceAssessment.status !== "VERIFIED") {
    return fail(
      "OFFICIAL_SOURCE",
      "OFFICIAL_SOURCE_NOT_VERIFIED",
      `Official-source assessment status is ${input.officialSourceAssessment.status}; VERIFIED required for freeze`,
    );
  }

  // ── LICENCE ──────────────────────────────────────────────────────────────
  if (input.licenceAssessment.status !== "VERIFIED") {
    return fail(
      "LICENCE",
      "LICENCE_NOT_VERIFIED",
      `Licence assessment status is ${input.licenceAssessment.status}; VERIFIED required for freeze`,
    );
  }

  // ── INTEGRITY — source bytes ──────────────────────────────────────────────
  const sourceDigest = computeSourceDigest(source.rawBytes);

  // ── NORMALISATION ─────────────────────────────────────────────────────────
  const normResult = await normaliseContent(
    source.rawBytes,
    source.mediaType as import("./schema.js").SupportedMediaType,
    sourceDigest,
    deps.pdfExtractor,
  );

  if (!normResult.ok) {
    return fail(
      "NORMALISATION",
      normResult.code,
      normResult.message,
    );
  }

  const { document: normalised } = normResult;

  // ── REPRESENTATION PROVENANCE/FIDELITY (DRA-ENG-017) ─────────────────────
  // Computed once, here, right after normalisation — the earliest point at
  // which both the raw bytes and the extracted text are simultaneously
  // available. Stored on the freeze record (see below) as the single
  // authoritative location; never recomputed or duplicated elsewhere.
  const representationAssessment = await assessRepresentationProvenance(
    source.mediaType,
    source.rawBytes,
    normalised.text,
    deps.pdfRepresentationProber,
  );

  // ── GRAPHICAL-SEMANTIC RISK (DRA-ENG-018) ────────────────────────────────
  // Computed alongside representationAssessment, from the same bytes/text,
  // but as an independent signal — see graphical-semantic-risk.ts for why
  // this is never merged into representationAssessment.
  const graphicalSemanticAssessment = await assessGraphicalSemanticRisk(
    source.mediaType,
    source.rawBytes,
    normalised.text,
    deps.pdfImageRegionProbe,
  );

  // ── INTEGRITY — metadata ──────────────────────────────────────────────────
  const metadataDigest = computeApprovedMetadataDigest(input.approvedMetadata);

  // ── ELIGIBILITY ───────────────────────────────────────────────────────────
  const eligibility = checkFreezeEligibility(
    source,
    normalised,
    input.officialSourceAssessment,
    input.licenceAssessment,
    input.approvedMetadata,
    input.corpusDocumentId,
    input.inclusionRationale,
    deps.registry,
    deps.protocol,
    input.existingCorpusTexts ?? [],
  );

  if (!eligibility.eligible) {
    return {
      ok: false,
      stage: "ELIGIBILITY",
      errors: eligibility.blockingReasons.map((reason) => ({
        code: reason,
        message: `Freeze eligibility check failed: ${reason}`,
        stage: "ELIGIBILITY" as const,
      })),
    };
  }

  // ── FREEZE ────────────────────────────────────────────────────────────────
  // DRA-ENG-022 — this call site is the actual cutover point: every document
  // acquired through the real governed pipeline from this programme forward
  // is created under the post-cutover ("V2") integrity regime. Documents
  // 1-31 were frozen by earlier code that had no such regime concept and
  // are never retroactively reissued; this line does not and cannot affect
  // their already-computed, already-verified digests.
  const freezeRecord = createAcquisitionFreezeRecord({
    freezeRecordId: input.freezeRecordId,
    corpusDocumentId: input.corpusDocumentId,
    acquisitionId: input.request.acquisitionId,
    sourceUrl: input.request.sourceUrl,
    finalUrl: source.finalUrl,
    sourceDigest,
    normalised,
    metadataDigest,
    frozenBy: input.frozenBy,
    benchmarkVersion: input.benchmarkVersion,
    fixedTimestamp: deps.fixedTimestamp,
    representationAssessment,
    graphicalSemanticAssessment,
    currentnessAssessment: input.currentnessAssessment,
    freezeIntegrityRegime: "V2",
  });

  // ── CORPUS INTEGRATION ────────────────────────────────────────────────────
  const integrationResult = integrateWithCorpus(
    freezeRecord,
    input.approvedMetadata,
    deps.registry,
  );

  if (!integrationResult.ok) {
    return {
      ok: false,
      stage: "CORPUS_INTEGRATION",
      errors: [
        {
          code: integrationResult.code,
          message: integrationResult.message,
          stage: "CORPUS_INTEGRATION",
        },
      ],
    };
  }

  // ── EVALUATION ────────────────────────────────────────────────────────────
  const sourceText =
    input.additionalSourceText ?? normalised.text;

  const evalRequest = buildEvaluatorRequest(
    input.corpusDocumentId,
    input.approvedMetadata.title,
    normalised.text,
    sourceText,
    ts,
    undefined,
    representationAssessment,
    graphicalSemanticAssessment,
    input.currentnessAssessment,
  );

  const evaluationResult = evaluateDocument(evalRequest);

  if (!evaluationResult.ok) {
    return fail(
      "EVALUATION",
      "EVALUATION_FAILED",
      `DRA evaluation failed at stage: ${evaluationResult.failedAtStage}`,
      evaluationResult.failedAtStage,
    );
  }

  // ── RECEIPT LINKAGE ───────────────────────────────────────────────────────
  const proofReceipt = evaluationResult.proofReceipt;
  const substantiveDigest =
    // The ProofReceipt carries substantiveDigest on the receipt object.
    (proofReceipt as { substantiveDigest?: string }).substantiveDigest ?? "";

  const proofReference: BenchmarkProofReference = Object.freeze({
    freezeRecordId: freezeRecord.freezeRecordId,
    corpusDocumentId: freezeRecord.corpusDocumentId,
    sourceDigest: freezeRecord.sourceDigest,
    normalisedTextDigest: freezeRecord.normalisedTextDigest,
    metadataDigest: freezeRecord.metadataDigest,
    freezeRecordDigest: freezeRecord.freezeRecordDigest,
    proofReceiptSubstantiveDigest: substantiveDigest,
    evaluationTimestamp: ts,
    ...(freezeRecord.currentnessAssertionDigest !== undefined
      ? { currentnessAssertionDigest: freezeRecord.currentnessAssertionDigest }
      : {}),
    ...(freezeRecord.freezeIntegritySchemaVersion !== undefined
      ? { freezeIntegritySchemaVersion: freezeRecord.freezeIntegritySchemaVersion }
      : {}),
  });

  const decision =
    (proofReceipt as { decision?: string }).decision ?? "UNKNOWN";

  return {
    ok: true,
    result: Object.freeze<BenchmarkDocumentResult>({
      freeze: freezeRecord,
      manifest: integrationResult.manifest,
      manifestDigest: integrationResult.manifestDigest,
      proofReference,
      decision,
      evaluationResult,
      ...(freezeRecord.currentnessAssessment !== undefined
        ? { currentnessAssessment: freezeRecord.currentnessAssessment }
        : {}),
    }),
  };
}

// ---------------------------------------------------------------------------
// FrozenBenchmarkEvaluationInput / Result
// ---------------------------------------------------------------------------

export interface FrozenBenchmarkEvaluationInput {
  /** The immutable freeze record to verify against. */
  readonly freezeRecord: AcquisitionFreezeRecord;
  /** Raw source bytes — must match freezeRecord.sourceDigest. */
  readonly rawBytes: Uint8Array;
  /** Normalised text — must match freezeRecord.normalisedTextDigest. */
  readonly normalisedText: string;
  /** Approved metadata — must match freezeRecord.metadataDigest. */
  readonly approvedMetadata: ApprovedMetadata;
  /** The corpus registry — document must be present. */
  readonly registry: CorpusRegistry;
  /** Optional additional source context for the DRA evaluator. */
  readonly additionalSourceText?: string;
  /** Fixed timestamp for deterministic tests. */
  readonly fixedTimestamp?: string;
  /**
   * Optional machine-readable evaluation boundary for DRA-FIX-001
   * (Boundary-Constrained Claim Extraction).
   * When provided, Stage 2 restricts claim extraction to this character range
   * within the normalised text.
   */
  readonly evaluationBoundary?: { readonly startOffset: number; readonly endOffset: number };
}

export type FrozenBenchmarkEvaluationResult =
  | { readonly ok: true; readonly result: BenchmarkDocumentResult }
  | {
      readonly ok: false;
      readonly stage: AcquisitionPipelineStage;
      readonly errors: readonly AcquisitionPipelineError[];
    };

// ---------------------------------------------------------------------------
// evaluateFrozenBenchmarkDocument
// ---------------------------------------------------------------------------

/**
 * Evaluates a known frozen benchmark document through the DRA evaluator.
 *
 * Verifies source digest, text digest, metadata digest, freeze record digest,
 * corpus registry membership, and manifest integrity before evaluating.
 * Rejects any tampered input.
 *
 * Never throws for expected failures. Returns {ok:false,...} on any mismatch.
 *
 * @param input  Frozen document inputs with all pre-computed digests.
 * @returns      FrozenBenchmarkEvaluationResult.
 */
export function evaluateFrozenBenchmarkDocument(
  input: FrozenBenchmarkEvaluationInput,
): FrozenBenchmarkEvaluationResult {
  const ts = input.fixedTimestamp ?? new Date().toISOString();
  const { freezeRecord } = input;

  const fail = (
    stage: AcquisitionPipelineStage,
    code: string,
    message: string,
  ): FrozenBenchmarkEvaluationResult => ({
    ok: false,
    stage,
    errors: [{ code, message, stage }],
  });

  // Verify source digest.
  if (!verifySourceDigest(input.rawBytes, freezeRecord.sourceDigest)) {
    return fail(
      "INTEGRITY",
      "SOURCE_DIGEST_MISMATCH",
      `Source bytes do not match freeze record sourceDigest (${freezeRecord.sourceDigest.slice(0, 16)}…)`,
    );
  }

  // Verify normalised text digest.
  if (!verifyTextDigest(input.normalisedText, freezeRecord.normalisedTextDigest)) {
    return fail(
      "INTEGRITY",
      "TEXT_DIGEST_MISMATCH",
      `Normalised text does not match freeze record normalisedTextDigest (${freezeRecord.normalisedTextDigest.slice(0, 16)}…)`,
    );
  }

  // Verify metadata digest.
  const metadataDigest = computeApprovedMetadataDigest(input.approvedMetadata);
  if (metadataDigest !== freezeRecord.metadataDigest) {
    return fail(
      "INTEGRITY",
      "METADATA_DIGEST_MISMATCH",
      `Approved metadata does not match freeze record metadataDigest (${freezeRecord.metadataDigest.slice(0, 16)}…)`,
    );
  }

  // Verify freeze record digest.
  if (!verifyAcquisitionFreezeRecordDigest(freezeRecord)) {
    return fail(
      "INTEGRITY",
      "FREEZE_RECORD_DIGEST_MISMATCH",
      `Freeze record substantive digest is invalid (${freezeRecord.freezeRecordDigest.slice(0, 16)}…)`,
    );
  }

  // DRA-ENG-021 — verify the currentness assertion's own binding, if this
  // freeze record carries one. This is the enforcement point that makes a
  // bound currentnessAssessment tamper-evident: a record whose currentness
  // fields, related-document identity, evidence, or assessor identity were
  // altered after the digest was computed (without recomputing and
  // reissuing the digest) is rejected here, before evaluation proceeds.
  if (!verifyAcquisitionCurrentnessIntegrity(freezeRecord)) {
    return fail(
      "INTEGRITY",
      "CURRENTNESS_ASSERTION_DIGEST_MISMATCH",
      `Currentness assertion digest is invalid or inconsistent for freeze record ${freezeRecord.freezeRecordId}`,
    );
  }

  // Verify corpus membership.
  if (!input.registry.hasId(freezeRecord.corpusDocumentId)) {
    return fail(
      "CORPUS_INTEGRATION",
      "NOT_IN_CORPUS",
      `Document ${freezeRecord.corpusDocumentId} is not registered in the corpus`,
    );
  }

  // Verify manifest integrity.
  const manifest = input.registry.exportManifest();
  if (!verifyManifestIntegrity(manifest)) {
    return fail(
      "CORPUS_INTEGRATION",
      "MANIFEST_INTEGRITY_FAILED",
      "Corpus manifest integrity verification failed",
    );
  }

  const manifestDigest = manifest.overallDigest;

  // Evaluate via existing DRA evaluator (never reimplemented here).
  // DRA-ENG-017: propagate the freeze record's own stored representation
  // assessment (if any) rather than recomputing it here. Historical freeze
  // records created before DRA-ENG-017 existed have no such field, and this
  // path must tolerate that (undefined) exactly as before — no behaviour
  // change for pre-existing frozen documents like DRA-DOC-0027's original
  // DRA-FRZ-000021 record.
  const sourceText = input.additionalSourceText ?? input.normalisedText;
  const evalRequest = buildEvaluatorRequest(
    freezeRecord.corpusDocumentId,
    input.approvedMetadata.title,
    input.normalisedText,
    sourceText,
    ts,
    input.evaluationBoundary,
    freezeRecord.representationAssessment,
    freezeRecord.graphicalSemanticAssessment,
    freezeRecord.currentnessAssessment,
  );

  const evaluationResult = evaluateDocument(evalRequest);

  if (!evaluationResult.ok) {
    return fail(
      "EVALUATION",
      "EVALUATION_FAILED",
      `DRA evaluation failed at stage: ${evaluationResult.failedAtStage}`,
    );
  }

  const proofReceipt = evaluationResult.proofReceipt;
  const substantiveDigest =
    (proofReceipt as { substantiveDigest?: string }).substantiveDigest ?? "";

  const proofReference: BenchmarkProofReference = Object.freeze({
    freezeRecordId: freezeRecord.freezeRecordId,
    corpusDocumentId: freezeRecord.corpusDocumentId,
    sourceDigest: freezeRecord.sourceDigest,
    normalisedTextDigest: freezeRecord.normalisedTextDigest,
    metadataDigest: freezeRecord.metadataDigest,
    freezeRecordDigest: freezeRecord.freezeRecordDigest,
    proofReceiptSubstantiveDigest: substantiveDigest,
    evaluationTimestamp: ts,
    ...(freezeRecord.currentnessAssertionDigest !== undefined
      ? { currentnessAssertionDigest: freezeRecord.currentnessAssertionDigest }
      : {}),
    ...(freezeRecord.freezeIntegritySchemaVersion !== undefined
      ? { freezeIntegritySchemaVersion: freezeRecord.freezeIntegritySchemaVersion }
      : {}),
  });

  const decision =
    (proofReceipt as { decision?: string }).decision ?? "UNKNOWN";

  return {
    ok: true,
    result: Object.freeze<BenchmarkDocumentResult>({
      freeze: freezeRecord,
      manifest,
      manifestDigest,
      proofReference,
      decision,
      evaluationResult,
      ...(freezeRecord.currentnessAssessment !== undefined
        ? { currentnessAssessment: freezeRecord.currentnessAssessment }
        : {}),
    }),
  };
}
