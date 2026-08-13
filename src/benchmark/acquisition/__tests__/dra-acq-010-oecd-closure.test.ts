/**
 * DRA-ACQ-010 — Phase 2 Closure: Human Governance Decisions for
 * OECD-LEGAL-0449 (DRA-DOC-0015 candidate)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CLOSURE TEST — DRA-ACQ-010 Phase 2                                     ║
 * ║                                                                          ║
 * ║  Records the human governance decisions received for OECD/LEGAL/0449    ║
 * ║  after the machine-prepared REVIEW_REQUIRED assessments in              ║
 * ║  dra-acq-010-oecd-ai-recommendation-prep.test.ts:                       ║
 * ║                                                                          ║
 * ║    Official source:  VERIFIED   (human decision, 2026-08-06)            ║
 * ║    Licence:          REJECTED — NOT VERIFIED, BLOCKING (human decision) ║
 * ║                                                                          ║
 * ║  Outcome: freeze eligibility remains BLOCKED (licence only). No freeze  ║
 * ║  record is created. DRA-DOC-0015 is NOT admitted. This is the final,    ║
 * ║  closed disposition of the OECD/LEGAL/0449 candidate under DRA-ACQ-010. ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes the same live HTTPS requests as the Phase 2 preparation
 * test (legalinstruments.oecd.org, plus the 14-document existing-corpus
 * rebuild) in order to re-run `checkFreezeEligibility()` against the final,
 * human-decided assessment objects — it does not merely assert on
 * hand-written expectations. Allow 15 minutes.
 */

import { describe, it, expect } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import { computeSourceDigest } from "../integrity.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionRequest } from "../request.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildExistingCorpusTexts } from "./helpers/dra-acq-010-existing-corpus-texts.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

/** When the human governance decisions were received and recorded. */
const CLOSURE_TIMESTAMP = "2026-08-06T20:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical URL — same as Phase 2 preparation (HTML instrument record)
// ---------------------------------------------------------------------------

const OECD_CANONICAL_HTML_URL =
  "https://legalinstruments.oecd.org/public/doc/648/f401b8d2-9993-41ec-82c5-d53a69e4991b.htm";

// ---------------------------------------------------------------------------
// Human governance decision — Official source: VERIFIED
// ---------------------------------------------------------------------------

const HUMAN_OFFICIAL_SOURCE_DECISION = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "human-governance-reviewer",
  assessedAt: CLOSURE_TIMESTAMP,
  evidence: [
    "OECD is the issuing authority for this instrument.",
    "OECD/LEGAL/0449 was independently confirmed through OECD's official " +
      "Legal Instruments API (legalinstruments.oecd.org/api/instruments/" +
      "OECD-LEGAL-0449) and OECD's official Legal Instruments HTML record " +
      "(legalinstruments.oecd.org/public/doc/648/...).",
    "The source identity and authority are sufficiently established.",
  ],
  notes:
    "Human governance decision recorded 2026-08-06, closing out the " +
    "REVIEW_REQUIRED machine-prepared assessment from DRA-ACQ-010 Phase 2 " +
    "preparation.",
});

// ---------------------------------------------------------------------------
// Human governance decision — Licence: REJECTED (NOT VERIFIED, BLOCKING)
// ---------------------------------------------------------------------------

const HUMAN_LICENCE_DECISION = Object.freeze({
  status: "REJECTED" as const,
  licenceBasis: "UNKNOWN" as const,
  assessedBy: "human-governance-reviewer",
  assessedAt: CLOSURE_TIMESTAMP,
  evidence: [
    "OECD's general Terms and Conditions and Open Access Policy indicate " +
      "that pre-1 July 2024 OECD written content is generally reusable on " +
      "terms similar to CC BY 4.0.",
    "No explicit document-specific licence or unambiguous reuse statement " +
      "was identified for OECD/LEGAL/0449 itself.",
    "The relationship between the 2019 instrument, its later amendments " +
      "(2023-11-08, 2024-05-03), and the general open-access policy is not " +
      "sufficiently explicit to meet the corpus's strict licence-" +
      "verification requirement.",
  ],
  notes:
    "Human governance decision recorded 2026-08-06: NOT VERIFIED — " +
    "BLOCKING. Closes out the REVIEW_REQUIRED machine-prepared assessment " +
    "from DRA-ACQ-010 Phase 2 preparation with a definitive negative " +
    "determination, not a further deferral.",
});

// ---------------------------------------------------------------------------
// Proposed metadata and inclusion rationale — unchanged from preparation
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Recommendation of the Council on Artificial Intelligence",
  publisher: "Organisation for Economic Co-operation and Development (OECD)",
  publicationDate: "2019-05-22",
  version: "OECD/LEGAL/0449, as amended 2024-05-03",
  domain: "GENERAL" as const,
  documentType: "OTHER" as const,
  difficulty: "MEDIUM" as const,
  language: "en",
});

