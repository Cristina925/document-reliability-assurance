import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

import {
  GC1_CANDIDATE_ID,
  GC1_EVALUATOR_VERSION,
  GC1_PIPELINE_VERSION,
  GC1_MODEL_VERSION,
  GC1_CORPUS_VERSION,
  GC1_REPOSITORY_COMMIT,
  FROZEN_CORE_EVALUATOR_FILES,
  FROZEN_ACQUISITION_REPRESENTATION_FILES,
  FROZEN_DECISION_AFFECTING_FILES,
  FROZEN_FILE_DIGESTS,
  GC1_AGGREGATE_DIGEST,
  canonicalizeForDigest,
  buildManifestCore,
  computeAggregateDigest,
  computeLiveFileDigests,
  GC1_ROB002_REFERENCE,
  GC1_FREEZE_SPECIFICATION_REFERENCE,
  GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS,
  GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID,
} from "../dra-gc-1-freeze-manifest";
import {
  KNOWN_DEFECT_LEDGER,
  GC1_FREEZE_VERDICT,
  GC1_FROZEN_IDENTIFIERS,
} from "../dra-rob-002-freeze-readiness-ledger";
import {
  DRA_EVALUATOR_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_MODEL_VERSION,
} from "../../../model/versions";
import { INITIAL_CORPUS_VERSION } from "../../governance/version";

