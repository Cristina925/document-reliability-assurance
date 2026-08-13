/**
 * DRA-VAL-001A — Tests: Corpus Design Schema
 */

import { describe, it, expect } from "vitest";
import { CorpusDesignSchema, CorpusQuotaSchema, SourceTypeRatiosSchema } from "../corpus-design.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDomainQuotas(targetSize: number) {
  // Two domains that sum to targetSize
  const a = Math.floor(targetSize / 2);
  const b = targetSize - a;
  return [
    { domain: "Legal and regulatory", targetCount: a, minimumCount: Math.floor(a / 2) },
    { domain: "Technical assurance", targetCount: b, minimumCount: Math.floor(b / 2) },
  ];
}

function validDesign(overrides: Record<string, unknown> = {}) {
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
    inclusionCriteria: ["Must be a complete document, not a fragment or excerpt."],
    exclusionCriteria: ["Must not contain personally identifiable information without anonymisation."],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// CorpusQuotaSchema
// ---------------------------------------------------------------------------

describe("CorpusQuotaSchema", () => {
  it("accepts a valid quota", () => {
    const result = CorpusQuotaSchema.safeParse({
      domain: "Legal and regulatory",
      targetCount: 15,
      minimumCount: 7,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty domain name", () => {
    const result = CorpusQuotaSchema.safeParse({
      domain: "",
      targetCount: 15,
      minimumCount: 7,
    });
    expect(result.success).toBe(false);
  });

  it("rejects minimumCount > targetCount", () => {
    const result = CorpusQuotaSchema.safeParse({
      domain: "Legal",
      targetCount: 10,
      minimumCount: 15,
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimumCount === targetCount", () => {
    const result = CorpusQuotaSchema.safeParse({
      domain: "Legal",
      targetCount: 10,
      minimumCount: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero targetCount", () => {
    const result = CorpusQuotaSchema.safeParse({
      domain: "Legal",
      targetCount: 0,
      minimumCount: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SourceTypeRatiosSchema
// ---------------------------------------------------------------------------

describe("SourceTypeRatiosSchema", () => {
  it("accepts ratios that sum to 1.0", () => {
    expect(
      SourceTypeRatiosSchema.safeParse({
        aiGenerated: 0.333,
        humanAuthored: 0.333,
        hybrid: 0.334,
      }).success,
    ).toBe(true);
  });

  it("accepts exactly equal thirds", () => {
    expect(
      SourceTypeRatiosSchema.safeParse({
        aiGenerated: 1 / 3,
        humanAuthored: 1 / 3,
        hybrid: 1 / 3,
      }).success,
    ).toBe(true);
  });

  it("rejects ratios that sum to more than 1.01", () => {
    expect(
      SourceTypeRatiosSchema.safeParse({
        aiGenerated: 0.5,
        humanAuthored: 0.5,
        hybrid: 0.1,
      }).success,
    ).toBe(false);
  });

  it("rejects ratios that sum to less than 0.99", () => {
    expect(
      SourceTypeRatiosSchema.safeParse({
        aiGenerated: 0.2,
        humanAuthored: 0.2,
        hybrid: 0.2,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CorpusDesignSchema
// ---------------------------------------------------------------------------

describe("CorpusDesignSchema", () => {
  it("accepts a valid corpus design", () => {
    const result = CorpusDesignSchema.safeParse(validDesign());
    expect(result.success).toBe(true);
  });

  it("rejects pilotSize >= minimumViableSize", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ pilotSize: 60 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects minimumViableSize >= targetSize", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ minimumViableSize: 120 }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects domain quota totals that do not sum to targetSize", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({
        domainQuotas: [
          { domain: "Legal", targetCount: 50, minimumCount: 20 },
          { domain: "Technical", targetCount: 50, minimumCount: 20 },
          // sum = 100, not 120
        ],
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects difficultyStrata that do not sum to targetSize", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ difficultyStrata: { low: 30, medium: 30, high: 30 } }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects empty inclusionCriteria", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ inclusionCriteria: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects empty exclusionCriteria", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ exclusionCriteria: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects empty domainQuotas", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ domainQuotas: [] }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts optional designRationale", () => {
    const result = CorpusDesignSchema.safeParse(
      validDesign({ designRationale: "The corpus is stratified across nine domains." }),
    );
    expect(result.success).toBe(true);
  });
});
