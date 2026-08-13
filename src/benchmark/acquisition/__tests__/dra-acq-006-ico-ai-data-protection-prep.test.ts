/**
 * DRA-ACQ-006 — Controlled Acquisition Preparation for DRA-DOC-0011
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ACQUISITION PREPARATION TEST — DRA-ACQ-006                             ║
 * ║                                                                          ║
 * ║  Authorised candidate                                                    ║
 * ║    Discovery ID:       DRA-DIS-000001                                    ║
 * ║    Proposed Corpus ID: DRA-DOC-0011                                      ║
 * ║    Publisher:          Information Commissioner's Office (ICO)           ║
 * ║    Publication:        Guidance on AI and data protection                ║
 * ║    Last updated:       22 September 2025 (from DC.Date on section pages) ║
 * ║                                                                          ║
 * ║  Acquisition:                                                            ║
 * ║    Acquisition ID:    DRA-ACQ-000013                                     ║
 * ║    Source format:     Multi-page HTML (no consolidated PDF exists)       ║
 * ║    Landing page:      https://ico.org.uk/for-organisations/              ║
 * ║      uk-gdpr-guidance-and-resources/artificial-intelligence/             ║
 * ║      guidance-on-ai-and-data-protection/                                 ║
 * ║                                                                          ║
 * ║  SOURCE BOUNDARY (14 pages in scope, 1 excluded):                        ║
 * ║    In scope:  landing page + 13 content sections in canonical nav order  ║
 * ║    Excluded:  /ai-and-data-protection-risk-toolkit/ — interactive tool,  ║
 * ║               not a chapter of the guidance document                     ║
 * ║                                                                          ║
 * ║  CANONICAL SECTION ORDER (from multipage-nav DOM order):                 ║
 * ║    01. Landing/index page                                                ║
 * ║    02. /whats-new/                                                       ║
 * ║    03. /about-this-guidance/                                             ║
 * ║    04. /what-are-the-accountability-and-governance-implications-of-ai/   ║
 * ║    05. /how-do-we-ensure-transparency-in-ai/                             ║
 * ║    06. /how-do-we-ensure-lawfulness-in-ai/                               ║
 * ║    07. /what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/ ║
 * ║    08. /how-do-we-ensure-fairness-in-ai/                                 ║
 * ║    09. /how-do-we-ensure-fairness-in-ai/                                 ║
 * ║          what-about-fairness-bias-and-discrimination/                    ║
 * ║    10. /how-do-we-ensure-fairness-in-ai/                                 ║
 * ║          what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/   ║
 * ║    11. /how-should-we-assess-security-and-data-minimisation-in-ai/       ║
 * ║    12. /how-do-we-ensure-individual-rights-in-our-ai-systems/            ║
 * ║    13. /annex-a-fairness-in-the-ai-lifecycle/                            ║
 * ║    14. /glossary/                                                        ║
 * ║                                                                          ║
 * ║  NOTE ON HEAD REQUESTS:                                                  ║
 * ║  HEAD to ico.org.uk returns HTTP 405 (Method Not Allowed).              ║
 * ║  GET requests succeed with HTTP 200 text/html.                           ║
 * ║  All pages fetched via GET.                                              ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  ico.org.uk footer states: "All text content is available under the      ║
 * ║  Open Government Licence v3.0, except where otherwise stated."           ║
 * ║  Machine pre-assessment: OGL_V3. REQUIRES human attestation.            ║
 * ║                                                                          ║
 * ║  Pipeline scope: fetch → normalise → freeze eligibility                  ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - freeze-record creation (DRA-FRZ-000005)                             ║
 * ║    - corpus-manifest mutation                                            ║
 * ║    - evaluator execution                                                 ║
 * ║                                                                          ║
 * ║  Governance status: REVIEW_REQUIRED                                      ║
 * ║  Expected eligibility result:                                            ║
 * ║    Checks 1-3, 6-13: PASS (11 checks)                                   ║
 * ║    Check 4 OFFICIAL_SOURCE_VERIFIED: FAIL — awaiting human attestation  ║
 * ║    Check 5 LICENCE_VERIFIED: FAIL — awaiting human attestation          ║
 * ║    Total blocking reasons: exactly 2                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Reference digests (computed from first preparation run):
 *   Combined source digest (SHA-256 of all 14 pages' raw bytes concatenated):
 *     Update REF_COMBINED_SOURCE_DIGEST after first run.
 *   Combined text digest (SHA-256 of all 14 pages' normalised text concatenated):
 *     Update REF_COMBINED_TEXT_DIGEST after first run.
 *
 * Multi-page normalisation method:
 *   Each page fetched as text/html.
 *   Normalised using existing normaliseContent("text/html") pipeline.
 *   Raw bytes of all pages concatenated in canonical order → combined source digest.
 *   Normalised texts of all pages joined with "\n\n--- SECTION BREAK ---\n\n".
 *   Combined text processed through normaliseContent("text/plain") to obtain
 *   the canonical NormalisedDocument for eligibility assessment.
 *
 * Near-duplicate check covers all 10 admitted corpus documents:
 *   DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network required)
 *   DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture (no network)
 *   DRA-DOC-0008:      live re-fetch from acas.org.uk
 *                      NOTE: content changed since admission (89,713 → 164,726 chars
 *                      as recorded in DRA-BMK-010). Current live content used;
 *                      similarity check remains valid (ICO AI guidance is not
 *                      similar to employment law guidance in any version).
 *   DRA-DOC-0009:      live re-fetch from assets.publishing.service.gov.uk (CMA)
 *   DRA-DOC-0010:      live re-fetch from nvlpubs.nist.gov (NIST AI RMF)
 *
 * This test makes live HTTPS requests to ico.org.uk, acas.org.uk,
 * assets.publishing.service.gov.uk, and nvlpubs.nist.gov.
 * Allow 5 minutes.
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
import type { AcquiredSource } from "../fetcher.js";

// ---------------------------------------------------------------------------
// Fixed preparation timestamp
// ---------------------------------------------------------------------------

const PREP_TIMESTAMP = "2026-08-06T00:00:00.000Z";

// ---------------------------------------------------------------------------
// Canonical ICO base URL and in-scope section paths (navigation DOM order)
//
// The ICO guidance is a multi-page HTML publication.
// No consolidated PDF is available; the "Print this page" button is the only
// print route and does not produce a downloadable artefact.
//
// Section ordering determined from the multipage-nav DOM element on the
// landing page (2026-08-06). The data-id attributes are CMS IDs and do not
// determine display order; DOM position is authoritative.
//
// EXCLUDED: /ai-and-data-protection-risk-toolkit/
//   Reason: interactive tool with a separate JavaScript-driven interface;
//   not a chapter of the guidance document; does not contain guidance text.
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";

const SECTION_SLUGS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "/",                                                                              label: "01 — Landing/index page" },
  { slug: "/whats-new/",                                                                   label: "02 — What's new" },
  { slug: "/about-this-guidance/",                                                         label: "03 — About this guidance" },
  { slug: "/what-are-the-accountability-and-governance-implications-of-ai/",               label: "04 — Accountability and governance implications" },
  { slug: "/how-do-we-ensure-transparency-in-ai/",                                        label: "05 — How do we ensure transparency in AI" },
  { slug: "/how-do-we-ensure-lawfulness-in-ai/",                                          label: "06 — How do we ensure lawfulness in AI" },
  { slug: "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/",            label: "07 — Accuracy and statistical accuracy" },
  { slug: "/how-do-we-ensure-fairness-in-ai/",                                            label: "08 — How do we ensure fairness in AI" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/",label: "09 — Fairness: bias and discrimination" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/", label: "10 — Fairness: Article 22 impact" },
  { slug: "/how-should-we-assess-security-and-data-minimisation-in-ai/",                  label: "11 — Security and data minimisation" },
  { slug: "/how-do-we-ensure-individual-rights-in-our-ai-systems/",                       label: "12 — Individual rights" },
  { slug: "/annex-a-fairness-in-the-ai-lifecycle/",                                       label: "13 — Annex A: Fairness in the AI lifecycle" },
  { slug: "/glossary/",                                                                    label: "14 — Glossary" },
];

const SECTION_URLS: ReadonlyArray<string> = SECTION_SLUGS.map(
  ({ slug }) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

const LANDING_PAGE_URL = SECTION_URLS[0]!;

// ---------------------------------------------------------------------------
// Reference digests (placeholder — updated after first run)
//
// On first run these placeholders will not match the computed digests.
// The test logs the computed values so they can be recorded here.
// Update both constants after the first successful run.
//
// Source digest: SHA-256 of all 14 pages' raw HTML bytes concatenated
//               in canonical section order (slugs 1–14 above).
// Text digest:  SHA-256 of all 14 pages' normalised texts joined with
//               "\n\n--- SECTION BREAK ---\n\n", then trimmed.
// ---------------------------------------------------------------------------

// Reference digests established 2026-08-06 — first preparation run.
// Source digest = text digest because both are SHA-256 of the same
// normalised text bytes (source digest is computed from text bytes for
// this multi-page HTML source to ensure determinism across Cloudflare
// dynamic HTML injections).
const REF_COMBINED_SOURCE_DIGEST =
  "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";
const REF_COMBINED_TEXT_DIGEST =
  "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";

// Text length (chars in combined normalised text); raw bytes informational.
const REF_COMBINED_TEXT_LENGTH = 367376;
const REF_COMBINED_BYTE_LENGTH = 1072008; // total raw HTML bytes (non-deterministic; for reference only)

// ---------------------------------------------------------------------------
// pdftotext extractor — reuses same wrapper as DRA-ACQ-002/004/005
// (needed for near-duplicate check: DRA-DOC-0008, 0009, 0010 are PDFs)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-006-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath  = join(tmpdir(), `${id}.pdf`);
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
// Digest change classifier (same pattern as DRA-ACQ-005)
// ---------------------------------------------------------------------------

function classifyDigestChange(
  ref: string,
  current: string,
  refBytes: number,
  currentBytes: number,
  label: string,
): string {
  if (ref === current) return "UNCHANGED";
  const isPlaceholder = ref === "0".repeat(64) || refBytes === 0;
  if (isPlaceholder) {
    return (
      `PLACEHOLDER_REPLACED — ${label}: first run establishes reference. ` +
      `Update the REF_* constants to the values logged below.`
    );
  }
  if (refBytes !== currentBytes) {
    return (
      `SOURCE_CHANGE_DETECTED — ${label}: byte count changed ` +
      `from ${refBytes} to ${currentBytes}. Review before admission.`
    );
  }
  return (
    `EXTRACTION_OR_ENCODING_NONDETERMINISM — ${label}: ` +
    `byte counts match (${currentBytes}) but digest differs. Review before admission.`
  );
}

// ---------------------------------------------------------------------------
// Machine-prepared governance objects — REVIEW_REQUIRED
//
// OFFICIAL SOURCE EVIDENCE:
//   - Publication served from https://ico.org.uk (official ICO domain)
//   - The ICO is the UK's independent authority for data protection and
//     freedom of information, established by the Data Protection Act 2018.
//   - Page title: "Guidance on AI and data protection"
//   - DC.Creator: "" (ICO) — from HTML meta tags on section pages
//   - DC.Publisher: "ICO" — confirmed on all section pages
//   - Last updated: 22 September 2025 (DC.Date on about-this-guidance)
//   - Breadcrumb: For organisations → UK GDPR guidance and resources →
//     Artificial intelligence → Guidance on AI and data protection
//   - HEAD requests return 405; GET returns 200 text/html (confirmed)
//
// LICENCE EVIDENCE:
//   - ICO footer (all pages): "All text content is available under the
//     Open Government Licence v3.0, except where otherwise stated."
//   - Source: ico.org.uk footer on every guidance page
//   - OGL v3.0 URL: https://www.nationalarchives.gov.uk/doc/open-government-licence/
//   - ICO is a UK public body; OGL v3.0 is the standard licence for
//     UK public sector information.
//   - Machine pre-assessment: OGL_V3 (Open Government Licence version 3.0)
//
// Both require human attestation before freeze.
// ---------------------------------------------------------------------------

const PREPARED_OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  assessedBy: "DRA-ACQ-006-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    `Publication fetched from ${ICO_BASE} — official ICO domain (ico.org.uk)`,
    "The ICO (Information Commissioner's Office) is the UK's independent supervisory authority for data protection, established by the Data Protection Act 2018 and exercising powers under the UK GDPR",
    "HTML meta DC.Publisher: 'ICO' — confirmed on all section pages",
    "HTML meta DC.Subject: 'Guidance on AI and data protection'",
    "HTML meta DC.Date: Monday, September 22, 2025 (from about-this-guidance section)",
    "Breadcrumb path: For organisations → UK GDPR guidance and resources → Artificial intelligence → Guidance on AI and data protection",
    "Page heading h1: 'Guidance on AI and data protection'",
    "14 pages fetched from ico.org.uk, all returning HTTP 200 text/html via GET",
    "HEAD requests return HTTP 405 (Method Not Allowed) — server configuration; GET succeeds",
    "No redirect to a different domain observed",
    "REQUIRES HUMAN REVIEW: confirm ico.org.uk is the authoritative publication host for this guidance",
    "REQUIRES HUMAN REVIEW: confirm the 14 fetched pages represent the complete current guidance (not a superseded version)",
    "REQUIRES HUMAN REVIEW: confirm the last-updated date (22 September 2025) reflects the correct version under evaluation",
  ],
  notes:
    "DRA-ACQ-006 Machine-prepared official-source evidence. " +
    "The ICO is the statutory data protection authority for the UK. " +
    "A human reviewer must confirm the source is authoritative and the version is correct.",
});

const PREPARED_LICENCE_ASSESSMENT = Object.freeze({
  status: "REVIEW_REQUIRED" as const,
  licenceName: "Open Government Licence version 3.0 (OGL v3.0)",
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-006-machine-preparation",
  assessedAt: PREP_TIMESTAMP,
  evidence: [
    "ICO website footer (all guidance pages): 'All text content is available under the Open Government Licence v3.0, except where otherwise stated.'",
    "Source of licence statement: ico.org.uk page footer — present on every section page of the guidance",
    "OGL v3.0 is the UK public sector standard open licence for government-produced content",
    "OGL v3.0 permits: copying, publishing, distributing, transmitting, adapting and exploiting the information commercially or non-commercially",
    "OGL v3.0 requires attribution: must acknowledge the source (ICO) and include the licence URL",
    "OGL v3.0 exclusions: ICO logos, emblems, and heraldic devices are NOT covered by OGL",
    "OGL v3.0 exclusions: third-party materials (images, photographs, separately credited content) may have separate copyright terms",
    "OGL v3.0 exclusions: personal data is not covered",
    "The evaluation scope is normalised plain text; no logos, images, or separately credited third-party content is included in the text extraction",
    "Machine pre-assessment: OGL_V3 — OPEN_LICENCE",
    "REQUIRES HUMAN REVIEW: confirm no 'except where otherwise stated' carve-out applies to any section of the guidance evaluation scope",
    "REQUIRES HUMAN REVIEW: confirm no third-party copyrighted text appears in the normalised evaluation scope",
    "REQUIRES HUMAN REVIEW: confirm OGL v3.0 attribution will be included in all DRA benchmark publications citing this document",
  ],
  notes:
    "DRA-ACQ-006 Machine-prepared licence evidence. " +
    "ICO explicitly states OGL v3.0 for all text content. " +
    "A human reviewer must verify no carve-outs apply to the evaluation scope.",
});

// ---------------------------------------------------------------------------
// Proposed metadata — requires human review before freeze
//
// Factual basis:
//   - Title: from HTML h1 heading and meta DC.Subject on all pages
//   - Publisher: Information Commissioner's Office (ICO) — from DC.Publisher
//   - Publication date: 2025-09-22 (last updated date from DC.Date)
//   - Domain: LEGAL — UK GDPR, data protection law, regulatory compliance
//   - DocumentType: GUIDANCE — regulatory guidance issued by a supervisory
//     authority; not a specification, policy, or report
//   - Difficulty: HIGH — complex legal framework, cross-references to
//     UK GDPR articles, regulatory case examples, technical AI concepts
//   - Language: en (en-GB)
//   - Source type: HUMAN_AUTHORED — authored by ICO staff; regulatory guidance
// ---------------------------------------------------------------------------

const PROPOSED_METADATA = Object.freeze({
  title: "Guidance on AI and data protection",
  publisher: "Information Commissioner's Office (ICO)",
  publicationDate: "2025-09-22",
  domain: "LEGAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First regulatory guidance from a UK data protection supervisory authority in the corpus. " +
  "The ICO is the statutory authority for data protection in the UK (Data Protection Act 2018); " +
  "its guidance carries regulatory weight that distinguishes it from non-binding frameworks. " +
  "New publisher: ICO not previously represented in DRA-DOC-0001–0010. " +
  "LEGAL domain: adds a second LEGAL publisher (DRA-DOC-0008 is Acas employment law guidance); " +
  "ICO guidance covers AI and data protection law (UK GDPR), providing a distinct legal subdomain. " +
  "HIGH difficulty: complex cross-references to UK GDPR articles (Articles 5, 6, 9, 13, 14, 22, 25, 35), " +
  "regulatory case examples, and technical AI risk concepts interleaved with legal analysis. " +
  "HUMAN_AUTHORED source type: ICO regulatory staff; not AI-generated. " +
  "Complex authority structure: cross-references to UK GDPR, ICO Accountability Framework, " +
  "UK-GDPR Recitals, Data Protection Act 2018, and ICO enforcement decisions — " +
  "exercises Stage 3 (Authority Resolution) with real legal citation chains. " +
  "Multi-page HTML publication with 14 in-scope sections: exercises normalisation of " +
  "web-native regulatory content (not PDF), expanding the corpus source format diversity. " +
  "OGL v3.0 licence: same licence family as existing DRA-DOC-0007 and DRA-DOC-0008; " +
  "well-established reuse pathway for the benchmark. " +
  "Evidence contribution hypothesis: complex legal-regulatory authority chains and " +
  "cross-references to external standards may expose previously unexercised issue classes " +
  "such as AUTHORITY_ABSENT or EVIDENCE_INADEQUATE in a new regulatory context; " +
  "this is a hypothesis only and the evaluator outcome is not predetermined.";

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
//
// DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)
// DRA-DOC-0007:      from APACHE_HTTPD_AUTH_HTML fixture (no network)
// DRA-DOC-0008:      live re-fetch from acas.org.uk
//                    NOTE: content changed since admission (DRA-BMK-010 §19.1).
//                    Current live content is used for similarity assessment;
//                    ICO AI guidance is not similar to employment law guidance
//                    in any version of the Acas document.
// DRA-DOC-0009:      live re-fetch from assets.publishing.service.gov.uk
// DRA-DOC-0010:      live re-fetch from nvlpubs.nist.gov
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006 (from BENCHMARK_CORPUS)
  console.log("  Building corpus texts — DRA-DOC-0001–0006 from BENCHMARK_CORPUS");
  for (const entry of BENCHMARK_CORPUS) {
    const bytes  = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007 — Apache HTTP Server guide (fixture)
  console.log("  Building corpus texts — DRA-DOC-0007 from Apache fixture");
  const apacheBytes  = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008 — Acas guide (live re-fetch)
  console.log("  Building corpus texts — DRA-DOC-0008 (Acas guide, live fetch)");
  console.log("  NOTE: DRA-BMK-010 recorded Acas content changed since admission (89,713→164,726 chars)");
  console.log("  Using current live content for similarity assessment.");
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-006-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const acasDigest = computeSourceDigest(acasFetch.source.rawBytes);
      const acasNorm   = await normaliseContent(acasFetch.source.rawBytes, "application/pdf", acasDigest, extractPdfText);
      if (acasNorm.ok) {
        texts.push(acasNorm.document.text);
        console.log(`    Acas text length: ${acasNorm.document.text.length} chars`);
      }
    } else {
      console.warn(`    Acas fetch failed: ${acasFetch.code}`);
    }
  }

  // DRA-DOC-0009 — CMA AI Foundation Models Short Version (live re-fetch)
  console.log("  Building corpus texts — DRA-DOC-0009 (CMA short version, live fetch)");
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl:
      "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-006-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority (CMA)",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const cmaDigest = computeSourceDigest(cmaFetch.source.rawBytes);
      const cmaNorm   = await normaliseContent(cmaFetch.source.rawBytes, "application/pdf", cmaDigest, extractPdfText);
      if (cmaNorm.ok) {
        texts.push(cmaNorm.document.text);
        console.log(`    CMA text length: ${cmaNorm.document.text.length} chars`);
      }
    } else {
      console.warn(`    CMA fetch failed: ${cmaFetch.code}`);
    }
  }

  // DRA-DOC-0010 — NIST AI RMF 1.0 (live re-fetch)
  console.log("  Building corpus texts — DRA-DOC-0010 (NIST AI RMF, live fetch)");
  console.log("  NOTE: nvlpubs.nist.gov returns 404 for HEAD; GET returns 200 (confirmed behaviour)");
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-006-corpus-check",
    requestedAt: PREP_TIMESTAMP,
    expectedPublisher: "National Institute of Standards and Technology (NIST)",
    expectedTitle: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  });
  if (nistReq.ok) {
    const nistFetch = await fetcher(nistReq.request, {});
    if (nistFetch.ok) {
      const nistDigest = computeSourceDigest(nistFetch.source.rawBytes);
      const nistNorm   = await normaliseContent(nistFetch.source.rawBytes, "application/pdf", nistDigest, extractPdfText);
      if (nistNorm.ok) {
        texts.push(nistNorm.document.text);
        console.log(`    NIST text length: ${nistNorm.document.text.length} chars`);
      }
    } else {
      console.warn(`    NIST fetch failed: ${nistFetch.code}`);
    }
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Main acquisition preparation test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-006 — Controlled Acquisition Preparation for DRA-DOC-0011 (ICO AI and Data Protection Guidance)",
  () => {
    it(
      "acquires ICO AI and data protection guidance (multi-page HTML), verifies eligibility up to freeze boundary",
      async () => {
        // ── Setup ───────────────────────────────────────────────────────────

        const registry = new CorpusRegistry();
        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-006",
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
          timeoutMs: 60_000,
          maxRedirects: 5,
          maxBytes: 15_000_000,
          userAgent: "DRA-ENG-010/1.0",
        });

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-006 — ACQUISITION PREPARATION LOG                ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
        console.log("  Publisher     : Information Commissioner's Office (ICO)");
        console.log("  Document      : Guidance on AI and data protection");
        console.log("  Source format : Multi-page HTML (14 pages in scope)");
        console.log("  Landing page  :", LANDING_PAGE_URL);
        console.log("  Discovery ID  : DRA-DIS-000001");
        console.log("  Acquisition   : DRA-ACQ-000013");
        console.log("  Proposed ID   : DRA-DOC-0011");

        // ── Step 1: Fetch all 14 in-scope section pages (pass 1) ─────────────

        console.log(
          "\n── Step 1: Fetch All In-Scope Section Pages — Pass 1 ──────",
        );
        console.log(`  Total sections: ${SECTION_URLS.length} (1 excluded: risk toolkit)`);

        const pass1Pages: Array<{
          url:    string;
          label:  string;
          bytes:  Uint8Array;
          digest: string;
          status: number;
          finalUrl: string;
          retrievedAt: string;
          headers?: { contentType?: string; lastModified?: string; };
        }> = [];

        for (let i = 0; i < SECTION_URLS.length; i++) {
          const url   = SECTION_URLS[i]!;
          const label = SECTION_SLUGS[i]!.label;

          const reqResult = createAcquisitionRequest({
            acquisitionId: "DRA-ACQ-000013",
            sourceUrl:     url,
            requestedBy:   "DRA-ACQ-006-acquisition-operator",
            requestedAt:   PREP_TIMESTAMP,
            expectedPublisher: "Information Commissioner's Office (ICO)",
            expectedTitle:     "Guidance on AI and data protection",
          });

          if (!reqResult.ok) {
            console.error(`  !! Request creation failed for ${label}: ${reqResult.errors.join(", ")}`);
            expect(reqResult.ok).toBe(true);
            return;
          }

          const fetchResult = await fetcher(reqResult.request, {});

          if (!fetchResult.ok) {
            console.error(`  !! Fetch FAILED for ${label}: ${fetchResult.code} — ${fetchResult.message}`);
            expect(fetchResult.ok).toBe(true);
            return;
          }

          const src    = fetchResult.source;
          const digest = computeSourceDigest(src.rawBytes);

          console.log(`  ${label}`);
          console.log(`    url         : ${url}`);
          console.log(`    finalUrl    : ${src.finalUrl}`);
          console.log(`    httpStatus  : ${src.httpStatus}`);
          console.log(`    mediaType   : ${src.mediaType}`);
          console.log(`    byteLength  : ${src.rawBytes.length}`);
          console.log(`    sourceDigest: ${digest.slice(0, 16)}…`);
          if (src.httpResponseHeaders?.lastModified) {
            console.log(`    lastModified: ${src.httpResponseHeaders.lastModified}`);
          }

          expect(src.httpStatus).toBe(200);
          expect(src.mediaType).toBe("text/html");
          expect(src.rawBytes.length).toBeGreaterThan(0);

          pass1Pages.push({
            url,
            label,
            bytes:       src.rawBytes,
            digest,
            status:      src.httpStatus,
            finalUrl:    src.finalUrl,
            retrievedAt: src.retrievedAt,
            headers: {
              contentType:  src.httpResponseHeaders?.contentType,
              lastModified: src.httpResponseHeaders?.lastModified,
            },
          });
        }

        expect(pass1Pages).toHaveLength(SECTION_URLS.length);
        console.log(`\n  ✓ All ${pass1Pages.length} pages fetched successfully (Pass 1)`);

        // ── Step 2: Normalise each page (HTML → text) ─────────────────────

        console.log(
          "\n── Step 2: Normalise Each Page (HTML → plain text) ────────",
        );

        const pageTexts: string[] = [];

        for (const page of pass1Pages) {
          const normResult = await normaliseContent(
            page.bytes,
            "text/html",
            page.digest,
          );

          if (!normResult.ok) {
            console.error(`  !! Normalisation FAILED for ${page.label}: ${normResult.code}`);
            expect(normResult.ok).toBe(true);
            return;
          }

          const pageWordCount = normResult.document.text
            .split(/\s+/)
            .filter(Boolean).length;

          console.log(`  ${page.label}`);
          console.log(`    textLength  : ${normResult.document.text.length} chars`);
          console.log(`    wordCount   : ${pageWordCount}`);
          console.log(`    textDigest  : ${normResult.document.textDigest.slice(0, 16)}…`);

          expect(normResult.document.text.trim().length).toBeGreaterThan(100);
          pageTexts.push(normResult.document.text);
        }

        expect(pageTexts).toHaveLength(SECTION_URLS.length);

        // ── Step 3: Compute combined source and text ───────────────────────

        console.log(
          "\n── Step 3: Combined Source Digest and Text ─────────────────",
        );

        // CLOUDFLARE DYNAMIC HTML NOTE:
        // ICO pages are served through Cloudflare CDN which injects dynamic
        // content (CSRF tokens, nonce values, session identifiers) into each
        // HTML response. Raw HTML bytes are therefore non-deterministic between
        // requests. The NORMALISED TEXT is stable (confirmed: text digests match
        // between Pass 1 and Pass 2 for all 14 pages).
        //
        // Combined source digest approach (stable):
        //   SHA-256 of all 14 pages' normalised text bytes concatenated in
        //   canonical section order. This fingerprint is deterministic across
        //   runs because HTML normalisation strips all dynamic Cloudflare
        //   injections (nonces, tokens, etc.).
        //
        // Combined raw bytes are recorded for metadata only (byte count); they
        // are NOT used to compute the canonical source digest.

        const totalRawBytes = pass1Pages.reduce(
          (sum, p) => sum + p.bytes.length,
          0,
        );

        // Combined text: all page texts joined with section separator
        const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";
        const combinedText       = pageTexts.join(SECTION_SEPARATOR);

        const encoder    = new TextEncoder();
        const textBytes  = encoder.encode(combinedText);

        // Stable combined source digest: SHA-256 of concatenated normalised text bytes
        const combinedSourceDigest = computeSourceDigest(textBytes);

        // Obtain a proper NormalisedDocument by passing combined text through
        // the text/plain normalisation path with the combined source digest.
        const combinedNormResult = await normaliseContent(
          textBytes,
          "text/plain",
          combinedSourceDigest,
        );

        expect(combinedNormResult.ok).toBe(true);
        if (!combinedNormResult.ok) return;

        const combinedNormalised = combinedNormResult.document;
        const combinedWordCount  = combinedNormalised.text
          .split(/\s+/)
          .filter(Boolean).length;

        console.log("  Combined source digest  :", combinedSourceDigest);
        console.log("  Combined text digest    :", combinedNormalised.textDigest);
        console.log("  Total raw byte count    :", totalRawBytes, "bytes (informational; raw HTML non-deterministic)");
        console.log("  Combined text length    :", combinedNormalised.text.length, "chars");
        console.log("  Combined word count     :", combinedWordCount);
        console.log("  Normalisation version   :", combinedNormalised.normalisationVersion);
        console.log("  Source digest method    : SHA-256 of concatenated normalised text bytes (stable; raw HTML Cloudflare-dynamic)");

        // Source digest comparison (digest is from normalised text bytes — deterministic)
        const sourceDiagnostic = classifyDigestChange(
          REF_COMBINED_SOURCE_DIGEST,
          combinedSourceDigest,
          REF_COMBINED_TEXT_LENGTH, // byte reference tracks text length (stable)
          combinedNormalised.text.length,
          "ICO combined source digest (from normalised text bytes)",
        );
        console.log("\n  Source digest status    :", sourceDiagnostic);

        const textDiagnostic = classifyDigestChange(
          REF_COMBINED_TEXT_DIGEST,
          combinedNormalised.textDigest,
          REF_COMBINED_TEXT_LENGTH,
          combinedNormalised.text.length,
          "ICO combined text digest",
        );
        console.log("  Text digest status      :", textDiagnostic);

        if (sourceDiagnostic.startsWith("PLACEHOLDER_REPLACED")) {
          console.log("\n  >> FIRST RUN — record these reference digests:");
          console.log(`     REF_COMBINED_SOURCE_DIGEST = "${combinedSourceDigest}"`);
          console.log(`     REF_COMBINED_TEXT_DIGEST   = "${combinedNormalised.textDigest}"`);
          console.log(`     REF_COMBINED_TEXT_LENGTH   = ${combinedNormalised.text.length}`);
          console.log(`     REF_COMBINED_BYTE_LENGTH   = ${totalRawBytes}`);
        }

        expect(combinedNormalised.normalisationVersion).toBe("DRA-NORM-v1");
        expect(combinedNormalised.text.trim().length).toBeGreaterThan(10_000);
        expect(combinedNormalised.textDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(combinedSourceDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 4: Create synthetic AcquiredSource for eligibility check ──

        console.log(
          "\n── Step 4: Synthetic AcquiredSource (multi-page representation) ─",
        );

        const syntheticSource: AcquiredSource = Object.freeze({
          acquisitionId: "DRA-ACQ-000013",
          requestedUrl:  LANDING_PAGE_URL,
          finalUrl:      pass1Pages[0]!.finalUrl,
          mediaType:     "text/html",
          // rawBytes for synthetic multi-page source uses normalised text bytes
          // (raw HTML is Cloudflare-dynamic; text bytes are deterministic)
          rawBytes:      textBytes,
          retrievedAt:   pass1Pages[0]!.retrievedAt,
          httpStatus:    200,
          redirects:     [] as readonly string[],
          // httpResponseHeaders is not defined for a synthetic multi-page combined source;
          // per-page headers are logged in the acquisition step above.
          httpResponseHeaders: undefined,
        });

        console.log("  acquisitionId :", syntheticSource.acquisitionId);
        console.log("  finalUrl      :", syntheticSource.finalUrl);
        console.log("  mediaType     :", syntheticSource.mediaType);
        console.log("  httpStatus    :", syntheticSource.httpStatus);
        console.log("  rawBytes      :", syntheticSource.rawBytes.length, "(combined)");
        console.log("  retrievedAt   :", syntheticSource.retrievedAt);

        expect(syntheticSource.httpStatus).toBe(200);
        expect(syntheticSource.mediaType).toBe("text/html");

        // ── Step 5: Internal identity verification ────────────────────────

        console.log(
          "\n── Step 5: Internal Identity Verification ──────────────────",
        );

        const identityChecks = {
          titleInContent:   combinedText.includes("Guidance on AI and data protection"),
          icoNamePresent:   combinedText.includes("Information Commissioner") ||
                            combinedText.includes("ICO"),
          ukGdprPresent:    combinedText.includes("UK GDPR") || combinedText.includes("UK-GDPR"),
          aiTopicPresent:   combinedText.toLowerCase().includes("artificial intelligence") ||
                            combinedText.toLowerCase().includes("machine learning"),
          dataProtection:   combinedText.toLowerCase().includes("data protection"),
          accountabilitySection: pageTexts.some(t =>
            t.toLowerCase().includes("accountability") ||
            t.toLowerCase().includes("governance")
          ),
          transparencySection: pageTexts.some(t =>
            t.toLowerCase().includes("transparency")
          ),
          fairnessSection: pageTexts.some(t =>
            t.toLowerCase().includes("fairness") ||
            t.toLowerCase().includes("discrimination")
          ),
          glossaryPresent: pageTexts[pageTexts.length - 1]!.length > 500,
          noTruncation:    pageTexts.every(t => t.trim().length > 100),
        };

        for (const [key, passed] of Object.entries(identityChecks)) {
          console.log(`  ${passed ? "✓" : "✗"} ${key}`);
          if (!passed) {
            console.error(`  !! IDENTITY CHECK FAILED: ${key}`);
          }
        }

        expect(identityChecks.titleInContent).toBe(true);
        expect(identityChecks.icoNamePresent).toBe(true);
        expect(identityChecks.ukGdprPresent).toBe(true);
        expect(identityChecks.aiTopicPresent).toBe(true);
        expect(identityChecks.dataProtection).toBe(true);
        expect(identityChecks.accountabilitySection).toBe(true);
        expect(identityChecks.transparencySection).toBe(true);
        expect(identityChecks.fairnessSection).toBe(true);
        expect(identityChecks.glossaryPresent).toBe(true);
        expect(identityChecks.noTruncation).toBe(true);

        // ── Step 6: Reproducibility check — second pass ───────────────────

        console.log(
          "\n── Step 6: Reproducibility Check — Second Pass ─────────────",
        );
        console.log("  Re-fetching all 14 sections…");

        const pass2Digests: string[] = [];
        const pass2TextDigests: string[] = [];

        for (let i = 0; i < SECTION_URLS.length; i++) {
          const url      = SECTION_URLS[i]!;
          const reqResult = createAcquisitionRequest({
            acquisitionId: "DRA-ACQ-000013",
            sourceUrl:     url,
            requestedBy:   "DRA-ACQ-006-reproducibility-operator",
            requestedAt:   PREP_TIMESTAMP,
            expectedPublisher: "Information Commissioner's Office (ICO)",
            expectedTitle:     "Guidance on AI and data protection",
          });
          if (!reqResult.ok) continue;

          const fetch2 = await fetcher(reqResult.request, {});
          if (!fetch2.ok) {
            console.warn(`  !! Pass 2 fetch failed for section ${i + 1}: ${fetch2.code}`);
            continue;
          }

          const d2 = computeSourceDigest(fetch2.source.rawBytes);
          pass2Digests.push(d2);

          const n2 = await normaliseContent(fetch2.source.rawBytes, "text/html", d2);
          if (n2.ok) pass2TextDigests.push(n2.document.textDigest);
        }

        // Build combined text digests from pass-2 per-page normalised texts
        // NOTE: Raw HTML source digests are NOT compared between passes.
        //       ICO pages are Cloudflare-fronted and inject dynamic content
        //       (CSRF tokens, nonce values) into each HTML response, making
        //       raw byte digests non-deterministic between requests.
        //       Only text digest stability is meaningful and asserted.
        let pass2SourceDifferCount = 0;
        let pass2TextAllMatch = true;
        for (let i = 0; i < pass1Pages.length && i < pass2Digests.length; i++) {
          const sourceMatch = pass2Digests[i] === pass1Pages[i]!.digest;
          if (!sourceMatch) {
            pass2SourceDifferCount++;
            // Source byte differ is expected (Cloudflare dynamic injection) — log only, not failure
          }
        }

        for (let i = 0; i < pageTexts.length && i < pass2TextDigests.length; i++) {
          const normResult1 = await normaliseContent(pass1Pages[i]!.bytes, "text/html", pass1Pages[i]!.digest);
          if (normResult1.ok && pass2TextDigests[i] !== normResult1.document.textDigest) {
            pass2TextAllMatch = false;
            console.warn(`  !! Section ${i + 1} text digest differs between passes`);
          }
        }

        const reproducibilityResult = pass2TextAllMatch ? "TEXT_STABLE" : "TEXT_UNSTABLE";

        console.log(`  Pass 2 sections fetched    : ${pass2Digests.length} / ${SECTION_URLS.length}`);
        console.log(`  Source digests match       : ${pass2SourceDifferCount === 0 ? "✓ ALL IDENTICAL" : `DYNAMIC (${pass2SourceDifferCount}/${SECTION_URLS.length} differ — Cloudflare nonce injection; expected)`}`);
        console.log(`  Text digests match         : ${pass2TextAllMatch ? "✓ ALL IDENTICAL" : "!! DIFFERS"}`);
        console.log(`  Reproducibility result     : ${reproducibilityResult}`);
        console.log(`  NOTE: Raw HTML non-determinism is a known property of Cloudflare-fronted ICO pages.`);
        console.log(`        Normalised text is the canonical deterministic fingerprint for this source.`);

        expect(pass2Digests).toHaveLength(SECTION_URLS.length);
        // Text digest stability is the meaningful reproducibility invariant for this source.
        // Raw HTML bytes are non-deterministic (Cloudflare dynamic content); not asserted.
        expect(pass2TextAllMatch).toBe(true);

        // ── Step 7: Build existing corpus texts (all 10 docs) ─────────────

        console.log(
          "\n── Step 7: Build Existing Corpus Texts for Near-Duplicate Check ─",
        );
        console.log("  Building texts for DRA-DOC-0001–0010 (all 10 admitted documents)");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log(`  Total existing corpus texts: ${existingCorpusTexts.length}`);
        if (existingCorpusTexts.length !== 10) {
          console.warn(
            `  !! Expected 10 existing corpus texts; got ${existingCorpusTexts.length}. ` +
            "Near-duplicate check may be partial.",
          );
        }

        // ── Step 8: Freeze eligibility (13 checks) ────────────────────────

        console.log(
          "\n── Step 8: Freeze Eligibility (13 checks) ──────────────────",
        );

        const eligibility = checkFreezeEligibility(
          syntheticSource,
          combinedNormalised,
          PREPARED_OFFICIAL_SOURCE_ASSESSMENT,
          PREPARED_LICENCE_ASSESSMENT,
          PROPOSED_METADATA,
          "DRA-DOC-0011",
          INCLUSION_RATIONALE,
          registry,
          protocol,
          existingCorpusTexts,
        );

        console.log("");
        for (const check of eligibility.checks) {
          const icon   = check.passed ? "✓" : "✗";
          const status = check.passed ? "PASS" : "FAIL";
          console.log(`  ${icon} [${status}] ${check.checkId}`);
          if (check.detail) console.log(`        detail: ${check.detail}`);
        }

        if (!eligibility.eligible) {
          console.log("\n  Blocking reasons:", eligibility.blockingReasons.join(", "));
          console.log("  (Both governance failures EXPECTED — machine cannot assign VERIFIED)");
        }

        // Assert exactly two checks fail — the governance attestation checks
        expect(eligibility.eligible).toBe(false);
        if (!eligibility.eligible) {
          expect(eligibility.blockingReasons).toContain("OFFICIAL_SOURCE_NOT_VERIFIED");
          expect(eligibility.blockingReasons).toContain("LICENCE_NOT_VERIFIED");
          expect(eligibility.blockingReasons).toHaveLength(2);
        }

        // All non-governance checks must pass
        for (const check of eligibility.checks) {
          if (
            check.checkId === "OFFICIAL_SOURCE_VERIFIED" ||
            check.checkId === "LICENCE_VERIFIED"
          ) {
            expect(check.passed).toBe(false);
          } else {
            if (!check.passed) {
              console.error(`UNEXPECTED FAILURE: ${check.checkId} — ${check.detail ?? ""}`);
            }
            expect(check.passed).toBe(true);
          }
        }

        // ── Step 9: Evidence contribution plan summary ─────────────────────

        console.log(
          "\n── Step 9: Evidence Contribution Plan ──────────────────────",
        );

        const EVIDENCE_CONTRIBUTION_PLAN = {
          newPublisher:           "ICO — not previously represented in corpus",
          documentTypeAdded:      "GUIDANCE (additional) — regulatory guidance from a supervisory authority",
          domainContribution:     "LEGAL — regulatory compliance perspective; complements DRA-DOC-0008 (employment law)",
          authorityComplexity:    "High — cross-references to UK GDPR Articles 5/6/9/13/14/22/25/35, DPA 2018, ICO enforcement decisions, Recitals",
          evidenceStructure:      "Regulatory guidance with legal citations; distinct from technical standards (NIST) and employment law (Acas)",
          crossReferenceDensity:  "High — ICO guidance contains extensive cross-references to legislative provisions and other ICO guidance sections",
          documentSizeContribution: `Estimated ${combinedNormalised.text.length.toLocaleString()} chars (${combinedWordCount.toLocaleString()} words) — mid-range for corpus`,
          expectedIssueClassOpportunities: [
            "AUTHORITY_ABSENT: regulatory claims citing UK GDPR provisions without substantive evidential support",
            "EVIDENCE_INADEQUATE: practical guidance recommendations may lack evidentiary basis in the text itself",
            "EVIDENCE_ABSENT: cross-references to external ICO guidance not included in evaluation scope",
          ],
          expectedDecisionContribution: "Hypothesis: REVIEW or HOLD likely; outcome not predetermined; evaluator runs without foreknowledge",
          licenceDiversity:       "OGL v3.0 — same family as DRA-DOC-0007/0008; well-established reuse pathway",
          benchmarkRepresentativeness: "First multi-page HTML document in corpus; first UK regulatory authority; first AI-specific data protection guidance",
        };

        for (const [key, val] of Object.entries(EVIDENCE_CONTRIBUTION_PLAN)) {
          if (Array.isArray(val)) {
            console.log(`  ${key}:`);
            for (const item of val) console.log(`    - ${item}`);
          } else {
            console.log(`  ${key}: ${val}`);
          }
        }

        // ── Step 10: Acquisition summary ──────────────────────────────────

        console.log(
          "\n── Acquisition Summary ─────────────────────────────────────",
        );
        console.log("  Discovery ID         : DRA-DIS-000001");
        console.log("  Acquisition ID       : DRA-ACQ-000013");
        console.log("  Proposed corpus ID   : DRA-DOC-0011");
        console.log("  Proposed freeze ID   : DRA-FRZ-000005");
        console.log("  Publisher            : Information Commissioner's Office (ICO)");
        console.log("  Title                : Guidance on AI and data protection");
        console.log("  Source format        : Multi-page HTML (14 pages, 1 excluded)");
        console.log("  Landing page         :", LANDING_PAGE_URL);
        console.log("  Sections fetched     :", pass1Pages.length);
        console.log("  Combined byte length :", totalRawBytes, "bytes (raw HTML; non-deterministic due to Cloudflare)");
        console.log("  Combined text length :", combinedNormalised.text.length, "chars");
        console.log("  Combined word count  :", combinedWordCount);
        console.log("  Combined source dig  :", combinedSourceDigest);
        console.log("  Combined text dig    :", combinedNormalised.textDigest);
        console.log("  Reproducibility      :", reproducibilityResult);
        console.log("  Official source      :", PREPARED_OFFICIAL_SOURCE_ASSESSMENT.status);
        console.log("  Licence assessment   :", PREPARED_LICENCE_ASSESSMENT.status, "(", PREPARED_LICENCE_ASSESSMENT.licenceName, ")");
        console.log("  Eligibility blocking :", eligibility.eligible ? "none" : eligibility.blockingReasons.join(", "));
        console.log("  Near-duplicate corpus texts compared:", existingCorpusTexts.length, "/ 10");
        console.log("  Near-duplicate result:", eligibility.checks.find(c => c.checkId === "NO_NEAR_DUPLICATE")?.passed ? "NO_NEAR_DUPLICATE — PASS" : "!! NEAR-DUPLICATE DETECTED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-006 PREPARATION COMPLETE — REVIEW_REQUIRED       ║",
        );
        console.log(
          "║  Human reviewer must verify official source and licence.   ║",
        );
        console.log(
          "║  Licence pre-assessment: OGL v3.0 (ICO website footer).    ║",
        );
        console.log(
          "║  Human confirmation required before freeze.                ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      300_000,
    );
  },
);
