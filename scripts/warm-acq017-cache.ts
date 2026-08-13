/**
 * One-off cache warmer for the DRA-ACQ-017 Phase 2 admission test.
 * Pre-populates the disk cache (see __tests__/support/disk-cached-fetcher.ts)
 * with the sources needed to reconstruct the existing 20-document corpus,
 * chunked so each invocation fits comfortably under a 300s shell budget.
 *
 * Usage: pnpm exec tsx scripts/warm-acq017-cache.ts <chunk-name>
 */

import { createHttpFetcher } from "../src/benchmark/acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../src/benchmark/acquisition/__tests__/support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../src/benchmark/acquisition/request.js";

const ICO_BASE = "https://ico.org.uk";
const ICO_GUIDANCE_BASE =
  "/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection";
const ICO_SECTION_SLUGS: readonly string[] = [
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
const ICO_SECTION_URLS = ICO_SECTION_SLUGS.map((slug) => `${ICO_BASE}${ICO_GUIDANCE_BASE}${slug}`);

const HSE_BASE = "https://www.hse.gov.uk/simple-health-safety";
const HSE_PAGE_URLS: readonly string[] = [
  `${HSE_BASE}/`,
  `${HSE_BASE}/policy/index.htm`,
  `${HSE_BASE}/policy/how-to-write-your-policy.htm`,
  `${HSE_BASE}/policy/the-law.htm`,
  `${HSE_BASE}/risk/index.htm`,
  `${HSE_BASE}/risk/steps-needed-to-manage-risk.htm`,
  `${HSE_BASE}/risk/risk-assessment-template-and-examples.htm`,
  `${HSE_BASE}/risk/common-workplace-risks.htm`,
  `${HSE_BASE}/risk/more-detail-on-managing-risk.htm`,
  `${HSE_BASE}/reporting-accidents-ill-health.htm`,
  `${HSE_BASE}/training/index.htm`,
  `${HSE_BASE}/training/decide.htm`,
  `${HSE_BASE}/training/needs.htm`,
  `${HSE_BASE}/training/supervision.htm`,
  `${HSE_BASE}/consult.htm`,
  `${HSE_BASE}/workplace-facilities/index.htm`,
  `${HSE_BASE}/workplace-facilities/health-safety.htm`,
  `${HSE_BASE}/workplace-facilities/welfare.htm`,
  `${HSE_BASE}/firstaid/index.htm`,
  `${HSE_BASE}/firstaid/assess-business-need.htm`,
  `${HSE_BASE}/firstaid/first-aid-appoint-someone.htm`,
  `${HSE_BASE}/firstaid/first-aid-home-workers.htm`,
  `${HSE_BASE}/firstaid/first-aid-training.htm`,
  `${HSE_BASE}/firstaid/what-to-put-in-your-first-aid-kit.htm`,
  `${HSE_BASE}/display.htm`,
  `${HSE_BASE}/gettinghelp/index.htm`,
];

const CHUNKS: Record<string, { id: string; url: string }[]> = {
  singles1: [
    {
      id: "DRA-ACQ-000002",
      url: "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
    },
    {
      id: "DRA-ACQ-000008",
      url: "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
    },
    { id: "DRA-ACQ-000012", url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf" },
    {
      id: "DRA-ACQ-000014",
      url: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
    },
  ],
  singles2: [
    { id: "DRA-ACQ-000015", url: "https://www.fda.gov/media/145022/download" },
    { id: "DRA-ACQ-000016", url: "https://www.bis.org/bcbs/publ/d516.pdf" },
    {
      id: "DRA-ACQ-000018",
      url: "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf",
    },
    {
      id: "DRA-ACQ-000020",
      url: "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf",
    },
  ],
  singles3: [
    { id: "DRA-ACQ-000021", url: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423" },
    { id: "DRA-ACQ-000022", url: "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf" },
    {
      id: "DRA-ACQ-000023",
      url: "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf",
    },
  ],
  ico1: ICO_SECTION_URLS.slice(0, 7).map((url) => ({ id: "DRA-ACQ-000013", url })),
  ico2: ICO_SECTION_URLS.slice(7).map((url) => ({ id: "DRA-ACQ-000013", url })),
  hse1: HSE_PAGE_URLS.slice(0, 9).map((url) => ({ id: "DRA-ACQ-000019", url })),
  hse2: HSE_PAGE_URLS.slice(9, 18).map((url) => ({ id: "DRA-ACQ-000019", url })),
  hse3: HSE_PAGE_URLS.slice(18).map((url) => ({ id: "DRA-ACQ-000019", url })),
};

async function main() {
  const chunkName = process.argv[2];
  if (!chunkName || !CHUNKS[chunkName]) {
    console.error("Usage: tsx warm-acq017-cache.ts <chunk-name>");
    console.error("Available chunks:", Object.keys(CHUNKS).join(", "));
    process.exit(1);
  }

  const rawFetcher = createHttpFetcher({
    timeoutMs: 120_000,
    maxRedirects: 5,
    maxBytes: 15_000_000,
    userAgent: "DRA-ENG-010/1.0",
    allowHttp: false,
  });
  const cachedFetcher = createDiskCachedFetcher(rawFetcher);

  const items = CHUNKS[chunkName]!;
  for (const item of items) {
    const reqResult = createAcquisitionRequest({
      acquisitionId: item.id,
      sourceUrl: item.url,
      requestedBy: "DRA-ACQ-017-cache-warmer",
      requestedAt: new Date().toISOString(),
    });
    if (!reqResult.ok) {
      console.error(`SKIP (invalid request): ${item.url}`);
      continue;
    }
    const started = Date.now();
    const result = await cachedFetcher(reqResult.request, {});
    const elapsed = Date.now() - started;
    if (result.ok) {
      console.log(
        `OK   ${item.url} (${result.source.rawBytes.length} bytes, ${elapsed}ms, status ${result.source.httpStatus})`,
      );
    } else {
      console.error(`FAIL ${item.url} — ${result.code}: ${result.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
