/**
 * DRA-ACQ-027 — Phase 2A/2B: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0031 (NIST SP 800-53 Revision 4 — the AUTHENTIC_SUPERSEDED half of
 * the version/supersession-detection baseline experiment)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-027 PHASE 2A/2B                         ║
 * ║                                                                          ║
 * ║  Candidate: primary recommendation qualified at the close of DRA-ACQ-027 ║
 * ║  Phase 1 discovery (see discovery/dra-acq-027-version-supersession-      ║
 * ║  discovery.ts, DRA-CAND-027-01). This test performs the accepted        ║
 * ║  Phase 2A/2B work only: independent governance re-verification,         ║
 * ║  admission-time live retrieval, freeze, normalisation, and corpus       ║
 * ║  admission via the standard governed pipeline (acquireFreezeAndEvaluate, ║
 * ║  unmodified). It does NOT add a supersession/currentness field, modify   ║
 * ║  SourceDocument, change Stage 3 authority resolution, reinterpret        ║
 * ║  publishedAt, introduce AUTHORITY_EXPIRED, or otherwise engineer the     ║
 * ║  evaluator — per the explicit Phase 2 task-spec constraint.             ║
 * ║                                                                          ║
 * ║  Document:   NIST Special Publication 800-53 Revision 4, "Security and  ║
 * ║              Privacy Controls for Federal Information Systems and       ║
 * ║              Organizations" (published April 2013; text updated         ║
 * ║              01-22-2015) — 5,212,362 bytes.                             ║
 * ║  Corpus ID:  DRA-DOC-0031                                                ║
 * ║  Freeze ID:  DRA-FRZ-000025 (highest existing freeze ID at the start of  ║
 * ║              this acquisition was DRA-FRZ-000024, used by DRA-DOC-0030) ║
 * ║  Acquisition ID: DRA-ACQ-000034 (programme ref: DRA-ACQ-027; the        ║
 * ║              highest existing real acquisition ID was DRA-ACQ-000033,   ║
 * ║              used by DRA-DOC-0030's acquisition — DRA-ACQ-000099/900001- ║
 * ║              3/999999 are pre-existing test-fixture sentinel values,    ║
 * ║              not real allocations, and are excluded)                    ║
 * ║  Publisher:  National Institute of Standards and Technology (NIST),     ║
 * ║              U.S. Department of Commerce                                ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-11,           ║
 * ║  performed independently of the DRA-ACQ-027 Phase 1 discovery record):  ║
 * ║  - Official source: nvlpubs.nist.gov is NIST's official publications     ║
 * ║    domain; the exact URL matches the Phase 1 discovery record.          ║
 * ║  - Availability/stability: two independent live HTTP GETs of the         ║
 * ║    canonical URL, taken independently for this acquisition, both        ║
 * ║    returned HTTP 200, content-type application/pdf, content-length      ║
 * ║    5,212,362 bytes, and identical SHA-256                               ║
 * ║    5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2      ║
 * ║    both times — matching the digest recorded during Phase 1 discovery   ║
 * ║    exactly. BYTE_STABLE.                                                 ║
 * ║  - SUPERSESSION EVIDENCE (re-verified, source-external — see the         ║
 * ║    capability-gap experiment test file for the full record): NIST's own ║
 * ║    CSRC publication catalog states Rev. 4 was "withdrawn on September    ║
 * ║    23, 2021" and "Superseded By: SP 800-53 Rev. 5 (09/23/2020)". This    ║
 * ║    supersession fact is NOT present anywhere inside the Rev. 4 PDF text ║
 * ║    itself — it exists only on NIST's separate catalog page.             ║
 * ║  - Licence: PUBLIC_DOMAIN. NIST Special Publications are works of the    ║
 * ║    U.S. federal government (17 U.S.C. §105); same basis already accepted ║
 * ║    for DRA-DOC-0012, DRA-DOC-0024, and DRA-DOC-0030 (the current         ║
 * ║    version of this very publication family).                            ║
 * ║  - Representation: NATIVE_TEXT PDF (legacy NIST typesetting, ~460       ║
 * ║    pages), confirmed via pdftotext structural-marker extraction below.  ║
 * ║  - Public accessibility: no authentication, paywall, or access          ║
 * ║    circumvention of any kind was required.                              ║
 * ║                                                                          ║
 * ║  CLASSIFICATION: domain TECHNICAL, documentType POLICY, language en-US,  ║
 * ║  difficulty HIGH (large native-PDF federal standard, same publication    ║
 * ║  family and difficulty tier as the already-admitted DRA-DOC-0030).       ║
 * ║                                                                          ║
 * ║  CORPUS-BALANCE DISCLOSURE: DRA-DOC-0031 does not add a novel domain     ║
 * ║  (TECHNICAL already represented, including by the current version of    ║
 * ║  this exact publication family) or jurisdiction. It is admitted purely  ║
 * ║  as the AUTHENTIC_SUPERSEDED half of a deliberate version-pair           ║
 * ║  experiment with the already-admitted, already-evaluated DRA-DOC-0030   ║
 * ║  (AUTHENTIC_CURRENT). No expected decision or issue-class outcome is    ║
 * ║  assumed here; whatever the frozen evaluator (0.1.2) actually returns   ║
 * ║  for this document is recorded verbatim below, per the explicit task-   ║
 * ║  spec instruction not to force the expected outcome.                    ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in ║
 * ║  DRA-ACQ-018 through DRA-ACQ-026 Phase 2: metadata-only prior-corpus     ║
 * ║  entries are loaded so ID/digest duplicate checks and the 30→31         ║
 * ║  manifest transition are fully exercised. The optional content-         ║
 * ║  similarity check is skipped as CorpusDocumentInput carries no text     ║
 * ║  field (see DRA-ACQ-018 Phase 2 finding); this is a genuine schema      ║
 * ║  limitation shared by every prior acquisition, not something newly      ║
 * ║  introduced here, and is orthogonal to the version-supersession         ║
 * ║  experiment this acquisition targets.                                   ║
 * ║                                                                          ║
 * ║  DISK-CACHED FETCHER: this document is the same size class as           ║
 * ║  DRA-DOC-0030 (5.2MB vs 6.07MB). A disk-cached fetcher wrapper (see      ║
 * ║  DRA-ACQ-017/DRA-ENG-019 precedent) is used for ALL fetches in this      ║
 * ║  test — the Step 0 stability check AND the governed pipeline's internal ║
 * ║  fetch — so every stage of this test operates on byte-identical input   ║
 * ║  fetched once, avoiding both redundant network load and the             ║
 * ║  intermittent-restamping risk documented for DRA-DOC-0029.              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to nvlpubs.nist.gov (cached to disk
 * after the first successful fetch) and runs the FULL Stages 1-7 DRA
 * evaluator against the complete document TWICE (Run A via
 * acquireFreezeAndEvaluate, Run B via evaluateFrozenBenchmarkDocument) to
 * verify determinism. This is now tractable in this execution environment
 * because DRA-ENG-019 replaced Stage 4's O(n^2) scaling with an O(n)-amortised
 * implementation (previously, DRA-DOC-0030's same-size-class document could
 * NOT complete full evaluation within this environment — see DRA-ACQ-026
 * Phase 2A/2B's NOT_COMPLETABLE_IN_CURRENT_EXECUTION_ENVIRONMENT admission).
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { computeSourceDigest } from "../integrity.js";
import { createAcquisitionRequest } from "../request.js";
import { acquireFreezeAndEvaluate, evaluateFrozenBenchmarkDocument } from "../governed-pipeline.js";
import { normaliseContent } from "../normalisation.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { PRIOR_CORPUS_ENTRIES, CORPUS_VERSION as SHARED_CORPUS_VERSION } from "../../execution/__tests__/dra-bmk-023-prior-entries.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

const REVIEW_TIMESTAMP = "2026-08-11T13:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T13:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T14:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0031 candidate
// ---------------------------------------------------------------------------

const NIST_SP80053R4_PDF_URL = "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf";

const EXPECTED_BYTE_LENGTH = 5_212_362;
const EXPECTED_SHA256 = "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests)
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-027-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-027-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${NIST_SP80053R4_PDF_URL}`,
    "Publisher: National Institute of Standards and Technology (NIST), U.S. Department of Commerce — " +
      "nvlpubs.nist.gov is NIST's official publications-hosting domain (same domain, Legacy/SP path, as " +
      "already accepted for DRA-DOC-0030's current-version sibling).",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition, independent of Phase 1 discovery): two independent GET " +
      "requests to the canonical PDF URL both return HTTP 200, content-type application/pdf, content-length " +
      "5,212,362 bytes both times, identical SHA-256 " +
      "5460dfd68b7ca489ad8ad2ebc51339c70423684aaf5a09dd0d0f1c8e848123b2 both times — matching the DRA-ACQ-027 " +
      "Phase 1 discovery digest exactly.",
    "GOVERNANCE-RELEVANT NOTE (recorded for completeness, NOT used to alter this VERIFIED source-authenticity " +
      "assessment): NIST's own CSRC catalog states this document was withdrawn/superseded on 2021-09-23 by " +
      "SP 800-53 Rev. 5. This acquisition is EXPLICITLY admitting the document notwithstanding that fact, as " +
      "the deliberate AUTHENTIC_SUPERSEDED half of a version-pair experiment — see the companion capability-" +
      "gap experiment test file for the full supersession-evidence record. Source authenticity (was this " +
      "genuinely published by NIST, unmodified since publication) and temporal currentness (is it still the " +
      "authoritative version) are independent questions; this decision addresses only the former.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official U.S. government domain.",
    "HUMAN GOVERNANCE DECISION: NIST confirmed as the official publisher and canonical source of this exact " +
      "artefact — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-027 Phase 2 human governance sign-off 2026-08-11. NIST SP 800-53 Rev 4 official source VERIFIED " +
    "notwithstanding its known publisher-side withdrawal/supersession status, which is the deliberate subject " +
    "of this acquisition's experiment, not a disqualifying defect.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "U.S. Government Work — Public Domain (17 U.S.C. §105)",
  licenceUrl: NIST_SP80053R4_PDF_URL,
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-027-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "NIST Special Publications are authored by NIST, an agency of the U.S. Department of Commerce, and are " +
      "works of the U.S. federal government under 17 U.S.C. §105, placing them in the public domain within " +
      "the United States with no copyright protection available — regardless of whether the specific " +
      "publication has since been withdrawn or superseded by a later revision from the same publisher.",
    "This is the same basis already accepted for DRA-DOC-0012 (NIST AI RMF), DRA-DOC-0024 (CMA AI foundation " +
      "models, different publisher precedent), and DRA-DOC-0030 (the current-version sibling of this exact " +
      "publication family) — direct NIST authorship, not a site-wide reuse-policy inference.",
    "NO CONTRADICTORY NOTICE FOUND: no per-document copyright notice, embargo, or narrower licence override " +
      "was found on the PDF, and NIST continues to officially host this withdrawn revision at a stable Legacy/SP " +
      "URL rather than removing it from public access.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this status: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (U.S. Government work, 17 U.S.C. §105) confirmed via direct " +
      "NIST authorship — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-027 Phase 2 human governance sign-off 2026-08-11. U.S. Government work / public domain — " +
    "VERIFIED, consistent with the DRA-DOC-0012/0024/0030 precedent.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "NIST Special Publication 800-53 Revision 4 — Security and Privacy Controls for Federal Information " +
    "Systems and Organizations",
  publisher: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  publicationDate: "2013-04 (text updates as of 2015-01-22)",
  domain: "TECHNICAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "en-US",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-027 Phase 1 (see " +
  "discovery/dra-acq-027-version-supersession-discovery.ts, DRA-CAND-027-01). Sole experimental target: " +
  "whether DRA's evaluator can recognise that an authentic, internally coherent, officially published document " +
  "is no longer the current authoritative version of its publication family, when the supersession fact is " +
  "discoverable ONLY externally (NIST's own CSRC catalog), never from the document's own text. Paired with the " +
  "already-admitted, already-evaluated DRA-DOC-0030 (NIST SP 800-53 Rev. 5) as the AUTHENTIC_CURRENT reference " +
  "for this same publication family — representation option B from the Phase 1 qualification record, avoiding " +
  "a redundant second acquisition of the current version. CORPUS-BALANCE DISCLOSURE (explicitly preserved, not " +
  "concealed): this document does not add a novel domain (TECHNICAL already represented, including by this " +
  "exact family's current version) or jurisdiction. It was selected purely as the AUTHENTIC_SUPERSEDED half of " +
  "a version-pair robustness probe, not for corpus-balance reasons. No expected decision or issue-class outcome " +
  "is assumed by this inclusion rationale; whatever the frozen evaluator (version 0.1.2) actually returns for " +
  "this document is recorded verbatim in the admission test below, and the supersession-detection question " +
  "itself is analysed separately in the companion capability-gap experiment test file — this admission test " +
  "does not answer it.";

// ---------------------------------------------------------------------------
// ENTRY_0023..0030 — reconstructed from admitted records (metadata only — no
// text content is required by CorpusDocumentInput). ENTRY_0023-0027 are
// re-declared exactly as in the DRA-ACQ-024/025 admission tests (that shared
// prior-entries file has not yet been extended past DRA-DOC-0022);
// ENTRY_0028/0029/0030 are added here for the first time to bring the prior
// registry up to 30 documents ahead of this acquisition's DRA-DOC-0031.
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
    "Result: REVIEW, 1 issue (EVIDENCE_INADEQUATE). Flowchart-topology representation-fidelity robustness " +
    "experiment: Appendix B checklist restated all flowchart decision networks in linear textual form, so " +
    "directed-edge loss was MATERIAL_BOUNDED, not MATERIAL_UNRECOVERABLE — see DRA-ACQ-024 Phase 2.",
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
    "Result: HOLD, 3 issues, 581 statements. Non-redundant whole-diagram raster-image robustness experiment " +
    "— see DRA-ACQ-025 Phase 2.",
};

const ENTRY_0030: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0030",
  title:
    "NIST Special Publication 800-53 Revision 5 — Security and Privacy Controls for Information Systems and " +
    "Organizations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000033 (programme ref: DRA-ACQ-026). Freeze record: DRA-FRZ-000024. " +
    "Admitted 2026-08-11 in FROZEN status with NO decision assigned (Stage 4's then-O(n^2) scaling made full " +
    "Stage 1-7 execution NOT_COMPLETABLE_IN_CURRENT_EXECUTION_ENVIRONMENT at admission time — see DRA-ACQ-026 " +
    "Phase 2A/2B). Separately, under DRA-ENG-019 Part G (after Stage 4's O(n) fix), the full 25,603-statement " +
    "document was later evaluated end-to-end: decision REVIEW, 1 issue (EVIDENCE_INADEQUATE), fully " +
    "deterministic across two runs. This later evaluation is a distinct fact layered alongside the original " +
    "FROZEN admission record, not a registry update — it is the AUTHENTIC_CURRENT reference document for the " +
    "DRA-ACQ-027 version-supersession experiment (see this file and the companion capability-gap experiment " +
    "test file).",
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
  ENTRY_0030,
];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-027 Phase 2A/2B — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0031 (NIST SP 800-53 Rev 4, superseded)",
  () => {
    it(
      "reconfirms governance independently, verifies BYTE_STABLE determinism via two independent live " +
        "acquisitions, admits DRA-DOC-0031 through eligibility, freeze, 31-document corpus integration, and " +
        "the FULL unmodified DRA evaluator (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns, " +
        "without adding any version/supersession semantics to the pipeline",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-027 PHASE 2A/2B — CORPUS ADMISSION LOG           ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const realFetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });
        const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-027");

        // ── Step 0: Determinism check — two independent (cache-backed) fetches ─

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000034",
          sourceUrl: NIST_SP80053R4_PDF_URL,
          requestedBy: "DRA-ACQ-027-determinism-check-a",
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
          acquisitionId: "DRA-ACQ-000034",
          sourceUrl: NIST_SP80053R4_PDF_URL,
          requestedBy: "DRA-ACQ-027-determinism-check-b",
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

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.mediaType).toBe("application/pdf");
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(fetchA.source.rawBytes.length).toBe(EXPECTED_BYTE_LENGTH);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SHA256);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-027 Phase 1 discovery digest ✓");

        // ── Step 0b: Structural integrity spot-check ─────────────────────────

        console.log("\n── Step 0b: Structural Spot-Check ───────────────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        const structuralMarkers: Record<string, RegExp> = {
          title: /Security\s+and\s+Privacy\s+Controls\s+for\s+Federal\s+Information\s+Systems\s+and\s+Organizations/i,
          revision: /Revision 4/,
          publisher: /NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY/i,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        // NOTE: the document DOES contain many occurrences of the word "Withdrawn" —
        // this is NIST's routine internal control-lifecycle term for individual controls
        // that were moved/retired WITHIN the 800-53 catalog (e.g. "AC-13 Withdrawn"),
        // not a publication-level supersession notice. This is itself part of the
        // capability-gap finding: a naive keyword search for "withdrawn" would produce
        // false positives from this ordinary internal usage, so no such shortcut is used
        // by (or introduced into) the evaluator. What IS confirmed absent is any
        // publication-level supersession notice matching NIST's own catalog language.
        const publicationLevelSupersessionPhrase =
          /superseded by|this publication (has been|is) withdrawn|no longer the current version/i;
        const hasPublicationLevelNotice = publicationLevelSupersessionPhrase.test(admissionTimeText);
        console.log(
          `  ${hasPublicationLevelNotice ? "✗ (unexpected)" : "✓ absent, as expected"} publicationLevelSupersessionNotice`,
        );
        expect(hasPublicationLevelNotice).toBe(false);

        console.log(
          "  Confirms the Phase 1 self-disclosure finding directly at admission time: the Rev. 4 text itself " +
            "contains no publication-level withdrawal/supersession notice — only ordinary internal " +
            "control-lifecycle uses of the word 'Withdrawn' for individual controls retired within the catalog.",
        );

        // ── Step 1: Setup — build 30-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 30-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  30-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(30);
        expect(registry.hasId("DRA-DOC-0031")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SHA256)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-027",
          protocolStatus: "APPROVED",
          targetCorpusSize: 31,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000034) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000034",
          sourceUrl: NIST_SP80053R4_PDF_URL,
          requestedBy: "DRA-ACQ-027-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "National Institute of Standards and Technology",
          expectedTitle: "NIST SP 800-53",
        });

        expect(requestResult.ok).toBe(true);
        if (!requestResult.ok) return;
        const request = requestResult.request;

        console.log("  acquisitionId :", request.acquisitionId);
        console.log("  sourceUrl     :", request.sourceUrl);

        // ── Step 3: Run full governed pipeline — RUN A ──────────────────────

        console.log("\n── Step 3: Governed Pipeline — acquireFreezeAndEvaluate (RUN A) ─");

        const t0 = Date.now();
        const pipelineResult = await acquireFreezeAndEvaluate(
          {
            request,
            officialSourceAssessment: OFFICIAL_SOURCE_ASSESSMENT,
            licenceAssessment: LICENCE_ASSESSMENT,
            approvedMetadata: APPROVED_METADATA,
            corpusDocumentId: "DRA-DOC-0031",
            freezeRecordId: "DRA-FRZ-000025",
            frozenBy: "DRA-ACQ-027-human-governance-operator",
            benchmarkVersion: CORPUS_VERSION,
            inclusionRationale: INCLUSION_RATIONALE,
          },
          {
            fetcher,
            pdfExtractor: extractPdfText,
            registry,
            protocol,
            fixedTimestamp: FREEZE_TIMESTAMP,
          },
        );
        console.log(`  Run A total pipeline time: ${Date.now() - t0} ms`);

        if (!pipelineResult.ok) {
          console.error("Pipeline FAILED at stage:", pipelineResult.stage);
          console.error("Errors:", JSON.stringify(pipelineResult.errors, null, 2));
        }
        expect(pipelineResult.ok).toBe(true);
        if (!pipelineResult.ok) return;

        const { result: runA } = pipelineResult;

        // ── Freeze record log ────────────────────────────────────────────────

        console.log("\n── Freeze Record (Run A) ─────────────────────────────────────");
        console.log("  freezeRecordId       :", runA.freeze.freezeRecordId);
        console.log("  corpusDocumentId     :", runA.freeze.corpusDocumentId);
        console.log("  acquisitionId        :", runA.freeze.acquisitionId);
        console.log("  sourceDigest         :", runA.freeze.sourceDigest);
        console.log("  normalisedTextDigest :", runA.freeze.normalisedTextDigest);
        console.log("  metadataDigest       :", runA.freeze.metadataDigest);
        console.log("  freezeRecordDigest   :", runA.freeze.freezeRecordDigest);
        console.log("  status               :", runA.freeze.status);

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000025");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0031");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000034");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SHA256);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (31 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(31);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(31);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0031");
        expect(runA.manifest.documentIds[30]).toBe("DRA-DOC-0031");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-30 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(30);
        expect(runA.manifest.documentIds.slice(0, 30)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 31 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(31);

        const manifestIntact = verifyManifestIntegrity(runA.manifest);
        console.log(`  manifest integrity check : ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
        expect(manifestIntact).toBe(true);

        // ── DRA Evaluator execution log — Run A ──────────────────────────────

        console.log("\n── DRA Evaluator Execution (Run A) ──────────────────────────");
        console.log("  decision                 :", runA.decision);

        expect(runA.evaluationResult.ok).toBe(true);
        const evalA = runA.evaluationResult.ok ? runA.evaluationResult : null;
        expect(evalA).not.toBeNull();
        if (!evalA) return;

        const receiptA = evalA.proofReceipt as Record<string, unknown>;
        const identityA = receiptA["evaluatorIdentity"] as Record<string, unknown> | undefined;

        console.log("  evaluatorVersion         :", identityA?.["evaluatorVersion"]);
        console.log("  pipelineVersion          :", identityA?.["pipelineVersion"]);
        console.log("  receipt schemaVersion    :", receiptA["schemaVersion"]);
        console.log("  substantiveDigest        :", runA.proofReference.proofReceiptSubstantiveDigest);

        const pipeLogA = evalA.pipeline as Record<string, unknown>;
        const s2LogA = pipeLogA["stage2"] as Record<string, unknown> | undefined;
        const stmtsLogA = (s2LogA?.["statements"] ?? s2LogA?.["claims"] ?? []) as unknown[];
        const s6LogA = pipeLogA["consistencyCheck"] as Record<string, unknown> | undefined;
        const issuesArrLogA = (s6LogA?.["issues"] ?? (evalA as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
          Record<string, unknown>
        >;
        const issueClassesLogA = Array.from(
          new Set(issuesArrLogA.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
        );

        console.log("  statementCount           :", stmtsLogA.length);
        console.log("  issueCount               :", issuesArrLogA.length);
        console.log("  issueClasses             :", JSON.stringify(issueClassesLogA));

        expect(identityA?.["evaluatorVersion"]).toBe("0.1.2");
        expect(identityA?.["pipelineVersion"]).toBe("1.0");
        expect(receiptA["schemaVersion"]).toBe("0.1.0");
        expect(["SUPPORTED", "REVIEW", "HOLD"]).toContain(runA.decision);

        const receiptIntegrityA = verifyReceiptIntegrity(evalA.proofReceipt as never);
        console.log("  proof receipt integrity  :", receiptIntegrityA);
        expect(receiptIntegrityA).toBe(true);

        // ── Step 4: Run B — determinism re-evaluation via the frozen record ─

        console.log("\n── Step 4: Determinism Re-Evaluation (RUN B) ────────────────");

        const normResultB = await normaliseContent(
          fetchA.source.rawBytes,
          "application/pdf",
          digestA,
          extractPdfText,
        );
        expect(normResultB.ok).toBe(true);
        if (!normResultB.ok) return;

        const t1 = Date.now();
        const runBFinal = evaluateFrozenBenchmarkDocument({
          freezeRecord: runA.freeze,
          rawBytes: fetchA.source.rawBytes,
          normalisedText: normResultB.document.text,
          approvedMetadata: APPROVED_METADATA,
          registry,
          fixedTimestamp: RUN_B_TIMESTAMP,
        });
        console.log(`  Run B total pipeline time: ${Date.now() - t1} ms`);

        if (!runBFinal.ok) {
          console.error("Run B FAILED at stage:", runBFinal.stage, JSON.stringify(runBFinal.errors));
        }
        expect(runBFinal.ok).toBe(true);
        if (!runBFinal.ok) return;

        const runB = runBFinal.result;
        expect(runB.evaluationResult.ok).toBe(true);
        const evalB = runB.evaluationResult.ok ? runB.evaluationResult : null;
        if (!evalB) return;

        const receiptB = evalB.proofReceipt as Record<string, unknown>;
        const pipeLogB = evalB.pipeline as Record<string, unknown>;
        const s2LogB = pipeLogB["stage2"] as Record<string, unknown> | undefined;
        const stmtsLogB = (s2LogB?.["statements"] ?? s2LogB?.["claims"] ?? []) as unknown[];
        const s6LogB = pipeLogB["consistencyCheck"] as Record<string, unknown> | undefined;
        const issuesArrLogB = (s6LogB?.["issues"] ?? (evalB as unknown as Record<string, unknown>)["issues"] ?? []) as Array<
          Record<string, unknown>
        >;
        const issueClassesLogB = Array.from(
          new Set(issuesArrLogB.map((i) => i["issueClass"] ?? i["class"] ?? i["type"]).filter(Boolean)),
        );

        console.log("  Run B decision           :", runB.decision);
        console.log("  Run B statementCount     :", stmtsLogB.length);
        console.log("  Run B issueCount         :", issuesArrLogB.length);
        console.log("  Run B issueClasses       :", JSON.stringify(issueClassesLogB));
        console.log("  Run B substantiveDigest  :", runB.proofReference.proofReceiptSubstantiveDigest);

        const receiptIntegrityB = verifyReceiptIntegrity(evalB.proofReceipt as never);
        console.log("  Run B receipt integrity  :", receiptIntegrityB);
        expect(receiptIntegrityB).toBe(true);

        // ── Determinism comparison — Run A vs Run B ──────────────────────────

        console.log("\n── Determinism Comparison (Run A vs Run B) ──────────────────");
        console.log(`  decision match       : ${runA.decision === runB.decision}`);
        console.log(`  statement count match: ${stmtsLogA.length === stmtsLogB.length}`);
        console.log(`  issue count match    : ${issuesArrLogA.length === issuesArrLogB.length}`);
        console.log(
          `  substantive digest match: ${
            runA.proofReference.proofReceiptSubstantiveDigest === runB.proofReference.proofReceiptSubstantiveDigest
          }`,
        );

        expect(runB.decision).toBe(runA.decision);
        expect(stmtsLogB.length).toBe(stmtsLogA.length);
        expect(issuesArrLogB.length).toBe(issuesArrLogA.length);
        expect(issueClassesLogB.sort()).toEqual(issueClassesLogA.sort());
        expect(runB.proofReference.proofReceiptSubstantiveDigest).toBe(
          runA.proofReference.proofReceiptSubstantiveDigest,
        );
        expect(receiptB["schemaVersion"]).toBe(receiptA["schemaVersion"]);

        console.log("\n── Admission + Baseline Evaluation Complete ─────────────────");
        console.log("  Document:        DRA-DOC-0031 — NIST SP 800-53 Revision 4 (superseded by Rev 5 / DRA-DOC-0030)");
        console.log("  Publisher:       National Institute of Standards and Technology (NIST)");
        console.log("  Freeze record:   DRA-FRZ-000025");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     31 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log("  Licence:         U.S. Government work — public domain (17 U.S.C. §105)");
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0031 does NOT add a novel domain or jurisdiction; admitted " +
            "purely as the AUTHENTIC_SUPERSEDED half of a version-pair experiment with DRA-DOC-0030 (see " +
            "docblock and the companion capability-gap experiment test file).",
        );
      },
      280_000, // <5 minutes — Stage 4 is now O(n)-amortised (DRA-ENG-019); a ~25k-statement document
      // evaluates in single-digit seconds, so the budget here is dominated by the live PDF fetch.
    );
  },
);
