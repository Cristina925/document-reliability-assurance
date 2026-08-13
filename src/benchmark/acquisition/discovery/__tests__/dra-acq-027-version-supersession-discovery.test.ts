/**
 * DRA-ACQ-027 — Phase 1: Version/Supersession Robustness Candidate
 * Discovery for DRA-DOC-0031
 *
 * Proves the programme context, the current-DRA capability audit, the
 * candidate register (primary, alternate, and rejected candidates with
 * their governance/supersession/material-change evidence), the ranking and
 * Phase 1 qualification outcome, and the Phase 1 scope boundary recorded in
 * dra-acq-027-version-supersession-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from live-source verification performed once, out of band, and
 * recorded as fixed data in the module under test.
 */

import { describe, it, expect } from "vitest";

import {
  PROGRAMME_CONTEXT,
  CAPABILITY_AUDIT,
  LICENCE_STATUSES,
  SELF_DISCLOSURE_STATUSES,
  CHANGE_TYPES,
  MATERIALITY_LEVELS,
  CANDIDATE_REPRESENTATION_OPTIONS,
  QUALIFICATION_OUTCOMES,
  CANDIDATE_REGISTER,
  getCandidateById,
  primaryCandidate,
  alternateCandidate,
  RANKING_CRITERIA_ORDER,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  RANKED_CANDIDATE_IDS,
  PHASE_1_QUALIFICATION_OUTCOME,
  PHASE_1_QUALIFICATION_RECORD,
  RESERVED_NEXT_CORPUS_ID,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
} from "../dra-acq-027-version-supersession-discovery.js";
import { DOMAINS, DOCUMENT_TYPES, CorpusIdSchema } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context
// ---------------------------------------------------------------------------

