/**
 * DRA-ENG-008B — Canonical Serialisation and Integrity Digest — Tests
 *
 * Coverage:
 *   - canonicalJsonStringify: object key ordering, nested objects, arrays
 *   - computeDigestFromPayload: stability, sensitivity to changes, timestamp independence
 *   - verifyReceiptIntegrity: pass on unmodified, fail after mutation
 *   - Operational vs substantive field separation
 */

import { describe, it, expect } from "vitest";
import {
  canonicalJsonStringify,
  computeDigestFromPayload,
  verifyReceiptIntegrity,
} from "../canonical-serialise.js";
import { evaluateDocument } from "../evaluate-document.js";
import type { SubstantivePayloadInput } from "../canonical-serialise.js";
import type { ProofReceipt } from "../../model/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NEUTRAL_CONTENT =
  "This document describes the background and context of the evaluation process. " +
  "The following sections outline the general approach to the methodology.";

function makeInput(content: string, evalId = "eval-cs-1") {
  return {
    id: evalId,
    requestedAt: "2026-07-27T12:00:00.000Z",
    generatedDocument: {
      id: "gen-cs-1",
      title: "CS Test Document",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-07-27T11:00:00.000Z",
    },
    sourceDocuments: [],
  };
}

function getReceipt(content = NEUTRAL_CONTENT, evalId = "eval-cs-1"): ProofReceipt {
  const result = evaluateDocument(makeInput(content, evalId));
  if (!result.ok) throw new Error("evaluateDocument failed: " + JSON.stringify(result.errors));
  return result.proofReceipt;
}

function minimalPayload(): SubstantivePayloadInput {
  return {
    evaluationRequestId: "eval-001",
    evaluationResultId: "result-eval-001",
    schemaVersion: "0.1.0",
    documentIdentitySubstantive: {
      generatedDocumentId: "gen-001",
      generatedDocumentTitle: "Test Document",
    },
    evaluatorIdentity: { evaluatorVersion: "0.1.0", pipelineVersion: "1.0" },
    stageOutputs: [
      { stageNumber: 1, stageName: "Input Normalisation", output: { count: 1 } },
    ] as SubstantivePayloadInput["stageOutputs"],
    issueRegister: [],
    issueSummary: { total: 0, blocking: 0, advisory: 0 },
    decision: "SUPPORTED",
    decisionRationale: "No issues detected.",
  };
}

// ---------------------------------------------------------------------------
// canonicalJsonStringify
// ---------------------------------------------------------------------------

