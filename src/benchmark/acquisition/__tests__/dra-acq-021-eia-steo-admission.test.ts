/**
 * DRA-ACQ-021 — Phase 2: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0025 (U.S. Energy Information Administration — Short-Term Energy
 * Outlook, July 2026)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-021 PHASE 2                              ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-021-01, QUALIFIED_RECOMMENDED at the close of        ║
 * ║  DRA-ACQ-021 Phase 1 (see discovery/dra-acq-021-tabular-structure-       ║
 * ║  discovery.ts). This test performs the accepted Phase 2 work only:       ║
 * ║  independent governance re-verification, admission-time live retrieval,  ║
 * ║  freeze, normalisation, and corpus admission via the standard governed   ║
 * ║  pipeline (acquireFreezeAndEvaluate, unmodified). It does NOT predict    ║
 * ║  or engineer any particular evaluator decision.                          ║
 * ║                                                                          ║
 * ║  Document:   "Short-Term Energy Outlook" (STEO), July 2026 edition       ║
 * ║  Corpus ID:  DRA-DOC-0025                                                ║
 * ║  Freeze ID:  DRA-FRZ-000019                                              ║
 * ║  Acquisition ID: DRA-ACQ-000028 (programme ref: DRA-ACQ-021)             ║
 * ║  Publisher:  U.S. Energy Information Administration (EIA), U.S.          ║
 * ║              Department of Energy                                       ║
 * ║  Source:     PDF, 5,346,044 bytes, 56 pages                             ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf                  ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-10,           ║
 * ║  performed independently of the DRA-ACQ-021 Phase 1 discovery record):  ║
 * ║  - Official source: eia.gov is the official U.S. Energy Information      ║
 * ║    Administration domain; the exact URL above is directly linked from    ║
 * ║    the STEO landing page (eia.gov/outlooks/steo/), confirmed live today. ║
 * ║  - Availability/stability: two independent live HTTP GETs of the        ║
 * ║    canonical URL, taken independently, both returned HTTP 200,           ║
 * ║    content-type application/pdf, content-length 5,346,044 bytes, and     ║
 * ║    identical SHA-256                                                     ║
 * ║    c1a0d6814be9ee54241b7eb650b26d3c1b1d1483f70f9b5021fd975b05f7d251      ║
 * ║    both times — matching the digest recorded during Phase 1 discovery    ║
 * ║    exactly. BYTE_STABLE.                                                 ║
 * ║  - Licence: EIA's own copyrights-and-reuse page (eia.gov/about/          ║
 * ║    copyrights_reuse.php) states verbatim: "U.S. government publications  ║
 * ║    are in the public domain and are not subject to copyright             ║
 * ║    protection. You may use and/or distribute any of our data, files,     ║
 * ║    databases, reports, graphs, charts, and other information products    ║
 * ║    that are on our website..." — re-confirmed live for this acquisition, ║
 * ║    consistent with the PUBLIC_DOMAIN basis already used for              ║
 * ║    DRA-DOC-0010 (NIST), DRA-DOC-0013 (FDA), and DRA-DOC-0024 (CRS).      ║
 * ║  - Public accessibility: no authentication, paywall, or access           ║
 * ║    circumvention of any kind was required.                              ║
 * ║  - Identity: the extracted text's running header confirms "Short-Term    ║
 * ║    Energy Outlook" and the cover page confirms "July 2026" — the exact   ║
 * ║    edition qualified in Phase 1 (DRA-CAND-021-01), not a different       ║
 * ║    monthly edition.                                                      ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain FINANCE (joins DRA-DOC-0012 BCBS, DRA-DOC-0014   ║
 * ║  PRA), documentType REPORT, language en-US, difficulty HIGH (56 dense    ║
 * ║  pages, a 9-table numeric appendix with 3-level hierarchical column      ║
 * ║  headers).                                                               ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed):        ║
 * ║  DRA-DOC-0025 does NOT improve domain or jurisdiction balance (FINANCE / ║
 * ║  United States are already represented). Its sole evidential purpose is  ║
 * ║  the tabular semantic-preservation robustness experiment described in    ║
 * ║  the Phase 1 qualification record and the DRA-ACQ-021 Phase 2 task spec. ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE for this admission test (recorded verbatim, not            ║
 * ║  predicted): the actual decision, issue classes, and issue counts the    ║
 * ║  frozen evaluator (0.1.2) returns. Whatever it returns is logged below   ║
 * ║  as a required pipeline side effect.                                     ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in  ║
 * ║  DRA-ACQ-018/019/020 Phase 2: metadata-only prior-corpus entries are     ║
 * ║  loaded so ID/digest duplicate checks and the 24→25 manifest transition  ║
 * ║  are fully exercised; the optional content-similarity check is skipped   ║
 * ║  as this document's subject matter (energy-market statistics) is not     ║
 * ║  substantively similar to any existing corpus entry.                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to www.eia.gov. Allow 5 minutes.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { computeSourceDigest } from "../integrity.js";
import { createAcquisitionRequest } from "../request.js";
import { acquireFreezeAndEvaluate, evaluateFrozenBenchmarkDocument } from "../governed-pipeline.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { PRIOR_CORPUS_ENTRIES, CORPUS_VERSION as SHARED_CORPUS_VERSION } from "../../execution/__tests__/dra-bmk-023-prior-entries.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

const REVIEW_TIMESTAMP = "2026-08-10T17:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-10T17:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-10T18:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0025 candidate
// ---------------------------------------------------------------------------

const EIA_STEO_PDF_URL = "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf";

/** Digest established during DRA-ACQ-021 Phase 1 discovery. */
const EXPECTED_SOURCE_DIGEST =
  "c1a0d6814be9ee54241b7eb650b26d3c1b1d1483f70f9b5021fd975b05f7d251";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-021-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Human Governance Decision 1 — Official Source Verification
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-021-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${EIA_STEO_PDF_URL}`,
    "Publisher: U.S. Energy Information Administration (EIA), the independent statistical and analytical " +
      "agency within the U.S. Department of Energy. Document served from www.eia.gov, the official EIA " +
      "domain, and directly linked from the STEO landing page (eia.gov/outlooks/steo/).",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): two independent GET " +
      "requests to the canonical PDF URL both return HTTP 200, content-type application/pdf, content-length " +
      "5,346,044 bytes both times, identical SHA-256 " +
      "c1a0d6814be9ee54241b7eb650b26d3c1b1d1483f70f9b5021fd975b05f7d251 both times.",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-021 Phase 1 (DRA-CAND-021-01) — " +
      "same URL, same byte length (5,346,044), same SHA-256 digest, cross-checked independently rather than " +
      "relying solely on the Phase 1 assertion. pdftotext extraction confirms the running-header/title-page " +
      "text: 'Short-Term Energy Outlook', 'July 2026', and the U.S. Energy Information Administration byline.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official U.S. government domain.",
    "HUMAN GOVERNANCE DECISION: U.S. Energy Information Administration confirmed as the official publisher " +
      "and canonical source of this document — VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-021 Phase 2 human governance sign-off 2026-08-10. " +
    "EIA Short-Term Energy Outlook (July 2026 edition) official source VERIFIED, re-confirmed independently " +
    "of Phase 1.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work — Public Domain (EIA copyrights-and-reuse policy)",
  licenceUrl: "https://www.eia.gov/about/copyrights_reuse.php",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-021-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): EIA's own " +
      "copyrights-and-reuse page states verbatim: 'U.S. government publications are in the public domain " +
      "and are not subject to copyright protection. You may use and/or distribute any of our data, files, " +
      "databases, reports, graphs, charts, and other information products that are on our website or that " +
      "you receive through our email distribution service.'",
    "This is an agency-wide licence statement covering all EIA publications, consistent with the " +
      "PUBLIC_DOMAIN basis already accepted for DRA-DOC-0010 (NIST, 17 U.S.C. § 105), DRA-DOC-0013 (FDA), " +
      "and DRA-DOC-0024 (CRS, document-level disclaimer).",
    "NO CONTRADICTORY NOTICE FOUND: no per-document copyright notice, embargo, or narrower licence override " +
      "was found on the STEO PDF or its landing page.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (U.S. Government work) confirmed via an explicit agency-wide " +
      "reuse policy, with no contradictory or narrower override found — VERIFIED, independently re-confirmed " +
      "at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-021 Phase 2 human governance sign-off 2026-08-10. " +
    "U.S. Government work / public domain — VERIFIED via EIA's agency-wide copyrights-and-reuse policy, " +
    "matching and re-confirming the DRA-ACQ-021 Phase 1 finding independently.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Short-Term Energy Outlook (STEO) — July 2026",
  publisher: "U.S. Energy Information Administration (EIA), U.S. Department of Energy",
  publicationDate: "2026-07-01",
  domain: "FINANCE" as const,
  documentType: "REPORT" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-021 Phase 1 (see " +
  "discovery/dra-acq-021-tabular-structure-discovery.ts, DRA-CAND-021-01). Sole experimental target: " +
  "complex-table / tabular-semantic-preservation robustness — testing whether row/column relationships, " +
  "hierarchical headers, table notes, units, and a visual-only (cell-shading) historical/forecast " +
  "distinction survive the pipeline's linear-text extraction and normalisation. This document contains a " +
  "9-table numeric appendix with 3-level hierarchical column headers and lettered table-note footnotes, " +
  "independently verified again at this admission time. " +
  "CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed): this document does NOT improve domain " +
  "or jurisdiction diversity — FINANCE and United States are already represented (DRA-DOC-0012, " +
  "DRA-DOC-0014, DRA-DOC-0024). It was selected purely for its tabular structural complexity as a " +
  "robustness probe, not for corpus-balance reasons. " +
  "No expected decision or issue-class outcome is assumed by this inclusion rationale; whatever the frozen " +
  "evaluator (version 0.1.2) actually returns for this document is recorded verbatim in the admission test " +
  "below.";

// ---------------------------------------------------------------------------
// ENTRY_0023 — DRA-DOC-0023 (CMA, admitted under DRA-ACQ-019 Phase 2)
// ENTRY_0024 — DRA-DOC-0024 (CRS, admitted under DRA-ACQ-020 Phase 2)
// Reconstructed from the admitted record (metadata only — no text content
// is required by CorpusDocumentInput). PRIOR_CORPUS_ENTRIES (imported)
// already covers DRA-DOC-0007..0022 unmodified since DRA-BMK-022/023.
// ---------------------------------------------------------------------------

const ENTRY_0023: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0023",
  title:
    "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling and " +
    "advertising of recycling-related features (Case 51098)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority (CMA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
  sourceReference:
    "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000026 (programme ref: DRA-ACQ-019). Freeze record: DRA-FRZ-000017. " +
    "Result: HOLD, 184 issues (173 EVIDENCE_ABSENT + 11 EVIDENCE_INADEQUATE), 9235 statements. " +
    "Footnote-flattening extraction defect (Category B) demonstrated on this document — see DRA-BMK-023.",
};

const ENTRY_0024: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0024",
  title: "Regulating Artificial Intelligence: U.S. and International Approaches and Considerations for Congress",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "Congressional Research Service (CRS), Library of Congress",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf",
  sourceReference: "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000027 (programme ref: DRA-ACQ-020). Freeze record: DRA-FRZ-000018. " +
    "Result: REVIEW, 1 issue (EVIDENCE_INADEQUATE), footnote-flattening extraction defect (Category B) " +
    "reproduced on a second, independent publisher but did not generalise to a broad decision-level " +
    "weakness — see DRA-ACQ-020 Phase 2 footnote-robustness analysis.",
};

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [...PRIOR_CORPUS_ENTRIES, ENTRY_0023, ENTRY_0024];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-021 Phase 2 — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0025 (EIA STEO)",
  () => {
    it(
      "reconfirms governance independently, verifies determinism via two independent live acquisitions, " +
        "admits DRA-DOC-0025 (EIA PDF) through eligibility, freeze, 25-document corpus integration, and " +
        "DRA evaluator execution (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-021 PHASE 2 — CORPUS ADMISSION LOG               ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Step 0: Determinism check — two independent live fetches ────────

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000028",
          sourceUrl: EIA_STEO_PDF_URL,
          requestedBy: "DRA-ACQ-021-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "U.S. Energy Information Administration (EIA)",
          expectedTitle: "Short-Term Energy Outlook",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First EIA fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000028",
          sourceUrl: EIA_STEO_PDF_URL,
          requestedBy: "DRA-ACQ-021-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "U.S. Energy Information Administration (EIA)",
          expectedTitle: "Short-Term Energy Outlook",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second EIA fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
        }
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  Acquisition A HTTP status :", fetchA.source.httpStatus);
        console.log("  Acquisition A finalUrl    :", fetchA.source.finalUrl);
        console.log("  Acquisition A mediaType   :", fetchA.source.mediaType);
        console.log("  Acquisition A byte length :", fetchA.source.rawBytes.length);
        console.log("  Acquisition A sourceDigest:", digestA);
        console.log("  Acquisition B byte length :", fetchB.source.rawBytes.length);
        console.log("  Acquisition B sourceDigest:", digestB);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchB.source.httpStatus).toBe(200);
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(fetchA.source.rawBytes.length).toBe(5_346_044);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-021 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity + table spot-check ─────────────────
        //
        // Acquisition-integrity check only — no evaluator issue class or
        // decision is inferred. Confirms both that the document's own
        // substantive structure survived extraction, AND records the exact
        // raw table-title/table-note text present at admission time, which
        // is the primary robustness question this acquisition exists to
        // answer (see the tabular-robustness test file).

        console.log("\n── Step 0b: Structural + Table Spot-Check ───────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          title: /Short-Term Energy Outlook/,
          publisher: /U\.S\. Energy Information Administration/,
          edition: /July 2026/,
          table6_title: /Table 6\. U\.S\. Coal Supply, Consumption, and Inventories/,
          table8_title: /Table 8\. U\.S\. Renewable Energy Consumption/,
          historical_forecast_note: /historical data with no shading; estimates and forecasts are shaded gray/i,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        console.log(
          "  All structural elements identified in DRA-ACQ-021 Phase 1 remain present in the " +
            "admission-time extracted text ✓, including the historical/forecast shading LEGEND TEXT itself " +
            "— the shading colour information it describes is, as expected, absent from plain-text " +
            "extraction (see tabular-robustness test file for the full analysis).",
        );

        // ── Step 1: Setup — build 24-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 24-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  24-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(24);
        expect(registry.hasId("DRA-DOC-0025")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-021",
          protocolStatus: "APPROVED",
          targetCorpusSize: 25,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000028) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000028",
          sourceUrl: EIA_STEO_PDF_URL,
          requestedBy: "DRA-ACQ-021-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "U.S. Energy Information Administration (EIA)",
          expectedTitle: "Short-Term Energy Outlook",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 3: Run full governed pipeline — RUN A ──────────────────────

        console.log("\n── Step 3: Governed Pipeline — acquireFreezeAndEvaluate (RUN A) ─");

        const pipelineResult = await acquireFreezeAndEvaluate(
          {
            request,
            officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
            licenceAssessment: LICENCE_ASSESSMENT,
            approvedMetadata: APPROVED_METADATA,
            corpusDocumentId: "DRA-DOC-0025",
            freezeRecordId: "DRA-FRZ-000019",
            frozenBy: "DRA-ACQ-021-human-governance-operator",
            benchmarkVersion: CORPUS_VERSION,
            inclusionRationale: INCLUSION_RATIONALE,
          },
          {
            fetcher,
            pdfExtractor: extractPdfText,
            registry,
            protocol,
            fixedTimestamp: FREEZE_TIMESTAMP,
          },
        );

        if (!pipelineResult.ok) {
          console.error("Pipeline FAILED at stage:", pipelineResult.stage);
          console.error("Errors:", JSON.stringify(pipelineResult.errors, null, 2));
        }
        expect(pipelineResult.ok).toBe(true);
        if (!pipelineResult.ok) return;

        const { result: runA } = pipelineResult;

        // ── Freeze record log ────────────────────────────────────────────────

        console.log("\n── Freeze Record (Run A) ─────────────────────────────────────");
        console.log("  freezeRecordId       :", runA.freeze.freezeRecordId);
        console.log("  corpusDocumentId     :", runA.freeze.corpusDocumentId);
        console.log("  acquisitionId        :", runA.freeze.acquisitionId);
        console.log("  sourceDigest         :", runA.freeze.sourceDigest);
        console.log("  normalisedTextDigest :", runA.freeze.normalisedTextDigest);
        console.log("  metadataDigest       :", runA.freeze.metadataDigest);
        console.log("  freezeRecordDigest   :", runA.freeze.freezeRecordDigest);
        console.log("  status               :", runA.freeze.status);

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000019");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0025");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000028");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (25 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(25);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(25);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0025");
        expect(runA.manifest.documentIds[24]).toBe("DRA-DOC-0025");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-24 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(24);
        expect(runA.manifest.documentIds.slice(0, 24)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 25 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(25);

        const manifestIntact = verifyManifestIntegrity(runA.manifest);
        console.log(`  manifest integrity check : ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
        expect(manifestIntact).toBe(true);

        // ── DRA Evaluator execution log — Run A ──────────────────────────────

        console.log("\n── DRA Evaluator Execution (Run A) ──────────────────────────");
        console.log("  decision                 :", runA.decision);

        expect(runA.evaluationResult.ok).toBe(true);
        const evalA = runA.evaluationResult.ok ? runA.evaluationResult : null;
        expect(evalA).not.toBeNull();
        if (!evalA) return;

        const receiptA = evalA.proofReceipt as Record<string, unknown>;
        const identityA = receiptA["evaluatorIdentity"] as Record<string, unknown> | undefined;

        console.log("  evaluatorVersion         :", identityA?.["evaluatorVersion"]);
        console.log("  pipelineVersion          :", identityA?.["pipelineVersion"]);
        console.log("  receipt schemaVersion    :", receiptA["schemaVersion"]);
        console.log("  substantiveDigest        :", runA.proofReference.proofReceiptSubstantiveDigest);

        const pipeLogA = evalA.pipeline as Record<string, unknown>;
        const s2LogA = pipeLogA["stage2"] as Record<string, unknown> | undefined;
        const stmtsLogA = ((s2LogA?.["statements"] ?? s2LogA?.["claims"] ?? []) as unknown[]);
        const s6LogA = pipeLogA["consistencyCheck"] as Record<string, unknown> | undefined;
        const issuesArrLogA = (s6LogA?.["issues"] ?? (evalA as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
          Record<string, unknown>
        >;
        const issueClassesLogA = Array.from(
          new Set(issuesArrLogA.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
        );

        console.log("  statementCount           :", stmtsLogA.length);
        console.log("  issueCount               :", issuesArrLogA.length);
        console.log("  issueClasses             :", JSON.stringify(issueClassesLogA));

        expect(identityA?.["evaluatorVersion"]).toBe("0.1.2");
        expect(identityA?.["pipelineVersion"]).toBe("1.0");
        expect(receiptA["schemaVersion"]).toBe("0.1.0");
        expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(runA.decision);

        const receiptIntegrityA = verifyReceiptIntegrity(evalA.proofReceipt as never);
        console.log("  proof receipt integrity  :", receiptIntegrityA);
        expect(receiptIntegrityA).toBe(true);

        // ── Step 4: Run B — determinism re-evaluation via the frozen record ─

        console.log("\n── Step 4: Determinism Re-Evaluation (RUN B) ────────────────");

        const { normaliseContent } = await import("../normalisation.js");
        const normResultB = await normaliseContent(
          fetchA.source.rawBytes,
          "application/pdf",
          digestA,
          extractPdfText,
        );
        expect(normResultB.ok).toBe(true);
        if (!normResultB.ok) return;

        const runBFinal = evaluateFrozenBenchmarkDocument({
          freezeRecord: runA.freeze,
          rawBytes: fetchA.source.rawBytes,
          normalisedText: normResultB.document.text,
          approvedMetadata: APPROVED_METADATA,
          registry,
          fixedTimestamp: RUN_B_TIMESTAMP,
        });

        if (!runBFinal.ok) {
          console.error("Run B FAILED at stage:", runBFinal.stage, JSON.stringify(runBFinal.errors));
        }
        expect(runBFinal.ok).toBe(true);
        if (!runBFinal.ok) return;

        const runB = runBFinal.result;
        expect(runB.evaluationResult.ok).toBe(true);
        const evalB = runB.evaluationResult.ok ? runB.evaluationResult : null;
        if (!evalB) return;

        const receiptB = evalB.proofReceipt as Record<string, unknown>;
        const pipeLogB = evalB.pipeline as Record<string, unknown>;
        const s2LogB = pipeLogB["stage2"] as Record<string, unknown> | undefined;
        const stmtsLogB = ((s2LogB?.["statements"] ?? s2LogB?.["claims"] ?? []) as unknown[]);
        const s6LogB = pipeLogB["consistencyCheck"] as Record<string, unknown> | undefined;
        const issuesArrLogB = (s6LogB?.["issues"] ?? (evalB as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
          Record<string, unknown>
        >;
        const issueClassesLogB = Array.from(
          new Set(issuesArrLogB.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
        );

        console.log("  Run B decision           :", runB.decision);
        console.log("  Run B statementCount     :", stmtsLogB.length);
        console.log("  Run B issueCount         :", issuesArrLogB.length);
        console.log("  Run B issueClasses       :", JSON.stringify(issueClassesLogB));
        console.log("  Run B substantiveDigest  :", runB.proofReference.proofReceiptSubstantiveDigest);

        const receiptIntegrityB = verifyReceiptIntegrity(evalB.proofReceipt as never);
        console.log("  Run B receipt integrity  :", receiptIntegrityB);
        expect(receiptIntegrityB).toBe(true);

        // ── Determinism comparison — Run A vs Run B ──────────────────────────

        console.log("\n── Determinism Comparison (Run A vs Run B) ──────────────────");
        console.log(`  decision match       : ${runA.decision === runB.decision}`);
        console.log(`  statement count match: ${stmtsLogA.length === stmtsLogB.length}`);
        console.log(`  issue count match    : ${issuesArrLogA.length === issuesArrLogB.length}`);
        console.log(
          `  substantive digest match: ${
            runA.proofReference.proofReceiptSubstantiveDigest === runB.proofReference.proofReceiptSubstantiveDigest
          }`,
        );

        expect(runB.decision).toBe(runA.decision);
        expect(stmtsLogB.length).toBe(stmtsLogA.length);
        expect(issuesArrLogB.length).toBe(issuesArrLogA.length);
        expect(issueClassesLogB.sort()).toEqual(issueClassesLogA.sort());
        expect(runB.proofReference.proofReceiptSubstantiveDigest).toBe(
          runA.proofReference.proofReceiptSubstantiveDigest,
        );
        expect(receiptB["schemaVersion"]).toBe(receiptA["schemaVersion"]);

        console.log("\n── Admission + Baseline Evaluation Complete ─────────────────");
        console.log("  Document:        DRA-DOC-0025 — Short-Term Energy Outlook, July 2026 (EIA)");
        console.log("  Publisher:       U.S. Energy Information Administration (EIA)");
        console.log("  Freeze record:   DRA-FRZ-000019");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     25 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log("  Licence:         U.S. Government work — public domain (agency-wide reuse policy)");
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0025 does NOT improve domain or jurisdiction diversity; " +
            "selected purely as a tabular semantic-preservation robustness probe (see docblock).",
        );
      },
      300_000, // 5 minutes
    );
  },
);
