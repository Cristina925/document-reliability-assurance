/**
 * DRA-ACQ-010 — Phase 2: OECD-LEGAL-0449 Qualification, Controlled
 * Acquisition and Freeze Preparation for DRA-DOC-0015
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-010                             ║
 * ║                                                                          ║
 * ║  Candidate:                                                              ║
 * ║    OECD/LEGAL/0449 — "Recommendation of the Council on Artificial       ║
 * ║    Intelligence" (Organisation for Economic Co-operation and             ║
 * ║    Development)                                                          ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Acquisition ID: DRA-ACQ-000017                                       ║
 * ║    Canonical representation: OECD Legal Instruments HTML record          ║
 * ║      https://legalinstruments.oecd.org/public/doc/648/                  ║
 * ║      f401b8d2-9993-41ec-82c5-d53a69e4991b.htm                           ║
 * ║    (NOT the oecd.ai PDF mirror — see "Canonical representation           ║
 * ║    decision" below.)                                                     ║
 * ║                                                                          ║
 * ║  Pipeline scope: identity/version verification → fetch → normalise →     ║
 * ║    near-duplicate check → freeze eligibility. STOPS BEFORE freeze.       ║
 * ║                                                                          ║
 * ║  Governance status: REVIEW_REQUIRED (2 blocking reasons expected)        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ── Objectives verified by this file (per Phase 2 task instructions) ──────
 *  1. Official publication identity      — §"Official-source identity"
 *  2. Canonical acquisition representation — §"Canonical representation decision"
 *  3. Licence / reuse terms              — §"Licence evidence"
 *  4. Publication status / version identity — §"Version and amendment history"
 *  5. Stable, reproducible source URL    — §"Two independent live fetches"
 *  6. Controlled acquisition via the existing governed pipeline — Steps 4-6
 *  7. Provenance, response metadata, integrity digests — Steps 4-7
 *  8. Near-duplicate risk against the 14-document corpus — Step 8
 *  9. Complete existing eligibility assessment — Step 9
 * 10. Freeze/admission evidence preparation (NOT execution) — Step 9 result
 *
 * ── Canonical representation decision (explicit, tested) ──────────────────
 * OECD/LEGAL/0449 was adopted 2019-05-22 and has been AMENDED TWICE since:
 * 2023-11-08 (AI system definition update) and 2024-05-03 (further revision
 * for generative AI and implementation). This was NOT known at Phase 1.
 *
 * The PDF mirror used for Phase 1's accessibility check
 * (https://oecd.ai/en/assets/files/OECD-LEGAL-0449-en.pdf) carries an HTTP
 * Last-Modified header of 2021-09-30 — objectively BEFORE both amendments.
 * That PDF is therefore STALE and must not be acquired as the corpus
 * representation of this instrument.
 *
 * The OECD Legal Instruments database's own JSON API
 * (https://legalinstruments.oecd.org/api/instruments/OECD-LEGAL-0449)
 * exposes `statusSummary.lastAmendmentDate: "2024-05-03"` and a `bodyText.ref`
 * HTML URL that is dynamically served from the live instrument record. This
 * file fetches BOTH the identity API and the HTML text, and asserts that the
 * fetched HTML text contains the definition wording introduced by the
 * current (post-2024) amendment ("infers, from the input it receives, how
 * to generate outputs") rather than the narrower original 2019 wording —
 * i.e. it is not merely trusting the API's date field, but independently
 * confirming the fetched text reflects the current, in-force version.
 *
 * Decision: acquire the HTML record, not the PDF, as the canonical
 * representation for DRA-DOC-0015.
 *
 * This test makes live HTTPS requests to legalinstruments.oecd.org (JSON API
 * + HTML record, fetched twice each for stability), oecd.ai (stale-PDF
 * evidence only, not acquired), acas.org.uk, assets.publishing.service.gov.uk,
 * nvlpubs.nist.gov, ico.org.uk (14 sections), bankofengland.co.uk, fda.gov,
 * and bis.org (existing 14-document corpus near-duplicate check). Allow 15
 * minutes.
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
// Fixed preparation timestamp
// ---------------------------------------------------------------------------

const PREP_TIMESTAMP = "2026-08-06T19:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical URLs
// ---------------------------------------------------------------------------

const OECD_INSTRUMENT_API_URL =
  "https://legalinstruments.oecd.org/api/instruments/OECD-LEGAL-0449";
const OECD_CANONICAL_HTML_URL =
  "https://legalinstruments.oecd.org/public/doc/648/f401b8d2-9993-41ec-82c5-d53a69e4991b.htm";
/** Rejected representation — fetched only to prove staleness, never acquired. */
const OECD_STALE_PDF_URL = "https://oecd.ai/en/assets/files/OECD-LEGAL-0449-en.pdf";

