/**
 * DRA-ACQ-007 — Controlled Corpus Admission for DRA-DOC-0012
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-007                                     ║
 * ║                                                                          ║
 * ║  Continues from DRA-ACQ-007 acquisition-preparation checkpoint.          ║
 * ║  Human governance decisions received 2026-08-06; both governance         ║
 * ║  assessments upgraded to VERIFIED.                                       ║
 * ║                                                                          ║
 * ║  Document:   Model risk management principles for banks                  ║
 * ║  Corpus ID:  DRA-DOC-0012                                                ║
 * ║  Freeze ID:  DRA-FRZ-000006                                              ║
 * ║  Discovery:  DRA-DIS-000003                                              ║
 * ║  Acquisition ID: DRA-ACQ-000014                                          ║
 * ║  Publisher:  Prudential Regulation Authority (PRA), Bank of England      ║
 * ║  Reference:  Supervisory Statement SS1/23 (published as part of PS6/23) ║
 * ║  Source:     PDF — single document                                       ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www.bankofengland.co.uk/-/media/boe/files/prudential-         ║
 * ║    regulation/supervisory-statement/2023/ss123.pdf                       ║
 * ║                                                                          ║
 * ║  NOTE ON LICENCE:                                                        ║
 * ║  © Bank of England 2023. BoE legal notice permits non-commercial use     ║
 * ║  for personal, internal, or academic/research purposes. The DRA          ║
 * ║  benchmark corpus is an academic research programme; licence is          ║
 * ║  compatible. Human governance decision confirms non-commercial academic  ║
 * ║  use permission. No embedded third-party material restrictions found.    ║
 * ║                                                                          ║
 * ║  NOTE ON STABILITY:                                                      ║
 * ║  Two independent fetches (2026-08-06) produced identical SHA-256.       ║
 * ║  Source is BYTE_STABLE.                                                  ║
 * ║                                                                          ║
 * ║  Pipeline scope:                                                         ║
 * ║    fetch → normalise → verify digest → near-duplicate                    ║
 * ║    (DRA-DOC-0001–0011) → freeze eligibility (13/13) →                   ║
 * ║    freeze record (DRA-FRZ-000006) → corpus integration →                 ║
 * ║    consolidated 12-document manifest integrity verification              ║
 * ║                                                                          ║
 * ║  STOPS BEFORE:                                                           ║
 * ║    - evaluator execution (evaluateDocument not called)                   ║
 * ║    - proof-receipt generation                                            ║
 * ║    - assurance decision                                                  ║
 * ║    - DRA-CASE infrastructure creation                                    ║
 * ║                                                                          ║
 * ║  Expected eligibility result:                                            ║
 * ║    All 13 of 13 freeze-eligibility checks must pass.                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Human governance decisions are recorded exactly as specified in the
 * DRA-ACQ-007 human governance sign-off received 2026-08-06.
 * The software does NOT auto-approve any assessment — the VERIFIED status
 * values below reflect explicit human sign-off on source provenance,
 * document identity, stability, and licence suitability.
 *
 * Reference digests (from DRA-ACQ-007 preparation run 2026-08-06):
 *   Source digest: 6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7
 *   Text digest:   6e31fcdea5070cec8a57991cdcb8d116e027c701e6a7e104ac623b1ebb82f8ec
 *   Byte length: 1,096,596
 *   Text length (chars): 75,228
 *
 * Near-duplicate check scope: DRA-DOC-0001 through DRA-DOC-0011 (11 documents)
 *
 * This test makes live HTTPS requests to bankofengland.co.uk, acas.org.uk,
 * assets.publishing.service.gov.uk, nvlpubs.nist.gov, and ico.org.uk
 * (14 sections for DRA-DOC-0011 near-duplicate check). Allow 12 minutes.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import {
  computeSourceDigest,
  computeApprovedMetadataDigest,
} from "../integrity.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionRequest } from "../request.js";
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
} from "../freeze.js";
import { integrateWithCorpus } from "../manifest-integration.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../fixtures/apache-httpd-auth-fixture.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Fixed timestamps — deterministic freeze record
// ---------------------------------------------------------------------------

/** Human governance review timestamp — decisions received 2026-08-06. */
const REVIEW_TIMESTAMP = "2026-08-06T13:00:00.000Z";

