/**
 * DRA-001-04A — Benchmark Corpus — Identifier Tests
 */

import { describe, it, expect } from "vitest";
import {
  CorpusIdSchema,
  tryParseCorpusId,
  corpusIdSequence,
  CORPUS_ID_REGEX,
} from "../schema.js";

describe("CorpusId — format validation", () => {
  it("accepts a valid four-digit ID", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-0001").success).toBe(true);
  });

  it("accepts DRA-DOC-0000", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-0000").success).toBe(true);
  });

  it("accepts DRA-DOC-9999", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-9999").success).toBe(true);
  });

  it("rejects a three-digit sequence", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-001").success).toBe(false);
  });

  it("rejects a five-digit sequence", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-00001").success).toBe(false);
  });

  it("rejects wrong prefix", () => {
    expect(CorpusIdSchema.safeParse("DOC-0001").success).toBe(false);
  });

  it("rejects lowercase prefix", () => {
    expect(CorpusIdSchema.safeParse("dra-doc-0001").success).toBe(false);
  });

  it("rejects letters in sequence", () => {
    expect(CorpusIdSchema.safeParse("DRA-DOC-00A1").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(CorpusIdSchema.safeParse("").success).toBe(false);
  });

  it("rejects numeric-only string", () => {
    expect(CorpusIdSchema.safeParse("0001").success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(CorpusIdSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("tryParseCorpusId", () => {
  it("returns the ID for a valid string", () => {
    expect(tryParseCorpusId("DRA-DOC-0042")).toBe("DRA-DOC-0042");
  });

  it("returns null for a malformed string", () => {
    expect(tryParseCorpusId("DRA-DOC-42")).toBeNull();
  });

  it("returns null for a number", () => {
    expect(tryParseCorpusId(42)).toBeNull();
  });

  it("returns null for null", () => {
    expect(tryParseCorpusId(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(tryParseCorpusId(undefined)).toBeNull();
  });
});

describe("corpusIdSequence", () => {
  it("returns 1 for DRA-DOC-0001", () => {
    expect(corpusIdSequence("DRA-DOC-0001")).toBe(1);
  });

  it("returns 0 for DRA-DOC-0000", () => {
    expect(corpusIdSequence("DRA-DOC-0000")).toBe(0);
  });

  it("returns 9999 for DRA-DOC-9999", () => {
    expect(corpusIdSequence("DRA-DOC-9999")).toBe(9999);
  });

  it("returns 42 for DRA-DOC-0042", () => {
    expect(corpusIdSequence("DRA-DOC-0042")).toBe(42);
  });
});

describe("CORPUS_ID_REGEX", () => {
  it("matches valid IDs", () => {
    expect(CORPUS_ID_REGEX.test("DRA-DOC-0001")).toBe(true);
    expect(CORPUS_ID_REGEX.test("DRA-DOC-0100")).toBe(true);
  });

  it("does not match invalid IDs", () => {
    expect(CORPUS_ID_REGEX.test("DRA-DOC-001")).toBe(false);
    expect(CORPUS_ID_REGEX.test("DRA-DOC-00001")).toBe(false);
  });

  it("ordering: DRA-DOC-0001 sorts before DRA-DOC-0010 by sequence", () => {
    const ids = ["DRA-DOC-0010", "DRA-DOC-0001", "DRA-DOC-0005"];
    const sorted = [...ids].sort((a, b) => corpusIdSequence(a as never) - corpusIdSequence(b as never));
    expect(sorted).toEqual(["DRA-DOC-0001", "DRA-DOC-0005", "DRA-DOC-0010"]);
  });
});
