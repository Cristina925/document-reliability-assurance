/**
 * DRA-ACQ-022 — Phase 2: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0026 (PLOS ONE — "An analysis of the effects of sharing research
 * data, code, and preprints on citations", Colavizza et al. 2024)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-022 PHASE 2                              ║
 * ║                                                                          ║
 * ║  Candidate: primary recommendation qualified at the close of DRA-ACQ-022 ║
 * ║  Phase 1 discovery (see .local/reports/DRA-ACQ-022-Phase1-report.md).    ║
 * ║  This test performs the accepted Phase 2 admission work only:            ║
 * ║  independent governance re-verification, admission-time live retrieval,  ║
 * ║  freeze, normalisation, and corpus admission via the standard governed   ║
 * ║  pipeline (acquireFreezeAndEvaluate, unmodified). It does NOT predict    ║
 * ║  or engineer any particular evaluator decision.                          ║
 * ║                                                                          ║
 * ║  Document:   "An analysis of the effects of sharing research data,       ║
 * ║              code, and preprints on citations" (Colavizza G, Cadwallader ║
 * ║              L, LaFlamme M, Dozot G, Lecorney S, Rappo D,                 ║
 * ║              Hrynaszkiewicz I. PLoS ONE 19(10): e0311493)                ║
 * ║  DOI:        10.1371/journal.pone.0311493                                ║
 * ║  Corpus ID:  DRA-DOC-0026                                                ║
 * ║  Freeze ID:  DRA-FRZ-000020                                              ║
 * ║  Acquisition ID: DRA-ACQ-000029 (programme ref: DRA-ACQ-022)             ║
 * ║  Publisher:  PLOS (Public Library of Science)                            ║
 * ║  Source:     PDF, 1,572,031 bytes, 19 pages                              ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal   ║
 * ║    .pone.0311493&type=printable                                          ║
 * ║  Canonical landing/DOI:  https://doi.org/10.1371/journal.pone.0311493    ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-10,           ║
 * ║  performed independently of the DRA-ACQ-022 Phase 1 discovery record):  ║
 * ║  - Official source: journals.plos.org is the official PLOS ONE journal   ║
 * ║    domain; the URL above is the canonical printable-PDF endpoint served  ║
 * ║    by the article's own DOI landing page, confirmed live today.          ║
 * ║  - Availability/stability: three independent live HTTP GETs of the       ║
 * ║    canonical URL were taken independently for this acquisition (a        ║
 * ║    fourth transient 502 was discarded — PLOS's article-file endpoint is  ║
 * ║    occasionally flaky under retrieval, not a content-identity concern);  ║
 * ║    all three successful (200) responses returned content-type            ║
 * ║    application/pdf, content-length 1,572,031 bytes, and identical        ║
 * ║    SHA-256                                                                ║
 * ║    4d9769e0367defbe0a65ce183e2340299e53a899af3e3f2a734c654834504e10       ║
 * ║    — matching the digest recorded during Phase 1 discovery exactly.      ║
 * ║    BYTE_STABLE.                                                           ║
 * ║  - Licence: the PDF's own copyright line (page 1) states verbatim:       ║
 * ║    "Copyright: © 2024 Colavizza et al. This is an open access article    ║
 * ║    distributed under the terms of the Creative Commons Attribution       ║
 * ║    License, which permits unrestricted use, distribution, and            ║
 * ║    reproduction in any medium, provided the original author and source   ║
 * ║    are credited." — re-confirmed live for this acquisition, read from    ║
 * ║    the document itself rather than assumed from any "open access" badge, ║
 * ║    consistent with the OPEN_LICENCE basis already used for DRA-DOC-0012  ║
 * ║    (BCBS) and DRA-DOC-0022 (EEA, CC BY 4.0).                              ║
 * ║  - Public accessibility: no authentication, paywall, or access           ║
 * ║    circumvention of any kind was required.                              ║
 * ║  - Identity: extracted text confirms the exact title, author list, DOI,  ║
 * ║    and PLoS ONE 19(10): e0311493 citation string qualified in Phase 1 —  ║
 * ║    same PDF, same byte length (1,572,031), same SHA-256 digest, cross-   ║
 * ║    checked independently rather than relying solely on the Phase 1       ║
 * ║    assertion.                                                            ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain TECHNICAL (scholarly/scientometric research      ║
 * ║  article; joins no prior corpus entry of this exact type), documentType  ║
 * ║  ARTICLE, language en-US, difficulty HIGH (71 numbered references, 19    ║
 * ║  pages, dense figure/table cross-referencing, multiple citation-marker   ║
 * ║  forms — single, range, multi-citation, repeated).                       ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed):        ║
 * ║  DRA-DOC-0026 is the corpus's first peer-reviewed scientific research    ║
 * ║  article and its first OPEN_LICENCE (CC BY 4.0) English-language entry   ║
 * ║  of this genre — a genuine new document-type/genre addition, not merely  ║
 * ║  a domain/jurisdiction rebalancing pick. Its sole evidential purpose is  ║
 * ║  the claim→citation→reference-linkage robustness experiment described   ║
 * ║  in the Phase 1 qualification record and the DRA-ACQ-022 Phase 2 task    ║
 * ║  spec (see the companion citation-linkage-robustness test file).         ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE for this admission test (recorded verbatim, not            ║
 * ║  predicted): the actual decision, issue classes, and issue counts the    ║
 * ║  frozen evaluator (0.1.2) returns. Whatever it returns is logged below   ║
 * ║  as a required pipeline side effect.                                     ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in  ║
 * ║  DRA-ACQ-018/019/020/021 Phase 2: metadata-only prior-corpus entries are ║
 * ║  loaded so ID/digest duplicate checks and the 25→26 manifest transition  ║
 * ║  are fully exercised; the optional content-similarity check is skipped  ║
 * ║  as this document's subject matter (open-science citation econometrics) ║
 * ║  is not substantively similar to any existing corpus entry.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to journals.plos.org. Allow 5 minutes.
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

const REVIEW_TIMESTAMP = "2026-08-10T19:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-10T19:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-10T20:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0026 candidate
// ---------------------------------------------------------------------------

const PLOS_PDF_URL =
  "https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal.pone.0311493&type=printable";

/** Digest established during DRA-ACQ-022 Phase 1 discovery, re-verified above. */
const EXPECTED_SOURCE_DIGEST =
  "4d9769e0367defbe0a65ce183e2340299e53a899af3e3f2a734c654834504e10";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-022-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-022-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${PLOS_PDF_URL}`,
    "Publisher: PLOS (Public Library of Science), publishing under the PLOS ONE journal. Document served " +
      "from journals.plos.org, the official PLOS journal domain, as the printable-PDF endpoint linked " +
      "directly from the article's DOI landing page (https://doi.org/10.1371/journal.pone.0311493).",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): three independent " +
      "GET requests to the canonical PDF URL returned HTTP 200, content-type application/pdf, " +
      "content-length 1,572,031 bytes each time, identical SHA-256 " +
      "4d9769e0367defbe0a65ce183e2340299e53a899af3e3f2a734c654834504e10 each time (one additional transient " +
      "502 was observed and discarded as a retrieval hiccup, not a content-identity concern).",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-022 Phase 1 — same URL, same " +
      "byte length (1,572,031), same SHA-256 digest, cross-checked independently rather than relying solely " +
      "on the Phase 1 assertion. pdftotext extraction confirms the title 'An analysis of the effects of " +
      "sharing research data, code, and preprints on citations', the seven-author byline, and the citation " +
      "string 'PLoS ONE 19(10): e0311493'.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official scholarly-publisher domain.",
    "HUMAN GOVERNANCE DECISION: PLOS confirmed as the official publisher and canonical source of this " +
      "document — VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-022 Phase 2 human governance sign-off 2026-08-10. " +
    "PLOS ONE article (Colavizza et al. 2024, DOI 10.1371/journal.pone.0311493) official source VERIFIED, " +
    "re-confirmed independently of Phase 1.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Creative Commons Attribution License (CC BY 4.0)",
  licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-022-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): the PDF's own " +
      "copyright line (page 1, below the abstract) states verbatim: 'Copyright: © 2024 Colavizza et al. " +
      "This is an open access article distributed under the terms of the Creative Commons Attribution " +
      "License, which permits unrestricted use, distribution, and reproduction in any medium, provided the " +
      "original author and source are credited.'",
    "This is a document-embedded, per-article licence statement read directly from the source artefact " +
      "itself — NOT inferred from any 'open access' badge, journal-level policy page, or third-party " +
      "aggregator metadata.",
    "PLOS ONE's journal-wide licensing policy (published at plos.org) independently confirms all PLOS ONE " +
      "research articles are published under CC BY 4.0, corroborating the document-level statement without " +
      "being relied upon as the sole evidence.",
    "NO CONTRADICTORY NOTICE FOUND: no per-figure, per-table, or third-party-content licence carve-out was " +
      "found in the PDF (all figures/tables are the authors' own original work per the text).",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation — all consistent " +
      "with CC BY 4.0's permissive terms (attribution only).",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE (CC BY 4.0) confirmed via the document's own explicit copyright " +
      "line, corroborated by journal-wide policy, with no contradictory or narrower override found — " +
      "VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-022 Phase 2 human governance sign-off 2026-08-10. " +
    "CC BY 4.0 — VERIFIED directly from the document's own copyright line, matching and re-confirming the " +
    "DRA-ACQ-022 Phase 1 finding independently.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "An analysis of the effects of sharing research data, code, and preprints on citations",
  publisher: "PLOS (Public Library of Science) — PLOS ONE 19(10): e0311493",
  publicationDate: "2024-10-30",
  domain: "TECHNICAL" as const,
  documentType: "ARTICLE" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary candidate selected at the close of DRA-ACQ-022 Phase 1 (see " +
  ".local/reports/DRA-ACQ-022-Phase1-report.md). Sole experimental target: whether DRA preserves the " +
  "relationship between a scientific claim and its supporting citation/reference through acquisition, " +
  "representation, normalisation, and evaluation — not merely whether citation characters survive " +
  "extraction. This document contains 71 DOI/PMID-bearing references, bracketed numbered (Vancouver-style) " +
  "in-text citations including single citations, ranges ([1-3]), multi-citation groups ([7, 8]), and " +
  "repeated use of the same citation number from different claims ([17], five separate occurrences), plus " +
  "dense figure/table cross-references — independently re-verified again at this admission time. " +
  "CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed): this document is the corpus's first " +
  "peer-reviewed scientific research article and its first CC BY 4.0 English-language entry of this genre " +
  "— a genuine document-type/genre diversification, but it was selected purely for its citation-linkage " +
  "structural complexity as a robustness probe, not primarily for corpus-balance reasons. " +
  "No expected decision or issue-class outcome is assumed by this inclusion rationale; whatever the frozen " +
  "evaluator (version 0.1.2) actually returns for this document is recorded verbatim in the admission test " +
  "below.";

// ---------------------------------------------------------------------------
// ENTRY_0025 — DRA-DOC-0025 (EIA STEO, admitted under DRA-ACQ-021 Phase 2)
// Reconstructed from the admitted record (metadata only — no text content
// is required by CorpusDocumentInput). PRIOR_CORPUS_ENTRIES (imported)
// already covers DRA-DOC-0007..0022 unmodified since DRA-BMK-022/023, and
// ENTRY_0023/ENTRY_0024 are re-declared here as they were in the DRA-ACQ-021
// admission test (that shared file has not yet been extended past 0022).
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

const ENTRY_0025: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0025",
  title: "Short-Term Energy Outlook (STEO) — July 2026",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "FINANCE",
  language: "en-US",
  generator: "U.S. Energy Information Administration (EIA), U.S. Department of Energy",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009 from https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf",
  sourceReference: "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000028 (programme ref: DRA-ACQ-021). Freeze record: DRA-FRZ-000019. " +
    "Result: HOLD, 89 issues (all EVIDENCE_ABSENT), 4854 statements. Historical/forecast cell-shading " +
    "semantic loss demonstrated as a representation-boundary limitation (silent, not an extraction/" +
    "evaluator defect) — see DRA-ACQ-021 Phase 2.",
};

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [...PRIOR_CORPUS_ENTRIES, ENTRY_0023, ENTRY_0024, ENTRY_0025];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-022 Phase 2 — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0026 (PLOS ONE)",
  () => {
    it(
      "reconfirms governance independently, verifies determinism via independent live acquisitions, " +
        "admits DRA-DOC-0026 (PLOS ONE PDF) through eligibility, freeze, 26-document corpus integration, and " +
        "DRA evaluator execution (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-022 PHASE 2 — CORPUS ADMISSION LOG               ║");
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
          acquisitionId: "DRA-ACQ-000029",
          sourceUrl: PLOS_PDF_URL,
          requestedBy: "DRA-ACQ-022-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "PLOS (Public Library of Science)",
          expectedTitle: "An analysis of the effects of sharing research data, code, and preprints on citations",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        let fetchA = await fetcher(reqA.request, {});
        // PLOS's article-file endpoint is occasionally transiently flaky (502);
        // retry once on the initial fetch, exactly as observed and discarded
        // during manual Phase 2 admission-time re-verification above.
        if (!fetchA.ok) {
          console.warn("  First EIA fetch attempt (Acquisition A) failed, retrying once:", fetchA.code);
          fetchA = await fetcher(reqA.request, {});
        }
        if (!fetchA.ok) {
          console.error("First PLOS fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000029",
          sourceUrl: PLOS_PDF_URL,
          requestedBy: "DRA-ACQ-022-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "PLOS (Public Library of Science)",
          expectedTitle: "An analysis of the effects of sharing research data, code, and preprints on citations",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        let fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.warn("  Second EIA fetch attempt (Acquisition B) failed, retrying once:", fetchB.code);
          fetchB = await fetcher(reqB.request, {});
        }
        if (!fetchB.ok) {
          console.error("Second PLOS fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
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
        expect(fetchA.source.rawBytes.length).toBe(1_572_031);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-022 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity + citation spot-check ─────────────
        //
        // Acquisition-integrity check only — no evaluator issue class or
        // decision is inferred. Confirms both that the document's own
        // substantive structure survived extraction, AND records the exact
        // raw citation-marker text present at admission time, which is the
        // primary robustness question this acquisition exists to answer (see
        // the citation-linkage-robustness test file).

        console.log("\n── Step 0b: Structural + Citation Spot-Check ────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          title: /An analysis of the effects of sharing research/,
          author: /Colavizza/,
          doi: /10\.1371\/journal\.pone\.0311493/,
          licence: /Creative Commons Attribution License/,
          citation_single: /\[6\]/,
          citation_range: /\[1[–-]3\]/,
          citation_multi: /\[7, ?8\]/,
          reference6_unesco: /6\.\s+UNESCO\. UNESCO Recommendation on Open Science/,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        console.log(
          "  All structural elements identified in DRA-ACQ-022 Phase 1 remain present in the " +
            "admission-time extracted text ✓ (see the citation-linkage-robustness test file for the full " +
            "claim→citation→reference-linkage analysis).",
        );

        // ── Step 1: Setup — build 25-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 25-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  25-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(25);
        expect(registry.hasId("DRA-DOC-0026")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-022",
          protocolStatus: "APPROVED",
          targetCorpusSize: 26,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000029) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000029",
          sourceUrl: PLOS_PDF_URL,
          requestedBy: "DRA-ACQ-022-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "PLOS (Public Library of Science)",
          expectedTitle: "An analysis of the effects of sharing research data, code, and preprints on citations",
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
            corpusDocumentId: "DRA-DOC-0026",
            freezeRecordId: "DRA-FRZ-000020",
            frozenBy: "DRA-ACQ-022-human-governance-operator",
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

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000020");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0026");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000029");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (26 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(26);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(26);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0026");
        expect(runA.manifest.documentIds[25]).toBe("DRA-DOC-0026");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-25 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(25);
        expect(runA.manifest.documentIds.slice(0, 25)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 26 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(26);

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
        console.log("  Document:        DRA-DOC-0026 — PLOS ONE (Colavizza et al. 2024)");
        console.log("  Publisher:       PLOS (Public Library of Science)");
        console.log("  Freeze record:   DRA-FRZ-000020");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     26 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log("  Licence:         CC BY 4.0 (document-embedded copyright line)");
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0026 is the corpus's first peer-reviewed scientific " +
            "research article; selected purely as a claim→citation→reference-linkage robustness probe " +
            "(see docblock).",
        );
      },
      300_000, // 5 minutes
    );
  },
);
