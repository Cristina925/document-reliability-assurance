/**
 * DRA-001-07 — Simulated Independent Reviewer Workflow
 *
 * Provides a deterministic set of independent reviewer submissions for the
 * six benchmark corpus documents. Reviewer submissions are pre-defined based
 * on human assessment of the document content and are independent of the
 * evaluator's output — reviewers do not see evaluator results before submitting.
 *
 * Two reviewers:
 *   REV-001  General Assurance Analyst — broad domain coverage
 *   REV-002  Domain Specialist        — deep domain expertise
 *
 * Submission design rationale:
 *   - REV-001 applies a consistent assurance framework across all domains.
 *   - REV-002 applies deeper domain-specific scrutiny.
 *   - On some documents they agree; on others they differ in recommendation
 *     or issue identification. This produces meaningful comparison data.
 *
 * Design:
 *   - All submissions are deterministic; no randomness.
 *   - Submissions use the timestamp provided to createSimulatedReviewSession.
 *   - The session is built using the standard HumanReviewSession operations.
 */

import {
  createReviewSession,
  addSubmission,
  type HumanReviewSession,
  type ReviewerSubmission,
} from "../execution/human-review.js";
import type { CorpusId } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// Reviewer identifiers
// ---------------------------------------------------------------------------

export const REVIEWER_GENERAL = "REV-001" as const;
export const REVIEWER_SPECIALIST = "REV-002" as const;
export const REVIEWER_IDS = [REVIEWER_GENERAL, REVIEWER_SPECIALIST] as const;

// ---------------------------------------------------------------------------
// Pre-defined reviewer submissions (one per document per reviewer)
// ---------------------------------------------------------------------------

/**
 * Returns the pre-defined ReviewerSubmission for a given document and reviewer.
 * These are fixed assessments produced by reading the document content,
 * not derived from evaluator output.
 */
