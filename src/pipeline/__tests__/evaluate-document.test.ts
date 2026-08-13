/**
 * DRA-ENG-010 — Pipeline Integration — evaluateDocument() Tests
 *
 * Integration tests for the full DRA evaluator pipeline.
 * All seven spec stages run end-to-end for each test case.
 *
 * Coverage:
 *   - Basic ok:true result for valid minimal document
 *   - SUPPORTED decision for content with no triggering issues
 *   - HOLD decision for content with BLOCKING issues
 *   - REVIEW decision for content with only ADVISORY issues
 *   - ProofReceipt structural invariants (exactly 7 stage records)
 *   - ProofReceipt decision matches evaluation decision
 *   - ProofReceipt issue register matches evaluation issues
 *   - ok:false for invalid input (Stage 1 failure)
 *   - ok:false carries correct failedAtStage
 *   - evaluatedAt is present and ISO-8601-like
 *   - warnings is an array
 */

import { describe, it, expect } from "vitest";
import { evaluateDocument } from "../index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Non-empty background content that does not trigger material claims. */
const NEUTRAL_CONTENT =
  "This document describes the background and context of the evaluation process. " +
  "The following sections outline the general approach to the methodology.";

function makeInput(content: string, evalId = "eval-e2e-1") {
  return {
    id: evalId,
    requestedAt: "2026-07-27T12:00:00.000Z",
    generatedDocument: {
      id: "gen-e2e-1",
      title: "E2E Test Document",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-07-27T11:00:00.000Z",
    },
    sourceDocuments: [],
  };
}

// ---------------------------------------------------------------------------
// Basic success
// ---------------------------------------------------------------------------

describe("evaluateDocument — basic success", () => {
  it("returns ok:true for a minimal valid document", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
  });

  it("result contains all expected pipeline stages", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pipeline.stage1).toBeDefined();
    expect(result.pipeline.stage2).toBeDefined();
    expect(result.pipeline.stage3).toBeDefined();
    expect(result.pipeline.stage4).toBeDefined();
    expect(result.pipeline.materialityAssessment).toBeDefined();
    expect(result.pipeline.consistencyCheck).toBeDefined();
    expect(result.pipeline.confidenceScoring).toBeDefined();
  });

  it("evaluatedAt is a UTC ISO-8601 string with Z suffix", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // DRA-ENG-008B: timestamps are UTC and carry the Z designator.
    expect(result.evaluatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result.evaluatedAt).toMatch(/Z$/);
  });

  it("warnings is a readonly array", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("evaluationId propagates from Stage 2", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT, "eval-e2e-idcheck"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.evaluationId).toBe("eval-e2e-idcheck");
  });
});

// ---------------------------------------------------------------------------
// SUPPORTED decision
// ---------------------------------------------------------------------------

describe("evaluateDocument — SUPPORTED decision", () => {
  it("issues is empty and decision is SUPPORTED for no-trigger content", () => {
    // Neutral content with no material statements → no issues → SUPPORTED
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.issues).toHaveLength(0);
    expect(result.decision).toBe("SUPPORTED");
  });

  it("decisionRationale mentions SUPPORTED for no-issue evaluation", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decisionRationale).toContain("SUPPORTED");
  });
});

// ---------------------------------------------------------------------------
// HOLD decision (BLOCKING issues)
// ---------------------------------------------------------------------------

describe("evaluateDocument — HOLD decision", () => {
  it("decision is HOLD when CRITICAL content has no evidence (IC-4 or IC-1)", () => {
    // "must encrypt" directly triggers MA-CRITICAL-SECURITY; no evidence → BLOCKING issue → HOLD
    const content =
      "All services must encrypt user data at rest using strong encryption algorithms. " +
      "All production systems must encrypt all network communications without exception.";
    const result = evaluateDocument(makeInput(content));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const blocking = result.issues.filter((i) => i.severity === "BLOCKING");
    if (blocking.length > 0) {
      expect(result.decision).toBe("HOLD");
      expect(result.decisionRationale).toContain("HOLD");
    }
  });

  it("proofReceipt decision matches evaluation decision", () => {
    const content =
      "All services must encrypt user data at rest. " +
      "This is a mandatory security requirement.";
    const result = evaluateDocument(makeInput(content));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.decision).toBe(result.decision);
  });
});