describe("DRA-ACQ-027 — Part 1: Programme Context", () => {
  it("records the 30-document corpus size before this acquisition", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(30);
  });

  it("frames the central research question as temporal authority, not source authenticity", () => {
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/AUTHENTIC_CURRENT/);
    expect(PROGRAMME_CONTEXT.centralResearchQuestion).toMatch(/AUTHENTIC_SUPERSEDED/);
    expect(PROGRAMME_CONTEXT.distinguishingFromAuthenticity).toMatch(/temporal authority/i);
  });

  it("declares a negative result acceptable", () => {
    expect(PROGRAMME_CONTEXT.negativeResultIsAcceptable).toBe(true);
    expect(PROGRAMME_CONTEXT.negativeResultPolicy).toMatch(/NO_CANDIDATE_MEETS_REQUIREMENTS/);
  });

  it("states the Phase 1 engineering constraint explicitly, including AUTHORITY_EXPIRED", () => {
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/AUTHORITY_EXPIRED/);
    expect(PROGRAMME_CONTEXT.engineeringConstraint).toMatch(/discovery only/i);
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Capability audit
// ---------------------------------------------------------------------------

describe("DRA-ACQ-027 — Part 2: Current DRA Capability Audit", () => {
  it("confirms no field propagates version/supersession information into evaluation, authority, or receipts", () => {
    for (const finding of [
      CAPABILITY_AUDIT.versionOrRevisionField,
      CAPABILITY_AUDIT.supersededWithdrawnReplacedField,
      CAPABILITY_AUDIT.effectiveDateOrCurrentnessField,
    ]) {
      expect(finding.propagatesToAuthorityResolution).toBe(false);
      expect(finding.propagatesToProofReceipt).toBe(false);
    }
  });

  it("confirms no supersession/withdrawal/replaced field exists anywhere in the schema", () => {
    expect(CAPABILITY_AUDIT.supersededWithdrawnReplacedField.existsAnywhere).toBe(false);
  });

  it("confirms publishedAt exists on evaluation input but is dormant for authority currency checks", () => {
    expect(CAPABILITY_AUDIT.effectiveDateOrCurrentnessField.existsAnywhere).toBe(true);
    expect(CAPABILITY_AUDIT.effectiveDateOrCurrentnessField.propagatesToEvaluationInput).toBe(true);
    expect(CAPABILITY_AUDIT.effectiveDateOrCurrentnessField.propagatesToAuthorityResolution).toBe(false);
  });

  it("confirms CorpusDocumentInput has no date field of any kind", () => {
    expect(CAPABILITY_AUDIT.freezeRecordDateFields.corpusDocumentInputHasAnyDateField).toBe(false);
  });

  it("confirms the six-value authority-classification enum has no temporal/currency value", () => {
    expect(CAPABILITY_AUDIT.authorityClassificationEnum.values).toHaveLength(6);
    expect(CAPABILITY_AUDIT.authorityClassificationEnum.hasTemporalOrCurrencyValue).toBe(false);
  });

  it("confirms no AUTHORITY_EXPIRED-equivalent issue class exists", () => {
    expect(CAPABILITY_AUDIT.authorityExpiredIssueClass.exists).toBe(false);
  });

  it("concludes the capability gap is real and not currently producible without a code change", () => {
    expect(CAPABILITY_AUDIT.theoreticalRepresentability.couldArchitectureRepresentSupersessionInPrinciple).toBe(true);
    expect(CAPABILITY_AUDIT.theoreticalRepresentability.conclusion).toMatch(/NOT PRODUCIBLE/);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Candidate register integrity
// ---------------------------------------------------------------------------

describe("DRA-ACQ-027 — Part 3: Candidate Register Integrity", () => {
  it("registers exactly three seriously-investigated candidates", () => {
    expect(CANDIDATE_REGISTER).toHaveLength(3);
  });

  it("gives every candidate a unique candidateId matching the DRA-CAND-027-NN pattern", () => {
    const ids = CANDIDATE_REGISTER.map((c) => c.candidateId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^DRA-CAND-027-\d{2}$/);
  });

  it("uses only valid Domain and DocumentType enum values", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.domain);
      expect(DOCUMENT_TYPES).toContain(candidate.documentType);
    }
  });

  it("uses only valid licence, self-disclosure, and qualification-outcome enum values", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(LICENCE_STATUSES).toContain(candidate.licenceStatus);
      expect(SELF_DISCLOSURE_STATUSES).toContain(candidate.selfDisclosureStatus);
      expect(QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
    }
  });

  it("gives every version difference record a valid changeType and materiality level", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      for (const diff of candidate.versionDifferences) {
        expect(CHANGE_TYPES).toContain(diff.changeType);
        expect(MATERIALITY_LEVELS).toContain(diff.materiality);
      }
    }
  });

  it("requires every rejected candidate to carry a non-null rejectionReason, and every non-rejected candidate to carry null", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome.startsWith("REJECTED")) {
        expect(candidate.rejectionReason).not.toBeNull();
      } else {
        expect(candidate.rejectionReason).toBeNull();
      }
    }
  });

  it("requires every QUALIFIED candidate to declare a recommendedRepresentation option", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      if (candidate.qualificationOutcome.startsWith("QUALIFIED")) {
        expect(candidate.recommendedRepresentation).not.toBeNull();
        expect(CANDIDATE_REPRESENTATION_OPTIONS).toContain(candidate.recommendedRepresentation);
      }
    }
  });

  it("requires every candidate to include at least one material change or an explicit editorial/unchanged control", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.versionDifferences.length).toBeGreaterThan(0);
    }
  });

  it("confirms live-verified byte stability for both NIST candidates' old versions", () => {
    const nist1 = getCandidateById("DRA-CAND-027-01")!;
    const nist2 = getCandidateById("DRA-CAND-027-02")!;
    for (const candidate of [nist1, nist2]) {
      const check = candidate.oldVersionByteStability;
      expect(check).not.toBeNull();
      expect(check!.httpStatus).toBe(200);
      expect(check!.stable).toBe(true);
      expect(check!.sha256Hashes[0]).toBe(check!.sha256Hashes[1]);
      expect(check!.sha256Hashes[0]).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("does not record a byte-stability check for the rejected candidate (never fetched for verification)", () => {
    const rejected = getCandidateById("DRA-CAND-027-03")!;
    expect(rejected.oldVersionByteStability).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Ranking, selection, and Phase 1 outcome
// ---------------------------------------------------------------------------

describe("DRA-ACQ-027 — Part 4: Ranking and Phase 1 Outcome", () => {
  it("orders ranking criteria exactly as specified by the task", () => {
    expect(RANKING_CRITERIA_ORDER[0]).toBe("explicit_supersession_ground_truth");
    expect(RANKING_CRITERIA_ORDER[RANKING_CRITERIA_ORDER.length - 1]).toBe("experimental_tractability");
  });

  it("selects the NIST SP 800-53 Rev4/Rev5 pair as primary and CSF 1.1/2.0 as alternate", () => {
    expect(PRIMARY_CANDIDATE_ID).toBe("DRA-CAND-027-01");
    expect(ALTERNATE_CANDIDATE_ID).toBe("DRA-CAND-027-02");
    expect(REJECTED_CANDIDATE_IDS).toEqual(["DRA-CAND-027-03"]);
    expect(RANKED_CANDIDATE_IDS).toEqual([PRIMARY_CANDIDATE_ID, ALTERNATE_CANDIDATE_ID, ...REJECTED_CANDIDATE_IDS]);
  });

  it("marks the primary candidate QUALIFIED_RECOMMENDED and the alternate QUALIFIED_ALTERNATE", () => {
    expect(primaryCandidate().qualificationOutcome).toBe("QUALIFIED_RECOMMENDED");
    expect(alternateCandidate().qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
  });

  it("verifies the primary candidate isolates temporal currentness (external-only supersession disclosure)", () => {
    expect(primaryCandidate().selfDisclosureStatus).toBe("SUPERSESSION_ONLY_DISCOVERABLE_EXTERNALLY");
  });

  it("verifies the rejected candidate's self-disclosure status is the weaker, in-band-flagged variant", () => {
    const rejected = getCandidateById("DRA-CAND-027-03")!;
    expect(rejected.selfDisclosureStatus).toBe("OLD_VERSION_SELF_DISCLOSES_SUPERSESSION");
  });

  it("reuses DRA-DOC-0030 as the current-version comparison ground truth for the primary candidate", () => {
    expect(primaryCandidate().currentVersionAlreadyInCorpus).toMatch(/DRA-DOC-0030/);
    expect(primaryCandidate().recommendedRepresentation).toBe(
      "CURRENT_DOCUMENT_WITH_OLD_VERSION_COMPARISON_GROUND_TRUTH",
    );
  });

  it("records a QUALIFIED_CANDIDATE_SELECTED Phase 1 outcome consistent with the candidate register", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED_CANDIDATE_SELECTED");
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.alternateCandidateId).toBe(ALTERNATE_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.capabilityGapConfirmed).toBe(true);
  });

  it("reserves DRA-DOC-0031 as a syntactically valid, never-yet-used corpus ID", () => {
    expect(CorpusIdSchema.safeParse(RESERVED_NEXT_CORPUS_ID).success).toBe(true);
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0031");
  });

  it("scopes Phase 2 to acquisition/evaluation/comparison only, deferring any engineering fix", () => {
    expect(PROPOSED_PHASE_2_SCOPE.length).toBeGreaterThan(0);
    const joined = PROPOSED_PHASE_2_SCOPE.join(" ");
    expect(joined).toMatch(/DRA-DOC-0031/);
    expect(joined).toMatch(/proposed, not built/);
  });

  it("explicitly prohibits freezing, admitting, starting Phase 2, and every named engineering action", () => {
    expect(PHASE_1_PROHIBITED_ACTIONS).toEqual(
      expect.arrayContaining([
        "freezing_or_admitting_any_candidate_document",
        "beginning_phase_2_acquisition_work",
        "adding_version_or_supersession_metadata_fields",
        "modifying_authority_resolution_logic",
        "activating_or_creating_an_authority_expired_issue_class",
        "modifying_evaluator_semantics_or_issue_taxonomy",
        "changing_the_freeze_schema",
      ]),
    );
  });
});
