/**
 * DRA-001-06 — BenchmarkRunner tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkRunner } from "../runner.js";
import {
  FIXED_TS,
  FIXED_RUN_ID,
  EXEC_DOC_1,
  EXEC_DOC_2,
  EXEC_DOC_3,
  ALL_EXEC_DOCS,
} from "./fixtures.js";

describe("BenchmarkRunner — empty corpus", () => {
  it("returns a valid run result for an empty document list", () => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
    const result = runner.execute([]);
    expect(result.documentCount).toBe(0);
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.records).toHaveLength(0);
    expect(result.runId).toBe(FIXED_RUN_ID);
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.completedAt).toBe(FIXED_TS);
  });
});

describe("BenchmarkRunner — single document", () => {
  let result: ReturnType<BenchmarkRunner["execute"]>;

  beforeAll(() => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
    result = runner.execute([EXEC_DOC_1]);
  });

  it("returns documentCount 1", () => {
    expect(result.documentCount).toBe(1);
  });

  it("preserves the corpus document in the record", () => {
    expect(result.records[0]!.corpusDocument).toBe(EXEC_DOC_1.corpusDocument);
  });

  it("corpusId matches the corpus document", () => {
    expect(result.records[0]!.corpusId).toBe("DRA-DOC-0001");
  });

  it("executedAt matches fixedTimestamp", () => {
    expect(result.records[0]!.executedAt).toBe(FIXED_TS);
  });

  it("produces an evaluation result", () => {
    expect(result.records[0]!.evaluationResult).toBeDefined();
  });

  it("tracks success count correctly", () => {
    const r = result.records[0]!;
    if (r.evaluationResult.ok) {
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
    } else {
      expect(result.failureCount).toBe(1);
      expect(result.successCount).toBe(0);
    }
  });
});

describe("BenchmarkRunner — multiple documents", () => {
  let result: ReturnType<BenchmarkRunner["execute"]>;

  beforeAll(() => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    result = runner.execute(ALL_EXEC_DOCS);
  });

  it("returns documentCount 3", () => {
    expect(result.documentCount).toBe(3);
  });

  it("preserves document order", () => {
    expect(result.records[0]!.corpusId).toBe("DRA-DOC-0001");
    expect(result.records[1]!.corpusId).toBe("DRA-DOC-0002");
    expect(result.records[2]!.corpusId).toBe("DRA-DOC-0003");
  });

  it("successCount + failureCount === documentCount", () => {
    expect(result.successCount + result.failureCount).toBe(result.documentCount);
  });

  it("all evaluated documents produce a decision (ok:true)", () => {
    for (const record of result.records) {
      if (record.evaluationResult.ok) {
        expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(
          record.evaluationResult.decision,
        );
      }
    }
  });

  it("successful evaluations include a proof receipt", () => {
    for (const record of result.records) {
      if (record.evaluationResult.ok) {
        expect(record.evaluationResult.proofReceipt).toBeDefined();
        expect(record.evaluationResult.proofReceipt.substantiveDigest).toHaveLength(64);
      }
    }
  });

  it("result object is frozen", () => {
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.records)).toBe(true);
  });
});

describe("BenchmarkRunner — options", () => {
  it("uses fixedRunId when provided", () => {
    const runner = new BenchmarkRunner({ fixedRunId: "my-custom-run" });
    const result = runner.execute([]);
    expect(result.runId).toBe("my-custom-run");
  });

  it("generates a runId from timestamp when fixedRunId is absent", () => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    const result = runner.execute([]);
    expect(typeof result.runId).toBe("string");
    expect(result.runId.length).toBeGreaterThan(0);
  });

  it("uses current time when no fixedTimestamp provided (startedAt is a valid ISO string)", () => {
    const before = new Date().toISOString();
    const runner = new BenchmarkRunner();
    const result = runner.execute([]);
    const after = new Date().toISOString();
    expect(result.startedAt >= before).toBe(true);
    expect(result.startedAt <= after).toBe(true);
  });

  it("evaluateDocument is called for every document even when mixed success/failure", () => {
    const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS });
    const result = runner.execute([EXEC_DOC_1, EXEC_DOC_2, EXEC_DOC_3]);
    expect(result.records).toHaveLength(3);
    expect(result.documentCount).toBe(3);
  });
});
