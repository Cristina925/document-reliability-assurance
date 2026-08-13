/**
 * DRA-001-04B — Content Boundary Tests
 */

import { describe, it, expect } from "vitest";
import {
  buildContentPayload,
  computeContentDigest,
  verifyContentIntegrity,
} from "../eligibility.js";
import type { ContentPayload } from "../eligibility.js";

const SOURCE_TEXT = "This is the source document text.";
const GENERATED_TEXT = "This is the generated document output.";

describe("computeContentDigest", () => {
  it("returns a 64-char lowercase hex SHA-256", () => {
    const d = computeContentDigest(SOURCE_TEXT);
    expect(d).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(d)).toBe(true);
  });

  it("is deterministic for the same input", () => {
    expect(computeContentDigest(SOURCE_TEXT)).toBe(computeContentDigest(SOURCE_TEXT));
  });

  it("different content → different digest", () => {
    expect(computeContentDigest(SOURCE_TEXT)).not.toBe(
      computeContentDigest(GENERATED_TEXT),
    );
  });
});

describe("buildContentPayload", () => {
  it("creates a payload with correct contentDigest", () => {
    const p = buildContentPayload(SOURCE_TEXT, "SOURCE");
    expect(p.contentDigest).toBe(computeContentDigest(SOURCE_TEXT));
  });

  it("encoding is always 'utf-8'", () => {
    expect(buildContentPayload(SOURCE_TEXT, "SOURCE").encoding).toBe("utf-8");
  });

  it("contentType is preserved", () => {
    expect(buildContentPayload(SOURCE_TEXT, "SOURCE").contentType).toBe("SOURCE");
    expect(buildContentPayload(GENERATED_TEXT, "GENERATED").contentType).toBe("GENERATED");
  });

  it("content is preserved verbatim", () => {
    const p = buildContentPayload(SOURCE_TEXT, "SOURCE");
    expect(p.content).toBe(SOURCE_TEXT);
  });

  it("throws when content is empty", () => {
    expect(() => buildContentPayload("", "SOURCE")).toThrow();
  });

  it("returned payload is frozen", () => {
    expect(Object.isFrozen(buildContentPayload(SOURCE_TEXT, "SOURCE"))).toBe(true);
  });

  it("SOURCE and GENERATED are distinguishable by contentType", () => {
    const src = buildContentPayload(SOURCE_TEXT, "SOURCE");
    const gen = buildContentPayload(GENERATED_TEXT, "GENERATED");
    expect(src.contentType).toBe("SOURCE");
    expect(gen.contentType).toBe("GENERATED");
  });
});

describe("verifyContentIntegrity", () => {
  it("returns true for a correctly built payload", () => {
    const p = buildContentPayload(SOURCE_TEXT, "SOURCE");
    expect(verifyContentIntegrity(p)).toBe(true);
  });

  it("returns false when contentDigest does not match content", () => {
    const p: ContentPayload = {
      content: SOURCE_TEXT,
      contentDigest: "a".repeat(64),
      contentType: "SOURCE",
      encoding: "utf-8",
    };
    expect(verifyContentIntegrity(p)).toBe(false);
  });

  it("returns false after content is mutated (simulated)", () => {
    const p = buildContentPayload(SOURCE_TEXT, "SOURCE");
    const mutated: ContentPayload = { ...p, content: "Tampered content" };
    expect(verifyContentIntegrity(mutated)).toBe(false);
  });

  it("content changes alter the contentDigest", () => {
    const p1 = buildContentPayload("Version A", "GENERATED");
    const p2 = buildContentPayload("Version B", "GENERATED");
    expect(p1.contentDigest).not.toBe(p2.contentDigest);
  });

  it("missing content (empty string) is caught by builder, not verifier", () => {
    // The verifier accepts any payload; the builder prevents empty content.
    const p: ContentPayload = {
      content: "",
      contentDigest: computeContentDigest(""),
      contentType: "SOURCE",
      encoding: "utf-8",
    };
    // Digest matches → true (verifier does not enforce non-empty)
    expect(verifyContentIntegrity(p)).toBe(true);
  });
});
