/**
 * DRA-ACQ-026 — Phase 2A/2B: Freeze and Corpus Admission WITHOUT Evaluator
 * Execution for DRA-DOC-0030 (NIST SP 800-53 Rev 5, "Security and Privacy
 * Controls for Information Systems and Organizations")
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-026 PHASE 2A/2B (MODIFIED SCOPE)         ║
 * ║                                                                          ║
 * ║  Candidate: primary recommendation qualified at the close of DRA-ACQ-026 ║
 * ║  Phase 1 discovery (long-range/large-scale structural dependency         ║
 * ║  discovery). Document: NIST Special Publication 800-53 Revision 5,       ║
 * ║  "Security and Privacy Controls for Information Systems and              ║
 * ║  Organizations" — 492 pages, 6,073,678 bytes.                            ║
 * ║  Corpus ID:      DRA-DOC-0030                                            ║
 * ║  Freeze ID:      DRA-FRZ-000024 (highest existing freeze ID at the       ║
 * ║                  start of this acquisition was DRA-FRZ-000023, used by   ║
 * ║                  DRA-DOC-0029)                                           ║
 * ║  Acquisition ID: DRA-ACQ-000033 (programme ref: DRA-ACQ-026; highest     ║
 * ║                  existing acquisition ID was DRA-ACQ-000032, used by     ║
 * ║                  DRA-DOC-0029's acquisition)                             ║
 * ║  Publisher:      National Institute of Standards and Technology (NIST),  ║
 * ║                  U.S. Department of Commerce                            ║
 * ║  Canonical URL:  https://nvlpubs.nist.gov/nistpubs/SpecialPublications/  ║
 * ║                  NIST.SP.800-53r5.pdf                                    ║
 * ║                                                                          ║
 * ║  ══════════════════ MODIFIED SCOPE — READ FIRST ══════════════════       ║
 * ║  Standard DRA acquisitions (DRA-DOC-0001..0029) run the full governed    ║
 * ║  pipeline via acquireFreezeAndEvaluate(), which bundles freeze +         ║
 * ║  corpus-integration + full evaluator execution (Stages 1-7) atomically.  ║
 * ║  For DRA-DOC-0030, that path is NOT used. Direct measurement (see the    ║
 * ║  scaling-characterization test below, and DRA-ACQ-026 Phase 1/2 working  ║
 * ║  notes) establishes that Stage 4 (Evidence Linkage) scales                ║
 * ║  quadratically (O(n^2)) in statement count, and this document produces   ║
 * ║  25,603 Stage-2 statements — an estimated 35-45 minutes of Stage-4       ║
 * ║  compute alone, which cannot complete inside this execution              ║
 * ║  environment's per-invocation limits (no persistent background          ║
 * ║  execution across tool calls; hard per-call time ceilings). Full         ║
 * ║  Stages 4-7 are therefore NOT run for the complete document in this      ║
 * ║  test suite, and DRA-DOC-0030 is NOT assigned a decision (SUPPORTED /    ║
 * ║  REVIEW / HOLD) by this admission.                                       ║
 * ║                                                                          ║
 * ║  Per explicit governance direction for this acquisition: fabricating,    ║
 * ║  extrapolating, sampling, or truncating the document to force a         ║
 * ║  decision is EXPLICITLY PROHIBITED. Instead:                            ║
 * ║   1. The document is frozen and admitted using the corpus schema's       ║
 * ║      pre-existing "FROZEN" benchmarkStatus (the same status every        ║
 * ║      other corpus document carries immediately after freeze, before     ║
 * ║      any evaluation decision is layered on in this test's own log        ║
 * ║      lines and `notes` field) — the schema does not have a separate      ║
 * ║      "evaluated" flag, so admission-without-a-decision is a fully        ║
 * ║      honest use of the existing FROZEN status, not a bent convention.    ║
 * ║   2. Full evaluator execution status is recorded as the literal string   ║
 * ║      "NOT_COMPLETABLE_IN_CURRENT_EXECUTION_ENVIRONMENT" — a status       ║
 * ║      distinct from any of SUPPORTED/REVIEW/HOLD, kept in this file's own ║
 * ║      constants and log output (there is no schema field for it; it is   ║
 * ║      NOT written into the corpus registry's decision-bearing fields      ║
 * ║      because none exist for an unevaluated document).                   ║
 * ║   3. Stages 1-3 (Normalisation, Claim Extraction, Authority Resolution)  ║
 * ║      DO complete quickly on the full document (see below) and their      ║
 * ║      real, measured output is recorded here as genuine observed          ║
 * ║      evidence, not proxied or estimated.                                 ║
 * ║   4. This is reported as a genuine computational/execution-environment   ║
 * ║      scaling limitation of the CURRENT Stage 4 algorithm in THIS         ║
 * ║      sandbox — not evidence that DRA cannot evaluate documents of this   ║
 * ║      size in principle. A follow-up engineering ticket to characterize   ║
 * ║      and address Stage 4's algorithmic complexity is recommended         ║
 * ║      separately (see DRA-ACQ-026 Phase 2 report).                       ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-11):          ║
 * ║  - Official source: nvlpubs.nist.gov is NIST's official publications     ║
 * ║    domain; re-confirmed live today.                                      ║
 * ║  - Availability/stability: two independent live HTTP GETs of the         ║
 * ║    canonical URL, taken independently for this admission test, are       ║
 * ║    BYTE-IDENTICAL: SHA-256                                                ║
 * ║    fc63bcd61715d0181dd8e85998b1e6201ae3515fc6626102101cab1841e11ec6,      ║
 * ║    6,073,678 bytes, both times — matching DRA-ACQ-026 Phase 1's record.   ║
 * ║    BYTE_STABLE (stronger than the TEXT_STABLE finding for several prior  ║
 * ║    corpus documents).                                                    ║
 * ║  - Licence: PUBLIC_DOMAIN. NIST Special Publications are works of the    ║
 * ║    U.S. federal government (17 U.S.C. §105); same basis already accepted ║
 * ║    for DRA-DOC-0012 (NIST AI RMF) — direct NIST authorship, no           ║
 * ║    contradictory notice found on this document.                          ║
 * ║  - Representation: NATIVE_TEXT PDF (492 pages), confirmed via            ║
 * ║    pdfinfo/pdffonts and the standard representation-provenance prober.   ║
 * ║  - Public accessibility: no authentication, paywall, or access           ║
 * ║    circumvention of any kind was required.                               ║
 * ║  - CORRECTED FINDING vs. Phase 1: Phase 1 discovery estimated ~189       ║
 * ║    control-withdrawal notices ("Withdrawn:" cross-references). Live,     ║
 * ║    independently re-verified counting at admission time (multiple        ║
 * ║    independent regex/parsing methods, all converging) finds the TRUE     ║
 * ║    count is 182, not 189. This corrected figure — not the Phase 1        ║
 * ║    estimate — is the accepted ground truth used throughout Phase 2       ║
 * ║    (see the companion long-range-structural-robustness test file for     ║
 * ║    the redirect-resolution-rate experiment built on this figure). This   ║
 * ║    kind of downward correction of a Phase 1 discovery-stage estimate     ║
 * ║    via live re-verification is expected and desired, not a defect.       ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain TECHNICAL, documentType POLICY, language en-US,  ║
 * ║  difficulty HIGH (492-page native-PDF federal standard with extensive    ║
 * ║  internal cross-referencing across a 400+ page span).                    ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE: DRA-DOC-0030 does not add a novel domain     ║
 * ║  (TECHNICAL already represented) but is by a wide margin the largest     ║
 * ║  document ever admitted to the corpus (25,603 Stage-2 statements vs.     ║
 * ║  the next-largest prior document's low thousands), and is the first      ║
 * ║  document whose scale alone constitutes the qualifying experimental      ║
 * ║  risk factor, rather than a representation, licence, or language         ║
 * ║  property.                                                                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to nvlpubs.nist.gov, fetching a
 * ~6.07MB PDF twice for the stability check. It also runs Stage 1
 * (normalisation), Stage 2 (claim extraction), and Stage 3 (authority
 * resolution) directly against the FULL 492-page document — these complete
 * in well under a second combined and are genuinely executed, not
 * estimated. It does NOT run Stage 4 (Evidence Linkage) against the full
 * document (see MODIFIED SCOPE above); a separate test in this file
 * characterizes Stage 4's scaling behaviour on bounded-size subsets only.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { computeSourceDigest, computeApprovedMetadataDigest } from "../integrity.js";
import { createAcquisitionRequest } from "../request.js";
import { normaliseContent } from "../normalisation.js";
import { checkFreezeEligibility } from "../eligibility.js";
import { createAcquisitionFreezeRecord } from "../freeze.js";
import { integrateWithCorpus } from "../manifest-integration.js";
import { assessRepresentationProvenance } from "../representation-provenance.js";
import { assessGraphicalSemanticRisk } from "../graphical-semantic-risk.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { PRIOR_CORPUS_ENTRIES, CORPUS_VERSION as SHARED_CORPUS_VERSION } from "../../execution/__tests__/dra-bmk-023-prior-entries.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import { probePdfRepresentation } from "./support/pdf-representation-prober.js";
import { probePdfImageRegions } from "./support/pdf-image-region-prober.js";

import { normaliseEvaluationRequest } from "../../../normalisation/index.js";
import { extractClaims } from "../../../claim-extraction/index.js";
import { resolveAuthority } from "../../../authority-resolution/index.js";
import { linkEvidence } from "../../../evidence-linkage/index.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

const REVIEW_TIMESTAMP = "2026-08-11T08:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T08:30:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

export const NOT_COMPLETABLE_STATUS = "NOT_COMPLETABLE_IN_CURRENT_EXECUTION_ENVIRONMENT" as const;

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0030 candidate
// ---------------------------------------------------------------------------

const NIST_SP80053_PDF_URL = "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf";

const EXPECTED_BYTE_LENGTH = 6_073_678;
const EXPECTED_SHA256 = "fc63bcd61715d0181dd8e85998b1e6201ae3515fc6626102101cab1841e11ec6";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-026-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath], { maxBuffer: 1024 * 1024 * 64 });
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
  assessedBy: "DRA-ACQ-026-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${NIST_SP80053_PDF_URL}`,
    "Publisher: National Institute of Standards and Technology (NIST), U.S. Department of Commerce — " +
      "nvlpubs.nist.gov is NIST's official publications-hosting domain.",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition, independent of Phase 1 discovery): two independent GET " +
      "requests to the canonical PDF URL both return HTTP 200, content-type application/pdf, content-length " +
      "6,073,678 bytes both times.",
    `BYTE_STABLE: the two independently fetched copies are byte-identical (SHA-256 ${EXPECTED_SHA256}), a ` +
      "stronger reproducibility property than the TEXT_STABLE finding recorded for several prior corpus " +
      "documents whose publishing pipelines re-serialise PDF bytes per request.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official U.S. government domain.",
    "HUMAN GOVERNANCE DECISION: NIST confirmed as the official publisher and canonical source of this " +
      "document — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-026 Phase 2 human governance sign-off 2026-08-11. NIST SP 800-53 Rev 5 official source VERIFIED.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work — Public Domain (17 U.S.C. §105)",
  licenceUrl: NIST_SP80053_PDF_URL,
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-026-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "NIST Special Publications are authored by NIST, an agency of the U.S. Department of Commerce, and are " +
      "works of the U.S. federal government under 17 U.S.C. §105, placing them in the public domain within " +
      "the United States with no copyright protection available.",
    "This is the same basis already accepted for DRA-DOC-0012 (NIST AI RMF) — direct NIST authorship, not a " +
      "site-wide reuse-policy inference.",
    "NO CONTRADICTORY NOTICE FOUND: no per-document copyright notice, embargo, or narrower licence override " +
      "was found on the PDF.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (U.S. Government work, 17 U.S.C. §105) confirmed via direct " +
      "NIST authorship — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-026 Phase 2 human governance sign-off 2026-08-11. U.S. Government work / public domain — " +
    "VERIFIED, consistent with DRA-DOC-0012 precedent.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls for Information Systems and " +
    "Organizations",
  publisher: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  publicationDate: "2020-09",
  domain: "TECHNICAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary candidate selected at the close of DRA-ACQ-026 Phase 1 discovery (long-range/large-scale " +
  "structural-dependency experiment target). Sole experimental purpose: whether cross-references separated " +
  "by hundreds of pages (e.g. a term used on page ~298 and defined in the Appendix A glossary on page ~423; " +
  "182 in-body control-withdrawal notices pointing to targets that may be located anywhere else in a " +
  "492-page document) survive DRA's per-stage pipeline, and to characterize DRA's computational scaling " +
  "behaviour on a document an order of magnitude larger (25,603 Stage-2 statements) than any prior corpus " +
  "entry. CORPUS-BALANCE DISCLOSURE: this document does not add a novel domain (TECHNICAL already " +
  "represented) but is the largest document ever admitted, and the first whose qualifying risk factor is " +
  "document scale itself. NO DECISION (SUPPORTED/REVIEW/HOLD) is assumed or assigned by this inclusion " +
  "rationale: full Stage 4-7 execution could not be completed within this execution environment's " +
  "per-invocation constraints given Stage 4's measured O(n^2) scaling (see the companion scaling-" +
  "characterization test in this file). This document is admitted in FROZEN status, matching the schema's " +
  "existing pre-evaluation state, with evaluator execution status recorded separately as " +
  `"${NOT_COMPLETABLE_STATUS}" rather than any fabricated or extrapolated decision.`;

// ---------------------------------------------------------------------------
// ENTRY_0023..0029 — reconstructed unmodified from prior admission tests
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
    "Result: HOLD, 184 issues (173 EVIDENCE_ABSENT + 11 EVIDENCE_INADEQUATE), 9235 statements.",
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
    "Result: REVIEW, 1 issue (EVIDENCE_INADEQUATE).",
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
    "semantic loss demonstrated as a representation-boundary limitation — see DRA-ACQ-021 Phase 2.",
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
    "Result: SUPPORTED, 0 issues, 1127 statements, fully deterministic.",
};

const ENTRY_0027: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0027",
  title:
    "The Metric System: Hearings Before Subcommittee No. 1 and the Committee on Science and Astronautics, " +
    "U.S. House of Representatives, Eighty-Seventh Congress, First Session, on H.R. 269 and H.R. 2049 " +
    "(June 28, 29, and July 21, 1961)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "en-US",
  generator: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo, GPO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf",
  sourceReference: "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000030 (programme ref: DRA-ACQ-023). Freeze record: DRA-FRZ-000021. " +
    "Result: HOLD, 11 issues, 5323 statements.",
};

const ENTRY_0028: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0028",
  title:
    "Deciding When to Submit a 510(k) for a Change to an Existing Device — Guidance for Industry and Food " +
    "and Drug Administration Staff",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "U.S. Food and Drug Administration (FDA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009 from https://www.fda.gov/media/99812/download",
  sourceReference: "https://www.fda.gov/media/99812/download",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000031 (programme ref: DRA-ACQ-024). Freeze record: DRA-FRZ-000022. " +
    "Flowchart-topology representation-fidelity robustness experiment: Appendix B checklist restated all " +
    "flowchart decision networks in linear textual form, so directed-edge loss was MATERIAL_BOUNDED, not " +
    "MATERIAL_UNRECOVERABLE — see DRA-ACQ-024 Phase 2.",
};

const ENTRY_0029: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0029",
  title:
    "Risk Factors for Legionella longbeachae Legionnaires' Disease, New Zealand (including Technical " +
    "Appendix Figure: causal diagram for compost use and Legionnaires' disease)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "Centers for Disease Control and Prevention (CDC), Emerging Infectious Diseases journal",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
  sourceReference: "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000032 (programme ref: DRA-ACQ-025). Freeze record: DRA-FRZ-000023. " +
    "Non-redundant whole-diagram raster-image robustness experiment — see DRA-ACQ-025 Phase 2.",
};

const ALL_PRIOR_ENTRIES: readonly CorpusDocumentInput[] = [
  ...PRIOR_CORPUS_ENTRIES,
  ENTRY_0023,
  ENTRY_0024,
  ENTRY_0025,
  ENTRY_0026,
  ENTRY_0027,
  ENTRY_0028,
  ENTRY_0029,
];

// ---------------------------------------------------------------------------
// Admission test (freeze + corpus integration only — no evaluator execution)
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-026 Phase 2A/2B — Controlled Corpus Admission WITHOUT Evaluator Execution for DRA-DOC-0030 (NIST SP 800-53 Rev 5)",
  () => {
    it(
      "reconfirms governance independently, establishes BYTE_STABLE reproducibility via two independent live " +
        "acquisitions, freezes and admits DRA-DOC-0030 into a 30-document corpus via the constituent freeze/" +
        "integration building blocks directly (NOT acquireFreezeAndEvaluate, which would force full Stage 4-7 " +
        "execution), and separately records genuine Stage 1-3 output measured directly against the complete " +
        "492-page document as observed evidence — without assigning any SUPPORTED/REVIEW/HOLD decision",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-026 PHASE 2A/2B — CORPUS ADMISSION LOG           ║");
        console.log("║  (Freeze + Admission WITHOUT evaluator execution)         ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const fetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });

        // ── Step 0: Stability check — two independent live fetches ─────────

        console.log("── Step 0: Stability Check — Two Independent Fetches ───────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000033",
          sourceUrl: NIST_SP80053_PDF_URL,
          requestedBy: "DRA-ACQ-026-stability-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology",
          expectedTitle: "NIST SP 800-53",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) console.error("First NIST fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000033",
          sourceUrl: NIST_SP80053_PDF_URL,
          requestedBy: "DRA-ACQ-026-stability-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology",
          expectedTitle: "NIST SP 800-53",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) console.error("Second NIST fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  Acquisition A HTTP status :", fetchA.source.httpStatus);
        console.log("  Acquisition A mediaType   :", fetchA.source.mediaType);
        console.log("  Acquisition A byte length :", fetchA.source.rawBytes.length);
        console.log("  Acquisition A sourceDigest:", digestA);
        console.log("  Acquisition B byte length :", fetchB.source.rawBytes.length);
        console.log("  Acquisition B sourceDigest:", digestB);
        console.log(`  raw bytes identical (A==B): ${digestA === digestB}`);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchB.source.httpStatus).toBe(200);
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(fetchA.source.rawBytes.length).toBe(EXPECTED_BYTE_LENGTH);
        expect(digestA).toBe(EXPECTED_SHA256);
        expect(digestA).toBe(digestB);

        console.log("  BYTE_STABLE: confirmed via two independent live acquisitions ✓");

        // ── Step 1: Setup — build 29-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 29-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  29-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(29);
        expect(registry.hasId("DRA-DOC-0030")).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-026",
          protocolStatus: "APPROVED",
          targetCorpusSize: 30,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Normalise the frozen bytes (pinned to fetchA) ───────────

        console.log("\n── Step 2: Normalisation (pdftotext -layout, full 492 pages) ─");

        const t0 = Date.now();
        const normResult = await normaliseContent(
          fetchA.source.rawBytes,
          "application/pdf",
          digestA,
          extractPdfText,
        );
        const normMs = Date.now() - t0;
        expect(normResult.ok).toBe(true);
        if (!normResult.ok) return;
        const normalised = normResult.document;

        console.log(`  normalisation time (ms): ${normMs}`);
        console.log(`  extracted text length  : ${normalised.text.length}`);
        console.log(`  textDigest             : ${normalised.textDigest}`);

        expect(normalised.text.length).toBeGreaterThan(3_000_000);

        // ── Step 3: Representation provenance + graphical-semantic risk ────

        console.log("\n── Step 3: Representation Provenance + Graphical-Semantic Risk ─");

        const representationAssessment = await assessRepresentationProvenance(
          "application/pdf",
          fetchA.source.rawBytes,
          normalised.text,
          probePdfRepresentation,
        );
        const graphicalSemanticAssessment = await assessGraphicalSemanticRisk(
          "application/pdf",
          fetchA.source.rawBytes,
          normalised.text,
          probePdfImageRegions,
        );

        console.log("  representation provenance:", representationAssessment.provenance);
        console.log("  representation fidelity  :", representationAssessment.fidelity);
        console.log("  graphical-semantic state  :", graphicalSemanticAssessment.state);

        expect(representationAssessment.provenance).toBe("NATIVE_TEXT");

        // ── Step 4: Eligibility ──────────────────────────────────────────────

        console.log("\n── Step 4: Freeze Eligibility ────────────────────────────────");

        const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);
        const eligibility = checkFreezeEligibility(
          fetchA.source,
          normalised,
          OFFICIAL_SOURCE_ASSESSMENT,
          LICENCE_ASSESSMENT,
          APPROVED_METADATA,
          "DRA-DOC-0030",
          INCLUSION_RATIONALE,
          registry,
          protocol,
          [],
        );

        console.log(`  eligible: ${eligibility.eligible}`);
        if (!eligibility.eligible) {
          console.error("  blocking reasons:", eligibility.blockingReasons);
        }
        expect(eligibility.eligible).toBe(true);

        // ── Step 5: Freeze (createAcquisitionFreezeRecord directly) ─────────
        //
        // NOTE: this deliberately does NOT call acquireFreezeAndEvaluate(),
        // which would invoke evaluateDocument() (Stages 1-7) internally and
        // fail/hang given Stage 4's measured scaling behaviour on this
        // document (see the scaling-characterization test below). Freeze and
        // corpus integration are evaluation-independent operations (confirmed
        // by direct source reading of freeze.ts / manifest-integration.ts),
        // so this is a fully legitimate use of the existing building blocks,
        // not a workaround that bypasses any governance check.

        console.log("\n── Step 5: Freeze (createAcquisitionFreezeRecord) ───────────");

        const freezeRecord = createAcquisitionFreezeRecord({
          freezeRecordId: "DRA-FRZ-000024",
          corpusDocumentId: "DRA-DOC-0030",
          acquisitionId: "DRA-ACQ-000033",
          sourceUrl: NIST_SP80053_PDF_URL,
          finalUrl: fetchA.source.finalUrl,
          sourceDigest: digestA,
          normalised,
          metadataDigest,
          frozenBy: "DRA-ACQ-026-human-governance-operator",
          benchmarkVersion: CORPUS_VERSION,
          fixedTimestamp: FREEZE_TIMESTAMP,
          representationAssessment,
          graphicalSemanticAssessment,
        });

        console.log("  freezeRecordId       :", freezeRecord.freezeRecordId);
        console.log("  corpusDocumentId     :", freezeRecord.corpusDocumentId);
        console.log("  acquisitionId        :", freezeRecord.acquisitionId);
        console.log("  sourceDigest         :", freezeRecord.sourceDigest);
        console.log("  normalisedTextDigest :", freezeRecord.normalisedTextDigest);
        console.log("  metadataDigest       :", freezeRecord.metadataDigest);
        console.log("  freezeRecordDigest   :", freezeRecord.freezeRecordDigest);
        console.log("  status               :", freezeRecord.status);

        expect(freezeRecord.freezeRecordId).toBe("DRA-FRZ-000024");
        expect(freezeRecord.corpusDocumentId).toBe("DRA-DOC-0030");
        expect(freezeRecord.acquisitionId).toBe("DRA-ACQ-000033");
        expect(freezeRecord.sourceDigest).toBe(EXPECTED_SHA256);
        expect(freezeRecord.normalisedTextDigest).toBeTruthy();
        expect(freezeRecord.metadataDigest).toBeTruthy();
        expect(freezeRecord.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(freezeRecord.status).toBe("FROZEN");

        // ── Step 6: Corpus integration (integrateWithCorpus directly) ───────

        console.log("\n── Step 6: Corpus Integration (30 documents) ────────────────");

        const integrationResult = integrateWithCorpus(freezeRecord, APPROVED_METADATA, registry);
        if (!integrationResult.ok) {
          console.error("Integration FAILED:", integrationResult.code, integrationResult.message);
        }
        expect(integrationResult.ok).toBe(true);
        if (!integrationResult.ok) return;

        const { manifest } = integrationResult;

        console.log(`  documentCount  : ${manifest.documentCount}`);
        console.log(`  overallDigest  : ${manifest.overallDigest}`);

        expect(manifest.documentCount).toBe(30);
        expect(manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(manifest.documentIds).toHaveLength(30);
        expect(manifest.documentIds[29]).toBe("DRA-DOC-0030");

        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(29);
        expect(manifest.documentIds.slice(0, 29)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 30 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(manifest.documentIds).size).toBe(30);

        const manifestIntact = verifyManifestIntegrity(manifest);
        console.log(`  manifest integrity check : ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
        expect(manifestIntact).toBe(true);

        const admittedInput = registry.get("DRA-DOC-0030");
        expect(admittedInput?.benchmarkStatus).toBe("FROZEN");
        console.log(
          `  DRA-DOC-0030 admitted with benchmarkStatus="FROZEN" — NO evaluation decision assigned. ` +
            `Evaluator execution status: ${NOT_COMPLETABLE_STATUS}.`,
        );

        // ── Step 7: Stage 1-3 observed evidence on the FULL document ────────
        //
        // Genuinely executed (not estimated) against all 492 pages. This is
        // the honest boundary of what completes in this environment: Stage 4
        // is NOT invoked here (see scaling-characterization test below for
        // why, with real measured data).

        console.log("\n── Step 7: Stage 1-3 Observed Evidence (FULL 492-page document) ─");

        const evalRequest = {
          id: "dra-doc-0030-stage1-3-evidence",
          requestedAt: FREEZE_TIMESTAMP,
          generatedDocument: {
            id: "dra-doc-0030-gdoc",
            title: APPROVED_METADATA.title,
            content: normalised.text,
            sourceDocumentIds: ["dra-doc-0030-sdoc"],
            generatedAt: FREEZE_TIMESTAMP,
          },
          sourceDocuments: [
            {
              id: "dra-doc-0030-sdoc",
              title: APPROVED_METADATA.title,
              content: normalised.text,
              format: "PLAIN_TEXT" as const,
            },
          ],
        };

        const s1t0 = Date.now();
        const s1 = normaliseEvaluationRequest(evalRequest);
        const s1Ms = Date.now() - s1t0;
        expect(s1.ok).toBe(true);
        if (!s1.ok) return;

        const s2t0 = Date.now();
        const s2 = extractClaims(s1.normalisedRequest);
        const s2Ms = Date.now() - s2t0;
        expect(s2.ok).toBe(true);
        if (!s2.ok) return;

        const s3t0 = Date.now();
        const s3 = resolveAuthority(s1.normalisedRequest, s2);
        const s3Ms = Date.now() - s3t0;
        expect(s3.ok).toBe(true);

        console.log(`  Stage 1 (normalisation)        : ${s1Ms} ms, ok=${s1.ok}`);
        console.log(`  Stage 2 (claim extraction)     : ${s2Ms} ms, statements=${s2.statements.length}`);
        console.log(`  Stage 3 (authority resolution) : ${s3Ms} ms, ok=${s3.ok}`);
        console.log(
          `  TOTAL Stage 1-3 time: ${s1Ms + s2Ms + s3Ms} ms for a 492-page / ${normalised.text.length}-char document`,
        );
        console.log(
          `  Stage 4 (evidence linkage) NOT executed against the full document — see the scaling-` +
            `characterization test in this file for the measured reason (${NOT_COMPLETABLE_STATUS}).`,
        );

        // This is the primary quantitative Stage-2 finding relied on by the
        // companion long-range-structural-robustness test file.
        expect(s2.statements.length).toBeGreaterThan(20_000);
        console.log(`\n  OBSERVED EVIDENCE — Stage 2 statement count: ${s2.statements.length}`);
      },
      280_000,
    );
  },
);

// ---------------------------------------------------------------------------
// Stage 4 (Evidence Linkage) scaling characterization
// ---------------------------------------------------------------------------
//
// Measures Stage 4's real running time on genuine, bounded-size prefixes of
// the actual extracted document text (not synthetic data), fits an O(n^2)
// model, and reports the extrapolated full-document time with its
// uncertainty. This is the primary evidentiary basis for the
// NOT_COMPLETABLE_IN_CURRENT_EXECUTION_ENVIRONMENT classification used
// throughout DRA-ACQ-026 Phase 2. Genuinely executed — not a stand-in or
// mock — but deliberately bounded to page counts that complete inside this
// single test's time budget.

describe("DRA-ACQ-026 Phase 2M — Stage 4 (Evidence Linkage) Scaling Characterization for DRA-DOC-0030", () => {
  it(
    "measures Stage 4 running time on real 20/40/60/80/100-page prefixes of the actual NIST SP 800-53 Rev 5 " +
      "text, confirms monotonically super-linear growth consistent with the previously-measured O(n^2) fit, " +
      "and reports (without asserting) the extrapolated full-document (25,603-statement) running time",
    async () => {
      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-ACQ-026 PHASE 2M — STAGE 4 SCALING CHARACTERIZATION   ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");

      const fetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 20_000_000,
        userAgent: "DRA-ENG-010/1.0",
        allowHttp: false,
      });

      const req = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000033",
        sourceUrl: NIST_SP80053_PDF_URL,
        requestedBy: "DRA-ACQ-026-scaling-test",
        requestedAt: REVIEW_TIMESTAMP,
        expectedPublisher: "National Institute of Standards and Technology",
        expectedTitle: "NIST SP 800-53",
      });
      expect(req.ok).toBe(true);
      if (!req.ok) return;

      const fetchResult = await fetcher(req.request, {});
      expect(fetchResult.ok).toBe(true);
      if (!fetchResult.ok) return;

      const fullText = await extractPdfText(fetchResult.source.rawBytes);
      const pages = fullText.split("\f");
      console.log(`  Total pages (form-feed split): ${pages.length}`);

      const pageCounts = [20, 40, 60, 80, 100];
      const dataPoints: Array<{ pageCount: number; statementCount: number; stage4Ms: number }> = [];

      for (const n of pageCounts) {
        const subsetText = pages.slice(0, n).join("\f");
        const req2 = {
          id: `dra-doc-0030-scaling-${n}`,
          requestedAt: FREEZE_TIMESTAMP,
          generatedDocument: {
            id: `gdoc-${n}`,
            title: `NIST SP 800-53 Rev 5 (first ${n} pages)`,
            content: subsetText,
            sourceDocumentIds: [`sdoc-${n}`],
            generatedAt: FREEZE_TIMESTAMP,
          },
          sourceDocuments: [{ id: `sdoc-${n}`, title: "Source", content: subsetText, format: "PLAIN_TEXT" as const }],
        };

        const s1 = normaliseEvaluationRequest(req2);
        expect(s1.ok).toBe(true);
        if (!s1.ok) continue;
        const s2 = extractClaims(s1.normalisedRequest);
        expect(s2.ok).toBe(true);
        if (!s2.ok) continue;
        const s3 = resolveAuthority(s1.normalisedRequest, s2);
        expect(s3.ok).toBe(true);
        if (!s3.ok) continue;

        const t4 = Date.now();
        const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
        const stage4Ms = Date.now() - t4;
        expect(s4.ok).toBe(true);

        console.log(
          `  pages=${n}  statements=${s2.statements.length}  Stage4=${stage4Ms}ms`,
        );
        dataPoints.push({ pageCount: n, statementCount: s2.statements.length, stage4Ms });
      }

      expect(dataPoints.length).toBe(pageCounts.length);

      // ── Confirm monotonic growth (real measured property, not assumed) ──
      for (let i = 1; i < dataPoints.length; i++) {
        expect(dataPoints[i].stage4Ms).toBeGreaterThan(dataPoints[i - 1].stage4Ms);
      }

      // ── Fit a quadratic coefficient k in stage4Ms ≈ k * statementCount^2 ─
      const coefficients = dataPoints.map((d) => d.stage4Ms / (d.statementCount * d.statementCount));
      const meanK = coefficients.reduce((a, b) => a + b, 0) / coefficients.length;
      const minK = Math.min(...coefficients);
      const maxK = Math.max(...coefficients);

      console.log("\n  Per-point quadratic coefficients (ms / statement^2):");
      for (const [i, d] of dataPoints.entries()) {
        console.log(`    n=${d.statementCount}: k=${coefficients[i].toExponential(4)}`);
      }
      console.log(`  Mean k = ${meanK.toExponential(4)}  (range ${minK.toExponential(4)} .. ${maxK.toExponential(4)})`);

      // ── Extrapolate to the real, measured full-document statement count ─
      // (25,603, independently confirmed in the admission test above).
      const FULL_DOCUMENT_STATEMENT_COUNT = 25_603;
      const extrapolatedMsMean = meanK * FULL_DOCUMENT_STATEMENT_COUNT * FULL_DOCUMENT_STATEMENT_COUNT;
      const extrapolatedMsLow = minK * FULL_DOCUMENT_STATEMENT_COUNT * FULL_DOCUMENT_STATEMENT_COUNT;
      const extrapolatedMsHigh = maxK * FULL_DOCUMENT_STATEMENT_COUNT * FULL_DOCUMENT_STATEMENT_COUNT;

      console.log(
        `\n  EXTRAPOLATED full-document (${FULL_DOCUMENT_STATEMENT_COUNT} statements) Stage 4 time:`,
      );
      console.log(`    mean estimate : ${(extrapolatedMsMean / 60_000).toFixed(1)} minutes`);
      console.log(
        `    range         : ${(extrapolatedMsLow / 60_000).toFixed(1)} .. ${(extrapolatedMsHigh / 60_000).toFixed(1)} minutes`,
      );
      console.log(
        `\n  CLASSIFICATION: ${NOT_COMPLETABLE_STATUS}. This is a measured property of the current Stage 4 ` +
          "algorithm's time complexity combined with this execution environment's per-invocation constraints " +
          "(no persistent background execution across tool calls; hard per-call time ceilings) — NOT evidence " +
          "that DRA is fundamentally unable to evaluate documents of this size. A follow-up engineering ticket " +
          "should investigate Stage 4's O(n^2) behaviour and apportion cause between algorithmic complexity and " +
          "execution infrastructure.",
      );

      // Sanity: the extrapolated time should be on the order of tens of
      // minutes, not seconds — this is the whole point of the finding.
      expect(extrapolatedMsMean).toBeGreaterThan(10 * 60_000);
    },
    280_000,
  );
});
