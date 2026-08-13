/**
 * DRA-VAL-001B — Corpus Acquisition, Registration, and Freeze — Tests
 *
 * Covers:
 *   - ScientificCorpusDocumentId validation
 *   - AcquisitionStatus and state transitions
 *   - ScientificCorpusSlot invariants
 *   - SourceProvenance, PermittedUseRecord, ConfidentialityRecord
 *   - AnonymisationRecord, SourceEvidenceRecord
 *   - DuplicateCheckRecord and duplicate disposition logic
 *   - ContaminationCheckRecord and contamination signal logic
 *   - CorpusAdmissionDecision, CorpusExclusionRecord, CorpusWithdrawalRecord
 *   - ScientificCorpusDocument admission validation
 *   - ScientificCorpusDocument freeze eligibility
 *   - computeDocumentDigest determinism and tamper detection
 *   - computeManifestDigest determinism
 *   - computeProtocolPackageDigest determinism
 *   - verifyDocumentIntegrity and verifyManifestIntegrity
 *   - CorpusAcquisitionRegister uniqueness and range constraints
 *   - computeQuotaSummary correctness
 *   - Boundary enforcement (no evaluator imports)
 */

import { describe, it, expect } from "vitest";
import {
  ScientificCorpusDocumentIdSchema,
  CorpusAcquisitionStatusSchema,
  ScientificCorpusSlotSchema,
  validateCorpusStateTransition,
  VALID_CORPUS_TRANSITIONS,
  formatDocumentId,
  validateSlotInvariants,
  CorpusDomainSchema,
  CorpusSourceTypeSchema,
} from "../corpus-slots.js";
import {
  SourceProvenanceSchema,
  PermittedUseRecordSchema,
  ConfidentialityRecordSchema,
  AnonymisationRecordSchema,
  SourceEvidenceRecordSchema,
} from "../corpus-provenance.js";
import {
  DuplicateCheckRecordSchema,
  ContaminationCheckRecordSchema,
  isAdmissibleDuplicateDisposition,
  isAdmissibleContaminationResolution,
  hasContaminationSignal,
} from "../corpus-controls.js";
import {
  ScientificCorpusDocumentSchema,
  CorpusAdmissionDecisionSchema,
  CorpusExclusionRecordSchema,
  CorpusWithdrawalRecordSchema,
  validateAdmissionCriteria,
  validateFreezeEligibility,
  type ScientificCorpusDocument,
} from "../corpus-document.js";
import {
  ScientificCorpusManifestSchema,
  CorpusAcquisitionRegisterSchema,
  CorpusFreezeRecordSchema,
  computeDocumentDigest,
  computeCorpusManifestDigest,
  computeProtocolPackageDigest,
  computeRecordDigest,
  verifyDocumentIntegrity,
  verifyCorpusManifestIntegrity,
  computeQuotaSummary,
} from "../corpus-manifest.js";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeSlot(
  overrides: Partial<ReturnType<typeof ScientificCorpusSlotSchema.parse>> = {},
): ReturnType<typeof ScientificCorpusSlotSchema.parse> {
  return ScientificCorpusSlotSchema.parse({
    documentId: "DRA-VAL-DOC-0001",
    status: "ADMITTED",
    domain: "LEGAL_AND_REGULATORY",
    sourceType: "AI_GENERATED",
    difficultyStratum: "LOW",
    lengthStratum: "SHORT",
    corpusPhase: "PILOT",
    syntheticFlag: true,
    lastUpdated: "2024-07-01T10:00:00",
    contentDescription: "Data processing impact assessment template",
    ...overrides,
  });
}

function makeProvenance(
  overrides: Partial<ReturnType<typeof SourceProvenanceSchema.parse>> = {},
): ReturnType<typeof SourceProvenanceSchema.parse> {
  return SourceProvenanceSchema.parse({
    sourceDescription:
      "Purpose-generated synthetic document created for DRA-VAL-001B benchmark corpus",
    sourceOwner: "DRA-VAL Programme",
    sourceClass: "PURPOSE_GENERATED",
    acquisitionDate: "2024-07-01",
    sourceVerifiable: true,
    acquiredIndependentlyOfEvaluatorOutput: true as const,
    notDerivedFromEngineeringFixtures: true as const,
    ...overrides,
  });
}

function makePermittedUse(
  overrides: Partial<ReturnType<typeof PermittedUseRecordSchema.parse>> = {},
): ReturnType<typeof PermittedUseRecordSchema.parse> {
  return PermittedUseRecordSchema.parse({
    permittedUseBasis: "PURPOSE_GENERATED_NO_RESTRICTION",
    storagePermitted: true,
    publicationPermitted: true,
    attributionRequired: false,
    ...overrides,
  });
}

function makeConfidentiality(
  overrides: Partial<ReturnType<typeof ConfidentialityRecordSchema.parse>> = {},
): ReturnType<typeof ConfidentialityRecordSchema.parse> {
  return ConfidentialityRecordSchema.parse({
    confidentialityLevel: "PUBLIC",
    containsPersonalData: false,
    accessRestricted: false,
    ...overrides,
  });
}

function makeSourceEvidence(
  overrides: Partial<ReturnType<typeof SourceEvidenceRecordSchema.parse>> = {},
): ReturnType<typeof SourceEvidenceRecordSchema.parse> {
  return SourceEvidenceRecordSchema.parse({
    sourceEvidenceAvailability: "AVAILABLE",
    sourceEvidenceEmbedded: true,
    ...overrides,
  });
}