/** Freeze operation timestamp. */
const FREEZE_TIMESTAMP = "2026-08-06T13:30:00.000Z";

/** Corpus version — unchanged at DRA-CORPUS-1.0.0. */
const CORPUS_VERSION = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Canonical PDF URL
// ---------------------------------------------------------------------------

const PRA_PDF_URL =
  "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";

// ---------------------------------------------------------------------------
// Reference digests from DRA-ACQ-007 preparation run (2026-08-06)
// ---------------------------------------------------------------------------

const REFERENCE_SOURCE_DIGEST =
  "6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7";
const REFERENCE_TEXT_DIGEST =
  "bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c";
const REFERENCE_TEXT_LENGTH = 75182;

// ---------------------------------------------------------------------------
// ICO section URLs for DRA-DOC-0011 near-duplicate check
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";

const SECTION_SLUGS: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "/",                                                                               label: "01 — Landing/index page" },
  { slug: "/whats-new/",                                                                    label: "02 — What's new" },
  { slug: "/about-this-guidance/",                                                          label: "03 — About this guidance" },
  { slug: "/what-are-the-accountability-and-governance-implications-of-ai/",                label: "04 — Accountability and governance" },
  { slug: "/how-do-we-ensure-transparency-in-ai/",                                         label: "05 — Transparency" },
  { slug: "/how-do-we-ensure-lawfulness-in-ai/",                                           label: "06 — Lawfulness" },
  { slug: "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/",             label: "07 — Accuracy" },
  { slug: "/how-do-we-ensure-fairness-in-ai/",                                             label: "08 — Fairness" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/", label: "09 — Fairness: bias and discrimination" },
  { slug: "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/", label: "10 — Fairness: Article 22" },
  { slug: "/how-should-we-assess-security-and-data-minimisation-in-ai/",                   label: "11 — Security and data minimisation" },
  { slug: "/how-do-we-ensure-individual-rights-in-our-ai-systems/",                        label: "12 — Individual rights" },
  { slug: "/annex-a-fairness-in-the-ai-lifecycle/",                                        label: "13 — Annex A: Fairness in the AI lifecycle" },
  { slug: "/glossary/",                                                                     label: "14 — Glossary" },
];