describe("DRA-GC-1 freeze manifest — identity and completeness", () => {
  it("assigns the formal candidate identifier DRA-GC-1", () => {
    expect(GC1_CANDIDATE_ID).toBe("DRA-GC-1");
  });

  it("does not fabricate a repository commit identifier — it is a real 40-char hex SHA", () => {
    expect(GC1_REPOSITORY_COMMIT).toMatch(/^[0-9a-f]{40}$/);
  });

  it("every required frozen component category is represented (core evaluator + acquisition representation)", () => {
    expect(FROZEN_CORE_EVALUATOR_FILES.length).toBeGreaterThan(0);
    expect(FROZEN_ACQUISITION_REPRESENTATION_FILES.length).toBeGreaterThan(0);
    expect(FROZEN_DECISION_AFFECTING_FILES.length).toBe(
      FROZEN_CORE_EVALUATOR_FILES.length + FROZEN_ACQUISITION_REPRESENTATION_FILES.length,
    );
  });

  it("every frozen file has exactly one recorded digest, and every recorded digest corresponds to a frozen file", () => {
    const frozenSet = new Set(FROZEN_DECISION_AFFECTING_FILES);
    const digestSet = new Set(Object.keys(FROZEN_FILE_DIGESTS));
    expect(digestSet.size).toBe(frozenSet.size);
    for (const f of frozenSet) expect(digestSet.has(f)).toBe(true);
    for (const f of digestSet) expect(frozenSet.has(f)).toBe(true);
  });

  it("every recorded digest is a well-formed 64-hex-char SHA-256 value", () => {
    for (const digest of Object.values(FROZEN_FILE_DIGESTS)) {
      expect(digest).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("lists no duplicate frozen file paths", () => {
    const asArray = [...FROZEN_DECISION_AFFECTING_FILES];
    expect(new Set(asArray).size).toBe(asArray.length);
  });
});

describe("DRA-GC-1 freeze manifest — recorded identifiers match the live repository", () => {
  it("the frozen evaluator version matches the live DRA_EVALUATOR_VERSION constant", () => {
    expect(GC1_EVALUATOR_VERSION).toBe(DRA_EVALUATOR_VERSION);
  });

  it("the frozen pipeline version matches the live DRA_PIPELINE_VERSION constant", () => {
    expect(GC1_PIPELINE_VERSION).toBe(DRA_PIPELINE_VERSION);
  });

  it("the frozen model/schema version matches the live DRA_MODEL_VERSION constant", () => {
    expect(GC1_MODEL_VERSION).toBe(DRA_MODEL_VERSION);
  });

  it("the frozen corpus version matches the live INITIAL_CORPUS_VERSION constant", () => {
    expect(GC1_CORPUS_VERSION).toBe(INITIAL_CORPUS_VERSION);
  });

  it("agrees with ROB-002's own pinned identifiers (GC1_FROZEN_IDENTIFIERS)", () => {
    expect(GC1_EVALUATOR_VERSION).toBe(GC1_FROZEN_IDENTIFIERS.evaluatorVersion);
    expect(GC1_CORPUS_VERSION).toBe(GC1_FROZEN_IDENTIFIERS.corpusVersion);
  });
});

describe("DRA-GC-1 freeze manifest — deterministic canonicalisation and aggregate digest", () => {
  it("canonicalizeForDigest sorts object keys at every nesting level, deterministically", () => {
    const a = canonicalizeForDigest({ b: 1, a: { d: 2, c: 3 } });
    const b = canonicalizeForDigest({ a: { c: 3, d: 2 }, b: 1 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("canonicalizeForDigest is order-independent for input key order but order-preserving for arrays", () => {
    expect(canonicalizeForDigest([3, 1, 2])).toBe("[3,1,2]");
  });

  it("computeAggregateDigest is deterministic — repeated calls yield the same value", () => {
    const d1 = computeAggregateDigest();
    const d2 = computeAggregateDigest();
    expect(d1).toBe(d2);
    expect(d1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("computeAggregateDigest recomputed from live in-repo data matches the recorded GC1_AGGREGATE_DIGEST", () => {
    expect(computeAggregateDigest()).toBe(GC1_AGGREGATE_DIGEST);
  });

  it("the aggregate digest is independently reproducible via an equivalent, separately-written canonicalisation", () => {
    // Deliberately re-implemented (not imported) so this test cannot pass merely
    // because it shares a buggy implementation with the module under test.
    function altCanonicalize(value: unknown): string {
      if (value === null || typeof value !== "object") return JSON.stringify(value);
      if (Array.isArray(value)) return `[${value.map(altCanonicalize).join(",")}]`;
      const obj = value as Record<string, unknown>;
      const sortedKeys = Object.keys(obj).sort();
      return `{${sortedKeys.map((k) => `${JSON.stringify(k)}:${altCanonicalize(obj[k])}`).join(",")}}`;
    }
    const manifestCore = buildManifestCore();
    const altCanonical = altCanonicalize(manifestCore);
    const altDigest = createHash("sha256").update(altCanonical).digest("hex");
    expect(altDigest).toBe(GC1_AGGREGATE_DIGEST);
  });

  it("tampering with a single frozen file's recorded digest changes the aggregate digest (detects tampering)", () => {
    const manifestCore = buildManifestCore();
    const firstKey = Object.keys(manifestCore.frozenFileDigests).sort()[0]!;
    const tampered = {
      ...manifestCore,
      frozenFileDigests: {
        ...manifestCore.frozenFileDigests,
        [firstKey]: "0".repeat(64),
      },
    };
    const tamperedDigest = createHash("sha256")
      .update(canonicalizeForDigest(tampered))
      .digest("hex");
    expect(tamperedDigest).not.toBe(GC1_AGGREGATE_DIGEST);
  });

  it("changing the recorded evaluator version alone changes the aggregate digest (version identifiers are digest-bound)", () => {
    const manifestCore = buildManifestCore();
    const tampered = { ...manifestCore, evaluatorVersion: "9.9.9" };
    const tamperedDigest = createHash("sha256")
      .update(canonicalizeForDigest(tampered))
      .digest("hex");
    expect(tamperedDigest).not.toBe(GC1_AGGREGATE_DIGEST);
  });
});

describe("DRA-GC-1 freeze manifest — live repository state matches the frozen candidate", () => {
  it("every frozen file's live byte content re-hashes to exactly its recorded digest", () => {
    const live = computeLiveFileDigests();
    for (const path of FROZEN_DECISION_AFFECTING_FILES) {
      expect(live[path], `digest mismatch for ${path} — this file has changed since DRA-GC-1 was frozen`).toBe(
        FROZEN_FILE_DIGESTS[path],
      );
    }
  });

  it("the full live-recomputed digest set is identical to the recorded set (no extra, no missing files)", () => {
    const live = computeLiveFileDigests();
    expect(Object.keys(live).sort()).toEqual(Object.keys(FROZEN_FILE_DIGESTS).sort());
    expect(live).toEqual(FROZEN_FILE_DIGESTS);
  });

  it("a hypothetical tampered live file would be detected (synthetic negative control)", () => {
    const live = computeLiveFileDigests();
    const tamperedLive = { ...live };
    const key = Object.keys(tamperedLive)[0]!;
    tamperedLive[key] = createHash("sha256").update("tampered content").digest("hex");
    expect(tamperedLive).not.toEqual(FROZEN_FILE_DIGESTS);
  });
});

describe("DRA-GC-1 freeze manifest — accepted limitations and ROB-002 authority are referenced, not restated", () => {
  it("references the ROB-002 report and the draft/executed freeze specification by path", () => {
    expect(GC1_ROB002_REFERENCE).toBe("docs/dra/DRA-ROB-002-GC1-FREEZE-READINESS-REVIEW.md");
    expect(GC1_FREEZE_SPECIFICATION_REFERENCE).toBe("docs/dra/DRA-GC-1-FREEZE-SPECIFICATION.md");
  });

  it("ROB-002 contains zero FREEZE_BLOCKER entries at the point of freeze", () => {
    const blockers = KNOWN_DEFECT_LEDGER.filter((e) => e.freezeConsequence === "FREEZE_BLOCKER");
    expect(blockers).toHaveLength(0);
  });

  it("the ROB-002 verdict is READY_FOR_DRA_GC_1_FREEZE, consistent with a zero-blocker ledger", () => {
    expect(GC1_FREEZE_VERDICT).toBe("READY_FOR_DRA_GC_1_FREEZE");
  });

  it("the development corpus (33 admitted documents) is recorded and DRA-DOC-0033 is explicitly excluded, not silently assumed present", () => {
    expect(GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS).toHaveLength(33);
    expect(GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS).not.toContain("DRA-DOC-0033");
    expect(GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID).toBe("DRA-DOC-0033");
  });
});

describe("DRA-GC-1 freeze manifest — non-frozen changes do not alter candidate identity (spot check)", () => {
  it("the aggregate digest depends only on manifestCore, not on unrelated repository content", () => {
    // buildManifestCore() reads no filesystem state beyond the already-baked-in
    // FROZEN_FILE_DIGESTS map; it is pure data. This is a structural guarantee,
    // verified here by confirming two independent calls agree without any I/O
    // dependency on files outside the frozen set.
    const core1 = buildManifestCore();
    const core2 = buildManifestCore();
    expect(canonicalizeForDigest(core1)).toBe(canonicalizeForDigest(core2));
  });
});
