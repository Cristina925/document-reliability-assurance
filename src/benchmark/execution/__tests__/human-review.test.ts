/**
 * DRA-001-06 — HumanReviewSession tests
 */

import { describe, it, expect } from "vitest";
import {
  createReviewSession,
  addSubmission,
  getSubmissionsForDocument,
  getReviewerIds,
  getSubmissionsByReviewer,
  submissionCount,
} from "../human-review.js";
import type { ReviewerSubmission } from "../human-review.js";
import { FIXED_TS, FIXED_SESSION_ID } from "./fixtures.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSubmission(
  reviewerId: string,
  corpusId: string,
  recommendation: "SUPPORTED" | "REVIEW" | "HOLD" = "SUPPORTED",
): ReviewerSubmission {
  return {
    reviewerId,
    corpusId: corpusId as `DRA-DOC-${string}`,
    submittedAt: FIXED_TS,
    issues: [],
    recommendation,
    confidence: "HIGH",
  };
}

function makeSubmissionWithIssue(
  reviewerId: string,
  corpusId: string,
): ReviewerSubmission {
  return {
    reviewerId,
    corpusId: corpusId as `DRA-DOC-${string}`,
    submittedAt: FIXED_TS,
    issues: [
      {
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        explanation: "The claim is not supported by the source material.",
      },
    ],
    recommendation: "HOLD",
    confidence: "HIGH",
    notes: "Reviewed thoroughly.",
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createReviewSession", () => {
  it("creates an empty session", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    expect(session.sessionId).toBe(FIXED_SESSION_ID);
    expect(session.createdAt).toBe(FIXED_TS);
    expect(session.submissions).toHaveLength(0);
  });

  it("session is frozen", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.submissions)).toBe(true);
  });
});

describe("addSubmission", () => {
  it("appends a submission to the session", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const sub = makeSubmission("reviewer-1", "DRA-DOC-0001");
    const updated = addSubmission(session, sub);
    expect(updated.submissions).toHaveLength(1);
    expect(updated.submissions[0]).toBe(sub);
  });

  it("does not mutate the original session", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const sub = makeSubmission("reviewer-1", "DRA-DOC-0001");
    addSubmission(session, sub);
    expect(session.submissions).toHaveLength(0);
  });

  it("supports multiple submissions from different reviewers", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-2", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0002"));
    expect(session.submissions).toHaveLength(3);
  });

  it("preserves issue data in submissions", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const sub = makeSubmissionWithIssue("reviewer-1", "DRA-DOC-0001");
    const updated = addSubmission(session, sub);
    expect(updated.submissions[0]!.issues).toHaveLength(1);
    expect(updated.submissions[0]!.issues[0]!.issueClass).toBe("UNSUPPORTED_CLAIM");
  });
});

describe("getSubmissionsForDocument", () => {
  it("returns only submissions for the specified corpusId", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-2", "DRA-DOC-0002"));
    session = addSubmission(session, makeSubmission("reviewer-3", "DRA-DOC-0001"));

    const forDoc1 = getSubmissionsForDocument(session, "DRA-DOC-0001" as `DRA-DOC-${string}`);
    expect(forDoc1).toHaveLength(2);
    expect(forDoc1.every((s) => s.corpusId === "DRA-DOC-0001")).toBe(true);
  });

  it("returns empty array when no submissions for that document", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    const result = getSubmissionsForDocument(session, "DRA-DOC-0099" as `DRA-DOC-${string}`);
    expect(result).toHaveLength(0);
  });
});

describe("getReviewerIds", () => {
  it("returns deduplicated reviewer IDs", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-2", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0002"));

    const ids = getReviewerIds(session);
    expect(ids).toHaveLength(2);
    expect(ids).toContain("reviewer-1");
    expect(ids).toContain("reviewer-2");
  });

  it("returns empty array for empty session", () => {
    const session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    expect(getReviewerIds(session)).toHaveLength(0);
  });
});

describe("getSubmissionsByReviewer", () => {
  it("returns only submissions from the specified reviewer", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-2", "DRA-DOC-0001"));
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0002"));

    const reviewer1 = getSubmissionsByReviewer(session, "reviewer-1");
    expect(reviewer1).toHaveLength(2);
    expect(reviewer1.every((s) => s.reviewerId === "reviewer-1")).toBe(true);
  });
});

describe("submissionCount", () => {
  it("returns total submission count", () => {
    let session = createReviewSession(FIXED_SESSION_ID, FIXED_TS);
    expect(submissionCount(session)).toBe(0);
    session = addSubmission(session, makeSubmission("reviewer-1", "DRA-DOC-0001"));
    expect(submissionCount(session)).toBe(1);
    session = addSubmission(session, makeSubmission("reviewer-2", "DRA-DOC-0001"));
    expect(submissionCount(session)).toBe(2);
  });
});

describe("ReviewerSubmission — optional fields", () => {
  it("notes is optional", () => {
    const sub = makeSubmission("reviewer-1", "DRA-DOC-0001");
    expect(sub.notes).toBeUndefined();
  });

  it("notes is preserved when provided", () => {
    const sub = makeSubmissionWithIssue("reviewer-1", "DRA-DOC-0001");
    expect(sub.notes).toBe("Reviewed thoroughly.");
  });
});
