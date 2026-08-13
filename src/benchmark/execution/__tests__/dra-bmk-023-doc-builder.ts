/**
 * DRA-BMK-023 test support — 23-document corpus reconstruction.
 *
 * Reuses the DRA-BMK-022 text-cache pattern for DRA-DOC-0001..0022 (that
 * cache is disk-backed and persists across sessions at
 * .cache/dra-bmk-022/*.json, so no network re-fetch is required for those
 * 16 live-acquired documents) and adds DRA-DOC-0023 (CMA Case 51098) via its
 * own disk-cached fetch (cacheName "dra-bmk-023").
 *
 * Run `npx tsx dra-bmk-023-doc-builder.ts` once, out-of-band, to populate
 * TEXT_CACHE_PATH. `buildAllDocsFromCache()` then assembles the full
 * 23-document BenchmarkExecutionDocument array with no network calls,
 * safe to import from inside vitest workers.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import type { BenchmarkExecutionDocument } from "../runner.js";
import { loadBenchmarkCorpus } from "../../evidence/corpus-loader.js";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import { TEXT_CACHE_PATH as BMK022_TEXT_CACHE_PATH } from "./dra-bmk-022-doc-builder.js";
import { BMK023_SCRATCH_DIR } from "./dra-bmk-023-shared.js";

// NOTE: workspace-local scratch dir, not os.tmpdir() — /tmp has been
// observed to be cleared across sandbox restarts mid-run.
export const TEXT_CACHE_PATH = join(BMK023_SCRATCH_DIR, "dra-bmk-023-text-cache.json");

const CMA_URL =
  "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf";

export const REF_CMA_SOURCE_DIGEST =
  "639f9be33be9b3bf7008368f975349f4188a0bb5e42a42531766725cbccbd115";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-bmk023-builder-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

interface Bmk022TextCache {
  readonly builtAt: string;
  readonly eeaSourceDigestLive: string;
  readonly texts: Record<string, string>;
}

interface TextCache {
  readonly builtAt: string;
  readonly cmaSourceDigestLive: string;
  readonly texts: Record<string, string>; // DRA-DOC-0007..0023
}

/**
 * Builds TEXT_CACHE_PATH: DRA-DOC-0007..0022 texts are read from the
 * existing DRA-BMK-022 cache file (rebuilding it first, out-of-band, if it
 * is not already present); DRA-DOC-0023 is fetched fresh (disk-cached).
 */
export async function buildTextCache(): Promise<void> {
  if (!existsSync(BMK022_TEXT_CACHE_PATH)) {
    throw new Error(
      `DRA-BMK-022 text cache not found at ${BMK022_TEXT_CACHE_PATH}. ` +
        `Run: npx tsx src/benchmark/execution/__tests__/dra-bmk-022-doc-builder.ts first.`,
    );
  }
  const bmk022Cache = JSON.parse(await readFile(BMK022_TEXT_CACHE_PATH, "utf-8")) as Bmk022TextCache;

  console.log("── Fetching DRA-DOC-0023 (CMA Case 51098, disk-cached)… ─");
  const realFetcher = createHttpFetcher({
    timeoutMs: 180_000,
    maxRedirects: 5,
    maxBytes: 15_000_000,
    userAgent: "DRA-BMK-023-builder/1.0",
  });
  const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-023");
  const req = {
    acquisitionId: "DRA-ACQ-000026",
    sourceUrl: CMA_URL,
    requestedBy: "DRA-BMK-023-builder",
    requestedAt: new Date().toISOString(),
    expectedPublisher: "Competition and Markets Authority (CMA)",
    expectedTitle: "Anti-competitive conduct in relation to vehicle recycling",
  };
  const fetchRes = await fetcher(req as any, {});
  if (!fetchRes.ok) throw new Error(`DRA-DOC-0023 fetch failed: ${(fetchRes as any).code}`);
  const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
  const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
  if (!norm.ok) throw new Error(`DRA-DOC-0023 normalisation failed: ${(norm as any).message}`);

  const texts: Record<string, string> = { ...bmk022Cache.texts, "DRA-DOC-0023": norm.document.text };

  const cache: TextCache = {
    builtAt: new Date().toISOString(),
    cmaSourceDigestLive: srcDigest,
    texts,
  };
  await mkdir(BMK023_SCRATCH_DIR, { recursive: true }).catch(() => {});
  await writeFile(TEXT_CACHE_PATH, JSON.stringify(cache), "utf-8");
  console.log(`Text cache written to ${TEXT_CACHE_PATH} (${Object.keys(texts).length} documents)`);
  console.log(`DRA-DOC-0023 live source digest: ${srcDigest}`);
  console.log(`DRA-DOC-0023 frozen reference:   ${REF_CMA_SOURCE_DIGEST}`);
  console.log(`Match: ${srcDigest === REF_CMA_SOURCE_DIGEST ? "FROZEN_REPRESENTATION_CONFIRMED" : "LIVE_CONTENT_CHANGE_OBSERVED"}`);
  console.log(`DRA-DOC-0023 normalised text length: ${norm.document.text.length} chars`);
}

