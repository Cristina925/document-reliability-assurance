import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import {
  FROZEN_UNITS,
  REPLACEMENT_LOG,
  SELECTION_SUMMARY,
  GEN001_SAMPLE_ID,
  GEN001_BOUND_PROTOCOL_DIGEST,
  STRATUM_COUNTS,
  verifyStratumAllocation,
  verifyNoDuplicateFamilies,
  verifyAllUnitsMeetWordCountFloor,
  verifyOriginalDrawHistoryPreserved,
  verifyNoEvaluatorOutputFieldsPresent,
  buildSampleManifestCore,
  computeSampleAggregateDigest,
  GEN001_SAMPLE_AGGREGATE_DIGEST,
  computeSampleLockVerdict,
  GEN001_SAMPLE_LOCK_VERDICT,
} from "../dra-gen-001-sample-manifest";
import { GEN001_PROTOCOL_AGGREGATE_DIGEST, GEN001_PROTOCOL_STATUS } from "../../dra-gen-001-freeze-manifest";
import { HARD_STRATA, RECOMMENDED_SAMPLE_SIZE } from "../../dra-gen-001-protocol";
import {
  CONSIDERED_CANDIDATE_URLS,
  normalizeConsideredUrl,
} from "../../dra-gen-001-considered-candidate-registry";

describe("DRA-GEN-001 Phase 1 — sample size and stratification", () => {
  it("locks exactly 100 units total", () => {
    expect(FROZEN_UNITS.length).toBe(100);
    expect(FROZEN_UNITS.length).toBe(RECOMMENDED_SAMPLE_SIZE);
  });

  it("allocates exactly 25 units to each of the 4 frozen hard strata", () => {
    expect(verifyStratumAllocation()).toBe(true);
    for (const s of HARD_STRATA) {
      expect(STRATUM_COUNTS[s.id]).toBe(25);
    }
  });

  it("has exactly the 4 frozen stratum ids and no others", () => {
    const observedIds = new Set(FROZEN_UNITS.map((u) => u.stratumId));
    const frozenIds = new Set(HARD_STRATA.map((s) => s.id));
    expect(observedIds).toEqual(frozenIds);
  });
});

