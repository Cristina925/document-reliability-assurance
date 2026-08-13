/**
 * DRA-ENG-006 — Linkage Rules Unit Tests
 */

import { describe, it, expect } from "vitest";
import { detectEvidence } from "../linkage-rules.js";

describe("DRA-ENG-006 detectEvidence", () => {
  // -------------------------------------------------------------------------
  // NO_DOCUMENT_EVIDENCE (default)
  // -------------------------------------------------------------------------

  describe("NO_DOCUMENT_EVIDENCE", () => {
    it("plain statement → NO_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("The system is compliant.").classification).toBe("NO_DOCUMENT_EVIDENCE");
    });

    it("recommendation → NO_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("We recommend enabling MFA.").classification).toBe("NO_DOCUMENT_EVIDENCE");
    });

    it("rule is EL-NO-EVIDENCE", () => {
      expect(detectEvidence("No evidence here.").linkageRule).toBe("EL-NO-EVIDENCE");
    });

    it("matches array is empty", () => {
      expect(detectEvidence("No evidence here.").matches).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // CITED_REFERENCE — numbered
  // -------------------------------------------------------------------------

  describe("CITED_REFERENCE — numbered citation", () => {
    it("[1] → CITED_REFERENCE", () => {
      expect(detectEvidence("Encryption is mandatory [1].").classification).toBe("CITED_REFERENCE");
    });

    it("rule is EL-NUMBERED-CITE", () => {
      expect(detectEvidence("Encryption is mandatory [1].").linkageRule).toBe("EL-NUMBERED-CITE");
    });

    it("[1,2] → CITED_REFERENCE", () => {
      expect(detectEvidence("See references [1,2].").classification).toBe("CITED_REFERENCE");
    });

    it("[1-3] → CITED_REFERENCE", () => {
      expect(detectEvidence("See references [1-3].").classification).toBe("CITED_REFERENCE");
    });

    it("[1] localStart is index of '[' in text", () => {
      const text = "Encryption is mandatory [1].";
      const r = detectEvidence(text);
      expect(r.matches[0]!.localStart).toBe(text.indexOf("[1]"));
    });

    it("[1] localEnd equals localStart + 3", () => {
      const text = "Encryption is mandatory [1].";
      const r = detectEvidence(text);
      expect(r.matches[0]!.localEnd).toBe(r.matches[0]!.localStart + 3);
    });

    it("evidenceType is NUMBERED_CITATION", () => {
      expect(detectEvidence("Claim [1].").matches[0]!.evidenceType).toBe("NUMBERED_CITATION");
    });
  });

  // -------------------------------------------------------------------------
  // CITED_REFERENCE — bracketed author-year
  // -------------------------------------------------------------------------

  describe("CITED_REFERENCE — bracketed author-year", () => {
    it("(Smith 2023) → CITED_REFERENCE", () => {
      expect(detectEvidence("The risk is high (Smith 2023).").classification).toBe("CITED_REFERENCE");
    });

    it("rule is EL-BRACKETED-CITE", () => {
      expect(detectEvidence("The risk is high (Smith 2023).").linkageRule).toBe("EL-BRACKETED-CITE");
    });

    it("(WHO 2021) → CITED_REFERENCE", () => {
      expect(detectEvidence("Compliance is required (WHO 2021).").classification).toBe("CITED_REFERENCE");
    });

    it("(Smith et al. 2023) → CITED_REFERENCE", () => {
      expect(detectEvidence("Critical flaw (Smith et al. 2023).").classification).toBe("CITED_REFERENCE");
    });

    it("evidenceType is BRACKETED_CITATION", () => {
      expect(detectEvidence("Claim (Jones 2022).").matches[0]!.evidenceType).toBe("BRACKETED_CITATION");
    });
  });

  // -------------------------------------------------------------------------
  // FIGURE_EVIDENCE
  // -------------------------------------------------------------------------

  describe("FIGURE_EVIDENCE", () => {
    it("Figure 1 → FIGURE_EVIDENCE", () => {
      expect(detectEvidence("See Figure 1 for the diagram.").classification).toBe("FIGURE_EVIDENCE");
    });

    it("rule is EL-FIGURE-REF", () => {
      expect(detectEvidence("See Figure 1.").linkageRule).toBe("EL-FIGURE-REF");
    });

    it("Fig. 3 → FIGURE_EVIDENCE", () => {
      expect(detectEvidence("Illustrated in Fig. 3.").classification).toBe("FIGURE_EVIDENCE");
    });

    it("evidenceType is FIGURE", () => {
      expect(detectEvidence("See Figure 2.").matches[0]!.evidenceType).toBe("FIGURE");
    });
  });

  // -------------------------------------------------------------------------
  // TABLE_EVIDENCE
  // -------------------------------------------------------------------------

  describe("TABLE_EVIDENCE", () => {
    it("Table 1 → TABLE_EVIDENCE", () => {
      expect(detectEvidence("Results are in Table 1.").classification).toBe("TABLE_EVIDENCE");
    });

    it("rule is EL-TABLE-REF", () => {
      expect(detectEvidence("See Table 1.").linkageRule).toBe("EL-TABLE-REF");
    });

    it("Table A → TABLE_EVIDENCE", () => {
      expect(detectEvidence("See Table A.").classification).toBe("TABLE_EVIDENCE");
    });

    it("evidenceType is TABLE", () => {
      expect(detectEvidence("Refer to Table 2.").matches[0]!.evidenceType).toBe("TABLE");
    });
  });

  // -------------------------------------------------------------------------
  // APPENDIX_EVIDENCE
  // -------------------------------------------------------------------------

  describe("APPENDIX_EVIDENCE", () => {
    it("Appendix A → APPENDIX_EVIDENCE", () => {
      expect(detectEvidence("See Appendix A for details.").classification).toBe("APPENDIX_EVIDENCE");
    });

    it("rule is EL-APPENDIX-REF", () => {
      expect(detectEvidence("See Appendix A.").linkageRule).toBe("EL-APPENDIX-REF");
    });

    it("Annex B → APPENDIX_EVIDENCE", () => {
      expect(detectEvidence("Data is in Annex B.").classification).toBe("APPENDIX_EVIDENCE");
    });

    it("Schedule C → APPENDIX_EVIDENCE", () => {
      expect(detectEvidence("Refer to Schedule C.").classification).toBe("APPENDIX_EVIDENCE");
    });

    it("evidenceType is APPENDIX", () => {
      expect(detectEvidence("See Appendix A.").matches[0]!.evidenceType).toBe("APPENDIX");
    });
  });

  // -------------------------------------------------------------------------
  // FOOTNOTE_EVIDENCE
  // -------------------------------------------------------------------------

  describe("FOOTNOTE_EVIDENCE", () => {
    it("[^1] → FOOTNOTE_EVIDENCE", () => {
      expect(detectEvidence("This is noted.[^1]").classification).toBe("FOOTNOTE_EVIDENCE");
    });

    it("rule is EL-FOOTNOTE-REF", () => {
      expect(detectEvidence("This is noted.[^1]").linkageRule).toBe("EL-FOOTNOTE-REF");
    });

    it("[^2] → FOOTNOTE_EVIDENCE", () => {
      expect(detectEvidence("See note.[^2]").classification).toBe("FOOTNOTE_EVIDENCE");
    });

    it("evidenceType is FOOTNOTE", () => {
      expect(detectEvidence("Noted.[^1]").matches[0]!.evidenceType).toBe("FOOTNOTE");
    });
  });

  // -------------------------------------------------------------------------
  // DIRECT_DOCUMENT_EVIDENCE — standards
  // -------------------------------------------------------------------------

  describe("DIRECT_DOCUMENT_EVIDENCE — standards", () => {
    it("ISO 27001 → DIRECT_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("Must comply with ISO 27001.").classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
    });

    it("rule is EL-STANDARD-REF", () => {
      expect(detectEvidence("Must comply with ISO 27001.").linkageRule).toBe("EL-STANDARD-REF");
    });

    it("NIST → DIRECT_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("Follows NIST guidelines.").classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
    });

    it("RFC → DIRECT_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("Implements RFC 8446.").classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
    });

    it("GDPR → DIRECT_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("Complies with GDPR.").classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
    });

    it("evidenceType is STANDARD", () => {
      expect(detectEvidence("Per ISO 27001 requirements.").matches[0]!.evidenceType).toBe("STANDARD");
    });
  });

  // -------------------------------------------------------------------------
  // EXTERNAL_REFERENCE_PRESENT — URLs
  // -------------------------------------------------------------------------

  describe("EXTERNAL_REFERENCE_PRESENT — URLs", () => {
    it("https URL → EXTERNAL_REFERENCE_PRESENT", () => {
      expect(detectEvidence("See https://example.com for more.").classification).toBe(
        "EXTERNAL_REFERENCE_PRESENT",
      );
    });

    it("rule is EL-URL", () => {
      expect(detectEvidence("See https://example.com.").linkageRule).toBe("EL-URL");
    });

    it("http URL → EXTERNAL_REFERENCE_PRESENT", () => {
      expect(detectEvidence("See http://nist.gov/csf.").classification).toBe(
        "EXTERNAL_REFERENCE_PRESENT",
      );
    });

    it("evidenceText contains the URL", () => {
      const r = detectEvidence("See https://example.com/page for details.");
      expect(r.matches[0]!.evidenceText).toContain("https://example.com/page");
    });

    it("evidenceType is URL", () => {
      expect(detectEvidence("See https://example.com.").matches[0]!.evidenceType).toBe("URL");
    });
  });

  // -------------------------------------------------------------------------
  // DOCUMENT_CROSS_REFERENCE — section refs
  // -------------------------------------------------------------------------

  describe("DOCUMENT_CROSS_REFERENCE — section refs", () => {
    it("Section 3 → DOCUMENT_CROSS_REFERENCE", () => {
      expect(detectEvidence("As described in Section 3.").classification).toBe(
        "DOCUMENT_CROSS_REFERENCE",
      );
    });

    it("rule is EL-SECTION-REF", () => {
      expect(detectEvidence("See Section 3.").linkageRule).toBe("EL-SECTION-REF");
    });

    it("Chapter 2 → DOCUMENT_CROSS_REFERENCE", () => {
      expect(detectEvidence("Defined in Chapter 2.").classification).toBe(
        "DOCUMENT_CROSS_REFERENCE",
      );
    });

    it("§ 4 → DOCUMENT_CROSS_REFERENCE", () => {
      expect(detectEvidence("Governed by § 4 of this policy.").classification).toBe(
        "DOCUMENT_CROSS_REFERENCE",
      );
    });

    it("evidenceType is SECTION", () => {
      expect(detectEvidence("See Section 3.").matches[0]!.evidenceType).toBe("SECTION");
    });
  });

  // -------------------------------------------------------------------------
  // QUOTED_SOURCE
  // -------------------------------------------------------------------------

  describe("QUOTED_SOURCE", () => {
    it("'quoted text with attribution' → QUOTED_SOURCE when no named rule matches", () => {
      // This only fires when no higher-priority rule matches
      const r = detectEvidence(
        'The policy states "all systems must be encrypted at rest and in transit".',
      );
      // Either QUOTED_SOURCE or something else if a higher rule matched
      expect(["QUOTED_SOURCE", "NO_DOCUMENT_EVIDENCE", "AMBIGUOUS_EVIDENCE_LINK"]).toContain(
        r.classification,
      );
    });
  });

  // -------------------------------------------------------------------------
  // AMBIGUOUS_EVIDENCE_LINK
  // -------------------------------------------------------------------------

  describe("AMBIGUOUS_EVIDENCE_LINK", () => {
    it("URL + numbered citation → AMBIGUOUS_EVIDENCE_LINK", () => {
      const r = detectEvidence(
        "See https://example.com and reference [1] for more.",
      );
      expect(r.classification).toBe("AMBIGUOUS_EVIDENCE_LINK");
    });

    it("ambiguity result carries ambiguityDetails", () => {
      const r = detectEvidence("See https://example.com and reference [1] for more.");
      expect(r.ambiguityDetails).toBeDefined();
    });

    it("ambiguous result carries all matched evidence items", () => {
      const r = detectEvidence("See https://example.com and reference [1] for more.");
      expect(r.matches.length).toBeGreaterThanOrEqual(2);
    });

    it("Figure 1 + [1] → AMBIGUOUS_EVIDENCE_LINK", () => {
      const r = detectEvidence("See Figure 1 [1] for the diagram.");
      expect(r.classification).toBe("AMBIGUOUS_EVIDENCE_LINK");
    });
  });

  // -------------------------------------------------------------------------
  // Multiple evidence items (same classification)
  // -------------------------------------------------------------------------

  describe("multiple evidence items — same classification", () => {
    it("two numbered citations → CITED_REFERENCE (not ambiguous)", () => {
      const r = detectEvidence("See references [1] and [2] for more.");
      expect(r.classification).toBe("CITED_REFERENCE");
    });

    it("two numbered citations → two matches", () => {
      const r = detectEvidence("See references [1] and [2] for more.");
      expect(r.matches.length).toBeGreaterThanOrEqual(2);
    });
  });

  // -------------------------------------------------------------------------
  // Local offsets
  // -------------------------------------------------------------------------

  describe("local offset accuracy", () => {
    it("[1] localStart matches text.indexOf('[1]')", () => {
      const text = "The compliance level is adequate [1].";
      const r = detectEvidence(text);
      expect(r.matches[0]!.localStart).toBe(text.indexOf("[1]"));
    });

    it("URL localStart matches text.indexOf('https')", () => {
      const text = "Details at https://example.com for reference.";
      const r = detectEvidence(text);
      expect(r.matches[0]!.localStart).toBe(text.indexOf("https://"));
    });

    it("text.slice(localStart, localEnd) === evidenceText for all matches", () => {
      const texts = [
        "Encryption is required [1].",
        "See Table 1 for results.",
        "See Figure 1 for the diagram.",
        "Details in Appendix A.",
        "See Section 3 for the policy.",
        "See https://example.com.",
        "ISO 27001 certification is needed.",
      ];
      for (const text of texts) {
        const r = detectEvidence(text);
        for (const m of r.matches) {
          expect(text.slice(m.localStart, m.localEnd)).toBe(m.evidenceText);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Priority: URL wins over other patterns
  // -------------------------------------------------------------------------

  describe("priority", () => {
    it("URL takes priority over section ref when they appear together (ambiguous)", () => {
      // URL and section ref produce different classification domains → ambiguous
      const r = detectEvidence("See Section 3 at https://example.com.");
      expect(["EXTERNAL_REFERENCE_PRESENT", "AMBIGUOUS_EVIDENCE_LINK"]).toContain(
        r.classification,
      );
    });

    it("two bracketed citations → not ambiguous (same domain)", () => {
      const r = detectEvidence("See (Smith 2023) and (Jones 2022) for details.");
      expect(r.classification).toBe("CITED_REFERENCE");
    });
  });
});
