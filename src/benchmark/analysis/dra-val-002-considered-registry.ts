/**
 * DRA-VAL-002 — Contamination Exclusion Registry
 *
 * Extends (does not replace or duplicate) DRA-GEN-001's considered-candidate registry with:
 *   1. every DRA-GEN-001 Phase-1 frozen-sample source URL (all 4 strata, including the drifted
 *      HTML_ENGLISH stratum this programme repairs — those exact 25 documents must never be
 *      re-drawn into VAL-002, since they were already "seen" by DRA-GEN-001's own frame);
 *   2. every URL manually touched during this VAL-002 discovery session for reachability/
 *      licence/word-count screening (Section 11's "any URL manually inspected" clause), so the
 *      exclusion is auditable and programmatic rather than a hand-curated afterthought.
 *
 * Reuses GEN-001's `normalizeConsideredUrl` unchanged so both registries apply identical
 * normalisation and a single membership check can consult either or both sets.
 */

import {
  CONSIDERED_CANDIDATE_URLS as GEN001_CONSIDERED_CANDIDATE_URLS,
  CONSIDERED_CANDIDATE_IDS as GEN001_CONSIDERED_CANDIDATE_IDS,
  normalizeConsideredUrl,
} from "./dra-gen-001-considered-candidate-registry";
import { FROZEN_UNITS as GEN001_FROZEN_UNITS } from "./gen-001-phase1/dra-gen-001-sample-manifest";
import { GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS, GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID } from "./dra-gc-1-freeze-manifest";

export { normalizeConsideredUrl };

/** All 100 DRA-GEN-001 Phase-1 frozen-sample source URLs (all 4 strata), normalised. */
export const GEN001_SAMPLE_SOURCE_URLS: readonly string[] = GEN001_FROZEN_UNITS.map((u) => u.sourceUrl);

/**
 * URLs manually inspected (HTTP status / word-count / licence screening only — never a
 * DRA-performance inspection) while building the VAL-002 candidate frame in this session, for
 * candidates that were ultimately NOT selected/frozen (rejected on 404/403/502/429, thin
 * JS-rendered content, or unclear licensing). Recorded here purely for audit completeness; they
 * are excluded from any future VAL-002-family re-draw even though they never became part of a
 * locked sample.
 */
export const VAL002_SESSION_SCREENED_REJECTED_URLS: readonly string[] = [
  "https://www.gov.uk/guidance/measles-symptoms-diagnosis-and-treatment",
  "https://www.gov.uk/government/statistics/fire-and-rescue-incident-statistics-england-year-ending-march-2025",
  "https://www.gov.uk/government/statistics/national-statistics-on-waste-and-recycling",
  "https://www.gov.uk/government/statistics/prison-population-figures-2025",
  "https://www.ons.gov.uk/businessindustryandtrade/business/businessinnovation/bulletins/ukinnovationsurvey/latest",
  "https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/ukserviceproducerpriceinflation/latest",
  "https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/bulletins/uklabourmarket/latest",
  "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/causesofdeath/bulletins/deathsregisteredbyareaofusualresidenceenglandandwales/latest",
  "https://www.ons.gov.uk/businessindustryandtrade/internationaltrade/bulletins/uktrade/latest",
  "https://www.dol.gov/agencies/whd/flsa",
  "https://www.dol.gov/general/topic/wages/minimumwage",
  "https://committees.parliament.uk/",
  "https://www.parliament.uk/business/committees/",
  "https://researchbriefings.files.parliament.uk/",
  "https://www.usda.gov/about-food/food-safety",
  "https://www.justice.gov/civil-rights/about-division",
  "https://www.sec.gov/about/glossary-corporation-finance",
  "https://www.consumerfinance.gov/consumer-tools/mortgages/answers/what-is-truth-in-lending/",
  "https://www.gov.ie/en/publication/70a5f-social-insurance-fund-accounts/",
  "https://www.gov.ie/en/press-release/",
  "https://www.gov.ie/en/organisation-information/service/hse-service-plan/",
  "https://www.mbie.govt.nz/about/what-we-do/our-role/",
  "https://www.mbie.govt.nz/business-growth-agenda/employment-relations/minimum-wage",
  "https://www.govt.nz/browse/passports-citizenship-and-nz-identity/nz-identity-card/",
  "https://www.health.govt.nz/our-work/preventative-health-wellness/immunisation",
  "https://www.govt.nz/browse/health/",
  "https://www.worldbank.org/en/topic/poverty/overview",
  "https://www.worldbank.org/en/topic/agriculture/overview",
  "https://www.worldbank.org/en/topic/climatechange/overview",
  "https://www.imf.org/en/About/Factsheets/IMF-at-a-Glance",
  "https://www.gov.sg/eservices",
  "https://www.moh.gov.sg/resources-statistics/reports",
] as const;

/** Combined URL set: GEN-001's original registry + GEN-001's 100 locked sample URLs + VAL-002's own session-screened rejects. */
export const VAL002_CONSIDERED_CANDIDATE_URLS: readonly string[] = [
  ...GEN001_CONSIDERED_CANDIDATE_URLS,
  ...GEN001_SAMPLE_SOURCE_URLS,
  ...VAL002_SESSION_SCREENED_REJECTED_URLS,
];

export const VAL002_CONSIDERED_CANDIDATE_IDS: readonly string[] = [
  ...GEN001_CONSIDERED_CANDIDATE_IDS,
  ...GEN001_FROZEN_UNITS.map((u) => u.frameId),
  ...GC1_DEVELOPMENT_CORPUS_DOCUMENT_IDS,
  GC1_EXCLUDED_UNADMITTED_DOCUMENT_ID,
];

const NORMALIZED_URL_SET = new Set(VAL002_CONSIDERED_CANDIDATE_URLS.map(normalizeConsideredUrl));
const ID_SET = new Set(VAL002_CONSIDERED_CANDIDATE_IDS);

export function isVal002ConsideredUrl(url: string): boolean {
  return NORMALIZED_URL_SET.has(normalizeConsideredUrl(url));
}

export function isVal002ConsideredCandidateId(id: string): boolean {
  return ID_SET.has(id);
}