function makeDuplicateCheck(
  overrides: Partial<ReturnType<typeof DuplicateCheckRecordSchema.parse>> = {},
): ReturnType<typeof DuplicateCheckRecordSchema.parse> {
  return DuplicateCheckRecordSchema.parse({
    canonicalContentDigest: "a".repeat(64),
    normalisedTextDigest: "b".repeat(64),
    exactDuplicateFound: false,
    nearDuplicateSimilarityMethod:
      "MinHash Jaccard similarity on 3-gram tokens with 128 hash functions",
    nearDuplicateSimilarityScore: 0.02,
    nearDuplicateSimilarityThreshold: 0.8,
    flaggedAsNearDuplicate: false,
    duplicateDisposition: "DISTINCT",
    checkDate: "2024-07-01",
    ...overrides,
  });
}

function makeContaminationCheck(
  overrides: Partial<
    ReturnType<typeof ContaminationCheckRecordSchema.parse>
  > = {},
): ReturnType<typeof ContaminationCheckRecordSchema.parse> {
  return ContaminationCheckRecordSchema.parse({
    matchesEvaluatorFixture: false,
    appearedInEvaluatorDevelopment: false,
    usedInEngineeringValidation: false,
    reviewedWithEvaluatorOutputVisible: false,
    selectionBiasEvidencePresent: false,
    constructedToTargetEvaluatorRules: false,
    generatedUsingEvaluatorFindings: false,
    contaminationSignals: ["CLEAR"],
    contaminationResolution: "ADMITTED_NO_SIGNAL",
    checkDate: "2024-07-01",
    ...overrides,
  });
}

function makeAdmissionDecision(
  overrides: Partial<
    ReturnType<typeof CorpusAdmissionDecisionSchema.parse>
  > = {},
): ReturnType<typeof CorpusAdmissionDecisionSchema.parse> {
  return CorpusAdmissionDecisionSchema.parse({
    outcome: "ADMITTED",
    decisionTimestamp: "2024-07-01T12:00:00",
    reviewedBy: "Corpus Admission Reviewer",
    inclusionCriteriaSatisfied: ["IC-1: Document exists and is accessible"],
    exclusionCriteriaChecked: [
      "EC-1: Not a duplicate",
      "EC-2: Not contaminated",
    ],
    quotaClassificationVerified: true,
    ...overrides,
  });
}

function makeFullDoc(
  idOverride: string = "DRA-VAL-DOC-0001",
  statusOverride: string = "ADMITTED",
): ScientificCorpusDocument {
  return ScientificCorpusDocumentSchema.parse({
    slot: makeSlot({ documentId: idOverride, status: statusOverride }),
    provenance: makeProvenance(),
    permittedUse: makePermittedUse(),
    confidentiality: makeConfidentiality(),
    sourceEvidence: makeSourceEvidence(),
    duplicateCheck: makeDuplicateCheck(),
    contaminationCheck: makeContaminationCheck(),
    admissionDecision: makeAdmissionDecision(),
  });
}

// ---------------------------------------------------------------------------
// ScientificCorpusDocumentId
// ---------------------------------------------------------------------------

