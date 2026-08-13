/**
 * DRA-001-06 — Comparison engine tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import { BenchmarkRunner } from "../runner.js";
import type { BenchmarkRunResult } from "../runner.js";
import {
  createReviewSession,
  addSubmission,
} from "../human-review.js";
import type { HumanReviewSession } from "../human-review.js";
import { compareResults } from "../comparison.js";
import {
  FIXED_TS,
  FIXED_RUN_ID,
  FIXED_SESSION_ID,
  EXEC_DOC_1,
  EXEC_DOC_2,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

let runResult: BenchmarkRunResult;

beforeAll(() => {
  const runner = new BenchmarkRunner({ fixedTimestamp: FIXED_TS, fixedRunId: FIXED_RUN_ID });
  runResult = runner.execute([EXEC_DOC_1, EXEC_DOC_2]);
});

// ---------------------------------------------------------------------------
// No reviewer submissions
// ---------------------------------------------------------------------------

describe("compareResults — no reviewer submissions", () => {
  it("produces a comparison entry for every document", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    expect(result.documentCount).toBe(2);
    expect(result.comparisons).toHaveLength(2);
  });

  it("agreedIssueClasses is empty when no reviewers", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    for (const comp of result.comparisons) {
      expect(comp.agreedIssueClasses).toHaveLength(0);
    }
  });

  it("reviewerOnlyClasses is empty when no reviewers", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    for (const comp of result.comparisons) {
      expect(comp.reviewerOnlyClasses).toHaveLength(0);
    }
  });

  it("decisionComparisons is empty when no reviewers", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    for (const comp of result.comparisons) {
      expect(comp.decisionComparisons).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reviewer submissions — decision comparisons
// ---------------------------------------------------------------------------

describe("compareResults — decision agreement and disagreement", () => {
  let session: HumanReviewSession;
  let doc1Decision: "SUPPORTED" | "REVIEW" | "HOLD";

  beforeAll(() => {
    // Capture actual evaluator decision for doc 1
    const record = runResult.records.find((r) => r.corpusId === "DRA-DOC-0001")!;
    doc1Decision = record.evaluationResult.ok
      ? record.evaluationResult.decision
      : "SUPPORTED";

    // Reviewer agrees with evaluator on doc 1, disagrees on doc 2
    const disagreementDecision: "SUPPORTED" | "REVIEW" | "HOLD" =
      doc1Decision === "SUPPORTED" ? "HOLD" : "SUPPORTED";

    session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    // Reviewer 1 agrees with evaluator on doc 1
    session = addSubmission(session, {
      reviewerId: "reviewer-1",
      corpusId: "DRA-DOC-0001",
      submittedAt: FIXED_TS,
      issues: [],
      recommendation: doc1Decision,
      confidence: "HIGH",
    });
    // Reviewer 2 disagrees on doc 1
    session = addSubmission(session, {
      reviewerId: "reviewer-2",
      corpusId: "DRA-DOC-0001",
      submittedAt: FIXED_TS,
      issues: [],
      recommendation: disagreementDecision,
      confidence: "MEDIUM",
    });
  });

  it("records decision agreement for reviewer-1", () => {
    const result = compareResults(runResult, session);
    const doc1 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0001")!;
    const r1 = doc1.decisionComparisons.find((d) => d.reviewerId === "reviewer-1")!;
    expect(r1.agreed).toBe(true);
  });

  it("records decision disagreement for reviewer-2", () => {
    const result = compareResults(runResult, session);
    const doc1 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0001")!;
    const r2 = doc1.decisionComparisons.find((d) => d.reviewerId === "reviewer-2")!;
    expect(r2.agreed).toBe(false);
  });

  it("evaluatorDecision matches actual evaluator output", () => {
    const result = compareResults(runResult, session);
    const doc1 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0001")!;
    if (doc1.evaluatorDecision !== null) {
      expect(doc1.evaluatorDecision).toBe(doc1Decision);
    }
  });
});

// ---------------------------------------------------------------------------
// Reviewer submissions — issue class comparisons
// ---------------------------------------------------------------------------

describe("compareResults — issue class agreement", () => {
  it("agreed = evaluator ∩ reviewer issue classes", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    // Reviewer submits EVIDENCE_ABSENT regardless of evaluator output
    const updated = addSubmission(session, {
      reviewerId: "reviewer-1",
      corpusId: "DRA-DOC-0001",
      submittedAt: FIXED_TS,
      issues: [{ issueClass: "EVIDENCE_ABSENT", severity: "BLOCKING", explanation: "No evidence found." }],
      recommendation: "HOLD",
      confidence: "HIGH",
    });
    const result = compareResults(runResult, updated);
    const doc1 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0001")!;

    const evaluatorHasEvidenceAbsent = doc1.evaluatorIssueClasses.includes("EVIDENCE_ABSENT");
    if (evaluatorHasEvidenceAbsent) {
      expect(doc1.agreedIssueClasses).toContain("EVIDENCE_ABSENT");
    } else {
      expect(doc1.reviewerOnlyClasses).toContain("EVIDENCE_ABSENT");
      expect(doc1.agreedIssueClasses).not.toContain("EVIDENCE_ABSENT");
    }
  });

  it("evaluatorOnly = evaluator classes not in reviewer classes", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    // Empty reviewer submission — all evaluator classes become evaluatorOnly
    const updated = addSubmission(session, {
      reviewerId: "reviewer-1",
      corpusId: "DRA-DOC-0001",
      submittedAt: FIXED_TS,
      issues: [],
      recommendation: "SUPPORTED",
      confidence: "LOW",
    });
    const result = compareResults(runResult, updated);
    const doc1 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0001")!;
    // With no reviewer issues, all evaluator classes are evaluatorOnly
    expect(doc1.evaluatorOnlyClasses.length).toBe(doc1.evaluatorIssueClasses.length);
    expect(doc1.agreedIssueClasses).toHaveLength(0);
    expect(doc1.reviewerOnlyClasses).toHaveLength(0);
  });

  it("reviewerOnly = reviewer classes not in evaluator classes", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    // Reviewer submits an obscure class — if evaluator didn't detect it, it's reviewerOnly
    const updated = addSubmission(session, {
      reviewerId: "reviewer-1",
      corpusId: "DRA-DOC-0002",
      submittedAt: FIXED_TS,
      issues: [
        { issueClass: "SCOPE_VIOLATION", severity: "ADVISORY", explanation: "Scope exceeded." },
        { issueClass: "TRACEABILITY_BROKEN", severity: "ADVISORY", explanation: "Cannot trace." },
      ],
      recommendation: "REVIEW",
      confidence: "MEDIUM",
    });
    const result = compareResults(runResult, updated);
    const doc2 = result.comparisons.find((c) => c.corpusId === "DRA-DOC-0002")!;
    // All reviewer classes are either agreed or reviewerOnly
    const allReviewerClasses = ["SCOPE_VIOLATION", "TRACEABILITY_BROKEN"];
    for (const cls of allReviewerClasses) {
      const inAgreed = doc2.agreedIssueClasses.includes(cls as never);
      const inReviewerOnly = doc2.reviewerOnlyClasses.includes(cls as never);
      expect(inAgreed || inReviewerOnly).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Structural invariants
// ---------------------------------------------------------------------------

describe("compareResults — structural invariants", () => {
  it("result is frozen", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.comparisons)).toBe(true);
  });

  it("evaluatorIssueClasses has no duplicates", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = compareResults(runResult, session);
    for (const comp of result.comparisons) {
      const set = new Set(comp.evaluatorIssueClasses);
      expect(set.size).toBe(comp.evaluatorIssueClasses.length);
    }
  });
});
