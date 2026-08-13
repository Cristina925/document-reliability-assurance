import { describe, expect, it } from "vitest";

import {
  PROTOCOL_ID,
  PROTOCOL_ORIGINAL_WORKING_ID,
  VAL002_PROTOCOL_STATUS,
  BOUND_CANDIDATE_ID,
  BOUND_CANDIDATE_DIGEST,
  SOURCE_FAMILIES,
  ELIGIBILITY_CRITERIA,
  SAMPLE_SIZE_OPTIONS,
  RECOMMENDED_SAMPLE_SIZE,
  ENDPOINTS,
  FAILURE_TAXONOMY,
  REPLACEMENT_POLICY,
  OUT_OF_SCOPE_EXTENSIONS,
} from "../dra-val-002-protocol";
import {
  isVal002ConsideredUrl,
  isVal002ConsideredCandidateId,
  VAL002_CONSIDERED_CANDIDATE_URLS,
  VAL002_CONSIDERED_CANDIDATE_IDS,
} from "../dra-val-002-considered-registry";
import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
  computeAggregateDigest,
} from "../dra-gc-1-freeze-manifest";
import {
  VAL002_PROTOCOL_AGGREGATE_DIGEST,
  computeProtocolAggregateDigest,
  VAL002_PROTOCOL_STATUS as FREEZE_MANIFEST_STATUS,
} from "../dra-val-002-freeze-manifest";
import {
  FROZEN_UNITS,
  REPLACEMENT_LOG,
  verifyNoDuplicateFamilies,
  verifyAllUnitsMeetWordCountFloor,
  verifyFamilyAllocationWithinCap,
  verifyOriginalDrawHistoryPreserved,
  computeSampleLockVerdict,
  VAL002_SAMPLE_AGGREGATE_DIGEST,
  computeSampleAggregateDigest,
} from "../val-002-phase1/dra-val-002-sample-manifest";

describe("DRA-VAL-002 protocol — identity, renumbering, and status", () => {
  it("is identified as DRA-VAL-002, with the original working id recorded", () => {
    expect(PROTOCOL_ID).toBe("DRA-VAL-002");
    expect(PROTOCOL_ORIGINAL_WORKING_ID).toBe("DRA-VAL-001");
  });

  it("protocol status is FROZEN (required before any sample selection may be treated as valid)", () => {
    expect(VAL002_PROTOCOL_STATUS).toBe("FROZEN");
  });
});

describe("DRA-VAL-002 protocol — GC-1 digest binding is unchanged and live", () => {
  it("is bound to the actual frozen GC-1 candidate identifier", () => {
    expect(BOUND_CANDIDATE_ID).toBe(GC1_CANDIDATE_ID);
    expect(BOUND_CANDIDATE_ID).toBe("DRA-GC-1");
  });

  it("is bound to the real recorded GC-1 aggregate digest, not a placeholder", () => {
    expect(BOUND_CANDIDATE_DIGEST).toBe(GC1_AGGREGATE_DIGEST);
    expect(BOUND_CANDIDATE_DIGEST).toMatch(/^[0-9a-f]{64}$/);
  });

  it("the bound digest still matches a live recomputation of the GC-1 manifest (GC-1 unmodified)", () => {
    expect(computeAggregateDigest()).toBe(BOUND_CANDIDATE_DIGEST);
  });
});

describe("DRA-VAL-002 protocol — source-family diversity is real, not GOV.UK-exclusive", () => {
  it("declares at least 3 distinct source families", () => {
    expect(SOURCE_FAMILIES.length).toBeGreaterThanOrEqual(3);
    expect(new Set(SOURCE_FAMILIES.map((f) => f.id)).size).toBe(SOURCE_FAMILIES.length);
  });

  it("no family's target allocation exceeds 40%", () => {
    for (const f of SOURCE_FAMILIES) {
      expect(f.targetAllocation).toBeLessThanOrEqual(0.4);
    }
  });

  it("GOV_UK is present but is not the sole family", () => {
    const ids = SOURCE_FAMILIES.map((f) => f.id);
    expect(ids).toContain("GOV_UK");
    expect(ids.length).toBeGreaterThan(1);
  });
});

