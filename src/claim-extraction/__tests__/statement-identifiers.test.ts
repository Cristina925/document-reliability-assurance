/**
 * DRA-ENG-004 — Statement Identifier Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  makeStatementId,
  parseStatementId,
  statementsCollide,
  STAGE_2_STATEMENT_ID_PREFIX,
} from "../../claim-extraction/statement-identifiers.js";

describe("DRA-ENG-004 Statement Identifiers", () => {
  describe("makeStatementId", () => {
    it("produces s2:{start}:{end} format", () => {
      expect(String(makeStatementId(0, 47))).toBe("s2:0:47");
    });

    it("is deterministic — same offsets produce same ID", () => {
      const id1 = makeStatementId(10, 50);
      const id2 = makeStatementId(10, 50);
      expect(String(id1)).toBe(String(id2));
    });

    it("produces distinct IDs for different startOffset", () => {
      expect(String(makeStatementId(0, 50))).not.toBe(String(makeStatementId(1, 50)));
    });

    it("produces distinct IDs for different endOffset", () => {
      expect(String(makeStatementId(0, 50))).not.toBe(String(makeStatementId(0, 51)));
    });

    it("produces distinct IDs for both offsets different", () => {
      expect(String(makeStatementId(0, 10))).not.toBe(String(makeStatementId(5, 15)));
    });

    it("ID starts with the stage 2 prefix", () => {
      const id = makeStatementId(0, 10);
      expect(String(id)).toMatch(/^s2:/);
    });

    it("ID matches the s2:{d}:{d} pattern", () => {
      const id = makeStatementId(123, 456);
      expect(String(id)).toMatch(/^s2:\d+:\d+$/);
    });

    it("ID does not contain wall-clock time", () => {
      const before = Date.now();
      const id = String(makeStatementId(0, 10));
      const after = Date.now();
      // The ID should not contain any number that looks like a recent timestamp
      expect(parseInt(id.replace(/[^0-9]/g, ""), 10)).toBeLessThan(before);
      void after; // ensure closure
    });

    it("handles zero startOffset", () => {
      expect(String(makeStatementId(0, 5))).toBe("s2:0:5");
    });

    it("handles large offsets", () => {
      expect(String(makeStatementId(999999, 1000000))).toBe("s2:999999:1000000");
    });
  });

  describe("parseStatementId", () => {
    it("round-trips with makeStatementId", () => {
      const id = String(makeStatementId(42, 100));
      const parsed = parseStatementId(id);
      expect(parsed).toStrictEqual({ startOffset: 42, endOffset: 100 });
    });

    it("returns null for non-s2 format", () => {
      expect(parseStatementId("s1:0:10")).toBeNull();
      expect(parseStatementId("stmt-100")).toBeNull();
      expect(parseStatementId("0:10")).toBeNull();
      expect(parseStatementId("")).toBeNull();
    });

    it("returns null for s2 with non-numeric parts", () => {
      expect(parseStatementId("s2:abc:def")).toBeNull();
    });

    it("returns null for s2 with only one number", () => {
      expect(parseStatementId("s2:10")).toBeNull();
    });
  });

  describe("STAGE_2_STATEMENT_ID_PREFIX", () => {
    it("is 's2'", () => {
      expect(STAGE_2_STATEMENT_ID_PREFIX).toBe("s2");
    });
  });

  describe("statementsCollide", () => {
    it("returns true for identical IDs", () => {
      expect(statementsCollide("s2:0:10", "s2:0:10")).toBe(true);
    });

    it("returns false for different IDs", () => {
      expect(statementsCollide("s2:0:10", "s2:0:11")).toBe(false);
    });
  });

  describe("stability across positions", () => {
    it("identical text at different positions produces distinct IDs", () => {
      // Same text "compliant." at different offsets
      const id1 = String(makeStatementId(0, 10));  // first occurrence
      const id2 = String(makeStatementId(25, 35)); // second occurrence
      expect(id1).not.toBe(id2);
    });

    it("10,000 IDs from consecutive positions are all unique", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10000; i++) {
        ids.add(String(makeStatementId(i, i + 10)));
      }
      expect(ids.size).toBe(10000);
    });
  });
});
