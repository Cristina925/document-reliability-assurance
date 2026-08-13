/**
 * DRA-ENG-002 — Pipeline Stage Tests
 */

import { describe, it, expect } from "vitest";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_COUNT,
  PIPELINE_STAGE_METADATA,
  PipelineStageNameSchema,
  PipelineStageNumberSchema,
  getStageMetadata,
  getExpectedStageName,
  isPipelineStageName,
} from "../../model/pipeline-stages.js";
import { INVALID_STAGE_NAMES } from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Pipeline Stages", () => {
  describe("canonical constants", () => {
    it("PIPELINE_STAGE_COUNT is exactly 7", () => {
      expect(PIPELINE_STAGE_COUNT).toBe(7);
    });

    it("PIPELINE_STAGES has exactly 7 entries", () => {
      expect(PIPELINE_STAGES).toHaveLength(7);
    });

    it("PIPELINE_STAGES values are unique", () => {
      const unique = new Set(PIPELINE_STAGES);
      expect(unique.size).toBe(PIPELINE_STAGES.length);
    });
  });

  describe("frozen stage order (DRA-001 §5)", () => {
    const EXPECTED_ORDER = [
      "Input Normalisation",
      "Claim Extraction",
      "Authority Resolution",
      "Evidence Linkage",
      "Consistency Check",
      "Confidence Scoring",
      "Decision and Receipt",
    ] as const;

    for (let i = 0; i < EXPECTED_ORDER.length; i++) {
      const expected = EXPECTED_ORDER[i]!;
      it(`Stage ${i + 1} is "${expected}"`, () => {
        expect(PIPELINE_STAGES[i]).toBe(expected);
      });
    }

    it("stages are exactly the frozen list in the correct order", () => {
      expect([...PIPELINE_STAGES]).toStrictEqual([...EXPECTED_ORDER]);
    });
  });

  describe("PIPELINE_STAGE_METADATA", () => {
    it("has exactly 7 entries", () => {
      expect(PIPELINE_STAGE_METADATA).toHaveLength(7);
    });

    it("stage numbers are 1–7 in order", () => {
      for (let i = 0; i < PIPELINE_STAGE_METADATA.length; i++) {
        expect(PIPELINE_STAGE_METADATA[i]!.stageNumber).toBe(i + 1);
      }
    });

    it("stage names match PIPELINE_STAGES at corresponding index", () => {
      for (let i = 0; i < PIPELINE_STAGE_METADATA.length; i++) {
        expect(PIPELINE_STAGE_METADATA[i]!.stageName).toBe(PIPELINE_STAGES[i]);
      }
    });

    it("all descriptions are non-empty", () => {
      for (const meta of PIPELINE_STAGE_METADATA) {
        expect(meta.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("PipelineStageNameSchema", () => {
    for (const name of PIPELINE_STAGES) {
      it(`accepts "${name}"`, () => {
        expect(PipelineStageNameSchema.safeParse(name).success).toBe(true);
      });
    }

    for (const invalid of INVALID_STAGE_NAMES) {
      it(`rejects ${JSON.stringify(invalid)}`, () => {
        expect(PipelineStageNameSchema.safeParse(invalid).success).toBe(false);
      });
    }
  });

  describe("PipelineStageNumberSchema", () => {
    for (let n = 1; n <= 7; n++) {
      it(`accepts ${n}`, () => {
        expect(PipelineStageNumberSchema.safeParse(n).success).toBe(true);
      });
    }

    it("rejects 0", () => {
      expect(PipelineStageNumberSchema.safeParse(0).success).toBe(false);
    });

    it("rejects 8", () => {
      expect(PipelineStageNumberSchema.safeParse(8).success).toBe(false);
    });

    it("rejects non-integer", () => {
      expect(PipelineStageNumberSchema.safeParse(1.5).success).toBe(false);
    });
  });

  describe("getStageMetadata helper", () => {
    it("returns correct metadata for stage 1", () => {
      const meta = getStageMetadata(1);
      expect(meta?.stageName).toBe("Input Normalisation");
    });

    it("returns correct metadata for stage 7", () => {
      const meta = getStageMetadata(7);
      expect(meta?.stageName).toBe("Decision and Receipt");
    });

    it("returns undefined for stage 0", () => {
      expect(getStageMetadata(0)).toBeUndefined();
    });

    it("returns undefined for stage 8", () => {
      expect(getStageMetadata(8)).toBeUndefined();
    });
  });

  describe("getExpectedStageName helper", () => {
    it("returns 'Input Normalisation' for stage 1", () => {
      expect(getExpectedStageName(1)).toBe("Input Normalisation");
    });

    it("returns 'Decision and Receipt' for stage 7", () => {
      expect(getExpectedStageName(7)).toBe("Decision and Receipt");
    });
  });

  describe("isPipelineStageName helper", () => {
    it("returns true for all seven stage names", () => {
      for (const name of PIPELINE_STAGES) {
        expect(isPipelineStageName(name)).toBe(true);
      }
    });

    it("returns false for unknown stage name", () => {
      expect(isPipelineStageName("Unknown Stage")).toBe(false);
    });

    it("returns false for null", () => {
      expect(isPipelineStageName(null)).toBe(false);
    });
  });

  describe("no stage execution functions present", () => {
    it("PIPELINE_STAGES is a readonly tuple of strings, not functions", () => {
      for (const stage of PIPELINE_STAGES) {
        expect(typeof stage).toBe("string");
      }
    });
  });
});
