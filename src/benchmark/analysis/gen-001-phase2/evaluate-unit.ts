/**
 * DRA-GEN-001 Phase 2 — Minimal non-governed evaluation path
 *
 * Phase 2 evaluates 100 blind-sample documents that are explicitly NOT
 * admitted to the DRA benchmark corpus (see dra-rob-001-conventions.md /
 * task Section 25 — GEN-001 must not perform corpus admission). The full
 * `acquireFreezeAndEvaluate` governed pipeline therefore does not apply: it
 * requires a CorpusRegistry, BenchmarkSelectionProtocol, licence/official-
 * source eligibility assessments and freeze-record admission, none of which
 * are appropriate for a document that will never enter the corpus.
 *
 * Instead this module uses the same underlying primitives
 * (normaliseContent -> EvaluationRequest -> evaluateDocument) with the
 * identical request shape `buildEvaluatorRequest` uses in
 * governed-pipeline.ts (self-referential generatedDocument/sourceDocuments,
 * both carrying the normalised text) — see dra-gen-001-phase2-conventions
 * memory note for why this is a legitimate reuse and not a new evaluation
 * contract.
 */
import { normaliseContent, type NormalisationResult } from "../../acquisition/normalisation";
import { computeSourceDigest } from "../../acquisition/integrity";
import { evaluateDocument } from "../../../pipeline/evaluate-document";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/evaluation-result";
import { pdftotextExtractor } from "./pdf-extractor";

export interface FrozenUnitLike {
  readonly frameId: string;
  readonly title: string;
  readonly mediaType: "PDF" | "HTML";
  readonly sha256: string;
}

export type UnitNormalisationOutcome =
  | { readonly ok: true; readonly normalisedText: string; readonly warnings: readonly string[] }
  | { readonly ok: false; readonly code: string; readonly message: string };

/** Maps the frozen unit's declared media type to normaliseContent's SupportedMediaType. */
function toSupportedMediaType(mediaType: "PDF" | "HTML"): "application/pdf" | "text/html" {
  return mediaType === "PDF" ? "application/pdf" : "text/html";
}

/**
 * Re-verifies the locked source digest, then normalises. Never throws —
 * PDF extraction failures and empty-text conditions come back as a typed
 * `{ok:false}` result exactly as normaliseContent already does.
 */
export interface UnitVerificationOutcome {
  readonly digestMatch: boolean;
  readonly liveDigest: string;
  readonly normalisation?: UnitNormalisationOutcome;
}

export async function verifyAndNormaliseUnit(
  unit: FrozenUnitLike,
  rawBytes: Uint8Array,
): Promise<UnitVerificationOutcome> {
  const liveDigest = computeSourceDigest(rawBytes);
  const digestMatch = liveDigest === unit.sha256;
  if (!digestMatch) {
    return { digestMatch, liveDigest };
  }
  const result: NormalisationResult = await normaliseContent(
    rawBytes,
    toSupportedMediaType(unit.mediaType),
    liveDigest,
    unit.mediaType === "PDF" ? pdftotextExtractor : undefined,
  );
  if (!result.ok) {
    return { digestMatch, liveDigest, normalisation: { ok: false, code: result.code, message: result.message } };
  }
  return {
    digestMatch,
    liveDigest,
    normalisation: { ok: true, normalisedText: result.document.text, warnings: result.document.warnings },
  };
}

/**
 * Builds the exact same EvaluationRequest shape as
 * governed-pipeline.ts's buildEvaluatorRequest (self-referential:
 * generatedDocument.content === sourceDocuments[0].content === normalisedText),
 * with no evaluationBoundary/requesterMetadata assessments (none of the
 * optional representation/graphical/currentness side-channels apply — this
 * is a blind first-pass measurement, not a governed corpus admission).
 */
export function buildPhase2EvaluationRequest(
  unit: FrozenUnitLike,
  normalisedText: string,
  requestedAt: string,
): unknown {
  const corpusDocumentId = unit.frameId;
  const sourceId = `sdoc-${corpusDocumentId}-src`;
  return {
    id: `eval-${corpusDocumentId}`,
    generatedDocument: {
      id: `gdoc-${corpusDocumentId}`,
      title: unit.title,
      content: normalisedText,
      sourceDocumentIds: [sourceId],
    },
    sourceDocuments: [
      {
        id: sourceId,
        title: `Source: ${unit.title}`,
        content: normalisedText,
        format: "PLAIN_TEXT",
      },
    ],
    requestedAt,
  };
}

export interface UnitRunnerException {
  readonly threw: true;
  readonly message: string;
  readonly stack?: string;
}

/**
 * Runner-exception wrapper. evaluateDocument itself never throws (per its
 * own documented invariant — see evaluate-document.ts header), but this
 * wrapper exists because BenchmarkRunner's execute() loop was found (this
 * session) to have NO try/catch around its evaluateDocument call despite
 * its module comment claiming "never throws" — Phase 2 must not inherit
 * that gap for a 100-document blind, unattended batch run.
 */
export function safeEvaluateDocument(
  request: unknown,
): { readonly threw: false; readonly evaluation: DocumentAssuranceEvaluation } | UnitRunnerException {
  try {
    const evaluation = evaluateDocument(request);
    return { threw: false, evaluation };
  } catch (e) {
    return {
      threw: true,
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    };
  }
}
