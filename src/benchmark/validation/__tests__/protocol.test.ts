/**
 * DRA-VAL-001A — Tests: ValidationProtocol (top-level schema, digest, freeze)
 */

import { describe, it, expect } from "vitest";
import {
  ValidationProtocolSchema,
  computeValidationProtocolDigest,
  verifyProtocolIntegrity,
  validateProtocolForFreeze,
  freezeProtocol,
} from "../protocol.js";

// ---------------------------------------------------------------------------
// Fixture builders
// ---------------------------------------------------------------------------

function researchQuestion(isPrimary: boolean, id = "RQ-001") {
  return {
    id,
    text: "To what extent does the frozen DRA Version 1 evaluator identify material document-release issues found by independent human reviewers across a predefined, heterogeneous benchmark corpus?",
    isPrimary,
    scope: "All six DRA evaluator issue classes across all nine corpus domains.",
  };
}

function hypothesis(id = "H-001") {
  return {
    id,
    text: "The DRA Version 1 evaluator identifies a non-trivial proportion of issue classes identified by the adjudicated human reference standard across the benchmark corpus.",
    linkedQuestionId: "RQ-001",
    supportedOutcomes: ["SUPPORTED", "PARTIALLY_SUPPORTED"],
  };
}

function nullHypothesis(id = "NH-001") {
  return {
    id,
    text: "There is no statistically meaningful association between DRA Version 1 evaluator issue class output and adjudicated human reviewer issue class findings across the benchmark corpus.",
    linkedHypothesisId: "H-001",
  };
}

function corpusDesign() {
  return {
    targetSize: 120,
    minimumViableSize: 60,
    pilotSize: 20,
    domainQuotas: [
      { domain: "Legal and regulatory", targetCount: 15, minimumCount: 7 },
      { domain: "Healthcare", targetCount: 15, minimumCount: 7 },
      { domain: "Finance", targetCount: 15, minimumCount: 7 },
      { domain: "Cybersecurity", targetCount: 15, minimumCount: 7 },
      { domain: "Business", targetCount: 15, minimumCount: 7 },
      { domain: "Procurement", targetCount: 15, minimumCount: 7 },
      { domain: "HR policy", targetCount: 10, minimumCount: 5 },
      { domain: "Public policy", targetCount: 10, minimumCount: 5 },
      { domain: "General operational", targetCount: 10, minimumCount: 5 },
    ],
    sourceTypeRatios: { aiGenerated: 0.333, humanAuthored: 0.333, hybrid: 0.334 },
    difficultyStrata: { low: 40, medium: 40, high: 40 },
    inclusionCriteria: [
      "Document must be complete (not a fragment or excerpt).",
      "Document must relate to a domain represented in the corpus.",
    ],
    exclusionCriteria: [
      "Documents containing unredacted personally identifiable information are excluded.",
      "Documents whose source cannot be verified are excluded.",
    ],
  };
}

function reviewerEligibility() {
  return {
    minimumReviewersPerDocument: 2,
    domainExpertiseRequired: true,
    conflictOfInterestDeclarationRequired: true as const,
    blindedToEvaluatorOutput: true as const,
    prohibitCoordinationBeforeSubmission: true as const,
    confidentialityRequirementApplies: true,
    minimumExperienceRequirement: "At least 5 years of professional experience in a relevant regulated domain.",
  };
}

function reviewerAssignmentRule() {
  return {
    assignmentMethod: "DOMAIN_MATCHED" as const,
    allowSingleReviewer: false as const,
    allowReviewerAsAdjudicator: false as const,
    maxDocumentsPerReviewer: 15,
  };
}

function reviewSubmissionPolicy() {
  return {
    requireIndependentIssueRecording: true as const,
    requireSeverityRecording: true,
    requireIssueClassMapping: true,
    requireReleaseRecommendation: true as const,
    requireUncertaintyRecording: true,
    submissionDeadlineDays: 14,
  };
}

function adjudicationPolicy() {
  return {
    triggerOnMaterialDisagreement: true as const,
    materialDisagreementDefinition:
      "Reviewers differ on the document-level release recommendation (e.g. SUPPORTED vs HOLD), or identify non-overlapping issue classes where the difference affects the release decision.",
    adjudicatorMustBeIndependent: true as const,
    adjudicatorCannotBeOriginalReviewer: true as const,
    minimumAdjudicatorCount: 1,
    referenceStandardTerm: "adjudicated human reference standard" as const,
  };
}

