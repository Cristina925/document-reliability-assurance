/**
 * DRA-001-06 — ObservationRegister tests
 */

import { describe, it, expect } from "vitest";
import {
  createObservationRegister,
  addObservation,
  getObservationsByType,
  getObservationsForDocument,
  observationCount,
  observationCountByType,
  OBSERVATION_TYPES,
} from "../observations.js";
import type { Observation, ObservationType } from "../observations.js";
import { FIXED_TS, FIXED_REGISTER_ID } from "./fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeObservation(
  id: string,
  type: ObservationType,
  corpusId?: string,
): Observation {
  return {
    observationId: id,
    type,
    corpusId: corpusId as `DRA-DOC-${string}` | undefined,
    description: `Observation ${id}: ${type}`,
    recordedAt: FIXED_TS,
  };
}

function makeObservationWithEvidence(
  id: string,
  type: ObservationType,
): Observation {
  return {
    observationId: id,
    type,
    description: `Observation ${id}: ${type} with evidence`,
    evidence: "Supporting data point here.",
    recordedAt: FIXED_TS,
  };
}

// ---------------------------------------------------------------------------
// createObservationRegister
// ---------------------------------------------------------------------------

describe("createObservationRegister", () => {
  it("creates an empty register", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(register.registerId).toBe(FIXED_REGISTER_ID);
    expect(register.createdAt).toBe(FIXED_TS);
    expect(register.observations).toHaveLength(0);
  });

  it("register is frozen", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(Object.isFrozen(register)).toBe(true);
    expect(Object.isFrozen(register.observations)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addObservation
// ---------------------------------------------------------------------------

describe("addObservation", () => {
  it("appends an observation", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    const obs = makeObservation("obs-1", "STRENGTH");
    const updated = addObservation(register, obs);
    expect(updated.observations).toHaveLength(1);
    expect(updated.observations[0]).toBe(obs);
  });

  it("does not mutate the original register", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    addObservation(register, makeObservation("obs-1", "STRENGTH"));
    expect(register.observations).toHaveLength(0);
  });

  it("supports all five observation types", () => {
    let register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    for (const type of OBSERVATION_TYPES) {
      register = addObservation(register, makeObservation(`obs-${type}`, type));
    }
    expect(register.observations).toHaveLength(5);
  });

  it("preserves optional evidence field", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    const obs = makeObservationWithEvidence("obs-1", "WEAKNESS");
    const updated = addObservation(register, obs);
    expect(updated.observations[0]!.evidence).toBe("Supporting data point here.");
  });

  it("preserves optional corpusId field", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    const obs = makeObservation("obs-1", "AMBIGUOUS_CASE", "DRA-DOC-0001");
    const updated = addObservation(register, obs);
    expect(updated.observations[0]!.corpusId).toBe("DRA-DOC-0001");
  });

  it("updated register is frozen", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    const updated = addObservation(register, makeObservation("obs-1", "STRENGTH"));
    expect(Object.isFrozen(updated)).toBe(true);
    expect(Object.isFrozen(updated.observations)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getObservationsByType
// ---------------------------------------------------------------------------

describe("getObservationsByType", () => {
  it("returns only observations of the specified type", () => {
    let register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    register = addObservation(register, makeObservation("obs-1", "STRENGTH"));
    register = addObservation(register, makeObservation("obs-2", "WEAKNESS"));
    register = addObservation(register, makeObservation("obs-3", "STRENGTH"));

    const strengths = getObservationsByType(register, "STRENGTH");
    expect(strengths).toHaveLength(2);
    expect(strengths.every((o) => o.type === "STRENGTH")).toBe(true);
  });

  it("returns empty array when no observations of that type", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(getObservationsByType(register, "LIMITATION")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getObservationsForDocument
// ---------------------------------------------------------------------------

describe("getObservationsForDocument", () => {
  it("returns only document-specific observations", () => {
    let register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    register = addObservation(register, makeObservation("obs-1", "STRENGTH", "DRA-DOC-0001"));
    register = addObservation(register, makeObservation("obs-2", "WEAKNESS")); // no corpusId
    register = addObservation(register, makeObservation("obs-3", "STRENGTH", "DRA-DOC-0002"));

    const forDoc1 = getObservationsForDocument(register, "DRA-DOC-0001" as `DRA-DOC-${string}`);
    expect(forDoc1).toHaveLength(1);
    expect(forDoc1[0]!.observationId).toBe("obs-1");
  });

  it("returns empty array when no observations for that document", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(
      getObservationsForDocument(register, "DRA-DOC-0099" as `DRA-DOC-${string}`),
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// observationCount and observationCountByType
// ---------------------------------------------------------------------------

describe("observationCount", () => {
  it("returns 0 for empty register", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(observationCount(register)).toBe(0);
  });

  it("returns correct count after additions", () => {
    let register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    register = addObservation(register, makeObservation("obs-1", "STRENGTH"));
    register = addObservation(register, makeObservation("obs-2", "LIMITATION"));
    expect(observationCount(register)).toBe(2);
  });
});

describe("observationCountByType", () => {
  it("returns 0 for type not present", () => {
    const register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    expect(observationCountByType(register, "REVIEWER_DISAGREEMENT")).toBe(0);
  });

  it("returns correct count for a specific type", () => {
    let register = createObservationRegister(FIXED_REGISTER_ID, FIXED_TS);
    register = addObservation(register, makeObservation("obs-1", "WEAKNESS"));
    register = addObservation(register, makeObservation("obs-2", "WEAKNESS"));
    register = addObservation(register, makeObservation("obs-3", "STRENGTH"));
    expect(observationCountByType(register, "WEAKNESS")).toBe(2);
    expect(observationCountByType(register, "STRENGTH")).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// OBSERVATION_TYPES constant
// ---------------------------------------------------------------------------

describe("OBSERVATION_TYPES", () => {
  it("contains exactly 5 types", () => {
    expect(OBSERVATION_TYPES).toHaveLength(5);
  });

  it("contains all expected types", () => {
    expect(OBSERVATION_TYPES).toContain("STRENGTH");
    expect(OBSERVATION_TYPES).toContain("WEAKNESS");
    expect(OBSERVATION_TYPES).toContain("AMBIGUOUS_CASE");
    expect(OBSERVATION_TYPES).toContain("REVIEWER_DISAGREEMENT");
    expect(OBSERVATION_TYPES).toContain("LIMITATION");
  });
});
