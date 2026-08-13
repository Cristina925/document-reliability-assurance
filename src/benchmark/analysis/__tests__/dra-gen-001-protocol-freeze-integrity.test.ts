import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import {
  GEN001_PROTOCOL_ID,
  GEN001_PROTOCOL_VERSION,
  GEN001_PROTOCOL_STATUS,
  GEN001_BOUND_GC1_CANDIDATE_ID,
  GEN001_BOUND_GC1_DIGEST,
  FROZEN_PROTOCOL_FILES,
  FROZEN_PROTOCOL_FILE_DIGESTS,
  CONSIDERED_REGISTRY_DIGEST,
  CONSIDERED_REGISTRY_URL_COUNT,
  CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT,
  FROZEN_SAMPLE_SIZE,
  FROZEN_STRATUM_ALLOCATION,
  buildProtocolManifestCore,
  computeProtocolAggregateDigest,
  GEN001_PROTOCOL_AGGREGATE_DIGEST,
  computeLiveProtocolFileDigests,
  SCOPE_INTERPRETATION_STATEMENT,
  GEN001_BLIND_SAMPLE_MANIFEST_REFERENCE_AT_FREEZE_TIME,
} from "../dra-gen-001-freeze-manifest";
import {
  GC1_CANDIDATE_ID,
  GC1_AGGREGATE_DIGEST,
  computeAggregateDigest as computeLiveGc1AggregateDigest,
  canonicalizeForDigest,
} from "../dra-gc-1-freeze-manifest";
import { RECOMMENDED_SAMPLE_SIZE, HARD_STRATA } from "../dra-gen-001-protocol";

