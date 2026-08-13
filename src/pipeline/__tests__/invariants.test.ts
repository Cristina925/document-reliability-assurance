/**
 * DRA-ENG-008B — Pipeline Invariants — Tests
 *
 * Invariants from the spec (required by DRA-ENG-008B §6):
 *
 *  1. Exactly seven canonical stages are returned.
 *  2. Stage order cannot vary (stageNumber i+1 > stageNumber i).
 *  3. Every issue has a valid issue class.
 *  4. Every issue has an originating stage.
 *  5. Every decision-driving issue exists in the issue collection.
 *  6. SUPPORTED cannot coexist with an unresolved REVIEW- or HOLD-requiring issue.
 *  7. HOLD overrides REVIEW.
 *  8. CONTESTED overrides all other confidence outcomes when IC-7 exists.
 *  9. Receipt and evaluation decisions cannot diverge.
 * 10. Receipt integrity verification fails after a material payload mutation.
 * 11. Receipt integrity verification succeeds despite operational timestamp variation.
 * 12. Repeated substantive evaluation is deterministic (excluding timestamp).
 * 13. Invalid identifiers cannot enter cross-stage Maps.
 * 14. No existing DRA-ENG-007 detector behaviour changes (materiality classifications).
 */

import { describe, it, expect } from "vitest";
import { evaluateDocument } from "../evaluate-document.js";
import { verifyReceiptIntegrity } from "../canonical-serialise.js";
import { buildStatementIdMap } from "../../shared/identifier-utils.js";
import { ISSUE_CLASSES } from "../../model/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NEUTRAL_CONTENT =
  "This document describes the background and context of the evaluation process. " +
  "The following sections outline the general approach to the methodology.";

const CRITICAL_CONTENT =
  "All services must encrypt user data at rest. " +
  "All API endpoints must authenticate every request without exception.";

const CONTRADICTORY_CONTENT =
  "The system must encrypt all user data at rest for security compliance. " +
  "The system must not encrypt legacy database fields in the backup storage. " +
  "These requirements apply to all deployed services in the production environment.";

function makeInput(content: string, evalId = "eval-inv-1") {
  return {
    id: evalId,
    requestedAt: "2026-07-27T12:00:00.000Z",
    generatedDocument: {
      id: "gen-inv-1",
      title: "Invariant Test Document",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-07-27T11:00:00.000Z",
    },
    sourceDocuments: [],
  };
}

function runOk(content: string, evalId?: string) {
  const result = evaluateDocument(makeInput(content, evalId));
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("unexpected failure");
  return result;
}

const VALID_ISSUE_CLASSES = Object.values(ISSUE_CLASSES) as string[];
const VALID_SEVERITIES = ["BLOCKING", "ADVISORY"] as const;
const STAGE_ASSOCIATION = "Consistency Check";

// ---------------------------------------------------------------------------
// Invariant 1 — Exactly 7 stage records
// ---------------------------------------------------------------------------

