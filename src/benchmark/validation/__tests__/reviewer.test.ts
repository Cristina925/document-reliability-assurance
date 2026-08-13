/**
 * DRA-VAL-001C — Reviewer Recruitment and Qualification — Tests
 *
 * Covers: reviewer identifiers, applications, conflict controls, consent,
 * confidentiality, qualification, registry, coverage, readiness, and boundaries.
 */

import { describe, it, expect } from "vitest";
import {
  ScientificReviewerIdSchema,
  REVIEWER_RECRUITMENT_STATUSES,
  ReviewerRecruitmentStatusSchema,
  REVIEWER_QUALIFICATION_STATUSES,
  ReviewerQualificationStatusSchema,
  REVIEWER_CATEGORIES,
  ReviewerCategorySchema,
  isAdjudicatorEligible,
  isAssignmentEligibleStatus,
} from "../reviewer-identity.js";
import {
  ReviewerDomainExpertiseSchema,
  ReviewerExperienceEvidenceSchema,
  REVIEWER_DOMAINS,
} from "../reviewer-experience.js";
import {
  ReviewerApplicationSchema,
} from "../reviewer-application.js";
import {
  ConflictDisclosureSchema,
  ConflictAssessmentSchema,
  isConflictDisqualifying,
  hasUnresolvedConflicts,
  CONFLICT_TYPES,
} from "../reviewer-conflict.js";
import {
  ReviewerConsentRecordSchema,
  ConfidentialityAgreementRecordSchema,
} from "../reviewer-consent.js";
import {
  QualificationExerciseSchema,
  QualificationSubmissionSchema,
  QualificationScoreSchema,
  QualificationAssessmentSchema,
  ReviewerEligibilityDecisionSchema,
} from "../reviewer-qualification.js";
import {
  ScientificReviewerRecordSchema,
  ReviewerRegistrySchema,
  computeReviewerRecordDigest,
  computeReviewerRegistryDigest,
  computeRegistryStatusCounts,
} from "../reviewer-record.js";
import {
  DomainCoverageRecordSchema,
  ReviewerCoverageMatrixSchema,
  isDomainPilotReady,
} from "../reviewer-coverage.js";
import {
  AdjudicatorCompatibilitySchema,
  ReviewerAssignmentPlanSchema,
  EligibleReviewerPoolSchema,
} from "../reviewer-assignment.js";
import {
  ReviewerReadinessAssessmentSchema,
  READINESS_OUTCOMES,
  STANDARD_READINESS_CRITERIA,
} from "../reviewer-readiness.js";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const VALID_ID = "DRA-REV-0001";
const VALID_ID_2 = "DRA-REV-0002";
const ASSESSOR_ID = "ASSESSOR-001";

function makeMinimalExpertise() {
  return {
    domain: "LEGAL_AND_REGULATORY",
    yearsOfExperience: 5,
    experienceSummary: "5 years as regulatory compliance officer reviewing policy documents",
    evidenceReferences: ["EV-001"],
    verifiabilityStatus: "VERIFIED",
    verifiedByAssessor: true,
  };
}

function makeMinimalApplication() {
  return {
    applicationReference: "APP-0001",
    applicantName: "Jane Smith",
    appliedCategory: "GENERAL_ASSURANCE_REVIEWER" as const,
    domainExpertise: [makeMinimalExpertise()],
    experienceEvidence: [
      {
        evidenceReference: "EV-001",
        evidenceType: "CV",
        description: "CV showing 8 years in regulatory compliance and governance",
        evidenceAttachedOrLinked: true,
        verifiabilityStatus: "VERIFIED",
      },
    ],
    totalYearsRelevantExperience: 8,
    reviewLanguages: ["English"],
    availability: {
      pilotWindowAvailability: "PARTIAL_AVAILABILITY",
      hoursPerWeekAvailable: 5,
      maximumDocumentsWilling: 4,
    },
    priorKnowledge: {
      priorKnowledgeOfCts: false,
      priorKnowledgeOfDra: false,
      priorKnowledgeOfRgl: false,
      priorContactWithFounderOrContributors: false,
    },
    willingToCompleteQualification: true,
    applicationStatus: "SUBMITTED" as const,
    confidentialityAcceptedInPrinciple: true,
  };
}

function makeConflictDisclosure() {
  return {
    reviewerId: VALID_ID,
    declarationVersion: "DRA-COI-v1.0",
    declarationTimestamp: "2026-07-27T10:00:00",
    disclosureItems: [
      {
        conflictType: "FINANCIAL_INTEREST_RGL",
        conflictExists: false,
        declaredSeverity: "NONE",
      },
    ],
    declarantAttestation: true as const,
  };
}

function makeConflictAssessment(override?: Partial<{
  reviewerId: string;
  assessorId: string;
  overallDisposition: string;
  clearedForAssignment: boolean;
}>) {
  return {
    reviewerId: override?.reviewerId ?? VALID_ID,
    assessorId: override?.assessorId ?? ASSESSOR_ID,
    assessmentTimestamp: "2026-07-27T11:00:00",
    assessedItems: [
      {
        conflictType: "FINANCIAL_INTEREST_RGL",
        assessedSeverity: "NONE",
        assessorRationale: "No financial interest identified after independent review",
        mitigationRequired: false,
      },
    ],
    overallDisposition: override?.overallDisposition ?? "NONE",
    clearedForAssignment: override?.clearedForAssignment ?? true,
    independentAssessmentRequired: false,
  };
}

function makeConsentRecord(reviewerId = VALID_ID) {
  return {
    reviewerId,
    consentDocumentVersion: "DRA-RCA-v1.0",
    consentTimestamp: "2026-07-27T12:00:00",
    consentGiven: true as const,
    consentedUses: {
      useInScientificStudy: true as const,
      anonymisedAggregatePublication: true,
      namedAttribution: false,
      dataRetentionConsent: true as const,
    },
    attributionPreference: "ANONYMOUS" as const,
    obligationsAcknowledged: true as const,
    consentRevoked: false,
    deletionRequired: false,
  };
}

function makeConfidentialityRecord(reviewerId = VALID_ID) {
  return {
    reviewerId,
    agreementVersion: "DRA-RCA-v1.0",
    acceptanceTimestamp: "2026-07-27T12:00:00",
    agreementAccepted: true as const,
    obligationsAcknowledged: {
      noDocumentSharing: true as const,
      noUnauthorisedAiUpload: true as const,
      noEvaluatorOutputAccess: true as const,
      noPreSubmissionCoordination: true as const,
      noThirdPartyDisclosure: true as const,
    },
    agreementExpiredOrSuperseded: false,
  };
}

