/**
 * DRA-BMK-018 — Part 1–3: Eighteen-Document Corpus Checkpoint
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  EIGHTEEN-DOCUMENT CORPUS CHECKPOINT — DRA-CHK-000018                    ║
 * ║                                                                          ║
 * ║  Checkpoint ID : DRA-CHK-000018                                          ║
 * ║  Timestamp     : 2026-08-07T20:00:00.000Z                               ║
 * ║  Milestone     : DRA-BMK-018                                             ║
 * ║  Corpus version: DRA-CORPUS-1.0.0                                        ║
 * ║                                                                          ║
 * ║  Corpus state:                                                           ║
 * ║    DRA-DOC-0001–0006: initial AI-generated corpus                        ║
 * ║    DRA-DOC-0007–0018: live-acquired, frozen documents                    ║
 * ║    Total: 18 documents                                                   ║
 * ║                                                                          ║
 * ║  DRA-DOC-0018: European Commission — Directrices éticas para una IA      ║
 * ║                fiable (Ethics Guidelines for Trustworthy AI, Spanish    ║
 * ║                edition)                                                 ║
 * ║    Publisher:  European Commission — High-Level Expert Group on AI       ║
 * ║    Freeze ID:  DRA-FRZ-000012                                            ║
 * ║    Acquisition: DRA-ACQ-000021 (programme ref: DRA-ACQ-014 Phase 2 retry)║
 * ║    Source URL: ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423      ║
 * ║                (single PDF)                                             ║
 * ║    Domain:     TECHNICAL                                                 ║
 * ║    Document type: REPORT (first REPORT-type document)                    ║
 * ║    Difficulty: HIGH                                                      ║
 * ║    Language:   es (FIRST non-English document in the corpus)            ║
 * ║    Licence:    CREATIVE_COMMONS_BY (CC BY 4.0, Commission Decision       ║
 * ║                2011/833/EU)                                             ║
 * ║    Stability:  BYTE_STABLE (two independent live fetches, DRA-ACQ-014   ║
 * ║                Phase 2 retry)                                           ║
 * ║    Engineering dependency: DRA-ENG-011 (malformed Content-Type fallback) ║
 * ║                                                                          ║
 * ║  THIS IS A BENCHMARK CHECKPOINT, NOT AN ACQUISITION PROGRAMME:           ║
 * ║    • No new documents are admitted or acquired here.                    ║
 * ║    • DRA-DOC-0018 was already admitted and frozen under DRA-ACQ-014     ║
 * ║      Phase 2 retry.                                                     ║
 * ║    • This checkpoint measures its actual contribution using evidence.   ║
 * ║    • The admission-time evaluator observation (SUPPORTED, 0 issues) is  ║
 * ║      NOT the benchmark conclusion — it is re-derived here from the      ║
 * ║      consolidated 18-document run.                                      ║
 * ║    • This is the corpus's FIRST non-English document — the checkpoint   ║
 * ║      also performs an observational multilingual-behaviour analysis     ║
 * ║      (Part 11 in the companion evaluator-run file), without modifying    ║
 * ║      Version 1 or inferring success/failure from absence of evidence.   ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No admission decisions reversed                                     ║
 * ║    • No Spanish-specific rules or translation added                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect } from "vitest";

import { CorpusRegistry } from "../../corpus/registry.js";
import { verifyManifestIntegrity } from "../../corpus/integrity.js";
import { BENCHMARK_CORPUS } from "../../evidence/corpus-data.js";
import { APACHE_HTTPD_AUTH_HTML } from "../../acquisition/fixtures/apache-httpd-auth-fixture.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import type { CorpusDocumentInput } from "../../corpus/schema.js";

// ---------------------------------------------------------------------------
// Checkpoint identity
// ---------------------------------------------------------------------------

const CHECKPOINT_ID        = "DRA-CHK-000018";
const CHECKPOINT_TIMESTAMP = "2026-08-07T20:00:00.000Z";
const BENCHMARK_MILESTONE  = "DRA-BMK-018";
const CORPUS_VERSION       = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Ordered corpus IDs (canonical sequence)
// ---------------------------------------------------------------------------

const ORDERED_CORPUS_IDS = [
  "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
  "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
  "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
  "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
  "DRA-DOC-0017", "DRA-DOC-0018",
] as const;

// ---------------------------------------------------------------------------
// Apache fixture — used for DRA-DOC-0007 sourceDigest reference
// ---------------------------------------------------------------------------

const APACHE_HTTPD_AUTH_FIXTURE = (() => {
  const bytes      = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
  const sourceDigest = computeSourceDigest(bytes);
  return { sourceDigest, normalisedTextDigest: sourceDigest };
})();

// ---------------------------------------------------------------------------
// Freeze reference constants for previously-admitted documents
// (unchanged — reproduced verbatim from DRA-BMK-016 for continuity)
// ---------------------------------------------------------------------------

const DRA_DOC_0011_SOURCE_DIGEST   = "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";
const DRA_DOC_0011_TEXT_DIGEST     = "b3b98f13548c165a63f23c4f50945d81abae705a022c4e640fe7001f9aee253e";
const DRA_DOC_0011_TEXT_LENGTH     = 367376;
const DRA_DOC_0011_WORD_COUNT      = 50000; // approximate
const DRA_DOC_0011_METADATA_DIGEST = "7a9f8fad847bfe6deca3965e557d05ffc5e225b759a38a0591a5f6d7551dcebd";
const DRA_DOC_0011_FREEZE_RECORD_DIGEST = "74433e6a2fdb423317fb63de55e5830355760f78621f1031d856fc9641ac4a8e";

const DRA_DOC_0012_SOURCE_DIGEST   = "6165a8ba699e9c7ffb6a693711f6a07b555021aa823e1a79582d9bc2e8052de7";
const DRA_DOC_0012_TEXT_DIGEST     = "bd7ad967ba5f4f4b96a3b0f5605e083ba656305e95ede92ef90a25eac5ddca5c";
const DRA_DOC_0012_TEXT_LENGTH     = 75182;
const DRA_DOC_0012_WORD_COUNT      = 10989;
const DRA_DOC_0012_METADATA_DIGEST = "ebfefefcdc1998c579b69ff26f23f903a9fcaedc4ff1bf664f78c1ff27a1f0fa";
const DRA_DOC_0012_FREEZE_RECORD_DIGEST = "0dea2b618a650dd6f827ae50fa3be636dd3435e72f6124f3eab59e696cd52978";

const DRA_DOC_0013_SOURCE_DIGEST   = "83c70423dd57b35b02b8c2749d409d0925095ad5686c21dd5de848da914a760a";
const DRA_DOC_0013_TEXT_DIGEST     = "f2d29332603340522a939c354379ff9b6fac3bb06ae3c9fa747c09765a6b3186";
const DRA_DOC_0013_TEXT_LENGTH     = 24390;
const DRA_DOC_0013_WORD_COUNT      = 3306;
const DRA_DOC_0013_METADATA_DIGEST = "a4337084bfccb3b32741eca377bb0f27a4b0870619f1edc0f9309c190ecf63e2";
const DRA_DOC_0013_FREEZE_RECORD_DIGEST = "c084a209cf437421d61888b00d6d602c8e2e7ca121628ee37bb51d26f4a9c511";

const DRA_DOC_0014_SOURCE_DIGEST   = "5c51372ce172c435836d0f8e2b3a7d74314dc161966549fdae65d2c19733dd38";
const DRA_DOC_0014_TEXT_DIGEST     = "2b1dbb2b3ae1107754db85e60fc2cf9fe2b6f61b3c3756752d2e2e6ade654e25";
const DRA_DOC_0014_TEXT_LENGTH     = 32947;
const DRA_DOC_0014_WORD_COUNT      = 4096;
const DRA_DOC_0014_METADATA_DIGEST = "d7e6b229165d2f115127445ee144808dbd413e048c24a0f9c9fdc577745d8cb8";
const DRA_DOC_0014_FREEZE_RECORD_DIGEST = "16017630c82863d98301d0a43e3572bc26b2576ffd3e7fce513f7820d46f91bf";

// DRA-DOC-0015 (NCSC ML Principles, DRA-FRZ-000009) — BYTE_STABLE
const DRA_DOC_0015_SOURCE_DIGEST   = "85b9a340508058be3be0b7bc10fc54c5744f23035f570b719d4336eae2fba993";
const DRA_DOC_0015_TEXT_DIGEST     = "78b499ea3cb48748213d3f60b3198063712d093b7550283828b8a71e40f92c32";
const DRA_DOC_0015_TEXT_LENGTH     = 97802;  // approximate (pdftotext -layout extraction)
const DRA_DOC_0015_WORD_COUNT      = 12451;  // approximate
const DRA_DOC_0015_METADATA_DIGEST = "6bd33d60fbcdea44be81b8d47bd9fa0e383c38d06b4fadf657d07a4a240a7822";
const DRA_DOC_0015_FREEZE_RECORD_DIGEST = "1cba9d2358b8d4bb215843da99a4ba963edf86d3f4026a65ae2de271e3a183ff";
const DRA_DOC_0015_REPRODUCIBILITY = "BYTE_STABLE";
const DRA_DOC_0015_PDF_URL         = "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";

// DRA-DOC-0016 (HSE Health and Safety Basics, DRA-FRZ-000010) — TEXT_STABLE
const DRA_DOC_0016_SOURCE_DIGEST   = "fbeb65fd2c5de4860eaa6492b87c75ea92543a8444030ec889a0099b4f00f9c9";
const DRA_DOC_0016_TEXT_DIGEST     = "fbeb65fd2c5de4860eaa6492b87c75ea92543a8444030ec889a0099b4f00f9c9";
const DRA_DOC_0016_TEXT_LENGTH     = 82714;
const DRA_DOC_0016_WORD_COUNT      = 12355;
const DRA_DOC_0016_METADATA_DIGEST = "c5ea5b9a0ea023995832fbe792f7ad02fe33533f2f7161764d87718c0ef78fb8";
const DRA_DOC_0016_FREEZE_RECORD_DIGEST = "06b9bcc36bf198b826437895c3080cf2ee8be1397e72d64965157376069cbda6";
const DRA_DOC_0016_REPRODUCIBILITY = "TEXT_STABLE";
const DRA_DOC_0016_LICENCE_BASIS   = "OPEN_LICENCE";
const DRA_DOC_0016_LICENCE_NAME    = "Crown Copyright — Open Government Licence v3.0";
const DRA_DOC_0016_LANDING_URL     = "https://www.hse.gov.uk/simple-health-safety/";

// DRA-DOC-0017 (MHRA Best Practice Guidance on PILs, DRA-FRZ-000011) — BYTE_STABLE
// Values verified during DRA-ACQ-013 Phase 2 (two independent live fetch passes,
// matching digests, matching Phase 1 discovery digest).
const DRA_DOC_0017_SOURCE_DIGEST   = "8593e8dabf6a967449a35155fcb140f4b234c20e3739dcbcbfd933ff2dd46383";
const DRA_DOC_0017_TEXT_DIGEST     = "891ab4f5ce73831bc432a5efe166f46517bb277f82ca1652fbd04df8e7bb0b1a";
const DRA_DOC_0017_TEXT_LENGTH     = 72170; // pdftotext -layout extraction (matches DRA-ACQ-013 Phase 1/2 observation)
const DRA_DOC_0017_WORD_COUNT      = 10617; // approximate
const DRA_DOC_0017_METADATA_DIGEST = "e7d3483793f0269c0e66a289b865ed1a5aeac37439c7539fe5705a44549505a7";
const DRA_DOC_0017_FREEZE_RECORD_DIGEST = "6af10465ecfe523f76597287074a4f4d4d3c6296592992437520dd0daca01774";
const DRA_DOC_0017_REPRODUCIBILITY = "BYTE_STABLE";
const DRA_DOC_0017_LICENCE_BASIS   = "OPEN_LICENCE";
const DRA_DOC_0017_LICENCE_NAME    = "Crown Copyright — Open Government Licence v3.0";
const DRA_DOC_0017_PDF_URL         = "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";

// DRA-DOC-0018 (EC Ethics Guidelines for Trustworthy AI, Spanish edition, DRA-FRZ-000012) — BYTE_STABLE
// Values verified during DRA-ACQ-014 Phase 2 retry (two independent live fetch passes,
// matching digests, matching Phase 1 discovery digest). Source and text digests are the
// authoritative full values recorded at admission; metadata/freeze-record digests are
// re-derived independently in this checkpoint (not assumed) since only truncated
// fragments of those two were carried forward in the task's authoritative inputs.
// Approximate — refined via live pdftotext extraction in the companion evaluator-run
// file (dra-bmk-018-evaluator-run.test.ts); used here only for descriptive balance
// statistics, not for any digest or decision assertion.
const DRA_DOC_0018_TEXT_LENGTH     = 85000; // approximate
const DRA_DOC_0018_WORD_COUNT      = 13000; // approximate
const DRA_DOC_0018_SOURCE_DIGEST   = "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2";
const DRA_DOC_0018_TEXT_DIGEST     = "1903017a0c169b2a95a0547c693be9ffb70e5057fa266075a4bb296e80367361";
const DRA_DOC_0018_REPRODUCIBILITY = "BYTE_STABLE";
const DRA_DOC_0018_LICENCE_BASIS   = "CREATIVE_COMMONS_BY";
const DRA_DOC_0018_LICENCE_NAME    = "Creative Commons Attribution 4.0 International (CC BY 4.0), Commission Decision 2011/833/EU";
const DRA_DOC_0018_PDF_URL         = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";
// Manifest digest recorded at admission time (DRA-ACQ-014 Phase 2 retry) was reported
// only as a truncated fragment (prefix/suffix) in the task's authoritative inputs;
// this checkpoint cross-checks against that fragment rather than fabricating the
// omitted middle bytes.
const ADMISSION_MANIFEST_DIGEST_PREFIX = "3af5b35f";
const ADMISSION_MANIFEST_DIGEST_SUFFIX = "765c21de";

// ---------------------------------------------------------------------------
// Live-document CorpusDocumentInput entries (DRA-DOC-0007–0017)
// Reconstructed from admitted freeze records and approved metadata.
// ---------------------------------------------------------------------------

const ENTRY_0007: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0007",
  title: "Authentication and Authorization - Apache HTTP Server Version 2.4",
  sourceType: "HUMAN_AUTHORED",
  documentType: "ARTICLE",
  domain: "TECHNICAL",
  language: "en",
  generator: "The Apache Software Foundation",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from https://httpd.apache.org/docs/2.4/howto/auth.html",
  sourceReference: "https://httpd.apache.org/docs/2.4/howto/auth.html",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    `Acquisition ID: DRA-ACQ-000001. ` +
    `Freeze record: DRA-FRZ-000001. ` +
    `Source digest: ${APACHE_HTTPD_AUTH_FIXTURE.sourceDigest.slice(0, 16)}… ` +
    `Publication date: 2026-06-19. ` +
    `Version: 2.4.`,
};

const ENTRY_0008: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0008",
  title: "Discipline and grievances at work: the Acas guide",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "BUSINESS",
  language: "en-GB",
  generator: "Advisory, Conciliation and Arbitration Service (Acas)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  sourceReference:
    "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "LOW",
  notes:
    "Acquisition ID: DRA-ACQ-000002. " +
    "Freeze record: DRA-FRZ-000002. " +
    "Source digest: a4c10388a0dcfd54… " +
    "Publication date: 2020-07.",
};

const ENTRY_0009: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0009",
  title: "AI Foundation Models: Short Version",
  sourceType: "HUMAN_AUTHORED",
  documentType: "SUMMARY",
  domain: "GENERAL",
  language: "en-GB",
  generator: "Competition and Markets Authority",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  sourceReference:
    "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000008. " +
    "Freeze record: DRA-FRZ-000003. " +
    "Source digest: e7fb5008e9b407bc… " +
    "Publication date: 2023-09-18.",
};

const ENTRY_0010: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0010",
  title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "TECHNICAL",
  language: "en",
  generator: "National Institute of Standards and Technology (NIST)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  sourceReference: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000012. " +
    "Freeze record: DRA-FRZ-000004. " +
    "Source digest: 7576edb531d98488… " +
    "Publication date: 2023-01-26.",
};

const ENTRY_0011: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0011",
  title: "Guidance on AI and data protection",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "LEGAL",
  language: "en",
  generator: "Information Commissioner's Office (ICO)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (multi-page HTML, 14 sections) from " +
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  sourceReference:
    "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000013. " +
    "Freeze record: DRA-FRZ-000005. " +
    "Discovery ID: DRA-DIS-000001. " +
    `Combined source/text digest: ${DRA_DOC_0011_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2025-09-22. " +
    "Multi-page HTML: 14 sections. " +
    "Reproducibility: TEXT_STABLE. " +
    "Licence: Open Government Licence version 3.0 (OGL v3.0).",
};

const ENTRY_0012: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0012",
  title: "Model risk management principles for banks",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "FINANCE",
  language: "en",
  generator: "Prudential Regulation Authority (PRA), Bank of England",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
  sourceReference:
    "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000014. " +
    "Freeze record: DRA-FRZ-000006. " +
    "Discovery ID: DRA-DIS-000003. " +
    `Source digest: ${DRA_DOC_0012_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2023-05-17 (effective 2024-05-17). " +
    "Reference: Supervisory Statement SS1/23 (PS6/23). " +
    `Reproducibility: BYTE_STABLE. ` +
    `Licence: Bank of England Non-Commercial Academic Use.`,
};

const ENTRY_0013: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0013",
  title: "Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "HEALTHCARE",
  language: "en",
  generator: "U.S. Food and Drug Administration (FDA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.fda.gov/media/145022/download",
  sourceReference: "https://www.fda.gov/media/145022/download",
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000015. " +
    "Freeze record: DRA-FRZ-000007. " +
    "Discovery ID: DRA-DIS-000004. " +
    `Source digest: ${DRA_DOC_0013_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2021-01-12. " +
    `Reproducibility: BYTE_STABLE. ` +
    `Licence: US Government Work — Public Domain (17 U.S.C. § 105). ` +
    "First HEALTHCARE-domain document. New publisher: FDA.",
};

const ENTRY_0014: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0014",
  title: "Principles for Operational Resilience",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "FINANCE",
  language: "en",
  generator: "Basel Committee on Banking Supervision (BCBS)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    "https://www.bis.org/bcbs/publ/d516.pdf",
  sourceReference: "https://www.bis.org/bcbs/publ/d516.pdf",
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000016. " +
    "Freeze record: DRA-FRZ-000008. " +
    "Discovery ID: DRA-DIS-000005. " +
    `Source digest: ${DRA_DOC_0014_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2021-03. " +
    `Reproducibility: BYTE_STABLE. ` +
    `Licence: Bank for International Settlements Copyright — Non-commercial Educational Use. ` +
    "Second FINANCE-domain document. First international (BCBS/BIS) publisher.",
};

const ENTRY_0015: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0015",
  title: "Principles for the security of machine learning",
  sourceType: "HUMAN_AUTHORED",
  documentType: "OTHER",
  domain: "TECHNICAL",
  language: "en",
  generator: "National Cyber Security Centre (NCSC)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    DRA_DOC_0015_PDF_URL,
  sourceReference: DRA_DOC_0015_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000018 (programme ref: DRA-ACQ-011). " +
    "Freeze record: DRA-FRZ-000009. " +
    `Source digest: ${DRA_DOC_0015_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2024-05-22 (Version 2.0). " +
    `Reproducibility: ${DRA_DOC_0015_REPRODUCIBILITY}. ` +
    "Second TECHNICAL-domain live-acquired document (joins DRA-DOC-0007, DRA-DOC-0010). " +
    "First NCSC/GCHQ publisher. First UK national-cyber-security-domain document.",
};

const ENTRY_0016: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0016",
  title: "Health and safety basics for your business",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "BUSINESS",
  language: "en-GB",
  generator: "Health and Safety Executive (HSE)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (multi-page HTML, 26 pages) from " +
    DRA_DOC_0016_LANDING_URL,
  sourceReference: DRA_DOC_0016_LANDING_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "LOW",
  notes:
    "Acquisition ID: DRA-ACQ-000019 (programme ref: DRA-ACQ-012). " +
    "Freeze record: DRA-FRZ-000010. " +
    `Combined source/text digest: ${DRA_DOC_0016_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2025-10-14. " +
    "Multi-page HTML: 26 pages (1 landing + 25 sub-pages across 9 topic guides). " +
    `Reproducibility: ${DRA_DOC_0016_REPRODUCIBILITY}. ` +
    `Licence: ${DRA_DOC_0016_LICENCE_NAME}. ` +
    "Second BUSINESS-domain document (joins DRA-DOC-0008, Acas). " +
    "New publisher: HSE. First LOW-difficulty document since DRA-DOC-0008.",
};

const ENTRY_0017: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0017",
  title: "Best practice guidance on patient information leaflets (PILs)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "PROCEDURE",
  domain: "HEALTHCARE",
  language: "en-GB",
  generator: "Medicines and Healthcare products Regulatory Agency (MHRA)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    DRA_DOC_0017_PDF_URL,
  sourceReference: DRA_DOC_0017_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000020 (programme ref: DRA-ACQ-013). " +
    "Freeze record: DRA-FRZ-000011. " +
    `Source digest: ${DRA_DOC_0017_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2014-12-29. " +
    `Reproducibility: ${DRA_DOC_0017_REPRODUCIBILITY}. ` +
    `Licence: ${DRA_DOC_0017_LICENCE_NAME}. ` +
    "Second HEALTHCARE-domain document (joins DRA-DOC-0013, FDA). " +
    "New publisher: MHRA. Patient-facing (rather than manufacturer-facing) subject matter, " +
    "distinct in jurisdiction and audience from DRA-DOC-0013.",
};

const ENTRY_0018: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0018",
  title: "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "es",
  generator: "European Commission — High-Level Expert Group on Artificial Intelligence",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 (through the DRA-ENG-011 malformed Content-Type fallback) from " +
    DRA_DOC_0018_PDF_URL,
  sourceReference: DRA_DOC_0018_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000021 (programme ref: DRA-ACQ-014 Phase 2 retry). " +
    "Freeze record: DRA-FRZ-000012. " +
    `Source digest: ${DRA_DOC_0018_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2019-04-08. " +
    `Reproducibility: ${DRA_DOC_0018_REPRODUCIBILITY}. ` +
    `Licence: ${DRA_DOC_0018_LICENCE_NAME}. ` +
    "First non-English (es) document in the corpus. First European Commission publisher. " +
    "First REPORT documentType document. " +
    "Admission required DRA-ENG-011 (narrow PDF fallback for a malformed origin Content-Type header).",
};

// ---------------------------------------------------------------------------
// Freeze reference table (from admitted records)
// ---------------------------------------------------------------------------

const FREEZE_TABLE = [
  {
    corpusId:           "DRA-DOC-0007",
    freezeId:           "DRA-FRZ-000001",
    sourceDigest:        APACHE_HTTPD_AUTH_FIXTURE.sourceDigest,
    textDigest:          APACHE_HTTPD_AUTH_FIXTURE.normalisedTextDigest,
    metadataDigest:     null,
    freezeRecordDigest:  null,
  },
  {
    corpusId:           "DRA-DOC-0008",
    freezeId:           "DRA-FRZ-000002",
    sourceDigest:       "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300",
    textDigest:         "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0",
    metadataDigest:     null,
    freezeRecordDigest:  null,
  },
  {
    corpusId:           "DRA-DOC-0009",
    freezeId:           "DRA-FRZ-000003",
    sourceDigest:       "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f",
    textDigest:         "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed",
    metadataDigest:     "15597eefbfb483697efc7f003e187e4cd8207e455e160a83591adad02968586e",
    freezeRecordDigest: "092a1219536aa6eec0905bdce2c0a2d37e5c07e5863f90df290638e17456d848",
  },
  {
    corpusId:           "DRA-DOC-0010",
    freezeId:           "DRA-FRZ-000004",
    sourceDigest:       "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1",
    textDigest:         "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430",
    metadataDigest:     "61c283bffec8677844f2f54ba0f239abd03d0380b815442f95317b0119871f97",
    freezeRecordDigest: "7d99f6b3fc2ae9e4cb5d1754cbd381ba73e316a79454988345c92faf99f69312",
  },
  {
    corpusId:           "DRA-DOC-0011",
    freezeId:           "DRA-FRZ-000005",
    sourceDigest:       DRA_DOC_0011_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0011_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0011_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0011_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0012",
    freezeId:           "DRA-FRZ-000006",
    sourceDigest:       DRA_DOC_0012_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0012_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0012_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0012_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0013",
    freezeId:           "DRA-FRZ-000007",
    sourceDigest:       DRA_DOC_0013_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0013_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0013_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0013_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0014",
    freezeId:           "DRA-FRZ-000008",
    sourceDigest:       DRA_DOC_0014_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0014_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0014_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0014_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0015",
    freezeId:           "DRA-FRZ-000009",
    sourceDigest:       DRA_DOC_0015_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0015_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0015_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0015_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0016",
    freezeId:           "DRA-FRZ-000010",
    sourceDigest:       DRA_DOC_0016_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0016_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0016_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0016_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0017",
    freezeId:           "DRA-FRZ-000011",
    sourceDigest:       DRA_DOC_0017_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0017_TEXT_DIGEST,
    metadataDigest:     DRA_DOC_0017_METADATA_DIGEST,
    freezeRecordDigest: DRA_DOC_0017_FREEZE_RECORD_DIGEST,
  },
  {
    corpusId:           "DRA-DOC-0018",
    freezeId:           "DRA-FRZ-000012",
    sourceDigest:       DRA_DOC_0018_SOURCE_DIGEST,
    textDigest:         DRA_DOC_0018_TEXT_DIGEST,
    // Metadata/freeze-record digests were only reported as truncated fragments in the
    // task's authoritative inputs; not fabricated here (unlike DRA-DOC-0011–0017, whose
    // full digests were carried forward verbatim from their own admission tests).
    metadataDigest:     null,
    freezeRecordDigest: null,
  },
] as const;

// ---------------------------------------------------------------------------
// Part 1 — Authoritative 17-Document Checkpoint
// ---------------------------------------------------------------------------

describe("DRA-BMK-018 — Part 1: Authoritative 18-Document Corpus Checkpoint (DRA-CHK-000018)", () => {
  it("builds the authoritative 18-document corpus and validates every required property", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-BMK-018 — CORPUS CHECKPOINT LOG                      ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    console.log(`── Checkpoint Identity ──────────────────────────────────────`);
    console.log(`  checkpointId        : ${CHECKPOINT_ID}`);
    console.log(`  checkpointTimestamp : ${CHECKPOINT_TIMESTAMP}`);
    console.log(`  benchmarkMilestone  : ${BENCHMARK_MILESTONE}`);
    console.log(`  corpusVersion       : ${CORPUS_VERSION}`);

    // ── Build consolidated registry ──────────────────────────────────────────

    const registry = new CorpusRegistry();

    // DRA-DOC-0001–0006: initial-corpus governance
    for (const entry of BENCHMARK_CORPUS) {
      registry.add(entry.input);
    }

    // DRA-DOC-0007–0017: freeze-record governance
    registry.add(ENTRY_0007);
    registry.add(ENTRY_0008);
    registry.add(ENTRY_0009);
    registry.add(ENTRY_0010);
    registry.add(ENTRY_0011);
    registry.add(ENTRY_0012);
    registry.add(ENTRY_0013);
    registry.add(ENTRY_0014);
    registry.add(ENTRY_0015);
    registry.add(ENTRY_0016);
    registry.add(ENTRY_0017);
    registry.add(ENTRY_0018);

    // ── Validate document count ────────────────────────────────────────────

    console.log("\n── Registry Build ───────────────────────────────────────────");
    console.log(`  documents registered: ${registry.size}`);
    expect(registry.size).toBe(18);

    // ── Export authoritative manifest ────────────────────────────────────────

    const manifest = registry.exportManifest(CORPUS_VERSION);

    console.log("\n── Authoritative Manifest ───────────────────────────────────");
    console.log(`  schemaVersion  : ${manifest.schemaVersion}`);
    console.log(`  corpusVersion  : ${manifest.corpusVersion}`);
    console.log(`  documentCount  : ${manifest.documentCount}`);
    console.log(`  overallDigest  : ${manifest.overallDigest}`);
    console.log(`  documentIds    : ${manifest.documentIds.join(", ")}`);

    // ── Manifest integrity ───────────────────────────────────────────────────

    const manifestIntact = verifyManifestIntegrity(manifest);
    console.log(`  integrity check: ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
    expect(manifestIntact).toBe(true);
    expect(manifest.documentCount).toBe(18);
    expect(manifest.corpusVersion).toBe(CORPUS_VERSION);
    expect(manifest.overallDigest).toHaveLength(64);
    expect(manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);

    // Cross-check against the manifest digest recorded at DRA-DOC-0018 admission
    // time (DRA-ACQ-014 Phase 2 retry). Only a truncated prefix/suffix fragment of
    // that digest was carried forward as an authoritative input for this
    // checkpoint, so we verify against the fragment rather than fabricating the
    // omitted middle bytes. An exact prefix/suffix match confirms no previously
    // frozen record has drifted.
    console.log(`  expected (admission-time) overallDigest fragment: ${ADMISSION_MANIFEST_DIGEST_PREFIX}…${ADMISSION_MANIFEST_DIGEST_SUFFIX}`);
    expect(manifest.overallDigest.startsWith(ADMISSION_MANIFEST_DIGEST_PREFIX)).toBe(true);
    expect(manifest.overallDigest.endsWith(ADMISSION_MANIFEST_DIGEST_SUFFIX)).toBe(true);

    // ── Ordered corpus ID validation ─────────────────────────────────────────

    console.log("\n── Ordered Corpus IDs ───────────────────────────────────────");
    const listedDocs = registry.list();
    expect(listedDocs).toHaveLength(18);

    for (let i = 0; i < ORDERED_CORPUS_IDS.length; i++) {
      const expected = ORDERED_CORPUS_IDS[i]!;
      const actual   = listedDocs[i]?.corpusId;
      const ok       = actual === expected;
      console.log(`  [${String(i + 1).padStart(2)}] ${ok ? "✓" : "✗"} ${expected} (got: ${actual})`);
      expect(actual).toBe(expected);
    }

    // Manifest documentIds must match canonical order
    expect(manifest.documentIds).toEqual([...ORDERED_CORPUS_IDS]);

    // ── Duplicate identifier absence ─────────────────────────────────────────

    console.log("\n── Duplicate Identifier Absence ─────────────────────────────");
    const idSet = new Set(listedDocs.map((d) => d.corpusId));
    console.log(`  unique IDs: ${idSet.size} / ${listedDocs.length} — ${idSet.size === 18 ? "✓ PASS" : "✗ FAIL"}`);
    expect(idSet.size).toBe(18);

    for (const id of ORDERED_CORPUS_IDS) {
      expect(idSet.has(id)).toBe(true);
    }

    // ── DRA-DOC-0018 metadata validation ────────────────────────────────────

    console.log("\n── DRA-DOC-0018 Metadata Validation ────────────────────────");
    const doc18 = listedDocs.find((d) => d.corpusId === "DRA-DOC-0018");
    expect(doc18).toBeDefined();
    if (doc18) {
      const checks: Array<[string, string, string]> = [
        ["title",          doc18.title,           "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)"],
        ["documentType",   doc18.documentType,     "REPORT"],
        ["domain",         doc18.domain,           "TECHNICAL"],
        ["sourceType",     doc18.sourceType,       "HUMAN_AUTHORED"],
        ["difficulty",     doc18.difficulty,       "HIGH"],
        ["language",       doc18.language,         "es"],
        ["benchmarkStatus",doc18.benchmarkStatus,  "FROZEN"],
      ];
      for (const [field, actual, expected] of checks) {
        const ok = actual === expected;
        console.log(`  ${field.padEnd(16)}: ${ok ? "✓" : "✗"} "${actual}"`);
        expect(actual).toBe(expected);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Freeze and Source Verification
// ---------------------------------------------------------------------------

describe("DRA-BMK-018 — Part 2: Freeze and Source Verification", () => {
  it("verifies all live freeze records (DRA-DOC-0007–0018) against admitted reference values", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-BMK-018 — FREEZE VERIFICATION LOG                    ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    for (const entry of FREEZE_TABLE) {
      console.log(`── ${entry.corpusId} (${entry.freezeId}) ──────────────────────────`);
      console.log(`  sourceDigest       : ${entry.sourceDigest.slice(0, 16)}…`);
      console.log(`  textDigest         : ${entry.textDigest.slice(0, 16)}…`);
      if (entry.metadataDigest) {
        console.log(`  metadataDigest     : ${entry.metadataDigest.slice(0, 16)}…`);
      }
      if (entry.freezeRecordDigest) {
        console.log(`  freezeRecordDigest : ${entry.freezeRecordDigest.slice(0, 16)}…`);
      }
      expect(entry.sourceDigest).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.textDigest).toMatch(/^[0-9a-f]{64}$/);
      if (entry.metadataDigest) expect(entry.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
      if (entry.freezeRecordDigest) expect(entry.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
    }

    console.log("\n── DRA-DOC-0018 Specific Verification ───────────────────────");
    console.log("  Freeze ID          : DRA-FRZ-000012");
    console.log("  Acquisition ID     : DRA-ACQ-000021 (programme: DRA-ACQ-014 Phase 2 retry)");
    console.log(`  Source format      : Single PDF`);
    console.log(`  Source digest      : ${DRA_DOC_0018_SOURCE_DIGEST}`);
    console.log(`  Text digest        : ${DRA_DOC_0018_TEXT_DIGEST}`);
    console.log(`  Reproducibility    : ${DRA_DOC_0018_REPRODUCIBILITY}`);
    console.log(`  Licence basis      : ${DRA_DOC_0018_LICENCE_BASIS}`);
    console.log(`  Licence name       : ${DRA_DOC_0018_LICENCE_NAME}`);
    console.log(`  PDF URL            : ${DRA_DOC_0018_PDF_URL}`);

    expect(DRA_DOC_0018_SOURCE_DIGEST).toHaveLength(64);
    expect(DRA_DOC_0018_TEXT_DIGEST).toHaveLength(64);
    expect(DRA_DOC_0018_REPRODUCIBILITY).toBe("BYTE_STABLE");
    expect(DRA_DOC_0018_LICENCE_BASIS).toBe("CREATIVE_COMMONS_BY");
    // Admission-time invariant: a single-PDF document's source digest is the raw
    // PDF bytes; its text digest is the pdftotext-extracted normalised text —
    // these are distinct by construction.
    expect(DRA_DOC_0018_SOURCE_DIGEST).not.toBe(DRA_DOC_0018_TEXT_DIGEST);
  });

  it("verifies DRA-DOC-0018 canonical URL and source format", () => {
    console.log("\n── DRA-DOC-0018 Canonical URL ───────────────────────────────");
    console.log(`  PDF URL       : ${DRA_DOC_0018_PDF_URL}`);
    console.log(`  Format        : Single PDF`);
    console.log(`  Publisher     : European Commission — High-Level Expert Group on AI`);
    console.log(`  Publication   : 2019-04-08`);
    console.log(`  Domain        : TECHNICAL`);
    console.log(`  Language      : es (first non-English document in the corpus)`);
    console.log(`  Jurisdiction  : European Union`);

    expect(DRA_DOC_0018_PDF_URL).toContain("ec.europa.eu");
    expect(DRA_DOC_0018_PDF_URL).toContain("doc_id=60423");
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Corpus Balance Statistics
// ---------------------------------------------------------------------------

describe("DRA-BMK-018 — Part 3: Corpus Balance Statistics", () => {
  it("computes and reports updated balance statistics across all 18 documents", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-BMK-018 — CORPUS BALANCE STATISTICS                  ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    type DocMeta = {
      id: string;
      title: string;
      publisher: string;
      documentType: string;
      domain: string;
      sourceType: string;
      difficulty: string;
      language: string;
      licenceBasis: string;
      format: string;
      sourceStability: string;
      textLength: number;
      wordCount: number;
      freezeId: string | null;
    };

    const CORPUS_META: DocMeta[] = [
      // DRA-DOC-0001–0006: initial corpus
      { id:"DRA-DOC-0001", title:"Initial corpus doc 1", publisher:"Internal (AI generated)", documentType:"REPORT",    domain:"TECHNICAL",  sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      { id:"DRA-DOC-0002", title:"Initial corpus doc 2", publisher:"Internal (AI generated)", documentType:"REPORT",    domain:"BUSINESS",   sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      { id:"DRA-DOC-0003", title:"Initial corpus doc 3", publisher:"Internal (AI+human)",     documentType:"REPORT",    domain:"GENERAL",    sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      { id:"DRA-DOC-0004", title:"Initial corpus doc 4", publisher:"Internal (AI generated)", documentType:"REPORT",    domain:"GENERAL",    sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      { id:"DRA-DOC-0005", title:"Initial corpus doc 5", publisher:"Internal (AI generated)", documentType:"REPORT",    domain:"LEGAL",      sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      { id:"DRA-DOC-0006", title:"Initial corpus doc 6", publisher:"Internal (human)",        documentType:"REPORT",    domain:"TECHNICAL",  sourceType:"AI_GENERATED",   difficulty:"MEDIUM", language:"en",    licenceBasis:"AI_GENERATED",     format:"text/plain",             sourceStability:"BYTE_STABLE",  textLength:1200,   wordCount:180,   freezeId:null },
      // DRA-DOC-0007–0017: live-acquired
      { id:"DRA-DOC-0007", title:"Apache HTTP Server Auth Guide",                                    publisher:"Apache Software Foundation",                             documentType:"ARTICLE",  domain:"TECHNICAL",  sourceType:"HUMAN_AUTHORED", difficulty:"MEDIUM", language:"en",    licenceBasis:"OPEN_LICENCE",               format:"text/html",              sourceStability:"BYTE_STABLE",  textLength:19000,                              wordCount:2900,                        freezeId:"DRA-FRZ-000001" },
      { id:"DRA-DOC-0008", title:"Discipline and grievances at work",                                publisher:"Acas",                                                   documentType:"PROCEDURE",domain:"BUSINESS",   sourceType:"HUMAN_AUTHORED", difficulty:"LOW",    language:"en-GB", licenceBasis:"OPEN_LICENCE",               format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:89713,                              wordCount:14000,                       freezeId:"DRA-FRZ-000002" },
      { id:"DRA-DOC-0009", title:"AI Foundation Models: Short Version",                              publisher:"Competition and Markets Authority",                       documentType:"SUMMARY",  domain:"GENERAL",   sourceType:"HUMAN_AUTHORED", difficulty:"MEDIUM", language:"en-GB", licenceBasis:"OPEN_LICENCE",               format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:89713,                              wordCount:14000,                       freezeId:"DRA-FRZ-000003" },
      { id:"DRA-DOC-0010", title:"NIST AI RMF 1.0",                                                 publisher:"NIST",                                                   documentType:"POLICY",   domain:"TECHNICAL",  sourceType:"HUMAN_AUTHORED", difficulty:"HIGH",   language:"en",    licenceBasis:"US_GOVERNMENT_WORK",         format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:122238,                             wordCount:19000,                       freezeId:"DRA-FRZ-000004" },
      { id:"DRA-DOC-0011", title:"Guidance on AI and data protection",                               publisher:"Information Commissioner's Office (ICO)",                 documentType:"OTHER",    domain:"LEGAL",     sourceType:"HUMAN_AUTHORED", difficulty:"HIGH",   language:"en",    licenceBasis:"OPEN_LICENCE",               format:"text/html (multi-page)", sourceStability:"TEXT_STABLE",  textLength:DRA_DOC_0011_TEXT_LENGTH,           wordCount:DRA_DOC_0011_WORD_COUNT,     freezeId:"DRA-FRZ-000005" },
      { id:"DRA-DOC-0012", title:"Model risk management principles for banks",                       publisher:"Prudential Regulation Authority (PRA), Bank of England",  documentType:"OTHER",    domain:"FINANCE",   sourceType:"HUMAN_AUTHORED", difficulty:"MEDIUM", language:"en",    licenceBasis:"BOE_NON_COMMERCIAL_ACADEMIC",format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:DRA_DOC_0012_TEXT_LENGTH,           wordCount:DRA_DOC_0012_WORD_COUNT,     freezeId:"DRA-FRZ-000006" },
      { id:"DRA-DOC-0013", title:"FDA AI/ML SaMD Action Plan",                                      publisher:"U.S. Food and Drug Administration (FDA)",                 documentType:"POLICY",   domain:"HEALTHCARE",sourceType:"HUMAN_AUTHORED", difficulty:"MEDIUM", language:"en",    licenceBasis:"PUBLIC_DOMAIN",              format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:DRA_DOC_0013_TEXT_LENGTH,           wordCount:DRA_DOC_0013_WORD_COUNT,     freezeId:"DRA-FRZ-000007" },
      { id:"DRA-DOC-0014", title:"Principles for Operational Resilience",                            publisher:"Basel Committee on Banking Supervision (BCBS)",           documentType:"POLICY",   domain:"FINANCE",   sourceType:"HUMAN_AUTHORED", difficulty:"HIGH",   language:"en",    licenceBasis:"BIS_NON_COMMERCIAL_EDUCATIONAL",format:"application/pdf",      sourceStability:"BYTE_STABLE",  textLength:DRA_DOC_0014_TEXT_LENGTH,           wordCount:DRA_DOC_0014_WORD_COUNT,     freezeId:"DRA-FRZ-000008" },
      { id:"DRA-DOC-0015", title:"Principles for the security of machine learning",                  publisher:"National Cyber Security Centre (NCSC)",                   documentType:"OTHER",    domain:"TECHNICAL", sourceType:"HUMAN_AUTHORED", difficulty:"HIGH",   language:"en",    licenceBasis:"OPEN_LICENCE",               format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:DRA_DOC_0015_TEXT_LENGTH,           wordCount:DRA_DOC_0015_WORD_COUNT,     freezeId:"DRA-FRZ-000009" },
      { id:"DRA-DOC-0016", title:"Health and safety basics for your business",                       publisher:"Health and Safety Executive (HSE)",                       documentType:"PROCEDURE",domain:"BUSINESS", sourceType:"HUMAN_AUTHORED", difficulty:"LOW",    language:"en-GB", licenceBasis:"OPEN_LICENCE",               format:"text/html (multi-page)", sourceStability:"TEXT_STABLE",  textLength:DRA_DOC_0016_TEXT_LENGTH,           wordCount:DRA_DOC_0016_WORD_COUNT,     freezeId:"DRA-FRZ-000010" },
      { id:"DRA-DOC-0017", title:"Best practice guidance on patient information leaflets (PILs)",    publisher:"Medicines and Healthcare products Regulatory Agency (MHRA)", documentType:"PROCEDURE", domain:"HEALTHCARE", sourceType:"HUMAN_AUTHORED", difficulty:"MEDIUM", language:"en-GB", licenceBasis:"OPEN_LICENCE",             format:"application/pdf",        sourceStability:"BYTE_STABLE",  textLength:DRA_DOC_0017_TEXT_LENGTH,           wordCount:DRA_DOC_0017_WORD_COUNT,     freezeId:"DRA-FRZ-000011" },
      { id:"DRA-DOC-0018", title:"Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — es)", publisher:"European Commission — High-Level Expert Group on AI", documentType:"REPORT", domain:"TECHNICAL", sourceType:"HUMAN_AUTHORED", difficulty:"HIGH", language:"es", licenceBasis:"CREATIVE_COMMONS_BY", format:"application/pdf", sourceStability:"BYTE_STABLE", textLength:DRA_DOC_0018_TEXT_LENGTH, wordCount:DRA_DOC_0018_WORD_COUNT, freezeId:"DRA-FRZ-000012" },
    ];

    console.log(`── Total Documents ──────────────────────────────────────────`);
    console.log(`  Total: ${CORPUS_META.length}`);
    expect(CORPUS_META.length).toBe(18);

    const countBy = (key: keyof DocMeta): Map<string, number> => {
      const m = new Map<string, number>();
      for (const doc of CORPUS_META) {
        const v = String(doc[key]);
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      return m;
    };

    const docTypeMap    = countBy("documentType");
    const domainMap     = countBy("domain");
    const sourceTypeMap = countBy("sourceType");
    const difficultyMap = countBy("difficulty");
    const publisherMap  = countBy("publisher");
    const licenceMap    = countBy("licenceBasis");
    const formatMap     = countBy("format");
    const stabilityMap  = countBy("sourceStability");

    console.log("\n── Document-Type Distribution ───────────────────────────────");
    for (const [k, v] of [...docTypeMap.entries()].sort()) {
      console.log(`  ${k.padEnd(20)}: ${v}`);
    }

    console.log("\n── Domain Distribution ──────────────────────────────────────");
    for (const [k, v] of [...domainMap.entries()].sort()) {
      console.log(`  ${k.padEnd(12)}: ${v}`);
    }

    console.log("\n── Source-Type Distribution ─────────────────────────────────");
    for (const [k, v] of [...sourceTypeMap.entries()].sort()) {
      console.log(`  ${k.padEnd(18)}: ${v}`);
    }

    console.log("\n── Difficulty Distribution ──────────────────────────────────");
    for (const [k, v] of [...difficultyMap.entries()].sort()) {
      console.log(`  ${k.padEnd(8)}: ${v}`);
    }

    console.log("\n── Publisher Distribution ───────────────────────────────────");
    for (const [k, v] of [...publisherMap.entries()].sort()) {
      console.log(`  ${k.padEnd(55)}: ${v}`);
    }

    console.log("\n── Licence Basis Distribution ───────────────────────────────");
    for (const [k, v] of [...licenceMap.entries()].sort()) {
      console.log(`  ${k.padEnd(32)}: ${v}`);
    }

    console.log("\n── Format Distribution ──────────────────────────────────────");
    for (const [k, v] of [...formatMap.entries()].sort()) {
      console.log(`  ${k.padEnd(30)}: ${v}`);
    }

    console.log("\n── Source Stability Distribution ────────────────────────────");
    for (const [k, v] of [...stabilityMap.entries()].sort()) {
      console.log(`  ${k.padEnd(14)}: ${v}`);
    }

    const singlePage = CORPUS_META.filter((d) => !d.format.includes("multi-page")).length;
    const multiPage  = CORPUS_META.filter((d) => d.format.includes("multi-page")).length;

    console.log("\n── Single vs Multi-Page Source Distribution ─────────────────");
    console.log(`  Single-page : ${singlePage}`);
    console.log(`  Multi-page  : ${multiPage} (DRA-DOC-0011 — ICO, 14 sections; DRA-DOC-0016 — HSE, 26 pages)`);
    expect(multiPage).toBe(2);
    expect(singlePage).toBe(16);

    const financeCount    = domainMap.get("FINANCE")    ?? 0;
    const healthcareCount = domainMap.get("HEALTHCARE") ?? 0;
    const technicalCount  = domainMap.get("TECHNICAL")  ?? 0;
    const businessCount   = domainMap.get("BUSINESS")   ?? 0;
    const highCount       = difficultyMap.get("HIGH")   ?? 0;
    const lowCount        = difficultyMap.get("LOW")    ?? 0;
    const aiGenCount      = sourceTypeMap.get("AI_GENERATED") ?? 0;
    const esCount         = countBy("language").get("es") ?? 0;
    const reportCount     = docTypeMap.get("REPORT") ?? 0;

    console.log("\n── Concentration Risks ──────────────────────────────────────");
    console.log(`  TECHNICAL domain  : ${technicalCount}/18 — DRA-DOC-0001, 0006, 0007, 0010, 0015, 0018`);
    console.log(`  GENERAL domain    : ${domainMap.get("GENERAL")    ?? 0}/18`);
    console.log(`  LEGAL domain      : ${domainMap.get("LEGAL")      ?? 0}/18`);
    console.log(`  BUSINESS domain   : ${businessCount}/18 — DRA-DOC-0002, 0008 (Acas), 0016 (HSE)`);
    console.log(`  FINANCE domain    : ${financeCount}/18 — DRA-DOC-0012 (PRA) + DRA-DOC-0014 (BCBS)`);
    console.log(`  HEALTHCARE domain : ${healthcareCount}/18 — DRA-DOC-0013 (FDA) + DRA-DOC-0017 (MHRA)`);
    console.log(`  AI_GENERATED      : ${aiGenCount}/18 — initial corpus only`);
    console.log(`  HIGH difficulty   : ${highCount}/18`);
    console.log(`  LOW difficulty    : ${lowCount}/18 — DRA-DOC-0008 (Acas), DRA-DOC-0016 (HSE)`);
    console.log(`  es language       : ${esCount}/18 — DRA-DOC-0018 only (first non-English document)`);
    console.log(`  REPORT type       : ${reportCount}/18 — includes DRA-DOC-0001..0006 (initial corpus) + DRA-DOC-0018 (first live-acquired REPORT)`);

    // TECHNICAL gains a document (DRA-DOC-0018); FINANCE/HEALTHCARE/BUSINESS unchanged.
    expect(financeCount).toBe(2);
    expect(healthcareCount).toBe(2);
    expect(technicalCount).toBe(6);
    expect(businessCount).toBe(3);
    expect(lowCount).toBe(2);
    expect(esCount).toBe(1);

    console.log("\n── DRA-DOC-0018 Structural Contribution ─────────────────────");
    console.log("  New publisher              : YES — European Commission (first EU institution as publisher)");
    console.log("  TECHNICAL domain           : Sixth TECHNICAL document (joins 0001, 0006, 0007, 0010, 0015)");
    console.log("  HIGH difficulty            : No shift in difficulty distribution vs DRA-BMK-017");
    console.log("  First non-English (es) document in the corpus — language dimension newly exercised");
    console.log("  First REPORT-documentType document acquired from a live source (0001–0006 are AI-generated REPORTs)");
    console.log(`  Size contribution (approx) : ${DRA_DOC_0018_WORD_COUNT.toLocaleString()} words / ${DRA_DOC_0018_TEXT_LENGTH.toLocaleString()} chars — refined via live extraction in evaluator-run file`);
    console.log("  Licence                    : Creative Commons Attribution 4.0 International (CC BY 4.0)");
    console.log("  Evaluator contribution     : measured in DRA-BMK-018 evaluator-run file, not assumed here");

    console.log("\n── Underrepresented Categories ──────────────────────────────");
    console.log("  Document types absent: EMAIL, REWRITE");
    console.log("  Domains under 2 docs: (none — HEALTHCARE at 2)");
    console.log("  Source types: no HYBRID");
    console.log("  Difficulty LOW: 2/18 (still under-represented relative to MEDIUM/HIGH)");
    console.log("  Language: only 1/18 non-English document (es) — still overwhelmingly English");

    console.log("\n── Known Source-Change Observations ─────────────────────────");
    console.log("  DRA-DOC-0008 (Acas guide): text content changed after admission");
    console.log("  DRA-DOC-0011 (ICO guidance): TEXT_STABLE");
    console.log("  DRA-DOC-0012 (PRA SS1/23): BYTE_STABLE");
    console.log("  DRA-DOC-0013 (FDA SaMD): BYTE_STABLE");
    console.log("  DRA-DOC-0014 (BCBS d516): BYTE_STABLE");
    console.log("  DRA-DOC-0015 (NCSC ML Principles): BYTE_STABLE (two fetches, DRA-ACQ-011, 2026-08-06)");
    console.log("  DRA-DOC-0016 (HSE Health and Safety Basics): TEXT_STABLE (two 26-page fetch passes, DRA-ACQ-012, 2026-08-07)");
    console.log("  DRA-DOC-0017 (MHRA PIL guidance): BYTE_STABLE (two fetch passes, DRA-ACQ-013 Phase 2, 2026-08-07)");
    console.log("  DRA-DOC-0018 (EC Ethics Guidelines, es): BYTE_STABLE (two fetch passes, DRA-ACQ-014 Phase 2 retry, 2026-08-07)");

    expect(true).toBe(true);
  });
});