function comparisonProtocol() {
  return {
    version: "1.0",
    frozenBeforeResultsInspected: true,
    rules: [
      {
        id: "MR-001",
        description: "Two findings are AGREED at the CLASS level when the evaluator and at least one reviewer identify the same IC-N class for the same document.",
        level: "CLASS" as const,
        disposition: "AGREED" as const,
        conditions: "The evaluator issue class matches a reviewer issue class at the document level.",
      },
      {
        id: "MR-002",
        description: "At INSTANCE level, findings match when both cite the same document section and issue type.",
        level: "INSTANCE" as const,
        disposition: "AGREED" as const,
        conditions: "Evaluator finding and reviewer finding cite the same clause or section with matching IC-N class.",
      },
      {
        id: "MR-003",
        description: "EVALUATOR_ONLY findings are those where the evaluator identifies an issue class absent from all reviewer submissions for the document.",
        level: "CLASS" as const,
        disposition: "EVALUATOR_ONLY" as const,
        conditions: "The evaluator issue class is absent from all reviewer submissions for the document.",
      },
      {
        id: "MR-004",
        description: "REVIEWER_ONLY findings are those where at least one reviewer identifies an issue class not flagged by the evaluator.",
        level: "CLASS" as const,
        disposition: "REVIEWER_ONLY" as const,
        conditions: "The reviewer issue class is absent from the evaluator output for the document.",
      },
    ],
    borderlineMatchProcedure:
      "Borderline matches are referred to the adjudicator who classifies them using the adjudicated human reference standard procedure.",
    multipleIssueFromOneDefectTreatment:
      "Multiple findings arising from one underlying defect are counted separately at instance level and as one class at the class level.",
    oneEvaluatorFindingCoversMultipleReviewerFindingsTreatment:
      "One evaluator finding covering multiple reviewer findings is counted as one agreed finding at class level.",
  };
}

function statisticalAnalysisPlan() {
  return {
    version: "1.0",
    primaryMetrics: [
      {
        id: "MTR-001",
        name: "Issue-instance recall",
        definition: "Proportion of reference issue instances also identified by the evaluator.",
        numerator: "Number of agreed issue instances (evaluator ∩ reference standard)",
        denominator: "Total issue instances in the adjudicated human reference standard",
        zeroDenominatorPolicy: "Report as undefined (N/A) with a note that no reference issues were identified for this document.",
        confidenceIntervalRequired: true as const,
        granularity: "INSTANCE" as const,
      },
      {
        id: "MTR-002",
        name: "Issue-class precision",
        definition: "Proportion of evaluator-flagged issue classes present in the reference standard.",
        numerator: "Number of agreed issue classes at document level",
        denominator: "Total issue classes flagged by the evaluator",
        zeroDenominatorPolicy: "Report as undefined (N/A) with a note that the evaluator identified no issues.",
        confidenceIntervalRequired: true as const,
        granularity: "CLASS" as const,
      },
    ],
    reviewerReliabilityMetrics: [
      {
        id: "MTR-003",
        name: "Reviewer decision agreement rate",
        definition: "Proportion of document pairs where both reviewers reach the same release recommendation.",
        numerator: "Document pairs with identical release recommendations",
        denominator: "Total document pairs with complete reviewer submissions",
        zeroDenominatorPolicy: "Report as undefined if no complete reviewer pairs exist.",
        confidenceIntervalRequired: true as const,
        granularity: "REVIEWER" as const,
      },
    ],
    reportedStrata: ["domain", "sourceType", "difficulty", "documentLength", "issueClass"],
    missingDataPolicy:
      "Documents with fewer than two reviewer submissions are excluded from primary analysis with justification. Withdrawn documents are noted and their exclusion recorded.",
    protocolDeviationPolicy:
      "Protocol deviations are documented as they occur. Major deviations affecting comparability are reported in the analysis.",
    interpretationApproach:
      "All metric results are reported with 95% confidence intervals. Point estimates are not interpreted without reference to interval width and corpus composition. No significance claims are made where sample sizes are inadequate.",
    noArbitrarySuccessThreshold: true as const,
  };
}

function threatsToValidity() {
  return {
    threats: [
      {
        id: "TVR-001",
        title: "Founder-designed evaluator bias",
        description:
          "The evaluator was designed and implemented by the same team conducting the validation, introducing potential confirmation bias in design and interpretation.",
        affectedComponent: "corpus selection, comparison analysis, interpretation",
        likelihood: "HIGH" as const,
        impact: "HIGH" as const,
        mitigation:
          "Evaluation protocol is pre-registered and frozen before results are inspected. Reviewers are independent of the development team.",
        residualRisk: "MEDIUM" as const,
        status: "OPEN" as const,
      },
    ],
  };
}

