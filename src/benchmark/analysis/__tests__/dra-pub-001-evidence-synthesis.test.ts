import { describe, it, expect } from "vitest";
import {
  IDENTITY_GATE,
  DEVELOPMENT_CORPUS_ADMITTED_COUNT,
  DEVELOPMENT_CORPUS_EXCLUDED_ID,
  TOTAL_ISSUE_CLASSES,
  OBSERVED_REACHABLE_CLASSES,
  STRUCTURALLY_UNREACHABLE_CLASSES,
  GEN_001_RESTATED,
  VAL_002_RESTATED,
  CLAIM_EVIDENCE_MATRIX,
  PUBLICATION_READINESS_DIMENSIONS,
  FINAL_PUBLICATION_VERDICT,
  ENGINEERING_STATE_VERDICT,
  type ClaimVerdict,
  type ReadinessRating,
} from "../dra-pub-001-evidence-synthesis.js";

describe("DRA-PUB-001 — identity-integrity gate", () => {
  it("GC-1's aggregate digest matches the documented frozen value", () => {
    expect(IDENTITY_GATE.gc1AggregateDigest).toBe(
      "77544648dcb37caf96468123de4d19123becceff48f2023f6c885899350b857b",
    );
  });

  it("GEN-001 and VAL-002 protocols remain bound to the live GC-1 digest", () => {
    expect(IDENTITY_GATE.gen001BoundDigestMatchesGC1).toBe(true);
    expect(IDENTITY_GATE.val002BoundDigestMatchesGC1).toBe(true);
  });
});

describe("DRA-PUB-001 — development corpus scale", () => {
  it("exactly 33 documents are admitted (32 sequential + DRA-DOC-0034)", () => {
    expect(DEVELOPMENT_CORPUS_ADMITTED_COUNT).toBe(33);
  });

  it("DRA-DOC-0033 is documented as excluded, not admitted", () => {
    expect(DEVELOPMENT_CORPUS_EXCLUDED_ID).toBe("DRA-DOC-0033");
  });
});

describe("DRA-PUB-001 — issue-class reachability (Section 7, publication-critical)", () => {
  it("exactly nine canonical issue classes are defined", () => {
    expect(TOTAL_ISSUE_CLASSES).toBe(9);
  });

  it("exactly three classes are OBSERVED_REACHABLE: IC-4, IC-5, IC-7", () => {
    expect(OBSERVED_REACHABLE_CLASSES.sort()).toEqual(["IC-4", "IC-5", "IC-7"]);
  });

  it("exactly six classes are STRUCTURALLY_UNREACHABLE", () => {
    expect(STRUCTURALLY_UNREACHABLE_CLASSES).toHaveLength(6);
    expect(STRUCTURALLY_UNREACHABLE_CLASSES.sort()).toEqual(
      ["IC-1", "IC-2", "IC-3", "IC-6", "IC-8", "IC-9"].sort(),
    );
  });

  it("reachable + unreachable classes exactly partition all nine (no REACHABLE_UNOBSERVED or INDETERMINATE residual)", () => {
    expect(OBSERVED_REACHABLE_CLASSES.length + STRUCTURALLY_UNREACHABLE_CLASSES.length).toBe(
      TOTAL_ISSUE_CLASSES,
    );
  });
});

describe("DRA-PUB-001 — DRA-GEN-001 restated figures", () => {
  it("100 locked, 75 evaluated, 25 excluded, and they sum correctly", () => {
    expect(GEN_001_RESTATED.evaluatedCount + GEN_001_RESTATED.excludedCount).toBe(
      GEN_001_RESTATED.lockedSampleSize,
    );
  });

  it("decision totals sum to exactly the evaluated count", () => {
    const { supported, hold, review } = GEN_001_RESTATED.decisions;
    expect(supported + hold + review).toBe(GEN_001_RESTATED.evaluatedCount);
  });

  it("preserves GEN-001's original verdicts verbatim (not upgraded by this synthesis)", () => {
    expect(GEN_001_RESTATED.benchmarkEvidenceVerdict).toBe(
      "GEN_001_ADEQUATE_WITH_MATERIAL_LIMITATION",
    );
    expect(GEN_001_RESTATED.nextEvidenceVerdict).toBe("TARGETED_FOLLOW_UP_REQUIRED");
  });
});