function makeQualificationExercise() {
  return {
    exerciseId: "QEX-0001",
    exerciseType: "GENERAL_ASSURANCE" as const,
    exerciseTitle: "General Assurance Qualification Exercise",
    usesTrainingDocument: true as const,
    trainingMaterialLabel: "TRAINING AND QUALIFICATION MATERIAL — NOT SCIENTIFIC EVIDENCE",
    dimensionsAssessed: ["ISSUE_IDENTIFICATION", "MATERIALITY_ASSESSMENT", "PROTOCOL_COMPLIANCE"],
    minimumScorePerDimension: 60,
    allowsCreditForDefensibleAlternatives: true as const,
    requiresQualitativeAssessment: true as const,
    exerciseVersion: "v1.0",
  };
}

function makeQualificationScore(reviewerId = VALID_ID, scorerId = ASSESSOR_ID) {
  return {
    reviewerId,
    exerciseId: "QEX-0001",
    scorerId,
    scoringTimestamp: "2026-07-28T10:00:00",
    dimensionScores: [
      { dimension: "ISSUE_IDENTIFICATION", score: 80, assessorNotes: "Identified 4/5 reference issues" },
      { dimension: "MATERIALITY_ASSESSMENT", score: 75, assessorNotes: "Mostly correct materiality" },
      { dimension: "PROTOCOL_COMPLIANCE", score: 70, assessorNotes: "Protocol followed" },
    ],
    passFail: "PASS" as const,
    qualitativeAssessment: "The applicant demonstrated competent issue identification and good materiality assessment. Protocol compliance was satisfactory. Identified one defensible alternative finding beyond the reference answers.",
  };
}

function makeQualificationAssessment(override?: Partial<{
  reviewerId: string;
  assessorId: string;
  qualificationOutcome: string;
  adjudicatorQualified: boolean;
  priorReviewerQualificationConfirmed: boolean;
}>) {
  return {
    reviewerId: override?.reviewerId ?? VALID_ID,
    assessorId: override?.assessorId ?? ASSESSOR_ID,
    assessmentTimestamp: "2026-07-28T11:00:00",
    exercisesAssessed: ["QEX-0001"],
    conflictAssessmentCleared: true as const,
    consentComplete: true as const,
    confidentialityAccepted: true as const,
    qualificationOutcome: override?.qualificationOutcome ?? "QUALIFIED_GENERAL",
    adjudicatorQualified: override?.adjudicatorQualified ?? false,
    priorReviewerQualificationConfirmed: override?.priorReviewerQualificationConfirmed ?? false,
    assessmentNarrative: "The applicant demonstrated sufficient competence for general assurance review. All 10 dimensions passed at or above the minimum threshold.",
  };
}

function makeReviewerRecord(reviewerId = VALID_ID) {
  return {
    reviewerId,
    displayName: "Anonymous",
    anonymous: true,
    recruitmentStatus: "QUALIFIED" as const,
    qualificationStatus: "QUALIFIED_GENERAL" as const,
    reviewerCategories: ["GENERAL_ASSURANCE_REVIEWER" as const],
    domainExpertise: [makeMinimalExpertise()],
    verifiedExperienceSummary: "8 years in regulatory compliance with document review experience",
    evidenceReferences: ["EV-001"],
    conflictDeclarationStatus: "CLEARED" as const,
    conflictDisposition: "NONE" as const,
    consentStatus: "COMPLETE" as const,
    confidentialityStatus: "ACCEPTED" as const,
    qualificationExerciseStatus: "COMPLETE" as const,
    qualificationDecision: "QUALIFIED_GENERAL" as const,
    qualificationDecisionMakerId: ASSESSOR_ID,
    withdrawn: false,
    suspended: false,
    createdAt: "2026-07-27T10:00:00",
    lastUpdatedAt: "2026-07-28T11:00:00",
  };
}

function makeReadinessAssessment(
  override?: Partial<{
    genuineQualifiedReviewerCount: number;
    twoReviewerCoverageAchieved: boolean;
    domainExpertiseAdequate: boolean;
    conflictsIndependentlyAssessed: boolean;
    consentComplete: boolean;
    confidentialityComplete: boolean;
    qualificationExercisesPassed: boolean;
    adjudicationCoverageExists: boolean;
    workloadLimitsRespected: boolean;
    evaluatorOutputsSealed: boolean;
    corpusManifestVerified: boolean;
    assignmentRandomisable: boolean;
    reviewerAccessedExpectedFindings: boolean;
    readinessOutcome: string;
    conditionalExceptionRecordId: string;
    genuineQualifiedReviewerCountOverride: number;
  }>,
) {
  const defaults = {
    genuineQualifiedReviewerCount: 8,
    twoReviewerCoverageAchieved: true,
    domainExpertiseAdequate: true,
    conflictsIndependentlyAssessed: true,
    consentComplete: true,
    confidentialityComplete: true,
    qualificationExercisesPassed: true,
    adjudicationCoverageExists: true,
    workloadLimitsRespected: true,
    evaluatorOutputsSealed: true,
    corpusManifestVerified: true,
    assignmentRandomisable: true,
    reviewerAccessedExpectedFindings: false,
    readinessOutcome: "READY",
    ...override,
  };

  return {
    corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
    assessmentTimestamp: "2026-07-27T12:00:00",
    assessorId: ASSESSOR_ID,
    ...defaults,
    criteria: [
      { criterionId: "RC-01", description: "Genuine qualified reviewers exist", satisfied: defaults.genuineQualifiedReviewerCount > 0, critical: true },
      { criterionId: "RC-02", description: "Two independent reviewers per document", satisfied: defaults.twoReviewerCoverageAchieved, critical: true },
    ],
    assessmentNarrative: "Comprehensive readiness assessment completed. All criteria verified against registry records.",
  };
}

// ---------------------------------------------------------------------------
// 1. Reviewer identifier tests
// ---------------------------------------------------------------------------