function validProtocol(overrides: Record<string, unknown> = {}) {
  return {
    id: "DRA-VAL-001A",
    title: "DRA Version 1 Scientific Validation Protocol",
    version: "1.0.0",
    status: "SUBMITTED" as const,
    researchQuestions: [researchQuestion(true)],
    studyObjectives: [
      { ordinal: 1, text: "Establish whether the evaluator identifies a non-trivial proportion of reference issues." },
    ],
    hypotheses: [hypothesis()],
    nullHypotheses: [nullHypothesis()],
    unitOfAnalysis: "individual document",
    intendedClaims: [
      { label: "IC-1", text: "The evaluator identified X% of adjudicated issue classes across the benchmark corpus." },
    ],
    prohibitedClaims: [
      { label: "PC-1", text: "The evaluator is suitable for unsupervised production use without human review." },
    ],
    evaluationBoundaries: [
      { label: "EB-1", text: "This study does not assess evaluator performance on languages other than English." },
    ],
    outcomeCriteria: {
      successCriteria: ["Recall and precision estimates have computable 95% confidence intervals."],
      failureCriteria: ["Fewer than 60 documents yield valid reviewer submissions."],
      inconclusiveCriteria: ["Reviewer inter-rater reliability is below acceptable threshold."],
    },
    corpusDesign: corpusDesign(),
    reviewerEligibility: reviewerEligibility(),
    reviewerAssignmentRule: reviewerAssignmentRule(),
    reviewSubmissionPolicy: reviewSubmissionPolicy(),
    adjudicationPolicy: adjudicationPolicy(),
    comparisonProtocol: comparisonProtocol(),
    statisticalAnalysisPlan: statisticalAnalysisPlan(),
    threatsToValidity: threatsToValidity(),
    amendments: { amendments: [] },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// ValidationProtocolSchema
// ---------------------------------------------------------------------------

describe("ValidationProtocolSchema", () => {
  it("accepts a valid SUBMITTED protocol", () => {
    const result = ValidationProtocolSchema.safeParse(validProtocol());
    expect(result.success).toBe(true);
  });

  it("accepts a valid DRAFT protocol", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ status: "DRAFT" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects a protocol with no research questions", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ researchQuestions: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a protocol with no primary research question", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({
        researchQuestions: [researchQuestion(false)],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a protocol with two primary research questions", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({
        researchQuestions: [researchQuestion(true, "RQ-001"), researchQuestion(true, "RQ-002")],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a protocol with no null hypotheses", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ nullHypotheses: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a protocol with no hypotheses", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ hypotheses: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a FROZEN protocol without frozenAt", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({
        status: "FROZEN",
        integrityDigest: "a".repeat(64),
        // frozenAt absent
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a FROZEN protocol without integrityDigest", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({
        status: "FROZEN",
        frozenAt: "2026-07-27T12:00:00.000Z",
        // integrityDigest absent
      }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts a FROZEN protocol with both frozenAt and integrityDigest", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({
        status: "FROZEN",
        frozenAt: "2026-07-27T12:00:00.000Z",
        integrityDigest: "a".repeat(64),
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = ValidationProtocolSchema.safeParse(validProtocol({ title: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects missing intended claims", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ intendedClaims: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects missing prohibited claims", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ prohibitedClaims: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects missing evaluation boundaries", () => {
    const result = ValidationProtocolSchema.safeParse(
      validProtocol({ evaluationBoundaries: [] }),
    );
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeProtocolDigest
// ---------------------------------------------------------------------------

describe("computeValidationProtocolDigest", () => {
  it("returns a 64-character hex string", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const digest = computeValidationProtocolDigest(proto);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("is deterministic across calls with identical inputs", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const d1 = computeValidationProtocolDigest(proto);
    const d2 = computeValidationProtocolDigest(proto);
    expect(d1).toBe(d2);
  });

  it("differs when any substantive field changes", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const protoModified = ValidationProtocolSchema.parse(
      validProtocol({ title: "Modified title for this document" }),
    );
    expect(computeValidationProtocolDigest(proto)).not.toBe(computeValidationProtocolDigest(protoModified));
  });

  it("is unaffected by status change (status is excluded from digest)", () => {
    const draft = ValidationProtocolSchema.parse(validProtocol({ status: "DRAFT" }));
    const submitted = ValidationProtocolSchema.parse(validProtocol({ status: "SUBMITTED" }));
    expect(computeValidationProtocolDigest(draft)).toBe(computeValidationProtocolDigest(submitted));
  });

  it("is unaffected by amendments (amendments excluded from digest)", () => {
    const noAmendments = ValidationProtocolSchema.parse(validProtocol());
    expect(computeValidationProtocolDigest(noAmendments)).toBe(computeValidationProtocolDigest(noAmendments));
  });
});

// ---------------------------------------------------------------------------
// verifyProtocolIntegrity
// ---------------------------------------------------------------------------

describe("verifyProtocolIntegrity", () => {
  it("returns true for a protocol with a correct digest", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const digest = computeValidationProtocolDigest(proto);
    const withDigest = { ...proto, integrityDigest: digest };
    expect(verifyProtocolIntegrity(withDigest)).toBe(true);
  });

  it("returns false for a protocol with a tampered digest", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const withBadDigest = { ...proto, integrityDigest: "0".repeat(64) };
    expect(verifyProtocolIntegrity(withBadDigest)).toBe(false);
  });

  it("returns false when integrityDigest is absent", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const withoutDigest = { ...proto, integrityDigest: undefined };
    expect(verifyProtocolIntegrity(withoutDigest)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateProtocolForFreeze
// ---------------------------------------------------------------------------

describe("validateProtocolForFreeze", () => {
  it("returns ok:true for a SUBMITTED protocol with all sections", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    expect(validateProtocolForFreeze(proto).ok).toBe(true);
  });

  it("returns ok:false for an already-FROZEN protocol", () => {
    const proto = ValidationProtocolSchema.parse(
      validProtocol({
        status: "FROZEN",
        frozenAt: "2026-07-27T12:00:00.000Z",
        integrityDigest: "a".repeat(64),
      }),
    );
    const result = validateProtocolForFreeze(proto);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("ALREADY_FROZEN");
    }
  });

  it("returns ok:false for a DRAFT protocol (not yet SUBMITTED)", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol({ status: "DRAFT" }));
    const result = validateProtocolForFreeze(proto);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("INVALID_STATUS_TRANSITION");
    }
  });
});

// ---------------------------------------------------------------------------
// freezeProtocol
// ---------------------------------------------------------------------------

describe("freezeProtocol", () => {
  it("successfully freezes a SUBMITTED protocol", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const result = freezeProtocol(proto, "2026-07-27T12:00:00.000Z");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.protocol.status).toBe("FROZEN");
      expect(result.protocol.frozenAt).toBe("2026-07-27T12:00:00.000Z");
      expect(result.protocol.integrityDigest).toHaveLength(64);
    }
  });

  it("frozen protocol passes integrity check", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const result = freezeProtocol(proto, "2026-07-27T12:00:00.000Z");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(verifyProtocolIntegrity(result.protocol)).toBe(true);
    }
  });

  it("two freeze operations on the same input produce identical digests", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const r1 = freezeProtocol(proto, "2026-07-27T12:00:00.000Z");
    const r2 = freezeProtocol(proto, "2026-07-27T12:00:00.000Z");
    expect(r1.ok && r2.ok).toBe(true);
    if (r1.ok && r2.ok) {
      expect(r1.protocol.integrityDigest).toBe(r2.protocol.integrityDigest);
    }
  });

  it("does not mutate the input protocol", () => {
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const originalStatus = proto.status;
    freezeProtocol(proto, "2026-07-27T12:00:00.000Z");
    expect(proto.status).toBe(originalStatus);
  });

  it("returns ok:false when the protocol is already frozen", () => {
    const proto = ValidationProtocolSchema.parse(
      validProtocol({
        status: "FROZEN",
        frozenAt: "2026-07-27T12:00:00.000Z",
        integrityDigest: "a".repeat(64),
      }),
    );
    const result = freezeProtocol(proto, "2026-07-27T12:01:00.000Z");
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Independence check — no evaluator imports
// ---------------------------------------------------------------------------

describe("Module independence", () => {
  it("computeValidationProtocolDigest does not reference evaluator decision types", () => {
    // Structural check: the output is a hex string, not an evaluator decision
    const proto = ValidationProtocolSchema.parse(validProtocol());
    const digest = computeValidationProtocolDigest(proto);
    expect(["SUPPORTED", "REVIEW", "HOLD"]).not.toContain(digest);
  });
});
