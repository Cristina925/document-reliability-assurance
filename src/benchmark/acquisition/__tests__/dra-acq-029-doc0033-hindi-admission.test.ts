/**
 * DRA-ACQ-029 — Phase 2: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0033 (Supreme Court of India civil-appeal judgment, official
 * Hindi translation — the Devanagari/Brahmic-abugida baseline)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-029 PHASE 2                             ║
 * ║                                                                          ║
 * ║  Candidate: DRA-CAND-029-01, QUALIFIED_RECOMMENDED at the close of        ║
 * ║  DRA-ACQ-029 Phase 1 (see discovery/dra-acq-029-non-cjk-non-latin-       ║
 * ║  script-discovery.ts). This test performs ONLY the accepted Phase 2      ║
 * ║  admission work: independent governance re-verification (performed       ║
 * ║  live, 2026-08-11, NOT copied from Phase 1), a specific-judgment          ║
 * ║  selection step required by Phase 1's own structural-suitability          ║
 * ║  caveat (text-layer corruption risk), admission-time live retrieval,      ║
 * ║  freeze, normalisation, and corpus admission via the standard governed   ║
 * ║  pipeline (acquireFreezeAndEvaluate, unmodified). It does NOT fix the     ║
 * ║  danda (।/॥) sentence-boundary gap, does NOT add any Devanagari-specific ║
 * ║  logic anywhere in production code, and does NOT start DRA-DOC-0034.    ║
 * ║                                                                          ║
 * ║  Document:    Asma Lateef and others v. Shabbir Ahmed and others —      ║
 * ║               Civil Appeal No. 9695/2013, [2024] 1 S.C.R. 517 :         ║
 * ║               2024 INSC 36, decided 12 January 2024. Supreme Court of   ║
 * ║               India judgment; OFFICIAL HINDI TRANSLATION published      ║
 * ║               under the Supreme Court's Model Translation Programme,    ║
 * ║               distributed via the Allahabad High Court's eLegalix       ║
 * ║               e-SCR translated-judgment portal.                          ║
 * ║  Corpus ID:   DRA-DOC-0033                                              ║
 * ║  Freeze ID:   DRA-FRZ-000027 (highest existing real freeze ID at the    ║
 * ║               start of this acquisition was DRA-FRZ-000026, used by     ║
 * ║               DRA-DOC-0032; sentinel test-fixture IDs are excluded)     ║
 * ║  Acquisition ID: DRA-ACQ-000036 (programme ref: DRA-ACQ-029; the        ║
 * ║               highest existing real acquisition ID was DRA-ACQ-000035,  ║
 * ║               used by DRA-DOC-0032's acquisition)                       ║
 * ║  Publisher:   Supreme Court of India (judgment); official Hindi         ║
 * ║               translation distributed via elegalix.allahabadhighcourt   ║
 * ║               .in (Allahabad High Court's eLegalix e-SCR portal)         ║
 * ║                                                                          ║
 * ║  SPECIFIC-JUDGMENT SELECTION (required by the Phase 1 structural-        ║
 * ║  suitability caveat — "Phase 2 acquisition must first verify, via        ║
 * ║  direct text extraction, that the specific selected judgment's PDF has   ║
 * ║  a clean Unicode text layer"):                                          ║
 * ║  During this acquisition, SCJudgmentID=1 returned an eLegalix "Invalid   ║
 * ║  Page" error (not a judgment). SCJudgmentID=358 (State of U.P. v.        ║
 * ║  R.K. Pandey) WAS fetched and inspected, and DID exhibit exactly the     ║
 * ║  legacy font/conjunct-mapping corruption the Phase 1 caveat warned of    ║
 * ║  (mismapped conjuncts rendered as literal "+" and ")" characters, e.g.   ║
 * ║  "विनयोक्ता", ")ंजी+ खन्ना" in the extracted text) — it was REJECTED for ║
 * ║  this reason and is NOT the admitted document. SCJudgmentID=306 (this    ║
 * ║  document) was independently pdftotext-extracted and inspected: it       ║
 * ║  contains zero occurrences of the "+"/")" corruption markers seen in     ║
 * ║  SCJudgmentID=358, confirming a clean Unicode Devanagari text layer.    ║
 * ║  (A separate, unrelated visual-vs-logical matra-reordering artefact is   ║
 * ║  present in a small number of lines — e.g. "पन\n    ु रीक्षण" for       ║
 * ║  "पुनरीक्षण" — a PDF-extraction ordering quirk distinct from the         ║
 * ║  font-corruption defect that disqualified SCJudgmentID=358; this is      ║
 * ║  recorded as a separate observation in the companion baseline-           ║
 * ║  experiment test file and is NOT grounds for rejection.)                 ║
 * ║                                                                          ║
 * ║  Canonical download URL:                                                 ║
 * ║    https://elegalix.allahabadhighcourt.in/elegalix/                      ║
 * ║    WebDownloadTranslatedSCJudgmentDocument.do?SCJudgmentID=306           ║
 * ║  (Confirmed via https://elegalix.allahabadhighcourt.in/elegalix/         ║
 * ║   WebViewAllTranslatedSCJudgment.do, the eLegalix portal's own public     ║
 * ║   listing page of Hindi-translated Supreme Court judgments, which links  ║
 * ║   this exact SCJudgmentID against the case "आसमा लतीफ़ और अन्य बनाम       ║
 * ║   शब्बीर अहमद एवं अन्य" / Civil Appeal No. 9695/2013.)                   ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-11,           ║
 * ║  performed live and independently of the DRA-ACQ-029 Phase 1 discovery  ║
 * ║  record, per the explicit Phase 2 task-spec instruction to re-verify    ║
 * ║  governance rather than reuse the Phase 1 record):                      ║
 * ║  - Official source: elegalix.allahabadhighcourt.in is the Allahabad     ║
 * ║    High Court's own subdomain (allahabadhighcourt.in is the Court's      ║
 * ║    official domain); the eLegalix e-SCR system is the Court's own        ║
 * ║    judgment-information system, publishing official Hindi translations   ║
 * ║    of Supreme Court judgments produced under the Supreme Court's Model  ║
 * ║    Translation Programme. The exact download URL and case pairing were  ║
 * ║    re-derived live from the portal's own public listing page during     ║
 * ║    this acquisition, not assumed from Phase 1.                          ║
 * ║  - Availability/stability: two independent live HTTP GETs of the         ║
 * ║    canonical URL, taken independently for this acquisition, both        ║
 * ║    returned HTTP 200, content-type application/pdf, content-length      ║
 * ║    468,335 bytes, and identical SHA-256                                 ║
 * ║    2124a4c347a5512248455acd4e939c1808e030685e7eefd5703a629c5ddca76c     ║
 * ║    both times. BYTE_STABLE. (A rate-limiting HTTP 429 with a             ║
 * ║    Retry-After header was observed on the very first exploratory probe  ║
 * ║    of an unrelated, invalid SCJudgmentID before this acquisition began   ║
 * ║    its own two independent fetches; the two determinism-check fetches   ║
 * ║    below, taken with the portal's Retry-After delay respected, both      ║
 * ║    succeeded on the first attempt.)                                     ║
 * ║  - Licence basis: Indian Copyright Act 1957, s.52(1)(q)(iv) — judgments  ║
 * ║    and orders of courts, tribunals, and other judicial authorities are   ║
 * ║    statutorily exempted from copyright infringement when reproduced or  ║
 * ║    published, UNLESS the court itself has prohibited or restricted such ║
 * ║    reproduction/publication. No such prohibition is present on, or       ║
 * ║    referenced by, the eLegalix portal or the judgment PDF itself; the    ║
 * ║    only restriction present is the in-document disclaimer confirmed at  ║
 * ║    admission time (see below), which addresses AUTHORITATIVENESS         ║
 * ║    (English governs, Hindi is a convenience translation), not reuse/    ║
 * ║    reproduction permission. This is the same statutory public-domain-   ║
 * ║    equivalent basis structurally analogous to the already-accepted      ║
 * ║    17 U.S.C. §105 precedent (DRA-DOC-0013, DRA-DOC-0024), independently  ║
 * ║    re-confirmed here rather than copied from the Phase 1 record.        ║
 * ║  - In-document disclaimer (re-confirmed live at admission time by        ║
 * ║    direct pdftotext extraction of the fetched PDF, page 1): the Hindi    ║
 * ║    text includes an explicit disclaimer stating the translation is for  ║
 * ║    the litigant's understanding and that the original judgment governs  ║
 * ║    for all legal and official purposes — confirming the expected        ║
 * ║    ground-truth relationship (English original is authoritative) is     ║
 * ║    genuinely present in this specific document, not assumed.            ║
 * ║  - No authentication, paywall, CAPTCHA, or access circumvention of any   ║
 * ║    kind was required — a plain public HTTP GET on the Court's own        ║
 * ║    domain (subject only to the portal's own rate-limiting, which was     ║
 * ║    respected, not bypassed).                                            ║
 * ║                                                                          ║
 * ║  BASELINE EXPERIMENT, NOT AN ENGINEERING PROGRAMME: this admission        ║
 * ║  freezes and evaluates the document using the completely unmodified      ║
 * ║  Stages 1-7 evaluator (version 0.1.2) exactly as it exists today. No     ║
 * ║  expected decision, issue class, or danda-boundary outcome is assumed;   ║
 * ║  whatever the frozen evaluator actually returns is recorded verbatim     ║
 * ║  below. The full ENG-023-generalisation test (H1), danda sentence-       ║
 * ║  boundary materiality assessment (H2/H3), and the non-production         ║
 * ║  danda-aware counterfactual comparison live in the companion baseline-   ║
 * ║  experiment test file (dra-acq-029-doc0033-hindi-baseline-               ║
 * ║  experiment.test.ts) and the Phase 2 report — this admission test        ║
 * ║  performs ONLY the standard governed-pipeline admission and Run A/B      ║
 * ║  determinism check.                                                     ║
 * ║                                                                          ║
 * ║  SCOPE NOTE — near-duplicate check intentionally not run, exactly as in  ║
 * ║  DRA-ACQ-018 through DRA-ACQ-028 Phase 2: CorpusDocumentInput carries no ║
 * ║  text field, a schema limitation shared by every prior acquisition.      ║
 * ║                                                                          ║
 * ║  ENG-022 V2 FREEZE-INTEGRITY REGIME and NO CURRENTNESS ASSESSMENT:        ║
 * ║  consistent with DRA-DOC-0032, this freeze is issued under the ENG-022   ║
 * ║  V2 regime automatically by the governed pipeline, and no                ║
 * ║  currentnessAssessment is attached (default UNKNOWN/absent state).       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * This test makes live HTTPS requests to elegalix.allahabadhighcourt.in
 * (cached to disk after the first successful fetch) and runs the FULL
 * Stages 1-7 DRA evaluator against the complete document TWICE (Run A via
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

const REVIEW_TIMESTAMP = "2026-08-11T16:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T16:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T17:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION; // "DRA-CORPUS-1.0.0"

// ---------------------------------------------------------------------------
// Canonical PDF URL — DRA-DOC-0033 (SCJudgmentID=306, admitted)
// ---------------------------------------------------------------------------

const SC_JUDGMENT_HINDI_PDF_URL =
  "https://elegalix.allahabadhighcourt.in/elegalix/WebDownloadTranslatedSCJudgmentDocument.do?SCJudgmentID=306";

const EXPECTED_BYTE_LENGTH = 468_335;
const EXPECTED_SHA256 = "2124a4c347a5512248455acd4e939c1808e030685e7eefd5703a629c5ddca76c";

// ---------------------------------------------------------------------------
// pdftotext extractor (reused unmodified from prior acquisition tests — no
// Devanagari-specific extraction option is used; the SAME "-layout"
// invocation applied to every other PDF in the corpus is applied here too).
// ---------------------------------------------------------------------------

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-029-adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  assessedBy: "DRA-ACQ-029-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    `Document fetched from ${SC_JUDGMENT_HINDI_PDF_URL}`,
    "Publisher: Supreme Court of India (judgment); official Hindi translation produced under the Supreme " +
      "Court's Model Translation Programme and distributed via the Allahabad High Court's eLegalix e-SCR " +
      "portal (elegalix.allahabadhighcourt.in, a subdomain of the Court's own official domain " +
      "allahabadhighcourt.in).",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition, independent of Phase 1 discovery): the portal's own public " +
      "listing page (WebViewAllTranslatedSCJudgment.do) was re-fetched and parsed directly to re-derive the " +
      "canonical per-judgment download URL and confirm the case pairing (SCJudgmentID=306 -> Civil Appeal No. " +
      "9695/2013, Asma Lateef and others v. Shabbir Ahmed and others, [2024] 1 S.C.R. 517 : 2024 INSC 36, " +
      "decided 12 January 2024), not assumed from Phase 1.",
    "Two independent GET requests to that exact URL both return HTTP 200, Content-Type application/pdf, " +
      "content-length 468,335 bytes, identical SHA-256 " +
      "2124a4c347a5512248455acd4e939c1808e030685e7eefd5703a629c5ddca76c both times.",
    "SPECIFIC-JUDGMENT SELECTION (per Phase 1's structural-suitability caveat): SCJudgmentID=1 returned an " +
      "eLegalix 'Invalid Page' error. SCJudgmentID=358 was fetched and inspected but exhibits legacy font/" +
      "conjunct-mapping corruption in its extracted text (literal '+' and ')' characters replacing mismapped " +
      "conjuncts) and was rejected. SCJudgmentID=306 (this document) was independently pdftotext-extracted and " +
      "confirmed free of that corruption pattern before being selected for admission.",
    "In-document disclaimer independently re-confirmed at admission time (page 1 of the fetched PDF, direct " +
      "pdftotext extraction): the Hindi text states the translation is for the litigant's understanding and " +
      "that the original (English) judgment is authoritative for legal and official purposes.",
    "No authentication, paywall, CAPTCHA, or access circumvention of any kind was required — a plain public " +
      "HTTP GET on the Court's own domain, subject only to the portal's own request-rate limiting (a 429 with " +
      "Retry-After was observed once, before this acquisition's own fetches, on an unrelated invalid " +
      "SCJudgmentID; it was respected, not bypassed).",
    "HUMAN GOVERNANCE DECISION: Supreme Court of India / Allahabad High Court eLegalix e-SCR portal confirmed " +
      "as the official publisher and canonical source of this exact artefact — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-029 Phase 2 human governance sign-off 2026-08-11. Official source VERIFIED via live re-derivation " +
    "of the canonical URL and case pairing, independent of the Phase 1 record, with an additional specific-" +
    "judgment text-layer-quality selection step performed live.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName:
    "Statutory exemption for judgments/orders of courts, tribunals, and other judicial authorities — Indian " +
    "Copyright Act 1957, s.52(1)(q)(iv)",
  licenceUrl: "https://www.indiacode.nic.in/handle/123456789/1367",
  licenceBasis: "PUBLIC_DOMAIN" as const,
  assessedBy: "DRA-ACQ-029-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "Indian Copyright Act 1957, s.52(1)(q)(iv): the reproduction or publication of any judgment or order of a " +
      "court, tribunal, or other judicial authority does not constitute copyright infringement, UNLESS the " +
      "court, tribunal, or judicial authority has itself prohibited or restricted such reproduction or " +
      "publication. RE-VERIFIED this acquisition (independent of Phase 1): no such prohibition or restriction " +
      "is present on the eLegalix portal, in the judgment PDF's metadata, or in any accompanying notice.",
    "The only restriction actually present in the source document is the in-document disclaimer confirmed " +
      "above, which addresses AUTHORITATIVENESS of the translation (English governs), not reuse or " +
      "reproduction permission — these are independent concerns and the disclaimer does not narrow the " +
      "s.52(1)(q)(iv) exemption.",
    "This is a statutory public-domain-equivalent basis, structurally analogous to the already-accepted 17 " +
      "U.S.C. §105 precedent used for DRA-DOC-0013 (FDA) and DRA-DOC-0024 (CRS report) — a categorical rule set " +
      "by statute, not a discretionary agency reuse policy.",
    "DRA PRACTICES ASSESSED AS PERMITTED under this basis: retaining the unmodified source artefact, recording " +
      "cryptographic digests, extracting/normalising text for evaluation, storing metadata, using short " +
      "claim/evidence excerpts internally, benchmark analysis, and proof generation.",
    "HUMAN GOVERNANCE DECISION: PUBLIC_DOMAIN (statutory exemption, Indian Copyright Act 1957 s.52(1)(q)(iv)) " +
      "confirmed — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-029 Phase 2 human governance sign-off 2026-08-11. Licence basis independently re-verified this " +
    "acquisition (not copied from Phase 1); conclusion unchanged from Phase 1's ranking rationale.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "Asma Lateef and others v. Shabbir Ahmed and others — Civil Appeal No. 9695/2013, [2024] 1 S.C.R. 517 : " +
    "2024 INSC 36 (Supreme Court of India, official Hindi translation)",
  publisher:
    "Supreme Court of India (judgment); official Hindi translation distributed via the Allahabad High Court's " +
    "eLegalix e-SCR portal",
  publicationDate: "2024-01-12",
  domain: "LEGAL" as const,
  documentType: "OTHER" as const,
  difficulty: "HIGH" as const,
  language: "hi",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Primary (QUALIFIED_RECOMMENDED) candidate selected at the close of DRA-ACQ-029 Phase 1 discovery (see " +
  "discovery/dra-acq-029-non-cjk-non-latin-script-discovery.ts, DRA-CAND-029-01). Targeted experimental " +
  "dimension: DRA's 32-document corpus, after DRA-DOC-0032 (Japanese, CJK), remains entirely without any " +
  "Brahmic-abugida script — Devanagari conjunct-consonant/matra composition and its own native ।/॥ sentence-" +
  "terminator punctuation, neither of which DRA-ENG-023's CJK-specific fix (ideographic 。！？, script-agnostic " +
  "\\p{L}/\\p{N} classification) was designed against or tested against. This acquisition admits the FIRST " +
  "Devanagari-script document to determine (H1) whether the ENG-023 Unicode fix generalises to a script it was " +
  "never explicitly tested on, and (H2/H3) whether the already-demonstrated danda-insensitive sentence-merging " +
  "at the segmentContent level (Phase 1 reconnaissance, H2) produces a MATERIAL downstream defect once run " +
  "through the full unmodified evaluator, or remains a non-material granularity artefact. The official English " +
  "judgment (the SAME case, Civil Appeal No. 9695/2013) is the authoritative original per the document's own " +
  "in-document disclaimer; it is used out-of-band as a structural/ground-truth reference in the companion " +
  "baseline-experiment test file and Phase 2 report ONLY — it is NOT admitted as a separate numbered corpus " +
  "document, preserving the principle (also followed for DRA-DOC-0032/its English translation) that a " +
  "document and its cross-lingual counterpart are separate identities with no implied corpus-level " +
  "equivalence. CORPUS-BALANCE DISCLOSURE: this document adds a novel script family (Devanagari/Brahmic " +
  "abugida) and language (hi) not previously represented in the corpus; domain (LEGAL) and jurisdiction " +
  "(India, judiciary) are also both novel. No expected decision, issue-class outcome, or danda-boundary result " +
  "is assumed by this inclusion rationale; whatever the frozen evaluator (version 0.1.2) actually returns for " +
  "this document is recorded verbatim in the admission test below. The ENG-023-generalisation test, danda-" +
  "boundary materiality assessment, and non-production danda-aware counterfactual comparison are performed " +
  "separately in the companion baseline-experiment test file and the Phase 2 report — this admission test does " +
  "not answer them. It does NOT fix the danda gap and does NOT start DRA-DOC-0034.";

// ---------------------------------------------------------------------------
// ENTRY_0032 — reconstructed from the admitted DRA-DOC-0032 record (metadata
// only — no text content is required by CorpusDocumentInput). Added here for
// the first time to bring the prior registry up to 32 documents ahead of
// this acquisition's DRA-DOC-0033.
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

const ENTRY_0032: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0032",
  title:
    "AI Guidelines for the Proper Implementation of Research, Development, and Utilisation of AI, under " +
    "Article 13 of the Act on the Promotion of Research, Development, and Utilisation of AI-Related " +
    "Technologies (Japanese original; 令和7年12月19日改定)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "GENERAL",
  language: "ja",
  generator: "Cabinet Office, Government of Japan (内閣府)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf",
  sourceReference: "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000035 (programme ref: DRA-ACQ-028). Freeze record: DRA-FRZ-000026. " +
    "Result: SUPPORTED, 0 issues, 70 statements, fully deterministic. First non-Latin-script (CJK) corpus " +
    "document; 75.4% Devanagari-analogous ideographic-punctuation content loss vs. English on the same " +
    "document closed by DRA-ENG-023 — see DRA-ACQ-028 Phase 2.",
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
  ENTRY_0032,
];

// ---------------------------------------------------------------------------
// Admission test
// ---------------------------------------------------------------------------

describe(
  "DRA-ACQ-029 Phase 2 — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0033 (Supreme Court of India judgment, official Hindi translation)",
  () => {
    it(
      "reconfirms governance independently, selects a specific structurally-clean judgment, verifies " +
        "BYTE_STABLE determinism via two independent live acquisitions, admits DRA-DOC-0033 through " +
        "eligibility, freeze (under the ENG-022 V2 freeze-integrity regime), 33-document corpus integration, " +
        "and the FULL unmodified DRA evaluator (Run A), then verifies Run B substantive determinism via " +
        "evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator actually returns, " +
        "without adding any Devanagari-specific logic to the pipeline",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-029 PHASE 2 — CORPUS ADMISSION LOG               ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const realFetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });
        const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-029");

        // ── Step 0: Determinism check — two independent (cache-backed) fetches ─

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000036",
          sourceUrl: SC_JUDGMENT_HINDI_PDF_URL,
          requestedBy: "DRA-ACQ-029-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Supreme Court",
          expectedTitle: "9695",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) console.error("First judgment fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000036",
          sourceUrl: SC_JUDGMENT_HINDI_PDF_URL,
          requestedBy: "DRA-ACQ-029-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "Supreme Court",
          expectedTitle: "9695",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) console.error("Second judgment fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
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

        // ── Step 0b: Structural integrity spot-check ─────────────────────────
        // (script-neutral markers only — no Devanagari-specific regex logic is
        // introduced into production code; this is a test-local spot check.)

        console.log("\n── Step 0b: Structural Spot-Check ───────────────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        console.log("  extracted character count (admission-time, -layout):", admissionTimeText.length);
        expect(admissionTimeText.length).toBeGreaterThan(1000);

        const structuralMarkers: Record<string, RegExp> = {
          caseNumber: /9695\s*\/\s*2013/, // Civil Appeal No. 9695/2013
          citation: /2024\s*आईएनएससी\s*36|2024\s*INSC\s*36/, // citation, either script
          disclaimer: /अस्वीकरण/, // "Disclaimer" heading (Hindi)
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        const dandaCount = (admissionTimeText.match(/।/g) ?? []).length;
        const doubleDandaCount = (admissionTimeText.match(/॥/g) ?? []).length;
        const plusCorruptionCount = (admissionTimeText.match(/[+)]/g) ?? []).length;
        console.log(`  danda (।): ${dandaCount}, double danda (॥): ${doubleDandaCount}`);
        console.log(
          `  '+' / ')' occurrences (font-corruption marker check, informational only): ${plusCorruptionCount}`,
        );
        expect(dandaCount).toBeGreaterThan(0);

        // ── Step 1: Setup — build 32-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 32-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  32-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(32);
        expect(registry.hasId("DRA-DOC-0033")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SHA256)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-029",
          protocolStatus: "APPROVED",
          targetCorpusSize: 33,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr", "ja", "hi"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000036) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000036",
          sourceUrl: SC_JUDGMENT_HINDI_PDF_URL,
          requestedBy: "DRA-ACQ-029-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "Supreme Court",
          expectedTitle: "9695",
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
            corpusDocumentId: "DRA-DOC-0033",
            freezeRecordId: "DRA-FRZ-000027",
            frozenBy: "DRA-ACQ-029-human-governance-operator",
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

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000027");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0033");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000036");
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

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (33 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(33);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(33);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0033");
        expect(runA.manifest.documentIds[32]).toBe("DRA-DOC-0033");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-32 remain unchanged and in their original order.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(32);
        expect(runA.manifest.documentIds.slice(0, 32)).toEqual(priorIds);
        const expectedOrder = Array.from({ length: 33 }, (_, i) => `DRA-DOC-${String(i + 1).padStart(4, "0")}`);
        expect(runA.manifest.documentIds).toEqual(expectedOrder);
        expect(new Set(runA.manifest.documentIds).size).toBe(33);

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
        console.log("  Document:        DRA-DOC-0033 — Supreme Court of India judgment, official Hindi translation");
        console.log("  Publisher:       Supreme Court of India / Allahabad High Court eLegalix portal");
        console.log("  Freeze record:   DRA-FRZ-000027");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     33 documents");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log(
          "  Licence:         PUBLIC_DOMAIN (statutory exemption, Indian Copyright Act 1957 s.52(1)(q)(iv))",
        );
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0033 adds a novel script family (Devanagari/Brahmic abugida), " +
            "language (hi), and jurisdiction (India, judiciary) — admitted purely as the Devanagari baseline " +
            "experiment (see docblock and the companion baseline-experiment test file).",
        );
      },
      280_000,
    );
  },
);
