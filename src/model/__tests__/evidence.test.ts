/**
 * DRA-ENG-002 — Evidence Tests
 */

import { describe, it, expect } from "vitest";
import {
  EVIDENCE_RELATIONSHIP_TYPES,
  EvidenceRelationshipTypeSchema,
  EvidenceUnitSchema,
  EvidenceRelationshipSchema,
  validateEvidenceUnit,
  validateEvidenceRelationship,
} from "../../model/evidence.js";
import {
  VALID_EVIDENCE_UNIT,
  VALID_EVIDENCE_RELATIONSHIP,
} from "../../fixtures/model/valid.js";
import {
  INVALID_EVIDENCE_UNIT_EMPTY_PASSAGE,
  INVALID_EVIDENCE_UNIT_EMPTY_SOURCE_ID,
} from "../../fixtures/model/invalid.js";

describe("DRA-ENG-002 Evidence", () => {
  describe("EVIDENCE_RELATIONSHIP_TYPES", () => {
    it("contains SUPPORTING", () => {
      expect(EVIDENCE_RELATIONSHIP_TYPES).toContain("SUPPORTING");
    });

    it("contains CONFLICTING", () => {
      expect(EVIDENCE_RELATIONSHIP_TYPES).toContain("CONFLICTING");
    });

    it("contains MISSING", () => {
      expect(EVIDENCE_RELATIONSHIP_TYPES).toContain("MISSING");
    });

    it("has exactly 3 types", () => {
      expect(EVIDENCE_RELATIONSHIP_TYPES).toHaveLength(3);
    });
  });

  describe("EvidenceRelationshipTypeSchema", () => {
    for (const t of EVIDENCE_RELATIONSHIP_TYPES) {
      it(`accepts ${t}`, () => {
        expect(EvidenceRelationshipTypeSchema.safeParse(t).success).toBe(true);
      });
    }

    it("rejects unknown type", () => {
      expect(EvidenceRelationshipTypeSchema.safeParse("NEUTRAL").success).toBe(false);
    });

    it("rejects empty string", () => {
      expect(EvidenceRelationshipTypeSchema.safeParse("").success).toBe(false);
    });
  });

  describe("EvidenceUnit — valid fixture", () => {
    it("validates the valid fixture", () => {
      expect(validateEvidenceUnit(VALID_EVIDENCE_UNIT).success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = EvidenceUnitSchema.safeParse(VALID_EVIDENCE_UNIT);
      expect(result.success && result.data.id).toBe("ev-unit-001");
    });

    it("parsed fixture has non-empty passageText", () => {
      const result = EvidenceUnitSchema.safeParse(VALID_EVIDENCE_UNIT);
      if (result.success) {
        expect(result.data.passageText.length).toBeGreaterThan(0);
      }
    });
  });

  describe("EvidenceUnit — invalid fixtures", () => {
    it("rejects empty passageText", () => {
      expect(validateEvidenceUnit(INVALID_EVIDENCE_UNIT_EMPTY_PASSAGE).success).toBe(false);
    });

    it("rejects empty sourceDocumentId", () => {
      expect(validateEvidenceUnit(INVALID_EVIDENCE_UNIT_EMPTY_SOURCE_ID).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateEvidenceUnit(null).success).toBe(false);
    });

    it("rejects missing id", () => {
      expect(
        validateEvidenceUnit({ sourceDocumentId: "src-001", passageText: "text" }).success,
      ).toBe(false);
    });
  });

  describe("EvidenceUnit — optional fields", () => {
    it("accepts unit without spanRef", () => {
      const unit = {
        id: "ev-001",
        sourceDocumentId: "src-001",
        passageText: "A passage.",
      };
      expect(validateEvidenceUnit(unit).success).toBe(true);
    });
  });

  describe("EvidenceRelationship — valid fixture", () => {
    it("validates the valid fixture", () => {
      expect(validateEvidenceRelationship(VALID_EVIDENCE_RELATIONSHIP).success).toBe(true);
    });

    it("parsed fixture has correct id", () => {
      const result = EvidenceRelationshipSchema.safeParse(VALID_EVIDENCE_RELATIONSHIP);
      expect(result.success && result.data.id).toBe("ev-rel-001");
    });

    it("parsed fixture relationshipType is SUPPORTING", () => {
      const result = EvidenceRelationshipSchema.safeParse(VALID_EVIDENCE_RELATIONSHIP);
      expect(result.success && result.data.relationshipType).toBe("SUPPORTING");
    });
  });

  describe("EvidenceRelationship — invalid fixtures", () => {
    it("rejects unknown relationship type", () => {
      const bad = {
        id: "ev-rel-001",
        statementId: "stmt-001",
        evidenceUnitId: "ev-001",
        relationshipType: "NEUTRAL",
      };
      expect(validateEvidenceRelationship(bad).success).toBe(false);
    });

    it("rejects empty statementId", () => {
      const bad = {
        id: "ev-rel-001",
        statementId: "",
        evidenceUnitId: "ev-001",
        relationshipType: "SUPPORTING",
      };
      expect(validateEvidenceRelationship(bad).success).toBe(false);
    });

    it("rejects empty evidenceUnitId", () => {
      const bad = {
        id: "ev-rel-001",
        statementId: "stmt-001",
        evidenceUnitId: "",
        relationshipType: "SUPPORTING",
      };
      expect(validateEvidenceRelationship(bad).success).toBe(false);
    });

    it("rejects null", () => {
      expect(validateEvidenceRelationship(null).success).toBe(false);
    });
  });

  describe("EvidenceRelationship — optional fields", () => {
    it("explanation is optional", () => {
      const rel = {
        id: "ev-rel-001",
        statementId: "stmt-001",
        evidenceUnitId: "ev-001",
        relationshipType: "SUPPORTING",
      };
      const result = EvidenceRelationshipSchema.safeParse(rel);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.explanation).toBeUndefined();
      }
    });
  });
});
