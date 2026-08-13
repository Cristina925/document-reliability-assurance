/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: eligibility.ts — Per-document freeze eligibility assessment
 *
 * Distinct from governance/eligibility.ts which checks corpus-candidate
 * eligibility against a selection protocol. This module checks whether a
 * specifically acquired public document is eligible to be frozen as an
 * immutable corpus entry.
 *
 * Reuses:
 *   - assessDuplicate() from governance/near-duplicate.ts
 *   - checkEligibility() from governance/eligibility.ts
 *   - buildContentPayload() from governance/eligibility.ts
 *   - CorpusRegistry for duplicate-digest detection
 *
 * Invariants:
 *   - All checks run in deterministic order; the first blocking reason wins.
 *   - checkEligibility() is always called when per-document checks pass.
 *   - No implicit overrides; blocked checks must be explicitly resolved.
 */

import {
  checkEligibility,
  buildContentPayload,
  type CorpusCandidate,
} from "../governance/eligibility.js";
import {
  assessDuplicate,
  NEAR_DUPLICATE_JACCARD_THRESHOLD,
} from "../governance/near-duplicate.js";
import type { BenchmarkSelectionProtocol } from "../governance/schema.js";
import type { CorpusRegistry } from "../corpus/registry.js";
import type { CorpusId } from "../corpus/schema.js";
import type { AcquiredSource } from "./fetcher.js";
import type { NormalisedDocument } from "./normalisation.js";
import type { OfficialSourceAssessment } from "./schema.js";
import type { LicenceAssessment } from "./licence.js";
import type { ApprovedMetadata } from "./metadata.js";

// ---------------------------------------------------------------------------
// FreezeEligibilityCheck — result of one named check
// ---------------------------------------------------------------------------

export interface FreezeEligibilityCheck {
  readonly checkId: string;
  readonly description: string;
  readonly passed: boolean;
  readonly detail?: string;
}

// ---------------------------------------------------------------------------
// FreezeBlockingReason
// ---------------------------------------------------------------------------

export type FreezeBlockingReason =
  | "SOURCE_DIGEST_MISMATCH"
  | "NORMALISED_TEXT_EMPTY"
  | "TEXT_DIGEST_MISMATCH"
  | "OFFICIAL_SOURCE_NOT_VERIFIED"
  | "LICENCE_NOT_VERIFIED"
  | "TITLE_MISSING"
  | "PUBLISHER_MISSING"
  | "LANGUAGE_MISSING"
  | "CORPUS_ID_INVALID"
  | "INCLUSION_RATIONALE_MISSING"
  | "DUPLICATE_CORPUS_ID"
  | "NEAR_DUPLICATE_DETECTED"
  | "CORPUS_ELIGIBILITY_FAILED";

// ---------------------------------------------------------------------------
// FreezeEligibilityResult
// ---------------------------------------------------------------------------

export type FreezeEligibilityResult =
  | {
      readonly eligible: true;
      readonly checks: readonly FreezeEligibilityCheck[];
    }
  | {
      readonly eligible: false;
      readonly checks: readonly FreezeEligibilityCheck[];
      readonly blockingReasons: readonly FreezeBlockingReason[];
    };

// ---------------------------------------------------------------------------
// checkFreezeEligibility
// ---------------------------------------------------------------------------

const CORPUS_ID_REGEX = /^DRA-DOC-\d{4}$/;

/**
 * Evaluates whether an acquired, normalised public document is eligible for
 * immutable freeze and corpus integration.
 *
 * Checks are evaluated in deterministic order. All checks run; the full
 * check list and all blocking reasons are returned.
 *
 * @param source               The raw acquired source.
 * @param normalised           The normalised document (must pass pre-checks).
 * @param officialSourceAssessment  Human-provided source assessment.
 * @param licenceAssessment        Human-provided licence assessment.
 * @param approvedMetadata         Human-approved corpus metadata.
 * @param corpusDocumentId         Target corpus ID (DRA-DOC-NNNN).
 * @param inclusionRationale       Non-empty rationale for corpus inclusion.
 * @param registry                 The active CorpusRegistry (for duplicate detection).
 * @param protocol                 The active BenchmarkSelectionProtocol.
 * @param existingCorpusTexts      Normalised texts of all existing corpus documents
 *                                 (for near-duplicate detection via assessDuplicate).
 */
