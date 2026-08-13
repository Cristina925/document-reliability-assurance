/**
 * DRA-VAL-002 Phase 1 — Frame Construction, Contamination/Eligibility Filtering, Seeded
 * Selection, and Source Freezing.
 *
 * One-off, auditable ACQUISITION SCRIPT (not a test, not part of the DRA evaluation pipeline).
 * Performs real, live network acquisition against real authoritative public sources under the
 * rules frozen in dra-val-002-protocol.ts. Never calls DRA-GC-1's evaluator; never inspects
 * representation quality, issue counts, decisions, or proof receipts; the only inspection
 * performed is HTTP reachability, word count, and licence/eligibility verification — the same
 * class of check DRA-GEN-001's own Phase 1 permitted (protocol Section 12
 * NO_PERFORMANCE_INSPECTION_DURING_FRAME_CONSTRUCTION).
 *
 * Run with: `npx tsx build-and-freeze.ts` from this directory (network access required).
 */

import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  isVal002ConsideredUrl,
  isVal002ConsideredCandidateId,
} from "../dra-val-002-considered-registry";
import { SOURCE_FAMILIES, RECOMMENDED_SAMPLE_SIZE, type SourceFamilyId } from "../dra-val-002-protocol";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "data");
const RAW_DIR = join(OUT_DIR, "raw");
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(RAW_DIR, { recursive: true });

const FRAME_CONSTRUCTION_DATE = "2026-08-12";
const FIXED_ACQUISITION_TIME = "2026-08-12T00:00:00.000Z";

/**
 * Deterministic seed derivation rule, fixed and recorded BEFORE this script's author drew any
 * random selection from the frame: SHA-256 of a fixed literal string naming this exact
 * programme step (same technique as DRA-GEN-001's build-sample.ts).
 */