describe("DRA-VAL-002 protocol — scope discipline", () => {
  it("declares GC-1/GEN-001/ENG-026/GC2-REV-001 modification as out of scope", () => {
    const joined = OUT_OF_SCOPE_EXTENSIONS.join(" ");
    expect(joined).toMatch(/GC-1/);
    expect(joined).toMatch(/GEN-001/);
    expect(joined).toMatch(/ENG-026/);
    expect(joined).toMatch(/GC2-REV-001|GC-2/);
  });

  it("declares a new 100-document benchmark as out of scope", () => {
    expect(OUT_OF_SCOPE_EXTENSIONS.join(" ")).toMatch(/100-document/);
  });
});

describe("DRA-VAL-002 protocol — eligibility criteria", () => {
  it("declares at least 10 eligibility criteria with substantive descriptions", () => {
    expect(ELIGIBILITY_CRITERIA.length).toBeGreaterThanOrEqual(10);
    for (const c of ELIGIBILITY_CRITERIA) {
      expect(c.description.length).toBeGreaterThan(10);
    }
  });

  it("includes an explicit contamination-exclusion criterion", () => {
    expect(ELIGIBILITY_CRITERIA.some((c) => c.id === "V9_NOT_CONTAMINATED")).toBe(true);
  });
});

describe("DRA-VAL-002 protocol — sample-size justification", () => {
  it("evaluates n=20/25/30/40", () => {
    expect(SAMPLE_SIZE_OPTIONS.map((o) => o.n)).toEqual([20, 25, 30, 40]);
  });

  it("exactly one option is RECOMMENDED_PRIMARY, matching RECOMMENDED_SAMPLE_SIZE", () => {
    const recommended = SAMPLE_SIZE_OPTIONS.filter((o) => o.recommendation === "RECOMMENDED_PRIMARY");
    expect(recommended).toHaveLength(1);
    expect(recommended[0]!.n).toBe(RECOMMENDED_SAMPLE_SIZE);
    expect(RECOMMENDED_SAMPLE_SIZE).toBe(25);
  });

  it("rule-of-three upper bound strictly decreases as n increases", () => {
    const sorted = [...SAMPLE_SIZE_OPTIONS].sort((a, b) => a.n - b.n);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.ruleOfThreeUpperBoundIfZeroFailures).toBeLessThan(sorted[i - 1]!.ruleOfThreeUpperBoundIfZeroFailures);
    }
  });
});

describe("DRA-VAL-002 protocol — endpoints and failure taxonomy", () => {
  it("declares at least 4 PRIMARY endpoints", () => {
    expect(ENDPOINTS.filter((e) => e.tier === "PRIMARY").length).toBeGreaterThanOrEqual(4);
  });

  it("REPRESENTATION_MATERIALITY_FAILURE_RATE is a PRIMARY endpoint", () => {
    const e = ENDPOINTS.find((x) => x.id === "REPRESENTATION_MATERIALITY_FAILURE_RATE");
    expect(e?.tier).toBe("PRIMARY");
  });

  it("declares the required failure categories including SUCCESSFUL_EVALUATION and UNCLASSIFIED", () => {
    const cats = FAILURE_TAXONOMY.map((f) => f.category);
    expect(cats).toEqual(
      expect.arrayContaining([
        "ELIGIBILITY_FAILURE",
        "SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK",
        "REPRESENTATION_FAILURE",
        "PIPELINE_FAILURE",
        "DETERMINISM_FAILURE",
        "PROOF_INTEGRITY_FAILURE",
        "KNOWN_LIMITATION_ENCOUNTERED",
        "SUCCESSFUL_EVALUATION",
        "UNCLASSIFIED",
      ]),
    );
  });

  it("only before-lock categories are marked appliesBeforeOrAfterLock BEFORE_LOCK_ONLY", () => {
    const beforeLockOnly = FAILURE_TAXONOMY.filter((f) => f.appliesBeforeOrAfterLock === "BEFORE_LOCK_ONLY").map((f) => f.category);
    expect(beforeLockOnly).toEqual(
      expect.arrayContaining(["ELIGIBILITY_FAILURE", "SOURCE_ACQUISITION_FAILURE_BEFORE_LOCK"]),
    );
  });
});

