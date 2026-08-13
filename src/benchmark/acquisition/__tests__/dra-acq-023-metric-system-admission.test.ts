/**
 * DRA-ACQ-023 — Phase 2A/2B: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0027 ("The Metric System" — U.S. House Committee on Science and
 * Astronautics hearing, 87th Congress, 1961; GovInfo/GPO CHRG-87hhrg72535)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-023 PHASE 2A/2B                         ║
 * ║                                                                          ║
 * ║  Candidate: primary recommendation qualified at the close of DRA-ACQ-023 ║
 * ║  Phase 1 discovery (see discovery/dra-acq-023-scan-ocr-discovery.ts,     ║
 * ║  DRA-CAND-023-01). This test performs the accepted Phase 2A/2B work      ║
 * ║  only: independent governance re-verification, admission-time live      ║
 * ║  retrieval, freeze, normalisation, and corpus admission via the         ║
 * ║  standard governed pipeline (acquireFreezeAndEvaluate, unmodified). It  ║
 * ║  does NOT predict or engineer any particular evaluator decision, and it ║
 * ║  does NOT repair OCR behaviour (per the DRA-ACQ-023 Phase 2 task spec's  ║
 * ║  explicit "do not repair OCR behaviour during Phase 2" instruction).    ║
 * ║                                                                          ║
 * ║  Document:   "The Metric System: Hearings Before Subcommittee No. 1 and ║
 * ║              the Committee on Science and Astronautics, U.S. House of   ║
 * ║              Representatives, 87th Congress, 1st Session, on H.R. 269   ║
 * ║              and H.R. 2049" (June 28, 29, and July 21, 1961)            ║
 * ║  Corpus ID:  DRA-DOC-0027                                                ║
 * ║  Freeze ID:  DRA-FRZ-000021 (allocated from actual repository state —   ║
 * ║              the highest existing freeze ID at the start of this        ║
 * ║              acquisition was DRA-FRZ-000020, used by DRA-DOC-0026)      ║
 * ║  Acquisition ID: DRA-ACQ-000030 (programme ref: DRA-ACQ-023; the        ║
 * ║              highest existing acquisition ID was DRA-ACQ-000029, used   ║
 * ║              by DRA-DOC-0026's acquisition — DRA-ACQ-000099 and         ║
 * ║              DRA-ACQ-999999 are pre-existing test-fixture sentinel      ║
 * ║              values, not real allocations, and are excluded)            ║
 * ║  Publisher:  U.S. Government Printing Office / U.S. Government          ║
 * ║              Publishing Office (via GovInfo)                            ║
 * ║  Source:     PDF, 49,508,560 bytes, 80 pages                            ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/            ║
 * ║    CHRG-87hhrg72535.pdf                                                  ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-10,           ║
 * ║  performed independently of the DRA-ACQ-023 Phase 1 discovery record):  ║
 * ║  - Official source: govinfo.gov is the official U.S. Government         ║
 * ║    Publishing Office domain; the canonical package URL is confirmed by  ║
 * ║    GovInfo's own MODS metadata record for package CHRG-87hhrg72535,     ║
 * ║    fetched live today (https://www.govinfo.gov/metadata/pkg/            ║
 * ║    CHRG-87hhrg72535/mods.xml, HTTP 200).                                ║
 * ║  - Availability/stability: two independent live HTTP GETs of the        ║
 * ║    canonical URL, taken independently for this acquisition, both        ║
 * ║    returned HTTP 200, content-type application/pdf, content-length      ║
 * ║    49,508,560 bytes, and identical SHA-256                              ║
 * ║    a34a88adf82f87c3cc55dc946d230efc1336299d2c21d8f2d42ce38f61992235      ║
 * ║    both times — matching the digest recorded during Phase 1 discovery   ║
 * ║    exactly. BYTE_STABLE (only classified as such because the retrieved  ║
 * ║    bytes actually matched, per the task spec's explicit instruction).   ║
 * ║  - Licence: PUBLIC_DOMAIN. This is a U.S. House of Representatives      ║
 * ║    committee hearing transcript printed by the U.S. Government Printing ║
 * ║    Office, a work of the U.S. federal government under 17 U.S.C. §105.  ║
 * ║    GovInfo's own MODS record (re-fetched live today) classifies the     ║
 * ║    issuing body as "United States. Congress. House. Committee on        ║
 * ║    Science and Astronautics" and the collection as a Congressional      ║
 * ║    Hearing (CHRG) — the same basis already used for DRA-DOC-0010        ║
 * ║    (NIST), DRA-DOC-0013 (FDA), and DRA-DOC-0024 (CRS).                  ║
 * ║  - Representation classification: OCR_TEXT_LAYER, re-confirmed live     ║
 * ║    today. GovInfo's MODS record states verbatim                         ║
 * ║    <digitalOrigin>reformatted digital</digitalOrigin>. pdfinfo reports   ║
 * ║    Creator "OmniPage CSDK 19" (a commercial OCR engine). This is a      ║
 * ║    genuinely different representation type from every one of the 26     ║
 * ║    documents already admitted to this corpus.                          ║
 * ║  - Public accessibility: no authentication, paywall, or access          ║
 * ║    circumvention of any kind was required.                              ║
 * ║  - Identity: extracted text confirms the exact hearing title, the       ║
 * ║    "Eighty-seventh Congress, first session" designation, and the H.R.   ║
 * ║    269 / H.R. 2049 bill numbers qualified in Phase 1 — same PDF, same   ║
 * ║    byte length (49,508,560), same SHA-256 digest, cross-checked         ║
 * ║    independently rather than relying solely on the Phase 1 assertion.   ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain GENERAL, documentType REPORT, language en-US,   ║
 * ║  difficulty HIGH (80-page OCR-derived scan, degraded front matter,      ║
 * ║  library-provenance artefacts interleaved with body text).              ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed):       ║
 * ║  DRA-DOC-0027 does NOT improve domain (GENERAL, already well            ║
 * ║  represented) or jurisdiction (United States, already the corpus's most ║
 * ║  common jurisdiction) diversity. Its sole evidential purpose is the     ║
 * ║  scan/OCR representation-fidelity robustness experiment described in    ║
 * ║  the Phase 1 qualification record and the DRA-ACQ-023 Phase 2 task      ║
 * ║  spec (see the companion ocr-representation-robustness test file).      ║
 * ║                                                                          ║
 * ║  OUT OF SCOPE for this admission test (recorded verbatim, not           ║
 * ║  predicted): the actual decision, issue classes, and issue counts the   ║
 * ║  frozen evaluator (0.1.2) returns. Whatever it returns is logged below  ║
 * ║  as a required pipeline side effect, per the task spec's own            ║
 * ║  instruction not to modify evaluator behaviour based on the result.     ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in ║
 * ║  DRA-ACQ-018/019/020/021/022 Phase 2: metadata-only prior-corpus        ║
 * ║  entries are loaded so ID/digest duplicate checks and the 26→27         ║
 * ║  manifest transition are fully exercised; the optional content-         ║
 * ║  similarity check is skipped as this document's subject matter (a      ║
 * ║  1961 metric-system-adoption hearing transcript) is not substantively   ║
 * ║  similar to any existing corpus entry.                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to www.govinfo.gov, fetching a
 * ~49.5MB PDF twice for the determinism check plus once more inside the
 * governed pipeline. Allow 5 minutes.
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
// Canonical PDF URL — DRA-DOC-0027 candidate
// ---------------------------------------------------------------------------

const CHRG_PDF_URL = "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf";

/** Digest established during DRA-ACQ-023 Phase 1 discovery, re-confirmed at Phase 2 admission time. */
const EXPECTED_SOURCE_DIGEST = "a34a88adf82f87c3cc55dc946d230efc1336299d2c21d8f2d42ce38f61992235";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-023-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-023-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${CHRG_PDF_URL}`,
    "Publisher: U.S. Government Printing Office / U.S. Government Publishing Office, via GovInfo " +
      "(govinfo.gov), the official U.S. government portal for federal publications. Issuing body per " +
      "GovInfo's own MODS record: 'United States. Congress. House. Committee on Science and Astronautics.'",
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): two independent GET " +
      "requests to the canonical PDF URL both return HTTP 200, content-type application/pdf, content-length " +
      "49,508,560 bytes both times, identical SHA-256 " +
      "a34a88adf82f87c3cc55dc946d230efc1336299d2c21d8f2d42ce38f61992235 both times. GovInfo's own MODS " +
      "metadata endpoint (govinfo.gov/metadata/pkg/CHRG-87hhrg72535/mods.xml) also re-fetched live today, " +
      "HTTP 200, confirming the exact title and <digitalOrigin>reformatted digital</digitalOrigin> statement.",
    "IDENTITY CONFIRMATION: this is the exact candidate qualified in DRA-ACQ-023 Phase 1 (DRA-CAND-023-01) — " +
      "same URL, same byte length (49,508,560), same SHA-256 digest, cross-checked independently rather than " +
      "relying solely on the Phase 1 assertion. pdftotext extraction confirms the hearing title, the " +
      "'Eighty-seventh Congress, first session' designation, and bill numbers H.R. 269 / H.R. 2049.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official U.S. government domain.",
    "HUMAN GOVERNANCE DECISION: U.S. Government Printing Office / GovInfo confirmed as the official publisher " +
      "and canonical source of this document — VERIFIED, independently re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-023 Phase 2 human governance sign-off 2026-08-10. " +
    "GovInfo/GPO 'The Metric System' (CHRG-87hhrg72535, 1961) official source VERIFIED, re-confirmed " +
    "independently of Phase 1.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work — Public Domain (17 U.S.C. §105)",
  licenceUrl: "https://www.govinfo.gov/metadata/pkg/CHRG-87hhrg72535/mods.xml",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-023-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "RE-VERIFIED LIVE 2026-08-10 (this acquisition, independent of Phase 1 discovery): this is a transcript " +
      "of a U.S. House of Representatives committee hearing, printed and published by the U.S. Government " +
      "Printing Office and served today via GovInfo's own MODS record, which identifies the U.S. House of " +
      "Representatives Committee on Science and Astronautics as the issuing body — a work of the U.S. " +
      "federal government under 17 U.S.C. §105, which places such works in the public domain within the " +
      "United States with no copyright protection available.",
    "This is the same basis already accepted for DRA-DOC-0010 (NIST), DRA-DOC-0013 (FDA), and DRA-DOC-0024 " +
      "(CRS) — U.S. federal government authorship, not a site-wide reuse-policy inference.",
    "NO CONTRADICTORY NOTICE FOUND: no per-document copyright notice, embargo, or narrower licence override " +
      "was found on the CHRG PDF or its GovInfo package page.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (U.S. Government work, 17 U.S.C. §105) confirmed via direct " +
      "federal authorship, with no contradictory or narrower override found — VERIFIED, independently " +
      "re-confirmed at Phase 2 admission time.",
  ],
  notes:
    "DRA-ACQ-023 Phase 2 human governance sign-off 2026-08-10. " +
    "U.S. Government work / public domain — VERIFIED via direct federal committee authorship, matching and " +
    "re-confirming the DRA-ACQ-023 Phase 1 finding independently.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "The Metric System: Hearings Before Subcommittee No. 1 and the Committee on Science and Astronautics, " +
    "U.S. House of Representatives, Eighty-Seventh Congress, First Session, on H.R. 269 and H.R. 2049 " +
    "(June 28, 29, and July 21, 1961)",
  publisher: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo, GPO)",
  publicationDate: "1961-06-28",
  domain: "GENERAL" as const,
  documentType: "REPORT" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-023 Phase 1 (see " +
  "discovery/dra-acq-023-scan-ocr-discovery.ts, DRA-CAND-023-01). Sole experimental target: scan/OCR " +
  "representation-fidelity robustness — testing whether DRA can recognise when its normal text-extraction " +
  "path does not faithfully represent an authoritative source that exists only as OCR-derived text over a " +
  "scanned page image, independently re-verified again at this admission time (Creator 'OmniPage CSDK 19', " +
  "MODS digitalOrigin 'reformatted digital'). " +
  "CORPUS-BALANCE DISCLOSURE (explicitly preserved, not concealed): this document does NOT improve domain " +
  "or jurisdiction diversity — GENERAL and United States are already well represented. It was selected " +
  "purely for its OCR_TEXT_LAYER representation type as a robustness probe, not for corpus-balance reasons. " +
  "No expected decision or issue-class outcome is assumed by this inclusion rationale; whatever the frozen " +
  "evaluator (version 0.1.2) actually returns for this document is recorded verbatim in the admission test " +
  "below.";

// ---------------------------------------------------------------------------
// ENTRY_0023..0026 — reconstructed from admitted records (metadata only — no
// text content is required by CorpusDocumentInput). PRIOR_CORPUS_ENTRIES
// (imported) already covers DRA-DOC-0007..0022 unmodified since
// DRA-BMK-022/023; ENTRY_0023/0024/0025 are re-declared here exactly as in
// the DRA-ACQ-021/022 admission tests (that shared file has not yet been
// extended past 0022), and ENTRY_0026 is added here for the first time.
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

const ENTRY_0026: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0026",
  title:
    "An analysis of the effects of sharing research data, code, and preprints on citations (Colavizza G, " +
    "Cadwallader L, LaFlamme M, Dozot G, Lecorney S, Rappo D, Hrynaszkiewicz I. PLoS ONE 19(10): e0311493)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "PLOS (Public Library of Science)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal.pone.0311493&type=printable",
  sourceReference:
    "https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal.pone.0311493&type=printable",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000029 (programme ref: DRA-ACQ-022). Freeze record: DRA-FRZ-000020. " +
    "Result: SUPPORTED, 0 issues, 1127 statements, fully deterministic. Citation-linkage robustness " +
    "experiment found SILENT bracket-internal line-wrap loss and INDIRECTLY_DETECTABLE reference-entry " +
    "statement shredding at Stage 2 — see DRA-ACQ-022 Phase 2.",
};

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [
  ...PRIOR_CORPUS_ENTRIES,
  ENTRY_0023,
  ENTRY_0024,
  ENTRY_0025,
  ENTRY_0026,
];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-023 Phase 2A/2B — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0027 (GovInfo/GPO Metric System hearing)",
  () => {
    it(
      "reconfirms governance independently, verifies determinism via two independent live acquisitions, " +
        "admits DRA-DOC-0027 (GovInfo/GPO PDF) through eligibility, freeze, 27-document corpus integration, " +
        "and DRA evaluator execution (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-023 PHASE 2A/2B — CORPUS ADMISSION LOG           ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const fetcher = createHttpFetcher({
          timeoutMs: 180_000,
          maxRedirects: 5,
          maxBytes: 60_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Step 0: Determinism check — two independent live fetches ────────

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000030",
          sourceUrl: CHRG_PDF_URL,
          requestedBy: "DRA-ACQ-023-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "U.S. Government Printing Office / U.S. Government Publishing Office",
          expectedTitle: "The Metric System",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) {
          console.error("First GovInfo fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        }
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000030",
          sourceUrl: CHRG_PDF_URL,
          requestedBy: "DRA-ACQ-023-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "U.S. Government Printing Office / U.S. Government Publishing Office",
          expectedTitle: "The Metric System",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) {
          console.error("Second GovInfo fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
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
        expect(fetchA.source.rawBytes.length).toBe(49_508_560);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SOURCE_DIGEST);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-023 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity + representation spot-check ───────
        //
        // Acquisition-integrity check only — no evaluator issue class or
        // decision is inferred. Confirms both that the document's own
        // substantive structure survived extraction, AND records the exact
        // raw OCR-derived text present at admission time.

        console.log("\n── Step 0b: Structural + Representation Spot-Check ──────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          title: /THE METRIC SYSTEM/i,
          congress: /Eighty-seventh Congress/i,
          billNumbers: /H\.R\. 269/,
          hechlerCorrectOccurrence: /HECHLER/,
          hemmerCorruptedOccurrence: /HEMMER/,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        console.log(
          "  All structural elements identified in DRA-ACQ-023 Phase 1 remain present in the admission-time " +
            "extracted text ✓, including both the correct 'HECHLER' reading (body transcript) and the " +
            "corrupted 'HEMMER' reading (front-matter roster) — see the companion ocr-representation-" +
            "robustness test file for the full pipeline-boundary trace.",
        );

        // ── Step 1: Setup — build 26-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 26-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  26-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(26);
        expect(registry.hasId("DRA-DOC-0027")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SOURCE_DIGEST)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-023",
          protocolStatus: "APPROVED",
          targetCorpusSize: 27,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000030) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000030",
          sourceUrl: CHRG_PDF_URL,
          requestedBy: "DRA-ACQ-023-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "U.S. Government Printing Office / U.S. Government Publishing Office",
          expectedTitle: "The Metric System",
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
            corpusDocumentId: "DRA-DOC-0027",
            freezeRecordId: "DRA-FRZ-000021",
            frozenBy: "DRA-ACQ-023-human-governance-operator",
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

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000021");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0027");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000030");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SOURCE_DIGEST);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (27 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(27);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(27);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0027");
        expect(runA.manifest.documentIds[26]).toBe("DRA-DOC-0027");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-26 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(26);
        expect(runA.manifest.documentIds.slice(0, 26)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 27 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(27);

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
        console.log("  Document:        DRA-DOC-0027 — \"The Metric System\" (1961 House hearing, GovInfo/GPO)");
        console.log("  Publisher:       U.S. Government Printing Office / U.S. Government Publishing Office");
        console.log("  Freeze record:   DRA-FRZ-000021");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     27 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log("  Licence:         U.S. Government work — public domain (17 U.S.C. §105)");
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0027 does NOT improve domain or jurisdiction diversity; " +
            "selected purely as a scan/OCR representation-fidelity robustness probe (see docblock).",
        );
      },
      300_000, // 5 minutes
    );
  },
);
