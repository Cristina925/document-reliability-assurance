/**
 * DRA-ENG-005 — Record Identifier Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  makeAuthorityRecordId,
  parseAuthorityRecordId,
  STAGE_3_RECORD_ID_PREFIX,
} from "../record-identifiers.js";

describe("DRA-ENG-005 record-identifiers", () => {
  describe("STAGE_3_RECORD_ID_PREFIX", () => {
    it("equals 'ar3'", () => {
      expect(STAGE_3_RECORD_ID_PREFIX).toBe("ar3");
    });
  });

  describe("makeAuthorityRecordId", () => {
    it("produces ar3:{statementId} format", () => {
      expect(makeAuthorityRecordId("s2:0:47")).toBe("ar3:s2:0:47");
    });

    it("is deterministic — same input gives same output", () => {
      expect(makeAuthorityRecordId("s2:1:100")).toBe(makeAuthorityRecordId("s2:1:100"));
    });

    it("different statementIds produce different record IDs", () => {
      expect(makeAuthorityRecordId("s2:0:10")).not.toBe(makeAuthorityRecordId("s2:0:20"));
    });

    it("embeds the full statementId", () => {
      const id = makeAuthorityRecordId("s2:3:100");
      expect(id).toContain("s2:3:100");
    });

    it("starts with prefix 'ar3:'", () => {
      expect(makeAuthorityRecordId("anything")).toMatch(/^ar3:/);
    });

    it("handles empty string statementId (edge case — produces ar3:)", () => {
      const id = makeAuthorityRecordId("");
      expect(id).toBe("ar3:");
    });

    it("handles statementId with special characters", () => {
      const id = makeAuthorityRecordId("s2:eval-001:gen-doc-001:0");
      expect(id).toBe("ar3:s2:eval-001:gen-doc-001:0");
    });
  });

  describe("parseAuthorityRecordId", () => {
    it("parses ar3:{statementId} correctly", () => {
      const result = parseAuthorityRecordId("ar3:s2:0:47");
      expect(result).toStrictEqual({ statementId: "s2:0:47" });
    });

    it("returns null for non-ar3 prefix", () => {
      expect(parseAuthorityRecordId("s2:0:47")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseAuthorityRecordId("")).toBeNull();
    });

    it("returns null for 'ar3:' with no statementId", () => {
      expect(parseAuthorityRecordId("ar3:")).toBeNull();
    });

    it("returns null for 'ar2:something'", () => {
      expect(parseAuthorityRecordId("ar2:something")).toBeNull();
    });

    it("returns null for 'ar3' without colon", () => {
      expect(parseAuthorityRecordId("ar3")).toBeNull();
    });

    it("handles complex statementId with colons", () => {
      const result = parseAuthorityRecordId("ar3:s2:eval-x:doc-y:5");
      expect(result).toStrictEqual({ statementId: "s2:eval-x:doc-y:5" });
    });

    it("is the inverse of makeAuthorityRecordId for any valid statementId", () => {
      const stmtIds = ["s2:0:10", "s2:1:50", "s2:99:1000", "s2:eval-abc:gen-xyz:4"];
      for (const id of stmtIds) {
        const recordId = makeAuthorityRecordId(id);
        const parsed = parseAuthorityRecordId(recordId);
        expect(parsed).toStrictEqual({ statementId: id });
      }
    });
  });
});
