/**
 * DRA-ENG-014 — Versioned EL-STANDARD-REF Defect Correction
 * Direct production regression tests (Implementation 4 & 5)
 *
 * Scope: proves, against the PRODUCTION detectEvidence() entry point (the
 * same function Stage 4 calls in evaluateDocument()), that:
 *
 *   (a) the demonstrated defect is eliminated — ordinary Spanish/French "en"
 *       and sentence-initial "En" no longer trigger EL-STANDARD-REF's
 *       EN-family branch (DRA-CHK-004 / DRA-ENG-012 / DRA-ENG-013 evidence);
 *   (b) genuine EN-family references (uppercase "EN") are still detected;
 *   (c) every other EL-STANDARD-REF alternative (ISO, NIST, RFC, IEEE, IEC,
 *       ASTM, GDPR, HIPAA, PCI-DSS, SOX, FIPS, ANSI, OWASP, BS) is
 *       byte-for-byte unaffected by the EN-branch split — case-insensitive
 *       matching is unchanged for all of them.
 *
 * This file does not modify or re-derive any frozen benchmark/receipt data;
 * it exercises only the corrected linkage-rules.ts module in isolation.
 */

import { describe, it, expect } from "vitest";
import { detectEvidence } from "../linkage-rules.js";

describe("DRA-ENG-014 — EL-STANDARD-REF EN-branch case sensitivity", () => {
  // -------------------------------------------------------------------------
  // (a) Must-NOT-match: the demonstrated defect and its documented siblings
  // -------------------------------------------------------------------------

  describe("must NOT match (defect elimination)", () => {
    // The 5 DRA-CHK-004 confirmed Spanish false-positive statements.
    const CHK004_FALSE_POSITIVES: Array<[string, string]> = [
      [
        "ART 51 (Charter)",
        "18          En virtud del art\u00edculo 51 de la Carta, se aplica a las instituciones y Estados miembros de la UE cuando aplican el Derecho de la Uni\u00f3n.",
      ],
      [
        "ART 47 (Charter, Justice)",
        "referentes a la justicia (reflejados en el art\u00edculo 47).",
      ],
      [
        "ART 22 GDPR",
        "Cabe hacer referencia al art\u00edculo 22 del RGPD, en el que ya est\u00e1 recogido este derecho.",
      ],
      [
        "ART 42 (Public Procurement Directive)",
        "El art\u00edculo 42 de la Directiva sobre contrataci\u00f3n p\u00fablica exige que las especificaciones t\u00e9cnicas tengan en cuenta la accesibilidad y el",
      ],
      [
        "Article 6 GDPR (control pair)",
        "71         En este sentido, cabe recordar el art\u00edculo 6 del RGPD, que establece, entre otras cosas, que el tratamiento de datos",
      ],
    ];

    it.each(CHK004_FALSE_POSITIVES)(
      "CHK-004 confirmed FP [%s]: no EL-STANDARD-REF EN match",
      (_label, text) => {
        const result = detectEvidence(text);
        const enMatch = result.matches.find(
          (m) => m.linkageRule === "EL-STANDARD-REF" && /^en\b/i.test(m.evidenceText),
        );
        expect(enMatch, `unexpected EN match: ${JSON.stringify(enMatch)}`).toBeUndefined();
      },
    );

    it("ENG-012/013 residual case: bare lowercase 'en' does not match", () => {
      const result = detectEvidence("Se aplica en toda la Uni\u00f3n Europea.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("French lowercase 'en' does not match", () => {
      const result = detectEvidence("Le r\u00e8glement s'applique en France depuis 2018.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("sentence-initial capitalised 'En' (Spanish) does not match", () => {
      const result = detectEvidence("En este contexto, el reglamento se aplica directamente.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("sentence-initial capitalised 'En' (French) does not match", () => {
      const result = detectEvidence("En France, le texte entre en vigueur imm\u00e9diatement.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("punctuation-adjacent 'en' (e.g. parenthetical) does not match", () => {
      const result = detectEvidence("(en el que ya est\u00e1 recogido este derecho)");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("'en' incidentally adjacent to a number does not match (ordinary prose)", () => {
      const result = detectEvidence("Publicado en 2018 por la Comisi\u00f3n Europea.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });

    it("mixed-case 'En' mid-sentence does not match", () => {
      const result = detectEvidence("Este derecho, En el marco del RGPD, se aplica ampliamente.");
      expect(result.matches.some((m) => m.linkageRule === "EL-STANDARD-REF")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // (b) Must-still-match: genuine EN-family references, uppercase
  // -------------------------------------------------------------------------

  describe("must still match (genuine EN-family retention)", () => {
    it("DRA-DOC-0021 (EN doc) genuine positive: 'EN 301 549'", () => {
      const result = detectEvidence("45     For instance EN 301 549.");
      const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
      expect(m).toBeDefined();
      expect(m!.evidenceText.startsWith("EN")).toBe(true);
    });

    it("DRA-DOC-0018 (ES doc) genuine positive: 'norma EN 301 549'", () => {
      const result = detectEvidence("Por ejemplo, la norma EN 301 549.");
      const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
      expect(m).toBeDefined();
      expect(m!.evidenceText.startsWith("EN")).toBe(true);
    });

    it("bare uppercase 'EN' with no trailing number still matches (unchanged optional-suffix shape)", () => {
      const result = detectEvidence("Compliant with EN as applicable.");
      expect(
        result.matches.some(
          (m) => m.linkageRule === "EL-STANDARD-REF" && m.evidenceText.trim() === "EN",
        ),
      ).toBe(true);
    });

    it("classification is DIRECT_DOCUMENT_EVIDENCE for a genuine EN citation", () => {
      expect(detectEvidence("Compliant with EN 71-1.").classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
    });
  });

  // -------------------------------------------------------------------------
  // (c) Unrelated EL-STANDARD-REF alternatives: zero regression
  // -------------------------------------------------------------------------

  describe("unrelated STANDARD_RE alternatives unaffected (case-insensitive, unchanged)", () => {
    const CASES: Array<[string, string]> = [
      ["ISO", "This follows iso 27001 guidance."],
      ["NIST", "See nist SP 800-53 for controls."],
      ["RFC", "Defined in rfc 2119."],
      ["IEEE", "Per ieee 802.11 specification."],
      ["IEC", "Conforms to iec 61508."],
      ["ASTM", "Tested to astm D638."],
      ["GDPR", "Required under gdpr Article 5."],
      ["HIPAA", "Subject to hipaa requirements."],
      ["PCI-DSS", "Certified pci-dss compliant."],
      ["SOX", "Reviewed under sox controls."],
      ["FIPS", "Validated to fips 140-2."],
      ["ANSI", "Meets ansi Z87.1."],
      ["OWASP", "Follows owasp Top 10 guidance."],
      ["BS", "Complies with bs 7671."],
    ];

    it.each(CASES)(
      "%s: lowercase variant still matches case-insensitively (unchanged from Version 1)",
      (label, text) => {
        const result = detectEvidence(text);
        const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
        expect(m, `expected a STANDARD match for ${label}`).toBeDefined();
        const prefix = label.split("-")[0]!;
        expect(m!.evidenceText.toUpperCase().startsWith(prefix)).toBe(true);
      },
    );

    it("classification for a non-EN standard reference is still DIRECT_DOCUMENT_EVIDENCE", () => {
      expect(detectEvidence("Required under GDPR guidance.").classification).toBe(
        "DIRECT_DOCUMENT_EVIDENCE",
      );
    });
  });
});
