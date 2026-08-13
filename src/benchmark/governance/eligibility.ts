/**
 * DRA-001 — Benchmark Corpus Eligibility and Content Boundary
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Defines:
 *   - ContentPayload: the immutable, content-addressed content model.
 *   - CorpusCandidate: a proposed document plus its content and governance flags.
 *   - checkEligibility: machine-readable eligibility determination without
 *     running the evaluator.
 *
 * Content model: immutable inline content.
 *   - Content is stored inline as a UTF-8 string.
 *   - A SHA-256 digest (contentDigest) is computed at creation time.
 *   - Integrity is verifiable at any time by recomputing the digest.
 *   - Source material and generated document are kept in separate payloads,
 *     distinguished by contentType ("SOURCE" | "GENERATED").
 *   - Content changes alter the digest.
 *   - Missing content (empty string) prevents admission.
 *
 * Eligibility is determined without running the evaluator.
 */

import { createHash } from "node:crypto";
import { z } from "zod";
import {
  CorpusDocumentInputSchema,
  type CorpusDocumentInput,
} from "../corpus/schema.js";
import type { BenchmarkSelectionProtocol } from "./schema.js";
import type { ExclusionReason } from "./exclusions.js";

// ---------------------------------------------------------------------------
// ContentPayload — immutable inline content with integrity digest
// ---------------------------------------------------------------------------

