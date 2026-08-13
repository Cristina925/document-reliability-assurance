/**
 * DRA-001-04B — Corpus Version Contract Tests
 */

import { describe, it, expect } from "vitest";
import {
  CORPUS_VERSION_REGEX,
  INITIAL_CORPUS_VERSION,
  CorpusVersionSchema,
  parseCorpusVersion,
  isValidCorpusVersion,
  incrementMajor,
  incrementMinor,
  incrementPatch,
  compareCorpusVersions,
} from "../version.js";

describe("CorpusVersionSchema — format validation", () => {
  it("accepts DRA-CORPUS-1.0.0", () => {
    expect(CorpusVersionSchema.safeParse("DRA-CORPUS-1.0.0").success).toBe(true);
  });

  it("accepts DRA-CORPUS-0.0.0", () => {
    expect(CorpusVersionSchema.safeParse("DRA-CORPUS-0.0.0").success).toBe(true);
  });

  it("accepts DRA-CORPUS-10.5.3", () => {
    expect(CorpusVersionSchema.safeParse("DRA-CORPUS-10.5.3").success).toBe(true);
  });

  it("rejects free-form '1.0'", () => {
    expect(CorpusVersionSchema.safeParse("1.0").success).toBe(false);
  });

  it("rejects two-part 'DRA-CORPUS-1.0'", () => {
    expect(CorpusVersionSchema.safeParse("DRA-CORPUS-1.0").success).toBe(false);
  });

  it("rejects non-numeric component 'DRA-CORPUS-1.A.0'", () => {
    expect(CorpusVersionSchema.safeParse("DRA-CORPUS-1.A.0").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(CorpusVersionSchema.safeParse("").success).toBe(false);
  });

  it("rejects lowercase prefix", () => {
    expect(CorpusVersionSchema.safeParse("dra-corpus-1.0.0").success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(CorpusVersionSchema.safeParse(undefined).success).toBe(false);
  });
});

describe("INITIAL_CORPUS_VERSION", () => {
  it("is a valid corpus version", () => {
    expect(isValidCorpusVersion(INITIAL_CORPUS_VERSION)).toBe(true);
  });

  it("is DRA-CORPUS-1.0.0", () => {
    expect(INITIAL_CORPUS_VERSION).toBe("DRA-CORPUS-1.0.0");
  });
});

describe("parseCorpusVersion", () => {
  it("parses major, minor, patch components", () => {
    const parsed = parseCorpusVersion("DRA-CORPUS-2.3.7");
    expect(parsed).toEqual({ major: 2, minor: 3, patch: 7, raw: "DRA-CORPUS-2.3.7" });
  });

  it("returns null for an invalid string", () => {
    expect(parseCorpusVersion("1.0")).toBeNull();
    expect(parseCorpusVersion("DRA-CORPUS-1.0")).toBeNull();
  });
});

describe("isValidCorpusVersion", () => {
  it("returns true for a valid version", () => {
    expect(isValidCorpusVersion("DRA-CORPUS-1.0.0")).toBe(true);
  });

  it("returns false for '1.0'", () => {
    expect(isValidCorpusVersion("1.0")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(isValidCorpusVersion(42)).toBe(false);
  });
});

describe("incrementMajor", () => {
  it("increments major and resets minor and patch", () => {
    expect(incrementMajor("DRA-CORPUS-1.2.3")).toBe("DRA-CORPUS-2.0.0");
  });

  it("does not mutate the original", () => {
    const v = "DRA-CORPUS-1.0.0";
    incrementMajor(v);
    expect(v).toBe("DRA-CORPUS-1.0.0");
  });
});

describe("incrementMinor", () => {
  it("increments minor and resets patch", () => {
    expect(incrementMinor("DRA-CORPUS-1.2.3")).toBe("DRA-CORPUS-1.3.0");
  });
});

describe("incrementPatch", () => {
  it("increments patch only", () => {
    expect(incrementPatch("DRA-CORPUS-1.2.3")).toBe("DRA-CORPUS-1.2.4");
  });
});

describe("compareCorpusVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareCorpusVersions("DRA-CORPUS-1.0.0", "DRA-CORPUS-1.0.0")).toBe(0);
  });

  it("returns -1 when a < b by major", () => {
    expect(compareCorpusVersions("DRA-CORPUS-1.0.0", "DRA-CORPUS-2.0.0")).toBe(-1);
  });

  it("returns 1 when a > b by major", () => {
    expect(compareCorpusVersions("DRA-CORPUS-2.0.0", "DRA-CORPUS-1.0.0")).toBe(1);
  });

  it("returns -1 when a < b by minor", () => {
    expect(compareCorpusVersions("DRA-CORPUS-1.0.0", "DRA-CORPUS-1.1.0")).toBe(-1);
  });

  it("returns -1 when a < b by patch", () => {
    expect(compareCorpusVersions("DRA-CORPUS-1.0.0", "DRA-CORPUS-1.0.1")).toBe(-1);
  });
});