describe("canonicalJsonStringify", () => {
  it("sorts object keys lexicographically", () => {
    const obj = { z: 1, a: 2, m: 3 };
    const json = canonicalJsonStringify(obj);
    const parsed = JSON.parse(json) as object;
    expect(Object.keys(parsed)).toEqual(["a", "m", "z"]);
  });

  it("sorts nested object keys recursively", () => {
    const obj = { outer: { z: 1, a: 2 }, b: { y: 3, c: 4 } };
    const json = canonicalJsonStringify(obj);
    const parsed = JSON.parse(json) as Record<string, Record<string, number>>;
    expect(Object.keys(parsed)).toEqual(["b", "outer"]);
    expect(Object.keys(parsed["b"]!)).toEqual(["c", "y"]);
    expect(Object.keys(parsed["outer"]!)).toEqual(["a", "z"]);
  });

  it("preserves array element order (arrays are not sorted)", () => {
    const obj = { items: [3, 1, 2] };
    const json = canonicalJsonStringify(obj);
    const parsed = JSON.parse(json) as { items: number[] };
    expect(parsed.items).toEqual([3, 1, 2]);
  });

  it("two objects with same keys in different order produce the same string", () => {
    const a = canonicalJsonStringify({ z: 1, a: 2 });
    const b = canonicalJsonStringify({ a: 2, z: 1 });
    expect(a).toBe(b);
  });

  it("null values are preserved", () => {
    const json = canonicalJsonStringify({ a: null });
    expect(json).toContain("null");
  });

  it("undefined values are omitted (standard JSON behaviour)", () => {
    const json = canonicalJsonStringify({ a: 1, b: undefined });
    expect(json).not.toContain("b");
  });

  it("primitive values round-trip correctly", () => {
    expect(JSON.parse(canonicalJsonStringify(42))).toBe(42);
    expect(JSON.parse(canonicalJsonStringify("hello"))).toBe("hello");
    expect(JSON.parse(canonicalJsonStringify(true))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// computeDigestFromPayload
// ---------------------------------------------------------------------------

describe("computeDigestFromPayload", () => {
  it("returns a 64-character hex string (SHA-256)", () => {
    const digest = computeDigestFromPayload(minimalPayload());
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic: same payload → same digest", () => {
    const d1 = computeDigestFromPayload(minimalPayload());
    const d2 = computeDigestFromPayload(minimalPayload());
    expect(d1).toBe(d2);
  });

  it("changes when decision changes", () => {
    const base = minimalPayload();
    const changed = { ...base, decision: "HOLD" as const };
    expect(computeDigestFromPayload(base)).not.toBe(
      computeDigestFromPayload(changed),
    );
  });

  it("changes when decisionRationale changes", () => {
    const base = minimalPayload();
    const changed = { ...base, decisionRationale: "Different rationale." };
    expect(computeDigestFromPayload(base)).not.toBe(
      computeDigestFromPayload(changed),
    );
  });

  it("changes when schemaVersion changes", () => {
    const base = minimalPayload();
    const changed = { ...base, schemaVersion: "0.2.0" };
    expect(computeDigestFromPayload(base)).not.toBe(
      computeDigestFromPayload(changed),
    );
  });

  it("issueRegister insertion order does not affect digest (sorted internally)", () => {
    type FakeIssue = SubstantivePayloadInput["issueRegister"][0];
    const issue1 = {
      id: "issue-0001" as unknown as FakeIssue["id"],
      issueClass: "UNSUPPORTED_CLAIM",
      severity: "BLOCKING",
      affectedStatementIds: [] as unknown as FakeIssue["affectedStatementIds"],
      affectedEvidenceUnitIds: [] as unknown as FakeIssue["affectedEvidenceUnitIds"],
      explanation: "Test issue A",
      stageAssociation: "Consistency Check",
    } as FakeIssue;
    const issue2 = {
      id: "issue-0002" as unknown as FakeIssue["id"],
      issueClass: "AUTHORITY_ABSENT",
      severity: "ADVISORY",
      affectedStatementIds: [] as unknown as FakeIssue["affectedStatementIds"],
      affectedEvidenceUnitIds: [] as unknown as FakeIssue["affectedEvidenceUnitIds"],
      explanation: "Test issue B",
      stageAssociation: "Consistency Check",
    } as FakeIssue;
    const base = minimalPayload();
    const orderA = { ...base, issueRegister: [issue1, issue2] };
    const orderB = { ...base, issueRegister: [issue2, issue1] };
    expect(computeDigestFromPayload(orderA)).toBe(computeDigestFromPayload(orderB));
  });
});

// ---------------------------------------------------------------------------
// verifyReceiptIntegrity (round-trip via evaluateDocument)
// ---------------------------------------------------------------------------

describe("verifyReceiptIntegrity", () => {
  it("returns true for an unmodified receipt from evaluateDocument", () => {
    const receipt = getReceipt();
    expect(verifyReceiptIntegrity(receipt)).toBe(true);
  });

  it("returns false after mutating the decision field", () => {
    const receipt = getReceipt();
    // Construct a mutated copy (receipt is frozen; use spread)
    const mutated = {
      ...receipt,
      decision: (receipt.decision === "SUPPORTED" ? "HOLD" : "SUPPORTED") as typeof receipt.decision,
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("returns false after mutating decisionRationale", () => {
    const receipt = getReceipt();
    const mutated = { ...receipt, decisionRationale: "Tampered rationale." };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("returns false after mutating schemaVersion", () => {
    const receipt = getReceipt();
    const mutated = { ...receipt, schemaVersion: "9.9.9" as typeof receipt.schemaVersion };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("returns true when only the timestamp (operational) field changes", () => {
    const receipt = getReceipt();
    // Timestamp is operational — changing it must NOT change the digest
    const mutated = {
      ...receipt,
      timestamp: "2099-12-31T23:59:59.999Z",
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(true);
  });

  it("returns true when only documentIdentity.evaluatedAt (operational) changes", () => {
    const receipt = getReceipt();
    const mutated = {
      ...receipt,
      documentIdentity: {
        ...receipt.documentIdentity,
        evaluatedAt: "2099-12-31T23:59:59.999Z",
      },
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(true);
  });

  it("returns false after adding an issue to the issueRegister", () => {
    const receipt = getReceipt("All services must encrypt user data at rest.");
    type Issue = (typeof receipt.issueRegister)[0];
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
      ...receipt,
      issueRegister: [...receipt.issueRegister, fakeIssue],
    };
    expect(verifyReceiptIntegrity(mutated)).toBe(false);
  });

  it("repeated evaluations of the same content produce verifiable receipts", () => {
    // Each evaluation has a different timestamp but same substantive content.
    // Both receipts must individually pass integrity verification.
    const r1 = getReceipt(NEUTRAL_CONTENT, "eval-repeat-1");
    const r2 = getReceipt(NEUTRAL_CONTENT, "eval-repeat-2");
    expect(verifyReceiptIntegrity(r1)).toBe(true);
    expect(verifyReceiptIntegrity(r2)).toBe(true);
    // Different evaluationIds → different digests
    expect(r1.substantiveDigest).not.toBe(r2.substantiveDigest);
  });
});

// ---------------------------------------------------------------------------
// Substantive vs operational field separation
// ---------------------------------------------------------------------------

describe("Substantive / operational field separation", () => {
  it("proofReceipt.substantiveDigest is a 64-char hex string", () => {
    const receipt = getReceipt();
    expect(receipt.substantiveDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("proofReceipt.timestamp is a UTC ISO-8601 string with Z suffix", () => {
    const receipt = getReceipt();
    expect(receipt.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/);
  });

  it("proofReceipt.documentIdentity.evaluatedAt has Z suffix", () => {
    const receipt = getReceipt();
    expect(receipt.documentIdentity.evaluatedAt).toMatch(/Z$/);
  });

  it("operational timestamp does not propagate into substantive digest", () => {
    // Verify the digest is unchanged when timestamp changes.
    const receipt = getReceipt();
    const withDifferentTimestamp = {
      ...receipt,
      timestamp: "2040-01-01T00:00:00.000Z",
    };
    const d1 = computeDigestFromPayload({
      evaluationRequestId: String(receipt.evaluationRequestId),
      evaluationResultId: String(receipt.evaluationResultId),
      schemaVersion: receipt.schemaVersion,
      documentIdentitySubstantive: {
        generatedDocumentId: String(receipt.documentIdentity.generatedDocumentId),
        generatedDocumentTitle: receipt.documentIdentity.generatedDocumentTitle,
      },
      evaluatorIdentity: receipt.evaluatorIdentity,
      stageOutputs: receipt.stageOutputs,
      issueRegister: receipt.issueRegister,
      issueSummary: receipt.issueSummary,
      decision: receipt.decision,
      decisionRationale: receipt.decisionRationale,
    });
    const d2 = computeDigestFromPayload({
      evaluationRequestId: String(withDifferentTimestamp.evaluationRequestId),
      evaluationResultId: String(withDifferentTimestamp.evaluationResultId),
      schemaVersion: withDifferentTimestamp.schemaVersion,
      documentIdentitySubstantive: {
        generatedDocumentId: String(withDifferentTimestamp.documentIdentity.generatedDocumentId),
        generatedDocumentTitle: withDifferentTimestamp.documentIdentity.generatedDocumentTitle,
      },
      evaluatorIdentity: withDifferentTimestamp.evaluatorIdentity,
      stageOutputs: withDifferentTimestamp.stageOutputs,
      issueRegister: withDifferentTimestamp.issueRegister,
      issueSummary: withDifferentTimestamp.issueSummary,
      decision: withDifferentTimestamp.decision,
      decisionRationale: withDifferentTimestamp.decisionRationale,
    });
    expect(d1).toBe(d2);
  });
});
