/**
 * DRA-ENG-008B — Identifier Utilities — Tests
 *
 * Coverage:
 *   - tryExtractId: valid, empty, null, undefined, number, boolean, object, array
 *   - requireId: valid, empty, null, undefined, number, object, array
 *   - buildStatementIdMap: valid records, mixed-invalid, empty array, duplicate keys
 *   - Map keying: no key collision from coercion; stable round-trip
 */

import { describe, it, expect } from "vitest";
import {
  tryExtractId,
  requireId,
  buildStatementIdMap,
  IdentifierValidationError,
} from "../identifier-utils.js";

// ---------------------------------------------------------------------------
// tryExtractId
// ---------------------------------------------------------------------------

describe("tryExtractId", () => {
  it("returns the string for a valid non-empty identifier", () => {
    expect(tryExtractId("s-001")).toBe("s-001");
  });

  it("returns the string for identifiers with internal spaces (exact match, no trim)", () => {
    expect(tryExtractId(" s-001")).toBe(" s-001");
  });

  it("returns null for an empty string", () => {
    expect(tryExtractId("")).toBeNull();
  });

  it("returns the whitespace-only string (not null) — no trimming applied", () => {
    // The identifier contract prohibits EMPTY strings only.
    // Whitespace-only strings have length > 0 and are returned as-is.
    // This documents that tryExtractId does NOT trim; callers that need
    // trimming must apply it before calling.
    expect(tryExtractId("   ")).toBe("   ");
  });

  it("returns null for null", () => {
    expect(tryExtractId(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(tryExtractId(undefined)).toBeNull();
  });

  it("returns null for a number", () => {
    expect(tryExtractId(42)).toBeNull();
    expect(tryExtractId(0)).toBeNull();
  });

  it("returns null for a boolean", () => {
    expect(tryExtractId(true)).toBeNull();
    expect(tryExtractId(false)).toBeNull();
  });

  it("returns null for a plain object", () => {
    expect(tryExtractId({ id: "s-001" })).toBeNull();
  });

  it("returns null for an array", () => {
    expect(tryExtractId(["s-001"])).toBeNull();
  });

  it("does not coerce null to the string 'null'", () => {
    const result = tryExtractId(null);
    expect(result).not.toBe("null");
    expect(result).toBeNull();
  });

  it("does not coerce undefined to the string 'undefined'", () => {
    const result = tryExtractId(undefined);
    expect(result).not.toBe("undefined");
    expect(result).toBeNull();
  });

  it("does not coerce an object to '[object Object]'", () => {
    const result = tryExtractId({});
    expect(result).not.toBe("[object Object]");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// requireId
// ---------------------------------------------------------------------------

describe("requireId", () => {
  it("returns the string for a valid non-empty identifier", () => {
    expect(requireId("ar3:s-001")).toBe("ar3:s-001");
  });

  it("throws IdentifierValidationError for an empty string", () => {
    expect(() => requireId("", "statementId")).toThrow(IdentifierValidationError);
    expect(() => requireId("", "statementId")).toThrow("must not be empty");
  });

  it("throws IdentifierValidationError for null", () => {
    expect(() => requireId(null, "statementId")).toThrow(IdentifierValidationError);
    expect(() => requireId(null, "statementId")).toThrow("null");
  });

  it("throws IdentifierValidationError for undefined", () => {
    expect(() => requireId(undefined, "statementId")).toThrow(
      IdentifierValidationError,
    );
  });

  it("throws IdentifierValidationError for a number", () => {
    expect(() => requireId(42, "statementId")).toThrow(IdentifierValidationError);
    expect(() => requireId(42, "statementId")).toThrow("number");
  });

  it("throws IdentifierValidationError for an array", () => {
    expect(() => requireId(["x"], "statementId")).toThrow(
      IdentifierValidationError,
    );
    expect(() => requireId(["x"], "statementId")).toThrow("array");
  });

  it("throws IdentifierValidationError for a plain object", () => {
    expect(() => requireId({ id: "x" }, "statementId")).toThrow(
      IdentifierValidationError,
    );
  });

  it("includes the fieldPath in the error message", () => {
    let msg = "";
    try {
      requireId(null, "myField");
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toContain("myField");
  });

  it("IdentifierValidationError.received carries the invalid value", () => {
    let err!: IdentifierValidationError;
    try {
      requireId(null, "fld");
    } catch (e) {
      err = e as IdentifierValidationError;
    }
    expect(err.received).toBeNull();
  });

  it("IdentifierValidationError is instanceof Error", () => {
    expect(() => requireId(null)).toThrow(Error);
  });
});

// ---------------------------------------------------------------------------
// buildStatementIdMap
// ---------------------------------------------------------------------------

describe("buildStatementIdMap", () => {
  it("builds a Map from records with valid statementId strings", () => {
    const records = [
      { statementId: "s-001", value: "A" },
      { statementId: "s-002", value: "B" },
    ];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(2);
    expect(map.get("s-001")?.value).toBe("A");
    expect(map.get("s-002")?.value).toBe("B");
  });

  it("omits records with null statementId", () => {
    const records = [
      { statementId: null as unknown as string, value: "bad" },
      { statementId: "s-001", value: "good" },
    ];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(1);
    expect(map.has("null")).toBe(false);
    expect(map.get("s-001")?.value).toBe("good");
  });

  it("omits records with undefined statementId", () => {
    const records = [
      { statementId: undefined as unknown as string, value: "bad" },
    ];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(0);
    expect(map.has("undefined")).toBe(false);
  });

  it("omits records with empty string statementId", () => {
    const records = [{ statementId: "" as unknown as string, value: "bad" }];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(0);
  });

  it("omits records with object statementId", () => {
    const records = [
      { statementId: { id: "x" } as unknown as string, value: "bad" },
    ];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(0);
    expect(map.has("[object Object]")).toBe(false);
  });

  it("handles empty input array", () => {
    const map = buildStatementIdMap([]);
    expect(map.size).toBe(0);
  });

  it("no accidental key collision from coercion (null and 'null' are distinct)", () => {
    const records = [
      { statementId: null as unknown as string, value: "from-null" },
      { statementId: "null" as string, value: "from-string-null" },
    ];
    const map = buildStatementIdMap(records);
    // null is omitted; "null" (the string) is a valid (if unusual) id
    expect(map.size).toBe(1);
    expect(map.get("null")?.value).toBe("from-string-null");
  });

  it("stable Map keying: same input produces same key set", () => {
    const records = [
      { statementId: "ar5:s-001", val: 1 },
      { statementId: "ar5:s-002", val: 2 },
    ];
    const map1 = buildStatementIdMap(records);
    const map2 = buildStatementIdMap(records);
    expect([...map1.keys()].sort()).toEqual([...map2.keys()].sort());
  });

  it("numeric statementId is omitted (not coerced to string)", () => {
    const records = [
      { statementId: 42 as unknown as string, value: "bad" },
    ];
    const map = buildStatementIdMap(records);
    expect(map.size).toBe(0);
    expect(map.has("42")).toBe(false);
  });
});
