/**
 * DRA-ENG-007 — Materiality Assessment — Record Identifier Tests
 */

import { describe, it, expect } from "vitest";
import {
  makeMaterialityRecordId,
  parseMaterialityRecordId,
  STAGE_5_RECORD_ID_PREFIX,
} from "../record-identifiers.js";

describe("STAGE_5_RECORD_ID_PREFIX", () => {
  it("is 'ar5'", () => {
    expect(STAGE_5_RECORD_ID_PREFIX).toBe("ar5");
  });

  it("is distinct from Stage 3 prefix (ar3) and Stage 4 prefix (ar4)", () => {
    expect(STAGE_5_RECORD_ID_PREFIX).not.toBe("ar3");
    expect(STAGE_5_RECORD_ID_PREFIX).not.toBe("ar4");
  });
});

describe("makeMaterialityRecordId", () => {
  it("produces ar5:{statementId}", () => {
    expect(makeMaterialityRecordId("s2:0:0")).toBe("ar5:s2:0:0");
  });

  it("works for various statement ID formats", () => {
    expect(makeMaterialityRecordId("s2:1:42")).toBe("ar5:s2:1:42");
    expect(makeMaterialityRecordId("s2:99:999")).toBe("ar5:s2:99:999");
  });

  it("is deterministic — same input always produces same output", () => {
    const id = "s2:5:120";
    expect(makeMaterialityRecordId(id)).toBe(makeMaterialityRecordId(id));
  });

  it("produces distinct IDs for distinct statement IDs", () => {
    const a = makeMaterialityRecordId("s2:0:0");
    const b = makeMaterialityRecordId("s2:0:10");
    expect(a).not.toBe(b);
  });

  it("handles empty statementId string (edge case)", () => {
    const id = makeMaterialityRecordId("");
    expect(id).toBe("ar5:");
  });

  it("handles statementId containing colons", () => {
    const id = makeMaterialityRecordId("s2:0:0:extra");
    expect(id).toBe("ar5:s2:0:0:extra");
  });
});

describe("parseMaterialityRecordId", () => {
  it("round-trips a generated ID back to the statementId", () => {
    const statementId = "s2:3:77";
    const recordId = makeMaterialityRecordId(statementId);
    const parsed = parseMaterialityRecordId(recordId);
    expect(parsed).not.toBeNull();
    expect(parsed!.statementId).toBe(statementId);
  });

  it("returns null for a Stage 4 record ID (wrong prefix)", () => {
    expect(parseMaterialityRecordId("ar4:s2:0:0")).toBeNull();
  });

  it("returns null for a Stage 3 record ID (wrong prefix)", () => {
    expect(parseMaterialityRecordId("ar3:s2:0:0")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseMaterialityRecordId("")).toBeNull();
  });

  it("returns null for prefix-only string with no statementId", () => {
    expect(parseMaterialityRecordId("ar5:")).toBeNull();
  });

  it("returns null for an unrelated string", () => {
    expect(parseMaterialityRecordId("some-random-id")).toBeNull();
  });

  it("extracts statementId with embedded colons correctly", () => {
    const parsed = parseMaterialityRecordId("ar5:s2:0:0:extra");
    expect(parsed).not.toBeNull();
    expect(parsed!.statementId).toBe("s2:0:0:extra");
  });
});
