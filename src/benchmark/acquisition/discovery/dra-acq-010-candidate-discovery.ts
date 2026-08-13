/**
 * DRA-ACQ-010 — Phase 1: Candidate Discovery for DRA-DOC-0015
 *
 * Governed, reproducible candidate-discovery and selection evidence package
 * for the fifteenth corpus document. This module records:
 *
 *   1. A corpus-balance analysis of the current 14-document corpus
 *      (DRA-DOC-0001–0014), computed from the authoritative field values
 *      used in the DRA-BMK-014 fourteen-document checkpoint (see
 *      `execution/__tests__/dra-bmk-014-fourteen-document-checkpoint.test.ts`,
 *      lines ~606–620), not from earlier narrative reports whose labels have
 *      since drifted from the schema (see DRA-CHK-002 finding on report/
 *      schema drift).
 *   2. A candidate register of genuinely researched, real, official-source
 *      documents assessed against that balance analysis.
 *   3. A deterministic ranking and single recommendation.
 *
 * SCOPE — Phase 1 only. This module does not download, freeze, admit, or
 * evaluate any document. It records discovery-and-selection evidence only.
 * DRA-DOC-0015 does not exist anywhere in the corpus schema or registry as
 * a result of this module — see the accompanying test file for an explicit
 * assertion of that constraint.
 *
 * DRA-CHK-002 has already established that Version 1 issue-class coverage
 * is fixed at 3/9 (3/3 reachable classes observed). Candidates below are
 * therefore NOT scored on any hypothesis that they might increase issue-class
 * coverage — see `REACHABILITY_MATRIX` in `../analysis/reachability-matrix.js`
 * for that closed finding, which this module does not alter.
 */

import type { Domain, DocumentType, SourceType } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Section 1 — Corpus-balance analysis of the existing 14-document corpus
// ---------------------------------------------------------------------------

/**
 * One row of authoritative corpus metadata, transcribed from the
 * DRA-BMK-014 checkpoint's canonical summary table (the single source of
 * truth reconciled against schema field names — not the older narrative
 * reports, which use pre-schema labels).
 */
export interface CorpusInventoryRow {
  readonly corpusId: string;
  readonly publisher: string;
  readonly documentType: DocumentType;
  readonly domain: Domain;
  readonly sourceType: SourceType;
  /** Whether this document originated from a real acquisition (DRA-ACQ-NNN) rather than the synthetic seed corpus. */
  readonly isRealAcquisition: boolean;
  /** Acquisition ID that produced this document, or null for the synthetic seed corpus. */
  readonly acquisitionId: string | null;
}

