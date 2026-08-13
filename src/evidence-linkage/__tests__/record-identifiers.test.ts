/**
 * DRA-ENG-006 — Evidence Record Identifier Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  makeEvidenceRecordId,
  parseEvidenceRecordId,
  STAGE_4_RECORD_ID_PREFIX,
} from "../record-identifiers.js";

describe("DRA-ENG-006 evidence record-identifiers", () => {
  describe("STAGE_4_RECORD_ID_PREFIX", () => {
    it("equals 'ar4'", () => {
      expect(STAGE_4_RECORD_ID_PREFIX).toBe("ar4");
    });
  });

  describe("makeEvidenceRecordId", () => {
    it("produces ar4:{statementId} format", () => {
      expect(makeEvidenceRecordId("s2:0:47")).toBe("ar4:s2:0:47");
    });

    it("is deterministic", () => {
      expect(makeEvidenceRecordId("s2:1:100")).toBe(makeEvidenceRecordId("s2:1:100"));
    });

    it("different statementIds produce different record IDs", () => {
      expect(makeEvidenceRecordId("s2:0:10")).not.toBe(makeEvidenceRecordId("s2:0:20"));
    });

    it("starts with 'ar4:'", () => {
      expect(makeEvidenceRecordId("anything")).toMatch(/^ar4:/);
    });

    it("does not produce 'ar3:' prefix", () => {
      expect(makeEvidenceRecordId("s2:0:10")).not.toMatch(/^ar3:/);
    });

    it("handles empty string statementId", () => {
      expect(makeEvidenceRecordId("")).toBe("ar4:");
    });
  });

  describe("parseEvidenceRecordId", () => {
    it("parses ar4:{statementId} correctly", () => {
      expect(parseEvidenceRecordId("ar4:s2:0:47")).toStrictEqual({ statementId: "s2:0:47" });
    });

    it("returns null for non-ar4 prefix", () => {
      expect(parseEvidenceRecordId("s2:0:47")).toBeNull();
    });

    it("returns null for ar3: prefix", () => {
      expect(parseEvidenceRecordId("ar3:s2:0:47")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseEvidenceRecordId("")).toBeNull();
    });

    it("returns null for 'ar4:' with no statementId", () => {
      expect(parseEvidenceRecordId("ar4:")).toBeNull();
    });

    it("handles complex statementId with colons", () => {
      expect(parseEvidenceRecordId("ar4:s2:eval-x:doc-y:5")).toStrictEqual({
        statementId: "s2:eval-x:doc-y:5",
      });
    });

    it("is the inverse of makeEvidenceRecordId", () => {
      const ids = ["s2:0:10", "s2:1:50", "s2:99:1000"];
      for (const id of ids) {
        const recordId = makeEvidenceRecordId(id);
        expect(parseEvidenceRecordId(recordId)).toStrictEqual({ statementId: id });
      }
    });
  });
});