const ICO_SECTION_URLS = SECTION_SLUGS.map(
  ({ slug }) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`,
);

const SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

// ---------------------------------------------------------------------------
// pdftotext extractor
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-007-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
//
// Status: VERIFIED
//
// Evidence reviewed 2026-08-06:
//   - Document fetched from bankofengland.co.uk (official BoE/PRA website)
//   - Publisher confirmed as Prudential Regulation Authority (PRA), a UK
//     statutory financial regulator established by the Financial Services
//     Act 2012, operating as a subsidiary of the Bank of England
//   - PDF cover page: "Model risk management principles for banks"
//     "Supervisory statement | SS1/23", "May 2023", "© Bank of England 2023"
//   - Policy effective date confirmed (§1.5): 17 May 2024
//   - Source BYTE_STABLE: two independent fetches produced identical SHA-256
//   - PRA confirmed as an official regulatory source for DRA corpus
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-007-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Document fetched from https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    "Publisher: Prudential Regulation Authority (PRA), Bank of England",
    "The PRA is a UK statutory financial regulator (Financial Services Act 2012), subsidiary of Bank of England",
    "HTTP status: 200 OK; Content-Type: application/pdf",
    "Source stability: BYTE_STABLE — two independent fetches (2026-08-06) produced identical SHA-256",
    `Source digest confirmed: ${REFERENCE_SOURCE_DIGEST}`,
    "PDF cover page title: 'Model risk management principles for banks'",
    "PDF cover page reference: 'Supervisory statement | SS1/23'",
    "PDF cover page date: 'May 2023'",
    "PDF copyright: '© Bank of England 2023'",
    "Publication confirmed as final supervisory statement (not consultation or draft)",
    "Landing page verified: https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks",
    "HUMAN GOVERNANCE DECISION: PRA confirmed as official regulatory source for DRA corpus — VERIFIED",
  ],
  notes:
    "DRA-ACQ-007 human governance sign-off 2026-08-06. " +
    "PRA SS1/23 official source VERIFIED. " +
    "Byte-stable PDF from bankofengland.co.uk.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
//
// Status: VERIFIED
//
// Licence basis:
//   © Bank of England 2023. BoE legal notice: "You may download, display or
//   print the Resources for personal use or internal use within an individual
//   organisation for non-commercial purposes. The Bank typically grants
//   permission for non-commercial re-use, particularly in an academic or
//   education context." The DRA benchmark corpus is an academic research
//   programme — non-commercial use confirmed. No embedded third-party
//   material restrictions found in SS1/23 (all content authored by PRA staff).
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Bank of England Copyright — Non-commercial Academic Use",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-007-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "PDF copyright notice: '© Bank of England 2023'",
    "BoE legal notice (https://www.bankofengland.co.uk/legal): non-commercial use explicitly permitted",
    "BoE legal notice: 'The Bank typically grants permission for non-commercial re-use, particularly in an academic or education context'",
    "DRA benchmark corpus: academic/research programme — non-commercial use confirmed",
    "No embedded third-party material identified in SS1/23 that would restrict reuse",
    "Document authored entirely by PRA staff; no external data licences requiring separate approval",
    "HUMAN GOVERNANCE DECISION: licence compatible with DRA academic benchmark — VERIFIED",
  ],
  notes:
    "DRA-ACQ-007 human governance sign-off 2026-08-06. " +
    "BoE non-commercial academic use permission VERIFIED for DRA benchmark corpus.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title: "Model risk management principles for banks",
  publisher: "Prudential Regulation Authority (PRA), Bank of England",
  publicationDate: "2023-05-17",
  domain: "FINANCE" as const,
  documentType: "OTHER" as const,
  difficulty: "MEDIUM" as const,
  language: "en",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "First FINANCE-domain document from a real-world regulatory publisher. " +
  "Adds the Prudential Regulation Authority (PRA) as a new institution not in corpus. " +
  "FINANCE domain: banking supervisory statement on model risk management; " +
  "distinct from all existing entries (DRA-DOC-0005 is AI_GENERATED FINANCE). " +
  "HUMAN_AUTHORED regulatory guidance with 5 high-level principles and specific requirements. " +
  "References regulatory standards (Basel framework, CRR, IRB approval) that the evaluator " +
  "will attempt to trace — provides evidence linkage patterns from a regulatory context. " +
  "Single-document PDF acquisition; SS1/23 is a standalone supervisory statement. " +
  "BoE copyright with non-commercial academic use permission — compatible with DRA corpus.";

// ---------------------------------------------------------------------------
// Corpus entries for DRA-DOC-0007–0011 (reconstructed from admitted records)
// Mirrors the ENTRY_* constants in DRA-BMK-011 for consistent 11-doc registry.
// ---------------------------------------------------------------------------

const ENTRY_0007: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0007",
  title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en",
  generator: "The Apache Software Foundation",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html",
  sourceReference: "https://httpd.apache.org/docs/2.4/howto/auth.html",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000001. " +
    "Freeze record: DRA-FRZ-000001. " +
    "Publication date: 2026-06-19. " +
    "Version: 2.4.",
};

const ENTRY_0008: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0008",
  title: "Discipline and grievances at work: the Acas guide",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "BUSINESS",
  language: "en-GB",
  generator: "Advisory, Conciliation and Arbitration Service (Acas)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  sourceReference:
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "LOW",
  notes:
    "Acquisition ID: DRA-ACQ-000002. " +
    "Freeze record: DRA-FRZ-000002. " +
    "Source digest: a4c10388a0dcfd54… " +
    "Publication date: 2020-07.",
};

const ENTRY_0009: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0009",
  title: "AI Foundation Models: Short Version",
  sourceType: "HUMAN_AUTHORED",
  documentType: "SUMMARY",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  sourceReference:
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000008. " +
    "Freeze record: DRA-FRZ-000003. " +
    "Source digest: e7fb5008e9b407bc… " +
    "Publication date: 2023-09-18.",
};

const ENTRY_0010: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0010",
  title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en",
  generator: "National Institute of Standards and Technology (NIST)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000012. " +
    "Freeze record: DRA-FRZ-000004. " +
    "Source digest: 7576edb531d98488… " +
    "Publication date: 2023-01-26.",
};

const ENTRY_0011: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0011",
  title: "Guidance on AI and data protection",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "LEGAL",
  language: "en",
  generator: "Information Commissioner's Office (ICO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (multi-page HTML, 14 sections) from " +
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  sourceReference:
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000013. " +
    "Freeze record: DRA-FRZ-000005. " +
    "Source digest: b3b98f13548c165a… " +
    "Multi-page HTML; 14 sections; TEXT_STABLE. " +
    "Publication date: 2025-09-22.",
};

// ---------------------------------------------------------------------------
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001–0011, all 11 admitted documents)
// ---------------------------------------------------------------------------

async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
): Promise<readonly string[]> {
  const encoder = new TextEncoder();
  const texts: string[] = [];

  // DRA-DOC-0001–0006: from BENCHMARK_CORPUS (no network)
  for (const entry of BENCHMARK_CORPUS) {
    const bytes = encoder.encode(entry.generatedText);
    const digest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", digest);
    if (result.ok) texts.push(result.document.text);
  }

  // DRA-DOC-0007: Apache HTTP Server guide (fixture, no network)
  const apacheBytes = encoder.encode(APACHE_HTTPD_AUTH_HTML);
  const apacheDigest = computeSourceDigest(apacheBytes);
  const apacheResult = await normaliseContent(apacheBytes, "text/html", apacheDigest);
  if (apacheResult.ok) texts.push(apacheResult.document.text);

  // DRA-DOC-0008: Acas guide (live fetch)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl:
      "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-007-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
    expectedTitle: "Discipline and grievances at work: the Acas guide",
  });
  if (acasReq.ok) {
    const acasFetch = await fetcher(acasReq.request, {});
    if (acasFetch.ok) {
      const d = computeSourceDigest(acasFetch.source.rawBytes);
      const n = await normaliseContent(acasFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (live fetch)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl:
      "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-007-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "Competition and Markets Authority",
    expectedTitle: "AI Foundation Models: Short Version",
  });
  if (cmaReq.ok) {
    const cmaFetch = await fetcher(cmaReq.request, {});
    if (cmaFetch.ok) {
      const d = computeSourceDigest(cmaFetch.source.rawBytes);
      const n = await normaliseContent(cmaFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0010: NIST AI RMF 1.0 (live fetch)
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-007-admission-corpus-check",
    requestedAt: FREEZE_TIMESTAMP,
    expectedPublisher: "National Institute of Standards and Technology (NIST)",
    expectedTitle: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  });
  if (nistReq.ok) {
    const nistFetch = await fetcher(nistReq.request, {});
    if (nistFetch.ok) {
      const d = computeSourceDigest(nistFetch.source.rawBytes);
      const n = await normaliseContent(nistFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0011: ICO AI and data protection guidance (multi-page HTML, 14 sections)
  const icoPageTexts: string[] = [];
  for (const url of ICO_SECTION_URLS) {
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: url,
      requestedBy: "DRA-ACQ-007-admission-corpus-check",
      requestedAt: FREEZE_TIMESTAMP,
      expectedPublisher: "Information Commissioner's Office (ICO)",
      expectedTitle: "Guidance on AI and data protection",
    });
    if (icoReq.ok) {
      const icoFetch = await fetcher(icoReq.request, {});
      if (icoFetch.ok) {
        const d = computeSourceDigest(icoFetch.source.rawBytes);
        const n = await normaliseContent(icoFetch.source.rawBytes, "text/html", d);
        if (n.ok) icoPageTexts.push(n.document.text);
      }
    }
  }
  if (icoPageTexts.length > 0) {
    const combined = icoPageTexts.join(SECTION_SEPARATOR);
    const combinedBytes = encoder.encode(combined);
    const combinedDigest = computeSourceDigest(combinedBytes);
    const combinedNorm = await normaliseContent(combinedBytes, "text/plain", combinedDigest);
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  return Object.freeze(texts);
}

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-007 — Controlled Corpus Admission for DRA-DOC-0012 (PRA SS1/23 Model Risk Management)",
  () => {
    it(
      "admits DRA-DOC-0012 (PRA SS1/23, PDF) through eligibility, " +
        "freeze, and consolidated 12-document corpus integration (stops before evaluator)",
      async () => {
        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-007 — CORPUS ADMISSION LOG                       ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );

        // ── Step 1: Setup — build 11-document registry ─────────────────────

        console.log("── Step 1: Setup — Build 11-Document Registry ──────────────");

        const registry = new CorpusRegistry();

        // DRA-DOC-0001–0006: initial-corpus governance
        for (const entry of BENCHMARK_CORPUS) {
          registry.add(entry.input);
        }
        // DRA-DOC-0007–0011: freeze-record governance
        registry.add(ENTRY_0007);
        registry.add(ENTRY_0008);
        registry.add(ENTRY_0009);
        registry.add(ENTRY_0010);
        registry.add(ENTRY_0011);

        console.log(`  11-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(11);
        expect(registry.hasId("DRA-DOC-0012")).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-007",
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
        });

        // ── Step 2: Acquisition request ────────────────────────────────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000014) ────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000014",
          sourceUrl: PRA_PDF_URL,
          requestedBy: "DRA-ACQ-007-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Prudential Regulation Authority (PRA), Bank of England",
          expectedTitle: "Model risk management principles for banks",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        // ── Step 3: Fetch PRA SS1/23 PDF ────────────────────────────────────

        console.log("\n── Step 3: Fetch PRA SS1/23 PDF (live network) ─────────────");

        const fetchResult = await fetcher(request, {});

        if (!fetchResult.ok) {
          console.error("PRA fetch FAILED:", fetchResult.code, fetchResult.message);
        }
        expect(fetchResult.ok).toBe(true);
        if (!fetchResult.ok) return;

        const source = fetchResult.source;

        console.log("  httpStatus      :", source.httpStatus);
        console.log("  mediaType       :", source.mediaType);
        console.log("  rawByteLength   :", source.rawBytes.length);
        console.log("  finalUrl        :", source.finalUrl);

        expect(source.httpStatus).toBe(200);
        expect(source.mediaType).toBe("application/pdf");

        // ── Step 4: Source digest verification ─────────────────────────────

        console.log("\n── Step 4: Source Digest Verification ──────────────────────");

        const sourceDigest = computeSourceDigest(source.rawBytes);

        console.log("  reference :", REFERENCE_SOURCE_DIGEST);
        console.log("  current   :", sourceDigest);

        if (sourceDigest !== REFERENCE_SOURCE_DIGEST) {
          console.error("SOURCE DIGEST MISMATCH — source has changed since preparation. Stop.");
        }
        expect(sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(source.rawBytes.length).toBe(1096596);

        console.log("  ✓ Source digest matches reference — BYTE_STABLE confirmed");

        // ── Step 5: Normalisation ───────────────────────────────────────────

        console.log("\n── Step 5: Normalisation (pdftotext) ───────────────────────");

        const normaliseResult = await normaliseContent(
          source.rawBytes,
          "application/pdf",
          sourceDigest,
          extractPdfText,
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

        // ── Step 6: Text digest verification ───────────────────────────────

        console.log("\n── Step 6: Text Digest Verification ────────────────────────");
        console.log("  reference :", REFERENCE_TEXT_DIGEST);
        console.log("  current   :", normalised.textDigest);

        if (normalised.textDigest !== REFERENCE_TEXT_DIGEST) {
          console.error("TEXT DIGEST MISMATCH — normalisation differs from preparation. Stop.");
        }
        expect(normalised.textDigest).toBe(REFERENCE_TEXT_DIGEST);

        console.log("  ✓ Text digest matches preparation reference");

        // ── Step 7: Build existing corpus texts (DRA-DOC-0001–0011) ────────

        console.log("\n── Step 7: Build Existing Corpus Texts (DRA-DOC-0001–0011) ─");

        const existingCorpusTexts = await buildExistingCorpusTexts(fetcher);

        console.log("  Existing corpus texts built:", existingCorpusTexts.length, "of 11");
        expect(existingCorpusTexts.length).toBe(11);

        // ── Step 8: Freeze eligibility check (all 13 must pass) ────────────

        console.log(
          "\n── Step 8: Freeze Eligibility (13 checks — all must PASS) ──",
        );

        const eligibility = checkFreezeEligibility(
          source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0012",
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
          console.error("\n  ELIGIBILITY FAILED — blocking reasons:");
          for (const reason of (eligibility as { blockingReasons: readonly string[] }).blockingReasons) {
            console.error("    •", reason);
          }
          expect(eligibility.eligible).toBe(true);
          return;
        }

        console.log("\n  All 13 checks PASSED ✓");
        console.log(
          "  passed:",
          eligibility.checks.filter((c) => c.passed).length,
          "/ 13",
        );

        expect(eligibility.eligible).toBe(true);
        expect(eligibility.checks.filter((c) => c.passed).length).toBe(13);

        // ── Step 9: Compute metadata digest ───────────────────────────────

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);

        console.log("\n── Step 9: Metadata Digest ─────────────────────────────────");
        console.log("  metadataDigest:", metadataDigest);
        expect(metadataDigest).toMatch(/^[0-9a-f]{64}$/);

        // ── Step 10: Create freeze record (DRA-FRZ-000006) ─────────────────

        console.log(
          "\n── Step 10: Create Freeze Record (DRA-FRZ-000006) ──────────",
        );

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000006",
          corpusDocumentId: "DRA-DOC-0012",
          acquisitionId: request.acquisitionId,
          sourceUrl: request.sourceUrl,
          finalUrl: source.finalUrl,
          sourceDigest,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-007-freeze-operator",
          benchmarkVersion: "DRA-CORPUS-1.0.0",
          fixedTimestamp: FREEZE_TIMESTAMP,
        });

        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  frozenAt             :", freezeRecord.frozenAt);
        console.log("  frozenBy             :", freezeRecord.frozenBy);
        console.log("  benchmarkVersion     :", freezeRecord.benchmarkVersion);

        // ── Step 11: Verify freeze record integrity ──────────────────────

        console.log("\n── Step 11: Freeze Record Integrity ────────────────────────");

        const freezeRecordValid = verifyAcquisitionFreezeRecordDigest(freezeRecord);

        console.log(
          "  verifyAcquisitionFreezeRecordDigest:",
          freezeRecordValid ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  sourceDigest matches reference     :",
          freezeRecord.sourceDigest === REFERENCE_SOURCE_DIGEST ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  textDigest matches reference       :",
          freezeRecord.normalisedTextDigest === REFERENCE_TEXT_DIGEST ? "PASS ✓" : "FAIL ✗",
        );

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000006");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0012");
        expect(freezeRecord.frozenBy).toBe("DRA-ACQ-007-freeze-operator");
        expect(freezeRecord.benchmarkVersion).toBe("DRA-CORPUS-1.0.0");
        expect(freezeRecord.sourceDigest).toBe(REFERENCE_SOURCE_DIGEST);
        expect(freezeRecord.normalisedTextDigest).toBe(REFERENCE_TEXT_DIGEST);
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecordValid).toBe(true);

        // ── Step 12: Corpus integration — register DRA-DOC-0012 ──────────

        console.log(
          "\n── Step 12: Corpus Integration (register DRA-DOC-0012) ────",
        );

        const integrationResult = integrateWithCorpus(
          freezeRecord,
          APPROVED_METADATA,
          registry,
        );

        if (!integrationResult.ok) {
          console.error(
            "Corpus integration FAILED:",
            integrationResult.code,
            integrationResult.message,
          );
          expect(integrationResult.ok).toBe(true);
          return;
        }

        const { manifest, manifestDigest } = integrationResult;

        console.log("  schemaVersion  :", manifest.schemaVersion);
        console.log("  corpusVersion  :", manifest.corpusVersion);
        console.log("  documentCount  :", manifest.documentCount);
        console.log("  overallDigest  :", manifest.overallDigest);
        console.log("  manifestDigest :", manifestDigest);

        expect(integrationResult.ok).toBe(true);
        expect(manifest.documentCount).toBe(12);
        expect(manifest.overallDigest).toBeTruthy();
        expect(manifestDigest).toBe(manifest.overallDigest);

        // ── Step 13: Registry and manifest integrity verification ─────────

        console.log(
          "\n── Step 13: Registry and Manifest Integrity Verification ───",
        );

        const registryHasDoc = registry.hasId("DRA-DOC-0012");
        const manifestIntact = verifyManifestIntegrity(manifest);
        const manifestRoundTrip =
          registry.exportManifest().overallDigest === manifestDigest;

        console.log(
          "  DRA-DOC-0012 in registry        :",
          registryHasDoc ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest integrity (hash check) :",
          manifestIntact ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  manifest digest round-trips     :",
          manifestRoundTrip ? "PASS ✓" : "FAIL ✗",
        );
        console.log(
          "  12-document count (11+1)        :",
          manifest.documentCount === 12 ? "PASS ✓" : "FAIL ✗",
        );

        expect(registryHasDoc).toBe(true);
        expect(manifestIntact).toBe(true);
        expect(manifestRoundTrip).toBe(true);
        expect(manifest.documentCount).toBe(12);

        // ── Step 14: Near-duplicate and corpus-ID results ─────────────────

        console.log("\n── Step 14: Near-Duplicate and Corpus-ID Results ───────────");

        const nearDupCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_NEAR_DUPLICATE",
        );
        const dupIdCheck = eligibility.checks.find(
          (c) => c.checkId === "NO_DUPLICATE_CORPUS_ID",
        );

        console.log(
          "  NO_NEAR_DUPLICATE    :",
          nearDupCheck?.passed ? "PASS ✓" : "FAIL ✗",
          nearDupCheck?.detail ?? "",
        );
        console.log(
          "  NO_DUPLICATE_CORPUS_ID:",
          dupIdCheck?.passed ? "PASS ✓" : "FAIL ✗",
          dupIdCheck?.detail ?? "",
        );
        console.log(
          "  Near-duplicate scope : 11 texts (DRA-DOC-0001 through DRA-DOC-0011)",
        );

        expect(nearDupCheck?.passed).toBe(true);
        expect(dupIdCheck?.passed).toBe(true);

        // ── Admission summary ──────────────────────────────────────────────

        console.log("\n── Admission Summary ───────────────────────────────────────");
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  title                :", APPROVED_METADATA.title);
        console.log("  publisher            :", APPROVED_METADATA.publisher);
        console.log("  publicationDate      :", APPROVED_METADATA.publicationDate);
        console.log("  domain               :", APPROVED_METADATA.domain);
        console.log("  documentType         :", APPROVED_METADATA.documentType);
        console.log("  difficulty           :", APPROVED_METADATA.difficulty);
        console.log("  language             :", APPROVED_METADATA.language);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  frozenAt             :", freezeRecord.frozenAt);
        console.log("  benchmarkVersion     :", freezeRecord.benchmarkVersion);
        console.log("  manifestDigest       :", manifestDigest);
        console.log("  ─── Eligibility ───");
        console.log("  total checks   : 13");
        console.log(
          "  passed         :",
          eligibility.checks.filter((c) => c.passed).length,
        );
        console.log(
          "  failed         :",
          eligibility.checks.filter((c) => !c.passed).length,
        );
        console.log("  ─── Governance ───");
        console.log("  officialSourceStatus :", OFFICIAL_SOURCE_ASSESSMENT.status);
        console.log("  licenceStatus        :", LICENCE_ASSESSMENT.status);
        console.log("  licenceBasis         :", LICENCE_ASSESSMENT.licenceBasis);
        console.log("  licenceName          :", LICENCE_ASSESSMENT.licenceName);
        console.log("  ─── Near-Duplicate ───");
        console.log("  scope          : DRA-DOC-0001 through DRA-DOC-0011 (11 documents)");
        console.log("  result         : NO_NEAR_DUPLICATE — PASS ✓");

        console.log("\n  EVALUATOR WAS NOT EXECUTED");
        console.log("  PROOF RECEIPT WAS NOT GENERATED");
        console.log("  NO ASSURANCE DECISION WAS PRODUCED");
        console.log("  DRA-CASE INFRASTRUCTURE WAS NOT CREATED");
        console.log("  DRA-DOC-0001 THROUGH DRA-DOC-0011: NOT MODIFIED");

        console.log(
          "\n╔══════════════════════════════════════════════════════════╗",
        );
        console.log(
          "║  DRA-ACQ-007 — ALL ADMISSION CHECKS PASSED                ║",
        );
        console.log(
          "║  DRA-DOC-0012 ADMITTED AND FROZEN (DRA-FRZ-000006)        ║",
        );
        console.log(
          "╚══════════════════════════════════════════════════════════╝\n",
        );
      },
      720_000, // 12 minutes
    );
  },
);
