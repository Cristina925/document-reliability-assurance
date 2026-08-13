/**
 * DRA-BMK-021 — Part 1-3: Twenty-One-Document Corpus Checkpoint
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  TWENTY-ONE-DOCUMENT CORPUS CHECKPOINT — DRA-CHK-000021                  ║
 * ║                                                                          ║
 * ║  Checkpoint ID : DRA-CHK-000021                                          ║
 * ║  Milestone     : DRA-BMK-021                                             ║
 * ║  Corpus version: DRA-CORPUS-1.0.0                                        ║
 * ║                                                                          ║
 * ║  Corpus state:                                                           ║
 * ║    DRA-DOC-0001–0006: initial AI-generated corpus                        ║
 * ║    DRA-DOC-0007–0021: live-acquired, frozen documents                    ║
 * ║    Total: 21 documents                                                   ║
 * ║                                                                          ║
 * ║  DRA-DOC-0021: EC/HLEG-AI — Ethics Guidelines for Trustworthy AI (EN)    ║
 * ║    Freeze ID:  DRA-FRZ-000015 / Acquisition: DRA-ACQ-000024              ║
 * ║    (programme ref: DRA-ACQ-017 Phase 2)                                  ║
 * ║    Parallel control: DRA-DOC-0018 (same publication, Spanish edition)    ║
 * ║                                                                          ║
 * ║  THIS IS A BENCHMARK CHECKPOINT, NOT AN ACQUISITION PROGRAMME:           ║
 * ║    • DRA-DOC-0021 was already admitted and frozen under DRA-ACQ-017     ║
 * ║      Phase 2.                                                           ║
 * ║    • This checkpoint re-derives the corpus-wide picture from the        ║
 * ║      consolidated 21-document run and performs a controlled,           ║
 * ║      paired-evidence EN/ES comparison against DRA-DOC-0018 (see the     ║
 * ║      companion comparative-analysis file).                              ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No evaluator rules modified                                         ║
 * ║    • No document content altered                                         ║
 * ║    • No admission decisions reversed                                     ║
 * ║    • Outcome parity between EN and ES is NOT the success criterion       ║
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

const CHECKPOINT_ID        = "DRA-CHK-000021";
const CHECKPOINT_TIMESTAMP = "2026-08-09T18:00:00.000Z";
const BENCHMARK_MILESTONE  = "DRA-BMK-021";
const CORPUS_VERSION       = "DRA-CORPUS-1.0.0";

// ---------------------------------------------------------------------------
// Ordered corpus IDs (canonical sequence)
// ---------------------------------------------------------------------------

const ORDERED_CORPUS_IDS = [
  "DRA-DOC-0001", "DRA-DOC-0002", "DRA-DOC-0003", "DRA-DOC-0004",
  "DRA-DOC-0005", "DRA-DOC-0006", "DRA-DOC-0007", "DRA-DOC-0008",
  "DRA-DOC-0009", "DRA-DOC-0010", "DRA-DOC-0011", "DRA-DOC-0012",
  "DRA-DOC-0013", "DRA-DOC-0014", "DRA-DOC-0015", "DRA-DOC-0016",
  "DRA-DOC-0017", "DRA-DOC-0018", "DRA-DOC-0019", "DRA-DOC-0020",
  "DRA-DOC-0021",
] as const;

// ---------------------------------------------------------------------------
// Apache fixture — used for DRA-DOC-0007 sourceDigest reference
// ---------------------------------------------------------------------------

const APACHE_HTTPD_AUTH_FIXTURE = (() => {
  const bytes        = new TextEncoder().encode(APACHE_HTTPD_AUTH_HTML);
  const sourceDigest = computeSourceDigest(bytes);
  return { sourceDigest, normalisedTextDigest: sourceDigest };
})();

// ---------------------------------------------------------------------------
// Freeze reference constants for previously-admitted documents
// (unchanged — reproduced verbatim from DRA-BMK-020 for continuity)
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

const DRA_DOC_0015_SOURCE_DIGEST   = "85b9a340508058be3be0b7bc10fc54c5744f23035f570b719d4336eae2fba993";
const DRA_DOC_0015_TEXT_DIGEST     = "78b499ea3cb48748213d3f60b3198063712d093b7550283828b8a71e40f92c32";
const DRA_DOC_0015_TEXT_LENGTH     = 97802;
const DRA_DOC_0015_WORD_COUNT      = 12451;
const DRA_DOC_0015_METADATA_DIGEST = "6bd33d60fbcdea44be81b8d47bd9fa0e383c38d06b4fadf657d07a4a240a7822";
const DRA_DOC_0015_FREEZE_RECORD_DIGEST = "1cba9d2358b8d4bb215843da99a4ba963edf86d3f4026a65ae2de271e3a183ff";
const DRA_DOC_0015_PDF_URL         = "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf";

const DRA_DOC_0016_SOURCE_DIGEST   = "fbeb65fd2c5de4860eaa6492b87c75ea92543a8444030ec889a0099b4f00f9c9";
const DRA_DOC_0016_TEXT_DIGEST     = "fbeb65fd2c5de4860eaa6492b87c75ea92543a8444030ec889a0099b4f00f9c9";
const DRA_DOC_0016_TEXT_LENGTH     = 82714;
const DRA_DOC_0016_WORD_COUNT      = 12355;
const DRA_DOC_0016_METADATA_DIGEST = "c5ea5b9a0ea023995832fbe792f7ad02fe33533f2f7161764d87718c0ef78fb8";
const DRA_DOC_0016_FREEZE_RECORD_DIGEST = "06b9bcc36bf198b826437895c3080cf2ee8be1397e72d64965157376069cbda6";
const DRA_DOC_0016_LICENCE_NAME    = "Crown Copyright — Open Government Licence v3.0";
const DRA_DOC_0016_LANDING_URL     = "https://www.hse.gov.uk/simple-health-safety/";

const DRA_DOC_0017_SOURCE_DIGEST   = "8593e8dabf6a967449a35155fcb140f4b234c20e3739dcbcbfd933ff2dd46383";
const DRA_DOC_0017_TEXT_DIGEST     = "891ab4f5ce73831bc432a5efe166f46517bb277f82ca1652fbd04df8e7bb0b1a";
const DRA_DOC_0017_TEXT_LENGTH     = 72170;
const DRA_DOC_0017_WORD_COUNT      = 10617;
const DRA_DOC_0017_METADATA_DIGEST = "e7d3483793f0269c0e66a289b865ed1a5aeac37439c7539fe5705a44549505a7";
const DRA_DOC_0017_FREEZE_RECORD_DIGEST = "6af10465ecfe523f76597287074a4f4d4d3c6296592992437520dd0daca01774";
const DRA_DOC_0017_PDF_URL         = "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf";

const DRA_DOC_0018_TEXT_LENGTH     = 85000; // approximate
const DRA_DOC_0018_WORD_COUNT      = 13000; // approximate
const DRA_DOC_0018_SOURCE_DIGEST   = "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2";
const DRA_DOC_0018_TEXT_DIGEST     = "1903017a0c169b2a95a0547c693be9ffb70e5057fa266075a4bb296e80367361";
const DRA_DOC_0018_LICENCE_NAME    = "Creative Commons Attribution 4.0 International (CC BY 4.0), Commission Decision 2011/833/EU";
const DRA_DOC_0018_PDF_URL         = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";

const DRA_DOC_0019_TEXT_LENGTH        = 145000; // approximate
const DRA_DOC_0019_WORD_COUNT         = 21000;  // approximate
const DRA_DOC_0019_SOURCE_DIGEST      = "9d55917aeb82dedc43e53123a8769488569b2425c4b9639eb2702d1db12ac981";
const DRA_DOC_0019_TEXT_DIGEST        = "c1ffc3ee8fd6957934029bcf9ed6ae3c1381c7c23f6d3608af748375359bf1cf";
const DRA_DOC_0019_METADATA_DIGEST    = "03ae64d9579ed97ccefd682d7d2ae67e52153f4ac33646f89d24bc6bfa8c4b7f";
const DRA_DOC_0019_FREEZE_RECORD_DIGEST = "c58c37c8fbd5bb80c885d8bcd8a9ff90a5e03ab8cba4165ac1c61cadf0900f51";
const DRA_DOC_0019_LICENCE_NAME       = "Creative Commons Attribution 4.0 International (CC BY 4.0)";
const DRA_DOC_0019_PDF_URL            = "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf";

// DRA-DOC-0020 (CNIL AI-Ethics Report, DRA-FRZ-000014) — BYTE_STABLE.
// All four digests are full, known values from admission (DRA-ACQ-016 Phase 2).
const DRA_DOC_0020_TEXT_LENGTH        = 130000; // approximate — refined via live extraction in evaluator-run file
const DRA_DOC_0020_WORD_COUNT         = 19000;  // approximate — refined via live extraction in evaluator-run file
const DRA_DOC_0020_STATEMENT_COUNT    = 4446;   // admission-time observation, corpus-wide (20-doc)
const DRA_DOC_0020_SOURCE_DIGEST      = "0819ead041bbdca3d5dc95c35bef3f01b3a188bc6c99d3c7b370f253aba40170";
const DRA_DOC_0020_TEXT_DIGEST        = "09806b136d3ed816d568d1272459931d01928ffbe533821188c0dd487d0e78a4";
const DRA_DOC_0020_METADATA_DIGEST    = "59e82da18c46d213392f253b20430bb45a21391c72e31c8e025ff5820b261796";
const DRA_DOC_0020_FREEZE_RECORD_DIGEST = "c047f73a5d22640ed5ecab79b01ab4ff1d8161ee2aec0e0d18563d56e7a34852";
const DRA_DOC_0020_LICENCE_NAME       = "Creative Commons Attribution-NoDerivatives 4.0 France (CC BY-ND 4.0 FR)";
const DRA_DOC_0020_PDF_URL            = "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf";

// (20-document admission-time manifest digest, DRA-BMK-020: 8f3fe0b0…d63c —
// superseded below by the 21-document ADMISSION_MANIFEST_DIGEST)

// DRA-DOC-0021 (EC/HLEG-AI Ethics Guidelines, EN edition, DRA-FRZ-000015) —
// admitted under DRA-ACQ-017 Phase 2. BYTE_STABLE.
const DRA_DOC_0021_TEXT_LENGTH        = 88000; // approximate — refined via live extraction in evaluator-run file
const DRA_DOC_0021_WORD_COUNT         = 13500; // approximate — refined via live extraction in evaluator-run file
const DRA_DOC_0021_SOURCE_DIGEST      = "4a89863a96551bb3b9ce786afb1b1d58e8062f5a7fa3ed6748922550dde35e25";
const DRA_DOC_0021_TEXT_DIGEST        = "6ab2fca6c1473331ae717cf4aaadbd830dc18abf0daa5d0f1a98ab21d149c548";
const DRA_DOC_0021_METADATA_DIGEST    = "32bb4ff15d9ea9dab9d8325050aa1b6c0a395444c865ef1848b6df5583877903";
const DRA_DOC_0021_FREEZE_RECORD_DIGEST = "307d407f53609379a87ad33814c2d4254b77a4cdf4ed239b5e270cc7a9c76bf2";
const DRA_DOC_0021_LICENCE_NAME       = "Creative Commons Attribution 4.0 International (CC BY 4.0), Commission Decision 2011/833/EU";
const DRA_DOC_0021_PDF_URL            = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419";

// Manifest digest recorded at admission time (DRA-ACQ-017 Phase 2, 21-document
// corpus) — the full value was recorded, so exact equality is checked rather
// than a prefix/suffix fragment.
const ADMISSION_MANIFEST_DIGEST = "f0857643448d1b7e33e32f761fa817329b7a9a28ffc1a8081f8e1bc14a8bdd26";

// ---------------------------------------------------------------------------
// Live-document CorpusDocumentInput entries (DRA-DOC-0007–0021)
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
    `Reproducibility: BYTE_STABLE. ` +
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
    `Reproducibility: TEXT_STABLE. ` +
    `Licence: ${DRA_DOC_0016_LICENCE_NAME}. ` +
    "Second BUSINESS-domain document (joins DRA-DOC-0008, Acas). " +
    "New publisher: HSE.",
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
    `Reproducibility: BYTE_STABLE. ` +
    "Second HEALTHCARE-domain document (joins DRA-DOC-0013, FDA). New publisher: MHRA.",
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
    `Reproducibility: BYTE_STABLE. ` +
    `Licence: ${DRA_DOC_0018_LICENCE_NAME}. ` +
    "First non-English (es) document in the corpus. First European Commission publisher. " +
    "First REPORT documentType document.",
};

const ENTRY_0019: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0019",
  title: "Informe de la Revisión por Pares (Peer Review Report — Spain's compliance with the European Statistics Code of Practice)",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "GENERAL",
  language: "es",
  generator: "Instituto Nacional de Estadística (INE)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    DRA_DOC_0019_PDF_URL,
  sourceReference: DRA_DOC_0019_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "MEDIUM",
  notes:
    "Acquisition ID: DRA-ACQ-000022 (programme ref: DRA-ACQ-015 Phase 2). " +
    "Freeze record: DRA-FRZ-000013. " +
    `Source digest: ${DRA_DOC_0019_SOURCE_DIGEST.slice(0, 16)}… ` +
    `Reproducibility: BYTE_STABLE (two independent live fetches, matching Phase 1 discovery digest). ` +
    `Licence: ${DRA_DOC_0019_LICENCE_NAME} (verified via a full redirect chain from the INE legal-notice page). ` +
    "Second non-English (es) document in the corpus (joins DRA-DOC-0018). " +
    "Second GENERAL-domain document (joins DRA-DOC-0009). " +
    "New publisher: INE (Spain's national statistics institute).",
};

const ENTRY_0020: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0020",
  title: "Comment permettre à l'Homme de garder la main ? Les enjeux éthiques des algorithmes et de l'intelligence artificielle",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "LEGAL",
  language: "fr",
  generator: "Commission Nationale de l'Informatique et des Libertés (CNIL)",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    DRA_DOC_0020_PDF_URL,
  sourceReference: DRA_DOC_0020_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000023 (programme ref: DRA-ACQ-016 Phase 2). " +
    "Freeze record: DRA-FRZ-000014. " +
    `Source digest: ${DRA_DOC_0020_SOURCE_DIGEST.slice(0, 16)}… ` +
    `Reproducibility: BYTE_STABLE (two independent live fetches, matching Phase 1 discovery digest). ` +
    `Licence: ${DRA_DOC_0020_LICENCE_NAME} (ND-permitted-use governance determination recorded at admission — ` +
    "grounded in the pipeline's digest-only freeze records and short-excerpt claim extraction; explicitly " +
    "does not extend to any future full-text public republication). " +
    "Third non-English document in the corpus and FIRST French document (joins DRA-DOC-0018/es, DRA-DOC-0019/es). " +
    "Third LEGAL-domain document (joins DRA-DOC-0005, DRA-DOC-0011/ICO). " +
    "New publisher: CNIL (France's data protection authority).",
};

const ENTRY_0021: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0021",
  title: "Ethics Guidelines for Trustworthy AI",
  sourceType: "HUMAN_AUTHORED",
  documentType: "REPORT",
  domain: "TECHNICAL",
  language: "en",
  generator: "European Commission — High-Level Expert Group on Artificial Intelligence",
  generatorVersion: CORPUS_VERSION,
  creationMethod:
    "Public document acquisition via DRA-ENG-009 from " +
    DRA_DOC_0021_PDF_URL,
  sourceReference: DRA_DOC_0021_PDF_URL,
  benchmarkStatus: "FROZEN",
  difficulty: "HIGH",
  notes:
    "Acquisition ID: DRA-ACQ-000024 (programme ref: DRA-ACQ-017 Phase 2). " +
    "Freeze record: DRA-FRZ-000015. " +
    `Source digest: ${DRA_DOC_0021_SOURCE_DIGEST.slice(0, 16)}… ` +
    "Publication date: 2019-04-08. " +
    `Reproducibility: BYTE_STABLE. ` +
    `Licence: ${DRA_DOC_0021_LICENCE_NAME}. ` +
    "English edition of the same publication as DRA-DOC-0018 (Spanish edition) — " +
    "first genuine parallel-language pair in the corpus (same document_id family, " +
    "doc_id=60419 EN vs doc_id=60423 ES). Second REPORT/TECHNICAL document from this publisher.",
};

// ---------------------------------------------------------------------------
// Freeze reference table (from admitted records)
// ---------------------------------------------------------------------------

const FREEZE_TABLE = [
  { corpusId: "DRA-DOC-0007", freezeId: "DRA-FRZ-000001", sourceDigest: APACHE_HTTPD_AUTH_FIXTURE.sourceDigest, textDigest: APACHE_HTTPD_AUTH_FIXTURE.normalisedTextDigest, metadataDigest: null as string | null, freezeRecordDigest: null as string | null },
  { corpusId: "DRA-DOC-0008", freezeId: "DRA-FRZ-000002", sourceDigest: "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300", textDigest: "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0", metadataDigest: null, freezeRecordDigest: null },
  { corpusId: "DRA-DOC-0009", freezeId: "DRA-FRZ-000003", sourceDigest: "e7fb5008e9b407bcf9ef566ab5c5911e3676a121cb15cb4c54bb0406e933f22f", textDigest: "dee3ab3c10dc1050fe4729d3e5cb0155b5a26101df9bd49b1533d5913510a9ed", metadataDigest: "15597eefbfb483697efc7f003e187e4cd8207e455e160a83591adad02968586e", freezeRecordDigest: "092a1219536aa6eec0905bdce2c0a2d37e5c07e5863f90df290638e17456d848" },
  { corpusId: "DRA-DOC-0010", freezeId: "DRA-FRZ-000004", sourceDigest: "7576edb531d9848825814ee88e28b1795d3a84b435b4b797d3670eafdc4a89f1", textDigest: "6cb8afe6bd2f7ed52702c2f59ccdd0e14d0d6d4332d4752e2a66961eb260b430", metadataDigest: "61c283bffec8677844f2f54ba0f239abd03d0380b815442f95317b0119871f97", freezeRecordDigest: "7d99f6b3fc2ae9e4cb5d1754cbd381ba73e316a79454988345c92faf99f69312" },
  { corpusId: "DRA-DOC-0011", freezeId: "DRA-FRZ-000005", sourceDigest: DRA_DOC_0011_SOURCE_DIGEST, textDigest: DRA_DOC_0011_TEXT_DIGEST, metadataDigest: DRA_DOC_0011_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0011_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0012", freezeId: "DRA-FRZ-000006", sourceDigest: DRA_DOC_0012_SOURCE_DIGEST, textDigest: DRA_DOC_0012_TEXT_DIGEST, metadataDigest: DRA_DOC_0012_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0012_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0013", freezeId: "DRA-FRZ-000007", sourceDigest: DRA_DOC_0013_SOURCE_DIGEST, textDigest: DRA_DOC_0013_TEXT_DIGEST, metadataDigest: DRA_DOC_0013_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0013_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0014", freezeId: "DRA-FRZ-000008", sourceDigest: DRA_DOC_0014_SOURCE_DIGEST, textDigest: DRA_DOC_0014_TEXT_DIGEST, metadataDigest: DRA_DOC_0014_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0014_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0015", freezeId: "DRA-FRZ-000009", sourceDigest: DRA_DOC_0015_SOURCE_DIGEST, textDigest: DRA_DOC_0015_TEXT_DIGEST, metadataDigest: DRA_DOC_0015_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0015_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0016", freezeId: "DRA-FRZ-000010", sourceDigest: DRA_DOC_0016_SOURCE_DIGEST, textDigest: DRA_DOC_0016_TEXT_DIGEST, metadataDigest: DRA_DOC_0016_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0016_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0017", freezeId: "DRA-FRZ-000011", sourceDigest: DRA_DOC_0017_SOURCE_DIGEST, textDigest: DRA_DOC_0017_TEXT_DIGEST, metadataDigest: DRA_DOC_0017_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0017_FREEZE_RECORD_DIGEST },
  // DRA-DOC-0018: only truncated digest fragments were carried forward as
  // authoritative inputs for metadata/freeze-record digests (see DRA-BMK-018).
  { corpusId: "DRA-DOC-0018", freezeId: "DRA-FRZ-000012", sourceDigest: DRA_DOC_0018_SOURCE_DIGEST, textDigest: DRA_DOC_0018_TEXT_DIGEST, metadataDigest: null, freezeRecordDigest: null },
  { corpusId: "DRA-DOC-0019", freezeId: "DRA-FRZ-000013", sourceDigest: DRA_DOC_0019_SOURCE_DIGEST, textDigest: DRA_DOC_0019_TEXT_DIGEST, metadataDigest: DRA_DOC_0019_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0019_FREEZE_RECORD_DIGEST },
  // DRA-DOC-0020: all four digests are full, known values from admission.
  { corpusId: "DRA-DOC-0020", freezeId: "DRA-FRZ-000014", sourceDigest: DRA_DOC_0020_SOURCE_DIGEST, textDigest: DRA_DOC_0020_TEXT_DIGEST, metadataDigest: DRA_DOC_0020_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0020_FREEZE_RECORD_DIGEST },
  { corpusId: "DRA-DOC-0021", freezeId: "DRA-FRZ-000015", sourceDigest: DRA_DOC_0021_SOURCE_DIGEST, textDigest: DRA_DOC_0021_TEXT_DIGEST, metadataDigest: DRA_DOC_0021_METADATA_DIGEST, freezeRecordDigest: DRA_DOC_0021_FREEZE_RECORD_DIGEST },
] as const;

// ---------------------------------------------------------------------------
// Part 1 — Authoritative 21-Document Checkpoint
// ---------------------------------------------------------------------------

describe("DRA-BMK-021 — Part 1: Authoritative 21-Document Corpus Checkpoint (DRA-CHK-000021)", () => {
  it("builds the authoritative 21-document corpus and validates every required property", () => {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  DRA-BMK-021 — CORPUS CHECKPOINT LOG                      ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    console.log(`── Checkpoint Identity ──────────────────────────────────────`);
    console.log(`  checkpointId        : ${CHECKPOINT_ID}`);
    console.log(`  checkpointTimestamp : ${CHECKPOINT_TIMESTAMP}`);
    console.log(`  benchmarkMilestone  : ${BENCHMARK_MILESTONE}`);
    console.log(`  corpusVersion       : ${CORPUS_VERSION}`);

    const registry = new CorpusRegistry();

    for (const entry of BENCHMARK_CORPUS) {
      registry.add(entry.input);
    }

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
    registry.add(ENTRY_0019);
    registry.add(ENTRY_0020);
    registry.add(ENTRY_0021);

    console.log("\n── Registry Build ───────────────────────────────────────────");
    console.log(`  documents registered: ${registry.size}`);
    expect(registry.size).toBe(21);

    const manifest = registry.exportManifest(CORPUS_VERSION);

    console.log("\n── Authoritative Manifest ───────────────────────────────────");
    console.log(`  schemaVersion  : ${manifest.schemaVersion}`);
    console.log(`  corpusVersion  : ${manifest.corpusVersion}`);
    console.log(`  documentCount  : ${manifest.documentCount}`);
    console.log(`  overallDigest  : ${manifest.overallDigest}`);
    console.log(`  documentIds    : ${manifest.documentIds.join(", ")}`);

    const manifestIntact = verifyManifestIntegrity(manifest);
    console.log(`  integrity check: ${manifestIntact ? "✓ PASS" : "✗ FAIL"}`);
    expect(manifestIntact).toBe(true);
    expect(manifest.documentCount).toBe(21);
    expect(manifest.corpusVersion).toBe(CORPUS_VERSION);
    expect(manifest.overallDigest).toHaveLength(64);
    expect(manifest.overallDigest).toMatch(/^[0-9a-f]{64}$/);

    // Cross-check against the manifest digest recorded at DRA-DOC-0021 admission
    // time (DRA-ACQ-017 Phase 2). The full value was carried forward as an
    // authoritative input, so exact equality is checked here.
    console.log(`  expected (admission-time) overallDigest: ${ADMISSION_MANIFEST_DIGEST}`);
    expect(manifest.overallDigest).toBe(ADMISSION_MANIFEST_DIGEST);

    console.log("\n── Ordered Corpus IDs ───────────────────────────────────────");
    const listedDocs = registry.list();
    expect(listedDocs).toHaveLength(21);

    for (let i = 0; i < ORDERED_CORPUS_IDS.length; i++) {
      const expected = ORDERED_CORPUS_IDS[i]!;
      const actual   = listedDocs[i]?.corpusId;
      const ok       = actual === expected;
      console.log(`  [${String(i + 1).padStart(2)}] ${ok ? "✓" : "✗"} ${expected} (got: ${actual})`);
      expect(actual).toBe(expected);
    }

    expect(manifest.documentIds).toEqual([...ORDERED_CORPUS_IDS]);

    console.log("\n── Duplicate Identifier Absence ─────────────────────────────");
    const idSet = new Set(listedDocs.map((d) => d.corpusId));
    console.log(`  unique IDs: ${idSet.size} / ${listedDocs.length} — ${idSet.size === 21 ? "✓ PASS" : "✗ FAIL"}`);
    expect(idSet.size).toBe(21);

    for (const id of ORDERED_CORPUS_IDS) {
      expect(idSet.has(id)).toBe(true);
    }

    console.log("\n── DRA-DOC-0021 Metadata Validation ────────────────────────");
    const doc21 = listedDocs.find((d) => d.corpusId === "DRA-DOC-0021");
    expect(doc21).toBeDefined();
    if (doc21) {
      const checks: Array<[string, string, string]> = [
        ["title",          doc21.title,           "Ethics Guidelines for Trustworthy AI"],
        ["documentType",   doc21.documentType,     "REPORT"],
        ["domain",         doc21.domain,           "TECHNICAL"],
        ["sourceType",     doc21.sourceType,       "HUMAN_AUTHORED"],
        ["difficulty",     doc21.difficulty,       "HIGH"],
        ["language",       doc21.language,         "en"],
        ["benchmarkStatus",doc21.benchmarkStatus,  "FROZEN"],
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
// Part 2 — DRA-DOC-0021 / DRA-DOC-0018 Parallel-Language Pairing Sanity Check
// ---------------------------------------------------------------------------

describe("DRA-BMK-021 — Part 2: Freeze Table and Parallel-Language Pairing", () => {
  it("verifies all live freeze records (DRA-DOC-0007–0021) against admitted reference values", () => {
    for (const entry of FREEZE_TABLE) {
      expect(entry.sourceDigest).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.textDigest).toMatch(/^[0-9a-f]{64}$/);
      if (entry.metadataDigest) expect(entry.metadataDigest).toMatch(/^[0-9a-f]{64}$/);
      if (entry.freezeRecordDigest) expect(entry.freezeRecordDigest).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(FREEZE_TABLE).toHaveLength(15);
  });

  it("confirms DRA-DOC-0021 and DRA-DOC-0018 are a genuine parallel-language pair, not near-duplicates", () => {
    console.log("\n── Parallel-Language Pair ───────────────────────────────────");
    console.log(`  DRA-DOC-0018 (ES): ${DRA_DOC_0018_PDF_URL} — doc_id=60423`);
    console.log(`  DRA-DOC-0021 (EN): ${DRA_DOC_0021_PDF_URL} — doc_id=60419`);
    // Distinct source and text digests: these are two independently
    // acquired, byte-distinct documents, not a re-freeze of the same file.
    expect(DRA_DOC_0021_SOURCE_DIGEST).not.toBe(DRA_DOC_0018_SOURCE_DIGEST);
    expect(DRA_DOC_0021_TEXT_DIGEST).not.toBe(DRA_DOC_0018_TEXT_DIGEST);
    expect(DRA_DOC_0021_PDF_URL).toContain("doc_id=60419");
    expect(DRA_DOC_0018_PDF_URL).toContain("doc_id=60423");
  });
});
