/**
 * DRA-001-07 — ReviewerSimulation tests
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  createSimulatedReviewSession,
  REVIEWER_GENERAL,
  REVIEWER_SPECIALIST,
  REVIEWER_IDS,
} from "../reviewer-simulation.js";
import {
  getSubmissionsForDocument,
  getReviewerIds,
  getSubmissionsByReviewer,
  submissionCount,
} from "../../execution/human-review.js";
import type { HumanReviewSession } from "../../execution/human-review.js";
import { BENCHMARK_CORPUS } from "../corpus-data.js";
import type { CorpusId } from "../../corpus/schema.js";

const FIXED_TS = "2026-07-27T14:00:00.000Z";
const SESSION_ID = "sim-session-test";

let session: HumanReviewSession;

beforeAll(() => {
  session = createSimulatedReviewSession(SESSION_ID, FIXED_TS);
});

// ---------------------------------------------------------------------------
// Session structure
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — session structure", () => {
  it("creates a session with the given sessionId", () => {
    expect(session.sessionId).toBe(SESSION_ID);
  });

  it("creates a session with the given createdAt", () => {
    expect(session.createdAt).toBe(FIXED_TS);
  });

  it("session is frozen", () => {
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.submissions)).toBe(true);
  });

  it("all submissions use the provided timestamp", () => {
    for (const sub of session.submissions) {
      expect(sub.submittedAt).toBe(FIXED_TS);
    }
  });
});

// ---------------------------------------------------------------------------
// Submission count
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — submission count", () => {
  it("contains exactly 12 submissions (2 reviewers × 6 documents)", () => {
    expect(submissionCount(session)).toBe(12);
  });

  it("has exactly 6 submissions from REV-001", () => {
    const rev001 = getSubmissionsByReviewer(session, REVIEWER_GENERAL);
    expect(rev001).toHaveLength(6);
  });

  it("has exactly 6 submissions from REV-002", () => {
    const rev002 = getSubmissionsByReviewer(session, REVIEWER_SPECIALIST);
    expect(rev002).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Document coverage
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — document coverage", () => {
  it("every benchmark document has at least one submission", () => {
    for (const entry of BENCHMARK_CORPUS) {
      const subs = getSubmissionsForDocument(session, entry.input.corpusId as CorpusId);
      expect(subs.length).toBeGreaterThan(0);
    }
  });

  it("every benchmark document has exactly 2 submissions (one per reviewer)", () => {
    for (const entry of BENCHMARK_CORPUS) {
      const subs = getSubmissionsForDocument(session, entry.input.corpusId as CorpusId);
      expect(subs).toHaveLength(2);
    }
  });

  it("both REV-001 and REV-002 submitted for every document", () => {
    for (const entry of BENCHMARK_CORPUS) {
      const subs = getSubmissionsForDocument(session, entry.input.corpusId as CorpusId);
      const reviewerIds = subs.map((s) => s.reviewerId);
      expect(reviewerIds).toContain(REVIEWER_GENERAL);
      expect(reviewerIds).toContain(REVIEWER_SPECIALIST);
    }
  });
});

// ---------------------------------------------------------------------------
// Reviewer ID constants
// ---------------------------------------------------------------------------

describe("REVIEWER_IDS", () => {
  it("contains exactly 2 reviewer IDs", () => {
    expect(REVIEWER_IDS).toHaveLength(2);
  });

  it("contains REV-001 and REV-002", () => {
    expect(REVIEWER_IDS).toContain(REVIEWER_GENERAL);
    expect(REVIEWER_IDS).toContain(REVIEWER_SPECIALIST);
  });

  it("getReviewerIds returns 2 unique reviewers", () => {
    const ids = getReviewerIds(session);
    expect(ids).toHaveLength(2);
    expect(ids).toContain(REVIEWER_GENERAL);
    expect(ids).toContain(REVIEWER_SPECIALIST);
  });
});

// ---------------------------------------------------------------------------
// Submission structural validity
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — submission validity", () => {
  it("all submissions have valid recommendation values", () => {
    const valid = ["SUPPORTED", "REVIEW", "HOLD"];
    for (const sub of session.submissions) {
      expect(valid).toContain(sub.recommendation);
    }
  });

  it("all submissions have valid confidence values", () => {
    const valid = ["HIGH", "MEDIUM", "LOW"];
    for (const sub of session.submissions) {
      expect(valid).toContain(sub.confidence);
    }
  });

  it("all submissions have valid corpus IDs", () => {
    for (const sub of session.submissions) {
      expect(sub.corpusId).toMatch(/^DRA-DOC-\d{4}$/);
    }
  });

  it("all issue submissions have non-empty explanations", () => {
    for (const sub of session.submissions) {
      for (const issue of sub.issues) {
        expect(issue.explanation.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("all issue submissions have valid issue classes", () => {
    const validClasses = [
      "UNSUPPORTED_CLAIM", "AUTHORITY_EXPIRED", "AUTHORITY_ABSENT",
      "EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "EVIDENCE_CONFLICT",
      "CLAIM_INCONSISTENCY", "TRACEABILITY_BROKEN", "SCOPE_VIOLATION",
    ];
    for (const sub of session.submissions) {
      for (const issue of sub.issues) {
        expect(validClasses).toContain(issue.issueClass);
      }
    }
  });

  it("all issue submissions have valid severity values", () => {
    const validSeverities = ["BLOCKING", "ADVISORY"];
    for (const sub of session.submissions) {
      for (const issue of sub.issues) {
        expect(validSeverities).toContain(issue.severity);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Reviewer variation (reviewers must not always agree)
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — reviewer variation", () => {
  it("reviewers disagree on at least one document recommendation", () => {
    let foundDisagreement = false;
    for (const entry of BENCHMARK_CORPUS) {
      const subs = getSubmissionsForDocument(session, entry.input.corpusId as CorpusId);
      const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL);
      const r2 = subs.find((s) => s.reviewerId === REVIEWER_SPECIALIST);
      if (r1 && r2 && r1.recommendation !== r2.recommendation) {
        foundDisagreement = true;
        break;
      }
    }
    expect(foundDisagreement).toBe(true);
  });

  it("reviewers agree on at least one document recommendation", () => {
    let foundAgreement = false;
    for (const entry of BENCHMARK_CORPUS) {
      const subs = getSubmissionsForDocument(session, entry.input.corpusId as CorpusId);
      const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL);
      const r2 = subs.find((s) => s.reviewerId === REVIEWER_SPECIALIST);
      if (r1 && r2 && r1.recommendation === r2.recommendation) {
        foundAgreement = true;
        break;
      }
    }
    expect(foundAgreement).toBe(true);
  });

  it("at least one document has zero issues from a reviewer (SUPPORTED)", () => {
    const supportedSubmissions = session.submissions.filter(
      (s) => s.recommendation === "SUPPORTED",
    );
    expect(supportedSubmissions.length).toBeGreaterThan(0);
  });

  it("at least one document has issues from a reviewer", () => {
    const submissionsWithIssues = session.submissions.filter(
      (s) => s.issues.length > 0,
    );
    expect(submissionsWithIssues.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Specific document spot checks
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — document spot checks", () => {
  it("DRA-DOC-0001: REV-001 recommends SUPPORTED with zero issues", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0001" as CorpusId);
    const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL)!;
    expect(r1.recommendation).toBe("SUPPORTED");
    expect(r1.issues).toHaveLength(0);
  });

  it("DRA-DOC-0002: both reviewers identified at least one issue", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0002" as CorpusId);
    for (const sub of subs) {
      expect(sub.issues.length).toBeGreaterThan(0);
    }
  });

  it("DRA-DOC-0002: REV-001 and REV-002 disagree on recommendation", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0002" as CorpusId);
    const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL)!;
    const r2 = subs.find((s) => s.reviewerId === REVIEWER_SPECIALIST)!;
    expect(r1.recommendation).not.toBe(r2.recommendation);
  });

  it("DRA-DOC-0003: both reviewers recommend SUPPORTED", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0003" as CorpusId);
    for (const sub of subs) {
      expect(sub.recommendation).toBe("SUPPORTED");
    }
  });

  it("DRA-DOC-0004: REV-002 identifies more issues than REV-001", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0004" as CorpusId);
    const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL)!;
    const r2 = subs.find((s) => s.reviewerId === REVIEWER_SPECIALIST)!;
    expect(r2.issues.length).toBeGreaterThan(r1.issues.length);
  });

  it("DRA-DOC-0005: both reviewers recommend REVIEW", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0005" as CorpusId);
    for (const sub of subs) {
      expect(sub.recommendation).toBe("REVIEW");
    }
  });

  it("DRA-DOC-0006: REV-001 recommends SUPPORTED and REV-002 recommends REVIEW", () => {
    const subs = getSubmissionsForDocument(session, "DRA-DOC-0006" as CorpusId);
    const r1 = subs.find((s) => s.reviewerId === REVIEWER_GENERAL)!;
    const r2 = subs.find((s) => s.reviewerId === REVIEWER_SPECIALIST)!;
    expect(r1.recommendation).toBe("SUPPORTED");
    expect(r2.recommendation).toBe("REVIEW");
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("createSimulatedReviewSession — determinism", () => {
  it("two calls with the same timestamp produce identical submissions", () => {
    const s1 = createSimulatedReviewSession("s1", FIXED_TS);
    const s2 = createSimulatedReviewSession("s2", FIXED_TS);
    expect(submissionCount(s1)).toBe(submissionCount(s2));
    for (let i = 0; i < s1.submissions.length; i++) {
      const a = s1.submissions[i]!;
      const b = s2.submissions[i]!;
      expect(a.reviewerId).toBe(b.reviewerId);
      expect(a.corpusId).toBe(b.corpusId);
      expect(a.recommendation).toBe(b.recommendation);
      expect(a.issues.length).toBe(b.issues.length);
    }
  });
});
