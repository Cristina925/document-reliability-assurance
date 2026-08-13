/**
 * DRA-ENG-005 — Attribution Pattern Detection Unit Tests
 */

import { describe, it, expect } from "vitest";
import { detectAttribution, detectAuthorityType } from "../attribution-patterns.js";

const NO_PRECEDING = "";
const NO_PRECEDING_START = 0;
const NO_BOUNDARY = false;
const HAS_BOUNDARY = true;

function detect(text: string, preceding = NO_PRECEDING, hasBoundary = NO_BOUNDARY) {
  return detectAttribution(text, preceding, NO_PRECEDING_START, hasBoundary);
}

describe("DRA-ENG-005 detectAttribution", () => {
  // -------------------------------------------------------------------------
  // DOCUMENT_AUTHOR (default)
  // -------------------------------------------------------------------------

  describe("DOCUMENT_AUTHOR (default)", () => {
    it("plain declarative → DOCUMENT_AUTHOR", () => {
      expect(detect("The system is compliant.").classification).toBe("DOCUMENT_AUTHOR");
    });

    it("recommendation → DOCUMENT_AUTHOR", () => {
      expect(detect("We recommend enabling MFA.").classification).toBe("DOCUMENT_AUTHOR");
    });

    it("first-person 'I found' → DOCUMENT_AUTHOR (self-ref)", () => {
      expect(detect("I found that the system is compliant.").classification).toBe("DOCUMENT_AUTHOR");
    });

    it("'This document confirms' → DOCUMENT_AUTHOR (self-ref)", () => {
      expect(detect("This document confirms that all controls are in place.").classification).toBe(
        "DOCUMENT_AUTHOR",
      );
    });

    it("rule is AR-DOCUMENT-AUTHOR or AR-SELF-REF", () => {
      const r = detect("ISO 27001 is mandatory.");
      expect(r.resolutionRule).toBe("AR-DOCUMENT-AUTHOR");
    });

    it("no authorityText for DOCUMENT_AUTHOR", () => {
      const r = detect("The threshold is 99.9 percent uptime.");
      expect(r.authorityText).toBeUndefined();
    });

    it("isFromPreceding is false for DOCUMENT_AUTHOR", () => {
      expect(detect("Plain claim.").isFromPreceding).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // EXPLICIT_NAMED_SOURCE — according to named
  // -------------------------------------------------------------------------

  describe("EXPLICIT_NAMED_SOURCE — according to named", () => {
    it("'According to WHO, ...' → EXPLICIT_NAMED_SOURCE", () => {
      expect(detect("According to WHO, the system is compliant.").classification).toBe(
        "EXPLICIT_NAMED_SOURCE",
      );
    });

    it("authority text is 'WHO'", () => {
      expect(detect("According to WHO, the system is compliant.").authorityText).toBe("WHO");
    });

    it("rule is AR-ACCORDING-NAMED", () => {
      expect(detect("According to WHO, the system is compliant.").resolutionRule).toBe(
        "AR-ACCORDING-NAMED",
      );
    });

    it("'According to ISO 27001, ...' → EXPLICIT_NAMED_SOURCE", () => {
      expect(detect("According to ISO 27001, access controls are required.").classification).toBe(
        "EXPLICIT_NAMED_SOURCE",
      );
    });

    it("'According to the 2023 Report, ...' → EXPLICIT_NAMED_SOURCE", () => {
      const r = detect("According to the 2023 Report, revenue grew by 10 percent.");
      expect(r.classification).toBe("EXPLICIT_NAMED_SOURCE");
    });

    it("authority span offsets are within the statement text", () => {
      const text = "According to WHO, the system is compliant.";
      const r = detect(text);
      if (r.authorityLocalStart !== undefined && r.authorityLocalEnd !== undefined) {
        const extracted = text.slice(r.authorityLocalStart, r.authorityLocalEnd);
        expect(extracted).toBe(r.authorityText);
      }
    });

    it("'... according to NIST.' (post-statement) → EXPLICIT_NAMED_SOURCE", () => {
      const r = detect("Encryption is mandatory, according to NIST.");
      expect(r.classification).toBe("EXPLICIT_NAMED_SOURCE");
    });
  });

  // -------------------------------------------------------------------------
  // EXPLICIT_NAMED_SOURCE — subject attribution
  // -------------------------------------------------------------------------

  describe("EXPLICIT_NAMED_SOURCE — subject attribution", () => {
    it("'WHO states that ...' → EXPLICIT_NAMED_SOURCE", () => {
      expect(
        detect("WHO states that encryption must be enabled for all data at rest.").classification,
      ).toBe("EXPLICIT_NAMED_SOURCE");
    });

    it("'Jane Smith said that ...' → EXPLICIT_NAMED_SOURCE", () => {
      expect(detect("Jane Smith said that the audit was clean.").classification).toBe(
        "EXPLICIT_NAMED_SOURCE",
      );
    });

    it("authority text is 'Jane Smith'", () => {
      expect(detect("Jane Smith said that the audit was clean.").authorityText).toBe("Jane Smith");
    });

    it("'The Audit Committee confirmed ...' → EXPLICIT_NAMED_SOURCE", () => {
      expect(
        detect("The Audit Committee confirmed that no violations were found.").classification,
      ).toBe("EXPLICIT_NAMED_SOURCE");
    });

    it("rule is AR-SUBJECT-NAMED", () => {
      expect(detect("Jane Smith said that the audit was clean.").resolutionRule).toBe(
        "AR-SUBJECT-NAMED",
      );
    });
  });

  // -------------------------------------------------------------------------
  // EXPLICIT_NAMED_SOURCE — speaker label
  // -------------------------------------------------------------------------

  describe("EXPLICIT_NAMED_SOURCE — speaker label", () => {
    it("'Dr. Smith: statement' → EXPLICIT_NAMED_SOURCE", () => {
      expect(detect("Dr. Smith: The audit was completed successfully.").classification).toBe(
        "EXPLICIT_NAMED_SOURCE",
      );
    });

    it("authority text is 'Dr. Smith'", () => {
      const r = detect("Dr. Smith: The audit was completed successfully.");
      expect(r.authorityText).toContain("Smith");
    });

    it("'John Smith: statement' → EXPLICIT_NAMED_SOURCE", () => {
      expect(detect("John Smith: All findings have been reviewed.").classification).toBe(
        "EXPLICIT_NAMED_SOURCE",
      );
    });

    it("rule is AR-SPEAKER-LABEL", () => {
      expect(detect("John Smith: All findings have been reviewed.").resolutionRule).toBe(
        "AR-SPEAKER-LABEL",
      );
    });

    it("'Note: important info' → NOT speaker label (excluded)", () => {
      const r = detect("Note: important information about the system.");
      expect(r.resolutionRule).not.toBe("AR-SPEAKER-LABEL");
    });
  });

  // -------------------------------------------------------------------------
  // EXPLICIT_UNNAMED_SOURCE
  // -------------------------------------------------------------------------

  describe("EXPLICIT_UNNAMED_SOURCE", () => {
    it("'According to experts, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
      expect(detect("According to experts, the risk is high.").classification).toBe(
        "EXPLICIT_UNNAMED_SOURCE",
      );
    });

    it("'According to reports, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
      expect(detect("According to reports, compliance has improved.").classification).toBe(
        "EXPLICIT_UNNAMED_SOURCE",
      );
    });

    it("'Officials reported that ...' → EXPLICIT_UNNAMED_SOURCE", () => {
      expect(detect("Officials reported that the breach was contained.").classification).toBe(
        "EXPLICIT_UNNAMED_SOURCE",
      );
    });

    it("'According to researchers, ...' → EXPLICIT_UNNAMED_SOURCE", () => {
      expect(
        detect("According to researchers, the flaw affects all versions.").classification,
      ).toBe("EXPLICIT_UNNAMED_SOURCE");
    });

    it("rule is AR-ACCORDING-UNNAMED for vague 'according to'", () => {
      expect(detect("According to experts, the risk is high.").resolutionRule).toBe(
        "AR-ACCORDING-UNNAMED",
      );
    });

    it("authority text for vague source is the vague term", () => {
      const r = detect("According to experts, the risk is high.");
      expect(r.authorityText).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // AMBIGUOUS_SOURCE — pronouns
  // -------------------------------------------------------------------------

  describe("AMBIGUOUS_SOURCE — pronouns", () => {
    it("'He said that ...' → AMBIGUOUS_SOURCE", () => {
      expect(detect("He said that compliance is mandatory.").classification).toBe("AMBIGUOUS_SOURCE");
    });

    it("'She reported that ...' → AMBIGUOUS_SOURCE", () => {
      expect(detect("She reported that the tests passed.").classification).toBe("AMBIGUOUS_SOURCE");
    });

    it("'They found that ...' → AMBIGUOUS_SOURCE", () => {
      expect(detect("They found that the system is non-compliant.").classification).toBe(
        "AMBIGUOUS_SOURCE",
      );
    });

    it("'It states that ...' → AMBIGUOUS_SOURCE", () => {
      expect(detect("It states that encryption is required.").classification).toBe("AMBIGUOUS_SOURCE");
    });

    it("pronoun rule carries ambiguityDetails", () => {
      const r = detect("He said that compliance is mandatory.");
      expect(r.ambiguityDetails).toBeDefined();
      expect(r.ambiguityDetails).not.toBe("");
    });

    it("rule is AR-PRONOUN-AMBIG", () => {
      expect(detect("He said that compliance is mandatory.").resolutionRule).toBe("AR-PRONOUN-AMBIG");
    });
  });

  // -------------------------------------------------------------------------
  // AMBIGUOUS_SOURCE — unattributed quote
  // -------------------------------------------------------------------------

  describe("AMBIGUOUS_SOURCE — unattributed direct quote", () => {
    it("entire statement is a quoted string → AMBIGUOUS_SOURCE", () => {
      expect(detect('"The system must comply with all applicable regulations."').classification).toBe(
        "AMBIGUOUS_SOURCE",
      );
    });

    it("rule is AR-UNATTR-QUOTE", () => {
      expect(
        detect('"The system must comply with all applicable regulations."').resolutionRule,
      ).toBe("AR-UNATTR-QUOTE");
    });

    it("ambiguityDetails is provided for unattributed quote", () => {
      const r = detect('"All data must be encrypted at rest."');
      expect(r.ambiguityDetails).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Structural inheritance
  // -------------------------------------------------------------------------

  describe("STRUCTURALLY_INHERITED_SOURCE", () => {
    it("preceding line has 'according to WHO' → inherited classification", () => {
      const preceding = "According to WHO:";
      const r = detectAttribution(
        "All systems must be compliant.",
        preceding,
        0,
        false, // no boundary
      );
      expect(r.classification).toBe("STRUCTURALLY_INHERITED_SOURCE");
    });

    it("inherited result has inheritedContextRef", () => {
      const preceding = "According to WHO:";
      const r = detectAttribution(
        "All systems must be compliant.",
        preceding,
        100,
        false,
      );
      expect(r.inheritedContextRef).toBe("preceding-line:100");
    });

    it("no inheritance when hasBoundary is true", () => {
      const preceding = "According to WHO:";
      const r = detectAttribution(
        "All systems must be compliant.",
        preceding,
        0,
        true, // boundary present
      );
      // Should fall through to DOCUMENT_AUTHOR
      expect(r.classification).toBe("DOCUMENT_AUTHOR");
    });

    it("inherited result is marked isFromPreceding=true", () => {
      const r = detectAttribution("All systems must be compliant.", "According to WHO:", 0, false);
      expect(r.isFromPreceding).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// detectAuthorityType
// ---------------------------------------------------------------------------

describe("detectAuthorityType", () => {
  it("WHO → ORGANISATION", () => {
    expect(detectAuthorityType("WHO")).toBe("ORGANISATION");
  });

  it("'Dr. Smith' → PERSON", () => {
    expect(detectAuthorityType("Dr. Smith")).toBe("PERSON");
  });

  it("'Jane Smith' (two-word name) → PERSON", () => {
    expect(detectAuthorityType("Jane Smith")).toBe("PERSON");
  });

  it("'ISO 27001' → REGULATION", () => {
    expect(detectAuthorityType("ISO 27001")).toBe("REGULATION");
  });

  it("'GDPR' → REGULATION", () => {
    expect(detectAuthorityType("GDPR")).toBe("REGULATION");
  });

  it("'The 2023 Annual Report' → PUBLICATION", () => {
    expect(detectAuthorityType("The 2023 Annual Report")).toBe("PUBLICATION");
  });

  it("'the 2022 Study' → STUDY", () => {
    expect(detectAuthorityType("the 2022 Study")).toBe("STUDY");
  });

  it("'experts' → UNNAMED", () => {
    expect(detectAuthorityType("experts")).toBe("UNNAMED");
  });

  it("'officials' → UNNAMED", () => {
    expect(detectAuthorityType("officials")).toBe("UNNAMED");
  });

  it("'National Institute of Standards' → ORGANISATION", () => {
    expect(detectAuthorityType("National Institute of Standards")).toBe("ORGANISATION");
  });

  it("'Global Health Dataset' → DATASET", () => {
    expect(detectAuthorityType("Global Health Dataset")).toBe("DATASET");
  });
});