const SEED_DERIVATION_RULE = "DRA-VAL-002:PHASE-1:SAMPLE-SELECTION-SEED:v1";
function deriveSeed(): number {
  return createHash("sha256").update(SEED_DERIVATION_RULE).digest().readUInt32BE(0);
}
function hashStringToUint32(s: string): number {
  return createHash("sha256").update(s).digest().readUInt32BE(0);
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Raw candidate frame — real URLs discovered and reachability/eligibility-screened live during
// this session (GOV.UK real slugs via the GOV.UK Search API; ONS/EPA/FTC/Census via known public
// document paths). Every URL below returned HTTP 200 when checked live on 2026-08-12.
// ---------------------------------------------------------------------------

interface RawCandidate {
  frameId: string;
  familyId: SourceFamilyId;
  sourceUrl: string;
  title: string;
  publisher: string;
  publicationDate: string;
  language: "en";
  licenceBasis: string;
}

const RAW_CANDIDATES: RawCandidate[] = [
  // --- GOV_UK ---
  { frameId: "VAL002-GOVUK-employment-tribunal-and-employment-appeal-tribunal-statistics-gb", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/statistics/employment-tribunal-and-employment-appeal-tribunal-statistics-gb", title: "Employment Tribunal and Employment Appeal Tribunal Statistics, GB", publisher: "Ministry of Justice", publicationDate: "2025-09-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-government-revenues-from-uk-oil-and-gas-production--2", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/statistics/government-revenues-from-uk-oil-and-gas-production--2", title: "Government revenues from UK oil and gas production", publisher: "HM Revenue & Customs", publicationDate: "2025-06-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-chickenpox-as-a-notifiable-disease-information-for-health-professionals", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/guidance/chickenpox-as-a-notifiable-disease-information-for-health-professionals", title: "Chickenpox as a notifiable disease: information for health professionals", publisher: "UK Health Security Agency", publicationDate: "2024-11-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-view-apha-surveillance-reports-publications-and-data", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/guidance/view-apha-surveillance-reports-publications-and-data", title: "View APHA surveillance reports, publications and data", publisher: "Animal and Plant Health Agency", publicationDate: "2024-03-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-hepatitis-b-antenatal-screening-and-newborn-immunisation-programme-best-practice-guidance", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/publications/hepatitis-b-antenatal-screening-and-newborn-immunisation-programme-best-practice-guidance", title: "Hepatitis B antenatal screening and newborn immunisation programme: best practice guidance", publisher: "UK Health Security Agency", publicationDate: "2023-05-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-seeking-consent-for-immunisations-in-schools", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/guidance/seeking-consent-for-immunisations-in-schools", title: "Seeking consent for immunisations in schools", publisher: "UK Health Security Agency", publicationDate: "2023-09-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-send-code-of-practice-0-to-25", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/publications/send-code-of-practice-0-to-25", title: "Special educational needs and disability code of practice: 0 to 25 years", publisher: "Department for Education", publicationDate: "2015-01-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-send-guide-for-parents-and-carers", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/publications/send-guide-for-parents-and-carers", title: "SEND guide for parents and carers", publisher: "Department for Education", publicationDate: "2014-08-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-oil-and-gas-production-statistics-2015-and-201516", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/statistics/oil-and-gas-production-statistics-2015-and-201516", title: "Oil and gas production statistics: 2015/16", publisher: "Oil and Gas Authority", publicationDate: "2016-06-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-GOVUK-apprenticeship-and-levy-statistics-february-2019", familyId: "GOV_UK", sourceUrl: "https://www.gov.uk/government/statistics/apprenticeship-and-levy-statistics-february-2019", title: "Apprenticeship and levy statistics: February 2019", publisher: "Department for Education", publicationDate: "2019-02-01", language: "en", licenceBasis: "Open Government Licence v3.0" },

  // --- ONS_GOV_UK ---
  { frameId: "VAL002-ONS-uklabourmarket-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/latest", title: "UK labour market", publisher: "Office for National Statistics", publicationDate: "2026-07-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-consumerpriceinflation-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/latest", title: "Consumer price inflation, UK", publisher: "Office for National Statistics", publicationDate: "2026-07-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-annualmidyearpopulationestimates-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/annualmidyearpopulationestimates/latest", title: "Population estimates for the UK", publisher: "Office for National Statistics", publicationDate: "2026-06-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-quarterlynationalaccounts-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/economy/grossdomesticproductgdp/bulletins/quarterlynationalaccounts/latest", title: "Quarterly national accounts, UK", publisher: "Office for National Statistics", publicationDate: "2026-06-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-deathsregistrationsummarytables-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/deaths/bulletins/deathsregistrationsummarytables/latest", title: "Deaths registration summary tables, England and Wales", publisher: "Office for National Statistics", publicationDate: "2026-05-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-publicsectorfinances-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/publicsectorfinance/bulletins/publicsectorfinances/latest", title: "Public sector finances, UK", publisher: "Office for National Statistics", publicationDate: "2026-07-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-longterminternationalmigrationprovisional-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/internationalmigration/bulletins/longterminternationalmigrationprovisional/latest", title: "Long-term international migration, provisional", publisher: "Office for National Statistics", publicationDate: "2026-05-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-balanceofpayments-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/economy/nationalaccounts/balanceofpayments/bulletins/balanceofpayments/latest", title: "UK balance of payments, the Pink Book", publisher: "Office for National Statistics", publicationDate: "2026-06-01", language: "en", licenceBasis: "Open Government Licence v3.0" },
  { frameId: "VAL002-ONS-retailsales-latest", familyId: "ONS_GOV_UK", sourceUrl: "https://www.ons.gov.uk/businessindustryandtrade/retailindustry/bulletins/retailsales/latest", title: "Retail sales, Great Britain", publisher: "Office for National Statistics", publicationDate: "2026-07-01", language: "en", licenceBasis: "Open Government Licence v3.0" },

  // --- US_FEDERAL ---
  { frameId: "VAL002-USFED-epa-summary-clean-air-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-clean-air-act", title: "Summary of the Clean Air Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-clean-water-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-clean-water-act", title: "Summary of the Clean Water Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-resource-conservation-and-recovery-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-resource-conservation-and-recovery-act", title: "Summary of the Resource Conservation and Recovery Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-toxic-substances-control-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-toxic-substances-control-act", title: "Summary of the Toxic Substances Control Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-national-environmental-policy-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-national-environmental-policy-act", title: "Summary of the National Environmental Policy Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-safe-drinking-water-act", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-safe-drinking-water-act", title: "Summary of the Safe Drinking Water Act", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-cercla", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-comprehensive-environmental-response-compensation-and-liability-act", title: "Summary of the Comprehensive Environmental Response, Compensation, and Liability Act (CERCLA)", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-epa-summary-epcra", familyId: "US_FEDERAL", sourceUrl: "https://www.epa.gov/laws-regulations/summary-emergency-planning-community-right-know-act", title: "Summary of the Emergency Planning and Community Right-to-Know Act (EPCRA)", publisher: "U.S. Environmental Protection Agency", publicationDate: "2022-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-ftc-fair-credit-reporting-act", familyId: "US_FEDERAL", sourceUrl: "https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act", title: "Fair Credit Reporting Act", publisher: "U.S. Federal Trade Commission", publicationDate: "2021-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-ftc-fair-debt-collection-practices-act", familyId: "US_FEDERAL", sourceUrl: "https://www.ftc.gov/legal-library/browse/statutes/fair-debt-collection-practices-act", title: "Fair Debt Collection Practices Act", publisher: "U.S. Federal Trade Commission", publicationDate: "2021-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-census-acs-about", familyId: "US_FEDERAL", sourceUrl: "https://www.census.gov/programs-surveys/acs/about.html", title: "About the American Community Survey", publisher: "U.S. Census Bureau", publicationDate: "2023-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
  { frameId: "VAL002-USFED-census-population-about", familyId: "US_FEDERAL", sourceUrl: "https://www.census.gov/topics/population/about.html", title: "About the Population Topic", publisher: "U.S. Census Bureau", publicationDate: "2023-01-01", language: "en", licenceBasis: "US federal government work — public domain (17 U.S.C. § 105)" },
];

// ---------------------------------------------------------------------------
// Contamination + eligibility (metadata-level) filtering
// ---------------------------------------------------------------------------

interface ExclusionRecord {
  frameId: string;
  reason: string;
}

function applyContaminationExclusion(candidates: RawCandidate[]): { survivors: RawCandidate[]; excluded: ExclusionRecord[] } {
  const survivors: RawCandidate[] = [];
  const excluded: ExclusionRecord[] = [];
  const seenUrls = new Set<string>();
  for (const c of candidates) {
    if (isVal002ConsideredUrl(c.sourceUrl)) {
      excluded.push({ frameId: c.frameId, reason: "CONSIDERED_CANDIDATE_URL_MATCH" });
      continue;
    }
    if (isVal002ConsideredCandidateId(c.frameId)) {
      excluded.push({ frameId: c.frameId, reason: "CONSIDERED_CANDIDATE_ID_MATCH" });
      continue;
    }
    if (seenUrls.has(c.sourceUrl)) {
      excluded.push({ frameId: c.frameId, reason: "DUPLICATE_URL_IN_FRAME" });
      continue;
    }
    seenUrls.add(c.sourceUrl);
    survivors.push(c);
  }
  return { survivors, excluded };
}

function applyMetadataEligibility(candidates: RawCandidate[]): { eligible: RawCandidate[]; ineligible: ExclusionRecord[] } {
  const eligible: RawCandidate[] = [];
  const ineligible: ExclusionRecord[] = [];
  for (const c of candidates) {
    if (!c.title || c.title.trim().length < 5) {
      ineligible.push({ frameId: c.frameId, reason: "V8_MISSING_TITLE" });
      continue;
    }
    if (!c.publicationDate || c.publicationDate > FRAME_CONSTRUCTION_DATE) {
      ineligible.push({ frameId: c.frameId, reason: "V8_INVALID_DATE" });
      continue;
    }
    eligible.push(c);
  }
  return { eligible, ineligible };
}

// ---------------------------------------------------------------------------
// Fetch + freeze
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

interface FrozenUnit {
  frameId: string;
  familyId: SourceFamilyId;
  sourceUrl: string;
  title: string;
  publisher: string;
  publicationDate: string;
  mediaType: "HTML";
  language: "en";
  licenceBasis: string;
  httpStatus: number;
  redirected: boolean;
  finalUrl: string;
  byteLength: number;
  sha256: string;
  extractedWordCount: number;
  fetchedAt: string;
  wasReplacement: boolean;
  replacesFrameId: string | null;
}

interface ReplacementLogEntry {
  originalFrameId: string;
  familyId: string;
  reason: string;
  replacedByFrameId: string | null;
}

async function fetchAndFreeze(c: RawCandidate): Promise<FrozenUnit | { error: string }> {
  let res: Response | undefined;
  const ua = "Mozilla/5.0 (DRA-VAL-002 acquisition; +https://replit.com)";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(c.sourceUrl, { headers: { "User-Agent": ua } });
    } catch (e) {
      return { error: `FETCH_ERROR:${String(e)}` };
    }
    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    break;
  }
  if (!res) return { error: "FETCH_ERROR:no_response" };
  if (!res.ok) return { error: `HTTP_${res.status}` };
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return { error: "EMPTY_BODY" };
  const text = stripHtml(buf.toString("utf8"));
  const wordCount = countWords(text);
  if (wordCount < 500) return { error: `V6_WORD_COUNT_${wordCount}` };
  // Persist the exact frozen bytes NOW, at acquisition/freeze time. This is the actual fix for
  // the mechanism that destroyed DRA-GEN-001's HTML_ENGLISH stratum: GEN-001 discarded raw bytes
  // at Phase 1 and required a live re-fetch to match the Phase-1 digest at Phase 2 time, so any
  // page edit between freeze and execution silently failed the whole stratum. VAL-002 instead
  // treats THESE bytes, right now, as the permanent frozen evaluation input; Phase 2 reads them
  // back from this file and never re-fetches for evaluation purposes (see protocol Section 4).
  writeFileSync(join(RAW_DIR, `${c.frameId}.bin`), buf);
  return {
    frameId: c.frameId,
    familyId: c.familyId,
    sourceUrl: c.sourceUrl,
    title: c.title,
    publisher: c.publisher,
    publicationDate: c.publicationDate,
    mediaType: "HTML",
    language: "en",
    licenceBasis: c.licenceBasis,
    httpStatus: res.status,
    redirected: res.redirected,
    finalUrl: res.url,
    byteLength: buf.length,
    sha256: createHash("sha256").update(buf).digest("hex"),
    extractedWordCount: wordCount,
    fetchedAt: FIXED_ACQUISITION_TIME,
    wasReplacement: false,
    replacesFrameId: null,
  };
}

async function main() {
  console.log(`Raw frame size: ${RAW_CANDIDATES.length}`);

  const frameRecordForDigest = RAW_CANDIDATES.map((c) => ({ frameId: c.frameId, sourceUrl: c.sourceUrl, familyId: c.familyId })).sort((a, b) => a.frameId.localeCompare(b.frameId));
  const rawFrameDigest = createHash("sha256").update(JSON.stringify(frameRecordForDigest)).digest("hex");

  const { survivors, excluded } = applyContaminationExclusion(RAW_CANDIDATES);
  console.log(`After contamination exclusion: ${survivors.length} survive, ${excluded.length} excluded`);

  const { eligible, ineligible } = applyMetadataEligibility(survivors);
  console.log(`After metadata eligibility: ${eligible.length} eligible, ${ineligible.length} ineligible`);

  const eligibleFrameDigest = createHash("sha256")
    .update(JSON.stringify(eligible.map((c) => ({ frameId: c.frameId, sourceUrl: c.sourceUrl })).sort((a, b) => a.frameId.localeCompare(b.frameId))))
    .digest("hex");

  const byFamily = new Map<SourceFamilyId, RawCandidate[]>();
  for (const f of SOURCE_FAMILIES) byFamily.set(f.id, []);
  for (const c of eligible) byFamily.get(c.familyId)!.push(c);

  const seed = deriveSeed();
  // Per-family target counts: proportional to targetAllocation, rounded, adjusted to sum to RECOMMENDED_SAMPLE_SIZE.
  const rawTargets = SOURCE_FAMILIES.map((f) => ({ id: f.id, raw: f.targetAllocation * RECOMMENDED_SAMPLE_SIZE }));
  const floorTargets = rawTargets.map((t) => ({ id: t.id, count: Math.floor(t.raw), remainder: t.raw - Math.floor(t.raw) }));
  let remaining = RECOMMENDED_SAMPLE_SIZE - floorTargets.reduce((s, t) => s + t.count, 0);
  const byRemainderDesc = [...floorTargets].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remaining; i++) byRemainderDesc[i % byRemainderDesc.length]!.count++;
  const familyTargets = new Map(floorTargets.map((t) => [t.id, t.count]));

  const familyReport: Record<string, { eligibleCount: number; targetCount: number; primaryCount: number; reserveCount: number }> = {};
  const primarySelection: RawCandidate[] = [];
  const reserveSelection: Record<string, RawCandidate[]> = {};

  for (const f of SOURCE_FAMILIES) {
    const pool = byFamily.get(f.id)!.sort((a, b) => a.frameId.localeCompare(b.frameId));
    const rng = mulberry32(seed ^ hashStringToUint32(f.id));
    const shuffled = seededShuffle(pool, rng);
    const target = familyTargets.get(f.id)!;
    const primary = shuffled.slice(0, target);
    const reserve = shuffled.slice(target);
    familyReport[f.id] = { eligibleCount: pool.length, targetCount: target, primaryCount: primary.length, reserveCount: reserve.length };
    primarySelection.push(...primary);
    reserveSelection[f.id] = reserve;
    if (primary.length < target) {
      console.error(`FRAME SHORTFALL: family ${f.id} has only ${pool.length} eligible candidates, target ${target}`);
    }
  }

  // Freeze: fetch each primary candidate; replace from that family's reserve on any pre-lock failure.
  const frozen: FrozenUnit[] = [];
  const replacementLog: ReplacementLogEntry[] = [];
  const reserveCursors: Record<string, number> = {};
  for (const k of Object.keys(reserveSelection)) reserveCursors[k] = 0;

  async function tryFreeze(c: RawCandidate, wasReplacement: boolean, replacesFrameId: string | null): Promise<boolean> {
    console.log(`Freezing ${c.frameId} ...`);
    const result = await fetchAndFreeze(c);
    if ("error" in result) {
      replacementLog.push({ originalFrameId: c.frameId, familyId: c.familyId, reason: `ELIGIBILITY_FAILURE_OR_SOURCE_ACQUISITION_FAILURE:${result.error}`, replacedByFrameId: null });
      return false;
    }
    frozen.push({ ...result, wasReplacement, replacesFrameId });
    return true;
  }

  for (const c of primarySelection) {
    const ok = await tryFreeze(c, false, null);
    if (!ok) {
      let replaced = false;
      const familyReserves = reserveSelection[c.familyId] ?? [];
      while (reserveCursors[c.familyId]! < familyReserves.length) {
        const candidate = familyReserves[reserveCursors[c.familyId]!]!;
        reserveCursors[c.familyId]!++;
        console.log(`  -> replacement attempt: ${candidate.frameId}`);
        const replacedOk = await tryFreeze(candidate, true, c.frameId);
        if (replacedOk) {
          replacementLog.push({ originalFrameId: c.frameId, familyId: c.familyId, reason: "REPLACED_FROM_RESERVE", replacedByFrameId: candidate.frameId });
          replaced = true;
          break;
        }
      }
      if (!replaced) console.error(`UNRESOLVED: ${c.frameId} could not be replaced — reserve exhausted in ${c.familyId}`);
    }
  }

  writeFileSync(join(OUT_DIR, "raw-frame.json"), JSON.stringify(RAW_CANDIDATES, null, 2));
  writeFileSync(join(OUT_DIR, "excluded.json"), JSON.stringify(excluded, null, 2));
  writeFileSync(join(OUT_DIR, "ineligible.json"), JSON.stringify(ineligible, null, 2));
  writeFileSync(join(OUT_DIR, "eligible.json"), JSON.stringify(eligible, null, 2));
  writeFileSync(join(OUT_DIR, "frozen-units.json"), JSON.stringify(frozen, null, 2));
  writeFileSync(join(OUT_DIR, "replacement-log.json"), JSON.stringify(replacementLog, null, 2));
  writeFileSync(
    join(OUT_DIR, "selection-summary.json"),
    JSON.stringify(
      {
        seedDerivationRule: SEED_DERIVATION_RULE,
        seed,
        frameConstructionDate: FRAME_CONSTRUCTION_DATE,
        rawFrameSize: RAW_CANDIDATES.length,
        rawFrameDigest,
        excludedCount: excluded.length,
        ineligibleCount: ineligible.length,
        eligibleFrameSize: eligible.length,
        eligibleFrameDigest,
        familyReport,
        primarySelectionCount: primarySelection.length,
        finalFrozenCount: frozen.length,
      },
      null,
      2,
    ),
  );

  const familyCounts: Record<string, number> = {};
  for (const u of frozen) familyCounts[u.familyId] = (familyCounts[u.familyId] ?? 0) + 1;
  console.log("\nFinal frozen unit counts by family:", familyCounts);
  console.log(`Total frozen: ${frozen.length} (target ${RECOMMENDED_SAMPLE_SIZE})`);
  console.log(`Replacements used: ${replacementLog.filter((r) => r.reason === "REPLACED_FROM_RESERVE").length}`);
  console.log("Wrote outputs to", OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