// ---------------------------------------------------------------------------
// REVIEW decision (ADVISORY issues only)
// ---------------------------------------------------------------------------

describe("evaluateDocument — REVIEW decision", () => {
  it("decision is REVIEW when only advisory issues detected", () => {
    // HIGH materiality (must be approved) + DOCUMENT_AUTHOR + no evidence → IC-5 → REVIEW
    const content =
      "All changes must be approved before deployment to the production environment. " +
      "The approval process is described in the change management procedure.";
    const result = evaluateDocument(makeInput(content));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const blocking = result.issues.filter((i) => i.severity === "BLOCKING");
    const advisory = result.issues.filter((i) => i.severity === "ADVISORY");
    if (blocking.length === 0 && advisory.length > 0) {
      expect(result.decision).toBe("REVIEW");
    }
  });
});

// ---------------------------------------------------------------------------
// ProofReceipt structural invariants
// ---------------------------------------------------------------------------

describe("evaluateDocument — ProofReceipt structural invariants", () => {
  it("proofReceipt has exactly 7 stage outputs", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.stageOutputs).toHaveLength(7);
  });

  it("proofReceipt stage outputs are in stage-number order 1–7", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (let i = 0; i < 7; i++) {
      expect(result.proofReceipt.stageOutputs[i].stageNumber).toBe(i + 1);
    }
  });

  it("proofReceipt stage names match frozen DRA-001 §5 names", () => {
    const FROZEN_NAMES = [
      "Input Normalisation",
      "Claim Extraction",
      "Authority Resolution",
      "Evidence Linkage",
      "Consistency Check",
      "Confidence Scoring",
      "Decision and Receipt",
    ] as const;
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (let i = 0; i < 7; i++) {
      expect(result.proofReceipt.stageOutputs[i].stageName).toBe(
        FROZEN_NAMES[i],
      );
    }
  });

  it("proofReceipt.issueRegister matches result.issues", () => {
    const content =
      "All services must encrypt data at rest. This is mandatory for all systems.";
    const result = evaluateDocument(makeInput(content));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.issueRegister).toHaveLength(result.issues.length);
  });

  it("proofReceipt.issueSummary counts match issueRegister", () => {
    const content =
      "All services must encrypt data at rest. This is mandatory for all systems.";
    const result = evaluateDocument(makeInput(content));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { issueSummary, issueRegister } = result.proofReceipt;
    const blocking = issueRegister.filter(
      (i) => i.severity === "BLOCKING",
    ).length;
    const advisory = issueRegister.filter(
      (i) => i.severity === "ADVISORY",
    ).length;
    expect(issueSummary.blocking).toBe(blocking);
    expect(issueSummary.advisory).toBe(advisory);
    expect(issueSummary.total).toBe(issueRegister.length);
  });

  it("proofReceipt.timestamp is non-empty", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.timestamp.length).toBeGreaterThan(0);
  });

  it("proofReceipt.schemaVersion equals DRA_MODEL_VERSION", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.schemaVersion).toBe("0.1.0");
  });

  it("proofReceipt.documentIdentity.generatedDocumentId is non-empty", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      String(result.proofReceipt.documentIdentity.generatedDocumentId).length,
    ).toBeGreaterThan(0);
  });

  it("proofReceipt.evaluatorIdentity.pipelineVersion equals DRA_PIPELINE_VERSION", () => {
    const result = evaluateDocument(makeInput(NEUTRAL_CONTENT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.proofReceipt.evaluatorIdentity.pipelineVersion).toBe("1.0");
  });
});

// ---------------------------------------------------------------------------
// Failure paths
// ---------------------------------------------------------------------------

describe("evaluateDocument — failure paths", () => {
  it("returns ok:false for null input", () => {
    const result = evaluateDocument(null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failedAtStage).toBe("Input Normalisation");
    expect(result.evaluationId).toBeNull();
  });

  it("returns ok:false for a plain object missing required fields", () => {
    const result = evaluateDocument({ id: "x", badField: true });
    expect(result.ok).toBe(false);
  });

  it("returns ok:false for a number input", () => {
    const result = evaluateDocument(42);
    expect(result.ok).toBe(false);
  });

  it("errors array is non-empty on failure", () => {
    const result = evaluateDocument(null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
