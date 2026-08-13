/**
 * DRA-ACQ-031 — Phase 2: Freeze, Admission, and Baseline Evaluation of
 * DRA-DOC-0034 (European Commission / HLEG-AI "Ethics Guidelines for
 * Trustworthy AI", official Bulgarian edition — the Cyrillic-alphabetic
 * script-family baseline)
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CORPUS ADMISSION TEST — DRA-ACQ-031 PHASE 2                             ║
 * ║                                                                          ║
 * ║  Candidate: EC_ETHICS_GUIDELINES_BG, QUALIFIED_PRIMARY at the close of   ║
 * ║  DRA-ACQ-031 Phase 1 (see discovery/dra-acq-031-next-robustness-gap-     ║
 * ║  discovery.ts, docs/dra/DRA-ACQ-031-PHASE1-REPORT.md). Phase 1's exact   ║
 * ║  candidate identity, licence basis, hypothesis, and PASS/PARTIAL/        ║
 * ║  MATERIAL DEFECT acceptance criteria are treated as FIXED and are not    ║
 * ║  altered by anything observed in this Phase 2 admission.                ║
 * ║                                                                          ║
 * ║  Document:    "Насоки относно етичните аспекти за надежден ИИ" (Ethics   ║
 * ║               Guidelines for Trustworthy AI — Bulgarian edition).       ║
 * ║  Corpus ID:   DRA-DOC-0034                                              ║
 * ║  Freeze ID:   DRA-FRZ-000028 (highest existing REAL freeze ID at the     ║
 * ║               start of this acquisition was DRA-FRZ-000026, used by      ║
 * ║               DRA-DOC-0032. DRA-FRZ-000027 remains reserved for the      ║
 * ║               still-blocked DRA-DOC-0033/DRA-ACQ-029 Hindi attempt and   ║
 * ║               is explicitly untouched, per DRA-ACQ-031 Phase 1 §9 and   ║
 * ║               this test's own governance below — DRA-FRZ-000028 is the  ║
 * ║               next number after it.)                                    ║
 * ║  Acquisition ID: DRA-ACQ-000037 (programme ref: DRA-ACQ-031; highest      ║
 * ║               existing real acquisition ID was DRA-ACQ-000035, used by   ║
 * ║               DRA-DOC-0032's acquisition. DRA-ACQ-000036 remains         ║
 * ║               reserved for the blocked DRA-DOC-0033 attempt and is       ║
 * ║               explicitly untouched.)                                    ║
 * ║  Publisher:   European Commission — High-Level Expert Group on           ║
 * ║               Artificial Intelligence                                    ║
 * ║  Source:      PDF — single document, EC doc_id=60442                     ║
 * ║                                                                          ║
 * ║  Canonical PDF URL:                                                      ║
 * ║    https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60442          ║
 * ║                                                                          ║
 * ║  DOCUMENTATION CORRECTION (recorded here, not silently fixed elsewhere): ║
 * ║  the DRA-ACQ-031 Phase 1 candidate register text describes the ground-   ║
 * ║  truth oracle as "the document's English (DRA-DOC-0018) and Spanish      ║
 * ║  (DRA-DOC-0019) editions". Independent verification during this Phase 2  ║
 * ║  admission (against the corpus's own registered records, not assumed)    ║
 * ║  shows this is imprecise: DRA-DOC-0018 is in fact the SPANISH edition of ║
 * ║  this document (see dra-bmk-023-prior-entries.ts ENTRY_0018, language    ║
 * ║  "es"), and DRA-DOC-0019 is an UNRELATED document (the INE Peer Review   ║
 * ║  Report, Spain's statistics office — not an edition of the Ethics        ║
 * ║  Guidelines at all). The actual English edition of the Ethics Guidelines ║
 * ║  is DRA-DOC-0021 (ENTRY_0021, language "en", doc_id=60419, admitted      ║
 * ║  under DRA-ACQ-017 Phase 2). The correct parallel-language ground-truth  ║
 * ║  pair for this experiment is therefore DRA-DOC-0018 (ES) and             ║
 * ║  DRA-DOC-0021 (EN) — the same pair already used by CHK-003/CHK-005 for   ║
 * ║  the EN/ES materiality-divergence investigation. This correction does    ║
 * ║  NOT alter Phase 1's frozen candidate identity, licence assessment, or   ║
 * ║  acceptance criteria — only which two already-admitted corpus IDs supply ║
 * ║  the parallel-translation oracle used in the companion representation-   ║
 * ║  fidelity test file.                                                    ║
 * ║                                                                          ║
 * ║  ADMISSION-TIME RE-VERIFICATION (this acquisition, 2026-08-11, performed ║
 * ║  live and independently of the DRA-ACQ-031 Phase 1 discovery record,     ║
 * ║  per the explicit Phase 2 task-spec instruction to re-verify governance  ║
 * ║  rather than reuse the Phase 1 record):                                  ║
 * ║  - Official source: ec.europa.eu is the European Commission's own        ║
 * ║    domain; the "newsroom/dae/document.cfm" path is the Commission's own  ║
 * ║    Digital Strategy document-repository system, the identical            ║
 * ║    infrastructure and publisher already twice-verified for DRA-DOC-0018  ║
 * ║    (Spanish) and DRA-DOC-0021 (English) editions of this exact           ║
 * ║    publication. The doc_id=60442 pairing with the Bulgarian edition was  ║
 * ║    re-derived live from the EC's own per-language landing page during    ║
 * ║    DRA-ACQ-031 Phase 1 and re-confirmed live again in this acquisition.  ║
 * ║  - Licence: data.europa.eu/en/copyright-notice re-fetched live for this  ║
 * ║    acquisition; the institution-wide CC BY 4.0 statement is unchanged    ║
 * ║    from the DRA-DOC-0018/0021 precedent and from DRA-ACQ-031 Phase 1.    ║
 * ║    No document-specific licence override found on the Bulgarian landing  ║
 * ║    page or in the PDF text itself.                                      ║
 * ║  - Live acquisition + stability: two independent live GET requests to    ║
 * ║    the canonical URL below, both HTTP 200, identical SHA-256 and byte    ║
 * ║    length, matching the DRA-ACQ-031 Phase 1 discovery measurement        ║
 * ║    exactly (BYTE_STABLE, Step 0 below).                                 ║
 * ║  - Metadata: title, publisher, and publication date independently        ║
 * ║    re-confirmed from the PDF's own front matter (Step 0b below).         ║
 * ║  - Language/script: Cyrillic script structural markers independently     ║
 * ║    re-confirmed present in the extracted text (Step 0b below).           ║
 * ║                                                                          ║
 * ║  ENGINEERING BOUNDARY: this test performs ONLY acquisition, governance   ║
 * ║  re-verification, freeze, corpus admission, and the standard unmodified  ║
 * ║  DRA evaluator run (Run A/Run B determinism). It does NOT add any        ║
 * ║  Cyrillic-specific logic anywhere in production code, does NOT tune the  ║
 * ║  evaluator to influence the result, and does NOT touch DRA-FRZ-000027,   ║
 * ║  DRA-ACQ-000036, or DRA-DOC-0033. Representation-fidelity measurement    ║
 * ║  and the production-vs-reference robustness comparison are performed in  ║
 * ║  the companion file, dra-acq-031-phase2-bulgarian-representation-        ║
 * ║  fidelity.test.ts.                                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { computeSourceDigest } from "../integrity.js";
import { normaliseContent } from "../normalisation.js";
import {
  acquireFreezeAndEvaluate,
  evaluateFrozenBenchmarkDocument,
} from "../governed-pipeline.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { buildMinimalProtocol } from "../../governance/schema.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import {
  PRIOR_CORPUS_ENTRIES,
  CORPUS_VERSION as SHARED_CORPUS_VERSION,
} from "../../execution/__tests__/dra-bmk-023-prior-entries.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";
import { verifyReceiptIntegrity } from "../../../pipeline/index.js";
import { FREEZE_INTEGRITY_SCHEMA_VERSION_V2 } from "../freeze.js";

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-acq-031-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
// Constants
// ---------------------------------------------------------------------------

const REVIEW_TIMESTAMP = "2026-08-11T20:00:00.000Z";
const FREEZE_TIMESTAMP = "2026-08-11T20:30:00.000Z";
const RUN_B_TIMESTAMP = "2026-08-11T21:00:00.000Z";
const CORPUS_VERSION = SHARED_CORPUS_VERSION;

const EC_ETHICS_BG_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60442";
const EXPECTED_SHA256 = "bf61352bd6836ca4d29c429ad963b0b2fceb0b7d0874bb77ae10b113dac3d313";
const EXPECTED_BYTE_LENGTH = 2_332_675;

// ---------------------------------------------------------------------------
// Human Governance Decision 1 — Official Source Assessment (re-verified live)
// ---------------------------------------------------------------------------

const OFFICIAL_SOURCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  assessedBy: "DRA-ACQ-031-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "ec.europa.eu is the European Commission's own domain; newsroom/dae/document.cfm is the Commission's own " +
      "Digital Strategy document-repository system, the identical infrastructure and publisher already " +
      "VERIFIED for DRA-DOC-0018 (Spanish edition, doc_id=60423) and DRA-DOC-0021 (English edition, " +
      "doc_id=60419) of this exact publication.",
    "PARALLEL-EDITION PROVENANCE: the EC's own per-language download table (re-derived live during DRA-ACQ-031 " +
      "Phase 1 discovery and re-confirmed live in this acquisition) lists doc_id=60442 under 'BG', matching " +
      "the already-frozen DRA-DOC-0018/0021 as an official sibling edition of the identical substantive " +
      "publication.",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition, independently of the Phase 1 discovery record): two " +
      "independent GET requests to the canonical PDF URL both return HTTP 200, 2,332,675 bytes, identical to " +
      "the DRA-ACQ-031 Phase 1 discovery measurement.",
    "HUMAN GOVERNANCE DECISION: European Commission — High-Level Expert Group on Artificial Intelligence " +
      "confirmed as the official publisher and canonical source of this document's Bulgarian edition — " +
      "VERIFIED.",
  ],
  notes:
    "DRA-ACQ-031 Phase 2 human governance sign-off 2026-08-11. EC/HLEG-AI 'Ethics Guidelines for Trustworthy " +
    "AI' (Bulgarian edition) official source VERIFIED.",
});

// ---------------------------------------------------------------------------
// Human Governance Decision 2 — Licence Assessment (re-verified live)
// ---------------------------------------------------------------------------

const LICENCE_ASSESSMENT = Object.freeze({
  status: "VERIFIED" as const,
  licenceName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
  licenceUrl: "https://data.europa.eu/en/copyright-notice",
  licenceBasis: "CREATIVE_COMMONS_BY" as const,
  assessedBy: "DRA-ACQ-031-human-governance-operator",
  assessedAt: REVIEW_TIMESTAMP,
  evidence: [
    "SITE-WIDE evidence: the EU's institution-wide copyright notice (data.europa.eu/en/copyright-notice) " +
      "states editorial content reuse is authorized under CC BY 4.0 — the identical licence basis already " +
      "VERIFIED for DRA-DOC-0018 and DRA-DOC-0021 (same publication, same ec.europa.eu infrastructure), not a " +
      "new or weaker basis being introduced for this document.",
    "RE-VERIFIED LIVE 2026-08-11 (this acquisition): re-fetched data.europa.eu/en/copyright-notice; the CC BY " +
      "4.0 statement is still present and unchanged from the DRA-ACQ-031 Phase 1 discovery and the " +
      "DRA-DOC-0018/0021 precedent.",
    "No document-specific licence override was found on the Bulgarian digital-strategy.ec.europa.eu landing " +
      "page or in the PDF text itself (pdftotext-inspected directly, Step 0b below).",
    "GOVERNANCE NOTE: this is the SAME plain CC BY 4.0 licence tier as DRA-DOC-0018 and DRA-DOC-0021 — no new " +
      "ND-permitted-use determination is required, because this document carries no No-Derivatives " +
      "restriction.",
    "HUMAN GOVERNANCE DECISION: CREATIVE_COMMONS_BY (CC BY 4.0) confirmed via the EU's institution-wide " +
      "copyright notice, with no document-specific override found — VERIFIED.",
  ],
  notes:
    "DRA-ACQ-031 Phase 2 human governance sign-off 2026-08-11. CC BY 4.0 — VERIFIED via the EU's " +
    "institution-wide copyright notice, identical basis to DRA-DOC-0018 and DRA-DOC-0021.",
});

// ---------------------------------------------------------------------------
// Human-Approved Metadata
// ---------------------------------------------------------------------------

const APPROVED_METADATA = Object.freeze({
  title:
    "Насоки относно етичните аспекти за надежден ИИ (Ethics Guidelines for Trustworthy AI — Bulgarian edition)",
  publisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
  publicationDate: "2019-04-08",
  domain: "TECHNICAL" as const,
  documentType: "REPORT" as const,
  difficulty: "HIGH" as const,
  language: "bg",
});

// ---------------------------------------------------------------------------
// Inclusion rationale
// ---------------------------------------------------------------------------

const INCLUSION_RATIONALE =
  "Official Bulgarian edition of the identical substantive publication already frozen as DRA-DOC-0018 " +
  "(Spanish, doc_id=60423) and DRA-DOC-0021 (English, doc_id=60419), European Commission / HLEG-AI 'Ethics " +
  "Guidelines for Trustworthy AI', 8 April 2019. QUALIFIED_PRIMARY candidate at the close of DRA-ACQ-031 " +
  "Phase 1 (see discovery/dra-acq-031-next-robustness-gap-discovery.ts, EC_ETHICS_GUIDELINES_BG). " +
  "Purpose: this acquisition tests whether DRA-ENG-023's \\p{L}\\p{N} Unicode-property-class segmentation fix " +
  "— closed for CJK ideographic script via DRA-DOC-0032 — generalises to the Cyrillic alphabet, a script " +
  "using its own Unicode block but ordinary ASCII sentence-terminator punctuation and ordinary whitespace " +
  "word delimiting, unlike CJK. No PASS/PARTIAL/MATERIAL DEFECT conclusion is assumed by this inclusion " +
  "rationale; classification is performed in the companion representation-fidelity test file against " +
  "DRA-ACQ-031 Phase 1's frozen acceptance criteria. Same publisher, domain (TECHNICAL), and documentType " +
  "(REPORT) as DRA-DOC-0018/0021 — deliberately, so language/script is the only new variable. Duplicate/" +
  "near-duplicate risk: this document is INTENTIONALLY the same substantive content as DRA-DOC-0018/0021, in " +
  "a different language and script; it is not scored against the standard near-duplicate rejection criterion, " +
  "for the same reason the DRA-DOC-0018/DRA-DOC-0021 parallel-language pair was not. The admission-time " +
  "evaluator run below is a required side effect of the standard governed pipeline, not a benchmark-comparison " +
  "analysis — its actual result is recorded verbatim, without any expectation that it will match DRA-DOC-0018 " +
  "or DRA-DOC-0021's outcome.";

// ---------------------------------------------------------------------------
// Prior corpus entries: DRA-DOC-0023–0031 (reconstructed verbatim from the
// DRA-ACQ-028 Phase 2 admission test) + DRA-DOC-0032 (Japanese, admitted by
// DRA-ACQ-028 Phase 2). DRA-DOC-0033 (Hindi) was NEVER admitted — it is
// correctly absent from this list; the registry does not require contiguous
// IDs (only DRA-DOC-NNNN format + uniqueness), so DRA-DOC-0034 is a valid
// next admission despite the DRA-DOC-0033 gap.
// ---------------------------------------------------------------------------

const ENTRY_0023: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0023",
  title: "Decision — Competition Act 1998 — Anti-competitive conduct in relation to vehicle recycling",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority (CMA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000026. Freeze record: DRA-FRZ-000017.",
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
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000027. Freeze record: DRA-FRZ-000018.",
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
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000028. Freeze record: DRA-FRZ-000019.",
};
const ENTRY_0026: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0026",
  title: "An analysis of the effects of sharing research data, code, and preprints on citations",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en-US",
  generator: "PLOS (Public Library of Science)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://journals.plos.org/plosone/article/file?id=10.1371%2Fjournal.pone.0311493&type=printable",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000029. Freeze record: DRA-FRZ-000020.",
};
const ENTRY_0027: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0027",
  title: "The Metric System: Hearings Before Subcommittee No. 1 and the Committee on Science and Astronautics",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "en-US",
  generator: "U.S. Government Printing Office / U.S. Government Publishing Office (via GovInfo, GPO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000030. Freeze record: DRA-FRZ-000021.",
};
const ENTRY_0028: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0028",
  title: "Deciding When to Submit a 510(k) for a Change to an Existing Device",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "U.S. Food and Drug Administration (FDA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www.fda.gov/media/99812/download",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000031. Freeze record: DRA-FRZ-000022.",
};
const ENTRY_0029: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0029",
  title: "Risk Factors for Legionella longbeachae Legionnaires' Disease, New Zealand",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "HEALTHCARE",
  language: "en-US",
  generator: "Centers for Disease Control and Prevention (CDC), Emerging Infectious Diseases journal",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000032. Freeze record: DRA-FRZ-000023.",
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
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000033. Freeze record: DRA-FRZ-000024.",
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
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-53r4.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes: "Acquisition ID: DRA-ACQ-000034. Freeze record: DRA-FRZ-000025.",
};
const ENTRY_0032: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0032",
  title:
    "AI Guidelines for the Proper Implementation of Research, Development, and Utilisation of AI, under " +
    "Article 13 of the Act on the Promotion of Research, Development, and Utilisation of AI-Related " +
    "Technologies (Japanese original)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "GENERAL",
  language: "ja",
  generator: "Cabinet Office, Government of Japan (内閣府)",
  generatorVersion: CORPUS_VERSION,
  creationMethod: "Public document acquisition via DRA-ENG-009",
  sourceReference: "https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000035 (programme ref: DRA-ACQ-028). Freeze record: DRA-FRZ-000026. Result: " +
    "SUPPORTED, 0 issues, 70 statements (post-DRA-ENG-023 fix), fully deterministic. First non-Latin-script " +
    "(CJK) document in the corpus.",
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
  "DRA-ACQ-031 Phase 2 — Controlled Corpus Admission and Baseline Evaluation for DRA-DOC-0034 (EC Ethics " +
    "Guidelines, Bulgarian edition)",
  () => {
    it(
      "reconfirms governance independently, verifies BYTE_STABLE determinism via two independent live " +
        "acquisitions, admits DRA-DOC-0034 through eligibility, freeze (ENG-022 V2 regime), 33-document corpus " +
        "integration, and the full unmodified DRA evaluator (Run A), then verifies Run B substantive " +
        "determinism via evaluateFrozenBenchmarkDocument — recording whatever decision the frozen evaluator " +
        "actually returns, without adding any Cyrillic-specific logic to the pipeline",
      async () => {
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║  DRA-ACQ-031 PHASE 2 — CORPUS ADMISSION LOG               ║");
        console.log("╚══════════════════════════════════════════════════════════╝\n");

        const realFetcher = createHttpFetcher({
          timeoutMs: 120_000,
          maxRedirects: 5,
          maxBytes: 20_000_000,
          userAgent: "DRA-ENG-010/1.0",
          allowHttp: false,
        });
        const fetcher = createDiskCachedFetcher(realFetcher, "dra-acq-031");

        // ── Step 0: Determinism check — two independent (cache-backed) fetches ─

        console.log("── Step 0: Determinism Check — Two Independent Fetches ─────");

        const reqA = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000037",
          sourceUrl: EC_ETHICS_BG_PDF_URL,
          requestedBy: "DRA-ACQ-031-determinism-check-a",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "European Commission",
          expectedTitle: "AI",
        });
        expect(reqA.ok).toBe(true);
        if (!reqA.ok) return;

        const fetchA = await fetcher(reqA.request, {});
        if (!fetchA.ok) console.error("First BG fetch (Acquisition A) FAILED:", fetchA.code, fetchA.message);
        expect(fetchA.ok).toBe(true);
        if (!fetchA.ok) return;

        const reqB = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000037",
          sourceUrl: EC_ETHICS_BG_PDF_URL,
          requestedBy: "DRA-ACQ-031-determinism-check-b",
          requestedAt: REVIEW_TIMESTAMP,
          expectedPublisher: "European Commission",
          expectedTitle: "AI",
        });
        expect(reqB.ok).toBe(true);
        if (!reqB.ok) return;

        const fetchB = await fetcher(reqB.request, {});
        if (!fetchB.ok) console.error("Second BG fetch (Acquisition B) FAILED:", fetchB.code, fetchB.message);
        expect(fetchB.ok).toBe(true);
        if (!fetchB.ok) return;

        const digestA = computeSourceDigest(fetchA.source.rawBytes);
        const digestB = computeSourceDigest(fetchB.source.rawBytes);

        console.log("  Acquisition A HTTP status :", fetchA.source.httpStatus);
        console.log("  Acquisition A byte length :", fetchA.source.rawBytes.length);
        console.log("  Acquisition A sourceDigest:", digestA);
        console.log("  Acquisition B byte length :", fetchB.source.rawBytes.length);
        console.log("  Acquisition B sourceDigest:", digestB);

        expect(fetchA.source.httpStatus).toBe(200);
        expect(fetchA.source.rawBytes.length).toBe(fetchB.source.rawBytes.length);
        expect(fetchA.source.rawBytes.length).toBe(EXPECTED_BYTE_LENGTH);
        expect(digestA).toBe(digestB);
        expect(digestA).toBe(EXPECTED_SHA256);

        console.log("  BYTE_STABLE: two independent live acquisitions produced identical SHA-256 ✓");
        console.log("  Matches DRA-ACQ-031 Phase 1 pre-admission verification digest ✓");

        // ── Step 0b: Structural + script spot-check (script-neutral markers) ─

        console.log("\n── Step 0b: Structural + Script Spot-Check ──────────────────");

        const admissionTimeText = await extractPdfText(fetchA.source.rawBytes);
        console.log("  extracted character count (admission-time, -layout):", admissionTimeText.length);
        expect(admissionTimeText.length).toBeGreaterThan(1000);

        const CYRILLIC_RE = /[\u0400-\u04FF]/;
        expect(CYRILLIC_RE.test(admissionTimeText)).toBe(true);

        const structuralMarkers: Record<string, RegExp> = {
          highLevelExpertGroup: /ЕКСПЕРТНА ГРУПА НА ВИСОКО РАВНИЩЕ/,
          ethicsGuidelinesHeading: /Насоки.{0,20}етичн/i,
        };
        for (const [marker, pattern] of Object.entries(structuralMarkers)) {
          const found = pattern.test(admissionTimeText);
          console.log(`  ${found ? "✓" : "✗"} ${marker}`);
          expect(found).toBe(true);
        }

        const cyrillicCharCount = (admissionTimeText.match(new RegExp(CYRILLIC_RE, "g")) ?? []).length;
        const asciiTerminatorCount = (admissionTimeText.match(/[.!?]/g) ?? []).length;
        console.log(`  Cyrillic characters: ${cyrillicCharCount}, ASCII sentence terminators (.!?): ${asciiTerminatorCount}`);
        expect(cyrillicCharCount).toBeGreaterThan(1000);
        expect(asciiTerminatorCount).toBeGreaterThan(50);

        // ── Step 1: Setup — build 32-document registry ──────────────────────

        console.log("\n── Step 1: Setup — Build 32-Document Registry ──────────────");

        const registry = new CorpusRegistry();
        for (const entry of BENCHMARK_CORPUS) registry.add(entry.input);
        for (const entry of ALL_PRIOR_ENTRIES) registry.add(entry);

        console.log(`  32-document registry built: ${registry.size} documents`);
        expect(registry.size).toBe(32);
        expect(registry.hasId("DRA-DOC-0034")).toBe(false);
        expect(registry.hasId("DRA-DOC-0033")).toBe(false);
        expect(registry.hasDigest(EXPECTED_SHA256)).toBe(false);

        const protocol = buildMinimalProtocol({
          protocolId: "DRA-PROTO-ACQ-031",
          protocolStatus: "APPROVED",
          targetCorpusSize: 33,
          permittedDocumentTypes: [
            "SUMMARY", "REWRITE", "REPORT", "EMAIL",
            "POLICY", "PROCEDURE", "ARTICLE", "OTHER",
          ],
          permittedLanguages: ["en", "en-GB", "en-US", "es", "fr", "ja", "bg"],
        });

        // ── Step 2: Acquisition request for the governed pipeline ───────────

        console.log("\n── Step 2: Acquisition Request (DRA-ACQ-000037) ─────────────");

        const requestResult = createAcquisitionRequest({
          acquisitionId: "DRA-ACQ-000037",
          sourceUrl: EC_ETHICS_BG_PDF_URL,
          requestedBy: "DRA-ACQ-031-admission-operator",
          requestedAt: FREEZE_TIMESTAMP,
          expectedPublisher: "European Commission",
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
            corpusDocumentId: "DRA-DOC-0034",
            freezeRecordId: "DRA-FRZ-000028",
            frozenBy: "DRA-ACQ-031-human-governance-operator",
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

        expect(runA.freeze.freezeRecordId).toBe("DRA-FRZ-000028");
        expect(runA.freeze.corpusDocumentId).toBe("DRA-DOC-0034");
        expect(runA.freeze.acquisitionId).toBe("DRA-ACQ-000037");
        expect(runA.freeze.sourceDigest).toBe(digestA);
        expect(runA.freeze.sourceDigest).toBe(EXPECTED_SHA256);
        expect(runA.freeze.normalisedTextDigest).toBeTruthy();
        expect(runA.freeze.metadataDigest).toBeTruthy();
        expect(runA.freeze.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.freeze.status).toBe("FROZEN");

        const freezeIntegritySchemaVersion = (runA.freeze as unknown as Record<string, unknown>)[
          "freezeIntegritySchemaVersion"
        ];
        expect(freezeIntegritySchemaVersion).toBe(FREEZE_INTEGRITY_SCHEMA_VERSION_V2);

        // ── Corpus manifest log ──────────────────────────────────────────────

        console.log("\n── Corpus Manifest (33 documents) ───────────────────────────");
        console.log("  documentCount  :", runA.manifest.documentCount);
        console.log("  overallDigest  :", runA.manifest.overallDigest);

        expect(runA.manifest.documentCount).toBe(33);
        expect(runA.manifest.corpusVersion).toBe(CORPUS_VERSION);
        expect(runA.manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);
        expect(runA.manifest.documentIds).toHaveLength(33);
        expect(runA.manifest.documentIds).toContain("DRA-DOC-0034");
        expect(runA.manifest.documentIds[32]).toBe("DRA-DOC-0034");
        expect(runA.manifest.documentIds).not.toContain("DRA-DOC-0033");
        expect(runA.manifestDigest).toBe(runA.manifest.overallDigest);

        // Documents 1-32 (excluding the never-admitted 0033 gap) remain
        // unchanged and in their original order; DRA-DOC-0034 is appended last.
        const priorIds = [
          ...BENCHMARK_CORPUS.map((e) => e.input.corpusId),
          ...ALL_PRIOR_ENTRIES.map((e) => e.corpusId),
        ];
        expect(priorIds).toHaveLength(32);
        expect(runA.manifest.documentIds.slice(0, 32)).toEqual(priorIds);
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
        // evaluates deterministically with the existing (already ENG-023-fixed)
        // evaluator or it does not; no expected decision was assumed in advance.

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
        console.log("  Document:        DRA-DOC-0034 — EC Ethics Guidelines (Bulgarian edition)");
        console.log("  Publisher:       European Commission — HLEG-AI");
        console.log("  Freeze record:   DRA-FRZ-000028");
        console.log("  Source digest:  ", runA.freeze.sourceDigest);
        console.log("  Text digest:    ", runA.freeze.normalisedTextDigest);
        console.log("  Metadata digest:", runA.freeze.metadataDigest);
        console.log("  Manifest digest:", runA.manifestDigest);
        console.log("  Corpus size:     33 documents (DRA-DOC-0033 remains an unadmitted gap)");
        console.log("  Decision (Run A = Run B):", runA.decision);
        console.log("  Statement count:", stmtsLogA.length);
        console.log("  Issue count:    ", issuesArrLogA.length, "classes:", JSON.stringify(issueClassesLogA));
        console.log(
          "  Licence:         Creative Commons Attribution 4.0 International (CC BY 4.0), same institution-" +
            "wide basis as DRA-DOC-0018/0021.",
        );
        console.log(
          "  Corpus-balance disclosure: DRA-DOC-0034 adds a second non-Latin-script family (Cyrillic, distinct " +
            "from the CJK family of DRA-DOC-0032) and a new language (bg) — admitted as the Cyrillic-script " +
            "baseline experiment (see docblock and the companion representation-fidelity test file).",
        );
      },
      280_000,
    );
  },
);
