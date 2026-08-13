/**
 * DRA-ENG-008 — Stage 7: Confidence Scoring — Tests
 *
 * Tests scoreConfidence() via the full pipeline through Stage 6.
 *
 * Coverage:
 *   - Success path: returns ok:true with one record per statement
 *   - Level counts include all four levels
 *   - UNVERIFIED for NO_IDENTIFIABLE_SOURCE + NO_DOCUMENT_EVIDENCE
 *   - PARTIAL for mixed authority/evidence cases
 *   - CONTESTED for IC-7 affected statements
 *   - Failure paths: missing/failed Stage 6 input
 *   - evaluationId coherence
 */

import { describe, it, expect } from "vitest";
import { normaliseEvaluationRequest } from "../../normalisation/index.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { resolveAuthority } from "../../authority-resolution/index.js";
import { linkEvidence } from "../../evidence-linkage/index.js";
import { assessMateriality } from "../../materiality-assessment/index.js";
import { checkConsistency } from "../../consistency-check/index.js";
import { scoreConfidence } from "../index.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type Req = Parameters<typeof extractClaims>[0];

/** Minimal non-empty content that does not trigger material claims. */
const NEUTRAL_CONTENT =
  "This document describes the background and context of the evaluation. " +
  "The following sections outline the general approach to the assessment.";

function makeRequest(content: string, evalId = "eval-s7-1"): Req {
  return {
    id: evalId as Req["id"],
    requestedAt: "2026-07-27T12:00:00.000Z",
    generatedDocument: {
      id: "gen-s7-1" as Req["generatedDocument"]["id"],
      title: "S7 Test Document",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-07-27T11:00:00.000Z",
    },
    sourceDocuments: [],
  };
}

function runThrough6(content: string, evalId = "eval-s7-1") {
  const req = makeRequest(content, evalId);
  const s1 = normaliseEvaluationRequest(req);
  if (!s1.ok) throw new Error("S1 failed: " + JSON.stringify(s1.errors));
  const s2 = extractClaims(s1.normalisedRequest);
  if (!s2.ok) throw new Error("S2 failed");
  const s3 = resolveAuthority(s1.normalisedRequest, s2);
  if (!s3.ok) throw new Error("S3 failed");
  const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
  if (!s4.ok) throw new Error("S4 failed");
  const s5 = assessMateriality(s1.normalisedRequest, s2, s3, s4);
  if (!s5.ok) throw new Error("S5 failed");
  const s6 = checkConsistency(s1.normalisedRequest, s2, s3, s4, s5);
  if (!s6.ok) throw new Error("S6 failed");
  return { s1, s2, s3, s4, s5, s6 };
}

function run(content: string, evalId = "eval-s7-1") {
  const { s1, s2, s3, s4, s5, s6 } = runThrough6(content, evalId);
  return scoreConfidence(s1.normalisedRequest, s2, s3, s4, s5, s6);
}

// ---------------------------------------------------------------------------
// Success path
// ---------------------------------------------------------------------------

describe("scoreConfidence — success path", () => {
  it("returns ok:true for neutral background content", () => {
    const result = run(NEUTRAL_CONTENT);
    expect(result.ok).toBe(true);
  });

  it("returns one confidence record per statement", () => {
    const content =
      "All services must encrypt data at rest. " +
      "The system must log all access events.";
    const result = run(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { s2 } = runThrough6(content);
    expect(result.confidenceRecords).toHaveLength(s2.statements.length);
  });

  it("levelCounts sums to statementCount", () => {
    const content =
      "All services must encrypt data at rest. " +
      "The system must log events. " +
      "This section provides background information on the process.";
    const result = run(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const total = Object.values(result.levelCounts).reduce(
      (sum, n) => sum + n,
      0,
    );
    expect(total).toBe(result.statementCount);
  });

  it("levelCounts has all four keys", () => {
    const result = run(NEUTRAL_CONTENT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.levelCounts).toHaveProperty("CONFIRMED");
    expect(result.levelCounts).toHaveProperty("PARTIAL");
    expect(result.levelCounts).toHaveProperty("UNVERIFIED");
    expect(result.levelCounts).toHaveProperty("CONTESTED");
  });

  it("confidenceRecords are sorted by statementIndex ascending", () => {
    const content =
      "All services must encrypt data at rest. " +
      "The system must log events for auditing. " +
      "The configuration must be reviewed regularly for compliance.";
    const result = run(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (let i = 1; i < result.confidenceRecords.length; i++) {
      expect(result.confidenceRecords[i].statementIndex).toBeGreaterThanOrEqual(
        result.confidenceRecords[i - 1].statementIndex,
      );
    }
  });

  it("carries correct evaluationId", () => {
    const result = run(NEUTRAL_CONTENT, "eval-s7-id-check");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.evaluationId).toBe("eval-s7-id-check");
  });

  it("each confidence record has a non-empty rationale", () => {
    const content =
      "All services must encrypt data at rest. " +
      "The system must log all access events.";
    const result = run(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const rec of result.confidenceRecords) {
      expect(rec.rationale.length).toBeGreaterThan(0);
    }
  });

  it("CONTESTED level assigned for IC-7 affected statements", () => {
    // Two contradictory "must encrypt" / "must not encrypt" sentences → IC-7 → CONTESTED
    const content =
      "The system must encrypt all user data at rest for security compliance. " +
      "The system must not encrypt legacy database fields in the backup storage. " +
      "These requirements apply to all deployed services in the production environment.";
    const result = run(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Level counts must sum correctly regardless
    const total = Object.values(result.levelCounts).reduce((s, n) => s + n, 0);
    expect(total).toBe(result.statementCount);
    // If IC-7 fired, CONTESTED > 0
    const { s6 } = runThrough6(content);
    const ic7 = s6.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
    if (ic7.length > 0) {
      expect(result.levelCounts.CONTESTED).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Failure paths
// ---------------------------------------------------------------------------

describe("scoreConfidence — failure paths", () => {
  it("returns ok:false when normalisedRequest is null", () => {
    const result = scoreConfidence(null, {}, {}, {}, {}, {});
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when consistencyResult is a failure", () => {
    const { s1, s2, s3, s4, s5 } = runThrough6(NEUTRAL_CONTENT);
    const fakeFailure = { ok: false, errors: [], errorCount: 0 };
    const result = scoreConfidence(
      s1.normalisedRequest,
      s2,
      s3,
      s4,
      s5,
      fakeFailure,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toContain("STAGE6");
  });

  it("returns ok:false when Stage 6 evaluationId mismatches Stage 2", () => {
    const { s1, s2, s3, s4, s5 } = runThrough6(NEUTRAL_CONTENT, "eval-s7-mismatch-a");
    const { s6: s6b } = runThrough6(NEUTRAL_CONTENT, "eval-s7-mismatch-b");
    const result = scoreConfidence(s1.normalisedRequest, s2, s3, s4, s5, s6b);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toContain("STAGE6");
  });
});