describe("DRA-PUB-001 — DRA-VAL-002 restated figures", () => {
  it("25 locked and 25 evaluated (no exclusions)", () => {
    expect(VAL_002_RESTATED.lockedSampleSize).toBe(25);
    expect(VAL_002_RESTATED.evaluatedCount).toBe(25);
  });

  it("family counts sum to the locked sample size", () => {
    const { GOV_UK, ONS_GOV_UK, US_FEDERAL } = VAL_002_RESTATED.families;
    expect(GOV_UK + ONS_GOV_UK + US_FEDERAL).toBe(VAL_002_RESTATED.lockedSampleSize);
  });

  it("decision totals sum to the evaluated count", () => {
    const { supported, review } = VAL_002_RESTATED.decisions;
    expect(supported + review).toBe(VAL_002_RESTATED.evaluatedCount);
  });

  it("post-hoc drift observation counts sum to the evaluated count", () => {
    const { identical, drifted, unreachable } = VAL_002_RESTATED.postHocDrift;
    expect(identical + drifted + unreachable).toBe(VAL_002_RESTATED.evaluatedCount);
  });

  it("preserves VAL-002's verdicts verbatim", () => {
    expect(VAL_002_RESTATED.executionVerdict).toBe("DRA_VAL_002_COMPLETE");
    expect(VAL_002_RESTATED.coverageVerdict).toBe("ENGLISH_HTML_GAP_CLOSED");
  });
});

describe("DRA-PUB-001 — claim-evidence matrix", () => {
  it("covers exactly claims C1 through C12, no duplicates", () => {
    const ids = CLAIM_EVIDENCE_MATRIX.map((c) => c.id);
    expect(new Set(ids).size).toBe(12);
    expect(ids.sort()).toEqual(Array.from({ length: 12 }, (_, i) => `C${i + 1}`).sort());
  });

  it("every verdict is one of the four permitted values", () => {
    const permitted: ClaimVerdict[] = [
      "SUPPORTED",
      "SUPPORTED_WITH_LIMITATION",
      "NOT_SUPPORTED",
      "OUT_OF_SCOPE",
    ];
    for (const claim of CLAIM_EVIDENCE_MATRIX) {
      expect(permitted).toContain(claim.verdict);
    }
  });

  it("no claim is rated OUT_OF_SCOPE (every candidate claim was directly assessable)", () => {
    expect(CLAIM_EVIDENCE_MATRIX.every((c) => c.verdict !== "OUT_OF_SCOPE")).toBe(true);
  });

  it("the universal-coverage claim (C6) and Spanish-generalisation claim (C8) are NOT_SUPPORTED", () => {
    const c6 = CLAIM_EVIDENCE_MATRIX.find((c) => c.id === "C6")!;
    const c8 = CLAIM_EVIDENCE_MATRIX.find((c) => c.id === "C8")!;
    expect(c6.verdict).toBe("NOT_SUPPORTED");
    expect(c8.verdict).toBe("NOT_SUPPORTED");
  });

  it("the external-validation claim (C12) is NOT_SUPPORTED", () => {
    const c12 = CLAIM_EVIDENCE_MATRIX.find((c) => c.id === "C12")!;
    expect(c12.verdict).toBe("NOT_SUPPORTED");
  });
});

describe("DRA-PUB-001 — publication-readiness dimensions", () => {
  it("rates exactly twelve dimensions", () => {
    expect(PUBLICATION_READINESS_DIMENSIONS).toHaveLength(12);
  });

  it("every rating is one of the five permitted values", () => {
    const permitted: ReadinessRating[] = [
      "STRONG",
      "ADEQUATE",
      "ADEQUATE_WITH_LIMITATION",
      "WEAK",
      "MISSING",
    ];
    for (const d of PUBLICATION_READINESS_DIMENSIONS) {
      expect(permitted).toContain(d.rating);
    }
  });

  it("external validation and package completeness are rated MISSING", () => {
    const ev = PUBLICATION_READINESS_DIMENSIONS.find(
      (d) => d.dimension === "External independent validation",
    )!;
    const pkg = PUBLICATION_READINESS_DIMENSIONS.find(
      (d) => d.dimension === "Publication-package completeness",
    )!;
    expect(ev.rating).toBe("MISSING");
    expect(pkg.rating).toBe("MISSING");
  });
});

describe("DRA-PUB-001 — final verdicts", () => {
  it("issues DRA_READY_FOR_FIRST_PUBLICATION", () => {
    expect(FINAL_PUBLICATION_VERDICT).toBe("DRA_READY_FOR_FIRST_PUBLICATION");
  });

  it("issues DRA_V1_ENGINEERING_FROZEN_FOR_PUBLICATION as the accompanying engineering-state verdict", () => {
    expect(ENGINEERING_STATE_VERDICT).toBe("DRA_V1_ENGINEERING_FROZEN_FOR_PUBLICATION");
  });
});