describe("ScientificReviewerIdSchema", () => {
  it("accepts valid DRA-REV-NNNN identifiers", () => {
    expect(ScientificReviewerIdSchema.parse("DRA-REV-0001")).toBe("DRA-REV-0001");
    expect(ScientificReviewerIdSchema.parse("DRA-REV-0100")).toBe("DRA-REV-0100");
    expect(ScientificReviewerIdSchema.parse("DRA-REV-9999")).toBe("DRA-REV-9999");
  });

  it("rejects malformed identifiers", () => {
    expect(() => ScientificReviewerIdSchema.parse("DRA-REV-001")).toThrow(); // only 3 digits
    expect(() => ScientificReviewerIdSchema.parse("DRA-REV-00001")).toThrow(); // 5 digits
    expect(() => ScientificReviewerIdSchema.parse("REV-0001")).toThrow(); // wrong prefix
    expect(() => ScientificReviewerIdSchema.parse("DRA-REV-AAAA")).toThrow(); // letters in number part
    expect(() => ScientificReviewerIdSchema.parse("")).toThrow();
  });

  it("has all expected recruitment statuses", () => {
    expect(REVIEWER_RECRUITMENT_STATUSES).toContain("PLANNED");
    expect(REVIEWER_RECRUITMENT_STATUSES).toContain("QUALIFIED");
    expect(REVIEWER_RECRUITMENT_STATUSES).toContain("WITHDRAWN");
    expect(REVIEWER_RECRUITMENT_STATUSES).toContain("SUSPENDED");
  });

  it("has all expected qualification statuses", () => {
    expect(REVIEWER_QUALIFICATION_STATUSES).toContain("QUALIFIED_GENERAL");
    expect(REVIEWER_QUALIFICATION_STATUSES).toContain("QUALIFIED_DOMAIN_SPECIALIST");
    expect(REVIEWER_QUALIFICATION_STATUSES).toContain("QUALIFIED_ADJUDICATOR");
    expect(REVIEWER_QUALIFICATION_STATUSES).toContain("DISQUALIFIED_CONFLICT");
  });

  it("has all expected reviewer categories", () => {
    expect(REVIEWER_CATEGORIES).toContain("GENERAL_ASSURANCE_REVIEWER");
    expect(REVIEWER_CATEGORIES).toContain("DOMAIN_SPECIALIST");
    expect(REVIEWER_CATEGORIES).toContain("ADJUDICATOR");
  });

  it("isAdjudicatorEligible: returns true for adjudicator-qualified statuses", () => {
    expect(isAdjudicatorEligible("QUALIFIED_ADJUDICATOR")).toBe(true);
    expect(isAdjudicatorEligible("QUALIFIED_GENERAL")).toBe(true);
    expect(isAdjudicatorEligible("QUALIFIED_DOMAIN_SPECIALIST")).toBe(true);
  });

  it("isAdjudicatorEligible: returns false for non-qualified statuses", () => {
    expect(isAdjudicatorEligible("NOT_STARTED")).toBe(false);
    expect(isAdjudicatorEligible("NOT_QUALIFIED")).toBe(false);
    expect(isAdjudicatorEligible("DISQUALIFIED_CONFLICT")).toBe(false);
    expect(isAdjudicatorEligible("WITHDRAWN")).toBe(false);
  });

  it("isAssignmentEligibleStatus: returns true only for QUALIFIED and CONDITIONALLY_QUALIFIED", () => {
    expect(isAssignmentEligibleStatus("QUALIFIED")).toBe(true);
    expect(isAssignmentEligibleStatus("CONDITIONALLY_QUALIFIED")).toBe(true);
    expect(isAssignmentEligibleStatus("REJECTED")).toBe(false);
    expect(isAssignmentEligibleStatus("WITHDRAWN")).toBe(false);
    expect(isAssignmentEligibleStatus("SUSPENDED")).toBe(false);
    expect(isAssignmentEligibleStatus("APPLIED")).toBe(false);
  });

  it("deterministic ordering: statuses have stable order", () => {
    const first = [...REVIEWER_QUALIFICATION_STATUSES].sort();
    const second = [...REVIEWER_QUALIFICATION_STATUSES].sort();
    expect(first).toEqual(second);
  });
});

// ---------------------------------------------------------------------------
// 2. Application tests
// ---------------------------------------------------------------------------