function makeSubmissions(timestamp: string): readonly ReviewerSubmission[] {
  const submissions: ReviewerSubmission[] = [];

  // -------------------------------------------------------------------------
  // DRA-DOC-0001 — Safety Management System Compliance Audit
  // Both reviewers: SUPPORTED. Well-structured with clear source traceability.
  // REV-002 flags corrective actions as missing source traceability.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0001" as CorpusId,
    submittedAt: timestamp,
    issues: [],
    recommendation: "SUPPORTED",
    confidence: "HIGH",
    notes:
      "All material claims are traceable to ISO 31000:2018 and ISO 45001:2018. " +
      "Corrective action schedule and management review are within document scope.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0001" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "TRACEABILITY_BROKEN",
        severity: "ADVISORY",
        explanation:
          "Eight outstanding corrective actions are referenced but their content and " +
          "target completion rationale are not traceable to the cited standards. " +
          "The source material does not specify a six-month follow-up interval.",
      },
    ],
    recommendation: "SUPPORTED",
    confidence: "HIGH",
    notes:
      "Overall the document is well-supported. Advisory traceability gap noted for " +
      "corrective action details — does not affect the SUPPORTED recommendation.",
  });

  // -------------------------------------------------------------------------
  // DRA-DOC-0002 — Data Protection Impact Assessment
  // REV-001: HOLD — claims about 72-hour portability guarantee not in GDPR Article 35 source.
  // REV-002: REVIEW — evidence inadequate for residual risk determination.
  // Reviewers disagree on severity; this is an AMBIGUOUS_CASE.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0002" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        explanation:
          "The claim that the organisation 'guarantees data portability in machine-readable " +
          "format within seventy-two hours of request' is not supported by GDPR Article 35 " +
          "or Recital 84. Data portability timeframes under Article 20 are not cited.",
      },
      {
        issueClass: "AUTHORITY_ABSENT",
        severity: "ADVISORY",
        explanation:
          "Reference to 'GDPR Article 36 prior consultation' requirement is stated but " +
          "GDPR Article 36 is not included in the source material provided.",
      },
    ],
    recommendation: "HOLD",
    confidence: "HIGH",
    notes:
      "One blocking unsupported claim regarding data portability timescale. " +
      "GDPR Article 36 is referenced but not sourced.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0002" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "EVIDENCE_INADEQUATE",
        severity: "BLOCKING",
        explanation:
          "The assertion that residual risk has been reduced to 'medium or below' " +
          "for all three identified risks is not supported by the source material. " +
          "GDPR Article 35 requires documentation of residual risk assessment but " +
          "does not establish the organisation's claimed threshold criteria.",
      },
      {
        issueClass: "AUTHORITY_ABSENT",
        severity: "ADVISORY",
        explanation:
          "GDPR Article 22 (automated decision-making) is cited without inclusion " +
          "in the referenced source material.",
      },
    ],
    recommendation: "REVIEW",
    confidence: "HIGH",
    notes:
      "Borderline case. Residual risk claims exceed what can be sourced from Article 35 alone. " +
      "Recommend REVIEW rather than HOLD — the DPIA structure is sound.",
  });

  // -------------------------------------------------------------------------
  // DRA-DOC-0003 — Third-Party Vendor Risk Assessment
  // Both reviewers: SUPPORTED. Strong source traceability throughout.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0003" as CorpusId,
    submittedAt: timestamp,
    issues: [],
    recommendation: "SUPPORTED",
    confidence: "HIGH",
    notes:
      "All claims are traceable to NIST CSF 2.0 and ISO 27036-1:2021. " +
      "Provider-specific findings are appropriately scoped.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0003" as CorpusId,
    submittedAt: timestamp,
    issues: [],
    recommendation: "SUPPORTED",
    confidence: "MEDIUM",
    notes:
      "Document is well-supported. Confidence is MEDIUM because SOC 2 attestation " +
      "and penetration testing reports referenced for Provider A are not in the source " +
      "material — they are described as 'verified' but their content is not reproduced.",
  });

  // -------------------------------------------------------------------------
  // DRA-DOC-0004 — Clinical Decision Support System Validation
  // REV-001: REVIEW — FDA CDS guidance referenced but not in source material.
  // REV-002: HOLD — additional authority absent (DCB0129, ISO 62304), specialist assessment.
  // Reviewers differ significantly; specialist identifies more issues.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0004" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "AUTHORITY_ABSENT",
        severity: "BLOCKING",
        explanation:
          "The post-deployment surveillance plan is described as being established " +
          "'in accordance with FDA guidance on clinical decision support software'. " +
          "This FDA guidance document is not included in the source material.",
      },
    ],
    recommendation: "REVIEW",
    confidence: "MEDIUM",
    notes:
      "Core NHS Digital and NICE claims are supported. FDA reference is not sourced. " +
      "REVIEW rather than HOLD given the NHS Digital and NICE content is sound.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0004" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "AUTHORITY_ABSENT",
        severity: "BLOCKING",
        explanation:
          "FDA guidance on clinical decision support software is cited but not provided " +
          "in the source material. This is a material authority reference for the " +
          "post-deployment surveillance approach.",
      },
      {
        issueClass: "AUTHORITY_ABSENT",
        severity: "ADVISORY",
        explanation:
          "DCB0129 (Clinical Risk Management standard) and ISO 62304:2006+AMD1:2015 " +
          "(medical device software lifecycle) are both cited but neither is included " +
          "in the source material.",
      },
      {
        issueClass: "TRACEABILITY_BROKEN",
        severity: "ADVISORY",
        explanation:
          "The NEWS2 Sepsis Six care bundle reference lacks a citation. The biomarker " +
          "thresholds described as 'derived from the Sepsis Six care bundle' cannot be " +
          "traced to the provided NICE NG51 source text.",
      },
    ],
    recommendation: "HOLD",
    confidence: "HIGH",
    notes:
      "Three separate authority and traceability issues. As a domain specialist, I " +
      "assess this as HOLD pending provision of DCB0129, ISO 62304, and FDA CDS source material.",
  });

  // -------------------------------------------------------------------------
  // DRA-DOC-0005 — Internal Financial Controls Adequacy Assessment
  // REV-001: REVIEW — IFRS 9 ECL calculation claim exceeds source provisions.
  // REV-002: REVIEW — Evidence for hedge accounting adequacy not in source.
  // Both agree on REVIEW but identify different specific issues.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0005" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "EVIDENCE_INADEQUATE",
        severity: "BLOCKING",
        explanation:
          "The claim that the twelve-month ECL allowance of £4.2 million is 'appropriate ' +\n" +
          "'given current market conditions' is an unsupported management judgement. " +
          "IFRS 9 Section 5.5 establishes the ECL model but does not validate specific " +
          "allowance percentages. No market data or model output is referenced.",
      },
    ],
    recommendation: "REVIEW",
    confidence: "HIGH",
    notes:
      "Overall SOX 404 compliance claims are well-supported by the source. " +
      "The ECL adequacy assertion requires additional evidence.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0005" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "EVIDENCE_INADEQUATE",
        severity: "BLOCKING",
        explanation:
          "The claim that the ECL allowance is appropriate lacks supporting evidence from " +
          "the source material. IFRS 9 Section 5.5 does not provide benchmarks for " +
          "allowance percentages.",
      },
      {
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "ADVISORY",
        explanation:
          "The statement that 'all hedge accounting relationships were documented and " +
          "designated in accordance with IFRS 9 Section 6.4' cannot be verified. " +
          "IFRS 9 Section 6.4 is not included in the source material.",
      },
    ],
    recommendation: "REVIEW",
    confidence: "HIGH",
    notes:
      "Two issues identified, both relating to IFRS 9. SOX compliance content is adequate. " +
      "REVIEW is appropriate — issues are advisory and do not invalidate the overall assessment.",
  });

  // -------------------------------------------------------------------------
  // DRA-DOC-0006 — Information Security Policy Framework
  // REV-001: SUPPORTED — clear scope, standard ISO 27001 compliance claims.
  // REV-002: REVIEW — scope claim extends to contractor agreements beyond ISO 27001:2022 clauses 5–6.
  // -------------------------------------------------------------------------

  submissions.push({
    reviewerId: REVIEWER_GENERAL,
    corpusId: "DRA-DOC-0006" as CorpusId,
    submittedAt: timestamp,
    issues: [],
    recommendation: "SUPPORTED",
    confidence: "HIGH",
    notes:
      "All ISO 27001:2022 references are well-scoped and traceable to Clauses 5 and 6. " +
      "Policy structure satisfies the cited requirements.",
  });

  submissions.push({
    reviewerId: REVIEWER_SPECIALIST,
    corpusId: "DRA-DOC-0006" as CorpusId,
    submittedAt: timestamp,
    issues: [
      {
        issueClass: "SCOPE_VIOLATION",
        severity: "ADVISORY",
        explanation:
          "The policy states compliance is mandatory and 'forms part of all employment " +
          "and contractor agreements'. This extends the scope of the policy beyond " +
          "information asset access and into employment law and contracting, which is " +
          "not within the scope of ISO 27001:2022 Clauses 5–6 as cited.",
      },
    ],
    recommendation: "REVIEW",
    confidence: "MEDIUM",
    notes:
      "Scope claim is broader than the cited source permits. Advisory issue only; " +
      "does not affect the substantive security policy content.",
  });

  return Object.freeze(submissions);
}

// ---------------------------------------------------------------------------
// createSimulatedReviewSession
// ---------------------------------------------------------------------------

/**
 * Creates a HumanReviewSession containing pre-defined, deterministic reviewer
 * submissions for all six benchmark documents.
 *
 * @param sessionId  Unique identifier for this review session.
 * @param timestamp  UTC ISO-8601 timestamp to record as submission time.
 *                   Pass a fixed value for deterministic test assertions.
 */
export function createSimulatedReviewSession(
  sessionId: string,
  timestamp: string,
): HumanReviewSession {
  const submissions = makeSubmissions(timestamp);
  let session = createReviewSession(sessionId, timestamp);
  for (const submission of submissions) {
    session = addSubmission(session, submission);
  }
  return session;
}
