/**
 * DRA-ACQ-020 — Phase 2: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0024 (Congressional Research Service Report R48555)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-020 PHASE 2                              ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-020-01, QUALIFIED_RECOMMENDED at the close of        ║
 * ║  DRA-ACQ-020 Phase 1 (see discovery/dra-acq-020-footnote-density-        ║
 * ║  discovery.ts). This test performs the accepted Phase 2 work only:       ║
 * ║  independent governance re-verification, admission-time live retrieval, ║
 * ║  freeze, normalisation, and corpus admission via the standard governed   ║
 * ║  pipeline (acquireFreezeAndEvaluate, unmodified). It does NOT predict    ║
 * ║  or engineer any particular evaluator decision.                          ║
 * ║                                                                          ║
 * ║  Document:   "Regulating Artificial Intelligence: U.S. and              ║
 * ║              International Approaches and Considerations for Congress"  ║
 * ║              (R48555, Version 4, June 4, 2025)                          ║
 * ║  Corpus ID:  DRA-DOC-0024                                                ║
 * ║  Freeze ID:  DRA-FRZ-000018                                              ║
 * ║  Acquisition ID: DRA-ACQ-000027 (programme ref: DRA-ACQ-020)             ║
 * ║  Publisher:  Congressional Research Service (CRS), Library of Congress   ║
 * ║  Source:     PDF, 1,077,858 bytes, 31 pages                             ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.congress.gov/crs_external_products/R/PDF/R48555/         ║
 * ║    R48555.4.pdf                                                          ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-10,           ║
 * ║  performed independently of the DRA-ACQ-020 Phase 1 discovery record):  ║
 * ║  - Official source: congress.gov is the official Library of Congress /  ║
 * ║    U.S. Congress domain that has hosted public CRS Reports since the     ║
 * ║    2018 appropriations-mandated public release; the exact URL above is  ║
 * ║    the canonical location for R48555 Version 4, confirmed live today.    ║
 * ║  - Availability/stability: two independent live HTTP GETs of the        ║
 * ║    canonical URL, taken independently, both returned HTTP 200,           ║
 * ║    content-type application/pdf, content-length 1,077,858 bytes, and     ║
 * ║    identical SHA-256                                                     ║
 * ║    146a79eb62c0d1d99d8eb5a44e86eb6b6851b013f0beab286df1f3f8c423b437      ║
 * ║    both times — matching the digest already recorded during Phase 1      ║
 * ║    discovery exactly. BYTE_STABLE.                                       ║
 * ║  - Licence: pdftotext extraction of the retrieved bytes confirms the     ║
 * ║    PDF's own final page (Disclaimer) states, in-document: "CRS Reports,  ║
 * ║    as a work of the United States Government, are not subject to        ║
 * ║    copyright protection in the United States. Any CRS Report may be     ║
 * ║    reproduced and distributed in its entirety without permission from    ║
 * ║    CRS." — a document-level statement, re-confirmed live for this        ║
 * ║    acquisition, consistent with the PUBLIC_DOMAIN basis already used for ║
 * ║    DRA-DOC-0010 (NIST) and DRA-DOC-0013 (FDA).                           ║
 * ║  - Public accessibility: no authentication, paywall, or access           ║
 * ║    circumvention of any kind was required.                              ║
 * ║  - Identity: page 1 / running-header text confirms title, "R48555",      ║
 * ║    "VERSION 4", and "June 4, 2025" — the exact candidate qualified in    ║
 * ║    Phase 1 (DRA-CAND-020-01), not a different version or a mirror.       ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain TECHNICAL (matches Phase 1; joins DRA-DOC-0007,  ║
 * ║  DRA-DOC-0010, DRA-DOC-0015, DRA-DOC-0018, DRA-DOC-0021), documentType   ║
 * ║  REPORT, language en-US (first US-English document; all prior English    ║
 * ║  documents are en or en-GB), difficulty HIGH (31 dense pages, 170        ║
 * ║  footnotes, extensive statutory/international citation).                 ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed):        ║
 * ║  DRA-DOC-0024 does NOT improve domain balance (TECHNICAL is already      ║
 * ║  well-represented) or introduce a new publisher class outside prior      ║
 * ║  government-report precedent. Its sole evidential purpose is the        ║
 * ║  footnote/citation-density robustness experiment described in the        ║
 * ║  Phase 1 qualification record and the DRA-ACQ-020 Phase 2 task spec.     ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE for this admission test (recorded verbatim, not            ║
 * ║  predicted): the actual decision, issue classes, and issue counts the    ║
 * ║  frozen evaluator (0.1.2) returns. Whatever it returns is logged below   ║
 * ║  as a required pipeline side effect.                                     ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in  ║
 * ║  DRA-ACQ-018/019 Phase 2: metadata-only prior-corpus entries are loaded  ║
 * ║  so ID/digest duplicate checks and the 23→24 manifest transition are     ║
 * ║  fully exercised; the optional content-similarity check is skipped as    ║
 * ║  this document's subject matter is not substantively similar to any     ║
 * ║  existing corpus entry.                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to www.congress.gov. Allow 5 minutes.
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

const REVIEW_TIMESTAMP = "2026-08-10T14:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-10T14:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-10T15:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0024 candidate
// ---------------------------------------------------------------------------

const CRS_R48555_PDF_URL =
  "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf";

/** Digest established during DRA-ACQ-020 Phase 1 discovery. */
const EXPECTED_SOURCE_DIGEST =
  "146a79eb62c0d1d99d8eb5a44e86eb6b6851b013f0beab286df1f3f8c423b437";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-020-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-020-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${CRS_R48555_PDF_URL}`,
    "Publisher: Congressional Research Service (CRS), the nonpartisan shared research arm of the U.S. " +
      "Congress, part of the Library of Congress. Document served from www.congress.gov, the official " +
      "U.S. Congress domain that has hosted public CRS Reports since the FY2018 appropriations-mandated " +
      "public release.",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): two independent GET " +
      "requests to the canonical PDF URL both return HTTP 200, content-type application/pdf, content-length " +
      "1,077,858 bytes both times, identical SHA-256 " +
      "146a79eb62c0d1d99d8eb5a44e86eb6b6851b013f0beab286df1f3f8c423b437 both times.",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-020 Phase 1 (DRA-CAND-020-01) — " +
      "same URL, same byte length (1,077,858), same SHA-256 digest, cross-checked independently rather than " +
      "relying solely on the Phase 1 assertion. pdftotext extraction confirms the running-header/title-page " +
      "text: 'Regulating Artificial Intelligence: U.S. and International Approaches and Considerations for " +
      "Congress', 'June 4, 2025', 'R48555 · VERSION 4 · NEW'.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official U.S. government domain.",
    "HUMAN GOVERNANCE DECISION: Congressional Research Service confirmed as the official publisher and " +
      "canonical source of this document — VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-020 Phase 2 human governance sign-off 2026-08-10. " +
    "CRS Report R48555 ('Regulating Artificial Intelligence: U.S. and International Approaches and " +
    "Considerations for Congress') official source VERIFIED, re-confirmed independently of Phase 1.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work — Public Domain (works of the U.S. Congress / CRS)",
  licenceUrl: "https://crsreports.congress.gov/",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-020-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): pdftotext extraction " +
      "of the freshly retrieved PDF bytes confirms the document's own final page ('Disclaimer') states " +
      "verbatim: 'CRS Reports, as a work of the United States Government, are not subject to copyright " +
      "protection in the United States. Any CRS Report may be reproduced and distributed in its entirety " +
      "without permission from CRS.'",
    "This is a document-level licence statement embedded in the artefact itself, not merely a site-wide " +
      "policy inference — the same PUBLIC_DOMAIN basis already accepted for DRA-DOC-0010 (NIST, 17 U.S.C. " +
      "§ 105) and DRA-DOC-0013 (FDA).",
    "NO CONTRADICTORY NOTICE FOUND: the disclaimer notes that a CRS Report 'may include copyrighted images " +
      "or material from a third party', requiring separate permission only for such third-party material — " +
      "this qualification does not narrow or override the public-domain status of the CRS-authored text " +
      "itself, which is what this acquisition retains, normalises, and evaluates.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (U.S. Government work) confirmed via an explicit in-document " +
      "disclaimer, with no contradictory or narrower override affecting the CRS-authored text — VERIFIED, " +
      "independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-020 Phase 2 human governance sign-off 2026-08-10. " +
    "U.S. Government work / public domain — VERIFIED via an explicit in-document disclaimer, matching and " +
    "re-confirming the DRA-ACQ-020 Phase 1 finding independently.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Regulating Artificial Intelligence: U.S. and International Approaches and Considerations for Congress",
  publisher: "Congressional Research Service (CRS), Library of Congress",
  publicationDate: "2025-06-04",
  domain: "TECHNICAL" as const,
  documentType: "REPORT" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-020 Phase 1 (see " +
  "discovery/dra-acq-020-footnote-density-discovery.ts, DRA-CAND-020-01). Sole experimental target: dense " +
  "footnote/citation-structure robustness — testing whether the footnote-flattening extraction defect " +
  "demonstrated on DRA-DOC-0023 (a single CMA document) is a generalisable pdftotext/EL-FOOTNOTE-REF " +
  "weakness or an isolated anomaly. This document contains 170 footnotes, visually confirmed genuinely " +
  "superscript in the source PDF, materially citing statutes, executive orders, and international " +
  "instruments — independently verified again at this admission time. " +
  "CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed): this document does NOT improve domain " +
  "or publisher diversity — TECHNICAL is already the most-represented domain and this is a second US-federal " +
  "government report alongside DRA-DOC-0010 (NIST) and DRA-DOC-0013 (FDA). It was selected purely for its " +
  "footnote/citation density as a robustness probe, not for corpus-balance reasons. " +
  "No expected decision or issue-class outcome is assumed by this inclusion rationale; whatever the frozen " +
  "evaluator (version 0.1.2) actually returns for this document is recorded verbatim in the admission test " +
  "below.";

// ---------------------------------------------------------------------------
// ENTRY_0023 — DRA-DOC-0023 (CMA, admitted under DRA-ACQ-019 Phase 2),
// reconstructed from the admitted record (metadata only — no text content
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

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [...PRIOR_CORPUS_ENTRIES, ENTRY_0023];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-020 Phase 2 — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0024 (CRS R48555)",
  () => {
    it(
      "reconfirms governance independently, verifies determinism via two independent live acquisitions, " +
        "admits DRA-DOC-0024 (CRS PDF) through eligibility, freeze, 24-document corpus integration, and " +
        "DRA evaluator execution (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-020 PHASE 2 — CORPUS ADMISSION LOG               ║");
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
          acquisitionId: "DRA-ACQ-000027",
          sourceUrl: CRS_R48555_PDF_URL,
          requestedBy: "DRA-ACQ-020-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Congressional Research Service (CRS)",
          expectedTitle: "Regulating Artificial Intelligence",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First CRS fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000027",
          sourceUrl: CRS_R48555_PDF_URL,
          requestedBy: "DRA-ACQ-020-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Congressional Research Service (CRS)",
          expectedTitle: "Regulating Artificial Intelligence",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second CRS fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
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
        expect(fetchA.source.rawBytes.length).toBe(1_077_858);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-020 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity + footnote-marker spot-check ──────
        //
        // Acquisition-integrity check only — no evaluator issue class or
        // decision is inferred. Confirms both that the document's own
        // substantive structure survived extraction, AND records the exact
        // raw footnote-marker text shape at several document locations,
        // which is the primary robustness question this acquisition exists
        // to answer (see the DRA-BMK-023 footnote-flattening finding).

        console.log("\n── Step 0b: Structural + Footnote-Marker Spot-Check ─────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          title: /Regulating Artificial Intelligence/,
          disclaimer: /Congressional Research Service \(CRS\)/,
          numbered_footnote_list: /^170 /m,
          statutory_citation: /National Defense Authorization Act|Executive Order/i,
          international_instrument_citation: /OECD|United Nations|European Union/i,
          publication_identity: /R48555/,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        // Footnote-count check: the footnote list at document end should
        // contain markers 1..170 as line-leading numbers (this is a raw-text
        // structural check, independent of the evaluator).
        const footnoteListMatches = admissionTimeText.match(/^(\d{1,3}) /gm) ?? [];
        console.log(`  raw line-leading numeric markers found: ${footnoteListMatches.length} (>= 170 expected, some false positives from body text are normal)`);
        expect(footnoteListMatches.length).toBeGreaterThanOrEqual(170);

        // Inline footnote-marker shape check — same glued-digit-after-period
        // pattern already demonstrated as the DRA-DOC-0023 extraction defect
        // trigger (EL-FOOTNOTE-REF's FOOTNOTE_RE only matches Unicode
        // superscript or markdown [^n], not plain digits glued onto prose).
        const inlineGluedFootnoteMarkers = admissionTimeText.match(/[a-zA-Z][.,;:)][0-9]{1,3}(?=[ A-Z])/g) ?? [];
        console.log(
          `  inline glued footnote-marker occurrences (e.g. "AI.4"): ${inlineGluedFootnoteMarkers.length} ` +
            `sample: ${JSON.stringify(inlineGluedFootnoteMarkers.slice(0, 8))}`,
        );
        expect(inlineGluedFootnoteMarkers.length).toBeGreaterThan(20);

        console.log(
          "  All structural elements identified in DRA-ACQ-020 Phase 1 remain present in the " +
            "admission-time extracted text ✓; the same glued-digit footnote-marker shape observed on " +
            "DRA-DOC-0023 is independently confirmed present in this document's raw extracted text.",
        );

        // ── Step 1: Setup — build 23-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 23-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  23-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(23);
        expect(registry.hasId("DRA-DOC-0024")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-020",
          protocolStatus: "APPROVED",
          targetCorpusSize: 24,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000027) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000027",
          sourceUrl: CRS_R48555_PDF_URL,
          requestedBy: "DRA-ACQ-020-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Congressional Research Service (CRS)",
          expectedTitle: "Regulating Artificial Intelligence",
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
            corpusDocumentId: "DRA-DOC-0024",
            freezeRecordId: "DRA-FRZ-000018",
            frozenBy: "DRA-ACQ-020-human-governance-operator",
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

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000018");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0024");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000027");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (24 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(24);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(24);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0024");
        expect(runA.manifest.documentIds[23]).toBe("DRA-DOC-0024");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-23 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(23);
        expect(runA.manifest.documentIds.slice(0, 23)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 24 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(24);

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

        // evaluateFrozenBenchmarkDocument requires the exact normalisedText
        // string (verified by digest), not the digest itself. Re-derive it
        // via normaliseContent using the same admission-time bytes
        // (deterministic given identical bytes), matching the freeze
        // record's own normalisation.
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
        // The substantive digest excludes non-substantive fields (timestamps)
        // by design (see evaluate-document.ts) — expected to match exactly
        // even though Run A and Run B used different fixedTimestamps.
        expect(runB.proofReference.proofReceiptSubstantiveDigest).toBe(
          runA.proofReference.proofReceiptSubstantiveDigest,
        );
        expect(receiptB["schemaVersion"]).toBe(receiptA["schemaVersion"]);

        console.log("\n── Admission + Baseline Evaluation Complete ─────────────────");
        console.log(
          "  Document:        DRA-DOC-0024 — Regulating Artificial Intelligence: U.S. and International " +
            "Approaches and Considerations for Congress (CRS R48555)",
        );
        console.log("  Publisher:       Congressional Research Service (CRS), Library of Congress");
        console.log("  Freeze record:   DRA-FRZ-000018");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     24 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log("  Licence:         U.S. Government work — public domain (in-document disclaimer)");
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0024 does NOT improve domain or publisher diversity; " +
            "selected purely as a footnote/citation-density robustness probe (see docblock).",
        );
      },
      300_000, // 5 minutes
    );
  },
);