describe("DRA-GEN-001 protocol freeze — identity is deterministic", () => {
  it("protocol is frozen (not draft)", () => {
    expect(GEN001_PROTOCOL_STATUS).toBe("FROZEN");
  });

  it("protocol id/version are stable literals", () => {
    expect(GEN001_PROTOCOL_ID).toBe("DRA-GEN-001");
    expect(GEN001_PROTOCOL_VERSION).toBe("1.0.0");
  });

  it("computeProtocolAggregateDigest() is a pure function of the manifest core — calling it twice yields the same value", () => {
    expect(computeProtocolAggregateDigest()).toBe(computeProtocolAggregateDigest());
  });

  it("the recorded aggregate digest matches a fresh recomputation (no drift since freeze)", () => {
    expect(GEN001_PROTOCOL_AGGREGATE_DIGEST).toBe(computeProtocolAggregateDigest());
    expect(GEN001_PROTOCOL_AGGREGATE_DIGEST).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("DRA-GEN-001 protocol freeze — GC-1 binding is correct", () => {
  it("binds to the actual GC-1 candidate id and digest, not placeholders", () => {
    expect(GEN001_BOUND_GC1_CANDIDATE_ID).toBe(GC1_CANDIDATE_ID);
    expect(GEN001_BOUND_GC1_DIGEST).toBe(GC1_AGGREGATE_DIGEST);
  });

  it("the bound GC-1 digest still matches a live recomputation of the GC-1 manifest", () => {
    expect(computeLiveGc1AggregateDigest()).toBe(GEN001_BOUND_GC1_DIGEST);
  });
});

describe("DRA-GEN-001 protocol freeze — all protocol-defining components are represented", () => {
  it("declares the 4 required protocol-defining files", () => {
    expect(FROZEN_PROTOCOL_FILES).toEqual(
      expect.arrayContaining([
        "docs/dra/DRA-GEN-001-BLIND-GENERALISATION-PROTOCOL.md",
        "lib/dra-reference/src/benchmark/analysis/dra-gen-001-protocol.ts",
        "lib/dra-reference/src/benchmark/analysis/dra-gen-001-considered-candidate-registry.ts",
        "lib/dra-reference/src/benchmark/analysis/__tests__/dra-gen-001-freeze-integrity.test.ts",
      ]),
    );
  });

  it("every frozen protocol file has a recorded 64-hex-char SHA-256 digest", () => {
    for (const file of FROZEN_PROTOCOL_FILES) {
      expect(FROZEN_PROTOCOL_FILE_DIGESTS[file]).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("recorded file digests match a live re-hash of the actual repository files (no post-freeze drift)", () => {
    const live = computeLiveProtocolFileDigests();
    for (const file of FROZEN_PROTOCOL_FILES) {
      expect(live[file]).toBe(FROZEN_PROTOCOL_FILE_DIGESTS[file]);
    }
  });
});

describe("DRA-GEN-001 protocol freeze — considered-candidate registry is bound into protocol identity", () => {
  it("registry counts are non-trivial (a real scan, not a stub)", () => {
    expect(CONSIDERED_REGISTRY_URL_COUNT).toBeGreaterThan(50);
    expect(CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT).toBeGreaterThan(20);
  });

  it("the registry digest is included in the manifest core (structurally verified)", () => {
    const core = buildProtocolManifestCore();
    expect(core.consideredRegistryDigest).toBe(CONSIDERED_REGISTRY_DIGEST);
    expect(core.consideredRegistryUrlCount).toBe(CONSIDERED_REGISTRY_URL_COUNT);
    expect(core.consideredRegistryCandidateIdCount).toBe(CONSIDERED_REGISTRY_CANDIDATE_ID_COUNT);
  });

  it("changing the registry content would change the aggregate digest (direct recomputation, not the live import)", () => {
    const coreWithTamperedRegistry = {
      ...buildProtocolManifestCore(),
      consideredRegistryDigest: "0".repeat(64),
    };
    const tamperedDigest = createHash("sha256")
      .update(canonicalizeForDigest(coreWithTamperedRegistry))
      .digest("hex");
    expect(tamperedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });
});

describe("DRA-GEN-001 protocol freeze — changing any protocol-defining component changes the identity", () => {
  it("a different sample size produces a different aggregate digest", () => {
    const base = buildProtocolManifestCore();
    const mutated = { ...base, frozenSampleSize: base.frozenSampleSize + 1 };
    const mutatedDigest = createHash("sha256")
      .update(canonicalizeForDigest(mutated))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });

  it("a different GC-1 binding produces a different aggregate digest", () => {
    const base = buildProtocolManifestCore();
    const mutated = { ...base, boundGc1Digest: "f".repeat(64) };
    const mutatedDigest = createHash("sha256")
      .update(canonicalizeForDigest(mutated))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });

  it("a different endpoint id list produces a different aggregate digest", () => {
    const base = buildProtocolManifestCore();
    const mutated = { ...base, frozenEndpointIds: [...base.frozenEndpointIds, "NEW_ENDPOINT"] };
    const mutatedDigest = createHash("sha256")
      .update(canonicalizeForDigest(mutated))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });

  it("a different failure-taxonomy id list produces a different aggregate digest", () => {
    const base = buildProtocolManifestCore();
    const mutated = {
      ...base,
      frozenFailureTaxonomyIds: base.frozenFailureTaxonomyIds.slice(0, -1),
    };
    const mutatedDigest = createHash("sha256")
      .update(canonicalizeForDigest(mutated))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });

  it("a different frozen-file digest produces a different aggregate digest", () => {
    const base = buildProtocolManifestCore();
    const [firstFile] = FROZEN_PROTOCOL_FILES;
    const mutated = {
      ...base,
      protocolFileDigests: { ...base.protocolFileDigests, [firstFile!]: "1".repeat(64) },
    };
    const mutatedDigest = createHash("sha256")
      .update(canonicalizeForDigest(mutated))
      .digest("hex");
    expect(mutatedDigest).not.toBe(GEN001_PROTOCOL_AGGREGATE_DIGEST);
  });
});

describe("DRA-GEN-001 protocol freeze — preserved parameters match the live protocol module exactly (no silent divergence)", () => {
  it("frozen sample size equals the live recommended sample size", () => {
    expect(FROZEN_SAMPLE_SIZE).toBe(RECOMMENDED_SAMPLE_SIZE);
    expect(FROZEN_SAMPLE_SIZE).toBe(100);
  });

  it("frozen stratum allocation equals the live hard-strata allocation exactly", () => {
    for (const s of HARD_STRATA) {
      expect(FROZEN_STRATUM_ALLOCATION[s.id]).toBe(s.allocationFraction);
    }
  });
});

describe("DRA-GEN-001 protocol freeze — scope interpretation preserves GC-1's script/language boundary", () => {
  it("explicitly denies that the non-English stratum extends to unvalidated scripts", () => {
    const lower = SCOPE_INTERPRETATION_STATEMENT.toLowerCase();
    expect(lower).toMatch(/rtl/);
    expect(lower).toMatch(/devanagari/);
    expect(lower).toMatch(/scriptio/);
    expect(lower).toMatch(/does not broaden/);
  });
});

describe("DRA-GEN-001 protocol freeze — no blind sample exists at freeze time", () => {
  it("the blind-sample manifest reference is explicitly null at protocol-freeze time", () => {
    expect(GEN001_BLIND_SAMPLE_MANIFEST_REFERENCE_AT_FREEZE_TIME).toBeNull();
  });
});