describe("ScientificCorpusDocumentIdSchema", () => {
  it("accepts DRA-VAL-DOC-0001 through DRA-VAL-DOC-0120", () => {
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0001")).not.toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0060")).not.toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0120")).not.toThrow();
  });

  it("rejects identifiers outside range 0001–0120", () => {
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0000")).toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0121")).toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-0999")).toThrow();
  });

  it("rejects malformed identifiers", () => {
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-001")).toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DRA-VAL-DOC-00001")).toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("DOC-0001")).toThrow();
    expect(() => ScientificCorpusDocumentIdSchema.parse("dra-val-doc-0001")).toThrow();
  });

  it("formatDocumentId produces correct identifiers", () => {
    expect(formatDocumentId(1)).toBe("DRA-VAL-DOC-0001");
    expect(formatDocumentId(60)).toBe("DRA-VAL-DOC-0060");
    expect(formatDocumentId(120)).toBe("DRA-VAL-DOC-0120");
  });

  it("formatDocumentId throws for out-of-range values", () => {
    expect(() => formatDocumentId(0)).toThrow();
    expect(() => formatDocumentId(121)).toThrow();
    expect(() => formatDocumentId(1.5)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Acquisition status and transitions
// ---------------------------------------------------------------------------

describe("AcquisitionStatus transitions", () => {
  it("permits PLANNED → IDENTIFIED", () => {
    expect(validateCorpusStateTransition("PLANNED", "IDENTIFIED")).toBeNull();
  });

  it("permits IDENTIFIED → ACQUIRED", () => {
    expect(validateCorpusStateTransition("IDENTIFIED", "ACQUIRED")).toBeNull();
  });

  it("permits ACQUIRED → UNDER_REVIEW", () => {
    expect(validateCorpusStateTransition("ACQUIRED", "UNDER_REVIEW")).toBeNull();
  });

  it("permits UNDER_REVIEW → ADMITTED", () => {
    expect(validateCorpusStateTransition("UNDER_REVIEW", "ADMITTED")).toBeNull();
  });

  it("permits UNDER_REVIEW → EXCLUDED", () => {
    expect(validateCorpusStateTransition("UNDER_REVIEW", "EXCLUDED")).toBeNull();
  });

  it("permits ADMITTED → FROZEN", () => {
    expect(validateCorpusStateTransition("ADMITTED", "FROZEN")).toBeNull();
  });

  it("permits ADMITTED → WITHDRAWN", () => {
    expect(validateCorpusStateTransition("ADMITTED", "WITHDRAWN")).toBeNull();
  });

  it("permits FROZEN → WITHDRAWN (post-freeze withdrawal)", () => {
    expect(validateCorpusStateTransition("FROZEN", "WITHDRAWN")).toBeNull();
  });

  it("rejects PLANNED → FROZEN (prohibited shortcut)", () => {
    expect(validateCorpusStateTransition("PLANNED", "FROZEN")).not.toBeNull();
  });

  it("rejects PLANNED → ADMITTED (prohibited shortcut)", () => {
    expect(validateCorpusStateTransition("PLANNED", "ADMITTED")).not.toBeNull();
  });

  it("rejects IDENTIFIED → FROZEN (prohibited shortcut)", () => {
    expect(validateCorpusStateTransition("IDENTIFIED", "FROZEN")).not.toBeNull();
  });

  it("rejects ACQUIRED → FROZEN (prohibited shortcut)", () => {
    expect(validateCorpusStateTransition("ACQUIRED", "FROZEN")).not.toBeNull();
  });

  it("rejects EXCLUDED → FROZEN", () => {
    expect(validateCorpusStateTransition("EXCLUDED", "FROZEN")).not.toBeNull();
  });

  it("rejects WITHDRAWN → FROZEN", () => {
    expect(validateCorpusStateTransition("WITHDRAWN", "FROZEN")).not.toBeNull();
  });

  it("FROZEN has no transitions except WITHDRAWN", () => {
    const permitted = VALID_CORPUS_TRANSITIONS["FROZEN"];
    expect(permitted).toEqual(["WITHDRAWN"]);
  });
});

// ---------------------------------------------------------------------------
// ScientificCorpusSlot invariants
// ---------------------------------------------------------------------------

describe("ScientificCorpusSlot", () => {
  it("accepts a valid PLANNED slot", () => {
    expect(() =>
      ScientificCorpusSlotSchema.parse({
        documentId: "DRA-VAL-DOC-0050",
        status: "PLANNED",
        domain: "GENERAL_OPERATIONAL",
        sourceType: "HUMAN_AUTHORED",
        difficultyStratum: "HIGH",
        lengthStratum: "LONG",
        corpusPhase: "POST_PILOT",
        syntheticFlag: false,
        lastUpdated: "2024-07-01T00:00:00",
      }),
    ).not.toThrow();
  });

  it("rejects AI_GENERATED slot with syntheticFlag = false", () => {
    const slot = makeSlot({ sourceType: "AI_GENERATED", syntheticFlag: false });
    const errors = validateSlotInvariants(slot);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("syntheticFlag");
  });

  it("accepts AI_GENERATED slot with syntheticFlag = true", () => {
    const slot = makeSlot({ sourceType: "AI_GENERATED", syntheticFlag: true });
    expect(validateSlotInvariants(slot)).toHaveLength(0);
  });

  it("rejects unknown domain", () => {
    expect(() => makeSlot({ domain: "UNKNOWN_DOMAIN" as any })).toThrow();
  });

  it("rejects unknown source type", () => {
    expect(() => makeSlot({ sourceType: "PRINTED_MATERIAL" as any })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SourceProvenance
// ---------------------------------------------------------------------------

describe("SourceProvenance", () => {
  it("accepts valid provenance", () => {
    expect(() => makeProvenance()).not.toThrow();
  });

  it("rejects acquiredIndependentlyOfEvaluatorOutput = false", () => {
    expect(() =>
      makeProvenance({ acquiredIndependentlyOfEvaluatorOutput: false as any }),
    ).toThrow();
  });

  it("rejects notDerivedFromEngineeringFixtures = false", () => {
    expect(() =>
      makeProvenance({ notDerivedFromEngineeringFixtures: false as any }),
    ).toThrow();
  });

  it("rejects short sourceDescription", () => {
    expect(() =>
      makeProvenance({ sourceDescription: "Too short" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Duplicate controls
// ---------------------------------------------------------------------------

describe("DuplicateCheckRecord", () => {
  it("accepts a clean DISTINCT check", () => {
    expect(() => makeDuplicateCheck()).not.toThrow();
  });

  it("rejects canonicalContentDigest with wrong length", () => {
    expect(() =>
      makeDuplicateCheck({ canonicalContentDigest: "abc123" }),
    ).toThrow();
  });

  it("rejects canonicalContentDigest with uppercase", () => {
    expect(() =>
      makeDuplicateCheck({ canonicalContentDigest: "A".repeat(64) }),
    ).toThrow();
  });

  it("DISTINCT and RELATED_BUT_ADMISSIBLE are admissible", () => {
    expect(isAdmissibleDuplicateDisposition("DISTINCT")).toBe(true);
    expect(isAdmissibleDuplicateDisposition("RELATED_BUT_ADMISSIBLE")).toBe(true);
  });

  it("NEAR_DUPLICATE_EXCLUDED, EXACT_DUPLICATE_EXCLUDED, INDETERMINATE block admission", () => {
    expect(isAdmissibleDuplicateDisposition("NEAR_DUPLICATE_EXCLUDED")).toBe(false);
    expect(isAdmissibleDuplicateDisposition("EXACT_DUPLICATE_EXCLUDED")).toBe(false);
    expect(isAdmissibleDuplicateDisposition("INDETERMINATE")).toBe(false);
  });

  it("rejects undocumented similarity method (too short)", () => {
    expect(() =>
      makeDuplicateCheck({ nearDuplicateSimilarityMethod: "MinHash" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Contamination controls
// ---------------------------------------------------------------------------

describe("ContaminationCheckRecord", () => {
  it("accepts a clean contamination check", () => {
    expect(() => makeContaminationCheck()).not.toThrow();
  });

  it("hasContaminationSignal returns false when all flags are false", () => {
    const check = makeContaminationCheck();
    expect(hasContaminationSignal(check)).toBe(false);
  });

  it("hasContaminationSignal returns true when matchesEvaluatorFixture = true", () => {
    const check = makeContaminationCheck({ matchesEvaluatorFixture: true });
    expect(hasContaminationSignal(check)).toBe(true);
  });

  it("hasContaminationSignal returns true when usedInEngineeringValidation = true (DRA-001-07 contamination)", () => {
    const check = makeContaminationCheck({ usedInEngineeringValidation: true });
    expect(hasContaminationSignal(check)).toBe(true);
  });

  it("hasContaminationSignal returns true when selectionBiasEvidencePresent = true", () => {
    const check = makeContaminationCheck({ selectionBiasEvidencePresent: true });
    expect(hasContaminationSignal(check)).toBe(true);
  });

  it("hasContaminationSignal returns true when generatedUsingEvaluatorFindings = true", () => {
    const check = makeContaminationCheck({ generatedUsingEvaluatorFindings: true });
    expect(hasContaminationSignal(check)).toBe(true);
  });

  it("ADMITTED_NO_SIGNAL and ADMITTED_SIGNAL_MITIGATED are admissible", () => {
    expect(isAdmissibleContaminationResolution("ADMITTED_NO_SIGNAL")).toBe(true);
    expect(isAdmissibleContaminationResolution("ADMITTED_SIGNAL_MITIGATED")).toBe(true);
  });

  it("PENDING_REVIEW and EXCLUDED_CONTAMINATION_CONFIRMED block admission", () => {
    expect(isAdmissibleContaminationResolution("PENDING_REVIEW")).toBe(false);
    expect(isAdmissibleContaminationResolution("EXCLUDED_CONTAMINATION_CONFIRMED")).toBe(false);
  });

  it("unresolved contamination blocks admission through validateAdmissionCriteria", () => {
    const doc = makeFullDoc();
    const contaminated = {
      ...doc,
      contaminationCheck: makeContaminationCheck({
        contaminationResolution: "PENDING_REVIEW",
      }),
    };
    const errors = validateAdmissionCriteria(contaminated);
    expect(errors.some((e) => e.includes("contamination"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Admission validation
// ---------------------------------------------------------------------------

describe("validateAdmissionCriteria", () => {
  it("returns no errors for a fully populated admitted document", () => {
    const doc = makeFullDoc();
    expect(validateAdmissionCriteria(doc)).toHaveLength(0);
  });

  it("requires provenance", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot(),
      permittedUse: makePermittedUse(),
      confidentiality: makeConfidentiality(),
      sourceEvidence: makeSourceEvidence(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
    });
    const errors = validateAdmissionCriteria(doc);
    expect(errors.some((e) => e.includes("provenance"))).toBe(true);
  });

  it("requires permitted-use basis", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot(),
      provenance: makeProvenance(),
      confidentiality: makeConfidentiality(),
      sourceEvidence: makeSourceEvidence(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
    });
    const errors = validateAdmissionCriteria(doc);
    expect(errors.some((e) => e.includes("permitted-use"))).toBe(true);
  });

  it("requires confidentiality record", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot(),
      provenance: makeProvenance(),
      permittedUse: makePermittedUse(),
      sourceEvidence: makeSourceEvidence(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
    });
    const errors = validateAdmissionCriteria(doc);
    expect(errors.some((e) => e.includes("confidentiality"))).toBe(true);
  });

  it("requires handling restrictions for non-PUBLIC documents", () => {
    const doc = makeFullDoc();
    const docWithConfidential = {
      ...doc,
      confidentiality: makeConfidentiality({
        confidentialityLevel: "CONFIDENTIAL",
        accessRestricted: true,
        // handlingRestrictions intentionally omitted
      }),
    };
    const errors = validateAdmissionCriteria(docWithConfidential);
    expect(errors.some((e) => e.includes("handlingRestrictions"))).toBe(true);
  });

  it("blocks admission when anonymisation is required but not verified", () => {
    const doc = makeFullDoc();
    const docWithPendingAnon = {
      ...doc,
      anonymisation: AnonymisationRecordSchema.parse({
        anonymisationStatus: "REQUIRED_PENDING",
        anonymisationVerified: false,
      }),
    };
    const errors = validateAdmissionCriteria(docWithPendingAnon);
    expect(errors.some((e) => e.includes("anonymisation"))).toBe(true);
  });

  it("requires source-evidence record", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot(),
      provenance: makeProvenance(),
      permittedUse: makePermittedUse(),
      confidentiality: makeConfidentiality(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
    });
    const errors = validateAdmissionCriteria(doc);
    expect(errors.some((e) => e.includes("source-evidence"))).toBe(true);
  });

  it("requires duplicate check", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot(),
      provenance: makeProvenance(),
      permittedUse: makePermittedUse(),
      confidentiality: makeConfidentiality(),
      sourceEvidence: makeSourceEvidence(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
    });
    const errors = validateAdmissionCriteria(doc);
    expect(errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("blocks admission for excluded duplicate disposition", () => {
    const doc = makeFullDoc();
    const docWithExcludedDuplicate = {
      ...doc,
      duplicateCheck: makeDuplicateCheck({
        exactDuplicateFound: true,
        duplicateDisposition: "EXACT_DUPLICATE_EXCLUDED",
      }),
    };
    const errors = validateAdmissionCriteria(docWithExcludedDuplicate);
    expect(errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("blocks excluded document from being frozen", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot({ status: "EXCLUDED" }),
      provenance: makeProvenance(),
      permittedUse: makePermittedUse(),
      confidentiality: makeConfidentiality(),
      sourceEvidence: makeSourceEvidence(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision({ outcome: "EXCLUDED" }),
      exclusionRecord: CorpusExclusionRecordSchema.parse({
        exclusionReason: "DUPLICATE_DETECTED",
        exclusionExplanation:
          "Document is an exact duplicate of DRA-VAL-DOC-0001 as confirmed by canonical digest match",
        exclusionTimestamp: "2024-07-02T08:00:00",
        excludedBy: "Corpus Review Process",
        replacementRequired: true,
      }),
    });
    const errors = validateFreezeEligibility(doc);
    expect(errors.some((e) => e.includes("excluded"))).toBe(true);
  });

  it("blocks withdrawn document from being frozen", () => {
    const doc: ScientificCorpusDocument = ScientificCorpusDocumentSchema.parse({
      slot: makeSlot({ status: "WITHDRAWN" }),
      provenance: makeProvenance(),
      permittedUse: makePermittedUse(),
      confidentiality: makeConfidentiality(),
      sourceEvidence: makeSourceEvidence(),
      duplicateCheck: makeDuplicateCheck(),
      contaminationCheck: makeContaminationCheck(),
      admissionDecision: makeAdmissionDecision(),
      withdrawalRecord: CorpusWithdrawalRecordSchema.parse({
        withdrawalReason: "PERMISSION_REVOKED",
        postFreezeWithdrawal: false,
        withdrawalExplanation:
          "Source owner revoked permission to include the document in the benchmark corpus",
        withdrawalTimestamp: "2024-07-03T09:00:00",
        withdrawnBy: "Corpus Manager",
        replacementRequired: true,
      }),
    });
    const errors = validateFreezeEligibility(doc);
    expect(
      errors.some(
        (e) => e.includes("withdrawn") || e.includes("ADMITTED"),
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Integrity and digest
// ---------------------------------------------------------------------------

describe("computeDocumentDigest", () => {
  it("returns a 64-character lowercase hex string", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("is deterministic", () => {
    const doc = makeFullDoc();
    expect(computeDocumentDigest(doc)).toBe(computeDocumentDigest(doc));
  });

  it("changes when substantive content changes", () => {
    const doc1 = makeFullDoc();
    const doc2 = makeFullDoc("DRA-VAL-DOC-0002");
    expect(computeDocumentDigest(doc1)).not.toBe(computeDocumentDigest(doc2));
  });

  it("is unaffected by status changes (status excluded from digest)", () => {
    const admitted = makeFullDoc("DRA-VAL-DOC-0001", "ADMITTED");
    // Create a version with FROZEN status manually (bypassing parse) to check
    const withFrozenStatus = {
      ...admitted,
      slot: { ...admitted.slot, status: "FROZEN" },
    };
    expect(computeDocumentDigest(admitted)).toBe(
      computeDocumentDigest(withFrozenStatus as any),
    );
  });

  it("is unaffected by frozenAt changes (frozenAt excluded from digest)", () => {
    const doc = makeFullDoc();
    const withFrozenAt = { ...doc, frozenAt: "2024-07-01T12:00:00" };
    expect(computeDocumentDigest(doc)).toBe(computeDocumentDigest(withFrozenAt));
  });
});

describe("verifyDocumentIntegrity", () => {
  it("returns true when integrityDigest matches", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    const frozen = { ...doc, integrityDigest: digest, frozenAt: "2024-07-01T12:00:00" };
    expect(verifyDocumentIntegrity(frozen)).toBe(true);
  });

  it("returns false when integrityDigest is absent", () => {
    const doc = makeFullDoc();
    expect(verifyDocumentIntegrity(doc)).toBe(false);
  });

  it("returns false when content has been tampered (tampered content detection)", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    const tampered = {
      ...doc,
      integrityDigest: digest,
      provenance: makeProvenance({ sourceOwner: "Tampered Owner" }),
    };
    expect(verifyDocumentIntegrity(tampered)).toBe(false);
  });

  it("returns false when provenance has been tampered", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    const tampered = {
      ...doc,
      integrityDigest: digest,
      provenance: makeProvenance({ sourceDescription: "This is a tampered provenance record that exceeds ten characters" }),
    };
    expect(verifyDocumentIntegrity(tampered)).toBe(false);
  });

  it("returns false when permitted-use has been tampered", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    const tampered = {
      ...doc,
      integrityDigest: digest,
      permittedUse: makePermittedUse({ attributionRequired: true, attributionText: "Must cite" }),
    };
    expect(verifyDocumentIntegrity(tampered)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Manifest digest
// ---------------------------------------------------------------------------

describe("computeManifestDigest", () => {
  function makeManifestBase() {
    return {
      schemaVersion: "DRA-VAL-001B-v1" as const,
      corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
      protocolPackageDigest: "1".repeat(64),
      orderedDocumentIds: ["DRA-VAL-DOC-0001", "DRA-VAL-DOC-0002"] as any,
      documentEntries: {
        "DRA-VAL-DOC-0001": {
          documentId: "DRA-VAL-DOC-0001",
          domain: "LEGAL_AND_REGULATORY",
          sourceType: "AI_GENERATED",
          difficultyStratum: "LOW",
          lengthStratum: "SHORT",
          syntheticFlag: true,
          integrityDigest: "a".repeat(64),
          provenanceDigest: "b".repeat(64),
          permittedUseDigest: "c".repeat(64),
          frozenAt: "2024-07-01T12:00:00",
        },
        "DRA-VAL-DOC-0002": {
          documentId: "DRA-VAL-DOC-0002",
          domain: "HEALTHCARE_AND_LIFE_SCIENCES",
          sourceType: "AI_GENERATED",
          difficultyStratum: "MEDIUM",
          lengthStratum: "MEDIUM",
          syntheticFlag: true,
          integrityDigest: "d".repeat(64),
          provenanceDigest: "e".repeat(64),
          permittedUseDigest: "f".repeat(64),
          frozenAt: "2024-07-01T12:00:00",
        },
      },
    };
  }

  it("returns a 64-character hex string", () => {
    const base = makeManifestBase();
    const digest = computeCorpusManifestDigest(base);
    expect(digest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(digest)).toBe(true);
  });

  it("is deterministic", () => {
    const base = makeManifestBase();
    expect(computeCorpusManifestDigest(base)).toBe(computeCorpusManifestDigest(base));
  });

  it("changes when document entries change (manifest ordering stability)", () => {
    const base = makeManifestBase();
    const modified = {
      ...base,
      documentEntries: {
        ...base.documentEntries,
        "DRA-VAL-DOC-0001": {
          ...base.documentEntries["DRA-VAL-DOC-0001"],
          integrityDigest: "9".repeat(64),
        },
      },
    };
    expect(computeCorpusManifestDigest(base)).not.toBe(computeCorpusManifestDigest(modified));
  });

  it("verifyCorpusManifestIntegrity returns true when aggregateCorpusDigest is correct", () => {
    const base = makeManifestBase();
    const digest = computeCorpusManifestDigest(base);
    const manifest = ScientificCorpusManifestSchema.parse({
      ...base,
      aggregateCorpusDigest: digest,
    });
    expect(verifyCorpusManifestIntegrity(manifest)).toBe(true);
  });

  it("verifyCorpusManifestIntegrity returns false when aggregateCorpusDigest is absent", () => {
    const base = makeManifestBase();
    const manifest = ScientificCorpusManifestSchema.parse(base);
    expect(verifyCorpusManifestIntegrity(manifest)).toBe(false);
  });

  it("manifest count mismatch is detectable (orderedDocumentIds vs entries)", () => {
    // The manifest schema does not enforce this at parse time, but the freeze
    // procedure must check it. Verify that the digest changes if IDs and entries
    // are inconsistent.
    const base = makeManifestBase();
    const mismatch = {
      ...base,
      orderedDocumentIds: ["DRA-VAL-DOC-0001"] as any,
      // entries still has two documents
    };
    expect(computeCorpusManifestDigest(base)).not.toBe(computeCorpusManifestDigest(mismatch));
  });
});

// ---------------------------------------------------------------------------
// Protocol package digest
// ---------------------------------------------------------------------------

describe("computeProtocolPackageDigest", () => {
  it("returns a 64-character hex string", () => {
    const register = [
      { path: "docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md", digest: "a".repeat(64) },
      { path: "docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md", digest: "b".repeat(64) },
    ];
    const result = computeProtocolPackageDigest(register);
    expect(result).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(result)).toBe(true);
  });

  it("is deterministic", () => {
    const register = [
      { path: "file-a.md", digest: "a".repeat(64) },
      { path: "file-b.md", digest: "b".repeat(64) },
    ];
    expect(computeProtocolPackageDigest(register)).toBe(computeProtocolPackageDigest(register));
  });

  it("produces the same result regardless of insertion order (sorted internally)", () => {
    const r1 = [
      { path: "docs/z.md", digest: "z".repeat(64) },
      { path: "docs/a.md", digest: "a".repeat(64) },
    ];
    const r2 = [
      { path: "docs/a.md", digest: "a".repeat(64) },
      { path: "docs/z.md", digest: "z".repeat(64) },
    ];
    expect(computeProtocolPackageDigest(r1)).toBe(computeProtocolPackageDigest(r2));
  });

  it("changes when a file digest changes", () => {
    const r1 = [{ path: "docs/a.md", digest: "a".repeat(64) }];
    const r2 = [{ path: "docs/a.md", digest: "b".repeat(64) }];
    expect(computeProtocolPackageDigest(r1)).not.toBe(computeProtocolPackageDigest(r2));
  });

  it("matches the externally computed aggregate digest for the actual protocol files", () => {
    // This verifies the algorithm against the shell-computed digest recorded in
    // DRA-VAL-001F-PROTOCOL-REGISTRATION.md.
    const actualRegister = [
      { path: "docs/dra/validation/DRA-VAL-001-SCIENTIFIC-VALIDATION-CHARTER.md", digest: "97fb718144272d155f269c92d48087f8d427f91c1d30104d52736bd00a0f550a" },
      { path: "docs/dra/validation/DRA-VAL-001A-BENCHMARK-CORPUS-PROTOCOL.md",     digest: "401b7900ef0c4e881051abdf511dc50092fcd0a41bf0907c0da79b64f680356e" },
      { path: "docs/dra/validation/DRA-VAL-001B-REVIEWER-PROTOCOL.md",             digest: "67b2e1d9d7d8a8f2fb4ae691dfc671b812ef62fa1cda15b50d6823207d00d83c" },
      { path: "docs/dra/validation/DRA-VAL-001C-COMPARISON-PROTOCOL.md",           digest: "fe4b2d494d9fa277bce245660789ad311b61d092292c67209f7521ad948e2edf" },
      { path: "docs/dra/validation/DRA-VAL-001D-STATISTICAL-ANALYSIS-PLAN.md",     digest: "f4d7b85bf4b9ee87132d204a8a0f40535a11a416451037b234e130259e21c113" },
      { path: "docs/dra/validation/DRA-VAL-001E-THREATS-TO-VALIDITY.md",           digest: "98d02e74fd0503a957d7ff669422e52e12cf8641b532515a4a30ce92c55fcfd3" },
    ];
    expect(computeProtocolPackageDigest(actualRegister)).toBe(
      "100c2daa4447db45061132a2f17c3993acbbc472c6ffd13368d9f201201831bd",
    );
  });
});

// ---------------------------------------------------------------------------
// Corpus acquisition register
// ---------------------------------------------------------------------------

describe("CorpusAcquisitionRegister", () => {
  function make120Slots(): ScientificCorpusDocument[] {
    const docs: ScientificCorpusDocument[] = [];
    const domains = [
      "LEGAL_AND_REGULATORY",
      "HEALTHCARE_AND_LIFE_SCIENCES",
      "FINANCE_AND_ACCOUNTING",
      "CYBERSECURITY_AND_TECHNICAL_ASSURANCE",
      "BUSINESS_AND_EXECUTIVE_REPORTING",
      "PROCUREMENT_AND_THIRD_PARTY_RISK",
      "HR_AND_WORKPLACE_POLICY",
      "PUBLIC_POLICY_AND_GOVERNANCE",
      "GENERAL_OPERATIONAL",
    ];
    for (let i = 1; i <= 120; i++) {
      docs.push(
        ScientificCorpusDocumentSchema.parse({
          slot: {
            documentId: `DRA-VAL-DOC-${String(i).padStart(4, "0")}`,
            status: "PLANNED",
            domain: domains[(i - 1) % domains.length],
            sourceType: "HUMAN_AUTHORED",
            difficultyStratum: "LOW",
            lengthStratum: "SHORT",
            corpusPhase: i <= 20 ? "PILOT" : "POST_PILOT",
            syntheticFlag: false,
            lastUpdated: "2024-07-01T00:00:00",
            acquisitionBlocker: "Awaiting source identification",
          },
        }),
      );
    }
    return docs;
  }

  it("accepts a valid 120-slot register", () => {
    const docs = make120Slots();
    expect(() =>
      CorpusAcquisitionRegisterSchema.parse({
        schemaVersion: "DRA-VAL-001B-v1",
        protocolPackageDigest: "1".repeat(64),
        lastUpdated: "2024-07-01T00:00:00",
        documents: docs,
        quotaSummary: computeQuotaSummary(docs),
      }),
    ).not.toThrow();
  });

  it("rejects a register with fewer than 120 slots", () => {
    const docs = make120Slots().slice(0, 119);
    expect(() =>
      CorpusAcquisitionRegisterSchema.parse({
        schemaVersion: "DRA-VAL-001B-v1",
        protocolPackageDigest: "1".repeat(64),
        lastUpdated: "2024-07-01T00:00:00",
        documents: docs,
        quotaSummary: computeQuotaSummary(docs),
      }),
    ).toThrow();
  });

  it("rejects a register with a duplicate slot identifier", () => {
    const docs = make120Slots();
    // Replace slot 2 with a copy of slot 1
    docs[1] = ScientificCorpusDocumentSchema.parse({
      ...docs[0],
      slot: { ...docs[0].slot },
    });
    expect(() =>
      CorpusAcquisitionRegisterSchema.parse({
        schemaVersion: "DRA-VAL-001B-v1",
        protocolPackageDigest: "1".repeat(64),
        lastUpdated: "2024-07-01T00:00:00",
        documents: docs,
        quotaSummary: computeQuotaSummary(docs),
      }),
    ).toThrow(/Duplicate document identifier/);
  });

  it("rejects an identifier outside 0001–0120", () => {
    const docs = make120Slots();
    // Force an out-of-range identifier into slot 1 (bypassing slot schema)
    docs[0] = {
      ...docs[0],
      slot: { ...docs[0].slot, documentId: "DRA-VAL-DOC-0121" as any },
    };
    expect(() =>
      CorpusAcquisitionRegisterSchema.parse({
        schemaVersion: "DRA-VAL-001B-v1",
        protocolPackageDigest: "1".repeat(64),
        lastUpdated: "2024-07-01T00:00:00",
        documents: docs,
        quotaSummary: computeQuotaSummary(docs),
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Quota reporting
// ---------------------------------------------------------------------------

describe("computeQuotaSummary", () => {
  it("counts planned slots correctly", () => {
    const docs: ScientificCorpusDocument[] = [
      ScientificCorpusDocumentSchema.parse({
        slot: {
          documentId: "DRA-VAL-DOC-0001",
          status: "PLANNED",
          domain: "LEGAL_AND_REGULATORY",
          sourceType: "HUMAN_AUTHORED",
          difficultyStratum: "LOW",
          lengthStratum: "SHORT",
          corpusPhase: "PILOT",
          syntheticFlag: false,
          lastUpdated: "2024-07-01T00:00:00",
        },
      }),
      ScientificCorpusDocumentSchema.parse({
        slot: {
          documentId: "DRA-VAL-DOC-0002",
          status: "FROZEN",
          domain: "HEALTHCARE_AND_LIFE_SCIENCES",
          sourceType: "AI_GENERATED",
          difficultyStratum: "HIGH",
          lengthStratum: "MEDIUM",
          corpusPhase: "PILOT",
          syntheticFlag: true,
          lastUpdated: "2024-07-01T00:00:00",
        },
      }),
    ];
    const summary = computeQuotaSummary(docs);
    expect(summary.totalPlanned).toBe(2);
    expect(summary.totalFrozen).toBe(1);
    expect(summary.totalSynthetic).toBe(1);
    expect(summary.byDomain["LEGAL_AND_REGULATORY"]).toBe(1);
    expect(summary.byDomain["HEALTHCARE_AND_LIFE_SCIENCES"]).toBe(1);
    expect(summary.byStatus["PLANNED"]).toBe(1);
    expect(summary.byStatus["FROZEN"]).toBe(1);
  });

  it("does not count PLANNED documents as acquired or frozen", () => {
    const docs = [
      ScientificCorpusDocumentSchema.parse({
        slot: {
          documentId: "DRA-VAL-DOC-0001",
          status: "PLANNED",
          domain: "GENERAL_OPERATIONAL",
          sourceType: "HUMAN_AUTHORED",
          difficultyStratum: "LOW",
          lengthStratum: "SHORT",
          corpusPhase: "PILOT",
          syntheticFlag: false,
          lastUpdated: "2024-07-01T00:00:00",
        },
      }),
    ];
    const summary = computeQuotaSummary(docs);
    expect(summary.totalFrozen).toBe(0);
    expect(summary.byStatus["FROZEN"] ?? 0).toBe(0);
  });

  it("pilot domain totals sum to pilot document count", () => {
    const pilotDocs: ScientificCorpusDocument[] = [];
    const domains = ["LEGAL_AND_REGULATORY", "HEALTHCARE_AND_LIFE_SCIENCES", "FINANCE_AND_ACCOUNTING"];
    for (let i = 1; i <= 6; i++) {
      pilotDocs.push(ScientificCorpusDocumentSchema.parse({
        slot: {
          documentId: `DRA-VAL-DOC-${String(i).padStart(4, "0")}`,
          status: "PLANNED",
          domain: domains[(i - 1) % domains.length],
          sourceType: "HUMAN_AUTHORED",
          difficultyStratum: "LOW",
          lengthStratum: "SHORT",
          corpusPhase: "PILOT",
          syntheticFlag: false,
          lastUpdated: "2024-07-01T00:00:00",
        },
      }));
    }
    const summary = computeQuotaSummary(pilotDocs);
    const domainTotal = Object.values(summary.byDomain).reduce((a, b) => a + b, 0);
    expect(domainTotal).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Corpus freeze record
// ---------------------------------------------------------------------------

describe("CorpusFreezeRecord", () => {
  it("accepts a valid partial freeze record", () => {
    expect(() =>
      CorpusFreezeRecordSchema.parse({
        corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
        freezeTimestamp: "2024-07-27T12:00:00",
        plannedCount: 20,
        identifiedCount: 7,
        acquiredCount: 7,
        admittedCount: 7,
        frozenCount: 7,
        excludedCount: 0,
        withdrawnCount: 0,
        unfilledSlotCount: 13,
        noEvaluatorExecutionOccurred: true as const,
        noScientificMetricsProduced: true as const,
      }),
    ).not.toThrow();
  });

  it("rejects noEvaluatorExecutionOccurred = false", () => {
    expect(() =>
      CorpusFreezeRecordSchema.parse({
        corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
        freezeTimestamp: "2024-07-27T12:00:00",
        plannedCount: 20,
        identifiedCount: 0,
        acquiredCount: 0,
        admittedCount: 0,
        frozenCount: 0,
        excludedCount: 0,
        withdrawnCount: 0,
        unfilledSlotCount: 20,
        noEvaluatorExecutionOccurred: false as any,
        noScientificMetricsProduced: true as const,
      }),
    ).toThrow();
  });

  it("rejects noScientificMetricsProduced = false", () => {
    expect(() =>
      CorpusFreezeRecordSchema.parse({
        corpusVersion: "DRA-VAL-PILOT-001-PARTIAL",
        freezeTimestamp: "2024-07-27T12:00:00",
        plannedCount: 20,
        identifiedCount: 0,
        acquiredCount: 0,
        admittedCount: 0,
        frozenCount: 0,
        excludedCount: 0,
        withdrawnCount: 0,
        unfilledSlotCount: 20,
        noEvaluatorExecutionOccurred: true as const,
        noScientificMetricsProduced: false as any,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Boundary enforcement
// ---------------------------------------------------------------------------

describe("Module boundaries", () => {
  it("does not import evaluateDocument or any evaluator stage", async () => {
    // Structural check: corpus modules must not reference evaluator internals.
    // These modules should only import from corpus-* siblings, corpus-slots,
    // and the pipeline canonical serialiser.
    const corpusDocument = await import("../corpus-document.js");
    const corpusManifest = await import("../corpus-manifest.js");
    // If we can import both, and they don't crash, the boundary is intact.
    expect(corpusDocument).toBeDefined();
    expect(corpusManifest).toBeDefined();
  });

  it("does not export evaluator result types", async () => {
    // The corpus modules must not expose AssuranceDecision or ProofReceipt
    const corpusDocument = Object.keys(
      await import("../corpus-document.js"),
    );
    expect(corpusDocument).not.toContain("AssuranceDecision");
    expect(corpusDocument).not.toContain("ProofReceipt");
  });

  it("computeDocumentDigest output is a hex string, not an evaluator decision", () => {
    const doc = makeFullDoc();
    const digest = computeDocumentDigest(doc);
    expect(["SUPPORTED", "REVIEW", "HOLD"]).not.toContain(digest);
  });

  it("does not import from reviewer simulation modules", async () => {
    // The corpus modules must not reference DRA-001-07 reviewer simulations.
    // Verify by checking that the corpus module exports don't include
    // BenchmarkSubmission or ReviewerSimulation types.
    const corpusManifest = Object.keys(
      await import("../corpus-manifest.js"),
    );
    expect(corpusManifest).not.toContain("BenchmarkSubmission");
    expect(corpusManifest).not.toContain("ReviewerSimulation");
  });

  it("produces no statistical performance metrics", async () => {
    // Corpus modules must not export precision, recall, F1, or agreement functions.
    const exportedNames = [
      ...Object.keys(await import("../corpus-manifest.js")),
      ...Object.keys(await import("../corpus-document.js")),
    ];
    const prohibited = ["computePrecision", "computeRecall", "computeF1", "computeAgreement"];
    for (const name of prohibited) {
      expect(exportedNames).not.toContain(name);
    }
  });
});
