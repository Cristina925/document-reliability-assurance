/**
 * DRA-ACQ-031 — Phase 1: Next Robustness-Gap Discovery and Candidate
 * Qualification (post-DRA-ENG-024)
 *
 * Proves the reconstructed evidence map, the 8-criterion ranking of
 * remaining unresolved dimensions, the eLegalix re-check record, the
 * candidate register (qualified and rejected alike), the Phase 1
 * qualification verdict, and the Phase 2 proposal recorded in
 * dra-acq-031-next-robustness-gap-discovery.ts.
 *
 * This suite performs no acquisition, freeze, admission, or evaluator
 * execution, and makes no live network calls. It only exercises
 * data-integrity and reasoning invariants over static discovery records
 * built from today's live-source re-verification (recorded as fixed data
 * in the module under test).
 */

import { describe, it, expect } from "vitest";

import {
  PROGRAMME_CONTEXT,
  EVIDENCE_CLASSES,
  RECONSTRUCTED_EVIDENCE_MAP,
  RANKING_CRITERIA_ORDER,
  RANKED_REMAINING_GAPS,
  HIGHEST_VALUE_GAP,
  ELEGALIX_RECHECK,
  OFFICIAL_SOURCE_STATUSES,
  LICENCE_STATUSES,
  SCRIPT_FAMILIES,
  CANDIDATE_QUALIFICATION_OUTCOMES,
  CANDIDATE_REGISTER,
  CANDIDATE_IDS,
  getCandidateById,
  PRIMARY_CANDIDATE_ID,
  ALTERNATE_CANDIDATE_ID,
  REJECTED_CANDIDATE_IDS,
  primaryCandidate,
  alternateCandidate,
  PHASE_1_QUALIFICATION_OUTCOME,
  PHASE_1_QUALIFICATION_RECORD,
  NON_LATIN_SCRIPT_STATUS_AFTER_PHASE_1,
  PHASE_2_CLASSIFICATION_OPTIONS,
  PROPOSED_PHASE_2_SCOPE,
  PHASE_1_PROHIBITED_ACTIONS,
} from "../dra-acq-031-next-robustness-gap-discovery.js";
import { DOMAINS, DOCUMENT_TYPES } from "../../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Part 1 — Programme context and reconstructed evidence map
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Part 1: Programme Context", () => {
  it("records the 32-document corpus size and DRA-DOC-0033 blocked status", () => {
    expect(PROGRAMME_CONTEXT.corpusSizeBeforeThisAcquisition).toBe(32);
    expect(PROGRAMME_CONTEXT.doc0033Status).toMatch(/NOT ADMITTED/);
    expect(PROGRAMME_CONTEXT.doc0033Status).toMatch(/BLOCKED_PENDING_LIVE_SOURCE_REACQUISITION/);
  });

  it("treats the DRA-ENG-024 multi-column closure as closed input, not reopened", () => {
    expect(PROGRAMME_CONTEXT.multiColumnStatus).toMatch(/PARTIALLY_CLOSED/);
    expect(PROGRAMME_CONTEXT.multiColumnStatus).toMatch(/NOT reopened, retuned, or\s+re-engineered/);
  });

  it("PROGRAMME_CONTEXT is frozen", () => {
    expect(Object.isFrozen(PROGRAMME_CONTEXT)).toBe(true);
  });
});

