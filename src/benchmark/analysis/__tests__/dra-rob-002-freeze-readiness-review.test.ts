/**
 * DRA-ROB-002 — Generalisation Candidate Freeze-Readiness Review
 *
 * Machine-verifiable checks for the load-bearing claims made in
 * `docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md`. This is a
 * review/decision programme: no production evaluator behaviour, corpus
 * history, or frozen artefact is touched by this file or by the ledger
 * module it tests.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DRA_EVALUATOR_VERSION,
} from "../../../model/versions.js";
import { INITIAL_CORPUS_VERSION } from "../../governance/version.js";
import {
  GC1_FREEZE_VERDICT,
  GC1_FROZEN_IDENTIFIERS,
  GC1_MULTICOLUMN_BASELINE,
  KNOWN_DEFECT_LEDGER,
  ROBUSTNESS_MATRIX,
  ROBUSTNESS_MATRIX_DIMENSION_COUNT,
} from "../dra-rob-002-freeze-readiness-ledger.js";

describe("DRA-ROB-002 — robustness matrix integrity", () => {
  it("reconstructs exactly the 18 dimensions inherited from DRA-ROB-001", () => {
    expect(ROBUSTNESS_MATRIX.length).toBe(ROBUSTNESS_MATRIX_DIMENSION_COUNT);
    expect(ROBUSTNESS_MATRIX.length).toBe(18);
  });

  it("every dimension has a classification and an explicit GC-1-claim-invalidation judgement", () => {
    for (const entry of ROBUSTNESS_MATRIX) {
      expect(entry.dimension.length).toBeGreaterThan(0);
      expect(entry.classification).toBeTruthy();
      expect(typeof entry.canInvalidateGC1Claim).toBe("boolean");
      expect(typeof entry.boundedAndDocumented).toBe("boolean");
    }
  });

  it("no dimension is left both unbounded/undocumented AND capable of invalidating the GC-1 claim", () => {
    // This is the actual freeze-safety invariant: any dimension that could
    // invalidate the GC-1 claim must have its risk bounded/documented
    // (i.e. explicitly scoped out), never silently left open.
    const dangerous = ROBUSTNESS_MATRIX.filter(
      (e) => e.canInvalidateGC1Claim && !e.boundedAndDocumented,
    );
    expect(dangerous).toEqual([]);
  });

  it("non-Latin scripts and multi-column are present and reflect the ROB-002 update (not the stale ROB-001 wording)", () => {
    const nonLatin = ROBUSTNESS_MATRIX.find((e) => e.dimension === "Non-Latin scripts");
    const multiColumn = ROBUSTNESS_MATRIX.find((e) => e.dimension === "Multi-column layout");
    expect(nonLatin?.classification).toBe("ADEQUATELY_EVIDENCED_WITH_LIMITATION");
    expect(multiColumn?.classification).toBe("ADEQUATELY_EVIDENCED_WITH_LIMITATION");
  });
});

describe("DRA-ROB-002 — known-defect ledger integrity", () => {
  it("every ledger entry has all required fields populated", () => {
    for (const entry of KNOWN_DEFECT_LEDGER) {
      expect(entry.id).toMatch(/^D\d+$/);
      expect(entry.subsystem.length).toBeGreaterThan(0);
      expect(entry.evidence.length).toBeGreaterThan(0);
      expect(entry.remediationStatus.length).toBeGreaterThan(0);
      expect(entry.residualRisk.length).toBeGreaterThan(0);
      expect([
        "FREEZE_BLOCKER",
        "ACCEPTED_GC-1_LIMITATION",
        "DEFERRED_NON-BLOCKING",
        "EXTERNAL_DEPENDENCY",
        "CLOSED",
      ]).toContain(entry.freezeConsequence);
    }
  });

  it("ledger entry IDs are unique", () => {
    const ids = KNOWN_DEFECT_LEDGER.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no entry classified FREEZE_BLOCKER coexists with a READY verdict", () => {
    const blockers = KNOWN_DEFECT_LEDGER.filter((e) => e.freezeConsequence === "FREEZE_BLOCKER");
    if (GC1_FREEZE_VERDICT === "READY_FOR_DRA_GC_1_FREEZE") {
      expect(blockers).toEqual([]);
    } else {
      expect(blockers.length).toBeGreaterThan(0);
    }
  });

  it("the external eLegalix acquisition block is recorded as EXTERNAL_DEPENDENCY, never as a robustness defect", () => {
    const d10 = KNOWN_DEFECT_LEDGER.find((e) => e.id === "D10");
    expect(d10?.freezeConsequence).toBe("EXTERNAL_DEPENDENCY");
  });

  it("the confirmed CHK-005 EN/ES materiality lexicon gap is recorded with a safely-fixable-but-not-yet-done status", () => {
    const d3 = KNOWN_DEFECT_LEDGER.find((e) => e.id === "D3");
    expect(d3?.safelyFixable).toBe("YES_NOT_YET_DONE");
    expect(d3?.freezeConsequence).toBe("ACCEPTED_GC-1_LIMITATION");
  });
});

describe("DRA-ROB-002 — frozen identifier drift detection", () => {
  it("evaluator version matches the version this review was conducted against", () => {
    expect(DRA_EVALUATOR_VERSION).toBe(GC1_FROZEN_IDENTIFIERS.evaluatorVersion);
  });

  it("corpus version matches the version this review was conducted against", () => {
    expect(INITIAL_CORPUS_VERSION).toBe(GC1_FROZEN_IDENTIFIERS.corpusVersion);
  });
});

describe("DRA-ROB-002 — multi-column evidence matches the DRA-ENG-025 fixture", () => {
  const fixturePath = fileURLToPath(
    new URL("../../../../../../docs/dra/evidence/dra-eng-025-residual-failure-corpus.json", import.meta.url),
  );
  const fixture = JSON.parse(readFileSync(fixturePath, "utf-8"));

  it("total pairs, preserved-adjacent count, and fraction match the ledger's cited baseline", () => {
    expect(fixture.totalPairs).toBe(GC1_MULTICOLUMN_BASELINE.totalPairs);
    expect(fixture.preservedAdjacent).toBe(GC1_MULTICOLUMN_BASELINE.preservedAdjacent);
    expect(fixture.fractionPreserved).toBeCloseTo(GC1_MULTICOLUMN_BASELINE.fractionPreserved, 10);
  });

  it("residual failure count matches the ledger's cited value", () => {
    expect(fixture.failures.length).toBe(GC1_MULTICOLUMN_BASELINE.residualFailureCount);
    expect(fixture.failures.length).toBe(18);
  });
});

describe("DRA-ROB-002 — verdict sanity", () => {
  it("issues exactly one recognised primary verdict", () => {
    expect(["READY_FOR_DRA_GC_1_FREEZE", "NOT_READY_FOR_DRA_GC_1_FREEZE"]).toContain(GC1_FREEZE_VERDICT);
  });
});