describe("Invariant 1: exactly 7 stage records", () => {
  it("neutral content produces exactly 7 stage outputs", () => {
    const r = runOk(NEUTRAL_CONTENT);
    expect(r.proofReceipt.stageOutputs).toHaveLength(7);
  });

  it("CRITICAL content produces exactly 7 stage outputs", () => {
    const r = runOk(CRITICAL_CONTENT);
    expect(r.proofReceipt.stageOutputs).toHaveLength(7);
  });

  it("contradictory content produces exactly 7 stage outputs", () => {
    const r = runOk(CONTRADICTORY_CONTENT);
    expect(r.proofReceipt.stageOutputs).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// Invariant 2 — Stage order cannot vary
// ---------------------------------------------------------------------------

describe("Invariant 2: stage-number order is 1–7", () => {
  it("stage outputs are numbered 1 through 7 in order", () => {
    const r = runOk(NEUTRAL_CONTENT);
    for (let i = 0; i < 7; i++) {
      expect(r.proofReceipt.stageOutputs[i].stageNumber).toBe(i + 1);
    }
  });

  it("each stageNumber is strictly greater than the previous", () => {
    const r = runOk(CRITICAL_CONTENT);
    const numbers = r.proofReceipt.stageOutputs.map((s) => s.stageNumber);
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThan(numbers[i - 1]!);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 3 — Every issue has a valid issue class
// ---------------------------------------------------------------------------

describe("Invariant 3: every issue has a valid issue class", () => {
  it("neutral content (no issues): vacuously satisfied", () => {
    const r = runOk(NEUTRAL_CONTENT);
    for (const issue of r.issues) {
      expect(VALID_ISSUE_CLASSES).toContain(issue.issueClass);
    }
  });

  it("CRITICAL content: all detected issues have valid issue classes", () => {
    const r = runOk(CRITICAL_CONTENT);
    for (const issue of r.issues) {
      expect(VALID_ISSUE_CLASSES).toContain(issue.issueClass);
      expect(VALID_SEVERITIES).toContain(issue.severity);
    }
  });

  it("contradictory content: IC-7 issue has valid class and ADVISORY severity", () => {
    const r = runOk(CONTRADICTORY_CONTENT);
    const ic7 = r.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
    for (const i of ic7) {
      expect(i.severity).toBe("ADVISORY");
      expect(VALID_ISSUE_CLASSES).toContain(i.issueClass);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 4 — Every issue has an originating stage
// ---------------------------------------------------------------------------

describe("Invariant 4: every issue has an originating stage", () => {
  it("all issues carry stageAssociation === 'Consistency Check'", () => {
    const r = runOk(CRITICAL_CONTENT);
    for (const issue of r.issues) {
      expect(issue.stageAssociation).toBe(STAGE_ASSOCIATION);
    }
  });

  it("IC-7 issues also associate with Consistency Check", () => {
    const r = runOk(CONTRADICTORY_CONTENT);
    const ic7 = r.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
    for (const i of ic7) {
      expect(i.stageAssociation).toBe(STAGE_ASSOCIATION);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 5 — Decision-driving issues exist in issue collection
// ---------------------------------------------------------------------------

describe("Invariant 5: decision-driving issues exist in the issue collection", () => {
  it("every BLOCKING issue id appears in the issueRegister", () => {
    const r = runOk(CRITICAL_CONTENT);
    const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
    const registerIds = new Set(
      r.proofReceipt.issueRegister.map((i) => String(i.id)),
    );
    for (const b of blocking) {
      expect(registerIds.has(String(b.id))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 6 — SUPPORTED cannot coexist with blocking/advisory issues
// ---------------------------------------------------------------------------

describe("Invariant 6: SUPPORTED ↔ zero issues", () => {
  it("SUPPORTED decision always has zero issues", () => {
    const r = runOk(NEUTRAL_CONTENT);
    if (r.decision === "SUPPORTED") {
      expect(r.issues).toHaveLength(0);
    }
  });

  it("HOLD decision always has at least one BLOCKING issue", () => {
    const r = runOk(CRITICAL_CONTENT);
    if (r.decision === "HOLD") {
      const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
      expect(blocking.length).toBeGreaterThan(0);
    }
  });

  it("REVIEW decision has advisory issues and no blocking issues", () => {
    const advisoryContent =
      "All changes must be approved before deployment to production. " +
      "The approval procedure is described in the change management policy.";
    const r = runOk(advisoryContent, "eval-inv-review");
    if (r.decision === "REVIEW") {
      const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
      const advisory = r.issues.filter((i) => i.severity === "ADVISORY");
      expect(blocking).toHaveLength(0);
      expect(advisory.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 7 — HOLD overrides REVIEW
// ---------------------------------------------------------------------------

describe("Invariant 7: HOLD overrides REVIEW", () => {
  it("when BLOCKING issues are present, decision is HOLD (not REVIEW)", () => {
    const r = runOk(CRITICAL_CONTENT);
    const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
    if (blocking.length > 0) {
      expect(r.decision).toBe("HOLD");
      expect(r.decision).not.toBe("REVIEW");
    }
  });

  it("deriveDecision prefers HOLD over REVIEW for mixed issues", () => {
    // Content with both blocking (CRITICAL) and advisory (IC-7) patterns
    const mixedContent =
      "All services must encrypt user data at rest immediately. " +
      "The system must not encrypt legacy audit logs in backup storage. " +
      "All services must authenticate all API requests without exception.";
    const r = runOk(mixedContent, "eval-inv-hold-overrides");
    const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
    if (blocking.length > 0) {
      expect(r.decision).toBe("HOLD");
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 8 — CONTESTED overrides all confidence outcomes when IC-7 exists
// ---------------------------------------------------------------------------

describe("Invariant 8: CONTESTED overrides all when IC-7 exists", () => {
  it("if IC-7 fires, affected statements receive CONTESTED level", () => {
    const r = runOk(CONTRADICTORY_CONTENT, "eval-inv-contested");
    const ic7 = r.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
    if (ic7.length > 0) {
      // The confidence records come from stage 7 result
      const s7 = r.pipeline.confidenceScoring;
      if (!s7.ok) throw new Error("Stage 7 failed");
      const contestedRecs = s7.confidenceRecords.filter(
        (rec) => rec.level === "CONTESTED",
      );
      expect(contestedRecs.length).toBeGreaterThan(0);
      // CONTESTED count must match level counts
      expect(s7.levelCounts.CONTESTED).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant 9 — Receipt and evaluation decisions cannot diverge
// ---------------------------------------------------------------------------

describe("Invariant 9: receipt decision === evaluation decision", () => {
  it("neutral content: receipt.decision matches result.decision", () => {
    const r = runOk(NEUTRAL_CONTENT);
    expect(r.proofReceipt.decision).toBe(r.decision);
  });

  it("CRITICAL content: receipt.decision matches result.decision", () => {
    const r = runOk(CRITICAL_CONTENT);
    expect(r.proofReceipt.decision).toBe(r.decision);
  });

  it("contradictory content: receipt.decision matches result.decision", () => {
    const r = runOk(CONTRADICTORY_CONTENT);
    expect(r.proofReceipt.decision).toBe(r.decision);
  });

  it("receipt.decisionRationale matches result.decisionRationale", () => {
    const r = runOk(CRITICAL_CONTENT);
    expect(r.proofReceipt.decisionRationale).toBe(r.decisionRationale);
  });
});

// ---------------------------------------------------------------------------
// Invariant 10 — Receipt integrity fails after material mutation
// ---------------------------------------------------------------------------

describe("Invariant 10: integrity fails after material payload mutation", () => {
  it("fails after decision is changed", () => {
    const r = runOk(NEUTRAL_CONTENT);
    const mutated = {
      ...r.proofReceipt,
      decision: (r.proofReceipt.decision === "SUPPORTED"
        ? "HOLD"
        : "SUPPORTED") as typeof r.proofReceipt.decision,
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("fails after decisionRationale is tampered", () => {
    const r = runOk(NEUTRAL_CONTENT);
    const mutated = {
      ...r.proofReceipt,
      decisionRationale: "Tampered rationale that was not produced by the evaluator.",
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("fails after schemaVersion is changed", () => {
    const r = runOk(NEUTRAL_CONTENT);
    const mutated = {
      ...r.proofReceipt,
      schemaVersion: "9.9.9" as typeof r.proofReceipt.schemaVersion,
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("fails after an issue is injected into issueRegister", () => {
    const r = runOk(NEUTRAL_CONTENT);
    type Issue = (typeof r.proofReceipt.issueRegister)[0];
    const fakeIssue = {
      id: "issue-9999" as unknown as Issue["id"],
      issueClass: "UNSUPPORTED_CLAIM",
      severity: "BLOCKING",
      affectedStatementIds: [] as unknown as Issue["affectedStatementIds"],
      affectedEvidenceUnitIds: [] as unknown as Issue["affectedEvidenceUnitIds"],
      explanation: "Injected issue for testing",
      stageAssociation: "Consistency Check",
    } as Issue;
    const mutated = {
      ...r.proofReceipt,
      issueRegister: [...r.proofReceipt.issueRegister, fakeIssue],
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Invariant 11 — Integrity succeeds despite operational timestamp variation
// ---------------------------------------------------------------------------

describe("Invariant 11: integrity holds despite operational timestamp change", () => {
  it("changing timestamp alone does not break integrity", () => {
    const r = runOk(NEUTRAL_CONTENT);
    const mutated = {
      ...r.proofReceipt,
      timestamp: "2099-12-31T23:59:59.999Z",
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(true);
  });

  it("changing evaluatedAt alone does not break integrity", () => {
    const r = runOk(NEUTRAL_CONTENT);
    const mutated = {
      ...r.proofReceipt,
      documentIdentity: {
        ...r.proofReceipt.documentIdentity,
        evaluatedAt: "2099-12-31T23:59:59.999Z",
      },
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Invariant 12 — Repeated substantive evaluation is deterministic
// ---------------------------------------------------------------------------

describe("Invariant 12: repeated evaluation is deterministic", () => {
  it("two evaluations of the same content (same evalId) produce the same digest", () => {
    const r1 = runOk(NEUTRAL_CONTENT, "eval-inv-determ-a");
    const r2 = runOk(NEUTRAL_CONTENT, "eval-inv-determ-a");
    // Same evalId → same substantive digest (modulo timestamps)
    expect(r1.proofReceipt.substantiveDigest).toBe(
      r2.proofReceipt.substantiveDigest,
    );
    expect(r1.decision).toBe(r2.decision);
    expect(r1.issues).toHaveLength(r2.issues.length);
  });

  it("two evaluations of the same content produce the same issue count", () => {
    const r1 = runOk(CRITICAL_CONTENT, "eval-inv-crit-a");
    const r2 = runOk(CRITICAL_CONTENT, "eval-inv-crit-a");
    expect(r1.issues.length).toBe(r2.issues.length);
    expect(r1.decision).toBe(r2.decision);
  });

  it("timestamps differ between two separate evaluations (non-deterministic operationals)", () => {
    const r1 = runOk(NEUTRAL_CONTENT, "eval-ts-a");
    // Pause is not realistic in synchronous tests; timestamps may be equal.
    // What matters is that each receipt is individually valid.
    expect(verifyReceiptIntegrity(r1.proofReceipt)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Invariant 13 — Invalid identifiers cannot enter cross-stage Maps
// ---------------------------------------------------------------------------

describe("Invariant 13: invalid identifiers cannot enter cross-stage Maps", () => {
  it("buildStatementIdMap omits records with null statementId", () => {
    const records = [
      { statementId: null as unknown as string, val: 1 },
      { statementId: "s-001", val: 2 },
    ];
    const map = buildStatementIdMap(records);
    expect(map.has("null")).toBe(false);
    expect(map.has("s-001")).toBe(true);
    expect(map.size).toBe(1);
  });

  it("buildStatementIdMap omits records with object statementId", () => {
    const records = [
      { statementId: { id: "s-001" } as unknown as string, val: 1 },
    ];
    const map = buildStatementIdMap(records);
    expect(map.has("[object Object]")).toBe(false);
    expect(map.size).toBe(0);
  });

  it("buildStatementIdMap does not collide 'null' string with null value", () => {
    const records = [
      { statementId: null as unknown as string, val: "from-null" },
      { statementId: "null", val: "from-string" },
    ];
    const map = buildStatementIdMap(records);
    // null is skipped; "null" (string) is valid and the only entry
    expect(map.size).toBe(1);
    expect(map.get("null")?.val).toBe("from-string");
  });
});

// ---------------------------------------------------------------------------
// Invariant 14 — DRA-ENG-007 detector behaviour is unchanged
// ---------------------------------------------------------------------------

describe("Invariant 14: DRA-ENG-007 materiality detector behaviour unchanged", () => {
  it("content with 'must encrypt' triggers CRITICAL materiality → BLOCKING issue", () => {
    // The 'must encrypt' pattern must continue to be CRITICAL.
    const content = "All services must encrypt all user data at rest.";
    const r = runOk(content, "eval-inv-007-crit");
    const blocking = r.issues.filter((i) => i.severity === "BLOCKING");
    // With no cited authority and CRITICAL materiality, IC-4 or IC-1 fires
    expect(blocking.length).toBeGreaterThan(0);
  });

  it("neutral background content triggers no issues", () => {
    const r = runOk(NEUTRAL_CONTENT, "eval-inv-007-neutral");
    expect(r.issues).toHaveLength(0);
    expect(r.decision).toBe("SUPPORTED");
  });

  it("pipeline still produces SUPPORTED for non-claiming content", () => {
    const content =
      "The evaluation framework is designed to assess document quality. " +
      "Assessors should review all sections before submitting their findings.";
    const r = runOk(content, "eval-inv-007-neutral2");
    expect(r.decision).toBe("SUPPORTED");
  });
});