describe("DRA-VAL-002 protocol — replacement policy never permits post-lock DRA-performance swaps", () => {
  it("forbidden-after-lock list includes performance-driven reasons", () => {
    const joined = REPLACEMENT_POLICY.forbiddenAfterLock.join(" ").toLowerCase();
    expect(joined).toMatch(/review\/hold|known limitation|issue class/);
  });

  it("allowed-before-lock list contains only externally-caused reasons", () => {
    const joined = REPLACEMENT_POLICY.allowedBeforeLock.join(" ").toLowerCase();
    expect(joined).not.toMatch(/poor performance|crash|review\/hold/);
  });
});

describe("DRA-VAL-002 protocol freeze manifest — aggregate digest", () => {
  it("freeze manifest reports FROZEN status", () => {
    expect(FREEZE_MANIFEST_STATUS).toBe("FROZEN");
  });

  it("the recorded aggregate digest matches a live recomputation (no drift since freeze)", () => {
    expect(computeProtocolAggregateDigest()).toBe(VAL002_PROTOCOL_AGGREGATE_DIGEST);
  });
});

describe("DRA-VAL-002 contamination registry — real exclusion set, reused from GEN-001", () => {
  it("is non-trivially large (real GEN-001 registry + 100 GEN-001 sample URLs + session screening)", () => {
    expect(VAL002_CONSIDERED_CANDIDATE_URLS.length).toBeGreaterThan(150);
    expect(VAL002_CONSIDERED_CANDIDATE_IDS.length).toBeGreaterThan(50);
  });

  it("a known GEN-001-considered URL is detected as excluded", () => {
    const sample = VAL002_CONSIDERED_CANDIDATE_URLS.find((u) => u.includes("ncsc"));
    expect(sample).toBeDefined();
    expect(isVal002ConsideredUrl(`${sample}?utm_source=test`)).toBe(true);
  });

  it("a never-considered URL is correctly treated as not excluded by this mechanism alone", () => {
    expect(isVal002ConsideredUrl("https://example-never-considered-domain-xyz123.test/some/page.html")).toBe(false);
  });

  it("a never-considered candidateId is correctly treated as not excluded", () => {
    expect(isVal002ConsideredCandidateId("DRA-VAL-002-CAND-NEVER-SEEN-999")).toBe(false);
  });
});

describe("DRA-VAL-002 sample lock — real, non-contaminated, 25-unit locked sample", () => {
  it("locks exactly 25 units", () => {
    expect(FROZEN_UNITS).toHaveLength(RECOMMENDED_SAMPLE_SIZE);
  });

  it("no locked unit overlaps the VAL-002 contamination registry", () => {
    for (const u of FROZEN_UNITS) {
      expect(isVal002ConsideredUrl(u.sourceUrl)).toBe(false);
    }
  });

  it("no duplicate publisher family within the same source family (V10)", () => {
    expect(verifyNoDuplicateFamilies()).toBe(true);
  });

  it("every unit meets the 500-word eligibility floor (V6)", () => {
    expect(verifyAllUnitsMeetWordCountFloor()).toBe(true);
  });

  it("source-family allocation matches the protocol's cap and diversity rule", () => {
    expect(verifyFamilyAllocationWithinCap()).toBe(true);
  });

  it("every unit has a valid SHA-256 and positive byte length", () => {
    for (const u of FROZEN_UNITS) {
      expect(u.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(u.byteLength).toBeGreaterThan(0);
    }
  });

  it("replacement history is preserved and internally consistent", () => {
    expect(verifyOriginalDrawHistoryPreserved()).toBe(true);
  });

  it("replacements, if any, occurred only for eligibility/acquisition-failure reasons, never DRA performance", () => {
    for (const r of REPLACEMENT_LOG) {
      expect(r.reason.toLowerCase()).not.toMatch(/review|hold|issue class|known limitation/);
    }
  });

  it("the sample lock verdict is DRA_VAL_002_SAMPLE_LOCKED", () => {
    expect(computeSampleLockVerdict().verdict).toBe("DRA_VAL_002_SAMPLE_LOCKED");
  });

  it("the sample aggregate digest matches a live recomputation (no post-lock tampering)", () => {
    expect(computeSampleAggregateDigest()).toBe(VAL002_SAMPLE_AGGREGATE_DIGEST);
  });
});
