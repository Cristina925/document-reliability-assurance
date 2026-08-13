/**
 * DRA-ACQ-010 — Shared helper: existing 14-document corpus texts
 *
 * Rebuilds the normalised text of DRA-DOC-0001 through DRA-DOC-0014 (the
 * 14 currently admitted corpus documents) for near-duplicate checking
 * against a Phase 2 acquisition candidate. Shared between the Phase 2
 * preparation test and the Phase 2 closure test so both exercise the
 * identical corpus-reconstruction logic.
 *
 * Not a test file itself — contains no `describe`/`it` blocks.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../../http-fetcher.js";
import { normaliseContent } from "../../normalisation.js";
import { computeSourceDigest } from "../../integrity.js";
import { createAcquisitionRequest } from "../../request.js";
import { BENCHMARK_CORPUS } from "../../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../../fixtures/apache-httpd-auth-fixture.js";

// ---------------------------------------------------------------------------
// pdftotext extractor (Poppler, Nix system package)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-010-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Build existing corpus texts for near-duplicate check
// (DRA-DOC-0001 through DRA-DOC-0014, all 14 currently admitted documents)
// ---------------------------------------------------------------------------

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";
const ICO_SECTION_SLUGS = [
  "/",
  "/whats-new/",
  "/about-this-guidance/",
  "/what-are-the-accountability-and-governance-implications-of-ai/",
  "/how-do-we-ensure-transparency-in-ai/",
  "/how-do-we-ensure-lawfulness-in-ai/",
  "/what-do-we-need-to-know-about-accuracy-and-statistical-accuracy/",
  "/how-do-we-ensure-fairness-in-ai/",
  "/how-do-we-ensure-fairness-in-ai/what-about-fairness-bias-and-discrimination/",
  "/how-do-we-ensure-fairness-in-ai/what-is-the-impact-of-article-22-of-the-uk-gdpr-on-fairness/",
  "/how-should-we-assess-security-and-data-minimisation-in-ai/",
  "/how-do-we-ensure-individual-rights-in-our-ai-systems/",
  "/annex-a-fairness-in-the-ai-lifecycle/",
  "/glossary/",
];
const ICO_SECTION_SEPARATOR = "\n\n--- SECTION BREAK ---\n\n";

export async function buildExistingCorpusTexts(
  fetcher: ReturnType<typeof createHttpFetcher>,
  requestedAt: string,
): Promise<readonly string[]> {
  const texts: string[] = [];

  // DRA-DOC-0001 through DRA-DOC-0006: initial corpus generatedText
  for (const entry of BENCHMARK_CORPUS) {
    texts.push(entry.generatedText);
  }

  // DRA-DOC-0007: Apache HTTP Server auth documentation (HTML fixture)
  const apache = await normaliseContent(
    new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML),
    "text/html",
    "fixture",
    extractPdfText,
  );
  if (apache.ok) texts.push(apache.document.text);

  // DRA-DOC-0008: Acas Discipline and Grievances guide (PDF, live)
  const acasReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000002",
    sourceUrl: "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
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

  // DRA-DOC-0009: CMA AI Foundation Models Short Version (PDF, live)
  const cmaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000008",
    sourceUrl: "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
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

  // DRA-DOC-0010: NIST AI RMF 1.0 (PDF, live)
  const nistReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000012",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
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
  for (const slug of ICO_SECTION_SLUGS) {
    const sectionUrl = `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`;
    const icoReq = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000013",
      sourceUrl: sectionUrl,
      requestedBy: "DRA-ACQ-010-corpus-check",
      requestedAt,
      expectedPublisher: "Information Commissioner's Office (ICO)",
      expectedTitle: "Guidance on AI and data protection",
    });
    if (icoReq.ok) {
      const icoFetch = await fetcher(icoReq.request, {});
      if (icoFetch.ok) {
        const d = computeSourceDigest(icoFetch.source.rawBytes);
        const n = await normaliseContent(icoFetch.source.rawBytes, "text/html", d, extractPdfText);
        if (n.ok) icoPageTexts.push(n.document.text);
      }
    }
  }
  if (icoPageTexts.length > 0) {
    const combined = icoPageTexts.join(ICO_SECTION_SEPARATOR);
    const combinedNorm = await normaliseContent(
      new TextEncoder().encode(combined),
      "text/plain",
      "ico-combined",
      extractPdfText,
    );
    if (combinedNorm.ok) texts.push(combinedNorm.document.text);
  }

  // DRA-DOC-0012: PRA SS1/23 Model Risk Management (PDF, live)
  const praReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000014",
    sourceUrl: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
    expectedPublisher: "Prudential Regulation Authority (PRA), Bank of England",
    expectedTitle: "Model risk management principles for banks",
  });
  if (praReq.ok) {
    const praFetch = await fetcher(praReq.request, {});
    if (praFetch.ok) {
      const d = computeSourceDigest(praFetch.source.rawBytes);
      const n = await normaliseContent(praFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0013: FDA AI/ML SaMD Action Plan (PDF, live)
  const fdaReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000015",
    sourceUrl: "https://www.fda.gov/media/145022/download",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
    expectedPublisher: "U.S. Food and Drug Administration (FDA)",
    expectedTitle: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  });
  if (fdaReq.ok) {
    const fdaFetch = await fetcher(fdaReq.request, {});
    if (fdaFetch.ok) {
      const d = computeSourceDigest(fdaFetch.source.rawBytes);
      const n = await normaliseContent(fdaFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  // DRA-DOC-0014: BCBS d516 Principles for Operational Resilience (PDF, live)
  const bcbsReq = createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000016",
    sourceUrl: "https://www.bis.org/bcbs/publ/d516.pdf",
    requestedBy: "DRA-ACQ-010-corpus-check",
    requestedAt,
    expectedPublisher: "Basel Committee on Banking Supervision (BCBS)",
    expectedTitle: "Principles for Operational Resilience",
  });
  if (bcbsReq.ok) {
    const bcbsFetch = await fetcher(bcbsReq.request, {});
    if (bcbsFetch.ok) {
      const d = computeSourceDigest(bcbsFetch.source.rawBytes);
      const n = await normaliseContent(bcbsFetch.source.rawBytes, "application/pdf", d, extractPdfText);
      if (n.ok) texts.push(n.document.text);
    }
  }

  return Object.freeze(texts);
}
