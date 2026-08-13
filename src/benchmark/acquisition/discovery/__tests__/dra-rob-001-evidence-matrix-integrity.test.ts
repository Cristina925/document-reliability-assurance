/**
 * DRA-ROB-001 — Robustness Evidence Coverage and Remaining-Gap Review
 *
 * This is an ANALYSIS/CHECKPOINT programme: no document is acquired, no
 * production evaluator behaviour is modified, and no historical benchmark
 * result is changed here. This file exists solely to make two specific
 * claims made in `docs/dra/DRA-ROB-001-ROBUSTNESS-EVIDENCE-REVIEW.md`
 * machine-verifiable, cheaply, without re-running any full-corpus evaluator
 * pass:
 *
 *   1. The base shared corpus fixtures used across every DRA-ACQ-018+
 *      admission test (`BENCHMARK_CORPUS`, `PRIOR_CORPUS_ENTRIES`) are
 *      exactly the 22 sequential documents DRA-DOC-0001..DRA-DOC-0022, with
 *      no document DRA-DOC-0033 present anywhere in them — consistent with
 *      DRA-ROB-001 Section K's statement that DRA-DOC-0033 remains
 *      unadmitted.
 *   2. The existing DRA-ACQ-028 Phase 1 robustness evidence map
 *      (`ROBUSTNESS_EVIDENCE_MAP`) and its ranked-gap output
 *      (`RANKED_REMAINING_GAPS`) — which DRA-ROB-001 Section B explicitly
 *      reuses rather than reinvents — still rank "non-Latin scripts" as the
 *      single highest-value remaining gap, which is the load-bearing claim
 *      behind DRA-ROB-001 Sections F, H, and L.
 *
 * Document-count reconciliation for DRA-DOC-0023..DRA-DOC-0032 (the ten
 * documents admitted after the shared base fixtures were frozen) was
 * performed by direct inspection of the corresponding
 * `dra-acq-0{20..29}-*-admission.test.ts` files in this session, not by an
 * automated test, because those ten records are reconstructed independently
 * inside each acquisition's own admission test file (by design — each
 * acquisition test freezes its own view of "everything admitted so far") and
 * are not re-exported from a single shared module the way the base 22 are.
 */

import { describe, expect, it } from "vitest";
import { BENCHMARK_CORPUS, BENCHMARK_CORPUS_SIZE } from "../../../evidence/corpus-data.js";
import { PRIOR_CORPUS_ENTRIES } from "../../../execution/__tests__/dra-bmk-023-prior-entries.js";
import {
  HIGHEST_VALUE_GAP,
  RANKED_REMAINING_GAPS,
  ROBUSTNESS_EVIDENCE_MAP,
} from "../dra-acq-028-non-latin-script-discovery.js";

describe("DRA-ROB-001 — shared base corpus fixture integrity", () => {
  it("BENCHMARK_CORPUS contains exactly DRA-DOC-0001..DRA-DOC-0006", () => {
    expect(BENCHMARK_CORPUS_SIZE).toBe(6);
    expect(BENCHMARK_CORPUS).toHaveLength(6);
    const ids = BENCHMARK_CORPUS.map((entry) => entry.input.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001",
      "DRA-DOC-0002",
      "DRA-DOC-0003",
      "DRA-DOC-0004",
      "DRA-DOC-0005",
      "DRA-DOC-0006",
    ]);
  });

  it("PRIOR_CORPUS_ENTRIES contains exactly DRA-DOC-0007..DRA-DOC-0022, sequential, no gaps", () => {
    expect(PRIOR_CORPUS_ENTRIES).toHaveLength(16);
    const ids = PRIOR_CORPUS_ENTRIES.map((entry) => entry.corpusId);
    const expected = Array.from({ length: 16 }, (_, i) =>
      `DRA-DOC-${String(i + 7).padStart(4, "0")}`,
    );
    expect(ids).toEqual(expected);
  });

  it("neither shared base fixture contains DRA-DOC-0033 (it is not yet admitted)", () => {
    const allIds = [
      ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
      ...PRIOR_CORPUS_ENTRIES.map((e) => e.corpusId),
    ];
    expect(allIds).not.toContain("DRA-DOC-0033");
    expect(allIds).not.toContain("DRA-DOC-0034");
  });
});

describe("DRA-ROB-001 — robustness evidence map and ranking still hold", () => {
  it("ROBUSTNESS_EVIDENCE_MAP still covers the 16-dimension evidence set DRA-ROB-001 Section B is built from", () => {
    expect(ROBUSTNESS_EVIDENCE_MAP.length).toBe(16);
    const dimensions = ROBUSTNESS_EVIDENCE_MAP.map((row) => row.dimension);
    expect(dimensions).toContain("non-Latin scripts");
    expect(dimensions).toContain("multi-column layout");
    expect(dimensions).toContain("compound/extreme documents combining several weaknesses");
  });

  it("non-Latin scripts row is still classified NOT_TESTED at the map's own layer (DRA-ROB-001 explicitly upgrades this to PARTIALLY_TESTED post-DOC-0032, without editing the underlying map)", () => {
    const row = ROBUSTNESS_EVIDENCE_MAP.find((r) => r.dimension === "non-Latin scripts");
    expect(row).toBeDefined();
    expect(row?.classification).toBe("NOT_TESTED");
  });

  it("non-Latin scripts remains the single highest-ranked remaining gap", () => {
    expect(HIGHEST_VALUE_GAP).toBe("non-Latin scripts");
    expect(RANKED_REMAINING_GAPS[0]?.dimension).toBe("non-Latin scripts");
    expect(RANKED_REMAINING_GAPS[0]?.rank).toBe(1);
  });

  it("multi-column layout and compound/extreme documents remain ranked below non-Latin scripts", () => {
    const byDimension = new Map(RANKED_REMAINING_GAPS.map((g) => [g.dimension, g.rank]));
    const nonLatinRank = byDimension.get("non-Latin scripts");
    const multiColumnRank = byDimension.get("multi-column layout");
    const compoundRank = byDimension.get("compound/extreme documents combining several weaknesses");
    expect(nonLatinRank).toBeDefined();
    expect(multiColumnRank).toBeDefined();
    expect(compoundRank).toBeDefined();
    expect(nonLatinRank as number).toBeLessThan(multiColumnRank as number);
    expect(nonLatinRank as number).toBeLessThan(compoundRank as number);
  });
});