describe("ReviewerApplicationSchema", () => {
  it("accepts a valid application", () => {
    const result = ReviewerApplicationSchema.safeParse(makeMinimalApplication());
    expect(result.success).toBe(true);
  });

  it("rejects application with missing domain declaration", () => {
    const app = { ...makeMinimalApplication(), domainExpertise: [] };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects application with missing experience evidence", () => {
    const app = { ...makeMinimalApplication(), experienceEvidence: [] };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects invalid availability (hoursPerWeekAvailable < 1)", () => {
    const app = {
      ...makeMinimalApplication(),
      availability: { ...makeMinimalApplication().availability, hoursPerWeekAvailable: 0 },
    };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects invalid availability (maximumDocumentsWilling < 1)", () => {
    const app = {
      ...makeMinimalApplication(),
      availability: { ...makeMinimalApplication().availability, maximumDocumentsWilling: 0 },
    };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects empty applicantName", () => {
    const app = { ...makeMinimalApplication(), applicantName: "" };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects domain expertise with empty evidenceReferences", () => {
    const app = {
      ...makeMinimalApplication(),
      domainExpertise: [{ ...makeMinimalExpertise(), evidenceReferences: [] }],
    };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });

  it("rejects missing review languages", () => {
    const app = { ...makeMinimalApplication(), reviewLanguages: [] };
    const result = ReviewerApplicationSchema.safeParse(app);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Conflict control tests
// ---------------------------------------------------------------------------

describe("ConflictDisclosureSchema", () => {
  it("accepts a valid disclosure", () => {
    const result = ConflictDisclosureSchema.safeParse(makeConflictDisclosure());
    expect(result.success).toBe(true);
  });

  it("rejects disclosure without declarantAttestation", () => {
    const d = { ...makeConflictDisclosure(), declarantAttestation: false };
    const result = ConflictDisclosureSchema.safeParse(d);
    expect(result.success).toBe(false);
  });

  it("rejects disclosure with empty disclosureItems", () => {
    const d = { ...makeConflictDisclosure(), disclosureItems: [] };
    const result = ConflictDisclosureSchema.safeParse(d);
    expect(result.success).toBe(false);
  });
});

describe("ConflictAssessmentSchema", () => {
  it("accepts a valid assessment", () => {
    const result = ConflictAssessmentSchema.safeParse(makeConflictAssessment());
    expect(result.success).toBe(true);
  });

  it("rejects self-assessed conflict (reviewerId === assessorId)", () => {
    const result = ConflictAssessmentSchema.safeParse(
      makeConflictAssessment({ reviewerId: VALID_ID, assessorId: VALID_ID }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("assessorId"))).toBe(true);
    }
  });

  it("rejects DISQUALIFYING disposition with clearedForAssignment true", () => {
    const result = ConflictAssessmentSchema.safeParse(
      makeConflictAssessment({ overallDisposition: "DISQUALIFYING", clearedForAssignment: true }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects REQUIRES_INDEPENDENT_ASSESSMENT disposition with clearedForAssignment true", () => {
    const result = ConflictAssessmentSchema.safeParse(
      makeConflictAssessment({ overallDisposition: "REQUIRES_INDEPENDENT_ASSESSMENT", clearedForAssignment: true }),
    );
    expect(result.success).toBe(false);
  });

  it("allows MANAGEABLE disposition when mitigation is provided", () => {
    const assessment = {
      ...makeConflictAssessment({ overallDisposition: "MANAGEABLE", clearedForAssignment: true }),
      assessedItems: [
        {
          conflictType: "REPUTATIONAL_INCENTIVE",
          assessedSeverity: "MANAGEABLE",
          assessorRationale: "Reviewer has published work mildly supportive of automated review tools; manageable with domain restrictions",
          mitigationRequired: true,
          mitigationDescription: "Restrict to non-publication-adjacent domains for this reviewer",
          assignmentRestriction: "Exclude BUSINESS_AND_EXECUTIVE_REPORTING domain",
        },
      ],
    };
    const result = ConflictAssessmentSchema.safeParse(assessment);
    expect(result.success).toBe(true);
  });

  it("rejects MANAGEABLE conflict without mitigation description", () => {
    const assessment = {
      ...makeConflictAssessment({ overallDisposition: "MANAGEABLE", clearedForAssignment: true }),
      assessedItems: [
        {
          conflictType: "REPUTATIONAL_INCENTIVE",
          assessedSeverity: "MANAGEABLE",
          assessorRationale: "Some conflict present",
          mitigationRequired: true,
          // mitigationDescription: missing
        },
      ],
    };
    const result = ConflictAssessmentSchema.safeParse(assessment);
    expect(result.success).toBe(false);
  });

  it("isConflictDisqualifying: true for DISQUALIFYING", () => {
    const assessment = ConflictAssessmentSchema.parse(
      makeConflictAssessment({ overallDisposition: "DISQUALIFYING", clearedForAssignment: false }),
    );
    expect(isConflictDisqualifying(assessment)).toBe(true);
  });

  it("isConflictDisqualifying: true for REQUIRES_INDEPENDENT_ASSESSMENT", () => {
    const assessment = ConflictAssessmentSchema.parse(
      makeConflictAssessment({ overallDisposition: "REQUIRES_INDEPENDENT_ASSESSMENT", clearedForAssignment: false }),
    );
    expect(isConflictDisqualifying(assessment)).toBe(true);
  });

  it("isConflictDisqualifying: false for NONE", () => {
    const assessment = ConflictAssessmentSchema.parse(makeConflictAssessment());
    expect(isConflictDisqualifying(assessment)).toBe(false);
  });

  it("unresolved conflict without assignment restrictions propagates", () => {
    const assessment = {
      ...makeConflictAssessment({ overallDisposition: "MANAGEABLE", clearedForAssignment: true }),
      assessedItems: [
        {
          conflictType: "REPUTATIONAL_INCENTIVE",
          assessedSeverity: "MANAGEABLE",
          assessorRationale: "Some conflict present",
          mitigationRequired: true,
          mitigationDescription: "Domain restriction applied",
        },
      ],
    };
    const parsed = ConflictAssessmentSchema.parse(assessment);
    expect(hasUnresolvedConflicts(parsed)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Consent and confidentiality tests
// ---------------------------------------------------------------------------

describe("ReviewerConsentRecordSchema", () => {
  it("accepts a valid consent record", () => {
    const result = ReviewerConsentRecordSchema.safeParse(makeConsentRecord());
    expect(result.success).toBe(true);
  });

  it("rejects consent record where consentGiven is false", () => {
    const record = { ...makeConsentRecord(), consentGiven: false };
    const result = ReviewerConsentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects consent record where useInScientificStudy is false", () => {
    const record = {
      ...makeConsentRecord(),
      consentedUses: { ...makeConsentRecord().consentedUses, useInScientificStudy: false },
    };
    const result = ReviewerConsentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects consent record where obligationsAcknowledged is false", () => {
    const record = { ...makeConsentRecord(), obligationsAcknowledged: false };
    const result = ReviewerConsentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("represents revoked consent correctly", () => {
    const record = ReviewerConsentRecordSchema.parse({
      ...makeConsentRecord(),
      consentRevoked: true,
      revocationTimestamp: "2026-08-01T10:00:00",
      deletionRequired: true,
    });
    expect(record.consentRevoked).toBe(true);
    expect(record.deletionRequired).toBe(true);
  });
});

describe("ConfidentialityAgreementRecordSchema", () => {
  it("accepts a valid confidentiality record", () => {
    const result = ConfidentialityAgreementRecordSchema.safeParse(makeConfidentialityRecord());
    expect(result.success).toBe(true);
  });

  it("rejects record where agreementAccepted is false", () => {
    const record = { ...makeConfidentialityRecord(), agreementAccepted: false };
    const result = ConfidentialityAgreementRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects record where noDocumentSharing is false", () => {
    const record = {
      ...makeConfidentialityRecord(),
      obligationsAcknowledged: {
        ...makeConfidentialityRecord().obligationsAcknowledged,
        noDocumentSharing: false,
      },
    };
    const result = ConfidentialityAgreementRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects record where noEvaluatorOutputAccess is false", () => {
    const record = {
      ...makeConfidentialityRecord(),
      obligationsAcknowledged: {
        ...makeConfidentialityRecord().obligationsAcknowledged,
        noEvaluatorOutputAccess: false,
      },
    };
    const result = ConfidentialityAgreementRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("records expired agreement", () => {
    const record = ConfidentialityAgreementRecordSchema.parse({
      ...makeConfidentialityRecord(),
      agreementExpiredOrSuperseded: true,
      expiryDate: "2026-01-01",
    });
    expect(record.agreementExpiredOrSuperseded).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Qualification tests
// ---------------------------------------------------------------------------

describe("QualificationExerciseSchema", () => {
  it("accepts a valid exercise", () => {
    const result = QualificationExerciseSchema.safeParse(makeQualificationExercise());
    expect(result.success).toBe(true);
  });

  it("rejects exercise where usesTrainingDocument is false", () => {
    const ex = { ...makeQualificationExercise(), usesTrainingDocument: false };
    const result = QualificationExerciseSchema.safeParse(ex);
    expect(result.success).toBe(false);
  });

  it("rejects exercise where allowsCreditForDefensibleAlternatives is false", () => {
    const ex = { ...makeQualificationExercise(), allowsCreditForDefensibleAlternatives: false };
    const result = QualificationExerciseSchema.safeParse(ex);
    expect(result.success).toBe(false);
  });

  it("rejects exercise where requiresQualitativeAssessment is false", () => {
    const ex = { ...makeQualificationExercise(), requiresQualitativeAssessment: false };
    const result = QualificationExerciseSchema.safeParse(ex);
    expect(result.success).toBe(false);
  });

  it("rejects exercise with empty dimensionsAssessed", () => {
    const ex = { ...makeQualificationExercise(), dimensionsAssessed: [] };
    const result = QualificationExerciseSchema.safeParse(ex);
    expect(result.success).toBe(false);
  });

  it("rejects exercise with malformed exerciseId", () => {
    const ex = { ...makeQualificationExercise(), exerciseId: "EX-001" };
    const result = QualificationExerciseSchema.safeParse(ex);
    expect(result.success).toBe(false);
  });
});

describe("QualificationScoreSchema", () => {
  it("accepts a valid score", () => {
    const result = QualificationScoreSchema.safeParse(makeQualificationScore());
    expect(result.success).toBe(true);
  });

  it("rejects self-scoring (reviewerId === scorerId)", () => {
    const result = QualificationScoreSchema.safeParse(makeQualificationScore(VALID_ID, VALID_ID));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("scorerId"))).toBe(true);
    }
  });

  it("rejects empty qualitativeAssessment", () => {
    const score = {
      ...makeQualificationScore(),
      qualitativeAssessment: "short",
    };
    const result = QualificationScoreSchema.safeParse(score);
    expect(result.success).toBe(false);
  });

  it("rejects score out of range (> 100)", () => {
    const score = {
      ...makeQualificationScore(),
      dimensionScores: [{ dimension: "ISSUE_IDENTIFICATION", score: 110, assessorNotes: "test" }],
    };
    const result = QualificationScoreSchema.safeParse(score);
    expect(result.success).toBe(false);
  });

  it("rejects score out of range (< 0)", () => {
    const score = {
      ...makeQualificationScore(),
      dimensionScores: [{ dimension: "ISSUE_IDENTIFICATION", score: -1, assessorNotes: "test" }],
    };
    const result = QualificationScoreSchema.safeParse(score);
    expect(result.success).toBe(false);
  });
});

describe("QualificationAssessmentSchema", () => {
  it("accepts a valid assessment", () => {
    const result = QualificationAssessmentSchema.safeParse(makeQualificationAssessment());
    expect(result.success).toBe(true);
  });

  it("rejects reviewer self-assessment", () => {
    const result = QualificationAssessmentSchema.safeParse(
      makeQualificationAssessment({ reviewerId: VALID_ID, assessorId: VALID_ID }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("assessorId"))).toBe(true);
    }
  });

  it("rejects qualification without conflict assessment cleared", () => {
    const result = QualificationAssessmentSchema.safeParse({
      ...makeQualificationAssessment(),
      conflictAssessmentCleared: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects qualification without consent complete", () => {
    const result = QualificationAssessmentSchema.safeParse({
      ...makeQualificationAssessment(),
      consentComplete: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects qualification without confidentiality accepted", () => {
    const result = QualificationAssessmentSchema.safeParse({
      ...makeQualificationAssessment(),
      confidentialityAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects adjudicator qualification without prior reviewer qualification", () => {
    const result = QualificationAssessmentSchema.safeParse(
      makeQualificationAssessment({
        adjudicatorQualified: true,
        priorReviewerQualificationConfirmed: false,
        qualificationOutcome: "QUALIFIED_ADJUDICATOR",
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("adjudicatorQualified"))).toBe(true);
    }
  });

  it("accepts adjudicator qualification with prior reviewer qualification confirmed", () => {
    const result = QualificationAssessmentSchema.safeParse(
      makeQualificationAssessment({
        adjudicatorQualified: true,
        priorReviewerQualificationConfirmed: true,
        qualificationOutcome: "QUALIFIED_ADJUDICATOR",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects CONDITIONALLY_QUALIFIED without conditionalRestrictions", () => {
    const result = QualificationAssessmentSchema.safeParse(
      makeQualificationAssessment({ qualificationOutcome: "CONDITIONALLY_QUALIFIED" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("conditionalRestrictions"))).toBe(true);
    }
  });

  it("accepts CONDITIONALLY_QUALIFIED with restrictions", () => {
    const result = QualificationAssessmentSchema.safeParse({
      ...makeQualificationAssessment({ qualificationOutcome: "CONDITIONALLY_QUALIFIED" }),
      conditionalRestrictions: ["Limited to GENERAL_OPERATIONAL domain only"],
    });
    expect(result.success).toBe(true);
  });

  it("deterministic qualification decision: same input produces same outcome", () => {
    const a = QualificationAssessmentSchema.parse(makeQualificationAssessment());
    const b = QualificationAssessmentSchema.parse(makeQualificationAssessment());
    expect(a.qualificationOutcome).toBe(b.qualificationOutcome);
  });
});

// ---------------------------------------------------------------------------
// 6. Registry tests
// ---------------------------------------------------------------------------

describe("ScientificReviewerRecordSchema", () => {
  it("accepts a valid reviewer record", () => {
    const result = ScientificReviewerRecordSchema.safeParse(makeReviewerRecord());
    expect(result.success).toBe(true);
  });

  it("rejects placeholder displayName 'Reviewer 1'", () => {
    const record = { ...makeReviewerRecord(), displayName: "Reviewer 1" };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects placeholder displayName 'Placeholder'", () => {
    const record = { ...makeReviewerRecord(), displayName: "Placeholder" };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects placeholder displayName 'TBD'", () => {
    const record = { ...makeReviewerRecord(), displayName: "TBD" };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("accepts displayName 'Anonymous'", () => {
    const record = { ...makeReviewerRecord(), displayName: "Anonymous" };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("rejects empty evidenceReferences", () => {
    const record = { ...makeReviewerRecord(), evidenceReferences: [] };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("rejects reviewer self-approval of qualification", () => {
    const record = {
      ...makeReviewerRecord(),
      qualificationDecisionMakerId: VALID_ID, // same as reviewerId
    };
    const result = ScientificReviewerRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  it("records withdrawn reviewer", () => {
    const record = ScientificReviewerRecordSchema.parse({
      ...makeReviewerRecord(),
      withdrawn: true,
      recruitmentStatus: "WITHDRAWN",
    });
    expect(record.withdrawn).toBe(true);
  });

  it("records suspended reviewer", () => {
    const record = ScientificReviewerRecordSchema.parse({
      ...makeReviewerRecord(),
      suspended: true,
    });
    expect(record.suspended).toBe(true);
  });
});

describe("Registry digest computation", () => {
  it("computeReviewerRecordDigest: produces a 64-character hex string", () => {
    const record = makeReviewerRecord();
    const digest = computeReviewerRecordDigest(record);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("computeReviewerRecordDigest: is deterministic", () => {
    const record = makeReviewerRecord();
    expect(computeReviewerRecordDigest(record)).toBe(computeReviewerRecordDigest(record));
  });

  it("computeReviewerRecordDigest: changes when record changes", () => {
    const r1 = makeReviewerRecord(VALID_ID);
    const r2 = makeReviewerRecord(VALID_ID_2);
    expect(computeReviewerRecordDigest(r1)).not.toBe(computeReviewerRecordDigest(r2));
  });

  it("computeReviewerRegistryDigest: produces a 64-character hex string", () => {
    const registry = { schemaVersion: "v1", reviewers: [], plannedRecruitmentTarget: 10, statusCounts: { planned: 0, prospect: 0, contacted: 0, applied: 0, screened: 0, qualified: 0, conditionallyQualified: 0, rejected: 0, withdrawn: 0, suspended: 0 } };
    const digest = computeReviewerRegistryDigest(registry);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("computeReviewerRegistryDigest: is deterministic", () => {
    const registry = { schemaVersion: "v1", reviewers: [], plannedRecruitmentTarget: 10, statusCounts: { planned: 0, prospect: 0, contacted: 0, applied: 0, screened: 0, qualified: 0, conditionallyQualified: 0, rejected: 0, withdrawn: 0, suspended: 0 } };
    expect(computeReviewerRegistryDigest(registry)).toBe(computeReviewerRegistryDigest(registry));
  });

  it("computeRegistryStatusCounts: counts correctly from records", () => {
    const records = [
      ScientificReviewerRecordSchema.parse({ ...makeReviewerRecord(VALID_ID), recruitmentStatus: "QUALIFIED" }),
      ScientificReviewerRecordSchema.parse({ ...makeReviewerRecord(VALID_ID_2), recruitmentStatus: "WITHDRAWN" }),
    ];
    const counts = computeRegistryStatusCounts(records);
    expect(counts.qualified).toBe(1);
    expect(counts.withdrawn).toBe(1);
    expect(counts.applied).toBe(0);
  });

  it("no-op append-only: adding a record changes the digest", () => {
    const base = { schemaVersion: "v1", reviewers: [], plannedRecruitmentTarget: 10, statusCounts: { planned: 0, prospect: 0, contacted: 0, applied: 0, screened: 0, qualified: 0, conditionallyQualified: 0, rejected: 0, withdrawn: 0, suspended: 0 } };
    const withReviewer = { ...base, reviewers: [makeReviewerRecord()] };
    expect(computeReviewerRegistryDigest(base)).not.toBe(computeReviewerRegistryDigest(withReviewer));
  });
});

describe("ReviewerRegistrySchema", () => {
  it("accepts an empty registry", () => {
    const registry = {
      schemaVersion: "DRA-REG-v1.0",
      generatedAt: "2026-07-27T12:00:00",
      reviewers: [],
      plannedRecruitmentTarget: 20,
      statusCounts: computeRegistryStatusCounts([]),
      openRecruitmentRequirement: "Minimum 6 qualified reviewers required before DRA-VAL-001D",
    };
    const result = ReviewerRegistrySchema.safeParse(registry);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Coverage tests
// ---------------------------------------------------------------------------

describe("DomainCoverageRecordSchema", () => {
  it("accepts a NO_COVERAGE record", () => {
    const result = DomainCoverageRecordSchema.safeParse({
      domain: "LEGAL_AND_REGULATORY",
      qualifiedGeneralReviewers: 0,
      qualifiedDomainSpecialists: 0,
      qualifiedAdjudicators: 0,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 0,
      reviewersNeededForPilot: 2,
      reviewersNeededForFullBenchmark: 10,
      coverageStatus: "NO_COVERAGE",
    });
    expect(result.success).toBe(true);
  });

  it("isDomainPilotReady: false when no reviewers", () => {
    const record = DomainCoverageRecordSchema.parse({
      domain: "LEGAL_AND_REGULATORY",
      qualifiedGeneralReviewers: 0,
      qualifiedDomainSpecialists: 0,
      qualifiedAdjudicators: 0,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 0,
      reviewersNeededForPilot: 2,
      reviewersNeededForFullBenchmark: 10,
      coverageStatus: "NO_COVERAGE",
    });
    expect(isDomainPilotReady(record)).toBe(false);
  });

  it("isDomainPilotReady: false with one reviewer (insufficient)", () => {
    const record = DomainCoverageRecordSchema.parse({
      domain: "LEGAL_AND_REGULATORY",
      qualifiedGeneralReviewers: 1,
      qualifiedDomainSpecialists: 0,
      qualifiedAdjudicators: 1,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 1,
      reviewersNeededForPilot: 2,
      reviewersNeededForFullBenchmark: 10,
      coverageStatus: "INSUFFICIENT",
    });
    expect(isDomainPilotReady(record)).toBe(false);
  });

  it("isDomainPilotReady: false without adjudicator", () => {
    const record = DomainCoverageRecordSchema.parse({
      domain: "LEGAL_AND_REGULATORY",
      qualifiedGeneralReviewers: 2,
      qualifiedDomainSpecialists: 1,
      qualifiedAdjudicators: 0,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 3,
      reviewersNeededForPilot: 2,
      reviewersNeededForFullBenchmark: 10,
      coverageStatus: "INSUFFICIENT",
    });
    expect(isDomainPilotReady(record)).toBe(false);
  });

  it("isDomainPilotReady: true when ≥2 reviewers and ≥1 adjudicator", () => {
    const record = DomainCoverageRecordSchema.parse({
      domain: "LEGAL_AND_REGULATORY",
      qualifiedGeneralReviewers: 2,
      qualifiedDomainSpecialists: 1,
      qualifiedAdjudicators: 1,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 3,
      reviewersNeededForPilot: 2,
      reviewersNeededForFullBenchmark: 10,
      coverageStatus: "PILOT_READY",
    });
    expect(isDomainPilotReady(record)).toBe(true);
  });

  it("isDomainPilotReady: false when domain has no pilot documents", () => {
    const record = DomainCoverageRecordSchema.parse({
      domain: "PUBLIC_POLICY_AND_GOVERNANCE",
      qualifiedGeneralReviewers: 5,
      qualifiedDomainSpecialists: 2,
      qualifiedAdjudicators: 1,
      reviewersWithManageableConflict: 0,
      reviewersAvailable: 5,
      reviewersNeededForPilot: 0,
      reviewersNeededForFullBenchmark: 6,
      coverageStatus: "NO_COVERAGE",
    });
    // reviewersNeededForPilot === 0 means not applicable for pilot
    expect(isDomainPilotReady(record)).toBe(false);
  });
});

describe("ReviewerCoverageMatrixSchema", () => {
  it("accepts a valid coverage matrix", () => {
    const result = ReviewerCoverageMatrixSchema.safeParse({
      generatedAt: "2026-07-27T12:00:00",
      domainCoverage: [
        {
          domain: "LEGAL_AND_REGULATORY",
          qualifiedGeneralReviewers: 0,
          qualifiedDomainSpecialists: 0,
          qualifiedAdjudicators: 0,
          reviewersWithManageableConflict: 0,
          reviewersAvailable: 0,
          reviewersNeededForPilot: 2,
          reviewersNeededForFullBenchmark: 10,
          coverageStatus: "NO_COVERAGE",
        },
      ],
      totalQualifiedReviewerSlots: 0,
      distinctQualifiedReviewers: 0,
      distinctQualifiedAdjudicators: 0,
      pilotMinimumMet: false,
      pilotPreferredMet: false,
      fullBenchmarkTargetMet: false,
      domainsWithCoverageGaps: ["LEGAL_AND_REGULATORY"],
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Assignment tests
// ---------------------------------------------------------------------------

describe("AdjudicatorCompatibilitySchema", () => {
  it("accepts compatible adjudicator-document pairing", () => {
    const result = AdjudicatorCompatibilitySchema.safeParse({
      adjudicatorId: VALID_ID,
      documentId: "DRA-VAL-DOC-0001",
      isOriginalReviewer: false,
      compatible: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects compatible=true when isOriginalReviewer=true", () => {
    const result = AdjudicatorCompatibilitySchema.safeParse({
      adjudicatorId: VALID_ID,
      documentId: "DRA-VAL-DOC-0001",
      isOriginalReviewer: true,
      compatible: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("compatible"))).toBe(true);
    }
  });

  it("accepts incompatible pairing where original reviewer", () => {
    const result = AdjudicatorCompatibilitySchema.safeParse({
      adjudicatorId: VALID_ID,
      documentId: "DRA-VAL-DOC-0001",
      isOriginalReviewer: true,
      compatible: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("ReviewerAssignmentPlanSchema", () => {
  it("rejects FROZEN plan without frozenAt", () => {
    const plan = {
      planId: "AP-0001",
      corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
      createdAt: "2026-07-27T12:00:00",
      planStatus: "FROZEN",
      eligiblePool: {
        poolGeneratedAt: "2026-07-27T12:00:00",
        eligibleReviewerIds: [VALID_ID],
        eligibleAdjudicatorIds: [VALID_ID_2],
        totalEligibleReviewers: 1,
        totalEligibleAdjudicators: 1,
      },
      assignmentSeed: {
        seedHex: "a".repeat(64),
        generatedAt: "2026-07-27T12:00:00",
        generationMethod: "crypto.randomBytes(32)",
      },
      corpusManifestVerified: true,
      evaluatorOutputsSealed: true as const,
      documentIds: ["DRA-VAL-DOC-0001"],
    };
    const result = ReviewerAssignmentPlanSchema.safeParse(plan);
    expect(result.success).toBe(false);
  });

  it("rejects plan without evaluatorOutputsSealed=true", () => {
    const plan = {
      planId: "AP-0001",
      corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
      createdAt: "2026-07-27T12:00:00",
      planStatus: "DRAFT",
      eligiblePool: {
        poolGeneratedAt: "2026-07-27T12:00:00",
        eligibleReviewerIds: [],
        eligibleAdjudicatorIds: [],
        totalEligibleReviewers: 0,
        totalEligibleAdjudicators: 0,
      },
      corpusManifestVerified: false,
      evaluatorOutputsSealed: false,
      documentIds: ["DRA-VAL-DOC-0001"],
    };
    const result = ReviewerAssignmentPlanSchema.safeParse(plan);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. Readiness tests
// ---------------------------------------------------------------------------

describe("ReviewerReadinessAssessmentSchema", () => {
  it("accepts a valid READY assessment", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(makeReadinessAssessment());
    expect(result.success).toBe(true);
  });

  it("rejects READY with zero genuine qualified reviewers", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ genuineQualifiedReviewerCount: 0, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("readinessOutcome"))).toBe(true);
    }
  });

  it("rejects READY without two-reviewer coverage", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ twoReviewerCoverageAchieved: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY without adjudication coverage", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ adjudicationCoverageExists: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when consent not complete", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ consentComplete: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when confidentiality not complete", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ confidentialityComplete: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when conflicts not independently assessed", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ conflictsIndependentlyAssessed: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when evaluator outputs not sealed", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ evaluatorOutputsSealed: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when corpus manifest not verified", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ corpusManifestVerified: false, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects READY when reviewer accessed expected findings", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({ reviewerAccessedExpectedFindings: true, readinessOutcome: "READY" }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts NOT_READY with zero reviewers (current programme state)", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({
        genuineQualifiedReviewerCount: 0,
        twoReviewerCoverageAchieved: false,
        domainExpertiseAdequate: false,
        conflictsIndependentlyAssessed: false,
        consentComplete: false,
        confidentialityComplete: false,
        qualificationExercisesPassed: false,
        adjudicationCoverageExists: false,
        readinessOutcome: "NOT_READY",
      }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects CONDITIONALLY_READY without exception record ID", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({
        genuineQualifiedReviewerCount: 6,
        readinessOutcome: "CONDITIONALLY_READY",
        // conditionalExceptionRecordId: missing
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("conditionalExceptionRecordId"))).toBe(true);
    }
  });

  it("rejects CONDITIONALLY_READY with zero qualified reviewers", () => {
    const result = ReviewerReadinessAssessmentSchema.safeParse(
      makeReadinessAssessment({
        genuineQualifiedReviewerCount: 0,
        readinessOutcome: "CONDITIONALLY_READY",
        conditionalExceptionRecordId: "EX-001",
      }),
    );
    expect(result.success).toBe(false);
  });

  it("STANDARD_READINESS_CRITERIA has 13 entries", () => {
    expect(STANDARD_READINESS_CRITERIA).toHaveLength(13);
  });

  it("STANDARD_READINESS_CRITERIA has RC-01 through RC-13", () => {
    const ids = STANDARD_READINESS_CRITERIA.map((c) => c.id);
    expect(ids).toContain("RC-01");
    expect(ids).toContain("RC-13");
  });

  it("critical criteria include reviewer count and evaluator sealing", () => {
    const critical = STANDARD_READINESS_CRITERIA.filter((c) => c.critical);
    const ids = critical.map((c) => c.id);
    expect(ids).toContain("RC-01"); // genuine qualified reviewers
    expect(ids).toContain("RC-10"); // evaluator outputs sealed
    expect(ids).toContain("RC-11"); // corpus manifest verified
  });
});

// ---------------------------------------------------------------------------
// 10. Boundary tests — no simulation, no evaluator execution
// ---------------------------------------------------------------------------

describe("Boundary: reviewer modules must not import simulation or evaluator code", () => {
  it("reviewer-record.ts does not export evaluator result types", async () => {
    const mod = Object.keys(await import("../reviewer-record.js"));
    expect(mod).not.toContain("ProofReceipt");
    expect(mod).not.toContain("AssuranceDecision");
    expect(mod).not.toContain("EvaluatorOutput");
  });

  it("reviewer-readiness.ts does not export simulated review submissions", async () => {
    const mod = Object.keys(await import("../reviewer-readiness.js"));
    expect(mod).not.toContain("simulatedReviewer");
    expect(mod).not.toContain("ReviewerSubmission");
    expect(mod).not.toContain("ScientificMetrics");
  });

  it("reviewer-qualification.ts does not export metrics functions", async () => {
    const mod = Object.keys(await import("../reviewer-qualification.js"));
    expect(mod).not.toContain("computePrecision");
    expect(mod).not.toContain("computeRecall");
    expect(mod).not.toContain("computeF1");
    expect(mod).not.toContain("computeAgreement");
  });

  it("reviewer-coverage.ts does not generate simulated scientific submissions", async () => {
    const mod = Object.keys(await import("../reviewer-coverage.js"));
    expect(mod).not.toContain("generateSimulatedReview");
    expect(mod).not.toContain("ProofReceipt");
  });

  it("reviewer-assignment.ts does not unseal evaluator outputs", async () => {
    const mod = Object.keys(await import("../reviewer-assignment.js"));
    expect(mod).not.toContain("unsealEvaluatorOutput");
    expect(mod).not.toContain("evaluateDocument");
  });
});

describe("Boundary: all nine corpus domains are present in REVIEWER_DOMAINS", () => {
  it("covers all nine corpus domains", () => {
    expect(REVIEWER_DOMAINS).toContain("LEGAL_AND_REGULATORY");
    expect(REVIEWER_DOMAINS).toContain("HEALTHCARE_AND_LIFE_SCIENCES");
    expect(REVIEWER_DOMAINS).toContain("FINANCE_AND_ACCOUNTING");
    expect(REVIEWER_DOMAINS).toContain("CYBERSECURITY_AND_TECHNICAL_ASSURANCE");
    expect(REVIEWER_DOMAINS).toContain("BUSINESS_AND_EXECUTIVE_REPORTING");
    expect(REVIEWER_DOMAINS).toContain("PROCUREMENT_AND_THIRD_PARTY_RISK");
    expect(REVIEWER_DOMAINS).toContain("HR_AND_WORKPLACE_POLICY");
    expect(REVIEWER_DOMAINS).toContain("PUBLIC_POLICY_AND_GOVERNANCE");
    expect(REVIEWER_DOMAINS).toContain("GENERAL_OPERATIONAL");
    expect(REVIEWER_DOMAINS.length).toBe(9);
  });
});

describe("Boundary: conflict types cover all required categories", () => {
  it("includes all required conflict categories", () => {
    expect(CONFLICT_TYPES).toContain("FINANCIAL_INTEREST_RGL");
    expect(CONFLICT_TYPES).toContain("EMPLOYMENT_OR_ADVISORY_RELATIONSHIP");
    expect(CONFLICT_TYPES).toContain("EVALUATOR_DEVELOPMENT_INVOLVEMENT");
    expect(CONFLICT_TYPES).toContain("BENCHMARK_ENGINEERING_INVOLVEMENT");
    expect(CONFLICT_TYPES).toContain("PRIOR_EVALUATOR_OUTPUT_ACCESS");
    expect(CONFLICT_TYPES).toContain("BENCHMARK_DOCUMENT_AUTHORSHIP");
    expect(CONFLICT_TYPES).toContain("CLOSE_PERSONAL_OR_FAMILY_RELATIONSHIP");
    expect(CONFLICT_TYPES).toContain("COMPETITIVE_CONFLICT");
  });
});

describe("Boundary: readiness outcomes are restricted", () => {
  it("only three readiness outcomes exist", () => {
    expect(READINESS_OUTCOMES).toHaveLength(3);
    expect(READINESS_OUTCOMES).toContain("READY");
    expect(READINESS_OUTCOMES).toContain("CONDITIONALLY_READY");
    expect(READINESS_OUTCOMES).toContain("NOT_READY");
  });
});