const INCLUSION_RATIONALE =
  "Fills the GENERAL-domain real-acquisition gap identified in DRA-ACQ-010 " +
  "Phase 1. Candidate closed at Phase 2 with official source VERIFIED but " +
  "licence REJECTED by human governance decision (2026-08-06); recorded " +
  "here for closure only, not for admission.";

// ---------------------------------------------------------------------------
// Closure test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-010 — Phase 2 Closure: OECD/LEGAL/0449 Human Governance Decisions",
  () => {
    it(
      "records official-source VERIFIED and licence REJECTED human decisions; " +
        "confirms freeze eligibility remains BLOCKED (licence only); " +
        "confirms DRA-DOC-0015 is not created and no freeze record exists",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-010 — PHASE 2 CLOSURE LOG                        ║",
        );
        console.log(
          "║  Human decisions: official source VERIFIED, licence       ║",
        );
        console.log(
          "║  REJECTED (NOT VERIFIED — BLOCKING)                        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-010",
          protocolStatus: "APPROVED",
          targetCorpusSize: 20,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
        });

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Re-acquire the canonical HTML record ────────────────────────

        console.log("── Fetch canonical HTML record ──────────────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000017",
          sourceUrl: OECD_CANONICAL_HTML_URL,
          requestedBy: "DRA-ACQ-010-closure-operator",
          requestedAt: CLOSURE_TIMESTAMP,
          expectedPublisher:
            "Organisation for Economic Co-operation and Development (OECD)",
          expectedTitle:
            "Recommendation of the Council on Artificial Intelligence",
        });
        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;

        const fetchResult = await fetcher(requestResult.request, {});
        if (!fetchResult.ok) {
          console.error("OECD fetch FAILED:", fetchResult.code, fetchResult.message);
        }
        expect(fetchResult.ok).toBe(true);
        if (!fetchResult.ok) return;

        const source = fetchResult.source;
        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("text/html");

        const sourceDigest = computeSourceDigest(source.rawBytes);
        console.log("  source digest:", sourceDigest);

        const normaliseResult = await normaliseContent(
          source.rawBytes,
          "text/html",
          sourceDigest,
        );
        expect(normaliseResult.ok).toBe(true);
        if (!normaliseResult.ok) return;
        const normalised = normaliseResult.document;

        // ── Rebuild existing 14-document corpus for near-duplicate check ──

        console.log("── Rebuild existing 14-document corpus ──────────────");
        const existingCorpusTexts = await buildExistingCorpusTexts(
          fetcher,
          CLOSURE_TIMESTAMP,
        );
        expect(existingCorpusTexts.length).toBe(14);

        // ── Freeze eligibility with human-decided assessments ────────────

        console.log("── Freeze eligibility (human-decided assessments) ───");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          HUMAN_OFFICIAL_SOURCE_DECISION,
          HUMAN_LICENCE_DECISION,
          PROPOSED_METADATA,
          "DRA-DOC-0015",
          INCLUSION_RATIONALE,
          registry,
          protocol,
          existingCorpusTexts,
        );

        for (const check of eligibility.checks) {
          console.log(
            `  [${check.passed ? "PASS" : "FAIL"}] ${check.checkId}` +
              (check.detail ? ` — ${check.detail}` : ""),
          );
        }

        // Official source check must now PASS (human VERIFIED).
        const officialSourceCheck = eligibility.checks.find(
          (c) => c.checkId === "OFFICIAL_SOURCE_VERIFIED",
        );
        expect(officialSourceCheck?.passed).toBe(true);

        // Licence check must FAIL (human REJECTED).
        const licenceCheck = eligibility.checks.find(
          (c) => c.checkId === "LICENCE_VERIFIED",
        );
        expect(licenceCheck?.passed).toBe(false);

        expect(eligibility.eligible).toBe(false);
        if (eligibility.eligible) return;

        console.log("\n  Blocking reasons:", eligibility.blockingReasons);

        // Exactly one blocking reason now: licence only.
        expect(eligibility.blockingReasons).toEqual(["LICENCE_NOT_VERIFIED"]);
        expect(eligibility.blockingReasons.length).toBe(1);

        // ── Explicit non-mutation / non-creation confirmation ────────────

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-010 PHASE 2 CLOSED — LICENCE BLOCKING             ║",
        );
        console.log(
          "║  Official source: VERIFIED (human decision)                ║",
        );
        console.log(
          "║  Licence: REJECTED — NOT VERIFIED, BLOCKING (human decision)║",
        );
        console.log(
          "║  No freeze record created. DRA-DOC-0015 not admitted.      ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        expect(registry.list().length).toBe(0);
      },
      900_000,
    );
  },
);