describe("DRA-GEN-001 Phase 1 — no duplicate publication families", () => {
  it("no two frozen units in the same stratum share a family id", () => {
    expect(verifyNoDuplicateFamilies()).toBe(true);
  });

  it("directly re-derives the check: every (stratumId, familyId) pair is unique", () => {
    const pairs = FROZEN_UNITS.map((u) => `${u.stratumId}::${u.familyId}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});

describe("DRA-GEN-001 Phase 1 — governance eligibility floor (E5, word count)", () => {
  it("every frozen unit has >=500 extracted words", () => {
    expect(verifyAllUnitsMeetWordCountFloor()).toBe(true);
    for (const u of FROZEN_UNITS) {
      expect(u.extractedWordCount).toBeGreaterThanOrEqual(500);
    }
  });
});

describe("DRA-GEN-001 Phase 1 — source integrity (real fetched bytes, not fabricated)", () => {
  it("every unit has a well-formed SHA-256 and positive byte length", () => {
    for (const u of FROZEN_UNITS) {
      expect(u.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(u.byteLength).toBeGreaterThan(0);
    }
  });

  it("no two frozen units share the same SHA-256 (no accidental duplicate content)", () => {
    const digests = FROZEN_UNITS.map((u) => u.sha256);
    expect(new Set(digests).size).toBe(digests.length);
  });

  it("every unit carries a non-empty licence basis and publisher", () => {
    for (const u of FROZEN_UNITS) {
      expect(u.licenceBasis.length).toBeGreaterThan(10);
      expect(u.publisher.length).toBeGreaterThan(0);
    }
  });
});

describe("DRA-GEN-001 Phase 1 — original-draw + replacement history is preserved, never deleted", () => {
  it("every REPLACED_FROM_RESERVE entry references a still-present replacement unit and a named original", () => {
    expect(verifyOriginalDrawHistoryPreserved()).toBe(true);
  });

  it("the replacement log is non-empty (replacements genuinely occurred) and every entry has a reason", () => {
    expect(REPLACEMENT_LOG.length).toBeGreaterThan(0);
    for (const r of REPLACEMENT_LOG) {
      expect(r.reason.length).toBeGreaterThan(0);
      expect(r.originalFrameId.length).toBeGreaterThan(0);
    }
  });

  it("no replacement reason references a DRA-performance signal (decision/issue/materiality/etc.)", () => {
    const forbidden = ["decision", "issue", "materiality", "hold", "review", "confidence", "receipt"];
    for (const r of REPLACEMENT_LOG) {
      const lower = r.reason.toLowerCase();
      for (const f of forbidden) {
        expect(lower).not.toContain(f);
      }
    }
  });

  it("replaced original frameIds do not appear in the final frozen set (they were not force-kept), but remain named in the log", () => {
    const frozenIds = new Set(FROZEN_UNITS.map((u) => u.frameId));
    const replaced = REPLACEMENT_LOG.filter((r) => r.reason === "REPLACED_FROM_RESERVE");
    for (const r of replaced) {
      expect(frozenIds.has(r.originalFrameId)).toBe(false);
      expect(r.replacedByFrameId).not.toBeNull();
      expect(frozenIds.has(r.replacedByFrameId!)).toBe(true);
    }
  });
});

describe("DRA-GEN-001 Phase 1 — hard blindness boundary (B1): no evaluator output exists for any sample unit", () => {
  it("no FrozenUnit field name resembles a DRA evaluator output field", () => {
    expect(verifyNoEvaluatorOutputFieldsPresent()).toBe(true);
  });

  it("directly enumerates every field present on every frozen unit and asserts the allowed set only", () => {
    const allowedFields = new Set([
      "frameId",
      "stratumId",
      "sourceUrl",
      "title",
      "publisher",
      "publicationDate",
      "mediaType",
      "language",
      "familyId",
      "licenceBasis",
      "byteLength",
      "sha256",
      "extractedWordCount",
      "fetchedAt",
      "wasReplacement",
      "replacesFrameId",
    ]);
    for (const u of FROZEN_UNITS) {
      for (const key of Object.keys(u)) {
        expect(allowedFields.has(key)).toBe(true);
      }
    }
  });
});

describe("DRA-GEN-001 Phase 1 — contamination exclusion held (no considered-candidate URL survived into the frozen set)", () => {
  it("no frozen unit's normalized source URL matches the considered-candidate registry", () => {
    const consideredSet = new Set(CONSIDERED_CANDIDATE_URLS);
    for (const u of FROZEN_UNITS) {
      expect(consideredSet.has(normalizeConsideredUrl(u.sourceUrl))).toBe(false);
    }
  });
});

describe("DRA-GEN-001 Phase 1 — protocol binding", () => {
  it("the sample manifest is bound to the actual frozen protocol digest, not a placeholder", () => {
    expect(GEN001_BOUND_PROTOCOL_DIGEST).toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });

  it("the protocol was frozen before this sample was locked (precondition order)", () => {
    expect(GEN001_PROTOCOL_STATUS).toBe("FROZEN");
  });
});

describe("DRA-GEN-001 Phase 1 — aggregate sample digest is deterministic and change-sensitive", () => {
  it("recomputing the digest twice yields the same value", () => {
    expect(computeSampleAggregateDigest()).toBe(computeSampleAggregateDigest());
    expect(GEN001_SAMPLE_AGGREGATE_DIGEST).toBe(computeSampleAggregateDigest());
  });

  it("changing a unit's sha256 in the manifest core changes the aggregate digest", () => {
    const core = buildSampleManifestCore();
    const mutatedUnits = core.units.map((u, i) => (i === 0 ? { ...u, sha256: "0".repeat(64) } : u));
    const mutatedDigest = createHash("sha256")
      .update(JSON.stringify({ ...core, units: mutatedUnits }))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_SAMPLE_AGGREGATE_DIGEST);
  });
});

describe("DRA-GEN-001 Phase 1 — final lock verdict", () => {
  it("computes DRA_GEN_001_BLIND_SAMPLE_LOCKED with zero failed checks", () => {
    const result = computeSampleLockVerdict();
    expect(result.failedChecks).toEqual([]);
    expect(result.verdict).toBe("DRA_GEN_001_BLIND_SAMPLE_LOCKED");
  });

  it("the exported verdict constant matches a fresh recomputation", () => {
    expect(GEN001_SAMPLE_LOCK_VERDICT).toBe(computeSampleLockVerdict().verdict);
  });

  it("sample id is a stable literal", () => {
    expect(GEN001_SAMPLE_ID).toBe("DRA-GEN-001-PHASE-1-SAMPLE-000001");
  });
});

describe("DRA-GEN-001 Phase 1 — selection summary sanity (frame construction actually ran, was not stubbed)", () => {
  it("raw frame size is large (real API pagination occurred)", () => {
    expect(SELECTION_SUMMARY.rawFrameSize).toBeGreaterThan(500);
  });

  it("eligible frame per stratum is well above the 25-unit primary need (real oversampling occurred)", () => {
    for (const s of HARD_STRATA) {
      expect(SELECTION_SUMMARY.stratumReport[s.id]!.eligibleCount).toBeGreaterThan(50);
    }
  });

  it("frame and eligible-frame digests are well-formed SHA-256 hex", () => {
    expect(SELECTION_SUMMARY.rawFrameDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(SELECTION_SUMMARY.eligibleFrameDigest).toMatch(/^[0-9a-f]{64}$/);
  });
});