export const CONTENT_TYPES = ["SOURCE", "GENERATED"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const ContentTypeSchema = z.enum(
  CONTENT_TYPES as unknown as [string, ...string[]],
);

/**
 * An immutable, content-addressed payload holding a document's raw text.
 *
 * Operational metadata (creation time, processing metadata) is not stored here.
 * The `contentDigest` is the single source of truth for content identity.
 */
export interface ContentPayload {
  /** Raw UTF-8 text of the document. */
  readonly content: string;
  /** SHA-256 hex of `content`. Must be recomputable and must match. */
  readonly contentDigest: string;
  /** Whether this is the source material or the generated document. */
  readonly contentType: ContentType;
  /** Text encoding. Always "utf-8". */
  readonly encoding: "utf-8";
}

export const ContentPayloadSchema = z.object({
  content: z.string().min(1, "Content must not be empty"),
  contentDigest: z.string().length(64),
  contentType: ContentTypeSchema,
  encoding: z.literal("utf-8"),
});

// ---------------------------------------------------------------------------
// computeContentDigest
// ---------------------------------------------------------------------------

/**
 * Computes the SHA-256 hex digest of the raw content string.
 * @returns 64-character lowercase hex string.
 */
export function computeContentDigest(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// buildContentPayload
// ---------------------------------------------------------------------------

/**
 * Creates a frozen ContentPayload with a freshly computed integrity digest.
 *
 * @param content      Raw text content.
 * @param contentType  "SOURCE" for source material; "GENERATED" for the output.
 * @throws             Error if content is empty (missing content prevents admission).
 */
export function buildContentPayload(
  content: string,
  contentType: ContentType,
): ContentPayload {
  if (content.length === 0) {
    throw new Error(`Content must not be empty (contentType: ${contentType})`);
  }
  return Object.freeze({
    content,
    contentDigest: computeContentDigest(content),
    contentType,
    encoding: "utf-8" as const,
  });
}

// ---------------------------------------------------------------------------
// verifyContentIntegrity
// ---------------------------------------------------------------------------

/**
 * Returns true when the stored `contentDigest` matches the recomputed digest
 * of `content`.  Returns false when the content has been mutated.
 */
export function verifyContentIntegrity(payload: ContentPayload): boolean {
  return computeContentDigest(payload.content) === payload.contentDigest;
}

// ---------------------------------------------------------------------------
// CorpusCandidate — proposed document with content and governance flags
// ---------------------------------------------------------------------------

/**
 * A proposed document submitted for consideration for corpus admission.
 *
 * Extends CorpusDocumentInput (all metadata fields) with:
 *   - sourceContent: the source/reference material.
 *   - generatedContent: the generated document under evaluation.
 *   - Governance flags that the curator must set honestly.
 *
 * Governance flags cannot be verified mechanically (except content integrity),
 * but must be explicit so the admission record captures the curator's attestation.
 */
export interface CorpusCandidate extends CorpusDocumentInput {
  /** The source or reference material used to create the document. */
  readonly sourceContent: ContentPayload;
  /** The generated (or authored) document that will be evaluated. */
  readonly generatedContent: ContentPayload;
  /**
   * True when evaluator output was consulted during document selection.
   * Must be false for all admitted candidates.
   */
  readonly evaluatorInfluenced: boolean;
  /**
   * True when the document contains pre-recorded benchmark decisions or
   * expected outcomes.  Must be false for all admitted candidates.
   */
  readonly hasPreannotatedOutcome: boolean;
  /**
   * True when the source reference can be independently verified.
   * Must be true for all admitted candidates.
   */
  readonly sourceVerifiable: boolean;
}

export const CorpusCandidateSchema = CorpusDocumentInputSchema.extend({
  sourceContent: ContentPayloadSchema,
  generatedContent: ContentPayloadSchema,
  evaluatorInfluenced: z.boolean(),
  hasPreannotatedOutcome: z.boolean(),
  sourceVerifiable: z.boolean(),
});

// ---------------------------------------------------------------------------
// EligibilityResult
// ---------------------------------------------------------------------------

export type EligibilityResult =
  | { readonly outcome: "ELIGIBLE" }
  | {
      readonly outcome: "INELIGIBLE";
      readonly reason: ExclusionReason;
      readonly rationale: string;
    };

// ---------------------------------------------------------------------------
// checkEligibility
// ---------------------------------------------------------------------------

/**
 * Determines whether a corpus candidate is eligible for admission under
 * the given selection protocol.
 *
 * Checks are applied in the order listed below.  The first failing check
 * returns INELIGIBLE immediately — subsequent checks are not evaluated.
 *
 * Order of checks:
 *   1. Source content integrity (contentDigest match).
 *   2. Generated content integrity.
 *   3. Source content not empty.
 *   4. Generated content not empty.
 *   5. Domain in permittedDomains.
 *   6. Document type in permittedDocumentTypes.
 *   7. Source type in permittedSourceTypes.
 *   8. Language in permittedLanguages.
 *   9. evaluatorInfluenced === false.
 *  10. hasPreannotatedOutcome === false.
 *  11. sourceVerifiable === true.
 *
 * Note: duplicate and near-duplicate checks are performed by the admission
 * workflow, not here — they require registry state.
 * Note: allocation capacity is also checked by the admission workflow.
 */
export function checkEligibility(
  candidate: CorpusCandidate,
  protocol: BenchmarkSelectionProtocol,
): EligibilityResult {
  // 1. Source content integrity.
  if (!verifyContentIntegrity(candidate.sourceContent)) {
    return {
      outcome: "INELIGIBLE",
      reason: "CORRUPT_CONTENT",
      rationale: "Source content integrity digest mismatch — content may have been modified",
    };
  }

  // 2. Generated content integrity.
  if (!verifyContentIntegrity(candidate.generatedContent)) {
    return {
      outcome: "INELIGIBLE",
      reason: "CORRUPT_CONTENT",
      rationale: "Generated content integrity digest mismatch — content may have been modified",
    };
  }

  // 3. Source content not empty.
  if (candidate.sourceContent.content.length === 0) {
    return {
      outcome: "INELIGIBLE",
      reason: "INCOMPLETE_METADATA",
      rationale: "Source content is empty — content must be present before admission",
    };
  }

  // 4. Generated content not empty.
  if (candidate.generatedContent.content.length === 0) {
    return {
      outcome: "INELIGIBLE",
      reason: "INCOMPLETE_METADATA",
      rationale: "Generated content is empty — content must be present before admission",
    };
  }

  // 5. Domain.
  if (!(protocol.permittedDomains as readonly string[]).includes(candidate.domain)) {
    return {
      outcome: "INELIGIBLE",
      reason: "OUT_OF_SCOPE_DOMAIN",
      rationale: `Domain "${candidate.domain}" is not permitted by this protocol`,
    };
  }

  // 6. Document type.
  if (
    !(protocol.permittedDocumentTypes as readonly string[]).includes(
      candidate.documentType,
    )
  ) {
    return {
      outcome: "INELIGIBLE",
      reason: "OUT_OF_SCOPE_DOCUMENT_TYPE",
      rationale: `Document type "${candidate.documentType}" is not permitted by this protocol`,
    };
  }

  // 7. Source type.
  if (
    !(protocol.permittedSourceTypes as readonly string[]).includes(candidate.sourceType)
  ) {
    return {
      outcome: "INELIGIBLE",
      reason: "DISALLOWED_SOURCE_TYPE",
      rationale: `Source type "${candidate.sourceType}" is not permitted by this protocol`,
    };
  }

  // 8. Language.
  if (
    !(protocol.permittedLanguages as readonly string[]).includes(candidate.language)
  ) {
    return {
      outcome: "INELIGIBLE",
      reason: "DISALLOWED_LANGUAGE",
      rationale: `Language "${candidate.language}" is not permitted by this protocol`,
    };
  }

  // 9. Evaluator influence.
  if (candidate.evaluatorInfluenced) {
    return {
      outcome: "INELIGIBLE",
      reason: "EVALUATOR_INFLUENCED_SELECTION",
      rationale: "Candidate was selected based on evaluator output — this is prohibited",
    };
  }

  // 10. Pre-annotated outcome.
  if (candidate.hasPreannotatedOutcome) {
    return {
      outcome: "INELIGIBLE",
      reason: "PREANNOTATED_OUTCOME",
      rationale:
        "Candidate contains pre-recorded benchmark decisions — must not be pre-annotated",
    };
  }

  // 11. Source verifiability.
  if (!candidate.sourceVerifiable) {
    return {
      outcome: "INELIGIBLE",
      reason: "UNVERIFIABLE_SOURCE",
      rationale: "Source reference cannot be independently verified",
    };
  }

  return { outcome: "ELIGIBLE" };
}