export interface BuiltCorpus {
  readonly allDocs: BenchmarkExecutionDocument[];
  readonly cmaSourceDigestLive: string;
  readonly cmaTextLength: number;
}

const CMA_TITLE =
  "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling and " +
  "advertising of recycling-related features (Case 51098)";

/**
 * Reads TEXT_CACHE_PATH (populated by buildTextCache(), run out-of-band) and
 * assembles the full 23-document BenchmarkExecutionDocument array. Throws if
 * the cache is missing.
 */
export async function buildAllDocsFromCache(): Promise<BuiltCorpus> {
  if (!existsSync(TEXT_CACHE_PATH)) {
    throw new Error(
      `DRA-BMK-023 text cache not found at ${TEXT_CACHE_PATH}. Run: npx tsx src/benchmark/execution/__tests__/dra-bmk-023-doc-builder.ts`,
    );
  }
  const raw = await readFile(TEXT_CACHE_PATH, "utf-8");
  const cache = JSON.parse(raw) as TextCache;
  const t = cache.texts;

  const loaded = loadBenchmarkCorpus();
  if (!loaded.ok) throw new Error(`loadBenchmarkCorpus failed: ${loaded.message}`);
  const initialDocs = [...loaded.documents];

  const mk = (
    corpusId: string, title: string, sourceType: string, documentType: string, domain: string, language: string,
    generator: string, sourceReference: string, difficulty: string, integrityDigestChar: string, text: string,
    creationMethod: string,
  ): BenchmarkExecutionDocument => ({
    corpusDocument: {
      corpusId: corpusId as any, title, sourceType: sourceType as any, documentType: documentType as any,
      domain: domain as any, language, generator, generatorVersion: "DRA-CORPUS-1.0.0",
      creationMethod, sourceReference, benchmarkStatus: "FROZEN" as any, difficulty: difficulty as any,
      integrityDigest: integrityDigestChar.repeat(64),
    } as any,
    generatedText: text, sourceText: text,
  });

  // DRA-DOC-0007..0022 — identical construction to dra-bmk-022-doc-builder.ts
  const ACAS_URL = "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";
  const CMA9_URL = "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf";
  const NIST_URL = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
  const PRA_URL = "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf";
  const FDA_URL = "https://www.fda.gov/media/145022/download";
  const BIS_URL = "https://www.bis.org/bcbs/publ/d516.pdf";
  const NCSC_URL = "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";
  const MHRA_URL = "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";
  const EC_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";
  const HLEG_EN_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419";
  const INE_URL = "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf";
  const CNIL_URL = "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf";
  const EEA_URL = "https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file";
  const ICO_LANDING_URL = "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/";
  const HSE_LANDING_URL = "https://www.hse.gov.uk/simple-health-safety/";

  const doc7  = mk("DRA-DOC-0007", "Authentication and Authorization - Apache HTTP Server Version 2.4", "HUMAN_AUTHORED", "ARTICLE", "TECHNICAL", "en", "The Apache Software Foundation", "https://httpd.apache.org/docs/2.4/howto/auth.html", "MEDIUM", "a", t["DRA-DOC-0007"], "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html");
  const doc8  = mk("DRA-DOC-0008", "Discipline and grievances at work: the Acas guide", "HUMAN_AUTHORED", "PROCEDURE", "BUSINESS", "en-GB", "Advisory, Conciliation and Arbitration Service (Acas)", ACAS_URL, "LOW", "b", t["DRA-DOC-0008"], `Public document acquisition via DRA-ENG-009 from ${ACAS_URL}`);
  const doc9  = mk("DRA-DOC-0009", "AI Foundation Models: Short Version", "HUMAN_AUTHORED", "SUMMARY", "GENERAL", "en-GB", "Competition and Markets Authority", CMA9_URL, "MEDIUM", "c", t["DRA-DOC-0009"], `Public document acquisition via DRA-ENG-009 from ${CMA9_URL}`);
  const doc10 = mk("DRA-DOC-0010", "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", "HUMAN_AUTHORED", "POLICY", "TECHNICAL", "en", "National Institute of Standards and Technology (NIST)", NIST_URL, "HIGH", "d", t["DRA-DOC-0010"], `Public document acquisition via DRA-ENG-009 from ${NIST_URL}`);
  const doc11 = mk("DRA-DOC-0011", "Guidance on AI and data protection", "HUMAN_AUTHORED", "OTHER", "LEGAL", "en", "Information Commissioner's Office (ICO)", ICO_LANDING_URL, "HIGH", "e", t["DRA-DOC-0011"], `Public document acquisition via DRA-ENG-009 from ${ICO_LANDING_URL} (14 sections, multi-page HTML)`);
  const doc12 = mk("DRA-DOC-0012", "Model risk management principles for banks", "HUMAN_AUTHORED", "OTHER", "FINANCE", "en", "Prudential Regulation Authority (PRA), Bank of England", PRA_URL, "MEDIUM", "f", t["DRA-DOC-0012"], `Public document acquisition via DRA-ENG-009 from ${PRA_URL}`);
  const doc13 = mk("DRA-DOC-0013", "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan", "HUMAN_AUTHORED", "POLICY", "HEALTHCARE", "en", "U.S. Food and Drug Administration (FDA)", FDA_URL, "MEDIUM", "0", t["DRA-DOC-0013"], `Public document acquisition via DRA-ENG-009 from ${FDA_URL}`);
  const doc14 = mk("DRA-DOC-0014", "Principles for Operational Resilience", "HUMAN_AUTHORED", "POLICY", "FINANCE", "en", "Basel Committee on Banking Supervision (BCBS)", BIS_URL, "HIGH", "1", t["DRA-DOC-0014"], `Public document acquisition via DRA-ENG-009 from ${BIS_URL}`);
  const doc15 = mk("DRA-DOC-0015", "Principles for the security of machine learning", "HUMAN_AUTHORED", "OTHER", "TECHNICAL", "en", "National Cyber Security Centre (NCSC)", NCSC_URL, "HIGH", "2", t["DRA-DOC-0015"], `Public document acquisition via DRA-ENG-009 from ${NCSC_URL}`);
  const doc16 = mk("DRA-DOC-0016", "Health and safety basics for your business", "HUMAN_AUTHORED", "PROCEDURE", "BUSINESS", "en-GB", "Health and Safety Executive (HSE)", HSE_LANDING_URL, "LOW", "3", t["DRA-DOC-0016"], `Public document acquisition via DRA-ENG-009 from ${HSE_LANDING_URL} (26 pages, multi-page HTML)`);
  const doc17 = mk("DRA-DOC-0017", "Best practice guidance on patient information leaflets (PILs)", "HUMAN_AUTHORED", "PROCEDURE", "HEALTHCARE", "en-GB", "Medicines and Healthcare products Regulatory Agency (MHRA)", MHRA_URL, "MEDIUM", "4", t["DRA-DOC-0017"], `Public document acquisition via DRA-ENG-009 from ${MHRA_URL}`);
  const doc18 = mk("DRA-DOC-0018", "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)", "HUMAN_AUTHORED", "REPORT", "TECHNICAL", "es", "European Commission — High-Level Expert Group on Artificial Intelligence", EC_URL, "HIGH", "5", t["DRA-DOC-0018"], `Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from ${EC_URL}`);
  const doc19 = mk("DRA-DOC-0019", "Informe de la Revisión por Pares (Peer Review Report — Spain's compliance with the European Statistics Code of Practice)", "HUMAN_AUTHORED", "REPORT", "GENERAL", "es", "Instituto Nacional de Estadística (INE)", INE_URL, "MEDIUM", "6", t["DRA-DOC-0019"], `Public document acquisition via DRA-ENG-009 from ${INE_URL}`);
  const doc20 = mk("DRA-DOC-0020", "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle", "HUMAN_AUTHORED", "REPORT", "LEGAL", "fr", "Commission Nationale de l'Informatique et des Libertés (CNIL)", CNIL_URL, "HIGH", "7", t["DRA-DOC-0020"], `Public document acquisition via DRA-ENG-009 from ${CNIL_URL}`);
  const doc21 = mk("DRA-DOC-0021", "Ethics Guidelines for Trustworthy AI", "HUMAN_AUTHORED", "REPORT", "TECHNICAL", "en", "European Commission — High-Level Expert Group on Artificial Intelligence", HLEG_EN_URL, "HIGH", "8", t["DRA-DOC-0021"], `Public document acquisition via DRA-ENG-009 from ${HLEG_EN_URL}`);
  const doc22 = mk("DRA-DOC-0022", "Tracking waste prevention progress — A narrative-based waste prevention monitoring framework at the EU level", "HUMAN_AUTHORED", "REPORT", "GENERAL", "en", "European Environment Agency (EEA)", EEA_URL, "HIGH", "9", t["DRA-DOC-0022"], `Public document acquisition via DRA-ENG-009 from ${EEA_URL}`);
  const doc23 = mk("DRA-DOC-0023", CMA_TITLE, "HUMAN_AUTHORED", "OTHER", "GENERAL", "en-GB", "Competition and Markets Authority (CMA)", CMA_URL, "HIGH", "g", t["DRA-DOC-0023"], `Public document acquisition via DRA-ENG-009 from ${CMA_URL}`);

  const allDocs = [...initialDocs, doc7, doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15, doc16, doc17, doc18, doc19, doc20, doc21, doc22, doc23];
  allDocs.sort((a, b) => parseInt(a.corpusDocument.corpusId.slice(-4), 10) - parseInt(b.corpusDocument.corpusId.slice(-4), 10));

  return {
    allDocs,
    cmaSourceDigestLive: cache.cmaSourceDigestLive,
    cmaTextLength: t["DRA-DOC-0023"]?.length ?? 0,
  };
}

// Allow running this module directly via `npx tsx dra-bmk-023-doc-builder.ts`
const isMain = process.argv[1] && process.argv[1].endsWith("dra-bmk-023-doc-builder.ts");
if (isMain) {
  buildTextCache()
    .then(() => { console.log("buildTextCache() completed successfully."); process.exit(0); })
    .catch((err) => { console.error("buildTextCache() FAILED:", err); process.exit(1); });
}