export const CORPUS_INVENTORY: readonly CorpusInventoryRow[] = Object.freeze([
  Object.freeze({ corpusId: "DRA-DOC-0001", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "TECHNICAL", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0002", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "BUSINESS", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0003", publisher: "Internal (AI+human)", documentType: "REPORT", domain: "GENERAL", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0004", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "GENERAL", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0005", publisher: "Internal (AI generated)", documentType: "REPORT", domain: "LEGAL", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0006", publisher: "Internal (human)", documentType: "REPORT", domain: "TECHNICAL", sourceType: "AI_GENERATED", isRealAcquisition: false, acquisitionId: null }),
  Object.freeze({ corpusId: "DRA-DOC-0007", publisher: "Apache Software Foundation", documentType: "ARTICLE", domain: "TECHNICAL", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-001" }),
  Object.freeze({ corpusId: "DRA-DOC-0008", publisher: "Acas", documentType: "PROCEDURE", domain: "BUSINESS", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-002" }),
  Object.freeze({ corpusId: "DRA-DOC-0009", publisher: "Competition and Markets Authority", documentType: "SUMMARY", domain: "GENERAL", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-004" }),
  Object.freeze({ corpusId: "DRA-DOC-0010", publisher: "National Institute of Standards and Technology (NIST)", documentType: "POLICY", domain: "TECHNICAL", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-005" }),
  Object.freeze({ corpusId: "DRA-DOC-0011", publisher: "Information Commissioner's Office (ICO)", documentType: "OTHER", domain: "LEGAL", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-006" }),
  Object.freeze({ corpusId: "DRA-DOC-0012", publisher: "Prudential Regulation Authority (PRA), Bank of England", documentType: "OTHER", domain: "FINANCE", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-007" }),
  Object.freeze({ corpusId: "DRA-DOC-0013", publisher: "U.S. Food and Drug Administration (FDA)", documentType: "POLICY", domain: "HEALTHCARE", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-008" }),
  Object.freeze({ corpusId: "DRA-DOC-0014", publisher: "Basel Committee on Banking Supervision (BCBS)", documentType: "POLICY", domain: "FINANCE", sourceType: "HUMAN_AUTHORED", isRealAcquisition: true, acquisitionId: "DRA-ACQ-009" }),
]);

/** Only the real (non-synthetic) acquisitions — DRA-DOC-0007 through DRA-DOC-0014. */
export const REAL_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  CORPUS_INVENTORY.filter((row) => row.isRealAcquisition),
);

/** Tallies a field across a set of inventory rows into a sorted count map. */
function tally<K extends string>(
  rows: readonly CorpusInventoryRow[],
  field: "domain" | "documentType" | "publisher" | "sourceType",
): ReadonlyMap<K, number> {
  const counts = new Map<K, number>();
  for (const row of rows) {
    const key = row[field] as K;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Domain distribution across the real (non-synthetic) acquisitions only. */
export const REAL_DOMAIN_COUNTS: ReadonlyMap<Domain, number> = tally<Domain>(
  REAL_ACQUISITIONS,
  "domain",
);

/** Document-type distribution across the real (non-synthetic) acquisitions only. */
export const REAL_DOCUMENT_TYPE_COUNTS: ReadonlyMap<DocumentType, number> =
  tally<DocumentType>(REAL_ACQUISITIONS, "documentType");

/** Publisher distribution across the real (non-synthetic) acquisitions only. */
export const REAL_PUBLISHER_COUNTS: ReadonlyMap<string, number> = tally<string>(
  REAL_ACQUISITIONS,
  "publisher",
);

/**
 * DocumentType values with zero occurrences among real acquisitions.
 * (REWRITE and EMAIL are structurally unlikely to have official-source
 * equivalents; REPORT is the one gap that is realistically fillable.)
 */
export const UNUSED_REAL_DOCUMENT_TYPES: readonly DocumentType[] = Object.freeze(
  (["SUMMARY", "REWRITE", "REPORT", "EMAIL", "POLICY", "PROCEDURE", "ARTICLE", "OTHER"] as const)
    .filter((dt) => !REAL_DOCUMENT_TYPE_COUNTS.has(dt)),
);

/**
 * The three most recently acquired real documents, in corpus order
 * (DRA-DOC-0012, DRA-DOC-0013, DRA-DOC-0014) — used to detect acquisition
 * concentration (recency clustering by domain/type).
 */
export const RECENT_THREE_ACQUISITIONS: readonly CorpusInventoryRow[] = Object.freeze(
  REAL_ACQUISITIONS.slice(-3),
);

/**
 * Domains with the fewest real-acquisition documents (the under-represented
 * set). Computed, not asserted, so it stays correct if the corpus changes.
 */
export function leastRepresentedRealDomains(): readonly Domain[] {
  const allDomains: readonly Domain[] = ["GENERAL", "BUSINESS", "TECHNICAL", "LEGAL", "HEALTHCARE", "FINANCE"];
  const min = Math.min(...allDomains.map((d) => REAL_DOMAIN_COUNTS.get(d) ?? 0));
  return Object.freeze(allDomains.filter((d) => (REAL_DOMAIN_COUNTS.get(d) ?? 0) === min));
}

// ---------------------------------------------------------------------------
// Section 2 — Candidate register
// ---------------------------------------------------------------------------

export const CANDIDATE_QUALIFICATION_OUTCOMES = [
  "QUALIFIED_RECOMMENDED",
  "QUALIFIED_ALTERNATE",
  "DEFERRED",
  "REJECTED",
] as const;
export type CandidateQualificationOutcome =
  (typeof CANDIDATE_QUALIFICATION_OUTCOMES)[number];

export interface CandidateRecord {
  readonly candidateId: string;
  readonly publisher: string;
  readonly exactTitle: string;
  readonly publicationDateOrVersion: string;
  readonly proposedDocumentType: DocumentType;
  readonly proposedDomain: Domain;
  readonly officialSourceUrl: string;
  readonly sourceFormat: string;
  readonly licencePosition: string;
  readonly httpAccessibility:
    | "VERIFIED_ACCESSIBLE"
    | "PARTIAL_LANDING_PAGE_ONLY"
    | "BLOCKED_NETWORK_LEVEL"
    | "BLOCKED_BOT_CHALLENGE"
    | "BLOCKED_CONNECTIVITY_TIMEOUT";
  readonly accessibilityEvidence: string;
  readonly duplicateOrNearDuplicateRisk: string;
  readonly likelyCorpusDiversityContribution: string;
  readonly unresolvedRisks: readonly string[];
  readonly qualificationOutcome: CandidateQualificationOutcome;
  readonly rejectionOrDeferralReason: string | null;
}

export const CANDIDATE_REGISTER: readonly CandidateRecord[] = Object.freeze([
  Object.freeze({
    candidateId: "DRA-CAND-010-01",
    publisher: "Organisation for Economic Co-operation and Development (OECD)",
    exactTitle: "Recommendation of the Council on Artificial Intelligence",
    publicationDateOrVersion: "OECD/LEGAL/0449; originally adopted 22 May 2019 (amendment date requires confirmation — see unresolved risks)",
    proposedDocumentType: "OTHER",
    proposedDomain: "GENERAL",
    officialSourceUrl: "https://oecd.ai/en/assets/files/OECD-LEGAL-0449-en.pdf",
    sourceFormat: "application/pdf",
    licencePosition: "REVIEW_REQUIRED — OECD operates an open-access policy (confirmed via oecd.org press material) but the specific reuse-terms page (www.oecd.org/en/about/terms-conditions.html) is behind a Cloudflare interactive challenge from this environment and could not be read automatically.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) to https://oecd.ai/en/assets/files/OECD-LEGAL-0449-en.pdf returned HTTP 200, content-type application/pdf, 2,246,383 bytes.",
    duplicateOrNearDuplicateRisk: "LOW — no existing corpus document addresses cross-jurisdictional AI-governance principles at the multilateral level.",
    likelyCorpusDiversityContribution:
      "Reinforces GENERAL domain (currently tied for least-represented among real acquisitions at 1 document: DRA-DOC-0009 CMA). Adds a formally adopted, long-standing (2019) international instrument, contrasting with the national-supervisory register of the last two POLICY-type acquisitions (FDA, BCBS). Breaks the FINANCE/HEALTHCARE domain concentration seen in DRA-DOC-0012..0014.",
    unresolvedRisks: [
      "Exact adoption/amendment date could not be extracted from the authoritative legalinstruments.oecd.org record because the page is a JavaScript-rendered SPA; a static curl fetch returned only placeholder markup.",
      "OECD's specific reuse/licence terms text could not be automatically retrieved (Cloudflare interactive challenge on www.oecd.org/en/about/terms-conditions.html); manual human review required before any LicenceAssessment can reach VERIFIED.",
      "DocumentType schema has no dedicated RECOMMENDATION category; mapping to OTHER vs POLICY is a judgement call that should be made explicitly during acquisition, not defaulted.",
      "Two near-identical PDF mirrors exist (oecd.ai and legalinstruments.oecd.org/api/print); the canonical source for source-digest purposes must be chosen and documented before acquisition.",
    ],
    qualificationOutcome: "QUALIFIED_RECOMMENDED",
    rejectionOrDeferralReason: null,
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-02",
    publisher: "European Data Protection Board (EDPB)",
    exactTitle: "Guidelines 1/2024 on processing of personal data based on Article 6(1)(f) GDPR",
    publicationDateOrVersion: "Version 1.0, adopted 8 October 2024",
    proposedDocumentType: "OTHER",
    proposedDomain: "LEGAL",
    officialSourceUrl: "https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202401_legitimateinterest_en.pdf",
    sourceFormat: "application/pdf",
    licencePosition: "REVIEW_REQUIRED — EU institutional content is generally reusable under Commission Decision 2011/833/EU (© European Union, attribution required), but no EDPB-specific licence statement was found inside the document itself.",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) to the PDF URL returned HTTP 200, content-type application/pdf, 721,935 bytes; text extraction succeeded (37 pages).",
    duplicateOrNearDuplicateRisk: "LOW-MEDIUM — same general subject area (data-protection guidance) as DRA-DOC-0011 (ICO), but a different jurisdiction (EU vs UK), different legal basis under analysis, and a different institutional voice (supervisory network vs single national regulator).",
    likelyCorpusDiversityContribution:
      "Reinforces LEGAL domain (currently tied for least-represented among real acquisitions at 1 document: DRA-DOC-0011 ICO). Adds a second, EU-level jurisdiction to complement the existing UK-centric LEGAL document.",
    unresolvedRisks: [
      "CONTENT-STABILITY RISK: every page footer of the retrieved PDF reads 'Adopted - version for public consultation'. The EDPB's own public-consultation page confirms the feedback window closed on 20 November 2024. A finalised, potentially revised text may since have superseded this consultation draft; that final version (if it exists) has not been located or compared against this PDF.",
      "No EDPB-specific reuse/licence statement was found in the document; reliance on the general EU reuse Decision has not been confirmed as applicable to EDPB (a body distinct from the European Commission) by a human reviewer.",
      "DocumentType schema has no GUIDANCE/GUIDELINES category (same structural gap already logged for DRA-DOC-0011); OTHER vs POLICY mapping needs an explicit decision.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended over the OECD candidate: carries a confirmed content-stability risk (public-consultation-tagged text, possible unseen final revision) that the OECD candidate — a settled, multi-year-standing instrument — does not share, for an equivalent domain-diversity contribution (both are the 2nd real document in their respective under-represented domain).",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-03",
    publisher: "National Cyber Security Centre (NCSC), UK",
    exactTitle: "Principles for the security of machine learning",
    publicationDateOrVersion: "NCSC guidance collection (page live at time of assessment; specific version date not separately confirmed)",
    proposedDocumentType: "PROCEDURE",
    proposedDomain: "TECHNICAL",
    officialSourceUrl: "https://www.ncsc.gov.uk/collection/machine-learning",
    sourceFormat: "text/html",
    licencePosition: "OPEN_LICENCE — Open Government Licence terms confirmed present on the fetched page (matches the precedent already accepted for Acas and ICO).",
    httpAccessibility: "VERIFIED_ACCESSIBLE",
    accessibilityEvidence: "curl -L (Chrome UA) returned HTTP 200, content-type text/html; page text contains an explicit 'OGL' reference.",
    duplicateOrNearDuplicateRisk: "LOW on content (no existing document covers ML-specific security engineering practices), but see corpus-balance concerns below.",
    likelyCorpusDiversityContribution:
      "Would fill the PROCEDURE-type slot a second time (already used once, by Acas) and add TECHNICAL-domain content with a security-engineering register distinct from Apache's how-to article and NIST's risk-management framework.",
    unresolvedRisks: [
      "Corpus-balance concern, not an accessibility/licence risk: TECHNICAL is already the most-represented real-acquisition domain (2 of 8: Apache, NIST). Admitting NCSC would make it 3 of 9, deepening rather than resolving the domain imbalance the task explicitly asks to correct.",
      "UK-government publisher concentration: Acas, ICO, PRA and (proposed) NCSC would put 4 of 9-10 real acquisitions under UK public bodies, narrowing jurisdictional diversity even as domain diversity is held roughly constant.",
      "The NCSC 'collection' page is a living index that NCSC periodically updates; content-stability (byte-for-byte reproducibility over time) has not been separately verified the way a fixed PDF's stability would be.",
    ],
    qualificationOutcome: "QUALIFIED_ALTERNATE",
    rejectionOrDeferralReason:
      "Not recommended: reinforces the already best-represented real domain (TECHNICAL) and the already best-represented jurisdiction (UK government bodies), working against the stated diversity objective even though it is fully accessible and has the cleanest licence position of all seven candidates.",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-04",
    publisher: "World Health Organization (WHO)",
    exactTitle: "Ethics and governance of artificial intelligence for health: WHO guidance",
    publicationDateOrVersion: "2021 (ISBN 978-92-4-002920-0 electronic version)",
    proposedDocumentType: "OTHER",
    proposedDomain: "HEALTHCARE",
    officialSourceUrl: "https://iris.who.int/bitstream/handle/10665/341996/9789240029200-eng.pdf",
    sourceFormat: "application/pdf",
    licencePosition: "CC BY-NC-SA 3.0 IGO (per document front matter found via search-result snippet); non-commercial licensing already has precedent in this corpus (DRA-DOC-0012 PRA and DRA-DOC-0014 BCBS both use non-commercial bases), so this is not a novel licence category for the governance process.",
    httpAccessibility: "PARTIAL_LANDING_PAGE_ONLY",
    accessibilityEvidence: "https://www.who.int/publications/i/item/9789240029200 (landing/metadata page) returned HTTP 200. Both known PDF mirrors — iris.who.int/bitstream/... and iris.who.int/server/api/core/bitstreams/.../content — returned HTTP 403 from this environment on every attempt (default and browser User-Agent).",
    duplicateOrNearDuplicateRisk: "LOW-MEDIUM — same HEALTHCARE domain as DRA-DOC-0013 (FDA), but international/WHO institutional voice and ethics framing vs FDA's US regulatory action-plan framing.",
    likelyCorpusDiversityContribution:
      "Would reinforce HEALTHCARE domain (currently tied for least-represented among real acquisitions at 1 document: DRA-DOC-0013 FDA) with an international rather than US-national institutional perspective.",
    unresolvedRisks: [
      "The actual document content could not be fetched from this environment (403 on both known PDF endpoints); only the WHO landing page is confirmed reachable. Acquisition cannot proceed until a reproducible fetch path is confirmed (e.g. a different network egress, or WHO providing an alternative mirror).",
      "CC BY-NC-SA 3.0 IGO carries IGO-specific dispute-resolution and attribution clauses beyond a standard CC licence; a human reviewer must confirm these do not conflict with the project's reuse assumptions before VERIFIED status is possible.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "Deferred: the actual document bytes are not reproducibly fetchable from this environment (confirmed HTTP 403 on both known mirrors), which fails the acquisition pipeline's reproducibility precondition regardless of the document's otherwise-strong diversity value.",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-05",
    publisher: "U.S. Government Accountability Office (GAO)",
    exactTitle: "Artificial Intelligence: An Accountability Framework for Federal Agencies and Other Entities",
    publicationDateOrVersion: "GAO-21-519SP, published 30 June 2021",
    proposedDocumentType: "REPORT",
    proposedDomain: "GENERAL",
    officialSourceUrl: "https://www.gao.gov/products/gao-21-519sp",
    sourceFormat: "application/pdf",
    licencePosition: "US_GOVERNMENT_WORK — high confidence by direct precedent (same basis already VERIFIED for DRA-DOC-0010 NIST and DRA-DOC-0013 FDA, both US federal agencies).",
    httpAccessibility: "BLOCKED_NETWORK_LEVEL",
    accessibilityEvidence: "curl to https://www.gao.gov/products/gao-21-519sp and to https://www.gao.gov (bare root domain) both returned HTTP 403 from this environment; the root-domain failure indicates a network/IP-level block rather than a page-specific issue.",
    duplicateOrNearDuplicateRisk: "LOW — no existing document addresses cross-government AI accountability/oversight practice.",
    likelyCorpusDiversityContribution:
      "Would be the single strongest content-fit candidate identified: REPORT is the one DocumentType with zero real-acquisition representation (see UNUSED_REAL_DOCUMENT_TYPES), and GENERAL/BUSINESS-classifiable oversight content would reinforce an under-represented domain, while carrying the same well-established US_GOVERNMENT_WORK licence basis as two existing corpus documents.",
    unresolvedRisks: [
      "gao.gov is confirmed unreachable (HTTP 403) from this environment at the domain level, not just for this asset — this is a hard blocker for Phase 2 acquisition unless attempted from a different network path or via an authorised mirror.",
    ],
    qualificationOutcome: "REJECTED",
    rejectionOrDeferralReason:
      "Rejected for Phase 1 purposes on accessibility grounds only (content and licence assessment would otherwise be the strongest of all seven candidates): gao.gov returns HTTP 403 network-wide from this environment, so a reproducible fetch cannot be demonstrated. Worth reattempting later from a different environment/egress path.",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-06",
    publisher: "Department of Industry, Science and Resources, Australian Government",
    exactTitle: "Australia's AI Ethics Principles",
    publicationDateOrVersion: "Published 7 November 2019; page last updated 2 December 2025",
    proposedDocumentType: "ARTICLE",
    proposedDomain: "GENERAL",
    officialSourceUrl: "https://www.industry.gov.au/publications/australias-ai-ethics-principles",
    sourceFormat: "text/html",
    licencePosition: "REVIEW_REQUIRED — Australian government content is typically published under Creative Commons Attribution 4.0 International, but this was not confirmed on the specific page due to the connectivity failure below.",
    httpAccessibility: "BLOCKED_CONNECTIVITY_TIMEOUT",
    accessibilityEvidence: "curl -v to www.industry.gov.au completed DNS resolution and TLS ServerHello/Certificate exchange but the connection stalled indefinitely before completing the handshake, across repeated attempts with a 15-20s timeout.",
    duplicateOrNearDuplicateRisk: "MEDIUM — would compete directly with the OECD candidate for the same GENERAL-domain diversity slot; single-jurisdiction (Australia) rather than multilateral scope.",
    likelyCorpusDiversityContribution:
      "Would add a new national jurisdiction (Australia, not yet represented) and reinforce the GENERAL domain, similar in kind to the OECD candidate but at national rather than multilateral scope.",
    unresolvedRisks: [
      "TLS/connection-level failure from this environment prevents any content or licence verification; unclear whether this is a transient network issue or a persistent block.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "Deferred: connection could not be established from this environment (TLS handshake stalls, distinct failure mode from the GAO/NCSC cases), so no reproducible fetch evidence exists yet. Retry from a different network path recommended before further consideration.",
  }),
  Object.freeze({
    candidateId: "DRA-CAND-010-07",
    publisher: "Personal Data Protection Commission (PDPC), Singapore",
    exactTitle: "Model Artificial Intelligence Governance Framework (Second Edition)",
    publicationDateOrVersion: "Second Edition, announced January 2020",
    proposedDocumentType: "PROCEDURE",
    proposedDomain: "TECHNICAL",
    officialSourceUrl: "https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/resource-for-organisation/ai/sgmodelaigovframework2.pdf",
    sourceFormat: "application/pdf",
    licencePosition: "UNKNOWN — could not be assessed; see accessibility below.",
    httpAccessibility: "BLOCKED_BOT_CHALLENGE",
    accessibilityEvidence: "curl -L (Chrome UA) to the PDF URL returned HTTP 202 with content-type text/html (not application/pdf) on repeated attempts — consistent with an unresolved bot-detection interstitial rather than the actual file.",
    duplicateOrNearDuplicateRisk: "LOW — new jurisdiction (Singapore) and would fill the TECHNICAL/PROCEDURE combination differently from NCSC (governance-framework register vs security-engineering register), but see TECHNICAL-domain concentration concern already logged for NCSC.",
    likelyCorpusDiversityContribution:
      "Would add a new jurisdiction (Singapore) and a new publisher, but reinforces the already best-represented real domain (TECHNICAL) unless reclassified as BUSINESS.",
    unresolvedRisks: [
      "The actual PDF bytes have never been retrieved by this assessment (only a bot-challenge interstitial); content, exact page count, and structure remain unverified.",
      "Even if resolved, the domain-concentration concern for TECHNICAL applies here as for NCSC.",
    ],
    qualificationOutcome: "DEFERRED",
    rejectionOrDeferralReason:
      "Deferred: every automated fetch attempt returned a bot-detection interstitial (HTTP 202, text/html) rather than the PDF, so no reproducible content fetch has been demonstrated.",
  }),
]);

// ---------------------------------------------------------------------------
// Section 3 — Ranking and recommendation
// ---------------------------------------------------------------------------

/**
 * Deterministic ranking criteria, applied in strict priority order
 * (each criterion only breaks ties left by the previous one):
 *
 *   1. HTTP accessibility must be VERIFIED_ACCESSIBLE (hard gate — anything
 *      else is excluded from the ranked-and-selectable set entirely).
 *   2. Content-stability: a settled/final instrument outranks a document
 *      explicitly marked as a consultation draft or otherwise provisional.
 *   3. Corpus-diversity contribution: candidates reinforcing a currently
 *      least-represented real-acquisition domain outrank candidates that
 *      would deepen an already best-represented domain.
 *   4. Licence-position tractability: a documented path to VERIFIED
 *      (even if not yet VERIFIED) outranks UNKNOWN.
 *
 * This ordering is fixed data, not a runtime scoring function, so that the
 * reasoning is auditable line-by-line rather than hidden in a formula.
 */
export const RANKED_CANDIDATE_IDS: readonly string[] = Object.freeze([
  "DRA-CAND-010-01", // OECD — accessible, settled since 2019, fills least-represented GENERAL domain
  "DRA-CAND-010-03", // NCSC — accessible, cleanest licence, but deepens best-represented TECHNICAL domain + UK concentration
  "DRA-CAND-010-02", // EDPB — accessible, fills least-represented LEGAL domain, but consultation-draft content-stability risk
  "DRA-CAND-010-04", // WHO — fills least-represented HEALTHCARE domain, but PDF itself unreachable (403), only landing page confirmed
  "DRA-CAND-010-05", // GAO — best content fit (REPORT gap + GENERAL) but domain-wide network block (403)
  "DRA-CAND-010-06", // Australia — same value class as OECD but blocked by TLS connectivity failure
  "DRA-CAND-010-07", // PDPC Singapore — blocked by unresolved bot challenge
]);

export const RECOMMENDED_CANDIDATE_ID = "DRA-CAND-010-01";

export function getCandidateById(id: string): CandidateRecord | undefined {
  return CANDIDATE_REGISTER.find((c) => c.candidateId === id);
}

export function recommendedCandidate(): CandidateRecord {
  const candidate = getCandidateById(RECOMMENDED_CANDIDATE_ID);
  if (!candidate) {
    throw new Error(
      `Invariant violated: RECOMMENDED_CANDIDATE_ID ${RECOMMENDED_CANDIDATE_ID} not found in CANDIDATE_REGISTER`,
    );
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Section 4 — Phase boundary confirmation
// ---------------------------------------------------------------------------

/**
 * Explicit, machine-checkable confirmation of the Phase 1 scope boundary.
 * No corpus document with this ID exists as a result of this module; it is
 * reserved only as a plain string label for future reference.
 */
export const RESERVED_NEXT_CORPUS_ID = "DRA-DOC-0015";

/** This module performs discovery only — it must never construct a real AcquiredDocument, FreezeRecord, or evaluator run. */
export const PHASE_1_PROHIBITED_ACTIONS = Object.freeze([
  "download_or_permanently_acquire_selected_document",
  "freeze_any_document",
  "create_DRA-DOC-0015",
  "admit_any_document_to_corpus",
  "run_evaluator_on_new_document",
  "generate_proof_receipt",
  "modify_frozen_corpus_record",
  "modify_evaluator_v0.1.1",
  "modify_issue_classes_decision_logic_stage_behaviour_or_methodology",
  "alter_DRA-CHK-002_findings",
  "proceed_automatically_to_phase_2",
] as const);
