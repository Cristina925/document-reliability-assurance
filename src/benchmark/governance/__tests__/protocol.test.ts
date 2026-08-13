/**
 * DRA-001-04B — Selection Protocol Lifecycle Tests
 */

import { describe, it, expect } from "vitest";
import {
  buildMinimalProtocol,
  createProtocol,
  transitionProtocol,
  computeProtocolDigest,
  canAdmitDocuments,
  ProtocolTransitionError,
} from "../schema.js";
import type { BenchmarkSelectionProtocol } from "../schema.js";

function makeApproved(): BenchmarkSelectionProtocol {
  return transitionProtocol(buildMinimalProtocol(), "APPROVED");
}

describe("createProtocol — digest", () => {
  it("computes a 64-char protocolDigest on creation", () => {
    const p = buildMinimalProtocol();
    expect(p.protocolDigest).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(p.protocolDigest)).toBe(true);
  });

  it("same input → same protocolDigest (deterministic)", () => {
    const p1 = buildMinimalProtocol();
    const p2 = buildMinimalProtocol();
    expect(p1.protocolDigest).toBe(p2.protocolDigest);
  });

  it("changing targetCorpusSize changes the digest", () => {
    const p1 = buildMinimalProtocol();
    const p2 = buildMinimalProtocol({ targetCorpusSize: 100 });
    expect(p1.protocolDigest).not.toBe(p2.protocolDigest);
  });

  it("changing protocolId changes the digest", () => {
    const p1 = buildMinimalProtocol();
    const p2 = buildMinimalProtocol({ protocolId: "DRA-PROTO-OTHER" });
    expect(p1.protocolDigest).not.toBe(p2.protocolDigest);
  });

  it("protocol is frozen (immutable)", () => {
    const p = buildMinimalProtocol();
    expect(Object.isFrozen(p)).toBe(true);
  });
});

describe("Protocol lifecycle — valid forward transitions", () => {
  it("starts as DRAFT", () => {
    expect(buildMinimalProtocol().protocolStatus).toBe("DRAFT");
  });

  it("DRAFT → APPROVED succeeds", () => {
    const p = transitionProtocol(buildMinimalProtocol(), "APPROVED");
    expect(p.protocolStatus).toBe("APPROVED");
  });

  it("APPROVED → FROZEN succeeds", () => {
    const p = transitionProtocol(makeApproved(), "FROZEN");
    expect(p.protocolStatus).toBe("FROZEN");
  });

  it("FROZEN → SUPERSEDED succeeds", () => {
    const frozen = transitionProtocol(makeApproved(), "FROZEN");
    const p = transitionProtocol(frozen, "SUPERSEDED");
    expect(p.protocolStatus).toBe("SUPERSEDED");
  });

  it("APPROVED → SUPERSEDED succeeds (skip FROZEN)", () => {
    const p = transitionProtocol(makeApproved(), "SUPERSEDED");
    expect(p.protocolStatus).toBe("SUPERSEDED");
  });

  it("each transition recomputes the protocolDigest", () => {
    const draft = buildMinimalProtocol();
    const approved = transitionProtocol(draft, "APPROVED");
    expect(draft.protocolDigest).not.toBe(approved.protocolDigest);
  });
});

describe("Protocol lifecycle — backward transition rejection", () => {
  it("APPROVED → DRAFT throws BACKWARD_TRANSITION", () => {
    let caught: ProtocolTransitionError | undefined;
    try {
      transitionProtocol(makeApproved(), "DRAFT");
    } catch (e) {
      caught = e as ProtocolTransitionError;
    }
    expect(caught).toBeInstanceOf(ProtocolTransitionError);
    expect(caught?.code).toBe("BACKWARD_TRANSITION");
  });

  it("FROZEN → APPROVED throws BACKWARD_TRANSITION", () => {
    const frozen = transitionProtocol(makeApproved(), "FROZEN");
    let caught: ProtocolTransitionError | undefined;
    try {
      transitionProtocol(frozen, "APPROVED");
    } catch (e) {
      caught = e as ProtocolTransitionError;
    }
    expect(caught?.code).toBe("BACKWARD_TRANSITION");
  });

  it("SUPERSEDED → anything throws INVALID_TRANSITION", () => {
    const superseded = transitionProtocol(makeApproved(), "SUPERSEDED");
    let caught: ProtocolTransitionError | undefined;
    try {
      transitionProtocol(superseded, "DRAFT");
    } catch (e) {
      caught = e as ProtocolTransitionError;
    }
    expect(caught).toBeInstanceOf(ProtocolTransitionError);
  });
});

describe("canAdmitDocuments", () => {
  it("returns false for DRAFT", () => {
    expect(canAdmitDocuments(buildMinimalProtocol())).toBe(false);
  });

  it("returns true for APPROVED", () => {
    expect(canAdmitDocuments(makeApproved())).toBe(true);
  });

  it("returns false for FROZEN", () => {
    expect(canAdmitDocuments(transitionProtocol(makeApproved(), "FROZEN"))).toBe(false);
  });

  it("returns false for SUPERSEDED", () => {
    expect(canAdmitDocuments(transitionProtocol(makeApproved(), "SUPERSEDED"))).toBe(false);
  });
});