export function checkFreezeEligibility(
  source: AcquiredSource,
  normalised: NormalisedDocument,
  officialSourceAssessment: OfficialSourceAssessment,
  licenceAssessment: LicenceAssessment,
  approvedMetadata: ApprovedMetadata,
  corpusDocumentId: string,
  inclusionRationale: string,
  registry: CorpusRegistry,
  protocol: BenchmarkSelectionProtocol,
  existingCorpusTexts: readonly string[] = [],
): FreezeEligibilityResult {
  const checks: FreezeEligibilityCheck[] = [];
  const blockingReasons: FreezeBlockingReason[] = [];

  function record(
    check: Omit<FreezeEligibilityCheck, "passed">,
    passed: boolean,
    blockingReason?: FreezeBlockingReason,
  ): void {
    checks.push({ ...check, passed });
    if (!passed && blockingReason !== undefined) {
      blockingReasons.push(blockingReason);
    }
  }

  // 1. Source digest recorded
  record(
    {
      checkId: "SOURCE_DIGEST_PRESENT",
      description: "Normalised document carries a source digest",
      detail: normalised.sourceDigest.length === 64
        ? `digest: ${normalised.sourceDigest.slice(0, 8)}…`
        : `invalid length: ${normalised.sourceDigest.length}`,
    },
    normalised.sourceDigest.length === 64,
    "SOURCE_DIGEST_MISMATCH",
  );

  // 2. Normalised text non-empty
  record(
    {
      checkId: "NORMALISED_TEXT_NON_EMPTY",
      description: "Normalised text is non-empty",
      detail: `${normalised.text.length} characters`,
    },
    normalised.text.trim().length > 0,
    "NORMALISED_TEXT_EMPTY",
  );

  // 3. Text digest recorded
  record(
    {
      checkId: "TEXT_DIGEST_PRESENT",
      description: "Normalised document carries a text digest",
      detail: normalised.textDigest.length === 64
        ? `digest: ${normalised.textDigest.slice(0, 8)}…`
        : `invalid length: ${normalised.textDigest.length}`,
    },
    normalised.textDigest.length === 64,
    "TEXT_DIGEST_MISMATCH",
  );

  // 4. Official-source assessment VERIFIED
  record(
    {
      checkId: "OFFICIAL_SOURCE_VERIFIED",
      description: "Official-source assessment status is VERIFIED",
      detail: `status: ${officialSourceAssessment.status}`,
    },
    officialSourceAssessment.status === "VERIFIED",
    "OFFICIAL_SOURCE_NOT_VERIFIED",
  );

  // 5. Licence assessment VERIFIED
  record(
    {
      checkId: "LICENCE_VERIFIED",
      description: "Licence assessment status is VERIFIED",
      detail: `status: ${licenceAssessment.status}`,
    },
    licenceAssessment.status === "VERIFIED",
    "LICENCE_NOT_VERIFIED",
  );

  // 6. Title approved
  const hasTitle = approvedMetadata.title.trim().length > 0;
  record(
    {
      checkId: "APPROVED_TITLE_PRESENT",
      description: "Approved metadata carries a non-empty title",
      detail: hasTitle ? approvedMetadata.title : "title is empty",
    },
    hasTitle,
    "TITLE_MISSING",
  );

  // 7. Publisher approved
  const hasPublisher = approvedMetadata.publisher.trim().length > 0;
  record(
    {
      checkId: "APPROVED_PUBLISHER_PRESENT",
      description: "Approved metadata carries a non-empty publisher",
      detail: hasPublisher ? approvedMetadata.publisher : "publisher is empty",
    },
    hasPublisher,
    "PUBLISHER_MISSING",
  );

  // 8. Language approved
  const hasLanguage = approvedMetadata.language.trim().length > 0;
  record(
    {
      checkId: "APPROVED_LANGUAGE_PRESENT",
      description: "Approved metadata carries a non-empty language code",
      detail: hasLanguage ? approvedMetadata.language : "language is empty",
    },
    hasLanguage,
    "LANGUAGE_MISSING",
  );

  // 9. Corpus document ID format
  const validCorpusId = CORPUS_ID_REGEX.test(corpusDocumentId);
  record(
    {
      checkId: "CORPUS_ID_FORMAT",
      description: "Target corpus document ID matches DRA-DOC-NNNN format",
      detail: `id: ${corpusDocumentId}`,
    },
    validCorpusId,
    "CORPUS_ID_INVALID",
  );

  // 10. Inclusion rationale non-empty
  const hasRationale = inclusionRationale.trim().length > 0;
  record(
    {
      checkId: "INCLUSION_RATIONALE_PRESENT",
      description: "Inclusion rationale is non-empty",
      detail: hasRationale
        ? `${inclusionRationale.length} characters`
        : "rationale is empty",
    },
    hasRationale,
    "INCLUSION_RATIONALE_MISSING",
  );

  // 11. No duplicate corpus ID in registry
  const duplicateCorpusId = registry.hasId(corpusDocumentId);
  record(
    {
      checkId: "NO_DUPLICATE_CORPUS_ID",
      description: "Target corpus document ID is not already registered",
      detail: duplicateCorpusId
        ? `corpus ID already registered: ${corpusDocumentId}`
        : `${corpusDocumentId} is available`,
    },
    !duplicateCorpusId,
    "DUPLICATE_CORPUS_ID",
  );

  // 12. Near-duplicate check against existing corpus texts (was 13)
  let nearDuplicateBlocking = false;
  if (existingCorpusTexts.length > 0) {
    for (const existingText of existingCorpusTexts) {
      const assessment = assessDuplicate(normalised.text, existingText);
      if (
        assessment.status === "EXACT_DUPLICATE" ||
        assessment.status === "NEAR_DUPLICATE"
      ) {
        nearDuplicateBlocking = true;
        break;
      }
    }
  }
  record(
    {
      checkId: "NO_NEAR_DUPLICATE",
      description: `Near-duplicate check against ${existingCorpusTexts.length} existing corpus text(s) (Jaccard threshold: ${NEAR_DUPLICATE_JACCARD_THRESHOLD})`,
      detail: nearDuplicateBlocking
        ? "near-duplicate or exact duplicate detected"
        : "no near-duplicates detected",
    },
    !nearDuplicateBlocking,
    "NEAR_DUPLICATE_DETECTED",
  );

  // 13. Corpus-level eligibility via existing checkEligibility()
  // Build a CorpusCandidate from approved metadata + normalised content.
  const candidate: CorpusCandidate = {
    corpusId: validCorpusId ? (corpusDocumentId as CorpusId) : ("DRA-DOC-0000" as CorpusId),
    title: approvedMetadata.title,
    sourceType: "HUMAN_AUTHORED",
    documentType: approvedMetadata.documentType,
    domain: approvedMetadata.domain,
    language: approvedMetadata.language,
    generator: approvedMetadata.publisher || "Unknown",
    generatorVersion: "N/A",
    creationMethod: `Public document acquired from ${source.requestedUrl}`,
    sourceReference: source.requestedUrl,
    benchmarkStatus: "FROZEN",
    difficulty: approvedMetadata.difficulty,
    notes: `Acquisition ID: ${source.acquisitionId}`,
    // Reuse buildContentPayload to create the canonical content payloads.
    sourceContent: buildContentPayload(normalised.text, "SOURCE"),
    generatedContent: buildContentPayload(normalised.text, "GENERATED"),
    evaluatorInfluenced: false,
    hasPreannotatedOutcome: false,
    sourceVerifiable: true,
  };

  const corpusEligibility = checkEligibility(candidate, protocol);
  const corpusEligibilityPassed = corpusEligibility.outcome === "ELIGIBLE";

  record(
    {
      checkId: "CORPUS_ELIGIBILITY",
      description: "Document satisfies corpus selection protocol constraints",
      detail: corpusEligibilityPassed
        ? "eligible"
        : `ineligible: ${corpusEligibility.outcome === "INELIGIBLE" ? corpusEligibility.reason : "unknown"}`,
    },
    corpusEligibilityPassed,
    "CORPUS_ELIGIBILITY_FAILED",
  );

  const frozenChecks: readonly FreezeEligibilityCheck[] = Object.freeze(
    checks.map(Object.freeze) as FreezeEligibilityCheck[],
  );

  if (blockingReasons.length === 0) {
    return Object.freeze<FreezeEligibilityResult & { eligible: true }>({
      eligible: true,
      checks: frozenChecks,
    });
  }

  return Object.freeze<FreezeEligibilityResult & { eligible: false }>({
    eligible: false,
    checks: frozenChecks,
    blockingReasons: Object.freeze([...blockingReasons]),
  });
}