/** Wording present only in the definition text introduced by the 2024 amendment. */
const CURRENT_DEFINITION_MARKER =
  "infers, from the input it receives, how to generate outputs";

// ---------------------------------------------------------------------------
// Machine-prepared governance objects — REVIEW_REQUIRED
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-010-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "Confirmed via OECD's own Legal Instruments database API " +
      "(https://legalinstruments.oecd.org/api/instruments/OECD-LEGAL-0449): " +
      "instrument key OECD/LEGAL/0449, title 'Recommendation of the Council " +
      "on Artificial Intelligence', instrument id 648.",
    "Adoption date 2019-05-22 (Council meeting at Ministerial level), " +
      "in force from adoption; amended 2023-11-08 and 2024-05-03 per the " +
      "same API's statusSummary and changeHistory fields.",
    "Canonical HTML text fetched from the live instrument record " +
      "(legalinstruments.oecd.org/public/doc/648/...) independently " +
      "confirmed to contain the definition wording introduced by the " +
      "2024 amendment, not the original 2019 wording — see " +
      "CURRENT_DEFINITION_MARKER check in this test.",
    "Publisher: Organisation for Economic Co-operation and Development " +
      "(OECD), an intergovernmental organisation; this is its own " +
      "first-party legal-instrument registry, not a third-party mirror.",
    "REQUIRES HUMAN REVIEW: confirm the acquired HTML text is the complete, " +
      "authoritative current text of the Recommendation (this test verifies " +
      "presence of a post-2024-amendment marker phrase, not a full legal " +
      "diff against the official consolidated text).",
    "REQUIRES HUMAN REVIEW: confirm OECD qualifies as an official " +
      "international-standard-setting source for DRA corpus purposes, " +
      "consistent with the FINANCE-domain BCBS precedent (DRA-DOC-0014).",
  ],
  notes:
    "DRA-ACQ-010 Machine-prepared official-source evidence. " +
    "Unlike prior acquisitions, this candidate's version identity was " +
    "actively ambiguous at Phase 1 (a stale 2021-vintage PDF mirror was " +
    "used for the accessibility check only) and has been resolved here by " +
    "switching to the instrument's own current HTML record. A human " +
    "reviewer must independently confirm this before upgrading to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceBasis: "UNKNOWN" as const,
  assessedBy: "DRA-ACQ-010-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "OECD's general terms-and-conditions page " +
      "(https://www.oecd.org/en/about/terms-conditions.html) returned " +
      "HTTP 403 from this environment (Cloudflare interactive challenge) " +
      "on repeated attempts — reuse terms text could not be retrieved.",
    "The Legal Instruments site's own about/terms page " +
      "(legalinstruments.oecd.org/en/about) returns HTTP 200 but is an " +
      "empty client-rendered application shell with no server-side terms " +
      "text reachable by this environment's HTTP client.",
    "No explicit copyright or licence statement was found within the " +
      "fetched instrument HTML record itself.",
    "Accessibility of the document (HTTP 200) is explicitly NOT treated " +
      "as equivalent to licence permission; no reuse basis is inferred " +
      "from public availability alone.",
    "No official OECD source has been located confirming reuse terms; " +
      "a third-party mirror is deliberately not substituted for this " +
      "verification, per governance instruction.",
    "REQUIRES HUMAN REVIEW: obtain and record OECD's actual reuse/licence " +
      "terms for this instrument before any freeze or admission decision.",
  ],
  notes:
    "DRA-ACQ-010 Machine-prepared licence evidence. Licence status is " +
    "explicitly BLOCKING, not merely cautious: no reuse permission has " +
    "been verified from any authoritative OECD source reachable by this " +
    "environment. This must not be upgraded to VERIFIED without a human " +
    "reviewer obtaining OECD's actual terms.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
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

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Fills the GENERAL-domain real-acquisition gap identified in DRA-ACQ-010 " +
  "Phase 1 (tied at 1 real document — CMA Short Version, DRA-DOC-0009 — " +
  "alongside BUSINESS, LEGAL, and HEALTHCARE). First intergovernmental " +
  "(non-national) publisher in the corpus, and the first document whose " +
  "canonical representation required resolving an active version-identity " +
  "ambiguity (twice-amended since 2019) before acquisition. Does not " +
  "deepen TECHNICAL or FINANCE (currently best-represented) or POLICY " +
  "(currently 3 of 8 real documents, including 2 of the last 3). " +
  "Corpus diversity: extends GENERAL domain; adds an intergovernmental " +
  "standard-setting body distinct from all existing national-government " +
  "and industry-regulator publishers.";

