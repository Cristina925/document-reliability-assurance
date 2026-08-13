/**
 * DRA-ACQ-004 — Controlled Acquisition Preparation for DRA-DOC-0009
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-004                             ║
 * ║                                                                          ║
 * ║  Authorised candidate                                                    ║
 * ║    Proposed Corpus ID: DRA-DOC-0009                                      ║
 * ║    Publisher:          Competition and Markets Authority (CMA)           ║
 * ║    Publication:        AI Foundation Models: Initial Report              ║
 * ║    Publication date:   18 September 2023                                 ║
 * ║                                                                          ║
 * ║  Document under evaluation (SUMMARY — short report):                    ║
 * ║    Internal title: AI Foundation Models: Short Version                  ║
 * ║    Landing page title: AI Foundation Models: Short version (PDF, 964KB) ║
 * ║    Acquisition ID: DRA-ACQ-000008                                        ║
 * ║    Landing page URL:                                                     ║
 * ║      https://www.gov.uk/government/publications/                         ║
 * ║      ai-foundation-models-initial-report                                 ║
 * ║    Asset URL (resolved from landing page 2026-08-04):                   ║
 * ║      https://assets.publishing.service.gov.uk/media/                    ║
 * ║      65081d2c4cd3c3000d68cb6d/Short_version_.pdf                        ║
 * ║                                                                          ║
 * ║  Evidence source (full report):                                          ║
 * ║    Internal title: AI Foundation Models: Initial Report                 ║
 * ║    Landing page title: AI Foundation Models: Full report (PDF, 2438KB)  ║
 * ║    Acquisition ID: DRA-ACQ-000009                                        ║
 * ║    Asset URL (resolved from landing page 2026-08-04):                   ║
 * ║      https://assets.publishing.service.gov.uk/media/                    ║
 * ║      65081d3aa41cc300145612c0/Full_report_.pdf                          ║
 * ║                                                                          ║
 * ║  NOTE ON LANDING PAGE URL RESOLUTION:                                   ║
 * ║  Asset URLs were resolved directly from the GOV.UK publication landing  ║
 * ║  page content API on 2026-08-04. The landing page also contains a       ║
 * ║  one-page "Summary" PDF (479,730 bytes, 613 words) at:                  ║
 * ║    https://assets.publishing.service.gov.uk/media/                      ║
 * ║    65081d1b4cd3c3001468cb6e/Summary_.pdf                                ║
 * ║  The Summary PDF is a brief 3-page overview that is insufficient for    ║
 * ║  DRA evaluation (613 words). The Short Version (37 pages, 12,628 words) ║
 * ║  is the substantive short report and is selected as the document under  ║
 * ║  evaluation.                                                             ║
 * ║                                                                          ║
 * ║  NOTE ON PRIOR CANDIDATE ASSET IDs (DRA-ACQ-003-REPL):                 ║
 * ║  The DRA-ACQ-003 replacement discovery identified a different set of    ║
 * ║  asset URLs from the CMA case page (/cma-cases/ai-foundation-models-    ║
 * ║  initial-review). This test uses the asset URLs resolved from the       ║
 * ║  official GOV.UK publication landing page (/government/publications/    ║
 * ║  ai-foundation-models-initial-report) as required by DRA-ACQ-004.       ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000003)                             ║
 * ║    - corpus-manifest mutation                                            ║
 * ║    - evaluator execution                                                 ║
 * ║    - proof-receipt generation                                            ║
 * ║    - persisted decision creation                                         ║
 * ║                                                                          ║
 * ║  Governance decisions are MACHINE-PREPARED, NOT VERIFIED.                ║
 * ║  Status is REVIEW_REQUIRED. A human reviewer must examine the evidence   ║
 * ║  and upgrade both assessments to VERIFIED before the document may be     ║
 * ║  frozen. The machine must not independently assign VERIFIED.             ║
 * ║                                                                          ║
 * ║  LICENCE FINDING — FULL REPORT:                                          ║
 * ║  The full report PDF contains the following on its second page:          ║
 * ║  "© Crown copyright 2022                                                 ║
 * ║  You may reuse this information (not including logos) free of charge    ║
 * ║  in any format or medium, under the terms of the Open Government        ║
 * ║  Licence. To view this licence, visit                                   ║
 * ║  www.nationalarchives.gov.uk/doc/open-government-licence/"              ║
 * ║  This is consistent with OGL v3 (current version at that URL).          ║
 * ║                                                                          ║
 * ║  LICENCE FINDING — SHORT VERSION:                                        ║
 * ║  No explicit OGL notice was found in the pdftotext extraction of the    ║
 * ║  Short Version PDF. The Short Version is published on the same GOV.UK   ║
 * ║  landing page as the Full Report, which carries the GOV.UK standard     ║
 * ║  footer: "All content is available under the Open Government Licence    ║
 * ║  v3.0, except where otherwise stated." Human review must confirm        ║
 * ║  whether a copyright notice appears on the PDF cover page and that no   ║
 * ║  "except where otherwise stated" carve-out applies to this document.    ║
 * ║                                                                          ║
 * ║  Expected eligibility result:                                            ║
 * ║    Checks 1-3, 6-13: PASS (11 checks)                                   ║
 * ║    Check 4 OFFICIAL_SOURCE_VERIFIED: FAIL — awaiting human attestation  ║
 * ║    Check 5 LICENCE_VERIFIED: FAIL — awaiting human attestation          ║
 * ║    Total blocking reasons: exactly 2                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Reference digests (computed 2026-08-04 during this preparation run):
 *   Short Version PDF source digest:  e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f
 *   Short Version PDF text digest:    dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed
 *   Short Version normalised chars:   89,713  word count: 12,628
 *   Full Report PDF source digest:    8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af
 *   Full Report PDF text digest:      e81c6ffe5f4d1f9ec3e958aa215f49bcf4ab32766305fd73b8c6755765757d84
 *   Full Report normalised chars:     370,671  word count: 49,444
 *
 * PDF extraction: pdftotext (Poppler) — already installed as Nix system
 * package, used by DRA-ACQ-002 and DRA-ACQ-003. No new npm packages added.
 *
 * Landing page: https://www.gov.uk/government/publications/ai-foundation-models-initial-report
 * CMA case page: https://www.gov.uk/cma-cases/ai-foundation-models-initial-review
 *
 * This test makes live HTTPS requests to assets.publishing.service.gov.uk
 * and acas.org.uk. Allow 5 minutes.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import { computeSourceDigest } from "../integrity.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionRequest } from "../request.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// Fixed preparation timestamp
// ---------------------------------------------------------------------------

const PREP_TIMESTAMP = "2026-08-04T00:00:00.000Z";

// ---------------------------------------------------------------------------
// Landing page and asset URLs (resolved from GOV.UK content API 2026-08-04)
//
// Canonical publication landing page:
//   https://www.gov.uk/government/publications/ai-foundation-models-initial-report
//
// Content API response (2026-08-04) listed three documents:
//   1. "AI Foundation Models: Summary (PDF, 452KB)"
//      → https://assets.publishing.service.gov.uk/media/65081d1b4cd3c3001468cb6e/Summary_.pdf
//      (479,730 bytes, internal title: "AI Foundation Models: Summary", 613 words — not selected)
//   2. "AI Foundation Models: Short version (PDF, 964KB)"
//      → https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf
//      (999,699 bytes, internal title: "AI Foundation Models: Short Version", 12,628 words — SELECTED)
//   3. "AI Foundation Models: Full report (PDF, 2438KB)"
//      → https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf
//      (2,514,017 bytes, internal title: "AI Foundation Models: Initial Report", 49,446 words — SELECTED)
//
// These asset URLs differ from the PDFA versions on the CMA case page.
// Both sets of PDFs were published on 18 September 2023 (same publication date).
// ---------------------------------------------------------------------------

const LANDING_PAGE_URL =
  "https://www.gov.uk/government/publications/ai-foundation-models-initial-report";

const SHORT_VERSION_URL =
  "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";

const FULL_REPORT_URL =
  "https://assets.publishing.service.gov.uk/media/65081d3aa41cc300145612c0/Full_report_.pdf";

// ---------------------------------------------------------------------------
// Reference digests from this preparation run (2026-08-04)
//
// Source digests: SHA-256 of raw PDF bytes.
// Text digests:   SHA-256 of pdftotext output after CRLF normalisation.
//
// A mismatch stops the report; the test logs the change classification.
// The test does not hard-fail on source digest mismatch to allow for
// minor server-side re-renderings, but it does require human review.
// ---------------------------------------------------------------------------

const REF_SHORT_SOURCE_DIGEST =
  "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f";
const REF_SHORT_TEXT_DIGEST =
  "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed";
const REF_SHORT_BYTE_LENGTH = 999699;
const REF_SHORT_TEXT_LENGTH = 89713;

const REF_FULL_SOURCE_DIGEST =
  "8346bc7836ce27f76feb9424da43870b82a62f7f03971725e138e20edf8ef7af";
const REF_FULL_TEXT_DIGEST =
  "e81c6ffe5f4d1f9ec3e958aa215f49bcf4ab32766305fd73b8c6755765757d84";
const REF_FULL_BYTE_LENGTH = 2514017;
const REF_FULL_TEXT_LENGTH = 370671;

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// Reuses the same wrapper from DRA-ACQ-002 and DRA-ACQ-003.
// No new npm packages.
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-004-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Digest mismatch classifier
// ---------------------------------------------------------------------------

function classifyDigestChange(
  ref: string,
  current: string,
  refBytes: number,
  currentBytes: number,
  label: string,
): string {
  if (ref === current) return "UNCHANGED";
  if (refBytes !== currentBytes) {
    return (
      `SOURCE_CHANGE_DETECTED — ${label}: byte count changed ` +
      `from ${refBytes} to ${currentBytes}. Stop before admission.`
    );
  }
  return (
    `EXTRACTION_OR_ENCODING_NONDETERMINISM — ${label}: ` +
    `byte counts match (${currentBytes}) but digest differs. ` +
    `Stop before admission.`
  );
}

// ---------------------------------------------------------------------------
// Machine-prepared governance objects — REVIEW_REQUIRED
//
// OFFICIAL SOURCE EVIDENCE:
//   - Both PDFs resolved from the official GOV.UK publication landing page:
//     https://www.gov.uk/government/publications/ai-foundation-models-initial-report
//     (Content API first_published_at: 2023-09-18, updated_at: 2026-06-30)
//   - Assets are served from assets.publishing.service.gov.uk (GOV.UK CDN)
//   - The CMA is a non-ministerial government department of the UK
//   - The GOV.UK publication page lists publisher as Competition and Markets Authority
//   - Both PDFs carry internal heading "18 September 2023"
//   - Full Report internal title: "AI Foundation Models: Initial Report"
//   - Short Version internal title: "AI Foundation Models: Short Version"
//
// LICENCE EVIDENCE — FULL REPORT:
//   - Explicit notice on full report p.2 (second page after cover):
//     "© Crown copyright 2022"
//     "You may reuse this information (not including logos) free of charge
//      in any format or medium, under the terms of the Open Government Licence."
//     "To view this licence, visit www.nationalarchives.gov.uk/doc/open-government-licence/"
//   - OGL URL: www.nationalarchives.gov.uk/doc/open-government-licence/ (current = v3)
//   - NOTE: copyright year states 2022; publication date is 2023-09-18; may be
//     typographic error in the PDF. OGL coverage is not affected by year notation.
//
// LICENCE EVIDENCE — SHORT VERSION:
//   - No explicit OGL notice found in pdftotext extraction of Short_version_.pdf
//   - Published on the same GOV.UK landing page as the Full Report
//   - GOV.UK standard terms state: "All content is available under the Open
//     Government Licence v3.0, except where otherwise stated"
//     (Source: www.gov.uk/help/terms-conditions; also confirmed in GOV.UK page footer)
//   - The CMA is a non-ministerial government department; its publications
//     default to Crown copyright + OGL v3 unless explicitly exempted
//   - REQUIRES HUMAN REVIEW: confirm no "except where otherwise stated" carve-out
//     applies to the Short Version PDF; confirm copyright notice on cover page
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-004-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    `Canonical landing page: ${LANDING_PAGE_URL}`,
    "Landing page GOV.UK Content API confirmed: title 'AI Foundation Models: Initial report', first_published_at: 2023-09-18, updated_at: 2026-06-30",
    "Publisher listed on landing page: Competition and Markets Authority",
    `Short Version asset URL resolved from landing page: ${SHORT_VERSION_URL}`,
    "Short Version HTTP status: 200 OK; content-type: application/pdf",
    "Short Version last-modified: Mon, 18 Sep 2023 09:49:32 GMT",
    `Short Version content-length: ${REF_SHORT_BYTE_LENGTH} bytes`,
    "Short Version internal heading: 'AI Foundation Models: Short Version', '18 September 2023'",
    `Full Report asset URL resolved from landing page: ${FULL_REPORT_URL}`,
    "Full Report HTTP status: 200 OK; content-type: application/pdf",
    "Full Report last-modified: Mon, 18 Sep 2023 09:49:46 GMT",
    `Full Report content-length: ${REF_FULL_BYTE_LENGTH} bytes`,
    "Full Report internal heading: 'AI Foundation Models: Initial Report', '18 September 2023'",
    "Full Report internal title on p.1 explicitly: 'AI Foundation Models: Initial Report'",
    "Both PDFs served from assets.publishing.service.gov.uk (official GOV.UK CDN)",
    "Both PDFs published on same landing page; same CMA publication event",
    "CMA is a non-ministerial government department of the United Kingdom",
    "CMA case page: https://www.gov.uk/cma-cases/ai-foundation-models-initial-review",
    "REQUIRES HUMAN REVIEW: confirm both PDFs represent the authoritative official publications",
    "REQUIRES HUMAN REVIEW: confirm no subsequent revisions have replaced these asset files",
    "REQUIRES HUMAN REVIEW: confirm Short Version is the intended 'short report' for DRA-DOC-0009",
  ],
  notes:
    "DRA-ACQ-004 Machine-prepared official-source evidence. " +
    "URLs resolved directly from GOV.UK publication landing page content API on 2026-08-04. " +
    "Asset IDs differ from CMA case page (which hosted PDFA versions published later same day). " +
    "A human reviewer must examine this evidence and, if satisfied, upgrade to VERIFIED.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "Open Government Licence (OGL)",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-004-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    // Full Report explicit OGL notice
    "Full Report PDF p.2 states: '© Crown copyright 2022'",
    "Full Report PDF p.2 states: 'You may reuse this information (not including logos) free of charge in any format or medium, under the terms of the Open Government Licence.'",
    "Full Report PDF p.2 OGL URL: 'www.nationalarchives.gov.uk/doc/open-government-licence/'",
    "OGL URL (unversioned) currently redirects to OGL v3 at nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    "Full Report copyright notice year '2022' appears to be typographic; publication date is 2023-09-18; OGL coverage is not affected",
    // Short Version — GOV.UK standard terms
    "Short Version PDF: no explicit OGL notice found in pdftotext extraction",
    "Short Version PDF cover page copyright notice requires human visual inspection of PDF",
    "GOV.UK terms of use (www.gov.uk/help/terms-conditions): 'Most content on GOV.UK is subject to Crown copyright protection and is published under the Open Government Licence'",
    "GOV.UK landing page footer: 'All content is available under the Open Government Licence v3.0, except where otherwise stated' (confirmed from CMA case page fetch 2026-08-04)",
    "The CMA is a non-ministerial government department; its publications default to Crown copyright + OGL v3",
    "No 'except where otherwise stated' carve-out observed on the landing page or in the Short Version PDF text",
    // Combined assessment
    "Both PDFs are Crown copyright; OGL v3 permits commercial and non-commercial reuse with attribution",
    "OGL v3 does not permit reuse of logos; evaluation scope is text only — no logos are included",
    "OGL v3 does not require share-alike; benchmark publication with attribution satisfies licence terms",
    // Human review required
    "REQUIRES HUMAN REVIEW: confirm Short Version PDF cover page shows same Crown copyright / OGL notice",
    "REQUIRES HUMAN REVIEW: confirm no 'except where otherwise stated' exception applies to either PDF",
    "REQUIRES HUMAN REVIEW: confirm no third-party copyright material within evaluation scope requires separate clearance",
    "REQUIRES HUMAN REVIEW: confirm commercial use of benchmark results is covered by OGL v3",
  ],
  notes:
    "DRA-ACQ-004 Machine-prepared licence evidence. " +
    "The Full Report explicitly states Crown copyright and OGL. " +
    "The Short Version relies on the GOV.UK standard OGL v3 terms (same landing page, same publisher). " +
    "Machine pre-assessment: licenceBasis OPEN_LICENCE. " +
    "A human reviewer must verify both PDFs carry compatible licence terms and upgrade to VERIFIED.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
//
// Factual basis:
//   - Title: from Short Version PDF internal heading
//     ("AI Foundation Models: Short Version")
//   - Publication date: 18 September 2023 (from PDF internal heading)
//   - Publisher: Competition and Markets Authority (from GOV.UK landing page)
//   - Domain: GENERAL — competition and consumer protection policy for digital
//     markets; not a specific sector technical standard
//   - DocumentType: SUMMARY — the Short Version is a substantive condensed
//     version of the full Initial Report; the first SUMMARY in the corpus
//   - Difficulty: MEDIUM — regulatory/policy analysis language; accessible
//     to informed public; no specialist technical prerequisites
//   - Language: en-GB
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "AI Foundation Models: Short Version",
  publisher: "Competition and Markets Authority",
  publicationDate: "2023-09-18",
  domain: "GENERAL" as const,
  documentType: "SUMMARY" as const,
  difficulty: "MEDIUM" as const,
  language: "en-GB",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First SUMMARY-type corpus entry: zero SUMMARY documents in DRA-DOC-0001–0008. " +
  "Adds the Competition and Markets Authority as a new institution not represented in the corpus. " +
  "GENERAL domain: AI and digital markets competition policy; topically distinct from all existing entries " +
  "(existing GENERAL entries cover ISO policy (DRA-DOC-0006) and government technology procurement). " +
  "MEDIUM difficulty: regulatory/policy analysis language; naturally accessible to informed readers " +
  "without specialist AI or legal prerequisites. " +
  "HUMAN_AUTHORED source type: both Short Version and Initial Report are official CMA-authored documents. " +
  "Genuine summary-vs-source relationship: the Short Version (12,628 words, 37 pages) is a substantive " +
  "condensed narrative of the Initial Report (49,446 words); both published simultaneously on 18 Sep 2023. " +
  "The Short Version preserves the full chapter structure of the Initial Report in condensed form, " +
  "providing traceable claim-to-evidence mappings across all five analysis chapters. " +
  "Naturally exercises claim support (CLAIM_INCONSISTENCY), evidence adequacy (EVIDENCE_INADEQUATE), " +
  "and traceability (TRACEABILITY_BROKEN) analysis given the condensation relationship. " +
  "No self-evaluation risk: the CMA AI Foundation Models review examined AI market competition; " +
  "it is not an evaluation of document reliability assessment systems. " +
  "No predetermined issue class: the evaluator will assess claims without foreknowledge of expected outcomes.";

// ---------------------------------------------------------------------------
// Proposed evaluation boundary — Short Version (document under evaluation)
// ---------------------------------------------------------------------------

const PROPOSED_EVALUATION_BOUNDARY = `
SUBJECT: AI Foundation Models — competition and consumer protection analysis (Short Version)

DOCUMENT UNDER EVALUATION (DRA-ACQ-000008 — Short Version, SUMMARY type):
  Internal title:    AI Foundation Models: Short Version
  Publisher:         Competition and Markets Authority
  Publication date:  18 September 2023
  Byte length:       ${REF_SHORT_BYTE_LENGTH} bytes
  Source digest:     ${REF_SHORT_SOURCE_DIGEST}

  Substantive evaluation boundary (text included):
    Full normalised text of Short_version_.pdf, EXCLUDING ONLY:
    - Cover matter (title page: "AI Foundation Models: Short Version", date line)
    - Contents/navigation material: none (this document has no table of contents)
    - Copyright/licence boilerplate: none found in extracted text; to be excluded
      if identified by human reviewer in PDF cover page inspection
    - Repeated page-number artefacts at page breaks

  Content included in evaluation:
    Paragraphs 1.1–1.96 covering:
      • Introduction and review scope (1.1–1.8)
      • How FMs are developed and deployed today (1.9–1.19, incl. Figure 1 caption)
      • Key inputs required for building a FM (1.11–1.19)
      • Competition in the development of FMs (1.20–1.43, incl. Box 1)
      • Impact of FMs on competition in other markets (1.44–1.68, incl. Box 2, Box 3)
      • Consumer protection (1.69–1.91)
      • Next steps (1.92–1.96)

  Evaluation boundary justification:
    The Short Version is a self-contained publication, distinct from the Initial Report.
    It does not share pagination with the full report. The entire substantive text
    constitutes the evaluation scope. No sub-section extraction is needed.
    All substantive caveats, qualifications, and conclusions are retained.
    The evaluation boundary is the entire Short Version normalised text.

EVIDENCE SOURCE (DRA-ACQ-000009 — Full Report, not frozen):
  Internal title:    AI Foundation Models: Initial Report
  Byte length:       ${REF_FULL_BYTE_LENGTH} bytes
  Source digest:     ${REF_FULL_SOURCE_DIGEST}

  Evidence boundary:
    Complete substantive text of Full_report_.pdf, EXCLUDING ONLY:
    - Cover matter (title page, copyright notice)
    - Table of contents (navigation; not substantive)

  Evidence chapters:
    Chapter 1: Introduction (how review was conducted; structure)
    Chapter 2: Background (what are FMs, FM development, landscape)
    Chapter 3: Competition and barriers to entry in FM development
    Chapter 4: Impact of FMs on competition in other markets
    Chapter 5: Consumer Protection
    (Plus all annexes, footnotes, and referenced data within these chapters)

  Evidence boundary justification:
    The complete Initial Report is required for fair evidence coverage of all
    Short Version claims. No deliberate narrowing is applied. Using the complete
    full report is both operationally manageable and correct for this document pair.

NOTE: evaluationBoundary offset field not required in the governed pipeline input.
Stage 2 will extract claims from the entire Short Version text (no restriction).
`.trim();

// ---------------------------------------------------------------------------
// Section boundary map — Short Version headings → Full Report chapters
//
// No expected issue class or assurance decision is stored.
// Permitted hypothesis:
//   "The summary/full-report relationship may exercise claim support, evidence
//    adequacy, traceability and consistency analysis. No issue class or
//    assurance decision is predetermined."
// ---------------------------------------------------------------------------

const SECTION_BOUNDARY_MAP = `
SECTION BOUNDARY MAP — DRA-ACQ-004

Short Version paragraph range  | Short Version heading                          | Full Report chapter/section       | Relationship  | Charts/annexes required
-------------------------------|------------------------------------------------|-----------------------------------|---------------|------------------------
1.1–1.8   (pp. 1–2)           | (Introduction / context)                       | Ch 1: Introduction                | Direct        | None
1.9–1.10  (pp. 2–4)           | How FMs are developed and deployed today       | Ch 2: Background — What are FMs?  | Direct        | None
1.11–1.19 (pp. 4–7)           | Key inputs required for building a FM          | Ch 2: Background — How are FMs    | Direct        | Figure 1 (deployment
                               | Firm structure and integration                 |   developed, Deployment           |               |   overview caption)
1.20–1.43 (pp. 8–14)          | Competition in the development of FMs          | Ch 3: Competition and barriers    | Direct        | Box 1 (open-source
                               | (incl. Conclusion at 1.42)                     |   to entry in FM development      |               |   model example)
1.44–1.68 (pp. 14–24)         | (Impact of FMs on competition in other markets)| Ch 4: Impact of FMs on            | Direct        | Box 2 (online search
                               | Effective choice and the ability to switch     |   competition in other markets    |               |   case study)
                               | The impact of vertical integration             |                                   |               | Box 3 (productivity
                               | (incl. Conclusion at 1.68)                     |                                   |               |   software case study)
1.69–1.91 (pp. 24–36)         | Consumer protection                            | Ch 5: Consumer Protection         | Direct        | None
                               | (incl. Conclusion at 1.91)                     |                                   |               |
1.92–1.96 (pp. 36–37)         | Next steps                                     | Ch 1: Introduction (next steps);  | Cross-cutting | None
                               |                                                |   principles listed in Ch 3–5    |               |

UNRESOLVED MAPPING QUESTIONS:
  - The 7 guiding principles (mentioned at 1.5–1.7 in Short Version) are set out across
    chapters 3–5 of the Full Report; the cross-cutting nature may require evaluator to
    search multiple chapters for supporting evidence.
  - Figure 1 (deployment overview) in Short Version at paragraph 1.13 — caption content
    is included in evaluation scope; the figure itself is not evaluated.
  - Box 1 (open-source model example) at Short Version 1.38–1.40 maps to Ch 3,
    section "Open-source models" in the Full Report.
  - Box 2 (online search case study) and Box 3 (productivity software case study) in
    Short Version map to Ch 4, section "Firms are monetising FM services" / "How FMs
    could drive competition" in the Full Report.
  - Statistical claims (FM developer counts, parameter counts, funding figures) in Short
    Version map to Ch 2 (Background) and Ch 3 footnotes in Full Report — these will
    be evaluated for evidence adequacy.

HYPOTHESIS (permitted):
  "The summary/full-report relationship may exercise claim support, evidence adequacy,
   traceability and consistency analysis. No issue class or assurance decision is
   predetermined."
`.trim();

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001 to 0006: from BENCHMARK_CORPUS (generatedText fields)
// DRA-DOC-0007: normalised from APACHE_HTTPD_AUTH_HTML fixture
// DRA-DOC-0008: re-fetched from acas.org.uk (live network)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006 (from BENCHMARK_CORPUS)
  for (const entry of BENCHMARK_CORPUS) {
    const bytes = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007 — Apache HTTP Server guide (from pre-fetched HTML fixture)
  const apacheBytes = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008 — Acas guide (re-fetched from live network for text content)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-004-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const acasDigest = computeSourceDigest(acasFetch.source.rawBytes);
      const acasNorm = await normaliseContent(
        acasFetch.source.rawBytes,
        "application/pdf",
        acasDigest,
        extractPdfText,
      );
      if (acasNorm.ok) texts.push(acasNorm.document.text);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Operational preparation test
// ---------------------------------------------------------------------------

describe("DRA-ACQ-004 — Controlled Acquisition Preparation for DRA-DOC-0009 (CMA AI Foundation Models)", () => {
  it(
    "acquires CMA AI FM short version and full report PDFs, verifies eligibility up to freeze boundary",
    async () => {
      // ── Setup ─────────────────────────────────────────────────────────────

      const registry = new CorpusRegistry();
      const protocol = buildMinimalProtocol({
        protocolId: "DRA-PROTO-ACQ-004",
        protocolStatus: "APPROVED",
        targetCorpusSize: 20,
        permittedDocumentTypes: [
          "SUMMARY",
          "REWRITE",
          "REPORT",
          "EMAIL",
          "POLICY",
          "PROCEDURE",
          "ARTICLE",
          "OTHER",
        ],
      });

      const fetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 15_000_000,
        userAgent: "DRA-ENG-010/1.0",
      });

      console.log(
        "\n╔══════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║  DRA-ACQ-004 — ACQUISITION PREPARATION LOG                ║",
      );
      console.log(
        "╚══════════════════════════════════════════════════════════╝\n",
      );
      console.log("  Publisher     : Competition and Markets Authority");
      console.log("  Publication   : AI Foundation Models: Initial Report");
      console.log("  Date          : 18 September 2023");
      console.log("  Landing page  :", LANDING_PAGE_URL);
      console.log("  Short Version : DRA-ACQ-000008 (document under evaluation)");
      console.log("  Full Report   : DRA-ACQ-000009 (evidence source)");

      // ── Step 1: Create acquisition request (Short Version) ────────────────

      const shortRequestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000008",
        sourceUrl: SHORT_VERSION_URL,
        requestedBy: "DRA-ACQ-004-acquisition-operator",
        requestedAt: PREP_TIMESTAMP,
        expectedPublisher: "Competition and Markets Authority",
        expectedTitle: "AI Foundation Models: Short Version",
      });

      expect(shortRequestResult.ok).toBe(true);
      if (!shortRequestResult.ok) return;
      const shortRequest = shortRequestResult.request;

      console.log(
        "\n── Step 1: Acquisition Request (DRA-ACQ-000008 — Short Version) ─",
      );
      console.log("  acquisitionId :", shortRequest.acquisitionId);
      console.log("  sourceUrl     :", shortRequest.sourceUrl);
      console.log("  requestedBy   :", shortRequest.requestedBy);
      console.log("  requestedAt   :", shortRequest.requestedAt);

      // ── Step 2: Fetch Short Version PDF (first pass) ──────────────────────

      console.log(
        "\n── Step 2: Fetch Short Version PDF — Pass 1 (live network) ─",
      );

      const shortFetchResult = await fetcher(shortRequest, {});

      if (!shortFetchResult.ok) {
        console.error(
          "Short Version PDF fetch FAILED:",
          shortFetchResult.code,
          shortFetchResult.message,
        );
      }
      expect(shortFetchResult.ok).toBe(true);
      if (!shortFetchResult.ok) return;

      const shortSource = shortFetchResult.source;

      console.log("  finalUrl        :", shortSource.finalUrl);
      console.log("  mediaType       :", shortSource.mediaType);
      console.log("  httpStatus      :", shortSource.httpStatus);
      console.log("  rawByteLength   :", shortSource.rawBytes.length);
      console.log("  retrievedAt     :", shortSource.retrievedAt);

      if (shortSource.httpResponseHeaders) {
        const h = shortSource.httpResponseHeaders;
        if (h.contentType) console.log("  content-type    :", h.contentType);
        if (h.lastModified) console.log("  last-modified   :", h.lastModified);
        if (h.contentLength) console.log("  content-length  :", h.contentLength);
        if (h.etag) console.log("  etag            :", h.etag);
      }

      expect(shortSource.httpStatus).toBe(200);
      expect(shortSource.mediaType).toBe("application/pdf");
      expect(shortSource.rawBytes.length).toBeGreaterThan(900_000);

      // ── Step 3: Short Version source digest (pass 1) ──────────────────────

      const shortSourceDigest = computeSourceDigest(shortSource.rawBytes);

      console.log(
        "\n── Step 3: Short Version Source Digest Verification ────────",
      );
      console.log("  reference digest :", REF_SHORT_SOURCE_DIGEST);
      console.log("  current digest   :", shortSourceDigest);
      console.log("  reference bytes  :", REF_SHORT_BYTE_LENGTH);
      console.log("  current bytes    :", shortSource.rawBytes.length);

      if (shortSourceDigest !== REF_SHORT_SOURCE_DIGEST) {
        const classification = classifyDigestChange(
          REF_SHORT_SOURCE_DIGEST,
          shortSourceDigest,
          REF_SHORT_BYTE_LENGTH,
          shortSource.rawBytes.length,
          "CMA Short Version PDF source digest",
        );
        console.error("\n  !! SHORT VERSION SOURCE DIGEST MISMATCH !!");
        console.error("  Classification:", classification);
        console.error(
          "  Action: review change and update reference digests before freeze.",
        );
      } else {
        console.log("  ✓ Source digest matches reference");
      }
      expect(shortSourceDigest).toMatch(/^[0-9a-f]{64}$/);

      // ── Step 4: Normalise Short Version via pdftotext ─────────────────────

      console.log(
        "\n── Step 4: Normalise Short Version (pdftotext, no new npm packages) ─",
      );

      const shortNormResult = await normaliseContent(
        shortSource.rawBytes,
        "application/pdf",
        shortSourceDigest,
        extractPdfText,
      );

      if (!shortNormResult.ok) {
        console.error(
          "Short Version normalisation FAILED:",
          shortNormResult.code,
          shortNormResult.message,
        );
      }
      expect(shortNormResult.ok).toBe(true);
      if (!shortNormResult.ok) return;

      const shortNormalised = shortNormResult.document;
      const shortWordCount = shortNormalised.text
        .split(/\s+/)
        .filter(Boolean).length;

      console.log("  normalisationVersion :", shortNormalised.normalisationVersion);
      console.log("  encoding             :", shortNormalised.encoding);
      console.log("  textLength (chars)   :", shortNormalised.text.length);
      console.log("  wordCount            :", shortWordCount);
      console.log("  textDigest           :", shortNormalised.textDigest);
      console.log(
        "  warnings             :",
        shortNormalised.warnings.length === 0
          ? "none"
          : shortNormalised.warnings.join("; "),
      );

      if (shortNormalised.textDigest !== REF_SHORT_TEXT_DIGEST) {
        const classification = classifyDigestChange(
          REF_SHORT_TEXT_DIGEST,
          shortNormalised.textDigest,
          REF_SHORT_TEXT_LENGTH,
          shortNormalised.text.length,
          "CMA Short Version normalised-text digest",
        );
        console.error("\n  !! SHORT VERSION TEXT DIGEST MISMATCH !!");
        console.error("  Classification:", classification);
      } else {
        console.log("  ✓ Text digest matches reference");
      }

      expect(shortNormalised.normalisationVersion).toBe("DRA-NORM-v1");
      expect(shortNormalised.text.trim().length).toBeGreaterThan(5_000);
      expect(shortNormalised.textDigest).toMatch(/^[0-9a-f]{64}$/);

      // ── Step 5: Create acquisition request (Full Report) ──────────────────

      console.log(
        "\n── Step 5: Acquisition Request (DRA-ACQ-000009 — Full Report) ─",
      );

      const fullRequestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000009",
        sourceUrl: FULL_REPORT_URL,
        requestedBy: "DRA-ACQ-004-acquisition-operator",
        requestedAt: PREP_TIMESTAMP,
        expectedPublisher: "Competition and Markets Authority",
        expectedTitle: "AI Foundation Models: Initial Report",
      });

      expect(fullRequestResult.ok).toBe(true);
      if (!fullRequestResult.ok) return;

      // ── Step 6: Fetch Full Report PDF (first pass) ────────────────────────

      console.log(
        "\n── Step 6: Fetch Full Report PDF — Pass 1 (live network) ──",
      );

      const fullFetchResult = await fetcher(fullRequestResult.request, {});

      if (!fullFetchResult.ok) {
        console.error(
          "Full Report fetch FAILED:",
          fullFetchResult.code,
          fullFetchResult.message,
        );
      }
      expect(fullFetchResult.ok).toBe(true);
      if (!fullFetchResult.ok) return;

      const fullSource = fullFetchResult.source;

      console.log("  finalUrl        :", fullSource.finalUrl);
      console.log("  mediaType       :", fullSource.mediaType);
      console.log("  httpStatus      :", fullSource.httpStatus);
      console.log("  rawByteLength   :", fullSource.rawBytes.length);
      console.log("  retrievedAt     :", fullSource.retrievedAt);

      if (fullSource.httpResponseHeaders) {
        const h = fullSource.httpResponseHeaders;
        if (h.contentType) console.log("  content-type    :", h.contentType);
        if (h.lastModified) console.log("  last-modified   :", h.lastModified);
        if (h.contentLength) console.log("  content-length  :", h.contentLength);
        if (h.etag) console.log("  etag            :", h.etag);
      }

      expect(fullSource.httpStatus).toBe(200);
      expect(fullSource.mediaType).toBe("application/pdf");
      expect(fullSource.rawBytes.length).toBeGreaterThan(2_000_000);

      // ── Step 7: Full Report source digest and normalisation ───────────────

      const fullSourceDigest = computeSourceDigest(fullSource.rawBytes);

      console.log(
        "\n── Step 7: Full Report Digest Verification ─────────────────",
      );
      console.log("  reference digest :", REF_FULL_SOURCE_DIGEST);
      console.log("  current digest   :", fullSourceDigest);
      console.log("  reference bytes  :", REF_FULL_BYTE_LENGTH);
      console.log("  current bytes    :", fullSource.rawBytes.length);

      if (fullSourceDigest !== REF_FULL_SOURCE_DIGEST) {
        const classification = classifyDigestChange(
          REF_FULL_SOURCE_DIGEST,
          fullSourceDigest,
          REF_FULL_BYTE_LENGTH,
          fullSource.rawBytes.length,
          "CMA Full Report PDF source digest",
        );
        console.error("\n  !! FULL REPORT SOURCE DIGEST MISMATCH !!");
        console.error("  Classification:", classification);
      } else {
        console.log("  ✓ Source digest matches reference");
      }
      expect(fullSourceDigest).toMatch(/^[0-9a-f]{64}$/);

      console.log(
        "\n── Step 7b: Normalise Full Report (pdftotext) ──────────────",
      );

      const fullNormResult = await normaliseContent(
        fullSource.rawBytes,
        "application/pdf",
        fullSourceDigest,
        extractPdfText,
      );

      expect(fullNormResult.ok).toBe(true);
      if (!fullNormResult.ok) return;

      const fullNormalised = fullNormResult.document;
      const fullWordCount = fullNormalised.text.split(/\s+/).filter(Boolean).length;

      console.log("  normalisationVersion :", fullNormalised.normalisationVersion);
      console.log("  textLength (chars)   :", fullNormalised.text.length);
      console.log("  wordCount            :", fullWordCount);
      console.log("  textDigest           :", fullNormalised.textDigest);
      console.log(
        "  warnings             :",
        fullNormalised.warnings.length === 0
          ? "none"
          : fullNormalised.warnings.join("; "),
      );

      if (fullNormalised.textDigest !== REF_FULL_TEXT_DIGEST) {
        const classification = classifyDigestChange(
          REF_FULL_TEXT_DIGEST,
          fullNormalised.textDigest,
          REF_FULL_TEXT_LENGTH,
          fullNormalised.text.length,
          "CMA Full Report normalised-text digest",
        );
        console.error("\n  !! FULL REPORT TEXT DIGEST MISMATCH !!");
        console.error("  Classification:", classification);
      } else {
        console.log("  ✓ Text digest matches reference");
      }

      // ── Step 8: Reproducibility check (second pass) ───────────────────────

      console.log(
        "\n── Step 8: Reproducibility Check — Second Acquisition Pass ─",
      );
      console.log("  Re-fetching both PDFs to confirm digest stability...");

      const shortFetch2Result = await fetcher(shortRequest, {});
      expect(shortFetch2Result.ok).toBe(true);

      if (shortFetch2Result.ok) {
        const shortDigest2 = computeSourceDigest(shortFetch2Result.source.rawBytes);
        const shortNorm2 = await normaliseContent(
          shortFetch2Result.source.rawBytes,
          "application/pdf",
          shortDigest2,
          extractPdfText,
        );

        console.log("  Short Version pass 2:");
        console.log(
          "    source digest match  :",
          shortDigest2 === shortSourceDigest ? "✓ IDENTICAL" : `!! DIFFERS: ${shortDigest2}`,
        );
        if (shortNorm2.ok) {
          console.log(
            "    text digest match    :",
            shortNorm2.document.textDigest === shortNormalised.textDigest
              ? "✓ IDENTICAL"
              : `!! DIFFERS: ${shortNorm2.document.textDigest}`,
          );
        }

        expect(shortDigest2).toBe(shortSourceDigest);
        if (shortNorm2.ok) {
          expect(shortNorm2.document.textDigest).toBe(shortNormalised.textDigest);
        }
      }

      const fullFetch2Result = await fetcher(fullRequestResult.request, {});
      expect(fullFetch2Result.ok).toBe(true);

      if (fullFetch2Result.ok) {
        const fullDigest2 = computeSourceDigest(fullFetch2Result.source.rawBytes);
        const fullNorm2 = await normaliseContent(
          fullFetch2Result.source.rawBytes,
          "application/pdf",
          fullDigest2,
          extractPdfText,
        );

        console.log("  Full Report pass 2:");
        console.log(
          "    source digest match  :",
          fullDigest2 === fullSourceDigest ? "✓ IDENTICAL" : `!! DIFFERS: ${fullDigest2}`,
        );
        if (fullNorm2.ok) {
          console.log(
            "    text digest match    :",
            fullNorm2.document.textDigest === fullNormalised.textDigest
              ? "✓ IDENTICAL"
              : `!! DIFFERS: ${fullNorm2.document.textDigest}`,
          );
        }

        expect(fullDigest2).toBe(fullSourceDigest);
        if (fullNorm2.ok) {
          expect(fullNorm2.document.textDigest).toBe(fullNormalised.textDigest);
        }
      }

      console.log("  ✓ Reproducibility check complete");

      // ── Step 9: Build existing corpus texts for near-duplicate check ───────

      console.log(
        "\n── Step 9: Build Existing Corpus Texts for Near-Duplicate Check ─",
      );
      console.log("  Fetching DRA-DOC-0001–0006 from BENCHMARK_CORPUS");
      console.log("  Fetching DRA-DOC-0007 from apache-httpd-auth-fixture");
      console.log("  Fetching DRA-DOC-0008 (Acas guide PDF) from acas.org.uk (live)");

      const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

      console.log("  Total existing corpus texts:", existingCorpusTexts.length);
      if (existingCorpusTexts.length !== 8) {
        console.warn(
          "  !! Expected 8 existing corpus texts (DRA-DOC-0001 through 0008); " +
          "got " + existingCorpusTexts.length + ". Near-duplicate check may be partial.",
        );
      }

      // ── Step 10: Freeze eligibility (13 checks) ───────────────────────────

      console.log(
        "\n── Step 10: Freeze Eligibility (13 checks) ─────────────────",
      );

      const eligibility = checkFreezeEligibility(
        shortSource,
        shortNormalised,
        PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
        PREPARED_LICENCE_ASSESSMENT,
        PROPOSED_METADATA,
        "DRA-DOC-0009",
        INCLUSION_RATIONALE,
        registry,
        protocol,
        existingCorpusTexts,
      );

      console.log("");
      for (const check of eligibility.checks) {
        const icon = check.passed ? "✓" : "✗";
        const status = check.passed ? "PASS" : "FAIL";
        console.log(`  ${icon} [${status}] ${check.checkId}`);
        if (check.detail) console.log(`        detail: ${check.detail}`);
      }

      if (!eligibility.eligible) {
        console.log("\n  Blocking reasons:", eligibility.blockingReasons.join(", "));
        console.log("  (Both governance failures EXPECTED — machine cannot assign VERIFIED)");
      }

      // Assert: exactly two checks fail — the governance attestation checks
      expect(eligibility.eligible).toBe(false);
      if (!eligibility.eligible) {
        expect(eligibility.blockingReasons).toContain("OFFICIAL_SOURCE_NOT_VERIFIED");
        expect(eligibility.blockingReasons).toContain("LICENCE_NOT_VERIFIED");
        expect(eligibility.blockingReasons).toHaveLength(2);
      }

      // Assert: all non-governance checks pass
      for (const check of eligibility.checks) {
        if (
          check.checkId === "OFFICIAL_SOURCE_VERIFIED" ||
          check.checkId === "LICENCE_VERIFIED"
        ) {
          expect(check.passed).toBe(false);
        } else {
          if (!check.passed) {
            console.error(
              `UNEXPECTED FAILURE: ${check.checkId} — ${check.detail ?? ""}`,
            );
          }
          expect(check.passed).toBe(true);
        }
      }

      // ── Step 11: Proposed evaluation boundary ─────────────────────────────

      console.log(
        "\n── Step 11: Proposed Evaluation Boundary ───────────────────",
      );
      for (const line of PROPOSED_EVALUATION_BOUNDARY.split("\n").slice(0, 30)) {
        console.log("  " + line);
      }

      // ── Step 12: Section boundary map ─────────────────────────────────────

      console.log(
        "\n── Step 12: Section Boundary Map (short → full report) ─────",
      );
      for (const line of SECTION_BOUNDARY_MAP.split("\n").slice(0, 20)) {
        console.log("  " + line);
      }

      // ── Step 13: Acquisition summary ──────────────────────────────────────

      console.log(
        "\n── Acquisition Summary ─────────────────────────────────────",
      );
      console.log("  ─── Document under evaluation (DRA-ACQ-000008 — Short Version) ───");
      console.log("  requestedUrl       :", shortSource.requestedUrl);
      console.log("  finalUrl           :", shortSource.finalUrl);
      console.log("  mediaType          :", shortSource.mediaType);
      console.log("  httpStatus         :", shortSource.httpStatus);
      console.log("  byteLength         :", shortSource.rawBytes.length);
      console.log("  retrievedAt        :", shortSource.retrievedAt);
      console.log("  sourceDigest       :", shortSourceDigest);
      console.log("  textDigest         :", shortNormalised.textDigest);
      console.log("  textLength (chars) :", shortNormalised.text.length);
      console.log("  wordCount          :", shortWordCount);
      console.log("  ─── Evidence source (DRA-ACQ-000009 — Full Report, not frozen) ───");
      console.log("  requestedUrl       :", fullSource.requestedUrl);
      console.log("  finalUrl           :", fullSource.finalUrl);
      console.log("  mediaType          :", fullSource.mediaType);
      console.log("  httpStatus         :", fullSource.httpStatus);
      console.log("  byteLength         :", fullSource.rawBytes.length);
      console.log("  retrievedAt        :", fullSource.retrievedAt);
      console.log("  sourceDigest       :", fullSourceDigest);
      console.log("  textDigest         :", fullNormalised.textDigest);
      console.log("  textLength (chars) :", fullNormalised.text.length);
      console.log("  wordCount          :", fullWordCount);
      console.log("  ─── Eligibility ───");
      console.log("  total checks       :", eligibility.checks.length);
      console.log(
        "  passed             :",
        eligibility.checks.filter((c) => c.passed).length,
      );
      console.log(
        "  failed             :",
        eligibility.checks.filter((c) => !c.passed).length,
      );
      console.log(
        "  blocking reasons   :",
        eligibility.eligible ? "none" : eligibility.blockingReasons.join(", "),
      );

      console.log(
        "\n╔══════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║  DRA-ACQ-004 PREPARATION COMPLETE — REVIEW_REQUIRED       ║",
      );
      console.log(
        "║  Human reviewer must verify official source and licence.   ║",
      );
      console.log(
        "║  Licence pre-assessment: OPEN_LICENCE (OGL v3, Crown       ║",
      );
      console.log(
        "║  copyright). Full Report explicit; Short Version via GOV.UK║",
      );
      console.log(
        "║  standard terms. Human confirmation required for both.     ║",
      );
      console.log(
        "╚══════════════════════════════════════════════════════════╝\n",
      );
    },
    300_000,
  );
});
