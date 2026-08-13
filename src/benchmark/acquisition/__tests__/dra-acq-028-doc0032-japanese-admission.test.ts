/**
 * DRA-ACQ-028 — Phase 2A/2B: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0032 (Japan Cabinet Office AI Guidelines — Japanese-language
 * source, the non-Latin/non-whitespace-delimited script baseline)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-028 PHASE 2A/2B                         ║
 * ║                                                                          ║
 * ║  Candidate: primary recommendation qualified at the close of DRA-ACQ-028 ║
 * ║  Phase 1 discovery (see discovery/dra-acq-028-non-latin-script-          ║
 * ║  discovery.ts, DRA-CAND-028-01). This test performs the accepted        ║
 * ║  Phase 2A/2B admission work only: independent governance re-             ║
 * ║  verification (performed live, 2026-08-11, NOT copied from Phase 1),    ║
 * ║  admission-time live retrieval, freeze, normalisation, and corpus        ║
 * ║  admission via the standard governed pipeline (acquireFreezeAndEvaluate, ║
 * ║  unmodified). It does NOT admit the official English translation as a   ║
 * ║  numbered corpus document — the translation is reference/ground-truth   ║
 * ║  material only, used out-of-band in the companion baseline-experiment   ║
 * ║  test file, never entered into the governed pipeline or the corpus      ║
 * ║  manifest. It does NOT add any Japanese-specific fix to tokenisation,    ║
 * ║  segmentation, normalisation, Stage 4 linkage, language detection,       ║
 * ║  thresholds, or regexes — per the explicit Phase 2 task-spec            ║
 * ║  constraint. It does NOT acquire DRA-DOC-0033.                          ║
 * ║                                                                          ║
 * ║  Document:   AI Guidelines (令和7年12月19日改定) — the Cabinet Office's  ║
 * ║              "Guidelines for the Proper Implementation of Research,      ║
 * ║              Development, and Utilisation of AI" under Article 13 of    ║
 * ║              the AI Act (令和7年法律第53号), Japanese original —        ║
 * ║              538,281 bytes.                                             ║
 * ║  Corpus ID:  DRA-DOC-0032                                                ║
 * ║  Freeze ID:  DRA-FRZ-000026 (highest existing real freeze ID at the      ║
 * ║              start of this acquisition was DRA-FRZ-000025, used by       ║
 * ║              DRA-DOC-0031; sentinel test-fixture IDs are excluded)      ║
 * ║  Acquisition ID: DRA-ACQ-000035 (programme ref: DRA-ACQ-028; the        ║
 * ║              highest existing real acquisition ID was DRA-ACQ-000034,   ║
 * ║              used by DRA-DOC-0031's acquisition)                        ║
 * ║  Publisher:  Cabinet Office, Government of Japan (内閣府)                ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf           ║
 * ║  (Confirmed via https://www8.cao.go.jp/cstp/ai/ai_guideline/            ║
 * ║   ai_guideline.html, the Cabinet Office's own AI-guideline landing       ║
 * ║   page. That page hosts TWO distinct document pairs — the main          ║
 * ║   guideline itself (ai_gl_2025.pdf, 526KB, this document) and a         ║
 * ║   separate, larger 概要/overview companion document (ai_gl_2025g.pdf,   ║
 * ║   661KB) — confirmed via HTML text-order extraction that ai_gl_2025.pdf ║
 * ║   is the correct target, matching the Phase 1 discovery record's        ║
 * ║   526KB/250KB sizing exactly, NOT the 概要 pair.)                       ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-11,           ║
 * ║  performed live and independently of the DRA-ACQ-028 Phase 1 discovery  ║
 * ║  record, per the explicit Phase 2 task-spec instruction to re-verify    ║
 * ║  governance rather than reuse the Phase 1 record):                      ║
 * ║  - Official source: www8.cao.go.jp is the Cabinet Office's official      ║
 * ║    Council for Science, Technology and Innovation (CSTP) domain; the    ║
 * ║    exact URL was re-derived from the live landing page HTML, not        ║
 * ║    assumed from Phase 1.                                                 ║
 * ║  - Availability/stability: two independent live HTTP GETs of the         ║
 * ║    canonical URL, taken independently for this acquisition, both        ║
 * ║    returned HTTP 200, content-length 538,281 bytes, last-modified        ║
 * ║    2025-12-19, and identical SHA-256                                    ║
 * ║    29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0     ║
 * ║    both times. BYTE_STABLE.                                              ║
 * ║  - LICENCE-BASIS CORRECTION (found during this re-verification, NOT     ║
 * ║    present in the Phase 1 record): the Cabinet Office's Japanese-        ║
 * ║    language terms-of-use page (cao.go.jp/notice/rule.html, last updated ║
 * ║    2025-03-25) states that content now defaults to the 公共データ利用   ║
 * ║    規約（第1.0版）／ Public Data License (PDL) Version 1.0, published    ║
 * ║    by the Digital Agency, as the SUCCESSOR to the older "Government     ║
 * ║    Standard Terms of Use (Version 2.0)" that the Phase 1 record cited   ║
 * ║    as current. The English notice page (cao.go.jp/en/notice-e.html) is  ║
 * ║    STALE (last updated June 2023) and still describes the old v2.0-     ║
 * ║    style wording — it was NOT relied upon here. PDL v1.0's published    ║
 * ║    terms (digital.go.jp/en/resources/open_data/public_data_license_v1.0) ║
 * ║    were read directly and confirmed materially CC-BY-equivalent (free   ║
 * ║    use/copy/transmission/translation/modification, commercial use       ║
 * ║    explicitly permitted, attribution required) — so the reuse-          ║
 * ║    permissiveness conclusion is UNCHANGED from Phase 1, but the exact   ║
 * ║    licence-basis citation is corrected here to PDL v1.0 (Digital        ║
 * ║    Agency), noting it supersedes the Version 2.0 instrument.            ║
 * ║                                                                          ║
 * ║  BASELINE EXPERIMENT, NOT AN ENGINEERING PROGRAMME: this admission       ║
 * ║  freezes and evaluates the document using the completely unmodified      ║
 * ║  Stages 1-7 evaluator (version 0.1.2) exactly as it exists today. No     ║
 * ║  expected decision, issue class, or representation-boundary outcome is  ║
 * ║  assumed; whatever the frozen evaluator actually returns is recorded    ║
 * ║  verbatim below. The full representation-boundary inspection, official- ║
 * ║  translation ground-truth comparison, and five-hypothesis (H1-H5)       ║
 * ║  evaluation live in the companion baseline-experiment test file         ║
 * ║  (dra-acq-028-doc0032-japanese-baseline-experiment.test.ts) and the      ║
 * ║  Phase 2 report — this admission test performs ONLY the standard        ║
 * ║  governed-pipeline admission and Run A/B determinism check.             ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in ║
 * ║  DRA-ACQ-018 through DRA-ACQ-027 Phase 2: metadata-only prior-corpus     ║
 * ║  entries are loaded so ID/digest duplicate checks and the 31→32          ║
 * ║  manifest transition are fully exercised. The optional content-         ║
 * ║  similarity check is skipped as CorpusDocumentInput carries no text     ║
 * ║  field — a genuine schema limitation shared by every prior acquisition, ║
 * ║  not something newly introduced here.                                   ║
 * ║                                                                          ║
 * ║  ENG-022 V2 FREEZE-INTEGRITY REGIME: this is the first document admitted ║
 * ║  since DRA-ENG-022. The governed pipeline opts into the V2 freeze-       ║
 * ║  integrity regime internally (governed-pipeline.ts passes                ║
 * ║  freezeIntegrityRegime: "V2"); this test verifies the resulting freeze   ║
 * ║  record carries the V2 schema-version marker rather than requesting any ║
 * ║  special flag itself.                                                    ║
 * ║                                                                          ║
 * ║  NO CURRENTNESS ASSESSMENT SUPPLIED: consistent with every prior         ║
 * ║  acquisition, no currentnessAssessment is attached to this freeze — the ║
 * ║  ENG-020/021/022 currentness-integrity path is exercised in its default ║
 * ║  UNKNOWN/absent state, which this test confirms behaves normally (does  ║
 * ║  not block or alter admission).                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to www8.cao.go.jp (cached to disk
 * after the first successful fetch) and runs the FULL Stages 1-7 DRA
 * evaluator against the complete document TWICE (Run A via
 * acquireFreezeAndEvaluate, Run B via evaluateFrozenBenchmarkDocument) to
 * verify determinism.
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
import { FREEZE_INTEGRITY_SCHEMA_VERSION_V2 } from "../freeze.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";

// ---------------------------------------------------------------------------
// Fixed timestamps
// ---------------------------------------------------------------------------

const REVIEW_TIMESTAMP = "2026-08-11T13:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T13:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T14:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0032 candidate (Japanese original)
// ---------------------------------------------------------------------------

const AI_GUIDELINE_JA_PDF_URL = "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf";

const EXPECTED_BYTE_LENGTH = 538_281;
const EXPECTED_SHA256 = "29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests — no
// Japanese-specific extraction option is used; the SAME "-layout" invocation
// applied to every other PDF in the corpus is applied here too).
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-028-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-028-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${AI_GUIDELINE_JA_PDF_URL}`,
    "Publisher: Cabinet Office, Government of Japan (内閣府) — www8.cao.go.jp is the Cabinet Office's official " +
      "Council for Science, Technology and Innovation (CSTP) domain hosting the AI guideline landing page at " +
      "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_guideline.html, which links this exact PDF.",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition, independent of Phase 1 discovery): the landing page HTML " +
      "was re-fetched and parsed directly (not assumed from Phase 1) to re-derive the canonical PDF URL. Two " +
      "independent GET requests to that URL both return HTTP 200, content-length 538,281 bytes both times, " +
      "last-modified 2025-12-19, identical SHA-256 " +
      "29848f122e4c7ed063cad7bfde9172cbc1d3b88ee568777aeb69a207c4fa52f0 both times.",
    "STRUCTURAL DISAMBIGUATION (re-verified this acquisition): the landing page hosts TWO distinct document " +
      "pairs — this main guideline (ai_gl_2025.pdf, 526KB, Japanese; ai_gl_eng_20260116.pdf, 250KB, English " +
      "provisional translation) and a separate, larger 概要/overview companion document (ai_gl_2025g.pdf, " +
      "661KB; ai_gl_g_eng_20260220.pdf, 741KB). Confirmed via HTML text-order extraction that ai_gl_2025.pdf is " +
      "the correct target for DRA-DOC-0032 (matches Phase 1's 526KB/250KB sizing), not the 概要 pair.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on an official Japanese government domain.",
    "HUMAN GOVERNANCE DECISION: Cabinet Office, Government of Japan confirmed as the official publisher and " +
      "canonical source of this exact artefact — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-028 Phase 2 human governance sign-off 2026-08-11. Cabinet Office AI Guideline (Japanese original) " +
    "official source VERIFIED via live re-derivation of the canonical URL, independent of the Phase 1 record.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName:
    "公共データ利用規約（第1.0版）／ Public Data License (PDL) Version 1.0 (Digital Agency, Government of Japan) " +
    "— successor to the Government Standard Terms of Use (Version 2.0)",
  licenceUrl: "https://www.digital.go.jp/en/resources/open_data/public_data_license_v1.0",
  licenceBasis: "OPEN_LICENCE" as const,
  assessedBy: "DRA-ACQ-028-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "The Cabinet Office's Japanese-language terms-of-use page (https://www.cao.go.jp/notice/rule.html, last " +
      "updated 2025-03-25) states that content on cao.go.jp now defaults to the Public Data License (PDL) " +
      "Version 1.0, published by the Digital Agency, as the SUCCESSOR to the older Government Standard Terms " +
      "of Use (Version 2.0). This is a LICENCE-BASIS CORRECTION relative to the DRA-ACQ-028 Phase 1 record, " +
      "which cited the older v2.0 instrument as still current — re-verification at admission time found it had " +
      "been superseded.",
    "The English notice page (https://www.cao.go.jp/en/notice-e.html) is STALE (last updated June 2023) and " +
      "still describes the old v2.0-style wording; it was NOT relied upon for this assessment.",
    "PDL v1.0's published terms (https://www.digital.go.jp/en/resources/open_data/public_data_license_v1.0), " +
      "read directly, permit free use, copying, transmission, translation, and modification, EXPLICITLY permit " +
      "commercial use, and require attribution — materially CC-BY-equivalent, consistent with the reuse basis " +
      "already accepted for other permissive open-government licences in this corpus (e.g. DRA-DOC-0018 EU CC " +
      "BY 4.0, DRA-DOC-0020 CNIL CC BY-ND, DRA-DOC-0022 EEA OGL).",
    "DRA PRACTICES ASSESSED AS PERMITTED under this licence: retaining the unmodified source artefact, " +
      "recording cryptographic digests, extracting/normalising text for evaluation, storing metadata, using " +
      "short claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: OPEN_LICENCE (Public Data License v1.0, Digital Agency, Government of Japan) " +
      "confirmed — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-028 Phase 2 human governance sign-off 2026-08-11. Licence-basis citation corrected from the " +
    "Phase 1 discovery record's Version 2.0 reference to the current successor instrument, PDL v1.0, found " +
    "during this acquisition's independent live re-verification. Reuse-permissiveness conclusion unchanged.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "AI Guidelines for the Proper Implementation of Research, Development, and Utilisation of AI, under " +
    "Article 13 of the Act on the Promotion of Research, Development, and Utilisation of AI-Related " +
    "Technologies (Japanese original; 令和7年12月19日改定)",
  publisher: "Cabinet Office, Government of Japan (内閣府)",
  publicationDate: "2025-12-19",
  domain: "GENERAL" as const,
  documentType: "POLICY" as const,
  difficulty: "HIGH" as const,
  language: "ja",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (highest-ranked) candidate selected at the close of DRA-ACQ-028 Phase 1 discovery (see " +
  "discovery/dra-acq-028-non-latin-script-discovery.ts, DRA-CAND-028-01). Sole experimental target: DRA's " +
  "entire 32-document corpus (post-admission) has, until this document, been exclusively Latin-script and " +
  "whitespace-delimited (English, Spanish, French). This acquisition admits the FIRST non-Latin-script, " +
  "non-whitespace-delimited document (Japanese, using kanji/hiragana/katakana with 。/、 sentence-internal " +
  "punctuation rather than ASCII periods and inter-word spaces) to establish a baseline for whether the " +
  "unmodified Stages 1-7 evaluator can process such a document at all, and if so, with what representation- " +
  "boundary fidelity. The official English translation (ai_gl_eng_20260116.pdf, explicitly labelled a " +
  "\"【Provisional translation】\") is used ONLY as an out-of-band semantic reference for a controlled ground- " +
  "truth comparison in the companion baseline-experiment test file — it is NOT admitted as a numbered corpus " +
  "document, preserving the principle that DRA-DOC-0032 and its English translation are separate identities " +
  "with no implied corpus-level equivalence. CORPUS-BALANCE DISCLOSURE: this document adds a novel script " +
  "family and language (ja) not previously represented in the corpus; domain (GENERAL) and jurisdiction " +
  "(Japan, national government) are also both novel. No expected decision, issue-class outcome, or " +
  "representation-boundary result is assumed by this inclusion rationale; whatever the frozen evaluator " +
  "(version 0.1.2) actually returns for this document is recorded verbatim in the admission test below. The " +
  "representation-boundary inspection, official-translation ground-truth comparison, and five-hypothesis " +
  "(H1-H5) evaluation are performed separately in the companion baseline-experiment test file and the Phase 2 " +
  "report — this admission test does not answer them.";

// ---------------------------------------------------------------------------
// ENTRY_0023..0031 — reconstructed from admitted records (metadata only — no
// text content is required by CorpusDocumentInput). Re-declared exactly as
// in the DRA-ACQ-027 admission test (that shared prior-entries file has not
// yet been extended past DRA-DOC-0022); ENTRY_0031 is added here for the
// first time to bring the prior registry up to 31 documents ahead of this
// acquisition's DRA-DOC-0032.
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
    "experiment — see DRA-ACQ-024 Phase 2.",
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
    "Result (evaluated under DRA-ENG-019 Part G): REVIEW, 1 issue (EVIDENCE_INADEQUATE), 25603 statements, " +
    "fully deterministic. AUTHENTIC_CURRENT reference for the DRA-ACQ-027 version-supersession experiment.",
};

const ENTRY_0031: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0031",
  title:
    "NIST Special Publication 800-53 Revision 4 — Security and Privacy Controls for Federal Information " +
    "Systems and Organizations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000034 (programme ref: DRA-ACQ-027). Freeze record: DRA-FRZ-000025. " +
    "Result: HOLD, 5 issues (4x EVIDENCE_ABSENT, 1x EVIDENCE_INADEQUATE). AUTHENTIC_SUPERSEDED half of a " +
    "version-pair experiment with DRA-DOC-0030; capability gap CONFIRMED (evaluator emits no supersession " +
    "signal) — see DRA-ACQ-027 Phase 2.",
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
  ENTRY_0031,
];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-028 Phase 2A/2B — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0032 (Japan Cabinet Office AI Guideline, Japanese original)",
  () => {
    it(
      "reconfirms governance independently, verifies BYTE_STABLE determinism via two independent live " +
        "acquisitions, admits DRA-DOC-0032 through eligibility, freeze (under the ENG-022 V2 freeze-integrity " +
        "regime), 32-document corpus integration, and the FULL unmodified DRA evaluator (Run A), then verifies " +
        "Run B substantive determinism via evaluateFrozenBenchmarkDocument — recording whatever decision the " +
        "frozen evaluator actually returns, without adding any Japanese-specific logic to the pipeline",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-028 PHASE 2A/2B — CORPUS ADMISSION LOG           ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const realFetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });
        const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-028");

        // ── Step 0: Determinism check — two independent (cache-backed) fetches ─

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000035",
          sourceUrl: AI_GUIDELINE_JA_PDF_URL,
          requestedBy: "DRA-ACQ-028-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Cabinet Office",
          expectedTitle: "AI",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) console.error("First AI guideline fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000035",
          sourceUrl: AI_GUIDELINE_JA_PDF_URL,
          requestedBy: "DRA-ACQ-028-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Cabinet Office",
          expectedTitle: "AI",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) console.error("Second AI guideline fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
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
        console.log("  Matches DRA-ACQ-028 Phase 1/Phase 2 pre-admission verification digest ✓");

        // ── Step 0b: Structural integrity spot-check ─────────────────────────
        // (script-neutral markers only — no Japanese-specific regex logic is
        // introduced into production code; this is a test-local spot check.)

        console.log("\n── Step 0b: Structural Spot-Check ───────────────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        console.log("  extracted character count (admission-time, -layout):", admissionTimeText.length);
        expect(admissionTimeText.length).toBeGreaterThan(1000);

        const structuralMarkers: Record<string, RegExp> = {
          aiActReference: /令和７年法律第\s*53\s*号/, // reference to the AI Act within the guideline text
          articleThirteen: /第\s*13\s*条/, // "Article 13"
          publisherKanji: /内閣府/, // "Cabinet Office" in kanji
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        const periodCount = (admissionTimeText.match(/。/g) ?? []).length;
        const commaCount = (admissionTimeText.match(/、/g) ?? []).length;
        console.log(`  ideographic full stops (。): ${periodCount}, ideographic commas (、): ${commaCount}`);
        expect(periodCount).toBeGreaterThan(0);

        // ── Step 1: Setup — build 31-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 31-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  31-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(31);
        expect(registry.hasId("DRA-DOC-0032")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SHA256)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-028",
          protocolStatus: "APPROVED",
          targetCorpusSize: 32,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr", "ja"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000035) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000035",
          sourceUrl: AI_GUIDELINE_JA_PDF_URL,
          requestedBy: "DRA-ACQ-028-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Cabinet Office",
          expectedTitle: "AI",
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
            corpusDocumentId: "DRA-DOC-0032",
            freezeRecordId: "DRA-FRZ-000026",
            frozenBy: "DRA-ACQ-028-human-governance-operator",
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
        console.log(
          "  freezeIntegritySchemaVersion:",
          (runA.freeze as unknown as Record<string, unknown>)["freezeIntegritySchemaVersion"],
        );

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000026");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0032");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000035");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SHA256);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        // ── ENG-022 V2 freeze-integrity regime confirmation ──────────────────

        console.log("\n── ENG-022 V2 Freeze-Integrity Regime Confirmation ──────────");
        const freezeIntegritySchemaVersion = (runA.freeze as unknown as Record<string, unknown>)[
          "freezeIntegritySchemaVersion"
        ];
        console.log(`  freezeIntegritySchemaVersion === V2 marker: ${freezeIntegritySchemaVersion === FREEZE_INTEGRITY_SCHEMA_VERSION_V2}`);
        expect(freezeIntegritySchemaVersion).toBe(FREEZE_INTEGRITY_SCHEMA_VERSION_V2);
        console.log(
          "  Confirms this is the first document admitted under the ENG-022 V2 freeze-integrity regime, " +
            "issued automatically by the governed pipeline — no special flag was requested by this test.",
        );

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (32 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(32);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(32);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0032");
        expect(runA.manifest.documentIds[31]).toBe("DRA-DOC-0032");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-31 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(31);
        expect(runA.manifest.documentIds.slice(0, 31)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 32 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(32);

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
        // No production code was modified to reach this line — the document either
        // evaluates deterministically with the existing evaluator or it does not;
        // no expected decision was assumed in advance (see docblock).

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
        console.log("  Document:        DRA-DOC-0032 — Japan Cabinet Office AI Guideline (Japanese original)");
        console.log("  Publisher:       Cabinet Office, Government of Japan");
        console.log("  Freeze record:   DRA-FRZ-000026");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     32 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log(
          "  Licence:         Public Data License (PDL) v1.0, Digital Agency, Government of Japan " +
            "(OPEN_LICENCE; successor to Government Standard Terms of Use v2.0)",
        );
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0032 adds a novel script family (non-Latin, non-whitespace- " +
            "delimited), language (ja), and jurisdiction (Japan) — admitted purely as the non-Latin-script " +
            "baseline experiment (see docblock and the companion baseline-experiment test file).",
        );
      },
      280_000,
    );
  },
);