// ---------------------------------------------------------------------------
// Preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-010 — Phase 2: Controlled Acquisition Preparation for DRA-DOC-0015",
  () => {
    it(
      "verifies OECD/LEGAL/0449 identity, version status, and licence evidence; " +
        "acquires the canonical HTML representation; and prepares (but stops " +
        "before) freeze eligibility for DRA-DOC-0015",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-010 — PHASE 2 ACQUISITION PREPARATION LOG        ║",
        );
        console.log(
          "╠══════════════════════════════════════════════════════════╣",
        );
        console.log(
          "║  CANDIDATE: OECD/LEGAL/0449 — Recommendation of the       ║",
        );
        console.log(
          "║  Council on Artificial Intelligence                       ║",
        );
        console.log(
          "║  TARGET: fill GENERAL-domain gap (Phase 1 discovery)       ║",
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

        // ── Step 1: Official-source identity — live OECD API record ────────

        console.log("── Step 1: Official-Source Identity (OECD Legal Instruments API) ─");

        const apiResponse = await fetch(OECD_INSTRUMENT_API_URL, {
          headers: { "User-Agent": "DRA-ENG-010/1.0" },
        });

        expect(apiResponse.status).toBe(200);
        const instrument = (await apiResponse.json()) as {
          key: string;
          title: { name: { lang: string; value: string }[] };
          statusSummary: {
            adoptionDate: string;
            lastAmendmentDate: string;
            inForceDate: string;
          };
        };

        const englishTitle = instrument.title.name.find((n) => n.lang === "en")?.value;

        console.log("  instrument key       :", instrument.key);
        console.log("  title (en)           :", englishTitle);
        console.log("  adoptionDate         :", instrument.statusSummary.adoptionDate);
        console.log("  lastAmendmentDate    :", instrument.statusSummary.lastAmendmentDate);
        console.log("  inForceDate          :", instrument.statusSummary.inForceDate);

        expect(instrument.key).toBe("OECD/LEGAL/0449");
        expect(englishTitle).toBe(
          "Recommendation of the Council on Artificial Intelligence",
        );
        expect(instrument.statusSummary.adoptionDate).toBe("2019-05-22");

        // Version/publication-status finding: the instrument has been amended
        // since adoption. This is exactly the ambiguity Phase 1 could not see.
        const hasBeenAmended =
          instrument.statusSummary.lastAmendmentDate !==
          instrument.statusSummary.adoptionDate;
        console.log("  hasBeenAmended       :", hasBeenAmended);
        expect(hasBeenAmended).toBe(true);

        // ── Step 2: Canonical-representation decision — stale-PDF evidence ──

        console.log("\n── Step 2: Canonical-Representation Decision (stale-PDF evidence) ─");

        const stalePdfResponse = await fetch(OECD_STALE_PDF_URL, {
          headers: { "User-Agent": "DRA-ENG-010/1.0" },
        });
        expect(stalePdfResponse.status).toBe(200);
        const staleLastModified = stalePdfResponse.headers.get("last-modified");
        console.log("  stale PDF URL        :", OECD_STALE_PDF_URL);
        console.log("  stale PDF Last-Modified :", staleLastModified);
        console.log(
          "  lastAmendmentDate (API) :",
          instrument.statusSummary.lastAmendmentDate,
        );
        // Drain the body without acquiring it — this candidate representation
        // is rejected, only its staleness evidence is used.
        await stalePdfResponse.arrayBuffer();

        expect(staleLastModified).not.toBeNull();
        const staleDate = new Date(staleLastModified as string);
        const lastAmendmentDate = new Date(
          instrument.statusSummary.lastAmendmentDate,
        );
        const pdfPredatesAmendment = staleDate.getTime() < lastAmendmentDate.getTime();
        console.log(
          "  PDF mirror predates current amendment:",
          pdfPredatesAmendment,
        );
        expect(pdfPredatesAmendment).toBe(true);
        console.log(
          "  DECISION: PDF mirror is stale. Acquiring the HTML instrument " +
            "record instead (see Step 4).",
        );

        // ── Step 3: Acquisition request (canonical HTML record) ────────────

        console.log("\n── Step 3: Acquisition Request (DRA-ACQ-000017) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000017",
          sourceUrl: OECD_CANONICAL_HTML_URL,
          requestedBy: "DRA-ACQ-010-preparation-operator",
          requestedAt: PREP_TIMESTAMP,
          expectedPublisher:
            "Organisation for Economic Co-operation and Development (OECD)",
          expectedTitle:
            "Recommendation of the Council on Artificial Intelligence",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 4: Fetch canonical HTML record (live, fetch #1) ────────────

        console.log("\n── Step 4: Fetch Canonical HTML Record (live network, #1) ─");

        const fetchResult1 = await fetcher(request, {});

        if (!fetchResult1.ok) {
          console.error("OECD fetch #1 FAILED:", fetchResult1.code, fetchResult1.message);
        }
        expect(fetchResult1.ok).toBe(true);
        if (!fetchResult1.ok) return;

        const source = fetchResult1.source;

        console.log("  finalUrl        :", source.finalUrl);
        console.log("  mediaType       :", source.mediaType);
        console.log("  httpStatus      :", source.httpStatus);
        console.log("  rawByteLength   :", source.rawBytes.length);
        console.log("  retrievedAt     :", source.retrievedAt);
        console.log("  redirects       :", source.redirects.length);
        console.log(
          "  responseHeaders :",
          JSON.stringify(source.httpResponseHeaders ?? {}),
        );

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("text/html");
        expect(source.rawBytes.length).toBeGreaterThan(10_000);

        // ── Step 5: Two independent live fetches — stability check ─────────

        console.log("\n── Step 5: Two Independent Live Fetches (stability) ────────");

        const fetchResult2 = await fetcher(request, {});
        expect(fetchResult2.ok).toBe(true);
        if (!fetchResult2.ok) return;

        const digest1 = computeSourceDigest(source.rawBytes);
        const digest2 = computeSourceDigest(fetchResult2.source.rawBytes);

        console.log("  fetch #1 source digest :", digest1);
        console.log("  fetch #2 source digest :", digest2);
        console.log("  fetch #1 byte length   :", source.rawBytes.length);
        console.log("  fetch #2 byte length   :", fetchResult2.source.rawBytes.length);

        expect(digest2).toBe(digest1);
        console.log("  ✓ Source is BYTE_STABLE across two independent fetches");
        console.log(
          "  NOTE: this confirms run-to-run reproducibility of the CURRENT " +
            "text only. It does not protect against a FUTURE OECD amendment " +
            "— that risk is recorded as unresolved in the Phase 2 report.",
        );

        const sourceDigest = digest1;

        // ── Step 6: Normalisation ─────────────────────────────────────────

        console.log("\n── Step 6: Normalisation (HTML → text) ─────────────────────");

        const normaliseResult = await normaliseContent(
          source.rawBytes,
          "text/html",
          sourceDigest,
        );

        if (!normaliseResult.ok) {
          console.error("Normalisation FAILED:", normaliseResult.code, normaliseResult.message);
        }
        expect(normaliseResult.ok).toBe(true);
        if (!normaliseResult.ok) return;

        const normalised = normaliseResult.document;

        console.log("  normalisationVersion :", normalised.normalisationVersion);
        console.log("  textDigest           :", normalised.textDigest);
        console.log("  textLength (chars)   :", normalised.text.length);

        expect(normalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(normalised.text.trim().length).toBeGreaterThan(0);

        // Independently confirm the fetched text reflects the CURRENT
        // (post-2024-amendment) definition wording, not the original 2019 text.
        console.log("\n── Step 6b: Current-Version Content Verification ───────────");
        const containsCurrentDefinition = normalised.text.includes(
          CURRENT_DEFINITION_MARKER,
        );
        console.log(
          "  contains post-2024-amendment definition marker:",
          containsCurrentDefinition,
        );
        expect(containsCurrentDefinition).toBe(true);

        // ── Step 7: Build existing corpus texts (DRA-DOC-0001–0014) ──────

        console.log("\n── Step 7: Build Existing Corpus Texts for Near-Duplicate Check ─");
        console.log("  DRA-DOC-0001–0006: from BENCHMARK_CORPUS (generatedText)");
        console.log("  DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture");
        console.log("  DRA-DOC-0008:      live fetch from acas.org.uk");
        console.log("  DRA-DOC-0009:      live fetch from assets.publishing.service.gov.uk");
        console.log("  DRA-DOC-0010:      live fetch from nvlpubs.nist.gov");
        console.log("  DRA-DOC-0011:      live fetch from ico.org.uk (14 sections)");
        console.log("  DRA-DOC-0012:      live fetch from bankofengland.co.uk");
        console.log("  DRA-DOC-0013:      live fetch from fda.gov");
        console.log("  DRA-DOC-0014:      live fetch from bis.org");

        const existingCorpusTexts = await buildExistingCorpusTexts(
          fetcher,
          PREP_TIMESTAMP,
        );

        console.log("  Total existing corpus texts:", existingCorpusTexts.length, "of 14");
        expect(existingCorpusTexts.length).toBe(14);

        // ── Step 8: Freeze eligibility check ─────────────────────────────

        console.log("\n── Step 8: Freeze Eligibility (13 checks — REVIEW_REQUIRED) ─");

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
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

        expect(eligibility.eligible).toBe(false);
        if (eligibility.eligible) return;

        console.log("\n  Blocking reasons:", eligibility.blockingReasons);

        expect(eligibility.blockingReasons).toEqual([
          "OFFICIAL_SOURCE_NOT_VERIFIED",
          "LICENCE_NOT_VERIFIED",
        ]);
        expect(eligibility.blockingReasons.length).toBe(2);

        // Near-duplicate check must have PASSED (not among the blockers).
        const nearDuplicateCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_NEAR_DUPLICATE",
        );
        console.log(
          "\n  Near-duplicate check:",
          nearDuplicateCheck?.passed ? "PASS ✓" : "FAIL ✗",
          "—",
          nearDuplicateCheck?.detail,
        );
        expect(nearDuplicateCheck?.passed).toBe(true);

        // ── Step 9: Explicit stop-before-freeze confirmation ────────────────

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-010 PHASE 2 PREPARATION COMPLETE — REVIEW_REQUIRED║",
        );
        console.log(
          "║  Human reviewer must verify official source and licence.   ║",
        );
        console.log(
          "║  No freeze record created. No corpus mutation performed.   ║",
        );
        console.log(
          "║  DRA-DOC-0015 does not exist as a corpus entry.             ║",
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