describe("DRA-ACQ-031 — Reconstructed evidence map", () => {
  it("contains a non-trivial set of dimension rows, all frozen", () => {
    expect(RECONSTRUCTED_EVIDENCE_MAP.length).toBeGreaterThanOrEqual(15);
    expect(Object.isFrozen(RECONSTRUCTED_EVIDENCE_MAP)).toBe(true);
    for (const row of RECONSTRUCTED_EVIDENCE_MAP) {
      expect(Object.isFrozen(row)).toBe(true);
      expect(EVIDENCE_CLASSES).toContain(row.evidenceClass);
    }
  });

  it("shows the multi-column row as PARTIALLY_CLOSED (reflecting DRA-ENG-024)", () => {
    const row = RECONSTRUCTED_EVIDENCE_MAP.find((r) => r.dimension === "multi-column layout");
    expect(row).toBeDefined();
    expect(row?.status).toMatch(/PARTIALLY_CLOSED/);
    expect(row?.source).toMatch(/DRA-ENG-024/);
  });

  it("shows the non-Latin-scripts row as PARTIALLY_TESTED with DRA-DOC-0033 still blocked", () => {
    const row = RECONSTRUCTED_EVIDENCE_MAP.find((r) => r.dimension === "non-Latin scripts");
    expect(row).toBeDefined();
    expect(row?.status).toMatch(/PARTIALLY_TESTED/);
    expect(row?.status).toMatch(/CJK/);
    expect(row?.status).toMatch(/blocked/);
  });

  it("has exactly two NOT_TESTED rows: compound/extreme and mixed-language", () => {
    const untested = RECONSTRUCTED_EVIDENCE_MAP.filter((r) => r.evidenceClass === "NOT_TESTED");
    const dimensions = untested.map((r) => r.dimension).sort();
    expect(dimensions).toEqual(
      ["compound/extreme documents (2+ weaknesses combined)", "mixed-language documents (single doc, code-switched)"].sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Ranking against the 8 named criteria
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Part 2: Ranking", () => {
  it("defines exactly the 8 ranking criteria specified for this programme", () => {
    expect(RANKING_CRITERIA_ORDER).toHaveLength(8);
    expect(RANKING_CRITERIA_ORDER).toEqual([
      "MATERIAL_RISK_TO_TRUSTWORTHY_CONSUMPTION",
      "NOVELTY_RELATIVE_TO_CORPUS",
      "LIKELIHOOD_OF_DISTINCT_FAILURE",
      "GROUND_TRUTH_AVAILABILITY",
      "OFFICIAL_SOURCE_AND_LICENSING_SUITABILITY",
      "ACQUISITION_STABILITY",
      "SINGLE_VARIABLE_TESTABILITY",
      "EVIDENTIARY_VALUE_PER_COST",
    ]);
  });

  it("every ranked dimension scores every one of the 8 criteria", () => {
    for (const ranking of RANKED_REMAINING_GAPS) {
      for (const criterion of RANKING_CRITERIA_ORDER) {
        expect(["HIGH", "MEDIUM", "LOW"]).toContain(ranking.scores[criterion]);
      }
      expect(Object.isFrozen(ranking)).toBe(true);
      expect(Object.isFrozen(ranking.scores)).toBe(true);
    }
  });

  it("ranks non-Latin scripts as the #1 remaining gap", () => {
    expect(RANKED_REMAINING_GAPS[0].dimension).toBe("non-Latin scripts (family diversity beyond CJK)");
    expect(HIGHEST_VALUE_GAP).toBe(RANKED_REMAINING_GAPS[0].dimension);
  });

  it("does not rank multi-column layout at all (explicit non-reopening instruction)", () => {
    const dims = RANKED_REMAINING_GAPS.map((r) => r.dimension);
    expect(dims.some((d) => /multi-column/i.test(d))).toBe(false);
  });

  it("ranks compound/extreme below non-Latin scripts, citing the single-variable-testability conflict", () => {
    const compound = RANKED_REMAINING_GAPS.find((r) => /compound\/extreme/.test(r.dimension));
    expect(compound).toBeDefined();
    expect(compound?.scores.SINGLE_VARIABLE_TESTABILITY).toBe("LOW");
    const nonLatinIndex = RANKED_REMAINING_GAPS.findIndex((r) => r.dimension === HIGHEST_VALUE_GAP);
    const compoundIndex = RANKED_REMAINING_GAPS.findIndex((r) => /compound\/extreme/.test(r.dimension));
    expect(nonLatinIndex).toBeLessThan(compoundIndex);
  });
});

// ---------------------------------------------------------------------------
// Part 3 — eLegalix re-check
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Part 3: eLegalix re-check", () => {
  it("records a third confirmed 429 block, distinct from a retry/admission attempt", () => {
    expect(ELEGALIX_RECHECK.result).toMatch(/429/);
    expect(ELEGALIX_RECHECK.method).toMatch(/Single controlled GET/);
    expect(ELEGALIX_RECHECK.interpretation).toMatch(/DRA-ACQ-029 itself is left untouched/);
  });

  it("ELEGALIX_RECHECK is frozen", () => {
    expect(Object.isFrozen(ELEGALIX_RECHECK)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 4/5/6 — Candidate register
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Candidate register", () => {
  it("every candidate uses a valid Domain and DocumentType from the shared schema", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(DOMAINS).toContain(candidate.domain);
      expect(DOCUMENT_TYPES).toContain(candidate.documentType);
      expect(OFFICIAL_SOURCE_STATUSES).toContain(candidate.officialSourceStatus);
      expect(LICENCE_STATUSES).toContain(candidate.licenceStatus);
      expect(SCRIPT_FAMILIES).toContain(candidate.scriptFamily);
      expect(CANDIDATE_QUALIFICATION_OUTCOMES).toContain(candidate.qualificationOutcome);
      expect(Object.isFrozen(candidate)).toBe(true);
    }
  });

  it("CANDIDATE_IDS matches CANDIDATE_REGISTER 1:1, no duplicates", () => {
    expect(CANDIDATE_IDS).toHaveLength(CANDIDATE_REGISTER.length);
    expect(new Set(CANDIDATE_IDS).size).toBe(CANDIDATE_IDS.length);
  });

  it("getCandidateById resolves every registered id and returns undefined for an unknown id", () => {
    for (const id of CANDIDATE_IDS) {
      expect(getCandidateById(id)?.candidateId).toBe(id);
    }
    expect(getCandidateById("DOES_NOT_EXIST")).toBeUndefined();
  });

  it("primary candidate is the Bulgarian edition, byte-stable across two independent fetches", () => {
    const primary = primaryCandidate();
    expect(primary.candidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(primary.scriptFamily).toBe("CYRILLIC_ALPHABETIC");
    expect(primary.qualificationOutcome).toBe("QUALIFIED_PRIMARY");
    expect(primary.repeatFetchStability).toMatch(/byte-identical/);
    expect(primary.licenceStatus).toBe("CC_BY");
    expect(primary.httpStatusObserved).toBe(200);
  });

  it("alternate candidate is the Greek edition, a genuinely different script from the primary", () => {
    const alternate = alternateCandidate();
    expect(alternate.candidateId).toBe(ALTERNATE_CANDIDATE_ID);
    expect(alternate.scriptFamily).toBe("GREEK_ALPHABETIC");
    expect(alternate.qualificationOutcome).toBe("QUALIFIED_ALTERNATE");
    expect(alternate.scriptFamily).not.toBe(primaryCandidate().scriptFamily);
  });

  it("the eLegalix/DRA-DOC-0033 retry candidate is rejected on acquisition-stability grounds, not merit", () => {
    const rejected = getCandidateById("ELEGALIX_DOC0033_RETRY");
    expect(rejected).toBeDefined();
    expect(rejected?.qualificationOutcome).toBe("REJECTED");
    expect(rejected?.rejectionReason).toMatch(/ACQUISITION_UNSTABLE/);
    expect(rejected?.httpStatusObserved).toBe(429);
    expect(REJECTED_CANDIDATE_IDS).toContain("ELEGALIX_DOC0033_RETRY");
  });

  it("does not claim DRA-DOC-0033 is admitted or resolved anywhere in the candidate register", () => {
    for (const candidate of CANDIDATE_REGISTER) {
      expect(candidate.title).not.toMatch(/DRA-DOC-0033.*admitted/i);
    }
  });

  it("each qualified candidate defines PASS/PARTIAL/MATERIAL DEFECT criteria and a novelty statement", () => {
    for (const id of [PRIMARY_CANDIDATE_ID, ALTERNATE_CANDIDATE_ID]) {
      const c = getCandidateById(id);
      expect(c?.passCriterion.length).toBeGreaterThan(10);
      expect(c?.partialCriterion.length).toBeGreaterThan(10);
      expect(c?.materialDefectCriterion.length).toBeGreaterThan(10);
      expect(c?.addsGenuinelyNewEvidence.length).toBeGreaterThan(10);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Phase 1 qualification verdict
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Part 7: Phase 1 qualification verdict", () => {
  it("qualifies exactly one primary and one alternate, matching the candidate register", () => {
    expect(PHASE_1_QUALIFICATION_OUTCOME).toBe("QUALIFIED");
    expect(PHASE_1_QUALIFICATION_RECORD.primaryCandidateId).toBe(PRIMARY_CANDIDATE_ID);
    expect(PHASE_1_QUALIFICATION_RECORD.alternateCandidateId).toBe(ALTERNATE_CANDIDATE_ID);
  });

  it("does not claim DRA-DOC-0034 or any new identifier is created", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.candidateAfter).toMatch(/no DRA-DOC or DRA-FRZ identifier is claimed/);
  });

  it("honestly discloses that abugida/abjad/RTL scripts remain untested by this candidate pair", () => {
    expect(PHASE_1_QUALIFICATION_RECORD.disclosedLimitation).toMatch(/abugida/);
    expect(PHASE_1_QUALIFICATION_RECORD.disclosedLimitation).toMatch(/DRA-ACQ-029/);
    expect(PHASE_1_QUALIFICATION_RECORD.disclosedLimitation).toMatch(/does not claim/);
  });

  it("status after Phase 1 is qualified-but-not-admitted", () => {
    expect(NON_LATIN_SCRIPT_STATUS_AFTER_PHASE_1).toBe("CANDIDATE_QUALIFIED_NOT_YET_ADMITTED");
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Phase 2 proposal and prohibited actions
// ---------------------------------------------------------------------------

describe("DRA-ACQ-031 — Part 8: Phase 2 proposal", () => {
  it("defines exactly 4 classification options, mirroring the ENG-023 materiality standard", () => {
    expect(PHASE_2_CLASSIFICATION_OPTIONS).toEqual([
      "SCRIPT_GENERALISATION_CONFIRMED",
      "SCRIPT_GENERALISATION_GAP_DEMONSTRATED_MATERIAL",
      "SCRIPT_GENERALISATION_GAP_DEMONSTRATED_NONMATERIAL",
      "INCONCLUSIVE",
    ]);
  });

  it("proposed scope never retries DRA-ACQ-029/eLegalix and never touches reserved identifiers", () => {
    const allSteps = PROPOSED_PHASE_2_SCOPE.steps.join(" ");
    expect(allSteps).toMatch(/Run A\/Run B|substantive-digest equality/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/DRA-FRZ-000027/);
    expect(PROPOSED_PHASE_2_SCOPE.explicitNonGoals.join(" ")).toMatch(/Do not retry the DRA-ACQ-029/);
  });

  it("acceptance criteria define pass, partial, and material-defect outcomes", () => {
    expect(PROPOSED_PHASE_2_SCOPE.acceptanceCriteria.pass.length).toBeGreaterThan(20);
    expect(PROPOSED_PHASE_2_SCOPE.acceptanceCriteria.partial.length).toBeGreaterThan(20);
    expect(PROPOSED_PHASE_2_SCOPE.acceptanceCriteria.materialDefect.length).toBeGreaterThan(20);
  });

  it("prohibited actions explicitly forbid further multi-column engineering and any admission", () => {
    const all = PHASE_1_PROHIBITED_ACTIONS.join(" ");
    expect(all).toMatch(/further multi-column engineering/);
    expect(all).toMatch(/acquiring, freezing, or admitting/);
    expect(all).toMatch(/DRA-DOC-0033/);
  });
});
